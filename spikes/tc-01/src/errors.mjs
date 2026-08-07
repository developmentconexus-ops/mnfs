export const TC01_ERROR_CODES = new Set([
  'TC01_INVALID_INPUT',
  'TC01_NOT_WSL2',
  'TC01_LINUX_FILESYSTEM_REQUIRED',
  'TC01_TOOL_MISSING',
  'TC01_VERSION_MISMATCH',
  'TC01_PROCESS_SPAWN_FAILED',
  'TC01_PROCESS_TIMEOUT',
  'TC01_OUTPUT_LIMIT',
  'TC01_COMMAND_FAILED',
  'TC01_TREEHOUSE_INVALID_OUTPUT',
  'TC01_FIXTURE_INVALID',
  'TC01_EVIDENCE_INVALID',
  'TC01_CLEANUP_BLOCKED',
]);

export function tc01Error(code, message, details = {}) {
  if (!TC01_ERROR_CODES.has(code)) {
    throw new TypeError(`Unknown TC-01 error code: ${code}`);
  }
  const error = new Error(message);
  error.name = 'Tc01Error';
  Object.defineProperties(error, {
    code: {
      value: code,
      enumerable: true,
      configurable: false,
      writable: false,
    },
    details: {
      value: details,
      enumerable: true,
      configurable: false,
      writable: false,
    },
  });
  return error;
}

export function assertTc01(condition, code, message, details = {}) {
  if (!condition) throw tc01Error(code, message, details);
}
