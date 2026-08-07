import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { runS0 } from '../src/service.mjs';

const RUN_ID = 'arr-s0-20260807t120000000z-a1b2c3';
const SOURCE = { commitSha: 'a'.repeat(40), treeSha: 'b'.repeat(40) };
const PLAN = { version: '0.2.0', hash: `sha256:${'c'.repeat(64)}` };
const CONTRACT = { version: '1.0.0', hash: `sha256:${'d'.repeat(64)}` };
const AUTHORITY = {
  gate: 'GATE-S0-EXECUTE',
  baseCommitSha: SOURCE.commitSha,
  contractHash: CONTRACT.hash,
  verificationRunId: 31216915662,
  tokenHash: `sha256:${'e'.repeat(64)}`,
};

function preflight() {
  return async () => ({
    ok: true,
    stateRoot: '/home/example/.local/state/mnfs',
    checks: [],
    facts: { repository: { source: SOURCE, clean: true } },
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

test('runS0 refuses authority that does not bind source and contract', async () => {
  const stateRoot = await mkdtemp(path.join(tmpdir(), 'mnfs-arr-s0-direct-mismatch-'));
  try {
    for (const executionAuthorization of [
      { ...AUTHORITY, gate: 'GATE-S0-IMPLEMENT' },
      { ...AUTHORITY, baseCommitSha: 'b'.repeat(40) },
      { ...AUTHORITY, contractHash: `sha256:${'f'.repeat(64)}` },
      { ...AUTHORITY, verificationRunId: 0 },
      { ...AUTHORITY, tokenHash: 'sha256:nope' },
    ]) {
      await assert.rejects(
        () => runS0({
          repoRoot: '/home/example/src/mnfs',
          stateRoot,
          runId: RUN_ID,
          identities: { plan: PLAN, contract: CONTRACT, executionAuthorization },
          preflight: preflight(),
          collect: async () => assert.fail('collector must not run'),
        }),
        /execution authorization|GATE-S0-EXECUTE/u,
      );
    }
  } finally {
    await rm(stateRoot, { recursive: true, force: true });
  }
});
