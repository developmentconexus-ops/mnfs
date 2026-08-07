import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildExecutionAuthorizationToken,
  parseExecutionAuthorizationToken,
} from '../src/execution-authority.mjs';

const EXPECTED = {
  planGitBlob: '3e78445fcbcca360f612edefd025c6cb0f84f8e5',
  contractHash: `sha256:${'c'.repeat(64)}`,
  baseCommitSha: 'a'.repeat(40),
  verificationRunId: 31214388675,
};

const TOKEN = buildExecutionAuthorizationToken(EXPECTED);

test('accepts only an exact runtime GATE-S0-EXECUTE Operator token', () => {
  const result = parseExecutionAuthorizationToken(TOKEN, {
    planGitBlob: EXPECTED.planGitBlob,
    contractHash: EXPECTED.contractHash,
    baseCommitSha: EXPECTED.baseCommitSha,
  });
  assert.equal(result.gate, 'GATE-S0-EXECUTE');
  assert.equal(result.baseCommitSha, EXPECTED.baseCommitSha);
  assert.equal(result.contractHash, EXPECTED.contractHash);
  assert.equal(result.verificationRunId, EXPECTED.verificationRunId);
  assert.equal(result.operatorToken, TOKEN);
  assert.match(result.tokenHash, /^sha256:[a-f0-9]{64}$/u);
});

test('execution token is strict and cannot broaden or change its bound authority', () => {
  const expected = {
    planGitBlob: EXPECTED.planGitBlob,
    contractHash: EXPECTED.contractHash,
    baseCommitSha: EXPECTED.baseCommitSha,
  };
  for (const token of [
    '',
    TOKEN.replace('MNFS_AUTHORIZE_ARR_S0_EXECUTE', 'MNFS_AUTHORIZE_ARR_S0_IMPLEMENT'),
    TOKEN.replace(EXPECTED.planGitBlob, 'b'.repeat(40)),
    TOKEN.replace(EXPECTED.contractHash, `sha256:${'d'.repeat(64)}`),
    TOKEN.replace(EXPECTED.baseCommitSha, 'b'.repeat(40)),
    TOKEN.replace(`verify_run=${EXPECTED.verificationRunId}`, 'verify_run=0'),
    TOKEN.replace('scope=canonical-host-probe-only', 'scope=broader'),
    `${TOKEN} extra=true`,
  ]) {
    assert.throws(() => parseExecutionAuthorizationToken(token, expected), /ARR-S0 execution authorization/u);
  }
});

test('execution authorization token binds plan, contract, base, verification and scope', () => {
  assert.equal(
    TOKEN,
    `MNFS_AUTHORIZE_ARR_S0_EXECUTE plan_blob=${EXPECTED.planGitBlob} contract_sha256=${EXPECTED.contractHash} base_sha=${EXPECTED.baseCommitSha} verify_run=${EXPECTED.verificationRunId} scope=canonical-host-probe-only`,
  );
});
