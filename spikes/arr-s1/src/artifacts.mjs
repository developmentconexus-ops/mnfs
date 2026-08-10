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

const PRIVATE_MODE = 0o600;
const HASH_PATTERN = /^sha256:[a-f0-9]{64}$/u;
const FORBIDDEN_KINDS = new Set(['credential', 'credentials', 'auth', 'token', 'complete-environment', 'environment']);
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

function clone(value) {
  return structuredClone(value);
}

function freeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) freeze(child);
  return Object.freeze(value);
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]));
  }
  return value;
}

function canonicalJsonBytes(value) {
  return Buffer.from(`${JSON.stringify(canonicalize(value))}\n`);
}

function requireBinding(binding) {
  if (!binding || typeof binding !== 'object') throw new TypeError('S1 artifact binding is required');
  if (typeof binding.runId !== 'string' || binding.runId.length === 0) throw new TypeError('S1 artifact binding runId is required');
  if (typeof binding.candidateShape !== 'string' || binding.candidateShape.length === 0) throw new TypeError('S1 artifact binding candidateShape is required');
  for (const key of ['runKey', 'contractHash', 'fixtureHash', 'sourceTreeHash']) {
    if (!HASH_PATTERN.test(binding[key] ?? '')) throw new TypeError(`S1 artifact binding ${key} is invalid`);
  }
}

function requireSafeKind(kind) {
  if (typeof kind !== 'string' || kind.length === 0) throw new TypeError('S1 artifact kind is required');
  if (FORBIDDEN_KINDS.has(kind.toLowerCase())) {
    throw new TypeError('S1 artifacts must not persist credentials or complete candidate environments');
  }
}

function rejectSensitivePayload(bytes) {
  const text = Buffer.from(bytes).toString('utf8');
  const credentialPatterns = [
    /authorization\s*:\s*bearer\s+\S+/iu,
    /\b(?:access|refresh)_token\s*[:=]/iu,
    /\bapi[_-]?key\s*[:=]/iu,
    /\bclient[_-]?secret\s*[:=]/iu,
    /-----BEGIN [^-]*PRIVATE KEY-----/iu,
  ];
  if (credentialPatterns.some((pattern) => pattern.test(text))) {
    throw new TypeError('S1 artifacts must not persist raw credentials or secret payloads');
  }
}

function requireContainedRelativePath(relativePath) {
  if (typeof relativePath !== 'string' || relativePath.length === 0 || path.isAbsolute(relativePath) || relativePath.includes('\\')) {
    throw new TypeError('invalid S1 artifact path');
  }
  const normalized = path.normalize(relativePath);
  if (normalized === '.' || normalized === '..' || normalized.startsWith(`..${path.sep}`)) throw new TypeError('invalid S1 artifact path');
  return normalized;
}

async function rejectSymlinkComponents(absolutePath, lstat) {
  const normalized = path.resolve(absolutePath);
  const parsed = path.parse(normalized);
  let current = parsed.root;
  for (const segment of normalized.slice(parsed.root.length).split(path.sep).filter(Boolean)) {
    current = path.join(current, segment);
    try {
      const stats = await lstat(current);
      if (stats.isSymbolicLink?.()) throw new TypeError(`S1 artifact path contains symlink component: ${current}`);
    } catch (error) {
      if (error?.code === 'ENOENT') break;
      throw error;
    }
  }
}

async function assertContained(root, candidate, realpath) {
  const [rootReal, candidateReal] = await Promise.all([realpath(root), realpath(candidate)]);
  if (rootReal !== root) throw new TypeError('S1 artifact root resolves through symlink');
  if (candidateReal !== rootReal && !candidateReal.startsWith(`${rootReal}${path.sep}`)) throw new TypeError('S1 artifact path escaped run root');
}

async function existingArtifact(ops, root, finalPath, relativePath, bytes, binding, kind) {
  let stats;
  try { stats = await ops.lstat(finalPath); } catch (error) {
    if (error?.code === 'ENOENT') return null;
    throw error;
  }
  if (stats.isSymbolicLink?.() || !stats.isFile?.()) throw new TypeError('S1 artifact destination is not a regular file');
  if ((stats.mode & 0o777) !== PRIVATE_MODE) throw new TypeError('S1 artifact destination must have exact 0600 permissions');
  await assertContained(root, finalPath, ops.realpath);
  const existing = Buffer.from(await ops.readFile(finalPath));
  if (!existing.equals(bytes)) throw new Error('existing artifact differs from immutable publication');
  return freeze({
    id: `${binding.runId}:${relativePath.split(path.sep).join('/')}`,
    path: relativePath.split(path.sep).join('/'),
    sha256: sha256Bytes(bytes),
    sizeBytes: bytes.length,
    kind,
    binding: clone(binding),
  });
}

export async function writeRawArtifact(runRoot, relativePath, inputBytes, { binding, kind, ops: suppliedOps } = {}) {
  requireBinding(binding);
  requireSafeKind(kind);
  const ops = { ...defaultOps, ...(suppliedOps ?? {}) };
  const normalized = requireContainedRelativePath(relativePath);
  const root = path.resolve(runRoot);
  const finalPath = path.resolve(root, normalized);
  if (finalPath !== root && !finalPath.startsWith(`${root}${path.sep}`)) throw new TypeError('invalid S1 artifact path escape');
  const parent = path.dirname(finalPath);
  await rejectSymlinkComponents(root, ops.lstat);
  await ops.mkdir(parent, { recursive: true, mode: 0o700 });
  await rejectSymlinkComponents(parent, ops.lstat);
  await assertContained(root, parent, ops.realpath);

  const bytes = Buffer.from(inputBytes);
  rejectSensitivePayload(bytes);
  const existing = await existingArtifact(ops, root, finalPath, normalized, bytes, binding, kind);
  if (existing) return existing;

  const tempPath = `${finalPath}.tmp-${process.pid}-${randomBytes(6).toString('hex')}`;
  let tempHandle;
  let tempExists = false;
  try {
    tempHandle = await ops.open(tempPath, 'wx', PRIVATE_MODE);
    tempExists = true;
    await tempHandle.writeFile(bytes);
    await tempHandle.sync();
    await tempHandle.close();
    tempHandle = null;
    try {
      await ops.link(tempPath, finalPath);
    } catch (error) {
      if (error?.code !== 'EEXIST') throw error;
      try { await ops.unlink(tempPath); tempExists = false; } catch {}
      const concurrent = await existingArtifact(ops, root, finalPath, normalized, bytes, binding, kind);
      if (concurrent) return concurrent;
      throw error;
    }
    await ops.unlink(tempPath);
    tempExists = false;
    const stats = await ops.lstat(finalPath);
    if ((stats.mode & 0o777) !== PRIVATE_MODE) throw new TypeError('S1 artifact publication must have exact 0600 permissions');
    await assertContained(root, finalPath, ops.realpath);
    const directoryHandle = await ops.open(parent, 'r');
    try { await directoryHandle.sync(); } finally { await directoryHandle.close(); }
  } catch (error) {
    if (tempHandle) { try { await tempHandle.close(); } catch {} }
    if (tempExists) { try { await ops.unlink(tempPath); } catch {} }
    throw error;
  }

  return freeze({
    id: `${binding.runId}:${normalized.split(path.sep).join('/')}`,
    path: normalized.split(path.sep).join('/'),
    sha256: sha256Bytes(bytes),
    sizeBytes: bytes.length,
    kind,
    binding: clone(binding),
  });
}

export async function writeJsonArtifact(runRoot, relativePath, value, options = {}) {
  if (options.kind === 'metadata' && value && typeof value === 'object' && ('env' in value || 'environment' in value)) {
    throw new TypeError('S1 artifacts must not persist complete candidate environments');
  }
  return writeRawArtifact(runRoot, relativePath, canonicalJsonBytes(value), options);
}

export async function verifyArtifactRecords(runRoot, records, expectedBinding) {
  const root = path.resolve(runRoot);
  const errors = [];
  const seenPaths = new Set();
  try {
    await rejectSymlinkComponents(root, fsLstat);
    await assertContained(root, root, fsRealpath);
  } catch (error) {
    errors.push(`artifact root integrity failure (${error?.message ?? error})`);
  }
  if (expectedBinding) requireBinding(expectedBinding);

  for (const record of records ?? []) {
    if (!record || typeof record.path !== 'string') { errors.push('artifact record is missing path'); continue; }
    let normalized;
    try { normalized = requireContainedRelativePath(record.path); } catch { errors.push(`invalid artifact path for ${record.path}`); continue; }
    if (seenPaths.has(normalized)) errors.push(`duplicate artifact path ${normalized}`);
    seenPaths.add(normalized);
    if (!HASH_PATTERN.test(record.sha256 ?? '') || !Number.isSafeInteger(record.sizeBytes) || record.sizeBytes < 0) {
      errors.push(`invalid artifact hash or size for ${record.path}`);
      continue;
    }
    try { requireBinding(record.binding); } catch (error) { errors.push(`invalid artifact binding for ${record.path} (${error.message})`); continue; }
    if (expectedBinding && JSON.stringify(canonicalize(record.binding)) !== JSON.stringify(canonicalize(expectedBinding))) {
      errors.push(`artifact binding mismatch for ${record.path}`);
    }
    const candidate = path.resolve(root, normalized);
    try {
      await rejectSymlinkComponents(path.dirname(candidate), fsLstat);
      await assertContained(root, candidate, fsRealpath);
      const stats = await fsLstat(candidate);
      if (stats.isSymbolicLink?.() || !stats.isFile?.()) throw new Error('not a regular file');
      if ((stats.mode & 0o777) !== PRIVATE_MODE) throw new Error('mode must be 0600');
      const bytes = Buffer.from(await fsReadFile(candidate));
      if (bytes.length !== record.sizeBytes) errors.push(`artifact size mismatch for ${record.path}`);
      if (sha256Bytes(bytes) !== record.sha256) errors.push(`artifact hash mismatch for ${record.path}`);
    } catch (error) {
      errors.push(`artifact verification failed for ${record.path} (${error?.message ?? error})`);
    }
  }
  return { ok: errors.length === 0, errors };
}
