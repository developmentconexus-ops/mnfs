import assert from 'node:assert/strict';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { runProcess, startProcess } from '../src/process-runner.mjs';

const cwd = process.cwd();

function spec(script, overrides = {}) {
  return {
    argv: [process.execPath, '-e', script, 'exact-arg'],
    cwd,
    env: { MNFS_VISIBLE: 'yes' },
    timeoutMs: 1000,
    terminationGraceMs: 100,
    stdoutLimitBytes: 4096,
    stderrLimitBytes: 4096,
    ...overrides,
  };
}

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

test('runs exact argv/cwd/reviewed env without a shell and closes stdin by default', async () => {
  const result = await runProcess(spec(`
    const fs = require('node:fs');
    process.stdin.resume();
    process.stdin.on('end', () => fs.writeSync(1, JSON.stringify({
      cwd: process.cwd(),
      env: Object.keys(process.env).sort(),
      args: process.argv.slice(1),
    })));
  `));
  assert.equal(result.status, 'EXITED');
  assert.equal(result.outcome, 'NORMAL_EXIT');
  assert.equal(result.exitCode, 0);
  assert.equal(result.signal, null);
  assert.equal(result.normalCompletion, true);
  assert.equal(result.stdinMode, 'closed');
  assert.equal(result.shell, false);
  assert.deepEqual(result.argv, [process.execPath, '-e', result.argv[2], 'exact-arg']);
  const observed = JSON.parse(result.stdout.toString('utf8'));
  assert.equal(observed.cwd, cwd);
  assert.deepEqual(observed.env, ['MNFS_VISIBLE']);
  assert.deepEqual(observed.args, ['exact-arg']);
});

test('distinguishes non-zero exit from normal completion', async () => {
  const result = await runProcess(spec("require('node:fs').writeSync(2, 'failure'); process.exit(7);"));
  assert.equal(result.status, 'EXITED');
  assert.equal(result.outcome, 'NON_ZERO_EXIT');
  assert.equal(result.exitCode, 7);
  assert.equal(result.normalCompletion, false);
  assert.equal(result.stderr.toString('utf8'), 'failure');
});

test('distinguishes signal death from an exited process', async () => {
  const result = await runProcess(spec("process.kill(process.pid, 'SIGTERM');"));
  assert.equal(result.status, 'SIGNALED');
  assert.equal(result.outcome, 'SIGNAL_DEATH');
  assert.equal(result.exitCode, null);
  assert.equal(result.signal, 'SIGTERM');
  assert.equal(result.processDeath, true);
});

test('times out and settles after bounded process-group termination', async () => {
  const started = Date.now();
  const result = await runProcess(spec('setInterval(() => {}, 1000);', {
    timeoutMs: 80,
    terminationGraceMs: 60,
  }));
  assert.equal(result.status, 'TIMED_OUT');
  assert.equal(result.outcome, 'TIMEOUT');
  assert.equal(result.timedOut, true);
  assert.equal(result.termination.settled, true);
  assert.ok(Date.now() - started < 1500);
});

test('explicit cancellation is observable and settles once within a bound', async () => {
  const execution = startProcess(spec('setInterval(() => {}, 1000);', { timeoutMs: 2000 }));
  assert.equal(execution.cancel('operator-request'), true);
  assert.equal(execution.cancel('second-request'), false);
  const result = await execution.result;
  assert.equal(result.status, 'CANCELLED');
  assert.equal(result.outcome, 'CANCELLED');
  assert.equal(result.cancelled, true);
  assert.deepEqual(result.termination, {
    requested: true,
    kind: 'CANCELLED',
    reason: 'operator-request',
    settled: true,
  });
});

test('terminates descendants in the same process group on timeout', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'mnfs-arr-s1-process-descendant-'));
  const pidPath = path.join(root, 'child.pid');
  try {
    const resultPromise = runProcess(spec(`
      const { spawn } = require('node:child_process');
      const fs = require('node:fs');
      const grandchild = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000);'], { stdio: 'ignore' });
      fs.writeFileSync(process.env.MNFS_PID_FILE, String(grandchild.pid));
      setInterval(() => {}, 1000);
    `, {
      env: { MNFS_VISIBLE: 'yes', MNFS_PID_FILE: pidPath },
      timeoutMs: 120,
      terminationGraceMs: 80,
    }));
    const grandchildPid = await waitForFile(pidPath);
    const result = await resultPromise;
    assert.equal(result.status, 'TIMED_OUT');
    for (let attempt = 0; attempt < 100 && await isAlive(grandchildPid.trim()); attempt += 1) await sleep(5);
    assert.equal(await isAlive(grandchildPid.trim()), false);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('bounds stdout and stderr independently and records truncation metadata', async () => {
  const result = await runProcess(spec("require('node:fs').writeSync(1, 'x'.repeat(100)); require('node:fs').writeSync(2, 'y'.repeat(80));", {
    stdoutLimitBytes: 16,
    stderrLimitBytes: 12,
  }));
  assert.equal(result.stdout.length, 16);
  assert.equal(result.stderr.length, 12);
  assert.equal(result.stdout.truncated, undefined);
  assert.deepEqual(result.output.stdout, {
    bytesCaptured: 16,
    bytesSeen: 100,
    truncated: true,
    limitBytes: 16,
  });
  assert.deepEqual(result.output.stderr, {
    bytesCaptured: 12,
    bytesSeen: 80,
    truncated: true,
    limitBytes: 12,
  });
});

test('allows protocol stdin only with an explicit owner', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'mnfs-arr-s1-protocol-'));
  const receivedPath = path.join(root, 'received.txt');
  try {
    const execution = startProcess(spec("const fs=require('node:fs'); fs.writeFileSync(process.env.MNFS_PROTOCOL_FILE, fs.readFileSync(0));", {
      env: { MNFS_VISIBLE: 'yes', MNFS_PROTOCOL_FILE: receivedPath },
      stdinMode: 'protocol',
      protocolOwner: 'test-adapter',
    }));
    assert.ok(execution.stdin);
    execution.stdin.end('owned-input');
    const result = await execution.result;
    assert.equal(result.stdinMode, 'protocol');
    assert.equal(await readFile(receivedPath, 'utf8'), 'owned-input');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
