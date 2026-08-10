import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';

import { S1_CRITERIA } from './contract.mjs';
import { verifyFixtureResult } from './fixture.mjs';
import { deriveCandidateVerdict } from './evaluate.mjs';
import { verifyArtifactRecords, writeJsonArtifact } from './artifacts.mjs';
import { createPiSdkAdapter } from './adapters/pi-sdk.mjs';
import { createPiAcpAdapter } from './adapters/pi-acp.mjs';
import { createOpenCodeAcpAdapter } from './adapters/opencode-acp.mjs';
import { S1_FROZEN_CANDIDATE_PROVENANCE } from './preflight.mjs';

const HASH_PATTERN = /^sha256:[a-f0-9]{64}$/u;

function clone(value) {
  return value === undefined ? undefined : structuredClone(value);
}

function policyComplete(value, fields) {
  return value && typeof value === 'object' && fields.every((field) => typeof value[field] === 'string' && value[field].trim() !== '');
}

const POLICY_FIELDS = Object.freeze(['pinningRule', 'upgradeTrigger', 'mandatoryConformanceRerun', 'rollbackRule']);
const REMOVAL_FIELDS = Object.freeze(['removeOrReplaceWhen', 'authorityOrSecurityTrigger', 'provenanceOrLicenseTrigger', 'maintenanceTrigger', 'replacementOrExitPath']);

function blockedCandidate(candidateShape, reason, criterionResults = []) {
  return {
    candidateShape,
    finalized: true,
    verdict: 'BLOCKED',
    criterionResults: criterionResults.length > 0
      ? criterionResults
      : S1_CRITERIA.map((id) => ({ id, status: 'BLOCKED', artifactRefs: [] })),
    evidenceIntegrity: { valid: false, errors: [reason] },
    blockers: [reason],
  };
}

function proofStatus(value) {
  return value === true ? 'PASS' : value === false ? 'FAIL' : 'BLOCKED';
}

function exactProvenance(shape, preflight, execution) {
  const record = expectedProvenance(shape, preflight);
  const expected = S1_FROZEN_CANDIDATE_PROVENANCE[shape];
  return Boolean(expected && record?.candidateShape === shape
    && record.version === expected.version
    && record.package === expected.package
    && record.sourceIdentity === expected.sourceIdentity
    && record.license === expected.license
    && Array.isArray(record.stagedPaths)
    && record.stagedPaths.length > 0
    && record.stagedPaths.every((file) => typeof file?.path === 'string'
      && HASH_PATTERN.test(file.sha256 ?? '')
      && Number.isSafeInteger(file.sizeBytes) && file.sizeBytes >= 0));
}

function expectedProvenance(shape, preflight) {
  const provenance = preflight?.provenance;
  const trusted = provenance?.trustedBoundary === 'MNFS_TRUSTED_STAGING_V1'
    || provenance?.trustedBoundary === 'TEST_FAITHFUL_STAGING';
  if (!trusted || !HASH_PATTERN.test(provenance?.integrity?.manifestSha256 ?? '')) return null;
  return provenance.records?.[shape] ?? null;
}

function digest(value) {
  return `sha256:${createHash('sha256').update(JSON.stringify(value)).digest('hex')}`;
}

function hasExactInventory(value, fixture) {
  const expected = fixture?.inventory?.map((item) => item.id).sort();
  return Array.isArray(value) && Array.isArray(expected)
    && JSON.stringify([...value].sort()) === JSON.stringify(expected);
}

function discoveryEmpty(value) {
  return value && typeof value === 'object'
    && ['extensions', 'skills', 'prompts', 'themes', 'agentsFiles'].every((key) => Array.isArray(value[key]) && value[key].length === 0);
}

function explicitBoundaryObservation(boundary) {
  return boundary?.boundaryObservation
    ?? (boundary?.observations?.cwd && boundary?.observations?.envDigest
      ? { cwd: boundary.observations.cwd, envDigest: boundary.observations.envDigest, envSource: boundary.observations.envSource }
      : null);
}

function buildProofs({ candidateShape, fixture, preflight, execution, adapter, boundary }) {
  const observations = execution?.observations ?? {};
  const adapterObservations = adapter?.observations ?? {};
  const events = execution?.events ?? [];
  const settled = execution?.settled ?? null;
  const auth = observations.auth;
  const cancellation = observations.cancellation;
  const output = observations.output ?? execution?.output;
  const processDeath = observations.processDeath;
  const recovery = observations.recovery;
  const authority = observations.authority;
  const machinery = observations.machinery;
  const supportedBoundary = observations.supportedBoundary ?? adapterObservations.supportedBoundary;
  const observedBoundary = explicitBoundaryObservation(boundary);
  return {
    'S1-C01': observations.cwd === fixture?.workspacePath,
    'S1-C02': typeof boundary?.kind === 'string' && observedBoundary?.cwd === fixture?.workspacePath
      && HASH_PATTERN.test(observedBoundary.envDigest ?? '')
      && ['EXPLICIT_STAGED_ENV', 'STAGED_PROVENANCE_ENV'].includes(observedBoundary.envSource),
    'S1-C03': hasExactInventory(observations.inventory, fixture) && observations.fixtureVerified === true,
    'S1-C04': discoveryEmpty(observations.discovery),
    'S1-C05': auth?.outcome === 'AUTHORIZED' && typeof auth.methodClass === 'string' && auth.methodClass.trim() !== '',
    'S1-C06': cancellation?.checkpoint === 'CANCELLATION_BEFORE_FINALIZED'
      && cancellation.outcome === 'CANCELLED' && Number.isSafeInteger(cancellation.durationMs) && cancellation.durationMs >= 0,
    'S1-C07': Array.isArray(events) && events.length > 0
      && Number.isSafeInteger(output?.bytes) && Number.isSafeInteger(output?.limitBytes)
      && output.bytes <= output.limitBytes,
    'S1-C08': settled?.settled === true && ['COMPLETED', 'FAILED', 'CANCELLED'].includes(settled.outcome),
    'S1-C09': processDeath?.checkpoint === 'PROCESS_DEATH_BEFORE_FINALIZED'
      && ['SIGNAL_DEATH', 'PROCESS_DEATH', 'TIMEOUT', 'CANCELLED'].includes(processDeath.outcome),
    'S1-C10': recovery?.phase === 'FRESH_PROCESS' && typeof recovery.verified === 'string' && recovery.verified.trim() !== '',
    'S1-C11': Array.isArray(events) && events.every((event) => event && typeof event.type === 'string'),
    'S1-C12': supportedBoundary && typeof supportedBoundary === 'object'
      && typeof supportedBoundary.kind === 'string' && supportedBoundary.kind.trim() !== ''
      && typeof supportedBoundary.observation === 'string' && supportedBoundary.observation.trim() !== '',
    'S1-C13': exactProvenance(candidateShape, preflight, execution),
    'S1-C14': authority?.sessionRole === 'OBSERVATIONAL' && authority.recoveryOwner === 'MNFS',
    'S1-C15': Array.isArray(machinery?.reused)
      && ['fixture', 'artifacts', 'process-runner'].every((name) => machinery.reused.includes(name)),
    'S1-C16': policyComplete(expectedProvenance(candidateShape, preflight)?.upgradePolicy, POLICY_FIELDS)
      && policyComplete(expectedProvenance(candidateShape, preflight)?.removalConditions, REMOVAL_FIELDS),
  };
}

async function writeEvidence({ candidateShape, fixture, runRoot, binding, proofs, execution, adapter, evidencePrefix = `evidence/${candidateShape}` }) {
  if (typeof runRoot !== 'string' || !binding) return blockedCandidate(candidateShape, 'durable run root and artifact binding are required before PASS Evidence can be derived');
  const records = [];
  const refs = {};
  for (const id of S1_CRITERIA) {
    const record = await writeJsonArtifact(runRoot, `${evidencePrefix}/${id}.json`, {
      candidateShape,
      fixtureId: fixture?.fixtureId ?? null,
      criterionId: id,
      observed: proofs[id],
      observations: clone(execution?.observations ?? null),
      execution: clone(execution?.evidence ?? null),
      adapter: clone(adapter?.observations ?? null),
    }, { binding, kind: 'criterion-evidence' });
    records.push(record);
    refs[id] = record.id;
  }
  const specialized = [
    ['supportedBoundaryEvidenceRefs', 'supported-boundary', { supportedBoundary: clone(execution?.observations?.supportedBoundary ?? adapter?.observations?.supportedBoundary ?? null), adapter: clone(adapter?.observations ?? null) }],
    ['provenanceEvidenceRefs', 'provenance', { provenance: clone(execution?.provenance ?? null) }],
    ['dependencyAdmissionEvidenceRefs', 'dependency-admission', { upgradePolicy: clone(execution?.provenance?.upgradePolicy), removalConditions: clone(execution?.provenance?.removalConditions) }],
  ];
  const specializedRefs = {};
  for (const [field, name, value] of specialized) {
    const record = await writeJsonArtifact(runRoot, `${evidencePrefix}/${name}.json`, value, { binding, kind: 'dependency-evidence' });
    records.push(record);
    specializedRefs[field] = [record.id];
  }
  const integrity = await verifyArtifactRecords(runRoot, records, binding);
  const criterionResults = S1_CRITERIA.map((id) => ({ id, status: proofStatus(proofs[id]), artifactRefs: [refs[id]] }));
  const result = {
    candidateShape,
    criterionResults,
    artifactRecords: records,
    evidenceIntegrity: integrity,
    supportedBoundaryEvidence: clone(specialized[0][2].supportedBoundary),
    provenanceEvidence: clone(specialized[1][2].provenance),
    dependencyAdmissionEvidence: clone(specialized[2][2]),
    ...specializedRefs,
  };
  const derived = deriveCandidateVerdict({ criterionResults });
  return {
    ...result,
    finalized: true,
    verdict: derived.verdict,
    verdictReasons: derived.reasons,
    upgradePolicy: clone(execution?.provenance?.upgradePolicy),
    removalConditions: clone(execution?.provenance?.removalConditions),
  };
}

function attachBoundary(result, boundaryEvidence, candidateShape) {
  if (!result || typeof result !== 'object' || !result.finalized) return result;
  return {
    ...result,
    boundary: {
      boundaryId: `${candidateShape}-BOUNDARY`,
      candidateShape,
      ...clone(boundaryEvidence),
    },
  };
}

function provenanceFor(context, candidateShape) {
  return expectedProvenance(candidateShape, context?.preflight);
}

async function loadStagedSurface(record, name) {
  const descriptor = record?.surfaces?.[name];
  if (!descriptor?.path) return null;
  const module = await import(pathToFileURL(descriptor.path).href);
  if (!descriptor.export) return module;
  if (typeof module[descriptor.export] !== 'function') throw new TypeError(`staged ${name} surface export is unavailable`);
  return module[descriptor.export];
}

async function defaultAdapterFactory(candidateShape, { record, ...options }) {
  if (!record) return null;
  const stagedAdapter = await loadStagedSurface(record, 'adapter');
  const stagedOptions = {
    ...options,
    candidateShape,
    record,
    executable: record.surfaces?.executable?.path,
    env: record.environment,
    stagedSurfaces: record.surfaces,
  };
  if (candidateShape !== 'PI-SDK') stagedOptions.acpSdkSurface = await loadStagedSurface(record, 'acpSdk');
  if (typeof stagedAdapter === 'function' && record.surfaces?.adapter?.export) {
    return stagedAdapter(stagedOptions);
  }
  if (candidateShape === 'PI-SDK') {
    return createPiSdkAdapter({ ...options, sdk: stagedAdapter });
  }
  const adapterOptions = {
    ...options,
    executable: record.surfaces?.executable?.path,
    env: record.environment,
  };
  const acpSdk = await loadStagedSurface(record, 'acpSdk');
  if (typeof acpSdk === 'object' && acpSdk) {
    adapterOptions.clientFactory = acpSdk.createClient ?? acpSdk.Client ?? adapterOptions.clientFactory;
    adapterOptions.ndJsonStream = acpSdk.ndJsonStream ?? adapterOptions.ndJsonStream;
  }
  return candidateShape === 'PI-ACP'
    ? createPiAcpAdapter(adapterOptions)
    : createOpenCodeAcpAdapter(adapterOptions);
}

async function resolveProcessBoundary(candidateShape, context, record, supplied, adapter = null) {
  const explicit = supplied ?? context?.processBoundary;
  if (explicit) return typeof explicit === 'function'
    ? explicit({ candidateShape, cwd: context.fixture.workspacePath, env: record?.environment ?? {} })
    : explicit;
  if (record?.surfaces?.boundary?.export) {
    const factory = await loadStagedSurface(record, 'boundary');
    return factory({ candidateShape, cwd: context.fixture.workspacePath, env: record.environment, executable: record.surfaces?.executable?.path, stagedSurfaces: record.surfaces, fixture: context.fixture, context, record });
  }
  if (!adapter?.processSpec?.env) return null;
  const env = Object.fromEntries(Object.entries(adapter.processSpec.env).sort());
  return {
    kind: 'ACP_PROCESS_BOUNDARY',
    boundaryObservation: {
      cwd: adapter.processSpec.cwd,
      envDigest: digest(env),
      envSource: 'STAGED_PROVENANCE_ENV',
      argv: Array.isArray(adapter.processSpec.argv) ? [...adapter.processSpec.argv] : null,
    },
  };
}

async function writeRuntimeAndBoundary({ candidateShape, fixture, context, execution, adapter, boundary }) {
  const proofs = buildProofs({ candidateShape, fixture, preflight: context.preflight, execution, adapter, boundary });
  const runtime = await writeEvidence({ candidateShape, fixture, runRoot: context.runRoot, binding: context.artifactBinding, proofs, execution, adapter });
  if (!runtime.finalized) return runtime;
  const boundaryExecution = {
    ...execution,
    observations: {
      ...execution.observations,
      ...(boundary?.observations ?? {}),
      ...(boundary?.boundaryObservation ? {
        cwd: boundary.boundaryObservation.cwd,
        envDigest: boundary.boundaryObservation.envDigest,
        envSource: boundary.boundaryObservation.envSource,
      } : {}),
    },
    events: boundary?.events ?? execution.events,
  };
  const boundaryProofs = buildProofs({ candidateShape, fixture, preflight: context.preflight, execution: boundaryExecution, adapter, boundary });
  const boundaryEvidence = await writeEvidence({
    candidateShape,
    fixture,
    runRoot: context.runRoot,
    binding: context.artifactBinding,
    proofs: boundaryProofs,
    execution: boundaryExecution,
    adapter,
    evidencePrefix: `evidence/${candidateShape}/boundary`,
  });
  return attachBoundary(runtime, boundaryEvidence, candidateShape);
}

async function runPiSdk({ candidateShape, fixture, adapterFactory, processBoundary, context }) {
  if (processBoundary?.kind !== 'ACTOR_RUN_PROCESS' || typeof processBoundary.run !== 'function') {
    return blockedCandidate(candidateShape, 'PI-SDK C02 requires an exact-env ActorRun/process boundary; in-process execution is insufficient');
  }
  if (typeof adapterFactory !== 'function') return blockedCandidate(candidateShape, 'PI-SDK adapter is unavailable');
  let adapter;
  let settled;
  const record = provenanceFor(context, candidateShape);
  const boundary = await processBoundary.run({ candidateShape, cwd: fixture.workspacePath, env: record?.environment ?? {} }, async () => {
    adapter = await adapterFactory({ cwd: fixture.workspacePath, fixture, context, record });
    if (!adapter) throw new Error('staged PI-SDK adapter is unavailable');
    await adapter.initialize();
    settled = await adapter.startTurn(fixture.prompt);
    await adapter.close();
    return {
      settled,
      events: settled?.events ?? adapter.observe?.() ?? [],
      toolCalls: settled?.toolCalls ?? [],
      observations: settled?.observations ?? {},
    };
  });
  const toolCalls = boundary?.toolCalls ?? settled?.toolCalls ?? [];
  const fixtureResult = await verifyFixtureResult(fixture, { toolCalls });
  const execution = {
    ...(boundary?.execution ?? {}),
    settled: boundary?.settled ?? settled,
    events: boundary?.events ?? settled?.events ?? [],
    observations: { ...(boundary?.observations ?? {}), ...(settled?.observations ?? {}), fixtureVerified: fixtureResult.ok },
    toolCalls,
    provenance: record,
  };
  return writeRuntimeAndBoundary({
    candidateShape,
    fixture,
    context,
    execution,
    adapter,
    boundary: { ...boundary, kind: boundary.kind ?? processBoundary.kind },
  });
}

async function runAcp({ candidateShape, fixture, adapterFactory, processBoundary, context }) {
  if (typeof adapterFactory !== 'function') return blockedCandidate(candidateShape, 'ACP adapter is unavailable');
  const record = provenanceFor(context, candidateShape);
  const adapter = await adapterFactory({ cwd: fixture.workspacePath, fixture, context, record });
  if (!adapter) return blockedCandidate(candidateShape, 'staged ACP adapter is unavailable');
  const ready = await adapter.initialize();
  const session = await adapter.startSession({ cwd: fixture.workspacePath });
  const turn = await adapter.prompt({ prompt: fixture.prompt });
  const settled = turn?.settled ? await turn.settled : turn;
  await adapter.shutdown();
  const toolCalls = turn?.toolCalls ?? settled?.toolCalls ?? [];
  const fixtureResult = await verifyFixtureResult(fixture, { toolCalls });
  const execution = {
    ready,
    session,
    settled,
    events: turn?.events ?? settled?.events ?? [],
    observations: { ...(adapter.observations ?? {}), ...(turn?.observations ?? {}), ...(settled?.observations ?? {}), fixtureVerified: fixtureResult.ok },
    toolCalls,
    provenance: record,
  };
  const boundary = await resolveProcessBoundary(candidateShape, { ...context, fixture }, record, processBoundary, adapter);
  if (!boundary) return blockedCandidate(candidateShape, 'ACP process boundary is unavailable');
  return writeRuntimeAndBoundary({ candidateShape, fixture, context, execution, adapter, boundary });
}

export function createS1CandidateExecutors({
  fixture,
  processBoundary,
  piSdkAdapterFactory,
  piAcpAdapterFactory,
  openCodeAdapterFactory,
} = {}) {
  const withFixture = (context = {}) => ({ ...context, fixture: context.fixture ?? fixture });
  const factory = (shape, supplied) => supplied ?? ((options) => defaultAdapterFactory(shape, options));
  return Object.freeze({
    'PI-SDK': async (context) => {
      const active = withFixture(context);
      const record = provenanceFor(active, 'PI-SDK');
      const boundary = await resolveProcessBoundary('PI-SDK', active, record, active.processBoundary ?? processBoundary);
      return runPiSdk({ candidateShape: 'PI-SDK', fixture: active.fixture, adapterFactory: factory('PI-SDK', piSdkAdapterFactory), processBoundary: boundary, context: active });
    },
    'PI-ACP': async (context) => {
      const active = withFixture(context);
      return runAcp({ candidateShape: 'PI-ACP', fixture: active.fixture, adapterFactory: factory('PI-ACP', piAcpAdapterFactory), processBoundary: active.processBoundary, context: active });
    },
    'OPENCODE-ACP': async (context) => {
      const active = withFixture(context);
      return runAcp({ candidateShape: 'OPENCODE-ACP', fixture: active.fixture, adapterFactory: factory('OPENCODE-ACP', openCodeAdapterFactory), processBoundary: active.processBoundary, context: active });
    },
  });
}

export const createDeterministicS1Executors = createS1CandidateExecutors;
