import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';

import {
  buildCheckpointInput,
  buildDependencySnapshot,
  buildInitialRunState,
  createObservationReader,
  mountSentinelPath,
} from '../src/orchestrator-runtime.mjs';
import { MISSING_RESOURCE_DIGEST } from '../src/scenario-runner.mjs';

const HASH = `sha256:${'a'.repeat(64)}`;

function preflight() {
  return {
    status: 'READY',
    environment: {
      distro: 'Ubuntu-24.04',
      uname: 'Linux host microsoft-standard-WSL2 x86_64',
      architecture: 'x86_64',
    },
    tools: {
      node: { version: 'v24.18.0' },
      npm: { version: '11.16.0' },
      pi: { version: 'pi 0.50.2' },
      treehouse: { version: 'treehouse 0.4.0' },
      bwrap: { version: 'bubblewrap 0.11.0' },
      socat: { version: 'socat 1.8.0.3' },
    },
  };
}

test('builds the exact dependency snapshot required by restart proof', () => {
  assert.deepEqual(buildDependencySnapshot(preflight()), {
    node: 'v24.18.0',
    npm: '11.16.0',
    pi: 'pi 0.50.2',
    treehouse: 'treehouse 0.4.0',
    sandboxRuntime: '0.0.67',
    bwrap: 'bubblewrap 0.11.0',
    socat: 'socat 1.8.0.3',
  });
});

test('observation reader returns digests or canonical missing without exposing content', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'mnfs-as02-observe-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const present = join(root, 'present.txt');
  const missing = join(root, 'missing.txt');
  await writeFile(present, 'MNFS_AS02_SENTINEL_DO_NOT_RETURN');

  const observe = createObservationReader({
    resources: { present, missing },
  });
  const result = await observe({ observedResources: ['present', 'missing'] });

  assert.match(result.present, /^sha256:[a-f0-9]{64}$/u);
  assert.equal(result.missing, MISSING_RESOURCE_DIGEST);
  assert.doesNotMatch(JSON.stringify(result), /MNFS_AS02_SENTINEL/u);
});

test('builds a strict recoverable initial run state before external execution', () => {
  const value = buildInitialRunState({
    runId: 'as02-20260803t020304z-a1b2c3',
    now: '2026-08-03T02:03:04.000Z',
    repositoryPath: '/home/user/src/mnfs',
    artifactRoot: '/home/user/.local/state/mnfs/artifacts/as-02/as02-20260803t020304z-a1b2c3',
    fixtureRoot: '/tmp/mnfs-as-02/as02-20260803t020304z-a1b2c3',
    preflight: preflight(),
  });

  assert.equal(value.status, 'PHASE_ONE_RUNNING');
  assert.equal(value.lease, null);
  assert.deepEqual(value.policies, {});
  assert.deepEqual(value.scenarios, []);
  assert.deepEqual(value.cleanup, { status: 'PENDING', attempts: 0 });
  assert.equal(value.checkpointPath, null);
  assert.equal(value.reportPath, null);
});

test('builds checkpoint input from stable scenario signatures only', () => {
  const scenarios = ['S1', 'S3', 'S5', 'S9', 'S11', 'S13'].map((scenarioId) => ({
    scenarioId,
    result: 'PASS',
    policyHash: HASH,
    observedFilesystem: {},
    rationale: 'passed',
  }));
  const value = buildCheckpointInput({
    runId: 'as02-20260803t020304z-a1b2c3',
    createdAt: '2026-08-03T02:03:04.000Z',
    checkpointPath: '/home/user/.local/state/mnfs/artifacts/as-02/run/restart-checkpoint.json',
    policyHash: HASH,
    dependencies: buildDependencySnapshot(preflight()),
    preflight: preflight(),
    fixtureManifestHash: HASH,
    scenarios,
  });

  assert.deepEqual(Object.keys(value.scenarioDigests), ['S1', 'S3', 'S5', 'S9', 'S11', 'S13']);
  for (const digest of Object.values(value.scenarioDigests)) assert.match(digest, /^sha256:[a-f0-9]{64}$/u);
  assert.equal(Object.hasOwn(value.scenarioDigests, 'S2'), false);
});

test('mount sentinel path is run-scoped and rejects unsafe run ids', async () => {
  assert.equal(
    mountSentinelPath('as02-20260803t020304z-a1b2c3'),
    '/mnt/c/mnfs-as-02/as02-20260803t020304z-a1b2c3/sentinel.txt',
  );
  assert.throws(
    () => mountSentinelPath('../escape'),
    (error) => error?.code === 'ORCHESTRATOR_PATH_INVALID',
  );
});
