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

export interface MissionOpenedEvent {
  readonly seq: number;
  readonly eventId: string;
  readonly type: 'MISSION_OPENED';
  readonly missionId: string;
  readonly occurredAt: string;
  readonly payload: { readonly goal: string };
}

export interface PlanRevisionSavedEvent {
  readonly seq: number;
  readonly eventId: string;
  readonly type: 'PLAN_REVISION_SAVED';
  readonly missionId: string;
  readonly occurredAt: string;
  readonly payload: { readonly revision: number; readonly contentHash: string };
}

export interface PlanApprovedEvent {
  readonly seq: number;
  readonly eventId: string;
  readonly type: 'PLAN_APPROVED';
  readonly missionId: string;
  readonly occurredAt: string;
  readonly payload: { readonly revision: number; readonly contentHash: string };
}

export type MissionEvent = MissionOpenedEvent | PlanRevisionSavedEvent | PlanApprovedEvent;

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
