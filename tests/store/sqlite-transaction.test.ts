import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';

const SQLITE_TRANSACTION_SPECIFIER = '../../src/store/' + 'sqlite-transaction.js';

interface TransactionDatabase {
  isTransaction: boolean;
  exec(sql: string): void;
}

interface SqliteTransactionInstance {
  run<T>(operation: () => T): T;
}

interface SqliteTransactionModule {
  SqliteTransaction: new (
    database: TransactionDatabase,
    sleep: (milliseconds: number) => void,
  ) => SqliteTransactionInstance;
}

function describeError(error: unknown): string {
  return error instanceof Error ? `${error.name}: ${error.message}` : String(error);
}

async function loadSqliteTransaction(): Promise<SqliteTransactionModule> {
  try {
    return await import(SQLITE_TRANSACTION_SPECIFIER) as SqliteTransactionModule;
  } catch (error) {
    assert.fail(`M01 SQLite transaction authority is not implemented: ${describeError(error)}`);
  }
}

function sqliteBusy(message = 'database is busy'): Error {
  return Object.assign(new Error(message), { code: 'SQLITE_BUSY' });
}

class ScriptedDatabase implements TransactionDatabase {
  isTransaction = false;
  readonly statements: string[] = [];
  readonly beginResults: Array<'BUSY' | 'OK'>;

  constructor(beginResults: Array<'BUSY' | 'OK'> = ['OK']) {
    this.beginResults = [...beginResults];
  }

  exec(sql: string): void {
    this.statements.push(sql);
    if (sql === 'BEGIN IMMEDIATE') {
      const result = this.beginResults.shift() ?? 'OK';
      if (result === 'BUSY') throw sqliteBusy();
      this.isTransaction = true;
      return;
    }
    if (sql === 'COMMIT' || sql === 'ROLLBACK') {
      this.isTransaction = false;
    }
  }
}

test('commits one successful operation after one BEGIN IMMEDIATE', async () => {
  const transactions = await loadSqliteTransaction();
  const database = new ScriptedDatabase();
  const sleeps: number[] = [];
  let calls = 0;
  const transaction = new transactions.SqliteTransaction(
    database,
    (milliseconds) => sleeps.push(milliseconds),
  );

  const result = transaction.run(() => {
    calls += 1;
    return 'committed';
  });

  assert.equal(result, 'committed');
  assert.equal(calls, 1);
  assert.deepEqual(database.statements, ['BEGIN IMMEDIATE', 'COMMIT']);
  assert.deepEqual(sleeps, []);
  assert.equal(database.isTransaction, false);
});

test('rolls back a real SQLite write when the operation throws', async () => {
  const transactions = await loadSqliteTransaction();
  const database = new DatabaseSync(':memory:');
  database.exec('CREATE TABLE task3_state (value TEXT NOT NULL)');
  const transaction = new transactions.SqliteTransaction(database, () => undefined);
  const failure = new Error('operation failed after state insert');

  assert.throws(
    () => transaction.run(() => {
      database.prepare('INSERT INTO task3_state (value) VALUES (?)').run('must-roll-back');
      throw failure;
    }),
    (error: unknown) => error === failure,
  );

  const row = database.prepare('SELECT COUNT(*) AS count FROM task3_state').get() as {
    count: number;
  };
  assert.equal(row.count, 0);
  assert.equal(database.isTransaction, false);
  database.close();
});

test('retries only BEGIN IMMEDIATE with exact 5, 10 and 20 millisecond delays', async () => {
  const transactions = await loadSqliteTransaction();
  const database = new ScriptedDatabase(['BUSY', 'BUSY', 'BUSY', 'BUSY']);
  const sleeps: number[] = [];
  let calls = 0;
  const transaction = new transactions.SqliteTransaction(
    database,
    (milliseconds) => sleeps.push(milliseconds),
  );

  assert.throws(
    () => transaction.run(() => {
      calls += 1;
    }),
    (error: unknown) => {
      assert.equal((error as { code?: string }).code, 'CONCURRENCY_CONFLICT');
      return true;
    },
  );

  assert.equal(calls, 0);
  assert.deepEqual(sleeps, [5, 10, 20]);
  assert.deepEqual(database.statements, [
    'BEGIN IMMEDIATE',
    'BEGIN IMMEDIATE',
    'BEGIN IMMEDIATE',
    'BEGIN IMMEDIATE',
  ]);
  assert.equal(database.isTransaction, false);
});

test('never retries user code after BEGIN succeeds, even for SQLITE_BUSY', async () => {
  const transactions = await loadSqliteTransaction();
  const database = new ScriptedDatabase(['BUSY', 'BUSY', 'OK']);
  const sleeps: number[] = [];
  let calls = 0;
  const operationFailure = sqliteBusy('busy after user code started');
  const transaction = new transactions.SqliteTransaction(
    database,
    (milliseconds) => sleeps.push(milliseconds),
  );

  assert.throws(
    () => transaction.run(() => {
      calls += 1;
      throw operationFailure;
    }),
    (error: unknown) => error === operationFailure,
  );

  assert.equal(calls, 1);
  assert.deepEqual(sleeps, [5, 10]);
  assert.deepEqual(database.statements, [
    'BEGIN IMMEDIATE',
    'BEGIN IMMEDIATE',
    'BEGIN IMMEDIATE',
    'ROLLBACK',
  ]);
  assert.equal(database.isTransaction, false);
});
