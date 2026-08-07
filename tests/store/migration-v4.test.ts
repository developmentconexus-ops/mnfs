import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';

import {
  canonicalJson,
  hashPlanContent,
  type MissionPlanContentV1,
} from '../../src/domain/mission-plan.js';
import { applyMigrations } from '../../src/store/migrations.js';
import { SqliteStore } from '../../src/store/sqlite-store.js';
import { M01_FIXTURE } from '../support/m01-fixtures.js';

const OCCURRED_AT = '2026-08-04T20:20:00.000Z';
const CONTRACT_HASH = M01_FIXTURE.contractHash;
const BASE_COMMIT_ONE = '1'.repeat(40);
const BASE_COMMIT_TWO = '2'.repeat(40);
const RESULT_TREE = '3'.repeat(40);

const EVENT_TYPES_V1 = [
  'MISSION_OPENED',
  'PLAN_REVISION_SAVED',
  'PLAN_APPROVED',
  'WRITE_TRACK_OPENED',
  'WRITE_TRACK_ABANDONED',
  'ATTEMPT_OPENED',
  'ATTEMPT_SUPERSEDED',
  'EXECUTION_SOURCE_REQUESTED',
  'EXECUTION_SOURCE_READY',
  'EXECUTION_SOURCE_DIVERGED',
  'WORKER_RUN_OPENED',
  'WORKER_RUN_STATE_CHANGED',
  'CLAIM_OPENED',
  'LEASE_REQUESTED',
  'LEASE_ACTION_CLAIMED',
  'LEASE_GRANTED',
  'LEASE_RELEASE_REQUESTED',
  'LEASE_RELEASED',
  'LEASE_DIVERGED',
] as const;

interface HistoricalSnapshot {
  readonly missions: readonly unknown[];
  readonly events: readonly unknown[];
  readonly planRevisions: readonly unknown[];
}

interface DatabaseFixture {
  readonly name: string;
  readonly create: (databasePath: string) => void;
}

function temporaryDatabasePath(prefix: string): string {
  const directory = mkdtempSync(path.join(tmpdir(), `mnfs-m01-v4-${prefix}-`));
  return path.join(directory, 'mnfs.db');
}

function removeDatabaseDirectory(databasePath: string): void {
  rmSync(path.dirname(databasePath), { recursive: true, force: true });
}

function firstScalar(row: Readonly<Record<string, unknown>> | undefined): unknown {
  return row === undefined ? undefined : Object.values(row)[0];
}

function tableExists(database: DatabaseSync, tableName: string): boolean {
  const row = database.prepare(`
    SELECT COUNT(*) AS count
    FROM sqlite_master
    WHERE type = 'table' AND name = ?
  `).get(tableName) as { readonly count: number } | undefined;
  return Number(row?.count ?? 0) === 1;
}

function tableNames(database: DatabaseSync): string[] {
  return database.prepare(`
    SELECT name
    FROM sqlite_master
    WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
    ORDER BY name
  `).all().map((row) => String(row.name));
}

function columnNames(database: DatabaseSync, tableName: string): string[] {
  return database.prepare(`PRAGMA table_info("${tableName}")`)
    .all()
    .map((row) => String(row.name));
}

function tableSql(database: DatabaseSync, tableName: string): string {
  const row = database.prepare(`
    SELECT sql
    FROM sqlite_master
    WHERE type = 'table' AND name = ?
  `).get(tableName) as { readonly sql?: string } | undefined;
  return String(row?.sql ?? '');
}

function normalizeSql(sql: string): string {
  return sql.replaceAll(/\s+/g, ' ').trim().toLowerCase();
}

function appliedMigrations(database: DatabaseSync): number[] {
  if (!tableExists(database, 'schema_migrations')) return [];
  return database.prepare('SELECT version FROM schema_migrations ORDER BY version')
    .all()
    .map((row) => Number(row.version));
}

function userVersion(database: DatabaseSync): number {
  return Number(firstScalar(
    database.prepare('PRAGMA user_version').get() as Readonly<Record<string, unknown>>,
  ));
}

function createV1Schema(database: DatabaseSync): void {
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
      type TEXT NOT NULL CHECK (type = 'MISSION_OPENED'),
      mission_id TEXT NOT NULL REFERENCES missions(id),
      occurred_at TEXT NOT NULL,
      payload_json TEXT NOT NULL CHECK (json_valid(payload_json))
    );

    CREATE INDEX events_mission_seq_idx ON events (mission_id, seq);

    INSERT INTO schema_migrations (version, applied_at)
    VALUES (1, '2026-07-31T18:40:00.000Z');
  `);
}

function createV3Schema(database: DatabaseSync): void {
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
      (1, '2026-07-31T18:40:00.000Z'),
      (2, '2026-08-01T09:00:00.000Z'),
      (3, '2026-08-02T09:00:00.000Z');

    PRAGMA user_version = 3;
  `);
}

function seedMissionOpened(
  database: DatabaseSync,
  missionId: string,
  goal: string,
  eventId: string,
  occurredAt: string,
): void {
  database.prepare(`
    INSERT INTO missions (id, goal, status, opened_at)
    VALUES (?, ?, 'OPEN', ?)
  `).run(missionId, goal, occurredAt);
  database.prepare(`
    INSERT INTO events (event_id, type, mission_id, occurred_at, payload_json)
    VALUES (?, 'MISSION_OPENED', ?, ?, ?)
  `).run(eventId, missionId, occurredAt, `{"goal":${JSON.stringify(goal)}}`);
}

function createEmptyFixture(databasePath: string): void {
  new DatabaseSync(databasePath).close();
}

function createM0Fixture(databasePath: string): void {
  const database = new DatabaseSync(databasePath);
  try {
    createV1Schema(database);
    seedMissionOpened(
      database,
      'MIS-001',
      'Preserve the M0 mission',
      'EVT-MIS-001-OPEN',
      '2026-07-31T18:40:00.000Z',
    );
  } finally {
    database.close();
  }
}

function createM1V3Fixture(databasePath: string): void {
  const database = new DatabaseSync(databasePath);
  try {
    createV3Schema(database);
    seedMissionOpened(
      database,
      'MIS-001',
      'Preserve the M1 plan',
      'EVT-MIS-001-OPEN',
      '2026-08-01T09:10:00.000Z',
    );
    const contentHash = `sha256:${'a'.repeat(64)}`;
    const contentJson = '{"schemaVersion":1,"missionId":"MIS-001","title":"M1"}';
    database.prepare(`
      INSERT INTO mission_plan_revisions (
        mission_id, revision, status, content_hash, content_json, created_at, approved_at
      ) VALUES ('MIS-001', 1, 'DRAFT', ?, ?, ?, NULL)
    `).run(contentHash, contentJson, '2026-08-01T09:20:00.000Z');
    database.prepare(`
      INSERT INTO events (event_id, type, mission_id, occurred_at, payload_json)
      VALUES ('EVT-MIS-001-PLAN-R0001', 'PLAN_REVISION_SAVED', 'MIS-001', ?, ?)
    `).run(
      '2026-08-01T09:20:00.000Z',
      `{"revision":1,"contentHash":${JSON.stringify(contentHash)}}`,
    );
  } finally {
    database.close();
  }
}

function createRevision5Fixture(databasePath: string): void {
  const database = new DatabaseSync(databasePath);
  try {
    createV3Schema(database);
    seedMissionOpened(
      database,
      'MIS-002',
      'Deliver the secure one-worker vertical slice',
      'EVT-MIS-002-OPEN',
      '2026-08-03T19:00:00.000Z',
    );
    const contentJson = '{"schemaVersion":2,"missionId":"MIS-002","revision":5}';
    database.prepare(`
      INSERT INTO mission_plan_revisions (
        mission_id, revision, status, content_hash, content_json, created_at, approved_at
      ) VALUES ('MIS-002', 5, 'APPROVED', ?, ?, ?, ?)
    `).run(CONTRACT_HASH, contentJson, OCCURRED_AT, OCCURRED_AT);
    database.prepare(`
      INSERT INTO events (event_id, type, mission_id, occurred_at, payload_json)
      VALUES ('EVT-MIS-002-PLAN-R0005', 'PLAN_REVISION_SAVED', 'MIS-002', ?, ?)
    `).run(
      OCCURRED_AT,
      `{"revision":5,"contentHash":${JSON.stringify(CONTRACT_HASH)}}`,
    );
    database.prepare(`
      INSERT INTO events (event_id, type, mission_id, occurred_at, payload_json)
      VALUES ('EVT-MIS-002-PLAN-APPROVED-R0005', 'PLAN_APPROVED', 'MIS-002', ?, ?)
    `).run(
      OCCURRED_AT,
      `{"revision":5,"contentHash":${JSON.stringify(CONTRACT_HASH)}}`,
    );
  } finally {
    database.close();
  }
}

function snapshotHistorical(database: DatabaseSync): HistoricalSnapshot {
  const missions = tableExists(database, 'missions')
    ? database.prepare(`
        SELECT id, goal, status, opened_at
        FROM missions
        ORDER BY id
      `).all()
    : [];
  const events = tableExists(database, 'events')
    ? database.prepare(`
        SELECT seq, event_id, type, mission_id, occurred_at, payload_json
        FROM events
        ORDER BY seq
      `).all()
    : [];
  const planRevisions = tableExists(database, 'mission_plan_revisions')
    ? database.prepare(`
        SELECT mission_id, revision, status, content_hash, content_json, created_at, approved_at
        FROM mission_plan_revisions
        ORDER BY mission_id, revision
      `).all()
    : [];
  return { missions, events, planRevisions };
}

const FIXTURES: readonly DatabaseFixture[] = [
  { name: 'empty', create: createEmptyFixture },
  { name: 'M0/v1', create: createM0Fixture },
  { name: 'M1/v3', create: createM1V3Fixture },
  { name: 'MIS-002 revision 5', create: createRevision5Fixture },
];

for (const fixture of FIXTURES) {
  test(`migration v4 preserves exact historical bytes from ${fixture.name}`, () => {
    const databasePath = temporaryDatabasePath(fixture.name.replaceAll(/[^a-z0-9]+/gi, '-'));
    try {
      fixture.create(databasePath);
      const database = new DatabaseSync(databasePath);
      try {
        const before = snapshotHistorical(database);
        applyMigrations(database);

        assert.deepEqual(appliedMigrations(database), [1, 2, 3, 4]);
        assert.equal(userVersion(database), 4);
        assert.deepEqual(snapshotHistorical(database), before);

        if (before.events.length > 0) {
          const versions = database.prepare(`
            SELECT payload_schema_version
            FROM events
            ORDER BY seq
          `).all().map((row) => Number(row.payload_schema_version));
          assert.deepEqual(versions, before.events.map(() => 1));
        }
      } finally {
        database.close();
      }
    } finally {
      removeDatabaseDirectory(databasePath);
    }
  });
}

test('migration v4 rebuilds Events with an explicit version registry and valid checks', () => {
  const databasePath = temporaryDatabasePath('event-registry');
  try {
    createRevision5Fixture(databasePath);
    const database = new DatabaseSync(databasePath);
    try {
      applyMigrations(database);

      assert.equal(tableExists(database, 'event_types'), true);
      const registered = database.prepare(`
        SELECT type, payload_schema_version
        FROM event_types
        ORDER BY type, payload_schema_version
      `).all().map((row) => [String(row.type), Number(row.payload_schema_version)]);
      assert.deepEqual(
        registered,
        [...EVENT_TYPES_V1]
          .sort()
          .map((eventType) => [eventType, 1]),
      );

      const payloadVersion = database.prepare('PRAGMA table_info(events)')
        .all()
        .find((row) => String(row.name) === 'payload_schema_version');
      assert.ok(payloadVersion);
      assert.equal(Number(payloadVersion.notnull), 1);
      assert.equal(payloadVersion.dflt_value, null);

      const foreignKeys = database.prepare('PRAGMA foreign_key_list(events)')
        .all()
        .map((row) => [String(row.table), String(row.from), String(row.to)]);
      assert.equal(
        foreignKeys.some((row) => row[0] === 'event_types' && row[1] === 'type' && row[2] === 'type'),
        true,
      );
      assert.equal(
        foreignKeys.some(
          (row) => row[0] === 'event_types'
            && row[1] === 'payload_schema_version'
            && row[2] === 'payload_schema_version',
        ),
        true,
      );

      const indexes = database.prepare('PRAGMA index_list(events)')
        .all()
        .map((row) => String(row.name));
      assert.equal(indexes.includes('events_mission_seq_idx'), true);

      assert.throws(() => database.prepare(`
        INSERT INTO events (
          event_id, type, payload_schema_version, mission_id, occurred_at, payload_json
        ) VALUES ('EVT-UNREGISTERED', 'MISSION_OPENED', 2, 'MIS-002', ?, '{}')
      `).run(OCCURRED_AT));

      const foreignKeyCheck = database.prepare('PRAGMA foreign_key_check').all();
      const integrity = String(firstScalar(
        database.prepare('PRAGMA integrity_check').get() as Readonly<Record<string, unknown>>,
      ));
      assert.deepEqual(foreignKeyCheck, []);
      assert.equal(integrity, 'ok');
    } finally {
      database.close();
    }
  } finally {
    removeDatabaseDirectory(databasePath);
  }
});

test('migration v4 creates the exact execution tables and partial current-row indexes', () => {
  const databasePath = temporaryDatabasePath('execution-schema');
  try {
    createEmptyFixture(databasePath);
    const database = new DatabaseSync(databasePath);
    try {
      applyMigrations(database);

      for (const tableName of ['write_tracks', 'attempts', 'worker_runs', 'leases', 'claims']) {
        assert.equal(tableExists(database, tableName), true, `missing execution table ${tableName}`);
      }

      assert.deepEqual(columnNames(database, 'write_tracks'), [
        'id',
        'mission_id',
        'milestone_qualified_id',
        'feature_qualified_id',
        'contract_hash',
        'status',
        'version',
        'created_at',
        'updated_at',
      ]);
      assert.deepEqual(columnNames(database, 'attempts'), [
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
      ]);
      assert.deepEqual(columnNames(database, 'worker_runs'), [
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
      ]);
      assert.deepEqual(columnNames(database, 'leases'), [
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
      ]);
      assert.deepEqual(columnNames(database, 'claims'), [
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
      ]);

      const indexRows = database.prepare(`
        SELECT name, sql
        FROM sqlite_master
        WHERE type = 'index' AND name IN (
          'write_tracks_one_current_per_feature',
          'attempts_one_open_per_track',
          'worker_runs_one_current_per_attempt',
          'leases_one_current_per_track',
          'leases_one_action_token',
          'claims_one_current_per_attempt'
        )
        ORDER BY name
      `).all();
      assert.equal(indexRows.length, 6);
      const indexSql = new Map(
        indexRows.map((row) => [String(row.name), normalizeSql(String(row.sql))]),
      );
      assert.match(
        indexSql.get('write_tracks_one_current_per_feature') ?? '',
        /where status in \('active', 'claimed'\)/,
      );
      assert.match(
        indexSql.get('attempts_one_open_per_track') ?? '',
        /where status = 'open'/,
      );
      assert.match(
        indexSql.get('worker_runs_one_current_per_attempt') ?? '',
        /where status in \('starting', 'running', 'idle'\)/,
      );
      assert.match(
        indexSql.get('leases_one_current_per_track') ?? '',
        /where status in \('requested', 'active', 'release_pending', 'diverged'\)/,
      );
      assert.match(
        indexSql.get('leases_one_action_token') ?? '',
        /where action_token is not null/,
      );
      assert.match(
        indexSql.get('claims_one_current_per_attempt') ?? '',
        /where status in \('open', 'completed_by_worker', 'under_verification'\)/,
      );

      const attemptsSql = normalizeSql(tableSql(database, 'attempts'));
      const claimsSql = normalizeSql(tableSql(database, 'claims'));
      assert.match(attemptsSql, /check \(git_object_format in \('sha1', 'sha256'\)\)/);
      assert.match(
        claimsSql,
        /foreign key\s*\(worker_run_id, attempt_id, contract_hash\)/,
      );
      assert.match(
        claimsSql,
        /foreign key\s*\(lease_id, attempt_id, write_track_id, contract_hash\)/,
      );
      assert.match(
        claimsSql,
        /foreign key\s*\(attempt_id, contract_hash, base_commit_sha\)/,
      );
    } finally {
      database.close();
    }
  } finally {
    removeDatabaseDirectory(databasePath);
  }
});

function insertExecutionAncestry(database: DatabaseSync): void {
  database.prepare(`
    INSERT INTO missions (id, goal, status, opened_at)
    VALUES ('MIS-EXEC', 'Prove execution ancestry', 'OPEN', ?)
  `).run(OCCURRED_AT);

  const insertTrack = database.prepare(`
    INSERT INTO write_tracks (
      id, mission_id, milestone_qualified_id, feature_qualified_id,
      contract_hash, status, version, created_at, updated_at
    ) VALUES (?, 'MIS-EXEC', ?, ?, ?, 'ACTIVE', 1, ?, ?)
  `);
  insertTrack.run('WT-001', 'MIS-002/M01', 'MIS-002/M01/F01', CONTRACT_HASH, OCCURRED_AT, OCCURRED_AT);
  insertTrack.run('WT-002', 'MIS-002/M01', 'MIS-002/M01/F02', CONTRACT_HASH, OCCURRED_AT, OCCURRED_AT);

  const insertAttempt = database.prepare(`
    INSERT INTO attempts (
      id, write_track_id, ordinal, contract_hash, git_object_format,
      base_commit_sha, source_status, source_path, source_fingerprint,
      status, version, created_at, updated_at
    ) VALUES (?, ?, 1, ?, 'sha1', ?, 'REQUESTED', NULL, NULL, 'OPEN', 1, ?, ?)
  `);
  insertAttempt.run('WT-001/A01', 'WT-001', CONTRACT_HASH, BASE_COMMIT_ONE, OCCURRED_AT, OCCURRED_AT);
  insertAttempt.run('WT-002/A01', 'WT-002', CONTRACT_HASH, BASE_COMMIT_TWO, OCCURRED_AT, OCCURRED_AT);

  const insertRun = database.prepare(`
    INSERT INTO worker_runs (
      id, attempt_id, ordinal, contract_hash, status,
      process_boot_id, process_id, process_start_ticks, process_started_at,
      exit_code, version, created_at, updated_at
    ) VALUES (?, ?, 1, ?, 'STARTING', NULL, NULL, NULL, NULL, NULL, 1, ?, ?)
  `);
  insertRun.run('WT-001/A01/WR01', 'WT-001/A01', CONTRACT_HASH, OCCURRED_AT, OCCURRED_AT);
  insertRun.run('WT-002/A01/WR01', 'WT-002/A01', CONTRACT_HASH, OCCURRED_AT, OCCURRED_AT);

  const insertLease = database.prepare(`
    INSERT INTO leases (
      id, write_track_id, attempt_id, contract_hash, generation, status,
      grant_idempotency_key, grant_input_hash, holder,
      version, created_at, updated_at
    ) VALUES (?, ?, ?, ?, 1, 'REQUESTED', ?, ?, ?, 1, ?, ?)
  `);
  insertLease.run(
    'LSE-001',
    'WT-001',
    'WT-001/A01',
    CONTRACT_HASH,
    'grant-key-1',
    `sha256:${'4'.repeat(64)}`,
    'holder-1',
    OCCURRED_AT,
    OCCURRED_AT,
  );
  insertLease.run(
    'LSE-002',
    'WT-002',
    'WT-002/A01',
    CONTRACT_HASH,
    'grant-key-2',
    `sha256:${'5'.repeat(64)}`,
    'holder-2',
    OCCURRED_AT,
    OCCURRED_AT,
  );
}

function insertClaim(
  database: DatabaseSync,
  input: {
    readonly id: string;
    readonly workerRunId: string;
    readonly leaseId: string;
    readonly idempotencyKey: string;
  },
): void {
  database.prepare(`
    INSERT INTO claims (
      id, write_track_id, attempt_id, worker_run_id, lease_id,
      contract_hash, ordinal, status, idempotency_key, input_hash,
      base_commit_sha, result_tree_sha, claimed_criteria_json,
      version, created_at, updated_at
    ) VALUES (
      ?, 'WT-001', 'WT-001/A01', ?, ?,
      ?, 1, 'OPEN', ?, ?,
      ?, ?, '["CR-001"]',
      1, ?, ?
    )
  `).run(
    input.id,
    input.workerRunId,
    input.leaseId,
    CONTRACT_HASH,
    input.idempotencyKey,
    `sha256:${'6'.repeat(64)}`,
    BASE_COMMIT_ONE,
    RESULT_TREE,
    OCCURRED_AT,
    OCCURRED_AT,
  );
}

test('execution foreign keys reject cross-Attempt Runs and cross-Track Leases on Claims', () => {
  const databasePath = temporaryDatabasePath('ancestry');
  try {
    const database = new DatabaseSync(databasePath);
    try {
      applyMigrations(database);
      assert.equal(userVersion(database), 4, 'migration v4 must exist before ancestry proof');
      database.exec('PRAGMA foreign_keys = ON');
      insertExecutionAncestry(database);

      assert.throws(() => insertClaim(database, {
        id: 'WT-001/A01/CLM01',
        workerRunId: 'WT-002/A01/WR01',
        leaseId: 'LSE-001',
        idempotencyKey: 'claim-cross-run',
      }));
      assert.throws(() => insertClaim(database, {
        id: 'WT-001/A01/CLM02',
        workerRunId: 'WT-001/A01/WR01',
        leaseId: 'LSE-002',
        idempotencyKey: 'claim-cross-lease',
      }));
      const claimCount = database.prepare('SELECT COUNT(*) AS count FROM claims').get() as {
        readonly count: number;
      };
      assert.equal(Number(claimCount.count), 0);
    } finally {
      database.close();
    }
  } finally {
    removeDatabaseDirectory(databasePath);
  }
});

function validPlan(): MissionPlanContentV1 {
  return {
    schemaVersion: 1,
    missionId: 'MIS-001',
    title: 'Versioned events',
    goal: 'Write canonical payload bytes',
    successCriteria: ['Every Event carries payload schema version 1'],
    scope: {
      included: ['Mission and plan Events'],
      excluded: ['Worker execution'],
    },
    assumptions: ['SQLite v4 is current'],
    milestones: [
      {
        id: 'M01',
        title: 'Event registry',
        outcome: 'Versioned Events',
        dependsOn: [],
        features: [
          {
            id: 'F01',
            title: 'Canonical append',
            outcome: 'Stable payload bytes',
            acceptanceCriteria: ['payload_schema_version is required'],
            dependsOn: [],
          },
        ],
      },
    ],
    risks: [
      {
        id: 'R01',
        description: 'Legacy writers omit the payload version',
        mitigation: 'Use a required column without a default',
      },
    ],
    questions: [],
  };
}

test('SqliteStore mutations append payload version 1 with canonical JSON and expose it on reads', () => {
  const databasePath = temporaryDatabasePath('event-store');
  try {
    const store = SqliteStore.open(databasePath);
    const plan = validPlan();
    const contentHash = hashPlanContent(plan);
    try {
      store.openMission({
        missionId: 'MIS-001',
        eventId: 'EVT-MIS-001-OPEN',
        goal: 'Write canonical payload bytes',
        openedAt: OCCURRED_AT,
      });
      store.saveMissionPlanRevision({
        missionId: 'MIS-001',
        content: plan,
        createdAt: OCCURRED_AT,
      });

      assert.deepEqual(store.listEvents().map((event) => ({
        eventId: event.eventId,
        payloadSchemaVersion: (event as { readonly payloadSchemaVersion?: number }).payloadSchemaVersion,
      })), [
        { eventId: 'EVT-MIS-001-OPEN', payloadSchemaVersion: 1 },
        { eventId: 'EVT-MIS-001-PLAN-R0001', payloadSchemaVersion: 1 },
      ]);
    } finally {
      store.close();
    }

    const database = new DatabaseSync(databasePath, { readOnly: true });
    try {
      const saved = database.prepare(`
        SELECT payload_schema_version, payload_json
        FROM events
        WHERE event_id = 'EVT-MIS-001-PLAN-R0001'
      `).get() as {
        readonly payload_schema_version: number;
        readonly payload_json: string;
      };
      assert.equal(Number(saved.payload_schema_version), 1);
      assert.equal(
        saved.payload_json,
        canonicalJson({ contentHash, revision: 1 }),
      );
    } finally {
      database.close();
    }
  } finally {
    removeDatabaseDirectory(databasePath);
  }
});

function legacyOpenMission(database: DatabaseSync): void {
  database.exec('BEGIN IMMEDIATE');
  try {
    database.prepare(`
      INSERT INTO missions (id, goal, status, opened_at)
      VALUES ('MIS-LEGACY', 'Legacy writer must roll back', 'OPEN', ?)
    `).run(OCCURRED_AT);
    database.prepare(`
      INSERT INTO events (event_id, type, mission_id, occurred_at, payload_json)
      VALUES ('EVT-MIS-LEGACY-OPEN', 'MISSION_OPENED', 'MIS-LEGACY', ?, '{}')
    `).run(OCCURRED_AT);
    database.exec('COMMIT');
  } catch (error) {
    if (database.isTransaction) database.exec('ROLLBACK');
    throw error;
  }
}

test('a pre-v4 mutation omitting payload_schema_version fails and rolls back its domain row', () => {
  const databasePath = temporaryDatabasePath('downgrade-fence');
  try {
    createV3Schema(new DatabaseSync(databasePath));
    const database = new DatabaseSync(databasePath);
    try {
      applyMigrations(database);
      assert.equal(userVersion(database), 4, 'migration v4 must exist before downgrade proof');
      assert.throws(() => legacyOpenMission(database));
      const mission = database.prepare(`
        SELECT COUNT(*) AS count
        FROM missions
        WHERE id = 'MIS-LEGACY'
      `).get() as { readonly count: number };
      const event = database.prepare(`
        SELECT COUNT(*) AS count
        FROM events
        WHERE event_id = 'EVT-MIS-LEGACY-OPEN'
      `).get() as { readonly count: number };
      assert.equal(Number(mission.count), 0);
      assert.equal(Number(event.count), 0);
    } finally {
      database.close();
    }
  } finally {
    removeDatabaseDirectory(databasePath);
  }
});

test('an injected migration-4 commit failure restores the complete v3 database', () => {
  const databasePath = temporaryDatabasePath('rollback');
  try {
    createRevision5Fixture(databasePath);
    const database = new DatabaseSync(databasePath);
    try {
      const before = snapshotHistorical(database);
      const beforeEventsSql = tableSql(database, 'events');
      database.exec(`
        CREATE TRIGGER fail_migration_4
        BEFORE INSERT ON schema_migrations
        WHEN NEW.version = 4
        BEGIN
          SELECT RAISE(ABORT, 'injected migration 4 failure');
        END;
      `);

      assert.throws(() => applyMigrations(database), /injected migration 4 failure/);

      assert.deepEqual(appliedMigrations(database), [1, 2, 3]);
      assert.equal(userVersion(database), 3);
      assert.equal(tableExists(database, 'event_types'), false);
      assert.equal(tableSql(database, 'events'), beforeEventsSql);
      assert.deepEqual(snapshotHistorical(database), before);
      assert.deepEqual(database.prepare('PRAGMA foreign_key_check').all(), []);
      assert.equal(
        String(firstScalar(
          database.prepare('PRAGMA integrity_check').get() as Readonly<Record<string, unknown>>,
        )),
        'ok',
      );
    } finally {
      database.close();
    }
  } finally {
    removeDatabaseDirectory(databasePath);
  }
});
