import assert from 'node:assert/strict';
import { chmod, lstat, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  sha256Bytes,
  verifyArtifactRecords,
  writeJsonArtifact,
  writeRawArtifact,
} from '../src/artifacts.mjs';

const BINDING = Object.freeze({
  runId: 'run-s1-0001',
  runKey: `sha256:${'d'.repeat(64)}`,
  candidateShape: 'PI-SDK',
  contractHash: `sha256:${'a'.repeat(64)}`,
  fixtureHash: `sha256:${'b'.repeat(64)}`,
});

test('publishes private raw artifacts with exact hash-bound identity and no replacement', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'mnfs-arr-s1-artifacts-'));
  try {
    const bytes = Buffer.from([0, 1, 2, 10, 255]);
    const first = await writeRawArtifact(root, 'raw/stdout.bin', bytes, {
      binding: BINDING,
      kind: 'stdout',
    });
    const second = await writeRawArtifact(root, 'raw/stdout.bin', bytes, {
      binding: BINDING,
      kind: 'stdout',
    });

    assert.deepEqual(second, first);
    assert.equal(first.sha256, sha256Bytes(bytes));
    assert.equal(first.sizeBytes, bytes.length);
    assert.equal(first.binding.runKey, BINDING.runKey);
    assert.equal(Object.hasOwn(first, 'bytes'), false);
    assert.deepEqual(await readFile(path.join(root, first.path)), bytes);
    assert.equal((await lstat(path.join(root, first.path))).mode & 0o777, 0o600);

    await assert.rejects(
      () => writeRawArtifact(root, 'raw/stdout.bin', Buffer.from('replacement'), {
        binding: BINDING,
        kind: 'stdout',
      }),
      /immutable|differs/u,
    );
    assert.deepEqual(await readFile(path.join(root, first.path)), bytes);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('verifies artifact bytes and binding, and detects mutation or wrong run identity', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'mnfs-arr-s1-artifact-integrity-'));
  try {
    const record = await writeJsonArtifact(root, 'meta/observation.json', {
      status: 'observed',
      values: [1, 2, 3],
    }, { binding: BINDING, kind: 'metadata' });
    assert.equal((await verifyArtifactRecords(root, [record], BINDING)).ok, true);

    await writeFile(path.join(root, record.path), '{"status":"tampered"}\n');
    const tampered = await verifyArtifactRecords(root, [record], BINDING);
    assert.equal(tampered.ok, false);
    assert.ok(tampered.errors.some((error) => /hash|size/u.test(error)));

    const wrongBinding = { ...BINDING, runKey: `sha256:${'e'.repeat(64)}` };
    const wrongRun = await verifyArtifactRecords(root, [record], wrongBinding);
    assert.equal(wrongRun.ok, false);
    assert.ok(wrongRun.errors.some((error) => /binding|run/u.test(error)));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('rejects credential and complete-environment persistence and permission drift', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'mnfs-arr-s1-artifact-policy-'));
  try {
    await assert.rejects(
      () => writeRawArtifact(root, 'raw/token.txt', Buffer.from('secret'), {
        binding: BINDING,
        kind: 'credential',
      }),
      /credential|environment|persist/u,
    );
    await assert.rejects(
      () => writeJsonArtifact(root, 'raw/env.json', { PATH: '/bin', TOKEN: 'secret' }, {
        binding: BINDING,
        kind: 'complete-environment',
      }),
      /credential|environment|persist/u,
    );

    const record = await writeRawArtifact(root, 'raw/stderr.bin', Buffer.from('bounded\n'), {
      binding: BINDING,
      kind: 'stderr',
    });
    await chmod(path.join(root, record.path), 0o644);
    const integrity = await verifyArtifactRecords(root, [record], BINDING);
    assert.equal(integrity.ok, false);
    assert.ok(integrity.errors.some((error) => /0600|mode|permission/u.test(error)));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('rejects credential-shaped payloads even when a caller uses a generic output kind', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'mnfs-arr-s1-artifact-secret-payload-'));
  try {
    await assert.rejects(
      () => writeRawArtifact(root, 'raw/output.log', Buffer.from('Authorization: Bearer raw-secret\n'), {
        binding: BINDING,
        kind: 'stdout',
      }),
      /credential|secret|persist/u,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
