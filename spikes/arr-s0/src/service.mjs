import { constants } from 'node:fs';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import {
  sha256Bytes,
  verifyArtifactRecords,
  writeCanonicalJsonArtifact,
} from './artifacts.mjs';
import { createEvidenceCapture, collectDefaultS0 } from './collector.mjs';
import { deriveCapabilityClasses } from './class-eligibility.mjs';
import { S0_CAPABILITY_IDS, S0_PLAN_GIT_BLOB, S0_PLAN_VERSION } from './contract.mjs';
import {
  executionAuthorizationEvidence,
  requireAuthenticatedExecutionAuthorization,
} from './execution-authority.mjs';
import { createInitialRunState, transitionRunState } from './model.mjs';
import { requireRunId, resolveS0RunRoot, resolveS0StateRoot } from './paths.mjs';
import { observeFilesystemOwnership, observeHostIdentity } from './probes/host-identity.mjs';
import { observeRepositoryIdentity } from './probes/repository.mjs';
import { deriveS0Verdict } from './verdict.mjs';

const POSITIVE_NODE = Object.freeze([24, 18, 0]);

function nodeVersionAtLeast(value, minimum = POSITIVE_NODE) {
  const match = String(value ?? '').match(/^v?(\d+)\.(\d+)\.(\d+)/u);
  if (!match) return false;
  const actual = match.slice(1).map(Number);
  for (let index = 0; index < minimum.length; index += 1) {
    if (actual[index] > minimum[index]) return true;
    if (actual[index] < minimum[index]) return false;
  }
  return true;
}

function isLinuxOwnedAbsolute(value) {
  if (typeof value !== 'string' || !path.isAbsolute(value)) return false;
  const normalized = path.normalize(value);
  return normalized !== '/mnt' && !normalized.startsWith(`/mnt${path.sep}`);
}

function requireExecutionAuthorization(identities, source = null) {
  if (!identities?.plan || !identities?.contract) {
    throw new TypeError('ARR-S0 host observation requires exact plan and contract identities');
  }
  if (identities.plan.version !== S0_PLAN_VERSION) {
    throw new TypeError('ARR-S0 host observation plan version does not match accepted implementation plan');
  }
  if (identities.contract.version !== '1.0.0') {
    throw new TypeError('ARR-S0 host observation requires accepted contract version 1.0.0');
  }
  const authority = requireAuthenticatedExecutionAuthorization(identities.executionAuthorization, {
    planGitBlob: S0_PLAN_GIT_BLOB,
    contractHash: identities.contract.hash,
    ...(source?.commitSha ? { baseCommitSha: source.commitSha } : {}),
  });
  return executionAuthorizationEvidence(authority);
}

async function defaultInspect({ repoRoot, stateRoot }) {
  let host;
  let repository;
  let stateRootFilesystem;
  let requiredReadsAvailable = true;
  try {
    host = await observeHostIdentity({ repoRoot });
  } catch {
    host = { identity: { platform: 'linux', isWsl2: false, nodeVersion: process.version }, observations: [] };
    requiredReadsAvailable = false;
  }
  try {
    repository = await observeRepositoryIdentity({ repoRoot });
  } catch {
    repository = { source: null, clean: false };
  }
  try {
    stateRootFilesystem = await observeFilesystemOwnership(stateRoot);
  } catch {
    stateRootFilesystem = { state: 'UNKNOWN', filesystemType: '', observedPath: null };
  }
  for (const target of ['/proc/sys/kernel/osrelease', '/etc/os-release']) {
    try { await access(target, constants.R_OK); } catch { requiredReadsAvailable = false; }
  }
  const linuxFs = host.observations?.find((record) => record.id === 'HOST-LINUX-FS');
  return {
    hostIdentity: host.identity,
    linuxFilesystemSupported: linuxFs?.state === 'SUPPORTED',
    stateRootFilesystem,
    stateRootFilesystemSupported: stateRootFilesystem?.state === 'SUPPORTED',
    repository,
    requiredReadsAvailable,
  };
}

export async function preflightS0({ repoRoot = process.cwd(), stateRoot, identities, inspect = defaultInspect } = {}) {
  const executionAuthorization = requireExecutionAuthorization(identities);

  let resolvedStateRoot;
  try {
    resolvedStateRoot = await resolveS0StateRoot(stateRoot === undefined ? {} : { stateRoot });
  } catch (error) {
    return {
      ok: false,
      checks: [{ id: 'stateRoot', ok: false, rationale: String(error.message ?? error) }],
      facts: null,
      stateRoot: null,
      executionAuthorization,
    };
  }

  let facts;
  try {
    facts = await inspect({ repoRoot, stateRoot: resolvedStateRoot });
  } catch (error) {
    return {
      ok: false,
      checks: [{ id: 'inspect', ok: false, rationale: String(error.message ?? error) }],
      facts: null,
      stateRoot: resolvedStateRoot,
      executionAuthorization,
    };
  }

  if (facts?.repository?.source?.commitSha) {
    requireExecutionAuthorization(identities, facts.repository.source);
  }

  const checks = [
    { id: 'canonicalWsl2', ok: facts?.hostIdentity?.isWsl2 === true, rationale: 'canonical host must be WSL2' },
    { id: 'repoRootLinuxOwned', ok: isLinuxOwnedAbsolute(repoRoot), rationale: 'repository must be on a Linux-owned absolute path' },
    { id: 'stateRootLinuxOwned', ok: isLinuxOwnedAbsolute(resolvedStateRoot), rationale: 'state root must be on a Linux-owned absolute path' },
    { id: 'linuxFilesystem', ok: facts?.linuxFilesystemSupported === true, rationale: 'repository filesystem must be on the reviewed Linux-owned allowlist' },
    { id: 'stateRootFilesystem', ok: facts?.stateRootFilesystemSupported === true, rationale: 'state-root filesystem must be on the reviewed Linux-owned allowlist' },
    { id: 'repositoryIdentity', ok: Boolean(facts?.repository?.source?.commitSha && facts?.repository?.source?.treeSha), rationale: 'exact Git source identity is required' },
    { id: 'checkoutClean', ok: facts?.repository?.clean === true, rationale: 'checkout must be clean' },
    { id: 'nodeVersion', ok: nodeVersionAtLeast(facts?.hostIdentity?.nodeVersion), rationale: 'Node.js >=24.18.0 is required' },
    { id: 'requiredReads', ok: facts?.requiredReadsAvailable === true, rationale: 'required host identity files must be readable' },
  ];
  return {
    ok: checks.every((check) => check.ok),
    checks,
    facts,
    stateRoot: resolvedStateRoot,
    executionAuthorization,
  };
}

function observationInventory(observations) {
  const byId = {};
  const duplicates = [];
  const unexpected = [];
  for (const record of observations ?? []) {
    if (!record || typeof record.id !== 'string') continue;
    if (byId[record.id]) duplicates.push(record.id);
    byId[record.id] = record;
    if (!S0_CAPABILITY_IDS.includes(record.id)) unexpected.push(record.id);
  }
  const missing = S0_CAPABILITY_IDS.filter((id) => !byId[id]);
  return { byId, duplicates, unexpected, missing };
}

function artifactRecord(id, meta) {
  return { id, ...meta };
}

async function readJson(target) {
  return JSON.parse((await readFile(target)).toString('utf8'));
}

async function readJsonIfPresent(target) {
  try { return await readJson(target); } catch (error) { if (error?.code === 'ENOENT') return null; throw error; }
}

export async function runS0({
  repoRoot = process.cwd(),
  stateRoot,
  runId,
  identities,
  preflight = preflightS0,
  collect = collectDefaultS0,
} = {}) {
  const executionAuthorization = requireExecutionAuthorization(identities);
  const canonicalRunId = requireRunId(runId);
  const preflightResult = await preflight({ repoRoot, stateRoot, identities });
  if (!preflightResult?.ok) throw new Error('ARR-S0 preflight blocked');
  const source = preflightResult.facts?.repository?.source;
  if (!source) throw new Error('ARR-S0 preflight did not establish repository identity');
  requireExecutionAuthorization(identities, source);

  const resolvedStateRoot = preflightResult.stateRoot ?? await resolveS0StateRoot(stateRoot === undefined ? {} : { stateRoot });
  const runRoot = await resolveS0RunRoot(canonicalRunId, { stateRoot: resolvedStateRoot });
  const evidenceRecords = [];

  let state = createInitialRunState({
    runId: canonicalRunId,
    source,
    plan: identities.plan,
    contract: identities.contract,
    executionAuthorization,
  });
  const createdMeta = await writeCanonicalJsonArtifact(runRoot, 'state/created.json', state);
  evidenceRecords.push(artifactRecord('state-created', createdMeta));

  state = transitionRunState(state, 'OBSERVING');
  const observingMeta = await writeCanonicalJsonArtifact(runRoot, 'state/observing.json', state);
  evidenceRecords.push(artifactRecord('state-observing', observingMeta));

  const capture = createEvidenceCapture(runRoot);
  const collected = await collect({ capture, runRoot, repoRoot });
  evidenceRecords.push(...capture.records);

  const inventory = observationInventory(collected.observations);
  const sourceMismatch = collected.source?.commitSha !== source.commitSha || collected.source?.treeSha !== source.treeSha;
  const coreEvidenceCollected = inventory.missing.length === 0 && Boolean(collected.hostIdentity && collected.source);
  const observationMeta = await writeCanonicalJsonArtifact(runRoot, 'normalized/capabilities.json', collected.observations ?? []);
  evidenceRecords.push(artifactRecord('normalized-capabilities', observationMeta));

  const classes = deriveCapabilityClasses(inventory.byId);
  const classesMeta = await writeCanonicalJsonArtifact(runRoot, 'normalized/classes.json', classes);
  evidenceRecords.push(artifactRecord('normalized-classes', classesMeta));

  state = transitionRunState(state, 'OBSERVED');
  const observedMeta = await writeCanonicalJsonArtifact(runRoot, 'state/observed.json', state);
  evidenceRecords.push(artifactRecord('state-observed', observedMeta));

  const manifestValue = {
    schemaVersion: 1,
    runId: canonicalRunId,
    records: evidenceRecords.map((record) => structuredClone(record)),
  };
  const manifestMeta = await writeCanonicalJsonArtifact(runRoot, 'manifest/evidence.json', manifestValue);
  const integrity = await verifyArtifactRecords(runRoot, manifestValue.records);

  const verdict = deriveS0Verdict({
    integrity: {
      unsafeMutationDetected: false,
      evidenceTampered: !integrity.ok,
      failOpenDetected: false,
      artifactRootEscaped: false,
      contractViolation: sourceMismatch || inventory.duplicates.length > 0 || inventory.unexpected.length > 0,
    },
    preconditions: {
      canonicalWsl2: collected.hostIdentity?.isWsl2 === true,
      repositoryIdentity: Boolean(collected.source),
      checkoutClean: collected.checkoutClean === true,
      coreEvidenceCollected,
    },
    observations: collected.observations ?? [],
    capabilityClasses: classes,
  });

  const resultValue = {
    schemaVersion: 1,
    runId: canonicalRunId,
    source: structuredClone(collected.source ?? source),
    executionAuthorization: structuredClone(executionAuthorization),
    hostIdentity: structuredClone(collected.hostIdentity ?? null),
    capabilities: structuredClone(collected.observations ?? []),
    capabilityClasses: structuredClone(classes),
    verdict,
    limitations: [
      ...(collected.limitations ?? []),
      ...inventory.missing.map((id) => `missing required observation: ${id}`),
      ...inventory.duplicates.map((id) => `duplicate observation: ${id}`),
      ...inventory.unexpected.map((id) => `unexpected observation: ${id}`),
      ...(sourceMismatch ? ['repository source changed between preflight and observation'] : []),
      ...integrity.errors,
    ],
    manifest: { ...manifestMeta },
  };
  const resultMeta = await writeCanonicalJsonArtifact(runRoot, 'final/result.json', resultValue);

  state = transitionRunState({
    ...state,
    manifestHash: manifestMeta.sha256,
    resultHash: resultMeta.sha256,
  }, 'FINALIZED');
  await writeCanonicalJsonArtifact(runRoot, 'state/finalized.json', state);

  return {
    ...resultValue,
    phase: 'FINALIZED',
    integrity,
    resultPath: path.join(runRoot, 'final', 'result.json'),
  };
}

export async function reportS0({ runId, stateRoot } = {}) {
  const canonicalRunId = requireRunId(runId);
  const resolvedStateRoot = await resolveS0StateRoot(stateRoot === undefined ? {} : { stateRoot });
  const runRoot = await resolveS0RunRoot(canonicalRunId, { stateRoot: resolvedStateRoot });
  const statePaths = [
    ['FINALIZED', 'state/finalized.json'],
    ['OBSERVED', 'state/observed.json'],
    ['OBSERVING', 'state/observing.json'],
    ['CREATED', 'state/created.json'],
  ];

  let phase = null;
  let state = null;
  for (const [candidatePhase, relative] of statePaths) {
    const value = await readJsonIfPresent(path.join(runRoot, relative));
    if (value) { phase = candidatePhase; state = value; break; }
  }
  if (!state) throw new Error(`ARR-S0 run not found: ${canonicalRunId}`);
  if (phase !== 'FINALIZED') {
    return { runId: canonicalRunId, complete: false, phase, state, verdict: null, integrity: { ok: true, errors: [] } };
  }

  const manifestPath = path.join(runRoot, 'manifest/evidence.json');
  const resultPath = path.join(runRoot, 'final/result.json');
  const [manifestBytes, resultBytes] = await Promise.all([readFile(manifestPath), readFile(resultPath)]);
  const manifest = JSON.parse(manifestBytes.toString('utf8'));
  const result = JSON.parse(resultBytes.toString('utf8'));
  const recordIntegrity = await verifyArtifactRecords(runRoot, manifest.records);
  const errors = [...recordIntegrity.errors];
  if (sha256Bytes(manifestBytes) !== state.manifestHash) errors.push('manifest hash does not match finalized state');
  if (sha256Bytes(resultBytes) !== state.resultHash) errors.push('result hash does not match finalized state');
  if (result.manifest?.sha256 !== state.manifestHash) errors.push('result manifest hash does not match finalized state');
  if (JSON.stringify(result.executionAuthorization) !== JSON.stringify(state.executionAuthorization)) {
    errors.push('result execution authorization does not match finalized state');
  }

  const integrity = { ok: errors.length === 0, errors };
  const verdict = integrity.ok
    ? result.verdict
    : deriveS0Verdict({
        integrity: {
          unsafeMutationDetected: false,
          evidenceTampered: true,
          failOpenDetected: false,
          artifactRootEscaped: false,
          contractViolation: false,
        },
        preconditions: {
          canonicalWsl2: true,
          repositoryIdentity: true,
          checkoutClean: true,
          coreEvidenceCollected: true,
        },
        observations: result.capabilities,
        capabilityClasses: result.capabilityClasses,
      });
  return { ...result, complete: true, phase: 'FINALIZED', verdict, integrity, resultPath };
}
