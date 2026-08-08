#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const s1Contract = await readFile('docs/spikes/ARR-S1-AGENT-RUNTIME-CONTRACT.md', 'utf8');
const s1Plan = await readFile('docs/superpowers/plans/2026-08-07-arr-s1-agent-runtime-conformance.md', 'utf8');
const s2Contract = await readFile('docs/spikes/ARR-S2-EXECUTION-ENVELOPE-CONTRACT.md', 'utf8');
const s2Plan = await readFile('docs/superpowers/plans/2026-08-07-arr-s2-execution-envelope-conformance.md', 'utf8');
const status = await readFile('docs/tracking/STATUS.md', 'utf8');
const map = await readFile('docs/DOCUMENTATION-MAP.md', 'utf8');
const agents = await readFile('AGENTS.md', 'utf8');
const arr = await readFile('docs/tracking/ARCHITECTURE-REALIZATION-REVIEW.md', 'utf8');

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
assert.match(s1Contract, /not selection-eligible[\s\S]{0,180}`S1-C16`/iu, 'S1 must block selection when upgrade/removal evidence is incomplete');
assert.match(s1Contract, /No candidate execution is authorized by this proposed contract/iu, 'proposed S1 contract must grant no execution authority');
assert.match(s1Plan, /later exact `GATE-S1`/iu, 'S1 plan must keep real operations behind a later exact gate');
assert.match(s1Plan, /OpenCode native ACP must be exercised and finalized under the same contract before final S1 selection[\s\S]{0,220}`BLOCKED`[\s\S]{0,100}`REPLAN_REQUIRED`/iu, 'S1 plan must require completed external challenger comparison or block/replan');
assert.match(s1Plan, /do not globally install/iu, 'S1 must not globally install candidates');
assert.match(s1Plan, /Provider\/subscription credentials remain control-side|Never persist raw provider credentials/iu, 'S1 must preserve credential boundary');
assert.match(s1Plan, /Upgrade Policy/iu, 'S1 plan must produce candidate-specific Upgrade Policy evidence');
assert.match(s1Plan, /Removal Conditions/iu, 'S1 plan must produce candidate-specific Removal Conditions evidence');

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
assert.match(s2Contract, /not selection-eligible[\s\S]{0,220}`S2-C15`[\s\S]{0,80}`S2-C17`/iu, 'S2 must require dependency admission and resource binding before selection');
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
assert.match(s2Contract, /No candidate execution, installation or host remediation is authorized/iu, 'proposed S2 contract must grant no execution authority');

assert.match(s2Plan, /S2-C01\.\.S2-C17/u, 'S2 plan must implement all seventeen deciding criteria');
assert.match(s2Plan, /S2_COMPARISON_RESOURCE_BUDGET/u, 'S2 plan must freeze the comparison resource budget');
assert.match(s2Plan, /candidate-independent cgroup-v2 resource-governor preflight/iu, 'S2 plan must implement a common resource governor before adapters');
assert.match(s2Plan, /No test may expect a write to parent `cgroup\.subtree_control`/iu, 'S2 plan must test non-remediation of parent cgroup configuration');
assert.match(s2Plan, /no untrusted candidate payload starts before cgroup membership and exact limit read-back are proved/iu, 'S2 plan must fail closed before payload execution');
assert.match(s2Plan, /resource-launcher\.mjs/iu, 'S2 plan must include the trusted launcher barrier');
assert.match(s2Plan, /common resource governor failure prevents all SRT\/nono\/Sandlock payloads/iu, 'S2 orchestration must block every candidate if the common governor is unavailable');
assert.match(s2Plan, /Do not change KVM permissions, sysctl, AppArmor, WSL settings, services, Docker state, `cgroup\.subtree_control`/u, 'S2 plan must prohibit host and cgroup-parent remediation');
assert.match(s2Plan, /public Internet availability cannot decide the result/u, 'S2 network verdict must not depend on public Internet');
assert.match(s2Plan, /Upgrade Policy/iu, 'S2 plan must produce candidate-specific Upgrade Policy evidence');
assert.match(s2Plan, /Removal Conditions/iu, 'S2 plan must produce candidate-specific Removal Conditions evidence');

for (const [name, text] of [
  ['STATUS', status],
  ['Documentation Map', map],
  ['AGENTS', agents],
  ['ARR review', arr],
]) {
  assert.match(text, /ARR-S1[\s\S]{0,180}PROPOSED 0\.1\.0/iu, `${name} must expose proposed S1 pack`);
  assert.match(text, /ARR-S2[\s\S]{0,180}PROPOSED 0\.1\.0/iu, `${name} must expose proposed S2 pack`);
}

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
