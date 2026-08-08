import { lstat } from 'node:fs/promises';
import path from 'node:path';

const RUN_ID_PATTERN = /^arr-s0-[0-9]{8}t[0-9]{9}z-[a-f0-9]{6}$/u;

export function requireRunId(value) {
  if (typeof value !== 'string' || !RUN_ID_PATTERN.test(value)) {
    throw new TypeError('invalid ARR-S0 run id');
  }
  return value;
}

function isBelowMnt(value) {
  const normalized = path.posix.normalize(value);
  return normalized === '/mnt' || normalized.startsWith('/mnt/');
}

function requireLinuxOwnedAbsolute(value, label) {
  if (typeof value !== 'string' || !path.posix.isAbsolute(value)) {
    throw new TypeError(`${label} must be absolute`);
  }
  const normalized = path.posix.normalize(value);
  if (isBelowMnt(normalized)) {
    throw new TypeError(`${label} must not resolve below /mnt`);
  }
  return normalized;
}

async function rejectExistingSymlinkComponents(absolutePath) {
  const segments = absolutePath.split('/').filter(Boolean);
  let current = '/';
  for (const segment of segments) {
    current = path.posix.join(current, segment);
    let stats;
    try {
      stats = await lstat(current);
    } catch (error) {
      if (error?.code === 'ENOENT') break;
      throw error;
    }
    if (stats.isSymbolicLink()) {
      throw new TypeError(`state root contains symlink component: ${current}`);
    }
  }
}

export async function resolveS0StateRoot(options = {}) {
  const env = options.env ?? process.env;
  let candidate;

  if (options.stateRoot !== undefined) {
    candidate = requireLinuxOwnedAbsolute(options.stateRoot, 'state root');
  } else {
    const xdg = env?.XDG_STATE_HOME;
    if (typeof xdg === 'string' && path.posix.isAbsolute(xdg) && !isBelowMnt(xdg)) {
      candidate = path.posix.join(path.posix.normalize(xdg), 'mnfs');
    } else {
      const home = env?.HOME;
      if (typeof home !== 'string' || !path.posix.isAbsolute(home) || isBelowMnt(home)) {
        throw new TypeError('ARR-S0 requires an absolute HOME on a Linux-owned filesystem');
      }
      candidate = path.posix.join(path.posix.normalize(home), '.local', 'state', 'mnfs');
    }
  }

  candidate = requireLinuxOwnedAbsolute(candidate, 'state root');
  await rejectExistingSymlinkComponents(candidate);
  return candidate;
}

export async function resolveS0RunRoot(runId, options = {}) {
  const canonicalRunId = requireRunId(runId);
  const stateRoot = await resolveS0StateRoot(options);
  const runRoot = path.posix.join(stateRoot, 'spikes', 'arr-s0', canonicalRunId);
  if (runRoot !== stateRoot && !runRoot.startsWith(`${stateRoot}/`)) {
    throw new TypeError('ARR-S0 run root escaped state root');
  }
  return runRoot;
}
