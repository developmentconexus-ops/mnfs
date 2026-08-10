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
  const record = execution?.provenance ?? expectedProvenance(shape, preflight);
  const expected = S1_FROZEN_CANDIDATE_PROVENANCE[shape];
  return Boolean(expected && record?.candidateShape === shape
    && record.version === expected.version
    && record.package === expected.package
    && record.sourceIdentity === expected.sourceIdentity
    && record.license === expected.license);
}

function buildProofs({ candidateShape, fixture, preflight, execution, adapter, boundary }) {
  const observations = execution?.observations ?? {};
  const adapterObservations = adapter?.observations ?? {};
  const events = execution?.events ?? [];
  const settled = execution?.settled ?? null;
  const toolInventory = observations.toolInventoryMatches ?? adapterObservations.toolInventoryMatches;
  return {
    'S1-C01': observations.cwd === fixture?.workspacePath,
    'S1-C02': boundary?.exactEnvObserved === true && boundary?.envDigest && HASH_PATTERN.test(boundary.envDigest),
    'S1-C03': toolInventory === true && observations.fixtureVerified === true,
    'S1-C04': observations.discoverySuppressed === true || adapterObservations.discoverySuppressed === true,
    'S1-C05': observations.authSupported === true,
    'S1-C06': observations.cancellationBounded === true,
    'S1-C07': Array.isArray(events) && events.length > 0 && observations.outputBounded === true,
    'S1-C08': settled?.settled === true && ['COMPLETED', 'FAILED', 'CANCELLED'].includes(settled.outcome),
    'S1-C09': observations.processDeathClassified === true,
    'S1-C10': observations.freshRecoveryVerified === true,
    'S1-C11': Array.isArray(events) && events.every((event) => event && typeof event.type === 'string'),
    'S1-C12': observations.supportedBoundary === true || adapterObservations.supportedBoundary === true,
    'S1-C13': exactProvenance(candidateShape, preflight, execution),
    'S1-C14': observations.authoritySafe === true,
    'S1-C15': observations.machineryLeverage === true,
    'S1-C16': policyComplete(execution?.upgradePolicy, POLICY_FIELDS)
      && policyComplete(execution?.removalConditions, REMOVAL_FIELDS),
  };
}

async function writeEvidence({ candidateShape, fixture, runRoot, binding, proofs, execution, adapter }) {
  if (typeof runRoot !== 'string' || !binding) return blockedCandidate(candidateShape, 'durable run root and artifact binding are required before PASS Evidence can be derived');
  const records = [];
  const refs = {};
  for (const id of S1_CRITERIA) {
    const record = await writeJsonArtifact(runRoot, `evidence/${candidateShape}/${id}.json`, {
      candidateShape,
      fixtureId: fixture?.fixtureId ?? null,
      criterionId: id,
      observed: proofs[id],
      execution: clone(execution?.evidence ?? null),
      adapter: clone(adapter?.observations ?? null),
    }, { binding, kind: 'criterion-evidence' });
    records.push(record);
    refs[id] = record.id;
  }
  const specialized = [
    ['supportedBoundaryEvidenceRefs', 'supported-boundary', { supportedBoundary: proofs['S1-C12'], adapter: clone(adapter?.observations ?? null) }],
    ['provenanceEvidenceRefs', 'provenance', { provenance: clone(execution?.provenance ?? null) }],
    ['dependencyAdmissionEvidenceRefs', 'dependency-admission', { upgradePolicy: clone(execution?.upgradePolicy), removalConditions: clone(execution?.removalConditions) }],
  ];
  const specializedRefs = {};
  for (const [field, name, value] of specialized) {
    const record = await writeJsonArtifact(runRoot, `evidence/${candidateShape}/${name}.json`, value, { binding, kind: 'dependency-evidence' });
    records.push(record);
    specializedRefs[field] = [record.id];
  }
  const integrity = await verifyArtifactRecords(runRoot, records, binding);
  const criterionResults = S1_CRITERIA.map((id) => ({ id, status: proofStatus(proofs[id]), artifactRefs: [refs[id]] }));
  const result = {
    criterionResults,
    artifactRecords: records,
    evidenceIntegrity: integrity,
    ...specializedRefs,
  };
  const derived = deriveCandidateVerdict({ criterionResults });
  return {
    ...result,
    finalized: true,
    verdict: derived.verdict,
    verdictReasons: derived.reasons,
    upgradePolicy: clone(execution?.upgradePolicy),
    removalConditions: clone(execution?.removalConditions),
  };
}

function attachBoundary(result, candidateShape) {
  if (!result || typeof result !== 'object' || !result.finalized) return result;
  return {
    ...result,
    boundary: {
      boundaryId: `${candidateShape}-BOUNDARY`,
      candidateShape,
      finalized: result.finalized,
      verdict: result.verdict,
      criterionResults: clone(result.criterionResults),
      artifactRecords: clone(result.artifactRecords),
      supportedBoundaryEvidenceRefs: clone(result.supportedBoundaryEvidenceRefs),
      provenanceEvidenceRefs: clone(result.provenanceEvidenceRefs),
      dependencyAdmissionEvidenceRefs: clone(result.dependencyAdmissionEvidenceRefs),
      evidenceIntegrity: clone(result.evidenceIntegrity),
      upgradePolicy: clone(result.upgradePolicy),
      removalConditions: clone(result.removalConditions),
    },
  };
}

async function runPiSdk({ candidateShape, fixture, adapterFactory, processBoundary, context }) {
  if (processBoundary?.kind !== 'ACTOR_RUN_PROCESS' || processBoundary?.exactEnvObserved !== true) {
    return blockedCandidate(candidateShape, 'PI-SDK C02 requires an exact-env ActorRun/process boundary; in-process execution is insufficient');
  }
  if (typeof adapterFactory !== 'function' || typeof processBoundary.run !== 'function') {
    return blockedCandidate(candidateShape, 'PI-SDK adapter and ActorRun/process boundary are unavailable');
  }
  let settled;
  let adapter;
  const boundary = await processBoundary.run({ candidateShape, cwd: fixture.workspacePath, env: context.env ?? {} }, async () => {
    adapter = await adapterFactory({ cwd: fixture.workspacePath, fixture, context });
    await adapter.initialize();
    const turn = adapter.startTurn(fixture.prompt);
    settled = await turn;
    await adapter.close();
    return { settled, events: settled?.events ?? adapter.observe?.() ?? [], toolCalls: context.toolCalls ?? [] };
  });
  const fixtureResult = await verifyFixtureResult(fixture, { toolCalls: boundary?.toolCalls ?? context.toolCalls ?? [] });
  const execution = {
    ...(boundary?.execution ?? {}),
    settled: boundary?.settled ?? settled,
    cwd: fixture.workspacePath,
    events: boundary?.events ?? settled?.events ?? [],
    observations: { ...(boundary?.observations ?? {}), fixtureVerified: fixtureResult.ok },
    toolCalls: boundary?.toolCalls ?? context.toolCalls ?? [],
    provenance: context.preflight?.provenance?.[candidateShape],
    upgradePolicy: context.upgradePolicy,
    removalConditions: context.removalConditions,
  };
  const proofs = buildProofs({ candidateShape, fixture, preflight: context.preflight, execution, adapter, boundary });
  return attachBoundary(await writeEvidence({ candidateShape, fixture, runRoot: context.runRoot, binding: context.artifactBinding, proofs, execution, adapter }), candidateShape);
}

async function runAcp({ candidateShape, fixture, adapterFactory, context }) {
  if (typeof adapterFactory !== 'function') return blockedCandidate(candidateShape, 'ACP adapter is unavailable');
  const adapter = await adapterFactory({ cwd: fixture.workspacePath, fixture, context });
  const ready = await adapter.initialize();
  const session = await adapter.startSession({ cwd: fixture.workspacePath });
  const turn = await adapter.prompt({ prompt: fixture.prompt });
  const settled = turn?.settled ? await turn.settled : turn;
  await adapter.shutdown();
  const fixtureResult = await verifyFixtureResult(fixture, { toolCalls: context.toolCalls ?? [] });
  const execution = {
    ...(context.execution ?? {}),
    ready,
    session,
    cwd: fixture.workspacePath,
    settled,
    events: turn?.events ?? settled?.events ?? context.execution?.events ?? [],
    observations: { ...(context.execution?.observations ?? context.observations ?? {}), fixtureVerified: fixtureResult.ok },
    provenance: context.preflight?.provenance?.[candidateShape],
    upgradePolicy: context.upgradePolicy,
    removalConditions: context.removalConditions,
  };
  const boundary = {
    exactEnvObserved: adapter.processSpec?.env ? true : false,
    envDigest: context.envDigest,
  };
  const proofs = buildProofs({ candidateShape, fixture, preflight: context.preflight, execution, adapter, boundary });
  return await writeEvidence({ candidateShape, fixture, runRoot: context.runRoot, binding: context.artifactBinding, proofs, execution, adapter });
}

export function createS1CandidateExecutors({
  fixture,
  processBoundary,
  piSdkAdapterFactory,
  piAcpAdapterFactory,
  openCodeAdapterFactory,
} = {}) {
  const withFixture = (context = {}) => ({ ...context, fixture: context.fixture ?? fixture });
  return Object.freeze({
    'PI-SDK': (context) => runPiSdk({
      candidateShape: 'PI-SDK',
      fixture: context?.fixture ?? fixture,
      adapterFactory: piSdkAdapterFactory ?? ((options) => createPiSdkAdapter(options)),
      processBoundary: context?.processBoundary ?? processBoundary,
      context: withFixture(context),
    }),
    'PI-ACP': (context) => runAcp({
      candidateShape: 'PI-ACP',
      fixture: context?.fixture ?? fixture,
      adapterFactory: piAcpAdapterFactory ?? ((options) => createPiAcpAdapter(options)),
      context: withFixture(context),
    }),
    'OPENCODE-ACP': (context) => runAcp({
      candidateShape: 'OPENCODE-ACP',
      fixture: context?.fixture ?? fixture,
      adapterFactory: openCodeAdapterFactory ?? ((options) => createOpenCodeAcpAdapter(options)),
      context: withFixture(context),
    }),
  });
}

export const createDeterministicS1Executors = createS1CandidateExecutors;
