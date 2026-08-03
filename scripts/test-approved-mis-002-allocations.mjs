#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { evaluateReadiness } from './generate-capability-coverage.mjs';
import { loadDocumentRegistry } from './document-utils.mjs';

const traceability = JSON.parse(
  await readFile('docs/capabilities/CAP-EXECUTION/TRACEABILITY.json', 'utf8'),
);
const currentContract = JSON.parse(
  await readFile('.mnfs/missions/MIS-002/plan.json', 'utf8'),
);
const registry = await loadDocumentRegistry(process.cwd());

assert.equal(currentContract.missionId, 'MIS-002');
assert.equal(currentContract.revision, 5);
assert.equal(currentContract.content.schemaVersion, 2);
assert.equal(
  currentContract.contentHash,
  'sha256:d82252504044cab40e00013dc30534654382887b7819d60a916d2a9a56db4cc3',
);
assert.ok(currentContract.approvedAt, 'approved revision needs approvedAt');

const criterionIds = new Set([
  ...currentContract.content.acceptanceCriteria.map((criterion) => criterion.qualifiedId),
  ...currentContract.content.milestones.flatMap((milestone) => [
    ...milestone.acceptanceCriteria.map((criterion) => criterion.qualifiedId),
    ...milestone.features.flatMap((feature) =>
      feature.acceptanceCriteria.map((criterion) => criterion.qualifiedId),
    ),
  ]),
]);

assert.equal(traceability.requirements.length, 28);
for (const requirement of traceability.requirements) {
  assert.deepEqual(
    requirement.proposedAllocation,
    [],
    `${requirement.id} must have no proposed allocation after approval`,
  );
  assert.equal(
    requirement.allocatedTo.length > 0,
    true,
    `${requirement.id} must have an approved allocation`,
  );
  for (const target of requirement.allocatedTo) {
    assert.equal(target.startsWith('proposed:'), false, `${requirement.id} has proposed prefix`);
    assert.equal(
      criterionIds.has(target),
      true,
      `${requirement.id} target is absent from approved contract: ${target}`,
    );
  }
}

assert.deepEqual(traceability.baseline.missionContract, {
  missionId: 'MIS-002',
  currentRevision: 5,
  status: 'APPROVED_SCHEMA_V2',
});
assert.deepEqual(traceability.blockingItems, []);

const readiness = await evaluateReadiness(traceability, registry, { currentContract });
for (const id of ['R0', 'R1', 'R2', 'R3', 'R4']) {
  assert.equal(readiness[id].result, 'PASS', `${id} must pass: ${readiness[id].reason}`);
}
assert.equal(readiness.R5.result, 'NOT_STARTED');

console.log('Approved MIS-002 allocation tests passed.');
