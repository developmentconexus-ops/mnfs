import path from 'node:path';

import {
  executionAuthorizationEvidence,
  requireValidatedExecutionAuthorization,
} from './execution-authority.mjs';
import { observeRepositoryIdentity } from './probes/repository.mjs';
import { isReviewedFilesystem, observeLinuxStateRoot } from './probes/state-root.mjs';
import { observeStagedCandidateProvenance } from './probes/candidate-provenance.mjs';
import {
  openCodeCredentialRouteEvidence,
  piCredentialRouteEvidence,
  providerEnvironmentClassEvidence,
  requireCredentialRouteBinding,
} from './credential-routes.mjs';

const REQUIRED_PROVENANCE_IDS = Object.freeze(['PI-SDK', 'PI-RPC', 'PI-ACP', 'OPENCODE-ACP', 'ACP-SDK']);
const CONDITIONAL_PROVENANCE_IDS = Object.freeze(['SECOND-ACP']);
const SENSITIVE_KEYS = new Set([
  'token', 'accessToken', 'refreshToken', 'apiKey', 'api_key', 'clientSecret', 'client_secret',
  'cookie', 'cookies', 'credential', 'credentials', 'authorization', 'oauth', 'secret',
]);

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

export const S1_FROZEN_CANDIDATE_PROVENANCE = deepFreeze({
  'PI-SDK': {
    candidateShape: 'PI-SDK',
    version: '0.84.1',
    package: '@earendil-works/pi-coding-agent',
    sourceIdentity: '53fa77ccd8a279eb87e92294ef3687b03ff80112',
    license: 'MIT',
  },
  'PI-RPC': {
    candidateShape: 'PI-RPC',
    version: '0.84.1',
    package: '@earendil-works/pi-coding-agent',
    sourceIdentity: '53fa77ccd8a279eb87e92294ef3687b03ff80112',
    license: 'MIT',
  },
  'PI-ACP': {
    candidateShape: 'PI-ACP',
    version: '0.0.33',
    package: 'pi-acp',
    sourceIdentity: 'd1cffc047ab37a096ee70ca39cfc1de463db8d12',
    license: 'MIT',
  },
  'OPENCODE-ACP': {
    candidateShape: 'OPENCODE-ACP',
    version: '1.18.15',
    package: 'opencode',
    sourceIdentity: '325529761beb79a004de6d86e48b8db69cf4eba3',
    license: 'MIT',
  },
  'ACP-SDK': {
    candidateShape: 'ACP-SDK',
    version: '1.3.0',
    package: '@agentclientprotocol/sdk',
    sourceIdentity: 'e1054d0122e844cca9f1016a598a1da06f78ccef',
    license: 'Apache-2.0',
  },
  'SECOND-ACP': {
    candidateShape: 'SECOND-ACP',
    applicability: 'CONDITIONAL',
    status: 'NOT_REQUIRED',
  },
});

function blocked(id, reason) {
  return { id, reason };
}

function safeClone(value) {
  return value === undefined ? undefined : structuredClone(value);
}

function containsSensitiveKey(value, seen = new Set()) {
  if (!value || typeof value !== 'object' || seen.has(value)) return false;
  seen.add(value);
  for (const [key, child] of Object.entries(value)) {
    if (SENSITIVE_KEYS.has(key)) return true;
    if (containsSensitiveKey(child, seen)) return true;
  }
  return false;
}

function sourceCheck(source, authority) {
  const sourceCommit = source?.commitSha;
  const clean = source?.clean;
  const ok = clean === true
    && sourceCommit === authority.baseSha
    && /^[a-f0-9]{40}$/u.test(source?.treeSha ?? '');
  return {
    ok,
    reason: ok ? null : 'source must be clean, Linux-observed and bound to the authorized base commit with an exact tree identity',
  };
}

function canonicalSourceObservation(value) {
  if (!value || typeof value !== 'object') return value;
  const nested = value.source;
  return nested && typeof nested === 'object'
    ? { ...value, ...nested }
    : value;
}

function isLinuxOwnedAbsolute(value) {
  if (typeof value !== 'string' || !path.posix.isAbsolute(value)) return false;
  const normalized = path.posix.normalize(value);
  return normalized !== '/' && normalized !== '/mnt' && !normalized.startsWith('/mnt/');
}

function stateRootCheck(stateRoot) {
  const rootPath = stateRoot?.path ?? stateRoot?.observedPath;
  const realPath = stateRoot?.realPath ?? rootPath;
  const filesystem = stateRoot?.filesystem ?? stateRoot?.filesystemType;
  const filesystemReviewed = stateRoot?.filesystemSupported === true
    && typeof filesystem === 'string'
    && filesystem.trim() !== ''
    && isReviewedFilesystem(filesystem);
  const ok = (stateRoot?.platform ?? stateRoot?.hostPlatform) === 'linux'
    && isLinuxOwnedAbsolute(rootPath)
    && isLinuxOwnedAbsolute(realPath)
    && path.posix.normalize(rootPath) === path.posix.normalize(realPath)
    && (stateRoot?.isDirectory === true || stateRoot?.directory === true)
    && stateRoot?.writable === true
    && filesystemReviewed;
  return {
    ok,
    reason: ok ? null : 'state root must be a writable, non-symlink Linux path outside /mnt with an observed filesystem',
  };
}

function provenanceMap(input) {
  if (Array.isArray(input)) {
    return Object.fromEntries(input.filter((item) => item && typeof item.candidateShape === 'string').map((item) => [item.candidateShape, item]));
  }
  if (!input || typeof input !== 'object') return {};
  if (input.records && typeof input.records === 'object' && !Array.isArray(input.records)) return input.records;
  return input;
}

export function validateCandidateProvenance(input, { allowTestBoundary = false } = {}) {
  const trustedBoundary = input?.trustedBoundary;
  const boundaryAllowed = trustedBoundary === 'MNFS_TRUSTED_STAGING_V1'
    || (allowTestBoundary && trustedBoundary === 'TEST_FAITHFUL_STAGING');
  const observed = provenanceMap(input);
  const errors = [];
  if (!boundaryAllowed) errors.push('candidate provenance must come from the trusted staging boundary');
  if (!/^sha256:[a-f0-9]{64}$/u.test(input?.integrity?.manifestSha256 ?? '')) {
    errors.push('candidate staging manifest integrity is unavailable');
  }
  for (const id of REQUIRED_PROVENANCE_IDS) {
    const expected = S1_FROZEN_CANDIDATE_PROVENANCE[id];
    const actual = observed[id];
    if (!actual || actual.version !== expected.version || actual.package !== expected.package || actual.sourceIdentity !== expected.sourceIdentity || actual.license !== expected.license) {
      errors.push(`${id} exact provenance is unavailable or mismatched`);
    } else if (!allowTestBoundary && (!Array.isArray(actual.stagedPaths) || actual.stagedPaths.length === 0
      || !actual.upstreamSurfaces || typeof actual.upstreamSurfaces !== 'object'
      || Object.keys(actual.upstreamSurfaces).length === 0
      || Object.keys(actual.upstreamSurfaces).some((name) => ['adapter', 'boundary', 'proofDriver'].includes(name)))) {
      errors.push(`${id} upstream candidate byte surfaces are incomplete or contain MNFS-owned surfaces`);
    }
  }
  for (const id of CONDITIONAL_PROVENANCE_IDS) {
    const actual = observed[id];
    if (actual && actual.status !== 'NOT_REQUIRED' && (actual.version !== undefined || actual.sourceIdentity !== undefined)) {
      const expected = S1_FROZEN_CANDIDATE_PROVENANCE[id];
      if (actual.version !== expected.version || actual.sourceIdentity !== expected.sourceIdentity || actual.license !== expected.license) {
        errors.push(`${id} conditional provenance is mismatched`);
      }
    }
  }
  return { ok: errors.length === 0, errors, records: safeClone(observed), metadata: safeClone(input) };
}

export function preflightCredentials(input = {}) {
  if (containsSensitiveKey(input)) {
    throw new TypeError('ARR-S1 credential preflight refuses raw credential or secret fields');
  }
  const provider = input.provider ?? input.providerClass;
  const authMethodClass = input.authMethodClass ?? input.authMethod;
  if (input.authorized !== true || typeof provider !== 'string' || provider.trim() === '' || typeof authMethodClass !== 'string' || authMethodClass.trim() === '') {
    return { status: 'BLOCKED', reason: 'provider/auth-method class authorization prerequisite is unavailable' };
  }
  let piRoute;
  let openCodeRoute;
  try {
    piRoute = piCredentialRouteEvidence(input.piCodingAgentDir ?? input.routes?.piCodingAgentDir);
    openCodeRoute = openCodeCredentialRouteEvidence(input.xdgDataHome ?? input.routes?.xdgDataHome);
  } catch {
    return { status: 'BLOCKED', reason: 'explicit Pi and OpenCode credential routes are unavailable' };
  }
  return {
    status: 'READY',
    credentials: {
      provider: provider.trim(),
      authMethodClass: authMethodClass.trim(),
      routes: { pi: piRoute, openCode: openCodeRoute },
      providerEnvironment: providerEnvironmentClassEvidence(input.providerEnvironment ?? []),
    },
  };
}

export function resolveS1StateRootPath(input = {}) {
  const configured = typeof input.stateRootPath === 'string'
    ? input.stateRootPath
    : typeof input.stateRoot === 'string' ? input.stateRoot : null;
  if (configured) return configured;
  const env = input.env ?? process.env;
  const xdg = env?.XDG_STATE_HOME;
  if (typeof xdg === 'string' && path.posix.isAbsolute(xdg)) return path.posix.join(path.posix.normalize(xdg), 'mnfs');
  if (typeof env?.HOME === 'string' && path.posix.isAbsolute(env.HOME)) return path.posix.join(path.posix.normalize(env.HOME), '.local', 'state', 'mnfs');
  return null;
}

export async function preflightS1(input = {}) {
  let authority;
  try {
    authority = requireValidatedExecutionAuthorization(input.executionAuthorization);
  } catch (error) {
    return {
      status: 'BLOCKED',
      operationAllowed: false,
      executionAuthorization: null,
      source: null,
      stateRoot: null,
      provenance: null,
      credentials: null,
      blockers: [blocked('executionAuthority', 'external parser-validated GATE-S1-EXECUTE authority is required')],
    };
  }

  let source;
  let stateRoot;
  let provenance;
  let credentialsInput;
  try {
    const repoRoot = input.repoRoot ?? process.cwd();
    const stateRootPath = resolveS1StateRootPath(input);
    const observers = input.observers ?? {};
    source = canonicalSourceObservation(typeof observers.source === 'function'
      ? await observers.source({ repoRoot })
      : await observeRepositoryIdentity({ repoRoot }));
    stateRoot = typeof observers.stateRoot === 'function'
      ? await observers.stateRoot({ stateRoot: stateRootPath })
      : stateRootPath ? await observeLinuxStateRoot({ stateRoot: stateRootPath }) : null;
    const provenanceObserverInjected = typeof observers.provenance === 'function';
    provenance = provenanceObserverInjected
      ? await observers.provenance({ stateRoot: stateRoot?.path ?? stateRootPath })
      : stateRoot?.path ? await observeStagedCandidateProvenance({ stateRoot: stateRoot.path }) : null;
    credentialsInput = typeof observers.credentials === 'function'
      ? await observers.credentials()
      : input.credentials;
  } catch {
    return {
      status: 'BLOCKED',
      operationAllowed: false,
      executionAuthorization: executionAuthorizationEvidence(authority),
      source: null,
      stateRoot: null,
      provenance: null,
      credentials: null,
      blockers: [blocked('observers', 'deterministic preflight observer failed; no remediation was attempted')],
      remediation: 'NONE_AUTOMATIC',
    };
  }
  const blockers = [];

  const sourceResult = sourceCheck(source, authority);
  if (!sourceResult.ok) blockers.push(blocked('sourceCleanAndBound', sourceResult.reason));
  const stateResult = stateRootCheck(stateRoot);
  if (!stateResult.ok) blockers.push(blocked('linuxStateRoot', stateResult.reason));
  const provenanceResult = validateCandidateProvenance(provenance, {
    allowTestBoundary: typeof input.observers?.provenance === 'function',
  });
  if (!provenanceResult.ok) blockers.push(blocked('candidateProvenance', provenanceResult.errors.join('; ')));
  let credentialResult;
  try {
    credentialResult = preflightCredentials(credentialsInput);
  } catch {
    credentialResult = { status: 'BLOCKED', reason: 'raw credential material is not accepted by deterministic preflight' };
  }
  if (credentialResult.status !== 'READY') blockers.push(blocked('credentials', credentialResult.reason));
  if (credentialResult.status === 'READY' && provenanceResult.ok) {
    for (const candidateShape of ['PI-SDK', 'PI-RPC', 'PI-ACP', 'OPENCODE-ACP']) {
      try {
        const environment = provenanceResult.records?.[candidateShape]?.environment;
        requireCredentialRouteBinding({
          candidateShape,
          authorizedRoutes: credentialResult.credentials.routes,
          stagedEnvironment: environment,
          processEnvironment: environment,
        });
      } catch {
        blockers.push(blocked('credentialRoutes', `${candidateShape} credential route is not equal across authorized route and staged environment`));
      }
    }
  }

  return {
    status: blockers.length === 0 ? 'READY' : 'BLOCKED',
    operationAllowed: blockers.length === 0,
    executionAuthorization: executionAuthorizationEvidence(authority),
    source: sourceResult.ok ? safeClone(source) : null,
    stateRoot: stateResult.ok ? safeClone(stateRoot) : null,
    provenance: provenanceResult.ok
      ? { ...provenanceResult.metadata, records: provenanceResult.records }
      : null,
    credentials: credentialResult.status === 'READY' ? credentialResult.credentials : null,
    blockers,
    remediation: 'NONE_AUTOMATIC',
  };
}

export const runS1Preflight = preflightS1;
