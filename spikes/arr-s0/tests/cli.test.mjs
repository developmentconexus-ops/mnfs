import assert from 'node:assert/strict';
import test from 'node:test';
import { parseCliArgs } from '../src/cli.mjs';

test('accepts only the three frozen CLI forms', () => {
  assert.deepEqual(parseCliArgs(['preflight', '--json']), { command: 'preflight', json: true });
  assert.deepEqual(parseCliArgs(['run', '--json']), { command: 'run', json: true });
  assert.deepEqual(
    parseCliArgs(['report', '--run-id', 'arr-s0-20260807t120000000z-a1b2c3', '--json']),
    { command: 'report', runId: 'arr-s0-20260807t120000000z-a1b2c3', json: true },
  );
});

test('rejects duplicate flags, unknown flags and positional extras', () => {
  for (const argv of [
    ['preflight', '--json', '--json'],
    ['run', '--json', '--verbose'],
    ['run', 'extra', '--json'],
    ['report', '--run-id', 'arr-s0-20260807t120000000z-a1b2c3', '--run-id', 'arr-s0-20260807t120000000z-a1b2c3', '--json'],
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
  assert.throws(() => parseCliArgs(['report', '--run-id', 'arr-s0-20260807t120000000z-a1b2c3']), /invalid ARR-S0 CLI/u);
});
