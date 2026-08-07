import { CLASS_IDS } from './class-eligibility.mjs';
import { VERDICT_VALUES } from './verdict.mjs';

export const S0_PLAN_VERSION = '0.2.0';
export const S0_PLAN_GIT_BLOB = '3e78445fcbcca360f612edefd025c6cb0f84f8e5';
export const S0_CONTRACT_DRAFT_VERSION = '0.1.0';

export const S0_CAPABILITY_IDS = Object.freeze([
  'HOST-WSL2',
  'HOST-LINUX-FS',
  'HOST-CPU-VIRT',
  'HOST-KVM-DEVICE',
  'HOST-KVM-RW-OPEN',
  'HOST-USERNS',
  'HOST-SECCOMP-CONFIG',
  'HOST-LANDLOCK-CONFIG',
  'HOST-FUSE-DEVICE',
  'HOST-FUSE-TOOLS',
  'HOST-CGROUP-V2',
  'HOST-DOCKER-CLI',
  'HOST-DOCKER-DAEMON',
  'HOST-BWRAP',
  'HOST-GIT-READONLY',
]);

export const S0_CLASS_IDS = CLASS_IDS;
export const S0_VERDICT_VALUES = VERDICT_VALUES;
