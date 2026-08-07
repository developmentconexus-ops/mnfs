import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  appendFileSync,
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { ExecutionSourceAdapter } from '../../src/adapters/execution-source.js';
import { GitWorktreeInspector } from '../../src/adapters/git-worktree.js';
import { MnfsError, type MnfsErrorCode } from '../../src/domain/errors.js';
import {
  runProcess,
  type ProcessResult,
  type ProcessSpec,
} from '../../src/runtime/process-runner.js';

const REPOSITORY_ID = 'repo-task8-correction';
const TRACK_ID = 'WT-001';
const ATTEMPT_ID = 'WT-001/A01';

interface Fixture {
  readonly root: string;
  readonly runtimeRoot: string;
  readonly canonicalPath: string;
  readonly baseCommitSha: string;
}

class InterceptingRunner {
  readonly calls: ProcessSpec[] = [];
  readonly #after: ((spec: ProcessSpec, result: ProcessResult) => void) | undefined;

  constructor(after?: (spec: ProcessSpec, result: ProcessResult) => void) {
    this.#after = after;
  }

  readonly run = async (spec: ProcessSpec): Promise<ProcessResult> => {
    this.calls.push(spec);
    const result = await runProcess(spec);
    this.#after?.(spec, result);
    return result;
  };
}

function runGit(cwd: string, args: readonly string[]): Buffer {
  const home = join(cwd, '.fixture-home');
  mkdirSync(home, { recursive: true });
  const result = spawnSync('/usr/bin/git', [...args], {
    cwd,
    env: {
      PATH: '/usr/bin:/bin',
      HOME: home,
      GIT_CONFIG_GLOBAL: '/dev/null',
      GIT_CONFIG_NOSYSTEM: '1',
      GIT_TERMINAL_PROMPT: '0',
    },
    encoding: 'buffer',
    shell: false,
  });
  if (result.status !== 0) {
    assert.fail(`Fixture Git failed: git ${args.join(' ')}\n${result.stderr.toString('utf8')}`);
  }
  return Buffer.from(result.stdout);
}

function gitText(cwd: string, args: readonly string[]): string {
  return runGit(cwd, args).toString('utf8').trim();
}

async function withFixture(
  label: string,
  operation: (fixture: Fixture) => Promise<void>,
): Promise<void> {
  const root = mkdtempSync(join(tmpdir(), `mnfs-task8-correction-${label}-`));
  const canonicalPath = join(root, 'canonical');
  const runtimeRoot = join(root, 'runtime', 'repos', REPOSITORY_ID);
  mkdirSync(canonicalPath, { recursive: true });
  mkdirSync(runtimeRoot, { recursive: true });

  runGit(root, ['init', '--object-format=sha1', canonicalPath]);
  runGit(canonicalPath, ['config', 'user.name', 'MNFS Task 8 Correction']);
  runGit(canonicalPath, ['config', 'user.email', 'task8-correction@example.invalid']);
  writeFileSync(join(canonicalPath, '.gitignore'), 'ignored-drift.txt\n');
  writeFileSync(join(canonicalPath, 'alpha.txt'), 'alpha\n');
  runGit(canonicalPath, ['add', '.gitignore', 'alpha.txt']);
  runGit(canonicalPath, ['commit', '-m', 'base']);
  const baseCommitSha = gitText(canonicalPath, ['rev-parse', 'HEAD']);

  try {
    await operation({ root, runtimeRoot, canonicalPath, baseCommitSha });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function createAdapter(fixture: Fixture, runner: InterceptingRunner): ExecutionSourceAdapter {
  const environment = {
    PATH: '/usr/bin:/bin',
    HOME: join(fixture.root, 'controlled-home'),
  };
  const gitInspector = new GitWorktreeInspector({
    gitExecutable: '/usr/bin/git',
    runProcess: runner.run,
    environment,
  });
  return new ExecutionSourceAdapter({
    runtimeRoot: fixture.runtimeRoot,
    gitExecutable: '/usr/bin/git',
    runProcess: runner.run,
    gitInspector,
    environment,
  });
}

function prepareInput(fixture: Fixture) {
  return {
    repositoryId: REPOSITORY_ID,
    trackId: TRACK_ID,
    attemptId: ATTEMPT_ID,
    canonicalCheckoutPath: fixture.canonicalPath,
    baseCommitSha: fixture.baseCommitSha,
    gitObjectFormat: 'sha1' as const,
  };
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

function assertDiverged(
  result: Awaited<ReturnType<ExecutionSourceAdapter['prepare']>>,
  expectedReasons: readonly MnfsErrorCode[],
): asserts result is Extract<typeof result, { readonly status: 'DIVERGED' }> {
  assert.equal(result.status, 'DIVERGED');
  if (result.status !== 'DIVERGED') return;
  assert.equal(expectedReasons.includes(result.reasonCode), true, result.reasonCode);
  assert.equal(existsSync(result.sourcePath), true, result.sourcePath);
}

test('R8-02 rejects an intermediate symlink before creating any directory through it', async () => {
  await withFixture('intermediate-symlink', async (fixture) => {
    const outside = join(fixture.root, 'outside');
    const executionSources = join(fixture.runtimeRoot, 'execution-sources');
    mkdirSync(outside, { recursive: true });
    symlinkSync(outside, executionSources, 'dir');

    await expectCode(
      'EXECUTION_SOURCE_INVALID',
      async () => await createAdapter(fixture, new InterceptingRunner()).prepare(
        prepareInput(fixture),
      ),
    );

    assert.equal(
      existsSync(join(outside, TRACK_ID)),
      false,
      'the rejected symlink target received Task 8 directories',
    );
  });
});

test('R8-03 classifies ignored canonical byte drift and preserves the prepared source', async () => {
  await withFixture('ignored-drift', async (fixture) => {
    let injected = false;
    const runner = new InterceptingRunner((spec, result) => {
      if (
        !injected
        && result.exitCode === 0
        && spec.args.includes('checkout')
      ) {
        injected = true;
        writeFileSync(join(fixture.canonicalPath, 'ignored-drift.txt'), 'changed outside Git status\n');
      }
    });

    const prepared = await createAdapter(fixture, runner).prepare(prepareInput(fixture));

    assert.equal(injected, true);
    assertDiverged(prepared, ['EXECUTION_SOURCE_CHANGED']);
    assert.equal(
      readFileSync(join(fixture.canonicalPath, 'ignored-drift.txt'), 'utf8'),
      'changed outside Git status\n',
    );
  });
});

test('R8-04 replays source config or executable-hook drift as DIVERGED without rewriting it', async () => {
  await withFixture('replay-config-hook-drift', async (fixture) => {
    const runner = new InterceptingRunner();
    const adapter = createAdapter(fixture, runner);
    const first = await adapter.prepare(prepareInput(fixture));
    assert.equal(first.status, 'READY');
    if (first.status !== 'READY') return;

    const configPath = join(first.sourcePath, '.git', 'config');
    const hookPath = join(first.sourcePath, '.git', 'hooks', 'post-checkout');
    appendFileSync(configPath, '\n[mnfs]\n\tdrift = true\n');
    writeFileSync(hookPath, '#!/bin/sh\nexit 0\n');
    chmodSync(hookPath, 0o700);
    const configBytes = readFileSync(configPath);
    const hookBytes = readFileSync(hookPath);

    const replay = await adapter.prepare(prepareInput(fixture));

    assertDiverged(replay, ['EXECUTION_SOURCE_CHANGED', 'EXECUTION_SOURCE_INVALID']);
    assert.deepEqual(readFileSync(configPath), configBytes);
    assert.deepEqual(readFileSync(hookPath), hookBytes);
  });
});

test('R8-04 refuses to publish a temporary source containing an executable Git hook', async () => {
  await withFixture('injected-executable-hook', async (fixture) => {
    const marker = join(fixture.root, 'hook-executed.txt');
    let injectedHook: string | undefined;
    const runner = new InterceptingRunner((spec, result) => {
      if (
        injectedHook === undefined
        && result.exitCode === 0
        && spec.args[0] === 'init'
      ) {
        const temporaryPath = spec.args[2];
        assert.equal(typeof temporaryPath, 'string');
        injectedHook = join(temporaryPath as string, '.git', 'hooks', 'post-checkout');
        writeFileSync(
          injectedHook,
          `#!/bin/sh\nprintf executed > ${JSON.stringify(marker)}\nexit 0\n`,
        );
        chmodSync(injectedHook, 0o700);
      }
    });

    const prepared = await createAdapter(fixture, runner).prepare(prepareInput(fixture));

    assert.equal(typeof injectedHook, 'string');
    assert.equal(existsSync(marker), false, 'the injected hook executed during preparation');
    assertDiverged(prepared, ['EXECUTION_SOURCE_CHANGED', 'EXECUTION_SOURCE_INVALID']);
    assert.equal(existsSync(join(prepared.sourcePath, '.git', 'hooks', 'post-checkout')), true);
  });
});
