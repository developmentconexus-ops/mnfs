import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const cliPath = resolve('bin/mnfs.mjs');

function makeGitRepository(): { root: string; runtimeHome: string } {
  const root = mkdtempSync(join(tmpdir(), 'mnfs-cli-repo-'));
  const runtimeHome = mkdtempSync(join(tmpdir(), 'mnfs-cli-home-'));
  const git = spawnSync('git', ['init', '-b', 'main'], { cwd: root, encoding: 'utf8' });
  assert.equal(git.status, 0, git.stderr);
  return { root, runtimeHome };
}

function run(root: string, runtimeHome: string, args: readonly string[]) {
  return spawnSync(process.execPath, [cliPath, ...args], {
    cwd: root,
    encoding: 'utf8',
    env: {
      ...process.env,
      MNFS_HOME: runtimeHome,
      NODE_NO_WARNINGS: '1',
    },
  });
}

test('init, mission open and status survive a fresh CLI process', () => {
  const { root, runtimeHome } = makeGitRepository();

  const initialized = run(root, runtimeHome, ['init', '--json']);
  assert.equal(initialized.status, 0, initialized.stderr);
  const identity = JSON.parse(initialized.stdout) as { repoId: string };
  assert.match(identity.repoId, /^[0-9a-f-]{36}$/i);

  const opened = run(root, runtimeHome, [
    'mission',
    'open',
    '--goal',
    'Prove fresh-process recovery',
    '--json',
  ]);
  assert.equal(opened.status, 0, opened.stderr);
  assert.equal(JSON.parse(opened.stdout).id, 'MIS-001');

  const status = run(root, runtimeHome, ['status', '--json']);
  assert.equal(status.status, 0, status.stderr);
  assert.deepEqual(JSON.parse(status.stdout), {
    schemaVersion: 1,
    missions: {
      total: 1,
      open: 1,
      closed: 0,
      active: [
        {
          id: 'MIS-001',
          goal: 'Prove fresh-process recovery',
          status: 'OPEN',
          openedAt: JSON.parse(opened.stdout).openedAt,
        },
      ],
    },
  });
});

test('commands fail with stable errors for invalid project state and arguments', () => {
  const outsideGit = mkdtempSync(join(tmpdir(), 'mnfs-cli-no-git-'));
  const outsideHome = mkdtempSync(join(tmpdir(), 'mnfs-cli-home-'));
  const outside = run(outsideGit, outsideHome, ['init']);
  assert.equal(outside.status, 1);
  assert.match(outside.stderr, /^NOT_GIT_REPOSITORY:/);

  const { root, runtimeHome } = makeGitRepository();
  const uninitialized = run(root, runtimeHome, ['status']);
  assert.equal(uninitialized.status, 1);
  assert.match(uninitialized.stderr, /^PROJECT_NOT_INITIALIZED:/);

  run(root, runtimeHome, ['init']);
  const missingGoal = run(root, runtimeHome, ['mission', 'open']);
  assert.equal(missingGoal.status, 2);
  assert.match(missingGoal.stderr, /^INVALID_ARGUMENTS:/);
});

test('init creates the runtime directory outside the project checkout', () => {
  const { root, runtimeHome } = makeGitRepository();
  mkdirSync(join(root, 'nested'));

  const initialized = run(join(root, 'nested'), runtimeHome, ['init', '--json']);
  assert.equal(initialized.status, 0, initialized.stderr);
  const output = JSON.parse(initialized.stdout) as { projectRoot: string; runtimeRoot: string };
  assert.equal(output.projectRoot, root);
  assert.ok(output.runtimeRoot.startsWith(runtimeHome));
  assert.ok(!output.runtimeRoot.startsWith(root));
});
