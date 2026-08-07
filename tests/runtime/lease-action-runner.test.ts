import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
  access,
  chmod,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import type { ProcessIdentity } from '../../src/execution/model.js';
import { MnfsError, type MnfsErrorCode } from '../../src/domain/errors.js';
import type { ProcessResult, ProcessSpec } from '../../src/runtime/process-runner.js';

const PROTOCOL_SPECIFIER = '../../src/runtime/' + 'lease-action-protocol.js';
const RUNNER_SPECIFIER = '../../src/runtime/' + 'lease-action-runner.js';
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
  publishLeaseActionOperation(input: Readonly<{
    actionRoot: string;
    operationPath: string;
    operation: LeaseActionOperation;
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

interface LeaseActionRunnerInput {
  readonly runProcess: (spec: ProcessSpec) => Promise<ProcessResult>;
  readonly observeProcessIdentity: (pid: number) => Promise<ProcessIdentity | undefined>;
  readonly now: () => string;
}

interface LeaseActionRunnerContract {
  run(input: Readonly<{
    actionRoot: string;
    operationPath: string;
    expectedActionToken: string;
    expectedOperationSha256: string;
  }>): Promise<PublishedFinished>;
}

interface LeaseActionRunnerModule {
  readonly LeaseActionRunner: new (input: LeaseActionRunnerInput) => LeaseActionRunnerContract;
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

async function loadRunner(): Promise<LeaseActionRunnerModule> {
  try {
    return await import(RUNNER_SPECIFIER) as LeaseActionRunnerModule;
  } catch (error) {
    assert.fail(`Task 10 LeaseActionRunner is not implemented: ${describeError(error)}`);
  }
}

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function expectCode(
  code: MnfsErrorCode,
  operation: () => Promise<unknown>,
): Promise<void> {
  await assert.rejects(
    operation,
    (error: unknown) => error instanceof MnfsError && error.code === code,
  );
}

function sha256(bytes: Buffer): string {
  return `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
}

async function withFixture(operation: (fixture: Fixture) => Promise<void>): Promise<void> {
  const root = await mkdtemp(path.join(os.tmpdir(), 'mnfs-task10-runner-'));
  const actionRoot = path.join(root, 'actions');
  const tokenRoot = path.join(actionRoot, ACTION_TOKEN);
  const sourcePath = path.join(root, 'source');
  const treehouseBin = path.join(root, 'treehouse-bin');
  const gitBin = path.join(root, 'git-bin');
  const executablePath = path.join(treehouseBin, 'treehouse');
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

function environment(fixture: Fixture): Readonly<Record<string, string>> {
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

function operation(fixture: Fixture): LeaseActionOperation {
  return {
    schemaVersion: 1,
    actionToken: ACTION_TOKEN,
    kind: 'GRANT',
    executable: fixture.executablePath,
    argv: ['get', '--lease', '--lease-holder', HOLDER, '--json'],
    cwd: fixture.sourcePath,
    env: environment(fixture),
    timeoutMs: 30_000,
    stdoutLimitBytes: OUTPUT_LIMIT_BYTES,
    stderrLimitBytes: OUTPUT_LIMIT_BYTES,
    startedPath: fixture.startedPath,
    resultPath: fixture.resultPath,
  };
}

const RUNNER_IDENTITY: ProcessIdentity = {
  bootId: 'boot-task10',
  pid: 5151,
  startTicks: '99001',
};

function processResult(overrides: Partial<ProcessResult> = {}): ProcessResult {
  return {
    exitCode: 7,
    signal: null,
    stdout: Buffer.from([0, 255, 65, 66]),
    stderr: Buffer.from('advisory stderr\n', 'utf8'),
    timedOut: false,
    ...overrides,
  };
}

function createRunner(
  module: LeaseActionRunnerModule,
  runProcess: (spec: ProcessSpec) => Promise<ProcessResult>,
  timestamps: readonly string[] = [
    '2026-08-05T06:50:00.000Z',
    '2026-08-05T06:50:01.000Z',
  ],
): LeaseActionRunnerContract {
  let index = 0;
  return new module.LeaseActionRunner({
    runProcess,
    observeProcessIdentity: async (pid) => {
      assert.equal(pid, process.pid);
      return RUNNER_IDENTITY;
    },
    now: () => {
      const value = timestamps[index];
      index += 1;
      assert.notEqual(value, undefined, 'Runner requested an unexpected timestamp.');
      return value as string;
    },
  });
}

test('persists and reopens STARTED before invoking the exact external process', async () => {
  const [protocol, runnerModule] = await Promise.all([loadProtocol(), loadRunner()]);
  await withFixture(async (fixture) => {
    const published = await protocol.publishLeaseActionOperation({
      actionRoot: fixture.actionRoot,
      operationPath: fixture.operationPath,
      operation: operation(fixture),
    });
    let calls = 0;
    const expectedResult = processResult();
    const runner = createRunner(runnerModule, async (spec) => {
      calls += 1;
      const started = await protocol.readLeaseActionStarted({
        actionRoot: fixture.actionRoot,
        startedPath: fixture.startedPath,
        expectedActionToken: ACTION_TOKEN,
        expectedOperationSha256: published.operationSha256,
      });
      assert.deepEqual(started.started.runner, RUNNER_IDENTITY);
      assert.equal(started.started.startedAt, '2026-08-05T06:50:00.000Z');
      assert.deepEqual(spec, {
        executable: fixture.executablePath,
        args: ['get', '--lease', '--lease-holder', HOLDER, '--json'],
        cwd: fixture.sourcePath,
        env: environment(fixture),
        timeoutMs: 30_000,
        stdoutLimitBytes: OUTPUT_LIMIT_BYTES,
        stderrLimitBytes: OUTPUT_LIMIT_BYTES,
      });
      return expectedResult;
    });

    const finished = await runner.run({
      actionRoot: fixture.actionRoot,
      operationPath: fixture.operationPath,
      expectedActionToken: ACTION_TOKEN,
      expectedOperationSha256: published.operationSha256,
    });
    assert.equal(calls, 1);
    assert.equal(finished.finished.actionToken, ACTION_TOKEN);
    assert.equal(finished.finished.operationSha256, published.operationSha256);
    assert.deepEqual(finished.finished.runner, RUNNER_IDENTITY);
    assert.deepEqual(finished.finished.process, {
      exitCode: expectedResult.exitCode,
      signal: expectedResult.signal,
      timedOut: expectedResult.timedOut,
    });
    assert.equal(finished.finished.finishedAt, '2026-08-05T06:50:01.000Z');
  });
});

test('stores raw stdout and stderr as immutable bounded Artifacts referenced by FINISHED', async () => {
  const [protocol, runnerModule] = await Promise.all([loadProtocol(), loadRunner()]);
  await withFixture(async (fixture) => {
    const published = await protocol.publishLeaseActionOperation({
      actionRoot: fixture.actionRoot,
      operationPath: fixture.operationPath,
      operation: operation(fixture),
    });
    const expected = processResult();
    const finished = await createRunner(runnerModule, async () => expected).run({
      actionRoot: fixture.actionRoot,
      operationPath: fixture.operationPath,
      expectedActionToken: ACTION_TOKEN,
      expectedOperationSha256: published.operationSha256,
    });

    for (const [reference, bytes] of [
      [finished.finished.stdout, expected.stdout],
      [finished.finished.stderr, expected.stderr],
    ] as const) {
      assert.equal(path.relative(fixture.tokenRoot, reference.path).startsWith('..'), false);
      assert.deepEqual(await readFile(reference.path), bytes);
      assert.equal(reference.sha256, sha256(bytes));
      assert.equal(reference.byteLength, bytes.length);
      assert.equal((await stat(reference.path)).isFile(), true);
    }
    const verified = await protocol.readLeaseActionFinished({
      actionRoot: fixture.actionRoot,
      resultPath: fixture.resultPath,
      expectedActionToken: ACTION_TOKEN,
      expectedOperationSha256: published.operationSha256,
      expectedStartedSha256: finished.finished.startedSha256,
      stdoutLimitBytes: OUTPUT_LIMIT_BYTES,
      stderrLimitBytes: OUTPUT_LIMIT_BYTES,
    });
    assert.deepEqual(verified, finished);
  });
});

test('replays a completed action without another external invocation', async () => {
  const [protocol, runnerModule] = await Promise.all([loadProtocol(), loadRunner()]);
  await withFixture(async (fixture) => {
    const published = await protocol.publishLeaseActionOperation({
      actionRoot: fixture.actionRoot,
      operationPath: fixture.operationPath,
      operation: operation(fixture),
    });
    let calls = 0;
    const runner = createRunner(runnerModule, async () => {
      calls += 1;
      return processResult();
    }, [
      '2026-08-05T06:50:00.000Z',
      '2026-08-05T06:50:01.000Z',
      '2026-08-05T06:50:02.000Z',
    ]);
    const input = {
      actionRoot: fixture.actionRoot,
      operationPath: fixture.operationPath,
      expectedActionToken: ACTION_TOKEN,
      expectedOperationSha256: published.operationSha256,
    } as const;

    const first = await runner.run(input);
    const second = await runner.run(input);
    assert.equal(calls, 1);
    assert.deepEqual(second, first);
  });
});

test('an existing STARTED without FINISHED is inconclusive and never invokes the process again', async () => {
  const [protocol, runnerModule] = await Promise.all([loadProtocol(), loadRunner()]);
  await withFixture(async (fixture) => {
    const published = await protocol.publishLeaseActionOperation({
      actionRoot: fixture.actionRoot,
      operationPath: fixture.operationPath,
      operation: operation(fixture),
    });
    await protocol.publishLeaseActionStarted({
      actionRoot: fixture.actionRoot,
      startedPath: fixture.startedPath,
      started: {
        schemaVersion: 1,
        actionToken: ACTION_TOKEN,
        operationSha256: published.operationSha256,
        runner: RUNNER_IDENTITY,
        startedAt: '2026-08-05T06:50:00.000Z',
      },
    });
    let calls = 0;
    const runner = createRunner(runnerModule, async () => {
      calls += 1;
      return processResult();
    });

    await expectCode('LEASE_ACTION_INCONCLUSIVE', async () => await runner.run({
      actionRoot: fixture.actionRoot,
      operationPath: fixture.operationPath,
      expectedActionToken: ACTION_TOKEN,
      expectedOperationSha256: published.operationSha256,
    }));
    assert.equal(calls, 0);
    assert.equal(await pathExists(fixture.resultPath), false);
  });
});

test('rejects operation identity or mode drift before STARTED and before process invocation', async () => {
  const [protocol, runnerModule] = await Promise.all([loadProtocol(), loadRunner()]);
  await withFixture(async (fixture) => {
    const published = await protocol.publishLeaseActionOperation({
      actionRoot: fixture.actionRoot,
      operationPath: fixture.operationPath,
      operation: operation(fixture),
    });
    let calls = 0;
    const runner = createRunner(runnerModule, async () => {
      calls += 1;
      return processResult();
    });

    await expectCode('INTERNAL_ERROR', async () => await runner.run({
      actionRoot: fixture.actionRoot,
      operationPath: fixture.operationPath,
      expectedActionToken: 'different-token',
      expectedOperationSha256: published.operationSha256,
    }));
    await chmod(fixture.operationPath, 0o600);
    await expectCode('INTERNAL_ERROR', async () => await runner.run({
      actionRoot: fixture.actionRoot,
      operationPath: fixture.operationPath,
      expectedActionToken: ACTION_TOKEN,
      expectedOperationSha256: published.operationSha256,
    }));
    assert.equal(calls, 0);
    assert.equal(await pathExists(fixture.startedPath), false);
  });
});

test('runner and executable entry contain no SQLite, store or shell fallback authority', async () => {
  const paths = [
    path.join(process.cwd(), 'src', 'runtime', 'lease-action-runner.ts'),
    path.join(process.cwd(), 'src', 'runtime', 'lease-action-entry.ts'),
    path.join(process.cwd(), 'bin', 'mnfs-lease-action.mjs'),
  ];
  for (const sourcePath of paths) {
    assert.equal(await pathExists(sourcePath), true, `missing Task 10 source: ${sourcePath}`);
    const source = await readFile(sourcePath, 'utf8');
    for (const [label, pattern] of [
      ['node:sqlite import', /(?:from|import\s*\()\s*['"]node:sqlite['"]/u],
      ['SqliteStore', /\bSqliteStore\b/u],
      ['store import', /(?:from|import\s*\()\s*['"][^'"]*\/store\//u],
      ['shell true', /shell\s*:\s*true/u],
      ['exec fallback', /\bexec(?:File)?(?:Sync)?\s*\(/u],
      ['environment spread', /\.\.\.(?:process\.)?env/u],
    ] as const) {
      assert.equal(pattern.test(source), false, `${label}: ${sourcePath}`);
    }
  }
});
