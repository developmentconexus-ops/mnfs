import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { sha256Bytes } from '../src/artifacts.mjs';
import { executeCli, loadS0Identities } from '../src/cli.mjs';
import { parseExecutionAuthorizationToken } from '../src/execution-authority.mjs';
import { preflightS0 } from '../src/service.mjs';

const testDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testDir, '../../..');
const PLAN_REL = 'docs/superpowers/plans/2026-08-07-arr-s0-host-capability-probe.md';
const CONTRACT_REL = 'docs/spikes/ARR-S0-HOST-CAPABILITY-CONTRACT.md';
const PLAN_BLOB = '3e78445fcbcca360f612edefd025c6cb0f84f8e5';
const SOURCE = { commitSha: 'a'.repeat(40), treeSha: 'b'.repeat(40) };
const VERIFY_RUN = 31216915662;

async function acceptedFixtureRepo() {
  const temp = await mkdtemp(path.join(tmpdir(), 'mnfs-arr-s0-preflight-auth-repo-'));
  const planBytes = await readFile(path.join(repoRoot, PLAN_REL));
  const proposedContract = await readFile(path.join(repoRoot, CONTRACT_REL), 'utf8');
  const acceptedContract = proposedContract
    .replace('status: proposed', 'status: accepted')
    .replace('version: 0.1.0', 'version: 1.0.0');
  await mkdir(path.join(temp, path.dirname(PLAN_REL)), { recursive: true });
  await mkdir(path.join(temp, path.dirname(CONTRACT_REL)), { recursive: true });
  await writeFile(path.join(temp, PLAN_REL), planBytes);
  await writeFile(path.join(temp, CONTRACT_REL), acceptedContract, 'utf8');
  return { temp, contractBytes: Buffer.from(acceptedContract, 'utf8') };
}

function token(contractHash, baseCommitSha = SOURCE.commitSha) {
  return `MNFS_AUTHORIZE_ARR_S0_EXECUTE plan_blob=${PLAN_BLOB} contract_sha256=${contractHash} base_sha=${baseCommitSha} verify_run=${VERIFY_RUN} scope=canonical-host-probe-only`;
}

function authenticatedIdentities() {
  const contractHash = `sha256:${'d'.repeat(64)}`;
  const executionAuthorization = parseExecutionAuthorizationToken(
    token(contractHash),
    { planGitBlob: PLAN_BLOB, contractHash, baseCommitSha: SOURCE.commitSha },
  );
  return {
    plan: { version: '0.2.0', hash: `sha256:${'c'.repeat(64)}` },
    contract: { version: '1.0.0', hash: contractHash },
    executionAuthorization,
  };
}

function safeFacts() {
  return {
    hostIdentity: { isWsl2: true, nodeVersion: 'v24.18.0' },
    linuxFilesystemSupported: true,
    stateRootFilesystemSupported: true,
    repository: { source: SOURCE, clean: true },
    requiredReadsAvailable: true,
  };
}

test('identity loader validates execution token before any repository source observation', async () => {
  const { temp } = await acceptedFixtureRepo();
  let sourceCalls = 0;
  try {
    await assert.rejects(
      () => loadS0Identities(temp, {
        executionAuthorizationToken: null,
        sourceLoader: async () => {
          sourceCalls += 1;
          return { source: SOURCE, clean: true };
        },
      }),
      /execution authorization|GATE-S0-EXECUTE/u,
    );
    assert.equal(sourceCalls, 0, 'Git/source observation must not occur before execution authority');
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
});

test('CLI preflight validates identities before invoking real preflight inspection', async () => {
  let preflightCalls = 0;
  await assert.rejects(
    () => executeCli(['preflight', '--json'], {
      repoRoot: '/home/example/src/mnfs',
      identitiesLoader: async () => { throw new Error('GATE-S0-EXECUTE missing'); },
      preflight: async () => {
        preflightCalls += 1;
        return { ok: true, checks: [], facts: {} };
      },
    }),
    /GATE-S0-EXECUTE/u,
  );
  assert.equal(preflightCalls, 0, 'preflight inspection must not run before authority validation');
});

test('direct preflightS0 invocation refuses missing authenticated execution authority before inspect', async () => {
  const stateRoot = await mkdtemp(path.join(tmpdir(), 'mnfs-arr-s0-preflight-direct-'));
  let inspectCalls = 0;
  try {
    await assert.rejects(
      () => preflightS0({
        repoRoot: '/home/example/src/mnfs',
        stateRoot,
        inspect: async () => {
          inspectCalls += 1;
          return safeFacts();
        },
      }),
      /execution authorization|GATE-S0-EXECUTE/u,
    );
    assert.equal(inspectCalls, 0, 'host inspection must not run without authenticated execution authority');
  } finally {
    await rm(stateRoot, { recursive: true, force: true });
  }
});

test('authenticated preflight authority may reach inspection and remains bound to observed source', async () => {
  const stateRoot = await mkdtemp(path.join(tmpdir(), 'mnfs-arr-s0-preflight-authenticated-'));
  let inspectCalls = 0;
  try {
    const result = await preflightS0({
      repoRoot: '/home/example/src/mnfs',
      stateRoot,
      identities: authenticatedIdentities(),
      inspect: async () => {
        inspectCalls += 1;
        return safeFacts();
      },
    });
    assert.equal(inspectCalls, 1);
    assert.equal(result.ok, true);
  } finally {
    await rm(stateRoot, { recursive: true, force: true });
  }
});
