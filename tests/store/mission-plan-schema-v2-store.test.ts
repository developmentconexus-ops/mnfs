import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { DatabaseSync } from 'node:sqlite';

import { MnfsError } from '../../src/domain/errors.js';
import { canonicalJson, hashPlanContent } from '../../src/domain/mission-plan.js';
import { applyMigrations } from '../../src/store/migrations.js';
import { SqliteStore } from '../../src/store/sqlite-store.js';
import { validPlanV1, validPlanV2 } from '../fixtures/mission-plans.js';

function openMission(store: SqliteStore): void {
  store.openMission({
    missionId: 'MIS-001',
    eventId: 'EVT-MIS-001-OPEN',
    goal: 'Evolve the plan contract',
    openedAt: '2026-08-02T12:00:00.000Z',
  });
}

function expectCode(code: string, operation: () => unknown): void {
  assert.throws(
    operation,
    (error: unknown) => error instanceof MnfsError && error.code === code,
  );
}

test('migration v3 preserves an approved v1 row and permits a later approved v2 revision', () => {
  const directory = mkdtempSync(join(tmpdir(), 'mnfs-plan-v3-migration-'));
  const databasePath = join(directory, 'mnfs.db');
  const database = new DatabaseSync(databasePath);
  database.exec(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE schema_migrations (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL);
    INSERT INTO schema_migrations VALUES (1, '2026-07-31T00:00:00.000Z');
    INSERT INTO schema_migrations VALUES (2, '2026-07-31T01:00:00.000Z');
    CREATE TABLE missions (
      id TEXT PRIMARY KEY,
      goal TEXT NOT NULL,
      status TEXT NOT NULL,
      opened_at TEXT NOT NULL
    );
    CREATE TABLE events (
      seq INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id TEXT NOT NULL UNIQUE,
      type TEXT NOT NULL,
      mission_id TEXT NOT NULL REFERENCES missions(id),
      occurred_at TEXT NOT NULL,
      payload_json TEXT NOT NULL CHECK (json_valid(payload_json))
    );
    CREATE INDEX events_mission_seq_idx ON events (mission_id, seq);
    CREATE TABLE mission_plan_revisions (
      mission_id TEXT NOT NULL REFERENCES missions(id),
      revision INTEGER NOT NULL,
      status TEXT NOT NULL,
      content_hash TEXT NOT NULL,
      content_json TEXT NOT NULL CHECK (json_valid(content_json)),
      created_at TEXT NOT NULL,
      approved_at TEXT,
      PRIMARY KEY (mission_id, revision),
      UNIQUE (mission_id, content_hash)
    );
    CREATE UNIQUE INDEX mission_plan_one_approved_idx
      ON mission_plan_revisions (mission_id)
      WHERE status = 'APPROVED';
  `);
  database
    .prepare('INSERT INTO missions VALUES (?, ?, ?, ?)')
    .run('MIS-001', 'Evolve the plan contract', 'OPEN', '2026-07-31T00:00:00.000Z');
  database
    .prepare(`
      INSERT INTO events (event_id, type, mission_id, occurred_at, payload_json)
      VALUES (?, ?, ?, ?, ?)
    `)
    .run(
      'EVT-MIS-001-OPEN',
      'MISSION_OPENED',
      'MIS-001',
      '2026-07-31T00:00:00.000Z',
      JSON.stringify({ goal: 'Evolve the plan contract' }),
    );
  const historical = validPlanV1();
  database
    .prepare(`
      INSERT INTO mission_plan_revisions
        (mission_id, revision, status, content_hash, content_json, created_at, approved_at)
      VALUES (?, 1, 'APPROVED', ?, ?, ?, ?)
    `)
    .run(
      'MIS-001',
      hashPlanContent(historical),
      canonicalJson(historical),
      '2026-07-31T01:00:00.000Z',
      '2026-07-31T02:00:00.000Z',
    );
  applyMigrations(database);
  database.close();

  const store = SqliteStore.open(databasePath);
  const approvedV1 = store.getLatestApprovedMissionPlan('MIS-001');
  assert.equal(approvedV1?.content.schemaVersion, 1);
  assert.ok(approvedV1 !== undefined);

  const v2 = store.saveMissionPlanRevision({
    missionId: 'MIS-001',
    content: validPlanV2(),
    expectedPreviousHash: approvedV1.contentHash,
    createdAt: '2026-08-02T12:01:00.000Z',
  });
  const approvedV2 = store.approveMissionPlan({
    missionId: 'MIS-001',
    contentHash: v2.contentHash,
    approvedAt: '2026-08-02T12:02:00.000Z',
  });

  assert.equal(approvedV2.content.schemaVersion, 2);
  assert.deepEqual(
    store.listMissionPlanRevisions('MIS-001').map(({ revision, status }) => ({ revision, status })),
    [
      { revision: 1, status: 'APPROVED' },
      { revision: 2, status: 'APPROVED' },
    ],
  );
  assert.equal(store.getLatestApprovedMissionPlan('MIS-001')?.revision, 2);
  store.close();
});

test('a fresh store process recovers the exact normalized schema v2 revision', () => {
  const directory = mkdtempSync(join(tmpdir(), 'mnfs-plan-v2-recovery-'));
  const databasePath = join(directory, 'mnfs.db');
  const first = SqliteStore.open(databasePath);
  openMission(first);
  const saved = first.saveMissionPlanRevision({
    missionId: 'MIS-001',
    content: validPlanV2(),
    createdAt: '2026-08-02T12:01:00.000Z',
  });
  first.close();

  const recovered = SqliteStore.open(databasePath);
  const current = recovered.getCurrentMissionPlan('MIS-001');
  assert.deepEqual(current, saved);
  assert.equal(current?.content.schemaVersion, 2);
  if (current?.content.schemaVersion === 2) {
    assert.equal(current.content.milestones[0]?.qualifiedId, 'MIS-001/M01');
  }
  recovered.close();
});

test('saving a replan requires the exact current approved hash and never rewinds history', () => {
  const directory = mkdtempSync(join(tmpdir(), 'mnfs-plan-v2-replan-'));
  const store = SqliteStore.open(join(directory, 'mnfs.db'));
  openMission(store);
  const v1 = store.saveMissionPlanRevision({
    missionId: 'MIS-001',
    content: validPlanV1(),
    createdAt: '2026-08-02T12:01:00.000Z',
  });
  store.approveMissionPlan({
    missionId: 'MIS-001',
    contentHash: v1.contentHash,
    approvedAt: '2026-08-02T12:02:00.000Z',
  });

  expectCode('PLAN_REVISION_CONFLICT', () =>
    store.saveMissionPlanRevision({
      missionId: 'MIS-001',
      content: validPlanV2(),
      expectedPreviousHash: 'sha256:stale',
      createdAt: '2026-08-02T12:03:00.000Z',
    }),
  );

  const v2 = store.saveMissionPlanRevision({
    missionId: 'MIS-001',
    content: validPlanV2(),
    expectedPreviousHash: v1.contentHash,
    createdAt: '2026-08-02T12:04:00.000Z',
  });
  assert.equal(v2.revision, 2);

  expectCode('PLAN_REVISION_CONFLICT', () =>
    store.saveMissionPlanRevision({
      missionId: 'MIS-001',
      content: validPlanV1(),
      expectedPreviousHash: v2.contentHash,
      createdAt: '2026-08-02T12:05:00.000Z',
    }),
  );
  store.close();
});
