import { lstatSync, realpathSync } from 'node:fs';
import { TextDecoder } from 'node:util';
import { dirname, isAbsolute } from 'node:path';

import { assertTc01, tc01Error } from './errors.mjs';
import { assertLinuxOwnedAbsolutePath } from './paths.mjs';
import { runProcess } from './process-runner.mjs';

const TREEHOUSE_TIMEOUT_MS = 30_000;
const TREEHOUSE_OUTPUT_LIMIT_BYTES = 65_536;
const UTF8_DECODER = new TextDecoder('utf-8', { fatal: true });
const STATUS_VALUES = new Set(['available', 'dirty', 'in-use', 'leased', "you're here"]);

function compareCodeUnits(left, right) {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function assertControlledString(value, label, { allowEmpty = false } = {}) {
  assertTc01(typeof value === 'string', 'TC01_INVALID_INPUT', `${label} must be a string.`, { label });
  assertTc01(!/[\r\n\0]/u.test(value), 'TC01_INVALID_INPUT', `${label} contains a forbidden control character.`, { label });
  if (!allowEmpty) {
    assertTc01(value.length > 0 && value.trim() === value, 'TC01_INVALID_INPUT', `${label} must be non-empty and trimmed.`, { label });
  }
  return value;
}

function existingCanonicalPath(value, label, kind) {
  assertControlledString(value, label);
  const safe = assertLinuxOwnedAbsolutePath(value, label);
  let real;
  let stat;
  try {
    real = realpathSync(safe);
    stat = lstatSync(real);
  } catch (error) {
    throw tc01Error('TC01_INVALID_INPUT', `${label} must exist.`, {
      label,
      value: safe,
      cause: error instanceof Error ? error.message : String(error),
    });
  }
  assertTc01(real === safe, 'TC01_INVALID_INPUT', `${label} must already be canonical.`, { label, value: safe, real });
  if (kind === 'file') {
    assertTc01(stat.isFile(), 'TC01_INVALID_INPUT', `${label} must be a file.`, { label, value: real });
  } else if (kind === 'directory') {
    assertTc01(stat.isDirectory(), 'TC01_INVALID_INPUT', `${label} must be a directory.`, { label, value: real });
  }
  return real;
}

function controlledOutputPath(value, label) {
  assertControlledString(value, label);
  const safe = assertLinuxOwnedAbsolutePath(value, label);
  assertTc01(isAbsolute(safe), 'TC01_INVALID_INPUT', `${label} must be absolute.`, { label, value: safe });
  return safe;
}

function assertExactKeys(value, expected, label) {
  assertTc01(value && typeof value === 'object' && !Array.isArray(value), 'TC01_TREEHOUSE_INVALID_OUTPUT', `${label} must be an object.`);
  const actual = Object.keys(value).sort(compareCodeUnits);
  const canonicalExpected = [...expected].sort(compareCodeUnits);
  assertTc01(
    JSON.stringify(actual) === JSON.stringify(canonicalExpected),
    'TC01_TREEHOUSE_INVALID_OUTPUT',
    `${label} has an unexpected shape.`,
    { actual, expected: canonicalExpected },
  );
}

function outputString(value, label, { allowEmpty = false } = {}) {
  assertTc01(typeof value === 'string', 'TC01_TREEHOUSE_INVALID_OUTPUT', `${label} must be a string.`, { label });
  assertTc01(!/[\r\n\0]/u.test(value), 'TC01_TREEHOUSE_INVALID_OUTPUT', `${label} contains a forbidden control character.`, { label });
  if (!allowEmpty) {
    assertTc01(value.length > 0 && value.trim() === value, 'TC01_TREEHOUSE_INVALID_OUTPUT', `${label} must be non-empty and trimmed.`, { label });
  }
  return value;
}

function outputDate(value, label) {
  outputString(value, label);
  assertTc01(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/u.test(value)
      && Number.isFinite(Date.parse(value)),
    'TC01_TREEHOUSE_INVALID_OUTPUT',
    `${label} must be a valid RFC 3339 timestamp.`,
    { label, value },
  );
  return value;
}

function parseJson(bytes, label) {
  let text;
  try {
    text = UTF8_DECODER.decode(bytes);
  } catch (error) {
    throw tc01Error('TC01_TREEHOUSE_INVALID_OUTPUT', `${label} is not valid UTF-8.`, {
      cause: error instanceof Error ? error.message : String(error),
    });
  }
  try {
    return JSON.parse(text);
  } catch (error) {
    throw tc01Error('TC01_TREEHOUSE_INVALID_OUTPUT', `${label} is not exactly one JSON value.`, {
      excerpt: text.slice(0, 4_096),
      cause: error instanceof Error ? error.message : String(error),
    });
  }
}

function canonicalObservedPath(value, label) {
  outputString(value, label);
  let safe;
  try {
    safe = assertLinuxOwnedAbsolutePath(value, label);
  } catch (error) {
    if (error?.code === 'TC01_LINUX_FILESYSTEM_REQUIRED') throw error;
    throw tc01Error('TC01_TREEHOUSE_INVALID_OUTPUT', `${label} is not a valid absolute Linux path.`, {
      value,
      cause: error instanceof Error ? error.message : String(error),
    });
  }
  let real;
  try {
    real = realpathSync(safe);
  } catch (error) {
    throw tc01Error('TC01_TREEHOUSE_INVALID_OUTPUT', `${label} does not resolve to an existing path.`, {
      value: safe,
      cause: error instanceof Error ? error.message : String(error),
    });
  }
  assertTc01(real === value, 'TC01_TREEHOUSE_INVALID_OUTPUT', `${label} must be one canonical realpath.`, { value, real });
  return real;
}

function commandFailure(command, result) {
  return tc01Error('TC01_COMMAND_FAILED', `Treehouse ${command} failed.`, {
    command,
    exitCode: result.exitCode,
    signal: result.signal,
    stdout: result.stdout,
    stderr: result.stderr,
  });
}

function prepareClient(input) {
  assertTc01(input && typeof input === 'object' && !Array.isArray(input), 'TC01_INVALID_INPUT', 'Treehouse client input must be an object.');
  const environment = buildTreehouseEnvironment(input);
  const treehouseExecutable = existingCanonicalPath(input.treehouseExecutable, 'Treehouse executable', 'file');
  const sourceRepo = existingCanonicalPath(input.fixture.sourceRepo, 'Treehouse source repository', 'directory');
  const run = input.run ?? runProcess;
  assertTc01(typeof run === 'function', 'TC01_INVALID_INPUT', 'Treehouse process runner is required.');
  return { environment, treehouseExecutable, sourceRepo, run };
}

async function invokeTreehouse(input, args) {
  const prepared = prepareClient(input);
  return prepared.run({
    file: prepared.treehouseExecutable,
    args,
    cwd: prepared.sourceRepo,
    env: prepared.environment,
    timeoutMs: TREEHOUSE_TIMEOUT_MS,
    stdoutLimitBytes: TREEHOUSE_OUTPUT_LIMIT_BYTES,
    stderrLimitBytes: TREEHOUSE_OUTPUT_LIMIT_BYTES,
  });
}

export function buildTreehouseEnvironment(input) {
  assertTc01(input && typeof input === 'object' && !Array.isArray(input), 'TC01_INVALID_INPUT', 'Treehouse environment input must be an object.');
  assertTc01(input.fixture && typeof input.fixture === 'object' && !Array.isArray(input.fixture), 'TC01_INVALID_INPUT', 'Treehouse fixture is required.');

  const sourceRepo = existingCanonicalPath(input.fixture.sourceRepo, 'Treehouse source repository', 'directory');
  const fakeHome = existingCanonicalPath(input.fixture.fakeHome, 'Treehouse fake HOME', 'directory');
  const gitWrapperDir = existingCanonicalPath(input.gitWrapperDir, 'Git wrapper directory', 'directory');
  const treehouseExecutable = existingCanonicalPath(input.treehouseExecutable, 'Treehouse executable', 'file');
  const realGit = existingCanonicalPath(input.realGit, 'Real Git executable', 'file');
  const gitLog = controlledOutputPath(input.gitLog, 'Git invocation log');

  assertTc01(sourceRepo !== fakeHome, 'TC01_INVALID_INPUT', 'Treehouse source repository and fake HOME must be distinct.');

  return {
    PATH: `${gitWrapperDir}:${dirname(treehouseExecutable)}:${dirname(realGit)}:/usr/bin:/bin`,
    HOME: fakeHome,
    LANG: 'C.UTF-8',
    LC_ALL: 'C.UTF-8',
    GIT_TERMINAL_PROMPT: '0',
    GIT_OPTIONAL_LOCKS: '0',
    GIT_CONFIG_NOSYSTEM: '1',
    TREEHOUSE_NO_UPDATE_CHECK: '1',
    TC01_REAL_GIT: realGit,
    TC01_GIT_LOG: gitLog,
  };
}

export async function acquireTreehouseLease(input) {
  const holder = assertControlledString(input?.holder, 'Treehouse lease holder');
  const result = await invokeTreehouse(input, ['get', '--lease', '--lease-holder', holder, '--json']);
  if (result.exitCode !== 0) throw commandFailure('get', result);

  const value = parseJson(result.stdout, 'Treehouse acquisition stdout');
  assertExactKeys(value, ['path', 'lease_id', 'lease_holder', 'leased_at'], 'Treehouse acquisition');

  const path = canonicalObservedPath(value.path, 'Treehouse acquisition path');
  const leaseId = outputString(value.lease_id, 'Treehouse acquisition lease_id');
  const leaseHolder = outputString(value.lease_holder, 'Treehouse acquisition lease_holder');
  const leasedAt = outputDate(value.leased_at, 'Treehouse acquisition leased_at');
  assertTc01(leaseHolder === holder, 'TC01_TREEHOUSE_INVALID_OUTPUT', 'Treehouse acquisition holder does not match the request.', {
    expected: holder,
    actual: leaseHolder,
  });

  return { path, leaseId, leaseHolder, leasedAt };
}

export async function observeTreehouseStatus(input) {
  const result = await invokeTreehouse(input, ['status', '--json']);
  if (result.exitCode !== 0) throw commandFailure('status', result);

  const value = parseJson(result.stdout, 'Treehouse status stdout');
  assertTc01(Array.isArray(value), 'TC01_TREEHOUSE_INVALID_OUTPUT', 'Treehouse status must be a JSON array.');
  const seenPaths = new Set();

  return value.map((item, index) => {
    assertExactKeys(item, ['name', 'path', 'status', 'lease_id', 'lease_holder', 'leased_at', 'processes'], `Treehouse status item ${index}`);
    const name = outputString(item.name, `Treehouse status item ${index} name`);
    const path = canonicalObservedPath(item.path, `Treehouse status item ${index} path`);
    const status = outputString(item.status, `Treehouse status item ${index} status`);
    assertTc01(STATUS_VALUES.has(status), 'TC01_TREEHOUSE_INVALID_OUTPUT', 'Treehouse status item has an unknown status.', { index, status });
    const leaseId = outputString(item.lease_id, `Treehouse status item ${index} lease_id`, { allowEmpty: true });
    const leaseHolder = outputString(item.lease_holder, `Treehouse status item ${index} lease_holder`, { allowEmpty: true });
    const leasedAt = item.leased_at === null ? null : outputDate(item.leased_at, `Treehouse status item ${index} leased_at`);

    assertTc01(Array.isArray(item.processes), 'TC01_TREEHOUSE_INVALID_OUTPUT', 'Treehouse status processes must be an array.', { index });
    const processes = item.processes.map((process, processIndex) => {
      assertExactKeys(process, ['pid', 'name'], `Treehouse status item ${index} process ${processIndex}`);
      assertTc01(Number.isSafeInteger(process.pid) && process.pid > 0, 'TC01_TREEHOUSE_INVALID_OUTPUT', 'Treehouse process pid must be a positive integer.', {
        index,
        processIndex,
        pid: process.pid,
      });
      return {
        pid: process.pid,
        name: outputString(process.name, `Treehouse status item ${index} process ${processIndex} name`),
      };
    });

    if (status === 'leased') {
      assertTc01(leaseId.length > 0 && leasedAt !== null, 'TC01_TREEHOUSE_INVALID_OUTPUT', 'A leased Treehouse item requires lease identity and timestamp.', { index, path });
    } else {
      assertTc01(leaseId === '' && leaseHolder === '' && leasedAt === null, 'TC01_TREEHOUSE_INVALID_OUTPUT', 'A non-leased Treehouse item must not carry lease metadata.', {
        index,
        path,
        status,
      });
    }

    assertTc01(!seenPaths.has(path), 'TC01_TREEHOUSE_INVALID_OUTPUT', 'Treehouse status contains duplicate canonical paths.', { path });
    seenPaths.add(path);
    return { name, path, status, leaseId, leaseHolder, leasedAt, processes };
  });
}

export async function returnTreehouseLease(input) {
  const path = controlledOutputPath(input?.path, 'Treehouse return path');
  const leaseId = assertControlledString(input?.leaseId, 'Treehouse return lease ID');
  const holder = assertControlledString(input?.holder, 'Treehouse return holder');
  return invokeTreehouse(input, ['return', path, '--if-lease-id', leaseId, '--if-lease-holder', holder]);
}

export function findStatusByPath(status, expectedPath) {
  assertTc01(Array.isArray(status), 'TC01_INVALID_INPUT', 'Treehouse status collection must be an array.');
  const safeExpectedPath = assertLinuxOwnedAbsolutePath(expectedPath, 'expected Treehouse status path');
  return status.find((item) => item?.path === safeExpectedPath) ?? null;
}
