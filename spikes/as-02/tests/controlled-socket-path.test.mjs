import assert from 'node:assert/strict';
import { createConnection, createServer } from 'node:net';
import { rm } from 'node:fs/promises';
import test from 'node:test';

import { controlledSocketPath } from '../src/orchestrator-runtime-durable.mjs';

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

test('derives a deterministic Linux Unix-socket path below sockaddr_un limits', async (t) => {
  const runId = 'as02-20260803t135149712z-911f79';
  const path = controlledSocketPath(runId);

  assert.equal(path, controlledSocketPath(runId));
  assert.notEqual(path, controlledSocketPath('as02-20260803t135149712z-911f80'));
  assert.match(path, /^\/tmp\/mnfs-as02-[a-f0-9]{24}\.sock$/u);
  assert.equal(Buffer.byteLength(path, 'utf8') <= 107, true);

  await rm(path, { force: true });
  t.after(() => rm(path, { force: true }));

  const server = createServer((socket) => socket.end());
  t.after(() => new Promise((resolve) => server.close(resolve)));
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(path, resolve);
  });
  await connect(path);
});

test('rejects unsafe run ids before deriving a socket path', () => {
  for (const runId of ['', '../escape', 'UPPER', 'space value', 'a/b']) {
    assert.throws(
      () => controlledSocketPath(runId),
      (error) => error?.code === 'ORCHESTRATOR_PATH_INVALID',
    );
  }
});
