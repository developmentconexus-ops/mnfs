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
