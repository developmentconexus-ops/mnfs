import { createHash, randomUUID } from 'node:crypto';
import { homedir } from 'node:os';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  access,
  appendFile,
  lstat,
  mkdir,
  readFile,
  realpath,
  rename,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises';
import { performance } from 'node:perf_hooks';

import { canonicalJson, sha256Text } from './canonical-json.mjs';
import { as02Error, assertAs02 } from './errors.mjs';
import {
  cleanupControlledSocket as cleanupRunControlledSocket,
  controlledSocketPath,
  openControlledSocket as openRunControlledSocket,
} from './controlled-socket.mjs';
import {
  cleanupFixture,
  createFixture,
  digestResources,
  discoverGitMetadata,
} from './fixture.mjs';
import {
  buildCheckpointInput as _unusedBuildCheckpointInput,
  buildLeasedResources,
  createPolicySet,
  createRunId,
  createSwitchingSessionController,
  resolveAs02ArtifactBase,
  resolveAs02FixtureBase,
  scenarioSignature,
} from './orchestrator.mjs';
import {
  brokeredCandidateArgs,
  PI_ANTHROPIC_AUTH_VERSION,
} from './pi-inventory.mjs';
import {
  createPiPilotChallenge,
  evaluatePiPilot,
  PI_PILOT_MODEL,
} from './pi-pilot.mjs';
import { runPerformanceSuite } from './performance.mjs';
import { buildWorkerEnv, compilePolicy } from './policy.mjs';
import { runPreflight } from './preflight.mjs';
import { redactOutput, writeScenarioEvidence } from './evidence.mjs';
import { deriveDecision, renderReport } from './report.mjs';
import {
  createRestartCheckpoint,
  verifyRestartCheckpoint,
} from './restart.mjs';
import { createRunStore } from './run-state.mjs';
import {
  MISSING_RESOURCE_DIGEST,
  runScenario,
  runSecuritySuite,
  scenarioDefinitions,
} from './scenario-runner.mjs';
import {
  createSandboxSession,
  loadSandboxRuntime,
} from './sandbox-session.mjs';
import { runProcess } from './process-runner.mjs';
import {
  acquireTreehouseLease,
  releaseTreehouseLease,
} from './treehouse.mjs';
import { formatRestartInstructions } from './cli.mjs';

const EXPECTED_SRT_VERSION = '0.0.67';
const REQUIRED_RESTART_SCENARIOS = Object.freeze(['S1', 'S3', 'S5', 'S9', 'S11', 'S13']);
const HASH_PATTERN = /^sha256:[a-f0-9]{64}$/u;
const RUN_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;
const MODULE_PATH = fileURLToPath(import.meta.url);
const SPIKE_ROOT = resolve(dirname(MODULE_PATH), '..');
const DEFAULT_REPOSITORY = resolve(SPIKE_ROOT, '..', '..');

function hashBuffer(buffer) {
  return `sha256:${createHash('sha256').update(buffer).digest('hex')}`;
}

function linuxPath(value, label) {
  if (
    typeof value !== 'string' ||
    !isAbsolute(value) ||
    value === '/mnt' ||
    value.startsWith('/mnt/') ||
    /[\r\n]/u.test(value)
  ) {
    throw as02Error('ORCHESTRATOR_PATH_INVALID', `${label} must be one absolute Linux path outside /mnt.`, { value });
  }
  return value;
}

function contained(root, candidate) {
  const relation = relative(root, candidate);
  return relation === '' || (!relation.startsWith('..') && !isAbsolute(relation));
}

function cleanObject(value) {
  return JSON.parse(JSON.stringify(value));
}

async function atomicWrite(path, bytes) {
  const temp = `${path}.tmp-${process.pid}-${randomUUID()}`;
  await writeFile(temp, bytes, { flag: 'wx', mode: 0o600 });
  await rename(temp, path);
}

async function atomicJson(path, value) {
  await atomicWrite(path, `${canonicalJson(value)}\n`);
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

export function buildDependencySnapshot(preflight) {
  const tools = preflight?.tools ?? {};
  const values = {
    node: tools.node?.version,
    npm: tools.npm?.version,
    pi: tools.pi?.version,
    piAnthropicAuth: PI_ANTHROPIC_AUTH_VERSION,
    treehouse: tools.treehouse?.version,
    sandboxRuntime: EXPECTED_SRT_VERSION,
    bwrap: tools.bwrap?.version,
    socat: tools.socat?.version,
  };
  for (const [key, value] of Object.entries(values)) {
    assertAs02(typeof value === 'string' && value.length > 0, 'ORCHESTRATOR_RUNTIME_INVALID', `Missing dependency version: ${key}.`);
  }
  return values;
}

export function createObservationReader({ resources, readFile: read = readFile }) {
  assertAs02(resources && typeof resources === 'object' && !Array.isArray(resources), 'ORCHESTRATOR_RUNTIME_INVALID', 'Observation resources are required.');
  return async function observe(definition) {
    const result = {};
    for (const logicalId of definition.observedResources ?? []) {
      const path = resources[logicalId];
      assertAs02(typeof path === 'string' && isAbsolute(path), 'ORCHESTRATOR_RUNTIME_INVALID', `Observation resource ${logicalId} is unavailable.`);
      try {
        result[logicalId] = hashBuffer(await read(path));
      } catch (cause) {
        if (cause?.code === 'ENOENT') result[logicalId] = MISSING_RESOURCE_DIGEST;
        else throw cause;
      }
    }
    return result;
  };
}

export function buildInitialRunState({ runId, now, repositoryPath, artifactRoot, fixtureRoot, preflight }) {
  return {
    schemaVersion: 1,
    runId,
    status: 'PHASE_ONE_RUNNING',
    createdAt: now,
    updatedAt: now,
    repositoryPath,
    artifactRoot,
    fixtureRoot,
    lease: null,
    preflight,
    policies: {},
    scenarios: [],
    performance: null,
    checkpointPath: null,
    restart: null,
    decision: null,
    reportPath: null,
    cleanup: { status: 'PENDING', attempts: 0 },
  };
}

export function buildCheckpointInput({
  runId,
  createdAt,
  checkpointPath,
  policyHash,
  dependencies,
  preflight,
  fixtureManifestHash,
  scenarios,
}) {
  const scenarioDigests = {};
  for (const scenarioId of REQUIRED_RESTART_SCENARIOS) {
    const evidence = scenarios.find((entry) => entry.scenarioId === scenarioId);
    assertAs02(evidence, 'ORCHESTRATOR_RUNTIME_INVALID', `Missing checkpoint scenario ${scenarioId}.`);
    scenarioDigests[scenarioId] = scenarioSignature(evidence);
  }
  return {
    runId,
    createdAt,
    checkpointPath,
    policyHash,
    dependencies,
    wsl: {
      distro: preflight.environment.distro,
      uname: preflight.environment.uname,
      architecture: preflight.environment.architecture,
    },
    fixtureManifestHash,
    scenarioDigests,
  };
}

export function mountSentinelPath(runId) {
  if (typeof runId !== 'string' || !RUN_ID_PATTERN.test(runId)) {
    throw as02Error('ORCHESTRATOR_PATH_INVALID', 'Mount sentinel run ID is invalid.', { runId });
  }
  return `/mnt/c/mnfs-as-02/${runId}/sentinel.txt`;
}

async function realExistingPaths(values) {
  const result = [];
  for (const value of values) {
    if (typeof value !== 'string' || !isAbsolute(value) || value === '/mnt' || value.startsWith('/mnt/')) continue;
    try {
      const exact = await realpath(value);
      if (!result.includes(exact)) result.push(exact);
    } catch {
      // Missing optional toolchain entries are excluded and surfaced by the command that requires them.
    }
  }
  return result;
}

async function toolchainPaths(repositoryPath, env) {
  const pathEntries = (env.PATH ?? '').split(':').filter(Boolean);
  const nodePrefix = resolve(dirname(process.execPath), '..');
  const typescriptRoot = join(repositoryPath, 'node_modules', 'typescript');
  const tscPath = join(typescriptRoot, 'bin', 'tsc');
  const trustedReadPaths = await realExistingPaths([
    SPIKE_ROOT,
    nodePrefix,
    typescriptRoot,
    ...pathEntries,
  ]);
  const executablePaths = await realExistingPaths(pathEntries);
  await access(tscPath);
  return {
    trustedReadPaths,
    executablePaths,
    tscPath: await realpath(tscPath),
    brokerPath: await realpath(join(SPIKE_ROOT, 'broker', 'index.mjs')),
    extensionPath: await realpath(join(SPIKE_ROOT, 'pi-extension', 'src', 'index.ts')),
  };
}

async function createMountSentinel(runId, marker) {
  const path = mountSentinelPath(runId);
  const directory = dirname(path);
  await mkdir(directory, { recursive: true });
  await writeFile(path, `${marker}:windows-mount\n`, { flag: 'wx', mode: 0o600 });
  return { path, directory };
}

async function writePolicyDocuments(policyRoot, policies, workerEnv) {
  const files = {};
  for (const [key, policy] of Object.entries(policies)) {
    const path = join(policyRoot, `${key}.json`);
    await atomicJson(path, {
      schemaVersion: 1,
      config: policy.config,
      hash: policy.hash,
      workerEnv,
    });
    files[key] = path;
  }
  return files;
}

function createFailedClosedSession() {
  return Object.freeze({
    async run() {
      throw as02Error('SANDBOX_UNAVAILABLE', 'Deliberate AS-02 unavailable-sandbox proof.');
    },
  });
}

function diagnostics(_definition, observation) {
  const stderr = observation.process?.stderr?.toString('utf8') ?? '';
  return {
    available: Boolean(observation.exceptionCode || observation.process?.signal || stderr.trim().length > 0 || observation.process?.exitCode !== 0),
    summary: (observation.exceptionCode ?? stderr).slice(0, 1_024),
  };
}

async function createController({ manager, policies, workerEnv, cwd, processRunner }) {
  return createSwitchingSessionController({
    policies,
    createSession: async (_key, policy) => createSandboxSession({
      manager,
      processRunner,
      policy,
      expectedPolicyHash: policy.hash,
      cwd,
      workerEnv,
    }),
  });
}

async function runPiPilot({
  artifactRoot,
  leasePath,
  policyPath,
  policyHash,
  workerEnv,
  operationRoot,
  brokerPath,
  extensionPath,
  hostEnv,
  processRunner,
  secretMarkers,
}) {
  const pilotRoot = join(artifactRoot, 'pi-pilot');
  await mkdir(pilotRoot, { recursive: true, mode: 0o700 });
  const receiptPath = join(pilotRoot, 'extension-receipt.json');
  const eventsPath = join(pilotRoot, 'extension-events.jsonl');
  const challenge = createPiPilotChallenge();
  const challengePath = join(leasePath, challenge.relativePath);
  await writeFile(challengePath, challenge.contents, { flag: 'wx', mode: 0o600 });
  const args = [
    '--print',
    '--no-session',
    '--model',
    PI_PILOT_MODEL,
    ...brokeredCandidateArgs(extensionPath),
    challenge.prompt,
  ];
  let result;
  try {
    result = await processRunner({
      file: 'pi',
      args,
      cwd: leasePath,
      env: {
        ...hostEnv,
        MNFS_AS02_POLICY_PATH: policyPath,
        MNFS_AS02_POLICY_HASH: policyHash,
        MNFS_AS02_WORKTREE: leasePath,
        MNFS_AS02_BROKER: brokerPath,
        MNFS_AS02_OPERATION_ROOT: operationRoot,
        MNFS_AS02_ARTIFACT_ROOT: artifactRoot,
        MNFS_AS02_EXTENSION_RECEIPT: receiptPath,
        MNFS_AS02_EXTENSION_EVENTS: eventsPath,
      },
      timeoutMs: 180_000,
      killProcessGroup: true,
    });
  } finally {
    await rm(challengePath, { force: true });
  }
  const stdout = redactOutput(result.stdout, secretMarkers, { maxBytes: 65_536 });
  const stderr = redactOutput(result.stderr, secretMarkers, { maxBytes: 65_536 });
  await atomicWrite(join(pilotRoot, 'stdout.bin'), stdout.bytes);
  await atomicWrite(join(pilotRoot, 'stderr.bin'), stderr.bytes);

  let receipt = null;
  let events = [];
  try {
    receipt = JSON.parse(await readFile(receiptPath, 'utf8'));
    events = (await readFile(eventsPath, 'utf8')).trim().split('\n').filter(Boolean).map(JSON.parse);
  } catch {
    // Missing trusted receipts make the pilot blocked rather than inferred from model text.
  }
  const evaluation = evaluatePiPilot({
    exitCode: result.exitCode,
    policyHash,
    receipt,
    events,
    stdout: stdout.bytes,
    expectedOutput: challenge.expectedOutput,
  });
  const evidence = {
    schemaVersion: 1,
    status: evaluation.status,
    exitCode: result.exitCode,
    signal: result.signal,
    policyHash,
    model: PI_PILOT_MODEL,
    challengeHash: challenge.challengeHash,
    outputMatched: evaluation.outputMatched,
    receiptPresent: receipt !== null,
    tools: receipt?.tools ?? [],
    successfulReadCalls: evaluation.successfulReadCalls,
    otherToolCalls: evaluation.otherToolCalls,
    stdoutHash: hashBuffer(stdout.bytes),
    stderrHash: hashBuffer(stderr.bytes),
    stdoutRedactions: stdout.redactions,
    stderrRedactions: stderr.redactions,
  };
  await atomicJson(join(pilotRoot, 'evidence.json'), evidence);
  return evidence;
}

async function measurePerformance({ controller, workerEnv, leasePath, tscPath, processRunner }) {
  const fixtureRead = join(leasePath, 'README.md');
  const toolchainCommand = [
    'set -eu',
    'git --no-optional-locks status --short',
    `node '${tscPath.replaceAll("'", `'"'"'`)}' --noEmit -p tsconfig.json`,
    'npm test --silent',
  ].join(' && ');
  const commands = {
    spawn: ['/bin/true'],
    node: [process.execPath, '-e', 'process.exit(0)'],
    filesystem: [process.execPath, '-e', "const fs=require('node:fs'); for(let i=0;i<100;i++) fs.readFileSync(process.argv[1]);", '--', fixtureRead],
    test: ['/bin/bash', '-c', toolchainCommand],
  };
  return runPerformanceSuite({
    measure: async ({ benchmark, mode }) => {
      const argv = commands[benchmark];
      const started = performance.now();
      const observed = mode === 'sandbox'
        ? await controller.session('networkOff').run(argv, { timeoutMs: 120_000 })
        : await processRunner({
          file: argv[0],
          args: argv.slice(1),
          cwd: leasePath,
          env: workerEnv,
          timeoutMs: 120_000,
          killProcessGroup: true,
        });
      if (observed.exitCode !== 0) {
        throw as02Error('PERFORMANCE_INVALID', `${benchmark}/${mode} exited non-zero.`, {
          exitCode: observed.exitCode,
          stderr: observed.stderr.toString('utf8').slice(0, 1_024),
        });
      }
      return performance.now() - started;
    },
  });
}

async function createS14Evidence({ artifactRoot, cwd, policyHash, performanceResult }) {
  const now = new Date().toISOString();
  return writeScenarioEvidence({
    artifactRoot,
    evidence: {
      scenarioId: 'S14',
      startedAt: now,
      finishedAt: now,
      command: ['mnfs-as02', 'performance'],
      cwd,
      expected: 'OBSERVE',
      exitCode: performanceResult.measured ? 0 : 1,
      signal: null,
      stdoutRef: 'commands/S14.stdout.bin',
      stderrRef: 'commands/S14.stderr.bin',
      observedFilesystem: {},
      policyHash,
      result: performanceResult.measured ? 'PASS' : 'INCONCLUSIVE',
      rationale: performanceResult.measured
        ? 'Baseline and sandbox performance distributions were measured without an invented pass threshold.'
        : 'One or more performance distributions could not be measured.',
      ...(performanceResult.measured ? {} : { failureCode: 'PERFORMANCE_INCOMPLETE' }),
    },
    stdout: Buffer.from(canonicalJson(performanceResult)),
    stderr: Buffer.alloc(0),
    secretMarkers: [],
  });
}

async function createS15Evidence({ artifactRoot, cwd, policyHash, restart, fixtureManifestHash }) {
  const now = new Date().toISOString();
  return writeScenarioEvidence({
    artifactRoot,
    evidence: {
      scenarioId: 'S15',
      startedAt: now,
      finishedAt: now,
      command: ['npm', 'run', 'as02', '--', 'restart-resume'],
      cwd,
      expected: 'OBSERVE',
      exitCode: restart.status === 'PASS' ? 0 : 1,
      signal: null,
      stdoutRef: 'commands/S15.stdout.bin',
      stderrRef: 'commands/S15.stderr.bin',
      observedFilesystem: {
        fixtureManifest: fixtureManifestHash,
        checkpoint: restart.checkpointHash,
      },
      policyHash,
      result: restart.status === 'PASS' ? 'PASS' : 'FAIL',
      rationale: restart.status === 'PASS'
        ? 'WSL restart preserved dependency, policy, fixture and representative scenario identity.'
        : 'WSL restart produced mechanically detected drift.',
      ...(restart.status === 'PASS' ? {} : { failureCode: 'RESTART_DRIFT' }),
    },
    stdout: Buffer.from(canonicalJson(restart)),
    stderr: Buffer.alloc(0),
    secretMarkers: [],
  });
}

async function fixtureManifestHash(fixtureSnapshot, resources) {
  const protectedDigests = await digestResources(fixtureSnapshot.protectedResources);
  const observe = createObservationReader({ resources });
  const leasedDigests = await observe({ observedResources: Object.keys(resources).sort() });
  return sha256Text(canonicalJson({ protectedDigests, leasedDigests }));
}

async function syntheticMarkerFromFixture(fixture) {
  const content = await readFile(fixture.protectedResources.ssh, 'utf8');
  const index = content.indexOf(':');
  assertAs02(index > 0, 'ORCHESTRATOR_RUNTIME_INVALID', 'Synthetic marker fixture is malformed.');
  return content.slice(0, index);
}

function sanitizeFixture(fixture) {
  const { marker: _marker, ...rest } = fixture;
  return cleanObject(rest);
}

async function packageVersion() {
  try {
    const document = JSON.parse(await readFile(join(SPIKE_ROOT, 'node_modules', '@anthropic-ai', 'sandbox-runtime', 'package.json'), 'utf8'));
    return document.version;
  } catch {
    return null;
  }
}

export function createRuntimeOperations(options = {}) {
  const repositoryPathInput = options.repositoryPath ?? DEFAULT_REPOSITORY;
  const homeDirectory = options.homeDirectory ?? homedir();
  const env = options.env ?? process.env;
  const now = options.now ?? (() => new Date().toISOString());
  const random = options.random ?? (() => randomUUID().replaceAll('-', '').slice(0, 6));
  const processRunner = options.processRunner ?? runProcess;
  const loadRuntime = options.loadRuntime ?? loadSandboxRuntime;
  const fixtureFactory = options.createFixture ?? createFixture;
  const fixtureCleanup = options.cleanupFixture ?? cleanupFixture;
  const leaseAcquire = options.acquireTreehouseLease ?? acquireTreehouseLease;
  const leaseRelease = options.releaseTreehouseLease ?? releaseTreehouseLease;
  const gitDiscovery = options.discoverGitMetadata ?? discoverGitMetadata;
  const securitySuite = options.runSecuritySuite ?? runSecuritySuite;
  const performanceSuite = options.measurePerformance ?? measurePerformance;
  const controlledSocketOpen = options.openControlledSocket ?? openRunControlledSocket;
  const controlledSocketCleanup = options.cleanupControlledSocket ?? cleanupRunControlledSocket;
  const removeRunScopedPath = options.removeRunScopedPath ?? rm;

  let repositoryPath;
  let artifactBase;
  let fixtureBase;
  let storePromise;

  async function paths() {
    if (!repositoryPath) {
      repositoryPath = linuxPath(await realpath(repositoryPathInput), 'Repository path');
      artifactBase = resolveAs02ArtifactBase(env, homeDirectory);
      fixtureBase = resolveAs02FixtureBase(env, homeDirectory);
    }
    return { repositoryPath, artifactBase, fixtureBase };
  }

  async function store() {
    if (!storePromise) storePromise = paths().then(({ artifactBase: base }) => createRunStore(base));
    return storePromise;
  }

  async function preflight() {
    const { repositoryPath: repo } = await paths();
    let manager = null;
    let loadError = null;
    try {
      manager = await loadRuntime();
    } catch (cause) {
      loadError = cause;
    }
    const report = await runPreflight({
      repositoryPath: repo,
      runner: processRunner,
      env,
      readText: (path) => readFile(path, 'utf8'),
      realpath,
      lstat,
      checkSandboxDependencies: async () => {
        if (!manager) return { errors: [loadError instanceof Error ? loadError.message : String(loadError)], warnings: [] };
        return manager.checkDependenciesAsync();
      },
    });
    const observedVersion = await packageVersion();
    report.sandboxRuntime.packageVersion = observedVersion;
    report.sandboxRuntime.expectedVersion = EXPECTED_SRT_VERSION;
    if (observedVersion !== EXPECTED_SRT_VERSION) {
      report.defects.push({
        code: 'SANDBOX_RUNTIME_VERSION_MISMATCH',
        message: `Expected @anthropic-ai/sandbox-runtime ${EXPECTED_SRT_VERSION}, observed ${observedVersion ?? 'NOT_INSTALLED'}.`,
      });
      report.status = 'PREFLIGHT_FAILED';
    }
    return report;
  }

  async function phaseOne({ preflight: readyPreflight }) {
    assertAs02(readyPreflight?.status === 'READY', 'PREFLIGHT_INVALID', 'Phase one requires READY preflight.');
    const { repositoryPath: repo, artifactBase: base, fixtureBase: durableFixtureBase } = await paths();
    await mkdir(durableFixtureBase, { recursive: true, mode: 0o700 });
    const runId = createRunId({ now: new Date(now()), random });
    const artifactRoot = join(base, runId);
    await mkdir(artifactRoot, { recursive: true, mode: 0o700 });
    const fixtureRoot = join(durableFixtureBase, runId);
    const runStore = await store();
    await runStore.save(buildInitialRunState({
      runId,
      now: now(),
      repositoryPath: repo,
      artifactRoot,
      fixtureRoot,
      preflight: readyPreflight,
    }));

    let controller = null;
    let socket = null;
    try {
      const fixture = await fixtureFactory({ baseRoot: durableFixtureBase, runId, runner: processRunner });
      const lease = await leaseAcquire({ repositoryPath: fixture.sourceRepo, runId, runner: processRunner });
      const gitMetadata = await gitDiscovery(lease.path, processRunner);
      const toolchain = await toolchainPaths(repo, env);
      const operationRoot = join(fixture.attemptTemp, 'operations');
      await mkdir(operationRoot, { recursive: true, mode: 0o700 });
      const mount = await createMountSentinel(runId, fixture.marker);
      socket = await controlledSocketOpen(runId);
      const controlledSocket = socket?.path;
      assertAs02(
        controlledSocket === controlledSocketPath(runId),
        'ORCHESTRATOR_RUNTIME_INVALID',
        'Controlled socket factory returned an unexpected run-scoped path.',
        { expected: controlledSocketPath(runId), actual: controlledSocket },
      );
      const workerEnv = buildWorkerEnv(env, {
        fakeHome: fixture.fakeHome,
        attemptTemp: fixture.attemptTemp,
        executablePaths: toolchain.executablePaths,
      });
      const commonPolicy = {
        worktreePath: lease.path,
        attemptTempPath: fixture.attemptTemp,
        brokerPath: toolchain.brokerPath,
        policyRoot: fixture.policyRoot,
        runtimeRoot: artifactRoot,
        realHome: homeDirectory,
        fakeHome: fixture.fakeHome,
        mountRoot: '/mnt',
        gitReadPaths: Object.values(gitMetadata),
        gitDenyWritePaths: Object.values(gitMetadata),
        trustedReadPaths: toolchain.trustedReadPaths,
      };
      const policies = createPolicySet({ compilePolicy, common: commonPolicy });
      const policyFiles = await writePolicyDocuments(fixture.policyRoot, policies, workerEnv);
      const resources = buildLeasedResources({
        leasedPath: lease.path,
        gitMetadata,
        baseResources: {
          ssh: fixture.protectedResources.ssh,
          aws: fixture.protectedResources.aws,
          gcloud: fixture.protectedResources.gcloud,
          kube: fixture.protectedResources.kube,
          env: fixture.protectedResources.env,
          outsideWrite: fixture.protectedResources.outsideWrite,
        },
        activePolicy: policyFiles.networkOff,
      });
      Object.assign(resources, {
        mountSentinel: mount.path,
        allowedWrite: join(lease.path, 'as02-allowed-write.txt'),
        failClosedSentinel: join(lease.path, 'as02-fail-closed-sentinel.txt'),
      });
      const runtimeFixture = {
        root: fixture.root,
        worktreePath: lease.path,
        attemptTemp: fixture.attemptTemp,
        fakeHome: fixture.fakeHome,
        policyRoot: fixture.policyRoot,
        runtimeArtifacts: artifactRoot,
        mountSentinel: mount.path,
        controlledSocket,
        protectedResources: resources,
      };

      const manager = await loadRuntime();
      controller = await createController({
        manager,
        policies,
        workerEnv,
        cwd: lease.path,
        processRunner,
      });
      const observe = createObservationReader({ resources });
      const context = {
        fixture: runtimeFixture,
        dockerSocketPresent: readyPreflight.primitives?.dockerSocket === 'PRESENT_NOT_OPENED',
        policyHashes: Object.fromEntries(Object.entries(policies).map(([key, policy]) => [key, policy.hash])),
        secretMarkers: [fixture.marker],
        toolchain: { tscPath: toolchain.tscPath },
        sessions: {
          networkOff: controller.session('networkOff'),
          narrowNetwork: controller.session('narrowNetwork'),
          githubBroad: controller.session('githubBroad'),
        },
        failedSession: createFailedClosedSession(),
        observe,
        diagnose: diagnostics,
      };
      const scenarios = await securitySuite(context);
      const performanceResult = await performanceSuite({
        controller,
        workerEnv,
        leasePath: lease.path,
        tscPath: toolchain.tscPath,
        processRunner,
      });
      const s14 = await createS14Evidence({
        artifactRoot,
        cwd: lease.path,
        policyHash: policies.networkOff.hash,
        performanceResult,
      });
      scenarios.push(s14);

      const piPilot = await runPiPilot({
        artifactRoot,
        leasePath: lease.path,
        policyPath: policyFiles.networkOff,
        policyHash: policies.networkOff.hash,
        workerEnv,
        operationRoot,
        brokerPath: toolchain.brokerPath,
        extensionPath: toolchain.extensionPath,
        hostEnv: env,
        processRunner,
        secretMarkers: [fixture.marker],
      });
      const manifestHash = await fixtureManifestHash(fixture, resources);
      const checkpointPath = join(artifactRoot, 'restart-checkpoint.json');
      const checkpointInput = buildCheckpointInput({
        runId,
        createdAt: now(),
        checkpointPath,
        policyHash: policies.networkOff.hash,
        dependencies: buildDependencySnapshot(readyPreflight),
        preflight: readyPreflight,
        fixtureManifestHash: manifestHash,
        scenarios,
      });
      const checkpoint = await createRestartCheckpoint(checkpointInput);
      await atomicJson(checkpointPath, checkpoint);

      const leaseState = {
        ...lease,
        gitMetadata,
        fixture: sanitizeFixture(fixture),
        resources,
        workerEnv,
        operationRoot,
        mountDirectory: mount.directory,
        controlledSocket,
        toolchain,
        policyFiles,
        piPilot,
        fixtureManifestHash: manifestHash,
      };
      const finalState = await runStore.update(runId, (current) => ({
        ...current,
        status: 'AWAITING_RESTART',
        updatedAt: now(),
        lease: leaseState,
        policies: cleanObject(policies),
        scenarios: cleanObject(scenarios),
        performance: cleanObject(performanceResult),
        checkpointPath,
      }));
      return {
        runId,
        status: finalState.status,
        artifactRoot,
        checkpointPath,
        piPilot: piPilot.status,
        nextAction: 'Run npm run as02 -- restart-prepare, then follow the printed Windows/Ubuntu commands.',
      };
    } catch (error) {
      await runStore.update(runId, (current) => ({
        ...current,
        status: 'FAILED',
        updatedAt: now(),
        restart: {
          status: 'PHASE_ONE_FAILED',
          error: {
            code: typeof error?.code === 'string' ? error.code : 'AS02_PHASE_ONE_FAILED',
            message: error instanceof Error ? error.message : String(error),
          },
        },
      })).catch(() => {});
      throw error;
    } finally {
      if (controller) await controller.close().catch(() => {});
      if (socket) await socket.close().catch(() => {});
    }
  }

  async function latest() {
    return (await store()).latest();
  }

  async function restartPrepare(state) {
    assertAs02(state.status === 'AWAITING_RESTART', 'RESTART_CHECKPOINT_INVALID', 'Latest AS-02 run is not awaiting restart.', { status: state.status });
    return {
      runId: state.runId,
      checkpointPath: state.checkpointPath,
      instructions: formatRestartInstructions({
        distro: state.preflight.environment.distro,
        repositoryPath: state.repositoryPath,
        checkpointPath: state.checkpointPath,
      }),
    };
  }

  async function rebuildContext(state, artifactRoot) {
    const lease = state.lease;
    assertAs02(lease && typeof lease === 'object', 'ORCHESTRATOR_RUNTIME_INVALID', 'Stored lease context is missing.');
    const marker = await syntheticMarkerFromFixture(lease.fixture);
    const controlledSocket = controlledSocketPath(state.runId);
    const expectedMountSentinel = mountSentinelPath(state.runId);
    assertAs02(
      lease.controlledSocket === controlledSocket,
      'ORCHESTRATOR_RUNTIME_INVALID',
      'Stored controlled socket path does not match the run identity.',
      { expected: controlledSocket, actual: lease.controlledSocket },
    );
    assertAs02(
      lease.resources?.mountSentinel === expectedMountSentinel,
      'ORCHESTRATOR_RUNTIME_INVALID',
      'Stored mount sentinel path does not match the run identity.',
      { expected: expectedMountSentinel, actual: lease.resources?.mountSentinel },
    );
    const socket = await controlledSocketOpen(state.runId);
    assertAs02(
      socket?.path === controlledSocket,
      'ORCHESTRATOR_RUNTIME_INVALID',
      'Controlled socket resume factory returned an unexpected path.',
      { expected: controlledSocket, actual: socket?.path },
    );
    const manager = await loadRuntime();
    const controller = await createController({
      manager,
      policies: state.policies,
      workerEnv: lease.workerEnv,
      cwd: lease.path,
      processRunner,
    });
    const resources = lease.resources;
    const observe = createObservationReader({ resources });
    return {
      socket,
      controller,
      marker,
      context: {
        fixture: {
          root: lease.fixture.root,
          worktreePath: lease.path,
          attemptTemp: lease.fixture.attemptTemp,
          fakeHome: lease.fixture.fakeHome,
          policyRoot: lease.fixture.policyRoot,
          runtimeArtifacts: artifactRoot,
          mountSentinel: resources.mountSentinel,
          controlledSocket,
          protectedResources: resources,
        },
        dockerSocketPresent: state.preflight.primitives?.dockerSocket === 'PRESENT_NOT_OPENED',
        policyHashes: Object.fromEntries(Object.entries(state.policies).map(([key, policy]) => [key, policy.hash])),
        secretMarkers: [marker],
        toolchain: { tscPath: lease.toolchain.tscPath },
        sessions: {
          networkOff: controller.session('networkOff'),
          narrowNetwork: controller.session('narrowNetwork'),
          githubBroad: controller.session('githubBroad'),
        },
        failedSession: createFailedClosedSession(),
        observe,
        diagnose: diagnostics,
      },
    };
  }

  async function restartResume({ checkpoint: checkpointPath }) {
    const checkpoint = JSON.parse(await readFile(checkpointPath, 'utf8'));
    const runStore = await store();
    const state = await runStore.load(checkpoint.runId);
    assertAs02(state.checkpointPath === checkpointPath, 'RESTART_CHECKPOINT_INVALID', 'Checkpoint path does not match durable run state.');
    if (state.status !== 'AWAITING_RESTART') {
      throw as02Error('RESTART_CHECKPOINT_INVALID', 'AS-02 run is not awaiting restart.', { status: state.status });
    }
    const currentPreflight = await preflight();
    if (currentPreflight.status !== 'READY') {
      return { status: currentPreflight.status, runId: state.runId, preflight: currentPreflight };
    }
    await runStore.update(state.runId, (current) => ({
      ...current,
      status: 'RESTART_RUNNING',
      updatedAt: now(),
      restart: { status: 'RUNNING', startedAt: now() },
    }));

    const restartRoot = join(state.artifactRoot, 'restart');
    await mkdir(restartRoot, { recursive: true, mode: 0o700 });
    await rm(state.lease.resources.allowedWrite, { force: true });
    await rm(state.lease.resources.failClosedSentinel, { force: true });
    let rebuilt;
    try {
      rebuilt = await rebuildContext(state, restartRoot);
      const definitions = scenarioDefinitions(rebuilt.context).filter((definition) => REQUIRED_RESTART_SCENARIOS.includes(definition.scenarioId));
      const rerun = [];
      for (const definition of definitions) rerun.push(await runScenario(definition, rebuilt.context));
      const currentManifestHash = await fixtureManifestHash(state.lease.fixture, state.lease.resources);
      const currentInput = buildCheckpointInput({
        runId: state.runId,
        createdAt: checkpoint.createdAt,
        checkpointPath,
        policyHash: state.policies.networkOff.hash,
        dependencies: buildDependencySnapshot(currentPreflight),
        preflight: currentPreflight,
        fixtureManifestHash: currentManifestHash,
        scenarios: rerun,
      });
      const restart = await verifyRestartCheckpoint(checkpoint, currentInput);
      const s15 = await createS15Evidence({
        artifactRoot: state.artifactRoot,
        cwd: state.lease.path,
        policyHash: state.policies.networkOff.hash,
        restart,
        fixtureManifestHash: currentManifestHash,
      });
      const allScenarios = [...state.scenarios, s15];
      const decision = deriveDecision({
        scenarios: allScenarios,
        preflight: {
          status: state.lease.piPilot?.status === 'PASS' ? 'READY' : 'PI_PILOT_BLOCKED',
        },
        restart,
        performance: state.performance,
        limitations: [],
      });
      const reportPath = join(state.artifactRoot, 'report.md');
      const reportText = renderReport({
        title: 'AS-02 Local Pi Sandbox on WSL2 Acceptance',
        environment: {
          ...currentPreflight.environment,
          dependencies: buildDependencySnapshot(currentPreflight),
          piPilot: state.lease.piPilot,
        },
        policyHash: state.policies.networkOff.hash,
        scenarios: allScenarios,
        decision,
      });
      await atomicWrite(reportPath, reportText);
      await runStore.update(state.runId, (current) => ({
        ...current,
        status: 'COMPLETE',
        updatedAt: now(),
        preflight: currentPreflight,
        scenarios: cleanObject(allScenarios),
        restart: cleanObject(restart),
        decision: cleanObject(decision),
        reportPath,
      }));
      return {
        runId: state.runId,
        status: 'COMPLETE',
        verdict: decision.verdict,
        reportPath,
        restart,
        nextAction: 'Review the report, then run npm run as02 -- cleanup --run <run-id>.',
      };
    } catch (error) {
      await runStore.update(state.runId, (current) => ({
        ...current,
        status: 'FAILED',
        updatedAt: now(),
        restart: {
          status: 'FAILED',
          error: {
            code: typeof error?.code === 'string' ? error.code : 'AS02_RESTART_FAILED',
            message: error instanceof Error ? error.message : String(error),
          },
        },
      })).catch(() => {});
      throw error;
    } finally {
      if (rebuilt?.controller) await rebuilt.controller.close().catch(() => {});
      if (rebuilt?.socket) await rebuilt.socket.close().catch(() => {});
    }
  }

  async function report({ runId }) {
    const state = await (await store()).load(runId);
    return {
      runId,
      status: state.status,
      verdict: state.decision?.verdict ?? null,
      reportPath: state.reportPath,
      report: state.reportPath ? await readFile(state.reportPath, 'utf8') : null,
    };
  }

  async function cleanup({ runId }) {
    const runStore = await store();
    let state = await runStore.load(runId);
    if (state.status === 'CLEANED') return { runId, status: 'CLEANED', cleanup: state.cleanup };
    state = await runStore.beginCleanup(runId, now());
    try {
      let leaseResult = state.cleanup.lease ?? null;
      if (!leaseResult && state.lease) {
        leaseResult = await leaseRelease({ lease: state.lease, runner: processRunner });
        state = await runStore.update(runId, (current) => ({
          ...current,
          updatedAt: now(),
          cleanup: { ...current.cleanup, lease: cleanObject(leaseResult) },
        }));
      }
      let fixtureResult = state.cleanup.fixture ?? null;
      if (!fixtureResult && state.lease?.fixture) {
        if (await exists(state.lease.fixture.root)) fixtureResult = await fixtureCleanup(state.lease.fixture);
        else fixtureResult = { removed: true, integrity: 'ALREADY_REMOVED' };
        state = await runStore.update(runId, (current) => ({
          ...current,
          updatedAt: now(),
          cleanup: { ...current.cleanup, fixture: cleanObject(fixtureResult) },
        }));
      }
      let socketResult = state.cleanup.socket ?? null;
      if (!socketResult) {
        socketResult = await controlledSocketCleanup(runId);
        state = await runStore.update(runId, (current) => ({
          ...current,
          updatedAt: now(),
          cleanup: { ...current.cleanup, socket: cleanObject(socketResult) },
        }));
      }
      const mountDirectory = dirname(mountSentinelPath(runId));
      await removeRunScopedPath(mountDirectory, { recursive: true, force: true });
      state = await runStore.update(runId, (current) => ({
        ...current,
        status: 'CLEANED',
        updatedAt: now(),
        cleanup: {
          ...current.cleanup,
          status: 'COMPLETE',
          finishedAt: now(),
          mount: 'REMOVED',
        },
      }));
      return { runId, status: state.status, cleanup: state.cleanup };
    } catch (error) {
      await runStore.update(runId, (current) => ({
        ...current,
        updatedAt: now(),
        cleanup: {
          ...current.cleanup,
          status: 'FAILED',
          finishedAt: now(),
          error: {
            code: typeof error?.code === 'string' ? error.code : 'AS02_CLEANUP_FAILED',
            message: error instanceof Error ? error.message : String(error),
          },
        },
      })).catch(() => {});
      throw error;
    }
  }

  return Object.freeze({ preflight, phaseOne, latest, restartPrepare, restartResume, report, cleanup });
}
