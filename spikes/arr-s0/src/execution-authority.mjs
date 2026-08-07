import { sha256Bytes } from './artifacts.mjs';

const SHA_PATTERN = /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/u;
const DIGEST_PATTERN = /^sha256:[a-f0-9]{64}$/u;
const GIT_BLOB_PATTERN = /^[a-f0-9]{40}$/u;
const TOKEN_PATTERN = /^MNFS_AUTHORIZE_ARR_S0_EXECUTE plan_blob=([a-f0-9]{40}) contract_sha256=(sha256:[a-f0-9]{64}) base_sha=((?:[a-f0-9]{40}|[a-f0-9]{64})) verify_run=([1-9][0-9]*) scope=canonical-host-probe-only$/u;
const AUTHENTICATED_AUTHORITIES = new WeakSet();

export const EXECUTION_AUTHORIZATION_ENV = 'MNFS_ARR_S0_EXECUTE_AUTHORIZATION';

export function parseExecutionAuthorizationToken(token, expected) {
  if (typeof token !== 'string') {
    throw new TypeError('ARR-S0 execution authorization token is required');
  }
  const match = token.match(TOKEN_PATTERN);
  if (!match) throw new TypeError('ARR-S0 execution authorization token is malformed');

  const [, planGitBlob, contractHash, baseCommitSha, rawVerificationRunId] = match;
  const verificationRunId = Number(rawVerificationRunId);
  if (!Number.isSafeInteger(verificationRunId) || verificationRunId <= 0) {
    throw new TypeError('ARR-S0 execution authorization verification run is invalid');
  }
  if (planGitBlob !== expected.planGitBlob) {
    throw new TypeError('ARR-S0 execution authorization plan blob does not match');
  }
  if (contractHash !== expected.contractHash) {
    throw new TypeError('ARR-S0 execution authorization contract hash does not match');
  }
  if (expected.baseCommitSha !== undefined && baseCommitSha !== expected.baseCommitSha) {
    throw new TypeError('ARR-S0 execution authorization source commit does not match');
  }

  const authority = Object.freeze({
    gate: 'GATE-S0-EXECUTE',
    planGitBlob,
    baseCommitSha,
    contractHash,
    verificationRunId,
    tokenHash: sha256Bytes(Buffer.from(token, 'utf8')),
  });
  AUTHENTICATED_AUTHORITIES.add(authority);
  return authority;
}

export function requireAuthenticatedExecutionAuthorization(authority, expected = {}) {
  if (!authority || typeof authority !== 'object' || !AUTHENTICATED_AUTHORITIES.has(authority)) {
    throw new TypeError('ARR-S0 execution authorization must be authenticated by the exact Operator token parser');
  }
  if (authority.gate !== 'GATE-S0-EXECUTE') {
    throw new TypeError('ARR-S0 execution authorization gate must be GATE-S0-EXECUTE');
  }
  if (expected.planGitBlob !== undefined && authority.planGitBlob !== expected.planGitBlob) {
    throw new TypeError('ARR-S0 execution authorization plan blob does not match');
  }
  if (expected.contractHash !== undefined && authority.contractHash !== expected.contractHash) {
    throw new TypeError('ARR-S0 execution authorization contract hash does not match');
  }
  if (expected.baseCommitSha !== undefined && authority.baseCommitSha !== expected.baseCommitSha) {
    throw new TypeError('ARR-S0 execution authorization source commit does not match');
  }
  return authority;
}

export function executionAuthorizationEvidence(authority) {
  requireAuthenticatedExecutionAuthorization(authority);
  return {
    gate: authority.gate,
    planGitBlob: authority.planGitBlob,
    baseCommitSha: authority.baseCommitSha,
    contractHash: authority.contractHash,
    verificationRunId: authority.verificationRunId,
    tokenHash: authority.tokenHash,
  };
}
