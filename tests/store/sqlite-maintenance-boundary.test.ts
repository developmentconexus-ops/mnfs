import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';

import { SqliteStore } from '../../src/store/sqlite-store.js';

function createVersionOnlyV4Fixture(databasePath: string): void {
  const database = new DatabaseSync(databasePath);
  try {
    database.exec(`
      CREATE TABLE schema_migrations (
        version INTEGER PRIMARY KEY,
        applied_at TEXT NOT NULL
      );

      INSERT INTO schema_migrations (version, applied_at) VALUES
        (1, '2026-08-04T20:01:00.000Z'),
        (2, '2026-08-04T20:02:00.000Z'),
        (3, '2026-08-04T20:03:00.000Z'),
        (4, '2026-08-04T20:04:00.000Z');

      PRAGMA user_version = 4;
    `);
  } finally {
    database.close();
  }
}

function createCompleteV3Fixture(databasePath: string): void {
  const database = new DatabaseSync(databasePath);
  try {
    database.exec(`
      PRAGMA foreign_keys = ON;

      CREATE TABLE schema_migrations (
        version INTEGER PRIMARY KEY,
        applied_at TEXT NOT NULL
      );

      CREATE TABLE missions (
        id TEXT PRIMARY KEY,
        goal TEXT NOT NULL CHECK (length(trim(goal)) > 0),
        status TEXT NOT NULL CHECK (status IN ('OPEN', 'CLOSED')),
        opened_at TEXT NOT NULL
      );

      CREATE TABLE events (
        seq INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id TEXT NOT NULL UNIQUE,
        type TEXT NOT NULL CHECK (
          type IN ('MISSION_OPENED', 'PLAN_REVISION_SAVED', 'PLAN_APPROVED')
        ),
        mission_id TEXT NOT NULL REFERENCES missions(id),
        occurred_at TEXT NOT NULL,
        payload_json TEXT NOT NULL CHECK (json_valid(payload_json))
      );

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

      CREATE INDEX mission_plan_approved_revision_idx
      ON mission_plan_revisions (mission_id, revision DESC)
      WHERE status = 'APPROVED';

      INSERT INTO schema_migrations (version, applied_at) VALUES
        (1, '2026-08-04T20:01:00.000Z'),
        (2, '2026-08-04T20:02:00.000Z'),
        (3, '2026-08-04T20:03:00.000Z');

      PRAGMA user_version = 3;
    `);
  } finally {
    database.close();
  }
}

test('the current SqliteStore writer opens a complete v4 schema without migrating it again', async () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'mnfs-m01-v4-writer-'));
  try {
    const databasePath = path.join(directory, 'v4.db');
    const creator = SqliteStore.open(databasePath);
    creator.close();

    const before = new DatabaseSync(databasePath, { readOnly: true });
    const migrationRows = before.prepare(
      'SELECT version, applied_at FROM schema_migrations ORDER BY version',
    ).all();
    before.close();

    const current = SqliteStore.openCurrent(databasePath);
    current.close();

    const after = new DatabaseSync(databasePath, { readOnly: true });
    try {
      assert.deepEqual(
        after.prepare('SELECT version, applied_at FROM schema_migrations ORDER BY version').all(),
        migrationRows,
      );
      assert.deepEqual(
        after.prepare('SELECT version FROM schema_migrations ORDER BY version').all()
          .map((row) => Number(row.version)),
        [1, 2, 3, 4],
      );
      const version = after.prepare('PRAGMA user_version').get() as { readonly user_version: number };
      assert.equal(Number(version.user_version), 4);
    } finally {
      after.close();
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('the current SqliteStore writer rejects version-only v4 metadata without the v4 schema', async () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'mnfs-m01-v4-shape-'));
  try {
    const databasePath = path.join(directory, 'incomplete-v4.db');
    createVersionOnlyV4Fixture(databasePath);

    assert.throws(
      () => SqliteStore.openCurrent(databasePath),
      (error: unknown) => {
        assert.equal((error as { readonly code?: string }).code, 'SCHEMA_VERSION_UNSUPPORTED');
        return true;
      },
    );

    const database = new DatabaseSync(databasePath, { readOnly: true });
    try {
      assert.deepEqual(
        database.prepare('SELECT version FROM schema_migrations ORDER BY version').all()
          .map((row) => Number(row.version)),
        [1, 2, 3, 4],
      );
      const tableNames = database.prepare(`
        SELECT name FROM sqlite_master
        WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
        ORDER BY name
      `).all().map((row) => String(row.name));
      assert.deepEqual(tableNames, ['schema_migrations']);
    } finally {
      database.close();
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('SqliteStore.open never migrates an existing v3 database implicitly', async () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'mnfs-m01-v3-open-fence-'));
  try {
    const databasePath = path.join(directory, 'v3.db');
    createCompleteV3Fixture(databasePath);

    assert.throws(
      () => SqliteStore.open(databasePath),
      (error: unknown) => {
        assert.equal((error as { readonly code?: string }).code, 'SCHEMA_VERSION_UNSUPPORTED');
        return true;
      },
    );

    const database = new DatabaseSync(databasePath, { readOnly: true });
    try {
      assert.deepEqual(
        database.prepare('SELECT version FROM schema_migrations ORDER BY version').all()
          .map((row) => Number(row.version)),
        [1, 2, 3],
      );
      const version = database.prepare('PRAGMA user_version').get() as {
        readonly user_version: number;
      };
      assert.equal(Number(version.user_version), 3);
      assert.equal(
        Number((database.prepare(`
          SELECT COUNT(*) AS count
          FROM sqlite_master
          WHERE type = 'table' AND name = 'event_types'
        `).get() as { readonly count: number }).count),
        0,
      );
    } finally {
      database.close();
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
