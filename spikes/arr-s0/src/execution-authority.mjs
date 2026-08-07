import { sha256Bytes } from './artifacts.mjs';

const SHA_PATTERN = /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/u;
const DIGEST_PATTERN = /^sha256:[a-f0-9]{64}$/u;
const GIT_BLOB_PATTERN = /^[a-f0-9]{40}$/u;
const TOKEN_PATTERN = /^MNFS_AUTHORIZE_ARR_S0_EXECUTE plan_blob=([a-f0-9]{40}) contract_sha256=(sha256:[a-f0-9]{64}) base_sha=((?:[a-f0-9]{40}|[a-f0-9]{64})) verify_run=([1-9][0-9]*) scope=canonical-host-probe-only$/u;

export const EXECUTION_AUTHORIZATION_ENV = 'MNFS_ARR_S0_EXECUTE_AUTHORIZATION';

export function buildExecutionAuthorizationToken({
  planGitBlob,
  contractHash,
  baseCommitSha,
  verificationRunId,
}) {
  if (!GIT_BLOB_PATTERN.test(planGitBlob ?? '')) throw new TypeError('ARR-S0 execution authorization plan blob is invalid');
  if (!DIGEST_PATTERN.test(contractHash ?? '')) throw new TypeError('ARR-S0 execution authorization contract hash is invalid');
  if (!SHA_PATTERN.test(baseCommitSha ?? '')) throw new TypeError('ARR-S0 execution authorization base commit is invalid');
  if (!Number.isSafeInteger(verificationRunId) || verificationRunId <= 0) {
    throw new TypeError('ARR-S0 execution authorization verification run is invalid');
  }
  return `MNFS_AUTHORIZE_ARR_S0_EXECUTE plan_blob=${planGitBlob} contract_sha256=${contractHash} base_sha=${baseCommitSha} verify_run=${verificationRunId} scope=canonical-host-probe-only`;
}

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
  if (baseCommitSha !== expected.baseCommitSha) {
    throw new TypeError('ARR-S0 execution authorization source commit does not match');
  }

  return {
    gate: 'GATE-S0-EXECUTE',
    baseCommitSha,
    contractHash,
    verificationRunId,
    tokenHash: sha256Bytes(Buffer.from(token, 'utf8')),
  };
}
