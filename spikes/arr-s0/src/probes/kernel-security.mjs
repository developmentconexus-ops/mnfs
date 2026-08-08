import { access as fsAccess, readFile as fsReadFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { runProbeCommand } from '../process.mjs';

const CONFIG_KEYS = Object.freeze([
  'CONFIG_SECCOMP',
  'CONFIG_SECCOMP_FILTER',
  'CONFIG_SECURITY_LANDLOCK',
  'CONFIG_USER_NS',
  'CONFIG_FUSE_FS',
]);
const FIXED_ENV = Object.freeze({ PATH: '/usr/bin:/bin', LANG: 'C', LC_ALL: 'C' });
const LIMIT = 1024 * 1024;

export function parseKernelConfig(text) {
  const accepted = new Set(CONFIG_KEYS);
  const result = {};
  for (const line of String(text ?? '').split(/\r?\n/u)) {
    const match = line.match(/^([A-Z0-9_]+)=(.+)$/u);
    if (match && accepted.has(match[1])) result[match[1]] = match[2].trim();
  }
  return result;
}

async function boundedRead(readFile, target) {
  const bytes = Buffer.from(await readFile(target));
  if (bytes.length > LIMIT) throw new Error(`kernel config source exceeds ${LIMIT} bytes: ${target}`);
  return bytes;
}

export async function discoverKernelConfig({ kernelRelease, readFile = fsReadFile } = {}) {
  try {
    const zipped = await boundedRead(readFile, '/proc/config.gz');
    return { source: '/proc/config.gz', text: gunzipSync(zipped).toString('utf8') };
  } catch (error) {
    if (!['ENOENT', 'EACCES', 'EPERM'].includes(error?.code) && error?.code !== undefined) throw error;
  }

  const bootPath = `/boot/config-${kernelRelease}`;
  try {
    const bytes = await boundedRead(readFile, bootPath);
    return { source: bootPath, text: bytes.toString('utf8') };
  } catch (error) {
    if (['ENOENT', 'EACCES', 'EPERM'].includes(error?.code)) return { source: null, text: null };
    throw error;
  }
}

function configState(configText, keys) {
  if (configText == null) return 'UNKNOWN';
  const parsed = parseKernelConfig(configText);
  return keys.every((key) => parsed[key] === 'y') ? 'SUPPORTED' : 'UNSUPPORTED';
}

export function configBackedSecurityObservations(configText) {
  const seccompState = configState(configText, ['CONFIG_SECCOMP', 'CONFIG_SECCOMP_FILTER']);
  const landlockState = configState(configText, ['CONFIG_SECURITY_LANDLOCK']);
  return {
    seccomp: {
      id: 'HOST-SECCOMP-CONFIG',
      state: seccompState,
      rationale: seccompState === 'UNKNOWN'
        ? 'kernel config sources were unavailable; seccomp support is unknown'
        : seccompState === 'SUPPORTED'
          ? 'CONFIG_SECCOMP=y and CONFIG_SECCOMP_FILTER=y'
          : 'required generic seccomp kernel config flags are not all enabled',
      artifactRefs: [],
    },
    landlock: {
      id: 'HOST-LANDLOCK-CONFIG',
      state: landlockState,
      rationale: landlockState === 'UNKNOWN'
        ? 'kernel config sources were unavailable; Landlock support is unknown'
        : landlockState === 'SUPPORTED'
          ? 'CONFIG_SECURITY_LANDLOCK=y; specific Landlock ABI remains unproved'
          : 'CONFIG_SECURITY_LANDLOCK=y was not observed',
      artifactRefs: [],
    },
  };
}

async function defaultExecutableExists(target) {
  try {
    await fsAccess(target, constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

export async function observeUserNamespace({
  configText,
  executableExists = defaultExecutableExists,
  runCommand = runProbeCommand,
} = {}) {
  const config = configState(configText, ['CONFIG_USER_NS']);
  const exists = await executableExists('/usr/bin/unshare');
  if (!exists) {
    return {
      id: 'HOST-USERNS',
      state: config === 'UNSUPPORTED' ? 'UNSUPPORTED' : 'UNKNOWN',
      rationale: config === 'UNSUPPORTED'
        ? 'CONFIG_USER_NS=y was not observed'
        : 'CONFIG_USER_NS may be enabled but /usr/bin/unshare is unavailable for the bounded active smoke',
      artifactRefs: [],
    };
  }

  const result = await runCommand({
    argv: ['/usr/bin/unshare', '--user', '--map-root-user', '/usr/bin/id', '-u'],
    cwd: '/',
    env: { ...FIXED_ENV },
    timeoutMs: 5000,
    outputLimitBytes: 16 * 1024,
  });
  if (result.exitCode === 0 && result.stdout.toString('utf8').trim() === '0') {
    return {
      id: 'HOST-USERNS',
      state: 'SUPPORTED',
      rationale: 'ephemeral unshare user namespace smoke succeeded with mapped uid 0',
      artifactRefs: [],
    };
  }
  const stderr = result.stderr.toString('utf8');
  if (/operation not permitted|permission denied|not supported|unsupported/iu.test(stderr)) {
    return {
      id: 'HOST-USERNS',
      state: 'UNSUPPORTED',
      rationale: 'ephemeral unshare user namespace smoke was denied or unsupported',
      artifactRefs: [],
    };
  }
  return {
    id: 'HOST-USERNS',
    state: 'UNKNOWN',
    rationale: `ephemeral unshare smoke was inconclusive (exit ${result.exitCode})`,
    artifactRefs: [],
  };
}

export function fuseKernelConfigState(configText) {
  return configState(configText, ['CONFIG_FUSE_FS']);
}
