import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import test from 'node:test';

import { MnfsError, type MnfsErrorCode } from '../../src/domain/errors.js';
import type { GitObjectFormat } from '../../src/execution/model.js';
import {
  runProcess,
  type ProcessResult,
  type ProcessSpec,
} from '../../src/runtime/process-runner.js';

const GIT_WORKTREE_SPECIFIER = '../../src/adapters/' + 'git-worktree.js';
const EXECUTION_SOURCE_SPECIFIER = '../../src/adapters/' + 'execution-source.js';
const RUNTIME_PATHS_SPECIFIER = '../../src/runtime/' + 'paths.js';
const REPOSITORY_ID = 'repo-task8';
const TRACK_ID = 'WT-001';
const ATTEMPT_ID = 'WT-001/A01';

interface GitRepositoryObservation {
  readonly repositoryPath: string;
  readonly gitDirPath: string;
  readonly commonDirPath: string;
  readonly objectDirPath: string;
  readonly objectFormat: GitObjectFormat;
  readonly headCommitSha: string;
  readonly headTreeSha: string;
  readonly statusPorcelainV1Z: Buffer;
  readonly remotes: readonly string[];
}

interface GitWorktreeInspectorContract {
  observeRepository(path: string): Promise<GitRepositoryObservation>;
  observeWorktrees(path: string): Promise<readonly unknown[]>;
  requireCommit(path: string, sha: string): Promise<{
    readonly sha: string;
    readonly objectFormat: GitObjectFormat;
  }>;
  requireTree(path: string, sha: string): Promise<{
    readonly sha: string;
    readonly objectFormat: GitObjectFormat;
  }>;
}

interface GitWorktreeModule {
  readonly GitWorktreeInspector: new (input: {
    readonly gitExecutable: string;
    readonly runProcess: (spec: ProcessSpec) => Promise<ProcessResult>;
    readonly environment: Readonly<Record<string, string>>;
  }) => GitWorktreeInspectorContract;
}

interface PrepareExecutionSourceInput {
  readonly repositoryId: string;
  readonly trackId: string;
  readonly attemptId: string;
  readonly canonicalCheckoutPath: string;
  readonly baseCommitSha: string;
  readonly gitObjectFormat: GitObjectFormat;
}

interface ReadyExecutionSource {
  readonly status: 'READY';
  readonly sourcePath: string;
  readonly fingerprint: string;
  readonly observation: GitRepositoryObservation;
}

interface DivergedExecutionSource {
  readonly status: 'DIVERGED';
  readonly sourcePath: string;
  readonly reasonCode: Extract<
    MnfsErrorCode,
    | 'EXECUTION_SOURCE_INVALID'
    | 'EXECUTION_SOURCE_CHANGED'
    | 'EXECUTION_SOURCE_REMOTE_PRESENT'
    | 'EXECUTION_SOURCE_SHARED_OBJECTS'
  >;
}

type PrepareExecutionSourceResult = ReadyExecutionSource | DivergedExecutionSource;

interface ExecutionSourceContract {
  prepare(input: PrepareExecutionSourceInput): Promise<PrepareExecutionSourceResult>;
}

interface ExecutionSourceModule {
  readonly ExecutionSourceAdapter: new (input: {
    readonly runtimeRoot: string;
    readonly gitExecutable: string;
    readonly runProcess: (spec: ProcessSpec) => Promise<ProcessResult>;
    readonly gitInspector: GitWorktreeInspectorContract;
    readonly environment: Readonly<Record<string, string>>;
  }) => ExecutionSourceContract;
}

interface RuntimePathsModule {
  resolveExecutionSourcePath(runtimeRoot: string, trackId: string, attemptId: string): string;
}

interface Fixture {
  readonly root: string;
  readonly runtimeRoot: string;
  readonly canonicalPath: string;
  readonly firstCommit: string;
  readonly firstTree: string;
  readonly secondCommit: string;
}

class RecordingRunner {
  readonly calls: ProcessSpec[] = [];

  readonly run = async (spec: ProcessSpec): Promise<ProcessResult> => {
    this.calls.push(spec);
    return await runProcess(spec);
  };
}

async function loadModules(): Promise<{
  readonly git: GitWorktreeModule;
  readonly source: ExecutionSourceModule;
  readonly paths: RuntimePathsModule;
}> {
  try {
    const [git, source, paths] = await Promise.all([
      import(GIT_WORKTREE_SPECIFIER) as Promise<GitWorktreeModule>,
      import(EXECUTION_SOURCE_SPECIFIER) as Promise<ExecutionSourceModule>,
      import(RUNTIME_PATHS_SPECIFIER) as Promise<RuntimePathsModule>,
    ]);
    return { git, source, paths };
  } catch (error) {
    assert.fail(
      `Task 8 execution source boundary is not implemented: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

function runGit(cwd: string, args: readonly string[]): Buffer {
  const result = spawnSync('/usr/bin/git', [...args], {
    cwd,
    env: {
      PATH: '/usr/bin:/bin',
      HOME: join(cwd, '.fixture-home'),
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

function withFixture(
  label: string,
  operation: (fixture: Fixture) => Promise<void>,
): Promise<void> {
  const root = mkdtempSync(join(tmpdir(), `mnfs-m01-task8-${label}-`));
  const canonicalPath = join(root, 'canonical');
  const runtimeRoot = join(root, 'runtime', 'repos', REPOSITORY_ID);
  mkdirSync(canonicalPath, { recursive: true });
  mkdirSync(runtimeRoot, { recursive: true });

  runGit(root, ['init', '--object-format=sha1', canonicalPath]);
  runGit(canonicalPath, ['config', 'user.name', 'MNFS Task 8']);
  runGit(canonicalPath, ['config', 'user.email', 'task8@example.invalid']);
  writeFileSync(join(canonicalPath, 'alpha.txt'), 'alpha\n');
  runGit(canonicalPath, ['add', 'alpha.txt']);
  runGit(canonicalPath, ['commit', '-m', 'first']);
  const firstCommit = gitText(canonicalPath, ['rev-parse', 'HEAD']);
  const firstTree = gitText(canonicalPath, ['rev-parse', 'HEAD^{tree}']);

  writeFileSync(join(canonicalPath, 'beta.txt'), 'beta\n');
  runGit(canonicalPath, ['add', 'beta.txt']);
  runGit(canonicalPath, ['commit', '-m', 'second']);
  const secondCommit = gitText(canonicalPath, ['rev-parse', 'HEAD']);
  runGit(canonicalPath, ['remote', 'add', 'origin', 'https://network.invalid/mnfs.git']);

  return operation({
    root,
    runtimeRoot,
    canonicalPath,
    firstCommit,
    firstTree,
    secondCommit,
  }).finally(() => {
    rmSync(root, { recursive: true, force: true });
  });
}

function createAdapter(
  modules: Awaited<ReturnType<typeof loadModules>>,
  fixture: Fixture,
  runner: RecordingRunner,
  extraEnvironment: Readonly<Record<string, string>> = {},
): ExecutionSourceContract {
  const environment = {
    PATH: '/usr/bin:/bin',
    HOME: join(fixture.root, 'controlled-home'),
    ...extraEnvironment,
  };
  const inspector = new modules.git.GitWorktreeInspector({
    gitExecutable: '/usr/bin/git',
    runProcess: runner.run,
    environment,
  });
  return new modules.source.ExecutionSourceAdapter({
    runtimeRoot: fixture.runtimeRoot,
    gitExecutable: '/usr/bin/git',
    runProcess: runner.run,
    gitInspector: inspector,
    environment,
  });
}

function prepareInput(
  fixture: Fixture,
  baseCommitSha = fixture.firstCommit,
): PrepareExecutionSourceInput {
  return {
    repositoryId: REPOSITORY_ID,
    trackId: TRACK_ID,
    attemptId: ATTEMPT_ID,
    canonicalCheckoutPath: fixture.canonicalPath,
    baseCommitSha,
    gitObjectFormat: 'sha1',
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

function canonicalSnapshot(fixture: Fixture): Readonly<Record<string, string>> {
  return {
    head: gitText(fixture.canonicalPath, ['rev-parse', 'HEAD']),
    tree: gitText(fixture.canonicalPath, ['rev-parse', 'HEAD^{tree}']),
    status: runGit(fixture.canonicalPath, [
      'status',
      '--porcelain=v1',
      '-z',
      '--untracked-files=all',
    ]).toString('hex'),
    remotes: gitText(fixture.canonicalPath, ['remote', '-v']),
    alpha: readFileSync(join(fixture.canonicalPath, 'alpha.txt'), 'utf8'),
    beta: readFileSync(join(fixture.canonicalPath, 'beta.txt'), 'utf8'),
  };
}

function mutationCalls(calls: readonly ProcessSpec[]): ProcessSpec[] {
  return calls.filter((call) => {
    const command = call.args[0];
    return command === 'init'
      || call.args.includes('fetch')
      || call.args.includes('update-ref')
      || call.args.includes('checkout');
  });
}

function objectFiles(root: string): string[] {
  if (!existsSync(root)) return [];
  const result: string[] = [];
  const visit = (directory: string): void => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) visit(path);
      else if (entry.isFile()) result.push(path);
    }
  };
  visit(root);
  return result.sort();
}

function inodeKey(path: string): string {
  const stat = lstatSync(path);
  return `${stat.dev}:${stat.ino}`;
}

test('derives the exact contained source path and rejects malformed or mounted identities', async () => {
  const modules = await loadModules();
  const runtimeRoot = '/home/mnfs/.local/state/mnfs/repos/repo-task8';
  assert.equal(
    modules.paths.resolveExecutionSourcePath(runtimeRoot, TRACK_ID, ATTEMPT_ID),
    `${runtimeRoot}/execution-sources/${TRACK_ID}/${ATTEMPT_ID}/source`,
  );
  assert.throws(
    () => modules.paths.resolveExecutionSourcePath(runtimeRoot, TRACK_ID, 'WT-002/A01'),
    (error: unknown) => error instanceof MnfsError && error.code === 'EXECUTION_SOURCE_INVALID',
  );
  assert.throws(
    () => modules.paths.resolveExecutionSourcePath('/mnt/c/mnfs', TRACK_ID, ATTEMPT_ID),
    (error: unknown) => error instanceof MnfsError && error.code === 'LINUX_FILESYSTEM_REQUIRED',
  );
});

test('materializes the exact base through the reviewed local transfer sequence and no-origin boundary', async () => {
  const modules = await loadModules();
  await withFixture('materialize', async (fixture) => {
    const runner = new RecordingRunner();
    const adapter = createAdapter(modules, fixture, runner);
    const before = canonicalSnapshot(fixture);

    const prepared = await adapter.prepare(prepareInput(fixture));

    assert.equal(prepared.status, 'READY');
    if (prepared.status !== 'READY') return;
    const expectedPath = join(
      fixture.runtimeRoot,
      'execution-sources',
      TRACK_ID,
      ATTEMPT_ID,
      'source',
    );
    assert.equal(prepared.sourcePath, expectedPath);
    assert.match(prepared.fingerprint, /^sha256:[0-9a-f]{64}$/);
    assert.equal(gitText(expectedPath, ['rev-parse', 'HEAD']), fixture.firstCommit);
    assert.equal(gitText(expectedPath, ['rev-parse', 'HEAD^{tree}']), fixture.firstTree);
    assert.equal(gitText(expectedPath, ['branch', '--show-current']), 'main');
    assert.equal(gitText(expectedPath, ['rev-parse', '--show-object-format']), 'sha1');
    assert.equal(runGit(expectedPath, [
      'status',
      '--porcelain=v1',
      '-z',
      '--untracked-files=all',
    ]).length, 0);
    assert.equal(gitText(expectedPath, ['remote']), '');
    assert.deepEqual(canonicalSnapshot(fixture), before);

    const mutations = mutationCalls(runner.calls);
    assert.equal(mutations.length, 4);
    assert.deepEqual(mutations[0]?.args.slice(0, 2), ['init', '--object-format=sha1']);
    const temporaryPath = mutations[0]?.args[2];
    assert.equal(typeof temporaryPath, 'string');
    assert.equal(dirname(temporaryPath as string), dirname(expectedPath));
    assert.deepEqual(mutations[1]?.args, [
      '-C',
      temporaryPath,
      '-c',
      'protocol.file.allow=always',
      'fetch',
      '--no-tags',
      '--no-write-fetch-head',
      fixture.canonicalPath,
      fixture.firstCommit,
    ]);
    assert.deepEqual(mutations[2]?.args, [
      '-C',
      temporaryPath,
      'update-ref',
      'refs/heads/main',
      fixture.firstCommit,
    ]);
    assert.deepEqual(mutations[3]?.args, [
      '-C',
      temporaryPath,
      'checkout',
      '-B',
      'main',
      fixture.firstCommit,
    ]);
    for (const call of runner.calls) {
      assert.equal(call.args.includes('--shared'), false);
      assert.equal(call.args.includes('--local'), false);
      assert.equal(call.args.some((argument) => argument.startsWith('--reference')), false);
      assert.equal(call.env.GIT_CONFIG_GLOBAL, '/dev/null');
      assert.equal(call.env.GIT_CONFIG_NOSYSTEM, '1');
      assert.equal(call.env.GIT_TERMINAL_PROMPT, '0');
      assert.equal(call.env.GCM_INTERACTIVE, 'Never');
    }
  });
});

test('proves independent common and object directories with no alternates or hardlinked canonical objects', async () => {
  const modules = await loadModules();
  await withFixture('independent-objects', async (fixture) => {
    const runner = new RecordingRunner();
    const prepared = await createAdapter(modules, fixture, runner).prepare(prepareInput(fixture));
    assert.equal(prepared.status, 'READY');
    if (prepared.status !== 'READY') return;

    const sourceCommon = resolve(
      prepared.sourcePath,
      gitText(prepared.sourcePath, ['rev-parse', '--git-common-dir']),
    );
    const sourceObjects = resolve(
      prepared.sourcePath,
      gitText(prepared.sourcePath, ['rev-parse', '--git-path', 'objects']),
    );
    const canonicalCommon = resolve(
      fixture.canonicalPath,
      gitText(fixture.canonicalPath, ['rev-parse', '--git-common-dir']),
    );
    const canonicalObjects = resolve(
      fixture.canonicalPath,
      gitText(fixture.canonicalPath, ['rev-parse', '--git-path', 'objects']),
    );
    assert.notEqual(sourceCommon, canonicalCommon);
    assert.notEqual(sourceObjects, canonicalObjects);
    assert.equal(existsSync(join(sourceObjects, 'info', 'alternates')), false);

    const canonicalInodes = new Set(objectFiles(canonicalObjects).map(inodeKey));
    const sourceFiles = objectFiles(sourceObjects);
    assert.equal(sourceFiles.length > 0, true);
    for (const sourceFile of sourceFiles) {
      assert.equal(canonicalInodes.has(inodeKey(sourceFile)), false, sourceFile);
      assert.equal(lstatSync(sourceFile).nlink, 1, sourceFile);
    }
  });
});

test('replays a matching complete final source without repeating object transfer', async () => {
  const modules = await loadModules();
  await withFixture('replay', async (fixture) => {
    const runner = new RecordingRunner();
    const adapter = createAdapter(modules, fixture, runner);
    const first = await adapter.prepare(prepareInput(fixture));
    const mutationCount = mutationCalls(runner.calls).length;

    const replay = await adapter.prepare(prepareInput(fixture));

    assert.deepEqual(replay, first);
    assert.equal(mutationCalls(runner.calls).length, mutationCount);
  });
});

test('preserves a conflicting final source and reports DIVERGED instead of repointing it', async () => {
  const modules = await loadModules();
  await withFixture('diverged-final', async (fixture) => {
    const runner = new RecordingRunner();
    const adapter = createAdapter(modules, fixture, runner);
    const first = await adapter.prepare(prepareInput(fixture));
    assert.equal(first.status, 'READY');
    if (first.status !== 'READY') return;

    const diverged = await adapter.prepare(prepareInput(fixture, fixture.secondCommit));

    assert.deepEqual(diverged, {
      status: 'DIVERGED',
      sourcePath: first.sourcePath,
      reasonCode: 'EXECUTION_SOURCE_CHANGED',
    });
    assert.equal(gitText(first.sourcePath, ['rev-parse', 'HEAD']), fixture.firstCommit);
    assert.equal(existsSync(first.sourcePath), true);
  });
});

test('removes only a recognized incomplete sibling temp and preserves unrelated files', async () => {
  const modules = await loadModules();
  await withFixture('incomplete-temp', async (fixture) => {
    const finalPath = modules.paths.resolveExecutionSourcePath(
      fixture.runtimeRoot,
      TRACK_ID,
      ATTEMPT_ID,
    );
    const parent = dirname(finalPath);
    const incomplete = join(parent, 'source.tmp-interrupted');
    const unrelated = join(parent, 'operator-notes.txt');
    mkdirSync(incomplete, { recursive: true });
    runGit(parent, ['init', '--object-format=sha1', incomplete]);
    writeFileSync(unrelated, 'preserve me\n');

    const prepared = await createAdapter(
      modules,
      fixture,
      new RecordingRunner(),
    ).prepare(prepareInput(fixture));

    assert.equal(prepared.status, 'READY');
    assert.equal(existsSync(incomplete), false);
    assert.equal(readFileSync(unrelated, 'utf8'), 'preserve me\n');
  });
});

test('rejects symlinked or mounted roots and strips network and credential channels from every Git process', async () => {
  const modules = await loadModules();
  await withFixture('path-and-network', async (fixture) => {
    const realRuntime = join(fixture.root, 'real-runtime');
    const linkedRuntime = join(fixture.root, 'linked-runtime');
    mkdirSync(realRuntime, { recursive: true });
    symlinkSync(realRuntime, linkedRuntime);
    const symlinkFixture: Fixture = { ...fixture, runtimeRoot: linkedRuntime };
    await expectCode(
      'EXECUTION_SOURCE_INVALID',
      async () => await createAdapter(
        modules,
        symlinkFixture,
        new RecordingRunner(),
      ).prepare(prepareInput(symlinkFixture)),
    );

    const runner = new RecordingRunner();
    const adapter = createAdapter(modules, fixture, runner, {
      HTTP_PROXY: 'http://proxy.invalid',
      HTTPS_PROXY: 'http://proxy.invalid',
      ALL_PROXY: 'socks://proxy.invalid',
      GIT_ASKPASS: '/tmp/steal-credentials',
      SSH_AUTH_SOCK: '/tmp/agent.sock',
    });
    const prepared = await adapter.prepare(prepareInput(fixture));
    assert.equal(prepared.status, 'READY');
    for (const call of runner.calls) {
      assert.equal(call.env.HTTP_PROXY, undefined);
      assert.equal(call.env.HTTPS_PROXY, undefined);
      assert.equal(call.env.ALL_PROXY, undefined);
      assert.equal(call.env.GIT_ASKPASS, undefined);
      assert.equal(call.env.SSH_AUTH_SOCK, undefined);
      assert.equal(call.args.some((argument) => /^(?:https?|ssh|git):/i.test(argument)), false);
    }
  });
});
