import assert from 'node:assert/strict';
import test from 'node:test';

import {
  TC01_SCENARIO_IDS,
  runTc01Scenarios,
} from '../src/scenario-runner.mjs';

const HASH_A = `sha256:${'a'.repeat(64)}`;
const HASH_B = `sha256:${'b'.repeat(64)}`;
const HASH_C = `sha256:${'c'.repeat(64)}`;
const DIRTY_BYTES = Buffer.from('tc01-dirty-sentinel\n', 'utf8');

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

function availableStatus(path) {
  return {
    name: 'oak',
    path,
    status: 'available',
    leaseId: '',
    leaseHolder: '',
    leasedAt: null,
    processes: [],
  };
}

function snapshot(label, digest, { clean = true } = {}) {
  return {
    schemaVersion: 1,
    label,
    digest,
    porcelainStatus: {
      byteLength: clean ? 0 : 32,
      sha256: clean ? HASH_A : HASH_C,
    },
  };
}

function processResult(exitCode, { stderr = '', stdout = '' } = {}) {
  return {
    startedAt: '2026-08-04T11:00:00.000Z',
    finishedAt: '2026-08-04T11:00:00.001Z',
    durationMs: 1,
    exitCode,
    signal: null,
    stdout: Buffer.from(stdout),
    stderr: Buffer.from(stderr),
    timedOut: false,
  };
}

function createHarness(overrides = {}) {
  const leasePath = '/tmp/mnfs-tc01/pool/oak/source-repo';
  const holder = 'mnfs-tc01-tc01-20260804-110000-a1b2c3d4';
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
    acquireIds: [],
    freshAcquire: 0,
    originalStatus: 0,
    freshStatus: 0,
    linkedProof: 0,
    gitLog: 0,
    remotes: 0,
    commandEvidence: 0,
    returns: [],
    writes: [],
    reads: [],
    removes: [],
    inspectedTargets: [],
  };
  const sourceBefore = snapshot('source', HASH_A);
  const sourceAfter = snapshot('source', HASH_A);
  const poolBefore = snapshot('pool', HASH_A);
  const poolAfter = snapshot('pool', HASH_B);
  const privateSnapshots = [
    { state: 'MISSING', digest: null },
    { state: 'PRESENT', digest: HASH_C },
  ];
  let privateIndex = 0;
  let leaseSequence = 0;
  let currentLease = null;
  let dirtySentinel = null;

  function nextLease() {
    leaseSequence += 1;
    return {
      path: leasePath,
      leaseId: `lease-${String(leaseSequence).padStart(3, '0')}`,
      leaseHolder: holder,
      leasedAt: `2026-08-04T11:00:${String(leaseSequence).padStart(2, '0')}Z`,
    };
  }

  const client = {
    async acquireLease() {
      calls.acquire += 1;
      currentLease = nextLease();
      calls.acquireIds.push(currentLease.leaseId);
      return { ...currentLease };
    },
    async observeStatus() {
      calls.originalStatus += 1;
      return [currentLease ? statusItem(currentLease) : availableStatus(leasePath)];
    },
    findStatusByPath(status, path) {
      return status.find((item) => item.path === path) ?? null;
    },
    async returnLease(request) {
      calls.returns.push({ ...request });
      if (request.path.endsWith('/missing-worktree') || request.path.endsWith('/unmanaged-repo')) {
        return processResult(1, { stderr: 'not managed' });
      }
      if (!currentLease) return processResult(1, { stderr: 'already available' });
      if (dirtySentinel !== null) return processResult(0, { stderr: 'Aborted: worktree is dirty' });
      if (request.leaseId !== currentLease.leaseId || request.holder !== currentLease.leaseHolder) {
        return processResult(1, { stderr: 'lease precondition failed' });
      }
      currentLease = null;
      return processResult(0, { stdout: 'returned' });
    },
  };

  const freshClient = {
    async acquireLease() {
      calls.freshAcquire += 1;
      throw new Error('fresh recovery must not acquire');
    },
    async observeStatus() {
      calls.freshStatus += 1;
      return [currentLease ? statusItem(currentLease) : availableStatus(leasePath)];
    },
    findStatusByPath(status, path) {
      return status.find((item) => item.path === path) ?? null;
    },
  };

  const input = {
    fixture: {
      runId: 'tc01-20260804-110000-a1b2c3d4',
      runRoot: '/tmp/mnfs-tc01',
      sourceRepo: '/tmp/mnfs-tc01/source-repo',
      poolRoot: '/tmp/mnfs-tc01/pool',
      gitLog: '/tmp/mnfs-tc01/artifacts/git-invocations.jsonl',
      holder,
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
        if (path === leasePath) {
          const suffix = currentLease?.leaseId ?? 'available';
          return snapshot(label, dirtySentinel === null ? `worktree-${suffix}` : HASH_C, {
            clean: dirtySentinel === null,
          });
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
          worktreeClean: dirtySentinel === null,
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
      async writeControlledFile({ path, bytes }) {
        calls.writes.push(path);
        dirtySentinel = Buffer.from(bytes);
      },
      async readControlledFile({ path }) {
        calls.reads.push(path);
        if (dirtySentinel === null) {
          const error = new Error('missing controlled file');
          error.code = 'ENOENT';
          throw error;
        }
        return Buffer.from(dirtySentinel);
      },
      async removeControlledFile({ path }) {
        calls.removes.push(path);
        dirtySentinel = null;
      },
      async inspectReleaseTarget({ path }) {
        calls.inspectedTargets.push(path);
        if (path.endsWith('/missing-worktree')) return 'missing';
        if (path.endsWith('/unmanaged-repo')) return 'unmanaged';
        return 'managed';
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

  const mergedInput = {
    ...input,
    ...overrides,
    fixture: { ...input.fixture, ...(overrides.fixture ?? {}) },
    observers: { ...input.observers, ...(overrides.observers ?? {}) },
    client: { ...input.client, ...(overrides.client ?? {}) },
    commandEvidence: { ...input.commandEvidence, ...(overrides.commandEvidence ?? {}) },
  };

  return {
    input: mergedInput,
    calls,
    provenance,
    currentIdentity,
    records,
    state: {
      get currentLease() { return currentLease; },
      set currentLease(value) { currentLease = value; },
      get dirtySentinel() { return dirtySentinel; },
      set dirtySentinel(value) { dirtySentinel = value; },
    },
    snapshots: {
      sourceBefore,
      sourceAfter,
      poolBefore,
      poolAfter,
    },
  };
}

function byId(records) {
  return Object.fromEntries(records.map((record) => [record.scenarioId, record]));
}

test('registers exactly S01-S15 and proves acquisition, release isolation, recovery and classification', async () => {
  assert.deepEqual(TC01_SCENARIO_IDS, Array.from(
    { length: 15 },
    (_, index) => `TC01-S${String(index + 1).padStart(2, '0')}`,
  ));
  assert.equal(Object.isFrozen(TC01_SCENARIO_IDS), true);

  const harness = createHarness();
  const result = await runTc01Scenarios(harness.input);
  const scenarios = byId(result);

  assert.deepEqual(result.map((record) => record.scenarioId), TC01_SCENARIO_IDS);
  assert.deepEqual(harness.records, result);
  assert.deepEqual(
    Object.fromEntries(result.map((record) => [record.scenarioId, record.result])),
    Object.fromEntries(TC01_SCENARIO_IDS.map((id) => [id, 'PASS'])),
  );
  assert.equal(harness.calls.acquire, 5);
  assert.deepEqual(harness.calls.acquireIds, ['lease-001', 'lease-002', 'lease-003', 'lease-004', 'lease-005']);
  assert.equal(new Set(harness.calls.acquireIds).size, 5);
  assert.equal(harness.calls.freshAcquire, 0);
  assert.equal(harness.calls.freshStatus, 1);
  assert.equal(harness.calls.linkedProof, 5);
  assert.equal(harness.calls.returns.length, 10);
  assert.equal(scenarios['TC01-S07'].observations.releasedLeaseId, 'lease-001');
  assert.equal(scenarios['TC01-S08'].observations.staleLeaseId, 'stale-lease-002');
  assert.equal(scenarios['TC01-S09'].observations.staleHolder, `${harness.input.fixture.holder}-stale`);
  assert.equal(scenarios['TC01-S10'].observations.sentinelPreserved, true);
  assert.equal(scenarios['TC01-S10'].observations.releaseExitCode, 0);
  assert.equal(scenarios['TC01-S11'].observations.classification, 'ALREADY_RELEASED');
  assert.equal(scenarios['TC01-S11'].observations.rawReturnInvoked, false);
  assert.deepEqual(scenarios['TC01-S12'].observations.classifications, {
    missing: 'DIVERGED_MISSING_PATH',
    unmanaged: 'TREEHOUSE_UNMANAGED_PATH',
  });
  assert.equal(scenarios['TC01-S13'].observations.privateStateChanged, false);
  assert.equal(scenarios['TC01-S13'].observations.limitation, undefined);
  assert.equal(scenarios['TC01-S14'].observations.commandCount, 1);
  assert.equal(scenarios['TC01-S15'].observations.stale, false);
});

test('S13 records adjacent private-state normalization as a limitation when Lease and repositories remain intact', async () => {
  const harness = createHarness({
    observers: {
      async snapshotPrivateState({ label }) {
        return label === 'S13-private-after-status'
          ? { state: 'PRESENT', digest: HASH_C }
          : { state: 'PRESENT', digest: HASH_A };
      },
    },
  });

  const result = await runTc01Scenarios(harness.input);
  const s13 = result.find((record) => record.scenarioId === 'TC01-S13');

  assert.equal(s13.result, 'PASS');
  assert.equal(s13.observations.privateStateChanged, true);
  assert.equal(s13.observations.sourceUnchanged, true);
  assert.equal(s13.observations.worktreeUnchanged, true);
  assert.equal(s13.observations.limitation, 'TREEHOUSE_PRIVATE_STATE_NORMALIZATION');
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
  const scenarios = byId(result);

  assert.equal(scenarios['TC01-S01'].result, 'PASS');
  assert.equal(scenarios['TC01-S02'].result, 'FAIL');
  for (let index = 3; index <= 13; index += 1) {
    const id = `TC01-S${String(index).padStart(2, '0')}`;
    assert.equal(scenarios[id].result, 'BLOCKED', id);
    assert.equal(scenarios[id].observations.blockedBy, 'TC01-S02', id);
  }
  assert.equal(scenarios['TC01-S14'].result, 'PASS');
  assert.equal(scenarios['TC01-S15'].result, 'PASS');
  assert.equal(harness.calls.freshStatus, 0);
  assert.equal(harness.calls.gitLog, 0);
  assert.equal(harness.calls.remotes, 0);
  assert.equal(harness.calls.commandEvidence, 1);
});

test('S07 fails when command exit is zero but the exact Lease remains present', async () => {
  const harness = createHarness({
    client: {
      async returnLease(request) {
        harness.calls.returns.push({ ...request });
        if (request.leaseId === 'lease-001') return processResult(0, { stdout: 'returned' });
        return processResult(1);
      },
    },
  });

  const result = await runTc01Scenarios(harness.input);
  const scenarios = byId(result);

  assert.equal(scenarios['TC01-S07'].result, 'FAIL');
  assert.match(scenarios['TC01-S07'].rationale, /fresh status|lease/i);
  assert.equal(scenarios['TC01-S08'].result, 'BLOCKED');
  assert.equal(scenarios['TC01-S13'].result, 'BLOCKED');
});

test('S08 requires non-zero stale-ID rejection and unchanged Lease plus worktree state', async () => {
  const harness = createHarness({
    client: {
      async returnLease(request) {
        harness.calls.returns.push({ ...request });
        if (request.leaseId === 'stale-lease-002') return processResult(0, { stderr: 'unexpected success' });
        const active = harness.state.currentLease;
        if (active && request.leaseId === active.leaseId && request.holder === active.leaseHolder) {
          harness.state.currentLease = null;
          return processResult(0);
        }
        return processResult(1);
      },
    },
  });

  const result = await runTc01Scenarios(harness.input);
  const scenarios = byId(result);

  assert.equal(scenarios['TC01-S08'].result, 'FAIL');
  assert.match(scenarios['TC01-S08'].rationale, /non-zero|stale/i);
  assert.equal(scenarios['TC01-S09'].result, 'BLOCKED');
  assert.equal(harness.state.currentLease?.leaseId, 'lease-002');
});

test('S09 fails when a wrong holder changes the current Lease despite a non-zero process exit', async () => {
  const harness = createHarness({
    client: {
      async returnLease(request) {
        harness.calls.returns.push({ ...request });
        const active = harness.state.currentLease;
        if (active && request.holder.endsWith('-stale')) {
          harness.state.currentLease = null;
          return processResult(1, { stderr: 'precondition failed after mutation' });
        }
        if (active && request.leaseId === active.leaseId && request.holder === active.leaseHolder) {
          harness.state.currentLease = null;
          return processResult(0);
        }
        return processResult(1);
      },
    },
  });

  const result = await runTc01Scenarios(harness.input);
  const scenarios = byId(result);

  assert.equal(scenarios['TC01-S09'].result, 'FAIL');
  assert.match(scenarios['TC01-S09'].rationale, /holder|lease/i);
  assert.equal(scenarios['TC01-S10'].result, 'BLOCKED');
});

test('S10 fails when a dirty non-force return removes the sentinel or releases the Lease', async () => {
  const harness = createHarness({
    client: {
      async returnLease(request) {
        harness.calls.returns.push({ ...request });
        const active = harness.state.currentLease;
        if (active?.leaseId === 'lease-004' && harness.state.dirtySentinel !== null) {
          harness.state.dirtySentinel = null;
          harness.state.currentLease = null;
          return processResult(0, { stdout: 'returned and reset' });
        }
        if (active && request.leaseId === active.leaseId && request.holder === active.leaseHolder) {
          harness.state.currentLease = null;
          return processResult(0);
        }
        return processResult(1);
      },
    },
  });

  const result = await runTc01Scenarios(harness.input);
  const scenarios = byId(result);

  assert.equal(scenarios['TC01-S10'].result, 'FAIL');
  assert.match(scenarios['TC01-S10'].rationale, /dirty|sentinel|lease/i);
  assert.equal(scenarios['TC01-S11'].result, 'BLOCKED');
  assert.equal(scenarios['TC01-S13'].result, 'BLOCKED');
});

test('S13 fails when private-state mutation coincides with Lease or worktree mutation', async () => {
  const harness = createHarness({
    observers: {
      async snapshotPrivateState({ label }) {
        return label === 'S13-private-after-status'
          ? { state: 'PRESENT', digest: HASH_C }
          : { state: 'PRESENT', digest: HASH_A };
      },
      async snapshotRepository({ path, label }) {
        if (path.endsWith('/pool/oak/source-repo') && label.includes('after-private')) {
          return snapshot('worktree', HASH_C, { clean: false });
        }
        if (path.endsWith('/pool/oak/source-repo')) {
          const active = harness.state.currentLease;
          return snapshot(label, `worktree-${active?.leaseId ?? 'available'}`);
        }
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
