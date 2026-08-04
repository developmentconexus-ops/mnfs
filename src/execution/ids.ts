import { MnfsError } from '../domain/errors.js';

export type WriteTrackId = `WT-${string}`;
export type AttemptId = `${WriteTrackId}/A${string}`;
export type WorkerRunId = `${AttemptId}/WR${string}`;
export type ClaimId = `${AttemptId}/CLM${string}`;
export type LeaseId = `LSE-${string}`;

const WRITE_TRACK_PATTERN = /^WT-(\d{3,})$/;
const ATTEMPT_PATTERN = /^(WT-\d{3,})\/A(\d{2,})$/;
const WORKER_RUN_PATTERN = /^(WT-\d{3,}\/A\d{2,})\/WR(\d{2,})$/;
const CLAIM_PATTERN = /^(WT-\d{3,}\/A\d{2,})\/CLM(\d{2,})$/;
const LEASE_PATTERN = /^LSE-(\d{3,})$/;

function invalidIdentity(message: string): never {
  throw new MnfsError('EXECUTION_TARGET_INVALID', message);
}

function requirePositiveInteger(value: number, label: string): number {
  if (!Number.isSafeInteger(value) || value <= 0) {
    invalidIdentity(`${label} must be a positive safe integer; received ${value}.`);
  }
  return value;
}

function parseOrdinal(value: string, label: string): number {
  const ordinal = Number(value);
  return requirePositiveInteger(ordinal, label);
}

export function formatWriteTrackId(value: number): WriteTrackId {
  const ordinal = requirePositiveInteger(value, 'Write Track ordinal');
  return `WT-${String(ordinal).padStart(3, '0')}`;
}

export function formatAttemptId(writeTrackId: string, ordinal: number): AttemptId {
  const parent = requireWriteTrackId(writeTrackId);
  const value = requirePositiveInteger(ordinal, 'Attempt ordinal');
  return `${parent}/A${String(value).padStart(2, '0')}`;
}

export function formatWorkerRunId(attemptId: string, ordinal: number): WorkerRunId {
  const parent = requireAttemptId(attemptId);
  const value = requirePositiveInteger(ordinal, 'Worker Run ordinal');
  return `${parent}/WR${String(value).padStart(2, '0')}`;
}

export function formatClaimId(attemptId: string, ordinal: number): ClaimId {
  const parent = requireAttemptId(attemptId);
  const value = requirePositiveInteger(ordinal, 'Claim ordinal');
  return `${parent}/CLM${String(value).padStart(2, '0')}`;
}

export function formatLeaseId(value: number): LeaseId {
  const ordinal = requirePositiveInteger(value, 'Lease ordinal');
  return `LSE-${String(ordinal).padStart(3, '0')}`;
}

export function requireWriteTrackId(value: string): WriteTrackId {
  const match = WRITE_TRACK_PATTERN.exec(value);
  if (match === null || match[1] === undefined) {
    invalidIdentity(`Invalid Write Track id: ${value}.`);
  }
  const ordinal = parseOrdinal(match[1], 'Write Track ordinal');
  if (formatWriteTrackId(ordinal) !== value) {
    invalidIdentity(`Write Track id is not canonical: ${value}.`);
  }
  return value as WriteTrackId;
}

export function requireAttemptId(
  value: string,
  expectedWriteTrackId?: string,
): AttemptId {
  const match = ATTEMPT_PATTERN.exec(value);
  if (match === null || match[1] === undefined || match[2] === undefined) {
    invalidIdentity(`Invalid Attempt id: ${value}.`);
  }
  const parent = requireWriteTrackId(match[1]);
  const ordinal = parseOrdinal(match[2], 'Attempt ordinal');
  if (formatAttemptId(parent, ordinal) !== value) {
    invalidIdentity(`Attempt id is not canonical: ${value}.`);
  }
  if (expectedWriteTrackId !== undefined && parent !== requireWriteTrackId(expectedWriteTrackId)) {
    invalidIdentity(`Attempt ${value} does not belong to ${expectedWriteTrackId}.`);
  }
  return value as AttemptId;
}

export function requireWorkerRunId(
  value: string,
  expectedAttemptId?: string,
): WorkerRunId {
  const match = WORKER_RUN_PATTERN.exec(value);
  if (match === null || match[1] === undefined || match[2] === undefined) {
    invalidIdentity(`Invalid Worker Run id: ${value}.`);
  }
  const parent = requireAttemptId(match[1]);
  const ordinal = parseOrdinal(match[2], 'Worker Run ordinal');
  if (formatWorkerRunId(parent, ordinal) !== value) {
    invalidIdentity(`Worker Run id is not canonical: ${value}.`);
  }
  if (expectedAttemptId !== undefined && parent !== requireAttemptId(expectedAttemptId)) {
    invalidIdentity(`Worker Run ${value} does not belong to ${expectedAttemptId}.`);
  }
  return value as WorkerRunId;
}

export function requireClaimId(value: string, expectedAttemptId?: string): ClaimId {
  const match = CLAIM_PATTERN.exec(value);
  if (match === null || match[1] === undefined || match[2] === undefined) {
    invalidIdentity(`Invalid Claim id: ${value}.`);
  }
  const parent = requireAttemptId(match[1]);
  const ordinal = parseOrdinal(match[2], 'Claim ordinal');
  if (formatClaimId(parent, ordinal) !== value) {
    invalidIdentity(`Claim id is not canonical: ${value}.`);
  }
  if (expectedAttemptId !== undefined && parent !== requireAttemptId(expectedAttemptId)) {
    invalidIdentity(`Claim ${value} does not belong to ${expectedAttemptId}.`);
  }
  return value as ClaimId;
}

export function requireLeaseId(value: string): LeaseId {
  const match = LEASE_PATTERN.exec(value);
  if (match === null || match[1] === undefined) {
    invalidIdentity(`Invalid Lease id: ${value}.`);
  }
  const ordinal = parseOrdinal(match[1], 'Lease ordinal');
  if (formatLeaseId(ordinal) !== value) {
    invalidIdentity(`Lease id is not canonical: ${value}.`);
  }
  return value as LeaseId;
}
