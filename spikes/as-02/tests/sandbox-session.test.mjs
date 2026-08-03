import assert from 'node:assert/strict';
import { mkdtemp, realpath, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';

import { commandFromArgv, quotePosixArg } from '../src/posix-argv.mjs';
import { createSandboxSession, loadSandboxRuntime } from '../src/sandbox-session.mjs';

const POLICY_HASH = `sha256:${'a'.repeat(64)}`;

function processResult() {
  return {
    exitCode: 0,
    signal: null,
    stdout: Buffer.from('ok'),
    stderr: Buffer.alloc(0),
    startedAt: '2026-08-03T02:00:00.000Z',
    finishedAt: '2026-08-03T02:00:00.010Z',
  };
}

function fakeManager({ initializeError, wrapError, resetError, wrapped } = {}) {
  const calls = { initialize: [], wrap: [], reset: 0 };
  return {
    calls,
    async initialize(...args) {
      calls.initialize.push(args);
      if (initializeError) throw initializeError;
    },
    async wrapWithSandboxArgv(...args) {
      calls.wrap.push(args);
      if (wrapError) throw wrapError;
      return wrapped ?? {
        argv: ['/bin/bash', '-c', 'sandbox-wrapped-command'],
        env: {
          PATH: '/host/bin',
          ANTHROPIC_API_KEY: 'must-not-leak',
          SSH_AUTH_SOCK: '/tmp/agent.sock',
        },
      };
    },
    async reset() {
      calls.reset += 1;
      if (resetError) throw resetError;
    },
  };
}

function fakeRunner() {
  const calls = [];
  const runner = async (spec) => {
    calls.push(spec);
    return processResult();
  };
  runner.calls = calls;
  return runner;
}

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'mnfs-as02-session-'));
  return { root, cwd: await realpath(root) };
}

test('POSIX quoting round-trips controlled argv without host-shell interpretation', () => {
  const values = ['', 'plain', 'has space', "single'quote", '; touch /tmp/nope', '$(echo nope)', 'line\nbreak', 'ação'];
  const command = commandFromArgv([
    process.execPath,
    '-e',
    'process.stdout.write(JSON.stringify(process.argv.slice(1)))',
    '--',
    ...values,
  ]);
  const executed = spawnSync('/bin/bash', ['-c', command], {
    encoding: 'utf8',
    shell: false,
    env: { PATH: process.env.PATH ?? '' },
  });

  assert.equal(executed.status, 0, executed.stderr);
  assert.deepEqual(JSON.parse(executed.stdout), values);
  assert.equal(quotePosixArg(''), "''");
  assert.throws(() => commandFromArgv([]), (error) => error?.code === 'INVALID_COMMAND_ARGV');
  assert.throws(() => commandFromArgv(['node', 42]), (error) => error?.code === 'INVALID_COMMAND_ARGV');
});

test('loads only a module that exposes SandboxManager', async () => {
  const manager = fakeManager();
  assert.equal(
    await loadSandboxRuntime(async (specifier) => {
      assert.equal(specifier, '@anthropic-ai/sandbox-runtime');
      return { SandboxManager: manager };
    }),
    manager,
  );

  await assert.rejects(
    () => loadSandboxRuntime(async () => ({})),
    (error) => error?.code === 'SANDBOX_UNAVAILABLE',
  );
});

test('run before successful initialization fails closed without wrapping or spawning', async (t) => {
  const paths = await fixture();
  t.after(() => rm(paths.root, { recursive: true, force: true }));
  const manager = fakeManager();
  const runner = fakeRunner();
  const session = createSandboxSession({
    manager,
    processRunner: runner,
    policy: { config: { network: {}, filesystem: {} }, hash: POLICY_HASH },
    expectedPolicyHash: POLICY_HASH,
    cwd: paths.cwd,
    workerEnv: { PATH: '/usr/bin', HOME: '/tmp/fake-home' },
  });

  await assert.rejects(
    () => session.run(['node', 'probe.mjs']),
    (error) => error?.code === 'SANDBOX_UNAVAILABLE',
  );
  assert.equal(manager.calls.wrap.length, 0);
  assert.equal(runner.calls.length, 0);
});

test('policy mismatch prevents Sandbox Runtime initialization', async (t) => {
  const paths = await fixture();
  t.after(() => rm(paths.root, { recursive: true, force: true }));
  const manager = fakeManager();
  const session = createSandboxSession({
    manager,
    processRunner: fakeRunner(),
    policy: { config: { network: {}, filesystem: {} }, hash: POLICY_HASH },
    expectedPolicyHash: `sha256:${'b'.repeat(64)}`,
    cwd: paths.cwd,
    workerEnv: { PATH: '/usr/bin' },
  });

  await assert.rejects(
    () => session.initialize(),
    (error) => error?.code === 'POLICY_HASH_MISMATCH',
  );
  assert.equal(manager.calls.initialize.length, 0);
});

test('initialization failure is permanent and exposes no host fallback', async (t) => {
  const paths = await fixture();
  t.after(() => rm(paths.root, { recursive: true, force: true }));
  const manager = fakeManager({ initializeError: new Error('bwrap unavailable') });
  const runner = fakeRunner();
  const session = createSandboxSession({
    manager,
    processRunner: runner,
    policy: { config: { network: {}, filesystem: {} }, hash: POLICY_HASH },
    expectedPolicyHash: POLICY_HASH,
    cwd: paths.cwd,
    workerEnv: { PATH: '/usr/bin' },
  });

  await assert.rejects(
    () => session.initialize(),
    (error) => error?.code === 'SANDBOX_UNAVAILABLE',
  );
  await assert.rejects(
    () => session.initialize(),
    (error) => error?.code === 'SANDBOX_UNAVAILABLE',
  );
  await assert.rejects(
    () => session.run(['node', 'probe.mjs']),
    (error) => error?.code === 'SANDBOX_UNAVAILABLE',
  );
  assert.equal(manager.calls.initialize.length, 1);
  assert.equal(manager.calls.wrap.length, 0);
  assert.equal(runner.calls.length, 0);
});

test('successful session wraps once and spawns with shell false runner plus explicit Worker env', async (t) => {
  const paths = await fixture();
  t.after(() => rm(paths.root, { recursive: true, force: true }));
  const manager = fakeManager();
  const runner = fakeRunner();
  const signal = new AbortController().signal;
  const workerEnv = {
    PATH: '/usr/bin:/bin',
    HOME: '/tmp/fake-home',
    TMPDIR: '/tmp/attempt',
    GIT_OPTIONAL_LOCKS: '0',
  };
  const policy = { config: { network: {}, filesystem: {} }, hash: POLICY_HASH };
  const session = createSandboxSession({
    manager,
    processRunner: runner,
    policy,
    expectedPolicyHash: POLICY_HASH,
    cwd: paths.cwd,
    workerEnv,
  });

  await session.initialize();
  const argv = ['node', 'script path.mjs', ';not-shell'];
  const observed = await session.run(argv, { signal, timeoutMs: 1_234 });

  assert.deepEqual(manager.calls.initialize, [[policy.config, undefined, true]]);
  assert.deepEqual(manager.calls.wrap, [[commandFromArgv(argv), '/bin/bash', undefined, signal, paths.cwd]]);
  assert.deepEqual(runner.calls, [{
    file: '/bin/bash',
    args: ['-c', 'sandbox-wrapped-command'],
    cwd: paths.cwd,
    env: workerEnv,
    timeoutMs: 1_234,
    signal,
  }]);
  assert.equal(Object.hasOwn(runner.calls[0].env, 'ANTHROPIC_API_KEY'), false);
  assert.equal(Object.hasOwn(runner.calls[0].env, 'SSH_AUTH_SOCK'), false);
  assert.deepEqual(observed, processResult());
});

test('wrap failure never falls back to the original command', async (t) => {
  const paths = await fixture();
  t.after(() => rm(paths.root, { recursive: true, force: true }));
  const manager = fakeManager({ wrapError: new Error('wrap failed') });
  const runner = fakeRunner();
  const session = createSandboxSession({
    manager,
    processRunner: runner,
    policy: { config: { network: {}, filesystem: {} }, hash: POLICY_HASH },
    expectedPolicyHash: POLICY_HASH,
    cwd: paths.cwd,
    workerEnv: { PATH: '/usr/bin' },
  });

  await session.initialize();
  await assert.rejects(
    () => session.run(['node', 'probe.mjs']),
    (error) => error?.code === 'SANDBOX_UNAVAILABLE',
  );
  assert.equal(runner.calls.length, 0);
});

test('close resets exactly once and reports cleanup failure separately', async (t) => {
  const paths = await fixture();
  t.after(() => rm(paths.root, { recursive: true, force: true }));
  const manager = fakeManager();
  const session = createSandboxSession({
    manager,
    processRunner: fakeRunner(),
    policy: { config: { network: {}, filesystem: {} }, hash: POLICY_HASH },
    expectedPolicyHash: POLICY_HASH,
    cwd: paths.cwd,
    workerEnv: { PATH: '/usr/bin' },
  });
  await session.initialize();
  await session.close();
  await session.close();
  assert.equal(manager.calls.reset, 1);

  const failing = fakeManager({ resetError: new Error('cleanup failed') });
  const failingSession = createSandboxSession({
    manager: failing,
    processRunner: fakeRunner(),
    policy: { config: { network: {}, filesystem: {} }, hash: POLICY_HASH },
    expectedPolicyHash: POLICY_HASH,
    cwd: paths.cwd,
    workerEnv: { PATH: '/usr/bin' },
  });
  await failingSession.initialize();
  await assert.rejects(
    () => failingSession.close(),
    (error) => error?.code === 'SANDBOX_CLEANUP_FAILED',
  );
  await assert.rejects(
    () => failingSession.run(['node', 'probe.mjs']),
    (error) => error?.code === 'SANDBOX_UNAVAILABLE',
  );
});
