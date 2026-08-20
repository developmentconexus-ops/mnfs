import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const connectionString = process.env.TEST_DATABASE_URL;
if (!connectionString) throw new Error('TEST_DATABASE_URL is required');

const childPath = fileURLToPath(new URL('../fixtures/bt3-child.mjs', import.meta.url));
const packageRoot = fileURLToPath(new URL('..', import.meta.url));

function runChild(mode, schemaName) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [childPath, mode, schemaName], {
      cwd: packageRoot,
      env: { ...process.env, TEST_DATABASE_URL: connectionString },
      stdio: ['ignore', 'pipe', 'pipe']
    });
    let stdout = '';
    let stderr = '';
    const timeout = setTimeout(() => {
      child.kill('SIGKILL');
      reject(new Error(`BT-3 ${mode} child timed out`));
    }, 180_000);

    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk) => {
      stdout += chunk;
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });
    child.once('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    child.once('close', (code, signal) => {
      clearTimeout(timeout);
      if (code !== 0) {
        reject(new Error(`BT-3 ${mode} child exited ${code ?? signal}: ${stderr || stdout}`));
        return;
      }
      const line = stdout
        .split(/\r?\n/u)
        .find((entry) => entry.startsWith('BT3_RESULT '));
      if (!line) {
        reject(new Error(`BT-3 ${mode} child emitted no result: ${stderr || stdout}`));
        return;
      }
      resolve(JSON.parse(line.slice('BT3_RESULT '.length)));
    });
  });
}

test('BT-3 detects stale RequestContext restoration across genuine process loss', async () => {
  const schemaName = `mastra_bt3_${crypto.randomUUID().replaceAll('-', '').slice(0, 16)}`;

  const suspended = await runChild('suspend', schemaName);
  assert.equal(suspended.finishReason, 'suspended');
  assert.equal(suspended.runId, 'bt3-suspended-run');
  assert.deepEqual(suspended.observations[0]?.requestContext, {
    currentRole: 'OLD',
    unknownStaleKey: 'MUST_DISAPPEAR'
  });
  assert.equal(suspended.suspendedRuns.length, 1);
  assert.equal(suspended.suspendedRuns[0]?.runId, 'bt3-suspended-run');
  assert.equal(suspended.suspendedRuns[0]?.status, 'suspended');

  const resumed = await runChild('resume', schemaName);
  assert.notEqual(resumed.pid, suspended.pid);
  assert.equal(resumed.discoveredRunId, 'bt3-suspended-run');
  assert.equal(resumed.finishReason, 'stop');
  assert.equal(resumed.text, 'resumed-complete');
  assert.equal(resumed.observations[0]?.requestContext.currentRole, 'NEW');

  // Expected failure observation: pinned Mastra restores an unknown stale key
  // even when the caller supplies a fresh resume RequestContext.
  assert.equal(resumed.observations[0]?.requestContext.unknownStaleKey, 'MUST_DISAPPEAR');
  assert.deepEqual(resumed.observations[0]?.resumeData, { approved: true });
  assert.equal(resumed.remainingSuspendedRuns, 0);
});
