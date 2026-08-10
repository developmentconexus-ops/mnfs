import { createHash } from 'node:crypto';
import { lstatSync, mkdirSync, readFileSync, readdirSync, realpathSync } from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

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

const AUTH_FILE = 'auth.json';
const FROZEN_PERMISSION_ACTIONS = new Set(['ask', 'allow', 'deny']);
const FROZEN_PROFILE_KEYS = new Set(['model', 'tools', 'permission', 'plugin', 'mcp']);
const FIXED_LOGICAL_INVENTORY = Object.freeze(['edit_result_file', 'read_nonce_file']);

// These are deliberately a small, concrete projection of the accepted frozen
// source, not a second OpenCode implementation. The source loci are:
//   core/src/v1/config/config.ts + config/migrate.ts  (mcp Record, tools -> edit permission)
//   opencode/src/auth/index.ts + config/config.ts     (auth/well-known/account/managed sources)
//   opencode/src/tool/registry.ts                    (built-ins and gpt/apply_patch selection)
//   opencode/src/permission/index.ts + session/llm/request.ts (deny and request filtering)
// at release commit 325529761beb79a004de6d86e48b8db69cf4eba3.

function isRecord(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function frozenManagedConfigDir() {
  if (process.platform === 'linux') return '/etc/opencode';
  if (process.platform === 'darwin') return '/Library/Application Support/opencode';
  if (process.platform === 'win32') return path.join(process.env.ProgramData || 'C:\\ProgramData', 'opencode');
  return '/etc/opencode';
}

function authKind(value) {
  if (!isRecord(value) || typeof value.type !== 'string') return null;
  if (value.type === 'oauth'
    && typeof value.refresh === 'string'
    && typeof value.access === 'string'
    && Number.isSafeInteger(value.expires)
    && value.expires >= 0) return 'oauth';
  if (value.type === 'api' && typeof value.key === 'string') return 'api';
  if (value.type === 'wellknown'
    && typeof value.key === 'string'
    && typeof value.token === 'string') return 'wellknown';
  return null;
}

function inspectAuthStorage(dataRoot) {
  const authPath = path.join(dataRoot, AUTH_FILE);
  let stats;
  try {
    stats = lstatSync(authPath);
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return Object.freeze({
        path: authPath,
        present: false,
        kinds: [],
        ignoredInvalidEntries: 0,
        remoteConfigStatus: 'CONTROLLED',
        discoveryControlled: true,
        reason: 'frozen Auth.all has no auth storage to load',
      });
    }
    return Object.freeze({
      path: authPath,
      present: true,
      kinds: [],
      ignoredInvalidEntries: 0,
      remoteConfigStatus: 'UNCONTROLLED',
      discoveryControlled: false,
      reason: 'auth storage metadata could not be inspected',
    });
  }
  if (!stats.isFile() || realpathSync(authPath) !== authPath) {
    return Object.freeze({
      path: authPath,
      present: true,
      kinds: [],
      ignoredInvalidEntries: 0,
      remoteConfigStatus: 'UNCONTROLLED',
      discoveryControlled: false,
      reason: 'frozen Auth.all reads auth.json, but its route is not a regular file',
    });
  }

  let raw;
  try {
    raw = JSON.parse(readFileSync(authPath, 'utf8'));
  } catch {
    // Auth.all catches a JSON read/decode failure and falls back to an empty record.
    return Object.freeze({
      path: authPath,
      present: true,
      kinds: [],
      ignoredInvalidEntries: 0,
      remoteConfigStatus: 'CONTROLLED',
      discoveryControlled: true,
      reason: 'frozen Auth.all ignores malformed auth storage',
    });
  }

  const kinds = [];
  let ignoredInvalidEntries = 0;
  for (const value of Object.values(isRecord(raw) ? raw : {})) {
    const kind = authKind(value);
    if (kind) kinds.push(kind);
    else ignoredInvalidEntries += 1;
  }
  kinds.sort();
  const remote = kinds.includes('wellknown');
  return Object.freeze({
    path: authPath,
    present: true,
    kinds,
    ignoredInvalidEntries,
    remoteConfigStatus: remote ? 'REMOTE_CAPABLE' : 'CONTROLLED',
    discoveryControlled: !remote,
    reason: remote
      ? 'frozen config loading fetches well-known remote configuration for a wellknown auth entry'
      : 'frozen config loading does not fetch well-known configuration for OAuth/API auth entries',
  });
}

function inspectAccountStorage(databasePath, databaseMode = 'FILE') {
  const base = {
    databasePath,
    databaseMode,
    present: false,
    activeAccountPresent: false,
    activeOrgPresent: false,
  };
  if (databaseMode === 'MEMORY') {
    return Object.freeze({
      ...base,
      discoveryStatus: 'CONTROLLED_BY_DATABASE_ROUTE',
      discoveryControlled: true,
      reason: 'frozen Database.path is forced to the upstream-supported :memory: route',
    });
  }
  if (databasePath === ':memory:') {
    return Object.freeze({
      ...base,
      discoveryStatus: 'CONTROLLED_BY_DATABASE_ROUTE',
      discoveryControlled: true,
      reason: 'frozen Database.path is the upstream-supported :memory: route',
    });
  }

  let stats;
  try {
    stats = lstatSync(databasePath);
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return Object.freeze({
        ...base,
        discoveryStatus: 'CONTROLLED_BY_DATABASE_ROUTE',
        discoveryControlled: true,
        reason: 'frozen AccountRepo has no database file to load',
      });
    }
    return Object.freeze({
      ...base,
      present: true,
      discoveryStatus: 'UNCONTROLLED',
      discoveryControlled: false,
      reason: 'account database metadata could not be inspected',
    });
  }
  if (!stats.isFile() || realpathSync(databasePath) !== databasePath) {
    return Object.freeze({
      ...base,
      present: true,
      discoveryStatus: 'UNCONTROLLED',
      discoveryControlled: false,
      reason: 'account database route is not a regular file',
    });
  }

  let db;
  try {
    db = new DatabaseSync(databasePath, { readOnly: true });
    const tables = new Set(db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all().map((row) => row.name));
    if (!tables.has('account_state') || !tables.has('account')) {
      return Object.freeze({
        ...base,
        present: true,
        discoveryStatus: 'CONTROLLED_BY_DATABASE_ROUTE',
        discoveryControlled: true,
        reason: 'frozen AccountRepo has no usable account state tables',
      });
    }
    const state = db.prepare('SELECT active_account_id, active_org_id FROM account_state WHERE id = 1').get();
    const account = state?.active_account_id
      ? db.prepare('SELECT id FROM account WHERE id = ?').get(state.active_account_id)
      : undefined;
    const activeAccountPresent = Boolean(account);
    const activeOrgPresent = activeAccountPresent && typeof state?.active_org_id === 'string' && state.active_org_id.length > 0;
    return Object.freeze({
      ...base,
      present: true,
      activeAccountPresent,
      activeOrgPresent,
      discoveryStatus: activeOrgPresent ? 'REMOTE_CAPABLE' : 'CONTROLLED_BY_DATABASE_ROUTE',
      discoveryControlled: !activeOrgPresent,
      reason: activeOrgPresent
        ? 'frozen Config.loadActiveOrgConfig fetches account configuration for an active organization'
        : 'frozen AccountRepo has no active organization capable of loading account configuration',
    });
  } catch {
    return Object.freeze({
      ...base,
      present: true,
      discoveryStatus: 'UNCONTROLLED',
      discoveryControlled: false,
      reason: 'account database is not a readable frozen OpenCode database',
    });
  } finally {
    db?.close();
  }
}

function inspectManagedConfig(managedConfigDir) {
  const files = [];
  try {
    const dirStats = lstatSync(managedConfigDir);
    if (!dirStats.isDirectory()) throw new Error('managed config path is not a directory');
    for (const name of ['opencode.json', 'opencode.jsonc']) {
      try {
        const stats = lstatSync(path.join(managedConfigDir, name));
        files.push({ name, type: stats.isFile() ? 'file' : stats.isDirectory() ? 'directory' : 'other' });
      } catch (error) {
        if (error?.code !== 'ENOENT') throw error;
      }
    }
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return Object.freeze({ path: managedConfigDir, present: false, files: [], discoveryControlled: true, reason: 'frozen managed directory is absent' });
    }
    return Object.freeze({ path: managedConfigDir, present: true, files: [], discoveryControlled: false, reason: 'frozen managed directory metadata could not be inspected' });
  }
  const present = files.length > 0;
  return Object.freeze({
    path: managedConfigDir,
    present,
    files,
    discoveryControlled: !present,
    reason: present
      ? 'frozen config loading merges managed opencode.json/opencode.jsonc after account configuration'
      : 'frozen managed directory contains no configuration file read by OpenCode',
  });
}

export function inspectOpenCodeConfigSources({ dataRoot, managedConfigDir = frozenManagedConfigDir(), databasePath, databaseMode = 'FILE' } = {}) {
  requireAbsolute(dataRoot, 'dataRoot');
  requireAbsolute(managedConfigDir, 'managedConfigDir');
  const resolvedDatabasePath = databasePath ?? path.join(dataRoot, 'opencode.db');
  const auth = inspectAuthStorage(dataRoot);
  const account = inspectAccountStorage(resolvedDatabasePath, databaseMode);
  const managed = inspectManagedConfig(managedConfigDir);
  const discoveryControlled = auth.discoveryControlled && account.discoveryControlled && managed.discoveryControlled;
  return Object.freeze({
    auth,
    account,
    managed,
    discoveryControlled,
    reason: discoveryControlled
      ? 'frozen auth, account and managed configuration sources are bounded'
      : [auth, account, managed].filter((item) => !item.discoveryControlled).map((item) => item.reason).join('; '),
  });
}

function validatePermissionConfig(value) {
  if (typeof value === 'string') {
    if (!FROZEN_PERMISSION_ACTIONS.has(value)) throw new TypeError('OpenCode profile permission action is invalid');
    return;
  }
  if (!isRecord(value)) throw new TypeError('OpenCode profile permission must be a frozen permission record');
  for (const rule of Object.values(value)) {
    if (typeof rule === 'string') {
      if (!FROZEN_PERMISSION_ACTIONS.has(rule)) throw new TypeError('OpenCode profile permission action is invalid');
      continue;
    }
    if (!isRecord(rule) || Object.values(rule).some((action) => !FROZEN_PERMISSION_ACTIONS.has(action))) {
      throw new TypeError('OpenCode profile permission pattern is invalid');
    }
  }
}

function validateMcpConfig(value) {
  if (!isRecord(value)) throw new TypeError('OpenCode profile MCP must be a frozen record/map, not an array');
  for (const server of Object.values(value)) {
    if (!isRecord(server)) throw new TypeError('OpenCode profile MCP server must be a record');
    if (server.enabled !== undefined && typeof server.enabled !== 'boolean') throw new TypeError('OpenCode profile MCP enabled must be boolean');
    if (server.type === undefined) {
      if (Object.keys(server).some((key) => key !== 'enabled')) throw new TypeError('OpenCode profile MCP server shape is invalid');
      continue;
    }
    if (server.type === 'local' && (!Array.isArray(server.command) || server.command.some((item) => typeof item !== 'string'))) {
      throw new TypeError('OpenCode profile local MCP command shape is invalid');
    }
    if (server.type === 'remote' && typeof server.url !== 'string') throw new TypeError('OpenCode profile remote MCP URL is invalid');
    if (!['local', 'remote'].includes(server.type)) throw new TypeError('OpenCode profile MCP type is invalid');
  }
}

function validateFrozenProfileConfig(config) {
  if (!isRecord(config)) throw new TypeError('OpenCode profile config must be a frozen record');
  for (const key of Object.keys(config)) {
    if (!FROZEN_PROFILE_KEYS.has(key)) throw new TypeError(`OpenCode profile field ${key} is outside the trusted frozen subset`);
  }
  if (config.model !== undefined && (typeof config.model !== 'string' || !config.model.includes('/'))) {
    throw new TypeError('OpenCode profile model must be provider/model when configured');
  }
  if (config.tools !== undefined && (!isRecord(config.tools) || Object.values(config.tools).some((value) => typeof value !== 'boolean'))) {
    throw new TypeError('OpenCode profile tools must be a boolean record');
  }
  if (config.permission !== undefined) validatePermissionConfig(config.permission);
  if (!Array.isArray(config.plugin)) throw new TypeError('OpenCode profile plugin must be an array');
  for (const plugin of config.plugin) {
    if (typeof plugin === 'string') continue;
    if (!Array.isArray(plugin) || typeof plugin[0] !== 'string') throw new TypeError('OpenCode profile plugin spec is invalid');
  }
  validateMcpConfig(config.mcp);
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

function controlledHome(runRoot, requestedHome, { create = false } = {}) {
  const home = requestedHome ?? path.join(runRoot, 'opencode-home');
  requireAbsolute(home, 'profile.home');
  if (home === runRoot || !pathOwnedBy(runRoot, home)) {
    throw new TypeError('OpenCode profile.home must be a dedicated runRoot-owned directory');
  }
  if (create) {
    try {
      lstatSync(home);
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error;
      mkdirSync(home, { recursive: true, mode: 0o700 });
    }
  }
  requireOwnedDirectory(home, 'home');
  const entries = readdirSync(home).sort();
  const opencodePath = path.join(home, '.opencode');
  let opencodeEntries = [];
  if (entries.includes('.opencode')) {
    requireOwnedDirectory(opencodePath, 'home/.opencode');
    opencodeEntries = readdirSync(opencodePath).sort();
    for (const entry of opencodeEntries) {
      if (!['tool', 'tools'].includes(entry)) throw new Error('OpenCode HOME/.opencode contains uncontrolled discovery entries');
      const directory = path.join(opencodePath, entry);
      requireOwnedDirectory(directory, `home/.opencode/${entry}`);
      if (readdirSync(directory).length > 0) throw new Error('OpenCode HOME custom tool discovery is not controlled');
    }
  }
  return Object.freeze({
    path: home,
    directory: true,
    symlink: false,
    discoveryControlled: true,
    entries,
    opencodeEntries,
    customToolFiles: [],
    reason: 'dedicated HOME and HOME/.opencode tool directories are absent or reviewed empty',
  });
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
  validateFrozenProfileConfig(config);
  const model = config.model === undefined ? null : (() => {
    const modelSeparator = config.model.indexOf('/');
    return Object.freeze({
      providerID: config.model.slice(0, modelSeparator),
      modelID: config.model.slice(modelSeparator + 1),
    });
  })();
  if (model && (!model.providerID || !model.modelID)) throw new TypeError('OpenCode profile model must contain provider and model IDs');
  const dataRoot = path.join(profile.xdgDataHome, 'opencode');
  const configSources = inspectOpenCodeConfigSources({
    dataRoot,
    managedConfigDir: frozenManagedConfigDir(),
    databasePath: path.join(dataRoot, 'opencode.db'),
    databaseMode: 'MEMORY',
  });
  return Object.freeze({
    config: clone(config),
    model,
    binding: Object.freeze({
      path: profile.configPath,
      hash,
      sizeBytes: bytes.length,
      mode: '0600',
    }),
    authRouteInspection: configSources.auth,
    configSources,
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

export function projectOpenCodeEnvironment({ baseEnvironment, profile } = {}) {
  const cleanEnv = Object.fromEntries(Object.entries(requireExplicitEnvironment(baseEnvironment)).filter(([key]) => !key.startsWith('OPENCODE_')
    && !['HOME', 'XDG_CONFIG_HOME', 'XDG_STATE_HOME', 'XDG_CACHE_HOME', 'XDG_DATA_HOME'].includes(key)));
  const home = profile.home ?? path.join(profile.runRoot, 'opencode-home');
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
    OPENCODE_DISABLE_DEFAULT_PLUGINS: '1',
    OPENCODE_DB: ':memory:',
    OPENCODE_CLIENT: 'acp',
    OPENCODE_EXPERIMENTAL: '0',
    OPENCODE_ENABLE_EXA: '0',
    OPENCODE_EXPERIMENTAL_EXA: '0',
    OPENCODE_ENABLE_PARALLEL: '0',
    OPENCODE_EXPERIMENTAL_PARALLEL: '0',
    OPENCODE_ENABLE_QUESTION_TOOL: '0',
    OPENCODE_EXPERIMENTAL_LSP_TOOL: '0',
    OPENCODE_EXPERIMENTAL_PLAN_MODE: '0',
    OPENCODE_EXPERIMENTAL_CODE_MODE: '0',
    HOME: home,
  };
}

function profileEnvironment(env, profile) {
  if (profile === undefined) throw new TypeError('OpenCode ACP requires an explicit isolated profile');
  for (const [key, value] of [
    ['configDir', profile.configDir],
    ['configPath', profile.configPath],
    ['xdgConfigHome', profile.xdgConfigHome],
    ['xdgStateHome', profile.xdgStateHome],
    ['xdgCacheHome', profile.xdgCacheHome],
    ['xdgDataHome', profile.xdgDataHome],
    ['home', profile.home ?? path.join(profile.runRoot, 'opencode-home')],
  ]) {
    requireAbsolute(value, `profile.${key}`);
  }
  requireAbsolute(profile.runRoot, 'profile.runRoot');
  for (const [key, value] of [['configDir', profile.configDir], ['configPath', profile.configPath], ['xdgConfigHome', profile.xdgConfigHome], ['xdgStateHome', profile.xdgStateHome], ['xdgCacheHome', profile.xdgCacheHome]]) {
    if (!pathOwnedBy(profile.runRoot, value)) throw new TypeError(`OpenCode ${key} must be runRoot-owned`);
  }
  const home = profile.home ?? path.join(profile.runRoot, 'opencode-home');
  const homeDiscovery = controlledHome(profile.runRoot, home, { create: true });
  const bound = bindProfile({ ...profile, home });
  return {
    profile: { ...bound, home },
    homeDiscovery,
    env: projectOpenCodeEnvironment({ baseEnvironment: env, profile: { ...profile, home } }),
  };
}

function wildcardMatch(value, pattern) {
  if (pattern === '*') return true;
  const escaped = String(pattern).replace(/[.+^${}()|[\]\\]/gu, '\\$&').replaceAll('*', '.*');
  return new RegExp(`^${escaped}$`, 'u').test(value);
}

function frozenPermissionRules(config) {
  const rules = [];
  for (const [name, enabled] of Object.entries(config.tools ?? {})) {
    rules.push({ permission: name === 'write' || name === 'patch' ? 'edit' : name, pattern: '*', action: enabled ? 'allow' : 'deny' });
  }
  const permission = config.permission ?? {};
  if (typeof permission === 'string') {
    rules.push({ permission: '*', pattern: '*', action: permission });
  } else {
    for (const [name, rule] of Object.entries(permission)) {
      if (typeof rule === 'string') {
        rules.push({ permission: name, pattern: '*', action: rule });
      } else {
        for (const [pattern, action] of Object.entries(rule)) rules.push({ permission: name, pattern, action });
      }
    }
  }
  return rules;
}

function frozenPermissionName(tool) {
  if (['edit', 'write', 'apply_patch'].includes(tool)) return 'edit';
  if (['list_mcp_resources', 'list_mcp_resource_templates', 'read_mcp_resource'].includes(tool)) return 'read';
  return tool;
}

function frozenToolDisabled(tool, rules) {
  const permission = frozenPermissionName(tool);
  const rule = [...rules].reverse().find((candidate) => wildcardMatch(permission, candidate.permission));
  return rule?.pattern === '*' && rule.action === 'deny';
}

function frozenModelTools({ model, flags }) {
  const usePatch = model.modelID.includes('gpt-')
    && !model.modelID.includes('oss')
    && !model.modelID.includes('gpt-4');
  const tools = [
    'invalid',
    ...(flags.client === 'app' || flags.client === 'cli' || flags.client === 'desktop' || flags.enableQuestionTool ? ['question'] : []),
    'bash',
    'read',
    'glob',
    'grep',
    ...(usePatch ? [] : ['edit', 'write']),
    'task',
    'webfetch',
    'todowrite',
    ...(flags.providerID === 'opencode' || flags.enableExa || flags.enableParallel ? ['websearch'] : []),
    'skill',
    ...(usePatch ? ['apply_patch'] : []),
    ...(flags.experimentalLspTool ? ['lsp'] : []),
    ...(flags.experimentalPlanMode && flags.client === 'cli' ? ['plan'] : []),
  ];
  return [...new Set(tools)];
}

function parseModelSelection(config, model) {
  if (model !== undefined) {
    if (!isRecord(model) || typeof model.providerID !== 'string' || typeof model.modelID !== 'string'
      || !model.providerID || !model.modelID) return null;
    return Object.freeze({ providerID: model.providerID, modelID: model.modelID });
  }
  if (typeof config.model !== 'string') return null;
  const selected = model ?? (() => {
    const separator = config.model.indexOf('/');
    return { providerID: config.model.slice(0, separator), modelID: config.model.slice(separator + 1) };
  })();
  if (!isRecord(selected) || typeof selected.providerID !== 'string' || typeof selected.modelID !== 'string'
    || !selected.providerID || !selected.modelID) return null;
  const expected = `${selected.providerID}/${selected.modelID}`;
  if (expected !== config.model) return null;
  return Object.freeze({ providerID: selected.providerID, modelID: selected.modelID });
}

function activeMcpServers(config) {
  return Object.entries(config.mcp).filter(([, server]) => server.type && server.enabled !== false).map(([name]) => name).sort();
}

export function resolveOpenCodeModelFacingInventory({ config = {}, model, pure = false, flags = {} } = {}) {
  validateFrozenProfileConfig(config);
  const selectedModel = parseModelSelection(config, model);
  if (!selectedModel) {
    return Object.freeze({
      status: 'BLOCKED',
      reason: 'frozen OpenCode ToolRegistry requires the exact provider/model selection used by the run',
      configuredPluginSpecs: config.plugin.map((entry) => typeof entry === 'string' ? entry : entry[0]),
      configuredMcpServers: Object.keys(config.mcp).sort(),
      source: 'MNFS_TRUSTED_OPENCODE_FROZEN_V1_18_15_TOOLREGISTRY_AND_REQUEST_FILTER',
    });
  }
  const runtimeFlags = {
    client: 'acp',
    enableExa: false,
    enableParallel: false,
    enableQuestionTool: false,
    experimentalLspTool: false,
    experimentalPlanMode: false,
    ...flags,
    providerID: selectedModel.providerID,
  };
  const configuredPluginSpecs = config.plugin.map((entry) => typeof entry === 'string' ? entry : entry[0]).sort();
  const configuredMcpServers = Object.keys(config.mcp).sort();
  const activeServers = activeMcpServers(config);
  if (configuredPluginSpecs.length > 0 && !pure) {
    return Object.freeze({
      status: 'BLOCKED',
      reason: 'frozen plugin registry tool IDs require loading the configured external plugin; no plugin was loaded by this deterministic harness',
      configuredPluginSpecs,
      configuredMcpServers,
      source: 'MNFS_TRUSTED_OPENCODE_FROZEN_V1_18_15_TOOLREGISTRY_AND_REQUEST_FILTER',
    });
  }
  if (activeServers.length > 0) {
    return Object.freeze({
      status: 'BLOCKED',
      reason: 'frozen MCP registry tool IDs require observing tools/list from the configured MCP server',
      configuredPluginSpecs,
      configuredMcpServers,
      activeMcpServers: activeServers,
      source: 'MNFS_TRUSTED_OPENCODE_FROZEN_V1_18_15_TOOLREGISTRY_AND_REQUEST_FILTER',
    });
  }

  const rules = frozenPermissionRules(config);
  const modelTools = frozenModelTools({ model: selectedModel, flags: runtimeFlags });
  const modelFacingTools = modelTools.filter((tool) => !frozenToolDisabled(tool, rules)).sort();
  const editFamily = selectedModel.modelID.includes('gpt-')
    && !selectedModel.modelID.includes('oss')
    && !selectedModel.modelID.includes('gpt-4')
    ? 'apply_patch'
    : 'edit';
  const logicalInventory = modelFacingTools.map((name) => {
    if (name === 'read') return 'read_nonce_file';
    if (name === editFamily) return 'edit_result_file';
    if (['edit', 'write', 'apply_patch'].includes(name)) return `model_edit:${name}`;
    return name;
  }).sort();
  const matchesFixture = JSON.stringify(logicalInventory) === JSON.stringify([...FIXED_LOGICAL_INVENTORY].sort());
  return Object.freeze({
    status: matchesFixture ? 'PASS' : 'FAIL',
    model: selectedModel,
    modelEditFamily: editFamily,
    modelFacingEditTool: modelFacingTools.includes(editFamily),
    modelFacingTools,
    logicalInventory,
    configuredPluginSpecs,
    configuredMcpServers,
    pluginTools: pure ? [] : configuredPluginSpecs,
    mcpTools: [],
    source: 'MNFS_TRUSTED_OPENCODE_FROZEN_V1_18_15_TOOLREGISTRY_AND_REQUEST_FILTER',
  });
}

function parseSessionModel(newSessionResponse) {
  const option = newSessionResponse?.configOptions?.find((candidate) => candidate?.id === 'model');
  const currentValue = option?.currentValue;
  if (typeof currentValue !== 'string') return null;
  const separator = currentValue.indexOf('/');
  if (separator <= 0 || separator === currentValue.length - 1) return null;
  return Object.freeze({
    providerID: currentValue.slice(0, separator),
    modelID: currentValue.slice(separator + 1),
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
        home: profileResult.profile.home,
        homeDiscovery: profileResult.homeDiscovery,
        config: clone(profileResult.profile.config),
        configBinding: profileResult.profile.binding,
        authRoute: openCodeCredentialRouteEvidence(profile.xdgDataHome),
        authRouteInspection: profileResult.profile.authRouteInspection,
        configSources: profileResult.profile.configSources,
        requestedModel: profileResult.profile.model,
        resolvedInventory: null,
        environmentProjection: {
          source: 'MNFS_TRUSTED_OPENCODE_REVIEWED_PROCESS_ENVIRONMENT',
          envDigest: `sha256:${createHash('sha256').update(JSON.stringify(Object.fromEntries(Object.entries(explicitEnv).sort()))).digest('hex')}`,
          envKeys: Object.keys(explicitEnv).sort(),
        },
        discovery: {
          ambientGlobal: 'EXCLUDED_BY_RUN_ROOT_XDG_CONFIG_HOME',
          project: 'EXCLUDED_BY_OPENCODE_DISABLE_PROJECT_CONFIG',
          custom: 'EXCLUDED_BY_OPENCODE_CONFIG_DIR_AND_EXPLICIT_PROFILE',
          plugins: profileResult.profile.config.plugin.length === 0
            ? 'DISABLED_BY_EXPLICIT_EMPTY_PLUGIN_LIST'
            : 'DISABLED_BY_FROZEN_OPENCODE_PURE',
          configSources: profileResult.profile.configSources,
          home: profileResult.homeDiscovery,
        },
      },
    } : {}),
    discoveryControlled: Boolean(profile) && profileResult.profile.configSources.discoveryControlled,
    discoveryReason: profile
      ? profileResult.profile.configSources.reason
      : 'trusted isolated OpenCode profile is unavailable',
  });

  let commonClient = null;
  let initialized = false;
  let closed = false;
  let clientPromise = null;

  const revalidateBeforeSpawn = async () => {
    controlledHome(profileResult.profile.runRoot, profileResult.profile.home);
    await beforeSpawn?.();
  };

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
        beforeSpawn: revalidateBeforeSpawn,
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
    const session = await commonClient.startSession(input);
    const actualModel = parseSessionModel(session?.newSessionResponse);
    const modelFacingInventory = resolveOpenCodeModelFacingInventory({
      config: profileResult.profile.config,
      model: actualModel,
      pure: true,
      flags: {
        client: 'acp',
        enableExa: false,
        enableParallel: false,
        enableQuestionTool: false,
        experimentalLspTool: false,
        experimentalPlanMode: false,
      },
    });
    return Object.freeze({
      ...session,
      actualModel,
      requestedModel: profileResult.profile.model,
      modelFacingInventory,
    });
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
