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

export interface MissionEvent {
  readonly seq: number;
  readonly eventId: string;
  readonly type: 'MISSION_OPENED';
  readonly missionId: string;
  readonly occurredAt: string;
  readonly payload: { readonly goal: string };
}

export interface ProjectStatus {
  readonly schemaVersion: 1;
  readonly missions: {
    readonly total: number;
    readonly open: number;
    readonly closed: number;
    readonly active: readonly Mission[];
  };
}
