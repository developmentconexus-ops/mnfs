import { createAcpStdioClient } from '../acp/client.mjs';

const PROTOCOL_COMPATIBILITY_PENDING = 'PENDING_REAL_GATE_S1';

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
    throw new TypeError(`Pi-ACP ${name} must be an absolute path`);
  }
}

function requireExplicitEnvironment(env) {
  if (!env || typeof env !== 'object' || Array.isArray(env)) {
    throw new TypeError('Pi-ACP adapter requires an explicit env');
  }
  const prototype = Object.getPrototypeOf(env);
  if (prototype !== Object.prototype && prototype !== null) {
    throw new TypeError('Pi-ACP env must be a plain object');
  }
  for (const [key, value] of Object.entries(env)) {
    if (key.length === 0 || typeof value !== 'string') {
      throw new TypeError('Pi-ACP env keys and values must be strings');
    }
  }
  return { ...env };
}

function requireCommonClient(client) {
  if (!client || typeof client !== 'object') throw new TypeError('Pi-ACP common ACP client is required');
  for (const method of ['initialize', 'handshake', 'startSession', 'prompt', 'cancel', 'shutdown']) {
    if (typeof client[method] !== 'function') throw new TypeError(`Pi-ACP common ACP client must expose ${method}`);
  }
}

export const PI_ACP_PROVENANCE = deepFreeze({
  version: '0.0.33',
  sourceCommit: 'd1cffc047ab37a096ee70ca39cfc1de463db8d12',
  entrypoint: ['pi-acp'],
  transport: 'ACP_STDIN_STDOUT',
  innerPi: {
    argv: ['pi', '--mode', 'rpc', '--no-themes'],
    commandEnvironment: 'PI_ACP_PI_COMMAND',
    inheritsParentEnvironment: true,
  },
  resourceBehavior: {
    extensions: 'ENABLED',
    promptTemplates: 'ENABLED',
    themes: 'DISABLED_BY_PI_ACP_INTERNAL_ARG',
  },
  delegation: {
    filesystem: 'NOT_PROVIDED_BY_PI_ACP',
    terminal: 'NOT_PROVIDED_BY_PI_ACP',
  },
  declaredAcpSdk: '^0.26.0',
  mnfsAcpSdk: '1.3.0',
  wireCompatibility: PROTOCOL_COMPATIBILITY_PENDING,
});

function buildProcessSpec({ executable, cwd, env, timeoutMs, terminationGraceMs, stdoutLimitBytes, stderrLimitBytes }) {
  const processSpec = {
    argv: [executable],
    cwd,
    env: { ...env },
  };
  if (timeoutMs !== undefined) processSpec.timeoutMs = timeoutMs;
  if (terminationGraceMs !== undefined) processSpec.terminationGraceMs = terminationGraceMs;
  if (stdoutLimitBytes !== undefined) processSpec.stdoutLimitBytes = stdoutLimitBytes;
  if (stderrLimitBytes !== undefined) processSpec.stderrLimitBytes = stderrLimitBytes;
  return deepFreeze(processSpec);
}

export function createPiAcpAdapter({
  executable,
  cwd,
  env,
  timeoutMs,
  terminationGraceMs,
  stdoutLimitBytes,
  stderrLimitBytes,
  clientFactory,
  ndJsonStream,
  createClient = createAcpStdioClient,
} = {}) {
  requireAbsolute(executable, 'entrypoint');
  requireAbsolute(cwd, 'cwd');
  const explicitEnv = requireExplicitEnvironment(env);
  requireAbsolute(explicitEnv.PI_ACP_PI_COMMAND, 'PI_ACP_PI_COMMAND');
  if (typeof createClient !== 'function') throw new TypeError('Pi-ACP createClient must be a function');

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
    provenance: PI_ACP_PROVENANCE,
    transport: 'ACP_STDIN_STDOUT',
    innerPi: clone(PI_ACP_PROVENANCE.innerPi),
    projectedInnerPi: {
      argv: [explicitEnv.PI_ACP_PI_COMMAND, '--mode', 'rpc', '--no-themes'],
      environmentSource: 'EXACT_PI_ACP_PARENT_ENV',
    },
    resourceBehavior: clone(PI_ACP_PROVENANCE.resourceBehavior),
    delegation: clone(PI_ACP_PROVENANCE.delegation),
    wireCompatibility: {
      declaredPiAcpSdk: PI_ACP_PROVENANCE.declaredAcpSdk,
      mnfsClientSdk: PI_ACP_PROVENANCE.mnfsAcpSdk,
      status: PROTOCOL_COMPATIBILITY_PENDING,
    },
  });

  let commonClient = null;
  let initialized = false;
  let closed = false;
  let clientPromise = null;

  async function initialize() {
    if (closed) throw new Error('Pi-ACP adapter is closed');
    if (initialized) return commonClient.handshake();
    if (!clientPromise) {
      clientPromise = Promise.resolve(createClient({
        processSpec: clone(processSpec),
        clientFactory,
        ndJsonStream,
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
    if (!initialized || !commonClient) throw new Error('Pi-ACP adapter must be initialized first');
    if (closed) throw new Error('Pi-ACP adapter is closed');
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

  return Object.freeze({
    initialize,
    handshake,
    startSession,
    prompt,
    cancel,
    shutdown,
    observations,
    processSpec: clone(processSpec),
  });
}
