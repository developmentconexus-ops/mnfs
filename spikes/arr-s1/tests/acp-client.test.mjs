import assert from 'node:assert/strict';
import { PassThrough, Writable } from 'node:stream';
import test from 'node:test';

import {
  createAcpClient,
  createAcpStdioTransport,
} from '../src/acp/client.mjs';
import { startProcess } from '../src/process-runner.mjs';
import {
  normalizeAcpEvent,
  normalizeAcpHandshake,
  normalizeAcpPromptResponse,
} from '../src/acp/normalize.mjs';

const CWD = '/tmp/mnfs-arr-s1-fixture';

function fakeTransport() {
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

function fakeProtocol(transport, { protocolVersion = 1 } = {}) {
  const calls = {
    initialize: [],
    builds: [],
    sessions: [],
    prompts: [],
    cancellations: [],
    disposes: 0,
  };
  const active = fakeActiveSession(calls);
  return {
    calls,
    active,
    async initialize(input) {
      calls.initialize.push(input);
      return {
        protocolVersion,
        agentCapabilities: { loadSession: true },
        _meta: { protocolVersion: 999, agentCapabilities: { loadSession: false } },
      };
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
    async cancel(input) {
      calls.cancellations.push(input);
      active.emit({
        kind: 'stop',
        response: { stopReason: 'cancelled' },
        stopReason: 'cancelled',
      });
      active.resolvePrompt({ stopReason: 'cancelled' });
    },
  };
}

async function readyClient(options = {}) {
  const transport = options.transport ?? fakeTransport();
  const protocol = options.protocol ?? fakeProtocol(transport, options);
  const client = createAcpClient({ transport, protocol });
  await client.initialize();
  await client.startSession({ cwd: CWD });
  return { client, transport, protocol };
}

test('records ACP v1 handshake/capabilities and starts session through buildSession', async () => {
  const { client, protocol } = await readyClient();

  assert.deepEqual(protocol.calls.initialize[0], {
    protocolVersion: 1,
    clientInfo: { name: 'mnfs-arr-s1', version: '0.1.0' },
    clientCapabilities: {},
  });
  assert.deepEqual(protocol.calls.builds, [CWD]);
  assert.deepEqual(protocol.calls.sessions, [{ cwd: CWD, mcpServers: [] }]);
  assert.deepEqual(client.handshake(), {
    protocolVersion: 1,
    agentCapabilities: { loadSession: true },
  });
});

test('rejects an ACP protocol-version mismatch before building a session', async () => {
  const transport = fakeTransport();
  const protocol = fakeProtocol(transport, { protocolVersion: 2 });
  const client = createAcpClient({ transport, protocol });

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

test('runs an ACP prompt through session updates and PromptResponse.stopReason', async () => {
  const { client, protocol } = await readyClient();
  const turn = await client.prompt({ prompt: 'run the controlled fixture task' });

  assert.equal(protocol.calls.prompts[0], 'run the controlled fixture task');
  protocol.active.emit({
    kind: 'session_update',
    notification: {
      sessionId: 'session-1',
      update: { sessionUpdate: 'agent_message_chunk', content: { type: 'text', text: 'structured' } },
    },
    update: { sessionUpdate: 'agent_message_chunk', content: { type: 'text', text: 'structured' } },
  });
  protocol.active.emit({
    kind: 'stop',
    response: { stopReason: 'end_turn' },
    stopReason: 'end_turn',
  });
  protocol.active.resolvePrompt({ stopReason: 'end_turn' });

  const settled = await turn.settled;
  assert.equal(settled.settled, true);
  assert.equal(settled.outcome, 'COMPLETED');
  assert.deepEqual(settled.result, { stopReason: 'end_turn' });
  assert.equal(settled.sessionId, 'session-1');
  assert.equal('taskId' in settled, false);
  assert.equal(settled.events[0].type, 'assistant_output');
  assert.equal(settled.events[0].data.text, 'structured');
});

test('cancels the active ACP prompt through session/cancel and waits for cancelled stopReason', async () => {
  const { client, protocol } = await readyClient();
  const turn = await client.prompt({ prompt: 'wait for cancellation' });

  const settled = await client.cancel();

  assert.deepEqual(protocol.calls.cancellations, [{ sessionId: 'session-1' }]);
  assert.equal(settled.outcome, 'CANCELLED');
  assert.equal((await turn.settled).outcome, 'CANCELLED');
});

test('classifies ACP process death as a handoff-required settled result without session authority', async () => {
  const { client, transport } = await readyClient();
  const turn = await client.prompt({ prompt: 'die before finalization' });

  transport.emitProcess({ status: 'SIGNALED', signal: 'SIGTERM', exitCode: null, outcome: 'SIGNAL_DEATH' });

  const settled = await turn.settled;
  assert.equal(settled.outcome, 'PROCESS_DEATH');
  assert.equal(settled.handoffRequired, true);
  assert.equal(settled.runtimeSession, undefined);
  assert.equal(settled.authority, undefined);
});

test('shuts down the active session and transport exactly once', async () => {
  const { client, protocol, transport } = await readyClient();

  await client.shutdown();
  await client.shutdown();

  assert.equal(protocol.calls.disposes, 1);
  assert.equal(transport.calls.closes, 1);
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

test('stdio transport frames JSON messages and reports bounded process observations', async () => {
  const stdout = new PassThrough();
  const writes = [];
  const stdin = new Writable({ write(chunk, _encoding, callback) { writes.push(chunk.toString()); callback(); } });
  const execution = {
    stdin,
    stdout,
    result: Promise.resolve({ status: 'EXITED', outcome: 'NORMAL_EXIT', exitCode: 0, signal: null }),
    cancel() { return true; },
  };
  const transport = createAcpStdioTransport({ execution });
  const messages = [];
  transport.onMessage((message) => messages.push(message));
  transport.send({ id: 1, method: 'initialize', params: { protocolVersion: 1 } });
  stdout.write('{"id":1,"result":{"protocolVersion":1}}\n');
  await new Promise((resolve) => setImmediate(resolve));

  assert.deepEqual(messages, [{ id: 1, result: { protocolVersion: 1 } }]);
  assert.deepEqual(writes, ['{"id":1,"method":"initialize","params":{"protocolVersion":1}}\n']);
  await transport.close();
});

test('stdio transport reuses the process-runner stream for a bounded fake ACP process', async () => {
  const execution = startProcess({
    argv: [process.execPath, '-e', "process.stdin.resume(); process.stdin.on('end', () => { require('node:fs').writeSync(1, JSON.stringify({ method: 'session/update', params: { sessionId: 'session-1', update: { sessionUpdate: 'plan', entries: [] } } }) + '\\n'); })"],
    cwd: process.cwd(),
    env: { MNFS_FAKE_ACP: 'yes' },
    timeoutMs: 1000,
    terminationGraceMs: 100,
    stdoutLimitBytes: 4096,
    stderrLimitBytes: 4096,
  });
  const transport = createAcpStdioTransport({ execution });
  const messages = [];
  transport.onMessage((message) => messages.push(message));
  await execution.result;

  assert.deepEqual(messages, [{
    method: 'session/update',
    params: { sessionId: 'session-1', update: { sessionUpdate: 'plan', entries: [] } },
  }]);
  await transport.close();
});

test('normalizes ACP handshake inputs with no vendor metadata dependency', () => {
  assert.deepEqual(normalizeAcpHandshake({ protocolVersion: 1, agentCapabilities: { promptCapabilities: { image: false } }, _meta: { protocolVersion: 2 } }), {
    protocolVersion: 1,
    agentCapabilities: { promptCapabilities: { image: false } },
  });
});
