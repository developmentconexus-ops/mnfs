import { createHash } from 'node:crypto';

const EXPECTED_TOOLS = ['bash', 'read', 'write', 'edit', 'grep', 'find', 'ls'];
const EXPECTED_ALLOW_WRITE = ['LEASED_WORKTREE', 'ATTEMPT_TEMP'];
const EXPECTED_DENY_READ = ['REAL_HOME', 'FAKE_HOME', 'WINDOWS_MOUNT', 'POLICY_ROOT', 'RUNTIME_ROOT'];
const EXPECTED_DENY_WRITE = [
  'WORKTREE_MNFS',
  'WORKTREE_PI',
  'WORKTREE_ENV',
  'WORKTREE_GIT',
  'POLICY_ROOT',
  'GIT_CONFIG',
  'GIT_HOOKS',
];
const EXPECTED_EVIDENCE = ['ACCEPTANCE-AS-02-LOCAL-PI-SANDBOX-WSL2'];
const SYMBOLIC_SCOPE = /^[A-Z][A-Z0-9_]*$/u;

function isObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function exactArray(actual, expected) {
  return Array.isArray(actual) && JSON.stringify(actual) === JSON.stringify(expected);
}

function validateScopes(actual, expected, label, errors) {
  if (!Array.isArray(actual) || actual.some((scope) => typeof scope !== 'string' || !SYMBOLIC_SCOPE.test(scope))) {
    errors.push(`${label} must contain symbolic scopes only.`);
    return;
  }
  if (!exactArray(actual, expected)) {
    errors.push(`${label} must equal the exact reviewed scopes.`);
  }
}

export function hashSecE1Bytes(bytes) {
  return `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
}

export function validateSecE1(value) {
  if (!isObject(value)) return ['SEC-E1 must be an object.'];

  const errors = [];
  const sandboxRuntime = isObject(value.sandboxRuntime) ? value.sandboxRuntime : {};
  const filesystem = isObject(value.filesystem) ? value.filesystem : {};
  const network = isObject(value.network) ? value.network : {};
  const credentials = isObject(value.credentials) ? value.credentials : {};
  const effects = isObject(value.effects) ? value.effects : {};
  const process = isObject(value.process) ? value.process : {};
  const hashing = isObject(value.hashing) ? value.hashing : {};

  if (value.schemaVersion !== 1) errors.push('schemaVersion must equal 1.');
  if (value.id !== 'SEC-E1') errors.push('id must equal SEC-E1.');
  if (value.environmentRef !== 'ENV-E1') errors.push('environmentRef must equal ENV-E1.');

  if (sandboxRuntime.package !== '@anthropic-ai/sandbox-runtime') errors.push('sandbox package mismatch.');
  if (sandboxRuntime.version !== '0.0.67') errors.push('sandbox version must equal 0.0.67.');
  if (sandboxRuntime.failClosed !== true) errors.push('sandbox must fail closed.');
  if (sandboxRuntime.weakerNestedSandbox !== false) errors.push('weaker nested sandbox must remain disabled.');
  if (sandboxRuntime.weakerNetworkIsolation !== false) errors.push('weaker network isolation must remain disabled.');

  if (!exactArray(value.tools, EXPECTED_TOOLS)) {
    errors.push('tools must equal the reviewed seven-tool inventory.');
  }

  validateScopes(filesystem.allowWriteScopes, EXPECTED_ALLOW_WRITE, 'allowWriteScopes', errors);
  validateScopes(filesystem.denyReadScopes, EXPECTED_DENY_READ, 'denyReadScopes', errors);
  validateScopes(filesystem.denyWriteScopes, EXPECTED_DENY_WRITE, 'denyWriteScopes', errors);
  if (filesystem.pathResolution !== 'ATTEMPT_BOUND_REALPATH') errors.push('pathResolution mismatch.');

  if (network.mode !== 'DENY_ALL') errors.push('network mode must equal DENY_ALL.');
  if (network.allowLocalBinding !== false) errors.push('local binding must remain denied.');
  if (!exactArray(network.allowUnixSockets, [])) errors.push('Unix socket allowlist must remain empty.');

  if (credentials.mode !== 'NONE') errors.push('credential mode must equal NONE.');
  if (effects.maximumClass !== 'X1' || effects.productionEffects !== false) {
    errors.push('effects must remain X1-or-lower and non-production.');
  }

  if (process.shell !== false) errors.push('shell must remain false.');
  if (process.inheritHostEnvironment !== false) errors.push('host environment inheritance must remain disabled.');
  if (process.childrenInheritRestrictions !== true) errors.push('child restrictions must propagate.');

  if (hashing.definitionHash !== 'SHA256_EXACT_UTF8_BYTES') errors.push('definition hashing contract mismatch.');
  if (hashing.effectivePolicyHash !== 'SHA256_COMPILED_RUN_POLICY') errors.push('effective hashing contract mismatch.');
  if (!exactArray(value.evidence, EXPECTED_EVIDENCE)) errors.push('accepted AS-02 evidence reference is required.');

  return errors;
}
