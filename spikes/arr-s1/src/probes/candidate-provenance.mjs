import { createHash } from 'node:crypto';
import { lstat, readFile, realpath } from 'node:fs/promises';
import path from 'node:path';

const HASH_PATTERN = /^sha256:[a-f0-9]{64}$/u;
const SENSITIVE_KEY = /token|secret|credential|password|cookie|authorization|api[_-]?key/iu;

function sha256(bytes) {
  return `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
}

function absoluteStagedPath(stateRoot, value) {
  if (typeof value !== 'string' || value.length === 0 || path.posix.isAbsolute(value) || value.includes('\\')) {
    throw new TypeError('staged provenance path must be relative POSIX text');
  }
  const root = path.posix.normalize(stateRoot);
  const absolute = path.posix.join(root, value);
  if (absolute !== root && !absolute.startsWith(`${root}/`)) throw new TypeError('staged provenance path escaped state root');
  return absolute;
}

async function rejectSymlinkComponents(value) {
  let current = '/';
  for (const segment of path.posix.normalize(value).split('/').filter(Boolean)) {
    current = path.posix.join(current, segment);
    const stats = await lstat(current);
    if (stats.isSymbolicLink()) throw new TypeError(`candidate provenance contains symlink component: ${current}`);
  }
}

async function readVerifiedFile(stateRoot, descriptor) {
  if (!descriptor || typeof descriptor !== 'object') throw new TypeError('staged provenance file descriptor is required');
  if (!HASH_PATTERN.test(descriptor.sha256 ?? '') || !Number.isSafeInteger(descriptor.sizeBytes) || descriptor.sizeBytes < 0) {
    throw new TypeError('staged provenance file descriptor hash or size is invalid');
  }
  const filePath = absoluteStagedPath(stateRoot, descriptor.path);
  await rejectSymlinkComponents(path.posix.dirname(filePath));
  const stats = await lstat(filePath);
  if (!stats.isFile() || stats.isSymbolicLink()) throw new TypeError(`staged provenance path is not a regular file: ${descriptor.path}`);
  if (await realpath(filePath) !== filePath) throw new TypeError(`staged provenance path resolves through a symlink: ${descriptor.path}`);
  const bytes = await readFile(filePath);
  if (bytes.length !== descriptor.sizeBytes || sha256(bytes) !== descriptor.sha256) {
    throw new TypeError(`staged provenance digest mismatch: ${descriptor.path}`);
  }
  return { ...descriptor, path: filePath };
}

async function readManifestFile(stateRoot, sourcePath) {
  const relativePath = 'candidates/staging-manifest.json';
  await rejectSymlinkComponents(path.posix.dirname(sourcePath));
  const stats = await lstat(sourcePath);
  if (!stats.isFile() || stats.isSymbolicLink()) throw new TypeError(`candidate staging manifest is not a regular file: ${relativePath}`);
  if (await realpath(sourcePath) !== sourcePath) throw new TypeError(`candidate staging manifest resolves through a symlink: ${relativePath}`);
  const bytes = await readFile(sourcePath);
  return { path: sourcePath, sha256: sha256(bytes), sizeBytes: bytes.length, bytes };
}

function rejectSecretKeys(value) {
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    if (SENSITIVE_KEY.test(key)) throw new TypeError('staged provenance must not contain credential or secret fields');
    rejectSecretKeys(child);
  }
}

async function verifyRecord(stateRoot, record) {
  if (!record || typeof record !== 'object' || typeof record.candidateShape !== 'string') {
    throw new TypeError('staged provenance candidate record is malformed');
  }
  rejectSecretKeys(record);
  if (!Array.isArray(record.stagedPaths) || record.stagedPaths.length === 0) {
    throw new TypeError(`staged provenance has no staged paths for ${record.candidateShape}`);
  }
  const stagedPaths = await Promise.all(record.stagedPaths.map((descriptor) => readVerifiedFile(stateRoot, descriptor)));
  const byRelativePath = new Map(record.stagedPaths.map((descriptor, index) => [descriptor.path, stagedPaths[index]]));
  const surfaces = {};
  for (const [name, descriptor] of Object.entries(record.surfaces ?? {})) {
    const verified = byRelativePath.get(descriptor?.path);
    if (!verified || descriptor.sha256 !== verified.sha256 || descriptor.sizeBytes !== verified.sizeBytes) {
      throw new TypeError(`staged provenance surface ${name} is not bound to staged bytes for ${record.candidateShape}`);
    }
    surfaces[name] = { ...descriptor, ...verified };
  }
  return { ...record, stagedPaths, surfaces };
}

export async function observeStagedCandidateProvenance({ stateRoot } = {}) {
  if (typeof stateRoot !== 'string' || !path.posix.isAbsolute(stateRoot)) throw new TypeError('candidate provenance state root must be absolute');
  const normalizedRoot = path.posix.normalize(stateRoot);
  const sourcePath = path.posix.join(normalizedRoot, 'candidates', 'staging-manifest.json');
  try {
    const descriptor = await readManifestFile(normalizedRoot, sourcePath);
    if (!descriptor) return { sourcePath, records: {}, state: 'MISSING' };
    const manifest = JSON.parse(Buffer.from(descriptor.bytes).toString('utf8'));
    if (manifest?.schemaVersion !== 1 || manifest.source !== 'MNFS_TRUSTED_STAGING_V1' || !manifest.records || typeof manifest.records !== 'object') {
      throw new TypeError('candidate staging manifest is not a trusted ARR-S1 staging boundary');
    }
    const records = {};
    for (const [shape, record] of Object.entries(manifest.records)) {
      if (record?.candidateShape !== shape) throw new TypeError(`staged provenance shape binding is invalid for ${shape}`);
      records[shape] = await verifyRecord(normalizedRoot, record);
    }
    return {
      sourcePath,
      records,
      trustedBoundary: 'MNFS_TRUSTED_STAGING_V1',
      integrity: {
        manifestSha256: descriptor.sha256,
        stagedFiles: Object.fromEntries(Object.entries(records).map(([shape, record]) => [shape, record.stagedPaths.map(({ path: filePath, sha256: fileSha, sizeBytes }) => ({ path: filePath, sha256: fileSha, sizeBytes }))])),
      },
    };
  } catch (error) {
    if (error?.code === 'ENOENT') return { sourcePath, records: {}, state: 'MISSING' };
    throw error;
  }
}
