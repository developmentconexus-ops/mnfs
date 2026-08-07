import assert from 'node:assert/strict';
import test from 'node:test';

import { canonicalJson } from '../src/canonical-json.mjs';
import {
  deriveTc01Verdict,
  renderTc01Report,
} from '../src/report.mjs';

const HASH_A = `sha256:${'a'.repeat(64)}`;
const HASH_B = `sha256:${'b'.repeat(64)}`;
const HASH_C = `sha256:${'c'.repeat(64)}`;
const HASH_D = `sha256:${'d'.repeat(64)}`;

const SCENARIO_IDS = Object.freeze(Array.from(
  { length: 15 },
  (_, index) => `TC01-S${String(index + 1).padStart(2, '0')}`,
));

const PROVENANCE = Object.freeze({
  schemaVersion: 1,
  environment: 'WSL2',
  ubuntuRelease: '24.04',
  kernelRelease: '6.6.87.2-microsoft-standard-WSL2',
  nodeVersion: 'v24.18.0',
  gitVersion: '2.54.0',
  treehouseVersion: '2.1.1',
  treehouseExecutable: '/usr/local/bin/treehouse',
  treehouseExecutableHash: HASH_A,
  capabilities: {
    leaseJson: true,
    statusJson: true,
    conditionalLeaseId: true,
    conditionalHolder: true,
  },
  capturedAt: '2026-08-04T12:00:00Z',
});

function scenario(scenarioId, overrides = {}) {
  return {
    scenarioId,
    result: 'PASS',
    rationale: `${scenarioId} satisfied its deterministic acceptance conditions.`,
    expected: `${scenarioId} expected behavior.`,
    observations: {},
    stdoutRef: `commands/${scenarioId}/main/stdout.bin`,
    stderrRef: `commands/${scenarioId}/main/stderr.bin`,
    stdoutHash: HASH_B,
    stderrHash: HASH_C,
    ...overrides,
  };
}

function scenarios(overrides = {}) {
  return SCENARIO_IDS.map((scenarioId) => scenario(scenarioId, overrides[scenarioId] ?? {}));
}

function reportInput(overrides = {}) {
  return {
    provenance: PROVENANCE,
    scenarios: scenarios(),
    scenariosHash: HASH_D,
    commandShapeHash: HASH_B,
    cleanup: {
      state: 'PRESERVED',
      rationale: 'Disposable fixture retained until trusted cleanup.',
    },
    ...overrides,
  };
}

function byId(records, scenarioId) {
  return records.find((record) => record.scenarioId === scenarioId);
}

test('all fifteen passing scenarios derive one exact ACCEPT verdict bound to provenance and hashes', () => {
  const result = deriveTc01Verdict(reportInput());

  assert.equal(result.schemaVersion, 1);
  assert.equal(result.verdict, 'ACCEPT');
  assert.equal(result.scenarioCount, 15);
  assert.deepEqual(result.scenarioIds, SCENARIO_IDS);
  assert.deepEqual(result.failures, []);
  assert.deepEqual(result.blocked, []);
  assert.deepEqual(result.limitations, []);
  assert.deepEqual(result.missingScenarioIds, []);
  assert.deepEqual(result.bindings, {
    treehouseExecutableHash: HASH_A,
    treehouseVersion: '2.1.1',
    gitVersion: '2.54.0',
    kernelRelease: '6.6.87.2-microsoft-standard-WSL2',
    ubuntuRelease: '24.04',
    commandShapeHash: HASH_B,
    scenariosHash: HASH_D,
  });
  assert.deepEqual(result.cleanup, {
    state: 'PRESERVED',
    rationale: 'Disposable fixture retained until trusted cleanup.',
  });
});

test('safe private-state normalization or explicit freshness drift derives ACCEPT_WITH_LIMITATIONS', () => {
  const records = scenarios({
    'TC01-S13': {
      observations: { limitation: 'TREEHOUSE_PRIVATE_STATE_NORMALIZATION' },
      rationale: 'Treehouse normalized private metadata without changing Lease or repository state.',
    },
    'TC01-S15': {
      result: 'BLOCKED',
      observations: { stale: true, changedFields: ['gitVersion'] },
      rationale: 'Prior acceptance cannot be reused after Git identity drift.',
    },
  });

  const result = deriveTc01Verdict(reportInput({ scenarios: records }));

  assert.equal(result.verdict, 'ACCEPT_WITH_LIMITATIONS');
  assert.deepEqual(result.limitations, [
    {
      scenarioId: 'TC01-S13',
      code: 'TREEHOUSE_PRIVATE_STATE_NORMALIZATION',
      rationale: records[12].rationale,
    },
    {
      scenarioId: 'TC01-S15',
      code: 'EVIDENCE_IDENTITY_DRIFT',
      changedFields: ['gitVersion'],
      rationale: records[14].rationale,
    },
  ]);
  assert.deepEqual(result.blocked, []);
});

test('a material safety failure derives REJECT even when tooling is also blocked', () => {
  const records = scenarios({
    'TC01-S01': {
      result: 'BLOCKED',
      rationale: 'Installed Treehouse version requires review.',
    },
    'TC01-S08': {
      result: 'FAIL',
      rationale: 'A stale external Lease ID released the current Lease.',
    },
  });

  const result = deriveTc01Verdict(reportInput({ scenarios: records }));

  assert.equal(result.verdict, 'REJECT');
  assert.deepEqual(result.failures.map((entry) => entry.scenarioId), ['TC01-S08']);
  assert.deepEqual(result.blocked.map((entry) => entry.scenarioId), ['TC01-S01']);
  assert.match(result.rationale, /material safety/i);
});

test('missing scenarios, S01 blocking and non-material incomplete proof derive BLOCKED', () => {
  const incomplete = scenarios().filter((record) => record.scenarioId !== 'TC01-S15');
  const missingResult = deriveTc01Verdict(reportInput({ scenarios: incomplete }));
  assert.equal(missingResult.verdict, 'BLOCKED');
  assert.deepEqual(missingResult.missingScenarioIds, ['TC01-S15']);

  const hostBlocked = scenarios({
    'TC01-S01': { result: 'BLOCKED', rationale: 'Canonical host lacks the reviewed binary.' },
  });
  assert.equal(deriveTc01Verdict(reportInput({ scenarios: hostBlocked })).verdict, 'BLOCKED');

  const incompleteProof = scenarios({
    'TC01-S11': { result: 'INCONCLUSIVE', rationale: 'Repeated-release observation is incomplete.' },
  });
  assert.equal(deriveTc01Verdict(reportInput({ scenarios: incompleteProof })).verdict, 'BLOCKED');
});

test('duplicate, unexpected or structurally invalid scenario Evidence fails closed', () => {
  const duplicate = scenarios();
  duplicate[14] = { ...duplicate[14], scenarioId: 'TC01-S14' };
  assert.throws(
    () => deriveTc01Verdict(reportInput({ scenarios: duplicate })),
    (error) => error?.code === 'TC01_EVIDENCE_INVALID' && /duplicate/i.test(error.message),
  );

  const unexpected = scenarios();
  unexpected[14] = { ...unexpected[14], scenarioId: 'TC01-S99' };
  assert.throws(
    () => deriveTc01Verdict(reportInput({ scenarios: unexpected })),
    (error) => error?.code === 'TC01_EVIDENCE_INVALID' && /unexpected/i.test(error.message),
  );

  const invalidResult = scenarios();
  invalidResult[0] = { ...invalidResult[0], result: 'SUCCESS' };
  assert.throws(
    () => deriveTc01Verdict(reportInput({ scenarios: invalidResult })),
    (error) => error?.code === 'TC01_EVIDENCE_INVALID' && /result/i.test(error.message),
  );
});

test('human report and machine verdict remain deterministic, ordered and secret-free', () => {
  const records = scenarios({
    'TC01-S03': {
      rationale: 'No hidden network | credential dependency\nwas observed.',
      observations: {
        secret: 'SECRET_VALUE_MUST_NOT_APPEAR',
        rawOutput: 'RAW_BINARY_OUTPUT_MUST_NOT_APPEAR',
      },
    },
    'TC01-S13': {
      observations: {
        limitation: 'TREEHOUSE_PRIVATE_STATE_NORMALIZATION',
        environment: { TOKEN: 'SECRET_VALUE_MUST_NOT_APPEAR' },
      },
      rationale: 'Private state normalization remained bounded.',
    },
  }).reverse();
  const input = reportInput({ scenarios: records });

  const firstVerdict = deriveTc01Verdict(input);
  const secondVerdict = deriveTc01Verdict({ ...input, scenarios: [...records].reverse() });
  assert.equal(canonicalJson(firstVerdict), canonicalJson(secondVerdict));

  const first = renderTc01Report(input);
  const second = renderTc01Report({ ...input, scenarios: [...records].reverse() });
  assert.equal(first, second);
  assert.match(first, /^# TC-01 Treehouse Conformance Report/m);
  assert.match(first, /Verdict: `ACCEPT_WITH_LIMITATIONS`/);
  assert.match(first, /Treehouse executable SHA-256/);
  assert.match(first, new RegExp(HASH_A));
  assert.match(first, new RegExp(HASH_D));
  assert.match(first, /TREEHOUSE_PRIVATE_STATE_NORMALIZATION/);
  assert.match(first, /commands\/TC01-S03\/main\/stdout\.bin/);
  assert.match(first, /Cleanup state: `PRESERVED`/);
  assert.match(first, /This Verdict is an R5 design input and does not authorize M01 implementation\./);
  assert.ok(first.indexOf('TC01-S01') < first.indexOf('TC01-S02'));
  assert.ok(first.indexOf('TC01-S02') < first.indexOf('TC01-S03'));
  assert.doesNotMatch(first, /SECRET_VALUE_MUST_NOT_APPEAR/);
  assert.doesNotMatch(first, /RAW_BINARY_OUTPUT_MUST_NOT_APPEAR/);
  assert.doesNotMatch(first, /<Buffer|Uint8Array/);
});
