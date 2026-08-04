import { createHash } from 'node:crypto';
import { lstat, readFile, readdir, readlink, realpath } from 'node:fs/promises';
import { isAbsolute, join, relative, sep } from 'node:path';

import { assertTc01, tc01Error } from './errors.mjs';
import { assertLinuxOwnedAbsolutePath } from './paths.mjs';
import { runProcess } from './process-runner.mjs';

const SNAPSHOT_SCHEMA_VERSION = 1;
const GIT_TIMEOUT_MS = 5_000;
const OUTPUT_LIMIT_BYTES = 65_536;
const SNAPSHOT_FIELDS = ['root', 'head', 'porcelainStatus', 'localConfig', 'refs', 'trackedTree', 'workingTree'];

function sha256Bytes(value) {
  const bytes = Buffer.isBuffer(value) ? value : Buffer.from(value);
  return `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
}

function bindBytes(bytes, { text = false } = {}) {
  const value = {
    sha256: sha256Bytes(bytes),
    byteLength: bytes.length,
  };
  if (text) value.text = bytes.toString('utf8').trim();
  return value;
}

function modeString(mode) {
  return (mode & 0o7777).toString(8).padStart(4, '0');
}

function normalizedRelative(root, path) {
  return relative(root, path).split(sep).join('/');
}

async function invokeGit({ gitFile, repoPath, env, run, args }) {
  const result = await run({
    file: gitFile,
    args,
    cwd: repoPath,
    env,
    timeoutMs: GIT_TIMEOUT_MS,
    stdoutLimitBytes: OUTPUT_LIMIT_BYTES,
    stderrLimitBytes: OUTPUT_LIMIT_BYTES,
  });
  if (result.exitCode !== 0) {
    throw tc01Error('TC01_COMMAND_FAILED', 'Git observation command failed.', {
      gitFile,
      args,
      repoPath,
      exitCode: result.exitCode,
      signal: result.signal,
      stderr: result.stderr.toString('utf8'),
    });
  }
  return result.stdout;
}

function validateSnapshotInput({ gitFile, repoPath, env, run }) {
  const safeGitFile = assertLinuxOwnedAbsolutePath(gitFile, 'Git executable');
  const safeRepoPath = assertLinuxOwnedAbsolutePath(repoPath, 'observed repository');
  assertTc01(env && typeof env === 'object' && !Array.isArray(env), 'TC01_INVALID_INPUT', 'Git observer environment must be an object.');
  assertTc01(typeof run === 'function', 'TC01_INVALID_INPUT', 'Git observer process runner is required.');
  return { gitFile: safeGitFile, repoPath: safeRepoPath, env, run };
}

export async function snapshotRepository({ gitFile, repoPath, env, run = runProcess }) {
  const input = validateSnapshotInput({ gitFile, repoPath, env, run });
  const [headBytes, statusBytes, configBytes, refsBytes, treeBytes] = await Promise.all([
    invokeGit({ ...input, args: ['rev-parse', 'HEAD'] }),
    invokeGit({ ...input, args: ['status', '--porcelain=v1', '-z', '--untracked-files=all'] }),
    invokeGit({ ...input, args: ['config', '--local', '--null', '--list'] }),
    invokeGit({ ...input, args: ['for-each-ref', '--format=%(refname)%00%(objectname)%00'] }),
    invokeGit({ ...input, args: ['write-tree'] }),
  ]);

  const head = bindBytes(headBytes, { text: true });
  const trackedTree = bindBytes(treeBytes, { text: true });
  assertTc01(/^[a-f0-9]{40}$/u.test(head.text), 'TC01_EVIDENCE_INVALID', 'Observed Git HEAD is invalid.', { head: head.text });
  assertTc01(/^[a-f0-9]{40}$/u.test(trackedTree.text), 'TC01_EVIDENCE_INVALID', 'Observed Git tree identity is invalid.', { trackedTree: trackedTree.text });

  return {
    schemaVersion: SNAPSHOT_SCHEMA_VERSION,
    root: input.repoPath,
    head,
    porcelainStatus: bindBytes(statusBytes),
    localConfig: bindBytes(configBytes),
    refs: bindBytes(refsBytes),
    trackedTree,
    workingTree: await snapshotPathTree({ root: input.repoPath, excludeGit: true }),
  };
}

export async function snapshotPathTree({ root, excludeGit = false }) {
  const safeRoot = assertLinuxOwnedAbsolutePath(root, 'snapshot tree root');
  const rootStat = await lstat(safeRoot);
  assertTc01(rootStat.isDirectory(), 'TC01_EVIDENCE_INVALID', 'Snapshot tree root must be a directory.', { root: safeRoot });
  const entries = [];

  async function walk(directory) {
    const children = await readdir(directory, { withFileTypes: true });
    children.sort((left, right) => left.name.localeCompare(right.name, 'en'));

    for (const child of children) {
      if (excludeGit && child.name === '.git') continue;
      const path = join(directory, child.name);
      const stat = await lstat(path);
      const relativePath = normalizedRelative(safeRoot, path);

      if (stat.isDirectory()) {
        await walk(path);
        continue;
      }
      if (stat.isFile()) {
        const bytes = await readFile(path);
        entries.push({
          path: relativePath,
          type: 'file',
          mode: modeString(stat.mode),
          byteLength: bytes.length,
          sha256: sha256Bytes(bytes),
        });
        continue;
      }
      if (stat.isSymbolicLink()) {
        const target = await readlink(path);
        const targetBytes = Buffer.from(target, 'utf8');
        entries.push({
          path: relativePath,
          type: 'symlink',
          mode: modeString(stat.mode),
          target,
          byteLength: targetBytes.length,
          sha256: sha256Bytes(targetBytes),
        });
        continue;
      }

      throw tc01Error('TC01_EVIDENCE_INVALID', 'Snapshot tree contains an unsupported special file.', {
        root: safeRoot,
        path: relativePath,
        mode: modeString(stat.mode),
      });
    }
  }

  await walk(safeRoot);
  entries.sort((left, right) => left.path.localeCompare(right.path, 'en'));
  return {
    schemaVersion: SNAPSHOT_SCHEMA_VERSION,
    root: await realpath(safeRoot),
    digest: sha256Bytes(Buffer.from(JSON.stringify(entries), 'utf8')),
    entries,
  };
}

export async function readGitInvocationLog(path) {
  assertTc01(typeof path === 'string' && isAbsolute(path), 'TC01_EVIDENCE_INVALID', 'Git invocation log path must be absolute.', { path });
  const safePath = assertLinuxOwnedAbsolutePath(path, 'Git invocation log');
  let content;
  try {
    content = await readFile(safePath, 'utf8');
  } catch (error) {
    if (error?.code === 'ENOENT') return [];
    throw tc01Error('TC01_EVIDENCE_INVALID', 'Unable to read the Git invocation log.', {
      path: safePath,
      cause: error instanceof Error ? error.message : String(error),
    });
  }

  const entries = [];
  for (const [index, line] of content.split('\n').entries()) {
    if (line.length === 0) continue;
    let entry;
    try {
      entry = JSON.parse(line);
    } catch (error) {
      throw tc01Error('TC01_EVIDENCE_INVALID', 'Git invocation log contains invalid JSON.', {
        path: safePath,
        line: index + 1,
        cause: error instanceof Error ? error.message : String(error),
      });
    }
    validateInvocationEntry(entry, index + 1);
    entries.push(entry);
  }
  return entries;
}

function validateInvocationEntry(entry, line = null) {
  assertTc01(entry && typeof entry === 'object' && !Array.isArray(entry), 'TC01_EVIDENCE_INVALID', 'Git invocation entry must be an object.', { line });
  assertTc01(entry.schemaVersion === 1, 'TC01_EVIDENCE_INVALID', 'Git invocation entry schema is unsupported.', { line, schemaVersion: entry.schemaVersion });
  assertTc01(Array.isArray(entry.argv) && entry.argv.every((value) => typeof value === 'string'), 'TC01_EVIDENCE_INVALID', 'Git invocation argv must be a string array.', { line });
  assertTc01(typeof entry.cwd === 'string' && isAbsolute(entry.cwd), 'TC01_EVIDENCE_INVALID', 'Git invocation cwd must be absolute.', { line, cwd: entry.cwd });
  return entry;
}

export function assertNoFetchInvocation(entries) {
  assertTc01(Array.isArray(entries), 'TC01_EVIDENCE_INVALID', 'Git invocation entries must be an array.');
  for (const [index, entry] of entries.entries()) {
    validateInvocationEntry(entry, index + 1);
    if (entry.argv[0] === 'fetch') {
      throw tc01Error('TC01_EVIDENCE_INVALID', 'Treehouse attempted a forbidden Git fetch during TC-01.', {
        index,
        argv: [...entry.argv],
        cwd: entry.cwd,
      });
    }
  }
}

export function compareRepositorySnapshots(before, after) {
  assertTc01(before?.schemaVersion === SNAPSHOT_SCHEMA_VERSION, 'TC01_EVIDENCE_INVALID', 'Before snapshot is invalid.');
  assertTc01(after?.schemaVersion === SNAPSHOT_SCHEMA_VERSION, 'TC01_EVIDENCE_INVALID', 'After snapshot is invalid.');
  const changedFields = [];
  const changes = {};

  for (const field of SNAPSHOT_FIELDS) {
    if (JSON.stringify(before[field]) === JSON.stringify(after[field])) continue;
    changedFields.push(field);
    changes[field] = { before: before[field], after: after[field] };
  }

  return {
    equal: changedFields.length === 0,
    changedFields,
    changes,
  };
}
