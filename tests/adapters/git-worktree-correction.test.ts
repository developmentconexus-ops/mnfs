import assert from 'node:assert/strict';
import test from 'node:test';

import { GitWorktreeInspector } from '../../src/adapters/git-worktree.js';
import type { ProcessResult, ProcessSpec } from '../../src/runtime/process-runner.js';

const REPOSITORY_PATH = '/srv/mnfs/repository';
const COMMIT_SHA = '1'.repeat(40);
const TREE_SHA = '2'.repeat(40);

function success(stdout: string | Buffer = ''): ProcessResult {
  return {
    exitCode: 0,
    signal: null,
    stdout: Buffer.isBuffer(stdout) ? Buffer.from(stdout) : Buffer.from(stdout, 'utf8'),
    stderr: Buffer.alloc(0),
    timedOut: false,
  };
}

function responseFor(spec: ProcessSpec): ProcessResult {
  switch (spec.args.join(' ')) {
    case 'rev-parse --show-toplevel':
      return success(`${REPOSITORY_PATH}\n`);
    case 'rev-parse --absolute-git-dir':
      return success(`${REPOSITORY_PATH}/.git\n`);
    case 'rev-parse --git-common-dir':
      return success('.git\n');
    case 'rev-parse --git-path objects':
      return success('.git/objects\n');
    case 'rev-parse --show-object-format':
      return success('sha1\n');
    case 'rev-parse --verify HEAD':
      return success(`${COMMIT_SHA}\n`);
    case 'rev-parse --verify HEAD^{tree}':
      return success(`${TREE_SHA}\n`);
    case 'status --porcelain=v1 -z --untracked-files=all':
      return success();
    case 'remote':
      return success();
    default:
      assert.fail(`Unexpected Git command: ${spec.args.join(' ')}`);
  }
}

function ownedConfig(env: Readonly<Record<string, string>>): ReadonlyMap<string, string> {
  const count = Number(env.GIT_CONFIG_COUNT);
  assert.equal(Number.isSafeInteger(count) && count >= 0, true, 'owned GIT_CONFIG_COUNT');
  const result = new Map<string, string>();
  for (let index = 0; index < count; index += 1) {
    const key = env[`GIT_CONFIG_KEY_${index}`];
    const value = env[`GIT_CONFIG_VALUE_${index}`];
    assert.equal(typeof key, 'string', `missing GIT_CONFIG_KEY_${index}`);
    assert.equal(typeof value, 'string', `missing GIT_CONFIG_VALUE_${index}`);
    result.set(key as string, value as string);
  }
  return result;
}

test('R8-01 observes Git with optional locks and lazy fetch disabled under one owned configuration authority', async () => {
  const calls: ProcessSpec[] = [];
  const inspector = new GitWorktreeInspector({
    gitExecutable: '/usr/bin/git',
    runProcess: async (spec) => {
      calls.push(spec);
      return responseFor(spec);
    },
    environment: {
      PATH: '/usr/bin:/bin',
      HOME: '/home/mnfs',
      HTTP_PROXY: 'http://proxy.invalid',
      GIT_DIR: '/tmp/attacker-git-dir',
      GIT_WORK_TREE: '/tmp/attacker-work-tree',
      GIT_INDEX_FILE: '/tmp/attacker-index',
      GIT_OBJECT_DIRECTORY: '/tmp/attacker-objects',
      GIT_ALTERNATE_OBJECT_DIRECTORIES: '/tmp/attacker-alternates',
      GIT_CONFIG_PARAMETERS: "'core.fsmonitor'='/tmp/attacker-fsmonitor'",
      GIT_CONFIG_COUNT: '10',
      GIT_CONFIG_KEY_9: 'core.fsmonitor',
      GIT_CONFIG_VALUE_9: '/tmp/attacker-fsmonitor',
    },
  });

  await inspector.observeRepository(REPOSITORY_PATH);

  assert.equal(calls.length > 0, true);
  for (const call of calls) {
    assert.equal(call.env.GIT_OPTIONAL_LOCKS, '0');
    assert.equal(call.env.GIT_NO_LAZY_FETCH, '1');
    assert.equal(call.env.GIT_CONFIG_GLOBAL, '/dev/null');
    assert.equal(call.env.GIT_CONFIG_NOSYSTEM, '1');
    assert.equal(call.env.GIT_TERMINAL_PROMPT, '0');
    assert.equal(call.env.GCM_INTERACTIVE, 'Never');

    for (const name of [
      'HTTP_PROXY',
      'HTTPS_PROXY',
      'ALL_PROXY',
      'GIT_DIR',
      'GIT_WORK_TREE',
      'GIT_INDEX_FILE',
      'GIT_OBJECT_DIRECTORY',
      'GIT_ALTERNATE_OBJECT_DIRECTORIES',
      'GIT_CONFIG_PARAMETERS',
    ]) {
      assert.equal(call.env[name], undefined, `${name} survived`);
    }

    const config = ownedConfig(call.env);
    assert.equal(config.get('core.fsmonitor'), 'false');
    assert.equal(config.get('core.hooksPath'), '/dev/null');
    assert.equal(config.get('credential.helper'), '');
    assert.equal(config.get('uploadpack.packObjectsHook'), '');
    assert.equal([...config.values()].includes('/tmp/attacker-fsmonitor'), false);
  }
});
