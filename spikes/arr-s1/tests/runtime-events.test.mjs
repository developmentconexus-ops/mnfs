import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createRuntimeEventRecorder,
  normalizeProcessObservation,
  normalizeRuntimeEvent,
} from '../src/runtime-events.mjs';

test('normalizes candidate-neutral structured runtime events without parsing human text', () => {
  const event = normalizeRuntimeEvent({
    type: 'tool_call',
    data: { toolId: 'read_nonce_file', input: { path: 'fixture/nonce.txt' } },
  }, { sequence: 4, timestampMs: 123 });
  assert.deepEqual(event, {
    sequence: 4,
    timestampMs: 123,
    type: 'tool_call',
    data: { toolId: 'read_nonce_file', input: { path: 'fixture/nonce.txt' } },
    truncation: { event: false, textPaths: [] },
  });
  assert.throws(
    () => normalizeRuntimeEvent({ type: 'human_tui_line', data: 'tool read succeeded' }),
    /unsupported.*event/u,
  );
  assert.throws(
    () => normalizeRuntimeEvent('tool read succeeded'),
    /structured.*object/u,
  );
});

test('normalizes process death and cancellation as distinct neutral observations', () => {
  assert.deepEqual(
    normalizeProcessObservation({ status: 'SIGNALED', signal: 'SIGTERM', exitCode: null, outcome: 'SIGNAL_DEATH' }, { sequence: 1 }),
    {
      sequence: 1,
      timestampMs: null,
      type: 'process',
      data: { status: 'SIGNALED', signal: 'SIGTERM', exitCode: null, outcome: 'SIGNAL_DEATH' },
      truncation: { event: false, textPaths: [] },
    },
  );
  assert.equal(
    normalizeProcessObservation({ status: 'CANCELLED', signal: 'SIGTERM', exitCode: null, outcome: 'CANCELLED' }, { sequence: 2 }).data.status,
    'CANCELLED',
  );
});

test('bounds text with explicit truncation metadata while preserving structured event shape', () => {
  const textEvent = normalizeRuntimeEvent({
    type: 'assistant_output',
    data: { text: 'á'.repeat(40), channel: 'answer' },
  }, { sequence: 1, timestampMs: 0, maxTextBytes: 8, maxEventBytes: 512 });
  assert.equal(textEvent.data.text.textTruncated, true);
  assert.equal(Buffer.byteLength(textEvent.data.text.text), 8);
  assert.equal(textEvent.data.text.textBytesSeen, 80);
  assert.deepEqual(textEvent.truncation.textPaths, ['data.text']);

  const event = normalizeRuntimeEvent({
    type: 'assistant_output',
    data: { text: 'á'.repeat(40), channel: 'answer', payload: { values: Array.from({ length: 100 }, (_, index) => index) } },
  }, { sequence: 2, timestampMs: 0, maxTextBytes: 8, maxEventBytes: 256 });
  assert.ok(Buffer.byteLength(JSON.stringify(event)) <= 256);
  assert.equal(event.truncation.event, true);
  assert.deepEqual(event.truncation.textPaths, ['data.text']);
});

test('event recorder bounds event count and total observations without silently dropping metadata', () => {
  const recorder = createRuntimeEventRecorder({ maxEvents: 2, maxEventBytes: 256, maxTextBytes: 64 });
  recorder.record({ type: 'lifecycle', data: { state: 'STARTED' } });
  recorder.record({ type: 'lifecycle', data: { state: 'OBSERVED' } });
  recorder.record({ type: 'lifecycle', data: { state: 'FINALIZED' } });
  const snapshot = recorder.snapshot();
  assert.equal(snapshot.events.length, 2);
  assert.equal(snapshot.eventCount, 3);
  assert.deepEqual(snapshot.truncation, { eventsDropped: 1, eventBytesTruncated: 0 });
  assert.equal(Object.isFrozen(snapshot), true);
  assert.equal(Object.isFrozen(snapshot.events), true);
});

test('rejects invalid limits and unknown event types instead of inventing observations', () => {
  assert.throws(() => createRuntimeEventRecorder({ maxEvents: 0, maxEventBytes: 256, maxTextBytes: 64 }), /maxEvents/u);
  assert.throws(() => normalizeRuntimeEvent({ type: 'vendor_private_event', data: {} }), /unsupported.*event/u);
});
