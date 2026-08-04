import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { createFixture, loadFixture } from '../src/fixture.mjs';
import { resolveTc01RunRoot } from '../src/paths.mjs';
import { runProcess } from '../src/process-runner.mjs';

const RUN_ID = 'tc01-20260803-210600-a1b2c3d4';
const NOW = '2026-08-03T21:06:00.000Z';

function commandEnv(home) {
  return {
    HOME: home,
    PATH: process.env.PATH ?? '/usr/bin:/bin',
    GIT_CONFIG_NOSYSTEM: '1',
    GIT_TERMINAL_PROMPT: '0',
    GIT_AUTHOR_DATE: '2000-01-01T00:00:00Z',
    GIT_COMMITTER_DATE: '2000-01-01T00:00:00Z',
    LC_ALL: 'C',
  };
}

async function git(sourceRepo, fakeHome, args) {
  const result = await runProcess({
    file: 'git',
    args,
    cwd: sourceRepo,
    env: commandEnv(fakeHome),
    timeoutMs: 5_000,
  });
  assert.equal(result.exitCode, 0, `${args.join(' ')}: ${result.stderr.toString('utf8')}`);
  return result.stdout.toString('utf8').trim();
}

test('creates one isolated deterministic Git fixture with no origin', async (t) => {
  const stateRoot = await mkdtemp(join(tmpdir(), 'mnfs-tc01-fixture-'));
  t.after(() => rm(stateRoot, { recursive: true, force: true }));

  const calls = [];
  const loggedRun = async (spec) => {
    calls.push({ file: spec.file, args: [...spec.args], cwd: spec.cwd });
    return runProcess(spec);
  };

  const fixture = await createFixture({
    stateRoot,
    runId: RUN_ID,
    gitFile: 'git',
    pathEnv: process.env.PATH ?? '/usr/bin:/bin',
    run: loggedRun,
    now: () => NOW,
  });

  assert.equal(fixture.schemaVersion, 1);
  assert.equal(fixture.runId, RUN_ID);
  assert.equal(fixture.runRoot, resolveTc01RunRoot(stateRoot, RUN_ID));
  assert.equal(fixture.holder, `mnfs-tc01-${RUN_ID}`);
  assert.equal(fixture.createdAt, NOW);
  assert.match(fixture.initialCommit, /^[a-f0-9]{40}$/u);

  for (const path of [
    fixture.sourceRepo,
    fixture.poolRoot,
    fixture.artifactsRoot,
    fixture.snapshotsRoot,
    fixture.fakeHome,
    fixture.gitWrapperRoot,
  ]) {
    assert.equal((await stat(path)).isDirectory(), true, path);
  }

  assert.equal(await readFile(join(fixture.sourceRepo, 'README.md'), 'utf8'), 'TC-01 disposable fixture\n');
  assert.equal(await readFile(join(fixture.sourceRepo, 'fixture-sentinel.txt'), 'utf8'), 'tc01-fixture-sentinel\n');
  assert.equal(
    await readFile(join(fixture.sourceRepo, 'treehouse.toml'), 'utf8'),
    `max_trees = 2\nroot = "${fixture.poolRoot}"\n`,
  );

  assert.equal(await git(fixture.sourceRepo, fixture.fakeHome, ['rev-list', '--count', 'HEAD']), '1');
  assert.equal(await git(fixture.sourceRepo, fixture.fakeHome, ['remote']), '');
  assert.equal(await git(fixture.sourceRepo, fixture.fakeHome, ['status', '--porcelain=v1']), '');
  assert.equal(await git(fixture.sourceRepo, fixture.fakeHome, ['config', '--local', '--get', 'user.name']), 'MNFS-TC01');
  assert.equal(await git(fixture.sourceRepo, fixture.fakeHome, ['config', '--local', '--get', 'user.email']), 'tc01@mnfs.invalid');
  assert.equal(await git(fixture.sourceRepo, fixture.fakeHome, ['log', '-1', '--format=%s']), 'test: initialize TC-01 fixture');

  assert.equal(calls.filter((call) => call.args[0] === 'init').length, 1);
  assert.equal(calls.filter((call) => call.args[0] === 'commit').length, 1);

  const recovered = await loadFixture(fixture.runRoot);
  assert.deepEqual(recovered, fixture);
  assert.deepEqual(JSON.parse(await readFile(join(fixture.runRoot, 'fixture.json'), 'utf8')), fixture);
});

test('refuses an existing non-empty run root without deleting its content', async (t) => {
  const stateRoot = await mkdtemp(join(tmpdir(), 'mnfs-tc01-existing-'));
  t.after(() => rm(stateRoot, { recursive: true, force: true }));

  const runRoot = resolveTc01RunRoot(stateRoot, RUN_ID);
  await mkdir(runRoot, { recursive: true });
  const marker = join(runRoot, 'keep.txt');
  await writeFile(marker, 'preserve me\n', 'utf8');

  await assert.rejects(
    createFixture({
      stateRoot,
      runId: RUN_ID,
      gitFile: 'git',
      pathEnv: process.env.PATH ?? '/usr/bin:/bin',
      run: runProcess,
      now: () => NOW,
    }),
    (error) => error?.code === 'TC01_FIXTURE_INVALID',
  );

  assert.equal(await readFile(marker, 'utf8'), 'preserve me\n');
});
