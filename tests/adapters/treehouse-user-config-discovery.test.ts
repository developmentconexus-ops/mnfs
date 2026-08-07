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
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import type { GitRepositoryObservation } from '../../src/adapters/git-worktree.js';
import {
  TREEHOUSE_COMMAND_SHAPE_SHA256,
  TreehouseAdapter,
  type TreehouseBoundary,
} from '../../src/adapters/treehouse.js';
import { resolveExecutionAttemptRuntimePaths } from '../../src/runtime/paths.js';
import type { ProcessResult, ProcessSpec } from '../../src/runtime/process-runner.js';

const VERSION = '2.1.1' as const;
const NODE_VERSION = 'v24.18.0';
const GIT_VERSION = '2.53.0';
const KERNEL = '6.18.33.2-microsoft-standard-WSL2';
const UBUNTU = '26.04';
const BASE_COMMIT_SHA = '1'.repeat(40);
const BASE_TREE_SHA = '2'.repeat(40);
const SOURCE_FINGERPRINT = `sha256:${'3'.repeat(64)}`;
const HOLDER = 'mnfs-a437a00afffe5994-lse001-g1';
const LEASE_ID = 'ce1292a113ae08fa8ff13f72410fe02e';
const LEASED_AT = '2026-08-06T00:06:50.024Z';

function success(stdout = ''): ProcessResult {
  return {
    exitCode: 0,
    signal: null,
    stdout: Buffer.from(stdout),
    stderr: Buffer.alloc(0),
    timedOut: false,
  };
}

function treehousePoolRootFromHome(homePath: string): string {
  const configPath = join(homePath, '.config', 'treehouse', 'config.toml');
  if (!existsSync(configPath)) return join(homePath, '.treehouse');

  const match = /^max_trees = 2\nroot = (.+)\n$/u.exec(readFileSync(configPath, 'utf8'));
  if (match === null || match[1] === undefined) {
    assert.fail('Treehouse user configuration has an unexpected shape.');
  }
  const configuredRoot: unknown = JSON.parse(match[1]);
  if (typeof configuredRoot !== 'string') {
    assert.fail('Treehouse user configuration root must be a string.');
  }
  return join(configuredRoot, '.treehouse');
}

function repositoryObservation(sourcePath: string): GitRepositoryObservation {
  return {
    repositoryPath: sourcePath,
    gitDirPath: join(sourcePath, '.git'),
    commonDirPath: join(sourcePath, '.git'),
    objectDirPath: join(sourcePath, '.git', 'objects'),
    objectFormat: 'sha1',
    headCommitSha: BASE_COMMIT_SHA,
    headTreeSha: BASE_TREE_SHA,
    statusPorcelainV1Z: Buffer.alloc(0),
    remotes: [],
  };
}

test('Treehouse 2.1.1 discovers the Attempt-owned pool through HOME/.config', async () => {
  const root = mkdtempSync(join(tmpdir(), 'mnfs-task14-a3-red-'));
  try {
    const runtimeRoot = join(root, 'runtime');
    const paths = resolveExecutionAttemptRuntimePaths(runtimeRoot, 'WT-001', 'WT-001/A01');
    const sourcePath = join(root, 'source');
    const canonicalCheckoutPath = join(root, 'canonical');
    const configDirectory = join(paths.xdgConfigHome, 'treehouse');
    const binDirectory = join(root, 'bin');

    for (const path of [
      sourcePath,
      join(sourcePath, '.git', 'objects'),
      canonicalCheckoutPath,
      paths.attemptRoot,
      paths.homePath,
      configDirectory,
      paths.poolRoot,
      paths.hooksPath,
      binDirectory,
    ]) {
      mkdirSync(path, { recursive: true });
    }

    writeFileSync(
      join(configDirectory, 'config.toml'),
      `max_trees = 2\nroot = ${JSON.stringify(realpathSync(paths.poolRoot))}\n`,
      { encoding: 'utf8', mode: 0o600 },
    );

    const executableBytes = Buffer.from('#!/bin/sh\nexit 0\n');
    const treehouseExecutable = join(binDirectory, 'treehouse');
    const gitExecutable = join(binDirectory, 'git');
    const unameExecutable = join(binDirectory, 'uname');
    for (const path of [treehouseExecutable, gitExecutable, unameExecutable]) {
      writeFileSync(path, executableBytes);
      chmodSync(path, 0o755);
    }
    const osReleasePath = join(root, 'os-release');
    writeFileSync(osReleasePath, `ID=ubuntu\nVERSION_ID="${UBUNTU}"\n`);

    const protectedCalls: ProcessSpec[] = [];
    const runProcess = async (spec: ProcessSpec): Promise<ProcessResult> => {
      if (spec.executable === treehouseExecutable) {
        switch (spec.args.join(' ')) {
          case '--version':
            return success(`v${VERSION}\n`);
          case 'get --help':
            return success('Usage: treehouse get [--lease] [--lease-holder string] [--json]\n');
          case 'status --help':
            return success('Usage: treehouse status [--json]\n');
          case 'return --help':
            return success('Usage: treehouse return [--if-lease-id string] [--if-lease-holder string]\n');
          case `get --lease --lease-holder ${HOLDER} --json`: {
            protectedCalls.push(spec);
            const homePath = spec.env.HOME;
            if (homePath === undefined) assert.fail('Treehouse HOME was not provided.');
            const leasedPath = join(
              treehousePoolRootFromHome(homePath),
              'source-8621f2',
              '1',
              'source',
            );
            mkdirSync(leasedPath, { recursive: true });
            return success(`${JSON.stringify({
              path: realpathSync(leasedPath),
              lease_id: LEASE_ID,
              lease_holder: HOLDER,
              leased_at: LEASED_AT,
            })}\n`);
          }
          default:
            assert.fail(`Unexpected Treehouse command: ${spec.args.join(' ')}`);
        }
      }
      if (spec.executable === gitExecutable && spec.args.join(' ') === '--version') {
        return success(`git version ${GIT_VERSION}\n`);
      }
      if (spec.executable === unameExecutable && spec.args.join(' ') === '-r') {
        return success(`${KERNEL}\n`);
      }
      assert.fail(`Unexpected process: ${spec.executable} ${spec.args.join(' ')}`);
    };

    const source = repositoryObservation(realpathSync(sourcePath));
    const executableHash = `sha256:${createHash('sha256').update(executableBytes).digest('hex')}`;
    const boundary: TreehouseBoundary = {
      sourcePath: source.repositoryPath,
      canonicalCheckoutPath: realpathSync(canonicalCheckoutPath),
      homePath: realpathSync(paths.homePath),
      xdgConfigHome: realpathSync(paths.xdgConfigHome),
      poolRoot: realpathSync(paths.poolRoot),
      hooksPath: realpathSync(paths.hooksPath),
      readySource: {
        fingerprint: SOURCE_FINGERPRINT,
        baseCommitSha: BASE_COMMIT_SHA,
        baseTreeSha: BASE_TREE_SHA,
        objectFormat: 'sha1',
      },
    };

    const adapter = new TreehouseAdapter({
      acceptedCandidate: {
        executableSha256: executableHash,
        semanticVersion: VERSION,
        commandShapeSha256: TREEHOUSE_COMMAND_SHAPE_SHA256,
        nodeVersion: NODE_VERSION,
        gitVersion: GIT_VERSION,
        kernelRelease: KERNEL,
        ubuntuRelease: UBUNTU,
      },
      runProcess,
      resolveExecutable: async (name) => ({
        treehouse: realpathSync(treehouseExecutable),
        git: realpathSync(gitExecutable),
        uname: realpathSync(unameExecutable),
      })[name],
      hashFile: async () => executableHash,
      readTextFile: async (path) => readFileSync(path, 'utf8'),
      realpath: async (path) => realpathSync(path),
      nodeVersion: () => NODE_VERSION,
      osReleasePath: realpathSync(osReleasePath),
      environment: {},
      gitInspector: {
        observeRepository: async () => source,
      },
      sourceIntegrity: {
        observeReadySource: async () => ({
          status: 'READY',
          sourcePath: source.repositoryPath,
          fingerprint: SOURCE_FINGERPRINT,
          observation: source,
        }),
      },
    });

    const acquired = await adapter.acquire({ boundary, holder: HOLDER });
    assert.equal(acquired.leaseId, LEASE_ID);
    assert.equal(acquired.path.startsWith(`${boundary.poolRoot}/`), true);
    assert.equal(protectedCalls.length, 1);
    const protectedCall = protectedCalls[0];
    if (protectedCall === undefined) {
      assert.fail('Treehouse protected acquisition was not observed.');
    }
    assert.equal(protectedCall.env.HOME, boundary.homePath);
    assert.equal(protectedCall.env.XDG_CONFIG_HOME, join(boundary.homePath, '.config'));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
