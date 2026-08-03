export const AS02_ERROR_CODES = Object.freeze([
  'INVALID_CANONICAL_VALUE',
  'INVALID_POLICY_PATH',
  'INVALID_POLICY_DOMAIN',
  'POLICY_HASH_MISMATCH',
]);

export class As02Error extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'As02Error';
    this.code = code;
    this.details = details;
  }
}

export function as02Error(code, message, details = {}) {
  return new As02Error(code, message, details);
}

export function assertAs02(condition, code, message, details = {}) {
  if (!condition) throw as02Error(code, message, details);
}
