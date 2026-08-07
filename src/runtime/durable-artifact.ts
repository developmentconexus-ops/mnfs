import { randomUUID } from 'node:crypto';
import { constants } from 'node:fs';
import {
  link,
  lstat,
  open,
  unlink,
  type FileHandle,
} from 'node:fs/promises';
import path from 'node:path';

import { MnfsError } from '../domain/errors.js';

export interface DurableTemporaryFile {
  readonly path: string;
  write(bytes: Buffer): Promise<void>;
  sync(): Promise<void>;
  close(): Promise<void>;
}

export interface DurableArtifactOperations {
  readRegularIfExists(filePath: string): Promise<Buffer | undefined>;
  createTemporary(finalPath: string, mode: number): Promise<DurableTemporaryFile>;
  rename(temporaryPath: string, finalPath: string): Promise<void>;
  syncDirectory(directoryPath: string): Promise<void>;
  removeTemporary(temporaryPath: string): Promise<void>;
}

export interface DurableArtifactWriter {
  writeDurableFile(filePath: string, bytes: Buffer, mode: number): Promise<void>;
}

function artifactError(message: string, cause?: unknown): MnfsError {
  const suffix = cause instanceof Error ? ` ${cause.message}` : '';
  return new MnfsError('INTERNAL_ERROR', `${message}${suffix}`);
}

function isErrorCode(error: unknown, code: string): boolean {
  return (error as NodeJS.ErrnoException).code === code;
}

function requireFileMode(mode: number): number {
  if (!Number.isSafeInteger(mode) || mode < 0 || mode > 0o777) {
    throw artifactError(`Artifact mode must be an integer from 000 through 777; received ${mode}.`);
  }
  return mode;
}

async function closeQuietly(file: DurableTemporaryFile | undefined): Promise<void> {
  if (file === undefined) {
    return;
  }
  try {
    await file.close();
  } catch {
    // Cleanup is best effort after the primary failure. The temporary path is
    // still removed below and the original error remains authoritative.
  }
}

export function createDurableArtifactWriter(
  operations: DurableArtifactOperations,
): DurableArtifactWriter {
  return {
    async writeDurableFile(filePath, bytes, mode): Promise<void> {
      requireFileMode(mode);
      const existing = await operations.readRegularIfExists(filePath);
      if (existing !== undefined) {
        if (existing.equals(bytes)) {
          return;
        }
        throw artifactError(`Artifact already exists with different bytes: ${filePath}.`);
      }

      let temporary: DurableTemporaryFile | undefined;
      let closed = false;
      try {
        temporary = await operations.createTemporary(filePath, mode);
        await temporary.write(bytes);
        await temporary.sync();
        await temporary.close();
        closed = true;
        await operations.rename(temporary.path, filePath);
        await operations.syncDirectory(path.dirname(filePath));
      } catch (error) {
        if (!closed) {
          await closeQuietly(temporary);
        }
        if (temporary !== undefined) {
          try {
            await operations.removeTemporary(temporary.path);
          } catch {
            // Preserve the primary failure. A same-directory exclusive temp is
            // never accepted as final Evidence and can be inspected manually.
          }
        }

        if (isErrorCode(error, 'EEXIST')) {
          const concurrent = await operations.readRegularIfExists(filePath);
          if (concurrent !== undefined && concurrent.equals(bytes)) {
            return;
          }
        }
        throw error instanceof MnfsError
          ? error
          : artifactError(`Failed to publish durable Artifact ${filePath}.`, error);
      }
    },
  };
}

async function readRegularIfExists(filePath: string): Promise<Buffer | undefined> {
  let metadata;
  try {
    metadata = await lstat(filePath);
  } catch (error) {
    if (isErrorCode(error, 'ENOENT')) {
      return undefined;
    }
    throw artifactError(`Failed to inspect Artifact ${filePath}.`, error);
  }

  if (!metadata.isFile()) {
    throw artifactError(`Artifact path is not a regular file: ${filePath}.`);
  }

  let file: FileHandle | undefined;
  try {
    file = await open(filePath, constants.O_RDONLY | constants.O_NOFOLLOW);
    const openedMetadata = await file.stat();
    if (!openedMetadata.isFile()) {
      throw artifactError(`Artifact path changed away from a regular file: ${filePath}.`);
    }
    return await file.readFile();
  } catch (error) {
    throw error instanceof MnfsError
      ? error
      : artifactError(`Failed to read regular Artifact ${filePath}.`, error);
  } finally {
    await file?.close();
  }
}

const defaultOperations: DurableArtifactOperations = {
  readRegularIfExists,

  async createTemporary(finalPath, mode) {
    const directory = path.dirname(finalPath);
    const basename = path.basename(finalPath);
    const temporaryPath = path.join(directory, `.${basename}.${randomUUID()}.tmp`);
    const handle = await open(
      temporaryPath,
      constants.O_WRONLY
        | constants.O_CREAT
        | constants.O_EXCL
        | constants.O_NOFOLLOW,
      requireFileMode(mode),
    );
    await handle.chmod(mode);
    let isClosed = false;

    return {
      path: temporaryPath,
      async write(bytes) {
        await handle.writeFile(bytes);
      },
      async sync() {
        await handle.sync();
      },
      async close() {
        if (!isClosed) {
          isClosed = true;
          await handle.close();
        }
      },
    };
  },

  async rename(temporaryPath, finalPath) {
    // Linking a fully-synced inode publishes the final name atomically without
    // overwriting an existing immutable Artifact. Removing the temporary name
    // is hidden behind this operation so callers retain the approved
    // write/fsync/close/publish/directory-fsync sequence.
    await link(temporaryPath, finalPath);
    await unlink(temporaryPath);
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

  async removeTemporary(temporaryPath) {
    try {
      await unlink(temporaryPath);
    } catch (error) {
      if (!isErrorCode(error, 'ENOENT')) {
        throw error;
      }
    }
  },
};

const defaultWriter = createDurableArtifactWriter(defaultOperations);

export async function writeDurableFile(
  filePath: string,
  bytes: Buffer,
  mode: number,
): Promise<void> {
  await defaultWriter.writeDurableFile(filePath, bytes, mode);
}

export async function readRegularFileNoSymlink(filePath: string): Promise<Buffer> {
  const bytes = await readRegularIfExists(filePath);
  if (bytes === undefined) {
    throw artifactError(`Artifact does not exist: ${filePath}.`);
  }
  return bytes;
}
