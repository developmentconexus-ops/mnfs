import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ConexusWriteE2BSandbox,
  PhysicalIncarnationGuard,
  PhysicalIncarnationLostError,
  PhysicalIncarnationMismatchError,
  LineageQuarantinedError,
} from '../src/physical-incarnation-guard.mjs';

function fakeSandbox({ physicalId = 'physical-a', onSpawn } = {}) {
  let spawnCalls = 0;
  const sandbox = {
    status: 'running',
    e2b: { sandboxId: physicalId },
    ensureRunning: async () => undefined,
    processes: {
      spawn: async (command, options) => {
        spawnCalls += 1;
        if (onSpawn) return onSpawn({ sandbox, command, options, spawnCalls });
        return {
          wait: async () => ({ success: true, exitCode: 0, stdout: '', stderr: '' }),
        };
      },
    },
  };
  return { sandbox, getSpawnCalls: () => spawnCalls };
}

test('guard subclass neutralizes Mastra dead-sandbox auto retry', async () => {
  const sandbox = new ConexusWriteE2BSandbox({
    id: 'qualification-no-retry',
    template: 'conexus-qualification-no-provider-io',
  });
  let attempts = 0;

  await assert.rejects(
    sandbox.retryOnDead(async () => {
      attempts += 1;
      throw new Error('Sandbox not found');
    }),
    /Sandbox not found/,
  );

  assert.equal(attempts, 1, 'write-capable dead-sandbox operation must never be transparently replayed');
});

test('dead physical sandbox quarantines lineage and prevents a second write admission', async () => {
  const { sandbox, getSpawnCalls } = fakeSandbox({
    onSpawn: async () => {
      throw new Error('Sandbox not found');
    },
  });
  const guard = new PhysicalIncarnationGuard({ sandbox });
  assert.equal(await guard.bind(), 'physical-a');

  await assert.rejects(guard.spawnWrite('printf first'), PhysicalIncarnationLostError);
  assert.equal(guard.quarantined, true);
  assert.equal(getSpawnCalls(), 1);

  await assert.rejects(guard.spawnWrite('printf second'), LineageQuarantinedError);
  assert.equal(getSpawnCalls(), 1, 'quarantined lineage must refuse before touching the sandbox again');
});

test('CONTINUE_LINEAGE binding rejects a different physical incarnation before write I/O', async () => {
  const { sandbox, getSpawnCalls } = fakeSandbox({ physicalId: 'physical-b' });
  const guard = new PhysicalIncarnationGuard({ sandbox, expectedPhysicalId: 'physical-a' });

  await assert.rejects(guard.bind(), PhysicalIncarnationMismatchError);
  assert.equal(guard.quarantined, true);
  assert.equal(getSpawnCalls(), 0);
});

test('successful write is attributed only when physical incarnation is stable before and after', async () => {
  const { sandbox } = fakeSandbox();
  const guard = new PhysicalIncarnationGuard({ sandbox });
  const bound = await guard.bind();
  const completed = await guard.spawnWrite('printf stable');

  assert.equal(bound, 'physical-a');
  assert.equal(completed.physicalSandboxId, 'physical-a');
  assert.equal(completed.result.success, true);
  assert.equal(guard.quarantined, false);
});

test('post-write physical change is detected and quarantined instead of becoming silent continuity', async () => {
  const { sandbox } = fakeSandbox({
    onSpawn: async ({ sandbox: target }) => {
      target.e2b = { sandboxId: 'physical-b' };
      return {
        wait: async () => ({ success: true, exitCode: 0, stdout: '', stderr: '' }),
      };
    },
  });
  const guard = new PhysicalIncarnationGuard({ sandbox });
  await guard.bind();

  await assert.rejects(guard.spawnWrite('printf changed'), PhysicalIncarnationMismatchError);
  assert.equal(guard.quarantined, true);
});
