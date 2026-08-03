import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';

import {
  resolveAs02ArtifactBase,
  resolveAs02FixtureBase,
} from '../src/orchestrator.mjs';
import { createRuntimeOperations } from '../src/orchestrator-runtime-durable.mjs';

function preflight() {
  return {
    status: 'READY',
    environment: {
      distro: 'Ubuntu',
      uname: 'Linux host microsoft-standard-WSL2 x86_64',
      architecture: 'x86_64',
    },
    primitives: { dockerSocket: 'NOT_PRESENT' },
    tools: {
      node: { version: 'v24.18.0' },
      npm: { version: '12.0.2' },
      pi: { version: '0.83.0' },
      treehouse: { version: 'v2.1.1' },
      bwrap: { version: 'bubblewrap 0.11.1' },
      socat: { version: 'socat 1.8.0.3' },
    },
  };
}

test('resolves separate durable artifact and fixture roots from one Linux state root', () => {
  const env = { MNFS_HOME: '/home/user/.mnfs-state' };
  const artifactBase = resolveAs02ArtifactBase(env, '/home/user');
  const fixtureBase = resolveAs02FixtureBase(env, '/home/user');
  assert.equal(artifactBase, '/home/user/.mnfs-state/artifacts/as-02');
  assert.equal(fixtureBase, '/home/user/.mnfs-state/fixtures/as-02');
  assert.notEqual(artifactBase, fixtureBase);
  assert.equal(artifactBase.includes('/fixtures/'), false);
  assert.equal(fixtureBase.includes('/artifacts/'), false);
  assert.equal(resolveAs02FixtureBase({}, '/home/user'), '/home/user/.local/state/mnfs/fixtures/as-02');
  assert.equal(fixtureBase.startsWith('/tmp/'), false);
});

test('phase one passes and persists the durable fixture root instead of /tmp', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'mnfs-as02-durable-root-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const repositoryPath = join(root, 'repository');
  const homeDirectory = join(root, 'home');
  const stateRoot = join(root, 'state');
  await Promise.all([
    mkdir(repositoryPath, { recursive: true }),
    mkdir(homeDirectory, { recursive: true }),
  ]);

  let observedBaseRoot = null;
  const operations = createRuntimeOperations({
    repositoryPath,
    homeDirectory,
    env: { MNFS_HOME: stateRoot, PATH: '/usr/bin:/bin' },
    now: () => '2026-08-03T13:20:00.000Z',
    random: () => 'abc123',
    createFixture: async ({ baseRoot, runId }) => {
      observedBaseRoot = baseRoot;
      const fixtureRoot = join(baseRoot, runId);
      const sourceRepo = join(fixtureRoot, 'source-repo');
      await mkdir(sourceRepo, { recursive: true });
      return {
        runId,
        baseRoot,
        root: fixtureRoot,
        sourceRepo,
        protectedResources: {},
        protectedDigests: {},
      };
    },
    acquireTreehouseLease: async () => {
      throw Object.assign(new Error('synthetic lease acquisition failure'), {
        code: 'TREEHOUSE_UNAVAILABLE',
      });
    },
    cleanupFixture: async () => ({ removed: true, integrity: 'PASS' }),
  });

  await assert.rejects(
    () => operations.phaseOne({ preflight: preflight() }),
    (error) => error?.code === 'TREEHOUSE_UNAVAILABLE',
  );

  const expectedBase = join(stateRoot, 'fixtures', 'as-02');
  const state = await operations.latest();
  assert.equal(observedBaseRoot, expectedBase);
  assert.equal(state.fixtureRoot, join(expectedBase, state.runId));
  assert.equal(state.lease.fixture.baseRoot, expectedBase);
  assert.equal(state.fixtureRoot.startsWith('/tmp/'), false);
});
