#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { S0_CAPABILITY_IDS, S0_CLASS_IDS, S0_VERDICT_VALUES } from '../spikes/arr-s0/src/contract.mjs';

const contractPath = 'docs/spikes/ARR-S0-HOST-CAPABILITY-CONTRACT.md';
const readmePath = 'spikes/arr-s0/README.md';
const mapPath = 'docs/DOCUMENTATION-MAP.md';
const statusPath = 'docs/tracking/STATUS.md';
const packagePath = 'package.json';

const [contract, readme, documentationMap, status, packageText] = await Promise.all([
  readFile(contractPath, 'utf8'),
  readFile(readmePath, 'utf8'),
  readFile(mapPath, 'utf8'),
  readFile(statusPath, 'utf8'),
  readFile(packagePath, 'utf8'),
]);

function exactTokens(text, pattern) {
  return [...new Set(text.match(pattern) ?? [])].sort();
}

assert.match(contract, /^status: proposed$/mu, 'S0 contract must remain proposed before Operator approval');
assert.match(contract, /^version: 0\.1\.0$/mu, 'S0 contract draft version must remain 0.1.0 before approval');
assert.match(contract, /GATE-S0-EXECUTE/u, 'S0 contract must name the separate real-host execution gate');
assert.match(contract, /real host probe[^\n]*(?:PROHIBITED|prohibited)/iu, 'S0 contract must explicitly prohibit real host probing before GATE-S0-EXECUTE');
assert.match(contract, /PHYSICALLY_PLAUSIBLE[^\n]*does not[^\n]*named candidate/iu, 'S0 contract must preserve class-hint semantics');

assert.deepEqual(
  exactTokens(contract, /\bHOST-[A-Z0-9-]+\b/gu),
  [...S0_CAPABILITY_IDS].sort(),
  'human S0 contract capability IDs must exactly match harness constants',
);
assert.deepEqual(
  exactTokens(contract, /\bCLASS-[A-Z0-9-]+\b/gu),
  [...S0_CLASS_IDS].sort(),
  'human S0 contract class IDs must exactly match harness constants',
);
assert.deepEqual(
  exactTokens(contract, /\b(?:ACCEPT_WITH_LIMITATIONS|ACCEPT|BLOCKED|REJECT)\b/gu),
  [...S0_VERDICT_VALUES].sort(),
  'human S0 contract verdict vocabulary must exactly match harness constants',
);

for (const forbidden of ['nono', 'BoxLite', 'smolvm', 'Sandlock', 'AgentFS', 'Sandbox Runtime']) {
  assert.equal(contract.includes(forbidden), false, `S0 host-fact contract leaked named candidate: ${forbidden}`);
}

for (const command of [
  'npm run arr-s0 -- preflight --json',
  'npm run arr-s0 -- run --json',
  'npm run arr-s0 -- report --run-id RUN_ID --json',
]) {
  assert.ok(readme.includes(command), `ARR-S0 README missing frozen CLI form: ${command}`);
}
for (const forbiddenCommand of [' setup ', ' install ', ' enable ', ' repair ', ' cleanup-host ']) {
  assert.equal(readme.includes(forbiddenCommand), false, `ARR-S0 README exposes mutating command ${forbiddenCommand.trim()}`);
}

assert.match(documentationMap, /DOC-ARR-S0-HOST-CAPABILITY-CONTRACT/u, 'Documentation Map must index the S0 contract');
assert.match(status, /ARR-S0 deterministic harness:[^\n]*IMPLEMENTED \/ REVIEW_REQUIRED/u, 'STATUS must expose deterministic implementation review gate');
assert.match(status, /ARR-S0 real host probe:[^\n]*PROHIBITED pending GATE-S0-EXECUTE/u, 'STATUS must keep real probe prohibited');

const pkg = JSON.parse(packageText);
assert.match(pkg.scripts.verify, /test:arr-s0/u, 'root verify must include ARR-S0 deterministic tests');

console.log('ARR-S0 contract consistency tests passed.');
