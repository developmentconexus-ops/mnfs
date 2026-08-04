import { createHash } from 'node:crypto';
import { constants } from 'node:fs';
import { access, readFile, realpath } from 'node:fs/promises';
import { delimiter, dirname, isAbsolute, join } from 'node:path';

import { assertTc01, tc01Error } from './errors.mjs';
import { assertLinuxOwnedAbsolutePath } from './paths.mjs';
import { runProcess as defaultRunProcess } from './process-runner.mjs';

const EXPECTED_TREEHOUSE_VERSION = '2.1.1';
const COMMAND_TIMEOUT_MS = 5_000;
const REQUIRED_CAPABILITIES = Object.freeze([
  'leaseJson',
  'statusJson',
  'conditionalLeaseId',
  'conditionalHolder',
]);

function controlledCommandEnvironment(executables) {
  const directories = [];
  for (const executable of executables) {
    const directory = dirname(executable);
    if (!directories.includes(directory)) directories.push(directory);
  }
  for (const directory of ['/usr/bin', '/bin']) {
    if (!directories.includes(directory)) directories.push(directory);
  }
  return {
    PATH: directories.join(delimiter),
    LANG: 'C.UTF-8',
    LC_ALL: 'C.UTF-8',
    GIT_CONFIG_GLOBAL: '/dev/null',
    GIT_CONFIG_NOSYSTEM: '1',
    GIT_TERMINAL_PROMPT: '0',
    NO_COLOR: '1',
    TERM: 'dumb',
    TREEHOUSE_NO_UPDATE_CHECK: '1',
  };
}

export async function discoverTc01Environment(input = {}) {
  const cwd = assertLinuxOwnedAbsolutePath(input.cwd, 'TC-01 discovery cwd');
  const env = input.env ?? process.env;
  const expectedTreehouseVersion = input.expectedTreehouseVersion ?? EXPECTED_TREEHOUSE_VERSION;
  const processRunner = input.runProcess ?? defaultRunProcess;
  const executableResolver = input.resolveExecutable ?? ((name) => resolveExecutableFromPath(name, env));
  const resolveRealpath = input.realpath ?? realpath;
  const readBytes = input.readFile ?? readFile;
  const now = input.now ?? (() => new Date());
  const nodeVersion = input.nodeVersion ?? process.version;
  const osReleasePath = input.osReleasePath ?? '/etc/os-release';

  assertTc01(
    typeof expectedTreehouseVersion === 'string' && expectedTreehouseVersion.length > 0,
    'TC01_INVALID_INPUT',
    'Expected Treehouse version must be a non-empty string.',
    { expectedTreehouseVersion },
  );

  const [unameExecutable, treehouseExecutable, gitExecutable] = await Promise.all([
    resolveAbsoluteExecutable('uname', executableResolver, resolveRealpath),
    resolveAbsoluteExecutable('treehouse', executableResolver, resolveRealpath),
    resolveAbsoluteExecutable('git', executableResolver, resolveRealpath),
  ]);
  const commandEnv = controlledCommandEnvironment([
    unameExecutable,
    treehouseExecutable,
    gitExecutable,
  ]);

  const kernelRelease = await commandText({
    file: unameExecutable,
    args: ['-r'],
    cwd,
    env: commandEnv,
    processRunner,
    label: 'uname -r',
  });
  const normalizedKernel = kernelRelease.toLowerCase();
  assertTc01(
    normalizedKernel.includes('microsoft') && normalizedKernel.includes('wsl2'),
    'TC01_NOT_WSL2',
    'TC-01 provenance requires canonical WSL2 kernel evidence.',
    { kernelRelease },
  );

  const osRelease = parseOsRelease(await readRequiredFile(readBytes, osReleasePath, 'Ubuntu release metadata'));
  assertTc01(
    osRelease.ID === 'ubuntu' && typeof osRelease.VERSION_ID === 'string' && osRelease.VERSION_ID.length > 0,
    'TC01_NOT_WSL2',
    'TC-01 provenance requires an Ubuntu WSL2 distribution.',
    { id: osRelease.ID ?? null, versionId: osRelease.VERSION_ID ?? null },
  );

  const treehouseBytes = await readRequiredFile(readBytes, treehouseExecutable, 'Treehouse executable');
  const treehouseExecutableHash = `sha256:${createHash('sha256').update(treehouseBytes).digest('hex')}`;

  const treehouseVersion = await commandText({
    file: treehouseExecutable,
    args: ['--version'],
    cwd,
    env: commandEnv,
    processRunner,
    label: 'treehouse --version',
  });
  assertTc01(
    treehouseVersion === expectedTreehouseVersion,
    'TC01_VERSION_MISMATCH',
    'Treehouse version does not match the accepted TC-01 candidate.',
    { actual: treehouseVersion, expected: expectedTreehouseVersion },
  );

  const [getHelp, statusHelp, returnHelp] = await Promise.all([
    commandHelp(treehouseExecutable, ['get', '--help'], cwd, commandEnv, processRunner),
    commandHelp(treehouseExecutable, ['status', '--help'], cwd, commandEnv, processRunner),
    commandHelp(treehouseExecutable, ['return', '--help'], cwd, commandEnv, processRunner),
  ]);

  const getFlags = extractFlags(getHelp);
  const statusFlags = extractFlags(statusHelp);
  const returnFlags = extractFlags(returnHelp);
  const capabilities = {
    leaseJson: getFlags.has('--lease') && getFlags.has('--json') && getFlags.has('--lease-holder'),
    statusJson: statusFlags.has('--json'),
    conditionalLeaseId: returnFlags.has('--if-lease-id'),
    conditionalHolder: returnFlags.has('--if-lease-holder'),
  };

  const gitOutput = await commandText({
    file: gitExecutable,
    args: ['--version'],
    cwd,
    env: commandEnv,
    processRunner,
    label: 'git --version',
  });
  const gitMatch = /^git version ([^\s]+)$/u.exec(gitOutput);
  assertTc01(
    gitMatch !== null,
    'TC01_VERSION_MISMATCH',
    'Git returned an unrecognized version string.',
    { actual: gitOutput },
  );

  const provenance = {
    schemaVersion: 1,
    environment: 'WSL2',
    ubuntuRelease: osRelease.VERSION_ID,
    kernelRelease,
    nodeVersion,
    gitVersion: gitMatch[1],
    treehouseVersion,
    treehouseExecutable,
    treehouseExecutableHash,
    capabilities,
    capturedAt: now().toISOString(),
  };

  return validateTreehouseCapabilities(provenance);
}

export function validateTreehouseCapabilities(provenance) {
  assertTc01(
    provenance && typeof provenance === 'object' && !Array.isArray(provenance),
    'TC01_INVALID_INPUT',
    'Treehouse provenance must be an object.',
  );
  const capabilities = provenance.capabilities ?? {};
  const missingCapabilities = REQUIRED_CAPABILITIES.filter((name) => capabilities[name] !== true);
  assertTc01(
    missingCapabilities.length === 0,
    'TC01_VERSION_MISMATCH',
    'Treehouse does not expose every capability required by TC-01.',
    { missingCapabilities },
  );
  return provenance;
}

async function resolveExecutableFromPath(name, env) {
  const pathValue = env?.PATH;
  assertTc01(
    typeof pathValue === 'string' && pathValue.length > 0,
    'TC01_TOOL_MISSING',
    `Cannot resolve ${name} because PATH is empty.`,
    { name },
  );

  for (const directory of pathValue.split(delimiter)) {
    if (!directory) continue;
    const candidate = join(directory, name);
    try {
      await access(candidate, constants.X_OK);
      return candidate;
    } catch {
      // Continue to the next exact PATH entry without invoking a shell.
    }
  }
  throw tc01Error('TC01_TOOL_MISSING', `Required executable ${name} was not found.`, { name });
}

async function resolveAbsoluteExecutable(name, executableResolver, resolveRealpath) {
  let candidate;
  try {
    candidate = await executableResolver(name);
  } catch (cause) {
    if (cause?.code?.startsWith?.('TC01_')) throw cause;
    throw tc01Error('TC01_TOOL_MISSING', `Failed to resolve required executable ${name}.`, {
      name,
      causeMessage: cause?.message ?? String(cause),
    });
  }

  assertTc01(
    typeof candidate === 'string' && candidate.length > 0,
    'TC01_TOOL_MISSING',
    `Required executable ${name} did not resolve to a path.`,
    { name, candidate: candidate ?? null },
  );

  let resolved;
  try {
    resolved = await resolveRealpath(candidate);
  } catch (cause) {
    throw tc01Error('TC01_TOOL_MISSING', `Required executable ${name} has no readable realpath.`, {
      name,
      candidate,
      causeMessage: cause?.message ?? String(cause),
    });
  }

  assertTc01(
    typeof resolved === 'string' && isAbsolute(resolved),
    'TC01_TOOL_MISSING',
    `Required executable ${name} must resolve to one absolute realpath.`,
    { name, candidate, resolved },
  );
  return assertLinuxOwnedAbsolutePath(resolved, `${name} executable`);
}

async function readRequiredFile(readBytes, path, label) {
  try {
    return await readBytes(path);
  } catch (cause) {
    throw tc01Error('TC01_TOOL_MISSING', `${label} could not be read.`, {
      path,
      causeMessage: cause?.message ?? String(cause),
    });
  }
}

async function commandHelp(file, args, cwd, env, processRunner) {
  const result = await commandResult({ file, args, cwd, env, processRunner, label: `${args.join(' ')}` });
  return Buffer.concat([result.stdout, Buffer.from('\n'), result.stderr]).toString('utf8');
}

async function commandText(spec) {
  const result = await commandResult(spec);
  return result.stdout.toString('utf8').trim();
}

async function commandResult({ file, args, cwd, env, processRunner, label }) {
  const result = await processRunner({
    file,
    args,
    cwd,
    env,
    timeoutMs: COMMAND_TIMEOUT_MS,
  });
  assertTc01(
    result.exitCode === 0 && result.signal === null && result.timedOut === false,
    'TC01_COMMAND_FAILED',
    `${label} failed during TC-01 provenance discovery.`,
    {
      file,
      args: [...args],
      exitCode: result.exitCode,
      signal: result.signal,
      stderr: result.stderr,
    },
  );
  return result;
}

function extractFlags(helpText) {
  return new Set(helpText.match(/--[a-z0-9-]+/gu) ?? []);
}

function parseOsRelease(bytes) {
  const parsed = {};
  for (const line of Buffer.from(bytes).toString('utf8').split(/\r?\n/u)) {
    if (!line || line.startsWith('#')) continue;
    const separator = line.indexOf('=');
    if (separator <= 0) continue;
    const key = line.slice(0, separator);
    let value = line.slice(separator + 1);
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    parsed[key] = value;
  }
  return parsed;
}
