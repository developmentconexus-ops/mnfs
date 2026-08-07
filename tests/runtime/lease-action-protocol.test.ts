import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
  chmod,
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  stat,
  symlink,
  writeFile,
} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { MnfsError, type MnfsErrorCode } from '../../src/domain/errors.js';
import type { ProcessIdentity } from '../../src/execution/model.js';

const PROTOCOL_SPECIFIER = '../../src/runtime/' + 'lease-action-protocol.js';
const SHA256_PATTERN = /^sha256:[0-9a-f]{64}$/;
const ACTION_TOKEN = 'grant-wt001-a01-g1-0001';
const HOLDER = 'mnfs-repo-lse001-g1';
const OUTPUT_LIMIT_BYTES = 65_536;

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

interface LeaseActionStarted {
  readonly schemaVersion: 1;
  readonly actionToken: string;
  readonly operationSha256: string;
  readonly runner: ProcessIdentity;
  readonly startedAt: string;
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

interface PublishedStarted {
  readonly started: LeaseActionStarted;
  readonly bytes: Buffer;
  readonly startedSha256: string;
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
  publishLeaseActionOperation(input: Readonly<{
    actionRoot: string;
    operationPath: string;
    operation: LeaseActionOperation;
  }>): Promise<PublishedOperation>;
  readLeaseActionOperation(input: Readonly<{
    actionRoot: string;
    operationPath: string;
    expectedActionToken: string;
    expectedOperationSha256: string;
  }>): Promise<PublishedOperation>;
  publishLeaseActionStarted(input: Readonly<{
    actionRoot: string;
    startedPath: string;
    started: LeaseActionStarted;
  }>): Promise<PublishedStarted>;
  readLeaseActionStarted(input: Readonly<{
    actionRoot: string;
    startedPath: string;
    expectedActionToken: string;
    expectedOperationSha256: string;
  }>): Promise<PublishedStarted>;
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
  readonly sourcePath: string;
  readonly executablePath: string;
  readonly gitPath: string;
  readonly startedPath: string;
  readonly resultPath: string;
  readonly poolRoot: string;
  readonly leasedPath: string;
  readonly homePath: string;
  readonly xdgPath: string;
  readonly hooksPath: string;
}

function describeError(error: unknown): string {
  return error instanceof Error ? `${error.name}: ${error.message}` : String(error);
}

async function loadProtocol(): Promise<LeaseActionProtocolModule> {
  try {
    return await import(PROTOCOL_SPECIFIER) as LeaseActionProtocolModule;
  } catch (error) {
    assert.fail(`Task 10 Lease action protocol is not implemented: ${describeError(error)}`);
  }
}

function canonicalValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalValue);
  if (typeof value !== 'object' || value === null) return value;
  const record = value as Readonly<Record<string, unknown>>;
  const output: Record<string, unknown> = {};
  for (const key of Object.keys(record).sort()) output[key] = canonicalValue(record[key]);
  return output;
}

function canonicalBytes(value: unknown): Buffer {
  return Buffer.from(JSON.stringify(canonicalValue(value)), 'utf8');
}

function sha256(bytes: Buffer): string {
  return `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
}

async function expectCode(
  code: MnfsErrorCode,
  operation: () => Promise<unknown> | unknown,
): Promise<void> {
  await assert.rejects(
    async () => await operation(),
    (error: unknown) => error instanceof MnfsError && error.code === code,
  );
}

async function withFixture(operation: (fixture: Fixture) => Promise<void>): Promise<void> {
  const root = await mkdtemp(path.join(os.tmpdir(), 'mnfs-task10-protocol-'));
  const actionRoot = path.join(root, 'actions');
  const tokenRoot = path.join(actionRoot, ACTION_TOKEN);
  const sourcePath = path.join(root, 'source');
  const treehouseBin = path.join(root, 'treehouse-bin');
  const gitBin = path.join(root, 'git-bin');
  const executablePath = path.join(treehouseBin, 'treehouse');
  const gitPath = path.join(gitBin, 'git');
  const poolRoot = path.join(root, 'pool');
  const leasedPath = path.join(poolRoot, 'slot-1', 'source');
  const homePath = path.join(root, 'home');
  const xdgPath = path.join(root, 'xdg');
  const hooksPath = path.join(root, 'hooks');
  for (const directory of [
    tokenRoot,
    sourcePath,
    treehouseBin,
    gitBin,
    leasedPath,
    homePath,
    xdgPath,
    hooksPath,
  ]) {
    await mkdir(directory, { recursive: true });
  }
  await writeFile(executablePath, '#!/bin/sh\nexit 0\n', { mode: 0o755 });
  await writeFile(gitPath, '#!/bin/sh\nexit 0\n', { mode: 0o755 });

  const fixture: Fixture = {
    root,
    actionRoot,
    tokenRoot,
    operationPath: path.join(tokenRoot, 'operation.json'),
    sourcePath,
    executablePath,
    gitPath,
    startedPath: path.join(tokenRoot, 'started.json'),
    resultPath: path.join(tokenRoot, 'finished.json'),
    poolRoot,
    leasedPath,
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

function acceptedEnvironment(fixture: Fixture): Readonly<Record<string, string>> {
  return {
    PATH: `${path.dirname(fixture.executablePath)}:${path.dirname(fixture.gitPath)}:/usr/bin:/bin`,
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
    executable: fixture.executablePath,
    argv: ['get', '--lease', '--lease-holder', HOLDER, '--json'],
    cwd: fixture.sourcePath,
    env: acceptedEnvironment(fixture),
    timeoutMs: 30_000,
    stdoutLimitBytes: OUTPUT_LIMIT_BYTES,
    stderrLimitBytes: OUTPUT_LIMIT_BYTES,
    startedPath: fixture.startedPath,
    resultPath: fixture.resultPath,
  };
}

function releaseOperation(fixture: Fixture): LeaseActionOperation {
  return {
    ...grantOperation(fixture),
    kind: 'RELEASE',
    argv: [
      'return',
      fixture.leasedPath,
      '--if-lease-id',
      'lease-123',
      '--if-lease-holder',
      HOLDER,
    ],
  };
}

const RUNNER_IDENTITY: ProcessIdentity = {
  bootId: 'boot-task10',
  pid: 4242,
  startTicks: '88001',
};

function startedRecord(operationSha256: string): LeaseActionStarted {
  return {
    schemaVersion: 1,
    actionToken: ACTION_TOKEN,
    operationSha256,
    runner: RUNNER_IDENTITY,
    startedAt: '2026-08-05T06:50:00.000Z',
  };
}

function finishedRecord(
  fixture: Fixture,
  operationSha256: string,
  startedSha256: string,
  stdoutBytes: Buffer,
  stderrBytes: Buffer,
): LeaseActionFinished {
  return {
    schemaVersion: 1,
    actionToken: ACTION_TOKEN,
    operationSha256,
    startedSha256,
    runner: RUNNER_IDENTITY,
    process: { exitCode: 7, signal: null, timedOut: false },
    stdout: {
      path: path.join(fixture.tokenRoot, 'stdout.bin'),
      sha256: sha256(stdoutBytes),
      byteLength: stdoutBytes.length,
    },
    stderr: {
      path: path.join(fixture.tokenRoot, 'stderr.bin'),
      sha256: sha256(stderrBytes),
      byteLength: stderrBytes.length,
    },
    finishedAt: '2026-08-05T06:50:01.000Z',
  };
}

test('publishes one canonical immutable operation at mode 0400 and replays exact bytes', async () => {
  const protocol = await loadProtocol();
  await withFixture(async (fixture) => {
    const operation = grantOperation(fixture);
    const expectedBytes = canonicalBytes(operation);
    const expectedHash = sha256(expectedBytes);
    const published = await protocol.publishLeaseActionOperation({
      actionRoot: fixture.actionRoot,
      operationPath: fixture.operationPath,
      operation,
    });
    assert.deepEqual(published.operation, operation);
    assert.deepEqual(published.bytes, expectedBytes);
    assert.equal(published.operationSha256, expectedHash);
    assert.deepEqual(await readFile(fixture.operationPath), expectedBytes);
    const metadata = await stat(fixture.operationPath);
    assert.equal(metadata.mode & 0o777, 0o400);
    if (process.getuid !== undefined) assert.equal(metadata.uid, process.getuid());

    const replay = await protocol.publishLeaseActionOperation({
      actionRoot: fixture.actionRoot,
      operationPath: fixture.operationPath,
      operation,
    });
    assert.deepEqual(replay, published);
    await expectCode('INTERNAL_ERROR', async () => await protocol.publishLeaseActionOperation({
      actionRoot: fixture.actionRoot,
      operationPath: fixture.operationPath,
      operation: { ...operation, timeoutMs: operation.timeoutMs + 1 },
    }));
    assert.deepEqual(await readFile(fixture.operationPath), expectedBytes);
  });
});

test('canonical operation hash ignores object key order but binds argv order and every env value', async () => {
  const protocol = await loadProtocol();
  await withFixture(async (fixture) => {
    const operation = grantOperation(fixture);
    const reordered = {
      resultPath: operation.resultPath,
      startedPath: operation.startedPath,
      stderrLimitBytes: operation.stderrLimitBytes,
      stdoutLimitBytes: operation.stdoutLimitBytes,
      timeoutMs: operation.timeoutMs,
      env: Object.fromEntries(Object.entries(operation.env).reverse()),
      cwd: operation.cwd,
      argv: [...operation.argv],
      executable: operation.executable,
      kind: operation.kind,
      actionToken: operation.actionToken,
      schemaVersion: operation.schemaVersion,
    } satisfies LeaseActionOperation;
    const first = protocol.canonicalizeLeaseActionOperation({
      actionRoot: fixture.actionRoot,
      operationPath: fixture.operationPath,
      operation,
    });
    const second = protocol.canonicalizeLeaseActionOperation({
      actionRoot: fixture.actionRoot,
      operationPath: fixture.operationPath,
      operation: reordered,
    });
    assert.equal(first.operationSha256, second.operationSha256);
    assert.deepEqual(first.bytes, second.bytes);

    const changedArgv = protocol.canonicalizeLeaseActionOperation({
      actionRoot: fixture.actionRoot,
      operationPath: fixture.operationPath,
      operation: {
        ...operation,
        argv: ['get', '--lease', '--lease-holder', 'mnfs-other-lse002-g1', '--json'],
      },
    });
    const differentHome = path.join(fixture.root, 'different-home');
    await mkdir(differentHome);
    const changedEnvironment = protocol.canonicalizeLeaseActionOperation({
      actionRoot: fixture.actionRoot,
      operationPath: fixture.operationPath,
      operation: { ...operation, env: { ...operation.env, HOME: differentHome } },
    });
    assert.notEqual(first.operationSha256, changedArgv.operationSha256);
    assert.notEqual(first.operationSha256, changedEnvironment.operationSha256);
  });
});

test('accepts only the two reviewed Treehouse argv shapes and one owned environment shape', async () => {
  const protocol = await loadProtocol();
  await withFixture(async (fixture) => {
    for (const operation of [grantOperation(fixture), releaseOperation(fixture)]) {
      const value = protocol.canonicalizeLeaseActionOperation({
        actionRoot: fixture.actionRoot,
        operationPath: fixture.operationPath,
        operation,
      });
      assert.equal(SHA256_PATTERN.test(value.operationSha256), true);
    }
    const grant = grantOperation(fixture);
    const invalid: LeaseActionOperation[] = [
      { ...grant, argv: [...grant.argv, '--force'] },
      { ...grant, kind: 'RELEASE' },
      { ...grant, executable: '/mnt/c/treehouse' },
      { ...grant, cwd: '/mnt/c/source' },
      { ...grant, env: { ...grant.env, SECRET_VALUE: 'must-not-propagate' } },
      { ...grant, env: Object.fromEntries(Object.entries(grant.env).filter(([key]) => key !== 'HOME')) },
      { ...grant, env: { ...grant.env, HOME: `${fixture.homePath}\nattacker` } },
    ];
    for (const operation of invalid) {
      assert.throws(() => protocol.canonicalizeLeaseActionOperation({
        actionRoot: fixture.actionRoot,
        operationPath: fixture.operationPath,
        operation,
      }));
    }
  });
});

test('rejects path escapes, wrong mode, symlink operation files and non-canonical JSON', async () => {
  const protocol = await loadProtocol();
  await withFixture(async (fixture) => {
    const operation = grantOperation(fixture);
    await expectCode('INTERNAL_ERROR', async () => await protocol.publishLeaseActionOperation({
      actionRoot: fixture.actionRoot,
      operationPath: fixture.operationPath,
      operation: { ...operation, resultPath: path.join(fixture.root, 'escaped-finished.json') },
    }));

    const cases: readonly Buffer[] = [
      Buffer.from([0xc3, 0x28]),
      Buffer.from(`${JSON.stringify(operation)}\n${JSON.stringify(operation)}`, 'utf8'),
      Buffer.from(JSON.stringify({ ...operation, unexpected: true }), 'utf8'),
      Buffer.from(JSON.stringify({ ...operation, schemaVersion: 2 }), 'utf8'),
    ];
    for (const [index, bytes] of cases.entries()) {
      const filePath = path.join(fixture.tokenRoot, `invalid-${index}.json`);
      await writeFile(filePath, bytes, { mode: 0o400 });
      await expectCode('INTERNAL_ERROR', async () => await protocol.readLeaseActionOperation({
        actionRoot: fixture.actionRoot,
        operationPath: filePath,
        expectedActionToken: ACTION_TOKEN,
        expectedOperationSha256: sha256(bytes),
      }));
    }

    const validBytes = canonicalBytes(operation);
    const wrongModePath = path.join(fixture.tokenRoot, 'wrong-mode.json');
    await writeFile(wrongModePath, validBytes, { mode: 0o600 });
    await expectCode('INTERNAL_ERROR', async () => await protocol.readLeaseActionOperation({
      actionRoot: fixture.actionRoot,
      operationPath: wrongModePath,
      expectedActionToken: ACTION_TOKEN,
      expectedOperationSha256: sha256(validBytes),
    }));

    const targetPath = path.join(fixture.root, 'operator-owned.json');
    const linkPath = path.join(fixture.tokenRoot, 'linked-operation.json');
    const original = Buffer.from('operator-owned', 'utf8');
    await writeFile(targetPath, original, { mode: 0o400 });
    await symlink(targetPath, linkPath);
    await expectCode('INTERNAL_ERROR', async () => await protocol.readLeaseActionOperation({
      actionRoot: fixture.actionRoot,
      operationPath: linkPath,
      expectedActionToken: ACTION_TOKEN,
      expectedOperationSha256: sha256(original),
    }));
    assert.deepEqual(await readFile(targetPath), original);
    assert.equal((await lstat(linkPath)).isSymbolicLink(), true);
  });
});

test('publishes and verifies a hash-linked STARTED and FINISHED artifact chain', async () => {
  const protocol = await loadProtocol();
  await withFixture(async (fixture) => {
    const operation = await protocol.publishLeaseActionOperation({
      actionRoot: fixture.actionRoot,
      operationPath: fixture.operationPath,
      operation: grantOperation(fixture),
    });
    const started = startedRecord(operation.operationSha256);
    const publishedStarted = await protocol.publishLeaseActionStarted({
      actionRoot: fixture.actionRoot,
      startedPath: fixture.startedPath,
      started,
    });
    assert.equal(publishedStarted.startedSha256, sha256(canonicalBytes(started)));
    assert.deepEqual((await protocol.readLeaseActionStarted({
      actionRoot: fixture.actionRoot,
      startedPath: fixture.startedPath,
      expectedActionToken: ACTION_TOKEN,
      expectedOperationSha256: operation.operationSha256,
    })).started, started);

    const stdoutBytes = Buffer.from('out', 'utf8');
    const stderrBytes = Buffer.from('warn', 'utf8');
    await writeFile(path.join(fixture.tokenRoot, 'stdout.bin'), stdoutBytes, { mode: 0o600 });
    await writeFile(path.join(fixture.tokenRoot, 'stderr.bin'), stderrBytes, { mode: 0o600 });
    const finished = finishedRecord(
      fixture,
      operation.operationSha256,
      publishedStarted.startedSha256,
      stdoutBytes,
      stderrBytes,
    );
    const publishedFinished = await protocol.publishLeaseActionFinished({
      actionRoot: fixture.actionRoot,
      resultPath: fixture.resultPath,
      finished,
      stdoutLimitBytes: OUTPUT_LIMIT_BYTES,
      stderrLimitBytes: OUTPUT_LIMIT_BYTES,
    });
    assert.equal(publishedFinished.finishedSha256, sha256(canonicalBytes(finished)));
    assert.deepEqual((await protocol.readLeaseActionFinished({
      actionRoot: fixture.actionRoot,
      resultPath: fixture.resultPath,
      expectedActionToken: ACTION_TOKEN,
      expectedOperationSha256: operation.operationSha256,
      expectedStartedSha256: publishedStarted.startedSha256,
      stdoutLimitBytes: OUTPUT_LIMIT_BYTES,
      stderrLimitBytes: OUTPUT_LIMIT_BYTES,
    })).finished, finished);

    await expectCode('INTERNAL_ERROR', async () => await protocol.publishLeaseActionFinished({
      actionRoot: fixture.actionRoot,
      resultPath: fixture.resultPath,
      finished: { ...finished, startedSha256: `sha256:${'c'.repeat(64)}` },
      stdoutLimitBytes: OUTPUT_LIMIT_BYTES,
      stderrLimitBytes: OUTPUT_LIMIT_BYTES,
    }));
  });
});
