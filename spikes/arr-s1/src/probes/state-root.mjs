import { access, constants, lstat, realpath } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const REVIEWED_FILESYSTEMS = new Set(['ext2/ext3', 'xfs', 'btrfs', 'overlayfs', 'tmpfs']);
const FIXED_ENV = Object.freeze({ PATH: '/usr/bin:/bin', LANG: 'C', LC_ALL: 'C' });

export function isReviewedFilesystem(value) {
  return typeof value === 'string' && REVIEWED_FILESYSTEMS.has(value.trim().toLowerCase());
}

function absoluteLinuxPath(value) {
  if (typeof value !== 'string' || !path.posix.isAbsolute(value)) return false;
  const normalized = path.posix.normalize(value);
  return normalized !== '/' && normalized !== '/mnt' && !normalized.startsWith('/mnt/');
}

async function rejectSymlinkComponents(value) {
  let current = '/';
  for (const segment of path.posix.normalize(value).split('/').filter(Boolean)) {
    current = path.posix.join(current, segment);
    const stats = await lstat(current);
    if (stats.isSymbolicLink()) throw new TypeError(`state root contains symlink component: ${current}`);
  }
}

async function defaultRunCommand({ argv, cwd, env, timeoutMs, outputLimitBytes }) {
  const result = await execFileAsync(argv[0], argv.slice(1), {
    cwd, env, timeout: timeoutMs, maxBuffer: outputLimitBytes, shell: false,
  });
  return { exitCode: 0, stdout: Buffer.from(result.stdout), stderr: Buffer.from(result.stderr) };
}

export async function observeLinuxStateRoot({ stateRoot, runCommand = defaultRunCommand } = {}) {
  if (!absoluteLinuxPath(stateRoot)) throw new TypeError('ARR-S1 state root must be an absolute Linux path outside /mnt');
  const normalized = path.posix.normalize(stateRoot);
  await rejectSymlinkComponents(normalized);
  const [stats, realPath] = await Promise.all([lstat(normalized), realpath(normalized)]);
  const writable = await access(normalized, constants.W_OK).then(() => true, () => false);
  const fsResult = await runCommand({
    argv: ['/usr/bin/stat', '-f', '-c', '%T', normalized],
    cwd: '/',
    env: { ...FIXED_ENV },
    timeoutMs: 5000,
    outputLimitBytes: 4096,
  });
  const filesystem = Buffer.from(fsResult?.stdout ?? '').toString('utf8').trim().toLowerCase();
  const filesystemSupported = fsResult?.exitCode === 0 && isReviewedFilesystem(filesystem);
  return {
    path: normalized,
    realPath,
    platform: process.platform,
    isDirectory: stats.isDirectory(),
    writable,
    filesystem,
    filesystemSupported,
    state: process.platform === 'linux' && stats.isDirectory() && writable && realPath === normalized && filesystemSupported
      ? 'SUPPORTED' : 'BLOCKED',
  };
}
