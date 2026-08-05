import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { MnfsError } from '../../src/domain/errors.js';
import type { ProcessIdentity } from '../../src/execution/model.js';

const PROTOCOL_SPECIFIER = '../../src/runtime/' + 'lease-action-protocol.js';
const ACTION_TOKEN = 'grant-wt001-a01-g1-0001';
const HOLDER = 'mnfs-repo-lse001-g1';
const CONTROL_FILE_LIMIT_BYTES = 65_536;
const OUTPUT_LIMIT_BYTES = 65_536;
const RUNNER_IDENTITY: ProcessIdentity = {
  bootId: 'boot-task10-correction',
  pid: 6262,
  startTicks: '101001',
};

interface LeaseActionOperation {
  readonly schemaVersion: 1;
  readonly actionToken: string;
  readonly kind: 'GRANT' | 'RELEASE';
  readonly executable: string;
  readonly argv: readonly string[];
  readonly cwd: string;
  readonly env: Readonly<Record<string, string>>;
  readonly timeoutMs: number;
  readonly stdoutLimitBytes: number;
  readonly stderrLimitBytes: number;
  readonly startedPath: string;
  readonly resultPath: string;
}

interface LeaseActionOutputRef {
  readonly path: string;
  readonly sha256: string;
  readonly byteLength: number;
}

interface LeaseActionFinished {
  readonly schemaVersion: 1;
  readonly actionToken: string;
  readonly operationSha256: string;
  readonly startedSha256: string;
  readonly runner: ProcessIdentity;
  readonly process: Readonly<{
    exitCode: number | null;
    signal: NodeJS.Signals | null;
    timedOut: boolean;
  }>;
  readonly stdout: LeaseActionOutputRef;
  readonly stderr: LeaseActionOutputRef;
  readonly finishedAt: string;
}

interface PublishedOperation {
  readonly operation: LeaseActionOperation;
  readonly bytes: Buffer;
  readonly operationSha256: string;
}

interface PublishedFinished {
  readonly finished: LeaseActionFinished;
  readonly bytes: Buffer;
  readonly finishedSha256: string;
}

interface LeaseActionProtocolModule {
  canonicalizeLeaseActionOperation(input: Readonly<{
    actionRoot: string;
    operationPath: string;
    operation: LeaseActionOperation;
  }>): PublishedOperation;
  readLeaseActionOperation(input: Readonly<{
    actionRoot: string;
    operationPath: string;
    expectedActionToken: string;
    expectedOperationSha256: string;
  }>): Promise<PublishedOperation>;
  publishLeaseActionFinished(input: Readonly<{
    actionRoot: string;
    resultPath: string;
    finished: LeaseActionFinished;
    stdoutLimitBytes: number;
    stderrLimitBytes: number;
  }>): Promise<PublishedFinished>;
  readLeaseActionFinished(input: Readonly<{
    actionRoot: string;
    resultPath: string;
    expectedActionToken: string;
    expectedOperationSha256: string;
    expectedStartedSha256: string;
    stdoutLimitBytes: number;
    stderrLimitBytes: number;
  }>): Promise<PublishedFinished>;
}

interface Fixture {
  readonly root: string;
  readonly actionRoot: string;
  readonly tokenRoot: string;
  readonly operationPath: string;
  readonly startedPath: string;
  readonly resultPath: string;
  readonly sourcePath: string;
  readonly treehousePath: string;
  readonly gitPath: string;
  readonly homePath: string;
  readonly xdgPath: string;
  readonly hooksPath: string;
}

async function loadProtocol(): Promise<LeaseActionProtocolModule> {
  return await import(PROTOCOL_SPECIFIER) as LeaseActionProtocolModule;
}

function canonicalValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalValue);
  if (typeof value !== 'object' || value === null) return value;
  const record = value as Readonly<Record<string, unknown>>;
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(record).sort()) result[key] = canonicalValue(record[key]);
  return result;
}

function canonicalBytes(value: unknown): Buffer {
  return Buffer.from(JSON.stringify(canonicalValue(value)), 'utf8');
}

function sha256(bytes: Buffer): string {
  return `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
}

async function withFixture(operation: (fixture: Fixture) => Promise<void>): Promise<void> {
  const root = await mkdtemp(path.join(os.tmpdir(), 'mnfs-task10-correction-'));
  const actionRoot = path.join(root, 'actions');
  const tokenRoot = path.join(actionRoot, ACTION_TOKEN);
  const sourcePath = path.join(root, 'source');
  const treehouseBin = path.join(root, 'treehouse-bin');
  const gitBin = path.join(root, 'git-bin');
  const treehousePath = path.join(treehouseBin, 'treehouse');
  const gitPath = path.join(gitBin, 'git');
  const homePath = path.join(root, 'home');
  const xdgPath = path.join(root, 'xdg');
  const hooksPath = path.join(root, 'hooks');
  for (const directory of [
    tokenRoot,
    sourcePath,
    treehouseBin,
    gitBin,
    homePath,
    xdgPath,
    hooksPath,
  ]) {
    await mkdir(directory, { recursive: true });
  }
  await writeFile(treehousePath, '#!/bin/sh\nexit 0\n', { mode: 0o755 });
  await writeFile(gitPath, '#!/bin/sh\nexit 0\n', { mode: 0o755 });

  const fixture: Fixture = {
    root,
    actionRoot,
    tokenRoot,
    operationPath: path.join(tokenRoot, 'operation.json'),
    startedPath: path.join(tokenRoot, 'started.json'),
    resultPath: path.join(tokenRoot, 'finished.json'),
    sourcePath,
    treehousePath,
    gitPath,
    homePath,
    xdgPath,
    hooksPath,
  };
  try {
    await operation(fixture);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

function task9Environment(fixture: Fixture): Readonly<Record<string, string>> {
  return {
    PATH: `${path.dirname(fixture.treehousePath)}:${path.dirname(fixture.gitPath)}:/usr/bin:/bin`,
    HOME: fixture.homePath,
    XDG_CONFIG_HOME: fixture.xdgPath,
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
    GIT_CONFIG_VALUE_0: fixture.hooksPath,
    GIT_CONFIG_KEY_1: 'credential.helper',
    GIT_CONFIG_VALUE_1: '',
    GIT_CONFIG_KEY_2: 'core.fsmonitor',
    GIT_CONFIG_VALUE_2: 'false',
  };
}

function grantOperation(fixture: Fixture): LeaseActionOperation {
  return {
    schemaVersion: 1,
    actionToken: ACTION_TOKEN,
    kind: 'GRANT',
    executable: fixture.treehousePath,
    argv: ['get', '--lease', '--lease-holder', HOLDER, '--json'],
    cwd: fixture.sourcePath,
    env: task9Environment(fixture),
    timeoutMs: 30_000,
    stdoutLimitBytes: OUTPUT_LIMIT_BYTES,
    stderrLimitBytes: OUTPUT_LIMIT_BYTES,
    startedPath: fixture.startedPath,
    resultPath: fixture.resultPath,
  };
}

function outputRef(filePath: string, bytes: Buffer): LeaseActionOutputRef {
  return { path: filePath, sha256: sha256(bytes), byteLength: bytes.length };
}

function finishedRecord(
  fixture: Fixture,
  stdoutBytes: Buffer,
  stderrBytes: Buffer,
): LeaseActionFinished {
  return {
    schemaVersion: 1,
    actionToken: ACTION_TOKEN,
    operationSha256: `sha256:${'1'.repeat(64)}`,
    startedSha256: `sha256:${'2'.repeat(64)}`,
    runner: RUNNER_IDENTITY,
    process: { exitCode: 0, signal: null, timedOut: false },
    stdout: outputRef(path.join(fixture.tokenRoot, 'stdout.bin'), stdoutBytes),
    stderr: outputRef(path.join(fixture.tokenRoot, 'stderr.bin'), stderrBytes),
    finishedAt: '2026-08-05T11:30:00.000Z',
  };
}

async function expectBoundedError(operation: () => Promise<unknown>): Promise<void> {
  await assert.rejects(operation, (error: unknown) => {
    return error instanceof MnfsError
      && error.code === 'INTERNAL_ERROR'
      && /exceeds|byte limit|larger than/i.test(error.message);
  });
}

test('R10-01 represents zero-byte stdout and stderr in a re-openable FINISHED chain', async () => {
  const protocol = await loadProtocol();
  await withFixture(async (fixture) => {
    const empty = Buffer.alloc(0);
    await writeFile(path.join(fixture.tokenRoot, 'stdout.bin'), empty, { mode: 0o600 });
    await writeFile(path.join(fixture.tokenRoot, 'stderr.bin'), empty, { mode: 0o600 });
    const finished = finishedRecord(fixture, empty, empty);

    const published = await protocol.publishLeaseActionFinished({
      actionRoot: fixture.actionRoot,
      resultPath: fixture.resultPath,
      finished,
      stdoutLimitBytes: OUTPUT_LIMIT_BYTES,
      stderrLimitBytes: OUTPUT_LIMIT_BYTES,
    });
    assert.equal(published.finished.stdout.byteLength, 0);
    assert.equal(published.finished.stderr.byteLength, 0);

    const replay = await protocol.readLeaseActionFinished({
      actionRoot: fixture.actionRoot,
      resultPath: fixture.resultPath,
      expectedActionToken: ACTION_TOKEN,
      expectedOperationSha256: finished.operationSha256,
      expectedStartedSha256: finished.startedSha256,
      stdoutLimitBytes: OUTPUT_LIMIT_BYTES,
      stderrLimitBytes: OUTPUT_LIMIT_BYTES,
    });
    assert.deepEqual(replay, published);
  });
});

test('R10-02 accepts exactly the Task 9 PATH and rejects missing, extra, reordered or mounted Git segments', async () => {
  const protocol = await loadProtocol();
  await withFixture(async (fixture) => {
    const accepted = grantOperation(fixture);
    assert.doesNotThrow(() => protocol.canonicalizeLeaseActionOperation({
      actionRoot: fixture.actionRoot,
      operationPath: fixture.operationPath,
      operation: accepted,
    }));

    const treehouseBin = path.dirname(fixture.treehousePath);
    const gitBin = path.dirname(fixture.gitPath);
    const invalidPaths = [
      `${treehouseBin}:/usr/bin:/bin`,
      `${treehouseBin}:${gitBin}:/usr/local/sbin:/usr/bin:/bin`,
      `${gitBin}:${treehouseBin}:/usr/bin:/bin`,
      `${treehouseBin}:/mnt/c/git:/usr/bin:/bin`,
    ];
    for (const candidate of invalidPaths) {
      assert.throws(() => protocol.canonicalizeLeaseActionOperation({
        actionRoot: fixture.actionRoot,
        operationPath: fixture.operationPath,
        operation: { ...accepted, env: { ...accepted.env, PATH: candidate } },
      }), candidate);
    }
  });
});

test('R10-03 rejects an oversized operation control file by metadata size before JSON decoding', async () => {
  const protocol = await loadProtocol();
  await withFixture(async (fixture) => {
    const oversized = Buffer.alloc(CONTROL_FILE_LIMIT_BYTES + 1, 0x20);
    await writeFile(fixture.operationPath, oversized, { mode: 0o400 });

    await expectBoundedError(async () => await protocol.readLeaseActionOperation({
      actionRoot: fixture.actionRoot,
      operationPath: fixture.operationPath,
      expectedActionToken: ACTION_TOKEN,
      expectedOperationSha256: sha256(oversized),
    }));
  });
});

test('R10-03 rejects output metadata above the original operation limit even when hash and length match', async () => {
  const protocol = await loadProtocol();
  await withFixture(async (fixture) => {
    const stdout = Buffer.alloc(OUTPUT_LIMIT_BYTES + 1, 0x61);
    const stderr = Buffer.from('x');
    await writeFile(path.join(fixture.tokenRoot, 'stdout.bin'), stdout, { mode: 0o600 });
    await writeFile(path.join(fixture.tokenRoot, 'stderr.bin'), stderr, { mode: 0o600 });
    const finished = finishedRecord(fixture, stdout, stderr);
    await writeFile(fixture.resultPath, canonicalBytes(finished), { mode: 0o400 });

    await expectBoundedError(async () => await protocol.readLeaseActionFinished({
      actionRoot: fixture.actionRoot,
      resultPath: fixture.resultPath,
      expectedActionToken: ACTION_TOKEN,
      expectedOperationSha256: finished.operationSha256,
      expectedStartedSha256: finished.startedSha256,
      stdoutLimitBytes: OUTPUT_LIMIT_BYTES,
      stderrLimitBytes: OUTPUT_LIMIT_BYTES,
    }));
  });
});

test('R10-03 source checks opened file size before any handle.readFile allocation', async () => {
  const source = await readFile(
    path.join(process.cwd(), 'src', 'runtime', 'lease-action-protocol.ts'),
    'utf8',
  );
  const start = source.indexOf('async function readOwnedRegularFile');
  const end = source.indexOf('async function syncDirectory', start);
  assert.notEqual(start, -1, 'readOwnedRegularFile is missing');
  assert.notEqual(end, -1, 'readOwnedRegularFile boundary is missing');
  const implementation = source.slice(start, end);
  const readIndex = implementation.indexOf('handle.readFile()');
  const sizeGuard = /opened\.size\s*>\s*[A-Za-z_$][A-Za-z0-9_$]*/u.exec(implementation);
  assert.notEqual(readIndex, -1, 'bounded reader no longer reads through the opened handle');
  assert.notEqual(sizeGuard, null, 'opened file size is not compared with a byte limit');
  assert.equal((sizeGuard?.index ?? Number.POSITIVE_INFINITY) < readIndex, true,
    'file-size rejection must occur before handle.readFile()');
});
