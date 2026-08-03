import assert from 'node:assert/strict';
import { mkdtemp, mkdir, realpath, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';

import {
  BROKERED_TOOL_NAMES,
  PI_BUILTIN_TOOL_NAMES,
  bashOnlyInventory,
  brokeredCandidateArgs,
  brokeredCandidateInventory,
} from '../src/pi-inventory.mjs';

const EXPECTED = ['bash', 'read', 'write', 'edit', 'grep', 'find', 'ls'];

test('bash-only override leaves every non-bash built-in available', () => {
  assert.deepEqual(PI_BUILTIN_TOOL_NAMES, EXPECTED);
  assert.deepEqual(bashOnlyInventory(), EXPECTED);
  for (const name of ['read', 'write', 'edit', 'grep', 'find', 'ls']) {
    assert.equal(bashOnlyInventory().includes(name), true);
  }
});

test('brokered candidate exposes only the reviewed seven-tool inventory', () => {
  assert.deepEqual(BROKERED_TOOL_NAMES, EXPECTED);
  assert.deepEqual(brokeredCandidateInventory(), EXPECTED);
  assert.equal(new Set(brokeredCandidateInventory()).size, 7);
});

test('brokered Pi invocation disables discovered and built-in extensions before loading one exact file', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'mnfs-as02-pi-args-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const extensionDir = join(root, 'trusted');
  const extension = join(extensionDir, 'index.ts');
  await mkdir(extensionDir, { recursive: true });
  await writeFile(extension, 'export default () => {}');
  const exact = await realpath(extension);

  assert.deepEqual(brokeredCandidateArgs(exact), [
    '--no-builtin-tools',
    '--no-extensions',
    '-e',
    exact,
  ]);
  assert.throws(
    () => brokeredCandidateArgs('relative/index.ts'),
    (error) => error?.code === 'PI_EXTENSION_PATH_INVALID',
  );
});
