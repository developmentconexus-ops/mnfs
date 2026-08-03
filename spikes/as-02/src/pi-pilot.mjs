import { createHash, randomUUID } from 'node:crypto';

import { BROKERED_TOOL_NAMES } from './pi-inventory.mjs';
import { assertAs02 } from './errors.mjs';

export const PI_PILOT_MODEL = 'anthropic/claude-haiku-4-5';
const CHALLENGE_PATH = '.mnfs-as02-pi-pilot-challenge.txt';

function sha256(value) {
  return `sha256:${createHash('sha256').update(value).digest('hex')}`;
}

export function createPiPilotChallenge({
  randomId = () => randomUUID().replaceAll('-', ''),
} = {}) {
  const id = randomId();
  assertAs02(
    typeof id === 'string' && /^[a-z0-9]{16,64}$/u.test(id),
    'PI_PILOT_CHALLENGE_INVALID',
    'Pi pilot challenge ID must contain 16 to 64 lowercase letters or numbers.',
  );
  const expectedOutput = `AS02_PI_PILOT_OK_${id}`;
  return Object.freeze({
    relativePath: CHALLENGE_PATH,
    expectedOutput,
    contents: `${expectedOutput}\n`,
    challengeHash: sha256(expectedOutput),
    prompt: [
      `Use the read tool exactly once to read ${CHALLENGE_PATH}.`,
      'The file contains a run-specific value that is not present in this prompt.',
      'After the tool result, reply with the exact file contents and nothing else.',
      'Do not guess, infer, or answer before reading the file.',
    ].join(' '),
  });
}

export function evaluatePiPilot({
  exitCode,
  policyHash,
  receipt,
  events,
  stdout,
  expectedOutput,
  expectedTools = BROKERED_TOOL_NAMES,
}) {
  const eventList = Array.isArray(events) ? events : [];
  const readEvents = eventList.filter((event) => event?.tool === 'read' && event?.result === 'SUCCEEDED');
  const otherEvents = eventList.filter((event) => event?.tool !== 'read');
  const outputMatched = Buffer.isBuffer(stdout) && stdout.toString('utf8').trim() === expectedOutput;
  const toolsMatched = JSON.stringify(receipt?.tools) === JSON.stringify(expectedTools);
  const status = exitCode === 0 &&
    receipt?.policyHash === policyHash &&
    toolsMatched &&
    readEvents.length === 1 &&
    otherEvents.length === 0 &&
    outputMatched
    ? 'PASS'
    : 'BLOCKED';

  return Object.freeze({
    status,
    successfulReadCalls: readEvents.length,
    otherToolCalls: otherEvents.map((event) => event?.tool ?? 'UNKNOWN'),
    outputMatched,
  });
}
