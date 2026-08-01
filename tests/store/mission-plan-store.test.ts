import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { DatabaseSync } from 'node:sqlite';

import { MnfsError } from '../../src/domain/errors.js';
import { hashPlanContent, type MissionPlanContent } from '../../src/domain/mission-plan.js';
import { SqliteStore } from '../../src/store/sqlite-store.js';

function validPlan(title = 'Visual planning'): MissionPlanContent {
  return {
    schemaVersion: 1,
    missionId: 'MIS-001',
    title,
    goal: 'Build a reliable planning loop',
    successCriteria: ['The operator approves an exact plan hash'],
    scope: { included: ['Structured planning'], excluded: ['Worker execution'] },
    assumptions: ['Lavish runs on loopback'],
    milestones: [
      {
        id: 'M01',
        title: 'Planning',
        outcome: 'An approved plan',
        dependsOn: [],
        features: [
          {
            id: 'F01',
            title: 'Revision model',
            outcome: 'Plans are content addressed',
            acceptanceCriteria: ['A stale update is rejected'],
            dependsOn: [],
          },
        ],
      },
    ],
    risks: [],
    questions: [],
  };
}

function createStore(): { store: SqliteStore; databasePath: string } {
  const directory = mkdtempSync(join(tmpdir(), 'mnfs-plan-store-'));
  const databasePath = join(directory, 'mnfs.db');
  const store = SqliteStore.open(databasePath);
  store.openMission({
    missionId: 'MIS-001',
    eventId: 'EVT-MIS-001-OPEN',
    goal: 'Build visual planning',
    openedAt: '2026-07-31T20:00:00.000Z',
  });
  return { store, databasePath };
}

function expectCode(code: string, operation: () => unknown): void {
  assert.throws(operation, (error: unknown) => error instanceof MnfsError && error.code === code);
}

test('migration v2 creates revision storage and preserves v1 mission events', () => {
  const directory = mkdtempSync(join(tmpdir(), 'mnfs-migration-'));
  const databasePath = join(directory, 'mnfs.db');
  const database = new DatabaseSync(databasePath);
  database.exec(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE schema_migrations (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL);
    INSERT INTO schema_migrations VALUES (1, '2026-07-31T00:00:00.000Z');
    CREATE TABLE missions (
      id TEXT PRIMARY KEY,
      goal TEXT NOT NULL,
      status TEXT NOT NULL,
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
    INSERT INTO missions VALUES ('MIS-001', 'Existing mission', 'OPEN', '2026-07-31T00:00:00.000Z');
    INSERT INTO events (event_id, type, mission_id, occurred_at, payload_json)
      VALUES ('EVT-OLD', 'MISSION_OPENED', 'MIS-001', '2026-07-31T00:00:00.000Z', '{"goal":"Existing mission"}');
  `);
  database.close();

  const store = SqliteStore.open(databasePath);
  assert.equal(store.listEvents()[0]?.eventId, 'EVT-OLD');
  const revision = store.saveMissionPlanRevision({
    missionId: 'MIS-001',
    content: validPlan(),
    createdAt: '2026-07-31T20:01:00.000Z',
  });
  assert.equal(revision.revision, 1);
  store.close();
});

test('saves revision and matching event atomically', () => {
  const { store } = createStore();
  const content = validPlan();
  const revision = store.saveMissionPlanRevision({
    missionId: 'MIS-001',
    content,
    createdAt: '2026-07-31T20:01:00.000Z',
  });

  assert.equal(revision.revision, 1);
  assert.equal(revision.status, 'DRAFT');
  assert.equal(revision.contentHash, hashPlanContent(content));
  assert.deepEqual(store.getCurrentMissionPlan('MIS-001'), revision);
  const event = store.listEvents().find((candidate) => candidate.type === 'PLAN_REVISION_SAVED');
  assert.deepEqual(event?.payload, { revision: 1, contentHash: revision.contentHash });
  store.close();
});

test('creates sequential revisions, supersedes the previous revision, and deduplicates identical content', () => {
  const { store } = createStore();
  const first = store.saveMissionPlanRevision({
    missionId: 'MIS-001',
    content: validPlan(),
    createdAt: '2026-07-31T20:01:00.000Z',
  });
  const duplicate = store.saveMissionPlanRevision({
    missionId: 'MIS-001',
    content: validPlan(),
    createdAt: '2026-07-31T20:02:00.000Z',
  });
  assert.deepEqual(duplicate, first);

  const secondContent = validPlan('Visual planning revised');
  const second = store.saveMissionPlanRevision({
    missionId: 'MIS-001',
    content: secondContent,
    expectedPreviousHash: first.contentHash,
    createdAt: '2026-07-31T20:03:00.000Z',
  });
  assert.equal(second.revision, 2);
  assert.equal(second.status, 'DRAFT');
  assert.deepEqual(
    store.listMissionPlanRevisions('MIS-001').map(({ revision, status }) => ({ revision, status })),
    [
      { revision: 1, status: 'SUPERSEDED' },
      { revision: 2, status: 'DRAFT' },
    ],
  );
  assert.equal(store.listEvents().filter((event) => event.type === 'PLAN_REVISION_SAVED').length, 2);
  store.close();
});

test('rejects stale or missing expected hashes without rows or events', () => {
  const { store } = createStore();
  const first = store.saveMissionPlanRevision({
    missionId: 'MIS-001',
    content: validPlan(),
    createdAt: '2026-07-31T20:01:00.000Z',
  });
  const beforeEvents = store.listEvents().length;

  expectCode('PLAN_REVISION_CONFLICT', () =>
    store.saveMissionPlanRevision({
      missionId: 'MIS-001',
      content: validPlan('Missing expected hash'),
      createdAt: '2026-07-31T20:02:00.000Z',
    }),
  );
  expectCode('PLAN_REVISION_CONFLICT', () =>
    store.saveMissionPlanRevision({
      missionId: 'MIS-001',
      content: validPlan('Stale expected hash'),
      expectedPreviousHash: 'sha256:stale',
      createdAt: '2026-07-31T20:03:00.000Z',
    }),
  );

  assert.equal(store.listMissionPlanRevisions('MIS-001').length, 1);
  assert.equal(store.getCurrentMissionPlan('MIS-001')?.contentHash, first.contentHash);
  assert.equal(store.listEvents().length, beforeEvents);
  store.close();
});

test('rolls back revision when the matching event insert fails', () => {
  const { store, databasePath } = createStore();
  const control = new DatabaseSync(databasePath);
  control.exec(`
    CREATE TRIGGER fail_plan_event
    BEFORE INSERT ON events
    WHEN NEW.type = 'PLAN_REVISION_SAVED'
    BEGIN
      SELECT RAISE(ABORT, 'forced event failure');
    END;
  `);
  control.close();

  assert.throws(() =>
    store.saveMissionPlanRevision({
      missionId: 'MIS-001',
      content: validPlan(),
      createdAt: '2026-07-31T20:01:00.000Z',
    }),
  );
  assert.equal(store.listMissionPlanRevisions('MIS-001').length, 0);
  assert.equal(store.listEvents().filter((event) => event.type === 'PLAN_REVISION_SAVED').length, 0);
  store.close();
});

test('approves only the exact current hash and records one idempotent approval event', () => {
  const { store } = createStore();
  const revision = store.saveMissionPlanRevision({
    missionId: 'MIS-001',
    content: validPlan(),
    createdAt: '2026-07-31T20:01:00.000Z',
  });

  expectCode('PLAN_APPROVAL_CONFLICT', () =>
    store.approveMissionPlan({
      missionId: 'MIS-001',
      contentHash: 'sha256:wrong',
      approvedAt: '2026-07-31T20:02:00.000Z',
    }),
  );

  const approved = store.approveMissionPlan({
    missionId: 'MIS-001',
    contentHash: revision.contentHash,
    approvedAt: '2026-07-31T20:03:00.000Z',
  });
  const repeated = store.approveMissionPlan({
    missionId: 'MIS-001',
    contentHash: revision.contentHash,
    approvedAt: '2026-07-31T20:04:00.000Z',
  });

  assert.equal(approved.status, 'APPROVED');
  assert.equal(approved.approvedAt, '2026-07-31T20:03:00.000Z');
  assert.deepEqual(repeated, approved);
  assert.equal(store.listEvents().filter((event) => event.type === 'PLAN_APPROVED').length, 1);
  store.close();
});
