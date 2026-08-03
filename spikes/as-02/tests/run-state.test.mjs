import assert from 'node:assert/strict';
import { mkdtemp, readdir, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';

import {
  createRunStore,
  validateRunState,
} from '../src/run-state.mjs';

function state(overrides = {}) {
  return {
    schemaVersion: 1,
    runId: 'as02-20260803t020304z-a1b2c3',
    status: 'PHASE_ONE_RUNNING',
    createdAt: '2026-08-03T02:03:04.000Z',
    updatedAt: '2026-08-03T02:03:04.000Z',
    repositoryPath: '/home/user/src/mnfs',
    artifactRoot: '/home/user/.local/state/mnfs/artifacts/as-02/as02-20260803t020304z-a1b2c3',
    fixtureRoot: '/tmp/mnfs-as-02/as02-20260803t020304z-a1b2c3',
    lease: null,
    preflight: { status: 'READY' },
    policies: {},
    scenarios: [],
    performance: null,
    checkpointPath: null,
    restart: null,
    decision: null,
    reportPath: null,
    cleanup: { status: 'PENDING', attempts: 0 },
    ...overrides,
  };
}

test('validates strict lifecycle states and Linux-owned paths', () => {
  assert.deepEqual(validateRunState(state()), state());
  for (const invalid of [
    state({ schemaVersion: 2 }),
    state({ runId: '../escape' }),
    state({ status: 'DONE' }),
    state({ repositoryPath: '/mnt/c/src/mnfs' }),
    state({ artifactRoot: 'relative' }),
    state({ unknown: true }),
  ]) {
    assert.throws(
      () => validateRunState(invalid),
      (error) => error?.code === 'RUN_STATE_INVALID',
    );
  }
});

test('writes state and latest index atomically and recovers in a fresh store', async (t) => {
  const base = await mkdtemp(join(tmpdir(), 'mnfs-as02-run-store-'));
  t.after(() => rm(base, { recursive: true, force: true }));
  const store = await createRunStore(base);
  await store.save(state());

  const entries = await readdir(join(base, state().runId));
  assert.deepEqual(entries, ['state.json']);
  assert.deepEqual(JSON.parse(await readFile(join(base, 'latest.json'), 'utf8')), {
    runId: state().runId,
  });

  const fresh = await createRunStore(base);
  assert.deepEqual(await fresh.load(state().runId), state());
  assert.deepEqual(await fresh.latest(), state());
});

test('enforces allowed status transitions and increments cleanup attempts', async (t) => {
  const base = await mkdtemp(join(tmpdir(), 'mnfs-as02-run-store-'));
  t.after(() => rm(base, { recursive: true, force: true }));
  const store = await createRunStore(base);
  await store.save(state());

  const awaiting = await store.update(state().runId, (current) => ({
    ...current,
    status: 'AWAITING_RESTART',
    updatedAt: '2026-08-03T02:10:00.000Z',
    checkpointPath: `${current.artifactRoot}/restart-checkpoint.json`,
  }));
  assert.equal(awaiting.status, 'AWAITING_RESTART');

  await assert.rejects(
    () => store.update(state().runId, (current) => ({ ...current, status: 'PHASE_ONE_RUNNING' })),
    (error) => error?.code === 'RUN_STATE_TRANSITION_INVALID',
  );

  const cleaning = await store.beginCleanup(state().runId, '2026-08-03T02:11:00.000Z');
  assert.deepEqual(cleaning.cleanup, {
    status: 'RUNNING',
    attempts: 1,
    startedAt: '2026-08-03T02:11:00.000Z',
  });
  const retry = await store.beginCleanup(state().runId, '2026-08-03T02:12:00.000Z');
  assert.equal(retry.cleanup.attempts, 2);
});

test('refuses state path traversal and missing latest state', async (t) => {
  const base = await mkdtemp(join(tmpdir(), 'mnfs-as02-run-store-'));
  t.after(() => rm(base, { recursive: true, force: true }));
  const store = await createRunStore(base);

  await assert.rejects(
    () => store.load('../escape'),
    (error) => error?.code === 'RUN_STATE_INVALID',
  );
  await assert.rejects(
    () => store.latest(),
    (error) => error?.code === 'RUN_STATE_NOT_FOUND',
  );
});
