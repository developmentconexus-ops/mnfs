import { canonicalJsonBytes } from './canonical-json.mjs';
import { sha256Bytes } from './artifacts.mjs';

export const EXECUTION_AUTHORIZATION_RELATIVE_PATH = 'docs/acceptance/arr-s0-execution-authorization.json';

const SHA_PATTERN = /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/u;
const DIGEST_PATTERN = /^sha256:[a-f0-9]{64}$/u;
const GIT_BLOB_PATTERN = /^[a-f0-9]{40}$/u;
const VERSION_PATTERN = /^[0-9]+\.[0-9]+\.[0-9]+$/u;
const TOP_LEVEL_KEYS = Object.freeze([
  'schemaVersion',
  'gate',
  'status',
  'scope',
  'planGitBlob',
  'contract',
  'source',
  'verification',
  'operatorToken',
]);

function exactKeys(value, expected, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError(`ARR-S0 execution authorization ${label} must be an object`);
  }
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  if (actual.length !== wanted.length || actual.some((key, index) => key !== wanted[index])) {
    throw new TypeError(`ARR-S0 execution authorization ${label} has unexpected or missing fields`);
  }
}

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

export function validateExecutionAuthorization(record, expected) {
  exactKeys(record, TOP_LEVEL_KEYS, 'record');
  exactKeys(record.contract, ['version', 'sha256'], 'contract');
  exactKeys(record.source, ['commitSha'], 'source');
  exactKeys(record.verification, ['commitSha', 'workflowRunId', 'conclusion'], 'verification');

  if (record.schemaVersion !== 1) throw new TypeError('ARR-S0 execution authorization schemaVersion must be 1');
  if (record.gate !== 'GATE-S0-EXECUTE') throw new TypeError('ARR-S0 execution authorization gate must be GATE-S0-EXECUTE');
  if (record.status !== 'accepted') throw new TypeError('ARR-S0 execution authorization status must be accepted');
  if (record.scope !== 'canonical-host-probe-only') throw new TypeError('ARR-S0 execution authorization scope is invalid');
  if (!GIT_BLOB_PATTERN.test(record.planGitBlob ?? '') || record.planGitBlob !== expected.planGitBlob) {
    throw new TypeError('ARR-S0 execution authorization plan blob does not match');
  }
  if (!VERSION_PATTERN.test(record.contract.version ?? '') || record.contract.version !== expected.contractVersion) {
    throw new TypeError('ARR-S0 execution authorization contract version does not match');
  }
  if (!DIGEST_PATTERN.test(record.contract.sha256 ?? '') || record.contract.sha256 !== expected.contractHash) {
    throw new TypeError('ARR-S0 execution authorization contract hash does not match');
  }
  if (!SHA_PATTERN.test(record.source.commitSha ?? '') || record.source.commitSha !== expected.baseCommitSha) {
    throw new TypeError('ARR-S0 execution authorization source commit does not match');
  }
  if (record.verification.commitSha !== expected.baseCommitSha) {
    throw new TypeError('ARR-S0 execution authorization verification commit does not match');
  }
  if (!Number.isSafeInteger(record.verification.workflowRunId) || record.verification.workflowRunId !== expected.verificationRunId) {
    throw new TypeError('ARR-S0 execution authorization verification run does not match');
  }
  if (record.verification.conclusion !== 'SUCCESS') {
    throw new TypeError('ARR-S0 execution authorization verification conclusion must be SUCCESS');
  }

  const expectedToken = buildExecutionAuthorizationToken(expected);
  if (record.operatorToken !== expectedToken) {
    throw new TypeError('ARR-S0 execution authorization Operator token does not match exact authority');
  }

  const canonicalRecordHash = sha256Bytes(canonicalJsonBytes(record));
  return {
    gate: record.gate,
    baseCommitSha: record.source.commitSha,
    contractHash: record.contract.sha256,
    verificationRunId: record.verification.workflowRunId,
    operatorToken: record.operatorToken,
    recordHash: canonicalRecordHash,
    recordHashInput: `${record.gate}\u0000${canonicalRecordHash}`,
  };
}
