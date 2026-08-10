import assert from 'node:assert/strict';
import test from 'node:test';

import { S1_CRITERIA } from '../src/contract.mjs';
import { buildS1Report, isSelectionEligible } from '../src/report.mjs';

const POLICY_FIELDS = [
  'pinningRule',
  'upgradeTrigger',
  'mandatoryConformanceRerun',
  'rollbackRule',
];
const REMOVAL_FIELDS = [
  'removeOrReplaceWhen',
  'authorityOrSecurityTrigger',
  'provenanceOrLicenseTrigger',
  'maintenanceTrigger',
  'replacementOrExitPath',
];

const POLICY = Object.freeze({
  pinningRule: 'pin PI-SDK to 0.84.1 and its exact source identity',
  upgradeTrigger: 'reviewed public-boundary or security release change',
  mandatoryConformanceRerun: 'rerun S1-C01..C16 before accepting an upgrade',
  rollbackRule: 'rollback to the last passing exact identity when rerun fails',
});

const REMOVAL = Object.freeze({
  removeOrReplaceWhen: 'the candidate no longer passes the accepted contract',
  authorityOrSecurityTrigger: 'authority or security boundary becomes unbounded',
  provenanceOrLicenseTrigger: 'exact provenance or license cannot be verified',
  maintenanceTrigger: 'maintenance cost exceeds the machinery it removes',
  replacementOrExitPath: 'replace with a passing concrete adapter and rerun S1',
});

function passResults(overrides = {}) {
  return S1_CRITERIA.map((id) => ({ id, status: overrides[id] ?? 'PASS', artifactRefs: [`${id}-evidence`] }));
}

function artifact(id) {
  return { id, path: `evidence/${id}.json`, sha256: `sha256:${'a'.repeat(64)}`, sizeBytes: 1 };
}

function artifactSet() {
  return [
    ...S1_CRITERIA.map((id) => artifact(`${id}-evidence`)),
    artifact('supported-boundary'),
    artifact('provenance'),
    artifact('dependency-admission'),
  ];
}

function candidate(overrides = {}) {
  return {
    candidateShape: 'PI-SDK',
    finalized: true,
    verdict: 'PASS',
    criterionResults: passResults(),
    artifactRecords: artifactSet(),
    supportedBoundaryEvidenceRefs: ['supported-boundary'],
    provenanceEvidenceRefs: ['provenance'],
    dependencyAdmissionEvidenceRefs: ['dependency-admission'],
    evidenceIntegrity: { valid: true },
    upgradePolicy: { ...POLICY },
    removalConditions: { ...REMOVAL },
    boundary: {
      boundaryId: 'PI-SDK-SDK',
      candidateShape: 'PI-SDK',
      finalized: true,
      verdict: 'PASS',
      criterionResults: passResults(),
      artifactRecords: artifactSet(),
      supportedBoundaryEvidenceRefs: ['supported-boundary'],
      provenanceEvidenceRefs: ['provenance'],
      dependencyAdmissionEvidenceRefs: ['dependency-admission'],
      evidenceIntegrity: { valid: true },
      upgradePolicy: { ...POLICY },
      removalConditions: { ...REMOVAL },
    },
    ...overrides,
  };
}

function reportFor(item = candidate(), overrides = {}) {
  return buildS1Report({
    runId: 'arr-s1-report-test',
    candidates: [item],
    externalComparison: { candidateShape: 'OPENCODE-ACP', finalized: true, verdict: 'FAIL' },
    ...overrides,
  });
}

test('keeps runtime and boundary decision inputs separate and selects only complete PASS Evidence', () => {
  const report = reportFor();

  assert.equal(report.status, 'SUCCESS');
  assert.equal(report.runtimeDecisionInput.selectionEligible, true);
  assert.equal(report.boundaryDecisionInput.selectionEligible, true);
  assert.equal(report.runtimeDecisionInput.selectedCandidateShape, 'PI-SDK');
  assert.equal(report.boundaryDecisionInput.selectedBoundaryId, 'PI-SDK-SDK');
  assert.notStrictEqual(report.runtimeDecisionInput, report.boundaryDecisionInput);
  assert.deepEqual(report.runtimeDecisionInput.selected.upgradePolicy, POLICY);
  assert.deepEqual(report.boundaryDecisionInput.selected.removalConditions, REMOVAL);
});

test('all S1-C01..C16 are required, including C12, C13 and C16', () => {
  for (const criterion of ['S1-C01', 'S1-C12', 'S1-C13', 'S1-C16']) {
    const report = reportFor(candidate({ criterionResults: passResults({ [criterion]: 'FAIL' }) }));
    assert.equal(report.runtimeDecisionInput.selectionEligible, false, criterion);
    assert.equal(report.boundaryDecisionInput.selectionEligible, false, criterion);
    assert.notEqual(report.status, 'SUCCESS');
  }
});

test('missing or blank Upgrade Policy and Removal Conditions fields never become selection-eligible', () => {
  for (const field of [...POLICY_FIELDS, ...REMOVAL_FIELDS]) {
    const section = POLICY_FIELDS.includes(field) ? 'upgradePolicy' : 'removalConditions';
    for (const value of [undefined, '', '   ', null]) {
      const nextPolicy = { ...POLICY };
      const nextRemoval = { ...REMOVAL };
      if (value === undefined) delete (section === 'upgradePolicy' ? nextPolicy : nextRemoval)[field];
      else (section === 'upgradePolicy' ? nextPolicy : nextRemoval)[field] = value;
      const report = reportFor(candidate({ [section]: section === 'upgradePolicy' ? nextPolicy : nextRemoval }));
      assert.equal(report.runtimeDecisionInput.selectionEligible, false, `${section}.${field}=${String(value)}`);
      assert.equal(report.boundaryDecisionInput.selectionEligible, false, `${section}.${field}=${String(value)}`);
    }
  }
});

test('invalid Evidence integrity or an unfinalized external comparison blocks selecting SUCCESS', () => {
  const invalidEvidence = reportFor(candidate({ evidenceIntegrity: { valid: false } }));
  assert.equal(invalidEvidence.runtimeDecisionInput.selectionEligible, false);
  assert.equal(invalidEvidence.status, 'BLOCKED');

  const unfinalized = reportFor(candidate(), {
    externalComparison: { candidateShape: 'OPENCODE-ACP', finalized: false, verdict: null },
  });
  assert.equal(unfinalized.externalComparisonFinalized, false);
  assert.equal(unfinalized.runtimeDecisionInput.selectionEligible, false);
  assert.equal(unfinalized.status, 'BLOCKED');
});

test('selection eligibility is pure and never invents candidate-specific policy values', () => {
  assert.equal(isSelectionEligible(candidate()), true);
  assert.equal(isSelectionEligible(candidate({ upgradePolicy: undefined })), false);
  assert.equal(isSelectionEligible(candidate({ removalConditions: undefined })), false);
  assert.equal(isSelectionEligible(candidate({ evidenceIntegrity: undefined })), false);
});
