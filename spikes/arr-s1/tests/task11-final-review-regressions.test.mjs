import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { createS1Fixture, createFixtureTools } from '../src/fixture.mjs';
import { createS1CandidateExecutors } from '../src/executors.mjs';
import { observeStagedCandidateProvenance } from '../src/probes/candidate-provenance.mjs';
import { orchestrateS1 } from '../src/run.mjs';

const HASH = (bytes) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`;

async function stagedManifest(root, record) {
  const candidates = path.join(root, 'candidates');
  await mkdir(candidates, { recursive: true });
  const sourcePath = path.join(candidates, 'upstream.mjs');
  const bytes = Buffer.from('export const upstream = true;\n');
  await writeFile(sourcePath, bytes);
  const descriptor = { path: 'candidates/upstream.mjs', sha256: HASH(bytes), sizeBytes: bytes.length, role: 'UPSTREAM_MODULE' };
  await writeFile(path.join(candidates, 'staging-manifest.json'), JSON.stringify({
    schemaVersion: 1,
    source: 'MNFS_TRUSTED_STAGING_V1',
    records: {
      'PI-SDK': {
        candidateShape: 'PI-SDK',
        version: '0.84.1',
        package: '@earendil-works/pi-coding-agent',
        sourceIdentity: 'source',
        license: 'MIT',
        stagedPaths: [descriptor],
        ...record,
      },
    },
  }));
  return { sourcePath, descriptor };
}

test('staging rejects MNFS adapter, boundary and proof-driver surfaces', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'mnfs-arr-s1-trust-regression-'));
  try {
    await stagedManifest(root, {
      surfaces: {
        adapter: { path: 'candidates/upstream.mjs', role: 'MNFS_ADAPTER' },
        boundary: { path: 'candidates/upstream.mjs', role: 'ACTOR_RUN_BOUNDARY' },
        proofDriver: { path: 'candidates/upstream.mjs', role: 'PROOF_DRIVER' },
      },
    });
    await assert.rejects(
      () => observeStagedCandidateProvenance({ stateRoot: root }),
      /upstream|adapter|boundary|proof/iu,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('candidate raw cancellation/death/recovery claims cannot derive PASS', async () => {
  const fixture = await createS1Fixture();
  const runRoot = await mkdtemp(path.join(tmpdir(), 'mnfs-arr-s1-proof-regression-'));
  try {
    const tools = createFixtureTools(fixture);
    const resultFile = await readFile(fixture.targetFilePath, 'utf8');
    assert.match(resultFile, /PENDING/u);
    const observations = {
      cwd: fixture.workspacePath,
      inventory: fixture.inventory.map(({ id }) => id),
      discovery: { extensions: [], skills: [], prompts: [], themes: [], agentsFiles: [] },
      auth: { outcome: 'AUTHORIZED', methodClass: 'double' },
      cancellation: { checkpoint: 'CANCELLATION_BEFORE_FINALIZED', outcome: 'CANCELLED', durationMs: 0 },
      output: { bytes: 1, limitBytes: 4096 },
      processDeath: { checkpoint: 'PROCESS_DEATH_BEFORE_FINALIZED', outcome: 'SIGNAL_DEATH' },
      recovery: { phase: 'FRESH_PROCESS', verified: 'claimed-by-candidate' },
      authority: { sessionRole: 'OBSERVATIONAL', recoveryOwner: 'MNFS' },
      machinery: { reused: ['fixture', 'artifacts', 'process-runner'] },
      supportedBoundary: { kind: 'PUBLIC_ADAPTER_SURFACE', observation: 'double' },
    };
    const executors = createS1CandidateExecutors({
      fixture,
      processBoundary: {
        kind: 'ACTOR_RUN_PROCESS',
        run: async (_spec, action) => ({
          ...(await action()),
          observations,
          boundaryObservation: {
            cwd: fixture.workspacePath,
            envDigest: HASH(Buffer.from('env')),
            envSource: 'EXPLICIT_STAGED_ENV',
          },
        }),
      },
      piSdkAdapterFactory: () => ({
        observations,
        async initialize() { return { status: 'READY' }; },
        async startTurn() {
          await tools.read_nonce_file();
          await tools.edit_result_file();
          return { settled: true, outcome: 'COMPLETED', events: [{ type: 'raw' }] };
        },
        async close() {},
      }),
    });
    const result = await executors['PI-SDK']({
      fixture,
      runRoot,
      artifactBinding: {
        runId: 'arr-s1-proof-regression',
        candidateShape: 'PI-SDK',
        runKey: HASH(Buffer.from('run')),
        contractHash: HASH(Buffer.from('contract')),
        fixtureHash: fixture.fixtureHash,
        sourceTreeHash: HASH(Buffer.from('tree')),
      },
      preflight: {
        stateRoot: { path: runRoot },
        provenance: {
          trustedBoundary: 'TEST_FAITHFUL_STAGING',
          integrity: { manifestSha256: HASH(Buffer.from('manifest')) },
          records: {
            'PI-SDK': {
              candidateShape: 'PI-SDK',
              version: '0.84.1',
              package: '@earendil-works/pi-coding-agent',
              sourceIdentity: 'source',
              license: 'MIT',
              stagedPaths: [{ path: '/staged/upstream.mjs', sha256: HASH(Buffer.from('upstream')), sizeBytes: 8 }],
              upgradePolicy: { pinningRule: 'pin', upgradeTrigger: 'change', mandatoryConformanceRerun: 'rerun', rollbackRule: 'rollback' },
              removalConditions: { removeOrReplaceWhen: 'drift', authorityOrSecurityTrigger: 'security', provenanceOrLicenseTrigger: 'provenance', maintenanceTrigger: 'cost', replacementOrExitPath: 'replace' },
            },
          },
        },
      },
    });
    assert.notEqual(result.verdict, 'PASS');
    assert.notEqual(result.criterionResults.find(({ id }) => id === 'S1-C06')?.status, 'PASS');
    assert.notEqual(result.criterionResults.find(({ id }) => id === 'S1-C09')?.status, 'PASS');
    assert.notEqual(result.criterionResults.find(({ id }) => id === 'S1-C10')?.status, 'PASS');
  } finally {
    await fixture.dispose();
    await rm(runRoot, { recursive: true, force: true });
  }
});

test('required SECOND-ACP without a staged executor blocks before conditional execution', async () => {
  const calls = [];
  const executor = (shape, verdict = 'PASS') => async () => {
    calls.push(shape);
    return { candidateShape: shape, finalized: true, verdict, criterionResults: [], artifactRecords: [], evidenceIntegrity: { valid: true } };
  };
  const result = await orchestrateS1({
    preflight: async () => ({ status: 'READY', operationAllowed: true, source: {}, executionAuthorization: {} }),
    executors: {
      'PI-SDK': executor('PI-SDK'),
      'PI-ACP': executor('PI-ACP'),
      'OPENCODE-ACP': async () => {
        calls.push('OPENCODE-ACP');
        return { candidateShape: 'OPENCODE-ACP', finalized: true, verdict: 'PASS', observations: { materialAcpBoundaryAdvantage: true }, criterionResults: [], artifactRecords: [], evidenceIntegrity: { valid: true } };
      },
    },
    applicabilityEvaluator: () => ({ piRpc: 'NOT_REQUIRED', secondAcp: 'REQUIRED' }),
    reportBuilder: ({ candidates }) => ({ status: candidates.some(({ candidateShape }) => candidateShape === 'SECOND-ACP') ? 'BLOCKED' : 'BLOCKED' }),
  });
  assert.equal(calls.includes('SECOND-ACP'), false);
  assert.equal(result.status, 'BLOCKED');
});
