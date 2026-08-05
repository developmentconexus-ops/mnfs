import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
  accessSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';

import { canonicalJson } from '../../src/domain/mission-plan.js';
import type { Attempt, Lease, ProcessIdentity, WriteTrack } from '../../src/execution/model.js';
import { SqliteStore } from '../../src/store/sqlite-store.js';

const RECOVERY_SERVICE_SPECIFIER = '../../src/services/' + 'recovery-service.js';
const OPENED_AT = '2026-08-05T15:10:00.000Z';
const OCCURRED_AT = '2026-08-05T15:11:00.000Z';
const UPDATED_AT = '2026-08-05T15:12:00.000Z';
const CONTRACT_HASH = `sha256:${'a'.repeat(64)}`;
const SOURCE_FINGERPRINT = `sha256:${'b'.repeat(64)}`;
const LEASE_INPUT_HASH = `sha256:${'c'.repeat(64)}`;
const BASE_COMMIT = '1'.repeat(40);
const BASE_TREE = '2'.repeat(40);
const HOLDER = 'mnfs-task12-recovery-lse001-g1';
const EXTERNAL_LEASE_ID = 'treehouse-task12-recovery-001';
const WORKTREE_PATH = '/home/mnfs/runtime/treehouse/pool/tree-task12-recovery-001';
const LEASED_AT = '2026-08-05T15:09:00.000Z';

const RUNNER_ONE: ProcessIdentity = {
  bootId: 'boot-task12-runner-one',
  pid: 9101,
  startTicks: '131001',
};
const RUNNER_TWO: ProcessIdentity = {
  bootId: 'boot-task12-runner-two',
  pid: 9102,
  startTicks: '131002',
};

interface RecoverySourceObservation {
  readonly status: 'READY' | 'REQUESTED' | 'CHANGED' | 'MISSING' | 'UNKNOWN';
  readonly attemptId?: string;
  readonly path?: string;
  readonly fingerprint?: string;
  readonly baseCommitSha?: string;
  readonly baseTreeSha?: string;
  readonly objectFormat?: 'sha1' | 'sha256';
}

interface RecoveryLeaseCandidate {
  readonly path: string;
  readonly managed: boolean;
  readonly sourcePath: string;
  readonly status: 'available' | 'leased' | 'missing';
  readonly gitStatus: 'CLEAN' | 'DIRTY' | 'UNKNOWN';
  readonly leaseId?: string;
  readonly holder?: string;
  readonly leasedAt?: string;
}

interface RecoveryActionCandidate {
  readonly actionToken: string;
  readonly state: 'CLAIMED' | 'STARTED' | 'FINISHED' | 'CONFLICT';
  readonly kind: 'GRANT' | 'RELEASE';
  readonly runner?: ProcessIdentity;
  readonly startedRef?: string;
  readonly resultRef?: string;
}

interface RecoveryProcessCandidate {
  readonly identity: ProcessIdentity;
  readonly alive: boolean;
}

interface RecoveryWorldObservation {
  readonly sources: readonly RecoverySourceObservation[];
  readonly leases: readonly RecoveryLeaseCandidate[];
  readonly actions: readonly RecoveryActionCandidate[];
  readonly processes: readonly RecoveryProcessCandidate[];
}

interface RecoveryObservationAuthority {
  observe(input: Readonly<{ writeTrackId?: string }>): Promise<RecoveryWorldObservation>;
}

type RecoveryCode =
  | 'HEALTHY'
  | 'ADOPTABLE'
  | 'LD-01'
  | 'LD-02'
  | 'LD-03'
  | 'LD-04'
  | 'LD-05'
  | 'LD-06'
  | 'LD-07'
  | 'SD-01'
  | 'SD-02'
  | 'UNKNOWN';

interface RecoveryFinding {
  readonly code: RecoveryCode;
  readonly target: string;
  readonly severity: 'INFO' | 'BLOCKING';
  readonly safeActions: readonly string[];
  readonly requiredAuthority: 'NONE' | 'ORIGINAL_OPERATION' | 'OPERATOR';
  readonly nextAction: string;
}

interface RecoveryReport {
  readonly schemaVersion: 1;
  readonly writeTrackId?: string;
  readonly expected: Readonly<{
    writeTrack?: WriteTrack;
    attempt?: Attempt;
    lease?: Lease;
  }>;
  readonly findings: readonly RecoveryFinding[];
  readonly observed: RecoveryWorldObservation;
  readonly observationHashes: Readonly<{
    sources: string;
    leases: string;
    actions: string;
    processes: string;
  }>;
  readonly contentHash: string;
}

interface RecoveryServiceContract {
  recover(input: Readonly<{ writeTrackId?: string }>): Promise<RecoveryReport>;
}

interface RecoveryServiceModule {
  readonly RecoveryService: new (input: Readonly<{
    store: SqliteStore;
    observations: RecoveryObservationAuthority;
  }>) => RecoveryServiceContract;
}

interface Harness {
  readonly root: string;
  readonly databasePath: string;
  readonly resourcePath: string;
  readonly sourcePath: string;
  readonly store: SqliteStore;
  readonly track: WriteTrack;
  readonly attempt: Attempt;
  readonly lease: Lease;
  readonly observations: ScriptedRecoveryObservations;
}

class ScriptedRecoveryObservations implements RecoveryObservationAuthority {
  readonly calls: Array<Readonly<{ writeTrackId?: string }>> = [];
  current: RecoveryWorldObservation;

  constructor(current: RecoveryWorldObservation) {
    this.current = current;
  }

  async observe(input: Readonly<{ writeTrackId?: string }>): Promise<RecoveryWorldObservation> {
    this.calls.push({ ...input });
    return structuredClone(this.current);
  }
}

function describeError(error: unknown): string {
  return error instanceof Error ? `${error.name}: ${error.message}` : String(error);
}

async function loadRecoveryService(): Promise<RecoveryServiceModule> {
  try {
    return await import(RECOVERY_SERVICE_SPECIFIER) as RecoveryServiceModule;
  } catch (error) {
    assert.fail(`M01 RecoveryService is not implemented: ${describeError(error)}`);
  }
}

function exactSource(attempt: Attempt, sourcePath: string): RecoverySourceObservation {
  return {
    status: 'READY',
    attemptId: attempt.id,
    path: sourcePath,
    fingerprint: SOURCE_FINGERPRINT,
    baseCommitSha: BASE_COMMIT,
    baseTreeSha: BASE_TREE,
    objectFormat: 'sha1',
  };
}

function exactLease(sourcePath: string): RecoveryLeaseCandidate {
  return {
    path: WORKTREE_PATH,
    managed: true,
    sourcePath,
    status: 'leased',
    gitStatus: 'CLEAN',
    leaseId: EXTERNAL_LEASE_ID,
    holder: HOLDER,
    leasedAt: LEASED_AT,
  };
}

function withHarness(label: string, operation: (harness: Harness) => Promise<void>): Promise<void> {
  const root = mkdtempSync(join(tmpdir(), `mnfs-task12-recovery-${label}-`));
  const databasePath = join(root, 'mnfs.db');
  const resourcePath = join(root, 'managed-resource.txt');
  const sourcePath = join(root, 'execution-sources', 'WT-001', 'A01', 'source');
  mkdirSync(sourcePath, { recursive: true });
  writeFileSync(resourcePath, `preserve:${label}\n`, 'utf8');
  const store = SqliteStore.open(databasePath);
  store.openMission({
    missionId: 'MIS-002',
    eventId: `EVT-MIS-002-TASK12-RECOVERY-${label.toUpperCase()}-OPEN`,
    goal: 'Prove read-only deterministic Recovery classification',
    openedAt: OPENED_AT,
  });
  const track = store.execution.allocateWriteTrack({
    missionId: 'MIS-002',
    milestoneQualifiedId: 'MIS-002/M01',
    featureQualifiedId: 'MIS-002/M01/F01',
    contractHash: CONTRACT_HASH,
    occurredAt: OCCURRED_AT,
  });
  const openedAttempt = store.execution.allocateAttempt({
    writeTrackId: track.id,
    contractHash: CONTRACT_HASH,
    gitObjectFormat: 'sha1',
    baseCommitSha: BASE_COMMIT,
    occurredAt: OCCURRED_AT,
  });
  const attempt = store.execution.setAttemptState({
    id: openedAttempt.id,
    expectedVersion: openedAttempt.version,
    status: 'OPEN',
    sourceStatus: 'READY',
    sourcePath,
    sourceFingerprint: SOURCE_FINGERPRINT,
    updatedAt: UPDATED_AT,
  });
  const requested = store.execution.allocateLease({
    writeTrackId: track.id,
    attemptId: attempt.id,
    contractHash: CONTRACT_HASH,
    grantIdempotencyKey: `lease:grant:task12-recovery:${label}`,
    grantInputHash: LEASE_INPUT_HASH,
    holder: HOLDER,
    occurredAt: OCCURRED_AT,
  });
  const lease = store.execution.setLeaseState({
    id: requested.id,
    expectedVersion: requested.version,
    status: 'ACTIVE',
    externalLeaseId: EXTERNAL_LEASE_ID,
    worktreePath: WORKTREE_PATH,
    externalLeasedAt: LEASED_AT,
    updatedAt: UPDATED_AT,
  });
  const observations = new ScriptedRecoveryObservations({
    sources: [exactSource(attempt, sourcePath)],
    leases: [exactLease(sourcePath)],
    actions: [],
    processes: [],
  });

  return operation({
    root,
    databasePath,
    resourcePath,
    sourcePath,
    store,
    track,
    attempt,
    lease,
    observations,
  }).finally(() => {
    store.close();
    rmSync(root, { recursive: true, force: true });
  });
}

function serviceFor(module: RecoveryServiceModule, harness: Harness): RecoveryServiceContract {
  return new module.RecoveryService({
    store: harness.store,
    observations: harness.observations,
  });
}

function codes(report: RecoveryReport): RecoveryCode[] {
  return report.findings.map((finding) => finding.code);
}

function requireFinding(report: RecoveryReport, code: RecoveryCode): RecoveryFinding {
  const finding = report.findings.find((candidate) => candidate.code === code);
  assert.notEqual(finding, undefined, `Recovery report lacks ${code}`);
  return finding as RecoveryFinding;
}

function sha256(bytes: Buffer): string {
  return createHash('sha256').update(bytes).digest('hex');
}

function canonicalHash(value: unknown): string {
  return `sha256:${createHash('sha256').update(canonicalJson(value), 'utf8').digest('hex')}`;
}

function databaseSnapshot(databasePath: string): string {
  return sha256(readFileSync(databasePath));
}

function eventCount(databasePath: string): number {
  const database = new DatabaseSync(databasePath, { readOnly: true });
  try {
    const row = database.prepare('SELECT COUNT(*) AS count FROM events').get() as {
      readonly count: number;
    };
    return Number(row.count);
  } finally {
    database.close();
  }
}

function updateAttemptSourceRequested(harness: Harness): Attempt {
  return harness.store.execution.setAttemptState({
    id: harness.attempt.id,
    expectedVersion: harness.attempt.version,
    status: 'OPEN',
    sourceStatus: 'REQUESTED',
    updatedAt: UPDATED_AT,
  });
}

function updateLeaseRequested(harness: Harness): Lease {
  return harness.store.execution.setLeaseState({
    id: harness.lease.id,
    expectedVersion: harness.lease.version,
    status: 'REQUESTED',
    updatedAt: UPDATED_AT,
  });
}

function rawDatabase(databasePath: string, sql: string): void {
  const database = new DatabaseSync(databasePath);
  try {
    database.exec(sql);
  } finally {
    database.close();
  }
}

test('exports a read-only M01 RecoveryService boundary', async () => {
  const module = await loadRecoveryService();
  assert.equal(typeof module.RecoveryService, 'function');
  await withHarness('boundary', async (harness) => {
    const service = serviceFor(module, harness) as RecoveryServiceContract & Record<string, unknown>;
    assert.equal(typeof service.recover, 'function');
    for (const forbidden of ['repair', 'adopt', 'release', 'grant', 'claimAction']) {
      assert.equal(service[forbidden], undefined, `${forbidden} is outside plain Recovery`);
    }
  });
});

test('reports HEALTHY only for an exact one-to-one semantic and physical match', async () => {
  const module = await loadRecoveryService();
  await withHarness('healthy', async (harness) => {
    const report = await serviceFor(module, harness).recover({ writeTrackId: harness.track.id });
    assert.deepEqual(codes(report), ['HEALTHY']);
    const healthy = requireFinding(report, 'HEALTHY');
    assert.equal(healthy.severity, 'INFO');
    assert.equal(healthy.requiredAuthority, 'NONE');
    assert.equal(healthy.nextAction.length > 0, true);
    assert.match(report.contentHash, /^sha256:[0-9a-f]{64}$/u);
  });
});

test('reports ADOPTABLE for one exact external Lease matching a REQUESTED semantic intent', async () => {
  const module = await loadRecoveryService();
  await withHarness('adoptable', async (harness) => {
    updateLeaseRequested(harness);
    const report = await serviceFor(module, harness).recover({ writeTrackId: harness.track.id });
    const finding = requireFinding(report, 'ADOPTABLE');
    assert.equal(finding.requiredAuthority, 'ORIGINAL_OPERATION');
    assert.equal(finding.safeActions.length > 0, true);
    assert.equal(finding.nextAction.includes('grant'), true);
  });
});

test('classifies semantic Lease without an external match as LD-01', async () => {
  const module = await loadRecoveryService();
  await withHarness('ld01', async (harness) => {
    harness.observations.current = {
      ...harness.observations.current,
      leases: [],
    };
    const report = await serviceFor(module, harness).recover({ writeTrackId: harness.track.id });
    assert.equal(codes(report).includes('LD-01'), true);
    assert.equal(requireFinding(report, 'LD-01').severity, 'BLOCKING');
  });
});


test('reports HEALTHY when semantic and physical Lease state are both absent', async () => {
  const module = await loadRecoveryService();
  await withHarness('healthy-no-lease', async (harness) => {
    rawDatabase(harness.databasePath, 'DELETE FROM leases;');
    harness.observations.current = {
      sources: [exactSource(harness.attempt, harness.sourcePath)],
      leases: [],
      actions: [],
      processes: [],
    };

    const report = await serviceFor(module, harness).recover({ writeTrackId: harness.track.id });
    assert.deepEqual(codes(report), ['HEALTHY']);
    assert.equal(report.expected.lease, undefined);
  });
});

test('classifies MNFS-like external Lease without semantic ownership as LD-02', async () => {
  const module = await loadRecoveryService();
  await withHarness('ld02', async (harness) => {
    rawDatabase(harness.databasePath, 'DELETE FROM leases;');
    const report = await serviceFor(module, harness).recover({ writeTrackId: harness.track.id });
    const finding = requireFinding(report, 'LD-02');
    assert.equal(finding.requiredAuthority, 'OPERATOR');
    assert.equal(finding.safeActions.some((action) => action.includes('preserve')), true);
  });
});

test('classifies external Lease ID drift as LD-03', async () => {
  const module = await loadRecoveryService();
  await withHarness('ld03', async (harness) => {
    harness.observations.current = {
      ...harness.observations.current,
      leases: [{ ...exactLease(harness.sourcePath), leaseId: 'different-external-id' }],
    };
    const report = await serviceFor(module, harness).recover({ writeTrackId: harness.track.id });
    assert.equal(codes(report).includes('LD-03'), true);
  });
});

test('classifies holder drift as LD-04', async () => {
  const module = await loadRecoveryService();
  await withHarness('ld04', async (harness) => {
    harness.observations.current = {
      ...harness.observations.current,
      leases: [{ ...exactLease(harness.sourcePath), holder: 'different-holder' }],
    };
    const report = await serviceFor(module, harness).recover({ writeTrackId: harness.track.id });
    assert.equal(codes(report).includes('LD-04'), true);
  });
});

test('classifies missing, unmanaged or escaped worktree identity as LD-05', async () => {
  const module = await loadRecoveryService();
  for (const [label, candidate] of [
    ['missing', { ...exactLease('/missing/source'), managed: false, status: 'missing', gitStatus: 'UNKNOWN' }],
    ['unmanaged', { ...exactLease('/unmanaged/source'), managed: false }],
    ['escaped', { ...exactLease('/mnt/c/escaped/source'), path: '/mnt/c/escaped/tree' }],
  ] as const) {
    await withHarness(`ld05-${label}`, async (harness) => {
      harness.observations.current = {
        ...harness.observations.current,
        leases: [candidate],
      };
      const report = await serviceFor(module, harness).recover({ writeTrackId: harness.track.id });
      assert.equal(codes(report).includes('LD-05'), true);
    });
  }
});

test('classifies duplicate IDs, paths or holders as LD-06 without first-match selection', async () => {
  const module = await loadRecoveryService();
  for (const [label, second] of [
    ['id', { ...exactLease('/other/source'), path: `${WORKTREE_PATH}-2` }],
    ['path', { ...exactLease('/other/source'), leaseId: `${EXTERNAL_LEASE_ID}-2` }],
    ['holder', {
      ...exactLease('/other/source'),
      leaseId: `${EXTERNAL_LEASE_ID}-2`,
      path: `${WORKTREE_PATH}-2`,
    }],
  ] as const) {
    await withHarness(`ld06-${label}`, async (harness) => {
      harness.observations.current = {
        ...harness.observations.current,
        leases: [exactLease(harness.sourcePath), second],
      };
      const report = await serviceFor(module, harness).recover({ writeTrackId: harness.track.id });
      assert.equal(codes(report).includes('LD-06'), true);
      assert.equal(report.observed.leases.length, 2);
    });
  }
});

test('classifies inconclusive, conflicting or multiple helper evidence as LD-07', async () => {
  const module = await loadRecoveryService();
  await withHarness('ld07', async (harness) => {
    rawDatabase(harness.databasePath, `
      UPDATE leases
      SET action_kind = 'GRANT', action_token = 'lease-task12-action', action_phase = 'STARTED',
          action_owner_boot_id = 'boot-owner', action_owner_pid = 9001,
          action_owner_start_ticks = '130001',
          action_runner_boot_id = '${RUNNER_ONE.bootId}', action_runner_pid = ${RUNNER_ONE.pid},
          action_runner_start_ticks = '${RUNNER_ONE.startTicks}',
          action_started_ref = '/home/mnfs/actions/lease-task12-action/started.json'
      WHERE id = '${harness.lease.id}';
    `);
    harness.observations.current = {
      ...harness.observations.current,
      actions: [
        {
          actionToken: 'lease-task12-action',
          state: 'STARTED',
          kind: 'GRANT',
          runner: RUNNER_ONE,
          startedRef: '/home/mnfs/actions/lease-task12-action/started.json',
        },
        {
          actionToken: 'lease-task12-action',
          state: 'CONFLICT',
          kind: 'GRANT',
          runner: RUNNER_TWO,
          startedRef: '/home/mnfs/actions/lease-task12-action/other-started.json',
        },
      ],
      processes: [
        { identity: RUNNER_ONE, alive: false },
        { identity: RUNNER_TWO, alive: false },
      ],
    };
    const report = await serviceFor(module, harness).recover({ writeTrackId: harness.track.id });
    assert.equal(codes(report).includes('LD-07'), true);
    assert.equal(report.observed.actions.length, 2);
  });
});

test('classifies REQUESTED source with no final source as SD-01', async () => {
  const module = await loadRecoveryService();
  await withHarness('sd01', async (harness) => {
    updateAttemptSourceRequested(harness);
    harness.observations.current = {
      ...harness.observations.current,
      sources: [{ status: 'MISSING', attemptId: harness.attempt.id }],
    };
    const report = await serviceFor(module, harness).recover({ writeTrackId: harness.track.id });
    const finding = requireFinding(report, 'SD-01');
    assert.equal(finding.requiredAuthority, 'ORIGINAL_OPERATION');
  });
});

test('classifies source path, fingerprint, base or object-format drift as SD-02', async () => {
  const module = await loadRecoveryService();
  for (const [label, override] of [
    ['path', { path: '/different/source' }],
    ['fingerprint', { fingerprint: `sha256:${'d'.repeat(64)}` }],
    ['base', { baseCommitSha: '9'.repeat(40) }],
    ['format', { objectFormat: 'sha256' as const }],
  ] as const) {
    await withHarness(`sd02-${label}`, async (harness) => {
      harness.observations.current = {
        ...harness.observations.current,
        sources: [{ ...exactSource(harness.attempt, harness.sourcePath), ...override }],
      };
      const report = await serviceFor(module, harness).recover({ writeTrackId: harness.track.id });
      assert.equal(codes(report).includes('SD-02'), true);
    });
  }
});

test('classifies insufficient observation as UNKNOWN and blocks mutation', async () => {
  const module = await loadRecoveryService();
  await withHarness('unknown', async (harness) => {
    harness.observations.current = {
      sources: [{ status: 'UNKNOWN', attemptId: harness.attempt.id }],
      leases: [{
        path: WORKTREE_PATH,
        managed: true,
        sourcePath: harness.sourcePath,
        status: 'leased',
        gitStatus: 'UNKNOWN',
      }],
      actions: [],
      processes: [],
    };
    const report = await serviceFor(module, harness).recover({ writeTrackId: harness.track.id });
    const finding = requireFinding(report, 'UNKNOWN');
    assert.equal(finding.severity, 'BLOCKING');
    assert.equal(finding.requiredAuthority, 'OPERATOR');
  });
});

test('reports source and Lease divergences independently in one report', async () => {
  const module = await loadRecoveryService();
  await withHarness('combined', async (harness) => {
    harness.observations.current = {
      sources: [{
        ...exactSource(harness.attempt, harness.sourcePath),
        fingerprint: `sha256:${'e'.repeat(64)}`,
      }],
      leases: [
        exactLease(harness.sourcePath),
        { ...exactLease('/other/source'), path: `${WORKTREE_PATH}-duplicate` },
      ],
      actions: [],
      processes: [],
    };
    const report = await serviceFor(module, harness).recover({ writeTrackId: harness.track.id });
    assert.equal(codes(report).includes('SD-02'), true);
    assert.equal(codes(report).includes('LD-06'), true);
  });
});

test('preserves every observed candidate and provides blocker, safe action, authority and next action', async () => {
  const module = await loadRecoveryService();
  await withHarness('report-shape', async (harness) => {
    harness.observations.current = {
      sources: [
        exactSource(harness.attempt, harness.sourcePath),
        { status: 'MISSING', attemptId: 'WT-999/A01' },
      ],
      leases: [
        exactLease(harness.sourcePath),
        {
          path: '/home/mnfs/runtime/treehouse/orphan',
          managed: true,
          sourcePath: '/home/mnfs/runtime/execution-sources/orphan',
          status: 'leased',
          gitStatus: 'CLEAN',
          leaseId: 'orphan-lease',
          holder: 'mnfs-orphan',
          leasedAt: LEASED_AT,
        },
      ],
      actions: [{
        actionToken: 'orphan-action',
        state: 'FINISHED',
        kind: 'GRANT',
        runner: RUNNER_ONE,
        startedRef: '/home/mnfs/actions/orphan-action/started.json',
        resultRef: '/home/mnfs/actions/orphan-action/finished.json',
      }],
      processes: [{ identity: RUNNER_ONE, alive: false }],
    };
    const report = await serviceFor(module, harness).recover({ writeTrackId: harness.track.id });
    assert.deepEqual(report.observed, harness.observations.current);
    assert.equal(report.findings.length > 0, true);
    for (const finding of report.findings) {
      assert.equal(finding.target.length > 0, true);
      assert.equal(finding.safeActions.length > 0, true);
      assert.equal(finding.nextAction.length > 0, true);
    }
  });
});

test('plain Recovery is byte-for-byte non-mutating for SQLite, Events and managed resources', async () => {
  const module = await loadRecoveryService();
  await withHarness('non-mutating', async (harness) => {
    const beforeDatabase = databaseSnapshot(harness.databasePath);
    const beforeEvents = eventCount(harness.databasePath);
    const beforeResource = readFileSync(harness.resourcePath);
    const beforeObservation = structuredClone(harness.observations.current);

    const report = await serviceFor(module, harness).recover({ writeTrackId: harness.track.id });
    assert.equal(report.findings.length > 0, true);

    assert.equal(databaseSnapshot(harness.databasePath), beforeDatabase);
    assert.equal(eventCount(harness.databasePath), beforeEvents);
    assert.deepEqual(readFileSync(harness.resourcePath), beforeResource);
    assert.deepEqual(harness.observations.current, beforeObservation);
  });
});

test('same authoritative and observed inputs produce the same deterministic Recovery report', async () => {
  const module = await loadRecoveryService();
  await withHarness('deterministic', async (harness) => {
    const service = serviceFor(module, harness);
    const first = await service.recover({ writeTrackId: harness.track.id });
    const second = await service.recover({ writeTrackId: harness.track.id });
    assert.deepEqual(second, first);
    assert.equal(harness.observations.calls.length, 2);
  });
});

test('orders Recovery findings without ambient locale comparison', async () => {
  const module = await loadRecoveryService();
  await withHarness('locale-independent-order', async (harness) => {
    harness.observations.current = {
      sources: [],
      leases: [
        {
          path: '/home/mnfs/runtime/treehouse/pool/tree-unowned-z',
          managed: true,
          sourcePath: '/home/mnfs/runtime/sources/unowned-z',
          status: 'leased',
          gitStatus: 'CLEAN',
          leaseId: 'treehouse-unowned-z',
          holder: 'holder-unowned-z',
          leasedAt: LEASED_AT,
        },
        {
          path: '/home/mnfs/runtime/treehouse/pool/tree-unowned-a',
          managed: true,
          sourcePath: '/home/mnfs/runtime/sources/unowned-a',
          status: 'leased',
          gitStatus: 'CLEAN',
          leaseId: 'treehouse-unowned-a',
          holder: 'holder-unowned-a',
          leasedAt: LEASED_AT,
        },
      ],
      actions: [],
      processes: [],
    };

    const original = String.prototype.localeCompare;
    String.prototype.localeCompare = () => {
      throw new Error('ambient locale comparison is forbidden');
    };
    try {
      const report = await serviceFor(module, harness).recover({});
      assert.deepEqual(
        report.findings.filter((candidate) => candidate.code === 'LD-02').map((candidate) => candidate.target),
        [
          '/home/mnfs/runtime/treehouse/pool/tree-unowned-a',
          '/home/mnfs/runtime/treehouse/pool/tree-unowned-z',
        ],
      );
    } finally {
      String.prototype.localeCompare = original;
    }
  });
});

test('RecoveryService source contains no mutation, helper launch or destructive repair authority', async () => {
  const sourcePath = join(process.cwd(), 'src', 'services', 'recovery-service.ts');
  accessSync(sourcePath);
  const source = readFileSync(sourcePath, 'utf8');
  for (const [label, pattern] of [
    ['atomic mutation', /\.runAtomic\s*\(/u],
    ['store allocation', /\.(?:allocateWriteTrack|allocateAttempt|allocateWorkerRun|allocateLease|allocateClaim)\s*\(/u],
    ['state mutation', /\.(?:setWriteTrackStatus|setAttemptState|setWorkerRunState|setLeaseState|setLeaseLifecycle)\s*\(/u],
    ['helper launch', /\.launch\s*\(/u],
    ['grant or release call', /\.(?:grant|release)\s*\(/u],
    ['filesystem removal', /\b(?:rmSync|rmdir|unlink|remove)\s*\(/u],
    ['direct process execution', /\bexec(?:File)?(?:Sync)?\s*\(/u],
    ['destructive command', /\b(?:reset|clean|force|destroy|prune)\b/u],
  ] as const) {
    assert.equal(pattern.test(source), false, `${label} is forbidden in ${sourcePath}`);
  }
});

test('does not classify a semantic DIVERGED Lease as HEALTHY', async () => {
  const module = await loadRecoveryService();
  await withHarness('semantic-diverged', async (harness) => {
    harness.store.execution.setLeaseState({
      id: harness.lease.id,
      expectedVersion: harness.lease.version,
      status: 'DIVERGED',
      externalLeaseId: harness.lease.externalLeaseId!,
      worktreePath: harness.lease.worktreePath!,
      externalLeasedAt: harness.lease.externalLeasedAt!,
      updatedAt: UPDATED_AT,
    });
    const report = await serviceFor(module, harness).recover({ writeTrackId: harness.track.id });
    assert.equal(codes(report).includes('HEALTHY'), false);
    assert.equal(codes(report).includes('LD-07'), true);
  });
});

test('treats canonical path aliases as non-bijective Lease identity', async () => {
  const module = await loadRecoveryService();
  await withHarness('canonical-path-alias', async (harness) => {
    const leaf = WORKTREE_PATH.split('/').at(-1)!;
    harness.observations.current = {
      ...harness.observations.current,
      leases: [
        exactLease(harness.sourcePath),
        {
          ...exactLease('/other/source'),
          path: `${WORKTREE_PATH}/../${leaf}`,
          leaseId: `${EXTERNAL_LEASE_ID}-alias`,
          holder: `${HOLDER}-alias`,
        },
      ],
    };
    const report = await serviceFor(module, harness).recover({ writeTrackId: harness.track.id });
    assert.equal(codes(report).includes('LD-06'), true);
  });
});

test('does not ignore an unowned process candidate when deriving health', async () => {
  const module = await loadRecoveryService();
  await withHarness('unowned-process', async (harness) => {
    harness.observations.current = {
      ...harness.observations.current,
      processes: [{ identity: RUNNER_ONE, alive: true }],
    };
    const report = await serviceFor(module, harness).recover({ writeTrackId: harness.track.id });
    assert.equal(codes(report).includes('HEALTHY'), false);
    assert.equal(codes(report).includes('LD-07'), true);
  });
});

test('does not ignore an unowned source candidate when deriving health', async () => {
  const module = await loadRecoveryService();
  await withHarness('unowned-source', async (harness) => {
    harness.observations.current = {
      ...harness.observations.current,
      sources: [
        ...harness.observations.current.sources,
        {
          status: 'READY',
          attemptId: 'WT-999/A01',
          path: '/home/mnfs/runtime/sources/unowned-source',
          fingerprint: `sha256:${'9'.repeat(64)}`,
          baseCommitSha: '9'.repeat(40),
          baseTreeSha: '8'.repeat(40),
          objectFormat: 'sha1',
        },
      ],
    };

    const report = await serviceFor(module, harness).recover({ writeTrackId: harness.track.id });
    assert.equal(codes(report).includes('HEALTHY'), false);
    assert.equal(codes(report).includes('UNKNOWN'), true);
  });
});

test('classifies incomplete STARTED action evidence as LD-07', async () => {
  const module = await loadRecoveryService();
  await withHarness('incomplete-started', async (harness) => {
    rawDatabase(harness.databasePath, `
      UPDATE leases
      SET action_kind = 'GRANT', action_token = 'lease-task12-incomplete', action_phase = 'STARTED'
      WHERE id = '${harness.lease.id}';
    `);
    harness.observations.current = {
      ...harness.observations.current,
      actions: [{
        actionToken: 'lease-task12-incomplete',
        state: 'STARTED',
        kind: 'GRANT',
      }],
    };
    const report = await serviceFor(module, harness).recover({ writeTrackId: harness.track.id });
    assert.equal(codes(report).includes('LD-07'), true);
    assert.equal(codes(report).includes('HEALTHY'), false);
  });
});

test('classifies a missing external Lease timestamp as UNKNOWN', async () => {
  const module = await loadRecoveryService();
  await withHarness('missing-leased-at', async (harness) => {
    const { leasedAt: _leasedAt, ...candidate } = exactLease(harness.sourcePath);
    harness.observations.current = {
      ...harness.observations.current,
      leases: [candidate],
    };
    const report = await serviceFor(module, harness).recover({ writeTrackId: harness.track.id });
    assert.equal(codes(report).includes('UNKNOWN'), true);
  });
});

test('binds every observation collection to an exact canonical hash', async () => {
  const module = await loadRecoveryService();
  await withHarness('observation-hashes', async (harness) => {
    const report = await serviceFor(module, harness).recover({ writeTrackId: harness.track.id });
    assert.deepEqual(report.observationHashes, {
      sources: canonicalHash(report.observed.sources),
      leases: canonicalHash(report.observed.leases),
      actions: canonicalHash(report.observed.actions),
      processes: canonicalHash(report.observed.processes),
    });
  });
});

test('reports an abandoned Track with its latest RELEASED Lease as HEALTHY', async () => {
  const module = await loadRecoveryService();
  await withHarness('released-lineage', async (harness) => {
    harness.store.execution.setLeaseState({
      id: harness.lease.id,
      expectedVersion: harness.lease.version,
      status: 'RELEASED',
      externalLeaseId: harness.lease.externalLeaseId!,
      worktreePath: harness.lease.worktreePath!,
      externalLeasedAt: harness.lease.externalLeasedAt!,
      updatedAt: UPDATED_AT,
    });
    harness.store.execution.setWriteTrackStatus({
      id: harness.track.id,
      expectedVersion: harness.track.version,
      status: 'ABANDONED',
      updatedAt: UPDATED_AT,
    });
    harness.observations.current = {
      sources: [exactSource(harness.attempt, harness.sourcePath)],
      leases: [{
        path: WORKTREE_PATH,
        managed: true,
        sourcePath: harness.sourcePath,
        status: 'available',
        gitStatus: 'CLEAN',
      }],
      actions: [],
      processes: [],
    };

    const report = await serviceFor(module, harness).recover({ writeTrackId: harness.track.id });
    assert.deepEqual(codes(report), ['HEALTHY']);
    assert.equal(report.expected.writeTrack?.status, 'ABANDONED');
    assert.equal(report.expected.lease?.status, 'RELEASED');
  });
});

test('does not classify RELEASE_PENDING without decisive action evidence as HEALTHY', async () => {
  const module = await loadRecoveryService();
  await withHarness('release-pending-no-action', async (harness) => {
    rawDatabase(harness.databasePath, `
      UPDATE leases
      SET status = 'RELEASE_PENDING',
          release_idempotency_key = 'release-task12-pending',
          release_input_hash = 'sha256:${'d'.repeat(64)}',
          release_requested_at = '${UPDATED_AT}',
          version = version + 1,
          updated_at = '${UPDATED_AT}'
      WHERE id = '${harness.lease.id}';
    `);

    const report = await serviceFor(module, harness).recover({ writeTrackId: harness.track.id });
    assert.equal(codes(report).includes('HEALTHY'), false);
    assert.equal(codes(report).includes('LD-07'), true);
    assert.equal(
      report.findings.find((candidate) => candidate.code === 'LD-07')?.requiredAuthority,
      'ORIGINAL_OPERATION',
    );
  });
});


test('classifies an ACTIVE semantic Lease whose managed worktree is available as LD-01', async () => {
  const module = await loadRecoveryService();
  await withHarness('active-available', async (harness) => {
    harness.observations.current = {
      sources: [exactSource(harness.attempt, harness.sourcePath)],
      leases: [{
        path: WORKTREE_PATH,
        managed: true,
        sourcePath: harness.sourcePath,
        status: 'available',
        gitStatus: 'CLEAN',
      }],
      actions: [],
      processes: [],
    };

    const report = await serviceFor(module, harness).recover({ writeTrackId: harness.track.id });
    assert.equal(codes(report).includes('LD-01'), true);
    assert.equal(codes(report).includes('UNKNOWN'), false);
    assert.equal(codes(report).includes('HEALTHY'), false);
  });
});

test('reports a physically completed RELEASE_PENDING Lease as ADOPTABLE with exact action evidence', async () => {
  const module = await loadRecoveryService();
  await withHarness('release-pending-available', async (harness) => {
    const token = 'lease-task12-release-finished';
    const startedRef = `/home/mnfs/actions/${token}/started.json`;
    const resultRef = `/home/mnfs/actions/${token}/finished.json`;
    rawDatabase(harness.databasePath, `
      UPDATE leases
      SET status = 'RELEASE_PENDING',
          release_idempotency_key = 'release-task12-finished',
          release_input_hash = 'sha256:${'e'.repeat(64)}',
          release_requested_at = '${UPDATED_AT}',
          action_kind = 'RELEASE', action_token = '${token}', action_phase = 'FINISHED',
          action_owner_boot_id = '${RUNNER_ONE.bootId}', action_owner_pid = ${RUNNER_ONE.pid},
          action_owner_start_ticks = '${RUNNER_ONE.startTicks}',
          action_runner_boot_id = '${RUNNER_TWO.bootId}', action_runner_pid = ${RUNNER_TWO.pid},
          action_runner_start_ticks = '${RUNNER_TWO.startTicks}',
          action_started_ref = '${startedRef}', action_result_ref = '${resultRef}',
          version = version + 1,
          updated_at = '${UPDATED_AT}'
      WHERE id = '${harness.lease.id}';
    `);
    harness.observations.current = {
      sources: [exactSource(harness.attempt, harness.sourcePath)],
      leases: [{
        path: WORKTREE_PATH,
        managed: true,
        sourcePath: harness.sourcePath,
        status: 'available',
        gitStatus: 'CLEAN',
      }],
      actions: [{
        actionToken: token,
        state: 'FINISHED',
        kind: 'RELEASE',
        runner: RUNNER_TWO,
        startedRef,
        resultRef,
      }],
      processes: [{ identity: RUNNER_TWO, alive: false }],
    };

    const report = await serviceFor(module, harness).recover({ writeTrackId: harness.track.id });
    assert.equal(codes(report).includes('ADOPTABLE'), true);
    assert.equal(codes(report).includes('UNKNOWN'), false);
    assert.equal(codes(report).includes('LD-07'), false);
    assert.equal(codes(report).includes('HEALTHY'), false);
  });
});

test('accepts exact CLAIMED action evidence while the committed owner remains alive', async () => {
  const module = await loadRecoveryService();
  await withHarness('claimed-action-owner', async (harness) => {
    updateLeaseRequested(harness);
    const token = 'lease-task12-claimed-owner';
    const startedRef = `/home/mnfs/actions/${token}/started.json`;
    const resultRef = `/home/mnfs/actions/${token}/finished.json`;
    rawDatabase(harness.databasePath, `
      UPDATE leases
      SET action_kind = 'GRANT', action_token = '${token}', action_phase = 'CLAIMED',
          action_owner_boot_id = '${RUNNER_ONE.bootId}', action_owner_pid = ${RUNNER_ONE.pid},
          action_owner_start_ticks = '${RUNNER_ONE.startTicks}',
          action_started_ref = '${startedRef}', action_result_ref = '${resultRef}'
      WHERE id = '${harness.lease.id}';
    `);
    harness.observations.current = {
      ...harness.observations.current,
      actions: [{ actionToken: token, state: 'CLAIMED', kind: 'GRANT' }],
      processes: [{ identity: RUNNER_ONE, alive: true }],
    };

    const report = await serviceFor(module, harness).recover({ writeTrackId: harness.track.id });
    assert.equal(codes(report).includes('ADOPTABLE'), true);
    assert.equal(codes(report).includes('LD-07'), false);
  });
});

test('accepts exact STARTED evidence that is physically ahead of a CLAIMED semantic action', async () => {
  const module = await loadRecoveryService();
  await withHarness('started-ahead-of-claim', async (harness) => {
    updateLeaseRequested(harness);
    const token = 'lease-task12-started-ahead';
    const startedRef = `/home/mnfs/actions/${token}/started.json`;
    const resultRef = `/home/mnfs/actions/${token}/finished.json`;
    rawDatabase(harness.databasePath, `
      UPDATE leases
      SET action_kind = 'GRANT', action_token = '${token}', action_phase = 'CLAIMED',
          action_owner_boot_id = '${RUNNER_ONE.bootId}', action_owner_pid = ${RUNNER_ONE.pid},
          action_owner_start_ticks = '${RUNNER_ONE.startTicks}',
          action_started_ref = '${startedRef}', action_result_ref = '${resultRef}'
      WHERE id = '${harness.lease.id}';
    `);
    harness.observations.current = {
      ...harness.observations.current,
      actions: [{
        actionToken: token,
        state: 'STARTED',
        kind: 'GRANT',
        runner: RUNNER_TWO,
        startedRef,
      }],
      processes: [
        { identity: RUNNER_ONE, alive: false },
        { identity: RUNNER_TWO, alive: true },
      ],
    };

    const report = await serviceFor(module, harness).recover({ writeTrackId: harness.track.id });
    assert.equal(codes(report).includes('ADOPTABLE'), true);
    assert.equal(codes(report).includes('LD-07'), false);
  });
});

test('classifies a dead STARTED runner without FINISHED evidence as LD-07', async () => {
  const module = await loadRecoveryService();
  await withHarness('dead-started-runner', async (harness) => {
    updateLeaseRequested(harness);
    const token = 'lease-task12-dead-started';
    const startedRef = `/home/mnfs/actions/${token}/started.json`;
    rawDatabase(harness.databasePath, `
      UPDATE leases
      SET action_kind = 'GRANT', action_token = '${token}', action_phase = 'STARTED',
          action_owner_boot_id = '${RUNNER_ONE.bootId}', action_owner_pid = ${RUNNER_ONE.pid},
          action_owner_start_ticks = '${RUNNER_ONE.startTicks}',
          action_runner_boot_id = '${RUNNER_TWO.bootId}', action_runner_pid = ${RUNNER_TWO.pid},
          action_runner_start_ticks = '${RUNNER_TWO.startTicks}',
          action_started_ref = '${startedRef}', action_result_ref = NULL
      WHERE id = '${harness.lease.id}';
    `);
    harness.observations.current = {
      ...harness.observations.current,
      actions: [{
        actionToken: token,
        state: 'STARTED',
        kind: 'GRANT',
        runner: RUNNER_TWO,
        startedRef,
      }],
      processes: [{ identity: RUNNER_TWO, alive: false }],
    };

    const report = await serviceFor(module, harness).recover({ writeTrackId: harness.track.id });
    assert.equal(codes(report).includes('LD-07'), true);
    assert.equal(codes(report).includes('HEALTHY'), false);
  });
});

test('classifies the exact Windows mount root as escaped Lease identity', async () => {
  const module = await loadRecoveryService();
  await withHarness('exact-mount-root', async (harness) => {
    rawDatabase(harness.databasePath, `
      UPDATE leases
      SET worktree_path = '/mnt'
      WHERE id = '${harness.lease.id}';
    `);
    harness.observations.current = {
      ...harness.observations.current,
      leases: [{ ...exactLease(harness.sourcePath), path: '/mnt' }],
    };

    const report = await serviceFor(module, harness).recover({ writeTrackId: harness.track.id });
    assert.equal(codes(report).includes('LD-05'), true);
    assert.equal(codes(report).includes('HEALTHY'), false);
  });
});
