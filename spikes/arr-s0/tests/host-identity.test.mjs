import assert from 'node:assert/strict';
import test from 'node:test';
import {
  normalizeHostIdentity,
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
