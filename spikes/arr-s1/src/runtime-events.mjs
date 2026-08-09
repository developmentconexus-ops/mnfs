import { createHash } from 'node:crypto';

const EVENT_TYPES = new Set(['lifecycle', 'tool_call', 'tool_result', 'assistant_output', 'error', 'process']);

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

function canonicalJson(value) {
  if (Array.isArray(value)) return value.map(canonicalJson);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalJson(value[key])]));
  return value;
}

function bytes(value) {
  return Buffer.from(JSON.stringify(value));
}

function boundedUtf8(value, limitBytes) {
  const original = Buffer.from(value, 'utf8');
  if (original.length <= limitBytes) return { value, truncated: false, bytesSeen: original.length };
  let end = Math.min(limitBytes, original.length);
  let preview = original.subarray(0, end).toString('utf8');
  while (Buffer.byteLength(preview) > limitBytes && end > 0) {
    end -= 1;
    preview = original.subarray(0, end).toString('utf8');
  }
  return { value: preview, truncated: true, bytesSeen: original.length };
}

function boundData(value, maxTextBytes, pathName, textPaths) {
  if (typeof value === 'string') {
    const bounded = boundedUtf8(value, maxTextBytes);
    if (!bounded.truncated) return value;
    textPaths.push(pathName);
    return { text: bounded.value, textTruncated: true, textBytesSeen: bounded.bytesSeen };
  }
  if (Array.isArray(value)) return value.map((item, index) => boundData(item, maxTextBytes, `${pathName}[${index}]`, textPaths));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, boundData(value[key], maxTextBytes, `${pathName}.${key}`, textPaths)]));
  }
  if (value === undefined || typeof value === 'function' || typeof value === 'symbol') throw new TypeError('runtime event data must be JSON-compatible');
  return value;
}

function compactEvent(base, originalBytes, maxEventBytes) {
  const digest = `sha256:${createHash('sha256').update(JSON.stringify(canonicalJson(base.data))).digest('hex')}`;
  const metadata = {
    event: true,
    textPaths: base.truncation.textPaths,
    originalBytes,
    digest,
  };
  let preview = JSON.stringify(canonicalJson(base.data));
  const minimal = { sequence: base.sequence, timestampMs: base.timestampMs, type: base.type, data: null, truncation: metadata };
  const available = Math.max(0, maxEventBytes - bytes({ ...minimal, data: { truncated: true, preview: '' } }).length);
  preview = Buffer.from(preview).subarray(0, available).toString('utf8');
  let compact = { ...minimal, data: { truncated: true, preview }, truncation: metadata };
  while (bytes(compact).length > maxEventBytes && preview.length > 0) {
    preview = preview.slice(0, -1);
    compact = { ...minimal, data: { truncated: true, preview }, truncation: metadata };
  }
  if (bytes(compact).length > maxEventBytes) {
    compact = { sequence: base.sequence, timestampMs: base.timestampMs, type: base.type, data: null, truncation: { event: true, textPaths: [] } };
  }
  return compact;
}

export function normalizeRuntimeEvent(input, { sequence, timestampMs = null, maxTextBytes = 4096, maxEventBytes = 64 * 1024 } = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new TypeError('runtime event must be a structured object');
  if (!EVENT_TYPES.has(input.type)) throw new TypeError(`unsupported runtime event type: ${input.type ?? '<missing>'}`);
  if (!Number.isSafeInteger(sequence) || sequence <= 0) throw new TypeError('runtime event sequence must be positive');
  if (!Number.isSafeInteger(maxTextBytes) || maxTextBytes < 0) throw new TypeError('runtime event maxTextBytes must be non-negative');
  if (!Number.isSafeInteger(maxEventBytes) || maxEventBytes < 64) throw new TypeError('runtime event maxEventBytes must be at least 64');
  const textPaths = [];
  const data = boundData(input.data ?? {}, maxTextBytes, 'data', textPaths);
  const event = {
    sequence,
    timestampMs: timestampMs === null ? null : timestampMs,
    type: input.type,
    data,
    truncation: { event: false, textPaths },
  };
  if (bytes(event).length <= maxEventBytes) return deepFreeze(event);
  return deepFreeze(compactEvent(event, bytes(event).length, maxEventBytes));
}

export function normalizeProcessObservation(observation, options = {}) {
  if (!observation || typeof observation !== 'object' || Array.isArray(observation)) throw new TypeError('process observation must be structured');
  const data = {
    status: observation.status ?? null,
    signal: observation.signal ?? null,
    exitCode: observation.exitCode ?? null,
    outcome: observation.outcome ?? null,
  };
  return normalizeRuntimeEvent({ type: 'process', data }, options);
}

export function createRuntimeEventRecorder({ maxEvents, maxEventBytes, maxTextBytes } = {}) {
  if (!Number.isSafeInteger(maxEvents) || maxEvents <= 0) throw new TypeError('runtime event maxEvents must be positive');
  if (!Number.isSafeInteger(maxEventBytes) || maxEventBytes < 64) throw new TypeError('runtime event maxEventBytes must be at least 64');
  if (!Number.isSafeInteger(maxTextBytes) || maxTextBytes < 0) throw new TypeError('runtime event maxTextBytes must be non-negative');
  const events = [];
  let eventCount = 0;
  let eventsDropped = 0;
  let eventBytesTruncated = 0;
  return {
    record(input) {
      eventCount += 1;
      const event = normalizeRuntimeEvent(input, {
        sequence: eventCount,
        maxEventBytes,
        maxTextBytes,
      });
      if (events.length >= maxEvents) {
        eventsDropped += 1;
        return null;
      }
      if (event.truncation.event) eventBytesTruncated += 1;
      events.push(event);
      return event;
    },
    snapshot() {
      return deepFreeze({
        events: [...events],
        eventCount,
        truncation: { eventsDropped, eventBytesTruncated },
      });
    },
  };
}
