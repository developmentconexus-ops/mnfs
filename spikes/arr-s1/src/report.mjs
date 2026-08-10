import { S1_CRITERIA } from './contract.mjs';

const FINAL_EXTERNAL_VERDICTS = new Set(['PASS', 'FAIL']);
const REJECT_VERDICTS = new Set(['REJECT']);
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

function criterionResultsPass(value) {
  if (!Array.isArray(value)) return false;
  const byId = new Map(value.map((result) => [result?.id, result?.status]));
  return S1_CRITERIA.every((id) => byId.get(id) === 'PASS');
}

export function isSelectionEligible(candidateOrBoundary) {
  if (!candidateOrBoundary || typeof candidateOrBoundary !== 'object') return false;
  if (candidateOrBoundary.finalized !== true || candidateOrBoundary.verdict !== 'PASS') return false;
  if (!nonBlank(candidateOrBoundary.candidateShape)) return false;
  if (!criterionResultsPass(candidateOrBoundary.criterionResults)) return false;
  if (!evidenceIntegrityValid(candidateOrBoundary.evidenceIntegrity)) return false;
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

function reportStatus({ candidates, externalComparison }) {
  if (candidates.some((candidate) => REJECT_VERDICTS.has(candidate?.verdict) || REJECT_VERDICTS.has(candidate?.boundary?.verdict))) return 'REJECT';
  if (!externalComparisonFinalized(externalComparison)) return 'BLOCKED';
  const selected = candidates.find((candidate) => isSelectionEligible(candidate) && isSelectionEligible(boundaryRecord(candidate)));
  return selected ? 'SUCCESS' : 'BLOCKED';
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
  const selectedIndex = records.findIndex((candidate, index) => runtimeCandidates[index].selectionEligible && boundaryCandidates[index].selectionEligible);
  const selectedRuntime = selectedIndex >= 0 ? runtimeCandidates[selectedIndex] : null;
  const selectedBoundary = selectedIndex >= 0 ? boundaryCandidates[selectedIndex] : null;
  const status = reportStatus({ candidates: records, externalComparison });
  const selectedEvidenceIntegrity = selectedIndex >= 0
    && evidenceIntegrityValid(records[selectedIndex]?.evidenceIntegrity)
    && evidenceIntegrityValid(boundaryRecord(records[selectedIndex])?.evidenceIntegrity);
  const aggregateEvidenceIntegrity = evidenceIntegrity === null
    ? selectedEvidenceIntegrity
    : evidenceIntegrityValid(evidenceIntegrity);

  const runtimeDecisionInput = {
    selectionEligible: Boolean(selectedRuntime && selectedBoundary && aggregateEvidenceIntegrity && externalComparisonFinalized(externalComparison)),
    selectedCandidateShape: selectedRuntime?.candidateShape ?? null,
    selected: selectedRuntime,
    candidates: runtimeCandidates,
  };
  const boundaryDecisionInput = {
    selectionEligible: Boolean(selectedRuntime && selectedBoundary && aggregateEvidenceIntegrity && externalComparisonFinalized(externalComparison)),
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
