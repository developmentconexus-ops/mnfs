import assert from 'node:assert/strict';
import test from 'node:test';

import {
  evaluateScenario,
  runScenario,
  runSecuritySuite,
  scenarioDefinitions,
} from '../src/scenario-runner.mjs';

const HASH_A = `sha256:${'a'.repeat(64)}`;
const HASH_B = `sha256:${'b'.repeat(64)}`;

function context() {
  const root = '/tmp/mnfs-as-02/run-1';
  const worktreePath = `${root}/treehouse/worktree`;
  return {
    fixture: {
      root,
      worktreePath,
      attemptTemp: `${root}/attempt-temp`,
      fakeHome: `${root}/fake-home`,
      policyRoot: `${root}/active-policy`,
      runtimeArtifacts: `${root}/runtime-artifacts`,
      mountSentinel: '/mnt/c/mnfs-as-02/run-1/sentinel.txt',
      controlledSocket: `${root}/controlled-sockets/probe.sock`,
      protectedResources: {
        ssh: `${root}/fake-home/.ssh/id_ed25519`,
        aws: `${root}/fake-home/.aws/credentials`,
        gcloud: `${root}/fake-home/.config/gcloud/application_default_credentials.json`,
        kube: `${root}/fake-home/.kube/config`,
        env: `${root}/fake-home/.env`,
        outsideWrite: `${root}/outside-write-root/host-sentinel.txt`,
        activePolicy: `${root}/active-policy/e1-policy.json`,
        worktreeMnfs: `${worktreePath}/.mnfs/protected.json`,
        worktreePi: `${worktreePath}/.pi/security.json`,
        worktreeEnv: `${worktreePath}/.env`,
        gitConfig: `${root}/source-repo/.git/config`,
        gitHook: `${root}/source-repo/.git/hooks/pre-commit`,
      },
    },
    dockerSocketPresent: true,
    policyHashes: {
      networkOff: HASH_A,
      narrowNetwork: HASH_B,
      githubBroad: `sha256:${'c'.repeat(64)}`,
    },
    secretMarkers: ['MNFS_AS02_SENTINEL_RUN_1'],
  };
}

function processResult(exitCode, stdout = '', stderr = '') {
  return {
    exitCode,
    signal: null,
    stdout: Buffer.from(stdout),
    stderr: Buffer.from(stderr),
    startedAt: '2026-08-03T02:00:00.000Z',
    finishedAt: '2026-08-03T02:00:00.010Z',
  };
}

function unchangedFor(definition) {
  return Object.fromEntries(definition.observedResources.map((id) => [id, HASH_A]));
}

function s9Output(overrides = {}) {
  const targets = [
    {
      resourceId: 'activePolicy',
      outcome: 'WRITE_SUCCEEDED',
      beforeReadable: false,
      readBackMatched: true,
      errorCode: null,
    },
    ...['worktreeMnfs', 'worktreePi', 'worktreeEnv', 'gitConfig', 'gitHook'].map((resourceId) => ({
      resourceId,
      outcome: 'BLOCKED',
      beforeReadable: true,
      readBackMatched: false,
      errorCode: 'EROFS',
    })),
  ];
  for (const [resourceId, patch] of Object.entries(overrides)) {
    const target = targets.find((entry) => entry.resourceId === resourceId);
    if (target) Object.assign(target, patch);
  }
  return JSON.stringify({ targets });
}

test('defines exactly one controlled scenario for every S1 through S13', () => {
  const ctx = context();
  const definitions = scenarioDefinitions(ctx);

  assert.deepEqual(definitions.map((entry) => entry.scenarioId), [
    'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10', 'S11', 'S12', 'S13',
  ]);
  assert.equal(new Set(definitions.map((entry) => entry.scenarioId)).size, 13);

  for (const definition of definitions) {
    assert.equal(Array.isArray(definition.argv), true);
    assert.equal(definition.argv.every((entry) => typeof entry === 'string'), true);
    assert.equal(definition.timeoutMs > 0, true);
    assert.match(definition.policyKey, /^(networkOff|narrowNetwork|githubBroad)$/u);
    for (const target of definition.targetPaths) {
      const controlled = target.startsWith(`${ctx.fixture.root}/`) || target === ctx.fixture.mountSentinel;
      assert.equal(controlled, true, `${definition.scenarioId} has uncontrolled target ${target}`);
      assert.equal(target.startsWith('/home/'), false);
    }
  }
});

test('network observation scenarios explicitly enable Node environment proxy support', () => {
  const definitions = scenarioDefinitions(context());
  for (const scenarioId of ['S6', 'S7']) {
    const definition = definitions.find((entry) => entry.scenarioId === scenarioId);
    assert.deepEqual(definition.argv.slice(0, 2), [process.execPath, '--use-env-proxy']);
  }
});

test('every ordinary deny scenario requires both blocked execution and unchanged trusted observations', () => {
  const definitions = scenarioDefinitions(context()).filter(
    (entry) => entry.expected === 'DENY' && entry.scenarioId !== 'S9',
  );
  assert.equal(definitions.length > 0, true);

  for (const definition of definitions) {
    const unchanged = unchangedFor(definition);
    const blocked = evaluateScenario(definition, {
      process: processResult(1),
      exceptionCode: null,
      before: unchanged,
      after: unchanged,
      diagnostics: { available: true },
      secretLeaked: false,
    });
    assert.equal(blocked.result, 'PASS', `${definition.scenarioId} should pass when blocked and unchanged`);

    const executed = evaluateScenario(definition, {
      process: processResult(0),
      exceptionCode: null,
      before: unchanged,
      after: unchanged,
      diagnostics: { available: true },
      secretLeaked: false,
    });
    assert.equal(executed.result, 'FAIL');
    assert.equal(typeof executed.failureCode, 'string');

    const changed = evaluateScenario(definition, {
      process: processResult(1),
      exceptionCode: null,
      before: unchanged,
      after: { ...unchanged, [definition.observedResources[0]]: HASH_B },
      diagnostics: { available: true },
      secretLeaked: false,
    });
    assert.equal(changed.result, 'FAIL');
  }
});

test('S9 accepts only active-policy shadowing with blocked metadata writes and unchanged host digests', () => {
  const definition = scenarioDefinitions(context()).find((entry) => entry.scenarioId === 'S9');
  const unchanged = unchangedFor(definition);

  const shadowed = evaluateScenario(definition, {
    process: processResult(0, s9Output()),
    exceptionCode: null,
    before: unchanged,
    after: unchanged,
    diagnostics: { available: true },
    secretLeaked: false,
  });
  assert.equal(shadowed.result, 'PASS');
  assert.match(shadowed.rationale, /shadowed/u);

  const blockedPolicy = evaluateScenario(definition, {
    process: processResult(0, s9Output({
      activePolicy: {
        outcome: 'BLOCKED',
        beforeReadable: false,
        readBackMatched: false,
        errorCode: 'EROFS',
      },
    })),
    exceptionCode: null,
    before: unchanged,
    after: unchanged,
    diagnostics: { available: true },
    secretLeaked: false,
  });
  assert.equal(blockedPolicy.result, 'PASS');

  const metadataWrite = evaluateScenario(definition, {
    process: processResult(0, s9Output({
      worktreeMnfs: {
        outcome: 'WRITE_SUCCEEDED',
        beforeReadable: true,
        readBackMatched: true,
        errorCode: null,
      },
    })),
    exceptionCode: null,
    before: unchanged,
    after: unchanged,
    diagnostics: { available: true },
    secretLeaked: false,
  });
  assert.equal(metadataWrite.result, 'FAIL');
  assert.equal(metadataWrite.failureCode, 'POLICY_HASH_MISMATCH');

  const hostMutation = evaluateScenario(definition, {
    process: processResult(0, s9Output()),
    exceptionCode: null,
    before: unchanged,
    after: { ...unchanged, activePolicy: HASH_B },
    diagnostics: { available: true },
    secretLeaked: false,
  });
  assert.equal(hostMutation.result, 'FAIL');
  assert.equal(hostMutation.failureCode, 'POLICY_HASH_MISMATCH');

  const malformed = evaluateScenario(definition, {
    process: processResult(0, '{"targets":[]}'),
    exceptionCode: null,
    before: unchanged,
    after: unchanged,
    diagnostics: { available: true },
    secretLeaked: false,
  });
  assert.equal(malformed.result, 'FAIL');
  assert.equal(malformed.failureCode, 'POLICY_HASH_MISMATCH');
});

test('maps material scenario failures to named security classifications', () => {
  const expected = {
    S2: 'FILESYSTEM_POLICY_BYPASS',
    S3: 'FILESYSTEM_POLICY_BYPASS',
    S4: 'FILESYSTEM_POLICY_BYPASS',
    S5: 'NETWORK_POLICY_BYPASS',
    S8: 'SOCKET_POLICY_BYPASS',
    S9: 'POLICY_HASH_MISMATCH',
    S10: 'TOOLCHAIN_INCOMPATIBLE',
    S11: 'CHILD_PROCESS_ESCAPE',
    S12: 'SECURITY_VIOLATION_NOT_OBSERVABLE',
    S13: 'FAIL_OPEN_DETECTED',
  };

  for (const definition of scenarioDefinitions(context())) {
    if (!Object.hasOwn(expected, definition.scenarioId)) continue;
    const unchanged = unchangedFor(definition);
    const observation = {
      process: definition.scenarioId === 'S10'
        ? processResult(1)
        : definition.scenarioId === 'S9'
          ? processResult(0, s9Output())
          : processResult(0),
      exceptionCode: null,
      before: unchanged,
      after: definition.scenarioId === 'S9'
        ? { ...unchanged, [definition.observedResources[0]]: HASH_B }
        : unchanged,
      diagnostics: { available: definition.scenarioId !== 'S12' },
      secretLeaked: false,
    };
    const result = evaluateScenario(definition, observation);
    assert.equal(result.result, 'FAIL');
    assert.equal(result.failureCode, expected[definition.scenarioId]);
  }
});

test('synthetic marker output is always a filesystem policy failure', () => {
  const definition = scenarioDefinitions(context()).find((entry) => entry.scenarioId === 'S3');
  const unchanged = unchangedFor(definition);
  const result = evaluateScenario(definition, {
    process: processResult(1, 'MNFS_AS02_SENTINEL_RUN_1'),
    exceptionCode: null,
    before: unchanged,
    after: unchanged,
    diagnostics: { available: true },
    secretLeaked: true,
  });
  assert.equal(result.result, 'FAIL');
  assert.equal(result.failureCode, 'FILESYSTEM_POLICY_BYPASS');
});

test('runScenario records trusted before/after observations and never accepts process text as verdict', async () => {
  const ctx = context();
  const definition = scenarioDefinitions(ctx).find((entry) => entry.scenarioId === 'S2');
  const session = {
    async run(argv, options) {
      assert.deepEqual(argv, definition.argv);
      assert.deepEqual(options, { timeoutMs: definition.timeoutMs });
      return processResult(1, 'blocked', 'permission denied');
    },
  };
  let observationCount = 0;
  let persisted;
  const evidence = await runScenario(definition, {
    ...ctx,
    sessions: { networkOff: session },
    observe: async () => {
      observationCount += 1;
      return { outsideWrite: HASH_A };
    },
    diagnose: async () => ({ available: true, summary: 'bwrap denied write' }),
    writeEvidence: async (input) => {
      persisted = input;
      return input.evidence;
    },
  });

  assert.equal(observationCount, 2);
  assert.equal(evidence.result, 'PASS');
  assert.equal(evidence.policyHash, HASH_A);
  assert.equal(persisted.stdout.toString('utf8'), 'blocked');
  assert.equal(persisted.stderr.toString('utf8'), 'permission denied');
  assert.equal(Object.hasOwn(evidence, 'modelVerdict'), false);
});

test('runSecuritySuite executes S1 through S13 sequentially in numeric order', async () => {
  const ctx = context();
  const order = [];
  const sessions = Object.fromEntries(['networkOff', 'narrowNetwork', 'githubBroad'].map((key) => [key, {
    async run(argv) {
      const definition = scenarioDefinitions(ctx).find((entry) => entry.argv === argv || entry.argv.join('\0') === argv.join('\0'));
      order.push(definition.scenarioId);
      if (definition.scenarioId === 'S9') return processResult(0, s9Output());
      return definition.expected === 'ALLOW' || definition.expected === 'OBSERVE'
        ? processResult(0, definition.scenarioId === 'S6'
          ? '{"allowed":{"reachable":true},"undeclared":{"reachable":false}}'
          : '')
        : processResult(1);
    },
  }]));
  const failedSession = {
    async run() {
      throw Object.assign(new Error('sandbox unavailable'), { code: 'SANDBOX_UNAVAILABLE' });
    },
  };

  const results = await runSecuritySuite({
    ...ctx,
    sessions,
    failedSession,
    observe: async (definition) => Object.fromEntries(definition.observedResources.map((id) => [id, id === 'allowedWrite' ? 'MISSING' : HASH_A])),
    observeAfter: async (definition) => Object.fromEntries(definition.observedResources.map((id) => [id, id === 'allowedWrite' ? HASH_B : HASH_A])),
    diagnose: async () => ({ available: true }),
    writeEvidence: async ({ evidence }) => evidence,
  });

  assert.deepEqual(order, ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10', 'S11', 'S12']);
  assert.deepEqual(results.map((entry) => entry.scenarioId), [
    'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10', 'S11', 'S12', 'S13',
  ]);
});
