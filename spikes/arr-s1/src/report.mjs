import { S1_CRITERIA } from './contract.mjs';
import { S1_FROZEN_CANDIDATE_PROVENANCE } from './preflight.mjs';

const FINAL_EXTERNAL_VERDICTS = new Set(['PASS', 'FAIL']);
const REJECT_VERDICTS = new Set(['REJECT']);
const FINAL_VERDICTS = new Set(['PASS', 'FAIL', 'BLOCKED', 'REJECT']);
const APPLICABILITY_STATES = new Set(['REQUIRED', 'NOT_REQUIRED', 'BLOCKED']);
const HASH_PATTERN = /^sha256:[a-f0-9]{64}$/u;
const POLICY_FIELDS = Object.freeze([
  'pinningRule',
  'upgradeTrigger',
  'mandatoryConformanceRerun',
  'rollbackRule',
]);
const REMOVAL_FIELDS = Object.freeze([
  'removeOrReplaceWhen',
  'authorityOrSecurityTrigger',
  'provenanceOrLicenseTrigger',
  'maintenanceTrigger',
  'replacementOrExitPath',
]);
const CONDITIONAL_CANDIDATE_SHAPES = Object.freeze({ piRpc: 'PI-RPC', secondAcp: 'SECOND-ACP' });

function clone(value) {
  return value === undefined ? undefined : structuredClone(value);
}

function nonBlank(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function policyComplete(value, fields) {
  return value && typeof value === 'object' && fields.every((field) => nonBlank(value[field]));
}

function evidenceIntegrityValid(value) {
  return value === true || value?.valid === true || value?.ok === true;
}

function artifactRecordsMap(candidate) {
  if (!Array.isArray(candidate?.artifactRecords)) return null;
  const records = new Map();
  for (const record of candidate.artifactRecords) {
    if (!record || typeof record.id !== 'string' || records.has(record.id)
      || typeof record.path !== 'string' || !HASH_PATTERN.test(record.sha256 ?? '')
      || !Number.isSafeInteger(record.sizeBytes) || record.sizeBytes < 0) return null;
    records.set(record.id, record);
  }
  return records;
}

function refsExist(refs, records, pathToken = null) {
  return Array.isArray(refs) && refs.length > 0 && refs.every((ref) => {
    const record = typeof ref === 'string' ? records?.get(ref) : null;
    return Boolean(record && (pathToken === null || record.path.includes(pathToken)));
  });
}

function criterionResultsPass(value, candidate) {
  if (!Array.isArray(value)) return false;
  const records = artifactRecordsMap(candidate);
  if (!records || value.length !== S1_CRITERIA.length) return false;
  const byId = new Map();
  for (const result of value) {
    if (!result || typeof result.id !== 'string' || byId.has(result.id)) return false;
    byId.set(result.id, result);
  }
  return S1_CRITERIA.every((id) => {
    const result = byId.get(id);
    return result?.status === 'PASS' && refsExist(result.artifactRefs, records);
  });
}

export function isSelectionEligible(candidateOrBoundary) {
  if (!candidateOrBoundary || typeof candidateOrBoundary !== 'object') return false;
  if (candidateOrBoundary.finalized !== true || candidateOrBoundary.verdict !== 'PASS') return false;
  if (!nonBlank(candidateOrBoundary.candidateShape)) return false;
  if (!criterionResultsPass(candidateOrBoundary.criterionResults, candidateOrBoundary)) return false;
  if (!evidenceIntegrityValid(candidateOrBoundary.evidenceIntegrity)) return false;
  if (!refsExist(candidateOrBoundary.supportedBoundaryEvidenceRefs, artifactRecordsMap(candidateOrBoundary), 'supported-boundary')) return false;
  if (!refsExist(candidateOrBoundary.provenanceEvidenceRefs, artifactRecordsMap(candidateOrBoundary), 'provenance')) return false;
  if (!refsExist(candidateOrBoundary.dependencyAdmissionEvidenceRefs, artifactRecordsMap(candidateOrBoundary), 'dependency-admission')) return false;
  if (!candidateOrBoundary.supportedBoundaryEvidence
    || typeof candidateOrBoundary.supportedBoundaryEvidence !== 'object'
    || !nonBlank(candidateOrBoundary.supportedBoundaryEvidence.kind)
    || !nonBlank(candidateOrBoundary.supportedBoundaryEvidence.observation)) return false;
  if (!candidateOrBoundary.provenanceEvidence
    || !S1_FROZEN_CANDIDATE_PROVENANCE[candidateOrBoundary.candidateShape]
    || candidateOrBoundary.provenanceEvidence.candidateShape !== candidateOrBoundary.candidateShape
    || candidateOrBoundary.provenanceEvidence.version !== S1_FROZEN_CANDIDATE_PROVENANCE[candidateOrBoundary.candidateShape].version
    || candidateOrBoundary.provenanceEvidence.package !== S1_FROZEN_CANDIDATE_PROVENANCE[candidateOrBoundary.candidateShape].package
    || candidateOrBoundary.provenanceEvidence.sourceIdentity !== S1_FROZEN_CANDIDATE_PROVENANCE[candidateOrBoundary.candidateShape].sourceIdentity
    || candidateOrBoundary.provenanceEvidence.license !== S1_FROZEN_CANDIDATE_PROVENANCE[candidateOrBoundary.candidateShape].license
    || !nonBlank(candidateOrBoundary.provenanceEvidence.version)
    || !nonBlank(candidateOrBoundary.provenanceEvidence.package)
    || !nonBlank(candidateOrBoundary.provenanceEvidence.sourceIdentity)
    || !nonBlank(candidateOrBoundary.provenanceEvidence.license)) return false;
  if (!candidateOrBoundary.dependencyAdmissionEvidence
    || !policyComplete(candidateOrBoundary.dependencyAdmissionEvidence.upgradePolicy, POLICY_FIELDS)
    || !policyComplete(candidateOrBoundary.dependencyAdmissionEvidence.removalConditions, REMOVAL_FIELDS)) return false;
  if (!policyComplete(candidateOrBoundary.upgradePolicy, POLICY_FIELDS)) return false;
  if (!policyComplete(candidateOrBoundary.removalConditions, REMOVAL_FIELDS)) return false;
  return true;
}

export const selectionEligible = isSelectionEligible;

function boundaryRecord(candidate) {
  if (candidate?.boundary && typeof candidate.boundary === 'object') return candidate.boundary;
  return {
    candidateShape: candidate?.candidateShape ?? null,
    boundaryId: null,
    finalized: false,
    verdict: null,
    criterionResults: [],
    evidenceIntegrity: { valid: false },
    upgradePolicy: null,
    removalConditions: null,
  };
}

function decisionInput(record, kind) {
  const source = kind === 'boundary' ? boundaryRecord(record) : record;
  const input = clone(source) ?? {};
  input.selectionEligible = isSelectionEligible(source);
  if (kind === 'boundary') input.boundaryId = source.boundaryId ?? null;
  return input;
}

function externalComparisonFinalized(externalComparison) {
  return externalComparison?.finalized === true
    && FINAL_EXTERNAL_VERDICTS.has(externalComparison.verdict);
}

function requiredCandidatesFinalized(candidates, applicability) {
  if (!applicability) return true;
  return Object.entries(CONDITIONAL_CANDIDATE_SHAPES).every(([key, candidateShape]) => {
    if (applicability[key] !== 'REQUIRED') return true;
    const candidate = candidates.find((record) => record?.candidateShape === candidateShape);
    return candidate?.finalized === true && (candidate.verdict === 'PASS' || candidate.verdict === 'FAIL');
  });
}

function reportStatus({ candidates, externalComparison, applicability }) {
  if (candidates.some((candidate) => REJECT_VERDICTS.has(candidate?.verdict) || REJECT_VERDICTS.has(candidate?.boundary?.verdict))) return 'REJECT';
  if (candidates.some((candidate) => candidate?.verdict !== null && candidate?.verdict !== undefined && !FINAL_VERDICTS.has(candidate.verdict))) return 'BLOCKED';
  if (candidates.some((candidate) => candidate?.finalized !== true)) return 'BLOCKED';
  if (applicability && Object.values(applicability).some((state) => !APPLICABILITY_STATES.has(state) || state === 'BLOCKED')) return 'BLOCKED';
  if (!requiredCandidatesFinalized(candidates, applicability)) return 'BLOCKED';
  if (!externalComparisonFinalized(externalComparison)) return 'BLOCKED';
  const selectedRuntime = candidates.filter((candidate) => isSelectionEligible(candidate));
  const selectedBoundary = candidates.filter((candidate) => isSelectionEligible(boundaryRecord(candidate)));
  if (selectedRuntime.length !== 1 || selectedBoundary.length !== 1) return 'BLOCKED';
  return 'SUCCESS';
}

export function buildS1Report({
  runId,
  candidates = [],
  applicability = null,
  externalComparison = null,
  preflight = null,
  source = null,
  evidenceIntegrity = null,
} = {}) {
  const records = Array.isArray(candidates) ? candidates : [];
  const runtimeCandidates = records.map((candidate) => decisionInput(candidate, 'runtime'));
  const boundaryCandidates = records.map((candidate) => decisionInput(candidate, 'boundary'));
  const eligibleRuntimeIndexes = runtimeCandidates.map((candidate, index) => candidate.selectionEligible ? index : -1).filter((index) => index >= 0);
  const eligibleBoundaryIndexes = boundaryCandidates.map((candidate, index) => candidate.selectionEligible ? index : -1).filter((index) => index >= 0);
  const selectedRuntimeIndex = eligibleRuntimeIndexes.length === 1 ? eligibleRuntimeIndexes[0] : -1;
  const selectedBoundaryIndex = eligibleBoundaryIndexes.length === 1 ? eligibleBoundaryIndexes[0] : -1;
  const selectedRuntime = selectedRuntimeIndex >= 0 ? runtimeCandidates[selectedRuntimeIndex] : null;
  const selectedBoundary = selectedBoundaryIndex >= 0 ? boundaryCandidates[selectedBoundaryIndex] : null;
  const status = reportStatus({ candidates: records, externalComparison, applicability });
  const selectedEvidenceIntegrity = selectedRuntimeIndex >= 0
    && selectedBoundaryIndex >= 0
    && evidenceIntegrityValid(records[selectedRuntimeIndex]?.evidenceIntegrity)
    && evidenceIntegrityValid(boundaryRecord(records[selectedBoundaryIndex])?.evidenceIntegrity);
  const aggregateEvidenceIntegrity = evidenceIntegrity === null
    ? selectedEvidenceIntegrity
    : evidenceIntegrityValid(evidenceIntegrity);

  const runtimeDecisionInput = {
    selectionEligible: Boolean(selectedRuntime && selectedBoundary && aggregateEvidenceIntegrity && externalComparisonFinalized(externalComparison) && status === 'SUCCESS'),
    selectedCandidateShape: selectedRuntime?.candidateShape ?? null,
    selected: selectedRuntime,
    candidates: runtimeCandidates,
  };
  const boundaryDecisionInput = {
    selectionEligible: Boolean(selectedRuntime && selectedBoundary && aggregateEvidenceIntegrity && externalComparisonFinalized(externalComparison) && status === 'SUCCESS'),
    selectedBoundaryId: selectedBoundary?.boundaryId ?? null,
    selected: selectedBoundary,
    candidates: boundaryCandidates,
  };

  return {
    schemaVersion: 1,
    runId: runId ?? null,
    status,
    selection: runtimeDecisionInput.selectionEligible && boundaryDecisionInput.selectionEligible
      ? { runtime: clone(selectedRuntime), boundary: clone(selectedBoundary) }
      : null,
    externalComparison: clone(externalComparison),
    externalComparisonFinalized: externalComparisonFinalized(externalComparison),
    applicability: clone(applicability),
    preflight: clone(preflight),
    source: clone(source),
    evidenceIntegrity: {
      valid: aggregateEvidenceIntegrity,
    },
    runtimeDecisionInput,
    boundaryDecisionInput,
    candidates: records.map((candidate, index) => ({
      candidateShape: candidate?.candidateShape ?? null,
      verdict: candidate?.verdict ?? null,
      finalized: candidate?.finalized === true,
      runtimeDecisionInput: runtimeCandidates[index],
      boundaryDecisionInput: boundaryCandidates[index],
    })),
  };
}

export const createS1Report = buildS1Report;
