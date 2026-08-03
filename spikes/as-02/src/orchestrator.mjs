import { randomUUID } from 'node:crypto';
import { isAbsolute, join } from 'node:path';

import { canonicalJson, sha256Text } from './canonical-json.mjs';
import { as02Error, assertAs02 } from './errors.mjs';

const HASH_PATTERN = /^sha256:[a-f0-9]{64}$/u;
const REQUIRED_RESTART_SCENARIOS = Object.freeze(['S1', 'S3', 'S5', 'S9', 'S11', 'S13']);

function linuxAbsolute(path, label) {
  if (
    typeof path !== 'string' ||
    !isAbsolute(path) ||
    path === '/mnt' ||
    path.startsWith('/mnt/') ||
    /[\r\n]/u.test(path)
  ) {
    throw as02Error('ORCHESTRATOR_PATH_INVALID', `${label} must be one absolute Linux path outside /mnt.`, {
      path,
      label,
    });
  }
  return path;
}

export function createRunId({ now = new Date(), random = () => randomUUID().replaceAll('-', '').slice(0, 6) } = {}) {
  assertAs02(now instanceof Date && !Number.isNaN(now.valueOf()), 'ORCHESTRATOR_PATH_INVALID', 'Run timestamp is invalid.');
  const suffix = random();
  assertAs02(typeof suffix === 'string' && /^[a-z0-9]{6,32}$/u.test(suffix), 'ORCHESTRATOR_PATH_INVALID', 'Run suffix is invalid.', { suffix });
  const timestamp = now.toISOString()
    .replaceAll('-', '')
    .replaceAll(':', '')
    .replace('.000', '')
    .replace('.', '')
    .toLowerCase();
  return `as02-${timestamp}-${suffix}`;
}

export function resolveAs02ArtifactBase(env = process.env, homeDirectory) {
  const home = linuxAbsolute(homeDirectory, 'Home directory');
  const stateRoot = env.MNFS_HOME === undefined
    ? join(home, '.local', 'state', 'mnfs')
    : linuxAbsolute(env.MNFS_HOME, 'MNFS_HOME');
  return join(stateRoot, 'artifacts', 'as-02');
}

export function buildLeasedResources({ leasedPath, gitMetadata, baseResources, activePolicy }) {
  const lease = linuxAbsolute(leasedPath, 'Leased worktree');
  const policy = linuxAbsolute(activePolicy, 'Active policy');
  assertAs02(gitMetadata && typeof gitMetadata === 'object', 'ORCHESTRATOR_PATH_INVALID', 'Git metadata is required.');
  assertAs02(baseResources && typeof baseResources === 'object', 'ORCHESTRATOR_PATH_INVALID', 'Base resources are required.');
  for (const [key, value] of Object.entries(gitMetadata)) linuxAbsolute(value, `Git metadata ${key}`);

  return {
    ...baseResources,
    worktreeMnfs: join(lease, '.mnfs', 'protected.json'),
    worktreePi: join(lease, '.pi', 'security.json'),
    worktreeEnv: join(lease, '.env'),
    worktreeGitPointer: join(lease, '.git'),
    gitConfig: gitMetadata.config,
    gitHook: join(gitMetadata.hooks, 'pre-commit'),
    activePolicy: policy,
  };
}

export function createPolicySet({ compilePolicy, common }) {
  assertAs02(typeof compilePolicy === 'function', 'ORCHESTRATOR_PATH_INVALID', 'Policy compiler is required.');
  const definitions = [
    ['networkOff', { allowedDomains: [], deniedDomains: [] }],
    ['narrowNetwork', { allowedDomains: ['registry.npmjs.org'], deniedDomains: [] }],
    ['githubBroad', { allowedDomains: ['github.com', '*.github.com'], deniedDomains: [] }],
  ];
  const result = {};
  for (const [key, network] of definitions) {
    const policy = compilePolicy({ ...common, network });
    assertAs02(typeof policy?.hash === 'string' && HASH_PATTERN.test(policy.hash), 'ORCHESTRATOR_PATH_INVALID', `Policy ${key} has an invalid hash.`);
    result[key] = policy;
  }
  return result;
}

export function createSwitchingSessionController({ policies, createSession }) {
  assertAs02(policies && typeof policies === 'object', 'ORCHESTRATOR_SESSION_INVALID', 'Policies are required.');
  assertAs02(typeof createSession === 'function', 'ORCHESTRATOR_SESSION_INVALID', 'Session factory is required.');
  let currentKey = null;
  let currentSession = null;
  let closed = false;
  let queue = Promise.resolve();

  function serialize(task) {
    const next = queue.then(task, task);
    queue = next.catch(() => {});
    return next;
  }

  async function switchTo(key) {
    assertAs02(!closed, 'ORCHESTRATOR_SESSION_INVALID', 'Sandbox session controller is closed.');
    const policy = policies[key];
    assertAs02(policy, 'ORCHESTRATOR_SESSION_INVALID', `Unknown policy key: ${key}.`);
    if (currentKey === key && currentSession) return currentSession;
    if (currentSession) await currentSession.close();
    currentSession = await createSession(key, policy);
    await currentSession.initialize();
    currentKey = key;
    return currentSession;
  }

  return Object.freeze({
    session(key) {
      return Object.freeze({
        run(argv, options) {
          return serialize(async () => (await switchTo(key)).run(argv, options));
        },
      });
    },
    close() {
      return serialize(async () => {
        if (closed) return;
        closed = true;
        if (currentSession) await currentSession.close();
        currentSession = null;
        currentKey = null;
      });
    },
  });
}

export function scenarioSignature(evidence) {
  assertAs02(evidence && typeof evidence === 'object', 'ORCHESTRATOR_PATH_INVALID', 'Scenario evidence is required.');
  const body = {
    scenarioId: evidence.scenarioId,
    result: evidence.result,
    failureCode: evidence.failureCode ?? null,
    policyHash: evidence.policyHash,
    observedFilesystem: evidence.observedFilesystem ?? {},
  };
  return sha256Text(canonicalJson(body));
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
    assertAs02(evidence, 'ORCHESTRATOR_PATH_INVALID', `Missing checkpoint scenario ${scenarioId}.`);
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

async function resolveOperations(options) {
  if (options?.operations) return options.operations;
  const module = await import('./orchestrator-runtime-durable.mjs');
  return module.createRuntimeOperations(options);
}

function outcome(value, exitCode = 0) {
  return { exitCode, value };
}

export async function createProductionHandlers(options = {}) {
  const operations = await resolveOperations(options);
  for (const name of ['preflight', 'phaseOne', 'latest', 'restartPrepare', 'restartResume', 'report', 'cleanup']) {
    assertAs02(typeof operations?.[name] === 'function', 'ORCHESTRATOR_PATH_INVALID', `Orchestrator operation ${name} is unavailable.`);
  }

  return Object.freeze({
    async preflight() {
      const value = await operations.preflight();
      return outcome(value, value.status === 'READY' ? 0 : 1);
    },
    async run() {
      const preflight = await operations.preflight();
      if (preflight.status !== 'READY') return outcome(preflight, 1);
      return outcome(await operations.phaseOne({ preflight }));
    },
    async restartPrepare() {
      const state = await operations.latest();
      return outcome(await operations.restartPrepare(state));
    },
    async restartResume(input) {
      return outcome(await operations.restartResume(input));
    },
    async report(input) {
      return outcome(await operations.report(input));
    },
    async cleanup(input) {
      return outcome(await operations.cleanup(input));
    },
  });
}
