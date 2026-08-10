import { normalizeRuntimeEvent, normalizeProcessObservation } from '../runtime-events.mjs';

export const ACP_PROTOCOL_VERSION = 1;

const STOP_REASONS = new Set([
  'end_turn',
  'max_tokens',
  'max_turn_requests',
  'refusal',
  'cancelled',
]);
const SESSION_UPDATE_TYPES = new Set([
  'user_message_chunk',
  'agent_message_chunk',
  'agent_thought_chunk',
  'tool_call',
  'tool_call_update',
  'plan',
  'plan_update',
  'plan_removed',
  'available_commands_update',
  'current_mode_update',
  'config_option_update',
  'session_info_update',
  'usage_update',
]);

function freeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) freeze(child);
  return Object.freeze(value);
}

function object(value, message) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError(message);
  return value;
}

function capabilityObject(value) {
  return object(value ?? {}, 'ACP handshake capabilities must be a structured object');
}

export function normalizeAcpHandshake(input) {
  const value = object(input, 'ACP handshake response must be a structured object');
  if (value.protocolVersion !== ACP_PROTOCOL_VERSION) {
    const error = new Error(`ACP protocol version mismatch: expected ${ACP_PROTOCOL_VERSION}, observed ${value.protocolVersion ?? '<missing>'}`);
    error.code = 'ACP_PROTOCOL_VERSION_MISMATCH';
    error.expectedVersion = ACP_PROTOCOL_VERSION;
    error.observedVersion = value.protocolVersion ?? null;
    throw error;
  }
  const authMethods = value.authMethods === undefined
    ? []
    : Array.isArray(value.authMethods)
      ? value.authMethods.map((method) => {
        const item = object(method, 'ACP auth method must be a structured object');
        const id = item.id ?? item.methodId;
        if (typeof id !== 'string' || id.length === 0) throw new TypeError('ACP auth method requires an id');
        return structuredClone({ ...item, id });
      })
      : (() => { throw new TypeError('ACP handshake authMethods must be an array'); })();
  return freeze({
    protocolVersion: ACP_PROTOCOL_VERSION,
    agentCapabilities: structuredClone(capabilityObject(value.agentCapabilities)),
    ...(value.authMethods !== undefined ? { authMethods } : {}),
  });
}

function textFromContent(content) {
  if (content && typeof content === 'object' && content.type === 'text' && typeof content.text === 'string') return content.text;
  throw new TypeError('ACP text update requires standard text content');
}

function notificationFrom(input) {
  const value = object(input, 'structured ACP event is required');
  if (value.kind === 'session_update') return object(value.notification, 'ACP session_update notification is required');
  if (value.method === 'session/update') return object(value.params, 'ACP session/update params are required');
  return value;
}

function commonIdentifiers(notification) {
  return typeof notification.sessionId === 'string' && notification.sessionId.length > 0
    ? { sessionId: notification.sessionId }
    : {};
}

function withoutProtocolFields(update) {
  const { sessionUpdate: _sessionUpdate, _meta: _meta, ...fields } = update;
  return structuredClone(fields);
}

function standardUpdateToRuntime(notification) {
  const update = object(notification.update, 'structured ACP event update is required');
  const kind = update.sessionUpdate;
  if (!SESSION_UPDATE_TYPES.has(kind)) throw new TypeError(`unsupported ACP session update: ${kind ?? '<missing>'}`);
  const identifiers = commonIdentifiers(notification);

  if (kind === 'agent_message_chunk' || kind === 'agent_thought_chunk') {
    return {
      type: 'assistant_output',
      data: {
        ...identifiers,
        channel: kind === 'agent_thought_chunk' ? 'thought' : 'answer',
        text: textFromContent(update.content),
      },
    };
  }
  if (kind === 'user_message_chunk') {
    return {
      type: 'lifecycle',
      data: { ...identifiers, state: 'USER_MESSAGE', text: textFromContent(update.content) },
    };
  }
  if (kind === 'tool_call') {
    if (typeof update.toolCallId !== 'string' || update.toolCallId.length === 0) throw new TypeError('ACP tool_call requires toolCallId');
    return {
      type: 'tool_call',
      data: {
        ...identifiers,
        toolCallId: update.toolCallId,
        ...(typeof update.title === 'string' ? { title: update.title } : {}),
        ...(typeof update.name === 'string' ? { name: update.name } : {}),
        ...(typeof update.kind === 'string' ? { kind: update.kind } : {}),
        ...(typeof update.status === 'string' ? { status: update.status } : {}),
        ...(update.rawInput !== undefined ? { input: structuredClone(update.rawInput) } : {}),
      },
    };
  }
  if (kind === 'tool_call_update') {
    if (typeof update.toolCallId !== 'string' || update.toolCallId.length === 0) throw new TypeError('ACP tool_call_update requires toolCallId');
    return {
      type: 'tool_result',
      data: {
        ...identifiers,
        toolCallId: update.toolCallId,
        ...(typeof update.status === 'string' ? { status: update.status } : {}),
        ...(update.content !== undefined ? { content: structuredClone(update.content) } : {}),
        ...(update.rawOutput !== undefined ? { result: structuredClone(update.rawOutput) } : {}),
      },
    };
  }
  if (kind === 'plan' || kind === 'plan_update' || kind === 'plan_removed') {
    return {
      type: 'lifecycle',
      data: { ...identifiers, state: kind.toUpperCase(), ...withoutProtocolFields(update) },
    };
  }
  return {
    type: 'lifecycle',
    data: { ...identifiers, state: kind.toUpperCase(), ...withoutProtocolFields(update) },
  };
}

export function normalizeAcpEvent(input, { sequence, timestampMs = null, maxTextBytes = 4096, maxEventBytes = 64 * 1024 } = {}) {
  return normalizeRuntimeEvent(standardUpdateToRuntime(notificationFrom(input)), {
    sequence,
    timestampMs,
    maxTextBytes,
    maxEventBytes,
  });
}

export function normalizeAcpPromptResponse(input) {
  const value = object(input, 'ACP PromptResponse must be a structured object');
  if (!STOP_REASONS.has(value.stopReason)) {
    throw new TypeError(`ACP PromptResponse requires a supported stopReason: ${value.stopReason ?? '<missing>'}`);
  }
  const cancelled = value.stopReason === 'cancelled';
  return {
    settled: true,
    status: cancelled ? 'CANCELLED' : 'COMPLETED',
    outcome: cancelled ? 'CANCELLED' : 'COMPLETED',
    stopReason: value.stopReason,
    result: structuredClone(value),
  };
}

export function normalizeAcpProcessObservation(input, options = {}) {
  return normalizeProcessObservation(input, options);
}
