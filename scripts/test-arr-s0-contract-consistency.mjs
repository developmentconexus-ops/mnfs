#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { S0_CAPABILITY_IDS, S0_CLASS_IDS, S0_VERDICT_VALUES } from '../spikes/arr-s0/src/contract.mjs';

const contractPath = 'docs/spikes/ARR-S0-HOST-CAPABILITY-CONTRACT.md';
const readmePath = 'spikes/arr-s0/README.md';
const mapPath = 'docs/DOCUMENTATION-MAP.md';
const statusPath = 'docs/tracking/STATUS.md';
const agentsPath = 'AGENTS.md';
const arrPath = 'docs/tracking/ARCHITECTURE-REALIZATION-REVIEW.md';
const decisionsPath = 'docs/tracking/DECISIONS.md';
const packagePath = 'package.json';

const [contract, readme, documentationMap, status, agents, arrReview, decisions, packageText] = await Promise.all([
  readFile(contractPath, 'utf8'),
  readFile(readmePath, 'utf8'),
  readFile(mapPath, 'utf8'),
  readFile(statusPath, 'utf8'),
  readFile(agentsPath, 'utf8'),
  readFile(arrPath, 'utf8'),
  readFile(decisionsPath, 'utf8'),
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

assert.match(contract, /^status: accepted$/mu, 'S0 contract must be accepted before Task 12 authority can be formed');
assert.match(contract, /^version: 1\.0\.0$/mu, 'S0 accepted contract version must be 1.0.0');
assert.match(contract, /explicit Operator Decision has accepted these exact contract bytes/iu, 'S0 contract must state exact-byte Operator acceptance');
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

assert.match(readme, /contract[^\n]*1\.0\.0[^\n]*accepted|accepted[^\n]*contract[^\n]*1\.0\.0/iu, 'README must expose accepted S0 contract 1.0.0');
assert.match(readme, /Contract acceptance is not real-host execution authority/iu, 'README must keep contract acceptance distinct from execution');
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
assert.match(documentationMap, /ARR-S0 contract:\s+ACCEPTED 1\.0\.0 — D-021/u, 'Documentation Map must expose accepted S0 contract');
assert.match(documentationMap, /Task 12 real host observation is `CONTROLLED`, `NOT EXECUTED` and prohibited/u, 'Documentation Map must keep Task 12 controlled');

assert.match(status, /ARR-S0 deterministic harness:\s+Tasks 1–11 COMPLETE \/ REVIEW CLEAR/u, 'STATUS must expose reviewed S0 harness');
assert.match(status, /ARR-S0 host capability contract:\s+ACCEPTED 1\.0\.0 — D-021/u, 'STATUS must expose D-021 contract acceptance');
assert.match(status, /ARR-S0 Task 12 real host Evidence:\s+NOT EXECUTED \/ CONTROLLED \/ NOT AUTHORIZED/u, 'STATUS must keep Task 12 unexecuted and unauthorized');
assert.match(status, /Contract acceptance is not `GATE-S0-EXECUTE`/u, 'STATUS must keep contract acceptance separate from execution authority');

assert.match(agents, /ARR-S0 host capability contract:\s+ACCEPTED 1\.0\.0 — D-021/u, 'AGENTS must orient Fresh Actors to accepted S0 contract');
assert.match(agents, /ARR-S0 real host probe \/ Task 12:\s+PROHIBITED pending separate CONTROLLED GATE-S0-EXECUTE/u, 'AGENTS must keep Task 12 behind separate CONTROLLED authority');
assert.match(agents, /D-010 through D-020, plus D-021/u, 'AGENTS must expose D-021 without losing prior decision range');

assert.match(arrReview, /ARR-S0 contract 1\.0\.0\s+ACCEPTED — D-021/u, 'ARR review must expose D-021 contract acceptance');
assert.match(arrReview, /ARR-S0 Task 12\s+CONTROLLED \/ NOT AUTHORIZED \/ NOT EXECUTED/u, 'ARR review must keep Task 12 controlled');
assert.match(arrReview, /D-021 does \*\*not\*\* authorize `preflight`, `run`, Task 12 host observation/u, 'ARR review must keep D-021 bounded to contract acceptance');

const exactAcceptance = 'MNFS_ACCEPT_ARR_S0_CONTRACT version=1.0.0 contract_blob=d564359e5a366d9e17194dcd687b95f764bcf2f2 plan_blob=3e78445fcbcca360f612edefd025c6cb0f84f8e5 base_sha=3364757c4ac4e6ee6d4de3637435228d8a65eb8b scope=contract-acceptance-canonicalize-review-merge-no-host-observation';
assert.ok(decisions.includes(exactAcceptance), 'D-021 must preserve the exact Operator contract-acceptance authority');
assert.match(decisions, /\| D-021 \| 2026-08-08 \| Accept `DOC-ARR-S0-HOST-CAPABILITY-CONTRACT` version 1\.0\.0/u, 'Decision register must contain D-021');

const contractBytes = Buffer.from(contract, 'utf8');
const contractGitBlob = createHash('sha1')
  .update(`blob ${contractBytes.length}\0`)
  .update(contractBytes)
  .digest('hex');
assert.equal(
  contractGitBlob,
  'd564359e5a366d9e17194dcd687b95f764bcf2f2',
  'current S0 contract bytes must remain exactly the Git blob accepted by D-021',
);
const contractSha256 = `sha256:${createHash('sha256').update(contractBytes).digest('hex')}`;
assert.equal(
  contractSha256,
  'sha256:2891a1a2dda0dc1cfe146174839c988be7d76dc3c710cd4d15d1b247f0753f5d',
  'current S0 contract bytes must remain exactly the SHA-256 accepted for the Task 12 gate binding',
);

const pkg = JSON.parse(packageText);
assert.match(pkg.scripts.verify, /test:arr-s0/u, 'root verify must include ARR-S0 deterministic tests');

console.log(`ARR-S0 accepted contract sha256: ${contractSha256}`);
console.log('ARR-S0 contract consistency tests passed.');
