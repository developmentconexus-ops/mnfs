import assert from 'node:assert/strict';
import test from 'node:test';
import {
  KvmProbeIntegrityError,
  classifyCpuVirtualization,
  observeKvmDevice,
} from '../src/probes/kvm.mjs';

test('vmx or svm CPU flags prove virtualization support', () => {
  assert.equal(classifyCpuVirtualization('flags : fpu vmx sse4_2\n', { isWsl2: true }).state, 'SUPPORTED');
  assert.equal(classifyCpuVirtualization('Features : fp asimd svm\n', { isWsl2: false }).state, 'SUPPORTED');
});

test('missing CPU virtualization flag remains UNKNOWN on WSL2', () => {
  const result = classifyCpuVirtualization('flags : fpu sse4_2\n', { isWsl2: true });
  assert.equal(result.state, 'UNKNOWN');
  assert.match(result.rationale, /mask/u);
});

test('absent /dev/kvm is explicit Evidence', async () => {
  const lstat = async () => { const error = new Error('missing'); error.code = 'ENOENT'; throw error; };
  const result = await observeKvmDevice({ lstat, open: async () => assert.fail('open must not be called') });
  assert.equal(result.device.state, 'ABSENT');
  assert.equal(result.rwOpen.state, 'ABSENT');
});

test('non-character /dev/kvm is a probe integrity violation', async () => {
  await assert.rejects(
    () => observeKvmDevice({
      lstat: async () => ({ isCharacterDevice: () => false }),
      open: async () => assert.fail('open must not be called'),
    }),
    (error) => error instanceof KvmProbeIntegrityError,
  );
});

test('character /dev/kvm is opened read/write and immediately closed', async () => {
  const calls = [];
  const result = await observeKvmDevice({
    lstat: async () => ({ isCharacterDevice: () => true }),
    open: async (target, flags) => {
      calls.push({ target, flags });
      return { close: async () => calls.push({ close: true }) };
    },
  });
  assert.equal(result.device.state, 'PRESENT');
  assert.equal(result.rwOpen.state, 'SUPPORTED');
  assert.equal(calls[0].target, '/dev/kvm');
  assert.equal(calls.length, 2);
});

test('KVM permission denial is UNSUPPORTED while inconclusive errno is UNKNOWN', async () => {
  const charDevice = async () => ({ isCharacterDevice: () => true });
  const denied = await observeKvmDevice({
    lstat: charDevice,
    open: async () => { const error = new Error('denied'); error.code = 'EACCES'; throw error; },
  });
  assert.equal(denied.rwOpen.state, 'UNSUPPORTED');
  assert.match(denied.rwOpen.rationale, /EACCES/u);

  const other = await observeKvmDevice({
    lstat: charDevice,
    open: async () => { const error = new Error('busy'); error.code = 'EBUSY'; throw error; },
  });
  assert.equal(other.rwOpen.state, 'UNKNOWN');
});
