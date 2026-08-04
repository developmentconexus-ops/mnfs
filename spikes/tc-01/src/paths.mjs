import { existsSync, realpathSync } from 'node:fs';
import { basename, dirname, isAbsolute, join, normalize, resolve, sep } from 'node:path';

import { assertTc01 } from './errors.mjs';

const RUN_ID = /^tc01-[0-9]{8}-[0-9]{6}-[a-f0-9]{8}$/u;

function resolveThroughExistingParent(value) {
  let current = normalize(resolve(value));
  const missingSegments = [];

  while (!existsSync(current)) {
    const parent = dirname(current);
    assertTc01(parent !== current, 'TC01_INVALID_INPUT', 'Path has no resolvable existing parent.', { value });
    missingSegments.unshift(basename(current));
    current = parent;
  }

  return join(realpathSync(current), ...missingSegments);
}

function isBelowMountedFilesystem(value) {
  return value === '/mnt' || value.startsWith(`/mnt${sep}`);
}

export function validateRunId(value) {
  assertTc01(
    typeof value === 'string' && RUN_ID.test(value),
    'TC01_INVALID_INPUT',
    'TC-01 run id must use the canonical lowercase timestamp-and-random format.',
    { value },
  );
  return value;
}

export function assertLinuxOwnedAbsolutePath(value, label = 'path') {
  assertTc01(
    typeof value === 'string' && isAbsolute(value),
    'TC01_INVALID_INPUT',
    `${label} must be an absolute Linux path.`,
    { label, value },
  );

  const resolved = resolveThroughExistingParent(value);
  assertTc01(
    !isBelowMountedFilesystem(resolved),
    'TC01_LINUX_FILESYSTEM_REQUIRED',
    `${label} must be on a Linux-owned filesystem outside /mnt.`,
    { label, value, resolved },
  );
  return resolved;
}

export function resolveTc01StateRoot({ env = {}, homeDir }) {
  const candidate = env.MNFS_HOME || join(homeDir, '.local', 'state', 'mnfs');
  return assertLinuxOwnedAbsolutePath(candidate, 'TC-01 state root');
}

export function resolveTc01RunRoot(stateRoot, runId) {
  const safeStateRoot = assertLinuxOwnedAbsolutePath(stateRoot, 'TC-01 state root');
  const safeRunId = validateRunId(runId);
  const runRoot = assertLinuxOwnedAbsolutePath(
    join(safeStateRoot, 'fixtures', 'tc-01', safeRunId),
    'TC-01 run root',
  );
  const prefix = `${safeStateRoot}${sep}`;
  assertTc01(
    runRoot.startsWith(prefix),
    'TC01_INVALID_INPUT',
    'TC-01 run root escaped the configured state root.',
    { stateRoot: safeStateRoot, runId: safeRunId, runRoot },
  );
  return runRoot;
}
