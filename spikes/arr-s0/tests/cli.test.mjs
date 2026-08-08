import assert from 'node:assert/strict';
import test from 'node:test';
import { executeCli, parseCliArgs } from '../src/cli.mjs';

const RUN_ID = 'arr-s0-20260807t120000000z-a1b2c3';

test('accepts only the three frozen CLI forms', () => {
  assert.deepEqual(parseCliArgs(['preflight', '--json']), { command: 'preflight', json: true });
  assert.deepEqual(parseCliArgs(['run', '--json']), { command: 'run', json: true });
  assert.deepEqual(
    parseCliArgs(['report', '--run-id', RUN_ID, '--json']),
    { command: 'report', runId: RUN_ID, json: true },
  );
});

test('rejects duplicate flags, unknown flags and positional extras', () => {
  for (const argv of [
    ['preflight', '--json', '--json'],
    ['run', '--json', '--verbose'],
    ['run', 'extra', '--json'],
    ['report', '--run-id', RUN_ID, '--run-id', RUN_ID, '--json'],
    ['report', '--json'],
  ]) {
    assert.throws(() => parseCliArgs(argv), /invalid ARR-S0 CLI/u, argv.join(' '));
  }
});

test('rejects noncanonical run ids', () => {
  assert.throws(() => parseCliArgs(['report', '--run-id', '../escape', '--json']), /invalid ARR-S0/u);
});

test('no mutating host command exists', () => {
  for (const command of ['setup', 'install', 'enable', 'repair', 'cleanup-host']) {
    assert.throws(() => parseCliArgs([command, '--json']), /invalid ARR-S0 CLI/u, command);
  }
});

test('json flag is mandatory for the frozen machine interface', () => {
  assert.throws(() => parseCliArgs(['preflight']), /invalid ARR-S0 CLI/u);
  assert.throws(() => parseCliArgs(['run']), /invalid ARR-S0 CLI/u);
  assert.throws(() => parseCliArgs(['report', '--run-id', RUN_ID]), /invalid ARR-S0 CLI/u);
});

test('run preserves the dedicated execution-authority environment when no explicit token override exists', async () => {
  let seenOptions;
  await assert.rejects(
    () => executeCli(['run', '--json'], {
      repoRoot: '/home/example/src/mnfs',
      env: { MNFS_ARR_S0_EXECUTE_AUTHORIZATION: 'exact-token' },
      identitiesLoader: async (_repoRoot, options) => {
        seenOptions = options;
        throw new Error('stop-after-authority-options');
      },
    }),
    /stop-after-authority-options/u,
  );
  assert.equal(Object.prototype.hasOwnProperty.call(seenOptions, 'executionAuthorizationToken'), false);
  assert.equal(seenOptions.env.MNFS_ARR_S0_EXECUTE_AUTHORIZATION, 'exact-token');
});

test('run failure after run-id allocation returns a machine-reopenable handoff', async () => {
  let output = '';
  const exitCode = await executeCli(['run', '--json'], {
    repoRoot: '/home/example/src/mnfs',
    stdout: { write(value) { output += value; } },
    identitiesLoader: async () => ({ plan: {}, contract: {}, executionAuthorization: {} }),
    runIdGenerator: () => RUN_ID,
    run: async () => { throw new Error('probe interrupted after durable creation'); },
  });
  assert.equal(exitCode, 1);
  const handoff = JSON.parse(output);
  assert.equal(handoff.ok, false);
  assert.equal(handoff.complete, false);
  assert.equal(handoff.runId, RUN_ID);
  assert.match(handoff.error, /probe interrupted/u);
  assert.equal(handoff.nextAction, `npm run arr-s0 -- report --run-id ${RUN_ID} --json`);
});
