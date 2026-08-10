import { createAcpStdioClient } from '../acp/client.mjs';

function clone(value) {
  return structuredClone(value);
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

function requireAbsolute(value, name) {
  if (typeof value !== 'string' || value.length === 0 || !value.startsWith('/')) {
    throw new TypeError(`OpenCode ACP ${name} must be an absolute path`);
  }
}

function requireExplicitEnvironment(env) {
  if (!env || typeof env !== 'object' || Array.isArray(env)) {
    throw new TypeError('OpenCode ACP adapter requires an explicit env');
  }
  const prototype = Object.getPrototypeOf(env);
  if (prototype !== Object.prototype && prototype !== null) {
    throw new TypeError('OpenCode ACP env must be a plain object');
  }
  for (const [key, value] of Object.entries(env)) {
    if (key.length === 0 || typeof value !== 'string') {
      throw new TypeError('OpenCode ACP env keys and values must be strings');
    }
  }
  return { ...env };
}

function requireCommonClient(client) {
  if (!client || typeof client !== 'object') throw new TypeError('OpenCode ACP common ACP client is required');
  for (const method of ['initialize', 'handshake', 'startSession', 'prompt', 'cancel', 'shutdown']) {
    if (typeof client[method] !== 'function') throw new TypeError(`OpenCode ACP common ACP client must expose ${method}`);
  }
}

export const OPENCODE_PROVENANCE = deepFreeze({
  version: '1.18.15',
  releaseCommit: '325529761beb79a004de6d86e48b8db69cf4eba3',
  entrypoint: ['opencode', 'acp'],
  cwdFlag: '--cwd',
  transport: 'ACP_STDIN_STDOUT',
});

function buildProcessSpec({ executable, cwd, env, timeoutMs, terminationGraceMs, stdoutLimitBytes, stderrLimitBytes }) {
  const processSpec = {
    argv: [executable, 'acp', OPENCODE_PROVENANCE.cwdFlag, cwd],
    cwd,
    env: { ...env },
  };
  if (timeoutMs !== undefined) processSpec.timeoutMs = timeoutMs;
  if (terminationGraceMs !== undefined) processSpec.terminationGraceMs = terminationGraceMs;
  if (stdoutLimitBytes !== undefined) processSpec.stdoutLimitBytes = stdoutLimitBytes;
  if (stderrLimitBytes !== undefined) processSpec.stderrLimitBytes = stderrLimitBytes;
  return deepFreeze(processSpec);
}

export function createOpenCodeAcpAdapter({
  executable,
  cwd,
  env,
  timeoutMs,
  terminationGraceMs,
  stdoutLimitBytes,
  stderrLimitBytes,
  clientFactory,
  ndJsonStream,
  clientCapabilities,
  clientRequestHandlers,
  beforeSpawn,
  createClient = createAcpStdioClient,
} = {}) {
  requireAbsolute(executable, 'executable');
  requireAbsolute(cwd, 'cwd');
  const explicitEnv = requireExplicitEnvironment(env);
  if (typeof createClient !== 'function') throw new TypeError('OpenCode ACP createClient must be a function');

  const processSpec = buildProcessSpec({
    executable,
    cwd,
    env: explicitEnv,
    timeoutMs,
    terminationGraceMs,
    stdoutLimitBytes,
    stderrLimitBytes,
  });
  const observations = deepFreeze({
    provenance: OPENCODE_PROVENANCE,
    transport: 'ACP_STDIN_STDOUT',
    capabilities: { status: 'EVIDENCE_ONLY' },
    permissions: { status: 'EVIDENCE_ONLY' },
  });

  let commonClient = null;
  let initialized = false;
  let closed = false;
  let clientPromise = null;

  async function initialize() {
    if (closed) throw new Error('OpenCode ACP adapter is closed');
    if (initialized) return commonClient.handshake();
    if (!clientPromise) {
      clientPromise = Promise.resolve(createClient({
        processSpec: clone(processSpec),
        clientFactory,
        ndJsonStream,
        ...(clientCapabilities ? { clientCapabilities } : {}),
        ...(clientRequestHandlers ? { clientRequestHandlers } : {}),
        ...(beforeSpawn ? { beforeSpawn } : {}),
      })).then((client) => {
        requireCommonClient(client);
        commonClient = client;
        return client;
      });
    }
    commonClient = await clientPromise;
    const handshake = await commonClient.initialize();
    initialized = true;
    return handshake;
  }

  function requireInitialized() {
    if (!initialized || !commonClient) throw new Error('OpenCode ACP adapter must be initialized first');
    if (closed) throw new Error('OpenCode ACP adapter is closed');
  }

  async function startSession(input) {
    requireInitialized();
    return commonClient.startSession(input);
  }

  async function prompt(input) {
    requireInitialized();
    return commonClient.prompt(input);
  }

  async function cancel() {
    requireInitialized();
    return commonClient.cancel();
  }

  function handshake() {
    return commonClient?.handshake() ?? null;
  }

  async function shutdown() {
    if (closed) return;
    closed = true;
    if (commonClient) await commonClient.shutdown();
  }

  async function processObservation() {
    return commonClient?.processObservation?.() ?? null;
  }

  function forceKill(reason) {
    return commonClient?.forceKill?.(reason) ?? false;
  }

  return Object.freeze({
    initialize,
    handshake,
    startSession,
    prompt,
    cancel,
    shutdown,
    processObservation,
    forceKill,
    observations,
    processSpec: clone(processSpec),
  });
}
