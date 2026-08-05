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

import type { GitRepositoryObservation } from '../../src/adapters/git-worktree.js';
import { MnfsError, type MnfsErrorCode } from '../../src/domain/errors.js';
import type { ProcessResult, ProcessSpec } from '../../src/runtime/process-runner.js';

const TREEHOUSE_SPECIFIER = '../../src/adapters/' + 'treehouse.js';
const COMMAND_SHAPE_HASH = 'sha256:f2077cfd037cbaefdcfc94385a0cfeb7e1647ef294ca8ceee3cd61a1b109dc84';
const VERSION = '2.1.1' as const;
const NODE_VERSION = 'v24.18.0';
const GIT_VERSION = '2.54.0';
const KERNEL = '6.18.33.2-microsoft-standard-WSL2';
const UBUNTU = '24.04';

interface Boundary {
  readonly sourcePath: string;
  readonly canonicalCheckoutPath: string;
  readonly homePath: string;
  readonly xdgConfigHome: string;
  readonly poolRoot: string;
  readonly hooksPath: string;
}

interface Candidate {
  readonly executableSha256: string;
  readonly semanticVersion: typeof VERSION;
  readonly commandShapeSha256: string;
  readonly nodeVersion: string;
  readonly gitVersion: string;
  readonly kernelRelease: string;
  readonly ubuntuRelease: string;
}

interface LeaseObservation {
  readonly path: string;
  readonly leaseId: string;
  readonly leaseHolder: string;
  readonly leasedAt: string;
}

interface StatusItem {
  readonly name: string;
  readonly path: string;
  readonly status: 'available' | 'leased';
  readonly leaseId?: string;
  readonly leaseHolder?: string;
  readonly leasedAt?: string;
  readonly processes: readonly Readonly<{ pid: number; name: string }>[];
}

interface AdapterContract {
  acquire(input: Readonly<{ boundary: Boundary; holder: string }>): Promise<LeaseObservation>;
  status(input: Readonly<{ boundary: Boundary }>): Promise<readonly StatusItem[]>;
  release(input: Readonly<{
    boundary: Boundary;
    path: string;
    leaseId: string;
    holder: string;
  }>): Promise<ProcessResult>;
}

interface TreehouseModule {
  readonly TREEHOUSE_COMMAND_SHAPE_SHA256: string;
  readonly TreehouseAdapter: new (input: Readonly<{
    acceptedCandidate: Candidate;
    runProcess: (spec: ProcessSpec) => Promise<ProcessResult>;
    resolveExecutable: (name: 'treehouse' | 'git' | 'uname') => Promise<string>;
    hashFile: (path: string) => Promise<string>;
    readTextFile: (path: string) => Promise<string>;
    realpath: (path: string) => Promise<string>;
    nodeVersion: () => string;
    osReleasePath: string;
    environment: Readonly<Record<string, string>>;
    gitInspector: {
      observeRepository(path: string): Promise<GitRepositoryObservation>;
    };
  }>) => AdapterContract;
}

interface Fixture {
  readonly root: string;
  readonly sourcePath: string;
  readonly canonicalPath: string;
  readonly homePath: string;
  readonly xdgPath: string;
  readonly poolRoot: string;
  readonly hooksPath: string;
  readonly treehouse: string;
  readonly git: string;
  readonly uname: string;
  readonly osRelease: string;
  readonly leasedPath: string;
  readonly holder: string;
  readonly leaseId: string;
  readonly leasedAt: string;
  readonly executableHash: string;
}

interface AdapterOverrides {
  readonly candidate?: Candidate;
  readonly hashFile?: (path: string) => Promise<string>;
  readonly readTextFile?: (path: string) => Promise<string>;
  readonly realpath?: (path: string) => Promise<string>;
  readonly nodeVersion?: () => string;
  readonly gitObservation?: GitRepositoryObservation;
}

class Runner {
  readonly calls: ProcessSpec[] = [];
  readonly overrides = new Map<string, ProcessResult>();

  constructor(readonly fixture: Fixture) {}

  readonly run = async (spec: ProcessSpec): Promise<ProcessResult> => {
    this.calls.push(spec);
    const key = commandKey(spec.executable, spec.args);
    const override = this.overrides.get(key);
    if (override !== undefined) return override;

    if (spec.executable === this.fixture.treehouse) {
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
      switch (spec.args.join(' ')) {
        case '--version':
          return success(`${VERSION}\n`);
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
    if (spec.executable === this.fixture.git && spec.args.join(' ') === '--version') {
      return success(`git version ${GIT_VERSION}\n`);
    }
    if (spec.executable === this.fixture.uname && spec.args.join(' ') === '-r') {
      return success(`${KERNEL}\n`);
    }
    assert.fail(`Unexpected process: ${key}`);
  };
}

async function loadModule(): Promise<TreehouseModule> {
  try {
    return await import(TREEHOUSE_SPECIFIER) as TreehouseModule;
  } catch (error) {
    assert.fail(`Task 9 TreehouseAdapter is not implemented: ${
      error instanceof Error ? error.message : String(error)
    }`);
  }
}

function commandKey(executable: string, args: readonly string[]): string {
  return [executable, ...args].join('\u0000');
}

function success(stdout: string | Buffer = ''): ProcessResult {
  return {
    exitCode: 0,
    signal: null,
    stdout: Buffer.isBuffer(stdout) ? Buffer.from(stdout) : Buffer.from(stdout),
    stderr: Buffer.alloc(0),
    timedOut: false,
  };
}

function failure(stderr: string, exitCode = 1): ProcessResult {
  return {
    exitCode,
    signal: null,
    stdout: Buffer.alloc(0),
    stderr: Buffer.from(stderr),
    timedOut: false,
  };
}

function timedOut(): ProcessResult {
  return {
    exitCode: null,
    signal: 'SIGKILL',
    stdout: Buffer.alloc(0),
    stderr: Buffer.alloc(0),
    timedOut: true,
  };
}

async function expectCode(code: MnfsErrorCode, operation: () => Promise<unknown>): Promise<void> {
  await assert.rejects(
    operation,
    (error: unknown) => error instanceof MnfsError && error.code === code,
  );
}

async function withFixture(operation: (fixture: Fixture) => Promise<void>): Promise<void> {
  const root = mkdtempSync(join(tmpdir(), 'mnfs-task9-'));
  const sourcePath = join(root, 'runtime', 'execution-sources', 'WT-001', 'WT-001', 'A01', 'source');
  const canonicalPath = join(root, 'canonical');
  const homePath = join(root, 'runtime', 'treehouse', 'home');
  const xdgPath = join(root, 'runtime', 'treehouse', 'xdg');
  const poolRoot = join(root, 'runtime', 'treehouse', 'pool');
  const hooksPath = join(root, 'runtime', 'treehouse', 'hooks');
  const leasedPath = join(poolRoot, 'slot-1', 'source');
  const bin = join(root, 'bin');
  for (const path of [sourcePath, canonicalPath, homePath, xdgPath, poolRoot, hooksPath, leasedPath, bin]) {
    mkdirSync(path, { recursive: true });
  }
  const bytes = Buffer.from('#!/bin/sh\nexit 0\n');
  const treehouse = join(bin, 'treehouse');
  const git = join(bin, 'git');
  const uname = join(bin, 'uname');
  const osRelease = join(root, 'os-release');
  for (const path of [treehouse, git, uname]) {
    writeFileSync(path, bytes);
    chmodSync(path, 0o755);
  }
  writeFileSync(osRelease, `ID=ubuntu\nVERSION_ID="${UBUNTU}"\n`);

  const fixture: Fixture = {
    root,
    sourcePath: realpathSync(sourcePath),
    canonicalPath: realpathSync(canonicalPath),
    homePath: realpathSync(homePath),
    xdgPath: realpathSync(xdgPath),
    poolRoot: realpathSync(poolRoot),
    hooksPath: realpathSync(hooksPath),
    treehouse: realpathSync(treehouse),
    git: realpathSync(git),
    uname: realpathSync(uname),
    osRelease: realpathSync(osRelease),
    leasedPath: realpathSync(leasedPath),
    holder: 'mnfs-repo-lse001-g1',
    leaseId: 'lease-123',
    leasedAt: '2026-08-05T05:00:00Z',
    executableHash: `sha256:${createHash('sha256').update(bytes).digest('hex')}`,
  };
  try {
    await operation(fixture);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function boundary(fixture: Fixture): Boundary {
  return {
    sourcePath: fixture.sourcePath,
    canonicalCheckoutPath: fixture.canonicalPath,
    homePath: fixture.homePath,
    xdgConfigHome: fixture.xdgPath,
    poolRoot: fixture.poolRoot,
    hooksPath: fixture.hooksPath,
  };
}

function observation(fixture: Fixture): GitRepositoryObservation {
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

function candidate(fixture: Fixture): Candidate {
  return {
    executableSha256: fixture.executableHash,
    semanticVersion: VERSION,
    commandShapeSha256: COMMAND_SHAPE_HASH,
    nodeVersion: NODE_VERSION,
    gitVersion: GIT_VERSION,
    kernelRelease: KERNEL,
    ubuntuRelease: UBUNTU,
  };
}

function createAdapter(
  module: TreehouseModule,
  fixture: Fixture,
  runner: Runner,
  overrides: AdapterOverrides = {},
): AdapterContract {
  return new module.TreehouseAdapter({
    acceptedCandidate: overrides.candidate ?? candidate(fixture),
    runProcess: runner.run,
    resolveExecutable: async (name) => ({
      treehouse: fixture.treehouse,
      git: fixture.git,
      uname: fixture.uname,
    })[name],
    hashFile: overrides.hashFile ?? (async () => fixture.executableHash),
    readTextFile: overrides.readTextFile ?? (async (path) => readFileSync(path, 'utf8')),
    realpath: overrides.realpath ?? (async (path) => realpathSync(path)),
    nodeVersion: overrides.nodeVersion ?? (() => NODE_VERSION),
    osReleasePath: fixture.osRelease,
    environment: {
      PATH: `/untrusted:${dirname(fixture.treehouse)}:/mnt/c/Windows/System32`,
      HOME: '/home/operator',
      SECRET_VALUE: 'must-not-propagate',
      HTTP_PROXY: 'http://proxy.invalid',
      GIT_CONFIG_PARAMETERS: "'core.fsmonitor'='/tmp/attacker'",
    },
    gitInspector: {
      observeRepository: async (path) => {
        assert.equal(path, fixture.sourcePath);
        return overrides.gitObservation ?? observation(fixture);
      },
    },
  });
}

function protectedCalls(fixture: Fixture, calls: readonly ProcessSpec[]): ProcessSpec[] {
  return calls.filter((call) => call.executable === fixture.treehouse
    && call.args.join(' ') !== '--version'
    && !call.args.includes('--help'));
}

test('uses exact argv, Attempt-owned cwd/environment and advisory release output', async () => {
  const module = await loadModule();
  assert.equal(module.TREEHOUSE_COMMAND_SHAPE_SHA256, COMMAND_SHAPE_HASH);
  await withFixture(async (fixture) => {
    const runner = new Runner(fixture);
    const adapter = createAdapter(module, fixture, runner);
    const acquired = await adapter.acquire({ boundary: boundary(fixture), holder: fixture.holder });
    await adapter.status({ boundary: boundary(fixture) });
    const release = await adapter.release({
      boundary: boundary(fixture),
      path: fixture.leasedPath,
      leaseId: fixture.leaseId,
      holder: fixture.holder,
    });
    assert.equal(acquired.leaseId, fixture.leaseId);
    assert.equal(release.exitCode, 1);

    const calls = protectedCalls(fixture, runner.calls);
    assert.deepEqual(calls.map((call) => call.args), [
      ['get', '--lease', '--lease-holder', fixture.holder, '--json'],
      ['status', '--json'],
      ['return', fixture.leasedPath, '--if-lease-id', fixture.leaseId, '--if-lease-holder', fixture.holder],
    ]);
    const expectedEnvironment: Readonly<Record<string, string>> = {
      PATH: `${dirname(fixture.treehouse)}:${dirname(fixture.git)}:/usr/bin:/bin`,
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

test('rejects contaminated acquisition output and command failures', async () => {
  const module = await loadModule();
  await withFixture(async (fixture) => {
    const key = commandKey(fixture.treehouse, ['get', '--lease', '--lease-holder', fixture.holder, '--json']);
    const valid = {
      path: fixture.leasedPath,
      lease_id: fixture.leaseId,
      lease_holder: fixture.holder,
      leased_at: fixture.leasedAt,
    };
    const cases: readonly [ProcessResult, MnfsErrorCode][] = [
      [success(Buffer.from([0xc3, 0x28])), 'TREEHOUSE_OUTPUT_INVALID'],
      [success(`${JSON.stringify(valid)}\ntrailing`), 'TREEHOUSE_OUTPUT_INVALID'],
      [success(JSON.stringify({ ...valid, unexpected: true })), 'TREEHOUSE_OUTPUT_INVALID'],
      [success(JSON.stringify({ ...valid, lease_holder: 'other' })), 'TREEHOUSE_OUTPUT_INVALID'],
      [success(JSON.stringify({ ...valid, path: '/mnt/c/escape' })), 'TREEHOUSE_OUTPUT_INVALID'],
      [failure('failed', 2), 'TREEHOUSE_COMMAND_FAILED'],
      [timedOut(), 'TREEHOUSE_TIMEOUT'],
    ];
    for (const [result, code] of cases) {
      const runner = new Runner(fixture);
      runner.overrides.set(key, result);
      await expectCode(code, async () => await createAdapter(module, fixture, runner).acquire({
        boundary: boundary(fixture),
        holder: fixture.holder,
      }));
    }
  });
});

test('parses strict status and rejects duplicate or inconsistent identities', async () => {
  const module = await loadModule();
  await withFixture(async (fixture) => {
    const key = commandKey(fixture.treehouse, ['status', '--json']);
    const leased = {
      name: 'slot-1',
      path: fixture.leasedPath,
      status: 'leased',
      lease_id: fixture.leaseId,
      lease_holder: fixture.holder,
      leased_at: fixture.leasedAt,
      processes: [],
    };
    const other = join(fixture.poolRoot, 'slot-2', 'source');
    mkdirSync(other, { recursive: true });
    const invalid = [
      'human status',
      JSON.stringify([leased, { ...leased, name: 'duplicate-path' }]),
      JSON.stringify([leased, { ...leased, name: 'duplicate-id', path: realpathSync(other) }]),
      JSON.stringify([{ ...leased, status: 'available' }]),
      JSON.stringify([{ name: 'slot', path: fixture.leasedPath, status: 'leased', processes: [] }]),
      JSON.stringify([{ ...leased, extra: true }]),
      JSON.stringify([{ ...leased, path: '/mnt/c/escape' }]),
    ];
    for (const stdout of invalid) {
      const runner = new Runner(fixture);
      runner.overrides.set(key, success(stdout));
      await expectCode('TREEHOUSE_OUTPUT_INVALID', async () => await createAdapter(
        module,
        fixture,
        runner,
      ).status({ boundary: boundary(fixture) }));
    }
  });
});

test('revalidates candidate and source before every protected operation', async () => {
  const module = await loadModule();
  await withFixture(async (fixture) => {
    const runner = new Runner(fixture);
    let observations = 0;
    const adapter = new module.TreehouseAdapter({
      acceptedCandidate: candidate(fixture),
      runProcess: runner.run,
      resolveExecutable: async (name) => ({ treehouse: fixture.treehouse, git: fixture.git, uname: fixture.uname })[name],
      hashFile: async () => fixture.executableHash,
      readTextFile: async (path) => readFileSync(path, 'utf8'),
      realpath: async (path) => realpathSync(path),
      nodeVersion: () => NODE_VERSION,
      osReleasePath: fixture.osRelease,
      environment: { PATH: '/untrusted:/mnt/c/Windows' },
      gitInspector: {
        observeRepository: async () => {
          observations += 1;
          return observation(fixture);
        },
      },
    });
    await adapter.acquire({ boundary: boundary(fixture), holder: fixture.holder });
    await adapter.status({ boundary: boundary(fixture) });
    await adapter.release({ boundary: boundary(fixture), path: fixture.leasedPath, leaseId: fixture.leaseId, holder: fixture.holder });
    assert.equal(observations, 3);
    for (const args of [['--version'], ['get', '--help'], ['status', '--help'], ['return', '--help']]) {
      assert.equal(runner.calls.filter((call) => call.executable === fixture.treehouse
        && JSON.stringify(call.args) === JSON.stringify(args)).length, 3);
    }
  });
});

test('blocks executable, version and capability drift before protected work', async () => {
  const module = await loadModule();
  await withFixture(async (fixture) => {
    const builders: Array<(runner: Runner) => AdapterContract> = [
      (runner) => createAdapter(module, fixture, runner, { hashFile: async () => `sha256:${'0'.repeat(64)}` }),
      (runner) => {
        runner.overrides.set(commandKey(fixture.treehouse, ['--version']), success('2.2.0\n'));
        return createAdapter(module, fixture, runner);
      },
      (runner) => {
        runner.overrides.set(commandKey(fixture.treehouse, ['--version']), success('treehouse 2.1.1\n'));
        return createAdapter(module, fixture, runner);
      },
      (runner) => {
        runner.overrides.set(commandKey(fixture.treehouse, ['return', '--help']), success('Usage: return --if-lease-id\n'));
        return createAdapter(module, fixture, runner);
      },
    ];
    for (const build of builders) {
      const runner = new Runner(fixture);
      await expectCode('TREEHOUSE_VERSION_UNSUPPORTED', async () => await build(runner).acquire({
        boundary: boundary(fixture),
        holder: fixture.holder,
      }));
      assert.equal(protectedCalls(fixture, runner.calls).length, 0);
    }
  });
});

test('blocks Git, Node, WSL, Ubuntu and command-shape drift before protected work', async () => {
  const module = await loadModule();
  await withFixture(async (fixture) => {
    const cases: Array<(runner: Runner) => AdapterOverrides> = [
      (runner) => {
        runner.overrides.set(commandKey(fixture.git, ['--version']), success('git version 2.55.0\n'));
        return {};
      },
      () => ({ nodeVersion: () => 'v25.0.0' }),
      (runner) => {
        runner.overrides.set(commandKey(fixture.uname, ['-r']), success('6.8.0-generic\n'));
        return {};
      },
      () => ({ readTextFile: async () => 'ID=ubuntu\nVERSION_ID="26.04"\n' }),
      () => ({ candidate: { ...candidate(fixture), commandShapeSha256: `sha256:${'f'.repeat(64)}` } }),
      () => ({ gitObservation: { ...observation(fixture), remotes: ['origin'] } }),
      () => ({ gitObservation: { ...observation(fixture), statusPorcelainV1Z: Buffer.from('?? drift\0') } }),
    ];
    for (const configure of cases) {
      const runner = new Runner(fixture);
      await expectCode('TREEHOUSE_OBSERVATION_CONFLICT', async () => await createAdapter(
        module,
        fixture,
        runner,
        configure(runner),
      ).acquire({ boundary: boundary(fixture), holder: fixture.holder }));
      assert.equal(protectedCalls(fixture, runner.calls).length, 0);
    }
  });
});

test('rejects canonical, mounted, symlinked and overlapping boundaries before Treehouse', async () => {
  const module = await loadModule();
  await withFixture(async (fixture) => {
    const linked = join(fixture.root, 'linked-source');
    symlinkSync(fixture.sourcePath, linked, 'dir');
    const invalid: Boundary[] = [
      { ...boundary(fixture), sourcePath: fixture.canonicalPath },
      { ...boundary(fixture), sourcePath: '/mnt/c/source' },
      { ...boundary(fixture), sourcePath: linked },
      { ...boundary(fixture), homePath: `${fixture.homePath}\n` },
      { ...boundary(fixture), poolRoot: fixture.sourcePath },
    ];
    for (const value of invalid) {
      const runner = new Runner(fixture);
      await expectCode('TREEHOUSE_OBSERVATION_CONFLICT', async () => await createAdapter(
        module,
        fixture,
        runner,
      ).acquire({ boundary: value, holder: fixture.holder }));
      assert.equal(protectedCalls(fixture, runner.calls).length, 0);
    }
  });
});

test('source contains no destructive, shell, inherited-environment or stderr-state fallback', async () => {
  const path = join(process.cwd(), 'src', 'adapters', 'treehouse.ts');
  assert.equal(existsSync(path), true, 'Task 9 production adapter is absent');
  const source = readFileSync(path, 'utf8');
  for (const [label, pattern] of [
    ['force', /--force/u],
    ['destroy', /\bdestroy\b/u],
    ['prune', /\bprune\b/u],
    ['shell true', /shell\s*:\s*true/u],
    ['exec fallback', /\bexec(?:Sync)?\s*\(/u],
    ['environment spread', /\.\.\.(?:process\.)?env/u],
    ['stderr inference', /stderr[\s\S]{0,120}(?:match|test|includes|search)\s*\(/u],
  ] as const) {
    assert.equal(pattern.test(source), false, label);
  }
  assert.equal(/canonicalCheckoutPath[\s\S]{0,200}cwd/u.test(source), false);
});
