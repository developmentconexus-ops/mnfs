import { lstat, readFile, realpath } from 'node:fs/promises';
import path from 'node:path';

async function rejectSymlinkComponents(value) {
  let current = '/';
  for (const segment of path.posix.normalize(value).split('/').filter(Boolean)) {
    current = path.posix.join(current, segment);
    const stats = await lstat(current);
    if (stats.isSymbolicLink()) throw new TypeError(`candidate provenance contains symlink component: ${current}`);
  }
}

export async function observeStagedCandidateProvenance({ stateRoot } = {}) {
  if (typeof stateRoot !== 'string' || !path.posix.isAbsolute(stateRoot)) throw new TypeError('candidate provenance state root must be absolute');
  const sourcePath = path.posix.join(path.posix.normalize(stateRoot), 'candidates', 'provenance.json');
  await rejectSymlinkComponents(path.posix.dirname(sourcePath));
  try {
    const stats = await lstat(sourcePath);
    if (!stats.isFile() || stats.isSymbolicLink()) throw new TypeError('staged candidate provenance must be a regular file');
    if (await realpath(sourcePath) !== sourcePath) throw new TypeError('staged candidate provenance must not resolve through a symlink');
    return { sourcePath, records: JSON.parse(await readFile(sourcePath, 'utf8')) };
  } catch (error) {
    if (error?.code === 'ENOENT') return { sourcePath, records: {}, state: 'MISSING' };
    throw error;
  }
}
