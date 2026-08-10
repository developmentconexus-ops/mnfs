import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { S1_CRITERIA } from './contract.mjs';
import { createFixtureTools, verifyFixtureResult } from './fixture.mjs';
import { createAcpFixtureCapabilities } from './acp/fixture-capabilities.mjs';
import { deriveCandidateVerdict } from './evaluate.mjs';
import { verifyArtifactRecords, writeJsonArtifact } from './artifacts.mjs';
import { createPiSdkAdapter } from './adapters/pi-sdk.mjs';
import { createPiAcpAdapter } from './adapters/pi-acp.mjs';
import { createOpenCodeAcpAdapter } from './adapters/opencode-acp.mjs';
import { createTrustedPiAcpLauncher, revalidateTrustedPiAcpLauncher } from './pi-acp-launcher.mjs';
import { revalidateStagedCandidateProvenance } from './probes/candidate-provenance.mjs';
import { startProcess } from './process-runner.mjs';
import { derivePiRpcObservations, runPiRpcProcess, translatePiRpcFixtureCalls } from './pi-rpc.mjs';
import { deriveTrustedAuthProof } from './proof-driver.mjs';
import { persistCandidateRecoveryState } from './recovery.mjs';
import { S1_FROZEN_CANDIDATE_PROVENANCE } from './preflight.mjs';
import { requireCredentialRouteBinding } from './credential-routes.mjs';

const HASH_PATTERN = /^sha256:[a-f0-9]{64}$/u;

function clone(value) {
  return value === undefined ? undefined : structuredClone(value);
}

export function safeProvenanceEvidence(record, preflight) {
  if (!record || typeof record !== 'object') return null;
  const safeRecord = clone(record);
  delete safeRecord.environment;
  delete safeRecord.env;
  delete safeRecord.providerEnvironment;
  delete safeRecord.credentials;
  delete safeRecord.auth;
  const routes = preflight?.credentials?.routes ?? {};
  return {
    ...safeRecord,
    credentialRoutes: {
      ...(routes.pi ? { pi: clone(routes.pi) } : {}),
      ...(routes.openCode ? { openCode: clone(routes.openCode) } : {}),
      providerEnvironment: clone(preflight?.credentials?.providerEnvironment ?? []),
    },
  };
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

function effectiveAcpEnvironment(record, adapter) {
  const expected = Object.fromEntries(Object.entries(record?.environment ?? {}).sort());
  const observed = adapter?.processSpec?.env;
  const observations = adapter?.observations ?? {};
  const controlledKeys = [];
  if (observations.profile?.source === 'MNFS_TRUSTED_ISOLATED_PROFILE') {
    controlledKeys.push(
      'OPENCODE_DISABLE_PROJECT_CONFIG',
      'XDG_CONFIG_HOME', 'XDG_STATE_HOME', 'XDG_CACHE_HOME', 'XDG_DATA_HOME',
      'OPENCODE_CONFIG_DIR', 'OPENCODE_CONFIG', 'OPENCODE_PURE',
    );
  }
  if (observations.innerPiControlSource === 'MNFS_TRUSTED_WRAPPER_REVALIDATES_PI') {
    controlledKeys.push('PI_ACP_PI_COMMAND', 'MNFS_PI_ACP_EXECUTABLE');
  }
  for (const key of controlledKeys) {
    if (typeof observed?.[key] === 'string') expected[key] = observed[key];
  }
  return expected;
}

function hasExactInventory(value, fixture) {
  const expected = fixture?.inventory?.map((item) => item.id).sort();
  return Array.isArray(value) && Array.isArray(expected)
    && JSON.stringify([...value].sort()) === JSON.stringify(expected);
}

function discoveryEmpty(value) {
  return value && typeof value === 'object'
    && value.controlled === true
    && ['extensions', 'skills', 'prompts', 'themes', 'agentsFiles'].every((key) => Array.isArray(value[key]) && value[key].length === 0);
}

export function deriveMachineryProof(value) {
  const namedInput = Array.isArray(value?.namedMnfsMachineryEliminatedOrAvoided)
    ? value.namedMnfsMachineryEliminatedOrAvoided
    : [value?.namedMnfsMachineryEliminatedOrAvoided];
  const named = namedInput.filter((item) => typeof item === 'string' && item.trim() !== '');
  const causalMechanism = typeof value?.causalMechanism === 'string' && value.causalMechanism.trim() !== ''
    ? value.causalMechanism.trim() : null;
  const supportingInput = Array.isArray(value?.supportingEvidence)
    ? value.supportingEvidence : [value?.supportingEvidence];
  const supportingEvidence = supportingInput.filter((item) => item && typeof item === 'object');
  return {
    pass: named.length > 0 && causalMechanism !== null && supportingEvidence.length > 0,
    namedMnfsMachineryEliminatedOrAvoided: named,
    causalMechanism,
    supportingEvidence,
  };
}

function temporalControlPass(value, kind, outcomes) {
  const temporal = value?.temporal;
  return temporal?.turnActive?.observed === true
    && temporal.control?.requested === true
    && temporal.control?.kind === kind
    && temporal.control?.turnActive === true
    && temporal.settlement?.observed === true
    && temporal.settlement?.bounded === true
    && Array.isArray(temporal.sequence)
    && temporal.sequence.indexOf('turn-active') < temporal.sequence.indexOf('control-requested')
    && temporal.sequence.includes('bounded-settlement')
    && outcomes.includes(value?.outcome);
}

export function buildProofs({ candidateShape, fixture, preflight, execution, adapter, boundary }) {
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
    'S1-C05': trusted.auth?.outcome === 'AUTHORIZED_OPERATION'
      && ((trusted.auth.operation === 'PROVIDER_MODEL_COMPLETED'
        && typeof trusted.auth.providerClass === 'string' && trusted.auth.providerClass.trim() !== ''
        && typeof trusted.auth.modelClass === 'string' && trusted.auth.modelClass.trim() !== '')
        || (trusted.auth.operation === 'ACP_AUTHENTICATED_SESSION_PROMPT_COMPLETED'
          && typeof trusted.auth.methodId === 'string' && trusted.auth.methodId.trim() !== ''
          && typeof trusted.auth.sessionId === 'string' && trusted.auth.sessionId.trim() !== '')),
    'S1-C06': temporalControlPass(trusted.cancellation, 'CANCEL', ['CANCELLED'])
      && trusted.cancellation?.source === 'MNFS_TRUSTED_PROCESS_RUNNER',
    'S1-C07': Array.isArray(events) && events.length > 0
      && Number.isSafeInteger(trusted.output?.bytes) && Number.isSafeInteger(trusted.output?.limitBytes)
      && trusted.output.bytes <= trusted.output.limitBytes,
    'S1-C08': settled?.settled === true && ['COMPLETED', 'FAILED', 'CANCELLED'].includes(settled.outcome),
    'S1-C09': temporalControlPass(trusted.processDeath, 'FORCED_DEATH', ['SIGNAL_DEATH'])
      && trusted.processDeath?.source === 'MNFS_TRUSTED_PROCESS_RUNNER',
    'S1-C10': trusted.recovery?.phase === 'FRESH_PROCESS'
      && trusted.recovery?.source === 'MNFS_TRUSTED_RECOVERY_PROCESS'
      && trusted.recovery.verified === true
      && trusted.recovery.stateReopened === true
      && trusted.recovery.evidenceHashesValid === true
      && trusted.recovery.bindingMatches === true
      && trusted.recovery.fixtureBindingMatches === true
      && trusted.recovery.runtimeSessionRequired === false
      && trusted.recovery.transcriptRequired === false,
    'S1-C11': Array.isArray(events) && events.every((event) => event && typeof event.type === 'string'),
    'S1-C12': trusted.supportedBoundary?.source === 'MNFS_TRUSTED_ADAPTER'
      && typeof trusted.supportedBoundary.kind === 'string'
      && typeof trusted.supportedBoundary.observation === 'string',
    'S1-C13': exactProvenance(candidateShape, preflight, execution),
    'S1-C14': trusted.authority?.sessionRole === 'OBSERVATIONAL' && trusted.authority.recoveryOwner === 'MNFS',
    'S1-C15': deriveMachineryProof(trusted.machinery).pass,
    'S1-C16': policyComplete(trusted.upgradePolicy, POLICY_FIELDS)
      && policyComplete(trusted.removalConditions, REMOVAL_FIELDS),
  };
}

async function writeEvidence({ candidateShape, fixture, runRoot, binding, proofs, execution, adapter, evidencePrefix = `evidence/${candidateShape}`, includeRecoveryState = true }) {
  if (typeof runRoot !== 'string' || !binding) return blockedCandidate(candidateShape, 'durable run root and artifact binding are required before PASS Evidence can be derived');
  const records = includeRecoveryState ? [...(execution?.recoveryStateRecords ?? [])] : [];
  const refs = {};
  for (const id of S1_CRITERIA) {
    const record = await writeJsonArtifact(runRoot, `${evidencePrefix}/${id}.json`, {
      candidateShape,
      fixtureId: fixture?.fixtureId ?? null,
      criterionId: id,
      observed: proofs[id],
      trustedProofs: clone(execution?.trustedProofs ?? null),
      normalizedEvents: clone(execution?.events ?? null),
      rawEvents: clone(execution?.rawEvents ?? null),
      toolCalls: clone(execution?.toolCalls ?? execution?.toolCallsEvidence ?? null),
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
  if (Array.isArray(execution?.permissions) && execution.permissions.length > 0) {
    const record = await writeJsonArtifact(runRoot, `${evidencePrefix}/permissions.json`, {
      authority: 'MNFS_PERMISSION_UI_NON_AUTHORITY',
      requests: clone(execution.permissions),
    }, { binding, kind: 'permission-evidence' });
    records.push(record);
    specializedRefs.permissionEvidenceRefs = [record.id];
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

async function defaultAdapterFactory(candidateShape, { record, fixtureCapabilities, ...options }) {
  if (!record) return null;
  const context = options.context ?? options;
  const trustedOptions = { ...context, ...options, fixtureCapabilities };
  if (candidateShape === 'PI-SDK') {
    const sdk = await loadVerifiedUpstreamSurface(trustedOptions, candidateShape, 'runtimeModule');
    const fixtureTools = createFixtureTools(options.fixture);
    return createPiSdkAdapter({
      ...trustedOptions,
      sdk,
      piCodingAgentDir: record.environment?.PI_CODING_AGENT_DIR,
      tools: fixtureTools.customTools.map(({ name }) => name),
      noTools: 'all',
      customTools: fixtureTools.customTools,
    });
  }
  const executable = await revalidatedRecord(trustedOptions, candidateShape).then((fresh) => fresh.upstreamSurfaces?.executable?.path);
  if (!executable) throw new Error(`trusted upstream executable is unavailable for ${candidateShape}`);
  const acpSdk = await loadVerifiedUpstreamSurface(trustedOptions, candidateShape, 'acpSdk');
  const clientFactory = acpSdk?.client ?? acpSdk?.createClient ?? acpSdk?.Client;
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
    clientCapabilities: fixtureCapabilities?.clientCapabilities,
    clientRequestHandlers: fixtureCapabilities?.handlers,
    beforeSpawn: () => revalidatedRecord(trustedOptions, candidateShape),
  };
  const priorBeforeSpawn = adapterOptions.beforeSpawn;
  adapterOptions.beforeSpawn = async () => {
    const fresh = await priorBeforeSpawn();
    requireCredentialRouteBinding({
      candidateShape,
      authorizedRoutes: trustedOptions.preflight?.credentials?.routes,
      stagedEnvironment: fresh.environment,
      processEnvironment: adapterOptions.env,
    });
    return fresh;
  };
  if (candidateShape === 'PI-ACP') {
    const innerPi = record.upstreamSurfaces?.innerPiExecutable?.path ?? record.upstreamSurfaces?.piExecutable?.path;
    if (!innerPi) throw new Error('Pi-ACP trusted staging does not provide an inner Pi executable');
    const launcherBinding = await createTrustedPiAcpLauncher({
      runRoot: trustedOptions.runRoot,
      wrapperPath: new URL('./pi-acp-wrapper.mjs', import.meta.url).pathname,
    });
    adapterOptions.env = {
      ...record.environment,
      PI_ACP_PI_COMMAND: launcherBinding.path,
      MNFS_PI_ACP_EXECUTABLE: innerPi,
    };
    adapterOptions.launcherBinding = launcherBinding;
    const launcherBeforeSpawn = adapterOptions.beforeSpawn;
    adapterOptions.beforeSpawn = async () => {
      await revalidateTrustedPiAcpLauncher(launcherBinding);
      await launcherBeforeSpawn();
    };
  }
  if (candidateShape === 'OPENCODE-ACP' && typeof trustedOptions.runRoot === 'string' && path.isAbsolute(trustedOptions.runRoot)) {
    const profileDir = path.join(trustedOptions.runRoot, 'opencode-profile');
    const configDir = path.join(profileDir, 'config');
    const configPath = path.join(configDir, 'config.json');
    const config = {
      tools: { '*': false, read: true, edit: true },
      plugin: [],
      mcp: [],
      permission: { '*': 'deny', read: 'allow', edit: 'allow' },
    };
    await mkdir(configDir, { recursive: true });
    const configBytes = Buffer.from(`${JSON.stringify(config)}\n`);
    await writeFile(configPath, configBytes, { mode: 0o600 });
    const xdgDataHome = record.environment?.XDG_DATA_HOME;
    if (typeof xdgDataHome !== 'string' || !path.isAbsolute(xdgDataHome)) {
      throw new Error('OpenCode trusted staging does not provide an explicit authorized XDG_DATA_HOME auth route');
    }
    adapterOptions.profile = {
      runRoot: trustedOptions.runRoot,
      configDir,
      configPath,
      xdgConfigHome: path.join(profileDir, 'xdg-config'),
      xdgStateHome: path.join(profileDir, 'xdg-state'),
      xdgCacheHome: path.join(profileDir, 'xdg-cache'),
      xdgDataHome,
      config,
      configHash: `sha256:${createHash('sha256').update(configBytes).digest('hex')}`,
      configSizeBytes: configBytes.length,
      configMode: '0600',
      modelEditFamily: 'edit',
    };
  }
  return candidateShape === 'PI-ACP'
    ? createPiAcpAdapter(adapterOptions)
    : createOpenCodeAcpAdapter(adapterOptions);
}

function actorFixtureSpec(fixture) {
  return {
    fixtureId: fixture.fixtureId,
    fixtureHash: fixture.fixtureHash,
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

function actorEnvironment(record, candidateShape, preflight) {
  const env = record?.environment;
  if (!env || typeof env !== 'object' || Array.isArray(env)) {
    throw new Error('trusted ActorRun requires an explicit candidate environment projection');
  }
  if (typeof env.PI_CODING_AGENT_DIR !== 'string' || !env.PI_CODING_AGENT_DIR.startsWith('/')) {
    throw new Error('trusted ActorRun requires an explicit absolute PI_CODING_AGENT_DIR route');
  }
  const processEnvironment = Object.fromEntries(Object.entries(env).sort());
  requireCredentialRouteBinding({
    candidateShape,
    authorizedRoutes: preflight?.credentials?.routes,
    stagedEnvironment: env,
    processEnvironment,
  });
  return processEnvironment;
}

async function runTrustedActorProcess({ candidateShape, fixture, context, record, mode = 'NORMAL', protocol = 'PI-SDK' }) {
  const freshRecord = await revalidatedRecord(context, candidateShape);
  const runtimeModule = freshRecord.upstreamSurfaces?.runtimeModule;
  if (!runtimeModule?.path) throw new Error(`trusted upstream runtime module is unavailable for ${candidateShape}`);
  const spec = {
    argv: [process.execPath, new URL('./actor-run-child.mjs', import.meta.url).pathname],
    cwd: fixture.workspacePath,
    env: actorEnvironment(freshRecord, candidateShape, context.preflight),
    timeoutMs: 5000,
    terminationGraceMs: 100,
    stdoutLimitBytes: 256 * 1024,
    stderrLimitBytes: 256 * 1024,
    stdinMode: 'protocol',
    protocolOwner: 'trusted-actor-run',
  };
  const execution = startProcess(spec);
  let outputBuffer = '';
  let activeObserved = false;
  let activeAtMs = null;
  let settledAtMs = null;
  execution.stdout.on('data', (chunk) => {
    outputBuffer += Buffer.from(chunk).toString('utf8');
    for (const line of outputBuffer.split('\n').slice(0, -1)) {
      try {
        const message = JSON.parse(line);
        if (message?.kind === 'MNFS_TRUSTED_TURN_ACTIVE') {
          activeObserved = true;
          activeAtMs = message.atMs ?? Date.now();
        }
        if (message?.kind === 'MNFS_TRUSTED_TURN_SETTLED') settledAtMs = message.atMs ?? Date.now();
      } catch { /* bounded candidate output is non-authoritative */ }
    }
    outputBuffer = outputBuffer.split('\n').at(-1) ?? '';
  });
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
  let control = { requested: false, kind: null, turnActive: false };
  if (mode === 'CANCEL') controlTimer = setTimeout(() => {
    if (!activeObserved || settledAtMs !== null) return;
    control = { requested: true, kind: 'CANCEL', turnActive: true, requestedAtMs: Date.now() };
    execution.cancel('S1-C06 trusted cancellation checkpoint');
  }, 25);
  if (mode === 'DEATH') controlTimer = setTimeout(() => {
    if (!activeObserved || settledAtMs !== null) return;
    control = { requested: true, kind: 'FORCED_DEATH', turnActive: true, requestedAtMs: Date.now() };
    execution.forceKill('S1-C09 trusted forced process death checkpoint');
  }, 25);
  const processResult = await execution.result;
  if (controlTimer) clearTimeout(controlTimer);
  const payload = processPayload(processResult);
  const temporal = {
    turnActive: { observed: activeObserved, atMs: activeAtMs },
    control,
    settlement: { observed: settledAtMs !== null || processResult.termination?.settled === true, bounded: processResult.termination?.settled === true, atMs: settledAtMs ?? Date.now(), outcome: processResult.outcome },
    sequence: ['turn-active', ...(control.requested ? ['control-requested'] : []), ...(processResult.termination?.settled === true ? ['bounded-settlement'] : [])],
  };
  return { processResult, payload, temporal, record: freshRecord };
}

async function runTrustedPiRpcProcess({ candidateShape, fixture, context, mode = 'NORMAL' }) {
  const record = await revalidatedRecord(context, candidateShape);
  const executable = record.upstreamSurfaces?.executable?.path;
  if (!executable) throw new Error('trusted Pi RPC executable is unavailable');
  const processEnvironment = actorEnvironment(record, candidateShape, context.preflight);
  const attempt = await runPiRpcProcess({
    executable,
    cwd: fixture.workspacePath,
    env: processEnvironment,
    prompt: fixture.prompt,
    mode,
    beforeSpawn: async () => {
      const fresh = await revalidatedRecord(context, candidateShape);
      if (fresh.upstreamSurfaces?.executable?.path !== executable) {
        throw new Error('Pi RPC executable changed during final spawn revalidation');
      }
      requireCredentialRouteBinding({
        candidateShape,
        authorizedRoutes: context.preflight?.credentials?.routes,
        stagedEnvironment: fresh.environment,
        processEnvironment,
      });
    },
  });
  return { ...attempt, record };
}

async function runFreshRecovery({ fixture, toolCalls, context, candidateShape, recoveryState }) {
  const recoverySpec = {
    argv: [process.execPath, new URL('./fresh-recovery-child.mjs', import.meta.url).pathname, JSON.stringify({
      fixture: actorFixtureSpec(fixture),
      toolCalls,
      candidateShape,
      runRoot: context.runRoot,
      binding: context.artifactBinding,
      recoveryRecords: recoveryState?.records ?? [],
    })],
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
    stateReopened: payload?.stateReopened === true,
    evidenceHashesValid: payload?.evidenceHashesValid === true,
    bindingMatches: payload?.bindingMatches === true,
    fixtureBindingMatches: payload?.fixtureBindingMatches === true,
    runtimeSessionRequired: payload?.runtimeSessionRequired ?? true,
    transcriptRequired: payload?.transcriptRequired ?? true,
    fixtureVerified: payload?.fixtureVerified ?? false,
    source: 'MNFS_TRUSTED_RECOVERY_PROCESS',
    outcome: result.outcome,
  };
}

async function prepareRecoveryState({ candidateShape, context, normal, cancellation, death, protocol }) {
  return persistCandidateRecoveryState({
    runRoot: context.runRoot,
    binding: context.artifactBinding,
    candidateShape,
    observations: [{
      protocol,
      normalOutcome: normal?.processResult?.outcome ?? normal?.processObservation?.outcome ?? null,
      settled: normal?.settled?.outcome ?? null,
      cancellationOutcome: cancellation?.processResult?.outcome ?? cancellation?.processObservation?.outcome ?? null,
      processDeathOutcome: death?.processResult?.outcome ?? death?.processObservation?.outcome ?? null,
    }],
    checkpoints: {
      cancellation: cancellation?.processResult?.outcome ?? cancellation?.processObservation?.outcome ?? 'NOT_RUN',
      processDeath: death?.processResult?.outcome ?? death?.processObservation?.outcome ?? 'NOT_RUN',
      freshRecovery: 'PENDING',
    },
  });
}

function trustedPiProofs({ fixture, fixtureResult, normal, cancellation, death, recovery, preflight, record, actorProtocol, toolCallsOverride = null }) {
  const toolCalls = toolCallsOverride ?? normal.payload?.fixtureToolCalls ?? normal.fixtureToolCalls ?? [];
  const rawObservations = actorProtocol === 'PI-RPC'
    ? normal.messages ?? []
    : normal.payload?.rawEvents ?? [];
  const boundary = normal.payload?.boundaryObservation ?? normal.boundaryObservation;
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
    discovery: actorProtocol === 'PI-RPC'
      ? normal.observations
      : (normal.payload?.discovery ?? { controlled: false, extensions: [], skills: [], prompts: [], themes: [], agentsFiles: [] }),
    auth: deriveTrustedAuthProof({ rawObservations }),
    cancellation: { ...cancellation.processResult, outcome: cancellation.processResult.outcome, temporal: cancellation.temporal, source: 'MNFS_TRUSTED_PROCESS_RUNNER', durationMs: cancellation.processResult.durationMs },
    output: { bytes: normal.processResult.output.stdout.bytesSeen + normal.processResult.output.stderr.bytesSeen, limitBytes: outputLimit },
    processDeath: { ...death.processResult, temporal: death.temporal, source: 'MNFS_TRUSTED_PROCESS_RUNNER' },
    recovery,
    authority: { sessionRole: 'OBSERVATIONAL', recoveryOwner: 'MNFS' },
    machinery: {
      reused: ['fixture', 'artifacts', 'process-runner'],
      namedMnfsMachineryEliminatedOrAvoided: ['MNFS_TUI_HUMAN_OUTPUT_SCRAPING'],
      causalMechanism: actorProtocol === 'PI-RPC'
        ? 'the public Pi RPC JSONL boundary exposes structured lifecycle/tool events without a TUI adapter'
        : 'the public Pi SDK AgentSession boundary supplies structured events without a TUI/human-output scraper',
      supportingEvidence: [{
        source: actorProtocol === 'PI-RPC' ? 'MNFS_TRUSTED_PI_RPC_JSONL' : 'MNFS_TRUSTED_PI_AGENT_SESSION',
        protocol: actorProtocol,
        structuredEvents: true,
        humanOutputScraping: false,
        observedEventCount: actorProtocol === 'PI-RPC' ? (normal.messages?.length ?? 0) : (normal.payload?.events?.length ?? 0),
      }],
    },
    supportedBoundary: {
      source: 'MNFS_TRUSTED_ADAPTER',
      kind: actorProtocol === 'PI-RPC' ? 'PI_RPC_PROCESS_BOUNDARY' : 'PI_SDK_PUBLIC_API',
      observation: actorProtocol === 'PI-RPC' ? 'absolute-staged-pi-executable --mode rpc' : 'createAgentSession/AgentSession',
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
    includeRecoveryState: false,
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
    const recoveryState = await prepareRecoveryState({ candidateShape, context, normal, cancellation, death, protocol: actorProtocol });
    const recovery = await runFreshRecovery({ fixture, toolCalls, context, candidateShape, recoveryState });
    const trustedProofs = trustedPiProofs({ fixture, fixtureResult, normal, cancellation, death, recovery, preflight: context.preflight, record, actorProtocol });
    const execution = {
      settled: normal.payload?.settled ?? { settled: false, outcome: normal.processResult.outcome },
      events: normal.payload?.events ?? [],
      trustedProofs,
      trustedProvenance: safeProvenanceEvidence(record, context.preflight),
      toolCalls,
      recoveryStateRecords: recoveryState?.records ?? [],
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

async function runPiRpc({ candidateShape, fixture, context }) {
  try {
    const record = await revalidatedRecord(context, candidateShape);
    const normal = await runTrustedPiRpcProcess({ candidateShape, fixture, context });
    const cancellation = await runTrustedPiRpcProcess({ candidateShape, fixture, context, mode: 'CANCEL' });
    const death = await runTrustedPiRpcProcess({ candidateShape, fixture, context, mode: 'DEATH' });
    const toolCalls = translatePiRpcFixtureCalls(normal.messages, fixture);
    const fixtureResult = await verifyFixtureResult(fixture, { toolCalls });
    const recoveryState = await prepareRecoveryState({ candidateShape, context, normal, cancellation, death, protocol: 'PI-RPC' });
    const recovery = await runFreshRecovery({ fixture, toolCalls, context, candidateShape, recoveryState });
    const trustedProofs = trustedPiProofs({ fixture, fixtureResult, normal, cancellation, death, recovery, preflight: context.preflight, record, actorProtocol: 'PI-RPC', toolCallsOverride: toolCalls });
    const execution = {
      settled: normal.settled,
      events: normal.messages.map((message, index) => ({ type: message?.type ?? 'unknown', sequence: index + 1 })),
      trustedProofs,
      trustedProvenance: safeProvenanceEvidence(record, context.preflight),
      toolCalls,
      recoveryStateRecords: recoveryState?.records ?? [],
    };
    return writeRuntimeAndBoundary({
      candidateShape,
      fixture,
      context,
      execution,
      adapter: null,
      boundary: { kind: 'PI_RPC_PROCESS_BOUNDARY', boundaryObservation: trustedProofs.boundary },
    });
  } catch (error) {
    return blockedCandidate(candidateShape, `trusted PI-RPC process failed before Evidence: ${error?.message ?? error}`);
  }
}

async function runAcpAttempt({ candidateShape, fixture, adapterFactory, context, record, mode = 'NORMAL' }) {
  const fixtureCapabilities = createAcpFixtureCapabilities(fixture);
  const adapter = await adapterFactory({ cwd: fixture.workspacePath, fixture, fixtureCapabilities, context, record });
  if (!adapter) throw new Error('staged ACP adapter is unavailable');
  requireCredentialRouteBinding({
    candidateShape,
    authorizedRoutes: context?.preflight?.credentials?.routes,
    stagedEnvironment: record?.environment,
    processEnvironment: adapter.processSpec?.env,
  });
  if (mode === 'DEATH' && typeof adapter.forceKill !== 'function') {
    throw new Error(`${candidateShape} trusted ACP adapter cannot force-kill its process boundary`);
  }
  const ready = await adapter.initialize();
  const advertisedAuthMethods = Array.isArray(ready?.authMethods) ? ready.authMethods : [];
  const authMethod = advertisedAuthMethods.find((method) => typeof (method?.id ?? method?.methodId) === 'string') ?? null;
  let authentication = null;
  if (authMethod && typeof adapter.authenticate === 'function') {
    authentication = await adapter.authenticate(authMethod.id ?? authMethod.methodId);
  }
  const session = await adapter.startSession({ cwd: fixture.workspacePath });
  const turn = await adapter.prompt({ prompt: fixture.prompt });
  const settledPromise = turn?.settled ? turn.settled : Promise.resolve(turn);
  let controlTimer = null;
  let controlResult = null;
  const controlDelayMs = Number.isSafeInteger(context?.controlDelayMs) ? context.controlDelayMs : 25;
  if (mode !== 'NORMAL') {
    const control = mode === 'CANCEL'
      ? () => adapter.cancel('S1-C06 trusted ACP cancellation checkpoint')
      : () => adapter.forceKill('S1-C09 trusted ACP forced process death checkpoint');
    let resolveControl;
    const controlPromise = new Promise((resolve) => { resolveControl = resolve; });
    controlTimer = setTimeout(async () => {
      try { controlResult = await control(); } catch (error) { controlResult = { error: String(error?.message ?? error) }; }
      resolveControl(controlResult);
    }, controlDelayMs);
    const first = await Promise.race([
      settledPromise.then((value) => ({ kind: 'SETTLED_FIRST', value })),
      controlPromise.then((value) => ({ kind: 'CONTROL_REQUESTED', value })),
    ]);
    let settled;
    if (first.kind === 'SETTLED_FIRST') {
      clearTimeout(controlTimer);
      controlTimer = null;
      settled = first.value;
    } else {
      settled = await Promise.race([
        settledPromise,
        new Promise((resolve) => setTimeout(() => resolve({ settled: false, outcome: 'CONTROL_TIMEOUT', handoffRequired: true }), context?.cancellationTimeoutMs ?? 5000)),
      ]);
    }
    try { await adapter.shutdown(); } catch {}
    return {
      ready,
      authentication,
      authMethod,
      session,
      settled,
      events: turn?.observe?.() ?? turn?.events ?? settled?.events ?? [],
      rawMessages: turn?.observeRaw?.() ?? [],
      fixtureCapabilities,
      adapter,
      temporal: turn?.observeTemporal?.() ?? settled?.temporal ?? null,
      controlResult,
      processObservation: await adapter.processObservation?.(),
    };
  }
  const settled = await settledPromise;
  const temporal = turn?.observeTemporal?.() ?? settled?.temporal ?? null;
  try { await adapter.shutdown(); } catch {}
  return {
    ready,
    authentication,
    authMethod,
    session,
    settled,
    events: turn?.observe?.() ?? turn?.events ?? settled?.events ?? [],
    rawMessages: turn?.observeRaw?.() ?? [],
    fixtureCapabilities,
    adapter,
    temporal,
    processObservation: await adapter.processObservation?.(),
  };
}

function deriveAcpDiscovery({ candidateShape, rawMessages, adapter }) {
  const discovered = {
    extensions: [],
    skills: [],
    prompts: [],
    themes: [],
    agentsFiles: [],
  };
  for (const message of rawMessages ?? []) {
    const update = message?.notification?.update ?? message?.update ?? {};
    if (update.sessionUpdate === 'available_commands_update') discovered.prompts.push('available_commands_update');
    if (update.sessionUpdate === 'config_option_update') discovered.extensions.push('config_option_update');
  }
  const observations = adapter?.observations ?? {};
  const controlled = observations.discoveryControlled === true
    || (candidateShape === 'PI-ACP' && observations.innerPiControlSource === 'MNFS_TRUSTED_WRAPPER_REVALIDATES_PI');
  return {
    ...discovered,
    controlled,
    source: 'MNFS_TRUSTED_ACP_EVENT_AND_PROFILE_OBSERVATION',
    ...(controlled ? {} : { controlFailureCause: observations.discoveryReason ?? 'trusted discovery suppression evidence is unavailable' }),
  };
}

function deriveAcpInventory(rawMessages, fixture, fallbackCalls) {
  const inventory = [];
  for (const message of rawMessages ?? []) {
    const update = message?.notification?.update ?? message?.update ?? {};
    if (update.sessionUpdate !== 'tool_call') continue;
    const input = update.rawInput ?? {};
    const pathValue = input.path ?? input.filePath ?? input.file_path ?? update.locations?.find((location) => typeof location?.path === 'string')?.path;
    const absoluteNonce = `${fixture.workspacePath}/${fixture.nonceRelativePath}`;
    const absoluteTarget = `${fixture.workspacePath}/${fixture.targetRelativePath}`;
    const name = String(update.title ?? update.name ?? update.kind ?? 'unknown');
    if (/read/u.test(name) && [fixture.nonceRelativePath, absoluteNonce].includes(pathValue)) inventory.push('read_nonce_file');
    else if (/edit|write/u.test(name) && [fixture.targetRelativePath, absoluteTarget].includes(pathValue)) inventory.push('edit_result_file');
    else inventory.push(name);
  }
  return inventory.length > 0 ? inventory : fallbackCalls.map((call) => call.id);
}

async function runAcpInternal({ candidateShape, fixture, adapterFactory, context }) {
  if (typeof adapterFactory !== 'function') return blockedCandidate(candidateShape, 'ACP adapter is unavailable');
  const record = provenanceFor(context, candidateShape);
  const normal = await runAcpAttempt({ candidateShape, fixture, adapterFactory, context, record });
  const cancellation = await runAcpAttempt({ candidateShape, fixture, adapterFactory, context, record, mode: 'CANCEL' });
  const death = await runAcpAttempt({ candidateShape, fixture, adapterFactory, context, record, mode: 'DEATH' });
  const toolCalls = normal.fixtureCapabilities.logicalToolCalls({ rawEvents: normal.rawMessages });
  const fixtureResult = await verifyFixtureResult(fixture, { toolCalls });
  const observedProcess = normal.processObservation;
  const observedEnv = normal.adapter?.processSpec?.env;
  const expectedEnv = effectiveAcpEnvironment(record, normal.adapter);
  const observedEnvKeys = Array.isArray(observedProcess?.envKeys) ? [...observedProcess.envKeys].sort() : null;
  const expectedEnvKeys = Object.keys(expectedEnv).sort();
  const trustedBoundary = {
    cwd: observedProcess?.cwd ?? normal.adapter?.processSpec?.cwd ?? null,
    envDigest: observedEnv ? digest(Object.fromEntries(Object.entries(observedEnv).sort())) : null,
    environmentMatchesRecord: observedProcess?.cwd === fixture.workspacePath
      && observedEnv
      && digest(Object.fromEntries(Object.entries(observedEnv).sort())) === digest(expectedEnv)
      && (observedEnvKeys === null || JSON.stringify(observedEnvKeys) === JSON.stringify(expectedEnvKeys)),
    source: 'MNFS_TRUSTED_PROCESS_RUNNER',
  };
  const recoveryState = await prepareRecoveryState({ candidateShape, context, normal, cancellation, death, protocol: 'ACP_V1' });
  const recovery = await runFreshRecovery({ fixture, toolCalls, context, candidateShape, recoveryState });
  const resolvedInventory = candidateShape === 'OPENCODE-ACP'
    ? normal.adapter?.observations?.profile?.resolvedInventory
    : null;
  const execution = {
    ready: normal.ready,
    session: normal.session,
    settled: normal.settled,
    events: normal.events,
    rawEvents: normal.rawMessages,
    trustedProofs: {
      cwd: fixture.workspacePath,
      boundary: trustedBoundary,
      inventory: resolvedInventory?.logicalInventory ?? deriveAcpInventory(normal.rawMessages, fixture, toolCalls),
      modelFacingInventory: resolvedInventory,
      fixtureVerified: fixtureResult.ok,
      discovery: deriveAcpDiscovery({ candidateShape, rawMessages: normal.rawMessages, adapter: normal.adapter }),
      auth: deriveTrustedAuthProof({
        candidateShape,
        handshake: normal.ready,
        authentication: normal.authentication,
        session: normal.session,
        settled: normal.settled,
        rawObservations: normal.rawMessages,
      }),
      output: normal.processObservation?.output ? {
        bytes: normal.processObservation.output.stdout.bytesSeen + normal.processObservation.output.stderr.bytesSeen,
        limitBytes: normal.processObservation.output.stdout.limitBytes + normal.processObservation.output.stderr.limitBytes,
      } : null,
      processDeath: { ...death.processObservation, temporal: death.temporal, outcome: death.processObservation?.outcome ?? death.settled?.outcome, source: 'MNFS_TRUSTED_PROCESS_RUNNER' },
      cancellation: { ...cancellation.processObservation, temporal: cancellation.temporal, outcome: cancellation.settled?.outcome ?? cancellation.processObservation?.outcome, source: 'MNFS_TRUSTED_PROCESS_RUNNER' },
      recovery,
      authority: { sessionRole: 'OBSERVATIONAL', recoveryOwner: 'MNFS' },
      machinery: {
        reused: ['fixture', 'artifacts', 'process-runner'],
        namedMnfsMachineryEliminatedOrAvoided: ['MNFS_VENDOR_SPECIFIC_WIRE_PARSER'],
        causalMechanism: 'the stable ACP public boundary is normalized by one trusted common client',
        supportingEvidence: [{ source: 'trusted ACP handshake, session and ToolCall observations', candidateShape }],
      },
      supportedBoundary: { source: 'MNFS_TRUSTED_ADAPTER', kind: `${candidateShape}_PUBLIC_API`, observation: 'official candidate boundary' },
      upgradePolicy: record?.upgradePolicy,
      removalConditions: record?.removalConditions,
    },
    toolCalls,
    permissions: normal.fixtureCapabilities.permissionEvidence(),
    recoveryStateRecords: recoveryState?.records ?? [],
    trustedProvenance: safeProvenanceEvidence(record, context.preflight),
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
      return runPiRpc({ candidateShape: 'PI-RPC', fixture: active.fixture, context: active });
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
