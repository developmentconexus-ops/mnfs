import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
  lstat,
  mkdtemp,
  readFile,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';

import { SqliteStore } from '../../src/store/sqlite-store.js';
import type { ProcessIdentity } from '../../src/execution/model.js';
import { M01_FIXTURE } from '../support/m01-fixtures.js';

const SQLITE_MAINTENANCE_SPECIFIER = '../../src/store/' + 'sqlite-maintenance.js';

interface MaintenanceLockFile {
  readonly path: string;
  write(bytes: Buffer): Promise<void>;
  sync(): Promise<void>;
  close(): Promise<void>;
}

interface MaintenanceLockOperations {
  readRegularIfExists(filePath: string): Promise<Buffer | undefined>;
  createExclusive(filePath: string, mode: number): Promise<MaintenanceLockFile>;
  syncDirectory(directoryPath: string): Promise<void>;
  remove(filePath: string): Promise<void>;
}

interface MaintenanceLockHandle {
  readonly path: string;
  readonly ownerBytes: Buffer;
  release(): Promise<void>;
}

interface MaintenanceLockManager {
  acquire(input: {
    readonly databasePath: string;
    readonly processIdentity: ProcessIdentity;
    readonly now: string;
  }): Promise<MaintenanceLockHandle>;
}

interface DatabaseBackupEvidence {
  readonly path: string;
  readonly sha256: string;
  readonly integrityCheck: 'ok';
  readonly userVersion: number;
  readonly appliedMigrations: readonly number[];
  readonly tableCounts: Readonly<Record<string, number>>;
  readonly approvedContractHashes: readonly string[];
}

interface DatabaseReadiness {
  readonly databasePath: string;
  readonly writeMode: boolean;
  readonly schemaVersion: number;
  readonly userVersion: number;
  readonly appliedMigrations: readonly number[];
}

interface SqliteMaintenanceModule {
  createMaintenanceLockManager(
    operations: MaintenanceLockOperations,
  ): MaintenanceLockManager;
  acquireMaintenanceLock(input: {
    readonly databasePath: string;
    readonly processIdentity: ProcessIdentity;
    readonly now: string;
  }): Promise<MaintenanceLockHandle>;
  createConsistentDatabaseBackup(input: {
    readonly sourceDatabase: DatabaseSync;
    readonly databasePath: string;
    readonly backupPath: string;
  }): Promise<DatabaseBackupEvidence>;
  ensureDatabaseReady(input: {
    readonly databasePath: string;
    readonly writeMode: boolean;
    readonly processIdentity: ProcessIdentity;
    readonly now: string;
  }): Promise<DatabaseReadiness>;
}

interface CurrentSqliteStoreConstructor {
  openCurrent(databasePath: string): SqliteStore;
}

const OWNER_A: ProcessIdentity = {
  bootId: 'boot-task4-a',
  pid: 4315,
  startTicks: '987654321',
};

const OWNER_B: ProcessIdentity = {
  bootId: 'boot-task4-b',
  pid: 4316,
  startTicks: '987654322',
};

const LOCK_TIME = '2026-08-04T19:40:00.000Z';
const OLD_LOCK_TIME = '2000-01-01T00:00:00.000Z';

function describeError(error: unknown): string {
  return error instanceof Error ? `${error.name}: ${error.message}` : String(error);
}

async function loadSqliteMaintenance(): Promise<SqliteMaintenanceModule> {
  try {
    return await import(SQLITE_MAINTENANCE_SPECIFIER) as SqliteMaintenanceModule;
  } catch (error) {
    assert.fail(`M01 SQLite maintenance gate is not implemented: ${describeError(error)}`);
  }
}

async function withTemporaryDirectory<T>(
  operation: (directory: string) => Promise<T>,
): Promise<T> {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'mnfs-m01-sqlite-maintenance-'));
  try {
    return await operation(directory);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

function lockPath(databasePath: string): string {
  return `${databasePath}.maintenance.lock`;
}

function expectedOwnerBytes(identity: ProcessIdentity, acquiredAt: string): Buffer {
  return Buffer.from(JSON.stringify({
    acquiredAt,
    processIdentity: {
      bootId: identity.bootId,
      pid: identity.pid,
      startTicks: identity.startTicks,
    },
  }));
}

function sha256(bytes: Buffer): string {
  return `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
}

function createSchemaFixture(
  databasePath: string,
  appliedMigrations: readonly number[],
  userVersion: number,
): void {
  const database = new DatabaseSync(databasePath);
  database.exec(`
    CREATE TABLE schema_migrations (
      version INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL
    );
  `);
  const insert = database.prepare(
    'INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)',
  );
  for (const version of appliedMigrations) {
    insert.run(version, `2026-08-04T19:4${version}:00.000Z`);
  }
  database.exec(`PRAGMA user_version = ${userVersion}`);
  database.close();
}

function createV3BackupSource(databasePath: string): DatabaseSync {
  const store = SqliteStore.open(databasePath);
  store.close();

  const database = new DatabaseSync(databasePath);
  database.exec('PRAGMA wal_autocheckpoint = 0; PRAGMA user_version = 3;');
  database.prepare(`
    INSERT INTO missions (id, goal, status, opened_at)
    VALUES (?, ?, 'OPEN', ?)
  `).run('MIS-002', 'Back up the approved contract', LOCK_TIME);
  database.prepare(`
    INSERT INTO events (event_id, type, mission_id, occurred_at, payload_json)
    VALUES (?, 'MISSION_OPENED', ?, ?, ?)
  `).run(
    'EVT-MIS-002-OPEN',
    'MIS-002',
    LOCK_TIME,
    JSON.stringify({ goal: 'Back up the approved contract' }),
  );
  database.prepare(`
    INSERT INTO mission_plan_revisions (
      mission_id, revision, status, content_hash, content_json, created_at, approved_at
    ) VALUES (?, 5, 'APPROVED', ?, ?, ?, ?)
  `).run(
    'MIS-002',
    M01_FIXTURE.contractHash,
    JSON.stringify({ schemaVersion: 2, missionId: 'MIS-002' }),
    LOCK_TIME,
    LOCK_TIME,
  );
  return database;
}

test('publishes and releases the maintenance lock with durable 0600 ordering', async () => {
  const maintenance = await loadSqliteMaintenance();
  const steps: string[] = [];
  const databasePath = '/state/mnfs.db';
  const expectedLockPath = lockPath(databasePath);
  const ownerBytes = expectedOwnerBytes(OWNER_A, LOCK_TIME);

  const manager = maintenance.createMaintenanceLockManager({
    async readRegularIfExists(filePath) {
      steps.push(`read:${filePath}`);
      return undefined;
    },
    async createExclusive(filePath, mode) {
      steps.push(`open-exclusive:${filePath}:${mode.toString(8)}`);
      return {
        path: filePath,
        async write(bytes) {
          steps.push(`write:${bytes.toString('hex')}`);
        },
        async sync() {
          steps.push('fsync-lock');
        },
        async close() {
          steps.push('close-lock');
        },
      };
    },
    async syncDirectory(directoryPath) {
      steps.push(`fsync-directory:${directoryPath}`);
    },
    async remove(filePath) {
      steps.push(`remove:${filePath}`);
    },
  });

  const handle = await manager.acquire({
    databasePath,
    processIdentity: OWNER_A,
    now: LOCK_TIME,
  });

  assert.equal(handle.path, expectedLockPath);
  assert.deepEqual(handle.ownerBytes, ownerBytes);
  assert.deepEqual(steps, [
    `read:${expectedLockPath}`,
    `open-exclusive:${expectedLockPath}:600`,
    `write:${ownerBytes.toString('hex')}`,
    'fsync-lock',
    'close-lock',
    'fsync-directory:/state',
  ]);

  await handle.release();
  assert.deepEqual(steps.slice(-2), [
    `remove:${expectedLockPath}`,
    'fsync-directory:/state',
  ]);
});

test('blocks a second owner and never steals an old maintenance lock by age', async () => {
  const maintenance = await loadSqliteMaintenance();

  await withTemporaryDirectory(async (directory) => {
    const databasePath = path.join(directory, 'mnfs.db');
    await writeFile(databasePath, Buffer.alloc(0));
    const first = await maintenance.acquireMaintenanceLock({
      databasePath,
      processIdentity: OWNER_A,
      now: OLD_LOCK_TIME,
    });
    const originalBytes = await readFile(first.path);

    await assert.rejects(maintenance.acquireMaintenanceLock({
      databasePath,
      processIdentity: OWNER_B,
      now: LOCK_TIME,
    }));

    assert.deepEqual(await readFile(first.path), originalBytes);
    assert.equal((await lstat(first.path)).mode & 0o777, 0o600);
    await first.release();
  });
});

test('rejects malformed and symlink maintenance locks without mutating targets', async () => {
  const maintenance = await loadSqliteMaintenance();

  await withTemporaryDirectory(async (directory) => {
    const databasePath = path.join(directory, 'mnfs.db');
    const maintenancePath = lockPath(databasePath);
    const targetPath = path.join(directory, 'operator-owned.txt');
    const targetBytes = Buffer.from('operator-owned');
    await writeFile(databasePath, Buffer.alloc(0));
    await writeFile(targetPath, targetBytes);
    await symlink(targetPath, maintenancePath);

    await assert.rejects(maintenance.acquireMaintenanceLock({
      databasePath,
      processIdentity: OWNER_A,
      now: LOCK_TIME,
    }));
    assert.deepEqual(await readFile(targetPath), targetBytes);
    assert.equal((await lstat(maintenancePath)).isSymbolicLink(), true);

    await rm(maintenancePath);
    const malformed = Buffer.from('{not-canonical-json');
    await writeFile(maintenancePath, malformed, { mode: 0o600 });
    await assert.rejects(maintenance.acquireMaintenanceLock({
      databasePath,
      processIdentity: OWNER_A,
      now: LOCK_TIME,
    }));
    assert.deepEqual(await readFile(maintenancePath), malformed);
  });
});

test('creates and verifies one consistent backup from an open WAL source connection', async () => {
  const maintenance = await loadSqliteMaintenance();

  await withTemporaryDirectory(async (directory) => {
    const databasePath = path.join(directory, 'mnfs.db');
    const backupPath = path.join(directory, 'backups', 'mnfs-before-v4.db');
    const source = createV3BackupSource(databasePath);
    try {
      const evidence = await maintenance.createConsistentDatabaseBackup({
        sourceDatabase: source,
        databasePath,
        backupPath,
      });

      const backupBytes = await readFile(backupPath);
      assert.equal(evidence.path, backupPath);
      assert.equal(evidence.sha256, sha256(backupBytes));
      assert.equal(evidence.integrityCheck, 'ok');
      assert.equal(evidence.userVersion, 3);
      assert.deepEqual(evidence.appliedMigrations, [1, 2, 3]);
      assert.equal(evidence.tableCounts.schema_migrations, 3);
      assert.equal(evidence.tableCounts.missions, 1);
      assert.equal(evidence.tableCounts.events, 1);
      assert.equal(evidence.tableCounts.mission_plan_revisions, 1);
      assert.deepEqual(evidence.approvedContractHashes, [M01_FIXTURE.contractHash]);

      const backup = new DatabaseSync(backupPath, { readOnly: true });
      try {
        const integrity = backup.prepare('PRAGMA integrity_check').get() as {
          integrity_check: string;
        };
        const missionCount = backup.prepare('SELECT COUNT(*) AS count FROM missions').get() as {
          count: number;
        };
        assert.equal(integrity.integrity_check, 'ok');
        assert.equal(missionCount.count, 1);
      } finally {
        backup.close();
      }
    } finally {
      source.close();
    }
  });
});

test('accepts only the supported pre-v4 and v4 schema matrices', async () => {
  const maintenance = await loadSqliteMaintenance();

  await withTemporaryDirectory(async (directory) => {
    const cases = [
      { name: 'v3-user-0', versions: [1, 2, 3], userVersion: 0, schemaVersion: 3 },
      { name: 'v3-user-3', versions: [1, 2, 3], userVersion: 3, schemaVersion: 3 },
      { name: 'v4-user-4', versions: [1, 2, 3, 4], userVersion: 4, schemaVersion: 4 },
    ] as const;

    for (const fixture of cases) {
      const databasePath = path.join(directory, `${fixture.name}.db`);
      createSchemaFixture(databasePath, fixture.versions, fixture.userVersion);
      const readiness = await maintenance.ensureDatabaseReady({
        databasePath,
        writeMode: false,
        processIdentity: OWNER_A,
        now: LOCK_TIME,
      });
      assert.equal(readiness.databasePath, databasePath);
      assert.equal(readiness.writeMode, false);
      assert.equal(readiness.schemaVersion, fixture.schemaVersion);
      assert.equal(readiness.userVersion, fixture.userVersion);
      assert.deepEqual(readiness.appliedMigrations, [...fixture.versions]);
    }
  });
});

test('rejects migration gaps and newer schemas in write mode with a stable error', async () => {
  const maintenance = await loadSqliteMaintenance();

  await withTemporaryDirectory(async (directory) => {
    const gapPath = path.join(directory, 'gap.db');
    createSchemaFixture(gapPath, [1, 3], 3);
    await assert.rejects(
      maintenance.ensureDatabaseReady({
        databasePath: gapPath,
        writeMode: true,
        processIdentity: OWNER_A,
        now: LOCK_TIME,
      }),
      (error: unknown) => {
        assert.equal((error as { code?: string }).code, 'SCHEMA_VERSION_UNSUPPORTED');
        return true;
      },
    );

    const futurePath = path.join(directory, 'future.db');
    createSchemaFixture(futurePath, [1, 2, 3, 4, 5], 5);
    await assert.rejects(
      maintenance.ensureDatabaseReady({
        databasePath: futurePath,
        writeMode: true,
        processIdentity: OWNER_A,
        now: LOCK_TIME,
      }),
      (error: unknown) => {
        assert.equal((error as { code?: string }).code, 'SCHEMA_VERSION_UNSUPPORTED');
        return true;
      },
    );
  });
});

test('openCurrent refuses unverified schema and never applies migrations implicitly', async () => {
  const maintenance = await loadSqliteMaintenance();
  const currentStore = SqliteStore as unknown as CurrentSqliteStoreConstructor;

  await withTemporaryDirectory(async (directory) => {
    const emptyPath = path.join(directory, 'empty.db');
    new DatabaseSync(emptyPath).close();
    assert.throws(() => currentStore.openCurrent(emptyPath));

    const untouched = new DatabaseSync(emptyPath, { readOnly: true });
    try {
      const migrationTable = untouched.prepare(`
        SELECT COUNT(*) AS count
        FROM sqlite_master
        WHERE type = 'table' AND name = 'schema_migrations'
      `).get() as { count: number };
      assert.equal(migrationTable.count, 0);
    } finally {
      untouched.close();
    }

    const currentPath = path.join(directory, 'current.db');
    const creator = SqliteStore.open(currentPath);
    creator.close();
    const before = new DatabaseSync(currentPath, { readOnly: true });
    const beforeRows = before.prepare(
      'SELECT version, applied_at FROM schema_migrations ORDER BY version',
    ).all();
    before.close();

    await maintenance.ensureDatabaseReady({
      databasePath: currentPath,
      writeMode: false,
      processIdentity: OWNER_A,
      now: LOCK_TIME,
    });
    const opened = currentStore.openCurrent(currentPath);
    opened.close();

    const after = new DatabaseSync(currentPath, { readOnly: true });
    try {
      assert.deepEqual(
        after.prepare('SELECT version, applied_at FROM schema_migrations ORDER BY version').all(),
        beforeRows,
      );
    } finally {
      after.close();
    }
  });
});
