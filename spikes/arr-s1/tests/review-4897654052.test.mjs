import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { chmod, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { buildProofs, deriveMachineryProof } from '../src/executors.mjs';
import { createOpenCodeAcpAdapter } from '../src/adapters/opencode-acp.mjs';
import { createPiSdkAdapter } from '../src/adapters/pi-sdk.mjs';
import { runPiRpcProcess } from '../src/pi-rpc.mjs';
import * as piRpc from '../src/pi-rpc.mjs';

const CWD = '/tmp/mnfs-arr-s1-fixture';
const ROUTE = '/tmp/mnfs-arr-s1-authorized-credentials';
const BASE_ENV = Object.freeze({
  PATH: '/usr/bin:/bin',
  LANG: 'C',
  LC_ALL: 'C',
  PI_CODING_AGENT_DIR: ROUTE,
});

function spawnCapture(command, args, options) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, options);
    const stdout = [];
    const stderr = [];
    child.stdout.on('data', (chunk) => stdout.push(chunk));
    child.stderr.on('data', (chunk) => stderr.push(chunk));
    child.once('error', reject);
    child.once('close', (code, signal) => resolve({
      code,
      signal,
      stdout: Buffer.concat(stdout).toString('utf8'),
      stderr: Buffer.concat(stderr).toString('utf8'),
    }));
  });
}

test('Pi-ACP uses a run-root executable launcher and a faithful shell=false spawn', async () => {
  const { createTrustedPiAcpLauncher, revalidateTrustedPiAcpLauncher } = await import('../src/pi-acp-launcher.mjs');
  const runRoot = await mkdtemp(path.join(tmpdir(), 'mnfs-arr-s1-launcher-'));
  const inner = path.join(runRoot, 'inner-pi');
  try {
    await writeFile(inner, `#!/bin/sh
printf '%s\\n' "$PI_CODING_AGENT_DIR"
printf '%s\\n' "$@"
`, { mode: 0o700 });
    await chmod(inner, 0o700);
    const binding = await createTrustedPiAcpLauncher({
      runRoot,
      wrapperPath: path.resolve('spikes/arr-s1/src/pi-acp-wrapper.mjs'),
    });
    const result = await spawnCapture(binding.path, ['--mode', 'rpc', '--no-themes'], {
      cwd: runRoot,
      env: {
        ...BASE_ENV,
        MNFS_PI_ACP_EXECUTABLE: inner,
        PI_ACP_PI_COMMAND: binding.path,
      },
      shell: false,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    assert.equal(result.code, 0, result.stderr);
    assert.ok(result.stdout, JSON.stringify(result));
    assert.deepEqual(result.stdout.trim().split('\n'), [
      ROUTE,
      '--mode', 'rpc', '--no-themes', '--tools', 'read,edit', '--no-extensions', '--no-skills', '--no-prompt-templates', '--no-context-files',
    ]);
    assert.equal(binding.nodePath, process.execPath);
    assert.equal(binding.wrapperPath, path.resolve('spikes/arr-s1/src/pi-acp-wrapper.mjs'));
    assert.equal(binding.runRoot, runRoot);
    assert.equal(binding.mode, '0700');
    await assert.doesNotReject(() => revalidateTrustedPiAcpLauncher(binding));
    await writeFile(binding.path, `${await readFile(binding.path, 'utf8')}\n`);
    await assert.rejects(() => revalidateTrustedPiAcpLauncher(binding), /digest|size/u);
  } finally {
    await rm(runRoot, { recursive: true, force: true });
  }
});

test('Pi SDK binds an explicit PI_CODING_AGENT_DIR route without exposing credential material', async () => {
  const adapter = createPiSdkAdapter({
    sdk: { createAgentSession: async () => ({ subscribe: () => () => {}, dispose() {} }) },
    cwd: CWD,
    piCodingAgentDir: ROUTE,
    resourceLoader: {
      getExtensions: () => ({ extensions: [] }), getSkills: () => ({ skills: [] }), getPrompts: () => ({ prompts: [] }),
      getThemes: () => ({ themes: [] }), getAgentsFiles: () => ({ agentsFiles: [] }), getSystemPrompt: () => undefined,
      getSystemPromptSource: () => undefined, getAppendSystemPrompt: () => [], getAppendSystemPromptSources: () => [],
      extendResources() {}, reload: async () => {},
    },
    sessionManager: {},
  });
  assert.deepEqual(adapter.observeCredentialRoute(), {
    variable: 'PI_CODING_AGENT_DIR',
    path: ROUTE,
    class: 'PERSISTED_AGENT_AUTH_DIRECTORY',
    valueRecorded: false,
  });
  assert.throws(() => createPiSdkAdapter({ cwd: CWD }), /PI_CODING_AGENT_DIR|credential route/u);
});

test('Pi RPC classifies abort success plus bounded post-control lifecycle as CANCELLED', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'mnfs-arr-s1-rpc-cancel-'));
  const executable = path.join(root, 'pi');
  try {
    await writeFile(executable, `#!/bin/sh
while IFS= read -r line; do
  case "$line" in
    *'"type":"prompt"'*) printf '%s\\n' '{"type":"agent_start"}' ;;
    *'"type":"abort"'*) printf '%s\\n' '{"type":"response","command":"abort","success":true}'; printf '%s\\n' '{"type":"agent_end","willRetry":false}'; printf '%s\\n' '{"type":"agent_settled"}' ;;
  esac
done
`, { mode: 0o700 });
    await chmod(executable, 0o700);
    const result = await runPiRpcProcess({
      executable,
      cwd: root,
      env: BASE_ENV,
      prompt: 'cancel',
      mode: 'CANCEL',
    });
    assert.equal(result.settled.outcome, 'CANCELLED', JSON.stringify(result));
    assert.equal(result.settled.rawLifecycle.outcome, 'COMPLETED');
    assert.equal(result.settled.cancellation.abortRequestedWhileActive, true);
    assert.equal(result.settled.cancellation.abortSucceeded, true);
    assert.equal(result.settled.cancellation.postControlSettlement, true);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('Pi RPC fast settlement without active abort control cannot classify CANCELLED', () => {
  const result = piRpc.classifyPiRpcLifecycle([
    { type: 'agent_start' },
    { type: 'agent_end', willRetry: false },
    { type: 'agent_settled' },
  ], {
    mode: 'CANCEL',
    control: { requested: false, turnActive: false },
    boundedSettlement: true,
  });
  assert.equal(result.outcome, 'COMPLETED');
  assert.equal(result.cancellation.postControlSettlement, false);
});

test('OpenCode isolation overrides hostile project/global/plugin surfaces and keeps only authorized data auth route', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'mnfs-arr-s1-opencode-isolation-'));
  const hostile = path.join(root, 'hostile');
  const authorizedData = path.join(root, 'authorized-data');
  try {
    await (await import('node:fs/promises')).mkdir(path.join(hostile, 'project'), { recursive: true });
    await (await import('node:fs/promises')).mkdir(path.join(hostile, 'global-config', 'opencode'), { recursive: true });
    await (await import('node:fs/promises')).mkdir(path.join(hostile, '.opencode'), { recursive: true });
    await writeFile(path.join(hostile, 'global-config', 'opencode', 'opencode.json'), '{"tools":{"hostile_global":true}}\n');
    await writeFile(path.join(hostile, '.opencode', 'opencode.json'), '{"tools":{"hostile_home":true},"plugin":["hostile-plugin"]}\n');
    await writeFile(path.join(hostile, 'project', 'opencode.json'), '{"tools":{"hostile_project":true}}\n');
    const profileConfig = {
      model: 'fixture/gpt-5',
      tools: { '*': false, read: true, edit: true },
      permission: { '*': 'deny', read: 'allow', edit: 'allow' },
      plugin: [],
      mcp: {},
    };
    const profileBytes = Buffer.from(`${JSON.stringify(profileConfig)}\n`);
    await (await import('node:fs/promises')).mkdir(path.join(root, 'config-dir'), { recursive: true });
    await writeFile(path.join(root, 'config-dir', 'config.json'), profileBytes, { mode: 0o600 });
    const profile = {
      runRoot: root,
      configDir: path.join(root, 'config-dir'),
      configPath: path.join(root, 'config-dir', 'config.json'),
      xdgConfigHome: path.join(root, 'xdg-config'),
      xdgStateHome: path.join(root, 'xdg-state'),
      xdgCacheHome: path.join(root, 'xdg-cache'),
      xdgDataHome: authorizedData,
      config: profileConfig,
      configHash: `sha256:${createHash('sha256').update(profileBytes).digest('hex')}`,
      configSizeBytes: profileBytes.length,
      configMode: '0600',
    };
    const adapter = createOpenCodeAcpAdapter({
      executable: process.execPath,
      cwd: path.join(hostile, 'project'),
      env: {
        ...BASE_ENV,
        HOME: hostile,
        XDG_CONFIG_HOME: path.join(hostile, 'global-config'),
        XDG_STATE_HOME: path.join(hostile, 'global-state'),
        XDG_CACHE_HOME: path.join(hostile, 'global-cache'),
        OPENCODE_CONFIG_CONTENT: '{"tools":{"hostile":true}}',
      },
      profile,
    });
    assert.equal(adapter.processSpec.env.OPENCODE_DISABLE_PROJECT_CONFIG, '1');
    assert.equal(adapter.processSpec.env.OPENCODE_PURE, '1');
    assert.equal(adapter.processSpec.env.XDG_CONFIG_HOME, path.join(root, 'xdg-config'));
    assert.equal(adapter.processSpec.env.XDG_STATE_HOME, path.join(root, 'xdg-state'));
    assert.equal(adapter.processSpec.env.XDG_CACHE_HOME, path.join(root, 'xdg-cache'));
    assert.equal(adapter.processSpec.env.XDG_DATA_HOME, authorizedData);
    assert.equal('OPENCODE_CONFIG_CONTENT' in adapter.processSpec.env, false);
    assert.equal('OPENCODE_AUTH_CONTENT' in adapter.processSpec.env, false);

    const probe = await spawnCapture('/bin/sh', ['-c', 'printf "%s\\n%s\\n%s\\n%s\\n" "$OPENCODE_DISABLE_PROJECT_CONFIG" "$HOME" "$XDG_CONFIG_HOME" "$XDG_DATA_HOME"'], {
      cwd: adapter.processSpec.cwd,
      env: adapter.processSpec.env,
      shell: false,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    assert.equal(probe.code, 0, probe.stderr);
    assert.ok(probe.stdout, JSON.stringify(probe));
    assert.deepEqual(probe.stdout.trim().split('\n'), ['1', root, path.join(root, 'xdg-config'), authorizedData]);
    assert.equal(adapter.processSpec.env.OPENCODE_CONFIG_DIR, path.join(root, 'config-dir'));
    assert.equal(adapter.processSpec.env.OPENCODE_PURE, '1');
    assert.equal(adapter.processSpec.env.OPENCODE_PERMISSION, undefined);
    const ignoredUntrustedHint = createOpenCodeAcpAdapter({
      executable: process.execPath,
      cwd: CWD,
      env: BASE_ENV,
      profile: { ...profile, authRoute: { kind: 'REMOTE_CONFIG' } },
    });
    assert.equal(ignoredUntrustedHint.observations.discoveryControlled, true);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('OpenCode C03 derives resolved model-facing inventory, not only observed ToolCalls', async () => {
  const fixture = { inventory: [{ id: 'read_nonce_file' }, { id: 'edit_result_file' }] };
  const { resolveOpenCodeModelFacingInventory } = await import('../src/adapters/opencode-acp.mjs');
  const base = resolveOpenCodeModelFacingInventory({
    config: { model: 'fixture/gpt-5', tools: { '*': false, read: true, edit: true }, permission: { '*': 'deny', read: 'allow', edit: 'allow' }, plugin: [], mcp: {} },
    model: { providerID: 'fixture', modelID: 'gpt-5' },
    pure: true,
  });
  assert.deepEqual(base.logicalInventory, ['edit_result_file', 'read_nonce_file']);
  assert.deepEqual(base.modelFacingTools, ['apply_patch', 'read']);
  const extra = resolveOpenCodeModelFacingInventory({
    config: { model: 'fixture/gpt-5', tools: { '*': false, read: true, edit: true, lint: true }, permission: { '*': 'deny', read: 'allow', edit: 'allow', lint: 'allow' }, plugin: ['hostile-plugin'], mcp: { hostile: { type: 'local', command: ['hostile-mcp'] } } },
    model: { providerID: 'fixture', modelID: 'gpt-5' },
    pure: false,
  });
  assert.equal(extra.status, 'BLOCKED');
  assert.equal(buildProofs({
    fixture,
    execution: { trustedProofs: { inventory: extra.logicalInventory, fixtureVerified: true } },
  })['S1-C03'], false);
  assert.deepEqual(extra.configuredPluginSpecs, ['hostile-plugin']);
  assert.deepEqual(extra.configuredMcpServers, ['hostile']);
});

test('Pi SDK C15 records avoidance of TUI scraping through structured AgentSession evidence', async () => {
  const source = await readFile(new URL('../src/executors.mjs', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /namedMnfsMachineryEliminatedOrAvoided:\s*\[[^\]]*MNFS_RUNTIME_SESSION_ADAPTER/u);
  const proof = deriveMachineryProof({
    namedMnfsMachineryEliminatedOrAvoided: ['MNFS_TUI_HUMAN_OUTPUT_SCRAPING'],
    causalMechanism: 'structured Pi AgentSession events avoid a TUI/human-output scraper',
    supportingEvidence: [{ source: 'MNFS_TRUSTED_PI_AGENT_SESSION', structuredEvents: true, humanOutputScraping: false }],
  });
  assert.equal(proof.pass, true);
});
