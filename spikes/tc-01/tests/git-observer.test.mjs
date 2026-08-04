import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { chmod, lstat, mkdir, mkdtemp, readFile, realpath, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import test from 'node:test';

import {
  assertNoFetchInvocation,
  compareRepositorySnapshots,
  readGitInvocationLog,
  snapshotPathTree,
  snapshotRepository,
} from '../src/git-observer.mjs';
import { runProcess } from '../src/process-runner.mjs';

const wrapperPath = resolve('spikes/tc-01/bin/git');

async function temporaryRoot(t, prefix = 'mnfs-tc01-git-observer-') {
  const root = await mkdtemp(join(tmpdir(), prefix));
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}

function resolveExecutable(name) {
  const path = execFileSync('/usr/bin/env', ['which', name], { encoding: 'utf8' }).trim();
  assert.equal(isAbsolute(path), true);
  return path;
}

function git(root, args, env = {}) {
  return execFileSync(resolveExecutable('git'), args, {
    cwd: root,
    env: {
      PATH: process.env.PATH,
      HOME: join(root, 'fake-home'),
      GIT_CONFIG_NOSYSTEM: '1',
      GIT_TERMINAL_PROMPT: '0',
      LC_ALL: 'C',
      ...env,
    },
    encoding: 'utf8',
  });
}

async function initializeRepository(t) {
  const root = await temporaryRoot(t, 'mnfs-tc01-observed-repo-');
  await mkdir(join(root, 'fake-home'));
  git(root, ['init', '--initial-branch=main']);
  git(root, ['config', '--local', 'user.name', 'MNFS-TC01']);
  git(root, ['config', '--local', 'user.email', 'tc01@mnfs.invalid']);
  await writeFile(join(root, 'README.md'), 'observed repository\n', 'utf8');
  await symlink('README.md', join(root, 'readme-link'));
  git(root, ['add', 'README.md', 'readme-link']);
  git(root, ['commit', '-m', 'test: initialize observed repository'], {
    GIT_AUTHOR_DATE: '2000-01-01T00:00:00Z',
    GIT_COMMITTER_DATE: '2000-01-01T00:00:00Z',
  });
  return root;
}

function observerEnv(root) {
  return {
    PATH: process.env.PATH,
    HOME: join(root, 'fake-home'),
    GIT_CONFIG_NOSYSTEM: '1',
    GIT_TERMINAL_PROMPT: '0',
    LC_ALL: 'C',
  };
}

test('trusted wrapper logs exact argv and cwd while preserving the real Git process', async (t) => {
  const root = await temporaryRoot(t, 'mnfs-tc01-git-wrapper-');
  const fakeGit = join(root, 'fake-git.mjs');
  const wrapperLog = join(root, 'git-invocations.jsonl');
  const realTrace = join(root, 'real-git-trace.jsonl');

  await writeFile(fakeGit, `#!/usr/bin/env node
import { appendFileSync } from 'node:fs';
appendFileSync(process.env.FAKE_GIT_TRACE, JSON.stringify({ argv: process.argv.slice(2), cwd: process.cwd() }) + '\\n');
process.stdout.write(Buffer.from([0x47, 0x00, 0x4f]));
process.stderr.write('fake-git-warning\\n');
process.exit(Number(process.env.FAKE_GIT_EXIT));
`, 'utf8');
  await chmod(fakeGit, 0o755);

  const wrapperMode = (await lstat(wrapperPath)).mode & 0o777;
  assert.notEqual(wrapperMode & 0o111, 0, 'trusted Git wrapper must be executable');

  const result = await runProcess({
    file: wrapperPath,
    args: ['status', '--porcelain=v1', '--', 'name with spaces'],
    cwd: root,
    env: {
      PATH: process.env.PATH,
      TC01_REAL_GIT: fakeGit,
      TC01_GIT_LOG: wrapperLog,
      FAKE_GIT_TRACE: realTrace,
      FAKE_GIT_EXIT: '7',
    },
    timeoutMs: 2_000,
  });

  assert.equal(result.exitCode, 7);
  assert.deepEqual(result.stdout, Buffer.from([0x47, 0x00, 0x4f]));
  assert.deepEqual(result.stderr, Buffer.from('fake-git-warning\n'));

  assert.deepEqual(await readGitInvocationLog(wrapperLog), [{
    schemaVersion: 1,
    argv: ['status', '--porcelain=v1', '--', 'name with spaces'],
    cwd: await realpath(root),
  }]);

  const forwarded = JSON.parse((await readFile(realTrace, 'utf8')).trim());
  assert.deepEqual(forwarded, {
    argv: ['status', '--porcelain=v1', '--', 'name with spaces'],
    cwd: await realpath(root),
  });
});

test('trusted wrapper fails closed for missing or non-absolute control paths', async (t) => {
  const root = await temporaryRoot(t, 'mnfs-tc01-git-wrapper-invalid-');
  const validLog = join(root, 'git.jsonl');

  const missingRealGit = await runProcess({
    file: wrapperPath,
    args: ['status'],
    cwd: root,
    env: { PATH: process.env.PATH, TC01_GIT_LOG: validLog },
    timeoutMs: 2_000,
  });
  assert.equal(missingRealGit.exitCode, 2);
  assert.match(missingRealGit.stderr.toString('utf8'), /TC01_REAL_GIT.*absolute/u);

  const relativeLog = await runProcess({
    file: wrapperPath,
    args: ['status'],
    cwd: root,
    env: { PATH: process.env.PATH, TC01_REAL_GIT: resolveExecutable('git'), TC01_GIT_LOG: 'relative.jsonl' },
    timeoutMs: 2_000,
  });
  assert.equal(relativeLog.exitCode, 2);
  assert.match(relativeLog.stderr.toString('utf8'), /TC01_GIT_LOG.*absolute/u);
});

test('repository snapshots bind Git state and report changed fields independently', async (t) => {
  const root = await initializeRepository(t);
  const input = {
    gitFile: resolveExecutable('git'),
    repoPath: root,
    env: observerEnv(root),
    run: runProcess,
  };

  const before = await snapshotRepository(input);
  assert.match(before.head.text, /^[a-f0-9]{40}$/u);
  assert.equal(before.porcelainStatus.byteLength, 0);
  assert.equal(before.localConfig.byteLength > 0, true);
  assert.equal(before.refs.byteLength > 0, true);
  assert.match(before.trackedTree.text, /^[a-f0-9]{40}$/u);
  assert.deepEqual(before.workingTree.entries.map((entry) => [entry.path, entry.type]), [
    ['README.md', 'file'],
    ['readme-link', 'symlink'],
  ]);
  assert.equal(before.workingTree.entries.some((entry) => entry.path.startsWith('.git')), false);

  await writeFile(join(root, 'untracked.txt'), 'new working tree bytes\n', 'utf8');
  const afterWorkingTreeChange = await snapshotRepository(input);
  const workingTreeComparison = compareRepositorySnapshots(before, afterWorkingTreeChange);
  assert.equal(workingTreeComparison.equal, false);
  assert.deepEqual(workingTreeComparison.changedFields, ['porcelainStatus', 'workingTree']);
  assert.equal(workingTreeComparison.changes.head, undefined);
  assert.equal(workingTreeComparison.changes.trackedTree, undefined);

  git(root, ['config', '--local', 'tc01.observed', 'yes']);
  const afterConfigChange = await snapshotRepository(input);
  const configComparison = compareRepositorySnapshots(afterWorkingTreeChange, afterConfigChange);
  assert.deepEqual(configComparison.changedFields, ['localConfig']);
});

test('path-tree snapshots hash symlink metadata without following the target', async (t) => {
  const root = await temporaryRoot(t, 'mnfs-tc01-path-tree-');
  const outside = await temporaryRoot(t, 'mnfs-tc01-path-tree-outside-');
  await writeFile(join(root, 'inside.txt'), 'inside\n', 'utf8');
  await writeFile(join(outside, 'secret.txt'), 'outside-secret\n', 'utf8');
  await symlink(join(outside, 'secret.txt'), join(root, 'external-link'));
  await mkdir(join(root, '.git'));
  await writeFile(join(root, '.git', 'private-state'), 'must-not-appear\n', 'utf8');

  const snapshot = await snapshotPathTree({ root, excludeGit: true });
  assert.deepEqual(snapshot.entries.map((entry) => [entry.path, entry.type]), [
    ['external-link', 'symlink'],
    ['inside.txt', 'file'],
  ]);
  assert.equal(snapshot.entries.some((entry) => entry.path.includes('private-state')), false);
  assert.equal(snapshot.entries.find((entry) => entry.path === 'external-link')?.target, join(outside, 'secret.txt'));
  assert.match(snapshot.digest, /^sha256:[a-f0-9]{64}$/u);
});

test('fetch observations fail closed while ordinary Git commands remain admissible', () => {
  assert.doesNotThrow(() => assertNoFetchInvocation([
    { schemaVersion: 1, argv: ['status', '--json'], cwd: '/tmp/tc01' },
    { schemaVersion: 1, argv: ['worktree', 'list'], cwd: '/tmp/tc01' },
  ]));

  assert.throws(
    () => assertNoFetchInvocation([
      { schemaVersion: 1, argv: ['fetch', '--prune'], cwd: '/tmp/tc01' },
    ]),
    (error) => error?.code === 'TC01_EVIDENCE_INVALID' && error?.details?.argv?.[0] === 'fetch',
  );
});
