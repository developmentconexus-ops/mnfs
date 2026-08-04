import assert from 'node:assert/strict';
import { mkdtemp, rm, stat, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

const DURABLE_ARTIFACT_SPECIFIER = '../../src/runtime/' + 'durable-artifact.js';

interface DurableArtifactModule {
  writeDurableFile(filePath: string, bytes: Buffer, mode: number): Promise<void>;
  readRegularFileNoSymlink(filePath: string): Promise<Buffer>;
}

function describeError(error: unknown): string {
  return error instanceof Error ? `${error.name}: ${error.message}` : String(error);
}

async function loadDurableArtifact(): Promise<DurableArtifactModule> {
  try {
    return await import(DURABLE_ARTIFACT_SPECIFIER) as DurableArtifactModule;
  } catch (error) {
    assert.fail(`M01 durable Artifact writer is not implemented: ${describeError(error)}`);
  }
}

async function withTemporaryDirectory<T>(operation: (directory: string) => Promise<T>): Promise<T> {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'mnfs-m01-durable-artifact-'));
  try {
    return await operation(directory);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

test('publishes exact immutable bytes with the requested file mode', async () => {
  const artifacts = await loadDurableArtifact();

  await withTemporaryDirectory(async (directory) => {
    const artifactPath = path.join(directory, 'evidence.bin');
    const expected = Buffer.from([0, 255, 10, 65, 66, 67]);

    await artifacts.writeDurableFile(artifactPath, expected, 0o600);
    assert.deepEqual(await artifacts.readRegularFileNoSymlink(artifactPath), expected);
    assert.equal((await stat(artifactPath)).mode & 0o777, 0o600);

    await artifacts.writeDurableFile(artifactPath, expected, 0o600);
    await assert.rejects(
      artifacts.writeDurableFile(artifactPath, Buffer.from('different'), 0o600),
    );
    assert.deepEqual(await artifacts.readRegularFileNoSymlink(artifactPath), expected);
  });
});

test('rejects symlink reads and writes without mutating the target', async () => {
  const artifacts = await loadDurableArtifact();

  await withTemporaryDirectory(async (directory) => {
    const targetPath = path.join(directory, 'target.bin');
    const linkPath = path.join(directory, 'link.bin');
    const original = Buffer.from('operator-owned');
    await writeFile(targetPath, original);
    await symlink(targetPath, linkPath);

    await assert.rejects(artifacts.readRegularFileNoSymlink(linkPath));
    await assert.rejects(artifacts.writeDurableFile(linkPath, Buffer.from('replacement'), 0o600));
    assert.deepEqual(await artifacts.readRegularFileNoSymlink(targetPath), original);
  });
});

test('leaves no visible partial final when publication fails', async () => {
  const artifacts = await loadDurableArtifact();

  await withTemporaryDirectory(async (directory) => {
    const artifactPath = path.join(directory, 'occupied');
    await writeFile(artifactPath, Buffer.from('existing'));

    await assert.rejects(
      artifacts.writeDurableFile(artifactPath, Buffer.alloc(128, 7), 0o600),
    );
    assert.deepEqual(
      await artifacts.readRegularFileNoSymlink(artifactPath),
      Buffer.from('existing'),
    );
  });
});
