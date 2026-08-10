import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';

import { S1_CRITERIA } from './contract.mjs';
import { createFixtureTools, verifyFixtureResult } from './fixture.mjs';
import { deriveCandidateVerdict } from './evaluate.mjs';
import { verifyArtifactRecords, writeJsonArtifact } from './artifacts.mjs';
import { createPiSdkAdapter } from './adapters/pi-sdk.mjs';
import { createPiAcpAdapter } from './adapters/pi-acp.mjs';
import { createOpenCodeAcpAdapter } from './adapters/opencode-acp.mjs';
import { revalidateStagedCandidateProvenance } from './probes/candidate-provenance.mjs';
import { startProcess } from './process-runner.mjs';
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
  const record = execution?.trustedProvenance ?? expectedProvenance(shape, preflight);
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
      && Number.isSafeInteger(file.sizeBytes) && file.sizeBytes >= 0
      && typeof file.role === 'string' && file.role.startsWith('UPSTREAM_'))
    && !record.surfaces);
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

function buildProofs({ candidateShape, fixture, preflight, execution, adapter, boundary }) {
  const trusted = execution?.trustedProofs ?? {};
  const events = execution?.events ?? [];
  const settled = execution?.settled ?? null;
  return {
    'S1-C01': trusted.cwd === fixture?.workspacePath,
    'S1-C02': trusted.boundary?.cwd === fixture?.workspacePath
      && HASH_PATTERN.test(trusted.boundary?.envDigest ?? '')
      && trusted.boundary?.environmentMatchesRecord === true
      && trusted.boundary?.source === 'MNFS_TRUSTED_PROCESS_RUNNER',
    'S1-C03': hasExactInventory(trusted.inventory, fixture) && trusted.fixtureVerified === true,
    'S1-C04': discoveryEmpty(trusted.discovery),
    'S1-C05': trusted.auth?.outcome === 'AUTHORIZED' && typeof trusted.auth.methodClass === 'string' && trusted.auth.methodClass.trim() !== '',
    'S1-C06': trusted.cancellation?.outcome === 'CANCELLED'
      && trusted.cancellation?.source === 'MNFS_TRUSTED_PROCESS_RUNNER'
      && Number.isSafeInteger(trusted.cancellation.durationMs) && trusted.cancellation.durationMs >= 0,
    'S1-C07': Array.isArray(events) && events.length > 0
      && Number.isSafeInteger(trusted.output?.bytes) && Number.isSafeInteger(trusted.output?.limitBytes)
      && trusted.output.bytes <= trusted.output.limitBytes,
    'S1-C08': settled?.settled === true && ['COMPLETED', 'FAILED', 'CANCELLED'].includes(settled.outcome),
    'S1-C09': trusted.processDeath?.outcome === 'SIGNAL_DEATH'
      && trusted.processDeath?.source === 'MNFS_TRUSTED_PROCESS_RUNNER',
    'S1-C10': trusted.recovery?.phase === 'FRESH_PROCESS'
      && trusted.recovery?.source === 'MNFS_TRUSTED_RECOVERY_PROCESS'
      && trusted.recovery.verified === true,
    'S1-C11': Array.isArray(events) && events.every((event) => event && typeof event.type === 'string'),
    'S1-C12': trusted.supportedBoundary?.source === 'MNFS_TRUSTED_ADAPTER'
      && typeof trusted.supportedBoundary.kind === 'string'
      && typeof trusted.supportedBoundary.observation === 'string',
    'S1-C13': exactProvenance(candidateShape, preflight, execution),
    'S1-C14': trusted.authority?.sessionRole === 'OBSERVATIONAL' && trusted.authority.recoveryOwner === 'MNFS',
    'S1-C15': Array.isArray(trusted.machinery?.reused)
      && ['fixture', 'artifacts', 'process-runner'].every((name) => trusted.machinery.reused.includes(name)),
    'S1-C16': policyComplete(trusted.upgradePolicy, POLICY_FIELDS)
      && policyComplete(trusted.removalConditions, REMOVAL_FIELDS),
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
      trustedProofs: clone(execution?.trustedProofs ?? null),
      normalizedEvents: clone(execution?.events ?? null),
    }, { binding, kind: 'criterion-evidence' });
    records.push(record);
    refs[id] = record.id;
  }
  const specialized = [
    ['supportedBoundaryEvidenceRefs', 'supported-boundary', { supportedBoundary: clone(execution?.trustedProofs?.supportedBoundary ?? null) }],
    ['provenanceEvidenceRefs', 'provenance', { provenance: clone(execution?.trustedProvenance ?? null) }],
    ['dependencyAdmissionEvidenceRefs', 'dependency-admission', { upgradePolicy: clone(execution?.trustedProofs?.upgradePolicy), removalConditions: clone(execution?.trustedProofs?.removalConditions) }],
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
    upgradePolicy: clone(execution?.trustedProofs?.upgradePolicy),
    removalConditions: clone(execution?.trustedProofs?.removalConditions),
    evidenceSource: 'MNFS_TRUSTED_PROOF_ENGINE',
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

async function revalidatedRecord(context, candidateShape) {
  const stateRoot = context?.preflight?.stateRoot?.path;
  const manifestSha256 = context?.preflight?.provenance?.integrity?.manifestSha256;
  if (!stateRoot || !HASH_PATTERN.test(manifestSha256 ?? '')) {
    throw new Error(`trusted staging state is unavailable before using ${candidateShape}`);
  }
  const observed = await revalidateStagedCandidateProvenance({
    stateRoot,
    candidateShape,
    expectedManifestSha256: manifestSha256,
  });
  return observed.record;
}

async function loadVerifiedUpstreamSurface(context, candidateShape, name, exportName = null) {
  const record = await revalidatedRecord(context, candidateShape);
  const descriptor = record.upstreamSurfaces?.[name];
  if (!descriptor?.path) throw new Error(`trusted upstream ${name} surface is unavailable for ${candidateShape}`);
  const module = await import(`${pathToFileURL(descriptor.path).href}?sha256=${descriptor.sha256.slice(7)}`);
  if (!exportName) return module;
  if (typeof module[exportName] !== 'function') throw new TypeError(`staged upstream ${name} export is unavailable`);
  return module[exportName];
}

async function defaultAdapterFactory(candidateShape, { record, fixtureTools, ...options }) {
  if (!record) return null;
  const context = options.context ?? options;
  const trustedOptions = { ...context, ...options, fixtureTools };
  if (candidateShape === 'PI-SDK') {
    const sdk = await loadVerifiedUpstreamSurface(trustedOptions, candidateShape, 'runtimeModule');
    return createPiSdkAdapter({
      ...trustedOptions,
      sdk,
      tools: [],
      noTools: 'all',
      customTools: fixtureTools?.customTools,
    });
  }
  const executable = await revalidatedRecord(trustedOptions, candidateShape).then((fresh) => fresh.upstreamSurfaces?.executable?.path);
  if (!executable) throw new Error(`trusted upstream executable is unavailable for ${candidateShape}`);
  const acpSdk = await loadVerifiedUpstreamSurface(trustedOptions, candidateShape, 'acpSdk');
  const clientFactory = acpSdk?.createClient ?? acpSdk?.Client;
  const ndJsonStream = acpSdk?.ndJsonStream;
  if (typeof clientFactory !== 'function' || typeof ndJsonStream !== 'function') {
    throw new TypeError(`trusted upstream ACP SDK surface is incomplete for ${candidateShape}`);
  }
  const adapterOptions = {
    ...trustedOptions,
    executable,
    env: record.environment,
    clientFactory,
    ndJsonStream,
    beforeSpawn: () => revalidatedRecord(trustedOptions, candidateShape),
  };
  return candidateShape === 'PI-ACP'
    ? createPiAcpAdapter(adapterOptions)
    : createOpenCodeAcpAdapter(adapterOptions);
}

function actorFixtureSpec(fixture) {
  return {
    fixtureId: fixture.fixtureId,
    workspacePath: fixture.workspacePath,
    nonce: fixture.nonce,
    nonceRelativePath: fixture.nonceRelativePath,
    nonceFilePath: fixture.nonceFilePath,
    targetRelativePath: fixture.targetRelativePath,
    targetFilePath: fixture.targetFilePath,
    prompt: fixture.prompt,
    inventory: fixture.inventory,
    expectedTree: fixture.expectedTree,
  };
}

function processPayload(result) {
  const lines = result.stdout.toString('utf8').trim().split('\n').filter(Boolean);
  if (lines.length === 0) return null;
  try { return JSON.parse(lines.at(-1)); } catch { return null; }
}

function actorEnvironment(record) {
  const env = record?.environment;
  if (!env || typeof env !== 'object' || Array.isArray(env)) {
    throw new Error('trusted ActorRun requires an explicit candidate environment projection');
  }
  return Object.fromEntries(Object.entries(env).sort());
}

async function runTrustedActorProcess({ candidateShape, fixture, context, record, mode = 'NORMAL', protocol = 'PI-SDK' }) {
  const freshRecord = await revalidatedRecord(context, candidateShape);
  const runtimeModule = freshRecord.upstreamSurfaces?.runtimeModule;
  if (!runtimeModule?.path) throw new Error(`trusted upstream runtime module is unavailable for ${candidateShape}`);
  const spec = {
    argv: [process.execPath, new URL('./actor-run-child.mjs', import.meta.url).pathname],
    cwd: fixture.workspacePath,
    env: actorEnvironment(freshRecord),
    timeoutMs: 5000,
    terminationGraceMs: 100,
    stdoutLimitBytes: 256 * 1024,
    stderrLimitBytes: 256 * 1024,
    stdinMode: 'protocol',
    protocolOwner: 'trusted-actor-run',
  };
  const execution = startProcess(spec);
  execution.stdin.write(JSON.stringify({
    candidateShape,
    protocol,
    candidateModule: runtimeModule.path,
    stateRoot: context.preflight.stateRoot.path,
    expectedManifestSha256: context.preflight.provenance.integrity.manifestSha256,
    mode,
    fixture: actorFixtureSpec(fixture),
  }));
  execution.stdin.end();
  let controlTimer = null;
  if (mode === 'CANCEL') controlTimer = setTimeout(() => execution.cancel('S1-C06 trusted cancellation checkpoint'), 25);
  if (mode === 'DEATH') controlTimer = setTimeout(() => execution.forceKill('S1-C09 trusted forced process death checkpoint'), 25);
  const processResult = await execution.result;
  if (controlTimer) clearTimeout(controlTimer);
  return { processResult, payload: processPayload(processResult), record: freshRecord };
}

async function runFreshRecovery({ fixture, toolCalls, context }) {
  const recoverySpec = {
    argv: [process.execPath, new URL('./fresh-recovery-child.mjs', import.meta.url).pathname, JSON.stringify({ fixture: actorFixtureSpec(fixture), toolCalls })],
    cwd: fixture.workspacePath,
    env: { PATH: '/usr/bin:/bin', LANG: 'C', LC_ALL: 'C' },
    timeoutMs: 5000,
    terminationGraceMs: 100,
    stdoutLimitBytes: 64 * 1024,
    stderrLimitBytes: 64 * 1024,
  };
  const result = await startProcess(recoverySpec).result;
  const payload = processPayload(result);
  return {
    phase: 'FRESH_PROCESS',
    verified: result.outcome === 'NORMAL_EXIT' && payload?.kind === 'MNFS_TRUSTED_FRESH_RECOVERY' && payload.verified === true,
    source: 'MNFS_TRUSTED_RECOVERY_PROCESS',
    outcome: result.outcome,
  };
}

function trustedPiProofs({ fixture, fixtureResult, normal, cancellation, death, recovery, preflight, record, actorProtocol }) {
  const toolCalls = normal.payload?.fixtureToolCalls ?? [];
  const boundary = normal.payload?.boundaryObservation;
  const expectedEnvironmentDigest = digest(Object.fromEntries(Object.entries(record?.environment ?? {}).sort()));
  const outputLimit = normal.processResult.output.stdout.limitBytes + normal.processResult.output.stderr.limitBytes;
  return {
    cwd: boundary?.cwd,
    boundary: {
      cwd: boundary?.cwd,
      envDigest: boundary?.envDigest,
      environmentMatchesRecord: boundary?.envDigest === expectedEnvironmentDigest,
      source: 'MNFS_TRUSTED_PROCESS_RUNNER',
    },
    inventory: toolCalls.map((call) => call.id),
    fixtureVerified: fixtureResult.ok,
    discovery: { extensions: [], skills: [], prompts: [], themes: [], agentsFiles: [] },
    auth: { outcome: preflight.credentials?.status === 'READY' ? 'AUTHORIZED' : 'BLOCKED', methodClass: preflight.credentials?.authMethodClass ?? '' },
    cancellation: { ...cancellation.processResult, outcome: cancellation.processResult.outcome, source: 'MNFS_TRUSTED_PROCESS_RUNNER', durationMs: cancellation.processResult.durationMs },
    output: { bytes: normal.processResult.output.stdout.bytesSeen + normal.processResult.output.stderr.bytesSeen, limitBytes: outputLimit },
    processDeath: { ...death.processResult, source: 'MNFS_TRUSTED_PROCESS_RUNNER' },
    recovery,
    authority: { sessionRole: 'OBSERVATIONAL', recoveryOwner: 'MNFS' },
    machinery: { reused: ['fixture', 'artifacts', 'process-runner'] },
    supportedBoundary: {
      source: 'MNFS_TRUSTED_ADAPTER',
      kind: actorProtocol === 'PI-RPC' ? 'PI_RPC_PUBLIC_API' : 'PI_SDK_PUBLIC_API',
      observation: actorProtocol === 'PI-RPC' ? 'createRpcSession/AgentSession' : 'createAgentSession/AgentSession',
    },
    upgradePolicy: record.upgradePolicy,
    removalConditions: record.removalConditions,
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

async function runPiSdk({ candidateShape, fixture, context, actorProtocol = 'PI-SDK' }) {
  try {
    const record = await revalidatedRecord(context, candidateShape);
    const normal = await runTrustedActorProcess({ candidateShape, fixture, context, record, protocol: actorProtocol });
    const cancellation = await runTrustedActorProcess({ candidateShape, fixture, context, record, mode: 'CANCEL', protocol: actorProtocol });
    const death = await runTrustedActorProcess({ candidateShape, fixture, context, record, mode: 'DEATH', protocol: actorProtocol });
    const toolCalls = normal.payload?.fixtureToolCalls ?? [];
    const fixtureResult = await verifyFixtureResult(fixture, { toolCalls });
    const recovery = await runFreshRecovery({ fixture, toolCalls, context });
    const trustedProofs = trustedPiProofs({ fixture, fixtureResult, normal, cancellation, death, recovery, preflight: context.preflight, record, actorProtocol });
    const execution = {
      settled: normal.payload?.settled ?? { settled: false, outcome: normal.processResult.outcome },
      events: normal.payload?.events ?? [],
      trustedProofs,
      trustedProvenance: record,
      toolCalls,
    };
    return writeRuntimeAndBoundary({
      candidateShape,
      fixture,
      context,
      execution,
      adapter: null,
      boundary: {
        kind: 'ACTOR_RUN_PROCESS',
        boundaryObservation: trustedProofs.boundary,
      },
    });
  } catch (error) {
    return blockedCandidate(candidateShape, `trusted ${actorProtocol} ActorRun failed before Evidence: ${error?.message ?? error}`);
  }
}

async function runAcpAttempt({ candidateShape, fixture, adapterFactory, context, record, mode = 'NORMAL' }) {
  const fixtureTools = createFixtureTools(fixture);
  const adapter = await adapterFactory({ cwd: fixture.workspacePath, fixture, fixtureTools, context, record });
  if (!adapter) throw new Error('staged ACP adapter is unavailable');
  if (adapter.supportsFixtureTools !== true) {
    throw new Error(`${candidateShape} public boundary cannot provide the fixed fixture tool/resource inventory`);
  }
  if (mode === 'DEATH' && typeof adapter.forceKill !== 'function') {
    throw new Error(`${candidateShape} trusted ACP adapter cannot force-kill its process boundary`);
  }
  const ready = await adapter.initialize();
  const session = await adapter.startSession({ cwd: fixture.workspacePath });
  const turn = await adapter.prompt({ prompt: fixture.prompt });
  const settledPromise = turn?.settled ? turn.settled : Promise.resolve(turn);
  let controlStarted = false;
  let controlTimer = null;
  let controlPromise = Promise.resolve(null);
  if (mode !== 'NORMAL') {
    const control = mode === 'CANCEL'
      ? () => adapter.cancel('S1-C06 trusted ACP cancellation checkpoint')
      : () => adapter.forceKill('S1-C09 trusted ACP forced process death checkpoint');
    controlPromise = new Promise((resolve) => {
      const trigger = async () => {
        controlStarted = true;
        try { resolve(await control()); } catch (error) { resolve({ error: String(error?.message ?? error) }); }
      };
      controlTimer = setTimeout(trigger, 25);
    });
    const settled = await settledPromise;
    if (!controlStarted) {
      clearTimeout(controlTimer);
      controlTimer = null;
      controlStarted = true;
      try { await control(); } catch {}
    } else {
      await controlPromise;
    }
    try { await adapter.shutdown(); } catch {}
    return {
      ready,
      session,
      settled,
      events: turn?.observe?.() ?? turn?.events ?? settled?.events ?? [],
      fixtureTools,
      processObservation: await adapter.processObservation?.(),
    };
  }
  const settled = await settledPromise;
  try { await adapter.shutdown(); } catch {}
  return {
    ready,
    session,
    settled,
    events: turn?.observe?.() ?? turn?.events ?? settled?.events ?? [],
    fixtureTools,
    processObservation: await adapter.processObservation?.(),
  };
}

async function runAcpInternal({ candidateShape, fixture, adapterFactory, context }) {
  if (typeof adapterFactory !== 'function') return blockedCandidate(candidateShape, 'ACP adapter is unavailable');
  const record = provenanceFor(context, candidateShape);
  const normal = await runAcpAttempt({ candidateShape, fixture, adapterFactory, context, record });
  const cancellation = await runAcpAttempt({ candidateShape, fixture, adapterFactory, context, record, mode: 'CANCEL' });
  const death = await runAcpAttempt({ candidateShape, fixture, adapterFactory, context, record, mode: 'DEATH' });
  const toolCalls = normal.fixtureTools.snapshot();
  const fixtureResult = await verifyFixtureResult(fixture, { toolCalls });
  const envDigest = digest(Object.fromEntries(Object.entries(record?.environment ?? {}).sort()));
  const trustedBoundary = {
    cwd: fixture.workspacePath,
    envDigest,
    environmentMatchesRecord: true,
    source: 'MNFS_TRUSTED_PROCESS_RUNNER',
  };
  const recovery = await runFreshRecovery({ fixture, toolCalls, context });
  const execution = {
    ready: normal.ready,
    session: normal.session,
    settled: normal.settled,
    events: normal.events,
    trustedProofs: {
      cwd: fixture.workspacePath,
      boundary: trustedBoundary,
      inventory: toolCalls.map((call) => call.id),
      fixtureVerified: fixtureResult.ok,
      discovery: null,
      auth: { outcome: context.preflight?.credentials?.status === 'READY' ? 'AUTHORIZED' : 'BLOCKED', methodClass: context.preflight?.credentials?.authMethodClass ?? '' },
      output: normal.processObservation?.output ? {
        bytes: normal.processObservation.output.stdout.bytesSeen + normal.processObservation.output.stderr.bytesSeen,
        limitBytes: normal.processObservation.output.stdout.limitBytes + normal.processObservation.output.stderr.limitBytes,
      } : null,
      processDeath: { ...death.processObservation, source: 'MNFS_TRUSTED_PROCESS_RUNNER' },
      cancellation: { ...cancellation.processObservation, source: 'MNFS_TRUSTED_PROCESS_RUNNER' },
      recovery,
      authority: { sessionRole: 'OBSERVATIONAL', recoveryOwner: 'MNFS' },
      machinery: { reused: ['fixture', 'artifacts', 'process-runner'] },
      supportedBoundary: { source: 'MNFS_TRUSTED_ADAPTER', kind: `${candidateShape}_PUBLIC_API`, observation: 'official candidate boundary' },
      upgradePolicy: record?.upgradePolicy,
      removalConditions: record?.removalConditions,
    },
    toolCalls,
    trustedProvenance: record,
  };
  const boundary = { kind: 'ACP_PROCESS_BOUNDARY', boundaryObservation: trustedBoundary };
  return writeRuntimeAndBoundary({ candidateShape, fixture, context, execution, adapter: null, boundary });
}

async function runAcp(args) {
  try {
    return await runAcpInternal(args);
  } catch (error) {
    return blockedCandidate(args.candidateShape, `trusted ${args.candidateShape} ACP execution failed before Evidence: ${error?.message ?? error}`);
  }
}

export function createS1CandidateExecutors({
  fixture,
  piSdkAdapterFactory,
  piRpcAdapterFactory,
  piAcpAdapterFactory,
  openCodeAdapterFactory,
  secondAcpAdapterFactory,
} = {}) {
  const withFixture = (context = {}) => ({ ...context, fixture: context.fixture ?? fixture });
  const factory = (shape, supplied) => supplied ?? ((options) => defaultAdapterFactory(shape, options));
  return Object.freeze({
    'PI-SDK': async (context) => {
      const active = withFixture(context);
      if (piSdkAdapterFactory) return blockedCandidate('PI-SDK', 'in-process Pi SDK adapter injection is prohibited; use the trusted ActorRun child executor');
      return runPiSdk({ candidateShape: 'PI-SDK', fixture: active.fixture, context: active });
    },
    'PI-RPC': async (context) => {
      const active = withFixture(context);
      if (piRpcAdapterFactory) return blockedCandidate('PI-RPC', 'in-process Pi-RPC adapter injection is prohibited; use the trusted ActorRun child executor');
      return runPiSdk({ candidateShape: 'PI-RPC', fixture: active.fixture, context: active, actorProtocol: 'PI-RPC' });
    },
    'PI-ACP': async (context) => {
      const active = withFixture(context);
      return runAcp({ candidateShape: 'PI-ACP', fixture: active.fixture, adapterFactory: factory('PI-ACP', piAcpAdapterFactory), context: active });
    },
    'OPENCODE-ACP': async (context) => {
      const active = withFixture(context);
      return runAcp({ candidateShape: 'OPENCODE-ACP', fixture: active.fixture, adapterFactory: factory('OPENCODE-ACP', openCodeAdapterFactory), context: active });
    },
    'SECOND-ACP': async (context) => {
      const active = withFixture(context);
      if (!secondAcpAdapterFactory) return blockedCandidate('SECOND-ACP', 'SECOND-ACP is required but no trusted staged candidate executor is available');
      return runAcp({ candidateShape: 'SECOND-ACP', fixture: active.fixture, adapterFactory: secondAcpAdapterFactory, context: active });
    },
  });
}

export const createDeterministicS1Executors = createS1CandidateExecutors;
