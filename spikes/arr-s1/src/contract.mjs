import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

export const S1_CONTRACT_VERSION = '0.1.0';
export const S1_CONTRACT_GIT_BLOB = 'f032f09fefd1a2a1d36e568f00732e8eedd8aa89';
const S1_CONTRACT_RELATIVE_PATH = 'docs/spikes/ARR-S1-AGENT-RUNTIME-CONTRACT.md';
const DEFAULT_CONTRACT_URL = new URL('../../../docs/spikes/ARR-S1-AGENT-RUNTIME-CONTRACT.md', import.meta.url);

export const S1_CRITERIA = Object.freeze([
  'S1-C01',
  'S1-C02',
  'S1-C03',
  'S1-C04',
  'S1-C05',
  'S1-C06',
  'S1-C07',
  'S1-C08',
  'S1-C09',
  'S1-C10',
  'S1-C11',
  'S1-C12',
  'S1-C13',
  'S1-C14',
  'S1-C15',
  'S1-C16',
]);

export const S1_CANDIDATE_VERDICTS = Object.freeze([
  'PASS',
  'FAIL',
  'BLOCKED',
  'REJECT',
]);

export const S1_CANDIDATE_SHAPES = Object.freeze([
  Object.freeze({ id: 'PI-SDK', applicability: 'DEFAULT' }),
  Object.freeze({ id: 'PI-ACP', applicability: 'DEFAULT' }),
  Object.freeze({ id: 'PI-RPC', applicability: 'CONDITIONAL' }),
  Object.freeze({ id: 'OPENCODE-ACP', applicability: 'DEFAULT' }),
  Object.freeze({ id: 'SECOND-ACP', applicability: 'CONDITIONAL' }),
]);

export const S1_CANDIDATE_SHAPE_IDS = Object.freeze(
  S1_CANDIDATE_SHAPES.map(({ id }) => id),
);

export const S1_CONTRACT_IDENTITY = Object.freeze({
  id: 'DOC-ARR-S1-AGENT-RUNTIME-CONTRACT',
  version: S1_CONTRACT_VERSION,
  gitBlob: S1_CONTRACT_GIT_BLOB,
  path: S1_CONTRACT_RELATIVE_PATH,
});

function gitBlobSha(bytes) {
  return createHash('sha1')
    .update(`blob ${bytes.byteLength}\0`)
    .update(bytes)
    .digest('hex');
}

function sha256(bytes) {
  return `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
}

function contractPathFrom(input) {
  if (input === undefined) return DEFAULT_CONTRACT_URL;
  if (typeof input === 'string' || input instanceof URL) return input;
  if (input && typeof input === 'object' && 'contractPath' in input) return input.contractPath;
  throw new TypeError('contractPath must be a path, file URL or { contractPath }');
}

export async function loadS1ContractIdentity(input) {
  const bytes = await readFile(contractPathFrom(input));
  const observedGitBlob = gitBlobSha(bytes);
  if (observedGitBlob !== S1_CONTRACT_GIT_BLOB) {
    const error = new Error(
      `S1 contract bytes do not match the accepted Git blob: expected ${S1_CONTRACT_GIT_BLOB}, observed ${observedGitBlob}`,
    );
    error.code = 'S1_CONTRACT_IDENTITY_MISMATCH';
    error.expectedGitBlob = S1_CONTRACT_GIT_BLOB;
    error.observedGitBlob = observedGitBlob;
    throw error;
  }

  return Object.freeze({
    ...S1_CONTRACT_IDENTITY,
    sha256: sha256(bytes),
    byteLength: bytes.byteLength,
  });
}
