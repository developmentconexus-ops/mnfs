import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

import type { Mission, MissionEvent } from '../domain/types.js';
import { applyMigrations } from './migrations.js';

export interface OpenMissionInput {
  readonly missionId: string;
  readonly eventId: string;
  readonly goal: string;
  readonly openedAt: string;
}

export interface OpenNextMissionInput {
  readonly goal: string;
  readonly openedAt: string;
}

function missionFromRow(row: Readonly<Record<string, unknown>>): Mission {
  return {
    id: String(row.id),
    goal: String(row.goal),
    status: String(row.status) as Mission['status'],
    openedAt: String(row.opened_at),
  };
}

export class SqliteStore {
  readonly #database: DatabaseSync;

  private constructor(database: DatabaseSync) {
    this.#database = database;
  }

  static open(path: string): SqliteStore {
    mkdirSync(dirname(path), { recursive: true });
    const database = new DatabaseSync(path);
    applyMigrations(database);
    return new SqliteStore(database);
  }

  #transaction<T>(operation: () => T): T {
    this.#database.exec('BEGIN IMMEDIATE');
    try {
      const result = operation();
      this.#database.exec('COMMIT');
      return result;
    } catch (error) {
      if (this.#database.isTransaction) this.#database.exec('ROLLBACK');
      throw error;
    }
  }

  #insertMissionAndEvent(input: OpenMissionInput): Mission {
    const mission: Mission = {
      id: input.missionId,
      goal: input.goal,
      status: 'OPEN',
      openedAt: input.openedAt,
    };

    this.#database
      .prepare('INSERT INTO missions (id, goal, status, opened_at) VALUES (?, ?, ?, ?)')
      .run(mission.id, mission.goal, mission.status, mission.openedAt);
    this.#database
      .prepare(`
        INSERT INTO events (event_id, type, mission_id, occurred_at, payload_json)
        VALUES (?, 'MISSION_OPENED', ?, ?, ?)
      `)
      .run(input.eventId, mission.id, mission.openedAt, JSON.stringify({ goal: mission.goal }));

    return mission;
  }

  openMission(input: OpenMissionInput): Mission {
    return this.#transaction(() => this.#insertMissionAndEvent(input));
  }

  openNextMission(input: OpenNextMissionInput): Mission {
    return this.#transaction(() => {
      const row = this.#database
        .prepare(`
          SELECT COALESCE(MAX(CAST(substr(id, 5) AS INTEGER)), 0) + 1 AS next_number
          FROM missions
          WHERE id GLOB 'MIS-[0-9]*'
        `)
        .get();
      const nextNumber = Number(row?.next_number);
      const missionId = `MIS-${String(nextNumber).padStart(3, '0')}`;

      return this.#insertMissionAndEvent({
        missionId,
        eventId: `EVT-${missionId}-OPEN`,
        goal: input.goal,
        openedAt: input.openedAt,
      });
    });
  }

  listMissionStatuses(): Mission[] {
    return this.#database
      .prepare('SELECT id, goal, status, opened_at FROM missions ORDER BY id')
      .all()
      .map(missionFromRow);
  }

  listEvents(): MissionEvent[] {
    return this.#database
      .prepare(`
        SELECT seq, event_id, type, mission_id, occurred_at, payload_json
        FROM events
        ORDER BY seq
      `)
      .all()
      .map((row) => ({
        seq: Number(row.seq),
        eventId: String(row.event_id),
        type: String(row.type) as MissionEvent['type'],
        missionId: String(row.mission_id),
        occurredAt: String(row.occurred_at),
        payload: JSON.parse(String(row.payload_json)) as MissionEvent['payload'],
      }));
  }

  close(): void {
    this.#database.close();
  }
}
