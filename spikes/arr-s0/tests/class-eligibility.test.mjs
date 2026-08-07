import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CLASS_IDS,
  CLASS_MAPPING,
  classEligibility,
  deriveCapabilityClasses,
} from '../src/class-eligibility.mjs';

function observations(entries) {
  return Object.fromEntries(entries.map(([id, state]) => [id, { id, state, rationale: 'fixture', artifactRefs: [] }]));
}

const allKvmSupported = observations([
  ['HOST-WSL2', 'SUPPORTED'],
  ['HOST-CPU-VIRT', 'SUPPORTED'],
  ['HOST-KVM-DEVICE', 'PRESENT'],
  ['HOST-KVM-RW-OPEN', 'SUPPORTED'],
]);

test('class inventory and mappings are fixed and provider-neutral', () => {
  assert.deepEqual(CLASS_IDS, [
    'CLASS-LOCAL-PROCESS-ISOLATION',
    'CLASS-LANDLOCK-ISOLATION',
    'CLASS-MICROVM-KVM',
    'CLASS-FUSE-COW',
    'CLASS-LOCAL-CONTAINER',
  ]);
  assert.deepEqual(CLASS_MAPPING['CLASS-MICROVM-KVM'].relevantCapabilities, [
    'HOST-WSL2', 'HOST-CPU-VIRT', 'HOST-KVM-DEVICE', 'HOST-KVM-RW-OPEN',
  ]);
  const serialized = JSON.stringify(CLASS_MAPPING);
  for (const forbidden of ['nono', 'BoxLite', 'smolvm', 'Sandbox Runtime', 'Sandlock', 'AgentFS']) {
    assert.equal(serialized.includes(forbidden), false, `generic class mapping leaked named candidate ${forbidden}`);
  }
});

test('microVM class is plausible when all physical KVM facts are positive', () => {
  const result = classEligibility('CLASS-MICROVM-KVM', allKvmSupported);
  assert.equal(result.eligibility, 'PHYSICALLY_PLAUSIBLE');
  assert.match(result.reasons.join(' '), /does not prove a named candidate/u);
});

test('decisive missing KVM device blocks the generic microVM class', () => {
  const input = structuredClone(allKvmSupported);
  input['HOST-KVM-DEVICE'].state = 'ABSENT';
  const result = classEligibility('CLASS-MICROVM-KVM', input);
  assert.equal(result.eligibility, 'BLOCKED_BY_HOST');
  assert.ok(result.reasons.some((reason) => reason.includes('HOST-KVM-DEVICE')));
});

test('unknown Landlock fact keeps generic class UNKNOWN', () => {
  const input = observations([
    ['HOST-WSL2', 'SUPPORTED'],
    ['HOST-LANDLOCK-CONFIG', 'UNKNOWN'],
    ['HOST-SECCOMP-CONFIG', 'SUPPORTED'],
  ]);
  const result = classEligibility('CLASS-LANDLOCK-ISOLATION', input);
  assert.equal(result.eligibility, 'UNKNOWN');
  assert.ok(result.reasons.some((reason) => reason.includes('HOST-LANDLOCK-CONFIG')));
});

test('FUSE device positive but fusermount tooling absent requires setup decision', () => {
  const input = observations([
    ['HOST-WSL2', 'SUPPORTED'],
    ['HOST-FUSE-DEVICE', 'SUPPORTED'],
    ['HOST-FUSE-TOOLS', 'ABSENT'],
  ]);
  const result = classEligibility('CLASS-FUSE-COW', input);
  assert.equal(result.eligibility, 'REQUIRES_SETUP_DECISION');
  assert.ok(result.reasons.some((reason) => reason.includes('HOST-FUSE-TOOLS')));
});

test('Docker CLI/daemon absence is setup, not proof that the host cannot run containers', () => {
  const input = observations([
    ['HOST-WSL2', 'SUPPORTED'],
    ['HOST-DOCKER-CLI', 'ABSENT'],
    ['HOST-DOCKER-DAEMON', 'ABSENT'],
  ]);
  assert.equal(classEligibility('CLASS-LOCAL-CONTAINER', input).eligibility, 'REQUIRES_SETUP_DECISION');
});

test('a decisive hard blocker outranks unrelated unknowns in the same class', () => {
  const input = observations([
    ['HOST-WSL2', 'UNSUPPORTED'],
    ['HOST-CPU-VIRT', 'UNKNOWN'],
    ['HOST-KVM-DEVICE', 'UNKNOWN'],
    ['HOST-KVM-RW-OPEN', 'UNKNOWN'],
  ]);
  assert.equal(classEligibility('CLASS-MICROVM-KVM', input).eligibility, 'BLOCKED_BY_HOST');
});

test('missing observations never become plausible', () => {
  const result = classEligibility('CLASS-LOCAL-PROCESS-ISOLATION', {});
  assert.equal(result.eligibility, 'UNKNOWN');
  assert.ok(result.reasons.some((reason) => reason.includes('HOST-WSL2')));
});

test('derives every fixed class in stable order', () => {
  const input = observations([
    ['HOST-WSL2', 'SUPPORTED'],
    ['HOST-USERNS', 'SUPPORTED'],
    ['HOST-SECCOMP-CONFIG', 'SUPPORTED'],
    ['HOST-LANDLOCK-CONFIG', 'SUPPORTED'],
    ['HOST-CPU-VIRT', 'SUPPORTED'],
    ['HOST-KVM-DEVICE', 'PRESENT'],
    ['HOST-KVM-RW-OPEN', 'SUPPORTED'],
    ['HOST-FUSE-DEVICE', 'SUPPORTED'],
    ['HOST-FUSE-TOOLS', 'PRESENT'],
    ['HOST-DOCKER-CLI', 'PRESENT'],
    ['HOST-DOCKER-DAEMON', 'PRESENT'],
  ]);
  const records = deriveCapabilityClasses(input);
  assert.deepEqual(records.map((record) => record.classId), CLASS_IDS);
  assert.ok(records.every((record) => record.eligibility === 'PHYSICALLY_PLAUSIBLE'));
});
