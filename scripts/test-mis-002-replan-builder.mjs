#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { validateMissionPlan } from '../dist/src/domain/mission-plan.js';
import { buildMis002Replan } from './build-mis-002-replan.mjs';
import { hashSecE1Bytes } from './sec-e1-policy.mjs';

const policyBytes = await readFile('policies/SEC-E1.json');
const policyHash = hashSecE1Bytes(policyBytes);
const traceability = JSON.parse(
  await readFile('docs/capabilities/CAP-EXECUTION/TRACEABILITY.json', 'utf8'),
);

const first = buildMis002Replan(policyHash);
const second = buildMis002Replan(policyHash);
assert.deepEqual(first, second, 'builder output must be deterministic');

const candidate = validateMissionPlan(first, 'MIS-002');
assert.equal(candidate.schemaVersion, 2);
assert.equal(candidate.missionId, 'MIS-002');
assert.equal(candidate.environmentBinding.securityPolicyHash, policyHash);
assert.equal(candidate.milestones.length, 2);
assert.deepEqual(candidate.milestones.map((milestone) => milestone.features.length), [3, 5]);
assert.deepEqual(candidate.milestones.map((milestone) => milestone.qualifiedId), [
  'MIS-002/M01',
  'MIS-002/M02',
]);
assert.equal(candidate.acceptanceCriteria.length, 6);
assert.deepEqual(candidate.milestones.map((milestone) => milestone.acceptanceCriteria.length), [7, 15]);
assert.equal(candidate.requirementRefs.length, 28);
assert.deepEqual(
  candidate.requirementRefs,
  Array.from({ length: 28 }, (_, index) => `CAP-EXEC-REQ-${String(index + 1).padStart(3, '0')}`),
);
assert.equal(
  candidate.questions.some((question) => question.blocking && question.status === 'OPEN'),
  false,
  'candidate must have no blocking open question',
);

for (const milestone of candidate.milestones) {
  assert.ok(milestone.acceptanceCriteria.length > 0);
  for (const feature of milestone.features) {
    assert.ok(feature.acceptanceCriteria.length > 0, `${feature.qualifiedId} needs criteria`);
  }
}

const criterionIds = new Set([
  ...candidate.acceptanceCriteria.map((criterion) => criterion.qualifiedId),
  ...candidate.milestones.flatMap((milestone) => [
    ...milestone.acceptanceCriteria.map((criterion) => criterion.qualifiedId),
    ...milestone.features.flatMap((feature) =>
      feature.acceptanceCriteria.map((criterion) => criterion.qualifiedId),
    ),
  ]),
]);
const proposedTargets = traceability.requirements.flatMap((requirement) =>
  requirement.proposedAllocation.map((target) => target.replace(/^proposed:/u, '')),
);
assert.equal(proposedTargets.length, 28);
for (const target of proposedTargets) {
  assert.ok(criterionIds.has(target), `missing proposed target in candidate: ${target}`);
}

assert.throws(
  () => buildMis002Replan('sha256:not-a-real-hash'),
  /security policy hash/u,
);

console.log('MIS-002 Replan builder tests passed.');
