import assert from 'node:assert/strict';
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

function snapshot(localConfigHash = HASH_A) {
  return {
    schemaVersion: 1,
    root: '/state/fixtures/tc-01/run/source-repo',
    head: { sha256: HASH_A, byteLength: 41, text: 'a'.repeat(40) },
    porcelainStatus: { sha256: HASH_A, byteLength: 0 },
    localConfig: { sha256: localConfigHash, byteLength: 10 },
    refs: { sha256: HASH_A, byteLength: 10 },
    trackedTree: { sha256: HASH_A, byteLength: 41, text: 'b'.repeat(40) },
    workingTree: { schemaVersion: 1, root: '/state/fixtures/tc-01/run/source-repo', digest: HASH_A, entries: [] },
  };
}

function bundle() {
  return {
    fixture: {
      runId: 'tc01-20260804-123456-a1b2c3d4',
      runRoot: '/state/fixtures/tc-01/run',
      sourceRepo: '/state/fixtures/tc-01/run/source-repo',
      poolRoot: '/state/fixtures/tc-01/run/pool-root',
      artifactsRoot: '/state/fixtures/tc-01/run/artifacts',
      snapshotsRoot: '/state/fixtures/tc-01/run/snapshots',
      fakeHome: '/state/fixtures/tc-01/run/fake-home',
      gitWrapperRoot: '/state/fixtures/tc-01/run/git-wrapper',
      holder: 'mnfs-tc01-tc01-20260804-123456-a1b2c3d4',
      initialCommit: 'a'.repeat(40),
    },
    provenance: provenance(),
    commandShapeHash: HASH_A,
    sourceBaseline: snapshot(),
  };
}

const verdict = { verdict: 'ACCEPT' };

function baseDependencies(overrides = {}) {
  return {
    currentCommandShapeHash: HASH_A,
    validateCleanupTargets: () => [],
    discoverCurrentProvenance: async () => provenance(),
    observeStatus: async () => [],
    snapshotManagedWorktree: async () => ({ porcelainStatus: { byteLength: 0 } }),
    snapshotSource: async () => snapshot(),
    compareSourceSnapshots: () => ({ equal: true, changedFields: [], changes: {} }),
    ...overrides,
  };
}

test('cleanup stops before status when the current Treehouse identity differs from the finalized Verdict', async () => {
  let statusCalls = 0;
  const assessment = await assessTc01CleanupSafety(
    { bundle: bundle(), verdict },
    baseDependencies({
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

test('cleanup compares the complete finalized source baseline, not only HEAD and porcelain status', async () => {
  const assessment = await assessTc01CleanupSafety(
    { bundle: bundle(), verdict },
    baseDependencies({
      snapshotSource: async () => snapshot(HASH_B),
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
