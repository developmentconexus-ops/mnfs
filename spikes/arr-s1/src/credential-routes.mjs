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

function routeForCandidate(candidateShape, authorizedRoutes) {
  if (candidateShape === 'PI-SDK' || candidateShape === 'PI-RPC' || candidateShape === 'PI-ACP') {
    return {
      variable: 'PI_CODING_AGENT_DIR',
      evidence: authorizedRoutes?.pi,
      require: requirePiCredentialRoute,
    };
  }
  if (candidateShape === 'OPENCODE-ACP') {
    return {
      variable: 'XDG_DATA_HOME',
      evidence: authorizedRoutes?.openCode,
      require: requireOpenCodeDataRoute,
    };
  }
  return null;
}

export function requireCredentialRouteBinding({
  candidateShape,
  authorizedRoutes,
  stagedEnvironment,
  processEnvironment,
} = {}) {
  const route = routeForCandidate(candidateShape, authorizedRoutes);
  if (!route) throw new Error(`credential route binding is unavailable for ${candidateShape ?? '<missing>'}`);
  const authorized = route.require(route.evidence?.path);
  const staged = route.require(stagedEnvironment?.[route.variable]);
  const process = route.require(processEnvironment?.[route.variable]);
  if (authorized !== staged || authorized !== process) {
    throw new Error(`credential route binding mismatch for ${candidateShape}`);
  }
  return Object.freeze({
    candidateShape,
    variable: route.variable,
    path: authorized,
    class: route.evidence?.class,
    valueRecorded: false,
  });
}
