export const CLASS_IDS = Object.freeze([
  'CLASS-LOCAL-PROCESS-ISOLATION',
  'CLASS-LANDLOCK-ISOLATION',
  'CLASS-MICROVM-KVM',
  'CLASS-FUSE-COW',
  'CLASS-LOCAL-CONTAINER',
]);

export const CLASS_MAPPING = Object.freeze({
  'CLASS-LOCAL-PROCESS-ISOLATION': Object.freeze({
    relevantCapabilities: Object.freeze(['HOST-WSL2', 'HOST-USERNS', 'HOST-SECCOMP-CONFIG']),
    setupCapabilities: Object.freeze([]),
  }),
  'CLASS-LANDLOCK-ISOLATION': Object.freeze({
    relevantCapabilities: Object.freeze(['HOST-WSL2', 'HOST-LANDLOCK-CONFIG', 'HOST-SECCOMP-CONFIG']),
    setupCapabilities: Object.freeze([]),
  }),
  'CLASS-MICROVM-KVM': Object.freeze({
    relevantCapabilities: Object.freeze(['HOST-WSL2', 'HOST-CPU-VIRT', 'HOST-KVM-DEVICE', 'HOST-KVM-RW-OPEN']),
    setupCapabilities: Object.freeze([]),
  }),
  'CLASS-FUSE-COW': Object.freeze({
    relevantCapabilities: Object.freeze(['HOST-WSL2', 'HOST-FUSE-DEVICE', 'HOST-FUSE-TOOLS']),
    setupCapabilities: Object.freeze(['HOST-FUSE-TOOLS']),
  }),
  'CLASS-LOCAL-CONTAINER': Object.freeze({
    relevantCapabilities: Object.freeze(['HOST-WSL2', 'HOST-DOCKER-CLI', 'HOST-DOCKER-DAEMON']),
    setupCapabilities: Object.freeze(['HOST-DOCKER-CLI', 'HOST-DOCKER-DAEMON']),
  }),
});

const POSITIVE_STATES = new Set(['SUPPORTED', 'PRESENT']);
const NEGATIVE_STATES = new Set(['UNSUPPORTED', 'ABSENT']);

function recordFor(observations, id) {
  if (observations instanceof Map) return observations.get(id) ?? null;
  return observations?.[id] ?? null;
}

export function classEligibility(classId, observations) {
  const mapping = CLASS_MAPPING[classId];
  if (!mapping) throw new TypeError(`unknown ARR-S0 capability class: ${classId}`);

  const setupSet = new Set(mapping.setupCapabilities);
  const hardBlocked = [];
  const hardUnknown = [];
  const setupRequired = [];
  const setupUnknown = [];

  for (const capabilityId of mapping.relevantCapabilities) {
    const record = recordFor(observations, capabilityId);
    const isSetup = setupSet.has(capabilityId);
    if (!record || typeof record.state !== 'string' || record.state === 'UNKNOWN') {
      (isSetup ? setupUnknown : hardUnknown).push(capabilityId);
      continue;
    }
    if (POSITIVE_STATES.has(record.state)) continue;
    if (NEGATIVE_STATES.has(record.state)) {
      (isSetup ? setupRequired : hardBlocked).push(capabilityId);
      continue;
    }
    (isSetup ? setupUnknown : hardUnknown).push(capabilityId);
  }

  let eligibility;
  let reasons;
  if (hardBlocked.length > 0) {
    eligibility = 'BLOCKED_BY_HOST';
    reasons = hardBlocked.map((id) => `${id} is decisively absent/unsupported for this generic class`);
    if (hardUnknown.length || setupUnknown.length) {
      reasons.push(`also unresolved: ${[...hardUnknown, ...setupUnknown].join(', ')}`);
    }
  } else if (hardUnknown.length > 0) {
    eligibility = 'UNKNOWN';
    reasons = hardUnknown.map((id) => `${id} is missing or UNKNOWN`);
  } else if (setupRequired.length > 0) {
    eligibility = 'REQUIRES_SETUP_DECISION';
    reasons = setupRequired.map((id) => `${id} is absent/unsupported but is classified as setup-provisionable`);
    if (setupUnknown.length) reasons.push(`other setup-only facts remain unresolved: ${setupUnknown.join(', ')}`);
  } else if (setupUnknown.length > 0) {
    eligibility = 'UNKNOWN';
    reasons = setupUnknown.map((id) => `${id} setup state is missing or UNKNOWN`);
  } else {
    eligibility = 'PHYSICALLY_PLAUSIBLE';
    reasons = ['all mapped generic host capabilities are positive; this does not prove a named candidate current prerequisites'];
  }

  return {
    classId,
    eligibility,
    reasons,
    relevantCapabilities: [...mapping.relevantCapabilities],
  };
}

export function deriveCapabilityClasses(observations) {
  return CLASS_IDS.map((classId) => classEligibility(classId, observations));
}
