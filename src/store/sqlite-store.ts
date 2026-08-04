import { existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

import { MnfsError } from '../domain/errors.js';
import {
  canonicalJson,
  hashPlanContent,
  validateMissionPlan,
  type MissionPlanRevision,
} from '../domain/mission-plan.js';
import {
  MISSION_EVENT_TYPES_V1,
  type ApproveMissionPlanInput,
  type Mission,
  type MissionEvent,
  type SaveMissionPlanRevisionInput,
} from '../domain/types.js';
import { EventStore } from './event-store.js';
import { ExecutionStore } from './execution-store.js';
import { inspectSupportedDatabaseSchema } from './sqlite-maintenance.js';
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

const CURRENT_WRITE_SCHEMA_VERSION = 4;

const CURRENT_WRITE_TABLE_COLUMNS = {
  schema_migrations: ['version', 'applied_at'],
  missions: ['id', 'goal', 'status', 'opened_at'],
  events: [
    'seq',
    'event_id',
    'type',
    'payload_schema_version',
    'mission_id',
    'occurred_at',
    'payload_json',
  ],
  mission_plan_revisions: [
    'mission_id',
    'revision',
    'status',
    'content_hash',
    'content_json',
    'created_at',
    'approved_at',
  ],
  event_types: ['type', 'payload_schema_version'],
  write_tracks: [
    'id',
    'mission_id',
    'milestone_qualified_id',
    'feature_qualified_id',
    'contract_hash',
    'status',
    'version',
    'created_at',
    'updated_at',
  ],
  attempts: [
    'id',
    'write_track_id',
    'ordinal',
    'contract_hash',
    'git_object_format',
    'base_commit_sha',
    'source_status',
    'source_path',
    'source_fingerprint',
    'status',
    'version',
    'created_at',
    'updated_at',
  ],
  worker_runs: [
    'id',
    'attempt_id',
    'ordinal',
    'contract_hash',
    'status',
    'process_boot_id',
    'process_id',
    'process_start_ticks',
    'process_started_at',
    'exit_code',
    'version',
    'created_at',
    'updated_at',
  ],
  leases: [
    'id',
    'write_track_id',
    'attempt_id',
    'contract_hash',
    'generation',
    'status',
    'grant_idempotency_key',
    'grant_input_hash',
    'release_idempotency_key',
    'release_input_hash',
    'holder',
    'external_lease_id',
    'worktree_path',
    'external_leased_at',
    'action_kind',
    'action_token',
    'action_phase',
    'action_owner_boot_id',
    'action_owner_pid',
    'action_owner_start_ticks',
    'action_runner_boot_id',
    'action_runner_pid',
    'action_runner_start_ticks',
    'action_started_ref',
    'action_result_ref',
    'release_requested_at',
    'release_observed_at',
    'last_observed_at',
    'last_error_code',
    'last_error_ref',
    'version',
    'created_at',
    'updated_at',
  ],
  claims: [
    'id',
    'write_track_id',
    'attempt_id',
    'worker_run_id',
    'lease_id',
    'contract_hash',
    'ordinal',
    'status',
    'idempotency_key',
    'input_hash',
    'base_commit_sha',
    'result_tree_sha',
    'claimed_criteria_json',
    'version',
    'created_at',
    'updated_at',
  ],
} as const;

const CURRENT_WRITE_INDEXES = [
  'events_mission_seq_idx',
  'mission_plan_approved_revision_idx',
  'write_tracks_one_current_per_feature',
  'attempts_one_open_per_track',
  'worker_runs_one_current_per_attempt',
  'leases_one_current_per_track',
  'leases_one_action_token',
  'claims_one_current_per_attempt',
] as const;

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

function quoteIdentifier(identifier: string): string {
  return `"${identifier.replaceAll('"', '""')}"`;
}

function sameStrings(actual: readonly string[], expected: readonly string[]): boolean {
  return actual.length === expected.length
    && actual.every((value, index) => value === expected[index]);
}

function requireCurrentWriteSchemaShape(database: DatabaseSync): void {
  for (const [tableName, expectedColumns] of Object.entries(CURRENT_WRITE_TABLE_COLUMNS)) {
    const actualColumns = database.prepare(`PRAGMA table_info(${quoteIdentifier(tableName)})`)
      .all()
      .map((row) => String(row.name));
    if (!sameStrings(actualColumns, expectedColumns)) {
      throw new MnfsError(
        'SCHEMA_VERSION_UNSUPPORTED',
        `SQLite schema v4 table ${tableName} has columns [${actualColumns.join(', ')}], expected [${
          expectedColumns.join(', ')
        }].`,
      );
    }
  }

  const indexNames = new Set(database.prepare(`
    SELECT name
    FROM sqlite_master
    WHERE type = 'index'
  `).all().map((row) => String(row.name)));
  for (const indexName of CURRENT_WRITE_INDEXES) {
    if (!indexNames.has(indexName)) {
      throw new MnfsError(
        'SCHEMA_VERSION_UNSUPPORTED',
        `SQLite schema v4 is missing required index ${indexName}.`,
      );
    }
  }

  const registeredEventTypes = database.prepare(`
    SELECT type, payload_schema_version
    FROM event_types
    ORDER BY type, payload_schema_version
  `).all().map((row) => `${String(row.type)}@${Number(row.payload_schema_version)}`);
  const expectedEventTypes = [...MISSION_EVENT_TYPES_V1]
    .sort()
    .map((eventType) => `${eventType}@1`);
  if (!sameStrings(registeredEventTypes, expectedEventTypes)) {
    throw new MnfsError(
      'SCHEMA_VERSION_UNSUPPORTED',
      'SQLite schema v4 Event registry does not match the accepted version-1 registry.',
    );
  }
}

function requireCurrentWriteSchema(database: DatabaseSync): void {
  const schema = inspectSupportedDatabaseSchema(database, true);
  if (schema.schemaVersion !== CURRENT_WRITE_SCHEMA_VERSION) {
    throw new MnfsError(
      'SCHEMA_VERSION_UNSUPPORTED',
      `This MNFS writer supports schema ${CURRENT_WRITE_SCHEMA_VERSION}, not ${schema.schemaVersion}.`,
    );
  }
  requireCurrentWriteSchemaShape(database);
}

export class SqliteStore {
  readonly #database: DatabaseSync;
  readonly #transactions: SqliteTransaction;
  readonly #events: EventStore;
  readonly execution: ExecutionStore;

  private constructor(database: DatabaseSync) {
    this.#database = database;
    this.#transactions = new SqliteTransaction(database);
    this.#events = new EventStore(database);
    this.execution = new ExecutionStore(database, this.#transactions, this.#events);
  }

  static open(path: string): SqliteStore {
    mkdirSync(dirname(path), { recursive: true });
    const databaseAlreadyExists = existsSync(path);
    const database = new DatabaseSync(path);
    try {
      if (databaseAlreadyExists) {
        requireCurrentWriteSchema(database);
      } else {
        applyMigrations(database);
        requireCurrentWriteSchema(database);
      }
      return new SqliteStore(database);
    } catch (error) {
      database.close();
      throw error;
    }
  }

  static openCurrent(path: string): SqliteStore {
    let verifier: DatabaseSync | undefined;
    try {
      verifier = new DatabaseSync(path, { readOnly: true });
      requireCurrentWriteSchema(verifier);
    } finally {
      verifier?.close();
    }

    const database = new DatabaseSync(path);
    try {
      requireCurrentWriteSchema(database);
      database.exec('PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;');
      return new SqliteStore(database);
    } catch (error) {
      database.close();
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
    this.#events.append({
      eventId: input.eventId,
      type: 'MISSION_OPENED',
      payloadSchemaVersion: 1,
      missionId: mission.id,
      occurredAt: mission.openedAt,
      payload: { goal: mission.goal },
    });

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
      this.#events.append({
        eventId: `EVT-${input.missionId}-PLAN-R${String(revisionNumber).padStart(4, '0')}`,
        type: 'PLAN_REVISION_SAVED',
        payloadSchemaVersion: 1,
        missionId: input.missionId,
        occurredAt: input.createdAt,
        payload: { revision: revisionNumber, contentHash },
      });

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
      this.#events.append({
        eventId: `EVT-${input.missionId}-PLAN-APPROVED-R${String(current.revision).padStart(4, '0')}`,
        type: 'PLAN_APPROVED',
        payloadSchemaVersion: 1,
        missionId: input.missionId,
        occurredAt: input.approvedAt,
        payload: { revision: current.revision, contentHash: current.contentHash },
      });

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
    return this.#events.list();
  }

  close(): void {
    this.#database.close();
  }
}
