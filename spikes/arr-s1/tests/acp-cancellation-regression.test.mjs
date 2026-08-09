import assert from 'node:assert/strict';
import test from 'node:test';

import { createAcpClient } from '../src/acp/client.mjs';

const CWD = '/tmp/mnfs-arr-s1-fixture';

function fakeStream() {
  return {
    writable: new WritableStream({ write() {} }),
    readable: new ReadableStream({ start(controller) { controller.close(); } }),
  };
}

function nonCooperativeSurface() {
  const calls = { notifications: [], closes: 0 };
  const activeSession = {
    sessionId: 'session-1',
    prompt() { return new Promise(() => {}); },
    nextUpdate() { return new Promise(() => {}); },
    dispose() {},
  };
  const context = {
    async request(method) {
      assert.equal(method, 'initialize');
      return { protocolVersion: 1, agentCapabilities: {} };
    },
    buildSession() {
      return { async start() { return activeSession; } };
    },
    async notify(method, params) {
      calls.notifications.push({ method, params });
      // Deliberately never emit a stop update or resolve prompt().
    },
  };
  return {
    calls,
    client: {
      connectWith(_stream, operation) { return operation(context); },
    },
    processBoundary: {
      onProcess() { return () => {}; },
      async close() { calls.closes += 1; },
    },
  };
}

test('cancellation settles within a bound and closes the process boundary when ACP ignores session/cancel', async () => {
  const surface = nonCooperativeSurface();
  const client = createAcpClient({
    client: surface.client,
    stream: fakeStream(),
    processBoundary: surface.processBoundary,
    cancellationTimeoutMs: 20,
  });
  await client.initialize();
  await client.startSession({ cwd: CWD });
  const turn = await client.prompt({ prompt: 'wait forever' });

  const observed = await Promise.race([
    client.cancel(),
    new Promise((resolve) => setTimeout(() => resolve('UNBOUNDED'), 100)),
  ]);

  assert.notEqual(observed, 'UNBOUNDED');
  assert.equal(observed.settled, true);
  assert.equal(observed.outcome, 'CANCEL_TIMEOUT');
  assert.equal(observed.handoffRequired, true);
  assert.equal(surface.calls.closes, 1);
  assert.deepEqual(surface.calls.notifications, [{
    method: 'session/cancel',
    params: { sessionId: 'session-1' },
  }]);
  assert.equal((await turn.settled).outcome, 'CANCEL_TIMEOUT');
});
