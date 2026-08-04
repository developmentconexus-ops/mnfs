import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';

import { SqliteStore } from '../../src/store/sqlite-store.js';

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
