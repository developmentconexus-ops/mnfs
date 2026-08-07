import assert from 'node:assert/strict';
import { lstat, mkdtemp, readFile, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  sha256Bytes,
  writeCanonicalJsonArtifact,
  writeRawArtifact,
} from '../src/artifacts.mjs';
import { canonicalJsonBytes } from '../src/canonical-json.mjs';

test('canonical JSON sorts object keys recursively and preserves array order', () => {
  assert.equal(
    canonicalJsonBytes({ z: 1, a: { y: 2, b: 3 }, list: [{ d: 4, c: 5 }, 6] }).toString('utf8'),
    '{"a":{"b":3,"y":2},"list":[{"c":5,"d":4},6],"z":1}\n',
  );
});

test('raw artifact preserves exact bytes, sha256 and 0600 mode', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'mnfs-arr-s0-artifacts-'));
  try {
    const bytes = Buffer.from([0, 1, 2, 10, 255]);
    const meta = await writeRawArtifact(root, 'raw/sample/stdout.bin', bytes);
    assert.deepEqual(await readFile(path.join(root, meta.path)), bytes);
    assert.equal(meta.sha256, sha256Bytes(bytes));
    assert.equal(meta.sizeBytes, bytes.length);
    assert.equal((await lstat(path.join(root, meta.path))).mode & 0o777, 0o600);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('canonical JSON artifact is deterministic and idempotent only for identical bytes', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'mnfs-arr-s0-json-artifact-'));
  try {
    const first = await writeCanonicalJsonArtifact(root, 'meta/state.json', { z: 1, a: 2 });
    const second = await writeCanonicalJsonArtifact(root, 'meta/state.json', { a: 2, z: 1 });
    assert.deepEqual(second, first);
    await assert.rejects(
      () => writeCanonicalJsonArtifact(root, 'meta/state.json', { a: 3, z: 1 }),
      /existing artifact differs/u,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('artifact publication rejects traversal and symlink destinations', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'mnfs-arr-s0-artifact-symlink-'));
  try {
    await assert.rejects(() => writeRawArtifact(root, '../escape.bin', Buffer.from('x')), /artifact path/u);
    const outside = path.join(root, 'outside.bin');
    const link = path.join(root, 'linked.bin');
    await symlink(outside, link);
    await assert.rejects(() => writeRawArtifact(root, 'linked.bin', Buffer.from('x')), /symlink/u);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('publication orders temp write, file fsync, rename and directory fsync', async () => {
  const calls = [];
  const handles = new Map();
  const fakeHandle = (label) => ({
    async writeFile(bytes) { calls.push(`${label}:write:${bytes.length}`); },
    async sync() { calls.push(`${label}:fsync`); },
    async close() { calls.push(`${label}:close`); },
  });
  const ops = {
    async mkdir() { calls.push('mkdir'); },
    async lstat() { const error = new Error('missing'); error.code = 'ENOENT'; throw error; },
    async open(target, flags) {
      const label = flags === 'r' ? 'dir' : 'temp';
      const handle = fakeHandle(label);
      handles.set(target, handle);
      calls.push(`${label}:open`);
      return handle;
    },
    async rename() { calls.push('rename'); },
    async unlink() { calls.push('unlink'); },
  };
  await writeRawArtifact('/home/test/.local/state/mnfs/run', 'raw/a.bin', Buffer.from('abc'), { ops });
  assert.deepEqual(calls, [
    'mkdir',
    'temp:open',
    'temp:write:3',
    'temp:fsync',
    'temp:close',
    'rename',
    'dir:open',
    'dir:fsync',
    'dir:close',
  ]);
});
