import { createHash } from 'node:crypto';
import { dirname, isAbsolute } from 'node:path';
import { realpath } from 'node:fs/promises';

import { as02Error, assertAs02 } from './errors.mjs';
import { runProcess } from './process-runner.mjs';

const RUN_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;
const IDEMPOTENT_RELEASE_PATTERN = /(?:already\s+(?:returned|released)|not\s+found|does\s+not\s+exist)/iu;
const EVIDENCE_LIMIT = 4_096;

function environment() {
  const home = process.env.HOME ?? '';
  assertSafeStoredPath(home, 'HOME');
  return {
    PATH: process.env.PATH ?? '',
    HOME: home,
    GIT_OPTIONAL_LOCKS: '0',
  };
}

function bounded(buffer) {
  return buffer.toString('utf8').slice(0, EVIDENCE_LIMIT);
}

function hashBuffer(buffer) {
  return `sha256:${createHash('sha256').update(buffer).digest('hex')}`;
}

function assertSafeStoredPath(path, label) {
  assertAs02(typeof path === 'string' && isAbsolute(path), 'TREEHOUSE_INVALID_OUTPUT', `${label} must be an absolute path.`, { path });
  assertAs02(path !== '/mnt' && !path.startsWith('/mnt/'), 'TREEHOUSE_INVALID_OUTPUT', `${label} must be on the Linux filesystem.`, { path });
  assertAs02(!path.includes('\n') && !path.includes('\r'), 'TREEHOUSE_INVALID_OUTPUT', `${label} must contain one path.`, { path });
}

async function canonicalRepository(repositoryPath) {
  try {
    const path = await realpath(repositoryPath);
    assertSafeStoredPath(path, 'Repository path');
    return path;
  } catch (cause) {
    if (cause?.code === 'TREEHOUSE_INVALID_OUTPUT') throw cause;
    throw as02Error('TREEHOUSE_INVALID_OUTPUT', 'Repository path must exist.', {
      repositoryPath,
      cause: cause instanceof Error ? cause.message : String(cause),
    });
  }
}

function validateLease(lease) {
  assertAs02(lease && typeof lease === 'object', 'TREEHOUSE_INVALID_OUTPUT', 'Treehouse lease is required.');
  assertSafeStoredPath(lease.repositoryPath, 'Lease repository path');
  assertSafeStoredPath(lease.path, 'Leased path');
  assertAs02(typeof lease.runId === 'string' && RUN_ID_PATTERN.test(lease.runId), 'TREEHOUSE_INVALID_OUTPUT', 'Lease run ID is invalid.', { runId: lease.runId });
}

export async function acquireTreehouseLease({ repositoryPath, runId, runner = runProcess }) {
  assertAs02(typeof runId === 'string' && RUN_ID_PATTERN.test(runId), 'TREEHOUSE_INVALID_OUTPUT', 'Run ID must use lowercase letters, numbers and single hyphens.', { runId });
  const repository = await canonicalRepository(repositoryPath);
  const holder = `mnfs-as02-${runId}`;
  const spec = {
    file: 'treehouse',
    args: ['get', '--lease', '--lease-holder', holder],
    cwd: repository,
    env: environment(),
    timeoutMs: 30_000,
  };
  const result = await runner(spec);

  if (result.exitCode !== 0) {
    throw as02Error('TREEHOUSE_UNAVAILABLE', 'Treehouse could not acquire the AS-02 lease.', {
      exitCode: result.exitCode,
      signal: result.signal,
      stdout: bounded(result.stdout),
      stderr: bounded(result.stderr),
    });
  }

  const raw = result.stdout.toString('utf8');
  const lines = raw.split(/\r?\n/u).filter((line) => line.length > 0);
  if (lines.length !== 1 || !isAbsolute(lines[0]) || lines[0].startsWith('/mnt/')) {
    throw as02Error('TREEHOUSE_INVALID_OUTPUT', 'Treehouse acquisition must return exactly one absolute Linux path.', {
      stdout: raw.slice(0, EVIDENCE_LIMIT),
    });
  }

  let leasedPath;
  try {
    leasedPath = await realpath(lines[0]);
  } catch (cause) {
    throw as02Error('TREEHOUSE_INVALID_OUTPUT', 'Treehouse returned a path that does not exist.', {
      path: lines[0],
      cause: cause instanceof Error ? cause.message : String(cause),
    });
  }
  assertSafeStoredPath(leasedPath, 'Leased path');

  return {
    runId,
    repositoryPath: repository,
    path: leasedPath,
    holder,
    acquiredAt: result.finishedAt,
  };
}

export async function inspectTreehouseLease({ repositoryPath, lease, runner = runProcess }) {
  validateLease(lease);
  const repository = await canonicalRepository(repositoryPath);
  assertAs02(repository === lease.repositoryPath, 'TREEHOUSE_INVALID_OUTPUT', 'Inspection repository does not match the lease.', {
    expected: lease.repositoryPath,
    actual: repository,
  });

  const result = await runner({
    file: 'treehouse',
    args: ['status'],
    cwd: repository,
    env: environment(),
    timeoutMs: 30_000,
  });

  return {
    exitCode: result.exitCode,
    signal: result.signal,
    stdout: bounded(result.stdout),
    stderr: bounded(result.stderr),
    stdoutHash: hashBuffer(result.stdout),
    stderrHash: hashBuffer(result.stderr),
    observedAt: result.finishedAt,
  };
}

export async function releaseTreehouseLease({ lease, runner = runProcess, force = false }) {
  validateLease(lease);
  assertAs02(force === false, 'TREEHOUSE_FORCE_FORBIDDEN', 'AS-02 ordinary cleanup forbids forced Treehouse release.');
  const poolPath = dirname(dirname(lease.path));
  assertSafeStoredPath(poolPath, 'Treehouse pool path');

  const result = await runner({
    file: 'treehouse',
    args: ['return', lease.path],
    cwd: poolPath,
    env: environment(),
    timeoutMs: 30_000,
  });

  if (result.exitCode === 0) {
    return {
      result: 'RELEASED',
      path: lease.path,
      finishedAt: result.finishedAt,
    };
  }

  const evidence = `${bounded(result.stdout)}\n${bounded(result.stderr)}`;
  const exactUnmanagedEvidence = evidence.includes(`worktree ${lease.path} is not managed by treehouse`);
  if (IDEMPOTENT_RELEASE_PATTERN.test(evidence) || exactUnmanagedEvidence) {
    return {
      result: 'ALREADY_RELEASED',
      path: lease.path,
      finishedAt: result.finishedAt,
    };
  }

  throw as02Error('TREEHOUSE_RELEASE_FAILED', 'Treehouse lease release failed.', {
    exitCode: result.exitCode,
    signal: result.signal,
    stdout: bounded(result.stdout),
    stderr: bounded(result.stderr),
    path: lease.path,
  });
}
