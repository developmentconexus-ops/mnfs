import assert from 'node:assert/strict';
import test from 'node:test';
import { observeFuse } from '../src/probes/fuse.mjs';

test('absent FUSE device and tools are explicit', async () => {
  const result = await observeFuse({
    lstat: async (target) => { const error = new Error(`missing ${target}`); error.code = 'ENOENT'; throw error; },
    open: async () => assert.fail('open must not run'),
    runCommand: async () => assert.fail('command must not run'),
  });
  assert.equal(result.device.state, 'ABSENT');
  assert.equal(result.tools.state, 'ABSENT');
});

test('FUSE character device open and fixed fusermount3 version are observed without mounts', async () => {
  const calls = [];
  const result = await observeFuse({
    lstat: async (target) => {
      if (target === '/dev/fuse') return { isCharacterDevice: () => true, isFile: () => false };
      if (target === '/usr/bin/fusermount3') return { isCharacterDevice: () => false, isFile: () => true };
      throw Object.assign(new Error('missing'), { code: 'ENOENT' });
    },
    open: async () => ({ close: async () => calls.push('closed') }),
    runCommand: async (spec) => {
      calls.push(spec.argv);
      return { exitCode: 0, stdout: Buffer.from('fusermount3 version: 3.16.2\n'), stderr: Buffer.alloc(0) };
    },
  });
  assert.equal(result.device.state, 'SUPPORTED');
  assert.equal(result.tools.state, 'PRESENT');
  assert.deepEqual(calls[1], ['/usr/bin/fusermount3', '--version']);
});

test('FUSE permission denial is UNSUPPORTED and non-character device is UNKNOWN', async () => {
  const denied = await observeFuse({
    lstat: async (target) => {
      if (target === '/dev/fuse') return { isCharacterDevice: () => true, isFile: () => false };
      throw Object.assign(new Error('missing'), { code: 'ENOENT' });
    },
    open: async () => { throw Object.assign(new Error('denied'), { code: 'EACCES' }); },
    runCommand: async () => assert.fail('tool absent'),
  });
  assert.equal(denied.device.state, 'UNSUPPORTED');

  const malformed = await observeFuse({
    lstat: async (target) => {
      if (target === '/dev/fuse') return { isCharacterDevice: () => false, isFile: () => true };
      throw Object.assign(new Error('missing'), { code: 'ENOENT' });
    },
    open: async () => assert.fail('open must not run'),
    runCommand: async () => assert.fail('tool absent'),
  });
  assert.equal(malformed.device.state, 'UNKNOWN');
});
