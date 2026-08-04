import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

import { MnfsError } from '../domain/errors.js';
import {
  canonicalJson,
  hashPlanContent,
  validateMissionPlan,
  type MissionPlanRevision,
} from '../domain/mission-plan.js';
import type {
  ApproveMissionPlanInput,
  Mission,
  MissionEvent,
  SaveMissionPlanRevisionInput,
} from '../domain/types.js';
import { applyMigrations } from './migrations.js';
import { SqliteTransaction } from './sqlite-transaction.js';

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

function planRevisionFromRow(row: Readonly<Record<string, unknown>>): MissionPlanRevision {
  const missionId = String(row.mission_id);
  const approvedAt = row.approved_at === null || row.approved_at === undefined
    ? undefined
    : String(row.approved_at);
  return {
    missionId,
    revision: Number(row.revision),
    status: String(row.status) as MissionPlanRevision['status'],
    contentHash: String(row.content_hash),
    content: validateMissionPlan(JSON.parse(String(row.content_json)) as unknown, missionId),
    createdAt: String(row.created_at),
    ...(approvedAt === undefined ? {} : { approvedAt }),
  };
}

export class SqliteStore {
  readonly #database: DatabaseSync;
  readonly #transactions: SqliteTransaction;

  private constructor(database: DatabaseSync) {
    this.#database = database;
    this.#transactions = new SqliteTransaction(database);
  }

  static open(path: string): SqliteStore {
    mkdirSync(dirname(path), { recursive: true });
    const database = new DatabaseSync(path);
    applyMigrations(database);
    return new SqliteStore(database);
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

  #getCurrentMissionPlan(missionId: string): MissionPlanRevision | undefined {
    const row = this.#database
      .prepare(`
        SELECT mission_id, revision, status, content_hash, content_json, created_at, approved_at
        FROM mission_plan_revisions
        WHERE mission_id = ?
        ORDER BY revision DESC
        LIMIT 1
      `)
      .get(missionId);
    return row === undefined ? undefined : planRevisionFromRow(row);
  }

  #getLatestApprovedMissionPlan(missionId: string): MissionPlanRevision | undefined {
    const row = this.#database
      .prepare(`
        SELECT mission_id, revision, status, content_hash, content_json, created_at, approved_at
        FROM mission_plan_revisions
        WHERE mission_id = ? AND status = 'APPROVED'
        ORDER BY revision DESC
        LIMIT 1
      `)
      .get(missionId);
    return row === undefined ? undefined : planRevisionFromRow(row);
  }

  #getMissionPlanByHash(
    missionId: string,
    contentHash: string,
  ): MissionPlanRevision | undefined {
    const row = this.#database
      .prepare(`
        SELECT mission_id, revision, status, content_hash, content_json, created_at, approved_at
        FROM mission_plan_revisions
        WHERE mission_id = ? AND content_hash = ?
      `)
      .get(missionId, contentHash);
    return row === undefined ? undefined : planRevisionFromRow(row);
  }

  #requireOpenMission(missionId: string): void {
    const mission = this.#database.prepare('SELECT status FROM missions WHERE id = ?').get(missionId);
    if (mission === undefined || String(mission.status) !== 'OPEN') {
      throw new MnfsError('PLAN_NOT_FOUND', `Open mission ${missionId} was not found.`);
    }
  }

  openMission(input: OpenMissionInput): Mission {
    return this.#transactions.run(() => this.#insertMissionAndEvent(input));
  }

  openNextMission(input: OpenNextMissionInput): Mission {
    return this.#transactions.run(() => {
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

  saveMissionPlanRevision(input: SaveMissionPlanRevisionInput): MissionPlanRevision {
    return this.#transactions.run(() => {
      this.#requireOpenMission(input.missionId);
      const contentHash = hashPlanContent(input.content);
      const current = this.#getCurrentMissionPlan(input.missionId);
      const existing = this.#getMissionPlanByHash(input.missionId, contentHash);
      if (existing !== undefined) {
        if (current?.revision === existing.revision) return existing;
        throw new MnfsError(
          'PLAN_REVISION_CONFLICT',
          `Mission ${input.missionId} content matches historical revision ${existing.revision}; revisions cannot rewind.`,
        );
      }

      if (current === undefined) {
        if (input.expectedPreviousHash !== undefined) {
          throw new MnfsError(
            'PLAN_REVISION_CONFLICT',
            `Mission ${input.missionId} has no previous plan matching ${input.expectedPreviousHash}.`,
          );
        }
      } else if (input.expectedPreviousHash !== current.contentHash) {
        throw new MnfsError(
          'PLAN_REVISION_CONFLICT',
          `Expected previous hash ${current.contentHash} for mission ${input.missionId}.`,
        );
      }

      const revisionNumber = (current?.revision ?? 0) + 1;
      if (current?.status === 'DRAFT') {
        this.#database
          .prepare(`
            UPDATE mission_plan_revisions
            SET status = 'SUPERSEDED'
            WHERE mission_id = ? AND revision = ? AND status = 'DRAFT'
          `)
          .run(input.missionId, current.revision);
      }

      const revision: MissionPlanRevision = {
        missionId: input.missionId,
        revision: revisionNumber,
        status: 'DRAFT',
        contentHash,
        content: input.content,
        createdAt: input.createdAt,
      };
      this.#database
        .prepare(`
          INSERT INTO mission_plan_revisions (
            mission_id, revision, status, content_hash, content_json, created_at, approved_at
          ) VALUES (?, ?, 'DRAFT', ?, ?, ?, NULL)
        `)
        .run(
          revision.missionId,
          revision.revision,
          revision.contentHash,
          canonicalJson(revision.content),
          revision.createdAt,
        );
      this.#database
        .prepare(`
          INSERT INTO events (event_id, type, mission_id, occurred_at, payload_json)
          VALUES (?, 'PLAN_REVISION_SAVED', ?, ?, ?)
        `)
        .run(
          `EVT-${input.missionId}-PLAN-R${String(revisionNumber).padStart(4, '0')}`,
          input.missionId,
          input.createdAt,
          JSON.stringify({ revision: revisionNumber, contentHash }),
        );

      return revision;
    });
  }

  getCurrentMissionPlan(missionId: string): MissionPlanRevision | undefined {
    return this.#getCurrentMissionPlan(missionId);
  }

  getLatestApprovedMissionPlan(missionId: string): MissionPlanRevision | undefined {
    return this.#getLatestApprovedMissionPlan(missionId);
  }

  listMissionPlanRevisions(missionId: string): MissionPlanRevision[] {
    return this.#database
      .prepare(`
        SELECT mission_id, revision, status, content_hash, content_json, created_at, approved_at
        FROM mission_plan_revisions
        WHERE mission_id = ?
        ORDER BY revision
      `)
      .all(missionId)
      .map(planRevisionFromRow);
  }

  approveMissionPlan(input: ApproveMissionPlanInput): MissionPlanRevision {
    return this.#transactions.run(() => {
      this.#requireOpenMission(input.missionId);
      const current = this.#getCurrentMissionPlan(input.missionId);
      if (current === undefined) {
        throw new MnfsError('PLAN_NOT_FOUND', `Mission ${input.missionId} has no plan to approve.`);
      }
      if (current.status === 'APPROVED') {
        if (current.contentHash === input.contentHash) return current;
        throw new MnfsError(
          'PLAN_APPROVAL_CONFLICT',
          `Mission ${input.missionId} is already approved at ${current.contentHash}.`,
        );
      }
      if (current.contentHash !== input.contentHash) {
        throw new MnfsError(
          'PLAN_APPROVAL_CONFLICT',
          `Current plan hash is ${current.contentHash}, not ${input.contentHash}.`,
        );
      }

      this.#database
        .prepare(`
          UPDATE mission_plan_revisions
          SET status = 'APPROVED', approved_at = ?
          WHERE mission_id = ? AND revision = ? AND status = 'DRAFT'
        `)
        .run(input.approvedAt, input.missionId, current.revision);
      this.#database
        .prepare(`
          INSERT INTO events (event_id, type, mission_id, occurred_at, payload_json)
          VALUES (?, 'PLAN_APPROVED', ?, ?, ?)
        `)
        .run(
          `EVT-${input.missionId}-PLAN-APPROVED-R${String(current.revision).padStart(4, '0')}`,
          input.missionId,
          input.approvedAt,
          JSON.stringify({ revision: current.revision, contentHash: current.contentHash }),
        );

      return {
        ...current,
        status: 'APPROVED',
        approvedAt: input.approvedAt,
      };
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
      })) as MissionEvent[];
  }

  close(): void {
    this.#database.close();
  }
}
