import assert from 'node:assert/strict';
import test from 'node:test';

import {
  BROKERED_TOOL_NAMES,
} from '../src/pi-inventory.mjs';
import {
  createPiPilotChallenge,
  evaluatePiPilot,
  PI_PILOT_MODEL,
} from '../src/pi-pilot.mjs';

const POLICY_HASH = `sha256:${'a'.repeat(64)}`;

function receipt() {
  return {
    policyHash: POLICY_HASH,
    tools: [...BROKERED_TOOL_NAMES],
  };
}

test('creates a run-specific challenge whose answer is absent from the prompt', () => {
  const challenge = createPiPilotChallenge({
    randomId: () => '0123456789abcdef0123456789abcdef',
  });

  assert.equal(PI_PILOT_MODEL, 'anthropic/claude-haiku-4-5');
  assert.equal(challenge.relativePath, '.mnfs-as02-pi-pilot-challenge.txt');
  assert.equal(challenge.expectedOutput, 'AS02_PI_PILOT_OK_0123456789abcdef0123456789abcdef');
  assert.equal(challenge.contents, `${challenge.expectedOutput}\n`);
  assert.equal(challenge.prompt.includes(challenge.expectedOutput), false);
  assert.match(challenge.prompt, /read tool exactly once/iu);
  assert.match(challenge.prompt, /exact file contents/iu);
  assert.match(challenge.challengeHash, /^sha256:[a-f0-9]{64}$/u);
});

test('passes only with one successful read event and the exact nonce-bound stdout', () => {
  const challenge = createPiPilotChallenge({
    randomId: () => '0123456789abcdef0123456789abcdef',
  });
  const evaluation = evaluatePiPilot({
    exitCode: 0,
    policyHash: POLICY_HASH,
    receipt: receipt(),
    events: [{ tool: 'read', result: 'SUCCEEDED' }],
    stdout: Buffer.from(`${challenge.expectedOutput}\n`),
    expectedOutput: challenge.expectedOutput,
  });

  assert.deepEqual(evaluation, {
    status: 'PASS',
    successfulReadCalls: 1,
    otherToolCalls: [],
    outputMatched: true,
  });
});

test('blocks a copied answer when no read tool event exists', () => {
  const challenge = createPiPilotChallenge({
    randomId: () => '0123456789abcdef0123456789abcdef',
  });
  const evaluation = evaluatePiPilot({
    exitCode: 0,
    policyHash: POLICY_HASH,
    receipt: receipt(),
    events: [],
    stdout: Buffer.from(`${challenge.expectedOutput}\n`),
    expectedOutput: challenge.expectedOutput,
  });

  assert.equal(evaluation.status, 'BLOCKED');
  assert.equal(evaluation.outputMatched, true);
  assert.equal(evaluation.successfulReadCalls, 0);
});

test('blocks wrong output, extra tools, stale receipts and non-zero execution', () => {
  const base = {
    exitCode: 0,
    policyHash: POLICY_HASH,
    receipt: receipt(),
    events: [{ tool: 'read', result: 'SUCCEEDED' }],
    stdout: Buffer.from('wrong\n'),
    expectedOutput: 'expected',
  };

  assert.equal(evaluatePiPilot(base).status, 'BLOCKED');
  assert.equal(evaluatePiPilot({
    ...base,
    stdout: Buffer.from('expected\n'),
    events: [
      { tool: 'read', result: 'SUCCEEDED' },
      { tool: 'bash', result: 'SUCCEEDED' },
    ],
  }).status, 'BLOCKED');
  assert.equal(evaluatePiPilot({
    ...base,
    stdout: Buffer.from('expected\n'),
    receipt: { ...receipt(), policyHash: `sha256:${'b'.repeat(64)}` },
  }).status, 'BLOCKED');
  assert.equal(evaluatePiPilot({
    ...base,
    exitCode: 1,
    stdout: Buffer.from('expected\n'),
  }).status, 'BLOCKED');
});
