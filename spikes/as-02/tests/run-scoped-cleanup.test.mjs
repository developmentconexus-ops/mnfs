import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';

import {
  buildInitialRunState,
  createRuntimeOperations,
  mountSentinelPath,
} from '../src/orchestrator-runtime.mjs';
import { controlledSocketPath } from '../src/controlled-socket.mjs';
import { createRunStore } from '../src/run-state.mjs';

test('cleanup derives ephemeral paths from runId instead of trusting nested state', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'mnfs-as02-cleanup-paths-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const repositoryPath = join(root, 'repository');
  const homeDirectory = join(root, 'home');
  const stateRoot = join(root, 'state');
  const artifactBase = join(stateRoot, 'artifacts', 'as-02');
  const runId = 'as02-20260803t135149712z-c10001';
  const artifactRoot = join(artifactBase, runId);
  const fixtureRoot = join(stateRoot, 'fixtures', 'as-02', runId);
  await Promise.all([
    mkdir(repositoryPath, { recursive: true }),
    mkdir(homeDirectory, { recursive: true }),
    mkdir(artifactRoot, { recursive: true }),
  ]);

  const store = await createRunStore(artifactBase);
  const initial = buildInitialRunState({
    runId,
    now: '2026-08-03T13:51:49.712Z',
    repositoryPath,
    artifactRoot,
    fixtureRoot,
    preflight: { status: 'READY' },
  });
  await store.save({
    ...initial,
    status: 'FAILED',
    lease: {
      acquired: true,
      path: join(root, 'lease'),
      repositoryPath: join(root, 'source-repo'),
      mountDirectory: join(root, 'must-not-remove'),
      controlledSocket: join(root, 'must-not-remove.sock'),
    },
    restart: { status: 'PHASE_ONE_FAILED' },
  });

  const socketCalls = [];
  const removeCalls = [];
  const operations = createRuntimeOperations({
    repositoryPath,
    homeDirectory,
    env: { MNFS_HOME: stateRoot, PATH: '/usr/bin:/bin' },
    releaseTreehouseLease: async () => ({ result: 'ALREADY_RELEASED' }),
    cleanupControlledSocket: async (actualRunId) => {
      socketCalls.push(actualRunId);
      return { path: controlledSocketPath(actualRunId), result: 'MISSING' };
    },
    removeRunScopedPath: async (path, options) => {
      removeCalls.push({ path, options });
    },
    now: () => '2026-08-03T13:52:00.000Z',
  });

  const result = await operations.cleanup({ runId });

  assert.equal(result.status, 'CLEANED');
  assert.deepEqual(socketCalls, [runId]);
  assert.deepEqual(removeCalls, [{
    path: dirname(mountSentinelPath(runId)),
    options: { recursive: true, force: true },
  }]);
  assert.equal(result.cleanup.socket.path, controlledSocketPath(runId));
  assert.equal(result.cleanup.socket.result, 'MISSING');
  assert.equal(result.cleanup.mount, 'REMOVED');
  assert.notEqual(removeCalls[0].path, join(root, 'must-not-remove'));
});
