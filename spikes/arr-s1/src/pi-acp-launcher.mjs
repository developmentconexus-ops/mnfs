import { createHash } from 'node:crypto';
import { chmod, lstat, mkdir, readFile, realpath, writeFile } from 'node:fs/promises';
import path from 'node:path';

const EXECUTABLE_MODE = 0o700;
const HASH_PATTERN = /^sha256:[a-f0-9]{64}$/u;

function sha256(bytes) {
  return `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
}

function absolute(value, name) {
  if (typeof value !== 'string' || value.length === 0 || !path.posix.isAbsolute(value) || value.includes('\0')) {
    throw new TypeError(`${name} must be an absolute path`);
  }
  return path.posix.normalize(value);
}

function owned(runRoot, value) {
  return value === runRoot || value.startsWith(`${runRoot}/`);
}

function modeText(mode) {
  return `0${(mode & 0o777).toString(8).padStart(3, '0')}`;
}

function shellQuote(value) {
  return `'${value.replaceAll("'", "'\\\"'\\\"'")}'`;
}

export async function createTrustedPiAcpLauncher({ runRoot, wrapperPath } = {}) {
  const root = absolute(runRoot, 'Pi-ACP launcher runRoot');
  const helper = absolute(wrapperPath, 'Pi-ACP launcher helper');
  const launcherPath = path.posix.join(root, '.mnfs-pi-acp-launcher');
  if (!owned(root, launcherPath)) throw new TypeError('Pi-ACP launcher must be owned by runRoot');
  await mkdir(root, { recursive: true });
  const node = absolute(process.execPath, 'canonical Node');
  const canonicalHelper = await realpath(helper);
  const source = `#!/bin/sh
exec ${shellQuote(node)} ${shellQuote(canonicalHelper)} "$@"
`;
  const bytes = Buffer.from(source);
  await writeFile(launcherPath, bytes, { mode: EXECUTABLE_MODE });
  await chmod(launcherPath, EXECUTABLE_MODE);
  return {
    runRoot: root,
    path: launcherPath,
    wrapperPath: canonicalHelper,
    nodePath: process.execPath,
    sha256: sha256(bytes),
    sizeBytes: bytes.length,
    mode: modeText(EXECUTABLE_MODE),
    role: 'MNFS_TRUSTED_LAUNCHER',
  };
}

export async function revalidateTrustedPiAcpLauncher(binding = {}) {
  const root = absolute(binding.runRoot, 'Pi-ACP launcher runRoot');
  const launcherPath = absolute(binding.path, 'Pi-ACP launcher path');
  if (!owned(root, launcherPath)) throw new Error('Pi-ACP launcher escaped its runRoot');
  const expectedMode = binding.mode ?? modeText(EXECUTABLE_MODE);
  if (expectedMode !== modeText(EXECUTABLE_MODE)) throw new Error('Pi-ACP launcher mode must be 0700');
  if (!HASH_PATTERN.test(binding.sha256 ?? '') || !Number.isSafeInteger(binding.sizeBytes) || binding.sizeBytes < 0) {
    throw new TypeError('Pi-ACP launcher binding hash and size are required');
  }
  const stats = await lstat(launcherPath);
  if (!stats.isFile() || stats.isSymbolicLink()) throw new Error('Pi-ACP launcher must be a regular file');
  if (modeText(stats.mode) !== expectedMode) throw new Error('Pi-ACP launcher mode changed before spawn');
  if (await realpath(launcherPath) !== launcherPath) throw new Error('Pi-ACP launcher realpath changed before spawn');
  const bytes = await readFile(launcherPath);
  if (bytes.length !== binding.sizeBytes || sha256(bytes) !== binding.sha256) {
    throw new Error('Pi-ACP launcher digest changed before spawn');
  }
  return Object.freeze({ ...binding, runRoot: root, path: launcherPath, mode: modeText(stats.mode) });
}
