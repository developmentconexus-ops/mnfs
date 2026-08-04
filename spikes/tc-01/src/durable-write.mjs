import { randomUUID } from 'node:crypto';
import { mkdir, open, rename, rm } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';

import { assertTc01 } from './errors.mjs';
import { assertLinuxOwnedAbsolutePath } from './paths.mjs';

async function syncDirectory(path, openFile) {
  const handle = await openFile(path, 'r');
  try {
    await handle.sync();
  } finally {
    await handle.close();
  }
}

export async function writeDurableAtomic(path, value, dependencies = {}) {
  const destination = assertLinuxOwnedAbsolutePath(path, 'TC-01 durable destination');
  const bytes = Buffer.isBuffer(value) || value instanceof Uint8Array
    ? Buffer.from(value)
    : null;
  assertTc01(bytes !== null, 'TC01_INVALID_INPUT', 'TC-01 durable writes require bytes.');

  const makeDirectory = dependencies.mkdir ?? mkdir;
  const openFile = dependencies.open ?? open;
  const move = dependencies.rename ?? rename;
  const remove = dependencies.rm ?? rm;
  const uuid = dependencies.randomUUID ?? randomUUID;
  const directory = dirname(destination);
  await makeDirectory(directory, { recursive: true });
  const temporary = join(directory, `.${basename(destination)}.${process.pid}.${uuid()}.tmp`);

  let fileHandle;
  try {
    fileHandle = await openFile(temporary, 'wx');
    await fileHandle.writeFile(bytes);
    await fileHandle.sync();
    await fileHandle.close();
    fileHandle = null;
    await move(temporary, destination);
    await syncDirectory(directory, openFile);
    return destination;
  } catch (error) {
    if (fileHandle) await fileHandle.close().catch(() => {});
    await remove(temporary, { force: true }).catch(() => {});
    throw error;
  }
}

export async function syncDurableFile(path, dependencies = {}) {
  const file = assertLinuxOwnedAbsolutePath(path, 'TC-01 durable file');
  const openFile = dependencies.open ?? open;
  const handle = await openFile(file, 'r');
  try {
    await handle.sync();
  } finally {
    await handle.close();
  }
  await syncDirectory(dirname(file), openFile);
}
