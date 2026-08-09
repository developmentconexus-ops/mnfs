import assert from 'node:assert/strict';
import test from 'node:test';

import {
  APPLICABILITY_STATES,
  evaluateApplicability,
} from '../src/applicability.mjs';

function evidence({ piSdk = {}, piAcp = {}, openCode = {} } = {}) {
  return {
    piSdk: { finalized: true, verdict: 'PASS', ...piSdk },
    piAcp: { finalized: true, verdict: 'PASS', ...piAcp },
    openCode: { finalized: true, verdict: 'PASS', ...openCode },
  };
}

test('returns NOT_REQUIRED when exact conditional triggers are absent', () => {
  const result = evaluateApplicability(evidence({
    piSdk: { preference: 'rpc', score: 100 },
    piAcp: { observations: { maintenanceCost: 'higher' } },
    openCode: { observations: { materialAcpBoundaryAdvantage: false } },
  }));

  assert.deepEqual(result, { piRpc: 'NOT_REQUIRED', secondAcp: 'NOT_REQUIRED' });
});

test('requires PI-RPC only when Pi SDK fails solely for an out-of-process boundary', () => {
  const result = evaluateApplicability(evidence({
    piSdk: {
      verdict: 'FAIL',
      triggers: { failedSolelyBecauseOutOfProcessBoundaryRequired: true },
    },
  }));

  assert.equal(result.piRpc, 'REQUIRED');
  assert.equal(result.secondAcp, 'NOT_REQUIRED');
});

test('requires PI-RPC for Pi-ACP translation isolation failure or unresolved boundary ambiguity', () => {
  const translationFailure = evaluateApplicability(evidence({
    piAcp: {
      verdict: 'FAIL',
      triggers: { failedAndRequiresPiRpcIsolation: true },
    },
  }));
  const ambiguousBoundary = evaluateApplicability(evidence({
    piSdk: { observations: { sdkVsPiAcpProcessBoundaryAmbiguous: true } },
  }));

  assert.equal(translationFailure.piRpc, 'REQUIRED');
  assert.equal(ambiguousBoundary.piRpc, 'REQUIRED');
});

test('requires SECOND-ACP only for a material ACP boundary advantage without two passed ACP implementations', () => {
  const onePassed = evaluateApplicability(evidence({
    piAcp: { verdict: 'FAIL' },
    openCode: { observations: { materialAcpBoundaryAdvantage: true } },
  }));
  const twoPassed = evaluateApplicability(evidence({
    piAcp: { verdict: 'PASS' },
    openCode: { verdict: 'PASS', observations: { materialAcpBoundaryAdvantage: true } },
  }));
  const nonMaterial = evaluateApplicability(evidence({
    openCode: { observations: { materialAcpBoundaryAdvantage: false } },
  }));

  assert.equal(onePassed.secondAcp, 'REQUIRED');
  assert.equal(twoPassed.secondAcp, 'NOT_REQUIRED');
  assert.equal(nonMaterial.secondAcp, 'NOT_REQUIRED');
});

test('returns BLOCKED when conditional applicability lacks finalized deciding evidence', () => {
  const piRpcBlocked = evaluateApplicability(evidence({
    piSdk: { finalized: false },
  }));
  const secondAcpBlocked = evaluateApplicability(evidence({
    openCode: { finalized: false },
  }));
  const externalComparisonBlocked = evaluateApplicability(evidence({
    openCode: { verdict: 'BLOCKED' },
  }));

  assert.equal(piRpcBlocked.piRpc, 'BLOCKED');
  assert.equal(piRpcBlocked.secondAcp, 'NOT_REQUIRED');
  assert.equal(secondAcpBlocked.piRpc, 'NOT_REQUIRED');
  assert.equal(secondAcpBlocked.secondAcp, 'BLOCKED');
  assert.equal(externalComparisonBlocked.secondAcp, 'BLOCKED');
});

test('returns only the two independent applicability states and never a score or winner', () => {
  const result = evaluateApplicability(evidence());

  assert.deepEqual(Object.keys(result).sort(), ['piRpc', 'secondAcp']);
  assert.deepEqual(Object.values(result).every((value) => APPLICABILITY_STATES.includes(value)), true);
  assert.equal('score' in result, false);
  assert.equal('winner' in result, false);
  assert.equal('preference' in result, false);
});
