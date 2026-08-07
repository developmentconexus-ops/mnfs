import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { MnfsError } from '../../src/domain/errors.js';
import type { LeaseActionOperation } from '../../src/runtime/lease-action-protocol.js';
import { publishLeaseActionOperation } from '../../src/runtime/lease-action-protocol.js';

const ACTION_TOKEN = 'grant-wt001-a01-g1-0001';
const CONTROL_FILE_LIMIT_BYTES = 65_536;

test('R10-03 publication replay rejects an oversized existing operation through the bounded protocol reader', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'mnfs-task10-publication-correction-'));
  const actionRoot = path.join(root, 'actions');
  const tokenRoot = path.join(actionRoot, ACTION_TOKEN);
  const sourcePath = path.join(root, 'source');
  const treehouseBin = path.join(root, 'treehouse-bin');
  const gitBin = path.join(root, 'git-bin');
  const treehousePath = path.join(treehouseBin, 'treehouse');
  const hooksPath = path.join(root, 'hooks');
  const homePath = path.join(root, 'home');
  const xdgPath = path.join(root, 'xdg');
  const operationPath = path.join(tokenRoot, 'operation.json');

  for (const directory of [
    tokenRoot,
    sourcePath,
    treehouseBin,
    gitBin,
    hooksPath,
    homePath,
    xdgPath,
  ]) {
    await mkdir(directory, { recursive: true });
  }
  await writeFile(treehousePath, '#!/bin/sh\nexit 0\n', { mode: 0o755 });
  await writeFile(path.join(gitBin, 'git'), '#!/bin/sh\nexit 0\n', { mode: 0o755 });

  const operation: LeaseActionOperation = {
    schemaVersion: 1,
    actionToken: ACTION_TOKEN,
    kind: 'GRANT',
    executable: treehousePath,
    argv: ['get', '--lease', '--lease-holder', 'mnfs-repo-lse001-g1', '--json'],
    cwd: sourcePath,
    env: {
      PATH: `${treehouseBin}:${gitBin}:/usr/bin:/bin`,
      HOME: homePath,
      XDG_CONFIG_HOME: xdgPath,
      LANG: 'C.UTF-8',
      LC_ALL: 'C.UTF-8',
      GIT_CONFIG_GLOBAL: '/dev/null',
      GIT_CONFIG_NOSYSTEM: '1',
      GIT_TERMINAL_PROMPT: '0',
      GIT_OPTIONAL_LOCKS: '0',
      GIT_NO_LAZY_FETCH: '1',
      GCM_INTERACTIVE: 'Never',
      TREEHOUSE_NO_UPDATE_CHECK: '1',
      GIT_CONFIG_COUNT: '3',
      GIT_CONFIG_KEY_0: 'core.hooksPath',
      GIT_CONFIG_VALUE_0: hooksPath,
      GIT_CONFIG_KEY_1: 'credential.helper',
      GIT_CONFIG_VALUE_1: '',
      GIT_CONFIG_KEY_2: 'core.fsmonitor',
      GIT_CONFIG_VALUE_2: 'false',
    },
    timeoutMs: 30_000,
    stdoutLimitBytes: 65_536,
    stderrLimitBytes: 65_536,
    startedPath: path.join(tokenRoot, 'started.json'),
    resultPath: path.join(tokenRoot, 'finished.json'),
  };

  try {
    await writeFile(
      operationPath,
      Buffer.alloc(CONTROL_FILE_LIMIT_BYTES + 1, 0x20),
      { mode: 0o400 },
    );

    await assert.rejects(
      async () => await publishLeaseActionOperation({ actionRoot, operationPath, operation }),
      (error: unknown) => error instanceof MnfsError
        && error.code === 'INTERNAL_ERROR'
        && /exceeds.*byte limit/i.test(error.message),
    );

    const source = await readFile(
      path.join(process.cwd(), 'src', 'runtime', 'lease-action-protocol.ts'),
      'utf8',
    );
    assert.equal(
      /\bwriteDurableFile\s*\(/u.test(source),
      false,
      'Task 10 protocol must not delegate immutable replay to an unbounded generic reader',
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
