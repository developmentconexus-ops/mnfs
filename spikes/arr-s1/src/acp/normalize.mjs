import { normalizeRuntimeEvent, normalizeProcessObservation } from '../runtime-events.mjs';

export const ACP_PROTOCOL_VERSION = 1;

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
  return freeze({
    protocolVersion: ACP_PROTOCOL_VERSION,
    agentCapabilities: structuredClone(value.agentCapabilities ?? value.serverCapabilities ?? {}),
  });
}

function commonIdentifiers(params) {
  return Object.fromEntries([
    ['sessionId', params.sessionId],
    ['taskId', params.taskId],
  ].filter(([, value]) => typeof value === 'string' && value.length > 0));
}

function textFromContent(content) {
  if (typeof content === 'string') return content;
  if (content && typeof content === 'object' && content.type === 'text' && typeof content.text === 'string') return content.text;
  throw new TypeError('ACP text update requires standard text content');
}

function standardUpdateToRuntime(params) {
  const update = object(params.update, 'structured ACP event update is required');
  const kind = update.sessionUpdate;
  const identifiers = commonIdentifiers(params);
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
  if (kind === 'tool_call') {
    if (typeof update.toolCallId !== 'string' || update.toolCallId.length === 0) throw new TypeError('ACP tool_call requires toolCallId');
    return {
      type: 'tool_call',
      data: {
        ...identifiers,
        toolCallId: update.toolCallId,
        ...(typeof update.title === 'string' ? { title: update.title } : {}),
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
      },
    };
  }
  if (kind === 'plan') {
    return { type: 'lifecycle', data: { ...identifiers, state: 'PLAN', entries: structuredClone(update.entries ?? []) } };
  }
  if (kind === 'turn_complete' || kind === 'task_complete') {
    return {
      type: 'lifecycle',
      data: {
        ...identifiers,
        state: 'FINAL',
        ...(typeof update.stopReason === 'string' ? { stopReason: update.stopReason } : {}),
      },
    };
  }
  throw new TypeError(`unsupported ACP session update: ${kind ?? '<missing>'}`);
}

export function normalizeAcpEvent(input, { sequence, timestampMs = null, maxTextBytes = 4096, maxEventBytes = 64 * 1024 } = {}) {
  const value = object(input, 'structured ACP event is required');
  if (value.method !== 'session/update') throw new TypeError('structured ACP event method is unsupported');
  const params = object(value.params, 'structured ACP event params are required');
  const runtime = standardUpdateToRuntime(params);
  return normalizeRuntimeEvent(runtime, { sequence, timestampMs, maxTextBytes, maxEventBytes });
}

export function normalizeAcpResult(input) {
  const value = object(input, 'ACP task result must be a structured object');
  const status = String(value.status ?? '').toUpperCase();
  if (!['COMPLETED', 'FAILED', 'CANCELLED', 'CANCELED'].includes(status)) {
    throw new TypeError(`unsupported ACP task result status: ${value.status ?? '<missing>'}`);
  }
  if (status === 'CANCELLED' || status === 'CANCELED') {
    return { settled: true, status: 'CANCELLED', outcome: 'CANCELLED', result: value.result ?? null };
  }
  if (status === 'FAILED') {
    return { settled: true, status: 'FAILED', outcome: 'FAILED', result: value.result ?? null, error: value.error ?? null };
  }
  return { settled: true, status: 'COMPLETED', outcome: 'COMPLETED', result: value.result ?? null };
}

export function normalizeAcpProcessObservation(input, options = {}) {
  return normalizeProcessObservation(input, options);
}
