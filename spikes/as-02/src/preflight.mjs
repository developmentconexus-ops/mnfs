import { lstat as nodeLstat, readFile, realpath as nodeRealpath } from 'node:fs/promises';

import { as02Error, assertAs02 } from './errors.mjs';
import { runProcess } from './process-runner.mjs';

const TOOL_SPECS = Object.freeze({
  node: { file: 'node', args: ['--version'] },
  npm: { file: 'npm', args: ['--version'] },
  pi: { file: 'pi', args: ['--version'] },
  treehouse: { file: 'treehouse', args: ['--version'] },
  bwrap: { file: 'bwrap', args: ['--version'] },
  socat: { file: 'socat', args: ['-V'] },
  rg: { file: 'rg', args: ['--version'] },
  git: { file: 'git', args: ['--version'] },
  bash: { file: '/bin/bash', args: ['--version'] },
  curl: { file: 'curl', args: ['--version'] },
  time: { file: '/usr/bin/time', args: ['--version'] },
});
const REQUIRED_TOOLS = new Set(Object.keys(TOOL_SPECS));
const NODE_FLOOR = [24, 18, 0];
const OUTPUT_LIMIT = 8_192;

function bounded(buffer) {
  return buffer.toString('utf8').slice(0, OUTPUT_LIMIT);
}

function parseOsRelease(text) {
  const result = {};
  for (const line of text.split(/\r?\n/u)) {
    if (line.length === 0 || line.startsWith('#')) continue;
    const index = line.indexOf('=');
    if (index <= 0) continue;
    const key = line.slice(0, index);
    let value = line.slice(index + 1);
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  }
  return result;
}

function nodeVersionSupported(version) {
  const match = /^v?(\d+)\.(\d+)\.(\d+)/u.exec(version);
  if (!match) return false;
  const observed = match.slice(1).map(Number);
  for (let index = 0; index < NODE_FLOOR.length; index += 1) {
    if (observed[index] > NODE_FLOOR[index]) return true;
    if (observed[index] < NODE_FLOOR[index]) return false;
  }
  return true;
}

async function safeRead(readText, path) {
  try {
    return await readText(path);
  } catch (cause) {
    return Object.assign('', {
      readError: cause instanceof Error ? cause.message : String(cause),
    });
  }
}

async function inspectTool(name, spec, context) {
  let observed;
  try {
    observed = await context.runner({
      file: spec.file,
      args: [...spec.args],
      cwd: context.repositoryPath,
      env: { PATH: context.path },
      timeoutMs: 10_000,
    });
  } catch (cause) {
    return {
      available: false,
      version: '',
      exitCode: null,
      signal: null,
      stderr: cause instanceof Error ? cause.message.slice(0, OUTPUT_LIMIT) : String(cause).slice(0, OUTPUT_LIMIT),
    };
  }
  const stdout = bounded(observed.stdout).trim();
  const stderr = bounded(observed.stderr).trim();
  return {
    available: observed.exitCode === 0,
    version: (stdout || stderr).split(/\r?\n/u)[0] ?? '',
    exitCode: observed.exitCode,
    signal: observed.signal,
    stderr,
  };
}

function architectureFrom(uname) {
  return /\b(?:x86_64|amd64)\b/iu.test(uname)
    ? 'x86_64'
    : /\b(?:aarch64|arm64)\b/iu.test(uname)
      ? 'aarch64'
      : 'unknown';
}

function dependencyHostPolicyBlock(runtime) {
  const evidence = [...(runtime.errors ?? []), ...(runtime.warnings ?? [])].join('\n');
  return /apparmor|user\s*namespace|unprivileged|permission denied/iu.test(evidence);
}

export function classifyPreflight(report) {
  const allowed = new Set(['READY', 'BLOCKED_BY_HOST_POLICY', 'PREFLIGHT_FAILED']);
  assertAs02(report && typeof report === 'object' && allowed.has(report.status), 'PREFLIGHT_INVALID', 'Preflight report has an invalid status.');
  return report.status;
}

export async function runPreflight({
  repositoryPath,
  runner = runProcess,
  env = process.env,
  readText = (path) => readFile(path, 'utf8'),
  realpath = nodeRealpath,
  lstat = nodeLstat,
  checkSandboxDependencies,
}) {
  assertAs02(typeof repositoryPath === 'string' && repositoryPath.length > 0, 'PREFLIGHT_INVALID', 'repositoryPath is required.');
  assertAs02(typeof runner === 'function', 'PREFLIGHT_INVALID', 'runner is required.');
  assertAs02(typeof checkSandboxDependencies === 'function', 'PREFLIGHT_INVALID', 'checkSandboxDependencies is required.');
  const path = typeof env.PATH === 'string' ? env.PATH : '';
  const exactRepository = await realpath(repositoryPath);
  const context = { runner, repositoryPath: exactRepository, path };

  const procVersion = await safeRead(readText, '/proc/version');
  const osReleaseText = await safeRead(readText, '/etc/os-release');
  const apparmorText = await safeRead(readText, '/proc/sys/kernel/apparmor_restrict_unprivileged_userns');
  const usernsText = await safeRead(readText, '/proc/sys/kernel/unprivileged_userns_clone');
  const unameResult = await runner({
    file: 'uname',
    args: ['-a'],
    cwd: exactRepository,
    env: { PATH: path },
    timeoutMs: 10_000,
  });
  const uname = bounded(unameResult.stdout).trim();
  const isWsl = typeof env.WSL_DISTRO_NAME === 'string' || /microsoft|wsl2?/iu.test(`${procVersion}\n${uname}`);

  const tools = {};
  for (const [name, spec] of Object.entries(TOOL_SPECS)) {
    tools[name] = await inspectTool(name, spec, context);
  }

  let sandboxRuntime;
  try {
    const checked = await checkSandboxDependencies();
    sandboxRuntime = {
      errors: Array.isArray(checked?.errors) ? checked.errors.map(String) : [],
      warnings: Array.isArray(checked?.warnings) ? checked.warnings.map(String) : [],
    };
  } catch (cause) {
    sandboxRuntime = {
      errors: [cause instanceof Error ? cause.message : String(cause)],
      warnings: [],
    };
  }

  let dockerSocket = 'NOT_PRESENT';
  try {
    const info = await lstat('/var/run/docker.sock');
    dockerSocket = typeof info.isSocket === 'function' && info.isSocket()
      ? 'PRESENT_NOT_OPENED'
      : 'PRESENT_NON_SOCKET_NOT_OPENED';
  } catch (cause) {
    if (cause?.code !== 'ENOENT') dockerSocket = 'OBSERVATION_FAILED';
  }

  const report = {
    status: 'READY',
    environment: {
      wsl: isWsl,
      distro: typeof env.WSL_DISTRO_NAME === 'string' ? env.WSL_DISTRO_NAME : '',
      procVersion: String(procVersion).slice(0, OUTPUT_LIMIT),
      uname,
      architecture: architectureFrom(uname),
      osRelease: parseOsRelease(String(osReleaseText)),
    },
    repository: {
      path: exactRepository,
      linuxFilesystem: exactRepository !== '/mnt' && !exactRepository.startsWith('/mnt/'),
    },
    tools,
    hostPolicy: {
      apparmorRestrictsUnprivilegedUserns: String(apparmorText).trim() === '1',
      unprivilegedUsernsClone: String(usernsText).trim() === '1',
      raw: {
        apparmorRestrictUnprivilegedUserns: String(apparmorText).trim(),
        unprivilegedUsernsClone: String(usernsText).trim(),
      },
    },
    primitives: { dockerSocket },
    sandboxRuntime,
    defects: [],
  };

  if (!report.environment.wsl) {
    report.defects.push({ code: 'NOT_WSL2', message: 'Canonical AS-02 execution requires Ubuntu under WSL2.' });
  }
  if (!report.repository.linuxFilesystem) {
    report.defects.push({ code: 'REPOSITORY_ON_WINDOWS_MOUNT', message: 'Repository must not run under /mnt.' });
  }
  for (const name of REQUIRED_TOOLS) {
    if (!tools[name].available) {
      report.defects.push({ code: 'REQUIRED_TOOL_MISSING', tool: name, message: `${name} is unavailable.` });
    }
  }
  if (!nodeVersionSupported(tools.node.version)) {
    report.defects.push({ code: 'NODE_VERSION_UNSUPPORTED', message: 'Node.js 24.18.0 or newer supported v24 is required.' });
  }
  if (sandboxRuntime.errors.length > 0) {
    if (dependencyHostPolicyBlock(sandboxRuntime)) {
      report.defects.push({ code: 'SANDBOX_HOST_POLICY_BLOCK', message: 'Host policy prevents Sandbox Runtime dependencies.' });
    } else {
      report.defects.push({ code: 'SANDBOX_DEPENDENCY_FAILED', message: 'Sandbox Runtime dependency check failed.' });
    }
  }

  report.status = report.defects.some((defect) => defect.code === 'SANDBOX_HOST_POLICY_BLOCK')
    ? 'BLOCKED_BY_HOST_POLICY'
    : report.defects.length > 0
      ? 'PREFLIGHT_FAILED'
      : 'READY';
  return report;
}
