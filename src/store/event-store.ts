import type { DatabaseSync } from 'node:sqlite';

import { MnfsError } from '../domain/errors.js';
import { canonicalJson } from '../domain/mission-plan.js';
import type { MissionEvent } from '../domain/types.js';

export interface AppendEventInput {
  readonly eventId: string;
  readonly type: MissionEvent['type'];
  readonly payloadSchemaVersion: number;
  readonly missionId: string;
  readonly occurredAt: string;
  readonly payload: Readonly<Record<string, unknown>>;
}

function requirePayloadSchemaVersion(value: number): number {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new MnfsError(
      'INTERNAL_ERROR',
      `Event payload schema version must be a positive safe integer; received ${value}.`,
    );
  }
  return value;
}

function eventFromRow(row: Readonly<Record<string, unknown>>): MissionEvent {
  const payloadSchemaVersion = Number(row.payload_schema_version);
  if (payloadSchemaVersion !== 1) {
    throw new MnfsError(
      'INTERNAL_ERROR',
      `Unsupported persisted Event payload schema version ${payloadSchemaVersion}.`,
    );
  }

  let payload: unknown;
  try {
    payload = JSON.parse(String(row.payload_json)) as unknown;
  } catch (error) {
    const detail = error instanceof Error ? ` ${error.message}` : '';
    throw new MnfsError('INTERNAL_ERROR', `Persisted Event payload is invalid JSON.${detail}`);
  }
  if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
    throw new MnfsError('INTERNAL_ERROR', 'Persisted Event payload is not a JSON object.');
  }

  return {
    seq: Number(row.seq),
    eventId: String(row.event_id),
    type: String(row.type) as MissionEvent['type'],
    payloadSchemaVersion: 1,
    missionId: String(row.mission_id),
    occurredAt: String(row.occurred_at),
    payload: payload as Readonly<Record<string, unknown>>,
  } as MissionEvent;
}

export class EventStore {
  readonly #database: DatabaseSync;

  constructor(database: DatabaseSync) {
    this.#database = database;
  }

  append(input: AppendEventInput): void {
    this.#database.prepare(`
      INSERT INTO events (
        event_id,
        type,
        payload_schema_version,
        mission_id,
        occurred_at,
        payload_json
      ) VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      input.eventId,
      input.type,
      requirePayloadSchemaVersion(input.payloadSchemaVersion),
      input.missionId,
      input.occurredAt,
      canonicalJson(input.payload),
    );
  }

  list(): MissionEvent[] {
    return this.#database.prepare(`
      SELECT
        seq,
        event_id,
        type,
        payload_schema_version,
        mission_id,
        occurred_at,
        payload_json
      FROM events
      ORDER BY seq
    `).all().map(eventFromRow);
  }
}
