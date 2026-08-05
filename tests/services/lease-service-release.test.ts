import assert from 'node:assert/strict';
import { access, mkdir, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';

import { MnfsError, type MnfsErrorCode } from '../../src/domain/errors.js';
import type {
  Attempt,
  GitObjectFormat,
  Lease,
  ProcessIdentity,
  WriteTrack,
} from '../../src/execution/model.js';
import { SqliteStore } from '../../src/store/sqlite-store.js';

const LEASE_SERVICE_SPECIFIER = '../../src/services/' + 'lease-service.js';
const CONTRACT_HASH = `sha256:${'a'.repeat(64)}`;
const GRANT_INPUT_HASH = `sha256:${'b'.repeat(64)}`;
const SOURCE_FINGERPRINT = `sha256:${'c'.repeat(64)}`;
const TREEHOUSE_HASH = `sha256:${'d'.repeat(64)}`;
const COMMAND_SHAPE_HASH =
  'sha256:f2077cfd037cbaefdcfc94385a0cfeb7e1647ef294ca8ceee3cd61a1b109dc84';
const BASE_COMMIT = '1'.repeat(40);
const BASE_TREE = '2'.repeat(40);
const REPOSITORY_ID = 'repo-task11-release';
const HOLDER = 'mnfs-repo-task11-lse001-g1';
const EXTERNAL_LEASE_ID = 'treehouse-lease-release-001';
const WORKTREE_PATH = '/home/mnfs/runtime/treehouse/pool/tree-release-001';
const LEASED_AT = '2026-08-05T12:40:00.000Z';
const OCCURRED_AT = '2026-08-05T12:40:01.000Z';
const RELEASE_KEY = 'lease:release:LSE-001:g1';

const OWNER_ONE: ProcessIdentity = {
  bootId: 'boot-task11-release-owner-one',
  pid: 8101,
  startTicks: '121001',
};
const OWNER_TWO: ProcessIdentity = {
  bootId: 'boot-task11-release-owner-two',
  pid: 8102,
  startTicks: '121002',
};
const RUNNER: ProcessIdentity = {
  bootId: 'boot-task11-release-runner',
  pid: 8201,
  startTicks: '122001',
};

interface CandidateIdentity {
  readonly executableSha256: string;
  readonly semanticVersion: '2.1.1';
  readonly commandShapeSha256: string;
}

interface PhysicalSourceObservation {
  readonly status: 'READY' | 'CHANGED' | 'UNKNOWN';
  readonly path: string;
  readonly fingerprint: string;
  readonly baseCommitSha: string;
  readonly baseTreeSha: string;
  readonly objectFormat: GitObjectFormat;
}

interface PhysicalLeaseCandidate {
  readonly path: string;
  readonly managed: boolean;
  readonly sourcePath: string;
  readonly status: 'available' | 'leased' | 'missing';
  readonly gitStatus: 'CLEAN' | 'DIRTY' | 'UNKNOWN';
  readonly leaseId?: string;
  readonly holder?: string;
  readonly leasedAt?: string;
}

interface LeasePhysicalObservation {
  readonly source: PhysicalSourceObservation;
  readonly candidates: readonly PhysicalLeaseCandidate[];
}

interface LeasePhysicalAuthority {
  observe(input: Readonly<{
    writeTrack: WriteTrack;
    attempt: Attempt;
    lease?: Lease;
    kind: 'GRANT' | 'RELEASE';
  }>): Promise<LeasePhysicalObservation>;
}

interface LeaseActionObservation {
  readonly state: 'ABSENT' | 'STARTED' | 'FINISHED' | 'CONFLICT';
  readonly runner?: ProcessIdentity;
  readonly startedRef?: string;
  readonly resultRef?: string;
}

interface LeaseActionLaunchInput {
  readonly kind: 'GRANT' | 'RELEASE';
  readonly leaseId: string;
  readonly actionToken: string;
  readonly holder: string;
  readonly sourcePath: string;
  readonly externalLeaseId?: string;
  readonly worktreePath?: string;
}

interface LeaseActionAuthority {
  observe(actionToken: string): Promise<LeaseActionObservation>;
  launch(input: LeaseActionLaunchInput): Promise<void>;
}

interface ProcessAuthority {
  isAlive(identity: ProcessIdentity): Promise<boolean>;
}

interface LeaseServiceContract {
  grant(input: Readonly<{
    writeTrackId: string;
    idempotencyKey: string;
    occurredAt: string;
  }>): Promise<Lease>;
  release(input: LeaseReleaseInput): Promise<Lease>;
}

interface LeaseReleaseInput {
  readonly leaseId: string;
  readonly expectedLeaseVersion: number;
  readonly idempotencyKey: string;
  readonly occurredAt: string;
}

interface LeaseServiceModule {
  readonly LeaseService: new (input: Readonly<{
    store: SqliteStore;
    repositoryId: string;
    actionRoot: string;
    candidate: CandidateIdentity;
    ownerIdentity: ProcessIdentity;
    physical: LeasePhysicalAuthority;
    actions: LeaseActionAuthority;
    processes: ProcessAuthority;
    now: () => string;
  }>) => LeaseServiceContract;
}

interface Harness {
  readonly root: string;
  readonly databasePath: string;
  readonly actionRoot: string;
  readonly sourcePath: string;
  readonly store: SqliteStore;
  readonly track: WriteTrack;
  readonly attempt: Attempt;
  readonly lease: Lease;
  readonly physical: ScriptedPhysicalAuthority;
  readonly actions: ScriptedActionAuthority;
  readonly processes: ScriptedProcessAuthority;
}

function describeError(error: unknown): string {
  return error instanceof Error ? `${error.name}: ${error.message}` : String(error);
}

async function loadLeaseService(): Promise<LeaseServiceModule> {
  try {
    return await import(LEASE_SERVICE_SPECIFIER) as LeaseServiceModule;
  } catch (error) {
    assert.fail(`M01 LeaseService is not implemented: ${describeError(error)}`);
  }
}

async function expectCode(
  code: MnfsErrorCode,
  operation: () => Promise<unknown>,
): Promise<void> {
  await assert.rejects(
    operation,
    (error: unknown) => error instanceof MnfsError && error.code === code,
  );
}

function identityKey(identity: ProcessIdentity): string {
  return `${identity.bootId}:${identity.pid}:${identity.startTicks}`;
}

function cloneObservation(observation: LeasePhysicalObservation): LeasePhysicalObservation {
  return {
    source: { ...observation.source },
    candidates: observation.candidates.map((candidate) => ({ ...candidate })),
  };
}

class ScriptedPhysicalAuthority implements LeasePhysicalAuthority {
  current: LeasePhysicalObservation;
  readonly calls: Array<Readonly<{ kind: 'GRANT' | 'RELEASE'; leaseId?: string }>> = [];

  constructor(source: PhysicalSourceObservation) {
    this.current = { source, candidates: [] };
  }

  async observe(input: Readonly<{
    writeTrack: WriteTrack;
    attempt: Attempt;
    lease?: Lease;
    kind: 'GRANT' | 'RELEASE';
  }>): Promise<LeasePhysicalObservation> {
    this.calls.push({
      kind: input.kind,
      ...(input.lease === undefined ? {} : { leaseId: input.lease.id }),
    });
    return cloneObservation(this.current);
  }

  setExactLease(gitStatus: PhysicalLeaseCandidate['gitStatus'] = 'CLEAN'): void {
    this.current = {
      source: { ...this.current.source },
      candidates: [{
        path: WORKTREE_PATH,
        managed: true,
        sourcePath: this.current.source.path,
        status: 'leased',
        gitStatus,
        leaseId: EXTERNAL_LEASE_ID,
        holder: HOLDER,
        leasedAt: LEASED_AT,
      }],
    };
  }

  setAvailable(): void {
    this.current = {
      source: { ...this.current.source },
      candidates: [{
        path: WORKTREE_PATH,
        managed: true,
        sourcePath: this.current.source.path,
        status: 'available',
        gitStatus: 'CLEAN',
      }],
    };
  }

  setMissingOrUnmanaged(): void {
    this.current = {
      source: { ...this.current.source },
      candidates: [{
        path: WORKTREE_PATH,
        managed: false,
        sourcePath: this.current.source.path,
        status: 'missing',
        gitStatus: 'UNKNOWN',
      }],
    };
  }

  setDuplicateExternalIdentity(): void {
    this.current = {
      source: { ...this.current.source },
      candidates: [
        {
          path: WORKTREE_PATH,
          managed: true,
          sourcePath: this.current.source.path,
          status: 'leased',
          gitStatus: 'CLEAN',
          leaseId: EXTERNAL_LEASE_ID,
          holder: HOLDER,
          leasedAt: LEASED_AT,
        },
        {
          path: `${WORKTREE_PATH}-duplicate`,
          managed: true,
          sourcePath: this.current.source.path,
          status: 'leased',
          gitStatus: 'CLEAN',
          leaseId: EXTERNAL_LEASE_ID,
          holder: HOLDER,
          leasedAt: LEASED_AT,
        },
      ],
    };
  }
}

class ScriptedProcessAuthority implements ProcessAuthority {
  readonly #live = new Set<string>();

  setAlive(identity: ProcessIdentity, alive: boolean): void {
    const key = identityKey(identity);
    if (alive) this.#live.add(key);
    else this.#live.delete(key);
  }

  async isAlive(identity: ProcessIdentity): Promise<boolean> {
    return this.#live.has(identityKey(identity));
  }
}

type LaunchMode = 'SUCCESS' | 'FAIL_BEFORE_START' | 'STARTED_THEN_THROW';

class ScriptedActionAuthority implements LeaseActionAuthority {
  readonly launches: LeaseActionLaunchInput[] = [];
  readonly observations = new Map<string, LeaseActionObservation>();
  mode: LaunchMode = 'SUCCESS';

  constructor(readonly physical: ScriptedPhysicalAuthority) {}

  async observe(actionToken: string): Promise<LeaseActionObservation> {
    return this.observations.get(actionToken) ?? { state: 'ABSENT' };
  }

  async launch(input: LeaseActionLaunchInput): Promise<void> {
    this.launches.push({ ...input });
    if (this.mode === 'FAIL_BEFORE_START') {
      throw new MnfsError('TREEHOUSE_COMMAND_FAILED', 'Injected failure before release STARTED.');
    }
    if (this.mode === 'STARTED_THEN_THROW') {
      this.observations.set(input.actionToken, {
        state: 'STARTED',
        runner: RUNNER,
        startedRef: `/home/mnfs/actions/${input.actionToken}/started.json`,
      });
      throw new MnfsError('LEASE_ACTION_INCONCLUSIVE', 'Injected release STARTED crash.');
    }
    this.observations.set(input.actionToken, {
      state: 'FINISHED',
      runner: RUNNER,
      startedRef: `/home/mnfs/actions/${input.actionToken}/started.json`,
      resultRef: `/home/mnfs/actions/${input.actionToken}/finished.json`,
    });
    if (input.kind === 'RELEASE') this.physical.setAvailable();
  }
}

function candidate(overrides: Partial<CandidateIdentity> = {}): CandidateIdentity {
  return {
    executableSha256: TREEHOUSE_HASH,
    semanticVersion: '2.1.1',
    commandShapeSha256: COMMAND_SHAPE_HASH,
    ...overrides,
  };
}

function releaseInput(lease: Lease, overrides: Partial<LeaseReleaseInput> = {}): LeaseReleaseInput {
  return {
    leaseId: lease.id,
    expectedLeaseVersion: lease.version,
    idempotencyKey: RELEASE_KEY,
    occurredAt: OCCURRED_AT,
    ...overrides,
  };
}

function serviceFor(
  module: LeaseServiceModule,
  harness: Harness,
  options: Readonly<{
    owner?: ProcessIdentity;
    candidate?: CandidateIdentity;
  }> = {},
): LeaseServiceContract {
  return new module.LeaseService({
    store: harness.store,
    repositoryId: REPOSITORY_ID,
    actionRoot: harness.actionRoot,
    candidate: options.candidate ?? candidate(),
    ownerIdentity: options.owner ?? OWNER_ONE,
    physical: harness.physical,
    actions: harness.actions,
    processes: harness.processes,
    now: () => OCCURRED_AT,
  });
}

async function withHarness(
  label: string,
  operation: (harness: Harness) => Promise<void>,
): Promise<void> {
  const root = await mkdtemp(path.join(tmpdir(), `mnfs-task11-release-${label}-`));
  const databasePath = path.join(root, 'mnfs.db');
  const actionRoot = path.join(root, 'actions');
  const sourcePath = path.join(root, 'execution-sources', 'WT-001', 'A01', 'source');
  await mkdir(actionRoot, { recursive: true });
  await mkdir(sourcePath, { recursive: true });
  const store = SqliteStore.open(databasePath);
  try {
    const track = store.execution.allocateWriteTrack({
      missionId: 'MIS-002',
      milestoneQualifiedId: 'MIS-002/M01',
      featureQualifiedId: 'MIS-002/M01/F01',
      contractHash: CONTRACT_HASH,
      occurredAt: OCCURRED_AT,
    });
    const openedAttempt = store.execution.allocateAttempt({
      writeTrackId: track.id,
      contractHash: CONTRACT_HASH,
      gitObjectFormat: 'sha1',
      baseCommitSha: BASE_COMMIT,
      occurredAt: OCCURRED_AT,
    });
    const attempt = store.execution.setAttemptState({
      id: openedAttempt.id,
      expectedVersion: openedAttempt.version,
      status: 'OPEN',
      sourceStatus: 'READY',
      sourcePath,
      sourceFingerprint: SOURCE_FINGERPRINT,
      updatedAt: OCCURRED_AT,
    });
    const requested = store.execution.allocateLease({
      writeTrackId: track.id,
      attemptId: attempt.id,
      contractHash: CONTRACT_HASH,
      grantIdempotencyKey: 'lease:grant:fixture',
      grantInputHash: GRANT_INPUT_HASH,
      holder: HOLDER,
      occurredAt: OCCURRED_AT,
    });
    const lease = store.execution.setLeaseState({
      id: requested.id,
      expectedVersion: requested.version,
      status: 'ACTIVE',
      externalLeaseId: EXTERNAL_LEASE_ID,
      worktreePath: WORKTREE_PATH,
      externalLeasedAt: LEASED_AT,
      updatedAt: OCCURRED_AT,
    });
    const physical = new ScriptedPhysicalAuthority({
      status: 'READY',
      path: sourcePath,
      fingerprint: SOURCE_FINGERPRINT,
      baseCommitSha: BASE_COMMIT,
      baseTreeSha: BASE_TREE,
      objectFormat: 'sha1',
    });
    physical.setExactLease();
    const processes = new ScriptedProcessAuthority();
    processes.setAlive(OWNER_ONE, true);
    processes.setAlive(OWNER_TWO, true);
    const actions = new ScriptedActionAuthority(physical);
    await operation({
      root,
      databasePath,
      actionRoot,
      sourcePath,
      store,
      track,
      attempt,
      lease,
      physical,
      actions,
      processes,
    });
  } finally {
    store.close();
    await rm(root, { recursive: true, force: true });
  }
}

function openDatabase(databasePath: string, readOnly = false): DatabaseSync {
  return new DatabaseSync(databasePath, { readOnly });
}

function installEventFailure(databasePath: string, eventType: string, triggerName: string): void {
  const database = openDatabase(databasePath);
  try {
    database.exec(`
      CREATE TRIGGER "${triggerName}"
      BEFORE INSERT ON events
      WHEN NEW.type = '${eventType}'
      BEGIN
        SELECT RAISE(ABORT, 'injected Task 11 ${eventType} failure');
      END;
    `);
  } finally {
    database.close();
  }
}

function dropTrigger(databasePath: string, triggerName: string): void {
  const database = openDatabase(databasePath);
  try {
    database.exec(`DROP TRIGGER IF EXISTS "${triggerName}"`);
  } finally {
    database.close();
  }
}

function eventCount(databasePath: string, type: string): number {
  const database = openDatabase(databasePath, true);
  try {
    const row = database.prepare('SELECT COUNT(*) AS count FROM events WHERE type = ?')
      .get(type) as { readonly count: number };
    return Number(row.count);
  } finally {
    database.close();
  }
}

function latestLease(store: SqliteStore, track: WriteTrack): Lease {
  const value = store.execution.getCurrentLease(track.id);
  assert.notEqual(value, undefined, 'current Lease disappeared');
  return value as Lease;
}

function installCurrentRun(harness: Harness): void {
  harness.store.execution.allocateWorkerRun({
    attemptId: harness.attempt.id,
    contractHash: CONTRACT_HASH,
    occurredAt: OCCURRED_AT,
  });
}

function installCurrentClaim(harness: Harness): void {
  const run = harness.store.execution.allocateWorkerRun({
    attemptId: harness.attempt.id,
    contractHash: CONTRACT_HASH,
    occurredAt: OCCURRED_AT,
  });
  harness.store.execution.allocateClaim({
    writeTrackId: harness.track.id,
    attemptId: harness.attempt.id,
    workerRunId: run.id,
    leaseId: harness.lease.id,
    contractHash: CONTRACT_HASH,
    idempotencyKey: 'claim:task11-release',
    inputHash: `sha256:${'e'.repeat(64)}`,
    baseCommitSha: BASE_COMMIT,
    resultTreeSha: '3'.repeat(40),
    claimedCriterionIds: ['AC-001'],
    occurredAt: OCCURRED_AT,
  });
  harness.store.execution.setWorkerRunState({
    id: run.id,
    expectedVersion: run.version,
    status: 'CANCELLED',
    updatedAt: OCCURRED_AT,
  });
}

test('rejects stale internal, external, holder, path and source fences before helper invocation', async () => {
  const module = await loadLeaseService();
  await withHarness('fences', async (harness) => {
    const service = serviceFor(module, harness);
    const exact = harness.physical.current.candidates[0] as PhysicalLeaseCandidate;
    const invalidCandidates: PhysicalLeaseCandidate[] = [
      { ...exact, leaseId: 'different-external-id' },
      { ...exact, holder: 'different-holder' },
      { ...exact, path: `${WORKTREE_PATH}-different` },
      { ...exact, sourcePath: `${harness.sourcePath}-different` },
    ];
    for (const [index, invalid] of invalidCandidates.entries()) {
      harness.physical.current = {
        source: { ...harness.physical.current.source },
        candidates: [invalid],
      };
      await expectCode('LEASE_FENCE_CONFLICT', async () => await service.release(releaseInput(
        harness.lease,
        { idempotencyKey: `${RELEASE_KEY}-${index}` },
      )));
    }
    harness.physical.current = {
      source: {
        ...harness.physical.current.source,
        fingerprint: `sha256:${'f'.repeat(64)}`,
      },
      candidates: [exact],
    };
    await expectCode('LEASE_FENCE_CONFLICT', async () => await service.release(releaseInput(
      harness.lease,
      { idempotencyKey: `${RELEASE_KEY}-source` },
    )));
    assert.equal(harness.actions.launches.length, 0);
    assert.equal(latestLease(harness.store, harness.track).status, 'ACTIVE');
  });
});

test('blocks dirty or unknown work without persisting release intent', async () => {
  const module = await loadLeaseService();
  await withHarness('dirty', async (harness) => {
    const service = serviceFor(module, harness);
    harness.physical.setExactLease('DIRTY');
    await expectCode('LEASE_RELEASE_BLOCKED_DIRTY', async () => await service.release(
      releaseInput(harness.lease),
    ));
    harness.physical.setExactLease('UNKNOWN');
    await expectCode('LEASE_RELEASE_BLOCKED_UNKNOWN', async () => await service.release(
      releaseInput(harness.lease, { idempotencyKey: `${RELEASE_KEY}-unknown` }),
    ));
    const unchanged = latestLease(harness.store, harness.track);
    assert.equal(unchanged.status, 'ACTIVE');
    assert.equal(unchanged.releaseIdempotencyKey, undefined);
    assert.equal(harness.actions.launches.length, 0);
  });
});

test('blocks release while a current Worker Run or current Claim exists', async () => {
  const module = await loadLeaseService();
  await withHarness('run-block', async (harness) => {
    installCurrentRun(harness);
    const service = serviceFor(module, harness);
    await expectCode('LEASE_RELEASE_BLOCKED_UNKNOWN', async () => await service.release(
      releaseInput(harness.lease),
    ));
    assert.equal(harness.actions.launches.length, 0);
  });
  await withHarness('claim-block', async (harness) => {
    installCurrentClaim(harness);
    const service = serviceFor(module, harness);
    await expectCode('LEASE_RELEASE_BLOCKED_UNKNOWN', async () => await service.release(
      releaseInput(harness.lease),
    ));
    assert.equal(harness.actions.launches.length, 0);
  });
});

test('performs one clean conditional return and commits RELEASED with one Event chain', async () => {
  const module = await loadLeaseService();
  await withHarness('clean-release', async (harness) => {
    const service = serviceFor(module, harness);
    const released = await service.release(releaseInput(harness.lease));
    assert.equal(released.status, 'RELEASED');
    assert.equal(released.externalLeaseId, EXTERNAL_LEASE_ID);
    assert.equal(released.worktreePath, WORKTREE_PATH);
    assert.equal(harness.actions.launches.length, 1);
    assert.equal(harness.actions.launches[0]?.kind, 'RELEASE');
    assert.equal(harness.actions.launches[0]?.externalLeaseId, EXTERNAL_LEASE_ID);
    assert.equal(eventCount(harness.databasePath, 'LEASE_RELEASE_REQUESTED'), 1);
    assert.equal(eventCount(harness.databasePath, 'LEASE_ACTION_CLAIMED'), 1);
    assert.equal(eventCount(harness.databasePath, 'LEASE_RELEASED'), 1);
  });
});

test('blocks a competing caller while the exact release action owner remains alive', async () => {
  const module = await loadLeaseService();
  await withHarness('release-owner-live', async (harness) => {
    harness.actions.mode = 'FAIL_BEFORE_START';
    const first = serviceFor(module, harness, { owner: OWNER_ONE });
    await assert.rejects(async () => await first.release(releaseInput(harness.lease)));
    const pending = latestLease(harness.store, harness.track);
    assert.equal(pending.status, 'RELEASE_PENDING');
    assert.equal(pending.actionPhase, 'CLAIMED');
    assert.equal(pending.actionOwner?.pid, OWNER_ONE.pid);

    const second = serviceFor(module, harness, { owner: OWNER_TWO });
    await expectCode('LEASE_OPERATION_IN_PROGRESS', async () => await second.release(releaseInput(
      pending,
      { expectedLeaseVersion: harness.lease.version },
    )));
    assert.equal(harness.actions.launches.length, 1);
  });
});

test('retries a STARTED release only under the exact same fence after helper absence', async () => {
  const module = await loadLeaseService();
  await withHarness('release-started-retry', async (harness) => {
    harness.actions.mode = 'STARTED_THEN_THROW';
    const first = serviceFor(module, harness, { owner: OWNER_ONE });
    await expectCode('LEASE_ACTION_INCONCLUSIVE', async () => await first.release(
      releaseInput(harness.lease),
    ));
    harness.processes.setAlive(OWNER_ONE, false);
    harness.processes.setAlive(RUNNER, false);
    harness.actions.mode = 'SUCCESS';

    const pending = latestLease(harness.store, harness.track);
    const second = serviceFor(module, harness, { owner: OWNER_TWO });
    const released = await second.release(releaseInput(pending, {
      expectedLeaseVersion: harness.lease.version,
    }));
    assert.equal(released.status, 'RELEASED');
    assert.equal(harness.actions.launches.length, 2);
    assert.equal(harness.actions.launches.every((launch) => launch.kind === 'RELEASE'), true);
    assert.equal(harness.actions.launches[0]?.externalLeaseId, EXTERNAL_LEASE_ID);
    assert.equal(harness.actions.launches[1]?.externalLeaseId, EXTERNAL_LEASE_ID);
  });
});

test('recovers physical release completed before the semantic RELEASED commit', async () => {
  const module = await loadLeaseService();
  await withHarness('physical-before-commit', async (harness) => {
    installEventFailure(harness.databasePath, 'LEASE_RELEASED', 'task11_fail_released');
    const service = serviceFor(module, harness);
    await assert.rejects(async () => await service.release(releaseInput(harness.lease)));
    assert.equal(harness.actions.launches.length, 1);
    assert.equal(latestLease(harness.store, harness.track).status, 'RELEASE_PENDING');
    dropTrigger(harness.databasePath, 'task11_fail_released');

    const pending = latestLease(harness.store, harness.track);
    const recovered = await service.release(releaseInput(pending, {
      expectedLeaseVersion: harness.lease.version,
    }));
    assert.equal(recovered.status, 'RELEASED');
    assert.equal(harness.actions.launches.length, 1);
    assert.equal(eventCount(harness.databasePath, 'LEASE_RELEASED'), 1);
  });
});

test('classifies a missing or unmanaged former worktree as DIVERGED instead of RELEASED', async () => {
  const module = await loadLeaseService();
  await withHarness('missing-unmanaged', async (harness) => {
    harness.physical.setMissingOrUnmanaged();
    const service = serviceFor(module, harness);
    await expectCode('RECOVERY_DIVERGENCE', async () => await service.release(
      releaseInput(harness.lease),
    ));
    assert.equal(latestLease(harness.store, harness.track).status, 'DIVERGED');
    assert.equal(harness.actions.launches.length, 0);
    assert.equal(eventCount(harness.databasePath, 'LEASE_DIVERGED'), 1);
  });
});

test('classifies duplicate external identities as DIVERGED and never first-matches', async () => {
  const module = await loadLeaseService();
  await withHarness('duplicate-identity', async (harness) => {
    harness.physical.setDuplicateExternalIdentity();
    const service = serviceFor(module, harness);
    await expectCode('RECOVERY_DIVERGENCE', async () => await service.release(
      releaseInput(harness.lease),
    ));
    assert.equal(latestLease(harness.store, harness.track).status, 'DIVERGED');
    assert.equal(harness.actions.launches.length, 0);
  });
});

test('replays RELEASED without another action and rejects the same key under candidate drift', async () => {
  const module = await loadLeaseService();
  await withHarness('release-replay', async (harness) => {
    const service = serviceFor(module, harness);
    const released = await service.release(releaseInput(harness.lease));
    const replay = await service.release(releaseInput(released, {
      expectedLeaseVersion: harness.lease.version,
    }));
    assert.deepEqual(replay, released);
    assert.equal(harness.actions.launches.length, 1);
    assert.equal(eventCount(harness.databasePath, 'LEASE_RELEASE_REQUESTED'), 1);
    assert.equal(eventCount(harness.databasePath, 'LEASE_RELEASED'), 1);

    const drifted = serviceFor(module, harness, {
      candidate: candidate({ executableSha256: `sha256:${'f'.repeat(64)}` }),
    });
    await expectCode('LEASE_IDEMPOTENCY_CONFLICT', async () => await drifted.release(
      releaseInput(released, { expectedLeaseVersion: harness.lease.version }),
    ));
    assert.equal(harness.actions.launches.length, 1);
  });
});

test('LeaseService source contains no destructive cleanup or unfenced Treehouse fallback', async () => {
  const sourcePath = path.join(process.cwd(), 'src', 'services', 'lease-service.ts');
  await access(sourcePath);
  const source = await readFile(sourcePath, 'utf8');
  for (const [label, pattern] of [
    ['git reset', /\bgit\b[^\n]*\breset\b/u],
    ['git clean', /\bgit\b[^\n]*\bclean\b/u],
    ['force flag', /--force\b/u],
    ['Treehouse destroy', /\bdestroy\b/u],
    ['Treehouse prune', /\bprune\b/u],
    ['recursive deletion', /\b(?:rmSync|rmdir|unlink|remove)\s*\(/u],
    ['shell execution', /shell\s*:\s*true/u],
    ['direct process exec', /\bexec(?:File)?(?:Sync)?\s*\(/u],
  ] as const) {
    assert.equal(pattern.test(source), false, `${label} is forbidden in ${sourcePath}`);
  }
});
