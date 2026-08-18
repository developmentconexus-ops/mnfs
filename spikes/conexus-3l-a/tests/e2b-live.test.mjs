import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { CommandExitError, Sandbox } from 'e2b';
import { E2BSandbox } from '@mastra/e2b';

const apiKey = process.env.E2B_API_KEY;
if (!apiKey) {
  throw new Error('E2B_API_KEY is required for A2 live qualification');
}

const timeoutMs = 120_000;
const runTag = crypto.randomUUID().slice(0, 8);

async function providerInfo(sandboxId) {
  const response = await fetch(`https://api.e2b.app/sandboxes/${sandboxId}`, {
    headers: { 'X-API-Key': apiKey },
    signal: AbortSignal.timeout(10_000),
  });
  assert.equal(response.ok, true, `E2B provider info failed with HTTP ${response.status}`);
  return response.json();
}

async function killPhysical(sandboxId) {
  if (!sandboxId) return;
  await Sandbox.kill(sandboxId, { apiKey }).catch(() => undefined);
}

test('A2-LIVE-01: provider controls fire, guest has no durable credential, and pause/resume preserves physical sandboxId', async () => {
  let sandbox;
  let sandboxId;

  try {
    sandbox = await Sandbox.create({
      apiKey,
      timeoutMs,
      allowInternetAccess: false,
      lifecycle: { onTimeout: 'pause', autoResume: false },
      network: { allowPublicTraffic: false },
      metadata: { 'conexus-probe': `3l-a-live-${runTag}` },
    });
    sandboxId = sandbox.sandboxId;
    assert.ok(sandboxId, 'physical sandboxId must be observable');

    const info = await providerInfo(sandboxId);
    assert.equal(info.sandboxID, sandboxId);
    assert.equal(info.allowInternetAccess, false, 'provider must record internet access disabled');
    assert.equal(info.network?.allowPublicTraffic, false, 'provider must record anonymous public traffic disabled');
    assert.ok(sandbox.trafficAccessToken, 'restricted public traffic must yield a traffic access token');

    const envScan = await sandbox.commands.run(
      "env | grep -E '^(E2B_API_KEY|ANTHROPIC_API_KEY|OPENAI_API_KEY|OPENROUTER_API_KEY|GITHUB_TOKEN)=' || true",
    );
    assert.equal(envScan.stdout.trim(), '', 'runner/provider credentials must not appear in guest environment');

    try {
      await sandbox.commands.run(
        'curl --connect-timeout 3 --max-time 5 -Is https://connectivitycheck.gstatic.com/generate_204',
      );
      assert.fail('expected outbound internet request to fail when internet access is disabled');
    } catch (error) {
      assert.equal(error instanceof CommandExitError, true, `expected CommandExitError, got ${error?.constructor?.name}`);
      assert.notEqual(error.exitCode, 0);
    }

    await sandbox.files.write('/tmp/conexus-pause-marker.txt', 'physical-continuity-marker');
    await sandbox.pause();

    const pausedInfo = await providerInfo(sandboxId);
    assert.equal(pausedInfo.state, 'paused');

    const resumed = await Sandbox.connect(sandboxId, { apiKey, timeoutMs });
    sandbox = resumed;
    assert.equal(resumed.sandboxId, sandboxId, 'ordinary pause/resume must preserve physical sandboxId');
    assert.equal(await resumed.files.read('/tmp/conexus-pause-marker.txt'), 'physical-continuity-marker');

    const resumedInfo = await providerInfo(sandboxId);
    assert.equal(resumedInfo.state, 'running');
    assert.ok(resumedInfo.cpuCount >= 1);
    assert.ok(resumedInfo.memoryMB >= 128);
    assert.ok(resumedInfo.diskSizeMB >= 0);
  } finally {
    await killPhysical(sandboxId);
  }
});

test('A2-LIVE-02: pinned Mastra E2B adapter can silently retry one write-capable command on a new physical incarnation', async () => {
  const logicalId = `conexus-3l-a-reincarnation-${runTag}`;
  const adapter = new E2BSandbox({
    id: logicalId,
    template: 'base',
    apiKey,
    timeout: timeoutMs,
    network: {
      allowPublicTraffic: false,
      denyOut: ['0.0.0.0/0'],
    },
  });

  let firstPhysicalId;
  let secondPhysicalId;

  try {
    await adapter.ensureRunning();
    firstPhysicalId = adapter.e2b.sandboxId;
    assert.ok(firstPhysicalId);

    await adapter.e2b.files.write('/tmp/conexus-before-kill.txt', 'before');

    // Simulate provider-side physical loss without updating Mastra's local status.
    await adapter.e2b.kill();

    const handle = await adapter.processes.spawn("printf 'after' > /tmp/conexus-after-retry.txt");
    const result = await handle.wait();
    assert.equal(result.success, true, `retried command failed: ${result.stderr}`);

    secondPhysicalId = adapter.e2b.sandboxId;
    assert.ok(secondPhysicalId);
    assert.notEqual(
      secondPhysicalId,
      firstPhysicalId,
      'dead-sandbox retry should demonstrate a new physical incarnation under the same logical adapter id',
    );
    assert.equal(await adapter.e2b.files.read('/tmp/conexus-after-retry.txt'), 'after');
  } finally {
    await adapter._destroy().catch(() => undefined);
    await killPhysical(firstPhysicalId);
    if (secondPhysicalId && secondPhysicalId !== firstPhysicalId) await killPhysical(secondPhysicalId);
  }
});
