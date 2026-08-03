import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';

import { canonicalJson, sha256Text } from '../src/canonical-json.mjs';
import { compilePolicy, buildWorkerEnv, assertPolicyHash } from '../src/policy.mjs';

function createPath(root, relative, kind = 'directory') {
  const path = join(root, relative);
  if (kind === 'file') {
    mkdirSync(join(path, '..'), { recursive: true });
    writeFileSync(path, relative);
  } else {
    mkdirSync(path, { recursive: true });
  }
  return path;
}

function createPolicyFixture() {
  const root = mkdtempSync(join(tmpdir(), 'mnfs-as02-policy-'));
  const realHome = createPath(root, 'real-home');
  const worktreePath = createPath(realHome, 'worktrees/as02');
  const attemptTempPath = createPath(root, 'attempt-temp');
  const brokerPath = createPath(root, 'trusted/broker.mjs', 'file');
  const policyRoot = createPath(root, 'trusted/policy');
  const runtimeRoot = createPath(root, 'runtime');
  const fakeHome = createPath(root, 'fake-home');
  const mountRoot = createPath(root, 'mnt');
  const gitCommon = createPath(realHome, 'treehouse/git-common');
  const gitDir = createPath(realHome, 'treehouse/git-common/worktrees/as02');
  const gitConfig = createPath(realHome, 'treehouse/git-common/config', 'file');
  const gitHooks = createPath(realHome, 'treehouse/git-common/hooks');
  const gitIndex = createPath(realHome, 'treehouse/git-common/worktrees/as02/index', 'file');
  createPath(worktreePath, '.mnfs');
  createPath(worktreePath, '.pi');
  createPath(worktreePath, '.env', 'file');
  createPath(worktreePath, '.git', 'file');

  return {
    root,
    input: {
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
      network: {
        allowedDomains: [],
        deniedDomains: [],
      },
    },
  };
}

test('canonical JSON ignores object key order but preserves array order', () => {
  const first = canonicalJson({ z: 1, nested: { b: 2, a: 1 }, list: ['a', 'b'] });
  const reordered = canonicalJson({ list: ['a', 'b'], nested: { a: 1, b: 2 }, z: 1 });
  const changedArray = canonicalJson({ list: ['b', 'a'], nested: { a: 1, b: 2 }, z: 1 });

  assert.equal(first, reordered);
  assert.equal(sha256Text(first), sha256Text(reordered));
  assert.notEqual(first, changedArray);
  assert.notEqual(sha256Text(first), sha256Text(changedArray));
});

test('compiles a literal, fail-closed network-off policy for Linux', async (t) => {
  const fixture = createPolicyFixture();
  t.after(() => rm(fixture.root, { recursive: true, force: true }));

  const compiled = compilePolicy(fixture.input);

  assert.deepEqual(compiled.config.network, {
    allowedDomains: [],
    deniedDomains: [],
    allowUnixSockets: [],
    allowAllUnixSockets: false,
    allowLocalBinding: false,
  });
  assert.equal(compiled.config.enableWeakerNestedSandbox, false);
  assert.equal(compiled.config.enableWeakerNetworkIsolation, false);
  assert.equal(compiled.config.mandatoryDenySearchDepth, 10);
  assert.deepEqual(compiled.config.filesystem.allowWrite, [
    fixture.input.worktreePath,
    fixture.input.attemptTempPath,
  ]);

  for (const required of [
    join(fixture.input.worktreePath, '.mnfs'),
    join(fixture.input.worktreePath, '.pi'),
    join(fixture.input.worktreePath, '.env'),
    join(fixture.input.worktreePath, '.git'),
    fixture.input.policyRoot,
    ...fixture.input.gitDenyWritePaths,
  ]) {
    assert.equal(compiled.config.filesystem.denyWrite.includes(required), true, `missing denyWrite ${required}`);
  }

  for (const broadRoot of [fixture.input.realHome, fixture.input.fakeHome, fixture.input.mountRoot]) {
    assert.equal(
      compiled.config.filesystem.denyWrite.includes(broadRoot),
      false,
      `broad denyWrite would override a nested allowed worktree: ${broadRoot}`,
    );
  }

  for (const required of [
    fixture.input.realHome,
    fixture.input.fakeHome,
    fixture.input.mountRoot,
    fixture.input.policyRoot,
    fixture.input.runtimeRoot,
  ]) {
    assert.equal(compiled.config.filesystem.denyRead.includes(required), true, `missing denyRead ${required}`);
  }

  for (const required of [
    fixture.input.worktreePath,
    fixture.input.brokerPath,
    fixture.input.attemptTempPath,
    ...fixture.input.gitReadPaths,
  ]) {
    assert.equal(compiled.config.filesystem.allowRead.includes(required), true, `missing allowRead ${required}`);
  }

  assert.equal(compiled.hash, sha256Text(compiled.canonical));
  assert.equal(compiled.canonical, canonicalJson(compiled.config));
  assert.doesNotMatch(compiled.canonical, /credential|token|secret/i);
});

test('rejects Linux glob syntax instead of pretending it is enforced', async (t) => {
  const fixture = createPolicyFixture();
  t.after(() => rm(fixture.root, { recursive: true, force: true }));

  assert.throws(
    () => compilePolicy({ ...fixture.input, gitReadPaths: [...fixture.input.gitReadPaths, '/tmp/**/*.pem'] }),
    (error) => error?.code === 'INVALID_POLICY_PATH',
  );
});

test('constructs the Worker environment from an explicit allowlist', async (t) => {
  const fixture = createPolicyFixture();
  t.after(() => rm(fixture.root, { recursive: true, force: true }));
  const usrBin = createPath(fixture.root, 'usr-bin');
  const localBin = createPath(fixture.root, 'local-bin');

  const worker = buildWorkerEnv(
    {
      PATH: '/usr/bin:/mnt/c/Windows/System32',
      LANG: 'pt_BR.UTF-8',
      LC_ALL: 'C.UTF-8',
      NODE_OPTIONS: '--inspect',
      ANTHROPIC_API_KEY: 'not-copied',
      SSH_AUTH_SOCK: '/tmp/agent.sock',
      AWS_SECRET_ACCESS_KEY: 'not-copied',
      DOCKER_HOST: 'unix:///var/run/docker.sock',
      BROWSER: 'chrome.exe',
      WSLENV: 'TOKEN/u',
      RANDOM_USER_VALUE: 'not-copied',
    },
    {
      fakeHome: fixture.input.fakeHome,
      attemptTemp: fixture.input.attemptTempPath,
      executablePaths: [usrBin, localBin],
    },
  );

  assert.deepEqual(worker, {
    PATH: `${usrBin}:${localBin}`,
    HOME: fixture.input.fakeHome,
    TMPDIR: fixture.input.attemptTempPath,
    LANG: 'pt_BR.UTF-8',
    LC_ALL: 'C.UTF-8',
    GIT_OPTIONAL_LOCKS: '0',
  });
});

test('requires full SHA-256 policy hashes and rejects stale values', () => {
  const first = `sha256:${'a'.repeat(64)}`;
  const second = `sha256:${'b'.repeat(64)}`;

  assert.doesNotThrow(() => assertPolicyHash(first, first));
  assert.throws(
    () => assertPolicyHash(first, second),
    (error) => error?.code === 'POLICY_HASH_MISMATCH',
  );
  assert.throws(
    () => assertPolicyHash('sha256:abc', 'sha256:abc'),
    (error) => error?.code === 'POLICY_HASH_MISMATCH',
  );
});
