import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';

import { SqliteStore } from '../../src/store/sqlite-store.js';

function databasePath(): string {
  return join(mkdtempSync(join(tmpdir(), 'mnfs-store-')), 'mnfs.db');
}

test('opening the store applies migration v1 with required tables and pragmas', () => {
  const path = databasePath();
  const store = SqliteStore.open(path);
  store.close();

  const db = new DatabaseSync(path);
  const tables = db.prepare(`
    SELECT name FROM sqlite_master
    WHERE type = 'table' AND name IN ('schema_migrations', 'missions', 'events')
    ORDER BY name
  `).all().map((row) => (row as { name: string }).name);
  const migration = db.prepare('SELECT version FROM schema_migrations ORDER BY version DESC').get() as {
    version: number;
  };
  const foreignKeys = db.prepare('PRAGMA foreign_keys').get() as { foreign_keys: number };
  const journal = db.prepare('PRAGMA journal_mode').get() as { journal_mode: string };
  db.close();

  assert.deepEqual(tables, ['events', 'missions', 'schema_migrations']);
  assert.equal(migration.version, 4);
  assert.equal(foreignKeys.foreign_keys, 1);
  assert.equal(journal.journal_mode.toLowerCase(), 'wal');
});

test('openMission commits the mission and matching event in one transaction', () => {
  const path = databasePath();
  const store = SqliteStore.open(path);

  const mission = store.openMission({
    missionId: 'MIS-001',
    eventId: 'EVT-MIS-001-OPEN',
    goal: 'Prove durable mission state',
    openedAt: '2026-07-31T18:40:00.000Z',
  });

  assert.deepEqual(mission, {
    id: 'MIS-001',
    goal: 'Prove durable mission state',
    status: 'OPEN',
    openedAt: '2026-07-31T18:40:00.000Z',
  });
  assert.deepEqual(store.listMissionStatuses(), [mission]);
  assert.deepEqual(store.listEvents(), [
    {
      seq: 1,
      eventId: 'EVT-MIS-001-OPEN',
      type: 'MISSION_OPENED',
      payloadSchemaVersion: 1,
      missionId: 'MIS-001',
      occurredAt: '2026-07-31T18:40:00.000Z',
      payload: { goal: 'Prove durable mission state' },
    },
  ]);
  store.close();
});

test('an event insertion failure rolls back the mission row', () => {
  const path = databasePath();
  const store = SqliteStore.open(path);
  store.openMission({
    missionId: 'MIS-001',
    eventId: 'duplicate-event-id',
    goal: 'First mission',
    openedAt: '2026-07-31T18:40:00.000Z',
  });

  assert.throws(() => store.openMission({
    missionId: 'MIS-002',
    eventId: 'duplicate-event-id',
    goal: 'Must roll back',
    openedAt: '2026-07-31T18:41:00.000Z',
  }));

  assert.deepEqual(store.listMissionStatuses().map((mission) => mission.id), ['MIS-001']);
  assert.equal(store.listEvents().length, 1);
  store.close();
});

test('a fresh store instance reads the committed mission', () => {
  const path = databasePath();
  const first = SqliteStore.open(path);
  first.openMission({
    missionId: 'MIS-001',
    eventId: 'EVT-MIS-001-OPEN',
    goal: 'Survive restart',
    openedAt: '2026-07-31T18:40:00.000Z',
  });
  first.close();

  const second = SqliteStore.open(path);
  assert.deepEqual(second.listMissionStatuses(), [
    {
      id: 'MIS-001',
      goal: 'Survive restart',
      status: 'OPEN',
      openedAt: '2026-07-31T18:40:00.000Z',
    },
  ]);
  second.close();
});
