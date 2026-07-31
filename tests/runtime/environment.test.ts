import assert from 'node:assert/strict';
import test from 'node:test';

import { inspectEnvironment } from '../../src/runtime/environment.ts';

test('reports a ready WSL2 environment when required tools are present', () => {
  const installed = new Map([
    ['git', '/usr/bin/git'],
    ['pi', '/home/leandro/.local/bin/pi'],
  ]);

  const report = inspectEnvironment({
    platform: 'linux',
    release: '5.15.153.1-microsoft-standard-WSL2',
    nodeVersion: 'v24.18.0',
    cwd: '/home/leandro/src/mnfs',
    which: (name) => installed.get(name) ?? null,
  });

  assert.equal(report.ready, true);
  assert.equal(report.environment, 'wsl2');
  assert.deepEqual(report.missingRequired, []);
  assert.deepEqual(report.missingOptional, ['lavish-axi', 'treehouse', 'herdr']);
});

test('fails readiness outside WSL2', () => {
  const report = inspectEnvironment({
    platform: 'linux',
    release: '6.8.0-generic',
    nodeVersion: 'v24.18.0',
    cwd: '/home/user/src/mnfs',
    which: () => '/usr/bin/tool',
  });

  assert.equal(report.ready, false);
  assert.equal(report.environment, 'linux');
  assert.ok(report.problems.some((problem) => problem.code === 'WSL2_REQUIRED'));
});

test('fails readiness when the repository is under a Windows-mounted drive', () => {
  const report = inspectEnvironment({
    platform: 'linux',
    release: '5.15.153.1-microsoft-standard-WSL2',
    nodeVersion: 'v24.18.0',
    cwd: '/mnt/c/Users/Leandro/src/mnfs',
    which: () => '/usr/bin/tool',
  });

  assert.equal(report.ready, false);
  assert.ok(report.problems.some((problem) => problem.code === 'LINUX_FILESYSTEM_REQUIRED'));
});

test('fails readiness below the supported Node floor', () => {
  const report = inspectEnvironment({
    platform: 'linux',
    release: '5.15.153.1-microsoft-standard-WSL2',
    nodeVersion: 'v22.16.0',
    cwd: '/home/leandro/src/mnfs',
    which: () => '/usr/bin/tool',
  });

  assert.equal(report.ready, false);
  assert.ok(report.problems.some((problem) => problem.code === 'NODE_VERSION_UNSUPPORTED'));
});

test('fails readiness when a required tool is missing but only warns for optional tools', () => {
  const report = inspectEnvironment({
    platform: 'linux',
    release: '5.15.153.1-microsoft-standard-WSL2',
    nodeVersion: 'v24.18.0',
    cwd: '/home/leandro/src/mnfs',
    which: (name) => (name === 'git' ? '/usr/bin/git' : null),
  });

  assert.equal(report.ready, false);
  assert.deepEqual(report.missingRequired, ['pi']);
  assert.deepEqual(report.missingOptional, ['lavish-axi', 'treehouse', 'herdr']);
});
