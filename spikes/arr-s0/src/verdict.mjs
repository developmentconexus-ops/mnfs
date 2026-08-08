export const VERDICT_VALUES = Object.freeze(['ACCEPT', 'ACCEPT_WITH_LIMITATIONS', 'BLOCKED', 'REJECT']);

const INTEGRITY_KEYS = Object.freeze([
  'unsafeMutationDetected',
  'evidenceTampered',
  'failOpenDetected',
  'artifactRootEscaped',
  'contractViolation',
]);

const PRECONDITION_KEYS = Object.freeze([
  'canonicalWsl2',
  'repositoryIdentity',
  'checkoutClean',
  'coreEvidenceCollected',
]);

export function deriveS0Verdict(input) {
  const integrity = input?.integrity ?? {};
  const preconditions = input?.preconditions ?? {};
  const observations = Array.isArray(input?.observations) ? input.observations : [];
  const capabilityClasses = Array.isArray(input?.capabilityClasses) ? input.capabilityClasses : [];

  const integrityViolations = INTEGRITY_KEYS.filter((key) => integrity[key] === true);
  if (integrityViolations.length > 0) {
    return {
      status: 'REJECT',
      reasons: integrityViolations.map((key) => `${key}=true violates ARR-S0 Evidence integrity`),
    };
  }

  const blocked = PRECONDITION_KEYS.filter((key) => preconditions[key] !== true);
  if (blocked.length > 0) {
    return {
      status: 'BLOCKED',
      reasons: blocked.map((key) => `${key}=false prevents a valid canonical ARR-S0 run`),
    };
  }

  const unknownObservationIds = observations
    .filter((record) => !record || record.state === 'UNKNOWN' || typeof record.state !== 'string')
    .map((record) => record?.id ?? '<missing-observation-id>');
  const unknownClassIds = capabilityClasses
    .filter((record) => !record || record.eligibility === 'UNKNOWN' || typeof record.eligibility !== 'string')
    .map((record) => record?.classId ?? '<missing-class-id>');

  if (unknownObservationIds.length > 0 || unknownClassIds.length > 0) {
    const reasons = [];
    if (unknownObservationIds.length > 0) {
      reasons.push(`material host observations remain UNKNOWN: ${unknownObservationIds.join(', ')}`);
    }
    if (unknownClassIds.length > 0) {
      reasons.push(`generic capability classes remain UNKNOWN: ${unknownClassIds.join(', ')}`);
    }
    reasons.push('core host identity is established, so fresh S1/S2 planning may continue with explicit limitations');
    return { status: 'ACCEPT_WITH_LIMITATIONS', reasons };
  }

  return {
    status: 'ACCEPT',
    reasons: [
      'ARR-S0 Evidence is complete and decisive enough for fresh S1/S2 planners',
      'ACCEPT does not select, accept, or prove conformance of any named runtime/environment candidate',
    ],
  };
}
