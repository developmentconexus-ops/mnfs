import type {
  AttemptId,
  ClaimId,
  LeaseId,
  WorkerRunId,
  WriteTrackId,
} from './ids.js';

export type WriteTrackStatus = 'ACTIVE' | 'CLAIMED' | 'ABANDONED';
export type AttemptStatus = 'OPEN' | 'SUPERSEDED' | 'CLOSED' | 'CANCELLED';
export type SourceStatus = 'REQUESTED' | 'READY' | 'DIVERGED';
export type WorkerRunStatus =
  | 'STARTING'
  | 'RUNNING'
  | 'IDLE'
  | 'EXITED'
  | 'LOST'
  | 'CANCELLED';
export type ClaimStatus = 'OPEN';
export type LeaseStatus =
  | 'REQUESTED'
  | 'ACTIVE'
  | 'RELEASE_PENDING'
  | 'RELEASED'
  | 'DIVERGED';
export type LeaseActionKind = 'GRANT' | 'RELEASE';
export type LeaseActionPhase = 'CLAIMED' | 'STARTED' | 'FINISHED';
export type GitObjectFormat = 'sha1' | 'sha256';

export interface ProcessIdentity {
  readonly bootId: string;
  readonly pid: number;
  readonly startTicks: string;
}

interface VersionedEntity {
  readonly version: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface WriteTrack extends VersionedEntity {
  readonly id: WriteTrackId;
  readonly missionId: string;
  readonly milestoneQualifiedId: string;
  readonly featureQualifiedId: string;
  readonly contractHash: string;
  readonly status: WriteTrackStatus;
}

export interface Attempt extends VersionedEntity {
  readonly id: AttemptId;
  readonly writeTrackId: WriteTrackId;
  readonly ordinal: number;
  readonly contractHash: string;
  readonly gitObjectFormat: GitObjectFormat;
  readonly baseCommitSha: string;
  readonly sourceStatus: SourceStatus;
  readonly sourcePath?: string;
  readonly sourceFingerprint?: string;
  readonly status: AttemptStatus;
}

export interface WorkerRun extends VersionedEntity {
  readonly id: WorkerRunId;
  readonly attemptId: AttemptId;
  readonly ordinal: number;
  readonly contractHash: string;
  readonly status: WorkerRunStatus;
  readonly processIdentity?: ProcessIdentity;
  readonly processStartedAt?: string;
  readonly exitCode?: number;
}

export interface Lease extends VersionedEntity {
  readonly id: LeaseId;
  readonly writeTrackId: WriteTrackId;
  readonly attemptId: AttemptId;
  readonly contractHash: string;
  readonly generation: number;
  readonly status: LeaseStatus;
  readonly grantIdempotencyKey: string;
  readonly grantInputHash: string;
  readonly releaseIdempotencyKey?: string;
  readonly releaseInputHash?: string;
  readonly holder: string;
  readonly externalLeaseId?: string;
  readonly worktreePath?: string;
  readonly externalLeasedAt?: string;
  readonly actionKind?: LeaseActionKind;
  readonly actionToken?: string;
  readonly actionPhase?: LeaseActionPhase;
  readonly actionOwner?: ProcessIdentity;
  readonly actionRunner?: ProcessIdentity;
  readonly actionStartedRef?: string;
  readonly actionResultRef?: string;
  readonly releaseRequestedAt?: string;
  readonly releaseObservedAt?: string;
  readonly lastObservedAt?: string;
  readonly lastErrorCode?: string;
  readonly lastErrorRef?: string;
}

export interface Claim extends VersionedEntity {
  readonly id: ClaimId;
  readonly writeTrackId: WriteTrackId;
  readonly attemptId: AttemptId;
  readonly workerRunId: WorkerRunId;
  readonly leaseId: LeaseId;
  readonly contractHash: string;
  readonly ordinal: number;
  readonly status: ClaimStatus;
  readonly idempotencyKey: string;
  readonly inputHash: string;
  readonly baseCommitSha: string;
  readonly resultTreeSha: string;
  readonly claimedCriterionIds: readonly string[];
}
