import assert from 'node:assert/strict';
import { lstat, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  sha256Bytes,
  verifyArtifactRecords,
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

test('artifact publication rejects a run root that is itself a symlink', async () => {
  const temp = await mkdtemp(path.join(tmpdir(), 'mnfs-arr-s0-run-root-link-'));
  try {
    const outside = path.join(temp, 'outside-run');
    const linkedRoot = path.join(temp, 'linked-run');
    await mkdir(outside, { recursive: true });
    await symlink(outside, linkedRoot, 'dir');
    await assert.rejects(
      () => writeRawArtifact(linkedRoot, 'raw/out.bin', Buffer.from('must-not-escape')),
      /symlink|realpath|root/u,
    );
    await assert.rejects(() => readFile(path.join(outside, 'raw/out.bin')));
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
});

test('artifact verification rejects a symlinked parent even when final bytes/hash match', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'mnfs-arr-s0-verify-root-'));
  const outside = await mkdtemp(path.join(tmpdir(), 'mnfs-arr-s0-verify-outside-'));
  try {
    const bytes = Buffer.from('outside-but-matching\n');
    await writeFile(path.join(outside, 'a.bin'), bytes);
    await symlink(outside, path.join(root, 'raw'), 'dir');
    const integrity = await verifyArtifactRecords(root, [{
      id: 'raw-a',
      path: 'raw/a.bin',
      sha256: sha256Bytes(bytes),
      sizeBytes: bytes.length,
    }]);
    assert.equal(integrity.ok, false);
    assert.ok(integrity.errors.some((error) => /symlink|escape|realpath/u.test(error)));
  } finally {
    await rm(root, { recursive: true, force: true });
    await rm(outside, { recursive: true, force: true });
  }
});

test('concurrent destination creation is never replaced by artifact publication', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'mnfs-arr-s0-artifact-race-'));
  try {
    const finalPath = path.join(root, 'raw/race.bin');
    await assert.rejects(
      () => writeRawArtifact(root, 'raw/race.bin', Buffer.from('ours\n'), {
        ops: {
          async link(_tempPath, targetPath) {
            assert.equal(targetPath, finalPath);
            await writeFile(targetPath, 'concurrent\n', { mode: 0o600 });
            const error = new Error('destination already exists');
            error.code = 'EEXIST';
            throw error;
          },
        },
      }),
      /existing artifact differs/u,
    );
    assert.equal(await readFile(finalPath, 'utf8'), 'concurrent\n');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('publication orders temp write, file fsync, no-replace link, temp unlink and directory fsync', async () => {
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
    async realpath(target) { return target; },
    async open(target, flags) {
      const label = flags === 'r' ? 'dir' : 'temp';
      const handle = fakeHandle(label);
      handles.set(target, handle);
      calls.push(`${label}:open`);
      return handle;
    },
    async link() { calls.push('link'); },
    async unlink() { calls.push('unlink'); },
  };
  await writeRawArtifact('/home/test/.local/state/mnfs/run', 'raw/a.bin', Buffer.from('abc'), { ops });
  assert.deepEqual(calls, [
    'mkdir',
    'temp:open',
    'temp:write:3',
    'temp:fsync',
    'temp:close',
    'link',
    'unlink',
    'dir:open',
    'dir:fsync',
    'dir:close',
  ]);
});
