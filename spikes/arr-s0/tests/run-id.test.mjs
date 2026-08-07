import assert from 'node:assert/strict';
import test from 'node:test';
import { generateRunId } from '../src/service.mjs';
import { requireRunId } from '../src/paths.mjs';

test('run ids are generated from UTC milliseconds plus six lowercase hex bytes of identity', () => {
  const value = generateRunId({
    now: () => new Date('2026-08-07T12:34:56.789Z'),
    randomBytes: () => Buffer.from('a1b2c3', 'hex'),
  });
  assert.equal(value, 'arr-s0-20260807t123456789z-a1b2c3');
  assert.equal(requireRunId(value), value);
});
