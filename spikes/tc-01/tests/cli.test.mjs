import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { parseTc01Args, runTc01Cli } from '../src/cli.mjs';

async function temporaryRoot(t) {
  const root = await mkdtemp(join(tmpdir(), 'mnfs-tc01-cli-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}

function captureStream() {
  let value = '';
  return {
    stream: { write(chunk) { value += String(chunk); } },
    read() { return value; },
  };
}

test('parses only the exact run, report and cleanup command forms', async (t) => {
  const root = await temporaryRoot(t);
  const runRoot = join(root, 'fixtures', 'tc-01', 'tc01-20260804-123456-a1b2c3d4');

  assert.deepEqual(
    parseTc01Args(['run']),
    { command: 'run', json: false, runId: null, stateRoot: null },
  );
  assert.deepEqual(
    parseTc01Args(['run', '--run-id', 'tc01-20260804-123456-a1b2c3d4', '--state-root', root, '--json']),
    {
      command: 'run',
      json: true,
      runId: 'tc01-20260804-123456-a1b2c3d4',
      stateRoot: root,
    },
  );
  assert.deepEqual(
    parseTc01Args(['report', '--run-root', runRoot, '--json']),
    { command: 'report', json: true, runRoot },
  );
  assert.deepEqual(
    parseTc01Args(['cleanup', '--run-root', runRoot]),
    { command: 'cleanup', json: false, runRoot },
  );
});

test('rejects ambiguous or unsafe arguments before invoking a command', async (t) => {
  const root = await temporaryRoot(t);
  const invalid = [
    [],
    ['unknown'],
    ['run', '--run-id'],
    ['run', '--run-id', 'BAD'],
    ['run', '--run-id', 'tc01-20260804-123456-a1b2c3d4', '--run-id', 'tc01-20260804-123456-a1b2c3d4'],
    ['run', '--state-root', 'relative'],
    ['run', '--unknown'],
    ['run', 'extra'],
    ['report'],
    ['report', '--run-root', root, '--run-root', root],
    ['report', '--run-root', 'relative'],
    ['cleanup', '--run-root', '/mnt/c/unsafe'],
    ['cleanup', '--run-root', root, 'extra'],
  ];

  for (const argv of invalid) {
    assert.throws(
      () => parseTc01Args(argv),
      (error) => error?.code === 'TC01_INVALID_INPUT' || error?.code === 'TC01_LINUX_FILESYSTEM_REQUIRED',
      argv.join(' '),
    );
  }
});

test('usage errors return exit code 2 without invoking services', async () => {
  let calls = 0;
  const stdout = captureStream();
  const stderr = captureStream();
  const exitCode = await runTc01Cli({
    argv: ['run', '--run-id', 'BAD'],
    stdout: stdout.stream,
    stderr: stderr.stream,
    services: {
      async run() { calls += 1; },
      async report() { calls += 1; },
      async cleanup() { calls += 1; },
    },
  });

  assert.equal(exitCode, 2);
  assert.equal(calls, 0);
  assert.equal(stdout.read(), '');
  assert.match(stderr.read(), /TC-01 usage error/iu);
  assert.match(stderr.read(), /run \[--run-id/iu);
});

test('human output contains the Verdict, artifact paths and one concrete next action', async (t) => {
  const root = await temporaryRoot(t);
  const summary = {
    command: 'run',
    runId: 'tc01-20260804-123456-a1b2c3d4',
    runRoot: root,
    verdict: 'ACCEPT_WITH_LIMITATIONS',
    reportPath: join(root, 'artifacts', 'report.md'),
    verdictPath: join(root, 'artifacts', 'verdict.json'),
    cleanup: { state: 'READY_FOR_CLEANUP', rationale: 'Review completed.' },
    nextAction: `Run cleanup --run-root ${root} after reviewing the report.`,
  };
  const stdout = captureStream();
  const stderr = captureStream();

  const exitCode = await runTc01Cli({
    argv: ['run'],
    stdout: stdout.stream,
    stderr: stderr.stream,
    services: {
      async run() { return summary; },
      async report() { throw new Error('not called'); },
      async cleanup() { throw new Error('not called'); },
    },
  });

  assert.equal(exitCode, 0);
  assert.equal(stderr.read(), '');
  assert.match(stdout.read(), /ACCEPT_WITH_LIMITATIONS/u);
  assert.match(stdout.read(), /report\.md/u);
  assert.match(stdout.read(), /Next action:/u);
  assert.match(stdout.read(), /cleanup --run-root/u);
});

test('--json emits one stable JSON value and no human framing', async (t) => {
  const root = await temporaryRoot(t);
  const summary = {
    command: 'report',
    runId: 'tc01-20260804-123456-a1b2c3d4',
    runRoot: root,
    verdict: 'ACCEPT',
    reportPath: join(root, 'artifacts', 'report.md'),
    verdictPath: join(root, 'artifacts', 'verdict.json'),
    cleanup: { state: 'NOT_REQUESTED', rationale: 'Cleanup has not been requested.' },
    nextAction: `Review ${join(root, 'artifacts', 'report.md')}.`,
  };
  const stdout = captureStream();
  const stderr = captureStream();

  const exitCode = await runTc01Cli({
    argv: ['report', '--run-root', root, '--json'],
    stdout: stdout.stream,
    stderr: stderr.stream,
    services: {
      async run() { throw new Error('not called'); },
      async report() { return summary; },
      async cleanup() { throw new Error('not called'); },
    },
  });

  assert.equal(exitCode, 0);
  assert.equal(stderr.read(), '');
  assert.deepEqual(JSON.parse(stdout.read()), summary);
  assert.equal(stdout.read().endsWith('\n'), true);
  assert.doesNotMatch(stdout.read(), /Next action:/u);
});
