import { spawnSync } from 'node:child_process';
import { isAbsolute, join, relative, resolve, sep } from 'node:path';

import { MnfsError } from '../domain/errors.js';
import { requireAttemptId, requireWriteTrackId } from '../execution/ids.js';

export interface RuntimeRootInput {
  readonly repoId: string;
  readonly env: Readonly<Record<string, string | undefined>>;
  readonly homeDir: string;
}

export interface ExecutionAttemptRuntimePaths {
  readonly attemptRoot: string;
  readonly homePath: string;
  readonly xdgConfigHome: string;
  readonly poolRoot: string;
  readonly hooksPath: string;
}

const SAFE_REPOSITORY_ID = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
const SAFE_MISSION_ID = /^MIS-\d{3,}$/;

function requireMissionPlanMissionId(missionId: string): void {
  if (!SAFE_MISSION_ID.test(missionId)) {
    throw new MnfsError('PLAN_INVALID', `Invalid mission id for plan artifact: ${missionId}.`);
  }
}

function requireLinuxOwnedAbsolutePath(path: string): string {
  if (
    !isAbsolute(path)
    || path.includes('\0')
    || path.includes('\n')
    || path.includes('\r')
  ) {
    throw new MnfsError('EXECUTION_SOURCE_INVALID', `Invalid execution runtime root: ${path}.`);
  }
  const absolute = resolve(path);
  if (absolute === '/mnt' || absolute.startsWith('/mnt/')) {
    throw new MnfsError(
      'LINUX_FILESYSTEM_REQUIRED',
      `Execution sources require a Linux-owned runtime root, not ${absolute}.`,
    );
  }
  return absolute;
}

function requireContainedRuntimePath(root: string, candidate: string, label: string): string {
  const suffix = relative(root, candidate);
  if (
    suffix.length === 0
    || suffix === '..'
    || suffix.startsWith(`..${sep}`)
    || isAbsolute(suffix)
  ) {
    throw new MnfsError('EXECUTION_SOURCE_INVALID', `${label} escaped its runtime root.`);
  }
  return candidate;
}

export function findGitRoot(startPath: string): string {
  const result = spawnSync('git', ['rev-parse', '--show-toplevel'], {
    cwd: startPath,
    encoding: 'utf8',
    shell: false,
  });

  const root = result.stdout.trim();
  if (result.status !== 0 || root.length === 0) {
    throw new MnfsError(
      'NOT_GIT_REPOSITORY',
      `MNFS requires a Git repository: ${result.stderr.trim() || startPath}`,
      { remediation: 'Run the command inside a Git repository.' },
    );
  }

  return resolve(root);
}

export function resolveRuntimeRoot(input: RuntimeRootInput): string {
  if (!SAFE_REPOSITORY_ID.test(input.repoId)) {
    throw new MnfsError(
      'RUNTIME_HOME_INVALID',
      `Invalid MNFS repository id: ${input.repoId}`,
    );
  }

  const configuredHome = input.env.MNFS_HOME?.trim();
  const stateHome = configuredHome
    ? resolve(configuredHome)
    : join(resolve(input.homeDir), '.local', 'state', 'mnfs');

  return join(stateHome, 'repos', input.repoId);
}

export function resolveExecutionSourcePath(
  runtimeRoot: string,
  trackId: string,
  attemptId: string,
): string {
  const root = requireLinuxOwnedAbsolutePath(runtimeRoot);
  try {
    const track = requireWriteTrackId(trackId);
    const attempt = requireAttemptId(attemptId, track);
    return requireContainedRuntimePath(
      root,
      join(root, 'execution-sources', track, attempt, 'source'),
      'Execution source path',
    );
  } catch (error) {
    if (error instanceof MnfsError && error.code === 'LINUX_FILESYSTEM_REQUIRED') throw error;
    if (error instanceof MnfsError && error.code === 'EXECUTION_SOURCE_INVALID') throw error;
    throw new MnfsError(
      'EXECUTION_SOURCE_INVALID',
      `Invalid execution source identity ${trackId}/${attemptId}.`,
    );
  }
}

export function resolveLeaseActionRoot(runtimeRoot: string): string {
  const root = requireLinuxOwnedAbsolutePath(runtimeRoot);
  return requireContainedRuntimePath(root, join(root, 'lease-actions'), 'Lease action root');
}

export function resolveExecutionAttemptRuntimePaths(
  runtimeRoot: string,
  trackId: string,
  attemptId: string,
): ExecutionAttemptRuntimePaths {
  const root = requireLinuxOwnedAbsolutePath(runtimeRoot);
  try {
    const track = requireWriteTrackId(trackId);
    const attempt = requireAttemptId(attemptId, track);
    const attemptRoot = requireContainedRuntimePath(
      root,
      join(root, 'treehouse', track, attempt),
      'Treehouse Attempt root',
    );
    const homePath = requireContainedRuntimePath(
      attemptRoot,
      join(attemptRoot, 'home'),
      'Treehouse HOME',
    );
    return {
      attemptRoot,
      homePath,
      xdgConfigHome: requireContainedRuntimePath(
        attemptRoot,
        join(homePath, '.config'),
        'Treehouse XDG config',
      ),
      poolRoot: requireContainedRuntimePath(
        attemptRoot,
        join(attemptRoot, 'pool'),
        'Treehouse pool',
      ),
      hooksPath: requireContainedRuntimePath(
        attemptRoot,
        join(attemptRoot, 'hooks'),
        'Treehouse hooks',
      ),
    };
  } catch (error) {
    if (error instanceof MnfsError && error.code === 'LINUX_FILESYSTEM_REQUIRED') throw error;
    if (error instanceof MnfsError && error.code === 'EXECUTION_SOURCE_INVALID') throw error;
    throw new MnfsError(
      'EXECUTION_SOURCE_INVALID',
      `Invalid Treehouse Attempt identity ${trackId}/${attemptId}.`,
    );
  }
}

export function resolveMissionPlanContractPath(projectRoot: string, missionId: string): string {
  requireMissionPlanMissionId(missionId);
  return join(projectRoot, '.mnfs', 'missions', missionId, 'plan.json');
}

export function resolveMissionPlanHtmlPath(runtimeRoot: string, missionId: string, revision: number): string {
  requireMissionPlanMissionId(missionId);
  if (!Number.isInteger(revision) || revision < 1) {
    throw new MnfsError('PLAN_INVALID', `Invalid mission plan revision: ${revision}.`);
  }

  return join(
    runtimeRoot,
    'artifacts',
    'plans',
    missionId,
    `rev-${String(revision).padStart(4, '0')}.html`,
  );
}

export function resolveMissionPlanReviewPath(runtimeRoot: string, missionId: string): string {
  requireMissionPlanMissionId(missionId);
  return join(runtimeRoot, 'artifacts', 'plans', missionId, 'review.html');
}
