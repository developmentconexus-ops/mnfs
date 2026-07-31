import type { Mission, ProjectStatus } from '../domain/types.js';
import type { SqliteStore } from '../store/sqlite-store.js';

export interface MissionServiceOptions {
  readonly now?: () => string;
}

export class MissionService {
  readonly #store: SqliteStore;
  readonly #now: () => string;

  constructor(store: SqliteStore, options: MissionServiceOptions = {}) {
    this.#store = store;
    this.#now = options.now ?? (() => new Date().toISOString());
  }

  openMission(input: { readonly goal: string }): Mission {
    return this.#store.openNextMission({ goal: input.goal, openedAt: this.#now() });
  }

  getStatus(): ProjectStatus {
    const missions = this.#store.listMissionStatuses();
    const active = missions.filter((mission) => mission.status === 'OPEN');
    return {
      schemaVersion: 1,
      missions: {
        total: missions.length,
        open: active.length,
        closed: missions.length - active.length,
        active,
      },
    };
  }
}
