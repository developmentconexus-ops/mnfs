import assert from 'node:assert/strict';
import test from 'node:test';

import { MnfsError, type MnfsErrorCode } from '../../src/domain/errors.js';
import type { GitObjectFormat } from '../../src/execution/model.js';
import type { ProcessResult, ProcessSpec } from '../../src/runtime/process-runner.js';

const GIT_WORKTREE_SPECIFIER = '../../src/adapters/' + 'git-worktree.js';
const COMMIT_SHA = '1'.repeat(40);
const TREE_SHA = '2'.repeat(40);
const OTHER_SHA = '3'.repeat(40);
const REPOSITORY_PATH = '/srv/mnfs/repository';

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

interface GitWorktreeObservation {
  readonly path: string;
  readonly headSha: string;
  readonly branch?: string;
  readonly detached: boolean;
  readonly bare: boolean;
  readonly lockedReason?: string;
  readonly prunableReason?: string;
}

interface GitObjectObservation {
  readonly sha: string;
  readonly objectFormat: GitObjectFormat;
}

interface GitWorktreeInspectorContract {
  observeRepository(path: string): Promise<GitRepositoryObservation>;
  observeWorktrees(path: string): Promise<readonly GitWorktreeObservation[]>;
  requireCommit(path: string, sha: string): Promise<GitObjectObservation>;
  requireTree(path: string, sha: string): Promise<GitObjectObservation>;
}

interface GitWorktreeModule {
  readonly GitWorktreeInspector: new (input: {
    readonly gitExecutable: string;
    readonly runProcess: (spec: ProcessSpec) => Promise<ProcessResult>;
    readonly environment: Readonly<Record<string, string>>;
  }) => GitWorktreeInspectorContract;
}

class ScriptedRunner {
  readonly calls: ProcessSpec[] = [];
  readonly #handler: (spec: ProcessSpec) => ProcessResult;

  constructor(handler: (spec: ProcessSpec) => ProcessResult) {
    this.#handler = handler;
  }

  readonly run = async (spec: ProcessSpec): Promise<ProcessResult> => {
    this.calls.push(spec);
    return this.#handler(spec);
  };
}

async function loadGitWorktreeModule(): Promise<GitWorktreeModule> {
  try {
    return await import(GIT_WORKTREE_SPECIFIER) as GitWorktreeModule;
  } catch (error) {
    assert.fail(
      `Task 8 GitWorktreeInspector is not implemented: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

function success(stdout: string | Buffer = ''): ProcessResult {
  return {
    exitCode: 0,
    signal: null,
    stdout: Buffer.isBuffer(stdout) ? Buffer.from(stdout) : Buffer.from(stdout, 'utf8'),
    stderr: Buffer.alloc(0),
    timedOut: false,
  };
}

function failure(stderr = 'git failed'): ProcessResult {
  return {
    exitCode: 1,
    signal: null,
    stdout: Buffer.alloc(0),
    stderr: Buffer.from(stderr, 'utf8'),
    timedOut: false,
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

function createInspector(
  module: GitWorktreeModule,
  runner: ScriptedRunner,
): GitWorktreeInspectorContract {
  return new module.GitWorktreeInspector({
    gitExecutable: '/usr/bin/git',
    runProcess: runner.run,
    environment: {
      PATH: '/usr/bin:/bin',
      HOME: '/home/mnfs',
    },
  });
}

function assertControlledReadEnvironment(spec: ProcessSpec): void {
  assert.equal(spec.executable, '/usr/bin/git');
  assert.equal(spec.cwd, REPOSITORY_PATH);
  assert.equal(spec.env.PATH, '/usr/bin:/bin');
  assert.equal(spec.env.HOME, '/home/mnfs');
  assert.equal(spec.env.GIT_CONFIG_GLOBAL, '/dev/null');
  assert.equal(spec.env.GIT_CONFIG_NOSYSTEM, '1');
  assert.equal(spec.env.GIT_TERMINAL_PROMPT, '0');
  assert.equal(spec.env.GCM_INTERACTIVE, 'Never');
  assert.equal(spec.env.HTTP_PROXY, undefined);
  assert.equal(spec.env.HTTPS_PROXY, undefined);
  assert.equal(spec.env.ALL_PROXY, undefined);
  assert.equal(spec.env.GIT_ASKPASS, undefined);
}

function repositoryResponse(spec: ProcessSpec): ProcessResult {
  assertControlledReadEnvironment(spec);
  const command = spec.args.join(' ');
  switch (command) {
    case 'rev-parse --show-toplevel':
      return success(`${REPOSITORY_PATH}\n`);
    case 'rev-parse --absolute-git-dir':
      return success(`${REPOSITORY_PATH}/.git\n`);
    case 'rev-parse --git-common-dir':
      return success('.git\n');
    case 'rev-parse --git-path objects':
      return success('.git/objects\n');
    case 'rev-parse --show-object-format':
      return success('sha1\n');
    case 'rev-parse --verify HEAD':
      return success(`${COMMIT_SHA}\n`);
    case 'rev-parse --verify HEAD^{tree}':
      return success(`${TREE_SHA}\n`);
    case 'status --porcelain=v1 -z --untracked-files=all':
      return success(Buffer.alloc(0));
    case 'remote':
      return success('upstream\norigin\n');
    default:
      assert.fail(`Unexpected Git observation command: ${command}`);
  }
}

test('observes one repository through exact read-only Git commands and controlled environment', async () => {
  const module = await loadGitWorktreeModule();
  const runner = new ScriptedRunner(repositoryResponse);
  const inspector = createInspector(module, runner);

  const observation = await inspector.observeRepository(REPOSITORY_PATH);

  assert.deepEqual(observation, {
    repositoryPath: REPOSITORY_PATH,
    gitDirPath: `${REPOSITORY_PATH}/.git`,
    commonDirPath: `${REPOSITORY_PATH}/.git`,
    objectDirPath: `${REPOSITORY_PATH}/.git/objects`,
    objectFormat: 'sha1',
    headCommitSha: COMMIT_SHA,
    headTreeSha: TREE_SHA,
    statusPorcelainV1Z: Buffer.alloc(0),
    remotes: ['origin', 'upstream'],
  });

  const permittedCommands = new Set([
    'rev-parse',
    'status',
    'worktree',
    'remote',
    'cat-file',
  ]);
  const forbiddenTokens = new Set([
    'write-tree',
    'fetch',
    'checkout',
    'reset',
    'clean',
    'commit',
    'update-ref',
    'branch',
    'switch',
  ]);
  assert.equal(runner.calls.length > 0, true);
  for (const call of runner.calls) {
    assert.equal(permittedCommands.has(call.args[0] ?? ''), true, call.args.join(' '));
    assert.equal(call.args.some((argument) => forbiddenTokens.has(argument)), false);
  }
});

test('parses canonical worktree porcelain records and preserves lock evidence', async () => {
  const module = await loadGitWorktreeModule();
  const runner = new ScriptedRunner((spec) => {
    assertControlledReadEnvironment(spec);
    assert.deepEqual(spec.args, ['worktree', 'list', '--porcelain']);
    return success([
      `worktree ${REPOSITORY_PATH}`,
      `HEAD ${COMMIT_SHA}`,
      'branch refs/heads/main',
      '',
      `worktree ${REPOSITORY_PATH}/.worktrees/task8`,
      `HEAD ${OTHER_SHA}`,
      'detached',
      'locked recovery inspection',
      'prunable stale administrative entry',
      '',
    ].join('\n'));
  });
  const inspector = createInspector(module, runner);

  const worktrees = await inspector.observeWorktrees(REPOSITORY_PATH);

  assert.deepEqual(worktrees, [
    {
      path: REPOSITORY_PATH,
      headSha: COMMIT_SHA,
      branch: 'refs/heads/main',
      detached: false,
      bare: false,
    },
    {
      path: `${REPOSITORY_PATH}/.worktrees/task8`,
      headSha: OTHER_SHA,
      detached: true,
      bare: false,
      lockedReason: 'recovery inspection',
      prunableReason: 'stale administrative entry',
    },
  ]);
});

test('requires exact commit and tree objects without accepting another Git object type', async () => {
  const module = await loadGitWorktreeModule();
  const runner = new ScriptedRunner((spec) => {
    assertControlledReadEnvironment(spec);
    const command = spec.args.join(' ');
    if (command === 'rev-parse --show-object-format') return success('sha1\n');
    if (command === `cat-file -e ${COMMIT_SHA}^{commit}`) return success();
    if (command === `cat-file -e ${TREE_SHA}^{tree}`) return success();
    if (command === `cat-file -e ${OTHER_SHA}^{commit}`) return failure('not a commit');
    assert.fail(`Unexpected Git object command: ${command}`);
  });
  const inspector = createInspector(module, runner);

  assert.deepEqual(await inspector.requireCommit(REPOSITORY_PATH, COMMIT_SHA), {
    sha: COMMIT_SHA,
    objectFormat: 'sha1',
  });
  assert.deepEqual(await inspector.requireTree(REPOSITORY_PATH, TREE_SHA), {
    sha: TREE_SHA,
    objectFormat: 'sha1',
  });
  await expectCode(
    'GIT_OBJECT_INVALID',
    async () => await inspector.requireCommit(REPOSITORY_PATH, OTHER_SHA),
  );
});

test('rejects duplicate, relative and structurally incomplete worktree records', async () => {
  const module = await loadGitWorktreeModule();
  const payloads = [
    [
      `worktree ${REPOSITORY_PATH}`,
      `HEAD ${COMMIT_SHA}`,
      '',
      `worktree ${REPOSITORY_PATH}`,
      `HEAD ${OTHER_SHA}`,
      '',
    ].join('\n'),
    ['worktree relative/path', `HEAD ${COMMIT_SHA}`, ''].join('\n'),
    [`worktree ${REPOSITORY_PATH}`, 'branch refs/heads/main', ''].join('\n'),
  ];

  for (const payload of payloads) {
    const runner = new ScriptedRunner(() => success(payload));
    const inspector = createInspector(module, runner);
    await expectCode(
      'GIT_WORKTREE_INVALID',
      async () => await inspector.observeWorktrees(REPOSITORY_PATH),
    );
  }
});

test('fails closed on non-zero commands, contaminated text and malformed object identities', async () => {
  const module = await loadGitWorktreeModule();

  const failedRunner = new ScriptedRunner(() => failure('observation denied'));
  await expectCode(
    'GIT_WORKTREE_INVALID',
    async () => await createInspector(module, failedRunner).observeRepository(REPOSITORY_PATH),
  );

  const contaminatedRunner = new ScriptedRunner((spec) => {
    if (spec.args.join(' ') === 'rev-parse --show-toplevel') {
      return success(`${REPOSITORY_PATH}\nextra\n`);
    }
    return repositoryResponse(spec);
  });
  await expectCode(
    'GIT_WORKTREE_INVALID',
    async () => await createInspector(module, contaminatedRunner).observeRepository(REPOSITORY_PATH),
  );

  const noCalls = new ScriptedRunner(() => assert.fail('Malformed SHA reached Git'));
  await expectCode(
    'GIT_OBJECT_INVALID',
    async () => await createInspector(module, noCalls).requireCommit(REPOSITORY_PATH, 'not-a-sha'),
  );
  assert.equal(noCalls.calls.length, 0);
});
