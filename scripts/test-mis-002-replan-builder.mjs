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
assert.equal(candidate.acceptanceCriteria.length, 7);
assert.deepEqual(candidate.milestones.map((milestone) => milestone.acceptanceCriteria.length), [8, 16]);
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

const missionGoldenProof = candidate.acceptanceCriteria.find(
  (criterion) => criterion.qualifiedId === 'MIS-002/AC-07',
);
assert.ok(missionGoldenProof, 'Mission Golden Proof criterion is required');
assert.deepEqual(missionGoldenProof.requirementRefs, candidate.requirementRefs);
assert.match(missionGoldenProof.statement, /Golden Proof/iu);
assert.match(missionGoldenProof.statement, /fresh Lead/iu);
assert.match(missionGoldenProof.statement, /Minimal (Deterministic )?Receipt/iu);
assert.match(missionGoldenProof.statement, /MNFS Gate/iu);
assert.match(missionGoldenProof.statement, /release/iu);
assert.equal(missionGoldenProof.verificationPlan.method, 'DEMONSTRATION');
assert.equal(missionGoldenProof.verificationPlan.proofType, 'VERDICT');
assert.equal(missionGoldenProof.verificationPlan.proofOwner, 'MNFS-GATE');

const [m01, m02] = candidate.milestones;
const m01Composition = m01.acceptanceCriteria.find(
  (criterion) => criterion.qualifiedId === 'MIS-002/M01/AC-08',
);
assert.ok(m01Composition, 'M01 composition criterion is required');
assert.deepEqual(m01Composition.requirementRefs, m01.requirementRefs);
assert.match(m01Composition.statement, /SQLite/iu);
assert.match(m01Composition.statement, /Domain Events/iu);
assert.match(m01Composition.statement, /Treehouse/iu);
assert.match(m01Composition.statement, /fresh (Lead|process)/iu);

const m02Composition = m02.acceptanceCriteria.find(
  (criterion) => criterion.qualifiedId === 'MIS-002/M02/AC-16',
);
assert.ok(m02Composition, 'M02 composition criterion is required');
assert.deepEqual(m02Composition.requirementRefs, m02.requirementRefs);
for (const phrase of [
  'canonical Ubuntu WSL2',
  'E1',
  'Pi Worker',
  'Claim',
  'fresh Lead',
  'Minimal Receipt',
  'MNFS Gate',
  'release',
]) {
  assert.match(m02Composition.statement, new RegExp(phrase, 'iu'));
}

const m01IdentityFeature = m01.features.find(
  (feature) => feature.qualifiedId === 'MIS-002/M01/F01',
);
assert.ok(m01IdentityFeature);
assert.equal(m01IdentityFeature.acceptanceCriteria.length, 5);
const migrationCriterion = m01IdentityFeature.acceptanceCriteria.find(
  (criterion) => /migration/iu.test(criterion.statement),
);
assert.ok(migrationCriterion, 'M01/F01 needs an explicit migration-preservation criterion');
assert.match(migrationCriterion.statement, /M0\/M1/iu);
assert.match(migrationCriterion.statement, /historical plan revisions/iu);
assert.match(migrationCriterion.statement, /fresh process/iu);

const failureDrillCriterion = candidate.acceptanceCriteria.find(
  (criterion) => criterion.qualifiedId === 'MIS-002/AC-03',
);
assert.ok(failureDrillCriterion);
for (const drill of [
  'duplicate Lease',
  'Intent persisted before external acquisition',
  'external worktree created before semantic commit',
  'orphan worktree',
  'Lease without worktree',
  'Worker exit without Claim',
  'Lead crash',
  'active Worker Run without process',
  'late result from a superseded Attempt',
  'stale Claim or Receipt',
  'sandbox unavailable',
  'sandbox violation',
  'policy-definition mismatch',
  'effective-policy mismatch',
  'repeated release',
  'release attempt by a stale Lease holder',
]) {
  assert.match(failureDrillCriterion.statement, new RegExp(drill, 'iu'));
}

assert.ok(
  candidate.risks.some(
    (risk) => /repo\.json/iu.test(risk.description) && /Issue #15/iu.test(risk.mitigation),
  ),
  'the discovered repository-identity recovery risk must be recorded',
);
assert.ok(
  candidate.scope.excluded.some((item) => /repository-identity recovery command/iu.test(item)),
  'the generalized recovery command must remain outside M2',
);

const criterionIds = new Set([
  ...candidate.acceptanceCriteria.map((criterion) => criterion.qualifiedId),
  ...candidate.milestones.flatMap((milestone) => [
    ...milestone.acceptanceCriteria.map((criterion) => criterion.qualifiedId),
    ...milestone.features.flatMap((feature) =>
      feature.acceptanceCriteria.map((criterion) => criterion.qualifiedId),
    ),
  ]),
]);

const approvedTargets = [];
for (const requirement of traceability.requirements) {
  assert.deepEqual(
    requirement.proposedAllocation ?? [],
    [],
    `${requirement.id} must have no proposed allocation after exact-hash approval`,
  );
  assert.equal(
    requirement.allocatedTo?.length,
    1,
    `${requirement.id} must have exactly one approved criterion allocation`,
  );
  const [target] = requirement.allocatedTo;
  assert.equal(
    target.startsWith('proposed:'),
    false,
    `${requirement.id} approved allocation must not use the proposed prefix`,
  );
  assert.ok(criterionIds.has(target), `missing approved target in candidate: ${target}`);
  approvedTargets.push(target);
}
assert.equal(approvedTargets.length, 28);
assert.equal(new Set(approvedTargets).size, 28, 'approved allocation targets must be unique');

assert.throws(
  () => buildMis002Replan('sha256:not-a-real-hash'),
  /security policy hash/u,
);

console.log('MIS-002 Replan builder tests passed.');
