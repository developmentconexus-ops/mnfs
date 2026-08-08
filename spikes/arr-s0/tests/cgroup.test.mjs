import assert from 'node:assert/strict';
import test from 'node:test';
import { observeCgroupV2 } from '../src/probes/cgroup.mjs';

test('cgroup v2 requires readable controllers and cgroup2fs', async () => {
  const calls = [];
  const result = await observeCgroupV2({
    readFile: async (target) => {
      assert.equal(target, '/sys/fs/cgroup/cgroup.controllers');
      return Buffer.from('cpu io memory pids\n');
    },
    runCommand: async (spec) => {
      calls.push(spec);
      return { exitCode: 0, stdout: Buffer.from('cgroup2fs\n'), stderr: Buffer.alloc(0) };
    },
  });
  assert.equal(result.state, 'SUPPORTED');
  assert.deepEqual(calls[0].argv, ['/usr/bin/stat', '-f', '-c', '%T', '/sys/fs/cgroup']);
});

test('missing controllers is ABSENT and wrong filesystem is UNSUPPORTED', async () => {
  const absent = await observeCgroupV2({
    readFile: async () => { throw Object.assign(new Error('missing'), { code: 'ENOENT' }); },
    runCommand: async () => assert.fail('stat must not run'),
  });
  assert.equal(absent.state, 'ABSENT');

  const wrongFs = await observeCgroupV2({
    readFile: async () => Buffer.from('cpu\n'),
    runCommand: async () => ({ exitCode: 0, stdout: Buffer.from('tmpfs\n'), stderr: Buffer.alloc(0) }),
  });
  assert.equal(wrongFs.state, 'UNSUPPORTED');
});

test('inconclusive cgroup read or stat failure is UNKNOWN', async () => {
  const denied = await observeCgroupV2({
    readFile: async () => { throw Object.assign(new Error('denied'), { code: 'EACCES' }); },
    runCommand: async () => assert.fail('stat must not run'),
  });
  assert.equal(denied.state, 'UNKNOWN');

  const statFail = await observeCgroupV2({
    readFile: async () => Buffer.from('cpu\n'),
    runCommand: async () => ({ exitCode: 1, stdout: Buffer.alloc(0), stderr: Buffer.from('failed') }),
  });
  assert.equal(statFail.state, 'UNKNOWN');
});
