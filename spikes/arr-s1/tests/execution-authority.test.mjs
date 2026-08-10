import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';

import {
  EXECUTION_AUTHORIZATION_ENV,
  executionAuthorizationEvidence,
  parseExecutionAuthorizationToken,
  requireValidatedExecutionAuthorization,
} from '../src/execution-authority.mjs';

const PLAN_BLOB = '277dffc521754a4370bfd94132dc9467589fdcf0';
const CONTRACT_HASH = 'sha256:bd34f566bec1c3fc32b8ab1617dac88f997ab9a91cbc6b83e42eb27dcbf9736a';
const BASE_SHA = 'a'.repeat(40);
const VERIFY_RUN = '987654321';
const SCOPE = 'pi-first-runtime-conformance';
const TOKEN = `MNFS_AUTHORIZE_ARR_S1_EXECUTE plan_blob=${PLAN_BLOB} contract_sha256=${CONTRACT_HASH} base_sha=${BASE_SHA} verify_run=${VERIFY_RUN} scope=${SCOPE}`;

test('accepts only the exact externally supplied S1 authority and retains no raw token', () => {
  const authority = parseExecutionAuthorizationToken(TOKEN);

  assert.equal(authority.gate, 'GATE-S1-EXECUTE');
  assert.equal(authority.planBlob, PLAN_BLOB);
  assert.equal(authority.contractSha256, CONTRACT_HASH);
  assert.equal(authority.baseSha, BASE_SHA);
  assert.equal(authority.verifyRun, Number(VERIFY_RUN));
  assert.equal(authority.scope, SCOPE);
  assert.equal(authority.tokenHash, `sha256:${createHash('sha256').update(TOKEN).digest('hex')}`);
  assert.equal(Object.hasOwn(authority, 'token'), false);
  assert.equal(Object.hasOwn(authority, 'operatorToken'), false);
  assert.equal(EXECUTION_AUTHORIZATION_ENV, 'MNFS_ARR_S1_EXECUTE_AUTHORIZATION');
  assert.equal(requireValidatedExecutionAuthorization(authority), authority);
});

test('rejects malformed, broadened, stale or reordered S1 authority', () => {
  for (const token of [
    '',
    TOKEN.replace('MNFS_AUTHORIZE_ARR_S1_EXECUTE', 'MNFS_AUTHORIZE_ARR_S1_IMPLEMENT'),
    TOKEN.replace(PLAN_BLOB, 'a'.repeat(40)),
    TOKEN.replace(CONTRACT_HASH, `sha256:${'a'.repeat(64)}`),
    TOKEN.replace(`verify_run=${VERIFY_RUN}`, 'verify_run=0'),
    TOKEN.replace(SCOPE, 'scope=broader'),
    TOKEN.replace(' plan_blob=', '  plan_blob='),
    TOKEN.replace(' base_sha=', ` verify_run=${VERIFY_RUN} base_sha=`),
    `${TOKEN} extra=true`,
    `${TOKEN}\n`,
  ]) {
    assert.throws(() => parseExecutionAuthorizationToken(token), /ARR-S1 execution authorization/u, token);
  }

  assert.throws(
    () => requireValidatedExecutionAuthorization({
      gate: 'GATE-S1-EXECUTE',
      planBlob: PLAN_BLOB,
      contractSha256: CONTRACT_HASH,
      baseSha: BASE_SHA,
      verifyRun: Number(VERIFY_RUN),
      scope: SCOPE,
    }),
    /validated.*parser|execution authorization/u,
  );
});

test('does not expose a harness token minting function and emits safe authority Evidence', () => {
  const authority = parseExecutionAuthorizationToken(TOKEN);
  const evidence = executionAuthorizationEvidence(authority);

  assert.equal(Object.hasOwn(evidence, 'token'), false);
  assert.equal(Object.hasOwn(evidence, 'operatorToken'), false);
  assert.equal(Object.hasOwn(evidence, 'secret'), false);
  assert.equal(Object.hasOwn(evidence, 'scope'), true);
});
