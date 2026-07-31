import { randomUUID } from 'node:crypto';
import {
  existsSync,
  linkSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';

import { MnfsError } from '../domain/errors.js';
import type { PersistedProjectIdentity, ProjectIdentity } from '../domain/types.js';
import { findGitRoot } from '../runtime/paths.js';

export interface InitializeProjectInput {
  readonly cwd: string;
  readonly now?: () => string;
  readonly createId?: () => string;
}

function parseIdentity(identityPath: string, projectRoot: string): ProjectIdentity {
  let value: unknown;
  try {
    value = JSON.parse(readFileSync(identityPath, 'utf8'));
  } catch (error) {
    throw new MnfsError(
      'PROJECT_IDENTITY_INVALID',
      `Cannot read MNFS repository identity at ${identityPath}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  if (
    typeof value !== 'object' ||
    value === null ||
    (value as { schemaVersion?: unknown }).schemaVersion !== 1 ||
    typeof (value as { repoId?: unknown }).repoId !== 'string' ||
    typeof (value as { createdAt?: unknown }).createdAt !== 'string'
  ) {
    throw new MnfsError(
      'PROJECT_IDENTITY_INVALID',
      `Invalid MNFS repository identity at ${identityPath}.`,
    );
  }

  const persisted = value as PersistedProjectIdentity;
  return { ...persisted, projectRoot };
}

function publishIdentity(identityPath: string, identity: PersistedProjectIdentity): void {
  mkdirSync(dirname(identityPath), { recursive: true });
  const temporaryPath = `${identityPath}.tmp-${process.pid}-${randomUUID()}`;

  try {
    writeFileSync(temporaryPath, `${JSON.stringify(identity, null, 2)}\n`, {
      encoding: 'utf8',
      flag: 'wx',
    });
    linkSync(temporaryPath, identityPath);
  } finally {
    rmSync(temporaryPath, { force: true });
  }
}

export function loadProject(cwd: string): ProjectIdentity {
  const projectRoot = findGitRoot(cwd);
  const identityPath = join(projectRoot, '.mnfs', 'repo.json');
  if (!existsSync(identityPath)) {
    throw new MnfsError(
      'PROJECT_NOT_INITIALIZED',
      `MNFS is not initialized in ${projectRoot}.`,
      { remediation: 'Run mnfs init in this repository first.' },
    );
  }
  return parseIdentity(identityPath, projectRoot);
}

export function initializeProject(input: InitializeProjectInput): ProjectIdentity {
  const projectRoot = findGitRoot(input.cwd);
  const identityPath = join(projectRoot, '.mnfs', 'repo.json');

  if (existsSync(identityPath)) return parseIdentity(identityPath, projectRoot);

  const identity: PersistedProjectIdentity = {
    schemaVersion: 1,
    repoId: (input.createId ?? randomUUID)(),
    createdAt: (input.now ?? (() => new Date().toISOString()))(),
  };

  try {
    publishIdentity(identityPath, identity);
    return { ...identity, projectRoot };
  } catch (error) {
    if (existsSync(identityPath)) return parseIdentity(identityPath, projectRoot);
    throw new MnfsError(
      'PROJECT_INITIALIZATION_FAILED',
      `Could not initialize MNFS in ${projectRoot}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
