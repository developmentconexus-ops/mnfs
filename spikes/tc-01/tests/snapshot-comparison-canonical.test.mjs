import assert from 'node:assert/strict';
import test from 'node:test';

import { compareRepositorySnapshots } from '../src/git-observer.mjs';

function snapshot({ reordered = false } = {}) {
  const binding = (hash, bytes, text = undefined) => reordered
    ? {
        ...(text === undefined ? {} : { text }),
        byteLength: bytes,
        sha256: hash,
      }
    : {
        sha256: hash,
        byteLength: bytes,
        ...(text === undefined ? {} : { text }),
      };

  const entry = reordered
    ? {
        sha256: 'sha256:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
        byteLength: 4,
        mode: '0644',
        type: 'file',
        path: 'file.txt',
      }
    : {
        path: 'file.txt',
        type: 'file',
        mode: '0644',
        byteLength: 4,
        sha256: 'sha256:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
      };

  return reordered
    ? {
        workingTree: {
          entries: [entry],
          digest: 'sha256:dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
          root: '/tmp/tc01/source-repo',
          schemaVersion: 1,
        },
        trackedTree: binding(
          'sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
          41,
          '2222222222222222222222222222222222222222',
        ),
        refs: binding('sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', 58),
        localConfig: binding('sha256:9999999999999999999999999999999999999999999999999999999999999999', 142),
        porcelainStatus: binding('sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 0),
        head: binding(
          'sha256:8888888888888888888888888888888888888888888888888888888888888888',
          41,
          '1111111111111111111111111111111111111111',
        ),
        root: '/tmp/tc01/source-repo',
        schemaVersion: 1,
      }
    : {
        schemaVersion: 1,
        root: '/tmp/tc01/source-repo',
        head: binding(
          'sha256:8888888888888888888888888888888888888888888888888888888888888888',
          41,
          '1111111111111111111111111111111111111111',
        ),
        porcelainStatus: binding('sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 0),
        localConfig: binding('sha256:9999999999999999999999999999999999999999999999999999999999999999', 142),
        refs: binding('sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', 58),
        trackedTree: binding(
          'sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
          41,
          '2222222222222222222222222222222222222222',
        ),
        workingTree: {
          schemaVersion: 1,
          root: '/tmp/tc01/source-repo',
          digest: 'sha256:dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
          entries: [entry],
        },
      };
}

test('repository snapshot comparison ignores object key insertion order', () => {
  const comparison = compareRepositorySnapshots(snapshot(), snapshot({ reordered: true }));

  assert.deepEqual(comparison, {
    equal: true,
    changedFields: [],
    changes: {},
  });
});
