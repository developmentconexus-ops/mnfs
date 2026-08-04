import type { DatabaseSync } from 'node:sqlite';

import { MnfsError, type MnfsErrorCode } from '../domain/errors.js';
import {
  formatAttemptId,
  formatClaimId,
  formatLeaseId,
  formatWorkerRunId,
  formatWriteTrackId,
  requireAttemptId,
  requireClaimId,
  requireLeaseId,
  requireWorkerRunId,
  requireWriteTrackId,
} from '../execution/ids.js';
import type {
  Attempt,
  AttemptStatus,
  Claim,
  GitObjectFormat,
  Lease,
  LeaseActionKind,
  LeaseActionPhase,
  LeaseStatus,
  ProcessIdentity,
  SourceStatus,
  WorkerRun,
  WorkerRunStatus,
  WriteTrack,
  WriteTrackStatus,
} from '../execution/model.js';
import type { EventStore } from './event-store.js';
import type { SqliteTransaction } from './sqlite-transaction.js';

export interface AllocateWriteTrackInput {
  readonly missionId: string;
  readonly milestoneQualifiedId: string;
  readonly featureQualifiedId: string;
  readonly contractHash: string;
  readonly occurredAt: string;
}

export interface AllocateAttemptInput {
  readonly writeTrackId: string;
  readonly contractHash: string;
  readonly gitObjectFormat: GitObjectFormat;
  readonly baseCommitSha: string;
  readonly occurredAt: string;
}

export interface AllocateWorkerRunInput {
  readonly attemptId: string;
  readonly contractHash: string;
  readonly occurredAt: string;
}

export interface AllocateLeaseInput {
  readonly writeTrackId: string;
  readonly attemptId: string;
  readonly contractHash: string;
  readonly grantIdempotencyKey: string;
  readonly grantInputHash: string;
  readonly holder: string;
  readonly occurredAt: string;
}

export interface AllocateClaimInput {
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

const WRITE_TRACK_STATUSES = ['ACTIVE', 'CLAIMED', 'ABANDONED'] as const;
const ATTEMPT_STATUSES = ['OPEN', 'SUPERSEDED', 'CLOSED', 'CANCELLED'] as const;
const SOURCE_STATUSES = ['REQUESTED', 'READY', 'DIVERGED'] as const;
const WORKER_RUN_STATUSES = [
  'STARTING',
  'RUNNING',
  'IDLE',
  'EXITED',
  'LOST',
  'CANCELLED',
] as const;
const LEASE_STATUSES = [
  'REQUESTED',
  'ACTIVE',
  'RELEASE_PENDING',
  'RELEASED',
  'DIVERGED',
] as const;
const LEASE_ACTION_KINDS = ['GRANT', 'RELEASE'] as const;
const LEASE_ACTION_PHASES = ['CLAIMED', 'STARTED', 'FINISHED'] as const;
const GIT_OBJECT_FORMATS = ['sha1', 'sha256'] as const;

function internal(message: string, cause?: unknown): MnfsError {
  const suffix = cause instanceof Error ? ` ${cause.message}` : '';
  return new MnfsError('INTERNAL_ERROR', `${message}${suffix}`);
}

function requireRowString(
  row: Readonly<Record<string, unknown>>,
  key: string,
  entity: string,
): string {
  const value = row[key];
  if (typeof value !== 'string' || value.length === 0) {
    throw internal(`${entity} row has invalid ${key}.`);
  }
  return value;
}

function optionalRowString(
  row: Readonly<Record<string, unknown>>,
  key: string,
  entity: string,
): string | undefined {
  const value = row[key];
  if (value === null || value === undefined) return undefined;
  if (typeof value !== 'string' || value.length === 0) {
    throw internal(`${entity} row has invalid optional ${key}.`);
  }
  return value;
}

function requireRowInteger(
  row: Readonly<Record<string, unknown>>,
  key: string,
  entity: string,
  positive = false,
): number {
  const value = Number(row[key]);
  if (!Number.isSafeInteger(value) || (positive && value <= 0)) {
    throw internal(`${entity} row has invalid ${key}.`);
  }
  return value;
}

function optionalRowInteger(
  row: Readonly<Record<string, unknown>>,
  key: string,
  entity: string,
): number | undefined {
  const raw = row[key];
  if (raw === null || raw === undefined) return undefined;
  const value = Number(raw);
  if (!Number.isSafeInteger(value)) {
    throw internal(`${entity} row has invalid optional ${key}.`);
  }
  return value;
}

function requireEnum<const Values extends readonly string[]>(
  value: string,
  values: Values,
  entity: string,
  field: string,
): Values[number] {
  if (!(values as readonly string[]).includes(value)) {
    throw internal(`${entity} row has unknown ${field} ${value}.`);
  }
  return value as Values[number];
}

function requireCanonicalId<T>(entity: string, operation: () => T): T {
  try {
    return operation();
  } catch (error) {
    throw internal(`${entity} row has a non-canonical identity.`, error);
  }
}

function requireVersionedFields(
  row: Readonly<Record<string, unknown>>,
  entity: string,
): { readonly version: number; readonly createdAt: string; readonly updatedAt: string } {
  return {
    version: requireRowInteger(row, 'version', entity, true),
    createdAt: requireRowString(row, 'created_at', entity),
    updatedAt: requireRowString(row, 'updated_at', entity),
  };
}

function requireSha256(value: string, entity: string, field: string): string {
  if (!/^sha256:[0-9a-f]{64}$/.test(value)) {
    throw internal(`${entity} row has invalid ${field}.`);
  }
  return value;
}

function requireGitObjectSha(
  value: string,
  format: GitObjectFormat,
  entity: string,
  field: string,
): string {
  const expectedLength = format === 'sha1' ? 40 : 64;
  if (!new RegExp(`^[0-9a-f]{${expectedLength}}$`).test(value)) {
    throw internal(`${entity} row has invalid ${field} for ${format}.`);
  }
  return value;
}

function requireTreeSha(value: string, entity: string): string {
  if (!/^(?:[0-9a-f]{40}|[0-9a-f]{64})$/.test(value)) {
    throw internal(`${entity} row has invalid result_tree_sha.`);
  }
  return value;
}

function decodeProcessIdentity(
  row: Readonly<Record<string, unknown>>,
  prefix: string,
  entity: string,
): ProcessIdentity | undefined {
  const bootId = optionalRowString(row, `${prefix}_boot_id`, entity);
  const pid = optionalRowInteger(row, `${prefix}_pid`, entity);
  const startTicks = optionalRowString(row, `${prefix}_start_ticks`, entity);
  const present = [bootId, pid, startTicks].filter((value) => value !== undefined).length;
  if (present === 0) return undefined;
  if (present !== 3 || bootId === undefined || pid === undefined || startTicks === undefined || pid <= 0) {
    throw internal(`${entity} row has incomplete ${prefix} process identity.`);
  }
  return { bootId, pid, startTicks };
}

function decodeWriteTrack(row: Readonly<Record<string, unknown>>): WriteTrack {
  const entity = 'WriteTrack';
  const idValue = requireRowString(row, 'id', entity);
  const id = requireCanonicalId(entity, () => requireWriteTrackId(idValue));
  const status = requireEnum(
    requireRowString(row, 'status', entity),
    WRITE_TRACK_STATUSES,
    entity,
    'status',
  ) as WriteTrackStatus;
  return {
    id,
    missionId: requireRowString(row, 'mission_id', entity),
    milestoneQualifiedId: requireRowString(row, 'milestone_qualified_id', entity),
    featureQualifiedId: requireRowString(row, 'feature_qualified_id', entity),
    contractHash: requireSha256(requireRowString(row, 'contract_hash', entity), entity, 'contract_hash'),
    status,
    ...requireVersionedFields(row, entity),
  };
}

function decodeAttempt(row: Readonly<Record<string, unknown>>): Attempt {
  const entity = 'Attempt';
  const writeTrackIdValue = requireRowString(row, 'write_track_id', entity);
  const writeTrackId = requireCanonicalId(entity, () => requireWriteTrackId(writeTrackIdValue));
  const ordinal = requireRowInteger(row, 'ordinal', entity, true);
  const idValue = requireRowString(row, 'id', entity);
  const id = requireCanonicalId(entity, () => requireAttemptId(idValue, writeTrackId));
  if (formatAttemptId(writeTrackId, ordinal) !== id) {
    throw internal(`${entity} row ordinal does not match its identity.`);
  }
  const gitObjectFormat = requireEnum(
    requireRowString(row, 'git_object_format', entity),
    GIT_OBJECT_FORMATS,
    entity,
    'git_object_format',
  ) as GitObjectFormat;
  const sourceStatus = requireEnum(
    requireRowString(row, 'source_status', entity),
    SOURCE_STATUSES,
    entity,
    'source_status',
  ) as SourceStatus;
  const sourcePath = optionalRowString(row, 'source_path', entity);
  const sourceFingerprint = optionalRowString(row, 'source_fingerprint', entity);
  if (sourceStatus === 'READY') {
    if (sourcePath === undefined || sourceFingerprint === undefined) {
      throw internal(`${entity} READY row lacks its source path or fingerprint.`);
    }
  } else if (sourcePath !== undefined || sourceFingerprint !== undefined) {
    throw internal(`${entity} non-READY row contains source material.`);
  }
  const status = requireEnum(
    requireRowString(row, 'status', entity),
    ATTEMPT_STATUSES,
    entity,
    'status',
  ) as AttemptStatus;
  return {
    id,
    writeTrackId,
    ordinal,
    contractHash: requireSha256(requireRowString(row, 'contract_hash', entity), entity, 'contract_hash'),
    gitObjectFormat,
    baseCommitSha: requireGitObjectSha(
      requireRowString(row, 'base_commit_sha', entity),
      gitObjectFormat,
      entity,
      'base_commit_sha',
    ),
    sourceStatus,
    ...(sourcePath === undefined ? {} : { sourcePath }),
    ...(sourceFingerprint === undefined ? {} : { sourceFingerprint }),
    status,
    ...requireVersionedFields(row, entity),
  };
}

function decodeWorkerRun(row: Readonly<Record<string, unknown>>): WorkerRun {
  const entity = 'WorkerRun';
  const attemptIdValue = requireRowString(row, 'attempt_id', entity);
  const attemptId = requireCanonicalId(entity, () => requireAttemptId(attemptIdValue));
  const ordinal = requireRowInteger(row, 'ordinal', entity, true);
  const idValue = requireRowString(row, 'id', entity);
  const id = requireCanonicalId(entity, () => requireWorkerRunId(idValue, attemptId));
  if (formatWorkerRunId(attemptId, ordinal) !== id) {
    throw internal(`${entity} row ordinal does not match its identity.`);
  }
  const status = requireEnum(
    requireRowString(row, 'status', entity),
    WORKER_RUN_STATUSES,
    entity,
    'status',
  ) as WorkerRunStatus;
  const processIdentity = decodeProcessIdentity(row, 'process', entity);
  const processStartedAt = optionalRowString(row, 'process_started_at', entity);
  const exitCode = optionalRowInteger(row, 'exit_code', entity);
  if ((processIdentity === undefined) !== (processStartedAt === undefined)) {
    throw internal(`${entity} row has incomplete process timing identity.`);
  }
  if ((status === 'RUNNING' || status === 'IDLE') && processIdentity === undefined) {
    throw internal(`${entity} ${status} row lacks process identity.`);
  }
  if (status === 'EXITED' && exitCode === undefined) {
    throw internal(`${entity} EXITED row lacks exit_code.`);
  }
  if (status !== 'EXITED' && exitCode !== undefined) {
    throw internal(`${entity} non-EXITED row contains exit_code.`);
  }
  return {
    id,
    attemptId,
    ordinal,
    contractHash: requireSha256(requireRowString(row, 'contract_hash', entity), entity, 'contract_hash'),
    status,
    ...(processIdentity === undefined ? {} : { processIdentity }),
    ...(processStartedAt === undefined ? {} : { processStartedAt }),
    ...(exitCode === undefined ? {} : { exitCode }),
    ...requireVersionedFields(row, entity),
  };
}

function decodeLease(row: Readonly<Record<string, unknown>>): Lease {
  const entity = 'Lease';
  const writeTrackIdValue = requireRowString(row, 'write_track_id', entity);
  const writeTrackId = requireCanonicalId(entity, () => requireWriteTrackId(writeTrackIdValue));
  const attemptIdValue = requireRowString(row, 'attempt_id', entity);
  const attemptId = requireCanonicalId(entity, () => requireAttemptId(attemptIdValue, writeTrackId));
  const idValue = requireRowString(row, 'id', entity);
  const id = requireCanonicalId(entity, () => requireLeaseId(idValue));
  const status = requireEnum(
    requireRowString(row, 'status', entity),
    LEASE_STATUSES,
    entity,
    'status',
  ) as LeaseStatus;
  const releaseIdempotencyKey = optionalRowString(row, 'release_idempotency_key', entity);
  const releaseInputHash = optionalRowString(row, 'release_input_hash', entity);
  if ((releaseIdempotencyKey === undefined) !== (releaseInputHash === undefined)) {
    throw internal(`${entity} row has incomplete release idempotency data.`);
  }
  if (releaseInputHash !== undefined) requireSha256(releaseInputHash, entity, 'release_input_hash');

  const externalLeaseId = optionalRowString(row, 'external_lease_id', entity);
  const worktreePath = optionalRowString(row, 'worktree_path', entity);
  const externalLeasedAt = optionalRowString(row, 'external_leased_at', entity);
  const externalCount = [externalLeaseId, worktreePath, externalLeasedAt]
    .filter((value) => value !== undefined).length;
  if (externalCount !== 0 && externalCount !== 3) {
    throw internal(`${entity} row has incomplete external Lease identity.`);
  }
  if (status === 'ACTIVE' && externalCount !== 3) {
    throw internal(`${entity} ACTIVE row lacks external Lease identity.`);
  }

  const rawActionKind = optionalRowString(row, 'action_kind', entity);
  const actionKind = rawActionKind === undefined
    ? undefined
    : requireEnum(rawActionKind, LEASE_ACTION_KINDS, entity, 'action_kind') as LeaseActionKind;
  const actionToken = optionalRowString(row, 'action_token', entity);
  const rawActionPhase = optionalRowString(row, 'action_phase', entity);
  const actionPhase = rawActionPhase === undefined
    ? undefined
    : requireEnum(rawActionPhase, LEASE_ACTION_PHASES, entity, 'action_phase') as LeaseActionPhase;
  const actionCount = [actionKind, actionToken, actionPhase].filter((value) => value !== undefined).length;
  if (actionCount !== 0 && actionCount !== 3) {
    throw internal(`${entity} row has incomplete action identity.`);
  }

  const actionOwner = decodeProcessIdentity(row, 'action_owner', entity);
  const actionRunner = decodeProcessIdentity(row, 'action_runner', entity);
  const generation = requireRowInteger(row, 'generation', entity, true);
  return {
    id,
    writeTrackId,
    attemptId,
    contractHash: requireSha256(requireRowString(row, 'contract_hash', entity), entity, 'contract_hash'),
    generation,
    status,
    grantIdempotencyKey: requireRowString(row, 'grant_idempotency_key', entity),
    grantInputHash: requireSha256(
      requireRowString(row, 'grant_input_hash', entity),
      entity,
      'grant_input_hash',
    ),
    ...(releaseIdempotencyKey === undefined ? {} : { releaseIdempotencyKey }),
    ...(releaseInputHash === undefined ? {} : { releaseInputHash }),
    holder: requireRowString(row, 'holder', entity),
    ...(externalLeaseId === undefined ? {} : { externalLeaseId }),
    ...(worktreePath === undefined ? {} : { worktreePath }),
    ...(externalLeasedAt === undefined ? {} : { externalLeasedAt }),
    ...(actionKind === undefined ? {} : { actionKind }),
    ...(actionToken === undefined ? {} : { actionToken }),
    ...(actionPhase === undefined ? {} : { actionPhase }),
    ...(actionOwner === undefined ? {} : { actionOwner }),
    ...(actionRunner === undefined ? {} : { actionRunner }),
    ...optionalLeaseReferences(row, entity),
    ...requireVersionedFields(row, entity),
  };
}

function optionalLeaseReferences(
  row: Readonly<Record<string, unknown>>,
  entity: string,
): Pick<
  Lease,
  | 'actionStartedRef'
  | 'actionResultRef'
  | 'releaseRequestedAt'
  | 'releaseObservedAt'
  | 'lastObservedAt'
  | 'lastErrorCode'
  | 'lastErrorRef'
> {
  const actionStartedRef = optionalRowString(row, 'action_started_ref', entity);
  const actionResultRef = optionalRowString(row, 'action_result_ref', entity);
  const releaseRequestedAt = optionalRowString(row, 'release_requested_at', entity);
  const releaseObservedAt = optionalRowString(row, 'release_observed_at', entity);
  const lastObservedAt = optionalRowString(row, 'last_observed_at', entity);
  const lastErrorCode = optionalRowString(row, 'last_error_code', entity);
  const lastErrorRef = optionalRowString(row, 'last_error_ref', entity);
  return {
    ...(actionStartedRef === undefined ? {} : { actionStartedRef }),
    ...(actionResultRef === undefined ? {} : { actionResultRef }),
    ...(releaseRequestedAt === undefined ? {} : { releaseRequestedAt }),
    ...(releaseObservedAt === undefined ? {} : { releaseObservedAt }),
    ...(lastObservedAt === undefined ? {} : { lastObservedAt }),
    ...(lastErrorCode === undefined ? {} : { lastErrorCode }),
    ...(lastErrorRef === undefined ? {} : { lastErrorRef }),
  };
}

function decodeCriterionIds(value: string): readonly string[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(value) as unknown;
  } catch (error) {
    throw internal('Claim row has invalid claimed_criteria_json.', error);
  }
  if (
    !Array.isArray(parsed)
    || parsed.length === 0
    || parsed.some((criterion) => typeof criterion !== 'string' || criterion.length === 0)
  ) {
    throw internal('Claim row has invalid claimed criteria.');
  }
  const criteria = parsed as string[];
  if (new Set(criteria).size !== criteria.length) {
    throw internal('Claim row has duplicate claimed criteria.');
  }
  return criteria;
}

function decodeClaim(row: Readonly<Record<string, unknown>>): Claim {
  const entity = 'Claim';
  const writeTrackIdValue = requireRowString(row, 'write_track_id', entity);
  const writeTrackId = requireCanonicalId(entity, () => requireWriteTrackId(writeTrackIdValue));
  const attemptIdValue = requireRowString(row, 'attempt_id', entity);
  const attemptId = requireCanonicalId(entity, () => requireAttemptId(attemptIdValue, writeTrackId));
  const workerRunIdValue = requireRowString(row, 'worker_run_id', entity);
  const workerRunId = requireCanonicalId(entity, () => requireWorkerRunId(workerRunIdValue, attemptId));
  const leaseIdValue = requireRowString(row, 'lease_id', entity);
  const leaseId = requireCanonicalId(entity, () => requireLeaseId(leaseIdValue));
  const ordinal = requireRowInteger(row, 'ordinal', entity, true);
  const idValue = requireRowString(row, 'id', entity);
  const id = requireCanonicalId(entity, () => requireClaimId(idValue, attemptId));
  if (formatClaimId(attemptId, ordinal) !== id) {
    throw internal(`${entity} row ordinal does not match its identity.`);
  }
  const status = requireRowString(row, 'status', entity);
  if (status !== 'OPEN') {
    throw internal(`${entity} row has unsupported M01 status ${status}.`);
  }
  return {
    id,
    writeTrackId,
    attemptId,
    workerRunId,
    leaseId,
    contractHash: requireSha256(requireRowString(row, 'contract_hash', entity), entity, 'contract_hash'),
    ordinal,
    status: 'OPEN',
    idempotencyKey: requireRowString(row, 'idempotency_key', entity),
    inputHash: requireSha256(requireRowString(row, 'input_hash', entity), entity, 'input_hash'),
    baseCommitSha: requireRowString(row, 'base_commit_sha', entity),
    resultTreeSha: requireTreeSha(requireRowString(row, 'result_tree_sha', entity), entity),
    claimedCriterionIds: decodeCriterionIds(requireRowString(row, 'claimed_criteria_json', entity)),
    ...requireVersionedFields(row, entity),
  };
}

function isSqliteConstraint(error: unknown): boolean {
  const candidate = error as { readonly code?: unknown; readonly message?: unknown };
  return (
    typeof candidate.code === 'string'
    && candidate.code.startsWith('SQLITE_CONSTRAINT')
  ) || (
    candidate.code === 'ERR_SQLITE_ERROR'
    && typeof candidate.message === 'string'
    && /constraint failed|not unique/i.test(candidate.message)
  );
}

function translateConstraint(
  error: unknown,
  code: MnfsErrorCode,
  message: string,
): never {
  if (error instanceof MnfsError) throw error;
  if (isSqliteConstraint(error)) throw new MnfsError(code, message);
  throw error;
}

function nextGlobalOrdinal(
  database: DatabaseSync,
  table: string,
  prefixLength: number,
): number {
  const row = database.prepare(`
    SELECT COALESCE(MAX(CAST(substr(id, ${prefixLength + 1}) AS INTEGER)), 0) + 1 AS next_ordinal
    FROM ${table}
  `).get() as { readonly next_ordinal?: unknown } | undefined;
  const ordinal = Number(row?.next_ordinal ?? 1);
  if (!Number.isSafeInteger(ordinal) || ordinal <= 0) {
    throw internal(`Could not allocate the next ${table} identity.`);
  }
  return ordinal;
}

function nextParentOrdinal(
  database: DatabaseSync,
  table: string,
  parentColumn: string,
  parentId: string,
): number {
  const row = database.prepare(`
    SELECT COALESCE(MAX(ordinal), 0) + 1 AS next_ordinal
    FROM ${table}
    WHERE ${parentColumn} = ?
  `).get(parentId) as { readonly next_ordinal?: unknown } | undefined;
  const ordinal = Number(row?.next_ordinal ?? 1);
  if (!Number.isSafeInteger(ordinal) || ordinal <= 0) {
    throw internal(`Could not allocate the next ${table} ordinal.`);
  }
  return ordinal;
}

function queryRow(
  database: DatabaseSync,
  sql: string,
  value: string,
): Readonly<Record<string, unknown>> | undefined {
  return database.prepare(sql).get(value) as Readonly<Record<string, unknown>> | undefined;
}

function numberOfChanges(result: Readonly<{ readonly changes: number | bigint }>): number {
  return Number(result.changes);
}

function requireCriteria(criteria: readonly string[]): readonly string[] {
  if (
    criteria.length === 0
    || criteria.some((criterion) => criterion.length === 0)
    || new Set(criteria).size !== criteria.length
  ) {
    throw new MnfsError('CLAIM_CONFLICT', 'Claim criteria must be non-empty and unique.');
  }
  return criteria;
}

export class ExecutionStore {
  readonly #database: DatabaseSync;
  readonly #transactions: SqliteTransaction;
  readonly #events: EventStore;

  constructor(
    database: DatabaseSync,
    transactions: SqliteTransaction,
    events: EventStore,
  ) {
    this.#database = database;
    this.#transactions = transactions;
    this.#events = events;
  }

  allocateWriteTrack(input: AllocateWriteTrackInput): WriteTrack {
    try {
      return this.#transactions.run(() => {
        void this.#events;
        const id = formatWriteTrackId(nextGlobalOrdinal(this.#database, 'write_tracks', 3));
        this.#database.prepare(`
          INSERT INTO write_tracks (
            id, mission_id, milestone_qualified_id, feature_qualified_id,
            contract_hash, status, version, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, 'ACTIVE', 1, ?, ?)
        `).run(
          id,
          input.missionId,
          input.milestoneQualifiedId,
          input.featureQualifiedId,
          input.contractHash,
          input.occurredAt,
          input.occurredAt,
        );
        return this.#requireWriteTrack(id);
      });
    } catch (error) {
      translateConstraint(error, 'WRITE_TRACK_CONFLICT', 'Could not allocate the Write Track.');
    }
  }

  getWriteTrack(id: string): WriteTrack | undefined {
    const row = queryRow(this.#database, 'SELECT * FROM write_tracks WHERE id = ?', id);
    return row === undefined ? undefined : decodeWriteTrack(row);
  }

  #requireWriteTrack(id: string): WriteTrack {
    const track = this.getWriteTrack(id);
    if (track === undefined) throw internal(`WriteTrack ${id} disappeared after persistence.`);
    return track;
  }

  setWriteTrackStatus(input: {
    readonly id: string;
    readonly expectedVersion: number;
    readonly status: WriteTrackStatus;
    readonly updatedAt: string;
  }): WriteTrack {
    return this.#transactions.run(() => {
      const result = this.#database.prepare(`
        UPDATE write_tracks
        SET status = ?, version = version + 1, updated_at = ?
        WHERE id = ? AND version = ?
      `).run(input.status, input.updatedAt, input.id, input.expectedVersion);
      if (numberOfChanges(result) !== 1) {
        throw new MnfsError('CONCURRENCY_CONFLICT', `Stale Write Track version for ${input.id}.`);
      }
      return this.#requireWriteTrack(input.id);
    });
  }

  allocateAttempt(input: AllocateAttemptInput): Attempt {
    try {
      return this.#transactions.run(() => {
        const trackId = requireWriteTrackId(input.writeTrackId);
        const ordinal = nextParentOrdinal(
          this.#database,
          'attempts',
          'write_track_id',
          trackId,
        );
        const id = formatAttemptId(trackId, ordinal);
        this.#database.prepare(`
          INSERT INTO attempts (
            id, write_track_id, ordinal, contract_hash, git_object_format,
            base_commit_sha, source_status, source_path, source_fingerprint,
            status, version, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, 'REQUESTED', NULL, NULL, 'OPEN', 1, ?, ?)
        `).run(
          id,
          trackId,
          ordinal,
          input.contractHash,
          input.gitObjectFormat,
          input.baseCommitSha,
          input.occurredAt,
          input.occurredAt,
        );
        return this.#requireAttempt(id);
      });
    } catch (error) {
      translateConstraint(error, 'ATTEMPT_CONFLICT', 'Could not allocate the Attempt.');
    }
  }

  getAttempt(id: string): Attempt | undefined {
    const row = queryRow(this.#database, 'SELECT * FROM attempts WHERE id = ?', id);
    return row === undefined ? undefined : decodeAttempt(row);
  }

  #requireAttempt(id: string): Attempt {
    const attempt = this.getAttempt(id);
    if (attempt === undefined) throw internal(`Attempt ${id} disappeared after persistence.`);
    return attempt;
  }

  setAttemptState(input: {
    readonly id: string;
    readonly expectedVersion: number;
    readonly status: AttemptStatus;
    readonly sourceStatus: SourceStatus;
    readonly sourcePath?: string;
    readonly sourceFingerprint?: string;
    readonly updatedAt: string;
  }): Attempt {
    return this.#transactions.run(() => {
      const result = this.#database.prepare(`
        UPDATE attempts
        SET status = ?, source_status = ?, source_path = ?, source_fingerprint = ?,
            version = version + 1, updated_at = ?
        WHERE id = ? AND version = ?
      `).run(
        input.status,
        input.sourceStatus,
        input.sourcePath ?? null,
        input.sourceFingerprint ?? null,
        input.updatedAt,
        input.id,
        input.expectedVersion,
      );
      if (numberOfChanges(result) !== 1) {
        throw new MnfsError('CONCURRENCY_CONFLICT', `Stale Attempt version for ${input.id}.`);
      }
      return this.#requireAttempt(input.id);
    });
  }

  allocateWorkerRun(input: AllocateWorkerRunInput): WorkerRun {
    try {
      return this.#transactions.run(() => {
        const attemptId = requireAttemptId(input.attemptId);
        const ordinal = nextParentOrdinal(
          this.#database,
          'worker_runs',
          'attempt_id',
          attemptId,
        );
        const id = formatWorkerRunId(attemptId, ordinal);
        this.#database.prepare(`
          INSERT INTO worker_runs (
            id, attempt_id, ordinal, contract_hash, status,
            process_boot_id, process_id, process_start_ticks, process_started_at,
            exit_code, version, created_at, updated_at
          ) VALUES (?, ?, ?, ?, 'STARTING', NULL, NULL, NULL, NULL, NULL, 1, ?, ?)
        `).run(
          id,
          attemptId,
          ordinal,
          input.contractHash,
          input.occurredAt,
          input.occurredAt,
        );
        return this.#requireWorkerRun(id);
      });
    } catch (error) {
      translateConstraint(error, 'WORKER_RUN_CONFLICT', 'Could not allocate the Worker Run.');
    }
  }

  getWorkerRun(id: string): WorkerRun | undefined {
    const row = queryRow(this.#database, 'SELECT * FROM worker_runs WHERE id = ?', id);
    return row === undefined ? undefined : decodeWorkerRun(row);
  }

  #requireWorkerRun(id: string): WorkerRun {
    const run = this.getWorkerRun(id);
    if (run === undefined) throw internal(`WorkerRun ${id} disappeared after persistence.`);
    return run;
  }

  setWorkerRunState(input: {
    readonly id: string;
    readonly expectedVersion: number;
    readonly status: WorkerRunStatus;
    readonly processIdentity?: ProcessIdentity;
    readonly processStartedAt?: string;
    readonly exitCode?: number;
    readonly updatedAt: string;
  }): WorkerRun {
    return this.#transactions.run(() => {
      const processIdentity = input.processIdentity;
      const result = this.#database.prepare(`
        UPDATE worker_runs
        SET status = ?,
            process_boot_id = ?, process_id = ?, process_start_ticks = ?,
            process_started_at = ?, exit_code = ?,
            version = version + 1, updated_at = ?
        WHERE id = ? AND version = ?
      `).run(
        input.status,
        processIdentity?.bootId ?? null,
        processIdentity?.pid ?? null,
        processIdentity?.startTicks ?? null,
        input.processStartedAt ?? null,
        input.exitCode ?? null,
        input.updatedAt,
        input.id,
        input.expectedVersion,
      );
      if (numberOfChanges(result) !== 1) {
        throw new MnfsError('CONCURRENCY_CONFLICT', `Stale Worker Run version for ${input.id}.`);
      }
      return this.#requireWorkerRun(input.id);
    });
  }

  allocateLease(input: AllocateLeaseInput): Lease {
    try {
      return this.#transactions.run(() => {
        const existingRow = queryRow(
          this.#database,
          'SELECT * FROM leases WHERE grant_idempotency_key = ?',
          input.grantIdempotencyKey,
        );
        if (existingRow !== undefined) {
          const existing = decodeLease(existingRow);
          if (
            existing.grantInputHash === input.grantInputHash
            && existing.writeTrackId === input.writeTrackId
            && existing.attemptId === input.attemptId
            && existing.contractHash === input.contractHash
            && existing.holder === input.holder
          ) return existing;
          throw new MnfsError(
            'LEASE_IDEMPOTENCY_CONFLICT',
            `Lease idempotency key ${input.grantIdempotencyKey} is bound to different input.`,
          );
        }

        const trackId = requireWriteTrackId(input.writeTrackId);
        const attemptId = requireAttemptId(input.attemptId, trackId);
        const id = formatLeaseId(nextGlobalOrdinal(this.#database, 'leases', 4));
        const generation = nextParentOrdinal(
          this.#database,
          'leases',
          'write_track_id',
          trackId,
        );
        this.#database.prepare(`
          INSERT INTO leases (
            id, write_track_id, attempt_id, contract_hash, generation, status,
            grant_idempotency_key, grant_input_hash,
            release_idempotency_key, release_input_hash,
            holder, external_lease_id, worktree_path, external_leased_at,
            action_kind, action_token, action_phase,
            action_owner_boot_id, action_owner_pid, action_owner_start_ticks,
            action_runner_boot_id, action_runner_pid, action_runner_start_ticks,
            action_started_ref, action_result_ref,
            release_requested_at, release_observed_at, last_observed_at,
            last_error_code, last_error_ref,
            version, created_at, updated_at
          ) VALUES (
            ?, ?, ?, ?, ?, 'REQUESTED', ?, ?, NULL, NULL, ?,
            NULL, NULL, NULL, NULL, NULL, NULL,
            NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
            NULL, NULL, NULL, NULL, NULL, 1, ?, ?
          )
        `).run(
          id,
          trackId,
          attemptId,
          input.contractHash,
          generation,
          input.grantIdempotencyKey,
          input.grantInputHash,
          input.holder,
          input.occurredAt,
          input.occurredAt,
        );
        return this.#requireLease(id);
      });
    } catch (error) {
      if (error instanceof MnfsError && error.code === 'LEASE_IDEMPOTENCY_CONFLICT') throw error;
      translateConstraint(error, 'LEASE_CONFLICT', 'Could not allocate the Lease.');
    }
  }

  getLease(id: string): Lease | undefined {
    const row = queryRow(this.#database, 'SELECT * FROM leases WHERE id = ?', id);
    return row === undefined ? undefined : decodeLease(row);
  }

  #requireLease(id: string): Lease {
    const lease = this.getLease(id);
    if (lease === undefined) throw internal(`Lease ${id} disappeared after persistence.`);
    return lease;
  }

  setLeaseState(input: {
    readonly id: string;
    readonly expectedVersion: number;
    readonly status: LeaseStatus;
    readonly externalLeaseId?: string;
    readonly worktreePath?: string;
    readonly externalLeasedAt?: string;
    readonly updatedAt: string;
  }): Lease {
    return this.#transactions.run(() => {
      const result = this.#database.prepare(`
        UPDATE leases
        SET status = ?, external_lease_id = ?, worktree_path = ?, external_leased_at = ?,
            version = version + 1, updated_at = ?
        WHERE id = ? AND version = ?
      `).run(
        input.status,
        input.externalLeaseId ?? null,
        input.worktreePath ?? null,
        input.externalLeasedAt ?? null,
        input.updatedAt,
        input.id,
        input.expectedVersion,
      );
      if (numberOfChanges(result) !== 1) {
        throw new MnfsError('CONCURRENCY_CONFLICT', `Stale Lease version for ${input.id}.`);
      }
      return this.#requireLease(input.id);
    });
  }

  allocateClaim(input: AllocateClaimInput): Claim {
    try {
      return this.#transactions.run(() => {
        const existingRow = queryRow(
          this.#database,
          'SELECT * FROM claims WHERE idempotency_key = ?',
          input.idempotencyKey,
        );
        if (existingRow !== undefined) {
          const existing = decodeClaim(existingRow);
          const sameCriteria = JSON.stringify(existing.claimedCriterionIds)
            === JSON.stringify(input.claimedCriterionIds);
          if (
            existing.inputHash === input.inputHash
            && existing.writeTrackId === input.writeTrackId
            && existing.attemptId === input.attemptId
            && existing.workerRunId === input.workerRunId
            && existing.leaseId === input.leaseId
            && existing.contractHash === input.contractHash
            && existing.baseCommitSha === input.baseCommitSha
            && existing.resultTreeSha === input.resultTreeSha
            && sameCriteria
          ) return existing;
          throw new MnfsError(
            'CLAIM_IDEMPOTENCY_CONFLICT',
            `Claim idempotency key ${input.idempotencyKey} is bound to different input.`,
          );
        }

        const criteria = requireCriteria(input.claimedCriterionIds);
        const trackId = requireWriteTrackId(input.writeTrackId);
        const attemptId = requireAttemptId(input.attemptId, trackId);
        const workerRunId = requireWorkerRunId(input.workerRunId, attemptId);
        const leaseId = requireLeaseId(input.leaseId);
        const attempt = this.getAttempt(attemptId);
        const run = this.getWorkerRun(workerRunId);
        const lease = this.getLease(leaseId);
        if (
          attempt === undefined
          || run === undefined
          || lease === undefined
          || attempt.writeTrackId !== trackId
          || attempt.contractHash !== input.contractHash
          || attempt.baseCommitSha !== input.baseCommitSha
          || run.attemptId !== attemptId
          || run.contractHash !== input.contractHash
          || lease.writeTrackId !== trackId
          || lease.attemptId !== attemptId
          || lease.contractHash !== input.contractHash
        ) {
          throw new MnfsError('CLAIM_CONFLICT', 'Claim ancestry or base binding is invalid.');
        }

        const ordinal = nextParentOrdinal(
          this.#database,
          'claims',
          'attempt_id',
          attemptId,
        );
        const id = formatClaimId(attemptId, ordinal);
        this.#database.prepare(`
          INSERT INTO claims (
            id, write_track_id, attempt_id, worker_run_id, lease_id,
            contract_hash, ordinal, status, idempotency_key, input_hash,
            base_commit_sha, result_tree_sha, claimed_criteria_json,
            version, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, 'OPEN', ?, ?, ?, ?, ?, 1, ?, ?)
        `).run(
          id,
          trackId,
          attemptId,
          workerRunId,
          leaseId,
          input.contractHash,
          ordinal,
          input.idempotencyKey,
          input.inputHash,
          input.baseCommitSha,
          input.resultTreeSha,
          JSON.stringify(criteria),
          input.occurredAt,
          input.occurredAt,
        );
        return this.#requireClaim(id);
      });
    } catch (error) {
      if (
        error instanceof MnfsError
        && (error.code === 'CLAIM_IDEMPOTENCY_CONFLICT' || error.code === 'CLAIM_CONFLICT')
      ) throw error;
      translateConstraint(error, 'CLAIM_CONFLICT', 'Could not allocate the Claim.');
    }
  }

  getClaim(id: string): Claim | undefined {
    const row = queryRow(this.#database, 'SELECT * FROM claims WHERE id = ?', id);
    return row === undefined ? undefined : decodeClaim(row);
  }

  #requireClaim(id: string): Claim {
    const claim = this.getClaim(id);
    if (claim === undefined) throw internal(`Claim ${id} disappeared after persistence.`);
    return claim;
  }
}
