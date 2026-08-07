import assert from 'node:assert/strict';
import test from 'node:test';
import { observeOptionalTools } from '../src/probes/tools.mjs';

function lstatFor(paths) {
  return async (target) => {
    if (paths.has(target)) return { isFile: () => true };
    throw Object.assign(new Error('missing'), { code: 'ENOENT' });
  };
}

test('missing Docker and Bubblewrap are observed without arbitrary PATH search', async () => {
  const result = await observeOptionalTools({
    lstat: lstatFor(new Set()),
    runCommand: async () => assert.fail('no command should run'),
  });
  assert.equal(result.dockerCli.state, 'ABSENT');
  assert.equal(result.dockerDaemon.state, 'UNKNOWN');
  assert.equal(result.bwrap.state, 'ABSENT');
});

test('Docker observations use only exact read-only version commands', async () => {
  const calls = [];
  const result = await observeOptionalTools({
    lstat: lstatFor(new Set(['/usr/bin/docker'])),
    runCommand: async (spec) => {
      calls.push(spec);
      if (spec.argv[1] === '--version') return { exitCode: 0, stdout: Buffer.from('Docker version 28.0.0\n'), stderr: Buffer.alloc(0) };
      return { exitCode: 0, stdout: Buffer.from('"28.0.0"\n'), stderr: Buffer.alloc(0) };
    },
  });
  assert.equal(result.dockerCli.state, 'PRESENT');
  assert.equal(result.dockerDaemon.state, 'PRESENT');
  assert.deepEqual(calls.map((call) => call.argv), [
    ['/usr/bin/docker', '--version'],
    ['/usr/bin/docker', 'version', '--format', '{{json .Server.Version}}'],
  ]);
  for (const call of calls) assert.deepEqual(call.env, { PATH: '/usr/bin:/bin', LANG: 'C', LC_ALL: 'C' });
});

test('Docker daemon unavailable is ABSENT when the error is decisive', async () => {
  const result = await observeOptionalTools({
    lstat: lstatFor(new Set(['/usr/bin/docker'])),
    runCommand: async (spec) => spec.argv[1] === '--version'
      ? { exitCode: 0, stdout: Buffer.from('Docker version 28.0.0\n'), stderr: Buffer.alloc(0) }
      : { exitCode: 1, stdout: Buffer.alloc(0), stderr: Buffer.from('Cannot connect to the Docker daemon\n') },
  });
  assert.equal(result.dockerDaemon.state, 'ABSENT');
});

test('Bubblewrap observation is version-only and never launches a sandbox', async () => {
  const calls = [];
  const result = await observeOptionalTools({
    lstat: lstatFor(new Set(['/usr/bin/bwrap'])),
    runCommand: async (spec) => {
      calls.push(spec.argv);
      return { exitCode: 0, stdout: Buffer.from('bubblewrap 0.11.0\n'), stderr: Buffer.alloc(0) };
    },
  });
  assert.equal(result.bwrap.state, 'PRESENT');
  assert.deepEqual(calls, [['/usr/bin/bwrap', '--version']]);
});
