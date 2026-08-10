import assert from 'node:assert/strict';
import test from 'node:test';

import {
  parseExecutionAuthorizationToken,
} from '../src/execution-authority.mjs';
import {
  S1_FROZEN_CANDIDATE_PROVENANCE,
  preflightCredentials,
  preflightS1,
} from '../src/preflight.mjs';

const PLAN_BLOB = '277dffc521754a4370bfd94132dc9467589fdcf0';
const CONTRACT_HASH = 'sha256:bd34f566bec1c3fc32b8ab1617dac88f997ab9a91cbc6b83e42eb27dcbf9736a';
const BASE_SHA = 'a'.repeat(40);
const TOKEN = `MNFS_AUTHORIZE_ARR_S1_EXECUTE plan_blob=${PLAN_BLOB} contract_sha256=${CONTRACT_HASH} base_sha=${BASE_SHA} verify_run=987654321 scope=pi-first-runtime-conformance`;
const AUTHORITY = parseExecutionAuthorizationToken(TOKEN);

const SOURCE = Object.freeze({
  clean: true,
  commitSha: BASE_SHA,
  treeSha: 'a'.repeat(40),
  platform: 'linux',
});

const STATE_ROOT = Object.freeze({
  path: '/home/example/.local/state/mnfs',
  realPath: '/home/example/.local/state/mnfs',
  platform: 'linux',
  isDirectory: true,
  writable: true,
  filesystem: 'ext4',
});

const CREDENTIALS = Object.freeze({
  authorized: true,
  provider: 'provider-class-fixture',
  authMethodClass: 'operator-supported-login',
});

function acceptedProvenance() {
  return structuredClone(S1_FROZEN_CANDIDATE_PROVENANCE);
}

function safeInput(overrides = {}) {
  const source = overrides.source ?? SOURCE;
  const stateRoot = overrides.stateRoot ?? STATE_ROOT;
  const provenance = overrides.provenance ?? acceptedProvenance();
  const provenanceObservation = provenance?.records
    ? provenance
    : {
      trustedBoundary: 'TEST_FAITHFUL_STAGING',
      integrity: { manifestSha256: `sha256:${'a'.repeat(64)}` },
      records: provenance,
    };
  const credentials = overrides.credentials ?? CREDENTIALS;
  const { source: _source, stateRoot: _stateRoot, provenance: _provenance, credentials: _credentials, ...rest } = overrides;
  return {
    executionAuthorization: AUTHORITY,
    credentials,
    observers: {
      source: () => source,
      stateRoot: () => stateRoot,
      provenance: () => provenanceObservation,
      verificationRun: () => ({ verifyRun: AUTHORITY.verifyRun }),
    },
    ...rest,
  };
}

test('preflight is READY only for exact authority, clean source, safe Linux state root, exact provenance and class-only credentials', async () => {
  const result = await preflightS1(safeInput());

  assert.equal(result.status, 'READY');
  assert.equal(result.operationAllowed, true);
  assert.equal(result.executionAuthorization.scope, 'pi-first-runtime-conformance');
  assert.equal(result.source.clean, true);
  assert.equal(result.stateRoot.platform, 'linux');
  assert.deepEqual(result.credentials, {
    provider: 'provider-class-fixture',
    authMethodClass: 'operator-supported-login',
  });
  assert.equal(Object.hasOwn(result.credentials, 'token'), false);
  assert.equal(Object.hasOwn(result.credentials, 'apiKey'), false);
  assert.deepEqual(result.blockers, []);
});

test('missing or forged authority blocks before any observer or candidate prerequisite work', async () => {
  let observerCalls = 0;
  const result = await preflightS1({
    ...safeInput({ executionAuthorization: null }),
    observers: {
      source: () => { observerCalls += 1; return SOURCE; },
      stateRoot: () => { observerCalls += 1; return STATE_ROOT; },
      provenance: () => { observerCalls += 1; return acceptedProvenance(); },
    },
  });

  assert.equal(result.status, 'BLOCKED');
  assert.equal(result.operationAllowed, false);
  assert.equal(observerCalls, 0);
  assert.ok(result.blockers.some((blocker) => blocker.id === 'executionAuthority'));
});

test('dirty or source-drifted source and unsafe Linux state roots block without remediation', async () => {
  for (const source of [
    { ...SOURCE, clean: false },
    { ...SOURCE, commitSha: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' },
  ]) {
    const result = await preflightS1(safeInput({ source }));
    assert.equal(result.status, 'BLOCKED');
    assert.ok(result.blockers.some((blocker) => blocker.id === 'sourceCleanAndBound'));
  }

  for (const stateRoot of [
    { ...STATE_ROOT, platform: 'win32' },
    { ...STATE_ROOT, path: '/mnt/c/mnfs-state', realPath: '/mnt/c/mnfs-state' },
    { ...STATE_ROOT, isDirectory: false },
    { ...STATE_ROOT, writable: false },
  ]) {
    const result = await preflightS1(safeInput({ stateRoot }));
    assert.equal(result.status, 'BLOCKED');
    assert.ok(result.blockers.some((blocker) => blocker.id === 'linuxStateRoot'));
  }
});

test('missing or mismatched exact candidate bytes blocks and never invokes automatic remediation', async () => {
  let remediationCalls = 0;
  const result = await preflightS1(safeInput({
    provenance: {
      ...acceptedProvenance(),
      'PI-SDK': { ...acceptedProvenance()['PI-SDK'], sourceIdentity: 'wrong' },
    },
    remediation: () => { remediationCalls += 1; },
  }));

  assert.equal(result.status, 'BLOCKED');
  assert.equal(remediationCalls, 0);
  assert.ok(result.blockers.some((blocker) => blocker.id === 'candidateProvenance'));
});

test('credential preflight records provider and auth-method class only and blocks missing prerequisites', () => {
  const ready = preflightCredentials(CREDENTIALS);
  assert.deepEqual(ready, {
    status: 'READY',
    credentials: {
      provider: 'provider-class-fixture',
      authMethodClass: 'operator-supported-login',
    },
  });

  const blocked = preflightCredentials({ provider: 'provider-class-fixture', authorized: false });
  assert.equal(blocked.status, 'BLOCKED');
  assert.equal(Object.hasOwn(blocked, 'token'), false);
  assert.equal(Object.hasOwn(blocked, 'apiKey'), false);
  assert.match(blocked.reason, /auth-method class|authorization prerequisite/u);

  assert.throws(
    () => preflightCredentials({
      authorized: true,
      provider: 'provider-class-fixture',
      authMethodClass: 'operator-supported-login',
      token: 'do-not-persist',
    }),
    /secret|credential|token/u,
  );
});

test('preflight does not manufacture missing provenance or credential values', async () => {
  const result = await preflightS1(safeInput({
    provenance: {},
    credentials: { authorized: true },
  }));

  assert.equal(result.status, 'BLOCKED');
  assert.equal(result.credentials, null);
  assert.equal(Object.hasOwn(result, 'inventedValues'), false);
  assert.ok(result.blockers.some((blocker) => blocker.id === 'candidateProvenance'));
  assert.ok(result.blockers.some((blocker) => blocker.id === 'credentials'));
});
