import assert from 'node:assert/strict';
import test from 'node:test';

const TRANSITIONS_MODULE_SPECIFIER = '../../src/execution/' + 'transitions.js';

interface TransitionModule {
  requireAttemptTransition(from: string, to: string): string;
  requireLeaseTransition(from: string, to: string): string;
}

function describeError(error: unknown): string {
  return error instanceof Error ? `${error.name}: ${error.message}` : String(error);
}

async function loadTransitionModule(): Promise<TransitionModule> {
  try {
    return await import(TRANSITIONS_MODULE_SPECIFIER) as TransitionModule;
  } catch (error) {
    assert.fail(`M01 transition module is not implemented: ${describeError(error)}`);
  }
}

test('accepts only the designed Attempt transitions', async () => {
  const transitions = await loadTransitionModule();

  assert.equal(transitions.requireAttemptTransition('OPEN', 'SUPERSEDED'), 'SUPERSEDED');
  assert.equal(transitions.requireAttemptTransition('OPEN', 'CLOSED'), 'CLOSED');
  assert.equal(transitions.requireAttemptTransition('OPEN', 'CANCELLED'), 'CANCELLED');
  assert.throws(() => transitions.requireAttemptTransition('SUPERSEDED', 'OPEN'));
  assert.throws(() => transitions.requireAttemptTransition('CLOSED', 'OPEN'));
});

test('accepts only the designed Lease transitions', async () => {
  const transitions = await loadTransitionModule();

  assert.equal(transitions.requireLeaseTransition('REQUESTED', 'ACTIVE'), 'ACTIVE');
  assert.equal(
    transitions.requireLeaseTransition('ACTIVE', 'RELEASE_PENDING'),
    'RELEASE_PENDING',
  );
  assert.equal(
    transitions.requireLeaseTransition('RELEASE_PENDING', 'RELEASED'),
    'RELEASED',
  );
  assert.equal(transitions.requireLeaseTransition('ACTIVE', 'DIVERGED'), 'DIVERGED');
  assert.throws(() => transitions.requireLeaseTransition('RELEASED', 'ACTIVE'));
  assert.throws(() => transitions.requireLeaseTransition('DIVERGED', 'ACTIVE'));
});
