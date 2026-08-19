import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const connectionString = process.env.TEST_DATABASE_URL;
if (!connectionString) throw new Error('TEST_DATABASE_URL is required');

const childPath = fileURLToPath(new URL('../fixtures/bt3n-child.mjs', import.meta.url));
const packageRoot = fileURLToPath(new URL('..', import.meta.url));

function schemaName(label) {
  return `mastra_bt3n_${label}_${crypto.randomUUID().replaceAll('-', '').slice(0, 12)}`;
}

async function createScenario(label) {
  const directory = await mkdtemp(path.join(tmpdir(), `conexus-bt3n-${label}-`));
  const authorityStatePath = path.join(directory, 'authority.json');
  const effectStatePath = path.join(directory, 'effect.json');
  await writeFile(authorityStatePath, JSON.stringify({ decision: 'ALLOW' }));
  await writeFile(effectStatePath, JSON.stringify({ count: 0 }));
  return {
    directory,
    authorityStatePath,
    effectStatePath,
    schemaName: schemaName(label),
    runId: `bt3n-${label}-${crypto.randomUUID()}`
  };
}

function runChild(mode, scenario) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [
        childPath,
        mode,
        scenario.schemaName,
        scenario.authorityStatePath,
        scenario.effectStatePath,
        scenario.runId
      ],
      {
        cwd: packageRoot,
        env: { ...process.env, TEST_DATABASE_URL: connectionString },
        stdio: ['ignore', 'pipe', 'pipe']
      }
    );
    let stdout = '';
    let stderr = '';
    const timeout = setTimeout(() => {
      child.kill('SIGKILL');
      reject(new Error(`BT-3N ${mode} child timed out`));
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
        reject(new Error(`BT-3N ${mode} child exited ${code ?? signal}: ${stderr || stdout}`));
        return;
      }
      const line = stdout.split(/\r?\n/u).find((entry) => entry.startsWith('BT3N_RESULT '));
      if (!line) {
        reject(new Error(`BT-3N ${mode} child emitted no result: ${stderr || stdout}`));
        return;
      }
      resolve(JSON.parse(line.slice('BT3N_RESULT '.length)));
    });
  });
}

async function effectCount(scenario) {
  return JSON.parse(await readFile(scenario.effectStatePath, 'utf8')).count;
}

function assertNoExternalCalls(observation) {
  assert.equal(observation.providerCalls, 0);
  assert.equal(observation.e2bCalls, 0);
  assert.equal(observation.realExternalEffects, 0);
}

function assertSuspended(suspended, scenario) {
  assert.equal(suspended.finishReason, 'suspended');
  assert.equal(suspended.runId, scenario.runId);
  assert.equal(suspended.toolExecuteCount, 0);
  assert.equal(suspended.suspendedRuns.length, 1);
  assert.equal(suspended.suspendedRuns[0].runId, scenario.runId);
  assert.equal(suspended.suspendedRuns[0].status, 'suspended');
  assert.equal(suspended.suspendedRuns[0].toolCalls[0].toolName, 'bt3n-governed-effect');
  assert.equal(suspended.suspendedRuns[0].toolCalls[0].requiresApproval, true);
  assert.deepEqual(suspended.originalArgs, {
    amount: 7,
    proposalId: 'proposal-42'
  });
  assertNoExternalCalls(suspended);
}

test('BT-3N native HITL preserves current-owner authority after process loss', async (t) => {
  await t.test('native approval suspends before execute and current owner revocation blocks effect', async () => {
    const scenario = await createScenario('revoked');
    try {
      const suspended = await runChild('suspend', scenario);
      assertSuspended(suspended, scenario);
      assert.equal(await effectCount(scenario), 0);

      await writeFile(scenario.authorityStatePath, JSON.stringify({ decision: 'DENY' }));
      const resumed = await runChild('approve', scenario);

      assert.notEqual(resumed.pid, suspended.pid);
      assert.equal(resumed.discoveredRunId, scenario.runId);
      assert.equal(resumed.mechanicalApproval, true);
      assert.equal(resumed.finishReason, 'stop');
      assert.equal(resumed.text, 'bt3n-complete');
      assert.equal(resumed.currentOwnerDecision, 'DENY');
      assert.equal(resumed.effectCount, 0);
      assert.equal(resumed.toolExecuteCount, 1);
      assert.equal(resumed.toolResult.decision, 'DENIED_CURRENT_AUTHORITY');
      assert.equal(resumed.rawRequestContext.staleBusinessAuthority, 'ALLOW');
      assert.equal(resumed.rawRequestContext.currentRole, 'NEW');
      assert.deepEqual(resumed.approvedArgs, suspended.originalArgs);
      assert.deepEqual(resumed.toolResult.input, suspended.originalArgs);
      assert.equal(resumed.remainingSuspendedRuns, 0);
      assertNoExternalCalls(resumed);
    } finally {
      await rm(scenario.directory, { recursive: true, force: true });
    }
  });

  await t.test('current owner allow executes the local effect exactly once', async () => {
    const scenario = await createScenario('allowed');
    try {
      const suspended = await runChild('suspend', scenario);
      assertSuspended(suspended, scenario);

      const resumed = await runChild('approve', scenario);
      assert.notEqual(resumed.pid, suspended.pid);
      assert.equal(resumed.discoveredRunId, scenario.runId);
      assert.equal(resumed.mechanicalApproval, true);
      assert.equal(resumed.finishReason, 'stop');
      assert.equal(resumed.text, 'bt3n-complete');
      assert.equal(resumed.currentOwnerDecision, 'ALLOW');
      assert.equal(resumed.effectCount, 1);
      assert.equal(resumed.toolExecuteCount, 1);
      assert.equal(resumed.toolResult.decision, 'EFFECT_APPLIED');
      assert.equal(resumed.rawRequestContext.staleBusinessAuthority, 'ALLOW');
      assert.equal(resumed.rawRequestContext.currentRole, 'NEW');
      assert.deepEqual(resumed.approvedArgs, suspended.originalArgs);
      assert.deepEqual(resumed.toolResult.input, suspended.originalArgs);
      assert.equal(resumed.remainingSuspendedRuns, 0);
      assertNoExternalCalls(resumed);
    } finally {
      await rm(scenario.directory, { recursive: true, force: true });
    }
  });

  await t.test('native decline executes neither tool boundary nor effect', async () => {
    const scenario = await createScenario('declined');
    try {
      const suspended = await runChild('suspend', scenario);
      assertSuspended(suspended, scenario);

      const declined = await runChild('reject', scenario);
      assert.notEqual(declined.pid, suspended.pid);
      assert.equal(declined.discoveredRunId, scenario.runId);
      assert.equal(declined.mechanicalApproval, false);
      assert.equal(declined.finishReason, 'stop');
      assert.equal(declined.text, 'bt3n-complete');
      assert.equal(declined.toolExecuteCount, 0);
      assert.equal(declined.effectCount, 0);
      assert.equal(declined.toolResult, null);
      assert.equal(declined.remainingSuspendedRuns, 0);
      assertNoExternalCalls(declined);
    } finally {
      await rm(scenario.directory, { recursive: true, force: true });
    }
  });
});
