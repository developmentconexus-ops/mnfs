import assert from 'node:assert/strict';
import test from 'node:test';

import { classifyPreflight, runPreflight } from '../src/preflight.mjs';

function processResult(stdout = '', { exitCode = 0, stderr = '' } = {}) {
  return {
    exitCode,
    signal: null,
    stdout: Buffer.from(stdout),
    stderr: Buffer.from(stderr),
    startedAt: '2026-08-03T02:00:00.000Z',
    finishedAt: '2026-08-03T02:00:00.010Z',
  };
}

function fakeRunner(outputs) {
  const calls = [];
  const runner = async (spec) => {
    calls.push(spec);
    const key = `${spec.file}\0${spec.args.join('\0')}`;
    if (!Object.hasOwn(outputs, key)) throw new Error(`unexpected command: ${key}`);
    return outputs[key];
  };
  runner.calls = calls;
  return runner;
}

const READY_OUTPUTS = {
  'uname\0-a': processResult('Linux host 6.6.87.2-microsoft-standard-WSL2 x86_64 GNU/Linux\n'),
  'node\0--version': processResult('v24.18.0\n'),
  'npm\0--version': processResult('11.16.0\n'),
  'pi\0--version': processResult('pi 0.50.2\n'),
  'treehouse\0--version': processResult('treehouse 0.4.0\n'),
  'bwrap\0--version': processResult('bubblewrap 0.11.0\n'),
  'socat\0-V': processResult('socat version 1.8.0.3\n'),
  'rg\0--version': processResult('ripgrep 14.1.1\n'),
  'git\0--version': processResult('git version 2.54.0\n'),
  '/bin/bash\0--version': processResult('GNU bash, version 5.2.21\n'),
  'curl\0--version': processResult('curl 8.5.0\n'),
  '/usr/bin/time\0--version': processResult('time (GNU Time) 1.9\n'),
};

const TEXT_FILES = {
  '/proc/version': 'Linux version 6.6.87.2-microsoft-standard-WSL2',
  '/etc/os-release': 'NAME="Ubuntu"\nVERSION_ID="24.04"\n',
  '/proc/sys/kernel/apparmor_restrict_unprivileged_userns': '1\n',
  '/proc/sys/kernel/unprivileged_userns_clone': '1\n',
};

function dependencies(overrides = {}) {
  const runner = fakeRunner({ ...READY_OUTPUTS, ...(overrides.outputs ?? {}) });
  return {
    runner,
    env: { PATH: '/usr/bin:/bin', WSL_DISTRO_NAME: 'Ubuntu-24.04' },
    readText: async (path) => {
      if (!Object.hasOwn(TEXT_FILES, path)) throw Object.assign(new Error('missing'), { code: 'ENOENT' });
      return TEXT_FILES[path];
    },
    realpath: async (path) => path,
    lstat: async (path) => {
      if (path === '/var/run/docker.sock') return { isSocket: () => true };
      throw Object.assign(new Error('missing'), { code: 'ENOENT' });
    },
    checkSandboxDependencies: async () => ({ errors: [], warnings: [] }),
    repositoryPath: '/home/leandro/src/mnfs',
    ...overrides.dependencies,
  };
}

test('reports a READY canonical WSL2 host without mutating policy', async () => {
  const input = dependencies();
  const report = await runPreflight(input);

  assert.equal(classifyPreflight(report), 'READY');
  assert.equal(report.status, 'READY');
  assert.equal(report.environment.wsl, true);
  assert.equal(report.environment.distro, 'Ubuntu-24.04');
  assert.equal(report.environment.osRelease.VERSION_ID, '24.04');
  assert.equal(report.environment.architecture, 'x86_64');
  assert.equal(report.repository.path, '/home/leandro/src/mnfs');
  assert.equal(report.repository.linuxFilesystem, true);
  assert.equal(report.tools.node.version, 'v24.18.0');
  assert.equal(report.tools.pi.available, true);
  assert.equal(report.tools.treehouse.available, true);
  assert.equal(report.primitives.dockerSocket, 'PRESENT_NOT_OPENED');
  assert.equal(report.hostPolicy.apparmorRestrictsUnprivilegedUserns, true);
  assert.equal(report.hostPolicy.unprivilegedUsernsClone, true);
  assert.deepEqual(report.sandboxRuntime, { errors: [], warnings: [] });

  for (const call of input.runner.calls) {
    assert.equal(call.cwd, '/home/leandro/src/mnfs');
    assert.deepEqual(call.env, { PATH: '/usr/bin:/bin' });
    assert.equal(call.timeoutMs, 10_000);
    assert.equal(call.args.some((arg) => /sudo|sysctl|-w|wsl\.exe|powershell/iu.test(arg)), false);
    assert.equal(/sudo|sysctl|wsl\.exe|powershell/iu.test(call.file), false);
  }
});

test('fails preflight outside WSL2 and when repository is under a Windows mount', async () => {
  const outside = dependencies({
    dependencies: {
      env: { PATH: '/usr/bin:/bin' },
      readText: async (path) => path === '/proc/version' ? 'Linux generic' : TEXT_FILES[path] ?? '',
    },
  });
  const outsideReport = await runPreflight(outside);
  assert.equal(outsideReport.status, 'PREFLIGHT_FAILED');
  assert.equal(outsideReport.defects.some((entry) => entry.code === 'NOT_WSL2'), true);

  const mounted = dependencies({ dependencies: { repositoryPath: '/mnt/c/src/mnfs' } });
  const mountedReport = await runPreflight(mounted);
  assert.equal(mountedReport.status, 'PREFLIGHT_FAILED');
  assert.equal(mountedReport.defects.some((entry) => entry.code === 'REPOSITORY_ON_WINDOWS_MOUNT'), true);
});

test('missing required primitives produce PREFLIGHT_FAILED rather than pass or skip', async () => {
  const missingBwrap = dependencies({
    outputs: {
      'bwrap\0--version': processResult('', { exitCode: 127, stderr: 'not found' }),
    },
  });
  const report = await runPreflight(missingBwrap);

  assert.equal(report.status, 'PREFLIGHT_FAILED');
  assert.equal(report.tools.bwrap.available, false);
  assert.equal(report.defects.some((entry) => entry.code === 'REQUIRED_TOOL_MISSING'), true);
  assert.notEqual(report.status, 'READY');
});

test('Sandbox Runtime dependency failure caused by host policy is classified BLOCKED_BY_HOST_POLICY', async () => {
  const blocked = dependencies({
    dependencies: {
      checkSandboxDependencies: async () => ({
        errors: ['bubblewrap cannot create user namespace: Permission denied'],
        warnings: ['AppArmor restricts unprivileged user namespaces'],
      }),
    },
  });
  const report = await runPreflight(blocked);

  assert.equal(report.status, 'BLOCKED_BY_HOST_POLICY');
  assert.equal(classifyPreflight(report), 'BLOCKED_BY_HOST_POLICY');
  assert.equal(report.defects.some((entry) => entry.code === 'SANDBOX_HOST_POLICY_BLOCK'), true);
});

test('captures Docker absence honestly without claiming a direct Docker proof', async () => {
  const absent = dependencies({
    dependencies: {
      lstat: async () => { throw Object.assign(new Error('missing'), { code: 'ENOENT' }); },
    },
  });
  const report = await runPreflight(absent);

  assert.equal(report.primitives.dockerSocket, 'NOT_PRESENT');
  assert.equal(report.status, 'READY');
});
