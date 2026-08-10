import assert from 'node:assert/strict';
import test from 'node:test';

import { S1_CRITERIA } from '../src/contract.mjs';
import { orchestrateS1 } from '../src/run.mjs';
import { parseCliArgs } from '../src/cli.mjs';

const COMPLETE_POLICY = Object.freeze({
  pinningRule: 'pin frozen candidate identity and package version',
  upgradeTrigger: 'a reviewed upstream release changes the supported public boundary',
  mandatoryConformanceRerun: 'rerun all S1-C01..C16 under the same contract before adoption',
  rollbackRule: 'restore the last passing frozen identity when rerun fails',
});

const COMPLETE_REMOVAL = Object.freeze({
  removeOrReplaceWhen: 'the candidate no longer satisfies the accepted runtime boundary',
  authorityOrSecurityTrigger: 'runtime authority or security behavior cannot remain bounded',
  provenanceOrLicenseTrigger: 'provenance or license can no longer be verified exactly',
  maintenanceTrigger: 'maintenance cost exceeds the named MNFS machinery it replaces',
  replacementOrExitPath: 'replace with another passing concrete adapter and rerun S1',
});

function candidate(shape, verdict = 'PASS', overrides = {}) {
  return {
    candidateShape: shape,
    finalized: true,
    verdict,
    criterionResults: S1_CRITERIA.map((id) => ({ id, status: 'PASS' })),
    evidenceIntegrity: { valid: true },
    upgradePolicy: { ...COMPLETE_POLICY },
    removalConditions: { ...COMPLETE_REMOVAL },
    boundary: {
      boundaryId: shape === 'PI-SDK' ? 'PI-SDK-SDK' : 'ACP',
      candidateShape: shape,
      finalized: true,
      verdict,
      criterionResults: S1_CRITERIA.map((id) => ({ id, status: 'PASS' })),
      evidenceIntegrity: { valid: true },
      upgradePolicy: { ...COMPLETE_POLICY },
      removalConditions: { ...COMPLETE_REMOVAL },
    },
    ...overrides,
  };
}

function executor(calls, shape, verdict = 'PASS', overrides = {}) {
  return async () => {
    calls.push(shape);
    return candidate(shape, verdict, overrides);
  };
}

function readyPreflight() {
  return {
    status: 'READY',
    operationAllowed: true,
    executionAuthorization: { gate: 'GATE-S1-EXECUTE' },
    source: { clean: true },
    stateRoot: { platform: 'linux' },
    blockers: [],
  };
}

test('orchestrates Pi SDK, Pi-ACP, Pi passing shape anchor, then finalized OpenCode before selection', async () => {
  const calls = [];
  const result = await orchestrateS1({
    runId: 'arr-s1-test-order',
    preflight: async () => readyPreflight(),
    choosePassingPiShape: ({ passingShapes }) => passingShapes.includes('PI-ACP') ? 'PI-ACP' : null,
    executors: {
      'PI-SDK': executor(calls, 'PI-SDK'),
      'PI-ACP': executor(calls, 'PI-ACP'),
      'OPENCODE-ACP': executor(calls, 'OPENCODE-ACP', 'FAIL', {
        criterionResults: S1_CRITERIA.map((id, index) => ({ id, status: index === 0 ? 'FAIL' : 'PASS' })),
      }),
    },
  });

  assert.deepEqual(calls, ['PI-SDK', 'PI-ACP', 'OPENCODE-ACP']);
  assert.equal(result.phases.piQualificationAnchor, 'PI-ACP');
  assert.equal(result.candidates.find((item) => item.candidateShape === 'OPENCODE-ACP').finalized, true);
  assert.equal(result.applicability.piRpc, 'NOT_REQUIRED');
  assert.equal(result.applicability.secondAcp, 'NOT_REQUIRED');
  assert.equal(result.report.externalComparisonFinalized, true);
  assert.equal(result.report.status, 'SUCCESS');
});

test('runs conditional Pi-RPC and SECOND-ACP only when applicability is REQUIRED', async () => {
  const calls = [];
  const result = await orchestrateS1({
    runId: 'arr-s1-test-conditional',
    preflight: async () => readyPreflight(),
    executors: {
      'PI-SDK': executor(calls, 'PI-SDK', 'PASS', { observations: { sdkVsPiAcpProcessBoundaryAmbiguous: true } }),
      'PI-ACP': executor(calls, 'PI-ACP', 'FAIL', {
        triggers: { failedAndRequiresPiRpcIsolation: true },
      }),
      'OPENCODE-ACP': executor(calls, 'OPENCODE-ACP', 'PASS', {
        observations: { materialAcpBoundaryAdvantage: true },
      }),
      'PI-RPC': executor(calls, 'PI-RPC', 'PASS'),
      'SECOND-ACP': executor(calls, 'SECOND-ACP', 'PASS'),
    },
  });

  assert.deepEqual(calls, ['PI-SDK', 'PI-ACP', 'OPENCODE-ACP', 'PI-RPC', 'SECOND-ACP']);
  assert.equal(result.applicability.piRpc, 'REQUIRED');
  assert.equal(result.applicability.secondAcp, 'REQUIRED');

  const notRequiredCalls = [];
  const notRequired = await orchestrateS1({
    runId: 'arr-s1-test-no-conditionals',
    preflight: async () => readyPreflight(),
    executors: {
      'PI-SDK': executor(notRequiredCalls, 'PI-SDK'),
      'PI-ACP': executor(notRequiredCalls, 'PI-ACP'),
      'OPENCODE-ACP': executor(notRequiredCalls, 'OPENCODE-ACP', 'FAIL'),
      'PI-RPC': executor(notRequiredCalls, 'PI-RPC'),
      'SECOND-ACP': executor(notRequiredCalls, 'SECOND-ACP'),
    },
  });
  assert.deepEqual(notRequiredCalls, ['PI-SDK', 'PI-ACP', 'OPENCODE-ACP']);
  assert.equal(notRequired.applicability.piRpc, 'NOT_REQUIRED');
  assert.equal(notRequired.applicability.secondAcp, 'NOT_REQUIRED');
});

test('OpenCode BLOCKED cannot produce selection-ready SUCCESS and no real executor is called by default', async () => {
  const calls = [];
  const blockedExternal = await orchestrateS1({
    runId: 'arr-s1-test-external-blocked',
    preflight: async () => readyPreflight(),
    executors: {
      'PI-SDK': executor(calls, 'PI-SDK'),
      'PI-ACP': executor(calls, 'PI-ACP'),
      'OPENCODE-ACP': executor(calls, 'OPENCODE-ACP', 'BLOCKED'),
    },
  });
  assert.equal(blockedExternal.report.status, 'BLOCKED');
  assert.equal(blockedExternal.report.runtimeDecisionInput.selectionEligible, false);
  assert.equal(blockedExternal.report.boundaryDecisionInput.selectionEligible, false);

  const deterministic = await orchestrateS1({
    runId: 'arr-s1-test-no-real-executors',
    preflight: async () => readyPreflight(),
  });
  assert.deepEqual(deterministic.executedCandidateShapes, []);
  assert.equal(deterministic.report.status, 'BLOCKED');
});

test('CLI freezes the three JSON machine forms and rejects mutating or ambiguous commands', () => {
  assert.deepEqual(parseCliArgs(['preflight', '--json']), { command: 'preflight', json: true });
  assert.deepEqual(parseCliArgs(['run', '--json']), { command: 'run', json: true });
  assert.deepEqual(parseCliArgs(['report', '--run-id', 'arr-s1-test-order', '--json']), {
    command: 'report',
    runId: 'arr-s1-test-order',
    json: true,
  });

  for (const argv of [
    ['preflight'],
    ['run', '--json', '--json'],
    ['run', '--json', 'install'],
    ['report', '--json'],
    ['report', '--run-id', '../escape', '--json'],
    ['install', '--json'],
  ]) {
    assert.throws(() => parseCliArgs(argv), /invalid ARR-S1 CLI/u, argv.join(' '));
  }
});
