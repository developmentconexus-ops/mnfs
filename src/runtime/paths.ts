import { homedir } from 'node:os';
import path from 'node:path';

import { MnfsError } from '../domain/errors.js';
import { requireAttemptId, requireWriteTrackId } from '../execution/ids.js';

const REPOSITORY_ID_PATTERN = /^repo-[0-9a-f]{32}$/;
const MOUNT_ROOT_PATTERN = /^\/mnt(?:\/|$)/;

function pathError(message: string): MnfsError {
  return new MnfsError('INTERNAL_ERROR', message);
}

function requireAbsoluteLinuxPath(value: string, label: string): string {
  if (!path.isAbsolute(value)) throw pathError(`${label} must be an absolute path.`);
  const normalized = path.resolve(value);
  if (normalized !== value || MOUNT_ROOT_PATTERN.test(normalized)) {
    throw pathError(`${label} must remain on the canonical Linux filesystem.`);
  }
  return normalized;
}

function requireRepositoryId(repositoryId: string): string {
  if (!REPOSITORY_ID_PATTERN.test(repositoryId)) {
    throw pathError(`Repository id has an invalid shape: ${repositoryId}.`);
  }
  return repositoryId;
}

function contained(parent: string, child: string): boolean {
  const suffix = path.relative(parent, child);
  return suffix.length > 0
    && suffix !== '..'
    && !suffix.startsWith(`..${path.sep}`)
    && !path.isAbsolute(suffix);
}

function requireContained(parent: string, child: string, label: string): string {
  if (!contained(parent, child)) throw pathError(`${label} escapes its runtime root.`);
  return child;
}

export interface RuntimeRootInput {
  readonly repositoryId: string;
  readonly homeDirectory?: string;
  readonly xdgStateHome?: string;
  readonly mnfsHome?: string;
}

export interface ExecutionAttemptRuntimePaths {
  readonly attemptRoot: string;
  readonly homePath: string;
  readonly xdgConfigHome: string;
  readonly poolRoot: string;
  readonly hooksPath: string;
}

export function resolveRuntimeRoot(input: RuntimeRootInput): string {
  const repositoryId = requireRepositoryId(input.repositoryId);
  if (input.mnfsHome !== undefined) {
    const base = requireAbsoluteLinuxPath(input.mnfsHome, 'MNFS_HOME');
    return path.join(base, 'repos', repositoryId);
  }

  const homeDirectory = requireAbsoluteLinuxPath(
    input.homeDirectory ?? homedir(),
    'Home directory',
  );
  const stateBase = input.xdgStateHome === undefined
    ? path.join(homeDirectory, '.local', 'state')
    : requireAbsoluteLinuxPath(input.xdgStateHome, 'XDG_STATE_HOME');
  return path.join(stateBase, 'mnfs', 'repos', repositoryId);
}

export function resolvePlanCurrentPath(runtimeRoot: string, missionId: string): string {
  return path.join(runtimeRoot, 'plans', 'current', `${missionId}.html`);
}

export function resolvePlanRevisionPath(
  runtimeRoot: string,
  missionId: string,
  revision: number,
): string {
  return path.join(
    runtimeRoot,
    'plans',
    'revisions',
    missionId,
    `revision-${revision.toString().padStart(4, '0')}.html`,
  );
}

export function resolveExecutionSourcePath(
  runtimeRootInput: string,
  writeTrackIdInput: string,
  attemptIdInput: string,
): string {
  const runtimeRoot = requireAbsoluteLinuxPath(runtimeRootInput, 'Execution runtime root');
  const writeTrackId = requireWriteTrackId(writeTrackIdInput);
  const attemptId = requireAttemptId(attemptIdInput);
  if (attemptId.writeTrackId !== writeTrackId) {
    throw pathError(`Attempt ${attemptId.id} does not belong to Write Track ${writeTrackId}.`);
  }

  return requireContained(
    runtimeRoot,
    path.join(
      runtimeRoot,
      'execution-sources',
      writeTrackId,
      attemptId.id,
      'source',
    ),
    'Execution source path',
  );
}

export function resolveLeaseActionRoot(runtimeRootInput: string): string {
  const runtimeRoot = requireAbsoluteLinuxPath(runtimeRootInput, 'Execution runtime root');
  return requireContained(
    runtimeRoot,
    path.join(runtimeRoot, 'lease-actions'),
    'Lease action root',
  );
}

export function resolveExecutionAttemptRuntimePaths(
  runtimeRootInput: string,
  writeTrackIdInput: string,
  attemptIdInput: string,
): ExecutionAttemptRuntimePaths {
  const runtimeRoot = requireAbsoluteLinuxPath(runtimeRootInput, 'Execution runtime root');
  const writeTrackId = requireWriteTrackId(writeTrackIdInput);
  const attemptId = requireAttemptId(attemptIdInput);
  if (attemptId.writeTrackId !== writeTrackId) {
    throw pathError(`Attempt ${attemptId.id} does not belong to Write Track ${writeTrackId}.`);
  }

  const attemptRoot = requireContained(
    runtimeRoot,
    path.join(runtimeRoot, 'treehouse', writeTrackId, attemptId.id),
    'Treehouse Attempt root',
  );
  return {
    attemptRoot,
    homePath: requireContained(attemptRoot, path.join(attemptRoot, 'home'), 'Treehouse HOME'),
    xdgConfigHome: requireContained(
      attemptRoot,
      path.join(attemptRoot, 'xdg-config'),
      'Treehouse XDG config',
    ),
    poolRoot: requireContained(attemptRoot, path.join(attemptRoot, 'pool'), 'Treehouse pool'),
    hooksPath: requireContained(attemptRoot, path.join(attemptRoot, 'hooks'), 'Treehouse hooks'),
  };
}
