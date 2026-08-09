import assert from 'node:assert/strict';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  createRunState,
  transitionRunState,
  validateRunState,
} from '../src/run-state.mjs';
import { runProcess } from '../src/process-runner.mjs';

const BINDING = Object.freeze({
  candidateShape: 'PI-SDK',
  contractHash: `sha256:${'a'.repeat(64)}`,
  fixtureHash: `sha256:${'b'.repeat(64)}`,
  sourceTreeHash: `sha256:${'c'.repeat(64)}`,
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForFile(filePath) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try { return await readFile(filePath, 'utf8'); } catch {}
    await sleep(5);
  }
  throw new Error(`timed out waiting for ${filePath}`);
}

async function isAlive(pid) {
  try {
    process.kill(Number(pid), 0);
    try {
      const stat = await readFile(`/proc/${pid}/stat`, 'utf8');
      const state = stat.slice(stat.lastIndexOf(')') + 2, stat.lastIndexOf(')') + 3);
      return state !== 'Z';
    } catch { return true; }
  } catch (error) {
    return error?.code === 'EPERM';
  }
}

test('rejects a reconstructed pre-FINALIZED run that carries an invented verdict', () => {
  const created = createRunState({ runId: 'run-s1-review-regression', ...BINDING });
  const running = transitionRunState(transitionRunState(created, 'READY'), 'RUNNING');
  const reconstructed = structuredClone(running);
  reconstructed.verdict = 'PASS';

  const errors = validateRunState(reconstructed);
  assert.ok(
    errors.some((error) => /verdict.*FINALIZED|FINALIZED.*verdict/u.test(error)),
    `expected pre-FINALIZED verdict rejection, got: ${errors.join('; ')}`,
  );
});

test('timeout force-kills a process-group descendant that ignores SIGTERM after its leader exits', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'mnfs-arr-s1-resistant-descendant-'));
  const pidPath = path.join(root, 'grandchild.pid');
  let grandchildPid = null;
  try {
    const resultPromise = runProcess({
      argv: [process.execPath, '-e', `
        const { spawn } = require('node:child_process');
        const fs = require('node:fs');
        const grandchild = spawn(process.execPath, ['-e', "process.on('SIGTERM', () => {}); setInterval(() => {}, 1000);"], { stdio: 'ignore' });
        fs.writeFileSync(process.env.MNFS_PID_FILE, String(grandchild.pid));
        setInterval(() => {}, 1000);
      `],
      cwd: process.cwd(),
      env: { MNFS_PID_FILE: pidPath },
      timeoutMs: 120,
      terminationGraceMs: 80,
      stdoutLimitBytes: 4096,
      stderrLimitBytes: 4096,
    });

    grandchildPid = (await waitForFile(pidPath)).trim();
    const result = await resultPromise;
    assert.equal(result.status, 'TIMED_OUT');

    for (let attempt = 0; attempt < 100 && await isAlive(grandchildPid); attempt += 1) await sleep(5);
    assert.equal(await isAlive(grandchildPid), false);
  } finally {
    if (grandchildPid && await isAlive(grandchildPid)) {
      try { process.kill(Number(grandchildPid), 'SIGKILL'); } catch {}
    }
    await rm(root, { recursive: true, force: true });
  }
});
