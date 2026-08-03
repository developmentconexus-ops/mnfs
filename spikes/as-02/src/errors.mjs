export const AS02_ERROR_CODES = Object.freeze([
  'INVALID_CANONICAL_VALUE',
  'INVALID_POLICY_PATH',
  'INVALID_POLICY_DOMAIN',
  'POLICY_HASH_MISMATCH',
  'INVALID_RUN_ID',
  'FIXTURE_PATH_ESCAPE',
  'FIXTURE_INTEGRITY_VIOLATION',
  'FIXTURE_ALREADY_EXISTS',
  'PROCESS_FAILED',
  'PROCESS_TIMEOUT',
  'GIT_METADATA_INVALID',
  'TREEHOUSE_INVALID_OUTPUT',
  'TREEHOUSE_UNAVAILABLE',
  'TREEHOUSE_RELEASE_FAILED',
  'TREEHOUSE_FORCE_FORBIDDEN',
  'EVIDENCE_INVALID',
  'EVIDENCE_SECRET_EXPOSURE',
  'DECISION_INVALID',
  'INVALID_COMMAND_ARGV',
  'SANDBOX_UNAVAILABLE',
  'SANDBOX_DESCRIPTOR_INVALID',
  'SANDBOX_CLEANUP_FAILED',
  'BROKER_OPERATION_INVALID',
  'BROKER_INPUT_TOO_LARGE',
  'BROKER_PATH_ESCAPE',
  'BROKER_PATH_NOT_FOUND',
  'BROKER_EDIT_MATCH_COUNT',
  'PI_EXTENSION_PATH_INVALID',
  'EXTENSION_CONFIG_INVALID',
  'EXTENSION_TRUST_BOUNDARY_INVALID',
  'EXTENSION_BROKER_FAILED',
  'EXTENSION_OUTPUT_REJECTED',
  'PREFLIGHT_INVALID',
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
