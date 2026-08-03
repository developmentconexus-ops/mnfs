import assert from 'node:assert/strict';
import { mkdtemp, mkdir, realpath, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';

import { canonicalJson, sha256Text } from '../src/canonical-json.mjs';
import { runProcess } from '../src/process-runner.mjs';
import { createAs02Extension } from '../pi-extension/src/index.ts';

function fakePi() {
  const tools = [];
  const handlers = new Map();
  return {
    tools,
    handlers,
    registerTool(tool) { tools.push(tool); },
    on(event, handler) { handlers.set(event, handler); },
  };
}

test('propagates trusted broker boundary paths through the reduced sandbox environment', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'mnfs-as02-extension-broker-'));
  t.after(() => rm(root, { recursive: true, force: true }));

  const worktree = join(root, 'worktree');
  const trusted = join(root, 'trusted');
  const policyRoot = join(trusted, 'policy');
  const operationRoot = join(root, 'operations');
  const artifactRoot = join(root, 'artifacts');
  const fakeHome = join(root, 'fake-home');
  const attemptTemp = join(root, 'attempt-temp');
  const policyPath = join(policyRoot, 'active.json');
  const challengePath = join(worktree, 'challenge.txt');

  await Promise.all([
    mkdir(worktree, { recursive: true }),
    mkdir(policyRoot, { recursive: true }),
    mkdir(operationRoot, { recursive: true }),
    mkdir(artifactRoot, { recursive: true }),
    mkdir(fakeHome, { recursive: true }),
    mkdir(attemptTemp, { recursive: true }),
  ]);
  await writeFile(challengePath, 'nonce-from-real-broker\n');

  const config = {
    network: { allowedDomains: [], strictAllowlist: true },
    filesystem: { allowWrite: [worktree], denyWrite: [] },
  };
  const hash = sha256Text(canonicalJson(config));
  await writeFile(policyPath, `${JSON.stringify({
    config,
    hash,
    workerEnv: {
      PATH: process.env.PATH ?? '/usr/bin:/bin',
      HOME: fakeHome,
      TMPDIR: attemptTemp,
      GIT_OPTIONAL_LOCKS: '0',
    },
  })}\n`);

  const exactWorktree = await realpath(worktree);
  const exactOperationRoot = await realpath(operationRoot);
  const broker = await realpath(resolve('spikes/as-02/broker/index.mjs'));
  const pi = fakePi();
  let sessionInput;

  await createAs02Extension({
    env: {
      MNFS_AS02_POLICY_PATH: await realpath(policyPath),
      MNFS_AS02_POLICY_HASH: hash,
      MNFS_AS02_WORKTREE: exactWorktree,
      MNFS_AS02_BROKER: broker,
      MNFS_AS02_OPERATION_ROOT: exactOperationRoot,
      MNFS_AS02_ARTIFACT_ROOT: await realpath(artifactRoot),
    },
    loadRuntime: async () => ({}),
    createSession: (input) => {
      sessionInput = input;
      return {
        async initialize() {},
        async close() {},
        async run(argv, options) {
          return runProcess({
            file: argv[0],
            args: argv.slice(1),
            cwd: input.cwd,
            env: input.workerEnv,
            timeoutMs: options.timeoutMs,
            killProcessGroup: true,
          });
        },
      };
    },
    randomId: () => 'integration-operation',
  })(pi);

  const readTool = pi.tools.find((tool) => tool.name === 'read');
  const observed = await readTool.execute('integration-call', { path: 'challenge.txt' }, undefined);

  assert.equal(sessionInput.workerEnv.MNFS_AS02_WORKTREE, exactWorktree);
  assert.equal(sessionInput.workerEnv.MNFS_AS02_OPERATION_ROOT, exactOperationRoot);
  assert.deepEqual(JSON.parse(observed.content[0].text), {
    operation: 'read',
    path: 'challenge.txt',
    text: 'nonce-from-real-broker\n',
    bytes: 23,
    truncated: false,
  });
});
