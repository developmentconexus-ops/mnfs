import { join } from 'node:path';

import { assertTc01 } from './errors.mjs';
import { validateTreehouseCapabilities } from './provenance.mjs';

const DIRTY_SENTINEL_BYTES = Buffer.from('tc01-dirty-sentinel\n', 'utf8');
const REQUIRED_CAPABILITIES = Object.freeze([
  'conditionalHolder',
  'conditionalLeaseId',
  'leaseJson',
  'statusJson',
]);
const IDENTITY_FIELDS = Object.freeze([
  'commandShapeHash',
  'gitVersion',
  'kernelRelease',
  'treehouseExecutableHash',
  'treehouseVersion',
  'ubuntuRelease',
]);
const BLOCKING_PROVENANCE_CODES = new Set([
  'TC01_LINUX_FILESYSTEM_REQUIRED',
  'TC01_NOT_WSL2',
  'TC01_TOOL_MISSING',
  'TC01_VERSION_MISMATCH',
]);
const FORBIDDEN_MUTATION_ARGS = new Set(['--force', 'force', 'destroy', 'prune']);

export const TC01_SCENARIO_IDS = Object.freeze(Array.from(
  { length: 15 },
  (_, index) => `TC01-S${String(index + 1).padStart(2, '0')}`,
));

function compareCodeUnits(left, right) {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function isPlainObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function requireFunction(value, label) {
  assertTc01(typeof value === 'function', 'TC01_INVALID_INPUT', `${label} is required.`);
  return value;
}

function errorObservation(error) {
  return {
    name: error?.name ?? 'Error',
    code: typeof error?.code === 'string' ? error.code : null,
    message: error instanceof Error ? error.message : String(error),
  };
}

function sameJson(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function snapshotIsClean(snapshot) {
  return snapshot?.porcelainStatus?.byteLength === 0;
}

function assertProcessResult(result, label) {
  assertTc01(isPlainObject(result), 'TC01_EVIDENCE_INVALID', `${label} did not return process Evidence.`);
  assertTc01(result.exitCode === null || Number.isSafeInteger(result.exitCode), 'TC01_EVIDENCE_INVALID', `${label} exit code is invalid.`, {
    exitCode: result.exitCode ?? null,
  });
  return result;
}

function assertLeaseIdentity(item, lease, label) {
  assertTc01(item && typeof item === 'object', 'TC01_EVIDENCE_INVALID', `${label} did not find the acquired worktree.`);
  assertTc01(item.path === lease.path, 'TC01_EVIDENCE_INVALID', `${label} path does not match acquisition.`, {
    expected: lease.path,
    actual: item.path ?? null,
  });
  assertTc01(item.status === 'leased', 'TC01_EVIDENCE_INVALID', `${label} did not observe leased status.`, {
    status: item.status ?? null,
  });
  assertTc01(item.leaseId === lease.leaseId, 'TC01_EVIDENCE_INVALID', `${label} Lease ID does not match acquisition.`, {
    expected: lease.leaseId,
    actual: item.leaseId ?? null,
  });
  assertTc01(item.leaseHolder === lease.leaseHolder, 'TC01_EVIDENCE_INVALID', `${label} holder does not match acquisition.`, {
    expected: lease.leaseHolder,
    actual: item.leaseHolder ?? null,
  });
  return item;
}

function assertNoControlledProcesses(item, label) {
  assertTc01(Array.isArray(item?.processes) && item.processes.length === 0, 'TC01_EVIDENCE_INVALID', `${label} found controlled processes in the worktree.`, {
    processes: item?.processes ?? null,
  });
}

function assertReleasedOrAvailable(item, lease, label) {
  if (item === null) return null;
  assertTc01(item.path === lease.path, 'TC01_EVIDENCE_INVALID', `${label} observed an unexpected path.`, {
    expected: lease.path,
    actual: item.path ?? null,
  });
  assertTc01(
    item.status === 'available' && item.leaseId === '' && item.leaseHolder === '',
    'TC01_EVIDENCE_INVALID',
    `${label} fresh status still contains a Lease or a newer Lease occupies the path.`,
    {
      status: item.status ?? null,
      leaseId: item.leaseId ?? null,
      leaseHolder: item.leaseHolder ?? null,
    },
  );
  return item;
}

function validateInput(input) {
  assertTc01(isPlainObject(input), 'TC01_INVALID_INPUT', 'TC-01 scenario runner input must be an object.');
  assertTc01(isPlainObject(input.fixture), 'TC01_INVALID_INPUT', 'TC-01 scenario fixture is required.');
  for (const field of ['runId', 'runRoot', 'sourceRepo', 'poolRoot', 'gitLog', 'holder']) {
    assertTc01(typeof input.fixture[field] === 'string' && input.fixture[field].length > 0, 'TC01_INVALID_INPUT', `TC-01 fixture ${field} is required.`);
  }
  assertTc01(isPlainObject(input.provenance), 'TC01_INVALID_INPUT', 'TC-01 provenance is required.');
  assertTc01(isPlainObject(input.acceptedIdentity), 'TC01_INVALID_INPUT', 'TC-01 accepted freshness identity is required.');
  assertTc01(typeof input.commandShapeHash === 'string' && input.commandShapeHash.length > 0, 'TC01_INVALID_INPUT', 'TC-01 command-shape hash is required.');
  assertTc01(Array.isArray(input.expectedEnvironmentKeySets) && input.expectedEnvironmentKeySets.length > 0, 'TC01_INVALID_INPUT', 'TC-01 process environment key sets are required.');
  for (const keys of input.expectedEnvironmentKeySets) {
    assertTc01(Array.isArray(keys) && keys.every((key) => typeof key === 'string' && key.length > 0), 'TC01_INVALID_INPUT', 'Each environment key set must be a string array.');
  }

  const client = input.client;
  assertTc01(isPlainObject(client), 'TC01_INVALID_INPUT', 'TC-01 Treehouse client is required.');
  requireFunction(client.acquireLease, 'Treehouse acquireLease');
  requireFunction(client.observeStatus, 'Treehouse observeStatus');
  requireFunction(client.findStatusByPath, 'Treehouse findStatusByPath');
  requireFunction(client.returnLease, 'Treehouse returnLease');
  requireFunction(input.createFreshClient, 'Fresh Treehouse client factory');

  const observers = input.observers;
  assertTc01(isPlainObject(observers), 'TC01_INVALID_INPUT', 'TC-01 observers are required.');
  for (const name of [
    'snapshotRepository',
    'compareRepositorySnapshots',
    'snapshotPathTree',
    'comparePathSnapshots',
    'proveLinkedWorktree',
    'readGitInvocations',
    'assertNoFetchInvocation',
    'listRemotes',
    'snapshotPrivateState',
    'writeControlledFile',
    'readControlledFile',
    'removeControlledFile',
    'inspectReleaseTarget',
  ]) {
    requireFunction(observers[name], `Observer ${name}`);
  }

  assertTc01(isPlainObject(input.commandEvidence), 'TC01_INVALID_INPUT', 'TC-01 command Evidence reader is required.');
  requireFunction(input.commandEvidence.list, 'Command Evidence list');
  assertTc01(isPlainObject(input.evidenceStore), 'TC01_INVALID_INPUT', 'TC-01 Evidence store is required.');
  requireFunction(input.evidenceStore.writeScenario, 'Evidence store writeScenario');
  requireFunction(input.createScenarioRecord, 'Scenario Evidence record factory');
  requireFunction(input.now, 'Scenario clock');
  return input;
}

function validateProvenance(provenance) {
  validateTreehouseCapabilities(provenance);
  assertTc01(provenance.schemaVersion === 1, 'TC01_VERSION_MISMATCH', 'TC-01 provenance schema is unsupported.');
  assertTc01(provenance.environment === 'WSL2', 'TC01_NOT_WSL2', 'TC-01 provenance is not canonical WSL2.');
  for (const field of [
    'ubuntuRelease',
    'kernelRelease',
    'gitVersion',
    'treehouseVersion',
    'treehouseExecutable',
    'treehouseExecutableHash',
  ]) {
    assertTc01(typeof provenance[field] === 'string' && provenance[field].length > 0, 'TC01_VERSION_MISMATCH', `TC-01 provenance ${field} is missing.`);
  }
  const missing = REQUIRED_CAPABILITIES.filter((name) => provenance.capabilities?.[name] !== true);
  assertTc01(missing.length === 0, 'TC01_VERSION_MISMATCH', 'TC-01 provenance lacks required capabilities.', { missing });
  return provenance;
}

function normalizeKeySet(keys) {
  return [...new Set(keys)].sort(compareCodeUnits);
}

function commandContractViolation(metadata, allowedSets) {
  if (!isPlainObject(metadata)) return true;
  if (metadata.shell !== false || metadata.stdin !== 'closed') return true;
  if (!Number.isSafeInteger(metadata.timeoutMs) || metadata.timeoutMs <= 0) return true;
  if (!Number.isSafeInteger(metadata.stdoutLimitBytes) || metadata.stdoutLimitBytes <= 0 || metadata.stdoutLimitBytes > 65_536) return true;
  if (!Number.isSafeInteger(metadata.stderrLimitBytes) || metadata.stderrLimitBytes <= 0 || metadata.stderrLimitBytes > 65_536) return true;
  if (!Array.isArray(metadata.environmentKeys) || metadata.environmentKeys.some((key) => typeof key !== 'string')) return true;
  const actual = normalizeKeySet(metadata.environmentKeys);
  return !allowedSets.some((expected) => sameJson(actual, expected));
}

function currentFreshnessIdentity(input) {
  return {
    treehouseExecutableHash: input.provenance.treehouseExecutableHash,
    treehouseVersion: input.provenance.treehouseVersion,
    gitVersion: input.provenance.gitVersion,
    kernelRelease: input.provenance.kernelRelease,
    ubuntuRelease: input.provenance.ubuntuRelease,
    commandShapeHash: input.commandShapeHash,
  };
}

function newGitInvocationsContainDestructiveAction(entries) {
  return entries.some((entry) => {
    const argv = Array.isArray(entry?.argv) ? entry.argv : [];
    if (argv.some((value) => FORBIDDEN_MUTATION_ARGS.has(value))) return true;
    if (argv[0] === 'reset' || argv[0] === 'clean') return true;
    return argv[0] === 'worktree' && argv.includes('remove');
  });
}

export async function runTc01Scenarios(rawInput) {
  const input = validateInput(rawInput);
  const records = [];
  const context = {
    lease: null,
    leaseIds: new Set(),
    linkedProof: null,
    sourceBefore: null,
    sourceAfter: null,
    worktreeBefore: null,
    poolBefore: null,
    privateBefore: null,
    semanticRelease: null,
  };
  let blockedBy = null;

  async function persist(outcome) {
    const record = await input.createScenarioRecord(outcome);
    assertTc01(isPlainObject(record), 'TC01_EVIDENCE_INVALID', 'Scenario record factory must return an object.', {
      scenarioId: outcome.scenarioId,
    });
    await input.evidenceStore.writeScenario(record);
    records.push(record);
    return record;
  }

  async function execute(scenarioId, expected, operation, { provenanceScenario = false } = {}) {
    const startedAt = input.now().toISOString();
    try {
      const value = await operation();
      const result = value?.result ?? 'PASS';
      const observations = value?.observations ?? {};
      const rationale = value?.rationale ?? `${scenarioId} satisfied its deterministic acceptance conditions.`;
      return persist({
        scenarioId,
        startedAt,
        finishedAt: input.now().toISOString(),
        expected,
        observations,
        result,
        rationale,
      });
    } catch (error) {
      const result = provenanceScenario && BLOCKING_PROVENANCE_CODES.has(error?.code) ? 'BLOCKED' : 'FAIL';
      return persist({
        scenarioId,
        startedAt,
        finishedAt: input.now().toISOString(),
        expected,
        observations: { error: errorObservation(error) },
        result,
        rationale: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async function block(scenarioId, expected, dependency) {
    const startedAt = input.now().toISOString();
    return persist({
      scenarioId,
      startedAt,
      finishedAt: input.now().toISOString(),
      expected,
      observations: { blockedBy: dependency },
      result: 'BLOCKED',
      rationale: `${scenarioId} was not executed because ${dependency} did not establish its required state.`,
    });
  }

  async function observeLease(lease, label) {
    const status = await input.client.observeStatus({ fixture: input.fixture, provenance: input.provenance });
    const item = input.client.findStatusByPath(status, lease.path);
    assertLeaseIdentity(item, lease, label);
    return { status, item };
  }

  async function acquireCurrentLease(label) {
    const lease = await input.client.acquireLease({
      fixture: input.fixture,
      holder: input.fixture.holder,
      provenance: input.provenance,
    });
    assertTc01(isPlainObject(lease), 'TC01_EVIDENCE_INVALID', `${label} acquisition did not return a Lease observation.`);
    assertTc01(lease.leaseHolder === input.fixture.holder, 'TC01_EVIDENCE_INVALID', `${label} holder does not match the deterministic fixture holder.`, {
      expected: input.fixture.holder,
      actual: lease.leaseHolder ?? null,
    });
    for (const field of ['path', 'leaseId', 'leasedAt']) {
      assertTc01(typeof lease[field] === 'string' && lease[field].length > 0, 'TC01_EVIDENCE_INVALID', `${label} ${field} is missing.`);
    }
    assertTc01(!context.leaseIds.has(lease.leaseId), 'TC01_EVIDENCE_INVALID', `${label} reused a previous external Lease ID.`, {
      leaseId: lease.leaseId,
    });

    const linkedProof = await input.observers.proveLinkedWorktree({ fixture: input.fixture, lease });
    assertTc01(
      linkedProof?.linked === true
        && linkedProof?.sameCommonDir === true
        && linkedProof?.sourceClean === true
        && linkedProof?.worktreeClean === true,
      'TC01_EVIDENCE_INVALID',
      `${label} linked-worktree or cleanliness proof failed.`,
      { linkedProof },
    );
    const { item } = await observeLease(lease, `${label} status`);
    assertNoControlledProcesses(item, `${label} status`);
    const worktreeBefore = await input.observers.snapshotRepository({
      path: lease.path,
      label: `${label}-worktree-before`,
    });
    assertTc01(snapshotIsClean(worktreeBefore), 'TC01_EVIDENCE_INVALID', `${label} acquired worktree is not clean.`, { worktreeBefore });

    context.leaseIds.add(lease.leaseId);
    context.lease = lease;
    context.linkedProof = linkedProof;
    context.worktreeBefore = worktreeBefore;
    return { lease, linkedProof, status: item, worktreeBefore };
  }

  async function releaseExactLease(lease, label) {
    const worktreeBefore = await input.observers.snapshotRepository({
      path: lease.path,
      label: `${label}-worktree-before`,
    });
    assertTc01(snapshotIsClean(worktreeBefore), 'TC01_EVIDENCE_INVALID', `${label} requires a clean worktree.`, { worktreeBefore });
    const { item: beforeItem } = await observeLease(lease, `${label} preflight`);
    assertNoControlledProcesses(beforeItem, `${label} preflight`);
    const sourceBefore = await input.observers.snapshotRepository({
      path: input.fixture.sourceRepo,
      label: `${label}-source-before`,
    });
    const process = assertProcessResult(await input.client.returnLease({
      fixture: input.fixture,
      provenance: input.provenance,
      path: lease.path,
      leaseId: lease.leaseId,
      holder: lease.leaseHolder,
    }), label);
    assertTc01(process.exitCode === 0, 'TC01_EVIDENCE_INVALID', `${label} exact conditional return did not exit zero.`, {
      exitCode: process.exitCode,
    });
    const statusAfter = await input.client.observeStatus({ fixture: input.fixture, provenance: input.provenance });
    const afterItem = input.client.findStatusByPath(statusAfter, lease.path);
    assertReleasedOrAvailable(afterItem, lease, `${label} fresh status`);
    const sourceAfter = await input.observers.snapshotRepository({
      path: input.fixture.sourceRepo,
      label: `${label}-source-after`,
    });
    const sourceComparison = input.observers.compareRepositorySnapshots(sourceBefore, sourceAfter);
    assertTc01(sourceComparison?.equal === true, 'TC01_EVIDENCE_INVALID', `${label} changed the source checkout.`, { sourceComparison });
    if (context.lease?.leaseId === lease.leaseId) context.lease = null;
    return { process, beforeItem, afterItem, sourceComparison };
  }

  const s01 = await execute(
    'TC01-S01',
    'The exact Treehouse, Git, Ubuntu/WSL and capability identity is admissible.',
    async () => ({
      observations: {
        treehouseVersion: validateProvenance(input.provenance).treehouseVersion,
        treehouseExecutableHash: input.provenance.treehouseExecutableHash,
        capabilities: input.provenance.capabilities,
      },
    }),
    { provenanceScenario: true },
  );
  if (s01.result !== 'PASS') blockedBy = 'TC01-S01';

  let s02;
  if (blockedBy) {
    s02 = await block('TC01-S02', 'Acquire one strict durable Lease and prove its linked-worktree identity.', blockedBy);
  } else {
    s02 = await execute(
      'TC01-S02',
      'Acquire one strict durable Lease and prove its linked-worktree identity.',
      async () => {
        context.sourceBefore = await input.observers.snapshotRepository({
          path: input.fixture.sourceRepo,
          label: 'source-before-acquisition',
        });
        context.poolBefore = await input.observers.snapshotPathTree({
          root: input.fixture.poolRoot,
          label: 'pool-before-acquisition',
        });
        context.privateBefore = await input.observers.snapshotPrivateState({
          fixture: input.fixture,
          label: 'private-before-acquisition',
        });
        const acquired = await acquireCurrentLease('S02');
        return {
          observations: {
            lease: acquired.lease,
            status: acquired.status,
            linkedProof: acquired.linkedProof,
          },
        };
      },
    );
    if (s02.result !== 'PASS') blockedBy = 'TC01-S02';
  }

  if (blockedBy) {
    await block('TC01-S03', 'Acquisition uses no fetch and the fixture has zero remotes.', blockedBy);
  } else {
    const s03 = await execute(
      'TC01-S03',
      'Acquisition uses no fetch and the fixture has zero remotes.',
      async () => {
        const invocations = await input.observers.readGitInvocations(input.fixture.gitLog);
        input.observers.assertNoFetchInvocation(invocations);
        const remotes = await input.observers.listRemotes(input.fixture.sourceRepo);
        assertTc01(Array.isArray(remotes) && remotes.length === 0, 'TC01_EVIDENCE_INVALID', 'S03 fixture repository contains a remote.', { remotes });
        return { observations: { gitInvocationCount: invocations.length, remotes } };
      },
    );
    if (s03.result !== 'PASS') blockedBy = 'TC01-S03';
  }

  if (blockedBy) {
    await block('TC01-S04', 'The source remains unchanged while the external pool and linked metadata change.', blockedBy);
  } else {
    const s04 = await execute(
      'TC01-S04',
      'The source remains unchanged while the external pool and linked metadata change.',
      async () => {
        context.sourceAfter = await input.observers.snapshotRepository({
          path: input.fixture.sourceRepo,
          label: 'source-after-acquisition',
        });
        const sourceComparison = input.observers.compareRepositorySnapshots(context.sourceBefore, context.sourceAfter);
        const poolAfter = await input.observers.snapshotPathTree({
          root: input.fixture.poolRoot,
          label: 'pool-after-acquisition',
        });
        const poolComparison = input.observers.comparePathSnapshots(context.poolBefore, poolAfter);
        assertTc01(sourceComparison?.equal === true, 'TC01_EVIDENCE_INVALID', 'S04 source checkout changed during acquisition.', { sourceComparison });
        assertTc01(poolComparison?.equal === false, 'TC01_EVIDENCE_INVALID', 'S04 external pool did not record the expected acquisition effect.', { poolComparison });
        assertTc01(context.linkedProof?.linked === true && context.linkedProof?.sameCommonDir === true, 'TC01_EVIDENCE_INVALID', 'S04 linked-worktree metadata proof is missing.');
        return { observations: { sourceComparison, poolComparison, linkedProof: context.linkedProof } };
      },
    );
    if (s04.result !== 'PASS') blockedBy = 'TC01-S04';
  }

  if (blockedBy) {
    await block('TC01-S05', 'A fresh client rediscovers the exact Lease without a second acquisition.', blockedBy);
  } else {
    const s05 = await execute(
      'TC01-S05',
      'A fresh client rediscovers the exact Lease without a second acquisition.',
      async () => {
        const freshClient = input.createFreshClient({ fixture: input.fixture, provenance: input.provenance });
        assertTc01(isPlainObject(freshClient), 'TC01_EVIDENCE_INVALID', 'S05 fresh Treehouse client factory returned an invalid client.');
        requireFunction(freshClient.observeStatus, 'Fresh client observeStatus');
        requireFunction(freshClient.findStatusByPath, 'Fresh client findStatusByPath');
        const status = await freshClient.observeStatus({ fixture: input.fixture, provenance: input.provenance });
        const item = freshClient.findStatusByPath(status, context.lease.path);
        assertLeaseIdentity(item, context.lease, 'S05 fresh-process recovery');
        return { observations: { recoveredLease: item, acquisitionReused: false } };
      },
    );
    if (s05.result !== 'PASS') blockedBy = 'TC01-S05';
  }

  if (blockedBy) {
    await block('TC01-S06', 'Fresh JSON status matches path, Lease ID and holder exactly.', blockedBy);
  } else {
    const s06 = await execute(
      'TC01-S06',
      'Fresh JSON status matches path, Lease ID and holder exactly.',
      async () => {
        const { item } = await observeLease(context.lease, 'S06 status identity');
        return { observations: { status: item } };
      },
    );
    if (s06.result !== 'PASS') blockedBy = 'TC01-S06';
  }

  if (blockedBy) {
    await block('TC01-S07', 'Correct conditional release is proven by fresh status and source preservation.', blockedBy);
  } else {
    const s07 = await execute(
      'TC01-S07',
      'Correct conditional release is proven by fresh status and source preservation.',
      async () => {
        const releasedLease = { ...context.lease };
        const release = await releaseExactLease(releasedLease, 'S07 release');
        context.semanticRelease = { lease: releasedLease, classification: 'RELEASED' };
        return {
          observations: {
            releasedLeaseId: releasedLease.leaseId,
            releasedHolder: releasedLease.leaseHolder,
            releaseExitCode: release.process.exitCode,
            sourceComparison: release.sourceComparison,
            freshStatus: release.afterItem,
          },
        };
      },
    );
    if (s07.result !== 'PASS') blockedBy = 'TC01-S07';
  }

  if (blockedBy) {
    await block('TC01-S08', 'A stale external Lease ID cannot release or mutate the current Lease.', blockedBy);
  } else {
    const s08 = await execute(
      'TC01-S08',
      'A stale external Lease ID cannot release or mutate the current Lease.',
      async () => {
        const { lease } = await acquireCurrentLease('S08');
        const staleLeaseId = `stale-${lease.leaseId}`;
        const before = await input.observers.snapshotRepository({ path: lease.path, label: 'S08-worktree-before-stale-return' });
        const process = assertProcessResult(await input.client.returnLease({
          fixture: input.fixture,
          provenance: input.provenance,
          path: lease.path,
          leaseId: staleLeaseId,
          holder: lease.leaseHolder,
        }), 'S08 stale-ID return');
        assertTc01(process.exitCode !== 0, 'TC01_EVIDENCE_INVALID', 'S08 stale Lease ID must produce a non-zero process exit.', {
          exitCode: process.exitCode,
          staleLeaseId,
        });
        const { item } = await observeLease(lease, 'S08 postcondition');
        const after = await input.observers.snapshotRepository({ path: lease.path, label: 'S08-worktree-after-stale-return' });
        const worktreeComparison = input.observers.compareRepositorySnapshots(before, after);
        assertTc01(worktreeComparison?.equal === true, 'TC01_EVIDENCE_INVALID', 'S08 stale Lease ID changed worktree content.', { worktreeComparison });
        const cleanup = await releaseExactLease(lease, 'S08 trusted cleanup');
        return {
          observations: {
            staleLeaseId,
            currentLeaseId: lease.leaseId,
            processExitCode: process.exitCode,
            leaseAfter: item,
            worktreeComparison,
            cleanupExitCode: cleanup.process.exitCode,
          },
        };
      },
    );
    if (s08.result !== 'PASS') blockedBy = 'TC01-S08';
  }

  if (blockedBy) {
    await block('TC01-S09', 'A stale holder cannot release or mutate the current Lease.', blockedBy);
  } else {
    const s09 = await execute(
      'TC01-S09',
      'A stale holder cannot release or mutate the current Lease.',
      async () => {
        const { lease } = await acquireCurrentLease('S09');
        const staleHolder = `${lease.leaseHolder}-stale`;
        const before = await input.observers.snapshotRepository({ path: lease.path, label: 'S09-worktree-before-stale-holder-return' });
        const process = assertProcessResult(await input.client.returnLease({
          fixture: input.fixture,
          provenance: input.provenance,
          path: lease.path,
          leaseId: lease.leaseId,
          holder: staleHolder,
        }), 'S09 stale-holder return');
        assertTc01(process.exitCode !== 0, 'TC01_EVIDENCE_INVALID', 'S09 stale holder must produce a non-zero process exit.', {
          exitCode: process.exitCode,
          staleHolder,
        });
        const { item } = await observeLease(lease, 'S09 postcondition');
        const after = await input.observers.snapshotRepository({ path: lease.path, label: 'S09-worktree-after-stale-holder-return' });
        const worktreeComparison = input.observers.compareRepositorySnapshots(before, after);
        assertTc01(worktreeComparison?.equal === true, 'TC01_EVIDENCE_INVALID', 'S09 stale holder changed worktree content.', { worktreeComparison });
        const cleanup = await releaseExactLease(lease, 'S09 trusted cleanup');
        return {
          observations: {
            staleHolder,
            currentLeaseId: lease.leaseId,
            processExitCode: process.exitCode,
            leaseAfter: item,
            worktreeComparison,
            cleanupExitCode: cleanup.process.exitCode,
          },
        };
      },
    );
    if (s09.result !== 'PASS') blockedBy = 'TC01-S09';
  }

  if (blockedBy) {
    await block('TC01-S10', 'A dirty worktree and exact Lease remain intact after an accidental non-force return.', blockedBy);
  } else {
    const s10 = await execute(
      'TC01-S10',
      'A dirty worktree and exact Lease remain intact after an accidental non-force return.',
      async () => {
        const { lease } = await acquireCurrentLease('S10');
        const sentinelPath = join(lease.path, 'controlled-uncommitted.txt');
        const sourceBefore = await input.observers.snapshotRepository({ path: input.fixture.sourceRepo, label: 'S10-source-before' });
        const gitBefore = await input.observers.readGitInvocations(input.fixture.gitLog);
        await input.observers.writeControlledFile({ path: sentinelPath, bytes: DIRTY_SENTINEL_BYTES });
        const written = await input.observers.readControlledFile({ path: sentinelPath });
        assertTc01(Buffer.isBuffer(written) && written.equals(DIRTY_SENTINEL_BYTES), 'TC01_EVIDENCE_INVALID', 'S10 dirty sentinel was not written byte-identically.');
        const dirtySnapshot = await input.observers.snapshotRepository({ path: lease.path, label: 'S10-dirty-worktree-before-return' });
        const gitReportedDirty = !snapshotIsClean(dirtySnapshot);
        assertTc01(
          gitReportedDirty || written.equals(DIRTY_SENTINEL_BYTES),
          'TC01_EVIDENCE_INVALID',
          'S10 controlled sentinel did not establish a dirty worktree observation.',
          { dirtySnapshot, gitReportedDirty },
        );
        const process = assertProcessResult(await input.client.returnLease({
          fixture: input.fixture,
          provenance: input.provenance,
          path: lease.path,
          leaseId: lease.leaseId,
          holder: lease.leaseHolder,
        }), 'S10 dirty return');
        const { item } = await observeLease(lease, 'S10 postcondition');
        let sentinelAfter;
        try {
          sentinelAfter = await input.observers.readControlledFile({ path: sentinelPath });
        } catch (error) {
          assertTc01(false, 'TC01_EVIDENCE_INVALID', 'S10 dirty sentinel was removed by the non-force return.', {
            cause: error instanceof Error ? error.message : String(error),
          });
        }
        const sentinelPreserved = Buffer.isBuffer(sentinelAfter) && sentinelAfter.equals(DIRTY_SENTINEL_BYTES);
        assertTc01(sentinelPreserved, 'TC01_EVIDENCE_INVALID', 'S10 dirty sentinel bytes changed during non-force return.');
        const sourceAfter = await input.observers.snapshotRepository({ path: input.fixture.sourceRepo, label: 'S10-source-after' });
        const sourceComparison = input.observers.compareRepositorySnapshots(sourceBefore, sourceAfter);
        assertTc01(sourceComparison?.equal === true, 'TC01_EVIDENCE_INVALID', 'S10 dirty return changed the source checkout.', { sourceComparison });
        const gitAfter = await input.observers.readGitInvocations(input.fixture.gitLog);
        const newInvocations = gitAfter.slice(gitBefore.length);
        const destructiveInvocation = newGitInvocationsContainDestructiveAction(newInvocations);
        assertTc01(!destructiveInvocation, 'TC01_EVIDENCE_INVALID', 'S10 dirty return invoked a destructive Git operation.', { newInvocations });

        await input.observers.removeControlledFile({ path: sentinelPath });
        const cleanup = await releaseExactLease(lease, 'S10 trusted cleanup');
        return {
          observations: {
            sentinelPath,
            sentinelPreserved,
            gitReportedDirty,
            leaseAfter: item,
            releaseExitCode: process.exitCode,
            destructiveInvocation,
            sourceComparison,
            cleanupExitCode: cleanup.process.exitCode,
          },
          rationale: 'The dirty sentinel and exact Lease remained intact; trusted cleanup then removed the sentinel and released the Lease.',
        };
      },
    );
    if (s10.result !== 'PASS') blockedBy = 'TC01-S10';
  }

  if (blockedBy) {
    await block('TC01-S11', 'A repeated semantic release is classified from fresh status without a second return command.', blockedBy);
  } else {
    const s11 = await execute(
      'TC01-S11',
      'A repeated semantic release is classified from fresh status without a second return command.',
      async () => {
        assertTc01(context.semanticRelease?.classification === 'RELEASED', 'TC01_EVIDENCE_INVALID', 'S11 has no prior successful semantic release.');
        const released = context.semanticRelease.lease;
        const status = await input.client.observeStatus({ fixture: input.fixture, provenance: input.provenance });
        const pathItem = input.client.findStatusByPath(status, released.path);
        assertReleasedOrAvailable(pathItem, released, 'S11 repeated-release status');
        const matchingIdentity = status.some((item) => item.leaseId === released.leaseId || item.leaseHolder === released.leaseHolder && item.status === 'leased');
        assertTc01(!matchingIdentity, 'TC01_EVIDENCE_INVALID', 'S11 found the previously released Lease identity in fresh status.', {
          released,
          status,
        });
        return {
          observations: {
            classification: 'ALREADY_RELEASED',
            previousSemanticResult: context.semanticRelease.classification,
            releasedLeaseId: released.leaseId,
            rawReturnInvoked: false,
            freshStatus: pathItem,
          },
          rationale: 'Fresh status proves the prior Lease is absent and no newer Lease occupies the path; no second return command was required.',
        };
      },
    );
    if (s11.result !== 'PASS') blockedBy = 'TC01-S11';
  }

  if (blockedBy) {
    await block('TC01-S12', 'Missing and unmanaged paths are explicit divergences and cannot alter managed Leases.', blockedBy);
  } else {
    const s12 = await execute(
      'TC01-S12',
      'Missing and unmanaged paths are explicit divergences and cannot alter managed Leases.',
      async () => {
        const missingPath = join(input.fixture.runRoot, 'missing-worktree');
        const unmanagedPath = join(input.fixture.runRoot, 'unmanaged-repo');
        const statusBefore = await input.client.observeStatus({ fixture: input.fixture, provenance: input.provenance });
        const missingState = await input.observers.inspectReleaseTarget({ path: missingPath, fixture: input.fixture });
        const unmanagedState = await input.observers.inspectReleaseTarget({ path: unmanagedPath, fixture: input.fixture });
        assertTc01(missingState === 'missing', 'TC01_EVIDENCE_INVALID', 'S12 missing path was not independently classified as missing.', { missingState });
        assertTc01(unmanagedState === 'unmanaged', 'TC01_EVIDENCE_INVALID', 'S12 unmanaged path was not independently classified as unmanaged.', { unmanagedState });
        const missingProcess = assertProcessResult(await input.client.returnLease({
          fixture: input.fixture,
          provenance: input.provenance,
          path: missingPath,
          leaseId: 'missing-lease',
          holder: input.fixture.holder,
        }), 'S12 missing-path return');
        const unmanagedProcess = assertProcessResult(await input.client.returnLease({
          fixture: input.fixture,
          provenance: input.provenance,
          path: unmanagedPath,
          leaseId: 'unmanaged-lease',
          holder: input.fixture.holder,
        }), 'S12 unmanaged-path return');
        const statusAfter = await input.client.observeStatus({ fixture: input.fixture, provenance: input.provenance });
        assertTc01(sameJson(statusBefore, statusAfter), 'TC01_EVIDENCE_INVALID', 'S12 missing or unmanaged path changed managed Lease state.', {
          statusBefore,
          statusAfter,
        });
        return {
          observations: {
            missingPath,
            unmanagedPath,
            classifications: {
              missing: 'DIVERGED_MISSING_PATH',
              unmanaged: 'TREEHOUSE_UNMANAGED_PATH',
            },
            processExitCodes: {
              missing: missingProcess.exitCode,
              unmanaged: unmanagedProcess.exitCode,
            },
            managedStatusUnchanged: true,
          },
          rationale: 'Trusted path observations classify missing and unmanaged targets explicitly; process output is advisory and managed Lease state is unchanged.',
        };
      },
    );
    if (s12.result !== 'PASS') blockedBy = 'TC01-S12';
  }

  if (blockedBy) {
    await block('TC01-S13', 'Private-state normalization is safe only when Lease and repository state remain unchanged.', blockedBy);
  } else {
    const s13 = await execute(
      'TC01-S13',
      'Private-state normalization is safe only when Lease and repository state remain unchanged.',
      async () => {
        const { lease, worktreeBefore } = await acquireCurrentLease('S13');
        const { item } = await observeLease(lease, 'S13 status identity');
        let identityUnchanged = true;
        try {
          assertLeaseIdentity(item, lease, 'S13 status identity');
        } catch {
          identityUnchanged = false;
        }
        const privateAfter = await input.observers.snapshotPrivateState({
          fixture: input.fixture,
          label: 'private-after-status',
        });
        const sourceCurrent = await input.observers.snapshotRepository({
          path: input.fixture.sourceRepo,
          label: 'source-after-private-observation',
        });
        const worktreeCurrent = await input.observers.snapshotRepository({
          path: lease.path,
          label: 'worktree-after-private-observation',
        });
        const sourceComparison = input.observers.compareRepositorySnapshots(context.sourceAfter ?? context.sourceBefore, sourceCurrent);
        const worktreeComparison = input.observers.compareRepositorySnapshots(worktreeBefore, worktreeCurrent);
        const privateStateChanged = !sameJson(context.privateBefore, privateAfter);
        const sourceUnchanged = sourceComparison?.equal === true;
        const worktreeUnchanged = worktreeComparison?.equal === true;
        const safe = identityUnchanged && sourceUnchanged && worktreeUnchanged;
        const observations = {
          privateBefore: context.privateBefore,
          privateAfter,
          privateStateChanged,
          identityUnchanged,
          sourceUnchanged,
          worktreeUnchanged,
          sourceComparison,
          worktreeComparison,
        };
        if (!safe) {
          return {
            result: 'FAIL',
            observations,
            rationale: privateStateChanged
              ? 'Treehouse private state changed together with Lease identity or repository content.'
              : 'Lease identity or repository content changed during private-state observation.',
          };
        }
        const cleanup = await releaseExactLease(lease, 'S13 trusted cleanup');
        observations.cleanupExitCode = cleanup.process.exitCode;
        if (privateStateChanged) observations.limitation = 'TREEHOUSE_PRIVATE_STATE_NORMALIZATION';
        return {
          result: 'PASS',
          observations,
          rationale: privateStateChanged
            ? 'Treehouse private state changed, but Lease identity and source/worktree content remained unchanged.'
            : 'Treehouse private state remained unchanged and the Lease plus repository state stayed intact.',
        };
      },
    );
    if (s13.result !== 'PASS') blockedBy = 'TC01-S13';
  }

  await execute(
    'TC01-S14',
    'Every recorded command proves the bounded shell-free closed-stdin process contract.',
    async () => {
      const commands = await input.commandEvidence.list();
      assertTc01(Array.isArray(commands) && commands.length > 0, 'TC01_EVIDENCE_INVALID', 'S14 requires at least one command Evidence record.');
      const allowedSets = input.expectedEnvironmentKeySets.map(normalizeKeySet);
      const invalidCommands = commands
        .filter((metadata) => commandContractViolation(metadata, allowedSets))
        .map((metadata, index) => typeof metadata?.commandId === 'string' ? metadata.commandId : `command-${index}`);
      return {
        result: invalidCommands.length === 0 ? 'PASS' : 'FAIL',
        observations: { commandCount: commands.length, invalidCommands },
        rationale: invalidCommands.length === 0
          ? 'Every command Evidence record satisfies the TC-01 process contract.'
          : 'One or more command Evidence records violate the TC-01 process contract.',
      };
    },
  );

  await execute(
    'TC01-S15',
    'Prior acceptance is reusable only when tooling, host and command-shape identity remain exact.',
    async () => {
      const current = currentFreshnessIdentity(input);
      const changedFields = IDENTITY_FIELDS
        .filter((field) => input.acceptedIdentity[field] !== current[field])
        .sort(compareCodeUnits);
      const stale = changedFields.length > 0;
      return {
        result: stale ? 'BLOCKED' : 'PASS',
        observations: {
          stale,
          changedFields,
          acceptedIdentity: input.acceptedIdentity,
          currentIdentity: current,
        },
        rationale: stale
          ? 'Prior TC-01 acceptance cannot be reused because its bound identity changed.'
          : 'Prior TC-01 acceptance identity exactly matches the current tooling, host and command shapes.',
      };
    },
  );

  assertTc01(records.length === TC01_SCENARIO_IDS.length, 'TC01_EVIDENCE_INVALID', 'TC-01 scenario runner did not emit exactly fifteen records.', {
    actual: records.map((record) => record.scenarioId),
    expected: TC01_SCENARIO_IDS,
  });
  assertTc01(records.every((record, index) => record.scenarioId === TC01_SCENARIO_IDS[index]), 'TC01_EVIDENCE_INVALID', 'TC-01 scenario records are not in canonical order.');
  return records;
}
