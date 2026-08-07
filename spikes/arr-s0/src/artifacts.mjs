import { createHash, randomBytes } from 'node:crypto';
import {
  lstat as fsLstat,
  mkdir as fsMkdir,
  open as fsOpen,
  readFile as fsReadFile,
  rename as fsRename,
  unlink as fsUnlink,
} from 'node:fs/promises';
import path from 'node:path';
import { canonicalJsonBytes } from './canonical-json.mjs';

const defaultOps = {
  lstat: fsLstat,
  mkdir: fsMkdir,
  open: fsOpen,
  readFile: fsReadFile,
  rename: fsRename,
  unlink: fsUnlink,
};

export function sha256Bytes(bytes) {
  return `sha256:${createHash('sha256').update(Buffer.from(bytes)).digest('hex')}`;
}

function requireContainedRelativePath(relativePath) {
  if (
    typeof relativePath !== 'string'
    || relativePath.length === 0
    || path.isAbsolute(relativePath)
    || relativePath.includes('\\')
  ) {
    throw new TypeError('invalid ARR-S0 artifact path');
  }
  const normalized = path.normalize(relativePath);
  if (normalized === '.' || normalized === '..' || normalized.startsWith(`..${path.sep}`)) {
    throw new TypeError('invalid ARR-S0 artifact path');
  }
  return normalized;
}

async function rejectSymlinkParents(runRoot, parentPath) {
  const root = path.resolve(runRoot);
  const parent = path.resolve(parentPath);
  if (parent !== root && !parent.startsWith(`${root}${path.sep}`)) {
    throw new TypeError('ARR-S0 artifact path escaped run root');
  }
  const relative = path.relative(root, parent);
  let current = root;
  for (const segment of relative.split(path.sep).filter(Boolean)) {
    current = path.join(current, segment);
    try {
      const stats = await fsLstat(current);
      if (stats.isSymbolicLink()) throw new TypeError(`ARR-S0 artifact parent is a symlink: ${current}`);
    } catch (error) {
      if (error?.code === 'ENOENT') break;
      throw error;
    }
  }
}

async function existingArtifactMetadata(ops, finalPath, relativePath, bytes) {
  let stats;
  try {
    stats = await ops.lstat(finalPath);
  } catch (error) {
    if (error?.code === 'ENOENT') return null;
    throw error;
  }
  if (stats.isSymbolicLink?.()) throw new TypeError('ARR-S0 artifact destination is a symlink');
  if (!stats.isFile?.()) throw new TypeError('ARR-S0 artifact destination is not a regular file');
  if (typeof ops.readFile !== 'function') throw new TypeError('artifact ops missing readFile for existing artifact');
  const existing = await ops.readFile(finalPath);
  if (!Buffer.from(existing).equals(bytes)) throw new Error('existing artifact differs from immutable publication');
  return {
    path: relativePath.split(path.sep).join('/'),
    sha256: sha256Bytes(bytes),
    sizeBytes: bytes.length,
  };
}

export async function writeRawArtifact(runRoot, relativePath, inputBytes, options = {}) {
  const ops = options.ops ?? defaultOps;
  const normalized = requireContainedRelativePath(relativePath);
  const root = path.resolve(runRoot);
  const finalPath = path.resolve(root, normalized);
  if (finalPath !== root && !finalPath.startsWith(`${root}${path.sep}`)) {
    throw new TypeError('invalid ARR-S0 artifact path escape');
  }
  const parent = path.dirname(finalPath);
  await rejectSymlinkParents(root, parent);
  await ops.mkdir(parent, { recursive: true, mode: 0o700 });

  const bytes = Buffer.from(inputBytes);
  const existing = await existingArtifactMetadata(ops, finalPath, normalized, bytes);
  if (existing) return existing;

  const tempPath = `${finalPath}.tmp-${process.pid}-${randomBytes(6).toString('hex')}`;
  let tempHandle;
  try {
    tempHandle = await ops.open(tempPath, 'wx', 0o600);
    await tempHandle.writeFile(bytes);
    await tempHandle.sync();
    await tempHandle.close();
    tempHandle = null;
    await ops.rename(tempPath, finalPath);
    const dirHandle = await ops.open(parent, 'r');
    try {
      await dirHandle.sync();
    } finally {
      await dirHandle.close();
    }
  } catch (error) {
    if (tempHandle) {
      try { await tempHandle.close(); } catch {}
    }
    try { await ops.unlink(tempPath); } catch {}
    throw error;
  }

  return {
    path: normalized.split(path.sep).join('/'),
    sha256: sha256Bytes(bytes),
    sizeBytes: bytes.length,
  };
}

export async function writeCanonicalJsonArtifact(runRoot, relativePath, value, options = {}) {
  return await writeRawArtifact(runRoot, relativePath, canonicalJsonBytes(value), options);
}
