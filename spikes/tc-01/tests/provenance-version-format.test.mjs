import assert from 'node:assert/strict';
import { chmod, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { discoverTc01Environment } from '../src/provenance.mjs';

test('canonicalizes one lowercase v prefix on the accepted Treehouse semantic version', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'mnfs-tc01-version-format-'));
  t.after(() => rm(root, { recursive: true, force: true }));

  const treehouse = join(root, 'treehouse');
  const git = join(root, 'git');
  const uname = join(root, 'uname');
  const osRelease = join(root, 'os-release');

  await Promise.all([
    writeFile(treehouse, '#!/bin/sh\nexit 0\n', 'utf8'),
    writeFile(git, '#!/bin/sh\nexit 0\n', 'utf8'),
    writeFile(uname, '#!/bin/sh\nexit 0\n', 'utf8'),
    writeFile(osRelease, 'ID=ubuntu\nVERSION_ID="24.04"\n', 'utf8'),
  ]);
  await Promise.all([chmod(treehouse, 0o755), chmod(git, 0o755), chmod(uname, 0o755)]);

  const outputs = new Map([
    [[treehouse, '--version'].join('\u0000'), 'v2.1.1\n'],
    [[treehouse, 'get', '--help'].join('\u0000'), 'Usage: treehouse get [--lease] [--json] [--lease-holder string]\n'],
    [[treehouse, 'status', '--help'].join('\u0000'), 'Usage: treehouse status [--json]\n'],
    [[treehouse, 'return', '--help'].join('\u0000'), 'Usage: treehouse return [--if-lease-id string] [--if-lease-holder string]\n'],
    [[git, '--version'].join('\u0000'), 'git version 2.53.0\n'],
    [[uname, '-r'].join('\u0000'), '6.18.33.2-microsoft-standard-WSL2\n'],
  ]);

  const provenance = await discoverTc01Environment({
    cwd: root,
    env: { PATH: root },
    expectedTreehouseVersion: '2.1.1',
    osReleasePath: osRelease,
    nodeVersion: 'v24.18.0',
    resolveExecutable: async (name) => ({ treehouse, git, uname })[name],
    runProcess: async ({ file, args }) => ({
      startedAt: '2026-08-04T14:30:00.000Z',
      finishedAt: '2026-08-04T14:30:00.001Z',
      durationMs: 1,
      exitCode: 0,
      signal: null,
      stdout: Buffer.from(outputs.get([file, ...args].join('\u0000')) ?? ''),
      stderr: Buffer.alloc(0),
      timedOut: false,
    }),
    now: () => new Date('2026-08-04T14:30:00.000Z'),
  });

  assert.equal(provenance.treehouseVersion, '2.1.1');
});
