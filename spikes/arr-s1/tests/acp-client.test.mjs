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
} from '../src/acp/normalize.mjs';

const CWD = '/tmp/mnfs-arr-s1-fixture';
const ENV = Object.freeze({ HOME: '/tmp/mnfs-arr-s1-home', PATH: '/usr/bin:/bin' });
const INVENTORY = Object.freeze([
  Object.freeze({ id: 'read_nonce_file', kind: 'resource' }),
  Object.freeze({ id: 'edit_result_file', kind: 'tool' }),
]);

function fakeTransport() {
  const messageListeners = new Set();
  const processListeners = new Set();
  const calls = { closes: 0 };
  return {
    calls,
    onMessage(listener) {
      messageListeners.add(listener);
      return () => messageListeners.delete(listener);
    },
    onProcess(listener) {
      processListeners.add(listener);
      return () => processListeners.delete(listener);
    },
    emitMessage(message) {
      for (const listener of messageListeners) listener(message);
    },
    emitProcess(observation) {
      for (const listener of processListeners) listener(observation);
    },
    async close() {
      calls.closes += 1;
    },
  };
}

function fakeProtocol(transport, { protocolVersion = 1 } = {}) {
  const calls = {
    initialize: [],
    sessions: [],
    tasks: [],
    cancellations: [],
    shutdowns: 0,
  };
  let nextTask = 1;
  return {
    calls,
    async initialize(input) {
      calls.initialize.push(input);
      return {
        protocolVersion,
        agentCapabilities: { loadSession: true },
        _meta: { protocolVersion: 999, agentCapabilities: { loadSession: false } },
      };
    },
    async newSession(input) {
      calls.sessions.push(input);
      return { sessionId: 'session-1' };
    },
    async startTask(input) {
      const taskId = `task-${nextTask++}`;
      calls.tasks.push({ ...input, taskId });
      return { taskId };
    },
    async cancelTask(input) {
      calls.cancellations.push(input);
      transport.emitMessage({
        method: 'task/result',
        params: { taskId: input.taskId, status: 'CANCELLED', result: null, settled: true },
      });
    },
    async shutdown() {
      calls.shutdowns += 1;
    },
  };
}

async function readyClient(options = {}) {
  const transport = options.transport ?? fakeTransport();
  const protocol = options.protocol ?? fakeProtocol(transport, options);
  const client = createAcpClient({ transport, protocol });
  await client.initialize();
  await client.startSession({ cwd: CWD, env: ENV, inventory: INVENTORY });
  return { client, transport, protocol };
}

test('records ACP v1 handshake and capabilities while ignoring vendor metadata', async () => {
  const { client, protocol } = await readyClient();

  assert.deepEqual(protocol.calls.initialize[0], {
    protocolVersion: 1,
    clientInfo: { name: 'mnfs-arr-s1', version: '0.1.0' },
    clientCapabilities: {},
  });
  assert.deepEqual(client.handshake(), {
    protocolVersion: 1,
    agentCapabilities: { loadSession: true },
  });
});

test('rejects an ACP protocol-version mismatch before starting a session', async () => {
  const transport = fakeTransport();
  const protocol = fakeProtocol(transport, { protocolVersion: 2 });
  const client = createAcpClient({ transport, protocol });

  await assert.rejects(
    () => client.initialize(),
    (error) => error?.code === 'ACP_PROTOCOL_VERSION_MISMATCH',
  );
});

test('normalizes standard ACP session updates without using vendor _meta for required fields', () => {
  const event = normalizeAcpEvent({
    method: 'session/update',
    params: {
      sessionId: 'session-1',
      taskId: 'task-1',
      update: {
        sessionUpdate: 'tool_call',
        toolCallId: 'call-1',
        title: 'read_nonce_file',
        status: 'in_progress',
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
      taskId: 'task-1',
      toolCallId: 'call-1',
      title: 'read_nonce_file',
      status: 'in_progress',
    },
    truncation: { event: false, textPaths: [] },
  });
  assert.throws(
    () => normalizeAcpEvent({ method: 'session/update', params: { _meta: { sessionUpdate: 'tool_call' } } }, { sequence: 1 }),
    /structured ACP event/u,
  );
});

test('runs a task through structured updates and an explicit settled result', async () => {
  const { client, transport, protocol } = await readyClient();
  const task = await client.startTask({ prompt: 'run the controlled fixture task' });

  assert.equal(task.taskId, 'task-1');
  assert.equal(protocol.calls.tasks[0].sessionId, 'session-1');
  assert.equal(protocol.calls.tasks[0].prompt, 'run the controlled fixture task');
  transport.emitMessage({
    method: 'session/update',
    params: {
      sessionId: 'session-1',
      taskId: 'task-1',
      update: { sessionUpdate: 'agent_message_chunk', content: { type: 'text', text: 'structured' } },
    },
  });
  transport.emitMessage({
    method: 'task/result',
    params: { taskId: 'task-1', status: 'COMPLETED', result: { changedPaths: ['result.txt'] }, settled: true },
  });

  const settled = await task.settled;
  assert.equal(settled.settled, true);
  assert.equal(settled.outcome, 'COMPLETED');
  assert.deepEqual(settled.result, { changedPaths: ['result.txt'] });
  assert.equal(settled.events[0].type, 'assistant_output');
  assert.equal(settled.events[0].data.text, 'structured');
});

test('cancels a task through ACP and settles it as cancellation', async () => {
  const { client, protocol } = await readyClient();
  const task = await client.startTask({ prompt: 'wait for cancellation' });

  const settled = await client.cancelTask(task.taskId, 'operator-request');

  assert.deepEqual(protocol.calls.cancellations, [{
    sessionId: 'session-1',
    taskId: 'task-1',
    reason: 'operator-request',
  }]);
  assert.equal(settled.outcome, 'CANCELLED');
  assert.equal((await task.settled).outcome, 'CANCELLED');
});

test('classifies ACP process death as a handoff-required settled result', async () => {
  const { client, transport } = await readyClient();
  const task = await client.startTask({ prompt: 'die before finalization' });

  transport.emitProcess({ status: 'SIGNALED', signal: 'SIGTERM', exitCode: null, outcome: 'SIGNAL_DEATH' });

  const settled = await task.settled;
  assert.equal(settled.outcome, 'PROCESS_DEATH');
  assert.equal(settled.handoffRequired, true);
  assert.equal(settled.runtimeSession, undefined);
});

test('shuts down protocol and transport exactly once', async () => {
  const { client, protocol, transport } = await readyClient();

  await client.shutdown();
  await client.shutdown();

  assert.equal(protocol.calls.shutdowns, 1);
  assert.equal(transport.calls.closes, 1);
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
    argv: [process.execPath, '-e', "process.stdin.resume(); process.stdin.on('end', () => { require('node:fs').writeSync(1, JSON.stringify({ method: 'session/update', params: { update: { sessionUpdate: 'plan', entries: [] } } }) + '\\n'); })"],
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
    params: { update: { sessionUpdate: 'plan', entries: [] } },
  }]);
  await transport.close();
});

test('normalizes handshake inputs with no vendor metadata dependency', () => {
  assert.deepEqual(normalizeAcpHandshake({ protocolVersion: 1, agentCapabilities: { promptCapabilities: { image: false } }, _meta: { protocolVersion: 2 } }), {
    protocolVersion: 1,
    agentCapabilities: { promptCapabilities: { image: false } },
  });
});
