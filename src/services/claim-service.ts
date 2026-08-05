import { createHash } from 'node:crypto';

import { MnfsError } from '../domain/errors.js';
import { canonicalJson, type FeaturePlanV2, type MissionPlanRevision } from '../domain/mission-plan.js';
import type {
  Attempt,
  Claim,
  GitObjectFormat,
  Lease,
  WorkerRun,
  WriteTrack,
} from '../execution/model.js';
import type { SqliteStore } from '../store/sqlite-store.js';

const M01_MISSION_ID = 'MIS-002';
const M01_MILESTONE_QUALIFIED_ID = 'MIS-002/M01';

export interface TreeObservation {
  readonly sha: string;
  readonly objectFormat: GitObjectFormat;
  readonly type: 'tree';
}

export interface ClaimGitAuthority {
  requireTree(input: Readonly<{
    sourcePath: string;
    sha: string;
    objectFormat: GitObjectFormat;
  }>): TreeObservation;
}

export interface OpenClaimInput {
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

interface ClaimLineage {
  readonly track: WriteTrack;
  readonly attempt: Attempt;
  readonly run: WorkerRun;
  readonly lease: Lease;
  readonly approved: MissionPlanRevision;
  readonly feature: FeaturePlanV2;
}

function hashCanonicalInput(value: Readonly<Record<string, unknown>>): string {
  return `sha256:${createHash('sha256').update(canonicalJson(value)).digest('hex')}`;
}

function eventIdentity(value: string): string {
  return value.replaceAll('/', '-');
}

function requirePositiveVersion(value: number, label: string): void {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new MnfsError('CONCURRENCY_CONFLICT', `${label} must be a positive expected version.`);
  }
}

function canonicalCriteria(values: readonly string[]): readonly string[] {
  const criteria = [...values];
  if (
    criteria.length === 0
    || criteria.some((criterion) => typeof criterion !== 'string' || criterion.length === 0)
    || new Set(criteria).size !== criteria.length
  ) {
    throw new MnfsError('CLAIM_CONFLICT', 'Claim criteria must be non-empty and unique.');
  }
  return criteria;
}

function sameCriteria(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function requireExpectedVersions(input: OpenClaimInput, lineage: Omit<ClaimLineage, 'approved' | 'feature'>): void {
  for (const [label, actual, expected] of [
    ['Write Track', lineage.track.version, input.expectedTrackVersion],
    ['Attempt', lineage.attempt.version, input.expectedAttemptVersion],
    ['Worker Run', lineage.run.version, input.expectedRunVersion],
    ['Lease', lineage.lease.version, input.expectedLeaseVersion],
  ] as const) {
    requirePositiveVersion(expected, label);
    if (actual !== expected) {
      throw new MnfsError('CONCURRENCY_CONFLICT', `Stale ${label} version.`);
    }
  }
}

export class ClaimService {
  readonly #store: SqliteStore;
  readonly #git: ClaimGitAuthority;

  constructor(input: Readonly<{ store: SqliteStore; git: ClaimGitAuthority }>) {
    this.#store = input.store;
    this.#git = input.git;
  }

  #requireApprovedFeature(track: WriteTrack): Readonly<{
    approved: MissionPlanRevision;
    feature: FeaturePlanV2;
  }> {
    const approved = this.#store.getLatestApprovedMissionPlan(track.missionId);
    if (approved === undefined || approved.contentHash !== track.contractHash) {
      throw new MnfsError(
        'EXECUTION_CONTRACT_CONFLICT',
        `Contract ${track.contractHash} is not the latest approved contract for ${track.missionId}.`,
      );
    }
    if (
      approved.content.schemaVersion !== 2
      || track.missionId !== M01_MISSION_ID
      || track.milestoneQualifiedId !== M01_MILESTONE_QUALIFIED_ID
    ) {
      throw new MnfsError('CLAIM_CONFLICT', 'Claim target is outside MIS-002/M01.');
    }
    const milestone = approved.content.milestones.find(
      (candidate) => candidate.qualifiedId === track.milestoneQualifiedId,
    );
    const feature = milestone?.features.find(
      (candidate) => candidate.qualifiedId === track.featureQualifiedId,
    );
    if (feature === undefined) {
      throw new MnfsError('CLAIM_CONFLICT', `Claim Feature ${track.featureQualifiedId} is not approved.`);
    }
    return { approved, feature };
  }

  #loadLineage(input: OpenClaimInput, criteria: readonly string[]): ClaimLineage {
    const track = this.#store.execution.getWriteTrack(input.writeTrackId);
    const attempt = this.#store.execution.getAttempt(input.attemptId);
    const run = this.#store.execution.getWorkerRun(input.workerRunId);
    const lease = this.#store.execution.getLease(input.leaseId);
    if (track === undefined || attempt === undefined || run === undefined || lease === undefined) {
      throw new MnfsError('CLAIM_CONFLICT', 'Claim lineage is incomplete.');
    }

    const { approved, feature } = this.#requireApprovedFeature(track);
    const allowedCriteria = new Set(feature.acceptanceCriteria.map((criterion) => criterion.qualifiedId));
    if (criteria.some((criterion) => !allowedCriteria.has(criterion))) {
      throw new MnfsError('CLAIM_CONFLICT', 'Claim criteria are not owned by the approved Feature.');
    }
    return { track, attempt, run, lease, approved, feature };
  }

  #requireLineage(input: OpenClaimInput, criteria: readonly string[]): ClaimLineage {
    const lineage = this.#loadLineage(input, criteria);
    const { track, attempt, run, lease } = lineage;
    requireExpectedVersions(input, { track, attempt, run, lease });

    const currentAttempt = this.#store.execution.getCurrentAttempt(track.id);
    const currentRun = this.#store.execution.getCurrentWorkerRun(attempt.id);
    const currentLease = this.#store.execution.getCurrentLease(track.id);
    if (
      track.status !== 'ACTIVE'
      || attempt.id !== input.attemptId
      || attempt.writeTrackId !== track.id
      || attempt.contractHash !== track.contractHash
      || attempt.status !== 'OPEN'
      || attempt.sourceStatus !== 'READY'
      || attempt.sourcePath === undefined
      || attempt.sourceFingerprint === undefined
      || attempt.baseCommitSha !== input.baseCommitSha
      || currentAttempt?.id !== attempt.id
      || run.attemptId !== attempt.id
      || run.contractHash !== track.contractHash
      || currentRun?.id !== run.id
      || lease.writeTrackId !== track.id
      || lease.attemptId !== attempt.id
      || lease.contractHash !== track.contractHash
      || lease.status !== 'ACTIVE'
      || lease.externalLeaseId === undefined
      || lease.worktreePath === undefined
      || lease.externalLeasedAt === undefined
      || currentLease?.id !== lease.id
    ) {
      throw new MnfsError('CLAIM_CONFLICT', 'Claim ancestry, source, Run or Lease binding is invalid.');
    }

    return lineage;
  }

  #inputHash(
    input: OpenClaimInput,
    criteria: readonly string[],
    lineage: ClaimLineage,
  ): string {
    return hashCanonicalInput({
      kind: 'CLAIM_OPEN',
      writeTrackId: lineage.track.id,
      attemptId: lineage.attempt.id,
      workerRunId: lineage.run.id,
      leaseId: lineage.lease.id,
      expectedTrackVersion: input.expectedTrackVersion,
      expectedAttemptVersion: input.expectedAttemptVersion,
      expectedRunVersion: input.expectedRunVersion,
      expectedLeaseVersion: input.expectedLeaseVersion,
      contractHash: lineage.track.contractHash,
      baseCommitSha: input.baseCommitSha,
      resultTreeSha: input.resultTreeSha,
      claimedCriterionIds: criteria,
      sourcePath: lineage.attempt.sourcePath,
      sourceFingerprint: lineage.attempt.sourceFingerprint,
      gitObjectFormat: lineage.attempt.gitObjectFormat,
      idempotencyKey: input.idempotencyKey,
    });
  }

  #replay(
    input: OpenClaimInput,
    criteria: readonly string[],
    inputHash: string,
    contractHash: string,
  ): Claim | undefined {
    const existing = this.#store.execution.getClaimByIdempotencyKey(input.idempotencyKey);
    if (existing === undefined) return undefined;
    if (
      existing.inputHash === inputHash
      && existing.writeTrackId === input.writeTrackId
      && existing.attemptId === input.attemptId
      && existing.workerRunId === input.workerRunId
      && existing.leaseId === input.leaseId
      && existing.contractHash === contractHash
      && existing.baseCommitSha === input.baseCommitSha
      && existing.resultTreeSha === input.resultTreeSha
      && sameCriteria(existing.claimedCriterionIds, criteria)
    ) {
      return existing;
    }
    throw new MnfsError(
      'CLAIM_IDEMPOTENCY_CONFLICT',
      `Claim idempotency key ${input.idempotencyKey} is bound to different input.`,
    );
  }

  openClaim(input: OpenClaimInput): Claim {
    if (input.idempotencyKey.length === 0) {
      throw new MnfsError('CLAIM_CONFLICT', 'Claim idempotency key must be non-empty.');
    }
    const criteria = canonicalCriteria(input.claimedCriterionIds);
    const loaded = this.#loadLineage(input, criteria);
    const inputHash = this.#inputHash(input, criteria, loaded);
    const replay = this.#replay(input, criteria, inputHash, loaded.track.contractHash);
    if (replay !== undefined) return replay;
    const initial = this.#requireLineage(input, criteria);
    if (this.#store.execution.getCurrentClaim(initial.attempt.id) !== undefined) {
      throw new MnfsError('CLAIM_CONFLICT', `Attempt ${initial.attempt.id} already has a current Claim.`);
    }

    const tree = this.#git.requireTree({
      sourcePath: initial.attempt.sourcePath as string,
      sha: input.resultTreeSha,
      objectFormat: initial.attempt.gitObjectFormat,
    });
    if (
      tree.type !== 'tree'
      || tree.sha !== input.resultTreeSha
      || tree.objectFormat !== initial.attempt.gitObjectFormat
    ) {
      throw new MnfsError('CLAIM_RESULT_TREE_INVALID', 'Git tree observation changed the Claim result identity.');
    }

    return this.#store.execution.runAtomic((session) => {
      const observed = this.#loadLineage(input, criteria);
      const currentInputHash = this.#inputHash(input, criteria, observed);
      if (currentInputHash !== inputHash) {
        throw new MnfsError('CONCURRENCY_CONFLICT', 'Claim input binding changed after Git observation.');
      }
      const concurrentReplay = this.#replay(
        input,
        criteria,
        inputHash,
        observed.track.contractHash,
      );
      if (concurrentReplay !== undefined) return concurrentReplay;
      const current = this.#requireLineage(input, criteria);
      if (this.#store.execution.getCurrentClaim(current.attempt.id) !== undefined) {
        throw new MnfsError('CLAIM_CONFLICT', `Attempt ${current.attempt.id} already has a current Claim.`);
      }

      const claim = session.allocateClaim({
        writeTrackId: current.track.id,
        attemptId: current.attempt.id,
        workerRunId: current.run.id,
        leaseId: current.lease.id,
        contractHash: current.track.contractHash,
        idempotencyKey: input.idempotencyKey,
        inputHash,
        baseCommitSha: input.baseCommitSha,
        resultTreeSha: tree.sha,
        claimedCriterionIds: criteria,
        occurredAt: input.occurredAt,
      });
      session.setWriteTrackStatus({
        id: current.track.id,
        expectedVersion: input.expectedTrackVersion,
        status: 'CLAIMED',
        updatedAt: input.occurredAt,
      });
      session.appendEvent({
        eventId: `EVT-${eventIdentity(claim.id)}-OPEN`,
        type: 'CLAIM_OPENED',
        payloadSchemaVersion: 1,
        missionId: current.track.missionId,
        occurredAt: input.occurredAt,
        payload: {
          claimId: claim.id,
          writeTrackId: claim.writeTrackId,
          attemptId: claim.attemptId,
          workerRunId: claim.workerRunId,
          leaseId: claim.leaseId,
          contractHash: claim.contractHash,
          baseCommitSha: claim.baseCommitSha,
          resultTreeSha: claim.resultTreeSha,
          claimedCriterionIds: claim.claimedCriterionIds,
          idempotencyKey: claim.idempotencyKey,
          inputHash: claim.inputHash,
        },
      });
      return claim;
    });
  }
}
