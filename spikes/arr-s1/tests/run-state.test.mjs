import assert from 'node:assert/strict';
import test from 'node:test';
import {
  RUN_PHASES,
  createRunLedger,
  createRunState,
  finalizeRunState,
  interruptRunState,
  recordRunObservations,
  registerRun,
  reopenRunState,
  transitionRunState,
} from '../src/run-state.mjs';

const BINDING = Object.freeze({
  candidateShape: 'PI-SDK',
  contractHash: `sha256:${'a'.repeat(64)}`,
  fixtureHash: `sha256:${'b'.repeat(64)}`,
  sourceTreeHash: `sha256:${'c'.repeat(64)}`,
});

function newState(overrides = {}) {
  return createRunState({
    runId: 'run-s1-0001',
    ...BINDING,
    ...overrides,
  });
}

test('enforces the finite S1 lifecycle and keeps verdict absent until observations exist', () => {
  assert.deepEqual(RUN_PHASES, ['CREATED', 'READY', 'RUNNING', 'OBSERVED', 'FINALIZED']);
  const created = newState();
  assert.equal(created.phase, 'CREATED');
  assert.equal(created.verdict, null);
  assert.equal(Object.isFrozen(created), true);

  const ready = transitionRunState(created, 'READY');
  const running = transitionRunState(ready, 'RUNNING');
  assert.equal(running.verdict, null);
  assert.throws(() => transitionRunState(running, 'FINALIZED'), /invalid.*transition/u);
  assert.throws(
    () => finalizeRunState(transitionRunState(running, 'OBSERVED'), {}),
    /required observations/u,
  );

  const observed = recordRunObservations(running, {
    observations: [{ criterionId: 'S1-C01', status: 'PASS', proof: 'fixture-read' }],
    checkpoints: { cancellation: 'NOT_RUN', processDeath: 'NOT_RUN' },
  });
  const observedPhase = transitionRunState(observed, 'OBSERVED');
  const finalized = finalizeRunState(observedPhase, {
    criterionResults: [{ id: 'S1-C01', status: 'PASS', required: true }],
    requiredCriteria: ['S1-C01'],
  });

  assert.equal(finalized.phase, 'FINALIZED');
  assert.equal(finalized.verdict, 'PASS');
  assert.equal(finalized.observations.length, 1);
  assert.equal(Object.isFrozen(finalized.observations), true);
});

test('an interruption before finalization remains explicitly reopenable', () => {
  const running = transitionRunState(transitionRunState(newState(), 'READY'), 'RUNNING');
  const interrupted = interruptRunState(running, {
    checkpoint: 'PROCESS_DEATH_BEFORE_FINALIZED',
    reason: 'child exited by signal',
  });

  assert.equal(interrupted.phase, 'RUNNING');
  assert.equal(interrupted.verdict, null);
  assert.equal(interrupted.interrupted.reopenable, true);
  assert.throws(() => transitionRunState(interrupted, 'OBSERVED'), /reopen/u);
  const reopened = reopenRunState(interrupted);
  assert.equal(reopened.phase, 'RUNNING');
  assert.equal(reopened.interrupted, null);
  assert.equal(reopened.resumeCount, 1);
  assert.throws(() => reopenRunState(finalizedState()), /finalized/u);
});

test('binds one immutable run identity to each candidate shape and rejects duplicates', () => {
  const first = newState();
  const sameBinding = newState({ runId: 'run-s1-0002' });
  assert.equal(first.runKey, sameBinding.runKey);

  const ledger = createRunLedger();
  registerRun(ledger, first);
  assert.throws(() => registerRun(ledger, sameBinding), /already registered/u);
  assert.deepEqual(ledger.get('PI-SDK'), first);
  const otherShape = newState({ candidateShape: 'PI-ACP', runId: 'run-s1-0003' });
  assert.notEqual(otherShape.runKey, first.runKey);
  registerRun(ledger, otherShape);
  assert.deepEqual(ledger.get('PI-ACP'), otherShape);
});

function finalizedState() {
  const running = transitionRunState(transitionRunState(newState({ runId: 'run-s1-final' }), 'READY'), 'RUNNING');
  const observed = recordRunObservations(running, {
    observations: [{ criterionId: 'S1-C01', status: 'PASS' }],
  });
  return finalizeRunState(transitionRunState(observed, 'OBSERVED'), {
    criterionResults: [{ id: 'S1-C01', status: 'PASS', required: true }],
    requiredCriteria: ['S1-C01'],
  });
}
