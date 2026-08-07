import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { MnfsError, type MnfsErrorCode } from '../../src/domain/errors.js';
import type {
  Attempt,
  GitObjectFormat,
  WorkerRun,
  WorkerRunStatus,
  WriteTrack,
} from '../../src/execution/model.js';
import { SqliteStore, type ExecutionAtomicSession } from '../../src/store/sqlite-store.js';
import { validPlanV2 } from '../fixtures/mission-plans.js';

const EXECUTION_SERVICE_SPECIFIER = '../../src/services/' + 'execution-service.js';
const OPENED_AT = '2026-08-05T00:40:00.000Z';
const PLAN_CREATED_AT = '2026-08-05T00:41:00.000Z';
const PLAN_APPROVED_AT = '2026-08-05T00:42:00.000Z';
const OCCURRED_AT = '2026-08-05T00:43:00.000Z';
const SOURCE_READY_AT = '2026-08-05T00:44:00.000Z';
const INTERLEAVED_AT = '2026-08-05T00:45:00.000Z';
const REPLAN_CREATED_AT = '2026-08-05T00:46:00.000Z';
const REPLAN_APPROVED_AT = '2026-08-05T00:47:00.000Z';
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
  readonly primary: SqliteStore;
  readonly concurrent: SqliteStore;
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
  const directory = mkdtempSync(join(tmpdir(), `mnfs-m01-task7-atomic-${label}-`));
  const databasePath = join(directory, 'mnfs.db');
  const primary = SqliteStore.open(databasePath);
  let concurrent: SqliteStore | undefined;
  try {
    primary.openMission({
      missionId: 'MIS-002',
      eventId: `EVT-MIS-002-TASK7-ATOMIC-${label.toUpperCase()}-OPEN`,
      goal: 'Prove Task 7 atomic authority under controlled interleaving',
      openedAt: OPENED_AT,
    });
    const saved = primary.saveMissionPlanRevision({
      missionId: 'MIS-002',
      content: validPlanV2('MIS-002', 'Task 7 atomic authority baseline'),
      createdAt: PLAN_CREATED_AT,
    });
    const approved = primary.approveMissionPlan({
      missionId: 'MIS-002',
      contentHash: saved.contentHash,
      approvedAt: PLAN_APPROVED_AT,
    });
    concurrent = SqliteStore.openCurrent(databasePath);
    operation({ primary, concurrent, approvedHash: approved.contentHash });
  } finally {
    concurrent?.close();
    primary.close();
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

function openInput(contractHash: string, idempotencyKey: string): OpenWriteTrackInput {
  return {
    missionId: 'MIS-002',
    milestoneQualifiedId: 'MIS-002/M01',
    featureQualifiedId: 'MIS-002/M01/F01',
    contractHash,
    baseCommitSha: BASE_COMMIT_ONE,
    idempotencyKey,
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
    sourceFingerprint: `sha256:${'d'.repeat(64)}`,
    updatedAt: SOURCE_READY_AT,
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

function interleaveImmediatelyBeforeAtomic(
  store: SqliteStore,
  interleaving: () => void,
): void {
  const execution = store.execution;
  const originalRunAtomic = execution.runAtomic.bind(execution) as typeof execution.runAtomic;
  let armed = true;
  const replacement: typeof execution.runAtomic = <T>(
    operation: (session: ExecutionAtomicSession) => T,
  ): T => {
    if (armed) {
      armed = false;
      interleaving();
    }
    return originalRunAtomic(operation);
  };
  Object.defineProperty(execution, 'runAtomic', {
    configurable: true,
    value: replacement,
  });
}

function eventTypesAfter(store: SqliteStore, count: number): string[] {
  return store.listEvents().slice(count).map((event) => event.type);
}

test('R7-04 rejects Track opening when a Replan commits after validation but before BEGIN IMMEDIATE', async () => {
  const module = await loadExecutionService();

  withHarness('track-replan', ({ primary, concurrent, approvedHash }) => {
    const service = serviceFor(module, primary);
    const eventCount = primary.listEvents().length;
    interleaveImmediatelyBeforeAtomic(primary, () => {
      approveReplan(concurrent, approvedHash, 'Task 7 interleaved Track Replan');
    });

    expectCode('EXECUTION_CONTRACT_CONFLICT', () => service.openWriteTrack(
      openInput(approvedHash, 'track:open:atomic-authority'),
    ));

    assert.equal(primary.execution.getWriteTrack('WT-001'), undefined);
    assert.equal(primary.execution.getAttempt('WT-001/A01'), undefined);
    assert.deepEqual(eventTypesAfter(primary, eventCount), [
      'PLAN_REVISION_SAVED',
      'PLAN_APPROVED',
    ]);

    const currentHash = primary.getLatestApprovedMissionPlan('MIS-002')?.contentHash;
    assert.notEqual(currentHash, undefined);
    const opened = service.openWriteTrack(
      openInput(currentHash as string, 'track:open:after-atomic-authority'),
    );
    assert.equal(opened.track.id, 'WT-001');
    assert.equal(opened.attempt.id, 'WT-001/A01');
  });
});

test('R7-04 rejects Worker Run opening when another writer abandons the Track before BEGIN IMMEDIATE', async () => {
  const module = await loadExecutionService();

  withHarness('run-after-abandon', ({ primary, concurrent, approvedHash }) => {
    const service = serviceFor(module, primary);
    const concurrentService = serviceFor(module, concurrent);
    const opened = service.openWriteTrack(
      openInput(approvedHash, 'track:open:atomic-run'),
    );
    const eventCount = primary.listEvents().length;
    interleaveImmediatelyBeforeAtomic(primary, () => {
      concurrentService.abandonWriteTrack({
        writeTrackId: opened.track.id,
        expectedTrackVersion: opened.track.version,
        observation: safeObservation(),
        occurredAt: INTERLEAVED_AT,
      });
    });

    expectCode('WORKER_RUN_CONFLICT', () => service.openWorkerRun({
      attemptId: opened.attempt.id,
      contractHash: approvedHash,
      occurredAt: INTERLEAVED_AT,
    }));

    assert.equal(primary.execution.getWriteTrack(opened.track.id)?.status, 'ABANDONED');
    assert.equal(primary.execution.getCurrentWorkerRun(opened.attempt.id), undefined);
    assert.deepEqual(eventTypesAfter(primary, eventCount), ['WRITE_TRACK_ABANDONED']);
  });
});

test('R7-04 rejects Worker Run replacement when a Replan commits before BEGIN IMMEDIATE', async () => {
  const module = await loadExecutionService();

  withHarness('replacement-replan', ({ primary, concurrent, approvedHash }) => {
    const service = serviceFor(module, primary);
    const opened = service.openWriteTrack(
      openInput(approvedHash, 'track:open:atomic-replacement'),
    );
    const first = service.openWorkerRun({
      attemptId: opened.attempt.id,
      contractHash: approvedHash,
      occurredAt: OCCURRED_AT,
    });
    const eventCount = primary.listEvents().length;
    interleaveImmediatelyBeforeAtomic(primary, () => {
      approveReplan(concurrent, approvedHash, 'Task 7 interleaved replacement Replan');
    });

    expectCode('EXECUTION_CONTRACT_CONFLICT', () => service.replaceWorkerRun({
      attemptId: opened.attempt.id,
      currentRunId: first.id,
      expectedCurrentRunVersion: first.version,
      terminalStatus: 'LOST',
      occurredAt: INTERLEAVED_AT,
    }));

    assert.deepEqual(primary.execution.getWorkerRun(first.id), first);
    assert.equal(primary.execution.getWorkerRun('WT-001/A01/WR02'), undefined);
    assert.deepEqual(eventTypesAfter(primary, eventCount), [
      'PLAN_REVISION_SAVED',
      'PLAN_APPROVED',
    ]);
  });
});

test('R7-04 rejects Attempt supersession when another writer abandons the Track before BEGIN IMMEDIATE', async () => {
  const module = await loadExecutionService();

  withHarness('supersession-abandon', ({ primary, concurrent, approvedHash }) => {
    const service = serviceFor(module, primary);
    const concurrentService = serviceFor(module, concurrent);
    const opened = service.openWriteTrack(
      openInput(approvedHash, 'track:open:atomic-supersession'),
    );
    const ready = markSourceReady(primary, opened.attempt);
    const eventCount = primary.listEvents().length;
    interleaveImmediatelyBeforeAtomic(primary, () => {
      concurrentService.abandonWriteTrack({
        writeTrackId: opened.track.id,
        expectedTrackVersion: opened.track.version,
        observation: safeObservation(),
        occurredAt: INTERLEAVED_AT,
      });
    });

    expectCode('ATTEMPT_CONFLICT', () => service.supersedeAttempt({
      writeTrackId: opened.track.id,
      attemptId: ready.id,
      expectedAttemptVersion: ready.version,
      baseCommitSha: BASE_COMMIT_TWO,
      observation: safeObservation(),
      occurredAt: INTERLEAVED_AT,
    }));

    assert.equal(primary.execution.getWriteTrack(opened.track.id)?.status, 'ABANDONED');
    assert.deepEqual(primary.execution.getAttempt(ready.id), ready);
    assert.equal(primary.execution.getAttempt('WT-001/A02'), undefined);
    assert.deepEqual(eventTypesAfter(primary, eventCount), ['WRITE_TRACK_ABANDONED']);
  });
});
