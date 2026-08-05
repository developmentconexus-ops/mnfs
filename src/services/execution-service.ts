import { createHash } from 'node:crypto';

import { MnfsError } from '../domain/errors.js';
import { canonicalJson } from '../domain/mission-plan.js';
import type {
  Attempt,
  GitObjectFormat,
  WorkerRun,
  WorkerRunStatus,
  WriteTrack,
} from '../execution/model.js';
import type { SqliteStore } from '../store/sqlite-store.js';

const M01_MISSION_ID = 'MIS-002';
const M01_MILESTONE_QUALIFIED_ID = 'MIS-002/M01';

export interface CommitObservation {
  readonly sha: string;
  readonly objectFormat: GitObjectFormat;
}

export interface GitCommitInspector {
  requireCommit(sha: string): CommitObservation;
}

export interface OpenWriteTrackInput {
  readonly missionId: string;
  readonly milestoneQualifiedId: string;
  readonly featureQualifiedId: string;
  readonly contractHash: string;
  readonly baseCommitSha: string;
  readonly idempotencyKey: string;
  readonly occurredAt: string;
}

export interface OpenWriteTrackResult {
  readonly track: WriteTrack;
  readonly attempt: Attempt;
}

export interface ResourceDispositionObservation {
  readonly sourcePreserved: boolean;
  readonly evidencePreserved: boolean;
  readonly worktreeState: 'ABSENT' | 'CLEAN' | 'DIRTY' | 'UNKNOWN';
  readonly unclassifiedWork: boolean;
}

export interface OpenWorkerRunInput {
  readonly attemptId: string;
  readonly contractHash: string;
  readonly occurredAt: string;
}

export interface ReplaceWorkerRunInput {
  readonly attemptId: string;
  readonly currentRunId: string;
  readonly expectedCurrentRunVersion: number;
  readonly terminalStatus: Extract<WorkerRunStatus, 'EXITED' | 'LOST' | 'CANCELLED'>;
  readonly exitCode?: number;
  readonly occurredAt: string;
}

export interface SupersedeAttemptInput {
  readonly writeTrackId: string;
  readonly attemptId: string;
  readonly expectedAttemptVersion: number;
  readonly baseCommitSha: string;
  readonly observation: ResourceDispositionObservation;
  readonly occurredAt: string;
}

export interface AbandonWriteTrackInput {
  readonly writeTrackId: string;
  readonly expectedTrackVersion: number;
  readonly observation: ResourceDispositionObservation;
  readonly occurredAt: string;
}

function hashCanonicalInput(value: Readonly<Record<string, unknown>>): string {
  return `sha256:${createHash('sha256').update(canonicalJson(value)).digest('hex')}`;
}

function eventIdentity(value: string): string {
  return value.replaceAll('/', '-');
}

function payloadRecord(value: unknown): Readonly<Record<string, unknown>> | undefined {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Readonly<Record<string, unknown>>
    : undefined;
}

function payloadString(
  payload: Readonly<Record<string, unknown>>,
  field: string,
): string | undefined {
  const value = payload[field];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function requireSafeDisposition(
  observation: ResourceDispositionObservation,
  code: 'ATTEMPT_CONFLICT' | 'WRITE_TRACK_NOT_ABANDONABLE',
  operation: string,
): void {
  if (
    !observation.sourcePreserved
    || !observation.evidencePreserved
    || observation.unclassifiedWork
    || (observation.worktreeState !== 'ABSENT' && observation.worktreeState !== 'CLEAN')
  ) {
    throw new MnfsError(code, `${operation} is blocked by unresolved or unpreserved resources.`);
  }
}

export class ExecutionService {
  readonly #store: SqliteStore;
  readonly #git: GitCommitInspector;

  constructor(input: { readonly store: SqliteStore; readonly git: GitCommitInspector }) {
    this.#store = input.store;
    this.#git = input.git;
  }

  #requireApprovedTarget(input: OpenWriteTrackInput): void {
    const approved = this.#store.getLatestApprovedMissionPlan(input.missionId);
    if (approved === undefined || approved.contentHash !== input.contractHash) {
      throw new MnfsError(
        'EXECUTION_CONTRACT_CONFLICT',
        `Contract ${input.contractHash} is not the latest approved contract for ${input.missionId}.`,
      );
    }
    if (
      approved.content.schemaVersion !== 2
      || input.missionId !== M01_MISSION_ID
      || input.milestoneQualifiedId !== M01_MILESTONE_QUALIFIED_ID
    ) {
      throw new MnfsError('EXECUTION_TARGET_INVALID', 'Execution target is outside MIS-002/M01.');
    }

    const milestone = approved.content.milestones.find(
      (candidate) => candidate.qualifiedId === input.milestoneQualifiedId,
    );
    const feature = milestone?.features.find(
      (candidate) => candidate.qualifiedId === input.featureQualifiedId,
    );
    if (
      milestone === undefined
      || feature === undefined
      || feature.requirementRefs.length === 0
    ) {
      throw new MnfsError(
        'EXECUTION_TARGET_INVALID',
        `Qualified target ${input.featureQualifiedId} is absent or has no requirement allocation.`,
      );
    }
  }

  #requireCurrentContract(missionId: string, contractHash: string): void {
    const approved = this.#store.getLatestApprovedMissionPlan(missionId);
    if (approved === undefined || approved.contentHash !== contractHash) {
      throw new MnfsError(
        'EXECUTION_CONTRACT_CONFLICT',
        `Contract ${contractHash} is not the latest approved contract for ${missionId}.`,
      );
    }
  }

  #findOpenReplay(
    idempotencyKey: string,
    inputHash: string,
  ): OpenWriteTrackResult | undefined {
    const event = this.#store.listEvents().find((candidate) => {
      if (candidate.type !== 'WRITE_TRACK_OPENED') return false;
      const payload = payloadRecord(candidate.payload);
      return payload !== undefined && payloadString(payload, 'idempotencyKey') === idempotencyKey;
    });
    if (event === undefined) return undefined;

    const payload = payloadRecord(event.payload);
    if (payload === undefined || payloadString(payload, 'inputHash') !== inputHash) {
      throw new MnfsError(
        'WRITE_TRACK_CONFLICT',
        `Write Track idempotency key ${idempotencyKey} is bound to different input.`,
      );
    }
    const trackId = payloadString(payload, 'writeTrackId');
    const attemptId = payloadString(payload, 'attemptId');
    if (trackId === undefined || attemptId === undefined) {
      throw new MnfsError('INTERNAL_ERROR', 'Write Track replay Event is incomplete.');
    }
    const track = this.#store.execution.getWriteTrack(trackId);
    const attempt = this.#store.execution.getAttempt(attemptId);
    if (track === undefined || attempt === undefined) {
      throw new MnfsError('INTERNAL_ERROR', 'Write Track replay lineage is missing.');
    }
    return { track, attempt };
  }

  openWriteTrack(input: OpenWriteTrackInput): OpenWriteTrackResult {
    this.#requireApprovedTarget(input);
    const commit = this.#git.requireCommit(input.baseCommitSha);
    if (commit.sha !== input.baseCommitSha) {
      throw new MnfsError('GIT_OBJECT_INVALID', 'Git commit observation changed the requested base SHA.');
    }
    const inputHash = hashCanonicalInput({
      missionId: input.missionId,
      milestoneQualifiedId: input.milestoneQualifiedId,
      featureQualifiedId: input.featureQualifiedId,
      contractHash: input.contractHash,
      baseCommitSha: input.baseCommitSha,
      gitObjectFormat: commit.objectFormat,
    });
    const replay = this.#findOpenReplay(input.idempotencyKey, inputHash);
    if (replay !== undefined) return replay;

    return this.#store.execution.runAtomic((session) => {
      const track = session.allocateWriteTrack({
        missionId: input.missionId,
        milestoneQualifiedId: input.milestoneQualifiedId,
        featureQualifiedId: input.featureQualifiedId,
        contractHash: input.contractHash,
        occurredAt: input.occurredAt,
      });
      const attempt = session.allocateAttempt({
        writeTrackId: track.id,
        contractHash: input.contractHash,
        gitObjectFormat: commit.objectFormat,
        baseCommitSha: commit.sha,
        occurredAt: input.occurredAt,
      });
      session.appendEvent({
        eventId: `EVT-${track.id}-OPEN`,
        type: 'WRITE_TRACK_OPENED',
        payloadSchemaVersion: 1,
        missionId: input.missionId,
        occurredAt: input.occurredAt,
        payload: {
          writeTrackId: track.id,
          attemptId: attempt.id,
          idempotencyKey: input.idempotencyKey,
          inputHash,
          featureQualifiedId: input.featureQualifiedId,
          contractHash: input.contractHash,
        },
      });
      session.appendEvent({
        eventId: `EVT-${eventIdentity(attempt.id)}-OPEN`,
        type: 'ATTEMPT_OPENED',
        payloadSchemaVersion: 1,
        missionId: input.missionId,
        occurredAt: input.occurredAt,
        payload: {
          writeTrackId: track.id,
          attemptId: attempt.id,
          contractHash: input.contractHash,
          baseCommitSha: commit.sha,
          gitObjectFormat: commit.objectFormat,
        },
      });
      return { track, attempt };
    });
  }

  openWorkerRun(input: OpenWorkerRunInput): WorkerRun {
    const attempt = this.#store.execution.getAttempt(input.attemptId);
    if (attempt === undefined || attempt.status !== 'OPEN' || attempt.contractHash !== input.contractHash) {
      throw new MnfsError('WORKER_RUN_CONFLICT', `Attempt ${input.attemptId} is not open for a Worker Run.`);
    }
    const track = this.#store.execution.getWriteTrack(attempt.writeTrackId);
    if (track === undefined) {
      throw new MnfsError('INTERNAL_ERROR', `Write Track ${attempt.writeTrackId} is missing.`);
    }
    if (track.status !== 'ACTIVE' || track.contractHash !== attempt.contractHash) {
      throw new MnfsError('WORKER_RUN_CONFLICT', `Write Track ${track.id} is not active for a Worker Run.`);
    }
    this.#requireCurrentContract(track.missionId, track.contractHash);
    if (this.#store.execution.getCurrentWorkerRun(attempt.id) !== undefined) {
      throw new MnfsError('WORKER_RUN_CONFLICT', `Attempt ${attempt.id} already has a current Worker Run.`);
    }

    return this.#store.execution.runAtomic((session) => {
      const run = session.allocateWorkerRun({
        attemptId: attempt.id,
        contractHash: attempt.contractHash,
        occurredAt: input.occurredAt,
      });
      session.appendEvent({
        eventId: `EVT-${eventIdentity(run.id)}-OPEN`,
        type: 'WORKER_RUN_OPENED',
        payloadSchemaVersion: 1,
        missionId: track.missionId,
        occurredAt: input.occurredAt,
        payload: {
          writeTrackId: track.id,
          attemptId: attempt.id,
          workerRunId: run.id,
          contractHash: attempt.contractHash,
        },
      });
      return run;
    });
  }

  replaceWorkerRun(input: ReplaceWorkerRunInput): {
    readonly previousRun: WorkerRun;
    readonly currentRun: WorkerRun;
  } {
    const attempt = this.#store.execution.getAttempt(input.attemptId);
    const current = this.#store.execution.getWorkerRun(input.currentRunId);
    if (
      attempt === undefined
      || attempt.status !== 'OPEN'
      || current === undefined
      || current.attemptId !== attempt.id
      || current.contractHash !== attempt.contractHash
      || (current.status !== 'STARTING' && current.status !== 'RUNNING' && current.status !== 'IDLE')
    ) {
      throw new MnfsError('WORKER_RUN_CONFLICT', 'The current Worker Run lineage is invalid.');
    }
    if (
      (input.terminalStatus === 'EXITED' && !Number.isSafeInteger(input.exitCode))
      || (input.terminalStatus !== 'EXITED' && input.exitCode !== undefined)
    ) {
      throw new MnfsError('WORKER_RUN_CONFLICT', 'Worker Run terminal metadata is invalid.');
    }
    const track = this.#store.execution.getWriteTrack(attempt.writeTrackId);
    if (track === undefined) {
      throw new MnfsError('INTERNAL_ERROR', `Write Track ${attempt.writeTrackId} is missing.`);
    }
    if (track.status !== 'ACTIVE' || track.contractHash !== attempt.contractHash) {
      throw new MnfsError('WORKER_RUN_CONFLICT', `Write Track ${track.id} is not active for Run replacement.`);
    }
    this.#requireCurrentContract(track.missionId, track.contractHash);

    return this.#store.execution.runAtomic((session) => {
      const previousRun = session.setWorkerRunState({
        id: current.id,
        expectedVersion: input.expectedCurrentRunVersion,
        status: input.terminalStatus,
        ...(current.processIdentity === undefined
          ? {}
          : { processIdentity: current.processIdentity }),
        ...(current.processStartedAt === undefined
          ? {}
          : { processStartedAt: current.processStartedAt }),
        ...(input.exitCode === undefined ? {} : { exitCode: input.exitCode }),
        updatedAt: input.occurredAt,
      });
      session.appendEvent({
        eventId: `EVT-${eventIdentity(previousRun.id)}-STATE-V${previousRun.version}`,
        type: 'WORKER_RUN_STATE_CHANGED',
        payloadSchemaVersion: 1,
        missionId: track.missionId,
        occurredAt: input.occurredAt,
        payload: {
          writeTrackId: track.id,
          attemptId: attempt.id,
          workerRunId: previousRun.id,
          status: previousRun.status,
          version: previousRun.version,
        },
      });
      const currentRun = session.allocateWorkerRun({
        attemptId: attempt.id,
        contractHash: attempt.contractHash,
        occurredAt: input.occurredAt,
      });
      session.appendEvent({
        eventId: `EVT-${eventIdentity(currentRun.id)}-OPEN`,
        type: 'WORKER_RUN_OPENED',
        payloadSchemaVersion: 1,
        missionId: track.missionId,
        occurredAt: input.occurredAt,
        payload: {
          writeTrackId: track.id,
          attemptId: attempt.id,
          workerRunId: currentRun.id,
          replacesWorkerRunId: previousRun.id,
          contractHash: attempt.contractHash,
        },
      });
      return { previousRun, currentRun };
    });
  }

  supersedeAttempt(input: SupersedeAttemptInput): {
    readonly previousAttempt: Attempt;
    readonly currentAttempt: Attempt;
  } {
    requireSafeDisposition(input.observation, 'ATTEMPT_CONFLICT', 'Attempt supersession');
    const track = this.#store.execution.getWriteTrack(input.writeTrackId);
    const attempt = this.#store.execution.getAttempt(input.attemptId);
    const currentAttempt = this.#store.execution.getCurrentAttempt(input.writeTrackId);
    if (
      track === undefined
      || track.status !== 'ACTIVE'
      || attempt === undefined
      || attempt.writeTrackId !== track.id
      || attempt.contractHash !== track.contractHash
      || attempt.status !== 'OPEN'
      || currentAttempt?.id !== attempt.id
    ) {
      throw new MnfsError('ATTEMPT_CONFLICT', 'Attempt supersession lineage is invalid.');
    }
    this.#requireCurrentContract(track.missionId, track.contractHash);
    if (
      this.#store.execution.getCurrentWorkerRun(attempt.id) !== undefined
      || this.#store.execution.getCurrentLease(track.id) !== undefined
      || this.#store.execution.getCurrentClaim(attempt.id) !== undefined
    ) {
      throw new MnfsError('ATTEMPT_CONFLICT', 'Attempt supersession is blocked by a current resource.');
    }
    const commit = this.#git.requireCommit(input.baseCommitSha);
    if (commit.sha !== input.baseCommitSha || commit.objectFormat !== attempt.gitObjectFormat) {
      throw new MnfsError('GIT_OBJECT_INVALID', 'Replacement Attempt base is not a compatible commit.');
    }

    return this.#store.execution.runAtomic((session) => {
      const previousAttempt = session.setAttemptState({
        id: attempt.id,
        expectedVersion: input.expectedAttemptVersion,
        status: 'SUPERSEDED',
        sourceStatus: attempt.sourceStatus,
        ...(attempt.sourcePath === undefined ? {} : { sourcePath: attempt.sourcePath }),
        ...(attempt.sourceFingerprint === undefined
          ? {}
          : { sourceFingerprint: attempt.sourceFingerprint }),
        updatedAt: input.occurredAt,
      });
      session.appendEvent({
        eventId: `EVT-${eventIdentity(previousAttempt.id)}-SUPERSEDED-V${previousAttempt.version}`,
        type: 'ATTEMPT_SUPERSEDED',
        payloadSchemaVersion: 1,
        missionId: track.missionId,
        occurredAt: input.occurredAt,
        payload: {
          writeTrackId: track.id,
          attemptId: previousAttempt.id,
          version: previousAttempt.version,
        },
      });
      const nextAttempt = session.allocateAttempt({
        writeTrackId: track.id,
        contractHash: track.contractHash,
        gitObjectFormat: commit.objectFormat,
        baseCommitSha: commit.sha,
        occurredAt: input.occurredAt,
      });
      session.appendEvent({
        eventId: `EVT-${eventIdentity(nextAttempt.id)}-OPEN`,
        type: 'ATTEMPT_OPENED',
        payloadSchemaVersion: 1,
        missionId: track.missionId,
        occurredAt: input.occurredAt,
        payload: {
          writeTrackId: track.id,
          attemptId: nextAttempt.id,
          supersedesAttemptId: previousAttempt.id,
          baseCommitSha: commit.sha,
          gitObjectFormat: commit.objectFormat,
        },
      });
      return { previousAttempt, currentAttempt: nextAttempt };
    });
  }

  abandonWriteTrack(input: AbandonWriteTrackInput): WriteTrack {
    requireSafeDisposition(input.observation, 'WRITE_TRACK_NOT_ABANDONABLE', 'Write Track abandonment');
    const track = this.#store.execution.getWriteTrack(input.writeTrackId);
    if (track === undefined || track.status !== 'ACTIVE') {
      throw new MnfsError('WRITE_TRACK_NOT_ABANDONABLE', 'Write Track is not active.');
    }
    const attempt = this.#store.execution.getCurrentAttempt(track.id);
    if (
      (attempt !== undefined && this.#store.execution.getCurrentWorkerRun(attempt.id) !== undefined)
      || (attempt !== undefined && this.#store.execution.getCurrentClaim(attempt.id) !== undefined)
      || this.#store.execution.getCurrentLease(track.id) !== undefined
    ) {
      throw new MnfsError('WRITE_TRACK_NOT_ABANDONABLE', 'Write Track still owns a current resource.');
    }

    return this.#store.execution.runAtomic((session) => {
      const abandoned = session.setWriteTrackStatus({
        id: track.id,
        expectedVersion: input.expectedTrackVersion,
        status: 'ABANDONED',
        updatedAt: input.occurredAt,
      });
      session.appendEvent({
        eventId: `EVT-${track.id}-ABANDONED-V${abandoned.version}`,
        type: 'WRITE_TRACK_ABANDONED',
        payloadSchemaVersion: 1,
        missionId: track.missionId,
        occurredAt: input.occurredAt,
        payload: {
          writeTrackId: track.id,
          version: abandoned.version,
        },
      });
      return abandoned;
    });
  }
}
