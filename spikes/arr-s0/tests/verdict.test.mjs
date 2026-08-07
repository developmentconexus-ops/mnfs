import assert from 'node:assert/strict';
import test from 'node:test';
import { deriveS0Verdict, VERDICT_VALUES } from '../src/verdict.mjs';

function base(overrides = {}) {
  return {
    integrity: {
      unsafeMutationDetected: false,
      evidenceTampered: false,
      failOpenDetected: false,
      artifactRootEscaped: false,
      contractViolation: false,
      ...(overrides.integrity ?? {}),
    },
    preconditions: {
      canonicalWsl2: true,
      repositoryIdentity: true,
      checkoutClean: true,
      coreEvidenceCollected: true,
      ...(overrides.preconditions ?? {}),
    },
    observations: overrides.observations ?? [
      { id: 'HOST-KVM-DEVICE', state: 'ABSENT' },
      { id: 'HOST-KVM-RW-OPEN', state: 'ABSENT' },
      { id: 'HOST-USERNS', state: 'SUPPORTED' },
    ],
    capabilityClasses: overrides.capabilityClasses ?? [
      { classId: 'CLASS-MICROVM-KVM', eligibility: 'BLOCKED_BY_HOST' },
      { classId: 'CLASS-LOCAL-PROCESS-ISOLATION', eligibility: 'PHYSICALLY_PLAUSIBLE' },
    ],
  };
}

test('S0 verdict vocabulary is fixed', () => {
  assert.deepEqual(VERDICT_VALUES, ['ACCEPT', 'ACCEPT_WITH_LIMITATIONS', 'BLOCKED', 'REJECT']);
});

test('complete decisive host Evidence ACCEPTs even when one capability class is blocked by host', () => {
  const result = deriveS0Verdict(base());
  assert.equal(result.status, 'ACCEPT');
  assert.match(result.reasons.join(' '), /Evidence is complete/u);
  assert.match(result.reasons.join(' '), /does not select/u);
});

test('unknown material observation produces ACCEPT_WITH_LIMITATIONS', () => {
  const input = base({ observations: [{ id: 'HOST-LANDLOCK-CONFIG', state: 'UNKNOWN' }] });
  const result = deriveS0Verdict(input);
  assert.equal(result.status, 'ACCEPT_WITH_LIMITATIONS');
  assert.ok(result.reasons.some((reason) => reason.includes('HOST-LANDLOCK-CONFIG')));
});

test('unknown generic class produces ACCEPT_WITH_LIMITATIONS', () => {
  const input = base({ capabilityClasses: [{ classId: 'CLASS-FUSE-COW', eligibility: 'UNKNOWN' }] });
  assert.equal(deriveS0Verdict(input).status, 'ACCEPT_WITH_LIMITATIONS');
});

test('non-canonical host, dirty checkout or missing source identity BLOCKS rather than REJECTS', () => {
  for (const key of ['canonicalWsl2', 'repositoryIdentity', 'checkoutClean', 'coreEvidenceCollected']) {
    const input = base({ preconditions: { [key]: false } });
    const result = deriveS0Verdict(input);
    assert.equal(result.status, 'BLOCKED', key);
    assert.ok(result.reasons.some((reason) => reason.includes(key)));
  }
});

test('tamper, unsafe mutation, fail-open, root escape or contract violation REJECTs Evidence', () => {
  for (const key of ['unsafeMutationDetected', 'evidenceTampered', 'failOpenDetected', 'artifactRootEscaped', 'contractViolation']) {
    const input = base({ integrity: { [key]: true } });
    const result = deriveS0Verdict(input);
    assert.equal(result.status, 'REJECT', key);
    assert.ok(result.reasons.some((reason) => reason.includes(key)));
  }
});

test('integrity violation outranks a blocked precondition and unknown facts', () => {
  const result = deriveS0Verdict(base({
    integrity: { evidenceTampered: true },
    preconditions: { checkoutClean: false },
    observations: [{ id: 'HOST-USERNS', state: 'UNKNOWN' }],
  }));
  assert.equal(result.status, 'REJECT');
});

test('model narrative cannot override the mechanical result', () => {
  const input = { ...base(), modelAssessment: 'REJECT', narrative: 'I prefer another answer' };
  const result = deriveS0Verdict(input);
  assert.equal(result.status, 'ACCEPT');
});
