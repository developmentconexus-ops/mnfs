import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { writeDurableAtomic } from '../src/durable-write.mjs';

test('durable atomic write fsyncs bytes before rename and the directory after rename', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'mnfs-tc01-durable-write-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const destination = join(root, 'artifacts', 'manifest.json');
  const events = [];

  const { open, mkdir, rename, rm: remove } = await import('node:fs/promises');
  const openObserved = async (path, flags) => {
    const handle = await open(path, flags);
    return {
      async writeFile(bytes) {
        events.push(['write', path, Buffer.from(bytes).toString('utf8')]);
        return handle.writeFile(bytes);
      },
      async sync() {
        events.push(['sync', path]);
        return handle.sync();
      },
      async close() {
        events.push(['close', path]);
        return handle.close();
      },
    };
  };

  await writeDurableAtomic(destination, Buffer.from('{"ok":true}\n'), {
    mkdir,
    open: openObserved,
    rename: async (from, to) => {
      events.push(['rename', from, to]);
      return rename(from, to);
    },
    rm: remove,
    randomUUID: () => 'fixed',
  });

  assert.equal(await readFile(destination, 'utf8'), '{"ok":true}\n');
  const temporaryEntries = (await readdir(join(root, 'artifacts'))).filter((name) => name.endsWith('.tmp'));
  assert.deepEqual(temporaryEntries, []);

  const fileSyncIndex = events.findIndex(([kind, path]) => kind === 'sync' && path.endsWith('.tmp'));
  const renameIndex = events.findIndex(([kind]) => kind === 'rename');
  const directorySyncIndex = events.findIndex(([kind, path]) => kind === 'sync' && path === join(root, 'artifacts'));
  assert.equal(fileSyncIndex >= 0, true);
  assert.equal(renameIndex > fileSyncIndex, true);
  assert.equal(directorySyncIndex > renameIndex, true);
});
