import { existsSync } from 'node:fs';
import { mkdir, readFile, readdir, rename, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { parseJsonBytesStrict } from './canonical-json.mjs';
import { assertTc01, tc01Error } from './errors.mjs';
import { assertLinuxOwnedAbsolutePath, resolveTc01RunRoot, validateRunId } from './paths.mjs';
import { runProcess } from './process-runner.mjs';

const FIXTURE_SCHEMA_VERSION = 1;
const GIT_TIMEOUT_MS = 5_000;

function gitEnv(fakeHome, pathEnv) {
  return {
    HOME: fakeHome,
    PATH: pathEnv,
    GIT_CONFIG_GLOBAL: '/dev/null',
    GIT_CONFIG_NOSYSTEM: '1',
    GIT_TERMINAL_PROMPT: '0',
    GIT_AUTHOR_DATE: '2000-01-01T00:00:00Z',
    GIT_COMMITTER_DATE: '2000-01-01T00:00:00Z',
    LC_ALL: 'C',
  };
}

async function invokeGit({ run, gitFile, args, cwd, env }) {
  const result = await run({
    file: gitFile,
    args,
    cwd,
    env,
    timeoutMs: GIT_TIMEOUT_MS,
  });

  if (result.exitCode !== 0) {
    throw tc01Error('TC01_COMMAND_FAILED', 'Git command failed while creating the TC-01 fixture.', {
      file: gitFile,
      args,
      cwd,
      exitCode: result.exitCode,
      signal: result.signal,
      stderr: result.stderr.toString('utf8'),
    });
  }
  return result.stdout.toString('utf8').trim();
}

async function writeJsonAtomic(path, value) {
  const temp = `${path}.${process.pid}.tmp`;
  await writeFile(temp, `${JSON.stringify(value, null, 2)}\n`, { encoding: 'utf8', flag: 'wx' });
  await rename(temp, path);
}

function validateFixtureShape(value, expectedRunRoot) {
  assertTc01(value && typeof value === 'object', 'TC01_FIXTURE_INVALID', 'Fixture metadata must be an object.');
  assertTc01(value.schemaVersion === FIXTURE_SCHEMA_VERSION, 'TC01_FIXTURE_INVALID', 'Unsupported fixture schema.', {
    schemaVersion: value.schemaVersion,
  });
  validateRunId(value.runId);
  assertTc01(value.runRoot === expectedRunRoot, 'TC01_FIXTURE_INVALID', 'Fixture run root does not match its location.', {
    expectedRunRoot,
    actualRunRoot: value.runRoot,
  });
  assertTc01(typeof value.initialCommit === 'string' && /^[a-f0-9]{40}$/u.test(value.initialCommit), 'TC01_FIXTURE_INVALID', 'Fixture commit identity is invalid.');
  assertTc01(value.holder === `mnfs-tc01-${value.runId}`, 'TC01_FIXTURE_INVALID', 'Fixture holder is invalid.');

  for (const key of ['sourceRepo', 'poolRoot', 'artifactsRoot', 'snapshotsRoot', 'fakeHome', 'gitWrapperRoot']) {
    const resolved = assertLinuxOwnedAbsolutePath(value[key], `fixture ${key}`);
    assertTc01(resolved === value[key], 'TC01_FIXTURE_INVALID', `Fixture ${key} is not canonical.`, {
      value: value[key],
      resolved,
    });
    assertTc01(
      value[key].startsWith(`${expectedRunRoot}/`),
      'TC01_FIXTURE_INVALID',
      `Fixture ${key} escaped the run root.`,
      { runRoot: expectedRunRoot, value: value[key] },
    );
  }
  return value;
}

export async function createFixture({
  stateRoot,
  runId,
  gitFile = 'git',
  pathEnv,
  run = runProcess,
  now = () => new Date().toISOString(),
}) {
  const safeRunId = validateRunId(runId);
  const safeStateRoot = assertLinuxOwnedAbsolutePath(stateRoot, 'TC-01 state root');
  const runRoot = resolveTc01RunRoot(safeStateRoot, safeRunId);

  assertTc01(typeof gitFile === 'string' && gitFile.length > 0, 'TC01_INVALID_INPUT', 'Git executable is required.');
  assertTc01(typeof pathEnv === 'string' && pathEnv.length > 0, 'TC01_INVALID_INPUT', 'A controlled PATH is required for fixture Git commands.');
  assertTc01(typeof run === 'function', 'TC01_INVALID_INPUT', 'A process runner is required.');

  if (existsSync(runRoot)) {
    const existing = await readdir(runRoot);
    assertTc01(existing.length === 0, 'TC01_FIXTURE_INVALID', 'TC-01 run root already contains data.', {
      runRoot,
      entries: existing.sort(),
    });
  } else {
    await mkdir(runRoot, { recursive: true });
  }

  const sourceRepo = join(runRoot, 'source-repo');
  const poolRoot = join(runRoot, 'pool-root');
  const artifactsRoot = join(runRoot, 'artifacts');
  const snapshotsRoot = join(runRoot, 'snapshots');
  const fakeHome = join(runRoot, 'fake-home');
  const gitWrapperRoot = join(runRoot, 'git-wrapper');

  await Promise.all([
    mkdir(sourceRepo, { recursive: false }),
    mkdir(poolRoot, { recursive: false }),
    mkdir(artifactsRoot, { recursive: false }),
    mkdir(snapshotsRoot, { recursive: false }),
    mkdir(fakeHome, { recursive: false }),
    mkdir(gitWrapperRoot, { recursive: false }),
  ]);

  await Promise.all([
    writeFile(join(sourceRepo, 'README.md'), 'TC-01 disposable fixture\n', 'utf8'),
    writeFile(join(sourceRepo, 'fixture-sentinel.txt'), 'tc01-fixture-sentinel\n', 'utf8'),
    writeFile(join(sourceRepo, 'treehouse.toml'), `max_trees = 2\nroot = ${JSON.stringify(poolRoot)}\n`, 'utf8'),
  ]);

  const env = gitEnv(fakeHome, pathEnv);
  await invokeGit({ run, gitFile, args: ['init', '--initial-branch=main'], cwd: sourceRepo, env });
  await invokeGit({ run, gitFile, args: ['config', '--local', 'user.name', 'MNFS-TC01'], cwd: sourceRepo, env });
  await invokeGit({ run, gitFile, args: ['config', '--local', 'user.email', 'tc01@mnfs.invalid'], cwd: sourceRepo, env });
  await invokeGit({
    run,
    gitFile,
    args: ['add', 'README.md', 'treehouse.toml', 'fixture-sentinel.txt'],
    cwd: sourceRepo,
    env,
  });
  await invokeGit({ run, gitFile, args: ['commit', '-m', 'test: initialize TC-01 fixture'], cwd: sourceRepo, env });

  const initialCommit = await invokeGit({ run, gitFile, args: ['rev-parse', 'HEAD'], cwd: sourceRepo, env });
  const remotes = await invokeGit({ run, gitFile, args: ['remote'], cwd: sourceRepo, env });
  const status = await invokeGit({ run, gitFile, args: ['status', '--porcelain=v1'], cwd: sourceRepo, env });

  assertTc01(remotes === '', 'TC01_FIXTURE_INVALID', 'Disposable fixture unexpectedly has a Git remote.', { remotes });
  assertTc01(status === '', 'TC01_FIXTURE_INVALID', 'Disposable fixture is not clean after initialization.', { status });

  const fixture = {
    schemaVersion: FIXTURE_SCHEMA_VERSION,
    runId: safeRunId,
    runRoot,
    sourceRepo,
    poolRoot,
    artifactsRoot,
    snapshotsRoot,
    fakeHome,
    gitWrapperRoot,
    holder: `mnfs-tc01-${safeRunId}`,
    initialCommit,
    createdAt: now(),
  };

  validateFixtureShape(fixture, runRoot);
  await writeJsonAtomic(join(runRoot, 'fixture.json'), fixture);
  return fixture;
}

export async function loadFixture(runRoot) {
  const safeRunRoot = assertLinuxOwnedAbsolutePath(runRoot, 'TC-01 run root');
  let value;
  try {
    value = parseJsonBytesStrict(
      await readFile(join(safeRunRoot, 'fixture.json')),
      'TC-01 fixture metadata',
      'TC01_FIXTURE_INVALID',
    );
  } catch (error) {
    if (error?.code === 'TC01_FIXTURE_INVALID') throw error;
    throw tc01Error('TC01_FIXTURE_INVALID', 'Unable to load TC-01 fixture metadata.', {
      runRoot: safeRunRoot,
      cause: error instanceof Error ? error.message : String(error),
    });
  }
  return validateFixtureShape(value, safeRunRoot);
}
