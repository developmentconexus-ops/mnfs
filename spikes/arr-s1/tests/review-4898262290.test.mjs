import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';

import { createPiSdkAdapter } from '../src/adapters/pi-sdk.mjs';
import {
  createOpenCodeAcpAdapter,
  inspectOpenCodeConfigSources,
  resolveOpenCodeModelFacingInventory,
} from '../src/adapters/opencode-acp.mjs';
import { buildProofs, safeProvenanceEvidence } from '../src/executors.mjs';
import { requireCredentialRouteBinding } from '../src/credential-routes.mjs';
import { S1_FROZEN_CANDIDATE_PROVENANCE, preflightS1 } from '../src/preflight.mjs';
import { parseExecutionAuthorizationToken } from '../src/execution-authority.mjs';

const ROUTE = '/tmp/mnfs-arr-s1-review-credentials';
const DATA_ROUTE = '/tmp/mnfs-arr-s1-review-opencode-data';
const BASE_SHA = 'a'.repeat(40);
const PLAN_BLOB = '277dffc521754a4370bfd94132dc9467589fdcf0';
const CONTRACT_HASH = 'sha256:bd34f566bec1c3fc32b8ab1617dac88f997ab9a91cbc6b83e42eb27dcbf9736a';
const AUTHORITY = parseExecutionAuthorizationToken(
  `MNFS_AUTHORIZE_ARR_S1_EXECUTE plan_blob=${PLAN_BLOB} contract_sha256=${CONTRACT_HASH} base_sha=${BASE_SHA} verify_run=987654321 scope=pi-first-runtime-conformance`,
);

const SOURCE = Object.freeze({ clean: true, commitSha: BASE_SHA, treeSha: 'a'.repeat(40), platform: 'linux' });
const STATE_ROOT = Object.freeze({
  path: '/tmp/mnfs-arr-s1-review-state',
  realPath: '/tmp/mnfs-arr-s1-review-state',
  platform: 'linux',
  isDirectory: true,
  writable: true,
  filesystem: 'ext2/ext3',
  filesystemSupported: true,
});

const FIXTURE_TOOLS = Object.freeze([
  Object.freeze({ name: 'read_nonce_file', label: 'Read nonce file' }),
  Object.freeze({ name: 'edit_result_file', label: 'Edit result file' }),
  Object.freeze({ name: 'hostile_extra_tool', label: 'Must be filtered' }),
]);

function fakeResourceLoader() {
  return {
    getExtensions: () => ({ extensions: [] }),
    getSkills: () => ({ skills: [] }),
    getPrompts: () => ({ prompts: [] }),
    getThemes: () => ({ themes: [] }),
    getAgentsFiles: () => ({ agentsFiles: [] }),
    getSystemPrompt: () => undefined,
    getSystemPromptSource: () => undefined,
    getAppendSystemPrompt: () => [],
    getAppendSystemPromptSources: () => [],
    extendResources() {},
    reload: async () => {},
  };
}

test('Pi SDK regression proves Pi 0.84.1 agentDir binding and custom-tool allowlist filtering', async () => {
  const calls = [];
  const session = { subscribe: () => () => {}, dispose() {} };
  const sdk = {
    async createAgentSession(options) {
      const visibleCustomTools = options.customTools.filter((tool) => options.tools.includes(tool.name));
      calls.push({ options, visibleCustomTools });
      return { session };
    },
  };
  const adapter = createPiSdkAdapter({
    sdk,
    cwd: '/tmp/mnfs-arr-s1-review-fixture',
    piCodingAgentDir: ROUTE,
    tools: ['read_nonce_file', 'edit_result_file'],
    noTools: 'all',
    customTools: FIXTURE_TOOLS,
    resourceLoader: fakeResourceLoader(),
    sessionManager: {},
  });

  await adapter.initialize();

  assert.equal(calls.length, 1);
  assert.equal(calls[0].options.agentDir, ROUTE);
  assert.deepEqual(calls[0].options.tools, ['read_nonce_file', 'edit_result_file']);
  assert.deepEqual(calls[0].visibleCustomTools.map((tool) => tool.name), [
    'read_nonce_file',
    'edit_result_file',
  ]);
  assert.equal(calls[0].visibleCustomTools.some((tool) => tool.name === 'hostile_extra_tool'), false);
});

function acceptedProvenance(route = ROUTE, dataRoute = DATA_ROUTE) {
  const records = structuredClone(S1_FROZEN_CANDIDATE_PROVENANCE);
  for (const record of Object.values(records)) {
    if (record.candidateShape === 'ACP-SDK') continue;
    record.environment = {
      PATH: '/usr/bin:/bin',
      LANG: 'C',
      LC_ALL: 'C',
      PI_CODING_AGENT_DIR: route,
      XDG_DATA_HOME: dataRoute,
    };
  }
  return {
    trustedBoundary: 'TEST_FAITHFUL_STAGING',
    integrity: { manifestSha256: `sha256:${'a'.repeat(64)}` },
    records,
  };
}

test('credential route binding blocks staged divergence and requires all three route identities before spawn', async () => {
  const result = await preflightS1({
    executionAuthorization: AUTHORITY,
    credentials: {
      authorized: true,
      provider: 'provider-class-fixture',
      authMethodClass: 'operator-supported-login',
      piCodingAgentDir: ROUTE,
      xdgDataHome: DATA_ROUTE,
      providerEnvironment: [],
    },
    observers: {
      source: () => SOURCE,
      stateRoot: () => STATE_ROOT,
      provenance: () => acceptedProvenance('/tmp/mnfs-arr-s1-staged-divergence', DATA_ROUTE),
    },
  });

  assert.equal(result.status, 'BLOCKED');
  assert.ok(result.blockers.some((blocker) => blocker.id === 'credentialRoutes'));
  assert.throws(() => requireCredentialRouteBinding({
    candidateShape: 'PI-SDK',
    authorizedRoutes: { pi: { path: ROUTE } },
    stagedEnvironment: { PI_CODING_AGENT_DIR: ROUTE },
    processEnvironment: { PI_CODING_AGENT_DIR: '/tmp/mnfs-arr-s1-redirected' },
  }), /credential route binding/u);
});

test('credential Evidence removes process environment values and retains only authorized route/class metadata', () => {
  const evidence = safeProvenanceEvidence({
    candidateShape: 'PI-SDK',
    environment: {
      PI_CODING_AGENT_DIR: ROUTE,
      FIXTURE_PROVIDER_ENV: 'secret-value-must-not-persist',
    },
    providerEnvironment: [{ name: 'FIXTURE_PROVIDER_ENV', class: 'TEST_DOUBLE', value: 'secret-value-must-not-persist' }],
  }, {
    credentials: {
      routes: {
        pi: { variable: 'PI_CODING_AGENT_DIR', path: ROUTE, class: 'PERSISTED_AGENT_AUTH_DIRECTORY', valueRecorded: false },
      },
      providerEnvironment: [{ name: 'FIXTURE_PROVIDER_ENV', class: 'TEST_DOUBLE', valueRecorded: false }],
    },
  });

  assert.equal('environment' in evidence, false);
  assert.doesNotMatch(JSON.stringify(evidence), /secret-value-must-not-persist/u);
  assert.deepEqual(evidence.credentialRoutes.providerEnvironment, [
    { name: 'FIXTURE_PROVIDER_ENV', class: 'TEST_DOUBLE', valueRecorded: false },
  ]);
});

function profileConfig() {
  return {
    model: 'fixture/gpt-5',
    tools: { '*': false, read: true, edit: true },
    permission: { '*': 'deny', read: 'allow', edit: 'allow' },
    plugin: [],
    mcp: {},
  };
}

async function writeProfile(root, config = profileConfig()) {
  const configDir = path.join(root, 'config');
  const configPath = path.join(configDir, 'config.json');
  const bytes = Buffer.from(`${JSON.stringify(config)}\n`);
  await mkdir(configDir, { recursive: true });
  await writeFile(configPath, bytes, { mode: 0o600 });
  return {
    runRoot: root,
    configDir,
    configPath,
    xdgConfigHome: path.join(root, 'xdg-config'),
    xdgStateHome: path.join(root, 'xdg-state'),
    xdgCacheHome: path.join(root, 'xdg-cache'),
    xdgDataHome: path.join(root, 'xdg-data'),
    config,
    configHash: `sha256:${createHash('sha256').update(bytes).digest('hex')}`,
    configSizeBytes: bytes.length,
    configMode: '0600',
  };
}

function opencodeEnv() {
  return { PATH: '/usr/bin:/bin', HOME: '/tmp/hostile-home', XDG_DATA_HOME: DATA_ROUTE };
}

test('OpenCode normal OAuth/API auth is structural metadata, not automatic remote config', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'mnfs-arr-s1-review-opencode-auth-'));
  try {
    const dataRoot = path.join(root, 'data', 'opencode');
    await mkdir(dataRoot, { recursive: true });
    await writeFile(path.join(dataRoot, 'auth.json'), JSON.stringify({
      fixture: { type: 'api', key: 'secret-value-must-not-persist' },
      oauth: { type: 'oauth', refresh: 'refresh-secret', access: 'access-secret', expires: 1 },
    }), { mode: 0o600 });
    const inspection = inspectOpenCodeConfigSources({
      dataRoot,
      managedConfigDir: path.join(root, 'managed'),
      databasePath: path.join(root, 'missing.db'),
    });

    assert.equal(inspection.auth.remoteConfigStatus, 'CONTROLLED');
    assert.deepEqual(inspection.auth.kinds, ['api', 'oauth']);
    assert.equal(inspection.account.discoveryStatus, 'CONTROLLED_BY_DATABASE_ROUTE');
    assert.equal(inspection.managed.present, false);
    assert.doesNotMatch(JSON.stringify(inspection), /secret-value|refresh-secret|access-secret|token/u);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('OpenCode well-known auth, active organization and managed config cannot silently pass C04', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'mnfs-arr-s1-review-opencode-profile-'));
  try {
    const dataRoot = path.join(root, 'data', 'opencode');
    const managedDir = path.join(root, 'managed');
    const databasePath = path.join(root, 'opencode.db');
    await mkdir(dataRoot, { recursive: true });
    await mkdir(managedDir, { recursive: true });
    await writeFile(path.join(dataRoot, 'auth.json'), JSON.stringify({
      'https://remote.example': { type: 'wellknown', key: 'remote-key', token: 'remote-secret' },
    }), { mode: 0o600 });
    await writeFile(path.join(managedDir, 'opencode.json'), '{"tools":{"hostile":true}}\n', { mode: 0o600 });

    const sqlite = await import('node:sqlite');
    const db = new sqlite.DatabaseSync(databasePath);
    db.exec('CREATE TABLE account (id TEXT PRIMARY KEY, email TEXT NOT NULL, url TEXT NOT NULL, access_token TEXT NOT NULL, refresh_token TEXT NOT NULL, token_expiry INTEGER)');
    db.exec('CREATE TABLE account_state (id INTEGER PRIMARY KEY, active_account_id TEXT, active_org_id TEXT)');
    db.prepare('INSERT INTO account VALUES (?, ?, ?, ?, ?, ?)').run('account-1', 'redacted@example.invalid', 'https://account.example', 'access-secret', 'refresh-secret', 1);
    db.prepare('INSERT INTO account_state VALUES (?, ?, ?)').run(1, 'account-1', 'org-1');
    db.close();

    const inspection = inspectOpenCodeConfigSources({ dataRoot, managedConfigDir: managedDir, databasePath });
    assert.equal(inspection.auth.remoteConfigStatus, 'REMOTE_CAPABLE');
    assert.equal(inspection.account.activeAccountPresent, true);
    assert.equal(inspection.account.activeOrgPresent, true);
    assert.equal(inspection.account.discoveryStatus, 'REMOTE_CAPABLE');
    assert.equal(inspection.managed.present, true);
    assert.equal(inspection.discoveryControlled, false);
    assert.doesNotMatch(JSON.stringify(inspection), /remote-secret|access-secret|refresh-secret/u);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('OpenCode profile binds the frozen map-shaped MCP schema and exact bytes', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'mnfs-arr-s1-review-opencode-profile-'));
  try {
    const invalidMcp = await writeProfile(root, { ...profileConfig(), mcp: [] });
    assert.throws(() => createOpenCodeAcpAdapter({
      executable: '/state/candidates/opencode/bin/opencode',
      cwd: '/tmp/mnfs-arr-s1-review-fixture',
      env: opencodeEnv(),
      profile: invalidMcp,
    }), /mcp.*(record|map|object)|profile/u);

    const exact = await writeProfile(root, profileConfig());
    assert.throws(() => createOpenCodeAcpAdapter({
      executable: '/state/candidates/opencode/bin/opencode',
      cwd: '/tmp/mnfs-arr-s1-review-fixture',
      env: opencodeEnv(),
      profile: { ...exact, config: { ...profileConfig(), mcp: { divergent: { enabled: true } } } },
    }), /profile|config|diverg/u);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('OpenCode inventory follows frozen provider/model ToolRegistry and request filtering semantics', () => {
  const config = profileConfig();
  const gpt = resolveOpenCodeModelFacingInventory({ config, model: { providerID: 'fixture', modelID: 'gpt-5' }, pure: true });
  assert.equal(gpt.status, 'PASS');
  assert.deepEqual(gpt.modelFacingTools, ['apply_patch', 'read']);
  assert.deepEqual(gpt.logicalInventory, ['edit_result_file', 'read_nonce_file']);

  const nonGpt = resolveOpenCodeModelFacingInventory({
    config: { ...config, model: 'fixture/fixture-model' },
    model: { providerID: 'fixture', modelID: 'fixture-model' },
    pure: true,
  });
  assert.equal(nonGpt.status, 'FAIL');
  assert.deepEqual(nonGpt.modelFacingTools, ['edit', 'read', 'write']);
  assert.deepEqual(nonGpt.logicalInventory, ['edit_result_file', 'model_edit:write', 'read_nonce_file']);
});

test('OpenCode extra plugin/MCP sources are not erased and unresolved runtime discovery cannot PASS C03', () => {
  const plugin = resolveOpenCodeModelFacingInventory({
    config: { ...profileConfig(), plugin: ['hostile-plugin'] },
    model: { providerID: 'fixture', modelID: 'gpt-5' },
    pure: false,
  });
  assert.equal(plugin.status, 'BLOCKED');
  assert.match(plugin.reason, /plugin/u);

  const mcp = resolveOpenCodeModelFacingInventory({
    config: { ...profileConfig(), mcp: { hostile: { type: 'local', command: ['hostile-mcp'] } } },
    model: { providerID: 'fixture', modelID: 'gpt-5' },
    pure: true,
  });
  assert.equal(mcp.status, 'BLOCKED');
  assert.match(mcp.reason, /MCP|discovery/u);
});

test('OpenCode permission filtering and proof evaluation separate exposed inventory from observed ToolCalls', () => {
  const denied = resolveOpenCodeModelFacingInventory({
    config: {
      ...profileConfig(),
      permission: { '*': 'deny', read: 'allow', edit: 'deny' },
    },
    model: { providerID: 'fixture', modelID: 'gpt-5' },
    pure: true,
  });
  assert.deepEqual(denied.modelFacingTools, ['read']);
  assert.equal(denied.status, 'FAIL');

  const fixture = { inventory: [{ id: 'read_nonce_file' }, { id: 'edit_result_file' }] };
  const observedOnly = buildProofs({
    candidateShape: 'OPENCODE-ACP',
    fixture,
    execution: {
      trustedProofs: {
        inventory: fixture.inventory.map(({ id }) => id),
        fixtureVerified: true,
        modelFacingInventory: {
          status: 'BLOCKED',
          source: 'MNFS_TRUSTED_OPENCODE_FROZEN_V1_18_15_TOOLREGISTRY_AND_REQUEST_FILTER',
        },
      },
    },
  });
  assert.equal(observedOnly['S1-C03'], false);
  assert.equal(buildProofs({
    candidateShape: 'OPENCODE-ACP',
    fixture,
    execution: {
      trustedProofs: {
        inventory: fixture.inventory.map(({ id }) => id),
        fixtureVerified: true,
        modelFacingInventory: {
          status: 'PASS',
          source: 'MNFS_TRUSTED_OPENCODE_FROZEN_V1_18_15_TOOLREGISTRY_AND_REQUEST_FILTER',
          model: { providerID: 'fixture', modelID: 'gpt-5' },
          logicalInventory: fixture.inventory.map(({ id }) => id),
        },
        actualModel: { providerID: 'fixture', modelID: 'gpt-5' },
      },
    },
  })['S1-C03'], true);

  const discoveryNotBound = buildProofs({
    candidateShape: 'OPENCODE-ACP',
    fixture,
    execution: {
      trustedProofs: {
        inventory: fixture.inventory.map(({ id }) => id),
        fixtureVerified: true,
        modelFacingInventory: {
          status: 'PASS',
          source: 'MNFS_TRUSTED_OPENCODE_FROZEN_V1_18_15_TOOLREGISTRY_AND_REQUEST_FILTER',
          logicalInventory: fixture.inventory.map(({ id }) => id),
        },
        discovery: {
          controlled: true,
          configSourcesControlled: false,
          extensions: [],
          skills: [],
          prompts: [],
          themes: [],
          agentsFiles: [],
        },
      },
    },
  });
  assert.equal(discoveryNotBound['S1-C04'], false);
});
