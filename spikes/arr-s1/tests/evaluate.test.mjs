import assert from 'node:assert/strict';
import test from 'node:test';
import { deriveCandidateVerdict } from '../src/evaluate.mjs';

const required = ['S1-C01', 'S1-C02'];

test('derives PASS only when every required criterion has PASS proof', () => {
  assert.deepEqual(
    deriveCandidateVerdict({
      requiredCriteria: required,
      criterionResults: [
        { id: 'S1-C01', status: 'PASS' },
        { id: 'S1-C02', status: 'PASS' },
      ],
    }),
    { verdict: 'PASS', reasons: [] },
  );
});

test('REJECT outranks FAIL, BLOCKED and PASS', () => {
  const result = deriveCandidateVerdict({
    requiredCriteria: required,
    criterionResults: [
      { id: 'S1-C01', status: 'FAIL' },
      { id: 'S1-C02', status: 'REJECT' },
    ],
  });
  assert.equal(result.verdict, 'REJECT');
});

test('any required FAIL derives FAIL when no rejection exists', () => {
  const result = deriveCandidateVerdict({
    requiredCriteria: required,
    criterionResults: [
      { id: 'S1-C01', status: 'FAIL' },
      { id: 'S1-C02', status: 'BLOCKED' },
    ],
  });
  assert.equal(result.verdict, 'FAIL');
});

test('missing or unavailable required proof derives BLOCKED and never an invented verdict', () => {
  assert.equal(
    deriveCandidateVerdict({
      requiredCriteria: required,
      criterionResults: [{ id: 'S1-C01', status: 'PASS' }],
    }).verdict,
    'BLOCKED',
  );
  assert.equal(
    deriveCandidateVerdict({
      requiredCriteria: required,
      criterionResults: [
        { id: 'S1-C01', status: 'PASS' },
        { id: 'S1-C02', status: 'UNKNOWN' },
      ],
    }).verdict,
    'BLOCKED',
  );
});

test('does not encode a score, winner or preference and ignores optional criteria for verdict precedence', () => {
  const result = deriveCandidateVerdict({
    requiredCriteria: required,
    criterionResults: [
      { id: 'S1-C01', status: 'PASS' },
      { id: 'S1-C02', status: 'PASS' },
      { id: 'S1-C99', status: 'FAIL', required: false },
    ],
  });
  assert.deepEqual(result, { verdict: 'PASS', reasons: [] });
  assert.equal(Object.hasOwn(result, 'score'), false);
  assert.equal(Object.hasOwn(result, 'winner'), false);
  assert.equal(Object.hasOwn(result, 'preference'), false);
});

test('treats the accepted S1 criteria as required when no custom list is provided', () => {
  assert.equal(deriveCandidateVerdict({ criterionResults: [] }).verdict, 'BLOCKED');
});
