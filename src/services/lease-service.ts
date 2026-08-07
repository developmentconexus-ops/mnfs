import { createHash } from 'node:crypto';
import path from 'node:path';

import { MnfsError, type MnfsErrorCode } from '../domain/errors.js';
import { canonicalJson } from '../domain/mission-plan.js';
import type {
  Attempt,
  GitObjectFormat,
  Lease,
  LeaseActionKind,
  ProcessIdentity,
  WriteTrack,
} from '../execution/model.js';
import type {
  ExecutionAtomicSession,
  SetLeaseLifecycleInput,
  SqliteStore,
} from '../store/sqlite-store.js';

export interface TreehouseCandidateIdentity {
  readonly executableSha256: string;
  readonly semanticVersion: '2.1.1';
  readonly commandShapeSha256: string;
}

export interface PhysicalSourceObservation {
  readonly status: 'READY' | 'CHANGED' | 'UNKNOWN';
  readonly path: string;
  readonly fingerprint: string;
  readonly baseCommitSha: string;
  readonly baseTreeSha: string;
  readonly objectFormat: GitObjectFormat;
}

export interface PhysicalLeaseCandidate {
  readonly path: string;
  readonly managed: boolean;
  readonly sourcePath: string;
  readonly status: 'available' | 'leased' | 'missing';
  readonly gitStatus: 'CLEAN' | 'DIRTY' | 'UNKNOWN';
  readonly leaseId?: string;
  readonly holder?: string;
  readonly leasedAt?: string;
}

export interface LeasePhysicalObservation {
  readonly source: PhysicalSourceObservation;
  readonly candidates: readonly PhysicalLeaseCandidate[];
}

export interface LeasePhysicalAuthority {
  observe(input: Readonly<{
    writeTrack: WriteTrack;
    attempt: Attempt;
    lease?: Lease;
    kind: 'GRANT' | 'RELEASE';
  }>): Promise<LeasePhysicalObservation>;
}

export interface LeaseActionObservation {
  readonly state: 'ABSENT' | 'STARTED' | 'FINISHED' | 'CONFLICT';
  readonly runner?: ProcessIdentity;
  readonly startedRef?: string;
  readonly resultRef?: string;
}

export interface LeaseActionLaunchInput {
  readonly kind: 'GRANT' | 'RELEASE';
  readonly leaseId: string;
  readonly actionToken: string;
  readonly holder: string;
  readonly sourcePath: string;
  readonly externalLeaseId?: string;
  readonly worktreePath?: string;
}

export interface LeaseActionAuthority {
  observe(actionToken: string): Promise<LeaseActionObservation>;
  launch(input: LeaseActionLaunchInput): Promise<void>;
}

export interface ProcessAuthority {
  isAlive(identity: ProcessIdentity): Promise<boolean>;
}

export interface LeaseGrantInput {
  readonly writeTrackId: string;
  readonly idempotencyKey: string;
  readonly occurredAt: string;
}

export interface LeaseReleaseInput {
  readonly leaseId: string;
  readonly expectedLeaseVersion: number;
  readonly idempotencyKey: string;
  readonly occurredAt: string;
}

export interface LeaseServiceInput {
  readonly store: SqliteStore;
  readonly repositoryId: string;
  readonly actionRoot: string;
  readonly candidate: TreehouseCandidateIdentity;
  readonly ownerIdentity: ProcessIdentity;
  readonly physical: LeasePhysicalAuthority;
  readonly actions: LeaseActionAuthority;
  readonly processes: ProcessAuthority;
  readonly now: () => string;
}

interface LeaseLineage {
  readonly track: WriteTrack;
  readonly attempt: Attempt;
}

interface GrantBinding {
  readonly holder: string;
  readonly inputHash: string;
}

interface ActionAssessment {
  readonly lease: Lease;
  readonly observation: LeaseActionObservation;
  readonly ownerAlive: boolean;
  readonly runnerAlive: boolean;
}

interface ActionClaim {
  readonly lease: Lease;
  readonly claimed: boolean;
}

type LeaseLifecyclePatch = Partial<Omit<
  SetLeaseLifecycleInput,
  'id' | 'expectedVersion' | 'updatedAt'
>>;

type ReleasePhysicalState =
  | Readonly<{ readonly kind: 'EXACT'; readonly candidate: PhysicalLeaseCandidate }>
  | Readonly<{ readonly kind: 'AVAILABLE'; readonly candidate: PhysicalLeaseCandidate }>
  | Readonly<{ readonly kind: 'DIVERGED'; readonly reason: string }>
  | Readonly<{ readonly kind: 'FENCE'; readonly reason: string }>
  | Readonly<{ readonly kind: 'DIRTY' }>
  | Readonly<{ readonly kind: 'UNKNOWN' }>;

function hashCanonicalInput(value: Readonly<Record<string, unknown>>): string {
  return `sha256:${createHash('sha256').update(canonicalJson(value)).digest('hex')}`;
}

function identityEquals(left: ProcessIdentity, right: ProcessIdentity): boolean {
  return left.bootId === right.bootId
    && left.pid === right.pid
    && left.startTicks === right.startTicks;
}

function safeRepositoryPart(repositoryId: string): string {
  if (repositoryId.length === 0) {
    throw new MnfsError('INVALID_ARGUMENTS', 'Repository identity cannot form a Lease holder.');
  }
  return createHash('sha256').update(repositoryId, 'utf8').digest('hex').slice(0, 16);
}

function leaseHolder(repositoryId: string, leaseId: string, generation: number): string {
  return `mnfs-${safeRepositoryPart(repositoryId)}-${leaseId.toLowerCase().replaceAll('-', '')}-g${generation}`;
}

function eventId(leaseId: string, suffix: string): string {
  return `EVT-${leaseId}-${suffix}`;
}

function actionToken(
  lease: Lease,
  kind: LeaseActionKind,
  semanticInputHash: string,
  owner: ProcessIdentity,
): string {
  const digest = hashCanonicalInput({
    leaseId: lease.id,
    leaseVersion: lease.version,
    kind,
    semanticInputHash,
    owner,
  }).slice('sha256:'.length, 'sha256:'.length + 48);
  return `lease-${digest}`;
}

function selected<T>(patchValue: T | null | undefined, currentValue: T | undefined): T | null {
  return patchValue === undefined ? currentValue ?? null : patchValue;
}

function setLease(
  session: ExecutionAtomicSession,
  lease: Lease,
  updatedAt: string,
  patch: LeaseLifecyclePatch,
): Lease {
  return session.setLeaseLifecycle({
    id: lease.id,
    expectedVersion: lease.version,
    status: patch.status ?? lease.status,
    releaseIdempotencyKey: selected(patch.releaseIdempotencyKey, lease.releaseIdempotencyKey),
    releaseInputHash: selected(patch.releaseInputHash, lease.releaseInputHash),
    externalLeaseId: selected(patch.externalLeaseId, lease.externalLeaseId),
    worktreePath: selected(patch.worktreePath, lease.worktreePath),
    externalLeasedAt: selected(patch.externalLeasedAt, lease.externalLeasedAt),
    actionKind: selected(patch.actionKind, lease.actionKind),
    actionToken: selected(patch.actionToken, lease.actionToken),
    actionPhase: selected(patch.actionPhase, lease.actionPhase),
    actionOwner: selected(patch.actionOwner, lease.actionOwner),
    actionRunner: selected(patch.actionRunner, lease.actionRunner),
    actionStartedRef: selected(patch.actionStartedRef, lease.actionStartedRef),
    actionResultRef: selected(patch.actionResultRef, lease.actionResultRef),
    releaseRequestedAt: selected(patch.releaseRequestedAt, lease.releaseRequestedAt),
    releaseObservedAt: selected(patch.releaseObservedAt, lease.releaseObservedAt),
    lastObservedAt: selected(patch.lastObservedAt, lease.lastObservedAt),
    lastErrorCode: selected(patch.lastErrorCode, lease.lastErrorCode),
    lastErrorRef: selected(patch.lastErrorRef, lease.lastErrorRef),
    updatedAt,
  });
}

function requireSource(
  attempt: Attempt,
  source: PhysicalSourceObservation,
  code: Extract<MnfsErrorCode, 'EXECUTION_SOURCE_CHANGED' | 'LEASE_FENCE_CONFLICT'>,
): void {
  if (
    attempt.status !== 'OPEN'
    || attempt.sourceStatus !== 'READY'
    || attempt.sourcePath === undefined
    || attempt.sourceFingerprint === undefined
    || source.status !== 'READY'
    || source.path !== attempt.sourcePath
    || source.fingerprint !== attempt.sourceFingerprint
    || source.baseCommitSha !== attempt.baseCommitSha
    || source.objectFormat !== attempt.gitObjectFormat
  ) {
    throw new MnfsError(code, `Attempt ${attempt.id} source no longer matches its READY identity.`);
  }
}

function requireActiveLineage(track: WriteTrack | undefined, attempt: Attempt | undefined): LeaseLineage {
  if (
    track === undefined
    || attempt === undefined
    || track.status !== 'ACTIVE'
    || attempt.status !== 'OPEN'
    || attempt.writeTrackId !== track.id
    || attempt.contractHash !== track.contractHash
  ) {
    throw new MnfsError('LEASE_CONFLICT', 'Lease lineage is not current and active.');
  }
  return { track, attempt };
}

function requireLeaseLineage(
  track: WriteTrack | undefined,
  attempt: Attempt | undefined,
  lease: Lease,
): LeaseLineage {
  if (
    track === undefined
    || attempt === undefined
    || lease.writeTrackId !== track.id
    || lease.attemptId !== attempt.id
    || attempt.writeTrackId !== track.id
    || lease.contractHash !== track.contractHash
    || attempt.contractHash !== track.contractHash
  ) {
    throw new MnfsError('LEASE_CONFLICT', `Lease ${lease.id} ancestry is invalid.`);
  }
  return { track, attempt };
}

function requireActiveLeaseLineage(
  track: WriteTrack | undefined,
  attempt: Attempt | undefined,
  lease: Lease,
): LeaseLineage {
  const lineage = requireActiveLineage(track, attempt);
  requireLeaseLineage(lineage.track, lineage.attempt, lease);
  return lineage;
}

function requireReleasableLeaseLineage(
  track: WriteTrack | undefined,
  attempt: Attempt | undefined,
  lease: Lease,
): LeaseLineage {
  const lineage = requireLeaseLineage(track, attempt, lease);
  if (
    (lineage.track.status !== 'ACTIVE' && lineage.track.status !== 'CLAIMED')
    || lineage.attempt.status !== 'OPEN'
  ) {
    throw new MnfsError('LEASE_CONFLICT', `Lease ${lease.id} lineage is not releasable.`);
  }
  return lineage;
}

type GrantPhysicalState =
  | Readonly<{ readonly kind: 'NONE' }>
  | Readonly<{ readonly kind: 'EXACT'; readonly candidate: PhysicalLeaseCandidate }>
  | Readonly<{ readonly kind: 'DIVERGED'; readonly reason: string }>;

function classifyGrant(
  observation: LeasePhysicalObservation,
  lease: Lease,
  attempt: Attempt,
): GrantPhysicalState {
  const related = observation.candidates.filter((candidate) => (
    candidate.holder === lease.holder
    || (lease.externalLeaseId !== undefined && candidate.leaseId === lease.externalLeaseId)
    || (lease.worktreePath !== undefined && candidate.path === lease.worktreePath)
    || (candidate.status === 'leased' && candidate.sourcePath === attempt.sourcePath)
  ));
  if (related.length === 0) {
    return lease.status === 'ACTIVE'
      ? { kind: 'DIVERGED', reason: 'The committed external Lease is absent.' }
      : { kind: 'NONE' };
  }
  if (related.length !== 1) {
    return { kind: 'DIVERGED', reason: 'External Lease observation is non-bijective.' };
  }
  const candidate = related[0] as PhysicalLeaseCandidate;
  const exact = candidate.managed
    && candidate.sourcePath === attempt.sourcePath
    && candidate.status === 'leased'
    && candidate.gitStatus === 'CLEAN'
    && candidate.holder === lease.holder
    && typeof candidate.leaseId === 'string'
    && candidate.leaseId.length > 0
    && typeof candidate.leasedAt === 'string'
    && candidate.leasedAt.length > 0
    && (lease.externalLeaseId === undefined || candidate.leaseId === lease.externalLeaseId)
    && (lease.worktreePath === undefined || candidate.path === lease.worktreePath);
  return exact
    ? { kind: 'EXACT', candidate }
    : { kind: 'DIVERGED', reason: 'Related external Lease evidence conflicts with the semantic fence.' };
}

function classifyRelease(
  observation: LeasePhysicalObservation,
  lease: Lease,
  attempt: Attempt,
): ReleasePhysicalState {
  if (
    lease.externalLeaseId === undefined
    || lease.worktreePath === undefined
    || lease.externalLeasedAt === undefined
    || attempt.sourcePath === undefined
  ) {
    return { kind: 'FENCE', reason: 'Semantic Lease lacks a complete external identity.' };
  }

  const related = observation.candidates.filter((candidate) => (
    candidate.leaseId === lease.externalLeaseId
    || candidate.path === lease.worktreePath
    || candidate.holder === lease.holder
  ));
  if (related.length > 1) {
    return { kind: 'DIVERGED', reason: 'Physical Lease identity is non-bijective.' };
  }

  const candidate = related[0];
  if (candidate === undefined) {
    return { kind: 'DIVERGED', reason: 'The former worktree is absent from physical observation.' };
  }
  if (!candidate.managed || candidate.status === 'missing') {
    return { kind: 'DIVERGED', reason: 'The former worktree is missing or unmanaged.' };
  }
  if (candidate.path !== lease.worktreePath) {
    return { kind: 'FENCE', reason: 'Physical worktree path differs from the semantic fence.' };
  }
  if (candidate.sourcePath !== attempt.sourcePath) {
    return { kind: 'FENCE', reason: 'Physical source path differs from the semantic fence.' };
  }
  if (candidate.gitStatus === 'DIRTY') return { kind: 'DIRTY' };
  if (candidate.gitStatus === 'UNKNOWN') return { kind: 'UNKNOWN' };

  if (candidate.status === 'available') {
    if (candidate.leaseId !== undefined || candidate.holder !== undefined) {
      return { kind: 'DIVERGED', reason: 'Available worktree retains conflicting Lease identity.' };
    }
    return { kind: 'AVAILABLE', candidate };
  }

  if (
    candidate.status !== 'leased'
    || candidate.leaseId !== lease.externalLeaseId
    || candidate.holder !== lease.holder
  ) {
    return { kind: 'FENCE', reason: 'Physical Lease ID or holder differs from the semantic fence.' };
  }
  return { kind: 'EXACT', candidate };
}

function requireActionObservation(observation: LeaseActionObservation): void {
  if (observation.state === 'CONFLICT') {
    throw new MnfsError('LEASE_ACTION_INCONCLUSIVE', 'Lease action evidence is conflicting.');
  }
  if (
    (observation.state === 'STARTED' || observation.state === 'FINISHED')
    && (observation.runner === undefined || observation.startedRef === undefined)
  ) {
    throw new MnfsError('LEASE_OPERATION_OWNER_UNKNOWN', 'Lease action evidence lacks runner identity.');
  }
  if (observation.state === 'FINISHED' && observation.resultRef === undefined) {
    throw new MnfsError('LEASE_ACTION_INCONCLUSIVE', 'Finished Lease action lacks its result reference.');
  }
}

function requireCompatibleActionObservation(
  lease: Lease,
  observation: LeaseActionObservation,
): void {
  if (observation.state !== 'STARTED' && observation.state !== 'FINISHED') return;
  if (lease.actionPhase === 'CLAIMED') return;
  if (lease.actionPhase === 'FINISHED' && observation.state !== 'FINISHED') {
    throw new MnfsError('LEASE_ACTION_INCONCLUSIVE', 'Lease action evidence regressed after FINISHED.');
  }
  if (
    lease.actionRunner !== undefined
    && observation.runner !== undefined
    && !identityEquals(lease.actionRunner, observation.runner)
  ) {
    throw new MnfsError('LEASE_ACTION_INCONCLUSIVE', 'Lease action runner identity conflicts with durable evidence.');
  }
  if (
    lease.actionStartedRef !== undefined
    && observation.startedRef !== undefined
    && lease.actionStartedRef !== observation.startedRef
  ) {
    throw new MnfsError('LEASE_ACTION_INCONCLUSIVE', 'Lease action STARTED reference conflicts with durable evidence.');
  }
  if (
    lease.actionResultRef !== undefined
    && observation.resultRef !== undefined
    && lease.actionResultRef !== observation.resultRef
  ) {
    throw new MnfsError('LEASE_ACTION_INCONCLUSIVE', 'Lease action result reference conflicts with durable evidence.');
  }
}

export class LeaseService {
  readonly #store: SqliteStore;
  readonly #repositoryId: string;
  readonly #actionRoot: string;
  readonly #candidate: TreehouseCandidateIdentity;
  readonly #ownerIdentity: ProcessIdentity;
  readonly #physical: LeasePhysicalAuthority;
  readonly #actions: LeaseActionAuthority;
  readonly #processes: ProcessAuthority;
  readonly #now: () => string;

  constructor(input: LeaseServiceInput) {
    this.#store = input.store;
    this.#repositoryId = input.repositoryId;
    this.#actionRoot = input.actionRoot;
    this.#candidate = Object.freeze({ ...input.candidate });
    this.#ownerIdentity = Object.freeze({ ...input.ownerIdentity });
    this.#physical = input.physical;
    this.#actions = input.actions;
    this.#processes = input.processes;
    this.#now = input.now;
  }

  #loadTrackAttempt(writeTrackId: string): LeaseLineage {
    const track = this.#store.execution.getWriteTrack(writeTrackId);
    const attempt = this.#store.execution.getCurrentAttempt(writeTrackId);
    return requireActiveLineage(track, attempt);
  }

  #loadLeaseLineage(lease: Lease): LeaseLineage {
    return requireLeaseLineage(
      this.#store.execution.getWriteTrack(lease.writeTrackId),
      this.#store.execution.getAttempt(lease.attemptId),
      lease,
    );
  }

  #loadActiveLeaseLineage(lease: Lease): LeaseLineage {
    return requireActiveLeaseLineage(
      this.#store.execution.getWriteTrack(lease.writeTrackId),
      this.#store.execution.getAttempt(lease.attemptId),
      lease,
    );
  }

  #loadReleasableLeaseLineage(lease: Lease): LeaseLineage {
    return requireReleasableLeaseLineage(
      this.#store.execution.getWriteTrack(lease.writeTrackId),
      this.#store.execution.getAttempt(lease.attemptId),
      lease,
    );
  }

  async #observe(
    lineage: LeaseLineage,
    kind: 'GRANT' | 'RELEASE',
    lease?: Lease,
  ): Promise<LeasePhysicalObservation> {
    return await this.#physical.observe({
      writeTrack: lineage.track,
      attempt: lineage.attempt,
      ...(lease === undefined ? {} : { lease }),
      kind,
    });
  }

  #grantBinding(
    input: LeaseGrantInput,
    lineage: LeaseLineage,
    source: PhysicalSourceObservation,
    leaseId: string,
    generation: number,
    holder = leaseHolder(this.#repositoryId, leaseId, generation),
  ): GrantBinding {
    return {
      holder,
      inputHash: hashCanonicalInput({
        kind: 'GRANT',
        repositoryId: this.#repositoryId,
        writeTrackId: lineage.track.id,
        attemptId: lineage.attempt.id,
        leaseId,
        generation,
        contractHash: lineage.track.contractHash,
        baseCommitSha: lineage.attempt.baseCommitSha,
        gitObjectFormat: lineage.attempt.gitObjectFormat,
        sourcePath: lineage.attempt.sourcePath,
        sourceFingerprint: lineage.attempt.sourceFingerprint,
        sourceBaseTreeSha: source.baseTreeSha,
        holder,
        candidate: this.#candidate,
        idempotencyKey: input.idempotencyKey,
      }),
    };
  }

  #releaseInputHash(input: LeaseReleaseInput, lease: Lease, lineage: LeaseLineage): string {
    return hashCanonicalInput({
      kind: 'RELEASE',
      repositoryId: this.#repositoryId,
      leaseId: lease.id,
      writeTrackId: lease.writeTrackId,
      attemptId: lease.attemptId,
      generation: lease.generation,
      expectedLeaseVersion: input.expectedLeaseVersion,
      contractHash: lease.contractHash,
      baseCommitSha: lineage.attempt.baseCommitSha,
      gitObjectFormat: lineage.attempt.gitObjectFormat,
      sourcePath: lineage.attempt.sourcePath,
      sourceFingerprint: lineage.attempt.sourceFingerprint,
      externalLeaseId: lease.externalLeaseId,
      holder: lease.holder,
      worktreePath: lease.worktreePath,
      candidate: this.#candidate,
      idempotencyKey: input.idempotencyKey,
    });
  }

  #ensureGrantIntent(
    input: LeaseGrantInput,
    observedSource: PhysicalSourceObservation,
  ): Lease {
    return this.#store.execution.runAtomic((session) => {
      const lineage = requireActiveLineage(
        this.#store.execution.getWriteTrack(input.writeTrackId),
        this.#store.execution.getCurrentAttempt(input.writeTrackId),
      );
      requireSource(lineage.attempt, observedSource, 'EXECUTION_SOURCE_CHANGED');

      const replay = this.#store.execution.getLeaseByGrantIdempotencyKey(input.idempotencyKey);
      if (replay !== undefined) {
        const binding = this.#grantBinding(
          input,
          lineage,
          observedSource,
          replay.id,
          replay.generation,
          replay.holder,
        );
        if (
          replay.writeTrackId !== lineage.track.id
          || replay.attemptId !== lineage.attempt.id
          || replay.contractHash !== lineage.track.contractHash
          || replay.grantInputHash !== binding.inputHash
          || replay.holder !== binding.holder
        ) {
          throw new MnfsError(
            'LEASE_IDEMPOTENCY_CONFLICT',
            `Lease grant key ${input.idempotencyKey} is bound to different input.`,
          );
        }
        return replay;
      }

      const current = this.#store.execution.getCurrentLease(lineage.track.id);
      if (current !== undefined) {
        throw new MnfsError('LEASE_CONFLICT', `Write Track ${lineage.track.id} already has a current Lease.`);
      }

      const preview = session.previewLeaseAllocation(lineage.track.id);
      const binding = this.#grantBinding(
        input,
        lineage,
        observedSource,
        preview.id,
        preview.generation,
      );
      const lease = session.allocateLease({
        writeTrackId: lineage.track.id,
        attemptId: lineage.attempt.id,
        contractHash: lineage.track.contractHash,
        grantIdempotencyKey: input.idempotencyKey,
        grantInputHash: binding.inputHash,
        holder: binding.holder,
        occurredAt: input.occurredAt,
      });
      if (lease.id !== preview.id || lease.generation !== preview.generation) {
        throw new MnfsError('CONCURRENCY_CONFLICT', 'Lease allocation identity changed inside its transaction.');
      }
      session.appendEvent({
        eventId: eventId(lease.id, 'REQUESTED'),
        type: 'LEASE_REQUESTED',
        payloadSchemaVersion: 1,
        missionId: lineage.track.missionId,
        occurredAt: input.occurredAt,
        payload: {
          leaseId: lease.id,
          writeTrackId: lineage.track.id,
          attemptId: lineage.attempt.id,
          generation: lease.generation,
          holder: lease.holder,
          idempotencyKey: input.idempotencyKey,
          inputHash: binding.inputHash,
          contractHash: lease.contractHash,
        },
      });
      return lease;
    });
  }

  #claimAction(
    leaseId: string,
    kind: LeaseActionKind,
    semanticInputHash: string,
    occurredAt: string,
    replaceToken?: string,
  ): ActionClaim {
    return this.#store.execution.runAtomic((session) => {
      const current = this.#store.execution.getLease(leaseId);
      if (current === undefined) {
        throw new MnfsError('LEASE_CONFLICT', `Lease ${leaseId} no longer exists.`);
      }
      if (current.actionToken !== undefined && current.actionToken !== replaceToken) {
        return { lease: current, claimed: false };
      }
      if (replaceToken !== undefined && current.actionToken !== replaceToken) {
        return { lease: current, claimed: false };
      }
      const track = this.#store.execution.getWriteTrack(current.writeTrackId);
      const attempt = this.#store.execution.getAttempt(current.attemptId);
      const lineage = kind === 'GRANT'
        ? requireActiveLeaseLineage(track, attempt, current)
        : requireReleasableLeaseLineage(track, attempt, current);
      if (kind === 'GRANT' && current.status !== 'REQUESTED') {
        throw new MnfsError('LEASE_CONFLICT', `Lease ${current.id} is not awaiting grant.`);
      }
      if (kind === 'RELEASE') {
        if (current.status !== 'RELEASE_PENDING') {
          throw new MnfsError('LEASE_CONFLICT', `Lease ${current.id} is not awaiting release.`);
        }
        if (
          this.#store.execution.getCurrentWorkerRun(current.attemptId) !== undefined
          || this.#store.execution.getCurrentClaim(current.attemptId) !== undefined
        ) {
          throw new MnfsError(
            'LEASE_RELEASE_BLOCKED_UNKNOWN',
            'A current Worker Run or Claim appeared before the release action claim.',
          );
        }
      }

      const token = actionToken(current, kind, semanticInputHash, this.#ownerIdentity);
      const tokenRoot = path.join(this.#actionRoot, token);
      const claimed = setLease(session, current, occurredAt, {
        actionKind: kind,
        actionToken: token,
        actionPhase: 'CLAIMED',
        actionOwner: this.#ownerIdentity,
        actionRunner: null,
        actionStartedRef: path.join(tokenRoot, 'started.json'),
        actionResultRef: path.join(tokenRoot, 'finished.json'),
        lastObservedAt: this.#now(),
        lastErrorCode: null,
        lastErrorRef: null,
      });
      session.appendEvent({
        eventId: eventId(claimed.id, `ACTION-${token}`),
        type: 'LEASE_ACTION_CLAIMED',
        payloadSchemaVersion: 1,
        missionId: lineage.track.missionId,
        occurredAt,
        payload: {
          leaseId: claimed.id,
          kind,
          actionToken: token,
          owner: this.#ownerIdentity,
          semanticInputHash,
        },
      });
      return { lease: claimed, claimed: true };
    });
  }

  async #assessAction(lease: Lease): Promise<ActionAssessment> {
    if (
      lease.actionToken === undefined
      || lease.actionKind === undefined
      || lease.actionPhase === undefined
      || lease.actionOwner === undefined
    ) {
      throw new MnfsError('LEASE_OPERATION_OWNER_UNKNOWN', 'Lease action ownership is incomplete.');
    }
    const observation = await this.#actions.observe(lease.actionToken);
    requireActionObservation(observation);
    requireCompatibleActionObservation(lease, observation);
    const ownerAlive = await this.#processes.isAlive(lease.actionOwner);
    const runnerAlive = observation.runner === undefined
      ? false
      : await this.#processes.isAlive(observation.runner);

    let current = lease;
    if (observation.state === 'STARTED' || observation.state === 'FINISHED') {
      const observedPhase = observation.state;
      current = this.#store.execution.runAtomic((session) => {
        const latest = this.#store.execution.getLease(lease.id);
        if (latest === undefined || latest.actionToken !== lease.actionToken) {
          throw new MnfsError('LEASE_OPERATION_IN_PROGRESS', 'Lease action ownership changed concurrently.');
        }
        return setLease(session, latest, this.#now(), {
          actionPhase: observedPhase,
          actionRunner: observation.runner ?? null,
          actionStartedRef: observation.startedRef ?? null,
          actionResultRef: observation.resultRef ?? null,
          lastObservedAt: this.#now(),
        });
      });
    } else if (lease.actionPhase !== 'CLAIMED') {
      throw new MnfsError(
        'LEASE_ACTION_INCONCLUSIVE',
        'Persisted Lease action state is not supported by current helper evidence.',
      );
    }
    return { lease: current, observation, ownerAlive, runnerAlive };
  }

  #commitGranted(
    leaseId: string,
    candidate: PhysicalLeaseCandidate,
    occurredAt: string,
  ): Lease {
    if (
      candidate.leaseId === undefined
      || candidate.leasedAt === undefined
      || candidate.holder === undefined
    ) {
      throw new MnfsError('TREEHOUSE_OBSERVATION_CONFLICT', 'Grant observation is incomplete.');
    }
    const externalLeaseId = candidate.leaseId;
    const externalLeasedAt = candidate.leasedAt;
    return this.#store.execution.runAtomic((session) => {
      const current = this.#store.execution.getLease(leaseId);
      if (current === undefined) throw new MnfsError('LEASE_CONFLICT', `Lease ${leaseId} is missing.`);
      if (current.status === 'ACTIVE') return current;
      if (current.status !== 'REQUESTED') {
        throw new MnfsError('LEASE_CONFLICT', `Lease ${leaseId} cannot become ACTIVE from ${current.status}.`);
      }
      const lineage = requireActiveLeaseLineage(
        this.#store.execution.getWriteTrack(current.writeTrackId),
        this.#store.execution.getAttempt(current.attemptId),
        current,
      );
      if (candidate.holder !== current.holder || candidate.sourcePath !== lineage.attempt.sourcePath) {
        throw new MnfsError('TREEHOUSE_OBSERVATION_CONFLICT', 'Grant observation changed before commit.');
      }
      const granted = setLease(session, current, occurredAt, {
        status: 'ACTIVE',
        externalLeaseId,
        worktreePath: candidate.path,
        externalLeasedAt,
        actionKind: null,
        actionToken: null,
        actionPhase: null,
        actionOwner: null,
        actionRunner: null,
        lastObservedAt: this.#now(),
        lastErrorCode: null,
        lastErrorRef: null,
      });
      session.appendEvent({
        eventId: eventId(granted.id, 'GRANTED'),
        type: 'LEASE_GRANTED',
        payloadSchemaVersion: 1,
        missionId: lineage.track.missionId,
        occurredAt,
        payload: {
          leaseId: granted.id,
          writeTrackId: granted.writeTrackId,
          attemptId: granted.attemptId,
          externalLeaseId,
          holder: candidate.holder,
          worktreePath: candidate.path,
          leasedAt: externalLeasedAt,
        },
      });
      return granted;
    });
  }

  #markDiverged(leaseId: string, reason: string, occurredAt: string): Lease {
    return this.#store.execution.runAtomic((session) => {
      const current = this.#store.execution.getLease(leaseId);
      if (current === undefined) throw new MnfsError('LEASE_CONFLICT', `Lease ${leaseId} is missing.`);
      if (current.status === 'DIVERGED') return current;
      const lineage = requireLeaseLineage(
        this.#store.execution.getWriteTrack(current.writeTrackId),
        this.#store.execution.getAttempt(current.attemptId),
        current,
      );
      const diverged = setLease(session, current, occurredAt, {
        status: 'DIVERGED',
        lastObservedAt: this.#now(),
        lastErrorCode: 'RECOVERY_DIVERGENCE',
        lastErrorRef: null,
      });
      session.appendEvent({
        eventId: eventId(diverged.id, `DIVERGED-V${diverged.version}`),
        type: 'LEASE_DIVERGED',
        payloadSchemaVersion: 1,
        missionId: lineage.track.missionId,
        occurredAt,
        payload: { leaseId: diverged.id, reason, version: diverged.version },
      });
      return diverged;
    });
  }

  async #resolveGrantPhysical(
    lease: Lease,
    lineage: LeaseLineage,
    occurredAt: string,
  ): Promise<Lease | undefined> {
    const physical = await this.#observe(lineage, 'GRANT', lease);
    requireSource(lineage.attempt, physical.source, 'EXECUTION_SOURCE_CHANGED');
    const state = classifyGrant(physical, lease, lineage.attempt);
    if (state.kind === 'DIVERGED') {
      this.#markDiverged(lease.id, state.reason, occurredAt);
      throw new MnfsError('RECOVERY_DIVERGENCE', state.reason);
    }
    return state.kind === 'NONE'
      ? undefined
      : this.#commitGranted(lease.id, state.candidate, occurredAt);
  }

  async grant(input: LeaseGrantInput): Promise<Lease> {
    const initialLineage = this.#loadTrackAttempt(input.writeTrackId);
    const initialPhysical = await this.#observe(initialLineage, 'GRANT');
    requireSource(initialLineage.attempt, initialPhysical.source, 'EXECUTION_SOURCE_CHANGED');
    let lease = this.#ensureGrantIntent(input, initialPhysical.source);
    if (lease.status === 'ACTIVE') {
      const lineage = this.#loadActiveLeaseLineage(lease);
      const reconciled = await this.#resolveGrantPhysical(lease, lineage, input.occurredAt);
      if (reconciled !== undefined) return reconciled;
      throw new MnfsError('RECOVERY_DIVERGENCE', 'Committed Lease lacks decisive physical state.');
    }
    if (lease.status === 'RELEASED') return lease;
    if (lease.status === 'DIVERGED') {
      throw new MnfsError('RECOVERY_DIVERGENCE', `Lease ${lease.id} is already DIVERGED.`);
    }

    let lineage = this.#loadActiveLeaseLineage(lease);
    const adopted = await this.#resolveGrantPhysical(lease, lineage, input.occurredAt);
    if (adopted !== undefined) return adopted;

    let replaceToken: string | undefined;
    if (lease.actionToken !== undefined) {
      if (lease.actionKind !== 'GRANT') {
        throw new MnfsError('LEASE_ACTION_INCONCLUSIVE', 'Lease action kind conflicts with grant.');
      }
      const assessment = await this.#assessAction(lease);
      lease = assessment.lease;
      lineage = this.#loadActiveLeaseLineage(lease);
      const resolved = await this.#resolveGrantPhysical(lease, lineage, input.occurredAt);
      if (resolved !== undefined) return resolved;
      if (assessment.observation.state === 'STARTED' || assessment.observation.state === 'FINISHED') {
        throw new MnfsError(
          'LEASE_ACTION_INCONCLUSIVE',
          'Grant helper may have acted, but no decisive exact Lease exists.',
        );
      }
      if (assessment.ownerAlive) {
        throw new MnfsError('LEASE_OPERATION_IN_PROGRESS', 'The exact grant action owner is still alive.');
      }
      replaceToken = lease.actionToken;
    }

    const claim = this.#claimAction(
      lease.id,
      'GRANT',
      lease.grantInputHash,
      input.occurredAt,
      replaceToken,
    );
    lease = claim.lease;
    if (!claim.claimed) {
      const assessment = await this.#assessAction(lease);
      if (assessment.ownerAlive || assessment.runnerAlive) {
        throw new MnfsError('LEASE_OPERATION_IN_PROGRESS', 'Another grant action owns this Lease.');
      }
      throw new MnfsError('LEASE_ACTION_INCONCLUSIVE', 'Grant action ownership changed concurrently.');
    }

    if (lineage.attempt.sourcePath === undefined || lease.actionToken === undefined) {
      throw new MnfsError('INTERNAL_ERROR', 'Grant launch input is incomplete.');
    }
    let launchError: unknown;
    try {
      await this.#actions.launch({
        kind: 'GRANT',
        leaseId: lease.id,
        actionToken: lease.actionToken,
        holder: lease.holder,
        sourcePath: lineage.attempt.sourcePath,
      });
    } catch (error) {
      launchError = error;
    }

    const afterLaunch = await this.#actions.observe(lease.actionToken);
    requireActionObservation(afterLaunch);
    if (afterLaunch.state === 'STARTED' || afterLaunch.state === 'FINISHED') {
      lease = (await this.#assessAction(lease)).lease;
    }
    lineage = this.#loadLeaseLineage(lease);
    const completed = await this.#resolveGrantPhysical(lease, lineage, input.occurredAt);
    if (completed !== undefined) return completed;
    if (afterLaunch.state === 'STARTED' || afterLaunch.state === 'FINISHED') {
      throw new MnfsError(
        'LEASE_ACTION_INCONCLUSIVE',
        'Grant action has durable execution evidence without a decisive physical Lease.',
      );
    }
    if (launchError !== undefined) throw launchError;
    throw new MnfsError('LEASE_ACTION_INCONCLUSIVE', 'Grant action completed without decisive state.');
  }

  #ensureReleaseIntent(
    input: LeaseReleaseInput,
    lease: Lease,
    lineage: LeaseLineage,
    releaseInputHash: string,
  ): Lease {
    return this.#store.execution.runAtomic((session) => {
      const idempotentLease = this.#store.execution.getLeaseByReleaseIdempotencyKey(
        input.idempotencyKey,
      );
      if (idempotentLease !== undefined && idempotentLease.id !== lease.id) {
        throw new MnfsError(
          'LEASE_IDEMPOTENCY_CONFLICT',
          `Lease release key ${input.idempotencyKey} is bound to another Lease.`,
        );
      }
      const current = this.#store.execution.getLease(lease.id);
      if (current === undefined) throw new MnfsError('LEASE_CONFLICT', `Lease ${lease.id} is missing.`);
      const currentLineage = requireReleasableLeaseLineage(
        this.#store.execution.getWriteTrack(current.writeTrackId),
        this.#store.execution.getAttempt(current.attemptId),
        current,
      );
      if (
        currentLineage.attempt.sourceStatus !== 'READY'
        || currentLineage.attempt.sourcePath !== lineage.attempt.sourcePath
        || currentLineage.attempt.sourceFingerprint !== lineage.attempt.sourceFingerprint
        || currentLineage.attempt.baseCommitSha !== lineage.attempt.baseCommitSha
        || currentLineage.attempt.gitObjectFormat !== lineage.attempt.gitObjectFormat
      ) {
        throw new MnfsError('LEASE_FENCE_CONFLICT', 'Attempt source changed before release intent commit.');
      }
      if (
        this.#store.execution.getCurrentWorkerRun(current.attemptId) !== undefined
        || this.#store.execution.getCurrentClaim(current.attemptId) !== undefined
      ) {
        throw new MnfsError(
          'LEASE_RELEASE_BLOCKED_UNKNOWN',
          'A current Worker Run or Claim appeared before release intent commit.',
        );
      }
      if (current.releaseIdempotencyKey !== undefined) {
        if (
          current.releaseIdempotencyKey !== input.idempotencyKey
          || current.releaseInputHash !== releaseInputHash
        ) {
          throw new MnfsError(
            'LEASE_IDEMPOTENCY_CONFLICT',
            `Lease release key ${input.idempotencyKey} is bound to different input.`,
          );
        }
        return current;
      }
      if (current.status !== 'ACTIVE' || current.version !== input.expectedLeaseVersion) {
        throw new MnfsError('CONCURRENCY_CONFLICT', `Stale Lease version for ${current.id}.`);
      }
      const pending = setLease(session, current, input.occurredAt, {
        status: 'RELEASE_PENDING',
        releaseIdempotencyKey: input.idempotencyKey,
        releaseInputHash,
        releaseRequestedAt: input.occurredAt,
        lastObservedAt: this.#now(),
      });
      session.appendEvent({
        eventId: eventId(pending.id, 'RELEASE-REQUESTED'),
        type: 'LEASE_RELEASE_REQUESTED',
        payloadSchemaVersion: 1,
        missionId: currentLineage.track.missionId,
        occurredAt: input.occurredAt,
        payload: {
          leaseId: pending.id,
          generation: pending.generation,
          idempotencyKey: input.idempotencyKey,
          inputHash: releaseInputHash,
          externalLeaseId: pending.externalLeaseId,
          holder: pending.holder,
          worktreePath: pending.worktreePath,
        },
      });
      return pending;
    });
  }

  #commitReleased(leaseId: string, occurredAt: string): Lease {
    return this.#store.execution.runAtomic((session) => {
      const current = this.#store.execution.getLease(leaseId);
      if (current === undefined) throw new MnfsError('LEASE_CONFLICT', `Lease ${leaseId} is missing.`);
      if (current.status === 'RELEASED') return current;
      if (current.status !== 'RELEASE_PENDING') {
        throw new MnfsError('LEASE_CONFLICT', `Lease ${leaseId} cannot become RELEASED from ${current.status}.`);
      }
      const lineage = requireReleasableLeaseLineage(
        this.#store.execution.getWriteTrack(current.writeTrackId),
        this.#store.execution.getAttempt(current.attemptId),
        current,
      );
      const released = setLease(session, current, occurredAt, {
        status: 'RELEASED',
        actionKind: null,
        actionToken: null,
        actionPhase: null,
        actionOwner: null,
        actionRunner: null,
        releaseObservedAt: this.#now(),
        lastObservedAt: this.#now(),
        lastErrorCode: null,
        lastErrorRef: null,
      });
      session.appendEvent({
        eventId: eventId(released.id, 'RELEASED'),
        type: 'LEASE_RELEASED',
        payloadSchemaVersion: 1,
        missionId: lineage.track.missionId,
        occurredAt,
        payload: {
          leaseId: released.id,
          generation: released.generation,
          externalLeaseId: released.externalLeaseId,
          holder: released.holder,
          worktreePath: released.worktreePath,
          observedAt: released.releaseObservedAt,
        },
      });
      return released;
    });
  }

  async #releasePhysical(
    lease: Lease,
    lineage: LeaseLineage,
    occurredAt: string,
  ): Promise<Readonly<{ readonly state: ReleasePhysicalState; readonly terminal?: Lease }>> {
    const physical = await this.#observe(lineage, 'RELEASE', lease);
    requireSource(lineage.attempt, physical.source, 'LEASE_FENCE_CONFLICT');
    const state = classifyRelease(physical, lease, lineage.attempt);
    if (state.kind === 'AVAILABLE') {
      if (lease.status !== 'RELEASE_PENDING' && lease.status !== 'RELEASED') {
        const reason = 'The worktree became available before a release intent existed.';
        this.#markDiverged(lease.id, reason, occurredAt);
        throw new MnfsError('RECOVERY_DIVERGENCE', reason);
      }
      return { state, terminal: this.#commitReleased(lease.id, occurredAt) };
    }
    if (state.kind === 'DIVERGED') {
      this.#markDiverged(lease.id, state.reason, occurredAt);
      throw new MnfsError('RECOVERY_DIVERGENCE', state.reason);
    }
    if (state.kind === 'FENCE') {
      throw new MnfsError('LEASE_FENCE_CONFLICT', state.reason);
    }
    if (state.kind === 'DIRTY') {
      throw new MnfsError('LEASE_RELEASE_BLOCKED_DIRTY', 'Lease worktree contains dirty work.');
    }
    if (state.kind === 'UNKNOWN') {
      throw new MnfsError('LEASE_RELEASE_BLOCKED_UNKNOWN', 'Lease worktree state is unknown.');
    }
    return { state };
  }

  async release(input: LeaseReleaseInput): Promise<Lease> {
    let lease = this.#store.execution.getLease(input.leaseId);
    if (lease === undefined) throw new MnfsError('LEASE_CONFLICT', `Lease ${input.leaseId} was not found.`);
    let lineage = this.#loadLeaseLineage(lease);
    const releaseInputHash = this.#releaseInputHash(input, lease, lineage);

    if (lease.releaseIdempotencyKey !== undefined) {
      if (
        lease.releaseIdempotencyKey !== input.idempotencyKey
        || lease.releaseInputHash !== releaseInputHash
      ) {
        throw new MnfsError(
          'LEASE_IDEMPOTENCY_CONFLICT',
          `Lease release key ${input.idempotencyKey} is bound to different input.`,
        );
      }
      if (lease.status === 'RELEASED') return lease;
      lineage = this.#loadReleasableLeaseLineage(lease);
    } else {
      lineage = this.#loadReleasableLeaseLineage(lease);
      if (lease.status !== 'ACTIVE' || lease.version !== input.expectedLeaseVersion) {
        throw new MnfsError('CONCURRENCY_CONFLICT', `Stale Lease version for ${lease.id}.`);
      }
      if (
        this.#store.execution.getCurrentWorkerRun(lineage.attempt.id) !== undefined
        || this.#store.execution.getCurrentClaim(lineage.attempt.id) !== undefined
      ) {
        throw new MnfsError(
          'LEASE_RELEASE_BLOCKED_UNKNOWN',
          'A current Worker Run or Claim still owns the Lease lineage.',
        );
      }
      const preflight = await this.#releasePhysical(lease, lineage, input.occurredAt);
      if (preflight.terminal !== undefined) return preflight.terminal;
      lease = this.#ensureReleaseIntent(input, lease, lineage, releaseInputHash);
    }

    if (lease.status === 'RELEASED') return lease;
    if (lease.status === 'DIVERGED') {
      throw new MnfsError('RECOVERY_DIVERGENCE', `Lease ${lease.id} is already DIVERGED.`);
    }
    lineage = this.#loadReleasableLeaseLineage(lease);
    const currentPhysical = await this.#releasePhysical(lease, lineage, input.occurredAt);
    if (currentPhysical.terminal !== undefined) return currentPhysical.terminal;

    let replaceToken: string | undefined;
    if (lease.actionToken !== undefined) {
      if (lease.actionKind !== 'RELEASE') {
        throw new MnfsError('LEASE_ACTION_INCONCLUSIVE', 'Lease action kind conflicts with release.');
      }
      const assessment = await this.#assessAction(lease);
      lease = assessment.lease;
      lineage = this.#loadReleasableLeaseLineage(lease);
      const resolved = await this.#releasePhysical(lease, lineage, input.occurredAt);
      if (resolved.terminal !== undefined) return resolved.terminal;
      if (assessment.observation.state === 'ABSENT') {
        if (assessment.ownerAlive) {
          throw new MnfsError('LEASE_OPERATION_IN_PROGRESS', 'The exact release action owner is alive.');
        }
        replaceToken = lease.actionToken;
      } else if (assessment.runnerAlive) {
        throw new MnfsError('LEASE_OPERATION_IN_PROGRESS', 'The exact release helper is alive.');
      } else {
        replaceToken = lease.actionToken;
      }
    }

    const claim = this.#claimAction(
      lease.id,
      'RELEASE',
      releaseInputHash,
      input.occurredAt,
      replaceToken,
    );
    lease = claim.lease;
    if (!claim.claimed) {
      const assessment = await this.#assessAction(lease);
      if (assessment.ownerAlive || assessment.runnerAlive) {
        throw new MnfsError('LEASE_OPERATION_IN_PROGRESS', 'Another release action owns this Lease.');
      }
      throw new MnfsError('LEASE_ACTION_INCONCLUSIVE', 'Release action ownership changed concurrently.');
    }

    if (
      lineage.attempt.sourcePath === undefined
      || lease.actionToken === undefined
      || lease.externalLeaseId === undefined
      || lease.worktreePath === undefined
    ) {
      throw new MnfsError('INTERNAL_ERROR', 'Release launch input is incomplete.');
    }
    let launchError: unknown;
    try {
      await this.#actions.launch({
        kind: 'RELEASE',
        leaseId: lease.id,
        actionToken: lease.actionToken,
        holder: lease.holder,
        sourcePath: lineage.attempt.sourcePath,
        externalLeaseId: lease.externalLeaseId,
        worktreePath: lease.worktreePath,
      });
    } catch (error) {
      launchError = error;
    }

    const afterLaunch = await this.#actions.observe(lease.actionToken);
    requireActionObservation(afterLaunch);
    if (afterLaunch.state === 'STARTED' || afterLaunch.state === 'FINISHED') {
      lease = (await this.#assessAction(lease)).lease;
    }
    lineage = this.#loadReleasableLeaseLineage(lease);
    const completed = await this.#releasePhysical(lease, lineage, input.occurredAt);
    if (completed.terminal !== undefined) return completed.terminal;
    if (afterLaunch.state === 'STARTED' || afterLaunch.state === 'FINISHED') {
      throw new MnfsError(
        'LEASE_ACTION_INCONCLUSIVE',
        'Release action has durable execution evidence but the exact Lease remains.',
      );
    }
    if (launchError !== undefined) throw launchError;
    throw new MnfsError('LEASE_ACTION_INCONCLUSIVE', 'Release action completed without decisive state.');
  }
}
