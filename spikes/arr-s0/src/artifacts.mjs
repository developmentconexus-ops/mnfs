import { createHash, randomBytes } from 'node:crypto';
import {
  link as fsLink,
  lstat as fsLstat,
  mkdir as fsMkdir,
  open as fsOpen,
  readFile as fsReadFile,
  realpath as fsRealpath,
  unlink as fsUnlink,
} from 'node:fs/promises';
import path from 'node:path';
import { canonicalJsonBytes } from './canonical-json.mjs';

const defaultOps = {
  link: fsLink,
  lstat: fsLstat,
  mkdir: fsMkdir,
  open: fsOpen,
  readFile: fsReadFile,
  realpath: fsRealpath,
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

async function rejectExistingSymlinkComponents(absolutePath, lstat = fsLstat) {
  const normalized = path.resolve(absolutePath);
  const parsed = path.parse(normalized);
  const segments = normalized.slice(parsed.root.length).split(path.sep).filter(Boolean);
  let current = parsed.root;
  for (const segment of segments) {
    current = path.join(current, segment);
    let stats;
    try {
      stats = await lstat(current);
    } catch (error) {
      if (error?.code === 'ENOENT') break;
      throw error;
    }
    if (stats.isSymbolicLink?.()) {
      throw new TypeError(`ARR-S0 artifact path contains symlink component: ${current}`);
    }
  }
}

async function assertRealpathContained(root, candidate, realpath = fsRealpath) {
  const [rootReal, candidateReal] = await Promise.all([realpath(root), realpath(candidate)]);
  if (rootReal !== root) {
    throw new TypeError(`ARR-S0 artifact run root resolves through alias/symlink: ${root}`);
  }
  if (candidateReal !== rootReal && !candidateReal.startsWith(`${rootReal}${path.sep}`)) {
    throw new TypeError(`ARR-S0 artifact realpath escaped run root: ${candidate}`);
  }
  return { rootReal, candidateReal };
}

async function validatePublicationParent(root, parent, ops) {
  if (parent !== root && !parent.startsWith(`${root}${path.sep}`)) {
    throw new TypeError('ARR-S0 artifact path escaped run root');
  }
  await rejectExistingSymlinkComponents(root, ops.lstat);
  await rejectExistingSymlinkComponents(parent, ops.lstat);
}

async function existingArtifactMetadata(ops, root, finalPath, relativePath, bytes) {
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
  if (typeof ops.realpath === 'function') await assertRealpathContained(root, finalPath, ops.realpath);
  const existing = await ops.readFile(finalPath);
  if (!Buffer.from(existing).equals(bytes)) throw new Error('existing artifact differs from immutable publication');
  return {
    path: relativePath.split(path.sep).join('/'),
    sha256: sha256Bytes(bytes),
    sizeBytes: bytes.length,
  };
}

export async function writeRawArtifact(runRoot, relativePath, inputBytes, options = {}) {
  const ops = options.ops
    ? { ...defaultOps, ...options.ops, realpath: options.ops.realpath }
    : defaultOps;
  const normalized = requireContainedRelativePath(relativePath);
  const root = path.resolve(runRoot);
  const finalPath = path.resolve(root, normalized);
  if (finalPath !== root && !finalPath.startsWith(`${root}${path.sep}`)) {
    throw new TypeError('invalid ARR-S0 artifact path escape');
  }
  const parent = path.dirname(finalPath);
  await validatePublicationParent(root, parent, ops);
  await ops.mkdir(parent, { recursive: true, mode: 0o700 });
  await validatePublicationParent(root, parent, ops);
  if (typeof ops.realpath === 'function') await assertRealpathContained(root, parent, ops.realpath);

  const bytes = Buffer.from(inputBytes);
  const existing = await existingArtifactMetadata(ops, root, finalPath, normalized, bytes);
  if (existing) return existing;

  const tempPath = `${finalPath}.tmp-${process.pid}-${randomBytes(6).toString('hex')}`;
  let tempHandle;
  let tempExists = false;
  try {
    tempHandle = await ops.open(tempPath, 'wx', 0o600);
    tempExists = true;
    await tempHandle.writeFile(bytes);
    await tempHandle.sync();
    await tempHandle.close();
    tempHandle = null;

    try {
      await ops.link(tempPath, finalPath);
    } catch (error) {
      if (error?.code !== 'EEXIST') throw error;
      try {
        await ops.unlink(tempPath);
        tempExists = false;
      } catch {}
      const concurrent = await existingArtifactMetadata(ops, root, finalPath, normalized, bytes);
      if (concurrent) return concurrent;
      throw error;
    }

    await ops.unlink(tempPath);
    tempExists = false;
    await rejectExistingSymlinkComponents(finalPath, ops.lstat);
    if (typeof ops.realpath === 'function') await assertRealpathContained(root, finalPath, ops.realpath);
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
    if (tempExists) {
      try { await ops.unlink(tempPath); } catch {}
    }
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

export async function verifyArtifactRecords(runRoot, records, options = {}) {
  const lstat = options.lstat ?? fsLstat;
  const readFile = options.readFile ?? fsReadFile;
  const realpath = options.realpath ?? fsRealpath;
  const errors = [];
  const seenIds = new Set();
  const seenPaths = new Set();
  const root = path.resolve(runRoot);

  try {
    await rejectExistingSymlinkComponents(root, lstat);
    const rootReal = await realpath(root);
    if (rootReal !== root) errors.push('artifact run root resolves through alias/symlink');
  } catch (error) {
    errors.push(`artifact run root integrity failure (${error?.message ?? error})`);
  }

  for (const record of records ?? []) {
    if (!record || typeof record.id !== 'string') {
      errors.push('artifact record is missing id');
      continue;
    }
    if (seenIds.has(record.id)) errors.push(`duplicate artifact id ${record.id}`);
    seenIds.add(record.id);

    let normalized;
    try {
      normalized = requireContainedRelativePath(record.path);
    } catch {
      errors.push(`invalid artifact path for ${record.id}`);
      continue;
    }
    if (seenPaths.has(normalized)) errors.push(`duplicate artifact path ${normalized}`);
    seenPaths.add(normalized);

    const candidate = path.resolve(root, normalized);
    if (candidate !== root && !candidate.startsWith(`${root}${path.sep}`)) {
      errors.push(`artifact root escape for ${record.id}`);
      continue;
    }

    try {
      await rejectExistingSymlinkComponents(path.dirname(candidate), lstat);
    } catch (error) {
      errors.push(`artifact parent symlink/alias for ${record.id} (${error?.message ?? error})`);
      continue;
    }

    let stats;
    try {
      stats = await lstat(candidate);
    } catch (error) {
      errors.push(`artifact missing for ${record.id} (${error?.code ?? 'unknown'})`);
      continue;
    }
    if (stats.isSymbolicLink?.()) {
      errors.push(`artifact symlink is not allowed for ${record.id}`);
      continue;
    }
    if (!stats.isFile?.()) {
      errors.push(`artifact is not a regular file for ${record.id}`);
      continue;
    }

    try {
      await assertRealpathContained(root, candidate, realpath);
    } catch (error) {
      errors.push(`artifact realpath escape for ${record.id} (${error?.message ?? error})`);
      continue;
    }

    let bytes;
    try {
      bytes = Buffer.from(await readFile(candidate));
    } catch (error) {
      errors.push(`artifact unreadable for ${record.id} (${error?.code ?? 'unknown'})`);
      continue;
    }
    if (bytes.length !== record.sizeBytes) errors.push(`artifact size mismatch for ${record.id}`);
    if (sha256Bytes(bytes) !== record.sha256) errors.push(`artifact hash mismatch for ${record.id}`);
  }

  return { ok: errors.length === 0, errors };
}
