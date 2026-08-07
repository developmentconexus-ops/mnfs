import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  requireRunId,
  resolveS0RunRoot,
  resolveS0StateRoot,
} from '../src/paths.mjs';

test('accepts only canonical ARR-S0 run ids', () => {
  const valid = 'arr-s0-20260807t120000000z-a1b2c3';
  assert.equal(requireRunId(valid), valid);
  assert.throws(() => requireRunId('../escape'), /invalid ARR-S0 run id/u);
  assert.throws(() => requireRunId('ARR-S0-UPPER'), /invalid ARR-S0 run id/u);
  assert.throws(() => requireRunId('arr-s0-20260807t12000000z-a1b2c3'), /invalid ARR-S0 run id/u);
});

test('run root stays under an explicit Linux-owned MNFS state root', async () => {
  const root = await resolveS0RunRoot('arr-s0-20260807t120000000z-a1b2c3', {
    stateRoot: '/home/example/.local/state/mnfs',
  });
  assert.equal(root, '/home/example/.local/state/mnfs/spikes/arr-s0/arr-s0-20260807t120000000z-a1b2c3');
});

test('state root uses absolute XDG_STATE_HOME before HOME fallback', async () => {
  assert.equal(
    await resolveS0StateRoot({ env: { XDG_STATE_HOME: '/home/example/.state', HOME: '/home/example' } }),
    '/home/example/.state/mnfs',
  );
  assert.equal(
    await resolveS0StateRoot({ env: { XDG_STATE_HOME: 'relative-state', HOME: '/home/example' } }),
    '/home/example/.local/state/mnfs',
  );
});

test('rejects relative, /mnt-backed and missing absolute HOME roots', async () => {
  await assert.rejects(() => resolveS0StateRoot({ stateRoot: 'relative/state' }), /absolute/u);
  await assert.rejects(() => resolveS0StateRoot({ stateRoot: '/mnt/c/mnfs-state' }), /\/mnt/u);
  await assert.rejects(() => resolveS0StateRoot({ env: { HOME: 'relative-home' } }), /absolute HOME/u);
});

test('rejects symlink components in an existing state-root prefix', async () => {
  const temp = await mkdtemp(path.join(tmpdir(), 'mnfs-arr-s0-paths-'));
  try {
    const real = path.join(temp, 'real');
    const linked = path.join(temp, 'linked');
    await mkdir(real, { recursive: true });
    await symlink(real, linked);
    await assert.rejects(
      () => resolveS0StateRoot({ stateRoot: path.join(linked, 'state', 'mnfs') }),
      /symlink/u,
    );
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
});
