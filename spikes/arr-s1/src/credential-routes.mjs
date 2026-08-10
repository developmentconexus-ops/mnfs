import path from 'node:path';

function requireAbsolute(value, name) {
  if (typeof value !== 'string' || value.length === 0 || !path.posix.isAbsolute(value) || value.includes('\0')) {
    throw new TypeError(`${name} must be an absolute authorized path`);
  }
  return path.posix.normalize(value);
}

export function requirePiCredentialRoute(value) {
  return requireAbsolute(value, 'PI_CODING_AGENT_DIR');
}

export function requireOpenCodeDataRoute(value) {
  return requireAbsolute(value, 'XDG_DATA_HOME');
}

export function piCredentialRouteEvidence(value) {
  return Object.freeze({
    variable: 'PI_CODING_AGENT_DIR',
    path: requirePiCredentialRoute(value),
    class: 'PERSISTED_AGENT_AUTH_DIRECTORY',
    valueRecorded: false,
  });
}

export function openCodeCredentialRouteEvidence(value) {
  return Object.freeze({
    variable: 'XDG_DATA_HOME',
    path: requireOpenCodeDataRoute(value),
    class: 'PERSISTED_OPENCODE_AUTH_DATA_DIRECTORY',
    valueRecorded: false,
  });
}

export function providerEnvironmentClassEvidence(entries = []) {
  if (!Array.isArray(entries)) throw new TypeError('provider environment evidence must be an array');
  return Object.freeze(entries.map((entry) => {
    if (!entry || typeof entry !== 'object' || typeof entry.name !== 'string' || typeof entry.class !== 'string') {
      throw new TypeError('provider environment evidence requires name and class only');
    }
    return Object.freeze({ name: entry.name, class: entry.class, valueRecorded: false });
  }));
}
