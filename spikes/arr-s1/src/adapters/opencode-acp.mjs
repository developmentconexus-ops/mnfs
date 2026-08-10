import { createAcpStdioClient } from '../acp/client.mjs';
import { requireOpenCodeDataRoute, openCodeCredentialRouteEvidence } from '../credential-routes.mjs';

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

function pathOwnedBy(root, value) {
  return value === root || value.startsWith(`${root}/`);
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

function profileEnvironment(env, profile) {
  const cleanEnv = Object.fromEntries(Object.entries(env).filter(([key]) => !['OPENCODE_AUTH_CONTENT', 'OPENCODE_CONFIG_CONTENT'].includes(key)));
  if (profile === undefined) throw new TypeError('OpenCode ACP requires an explicit isolated profile');
  if (!profile || typeof profile !== 'object') throw new TypeError('OpenCode ACP profile must be a structured object');
  for (const [key, value] of [
    ['configDir', profile.configDir],
    ['configPath', profile.configPath],
    ['xdgConfigHome', profile.xdgConfigHome],
    ['xdgStateHome', profile.xdgStateHome],
    ['xdgCacheHome', profile.xdgCacheHome],
    ['xdgDataHome', profile.xdgDataHome],
  ]) {
    requireAbsolute(value, `profile.${key}`);
  }
  if (profile.runRoot !== undefined) {
    requireAbsolute(profile.runRoot, 'profile.runRoot');
    for (const [key, value] of [['configDir', profile.configDir], ['configPath', profile.configPath], ['xdgConfigHome', profile.xdgConfigHome], ['xdgStateHome', profile.xdgStateHome], ['xdgCacheHome', profile.xdgCacheHome]]) {
      if (!pathOwnedBy(profile.runRoot, value)) throw new TypeError(`OpenCode ${key} must be runRoot-owned`);
    }
  }
  if (profile.authRoute?.kind === 'REMOTE_CONFIG' || profile.authRoute?.remote === true) {
    throw new Error('OpenCode auth route is remote/well-known; fail-closed without recording secrets');
  }
  return {
    ...cleanEnv,
    OPENCODE_DISABLE_PROJECT_CONFIG: '1',
    XDG_CONFIG_HOME: profile.xdgConfigHome,
    XDG_STATE_HOME: profile.xdgStateHome,
    XDG_CACHE_HOME: profile.xdgCacheHome,
    XDG_DATA_HOME: profile.xdgDataHome,
    OPENCODE_CONFIG_DIR: profile.configDir,
    OPENCODE_CONFIG: profile.configPath,
    OPENCODE_PURE: '1',
  };
}

export function resolveOpenCodeModelFacingInventory({ config = {}, modelEditFamily = 'edit' } = {}) {
  if (!['edit', 'write', 'apply_patch'].includes(modelEditFamily)) {
    throw new TypeError('OpenCode model edit family must be edit, write or apply_patch');
  }
  const tools = config?.tools && typeof config.tools === 'object' ? config.tools : {};
  const permission = config?.permission && typeof config.permission === 'object' ? config.permission : {};
  const modelFacingTools = Object.keys(tools)
    .filter((name) => name !== '*' && tools[name] === true && permission[name] !== 'deny' && permission[name] !== false)
    .filter((name) => permission['*'] !== 'deny' || permission[name] === 'allow')
    .sort();
  const pluginTools = [];
  const mcpTools = [];
  const resolvedTools = [...new Set([...modelFacingTools, ...pluginTools, ...mcpTools])].sort();
  const logicalInventory = resolvedTools.map((name) => {
    if (name === 'read') return 'read_nonce_file';
    if (['edit', 'write', 'apply_patch'].includes(name)) return 'edit_result_file';
    return name;
  }).sort();
  return Object.freeze({
    modelEditFamily,
    modelFacingTools: resolvedTools,
    logicalInventory,
    pluginTools,
    mcpTools,
    source: 'MNFS_TRUSTED_OPENCODE_ISOLATED_PROFILE_PERMISSION_FILTER',
  });
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
  profile,
  beforeSpawn,
  createClient = createAcpStdioClient,
} = {}) {
  requireAbsolute(executable, 'executable');
  requireAbsolute(cwd, 'cwd');
  const explicitEnv = profileEnvironment(requireExplicitEnvironment(env), profile);
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
    ...(profile ? {
      profile: {
        source: 'MNFS_TRUSTED_ISOLATED_PROFILE',
        runRoot: profile.runRoot,
        configDir: profile.configDir,
        configPath: profile.configPath,
        xdgConfigHome: profile.xdgConfigHome,
        xdgStateHome: profile.xdgStateHome,
        xdgCacheHome: profile.xdgCacheHome,
        xdgDataHome: profile.xdgDataHome,
        config: clone(profile.config ?? {}),
        authRoute: openCodeCredentialRouteEvidence(profile.xdgDataHome),
        resolvedInventory: resolveOpenCodeModelFacingInventory({ config: profile.config, modelEditFamily: profile.modelEditFamily ?? 'edit' }),
        discovery: {
          ambientGlobal: 'EXCLUDED_BY_RUN_ROOT_XDG_CONFIG_HOME',
          project: 'EXCLUDED_BY_OPENCODE_DISABLE_PROJECT_CONFIG',
          custom: 'EXCLUDED_BY_OPENCODE_CONFIG_DIR_AND_EXPLICIT_PROFILE',
          plugins: 'DISABLED_BY_EXPLICIT_EMPTY_PLUGIN_LIST',
        },
      },
    } : {}),
    discoveryControlled: Boolean(profile),
    discoveryReason: profile ? 'trusted runRoot-owned XDG/config profile controls global, project and plugin sources' : 'trusted isolated OpenCode profile is unavailable',
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

  async function authenticate(methodId) {
    requireInitialized();
    if (typeof commonClient.authenticate !== 'function') {
      throw new Error('OpenCode ACP client does not expose the public authenticate surface');
    }
    return commonClient.authenticate(methodId);
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
    authenticate,
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
