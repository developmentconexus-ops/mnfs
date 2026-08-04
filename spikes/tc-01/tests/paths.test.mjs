import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import {
  assertLinuxOwnedAbsolutePath,
  resolveTc01RunRoot,
  resolveTc01StateRoot,
  validateRunId,
} from '../src/paths.mjs';

test('accepts only canonical TC-01 run ids', () => {
  assert.equal(validateRunId('tc01-20260803-210600-a1b2c3d4'), 'tc01-20260803-210600-a1b2c3d4');

  for (const invalid of [
    'TC01-20260803-210600-a1b2c3d4',
    'tc01-20260803-210600-A1B2C3D4',
    'tc01-20260803-210600-a1b2c3d4 ',
    'tc01/20260803-210600-a1b2c3d4',
    '../tc01-20260803-210600-a1b2c3d4',
  ]) {
    assert.throws(
      () => validateRunId(invalid),
      (error) => error?.code === 'TC01_INVALID_INPUT',
      invalid,
    );
  }
});

test('accepts Linux-owned absolute paths and rejects relative or mounted paths', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'mnfs-tc01-paths-'));
  t.after(() => rm(root, { recursive: true, force: true }));

  assert.equal(assertLinuxOwnedAbsolutePath(root, 'state root'), root);

  for (const invalid of ['relative/path', '/mnt', '/mnt/c/work', '/mnt/wsl/shared']) {
    assert.throws(
      () => assertLinuxOwnedAbsolutePath(invalid, 'state root'),
      (error) => error?.code === (invalid.startsWith('/mnt') ? 'TC01_LINUX_FILESYSTEM_REQUIRED' : 'TC01_INVALID_INPUT'),
      invalid,
    );
  }
});

test('rejects a path whose existing parent resolves below /mnt', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'mnfs-tc01-symlink-'));
  t.after(() => rm(root, { recursive: true, force: true }));

  const link = join(root, 'mounted');
  await symlink('/mnt', link);

  assert.throws(
    () => assertLinuxOwnedAbsolutePath(join(link, 'future', 'run'), 'state root'),
    (error) => error?.code === 'TC01_LINUX_FILESYSTEM_REQUIRED',
  );
});

test('resolves the default state root and a contained run root', async (t) => {
  const home = await mkdtemp(join(tmpdir(), 'mnfs-tc01-home-'));
  t.after(() => rm(home, { recursive: true, force: true }));
  await mkdir(join(home, '.local', 'state'), { recursive: true });

  const stateRoot = resolveTc01StateRoot({ env: {}, homeDir: home });
  assert.equal(stateRoot, join(home, '.local', 'state', 'mnfs'));

  const runId = 'tc01-20260803-210600-a1b2c3d4';
  assert.equal(resolveTc01RunRoot(stateRoot, runId), join(stateRoot, 'fixtures', 'tc-01', runId));
});

test('uses explicit MNFS_HOME only when it remains Linux-owned', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'mnfs-tc01-state-'));
  t.after(() => rm(root, { recursive: true, force: true }));

  assert.equal(resolveTc01StateRoot({ env: { MNFS_HOME: root }, homeDir: '/unused' }), root);
  assert.throws(
    () => resolveTc01StateRoot({ env: { MNFS_HOME: '/mnt/c/mnfs' }, homeDir: '/unused' }),
    (error) => error?.code === 'TC01_LINUX_FILESYSTEM_REQUIRED',
  );
});
