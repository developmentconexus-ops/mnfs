import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { MnfsError, type MnfsErrorCode } from '../../src/domain/errors.js';
import type {
  Attempt,
  GitObjectFormat,
  ProcessIdentity,
  WorkerRun,
  WorkerRunStatus,
  WriteTrack,
} from '../../src/execution/model.js';
import { SqliteStore } from '../../src/store/sqlite-store.js';
import { validPlanV2 } from '../fixtures/mission-plans.js';

const EXECUTION_SERVICE_SPECIFIER = '../../src/services/' + 'execution-service.js';
const OPENED_AT = '2026-08-05T00:20:00.000Z';
const PLAN_CREATED_AT = '2026-08-05T00:21:00.000Z';
const PLAN_APPROVED_AT = '2026-08-05T00:22:00.000Z';
const OCCURRED_AT = '2026-08-05T00:23:00.000Z';
const RUNNING_AT = '2026-08-05T00:24:00.000Z';
const TERMINATED_AT = '2026-08-05T00:25:00.000Z';
const REPLAN_CREATED_AT = '2026-08-05T00:26:00.000Z';
const REPLAN_APPROVED_AT = '2026-08-05T00:27:00.000Z';
const BASE_COMMIT_ONE = '1'.repeat(40);
const BASE_COMMIT_TWO = '2'.repeat(40);

interface CommitObservation {
  readonly sha: string;
  readonly objectFormat: GitObjectFormat;
}

interface GitCommitInspector {
  requireCommit(sha: string): CommitObservation;
}

interface OpenWriteTrackInput {
  readonly missionId: string;
  readonly milestoneQualifiedId: string;
  readonly featureQualifiedId: string;
  readonly contractHash: string;
  readonly baseCommitSha: string;
  readonly idempotencyKey: string;
  readonly occurredAt: string;
}

interface ResourceDispositionObservation {
  readonly sourcePreserved: boolean;
  readonly evidencePreserved: boolean;
  readonly worktreeState: 'ABSENT' | 'CLEAN' | 'DIRTY' | 'UNKNOWN';
  readonly unclassifiedWork: boolean;
}

interface ExecutionServiceContract {
  openWriteTrack(input: OpenWriteTrackInput): {
    readonly track: WriteTrack;
    readonly attempt: Attempt;
  };
  openWorkerRun(input: {
    readonly attemptId: string;
    readonly contractHash: string;
    readonly occurredAt: string;
  }): WorkerRun;
  replaceWorkerRun(input: {
    readonly attemptId: string;
    readonly currentRunId: string;
    readonly expectedCurrentRunVersion: number;
    readonly terminalStatus: Extract<WorkerRunStatus, 'EXITED' | 'LOST' | 'CANCELLED'>;
    readonly exitCode?: number;
    readonly occurredAt: string;
  }): {
    readonly previousRun: WorkerRun;
    readonly currentRun: WorkerRun;
  };
  supersedeAttempt(input: {
    readonly writeTrackId: string;
    readonly attemptId: string;
    readonly expectedAttemptVersion: number;
    readonly baseCommitSha: string;
    readonly observation: ResourceDispositionObservation;
    readonly occurredAt: string;
  }): {
    readonly previousAttempt: Attempt;
    readonly currentAttempt: Attempt;
  };
  abandonWriteTrack(input: {
    readonly writeTrackId: string;
    readonly expectedTrackVersion: number;
    readonly observation: ResourceDispositionObservation;
    readonly occurredAt: string;
  }): WriteTrack;
}

interface ExecutionServiceModule {
  readonly ExecutionService: new (input: {
    readonly store: SqliteStore;
    readonly git: GitCommitInspector;
  }) => ExecutionServiceContract;
}

interface Harness {
  readonly store: SqliteStore;
  readonly approvedHash: string;
}

class ScriptedGitInspector implements GitCommitInspector {
  readonly #commits = new Map<string, GitObjectFormat>([
    [BASE_COMMIT_ONE, 'sha1'],
    [BASE_COMMIT_TWO, 'sha1'],
  ]);

  requireCommit(sha: string): CommitObservation {
    const objectFormat = this.#commits.get(sha);
    if (objectFormat === undefined) {
      throw new MnfsError('GIT_OBJECT_INVALID', `Git object ${sha} is not a commit.`);
    }
    return { sha, objectFormat };
  }
}

async function loadExecutionService(): Promise<ExecutionServiceModule> {
  return await import(EXECUTION_SERVICE_SPECIFIER) as ExecutionServiceModule;
}

function expectCode(code: MnfsErrorCode, operation: () => unknown): void {
  assert.throws(
    operation,
    (error: unknown) => error instanceof MnfsError && error.code === code,
  );
}

function withHarness(label: string, operation: (harness: Harness) => void): void {
  const directory = mkdtempSync(join(tmpdir(), `mnfs-m01-task7-correction-${label}-`));
  const store = SqliteStore.open(join(directory, 'mnfs.db'));
  try {
    store.openMission({
      missionId: 'MIS-002',
      eventId: `EVT-MIS-002-TASK7-CORRECTION-${label.toUpperCase()}-OPEN`,
      goal: 'Prove Task 7 corrective lifecycle fences',
      openedAt: OPENED_AT,
    });
    const saved = store.saveMissionPlanRevision({
      missionId: 'MIS-002',
      content: validPlanV2('MIS-002', 'Task 7 corrective baseline'),
      createdAt: PLAN_CREATED_AT,
    });
    const approved = store.approveMissionPlan({
      missionId: 'MIS-002',
      contentHash: saved.contentHash,
      approvedAt: PLAN_APPROVED_AT,
    });
    operation({ store, approvedHash: approved.contentHash });
  } finally {
    store.close();
    rmSync(directory, { recursive: true, force: true });
  }
}

function serviceFor(
  module: ExecutionServiceModule,
  store: SqliteStore,
): ExecutionServiceContract {
  return new module.ExecutionService({
    store,
    git: new ScriptedGitInspector(),
  });
}

function openInput(contractHash: string): OpenWriteTrackInput {
  return {
    missionId: 'MIS-002',
    milestoneQualifiedId: 'MIS-002/M01',
    featureQualifiedId: 'MIS-002/M01/F01',
    contractHash,
    baseCommitSha: BASE_COMMIT_ONE,
    idempotencyKey: 'track:open:task7-correction',
    occurredAt: OCCURRED_AT,
  };
}

function safeObservation(): ResourceDispositionObservation {
  return {
    sourcePreserved: true,
    evidencePreserved: true,
    worktreeState: 'ABSENT',
    unclassifiedWork: false,
  };
}

function markSourceReady(store: SqliteStore, attempt: Attempt): Attempt {
  return store.execution.setAttemptState({
    id: attempt.id,
    expectedVersion: attempt.version,
    status: 'OPEN',
    sourceStatus: 'READY',
    sourcePath: `/home/mnfs/runtime/execution-sources/${attempt.writeTrackId}/${attempt.id}/source`,
    sourceFingerprint: `sha256:${'c'.repeat(64)}`,
    updatedAt: RUNNING_AT,
  });
}

function approveReplan(store: SqliteStore, previousHash: string, title: string): string {
  const saved = store.saveMissionPlanRevision({
    missionId: 'MIS-002',
    content: validPlanV2('MIS-002', title),
    expectedPreviousHash: previousHash,
    createdAt: REPLAN_CREATED_AT,
  });
  return store.approveMissionPlan({
    missionId: 'MIS-002',
    contentHash: saved.contentHash,
    approvedAt: REPLAN_APPROVED_AT,
  }).contentHash;
}

test('R7-01 rejects a new Worker Run after its Track is abandoned', async () => {
  const module = await loadExecutionService();

  withHarness('abandoned-track', ({ store, approvedHash }) => {
    const service = serviceFor(module, store);
    const opened = service.openWriteTrack(openInput(approvedHash));
    markSourceReady(store, opened.attempt);
    const abandoned = service.abandonWriteTrack({
      writeTrackId: opened.track.id,
      expectedTrackVersion: opened.track.version,
      observation: safeObservation(),
      occurredAt: TERMINATED_AT,
    });
    assert.equal(abandoned.status, 'ABANDONED');

    expectCode('WORKER_RUN_CONFLICT', () => service.openWorkerRun({
      attemptId: opened.attempt.id,
      contractHash: approvedHash,
      occurredAt: TERMINATED_AT,
    }));
    assert.equal(store.execution.getCurrentWorkerRun(opened.attempt.id), undefined);
  });
});

test('R7-02 preserves durable process identity when a RUNNING Run is replaced', async () => {
  const module = await loadExecutionService();

  withHarness('process-identity', ({ store, approvedHash }) => {
    const service = serviceFor(module, store);
    const opened = service.openWriteTrack(openInput(approvedHash));
    const first = service.openWorkerRun({
      attemptId: opened.attempt.id,
      contractHash: approvedHash,
      occurredAt: OCCURRED_AT,
    });
    const identity: ProcessIdentity = {
      bootId: 'boot-task7-correction',
      pid: 7001,
      startTicks: '1234567',
    };
    const running = store.execution.setWorkerRunState({
      id: first.id,
      expectedVersion: first.version,
      status: 'RUNNING',
      processIdentity: identity,
      processStartedAt: RUNNING_AT,
      updatedAt: RUNNING_AT,
    });

    const replacement = service.replaceWorkerRun({
      attemptId: opened.attempt.id,
      currentRunId: running.id,
      expectedCurrentRunVersion: running.version,
      terminalStatus: 'LOST',
      occurredAt: TERMINATED_AT,
    });

    assert.deepEqual(replacement.previousRun.processIdentity, identity);
    assert.equal(replacement.previousRun.processStartedAt, RUNNING_AT);
    assert.deepEqual(store.execution.getWorkerRun(running.id), replacement.previousRun);
  });
});

test('R7-03 rejects Worker Run replacement after a newer contract is approved', async () => {
  const module = await loadExecutionService();

  withHarness('stale-run-replacement', ({ store, approvedHash }) => {
    const service = serviceFor(module, store);
    const opened = service.openWriteTrack(openInput(approvedHash));
    const first = service.openWorkerRun({
      attemptId: opened.attempt.id,
      contractHash: approvedHash,
      occurredAt: OCCURRED_AT,
    });
    approveReplan(store, approvedHash, 'Task 7 replacement Replan');

    expectCode('EXECUTION_CONTRACT_CONFLICT', () => service.replaceWorkerRun({
      attemptId: opened.attempt.id,
      currentRunId: first.id,
      expectedCurrentRunVersion: first.version,
      terminalStatus: 'LOST',
      occurredAt: TERMINATED_AT,
    }));
    assert.deepEqual(store.execution.getWorkerRun(first.id), first);
    assert.equal(store.execution.getWorkerRun('WT-001/A01/WR02'), undefined);
  });
});

test('R7-03 rejects Attempt supersession after a newer contract is approved', async () => {
  const module = await loadExecutionService();

  withHarness('stale-attempt-supersession', ({ store, approvedHash }) => {
    const service = serviceFor(module, store);
    const opened = service.openWriteTrack(openInput(approvedHash));
    const ready = markSourceReady(store, opened.attempt);
    approveReplan(store, approvedHash, 'Task 7 supersession Replan');

    expectCode('EXECUTION_CONTRACT_CONFLICT', () => service.supersedeAttempt({
      writeTrackId: opened.track.id,
      attemptId: ready.id,
      expectedAttemptVersion: ready.version,
      baseCommitSha: BASE_COMMIT_TWO,
      observation: safeObservation(),
      occurredAt: TERMINATED_AT,
    }));
    assert.deepEqual(store.execution.getAttempt(ready.id), ready);
    assert.equal(store.execution.getAttempt('WT-001/A02'), undefined);
  });
});
