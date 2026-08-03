import assert from 'node:assert/strict';
import { mkdtemp, mkdir, realpath, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';

import { acquireTreehouseLease } from '../src/treehouse.mjs';

test('passes the absolute host HOME to Treehouse inside the reduced environment', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'mnfs-as02-treehouse-home-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const repositoryPath = join(root, 'repo');
  const leasedPath = join(root, 'leased');
  await mkdir(repositoryPath, { recursive: true });
  await mkdir(leasedPath, { recursive: true });

  let observed;
  await acquireTreehouseLease({
    repositoryPath: await realpath(repositoryPath),
    runId: 'run-42',
    runner: async (spec) => {
      observed = spec;
      return {
        exitCode: 0,
        signal: null,
        stdout: Buffer.from(`${await realpath(leasedPath)}\n`),
        stderr: Buffer.alloc(0),
        startedAt: '2026-08-03T02:00:00.000Z',
        finishedAt: '2026-08-03T02:00:00.010Z',
      };
    },
  });

  assert.equal(observed.env.HOME, process.env.HOME);
  assert.equal(typeof observed.env.HOME, 'string');
  assert.match(observed.env.HOME, /^\/(?!mnt(?:\/|$))/u);
});
