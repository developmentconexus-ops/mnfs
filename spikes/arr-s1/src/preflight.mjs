import path from 'node:path';

import {
  executionAuthorizationEvidence,
  requireValidatedExecutionAuthorization,
} from './execution-authority.mjs';

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

function observeValue(input, key) {
  const observer = input?.observers?.[key];
  if (typeof observer === 'function') return observer();
  return input?.[key];
}

function sourceCheck(source, authority) {
  const sourceCommit = source?.commitSha ?? source?.baseSha;
  const clean = source?.clean ?? source?.checkoutClean;
  const ok = clean === true
    && sourceCommit === authority.baseSha
    && typeof source?.treeSha === 'string'
    && source.treeSha.length > 0;
  return {
    ok,
    reason: ok ? null : 'source must be clean, Linux-observed and bound to the authorized base commit with an exact tree identity',
  };
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
    || stateRoot?.state === 'SUPPORTED'
    || (typeof filesystem === 'string' && filesystem.trim() !== '' && filesystem !== 'unknown');
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
  return input;
}

export function validateCandidateProvenance(input) {
  const observed = provenanceMap(input);
  const errors = [];
  for (const id of REQUIRED_PROVENANCE_IDS) {
    const expected = S1_FROZEN_CANDIDATE_PROVENANCE[id];
    const actual = observed[id];
    if (!actual || actual.version !== expected.version || actual.package !== expected.package || actual.sourceIdentity !== expected.sourceIdentity || actual.license !== expected.license) {
      errors.push(`${id} exact provenance is unavailable or mismatched`);
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
  return { ok: errors.length === 0, errors, records: safeClone(observed) };
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
  return {
    status: 'READY',
    credentials: { provider: provider.trim(), authMethodClass: authMethodClass.trim() },
  };
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
    source = await observeValue(input, 'source');
    stateRoot = await observeValue(input, 'stateRoot');
    provenance = (await observeValue(input, 'provenance')) ?? (await observeValue(input, 'candidateProvenance'));
    credentialsInput = await observeValue(input, 'credentials');
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
  const provenanceResult = validateCandidateProvenance(provenance);
  if (!provenanceResult.ok) blockers.push(blocked('candidateProvenance', provenanceResult.errors.join('; ')));

  let credentialResult;
  try {
    credentialResult = preflightCredentials(credentialsInput);
  } catch {
    credentialResult = { status: 'BLOCKED', reason: 'raw credential material is not accepted by deterministic preflight' };
  }
  if (credentialResult.status !== 'READY') blockers.push(blocked('credentials', credentialResult.reason));

  return {
    status: blockers.length === 0 ? 'READY' : 'BLOCKED',
    operationAllowed: blockers.length === 0,
    executionAuthorization: executionAuthorizationEvidence(authority),
    source: safeClone(source),
    stateRoot: safeClone(stateRoot),
    provenance: provenanceResult.ok ? provenanceResult.records : null,
    credentials: credentialResult.status === 'READY' ? credentialResult.credentials : null,
    blockers,
    remediation: 'NONE_AUTOMATIC',
  };
}

export const runS1Preflight = preflightS1;
