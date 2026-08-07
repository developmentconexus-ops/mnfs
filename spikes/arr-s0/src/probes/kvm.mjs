import { constants } from 'node:fs';
import { lstat as fsLstat, open as fsOpen } from 'node:fs/promises';

export class KvmProbeIntegrityError extends Error {
  constructor(message) {
    super(message);
    this.name = 'KvmProbeIntegrityError';
  }
}

export function classifyCpuVirtualization(cpuInfoText, { isWsl2 = false } = {}) {
  const text = String(cpuInfoText ?? '');
  if (/(?:^|\s)(?:vmx|svm)(?:\s|$)/mu.test(text)) {
    return {
      id: 'HOST-CPU-VIRT',
      state: 'SUPPORTED',
      rationale: 'CPU information exposes vmx/svm virtualization capability',
      artifactRefs: [],
    };
  }
  return {
    id: 'HOST-CPU-VIRT',
    state: isWsl2 ? 'UNKNOWN' : 'UNSUPPORTED',
    rationale: isWsl2
      ? 'vmx/svm is not exposed; WSL2 may mask host virtualization flags'
      : 'vmx/svm virtualization capability was not observed',
    artifactRefs: [],
  };
}

export async function observeKvmDevice({ lstat = fsLstat, open = fsOpen } = {}) {
  let stats;
  try {
    stats = await lstat('/dev/kvm');
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return {
        device: {
          id: 'HOST-KVM-DEVICE',
          state: 'ABSENT',
          rationale: '/dev/kvm is absent',
          artifactRefs: [],
        },
        rwOpen: {
          id: 'HOST-KVM-RW-OPEN',
          state: 'ABSENT',
          rationale: '/dev/kvm is absent, so read/write open was not attempted',
          artifactRefs: [],
        },
      };
    }
    return {
      device: {
        id: 'HOST-KVM-DEVICE',
        state: 'UNKNOWN',
        rationale: `could not inspect /dev/kvm (${error?.code ?? error?.message ?? 'unknown error'})`,
        artifactRefs: [],
      },
      rwOpen: {
        id: 'HOST-KVM-RW-OPEN',
        state: 'UNKNOWN',
        rationale: 'device inspection was inconclusive',
        artifactRefs: [],
      },
    };
  }

  if (!stats.isCharacterDevice()) {
    throw new KvmProbeIntegrityError('/dev/kvm exists but is not a character device');
  }

  const device = {
    id: 'HOST-KVM-DEVICE',
    state: 'PRESENT',
    rationale: '/dev/kvm exists as a character device',
    artifactRefs: [],
  };

  let handle;
  try {
    handle = await open('/dev/kvm', constants.O_RDWR);
    await handle.close();
    handle = null;
    return {
      device,
      rwOpen: {
        id: 'HOST-KVM-RW-OPEN',
        state: 'SUPPORTED',
        rationale: '/dev/kvm opened read/write and was immediately closed without ioctl',
        artifactRefs: [],
      },
    };
  } catch (error) {
    if (handle) {
      try { await handle.close(); } catch {}
    }
    const code = error?.code ?? 'UNKNOWN';
    return {
      device,
      rwOpen: {
        id: 'HOST-KVM-RW-OPEN',
        state: ['EACCES', 'EPERM'].includes(code) ? 'UNSUPPORTED' : 'UNKNOWN',
        rationale: `read/write open of /dev/kvm failed (${code})`,
        artifactRefs: [],
      },
    };
  }
}
