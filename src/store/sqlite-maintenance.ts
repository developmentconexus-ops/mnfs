import { createHash, randomUUID } from 'node:crypto';
import { constants } from 'node:fs';
import {
  link,
  lstat,
  mkdir,
  open,
  readFile,
  unlink,
  type FileHandle,
} from 'node:fs/promises';
import path from 'node:path';
import { backup, DatabaseSync } from 'node:sqlite';
import { TextDecoder } from 'node:util';

import { MnfsError, type MnfsErrorCode } from '../domain/errors.js';
import type { ProcessIdentity } from '../execution/model.js';

export interface MaintenanceLockFile {
  readonly path: string;
  write(bytes: Buffer): Promise<void>;
  sync(): Promise<void>;
  close(): Promise<void>;
}

export interface MaintenanceLockOperations {
  readRegularIfExists(filePath: string): Promise<Buffer | undefined>;
  createExclusive(filePath: string, mode: number): Promise<MaintenanceLockFile>;
  syncDirectory(directoryPath: string): Promise<void>;
  remove(filePath: string): Promise<void>;
}

export interface MaintenanceLockHandle {
  readonly path: string;
  readonly ownerBytes: Buffer;
  release(): Promise<void>;
}

export interface MaintenanceLockManager {
  acquire(input: {
    readonly databasePath: string;
    readonly processIdentity: ProcessIdentity;
    readonly now: string;
  }): Promise<MaintenanceLockHandle>;
}

export interface DatabaseBackupEvidence {
  readonly path: string;
  readonly sha256: string;
  readonly integrityCheck: 'ok';
  readonly userVersion: number;
  readonly appliedMigrations: readonly number[];
  readonly tableCounts: Readonly<Record<string, number>>;
  readonly approvedContractHashes: readonly string[];
}

export interface DatabaseReadiness {
  readonly databasePath: string;
  readonly writeMode: boolean;
  readonly schemaVersion: number;
  readonly userVersion: number;
  readonly appliedMigrations: readonly number[];
}

interface LockOwner {
  readonly acquiredAt: string;
  readonly processIdentity: ProcessIdentity;
}

interface SupportedSchema {
  readonly schemaVersion: number;
  readonly userVersion: number;
  readonly appliedMigrations: readonly number[];
}

const UTF8_DECODER = new TextDecoder('utf-8', { fatal: true });
const PRE_V4_MIGRATIONS = [1, 2, 3] as const;
const V4_MIGRATIONS = [1, 2, 3, 4] as const;

function maintenanceError(
  code: MnfsErrorCode,
  message: string,
  cause?: unknown,
): MnfsError {
  const suffix = cause instanceof Error ? ` ${cause.message}` : '';
  return new MnfsError(code, `${message}${suffix}`);
}

function isErrorCode(error: unknown, code: string): boolean {
  return (error as NodeJS.ErrnoException).code === code;
}

function requireCanonicalTimestamp(value: string): string {
  if (new Date(value).toISOString() !== value) {
    throw maintenanceError('INTERNAL_ERROR', `Maintenance timestamp is not canonical UTC: ${value}.`);
  }
  return value;
}

function requireProcessIdentity(identity: ProcessIdentity): ProcessIdentity {
  if (identity.bootId.length === 0 || /[\r\n]/.test(identity.bootId)) {
    throw maintenanceError('INTERNAL_ERROR', 'Maintenance process boot identity is invalid.');
  }
  if (!Number.isSafeInteger(identity.pid) || identity.pid <= 0) {
    throw maintenanceError(
      'INTERNAL_ERROR',
      `Maintenance process id must be a positive safe integer; received ${identity.pid}.`,
    );
  }
  if (!/^\d+$/.test(identity.startTicks)) {
    throw maintenanceError('INTERNAL_ERROR', 'Maintenance process start ticks are invalid.');
  }
  return identity;
}

function canonicalOwnerBytes(identity: ProcessIdentity, acquiredAt: string): Buffer {
  const validIdentity = requireProcessIdentity(identity);
  const validTimestamp = requireCanonicalTimestamp(acquiredAt);
  return Buffer.from(JSON.stringify({
    acquiredAt: validTimestamp,
    processIdentity: {
      bootId: validIdentity.bootId,
      pid: validIdentity.pid,
      startTicks: validIdentity.startTicks,
    },
  }));
}

function parseCanonicalOwner(bytes: Buffer): LockOwner {
  let parsed: unknown;
  try {
    parsed = JSON.parse(UTF8_DECODER.decode(bytes)) as unknown;
  } catch (error) {
    throw maintenanceError('INTERNAL_ERROR', 'Maintenance lock metadata is malformed.', error);
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw maintenanceError('INTERNAL_ERROR', 'Maintenance lock metadata is not an object.');
  }
  const record = parsed as Readonly<Record<string, unknown>>;
  const processIdentity = record.processIdentity;
  if (
    typeof record.acquiredAt !== 'string'
    || typeof processIdentity !== 'object'
    || processIdentity === null
    || Array.isArray(processIdentity)
  ) {
    throw maintenanceError('INTERNAL_ERROR', 'Maintenance lock owner metadata is incomplete.');
  }
  const identityRecord = processIdentity as Readonly<Record<string, unknown>>;
  if (
    typeof identityRecord.bootId !== 'string'
    || typeof identityRecord.pid !== 'number'
    || typeof identityRecord.startTicks !== 'string'
  ) {
    throw maintenanceError('INTERNAL_ERROR', 'Maintenance lock process identity is incomplete.');
  }

  const owner: LockOwner = {
    acquiredAt: requireCanonicalTimestamp(record.acquiredAt),
    processIdentity: requireProcessIdentity({
      bootId: identityRecord.bootId,
      pid: identityRecord.pid,
      startTicks: identityRecord.startTicks,
    }),
  };
  if (!bytes.equals(canonicalOwnerBytes(owner.processIdentity, owner.acquiredAt))) {
    throw maintenanceError('INTERNAL_ERROR', 'Maintenance lock metadata is not canonical JSON.');
  }
  return owner;
}

async function closeQuietly(file: MaintenanceLockFile | undefined): Promise<void> {
  if (file === undefined) return;
  try {
    await file.close();
  } catch {
    // Preserve the primary acquisition failure. A partially published lock
    // remains fail-closed and must be inspected rather than guessed away.
  }
}

export function createMaintenanceLockManager(
  operations: MaintenanceLockOperations,
): MaintenanceLockManager {
  return {
    async acquire(input): Promise<MaintenanceLockHandle> {
      const maintenancePath = `${input.databasePath}.maintenance.lock`;
      const directoryPath = path.dirname(maintenancePath);
      const ownerBytes = canonicalOwnerBytes(input.processIdentity, input.now);
      const existing = await operations.readRegularIfExists(maintenancePath);
      if (existing !== undefined) {
        const owner = parseCanonicalOwner(existing);
        throw maintenanceError(
          'CONCURRENCY_CONFLICT',
          `SQLite maintenance is already owned by pid ${owner.processIdentity.pid} from ${owner.acquiredAt}.`,
        );
      }

      let lockFile: MaintenanceLockFile | undefined;
      try {
        lockFile = await operations.createExclusive(maintenancePath, 0o600);
        if (lockFile.path !== maintenancePath) {
          throw maintenanceError(
            'INTERNAL_ERROR',
            `Maintenance lock operation returned unexpected path ${lockFile.path}.`,
          );
        }
        await lockFile.write(ownerBytes);
        await lockFile.sync();
        await lockFile.close();
        await operations.syncDirectory(directoryPath);
      } catch (error) {
        await closeQuietly(lockFile);
        if (isErrorCode(error, 'EEXIST')) {
          const raced = await operations.readRegularIfExists(maintenancePath);
          if (raced !== undefined) parseCanonicalOwner(raced);
          throw maintenanceError(
            'CONCURRENCY_CONFLICT',
            `SQLite maintenance lock was acquired concurrently: ${maintenancePath}.`,
          );
        }
        throw error instanceof MnfsError
          ? error
          : maintenanceError(
            'INTERNAL_ERROR',
            `Failed to publish SQLite maintenance lock ${maintenancePath}.`,
            error,
          );
      }

      let released = false;
      return {
        path: maintenancePath,
        ownerBytes: Buffer.from(ownerBytes),
        async release(): Promise<void> {
          if (released) return;
          const current = await operations.readRegularIfExists(maintenancePath);
          if (current === undefined || !current.equals(ownerBytes)) {
            throw maintenanceError(
              'CONCURRENCY_CONFLICT',
              `SQLite maintenance lock ownership changed before release: ${maintenancePath}.`,
            );
          }
          await operations.remove(maintenancePath);
          await operations.syncDirectory(directoryPath);
          released = true;
        },
      };
    },
  };
}

async function readRegularIfExists(filePath: string): Promise<Buffer | undefined> {
  let metadata;
  try {
    metadata = await lstat(filePath);
  } catch (error) {
    if (isErrorCode(error, 'ENOENT')) return undefined;
    throw maintenanceError('INTERNAL_ERROR', `Failed to inspect ${filePath}.`, error);
  }
  if (!metadata.isFile()) {
    throw maintenanceError('INTERNAL_ERROR', `Maintenance path is not a regular file: ${filePath}.`);
  }

  let handle: FileHandle | undefined;
  try {
    handle = await open(filePath, constants.O_RDONLY | constants.O_NOFOLLOW);
    const openedMetadata = await handle.stat();
    if (!openedMetadata.isFile()) {
      throw maintenanceError(
        'INTERNAL_ERROR',
        `Maintenance path changed away from a regular file: ${filePath}.`,
      );
    }
    return await handle.readFile();
  } catch (error) {
    throw error instanceof MnfsError
      ? error
      : maintenanceError('INTERNAL_ERROR', `Failed to read ${filePath}.`, error);
  } finally {
    await handle?.close();
  }
}

const defaultLockOperations: MaintenanceLockOperations = {
  readRegularIfExists,

  async createExclusive(filePath, mode) {
    const handle = await open(
      filePath,
      constants.O_WRONLY
        | constants.O_CREAT
        | constants.O_EXCL
        | constants.O_NOFOLLOW,
      mode,
    );
    await handle.chmod(mode);
    let closed = false;
    return {
      path: filePath,
      async write(bytes) {
        await handle.writeFile(bytes);
      },
      async sync() {
        await handle.sync();
      },
      async close() {
        if (!closed) {
          closed = true;
          await handle.close();
        }
      },
    };
  },

  async syncDirectory(directoryPath) {
    const directory = await open(
      directoryPath,
      constants.O_RDONLY | constants.O_DIRECTORY,
    );
    try {
      await directory.sync();
    } finally {
      await directory.close();
    }
  },

  async remove(filePath) {
    await unlink(filePath);
  },
};

const defaultLockManager = createMaintenanceLockManager(defaultLockOperations);

export async function acquireMaintenanceLock(input: {
  readonly databasePath: string;
  readonly processIdentity: ProcessIdentity;
  readonly now: string;
}): Promise<MaintenanceLockHandle> {
  return await defaultLockManager.acquire(input);
}

function firstScalar(row: Readonly<Record<string, unknown>> | undefined): unknown {
  if (row === undefined) return undefined;
  return Object.values(row)[0];
}

function tableExists(database: DatabaseSync, tableName: string): boolean {
  const row = database.prepare(`
    SELECT COUNT(*) AS count
    FROM sqlite_master
    WHERE type = 'table' AND name = ?
  `).get(tableName) as { readonly count: number } | undefined;
  return Number(row?.count ?? 0) === 1;
}

function readAppliedMigrations(database: DatabaseSync): number[] {
  if (!tableExists(database, 'schema_migrations')) return [];
  return database
    .prepare('SELECT version FROM schema_migrations ORDER BY version')
    .all()
    .map((row) => Number(row.version));
}

function equalVersions(
  actual: readonly number[],
  expected: readonly number[],
): boolean {
  return actual.length === expected.length
    && actual.every((version, index) => version === expected[index]);
}

export function inspectSupportedDatabaseSchema(
  database: DatabaseSync,
  writeMode: boolean,
): SupportedSchema {
  const integrity = String(firstScalar(
    database.prepare('PRAGMA integrity_check').get() as Readonly<Record<string, unknown>>,
  ));
  if (integrity !== 'ok') {
    throw maintenanceError(
      'SCHEMA_MIGRATION_INVALID',
      `SQLite integrity check failed before ${writeMode ? 'write' : 'read'} mode: ${integrity}.`,
    );
  }

  const appliedMigrations = readAppliedMigrations(database);
  const userVersion = Number(firstScalar(
    database.prepare('PRAGMA user_version').get() as Readonly<Record<string, unknown>>,
  ));

  if (
    equalVersions(appliedMigrations, PRE_V4_MIGRATIONS)
    && (userVersion === 0 || userVersion === 3)
  ) {
    return { schemaVersion: 3, userVersion, appliedMigrations };
  }
  if (equalVersions(appliedMigrations, V4_MIGRATIONS) && userVersion === 4) {
    return { schemaVersion: 4, userVersion, appliedMigrations };
  }

  throw maintenanceError(
    'SCHEMA_VERSION_UNSUPPORTED',
    `Unsupported SQLite schema for ${writeMode ? 'write' : 'read'} mode: migrations [${
      appliedMigrations.join(', ')
    }], user_version ${userVersion}.`,
  );
}

export async function ensureDatabaseReady(input: {
  readonly databasePath: string;
  readonly writeMode: boolean;
  readonly processIdentity: ProcessIdentity;
  readonly now: string;
}): Promise<DatabaseReadiness> {
  let lock: MaintenanceLockHandle | undefined;
  try {
    if (input.writeMode) {
      lock = await acquireMaintenanceLock({
        databasePath: input.databasePath,
        processIdentity: input.processIdentity,
        now: input.now,
      });
    }

    let database: DatabaseSync | undefined;
    try {
      database = new DatabaseSync(input.databasePath, { readOnly: true });
      const schema = inspectSupportedDatabaseSchema(database, input.writeMode);
      return {
        databasePath: input.databasePath,
        writeMode: input.writeMode,
        schemaVersion: schema.schemaVersion,
        userVersion: schema.userVersion,
        appliedMigrations: schema.appliedMigrations,
      };
    } catch (error) {
      throw error instanceof MnfsError
        ? error
        : maintenanceError(
          'SCHEMA_VERSION_UNSUPPORTED',
          `Could not inspect SQLite database ${input.databasePath}.`,
          error,
        );
    } finally {
      database?.close();
    }
  } finally {
    await lock?.release();
  }
}

function quoteIdentifier(identifier: string): string {
  return `"${identifier.replaceAll('"', '""')}"`;
}

function collectBackupEvidence(database: DatabaseSync): Omit<DatabaseBackupEvidence, 'path' | 'sha256'> {
  const integrityCheck = String(firstScalar(
    database.prepare('PRAGMA integrity_check').get() as Readonly<Record<string, unknown>>,
  ));
  if (integrityCheck !== 'ok') {
    throw maintenanceError(
      'SCHEMA_MIGRATION_INVALID',
      `SQLite backup integrity check failed: ${integrityCheck}.`,
    );
  }

  const userVersion = Number(firstScalar(
    database.prepare('PRAGMA user_version').get() as Readonly<Record<string, unknown>>,
  ));
  const appliedMigrations = readAppliedMigrations(database);
  const tableNames = database.prepare(`
    SELECT name
    FROM sqlite_master
    WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
    ORDER BY name
  `).all().map((row) => String(row.name));
  const tableCounts: Record<string, number> = {};
  for (const tableName of tableNames) {
    const count = database.prepare(
      `SELECT COUNT(*) AS count FROM ${quoteIdentifier(tableName)}`,
    ).get() as { readonly count: number } | undefined;
    tableCounts[tableName] = Number(count?.count ?? 0);
  }

  const approvedContractHashes = tableExists(database, 'mission_plan_revisions')
    ? database.prepare(`
        SELECT content_hash
        FROM mission_plan_revisions
        WHERE status = 'APPROVED'
        ORDER BY content_hash
      `).all().map((row) => String(row.content_hash))
    : [];

  return {
    integrityCheck: 'ok',
    userVersion,
    appliedMigrations,
    tableCounts,
    approvedContractHashes,
  };
}

async function syncRegularFile(filePath: string): Promise<void> {
  const file = await open(filePath, constants.O_RDWR | constants.O_NOFOLLOW);
  try {
    const metadata = await file.stat();
    if (!metadata.isFile()) {
      throw maintenanceError('INTERNAL_ERROR', `Backup path is not a regular file: ${filePath}.`);
    }
    await file.chmod(0o600);
    await file.sync();
  } finally {
    await file.close();
  }
}

async function syncDirectory(directoryPath: string): Promise<void> {
  const directory = await open(
    directoryPath,
    constants.O_RDONLY | constants.O_DIRECTORY,
  );
  try {
    await directory.sync();
  } finally {
    await directory.close();
  }
}

export async function createConsistentDatabaseBackup(input: {
  readonly sourceDatabase: DatabaseSync;
  readonly databasePath: string;
  readonly backupPath: string;
}): Promise<DatabaseBackupEvidence> {
  if (path.resolve(input.databasePath) === path.resolve(input.backupPath)) {
    throw maintenanceError('INTERNAL_ERROR', 'SQLite backup path must differ from the source path.');
  }

  const backupDirectory = path.dirname(input.backupPath);
  await mkdir(backupDirectory, { recursive: true });
  const existing = await readRegularIfExists(input.backupPath);
  if (existing !== undefined) {
    throw maintenanceError('INTERNAL_ERROR', `SQLite backup already exists: ${input.backupPath}.`);
  }

  const temporaryPath = path.join(
    backupDirectory,
    `.${path.basename(input.backupPath)}.${randomUUID()}.tmp`,
  );
  let published = false;
  try {
    await backup(input.sourceDatabase, temporaryPath);
    await syncRegularFile(temporaryPath);

    const verified = new DatabaseSync(temporaryPath, { readOnly: true });
    let evidence: Omit<DatabaseBackupEvidence, 'path' | 'sha256'>;
    try {
      evidence = collectBackupEvidence(verified);
    } finally {
      verified.close();
    }

    await link(temporaryPath, input.backupPath);
    published = true;
    await unlink(temporaryPath);
    await syncDirectory(backupDirectory);
    const backupBytes = await readFile(input.backupPath);

    return {
      path: input.backupPath,
      sha256: `sha256:${createHash('sha256').update(backupBytes).digest('hex')}`,
      ...evidence,
    };
  } catch (error) {
    if (!published) {
      try {
        await unlink(temporaryPath);
      } catch (cleanupError) {
        if (!isErrorCode(cleanupError, 'ENOENT')) {
          // The primary error remains authoritative. The exclusive temporary
          // path is never accepted as final Evidence and can be inspected.
        }
      }
    }
    throw error instanceof MnfsError
      ? error
      : maintenanceError(
        'INTERNAL_ERROR',
        `Failed to create consistent SQLite backup for ${input.databasePath}.`,
        error,
      );
  }
}
