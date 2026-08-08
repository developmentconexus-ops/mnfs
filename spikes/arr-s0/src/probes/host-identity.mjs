import { lstat as fsLstat, readFile as fsReadFile } from 'node:fs/promises';
import path from 'node:path';
import { runProbeCommand } from '../process.mjs';

const FIXED_ENV = Object.freeze({ PATH: '/usr/bin:/bin', LANG: 'C', LC_ALL: 'C' });
const READ_LIMIT = 64 * 1024;
const REVIEWED_LINUX_OWNED_FILESYSTEMS = new Set(['ext2/ext3', 'xfs', 'btrfs', 'overlayfs', 'tmpfs']);
const REVIEWED_WINDOWS_BACKED_FILESYSTEMS = new Set(['drvfs', '9p', 'fuseblk']);

function unquote(value) {
  const trimmed = value.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

export function parseOsRelease(text) {
  const values = new Map();
  for (const rawLine of String(text).split(/\r?\n/u)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const index = line.indexOf('=');
    if (index <= 0) continue;
    values.set(line.slice(0, index), unquote(line.slice(index + 1)));
  }
  return {
    id: values.get('ID') ?? 'unknown',
    versionId: values.get('VERSION_ID') ?? 'unknown',
  };
}

function parseGitVersion(text) {
  const match = String(text).trim().match(/^git version\s+([^\s]+)$/u);
  return match?.[1] ?? 'unknown';
}

export function classifyLinuxFilesystem(filesystemType) {
  const value = String(filesystemType ?? '').trim().toLowerCase();
  if (!value) return { state: 'UNKNOWN', rationale: 'filesystem type was not observed' };
  if (REVIEWED_WINDOWS_BACKED_FILESYSTEMS.has(value)) {
    return { state: 'UNSUPPORTED', rationale: `filesystem ${value} is Windows-backed or otherwise outside the ARR-S0 Linux-owned boundary` };
  }
  if (REVIEWED_LINUX_OWNED_FILESYSTEMS.has(value)) {
    return { state: 'SUPPORTED', rationale: `filesystem ${value} is on the reviewed Linux-owned allowlist` };
  }
  return { state: 'UNKNOWN', rationale: `filesystem ${value} is not on the reviewed ARR-S0 filesystem allowlist` };
}

async function nearestExistingAncestor(target, lstat) {
  let current = path.resolve(target);
  while (true) {
    try {
      const stats = await lstat(current);
      if (stats.isSymbolicLink?.()) throw new TypeError(`filesystem observation path is a symlink: ${current}`);
      return current;
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error;
      const parent = path.dirname(current);
      if (parent === current) throw new Error(`no existing filesystem ancestor for ${target}`);
      current = parent;
    }
  }
}

export async function observeFilesystemOwnership(target, {
  lstat = fsLstat,
  runCommand = runProbeCommand,
} = {}) {
  if (typeof target !== 'string' || !path.isAbsolute(target)) {
    throw new TypeError('filesystem observation target must be absolute');
  }
  const observedPath = await nearestExistingAncestor(target, lstat);
  const result = await runCommand({
    argv: ['/usr/bin/stat', '-f', '-c', '%T', observedPath],
    cwd: '/',
    env: { ...FIXED_ENV },
    timeoutMs: 5000,
    outputLimitBytes: READ_LIMIT,
  });
  const filesystemType = result.exitCode === 0 ? result.stdout.toString('utf8').trim().toLowerCase() : '';
  const classification = classifyLinuxFilesystem(filesystemType);
  return {
    ...classification,
    filesystemType,
    observedPath,
  };
}

export function normalizeHostIdentity({
  kernelRelease,
  osReleaseText,
  architecture,
  nodeVersion,
  gitVersionText,
  filesystemType,
}) {
  const os = parseOsRelease(osReleaseText);
  const release = String(kernelRelease ?? '').trim();
  const isWsl2 = /microsoft.*wsl2/iu.test(release);
  const fs = classifyLinuxFilesystem(filesystemType);
  return {
    identity: {
      platform: 'linux',
      isWsl2,
      kernelRelease: release || 'unknown',
      distroId: os.id,
      distroVersion: os.versionId,
      architecture: String(architecture ?? '').trim() || 'unknown',
      nodeVersion: String(nodeVersion ?? '').trim() || 'unknown',
      gitVersion: parseGitVersion(gitVersionText),
    },
    observations: [
      {
        id: 'HOST-WSL2',
        state: isWsl2 ? 'SUPPORTED' : 'UNSUPPORTED',
        rationale: isWsl2 ? 'kernel release identifies WSL2' : 'kernel release does not identify WSL2',
        artifactRefs: [],
      },
      {
        id: 'HOST-LINUX-FS',
        state: fs.state,
        rationale: fs.rationale,
        artifactRefs: [],
      },
    ],
  };
}

async function readBounded(readFile, target) {
  const bytes = Buffer.from(await readFile(target));
  if (bytes.length > READ_LIMIT) throw new Error(`host identity file exceeds ${READ_LIMIT} bytes: ${target}`);
  return bytes.toString('utf8');
}

async function commandText(runCommand, argv, repoRoot) {
  const result = await runCommand({
    argv,
    cwd: repoRoot,
    env: { ...FIXED_ENV },
    timeoutMs: 5000,
    outputLimitBytes: READ_LIMIT,
  });
  if (result.exitCode !== 0) return '';
  return result.stdout.toString('utf8');
}

export async function observeHostIdentity({
  repoRoot,
  runCommand = runProbeCommand,
  readFile = fsReadFile,
  nodeVersion = process.version,
} = {}) {
  const [kernelRelease, osReleaseText, architecture, gitVersionText, filesystemType] = await Promise.all([
    readBounded(readFile, '/proc/sys/kernel/osrelease'),
    readBounded(readFile, '/etc/os-release'),
    commandText(runCommand, ['/usr/bin/uname', '-m'], repoRoot),
    commandText(runCommand, ['/usr/bin/git', '--version'], repoRoot),
    commandText(runCommand, ['/usr/bin/stat', '-f', '-c', '%T', repoRoot], repoRoot),
  ]);
  return normalizeHostIdentity({
    kernelRelease,
    osReleaseText,
    architecture,
    nodeVersion,
    gitVersionText,
    filesystemType,
  });
}
