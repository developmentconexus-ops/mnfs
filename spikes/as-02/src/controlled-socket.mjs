import { createHash } from 'node:crypto';
import { createServer } from 'node:net';
import { chmod, lstat, mkdir, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import { as02Error, assertAs02 } from './errors.mjs';

const RUN_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;
const UNIX_SOCKET_PATH_LIMIT = 107;

function currentUid() {
  const uid = typeof process.getuid === 'function' ? process.getuid() : null;
  assertAs02(Number.isInteger(uid) && uid >= 0, 'CONTROLLED_SOCKET_INVALID', 'Controlled Unix sockets require a Linux user ID.', { uid });
  return uid;
}

function validateRunId(runId) {
  assertAs02(
    typeof runId === 'string' && RUN_ID_PATTERN.test(runId),
    'ORCHESTRATOR_PATH_INVALID',
    'Controlled socket run ID is invalid.',
    { runId },
  );
}

export function controlledSocketPath(runId, { uid = currentUid() } = {}) {
  validateRunId(runId);
  assertAs02(Number.isInteger(uid) && uid >= 0, 'CONTROLLED_SOCKET_INVALID', 'Controlled socket UID is invalid.', { uid });
  const digest = createHash('sha256').update(runId).digest('hex').slice(0, 24);
  const path = join('/tmp', `mnfs-as02-${uid}`, `${digest}.sock`);
  assertAs02(
    Buffer.byteLength(path, 'utf8') <= UNIX_SOCKET_PATH_LIMIT,
    'CONTROLLED_SOCKET_INVALID',
    'Controlled Unix socket path exceeds the Linux sockaddr_un limit.',
    { path, bytes: Buffer.byteLength(path, 'utf8') },
  );
  return path;
}

async function ensureSocketRoot(path) {
  const root = dirname(path);
  const uid = currentUid();
  await mkdir(root, { recursive: true, mode: 0o700 });
  const info = await lstat(root);
  assertAs02(info.isDirectory() && !info.isSymbolicLink(), 'CONTROLLED_SOCKET_INVALID', 'Controlled socket root must be a real directory.', { root });
  assertAs02(info.uid === uid, 'CONTROLLED_SOCKET_INVALID', 'Controlled socket root must be owned by the current Linux user.', {
    root,
    expectedUid: uid,
    actualUid: info.uid,
  });
  if ((info.mode & 0o077) !== 0) await chmod(root, 0o700);
  return root;
}

async function removeSocketFile(path) {
  try {
    const info = await lstat(path);
    if (!info.isSocket()) {
      throw as02Error('CONTROLLED_SOCKET_PATH_OCCUPIED', 'Controlled socket path is occupied by a non-socket filesystem entry.', {
        path,
        mode: info.mode,
      });
    }
    await rm(path, { force: false });
    return 'REMOVED';
  } catch (cause) {
    if (cause?.code === 'ENOENT') return 'MISSING';
    throw cause;
  }
}

export async function openControlledSocket(runId) {
  const path = controlledSocketPath(runId);
  await ensureSocketRoot(path);
  await removeSocketFile(path);

  const server = createServer((socket) => socket.end('AS02_CONTROLLED_SOCKET'));
  try {
    await new Promise((resolve, reject) => {
      const onError = (cause) => {
        server.off('listening', onListening);
        reject(cause);
      };
      const onListening = () => {
        server.off('error', onError);
        resolve();
      };
      server.once('error', onError);
      server.once('listening', onListening);
      server.listen(path);
    });
  } catch (cause) {
    await removeSocketFile(path).catch(() => {});
    throw as02Error('CONTROLLED_SOCKET_UNAVAILABLE', 'Controlled Unix socket could not be opened.', {
      path,
      cause: cause instanceof Error ? cause.message : String(cause),
    });
  }

  let closed = false;
  return Object.freeze({
    path,
    async close() {
      if (closed) return;
      closed = true;
      await new Promise((resolve, reject) => {
        server.close((cause) => (cause ? reject(cause) : resolve()));
      });
      await removeSocketFile(path);
    },
  });
}

export async function cleanupControlledSocket(runId) {
  const path = controlledSocketPath(runId);
  const result = await removeSocketFile(path);
  return { path, result };
}
