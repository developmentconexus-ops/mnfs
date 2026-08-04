import assert from 'node:assert/strict';
import test from 'node:test';

import {
  TC01_SCENARIO_IDS,
  runTc01Scenarios,
} from '../src/scenario-runner.mjs';

const HASH_A = `sha256:${'a'.repeat(64)}`;
const HASH_B = `sha256:${'b'.repeat(64)}`;
const HASH_C = `sha256:${'c'.repeat(64)}`;

function deterministicClock() {
  let tick = 0;
  return () => new Date(Date.UTC(2026, 7, 4, 11, 0, tick++));
}

function statusItem(lease) {
  return {
    name: 'oak',
    path: lease.path,
    status: 'leased',
    leaseId: lease.leaseId,
    leaseHolder: lease.leaseHolder,
    leasedAt: lease.leasedAt,
    processes: [],
  };
}

function snapshot(label, digest) {
  return { schemaVersion: 1, label, digest };
}

function createHarness(overrides = {}) {
  const lease = {
    path: '/tmp/mnfs-tc01/pool/oak/source-repo',
    leaseId: 'lease-001',
    leaseHolder: 'mnfs-tc01-tc01-20260804-110000-a1b2c3d4',
    leasedAt: '2026-08-04T11:00:00Z',
  };
  const provenance = {
    schemaVersion: 1,
    environment: 'WSL2',
    ubuntuRelease: '24.04',
    kernelRelease: '6.6.87.2-microsoft-standard-WSL2',
    nodeVersion: 'v24.18.0',
    gitVersion: '2.54.0',
    treehouseVersion: '2.1.1',
    treehouseExecutable: '/usr/local/bin/treehouse',
    treehouseExecutableHash: HASH_A,
    capabilities: {
      leaseJson: true,
      statusJson: true,
      conditionalLeaseId: true,
      conditionalHolder: true,
    },
    capturedAt: '2026-08-04T11:00:00Z',
  };
  const currentIdentity = {
    treehouseExecutableHash: provenance.treehouseExecutableHash,
    treehouseVersion: provenance.treehouseVersion,
    gitVersion: provenance.gitVersion,
    kernelRelease: provenance.kernelRelease,
    ubuntuRelease: provenance.ubuntuRelease,
    commandShapeHash: HASH_C,
  };
  const records = [];
  const calls = {
    acquire: 0,
    freshAcquire: 0,
    originalStatus: 0,
    freshStatus: 0,
    linkedProof: 0,
    gitLog: 0,
    remotes: 0,
    commandEvidence: 0,
  };
  const sourceBefore = snapshot('source', HASH_A);
  const sourceAfter = snapshot('source', HASH_A);
  const worktreeBefore = snapshot('worktree', HASH_B);
  const worktreeAfter = snapshot('worktree', HASH_B);
  const poolBefore = snapshot('pool', HASH_A);
  const poolAfter = snapshot('pool', HASH_B);
  const privateSnapshots = [
    { state: 'MISSING', digest: null },
    { state: 'PRESENT', digest: HASH_C },
  ];
  let privateIndex = 0;

  const client = {
    async acquireLease() {
      calls.acquire += 1;
      return lease;
    },
    async observeStatus() {
      calls.originalStatus += 1;
      return [statusItem(lease)];
    },
    findStatusByPath(status, path) {
      return status.find((item) => item.path === path) ?? null;
    },
  };

  const freshClient = {
    async acquireLease() {
      calls.freshAcquire += 1;
      throw new Error('fresh recovery must not acquire');
    },
    async observeStatus() {
      calls.freshStatus += 1;
      return [statusItem(lease)];
    },
    findStatusByPath(status, path) {
      return status.find((item) => item.path === path) ?? null;
    },
  };

  const input = {
    fixture: {
      runId: 'tc01-20260804-110000-a1b2c3d4',
      sourceRepo: '/tmp/mnfs-tc01/source-repo',
      poolRoot: '/tmp/mnfs-tc01/pool',
      gitLog: '/tmp/mnfs-tc01/artifacts/git-invocations.jsonl',
      holder: lease.leaseHolder,
    },
    provenance,
    acceptedIdentity: currentIdentity,
    commandShapeHash: currentIdentity.commandShapeHash,
    expectedEnvironmentKeySets: [[
      'GIT_CONFIG_NOSYSTEM',
      'GIT_OPTIONAL_LOCKS',
      'GIT_TERMINAL_PROMPT',
      'HOME',
      'LANG',
      'LC_ALL',
      'PATH',
      'TC01_GIT_LOG',
      'TC01_REAL_GIT',
      'TREEHOUSE_NO_UPDATE_CHECK',
    ]],
    client,
    createFreshClient() {
      return freshClient;
    },
    observers: {
      async snapshotRepository({ path, label }) {
        if (path === lease.path) {
          return label.includes('before') ? worktreeBefore : worktreeAfter;
        }
        return label.includes('before') ? sourceBefore : sourceAfter;
      },
      compareRepositorySnapshots(before, after) {
        return {
          equal: before.digest === after.digest,
          changedFields: before.digest === after.digest ? [] : ['digest'],
        };
      },
      async snapshotPathTree({ label }) {
        return label.includes('before') ? poolBefore : poolAfter;
      },
      comparePathSnapshots(before, after) {
        return {
          equal: before.digest === after.digest,
          changedFields: before.digest === after.digest ? [] : ['digest'],
        };
      },
      async proveLinkedWorktree() {
        calls.linkedProof += 1;
        return {
          linked: true,
          sameCommonDir: true,
          sourceClean: true,
          worktreeClean: true,
        };
      },
      async readGitInvocations() {
        calls.gitLog += 1;
        return [{ schemaVersion: 1, argv: ['worktree', 'add'], cwd: '/tmp/mnfs-tc01/source-repo' }];
      },
      assertNoFetchInvocation(entries) {
        assert.equal(entries.some((entry) => entry.argv[0] === 'fetch'), false);
      },
      async listRemotes() {
        calls.remotes += 1;
        return [];
      },
      async snapshotPrivateState() {
        const value = privateSnapshots[Math.min(privateIndex, privateSnapshots.length - 1)];
        privateIndex += 1;
        return value;
      },
    },
    commandEvidence: {
      async list() {
        calls.commandEvidence += 1;
        return [{
          commandId: 'acquire',
          shell: false,
          stdin: 'closed',
          timeoutMs: 30_000,
          stdoutLimitBytes: 65_536,
          stderrLimitBytes: 65_536,
          environmentKeys: [
            'GIT_CONFIG_NOSYSTEM',
            'GIT_OPTIONAL_LOCKS',
            'GIT_TERMINAL_PROMPT',
            'HOME',
            'LANG',
            'LC_ALL',
            'PATH',
            'TC01_GIT_LOG',
            'TC01_REAL_GIT',
            'TREEHOUSE_NO_UPDATE_CHECK',
          ],
        }];
      },
    },
    evidenceStore: {
      async writeScenario(record) {
        records.push(record);
      },
    },
    createScenarioRecord(outcome) {
      return { schemaVersion: 1, ...outcome };
    },
    now: deterministicClock(),
  };

  return {
    input: {
      ...input,
      ...overrides,
      observers: { ...input.observers, ...(overrides.observers ?? {}) },
      client: { ...input.client, ...(overrides.client ?? {}) },
      commandEvidence: { ...input.commandEvidence, ...(overrides.commandEvidence ?? {}) },
    },
    calls,
    lease,
    provenance,
    currentIdentity,
    records,
    snapshots: {
      sourceBefore,
      sourceAfter,
      worktreeBefore,
      worktreeAfter,
      poolBefore,
      poolAfter,
    },
  };
}

test('registers exactly S01-S15 and proves acquisition plus fresh-process recovery once', async () => {
  assert.deepEqual(TC01_SCENARIO_IDS, Array.from(
    { length: 15 },
    (_, index) => `TC01-S${String(index + 1).padStart(2, '0')}`,
  ));
  assert.equal(Object.isFrozen(TC01_SCENARIO_IDS), true);

  const harness = createHarness();
  const result = await runTc01Scenarios(harness.input);

  assert.deepEqual(result.map((record) => record.scenarioId), TC01_SCENARIO_IDS);
  assert.deepEqual(harness.records, result);
  assert.deepEqual(
    Object.fromEntries(result.map((record) => [record.scenarioId, record.result])),
    {
      'TC01-S01': 'PASS',
      'TC01-S02': 'PASS',
      'TC01-S03': 'PASS',
      'TC01-S04': 'PASS',
      'TC01-S05': 'PASS',
      'TC01-S06': 'PASS',
      'TC01-S07': 'BLOCKED',
      'TC01-S08': 'BLOCKED',
      'TC01-S09': 'BLOCKED',
      'TC01-S10': 'BLOCKED',
      'TC01-S11': 'BLOCKED',
      'TC01-S12': 'BLOCKED',
      'TC01-S13': 'PASS',
      'TC01-S14': 'PASS',
      'TC01-S15': 'PASS',
    },
  );
  assert.equal(harness.calls.acquire, 1);
  assert.equal(harness.calls.freshAcquire, 0);
  assert.equal(harness.calls.freshStatus, 1);
  assert.equal(harness.calls.linkedProof, 1);
  assert.equal(result[12].observations.limitation, 'TREEHOUSE_PRIVATE_STATE_NORMALIZATION');
  assert.equal(result[13].observations.commandCount, 1);
  assert.equal(result[14].observations.stale, false);
});

test('a material S02 failure blocks dependent S03-S13 but still executes S14 and S15', async () => {
  const harness = createHarness({
    client: {
      async acquireLease() {
        harness.calls.acquire += 1;
        const error = new Error('acquisition JSON holder mismatch');
        error.code = 'TC01_TREEHOUSE_INVALID_OUTPUT';
        throw error;
      },
    },
  });

  const result = await runTc01Scenarios(harness.input);
  const byId = Object.fromEntries(result.map((record) => [record.scenarioId, record]));

  assert.equal(byId['TC01-S01'].result, 'PASS');
  assert.equal(byId['TC01-S02'].result, 'FAIL');
  for (let index = 3; index <= 13; index += 1) {
    const id = `TC01-S${String(index).padStart(2, '0')}`;
    assert.equal(byId[id].result, 'BLOCKED', id);
    assert.equal(byId[id].observations.blockedBy, 'TC01-S02', id);
  }
  assert.equal(byId['TC01-S14'].result, 'PASS');
  assert.equal(byId['TC01-S15'].result, 'PASS');
  assert.equal(harness.calls.freshStatus, 0);
  assert.equal(harness.calls.gitLog, 0);
  assert.equal(harness.calls.remotes, 0);
  assert.equal(harness.calls.commandEvidence, 1);
});

test('S13 fails when private-state mutation coincides with Lease or worktree mutation', async () => {
  const harness = createHarness({
    observers: {
      async snapshotRepository({ path, label }) {
        if (path === harness.lease.path && label.includes('after')) {
          return snapshot('worktree', HASH_C);
        }
        if (path === harness.lease.path) return harness.snapshots.worktreeBefore;
        return label.includes('before') ? harness.snapshots.sourceBefore : harness.snapshots.sourceAfter;
      },
    },
  });

  const result = await runTc01Scenarios(harness.input);
  const s13 = result.find((record) => record.scenarioId === 'TC01-S13');

  assert.equal(s13.result, 'FAIL');
  assert.equal(s13.observations.privateStateChanged, true);
  assert.equal(s13.observations.worktreeUnchanged, false);
  assert.match(s13.rationale, /private state/i);
});

test('S14 rejects command Evidence that violates the process contract', async () => {
  const harness = createHarness({
    commandEvidence: {
      async list() {
        harness.calls.commandEvidence += 1;
        return [{
          commandId: 'unsafe',
          shell: true,
          stdin: 'closed',
          timeoutMs: 30_000,
          stdoutLimitBytes: 65_536,
          stderrLimitBytes: 65_536,
          environmentKeys: harness.input.expectedEnvironmentKeySets[0],
        }];
      },
    },
  });

  const result = await runTc01Scenarios(harness.input);
  const s14 = result.find((record) => record.scenarioId === 'TC01-S14');

  assert.equal(s14.result, 'FAIL');
  assert.deepEqual(s14.observations.invalidCommands, ['unsafe']);
});

test('S15 blocks reuse when any accepted identity or command shape drifts', async () => {
  const harness = createHarness({
    acceptedIdentity: {
      treehouseExecutableHash: HASH_B,
      treehouseVersion: '2.1.1',
      gitVersion: '2.54.0',
      kernelRelease: '6.6.87.2-microsoft-standard-WSL2',
      ubuntuRelease: '24.04',
      commandShapeHash: HASH_A,
    },
  });

  const result = await runTc01Scenarios(harness.input);
  const s15 = result.find((record) => record.scenarioId === 'TC01-S15');

  assert.equal(s15.result, 'BLOCKED');
  assert.equal(s15.observations.stale, true);
  assert.deepEqual(s15.observations.changedFields, [
    'commandShapeHash',
    'treehouseExecutableHash',
  ]);
  assert.match(s15.rationale, /cannot be reused/i);
});
