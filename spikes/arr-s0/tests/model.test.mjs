import assert from 'node:assert/strict';
import test from 'node:test';
import {
  RUN_PHASES,
  createInitialRunState,
  transitionRunState,
  validateRunState,
} from '../src/model.mjs';

test('initial ARR-S0 state is CREATED and contains no Verdict phase', () => {
  assert.deepEqual(RUN_PHASES, ['CREATED', 'OBSERVING', 'OBSERVED', 'FINALIZED']);
  assert.equal(RUN_PHASES.includes('PASS'), false);
  const state = createInitialRunState({
    runId: 'arr-s0-20260807t120000000z-a1b2c3',
    source: { commitSha: 'a'.repeat(40), treeSha: 'b'.repeat(40) },
    plan: { version: '0.2.0', hash: `sha256:${'c'.repeat(64)}` },
    contract: { version: '0.1.0', hash: `sha256:${'d'.repeat(64)}` },
  });
  assert.equal(state.phase, 'CREATED');
  assert.equal(Object.hasOwn(state, 'verdict'), false);
  assert.deepEqual(validateRunState(state), []);
});

test('run-state transitions are monotonic and exact', () => {
  const initial = createInitialRunState({
    runId: 'arr-s0-20260807t120000000z-a1b2c3',
    source: { commitSha: 'a'.repeat(40), treeSha: 'b'.repeat(40) },
    plan: { version: '0.2.0', hash: `sha256:${'c'.repeat(64)}` },
    contract: { version: '0.1.0', hash: `sha256:${'d'.repeat(64)}` },
  });
  const observing = transitionRunState(initial, 'OBSERVING');
  const observed = transitionRunState(observing, 'OBSERVED');
  const finalized = transitionRunState(observed, 'FINALIZED');
  assert.equal(finalized.phase, 'FINALIZED');
  assert.throws(() => transitionRunState(initial, 'OBSERVED'), /invalid ARR-S0 phase transition/u);
  assert.throws(() => transitionRunState(finalized, 'FINALIZED'), /invalid ARR-S0 phase transition/u);
});

test('strict run-state validator rejects malformed source and hashes', () => {
  const state = createInitialRunState({
    runId: 'arr-s0-20260807t120000000z-a1b2c3',
    source: { commitSha: 'a'.repeat(40), treeSha: 'b'.repeat(40) },
    plan: { version: '0.2.0', hash: `sha256:${'c'.repeat(64)}` },
    contract: { version: '0.1.0', hash: `sha256:${'d'.repeat(64)}` },
  });
  const malformed = structuredClone(state);
  malformed.source.commitSha = 'not-a-sha';
  malformed.contract.hash = 'sha256:nope';
  const errors = validateRunState(malformed);
  assert.ok(errors.some((item) => item.includes('source.commitSha')));
  assert.ok(errors.some((item) => item.includes('contract.hash')));
});
