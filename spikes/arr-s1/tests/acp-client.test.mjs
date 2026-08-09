import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  createAcpClient,
  createAcpStdioClient,
} from '../src/acp/client.mjs';
import {
  normalizeAcpEvent,
  normalizeAcpHandshake,
  normalizeAcpPromptResponse,
} from '../src/acp/normalize.mjs';

const CWD = '/tmp/mnfs-arr-s1-fixture';

function fakeStream() {
  return {
    writable: new WritableStream({ write() {} }),
    readable: new ReadableStream({ start(controller) { controller.close(); } }),
  };
}

function fakeProcessBoundary() {
  const processListeners = new Set();
  const calls = { closes: 0 };
  return {
    calls,
    onProcess(listener) {
      processListeners.add(listener);
      return () => processListeners.delete(listener);
    },
    emitProcess(observation) {
      for (const listener of processListeners) listener(observation);
    },
    async close() {
      calls.closes += 1;
    },
  };
}

function fakeActiveSession(calls) {
  const queued = [];
  const waiters = [];
  let resolvePrompt;
  const active = {
    sessionId: 'session-1',
    prompt(input) {
      calls.prompts.push(input);
      return new Promise((resolve) => {
        resolvePrompt = resolve;
      });
    },
    nextUpdate() {
      if (queued.length > 0) return Promise.resolve(queued.shift());
      return new Promise((resolve) => waiters.push(resolve));
    },
    dispose() {
      calls.disposes += 1;
    },
    emit(message) {
      const waiter = waiters.shift();
      if (waiter) waiter(message);
      else queued.push(message);
    },
    resolvePrompt(response) {
      resolvePrompt?.(response);
    },
  };
  return active;
}

function fakeClientSurface({ protocolVersion = 1 } = {}) {
  const calls = {
    connectWith: [],
    requests: [],
    builds: [],
    sessions: [],
    notifications: [],
    prompts: [],
    disposes: 0,
  };
  const active = fakeActiveSession(calls);
  const context = {
    async request(method, params) {
      calls.requests.push({ method, params });
      if (method === 'initialize') {
        return {
          protocolVersion,
          agentCapabilities: { loadSession: true },
          _meta: { protocolVersion: 999, agentCapabilities: { loadSession: false } },
        };
      }
      throw new Error(`unexpected request: ${method}`);
    },
    buildSession(cwd) {
      calls.builds.push(cwd);
      return {
        async start() {
          calls.sessions.push({ cwd, mcpServers: [] });
          return active;
        },
      };
    },
    async notify(method, params) {
      calls.notifications.push({ method, params });
      assert.equal(method, 'session/cancel');
      active.emit({ kind: 'stop', response: { stopReason: 'cancelled' }, stopReason: 'cancelled' });
      active.resolvePrompt({ stopReason: 'cancelled' });
    },
  };
  const client = {
    connectWith(stream, operation) {
      calls.connectWith.push(stream);
      return operation(context);
    },
  };
  return { client, context, active, calls };
}

async function readyClient(options = {}) {
  const processBoundary = options.processBoundary ?? fakeProcessBoundary();
  const stream = options.stream ?? fakeStream();
  const surface = options.surface ?? fakeClientSurface(options);
  const client = createAcpClient({
    client: surface.client,
    stream,
    processBoundary,
  });
  await client.initialize();
  await client.startSession({ cwd: CWD });
  return { client, stream, processBoundary, surface };
}

test('uses the single official client/connectWith surface and ClientContext lifecycle', async () => {
  const { client, stream, surface } = await readyClient();

  assert.equal(typeof surface.client.initialize, 'undefined');
  assert.equal(typeof surface.client.buildSession, 'undefined');
  assert.equal(typeof surface.client.cancel, 'undefined');
  assert.equal(surface.calls.connectWith[0], stream);
  assert.deepEqual(surface.calls.requests[0], {
    method: 'initialize',
    params: {
      protocolVersion: 1,
      clientInfo: { name: 'mnfs-arr-s1', version: '0.1.0' },
      clientCapabilities: {},
    },
  });
  assert.deepEqual(surface.calls.builds, [CWD]);
  assert.deepEqual(surface.calls.sessions, [{ cwd: CWD, mcpServers: [] }]);
  assert.deepEqual(client.handshake(), {
    protocolVersion: 1,
    agentCapabilities: { loadSession: true },
  });
  await client.shutdown();
});

test('rejects an ACP protocol-version mismatch before building a session', async () => {
  const surface = fakeClientSurface({ protocolVersion: 2 });
  const client = createAcpClient({
    client: surface.client,
    stream: fakeStream(),
    processBoundary: fakeProcessBoundary(),
  });

  await assert.rejects(
    () => client.initialize(),
    (error) => error?.code === 'ACP_PROTOCOL_VERSION_MISMATCH',
  );
});

test('normalizes an ActiveSession session_update without using vendor metadata', () => {
  const event = normalizeAcpEvent({
    kind: 'session_update',
    notification: {
      sessionId: 'session-1',
      update: {
        sessionUpdate: 'tool_call',
        toolCallId: 'call-1',
        title: 'read_nonce_file',
        status: 'in_progress',
        rawInput: { path: 'fixture/nonce.txt' },
        _meta: { sessionUpdate: 'agent_message_chunk', text: 'untrusted' },
      },
    },
  }, { sequence: 1 });

  assert.deepEqual(event, {
    sequence: 1,
    timestampMs: null,
    type: 'tool_call',
    data: {
      sessionId: 'session-1',
      toolCallId: 'call-1',
      title: 'read_nonce_file',
      status: 'in_progress',
      input: { path: 'fixture/nonce.txt' },
    },
    truncation: { event: false, textPaths: [] },
  });
  assert.throws(
    () => normalizeAcpEvent({ kind: 'session_update', notification: { sessionId: 'session-1' } }, { sequence: 1 }),
    /structured ACP event update/u,
  );
});

test('runs an ACP prompt through ActiveSession updates and PromptResponse.stopReason', async () => {
  const { client, surface } = await readyClient();
  const turn = await client.prompt({ prompt: 'run the controlled fixture task' });

  assert.equal(surface.calls.prompts[0], 'run the controlled fixture task');
  surface.active.emit({
    kind: 'session_update',
    notification: {
      sessionId: 'session-1',
      update: { sessionUpdate: 'agent_message_chunk', content: { type: 'text', text: 'structured' } },
    },
    update: { sessionUpdate: 'agent_message_chunk', content: { type: 'text', text: 'structured' } },
  });
  surface.active.emit({ kind: 'stop', response: { stopReason: 'end_turn' }, stopReason: 'end_turn' });
  surface.active.resolvePrompt({ stopReason: 'end_turn' });

  const settled = await turn.settled;
  assert.equal(settled.settled, true);
  assert.equal(settled.outcome, 'COMPLETED');
  assert.deepEqual(settled.result, { stopReason: 'end_turn' });
  assert.equal(settled.sessionId, 'session-1');
  assert.equal('taskId' in settled, false);
  assert.equal(settled.events[0].type, 'assistant_output');
  assert.equal(settled.events[0].data.text, 'structured');
  await client.shutdown();
});

test('notifies session/cancel through ClientContext and waits for cancelled stopReason', async () => {
  const { client, surface } = await readyClient();
  const turn = await client.prompt({ prompt: 'wait for cancellation' });

  const settled = await client.cancel();

  assert.deepEqual(surface.calls.notifications, [{
    method: 'session/cancel',
    params: { sessionId: 'session-1' },
  }]);
  assert.equal(settled.outcome, 'CANCELLED');
  assert.equal((await turn.settled).outcome, 'CANCELLED');
  await client.shutdown();
});

test('classifies ACP process death as a handoff-required settled result without session authority', async () => {
  const { client, processBoundary } = await readyClient();
  const turn = await client.prompt({ prompt: 'die before finalization' });

  processBoundary.emitProcess({ status: 'SIGNALED', signal: 'SIGTERM', exitCode: null, outcome: 'SIGNAL_DEATH' });

  const settled = await turn.settled;
  assert.equal(settled.outcome, 'PROCESS_DEATH');
  assert.equal(settled.handoffRequired, true);
  assert.equal(settled.runtimeSession, undefined);
  assert.equal(settled.authority, undefined);
  await client.shutdown();
});

test('shuts down the active session and process boundary exactly once', async () => {
  const { client, processBoundary, surface } = await readyClient();

  await client.shutdown();
  await client.shutdown();

  assert.equal(surface.calls.disposes, 1);
  assert.equal(processBoundary.calls.closes, 1);
});

test('passes Node process streams to the injected official ndJsonStream and client factory', async () => {
  const streamCalls = [];
  const surface = fakeClientSurface();
  const client = await createAcpStdioClient({
    processSpec: {
      argv: [process.execPath, '-e', 'process.stdin.resume()'],
      cwd: process.cwd(),
      env: { PATH: '/usr/bin:/bin' },
      timeoutMs: 1000,
      terminationGraceMs: 100,
      stdoutLimitBytes: 4096,
      stderrLimitBytes: 4096,
    },
    clientFactory(options) {
      assert.deepEqual(options, { name: 'mnfs-arr-s1' });
      return surface.client;
    },
    ndJsonStream(output, input) {
      streamCalls.push({ output, input });
      assert.equal(typeof output.getWriter, 'function');
      assert.equal(typeof input.getReader, 'function');
      return { writable: output, readable: input };
    },
  });

  await client.initialize();
  assert.equal(streamCalls.length, 1);
  await client.shutdown();
});

test('normalizes ACP PromptResponse stop reasons without invented result status', () => {
  assert.deepEqual(normalizeAcpPromptResponse({ stopReason: 'max_tokens' }), {
    settled: true,
    status: 'COMPLETED',
    outcome: 'COMPLETED',
    stopReason: 'max_tokens',
    result: { stopReason: 'max_tokens' },
  });
  assert.deepEqual(normalizeAcpPromptResponse({ stopReason: 'cancelled' }).outcome, 'CANCELLED');
  assert.throws(() => normalizeAcpPromptResponse({ status: 'COMPLETED' }), /stopReason/u);
});

test('source contains no invented task protocol or task identity requirement', () => {
  const source = readFileSync(new URL('../src/acp/client.mjs', import.meta.url), 'utf8');

  assert.doesNotMatch(source, /task\/result|startTask|cancelTask|taskId/iu);
});

test('normalizes ACP handshake inputs with no vendor metadata dependency', () => {
  assert.deepEqual(normalizeAcpHandshake({ protocolVersion: 1, agentCapabilities: { promptCapabilities: { image: false } }, _meta: { protocolVersion: 2 } }), {
    protocolVersion: 1,
    agentCapabilities: { promptCapabilities: { image: false } },
  });
});
