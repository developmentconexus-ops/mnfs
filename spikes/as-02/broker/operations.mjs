import { randomUUID } from 'node:crypto';
import {
  lstat,
  mkdir,
  readFile,
  readdir,
  realpath,
  rename,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises';
import {
  dirname,
  isAbsolute,
  join,
  relative,
  resolve,
  sep,
} from 'node:path';

import { as02Error, assertAs02 } from '../src/errors.mjs';
import { runProcess } from '../src/process-runner.mjs';

const OPERATION_FIELDS = Object.freeze({
  bash: new Set(['operation', 'command', 'timeoutMs']),
  read: new Set(['operation', 'path', 'offset', 'limit']),
  write: new Set(['operation', 'path', 'content']),
  edit: new Set(['operation', 'path', 'oldText', 'newText']),
  grep: new Set(['operation', 'path', 'query', 'maxResults']),
  find: new Set(['operation', 'path', 'pattern', 'maxResults']),
  ls: new Set(['operation', 'path', 'maxEntries']),
});
const DEFAULT_LIMIT = 100;
const DEFAULT_TIMEOUT_MS = 30_000;
const MAX_TIMEOUT_MS = 300_000;
const SEARCH_FILE_LIMIT_BYTES = 1_048_576;

function invalid(message, details = {}) {
  throw as02Error('BROKER_OPERATION_INVALID', message, details);
}

function assertPlainObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.getPrototypeOf(value) !== Object.prototype) {
    invalid(`${label} must be a plain object.`);
  }
}

function positiveInteger(value, label, fallback, maximum = Number.MAX_SAFE_INTEGER) {
  const candidate = value === undefined ? fallback : value;
  if (!Number.isInteger(candidate) || candidate <= 0 || candidate > maximum) {
    invalid(`${label} must be a positive integer no greater than ${maximum}.`, { value });
  }
  return candidate;
}

function nonNegativeInteger(value, label, fallback = 0) {
  const candidate = value === undefined ? fallback : value;
  if (!Number.isInteger(candidate) || candidate < 0) {
    invalid(`${label} must be a non-negative integer.`, { value });
  }
  return candidate;
}

function boundedString(value, label, maxBytes, { allowEmpty = false } = {}) {
  if (typeof value !== 'string' || (!allowEmpty && value.length === 0)) {
    invalid(`${label} must be ${allowEmpty ? 'a' : 'a non-empty'} string.`, { label });
  }
  const bytes = Buffer.byteLength(value, 'utf8');
  if (bytes > maxBytes) {
    throw as02Error('BROKER_INPUT_TOO_LARGE', `${label} exceeds the broker input limit.`, {
      label,
      bytes,
      maxBytes,
    });
  }
  return value;
}

function canonicalBoundary(boundary) {
  assertPlainObject(boundary, 'boundary');
  let worktreePath;
  let cwd;
  try {
    worktreePath = realpathSyncNative(boundary.worktreePath);
    cwd = realpathSyncNative(boundary.cwd);
  } catch (cause) {
    throw as02Error('BROKER_PATH_ESCAPE', 'Broker boundary paths must exist.', {
      cause: cause instanceof Error ? cause.message : String(cause),
    });
  }
  assertContained(worktreePath, cwd, 'cwd');

  assertPlainObject(boundary.env, 'boundary.env');
  const env = {};
  for (const [key, value] of Object.entries(boundary.env)) {
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/u.test(key) || typeof value !== 'string') {
      invalid('Broker environment must contain string key/value pairs.', { key });
    }
    env[key] = value;
  }

  return {
    worktreePath,
    cwd,
    env,
    maxOutputBytes: positiveInteger(boundary.maxOutputBytes, 'boundary.maxOutputBytes', 65_536, 10_485_760),
    maxInputBytes: positiveInteger(boundary.maxInputBytes, 'boundary.maxInputBytes', 1_048_576, 10_485_760),
  };
}

function realpathSyncNative(path) {
  // Imported lazily through createRequire-free ESM to keep this file focused.
  return process.getBuiltinModule('node:fs').realpathSync.native(path);
}

function assertContained(root, candidate, label) {
  const relation = relative(root, candidate);
  if (relation.startsWith('..') || isAbsolute(relation)) {
    throw as02Error('BROKER_PATH_ESCAPE', `${label} escapes the leased worktree.`, {
      root,
      candidate,
      label,
    });
  }
}

function portableRelative(root, candidate) {
  const value = relative(root, candidate).split(sep).join('/');
  return value === '' ? '.' : value;
}

function lexicalTarget(root, inputPath) {
  if (typeof inputPath !== 'string' || inputPath.length === 0 || inputPath.includes('\0')) {
    invalid('operation.path must be a non-empty path without NUL bytes.');
  }
  const candidate = isAbsolute(inputPath) ? resolve(inputPath) : resolve(root, inputPath);
  assertContained(root, candidate, 'operation path');
  return candidate;
}

async function existingPath(root, inputPath, expectedKind) {
  const lexical = lexicalTarget(root, inputPath);
  let info;
  try {
    info = await lstat(lexical);
  } catch (cause) {
    throw as02Error('BROKER_PATH_NOT_FOUND', 'Broker target does not exist.', {
      path: inputPath,
      cause: cause instanceof Error ? cause.message : String(cause),
    });
  }
  if (info.isSymbolicLink()) {
    throw as02Error('BROKER_PATH_ESCAPE', 'Broker refuses symbolic-link targets.', { path: inputPath });
  }
  const canonical = await realpath(lexical);
  assertContained(root, canonical, 'resolved operation path');
  if (expectedKind === 'file' && !info.isFile()) invalid('Broker target must be a regular file.', { path: inputPath });
  if (expectedKind === 'directory' && !info.isDirectory()) invalid('Broker target must be a directory.', { path: inputPath });
  return { lexical, canonical, info };
}

async function writablePath(root, inputPath) {
  const lexical = lexicalTarget(root, inputPath);
  const parent = await realpath(dirname(lexical));
  assertContained(root, parent, 'write parent');
  try {
    const info = await lstat(lexical);
    if (info.isSymbolicLink()) {
      throw as02Error('BROKER_PATH_ESCAPE', 'Broker refuses symbolic-link write targets.', { path: inputPath });
    }
    const canonical = await realpath(lexical);
    assertContained(root, canonical, 'resolved write target');
    if (!info.isFile()) invalid('Broker write target must be a regular file.', { path: inputPath });
  } catch (cause) {
    if (cause?.code !== 'ENOENT') throw cause;
  }
  return lexical;
}

async function atomicWrite(path, content) {
  const temp = join(dirname(path), `.mnfs-as02-${randomUUID()}.tmp`);
  try {
    await writeFile(temp, content, { flag: 'wx', mode: 0o600 });
    await rename(temp, path);
  } finally {
    await rm(temp, { force: true });
  }
}

function strictFields(operation) {
  const fields = OPERATION_FIELDS[operation.operation];
  if (!fields) invalid('Unknown broker operation.', { operation: operation.operation });
  for (const key of Object.keys(operation)) {
    if (!fields.has(key)) invalid(`Unknown field for ${operation.operation}: ${key}.`, { key });
  }
}

export function validateOperation(value, boundary) {
  assertPlainObject(value, 'operation');
  const normalizedBoundary = canonicalBoundary(boundary);
  strictFields(value);

  switch (value.operation) {
    case 'bash':
      return {
        operation: 'bash',
        command: boundedString(value.command, 'command', normalizedBoundary.maxInputBytes),
        timeoutMs: positiveInteger(value.timeoutMs, 'timeoutMs', DEFAULT_TIMEOUT_MS, MAX_TIMEOUT_MS),
      };
    case 'read':
      return {
        operation: 'read',
        path: lexicalTarget(normalizedBoundary.worktreePath, value.path),
        offset: nonNegativeInteger(value.offset, 'offset'),
        limit: positiveInteger(value.limit, 'limit', normalizedBoundary.maxOutputBytes, normalizedBoundary.maxOutputBytes),
      };
    case 'write':
      return {
        operation: 'write',
        path: lexicalTarget(normalizedBoundary.worktreePath, value.path),
        content: boundedString(value.content, 'content', normalizedBoundary.maxInputBytes, { allowEmpty: true }),
      };
    case 'edit':
      return {
        operation: 'edit',
        path: lexicalTarget(normalizedBoundary.worktreePath, value.path),
        oldText: boundedString(value.oldText, 'oldText', normalizedBoundary.maxInputBytes),
        newText: boundedString(value.newText, 'newText', normalizedBoundary.maxInputBytes, { allowEmpty: true }),
      };
    case 'grep':
      return {
        operation: 'grep',
        path: lexicalTarget(normalizedBoundary.worktreePath, value.path),
        query: boundedString(value.query, 'query', normalizedBoundary.maxInputBytes),
        maxResults: positiveInteger(value.maxResults, 'maxResults', DEFAULT_LIMIT, 10_000),
      };
    case 'find':
      return {
        operation: 'find',
        path: lexicalTarget(normalizedBoundary.worktreePath, value.path),
        pattern: boundedString(value.pattern, 'pattern', normalizedBoundary.maxInputBytes),
        maxResults: positiveInteger(value.maxResults, 'maxResults', DEFAULT_LIMIT, 10_000),
      };
    case 'ls':
      return {
        operation: 'ls',
        path: lexicalTarget(normalizedBoundary.worktreePath, value.path),
        maxEntries: positiveInteger(value.maxEntries, 'maxEntries', DEFAULT_LIMIT, 10_000),
      };
    default:
      invalid('Unknown broker operation.', { operation: value.operation });
  }
}

async function walk(root, startPath) {
  const start = await existingPath(root, portableRelative(root, startPath), 'directory');
  const files = [];
  const directories = [start.canonical];
  while (directories.length > 0) {
    const current = directories.shift();
    const entries = (await readdir(current, { withFileTypes: true })).sort((left, right) => left.name.localeCompare(right.name));
    for (const entry of entries) {
      const path = join(current, entry.name);
      if (entry.isSymbolicLink()) continue;
      if (entry.isDirectory()) directories.push(path);
      else if (entry.isFile()) files.push(path);
    }
    directories.sort();
  }
  return files.sort();
}

function truncateBuffer(buffer, maxBytes) {
  const truncated = buffer.length > maxBytes;
  return {
    text: buffer.subarray(0, maxBytes).toString('utf8'),
    truncated,
  };
}

export async function executeOperation(value, boundary, { runner = runProcess } = {}) {
  const normalizedBoundary = canonicalBoundary(boundary);
  const operation = validateOperation(value, normalizedBoundary);

  switch (operation.operation) {
    case 'bash': { // shell executes inside the already-established SRT boundary.
      const result = await runner({
        file: '/bin/bash',
        args: ['-c', operation.command],
        cwd: normalizedBoundary.cwd,
        env: normalizedBoundary.env,
        timeoutMs: operation.timeoutMs,
        killProcessGroup: true,
      });
      const stdout = truncateBuffer(result.stdout, normalizedBoundary.maxOutputBytes);
      const stderr = truncateBuffer(result.stderr, normalizedBoundary.maxOutputBytes);
      return {
        operation: 'bash',
        exitCode: result.exitCode,
        signal: result.signal,
        stdout: stdout.text,
        stderr: stderr.text,
        stdoutTruncated: stdout.truncated,
        stderrTruncated: stderr.truncated,
        startedAt: result.startedAt,
        finishedAt: result.finishedAt,
      };
    }
    case 'read': {
      const target = await existingPath(normalizedBoundary.worktreePath, operation.path, 'file');
      const content = await readFile(target.canonical);
      const requested = content.subarray(operation.offset, operation.offset + operation.limit);
      return {
        operation: 'read',
        path: portableRelative(normalizedBoundary.worktreePath, target.canonical),
        text: requested.toString('utf8'),
        bytes: requested.length,
        truncated: false,
      };
    }
    case 'write': {
      const target = await writablePath(normalizedBoundary.worktreePath, operation.path);
      const content = Buffer.from(operation.content, 'utf8');
      await atomicWrite(target, content);
      return {
        operation: 'write',
        path: portableRelative(normalizedBoundary.worktreePath, target),
        bytes: content.length,
      };
    }
    case 'edit': {
      const target = await existingPath(normalizedBoundary.worktreePath, operation.path, 'file');
      const content = await readFile(target.canonical, 'utf8');
      const matches = content.split(operation.oldText).length - 1;
      if (matches !== 1) {
        throw as02Error('BROKER_EDIT_MATCH_COUNT', 'Edit requires exactly one old-text match.', {
          path: portableRelative(normalizedBoundary.worktreePath, target.canonical),
          matches,
        });
      }
      const updated = content.replace(operation.oldText, operation.newText);
      if (Buffer.byteLength(updated, 'utf8') > normalizedBoundary.maxInputBytes) {
        throw as02Error('BROKER_INPUT_TOO_LARGE', 'Edited file exceeds the broker input limit.');
      }
      await atomicWrite(target.canonical, updated);
      return {
        operation: 'edit',
        path: portableRelative(normalizedBoundary.worktreePath, target.canonical),
        replacements: 1,
      };
    }
    case 'ls': {
      const target = await existingPath(normalizedBoundary.worktreePath, operation.path, 'directory');
      const all = (await readdir(target.canonical, { withFileTypes: true }))
        .sort((left, right) => left.name.localeCompare(right.name))
        .map((entry) => ({
          name: entry.name,
          type: entry.isSymbolicLink()
            ? 'symlink'
            : entry.isDirectory()
              ? 'directory'
              : entry.isFile()
                ? 'file'
                : 'other',
        }));
      return {
        operation: 'ls',
        path: portableRelative(normalizedBoundary.worktreePath, target.canonical),
        entries: all.slice(0, operation.maxEntries),
        truncated: all.length > operation.maxEntries,
      };
    }
    case 'find': {
      const files = await walk(normalizedBoundary.worktreePath, operation.path);
      const matches = files
        .filter((path) => portableRelative(normalizedBoundary.worktreePath, path).includes(operation.pattern))
        .map((path) => portableRelative(normalizedBoundary.worktreePath, path));
      return {
        operation: 'find',
        paths: matches.slice(0, operation.maxResults),
        truncated: matches.length > operation.maxResults,
      };
    }
    case 'grep': {
      const files = await walk(normalizedBoundary.worktreePath, operation.path);
      const matches = [];
      let truncated = false;
      outer: for (const path of files) {
        const info = await stat(path);
        if (info.size > SEARCH_FILE_LIMIT_BYTES) continue;
        const text = await readFile(path, 'utf8');
        const lines = text.split(/\r?\n/u);
        for (let index = 0; index < lines.length; index += 1) {
          const column = lines[index].indexOf(operation.query);
          if (column === -1) continue;
          if (matches.length === operation.maxResults) {
            truncated = true;
            break outer;
          }
          matches.push({
            path: portableRelative(normalizedBoundary.worktreePath, path),
            line: index + 1,
            column: column + 1,
            text: lines[index].slice(0, normalizedBoundary.maxOutputBytes),
          });
        }
      }
      return { operation: 'grep', matches, truncated };
    }
    default:
      throw as02Error('BROKER_OPERATION_INVALID', 'Unhandled broker operation.');
  }
}
