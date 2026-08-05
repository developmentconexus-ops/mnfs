import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';

import { MnfsError, type MnfsErrorCode } from '../../src/domain/errors.js';
import type { Claim, GitObjectFormat, Lease, WorkerRun, WriteTrack, Attempt } from '../../src/execution/model.js';
import { SqliteStore } from '../../src/store/sqlite-store.js';
import { validPlanV2 } from '../fixtures/mission-plans.js';

const CLAIM_SERVICE_SPECIFIER = '../../src/services/' + 'claim-service.js';
const OPENED_AT = '2026-08-05T15:00:00.000Z';
const PLAN_CREATED_AT = '2026-08-05T15:01:00.000Z';
const PLAN_APPROVED_AT = '2026-08-05T15:02:00.000Z';
const OCCURRED_AT = '2026-08-05T15:03:00.000Z';
const UPDATED_AT = '2026-08-05T15:04:00.000Z';
const BASE_COMMIT = '1'.repeat(40);
const RESULT_TREE = '2'.repeat(40);
const OTHER_TREE = '3'.repeat(40);
const NON_TREE_OBJECT = '4'.repeat(40);
const SOURCE_FINGERPRINT = `sha256:${'a'.repeat(64)}`;
const CLAIM_INPUT_HASH = `sha256:${'b'.repeat(64)}`;
const LEASE_INPUT_HASH = `sha256:${'c'.repeat(64)}`;
const CLAIM_KEY = 'claim:open:WT-001:A01:CLM01';
const CRITERION_ID = 'MIS-002/M01/F01/AC-01';
const WORKTREE_PATH = '/home/mnfs/runtime/treehouse/pool/tree-task12-001';
const EXTERNAL_LEASE_ID = 'treehouse-task12-lease-001';

interface TreeObservation {
  readonly sha: string;
  readonly objectFormat: GitObjectFormat;
  readonly type: 'tree';
}

interface ClaimGitAuthority {
  requireTree(input: Readonly<{
    sourcePath: string;
    sha: string;
    objectFormat: GitObjectFormat;
  }>): TreeObservation;
}

interface OpenClaimInput {
  readonly writeTrackId: string;
  readonly attemptId: string;
  readonly workerRunId: string;
  readonly leaseId: string;
  readonly expectedTrackVersion: number;
  readonly expectedAttemptVersion: number;
  readonly expectedRunVersion: number;
  readonly expectedLeaseVersion: number;
  readonly idempotencyKey: string;
  readonly baseCommitSha: string;
  readonly resultTreeSha: string;
  readonly claimedCriterionIds: readonly string[];
  readonly occurredAt: string;
}

interface ClaimServiceContract {
  openClaim(input: OpenClaimInput): Claim;
}

interface ClaimServiceModule {
  readonly ClaimService: new (input: Readonly<{
    store: SqliteStore;
    git: ClaimGitAuthority;
  }>) => ClaimServiceContract;
}

interface Harness {
  readonly root: string;
  readonly databasePath: string;
  readonly store: SqliteStore;
  readonly approvedHash: string;
  readonly sourcePath: string;
  readonly track: WriteTrack;
  readonly attempt: Attempt;
  readonly run: WorkerRun;
  readonly lease: Lease;
  readonly git: ScriptedClaimGitAuthority;
}

class ScriptedClaimGitAuthority implements ClaimGitAuthority {
  readonly calls: Array<Readonly<{ sourcePath: string; sha: string; objectFormat: GitObjectFormat }>> = [];
  readonly objects = new Map<string, 'tree' | 'commit'>([
    [RESULT_TREE, 'tree'],
    [OTHER_TREE, 'tree'],
    [NON_TREE_OBJECT, 'commit'],
  ]);
  beforeReturn: (() => void) | undefined;

  requireTree(input: Readonly<{
    sourcePath: string;
    sha: string;
    objectFormat: GitObjectFormat;
  }>): TreeObservation {
    this.calls.push({ ...input });
    this.beforeReturn?.();
    const type = this.objects.get(input.sha);
    if (type !== 'tree') {
      throw new MnfsError('CLAIM_RESULT_TREE_INVALID', `Git object ${input.sha} is not a tree.`);
    }
    return { sha: input.sha, objectFormat: input.objectFormat, type: 'tree' };
  }
}

function describeError(error: unknown): string {
  return error instanceof Error ? `${error.name}: ${error.message}` : String(error);
}

async function loadClaimService(): Promise<ClaimServiceModule> {
  try {
    return await import(CLAIM_SERVICE_SPECIFIER) as ClaimServiceModule;
  } catch (error) {
    assert.fail(`M01 ClaimService is not implemented: ${describeError(error)}`);
  }
}

function expectCode(code: MnfsErrorCode, operation: () => unknown): void {
  assert.throws(
    operation,
    (error: unknown) => error instanceof MnfsError && error.code === code,
  );
}

function withHarness(label: string, operation: (harness: Harness) => void): void {
  const root = mkdtempSync(join(tmpdir(), `mnfs-task12-claim-${label}-`));
  const databasePath = join(root, 'mnfs.db');
  const sourcePath = join(root, 'execution-sources', 'WT-001', 'A01', 'source');
  const store = SqliteStore.open(databasePath);
  try {
    store.openMission({
      missionId: 'MIS-002',
      eventId: `EVT-MIS-002-TASK12-${label.toUpperCase()}-OPEN`,
      goal: 'Prove ClaimService atomicity and authority',
      openedAt: OPENED_AT,
    });
    const saved = store.saveMissionPlanRevision({
      missionId: 'MIS-002',
      content: validPlanV2('MIS-002', `Task 12 ClaimService ${label}`),
      createdAt: PLAN_CREATED_AT,
    });
    const approved = store.approveMissionPlan({
      missionId: 'MIS-002',
      contentHash: saved.contentHash,
      approvedAt: PLAN_APPROVED_AT,
    });
    const track = store.execution.allocateWriteTrack({
      missionId: 'MIS-002',
      milestoneQualifiedId: 'MIS-002/M01',
      featureQualifiedId: 'MIS-002/M01/F01',
      contractHash: approved.contentHash,
      occurredAt: OCCURRED_AT,
    });
    const openedAttempt = store.execution.allocateAttempt({
      writeTrackId: track.id,
      contractHash: approved.contentHash,
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
    const run = store.execution.allocateWorkerRun({
      attemptId: attempt.id,
      contractHash: approved.contentHash,
      occurredAt: OCCURRED_AT,
    });
    const requestedLease = store.execution.allocateLease({
      writeTrackId: track.id,
      attemptId: attempt.id,
      contractHash: approved.contentHash,
      grantIdempotencyKey: `lease:grant:task12:${label}`,
      grantInputHash: LEASE_INPUT_HASH,
      holder: `mnfs-task12-${label}`,
      occurredAt: OCCURRED_AT,
    });
    const lease = store.execution.setLeaseState({
      id: requestedLease.id,
      expectedVersion: requestedLease.version,
      status: 'ACTIVE',
      externalLeaseId: `${EXTERNAL_LEASE_ID}-${label}`,
      worktreePath: `${WORKTREE_PATH}-${label}`,
      externalLeasedAt: OCCURRED_AT,
      updatedAt: UPDATED_AT,
    });
    operation({
      root,
      databasePath,
      store,
      approvedHash: approved.contentHash,
      sourcePath,
      track,
      attempt,
      run,
      lease,
      git: new ScriptedClaimGitAuthority(),
    });
  } finally {
    store.close();
    rmSync(root, { recursive: true, force: true });
  }
}

function serviceFor(module: ClaimServiceModule, harness: Harness): ClaimServiceContract {
  return new module.ClaimService({ store: harness.store, git: harness.git });
}

function claimInput(harness: Harness, overrides: Partial<OpenClaimInput> = {}): OpenClaimInput {
  return {
    writeTrackId: harness.track.id,
    attemptId: harness.attempt.id,
    workerRunId: harness.run.id,
    leaseId: harness.lease.id,
    expectedTrackVersion: harness.track.version,
    expectedAttemptVersion: harness.attempt.version,
    expectedRunVersion: harness.run.version,
    expectedLeaseVersion: harness.lease.version,
    idempotencyKey: CLAIM_KEY,
    baseCommitSha: BASE_COMMIT,
    resultTreeSha: RESULT_TREE,
    claimedCriterionIds: [CRITERION_ID],
    occurredAt: OCCURRED_AT,
    ...overrides,
  };
}

function eventCount(databasePath: string, type: string): number {
  const database = new DatabaseSync(databasePath, { readOnly: true });
  try {
    const row = database.prepare('SELECT COUNT(*) AS count FROM events WHERE type = ?')
      .get(type) as { readonly count: number };
    return Number(row.count);
  } finally {
    database.close();
  }
}

function rowCount(databasePath: string, table: string): number {
  const database = new DatabaseSync(databasePath, { readOnly: true });
  try {
    const row = database.prepare(`SELECT COUNT(*) AS count FROM "${table}"`).get() as {
      readonly count: number;
    };
    return Number(row.count);
  } finally {
    database.close();
  }
}

function installEventFailure(databasePath: string, eventType: string): void {
  const database = new DatabaseSync(databasePath);
  try {
    database.exec(`
      CREATE TRIGGER task12_claim_event_failure
      BEFORE INSERT ON events
      WHEN NEW.type = '${eventType}'
      BEGIN
        SELECT RAISE(ABORT, 'injected Task 12 Claim Event failure');
      END;
    `);
  } finally {
    database.close();
  }
}

function addSecondLineage(harness: Harness): Readonly<{
  track: WriteTrack;
  attempt: Attempt;
  run: WorkerRun;
  lease: Lease;
}> {
  const track = harness.store.execution.allocateWriteTrack({
    missionId: 'MIS-002',
    milestoneQualifiedId: 'MIS-002/M01',
    featureQualifiedId: 'MIS-002/M01/F02',
    contractHash: harness.approvedHash,
    occurredAt: OCCURRED_AT,
  });
  const openedAttempt = harness.store.execution.allocateAttempt({
    writeTrackId: track.id,
    contractHash: harness.approvedHash,
    gitObjectFormat: 'sha1',
    baseCommitSha: BASE_COMMIT,
    occurredAt: OCCURRED_AT,
  });
  const attempt = harness.store.execution.setAttemptState({
    id: openedAttempt.id,
    expectedVersion: openedAttempt.version,
    status: 'OPEN',
    sourceStatus: 'READY',
    sourcePath: join(harness.root, 'execution-sources', track.id, 'A01', 'source'),
    sourceFingerprint: `sha256:${'d'.repeat(64)}`,
    updatedAt: UPDATED_AT,
  });
  const run = harness.store.execution.allocateWorkerRun({
    attemptId: attempt.id,
    contractHash: harness.approvedHash,
    occurredAt: OCCURRED_AT,
  });
  const requested = harness.store.execution.allocateLease({
    writeTrackId: track.id,
    attemptId: attempt.id,
    contractHash: harness.approvedHash,
    grantIdempotencyKey: `lease:grant:${track.id}`,
    grantInputHash: `sha256:${'e'.repeat(64)}`,
    holder: `mnfs-task12-${track.id}`,
    occurredAt: OCCURRED_AT,
  });
  const lease = harness.store.execution.setLeaseState({
    id: requested.id,
    expectedVersion: requested.version,
    status: 'ACTIVE',
    externalLeaseId: `external-${track.id}`,
    worktreePath: `/home/mnfs/runtime/treehouse/${track.id}`,
    externalLeasedAt: OCCURRED_AT,
    updatedAt: UPDATED_AT,
  });
  return { track, attempt, run, lease };
}

test('exports only the M01 ClaimService OPEN boundary', async () => {
  const module = await loadClaimService();
  assert.equal(typeof module.ClaimService, 'function');
  withHarness('boundary', (harness) => {
    const service = serviceFor(module, harness) as ClaimServiceContract & Record<string, unknown>;
    assert.equal(typeof service.openClaim, 'function');
    for (const forbidden of ['completeClaim', 'acceptClaim', 'rejectClaim', 'verifyClaim']) {
      assert.equal(service[forbidden], undefined, `${forbidden} is outside M01`);
    }
  });
});

test('opens Claim, moves Track to CLAIMED and appends CLAIM_OPENED atomically', async () => {
  const module = await loadClaimService();
  withHarness('happy', (harness) => {
    const claim = serviceFor(module, harness).openClaim(claimInput(harness));
    assert.equal(claim.id, 'WT-001/A01/CLM01');
    assert.equal(claim.status, 'OPEN');
    assert.equal(claim.writeTrackId, harness.track.id);
    assert.equal(claim.attemptId, harness.attempt.id);
    assert.equal(claim.workerRunId, harness.run.id);
    assert.equal(claim.leaseId, harness.lease.id);
    assert.equal(claim.contractHash, harness.approvedHash);
    assert.equal(claim.baseCommitSha, BASE_COMMIT);
    assert.equal(claim.resultTreeSha, RESULT_TREE);
    assert.deepEqual(claim.claimedCriterionIds, [CRITERION_ID]);
    assert.equal(harness.store.execution.getWriteTrack(harness.track.id)?.status, 'CLAIMED');
    assert.equal(eventCount(harness.databasePath, 'CLAIM_OPENED'), 1);
    assert.equal(rowCount(harness.databasePath, 'claims'), 1);
  });
});

test('rolls back Claim, Track transition and Event when CLAIM_OPENED insertion fails', async () => {
  const module = await loadClaimService();
  withHarness('event-rollback', (harness) => {
    installEventFailure(harness.databasePath, 'CLAIM_OPENED');
    assert.throws(() => serviceFor(module, harness).openClaim(claimInput(harness)));
    assert.equal(rowCount(harness.databasePath, 'claims'), 0);
    assert.equal(harness.store.execution.getWriteTrack(harness.track.id)?.status, 'ACTIVE');
    assert.equal(eventCount(harness.databasePath, 'CLAIM_OPENED'), 0);
  });
});

test('revalidates every expected version after Git observation and leaves no partial mutation', async () => {
  const module = await loadClaimService();
  withHarness('version-fence', (harness) => {
    harness.git.beforeReturn = () => {
      const current = harness.store.execution.getWriteTrack(harness.track.id) as WriteTrack;
      harness.store.execution.setWriteTrackStatus({
        id: current.id,
        expectedVersion: current.version,
        status: 'ACTIVE',
        updatedAt: UPDATED_AT,
      });
      harness.git.beforeReturn = undefined;
    };
    expectCode(
      'CONCURRENCY_CONFLICT',
      () => serviceFor(module, harness).openClaim(claimInput(harness)),
    );
    assert.equal(rowCount(harness.databasePath, 'claims'), 0);
    assert.equal(eventCount(harness.databasePath, 'CLAIM_OPENED'), 0);
  });
});

test('rejects stale Track, Attempt, Run and Lease versions independently', async () => {
  const module = await loadClaimService();
  for (const [label, override] of [
    ['track', { expectedTrackVersion: 999 }],
    ['attempt', { expectedAttemptVersion: 999 }],
    ['run', { expectedRunVersion: 999 }],
    ['lease', { expectedLeaseVersion: 999 }],
  ] as const) {
    withHarness(`stale-${label}`, (harness) => {
      expectCode(
        'CONCURRENCY_CONFLICT',
        () => serviceFor(module, harness).openClaim(claimInput(harness, override)),
      );
      assert.equal(rowCount(harness.databasePath, 'claims'), 0);
    });
  }
});

test('rejects cross-lineage Worker Run and Lease references without partial state', async () => {
  const module = await loadClaimService();
  withHarness('cross-lineage', (harness) => {
    const second = addSecondLineage(harness);
    const service = serviceFor(module, harness);
    expectCode('CLAIM_CONFLICT', () => service.openClaim(claimInput(harness, {
      workerRunId: second.run.id,
      expectedRunVersion: second.run.version,
    })));
    expectCode('CLAIM_CONFLICT', () => service.openClaim(claimInput(harness, {
      leaseId: second.lease.id,
      expectedLeaseVersion: second.lease.version,
    })));
    assert.equal(rowCount(harness.databasePath, 'claims'), 0);
  });
});

test('rejects stale approved authority, wrong contract and wrong Attempt base', async () => {
  const module = await loadClaimService();
  withHarness('authority', (harness) => {
    const saved = harness.store.saveMissionPlanRevision({
      missionId: 'MIS-002',
      content: validPlanV2('MIS-002', 'Task 12 newer approved contract'),
      expectedPreviousHash: harness.approvedHash,
      createdAt: UPDATED_AT,
    });
    harness.store.approveMissionPlan({
      missionId: 'MIS-002',
      contentHash: saved.contentHash,
      approvedAt: '2026-08-05T15:05:00.000Z',
    });
    expectCode(
      'EXECUTION_CONTRACT_CONFLICT',
      () => serviceFor(module, harness).openClaim(claimInput(harness)),
    );
    expectCode('CLAIM_CONFLICT', () => serviceFor(module, harness).openClaim(claimInput(harness, {
      baseCommitSha: '9'.repeat(40),
    })));
    assert.equal(rowCount(harness.databasePath, 'claims'), 0);
  });
});

test('requires a READY source, current Worker Run and ACTIVE matching Lease', async () => {
  const module = await loadClaimService();
  withHarness('source-not-ready', (harness) => {
    const diverged = harness.store.execution.setAttemptState({
      id: harness.attempt.id,
      expectedVersion: harness.attempt.version,
      status: 'OPEN',
      sourceStatus: 'DIVERGED',
      sourcePath: harness.sourcePath,
      sourceFingerprint: SOURCE_FINGERPRINT,
      updatedAt: UPDATED_AT,
    });
    expectCode('CLAIM_CONFLICT', () => serviceFor(module, harness).openClaim(claimInput(harness, {
      expectedAttemptVersion: diverged.version,
    })));
  });
  withHarness('run-terminal', (harness) => {
    const terminal = harness.store.execution.setWorkerRunState({
      id: harness.run.id,
      expectedVersion: harness.run.version,
      status: 'CANCELLED',
      updatedAt: UPDATED_AT,
    });
    expectCode('CLAIM_CONFLICT', () => serviceFor(module, harness).openClaim(claimInput(harness, {
      expectedRunVersion: terminal.version,
    })));
  });
  withHarness('lease-terminal', (harness) => {
    const released = harness.store.execution.setLeaseState({
      id: harness.lease.id,
      expectedVersion: harness.lease.version,
      status: 'RELEASED',
      externalLeaseId: harness.lease.externalLeaseId!,
      worktreePath: harness.lease.worktreePath!,
      externalLeasedAt: harness.lease.externalLeasedAt!,
      updatedAt: UPDATED_AT,
    });
    expectCode('CLAIM_CONFLICT', () => serviceFor(module, harness).openClaim(claimInput(harness, {
      expectedLeaseVersion: released.version,
    })));
  });
});

test('rejects missing and non-tree result objects in the exact Attempt source', async () => {
  const module = await loadClaimService();
  withHarness('result-tree', (harness) => {
    const service = serviceFor(module, harness);
    expectCode('CLAIM_RESULT_TREE_INVALID', () => service.openClaim(claimInput(harness, {
      resultTreeSha: '8'.repeat(40),
    })));
    expectCode('CLAIM_RESULT_TREE_INVALID', () => service.openClaim(claimInput(harness, {
      resultTreeSha: NON_TREE_OBJECT,
    })));
    assert.deepEqual(harness.git.calls.map((call) => call.sourcePath), [
      harness.sourcePath,
      harness.sourcePath,
    ]);
    assert.equal(rowCount(harness.databasePath, 'claims'), 0);
  });
});

test('rejects empty, duplicate and out-of-Feature criteria', async () => {
  const module = await loadClaimService();
  withHarness('criteria', (harness) => {
    const service = serviceFor(module, harness);
    expectCode('CLAIM_CONFLICT', () => service.openClaim(claimInput(harness, {
      claimedCriterionIds: [],
    })));
    expectCode('CLAIM_CONFLICT', () => service.openClaim(claimInput(harness, {
      claimedCriterionIds: [CRITERION_ID, CRITERION_ID],
    })));
    expectCode('CLAIM_CONFLICT', () => service.openClaim(claimInput(harness, {
      claimedCriterionIds: ['MIS-002/M02/F01/AC-01'],
    })));
    assert.equal(rowCount(harness.databasePath, 'claims'), 0);
  });
});

test('blocks a second current Claim for the same Attempt', async () => {
  const module = await loadClaimService();
  withHarness('current-claim', (harness) => {
    harness.store.execution.allocateClaim({
      writeTrackId: harness.track.id,
      attemptId: harness.attempt.id,
      workerRunId: harness.run.id,
      leaseId: harness.lease.id,
      contractHash: harness.approvedHash,
      idempotencyKey: 'claim:fixture:existing',
      inputHash: CLAIM_INPUT_HASH,
      baseCommitSha: BASE_COMMIT,
      resultTreeSha: RESULT_TREE,
      claimedCriterionIds: [CRITERION_ID],
      occurredAt: OCCURRED_AT,
    });
    expectCode(
      'CLAIM_CONFLICT',
      () => serviceFor(module, harness).openClaim(claimInput(harness)),
    );
    assert.equal(rowCount(harness.databasePath, 'claims'), 1);
  });
});

test('replays same-key same-input Claim and rejects a conflicting binding', async () => {
  const module = await loadClaimService();
  withHarness('idempotency', (harness) => {
    const service = serviceFor(module, harness);
    const first = service.openClaim(claimInput(harness));
    const second = service.openClaim(claimInput(harness));
    assert.deepEqual(second, first);
    assert.equal(rowCount(harness.databasePath, 'claims'), 1);
    assert.equal(eventCount(harness.databasePath, 'CLAIM_OPENED'), 1);
    expectCode('CLAIM_IDEMPOTENCY_CONFLICT', () => service.openClaim(claimInput(harness, {
      resultTreeSha: OTHER_TREE,
    })));
    assert.equal(rowCount(harness.databasePath, 'claims'), 1);
  });
});
