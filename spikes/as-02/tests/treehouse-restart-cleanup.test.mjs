import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';

import { releaseTreehouseLease } from '../src/treehouse.mjs';

test('returns a persisted lease from the leased path after the disposable source repository is gone', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'mnfs-as02-treehouse-restart-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const repositoryPath = join(root, 'source-repo');
  const leasedPath = join(root, 'treehouse', 'leased');
  await Promise.all([
    mkdir(repositoryPath, { recursive: true }),
    mkdir(leasedPath, { recursive: true }),
  ]);
  await rm(repositoryPath, { recursive: true, force: true });

  const calls = [];
  const runner = async (spec) => {
    calls.push(spec);
    return {
      exitCode: 0,
      signal: null,
      stdout: Buffer.alloc(0),
      stderr: Buffer.alloc(0),
      startedAt: '2026-08-03T13:30:00.000Z',
      finishedAt: '2026-08-03T13:30:00.010Z',
    };
  };
  const lease = {
    runId: 'as02-20260803t131528320z-3f09a7',
    repositoryPath,
    path: leasedPath,
    holder: 'mnfs-as02-as02-20260803t131528320z-3f09a7',
    acquiredAt: '2026-08-03T13:15:28.320Z',
  };

  const result = await releaseTreehouseLease({ lease, runner });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].cwd, leasedPath);
  assert.deepEqual(calls[0].args, ['return', leasedPath]);
  assert.equal(result.result, 'RELEASED');
});
