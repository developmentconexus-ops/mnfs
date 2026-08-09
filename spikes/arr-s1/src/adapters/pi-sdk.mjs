import { normalizeRuntimeEvent } from '../runtime-events.mjs';

const PI_SDK_PACKAGE = '@earendil-works/pi-coding-agent';
const EVENT_LIMITS = Object.freeze({
  maxTextBytes: 4096,
  maxEventBytes: 64 * 1024,
});
const PROCESS_DEATH_OUTCOMES = new Set(['SIGNAL_DEATH', 'SPAWN_ERROR']);
const CANCELLATION_STATES = new Set(['CANCELLED', 'CANCELED']);
const FINAL_STATES = new Set(['COMPLETED', 'FINALIZED', 'FAILED', 'ERROR']);

function clone(value) {
  return structuredClone(value);
}

function freeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) freeze(child);
  return Object.freeze(value);
}

function requireAbsolute(value, name) {
  if (typeof value !== 'string' || value.length === 0 || !value.startsWith('/')) {
    throw new TypeError(`Pi SDK ${name} must be an absolute path`);
  }
}

function requireEnvironment(env) {
  if (!env || typeof env !== 'object' || Array.isArray(env)) {
    throw new TypeError('Pi SDK env must be an explicit object');
  }
  for (const [key, value] of Object.entries(env)) {
    if (key.length === 0 || typeof value !== 'string') {
      throw new TypeError('Pi SDK env keys and values must be strings');
    }
  }
}

function requireInventory(inventory) {
  if (!Array.isArray(inventory) || inventory.length === 0) {
    throw new TypeError('Pi SDK inventory must be a non-empty array');
  }
  const ids = new Set();
  for (const item of inventory) {
    if (!item || typeof item !== 'object' || !['resource', 'tool'].includes(item.kind) || typeof item.id !== 'string' || item.id.length === 0) {
      throw new TypeError('Pi SDK inventory entries require a unique id and resource/tool kind');
    }
    if (ids.has(item.id)) throw new TypeError(`Pi SDK inventory contains duplicate id: ${item.id}`);
    ids.add(item.id);
  }
}

function sessionFromFactoryResult(result) {
  if (result?.session && typeof result.session === 'object') return result.session;
  return result;
}

function sessionIdentity(session) {
  const id = session?.runtimeSessionId ?? session?.sessionId ?? session?.id ?? null;
  return { id: typeof id === 'string' ? id : null, observational: true };
}

function normalizeOutcome(raw) {
  const value = raw && typeof raw === 'object' ? raw : {};
  const status = typeof value.status === 'string' ? value.status.toUpperCase() : 'COMPLETED';
  if (CANCELLATION_STATES.has(status)) return { status: 'CANCELLED', outcome: 'CANCELLED', result: value.result ?? null };
  if (status === 'FAILED' || status === 'ERROR') return { status: 'FAILED', outcome: 'FAILED', result: value.result ?? null, error: value.error ?? null };
  return { status: 'COMPLETED', outcome: 'COMPLETED', result: value.result ?? value };
}

function factoryFor(sdk) {
  const factory = sdk?.createAgentSession ?? sdk?.createAgentSessionRuntime;
  if (typeof factory !== 'function') {
    throw new TypeError('Pi SDK must expose createAgentSession or createAgentSessionRuntime');
  }
  return factory;
}

export async function loadPiSdk() {
  return import(PI_SDK_PACKAGE);
}

export function createPiSdkAdapter({ sdk = null, cwd, env, inventory } = {}) {
  requireAbsolute(cwd, 'cwd');
  requireEnvironment(env);
  requireInventory(inventory);

  const configuredEnv = clone(env);
  const configuredInventory = clone(inventory);
  let loadedSdk = sdk;
  let session = null;
  let unsubscribe = () => {};
  let initialized = false;
  let closed = false;
  let activeTurn = null;
  let eventSequence = 0;
  let events = [];

  function snapshotEvents() {
    return events.map((event) => clone(event));
  }

  function recordEvent(input) {
    let event;
    try {
      event = normalizeRuntimeEvent(input, {
        sequence: ++eventSequence,
        maxTextBytes: EVENT_LIMITS.maxTextBytes,
        maxEventBytes: EVENT_LIMITS.maxEventBytes,
      });
    } catch (error) {
      if (activeTurn) activeTurn.settle({ status: 'FAILED', error: { message: error.message } });
      return null;
    }
    events.push(event);

    const data = event.data ?? {};
    const processDeath = event.type === 'process' && PROCESS_DEATH_OUTCOMES.has(data.outcome);
    const cancelled = event.type === 'lifecycle' && CANCELLATION_STATES.has(String(data.state ?? '').toUpperCase());
    const final = event.type === 'lifecycle' && FINAL_STATES.has(String(data.state ?? '').toUpperCase());
    if (activeTurn && processDeath) {
      activeTurn.settle({
        status: 'PROCESS_DEATH',
        outcome: 'PROCESS_DEATH',
        result: null,
        handoffRequired: true,
      });
    } else if (activeTurn && cancelled) {
      activeTurn.settle({ status: 'CANCELLED', outcome: 'CANCELLED', result: null });
    } else if (activeTurn && final && data.result !== undefined) {
      activeTurn.settle({ status: 'COMPLETED', outcome: 'COMPLETED', result: data.result });
    }
    return event;
  }

  function createReadyObservation() {
    return freeze({
      status: 'READY',
      cwd,
      envKeys: Object.keys(configuredEnv).sort(),
      inventory: clone(configuredInventory),
      discovery: { enabled: false },
      runtimeSession: sessionIdentity(session),
    });
  }

  function settleTurn(turn, raw = {}) {
    if (turn.settledValue) return turn.settledValue;
    const normalized = raw.outcome === 'PROCESS_DEATH'
      ? { status: 'PROCESS_DEATH', outcome: 'PROCESS_DEATH', result: null, handoffRequired: true }
      : normalizeOutcome(raw);
    turn.settledValue = freeze({
      settled: true,
      status: normalized.status,
      outcome: normalized.outcome,
      result: normalized.result,
      ...(normalized.error ? { error: normalized.error } : {}),
      handoffRequired: normalized.handoffRequired === true,
      runtimeSession: sessionIdentity(session),
      events: snapshotEvents(),
    });
    turn.resolve(turn.settledValue);
    return turn.settledValue;
  }

  function subscribeToSession() {
    if (typeof session?.subscribe === 'function') {
      unsubscribe = session.subscribe(recordEvent) ?? (() => {});
      return;
    }
    if (typeof session?.onEvent === 'function') {
      unsubscribe = session.onEvent(recordEvent) ?? (() => {});
      return;
    }
    throw new TypeError('Pi SDK session must expose structured event subscription');
  }

  async function initialize() {
    if (closed) throw new Error('Pi SDK adapter is closed');
    if (initialized) return createReadyObservation();
    loadedSdk ??= await loadPiSdk();
    const factory = factoryFor(loadedSdk);
    const tools = configuredInventory.filter(({ kind }) => kind === 'tool');
    const resources = configuredInventory.filter(({ kind }) => kind === 'resource');
    session = sessionFromFactoryResult(await factory({
      cwd,
      env: clone(configuredEnv),
      resources: clone(resources),
      tools: clone(tools),
      sessionManager: { persist: false },
      resourceLoader: { mode: 'explicit-inventory' },
      discovery: { enabled: false },
      allowAmbientDiscovery: false,
      extensions: [],
      mcpServers: [],
    }));
    if (!session || typeof session !== 'object') throw new TypeError('Pi SDK session factory returned no session');
    subscribeToSession();
    initialized = true;
    return createReadyObservation();
  }

  function startTurn(input) {
    if (!initialized) throw new Error('Pi SDK adapter must be initialized before starting a turn');
    if (closed) throw new Error('Pi SDK adapter is closed');
    if (activeTurn && !activeTurn.settledValue) throw new Error('Pi SDK adapter already has an active turn');
    const prompt = typeof input === 'string' ? input : input?.prompt;
    if (typeof prompt !== 'string' || prompt.length === 0) throw new TypeError('Pi SDK turn prompt is required');

    let resolve;
    const result = new Promise((promiseResolve) => { resolve = promiseResolve; });
    const turn = {
      resolve,
      result,
      settledValue: null,
      settle(value) {
        return settleTurn(turn, value);
      },
    };
    activeTurn = turn;

    const operation = typeof session.startTurn === 'function'
      ? session.startTurn({ prompt })
      : typeof session.sendPrompt === 'function'
        ? session.sendPrompt({ prompt })
        : null;
    if (!operation) {
      settleTurn(turn, { status: 'FAILED', error: { message: 'Pi SDK session must expose startTurn or sendPrompt' } });
    } else {
      Promise.resolve(operation)
        .then((value) => settleTurn(turn, value))
        .catch((error) => settleTurn(turn, { status: 'FAILED', error: { message: error?.message ?? String(error) } }));
    }
    return result;
  }

  async function cancel(reason = 'explicit cancellation') {
    if (!activeTurn || activeTurn.settledValue) {
      return freeze({ settled: true, status: 'CANCELLED', outcome: 'CANCELLED', result: null, handoffRequired: false, runtimeSession: sessionIdentity(session), events: snapshotEvents() });
    }
    if (typeof session.cancel === 'function') await session.cancel(reason);
    else if (typeof session.abort === 'function') await session.abort(reason);
    else throw new TypeError('Pi SDK session must expose cancel or abort');
    if (!activeTurn.settledValue) settleTurn(activeTurn, { status: 'CANCELLED', outcome: 'CANCELLED', result: null });
    return activeTurn.result;
  }

  function observe() {
    return freeze(snapshotEvents());
  }

  async function close() {
    if (closed) return;
    if (activeTurn && !activeTurn.settledValue) await cancel('adapter-close');
    closed = true;
    unsubscribe();
    if (typeof session?.close === 'function') await session.close();
  }

  return Object.freeze({ initialize, startTurn, observe, cancel, close });
}
