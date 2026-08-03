import { createHash, randomUUID } from 'node:crypto';
import {
  access,
  mkdir,
  readFile,
  realpath,
  rm,
  writeFile,
} from 'node:fs/promises';
import { isAbsolute, join, relative, resolve } from 'node:path';

import { as02Error, assertAs02 } from './errors.mjs';
import { runProcess } from './process-runner.mjs';

const RUN_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;

function digest(buffer) {
  return `sha256:${createHash('sha256').update(buffer).digest('hex')}`;
}

function assertContained(base, candidate, label) {
  const relation = relative(base, candidate);
  assertAs02(
    relation === '' || (!relation.startsWith('..') && !isAbsolute(relation)),
    'FIXTURE_PATH_ESCAPE',
    `${label} escapes the fixture root.`,
    { base, candidate, label },
  );
}

async function checked(runner, spec, label) {
  const result = await runner(spec);
  if (result.exitCode !== 0) {
    throw as02Error('PROCESS_FAILED', `${label} failed.`, {
      file: spec.file,
      args: spec.args,
      exitCode: result.exitCode,
      signal: result.signal,
      stdout: result.stdout.toString('utf8').slice(0, 4_096),
      stderr: result.stderr.toString('utf8').slice(0, 4_096),
    });
  }
  return result;
}

async function writeSentinel(path, marker, logicalId) {
  await mkdir(join(path, '..'), { recursive: true });
  await writeFile(path, `${marker}:${logicalId}\n`, { mode: 0o600 });
  return path;
}

async function writeOfflineToolchainFixture(sourceRepo) {
  await mkdir(join(sourceRepo, 'src'), { recursive: true });
  await mkdir(join(sourceRepo, 'test'), { recursive: true });
  await writeFile(join(sourceRepo, 'package.json'), `${JSON.stringify({
    name: 'mnfs-as02-disposable-fixture',
    version: '0.0.0',
    private: true,
    type: 'module',
    scripts: {
      test: 'node --test test/*.test.mjs',
    },
  }, null, 2)}\n`);
  await writeFile(join(sourceRepo, 'tsconfig.json'), `${JSON.stringify({
    compilerOptions: {
      noEmit: true,
      strict: true,
      target: 'ES2022',
      module: 'NodeNext',
      moduleResolution: 'NodeNext',
    },
    include: ['src/**/*.ts'],
  }, null, 2)}\n`);
  await writeFile(join(sourceRepo, 'src', 'demo.ts'), [
    "export const message: string = 'AS-02 toolchain ready';",
    '',
  ].join('\n'));
  await writeFile(join(sourceRepo, 'test', 'demo.test.mjs'), [
    "import assert from 'node:assert/strict';",
    "import test from 'node:test';",
    '',
    "test('offline fixture executes under Node', () => {",
    "  assert.equal('AS-02'.startsWith('AS'), true);",
    '});',
    '',
  ].join('\n'));
}

function trustedEnv() {
  return {
    ...process.env,
    GIT_CONFIG_NOSYSTEM: '1',
    GIT_OPTIONAL_LOCKS: '0',
  };
}

async function gitOutput(worktree, args, runner) {
  const result = await checked(
    runner,
    {
      file: 'git',
      args,
      cwd: worktree,
      env: trustedEnv(),
      timeoutMs: 10_000,
    },
    `git ${args.join(' ')}`,
  );
  const output = result.stdout.toString('utf8').trim();
  assertAs02(output.length > 0 && !output.includes('\n'), 'GIT_METADATA_INVALID', 'Git metadata output must be one line.', {
    args,
    output,
  });
  const candidate = isAbsolute(output) ? output : resolve(worktree, output);
  try {
    return await realpath(candidate);
  } catch (cause) {
    throw as02Error('GIT_METADATA_INVALID', 'Git metadata path does not exist.', {
      args,
      candidate,
      cause: cause instanceof Error ? cause.message : String(cause),
    });
  }
}

export async function discoverGitMetadata(worktree, runner = runProcess) {
  const worktreePath = await realpath(worktree);
  const commonDir = await gitOutput(worktreePath, ['rev-parse', '--git-common-dir'], runner);
  const gitDir = await gitOutput(worktreePath, ['rev-parse', '--git-dir'], runner);
  const config = await gitOutput(worktreePath, ['rev-parse', '--git-path', 'config'], runner);
  const hooks = await gitOutput(worktreePath, ['rev-parse', '--git-path', 'hooks'], runner);
  const index = await gitOutput(worktreePath, ['rev-parse', '--git-path', 'index'], runner);

  assertContained(commonDir, config, 'git config');
  assertContained(commonDir, hooks, 'git hooks');
  assertContained(gitDir, index, 'git index');

  return { commonDir, gitDir, config, hooks, index };
}

export async function digestResources(resourcePaths) {
  assertAs02(resourcePaths && typeof resourcePaths === 'object', 'FIXTURE_PATH_ESCAPE', 'Resources must be an object.');
  const result = {};
  for (const logicalId of Object.keys(resourcePaths).sort()) {
    result[logicalId] = digest(await readFile(resourcePaths[logicalId]));
  }
  return result;
}

export async function createFixture({ baseRoot = '/tmp/mnfs-as-02', runId, runner = runProcess }) {
  assertAs02(typeof runId === 'string' && RUN_ID_PATTERN.test(runId), 'INVALID_RUN_ID', 'Run ID must use lowercase letters, numbers and single hyphens.', { runId });

  const base = await realpath(baseRoot);
  const root = join(base, runId);
  assertContained(base, root, 'fixture root');

  try {
    await mkdir(root, { recursive: false, mode: 0o700 });
  } catch (cause) {
    throw as02Error('FIXTURE_ALREADY_EXISTS', 'Fixture root already exists or cannot be created.', {
      root,
      cause: cause instanceof Error ? cause.message : String(cause),
    });
  }

  const marker = `MNFS_AS02_SENTINEL_${runId}_${randomUUID()}`;
  const sourceRepo = join(root, 'source-repo');
  const worktreeParent = join(root, 'treehouse');
  const worktreePath = join(worktreeParent, 'worktree');
  const fakeHome = join(root, 'fake-home');
  const outsideWriteRoot = join(root, 'outside-write-root');
  const policyRoot = join(root, 'active-policy');
  const runtimeArtifacts = join(root, 'runtime-artifacts');
  const attemptTemp = join(root, 'attempt-temp');

  try {
    for (const path of [sourceRepo, worktreeParent, fakeHome, outsideWriteRoot, policyRoot, runtimeArtifacts, attemptTemp]) {
      assertContained(root, path, 'fixture path');
      await mkdir(path, { recursive: true, mode: 0o700 });
    }

    await checked(runner, {
      file: 'git',
      args: ['init', '--initial-branch=main', sourceRepo],
      cwd: root,
      env: trustedEnv(),
      timeoutMs: 10_000,
    }, 'git init');
    await checked(runner, {
      file: 'git',
      args: ['-C', sourceRepo, 'config', 'user.email', 'as02@mnfs.invalid'],
      cwd: root,
      env: trustedEnv(),
      timeoutMs: 10_000,
    }, 'git config email');
    await checked(runner, {
      file: 'git',
      args: ['-C', sourceRepo, 'config', 'user.name', 'MNFS AS-02'],
      cwd: root,
      env: trustedEnv(),
      timeoutMs: 10_000,
    }, 'git config name');

    await writeFile(join(sourceRepo, 'README.md'), '# Disposable AS-02 repository\n');
    await writeSentinel(join(sourceRepo, '.mnfs', 'protected.json'), marker, 'worktree-mnfs');
    await writeSentinel(join(sourceRepo, '.pi', 'security.json'), marker, 'worktree-pi');
    await writeSentinel(join(sourceRepo, '.env'), marker, 'worktree-env');
    await writeFile(join(sourceRepo, 'fixture.txt'), 'allowed worktree file\n');
    await writeOfflineToolchainFixture(sourceRepo);

    await checked(runner, {
      file: 'git',
      args: ['-C', sourceRepo, 'add', '--all'],
      cwd: root,
      env: trustedEnv(),
      timeoutMs: 10_000,
    }, 'git add');
    await checked(runner, {
      file: 'git',
      args: ['-C', sourceRepo, 'commit', '-m', 'fixture: initialize AS-02 repository'],
      cwd: root,
      env: trustedEnv(),
      timeoutMs: 10_000,
    }, 'git commit');
    await checked(runner, {
      file: 'git',
      args: ['-C', sourceRepo, 'worktree', 'add', '-b', `as02-${runId}`, worktreePath],
      cwd: root,
      env: trustedEnv(),
      timeoutMs: 10_000,
    }, 'git worktree add');

    const gitHook = await writeSentinel(join(sourceRepo, '.git', 'hooks', 'pre-commit'), marker, 'git-hook');
    const protectedResources = {
      aws: await writeSentinel(join(fakeHome, '.aws', 'credentials'), marker, 'aws'),
      env: await writeSentinel(join(fakeHome, '.env'), marker, 'home-env'),
      gcloud: await writeSentinel(join(fakeHome, '.config', 'gcloud', 'application_default_credentials.json'), marker, 'gcloud'),
      kube: await writeSentinel(join(fakeHome, '.kube', 'config'), marker, 'kube'),
      ssh: await writeSentinel(join(fakeHome, '.ssh', 'id_ed25519'), marker, 'ssh'),
      outsideWrite: await writeSentinel(join(outsideWriteRoot, 'host-sentinel.txt'), marker, 'outside-write'),
      worktreeMnfs: join(worktreePath, '.mnfs', 'protected.json'),
      worktreePi: join(worktreePath, '.pi', 'security.json'),
      worktreeEnv: join(worktreePath, '.env'),
      worktreeGitPointer: join(worktreePath, '.git'),
      gitConfig: join(sourceRepo, '.git', 'config'),
      gitHook,
      activePolicy: await writeSentinel(join(policyRoot, 'e1-policy.json'), marker, 'active-policy'),
    };

    for (const path of Object.values(protectedResources)) {
      assertContained(root, path, 'protected resource');
      await access(path);
    }

    const protectedDigests = await digestResources(protectedResources);
    return {
      runId,
      baseRoot: base,
      root,
      sourceRepo: await realpath(sourceRepo),
      worktreePath: await realpath(worktreePath),
      fakeHome: await realpath(fakeHome),
      outsideWriteRoot: await realpath(outsideWriteRoot),
      policyRoot: await realpath(policyRoot),
      runtimeArtifacts: await realpath(runtimeArtifacts),
      attemptTemp: await realpath(attemptTemp),
      marker,
      protectedResources,
      protectedDigests,
    };
  } catch (error) {
    await rm(root, { recursive: true, force: true });
    throw error;
  }
}

export async function cleanupFixture(fixture) {
  assertAs02(fixture && typeof fixture === 'object', 'FIXTURE_PATH_ESCAPE', 'Fixture is required.');
  const base = await realpath(fixture.baseRoot);
  assertContained(base, fixture.root, 'fixture cleanup root');
  for (const path of Object.values(fixture.protectedResources ?? {})) assertContained(fixture.root, path, 'cleanup resource');

  const violations = [];
  try {
    for (const logicalId of Object.keys(fixture.protectedResources ?? {}).sort()) {
      const path = fixture.protectedResources[logicalId];
      try {
        const actual = digest(await readFile(path));
        if (actual !== fixture.protectedDigests[logicalId]) {
          violations.push({ logicalId, expected: fixture.protectedDigests[logicalId], actual });
        }
      } catch (cause) {
        violations.push({ logicalId, expected: fixture.protectedDigests[logicalId], actual: 'MISSING', cause: cause instanceof Error ? cause.message : String(cause) });
      }
    }
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }

  if (violations.length > 0) {
    throw as02Error('FIXTURE_INTEGRITY_VIOLATION', 'One or more protected fixture resources changed.', {
      violations,
    });
  }

  return { removed: true, integrity: 'PASS' };
}
