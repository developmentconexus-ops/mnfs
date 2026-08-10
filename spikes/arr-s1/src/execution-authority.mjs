import { createHash } from 'node:crypto';

const PLAN_BLOB_PATTERN = /^[a-f0-9]{40}$/u;
const COMMIT_PATTERN = /^[a-f0-9]{40}$/u;
const CONTRACT_HASH_PATTERN = /^sha256:[a-f0-9]{64}$/u;
const TOKEN_PATTERN = /^MNFS_AUTHORIZE_ARR_S1_EXECUTE plan_blob=([a-f0-9]{40}) contract_sha256=(sha256:[a-f0-9]{64}) base_sha=([a-f0-9]{40}) verify_run=([1-9][0-9]*) scope=(pi-first-runtime-conformance)$/u;

export const EXECUTION_AUTHORIZATION_ENV = 'MNFS_ARR_S1_EXECUTE_AUTHORIZATION';
export const S1_EXECUTION_AUTHORITY_BINDING = Object.freeze({
  gate: 'GATE-S1-EXECUTE',
  planBlob: '277dffc521754a4370bfd94132dc9467589fdcf0',
  contractSha256: 'sha256:bd34f566bec1c3fc32b8ab1617dac88f997ab9a91cbc6b83e42eb27dcbf9736a',
  scope: 'pi-first-runtime-conformance',
});

const VALIDATED_AUTHORITIES = new WeakSet();

function sha256(value) {
  return `sha256:${createHash('sha256').update(value).digest('hex')}`;
}

function expectedValue(expected, primary, alias) {
  if (expected && Object.hasOwn(expected, primary)) return expected[primary];
  if (expected && Object.hasOwn(expected, alias)) return expected[alias];
  return undefined;
}

function checkExpected(authority, expected = {}) {
  const checks = [
    ['planBlob', expectedValue(expected, 'planBlob', 'planGitBlob'), 'plan blob'],
    ['contractSha256', expectedValue(expected, 'contractSha256', 'contractHash'), 'contract hash'],
    ['baseSha', expectedValue(expected, 'baseSha', 'baseCommitSha'), 'source commit'],
    ['verifyRun', expectedValue(expected, 'verifyRun', 'verificationRunId'), 'verification run'],
    ['scope', expected.scope, 'scope'],
  ];
  for (const [field, expectedValueForField, label] of checks) {
    if (expectedValueForField !== undefined && authority[field] !== expectedValueForField) {
      throw new TypeError(`ARR-S1 execution authorization ${label} does not match`);
    }
  }
}

export function parseExecutionAuthorizationToken(token, expected = {}) {
  if (typeof token !== 'string') {
    throw new TypeError('ARR-S1 execution authorization token is required');
  }
  const match = token.match(TOKEN_PATTERN);
  if (!match) throw new TypeError('ARR-S1 execution authorization token is malformed');

  const [, planBlob, contractSha256, baseSha, rawVerifyRun] = match;
  const verifyRun = Number(rawVerifyRun);
  if (!Number.isSafeInteger(verifyRun) || verifyRun <= 0) {
    throw new TypeError('ARR-S1 execution authorization verification run is invalid');
  }

  const authority = Object.freeze({
    gate: 'GATE-S1-EXECUTE',
    planBlob,
    contractSha256,
    baseSha,
    verifyRun,
    scope: 'pi-first-runtime-conformance',
    tokenHash: sha256(token),
  });
  checkExpected(authority, S1_EXECUTION_AUTHORITY_BINDING);
  checkExpected(authority, expected);
  VALIDATED_AUTHORITIES.add(authority);
  return authority;
}

export const parseExecutionAuthority = parseExecutionAuthorizationToken;

export function requireValidatedExecutionAuthorization(authority, expected = {}) {
  if (!authority || typeof authority !== 'object' || !VALIDATED_AUTHORITIES.has(authority)) {
    throw new TypeError('ARR-S1 execution authorization must be validated by the exact-bound external authority parser');
  }
  if (authority.gate !== 'GATE-S1-EXECUTE') {
    throw new TypeError('ARR-S1 execution authorization gate must be GATE-S1-EXECUTE');
  }
  if (!PLAN_BLOB_PATTERN.test(authority.planBlob)
    || !CONTRACT_HASH_PATTERN.test(authority.contractSha256)
    || !COMMIT_PATTERN.test(authority.baseSha)
    || !Number.isSafeInteger(authority.verifyRun)
    || authority.verifyRun <= 0) {
    throw new TypeError('ARR-S1 execution authorization contains invalid bound identity');
  }
  checkExpected(authority, S1_EXECUTION_AUTHORITY_BINDING);
  checkExpected(authority, expected);
  return authority;
}

export const requireExecutionAuthority = requireValidatedExecutionAuthorization;

export function executionAuthorizationEvidence(authority) {
  requireValidatedExecutionAuthorization(authority);
  return {
    gate: authority.gate,
    planBlob: authority.planBlob,
    contractSha256: authority.contractSha256,
    baseSha: authority.baseSha,
    verifyRun: authority.verifyRun,
    scope: authority.scope,
    tokenHash: authority.tokenHash,
  };
}

export const executionAuthorityEvidence = executionAuthorizationEvidence;
