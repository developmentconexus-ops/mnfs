#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const s1Contract = await readFile('docs/spikes/ARR-S1-AGENT-RUNTIME-CONTRACT.md', 'utf8');
const s1Plan = await readFile('docs/superpowers/plans/2026-08-07-arr-s1-agent-runtime-conformance.md', 'utf8');
const s2Contract = await readFile('docs/spikes/ARR-S2-EXECUTION-ENVELOPE-CONTRACT.md', 'utf8');
const s2Plan = await readFile('docs/superpowers/plans/2026-08-07-arr-s2-execution-envelope-conformance.md', 'utf8');
const acceptance = await readFile('docs/acceptance/2026-08-08-arr-s1-s2-pack-acceptance.md', 'utf8');
const decisions = await readFile('docs/tracking/DECISIONS.md', 'utf8');
const status = await readFile('docs/tracking/STATUS.md', 'utf8');
const map = await readFile('docs/DOCUMENTATION-MAP.md', 'utf8');
const agents = await readFile('AGENTS.md', 'utf8');
const arr = await readFile('docs/tracking/ARCHITECTURE-REALIZATION-REVIEW.md', 'utf8');
const operatorAcceptance = 'MNFS_ACCEPT_ARR_S1_S2_PACKS s1_contract_blob=f032f09fefd1a2a1d36e568f00732e8eedd8aa89 s1_plan_blob=277dffc521754a4370bfd94132dc9467589fdcf0 s2_contract_blob=47d50cefa46fa71652bbebfd0186be142d5a807e s2_plan_blob=1923a87f08a334f30275c767ba9d76cbad898ed3 base_sha=032620c35c95e932e6f5c5468c85273ddac25f38 verify_run=31286529184 scope=accept-canonicalize-s1-s2-packs-and-authorize-deterministic-harness-implementation-no-candidate-execution';

function gitBlobSha(text) {
  const bytes = Buffer.from(text, 'utf8');
  return createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
}

for (const [name, text, id] of [
  ['S1 contract', s1Contract, 'DOC-ARR-S1-AGENT-RUNTIME-CONTRACT'],
  ['S1 plan', s1Plan, 'PLAN-ARR-S1-AGENT-RUNTIME-CONFORMANCE'],
  ['S2 contract', s2Contract, 'DOC-ARR-S2-EXECUTION-ENVELOPE-CONTRACT'],
  ['S2 plan', s2Plan, 'PLAN-ARR-S2-EXECUTION-ENVELOPE-CONFORMANCE'],
]) {
  assert.match(text, new RegExp(`^id: ${id}$`, 'mu'), `${name} must expose the exact canonical id`);
  assert.match(text, /^status: proposed$/mu, `${name} must remain proposed before Operator acceptance`);
  assert.match(text, /^version: 0\.1\.0$/mu, `${name} proposed version must be 0.1.0`);
}

for (const [name, text, expectedSha] of [
  ['S1 contract', s1Contract, 'f032f09fefd1a2a1d36e568f00732e8eedd8aa89'],
  ['S1 plan', s1Plan, '277dffc521754a4370bfd94132dc9467589fdcf0'],
  ['S2 contract', s2Contract, '47d50cefa46fa71652bbebfd0186be142d5a807e'],
  ['S2 plan', s2Plan, '1923a87f08a334f30275c767ba9d76cbad898ed3'],
]) {
  assert.equal(gitBlobSha(text), expectedSha, `${name} must remain byte-identical to the accepted blob`);
}

assert.match(acceptance, /^id: ACCEPTANCE-ARR-S1-S2-PACKS$/mu, 'S1/S2 acceptance record must expose the canonical id');
assert.ok(acceptance.includes(operatorAcceptance), 'acceptance record must preserve the exact Operator acceptance binding');
const d022 = decisions.split('\n').find((line) => line.startsWith('| D-022 |'));
assert.ok(d022?.includes(operatorAcceptance), 'D-022 must preserve the exact Operator acceptance binding');

// S1: Pi-first ordering without Pi preselection.
for (const marker of [
  '@earendil-works/pi-coding-agent@0.84.1',
  '53fa77ccd8a279eb87e92294ef3687b03ff80112',
  'pi-acp@0.0.33',
  'd1cffc047ab37a096ee70ca39cfc1de463db8d12',
  '@agentclientprotocol/sdk@1.3.0',
  'e1054d0122e844cca9f1016a598a1da06f78ccef',
  'v1.18.15',
  '325529761beb79a004de6d86e48b8db69cf4eba3',
  'Pi SDK',
  'Pi-ACP',
  'OpenCode native ACP',
]) {
  assert.ok(s1Contract.includes(marker), `S1 contract missing frozen marker: ${marker}`);
}
assert.match(s1Contract, /OpenCode native ACP is mandatory before a final S1 selection/iu, 'S1 must preserve a real external challenger');
assert.match(s1Contract, /Direct Pi RPC is not a mandatory full third candidate/iu, 'direct Pi RPC must remain conditional');
assert.match(s1Contract, /second independent ACP implementation before selecting ACP generically/iu, 'S1 must require a second ACP only when ACP remains decision-relevant');
assert.match(s1Contract, /Pi-first is an execution-order optimization, not winner preselection/iu, 'Pi preference must not change deciding criteria');
assert.match(s1Contract, /OpenCode ACP has been \*\*executed and finalized under the same contract\*\*[\s\S]{0,220}`PASS` or `FAIL`/iu, 'S1 must require completed external comparison before selection');
assert.match(s1Contract, /`BLOCKED` does not satisfy the required external comparison/iu, 'S1 must not treat a blocked challenger as completed comparison');
assert.match(s1Contract, /If OpenCode ACP is `BLOCKED`[\s\S]{0,300}cannot select Pi/iu, 'S1 must prevent incumbent-only selection when challenger comparison is blocked');
assert.match(s1Contract, /Upgrade Policy[\s\S]{0,120}Removal Conditions/iu, 'S1 contract must require D-014 upgrade and removal evidence');
assert.match(s1Contract, /single authoritative selection predicate is `S1_SELECTION_ELIGIBLE\(candidateOrBoundary\)`/iu, 'S1 must define one authoritative selection predicate');
assert.match(s1Contract, /candidateOrBoundary\.verdict == PASS[\s\S]{0,220}EVERY required result S1-C01\.\.S1-C16 == PASS/iu, 'S1 selection predicate must require candidate PASS and every required criterion PASS');
assert.match(s1Contract, /required `FAIL`, `BLOCKED` or `UNKNOWN` criterion has `S1_SELECTION_ELIGIBLE=false`/iu, 'S1 must make any non-PASS required criterion non-selectable');
assert.match(s1Contract, /When runtime and integration boundary are distinct selection objects[\s\S]{0,180}both[\s\S]{0,120}`S1_SELECTION_ELIGIBLE`/iu, 'S1 must qualify runtime and boundary independently when distinct');
assert.match(s1Contract, /Every\*\* `SELECT` output[\s\S]{0,180}`S1_SELECTION_ELIGIBLE=true`/iu, 'every S1 SELECT must depend on the authoritative predicate');
assert.match(s1Contract, /`S1-C12` PASS requires a supported\/documented upstream public boundary/iu, 'S1-C12 PASS must require a supported/documented upstream public boundary');
assert.match(s1Contract, /unsupported,\s*private\s+or\s+undocumented boundary/iu, 'S1-C12 must name unsupported, private and undocumented boundaries explicitly');
assert.match(s1Contract, /`S1-C12\s*!=\s*PASS`\s+(?:and|therefore|then|→)\s*`S1_SELECTION_ELIGIBLE=false`/iu, 'S1-C12 non-PASS must explicitly imply ineligibility');
assert.match(s1Contract, /No `SELECT` may point to a form whose boundary\s+(?:does not satisfy|fails)\s+`S1-C12`/iu, 'S1 SELECT must require a boundary that does not fail S1-C12');
assert.match(s1Contract, /No candidate execution is authorized by this proposed contract/iu, 'proposed S1 contract must grant no execution authority');
assert.match(s1Plan, /later exact `GATE-S1`/iu, 'S1 plan must keep real operations behind a later exact gate');
assert.match(s1Plan, /OpenCode native ACP must be exercised and finalized under the same contract before final S1 selection[\s\S]{0,220}`BLOCKED`[\s\S]{0,100}`REPLAN_REQUIRED`/iu, 'S1 plan must require completed external challenger comparison or block/replan');
assert.match(s1Plan, /do not globally install/iu, 'S1 must not globally install candidates');
assert.match(s1Plan, /Provider\/subscription credentials remain control-side|Never persist raw provider credentials/iu, 'S1 must preserve credential boundary');
assert.match(s1Plan, /Upgrade Policy/iu, 'S1 plan must produce candidate-specific Upgrade Policy evidence');
assert.match(s1Plan, /Removal Conditions/iu, 'S1 plan must produce candidate-specific Removal Conditions evidence');
assert.match(s1Plan, /selectionEligible=false/iu, 'S1 plan must implement a machine selection-eligibility result');

// S2: current-host eligible process candidates + mandatory common resource governor.
for (const marker of [
  '@anthropic-ai/sandbox-runtime@0.0.71',
  '121c6ac86df7c958aaf953d27116e74848c31318',
  'v0.72.0',
  '4a2236d93c5ddbc318fcffa3e65c99ff9fce8935',
  'v0.8.6',
  '033f7e24e29047a17aeb6f2f0e8fd77c69978abb',
]) {
  assert.ok(s2Contract.includes(marker), `S2 contract missing frozen marker: ${marker}`);
}
assert.match(s2Contract, /nono[\s\S]{0,220}Apache-2\.0/u, 'S2 contract must pin nono license provenance');
assert.match(s2Contract, /Sandlock[\s\S]{0,220}Apache-2\.0/u, 'S2 contract must pin Sandlock license provenance');
assert.match(s2Contract, /actual Landlock ABI >= 6/u, 'Sandlock must require actual ABI proof');
assert.match(s2Contract, /seccomp user notification usable/u, 'Sandlock must require seccomp notification proof');
assert.match(s2Contract, /Kernel version or `CONFIG_SECURITY_LANDLOCK=y` alone is insufficient/u, 'S2 must not infer ABI from generic host config');
assert.match(s2Contract, /BoxLite \/ KVM microVM[\s\S]*BLOCKED_BY_HOST/u, 'S2 must exclude BoxLite under accepted KVM facts');
assert.match(s2Contract, /smolvm \/ KVM microVM[\s\S]*BLOCKED_BY_HOST/u, 'S2 must exclude smolvm under accepted KVM facts');
assert.match(s2Contract, /Docker\/local container[\s\S]*REQUIRES_SETUP_DECISION/u, 'S2 must not introduce Docker setup as a candidate');
assert.match(s2Contract, /controlled local endpoint/iu, 'S2 network proof must use controlled local endpoints');
assert.match(s2Contract, /Real SSH keys, cloud credentials, browser profiles or operator secrets are never opened/iu, 'S2 must use synthetic secret evidence only');
assert.match(s2Contract, /Upgrade Policy[\s\S]{0,120}Removal Conditions/iu, 'S2 contract must require D-014 upgrade and removal evidence');
assert.match(s2Contract, /`S2-C17` \| resource\/process budget binding/iu, 'S2 contract must define the mandatory resource/process criterion');
for (const resourceMarker of [
  'cpu.max       = 100000 100000',
  'memory.max    = 1073741824',
  'pids.max      = 128',
  'wallClockMs   = 120000',
]) {
  assert.ok(s2Contract.includes(resourceMarker), `S2 contract missing frozen comparison resource budget: ${resourceMarker}`);
}
assert.match(s2Contract, /HOST-CGROUP-V2=SUPPORTED[^\n]*proves[^\n]*not/iu, 'S2 must not confuse S0 cgroup presence with writable delegation');
assert.match(s2Contract, /already-delegated cgroup-v2 parent/iu, 'S2 must require pre-existing cgroup delegation');
assert.match(s2Contract, /must not[\s\S]{0,260}cgroup\.subtree_control/iu, 'S2 must not enable parent cgroup controllers');
assert.match(s2Contract, /candidate workload cannot write the governor control files or migrate its process tree out/iu, 'S2 must prove governor escape prevention');
assert.match(s2Contract, /single authoritative selection predicate is `S2_SELECTION_ELIGIBLE\(candidate\)`/iu, 'S2 must define one authoritative selection predicate');
assert.match(s2Contract, /candidate\.verdict == PASS[\s\S]{0,220}EVERY required result S2-C01\.\.S2-C17 == PASS/iu, 'S2 selection predicate must require candidate PASS and every required criterion PASS');
assert.match(s2Contract, /required `FAIL`, `BLOCKED` or `UNKNOWN` criterion has `S2_SELECTION_ELIGIBLE=false`/iu, 'S2 must make any non-PASS required criterion non-selectable');
assert.match(s2Contract, /Every\*\* `SELECT` output[\s\S]{0,180}`S2_SELECTION_ELIGIBLE=true`/iu, 'every S2 SELECT must depend on the authoritative predicate');
assert.match(s2Contract, /No candidate execution, installation or host remediation is authorized/iu, 'proposed S2 contract must grant no execution authority');

assert.match(s2Plan, /S2-C01\.\.S2-C17/u, 'S2 plan must implement all seventeen deciding criteria');
assert.match(s2Plan, /S2_COMPARISON_RESOURCE_BUDGET/u, 'S2 plan must freeze the comparison resource budget');
assert.match(s2Plan, /candidate-independent cgroup-v2 resource-governor preflight/iu, 'S2 plan must implement a common resource governor before adapters');
assert.match(s2Plan, /No test may expect a write to parent `cgroup\.subtree_control`/iu, 'S2 plan must test non-remediation of parent cgroup configuration');
assert.match(s2Plan, /no untrusted candidate payload starts before cgroup membership and exact limit read-back are proved/iu, 'S2 plan must fail closed before payload execution');
assert.match(s2Plan, /resource-launcher\.mjs/iu, 'S2 plan must include the trusted launcher barrier');
assert.match(s2Plan, /common governor failure prevents all SRT\/nono\/Sandlock payloads/iu, 'S2 orchestration must block every candidate if the common governor is unavailable');
assert.match(s2Plan, /Do not change KVM permissions, sysctl, AppArmor, WSL settings, services, Docker state, `cgroup\.subtree_control`/u, 'S2 plan must prohibit host and cgroup-parent remediation');
assert.match(s2Plan, /public Internet availability cannot decide the result/u, 'S2 network verdict must not depend on public Internet');
assert.match(s2Plan, /Upgrade Policy/iu, 'S2 plan must produce candidate-specific Upgrade Policy evidence');
assert.match(s2Plan, /Removal Conditions/iu, 'S2 plan must produce candidate-specific Removal Conditions evidence');
assert.match(s2Plan, /candidate\.selectionEligible = false/iu, 'S2 plan must implement a machine selection-eligibility result');

for (const [name, text] of [
  ['STATUS', status],
  ['Documentation Map', map],
  ['AGENTS', agents],
  ['ARR review', arr],
]) {
  assert.match(text, /ARR-S1[\s\S]{0,220}ACCEPTED 0\.1\.0[\s\S]{0,180}D-022/iu, `${name} must expose accepted S1 pack authority`);
  assert.match(text, /ARR-S2[\s\S]{0,220}ACCEPTED 0\.1\.0[\s\S]{0,180}D-022/iu, `${name} must expose accepted S2 pack authority`);
}

assert.match(agents, /deterministic S1\/S2 harness implementation:\s+AUTHORIZED/iu, 'AGENTS must authorize deterministic harness implementation after pack acceptance');
assert.match(status, /deterministic S1\/S2 harness implementation:\s+AUTHORIZED/iu, 'STATUS must authorize deterministic harness implementation after pack acceptance');
assert.match(map, /deterministic S1\/S2 harness implementation[\s\S]{0,160}authorized/iu, 'Documentation Map must expose the accepted implementation boundary');
assert.match(arr, /deterministic S1\/S2 harness implementation[\s\S]{0,160}authorized/iu, 'ARR review must expose the accepted implementation boundary');

assert.match(status, /## Still prohibited until later authority\/Evidence[\s\S]{0,700}candidate acquisition\/installation\/execution/iu, 'STATUS must keep candidate operations explicitly prohibited');
assert.match(map, /Candidate installation\/execution[\s\S]{0,240}remain prohibited/iu, 'Documentation Map must keep candidate execution prohibited');
assert.match(agents, /Candidate execution\/selection:\s+PROHIBITED/iu, 'AGENTS must keep candidate execution prohibited');
assert.match(arr, /Candidate installation\/execution[\s\S]{0,260}remain prohibited/iu, 'ARR review must keep candidate execution prohibited');

for (const id of [
  'DOC-ARR-S1-AGENT-RUNTIME-CONTRACT',
  'PLAN-ARR-S1-AGENT-RUNTIME-CONFORMANCE',
  'DOC-ARR-S2-EXECUTION-ENVELOPE-CONTRACT',
  'PLAN-ARR-S2-EXECUTION-ENVELOPE-CONFORMANCE',
]) {
  assert.ok(map.includes(id), `Documentation Map must index ${id}`);
}

console.log('ARR-S1/S2 proposed planner pack consistency tests passed.');
