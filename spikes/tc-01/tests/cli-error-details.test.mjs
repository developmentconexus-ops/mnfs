import assert from 'node:assert/strict';
import test from 'node:test';

import { runTc01Cli } from '../src/cli.mjs';

function captureStream() {
  let value = '';
  return {
    stream: { write(chunk) { value += String(chunk); } },
    read() { return value; },
  };
}

test('JSON operational errors preserve structured cleanup blockers', async () => {
  const stdout = captureStream();
  const stderr = captureStream();
  const error = new Error('TC-01 cleanup safety checks did not pass.');
  error.code = 'TC01_CLEANUP_BLOCKED';
  error.details = {
    runRoot: '/tmp/tc01-run',
    blockers: ['SOURCE_CHANGED'],
    identityChangedFields: [],
  };

  const exitCode = await runTc01Cli({
    argv: ['cleanup', '--run-root', '/tmp/tc01-run', '--json'],
    stdout: stdout.stream,
    stderr: stderr.stream,
    services: {
      async run() { throw new Error('not called'); },
      async report() { throw new Error('not called'); },
      async cleanup() { throw error; },
    },
  });

  assert.equal(exitCode, 1);
  assert.equal(stderr.read(), '');
  assert.deepEqual(JSON.parse(stdout.read()), {
    ok: false,
    error: {
      code: 'TC01_CLEANUP_BLOCKED',
      message: 'TC-01 cleanup safety checks did not pass.',
      details: {
        runRoot: '/tmp/tc01-run',
        blockers: ['SOURCE_CHANGED'],
        identityChangedFields: [],
      },
    },
  });
});
