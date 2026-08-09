import assert from 'node:assert/strict';
import test from 'node:test';

import { createPiSdkAdapter } from '../src/adapters/pi-sdk.mjs';

const CWD = '/tmp/mnfs-arr-s1-fixture';
const ENV = Object.freeze({
  HOME: '/tmp/mnfs-arr-s1-home',
  PATH: '/usr/bin:/bin',
  MNFS_FIXTURE: 'yes',
});
const INVENTORY = Object.freeze([
  Object.freeze({ id: 'read_nonce_file', kind: 'resource' }),
  Object.freeze({ id: 'edit_result_file', kind: 'tool' }),
]);

function fakePiSdk({ turnResult, turnError } = {}) {
  const calls = {
    create: [],
    turns: [],
    cancellations: [],
    closes: 0,
  };
  const listeners = new Set();
  let settleTurn;
  let rejectTurn;

  const session = {
    runtimeSessionId: 'pi-session-observation-only',
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    emit(event) {
      for (const listener of listeners) listener(event);
    },
    startTurn(input) {
      calls.turns.push(input);
      if (turnError) return Promise.reject(turnError);
      if (turnResult) return Promise.resolve(turnResult);
      return new Promise((resolve, reject) => {
        settleTurn = resolve;
        rejectTurn = reject;
      });
    },
    async cancel(reason) {
      calls.cancellations.push(reason);
      session.emit({ type: 'lifecycle', data: { state: 'CANCELLED', reason } });
      settleTurn?.({ status: 'CANCELLED', result: null });
    },
    async close() {
      calls.closes += 1;
    },
  };

  return {
    calls,
    session,
    sdk: {
      async createAgentSession(config) {
        calls.create.push(config);
        return session;
      },
    },
    settleTurn,
    rejectTurn,
  };
}

test('initializes Pi with exact cwd/env and an explicit inventory with ambient discovery disabled', async () => {
  const fake = fakePiSdk();
  const adapter = createPiSdkAdapter({
    sdk: fake.sdk,
    cwd: CWD,
    env: ENV,
    inventory: INVENTORY,
  });

  const initialized = await adapter.initialize();

  assert.deepEqual(fake.calls.create[0], {
    cwd: CWD,
    env: ENV,
    resources: [{ id: 'read_nonce_file', kind: 'resource' }],
    tools: [{ id: 'edit_result_file', kind: 'tool' }],
    sessionManager: { persist: false },
    resourceLoader: { mode: 'explicit-inventory' },
    discovery: { enabled: false },
    allowAmbientDiscovery: false,
    extensions: [],
    mcpServers: [],
  });
  assert.deepEqual(initialized, {
    status: 'READY',
    cwd: CWD,
    envKeys: ['HOME', 'MNFS_FIXTURE', 'PATH'],
    inventory: INVENTORY,
    discovery: { enabled: false },
    runtimeSession: {
      id: 'pi-session-observation-only',
      observational: true,
    },
  });
  assert.equal(initialized.authority, undefined);
  assert.equal(initialized.recoveryState, undefined);
});

test('returns a settled structured result from an explicit Pi turn without parsing TUI text', async () => {
  const fake = fakePiSdk({
    turnResult: {
      status: 'COMPLETED',
      result: { changedPaths: ['result.txt'] },
    },
  });
  const adapter = createPiSdkAdapter({ sdk: fake.sdk, cwd: CWD, env: ENV, inventory: INVENTORY });
  await adapter.initialize();
  fake.session.emit({ type: 'lifecycle', data: { state: 'STARTED' } });
  fake.session.emit({ type: 'tool_call', data: { toolId: 'read_nonce_file', input: { path: 'fixture/nonce.txt' } } });

  const settled = await adapter.startTurn('run the controlled fixture task');

  assert.equal(fake.calls.turns[0].prompt, 'run the controlled fixture task');
  assert.equal(settled.settled, true);
  assert.equal(settled.outcome, 'COMPLETED');
  assert.deepEqual(settled.result, { changedPaths: ['result.txt'] });
  assert.deepEqual(settled.events.map(({ type, data }) => ({ type, data })), [
    { type: 'lifecycle', data: { state: 'STARTED' } },
    { type: 'tool_call', data: { toolId: 'read_nonce_file', input: { path: 'fixture/nonce.txt' } } },
  ]);
  assert.deepEqual(adapter.observe().map(({ type, data }) => ({ type, data })), settled.events.map(({ type, data }) => ({ type, data })));
  assert.equal(settled.runtimeSession.observational, true);
  assert.equal(settled.authority, undefined);
  assert.equal(settled.recoveryState, undefined);
});

test('cancellation settles explicitly and remains distinct from process death', async () => {
  const fake = fakePiSdk();
  const adapter = createPiSdkAdapter({ sdk: fake.sdk, cwd: CWD, env: ENV, inventory: INVENTORY });
  await adapter.initialize();

  const turn = adapter.startTurn('wait for cancellation');
  const cancellation = await adapter.cancel('operator-request');
  const settled = await turn;

  assert.deepEqual(fake.calls.cancellations, ['operator-request']);
  assert.equal(cancellation.outcome, 'CANCELLED');
  assert.equal(cancellation.settled, true);
  assert.equal(settled.outcome, 'CANCELLED');
  assert.equal(settled.handoffRequired, false);
});

test('process death settles as a handoff-required observation without turning Session identity into recovery authority', async () => {
  const fake = fakePiSdk();
  const adapter = createPiSdkAdapter({ sdk: fake.sdk, cwd: CWD, env: ENV, inventory: INVENTORY });
  await adapter.initialize();

  const turn = adapter.startTurn('die before finalization');
  fake.session.emit({
    type: 'process',
    data: { status: 'SIGNALED', signal: 'SIGTERM', exitCode: null, outcome: 'SIGNAL_DEATH' },
  });
  const settled = await turn;

  assert.equal(settled.settled, true);
  assert.equal(settled.outcome, 'PROCESS_DEATH');
  assert.equal(settled.handoffRequired, true);
  assert.equal(settled.runtimeSession.observational, true);
  assert.equal(settled.authority, undefined);
  assert.equal(settled.recoveryState, undefined);
});

test('closes the injected Pi session idempotently', async () => {
  const fake = fakePiSdk({
    turnResult: { status: 'COMPLETED', result: { ok: true } },
  });
  const adapter = createPiSdkAdapter({ sdk: fake.sdk, cwd: CWD, env: ENV, inventory: INVENTORY });
  await adapter.initialize();

  await adapter.close();
  await adapter.close();

  assert.equal(fake.calls.closes, 1);
});
