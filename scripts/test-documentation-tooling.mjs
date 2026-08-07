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

assert.match(statusText, /\*\*Current phase:\*\* `ARR P1 — Operator Acceptance Review`/u, 'STATUS current phase must be Operator P1 review');
assert.match(statusText, /Master ARR program plan 0\.2\.0:[^\n]*ACCEPTED — GATE-P0/u, 'STATUS must record master plan acceptance');
assert.match(statusText, /ARR-S0 plan 0\.2\.0:[^\n]*ACCEPTED — GATE-P0/u, 'STATUS must record S0 plan acceptance');
assert.match(statusText, /P1-F02 fresh review:[^\n]*Critical 0 \/ Important 0[^\n]*31194963494/u, 'STATUS must record F02 fresh-review evidence');
assert.match(statusText, /ARR P1 A1-A4 \+ B1 \+ P1-F01 \+ P1-F02:[^\n]*IMPLEMENTED \/ VERIFIED \/ FRESH_REVIEW_PASSED \/ OPERATOR_DECISION_REQUIRED/u, 'STATUS must record P1 review-ready state');
assert.match(statusText, /ARR-S0 harness implementation:[^\n]*PROHIBITED pending GATE-S0-IMPLEMENT/u, 'STATUS must keep S0 implementation gated');
assert.match(statusText, /## Immediate next action — Operator P1 decision/u, 'STATUS next action must be Operator P1 decision');
assert.doesNotMatch(statusText, /## Immediate next action — P1-F02 fresh review/u, 'STATUS must not point to completed F02 fresh review');
assert.doesNotMatch(statusText, /## Immediate next action — GATE-P0/u, 'STATUS must not point back to completed GATE-P0');

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

const tempRoot = await mkdtemp(path.join(tmpdir(), 'mnfs-arr-spike-evidence-'));
try {
  const evidencePath = path.join(tempRoot, 'evidence.json');
  const artifactRoot = path.join(tempRoot, 'artifacts');
  await mkdir(artifactRoot, { recursive: true });
  const artifactBytes = Buffer.from('architecture-spike-evidence\n', 'utf8');
  await writeFile(path.join(artifactRoot, 'raw.txt'), artifactBytes);
  const artifactSha = createHash('sha256').update(artifactBytes).digest('hex');
  const baseEvidence = {
    schemaVersion: 1,
    spikeId: 'ARR-TEST',
    contractVersion: '1.0.0',
    runId: 'arr-test-run-001',
    startedAt: '2026-08-07T00:00:00.000Z',
    finishedAt: '2026-08-07T00:00:01.000Z',
    canonicalHost: {
      kind: 'WSL2',
      identity: 'fixture-host',
      observedAt: '2026-08-07T00:00:00.000Z',
      factsHash: `sha256:${'1'.repeat(64)}`,
    },
    sourceGit: {
      commitSha: 'a'.repeat(40),
      treeSha: 'b'.repeat(40),
      dirty: false,
    },
    candidate: {
      kind: 'CONTROL',
      id: 'fixture-candidate',
      version: '1.0.0',
      provenance: {
        source: 'fixture://candidate',
        license: 'MIT',
        digest: `sha256:${'2'.repeat(64)}`,
      },
    },
    criteria: [
      { id: 'AC-01', required: true, result: 'PASS', artifactRefs: ['raw-1'], notes: [] },
    ],
    rawArtifacts: [
      { id: 'raw-1', path: 'raw.txt', sha256: `sha256:${artifactSha}`, sizeBytes: artifactBytes.length },
    ],
    limitations: [],
    measurements: [],
    verdictInput: { status: 'PASS', reasons: ['all required criteria passed'] },
  };

  const runEvidenceValidator = (evidence) => {
    writeFileSyncCompat(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
    return spawnSync(
      process.execPath,
      [
        path.join(root, 'scripts/validate-docs.mjs'),
        '--architecture-spike-evidence', evidencePath,
        '--artifact-root', artifactRoot,
      ],
      { cwd: root, encoding: 'utf8' },
    );
  };

  {
    const result = runEvidenceValidator(baseEvidence);
    assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
    assert.match(result.stdout, /Architecture Spike Evidence validation passed/u);
  }
  {
    const evidence = structuredClone(baseEvidence);
    delete evidence.contractVersion;
    const result = runEvidenceValidator(evidence);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /missing required property contractVersion/u);
  }
  {
    const evidence = structuredClone(baseEvidence);
    delete evidence.candidate.provenance;
    const result = runEvidenceValidator(evidence);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /provenance/u);
  }
  {
    const evidence = structuredClone(baseEvidence);
    evidence.rawArtifacts[0].sha256 = 'sha256:not-a-digest';
    const result = runEvidenceValidator(evidence);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /sha256/u);
  }
  {
    const evidence = structuredClone(baseEvidence);
    evidence.criteria.push(structuredClone(evidence.criteria[0]));
    const result = runEvidenceValidator(evidence);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /duplicate criterion id AC-01/u);
  }
  {
    const evidence = structuredClone(baseEvidence);
    evidence.criteria[0].result = 'BLOCKED';
    const result = runEvidenceValidator(evidence);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /PASS verdict input cannot include required criterion AC-01 with result BLOCKED/u);
  }
  {
    const evidence = structuredClone(baseEvidence);
    evidence.rawArtifacts[0].sha256 = `sha256:${'0'.repeat(64)}`;
    const result = runEvidenceValidator(evidence);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /artifact hash mismatch for raw-1/u);
  }
} finally {
  await rm(tempRoot, { recursive: true, force: true });
}

console.log('Documentation tooling tests passed.');

function writeFileSyncCompat(file, value) {
  // The test needs subprocess-visible bytes before spawning. Avoid adding another helper dependency.
  const result = spawnSync(process.execPath, ['-e', `require('node:fs').writeFileSync(${JSON.stringify(file)}, ${JSON.stringify(value)})`]);
  assert.equal(result.status, 0, result.stderr?.toString() ?? 'fixture write failed');
}
