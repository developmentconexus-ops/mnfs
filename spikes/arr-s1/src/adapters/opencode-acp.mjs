import { createHash } from 'node:crypto';
import { lstatSync, readFileSync, readdirSync, realpathSync } from 'node:fs';
import path from 'node:path';

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

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])]));
}

function containsCredentialKey(value, seen = new Set()) {
  if (!value || typeof value !== 'object' || seen.has(value)) return false;
  seen.add(value);
  for (const [key, child] of Object.entries(value)) {
    if (/token|secret|api[_-]?key|oauth|authorization|credential|password|cookie/iu.test(key)) return true;
    if (containsCredentialKey(child, seen)) return true;
  }
  return false;
}

function inspectAuthRouteMetadata(root) {
  const route = requireOpenCodeDataRoute(root);
  let entries;
  try {
    entries = readdirSync(route, { withFileTypes: true }).map((entry) => {
      const entryPath = `${route}/${entry.name}`;
      const stats = lstatSync(entryPath);
      return {
        name: entry.name,
        type: entry.isDirectory() ? 'directory' : entry.isFile() ? 'file' : 'other',
        sizeBytes: stats.size,
        mode: `0${(stats.mode & 0o777).toString(8).padStart(3, '0')}`,
      };
    }).sort((left, right) => left.name.localeCompare(right.name));
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
    return Object.freeze({
      root: route,
      exists: false,
      entries: [],
      remoteConfigStatus: 'NOT_OBSERVED',
      discoveryControlled: true,
      reason: 'authorized auth route is absent; no remote metadata was observed',
    });
  }
  const remoteEntry = entries.find(({ name }) => name === 'auth.json'
    || /well[-_]?known|remote|account|organization|org|config/iu.test(name));
  return Object.freeze({
    root: route,
    exists: true,
    entries,
    remoteConfigStatus: remoteEntry ? 'PRESENT_UNINSPECTED' : 'NOT_OBSERVED',
    discoveryControlled: !remoteEntry,
    reason: remoteEntry
      ? 'authorized auth route contains auth/remote metadata whose configuration effect was not neutralized'
      : 'authorized auth route contains no known auth/remote metadata',
  });
}

function requireOwnedDirectory(root, name) {
  const stats = lstatSync(root);
  if (!stats.isDirectory() || realpathSync(root) !== root) {
    throw new Error(`OpenCode ${name} must be a regular non-symlink directory`);
  }
}

function requireEmptyDirectory(root, name) {
  try {
    requireOwnedDirectory(root, name);
  } catch (error) {
    if (error?.code === 'ENOENT') return;
    throw error;
  }
  if (readdirSync(root).length !== 0) {
    throw new Error(`OpenCode ${name} contains uncontrolled configuration entries`);
  }
}

function bindProfile(profile) {
  if (!profile || typeof profile !== 'object') throw new TypeError('OpenCode ACP profile must be a structured object');
  if (!/^sha256:[a-f0-9]{64}$/u.test(profile.configHash ?? '')) {
    throw new TypeError('OpenCode profile config hash is required');
  }
  if (!Number.isSafeInteger(profile.configSizeBytes) || profile.configSizeBytes < 0) {
    throw new TypeError('OpenCode profile config size is required');
  }
  if (profile.configMode !== '0600') throw new TypeError('OpenCode profile config mode must be 0600');
  requireOwnedDirectory(profile.configDir, 'configDir');
  if (!pathOwnedBy(profile.configDir, profile.configPath)) {
    throw new Error('OpenCode profile configPath must be inside configDir');
  }
  const configEntry = path.relative(profile.configDir, profile.configPath);
  if (configEntry.includes('/') || readdirSync(profile.configDir).some((entry) => entry !== configEntry)) {
    throw new Error('OpenCode configDir contains entries outside the bound profile');
  }
  requireEmptyDirectory(profile.xdgConfigHome, 'xdgConfigHome');
  const stats = lstatSync(profile.configPath);
  if (!stats.isFile() || (stats.mode & 0o777) !== 0o600) {
    throw new Error('OpenCode profile config must be a regular 0600 file');
  }
  if (realpathSync(profile.configPath) !== profile.configPath) {
    throw new Error('OpenCode profile config must not be a symlink');
  }
  const bytes = readFileSync(profile.configPath);
  const hash = `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
  if (bytes.length !== profile.configSizeBytes || hash !== profile.configHash) {
    throw new Error('OpenCode profile config binding mismatch');
  }
  let config;
  try {
    config = JSON.parse(bytes.toString('utf8'));
  } catch {
    throw new Error('OpenCode profile config is not valid JSON');
  }
  if (containsCredentialKey(config) || containsCredentialKey(profile.config)) {
    throw new Error('OpenCode profile refuses credential material');
  }
  if (JSON.stringify(canonical(config)) !== JSON.stringify(canonical(profile.config))) {
    throw new Error('OpenCode profile input diverges from written config');
  }
  if (!Array.isArray(config.plugin) || config.plugin.length !== 0) {
    throw new Error('OpenCode profile plugin list must be exactly empty');
  }
  if (!Array.isArray(config.mcp) || config.mcp.length !== 0) {
    throw new Error('OpenCode profile MCP list must be exactly empty');
  }
  return Object.freeze({
    config: clone(config),
    binding: Object.freeze({
      path: profile.configPath,
      hash,
      sizeBytes: bytes.length,
      mode: '0600',
    }),
    authRouteInspection: inspectAuthRouteMetadata(profile.xdgDataHome),
  });
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
  const cleanEnv = Object.fromEntries(Object.entries(env).filter(([key]) => ![
    'OPENCODE_AUTH_CONTENT',
    'OPENCODE_CONFIG_CONTENT',
    'OPENCODE_PERMISSION',
    'OPENCODE_TEST_HOME',
  ].includes(key)));
  if (profile === undefined) throw new TypeError('OpenCode ACP requires an explicit isolated profile');
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
  requireAbsolute(profile.runRoot, 'profile.runRoot');
  for (const [key, value] of [['configDir', profile.configDir], ['configPath', profile.configPath], ['xdgConfigHome', profile.xdgConfigHome], ['xdgStateHome', profile.xdgStateHome], ['xdgCacheHome', profile.xdgCacheHome]]) {
    if (!pathOwnedBy(profile.runRoot, value)) throw new TypeError(`OpenCode ${key} must be runRoot-owned`);
  }
  if (profile.authRoute?.kind === 'REMOTE_CONFIG' || profile.authRoute?.remote === true) {
    throw new Error('OpenCode auth route is remote/well-known; fail-closed without recording secrets');
  }
  const bound = bindProfile(profile);
  return {
    profile: bound,
    env: {
    ...cleanEnv,
    OPENCODE_DISABLE_PROJECT_CONFIG: '1',
    XDG_CONFIG_HOME: profile.xdgConfigHome,
    XDG_STATE_HOME: profile.xdgStateHome,
    XDG_CACHE_HOME: profile.xdgCacheHome,
    XDG_DATA_HOME: profile.xdgDataHome,
    OPENCODE_CONFIG_DIR: profile.configDir,
    OPENCODE_CONFIG: profile.configPath,
    OPENCODE_PURE: '1',
    ...(profile.runRoot ? { HOME: profile.runRoot } : {}),
    },
  };
}

function configuredToolNames(value, prefix) {
  if (Array.isArray(value)) {
    return value.map((entry) => {
      const name = typeof entry === 'string' ? entry : entry?.name;
      return typeof name === 'string' && name.length > 0 ? `${prefix}:${name}` : `${prefix}:UNNAMED`;
    });
  }
  if (value && typeof value === 'object') return Object.keys(value).map((name) => `${prefix}:${name}`);
  return [];
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
  const pluginTools = configuredToolNames(config?.plugin, 'plugin').sort();
  const mcpTools = configuredToolNames(config?.mcp, 'mcp').sort();
  const resolvedTools = [...new Set([...modelFacingTools, ...pluginTools, ...mcpTools])].sort();
  const editFamilies = new Set(['edit', 'write', 'apply_patch']);
  const logicalInventory = resolvedTools.map((name) => {
    if (name === 'read') return 'read_nonce_file';
    if (editFamilies.has(name)) return name === modelEditFamily ? 'edit_result_file' : `model_edit:${name}`;
    return name;
  }).sort();
  return Object.freeze({
    modelEditFamily,
    modelFacingEditTool: resolvedTools.includes(modelEditFamily),
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
  const profileResult = profileEnvironment(requireExplicitEnvironment(env), profile);
  const explicitEnv = profileResult.env;
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
        config: clone(profileResult.profile.config),
        configBinding: profileResult.profile.binding,
        authRoute: openCodeCredentialRouteEvidence(profile.xdgDataHome),
        authRouteInspection: profileResult.profile.authRouteInspection,
        resolvedInventory: resolveOpenCodeModelFacingInventory({ config: profileResult.profile.config, modelEditFamily: profile.modelEditFamily ?? 'edit' }),
        discovery: {
          ambientGlobal: 'EXCLUDED_BY_RUN_ROOT_XDG_CONFIG_HOME',
          project: 'EXCLUDED_BY_OPENCODE_DISABLE_PROJECT_CONFIG',
          custom: 'EXCLUDED_BY_OPENCODE_CONFIG_DIR_AND_EXPLICIT_PROFILE',
          plugins: profileResult.profile.config.plugin.length === 0
            ? 'DISABLED_BY_EXPLICIT_EMPTY_PLUGIN_LIST'
            : 'BLOCKED_BY_NON_EMPTY_PLUGIN_LIST',
        },
      },
    } : {}),
    discoveryControlled: Boolean(profile) && profileResult.profile.authRouteInspection.discoveryControlled,
    discoveryReason: profile
      ? profileResult.profile.authRouteInspection.reason
      : 'trusted isolated OpenCode profile is unavailable',
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
