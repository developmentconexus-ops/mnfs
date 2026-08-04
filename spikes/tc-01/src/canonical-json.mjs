import { createHash } from 'node:crypto';

function compareCodeUnits(left, right) {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function serialize(value, ancestors) {
  if (value === null) return 'null';

  switch (typeof value) {
    case 'string':
      return JSON.stringify(value);
    case 'boolean':
      return value ? 'true' : 'false';
    case 'number':
      if (!Number.isFinite(value)) throw new TypeError('Canonical JSON does not support non-finite numbers.');
      return JSON.stringify(Object.is(value, -0) ? 0 : value);
    case 'undefined':
    case 'function':
    case 'symbol':
    case 'bigint':
      throw new TypeError(`Canonical JSON does not support ${typeof value} values.`);
    case 'object':
      break;
    default:
      throw new TypeError('Canonical JSON received an unsupported value.');
  }

  if (ancestors.has(value)) throw new TypeError('Canonical JSON does not support cyclic values.');
  ancestors.add(value);
  try {
    if (Array.isArray(value)) {
      const items = value.map((item) => serialize(item, ancestors));
      return `[${items.join(',')}]`;
    }

    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      throw new TypeError('Canonical JSON supports only plain objects and arrays.');
    }

    const keys = Object.keys(value).sort(compareCodeUnits);
    const entries = keys.map((key) => `${JSON.stringify(key)}:${serialize(value[key], ancestors)}`);
    return `{${entries.join(',')}}`;
  } finally {
    ancestors.delete(value);
  }
}

export function canonicalJson(value) {
  return serialize(value, new Set());
}

export function sha256Bytes(value) {
  let bytes;
  if (typeof value === 'string') {
    bytes = Buffer.from(value, 'utf8');
  } else if (Buffer.isBuffer(value) || value instanceof Uint8Array) {
    bytes = Buffer.from(value);
  } else {
    throw new TypeError('sha256Bytes requires a string, Buffer or Uint8Array.');
  }
  return `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
}
