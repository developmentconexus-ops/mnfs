import type { DatabaseSync } from 'node:sqlite';

import { MISSION_EVENT_TYPES_V1 } from '../domain/types.js';

interface Migration {
  readonly version: number;
  apply(database: DatabaseSync): void;
}

interface HistoricalEventRow {
  readonly seq: number;
  readonly eventId: string;
  readonly type: string;
  readonly missionId: string;
  readonly occurredAt: string;
  readonly payloadJson: string;
}

function sqlMigration(version: number, sql: string): Migration {
  return {
    version,
    apply(database) {
      database.exec(sql);
    },
  };
}

function historicalEvents(database: DatabaseSync): HistoricalEventRow[] {
  return database.prepare(`
    SELECT seq, event_id, type, mission_id, occurred_at, payload_json
    FROM events
    ORDER BY seq
  `).all().map((row) => ({
    seq: Number(row.seq),
    eventId: String(row.event_id),
    type: String(row.type),
    missionId: String(row.mission_id),
    occurredAt: String(row.occurred_at),
    payloadJson: String(row.payload_json),
  }));
}

function firstScalar(row: Readonly<Record<string, unknown>> | undefined): unknown {
  return row === undefined ? undefined : Object.values(row)[0];
}

function requireCleanDatabase(database: DatabaseSync): void {
  const foreignKeyFailures = database.prepare('PRAGMA foreign_key_check').all();
  if (foreignKeyFailures.length !== 0) {
    throw new Error(`Migration v4 produced ${foreignKeyFailures.length} foreign-key failures.`);
  }
  const integrity = String(firstScalar(
    database.prepare('PRAGMA integrity_check').get() as Readonly<Record<string, unknown>>,
  ));
  if (integrity !== 'ok') {
    throw new Error(`Migration v4 integrity check failed: ${integrity}.`);
  }
}

function applyMigration4(database: DatabaseSync): void {
  const beforeEvents = historicalEvents(database);

  database.exec(`
    CREATE TABLE event_types (
      type TEXT NOT NULL,
      payload_schema_version INTEGER NOT NULL CHECK (payload_schema_version > 0),
      PRIMARY KEY (type, payload_schema_version)
    );
  `);
  const insertEventType = database.prepare(`
    INSERT INTO event_types (type, payload_schema_version)
    VALUES (?, 1)
  `);
  for (const eventType of MISSION_EVENT_TYPES_V1) insertEventType.run(eventType);

  database.exec(`
    CREATE TABLE events_v4 (
      seq INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id TEXT NOT NULL UNIQUE,
      type TEXT NOT NULL,
      payload_schema_version INTEGER NOT NULL CHECK (payload_schema_version > 0),
      mission_id TEXT NOT NULL REFERENCES missions(id),
      occurred_at TEXT NOT NULL,
      payload_json TEXT NOT NULL CHECK (json_valid(payload_json)),
      FOREIGN KEY (type, payload_schema_version)
        REFERENCES event_types(type, payload_schema_version)
    );

    INSERT INTO events_v4 (
      seq,
      event_id,
      type,
      payload_schema_version,
      mission_id,
      occurred_at,
      payload_json
    )
    SELECT
      seq,
      event_id,
      type,
      1,
      mission_id,
      occurred_at,
      payload_json
    FROM events
    ORDER BY seq;

    DROP TABLE events;
    ALTER TABLE events_v4 RENAME TO events;
    CREATE INDEX events_mission_seq_idx ON events (mission_id, seq);

    CREATE TABLE write_tracks (
      id TEXT PRIMARY KEY,
      mission_id TEXT NOT NULL REFERENCES missions(id),
      milestone_qualified_id TEXT NOT NULL,
      feature_qualified_id TEXT NOT NULL,
      contract_hash TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'CLAIMED', 'ABANDONED')),
      version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE (id, contract_hash)
    );

    CREATE UNIQUE INDEX write_tracks_one_current_per_feature
    ON write_tracks (mission_id, feature_qualified_id)
    WHERE status IN ('ACTIVE', 'CLAIMED');

    CREATE TABLE attempts (
      id TEXT PRIMARY KEY,
      write_track_id TEXT NOT NULL,
      ordinal INTEGER NOT NULL CHECK (ordinal > 0),
      contract_hash TEXT NOT NULL,
      git_object_format TEXT NOT NULL CHECK (git_object_format IN ('sha1', 'sha256')),
      base_commit_sha TEXT NOT NULL,
      source_status TEXT NOT NULL CHECK (source_status IN ('REQUESTED', 'READY', 'DIVERGED')),
      source_path TEXT,
      source_fingerprint TEXT,
      status TEXT NOT NULL CHECK (status IN ('OPEN', 'SUPERSEDED', 'CLOSED', 'CANCELLED')),
      version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE (write_track_id, ordinal),
      UNIQUE (id, contract_hash),
      UNIQUE (id, write_track_id, contract_hash),
      UNIQUE (id, contract_hash, base_commit_sha),
      FOREIGN KEY (write_track_id, contract_hash)
        REFERENCES write_tracks(id, contract_hash),
      CHECK (
        (git_object_format = 'sha1' AND length(base_commit_sha) = 40)
        OR (git_object_format = 'sha256' AND length(base_commit_sha) = 64)
      ),
      CHECK (
        source_status != 'READY'
        OR (source_path IS NOT NULL AND source_fingerprint IS NOT NULL)
      )
    );

    CREATE UNIQUE INDEX attempts_one_open_per_track
    ON attempts (write_track_id)
    WHERE status = 'OPEN';

    CREATE TABLE worker_runs (
      id TEXT PRIMARY KEY,
      attempt_id TEXT NOT NULL,
      ordinal INTEGER NOT NULL CHECK (ordinal > 0),
      contract_hash TEXT NOT NULL,
      status TEXT NOT NULL CHECK (
        status IN ('STARTING', 'RUNNING', 'IDLE', 'EXITED', 'LOST', 'CANCELLED')
      ),
      process_boot_id TEXT,
      process_id INTEGER,
      process_start_ticks TEXT,
      process_started_at TEXT,
      exit_code INTEGER,
      version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE (attempt_id, ordinal),
      UNIQUE (id, contract_hash),
      UNIQUE (id, attempt_id, contract_hash),
      FOREIGN KEY (attempt_id, contract_hash)
        REFERENCES attempts(id, contract_hash),
      CHECK (
        status NOT IN ('RUNNING', 'IDLE')
        OR (
          process_boot_id IS NOT NULL
          AND process_id IS NOT NULL
          AND process_start_ticks IS NOT NULL
          AND process_started_at IS NOT NULL
        )
      ),
      CHECK (status != 'EXITED' OR exit_code IS NOT NULL)
    );

    CREATE UNIQUE INDEX worker_runs_one_current_per_attempt
    ON worker_runs (attempt_id)
    WHERE status IN ('STARTING', 'RUNNING', 'IDLE');

    CREATE TABLE leases (
      id TEXT PRIMARY KEY,
      write_track_id TEXT NOT NULL,
      attempt_id TEXT NOT NULL,
      contract_hash TEXT NOT NULL,
      generation INTEGER NOT NULL CHECK (generation > 0),
      status TEXT NOT NULL CHECK (
        status IN ('REQUESTED', 'ACTIVE', 'RELEASE_PENDING', 'RELEASED', 'DIVERGED')
      ),
      grant_idempotency_key TEXT NOT NULL,
      grant_input_hash TEXT NOT NULL,
      release_idempotency_key TEXT,
      release_input_hash TEXT,
      holder TEXT NOT NULL,
      external_lease_id TEXT,
      worktree_path TEXT,
      external_leased_at TEXT,
      action_kind TEXT CHECK (action_kind IN ('GRANT', 'RELEASE')),
      action_token TEXT,
      action_phase TEXT CHECK (action_phase IN ('CLAIMED', 'STARTED', 'FINISHED')),
      action_owner_boot_id TEXT,
      action_owner_pid INTEGER,
      action_owner_start_ticks TEXT,
      action_runner_boot_id TEXT,
      action_runner_pid INTEGER,
      action_runner_start_ticks TEXT,
      action_started_ref TEXT,
      action_result_ref TEXT,
      release_requested_at TEXT,
      release_observed_at TEXT,
      last_observed_at TEXT,
      last_error_code TEXT,
      last_error_ref TEXT,
      version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE (write_track_id, generation),
      UNIQUE (grant_idempotency_key),
      UNIQUE (release_idempotency_key),
      UNIQUE (external_lease_id),
      UNIQUE (id, contract_hash),
      UNIQUE (id, write_track_id, contract_hash),
      UNIQUE (id, attempt_id, write_track_id, contract_hash),
      FOREIGN KEY (write_track_id, contract_hash)
        REFERENCES write_tracks(id, contract_hash),
      FOREIGN KEY (attempt_id, write_track_id, contract_hash)
        REFERENCES attempts(id, write_track_id, contract_hash),
      CHECK (
        (release_idempotency_key IS NULL AND release_input_hash IS NULL)
        OR (release_idempotency_key IS NOT NULL AND release_input_hash IS NOT NULL)
      ),
      CHECK (
        (action_kind IS NULL AND action_token IS NULL AND action_phase IS NULL)
        OR (action_kind IS NOT NULL AND action_token IS NOT NULL AND action_phase IS NOT NULL)
      )
    );

    CREATE UNIQUE INDEX leases_one_current_per_track
    ON leases (write_track_id)
    WHERE status IN ('REQUESTED', 'ACTIVE', 'RELEASE_PENDING', 'DIVERGED');

    CREATE UNIQUE INDEX leases_one_action_token
    ON leases (action_token)
    WHERE action_token IS NOT NULL;

    CREATE TABLE claims (
      id TEXT PRIMARY KEY,
      write_track_id TEXT NOT NULL,
      attempt_id TEXT NOT NULL,
      worker_run_id TEXT NOT NULL,
      lease_id TEXT NOT NULL,
      contract_hash TEXT NOT NULL,
      ordinal INTEGER NOT NULL CHECK (ordinal > 0),
      status TEXT NOT NULL CHECK (
        status IN (
          'OPEN',
          'COMPLETED_BY_WORKER',
          'UNDER_VERIFICATION',
          'ACCEPTED',
          'REJECTED',
          'SUPERSEDED',
          'CANCELLED'
        )
      ),
      idempotency_key TEXT NOT NULL,
      input_hash TEXT NOT NULL,
      base_commit_sha TEXT NOT NULL,
      result_tree_sha TEXT NOT NULL,
      claimed_criteria_json TEXT NOT NULL
        CHECK (json_valid(claimed_criteria_json))
        CHECK (json_type(claimed_criteria_json) = 'array')
        CHECK (json_array_length(claimed_criteria_json) > 0),
      version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE (attempt_id, ordinal),
      UNIQUE (idempotency_key),
      UNIQUE (id, contract_hash),
      FOREIGN KEY (write_track_id, contract_hash)
        REFERENCES write_tracks(id, contract_hash),
      FOREIGN KEY (attempt_id, write_track_id, contract_hash)
        REFERENCES attempts(id, write_track_id, contract_hash),
      FOREIGN KEY (worker_run_id, attempt_id, contract_hash)
        REFERENCES worker_runs(id, attempt_id, contract_hash),
      FOREIGN KEY (lease_id, attempt_id, write_track_id, contract_hash)
        REFERENCES leases(id, attempt_id, write_track_id, contract_hash),
      FOREIGN KEY (attempt_id, contract_hash, base_commit_sha)
        REFERENCES attempts(id, contract_hash, base_commit_sha)
    );

    CREATE UNIQUE INDEX claims_one_current_per_attempt
    ON claims (attempt_id)
    WHERE status IN ('OPEN', 'COMPLETED_BY_WORKER', 'UNDER_VERIFICATION');
  `);

  const afterEvents = historicalEvents(database);
  if (JSON.stringify(afterEvents) !== JSON.stringify(beforeEvents)) {
    throw new Error('Migration v4 changed historical Event bytes or ordering.');
  }
  const invalidPayloadVersions = database.prepare(`
    SELECT COUNT(*) AS count
    FROM events
    WHERE payload_schema_version != 1
  `).get() as { readonly count: number } | undefined;
  if (Number(invalidPayloadVersions?.count ?? 0) !== 0) {
    throw new Error('Migration v4 assigned an invalid historical Event payload version.');
  }

  requireCleanDatabase(database);
}

const MIGRATIONS: readonly Migration[] = [
  sqlMigration(1, `
    CREATE TABLE missions (
      id TEXT PRIMARY KEY,
      goal TEXT NOT NULL CHECK (length(trim(goal)) > 0),
      status TEXT NOT NULL CHECK (status IN ('OPEN', 'CLOSED')),
      opened_at TEXT NOT NULL
    );

    CREATE TABLE events (
      seq INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id TEXT NOT NULL UNIQUE,
      type TEXT NOT NULL CHECK (type = 'MISSION_OPENED'),
      mission_id TEXT NOT NULL REFERENCES missions(id),
      occurred_at TEXT NOT NULL,
      payload_json TEXT NOT NULL CHECK (json_valid(payload_json))
    );

    CREATE INDEX events_mission_seq_idx ON events (mission_id, seq);
  `),
  sqlMigration(2, `
    ALTER TABLE events RENAME TO events_v1;

    CREATE TABLE events (
      seq INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id TEXT NOT NULL UNIQUE,
      type TEXT NOT NULL CHECK (type IN ('MISSION_OPENED', 'PLAN_REVISION_SAVED', 'PLAN_APPROVED')),
      mission_id TEXT NOT NULL REFERENCES missions(id),
      occurred_at TEXT NOT NULL,
      payload_json TEXT NOT NULL CHECK (json_valid(payload_json))
    );

    INSERT INTO events (seq, event_id, type, mission_id, occurred_at, payload_json)
    SELECT seq, event_id, type, mission_id, occurred_at, payload_json
    FROM events_v1;

    DROP TABLE events_v1;
    CREATE INDEX events_mission_seq_idx ON events (mission_id, seq);

    CREATE TABLE mission_plan_revisions (
      mission_id TEXT NOT NULL REFERENCES missions(id),
      revision INTEGER NOT NULL CHECK (revision > 0),
      status TEXT NOT NULL CHECK (status IN ('DRAFT', 'SUPERSEDED', 'APPROVED')),
      content_hash TEXT NOT NULL CHECK (content_hash GLOB 'sha256:*'),
      content_json TEXT NOT NULL CHECK (json_valid(content_json)),
      created_at TEXT NOT NULL,
      approved_at TEXT,
      PRIMARY KEY (mission_id, revision),
      UNIQUE (mission_id, content_hash),
      CHECK (
        (status = 'APPROVED' AND approved_at IS NOT NULL)
        OR (status != 'APPROVED' AND approved_at IS NULL)
      )
    );

    CREATE UNIQUE INDEX mission_plan_one_approved_idx
    ON mission_plan_revisions (mission_id)
    WHERE status = 'APPROVED';
  `),
  sqlMigration(3, `
    DROP INDEX mission_plan_one_approved_idx;
    CREATE INDEX mission_plan_approved_revision_idx
    ON mission_plan_revisions (mission_id, revision DESC)
    WHERE status = 'APPROVED';
  `),
  {
    version: 4,
    apply: applyMigration4,
  },
];

function currentVersions(database: DatabaseSync): Set<number> {
  return new Set(
    database
      .prepare('SELECT version FROM schema_migrations')
      .all()
      .map((row) => Number(row.version)),
  );
}

export function applyMigrations(database: DatabaseSync): void {
  database.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    PRAGMA busy_timeout = 5000;

    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL
    );
  `);

  const applied = currentVersions(database);
  for (const migration of MIGRATIONS) {
    if (applied.has(migration.version)) continue;

    database.exec('BEGIN IMMEDIATE');
    try {
      migration.apply(database);
      database
        .prepare('INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)')
        .run(migration.version, new Date().toISOString());
      if (migration.version === 4) database.exec('PRAGMA user_version = 4');
      database.exec('COMMIT');
      applied.add(migration.version);
    } catch (error) {
      if (database.isTransaction) database.exec('ROLLBACK');
      throw error;
    }
  }
}
