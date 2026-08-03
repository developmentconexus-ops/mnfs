import { createHash } from 'node:crypto';

import { as02Error } from './errors.mjs';

function normalize(value, path) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw as02Error('INVALID_CANONICAL_VALUE', `Non-finite number at ${path}.`, { path });
    }
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((entry, index) => normalize(entry, `${path}[${index}]`));
  }

  if (typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
    const normalized = {};
    for (const key of Object.keys(value).sort()) {
      if (value[key] === undefined) {
        throw as02Error('INVALID_CANONICAL_VALUE', `Undefined value at ${path}.${key}.`, {
          path: `${path}.${key}`,
        });
      }
      normalized[key] = normalize(value[key], `${path}.${key}`);
    }
    return normalized;
  }

  throw as02Error('INVALID_CANONICAL_VALUE', `Unsupported canonical value at ${path}.`, {
    path,
    type: typeof value,
  });
}

export function canonicalJson(value) {
  return JSON.stringify(normalize(value, '$'));
}

export function sha256Text(text) {
  if (typeof text !== 'string') {
    throw as02Error('INVALID_CANONICAL_VALUE', 'SHA-256 input must be a string.', {
      type: typeof text,
    });
  }
  return `sha256:${createHash('sha256').update(text, 'utf8').digest('hex')}`;
}
