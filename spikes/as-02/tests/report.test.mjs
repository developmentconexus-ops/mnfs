import assert from 'node:assert/strict';
import test from 'node:test';

import { deriveDecision, renderReport } from '../src/report.mjs';

const HASH = `sha256:${'d'.repeat(64)}`;

function scenario(number, overrides = {}) {
  return {
    scenarioId: `S${number}`,
    startedAt: '2026-08-03T02:00:00.000Z',
    finishedAt: '2026-08-03T02:00:00.050Z',
    command: ['node', `s${number}.mjs`],
    cwd: '/tmp/mnfs-as-02/run/worktree',
    expected: number === 7 || number === 14 ? 'OBSERVE' : 'DENY',
    exitCode: 1,
    signal: null,
    stdoutRef: `commands/S${number}.stdout.bin`,
    stderrRef: `commands/S${number}.stderr.bin`,
    observedFilesystem: {},
    policyHash: HASH,
    result: 'PASS',
    rationale: `S${number} passed.`,
    ...overrides,
  };
}

function allPassing() {
  return Array.from({ length: 15 }, (_, index) => scenario(index + 1));
}

function input(overrides = {}) {
  return {
    scenarios: allPassing(),
    preflight: { status: 'READY' },
    restart: { status: 'PASS', drift: [] },
    performance: { measured: true, limitations: [] },
    limitations: [],
    modelRecommendation: 'REJECT',
    ...overrides,
  };
}

test('material bypasses and fail-open always produce REJECT', () => {
  const failures = [
    ['S2', 'FILESYSTEM_POLICY_BYPASS'],
    ['S3', 'FILESYSTEM_POLICY_BYPASS'],
    ['S5', 'NETWORK_POLICY_BYPASS'],
    ['S8', 'SOCKET_POLICY_BYPASS'],
    ['S9', 'POLICY_HASH_MISMATCH'],
    ['S11', 'CHILD_PROCESS_ESCAPE'],
    ['S13', 'FAIL_OPEN_DETECTED'],
  ];

  for (const [scenarioId, failureCode] of failures) {
    const scenarios = allPassing().map((entry) =>
      entry.scenarioId === scenarioId
        ? { ...entry, result: 'FAIL', failureCode, rationale: `${failureCode} observed.` }
        : entry,
    );
    const decision = deriveDecision(input({ scenarios }));
    assert.equal(decision.verdict, 'REJECT', `${failureCode} must reject E1`);
    assert.equal(decision.reasons.some((reason) => reason.includes(failureCode)), true);
  }
});

test('missing host primitives or incomplete required proof produce BLOCKED', () => {
  assert.equal(
    deriveDecision(input({ preflight: { status: 'BLOCKED_BY_HOST_POLICY' } })).verdict,
    'BLOCKED',
  );
  assert.equal(
    deriveDecision(input({ scenarios: allPassing().filter((entry) => entry.scenarioId !== 'S15') })).verdict,
    'BLOCKED',
  );
  assert.equal(
    deriveDecision(input({ restart: { status: 'PENDING', drift: [] } })).verdict,
    'BLOCKED',
  );
});

test('unsupported socket proof and explicit constraints cap the result at ACCEPT_WITH_LIMITATIONS', () => {
  const socketLimited = allPassing().map((entry) =>
    entry.scenarioId === 'S8'
      ? { ...entry, result: 'INCONCLUSIVE', failureCode: 'SOCKET_POLICY_UNSUPPORTED', rationale: 'Architecture unsupported.' }
      : entry,
  );
  const socketDecision = deriveDecision(input({ scenarios: socketLimited }));
  assert.equal(socketDecision.verdict, 'ACCEPT_WITH_LIMITATIONS');
  assert.equal(socketDecision.entryCriteria.some((entry) => entry.includes('socket')), true);

  const constrained = deriveDecision(input({ limitations: ['Pin Ubuntu 24.04 on x86_64.'] }));
  assert.equal(constrained.verdict, 'ACCEPT_WITH_LIMITATIONS');
  assert.deepEqual(constrained.entryCriteria, ['Pin Ubuntu 24.04 on x86_64.']);
});

test('all mandatory evidence passing yields ACCEPT and ignores model self-assessment', () => {
  const decision = deriveDecision(input({ modelRecommendation: 'REJECT' }));
  assert.deepEqual(decision, {
    verdict: 'ACCEPT',
    reasons: ['All required AS-02 evidence passed.'],
    entryCriteria: [],
  });
});

test('renders a deterministic numerically ordered report from computed evidence', () => {
  const scenarios = [scenario(10), scenario(2), scenario(1)];
  const decision = {
    verdict: 'ACCEPT_WITH_LIMITATIONS',
    reasons: ['Socket enforcement requires a supported architecture.'],
    entryCriteria: ['Run only on x86_64.'],
  };
  const first = renderReport({
    title: 'AS-02 result',
    environment: { distro: 'Ubuntu-24.04', node: '24.18.0' },
    policyHash: HASH,
    scenarios,
    decision,
  });
  const second = renderReport({
    title: 'AS-02 result',
    environment: { node: '24.18.0', distro: 'Ubuntu-24.04' },
    policyHash: HASH,
    scenarios,
    decision,
  });

  assert.equal(first, second);
  assert.equal(first.indexOf('| S1 |') < first.indexOf('| S2 |'), true);
  assert.equal(first.indexOf('| S2 |') < first.indexOf('| S10 |'), true);
  assert.match(first, /ACCEPT_WITH_LIMITATIONS/u);
  assert.match(first, /Run only on x86_64\./u);
});
