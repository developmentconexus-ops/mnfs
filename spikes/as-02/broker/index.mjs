#!/usr/bin/env node

import { readFile, realpath } from 'node:fs/promises';
import { isAbsolute, relative } from 'node:path';

import { executeOperation } from './operations.mjs';

const MAX_OPERATION_FILE_BYTES = 1_048_576;

function fail(error) {
  const payload = {
    ok: false,
    error: {
      code: typeof error?.code === 'string' ? error.code : 'BROKER_FAILED',
      message: error instanceof Error ? error.message : String(error),
    },
  };
  process.stderr.write(`${JSON.stringify(payload)}\n`);
  process.exitCode = 1;
}

function contained(root, candidate) {
  const relation = relative(root, candidate);
  return relation === '' || (!relation.startsWith('..') && !isAbsolute(relation));
}

async function main() {
  if (process.argv.length !== 3 || !isAbsolute(process.argv[2])) {
    throw Object.assign(new Error('Broker requires one absolute operation JSON path.'), {
      code: 'BROKER_OPERATION_INVALID',
    });
  }

  const operationRoot = await realpath(process.env.MNFS_AS02_OPERATION_ROOT ?? '');
  const operationPath = await realpath(process.argv[2]);
  if (!contained(operationRoot, operationPath)) {
    throw Object.assign(new Error('Operation file escapes the trusted operation root.'), {
      code: 'BROKER_PATH_ESCAPE',
    });
  }

  const bytes = await readFile(operationPath);
  if (bytes.length > MAX_OPERATION_FILE_BYTES) {
    throw Object.assign(new Error('Operation file exceeds the broker limit.'), {
      code: 'BROKER_INPUT_TOO_LARGE',
    });
  }

  const operation = JSON.parse(bytes.toString('utf8'));
  const boundary = {
    worktreePath: process.env.MNFS_AS02_WORKTREE,
    cwd: process.env.MNFS_AS02_WORKTREE,
    env: {
      PATH: process.env.PATH ?? '',
      HOME: process.env.HOME ?? '',
      TMPDIR: process.env.TMPDIR ?? '',
      LANG: process.env.LANG ?? 'C.UTF-8',
      LC_ALL: process.env.LC_ALL ?? 'C.UTF-8',
      GIT_OPTIONAL_LOCKS: '0',
    },
    maxOutputBytes: Number(process.env.MNFS_AS02_MAX_OUTPUT_BYTES ?? 65_536),
    maxInputBytes: Number(process.env.MNFS_AS02_MAX_INPUT_BYTES ?? 1_048_576),
  };

  const result = await executeOperation(operation, boundary);
  process.stdout.write(`${JSON.stringify({ ok: true, result })}\n`);
}

main().catch(fail);
