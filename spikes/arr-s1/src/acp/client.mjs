import { Readable, Writable } from 'node:stream';
import { startProcess } from '../process-runner.mjs';
import {
  normalizeAcpEvent,
  normalizeAcpHandshake,
  normalizeAcpProcessObservation,
  normalizeAcpPromptResponse,
} from './normalize.mjs';

const ACP_METHODS = Object.freeze({
  initialize: 'initialize',
  sessionCancel: 'session/cancel',
});

function clone(value) {
  return structuredClone(value);
}

function freeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) freeze(child);
  return Object.freeze(value);
}

function requireClient(client) {
  if (!client || typeof client !== 'object' || typeof client.connectWith !== 'function') {
    throw new TypeError('ACP client must expose the public connectWith method');
  }
}

function requireStream(stream) {
  if (!stream || typeof stream !== 'object' || !stream.writable || !stream.readable) {
    throw new TypeError('ACP client requires the official writable/readable Stream pair');
  }
}

function requireProcessBoundary(processBoundary) {
  if (!processBoundary || typeof processBoundary !== 'object' || typeof processBoundary.onProcess !== 'function' || typeof processBoundary.close !== 'function') {
    throw new TypeError('ACP process boundary must expose onProcess and close');
  }
}

function requireClientContext(context) {
  if (!context || typeof context !== 'object' || typeof context.request !== 'function' || typeof context.buildSession !== 'function' || typeof context.notify !== 'function') {
    throw new TypeError('ACP connectWith callback must provide ClientContext request, buildSession and notify');
  }
}

function processBoundaryFromExecution(execution) {
  const listeners = new Set();
  const queued = [];
  let observed = null;
  let closePromise = null;

  execution.result.then((result) => {
    if (result?.outcome === 'NORMAL_EXIT') return;
    observed = result;
    if (listeners.size === 0) queued.push(result);
    else for (const listener of listeners) listener(result);
  });

  return {
    onProcess(listener) {
      listeners.add(listener);
      if (observed) listener(observed);
      while (queued.length > 0) listener(queued.shift());
      return () => listeners.delete(listener);
    },
    async close() {
      if (closePromise) return closePromise;
      closePromise = (async () => {
        if (typeof execution.cancel === 'function') execution.cancel('acp-client-close');
        await execution.result;
      })();
      return closePromise;
    },
    async result() {
      return execution.result;
    },
    forceKill(reason = 'acp forced process death') {
      return execution.forceKill?.(reason) ?? false;
    },
  };
}

function waitForTurnOrTimeout(turn, timeoutMs) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve({ timedOut: true }), timeoutMs);
    turn.settled.then((value) => {
      clearTimeout(timer);
      resolve({ timedOut: false, value });
    });
  });
}

export function createAcpClient({
  client,
  stream,
  processBoundary,
  clientInfo = { name: 'mnfs-arr-s1', version: '0.1.0' },
  clientCapabilities = {},
  maxTextBytes = 4096,
  maxEventBytes = 64 * 1024,
  cancellationTimeoutMs = 5000,
} = {}) {
  requireClient(client);
  requireStream(stream);
  requireProcessBoundary(processBoundary);
  if (!Number.isSafeInteger(cancellationTimeoutMs) || cancellationTimeoutMs <= 0) {
    throw new TypeError('ACP cancellationTimeoutMs must be a positive safe integer');
  }

  let initialized = false;
  let handshakeResult = null;
  let activeSession = null;
  let sessionId = null;
  let activeTurn = null;
  let closed = false;
  let context = null;
  let connectionPromise = null;
  let resolveConnectionClose = null;
  let removeProcessListener = () => {};

  function turnObservation(turn) {
    return freeze(turn.events.map((event) => clone(event)));
  }

  function turnRawObservation(turn) {
    return freeze(turn.rawMessages.map((message) => clone(message)));
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
    } else if (raw?.outcome === 'CANCEL_TIMEOUT') {
      normalized = {
        settled: true,
        status: 'CANCEL_TIMEOUT',
        outcome: 'CANCEL_TIMEOUT',
        result: null,
        handoffRequired: true,
        ...(raw.error ? { error: clone(raw.error) } : {}),
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

  removeProcessListener = processBoundary.onProcess(recordProcess) ?? (() => {});

  async function connect() {
    if (connectionPromise) return connectionPromise;
    let resolveContext;
    let rejectContext;
    const contextReady = new Promise((resolve, reject) => {
      resolveContext = resolve;
      rejectContext = reject;
    });
    const connectionClosed = new Promise((resolve) => {
      resolveConnectionClose = resolve;
    });
    connectionPromise = Promise.resolve()
      .then(() => client.connectWith(stream, async (nextContext) => {
        try {
          requireClientContext(nextContext);
          context = nextContext;
          resolveContext(context);
        } catch (error) {
          rejectContext(error);
          throw error;
        }
        await connectionClosed;
        return undefined;
      }))
      .catch((error) => {
        rejectContext(error);
        throw error;
      });
    await contextReady;
    return context;
  }

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
        turn.rawMessages.push(clone(message));
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
    const currentContext = await connect();
    const response = await currentContext.request(ACP_METHODS.initialize, {
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
    const hasRequestFields = Array.isArray(additionalDirectories) || Array.isArray(mcpServers);
    const request = {
      cwd,
      ...(Array.isArray(additionalDirectories) ? { additionalDirectories: clone(additionalDirectories) } : {}),
      mcpServers: Array.isArray(mcpServers) ? clone(mcpServers) : [],
    };
    const builder = context.buildSession(hasRequestFields ? request : cwd);
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
      rawMessages: [],
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
      return Object.freeze({ sessionId, settled, cancel, observe: () => turnObservation(turn), observeRaw: () => turnRawObservation(turn) });
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
      observeRaw: () => turnRawObservation(turn),
    });
  }

  async function cancel() {
    if (!activeTurn || activeTurn.settledValue) return activeTurn?.settledValue ?? null;
    const turn = activeTurn;
    await context.notify(ACP_METHODS.sessionCancel, { sessionId: turn.sessionId });
    const outcome = await waitForTurnOrTimeout(turn, cancellationTimeoutMs);
    if (!outcome.timedOut) return outcome.value;

    resolveConnectionClose?.();
    let closeError = null;
    try {
      await processBoundary.close();
    } catch (error) {
      closeError = { message: error?.message ?? String(error) };
    }
    if (!turn.settledValue) {
      settleTurn(turn, {
        outcome: 'CANCEL_TIMEOUT',
        ...(closeError ? { error: closeError } : {}),
      });
    }
    return turn.settled;
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
    resolveConnectionClose?.();
    try {
      if (connectionPromise) await connectionPromise;
    } catch (cause) {
      error ??= cause;
    }
    try {
      await processBoundary.close();
    } catch (cause) {
      error ??= cause;
    }
    if (error) throw error;
  }

  async function processObservation() {
    return processBoundary.result?.() ?? null;
  }

  function forceKill(reason = 'acp forced process death') {
    return processBoundary.forceKill?.(reason) ?? false;
  }

  return Object.freeze({ initialize, handshake, startSession, prompt, cancel, shutdown, processObservation, forceKill });
}

export async function createAcpStdioClient({
  processSpec,
  clientFactory,
  ndJsonStream,
  clientOptions = { name: 'mnfs-arr-s1' },
  clientRequestHandlers = {},
  beforeSpawn,
  ...options
} = {}) {
  if (!processSpec || typeof processSpec !== 'object' || !processSpec.env) throw new TypeError('ACP stdio processSpec must provide an explicit env');
  if (typeof clientFactory !== 'function') throw new TypeError('ACP clientFactory must be the public client function');
  if (typeof ndJsonStream !== 'function') throw new TypeError('ACP ndJsonStream must be the official stream function');
  if (beforeSpawn !== undefined && typeof beforeSpawn !== 'function') throw new TypeError('ACP beforeSpawn must be a function');
  await beforeSpawn?.();
  const execution = startProcess({ ...processSpec, stdinMode: 'protocol', protocolOwner: 'acp-client' });
  const processBoundary = processBoundaryFromExecution(execution);
  try {
    const stream = ndJsonStream(
      Writable.toWeb(execution.stdin),
      Readable.toWeb(execution.stdout),
    );
    let client = clientFactory(clientOptions);
    const handlers = Object.entries(clientRequestHandlers ?? {});
    if (handlers.length > 0 && typeof client?.onRequest !== 'function') {
      throw new TypeError('ACP client must expose onRequest for requested v1 client capabilities');
    }
    for (const [method, handler] of handlers) {
      if (typeof handler !== 'function') throw new TypeError(`ACP client request handler for ${method} must be a function`);
      client = client.onRequest(method, async (request) => handler(request?.params ?? request));
    }
    return createAcpClient({ ...options, client, stream, processBoundary });
  } catch (error) {
    await processBoundary.close();
    throw error;
  }
}
