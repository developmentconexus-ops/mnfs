import assert from 'node:assert/strict';
import { gzipSync } from 'node:zlib';
import test from 'node:test';
import {
  configBackedSecurityObservations,
  discoverKernelConfig,
  observeUserNamespace,
  parseKernelConfig,
} from '../src/probes/kernel-security.mjs';

const CONFIG = [
  'CONFIG_SECCOMP=y',
  'CONFIG_SECCOMP_FILTER=y',
  'CONFIG_SECURITY_LANDLOCK=y',
  'CONFIG_USER_NS=y',
  'CONFIG_FUSE_FS=y',
  '',
].join('\n');

test('parses only exact kernel config keys used by S0', () => {
  const parsed = parseKernelConfig(`${CONFIG}CONFIG_SECURITY_LANDLOCK_EXTRA=y\n`);
  assert.equal(parsed.CONFIG_SECCOMP, 'y');
  assert.equal(parsed.CONFIG_SECCOMP_FILTER, 'y');
  assert.equal(parsed.CONFIG_SECURITY_LANDLOCK, 'y');
  assert.equal(parsed.CONFIG_USER_NS, 'y');
  assert.equal(parsed.CONFIG_FUSE_FS, 'y');
  assert.equal(Object.hasOwn(parsed, 'CONFIG_SECURITY_LANDLOCK_EXTRA'), false);
});

test('discovers and decompresses /proc/config.gz before boot config', async () => {
  const calls = [];
  const result = await discoverKernelConfig({
    kernelRelease: '6.18.33.2-microsoft-standard-WSL2',
    readFile: async (target) => {
      calls.push(target);
      if (target === '/proc/config.gz') return gzipSync(Buffer.from(CONFIG));
      throw Object.assign(new Error('unexpected'), { code: 'ENOENT' });
    },
  });
  assert.equal(result.source, '/proc/config.gz');
  assert.equal(result.text, CONFIG);
  assert.deepEqual(calls, ['/proc/config.gz']);
});

test('falls back to exact /boot/config-<release> and missing config stays UNKNOWN', async () => {
  const release = '6.18.33.2-microsoft-standard-WSL2';
  const result = await discoverKernelConfig({
    kernelRelease: release,
    readFile: async (target) => {
      if (target === '/proc/config.gz') throw Object.assign(new Error('missing'), { code: 'ENOENT' });
      if (target === `/boot/config-${release}`) return Buffer.from(CONFIG);
      throw new Error(`unexpected ${target}`);
    },
  });
  assert.equal(result.source, `/boot/config-${release}`);
  const supported = configBackedSecurityObservations(result.text);
  assert.equal(supported.seccomp.state, 'SUPPORTED');
  assert.equal(supported.landlock.state, 'SUPPORTED');

  const unknown = configBackedSecurityObservations(null);
  assert.equal(unknown.seccomp.state, 'UNKNOWN');
  assert.equal(unknown.landlock.state, 'UNKNOWN');
});

test('user namespace active probe uses exact unshare argv and allowlisted env', async () => {
  const calls = [];
  const result = await observeUserNamespace({
    configText: CONFIG,
    executableExists: async (target) => target === '/usr/bin/unshare',
    runCommand: async (spec) => {
      calls.push(spec);
      return { exitCode: 0, stdout: Buffer.from('0\n'), stderr: Buffer.alloc(0), signal: null, durationMs: 1 };
    },
  });
  assert.equal(result.state, 'SUPPORTED');
  assert.deepEqual(calls[0].argv, ['/usr/bin/unshare', '--user', '--map-root-user', '/usr/bin/id', '-u']);
  assert.deepEqual(calls[0].env, { PATH: '/usr/bin:/bin', LANG: 'C', LC_ALL: 'C' });
});

test('missing unshare does not convert supporting kernel config into SUPPORTED or UNSUPPORTED', async () => {
  const result = await observeUserNamespace({
    configText: CONFIG,
    executableExists: async () => false,
    runCommand: async () => assert.fail('command must not run'),
  });
  assert.equal(result.state, 'UNKNOWN');
});

test('expected unshare permission failure is UNSUPPORTED, other failures are UNKNOWN', async () => {
  const denied = await observeUserNamespace({
    configText: CONFIG,
    executableExists: async () => true,
    runCommand: async () => ({ exitCode: 1, stdout: Buffer.alloc(0), stderr: Buffer.from('unshare: Operation not permitted\n') }),
  });
  assert.equal(denied.state, 'UNSUPPORTED');

  const odd = await observeUserNamespace({
    configText: CONFIG,
    executableExists: async () => true,
    runCommand: async () => ({ exitCode: 2, stdout: Buffer.alloc(0), stderr: Buffer.from('unexpected transient error\n') }),
  });
  assert.equal(odd.state, 'UNKNOWN');
});
