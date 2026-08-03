import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createRestartCheckpoint,
  verifyRestartCheckpoint,
} from '../src/restart.mjs';

const POLICY_HASH = `sha256:${'a'.repeat(64)}`;
const MANIFEST_HASH = `sha256:${'b'.repeat(64)}`;

function input(overrides = {}) {
  return {
    runId: 'run-1',
    createdAt: '2026-08-03T02:00:00.000Z',
    policyHash: POLICY_HASH,
    dependencies: {
      node: 'v24.18.0',
      npm: '11.16.0',
      pi: '0.50.2',
      piAnthropicAuth: '2.0.1',
      treehouse: '0.4.0',
      sandboxRuntime: '0.0.67',
      bwrap: '0.11.0',
      socat: '1.8.0.3',
    },
    wsl: {
      distro: 'Ubuntu-24.04',
      uname: 'Linux host microsoft-standard-WSL2 x86_64',
      architecture: 'x86_64',
    },
    fixtureManifestHash: MANIFEST_HASH,
    scenarioDigests: {
      S1: `sha256:${'1'.repeat(64)}`,
      S3: `sha256:${'3'.repeat(64)}`,
      S5: `sha256:${'5'.repeat(64)}`,
      S9: `sha256:${'9'.repeat(64)}`,
      S11: `sha256:${'b'.repeat(64)}`,
      S13: `sha256:${'d'.repeat(64)}`,
    },
    checkpointPath: '/tmp/mnfs-as-02/run-1/restart-checkpoint.json',
    ...overrides,
  };
}

test('creates a deterministic hash-bound restart checkpoint', async () => {
  const first = await createRestartCheckpoint(input());
  const second = await createRestartCheckpoint(input());

  assert.deepEqual(first, second);
  assert.equal(first.schemaVersion, 1);
  assert.equal(first.runId, 'run-1');
  assert.equal(first.policyHash, POLICY_HASH);
  assert.equal(first.dependencies.piAnthropicAuth, '2.0.1');
  assert.equal(first.fixtureManifestHash, MANIFEST_HASH);
  assert.deepEqual(Object.keys(first.scenarioDigests), ['S1', 'S3', 'S5', 'S9', 'S11', 'S13']);
  assert.match(first.checkpointHash, /^sha256:[a-f0-9]{64}$/u);
  assert.equal(Object.hasOwn(first, 'secret'), false);
});

test('verifies an unchanged process/WSL restart checkpoint', async () => {
  const checkpoint = await createRestartCheckpoint(input());
  const observation = await verifyRestartCheckpoint(checkpoint, input());

  assert.deepEqual(observation, {
    status: 'PASS',
    drift: [],
    checkpointHash: checkpoint.checkpointHash,
  });
});

test('detects policy, dependency, WSL, fixture and scenario drift mechanically', async () => {
  const checkpoint = await createRestartCheckpoint(input());
  const changed = input({
    policyHash: `sha256:${'f'.repeat(64)}`,
    dependencies: {
      ...input().dependencies,
      pi: '0.51.0',
      piAnthropicAuth: '2.0.2',
    },
    wsl: { ...input().wsl, uname: 'Linux changed-kernel x86_64' },
    fixtureManifestHash: `sha256:${'e'.repeat(64)}`,
    scenarioDigests: { ...input().scenarioDigests, S5: `sha256:${'e'.repeat(64)}` },
  });
  const observation = await verifyRestartCheckpoint(checkpoint, changed);

  assert.equal(observation.status, 'RESTART_DRIFT');
  assert.deepEqual(observation.drift.map((entry) => entry.field), [
    'policyHash',
    'dependencies.pi',
    'dependencies.piAnthropicAuth',
    'wsl.uname',
    'fixtureManifestHash',
    'scenarioDigests.S5',
  ]);
});

test('rejects tampered checkpoint content even when current state matches the tampered fields', async () => {
  const checkpoint = await createRestartCheckpoint(input());
  const tampered = { ...checkpoint, dependencies: { ...checkpoint.dependencies, pi: 'tampered' } };

  await assert.rejects(
    () => verifyRestartCheckpoint(tampered, input({ dependencies: tampered.dependencies })),
    (error) => error?.code === 'RESTART_CHECKPOINT_TAMPERED',
  );
});

test('rejects incomplete scenario digest sets, missing auth identity and relative checkpoint paths', async () => {
  await assert.rejects(
    () => createRestartCheckpoint(input({ scenarioDigests: { S1: `sha256:${'1'.repeat(64)}` } })),
    (error) => error?.code === 'RESTART_CHECKPOINT_INVALID',
  );
  const missingAuth = { ...input().dependencies };
  delete missingAuth.piAnthropicAuth;
  await assert.rejects(
    () => createRestartCheckpoint(input({ dependencies: missingAuth })),
    (error) => error?.code === 'RESTART_CHECKPOINT_INVALID',
  );
  await assert.rejects(
    () => createRestartCheckpoint(input({ checkpointPath: 'relative/checkpoint.json' })),
    (error) => error?.code === 'RESTART_CHECKPOINT_INVALID',
  );
});
