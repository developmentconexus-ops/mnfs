import assert from 'node:assert/strict';
import test from 'node:test';

import {
  endLavishPlan,
  openLavishPlan,
  pollLavishPlan,
  spawnLavishCommand,
  type LavishCommandInvocation,
  type LavishCommandRunner,
} from '../../src/adapters/lavish.js';
import { MnfsError } from '../../src/domain/errors.js';

function result(
  stdout = '',
  options: {
    readonly stderr?: string;
    readonly exitCode?: number | null;
    readonly signal?: NodeJS.Signals | null;
  } = {},
) {
  return {
    stdout,
    stderr: options.stderr ?? '',
    exitCode: options.exitCode ?? 0,
    signal: options.signal ?? null,
  };
}

function hasCode(code: string): (error: unknown) => boolean {
  return (error: unknown) => error instanceof MnfsError && error.code === code;
}

test('open, poll and end use safe argument arrays and never invoke sharing or host options', async () => {
  const invocations: LavishCommandInvocation[] = [];
  const runner: LavishCommandRunner = async (invocation) => {
    invocations.push(invocation);
    return result(`output:${invocation.args.join('|')}`);
  };
  const path = '/home/leandro/.local/state/mnfs/artifacts/plan with spaces.html';

  assert.equal(await openLavishPlan(path, { runner }), `output:${path}`);
  assert.equal(await pollLavishPlan(path, { runner }), `output:poll|${path}`);
  assert.equal(await endLavishPlan(path, { runner }), `output:end|${path}`);

  assert.deepEqual(invocations.map(({ executable, args, shell }) => ({ executable, args, shell })), [
    { executable: 'lavish-axi', args: [path], shell: false },
    { executable: 'lavish-axi', args: ['poll', path], shell: false },
    { executable: 'lavish-axi', args: ['end', path], shell: false },
  ]);
  assert.equal(invocations.flatMap((invocation) => invocation.args).includes('share'), false);
  assert.equal(
    invocations.flatMap((invocation) => invocation.args)
      .some((argument) => argument.startsWith('--host')),
    false,
  );
});

test('poll returns stdout byte-for-byte as opaque feedback', async () => {
  const feedback = '\nfeedback\n  prompts:\n    - text: keep this exact spacing\nnext_step: revise\n';
  const runner: LavishCommandRunner = async () => result(feedback, { stderr: 'waiting banner\n' });

  assert.equal(await pollLavishPlan('/tmp/plan.html', { runner }), feedback);
});

test('a missing Lavish executable produces a named installable error', async () => {
  const runner: LavishCommandRunner = async () => {
    const error = new Error('spawn lavish-axi ENOENT') as Error & { code: string };
    error.code = 'ENOENT';
    throw error;
  };

  await assert.rejects(
    () => openLavishPlan('/tmp/plan.html', { runner }),
    (error: unknown) => hasCode('LAVISH_NOT_FOUND')(error)
      && error instanceof MnfsError
      && error.remediation?.includes('npm install -g lavish-axi') === true,
  );
});

test('a non-zero Lavish command produces a named error with stderr evidence', async () => {
  const runner: LavishCommandRunner = async () => result('', {
    exitCode: 7,
    stderr: 'artifact could not be opened\n',
  });

  await assert.rejects(
    () => openLavishPlan('/tmp/plan.html', { runner }),
    (error: unknown) => hasCode('LAVISH_COMMAND_FAILED')(error)
      && error instanceof Error
      && error.message.includes('artifact could not be opened'),
  );
});

test('an interrupted poll is reported without returning partial feedback', async () => {
  const controller = new AbortController();
  const runner: LavishCommandRunner = async (invocation) => {
    assert.equal(invocation.signal, controller.signal);
    return result('partial feedback must not escape', { exitCode: null, signal: 'SIGINT' });
  };

  await assert.rejects(
    () => pollLavishPlan('/tmp/plan.html', { runner, signal: controller.signal }),
    hasCode('LAVISH_COMMAND_FAILED'),
  );
});

test('the production runner captures stdout and stderr without a shell', async () => {
  const command = `process.stdout.write('opaque-out'); process.stderr.write('diagnostic-err')`;
  const actual = await spawnLavishCommand({
    executable: process.execPath,
    args: ['-e', command],
    shell: false,
  });

  assert.deepEqual(actual, {
    stdout: 'opaque-out',
    stderr: 'diagnostic-err',
    exitCode: 0,
    signal: null,
  });
});
