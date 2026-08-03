import assert from 'node:assert/strict';
import {
  mkdtemp,
  mkdir,
  readFile,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';

import { executeOperation, validateOperation } from '../broker/operations.mjs';

function fakeRunner(result = {}) {
  const calls = [];
  const runner = async (spec) => {
    calls.push(spec);
    return {
      exitCode: 0,
      signal: null,
      stdout: Buffer.from('stdout'),
      stderr: Buffer.from('stderr'),
      startedAt: '2026-08-03T02:00:00.000Z',
      finishedAt: '2026-08-03T02:00:00.010Z',
      ...result,
    };
  };
  runner.calls = calls;
  return runner;
}

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'mnfs-as02-broker-'));
  const worktreePath = join(root, 'worktree');
  const outsidePath = join(root, 'outside');
  await mkdir(join(worktreePath, 'src'), { recursive: true });
  await mkdir(outsidePath, { recursive: true });
  await writeFile(join(worktreePath, 'src', 'alpha.txt'), 'first\nneedle one\nlast\n');
  await writeFile(join(worktreePath, 'src', 'beta.txt'), 'needle two\nneedle three\n');
  await writeFile(join(outsidePath, 'secret.txt'), 'outside-secret');
  await symlink(join(outsidePath, 'secret.txt'), join(worktreePath, 'src', 'escape.txt'));
  return {
    root,
    worktreePath,
    outsidePath,
    boundary: {
      worktreePath,
      cwd: worktreePath,
      env: { PATH: '/usr/bin:/bin', HOME: join(root, 'fake-home') },
      maxOutputBytes: 128,
      maxInputBytes: 1_024,
    },
  };
}

test('validates a strict operation union and bounded inputs', async (t) => {
  const paths = await fixture();
  t.after(() => rm(paths.root, { recursive: true, force: true }));

  assert.deepEqual(
    validateOperation({ operation: 'read', path: 'src/alpha.txt', offset: 1, limit: 10 }, paths.boundary),
    { operation: 'read', path: join(paths.worktreePath, 'src', 'alpha.txt'), offset: 1, limit: 10 },
  );
  assert.throws(
    () => validateOperation({ operation: 'read', path: 'src/alpha.txt', unknown: true }, paths.boundary),
    (error) => error?.code === 'BROKER_OPERATION_INVALID',
  );
  assert.throws(
    () => validateOperation({ operation: 'unknown' }, paths.boundary),
    (error) => error?.code === 'BROKER_OPERATION_INVALID',
  );
  assert.throws(
    () => validateOperation({ operation: 'write', path: 'large.txt', content: 'x'.repeat(1_025) }, paths.boundary),
    (error) => error?.code === 'BROKER_INPUT_TOO_LARGE',
  );
});

test('rejects lexical and symlink escapes for reads and writes', async (t) => {
  const paths = await fixture();
  t.after(() => rm(paths.root, { recursive: true, force: true }));

  for (const operation of [
    { operation: 'read', path: '../outside/secret.txt' },
    { operation: 'read', path: 'src/escape.txt' },
    { operation: 'write', path: '../outside/new.txt', content: 'nope' },
    { operation: 'write', path: 'src/escape.txt', content: 'nope' },
  ]) {
    await assert.rejects(
      () => executeOperation(operation, paths.boundary),
      (error) => error?.code === 'BROKER_PATH_ESCAPE',
    );
  }

  assert.equal(await readFile(join(paths.outsidePath, 'secret.txt'), 'utf8'), 'outside-secret');
});

test('reads bounded byte ranges and writes atomically inside the worktree', async (t) => {
  const paths = await fixture();
  t.after(() => rm(paths.root, { recursive: true, force: true }));

  assert.deepEqual(
    await executeOperation({ operation: 'read', path: 'src/alpha.txt', offset: 6, limit: 6 }, paths.boundary),
    { operation: 'read', path: 'src/alpha.txt', text: 'needle', bytes: 6, truncated: false },
  );

  const written = await executeOperation(
    { operation: 'write', path: 'src/new.txt', content: 'new content' },
    paths.boundary,
  );
  assert.deepEqual(written, { operation: 'write', path: 'src/new.txt', bytes: 11 });
  assert.equal(await readFile(join(paths.worktreePath, 'src', 'new.txt'), 'utf8'), 'new content');
});

test('edit requires exactly one old-text match', async (t) => {
  const paths = await fixture();
  t.after(() => rm(paths.root, { recursive: true, force: true }));

  const edited = await executeOperation(
    { operation: 'edit', path: 'src/alpha.txt', oldText: 'needle one', newText: 'replaced' },
    paths.boundary,
  );
  assert.deepEqual(edited, { operation: 'edit', path: 'src/alpha.txt', replacements: 1 });
  assert.match(await readFile(join(paths.worktreePath, 'src', 'alpha.txt'), 'utf8'), /replaced/u);

  await assert.rejects(
    () => executeOperation(
      { operation: 'edit', path: 'src/alpha.txt', oldText: 'missing', newText: 'x' },
      paths.boundary,
    ),
    (error) => error?.code === 'BROKER_EDIT_MATCH_COUNT',
  );
  await assert.rejects(
    () => executeOperation(
      { operation: 'edit', path: 'src/beta.txt', oldText: 'needle', newText: 'x' },
      paths.boundary,
    ),
    (error) => error?.code === 'BROKER_EDIT_MATCH_COUNT',
  );
});

test('ls, find and grep are deterministic, bounded and do not follow symlinks', async (t) => {
  const paths = await fixture();
  t.after(() => rm(paths.root, { recursive: true, force: true }));

  const listed = await executeOperation({ operation: 'ls', path: 'src', maxEntries: 10 }, paths.boundary);
  assert.deepEqual(listed.entries.map((entry) => entry.name), ['alpha.txt', 'beta.txt', 'escape.txt']);
  assert.equal(listed.entries.find((entry) => entry.name === 'escape.txt').type, 'symlink');

  const found = await executeOperation({ operation: 'find', path: '.', pattern: '.txt', maxResults: 10 }, paths.boundary);
  assert.deepEqual(found.paths, ['src/alpha.txt', 'src/beta.txt']);

  const grepped = await executeOperation({ operation: 'grep', path: 'src', query: 'needle', maxResults: 2 }, paths.boundary);
  assert.deepEqual(grepped.matches, [
    { path: 'src/alpha.txt', line: 2, column: 1, text: 'needle one' },
    { path: 'src/beta.txt', line: 1, column: 1, text: 'needle two' },
  ]);
  assert.equal(grepped.truncated, true);
});

test('bash uses an injected shell-false runner with explicit cwd, env and bounded outputs', async (t) => {
  const paths = await fixture();
  t.after(() => rm(paths.root, { recursive: true, force: true }));
  const runner = fakeRunner({
    stdout: Buffer.from('x'.repeat(200)),
    stderr: Buffer.from('y'.repeat(200)),
  });

  const observed = await executeOperation(
    { operation: 'bash', command: 'printf safe', timeoutMs: 2_000 },
    paths.boundary,
    { runner },
  );

  assert.deepEqual(runner.calls, [{
    file: '/bin/bash',
    args: ['-c', 'printf safe'],
    cwd: paths.worktreePath,
    env: paths.boundary.env,
    timeoutMs: 2_000,
    killProcessGroup: true,
  }]);
  assert.equal(observed.stdout.length, 128);
  assert.equal(observed.stderr.length, 128);
  assert.equal(observed.stdoutTruncated, true);
  assert.equal(observed.stderrTruncated, true);
});
