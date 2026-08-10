import { normalizeRuntimeEvent } from '../runtime-events.mjs';

const PI_SDK_PACKAGE = '@earendil-works/pi-coding-agent';
const EVENT_LIMITS = Object.freeze({
  maxTextBytes: 4096,
  maxEventBytes: 64 * 1024,
});
const PI_SESSION_EVENT_TYPES = new Set([
  'agent_start',
  'agent_end',
  'agent_settled',
  'turn_start',
  'turn_end',
  'message_start',
  'message_update',
  'message_end',
  'tool_execution_start',
  'tool_execution_update',
  'tool_execution_end',
  'queue_update',
  'compaction_start',
  'compaction_end',
  'auto_retry_start',
  'auto_retry_end',
  'summarization_retry_scheduled',
  'summarization_retry_attempt_start',
  'summarization_retry_finished',
  'entry_appended',
  'session_info_changed',
  'thinking_level_changed',
  'bash_execution_update',
]);

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

function requireStringArray(value, name) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string' || item.length === 0)) {
    throw new TypeError(`Pi SDK ${name} must be an array of non-empty strings`);
  }
}

function requireResourceLoaderSurface(resourceLoader) {
  if (!resourceLoader || typeof resourceLoader !== 'object') {
    throw new TypeError('Pi SDK resourceLoader must be an explicit public ResourceLoader');
  }
  for (const method of [
    'getExtensions',
    'getSkills',
    'getPrompts',
    'getThemes',
    'getAgentsFiles',
    'getSystemPrompt',
    'getSystemPromptSource',
    'getAppendSystemPrompt',
    'getAppendSystemPromptSources',
    'extendResources',
    'reload',
  ]) {
    if (typeof resourceLoader[method] !== 'function') {
      throw new TypeError(`Pi SDK resourceLoader must expose ${method}`);
    }
  }
}

function requireEmptyResourceCollection(resourceLoader, method, property, label) {
  const result = resourceLoader[method]();
  if (!Array.isArray(result?.[property])) {
    throw new TypeError(`Pi SDK resourceLoader ${method} must return ${property}`);
  }
  if (result[property].length !== 0) {
    throw new Error(`Pi SDK ambient ${label} discovery is not allowed`);
  }
}

function assertControlledResourceLoader(resourceLoader) {
  requireEmptyResourceCollection(resourceLoader, 'getExtensions', 'extensions', 'extensions');
  requireEmptyResourceCollection(resourceLoader, 'getSkills', 'skills', 'skills');
  requireEmptyResourceCollection(resourceLoader, 'getPrompts', 'prompts', 'prompts');
  requireEmptyResourceCollection(resourceLoader, 'getThemes', 'themes', 'themes');
  requireEmptyResourceCollection(resourceLoader, 'getAgentsFiles', 'agentsFiles', 'context');
  return {
    controlled: true,
    extensions: clone(resourceLoader.getExtensions().extensions),
    skills: clone(resourceLoader.getSkills().skills),
    prompts: clone(resourceLoader.getPrompts().prompts),
    themes: clone(resourceLoader.getThemes().themes),
    agentsFiles: clone(resourceLoader.getAgentsFiles().agentsFiles),
    source: 'MNFS_TRUSTED_PI_RESOURCE_LOADER_OBSERVATION',
  };
}

function buildControlledResourceLoader(sdk, cwd) {
  const ResourceLoader = sdk?.DefaultResourceLoader;
  const SettingsManager = sdk?.SettingsManager;
  if (typeof ResourceLoader !== 'function' || typeof SettingsManager?.inMemory !== 'function') {
    throw new TypeError('Pi SDK requires public DefaultResourceLoader, SettingsManager and SessionManager APIs');
  }
  const settingsManager = SettingsManager.inMemory();
  const resourceLoader = new ResourceLoader({
    cwd,
    agentDir: cwd,
    settingsManager,
    noExtensions: true,
    noSkills: true,
    noPromptTemplates: true,
    noThemes: true,
    noContextFiles: true,
  });
  requireResourceLoaderSurface(resourceLoader);
  return resourceLoader;
}

function buildInMemorySessionManager(sdk, cwd) {
  const SessionManager = sdk?.SessionManager;
  if (typeof SessionManager?.inMemory !== 'function') {
    throw new TypeError('Pi SDK requires public DefaultResourceLoader, SettingsManager and SessionManager APIs');
  }
  return SessionManager.inMemory(cwd);
}

function sessionFromFactoryResult(result) {
  if (result?.session && typeof result.session === 'object') return result.session;
  return result;
}

function sessionIdentity(session) {
  const id = session?.sessionId;
  return { id: typeof id === 'string' ? id : null, observational: true };
}

function requireSessionEvent(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new TypeError('Pi AgentSession event must be a structured object');
  }
  if (!PI_SESSION_EVENT_TYPES.has(input.type)) {
    throw new TypeError(`unsupported Pi AgentSession event: ${input.type ?? '<missing>'}`);
  }
  return input;
}

function messageRole(message) {
  return typeof message?.role === 'string' ? message.role : null;
}

function piEventToRuntime(input) {
  const event = requireSessionEvent(input);
  switch (event.type) {
    case 'agent_start':
      return { type: 'lifecycle', data: { state: 'STARTED' } };
    case 'agent_end':
      return {
        type: 'lifecycle',
        data: { state: 'FINAL', willRetry: event.willRetry === true },
      };
    case 'agent_settled':
      return { type: 'lifecycle', data: { state: 'SETTLED' } };
    case 'turn_start':
      return { type: 'lifecycle', data: { state: 'TURN_STARTED' } };
    case 'turn_end':
      return { type: 'lifecycle', data: { state: 'TURN_ENDED', role: messageRole(event.message) } };
    case 'message_start':
      return { type: 'lifecycle', data: { state: 'MESSAGE_STARTED', role: messageRole(event.message) } };
    case 'message_end':
      return { type: 'lifecycle', data: { state: 'MESSAGE_ENDED', role: messageRole(event.message) } };
    case 'message_update': {
      const update = event.assistantMessageEvent;
      if (!update || typeof update !== 'object') throw new TypeError('Pi message_update requires assistantMessageEvent');
      if (update.type === 'text_delta' || update.type === 'thinking_delta') {
        return {
          type: 'assistant_output',
          data: {
            channel: update.type === 'thinking_delta' ? 'thought' : 'answer',
            text: update.delta,
          },
        };
      }
      return {
        type: 'lifecycle',
        data: {
          state: 'MESSAGE_UPDATED',
          eventType: update.type,
          ...(Number.isSafeInteger(update.contentIndex) ? { contentIndex: update.contentIndex } : {}),
        },
      };
    }
    case 'tool_execution_start':
      return {
        type: 'tool_call',
        data: {
          toolCallId: event.toolCallId,
          toolName: event.toolName,
          input: clone(event.args),
        },
      };
    case 'tool_execution_update':
      return {
        type: 'tool_result',
        data: {
          toolCallId: event.toolCallId,
          toolName: event.toolName,
          partialResult: clone(event.partialResult),
        },
      };
    case 'tool_execution_end':
      return {
        type: 'tool_result',
        data: {
          toolCallId: event.toolCallId,
          toolName: event.toolName,
          result: clone(event.result),
          isError: event.isError === true,
        },
      };
    case 'queue_update':
      return {
        type: 'lifecycle',
        data: {
          state: 'QUEUE_UPDATED',
          steering: Array.isArray(event.steering) ? event.steering.length : 0,
          followUp: Array.isArray(event.followUp) ? event.followUp.length : 0,
        },
      };
    case 'compaction_start':
    case 'compaction_end':
    case 'auto_retry_start':
    case 'auto_retry_end':
    case 'summarization_retry_scheduled':
    case 'summarization_retry_attempt_start':
    case 'summarization_retry_finished':
    case 'entry_appended':
    case 'session_info_changed':
    case 'thinking_level_changed':
    case 'bash_execution_update':
      return { type: 'lifecycle', data: { state: event.type.toUpperCase() } };
    default:
      throw new TypeError(`unsupported Pi AgentSession event: ${event.type}`);
  }
}

export function normalizePiEvent(input, { sequence, timestampMs = null, maxTextBytes = EVENT_LIMITS.maxTextBytes, maxEventBytes = EVENT_LIMITS.maxEventBytes } = {}) {
  return normalizeRuntimeEvent(piEventToRuntime(input), {
    sequence,
    timestampMs,
    maxTextBytes,
    maxEventBytes,
  });
}

function factoryFor(sdk) {
  if (typeof sdk?.createAgentSession !== 'function') {
    throw new TypeError('Pi SDK must expose createAgentSession');
  }
  return sdk.createAgentSession.bind(sdk);
}

export async function loadPiSdk() {
  return import(PI_SDK_PACKAGE);
}

export function createPiSdkAdapter({
  sdk = null,
  cwd,
  env,
  inventory,
  tools,
  noTools,
  customTools,
  resourceLoader,
  sessionManager,
} = {}) {
  requireAbsolute(cwd, 'cwd');
  if (env !== undefined) throw new TypeError('Pi SDK adapter does not control environment; use the process boundary');
  if (inventory !== undefined) throw new TypeError('Pi SDK adapter uses tools/resourceLoader surfaces, not an inventory option');
  if (tools !== undefined) requireStringArray(tools, 'tools');
  if (noTools !== undefined && noTools !== 'all' && noTools !== 'builtin') {
    throw new TypeError('Pi SDK noTools must be "all" or "builtin"');
  }
  if (customTools !== undefined && !Array.isArray(customTools)) {
    throw new TypeError('Pi SDK customTools must be an array');
  }
  if (resourceLoader !== undefined && (typeof resourceLoader !== 'object' || resourceLoader === null)) {
    throw new TypeError('Pi SDK resourceLoader must be an object');
  }
  if (sessionManager !== undefined && (typeof sessionManager !== 'object' || sessionManager === null)) {
    throw new TypeError('Pi SDK sessionManager must be an object');
  }

  let loadedSdk = sdk;
  let session = null;
  let unsubscribe = () => {};
  let initialized = false;
  let closed = false;
  let activeTurn = null;
  let eventSequence = 0;
  let events = [];
  let rawEvents = [];
  let discovery = null;

  function snapshotEvents() {
    return events.map((event) => clone(event));
  }

  function settleTurn(turn, raw = {}) {
    if (turn.settledValue) return turn.settledValue;
    const cancelled = raw.outcome === 'CANCELLED';
    const settled = {
      settled: true,
      status: cancelled ? 'CANCELLED' : raw.status ?? 'COMPLETED',
      outcome: cancelled ? 'CANCELLED' : raw.outcome ?? 'COMPLETED',
      result: raw.result ?? null,
      runtimeSession: sessionIdentity(session),
      discovery: clone(discovery),
      events: snapshotEvents(),
    };
    if (raw.error) settled.error = clone(raw.error);
    turn.settledValue = freeze(settled);
    turn.resolve(turn.settledValue);
    return turn.settledValue;
  }

  function recordEvent(input) {
    rawEvents.push(clone(input));
    try {
      const event = normalizePiEvent(input, {
        sequence: ++eventSequence,
        maxTextBytes: EVENT_LIMITS.maxTextBytes,
        maxEventBytes: EVENT_LIMITS.maxEventBytes,
      });
      events.push(event);
      if (activeTurn && input.type === 'agent_end' && input.willRetry !== true) {
        settleTurn(activeTurn, activeTurn.cancelRequested
          ? { status: 'CANCELLED', outcome: 'CANCELLED' }
          : { status: 'COMPLETED', outcome: 'COMPLETED' });
      }
      return event;
    } catch (error) {
      if (activeTurn) settleTurn(activeTurn, {
        status: 'FAILED',
        outcome: 'FAILED',
        error: { message: error?.message ?? String(error) },
      });
      return null;
    }
  }

  function sessionOptions(overrides = {}) {
    return {
      cwd,
      ...(tools !== undefined ? { tools: [...tools] } : {}),
      ...(noTools !== undefined ? { noTools } : {}),
      ...(customTools !== undefined ? { customTools } : {}),
      resourceLoader: overrides.resourceLoader ?? resourceLoader,
      sessionManager: overrides.sessionManager ?? sessionManager,
    };
  }

  function createReadyObservation() {
    return freeze({
      status: 'READY',
      cwd,
      runtimeSession: sessionIdentity(session),
    });
  }

  function subscribeToSession() {
    if (typeof session?.subscribe !== 'function') {
      throw new TypeError('Pi SDK session must expose subscribe');
    }
    unsubscribe = session.subscribe(recordEvent) ?? (() => {});
    if (typeof unsubscribe !== 'function') throw new TypeError('Pi SDK session subscribe must return an unsubscribe function');
  }

  async function initialize() {
    if (closed) throw new Error('Pi SDK adapter is closed');
    if (initialized) return createReadyObservation();
    loadedSdk ??= await loadPiSdk();
    const controlledResourceLoader = resourceLoader ?? buildControlledResourceLoader(loadedSdk, cwd);
    const controlledSessionManager = sessionManager ?? buildInMemorySessionManager(loadedSdk, cwd);
    requireResourceLoaderSurface(controlledResourceLoader);
    await controlledResourceLoader.reload();
    discovery = assertControlledResourceLoader(controlledResourceLoader);
    const sessionResult = await factoryFor(loadedSdk)(sessionOptions({
      resourceLoader: controlledResourceLoader,
      sessionManager: controlledSessionManager,
    }));
    session = sessionFromFactoryResult(sessionResult);
    if (!session || typeof session !== 'object') throw new TypeError('Pi SDK createAgentSession returned no session');
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
      cancelRequested: false,
    };
    activeTurn = turn;

    if (typeof session.prompt !== 'function') {
      settleTurn(turn, { status: 'FAILED', outcome: 'FAILED', error: { message: 'Pi SDK session must expose prompt' } });
      return result;
    }
    Promise.resolve()
      .then(() => session.prompt(prompt))
      .then((value) => settleTurn(turn, { status: 'COMPLETED', outcome: 'COMPLETED', result: value ?? null }))
      .catch((error) => settleTurn(turn, {
        status: 'FAILED',
        outcome: 'FAILED',
        error: { message: error?.message ?? String(error) },
      }));
    return result;
  }

  async function cancel() {
    if (!activeTurn || activeTurn.settledValue) {
      return freeze({
        settled: true,
        status: 'CANCELLED',
        outcome: 'CANCELLED',
        result: null,
        runtimeSession: sessionIdentity(session),
        events: snapshotEvents(),
      });
    }
    if (typeof session.abort !== 'function') throw new TypeError('Pi SDK session must expose abort');
    activeTurn.cancelRequested = true;
    await session.abort();
    if (!activeTurn.settledValue) settleTurn(activeTurn, { status: 'CANCELLED', outcome: 'CANCELLED' });
    return activeTurn.result;
  }

  function observe() {
    return freeze(snapshotEvents());
  }

  function observeRaw() {
    return freeze(rawEvents.map((event) => clone(event)));
  }

  function observeDiscovery() {
    return freeze(clone(discovery));
  }

  async function close() {
    if (closed) return;
    if (activeTurn && !activeTurn.settledValue) await cancel();
    closed = true;
    unsubscribe();
    if (typeof session?.dispose !== 'function') throw new TypeError('Pi SDK session must expose dispose');
    session.dispose();
  }

  return Object.freeze({ initialize, startTurn, observe, observeRaw, observeDiscovery, cancel, close });
}
