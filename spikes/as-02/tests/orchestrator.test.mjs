import assert from 'node:assert/strict';
import { mkdtemp, mkdir, realpath, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';

import {
  buildLeasedResources,
  createPolicySet,
  createProductionHandlers,
  createRunId,
  createSwitchingSessionController,
  resolveAs02ArtifactBase,
  scenarioSignature,
} from '../src/orchestrator.mjs';

const HASH_A = `sha256:${'a'.repeat(64)}`;
const HASH_B = `sha256:${'b'.repeat(64)}`;
const HASH_C = `sha256:${'c'.repeat(64)}`;

async function paths() {
  const root = await mkdtemp(join(tmpdir(), 'mnfs-as02-orchestrator-'));
  const lease = join(root, 'treehouse', 'leased');
  const common = join(root, 'treehouse', 'common');
  const gitDir = join(common, 'worktrees', 'leased');
  const hooks = join(common, 'hooks');
  const policyRoot = join(root, 'policy');
  const runtimeRoot = join(root, 'runtime');
  const fakeHome = join(root, 'fake-home');
  const attempt = join(root, 'attempt');
  const broker = join(root, 'trusted', 'broker.mjs');
  const trusted = join(root, 'trusted', 'runtime');
  for (const path of [lease, gitDir, hooks, policyRoot, runtimeRoot, fakeHome, attempt, join(broker, '..'), trusted]) {
    await mkdir(path, { recursive: true });
  }
  await mkdir(join(lease, '.mnfs'), { recursive: true });
  await mkdir(join(lease, '.pi'), { recursive: true });
  for (const path of [
    join(lease, '.mnfs', 'protected.json'),
    join(lease, '.pi', 'security.json'),
    join(lease, '.env'),
    join(lease, '.git'),
    join(common, 'config'),
    join(hooks, 'pre-commit'),
    join(gitDir, 'index'),
    broker,
  ]) await writeFile(path, path);
  return {
    root,
    lease: await realpath(lease),
    metadata: {
      commonDir: await realpath(common),
      gitDir: await realpath(gitDir),
      config: await realpath(join(common, 'config')),
      hooks: await realpath(hooks),
      index: await realpath(join(gitDir, 'index')),
    },
    policyRoot: await realpath(policyRoot),
    runtimeRoot: await realpath(runtimeRoot),
    fakeHome: await realpath(fakeHome),
    attempt: await realpath(attempt),
    broker: await realpath(broker),
    trusted: await realpath(trusted),
  };
}

test('creates safe deterministic run ids and artifact roots', () => {
  assert.equal(createRunId({ now: new Date('2026-08-03T02:03:04.000Z'), random: () => 'a1b2c3' }), 'as02-20260803t020304z-a1b2c3');
  assert.equal(resolveAs02ArtifactBase({ MNFS_HOME: '/home/user/.mnfs-state' }, '/home/user'), '/home/user/.mnfs-state/artifacts/as-02');
  assert.equal(resolveAs02ArtifactBase({}, '/home/user'), '/home/user/.local/state/mnfs/artifacts/as-02');
  assert.throws(
    () => resolveAs02ArtifactBase({ MNFS_HOME: 'relative' }, '/home/user'),
    (error) => error?.code === 'ORCHESTRATOR_PATH_INVALID',
  );
});

test('maps protected resources to the leased Treehouse worktree and Git common dir', async (t) => {
  const fixture = await paths();
  t.after(() => rm(fixture.root, { recursive: true, force: true }));
  const base = {
    ssh: `${fixture.root}/fake-home/.ssh/id_ed25519`,
    aws: `${fixture.root}/fake-home/.aws/credentials`,
    gcloud: `${fixture.root}/fake-home/.config/gcloud/adc.json`,
    kube: `${fixture.root}/fake-home/.kube/config`,
    env: `${fixture.root}/fake-home/.env`,
    outsideWrite: `${fixture.root}/outside/host-sentinel.txt`,
  };
  const activePolicy = `${fixture.policyRoot}/network-off.json`;
  await writeFile(activePolicy, '{}');

  const mapped = buildLeasedResources({
    leasedPath: fixture.lease,
    gitMetadata: fixture.metadata,
    baseResources: base,
    activePolicy,
  });

  assert.equal(mapped.worktreeMnfs, join(fixture.lease, '.mnfs', 'protected.json'));
  assert.equal(mapped.worktreePi, join(fixture.lease, '.pi', 'security.json'));
  assert.equal(mapped.worktreeEnv, join(fixture.lease, '.env'));
  assert.equal(mapped.worktreeGitPointer, join(fixture.lease, '.git'));
  assert.equal(mapped.gitConfig, fixture.metadata.config);
  assert.equal(mapped.gitHook, join(fixture.metadata.hooks, 'pre-commit'));
  assert.equal(mapped.activePolicy, activePolicy);
  assert.equal(mapped.ssh, base.ssh);

  assert.throws(
    () => buildLeasedResources({ leasedPath: '/mnt/c/unsafe', gitMetadata: fixture.metadata, baseResources: base, activePolicy }),
    (error) => error?.code === 'ORCHESTRATOR_PATH_INVALID',
  );
});

test('compiles three exact policies with shared trusted read carve-outs', async (t) => {
  const fixture = await paths();
  t.after(() => rm(fixture.root, { recursive: true, force: true }));
  const calls = [];
  const compilePolicy = (input) => {
    calls.push(input);
    const hash = [HASH_A, HASH_B, HASH_C][calls.length - 1];
    return { config: { network: input.network }, canonical: '{}', hash };
  };

  const set = createPolicySet({
    compilePolicy,
    common: {
      worktreePath: fixture.lease,
      attemptTempPath: fixture.attempt,
      brokerPath: fixture.broker,
      policyRoot: fixture.policyRoot,
      runtimeRoot: fixture.runtimeRoot,
      realHome: fixture.root,
      fakeHome: fixture.fakeHome,
      mountRoot: fixture.root,
      gitReadPaths: Object.values(fixture.metadata),
      gitDenyWritePaths: Object.values(fixture.metadata),
      trustedReadPaths: [fixture.trusted],
    },
  });

  assert.deepEqual(Object.keys(set), ['networkOff', 'narrowNetwork', 'githubBroad']);
  assert.deepEqual(calls.map((call) => call.network), [
    { allowedDomains: [], deniedDomains: [] },
    { allowedDomains: ['registry.npmjs.org'], deniedDomains: [] },
    { allowedDomains: ['github.com', '*.github.com'], deniedDomains: [] },
  ]);
  for (const call of calls) assert.deepEqual(call.trustedReadPaths, [fixture.trusted]);
  assert.deepEqual(Object.values(set).map((policy) => policy.hash), [HASH_A, HASH_B, HASH_C]);
});

test('serializes access to the singleton Sandbox Runtime while switching policies', async () => {
  const calls = [];
  const sessions = [];
  const controller = createSwitchingSessionController({
    policies: {
      networkOff: { hash: HASH_A },
      narrowNetwork: { hash: HASH_B },
    },
    createSession: async (key, policy) => {
      const session = {
        key,
        async initialize() { calls.push(`init:${key}:${policy.hash}`); },
        async run(argv) { calls.push(`run:${key}:${argv.join(' ')}`); return { key, argv }; },
        async close() { calls.push(`close:${key}`); },
      };
      sessions.push(session);
      return session;
    },
  });

  assert.deepEqual(await controller.session('networkOff').run(['one']), { key: 'networkOff', argv: ['one'] });
  assert.deepEqual(await controller.session('networkOff').run(['two']), { key: 'networkOff', argv: ['two'] });
  assert.deepEqual(await controller.session('narrowNetwork').run(['three']), { key: 'narrowNetwork', argv: ['three'] });
  assert.deepEqual(await controller.session('networkOff').run(['four']), { key: 'networkOff', argv: ['four'] });
  await controller.close();

  assert.deepEqual(calls, [
    `init:networkOff:${HASH_A}`,
    'run:networkOff:one',
    'run:networkOff:two',
    'close:networkOff',
    `init:narrowNetwork:${HASH_B}`,
    'run:narrowNetwork:three',
    'close:narrowNetwork',
    `init:networkOff:${HASH_A}`,
    'run:networkOff:four',
    'close:networkOff',
  ]);
  assert.equal(sessions.length, 3);
});

test('scenario signatures ignore timestamps but bind result, policy and trusted observations', () => {
  const base = {
    scenarioId: 'S3',
    startedAt: '2026-08-03T02:00:00.000Z',
    finishedAt: '2026-08-03T02:00:00.010Z',
    result: 'PASS',
    policyHash: HASH_A,
    observedFilesystem: { ssh: HASH_B },
    rationale: 'blocked',
  };
  assert.equal(
    scenarioSignature(base),
    scenarioSignature({ ...base, startedAt: '2026-08-03T03:00:00.000Z', finishedAt: '2026-08-03T03:00:00.010Z' }),
  );
  assert.notEqual(scenarioSignature(base), scenarioSignature({ ...base, result: 'FAIL' }));
  assert.notEqual(scenarioSignature(base), scenarioSignature({ ...base, observedFilesystem: { ssh: HASH_C } }));
});

test('production handlers block phase one unless preflight is READY and route lifecycle operations', async () => {
  const calls = [];
  let preflightStatus = 'BLOCKED_BY_HOST_POLICY';
  const handlers = await createProductionHandlers({
    operations: {
      async preflight() { calls.push('preflight'); return { status: preflightStatus }; },
      async phaseOne() { calls.push('phaseOne'); return { runId: 'run-1' }; },
      async latest() { calls.push('latest'); return { runId: 'run-1' }; },
      async restartPrepare(state) { calls.push(`restartPrepare:${state.runId}`); return { instructions: 'manual' }; },
      async restartResume(input) { calls.push(`restartResume:${input.checkpoint}`); return { status: 'PASS' }; },
      async report(input) { calls.push(`report:${input.runId}`); return { runId: input.runId }; },
      async cleanup(input) { calls.push(`cleanup:${input.runId}`); return { cleaned: true }; },
    },
  });

  assert.deepEqual(await handlers.run({}), { exitCode: 1, value: { status: 'BLOCKED_BY_HOST_POLICY' } });
  assert.deepEqual(calls, ['preflight']);

  preflightStatus = 'READY';
  assert.deepEqual(await handlers.run({}), { exitCode: 0, value: { runId: 'run-1' } });
  assert.deepEqual(await handlers.restartPrepare({}), { exitCode: 0, value: { instructions: 'manual' } });
  assert.deepEqual(await handlers.restartResume({ checkpoint: '/tmp/restart.json' }), { exitCode: 0, value: { status: 'PASS' } });
  assert.deepEqual(await handlers.report({ runId: 'run-2' }), { exitCode: 0, value: { runId: 'run-2' } });
  assert.deepEqual(await handlers.cleanup({ runId: 'run-2' }), { exitCode: 0, value: { cleaned: true } });
  assert.deepEqual(calls.slice(1), [
    'preflight',
    'phaseOne',
    'latest',
    'restartPrepare:run-1',
    'restartResume:/tmp/restart.json',
    'report:run-2',
    'cleanup:run-2',
  ]);
});
