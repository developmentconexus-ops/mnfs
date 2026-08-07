import assert from 'node:assert/strict';
import test from 'node:test';

import { parseJsonBytesStrict } from '../src/canonical-json.mjs';

const INVALID_UTF8_JSON = Buffer.from([
  0x7b, // {
  0x22, 0x76, 0x61, 0x6c, 0x75, 0x65, 0x22, // "value"
  0x3a, 0x22, // :"
  0x80, // invalid standalone continuation byte
  0x22, 0x7d, // "}
]);

test('strict JSON decoding rejects invalid UTF-8 instead of accepting replacement characters', () => {
  assert.throws(
    () => parseJsonBytesStrict(INVALID_UTF8_JSON, 'TC-01 test JSON'),
    (error) => error?.code === 'TC01_EVIDENCE_INVALID' && /UTF-8/iu.test(error.message),
  );
});

test('strict JSON decoding accepts exactly one valid JSON value', () => {
  assert.deepEqual(
    parseJsonBytesStrict(Buffer.from('{"b":2,"a":1}\n'), 'TC-01 test JSON'),
    { b: 2, a: 1 },
  );
  assert.throws(
    () => parseJsonBytesStrict(Buffer.from('{"a":1}\ntrailing'), 'TC-01 test JSON'),
    (error) => error?.code === 'TC01_EVIDENCE_INVALID',
  );
});
