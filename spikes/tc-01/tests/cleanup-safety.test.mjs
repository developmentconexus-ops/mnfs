import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { assessTc01CleanupSafety } from '../src/orchestrator.mjs';

const HASH_A = `sha256:${'a'.repeat(64)}`;
const HASH_B = `sha256:${'b'.repeat(64)}`;

function provenance(hash = HASH_A) {
  return {
    schemaVersion: 1,
    environment: 'WSL2',
    ubuntuRelease: '24.04',
    kernelRelease: '6.6.87.2-microsoft-standard-WSL2',
    nodeVersion: 'v24.18.0',
    gitVersion: '2.54.0',
    treehouseVersion: '2.1.1',
    treehouseExecutable: '/opt/tc01/treehouse',
    treehouseExecutableHash: hash,
    capabilities: {
      leaseJson: true,
      statusJson: true,
      conditionalLeaseId: true,
      conditionalHolder: true,
    },
    capturedAt: '2026-08-04T12:00:00Z',
  };
}

function snapshot(root, localConfigHash = HASH_A) {
  return {
    schemaVersion: 1,
    root,
    head: { sha256: HASH_A, byteLength: 41, text: 'a'.repeat(40) },
    porcelainStatus: { sha256: HASH_A, byteLength: 0 },
    localConfig: { sha256: localConfigHash, byteLength: 10 },
    refs: { sha256: HASH_A, byteLength: 10 },
    trackedTree: { sha256: HASH_A, byteLength: 41, text: 'b'.repeat(40) },
    workingTree: { schemaVersion: 1, root, digest: HASH_A, entries: [] },
  };
}

function bundle(runRoot, sourceRepo) {
  return {
    fixture: {
      runId: 'tc01-20260804-123456-a1b2c3d4',
      runRoot,
      sourceRepo,
      poolRoot: join(runRoot, 'pool-root'),
      artifactsRoot: join(runRoot, 'artifacts'),
      snapshotsRoot: join(runRoot, 'snapshots'),
      fakeHome: join(runRoot, 'fake-home'),
      gitWrapperRoot: join(runRoot, 'git-wrapper'),
      holder: 'mnfs-tc01-tc01-20260804-123456-a1b2c3d4',
      initialCommit: 'a'.repeat(40),
    },
    provenance: provenance(),
    commandShapeHash: HASH_A,
    sourceBaseline: snapshot(sourceRepo),
  };
}

const verdict = { verdict: 'ACCEPT' };

function baseDependencies(sourceRepo, overrides = {}) {
  return {
    currentCommandShapeHash: HASH_A,
    validateCleanupTargets: () => [],
    discoverCurrentProvenance: async () => provenance(),
    observeStatus: async () => [],
    snapshotManagedWorktree: async () => ({ porcelainStatus: { byteLength: 0 } }),
    snapshotSource: async () => snapshot(sourceRepo),
    compareSourceSnapshots: () => ({ equal: true, changedFields: [], changes: {} }),
    ...overrides,
  };
}

async function cleanupFixture(t) {
  const runRoot = await mkdtemp(join(tmpdir(), 'mnfs-tc01-cleanup-review-'));
  t.after(() => rm(runRoot, { recursive: true, force: true }));
  const sourceRepo = join(runRoot, 'source-repo');
  await mkdir(sourceRepo);
  return { runRoot, sourceRepo };
}

test('cleanup stops before status when the current Treehouse identity differs from the finalized Verdict', async (t) => {
  const fixture = await cleanupFixture(t);
  let statusCalls = 0;
  const assessment = await assessTc01CleanupSafety(
    { bundle: bundle(fixture.runRoot, fixture.sourceRepo), verdict },
    baseDependencies(fixture.sourceRepo, {
      discoverCurrentProvenance: async () => provenance(HASH_B),
      observeStatus: async () => {
        statusCalls += 1;
        return [];
      },
    }),
  );

  assert.equal(assessment.safe, false);
  assert.deepEqual(assessment.blockers, ['EVIDENCE_IDENTITY_DRIFT']);
  assert.equal(statusCalls, 0);
});

test('cleanup compares the complete finalized source baseline, not only HEAD and porcelain status', async (t) => {
  const fixture = await cleanupFixture(t);
  const assessment = await assessTc01CleanupSafety(
    { bundle: bundle(fixture.runRoot, fixture.sourceRepo), verdict },
    baseDependencies(fixture.sourceRepo, {
      snapshotSource: async () => snapshot(fixture.sourceRepo, HASH_B),
      compareSourceSnapshots: (before, after) => ({
        equal: before.localConfig.sha256 === after.localConfig.sha256,
        changedFields: ['localConfig'],
        changes: { localConfig: { before: before.localConfig, after: after.localConfig } },
      }),
    }),
  );

  assert.equal(assessment.safe, false);
  assert.deepEqual(assessment.blockers, ['SOURCE_CHANGED']);
  assert.deepEqual(assessment.sourceComparison.changedFields, ['localConfig']);
});
