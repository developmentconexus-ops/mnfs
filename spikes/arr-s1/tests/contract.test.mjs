import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  S1_CANDIDATE_SHAPES,
  S1_CANDIDATE_VERDICTS,
  S1_CONTRACT_IDENTITY,
  S1_CRITERIA,
  loadS1ContractIdentity,
} from '../src/contract.mjs';

const EXPECTED_CRITERIA = Array.from({ length: 16 }, (_, index) =>
  `S1-C${String(index + 1).padStart(2, '0')}`,
);
const EXPECTED_SHAPE_IDS = ['PI-SDK', 'PI-ACP', 'PI-RPC', 'OPENCODE-ACP', 'SECOND-ACP'];
const EXPECTED_VERDICTS = ['PASS', 'FAIL', 'BLOCKED', 'REJECT'];
const CONTRACT_URL = new URL('../../../docs/spikes/ARR-S1-AGENT-RUNTIME-CONTRACT.md', import.meta.url);
const EXPECTED_CONTRACT_SHA256 = 'sha256:bd34f566bec1c3fc32b8ab1617dac88f997ab9a91cbc6b83e42eb27dcbf9736a';

test('registers exactly the accepted deterministic S1 inventories', () => {
  assert.deepEqual(S1_CRITERIA, EXPECTED_CRITERIA);
  assert.deepEqual(S1_CANDIDATE_VERDICTS, EXPECTED_VERDICTS);
  assert.deepEqual(
    S1_CANDIDATE_SHAPES.map(({ id }) => id),
    EXPECTED_SHAPE_IDS,
  );

  const shapeById = new Map(S1_CANDIDATE_SHAPES.map((shape) => [shape.id, shape]));
  assert.equal(shapeById.get('PI-RPC')?.applicability, 'CONDITIONAL');
  assert.equal(shapeById.get('SECOND-ACP')?.applicability, 'CONDITIONAL');
  assert.equal(shapeById.get('PI-SDK')?.applicability, 'DEFAULT');
  assert.equal(shapeById.get('PI-ACP')?.applicability, 'DEFAULT');
  assert.equal(shapeById.get('OPENCODE-ACP')?.applicability, 'DEFAULT');

  assert.equal(Object.isFrozen(S1_CRITERIA), true);
  assert.equal(Object.isFrozen(S1_CANDIDATE_VERDICTS), true);
  assert.equal(Object.isFrozen(S1_CANDIDATE_SHAPES), true);
  for (const shape of S1_CANDIDATE_SHAPES) assert.equal(Object.isFrozen(shape), true);
  assert.equal(Object.hasOwn(S1_CANDIDATE_SHAPES[0], 'score'), false);
  assert.equal(Object.hasOwn(S1_CANDIDATE_SHAPES[0], 'winner'), false);
  assert.equal(Object.hasOwn(S1_CANDIDATE_SHAPES[0], 'preference'), false);
});

test('loads the accepted contract identity and computes SHA-256 from exact bytes', async () => {
  const identity = await loadS1ContractIdentity();
  assert.deepEqual(
    {
      id: identity.id,
      version: identity.version,
      gitBlob: identity.gitBlob,
      sha256: identity.sha256,
    },
    {
      id: 'DOC-ARR-S1-AGENT-RUNTIME-CONTRACT',
      version: '0.1.0',
      gitBlob: 'f032f09fefd1a2a1d36e568f00732e8eedd8aa89',
      sha256: EXPECTED_CONTRACT_SHA256,
    },
  );
  assert.deepEqual(identity, Object.freeze({ ...identity }));
  assert.equal(S1_CONTRACT_IDENTITY.gitBlob, 'f032f09fefd1a2a1d36e568f00732e8eedd8aa89');

  const bytes = await readFile(CONTRACT_URL);
  assert.equal(
    `sha256:${createHash('sha256').update(bytes).digest('hex')}`,
    EXPECTED_CONTRACT_SHA256,
  );
});

test('fails closed when loaded bytes do not match the accepted Git blob', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'mnfs-arr-s1-contract-'));
  const alteredPath = path.join(root, 'contract.md');
  try {
    const bytes = await readFile(CONTRACT_URL);
    await writeFile(alteredPath, Buffer.concat([bytes, Buffer.from('\n')]));

    await assert.rejects(
      () => loadS1ContractIdentity({ contractPath: alteredPath }),
      (error) => {
        assert.equal(error.code, 'S1_CONTRACT_IDENTITY_MISMATCH');
        assert.match(error.message, /accepted Git blob/u);
        return true;
      },
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
