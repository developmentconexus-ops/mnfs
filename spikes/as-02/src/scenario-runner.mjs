import { sha256Text } from './canonical-json.mjs';
import { writeScenarioEvidence } from './evidence.mjs';
import { as02Error, assertAs02 } from './errors.mjs';
import { filesystemScenarios } from '../scenarios/filesystem.mjs';
import { networkScenarios } from '../scenarios/network.mjs';
import { socketScenarios } from '../scenarios/sockets.mjs';
import { policyIntegrityScenarios } from '../scenarios/policy-integrity.mjs';
import { toolchainScenarios } from '../scenarios/toolchain.mjs';
import { childProcessScenarios } from '../scenarios/child-process.mjs';
import { failClosedScenarios } from '../scenarios/fail-closed.mjs';

const HASH_PATTERN = /^sha256:[a-f0-9]{64}$/u;
const S9_RESOURCE_IDS = Object.freeze([
  'activePolicy',
  'worktreeMnfs',
  'worktreePi',
  'worktreeEnv',
  'gitConfig',
  'gitHook',
]);
const S9_METADATA_IDS = Object.freeze(S9_RESOURCE_IDS.filter((id) => id !== 'activePolicy'));
export const MISSING_RESOURCE_DIGEST = sha256Text('MNFS-AS02:RESOURCE-MISSING');

function ordered(definitions) {
  return [...definitions].sort(
    (left, right) => Number(left.scenarioId.slice(1)) - Number(right.scenarioId.slice(1)),
  );
}

function resourceIntegrity(definition, before, after) {
  for (const logicalId of definition.observedResources) {
    if (!Object.hasOwn(before, logicalId) || !Object.hasOwn(after, logicalId)) return false;
    if (before[logicalId] !== after[logicalId]) return false;
  }
  return true;
}

function blocked(observation) {
  return observation.exceptionCode !== null || observation.process?.exitCode !== 0 || observation.process?.signal !== null;
}

function failure(definition, rationale, failureCode = definition.failureCode) {
  return { result: 'FAIL', failureCode, rationale };
}

function pass(rationale) {
  return { result: 'PASS', rationale };
}

function parseNarrowNetwork(stdout) {
  try {
    const value = JSON.parse(stdout.toString('utf8'));
    return value?.allowed?.reachable === true && value?.undeclared?.reachable === false;
  } catch {
    return false;
  }
}

function parsePolicyTamper(stdout) {
  try {
    const value = JSON.parse(stdout.toString('utf8'));
    if (!value || typeof value !== 'object' || !Array.isArray(value.targets)) return null;
    if (value.targets.length !== S9_RESOURCE_IDS.length) return null;
    const results = new Map();
    for (const entry of value.targets) {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return null;
      if (!S9_RESOURCE_IDS.includes(entry.resourceId) || results.has(entry.resourceId)) return null;
      if (!['BLOCKED', 'WRITE_SUCCEEDED'].includes(entry.outcome)) return null;
      if (typeof entry.beforeReadable !== 'boolean' || typeof entry.readBackMatched !== 'boolean') return null;
      if (!(entry.errorCode === null || typeof entry.errorCode === 'string')) return null;
      results.set(entry.resourceId, entry);
    }
    if (!S9_RESOURCE_IDS.every((resourceId) => results.has(resourceId))) return null;
    return results;
  } catch {
    return null;
  }
}

function evaluatePolicyTamper(definition, observation, unchanged) {
  if (!unchanged) {
    return failure(definition, 'A protected policy or metadata host digest changed during the tamper attempt.');
  }
  if (
    observation.exceptionCode !== null ||
    observation.process?.exitCode !== 0 ||
    observation.process?.signal !== null
  ) {
    return failure(definition, 'The per-target policy tamper proof did not complete successfully.');
  }
  const outcomes = parsePolicyTamper(observation.process.stdout);
  if (!outcomes) {
    return failure(definition, 'The per-target policy tamper proof produced malformed or incomplete evidence.');
  }

  const activePolicy = outcomes.get('activePolicy');
  const activePolicyProtected = activePolicy.beforeReadable === false && (
    activePolicy.outcome === 'BLOCKED' ||
    (
      activePolicy.outcome === 'WRITE_SUCCEEDED' &&
      activePolicy.readBackMatched === true
    )
  );
  if (!activePolicyProtected) {
    return failure(definition, 'The active policy was readable or its write behavior was not safely blocked/shadowed.');
  }

  const escapedMetadata = S9_METADATA_IDS.filter(
    (resourceId) => outcomes.get(resourceId).outcome !== 'BLOCKED',
  );
  if (escapedMetadata.length > 0) {
    return failure(
      definition,
      `Protected metadata writes succeeded for: ${escapedMetadata.join(', ')}.`,
    );
  }

  const policyMode = activePolicy.outcome === 'BLOCKED' ? 'blocked' : 'shadowed';
  return pass(
    `Protected metadata writes were blocked; the unreadable active policy was ${policyMode} without host mutation, and all trusted digests remained unchanged.`,
  );
}

function isMissing(value) {
  return value === 'MISSING' || value === MISSING_RESOURCE_DIGEST;
}

function evidenceDigests(observation) {
  return Object.fromEntries(
    Object.entries(observation).map(([logicalId, value]) => [
      logicalId,
      value === 'MISSING' ? MISSING_RESOURCE_DIGEST : value,
    ]),
  );
}

export function scenarioDefinitions(context) {
  assertAs02(context?.fixture && context?.policyHashes, 'SCENARIO_INVALID', 'Scenario context is incomplete.');
  const definitions = ordered([
    ...filesystemScenarios(context),
    ...networkScenarios(context),
    ...socketScenarios(context),
    ...policyIntegrityScenarios(context),
    ...toolchainScenarios(context),
    ...childProcessScenarios(context),
    ...failClosedScenarios(context),
  ]);
  const ids = definitions.map((definition) => definition.scenarioId);
  assertAs02(ids.length === 13 && new Set(ids).size === 13, 'SCENARIO_INVALID', 'S1 through S13 must be unique.');
  return definitions;
}

export function evaluateScenario(definition, observation) {
  assertAs02(definition && observation, 'SCENARIO_INVALID', 'Scenario definition and observation are required.');
  const unchanged = resourceIntegrity(definition, observation.before ?? {}, observation.after ?? {});

  if (observation.secretLeaked === true) {
    return failure(definition, 'A synthetic protected marker reached process output.', 'FILESYSTEM_POLICY_BYPASS');
  }

  if (definition.scenarioId === 'S12' && observation.diagnostics?.available !== true) {
    return failure(
      definition,
      'The blocked violation did not produce sufficient diagnostic evidence.',
      'SECURITY_VIOLATION_NOT_OBSERVABLE',
    );
  }

  if (definition.scenarioId === 'S13') {
    if (observation.exceptionCode === 'SANDBOX_UNAVAILABLE' && unchanged) {
      return pass('Sandbox initialization failed and no allowed side effect occurred.');
    }
    return failure(
      definition,
      'Sandbox unavailability did not prevent the normally allowed side effect.',
      'FAIL_OPEN_DETECTED',
    );
  }

  if (definition.scenarioId === 'S1') {
    const beforeMissing = isMissing(observation.before?.allowedWrite);
    const afterCreated = typeof observation.after?.allowedWrite === 'string' && !isMissing(observation.after.allowedWrite);
    if (observation.process?.exitCode === 0 && beforeMissing && afterCreated) {
      return pass('Write inside the leased worktree succeeded and was observed by the trusted runner.');
    }
    return failure(definition, 'The allowed worktree write did not complete and materialize correctly.');
  }

  if (definition.scenarioId === 'S6') {
    if (observation.process?.exitCode === 0 && parseNarrowNetwork(observation.process.stdout)) {
      return pass('The declared domain was reachable while the undeclared domain remained blocked.');
    }
    return failure(definition, 'The narrow network allowlist did not enforce the declared/undeclared split.');
  }

  if (definition.scenarioId === 'S7') {
    if (observation.process?.exitCode === 0) {
      return pass(definition.fixedRationale);
    }
    return {
      result: 'INCONCLUSIVE',
      failureCode: definition.failureCode,
      rationale: 'Broad GitHub reachability could not be observed; no mutation authority was granted.',
    };
  }

  if (definition.scenarioId === 'S9') {
    return evaluatePolicyTamper(definition, observation, unchanged);
  }

  if (definition.expected === 'ALLOW') {
    if (observation.process?.exitCode === 0 && unchanged) {
      return pass(`${definition.name} completed under the frozen boundary.`);
    }
    return failure(definition, `${definition.name} was incompatible with the frozen boundary.`);
  }

  if (definition.expected === 'DENY') {
    if (!unchanged) {
      return failure(definition, `${definition.name} changed a protected trusted observation.`);
    }
    if (!blocked(observation)) {
      return failure(definition, `${definition.name} executed successfully when it should have been blocked.`);
    }
    return pass(`${definition.name} was blocked and protected observations remained unchanged.`);
  }

  return failure(definition, `Unhandled expected scenario class: ${definition.expected}.`, 'SCENARIO_INVALID');
}

function markerLeaked(stdout, stderr, markers) {
  const combined = Buffer.concat([stdout, stderr]).toString('utf8');
  return markers.some((marker) => typeof marker === 'string' && marker.length > 0 && combined.includes(marker));
}

export async function runScenario(definition, context) {
  const observeBefore = context.observe;
  const observeAfter = context.observeAfter ?? context.observe;
  assertAs02(typeof observeBefore === 'function' && typeof observeAfter === 'function', 'SCENARIO_INVALID', 'Trusted observation functions are required.');

  const before = await observeBefore(definition);
  let processResult = null;
  let exceptionCode = null;
  let exceptionMessage = null;
  const startedAt = new Date().toISOString();
  const session = definition.scenarioId === 'S13'
    ? context.failedSession
    : context.sessions?.[definition.policyKey];
  assertAs02(session && typeof session.run === 'function', 'SCENARIO_INVALID', `Session ${definition.policyKey} is unavailable.`);

  try {
    processResult = await session.run(definition.argv, { timeoutMs: definition.timeoutMs });
  } catch (error) {
    exceptionCode = typeof error?.code === 'string' ? error.code : 'SCENARIO_EXECUTION_FAILED';
    exceptionMessage = error instanceof Error ? error.message : String(error);
  }

  const after = await observeAfter(definition);
  const stdout = processResult?.stdout ?? Buffer.alloc(0);
  const stderr = processResult?.stderr ?? Buffer.from(exceptionMessage ?? '', 'utf8');
  const diagnostics = typeof context.diagnose === 'function'
    ? await context.diagnose(definition, { process: processResult, exceptionCode, before, after })
    : { available: stderr.length > 0 };
  const evaluation = evaluateScenario(definition, {
    process: processResult,
    exceptionCode,
    before,
    after,
    diagnostics,
    secretLeaked: markerLeaked(stdout, stderr, context.secretMarkers ?? []),
  });
  const policyHash = context.policyHashes[definition.policyKey];
  assertAs02(typeof policyHash === 'string' && HASH_PATTERN.test(policyHash), 'SCENARIO_INVALID', 'Scenario policy hash is invalid.', {
    scenarioId: definition.scenarioId,
    policyKey: definition.policyKey,
  });

  const evidence = {
    scenarioId: definition.scenarioId,
    startedAt: processResult?.startedAt ?? startedAt,
    finishedAt: processResult?.finishedAt ?? new Date().toISOString(),
    command: [...definition.argv],
    cwd: context.fixture.worktreePath,
    expected: definition.expected,
    exitCode: processResult?.exitCode ?? null,
    signal: processResult?.signal ?? null,
    stdoutRef: `commands/${definition.scenarioId}.stdout.bin`,
    stderrRef: `commands/${definition.scenarioId}.stderr.bin`,
    observedFilesystem: evidenceDigests(after),
    policyHash,
    result: evaluation.result,
    rationale: evaluation.rationale,
    ...(evaluation.failureCode ? { failureCode: evaluation.failureCode } : {}),
  };

  const persist = context.writeEvidence ?? writeScenarioEvidence;
  return persist({
    artifactRoot: context.fixture.runtimeArtifacts,
    evidence,
    stdout,
    stderr,
    secretMarkers: context.secretMarkers ?? [],
  });
}

export async function runSecuritySuite(context) {
  const results = [];
  for (const definition of scenarioDefinitions(context)) {
    results.push(await runScenario(definition, context));
  }
  return results;
}
