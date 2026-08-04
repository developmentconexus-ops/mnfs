import assert from 'node:assert/strict';
import { mkdir, mkdtemp, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';

import {
  acquireTreehouseLease,
  buildTreehouseEnvironment,
  findStatusByPath,
  observeTreehouseStatus,
  returnTreehouseLease,
} from '../src/treehouse-client.mjs';

function processResult({ stdout = '', stderr = '', exitCode = 0, signal = null } = {}) {
  return {
    startedAt: '2026-08-04T03:00:00.000Z',
    finishedAt: '2026-08-04T03:00:00.010Z',
    durationMs: 10,
    exitCode,
    signal,
    stdout: Buffer.isBuffer(stdout) ? stdout : Buffer.from(stdout),
    stderr: Buffer.isBuffer(stderr) ? stderr : Buffer.from(stderr),
    timedOut: false,
  };
}

function scriptedRunner(results) {
  const calls = [];
  return {
    calls,
    run: async (spec) => {
      calls.push(spec);
      assert.ok(results.length > 0, 'unexpected process invocation');
      return results.shift();
    },
  };
}

async function clientFixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'mnfs-tc01-treehouse-client-'));
  t.after(() => rm(root, { recursive: true, force: true }));

  const sourceRepo = join(root, 'source-repo');
  const poolRoot = join(root, 'pool-root');
  const artifactsRoot = join(root, 'artifacts');
  const fakeHome = join(root, 'fake-home');
  const wrapperDir = join(root, 'git-wrapper');
  const treehouseDir = join(root, 'treehouse-bin');
  const realGitDir = join(root, 'real-git-bin');
  const leasedPath = join(poolRoot, 'tree-1', 'source-repo');

  await Promise.all([
    mkdir(sourceRepo, { recursive: true }),
    mkdir(artifactsRoot, { recursive: true }),
    mkdir(fakeHome, { recursive: true }),
    mkdir(wrapperDir, { recursive: true }),
    mkdir(treehouseDir, { recursive: true }),
    mkdir(realGitDir, { recursive: true }),
    mkdir(leasedPath, { recursive: true }),
  ]);

  const treehouseExecutable = join(treehouseDir, 'treehouse');
  const realGit = join(realGitDir, 'git');
  const wrapperGit = join(wrapperDir, 'git');
  const gitLog = join(artifactsRoot, 'git-invocations.jsonl');
  await Promise.all([
    writeFile(treehouseExecutable, 'treehouse-binary-fixture\n', 'utf8'),
    writeFile(realGit, 'git-binary-fixture\n', 'utf8'),
    writeFile(wrapperGit, 'git-wrapper-fixture\n', 'utf8'),
  ]);

  return {
    root,
    fixture: {
      runRoot: await realpath(root),
      sourceRepo: await realpath(sourceRepo),
      poolRoot: await realpath(poolRoot),
      artifactsRoot: await realpath(artifactsRoot),
      fakeHome: await realpath(fakeHome),
    },
    treehouseExecutable,
    realGit,
    gitWrapperDir: wrapperDir,
    gitLog,
    leasedPath: await realpath(leasedPath),
    holder: 'mnfs-tc01-holder',
    leaseId: 'lease-123',
    leasedAt: '2026-08-04T03:00:00Z',
  };
}

function baseInput(fixture, run) {
  return {
    fixture: fixture.fixture,
    treehouseExecutable: fixture.treehouseExecutable,
    realGit: fixture.realGit,
    gitWrapperDir: fixture.gitWrapperDir,
    gitLog: fixture.gitLog,
    run,
  };
}

test('builds the exact isolated Treehouse environment and command shapes', async (t) => {
  const fixture = await clientFixture(t);
  const acquisition = {
    path: fixture.leasedPath,
    lease_id: fixture.leaseId,
    lease_holder: fixture.holder,
    leased_at: fixture.leasedAt,
  };
  const status = [{
    name: 'tree-1',
    path: fixture.leasedPath,
    status: 'leased',
    lease_id: fixture.leaseId,
    lease_holder: fixture.holder,
    leased_at: fixture.leasedAt,
    processes: [],
  }];
  const runner = scriptedRunner([
    processResult({ stdout: `${JSON.stringify(acquisition)}\n` }),
    processResult({ stdout: `${JSON.stringify(status)}\n` }),
    processResult({ stderr: 'lease precondition failed\n', exitCode: 1 }),
  ]);

  const environment = buildTreehouseEnvironment(baseInput(fixture, runner.run));
  assert.deepEqual(environment, {
    PATH: `${fixture.gitWrapperDir}:${dirname(fixture.treehouseExecutable)}:${dirname(fixture.realGit)}:/usr/bin:/bin`,
    HOME: fixture.fixture.fakeHome,
    LANG: 'C.UTF-8',
    LC_ALL: 'C.UTF-8',
    GIT_TERMINAL_PROMPT: '0',
    GIT_OPTIONAL_LOCKS: '0',
    GIT_CONFIG_GLOBAL: '/dev/null',
    GIT_CONFIG_NOSYSTEM: '1',
    TREEHOUSE_NO_UPDATE_CHECK: '1',
    TC01_REAL_GIT: fixture.realGit,
    TC01_GIT_LOG: fixture.gitLog,
  });

  await acquireTreehouseLease({ ...baseInput(fixture, runner.run), holder: fixture.holder });
  await observeTreehouseStatus(baseInput(fixture, runner.run));
  const release = await returnTreehouseLease({
    ...baseInput(fixture, runner.run),
    path: fixture.leasedPath,
    leaseId: fixture.leaseId,
    holder: fixture.holder,
  });

  assert.equal(release.exitCode, 1, 'release classification belongs to later state observation');
  assert.deepEqual(runner.calls.map((call) => call.args), [
    ['get', '--lease', '--lease-holder', fixture.holder, '--json'],
    ['status', '--json'],
    ['return', fixture.leasedPath, '--if-lease-id', fixture.leaseId, '--if-lease-holder', fixture.holder],
  ]);
  for (const call of runner.calls) {
    assert.equal(call.file, fixture.treehouseExecutable);
    assert.equal(call.cwd, fixture.fixture.sourceRepo);
    assert.deepEqual(call.env, environment);
    assert.equal(call.timeoutMs, 30_000);
    assert.equal(call.stdoutLimitBytes, 65_536);
    assert.equal(call.stderrLimitBytes, 65_536);
  }
});

test('accepts exactly one strict acquisition object bound to the expected holder and realpath', async (t) => {
  const fixture = await clientFixture(t);
  const runner = scriptedRunner([processResult({ stdout: `  ${JSON.stringify({
    path: fixture.leasedPath,
    lease_id: fixture.leaseId,
    lease_holder: fixture.holder,
    leased_at: fixture.leasedAt,
  })}\n` })]);

  const lease = await acquireTreehouseLease({ ...baseInput(fixture, runner.run), holder: fixture.holder });
  assert.deepEqual(lease, {
    path: fixture.leasedPath,
    leaseId: fixture.leaseId,
    leaseHolder: fixture.holder,
    leasedAt: fixture.leasedAt,
  });
});

test('rejects contaminated, mismatched or non-zero acquisition output', async (t) => {
  const fixture = await clientFixture(t);
  const valid = {
    path: fixture.leasedPath,
    lease_id: fixture.leaseId,
    lease_holder: fixture.holder,
    leased_at: fixture.leasedAt,
  };

  for (const result of [
    processResult({ stdout: `${JSON.stringify(valid)}\ntrailing-banner\n` }),
    processResult({ stdout: JSON.stringify({ ...valid, lease_holder: 'other-holder' }) }),
    processResult({ stdout: JSON.stringify({ ...valid, unexpected: true }) }),
  ]) {
    const runner = scriptedRunner([result]);
    await assert.rejects(
      acquireTreehouseLease({ ...baseInput(fixture, runner.run), holder: fixture.holder }),
      (error) => error?.code === 'TC01_TREEHOUSE_INVALID_OUTPUT',
    );
  }

  const failed = scriptedRunner([processResult({ stderr: 'no worktree\n', exitCode: 2 })]);
  await assert.rejects(
    acquireTreehouseLease({ ...baseInput(fixture, failed.run), holder: fixture.holder }),
    (error) => error?.code === 'TC01_COMMAND_FAILED' && error?.details?.exitCode === 2,
  );
});

test('parses strict status arrays, rejects duplicate paths and finds by canonical path', async (t) => {
  const fixture = await clientFixture(t);
  const leased = {
    name: 'tree-1',
    path: fixture.leasedPath,
    status: 'leased',
    lease_id: fixture.leaseId,
    lease_holder: fixture.holder,
    leased_at: fixture.leasedAt,
    processes: [{ pid: 123, name: 'node' }],
  };
  const runner = scriptedRunner([processResult({ stdout: JSON.stringify([leased]) })]);
  const status = await observeTreehouseStatus(baseInput(fixture, runner.run));

  assert.deepEqual(status, [{
    name: 'tree-1',
    path: fixture.leasedPath,
    status: 'leased',
    leaseId: fixture.leaseId,
    leaseHolder: fixture.holder,
    leasedAt: fixture.leasedAt,
    processes: [{ pid: 123, name: 'node' }],
  }]);
  assert.deepEqual(findStatusByPath(status, fixture.leasedPath), status[0]);

  const duplicateRunner = scriptedRunner([processResult({ stdout: JSON.stringify([leased, { ...leased, name: 'tree-2' }]) })]);
  await assert.rejects(
    observeTreehouseStatus(baseInput(fixture, duplicateRunner.run)),
    (error) => error?.code === 'TC01_TREEHOUSE_INVALID_OUTPUT',
  );
});

test('rejects human status output and structurally inconsistent status items', async (t) => {
  const fixture = await clientFixture(t);
  const invalidOutputs = [
    'tree-1  leased  /tmp/worktree\n',
    JSON.stringify([{
      name: 'tree-1',
      path: fixture.leasedPath,
      status: 'available',
      lease_id: fixture.leaseId,
      lease_holder: fixture.holder,
      leased_at: fixture.leasedAt,
      processes: [],
    }]),
    JSON.stringify([{
      name: 'tree-1',
      path: fixture.leasedPath,
      status: 'leased',
      lease_id: fixture.leaseId,
      lease_holder: fixture.holder,
      leased_at: fixture.leasedAt,
      processes: [],
      extra: 'not allowed',
    }]),
  ];

  for (const stdout of invalidOutputs) {
    const runner = scriptedRunner([processResult({ stdout })]);
    await assert.rejects(
      observeTreehouseStatus(baseInput(fixture, runner.run)),
      (error) => error?.code === 'TC01_TREEHOUSE_INVALID_OUTPUT',
    );
  }
});

test('fails closed for newline-bearing values and mounted control paths', async (t) => {
  const fixture = await clientFixture(t);
  assert.throws(
    () => buildTreehouseEnvironment({ ...baseInput(fixture, async () => processResult()), gitLog: `${fixture.gitLog}\n` }),
    (error) => error?.code === 'TC01_INVALID_INPUT',
  );
  assert.throws(
    () => buildTreehouseEnvironment({
      ...baseInput(fixture, async () => processResult()),
      fixture: { ...fixture.fixture, fakeHome: '/mnt/c/tc01-home' },
    }),
    (error) => error?.code === 'TC01_LINUX_FILESYSTEM_REQUIRED',
  );

  const runner = scriptedRunner([]);
  await assert.rejects(
    acquireTreehouseLease({ ...baseInput(fixture, runner.run), holder: 'bad\nholder' }),
    (error) => error?.code === 'TC01_INVALID_INPUT',
  );
  assert.equal(runner.calls.length, 0);
});
