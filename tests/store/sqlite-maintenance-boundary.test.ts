import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';

import { SqliteStore } from '../../src/store/sqlite-store.js';

function createV4Fixture(databasePath: string): void {
  const database = new DatabaseSync(databasePath);
  try {
    database.exec(`
      CREATE TABLE schema_migrations (
        version INTEGER PRIMARY KEY,
        applied_at TEXT NOT NULL
      );
    `);
    const insert = database.prepare(
      'INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)',
    );
    for (const version of [1, 2, 3, 4]) {
      insert.run(version, `2026-08-04T20:0${version}:00.000Z`);
    }
    database.exec('PRAGMA user_version = 4');
  } finally {
    database.close();
  }
}

test('the pre-v4 SqliteStore writer refuses a readable v4 schema', async () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'mnfs-m01-pre-v4-writer-'));
  try {
    const databasePath = path.join(directory, 'v4.db');
    createV4Fixture(databasePath);

    assert.throws(
      () => SqliteStore.openCurrent(databasePath),
      (error: unknown) => {
        assert.equal((error as { code?: string }).code, 'SCHEMA_VERSION_UNSUPPORTED');
        return true;
      },
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
