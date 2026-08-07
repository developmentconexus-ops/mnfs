import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';

import {
  canonicalJson,
  hashPlanContent,
  type MissionPlanContentV2,
} from '../../src/domain/mission-plan.js';
import { applyMigrations } from '../../src/store/migrations.js';
import { ExecutionService } from '../../src/services/execution-service.js';
import { SqliteStore } from '../../src/store/sqlite-store.js';

const OCCURRED_AT = '2026-08-05T20:30:00.000Z';
const CONTRACT_PATH = resolve('.mnfs/missions/MIS-002/plan.json');

interface ContractEnvelope {
  readonly revision: number;
  readonly contentHash: string;
  readonly content: MissionPlanContentV2;
}

interface HistoricalSnapshot {
  readonly missions: readonly unknown[];
  readonly events: readonly unknown[];
  readonly planRevisions: readonly unknown[];
}

function temporaryDatabasePath(t: test.TestContext, label: string): string {
  const root = mkdtempSync(join(tmpdir(), `mnfs-task14-${label}-`));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return join(root, 'mnfs.db');
}

function contractEnvelope(): ContractEnvelope {
  const envelope = JSON.parse(readFileSync(CONTRACT_PATH, 'utf8')) as ContractEnvelope;
  assert.equal(envelope.revision, 5);
  assert.equal(envelope.content.schemaVersion, 2);
  assert.equal(hashPlanContent(envelope.content), envelope.contentHash);
  return envelope;
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

function seedRevisionFiveV3(databasePath: string): ContractEnvelope {
  const envelope = contractEnvelope();
  const database = new DatabaseSync(databasePath);
  try {
    createV3Schema(database);
    database.prepare(`
      INSERT INTO missions (id, goal, status, opened_at)
      VALUES (?, ?, 'OPEN', ?)
    `).run('MIS-002', envelope.content.goal, OCCURRED_AT);
    database.prepare(`
      INSERT INTO mission_plan_revisions (
        mission_id, revision, status, content_hash, content_json, created_at, approved_at
      ) VALUES (?, ?, 'APPROVED', ?, ?, ?, ?)
    `).run(
      'MIS-002',
      envelope.revision,
      envelope.contentHash,
      canonicalJson(envelope.content),
      OCCURRED_AT,
      OCCURRED_AT,
    );
    database.prepare(`
      INSERT INTO events (event_id, type, mission_id, occurred_at, payload_json)
      VALUES (?, 'MISSION_OPENED', 'MIS-002', ?, ?)
    `).run(
      'EVT-MIS-002-TASK14-MISSION-OPENED',
      OCCURRED_AT,
      canonicalJson({ goal: envelope.content.goal }),
    );
    database.prepare(`
      INSERT INTO events (event_id, type, mission_id, occurred_at, payload_json)
      VALUES (?, 'PLAN_REVISION_SAVED', 'MIS-002', ?, ?)
    `).run(
      'EVT-MIS-002-TASK14-PLAN-SAVED',
      OCCURRED_AT,
      canonicalJson({ contentHash: envelope.contentHash, revision: envelope.revision }),
    );
    database.prepare(`
      INSERT INTO events (event_id, type, mission_id, occurred_at, payload_json)
      VALUES (?, 'PLAN_APPROVED', 'MIS-002', ?, ?)
    `).run(
      'EVT-MIS-002-TASK14-PLAN-APPROVED',
      OCCURRED_AT,
      canonicalJson({ contentHash: envelope.contentHash, revision: envelope.revision }),
    );
  } finally {
    database.close();
  }
  return envelope;
}

function historicalSnapshot(database: DatabaseSync): HistoricalSnapshot {
  return {
    missions: database.prepare(`
      SELECT id, goal, status, opened_at
      FROM missions
      ORDER BY id
    `).all(),
    events: database.prepare(`
      SELECT seq, event_id, type, mission_id, occurred_at, payload_json
      FROM events
      ORDER BY seq
    `).all(),
    planRevisions: database.prepare(`
      SELECT mission_id, revision, status, content_hash, content_json, created_at, approved_at
      FROM mission_plan_revisions
      ORDER BY mission_id, revision
    `).all(),
  };
}

function canonicalHash(value: unknown): string {
  return `sha256:${createHash('sha256').update(canonicalJson(value), 'utf8').digest('hex')}`;
}

function userVersion(database: DatabaseSync): number {
  const row = database.prepare('PRAGMA user_version').get() as Record<string, unknown>;
  return Number(Object.values(row)[0]);
}

function appliedMigrations(database: DatabaseSync): number[] {
  return database.prepare('SELECT version FROM schema_migrations ORDER BY version')
    .all()
    .map((row) => Number(row.version));
}

function tableExists(database: DatabaseSync, name: string): boolean {
  const row = database.prepare(`
    SELECT COUNT(*) AS count
    FROM sqlite_master
    WHERE type = 'table' AND name = ?
  `).get(name) as { readonly count: number };
  return Number(row.count) === 1;
}

function tableSql(database: DatabaseSync, name: string): string {
  const row = database.prepare(`
    SELECT sql FROM sqlite_master WHERE type = 'table' AND name = ?
  `).get(name) as { readonly sql?: string } | undefined;
  return String(row?.sql ?? '');
}

function completeLogicalSnapshot(database: DatabaseSync): unknown {
  const tables = database.prepare(`
    SELECT name
    FROM sqlite_master
    WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
    ORDER BY name
  `).all().map((row) => String(row.name));
  const rows = tables.map((tableName) => {
    const values = database.prepare(`SELECT * FROM "${tableName}"`).all();
    values.sort((left, right) => {
      const leftJson = canonicalJson(left);
      const rightJson = canonicalJson(right);
      if (leftJson === rightJson) return 0;
      return leftJson < rightJson ? -1 : 1;
    });
    return { tableName, values };
  });
  const sequence = tableExists(database, 'sqlite_sequence')
    ? database.prepare('SELECT name, seq FROM sqlite_sequence ORDER BY name').all()
    : [];
  return {
    userVersion: userVersion(database),
    rows,
    sequence,
  };
}

function runNodeScript(
  scriptPath: string,
  args: readonly string[],
): Readonly<{ status: number | null; stdout: string; stderr: string }> {
  const result = spawnSync(process.execPath, [scriptPath, ...args], {
    cwd: resolve('.'),
    encoding: 'utf8',
    env: { ...process.env, NODE_NO_WARNINGS: '1', TZ: 'UTC', LANG: 'C.UTF-8', LC_ALL: 'C.UTF-8' },
    shell: false,
  });
  return {
    status: result.status,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  };
}

function integrity(database: DatabaseSync): void {
  assert.deepEqual(database.prepare('PRAGMA foreign_key_check').all(), []);
  const row = database.prepare('PRAGMA integrity_check').get() as Record<string, unknown>;
  assert.equal(String(Object.values(row)[0]), 'ok');
}

function gitCommand(cwd: string, args: readonly string[]): string {
  const result = spawnSync('/usr/bin/git', [...args], {
    cwd,
    encoding: 'utf8',
    env: {
      ...process.env,
      GIT_CONFIG_GLOBAL: '/dev/null',
      GIT_CONFIG_NOSYSTEM: '1',
      GIT_TERMINAL_PROMPT: '0',
    },
    shell: false,
  });
  assert.equal(result.status, 0, result.stderr);
  return (result.stdout ?? '').trim();
}

function runMnfs(
  projectRoot: string,
  runtimeHome: string,
  args: readonly string[],
): Readonly<{ status: number | null; stdout: string; stderr: string }> {
  const result = spawnSync(process.execPath, [resolve('bin/mnfs.mjs'), ...args], {
    cwd: projectRoot,
    encoding: 'utf8',
    env: {
      ...process.env,
      MNFS_HOME: runtimeHome,
      NODE_NO_WARNINGS: '1',
      GIT_CONFIG_GLOBAL: '/dev/null',
      GIT_CONFIG_NOSYSTEM: '1',
      GIT_TERMINAL_PROMPT: '0',
      TZ: 'UTC',
      LANG: 'C.UTF-8',
      LC_ALL: 'C.UTF-8',
    },
    shell: false,
  });
  return {
    status: result.status,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  };
}

test('production CLI composes Track/source/recovery across fresh processes without mutating the canonical checkout', (t) => {
  const root = mkdtempSync(join(tmpdir(), 'mnfs-task14-production-cli-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const projectRoot = join(root, 'project');
  const runtimeHome = join(root, 'state');
  const repoId = 'task14-production-cli';
  const runtimeRoot = join(runtimeHome, 'repos', repoId);
  mkdirSync(join(projectRoot, '.mnfs', 'missions', 'MIS-002'), { recursive: true, mode: 0o700 });
  mkdirSync(runtimeRoot, { recursive: true, mode: 0o700 });

  const envelope = contractEnvelope();
  writeFileSync(join(projectRoot, '.mnfs', 'repo.json'), `${JSON.stringify({
    schemaVersion: 1,
    repoId,
    createdAt: OCCURRED_AT,
  }, null, 2)}\n`, 'utf8');
  writeFileSync(
    join(projectRoot, '.mnfs', 'missions', 'MIS-002', 'plan.json'),
    readFileSync(CONTRACT_PATH),
  );
  writeFileSync(join(projectRoot, 'README.md'), '# Task 14 production CLI fixture\n', 'utf8');
  gitCommand(projectRoot, ['init', '-b', 'main']);
  gitCommand(projectRoot, ['config', 'user.name', 'MNFS Task 14']);
  gitCommand(projectRoot, ['config', 'user.email', 'task14@mnfs.invalid']);
  gitCommand(projectRoot, ['add', '.']);
  gitCommand(projectRoot, ['commit', '-m', 'task14 production fixture']);
  gitCommand(projectRoot, ['remote', 'add', 'origin', 'https://example.invalid/mnfs-task14.git']);
  const baseCommitSha = gitCommand(projectRoot, ['rev-parse', 'HEAD']);
  const baseTreeSha = gitCommand(projectRoot, ['rev-parse', 'HEAD^{tree}']);

  const store = SqliteStore.open(join(runtimeRoot, 'mnfs.db'));
  try {
    store.openMission({
      missionId: 'MIS-002',
      eventId: 'EVT-MIS-002-TASK14-PRODUCTION-OPEN',
      goal: envelope.content.goal,
      openedAt: OCCURRED_AT,
    });
    const saved = store.saveMissionPlanRevision({
      missionId: 'MIS-002',
      content: envelope.content,
      createdAt: OCCURRED_AT,
    });
    assert.equal(saved.contentHash, envelope.contentHash);
    store.approveMissionPlan({
      missionId: 'MIS-002',
      contentHash: saved.contentHash,
      approvedAt: OCCURRED_AT,
    });
  } finally {
    store.close();
  }

  const openArgs = [
    'track', 'open',
    '--mission', 'MIS-002',
    '--milestone', 'M01',
    '--feature', 'F01',
    '--contract', envelope.contentHash,
    '--base', baseCommitSha,
    '--idempotency-key', 'task14:production-cli:track-open',
    '--json',
  ] as const;
  const openedProcess = runMnfs(projectRoot, runtimeHome, openArgs);
  assert.equal(openedProcess.status, 0, openedProcess.stderr);
  const opened = JSON.parse(openedProcess.stdout) as {
    readonly track: { readonly id: string; readonly status: string; readonly version: number };
    readonly attempt: {
      readonly id: string;
      readonly sourceStatus: string;
      readonly sourcePath: string;
      readonly baseCommitSha: string;
    };
  };
  assert.equal(opened.track.id, 'WT-001');
  assert.equal(opened.track.status, 'ACTIVE');
  assert.equal(opened.attempt.id, 'WT-001/A01');
  assert.equal(opened.attempt.sourceStatus, 'READY');
  assert.equal(opened.attempt.baseCommitSha, baseCommitSha);
  assert.equal(existsSync(opened.attempt.sourcePath), true);
  assert.equal(gitCommand(opened.attempt.sourcePath, ['rev-parse', 'HEAD']), baseCommitSha);
  assert.equal(gitCommand(opened.attempt.sourcePath, ['rev-parse', 'HEAD^{tree}']), baseTreeSha);
  assert.equal(gitCommand(opened.attempt.sourcePath, ['remote']), '');
  assert.equal(gitCommand(projectRoot, ['rev-parse', 'HEAD']), baseCommitSha);
  assert.equal(gitCommand(projectRoot, ['status', '--porcelain']), '');

  const replayProcess = runMnfs(projectRoot, runtimeHome, openArgs);
  assert.equal(replayProcess.status, 0, replayProcess.stderr);
  const replay = JSON.parse(replayProcess.stdout) as typeof opened;
  assert.equal(replay.track.id, opened.track.id);
  assert.equal(replay.attempt.id, opened.attempt.id);
  assert.equal(replay.attempt.sourcePath, opened.attempt.sourcePath);

  const shownProcess = runMnfs(projectRoot, runtimeHome, [
    'track', 'show', '--track', opened.track.id, '--json',
  ]);
  assert.equal(shownProcess.status, 0, shownProcess.stderr);
  const shown = JSON.parse(shownProcess.stdout) as {
    readonly track: { readonly id: string };
    readonly attempt: { readonly id: string; readonly sourcePath: string };
  };
  assert.equal(shown.track.id, opened.track.id);
  assert.equal(shown.attempt.id, opened.attempt.id);
  assert.equal(shown.attempt.sourcePath, opened.attempt.sourcePath);

  assert.equal(existsSync(join(runtimeRoot, 'treehouse')), false);
  const recoveredProcess = runMnfs(projectRoot, runtimeHome, [
    'recover', '--track', opened.track.id, '--json',
  ]);
  assert.equal(recoveredProcess.status, 0, recoveredProcess.stderr);
  const recovered = JSON.parse(recoveredProcess.stdout) as {
    readonly writeTrackId: string;
    readonly findings: readonly { readonly code: string }[];
  };
  assert.equal(recovered.writeTrackId, opened.track.id);
  assert.equal(recovered.findings.some((finding) => finding.code === 'UNKNOWN'), true);
  assert.equal(existsSync(join(runtimeRoot, 'treehouse')), false);
  assert.equal(gitCommand(projectRoot, ['status', '--porcelain']), '');

  const database = new DatabaseSync(join(runtimeRoot, 'mnfs.db'), { readOnly: true });
  try {
    const counts = database.prepare(`
      SELECT
        (SELECT COUNT(*) FROM write_tracks WHERE status IN ('ACTIVE', 'CLAIMED')) AS tracks,
        (SELECT COUNT(*) FROM attempts WHERE status = 'OPEN') AS attempts
    `).get() as { readonly tracks: number; readonly attempts: number };
    assert.deepEqual({ tracks: Number(counts.tracks), attempts: Number(counts.attempts) }, {
      tracks: 1,
      attempts: 1,
    });
  } finally {
    database.close();
  }
});

test('production CLI classifies an intent-only REQUESTED source crash as SD-01', (t) => {
  const root = mkdtempSync(join(tmpdir(), 'mnfs-task14-production-requested-source-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const projectRoot = join(root, 'project');
  const runtimeHome = join(root, 'state');
  const repoId = 'task14-production-requested-source';
  const runtimeRoot = join(runtimeHome, 'repos', repoId);
  mkdirSync(join(projectRoot, '.mnfs', 'missions', 'MIS-002'), { recursive: true, mode: 0o700 });
  mkdirSync(runtimeRoot, { recursive: true, mode: 0o700 });

  const envelope = contractEnvelope();
  writeFileSync(join(projectRoot, '.mnfs', 'repo.json'), `${JSON.stringify({
    schemaVersion: 1,
    repoId,
    createdAt: OCCURRED_AT,
  }, null, 2)}\n`, 'utf8');
  writeFileSync(
    join(projectRoot, '.mnfs', 'missions', 'MIS-002', 'plan.json'),
    readFileSync(CONTRACT_PATH),
  );
  writeFileSync(join(projectRoot, 'README.md'), '# Task 14 REQUESTED source fixture\n', 'utf8');
  gitCommand(projectRoot, ['init', '-b', 'main']);
  gitCommand(projectRoot, ['config', 'user.name', 'MNFS Task 14']);
  gitCommand(projectRoot, ['config', 'user.email', 'task14@mnfs.invalid']);
  gitCommand(projectRoot, ['add', '.']);
  gitCommand(projectRoot, ['commit', '-m', 'task14 requested source fixture']);
  const baseCommitSha = gitCommand(projectRoot, ['rev-parse', 'HEAD']);

  const store = SqliteStore.open(join(runtimeRoot, 'mnfs.db'));
  try {
    store.openMission({
      missionId: 'MIS-002',
      eventId: 'EVT-MIS-002-TASK14-REQUESTED-SOURCE-OPEN',
      goal: envelope.content.goal,
      openedAt: OCCURRED_AT,
    });
    const saved = store.saveMissionPlanRevision({
      missionId: 'MIS-002',
      content: envelope.content,
      createdAt: OCCURRED_AT,
    });
    store.approveMissionPlan({
      missionId: 'MIS-002',
      contentHash: saved.contentHash,
      approvedAt: OCCURRED_AT,
    });
    const opened = new ExecutionService({
      store,
      git: {
        requireCommit: (sha) => ({ sha, objectFormat: 'sha1' }),
      },
    }).openWriteTrack({
      missionId: 'MIS-002',
      milestoneQualifiedId: 'MIS-002/M01',
      featureQualifiedId: 'MIS-002/M01/F01',
      contractHash: envelope.contentHash,
      baseCommitSha,
      idempotencyKey: 'task14:requested-source:track-open',
      occurredAt: OCCURRED_AT,
    });
    assert.equal(opened.attempt.sourceStatus, 'REQUESTED');
    assert.equal(opened.attempt.sourcePath, undefined);
  } finally {
    store.close();
  }

  const recoveredProcess = runMnfs(projectRoot, runtimeHome, [
    'recover', '--track', 'WT-001', '--json',
  ]);
  assert.equal(recoveredProcess.status, 0, recoveredProcess.stderr);
  const recovered = JSON.parse(recoveredProcess.stdout) as {
    readonly findings: readonly {
      readonly code: string;
      readonly requiredAuthority: string;
    }[];
  };
  const sourceFinding = recovered.findings.find((finding) => finding.code.startsWith('SD-'));
  assert.equal(sourceFinding?.code, 'SD-01');
  assert.equal(sourceFinding?.requiredAuthority, 'ORIGINAL_OPERATION');
  assert.equal(existsSync(join(runtimeRoot, 'treehouse')), false);
});

test('revision-5 v3 bytes migrate once and reopen through a fresh current writer process', (t) => {
  const databasePath = temporaryDatabasePath(t, 'migrate-fresh');
  const envelope = seedRevisionFiveV3(databasePath);
  const database = new DatabaseSync(databasePath);
  let before: HistoricalSnapshot;
  try {
    before = historicalSnapshot(database);
    const beforeHash = canonicalHash(before);
    applyMigrations(database);

    assert.deepEqual(appliedMigrations(database), [1, 2, 3, 4]);
    assert.equal(userVersion(database), 4);
    assert.deepEqual(historicalSnapshot(database), before);
    assert.equal(canonicalHash(historicalSnapshot(database)), beforeHash);
    const payloadVersions = database.prepare(`
      SELECT payload_schema_version FROM events ORDER BY seq
    `).all().map((row) => Number(row.payload_schema_version));
    assert.deepEqual(payloadVersions, before.events.map(() => 1));
    integrity(database);
  } finally {
    database.close();
  }

  const scriptPath = join(dirname(databasePath), 'fresh-current-writer.mjs');
  const storeModule = pathToFileURL(resolve('dist/src/store/sqlite-store.js')).href;
  writeFileSync(scriptPath, `
    import { SqliteStore } from ${JSON.stringify(storeModule)};
    const store = SqliteStore.openCurrent(process.argv[2]);
    try {
      const approved = store.getLatestApprovedMissionPlan('MIS-002');
      const events = store.listEvents();
      process.stdout.write(JSON.stringify({
        approved: approved === undefined ? null : {
          revision: approved.revision,
          contentHash: approved.contentHash,
          content: approved.content,
        },
        eventTypes: events.map((event) => event.type),
        payloadVersions: events.map((event) => event.payloadSchemaVersion),
      }));
    } finally {
      store.close();
    }
  `, 'utf8');

  const fresh = runNodeScript(scriptPath, [databasePath]);
  assert.equal(fresh.status, 0, fresh.stderr);
  const reopened = JSON.parse(fresh.stdout) as {
    readonly approved: {
      readonly revision: number;
      readonly contentHash: string;
      readonly content: MissionPlanContentV2;
    };
    readonly eventTypes: readonly string[];
    readonly payloadVersions: readonly number[];
  };
  assert.equal(reopened.approved.revision, 5);
  assert.equal(reopened.approved.contentHash, envelope.contentHash);
  assert.equal(canonicalJson(reopened.approved.content), canonicalJson(envelope.content));
  assert.deepEqual(reopened.eventTypes, ['MISSION_OPENED', 'PLAN_REVISION_SAVED', 'PLAN_APPROVED']);
  assert.deepEqual(reopened.payloadVersions, [1, 1, 1]);
});

test('a separate pre-v4 writer rolls back against schema v4 without logical drift', (t) => {
  const databasePath = temporaryDatabasePath(t, 'legacy-writer');
  seedRevisionFiveV3(databasePath);

  // Freeze the legacy writer while the database is still at schema v3. The
  // digest proves the exact pre-v4 executable bytes are not regenerated or
  // rewritten after migration.
  const scriptPath = join(dirname(databasePath), 'pre-v4-writer.mjs');
  const legacyWriterSource = `
    import { DatabaseSync } from 'node:sqlite';
    const database = new DatabaseSync(process.argv[2]);
    database.exec('PRAGMA foreign_keys = ON; BEGIN IMMEDIATE');
    try {
      database.prepare(\`INSERT INTO missions (id, goal, status, opened_at)
        VALUES ('MIS-LEGACY', 'Legacy writer must roll back', 'OPEN', ?)\`).run(${JSON.stringify(OCCURRED_AT)});
      database.prepare(\`INSERT INTO events (event_id, type, mission_id, occurred_at, payload_json)
        VALUES ('EVT-MIS-LEGACY-OPEN', 'MISSION_OPENED', 'MIS-LEGACY', ?, '{}')\`).run(${JSON.stringify(OCCURRED_AT)});
      database.exec('COMMIT');
      database.close();
      process.exit(0);
    } catch (error) {
      if (database.isTransaction) database.exec('ROLLBACK');
      process.stderr.write(String(error instanceof Error ? error.message : error));
      database.close();
      process.exit(42);
    }
  `;
  writeFileSync(scriptPath, legacyWriterSource, 'utf8');
  const legacyWriterHash = createHash('sha256').update(readFileSync(scriptPath)).digest('hex');

  const database = new DatabaseSync(databasePath);
  let beforeHash: string;
  try {
    applyMigrations(database);
    beforeHash = canonicalHash(completeLogicalSnapshot(database));
    integrity(database);
  } finally {
    database.close();
  }

  assert.equal(
    createHash('sha256').update(readFileSync(scriptPath)).digest('hex'),
    legacyWriterHash,
    'the frozen pre-v4 writer bytes must remain unchanged after migration',
  );

  const legacy = runNodeScript(scriptPath, [databasePath]);
  assert.equal(legacy.status, 42, legacy.stderr);
  assert.match(legacy.stderr, /payload_schema_version|NOT NULL constraint failed/u);

  const reopened = new DatabaseSync(databasePath);
  try {
    assert.equal(canonicalHash(completeLogicalSnapshot(reopened)), beforeHash);
    const mission = reopened.prepare(`
      SELECT COUNT(*) AS count FROM missions WHERE id = 'MIS-LEGACY'
    `).get() as { readonly count: number };
    const event = reopened.prepare(`
      SELECT COUNT(*) AS count FROM events WHERE event_id = 'EVT-MIS-LEGACY-OPEN'
    `).get() as { readonly count: number };
    assert.equal(Number(mission.count), 0);
    assert.equal(Number(event.count), 0);
    integrity(reopened);
  } finally {
    reopened.close();
  }
});

test('an injected migration-4 commit failure restores the exact v3 historical state', (t) => {
  const databasePath = temporaryDatabasePath(t, 'migration-rollback');
  seedRevisionFiveV3(databasePath);
  const database = new DatabaseSync(databasePath);
  try {
    const before = historicalSnapshot(database);
    const beforeHash = canonicalHash(before);
    const eventsSql = tableSql(database, 'events');
    database.exec(`
      CREATE TRIGGER fail_task14_migration_4
      BEFORE INSERT ON schema_migrations
      WHEN NEW.version = 4
      BEGIN
        SELECT RAISE(ABORT, 'task14 injected migration 4 failure');
      END;
    `);

    assert.throws(() => applyMigrations(database), /task14 injected migration 4 failure/u);
    assert.deepEqual(appliedMigrations(database), [1, 2, 3]);
    assert.equal(userVersion(database), 3);
    assert.equal(tableExists(database, 'event_types'), false);
    assert.equal(tableSql(database, 'events'), eventsSql);
    assert.deepEqual(historicalSnapshot(database), before);
    assert.equal(canonicalHash(historicalSnapshot(database)), beforeHash);
    integrity(database);
  } finally {
    database.close();
  }
});

test('deterministic production source scan preserves every frozen M01 boundary', () => {
  const entry = readFileSync(resolve('src/cli/entry.ts'), 'utf8');
  const recovery = readFileSync(resolve('src/services/recovery-service.ts'), 'utf8');

  const operationEnvironment = entry.match(
    /function operationEnvironment\([\s\S]*?return Object\.freeze\(\{([\s\S]*?)\}\);\n\}/u,
  );
  assert.notEqual(operationEnvironment, null, 'operationEnvironment must remain explicit and reviewable');
  assert.doesNotMatch(operationEnvironment?.[1] ?? '', /\.\.\./u);
  assert.doesNotMatch(operationEnvironment?.[1] ?? '', /process\.env/u);

  for (const mutationPattern of [/\.launch\(/u, /new LeaseService/u, /new ExecutionService/u]) {
    assert.doesNotMatch(recovery, mutationPattern);
  }

  assert.doesNotMatch(entry, /new LeaseActionRunner\(/u);
});
