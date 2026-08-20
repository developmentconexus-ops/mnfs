import test from 'node:test';
import assert from 'node:assert/strict';
import { E2BSandbox } from '@mastra/e2b';

function createSandbox(id) {
  // An exact template string makes construction side-effect-free. These probes
  // exercise the installed adapter's control flow only; they perform no E2B I/O.
  return new E2BSandbox({ id, template: 'conexus-a2-contract-no-provider-io' });
}

test('F-3L-A-01: E2B process spawn is routed through retryOnDead', async () => {
  const sandbox = createSandbox('a2-retry-routing');
  let retryBoundaryCalls = 0;
  const sentinelHandle = { kind: 'sentinel-process-handle' };

  // SandboxProcessManager wraps every subclass spawn() with ensureRunning().
  // Neutralize only that outer lifecycle wrapper so this fixture isolates the
  // E2BProcessManager internal routing without asking the real provider to start.
  sandbox.ensureRunning = async () => {};
  sandbox.retryOnDead = async () => {
    retryBoundaryCalls += 1;
    return sentinelHandle;
  };

  const result = await sandbox.processes.spawn('echo qualification-probe');

  assert.equal(retryBoundaryCalls, 1);
  assert.equal(result, sentinelHandle);
});

test('F-3L-A-01: retryOnDead restarts and repeats a recognized dead-sandbox operation once', async () => {
  const sandbox = createSandbox('a2-retry-behavior');
  let ensureRunningCalls = 0;
  let operationAttempts = 0;

  sandbox.ensureRunning = async () => {
    ensureRunningCalls += 1;
  };

  const result = await sandbox.retryOnDead(async () => {
    operationAttempts += 1;
    if (operationAttempts === 1) {
      throw new Error('Sandbox not found');
    }
    return 'second-attempt-result';
  });

  assert.equal(result, 'second-attempt-result');
  assert.equal(operationAttempts, 2);
  assert.equal(ensureRunningCalls, 1);
});

test('F-3L-A-01: retryOnDead does not repeat an unrelated operation failure', async () => {
  const sandbox = createSandbox('a2-no-retry-unrelated');
  let ensureRunningCalls = 0;
  let operationAttempts = 0;

  sandbox.ensureRunning = async () => {
    ensureRunningCalls += 1;
  };

  await assert.rejects(
    sandbox.retryOnDead(async () => {
      operationAttempts += 1;
      throw new Error('application command failed');
    }),
    /application command failed/,
  );

  assert.equal(operationAttempts, 1);
  assert.equal(ensureRunningCalls, 0);
});
