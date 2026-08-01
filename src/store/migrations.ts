import type { DatabaseSync } from 'node:sqlite';

interface Migration {
  readonly version: number;
  readonly sql: string;
}

const MIGRATIONS: readonly Migration[] = [
  {
    version: 1,
    sql: `
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
    `,
  },
  {
    version: 2,
    sql: `
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
    `,
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
      database.exec(migration.sql);
      database
        .prepare('INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)')
        .run(migration.version, new Date().toISOString());
      database.exec('COMMIT');
    } catch (error) {
      if (database.isTransaction) database.exec('ROLLBACK');
      throw error;
    }
  }
}
