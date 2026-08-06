import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
  chmodSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';

import type { GitRepositoryObservation } from '../../src/adapters/git-worktree.js';
import { MnfsError, type MnfsErrorCode } from '../../src/domain/errors.js';
import type { GitObjectFormat } from '../../src/execution/model.js';
import type { ProcessResult, ProcessSpec } from '../../src/runtime/process-runner.js';

const TREEHOUSE_SPECIFIER = '../../src/adapters/' + 'treehouse.js';
const COMMAND_SHAPE_HASH = 'sha256:f2077cfd037cbaefdcfc94385a0cfeb7e1647ef294ca8ceee3cd61a1b109dc84';
const VERSION = '2.1.1' as const;
const NODE_VERSION = 'v24.18.0';
const GIT_VERSION = '2.54.0';
const KERNEL = '6.18.33.2-microsoft-standard-WSL2';
const UBUNTU = '24.04';
const BASE_COMMIT_SHA = '1'.repeat(40);
const BASE_TREE_SHA = '2'.repeat(40);
const SOURCE_FINGERPRINT = `sha256:${'3'.repeat(64)}`;

interface ReadySourceIdentity {
  readonly fingerprint: string;
  readonly baseCommitSha: string;
  readonly baseTreeSha: string;
  readonly objectFormat: GitObjectFormat;
}

interface Boundary {
  readonly sourcePath: string;
  readonly canonicalCheckoutPath: string;
  readonly homePath: string;
  readonly xdgConfigHome: string;
  readonly poolRoot: string;
  readonly hooksPath: string;
  readonly readySource: ReadySourceIdentity;
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

interface SourceIntegrityObservation {
  readonly status: 'READY';
  readonly sourcePath: string;
  readonly fingerprint: string;
  readonly observation: GitRepositoryObservation;
}

interface SourceIntegrityInput {
  readonly sourcePath: string;
  readonly canonicalCheckoutPath: string;
  readonly baseCommitSha: string;
  readonly baseTreeSha: string;
  readonly gitObjectFormat: GitObjectFormat;
}

interface AdapterContract {
  status(input: Readonly<{ boundary: Boundary }>): Promise<readonly unknown[]>;
}

interface TreehouseModule {
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
    sourceIntegrity: {
      observeReadySource(input: SourceIntegrityInput): Promise<SourceIntegrityObservation>;
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
  readonly configPath: string;
  readonly treehouse: string;
  readonly git: string;
  readonly uname: string;
  readonly osRelease: string;
  readonly leasedPath: string;
  readonly executableHash: string;
}

class Runner {
  readonly calls: ProcessSpec[] = [];
  readonly overrides = new Map<string, ProcessResult>();

  constructor(readonly fixture: Fixture) {}

  readonly run = async (spec: ProcessSpec): Promise<ProcessResult> => {
    this.calls.push(spec);
    const override = this.overrides.get(commandKey(spec.executable, spec.args));
    if (override !== undefined) return override;

    if (spec.executable === this.fixture.treehouse) {
      switch (spec.args.join(' ')) {
        case '--version':
          return success(`${VERSION}\n`);
        case 'get --help':
          return success('Usage: treehouse get [--lease] [--json] [--lease-holder string]\n');
        case 'status --help':
          return success('Usage: treehouse status [--json]\n');
        case 'return --help':
          return success('Usage: treehouse return [--if-lease-id string] [--if-lease-holder string]\n');
        case 'status --json':
          return success(JSON.stringify([{
            name: 'slot-1',
            path: this.fixture.leasedPath,
            status: 'leased',
            lease_id: 'lease-123',
            lease_holder: 'mnfs-repo-lse001-g1',
            leased_at: '2026-08-05T06:00:00Z',
            processes: [],
          }]));
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
    assert.fail(`Unexpected process: ${spec.executable} ${spec.args.join(' ')}`);
  };
}

async function loadModule(): Promise<TreehouseModule> {
  return await import(TREEHOUSE_SPECIFIER) as TreehouseModule;
}

function commandKey(executable: string, args: readonly string[]): string {
  return [executable, ...args].join('\0');
}

function success(stdout: string | Buffer = '', stderr: string | Buffer = ''): ProcessResult {
  return {
    exitCode: 0,
    signal: null,
    stdout: Buffer.isBuffer(stdout) ? Buffer.from(stdout) : Buffer.from(stdout, 'utf8'),
    stderr: Buffer.isBuffer(stderr) ? Buffer.from(stderr) : Buffer.from(stderr, 'utf8'),
    timedOut: false,
  };
}

async function expectCode(code: MnfsErrorCode, operation: () => Promise<unknown>): Promise<void> {
  await assert.rejects(
    operation,
    (error: unknown) => error instanceof MnfsError && error.code === code,
  );
}

function canonicalTreehouseConfig(poolRoot: string): string {
  return `max_trees = 2\nroot = ${JSON.stringify(poolRoot)}\n`;
}

async function withFixture(operation: (fixture: Fixture) => Promise<void>): Promise<void> {
  const root = mkdtempSync(join(tmpdir(), 'mnfs-task9-correction-'));
  const sourcePath = join(root, 'runtime', 'execution-sources', 'WT-001', 'WT-001', 'A01', 'source');
  const canonicalPath = join(root, 'canonical');
  const homePath = join(root, 'runtime', 'treehouse', 'home');
  const xdgPath = join(homePath, '.config');
  const treehouseConfigDirectory = join(xdgPath, 'treehouse');
  const poolRoot = join(root, 'runtime', 'treehouse', 'pool');
  const hooksPath = join(root, 'runtime', 'treehouse', 'hooks');
  const leasedPath = join(poolRoot, 'slot-1', 'source');
  const bin = join(root, 'bin');
  for (const path of [
    sourcePath,
    canonicalPath,
    homePath,
    treehouseConfigDirectory,
    poolRoot,
    hooksPath,
    leasedPath,
    bin,
  ]) {
    mkdirSync(path, { recursive: true });
  }

  const bytes = Buffer.from('#!/bin/sh\nexit 0\n', 'utf8');
  const treehouse = join(bin, 'treehouse');
  const git = join(bin, 'git');
  const uname = join(bin, 'uname');
  const osRelease = join(root, 'os-release');
  for (const path of [treehouse, git, uname]) {
    writeFileSync(path, bytes);
    chmodSync(path, 0o755);
  }
  writeFileSync(osRelease, `ID=ubuntu\nVERSION_ID="${UBUNTU}"\n`);
  const configPath = join(treehouseConfigDirectory, 'config.toml');
  writeFileSync(configPath, canonicalTreehouseConfig(realpathSync(poolRoot)));

  const fixture: Fixture = {
    root,
    sourcePath: realpathSync(sourcePath),
    canonicalPath: realpathSync(canonicalPath),
    homePath: realpathSync(homePath),
    xdgPath: realpathSync(xdgPath),
    poolRoot: realpathSync(poolRoot),
    hooksPath: realpathSync(hooksPath),
    configPath: realpathSync(configPath),
    treehouse: realpathSync(treehouse),
    git: realpathSync(git),
    uname: realpathSync(uname),
    osRelease: realpathSync(osRelease),
    leasedPath: realpathSync(leasedPath),
    executableHash: `sha256:${createHash('sha256').update(bytes).digest('hex')}`,
  };

  try {
    await operation(fixture);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function repositoryObservation(
  fixture: Fixture,
  overrides: Partial<GitRepositoryObservation> = {},
): GitRepositoryObservation {
  return {
    repositoryPath: fixture.sourcePath,
    gitDirPath: join(fixture.sourcePath, '.git'),
    commonDirPath: join(fixture.sourcePath, '.git'),
    objectDirPath: join(fixture.sourcePath, '.git', 'objects'),
    objectFormat: 'sha1',
    headCommitSha: BASE_COMMIT_SHA,
    headTreeSha: BASE_TREE_SHA,
    statusPorcelainV1Z: Buffer.alloc(0),
    remotes: [],
    ...overrides,
  };
}

function boundary(fixture: Fixture): Boundary {
  return {
    sourcePath: fixture.sourcePath,
    canonicalCheckoutPath: fixture.canonicalPath,
    homePath: fixture.homePath,
    xdgConfigHome: fixture.xdgPath,
    poolRoot: fixture.poolRoot,
    hooksPath: fixture.hooksPath,
    readySource: {
      fingerprint: SOURCE_FINGERPRINT,
      baseCommitSha: BASE_COMMIT_SHA,
      baseTreeSha: BASE_TREE_SHA,
      objectFormat: 'sha1',
    },
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
  sourceObservation: SourceIntegrityObservation = {
    status: 'READY',
    sourcePath: fixture.sourcePath,
    fingerprint: SOURCE_FINGERPRINT,
    observation: repositoryObservation(fixture),
  },
): AdapterContract {
  return new module.TreehouseAdapter({
    acceptedCandidate: candidate(fixture),
    runProcess: runner.run,
    resolveExecutable: async (name) => ({
      treehouse: fixture.treehouse,
      git: fixture.git,
      uname: fixture.uname,
    })[name],
    hashFile: async () => fixture.executableHash,
    readTextFile: async (path) => readFileSync(path, 'utf8'),
    realpath: async (path) => realpathSync(path),
    nodeVersion: () => NODE_VERSION,
    osReleasePath: fixture.osRelease,
    environment: {
      PATH: `/untrusted:${dirname(fixture.treehouse)}:/mnt/c/Windows/System32`,
      HOME: '/home/operator',
    },
    gitInspector: {
      observeRepository: async () => repositoryObservation(fixture),
    },
    sourceIntegrity: {
      observeReadySource: async (input) => {
        assert.deepEqual(input, {
          sourcePath: fixture.sourcePath,
          canonicalCheckoutPath: fixture.canonicalPath,
          baseCommitSha: BASE_COMMIT_SHA,
          baseTreeSha: BASE_TREE_SHA,
          gitObjectFormat: 'sha1',
        });
        return sourceObservation;
      },
    },
  });
}

function protectedCalls(fixture: Fixture, calls: readonly ProcessSpec[]): ProcessSpec[] {
  return calls.filter((call) => call.executable === fixture.treehouse
    && call.args.join(' ') === 'status --json');
}

test('R9-01 accepts accepted multiline capabilities split across stdout and stderr', async () => {
  const module = await loadModule();
  await withFixture(async (fixture) => {
    const runner = new Runner(fixture);
    runner.overrides.set(commandKey(fixture.treehouse, ['get', '--help']), success(
      'Usage: treehouse get\nOptions:\n  --lease\n  --lease-holder string\n',
      '  --json\n',
    ));
    runner.overrides.set(commandKey(fixture.treehouse, ['status', '--help']), success(
      'Usage: treehouse status\n',
      'Options:\n  --json\n',
    ));
    runner.overrides.set(commandKey(fixture.treehouse, ['return', '--help']), success(
      'Usage: treehouse return\nOptions:\n  --if-lease-id string\n',
      '  --if-lease-holder string\n',
    ));

    const status = await createAdapter(module, fixture, runner).status({ boundary: boundary(fixture) });
    assert.equal(status.length, 1);
  });
});

test('R9-02 rejects a Treehouse user config whose pool differs from the accepted Attempt pool', async () => {
  const module = await loadModule();
  await withFixture(async (fixture) => {
    writeFileSync(fixture.configPath, canonicalTreehouseConfig(join(fixture.root, 'other-pool')));
    const runner = new Runner(fixture);
    await expectCode('TREEHOUSE_OBSERVATION_CONFLICT', async () => await createAdapter(
      module,
      fixture,
      runner,
    ).status({ boundary: boundary(fixture) }));
    assert.equal(protectedCalls(fixture, runner.calls).length, 0);
  });
});

test('R9-02 rejects unexpected Treehouse XDG configuration before protected work', async () => {
  const module = await loadModule();
  await withFixture(async (fixture) => {
    writeFileSync(join(fixture.xdgPath, 'untrusted.toml'), 'hook = "unexpected"\n');
    const runner = new Runner(fixture);
    await expectCode('TREEHOUSE_OBSERVATION_CONFLICT', async () => await createAdapter(
      module,
      fixture,
      runner,
    ).status({ boundary: boundary(fixture) }));
    assert.equal(protectedCalls(fixture, runner.calls).length, 0);
  });
});

test('R9-02 rejects non-empty Attempt-owned hooks before protected work', async () => {
  const module = await loadModule();
  await withFixture(async (fixture) => {
    const hook = join(fixture.hooksPath, 'post-create');
    writeFileSync(hook, '#!/bin/sh\nexit 0\n');
    chmodSync(hook, 0o700);
    const runner = new Runner(fixture);
    await expectCode('TREEHOUSE_OBSERVATION_CONFLICT', async () => await createAdapter(
      module,
      fixture,
      runner,
    ).status({ boundary: boundary(fixture) }));
    assert.equal(protectedCalls(fixture, runner.calls).length, 0);
  });
});

const sourceDriftCases: readonly Readonly<{
  name: string;
  observation: (fixture: Fixture) => SourceIntegrityObservation;
}>[] = [
  {
    name: 'fingerprint',
    observation: (fixture) => ({
      status: 'READY',
      sourcePath: fixture.sourcePath,
      fingerprint: `sha256:${'4'.repeat(64)}`,
      observation: repositoryObservation(fixture),
    }),
  },
  {
    name: 'base commit',
    observation: (fixture) => ({
      status: 'READY',
      sourcePath: fixture.sourcePath,
      fingerprint: SOURCE_FINGERPRINT,
      observation: repositoryObservation(fixture, { headCommitSha: '5'.repeat(40) }),
    }),
  },
  {
    name: 'base tree',
    observation: (fixture) => ({
      status: 'READY',
      sourcePath: fixture.sourcePath,
      fingerprint: SOURCE_FINGERPRINT,
      observation: repositoryObservation(fixture, { headTreeSha: '6'.repeat(40) }),
    }),
  },
  {
    name: 'object format',
    observation: (fixture) => ({
      status: 'READY',
      sourcePath: fixture.sourcePath,
      fingerprint: SOURCE_FINGERPRINT,
      observation: repositoryObservation(fixture, {
        objectFormat: 'sha256',
        headCommitSha: '7'.repeat(64),
        headTreeSha: '8'.repeat(64),
      }),
    }),
  },
];

for (const drift of sourceDriftCases) {
  test(`R9-03 rejects READY source ${drift.name} drift before protected work`, async () => {
    const module = await loadModule();
    await withFixture(async (fixture) => {
      const runner = new Runner(fixture);
      await expectCode('TREEHOUSE_OBSERVATION_CONFLICT', async () => await createAdapter(
        module,
        fixture,
        runner,
        drift.observation(fixture),
      ).status({ boundary: boundary(fixture) }));
      assert.equal(protectedCalls(fixture, runner.calls).length, 0);
    });
  });
}
