import { randomBytes as cryptoRandomBytes, randomUUID } from 'node:crypto';
import { constants, existsSync } from 'node:fs';
import {
  access,
  chmod,
  copyFile,
  lstat,
  mkdir,
  readFile,
  realpath,
  rename,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { homedir } from 'node:os';
import {
  basename,
  delimiter,
  dirname,
  join,
  resolve,
  sep,
} from 'node:path';
import { fileURLToPath } from 'node:url';

import { canonicalJson, sha256Bytes } from './canonical-json.mjs';
import { assertTc01, tc01Error } from './errors.mjs';
import { createEvidenceStore as createEvidenceStoreDefault } from './evidence.mjs';
import { createFixture as createFixtureDefault, loadFixture } from './fixture.mjs';
import {
  assertNoFetchInvocation,
  compareRepositorySnapshots,
  readGitInvocationLog,
  snapshotPathTree,
  snapshotRepository,
} from './git-observer.mjs';
import {
  assertLinuxOwnedAbsolutePath,
  resolveTc01StateRoot,
  validateRunId,
} from './paths.mjs';
import { runProcess } from './process-runner.mjs';
import { discoverTc01Environment } from './provenance.mjs';
import { deriveTc01Verdict, renderTc01Report } from './report.mjs';
import { runTc01Scenarios } from './scenario-runner.mjs';
import {
  acquireTreehouseLease,
  findStatusByPath,
  observeTreehouseStatus,
  returnTreehouseLease,
} from './treehouse-client.mjs';

const OUTPUT_LIMIT_BYTES = 65_536;
const INTERNAL_TIMEOUT_MS = 1;
const HASH_PATTERN = /^sha256:[a-f0-9]{64}$/u;
const WRAPPER_SOURCE = fileURLToPath(new URL('../bin/git', import.meta.url));
const COMMAND_SHAPES = Object.freeze({
  acquire: ['get', '--lease', '--lease-holder', '<holder>', '--json'],
  status: ['status', '--json'],
  release: ['return', '<path>', '--if-lease-id', '<lease-id>', '--if-lease-holder', '<holder>'],
  process: {
    shell: false,
    stdin: 'closed',
    stdoutLimitBytes: OUTPUT_LIMIT_BYTES,
    stderrLimitBytes: OUTPUT_LIMIT_BYTES,
  },
});

export const TC01_COMMAND_SHAPE_HASH = sha256Bytes(canonicalJson(COMMAND_SHAPES));

function isPlainObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function compareCodeUnits(left, right) {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function timestamp(value = new Date()) {
  assertTc01(value instanceof Date && Number.isFinite(value.getTime()), 'TC01_INVALID_INPUT', 'TC-01 clock returned an invalid Date.');
  return value;
}

export function generateTc01RunId({
  now = new Date(),
  randomBytes = cryptoRandomBytes,
} = {}) {
  const instant = timestamp(typeof now === 'function' ? now() : now);
  assertTc01(typeof randomBytes === 'function', 'TC01_INVALID_INPUT', 'TC-01 random byte source is required.');
  const suffix = Buffer.from(randomBytes(4));
  assertTc01(suffix.length === 4, 'TC01_INVALID_INPUT', 'TC-01 run ID requires exactly four random bytes.', {
    byteLength: suffix.length,
  });
  const iso = instant.toISOString();
  const date = iso.slice(0, 10).replaceAll('-', '');
  const time = iso.slice(11, 19).replaceAll(':', '');
  return validateRunId(`tc01-${date}-${time}-${suffix.toString('hex')}`);
}

function assertContained(root, value, label) {
  const safeRoot = assertLinuxOwnedAbsolutePath(root, `${label} root`);
  const safeValue = assertLinuxOwnedAbsolutePath(value, label);
  assertTc01(
    safeValue === safeRoot || safeValue.startsWith(`${safeRoot}${sep}`),
    'TC01_INVALID_INPUT',
    `${label} escaped its trusted run root.`,
    { root: safeRoot, value: safeValue },
  );
  return safeValue;
}

async function writeAtomic(path, bytes) {
  const safePath = assertLinuxOwnedAbsolutePath(path, 'TC-01 output path');
  await mkdir(dirname(safePath), { recursive: true });
  const temporary = join(dirname(safePath), `.${basename(safePath)}.${process.pid}.${randomUUID()}.tmp`);
  try {
    await writeFile(temporary, bytes, { flag: 'wx' });
    await rename(temporary, safePath);
  } catch (error) {
    await rm(temporary, { force: true }).catch(() => {});
    throw error;
  }
}

async function writeJsonAtomic(path, value) {
  await writeAtomic(path, Buffer.from(`${canonicalJson(value)}\n`, 'utf8'));
}

async function writeTextAtomic(path, value) {
  assertTc01(typeof value === 'string', 'TC01_INVALID_INPUT', 'TC-01 text output must be a string.');
  await writeAtomic(path, Buffer.from(value, 'utf8'));
}

async function readRegularFile(path, label) {
  const safePath = assertLinuxOwnedAbsolutePath(path, label);
  let stat;
  try {
    stat = await lstat(safePath);
  } catch (error) {
    throw tc01Error('TC01_EVIDENCE_INVALID', `${label} is missing.`, {
      path: safePath,
      cause: error instanceof Error ? error.message : String(error),
    });
  }
  assertTc01(stat.isFile() && !stat.isSymbolicLink(), 'TC01_EVIDENCE_INVALID', `${label} must be a regular file.`, {
    path: safePath,
  });
  return readFile(safePath);
}

function parseJsonBytes(bytes, label) {
  try {
    return JSON.parse(Buffer.from(bytes).toString('utf8'));
  } catch (error) {
    throw tc01Error('TC01_EVIDENCE_INVALID', `${label} is not valid JSON.`, {
      cause: error instanceof Error ? error.message : String(error),
    });
  }
}

async function resolveExecutable(name, env = process.env) {
  const pathValue = env?.PATH;
  assertTc01(typeof pathValue === 'string' && pathValue.length > 0, 'TC01_TOOL_MISSING', `Cannot resolve ${name} because PATH is empty.`);
  for (const directory of pathValue.split(delimiter)) {
    if (!directory) continue;
    const candidate = join(directory, name);
    try {
      await access(candidate, constants.X_OK);
      return assertLinuxOwnedAbsolutePath(await realpath(candidate), `${name} executable`);
    } catch {
      // Continue through the explicit PATH without invoking a shell.
    }
  }
  throw tc01Error('TC01_TOOL_MISSING', `Required executable ${name} was not found.`, { name });
}

function observerEnvironment(fixture, realGit) {
  return {
    PATH: `${dirname(realGit)}:/usr/bin:/bin`,
    HOME: fixture.fakeHome,
    LANG: 'C.UTF-8',
    LC_ALL: 'C.UTF-8',
    GIT_CONFIG_NOSYSTEM: '1',
    GIT_TERMINAL_PROMPT: '0',
    GIT_OPTIONAL_LOCKS: '0',
  };
}

function provenanceEnvironment(fixture) {
  return {
    PATH: process.env.PATH ?? '/usr/local/bin:/usr/bin:/bin',
    HOME: fixture.fakeHome,
    LANG: 'C.UTF-8',
    LC_ALL: 'C.UTF-8',
  };
}

function expectedEnvironmentKeySets() {
  return [
    [
      'GIT_TERMINAL_PROMPT',
      'HOME',
      'LANG',
      'LC_ALL',
      'NO_COLOR',
      'PATH',
      'TERM',
      'TREEHOUSE_NO_UPDATE_CHECK',
    ],
    [
      'GIT_CONFIG_NOSYSTEM',
      'GIT_OPTIONAL_LOCKS',
      'GIT_TERMINAL_PROMPT',
      'HOME',
      'LANG',
      'LC_ALL',
      'PATH',
    ],
    [
      'GIT_CONFIG_NOSYSTEM',
      'GIT_OPTIONAL_LOCKS',
      'GIT_TERMINAL_PROMPT',
      'HOME',
      'LANG',
      'LC_ALL',
      'PATH',
      'TC01_GIT_LOG',
      'TC01_REAL_GIT',
      'TREEHOUSE_NO_UPDATE_CHECK',
    ],
  ].map((keys) => [...keys].sort(compareCodeUnits));
}

async function defaultCreateFixture({ stateRoot, runId }) {
  const realGit = await resolveExecutable('git');
  return createFixtureDefault({
    stateRoot,
    runId,
    gitFile: realGit,
    pathEnv: `${dirname(realGit)}:${dirname(process.execPath)}:/usr/bin:/bin`,
  });
}

async function installTrustedWrapper(fixture) {
  const destination = join(fixture.gitWrapperRoot, 'git');
  await copyFile(WRAPPER_SOURCE, destination);
  await chmod(destination, 0o755);
  const nodeLink = join(fixture.gitWrapperRoot, 'node');
  if (!existsSync(nodeLink)) await symlink(process.execPath, nodeLink);
  return destination;
}

async function initializeUnmanagedRepository(fixture, realGit) {
  const unmanagedPath = join(fixture.runRoot, 'unmanaged-repo');
  await mkdir(unmanagedPath, { recursive: false });
  const result = await runProcess({
    file: realGit,
    args: ['init', '--initial-branch=main'],
    cwd: unmanagedPath,
    env: observerEnvironment(fixture, realGit),
    timeoutMs: 5_000,
    stdoutLimitBytes: OUTPUT_LIMIT_BYTES,
    stderrLimitBytes: OUTPUT_LIMIT_BYTES,
  });
  assertTc01(result.exitCode === 0, 'TC01_FIXTURE_INVALID', 'Unable to initialize the unmanaged TC-01 repository.', {
    exitCode: result.exitCode,
  });
  return unmanagedPath;
}

function comparePathSnapshots(before, after) {
  assertTc01(isPlainObject(before) && isPlainObject(after), 'TC01_EVIDENCE_INVALID', 'Path snapshots must be objects.');
  const equal = before.digest === after.digest && before.root === after.root;
  return {
    equal,
    changedFields: equal ? [] : ['digest'],
    changes: equal ? {} : { digest: { before: before.digest, after: after.digest } },
  };
}

async function createDefaultRuntime({ fixture, evidenceStore }) {
  assertTc01(isPlainObject(fixture), 'TC01_INVALID_INPUT', 'TC-01 runtime fixture is required.');
  assertTc01(isPlainObject(evidenceStore), 'TC01_INVALID_INPUT', 'TC-01 runtime Evidence store is required.');
  await installTrustedWrapper(fixture);
  const realGit = await resolveExecutable('git');
  await initializeUnmanagedRepository(fixture, realGit);

  const gitLog = join(fixture.artifactsRoot, 'git-invocations.jsonl');
  const runtimeFixture = { ...fixture, gitLog };
  const pendingCommands = [];
  const commandMetadata = [];
  const executableHashes = new Map();
  let activeProvenance = null;

  async function recordedRun(rawSpec) {
    const spec = {
      ...rawSpec,
      stdoutLimitBytes: rawSpec.stdoutLimitBytes ?? OUTPUT_LIMIT_BYTES,
      stderrLimitBytes: rawSpec.stderrLimitBytes ?? OUTPUT_LIMIT_BYTES,
    };
    const startedAt = new Date().toISOString();
    const startedMs = Date.now();
    try {
      const result = await runProcess(spec);
      pendingCommands.push({ spec, result });
      return result;
    } catch (error) {
      const details = isPlainObject(error?.details) ? error.details : {};
      pendingCommands.push({
        spec,
        result: {
          startedAt,
          finishedAt: new Date().toISOString(),
          durationMs: Math.max(0, Date.now() - startedMs),
          exitCode: Number.isSafeInteger(details.exitCode) ? details.exitCode : null,
          signal: typeof details.signal === 'string' ? details.signal : null,
          stdout: Buffer.isBuffer(details.stdout) ? details.stdout : Buffer.alloc(0),
          stderr: Buffer.isBuffer(details.stderr) ? details.stderr : Buffer.alloc(0),
          timedOut: error?.code === 'TC01_PROCESS_TIMEOUT',
        },
      });
      throw error;
    }
  }

  async function executableHash(path) {
    if (!executableHashes.has(path)) executableHashes.set(path, sha256Bytes(await readFile(path)));
    return executableHashes.get(path);
  }

  function executableVersion(path) {
    if (activeProvenance && path === activeProvenance.treehouseExecutable) return activeProvenance.treehouseVersion;
    if (activeProvenance && path === realGit) return activeProvenance.gitVersion;
    if (path === process.execPath) return process.version;
    return 'observed';
  }

  async function internalScenarioArtifacts(scenarioId) {
    const commandId = 'internal-observation';
    const root = join(fixture.artifactsRoot, 'commands', scenarioId, commandId);
    await mkdir(root, { recursive: true });
    const stdoutRef = `commands/${scenarioId}/${commandId}/stdout.bin`;
    const stderrRef = `commands/${scenarioId}/${commandId}/stderr.bin`;
    const stdout = Buffer.alloc(0);
    const stderr = Buffer.alloc(0);
    await writeAtomic(join(fixture.artifactsRoot, stdoutRef), stdout);
    await writeAtomic(join(fixture.artifactsRoot, stderrRef), stderr);
    return {
      spec: {
        file: process.execPath,
        args: ['tc01-internal', scenarioId],
        cwd: fixture.runRoot,
        env: {},
        timeoutMs: INTERNAL_TIMEOUT_MS,
        stdoutLimitBytes: OUTPUT_LIMIT_BYTES,
        stderrLimitBytes: OUTPUT_LIMIT_BYTES,
      },
      result: {
        startedAt: new Date().toISOString(),
        finishedAt: new Date().toISOString(),
        durationMs: 0,
        exitCode: 0,
        signal: null,
        stdout,
        stderr,
        timedOut: false,
      },
      artifact: {
        stdoutRef,
        stderrRef,
        stdoutHash: sha256Bytes(stdout),
        stderrHash: sha256Bytes(stderr),
        stdoutExcerpt: '',
        stderrExcerpt: '',
      },
    };
  }

  async function createScenarioRecord(outcome) {
    const commands = pendingCommands.splice(0, pendingCommands.length);
    const written = [];
    for (const [index, command] of commands.entries()) {
      const commandId = `command-${String(index + 1).padStart(3, '0')}`;
      const artifact = await evidenceStore.writeCommand({
        scenarioId: outcome.scenarioId,
        commandId,
        spec: command.spec,
        result: command.result,
      });
      commandMetadata.push({
        commandId: `${outcome.scenarioId}/${commandId}`,
        shell: false,
        stdin: 'closed',
        timeoutMs: command.spec.timeoutMs,
        stdoutLimitBytes: command.spec.stdoutLimitBytes,
        stderrLimitBytes: command.spec.stderrLimitBytes,
        environmentKeys: Object.keys(command.spec.env).sort(compareCodeUnits),
      });
      written.push({ ...command, artifact });
    }

    let primary = written.find((entry) => activeProvenance && entry.spec.file === activeProvenance.treehouseExecutable) ?? written[0];
    if (!primary) primary = await internalScenarioArtifacts(outcome.scenarioId);

    return {
      scenarioId: outcome.scenarioId,
      startedAt: outcome.startedAt,
      finishedAt: outcome.finishedAt,
      executablePath: primary.spec.file,
      executableHash: await executableHash(primary.spec.file),
      version: executableVersion(primary.spec.file),
      argv: [...primary.spec.args],
      cwd: primary.spec.cwd,
      timeoutMs: primary.spec.timeoutMs,
      exitCode: primary.result.exitCode,
      signal: primary.result.signal,
      stdoutRef: primary.artifact.stdoutRef,
      stderrRef: primary.artifact.stderrRef,
      expected: outcome.expected,
      observations: outcome.observations,
      result: outcome.result,
      rationale: outcome.rationale,
      stdoutExcerpt: primary.artifact.stdoutExcerpt,
      stderrExcerpt: primary.artifact.stderrExcerpt,
      stdoutHash: primary.artifact.stdoutHash,
      stderrHash: primary.artifact.stderrHash,
    };
  }

  async function invokeGitText(repoPath, args) {
    const result = await recordedRun({
      file: realGit,
      args,
      cwd: repoPath,
      env: observerEnvironment(fixture, realGit),
      timeoutMs: 5_000,
      stdoutLimitBytes: OUTPUT_LIMIT_BYTES,
      stderrLimitBytes: OUTPUT_LIMIT_BYTES,
    });
    assertTc01(result.exitCode === 0, 'TC01_COMMAND_FAILED', 'Git runtime observation failed.', {
      args,
      cwd: repoPath,
      exitCode: result.exitCode,
    });
    return result.stdout.toString('utf8').trim();
  }

  async function commonDir(repoPath) {
    const value = await invokeGitText(repoPath, ['rev-parse', '--git-common-dir']);
    return realpath(resolve(repoPath, value));
  }

  async function proveLinkedWorktree({ lease }) {
    const sourceReal = await realpath(fixture.sourceRepo);
    const worktreeReal = await realpath(lease.path);
    const listing = await invokeGitText(fixture.sourceRepo, ['worktree', 'list', '--porcelain']);
    const listedPaths = listing
      .split(/\r?\n/u)
      .filter((line) => line.startsWith('worktree '))
      .map((line) => line.slice('worktree '.length));
    const canonicalListed = [];
    for (const path of listedPaths) canonicalListed.push(await realpath(path));
    const [sourceCommon, worktreeCommon, sourceSnapshot, worktreeSnapshot] = await Promise.all([
      commonDir(fixture.sourceRepo),
      commonDir(lease.path),
      snapshotRepository({
        gitFile: realGit,
        repoPath: fixture.sourceRepo,
        env: observerEnvironment(fixture, realGit),
        run: recordedRun,
      }),
      snapshotRepository({
        gitFile: realGit,
        repoPath: lease.path,
        env: observerEnvironment(fixture, realGit),
        run: recordedRun,
      }),
    ]);
    return {
      linked: sourceReal !== worktreeReal && canonicalListed.includes(worktreeReal),
      sameCommonDir: sourceCommon === worktreeCommon,
      sourceClean: sourceSnapshot.porcelainStatus.byteLength === 0,
      worktreeClean: worktreeSnapshot.porcelainStatus.byteLength === 0,
    };
  }

  function controlledPath(path, expectedName = null) {
    const safe = assertContained(fixture.runRoot, path, 'TC-01 controlled path');
    assertTc01(safe.startsWith(`${fixture.poolRoot}${sep}`), 'TC01_EVIDENCE_INVALID', 'Controlled worktree path is outside the TC-01 pool.', {
      path: safe,
      poolRoot: fixture.poolRoot,
    });
    if (expectedName) assertTc01(basename(safe) === expectedName, 'TC01_EVIDENCE_INVALID', 'Controlled file name is not allowed.', { path: safe });
    return safe;
  }

  function treehouseClient() {
    const common = () => ({
      fixture: runtimeFixture,
      treehouseExecutable: activeProvenance.treehouseExecutable,
      realGit,
      gitWrapperDir: fixture.gitWrapperRoot,
      gitLog,
      run: recordedRun,
    });
    return {
      acquireLease: (input) => acquireTreehouseLease({ ...common(), holder: input.holder }),
      observeStatus: () => observeTreehouseStatus(common()),
      findStatusByPath,
      returnLease: (input) => returnTreehouseLease({
        ...common(),
        path: input.path,
        leaseId: input.leaseId,
        holder: input.holder,
      }),
    };
  }

  return {
    commandShapeHash: TC01_COMMAND_SHAPE_HASH,
    expectedEnvironmentKeySets: expectedEnvironmentKeySets(),
    async discoverProvenance() {
      activeProvenance = await discoverTc01Environment({
        cwd: fixture.sourceRepo,
        env: provenanceEnvironment(fixture),
        runProcess: recordedRun,
      });
      return activeProvenance;
    },
    async runScenarios({ provenance }) {
      activeProvenance = provenance;
      const client = treehouseClient();
      const observers = {
        snapshotRepository: ({ path }) => snapshotRepository({
          gitFile: realGit,
          repoPath: path,
          env: observerEnvironment(fixture, realGit),
          run: recordedRun,
        }),
        compareRepositorySnapshots,
        snapshotPathTree: ({ root }) => snapshotPathTree({ root }),
        comparePathSnapshots,
        proveLinkedWorktree,
        readGitInvocations: readGitInvocationLog,
        assertNoFetchInvocation,
        async listRemotes(path) {
          const text = await invokeGitText(path, ['remote']);
          return text ? text.split(/\r?\n/u).filter(Boolean) : [];
        },
        snapshotPrivateState: () => snapshotPathTree({ root: fixture.fakeHome }),
        async writeControlledFile({ path, bytes }) {
          const safe = controlledPath(path, 'controlled-uncommitted.txt');
          assertTc01(Buffer.isBuffer(bytes), 'TC01_EVIDENCE_INVALID', 'Controlled file bytes must be a Buffer.');
          await writeFile(safe, bytes, { flag: 'wx' });
        },
        async readControlledFile({ path }) {
          return readFile(controlledPath(path, 'controlled-uncommitted.txt'));
        },
        async removeControlledFile({ path }) {
          await rm(controlledPath(path, 'controlled-uncommitted.txt'), { force: false });
        },
        async inspectReleaseTarget({ path }) {
          const safe = assertContained(fixture.runRoot, path, 'TC-01 release target');
          if (!existsSync(safe)) return 'missing';
          return 'unmanaged';
        },
      };
      const acceptedIdentity = {
        treehouseExecutableHash: provenance.treehouseExecutableHash,
        treehouseVersion: provenance.treehouseVersion,
        gitVersion: provenance.gitVersion,
        kernelRelease: provenance.kernelRelease,
        ubuntuRelease: provenance.ubuntuRelease,
        commandShapeHash: TC01_COMMAND_SHAPE_HASH,
      };
      return runTc01Scenarios({
        fixture: runtimeFixture,
        provenance,
        acceptedIdentity,
        commandShapeHash: TC01_COMMAND_SHAPE_HASH,
        expectedEnvironmentKeySets: expectedEnvironmentKeySets(),
        client,
        createFreshClient: () => treehouseClient(),
        observers,
        commandEvidence: { async list() { return commandMetadata.map((entry) => ({ ...entry })); } },
        evidenceStore,
        createScenarioRecord,
        now: () => new Date(),
      });
    },
  };
}

function validateManifest(manifest, fixture) {
  assertTc01(isPlainObject(manifest), 'TC01_EVIDENCE_INVALID', 'TC-01 manifest must be an object.');
  assertTc01(manifest.schemaVersion === 1, 'TC01_EVIDENCE_INVALID', 'TC-01 manifest schema is unsupported.');
  assertTc01(manifest.runId === fixture.runId, 'TC01_EVIDENCE_INVALID', 'TC-01 manifest run ID does not match the fixture.');
  assertTc01(manifest.environmentRef === 'environment.json', 'TC01_EVIDENCE_INVALID', 'TC-01 manifest environment reference is invalid.');
  assertTc01(manifest.scenariosRef === 'scenarios.json', 'TC01_EVIDENCE_INVALID', 'TC-01 manifest scenarios reference is invalid.');
  assertTc01(HASH_PATTERN.test(manifest.environmentHash), 'TC01_EVIDENCE_INVALID', 'TC-01 manifest environment hash is invalid.');
  assertTc01(HASH_PATTERN.test(manifest.scenariosHash), 'TC01_EVIDENCE_INVALID', 'TC-01 manifest scenarios hash is invalid.');
  assertTc01(manifest.scenarioCount === 15, 'TC01_EVIDENCE_INVALID', 'TC-01 manifest must bind exactly fifteen scenarios.');
  return manifest;
}

async function readCleanupState(fixture) {
  const path = join(fixture.artifactsRoot, 'cleanup.json');
  if (!existsSync(path)) return { state: 'NOT_REQUESTED', rationale: 'Cleanup has not been requested.' };
  const value = parseJsonBytes(await readRegularFile(path, 'TC-01 cleanup state'), 'TC-01 cleanup state');
  assertTc01(isPlainObject(value), 'TC01_EVIDENCE_INVALID', 'TC-01 cleanup state must be an object.');
  assertTc01(typeof value.state === 'string' && value.state.length > 0, 'TC01_EVIDENCE_INVALID', 'TC-01 cleanup state is missing.');
  assertTc01(typeof value.rationale === 'string' && value.rationale.length > 0, 'TC01_EVIDENCE_INVALID', 'TC-01 cleanup rationale is missing.');
  return value;
}

async function loadFinalizedRunDefault({ runRoot }) {
  const fixture = await loadFixture(runRoot);
  const manifestBytes = await readRegularFile(join(fixture.artifactsRoot, 'manifest.json'), 'TC-01 manifest');
  const manifest = validateManifest(parseJsonBytes(manifestBytes, 'TC-01 manifest'), fixture);
  const environmentBytes = await readRegularFile(join(fixture.artifactsRoot, manifest.environmentRef), 'TC-01 environment Evidence');
  const scenariosBytes = await readRegularFile(join(fixture.artifactsRoot, manifest.scenariosRef), 'TC-01 scenario Evidence');
  assertTc01(sha256Bytes(environmentBytes) === manifest.environmentHash, 'TC01_EVIDENCE_INVALID', 'TC-01 environment hash does not match the manifest.');
  assertTc01(sha256Bytes(scenariosBytes) === manifest.scenariosHash, 'TC01_EVIDENCE_INVALID', 'TC-01 scenarios hash does not match the manifest.');
  const environment = parseJsonBytes(environmentBytes, 'TC-01 environment Evidence');
  assertTc01(isPlainObject(environment) && environment.schemaVersion === 1, 'TC01_EVIDENCE_INVALID', 'TC-01 environment Evidence is invalid.');
  assertTc01(environment.runId === fixture.runId, 'TC01_EVIDENCE_INVALID', 'TC-01 environment run ID does not match the fixture.');
  assertTc01(isPlainObject(environment.provenance), 'TC01_EVIDENCE_INVALID', 'TC-01 environment provenance is missing.');
  assertTc01(HASH_PATTERN.test(environment.commandShapeHash), 'TC01_EVIDENCE_INVALID', 'TC-01 command-shape hash is missing.');
  const store = await createEvidenceStoreDefault(fixture);
  const scenarios = await store.readScenarios();
  assertTc01(scenarios.length === manifest.scenarioCount, 'TC01_EVIDENCE_INVALID', 'TC-01 scenario count does not match the manifest.');
  return {
    fixture,
    provenance: environment.provenance,
    scenarios,
    scenariosHash: manifest.scenariosHash,
    commandShapeHash: environment.commandShapeHash,
    cleanup: await readCleanupState(fixture),
    manifest,
  };
}

function reportInput(bundle) {
  return {
    provenance: bundle.provenance,
    scenarios: bundle.scenarios,
    scenariosHash: bundle.scenariosHash,
    commandShapeHash: bundle.commandShapeHash,
    cleanup: bundle.cleanup,
  };
}

async function writeRuntimeOutputs(bundle, verdict, report) {
  const verdictPath = join(bundle.fixture.artifactsRoot, 'verdict.json');
  const reportPath = join(bundle.fixture.artifactsRoot, 'report.md');
  await writeJsonAtomic(verdictPath, verdict);
  await writeTextAtomic(reportPath, report);
  return { verdictPath, reportPath };
}

function nextActionFor(verdict, runRoot, reportPath, cleanup) {
  if (verdict === 'REJECT' || verdict === 'BLOCKED') {
    return `Preserve ${runRoot} and review ${reportPath}; cleanup is blocked.`;
  }
  if (cleanup.state === 'COMPLETED') return `Retain ${reportPath} as the reviewed TC-01 artifact.`;
  return `Review ${reportPath}, then run cleanup --run-root ${runRoot}.`;
}

function resolveDependencies(overrides = {}) {
  return {
    resolveStateRoot: ({ stateRoot }) => stateRoot
      ? assertLinuxOwnedAbsolutePath(stateRoot, 'TC-01 state root')
      : resolveTc01StateRoot({ env: process.env, homeDir: homedir() }),
    createFixture: defaultCreateFixture,
    createEvidenceStore: createEvidenceStoreDefault,
    createRuntime: createDefaultRuntime,
    loadFinalizedRun: loadFinalizedRunDefault,
    deriveVerdict: deriveTc01Verdict,
    renderReport: renderTc01Report,
    assessCleanupSafety: assessCleanupSafetyDefault,
    removeEphemeralPaths: removeEphemeralPathsDefault,
    ...overrides,
  };
}

export async function runTc01(input = {}, dependencyOverrides = {}) {
  assertTc01(isPlainObject(input), 'TC01_INVALID_INPUT', 'TC-01 run input must be an object.');
  const dependencies = resolveDependencies(dependencyOverrides);
  const stateRoot = dependencies.resolveStateRoot({ stateRoot: input.stateRoot ?? null });
  const runId = input.runId === undefined || input.runId === null
    ? generateTc01RunId({ now: input.now ?? new Date(), randomBytes: input.randomBytes ?? cryptoRandomBytes })
    : validateRunId(input.runId);
  const fixture = await dependencies.createFixture({ stateRoot, runId });
  const evidenceStore = await dependencies.createEvidenceStore(fixture);
  const runtime = await dependencies.createRuntime({ fixture, evidenceStore });
  assertTc01(HASH_PATTERN.test(runtime.commandShapeHash), 'TC01_EVIDENCE_INVALID', 'TC-01 runtime command-shape hash is invalid.');
  const provenance = await runtime.discoverProvenance();
  const acceptedIdentity = {
    treehouseExecutableHash: provenance.treehouseExecutableHash,
    treehouseVersion: provenance.treehouseVersion,
    gitVersion: provenance.gitVersion,
    kernelRelease: provenance.kernelRelease,
    ubuntuRelease: provenance.ubuntuRelease,
    commandShapeHash: runtime.commandShapeHash,
  };
  await evidenceStore.writeEnvironment({
    schemaVersion: 1,
    runId,
    provenance,
    commandShapeHash: runtime.commandShapeHash,
    acceptedIdentity,
    expectedEnvironmentKeySets: runtime.expectedEnvironmentKeySets ?? expectedEnvironmentKeySets(),
  });
  await runtime.runScenarios({ provenance, acceptedIdentity });
  await evidenceStore.finalize();

  const bundle = await dependencies.loadFinalizedRun({ runRoot: fixture.runRoot });
  let verdict = dependencies.deriveVerdict(reportInput(bundle));
  const cleanup = verdict.verdict === 'REJECT' || verdict.verdict === 'BLOCKED'
    ? { state: 'PRESERVED', rationale: 'A rejecting or blocked Verdict preserves the fixture; automatic cleanup is prohibited.' }
    : { state: 'READY_FOR_CLEANUP', rationale: 'The completed Verdict permits a separate trusted cleanup review.' };
  await writeJsonAtomic(join(fixture.artifactsRoot, 'cleanup.json'), cleanup);
  bundle.cleanup = cleanup;
  verdict = { ...verdict, cleanup };
  const report = dependencies.renderReport(reportInput(bundle));
  const paths = await writeRuntimeOutputs(bundle, verdict, report);
  return {
    command: 'run',
    runId,
    runRoot: fixture.runRoot,
    verdict: verdict.verdict,
    reportPath: paths.reportPath,
    verdictPath: paths.verdictPath,
    cleanup,
    nextAction: nextActionFor(verdict.verdict, fixture.runRoot, paths.reportPath, cleanup),
  };
}

export async function reportTc01(input, dependencyOverrides = {}) {
  assertTc01(isPlainObject(input), 'TC01_INVALID_INPUT', 'TC-01 report input must be an object.');
  const runRoot = assertLinuxOwnedAbsolutePath(input.runRoot, 'TC-01 run root');
  const dependencies = resolveDependencies(dependencyOverrides);
  const bundle = await dependencies.loadFinalizedRun({ runRoot });
  const verdict = dependencies.deriveVerdict(reportInput(bundle));
  const report = dependencies.renderReport(reportInput(bundle));
  const paths = await writeRuntimeOutputs(bundle, verdict, report);
  return {
    command: 'report',
    runId: bundle.fixture.runId,
    runRoot: bundle.fixture.runRoot,
    verdict: verdict.verdict,
    reportPath: paths.reportPath,
    verdictPath: paths.verdictPath,
    cleanup: bundle.cleanup,
    nextAction: nextActionFor(verdict.verdict, bundle.fixture.runRoot, paths.reportPath, bundle.cleanup),
  };
}

async function assessCleanupSafetyDefault({ bundle, verdict }) {
  const blockers = [];
  const fixture = bundle.fixture;
  const cleanupTargets = [
    fixture.sourceRepo,
    fixture.poolRoot,
    fixture.snapshotsRoot,
    fixture.fakeHome,
    fixture.gitWrapperRoot,
    join(fixture.runRoot, 'unmanaged-repo'),
  ];
  for (const path of cleanupTargets) {
    try {
      assertContained(fixture.runRoot, path, 'TC-01 cleanup target');
    } catch {
      blockers.push('UNRECOGNIZED_RUN_PATH');
    }
  }
  if (verdict.verdict === 'REJECT' || verdict.verdict === 'BLOCKED') blockers.push(`VERDICT_${verdict.verdict}`);

  try {
    const realGit = await resolveExecutable('git');
    const cleanupLog = join(fixture.artifactsRoot, 'cleanup-git-invocations.jsonl');
    const common = {
      fixture: { ...fixture, gitLog: cleanupLog },
      treehouseExecutable: bundle.provenance.treehouseExecutable,
      realGit,
      gitWrapperDir: fixture.gitWrapperRoot,
      gitLog: cleanupLog,
      run: runProcess,
    };
    const status = await observeTreehouseStatus(common);
    if (status.some((item) => item.status === 'leased' && item.leaseHolder.startsWith('mnfs-tc01-'))) blockers.push('LIVE_LEASE');
    for (const item of status) {
      if (!item.path.startsWith(`${fixture.poolRoot}${sep}`) || !existsSync(item.path)) continue;
      const snapshot = await snapshotRepository({
        gitFile: realGit,
        repoPath: item.path,
        env: observerEnvironment(fixture, realGit),
        run: runProcess,
      });
      if (snapshot.porcelainStatus.byteLength !== 0) blockers.push('DIRTY_WORKTREE');
    }
    if (existsSync(fixture.sourceRepo)) {
      const source = await snapshotRepository({
        gitFile: realGit,
        repoPath: fixture.sourceRepo,
        env: observerEnvironment(fixture, realGit),
        run: runProcess,
      });
      if (source.head.text !== fixture.initialCommit || source.porcelainStatus.byteLength !== 0) blockers.push('SOURCE_CHANGED');
    } else {
      blockers.push('SOURCE_CHANGED');
    }
  } catch (error) {
    blockers.push(error?.code === 'TC01_TREEHOUSE_INVALID_OUTPUT' ? 'STATUS_INVALID' : 'STATUS_UNAVAILABLE');
  }

  return { safe: blockers.length === 0, blockers: [...new Set(blockers)].sort(compareCodeUnits) };
}

async function removeEphemeralPathsDefault({ fixture }) {
  const targets = [
    fixture.poolRoot,
    fixture.sourceRepo,
    fixture.snapshotsRoot,
    fixture.fakeHome,
    fixture.gitWrapperRoot,
    join(fixture.runRoot, 'unmanaged-repo'),
  ];
  for (const path of targets) {
    assertContained(fixture.runRoot, path, 'TC-01 cleanup target');
    await rm(path, { recursive: true, force: true });
  }
}

export async function cleanupTc01(input, dependencyOverrides = {}) {
  assertTc01(isPlainObject(input), 'TC01_INVALID_INPUT', 'TC-01 cleanup input must be an object.');
  const runRoot = assertLinuxOwnedAbsolutePath(input.runRoot, 'TC-01 run root');
  const dependencies = resolveDependencies(dependencyOverrides);
  const bundle = await dependencies.loadFinalizedRun({ runRoot });
  const verdict = dependencies.deriveVerdict(reportInput(bundle));
  const assessment = await dependencies.assessCleanupSafety({ bundle, verdict });
  assertTc01(isPlainObject(assessment) && typeof assessment.safe === 'boolean' && Array.isArray(assessment.blockers), 'TC01_CLEANUP_BLOCKED', 'TC-01 cleanup assessment is invalid.');
  if (!assessment.safe) {
    throw tc01Error('TC01_CLEANUP_BLOCKED', 'TC-01 cleanup safety checks did not pass.', {
      runRoot: bundle.fixture.runRoot,
      blockers: assessment.blockers,
    });
  }
  await dependencies.removeEphemeralPaths({ fixture: bundle.fixture });
  const cleanup = {
    state: 'COMPLETED',
    rationale: 'Trusted cleanup removed only run-scoped ephemeral fixture resources after finalized Evidence and safety checks.',
  };
  await writeJsonAtomic(join(bundle.fixture.artifactsRoot, 'cleanup.json'), cleanup);
  bundle.cleanup = cleanup;
  const finalVerdict = { ...dependencies.deriveVerdict(reportInput(bundle)), cleanup };
  const report = dependencies.renderReport(reportInput(bundle));
  const paths = await writeRuntimeOutputs(bundle, finalVerdict, report);
  return {
    command: 'cleanup',
    runId: bundle.fixture.runId,
    runRoot: bundle.fixture.runRoot,
    verdict: finalVerdict.verdict,
    reportPath: paths.reportPath,
    verdictPath: paths.verdictPath,
    cleanup,
    nextAction: nextActionFor(finalVerdict.verdict, bundle.fixture.runRoot, paths.reportPath, cleanup),
  };
}
