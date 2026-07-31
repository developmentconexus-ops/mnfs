import assert from 'node:assert/strict';
import test from 'node:test';

import { resolveRuntimeRoot } from '../../src/runtime/paths.js';

test('same committed repository id resolves to one runtime root across worktrees', () => {
  const first = resolveRuntimeRoot({
    repoId: '018f8472-a2fd-7ca7-a090-5f43f50f7142',
    env: { MNFS_HOME: '/home/leandro/.mnfs' },
    homeDir: '/home/leandro',
  });
  const second = resolveRuntimeRoot({
    repoId: '018f8472-a2fd-7ca7-a090-5f43f50f7142',
    env: { MNFS_HOME: '/home/leandro/.mnfs' },
    homeDir: '/home/leandro',
  });

  assert.equal(first, '/home/leandro/.mnfs/repos/018f8472-a2fd-7ca7-a090-5f43f50f7142');
  assert.equal(second, first);
});

test('runtime root defaults to the Linux user state directory', () => {
  const root = resolveRuntimeRoot({
    repoId: '018f8472-a2fd-7ca7-a090-5f43f50f7142',
    env: {},
    homeDir: '/home/leandro',
  });

  assert.equal(root, '/home/leandro/.local/state/mnfs/repos/018f8472-a2fd-7ca7-a090-5f43f50f7142');
});
