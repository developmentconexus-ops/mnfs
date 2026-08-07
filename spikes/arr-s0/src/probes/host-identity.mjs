import { readFile as fsReadFile } from 'node:fs/promises';
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
  if (!value) return { state: 'UNKNOWN', rationale: 'repository filesystem type was not observed' };
  if (REVIEWED_WINDOWS_BACKED_FILESYSTEMS.has(value)) {
    return { state: 'UNSUPPORTED', rationale: `repository filesystem ${value} is Windows-backed or otherwise outside the ARR-S0 Linux-owned boundary` };
  }
  if (REVIEWED_LINUX_OWNED_FILESYSTEMS.has(value)) {
    return { state: 'SUPPORTED', rationale: `repository filesystem ${value} is on the reviewed Linux-owned allowlist` };
  }
  return { state: 'UNKNOWN', rationale: `repository filesystem ${value} is not on the reviewed ARR-S0 filesystem allowlist` };
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
