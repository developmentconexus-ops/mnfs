import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { S1_CRITERIA } from '../src/contract.mjs';
import { sha256Bytes } from '../src/artifacts.mjs';
import {
  parseExecutionAuthorizationToken,
  S1_EXECUTION_AUTHORITY_BINDING,
} from '../src/execution-authority.mjs';
import { buildS1Report } from '../src/report.mjs';
import { orchestrateS1 } from '../src/run.mjs';
import { createS1Fixture } from '../src/fixture.mjs';
import { createS1CandidateExecutors } from '../src/executors.mjs';
import { executeCli, deriveS1RunRoot, loadRun } from '../src/cli.mjs';
import { observeRepositoryIdentity, FIXED_GIT_ENV } from '../src/probes/repository.mjs';
import { observeLinuxStateRoot } from '../src/probes/state-root.mjs';
import { observeStagedCandidateProvenance } from '../src/probes/candidate-provenance.mjs';
import { S1_FROZEN_CANDIDATE_PROVENANCE } from '../src/preflight.mjs';

const PLAN_BLOB = '277dffc521754a4370bfd94132dc9467589fdcf0';
const CONTRACT_HASH = 'sha256:bd34f566bec1c3fc32b8ab1617dac88f997ab9a91cbc6b83e42eb27dcbf9736a';
const FRESH_BASE = 'a'.repeat(40);
const FRESH_VERIFY_RUN = '987654321';
const SCOPE = 'pi-first-runtime-conformance';
const TOKEN = `MNFS_AUTHORIZE_ARR_S1_EXECUTE plan_blob=${PLAN_BLOB} contract_sha256=${CONTRACT_HASH} base_sha=${FRESH_BASE} verify_run=${FRESH_VERIFY_RUN} scope=${SCOPE}`;
const AUTHORITY = parseExecutionAuthorizationToken(TOKEN);
const POLICY = Object.freeze({
  pinningRule: 'pin the exact reviewed candidate identity',
  upgradeTrigger: 'supported public-boundary or security change',
  mandatoryConformanceRerun: 'rerun the complete S1 contract',
  rollbackRule: 'restore the last passing identity',
});
const REMOVAL = Object.freeze({
  removeOrReplaceWhen: 'the candidate no longer conforms',
  authorityOrSecurityTrigger: 'authority or security is no longer bounded',
  provenanceOrLicenseTrigger: 'provenance or license cannot be verified',
  maintenanceTrigger: 'maintenance cost exceeds eliminated machinery',
  replacementOrExitPath: 'replace with another concrete passing adapter',
});

function artifact(id) {
  return {
    id,
    path: `evidence/${id}.json`,
    sha256: `sha256:${'a'.repeat(64)}`,
    sizeBytes: 1,
  };
}

function candidate(shape, overrides = {}) {
  const artifacts = [
    ...S1_CRITERIA.map((id) => artifact(id)),
    artifact('supported-boundary'),
    artifact('provenance'),
    artifact('dependency-admission'),
  ];
  return {
    candidateShape: shape,
    finalized: true,
    verdict: 'PASS',
    criterionResults: S1_CRITERIA.map((id) => ({ id, status: 'PASS', artifactRefs: [id] })),
    artifactRecords: artifacts,
    supportedBoundaryEvidence: { kind: 'PUBLIC_ADAPTER_SURFACE', observation: 'fixture' },
    provenanceEvidence: { ...S1_FROZEN_CANDIDATE_PROVENANCE[shape], stagedPaths: [{ path: '/staged/module.mjs', sha256: `sha256:${'a'.repeat(64)}`, sizeBytes: 1 }] },
    dependencyAdmissionEvidence: { upgradePolicy: { ...POLICY }, removalConditions: { ...REMOVAL } },
    supportedBoundaryEvidenceRefs: ['supported-boundary'],
    provenanceEvidenceRefs: ['provenance'],
    dependencyAdmissionEvidenceRefs: ['dependency-admission'],
    evidenceIntegrity: { valid: true },
    upgradePolicy: { ...POLICY },
    removalConditions: { ...REMOVAL },
    boundary: {
      boundaryId: `${shape}-BOUNDARY`,
      candidateShape: shape,
      finalized: true,
      verdict: 'PASS',
      criterionResults: S1_CRITERIA.map((id) => ({ id, status: 'PASS', artifactRefs: [id] })),
      artifactRecords: artifacts,
      supportedBoundaryEvidence: { kind: 'PUBLIC_ADAPTER_SURFACE', observation: 'fixture' },
      provenanceEvidence: { ...S1_FROZEN_CANDIDATE_PROVENANCE[shape], stagedPaths: [{ path: '/staged/module.mjs', sha256: `sha256:${'a'.repeat(64)}`, sizeBytes: 1 }] },
      dependencyAdmissionEvidence: { upgradePolicy: { ...POLICY }, removalConditions: { ...REMOVAL } },
      supportedBoundaryEvidenceRefs: ['supported-boundary'],
      provenanceEvidenceRefs: ['provenance'],
      dependencyAdmissionEvidenceRefs: ['dependency-admission'],
      evidenceIntegrity: { valid: true },
      upgradePolicy: { ...POLICY },
      removalConditions: { ...REMOVAL },
    },
    ...overrides,
  };
}

const externalComparison = { candidateShape: 'OPENCODE-ACP', finalized: true, verdict: 'FAIL' };

test('accepts fresh GATE-S1 base/verify identities while keeping only plan/contract/scope static', () => {
  assert.equal(S1_EXECUTION_AUTHORITY_BINDING.planBlob, PLAN_BLOB);
  assert.equal(S1_EXECUTION_AUTHORITY_BINDING.contractSha256, CONTRACT_HASH);
  assert.equal(S1_EXECUTION_AUTHORITY_BINDING.scope, SCOPE);
  assert.equal('baseSha' in S1_EXECUTION_AUTHORITY_BINDING, false);
  assert.equal('verifyRun' in S1_EXECUTION_AUTHORITY_BINDING, false);
  assert.equal(AUTHORITY.baseSha, FRESH_BASE);
  assert.equal(AUTHORITY.verifyRun, Number(FRESH_VERIFY_RUN));
});

test('production preflight does not accept source, state-root or provenance assertions supplied as plain caller values', async () => {
  const { preflightS1 } = await import('../src/preflight.mjs');
  const result = await preflightS1({
    executionAuthorization: AUTHORITY,
    source: { clean: true, commitSha: FRESH_BASE, treeSha: 'b'.repeat(40) },
    stateRoot: { platform: 'linux', path: '/home/fake/state', realPath: '/home/fake/state', isDirectory: true, writable: true, filesystem: 'ext4' },
    provenance: {},
    credentials: { authorized: true, provider: 'fixture', authMethodClass: 'fixture' },
    repoRoot: '/definitely-not-the-current-repository',
  });
  assert.equal(result.status, 'BLOCKED');
  assert.equal(result.source, null);
  assert.notEqual(result.stateRoot?.path, '/home/fake/state');
  assert.ok(result.blockers.some(({ id }) => ['observers', 'sourceCleanAndBound'].includes(id)));
});

test('Git observer uses fixed system/global config and disables hooks/fsmonitor', async () => {
  const calls = [];
  const outputs = new Map([
    ['rev-parse\u0000HEAD', `${FRESH_BASE}\n`],
    ['rev-parse\u0000HEAD^{tree}', `${'c'.repeat(40)}\n`],
    ['status\u0000--porcelain=v1\u0000--untracked-files=normal', ''],
  ]);
  const observed = await observeRepositoryIdentity({
    repoRoot: '/home/example/src/mnfs',
    runCommand: async (spec) => {
      calls.push(spec);
      return { exitCode: 0, stdout: Buffer.from(outputs.get(spec.argv.slice(1).join('\u0000')) ?? '') };
    },
  });
  assert.equal(observed.clean, true);
  assert.equal(observed.source.commitSha, FRESH_BASE);
  assert.equal(calls.every(({ env }) => env.GIT_CONFIG_NOSYSTEM === '1' && env.GIT_CONFIG_GLOBAL === '/dev/null'), true);
  assert.equal(FIXED_GIT_ENV.GIT_CONFIG_VALUE_1, '/dev/null');
});

test('state-root and staged-provenance observers inspect actual local bytes', async () => {
  const stateRoot = await mkdtemp(path.join(tmpdir(), 'mnfs-arr-s1-observer-'));
  try {
    const provenancePath = path.join(stateRoot, 'candidates', 'staging-manifest.json');
    const stagedPath = path.join(stateRoot, 'candidates', 'fixture-module.mjs');
    await (await import('node:fs/promises')).mkdir(path.dirname(provenancePath), { recursive: true });
    await writeFile(stagedPath, 'export const fixture = true;\n');
    const stagedBytes = await (await import('node:fs/promises')).readFile(stagedPath);
    const staged = {
      path: 'candidates/fixture-module.mjs',
      sha256: `sha256:${createHash('sha256').update(stagedBytes).digest('hex')}`,
      sizeBytes: stagedBytes.length,
      role: 'UPSTREAM_MODULE',
    };
    await writeFile(provenancePath, JSON.stringify({
      schemaVersion: 1,
      source: 'MNFS_TRUSTED_STAGING_V1',
      records: {
        'PI-SDK': {
          candidateShape: 'PI-SDK',
          version: 'fixture',
          stagedPaths: [staged],
          upstreamSurfaces: { runtimeModule: { ...staged, role: 'UPSTREAM_MODULE' } },
        },
      },
    }));
    const state = await observeLinuxStateRoot({ stateRoot, runCommand: async () => ({ exitCode: 0, stdout: Buffer.from('ext4\n') }) });
    const provenance = await observeStagedCandidateProvenance({ stateRoot });
    assert.equal(state.path, stateRoot);
    assert.equal(state.realPath, stateRoot);
    assert.equal(state.writable, true);
    assert.equal(provenance.records['PI-SDK'].version, 'fixture');
    assert.equal(provenance.records['PI-SDK'].stagedPaths[0].path, stagedPath);
    assert.equal(provenance.sourcePath, provenancePath);
  } finally {
    await rm(stateRoot, { recursive: true, force: true });
  }
});

test('arbitrary provenance.json is not a trusted staging boundary', async () => {
  const stateRoot = await mkdtemp(path.join(tmpdir(), 'mnfs-arr-s1-untrusted-provenance-'));
  try {
    const provenancePath = path.join(stateRoot, 'candidates', 'provenance.json');
    await (await import('node:fs/promises')).mkdir(path.dirname(provenancePath), { recursive: true });
    await writeFile(provenancePath, JSON.stringify({ records: S1_FROZEN_CANDIDATE_PROVENANCE }));
    const observed = await observeStagedCandidateProvenance({ stateRoot });
    assert.equal(observed.state, 'MISSING');
    assert.deepEqual(observed.records, {});
  } finally {
    await rm(stateRoot, { recursive: true, force: true });
  }
});

test('fixture Git operations are isolated from global/system config and hooks', async () => {
  const fixture = await createS1Fixture();
  try {
    assert.equal(fixture.gitEnvironment.GIT_CONFIG_NOSYSTEM, '1');
    assert.equal(fixture.gitEnvironment.GIT_CONFIG_GLOBAL, '/dev/null');
    assert.equal(fixture.gitEnvironment.GIT_CONFIG_VALUE_1, '/dev/null');
  } finally {
    await fixture.dispose();
  }
});

test('PASS requires verifiable artifact references and dedicated C12/C13/C16 Evidence', () => {
  const missingRefs = candidate('PI-SDK', {
    criterionResults: S1_CRITERIA.map((id) => ({ id, status: 'PASS' })),
  });
  const report = buildS1Report({ candidates: [missingRefs], externalComparison });
  assert.equal(report.status, 'BLOCKED');
  assert.equal(report.runtimeDecisionInput.selectionEligible, false);

  for (const field of ['supportedBoundaryEvidenceRefs', 'provenanceEvidenceRefs', 'dependencyAdmissionEvidenceRefs']) {
    const incomplete = candidate('PI-SDK', { [field]: [] });
    const next = buildS1Report({ candidates: [incomplete], externalComparison });
    assert.equal(next.status, 'BLOCKED', field);
    assert.equal(next.boundaryDecisionInput.selectionEligible, false, field);
  }
  for (const field of ['supportedBoundaryEvidenceRefs', 'provenanceEvidenceRefs', 'dependencyAdmissionEvidenceRefs']) {
    const misbound = candidate('PI-SDK', { [field]: ['S1-C01'] });
    assert.equal(buildS1Report({ candidates: [misbound], externalComparison }).status, 'BLOCKED', field);
  }
});

test('independent runtime/boundary inputs block ambiguous multiple valid choices without deciding Evidence', () => {
  const report = buildS1Report({
    candidates: [candidate('PI-SDK'), candidate('PI-ACP')],
    externalComparison,
  });
  assert.equal(report.status, 'BLOCKED');
  assert.equal(report.runtimeDecisionInput.selected, null);
  assert.equal(report.boundaryDecisionInput.selected, null);
});

test('runtime and ACP boundary may be selected independently when each has unique deciding Evidence', () => {
  const runtime = candidate('PI-SDK');
  const acpBoundary = candidate('PI-ACP').boundary;
  runtime.boundary = acpBoundary;
  const report = buildS1Report({ candidates: [runtime], externalComparison });
  assert.equal(report.status, 'SUCCESS');
  assert.equal(report.runtimeDecisionInput.selectedCandidateShape, 'PI-SDK');
  assert.equal(report.boundaryDecisionInput.selectedBoundaryId, 'PI-ACP-BOUNDARY');
});

test('blocked applicability and incomplete required candidates cannot produce SUCCESS', () => {
  const blockedApplicability = buildS1Report({
    candidates: [candidate('PI-SDK')],
    applicability: { piRpc: 'BLOCKED', secondAcp: 'NOT_REQUIRED' },
    externalComparison,
  });
  assert.equal(blockedApplicability.status, 'BLOCKED');

  const missingRequired = buildS1Report({
    candidates: [candidate('PI-SDK')],
    applicability: { piRpc: 'REQUIRED', secondAcp: 'NOT_REQUIRED' },
    externalComparison,
  });
  assert.equal(missingRequired.status, 'BLOCKED');

  const external = { candidateShape: 'OPENCODE-ACP', finalized: true, verdict: 'FAIL' };
  const missingRequiredCandidate = buildS1Report({
    candidates: [candidate('PI-SDK')],
    applicability: { piRpc: 'REQUIRED', secondAcp: 'NOT_REQUIRED' },
    externalComparison: external,
  });
  assert.equal(missingRequiredCandidate.status, 'BLOCKED');

  const blockedRequiredCandidate = buildS1Report({
    candidates: [candidate('PI-SDK'), candidate('PI-RPC', 'BLOCKED')],
    applicability: { piRpc: 'REQUIRED', secondAcp: 'NOT_REQUIRED' },
    externalComparison: external,
  });
  assert.equal(blockedRequiredCandidate.status, 'BLOCKED');
});

test('final verdict values outside the contract fail closed', async () => {
  const result = await orchestrateS1({
    preflight: async () => ({ status: 'READY', operationAllowed: true }),
    executors: {},
    reportBuilder: () => ({ status: 'SUCCEEDED', runtimeDecisionInput: {}, boundaryDecisionInput: {} }),
  });
  assert.equal(result.status, 'BLOCKED');
  assert.equal(result.report.status, 'BLOCKED');
});

test('orchestrator does not pass a caller-controlled executeCandidates assertion to executors', async () => {
  let received;
  await orchestrateS1({
    preflight: async () => ({ status: 'READY', operationAllowed: true }),
    executors: {
      'PI-SDK': async (input) => {
        received = input;
        return { candidateShape: 'PI-SDK', finalized: false, verdict: null };
      },
    },
  });
  assert.equal('executeCandidates' in received, false);
});

test('PI-SDK executor does not claim exact environment proof from in-process execution', async () => {
  const fixture = await createS1Fixture();
  try {
    const executors = createS1CandidateExecutors({
      fixture,
      processBoundary: { kind: 'IN_PROCESS', run: async (fn) => fn() },
      piSdkAdapterFactory: () => ({ initialize: async () => ({}), startTurn: () => Promise.resolve({ settled: true, events: [] }), close: async () => {} }),
    });
    const result = await executors['PI-SDK']({ fixture, runId: 'arr-s1-in-process' });
    assert.equal(result.verdict, 'BLOCKED');
    assert.equal(result.criterionResults.find(({ id }) => id === 'S1-C02')?.status, 'BLOCKED');
  } finally {
    await fixture.dispose();
  }
});

test('criterion Evidence blocks caller boolean assertions instead of deriving PASS from them', async () => {
  const fixture = await createS1Fixture();
  const runRoot = await mkdtemp(path.join(tmpdir(), 'mnfs-arr-s1-boolean-claims-'));
  try {
    await writeFile(fixture.targetFilePath, fixture.expectedTree.targetContent);
    const record = {
      ...S1_FROZEN_CANDIDATE_PROVENANCE['PI-SDK'],
      stagedPaths: [{ path: '/staged/module.mjs', sha256: `sha256:${'a'.repeat(64)}`, sizeBytes: 1 }],
      upgradePolicy: POLICY,
      removalConditions: REMOVAL,
    };
    const oldBooleanAssertions = {
      cwd: fixture.workspacePath,
      toolInventoryMatches: true,
      discoverySuppressed: true,
      authSupported: true,
      cancellationBounded: true,
      outputBounded: true,
      processDeathClassified: true,
      freshRecoveryVerified: true,
      supportedBoundary: true,
      authoritySafe: true,
      machineryLeverage: true,
    };
    const toolCalls = [
      { id: 'read_nonce_file', path: fixture.nonceRelativePath, value: fixture.nonce },
      { id: 'edit_result_file', path: fixture.targetRelativePath },
    ];
    const executors = createS1CandidateExecutors({
      fixture,
      processBoundary: {
        kind: 'ACTOR_RUN_PROCESS',
        run: async (_spec, action) => ({
          ...(await action()),
          boundaryObservation: { cwd: fixture.workspacePath, envDigest: `sha256:${'e'.repeat(64)}`, envSource: 'EXPLICIT_STAGED_ENV' },
        }),
      },
      piSdkAdapterFactory: () => ({
        initialize: async () => ({}),
        startTurn: async () => ({ settled: true, outcome: 'COMPLETED', events: [{ type: 'done' }], toolCalls, observations: oldBooleanAssertions }),
        close: async () => {},
      }),
    });
    const result = await executors['PI-SDK']({
      fixture,
      runRoot,
      artifactBinding: {
        runId: 'arr-s1-boolean-claims',
        candidateShape: 'PI-SDK',
        runKey: sha256Bytes(Buffer.from('boolean-claims')),
        contractHash: CONTRACT_HASH,
        fixtureHash: fixture.fixtureHash,
        sourceTreeHash: `sha256:${'f'.repeat(64)}`,
      },
      preflight: {
        provenance: {
          trustedBoundary: 'TEST_FAITHFUL_STAGING',
          integrity: { manifestSha256: `sha256:${'a'.repeat(64)}` },
          records: { 'PI-SDK': record },
        },
      },
    });
    assert.notEqual(result.verdict, 'PASS');
  } finally {
    await fixture.dispose();
    await rm(runRoot, { recursive: true, force: true });
  }
});

test('injected doubles cannot write PASS Evidence without trusted process observations', async () => {
  const fixture = await createS1Fixture();
  const runRoot = await mkdtemp(path.join(tmpdir(), 'mnfs-arr-s1-executor-path-'));
  const observations = {
    cwd: fixture.workspacePath,
    inventory: ['read_nonce_file', 'edit_result_file'],
    discovery: { extensions: [], skills: [], prompts: [], themes: [], agentsFiles: [] },
    auth: { outcome: 'AUTHORIZED', methodClass: 'fixture-double' },
    cancellation: { checkpoint: 'CANCELLATION_BEFORE_FINALIZED', outcome: 'CANCELLED', durationMs: 1 },
    output: { bytes: 128, limitBytes: 4096 },
    processDeath: { checkpoint: 'PROCESS_DEATH_BEFORE_FINALIZED', outcome: 'SIGNAL_DEATH' },
    recovery: { phase: 'FRESH_PROCESS', verified: 'fixture-result' },
    authority: { sessionRole: 'OBSERVATIONAL', recoveryOwner: 'MNFS' },
    machinery: { reused: ['fixture', 'artifacts', 'process-runner'] },
    supportedBoundary: { kind: 'PUBLIC_ADAPTER_SURFACE', observation: 'FIXTURE_DOUBLE' },
  };
  const events = [{ type: 'runtime.completed' }];
  const toolCalls = [
    { id: 'read_nonce_file', path: fixture.nonceRelativePath, value: fixture.nonce },
    { id: 'edit_result_file', path: fixture.targetRelativePath },
  ];
  const settled = { settled: true, outcome: 'COMPLETED', events, toolCalls, observations };
  const envDigest = `sha256:${'e'.repeat(64)}`;
  const fakeSdkAdapter = () => ({
    observations,
    initialize: async () => ({ status: 'READY' }),
    startTurn: async () => settled,
    close: async () => {},
  });
  const fakeAcpAdapter = () => ({
    observations,
    supportsFixtureTools: true,
    processSpec: { cwd: fixture.workspacePath, env: { MNFS_FIXTURE: '1' } },
    initialize: async () => ({ status: 'READY' }),
    startSession: async () => ({ sessionId: 'fixture-session' }),
    prompt: async () => ({ settled: Promise.resolve(settled), events }),
    shutdown: async () => {},
  });
  const processBoundary = {
    kind: 'ACTOR_RUN_PROCESS',
    run: async (_spec, action) => ({
      ...(await action()),
      boundaryObservation: { cwd: fixture.workspacePath, envDigest, envSource: 'EXPLICIT_STAGED_ENV' },
      observations,
    }),
  };
  try {
    const executors = createS1CandidateExecutors({
      fixture,
      processBoundary,
      piSdkAdapterFactory: fakeSdkAdapter,
      piAcpAdapterFactory: fakeAcpAdapter,
      openCodeAdapterFactory: fakeAcpAdapter,
    });
    for (const candidateShape of ['PI-SDK', 'PI-ACP', 'OPENCODE-ACP']) {
      await writeFile(fixture.targetFilePath, fixture.expectedTree.targetContent);
      const result = await executors[candidateShape]({
        fixture,
        runId: 'arr-s1-executor-path',
        runRoot,
        artifactBinding: {
          runId: 'arr-s1-executor-path',
          candidateShape,
          runKey: sha256Bytes(Buffer.from(candidateShape)),
          contractHash: CONTRACT_HASH,
          fixtureHash: fixture.fixtureHash,
          sourceTreeHash: `sha256:${'f'.repeat(64)}`,
        },
        preflight: {
          provenance: {
            trustedBoundary: 'TEST_FAITHFUL_STAGING',
            integrity: { manifestSha256: `sha256:${'a'.repeat(64)}` },
            records: {
              [candidateShape]: {
                ...S1_FROZEN_CANDIDATE_PROVENANCE[candidateShape],
                stagedPaths: [{ path: '/staged/module.mjs', sha256: `sha256:${'a'.repeat(64)}`, sizeBytes: 1 }],
                upgradePolicy: POLICY,
                removalConditions: REMOVAL,
              },
            },
          },
        },
      });
      assert.notEqual(result.verdict, 'PASS', `${candidateShape}: ${JSON.stringify(result.criterionResults)}`);
      if (result.evidenceIntegrity.ok) {
        assert.equal(result.criterionResults.length, S1_CRITERIA.length, candidateShape);
        assert.ok(result.criterionResults.some(({ status }) => status !== 'PASS'), candidateShape);
        assert.equal(result.artifactRecords.length, S1_CRITERIA.length + 3, candidateShape);
      }
    }
  } finally {
    await fixture.dispose();
    await rm(runRoot, { recursive: true, force: true });
  }
});

test('report reopens persisted state without in-memory runs and verifies artifact hashes before returning data', async () => {
  const base = await mkdtemp(path.join(tmpdir(), 'mnfs-arr-s1-cli-recovery-'));
  const stateRoot = path.join(base, 'mnfs');
  const runId = 'arr-s1-fresh-report';
  const stdout = { write() {} };
  const report = { status: 'SUCCESS', runId, complete: true, candidates: [] };
  try {
    await executeCli(['run', '--json'], {
      stdout,
      stateRoot,
      runId,
      run: async () => ({
        runId,
        preflight: {
          executionAuthorization: { contractSha256: CONTRACT_HASH },
          source: { treeSha: 'c'.repeat(40) },
          stateRoot: { path: stateRoot },
        },
        fixture: { fixtureHash: `sha256:${'d'.repeat(64)}` },
        candidates: [],
        report,
      }),
    });
    assert.deepEqual(await loadRun(runId, stateRoot), { ...report, integrity: { ok: true, errors: [] } });
    await writeFile(path.join(deriveS1RunRoot(stateRoot, runId), 'report.json'), 'tampered\n');
    await assert.rejects(() => loadRun(runId, stateRoot), /integrity|hash|artifact/u);
  } finally {
    await rm(base, { recursive: true, force: true });
  }
});
