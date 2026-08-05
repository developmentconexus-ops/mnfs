import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';

import { MnfsError, type MnfsErrorCode } from '../../src/domain/errors.js';
import type { GitRepositoryObservation } from '../../src/adapters/git-worktree.js';
import type { ProcessResult, ProcessSpec } from '../../src/runtime/process-runner.js';

const TREEHOUSE_SPECIFIER = '../../src/adapters/' + 'treehouse.js';
const ACCEPTED_COMMAND_SHAPE_HASH = 'sha256:f2077cfd037cbaefdcfc94385a0cfeb7e1647ef294ca8ceee3cd61a1b109dc84';
const ACCEPTED_VERSION = '2.1.1';
const ACCEPTED_NODE_VERSION = 'v24.18.0';
const ACCEPTED_GIT_VERSION = '2.54.0';
const ACCEPTED_KERNEL = '6.18.33.2-microsoft-standard-WSL2';
const ACCEPTED_UBUNTU = '24.04';

interface TreehouseBoundary {
  readonly sourcePath: string;
  readonly canonicalCheckoutPath: string;
  readonly homePath: string;
  readonly xdgConfigHome: string;
  readonly poolRoot: string;
  readonly hooksPath: string;
}

interface TreehouseLeaseObservation {
  readonly path: string;
  readonly leaseId: string;
  readonly leaseHolder: string;
  readonly leasedAt: string;
}

interface TreehouseStatusProcess {
  readonly pid: number;
  readonly name: string;
}

interface TreehouseStatusItem {
  readonly name: string;
  readonly path: string;
  readonly status: 'available' | 'leased';
  readonly leaseId?: string;
  readonly leaseHolder?: string;
  readonly leasedAt?: string;
  readonly processes: readonly TreehouseStatusProcess[];
}

interface AcceptedTreehouseCandidate {
  readonly executableSha256: string;
  readonly semanticVersion: '2.1.1';
  readonly commandShapeSha256: string;
  readonly nodeVersion: string;
  readonly gitVersion: string;
  readonly kernelRelease: string;
  readonly ubuntuRelease: string;
}

interface TreehouseAdapterContract {
  acquire(input: {
    readonly boundary: TreehouseBoundary;
    readonly holder: string;
  }): Promise<TreehouseLeaseObservation>;
  status(input: {
    readonly boundary: TreehouseBoundary;
  }): Promise<readonly TreehouseStatusItem[]>;
  release(input: {
    readonly boundary: TreehouseBoundary;
    readonly path: string;
    readonly leaseId: string;
    readonly holder: string;
  }): Promise<ProcessResult>;
}

interface TreehouseModule {
  readonly TREEHOUSE_COMMAND_SHAPE_SHA256: string;
  readonly TreehouseAdapter: new (input: {
    readonly acceptedCandidate: AcceptedTreehouseCandidate;
    readonly runProcess: (spec: ProcessSpec) => Promise<ProcessResult>;
    readonly resolveExecutable: (name: 'treehouse' | 'git' | 'uname') => Promise<string>;
    readonly hashFile: (path: string) => Promise<string>;
    readonly readTextFile: (path: string) => Promise<string>;
    readonly realpath: (path: string) => Promise<string>;
    readonly nodeVersion: () => string;
    readonly osReleasePath: string;
    readonly environment: Readonly<Record<string, string>>;
    readonly gitInspector: {
      observeRepository(path: string): Promise<GitRepositoryObservation>;
    };
  }) => TreehouseAdapterContract;
}

interface Fixture {
  readonly root: string;
  readonly sourcePath: string;
  readonly canonicalPath: string;
  readonly homePath: string;
  readonly xdgConfigHome: string;
  readonly poolRoot: string;
  readonly hooksPath: string;
  readonly treehouseExecutable: string;
  readonly gitExecutable: string;
  readonly unameExecutable: string;
  readonly osReleasePath: string;
  readonly leasedPath: string;
  readonly holder: string;
  readonly leaseId: string;
  readonly leasedAt: string;
  readonly executableHash: string;
}

class ScriptedRunner {
  readonly calls: ProcessSpec[] = [];
  readonly overrides = new Map<string, ProcessResult>();
  readonly fixture: Fixture;

  constructor(fixture: Fixture) {
    this.fixture = fixture;
  }

  readonly run = async (spec: ProcessSpec): Promise<ProcessResult> => {
    this.calls.push(spec);
    const key = [spec.executable, ...spec.args].join('\u0000');
    const overridden = this.overrides.get(key);
    if (overridden !== undefined) return overridden;

    const acquisition = {
      path: this.fixture.leasedPath,
      lease_id: this.fixture.leaseId,
      lease_holder: this.fixture.holder,
      leased_at: this.fixture.leasedAt,
    };
    const status = [{
      name: 'slot-1',
      path: this.fixture.leasedPath,
      status: 'leased',
      lease_id: this.fixture.leaseId,
      lease_holder: this.fixture.holder,
      leased_at: this.fixture.leasedAt,
      processes: [],
    }];

    if (spec.executable === this.fixture.treehouseExecutable) {
      switch (spec.args.join(' ')) {
        case '--version':
          return success(`${ACCEPTED_VERSION}\n`);
        case 'get --help':
          return success('Usage: treehouse get [--lease] [--json] [--lease-holder string]\n');
        case 'status --help':
          return success('Usage: treehouse status [--json]\n');
        case 'return --help':
          return success('Usage: treehouse return [--if-lease-id string] [--if-lease-holder string]\n');
        case `get --lease --lease-holder ${this.fixture.holder} --json`:
          return success(`${JSON.stringify(acquisition)}\n`);
        case 'status --json':
          return success(`${JSON.stringify(status)}\n`);
        case `return ${this.fixture.leasedPath} --if-lease-id ${this.fixture.leaseId} --if-lease-holder ${this.fixture.holder}`:
          return failure('release output is advisory', 1);
        default:
          assert.fail(`Unexpected Treehouse command: ${spec.args.join(' ')}`);
      }
    }
    if (spec.executable === this.fixture.gitExecutable && spec.args.join(' ') === '--version') {
      return success(`git version ${ACCEPTED_GIT_VERSION}\n`);
    }
    if (spec.executable === this.fixture.unameExecutable && spec.args.join(' ') === '-r') {
      return success(`${ACCEPTED_KERNEL}\n`);
    }
    assert.fail(`Unexpected process: ${key}`);
  };
}

async function loadTreehouseModule(): Promise<TreehouseModule> {
  try {
    return await import(TREEHOUSE_SPECIFIER) as TreehouseModule;
  } catch (error) {
    assert.fail(
      `Task 9 TreehouseAdapter is not implemented: ${
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

function failure(stderr: string, exitCode = 1): ProcessResult {
  return {
    exitCode,
    signal: null,
    stdout: Buffer.alloc(0),
    stderr: Buffer.from(stderr, 'utf8'),
    timedOut: false,
  };
}

function timeout(): ProcessResult {
  return {
    exitCode: null,
    signal: 'SIGKILL',
    stdout: Buffer.alloc(0),
    stderr: Buffer.alloc(0),
    timedOut: true,
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

async function withFixture(
  operation: (fixture: Fixture) => Promise<void>,
): Promise<void> {
  const root = mkdtempSync(join(tmpdir(), 'mnfs-task9-treehouse-'));
  const sourcePath = join(root, 'runtime', 'execution-sources', 'WT-001', 'WT-001', 'A01', 'source');
  const canonicalPath = join(root, 'canonical');
  const homePath = join(root, 'runtime', 'treehouse', 'WT-001', 'A01', 'home');
  const xdgConfigHome = join(root, 'runtime', 'treehouse', 'WT-001', 'A01', 'xdg');
  const poolRoot = join(root, 'runtime', 'treehouse', 'WT-001', 'A01', 'pool');
  const hooksPath = join(root, 'runtime', 'treehouse', 'WT-001', 'A01', 'hooks');
  const binRoot = join(root, 'bin');
  const treehouseExecutable = join(binRoot, 'treehouse');
  const gitExecutable = join(binRoot, 'git');
  const unameExecutable = join(binRoot, 'uname');
  const osReleasePath = join(root, 'os-release');
  const leasedPath = join(poolRoot, 'slot-1', 'source');
  for (const path of [
    sourcePath,
    canonicalPath,
    homePath,
    xdgConfigHome,
    poolRoot,
    hooksPath,
    leasedPath,
    binRoot,
  ]) {
    mkdirSync(path, { recursive: true });
  }
  const executableBytes = Buffer.from('#!/bin/sh\nexit 0\n', 'utf8');
  writeFileSync(treehouseExecutable, executableBytes);
  writeFileSync(gitExecutable, executableBytes);
  writeFileSync(unameExecutable, executableBytes);
  writeFileSync(osReleasePath, `ID=ubuntu\nVERSION_ID="${ACCEPTED_UBUNTU}"\n`);
  chmodSync(treehouseExecutable, 0o755);
  chmodSync(gitExecutable, 0o755);
  chmodSync(unameExecutable, 0o755);

  const fixture: Fixture = {
    root,
    sourcePath: realpathSync(sourcePath),
    canonicalPath: realpathSync(canonicalPath),
    homePath: realpathSync(homePath),
    xdgConfigHome: realpathSync(xdgConfigHome),
    poolRoot: realpathSync(poolRoot),
    hooksPath: realpathSync(hooksPath),
    treehouseExecutable: realpathSync(treehouseExecutable),
    gitExecutable: realpathSync(gitExecutable),
    unameExecutable: realpathSync(unameExecutable),
    osReleasePath: realpathSync(osReleasePath),
    leasedPath: realpathSync(leasedPath),
    holder: 'mnfs-repo-lse001-g1',
    leaseId: 'lease-123',
    leasedAt: '2026-08-05T05:00:00Z',
    executableHash: `sha256:${createHash('sha256').update(executableBytes).digest('hex')}`,
  };

  try {
    await operation(fixture);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function boundary(fixture: Fixture): TreehouseBoundary {
  return {
    sourcePath: fixture.sourcePath,
    canonicalCheckoutPath: fixture.canonicalPath,
    homePath: fixture.homePath,
    xdgConfigHome: fixture.xdgConfigHome,
    poolRoot: fixture.poolRoot,
    hooksPath: fixture.hooksPath,
  };
}

function repositoryObservation(fixture: Fixture): GitRepositoryObservation {
  return {
    repositoryPath: fixture.sourcePath,
    gitDirPath: join(fixture.sourcePath, '.git'),
    commonDirPath: join(fixture.sourcePath, '.git'),
    objectDirPath: join(fixture.sourcePath, '.git', 'objects'),
    objectFormat: 'sha1',
    headCommitSha: '1'.repeat(40),
    headTreeSha: '2'.repeat(40),
    statusPorcelainV1Z: Buffer.alloc(0),
    remotes: [],
  };
}

function candidate(fixture: Fixture): AcceptedTreehouseCandidate {
  return {
    executableSha256: fixture.executableHash,
    semanticVersion: ACCEPTED_VERSION,
    commandShapeSha256: ACCEPTED_COMMAND_SHAPE_HASH,
    nodeVersion: ACCEPTED_NODE_VERSION,
    gitVersion: ACCEPTED_GIT_VERSION,
    kernelRelease: ACCEPTED_KERNEL,
    ubuntuRelease: ACCEPTED_UBUNTU,
  };
}

function createAdapter(
  module: TreehouseModule,
  fixture: Fixture,
  runner: ScriptedRunner,
  overrides: Partial<{
    readonly acceptedCandidate: AcceptedTreehouseCandidate;
    readonly hashFile: (path: string) => Promise<string>;
    readonly readTextFile: (path: string) => Promise<string>;
    readonly realpath: (path: string) => Promise<string>;
    readonly nodeVersion: () => string;
    readonly gitObservation: GitRepositoryObservation;
    readonly environment: Readonly<Record<string, string>>;
  }> = {},
): TreehouseAdapterContract {
  return new module.TreehouseAdapter({
    acceptedCandidate: overrides.acceptedCandidate ?? candidate(fixture),
    runProcess: runner.run,
    resolveExecutable: async (name) => ({
      treehouse: fixture.treehouseExecutable,
      git: fixture.gitExecutable,
      uname: fixture.unameExecutable,
    })[name],
    hashFile: overrides.hashFile ?? (async (path) => {
      assert.equal(path, fixture.treehouseExecutable);
      return fixture.executableHash;
    }),
    readTextFile: overrides.readTextFile ?? (async (path) => readFileSync(path, 'utf8')),
    realpath: overrides.realpath ?? (async (path) => realpathSync(path)),
    nodeVersion: overrides.nodeVersion ?? (() => ACCEPTED_NODE_VERSION),
    osReleasePath: fixture.osReleasePath,
    environment: overrides.environment ?? {
      PATH: `/untrusted:${dirname(fixture.treehouseExecutable)}:/mnt/c/Windows/System32`,
      HOME: '/home/operator',
      SECRET_VALUE: 'must-not-propagate',
      HTTP_PROXY: 'http://proxy.invalid',
      GIT_CONFIG_PARAMETERS: "'core.fsmonitor'='/tmp/attacker'",
    },
    gitInspector: {
      observeRepository: async (path) => {
        assert.equal(path, fixture.sourcePath);
        return overrides.gitObservation ?? repositoryObservation(fixture);
      },
    },
  });
}

function protectedCalls(fixture: Fixture, calls: readonly ProcessSpec[]): ProcessSpec[] {
  return calls.filter((call) => call.executable === fixture.treehouseExecutable
    && !call.args.includes('--help')
    && call.args.join(' ') !== '--version');
}

test('uses exact protected argv, Attempt-owned cwd/environment and advisory release output', async () => {
  const module = await loadTreehouseModule();
  assert.equal(module.TREEHOUSE_COMMAND_SHAPE_SHA256, ACCEPTED_COMMAND_SHAPE_HASH);

  await withFixture(async (fixture) => {
    const runner = new ScriptedRunner(fixture);
    const adapter = createAdapter(module, fixture, runner);

    const acquired = await adapter.acquire({ boundary: boundary(fixture), holder: fixture.holder });
    const status = await adapter.status({ boundary: boundary(fixture) });
    const released = await adapter.release({
      boundary: boundary(fixture),
      path: fixture.leasedPath,
      leaseId: fixture.leaseId,
      holder: fixture.holder,
    });

    assert.deepEqual(acquired, {
      path: fixture.leasedPath,
      leaseId: fixture.leaseId,
      leaseHolder: fixture.holder,
      leasedAt: fixture.leasedAt,
    });
    assert.equal(status.length, 1);
    assert.equal(released.exitCode, 1, 'release output is advisory until fresh observation');

    const calls = protectedCalls(fixture, runner.calls);
    assert.deepEqual(calls.map((call) => call.args), [
      ['get', '--lease', '--lease-holder', fixture.holder, '--json'],
      ['status', '--json'],
      ['return', fixture.leasedPath, '--if-lease-id', fixture.leaseId, '--if-lease-holder', fixture.holder],
    ]);
    const expectedEnvironment = {
      PATH: `${dirname(fixture.treehouseExecutable)}:${dirname(fixture.gitExecutable)}:/usr/bin:/bin`,
      HOME: fixture.homePath,
      XDG_CONFIG_HOME: fixture.xdgConfigHome,
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
    for (const call of calls) {
      assert.equal(call.cwd, fixture.sourcePath);
      assert.deepEqual(call.env, expectedEnvironment);
      assert.equal(call.timeoutMs, 30_000);
      assert.equal(call.stdoutLimitBytes, 65_536);
      assert.equal(call.stderrLimitBytes, 65_536);
      assert.equal(call.env.SECRET_VALUE, undefined);
      assert.equal(call.env.HTTP_PROXY, undefined);
    }
  });
});

test('accepts one strict acquisition object and rejects UTF-8, JSON, identity, boundary and process failures', async () => {
  const module = await loadTreehouseModule();
  await withFixture(async (fixture) => {
    const operationKey = [
      fixture.treehouseExecutable,
      'get', '--lease', '--lease-holder', fixture.holder, '--json',
    ].join('\u0000');
    const valid = {
      path: fixture.leasedPath,
      lease_id: fixture.leaseId,
      lease_holder: fixture.holder,
      leased_at: fixture.leasedAt,
    };
    const invalidResults: readonly [ProcessResult, MnfsErrorCode][] = [
      [success(Buffer.from([0xc3, 0x28])), 'TREEHOUSE_OUTPUT_INVALID'],
      [success(`${JSON.stringify(valid)}\ntrailing\n`), 'TREEHOUSE_OUTPUT_INVALID'],
      [success(JSON.stringify({ ...valid, unexpected: true })), 'TREEHOUSE_OUTPUT_INVALID'],
      [success(JSON.stringify({ ...valid, lease_holder: 'other-holder' })), 'TREEHOUSE_OUTPUT_INVALID'],
      [success(JSON.stringify({ ...valid, lease_id: 'bad\nid' })), 'TREEHOUSE_OUTPUT_INVALID'],
      [success(JSON.stringify({ ...valid, path: '/mnt/c/escaped' })), 'TREEHOUSE_OUTPUT_INVALID'],
      [failure('get failed', 2), 'TREEHOUSE_COMMAND_FAILED'],
      [timeout(), 'TREEHOUSE_TIMEOUT'],
    ];

    for (const [result, code] of invalidResults) {
      const runner = new ScriptedRunner(fixture);
      runner.overrides.set(operationKey, result);
      const adapter = createAdapter(module, fixture, runner);
      await expectCode(
        code,
        async () => await adapter.acquire({ boundary: boundary(fixture), holder: fixture.holder }),
      );
    }
  });
});

test('parses strict status arrays and rejects duplicate or structurally inconsistent identities', async () => {
  const module = await loadTreehouseModule();
  await withFixture(async (fixture) => {
    const operationKey = [fixture.treehouseExecutable, 'status', '--json'].join('\u0000');
    const leased = {
      name: 'slot-1',
      path: fixture.leasedPath,
      status: 'leased',
      lease_id: fixture.leaseId,
      lease_holder: fixture.holder,
      leased_at: fixture.leasedAt,
      processes: [{ pid: 123, name: 'node' }],
    };
    const availablePath = join(fixture.poolRoot, 'slot-2', 'source');
    mkdirSync(availablePath, { recursive: true });
    const validRunner = new ScriptedRunner(fixture);
    validRunner.overrides.set(operationKey, success(JSON.stringify([
      leased,
      {
        name: 'slot-2',
        path: realpathSync(availablePath),
        status: 'available',
        processes: [],
      },
    ])));
    const status = await createAdapter(module, fixture, validRunner).status({ boundary: boundary(fixture) });
    assert.deepEqual(status[0], {
      name: 'slot-1',
      path: fixture.leasedPath,
      status: 'leased',
      leaseId: fixture.leaseId,
      leaseHolder: fixture.holder,
      leasedAt: fixture.leasedAt,
      processes: [{ pid: 123, name: 'node' }],
    });

    const invalidOutputs = [
      'slot-1 leased /tmp/worktree\n',
      JSON.stringify([leased, { ...leased, name: 'duplicate-path' }]),
      JSON.stringify([leased, { ...leased, name: 'duplicate-id', path: realpathSync(availablePath) }]),
      JSON.stringify([{ ...leased, status: 'available' }]),
      JSON.stringify([{ name: 'slot-1', path: fixture.leasedPath, status: 'leased', processes: [] }]),
      JSON.stringify([{ ...leased, extra: true }]),
      JSON.stringify([{ ...leased, path: '/mnt/c/escaped' }]),
    ];
    for (const stdout of invalidOutputs) {
      const runner = new ScriptedRunner(fixture);
      runner.overrides.set(operationKey, success(stdout));
      await expectCode(
        'TREEHOUSE_OUTPUT_INVALID',
        async () => await createAdapter(module, fixture, runner).status({ boundary: boundary(fixture) }),
      );
    }
  });
});

test('revalidates executable, capabilities, Git, Node, WSL and command shape before every protected operation', async () => {
  const module = await loadTreehouseModule();
  await withFixture(async (fixture) => {
    const runner = new ScriptedRunner(fixture);
    let gitObservations = 0;
    const adapter = new module.TreehouseAdapter({
      acceptedCandidate: candidate(fixture),
      runProcess: runner.run,
      resolveExecutable: async (name) => ({
        treehouse: fixture.treehouseExecutable,
        git: fixture.gitExecutable,
        uname: fixture.unameExecutable,
      })[name],
      hashFile: async () => fixture.executableHash,
      readTextFile: async (path) => readFileSync(path, 'utf8'),
      realpath: async (path) => realpathSync(path),
      nodeVersion: () => ACCEPTED_NODE_VERSION,
      osReleasePath: fixture.osReleasePath,
      environment: { PATH: '/untrusted:/mnt/c/Windows/System32' },
      gitInspector: {
        observeRepository: async () => {
          gitObservations += 1;
          return repositoryObservation(fixture);
        },
      },
    });

    await adapter.acquire({ boundary: boundary(fixture), holder: fixture.holder });
    await adapter.status({ boundary: boundary(fixture) });
    await adapter.release({
      boundary: boundary(fixture),
      path: fixture.leasedPath,
      leaseId: fixture.leaseId,
      holder: fixture.holder,
    });

    assert.equal(gitObservations, 3);
    for (const args of [
      ['--version'],
      ['get', '--help'],
      ['status', '--help'],
      ['return', '--help'],
    ]) {
      assert.equal(
        runner.calls.filter((call) => call.executable === fixture.treehouseExecutable
          && JSON.stringify(call.args) === JSON.stringify(args)).length,
        3,
        args.join(' '),
      );
    }
    assert.equal(runner.calls.filter((call) => call.executable === fixture.gitExecutable).length, 3);
    assert.equal(runner.calls.filter((call) => call.executable === fixture.unameExecutable).length, 3);
  });
});

test('blocks executable, version and capability drift before invoking a protected command', async () => {
  const module = await loadTreehouseModule();
  await withFixture(async (fixture) => {
    const cases: Array<(runner: ScriptedRunner) => TreehouseAdapterContract> = [
      (runner) => createAdapter(module, fixture, runner, {
        hashFile: async () => `sha256:${'0'.repeat(64)}`,
      }),
      (runner) => {
        runner.overrides.set(
          [fixture.treehouseExecutable, '--version'].join('\u0000'),
          success('2.2.0\n'),
        );
        return createAdapter(module, fixture, runner);
      },
      (runner) => {
        runner.overrides.set(
          [fixture.treehouseExecutable, '--version'].join('\u0000'),
          success('treehouse 2.1.1\n'),
        );
        return createAdapter(module, fixture, runner);
      },
      (runner) => {
        runner.overrides.set(
          [fixture.treehouseExecutable, 'return', '--help'].join('\u0000'),
          success('Usage: treehouse return [--if-lease-id string]\n'),
        );
        return createAdapter(module, fixture, runner);
      },
    ];

    for (const build of cases) {
      const runner = new ScriptedRunner(fixture);
      const adapter = build(runner);
      await expectCode(
        'TREEHOUSE_VERSION_UNSUPPORTED',
        async () => await adapter.acquire({ boundary: boundary(fixture), holder: fixture.holder }),
      );
      assert.equal(protectedCalls(fixture, runner.calls).length, 0);
    }
  });
});

test('blocks Git, Node, Ubuntu/WSL, environment and command-shape drift before protected work', async () => {
  const module = await loadTreehouseModule();
  await withFixture(async (fixture) => {
    const driftCases: Array<{
      readonly configure: (runner: ScriptedRunner) => Partial<Parameters<typeof createAdapter>[3]>;
    }> = [
      {
        configure: (runner) => {
          runner.overrides.set(
            [fixture.gitExecutable, '--version'].join('\u0000'),
            success('git version 2.55.0\n'),
          );
          return {};
        },
      },
      { configure: () => ({ nodeVersion: () => 'v25.0.0' }) },
      {
        configure: (runner) => {
          runner.overrides.set(
            [fixture.unameExecutable, '-r'].join('\u0000'),
            success('6.8.0-generic\n'),
          );
          return {};
        },
      },
      {
        configure: () => ({
          readTextFile: async () => 'ID=ubuntu\nVERSION_ID="26.04"\n',
        }),
      },
      {
        configure: () => ({
          acceptedCandidate: {
            ...candidate(fixture),
            commandShapeSha256: `sha256:${'f'.repeat(64)}`,
          },
        }),
      },
      {
        configure: () => ({
          gitObservation: {
            ...repositoryObservation(fixture),
            remotes: ['origin'],
          },
        }),
      },
      {
        configure: () => ({
          gitObservation: {
            ...repositoryObservation(fixture),
            statusPorcelainV1Z: Buffer.from('?? drift\0'),
          },
        }),
      },
    ];

    for (const driftCase of driftCases) {
      const runner = new ScriptedRunner(fixture);
      const adapter = createAdapter(module, fixture, runner, driftCase.configure(runner));
      await expectCode(
        'TREEHOUSE_OBSERVATION_CONFLICT',
        async () => await adapter.acquire({ boundary: boundary(fixture), holder: fixture.holder }),
      );
      assert.equal(protectedCalls(fixture, runner.calls).length, 0);
    }
  });
});

test('rejects canonical, mounted, escaped, symlinked and newline-bearing boundaries before Treehouse', async () => {
  const module = await loadTreehouseModule();
  await withFixture(async (fixture) => {
    const linkedSource = join(fixture.root, 'linked-source');
    symlinkSync(fixture.sourcePath, linkedSource, 'dir');
    const invalidBoundaries: TreehouseBoundary[] = [
      { ...boundary(fixture), sourcePath: fixture.canonicalPath },
      { ...boundary(fixture), sourcePath: '/mnt/c/source' },
      { ...boundary(fixture), sourcePath: linkedSource },
      { ...boundary(fixture), homePath: `${fixture.homePath}\n` },
      { ...boundary(fixture), poolRoot: fixture.sourcePath },
    ];

    for (const value of invalidBoundaries) {
      const runner = new ScriptedRunner(fixture);
      const adapter = createAdapter(module, fixture, runner);
      await expectCode(
        'TREEHOUSE_OBSERVATION_CONFLICT',
        async () => await adapter.acquire({ boundary: value, holder: fixture.holder }),
      );
      assert.equal(protectedCalls(fixture, runner.calls).length, 0);
    }
  });
});

test('source contains no destructive, shell, inherited-environment or stderr-state fallback', async () => {
  const sourcePath = join(process.cwd(), 'src', 'adapters', 'treehouse.ts');
  assert.equal(existsSync(sourcePath), true, 'Task 9 production adapter is absent');
  const source = readFileSync(sourcePath, 'utf8');
  for (const [label, pattern] of [
    ['force', /--force/u],
    ['destroy', /\bdestroy\b/u],
    ['prune', /\bprune\b/u],
    ['shell true', /shell\s*:\s*true/u],
    ['exec fallback', /\bexec(?:Sync)?\s*\(/u],
    ['inherited environment spread', /\.\.\.(?:process\.)?env/u],
    ['stderr state inference', /stderr[\s\S]{0,120}(?:match|test|includes|search)\s*\(/u],
  ] as const) {
    assert.equal(pattern.test(source), false, label);
  }
  assert.equal(/canonicalCheckoutPath[\s\S]{0,200}cwd/u.test(source), false);
});
