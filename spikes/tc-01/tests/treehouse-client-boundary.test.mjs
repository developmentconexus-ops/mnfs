import assert from 'node:assert/strict';
import { mkdir, mkdtemp, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import {
  acquireTreehouseLease,
  buildTreehouseEnvironment,
  observeTreehouseStatus,
  returnTreehouseLease,
} from '../src/treehouse-client.mjs';

function processResult(stdout = '') {
  return {
    startedAt: '2026-08-04T12:00:00.000Z',
    finishedAt: '2026-08-04T12:00:00.001Z',
    durationMs: 1,
    exitCode: 0,
    signal: null,
    stdout: Buffer.from(stdout),
    stderr: Buffer.alloc(0),
    timedOut: false,
  };
}

async function boundaryFixture(t) {
  const base = await mkdtemp(join(tmpdir(), 'mnfs-tc01-client-boundary-'));
  t.after(() => rm(base, { recursive: true, force: true }));
  const runRoot = join(base, 'run');
  const outsideRoot = join(base, 'outside');
  const sourceRepo = join(runRoot, 'source-repo');
  const poolRoot = join(runRoot, 'pool-root');
  const artifactsRoot = join(runRoot, 'artifacts');
  const fakeHome = join(runRoot, 'fake-home');
  const gitWrapperDir = join(runRoot, 'git-wrapper');
  const treehouseDir = join(runRoot, 'treehouse-bin');
  const gitDir = join(runRoot, 'git-bin');
  const leasedPath = join(poolRoot, 'slot-1', 'source-repo');
  const outsidePath = join(outsideRoot, 'worktree');
  await Promise.all([
    mkdir(sourceRepo, { recursive: true }),
    mkdir(artifactsRoot, { recursive: true }),
    mkdir(fakeHome, { recursive: true }),
    mkdir(gitWrapperDir, { recursive: true }),
    mkdir(treehouseDir, { recursive: true }),
    mkdir(gitDir, { recursive: true }),
    mkdir(leasedPath, { recursive: true }),
    mkdir(outsidePath, { recursive: true }),
  ]);
  const treehouseExecutable = join(treehouseDir, 'treehouse');
  const realGit = join(gitDir, 'git');
  await Promise.all([
    writeFile(treehouseExecutable, 'treehouse\n'),
    writeFile(realGit, 'git\n'),
    writeFile(join(gitWrapperDir, 'git'), 'wrapper\n'),
  ]);
  return {
    fixture: {
      runRoot: await realpath(runRoot),
      sourceRepo: await realpath(sourceRepo),
      poolRoot: await realpath(poolRoot),
      artifactsRoot: await realpath(artifactsRoot),
      fakeHome: await realpath(fakeHome),
    },
    gitWrapperDir: await realpath(gitWrapperDir),
    treehouseExecutable: await realpath(treehouseExecutable),
    realGit: await realpath(realGit),
    gitLog: join(await realpath(artifactsRoot), 'git-invocations.jsonl'),
    leasedPath: await realpath(leasedPath),
    outsidePath: await realpath(outsidePath),
  };
}

function baseInput(value, run) {
  return {
    fixture: value.fixture,
    gitWrapperDir: value.gitWrapperDir,
    treehouseExecutable: value.treehouseExecutable,
    realGit: value.realGit,
    gitLog: value.gitLog,
    run,
  };
}

test('Treehouse control files and return targets remain inside the disposable run', async (t) => {
  const fixture = await boundaryFixture(t);
  const outsideLog = join(fixture.outsidePath, 'git-log.jsonl');

  assert.throws(
    () => buildTreehouseEnvironment({ ...baseInput(fixture, async () => processResult()), gitLog: outsideLog }),
    (error) => error?.code === 'TC01_INVALID_INPUT' && /contain|artifact|run root/iu.test(error.message),
  );

  let calls = 0;
  await assert.rejects(
    returnTreehouseLease({
      ...baseInput(fixture, async () => {
        calls += 1;
        return processResult();
      }),
      path: fixture.outsidePath,
      leaseId: 'lease-1',
      holder: 'holder-1',
    }),
    (error) => error?.code === 'TC01_INVALID_INPUT' && /contain|run root/iu.test(error.message),
  );
  assert.equal(calls, 0);
});

test('acquisition and status reject canonical worktree paths outside the configured pool', async (t) => {
  const fixture = await boundaryFixture(t);
  const acquisition = JSON.stringify({
    path: fixture.outsidePath,
    lease_id: 'lease-1',
    lease_holder: 'holder-1',
    leased_at: '2026-08-04T12:00:00Z',
  });
  await assert.rejects(
    acquireTreehouseLease({
      ...baseInput(fixture, async () => processResult(acquisition)),
      holder: 'holder-1',
    }),
    (error) => error?.code === 'TC01_TREEHOUSE_INVALID_OUTPUT' && /pool/iu.test(error.message),
  );

  const status = JSON.stringify([{
    name: 'slot-1',
    path: fixture.outsidePath,
    status: 'leased',
    lease_id: 'lease-1',
    lease_holder: 'holder-1',
    leased_at: '2026-08-04T12:00:00Z',
    processes: [],
  }]);
  await assert.rejects(
    observeTreehouseStatus(baseInput(fixture, async () => processResult(status))),
    (error) => error?.code === 'TC01_TREEHOUSE_INVALID_OUTPUT' && /pool/iu.test(error.message),
  );
});
