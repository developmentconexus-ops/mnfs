import assert from 'node:assert/strict';
import { lstat, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { parseExecutionAuthorizationToken } from '../src/execution-authority.mjs';
import { preflightS0, runS0 } from '../src/service.mjs';

const RUN_ID = 'arr-s0-20260807t120000000z-a1b2c3';
const PLAN_BLOB = '3e78445fcbcca360f612edefd025c6cb0f84f8e5';
const AUTHORIZED_SOURCE = { commitSha: 'a'.repeat(40), treeSha: 'b'.repeat(40) };
const DRIFTED_SOURCE = { commitSha: 'c'.repeat(40), treeSha: 'd'.repeat(40) };
const CONTRACT_HASH = `sha256:${'e'.repeat(64)}`;
const TOKEN = `MNFS_AUTHORIZE_ARR_S0_EXECUTE plan_blob=${PLAN_BLOB} contract_sha256=${CONTRACT_HASH} base_sha=${AUTHORIZED_SOURCE.commitSha} verify_run=31219691037 scope=canonical-host-probe-only`;

function identities() {
  return {
    plan: { version: '0.2.0', hash: `sha256:${'f'.repeat(64)}` },
    contract: { version: '1.0.0', hash: CONTRACT_HASH },
    executionAuthorization: parseExecutionAuthorizationToken(TOKEN, {
      planGitBlob: PLAN_BLOB,
      contractHash: CONTRACT_HASH,
      baseCommitSha: AUTHORIZED_SOURCE.commitSha,
    }),
  };
}

function safeHostFacts(repository = { source: AUTHORIZED_SOURCE, clean: true }) {
  return {
    hostIdentity: { isWsl2: true, nodeVersion: 'v24.18.0' },
    linuxFilesystemSupported: true,
    stateRootFilesystemSupported: true,
    repository,
    requiredReadsAvailable: true,
  };
}

test('preflight rebinds source authority before any remaining host inspection', async () => {
  const stateRoot = await mkdtemp(path.join(tmpdir(), 'mnfs-arr-s0-source-first-'));
  let hostInspectCalls = 0;
  try {
    await assert.rejects(
      () => preflightS0({
        repoRoot: '/home/example/src/mnfs',
        stateRoot,
        identities: identities(),
        sourceObserver: async () => ({ source: DRIFTED_SOURCE, clean: true }),
        inspect: async () => {
          hostInspectCalls += 1;
          return safeHostFacts({ source: DRIFTED_SOURCE, clean: true });
        },
      }),
      /execution authorization|source commit|base_sha/u,
    );
    assert.equal(hostInspectCalls, 0, 'kernel/WSL/filesystem inspection must not start under stale source authority');
  } finally {
    await rm(stateRoot, { recursive: true, force: true });
  }
});

test('run verifies the actual run-root filesystem before creating the first artifact', async () => {
  const stateRoot = await mkdtemp(path.join(tmpdir(), 'mnfs-arr-s0-run-root-fs-'));
  const expectedRunRoot = path.join(stateRoot, 'spikes', 'arr-s0', RUN_ID);
  let filesystemTarget = null;
  let collectCalls = 0;
  try {
    await assert.rejects(
      () => runS0({
        repoRoot: '/home/example/src/mnfs',
        stateRoot,
        runId: RUN_ID,
        identities: identities(),
        preflight: async () => ({
          ok: true,
          stateRoot,
          checks: [],
          facts: safeHostFacts(),
        }),
        observeRunRootFilesystem: async (target) => {
          filesystemTarget = target;
          return { state: 'UNKNOWN', filesystemType: 'nfs', observedPath: stateRoot };
        },
        collect: async () => {
          collectCalls += 1;
          assert.fail('collector must not run on an unreviewed run-root filesystem');
        },
      }),
      /run[- ]root filesystem|reviewed Linux-owned|filesystem/u,
    );
    assert.equal(filesystemTarget, expectedRunRoot);
    assert.equal(collectCalls, 0);
    await assert.rejects(() => lstat(expectedRunRoot), (error) => error?.code === 'ENOENT');
  } finally {
    await rm(stateRoot, { recursive: true, force: true });
  }
});
