import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';

import { buildProofs } from '../src/executors.mjs';
import {
  createOpenCodeAcpAdapter,
} from '../src/adapters/opencode-acp.mjs';
import { requireCredentialRouteBinding } from '../src/credential-routes.mjs';

const EXECUTABLE = '/state/candidates/opencode/bin/opencode';
const CWD = '/tmp/mnfs-arr-s1-final-corrections-fixture';

function profileConfig(model = 'fixture/gpt-5') {
  return {
    ...(model ? { model } : {}),
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
    home: path.join(root, 'opencode-home'),
    config,
    configHash: `sha256:${createHash('sha256').update(bytes).digest('hex')}`,
    configSizeBytes: bytes.length,
    configMode: '0600',
  };
}

function environmentAdapter(profile) {
  return createOpenCodeAcpAdapter({
    executable: EXECUTABLE,
    cwd: CWD,
    env: {
      PATH: '/usr/bin:/bin',
      HOME: '/tmp/hostile-home',
      XDG_DATA_HOME: '/tmp/hostile-opencode-data',
      OPENCODE_DB: '/tmp/hostile.db',
    },
    profile,
    createClient: () => ({
      async initialize() { return { protocolVersion: 1, agentCapabilities: {} }; },
      handshake() { return { protocolVersion: 1, agentCapabilities: {} }; },
      async startSession() { return { sessionId: 'session-1' }; },
      async prompt() { return { settled: Promise.resolve({ outcome: 'COMPLETED' }) }; },
      async cancel() { return { outcome: 'CANCELLED' }; },
      async shutdown() {},
    }),
  });
}

test('C02 binds exact reviewed OpenCode environment, including new controls and unauthorized drift', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'mnfs-arr-s1-c02-'));
  try {
    const profile = await writeProfile(root);
    const adapter = environmentAdapter(profile);
    const { deriveAcpEnvironmentBinding } = await import('../src/executors.mjs');
    assert.equal(typeof deriveAcpEnvironmentBinding, 'function');

    const bind = (env) => deriveAcpEnvironmentBinding({
      candidateShape: 'OPENCODE-ACP',
      record: { environment: { PATH: '/usr/bin:/bin', XDG_DATA_HOME: '/tmp/hostile-opencode-data' } },
      adapter: { ...adapter, processSpec: { ...adapter.processSpec, env } },
      processObservation: { cwd: CWD, envKeys: Object.keys(env).sort() },
      expectedCwd: CWD,
    });

    const exact = bind({ ...adapter.processSpec.env });
    assert.equal(exact.environmentMatchesRecord, true);
    assert.match(exact.envDigest, /^sha256:[a-f0-9]{64}$/u);

    for (const key of ['HOME', 'OPENCODE_DB', 'OPENCODE_CLIENT', 'OPENCODE_DISABLE_DEFAULT_PLUGINS']) {
      const missingControl = { ...adapter.processSpec.env };
      delete missingControl[key];
      assert.equal(bind(missingControl).environmentMatchesRecord, false, `missing ${key} must fail C02 binding`);
    }

    const unauthorized = { ...adapter.processSpec.env, OPENCODE_UNAUTHORIZED: '1' };
    assert.equal(bind(unauthorized).environmentMatchesRecord, false);
    assert.throws(() => requireCredentialRouteBinding({
      candidateShape: 'OPENCODE-ACP',
      authorizedRoutes: { openCode: { path: adapter.processSpec.env.XDG_DATA_HOME, class: 'PERSISTED_OPENCODE_AUTH_DATA_DIRECTORY' } },
      stagedEnvironment: { XDG_DATA_HOME: adapter.processSpec.env.XDG_DATA_HOME },
      processEnvironment: { XDG_DATA_HOME: '/tmp/redirected-opencode-data' },
    }), /credential route binding/u);
    assert.equal(buildProofs({
      candidateShape: 'OPENCODE-ACP',
      fixture: { workspacePath: CWD, inventory: [] },
      execution: { trustedProofs: { boundary: unauthorized, fixtureVerified: false } },
    })['S1-C02'], false);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('OpenCode C03 uses the actual ACP session model for GPT, fallback, and missing observations', async () => {
  const cases = [
    { actual: 'fixture/gpt-5', expectedStatus: 'PASS', expectedTools: ['apply_patch', 'read'] },
    { actual: 'anthropic/model-x', expectedStatus: 'FAIL', expectedTools: ['edit', 'read', 'write'] },
    { actual: undefined, expectedStatus: 'BLOCKED', expectedTools: undefined },
  ];
  for (const item of cases) {
    const root = await mkdtemp(path.join(tmpdir(), 'mnfs-arr-s1-c03-'));
    try {
      const profile = await writeProfile(root, profileConfig('fixture/gpt-5'));
      const adapter = createOpenCodeAcpAdapter({
        executable: EXECUTABLE,
        cwd: CWD,
        env: { PATH: '/usr/bin:/bin', XDG_DATA_HOME: path.join(root, 'data') },
        profile,
        createClient: () => ({
          async initialize() { return { protocolVersion: 1, agentCapabilities: {} }; },
          handshake() { return { protocolVersion: 1, agentCapabilities: {} }; },
          async startSession() {
            return {
              sessionId: 'session-1',
              newSessionResponse: item.actual ? {
                configOptions: [{ id: 'model', currentValue: item.actual }],
              } : undefined,
            };
          },
          async prompt() { return { settled: Promise.resolve({ outcome: 'COMPLETED' }) }; },
          async cancel() { return { outcome: 'CANCELLED' }; },
          async shutdown() {},
        }),
      });

      await adapter.initialize();
      const session = await adapter.startSession({ cwd: CWD });
      assert.deepEqual(session.actualModel, item.actual ? {
        providerID: item.actual.split('/')[0],
        modelID: item.actual.slice(item.actual.indexOf('/') + 1),
      } : null);
      assert.equal(session.modelFacingInventory?.status, item.expectedStatus);
      if (item.expectedTools) assert.deepEqual(session.modelFacingInventory.modelFacingTools, item.expectedTools);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  }
});

test('OpenCode C04 binds a dedicated controlled HOME and rejects custom HOME tools', async () => {
  const shapes = [
    ['tool', 'evil.js'],
    ['tools', 'evil.ts'],
  ];
  for (const [directory, file] of shapes) {
    const root = await mkdtemp(path.join(tmpdir(), 'mnfs-arr-s1-home-'));
    try {
      const profile = await writeProfile(root);
      const customDir = path.join(profile.home, '.opencode', directory);
      await mkdir(customDir, { recursive: true });
      await writeFile(path.join(customDir, file), 'export default {}\n');
      assert.throws(() => environmentAdapter(profile), /HOME|custom|discovery|controlled/u);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  }

  {
    const root = await mkdtemp(path.join(tmpdir(), 'mnfs-arr-s1-home-symlink-'));
    try {
      const profile = await writeProfile(root);
      const target = path.join(root, 'unreviewed-opencode');
      await mkdir(target, { recursive: true });
      await mkdir(profile.home, { recursive: true });
      await symlink(target, path.join(profile.home, '.opencode'), 'dir');
      assert.throws(() => environmentAdapter(profile), /HOME|symlink|directory|controlled/u);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  }

  const root = await mkdtemp(path.join(tmpdir(), 'mnfs-arr-s1-home-empty-'));
  try {
    const profile = await writeProfile(root);
    const adapter = environmentAdapter(profile);
    assert.equal(adapter.processSpec.env.HOME, profile.home);
    assert.equal(adapter.observations.profile.homeDiscovery.discoveryControlled, true);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('available_commands_update is separate benign command evidence, while hidden surface changes block C04', async () => {
  const { deriveAcpDiscovery } = await import('../src/executors.mjs');
  assert.equal(typeof deriveAcpDiscovery, 'function');
  const base = {
    candidateShape: 'OPENCODE-ACP',
    adapter: { observations: { discoveryControlled: true, profile: { configSources: { discoveryControlled: true } } } },
  };
  const benign = deriveAcpDiscovery({
    ...base,
    rawMessages: [{ notification: { update: {
      sessionUpdate: 'available_commands_update',
      availableCommands: [{ name: 'help', description: 'Show help' }],
    } } }],
  });
  assert.deepEqual(benign.prompts, []);
  assert.deepEqual(benign.availableCommands, [{ name: 'help', description: 'Show help' }]);
  assert.equal(buildProofs({
    candidateShape: 'OPENCODE-ACP',
    fixture: { workspacePath: CWD, inventory: [] },
    execution: { trustedProofs: { discovery: benign } },
  })['S1-C04'], true);

  const hidden = deriveAcpDiscovery({
    ...base,
    rawMessages: [{ notification: { update: {
      sessionUpdate: 'available_commands_update',
      availableCommands: [{ name: 'evil', source: 'skill' }],
    } } }],
  });
  assert.equal(buildProofs({
    candidateShape: 'OPENCODE-ACP',
    fixture: { workspacePath: CWD, inventory: [] },
    execution: { trustedProofs: { discovery: hidden } },
  })['S1-C04'], false);

  const hiddenThenBenign = deriveAcpDiscovery({
    ...base,
    rawMessages: [
      { notification: { update: { sessionUpdate: 'available_commands_update', availableCommands: [{ name: 'evil', source: 'skill' }] } } },
      { notification: { update: { sessionUpdate: 'available_commands_update', availableCommands: [{ name: 'help' }] } } },
    ],
  });
  assert.equal(buildProofs({
    candidateShape: 'OPENCODE-ACP',
    fixture: { workspacePath: CWD, inventory: [] },
    execution: { trustedProofs: { discovery: hiddenThenBenign } },
  })['S1-C04'], false);
});
