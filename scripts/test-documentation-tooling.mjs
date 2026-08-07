#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
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
const roadmapGeneratorText = await readFile(path.join(root, 'scripts/generate-roadmap.mjs'), 'utf8');
const agentsText = await readFile(path.join(root, 'AGENTS.md'), 'utf8');
const documentationMapText = await readFile(path.join(root, 'docs/DOCUMENTATION-MAP.md'), 'utf8');
const toolingText = await readFile(path.join(root, 'docs/tooling-adoption.md'), 'utf8');
const statusText = await readFile(path.join(root, 'docs/tracking/STATUS.md'), 'utf8');
const decisionsText = await readFile(path.join(root, 'docs/tracking/DECISIONS.md'), 'utf8');
const arrReviewText = await readFile(path.join(root, 'docs/tracking/ARCHITECTURE-REALIZATION-REVIEW.md'), 'utf8');
const p1AcceptanceText = await readFile(path.join(root, 'docs/acceptance/2026-08-07-arr-p1-reconciliation-acceptance.md'), 'utf8');
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
assert.match(documentationWorkflow, /'scripts\/test-arr-s0-contract-consistency\.mjs'/u);

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

assert.match(roadmapGeneratorText, /M2 Opportunity Replan/u);
assert.match(roadmapGeneratorText, /ARR-S0/u);
assert.match(roadmapGeneratorText, /docs\/tracking\/STATUS\.md/u);
assert.doesNotMatch(roadmapGeneratorText, /AB1 — Architecture Baseline and Contract Reconciliation/u);

const canonicalFreshReadPath = [
  'docs/product/DEVELOPMENT-GOVERNANCE-METHOD.md',
  'docs/product/CAPABILITY-REALIZATION-METHOD.md',
  'docs/superpowers/specs/2026-08-07-layered-agent-execution-planning-design.md',
  'docs/tracking/ARCHITECTURE-REALIZATION-REVIEW.md',
  'docs/superpowers/plans/2026-08-07-architecture-reconciliation-arr-program.md',
];
let previousReadPathIndex = -1;
for (const rel of canonicalFreshReadPath) {
  const nextIndex = agentsText.indexOf(rel);
  assert.ok(nextIndex >= 0, `AGENTS missing current ARR read-path item: ${rel}`);
  assert.ok(nextIndex > previousReadPathIndex, `AGENTS read order is wrong around ${rel}`);
  previousReadPathIndex = nextIndex;
}
assert.match(agentsText, /MIS-002\/M02[^\n]*SUPERSEDED/iu);
assert.match(agentsText, /ARR-S0[^\n]*PROHIBITED/iu);

for (const id of [
  'ADR-0013',
  'ADR-0014',
  'ADR-0015',
  'DESIGN-LAYERED-AGENT-EXECUTION-PLANNING',
  'PLAN-ARCHITECTURE-RECONCILIATION-ARR-PROGRAM',
  'DOC-ARR-S0-HOST-CAPABILITY-CONTRACT',
]) {
  assert.ok(documentationMapText.includes(id), `Documentation Map missing ${id}`);
}
assert.match(documentationMapText, /M2 — Secure One-Worker Vertical Slice[^\n]*OPPORTUNITY_REPLAN/u);
assert.match(documentationMapText, /MIS-002\/M02[\s\S]{0,160}SUPERSEDED_AS_EXECUTION_PATH/u);
assert.match(documentationMapText, /ARR-S0[\s\S]*ARR-S3/u);

assert.match(toolingText, /projection of current capability-realization decisions/u);
assert.match(toolingText, /no production winner selected/u);
assert.match(toolingText, /Thin Sovereign Semantic Kernel/u);
assert.doesNotMatch(toolingText, /Pi[^\n]*`ADOPTED`/u);

assert.match(statusText, /\*\*Current phase:\*\* `ARR-S0 — DETERMINISTIC HARNESS IMPLEMENTED \/ REVIEW_REQUIRED`/u, 'STATUS current phase must expose ARR-S0 deterministic review gate');
assert.match(statusText, /Master program plan:[^\n]*ACCEPTED — GATE-P0[^\n]*52033adcdfb7163f63606034b9912942b018f38e/u, 'STATUS must record master plan acceptance');
assert.match(statusText, /ARR-S0 plan:[^\n]*ACCEPTED — GATE-P0[^\n]*3e78445fcbcca360f612edefd025c6cb0f84f8e5/u, 'STATUS must record S0 plan acceptance');
assert.match(statusText, /P1 Operator acceptance:[^\n]*D-017[^\n]*ACCEPTED/u, 'STATUS must preserve D-017 acceptance');
assert.match(statusText, /P1 integrated commit:[^\n]*def9e5fe819f76950d61fba2cf5abcda1533c07f/u, 'STATUS must preserve P1 integration identity');
assert.match(statusText, /P1-F03 Operator acceptance:[^\n]*D-018[^\n]*ACCEPTED/u, 'STATUS must preserve D-018 acceptance');
assert.match(statusText, /P1-F03 integrated commit:[^\n]*88c5e05964e8465ef4317a3b4174c6160d8cdefa/u, 'STATUS must preserve F03 integration identity');
assert.match(statusText, /ARR-S0 implementation token:[^\n]*MNFS_AUTHORIZE_ARR_S0_IMPLEMENT/u, 'STATUS must record exact S0 implementation authorization class');
assert.match(statusText, /ARR-S0 implementation base:[^\n]*ad913dd1e0ff3b286280081b5dd4ba90eb390972/u, 'STATUS must bind S0 implementation to the authorized base');
assert.match(statusText, /GATE-S0-IMPLEMENT:[^\n]*AUTHORIZED[^\n]*deterministic-harness-only/u, 'STATUS must expose bounded S0 implementation authority');
assert.match(statusText, /ARR-S0 deterministic harness:[^\n]*IMPLEMENTED \/ REVIEW_REQUIRED/u, 'STATUS must expose deterministic harness review gate');
assert.match(statusText, /ARR-S0 host contract:[^\n]*PROPOSED[^\n]*0\.1\.0[^\n]*NOT ACCEPTED/u, 'STATUS must keep S0 contract proposed');
assert.match(statusText, /ARR-S0 real host probe:[^\n]*PROHIBITED pending GATE-S0-EXECUTE/u, 'STATUS must keep real host probe gated');
assert.match(statusText, /## Immediate next action — ARR-S0 deterministic review/u, 'STATUS next action must be Task 10/11 deterministic review');
assert.doesNotMatch(statusText, /## Immediate next action — GATE-S0-IMPLEMENT review/u, 'STATUS must not point back to the already-authorized implementation gate');
assert.doesNotMatch(statusText, /## Immediate next action — GATE-P0/u, 'STATUS must not point back to completed GATE-P0');
assert.match(p1AcceptanceText, /MNFS_ACCEPT_ARR_P1 program_blob=52033adcdfb7163f63606034b9912942b018f38e pr=24 head=02e99b25842562d111488d5c8c7008cb2635f3da findings=critical:0,important:0/u, 'P1 acceptance record must bind the exact Operator token');
assert.match(decisionsText, /\| D-017 \| 2026-08-07 \| Accept ARR P1 \/ GATE-R[\s\S]*02e99b25842562d111488d5c8c7008cb2635f3da/u, 'D-017 must record exact P1 acceptance authority');
assert.match(decisionsText, /\| D-018 \| 2026-08-07 \| Accept the bounded ARR P1-F03[\s\S]*0b9fe9747887ef5817fffbb586db04ccb3292b27/u, 'D-018 must record exact P1-F03 acceptance authority');
assert.match(arrReviewText, /P1 \/ GATE-R[^\n]*ACCEPTED \/ INTEGRATED — D-017/u, 'ARR review must preserve integrated GATE-R history');
assert.match(agentsText, /ARR P1 reconciliation A1-A4 \+ B1:[^\n]*ACCEPTED — GATE-R \/ D-017/u, 'AGENTS must preserve accepted P1 authority');
assert.match(agentsText, /P1-F03 exact contract-binding correction:[^\n]*ACCEPTED — D-018 \/ INTEGRATED/u, 'AGENTS must preserve integrated F03 authority');
assert.match(agentsText, /PR #26 merge \/ integration:[^\n]*COMPLETE[^\n]*88c5e05964e8465ef4317a3b4174c6160d8cdefa/u, 'AGENTS must preserve F03 integration identity');

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
assert.equal(
  (await evaluateReadiness(unresolvedSource, registry, { currentContract })).R2.result,
  'BLOCKED',
);

const missingProof = structuredClone(traceability);
missingProof.requirements.find((item) => item.level === 'MUST').verifiedBy = [];
assert.equal((await evaluateReadiness(missingProof, registry, { currentContract })).R2.result, 'BLOCKED');

const spikeEvidenceTemp = await mkdtemp(path.join(tmpdir(), 'mnfs-arr-spike-evidence-'));
try {
  const artifactRoot = path.join(spikeEvidenceTemp, 'artifacts');
  await mkdir(artifactRoot, { recursive: true });
  const contractPath = path.join(spikeEvidenceTemp, 'contract.md');
  const contractBytes = Buffer.from('# Architecture Spike fixture contract\n', 'utf8');
  await writeFile(contractPath, contractBytes);
  const contractHash = 'sha256:' + createHash('sha256').update(contractBytes).digest('hex');
  const rawBytes = Buffer.from('raw-spike-evidence\n', 'utf8');
  await writeFile(path.join(artifactRoot, 'raw.bin'), rawBytes);
  const rawSha256 = 'sha256:' + createHash('sha256').update(rawBytes).digest('hex');

  const validSpikeEvidence = {
    schemaVersion: 1,
    spikeId: 'ARR-TEST',
    contractVersion: '1.0.0',
    contractHash,
    runId: 'arr-test-run-001',
    startedAt: '2026-08-07T12:00:00.000Z',
    finishedAt: '2026-08-07T12:00:01.000Z',
    canonicalHost: {
      kind: 'ubuntu-wsl2',
      identity: 'fixture-host',
    },
    source: {
      commitSha: 'a'.repeat(40),
      treeSha: 'b'.repeat(40),
    },
    candidate: null,
    criteria: [
      {
        id: 'CRIT-001',
        required: true,
        result: 'PASS',
        artifactRefs: ['raw-001'],
      },
    ],
    rawArtifacts: [
      {
        id: 'raw-001',
        path: 'raw.bin',
        sha256: rawSha256,
        sizeBytes: rawBytes.length,
      },
    ],
    limitations: [],
    measurements: [],
    verdictInput: {
      status: 'PASS',
      reasons: ['all required fixture criteria passed'],
    },
  };

  async function invokeSpikeEvidenceValidator(name, evidence) {
    const evidencePath = path.join(spikeEvidenceTemp, name + '.json');
    await writeFile(evidencePath, JSON.stringify(evidence, null, 2) + '\n', 'utf8');
    const result = spawnSync(
      process.execPath,
      [
        path.join(root, 'scripts/validate-docs.mjs'),
        '--architecture-spike-evidence',
        evidencePath,
        '--artifact-root',
        artifactRoot,
        '--contract',
        contractPath,
      ],
      {
        cwd: root,
        encoding: 'utf8',
        shell: false,
      },
    );
    return {
      status: result.status,
      output: String(result.stdout ?? '') + '\n' + String(result.stderr ?? ''),
    };
  }

  {
    const result = await invokeSpikeEvidenceValidator('valid', validSpikeEvidence);
    assert.equal(result.status, 0, result.output);
    assert.match(result.output, /Architecture Spike Evidence validation passed/u);
  }

  {
    const evidence = structuredClone(validSpikeEvidence);
    delete evidence.contractVersion;
    const result = await invokeSpikeEvidenceValidator('missing-contract-version', evidence);
    assert.notEqual(result.status, 0, 'missing contractVersion must fail');
    assert.match(result.output, /missing required property contractVersion/u);
  }

  {
    const evidence = structuredClone(validSpikeEvidence);
    delete evidence.contractHash;
    const result = await invokeSpikeEvidenceValidator('missing-contract-hash', evidence);
    assert.notEqual(result.status, 0, 'missing contractHash must fail');
    assert.match(result.output, /missing required property contractHash/u);
  }

  {
    const evidence = structuredClone(validSpikeEvidence);
    evidence.candidate = { id: 'candidate-without-provenance' };
    const result = await invokeSpikeEvidenceValidator('candidate-without-provenance', evidence);
    assert.notEqual(result.status, 0, 'candidate without provenance must fail');
    assert.match(result.output, /missing required property provenance/u);
  }

  {
    const evidence = structuredClone(validSpikeEvidence);
    evidence.rawArtifacts[0].sha256 = 'sha256:not-a-digest';
    const result = await invokeSpikeEvidenceValidator('invalid-artifact-sha', evidence);
    assert.notEqual(result.status, 0, 'invalid SHA-256 reference must fail');
    assert.match(result.output, /does not match/u);
  }

  {
    const evidence = structuredClone(validSpikeEvidence);
    evidence.criteria.push(structuredClone(evidence.criteria[0]));
    const result = await invokeSpikeEvidenceValidator('duplicate-criterion', evidence);
    assert.notEqual(result.status, 0, 'duplicate criterion IDs must fail');
    assert.match(result.output, /duplicate criterion id CRIT-001/u);
  }

  for (const failingResult of ['FAIL', 'BLOCKED', 'UNKNOWN']) {
    const evidence = structuredClone(validSpikeEvidence);
    evidence.criteria[0].result = failingResult;
    const result = await invokeSpikeEvidenceValidator('pass-with-' + failingResult.toLowerCase(), evidence);
    assert.notEqual(result.status, 0, 'PASS cannot contain required ' + failingResult);
    assert.match(result.output, /PASS verdict input cannot include required criterion CRIT-001/u);
  }

  {
    const evidence = structuredClone(validSpikeEvidence);
    evidence.rawArtifacts[0].sha256 = 'sha256:' + '0'.repeat(64);
    const result = await invokeSpikeEvidenceValidator('artifact-hash-mismatch', evidence);
    assert.notEqual(result.status, 0, 'artifact hash mismatch must fail');
    assert.match(result.output, /artifact hash mismatch for raw-001/u);
  }

  {
    const evidence = structuredClone(validSpikeEvidence);
    evidence.contractHash = 'sha256:' + '0'.repeat(64);
    const result = await invokeSpikeEvidenceValidator('contract-hash-mismatch', evidence);
    assert.notEqual(result.status, 0, 'contract hash mismatch must fail');
    assert.match(result.output, /contract hash mismatch/u);
  }
} finally {
  await rm(spikeEvidenceTemp, { recursive: true, force: true });
}

console.log('Documentation tooling tests passed.');