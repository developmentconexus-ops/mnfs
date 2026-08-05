import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
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
const SOURCE_FINGERPRINT = `sha256:${'b'.repeat(64)}`;
const TREEHOUSE_HASH = `sha256:${'c'.repeat(64)}`;
const COMMAND_SHAPE_HASH =
  'sha256:f2077cfd037cbaefdcfc94385a0cfeb7e1647ef294ca8ceee3cd61a1b109dc84';
const BASE_COMMIT = '1'.repeat(40);
const BASE_TREE = '2'.repeat(40);
const REPOSITORY_ID = 'repo-task11-grant';
const GRANT_KEY = 'lease:grant:WT-001:A01:g1';
const STARTED_AT = '2026-08-05T12:30:00.000Z';
const OCCURRED_AT = '2026-08-05T12:30:01.000Z';
const WORKTREE_PATH = '/home/mnfs/runtime/treehouse/pool/tree-001';
const EXTERNAL_LEASE_ID = 'treehouse-lease-001';

const OWNER_ONE: ProcessIdentity = {
  bootId: 'boot-task11-owner-one',
  pid: 7101,
  startTicks: '111001',
};
const OWNER_TWO: ProcessIdentity = {
  bootId: 'boot-task11-owner-two',
  pid: 7102,
  startTicks: '111002',
};
const RUNNER: ProcessIdentity = {
  bootId: 'boot-task11-runner',
  pid: 7201,
  startTicks: '112001',
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

interface LeaseGrantInput {
  readonly writeTrackId: string;
  readonly idempotencyKey: string;
  readonly occurredAt: string;
}

interface LeaseServiceContract {
  grant(input: LeaseGrantInput): Promise<Lease>;
  release(input: Readonly<{
    leaseId: string;
    expectedLeaseVersion: number;
    idempotencyKey: string;
    occurredAt: string;
  }>): Promise<Lease>;
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
  readonly calls: Array<Readonly<{ kind: 'GRANT' | 'RELEASE'; leaseId?: string }>> = [];
  current: LeasePhysicalObservation;

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

  setExactLease(holder: string): void {
    this.current = {
      source: { ...this.current.source },
      candidates: [{
        path: WORKTREE_PATH,
        managed: true,
        sourcePath: this.current.source.path,
        status: 'leased',
        gitStatus: 'CLEAN',
        leaseId: EXTERNAL_LEASE_ID,
        holder,
        leasedAt: STARTED_AT,
      }],
    };
  }

  setDuplicateLeases(holder: string): void {
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
          holder,
          leasedAt: STARTED_AT,
        },
        {
          path: `${WORKTREE_PATH}-duplicate`,
          managed: true,
          sourcePath: this.current.source.path,
          status: 'leased',
          gitStatus: 'CLEAN',
          leaseId: `${EXTERNAL_LEASE_ID}-duplicate`,
          holder,
          leasedAt: STARTED_AT,
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
  customLaunch?: (input: LeaseActionLaunchInput) => Promise<void>;

  constructor(readonly physical: ScriptedPhysicalAuthority) {}

  async observe(actionToken: string): Promise<LeaseActionObservation> {
    return this.observations.get(actionToken) ?? { state: 'ABSENT' };
  }

  async launch(input: LeaseActionLaunchInput): Promise<void> {
    this.launches.push({ ...input });
    if (this.customLaunch !== undefined) {
      await this.customLaunch(input);
      return;
    }
    if (this.mode === 'FAIL_BEFORE_START') {
      throw new MnfsError('TREEHOUSE_COMMAND_FAILED', 'Injected failure before helper STARTED.');
    }
    if (this.mode === 'STARTED_THEN_THROW') {
      this.observations.set(input.actionToken, {
        state: 'STARTED',
        runner: RUNNER,
        startedRef: `/home/mnfs/actions/${input.actionToken}/started.json`,
      });
      throw new MnfsError('LEASE_ACTION_INCONCLUSIVE', 'Injected failure after helper STARTED.');
    }
    this.observations.set(input.actionToken, {
      state: 'FINISHED',
      runner: RUNNER,
      startedRef: `/home/mnfs/actions/${input.actionToken}/started.json`,
      resultRef: `/home/mnfs/actions/${input.actionToken}/finished.json`,
    });
    if (input.kind === 'GRANT') this.physical.setExactLease(input.holder);
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

function grantInput(overrides: Partial<LeaseGrantInput> = {}): LeaseGrantInput {
  return {
    writeTrackId: 'WT-001',
    idempotencyKey: GRANT_KEY,
    occurredAt: OCCURRED_AT,
    ...overrides,
  };
}

function serviceFor(
  module: LeaseServiceModule,
  harness: Harness,
  options: Readonly<{
    store?: SqliteStore;
    owner?: ProcessIdentity;
    candidate?: CandidateIdentity;
  }> = {},
): LeaseServiceContract {
  return new module.LeaseService({
    store: options.store ?? harness.store,
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
  const root = mkdtempSync(join(tmpdir(), `mnfs-task11-grant-${label}-`));
  const databasePath = join(root, 'mnfs.db');
  const actionRoot = join(root, 'actions');
  const sourcePath = join(root, 'execution-sources', 'WT-001', 'A01', 'source');
  mkdirSync(actionRoot, { recursive: true });
  mkdirSync(sourcePath, { recursive: true });
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
    const physical = new ScriptedPhysicalAuthority({
      status: 'READY',
      path: sourcePath,
      fingerprint: SOURCE_FINGERPRINT,
      baseCommitSha: BASE_COMMIT,
      baseTreeSha: BASE_TREE,
      objectFormat: 'sha1',
    });
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
      physical,
      actions,
      processes,
    });
  } finally {
    store.close();
    rmSync(root, { recursive: true, force: true });
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

function leaseActionRow(databasePath: string): Readonly<{
  status: string;
  actionToken?: string;
  actionPhase?: string;
  actionOwnerPid?: number;
}> {
  const database = openDatabase(databasePath, true);
  try {
    const row = database.prepare(`
      SELECT status, action_token, action_phase, action_owner_pid
      FROM leases
      ORDER BY generation DESC
      LIMIT 1
    `).get() as {
      readonly status: string;
      readonly action_token: string | null;
      readonly action_phase: string | null;
      readonly action_owner_pid: number | null;
    };
    return {
      status: row.status,
      ...(row.action_token === null ? {} : { actionToken: row.action_token }),
      ...(row.action_phase === null ? {} : { actionPhase: row.action_phase }),
      ...(row.action_owner_pid === null ? {} : { actionOwnerPid: Number(row.action_owner_pid) }),
    };
  } finally {
    database.close();
  }
}

async function createIntentOnly(
  service: LeaseServiceContract,
  harness: Harness,
  triggerName: string,
): Promise<Lease> {
  installEventFailure(harness.databasePath, 'LEASE_ACTION_CLAIMED', triggerName);
  await assert.rejects(async () => await service.grant(grantInput()));
  dropTrigger(harness.databasePath, triggerName);
  const lease = harness.store.execution.getCurrentLease(harness.track.id);
  assert.notEqual(lease, undefined, 'grant intent was not persisted before action claim');
  assert.equal(lease?.status, 'REQUESTED');
  assert.equal(lease?.actionToken, undefined);
  return lease as Lease;
}

test('rejects READY source drift before creating Lease intent or launching a helper', async () => {
  const module = await loadLeaseService();
  await withHarness('source-drift', async (harness) => {
    harness.physical.current = {
      source: { ...harness.physical.current.source, fingerprint: `sha256:${'d'.repeat(64)}` },
      candidates: [],
    };
    const service = serviceFor(module, harness);
    await expectCode('EXECUTION_SOURCE_CHANGED', async () => await service.grant(grantInput()));
    assert.equal(harness.store.execution.getCurrentLease(harness.track.id), undefined);
    assert.equal(harness.actions.launches.length, 0);
  });
});

test('retries intent-only grant and performs exactly one external acquisition', async () => {
  const module = await loadLeaseService();
  await withHarness('intent-retry', async (harness) => {
    const service = serviceFor(module, harness);
    await createIntentOnly(service, harness, 'task11_intent_retry');

    const active = await service.grant(grantInput());
    assert.equal(active.status, 'ACTIVE');
    assert.equal(active.externalLeaseId, EXTERNAL_LEASE_ID);
    assert.equal(active.worktreePath, WORKTREE_PATH);
    assert.equal(harness.actions.launches.length, 1);
    assert.equal(eventCount(harness.databasePath, 'LEASE_REQUESTED'), 1);
    assert.equal(eventCount(harness.databasePath, 'LEASE_ACTION_CLAIMED'), 1);
    assert.equal(eventCount(harness.databasePath, 'LEASE_GRANTED'), 1);
  });
});

test('adopts one exact external Lease after intent without launching another acquisition', async () => {
  const module = await loadLeaseService();
  await withHarness('adopt-exact', async (harness) => {
    const service = serviceFor(module, harness);
    const requested = await createIntentOnly(service, harness, 'task11_adopt_exact');
    harness.physical.setExactLease(requested.holder);

    const active = await service.grant(grantInput());
    assert.equal(active.status, 'ACTIVE');
    assert.equal(active.externalLeaseId, EXTERNAL_LEASE_ID);
    assert.equal(harness.actions.launches.length, 0);
    assert.equal(eventCount(harness.databasePath, 'LEASE_GRANTED'), 1);
  });
});

test('blocks takeover while the exact action owner is still alive', async () => {
  const module = await loadLeaseService();
  await withHarness('owner-live', async (harness) => {
    harness.actions.mode = 'FAIL_BEFORE_START';
    const first = serviceFor(module, harness, { owner: OWNER_ONE });
    await assert.rejects(async () => await first.grant(grantInput()));
    const claimed = leaseActionRow(harness.databasePath);
    assert.equal(claimed.status, 'REQUESTED');
    assert.equal(claimed.actionPhase, 'CLAIMED');
    assert.equal(claimed.actionOwnerPid, OWNER_ONE.pid);

    const second = serviceFor(module, harness, { owner: OWNER_TWO });
    await expectCode('LEASE_OPERATION_IN_PROGRESS', async () => await second.grant(grantInput()));
    assert.equal(harness.actions.launches.length, 1);
  });
});

test('replaces a dead pre-STARTED owner with a different action token after fresh observation', async () => {
  const module = await loadLeaseService();
  await withHarness('owner-dead', async (harness) => {
    harness.actions.mode = 'FAIL_BEFORE_START';
    const first = serviceFor(module, harness, { owner: OWNER_ONE });
    await assert.rejects(async () => await first.grant(grantInput()));
    const firstToken = harness.actions.launches[0]?.actionToken;
    assert.notEqual(firstToken, undefined);

    harness.processes.setAlive(OWNER_ONE, false);
    harness.actions.mode = 'SUCCESS';
    const second = serviceFor(module, harness, { owner: OWNER_TWO });
    const active = await second.grant(grantInput());
    assert.equal(active.status, 'ACTIVE');
    assert.equal(harness.actions.launches.length, 2);
    assert.notEqual(harness.actions.launches[1]?.actionToken, firstToken);
  });
});

test('never invokes grant again after a durable STARTED observation without decisive Lease state', async () => {
  const module = await loadLeaseService();
  await withHarness('started-inconclusive', async (harness) => {
    harness.actions.mode = 'STARTED_THEN_THROW';
    const first = serviceFor(module, harness, { owner: OWNER_ONE });
    await expectCode('LEASE_ACTION_INCONCLUSIVE', async () => await first.grant(grantInput()));
    harness.processes.setAlive(OWNER_ONE, false);

    const second = serviceFor(module, harness, { owner: OWNER_TWO });
    await expectCode('LEASE_ACTION_INCONCLUSIVE', async () => await second.grant(grantInput()));
    assert.equal(harness.actions.launches.length, 1);
  });
});

test('recovers an external Lease created before the semantic LEASE_GRANTED commit', async () => {
  const module = await loadLeaseService();
  await withHarness('external-before-commit', async (harness) => {
    installEventFailure(harness.databasePath, 'LEASE_GRANTED', 'task11_fail_granted');
    const service = serviceFor(module, harness);
    await assert.rejects(async () => await service.grant(grantInput()));
    const afterFailure = harness.store.execution.getCurrentLease(harness.track.id);
    assert.equal(afterFailure?.status, 'REQUESTED');
    assert.equal(harness.actions.launches.length, 1);
    dropTrigger(harness.databasePath, 'task11_fail_granted');

    const recovered = await service.grant(grantInput());
    assert.equal(recovered.status, 'ACTIVE');
    assert.equal(recovered.externalLeaseId, EXTERNAL_LEASE_ID);
    assert.equal(harness.actions.launches.length, 1);
    assert.equal(eventCount(harness.databasePath, 'LEASE_GRANTED'), 1);
  });
});

test('replays committed ACTIVE grant and rejects same key bound to candidate drift', async () => {
  const module = await loadLeaseService();
  await withHarness('grant-replay', async (harness) => {
    const service = serviceFor(module, harness);
    const first = await service.grant(grantInput());
    const second = await service.grant(grantInput());
    assert.deepEqual(second, first);
    assert.equal(harness.actions.launches.length, 1);
    assert.equal(eventCount(harness.databasePath, 'LEASE_REQUESTED'), 1);
    assert.equal(eventCount(harness.databasePath, 'LEASE_GRANTED'), 1);

    const drifted = serviceFor(module, harness, {
      candidate: candidate({ executableSha256: `sha256:${'e'.repeat(64)}` }),
    });
    await expectCode('LEASE_IDEMPOTENCY_CONFLICT', async () => await drifted.grant(grantInput()));
    assert.equal(harness.actions.launches.length, 1);
  });
});

test('marks non-bijective external Lease matches DIVERGED and performs no acquisition', async () => {
  const module = await loadLeaseService();
  await withHarness('duplicate-external', async (harness) => {
    const service = serviceFor(module, harness);
    const requested = await createIntentOnly(service, harness, 'task11_duplicate_external');
    harness.physical.setDuplicateLeases(requested.holder);

    await expectCode('RECOVERY_DIVERGENCE', async () => await service.grant(grantInput()));
    const diverged = harness.store.execution.getCurrentLease(harness.track.id);
    assert.equal(diverged?.status, 'DIVERGED');
    assert.equal(harness.actions.launches.length, 0);
    assert.equal(eventCount(harness.databasePath, 'LEASE_DIVERGED'), 1);
  });
});

test('two independent callers claim at most one grant action and converge on one ACTIVE Lease', async () => {
  const module = await loadLeaseService();
  await withHarness('concurrent', async (harness) => {
    const secondStore = SqliteStore.openCurrent(harness.databasePath);
    let releaseLaunch: (() => void) | undefined;
    const launchMayFinish = new Promise<void>((resolve) => {
      releaseLaunch = resolve;
    });
    let signalLaunch: (() => void) | undefined;
    const launchStarted = new Promise<void>((resolve) => {
      signalLaunch = resolve;
    });
    harness.actions.customLaunch = async (input) => {
      harness.actions.observations.set(input.actionToken, {
        state: 'STARTED',
        runner: RUNNER,
        startedRef: `/home/mnfs/actions/${input.actionToken}/started.json`,
      });
      signalLaunch?.();
      await launchMayFinish;
      harness.actions.observations.set(input.actionToken, {
        state: 'FINISHED',
        runner: RUNNER,
        startedRef: `/home/mnfs/actions/${input.actionToken}/started.json`,
        resultRef: `/home/mnfs/actions/${input.actionToken}/finished.json`,
      });
      harness.physical.setExactLease(input.holder);
    };

    try {
      const first = serviceFor(module, harness, { store: harness.store, owner: OWNER_ONE });
      const second = serviceFor(module, harness, { store: secondStore, owner: OWNER_TWO });
      const firstResult = first.grant(grantInput());
      await launchStarted;
      const secondResult = second.grant(grantInput());
      releaseLaunch?.();
      const outcomes = await Promise.allSettled([firstResult, secondResult]);

      assert.equal(harness.actions.launches.length, 1);
      const active = harness.store.execution.getCurrentLease(harness.track.id);
      assert.equal(active?.status, 'ACTIVE');
      assert.equal(outcomes.some((outcome) => outcome.status === 'fulfilled'), true);
      for (const outcome of outcomes) {
        if (outcome.status === 'rejected') {
          assert.equal(outcome.reason instanceof MnfsError, true);
          assert.equal(
            ['LEASE_OPERATION_IN_PROGRESS', 'LEASE_ACTION_INCONCLUSIVE'].includes(
              (outcome.reason as MnfsError).code,
            ),
            true,
          );
        }
      }
    } finally {
      secondStore.close();
    }
  });
});
