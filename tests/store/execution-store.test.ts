import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';

import { MnfsError, type MnfsErrorCode } from '../../src/domain/errors.js';
import type {
  Attempt,
  Claim,
  Lease,
  ProcessIdentity,
  WorkerRun,
  WriteTrack,
} from '../../src/execution/model.js';
import { SqliteStore } from '../../src/store/sqlite-store.js';
import { M01_FIXTURE } from '../support/m01-fixtures.js';

const EXECUTION_STORE_SPECIFIER = '../../src/store/' + 'execution-store.js';
const OCCURRED_AT = '2026-08-04T22:10:00.000Z';
const UPDATED_AT = '2026-08-04T22:11:00.000Z';
const BASE_COMMIT_ONE = '1'.repeat(40);
const BASE_COMMIT_TWO = '2'.repeat(40);
const RESULT_TREE_ONE = '3'.repeat(40);
const RESULT_TREE_TWO = '4'.repeat(40);
const INPUT_HASH_ONE = `sha256:${'a'.repeat(64)}`;
const INPUT_HASH_TWO = `sha256:${'b'.repeat(64)}`;

interface AllocateWriteTrackInput {
  readonly missionId: string;
  readonly milestoneQualifiedId: string;
  readonly featureQualifiedId: string;
  readonly contractHash: string;
  readonly occurredAt: string;
}

interface AllocateAttemptInput {
  readonly writeTrackId: string;
  readonly contractHash: string;
  readonly gitObjectFormat: 'sha1' | 'sha256';
  readonly baseCommitSha: string;
  readonly occurredAt: string;
}

interface AllocateWorkerRunInput {
  readonly attemptId: string;
  readonly contractHash: string;
  readonly occurredAt: string;
}

interface AllocateLeaseInput {
  readonly writeTrackId: string;
  readonly attemptId: string;
  readonly contractHash: string;
  readonly grantIdempotencyKey: string;
  readonly grantInputHash: string;
  readonly holder: string;
  readonly occurredAt: string;
}

interface AllocateClaimInput {
  readonly writeTrackId: string;
  readonly attemptId: string;
  readonly workerRunId: string;
  readonly leaseId: string;
  readonly contractHash: string;
  readonly idempotencyKey: string;
  readonly inputHash: string;
  readonly baseCommitSha: string;
  readonly resultTreeSha: string;
  readonly claimedCriterionIds: readonly string[];
  readonly occurredAt: string;
}

interface ExecutionStoreContract {
  allocateWriteTrack(input: AllocateWriteTrackInput): WriteTrack;
  getWriteTrack(id: string): WriteTrack | undefined;
  setWriteTrackStatus(input: {
    readonly id: string;
    readonly expectedVersion: number;
    readonly status: WriteTrack['status'];
    readonly updatedAt: string;
  }): WriteTrack;

  allocateAttempt(input: AllocateAttemptInput): Attempt;
  getAttempt(id: string): Attempt | undefined;
  setAttemptState(input: {
    readonly id: string;
    readonly expectedVersion: number;
    readonly status: Attempt['status'];
    readonly sourceStatus: Attempt['sourceStatus'];
    readonly sourcePath?: string;
    readonly sourceFingerprint?: string;
    readonly updatedAt: string;
  }): Attempt;

  allocateWorkerRun(input: AllocateWorkerRunInput): WorkerRun;
  getWorkerRun(id: string): WorkerRun | undefined;
  setWorkerRunState(input: {
    readonly id: string;
    readonly expectedVersion: number;
    readonly status: WorkerRun['status'];
    readonly processIdentity?: ProcessIdentity;
    readonly processStartedAt?: string;
    readonly exitCode?: number;
    readonly updatedAt: string;
  }): WorkerRun;

  allocateLease(input: AllocateLeaseInput): Lease;
  getLease(id: string): Lease | undefined;
  setLeaseState(input: {
    readonly id: string;
    readonly expectedVersion: number;
    readonly status: Lease['status'];
    readonly externalLeaseId?: string;
    readonly worktreePath?: string;
    readonly externalLeasedAt?: string;
    readonly updatedAt: string;
  }): Lease;

  allocateClaim(input: AllocateClaimInput): Claim;
  getClaim(id: string): Claim | undefined;
}

interface ExecutionStoreModule {
  readonly ExecutionStore: unknown;
}

interface ExecutionStoreHost {
  readonly execution: ExecutionStoreContract;
}

interface Harness {
  readonly databasePath: string;
  readonly store: SqliteStore;
  readonly execution: ExecutionStoreContract;
}

interface Lineage {
  readonly track: WriteTrack;
  readonly attempt: Attempt;
  readonly run: WorkerRun;
  readonly lease: Lease;
}

function describeError(error: unknown): string {
  return error instanceof Error ? `${error.name}: ${error.message}` : String(error);
}

function requireExecutionStore(store: SqliteStore): ExecutionStoreContract {
  const execution = (store as unknown as Partial<ExecutionStoreHost>).execution;
  assert.ok(
    execution,
    'SqliteStore must expose one focused ExecutionStore sharing its connection and transaction authority.',
  );
  return execution;
}

function withHarness(label: string, operation: (harness: Harness) => void): void {
  const directory = mkdtempSync(join(tmpdir(), `mnfs-m01-task6-${label}-`));
  const databasePath = join(directory, 'mnfs.db');
  const store = SqliteStore.open(databasePath);
  try {
    store.openMission({
      missionId: 'MIS-002',
      eventId: 'EVT-MIS-002-TASK6-OPEN',
      goal: 'Prove durable execution persistence',
      openedAt: OCCURRED_AT,
    });
    operation({
      databasePath,
      store,
      execution: requireExecutionStore(store),
    });
  } finally {
    store.close();
    rmSync(directory, { recursive: true, force: true });
  }
}

function expectCode(code: MnfsErrorCode, operation: () => unknown): void {
  assert.throws(
    operation,
    (error: unknown) => error instanceof MnfsError && error.code === code,
  );
}

function allocateTrack(
  execution: ExecutionStoreContract,
  featureId: string,
): WriteTrack {
  return execution.allocateWriteTrack({
    missionId: 'MIS-002',
    milestoneQualifiedId: 'MIS-002/M01',
    featureQualifiedId: `MIS-002/M01/${featureId}`,
    contractHash: M01_FIXTURE.contractHash,
    occurredAt: OCCURRED_AT,
  });
}

function allocateAttempt(
  execution: ExecutionStoreContract,
  track: WriteTrack,
  baseCommitSha: string,
): Attempt {
  return execution.allocateAttempt({
    writeTrackId: track.id,
    contractHash: track.contractHash,
    gitObjectFormat: 'sha1',
    baseCommitSha,
    occurredAt: OCCURRED_AT,
  });
}

function allocateRun(
  execution: ExecutionStoreContract,
  attempt: Attempt,
): WorkerRun {
  return execution.allocateWorkerRun({
    attemptId: attempt.id,
    contractHash: attempt.contractHash,
    occurredAt: OCCURRED_AT,
  });
}

function allocateLease(
  execution: ExecutionStoreContract,
  track: WriteTrack,
  attempt: Attempt,
  suffix: string,
  inputHash = INPUT_HASH_ONE,
): Lease {
  return execution.allocateLease({
    writeTrackId: track.id,
    attemptId: attempt.id,
    contractHash: track.contractHash,
    grantIdempotencyKey: `lease:grant:${suffix}`,
    grantInputHash: inputHash,
    holder: `mnfs-holder-${suffix}`,
    occurredAt: OCCURRED_AT,
  });
}

function allocateLineage(
  execution: ExecutionStoreContract,
  featureId: string,
  baseCommitSha: string,
  suffix: string,
): Lineage {
  const track = allocateTrack(execution, featureId);
  const attempt = allocateAttempt(execution, track, baseCommitSha);
  const run = allocateRun(execution, attempt);
  const lease = allocateLease(execution, track, attempt, suffix);
  return { track, attempt, run, lease };
}

function allocateClaim(
  execution: ExecutionStoreContract,
  lineage: Lineage,
  suffix: string,
  inputHash = INPUT_HASH_ONE,
): Claim {
  return execution.allocateClaim({
    writeTrackId: lineage.track.id,
    attemptId: lineage.attempt.id,
    workerRunId: lineage.run.id,
    leaseId: lineage.lease.id,
    contractHash: lineage.track.contractHash,
    idempotencyKey: `claim:open:${suffix}`,
    inputHash,
    baseCommitSha: lineage.attempt.baseCommitSha,
    resultTreeSha: RESULT_TREE_ONE,
    claimedCriterionIds: ['MIS-002/M01/F01/AC-001'],
    occurredAt: OCCURRED_AT,
  });
}

function rowCount(databasePath: string, tableName: string): number {
  const database = new DatabaseSync(databasePath, { readOnly: true });
  try {
    const row = database.prepare(`SELECT COUNT(*) AS count FROM "${tableName}"`).get() as {
      readonly count: number;
    };
    return Number(row.count);
  } finally {
    database.close();
  }
}

function directClaimInsert(
  database: DatabaseSync,
  input: {
    readonly id: string;
    readonly track: WriteTrack;
    readonly attempt: Attempt;
    readonly run: WorkerRun;
    readonly lease: Lease;
    readonly baseCommitSha: string;
  },
): void {
  database.prepare(`
    INSERT INTO claims (
      id,
      write_track_id,
      attempt_id,
      worker_run_id,
      lease_id,
      contract_hash,
      ordinal,
      status,
      idempotency_key,
      input_hash,
      base_commit_sha,
      result_tree_sha,
      claimed_criteria_json,
      version,
      created_at,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, 1, 'OPEN', ?, ?, ?, ?, ?, 1, ?, ?)
  `).run(
    input.id,
    input.track.id,
    input.attempt.id,
    input.run.id,
    input.lease.id,
    input.track.contractHash,
    `direct:${input.id}`,
    INPUT_HASH_ONE,
    input.baseCommitSha,
    RESULT_TREE_TWO,
    '["MIS-002/M01/F01/AC-001"]',
    OCCURRED_AT,
    OCCURRED_AT,
  );
}

test('SqliteStore exposes the focused ExecutionStore module on its existing authority', async () => {
  let module: ExecutionStoreModule;
  try {
    module = await import(EXECUTION_STORE_SPECIFIER) as ExecutionStoreModule;
  } catch (error) {
    assert.fail(`M01 ExecutionStore is not implemented: ${describeError(error)}`);
  }
  assert.equal(typeof module.ExecutionStore, 'function');

  withHarness('module', ({ execution }) => {
    assert.equal(typeof execution.allocateWriteTrack, 'function');
    assert.equal(typeof execution.allocateClaim, 'function');
  });
});

test('allocates deterministic global and parent-relative identities and enforces current rows', () => {
  withHarness('allocation', ({ execution }) => {
    const firstTrack = allocateTrack(execution, 'F01');
    assert.equal(firstTrack.id, 'WT-001');
    assert.equal(firstTrack.status, 'ACTIVE');
    assert.equal(firstTrack.version, 1);

    expectCode('WRITE_TRACK_CONFLICT', () => allocateTrack(execution, 'F01'));
    const secondTrack = allocateTrack(execution, 'F02');
    assert.equal(secondTrack.id, 'WT-002');

    const firstAttempt = allocateAttempt(execution, firstTrack, BASE_COMMIT_ONE);
    assert.equal(firstAttempt.id, 'WT-001/A01');
    assert.equal(firstAttempt.ordinal, 1);
    expectCode(
      'ATTEMPT_CONFLICT',
      () => allocateAttempt(execution, firstTrack, BASE_COMMIT_ONE),
    );

    const superseded = execution.setAttemptState({
      id: firstAttempt.id,
      expectedVersion: 1,
      status: 'SUPERSEDED',
      sourceStatus: 'REQUESTED',
      updatedAt: UPDATED_AT,
    });
    assert.equal(superseded.version, 2);

    const secondAttempt = allocateAttempt(execution, firstTrack, BASE_COMMIT_ONE);
    assert.equal(secondAttempt.id, 'WT-001/A02');
    assert.equal(secondAttempt.ordinal, 2);

    const firstRun = allocateRun(execution, secondAttempt);
    assert.equal(firstRun.id, 'WT-001/A02/WR01');
    expectCode('WORKER_RUN_CONFLICT', () => allocateRun(execution, secondAttempt));

    execution.setWorkerRunState({
      id: firstRun.id,
      expectedVersion: 1,
      status: 'EXITED',
      exitCode: 0,
      updatedAt: UPDATED_AT,
    });
    const secondRun = allocateRun(execution, secondAttempt);
    assert.equal(secondRun.id, 'WT-001/A02/WR02');
    assert.equal(secondRun.ordinal, 2);

    const firstLease = allocateLease(execution, firstTrack, secondAttempt, 'one');
    assert.equal(firstLease.id, 'LSE-001');
    assert.equal(firstLease.generation, 1);
    expectCode(
      'LEASE_CONFLICT',
      () => allocateLease(execution, firstTrack, secondAttempt, 'other-current'),
    );

    const secondTrackAttempt = allocateAttempt(execution, secondTrack, BASE_COMMIT_TWO);
    const secondLease = allocateLease(
      execution,
      secondTrack,
      secondTrackAttempt,
      'two',
    );
    assert.equal(secondLease.id, 'LSE-002');
    assert.equal(secondLease.generation, 1);

    const firstClaim = execution.allocateClaim({
      writeTrackId: firstTrack.id,
      attemptId: secondAttempt.id,
      workerRunId: secondRun.id,
      leaseId: firstLease.id,
      contractHash: firstTrack.contractHash,
      idempotencyKey: 'claim:open:first',
      inputHash: INPUT_HASH_ONE,
      baseCommitSha: secondAttempt.baseCommitSha,
      resultTreeSha: RESULT_TREE_ONE,
      claimedCriterionIds: ['MIS-002/M01/F01/AC-001'],
      occurredAt: OCCURRED_AT,
    });
    assert.equal(firstClaim.id, 'WT-001/A02/CLM01');
    assert.equal(firstClaim.ordinal, 1);

    expectCode('CLAIM_CONFLICT', () => execution.allocateClaim({
      writeTrackId: firstTrack.id,
      attemptId: secondAttempt.id,
      workerRunId: secondRun.id,
      leaseId: firstLease.id,
      contractHash: firstTrack.contractHash,
      idempotencyKey: 'claim:open:second-current',
      inputHash: INPUT_HASH_TWO,
      baseCommitSha: secondAttempt.baseCommitSha,
      resultTreeSha: RESULT_TREE_TWO,
      claimedCriterionIds: ['MIS-002/M01/F01/AC-001'],
      occurredAt: OCCURRED_AT,
    }));
  });
});

test('rejects cross-lineage Claim references and mismatched Attempt base without partial rows', () => {
  withHarness('ancestry', ({ databasePath, execution }) => {
    const left = allocateLineage(execution, 'F01', BASE_COMMIT_ONE, 'left');
    const right = allocateLineage(execution, 'F02', BASE_COMMIT_TWO, 'right');

    expectCode('CLAIM_CONFLICT', () => execution.allocateClaim({
      writeTrackId: left.track.id,
      attemptId: left.attempt.id,
      workerRunId: right.run.id,
      leaseId: left.lease.id,
      contractHash: left.track.contractHash,
      idempotencyKey: 'claim:cross-run',
      inputHash: INPUT_HASH_ONE,
      baseCommitSha: left.attempt.baseCommitSha,
      resultTreeSha: RESULT_TREE_ONE,
      claimedCriterionIds: ['MIS-002/M01/F01/AC-001'],
      occurredAt: OCCURRED_AT,
    }));
    expectCode('CLAIM_CONFLICT', () => execution.allocateClaim({
      writeTrackId: left.track.id,
      attemptId: left.attempt.id,
      workerRunId: left.run.id,
      leaseId: right.lease.id,
      contractHash: left.track.contractHash,
      idempotencyKey: 'claim:cross-lease',
      inputHash: INPUT_HASH_ONE,
      baseCommitSha: left.attempt.baseCommitSha,
      resultTreeSha: RESULT_TREE_ONE,
      claimedCriterionIds: ['MIS-002/M01/F01/AC-001'],
      occurredAt: OCCURRED_AT,
    }));
    expectCode('CLAIM_CONFLICT', () => execution.allocateClaim({
      writeTrackId: left.track.id,
      attemptId: left.attempt.id,
      workerRunId: left.run.id,
      leaseId: left.lease.id,
      contractHash: left.track.contractHash,
      idempotencyKey: 'claim:wrong-base',
      inputHash: INPUT_HASH_ONE,
      baseCommitSha: BASE_COMMIT_TWO,
      resultTreeSha: RESULT_TREE_ONE,
      claimedCriterionIds: ['MIS-002/M01/F01/AC-001'],
      occurredAt: OCCURRED_AT,
    }));
    assert.equal(rowCount(databasePath, 'claims'), 0);

    const direct = new DatabaseSync(databasePath);
    try {
      direct.exec('PRAGMA foreign_keys = ON');
      assert.throws(() => directClaimInsert(direct, {
        id: 'WT-001/A01/CLM01',
        track: left.track,
        attempt: left.attempt,
        run: right.run,
        lease: left.lease,
        baseCommitSha: left.attempt.baseCommitSha,
      }));
      assert.throws(() => directClaimInsert(direct, {
        id: 'WT-001/A01/CLM02',
        track: left.track,
        attempt: left.attempt,
        run: left.run,
        lease: right.lease,
        baseCommitSha: left.attempt.baseCommitSha,
      }));
      assert.throws(() => directClaimInsert(direct, {
        id: 'WT-001/A01/CLM03',
        track: left.track,
        attempt: left.attempt,
        run: left.run,
        lease: left.lease,
        baseCommitSha: BASE_COMMIT_TWO,
      }));
    } finally {
      direct.close();
    }
    assert.equal(rowCount(databasePath, 'claims'), 0);
  });
});

test('replays Lease and Claim allocation only for the same idempotency key and input hash', () => {
  withHarness('idempotency', ({ databasePath, execution }) => {
    const lineage = allocateLineage(execution, 'F01', BASE_COMMIT_ONE, 'stable');

    const replayedLease = allocateLease(
      execution,
      lineage.track,
      lineage.attempt,
      'stable',
    );
    assert.deepEqual(replayedLease, lineage.lease);
    assert.equal(rowCount(databasePath, 'leases'), 1);

    expectCode('LEASE_IDEMPOTENCY_CONFLICT', () => allocateLease(
      execution,
      lineage.track,
      lineage.attempt,
      'stable',
      INPUT_HASH_TWO,
    ));
    assert.equal(rowCount(databasePath, 'leases'), 1);

    const claim = allocateClaim(execution, lineage, 'stable');
    const replayedClaim = allocateClaim(execution, lineage, 'stable');
    assert.deepEqual(replayedClaim, claim);
    assert.equal(rowCount(databasePath, 'claims'), 1);

    expectCode(
      'CLAIM_IDEMPOTENCY_CONFLICT',
      () => allocateClaim(execution, lineage, 'stable', INPUT_HASH_TWO),
    );
    assert.equal(rowCount(databasePath, 'claims'), 1);
  });
});

test('uses expected versions for every mutable execution row and preserves state on stale CAS', () => {
  withHarness('cas', ({ execution }) => {
    const lineage = allocateLineage(execution, 'F01', BASE_COMMIT_ONE, 'cas');

    const claimedTrack = execution.setWriteTrackStatus({
      id: lineage.track.id,
      expectedVersion: 1,
      status: 'CLAIMED',
      updatedAt: UPDATED_AT,
    });
    assert.equal(claimedTrack.version, 2);
    expectCode('CONCURRENCY_CONFLICT', () => execution.setWriteTrackStatus({
      id: lineage.track.id,
      expectedVersion: 1,
      status: 'ABANDONED',
      updatedAt: UPDATED_AT,
    }));
    assert.deepEqual(execution.getWriteTrack(lineage.track.id), claimedTrack);

    const readyAttempt = execution.setAttemptState({
      id: lineage.attempt.id,
      expectedVersion: 1,
      status: 'OPEN',
      sourceStatus: 'READY',
      sourcePath: '/home/mnfs/state/execution-sources/WT-001/A01/source',
      sourceFingerprint: INPUT_HASH_ONE,
      updatedAt: UPDATED_AT,
    });
    assert.equal(readyAttempt.version, 2);
    expectCode('CONCURRENCY_CONFLICT', () => execution.setAttemptState({
      id: lineage.attempt.id,
      expectedVersion: 1,
      status: 'SUPERSEDED',
      sourceStatus: 'READY',
      sourcePath: '/home/mnfs/state/execution-sources/WT-001/A01/source',
      sourceFingerprint: INPUT_HASH_ONE,
      updatedAt: UPDATED_AT,
    }));
    assert.deepEqual(execution.getAttempt(lineage.attempt.id), readyAttempt);

    const running = execution.setWorkerRunState({
      id: lineage.run.id,
      expectedVersion: 1,
      status: 'RUNNING',
      processIdentity: {
        bootId: 'boot-task6',
        pid: 6001,
        startTicks: '456789',
      },
      processStartedAt: UPDATED_AT,
      updatedAt: UPDATED_AT,
    });
    assert.equal(running.version, 2);
    expectCode('CONCURRENCY_CONFLICT', () => execution.setWorkerRunState({
      id: lineage.run.id,
      expectedVersion: 1,
      status: 'LOST',
      updatedAt: UPDATED_AT,
    }));
    assert.deepEqual(execution.getWorkerRun(lineage.run.id), running);

    const activeLease = execution.setLeaseState({
      id: lineage.lease.id,
      expectedVersion: 1,
      status: 'ACTIVE',
      externalLeaseId: 'treehouse-lease-task6',
      worktreePath: '/home/mnfs/treehouse/worktrees/task6',
      externalLeasedAt: UPDATED_AT,
      updatedAt: UPDATED_AT,
    });
    assert.equal(activeLease.version, 2);
    expectCode('CONCURRENCY_CONFLICT', () => execution.setLeaseState({
      id: lineage.lease.id,
      expectedVersion: 1,
      status: 'DIVERGED',
      updatedAt: UPDATED_AT,
    }));
    assert.deepEqual(execution.getLease(lineage.lease.id), activeLease);
  });
});

test('strict row codecs reject malformed persisted enum, nullability and criteria combinations', () => {
  withHarness('row-codecs', ({ databasePath, execution }) => {
    const lineage = allocateLineage(execution, 'F01', BASE_COMMIT_ONE, 'codec');
    const claim = allocateClaim(execution, lineage, 'codec');
    const control = new DatabaseSync(databasePath);
    try {
      control.exec('PRAGMA ignore_check_constraints = ON');

      control.prepare("UPDATE write_tracks SET status = 'BROKEN' WHERE id = ?")
        .run(lineage.track.id);
      expectCode('INTERNAL_ERROR', () => execution.getWriteTrack(lineage.track.id));
      control.prepare("UPDATE write_tracks SET status = 'ACTIVE' WHERE id = ?")
        .run(lineage.track.id);

      control.prepare(`
        UPDATE attempts
        SET source_status = 'READY', source_path = NULL, source_fingerprint = NULL
        WHERE id = ?
      `).run(lineage.attempt.id);
      expectCode('INTERNAL_ERROR', () => execution.getAttempt(lineage.attempt.id));
      control.prepare(`
        UPDATE attempts
        SET source_status = 'REQUESTED', source_path = NULL, source_fingerprint = NULL
        WHERE id = ?
      `).run(lineage.attempt.id);

      control.prepare(`
        UPDATE worker_runs
        SET status = 'RUNNING',
            process_boot_id = NULL,
            process_id = NULL,
            process_start_ticks = NULL,
            process_started_at = NULL
        WHERE id = ?
      `).run(lineage.run.id);
      expectCode('INTERNAL_ERROR', () => execution.getWorkerRun(lineage.run.id));
      control.prepare("UPDATE worker_runs SET status = 'STARTING' WHERE id = ?")
        .run(lineage.run.id);

      control.prepare(`
        UPDATE leases
        SET status = 'ACTIVE',
            external_lease_id = NULL,
            worktree_path = NULL,
            external_leased_at = NULL
        WHERE id = ?
      `).run(lineage.lease.id);
      expectCode('INTERNAL_ERROR', () => execution.getLease(lineage.lease.id));
      control.prepare("UPDATE leases SET status = 'REQUESTED' WHERE id = ?")
        .run(lineage.lease.id);

      control.prepare(`
        UPDATE claims
        SET claimed_criteria_json = '["MIS-002/M01/F01/AC-001","MIS-002/M01/F01/AC-001"]'
        WHERE id = ?
      `).run(claim.id);
      expectCode('INTERNAL_ERROR', () => execution.getClaim(claim.id));
    } finally {
      control.close();
    }
  });
});

test('the focused ExecutionStore never creates another SQLite connection or transaction authority', () => {
  const sourcePath = join(process.cwd(), 'src', 'store', 'execution-store.ts');
  assert.equal(existsSync(sourcePath), true, 'src/store/execution-store.ts must exist.');
  const source = readFileSync(sourcePath, 'utf8');

  assert.doesNotMatch(source, /new\s+DatabaseSync\s*\(/);
  assert.doesNotMatch(source, /new\s+SqliteTransaction\s*\(/);
  assert.doesNotMatch(source, /BEGIN\s+IMMEDIATE/i);
});
