import { MnfsError, type MnfsErrorCode } from '../domain/errors.js';
import type {
  AttemptStatus,
  LeaseStatus,
  SourceStatus,
  WorkerRunStatus,
  WriteTrackStatus,
} from './model.js';

const WRITE_TRACK_STATES = ['ACTIVE', 'CLAIMED', 'ABANDONED'] as const;
const ATTEMPT_STATES = ['OPEN', 'SUPERSEDED', 'CLOSED', 'CANCELLED'] as const;
const SOURCE_STATES = ['REQUESTED', 'READY', 'DIVERGED'] as const;
const WORKER_RUN_STATES = [
  'STARTING',
  'RUNNING',
  'IDLE',
  'EXITED',
  'LOST',
  'CANCELLED',
] as const;
const LEASE_STATES = [
  'REQUESTED',
  'ACTIVE',
  'RELEASE_PENDING',
  'RELEASED',
  'DIVERGED',
] as const;

const WRITE_TRACK_TRANSITIONS: Readonly<Record<WriteTrackStatus, ReadonlySet<WriteTrackStatus>>> = {
  ACTIVE: new Set(['CLAIMED', 'ABANDONED']),
  CLAIMED: new Set(),
  ABANDONED: new Set(),
};

const ATTEMPT_TRANSITIONS: Readonly<Record<AttemptStatus, ReadonlySet<AttemptStatus>>> = {
  OPEN: new Set(['SUPERSEDED', 'CLOSED', 'CANCELLED']),
  SUPERSEDED: new Set(),
  CLOSED: new Set(),
  CANCELLED: new Set(),
};

const SOURCE_TRANSITIONS: Readonly<Record<SourceStatus, ReadonlySet<SourceStatus>>> = {
  REQUESTED: new Set(['READY', 'DIVERGED']),
  READY: new Set(['DIVERGED']),
  DIVERGED: new Set(),
};

const WORKER_RUN_TRANSITIONS: Readonly<Record<WorkerRunStatus, ReadonlySet<WorkerRunStatus>>> = {
  STARTING: new Set(['RUNNING', 'EXITED', 'LOST', 'CANCELLED']),
  RUNNING: new Set(['IDLE', 'EXITED', 'LOST', 'CANCELLED']),
  IDLE: new Set(['RUNNING', 'EXITED', 'LOST', 'CANCELLED']),
  EXITED: new Set(),
  LOST: new Set(),
  CANCELLED: new Set(),
};

const LEASE_TRANSITIONS: Readonly<Record<LeaseStatus, ReadonlySet<LeaseStatus>>> = {
  REQUESTED: new Set(['ACTIVE', 'DIVERGED']),
  ACTIVE: new Set(['RELEASE_PENDING', 'DIVERGED']),
  RELEASE_PENDING: new Set(['RELEASED', 'DIVERGED']),
  RELEASED: new Set(),
  DIVERGED: new Set(),
};

function requireState<T extends string>(
  value: string,
  states: readonly T[],
  label: string,
  errorCode: MnfsErrorCode,
): T {
  if (!(states as readonly string[]).includes(value)) {
    throw new MnfsError(errorCode, `Unknown ${label} state: ${value}.`);
  }
  return value as T;
}

function requireTransition<T extends string>(
  from: string,
  to: string,
  states: readonly T[],
  transitions: Readonly<Record<T, ReadonlySet<T>>>,
  label: string,
  errorCode: MnfsErrorCode,
): T {
  const current = requireState(from, states, label, errorCode);
  const next = requireState(to, states, label, errorCode);
  if (!transitions[current].has(next)) {
    throw new MnfsError(errorCode, `Invalid ${label} transition: ${current} -> ${next}.`);
  }
  return next;
}

export function requireWriteTrackTransition(from: string, to: string): WriteTrackStatus {
  return requireTransition(
    from,
    to,
    WRITE_TRACK_STATES,
    WRITE_TRACK_TRANSITIONS,
    'Write Track',
    'WRITE_TRACK_CONFLICT',
  );
}

export function requireAttemptTransition(from: string, to: string): AttemptStatus {
  return requireTransition(
    from,
    to,
    ATTEMPT_STATES,
    ATTEMPT_TRANSITIONS,
    'Attempt',
    'ATTEMPT_CONFLICT',
  );
}

export function requireSourceTransition(from: string, to: string): SourceStatus {
  return requireTransition(
    from,
    to,
    SOURCE_STATES,
    SOURCE_TRANSITIONS,
    'execution source',
    'EXECUTION_SOURCE_INVALID',
  );
}

export function requireWorkerRunTransition(from: string, to: string): WorkerRunStatus {
  return requireTransition(
    from,
    to,
    WORKER_RUN_STATES,
    WORKER_RUN_TRANSITIONS,
    'Worker Run',
    'WORKER_RUN_CONFLICT',
  );
}

export function requireLeaseTransition(from: string, to: string): LeaseStatus {
  return requireTransition(
    from,
    to,
    LEASE_STATES,
    LEASE_TRANSITIONS,
    'Lease',
    'LEASE_CONFLICT',
  );
}
