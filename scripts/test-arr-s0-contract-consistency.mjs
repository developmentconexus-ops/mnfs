#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { S0_CAPABILITY_IDS, S0_CLASS_IDS, S0_VERDICT_VALUES } from '../spikes/arr-s0/src/contract.mjs';

const contractPath = 'docs/spikes/ARR-S0-HOST-CAPABILITY-CONTRACT.md';
const readmePath = 'spikes/arr-s0/README.md';
const mapPath = 'docs/DOCUMENTATION-MAP.md';
const statusPath = 'docs/tracking/STATUS.md';
const agentsPath = 'AGENTS.md';
const packagePath = 'package.json';

const [contract, readme, documentationMap, status, agents, packageText] = await Promise.all([
  readFile(contractPath, 'utf8'),
  readFile(readmePath, 'utf8'),
  readFile(mapPath, 'utf8'),
  readFile(statusPath, 'utf8'),
  readFile(agentsPath, 'utf8'),
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
assert.match(
  contract,
  /(?:all new )?real host (?:probe|observation)[^\n]*(?:PROHIBITED|prohibited)[^\n]*GATE-S0-EXECUTE|GATE-S0-EXECUTE[^\n]*(?:PROHIBITED|prohibited)[^\n]*real host (?:probe|observation)/iu,
  'S0 contract must explicitly prohibit all new real host observation before GATE-S0-EXECUTE',
);
assert.match(contract, /PHYSICALLY_PLAUSIBLE[^\n]*does not[^\n]*named candidate/iu, 'S0 contract must preserve class-hint semantics');
assert.match(contract, /MNFS_ARR_S0_EXECUTE_AUTHORIZATION/u, 'S0 contract must name the dedicated runtime execution-authority channel');
assert.match(contract, /MNFS_AUTHORIZE_ARR_S0_EXECUTE[^\n]*plan_blob[^\n]*contract_sha256[^\n]*base_sha[^\n]*verify_run[^\n]*canonical-host-probe-only/u, 'S0 contract must document the exact execution token binding');
assert.match(contract, /state[- ]root filesystem[^\n]*(?:allowlist|reviewed|stat)/iu, 'S0 contract must require state-root filesystem proof');
assert.match(contract, /no-replace|hard-link|hard link/iu, 'S0 contract must document no-replace artifact publication');
assert.doesNotMatch(contract, /atomic rename/iu, 'S0 contract must not claim replace-capable rename publication');
assert.match(
  contract,
  /`preflight`[^\n]*(?:requires|is gated by)[^\n]*GATE-S0-EXECUTE|GATE-S0-EXECUTE[^\n]*`preflight`/iu,
  'S0 contract must state that preflight itself requires GATE-S0-EXECUTE',
);
assert.match(
  contract,
  /(?:before any|before .*?)host(?:\/Git| or Git| and Git)? observation[^\n]*execution-authority token|execution-authority token[^\n]*(?:before any|before .*?)host(?:\/Git| or Git| and Git)? observation/iu,
  'S0 contract must state that execution authority is authenticated before host/Git observation',
);
assert.match(
  contract,
  /`report`[^\n]*(?:does not require|does not perform|reopens)[^\n]*(?:host|probe|Evidence)|(?:Evidence|host)[^\n]*`report`/iu,
  'S0 contract must explain that report only reopens existing Evidence and performs no new host observation',
);
assert.match(readme, /MNFS_ARR_S0_EXECUTE_AUTHORIZATION/u, 'ARR-S0 README must document the dedicated runtime execution-authority channel');
assert.match(readme, /no-replace|hard-link|hard link/iu, 'ARR-S0 README must document no-replace publication');
assert.match(
  readme,
  /`preflight`[^\n]*(?:requires|is gated by)[^\n]*GATE-S0-EXECUTE|GATE-S0-EXECUTE[^\n]*`preflight`/iu,
  'ARR-S0 README must state that preflight requires GATE-S0-EXECUTE',
);
assert.match(
  readme,
  /execution-authority token[^\n]*(?:before any|before .*?)(?:Git|host) observation|(?:before any|before .*?)(?:Git|host) observation[^\n]*execution-authority token/iu,
  'ARR-S0 README must state that authority is authenticated before Git/host observation',
);
assert.match(
  readme,
  /`report`[^\n]*(?:reopens|reads)[^\n]*Evidence[^\n]*(?:without|no)[^\n]*(?:host|probe)|`report`[^\n]*(?:without|no)[^\n]*(?:host|probe)/iu,
  'ARR-S0 README must state that report does not perform new host probing',
);

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
for (const forbiddenCommand of [' setup ', ' install ', ' enable ', ' repair ', ' cleanup-host ']) {
  assert.equal(readme.includes(forbiddenCommand), false, `ARR-S0 README exposes mutating command ${forbiddenCommand.trim()}`);
}

assert.match(documentationMap, /DOC-ARR-S0-HOST-CAPABILITY-CONTRACT/u, 'Documentation Map must index the S0 contract');
assert.match(status, /ARR-S0 deterministic harness:[^\n]*Tasks 1–11 implemented/u, 'STATUS must expose the implemented deterministic S0 harness');
assert.match(status, /ARR-S0 Task 11:[^\n]*REPLAN_REQUIRED \/ NOT CLOSED/u, 'STATUS must keep Task 11 open until the admitted correction is completed');
assert.match(status, /ARR-S0 Task 12 real host observation[^\n]*CONTROLLED|ARR-S0 Task 12 real host Evidence:[^\n]*NOT EXECUTED/u, 'STATUS must keep Task 12 separate from the bounded correction');
assert.match(status, /ARR-S0 Task 12 real host observation before its CONTROLLED authority/u, 'STATUS must keep Task 12 prohibited before separate CONTROLLED authority');
assert.match(agents, /ARR-S0 Task 11:[^\n]*REPLAN_REQUIRED \/ NOT CLOSED/u, 'AGENTS must orient Fresh Actors to the current S0 blocker');
assert.match(agents, /ARR-S0 real host probe \/ Task 12:[^\n]*PROHIBITED pending later CONTROLLED authority/u, 'AGENTS must keep the real host probe behind separate CONTROLLED authority');
assert.match(agents, /Risk-Proportional Execution Governance 1\.0\.0/u, 'AGENTS must include the current D-020 governance authority');

const pkg = JSON.parse(packageText);
assert.match(pkg.scripts.verify, /test:arr-s0/u, 'root verify must include ARR-S0 deterministic tests');

console.log('ARR-S0 contract consistency tests passed.');
