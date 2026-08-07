import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildExecutionAuthorizationToken,
  validateExecutionAuthorization,
} from '../src/execution-authority.mjs';

const EXPECTED = {
  planGitBlob: '3e78445fcbcca360f612edefd025c6cb0f84f8e5',
  contractVersion: '1.0.0',
  contractHash: `sha256:${'c'.repeat(64)}`,
  baseCommitSha: 'a'.repeat(40),
  verificationRunId: 31214388675,
};

function validRecord() {
  return {
    schemaVersion: 1,
    gate: 'GATE-S0-EXECUTE',
    status: 'accepted',
    scope: 'canonical-host-probe-only',
    planGitBlob: EXPECTED.planGitBlob,
    contract: {
      version: EXPECTED.contractVersion,
      sha256: EXPECTED.contractHash,
    },
    source: {
      commitSha: EXPECTED.baseCommitSha,
    },
    verification: {
      commitSha: EXPECTED.baseCommitSha,
      workflowRunId: EXPECTED.verificationRunId,
      conclusion: 'SUCCESS',
    },
    operatorToken: buildExecutionAuthorizationToken(EXPECTED),
  };
}

test('accepts only an exact independently frozen GATE-S0-EXECUTE authorization', () => {
  const result = validateExecutionAuthorization(validRecord(), EXPECTED);
  assert.equal(result.gate, 'GATE-S0-EXECUTE');
  assert.equal(result.baseCommitSha, EXPECTED.baseCommitSha);
  assert.equal(result.contractHash, EXPECTED.contractHash);
  assert.equal(result.verificationRunId, EXPECTED.verificationRunId);
  assert.match(result.recordHashInput, /^GATE-S0-EXECUTE\u0000/u);
});

test('self-declared contract acceptance cannot substitute for execution authority', () => {
  for (const mutate of [
    (record) => { record.status = 'proposed'; },
    (record) => { record.gate = 'GATE-S0-IMPLEMENT'; },
    (record) => { record.scope = 'broader'; },
    (record) => { record.planGitBlob = 'b'.repeat(40); },
    (record) => { record.contract.sha256 = `sha256:${'d'.repeat(64)}`; },
    (record) => { record.source.commitSha = 'b'.repeat(40); },
    (record) => { record.verification.commitSha = 'b'.repeat(40); },
    (record) => { record.verification.workflowRunId += 1; },
    (record) => { record.verification.conclusion = 'FAILURE'; },
    (record) => { record.operatorToken += ' forged'; },
    (record) => { record.extra = true; },
  ]) {
    const record = validRecord();
    mutate(record);
    assert.throws(() => validateExecutionAuthorization(record, EXPECTED), /ARR-S0 execution authorization/u);
  }
});

test('execution authorization token binds plan, contract, base, verification and scope', () => {
  assert.equal(
    buildExecutionAuthorizationToken(EXPECTED),
    `MNFS_AUTHORIZE_ARR_S0_EXECUTE plan_blob=${EXPECTED.planGitBlob} contract_sha256=${EXPECTED.contractHash} base_sha=${EXPECTED.baseCommitSha} verify_run=${EXPECTED.verificationRunId} scope=canonical-host-probe-only`,
  );
});
