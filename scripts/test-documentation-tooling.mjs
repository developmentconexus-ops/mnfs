#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { evaluateReadiness } from './generate-capability-coverage.mjs';
import { loadDocumentRegistry, parseFrontmatter, resolveDocumentReference, validateJsonSchema } from './document-utils.mjs';
import { hashSecE1Bytes, validateSecE1 } from './sec-e1-policy.mjs';

const root = process.cwd();
const registry = await loadDocumentRegistry(root);
const traceability = JSON.parse(await readFile(path.join(root, 'docs/capabilities/CAP-EXECUTION/TRACEABILITY.json'), 'utf8'));
const metadataSchema = JSON.parse(await readFile(path.join(root, 'schemas/document-metadata.schema.json'), 'utf8'));
const traceabilitySchema = JSON.parse(await readFile(path.join(root, 'schemas/capability-traceability.schema.json'), 'utf8'));
const currentContract = JSON.parse(await readFile(path.join(root, '.mnfs/missions/MIS-002/plan.json'), 'utf8'));
const capabilitySpecText = await readFile(path.join(root, 'docs/capabilities/CAP-EXECUTION/SPEC.md'), 'utf8');
const domainModelText = await readFile(path.join(root, 'docs/product/blueprint/02-domain-model.md'), 'utf8');
const mcrmText = await readFile(path.join(root, 'docs/product/CAPABILITY-REALIZATION-METHOD.md'), 'utf8');
const adrIndexText = await readFile(path.join(root, 'docs/adr/README.md'), 'utf8');
const adrFiles = {
  'ADR-0001': 'docs/adr/0001-pi-first-wsl2.md',
  'ADR-0003': 'docs/adr/0003-worktree-write-tracks.md',
  'ADR-0006': 'docs/adr/0006-security-planes-and-local-execution-isolation.md',
  'ADR-0008': 'docs/adr/0008-reproducible-and-remote-execution-environments.md',
  'ADR-0013': 'docs/adr/0013-wsl2-host-and-replaceable-agent-runtime.md',
  'ADR-0014': 'docs/adr/0014-isolated-mutable-workspace-per-write-track.md',
  'ADR-0015': 'docs/adr/0015-property-based-execution-environments.md',
};
const adrTexts = Object.fromEntries(await Promise.all(
  Object.entries(adrFiles).map(async ([id, rel]) => [id, await readFile(path.join(root, rel), 'utf8')]),
));

function registryWithCapabilityStatus(status) {
  const documents = new Map(registry.documents);
  const capability = documents.get('CAP-EXECUTION');
  assert.ok(capability, 'CAP-EXECUTION must resolve in the document registry');
  documents.set('CAP-EXECUTION', {
    ...capability,
    metadata: { ...capability.metadata, status },
  });
  return { ...registry, documents };
}

function approvedAllocationTraceability() {
  const data = structuredClone(traceability);
  for (const requirement of data.requirements) {
    if (!(requirement.allocatedTo?.length > 0)) {
      requirement.allocatedTo = (requirement.proposedAllocation ?? []).map((value) =>
        value.replace(/^proposed:/u, ''),
      );
    }
    requirement.proposedAllocation = [];
  }
  data.blockingItems = [];
  data.baseline.missionContract = {
    missionId: 'MIS-002',
    currentRevision: 5,
    status: 'APPROVED_SCHEMA_V2',
  };
  return data;
}

function approvedContractFor(data) {
  const allocationIds = data.requirements.flatMap((requirement) => requirement.allocatedTo ?? []);
  const criteria = (prefix) => allocationIds
    .filter((id) => id.startsWith(prefix))
    .map((qualifiedId) => ({ qualifiedId }));
  return {
    missionId: 'MIS-002',
    revision: 5,
    contentHash: `sha256:${'a'.repeat(64)}`,
    approvedAt: '2026-08-03T00:00:00.000Z',
    content: {
      schemaVersion: 2,
      acceptanceCriteria: criteria('MIS-002/AC-'),
      milestones: [
        {
          qualifiedId: 'MIS-002/M01',
          acceptanceCriteria: criteria('MIS-002/M01/AC-'),
          features: [],
        },
        {
          qualifiedId: 'MIS-002/M02',
          acceptanceCriteria: criteria('MIS-002/M02/AC-'),
          features: [],
        },
      ],
    },
  };
}

const documentationWorkflow = await readFile(path.join(root, '.github/workflows/docs.yml'), 'utf8');
assert.match(documentationWorkflow, /'policies\/\*\*'/u);
assert.match(documentationWorkflow, /'scripts\/sec-e1-policy\.mjs'/u);

const historicalMissionText = await readFile(
  path.join(root, '.mnfs/missions/MIS-002/history/revision-0003.json'),
  'utf8',
);
const historicalMissionBlob = createHash('sha1')
  .update(`blob ${Buffer.byteLength(historicalMissionText)}\0`)
  .update(historicalMissionText)
  .digest('hex');
assert.equal(historicalMissionBlob, '6b79117fe66cd5c9c8142099828812f470ce20de');

const secE1Bytes = await readFile(path.join(root, 'policies/SEC-E1.json'));
const secE1 = JSON.parse(secE1Bytes.toString('utf8'));
assert.deepEqual(validateSecE1(secE1), []);
assert.match(hashSecE1Bytes(secE1Bytes), /^sha256:[a-f0-9]{64}$/u);

const withAbsolutePath = structuredClone(secE1);
withAbsolutePath.filesystem.allowWriteScopes.push('/home/operator');
assert.ok(validateSecE1(withAbsolutePath).some((error) => error.includes('symbolic scopes')));

const withUnknownScope = structuredClone(secE1);
withUnknownScope.filesystem.allowWriteScopes.push('ENTIRE_FILESYSTEM');
assert.ok(validateSecE1(withUnknownScope).some((error) => error.includes('reviewed scopes')));

const withNetwork = structuredClone(secE1);
withNetwork.network.mode = 'ALLOWLIST';
assert.ok(validateSecE1(withNetwork).some((error) => error.includes('DENY_ALL')));

const withCredential = structuredClone(secE1);
withCredential.credentials.mode = 'HOST';
assert.ok(validateSecE1(withCredential).some((error) => error.includes('NONE')));

const withDifferentTools = structuredClone(secE1);
withDifferentTools.tools = [...secE1.tools, 'web'];
assert.ok(validateSecE1(withDifferentTools).some((error) => error.includes('seven-tool inventory')));

const withFailOpen = structuredClone(secE1);
withFailOpen.sandboxRuntime.failClosed = false;
assert.ok(validateSecE1(withFailOpen).some((error) => error.includes('fail closed')));

const withShell = structuredClone(secE1);
withShell.process.shell = true;
assert.ok(validateSecE1(withShell).some((error) => error.includes('shell must remain false')));

const withBroaderEffect = structuredClone(secE1);
withBroaderEffect.effects.maximumClass = 'X2';
assert.ok(validateSecE1(withBroaderEffect).some((error) => error.includes('X1-or-lower')));

const parsed = parseFrontmatter(`---\nid: DOC-TEST\ntitle: Test\ndocument_type: reference\nauthority: reference\nstatus: accepted\nowners:\n  - owner\n---\n\n# Test\n`, 'fixture.md');
assert.deepEqual(parsed.metadata.owners, ['owner']);
assert.equal(validateJsonSchema(parsed.metadata, metadataSchema).length, 0);
assert.ok(validateJsonSchema({ ...parsed.metadata, owners: [] }, metadataSchema).some((error) => error.includes('at least 1')));

assert.equal(resolveDocumentReference('DOC-PRODUCT-BLUEPRINT-01#pb-p4', registry).ok, true);
assert.equal(resolveDocumentReference('ACCEPTANCE-CAP-EXECUTION-R3', registry).ok, true);
assert.equal(resolveDocumentReference('DOC-NOT-REAL', registry).ok, false);

const base = await evaluateReadiness(structuredClone(traceability), registry, { currentContract });
assert.equal(base.R0.result, 'PASS');
assert.equal(base.R1.result, 'PASS');
assert.equal(base.R2.result, 'PASS');
assert.equal(base.R3.result, 'PASS');
assert.equal(base.R4.result, 'PASS');

const capabilitySpec = parseFrontmatter(capabilitySpecText, 'docs/capabilities/CAP-EXECUTION/SPEC.md');
assert.equal(capabilitySpec.metadata.status, 'accepted');
assert.equal(capabilitySpec.metadata.implementation_status, 'planned');
assert.equal(capabilitySpec.metadata.version, '0.1.0');
assert.match(capabilitySpecText, /CAP_EXECUTION_ACCEPT version=0\.1\.0/u);
assert.match(capabilitySpecText, /as02-20260803t144645276z-7048d3/u);
assert.match(capabilitySpecText, /sha256:886eb0f1fb5c2087d0b5bf16a51f399dc1ffb9a75aab16d4900a9ffe6ab57797/u);
assert.match(capabilitySpecText, /restart[^\n]*PASS/iu);
assert.match(capabilitySpecText, /sem drift|no drift|drift[^\n]*0/iu);

const proposedRegistry = registryWithCapabilityStatus('proposed');
const proposedSpec = await evaluateReadiness(structuredClone(traceability), proposedRegistry, { currentContract });
assert.equal(proposedSpec.R3.result, 'REVIEW_REQUIRED');
assert.equal(proposedSpec.R4.result, 'BLOCKED');

for (const id of ['CAP-EXEC-REQ-010', 'CAP-EXEC-REQ-011', 'CAP-EXEC-REQ-012', 'CAP-EXEC-REQ-013']) {
  const requirement = traceability.requirements.find((item) => item.id === id);
  assert.ok(requirement, `${id} must exist`);
  assert.equal(requirement.state, 'DESIGNED');
  assert.deepEqual(requirement.blockers, []);
  assert.ok(requirement.evidencedBy.includes('ACCEPTANCE-AS-02-LOCAL-PI-SANDBOX-WSL2'));
}
assert.equal(traceability.blockingItems.some((item) => item.id === 'BLOCK-AS-02'), false);
assert.equal(
  traceability.nextSequence[0],
  'review mechanical R0-R4 evidence',
);

assert.match(
  domainModelText,
  /\| Receipt \| M2 — bounded Minimal Deterministic Receipt; M5\+ — generalized Receipt\/Evidence capability \|/u,
);
assert.match(
  domainModelText,
  /M2 implementa apenas um Minimal Deterministic Receipt delimitado[^\n]*Golden Proof/iu,
);

for (const marker of [
  'R4A — Validation Baseline',
  'R4B — Decomposition and Allocation',
  'Fresh Actor',
  'HANDOFF_REQUIRED',
  'OWN / ADOPT / ADAPT / SPIKE / REFERENCE / DEFER / REJECT',
]) {
  assert.ok(mcrmText.includes(marker), `MCRM missing accepted execution-planning marker: ${marker}`);
}
assert.equal((mcrmText.match(/^# 10\. O ciclo MCRM$/gmu) ?? []).length, 1, 'MCRM must keep one canonical R0-R8 lifecycle');
assert.match(mcrmText, /R0 Baseline[\s\S]*R8 Closeout and Learning/u);

for (const id of ['ADR-0013', 'ADR-0014', 'ADR-0015']) {
  assert.ok(adrIndexText.includes(id), `ADR index must include ${id}`);
}
for (const [previous, successor] of [
  ['ADR-0001', 'ADR-0013'],
  ['ADR-0003', 'ADR-0014'],
  ['ADR-0006', 'ADR-0015'],
  ['ADR-0008', 'ADR-0015'],
]) {
  const previousMeta = parseFrontmatter(adrTexts[previous], adrFiles[previous]).metadata;
  const successorMeta = parseFrontmatter(adrTexts[successor], adrFiles[successor]).metadata;
  assert.equal(previousMeta.status, 'superseded', `${previous} must preserve history as superseded`);
  assert.equal(previousMeta.superseded_by, successor, `${previous} must point to ${successor}`);
  assert.ok((successorMeta.supersedes ?? []).includes(previous), `${successor} must reciprocally supersede ${previous}`);
  assert.equal(successorMeta.status, 'accepted', `${successor} must be accepted provider-neutral authority`);
}

const schemaCandidate = structuredClone(traceability);
for (const requirement of schemaCandidate.requirements) requirement.allocatedTo = [];
assert.equal(validateJsonSchema(schemaCandidate, traceabilitySchema).length, 0);

const acceptedRegistry = registryWithCapabilityStatus('accepted');
const acceptedSpec = await evaluateReadiness(structuredClone(traceability), acceptedRegistry, { currentContract });
assert.equal(acceptedSpec.R3.result, 'PASS');
assert.equal(acceptedSpec.R4.result, 'PASS');

const approvedData = approvedAllocationTraceability();
const approvedContract = approvedContractFor(approvedData);
const approvedReadiness = await evaluateReadiness(approvedData, acceptedRegistry, {
  currentContract: approvedContract,
});
assert.equal(approvedReadiness.R2.result, 'PASS');
assert.equal(approvedReadiness.R3.result, 'PASS');
assert.equal(approvedReadiness.R4.result, 'PASS');

const proposedOnly = structuredClone(approvedData);
const approvedTarget = proposedOnly.requirements[0].allocatedTo[0];
assert.ok(approvedTarget, 'approved fixture must include one criterion target');
proposedOnly.requirements[0].allocatedTo = [];
proposedOnly.requirements[0].proposedAllocation = [`proposed:${approvedTarget}`];
const proposedOnlyReadiness = await evaluateReadiness(proposedOnly, acceptedRegistry, {
  currentContract: approvedContract,
});
assert.equal(proposedOnlyReadiness.R2.result, 'PASS');
assert.equal(proposedOnlyReadiness.R4.result, 'BLOCKED');

const missingAllocation = structuredClone(approvedData);
missingAllocation.requirements[0].allocatedTo = [];
assert.equal(
  (await evaluateReadiness(missingAllocation, acceptedRegistry, { currentContract: approvedContract })).R2.result,
  'BLOCKED',
);

const proposedPrefixInApproved = structuredClone(approvedData);
proposedPrefixInApproved.requirements[0].allocatedTo = ['proposed:MIS-002/M01/AC-01'];
assert.equal(
  (await evaluateReadiness(proposedPrefixInApproved, acceptedRegistry, { currentContract: approvedContract })).R2.result,
  'BLOCKED',
);

const unresolvedEvidence = structuredClone(traceability);
unresolvedEvidence.requirements[0].evidencedBy = ['DOC-NOT-REAL'];
assert.equal(
  (await evaluateReadiness(unresolvedEvidence, registry, { currentContract })).R2.result,
  'BLOCKED',
);

const staleBaseline = structuredClone(traceability);
staleBaseline.baseline.roadmap.version = '0.0.0';
assert.equal((await evaluateReadiness(staleBaseline, registry)).R0.result, 'BLOCKED');

const unassessed = structuredClone(traceability);
unassessed.applicability[0].state = 'UNASSESSED';
assert.equal((await evaluateReadiness(unassessed, registry)).R1.result, 'BLOCKED');

const unresolvedSource = structuredClone(traceability);
unresolvedSource.requirements[0].source = ['DOC-NOT-REAL'];
assert.equal((await evaluateReadiness(unresolvedSource, registry)).R2.result, 'BLOCKED');

const missingProof = structuredClone(traceability);
missingProof.requirements.find((item) => item.level === 'MUST').verifiedBy = [];
assert.equal((await evaluateReadiness(missingProof, registry)).R2.result, 'BLOCKED');

console.log('Documentation tooling tests passed.');
