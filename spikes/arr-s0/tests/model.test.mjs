import assert from 'node:assert/strict';
import test from 'node:test';
import {
  RUN_PHASES,
  createInitialRunState,
  transitionRunState,
  validateRunState,
} from '../src/model.mjs';

const SOURCE = { commitSha: 'a'.repeat(40), treeSha: 'b'.repeat(40) };
const PLAN = { version: '0.2.0', hash: `sha256:${'c'.repeat(64)}` };
const CONTRACT = { version: '1.0.0', hash: `sha256:${'d'.repeat(64)}` };
const EXECUTION_AUTHORIZATION = {
  gate: 'GATE-S0-EXECUTE',
  planGitBlob: '3e78445fcbcca360f612edefd025c6cb0f84f8e5',
  baseCommitSha: SOURCE.commitSha,
  contractHash: CONTRACT.hash,
  verificationRunId: 31216915662,
  tokenHash: `sha256:${'e'.repeat(64)}`,
};

function initialArgs() {
  return {
    runId: 'arr-s0-20260807t120000000z-a1b2c3',
    source: SOURCE,
    plan: PLAN,
    contract: CONTRACT,
    executionAuthorization: EXECUTION_AUTHORIZATION,
  };
}

test('initial ARR-S0 state is CREATED, binds execution authority, and contains no raw token or Verdict phase', () => {
  assert.deepEqual(RUN_PHASES, ['CREATED', 'OBSERVING', 'OBSERVED', 'FINALIZED']);
  assert.equal(RUN_PHASES.includes('PASS'), false);
  const state = createInitialRunState(initialArgs());
  assert.equal(state.phase, 'CREATED');
  assert.equal(Object.hasOwn(state, 'verdict'), false);
  assert.deepEqual(state.executionAuthorization, EXECUTION_AUTHORIZATION);
  assert.equal(Object.hasOwn(state.executionAuthorization, 'operatorToken'), false);
  assert.deepEqual(validateRunState(state), []);
});

test('run-state transitions are monotonic and preserve exact execution authority', () => {
  const initial = createInitialRunState(initialArgs());
  const observing = transitionRunState(initial, 'OBSERVING');
  const observed = transitionRunState(observing, 'OBSERVED');
  const finalized = transitionRunState(observed, 'FINALIZED');
  assert.equal(finalized.phase, 'FINALIZED');
  assert.deepEqual(finalized.executionAuthorization, EXECUTION_AUTHORIZATION);
  assert.throws(() => transitionRunState(initial, 'OBSERVED'), /invalid ARR-S0 phase transition/u);
  assert.throws(() => transitionRunState(finalized, 'FINALIZED'), /invalid ARR-S0 phase transition/u);
});

test('strict run-state validator rejects malformed source, hashes and execution authority', () => {
  const state = createInitialRunState(initialArgs());
  const malformed = structuredClone(state);
  malformed.source.commitSha = 'not-a-sha';
  malformed.contract.hash = 'sha256:nope';
  malformed.executionAuthorization.planGitBlob = 'not-a-blob';
  malformed.executionAuthorization.baseCommitSha = 'b'.repeat(40);
  malformed.executionAuthorization.contractHash = `sha256:${'f'.repeat(64)}`;
  malformed.executionAuthorization.tokenHash = 'sha256:nope';
  malformed.executionAuthorization.verificationRunId = 0;
  const errors = validateRunState(malformed);
  assert.ok(errors.some((item) => item.includes('source.commitSha')));
  assert.ok(errors.some((item) => item.includes('contract.hash')));
  assert.ok(errors.some((item) => item.includes('executionAuthorization.planGitBlob')));
  assert.ok(errors.some((item) => item.includes('executionAuthorization.baseCommitSha')));
  assert.ok(errors.some((item) => item.includes('executionAuthorization.contractHash')));
  assert.ok(errors.some((item) => item.includes('executionAuthorization.tokenHash')));
  assert.ok(errors.some((item) => item.includes('executionAuthorization.verificationRunId')));
});

test('initial run state refuses missing or mismatched GATE-S0-EXECUTE authority', () => {
  const missing = initialArgs();
  delete missing.executionAuthorization;
  assert.throws(() => createInitialRunState(missing), /executionAuthorization/u);

  const wrongGate = initialArgs();
  wrongGate.executionAuthorization = { ...EXECUTION_AUTHORIZATION, gate: 'GATE-S0-IMPLEMENT' };
  assert.throws(() => createInitialRunState(wrongGate), /executionAuthorization/u);

  const wrongBase = initialArgs();
  wrongBase.executionAuthorization = { ...EXECUTION_AUTHORIZATION, baseCommitSha: 'b'.repeat(40) };
  assert.throws(() => createInitialRunState(wrongBase), /executionAuthorization/u);

  const wrongContract = initialArgs();
  wrongContract.executionAuthorization = { ...EXECUTION_AUTHORIZATION, contractHash: `sha256:${'f'.repeat(64)}` };
  assert.throws(() => createInitialRunState(wrongContract), /executionAuthorization/u);
});
