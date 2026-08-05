import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';

import type { Attempt, WriteTrack } from '../../src/execution/model.js';
import type { AppendEventInput } from '../../src/store/event-store.js';
import type {
  AllocateAttemptInput,
  AllocateWriteTrackInput,
  ExecutionStore,
} from '../../src/store/execution-store.js';
import { SqliteStore } from '../../src/store/sqlite-store.js';
import { M01_FIXTURE } from '../support/m01-fixtures.js';

const OCCURRED_AT = '2026-08-04T23:30:00.000Z';
const BASE_COMMIT = '1'.repeat(40);
const INPUT_HASH = `sha256:${'a'.repeat(64)}`;

interface AtomicExecutionSession {
  allocateWriteTrack(input: AllocateWriteTrackInput): WriteTrack;
  allocateAttempt(input: AllocateAttemptInput): Attempt;
  appendEvent(input: AppendEventInput): void;
}

interface AtomicExecutionStore extends ExecutionStore {
  runAtomic<T>(operation: (session: AtomicExecutionSession) => T): T;
}

interface Harness {
  readonly directory: string;
  readonly databasePath: string;
  readonly store: SqliteStore;
  readonly execution: ExecutionStore;
}

function withHarness(label: string, operation: (harness: Harness) => void): void {
  const directory = mkdtempSync(join(tmpdir(), `mnfs-m01-task6-correction-${label}-`));
  const databasePath = join(directory, 'mnfs.db');
  const store = SqliteStore.open(databasePath);
  try {
    store.openMission({
      missionId: 'MIS-002',
      eventId: `EVT-MIS-002-TASK6-CORRECTION-${label.toUpperCase()}-OPEN`,
      goal: 'Prove Task 6 correction boundaries',
      openedAt: OCCURRED_AT,
    });
    operation({ directory, databasePath, store, execution: store.execution });
  } finally {
    store.close();
    rmSync(directory, { recursive: true, force: true });
  }
}

function openControl(databasePath: string): DatabaseSync {
  const database = new DatabaseSync(databasePath);
  database.exec('PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;');
  return database;
}

function tableCount(databasePath: string, tableName: string): number {
  const database = new DatabaseSync(databasePath, { readOnly: true });
  try {
    const row = database.prepare(`SELECT COUNT(*) AS count FROM "${tableName}"`).get() as {
      readonly count: number;
    };
    return Number(row.count);
  } finally {
    database.close();
  }
}

function allocateTrack(execution: ExecutionStore, feature: string): WriteTrack {
  return execution.allocateWriteTrack({
    missionId: 'MIS-002',
    milestoneQualifiedId: 'MIS-002/M01',
    featureQualifiedId: `MIS-002/M01/${feature}`,
    contractHash: M01_FIXTURE.contractHash,
    occurredAt: OCCURRED_AT,
  });
}

function allocateAttempt(execution: ExecutionStore, track: WriteTrack): Attempt {
  return execution.allocateAttempt({
    writeTrackId: track.id,
    contractHash: track.contractHash,
    gitObjectFormat: 'sha1',
    baseCommitSha: BASE_COMMIT,
    occurredAt: OCCURRED_AT,
  });
}

function requireAtomicStore(execution: ExecutionStore): AtomicExecutionStore {
  const atomic = execution as AtomicExecutionStore;
  assert.equal(
    typeof atomic.runAtomic,
    'function',
    'ExecutionStore must expose one bounded atomic composition seam for Task 7 services.',
  );
  return atomic;
}

function appendTrackOpened(
  session: AtomicExecutionSession,
  eventId: string,
  track: WriteTrack,
): void {
  session.appendEvent({
    eventId,
    type: 'WRITE_TRACK_OPENED',
    payloadSchemaVersion: 1,
    missionId: track.missionId,
    occurredAt: OCCURRED_AT,
    payload: {
      writeTrackId: track.id,
      featureQualifiedId: track.featureQualifiedId,
      contractHash: track.contractHash,
    },
  });
}

function appendAttemptOpened(
  session: AtomicExecutionSession,
  eventId: string,
  track: WriteTrack,
  attempt: Attempt,
): void {
  session.appendEvent({
    eventId,
    type: 'ATTEMPT_OPENED',
    payloadSchemaVersion: 1,
    missionId: track.missionId,
    occurredAt: OCCURRED_AT,
    payload: {
      writeTrackId: track.id,
      attemptId: attempt.id,
      baseCommitSha: attempt.baseCommitSha,
      contractHash: attempt.contractHash,
    },
  });
}

test('schema v4 contains the accepted persisted entity sequence authority', () => {
  withHarness('sequence-schema', ({ databasePath }) => {
    const database = new DatabaseSync(databasePath, { readOnly: true });
    try {
      const columns = database.prepare('PRAGMA table_info(entity_sequences)').all().map((row) => ({
        name: String(row.name),
        notNull: Number(row.notnull),
        primaryKey: Number(row.pk),
      }));
      assert.deepEqual(columns, [
        { name: 'kind', notNull: 0, primaryKey: 1 },
        { name: 'next_value', notNull: 1, primaryKey: 0 },
      ]);

      const row = database.prepare(`
        SELECT sql
        FROM sqlite_master
        WHERE type = 'table' AND name = 'entity_sequences'
      `).get() as { readonly sql?: string } | undefined;
      assert.ok(row?.sql);
      assert.match(row.sql, /kind\s+IN\s*\(\s*'WRITE_TRACK'\s*,\s*'LEASE'\s*\)/i);
      assert.match(row.sql, /next_value\s*>\s*0/i);
    } finally {
      database.close();
    }
  });
});

test('Write Track identities consume a persisted sequence and are never reused', () => {
  withHarness('write-track-sequence', ({ databasePath, execution }) => {
    const first = allocateTrack(execution, 'F01');
    assert.equal(first.id, 'WT-001');

    const control = openControl(databasePath);
    try {
      control.prepare('DELETE FROM write_tracks WHERE id = ?').run(first.id);
    } finally {
      control.close();
    }

    const second = allocateTrack(execution, 'F02');
    assert.equal(second.id, 'WT-002');

    const database = new DatabaseSync(databasePath, { readOnly: true });
    try {
      const sequence = database.prepare(`
        SELECT next_value
        FROM entity_sequences
        WHERE kind = 'WRITE_TRACK'
      `).get() as { readonly next_value?: number } | undefined;
      assert.equal(Number(sequence?.next_value), 3);
    } finally {
      database.close();
    }
  });
});

test('Lease identities consume a persisted global sequence and are never reused', () => {
  withHarness('lease-sequence', ({ databasePath, execution }) => {
    const track = allocateTrack(execution, 'F01');
    const attempt = allocateAttempt(execution, track);
    const first = execution.allocateLease({
      writeTrackId: track.id,
      attemptId: attempt.id,
      contractHash: track.contractHash,
      grantIdempotencyKey: 'lease:correction:first',
      grantInputHash: INPUT_HASH,
      holder: 'mnfs-task6-correction',
      occurredAt: OCCURRED_AT,
    });
    assert.equal(first.id, 'LSE-001');

    const control = openControl(databasePath);
    try {
      control.prepare('DELETE FROM leases WHERE id = ?').run(first.id);
    } finally {
      control.close();
    }

    const second = execution.allocateLease({
      writeTrackId: track.id,
      attemptId: attempt.id,
      contractHash: track.contractHash,
      grantIdempotencyKey: 'lease:correction:second',
      grantInputHash: `sha256:${'b'.repeat(64)}`,
      holder: 'mnfs-task6-correction',
      occurredAt: OCCURRED_AT,
    });
    assert.equal(second.id, 'LSE-002');

    const database = new DatabaseSync(databasePath, { readOnly: true });
    try {
      const sequence = database.prepare(`
        SELECT next_value
        FROM entity_sequences
        WHERE kind = 'LEASE'
      `).get() as { readonly next_value?: number } | undefined;
      assert.equal(Number(sequence?.next_value), 3);
    } finally {
      database.close();
    }
  });
});

test('one bounded atomic seam commits Track, A01 and both matching Events together', () => {
  withHarness('atomic-success', ({ store, execution }) => {
    const atomic = requireAtomicStore(execution);
    const lineage = atomic.runAtomic((session) => {
      const track = session.allocateWriteTrack({
        missionId: 'MIS-002',
        milestoneQualifiedId: 'MIS-002/M01',
        featureQualifiedId: 'MIS-002/M01/F01',
        contractHash: M01_FIXTURE.contractHash,
        occurredAt: OCCURRED_AT,
      });
      const attempt = session.allocateAttempt({
        writeTrackId: track.id,
        contractHash: track.contractHash,
        gitObjectFormat: 'sha1',
        baseCommitSha: BASE_COMMIT,
        occurredAt: OCCURRED_AT,
      });
      appendTrackOpened(session, 'EVT-MIS-002-TASK6-CORRECTION-WT-OPEN', track);
      appendAttemptOpened(
        session,
        'EVT-MIS-002-TASK6-CORRECTION-A01-OPEN',
        track,
        attempt,
      );
      return { track, attempt };
    });

    assert.equal(lineage.track.id, 'WT-001');
    assert.equal(lineage.attempt.id, 'WT-001/A01');
    assert.deepEqual(
      store.listEvents().map((event) => event.type),
      ['MISSION_OPENED', 'WRITE_TRACK_OPENED', 'ATTEMPT_OPENED'],
    );
  });
});

test('an Event conflict rolls back Track, Attempt and the first Event from the atomic seam', () => {
  withHarness('atomic-rollback', ({ databasePath, store, execution }) => {
    const atomic = requireAtomicStore(execution);
    const duplicateEventId = 'EVT-MIS-002-TASK6-CORRECTION-DUPLICATE';

    assert.throws(() => atomic.runAtomic((session) => {
      const track = session.allocateWriteTrack({
        missionId: 'MIS-002',
        milestoneQualifiedId: 'MIS-002/M01',
        featureQualifiedId: 'MIS-002/M01/F01',
        contractHash: M01_FIXTURE.contractHash,
        occurredAt: OCCURRED_AT,
      });
      const attempt = session.allocateAttempt({
        writeTrackId: track.id,
        contractHash: track.contractHash,
        gitObjectFormat: 'sha1',
        baseCommitSha: BASE_COMMIT,
        occurredAt: OCCURRED_AT,
      });
      appendTrackOpened(session, duplicateEventId, track);
      appendAttemptOpened(session, duplicateEventId, track, attempt);
    }));

    assert.equal(tableCount(databasePath, 'write_tracks'), 0);
    assert.equal(tableCount(databasePath, 'attempts'), 0);
    assert.deepEqual(
      store.listEvents().map((event) => event.type),
      ['MISSION_OPENED'],
    );
  });
});
