import { startProcess } from '../process-runner.mjs';
import {
  normalizeAcpEvent,
  normalizeAcpHandshake,
  normalizeAcpProcessObservation,
  normalizeAcpPromptResponse,
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
  if (!transport || typeof transport !== 'object' || typeof transport.onProcess !== 'function' || typeof transport.close !== 'function') {
    throw new TypeError('ACP transport must expose onProcess and close');
  }
}

function protocolMethod(protocol, name) {
  if (typeof protocol?.[name] !== 'function') throw new TypeError(`ACP protocol must expose ${name}`);
  return protocol[name].bind(protocol);
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

  let initialized = false;
  let handshakeResult = null;
  let activeSession = null;
  let sessionId = null;
  let activeTurn = null;
  let closed = false;
  let removeProcessListener = () => {};

  function turnObservation(turn) {
    return freeze(turn.events.map((event) => clone(event)));
  }

  function settleTurn(turn, raw) {
    if (turn.settledValue) return turn.settledValue;
    let normalized;
    if (raw?.outcome === 'PROCESS_DEATH') {
      normalized = {
        settled: true,
        status: 'PROCESS_DEATH',
        outcome: 'PROCESS_DEATH',
        result: null,
        handoffRequired: true,
      };
    } else if (raw?.error) {
      normalized = {
        settled: true,
        status: 'FAILED',
        outcome: 'FAILED',
        result: null,
        error: { message: raw.error.message ?? String(raw.error) },
      };
    } else {
      normalized = normalizeAcpPromptResponse(raw);
    }
    const settled = {
      ...normalized,
      sessionId: turn.sessionId,
      events: turnObservation(turn),
    };
    if (normalized.handoffRequired === undefined) settled.handoffRequired = false;
    turn.settledValue = freeze(settled);
    turn.resolve(turn.settledValue);
    return turn.settledValue;
  }

  function recordProcess(observation) {
    if (!activeTurn || activeTurn.settledValue) return;
    activeTurn.sequence += 1;
    try {
      activeTurn.events.push(normalizeAcpProcessObservation(observation, {
        sequence: activeTurn.sequence,
        maxTextBytes,
        maxEventBytes,
      }));
    } catch (error) {
      settleTurn(activeTurn, { error: { message: error?.message ?? String(error) } });
      return;
    }
    if (observation?.outcome === 'SIGNAL_DEATH' || observation?.outcome === 'SPAWN_ERROR') {
      settleTurn(activeTurn, { outcome: 'PROCESS_DEATH' });
    }
  }

  removeProcessListener = transport.onProcess(recordProcess) ?? (() => {});

  async function consumeUpdates(turn) {
    while (!turn.settledValue) {
      let message;
      try {
        message = await activeSession.nextUpdate();
      } catch (error) {
        if (!turn.settledValue) settleTurn(turn, { error: { message: error?.message ?? String(error) } });
        return;
      }
      if (turn.settledValue) return;
      if (message?.kind === 'session_update') {
        try {
          turn.sequence += 1;
          turn.events.push(normalizeAcpEvent(message, {
            sequence: turn.sequence,
            maxTextBytes,
            maxEventBytes,
          }));
        } catch (error) {
          settleTurn(turn, { error: { message: error?.message ?? String(error) } });
          return;
        }
        continue;
      }
      if (message?.kind === 'stop') {
        try {
          settleTurn(turn, message.response);
        } catch (error) {
          settleTurn(turn, { error: { message: error?.message ?? String(error) } });
        }
        return;
      }
      settleTurn(turn, { error: { message: 'ACP ActiveSession.nextUpdate returned an unsupported message' } });
      return;
    }
  }

  async function initialize() {
    if (closed) throw new Error('ACP client is shut down');
    if (initialized) return handshakeResult;
    const response = await protocolMethod(protocol, 'initialize')({
      protocolVersion: 1,
      clientInfo: clone(clientInfo),
      clientCapabilities: clone(clientCapabilities),
    });
    handshakeResult = normalizeAcpHandshake(response);
    initialized = true;
    return handshakeResult;
  }

  async function startSession({ cwd, env, inventory, additionalDirectories, mcpServers } = {}) {
    if (!initialized) throw new Error('ACP client must initialize before starting a session');
    if (closed) throw new Error('ACP client is shut down');
    if (env !== undefined || inventory !== undefined) {
      throw new TypeError('ACP session/new does not accept env or inventory; use its cwd, directories and MCP fields');
    }
    if (typeof cwd !== 'string' || !cwd.startsWith('/')) throw new TypeError('ACP session cwd must be an absolute path');
    const buildSession = protocolMethod(protocol, 'buildSession');
    const hasRequestFields = Array.isArray(additionalDirectories) || Array.isArray(mcpServers);
    const request = {
      cwd,
      ...(Array.isArray(additionalDirectories) ? { additionalDirectories: clone(additionalDirectories) } : {}),
      mcpServers: Array.isArray(mcpServers) ? clone(mcpServers) : [],
    };
    const builder = buildSession(hasRequestFields ? request : cwd);
    if (!builder || typeof builder.start !== 'function') throw new TypeError('ACP buildSession must return a SessionBuilder');
    activeSession = await builder.start();
    if (!activeSession || typeof activeSession !== 'object' || typeof activeSession.sessionId !== 'string' || activeSession.sessionId.length === 0) {
      throw new TypeError('ACP SessionBuilder.start must return an ActiveSession with sessionId');
    }
    if (typeof activeSession.prompt !== 'function' || typeof activeSession.nextUpdate !== 'function' || typeof activeSession.dispose !== 'function') {
      throw new TypeError('ACP ActiveSession must expose prompt, nextUpdate and dispose');
    }
    sessionId = activeSession.sessionId;
    return freeze({ sessionId, observational: true });
  }

  async function prompt({ prompt: text } = {}) {
    if (!activeSession || !sessionId) throw new Error('ACP client must start a session before prompting');
    if (closed) throw new Error('ACP client is shut down');
    if (activeTurn && !activeTurn.settledValue) throw new Error('ACP client already has an active prompt');
    if (typeof text !== 'string' || text.length === 0) throw new TypeError('ACP prompt text is required');

    let resolve;
    const settled = new Promise((promiseResolve) => { resolve = promiseResolve; });
    const turn = {
      sessionId,
      sequence: 0,
      events: [],
      resolve,
      settled,
      settledValue: null,
    };
    activeTurn = turn;

    let responsePromise;
    try {
      responsePromise = activeSession.prompt(text);
    } catch (error) {
      settleTurn(turn, { error: { message: error?.message ?? String(error) } });
      return Object.freeze({ sessionId, settled, cancel, observe: () => turnObservation(turn) });
    }
    Promise.resolve(responsePromise)
      .then((response) => settleTurn(turn, response))
      .catch((error) => settleTurn(turn, { error: { message: error?.message ?? String(error) } }));
    void consumeUpdates(turn);

    return Object.freeze({
      sessionId,
      settled,
      cancel,
      observe: () => turnObservation(turn),
    });
  }

  async function cancel() {
    if (!activeTurn || activeTurn.settledValue) return activeTurn?.settledValue ?? null;
    await protocolMethod(protocol, 'cancel')({ sessionId: activeTurn.sessionId });
    return activeTurn.settled;
  }

  function handshake() {
    return handshakeResult ? clone(handshakeResult) : null;
  }

  async function shutdown() {
    if (closed) return;
    let error;
    try {
      if (activeTurn && !activeTurn.settledValue) await cancel();
    } catch (cause) {
      error = cause;
    }
    closed = true;
    removeProcessListener();
    try {
      activeSession?.dispose();
    } catch (cause) {
      error ??= cause;
    }
    try {
      await transport.close();
    } catch (cause) {
      error ??= cause;
    }
    if (error) throw error;
  }

  return Object.freeze({ initialize, handshake, startSession, prompt, cancel, shutdown });
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
