import assert from 'node:assert/strict';
import { createConnection } from 'node:net';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import test from 'node:test';

import {
  cleanupControlledSocket,
  controlledSocketPath,
  openControlledSocket,
} from '../src/controlled-socket.mjs';

function connect(path) {
  return new Promise((resolve, reject) => {
    const socket = createConnection({ path });
    socket.once('connect', () => {
      socket.destroy();
      resolve();
    });
    socket.once('error', reject);
  });
}

test('derives a deterministic per-user Unix-socket path below sockaddr_un limits', () => {
  const runId = 'as02-20260803t135149712z-911f79';
  const path = controlledSocketPath(runId, { uid: 1000 });

  assert.equal(path, controlledSocketPath(runId, { uid: 1000 }));
  assert.notEqual(path, controlledSocketPath('as02-20260803t135149712z-911f80', { uid: 1000 }));
  assert.match(path, /^\/tmp\/mnfs-as02-1000\/[a-f0-9]{24}\.sock$/u);
  assert.equal(Buffer.byteLength(path, 'utf8') <= 107, true);
});

test('opens, closes and recreates the same controlled socket path', async (t) => {
  const runId = 'as02-20260803t135149712z-a10001';
  const path = controlledSocketPath(runId);
  t.after(() => rm(dirname(path), { recursive: true, force: true }));

  const first = await openControlledSocket(runId);
  assert.equal(first.path, path);
  await connect(path);
  await first.close();

  const missing = await cleanupControlledSocket(runId);
  assert.equal(missing.result, 'MISSING');

  const second = await openControlledSocket(runId);
  assert.equal(second.path, path);
  await connect(path);
  await second.close();
});

test('fails closed when the socket path is occupied by a regular file', async (t) => {
  const runId = 'as02-20260803t135149712z-a10002';
  const path = controlledSocketPath(runId);
  await mkdir(dirname(path), { recursive: true, mode: 0o700 });
  await writeFile(path, 'do-not-delete', { mode: 0o600 });
  t.after(() => rm(dirname(path), { recursive: true, force: true }));

  await assert.rejects(
    () => openControlledSocket(runId),
    (error) => error?.code === 'CONTROLLED_SOCKET_PATH_OCCUPIED',
  );
  assert.equal(await readFile(path, 'utf8'), 'do-not-delete');
});

test('rejects unsafe run ids before deriving or touching a socket path', async () => {
  for (const runId of ['', '../escape', 'UPPER', 'space value', 'a/b']) {
    assert.throws(
      () => controlledSocketPath(runId),
      (error) => error?.code === 'ORCHESTRATOR_PATH_INVALID',
    );
    await assert.rejects(
      () => openControlledSocket(runId),
      (error) => error?.code === 'ORCHESTRATOR_PATH_INVALID',
    );
  }
});
