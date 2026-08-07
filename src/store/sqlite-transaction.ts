import type { DatabaseSync } from 'node:sqlite';

import { MnfsError } from '../domain/errors.js';

const BEGIN_RETRY_DELAYS_MS = [5, 10, 20] as const;

export interface TransactionDatabase {
  readonly isTransaction: boolean;
  exec(sql: string): void;
}

function sleepSynchronously(milliseconds: number): void {
  const signal = new Int32Array(new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT));
  Atomics.wait(signal, 0, 0, milliseconds);
}

function isSqliteBusy(error: unknown): boolean {
  const candidate = error as {
    readonly code?: unknown;
    readonly errcode?: unknown;
    readonly message?: unknown;
  };
  return candidate.code === 'SQLITE_BUSY'
    || candidate.errcode === 5
    || (
      candidate.code === 'ERR_SQLITE_ERROR'
      && typeof candidate.message === 'string'
      && /database is (?:busy|locked)/i.test(candidate.message)
    );
}

export class SqliteTransaction {
  constructor(
    readonly database: TransactionDatabase | DatabaseSync,
    readonly sleep: (milliseconds: number) => void = sleepSynchronously,
  ) {}

  run<T>(operation: () => T): T {
    for (let attempt = 0; ; attempt += 1) {
      try {
        this.database.exec('BEGIN IMMEDIATE');
        break;
      } catch (error) {
        const delay = BEGIN_RETRY_DELAYS_MS[attempt];
        if (!isSqliteBusy(error)) {
          throw error;
        }
        if (delay === undefined) {
          throw new MnfsError(
            'CONCURRENCY_CONFLICT',
            'Could not acquire the SQLite write transaction after bounded retries.',
          );
        }
        this.sleep(delay);
      }
    }

    try {
      const result = operation();
      this.database.exec('COMMIT');
      return result;
    } catch (error) {
      if (this.database.isTransaction) {
        try {
          this.database.exec('ROLLBACK');
        } catch (rollbackError) {
          throw new MnfsError(
            'INTERNAL_ERROR',
            `SQLite rollback failed after an operation error: ${
              rollbackError instanceof Error ? rollbackError.message : String(rollbackError)
            }`,
          );
        }
      }
      throw error;
    }
  }
}
