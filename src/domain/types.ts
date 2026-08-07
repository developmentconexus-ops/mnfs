import type { MissionPlanRevision } from './mission-plan.js';

export interface PersistedProjectIdentity {
  schemaVersion: 1;
  repoId: string;
  createdAt: string;
}

export interface ProjectIdentity extends PersistedProjectIdentity {
  projectRoot: string;
}

export type MissionStatus = 'OPEN' | 'CLOSED';

export interface Mission {
  readonly id: string;
  readonly goal: string;
  readonly status: MissionStatus;
  readonly openedAt: string;
}

export const MISSION_EVENT_TYPES_V1 = [
  'MISSION_OPENED',
  'PLAN_REVISION_SAVED',
  'PLAN_APPROVED',
  'WRITE_TRACK_OPENED',
  'WRITE_TRACK_ABANDONED',
  'ATTEMPT_OPENED',
  'ATTEMPT_SUPERSEDED',
  'EXECUTION_SOURCE_REQUESTED',
  'EXECUTION_SOURCE_READY',
  'EXECUTION_SOURCE_DIVERGED',
  'WORKER_RUN_OPENED',
  'WORKER_RUN_STATE_CHANGED',
  'CLAIM_OPENED',
  'LEASE_REQUESTED',
  'LEASE_ACTION_CLAIMED',
  'LEASE_GRANTED',
  'LEASE_RELEASE_REQUESTED',
  'LEASE_RELEASED',
  'LEASE_DIVERGED',
] as const;

export type MissionEventType = (typeof MISSION_EVENT_TYPES_V1)[number];
export type M01ExecutionEventType = Exclude<
  MissionEventType,
  'MISSION_OPENED' | 'PLAN_REVISION_SAVED' | 'PLAN_APPROVED'
>;

interface VersionedMissionEvent {
  readonly seq: number;
  readonly eventId: string;
  readonly payloadSchemaVersion: 1;
  readonly missionId: string;
  readonly occurredAt: string;
}

export interface MissionOpenedEvent extends VersionedMissionEvent {
  readonly type: 'MISSION_OPENED';
  readonly payload: { readonly goal: string };
}

export interface PlanRevisionSavedEvent extends VersionedMissionEvent {
  readonly type: 'PLAN_REVISION_SAVED';
  readonly payload: { readonly revision: number; readonly contentHash: string };
}

export interface PlanApprovedEvent extends VersionedMissionEvent {
  readonly type: 'PLAN_APPROVED';
  readonly payload: { readonly revision: number; readonly contentHash: string };
}

export interface M01ExecutionEvent extends VersionedMissionEvent {
  readonly type: M01ExecutionEventType;
  readonly payload: Readonly<Record<string, unknown>>;
}

export type MissionEvent =
  | MissionOpenedEvent
  | PlanRevisionSavedEvent
  | PlanApprovedEvent
  | M01ExecutionEvent;

export interface ProjectStatus {
  readonly schemaVersion: 1;
  readonly missions: {
    readonly total: number;
    readonly open: number;
    readonly closed: number;
    readonly active: readonly Mission[];
  };
}

export interface SaveMissionPlanRevisionInput {
  readonly missionId: string;
  readonly content: MissionPlanRevision['content'];
  readonly createdAt: string;
  readonly expectedPreviousHash?: string;
}

export interface ApproveMissionPlanInput {
  readonly missionId: string;
  readonly contentHash: string;
  readonly approvedAt: string;
}
