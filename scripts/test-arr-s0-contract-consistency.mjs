#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { S0_CAPABILITY_IDS, S0_CLASS_IDS, S0_VERDICT_VALUES } from '../spikes/arr-s0/src/contract.mjs';

const contractPath = 'docs/spikes/ARR-S0-HOST-CAPABILITY-CONTRACT.md';
const readmePath = 'spikes/arr-s0/README.md';
const mapPath = 'docs/DOCUMENTATION-MAP.md';
const statusPath = 'docs/tracking/STATUS.md';
const agentsPath = 'AGENTS.md';
const arrPath = 'docs/tracking/ARCHITECTURE-REALIZATION-REVIEW.md';
const packagePath = 'package.json';

const [contract, readme, documentationMap, status, agents, arrReview, packageText] = await Promise.all([
  readFile(contractPath, 'utf8'),
  readFile(readmePath, 'utf8'),
  readFile(mapPath, 'utf8'),
  readFile(statusPath, 'utf8'),
  readFile(agentsPath, 'utf8'),
  readFile(arrPath, 'utf8'),
  readFile(packagePath, 'utf8'),
]);

function exactTokens(text, pattern) {
  return [...new Set(text.match(pattern) ?? [])].sort();
}

function section(text, heading, nextHeading) {
  const start = text.indexOf(heading);
  assert.notEqual(start, -1, `missing contract section: ${heading}`);
  const end = nextHeading ? text.indexOf(nextHeading, start + heading.length) : text.length;
  assert.notEqual(end, -1, `missing next contract section: ${nextHeading}`);
  return text.slice(start, end);
}

assert.match(contract, /^status: proposed$/mu, 'S0 contract must remain proposed before Operator approval');
assert.match(contract, /^version: 0\.1\.0$/mu, 'S0 contract draft version must remain 0.1.0 before approval');
assert.match(contract, /GATE-S0-EXECUTE/u, 'S0 contract must name the separate real-host execution gate');
assert.match(contract, /MNFS_ARR_S0_EXECUTE_AUTHORIZATION/u, 'S0 contract must name the dedicated runtime authority channel');
assert.match(contract, /parsed and validated as an exact-bound Governance authorization/iu, 'S0 contract must describe exact-bound governance authorization');
assert.match(contract, /trusted Operator \+ trusted MNFS control-plane assumption/iu, 'S0 contract must state the current trust assumption');
assert.match(contract, /not cryptographic authentication[^\n]*non-repudiation/iu, 'S0 contract must reject cryptographic/non-repudiation claims');
assert.match(contract, /final read-only Git\/source observation/iu, 'S0 contract must require final pre-write source observation');
assert.match(contract, /before `state\/created\.json` exists[^\n]*collector/iu, 'S0 contract must bind source validation before first Evidence/collector');
assert.match(contract, /state[- ]root filesystem[^\n]*(?:allowlist|reviewed|stat)/iu, 'S0 contract must require state-root filesystem proof');
assert.match(contract, /no-replace|hard-link|hard link/iu, 'S0 contract must document no-replace artifact publication');
assert.doesNotMatch(contract, /token is authenticated|same authenticated|before authenticated/iu, 'S0 contract must not describe governance authorization as authenticated');

assert.match(readme, /parsed and validated as exact-bound Governance authorization/iu, 'README must use governance authorization terminology');
assert.match(readme, /re-observes Git source identity once more/iu, 'README must document final pre-write source re-observation');
assert.match(readme, /no-replace|hard-link|hard link/iu, 'README must document no-replace publication');
assert.doesNotMatch(readme, /token is authenticated|same authenticated|before authenticated/iu, 'README must not claim cryptographic authentication');

const capabilitySection = section(contract, '## 4. Required host capability observations', '## 5. Generic capability classes');
const classSection = section(contract, '## 5. Generic capability classes', '## 6. Mechanical overall Verdict');
const verdictSection = section(contract, '## 6. Mechanical overall Verdict', '## 7. Evidence integrity');

assert.deepEqual(
  exactTokens(capabilitySection, /\bHOST-[A-Z0-9-]+\b/gu),
  [...S0_CAPABILITY_IDS].sort(),
  'human S0 contract capability IDs must exactly match harness constants',
);
assert.deepEqual(
  exactTokens(classSection, /\bCLASS-[A-Z0-9-]+\b/gu),
  [...S0_CLASS_IDS].sort(),
  'human S0 contract class IDs must exactly match harness constants',
);
assert.deepEqual(
  exactTokens(verdictSection, /\b(?:ACCEPT_WITH_LIMITATIONS|ACCEPT|BLOCKED|REJECT)\b/gu),
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

assert.match(documentationMap, /DOC-ARR-S0-HOST-CAPABILITY-CONTRACT/u, 'Documentation Map must index the S0 contract');
assert.match(documentationMap, /ARR-S0 Task 11:\s+COMPLETE \/ REVIEW CLEAR/u, 'Documentation Map must expose Task 11 closeout');
assert.match(documentationMap, /Task 12 real host observation is `CONTROLLED`, `NOT EXECUTED` and prohibited/u, 'Documentation Map must keep Task 12 controlled');

assert.match(status, /ARR-S0 deterministic harness:\s+Tasks 1–11 COMPLETE \/ REVIEW CLEAR/u, 'STATUS must expose reviewed S0 harness');
assert.match(status, /ARR-S0 Task 11:\s+COMPLETE \/ REVIEW CLEAR/u, 'STATUS must close Task 11');
assert.match(status, /Final source re-observation finding:\s+IMPLEMENTATION_DEFECT \/ CORRECTED/u, 'STATUS must record corrected implementation defect');
assert.match(status, /Non-forgeable Operator authority:\s+THREAT_MODEL_EXPANSION/u, 'STATUS must preserve D-019 threat-model disposition');
assert.match(status, /ARR-S0 Task 12 real host Evidence:\s+NOT EXECUTED \/ CONTROLLED \/ NOT AUTHORIZED/u, 'STATUS must keep Task 12 unexecuted and unauthorized');
assert.doesNotMatch(status, /## Immediate next action[\s\S]{0,500}Task 4/u, 'STATUS must not point back to completed Task 4');

assert.match(agents, /ARR-S0 deterministic harness:\s+Tasks 1–11 COMPLETE \/ REVIEW CLEAR/u, 'AGENTS must orient Fresh Actors to Task 11 closeout');
assert.match(agents, /ARR-S0 real host probe \/ Task 12:\s+PROHIBITED pending separate CONTROLLED authority/u, 'AGENTS must keep Task 12 behind separate CONTROLLED authority');
assert.match(agents, /Risk-Proportional Execution Governance 1\.0\.0/u, 'AGENTS must include D-020 governance');

assert.match(arrReview, /ARR-S0 Task 11\s+COMPLETE \/ REVIEW CLEAR/u, 'ARR review must close Task 11');
assert.match(arrReview, /ARR-S0 Task 12\s+CONTROLLED \/ NOT AUTHORIZED \/ NOT EXECUTED/u, 'ARR review must keep Task 12 controlled');
assert.match(arrReview, /THREAT_MODEL_EXPANSION/u, 'ARR review must preserve non-forgeability disposition');
assert.match(arrReview, /IMPLEMENTATION_DEFECT[^\n]*CORRECTED/u, 'ARR review must record corrected source-integrity finding');

const pkg = JSON.parse(packageText);
assert.match(pkg.scripts.verify, /test:arr-s0/u, 'root verify must include ARR-S0 deterministic tests');

console.log('ARR-S0 contract consistency tests passed.');
