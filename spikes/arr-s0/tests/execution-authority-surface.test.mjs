import assert from 'node:assert/strict';
import test from 'node:test';
import * as authority from '../src/execution-authority.mjs';

test('production execution-authority module consumes external authority but cannot mint Operator tokens', () => {
  assert.equal(Object.hasOwn(authority, 'buildExecutionAuthorizationToken'), false);
  assert.equal(typeof authority.parseExecutionAuthorizationToken, 'function');
  assert.equal(typeof authority.requireValidatedExecutionAuthorization, 'function');
  assert.equal(Object.hasOwn(authority, 'requireAuthenticatedExecutionAuthorization'), false);
  assert.equal(typeof authority.executionAuthorizationEvidence, 'function');
});
