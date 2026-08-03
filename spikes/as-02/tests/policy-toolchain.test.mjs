import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';

import { compilePolicy } from '../src/policy.mjs';

function directory(root, relative) {
  const path = join(root, relative);
  mkdirSync(path, { recursive: true });
  return path;
}

function file(root, relative) {
  const path = join(root, relative);
  mkdirSync(join(path, '..'), { recursive: true });
  writeFileSync(path, relative);
  return path;
}

test('allows only exact trusted toolchain and SRT package paths inside a denied HOME', async (t) => {
  const root = mkdtempSync(join(tmpdir(), 'mnfs-as02-policy-toolchain-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const realHome = directory(root, 'home/user');
  const worktreePath = directory(realHome, '.treehouse/repo/1/worktree');
  const attemptTempPath = directory(root, 'attempt');
  const brokerPath = file(root, 'trusted/broker.mjs');
  const policyRoot = directory(root, 'trusted/policy');
  const runtimeRoot = directory(root, 'runtime');
  const fakeHome = directory(root, 'fake-home');
  const mountRoot = directory(root, 'mnt');
  const nodeRuntime = directory(realHome, '.nvm/versions/node/v24.18.0');
  const sandboxPackage = directory(realHome, 'src/mnfs/spikes/as-02/node_modules/@anthropic-ai/sandbox-runtime');
  const gitCommon = directory(realHome, '.treehouse/repo/.git');
  const gitDir = directory(gitCommon, 'worktrees/worktree');
  const gitConfig = file(gitCommon, 'config');
  const gitHooks = directory(gitCommon, 'hooks');
  const gitIndex = file(gitDir, 'index');
  directory(worktreePath, '.mnfs');
  directory(worktreePath, '.pi');
  file(worktreePath, '.env');
  file(worktreePath, '.git');

  const compiled = compilePolicy({
    worktreePath,
    attemptTempPath,
    brokerPath,
    policyRoot,
    runtimeRoot,
    realHome,
    fakeHome,
    mountRoot,
    gitReadPaths: [gitCommon, gitDir, gitConfig, gitHooks, gitIndex],
    gitDenyWritePaths: [gitCommon, gitDir, gitConfig, gitHooks, gitIndex],
    trustedReadPaths: [nodeRuntime, sandboxPackage],
    network: { allowedDomains: [], deniedDomains: [] },
  });

  assert.equal(compiled.config.filesystem.denyRead.includes(realHome), true);
  assert.equal(compiled.config.filesystem.allowRead.includes(nodeRuntime), true);
  assert.equal(compiled.config.filesystem.allowRead.includes(sandboxPackage), true);
  assert.equal(compiled.config.filesystem.allowRead.includes(join(realHome, '.nvm')), false);
  assert.equal(compiled.config.filesystem.allowWrite.includes(nodeRuntime), false);
  assert.equal(compiled.config.filesystem.allowWrite.includes(sandboxPackage), false);
});
