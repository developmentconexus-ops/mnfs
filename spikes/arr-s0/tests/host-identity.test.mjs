import assert from 'node:assert/strict';
import test from 'node:test';
import {
  normalizeHostIdentity,
  observeFilesystemOwnership,
  parseOsRelease,
  classifyLinuxFilesystem,
} from '../src/probes/host-identity.mjs';

test('parses Ubuntu os-release and normalizes canonical WSL2 identity', () => {
  const os = parseOsRelease('NAME="Ubuntu"\nID=ubuntu\nVERSION_ID="26.04"\n');
  assert.deepEqual(os, { id: 'ubuntu', versionId: '26.04' });
  const result = normalizeHostIdentity({
    kernelRelease: '6.18.33.2-microsoft-standard-WSL2',
    osReleaseText: 'NAME="Ubuntu"\nID=ubuntu\nVERSION_ID="26.04"\n',
    architecture: 'x86_64',
    nodeVersion: 'v24.18.0',
    gitVersionText: 'git version 2.51.0\n',
    filesystemType: 'ext2/ext3',
  });
  assert.equal(result.identity.isWsl2, true);
  assert.equal(result.identity.distroId, 'ubuntu');
  assert.equal(result.identity.distroVersion, '26.04');
  assert.equal(result.identity.gitVersion, '2.51.0');
  assert.equal(result.observations.find((item) => item.id === 'HOST-WSL2').state, 'SUPPORTED');
  assert.equal(result.observations.find((item) => item.id === 'HOST-LINUX-FS').state, 'SUPPORTED');
});

test('non-WSL2 identity still completes with HOST-WSL2 unsupported', () => {
  const result = normalizeHostIdentity({
    kernelRelease: '6.12.0-generic',
    osReleaseText: 'ID=ubuntu\nVERSION_ID="24.04"\n',
    architecture: 'x86_64',
    nodeVersion: 'v24.18.0',
    gitVersionText: 'git version 2.51.0',
    filesystemType: 'ext2/ext3',
  });
  assert.equal(result.identity.isWsl2, false);
  assert.equal(result.observations.find((item) => item.id === 'HOST-WSL2').state, 'UNSUPPORTED');
});

test('Linux-owned filesystem classifier uses an explicit reviewed allowlist', () => {
  for (const local of ['ext2/ext3', 'xfs', 'btrfs', 'overlayfs', 'tmpfs']) {
    assert.equal(classifyLinuxFilesystem(local).state, 'SUPPORTED', local);
  }
  for (const windowsBacked of ['drvfs', '9p', 'fuseblk']) {
    assert.equal(classifyLinuxFilesystem(windowsBacked).state, 'UNSUPPORTED', windowsBacked);
  }
  for (const unreviewed of ['', 'cifs', 'nfs', 'nfs4', 'fuse.sshfs', 'ceph']) {
    assert.equal(classifyLinuxFilesystem(unreviewed).state, 'UNKNOWN', unreviewed || '<empty>');
  }
});

test('state-root filesystem observation stats the nearest existing ancestor and fails closed on unreviewed types', async () => {
  const lstat = async (target) => {
    if (target === '/srv/share/mnfs' || target === '/srv/share') {
      const error = new Error('missing');
      error.code = 'ENOENT';
      throw error;
    }
    if (target === '/srv') return { isSymbolicLink: () => false };
    throw new Error(`unexpected lstat ${target}`);
  };
  const calls = [];
  const runCommand = async (spec) => {
    calls.push(spec);
    return {
      exitCode: 0,
      signal: null,
      stdout: Buffer.from('nfs\n'),
      stderr: Buffer.alloc(0),
      durationMs: 1,
    };
  };
  const result = await observeFilesystemOwnership('/srv/share/mnfs', { lstat, runCommand });
  assert.equal(result.state, 'UNKNOWN');
  assert.equal(result.filesystemType, 'nfs');
  assert.equal(result.observedPath, '/srv');
  assert.deepEqual(calls[0].argv, ['/usr/bin/stat', '-f', '-c', '%T', '/srv']);
  assert.deepEqual(calls[0].env, { PATH: '/usr/bin:/bin', LANG: 'C', LC_ALL: 'C' });
});

test('state-root filesystem observation accepts a reviewed Linux-owned ancestor', async () => {
  const result = await observeFilesystemOwnership('/home/example/.local/state/mnfs', {
    lstat: async (target) => {
      if (target === '/home/example/.local/state/mnfs') {
        const error = new Error('missing');
        error.code = 'ENOENT';
        throw error;
      }
      return { isSymbolicLink: () => false };
    },
    runCommand: async () => ({
      exitCode: 0,
      signal: null,
      stdout: Buffer.from('ext2/ext3\n'),
      stderr: Buffer.alloc(0),
      durationMs: 1,
    }),
  });
  assert.equal(result.state, 'SUPPORTED');
});
