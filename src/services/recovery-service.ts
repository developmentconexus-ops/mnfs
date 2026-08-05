import { createHash } from 'node:crypto';
import { isAbsolute, normalize } from 'node:path';

import { canonicalJson } from '../domain/mission-plan.js';
import type {
  Attempt,
  Lease,
  ProcessIdentity,
  WriteTrack,
} from '../execution/model.js';
import type { SqliteStore } from '../store/sqlite-store.js';

export interface RecoverySourceObservation {
  readonly status: 'READY' | 'REQUESTED' | 'CHANGED' | 'MISSING' | 'UNKNOWN';
  readonly attemptId?: string;
  readonly path?: string;
  readonly fingerprint?: string;
  readonly baseCommitSha?: string;
  readonly baseTreeSha?: string;
  readonly objectFormat?: 'sha1' | 'sha256';
}

export interface RecoveryLeaseCandidate {
  readonly path: string;
  readonly managed: boolean;
  readonly sourcePath: string;
  readonly status: 'available' | 'leased' | 'missing';
  readonly gitStatus: 'CLEAN' | 'DIRTY' | 'UNKNOWN';
  readonly leaseId?: string;
  readonly holder?: string;
  readonly leasedAt?: string;
}

export interface RecoveryActionCandidate {
  readonly actionToken: string;
  readonly state: 'CLAIMED' | 'STARTED' | 'FINISHED' | 'CONFLICT';
  readonly kind: 'GRANT' | 'RELEASE';
  readonly runner?: ProcessIdentity;
  readonly startedRef?: string;
  readonly resultRef?: string;
}

export interface RecoveryProcessCandidate {
  readonly identity: ProcessIdentity;
  readonly alive: boolean;
}

export interface RecoveryWorldObservation {
  readonly sources: readonly RecoverySourceObservation[];
  readonly leases: readonly RecoveryLeaseCandidate[];
  readonly actions: readonly RecoveryActionCandidate[];
  readonly processes: readonly RecoveryProcessCandidate[];
}

export interface RecoveryObservationAuthority {
  observe(input: Readonly<{ writeTrackId?: string }>): Promise<RecoveryWorldObservation>;
}

export type RecoveryCode =
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

export interface RecoveryFinding {
  readonly code: RecoveryCode;
  readonly target: string;
  readonly severity: 'INFO' | 'BLOCKING';
  readonly safeActions: readonly string[];
  readonly requiredAuthority: 'NONE' | 'ORIGINAL_OPERATION' | 'OPERATOR';
  readonly nextAction: string;
}

export interface RecoveryExpectedState {
  readonly writeTrack?: WriteTrack;
  readonly attempt?: Attempt;
  readonly lease?: Lease;
}

export interface RecoveryReport {
  readonly schemaVersion: 1;
  readonly writeTrackId?: string;
  readonly expected: RecoveryExpectedState;
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

interface ClassificationState {
  sourceExact: boolean;
  leaseExact: boolean;
}

const CODE_ORDER: Readonly<Record<RecoveryCode, number>> = Object.freeze({
  HEALTHY: 0,
  ADOPTABLE: 1,
  'LD-01': 2,
  'LD-02': 3,
  'LD-03': 4,
  'LD-04': 5,
  'LD-05': 6,
  'LD-06': 7,
  'LD-07': 8,
  'SD-01': 9,
  'SD-02': 10,
  UNKNOWN: 11,
});

function hashCanonical(value: unknown): string {
  return `sha256:${createHash('sha256').update(canonicalJson(value), 'utf8').digest('hex')}`;
}

function finding(
  code: RecoveryCode,
  target: string,
  options: Readonly<{
    severity?: 'INFO' | 'BLOCKING';
    safeActions: readonly string[];
    requiredAuthority: 'NONE' | 'ORIGINAL_OPERATION' | 'OPERATOR';
    nextAction: string;
  }>,
): RecoveryFinding {
  return Object.freeze({
    code,
    target: target.length === 0 ? 'recovery-world' : target,
    severity: options.severity ?? 'BLOCKING',
    safeActions: Object.freeze([...options.safeActions]),
    requiredAuthority: options.requiredAuthority,
    nextAction: options.nextAction,
  });
}

function addFinding(target: RecoveryFinding[], value: RecoveryFinding): void {
  const key = `${value.code}\u0000${value.target}`;
  if (target.some((candidate) => `${candidate.code}\u0000${candidate.target}` === key)) return;
  target.push(value);
}

function compareFindings(left: RecoveryFinding, right: RecoveryFinding): number {
  const order = CODE_ORDER[left.code] - CODE_ORDER[right.code];
  if (order !== 0) return order;
  if (left.target === right.target) return 0;
  return left.target < right.target ? -1 : 1;
}

function processKey(identity: ProcessIdentity): string {
  return `${identity.bootId}:${identity.pid}:${identity.startTicks}`;
}

function sameProcess(left: ProcessIdentity | undefined, right: ProcessIdentity | undefined): boolean {
  if (left === undefined || right === undefined) return left === right;
  return processKey(left) === processKey(right);
}

function safeAbsolutePath(value: string): boolean {
  return value.length > 0
    && !value.includes('\u0000')
    && isAbsolute(value)
    && value !== '/mnt'
    && !value.startsWith('/mnt/')
    && normalize(value) === value;
}

function duplicateValues(values: readonly (string | undefined)[]): boolean {
  const present = values.filter((value): value is string => value !== undefined && value.length > 0);
  return new Set(present).size !== present.length;
}

function canonicalPathKey(value: string): string {
  return isAbsolute(value) ? normalize(value) : value;
}

function sourceMatches(attempt: Attempt, candidate: RecoverySourceObservation): boolean {
  return candidate.status === 'READY'
    && candidate.attemptId === attempt.id
    && candidate.path === attempt.sourcePath
    && candidate.fingerprint === attempt.sourceFingerprint
    && candidate.baseCommitSha === attempt.baseCommitSha
    && candidate.objectFormat === attempt.gitObjectFormat;
}

function sourceRelated(attempt: Attempt, candidate: RecoverySourceObservation): boolean {
  return candidate.attemptId === attempt.id
    || (attempt.sourcePath !== undefined && candidate.path === attempt.sourcePath);
}

function classifySource(
  expected: RecoveryExpectedState,
  observed: RecoveryWorldObservation,
  findings: RecoveryFinding[],
): boolean {
  const attempt = expected.attempt;
  if (attempt === undefined) {
    if (observed.sources.length > 0) {
      addFinding(findings, finding('UNKNOWN', 'source-observation', {
        safeActions: ['preserve every source candidate and identify its semantic owner'],
        requiredAuthority: 'OPERATOR',
        nextAction: 'Resolve source ownership before any state-changing operation.',
      }));
    }
    return false;
  }

  const related = observed.sources.filter((candidate) => sourceRelated(attempt, candidate));
  const unrelated = observed.sources.filter((candidate) => !sourceRelated(attempt, candidate));
  for (const candidate of unrelated) {
    addFinding(findings, finding(
      'UNKNOWN',
      candidate.attemptId ?? candidate.path ?? 'unowned-source',
      {
        safeActions: ['preserve the source candidate and identify its semantic owner'],
        requiredAuthority: 'OPERATOR',
        nextAction: 'Resolve source ownership before any state-changing operation.',
      },
    ));
  }
  if (attempt.sourceStatus === 'REQUESTED') {
    if (related.length === 0 || related.every((candidate) => candidate.status === 'MISSING')) {
      addFinding(findings, finding('SD-01', attempt.id, {
        safeActions: ['preserve the Attempt intent and retry only the original source operation'],
        requiredAuthority: 'ORIGINAL_OPERATION',
        nextAction: 'Retry the original source operation with the same Attempt fence.',
      }));
      return false;
    }
    if (related.length === 1 && related[0]?.status === 'UNKNOWN') {
      addFinding(findings, finding('UNKNOWN', attempt.id, {
        safeActions: ['preserve the Attempt and collect a decisive source observation'],
        requiredAuthority: 'OPERATOR',
        nextAction: 'Collect complete source identity evidence before proceeding.',
      }));
      return false;
    }
    if (related.length === 1 && sourceMatches(attempt, related[0] as RecoverySourceObservation)) {
      return true;
    }
    addFinding(findings, finding('SD-02', attempt.id, {
      safeActions: ['preserve the observed source and compare its complete identity'],
      requiredAuthority: 'OPERATOR',
      nextAction: 'Resolve the source identity difference before using the Attempt.',
    }));
    return false;
  }

  if (attempt.sourceStatus !== 'READY' || attempt.sourcePath === undefined || attempt.sourceFingerprint === undefined) {
    addFinding(findings, finding('SD-02', attempt.id, {
      safeActions: ['preserve the Attempt source evidence'],
      requiredAuthority: 'OPERATOR',
      nextAction: 'Resolve the semantic source state before proceeding.',
    }));
    return false;
  }

  if (related.length !== 1) {
    addFinding(findings, finding('SD-02', attempt.id, {
      safeActions: ['preserve every related source candidate without selecting the first match'],
      requiredAuthority: 'OPERATOR',
      nextAction: 'Establish a one-to-one source identity before proceeding.',
    }));
    return false;
  }

  const candidate = related[0] as RecoverySourceObservation;
  if (candidate.status === 'UNKNOWN') {
    addFinding(findings, finding('UNKNOWN', attempt.id, {
      safeActions: ['preserve source state and collect complete identity fields'],
      requiredAuthority: 'OPERATOR',
      nextAction: 'Repeat source observation until the identity is decisive.',
    }));
    return false;
  }
  if (!sourceMatches(attempt, candidate)) {
    addFinding(findings, finding('SD-02', attempt.id, {
      safeActions: ['preserve the source candidate and compare path, fingerprint, base and format'],
      requiredAuthority: 'OPERATOR',
      nextAction: 'Resolve the source identity difference before using the Attempt.',
    }));
    return false;
  }
  return true;
}

function candidateRelated(
  lease: Lease,
  attempt: Attempt | undefined,
  candidate: RecoveryLeaseCandidate,
): boolean {
  return (lease.externalLeaseId !== undefined && candidate.leaseId === lease.externalLeaseId)
    || (lease.worktreePath !== undefined && candidate.path === lease.worktreePath)
    || candidate.holder === lease.holder
    || (attempt?.sourcePath !== undefined
      && candidate.sourcePath === attempt.sourcePath
      && candidate.status === 'leased');
}

function classifyLeaseCandidate(
  lease: Lease,
  attempt: Attempt | undefined,
  candidate: RecoveryLeaseCandidate,
  findings: RecoveryFinding[],
): ClassificationState {
  const target = lease.id;
  if (
    !candidate.managed
    || candidate.status === 'missing'
    || !safeAbsolutePath(candidate.path)
    || !safeAbsolutePath(candidate.sourcePath)
    || (attempt?.sourcePath !== undefined && candidate.sourcePath !== attempt.sourcePath)
  ) {
    addFinding(findings, finding('LD-05', target, {
      safeActions: ['preserve the candidate and verify managed path ownership'],
      requiredAuthority: 'OPERATOR',
      nextAction: 'Resolve worktree and source ownership before any Lease operation.',
    }));
    return { sourceExact: false, leaseExact: false };
  }

  if (lease.status === 'RELEASED') {
    if (
      candidate.status === 'available'
      && candidate.gitStatus === 'CLEAN'
      && candidate.leaseId === undefined
      && candidate.holder === undefined
      && candidate.leasedAt === undefined
      && lease.worktreePath === candidate.path
      && attempt?.sourcePath === candidate.sourcePath
    ) {
      return { sourceExact: true, leaseExact: true };
    }
    addFinding(findings, finding('LD-05', target, {
      safeActions: ['preserve the released Lease audit identity and available worktree evidence'],
      requiredAuthority: 'OPERATOR',
      nextAction: 'Resolve the post-release worktree identity before proceeding.',
    }));
    return { sourceExact: false, leaseExact: false };
  }

  if (candidate.status === 'available') {
    if (candidate.gitStatus === 'UNKNOWN') {
      addFinding(findings, finding('UNKNOWN', target, {
        safeActions: ['preserve the available candidate and collect decisive Git state'],
        requiredAuthority: 'OPERATOR',
        nextAction: 'Repeat external observation until the available worktree state is decisive.',
      }));
      return { sourceExact: false, leaseExact: false };
    }
    if (candidate.gitStatus !== 'CLEAN') {
      addFinding(findings, finding('LD-05', target, {
        safeActions: ['preserve worktree content and defer semantic changes'],
        requiredAuthority: 'OPERATOR',
        nextAction: 'Inspect the available worktree before any Lease operation.',
      }));
      return { sourceExact: false, leaseExact: false };
    }
    if (
      candidate.leaseId !== undefined
      || candidate.holder !== undefined
      || candidate.leasedAt !== undefined
    ) {
      addFinding(findings, finding('UNKNOWN', target, {
        safeActions: ['preserve the contradictory available and leased identity fields'],
        requiredAuthority: 'OPERATOR',
        nextAction: 'Resolve the contradictory external Lease observation before proceeding.',
      }));
      return { sourceExact: false, leaseExact: false };
    }
    if (
      lease.status === 'RELEASE_PENDING'
      && lease.worktreePath === candidate.path
      && attempt?.sourcePath === candidate.sourcePath
    ) {
      addFinding(findings, finding('ADOPTABLE', target, {
        severity: 'INFO',
        safeActions: ['preserve the available worktree identity', 'retry the original release fence'],
        requiredAuthority: 'ORIGINAL_OPERATION',
        nextAction: 'Retry the original release operation to commit the observed result.',
      }));
      return { sourceExact: true, leaseExact: false };
    }
    addFinding(findings, finding('LD-01', target, {
      safeActions: ['preserve semantic Lease state and the decisive available worktree evidence'],
      requiredAuthority: 'OPERATOR',
      nextAction: 'Resolve why the semantic Lease has no external leased match.',
    }));
    return { sourceExact: false, leaseExact: false };
  }

  if (
    candidate.gitStatus === 'UNKNOWN'
    || candidate.leaseId === undefined
    || candidate.holder === undefined
    || candidate.leasedAt === undefined
  ) {
    addFinding(findings, finding('UNKNOWN', target, {
      safeActions: ['preserve the candidate and collect complete Lease identity fields'],
      requiredAuthority: 'OPERATOR',
      nextAction: 'Repeat external observation until Lease identity is decisive.',
    }));
    return { sourceExact: false, leaseExact: false };
  }

  if (candidate.gitStatus !== 'CLEAN') {
    addFinding(findings, finding('LD-05', target, {
      safeActions: ['preserve worktree content and defer semantic changes'],
      requiredAuthority: 'OPERATOR',
      nextAction: 'Inspect the worktree state before any Lease operation.',
    }));
    return { sourceExact: false, leaseExact: false };
  }

  if (lease.status === 'REQUESTED') {
    if (
      candidate.status === 'leased'
      && candidate.holder === lease.holder
      && candidate.leasedAt !== undefined
      && attempt?.sourcePath !== undefined
      && candidate.sourcePath === attempt.sourcePath
    ) {
      addFinding(findings, finding('ADOPTABLE', target, {
        severity: 'INFO',
        safeActions: ['preserve the exact candidate', 'retry the original grant with the same fence'],
        requiredAuthority: 'ORIGINAL_OPERATION',
        nextAction: 'Retry the original grant operation to commit the observed Lease.',
      }));
      return { sourceExact: true, leaseExact: false };
    }
    addFinding(findings, finding('LD-01', target, {
      safeActions: ['preserve semantic intent and re-observe external Lease candidates'],
      requiredAuthority: 'OPERATOR',
      nextAction: 'Resolve the missing external Lease before continuing.',
    }));
    return { sourceExact: false, leaseExact: false };
  }

  if (candidate.status !== 'leased') {
    addFinding(findings, finding('LD-01', target, {
      safeActions: ['preserve semantic Lease state and external evidence'],
      requiredAuthority: 'OPERATOR',
      nextAction: 'Resolve why the semantic Lease has no leased external match.',
    }));
    return { sourceExact: false, leaseExact: false };
  }

  if (lease.externalLeaseId !== undefined && candidate.leaseId !== lease.externalLeaseId) {
    addFinding(findings, finding('LD-03', target, {
      safeActions: ['preserve both Lease identities for comparison'],
      requiredAuthority: 'OPERATOR',
      nextAction: 'Resolve the external Lease ID difference before proceeding.',
    }));
    return { sourceExact: false, leaseExact: false };
  }
  if (candidate.holder !== lease.holder) {
    addFinding(findings, finding('LD-04', target, {
      safeActions: ['preserve the holder evidence and block ownership changes'],
      requiredAuthority: 'OPERATOR',
      nextAction: 'Resolve the holder difference before proceeding.',
    }));
    return { sourceExact: false, leaseExact: false };
  }
  if (lease.worktreePath !== undefined && candidate.path !== lease.worktreePath) {
    addFinding(findings, finding('LD-05', target, {
      safeActions: ['preserve both path identities for operator review'],
      requiredAuthority: 'OPERATOR',
      nextAction: 'Resolve the worktree path difference before proceeding.',
    }));
    return { sourceExact: false, leaseExact: false };
  }
  if (lease.externalLeasedAt !== undefined && candidate.leasedAt !== lease.externalLeasedAt) {
    addFinding(findings, finding('LD-03', target, {
      safeActions: ['preserve both external Lease observations'],
      requiredAuthority: 'OPERATOR',
      nextAction: 'Resolve the external Lease timestamp difference before proceeding.',
    }));
    return { sourceExact: false, leaseExact: false };
  }
  if (candidate.leasedAt === undefined) {
    addFinding(findings, finding('UNKNOWN', target, {
      safeActions: ['preserve the candidate and collect its external timestamp'],
      requiredAuthority: 'OPERATOR',
      nextAction: 'Collect complete external Lease evidence before proceeding.',
    }));
    return { sourceExact: false, leaseExact: false };
  }

  return { sourceExact: true, leaseExact: true };
}

function classifyLease(
  expected: RecoveryExpectedState,
  observed: RecoveryWorldObservation,
  findings: RecoveryFinding[],
): boolean {
  const candidates = observed.leases;
  if (
    duplicateValues(candidates.map((candidate) => candidate.leaseId))
    || duplicateValues(candidates.map((candidate) => canonicalPathKey(candidate.path)))
    || duplicateValues(candidates.map((candidate) => canonicalPathKey(candidate.sourcePath)))
    || duplicateValues(candidates.map((candidate) => candidate.holder))
  ) {
    addFinding(findings, finding('LD-06', expected.lease?.id ?? 'external-leases', {
      safeActions: ['preserve every candidate without selecting a first match'],
      requiredAuthority: 'OPERATOR',
      nextAction: 'Resolve duplicate external identities before any Lease operation.',
    }));
    return false;
  }

  const lease = expected.lease;
  if (lease === undefined) {
    if (candidates.length === 0) return true;
    for (const candidate of candidates) {
      addFinding(findings, finding('LD-02', candidate.path, {
        safeActions: ['preserve the external candidate for operator review'],
        requiredAuthority: 'OPERATOR',
        nextAction: 'Identify or create the correct semantic owner through an authorized operation.',
      }));
    }
    return false;
  }
  if (lease.status === 'DIVERGED') {
    addFinding(findings, finding('LD-07', lease.id, {
      safeActions: ['preserve semantic and external Lease evidence'],
      requiredAuthority: 'OPERATOR',
      nextAction: 'Resolve the recorded Lease divergence before continuing.',
    }));
    return false;
  }

  const related = candidates.filter((candidate) => candidateRelated(lease, expected.attempt, candidate));
  const unrelated = candidates.filter((candidate) => !candidateRelated(lease, expected.attempt, candidate));
  for (const candidate of unrelated) {
    addFinding(findings, finding('LD-02', candidate.path, {
      safeActions: ['preserve the external candidate for operator review'],
      requiredAuthority: 'OPERATOR',
      nextAction: 'Resolve the candidate semantic ownership before any state change.',
    }));
  }

  if (related.length === 0) {
    addFinding(findings, finding('LD-01', lease.id, {
      safeActions: ['preserve semantic Lease state and collect a fresh external observation'],
      requiredAuthority: 'OPERATOR',
      nextAction: 'Resolve the absent external Lease before continuing.',
    }));
    return false;
  }
  if (related.length !== 1) {
    addFinding(findings, finding('LD-06', lease.id, {
      safeActions: ['preserve every related candidate without selecting one'],
      requiredAuthority: 'OPERATOR',
      nextAction: 'Establish a one-to-one Lease identity before continuing.',
    }));
    return false;
  }

  return classifyLeaseCandidate(
    lease,
    expected.attempt,
    related[0] as RecoveryLeaseCandidate,
    findings,
  ).leaseExact;
}

function actionEvidenceComplete(candidate: RecoveryActionCandidate): boolean {
  if (candidate.state === 'CLAIMED') {
    return candidate.runner === undefined
      && candidate.startedRef === undefined
      && candidate.resultRef === undefined;
  }
  if (candidate.runner === undefined || candidate.startedRef === undefined) return false;
  if (candidate.state === 'STARTED') return candidate.resultRef === undefined;
  return candidate.state === 'FINISHED' && candidate.resultRef !== undefined;
}

function actionPhaseRank(phase: 'CLAIMED' | 'STARTED' | 'FINISHED'): number {
  if (phase === 'CLAIMED') return 0;
  if (phase === 'STARTED') return 1;
  return 2;
}

function actionCompatible(lease: Lease, candidate: RecoveryActionCandidate): boolean {
  if (!actionEvidenceComplete(candidate)) return false;
  if (
    lease.actionToken === undefined
    || lease.actionKind === undefined
    || lease.actionPhase === undefined
    || candidate.actionToken !== lease.actionToken
    || candidate.kind !== lease.actionKind
    || candidate.state === 'CONFLICT'
  ) return false;
  if (actionPhaseRank(candidate.state) < actionPhaseRank(lease.actionPhase)) return false;

  if (candidate.state === 'CLAIMED') {
    return lease.actionPhase === 'CLAIMED' && lease.actionRunner === undefined;
  }
  if (lease.actionRunner !== undefined && !sameProcess(lease.actionRunner, candidate.runner)) return false;
  if (lease.actionStartedRef !== undefined && lease.actionStartedRef !== candidate.startedRef) return false;
  if (
    candidate.state === 'FINISHED'
    && lease.actionResultRef !== undefined
    && lease.actionResultRef !== candidate.resultRef
  ) return false;
  return true;
}

function classifyActions(
  expected: RecoveryExpectedState,
  observed: RecoveryWorldObservation,
  findings: RecoveryFinding[],
): void {
  const actions = observed.actions;
  const processes = observed.processes;
  const duplicatedToken = duplicateValues(actions.map((candidate) => candidate.actionToken));
  const processKeys = processes.map((candidate) => processKey(candidate.identity));
  const duplicatedProcess = new Set(processKeys).size !== processKeys.length;
  if (duplicatedToken || duplicatedProcess || actions.some((candidate) => candidate.state === 'CONFLICT')) {
    addFinding(findings, finding('LD-07', expected.lease?.id ?? 'action-observation', {
      safeActions: ['preserve every action and process candidate'],
      requiredAuthority: 'OPERATOR',
      nextAction: 'Resolve conflicting action or process evidence before continuing.',
    }));
    return;
  }

  const lease = expected.lease;
  if (lease?.actionToken === undefined) {
    if (lease?.status === 'RELEASE_PENDING') {
      addFinding(findings, finding('LD-07', lease.id, {
        safeActions: [
          'preserve the release intent and exact Lease fence',
          'retry only the original release operation after fresh observation',
        ],
        requiredAuthority: 'ORIGINAL_OPERATION',
        nextAction: 'Resume the original release operation under the same idempotency and Lease fence.',
      }));
    }
    if (actions.length > 0 || processes.length > 0) {
      addFinding(findings, finding('LD-07', 'unowned-action', {
        safeActions: ['preserve every action and process candidate and identify its semantic owner'],
        requiredAuthority: 'OPERATOR',
        nextAction: 'Resolve action and process ownership before any semantic operation.',
      }));
    }
    return;
  }

  const matching = actions.filter((candidate) => candidate.actionToken === lease.actionToken);
  const unrelated = actions.filter((candidate) => candidate.actionToken !== lease.actionToken);
  if (unrelated.length > 0) {
    addFinding(findings, finding('LD-07', lease.id, {
      safeActions: ['preserve every unrelated action candidate'],
      requiredAuthority: 'OPERATOR',
      nextAction: 'Resolve action ownership before continuing the semantic operation.',
    }));
  }
  if (matching.length !== 1 || !actionCompatible(lease, matching[0] as RecoveryActionCandidate)) {
    addFinding(findings, finding('LD-07', lease.id, {
      safeActions: ['preserve semantic and observed action evidence'],
      requiredAuthority: 'OPERATOR',
      nextAction: 'Resolve action evidence before continuing the original operation.',
    }));
    return;
  }

  const action = matching[0] as RecoveryActionCandidate;
  const allowedProcessKeys = new Set<string>();
  if (lease.actionOwner !== undefined) allowedProcessKeys.add(processKey(lease.actionOwner));
  if (action.runner !== undefined) allowedProcessKeys.add(processKey(action.runner));
  if (processes.some((candidate) => !allowedProcessKeys.has(processKey(candidate.identity)))) {
    addFinding(findings, finding('LD-07', lease.id, {
      safeActions: ['preserve every process candidate and identify its action ownership'],
      requiredAuthority: 'OPERATOR',
      nextAction: 'Resolve unrelated helper process evidence before continuing.',
    }));
  }

  if (action.state === 'CLAIMED') {
    const ownerProcesses = lease.actionOwner === undefined
      ? []
      : processes.filter((candidate) => sameProcess(candidate.identity, lease.actionOwner));
    if (ownerProcesses.length !== 1 || ownerProcesses[0]?.alive !== true) {
      addFinding(findings, finding('LD-07', lease.id, {
        safeActions: ['preserve the action token and collect one decisive owner-process observation'],
        requiredAuthority: 'OPERATOR',
        nextAction: 'Resolve committed action-owner liveness before continuing.',
      }));
    }
    return;
  }

  const runner = action.runner as ProcessIdentity;
  const runnerProcesses = processes.filter((candidate) => sameProcess(candidate.identity, runner));
  if (
    runnerProcesses.length !== 1
    || (action.state === 'STARTED' && runnerProcesses[0]?.alive !== true)
  ) {
    addFinding(findings, finding('LD-07', lease.id, {
      safeActions: ['preserve runner identity and collect one decisive process observation'],
      requiredAuthority: 'OPERATOR',
      nextAction: 'Resolve helper process evidence before continuing.',
    }));
  }
}

export class RecoveryService {
  readonly #store: SqliteStore;
  readonly #observations: RecoveryObservationAuthority;

  constructor(input: Readonly<{
    store: SqliteStore;
    observations: RecoveryObservationAuthority;
  }>) {
    this.#store = input.store;
    this.#observations = input.observations;
  }

  async recover(input: Readonly<{ writeTrackId?: string }>): Promise<RecoveryReport> {
    const observed = structuredClone(await this.#observations.observe(input));
    const writeTrack = input.writeTrackId === undefined
      ? undefined
      : this.#store.execution.getWriteTrack(input.writeTrackId);
    const attempt = writeTrack === undefined
      ? undefined
      : this.#store.execution.getCurrentAttempt(writeTrack.id);
    const lease = writeTrack === undefined
      ? undefined
      : this.#store.execution.getCurrentLease(writeTrack.id)
        ?? this.#store.execution.getLatestLease(writeTrack.id);
    const expected: RecoveryExpectedState = Object.freeze({
      ...(writeTrack === undefined ? {} : { writeTrack }),
      ...(attempt === undefined ? {} : { attempt }),
      ...(lease === undefined ? {} : { lease }),
    });

    const findings: RecoveryFinding[] = [];
    const sourceExact = classifySource(expected, observed, findings);
    const leaseExact = classifyLease(expected, observed, findings);
    classifyActions(expected, observed, findings);

    if (
      findings.length === 0
      && writeTrack !== undefined
      && attempt !== undefined
      && sourceExact
      && leaseExact
    ) {
      addFinding(findings, finding('HEALTHY', writeTrack.id, {
        severity: 'INFO',
        safeActions: ['continue observing the exact current lineage'],
        requiredAuthority: 'NONE',
        nextAction: 'No recovery action is required.',
      }));
    }
    if (findings.length === 0) {
      addFinding(findings, finding('UNKNOWN', input.writeTrackId ?? 'recovery-world', {
        safeActions: ['preserve all observed state and collect complete semantic identity'],
        requiredAuthority: 'OPERATOR',
        nextAction: 'Collect decisive semantic and physical evidence before proceeding.',
      }));
    }

    findings.sort(compareFindings);
    const observationHashes = Object.freeze({
      sources: hashCanonical(observed.sources),
      leases: hashCanonical(observed.leases),
      actions: hashCanonical(observed.actions),
      processes: hashCanonical(observed.processes),
    });
    const body = Object.freeze({
      schemaVersion: 1 as const,
      ...(input.writeTrackId === undefined ? {} : { writeTrackId: input.writeTrackId }),
      expected,
      findings: Object.freeze([...findings]),
      observed,
      observationHashes,
    });
    return Object.freeze({
      ...body,
      contentHash: hashCanonical(body),
    });
  }
}
