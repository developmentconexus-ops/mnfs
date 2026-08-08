import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { parseExecutionAuthorizationToken } from '../src/execution-authority.mjs';
import { runS0 } from '../src/service.mjs';

const RUN_ID = 'arr-s0-20260807t120000000z-a1b2c3';
const PLAN_BLOB = '3e78445fcbcca360f612edefd025c6cb0f84f8e5';
const SOURCE = { commitSha: 'a'.repeat(40), treeSha: 'b'.repeat(40) };
const PLAN = { version: '0.2.0', hash: `sha256:${'c'.repeat(64)}` };
const CONTRACT = { version: '1.0.0', hash: `sha256:${'d'.repeat(64)}` };

function authority({ baseCommitSha = SOURCE.commitSha, contractHash = CONTRACT.hash } = {}) {
  const token = `MNFS_AUTHORIZE_ARR_S0_EXECUTE plan_blob=${PLAN_BLOB} contract_sha256=${contractHash} base_sha=${baseCommitSha} verify_run=31216915662 scope=canonical-host-probe-only`;
  return parseExecutionAuthorizationToken(token, {
    planGitBlob: PLAN_BLOB,
    contractHash,
    baseCommitSha,
  });
}

function preflight(source = SOURCE) {
  return async () => ({
    ok: true,
    stateRoot: '/home/example/.local/state/mnfs',
    checks: [],
    facts: { repository: { source, clean: true } },
  });
}

test('runS0 itself refuses direct invocation without GATE-S0-EXECUTE authority', async () => {
  const stateRoot = await mkdtemp(path.join(tmpdir(), 'mnfs-arr-s0-direct-authority-'));
  try {
    await assert.rejects(
      () => runS0({
        repoRoot: '/home/example/src/mnfs',
        stateRoot,
        runId: RUN_ID,
        identities: { plan: PLAN, contract: CONTRACT },
        preflight: preflight(),
        collect: async () => assert.fail('collector must not run'),
      }),
      /execution authorization|GATE-S0-EXECUTE/u,
    );
  } finally {
    await rm(stateRoot, { recursive: true, force: true });
  }
});

test('runS0 rejects a perfectly shaped but forged plain authorization object', async () => {
  const stateRoot = await mkdtemp(path.join(tmpdir(), 'mnfs-arr-s0-forged-authority-'));
  try {
    const forged = structuredClone(authority());
    await assert.rejects(
      () => runS0({
        repoRoot: '/home/example/src/mnfs',
        stateRoot,
        runId: RUN_ID,
        identities: { plan: PLAN, contract: CONTRACT, executionAuthorization: forged },
        preflight: preflight(),
        collect: async () => assert.fail('collector must not run'),
      }),
      /execution authorization|validated|GATE-S0-EXECUTE/u,
    );
  } finally {
    await rm(stateRoot, { recursive: true, force: true });
  }
});

test('runS0 accepts only parser-validated authority and still binds current source/contract', async () => {
  const stateRoot = await mkdtemp(path.join(tmpdir(), 'mnfs-arr-s0-validated-authority-'));
  try {
    await assert.rejects(
      () => runS0({
        repoRoot: '/home/example/src/mnfs',
        stateRoot,
        runId: RUN_ID,
        identities: { plan: PLAN, contract: CONTRACT, executionAuthorization: authority() },
        preflight: async () => ({ ok: false, checks: [], facts: { repository: { source: SOURCE, clean: true } } }),
        collect: async () => assert.fail('collector must not run'),
      }),
      /preflight blocked/u,
      'validated authority should pass authority gate and reach preflight',
    );

    await assert.rejects(
      () => runS0({
        repoRoot: '/home/example/src/mnfs',
        stateRoot,
        runId: RUN_ID,
        identities: { plan: PLAN, contract: CONTRACT, executionAuthorization: authority({ baseCommitSha: 'b'.repeat(40) }) },
        preflight: preflight(),
        collect: async () => assert.fail('collector must not run'),
      }),
      /source commit|execution authorization/u,
    );

    await assert.rejects(
      () => runS0({
        repoRoot: '/home/example/src/mnfs',
        stateRoot,
        runId: RUN_ID,
        identities: {
          plan: PLAN,
          contract: CONTRACT,
          executionAuthorization: authority({ contractHash: `sha256:${'f'.repeat(64)}` }),
        },
        preflight: preflight(),
        collect: async () => assert.fail('collector must not run'),
      }),
      /contract hash|execution authorization/u,
    );
  } finally {
    await rm(stateRoot, { recursive: true, force: true });
  }
});
