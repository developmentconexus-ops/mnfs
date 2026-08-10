import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';

import { createPiSdkAdapter } from '../src/adapters/pi-sdk.mjs';
import { createOpenCodeAcpAdapter, resolveOpenCodeModelFacingInventory } from '../src/adapters/opencode-acp.mjs';
import { safeProvenanceEvidence } from '../src/executors.mjs';
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
    tools: { '*': false, read: true, edit: true },
    permission: { '*': 'deny', read: 'allow', edit: 'allow' },
    plugin: [],
    mcp: [],
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
    modelEditFamily: 'edit',
  };
}

function opencodeEnv() {
  return { PATH: '/usr/bin:/bin', HOME: '/tmp/hostile-home', XDG_DATA_HOME: DATA_ROUTE };
}

test('OpenCode auth-route metadata is non-secret and remote/account-managed discovery fails closed', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'mnfs-arr-s1-review-opencode-auth-'));
  try {
    const profile = await writeProfile(root);
    await mkdir(profile.xdgDataHome, { recursive: true });
    await writeFile(path.join(profile.xdgDataHome, 'auth.json'), '{"token":"must-not-be-recorded","wellknown":"remote"}\n', { mode: 0o600 });
    const adapter = createOpenCodeAcpAdapter({
      executable: '/state/candidates/opencode/bin/opencode',
      cwd: '/tmp/mnfs-arr-s1-review-fixture',
      env: opencodeEnv(),
      profile,
    });

    assert.equal(adapter.observations.discoveryControlled, false);
    assert.notEqual(adapter.observations.profile.authRouteInspection.remoteConfigStatus, 'CONTROLLED');
    assert.doesNotMatch(JSON.stringify(adapter.observations), /must-not-be-recorded|token/u);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('OpenCode inventory validates the exact written profile and fails closed on plugin/mcp or input divergence', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'mnfs-arr-s1-review-opencode-profile-'));
  try {
    const hostile = await writeProfile(root, { ...profileConfig(), plugin: ['hostile-plugin'] });
    assert.throws(() => createOpenCodeAcpAdapter({
      executable: '/state/candidates/opencode/bin/opencode',
      cwd: '/tmp/mnfs-arr-s1-review-fixture',
      env: opencodeEnv(),
      profile: hostile,
    }), /plugin|mcp|empty|profile/u);

    const exact = await writeProfile(root, profileConfig());
    assert.throws(() => createOpenCodeAcpAdapter({
      executable: '/state/candidates/opencode/bin/opencode',
      cwd: '/tmp/mnfs-arr-s1-review-fixture',
      env: opencodeEnv(),
      profile: { ...exact, config: { ...profileConfig(), mcp: ['divergent-input'] } },
    }), /profile|config|diverg/u);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('OpenCode resolved inventory accounts for each frozen model edit family', () => {
  for (const modelEditFamily of ['edit', 'write', 'apply_patch']) {
    const inventory = resolveOpenCodeModelFacingInventory({
      config: {
        tools: { '*': false, read: true, [modelEditFamily]: true },
        permission: { '*': 'deny', read: 'allow', [modelEditFamily]: 'allow' },
        plugin: [],
        mcp: [],
      },
      modelEditFamily,
    });
    assert.equal(inventory.modelFacingEditTool, true);
    assert.deepEqual(inventory.logicalInventory, ['edit_result_file', 'read_nonce_file']);
  }
});
