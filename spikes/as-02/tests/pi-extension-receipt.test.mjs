import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';

import { canonicalJson, sha256Text } from '../src/canonical-json.mjs';
import { createAs02Extension } from '../pi-extension/src/index.ts';

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'mnfs-as02-extension-receipt-'));
  const worktree = join(root, 'worktree');
  const trusted = join(root, 'trusted');
  const operationRoot = join(root, 'operations');
  const artifactRoot = join(root, 'artifacts');
  const broker = join(trusted, 'broker.mjs');
  const policyPath = join(trusted, 'policy.json');
  const receiptPath = join(artifactRoot, 'pi-extension-receipt.json');
  const eventPath = join(artifactRoot, 'pi-extension-events.jsonl');
  for (const path of [worktree, trusted, operationRoot, artifactRoot, join(root, 'fake-home'), join(root, 'attempt')]) {
    await mkdir(path, { recursive: true });
  }
  await writeFile(broker, '// broker');
  const config = { network: { allowedDomains: [], strictAllowlist: true }, filesystem: { allowWrite: [worktree] } };
  const hash = sha256Text(canonicalJson(config));
  await writeFile(policyPath, JSON.stringify({
    config,
    hash,
    workerEnv: {
      PATH: '/usr/bin:/bin',
      HOME: join(root, 'fake-home'),
      TMPDIR: join(root, 'attempt'),
      GIT_OPTIONAL_LOCKS: '0',
    },
  }));
  return {
    root,
    hash,
    worktree: await realpath(worktree),
    broker: await realpath(broker),
    policyPath: await realpath(policyPath),
    operationRoot: await realpath(operationRoot),
    artifactRoot: await realpath(artifactRoot),
    receiptPath,
    eventPath,
  };
}

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

test('writes startup inventory and content-free successful tool events outside Worker authority', async (t) => {
  const paths = await fixture();
  t.after(() => rm(paths.root, { recursive: true, force: true }));
  const pi = fakePi();
  const session = {
    async initialize() {},
    async run() {
      return {
        exitCode: 0,
        signal: null,
        stdout: Buffer.from(JSON.stringify({ ok: true, result: { operation: 'read', text: 'secret-looking content' } })),
        stderr: Buffer.alloc(0),
        startedAt: '2026-08-03T02:00:00.000Z',
        finishedAt: '2026-08-03T02:00:00.010Z',
      };
    },
    async close() {},
  };
  const env = {
    MNFS_AS02_POLICY_PATH: paths.policyPath,
    MNFS_AS02_POLICY_HASH: paths.hash,
    MNFS_AS02_WORKTREE: paths.worktree,
    MNFS_AS02_BROKER: paths.broker,
    MNFS_AS02_OPERATION_ROOT: paths.operationRoot,
    MNFS_AS02_ARTIFACT_ROOT: paths.artifactRoot,
    MNFS_AS02_EXTENSION_RECEIPT: paths.receiptPath,
    MNFS_AS02_EXTENSION_EVENTS: paths.eventPath,
  };

  await createAs02Extension({
    env,
    loadRuntime: async () => ({}),
    createSession: () => session,
    randomId: () => 'operation-1',
    now: () => '2026-08-03T02:00:00.000Z',
  })(pi);

  const receipt = JSON.parse(await readFile(paths.receiptPath, 'utf8'));
  assert.deepEqual(receipt, {
    schemaVersion: 1,
    type: 'startup',
    initializedAt: '2026-08-03T02:00:00.000Z',
    policyHash: paths.hash,
    worktree: paths.worktree,
    broker: paths.broker,
    tools: ['bash', 'read', 'write', 'edit', 'grep', 'find', 'ls'],
  });

  const readTool = pi.tools.find((tool) => tool.name === 'read');
  await readTool.execute('tool-call-1', { path: 'README.md', content: 'must-not-log' }, undefined, undefined, {});
  const events = (await readFile(paths.eventPath, 'utf8')).trim().split('\n').map(JSON.parse);
  assert.deepEqual(events, [{
    schemaVersion: 1,
    type: 'tool_call',
    toolCallId: 'tool-call-1',
    tool: 'read',
    policyHash: paths.hash,
    finishedAt: '2026-08-03T02:00:00.000Z',
    result: 'SUCCEEDED',
  }]);
  assert.doesNotMatch(JSON.stringify(events), /README|must-not-log|secret-looking content/u);
});
