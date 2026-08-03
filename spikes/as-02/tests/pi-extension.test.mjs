import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';

import { canonicalJson, sha256Text } from '../src/canonical-json.mjs';
import { createAs02Extension } from '../pi-extension/src/index.ts';

const TOOLS = ['bash', 'read', 'write', 'edit', 'grep', 'find', 'ls'];

function fakePi() {
  const tools = [];
  const handlers = new Map();
  return {
    tools,
    handlers,
    registerTool(tool) {
      tools.push(tool);
    },
    on(event, handler) {
      handlers.set(event, handler);
    },
  };
}

function fakeSession({ initializeError, runOutput } = {}) {
  const calls = { initialize: 0, run: [], close: 0 };
  return {
    calls,
    async initialize() {
      calls.initialize += 1;
      if (initializeError) throw initializeError;
    },
    async run(argv, options) {
      calls.run.push({ argv, options });
      return {
        exitCode: 0,
        signal: null,
        stdout: Buffer.from(runOutput ?? JSON.stringify({ ok: true, result: { operation: 'read', text: 'safe' } })),
        stderr: Buffer.alloc(0),
        startedAt: '2026-08-03T02:00:00.000Z',
        finishedAt: '2026-08-03T02:00:00.010Z',
      };
    },
    async close() {
      calls.close += 1;
    },
  };
}

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'mnfs-as02-extension-'));
  const worktree = join(root, 'worktree');
  const trusted = join(root, 'trusted');
  const policyRoot = join(trusted, 'policy');
  const operationRoot = join(root, 'operations');
  const artifactRoot = join(root, 'artifacts');
  const broker = join(trusted, 'broker.mjs');
  const policyPath = join(policyRoot, 'active.json');
  await mkdir(worktree, { recursive: true });
  await mkdir(policyRoot, { recursive: true });
  await mkdir(operationRoot, { recursive: true });
  await mkdir(artifactRoot, { recursive: true });
  await writeFile(broker, '// trusted broker');
  const config = {
    network: { allowedDomains: [], strictAllowlist: true },
    filesystem: { allowWrite: [worktree], denyWrite: [] },
  };
  const hash = sha256Text(canonicalJson(config));
  await writeFile(policyPath, `${JSON.stringify({
    config,
    hash,
    workerEnv: {
      PATH: '/usr/bin:/bin',
      HOME: join(root, 'fake-home'),
      TMPDIR: join(root, 'attempt-temp'),
      GIT_OPTIONAL_LOCKS: '0',
    },
  })}\n`);
  await mkdir(join(root, 'fake-home'), { recursive: true });
  await mkdir(join(root, 'attempt-temp'), { recursive: true });

  return {
    root,
    worktree: await realpath(worktree),
    broker: await realpath(broker),
    policyPath: await realpath(policyPath),
    operationRoot: await realpath(operationRoot),
    artifactRoot: await realpath(artifactRoot),
    hash,
  };
}

function environment(paths) {
  return {
    MNFS_AS02_POLICY_PATH: paths.policyPath,
    MNFS_AS02_POLICY_HASH: paths.hash,
    MNFS_AS02_WORKTREE: paths.worktree,
    MNFS_AS02_BROKER: paths.broker,
    MNFS_AS02_OPERATION_ROOT: paths.operationRoot,
    MNFS_AS02_ARTIFACT_ROOT: paths.artifactRoot,
  };
}

test('factory is async and registers zero tools when sandbox initialization fails', async (t) => {
  const paths = await fixture();
  t.after(() => rm(paths.root, { recursive: true, force: true }));
  const pi = fakePi();
  const session = fakeSession({ initializeError: new Error('bwrap unavailable') });
  const extension = createAs02Extension({
    env: environment(paths),
    loadRuntime: async () => ({ name: 'manager' }),
    createSession: () => session,
  });

  const returned = extension(pi);
  assert.equal(returned instanceof Promise, true);
  await assert.rejects(returned, /bwrap unavailable/u);
  assert.equal(session.calls.initialize, 1);
  assert.deepEqual(pi.tools, []);
});

test('validates policy and trusted realpaths before registering exactly seven tools', async (t) => {
  const paths = await fixture();
  t.after(() => rm(paths.root, { recursive: true, force: true }));
  const pi = fakePi();
  const session = fakeSession();
  let sessionInput;
  const extension = createAs02Extension({
    env: environment(paths),
    loadRuntime: async () => ({ name: 'manager' }),
    createSession: (input) => {
      sessionInput = input;
      return session;
    },
  });

  await extension(pi);

  assert.deepEqual(pi.tools.map((tool) => tool.name), TOOLS);
  assert.equal(new Set(pi.tools.map((tool) => tool.name)).size, 7);
  assert.equal(session.calls.initialize, 1);
  assert.equal(sessionInput.expectedPolicyHash, paths.hash);
  assert.equal(sessionInput.cwd, paths.worktree);
  assert.equal(sessionInput.workerEnv.ANTHROPIC_API_KEY, undefined);
  assert.equal(pi.handlers.has('session_shutdown'), true);
});

test('rejects stale policy, worktree/broker overlap and writable trusted roots before registration', async (t) => {
  const paths = await fixture();
  t.after(() => rm(paths.root, { recursive: true, force: true }));

  const stale = fakePi();
  await assert.rejects(
    createAs02Extension({
      env: { ...environment(paths), MNFS_AS02_POLICY_HASH: `sha256:${'f'.repeat(64)}` },
      loadRuntime: async () => ({}),
      createSession: () => fakeSession(),
    })(stale),
    (error) => error?.code === 'POLICY_HASH_MISMATCH',
  );
  assert.equal(stale.tools.length, 0);

  const insideBroker = join(paths.worktree, 'broker.mjs');
  await writeFile(insideBroker, '// unsafe');
  const unsafe = fakePi();
  await assert.rejects(
    createAs02Extension({
      env: { ...environment(paths), MNFS_AS02_BROKER: insideBroker },
      loadRuntime: async () => ({}),
      createSession: () => fakeSession(),
    })(unsafe),
    (error) => error?.code === 'EXTENSION_TRUST_BOUNDARY_INVALID',
  );
  assert.equal(unsafe.tools.length, 0);
});

test('each tool writes one trusted operation file, invokes only the sandboxed broker and removes the file', async (t) => {
  const paths = await fixture();
  t.after(() => rm(paths.root, { recursive: true, force: true }));
  const pi = fakePi();
  const session = fakeSession();
  await createAs02Extension({
    env: environment(paths),
    loadRuntime: async () => ({}),
    createSession: () => session,
    randomId: () => 'operation-1',
  })(pi);

  const readTool = pi.tools.find((tool) => tool.name === 'read');
  const observed = await readTool.execute('tool-call-1', { path: 'README.md' }, undefined, undefined, {});

  assert.equal(session.calls.run.length, 1);
  const operationPath = join(paths.operationRoot, 'operation-1.json');
  assert.deepEqual(session.calls.run[0].argv, [process.execPath, paths.broker, operationPath]);
  assert.deepEqual(session.calls.run[0].options, { signal: undefined, timeoutMs: 30_000 });
  await assert.rejects(() => readFile(operationPath), (error) => error?.code === 'ENOENT');
  assert.deepEqual(JSON.parse(observed.content[0].text), { operation: 'read', text: 'safe' });
  assert.equal(observed.details.policyHash, paths.hash);
});

test('tool output is bounded and synthetic markers never reach the model result', async (t) => {
  const paths = await fixture();
  t.after(() => rm(paths.root, { recursive: true, force: true }));
  const pi = fakePi();
  const session = fakeSession({
    runOutput: JSON.stringify({ ok: true, result: { text: `MNFS_AS02_SENTINEL_${'x'.repeat(100_000)}` } }),
  });
  await createAs02Extension({
    env: environment(paths),
    loadRuntime: async () => ({}),
    createSession: () => session,
  })(pi);

  const readTool = pi.tools.find((tool) => tool.name === 'read');
  await assert.rejects(
    () => readTool.execute('tool-call-1', { path: 'README.md' }, undefined, undefined, {}),
    (error) => error?.code === 'EXTENSION_OUTPUT_REJECTED',
  );
});

test('shutdown closes the sandbox session exactly once', async (t) => {
  const paths = await fixture();
  t.after(() => rm(paths.root, { recursive: true, force: true }));
  const pi = fakePi();
  const session = fakeSession();
  await createAs02Extension({
    env: environment(paths),
    loadRuntime: async () => ({}),
    createSession: () => session,
  })(pi);

  await pi.handlers.get('session_shutdown')();
  await pi.handlers.get('session_shutdown')();
  assert.equal(session.calls.close, 1);
});

test('extension source exposes no diagnostic disable flag or direct host fallback', async () => {
  const source = await readFile('spikes/as-02/pi-extension/src/index.ts', 'utf8');
  assert.doesNotMatch(source, /--no-sandbox|disableSandbox|hostFallback|spawn\s*\(/u);
  assert.match(source, /createSandboxSession/u);
  assert.match(source, /session\.run/u);
});
