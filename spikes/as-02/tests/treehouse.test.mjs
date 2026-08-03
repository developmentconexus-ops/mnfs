import assert from 'node:assert/strict';
import { mkdtemp, mkdir, realpath, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';

import {
  acquireTreehouseLease,
  inspectTreehouseLease,
  releaseTreehouseLease,
} from '../src/treehouse.mjs';

function result({ exitCode = 0, stdout = '', stderr = '', signal = null } = {}) {
  return {
    exitCode,
    signal,
    stdout: Buffer.from(stdout),
    stderr: Buffer.from(stderr),
    startedAt: '2026-08-03T02:00:00.000Z',
    finishedAt: '2026-08-03T02:00:00.010Z',
  };
}

function scriptedRunner(outputs) {
  const calls = [];
  const queue = [...outputs];
  const runner = async (spec) => {
    calls.push(spec);
    assert.equal(queue.length > 0, true, 'unexpected Treehouse call');
    return queue.shift();
  };
  runner.calls = calls;
  return runner;
}

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'mnfs-as02-treehouse-'));
  const repositoryPath = join(root, 'repo');
  const leasedPath = join(root, 'treehouse', 'leased');
  await mkdir(repositoryPath, { recursive: true });
  await mkdir(leasedPath, { recursive: true });
  return {
    root,
    repositoryPath: await realpath(repositoryPath),
    leasedPath: await realpath(leasedPath),
  };
}

test('acquires a durable lease with exact safe argv and one absolute stdout path', async (t) => {
  const paths = await fixture();
  t.after(() => rm(paths.root, { recursive: true, force: true }));
  const runner = scriptedRunner([result({ stdout: `${paths.leasedPath}\n` })]);

  const lease = await acquireTreehouseLease({
    repositoryPath: paths.repositoryPath,
    runId: 'run-42',
    runner,
  });

  assert.equal(runner.calls.length, 1);
  assert.deepEqual(runner.calls[0], {
    file: 'treehouse',
    args: ['get', '--lease', '--lease-holder', 'mnfs-as02-run-42'],
    cwd: paths.repositoryPath,
    env: {
      PATH: process.env.PATH ?? '',
      GIT_OPTIONAL_LOCKS: '0',
    },
    timeoutMs: 30_000,
  });
  assert.deepEqual(lease, {
    runId: 'run-42',
    repositoryPath: paths.repositoryPath,
    path: paths.leasedPath,
    holder: 'mnfs-as02-run-42',
    acquiredAt: '2026-08-03T02:00:00.010Z',
  });
});

test('rejects relative, multiline, missing and Windows-mounted lease paths', async (t) => {
  const paths = await fixture();
  t.after(() => rm(paths.root, { recursive: true, force: true }));

  for (const stdout of ['relative/path\n', `${paths.leasedPath}\nextra\n`, '/mnt/c/treehouse/leased\n', '/does/not/exist\n']) {
    const runner = scriptedRunner([result({ stdout })]);
    await assert.rejects(
      () => acquireTreehouseLease({ repositoryPath: paths.repositoryPath, runId: 'run-42', runner }),
      (error) => error?.code === 'TREEHOUSE_INVALID_OUTPUT',
    );
  }
});

test('reports non-zero acquisition as TREEHOUSE_UNAVAILABLE with bounded evidence', async (t) => {
  const paths = await fixture();
  t.after(() => rm(paths.root, { recursive: true, force: true }));
  const runner = scriptedRunner([result({ exitCode: 9, stderr: 'daemon unavailable' })]);

  await assert.rejects(
    () => acquireTreehouseLease({ repositoryPath: paths.repositoryPath, runId: 'run-42', runner }),
    (error) => {
      assert.equal(error?.code, 'TREEHOUSE_UNAVAILABLE');
      assert.equal(error?.details?.exitCode, 9);
      assert.equal(error?.details?.stderr, 'daemon unavailable');
      return true;
    },
  );
});

test('observes Treehouse status as opaque evidence instead of product state', async (t) => {
  const paths = await fixture();
  t.after(() => rm(paths.root, { recursive: true, force: true }));
  const runner = scriptedRunner([result({ stdout: 'human status output\n', stderr: 'warning\n' })]);
  const lease = {
    runId: 'run-42',
    repositoryPath: paths.repositoryPath,
    path: paths.leasedPath,
    holder: 'mnfs-as02-run-42',
    acquiredAt: '2026-08-03T02:00:00.010Z',
  };

  const observation = await inspectTreehouseLease({ repositoryPath: paths.repositoryPath, lease, runner });

  assert.deepEqual(runner.calls[0], {
    file: 'treehouse',
    args: ['status'],
    cwd: paths.repositoryPath,
    env: {
      PATH: process.env.PATH ?? '',
      GIT_OPTIONAL_LOCKS: '0',
    },
    timeoutMs: 30_000,
  });
  assert.equal(observation.exitCode, 0);
  assert.equal(observation.stdout, 'human status output\n');
  assert.equal(observation.stderr, 'warning\n');
  assert.match(observation.stdoutHash, /^sha256:[a-f0-9]{64}$/u);
  assert.match(observation.stderrHash, /^sha256:[a-f0-9]{64}$/u);
  assert.equal(Object.hasOwn(observation, 'state'), false);
  assert.equal(Object.hasOwn(observation, 'active'), false);
});

test('returns the exact leased path without force or destructive commands', async (t) => {
  const paths = await fixture();
  t.after(() => rm(paths.root, { recursive: true, force: true }));
  const runner = scriptedRunner([result()]);
  const lease = {
    runId: 'run-42',
    repositoryPath: paths.repositoryPath,
    path: paths.leasedPath,
    holder: 'mnfs-as02-run-42',
    acquiredAt: '2026-08-03T02:00:00.010Z',
  };

  const released = await releaseTreehouseLease({ lease, runner });

  assert.deepEqual(runner.calls[0], {
    file: 'treehouse',
    args: ['return', paths.leasedPath],
    cwd: paths.repositoryPath,
    env: {
      PATH: process.env.PATH ?? '',
      GIT_OPTIONAL_LOCKS: '0',
    },
    timeoutMs: 30_000,
  });
  assert.deepEqual(released, {
    result: 'RELEASED',
    path: paths.leasedPath,
    finishedAt: '2026-08-03T02:00:00.010Z',
  });
  assert.equal(runner.calls[0].args.includes('destroy'), false);
  assert.equal(runner.calls[0].args.includes('--force'), false);
});

test('interprets only explicit already-returned evidence as idempotent release', async (t) => {
  const paths = await fixture();
  t.after(() => rm(paths.root, { recursive: true, force: true }));
  const lease = {
    runId: 'run-42',
    repositoryPath: paths.repositoryPath,
    path: paths.leasedPath,
    holder: 'mnfs-as02-run-42',
    acquiredAt: '2026-08-03T02:00:00.010Z',
  };

  const idempotentRunner = scriptedRunner([result({ exitCode: 1, stderr: 'worktree already returned' })]);
  assert.deepEqual(await releaseTreehouseLease({ lease, runner: idempotentRunner }), {
    result: 'ALREADY_RELEASED',
    path: paths.leasedPath,
    finishedAt: '2026-08-03T02:00:00.010Z',
  });

  const failedRunner = scriptedRunner([result({ exitCode: 2, stderr: 'database corrupted' })]);
  await assert.rejects(
    () => releaseTreehouseLease({ lease, runner: failedRunner }),
    (error) => error?.code === 'TREEHOUSE_RELEASE_FAILED',
  );
});

test('forbids force release at the adapter boundary', async (t) => {
  const paths = await fixture();
  t.after(() => rm(paths.root, { recursive: true, force: true }));
  const runner = scriptedRunner([]);
  const lease = {
    runId: 'run-42',
    repositoryPath: paths.repositoryPath,
    path: paths.leasedPath,
    holder: 'mnfs-as02-run-42',
    acquiredAt: '2026-08-03T02:00:00.010Z',
  };

  await assert.rejects(
    () => releaseTreehouseLease({ lease, runner, force: true }),
    (error) => error?.code === 'TREEHOUSE_FORCE_FORBIDDEN',
  );
  assert.equal(runner.calls.length, 0);
});
