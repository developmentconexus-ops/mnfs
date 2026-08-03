import assert from 'node:assert/strict';
import test from 'node:test';

import {
  formatRestartInstructions,
  parseCli,
  runCli,
} from '../src/cli.mjs';

function io() {
  const stdout = [];
  const stderr = [];
  return {
    stdout,
    stderr,
    writeStdout(value) { stdout.push(value); },
    writeStderr(value) { stderr.push(value); },
  };
}

function dependencies() {
  const calls = [];
  const handlers = Object.fromEntries([
    'preflight',
    'run',
    'restartPrepare',
    'restartResume',
    'report',
    'cleanup',
  ].map((name) => [name, async (input) => {
    calls.push({ name, input });
    return { exitCode: 0, value: { handled: name, input } };
  }]));
  return { calls, handlers };
}

test('parses only the six approved strict commands', () => {
  assert.deepEqual(parseCli(['preflight']), { command: 'preflight' });
  assert.deepEqual(parseCli(['run']), { command: 'run' });
  assert.deepEqual(parseCli(['restart-prepare']), { command: 'restart-prepare' });
  assert.deepEqual(
    parseCli(['restart-resume', '--checkpoint', '/tmp/mnfs-as-02/run/restart.json']),
    { command: 'restart-resume', checkpoint: '/tmp/mnfs-as-02/run/restart.json' },
  );
  assert.deepEqual(parseCli(['report', '--run', 'run-1']), { command: 'report', runId: 'run-1' });
  assert.deepEqual(parseCli(['cleanup', '--run', 'run-1']), { command: 'cleanup', runId: 'run-1' });
});

test('rejects unknown commands, duplicate flags, relative paths and unsafe run ids', () => {
  for (const argv of [
    [],
    ['unknown'],
    ['preflight', '--force'],
    ['run', '--sudo'],
    ['restart-prepare', '--execute'],
    ['restart-resume'],
    ['restart-resume', '--checkpoint', 'relative.json'],
    ['restart-resume', '--checkpoint', '/tmp/a', '--checkpoint', '/tmp/b'],
    ['report'],
    ['report', '--run', '../escape'],
    ['cleanup', '--run', 'UPPER'],
    ['cleanup', '--run', 'run-1', '--force'],
  ]) {
    assert.throws(
      () => parseCli(argv),
      (error) => error?.code === 'CLI_USAGE',
      `expected usage rejection for ${JSON.stringify(argv)}`,
    );
  }
});

test('dispatches valid commands once and writes stable JSON output', async () => {
  const deps = dependencies();
  const output = io();

  assert.equal(await runCli(['preflight'], { ...deps, ...output }), 0);
  assert.equal(await runCli(['run'], { ...deps, ...output }), 0);
  assert.equal(await runCli(['restart-prepare'], { ...deps, ...output }), 0);
  assert.equal(await runCli(['restart-resume', '--checkpoint', '/tmp/checkpoint.json'], { ...deps, ...output }), 0);
  assert.equal(await runCli(['report', '--run', 'run-1'], { ...deps, ...output }), 0);
  assert.equal(await runCli(['cleanup', '--run', 'run-1'], { ...deps, ...output }), 0);

  assert.deepEqual(deps.calls, [
    { name: 'preflight', input: {} },
    { name: 'run', input: {} },
    { name: 'restartPrepare', input: {} },
    { name: 'restartResume', input: { checkpoint: '/tmp/checkpoint.json' } },
    { name: 'report', input: { runId: 'run-1' } },
    { name: 'cleanup', input: { runId: 'run-1' } },
  ]);
  assert.equal(output.stderr.length, 0);
  for (const line of output.stdout) assert.doesNotThrow(() => JSON.parse(line));
});

test('returns exit code 2 for usage errors without invoking handlers', async () => {
  const deps = dependencies();
  const output = io();
  assert.equal(await runCli(['restart-resume', '--checkpoint', 'relative'], { ...deps, ...output }), 2);
  assert.equal(deps.calls.length, 0);
  assert.equal(output.stdout.length, 0);
  assert.match(output.stderr.join(''), /Usage:/u);
});

test('preserves stable AS-02 error codes from command handlers', async () => {
  const output = io();
  const handlers = {
    preflight: async () => { throw Object.assign(new Error('host blocked'), { code: 'BLOCKED_BY_HOST_POLICY' }); },
  };
  assert.equal(await runCli(['preflight'], { handlers, ...output }), 1);
  const parsed = JSON.parse(output.stderr[0]);
  assert.deepEqual(parsed, { error: { code: 'BLOCKED_BY_HOST_POLICY', message: 'host blocked' } });
});

test('restart instructions are informational and never execute Windows or WSL commands', () => {
  const text = formatRestartInstructions({
    distro: 'Ubuntu-24.04',
    repositoryPath: '/home/leandro/src/mnfs',
    checkpointPath: '/tmp/mnfs-as-02/run-1/restart-checkpoint.json',
  });
  assert.match(text, /From Windows PowerShell:/u);
  assert.match(text, /wsl --terminate Ubuntu-24\.04/u);
  assert.match(text, /cd \/home\/leandro\/src\/mnfs/u);
  assert.match(text, /npm run as02 -- restart-resume --checkpoint \/tmp\/mnfs-as-02\/run-1\/restart-checkpoint\.json/u);
});

test('CLI source contains no automatic WSL restart execution path', async () => {
  const source = await import('node:fs/promises').then(({ readFile }) => readFile('spikes/as-02/src/cli.mjs', 'utf8'));
  assert.doesNotMatch(source, /spawn(?:Sync)?\s*\([^\n]*(?:wsl|powershell)|exec(?:File|Sync)?\s*\([^\n]*(?:wsl|powershell)/iu);
});
