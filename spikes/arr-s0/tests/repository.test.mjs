import assert from 'node:assert/strict';
import test from 'node:test';
import { observeRepositoryIdentity } from '../src/probes/repository.mjs';

const EXPECTED_GIT_ENV = {
  PATH: '/usr/bin:/bin',
  LANG: 'C',
  LC_ALL: 'C',
  GIT_OPTIONAL_LOCKS: '0',
  GIT_TERMINAL_PROMPT: '0',
  GIT_CONFIG_NOSYSTEM: '1',
  GIT_CONFIG_GLOBAL: '/dev/null',
  GIT_CONFIG_COUNT: '2',
  GIT_CONFIG_KEY_0: 'core.fsmonitor',
  GIT_CONFIG_VALUE_0: 'false',
  GIT_CONFIG_KEY_1: 'core.hooksPath',
  GIT_CONFIG_VALUE_1: '/dev/null',
};

function fixtureRunner(responses) {
  const calls = [];
  return {
    calls,
    run: async (spec) => {
      calls.push(spec);
      const key = spec.argv.join('\u0000');
      const response = responses.get(key);
      if (!response) throw new Error(`unexpected command: ${spec.argv.join(' ')}`);
      return {
        argv: spec.argv,
        cwd: spec.cwd,
        exitCode: response.exitCode ?? 0,
        signal: null,
        stdout: Buffer.from(response.stdout ?? '', 'utf8'),
        stderr: Buffer.from(response.stderr ?? '', 'utf8'),
        durationMs: 1,
      };
    },
  };
}

test('observes exact Git commit/tree and clean status with a fixed non-mutating environment', async () => {
  const commit = 'a'.repeat(40);
  const tree = 'b'.repeat(40);
  const responses = new Map([
    [['/usr/bin/git', 'rev-parse', 'HEAD'].join('\u0000'), { stdout: `${commit}\n` }],
    [['/usr/bin/git', 'rev-parse', 'HEAD^{tree}'].join('\u0000'), { stdout: `${tree}\n` }],
    [['/usr/bin/git', 'status', '--porcelain=v1', '--untracked-files=normal'].join('\u0000'), { stdout: '' }],
  ]);
  const runner = fixtureRunner(responses);
  const result = await observeRepositoryIdentity({ repoRoot: '/home/example/src/mnfs', runCommand: runner.run });
  assert.deepEqual(result.source, { commitSha: commit, treeSha: tree });
  assert.equal(result.clean, true);
  assert.equal(result.observation.id, 'HOST-GIT-READONLY');
  assert.equal(result.observation.state, 'SUPPORTED');
  assert.equal(runner.calls.length, 3);
  for (const call of runner.calls) {
    assert.equal(call.cwd, '/home/example/src/mnfs');
    assert.deepEqual(call.env, EXPECTED_GIT_ENV);
    assert.equal(call.argv[0], '/usr/bin/git');
  }
});

test('dirty checkout remains explicit and is never normalized away', async () => {
  const responses = new Map([
    [['/usr/bin/git', 'rev-parse', 'HEAD'].join('\u0000'), { stdout: `${'a'.repeat(40)}\n` }],
    [['/usr/bin/git', 'rev-parse', 'HEAD^{tree}'].join('\u0000'), { stdout: `${'b'.repeat(40)}\n` }],
    [['/usr/bin/git', 'status', '--porcelain=v1', '--untracked-files=normal'].join('\u0000'), { stdout: ' M file.txt\n?? new.txt\n' }],
  ]);
  const result = await observeRepositoryIdentity({
    repoRoot: '/home/example/src/mnfs',
    runCommand: fixtureRunner(responses).run,
  });
  assert.equal(result.clean, false);
  assert.equal(result.statusText, ' M file.txt\n?? new.txt\n');
  assert.match(result.observation.rationale, /dirty/u);
});

test('Git command failure produces UNKNOWN repository observation', async () => {
  const runner = fixtureRunner(new Map([
    [['/usr/bin/git', 'rev-parse', 'HEAD'].join('\u0000'), { exitCode: 128, stderr: 'fatal: not a git repository' }],
  ]));
  const result = await observeRepositoryIdentity({ repoRoot: '/home/example/src/mnfs', runCommand: runner.run });
  assert.equal(result.source, null);
  assert.equal(result.clean, false);
  assert.equal(result.observation.state, 'UNKNOWN');
});
