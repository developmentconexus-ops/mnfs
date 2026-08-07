import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { sha256Bytes } from '../src/artifacts.mjs';
import { loadS0Identities } from '../src/cli.mjs';
import { buildExecutionAuthorizationToken } from '../src/execution-authority.mjs';

const testDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testDir, '../../..');
const PLAN_REL = 'docs/superpowers/plans/2026-08-07-arr-s0-host-capability-probe.md';
const CONTRACT_REL = 'docs/spikes/ARR-S0-HOST-CAPABILITY-CONTRACT.md';
const AUTH_REL = 'docs/acceptance/arr-s0-execution-authorization.json';
const SOURCE = { commitSha: 'a'.repeat(40), treeSha: 'b'.repeat(40) };
const VERIFY_RUN = 31214388675;

async function fixtureRepo() {
  const temp = await mkdtemp(path.join(tmpdir(), 'mnfs-arr-s0-authority-'));
  const planBytes = await readFile(path.join(repoRoot, PLAN_REL));
  const proposedContract = (await readFile(path.join(repoRoot, CONTRACT_REL), 'utf8'));
  const acceptedContract = proposedContract
    .replace('status: proposed', 'status: accepted')
    .replace('version: 0.1.0', 'version: 1.0.0');
  await mkdir(path.join(temp, path.dirname(PLAN_REL)), { recursive: true });
  await mkdir(path.join(temp, path.dirname(CONTRACT_REL)), { recursive: true });
  await mkdir(path.join(temp, path.dirname(AUTH_REL)), { recursive: true });
  await writeFile(path.join(temp, PLAN_REL), planBytes);
  await writeFile(path.join(temp, CONTRACT_REL), acceptedContract, 'utf8');
  return { temp, contractBytes: Buffer.from(acceptedContract, 'utf8') };
}

function sourceLoader(source = SOURCE) {
  return async () => ({ source, clean: true });
}

function authorization(contractHash, overrides = {}) {
  const expected = {
    planGitBlob: '3e78445fcbcca360f612edefd025c6cb0f84f8e5',
    contractVersion: '1.0.0',
    contractHash,
    baseCommitSha: SOURCE.commitSha,
    verificationRunId: VERIFY_RUN,
  };
  const record = {
    schemaVersion: 1,
    gate: 'GATE-S0-EXECUTE',
    status: 'accepted',
    scope: 'canonical-host-probe-only',
    planGitBlob: expected.planGitBlob,
    contract: { version: expected.contractVersion, sha256: expected.contractHash },
    source: { commitSha: expected.baseCommitSha },
    verification: { commitSha: expected.baseCommitSha, workflowRunId: VERIFY_RUN, conclusion: 'SUCCESS' },
    operatorToken: buildExecutionAuthorizationToken(expected),
  };
  return Object.assign(record, overrides);
}

test('accepted contract alone never enables ARR-S0 run authority', async () => {
  const { temp } = await fixtureRepo();
  try {
    await assert.rejects(
      () => loadS0Identities(temp, { sourceLoader: sourceLoader() }),
      /GATE-S0-EXECUTE|execution authorization/u,
    );
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
});

test('loader binds execution authority to exact contract bytes and current source commit', async () => {
  const { temp, contractBytes } = await fixtureRepo();
  try {
    const contractHash = sha256Bytes(contractBytes);
    const record = authorization(contractHash);
    await writeFile(path.join(temp, AUTH_REL), `${JSON.stringify(record)}\n`, 'utf8');
    const identities = await loadS0Identities(temp, { sourceLoader: sourceLoader() });
    assert.equal(identities.contract.hash, contractHash);
    assert.equal(identities.executionAuthorization.baseCommitSha, SOURCE.commitSha);
    assert.equal(identities.executionAuthorization.verificationRunId, VERIFY_RUN);
    assert.match(identities.executionAuthorization.recordHash, /^sha256:[a-f0-9]{64}$/u);
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
});

test('loader rejects an authorization bound to another source commit', async () => {
  const { temp, contractBytes } = await fixtureRepo();
  try {
    const contractHash = sha256Bytes(contractBytes);
    const record = authorization(contractHash);
    await writeFile(path.join(temp, AUTH_REL), `${JSON.stringify(record)}\n`, 'utf8');
    await assert.rejects(
      () => loadS0Identities(temp, { sourceLoader: sourceLoader({ commitSha: 'c'.repeat(40), treeSha: SOURCE.treeSha }) }),
      /execution authorization|source commit/u,
    );
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
});
