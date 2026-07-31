import { spawnSync } from 'node:child_process';
import { join, resolve } from 'node:path';

import { MnfsError } from '../domain/errors.js';

export interface RuntimeRootInput {
  readonly repoId: string;
  readonly env: Readonly<Record<string, string | undefined>>;
  readonly homeDir: string;
}

const SAFE_REPOSITORY_ID = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

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
