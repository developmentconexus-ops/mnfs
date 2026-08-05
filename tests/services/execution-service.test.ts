import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';

import { MnfsError, type MnfsErrorCode } from '../../src/domain/errors.js';
import type { MissionPlanContentV2 } from '../../src/domain/mission-plan.js';
import type {
  Attempt,
  GitObjectFormat,
  WorkerRun,
  WorkerRunStatus,
  WriteTrack,
} from '../../src/execution/model.js';
import { SqliteStore } from '../../src/store/sqlite-store.js';
import { validPlanV2 } from '../fixtures/mission-plans.js';

const EXECUTION_SERVICE_SPECIFIER = '../../src/services/' + 'execution-service.js';
const OPENED_AT = '2026-08-04T23:30:00.000Z';
const PLAN_CREATED_AT = '2026-08-04T23:31:00.000Z';
const PLAN_APPROVED_AT = '2026-08-04T23:32:00.000Z';
const OCCURRED_AT = '2026-08-04T23:33:00.000Z';
const UPDATED_AT = '2026-08-04T23:34:00.000Z';
const BASE_COMMIT_ONE = '1'.repeat(40);
const BASE_COMMIT_TWO = '2'.repeat(40);
const LEASE_INPUT_HASH = `sha256:${'a'.repeat(64)}`;

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

interface OpenWriteTrackResult {
  readonly track: WriteTrack;
  readonly attempt: Attempt;
}

interface ResourceDispositionObservation {
  readonly sourcePreserved: boolean;
  readonly evidencePreserved: boolean;
  readonly worktreeState: 'ABSENT' | 'CLEAN' | 'DIRTY' | 'UNKNOWN';
  readonly unclassifiedWork: boolean;
}

interface ExecutionServiceContract {
  openWriteTrack(input: OpenWriteTrackInput): OpenWriteTrackResult;
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
  readonly databasePath: string;
  readonly store: SqliteStore;
  readonly approvedHash: string;
}

class ScriptedGitInspector implements GitCommitInspector {
  readonly calls: string[] = [];
  readonly #commits: ReadonlyMap<string, GitObjectFormat>;

  constructor(commits: Readonly<Record<string, GitObjectFormat>>) {
    this.#commits = new Map(Object.entries(commits));
  }

  requireCommit(sha: string): CommitObservation {
    this.calls.push(sha);
    const objectFormat = this.#commits.get(sha);
    if (objectFormat === undefined) {
      throw new MnfsError('GIT_OBJECT_INVALID', `Git object ${sha} is not a commit.`);
    }
    return { sha, objectFormat };
  }
}

function describeError(error: unknown): string {
  return error instanceof Error ? `${error.name}: ${error.message}` : String(error);
}

async function loadExecutionService(): Promise<ExecutionServiceModule> {
  try {
    return await import(EXECUTION_SERVICE_SPECIFIER) as ExecutionServiceModule;
  } catch (error) {
    assert.fail(`M01 ExecutionService is not implemented: ${describeError(error)}`);
  }
}

function expectCode(code: MnfsErrorCode, operation: () => unknown): void {
  assert.throws(
    operation,
    (error: unknown) => error instanceof MnfsError && error.code === code,
  );
}

function planWithoutFeatureRequirements(): MissionPlanContentV2 {
  const plan = validPlanV2('MIS-002', 'M01 contract without Feature allocation');
  return {
    ...plan,
    milestones: plan.milestones.map((milestone) => milestone.qualifiedId === 'MIS-002/M01'
      ? {
          ...milestone,
          requirementRefs: [],
          acceptanceCriteria: milestone.acceptanceCriteria.map((criterion) => ({
            ...criterion,
            requirementRefs: [],
          })),
          features: milestone.features.map((feature) => feature.qualifiedId === 'MIS-002/M01/F01'
            ? {
                ...feature,
                requirementRefs: [],
                acceptanceCriteria: feature.acceptanceCriteria.map((criterion) => ({
                  ...criterion,
                  requirementRefs: [],
                })),
              }
            : feature),
        }
      : milestone),
  };
}

function withHarness(
  label: string,
  operation: (harness: Harness) => void,
  plan: MissionPlanContentV2 = validPlanV2('MIS-002', 'M01 ExecutionService contract'),
): void {
  const directory = mkdtempSync(join(tmpdir(), `mnfs-m01-task7-${label}-`));
  const databasePath = join(directory, 'mnfs.db');
  const store = SqliteStore.open(databasePath);
  try {
    store.openMission({
      missionId: 'MIS-002',
      eventId: `EVT-MIS-002-TASK7-${label.toUpperCase()}-OPEN`,
      goal: 'Prove the M01 ExecutionService boundary',
      openedAt: OPENED_AT,
    });
    const saved = store.saveMissionPlanRevision({
      missionId: 'MIS-002',
      content: plan,
      createdAt: PLAN_CREATED_AT,
    });
    const approved = store.approveMissionPlan({
      missionId: 'MIS-002',
      contentHash: saved.contentHash,
      approvedAt: PLAN_APPROVED_AT,
    });
    operation({ databasePath, store, approvedHash: approved.contentHash });
  } finally {
    store.close();
    rmSync(directory, { recursive: true, force: true });
  }
}

function serviceFor(
  module: ExecutionServiceModule,
  store: SqliteStore,
  commits: Readonly<Record<string, GitObjectFormat>> = {
    [BASE_COMMIT_ONE]: 'sha1',
    [BASE_COMMIT_TWO]: 'sha1',
  },
): { readonly service: ExecutionServiceContract; readonly git: ScriptedGitInspector } {
  const git = new ScriptedGitInspector(commits);
  return {
    service: new module.ExecutionService({ store, git }),
    git,
  };
}

function openInput(
  contractHash: string,
  overrides: Partial<OpenWriteTrackInput> = {},
): OpenWriteTrackInput {
  return {
    missionId: 'MIS-002',
    milestoneQualifiedId: 'MIS-002/M01',
    featureQualifiedId: 'MIS-002/M01/F01',
    contractHash,
    baseCommitSha: BASE_COMMIT_ONE,
    idempotencyKey: 'track:open:task7',
    occurredAt: OCCURRED_AT,
    ...overrides,
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

function sequenceValue(databasePath: string, kind: 'WRITE_TRACK' | 'LEASE'): number {
  const database = new DatabaseSync(databasePath, { readOnly: true });
  try {
    const row = database.prepare(`
      SELECT next_value
      FROM entity_sequences
      WHERE kind = ?
    `).get(kind) as { readonly next_value: number };
    return Number(row.next_value);
  } finally {
    database.close();
  }
}

function installEventFailureTrigger(databasePath: string, eventType: string): void {
  const database = new DatabaseSync(databasePath);
  try {
    database.exec(`
      CREATE TRIGGER task7_fail_event
      BEFORE INSERT ON events
      WHEN NEW.type = '${eventType}'
      BEGIN
        SELECT RAISE(ABORT, 'injected Task 7 Event failure');
      END;
    `);
  } finally {
    database.close();
  }
}

function dropEventFailureTrigger(databasePath: string): void {
  const database = new DatabaseSync(databasePath);
  try {
    database.exec('DROP TRIGGER IF EXISTS task7_fail_event');
  } finally {
    database.close();
  }
}

function markSourceReady(store: SqliteStore, attempt: Attempt): Attempt {
  return store.execution.setAttemptState({
    id: attempt.id,
    expectedVersion: attempt.version,
    status: 'OPEN',
    sourceStatus: 'READY',
    sourcePath: `/home/mnfs/runtime/execution-sources/${attempt.writeTrackId}/${attempt.id}/source`,
    sourceFingerprint: `sha256:${'c'.repeat(64)}`,
    updatedAt: UPDATED_AT,
  });
}

test('exports the accepted M01 ExecutionService boundary without introducing Task 8 adapters', async () => {
  const module = await loadExecutionService();
  assert.equal(typeof module.ExecutionService, 'function');
});

test('rejects stale contracts, invalid qualified targets, missing allocation and non-commit bases', async () => {
  const module = await loadExecutionService();

  withHarness('authority', ({ store, approvedHash }) => {
    const firstApprovedHash = approvedHash;
    const second = store.saveMissionPlanRevision({
      missionId: 'MIS-002',
      content: validPlanV2('MIS-002', 'Newer M01 ExecutionService contract'),
      expectedPreviousHash: firstApprovedHash,
      createdAt: '2026-08-04T23:35:00.000Z',
    });
    const latest = store.approveMissionPlan({
      missionId: 'MIS-002',
      contentHash: second.contentHash,
      approvedAt: '2026-08-04T23:36:00.000Z',
    });
    const { service, git } = serviceFor(module, store, {
      [BASE_COMMIT_ONE]: 'sha1',
    });

    expectCode(
      'EXECUTION_CONTRACT_CONFLICT',
      () => service.openWriteTrack(openInput(firstApprovedHash)),
    );
    expectCode(
      'EXECUTION_TARGET_INVALID',
      () => service.openWriteTrack(openInput(latest.contentHash, {
        featureQualifiedId: 'MIS-002/M01/F99',
      })),
    );
    expectCode(
      'EXECUTION_TARGET_INVALID',
      () => service.openWriteTrack(openInput(latest.contentHash, {
        milestoneQualifiedId: 'MIS-002/M02',
        featureQualifiedId: 'MIS-002/M02/F01',
      })),
    );
    expectCode(
      'GIT_OBJECT_INVALID',
      () => service.openWriteTrack(openInput(latest.contentHash, {
        baseCommitSha: BASE_COMMIT_TWO,
      })),
    );
    assert.deepEqual(git.calls, [BASE_COMMIT_TWO]);
  });

  withHarness('missing-allocation', ({ store, approvedHash }) => {
    const { service, git } = serviceFor(module, store);
    expectCode(
      'EXECUTION_TARGET_INVALID',
      () => service.openWriteTrack(openInput(approvedHash)),
    );
    assert.deepEqual(git.calls, []);
  }, planWithoutFeatureRequirements());
});

test('opens Track and A01 with matching Events and replays only identical input', async () => {
  const module = await loadExecutionService();

  withHarness('open-replay', ({ store, approvedHash }) => {
    const { service } = serviceFor(module, store);
    const input = openInput(approvedHash);
    const opened = service.openWriteTrack(input);

    assert.equal(opened.track.id, 'WT-001');
    assert.equal(opened.track.status, 'ACTIVE');
    assert.equal(opened.track.contractHash, approvedHash);
    assert.equal(opened.attempt.id, 'WT-001/A01');
    assert.equal(opened.attempt.status, 'OPEN');
    assert.equal(opened.attempt.sourceStatus, 'REQUESTED');
    assert.equal(opened.attempt.baseCommitSha, BASE_COMMIT_ONE);
    assert.equal(opened.attempt.gitObjectFormat, 'sha1');

    const executionEvents = store.listEvents().filter((event) =>
      event.type === 'WRITE_TRACK_OPENED' || event.type === 'ATTEMPT_OPENED');
    assert.deepEqual(executionEvents.map((event) => event.type), [
      'WRITE_TRACK_OPENED',
      'ATTEMPT_OPENED',
    ]);
    assert.equal(executionEvents[0]?.payload.writeTrackId, opened.track.id);
    assert.equal(executionEvents[1]?.payload.attemptId, opened.attempt.id);

    const beforeReplay = store.listEvents().length;
    assert.deepEqual(service.openWriteTrack(input), opened);
    assert.equal(store.listEvents().length, beforeReplay);

    expectCode('WRITE_TRACK_CONFLICT', () => service.openWriteTrack({
      ...input,
      baseCommitSha: BASE_COMMIT_TWO,
    }));
    assert.equal(store.listEvents().length, beforeReplay);
  });
});

test('rolls back Track, A01, Events and global identity when the second Event fails', async () => {
  const module = await loadExecutionService();

  withHarness('open-rollback', ({ databasePath, store, approvedHash }) => {
    const { service } = serviceFor(module, store);
    const baselineEvents = store.listEvents().length;
    installEventFailureTrigger(databasePath, 'ATTEMPT_OPENED');

    assert.throws(() => service.openWriteTrack(openInput(approvedHash, {
      idempotencyKey: 'track:open:rollback',
    })));
    assert.equal(rowCount(databasePath, 'write_tracks'), 0);
    assert.equal(rowCount(databasePath, 'attempts'), 0);
    assert.equal(store.listEvents().length, baselineEvents);
    assert.equal(sequenceValue(databasePath, 'WRITE_TRACK'), 1);

    dropEventFailureTrigger(databasePath);
    const opened = service.openWriteTrack(openInput(approvedHash, {
      idempotencyKey: 'track:open:after-rollback',
    }));
    assert.equal(opened.track.id, 'WT-001');
    assert.equal(opened.attempt.id, 'WT-001/A01');
  });
});

test('opens and replaces Worker Runs atomically without rewriting Attempt identity', async () => {
  const module = await loadExecutionService();

  withHarness('run-replacement', ({ store, approvedHash }) => {
    const { service } = serviceFor(module, store);
    const opened = service.openWriteTrack(openInput(approvedHash));
    const first = service.openWorkerRun({
      attemptId: opened.attempt.id,
      contractHash: approvedHash,
      occurredAt: OCCURRED_AT,
    });
    assert.equal(first.id, 'WT-001/A01/WR01');
    assert.equal(first.status, 'STARTING');

    const replacement = service.replaceWorkerRun({
      attemptId: opened.attempt.id,
      currentRunId: first.id,
      expectedCurrentRunVersion: first.version,
      terminalStatus: 'LOST',
      occurredAt: UPDATED_AT,
    });
    assert.equal(replacement.previousRun.id, first.id);
    assert.equal(replacement.previousRun.status, 'LOST');
    assert.equal(replacement.currentRun.id, 'WT-001/A01/WR02');
    assert.equal(replacement.currentRun.attemptId, opened.attempt.id);
    assert.equal(replacement.currentRun.status, 'STARTING');
    assert.deepEqual(store.execution.getWorkerRun(first.id), replacement.previousRun);

    const runEvents = store.listEvents().filter((event) =>
      event.type === 'WORKER_RUN_OPENED' || event.type === 'WORKER_RUN_STATE_CHANGED');
    assert.deepEqual(runEvents.map((event) => event.type), [
      'WORKER_RUN_OPENED',
      'WORKER_RUN_STATE_CHANGED',
      'WORKER_RUN_OPENED',
    ]);
  });

  withHarness('run-rollback', ({ databasePath, store, approvedHash }) => {
    const { service } = serviceFor(module, store);
    const opened = service.openWriteTrack(openInput(approvedHash));
    const first = service.openWorkerRun({
      attemptId: opened.attempt.id,
      contractHash: approvedHash,
      occurredAt: OCCURRED_AT,
    });
    const baselineEvents = store.listEvents().length;
    installEventFailureTrigger(databasePath, 'WORKER_RUN_OPENED');

    assert.throws(() => service.replaceWorkerRun({
      attemptId: opened.attempt.id,
      currentRunId: first.id,
      expectedCurrentRunVersion: first.version,
      terminalStatus: 'LOST',
      occurredAt: UPDATED_AT,
    }));
    assert.deepEqual(store.execution.getWorkerRun(first.id), first);
    assert.equal(store.execution.getWorkerRun('WT-001/A01/WR02'), undefined);
    assert.equal(store.listEvents().length, baselineEvents);
    dropEventFailureTrigger(databasePath);
  });
});

test('supersedes an Attempt only after resource guards and preserves prior identity', async () => {
  const module = await loadExecutionService();

  withHarness('attempt-supersession', ({ store, approvedHash }) => {
    const { service } = serviceFor(module, store);
    const opened = service.openWriteTrack(openInput(approvedHash));
    const ready = markSourceReady(store, opened.attempt);

    expectCode('ATTEMPT_CONFLICT', () => service.supersedeAttempt({
      writeTrackId: opened.track.id,
      attemptId: ready.id,
      expectedAttemptVersion: ready.version,
      baseCommitSha: BASE_COMMIT_TWO,
      observation: {
        ...safeObservation(),
        worktreeState: 'DIRTY',
        unclassifiedWork: true,
      },
      occurredAt: UPDATED_AT,
    }));
    assert.deepEqual(store.execution.getAttempt(ready.id), ready);

    const result = service.supersedeAttempt({
      writeTrackId: opened.track.id,
      attemptId: ready.id,
      expectedAttemptVersion: ready.version,
      baseCommitSha: BASE_COMMIT_TWO,
      observation: safeObservation(),
      occurredAt: UPDATED_AT,
    });
    assert.equal(result.previousAttempt.id, ready.id);
    assert.equal(result.previousAttempt.status, 'SUPERSEDED');
    assert.equal(result.currentAttempt.id, 'WT-001/A02');
    assert.equal(result.currentAttempt.status, 'OPEN');
    assert.equal(result.currentAttempt.sourceStatus, 'REQUESTED');
    assert.equal(result.currentAttempt.baseCommitSha, BASE_COMMIT_TWO);
  });

  withHarness('attempt-current-run', ({ store, approvedHash }) => {
    const { service } = serviceFor(module, store);
    const opened = service.openWriteTrack(openInput(approvedHash));
    const ready = markSourceReady(store, opened.attempt);
    service.openWorkerRun({
      attemptId: ready.id,
      contractHash: approvedHash,
      occurredAt: OCCURRED_AT,
    });

    expectCode('ATTEMPT_CONFLICT', () => service.supersedeAttempt({
      writeTrackId: opened.track.id,
      attemptId: ready.id,
      expectedAttemptVersion: ready.version,
      baseCommitSha: BASE_COMMIT_TWO,
      observation: safeObservation(),
      occurredAt: UPDATED_AT,
    }));
    assert.equal(store.execution.getAttempt('WT-001/A02'), undefined);
  });
});

test('abandons only an empty guarded Track and never releases a Lease implicitly', async () => {
  const module = await loadExecutionService();

  withHarness('abandon-guards', ({ store, approvedHash }) => {
    const { service } = serviceFor(module, store);
    const opened = service.openWriteTrack(openInput(approvedHash));
    const ready = markSourceReady(store, opened.attempt);

    expectCode('WRITE_TRACK_NOT_ABANDONABLE', () => service.abandonWriteTrack({
      writeTrackId: opened.track.id,
      expectedTrackVersion: opened.track.version,
      observation: {
        ...safeObservation(),
        evidencePreserved: false,
        worktreeState: 'UNKNOWN',
      },
      occurredAt: UPDATED_AT,
    }));

    const lease = store.execution.allocateLease({
      writeTrackId: opened.track.id,
      attemptId: ready.id,
      contractHash: approvedHash,
      grantIdempotencyKey: 'lease:grant:task7-abandon',
      grantInputHash: LEASE_INPUT_HASH,
      holder: 'mnfs-task7-abandon-holder',
      occurredAt: OCCURRED_AT,
    });
    expectCode('WRITE_TRACK_NOT_ABANDONABLE', () => service.abandonWriteTrack({
      writeTrackId: opened.track.id,
      expectedTrackVersion: opened.track.version,
      observation: safeObservation(),
      occurredAt: UPDATED_AT,
    }));
    assert.equal(store.execution.getLease(lease.id)?.status, 'REQUESTED');
    assert.equal(store.execution.getWriteTrack(opened.track.id)?.status, 'ACTIVE');
  });

  withHarness('abandon-safe', ({ store, approvedHash }) => {
    const { service } = serviceFor(module, store);
    const opened = service.openWriteTrack(openInput(approvedHash));
    const ready = markSourceReady(store, opened.attempt);
    const abandoned = service.abandonWriteTrack({
      writeTrackId: opened.track.id,
      expectedTrackVersion: opened.track.version,
      observation: safeObservation(),
      occurredAt: UPDATED_AT,
    });

    assert.equal(abandoned.status, 'ABANDONED');
    assert.equal(abandoned.version, 2);
    assert.deepEqual(store.execution.getAttempt(ready.id), ready);
    const abandonedEvents = store.listEvents().filter((event) =>
      event.type === 'WRITE_TRACK_ABANDONED');
    assert.equal(abandonedEvents.length, 1);
    assert.equal(abandonedEvents[0]?.payload.writeTrackId, opened.track.id);
  });
});
