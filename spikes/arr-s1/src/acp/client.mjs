import { startProcess } from '../process-runner.mjs';
import {
  normalizeAcpEvent,
  normalizeAcpHandshake,
  normalizeAcpProcessObservation,
  normalizeAcpResult,
} from './normalize.mjs';

function clone(value) {
  return structuredClone(value);
}

function freeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) freeze(child);
  return Object.freeze(value);
}

function requireTransport(transport) {
  if (!transport || typeof transport !== 'object' || typeof transport.onMessage !== 'function' || typeof transport.onProcess !== 'function' || typeof transport.close !== 'function') {
    throw new TypeError('ACP transport must expose onMessage, onProcess and close');
  }
}

function protocolMethod(protocol, names, label) {
  for (const name of names) {
    if (typeof protocol?.[name] === 'function') return protocol[name].bind(protocol);
  }
  throw new TypeError(`ACP protocol must expose ${label}`);
}

function activeTaskFor(tasks, params = {}) {
  if (typeof params.taskId === 'string' && tasks.has(params.taskId)) return tasks.get(params.taskId);
  if (typeof params.sessionId === 'string') {
    return [...tasks.values()].find((task) => task.sessionId === params.sessionId && !task.settledValue) ?? null;
  }
  return [...tasks.values()].find((task) => !task.settledValue) ?? null;
}

export function createAcpClient({
  transport,
  protocol,
  clientInfo = { name: 'mnfs-arr-s1', version: '0.1.0' },
  clientCapabilities = {},
  maxTextBytes = 4096,
  maxEventBytes = 64 * 1024,
} = {}) {
  requireTransport(transport);
  if (!protocol || typeof protocol !== 'object') throw new TypeError('ACP protocol is required');

  const tasks = new Map();
  let initialized = false;
  let handshakeResult = null;
  let sessionId = null;
  let closed = false;
  let nextLocalTaskId = 1;
  let removeMessageListener = () => {};
  let removeProcessListener = () => {};

  function taskObservation(task) {
    return freeze(task.events.map((event) => clone(event)));
  }

  function settleTask(task, value) {
    if (task.settledValue) return task.settledValue;
    task.settledValue = freeze({
      taskId: task.taskId,
      sessionId: task.sessionId,
      settled: true,
      status: value.status,
      outcome: value.outcome,
      result: value.result ?? null,
      ...(value.error ? { error: clone(value.error) } : {}),
      handoffRequired: value.handoffRequired === true,
      events: taskObservation(task),
    });
    task.resolve(task.settledValue);
    return task.settledValue;
  }

  function recordMessage(message) {
    if (!message || typeof message !== 'object' || Array.isArray(message)) return;
    if (message.method === 'session/update') {
      const params = message.params ?? {};
      const task = activeTaskFor(tasks, params);
      if (!task) return;
      try {
        task.sequence += 1;
        const event = normalizeAcpEvent(message, {
          sequence: task.sequence,
          maxTextBytes,
          maxEventBytes,
        });
        task.events.push(event);
        const state = String(event.data?.state ?? '').toUpperCase();
        if (state === 'CANCELLED' || state === 'CANCELED') settleTask(task, { status: 'CANCELLED', outcome: 'CANCELLED', result: null });
      } catch (error) {
        settleTask(task, { status: 'FAILED', outcome: 'FAILED', result: null, error: { message: error.message } });
      }
      return;
    }
    if (message.method === 'task/result') {
      const task = activeTaskFor(tasks, message.params ?? {});
      if (!task) return;
      try {
        settleTask(task, normalizeAcpResult(message.params));
      } catch (error) {
        settleTask(task, { status: 'FAILED', outcome: 'FAILED', result: null, error: { message: error.message } });
      }
    }
  }

  function recordProcess(observation) {
    const processTasks = [...tasks.values()].filter((task) => !task.settledValue);
    for (const task of processTasks) {
      task.sequence += 1;
      try {
        const event = normalizeAcpProcessObservation(observation, {
          sequence: task.sequence,
          maxTextBytes,
          maxEventBytes,
        });
        task.events.push(event);
      } catch (error) {
        settleTask(task, { status: 'FAILED', outcome: 'FAILED', result: null, error: { message: error.message } });
        continue;
      }
      if (observation?.outcome === 'SIGNAL_DEATH' || observation?.outcome === 'SPAWN_ERROR') {
        settleTask(task, { status: 'PROCESS_DEATH', outcome: 'PROCESS_DEATH', result: null, handoffRequired: true });
      }
    }
  }

  removeMessageListener = transport.onMessage(recordMessage) ?? (() => {});
  removeProcessListener = transport.onProcess(recordProcess) ?? (() => {});

  async function initialize() {
    if (closed) throw new Error('ACP client is shut down');
    if (initialized) return handshakeResult;
    const initializeProtocol = protocolMethod(protocol, ['initialize'], 'initialize');
    const response = await initializeProtocol({
      protocolVersion: 1,
      clientInfo: clone(clientInfo),
      clientCapabilities: clone(clientCapabilities),
    });
    handshakeResult = normalizeAcpHandshake(response);
    initialized = true;
    return handshakeResult;
  }

  async function startSession({ cwd, env, inventory = [] } = {}) {
    if (!initialized) throw new Error('ACP client must initialize before starting a session');
    if (closed) throw new Error('ACP client is shut down');
    if (typeof cwd !== 'string' || !cwd.startsWith('/')) throw new TypeError('ACP session cwd must be an absolute path');
    if (!env || typeof env !== 'object' || Array.isArray(env)) throw new TypeError('ACP session env must be explicit');
    const start = protocolMethod(protocol, ['newSession', 'sessionNew', 'startSession'], 'newSession/sessionNew/startSession');
    const response = await start({ cwd, env: clone(env), inventory: clone(inventory) });
    if (typeof response?.sessionId !== 'string' || response.sessionId.length === 0) throw new TypeError('ACP session response must contain sessionId');
    sessionId = response.sessionId;
    return freeze({ sessionId, observational: true });
  }

  async function startTask({ prompt } = {}) {
    if (!sessionId) throw new Error('ACP client must start a session before starting a task');
    if (closed) throw new Error('ACP client is shut down');
    if (typeof prompt !== 'string' || prompt.length === 0) throw new TypeError('ACP task prompt is required');
    const start = protocolMethod(protocol, ['startTask', 'prompt', 'runTask'], 'startTask/prompt/runTask');
    const response = await start({ sessionId, prompt });
    const taskId = response?.taskId ?? response?.id ?? `task-local-${nextLocalTaskId++}`;
    if (typeof taskId !== 'string' || taskId.length === 0) throw new TypeError('ACP task response must contain taskId');
    let resolve;
    const settled = new Promise((promiseResolve) => { resolve = promiseResolve; });
    const task = {
      taskId,
      sessionId,
      sequence: 0,
      events: [],
      resolve,
      settled,
      settledValue: null,
    };
    tasks.set(taskId, task);
    if (response?.settled && typeof response.settled.then === 'function') {
      response.settled.then((value) => {
        try { settleTask(task, normalizeAcpResult(value)); } catch (error) { settleTask(task, { status: 'FAILED', outcome: 'FAILED', result: null, error: { message: error.message } }); }
      }).catch((error) => settleTask(task, { status: 'FAILED', outcome: 'FAILED', result: null, error: { message: error?.message ?? String(error) } }));
    }
    return Object.freeze({
      taskId,
      sessionId,
      settled,
      cancel: (reason = 'explicit cancellation') => cancelTask(taskId, reason),
      observe: () => taskObservation(task),
    });
  }

  async function cancelTask(taskId, reason = 'explicit cancellation') {
    const task = tasks.get(taskId);
    if (!task) throw new Error(`unknown ACP task: ${taskId}`);
    if (task.settledValue) return task.settledValue;
    const cancel = protocolMethod(protocol, ['cancelTask', 'cancel'], 'cancelTask/cancel');
    await cancel({ sessionId: task.sessionId, taskId, reason });
    if (!task.settledValue) settleTask(task, { status: 'CANCELLED', outcome: 'CANCELLED', result: null });
    return task.settled;
  }

  function handshake() {
    return handshakeResult ? clone(handshakeResult) : null;
  }

  async function shutdown() {
    if (closed) return;
    closed = true;
    for (const task of tasks.values()) {
      if (!task.settledValue) settleTask(task, { status: 'SHUTDOWN', outcome: 'SHUTDOWN', result: null, handoffRequired: true });
    }
    removeMessageListener();
    removeProcessListener();
    try {
      const shutdownProtocol = protocol.shutdown ?? protocol.close;
      if (typeof shutdownProtocol === 'function') await shutdownProtocol.call(protocol);
    } finally {
      await transport.close();
    }
  }

  return Object.freeze({ initialize, handshake, startSession, startTask, cancelTask, shutdown });
}

export function createAcpStdioTransport({ execution, maxLineBytes = 1024 * 1024 } = {}) {
  if (!execution || typeof execution !== 'object' || !execution.stdout || typeof execution.result?.then !== 'function') {
    throw new TypeError('ACP stdio transport requires a process-runner execution');
  }
  if (!Number.isSafeInteger(maxLineBytes) || maxLineBytes <= 0) throw new TypeError('ACP stdio maxLineBytes must be positive');
  const messageListeners = new Set();
  const processListeners = new Set();
  const queuedMessages = [];
  const queuedProcesses = [];
  let buffer = '';
  let closed = false;
  let closePromise = null;

  function deliver(listeners, queue, value) {
    if (listeners.size === 0) queue.push(value);
    else for (const listener of listeners) listener(value);
  }

  function parseLines(chunk) {
    buffer += Buffer.from(chunk).toString('utf8');
    if (Buffer.byteLength(buffer) > maxLineBytes && !buffer.includes('\n')) {
      buffer = '';
      deliver(messageListeners, queuedMessages, { method: 'transport/error', params: { reason: 'line-too-large' } });
      return;
    }
    let newline;
    while ((newline = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, newline).replace(/\r$/u, '');
      buffer = buffer.slice(newline + 1);
      if (line.length === 0) continue;
      if (Buffer.byteLength(line) > maxLineBytes) {
        deliver(messageListeners, queuedMessages, { method: 'transport/error', params: { reason: 'line-too-large' } });
        continue;
      }
      try {
        deliver(messageListeners, queuedMessages, JSON.parse(line));
      } catch {
        deliver(messageListeners, queuedMessages, { method: 'transport/error', params: { reason: 'invalid-json-line' } });
      }
    }
  }

  execution.stdout.on('data', parseLines);
  execution.result.then((result) => {
    if (result?.outcome !== 'NORMAL_EXIT') deliver(processListeners, queuedProcesses, result);
  });

  const transport = {
    onMessage(listener) {
      messageListeners.add(listener);
      while (queuedMessages.length > 0) listener(queuedMessages.shift());
      return () => messageListeners.delete(listener);
    },
    onProcess(listener) {
      processListeners.add(listener);
      while (queuedProcesses.length > 0) listener(queuedProcesses.shift());
      return () => processListeners.delete(listener);
    },
    send(message) {
      if (closed) throw new Error('ACP stdio transport is closed');
      if (!execution.stdin || typeof execution.stdin.write !== 'function') throw new Error('ACP stdio transport has no protocol stdin');
      execution.stdin.write(`${JSON.stringify(message)}\n`);
    },
    async close() {
      if (closePromise) return closePromise;
      closed = true;
      closePromise = (async () => {
        if (typeof execution.cancel === 'function') execution.cancel('acp-transport-close');
        await execution.result;
      })();
      return closePromise;
    },
  };
  return Object.freeze(transport);
}

export async function createAcpStdioClient({ processSpec, protocolFactory, ...options } = {}) {
  if (!processSpec || typeof processSpec !== 'object' || !processSpec.env) throw new TypeError('ACP stdio processSpec must provide an explicit env');
  if (typeof protocolFactory !== 'function') throw new TypeError('ACP stdio protocolFactory is required');
  const execution = startProcess({ ...processSpec, stdinMode: 'protocol', protocolOwner: 'acp-client' });
  const transport = createAcpStdioTransport({ execution });
  try {
    const protocol = await protocolFactory({ transport });
    return createAcpClient({ ...options, transport, protocol });
  } catch (error) {
    await transport.close();
    throw error;
  }
}
