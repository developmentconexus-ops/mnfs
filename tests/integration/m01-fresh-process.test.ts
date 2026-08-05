import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';

import { ExecutionSourceAdapter } from '../../src/adapters/execution-source.js';
import { GitWorktreeInspector } from '../../src/adapters/git-worktree.js';
import { LinuxProcessIdentityInspector, sameProcessIdentity } from '../../src/adapters/process-identity.js';
import type { MissionPlanContentV2 } from '../../src/domain/mission-plan.js';
import { MnfsError } from '../../src/domain/errors.js';
import type {
  Attempt,
  Lease,
  ProcessIdentity,
  WriteTrack,
} from '../../src/execution/model.js';
import { resolveExecutionSourcePath } from '../../src/runtime/paths.js';
import { runProcess } from '../../src/runtime/process-runner.js';
import { ClaimService } from '../../src/services/claim-service.js';
import { ExecutionService } from '../../src/services/execution-service.js';
import {
  LeaseService,
  type LeaseActionAuthority,
  type LeaseActionLaunchInput,
  type LeaseActionObservation,
  type LeasePhysicalAuthority,
  type PhysicalLeaseCandidate,
} from '../../src/services/lease-service.js';
import {
  RecoveryService,
  type RecoveryActionCandidate,
  type RecoveryLeaseCandidate,
  type RecoveryProcessCandidate,
  type RecoverySourceObservation,
  type RecoveryWorldObservation,
} from '../../src/services/recovery-service.js';
import { SqliteStore } from '../../src/store/sqlite-store.js';
import { M01_FIXTURE } from '../support/m01-fixtures.js';

const DRIVER_MODE = process.argv[2] === '--driver';
const DRIVER_FILE = fileURLToPath(import.meta.url);
const FIXED_TIME = '2026-08-05T20:00:00.000Z';
const REPOSITORY_ID = 'task14-fresh-process';
const CANDIDATE = Object.freeze({
  executableSha256: M01_FIXTURE.treehouseHash,
  semanticVersion: '2.1.1' as const,
  commandShapeSha256: 'sha256:f2077cfd037cbaefdcfc94385a0cfeb7e1647ef294ca8ceee3cd61a1b109dc84',
});

type CrashMode =
  | 'NONE'
  | 'GRANT_BEFORE_STARTED'
  | 'GRANT_AFTER_STARTED'
  | 'GRANT_AFTER_EXTERNAL'
  | 'RELEASE_BEFORE_STARTED'
  | 'RELEASE_AFTER_STARTED'
  | 'RELEASE_AFTER_EXTERNAL';

interface DriverConfig {
  readonly root: string;
  readonly canonicalRoot: string;
  readonly runtimeRoot: string;
  readonly databasePath: string;
  readonly worldPath: string;
  readonly baseCommitSha: string;
  readonly baseTreeSha: string;
  readonly resultTreeSha: string;
  readonly contractHash: string;
  readonly criterionId: string;
  readonly criterionIds: Readonly<Record<string, string>>;
}

interface FakeActionRecord {
  readonly kind: 'GRANT' | 'RELEASE';
  readonly state: 'STARTED' | 'FINISHED' | 'CONFLICT';
  readonly runner: ProcessIdentity;
  readonly startedRef: string;
  readonly resultRef?: string;
}

interface FakeWorld {
  readonly schemaVersion: 1;
  readonly mode: CrashMode;
  readonly externalInvocations: number;
  readonly launches: readonly LeaseActionLaunchInput[];
  readonly candidates: readonly PhysicalLeaseCandidate[];
  readonly actions: Readonly<Record<string, FakeActionRecord>>;
}

interface DriverPayload {
  readonly trackId?: string;
  readonly leaseId?: string;
  readonly expectedLeaseVersion?: number;
  readonly featureQualifiedId?: string;
}

interface Fixture {
  readonly root: string;
  readonly configPath: string;
  readonly config: DriverConfig;
}

interface DriverResult<T = unknown> {
  readonly status: number | null;
  readonly stdout: string;
  readonly stderr: string;
  readonly value?: T;
}

function environment(): Readonly<Record<string, string>> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (value !== undefined) result[key] = value;
  }
  return Object.freeze(result);
}

function git(cwd: string, args: readonly string[]): string {
  const result = spawnSync('git', [...args], {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_NOSYSTEM: '1' },
    shell: false,
  });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}

function atomicWriteJson(path: string, value: unknown): void {
  mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  const temporary = `${path}.tmp-${process.pid}`;
  writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 });
  renameSync(temporary, path);
}

function readWorld(path: string): FakeWorld {
  return JSON.parse(readFileSync(path, 'utf8')) as FakeWorld;
}

function writeWorld(path: string, world: FakeWorld): void {
  atomicWriteJson(path, world);
}

function updateWorld(path: string, update: (world: FakeWorld) => FakeWorld): FakeWorld {
  const next = update(readWorld(path));
  writeWorld(path, next);
  return next;
}

function setCrashMode(fixture: Fixture, mode: CrashMode): void {
  updateWorld(fixture.config.worldPath, (world) => ({ ...world, mode }));
}

function createFixture(t: test.TestContext, label: string): Fixture {
  const root = mkdtempSync(join(tmpdir(), `mnfs-m01-task14-${label}-`));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const canonicalRoot = join(root, 'canonical');
  const runtimeRoot = join(root, 'runtime', 'repos', REPOSITORY_ID);
  mkdirSync(canonicalRoot, { recursive: true, mode: 0o700 });
  mkdirSync(runtimeRoot, { recursive: true, mode: 0o700 });

  git(canonicalRoot, ['init', '-b', 'main']);
  git(canonicalRoot, ['config', 'user.name', 'MNFS Task 14']);
  git(canonicalRoot, ['config', 'user.email', 'task14@mnfs.invalid']);
  writeFileSync(join(canonicalRoot, 'README.md'), `# ${label}\n`, 'utf8');
  writeFileSync(join(canonicalRoot, 'result.txt'), 'deterministic-result\n', 'utf8');
  git(canonicalRoot, ['add', 'README.md', 'result.txt']);
  git(canonicalRoot, ['commit', '-m', 'fixture']);
  const baseCommitSha = git(canonicalRoot, ['rev-parse', 'HEAD']);
  const baseTreeSha = git(canonicalRoot, ['rev-parse', 'HEAD^{tree}']);

  const planWrapper = JSON.parse(
    readFileSync(resolve('.mnfs/missions/MIS-002/plan.json'), 'utf8'),
  ) as {
    readonly contentHash: string;
    readonly content: MissionPlanContentV2;
  };
  const milestone = planWrapper.content.milestones
    .find((candidate) => candidate.qualifiedId === 'MIS-002/M01');
  assert.notEqual(milestone, undefined);
  const criterionIds = Object.fromEntries(
    (milestone?.features ?? []).map((feature) => {
      const criterion = feature.acceptanceCriteria[0]?.qualifiedId;
      assert.equal(typeof criterion, 'string');
      return [feature.qualifiedId, criterion as string] as const;
    }),
  );
  const criterionId = criterionIds['MIS-002/M01/F01'];
  assert.equal(typeof criterionId, 'string');

  const databasePath = join(runtimeRoot, 'mnfs.db');
  const store = SqliteStore.open(databasePath);
  try {
    store.openMission({
      missionId: 'MIS-002',
      eventId: `EVT-MIS-002-TASK14-${label.toUpperCase()}-OPEN`,
      goal: 'Prove M01 fresh-process deterministic composition',
      openedAt: FIXED_TIME,
    });
    const saved = store.saveMissionPlanRevision({
      missionId: 'MIS-002',
      content: planWrapper.content,
      createdAt: FIXED_TIME,
    });
    assert.equal(saved.contentHash, M01_FIXTURE.contractHash);
    const approved = store.approveMissionPlan({
      missionId: 'MIS-002',
      contentHash: saved.contentHash,
      approvedAt: FIXED_TIME,
    });
    assert.equal(approved.contentHash, M01_FIXTURE.contractHash);
  } finally {
    store.close();
  }

  const worldPath = join(root, 'fake-treehouse-world.json');
  writeWorld(worldPath, {
    schemaVersion: 1,
    mode: 'NONE',
    externalInvocations: 0,
    launches: [],
    candidates: [],
    actions: {},
  });
  const config: DriverConfig = {
    root,
    canonicalRoot,
    runtimeRoot,
    databasePath,
    worldPath,
    baseCommitSha,
    baseTreeSha,
    resultTreeSha: baseTreeSha,
    contractHash: M01_FIXTURE.contractHash,
    criterionId: criterionId as string,
    criterionIds,
  };
  const configPath = join(root, 'driver-config.json');
  atomicWriteJson(configPath, config);
  return { root, configPath, config };
}

function runDriver<T = unknown>(
  fixture: Fixture,
  operation: string,
  payload: DriverPayload = {},
): DriverResult<T> {
  const result = spawnSync(process.execPath, [
    DRIVER_FILE,
    '--driver',
    operation,
    fixture.configPath,
    JSON.stringify(payload),
  ], {
    cwd: resolve('.'),
    encoding: 'utf8',
    env: { ...process.env, NODE_NO_WARNINGS: '1' },
    shell: false,
  });
  const stdout = result.stdout ?? '';
  const stderr = result.stderr ?? '';
  let value: T | undefined;
  if (result.status === 0 && stdout.trim().length > 0) {
    value = JSON.parse(stdout) as T;
  }
  return { status: result.status, stdout, stderr, ...(value === undefined ? {} : { value }) };
}

function expectSuccess<T>(result: DriverResult<T>): T {
  assert.equal(result.status, 0, result.stderr);
  assert.notEqual(result.value, undefined, 'driver did not return JSON');
  return result.value as T;
}

function inspector(): GitWorktreeInspector {
  return new GitWorktreeInspector({
    gitExecutable: '/usr/bin/git',
    runProcess,
    environment: environment(),
  });
}

async function currentIdentity(): Promise<ProcessIdentity> {
  const observed = await new LinuxProcessIdentityInspector().observe(process.pid);
  if (observed === undefined) throw new Error('current process identity is unavailable');
  return observed;
}

function sourceEventId(attemptId: string, suffix: string): string {
  return `EVT-${attemptId.replaceAll('/', '-')}-TASK14-SOURCE-${suffix}`;
}

async function prepareSource(
  config: DriverConfig,
  store: SqliteStore,
  track: WriteTrack,
  attempt: Attempt,
  crashAfterPhysical: boolean,
  crashAfterRequest = false,
): Promise<Attempt> {
  const gitInspector = inspector();
  const existingRequested = store.listEvents().some(
    (event) => event.eventId === sourceEventId(attempt.id, 'REQUESTED'),
  );
  if (!existingRequested) {
    store.execution.runAtomic((session) => {
      session.appendEvent({
        eventId: sourceEventId(attempt.id, 'REQUESTED'),
        type: 'EXECUTION_SOURCE_REQUESTED',
        payloadSchemaVersion: 1,
        missionId: track.missionId,
        occurredAt: FIXED_TIME,
        payload: {
          writeTrackId: track.id,
          attemptId: attempt.id,
          contractHash: attempt.contractHash,
          baseCommitSha: attempt.baseCommitSha,
          gitObjectFormat: attempt.gitObjectFormat,
        },
      });
    });
  }
  if (crashAfterRequest) process.exit(71);
  const prepared = await new ExecutionSourceAdapter({
    runtimeRoot: config.runtimeRoot,
    gitExecutable: '/usr/bin/git',
    runProcess,
    gitInspector,
    environment: environment(),
  }).prepare({
    repositoryId: REPOSITORY_ID,
    trackId: track.id,
    attemptId: attempt.id,
    canonicalCheckoutPath: config.canonicalRoot,
    baseCommitSha: attempt.baseCommitSha,
    gitObjectFormat: attempt.gitObjectFormat,
  });
  assert.equal(prepared.status, 'READY');
  if (crashAfterPhysical) process.exit(72);

  return store.execution.runAtomic((session) => {
    const current = store.execution.getAttempt(attempt.id);
    if (current === undefined) throw new Error('attempt disappeared');
    if (
      current.sourceStatus === 'READY'
      && current.sourcePath === prepared.sourcePath
      && current.sourceFingerprint === prepared.fingerprint
    ) return current;
    const ready = session.setAttemptState({
      id: current.id,
      expectedVersion: current.version,
      status: current.status,
      sourceStatus: 'READY',
      sourcePath: prepared.sourcePath,
      sourceFingerprint: prepared.fingerprint,
      updatedAt: FIXED_TIME,
    });
    session.appendEvent({
      eventId: sourceEventId(attempt.id, 'READY'),
      type: 'EXECUTION_SOURCE_READY',
      payloadSchemaVersion: 1,
      missionId: track.missionId,
      occurredAt: FIXED_TIME,
      payload: {
        writeTrackId: track.id,
        attemptId: ready.id,
        sourcePath: prepared.sourcePath,
        sourceFingerprint: prepared.fingerprint,
        baseCommitSha: ready.baseCommitSha,
        baseTreeSha: prepared.observation.headTreeSha,
        gitObjectFormat: ready.gitObjectFormat,
      },
    });
    return ready;
  });
}

async function openTrack(
  config: DriverConfig,
  store: SqliteStore,
  options: Readonly<{
    crashAfterIntent?: boolean;
    crashAfterPhysical?: boolean;
    featureQualifiedId?: string;
  }> = {},
): Promise<Readonly<{ track: WriteTrack; attempt: Attempt }>> {
  const gitInspector = inspector();
  const observed = await gitInspector.requireCommit(config.canonicalRoot, config.baseCommitSha);
  const service = new ExecutionService({
    store,
    git: {
      requireCommit: (sha) => {
        if (sha !== observed.sha) throw new MnfsError('GIT_OBJECT_INVALID', 'base changed');
        return observed;
      },
    },
  });
  const featureQualifiedId = options.featureQualifiedId ?? 'MIS-002/M01/F01';
  const opened = service.openWriteTrack({
    missionId: 'MIS-002',
    milestoneQualifiedId: 'MIS-002/M01',
    featureQualifiedId,
    contractHash: config.contractHash,
    baseCommitSha: config.baseCommitSha,
    idempotencyKey: `task14:track:open:${featureQualifiedId}`,
    occurredAt: FIXED_TIME,
  });
  const attempt = await prepareSource(
    config,
    store,
    opened.track,
    opened.attempt,
    options.crashAfterPhysical ?? false,
    options.crashAfterIntent ?? false,
  );
  return { track: opened.track, attempt };
}

async function sourceObservation(config: DriverConfig, attempt: Attempt) {
  if (
    attempt.sourceStatus !== 'READY'
    || attempt.sourcePath === undefined
    || attempt.sourceFingerprint === undefined
  ) throw new Error('attempt source is not READY');
  const observed = await inspector().observeRepository(attempt.sourcePath);
  if (
    observed.headCommitSha !== attempt.baseCommitSha
    || observed.headTreeSha !== config.baseTreeSha
    || observed.objectFormat !== attempt.gitObjectFormat
  ) throw new Error('source observation drifted');
  return {
    status: 'READY' as const,
    path: attempt.sourcePath,
    fingerprint: attempt.sourceFingerprint,
    baseCommitSha: attempt.baseCommitSha,
    baseTreeSha: observed.headTreeSha,
    objectFormat: attempt.gitObjectFormat,
  };
}

async function fakeAuthorities(
  config: DriverConfig,
  ownerIdentity: ProcessIdentity,
): Promise<Readonly<{
  physical: LeasePhysicalAuthority;
  actions: LeaseActionAuthority;
  processes: { isAlive(identity: ProcessIdentity): Promise<boolean> };
}>> {
  const processInspector = new LinuxProcessIdentityInspector();
  const physical: LeasePhysicalAuthority = {
    observe: async ({ attempt }) => ({
      source: await sourceObservation(config, attempt),
      candidates: readWorld(config.worldPath).candidates,
    }),
  };
  const actions: LeaseActionAuthority = {
    observe: async (actionToken): Promise<LeaseActionObservation> => {
      const record = readWorld(config.worldPath).actions[actionToken];
      if (record === undefined) return { state: 'ABSENT' };
      return {
        state: record.state,
        runner: record.runner,
        startedRef: record.startedRef,
        ...(record.resultRef === undefined ? {} : { resultRef: record.resultRef }),
      };
    },
    launch: async (input): Promise<void> => {
      let world = updateWorld(config.worldPath, (current) => ({
        ...current,
        launches: [...current.launches, input],
      }));
      const mode = world.mode;
      if (
        (input.kind === 'GRANT' && mode === 'GRANT_BEFORE_STARTED')
        || (input.kind === 'RELEASE' && mode === 'RELEASE_BEFORE_STARTED')
      ) process.exit(81);

      const runner = ownerIdentity;
      const tokenRoot = join(config.runtimeRoot, 'fake-actions', input.actionToken);
      const startedRef = join(tokenRoot, 'started.json');
      const resultRef = join(tokenRoot, 'finished.json');
      mkdirSync(tokenRoot, { recursive: true, mode: 0o700 });
      atomicWriteJson(startedRef, { actionToken: input.actionToken, kind: input.kind, runner });
      world = updateWorld(config.worldPath, (current) => ({
        ...current,
        actions: {
          ...current.actions,
          [input.actionToken]: {
            kind: input.kind,
            state: 'STARTED',
            runner,
            startedRef,
          },
        },
      }));
      if (
        (input.kind === 'GRANT' && mode === 'GRANT_AFTER_STARTED')
        || (input.kind === 'RELEASE' && mode === 'RELEASE_AFTER_STARTED')
      ) process.exit(82);

      const externalLeaseId = `fake-${input.leaseId.toLowerCase()}`;
      const worktreePath = join(config.runtimeRoot, 'fake-treehouse-pool', input.leaseId.toLowerCase());
      mkdirSync(worktreePath, { recursive: true, mode: 0o700 });
      world = updateWorld(config.worldPath, (current) => {
        const others = current.candidates.filter((candidate) => candidate.path !== worktreePath);
        const candidate: PhysicalLeaseCandidate = input.kind === 'GRANT'
          ? {
              path: worktreePath,
              managed: true,
              sourcePath: input.sourcePath,
              status: 'leased',
              gitStatus: 'CLEAN',
              leaseId: externalLeaseId,
              holder: input.holder,
              leasedAt: FIXED_TIME,
            }
          : {
              path: input.worktreePath as string,
              managed: true,
              sourcePath: input.sourcePath,
              status: 'available',
              gitStatus: 'CLEAN',
            };
        return {
          ...current,
          externalInvocations: current.externalInvocations + 1,
          candidates: [...others, candidate],
        };
      });
      atomicWriteJson(resultRef, { actionToken: input.actionToken, kind: input.kind, exitCode: 0 });
      updateWorld(config.worldPath, (current) => ({
        ...current,
        actions: {
          ...current.actions,
          [input.actionToken]: {
            kind: input.kind,
            state: 'FINISHED',
            runner,
            startedRef,
            resultRef,
          },
        },
      }));
      if (
        (input.kind === 'GRANT' && mode === 'GRANT_AFTER_EXTERNAL')
        || (input.kind === 'RELEASE' && mode === 'RELEASE_AFTER_EXTERNAL')
      ) process.exit(83);
    },
  };
  return {
    physical,
    actions,
    processes: {
      isAlive: async (identity) => {
        const observed = await processInspector.observe(identity.pid);
        return observed !== undefined && sameProcessIdentity(observed, identity);
      },
    },
  };
}

async function leaseService(config: DriverConfig, store: SqliteStore): Promise<LeaseService> {
  const ownerIdentity = await currentIdentity();
  const authorities = await fakeAuthorities(config, ownerIdentity);
  return new LeaseService({
    store,
    repositoryId: REPOSITORY_ID,
    actionRoot: join(config.runtimeRoot, 'lease-actions'),
    candidate: CANDIDATE,
    ownerIdentity,
    physical: authorities.physical,
    actions: authorities.actions,
    processes: authorities.processes,
    now: () => FIXED_TIME,
  });
}

function recoverySource(
  config: DriverConfig,
  attempt: Attempt | undefined,
): RecoverySourceObservation[] {
  if (attempt === undefined) return [];
  if (attempt.sourceStatus === 'REQUESTED') {
    const requestedPath = resolveExecutionSourcePath(
      config.runtimeRoot,
      attempt.writeTrackId,
      attempt.id,
    );
    if (!existsSync(requestedPath)) return [];
    return [{
      status: 'READY',
      attemptId: attempt.id,
      path: requestedPath,
      baseCommitSha: attempt.baseCommitSha,
      objectFormat: attempt.gitObjectFormat,
    }];
  }
  if (
    attempt.sourceStatus !== 'READY'
    || attempt.sourcePath === undefined
    || attempt.sourceFingerprint === undefined
  ) return [{ status: 'UNKNOWN', attemptId: attempt.id }];
  return [{
    status: existsSync(attempt.sourcePath) ? 'READY' : 'MISSING',
    attemptId: attempt.id,
    path: attempt.sourcePath,
    fingerprint: attempt.sourceFingerprint,
    baseCommitSha: attempt.baseCommitSha,
    objectFormat: attempt.gitObjectFormat,
  }];
}

async function recoveryWorld(
  config: DriverConfig,
  store: SqliteStore,
  writeTrackId?: string,
): Promise<RecoveryWorldObservation> {
  if (writeTrackId === undefined) return { sources: [], leases: [], actions: [], processes: [] };
  const track = store.execution.getWriteTrack(writeTrackId);
  const attempt = track === undefined ? undefined : store.execution.getCurrentAttempt(track.id);
  const lease = track === undefined
    ? undefined
    : store.execution.getCurrentLease(track.id) ?? store.execution.getLatestLease(track.id);
  const world = readWorld(config.worldPath);
  const sources = recoverySource(config, attempt);
  if (
    attempt?.sourceStatus === 'READY'
    && attempt.sourcePath !== undefined
    && attempt.sourceFingerprint !== undefined
    && sources[0] !== undefined
  ) {
    const observed = await sourceObservation(config, attempt);
    sources[0] = {
      status: 'READY',
      attemptId: attempt.id,
      path: observed.path,
      fingerprint: observed.fingerprint,
      baseCommitSha: observed.baseCommitSha,
      baseTreeSha: observed.baseTreeSha,
      objectFormat: observed.objectFormat,
    };
  }
  const actions: RecoveryActionCandidate[] = [];
  const processes: RecoveryProcessCandidate[] = [];
  if (lease?.actionToken !== undefined && lease.actionKind !== undefined) {
    const record = world.actions[lease.actionToken];
    actions.push(record === undefined
      ? {
          actionToken: lease.actionToken,
          state: 'CLAIMED',
          kind: lease.actionKind,
        }
      : {
          actionToken: lease.actionToken,
          state: record.state,
          kind: record.kind,
          runner: record.runner,
          startedRef: record.startedRef,
          ...(record.resultRef === undefined ? {} : { resultRef: record.resultRef }),
        });
    const identities = [lease.actionOwner, record?.runner].filter(
      (identity): identity is ProcessIdentity => identity !== undefined,
    );
    const processInspector = new LinuxProcessIdentityInspector();
    for (const identity of identities) {
      if (processes.some((candidate) => sameProcessIdentity(candidate.identity, identity))) continue;
      const observed = await processInspector.observe(identity.pid);
      processes.push({
        identity,
        alive: observed !== undefined && sameProcessIdentity(observed, identity),
      });
    }
  }
  return {
    sources,
    leases: world.candidates as readonly RecoveryLeaseCandidate[],
    actions,
    processes,
  };
}

function inspectState(store: SqliteStore, trackId: string) {
  const track = store.execution.getWriteTrack(trackId);
  const attempt = store.execution.getCurrentAttempt(trackId);
  const run = attempt === undefined ? undefined : store.execution.getCurrentWorkerRun(attempt.id);
  const lease = store.execution.getCurrentLease(trackId) ?? store.execution.getLatestLease(trackId);
  const claim = attempt === undefined ? undefined : store.execution.getCurrentClaim(attempt.id);
  return {
    track,
    attempt,
    run,
    lease,
    claim,
    eventTypes: store.listEvents().map((event) => event.type),
  };
}

async function driverMain(): Promise<void> {
  const operation = process.argv[3];
  const configPath = process.argv[4];
  const payloadText = process.argv[5] ?? '{}';
  if (operation === undefined || configPath === undefined) throw new Error('driver arguments are incomplete');
  const config = JSON.parse(readFileSync(configPath, 'utf8')) as DriverConfig;
  const payload = JSON.parse(payloadText) as DriverPayload;
  const store = SqliteStore.openCurrent(config.databasePath);
  try {
    if (operation === 'open-intent-crash') {
      await openTrack(config, store, { crashAfterIntent: true });
      return;
    }
    if (operation === 'open-physical-crash') {
      const existing = store.execution.getWriteTrack('WT-001');
      if (existing === undefined) await openTrack(config, store, { crashAfterPhysical: true });
      else {
        const attempt = store.execution.getCurrentAttempt(existing.id);
        if (attempt === undefined) throw new Error('attempt missing');
        await prepareSource(config, store, existing, attempt, true);
      }
      return;
    }
    if (operation === 'open-ready') {
      const existing = store.execution.getWriteTrack('WT-001');
      const result = existing === undefined
        ? await openTrack(config, store)
        : {
            track: existing,
            attempt: await prepareSource(
              config,
              store,
              existing,
              store.execution.getCurrentAttempt(existing.id) as Attempt,
              false,
            ),
          };
      process.stdout.write(`${JSON.stringify(result)}\n`);
      return;
    }
    if (operation === 'open-next-ready') {
      const featureQualifiedId = payload.featureQualifiedId ?? 'MIS-002/M01/F02';
      const result = await openTrack(config, store, { featureQualifiedId });
      process.stdout.write(`${JSON.stringify(result)}
`);
      return;
    }
    if (operation === 'grant' || operation === 'grant-commit-crash') {
      const trackId = payload.trackId ?? 'WT-001';
      const lease = await (await leaseService(config, store)).grant({
        writeTrackId: trackId,
        idempotencyKey: `task14:grant:${trackId}`,
        occurredAt: FIXED_TIME,
      });
      if (operation === 'grant-commit-crash') process.exit(84);
      process.stdout.write(`${JSON.stringify(lease)}\n`);
      return;
    }
    if (operation === 'release' || operation === 'release-commit-crash') {
      const leaseId = payload.leaseId ?? 'LSE-001';
      const lease = store.execution.getLease(leaseId);
      if (lease === undefined) throw new Error(`lease ${leaseId} missing`);
      const released = await (await leaseService(config, store)).release({
        leaseId,
        expectedLeaseVersion: payload.expectedLeaseVersion ?? lease.version,
        idempotencyKey: `task14:release:${leaseId}`,
        occurredAt: FIXED_TIME,
      });
      if (operation === 'release-commit-crash') process.exit(84);
      process.stdout.write(`${JSON.stringify(released)}\n`);
      return;
    }
    if (operation === 'recover') {
      const writeTrackId = payload.trackId;
      const report = await new RecoveryService({
        store,
        observations: {
          observe: async () => await recoveryWorld(config, store, writeTrackId),
        },
      }).recover(writeTrackId === undefined ? {} : { writeTrackId });
      process.stdout.write(`${JSON.stringify(report)}\n`);
      return;
    }
    if (operation === 'abandon') {
      const trackId = payload.trackId ?? 'WT-001';
      const track = store.execution.getWriteTrack(trackId);
      if (track === undefined) throw new Error('track missing');
      const abandoned = new ExecutionService({
        store,
        git: { requireCommit: () => ({ sha: config.baseCommitSha, objectFormat: 'sha1' }) },
      }).abandonWriteTrack({
        writeTrackId: track.id,
        expectedTrackVersion: track.version,
        observation: {
          sourcePreserved: true,
          evidencePreserved: true,
          worktreeState: 'ABSENT',
          unclassifiedWork: false,
        },
        occurredAt: FIXED_TIME,
      });
      process.stdout.write(`${JSON.stringify(abandoned)}\n`);
      return;
    }
    if (operation === 'open-run') {
      const trackId = payload.trackId ?? 'WT-001';
      const track = store.execution.getWriteTrack(trackId);
      const attempt = store.execution.getCurrentAttempt(trackId);
      if (track === undefined || attempt === undefined) throw new Error('lineage missing');
      const run = new ExecutionService({
        store,
        git: { requireCommit: () => ({ sha: config.baseCommitSha, objectFormat: 'sha1' }) },
      }).openWorkerRun({
        attemptId: attempt.id,
        contractHash: track.contractHash,
        occurredAt: FIXED_TIME,
      });
      process.stdout.write(`${JSON.stringify(run)}\n`);
      return;
    }
    if (operation === 'claim') {
      const trackId = payload.trackId ?? 'WT-001';
      const track = store.execution.getWriteTrack(trackId);
      const attempt = store.execution.getCurrentAttempt(trackId);
      const run = attempt === undefined ? undefined : store.execution.getCurrentWorkerRun(attempt.id);
      const lease = store.execution.getCurrentLease(trackId);
      if (track === undefined || attempt === undefined || run === undefined || lease === undefined) {
        throw new Error('claim lineage missing');
      }
      const gitInspector = inspector();
      const claim = new ClaimService({
        store,
        git: {
          requireTree: ({ sourcePath, sha, objectFormat }) => {
            const observed = spawnSync('git', ['-C', sourcePath, 'cat-file', '-t', sha], {
              encoding: 'utf8',
              shell: false,
              env: process.env,
            });
            if (observed.status !== 0 || observed.stdout.trim() !== 'tree') {
              throw new MnfsError('CLAIM_RESULT_TREE_INVALID', 'result is not a tree');
            }
            void gitInspector;
            return { sha, objectFormat, type: 'tree' };
          },
        },
      }).openClaim({
        writeTrackId: track.id,
        attemptId: attempt.id,
        workerRunId: run.id,
        leaseId: lease.id,
        expectedTrackVersion: track.version,
        expectedAttemptVersion: attempt.version,
        expectedRunVersion: run.version,
        expectedLeaseVersion: lease.version,
        idempotencyKey: `task14:claim:${track.id}`,
        baseCommitSha: attempt.baseCommitSha,
        resultTreeSha: config.resultTreeSha,
        claimedCriterionIds: [
          config.criterionIds[track.featureQualifiedId]
            ?? (() => { throw new Error(`criterion missing for ${track.featureQualifiedId}`); })(),
        ],
        occurredAt: FIXED_TIME,
      });
      process.stdout.write(`${JSON.stringify(claim)}\n`);
      return;
    }
    if (operation === 'inspect') {
      const trackId = payload.trackId ?? 'WT-001';
      process.stdout.write(`${JSON.stringify(inspectState(store, trackId))}\n`);
      return;
    }
    throw new Error(`unknown driver operation ${operation}`);
  } finally {
    store.close();
  }
}

if (DRIVER_MODE) {
  await driverMain();
} else {
  test('Scenario A recovers source intent and physical-before-semantic crashes in fresh processes', (t) => {
    const intentFixture = createFixture(t, 'source-intent');
    const intentCrash = runDriver(intentFixture, 'open-intent-crash');
    assert.equal(intentCrash.status, 71);
    const intentState = expectSuccess<{
      readonly eventTypes: readonly string[];
    }>(runDriver(intentFixture, 'inspect'));
    assert.equal(intentState.eventTypes.includes('EXECUTION_SOURCE_REQUESTED'), true);
    const intentRecovery = expectSuccess<{
      readonly findings: readonly { readonly code: string }[];
    }>(runDriver(intentFixture, 'recover', { trackId: 'WT-001' }));
    assert.equal(intentRecovery.findings.some((finding) => finding.code === 'SD-01'), true);
    const resumedIntent = expectSuccess<{
      readonly attempt: Attempt;
    }>(runDriver(intentFixture, 'open-ready'));
    assert.equal(resumedIntent.attempt.sourceStatus, 'READY');
    assert.equal(existsSync(resumedIntent.attempt.sourcePath as string), true);

    const physicalFixture = createFixture(t, 'source-physical');
    const physicalCrash = runDriver(physicalFixture, 'open-physical-crash');
    assert.equal(physicalCrash.status, 72);
    const beforeSemantic = expectSuccess<{
      readonly attempt: Attempt;
    }>(runDriver(physicalFixture, 'inspect'));
    assert.equal(beforeSemantic.attempt.sourceStatus, 'REQUESTED');
    const physicalRecovery = expectSuccess<{
      readonly findings: readonly { readonly code: string }[];
    }>(runDriver(physicalFixture, 'recover', { trackId: 'WT-001' }));
    assert.equal(physicalRecovery.findings.some((finding) => finding.code === 'SD-02'), true);
    const resumedPhysical = expectSuccess<{
      readonly attempt: Attempt;
    }>(runDriver(physicalFixture, 'open-ready'));
    assert.equal(resumedPhysical.attempt.sourceStatus, 'READY');
    assert.equal(git(resumedPhysical.attempt.sourcePath as string, ['remote']).length, 0);
    assert.equal(git(physicalFixture.config.canonicalRoot, ['status', '--porcelain']), '');
  });

  test('Scenario A fences token/helper/action crashes and converges without duplicate external acquisition', (t) => {
    const beforeStarted = createFixture(t, 'grant-before-started');
    expectSuccess(runDriver(beforeStarted, 'open-ready'));
    setCrashMode(beforeStarted, 'GRANT_BEFORE_STARTED');
    const tokenCrash = runDriver(beforeStarted, 'grant');
    assert.equal(tokenCrash.status, 81);
    assert.equal(readWorld(beforeStarted.config.worldPath).externalInvocations, 0);
    setCrashMode(beforeStarted, 'NONE');
    const tokenRecovered = expectSuccess<Lease>(runDriver(beforeStarted, 'grant'));
    assert.equal(tokenRecovered.status, 'ACTIVE');
    assert.equal(readWorld(beforeStarted.config.worldPath).externalInvocations, 1);

    const afterStarted = createFixture(t, 'grant-after-started');
    expectSuccess(runDriver(afterStarted, 'open-ready'));
    setCrashMode(afterStarted, 'GRANT_AFTER_STARTED');
    const startedCrash = runDriver(afterStarted, 'grant');
    assert.equal(startedCrash.status, 82);
    const startedReport = expectSuccess<{
      readonly findings: readonly { readonly code: string }[];
    }>(runDriver(afterStarted, 'recover', { trackId: 'WT-001' }));
    assert.equal(startedReport.findings.some((finding) => finding.code === 'LD-07'), true);
    setCrashMode(afterStarted, 'NONE');
    const noRepeat = runDriver(afterStarted, 'grant');
    assert.equal(noRepeat.status, 1);
    assert.match(noRepeat.stderr, /LEASE_ACTION_INCONCLUSIVE|LEASE_OPERATION_IN_PROGRESS/);
    assert.equal(readWorld(afterStarted.config.worldPath).externalInvocations, 0);

    const afterExternal = createFixture(t, 'grant-after-external');
    expectSuccess(runDriver(afterExternal, 'open-ready'));
    setCrashMode(afterExternal, 'GRANT_AFTER_EXTERNAL');
    const externalCrash = runDriver(afterExternal, 'grant');
    assert.equal(externalCrash.status, 83);
    assert.equal(readWorld(afterExternal.config.worldPath).externalInvocations, 1);
    const externalReport = expectSuccess<{
      readonly findings: readonly { readonly code: string }[];
    }>(runDriver(afterExternal, 'recover', { trackId: 'WT-001' }));
    assert.equal(externalReport.findings.some((finding) => finding.code === 'ADOPTABLE'), true);
    setCrashMode(afterExternal, 'NONE');
    const adopted = expectSuccess<Lease>(runDriver(afterExternal, 'grant'));
    assert.equal(adopted.status, 'ACTIVE');
    assert.equal(readWorld(afterExternal.config.worldPath).externalInvocations, 1);
  });

  test('Scenario A replays exact grant and release after process death following semantic commit', (t) => {
    const fixture = createFixture(t, 'semantic-commit');
    expectSuccess(runDriver(fixture, 'open-ready'));

    const grantCrash = runDriver(fixture, 'grant-commit-crash');
    assert.equal(grantCrash.status, 84);
    const grantedState = expectSuccess<{ readonly lease: Lease }>(runDriver(fixture, 'inspect'));
    assert.equal(grantedState.lease.status, 'ACTIVE');
    assert.equal(readWorld(fixture.config.worldPath).externalInvocations, 1);
    const active = expectSuccess<Lease>(runDriver(fixture, 'grant'));
    assert.equal(active.id, grantedState.lease.id);
    assert.equal(active.status, 'ACTIVE');
    assert.equal(readWorld(fixture.config.worldPath).externalInvocations, 1);

    const releaseCrash = runDriver(fixture, 'release-commit-crash', {
      leaseId: active.id,
      expectedLeaseVersion: active.version,
    });
    assert.equal(releaseCrash.status, 84);
    const releasedState = expectSuccess<{ readonly lease: Lease }>(runDriver(fixture, 'inspect'));
    assert.equal(releasedState.lease.status, 'RELEASED');
    assert.equal(readWorld(fixture.config.worldPath).externalInvocations, 2);
    const replayed = expectSuccess<Lease>(runDriver(fixture, 'release', {
      leaseId: active.id,
      expectedLeaseVersion: active.version,
    }));
    assert.equal(replayed.id, releasedState.lease.id);
    assert.equal(replayed.status, 'RELEASED');
    assert.equal(readWorld(fixture.config.worldPath).externalInvocations, 2);
  });

  test('Scenario A recovers a RELEASE_PENDING crash before helper STARTED under the same fence', (t) => {
    const fixture = createFixture(t, 'release-pending');
    expectSuccess(runDriver(fixture, 'open-ready'));
    const active = expectSuccess<Lease>(runDriver(fixture, 'grant'));
    assert.equal(active.status, 'ACTIVE');

    setCrashMode(fixture, 'RELEASE_BEFORE_STARTED');
    const releaseCrash = runDriver(fixture, 'release', {
      leaseId: active.id,
      expectedLeaseVersion: active.version,
    });
    assert.equal(releaseCrash.status, 81);
    const pending = expectSuccess<{
      readonly lease: Lease;
    }>(runDriver(fixture, 'inspect'));
    assert.equal(pending.lease.status, 'RELEASE_PENDING');
    assert.equal(pending.lease.actionPhase, 'CLAIMED');
    assert.equal(readWorld(fixture.config.worldPath).externalInvocations, 1);

    const report = expectSuccess<{
      readonly findings: readonly { readonly code: string }[];
    }>(runDriver(fixture, 'recover', { trackId: 'WT-001' }));
    assert.equal(report.findings.some((finding) => finding.code === 'LD-07'), true);

    setCrashMode(fixture, 'NONE');
    const released = expectSuccess<Lease>(runDriver(fixture, 'release', {
      leaseId: active.id,
      expectedLeaseVersion: active.version,
    }));
    assert.equal(released.status, 'RELEASED');
    assert.equal(readWorld(fixture.config.worldPath).externalInvocations, 2);
  });

  test('Scenario A retries a STARTED release only under its exact persisted fence', (t) => {
    const fixture = createFixture(t, 'release-started');
    expectSuccess(runDriver(fixture, 'open-ready'));
    const active = expectSuccess<Lease>(runDriver(fixture, 'grant'));
    assert.equal(active.status, 'ACTIVE');

    setCrashMode(fixture, 'RELEASE_AFTER_STARTED');
    const startedCrash = runDriver(fixture, 'release', {
      leaseId: active.id,
      expectedLeaseVersion: active.version,
    });
    assert.equal(startedCrash.status, 82);
    assert.equal(readWorld(fixture.config.worldPath).externalInvocations, 1);
    const startedReport = expectSuccess<{
      readonly findings: readonly { readonly code: string }[];
    }>(runDriver(fixture, 'recover', { trackId: 'WT-001' }));
    assert.equal(startedReport.findings.some((finding) => finding.code === 'LD-07'), true);

    setCrashMode(fixture, 'NONE');
    const released = expectSuccess<Lease>(runDriver(fixture, 'release', {
      leaseId: active.id,
      expectedLeaseVersion: active.version,
    }));
    assert.equal(released.status, 'RELEASED');
    assert.equal(readWorld(fixture.config.worldPath).externalInvocations, 2);
  });

  test('Scenario A performs fenced release, recovers physical-before-semantic completion, abandons and replays', (t) => {
    const fixture = createFixture(t, 'release');
    expectSuccess(runDriver(fixture, 'open-ready'));
    const active = expectSuccess<Lease>(runDriver(fixture, 'grant'));
    assert.equal(active.status, 'ACTIVE');

    setCrashMode(fixture, 'RELEASE_AFTER_EXTERNAL');
    const releaseCrash = runDriver(fixture, 'release', {
      leaseId: active.id,
      expectedLeaseVersion: active.version,
    });
    assert.equal(releaseCrash.status, 83);
    const recovery = expectSuccess<{
      readonly findings: readonly { readonly code: string }[];
    }>(runDriver(fixture, 'recover', { trackId: 'WT-001' }));
    assert.equal(recovery.findings.some((finding) => finding.code === 'ADOPTABLE'), true);

    setCrashMode(fixture, 'NONE');
    const released = expectSuccess<Lease>(runDriver(fixture, 'release', {
      leaseId: active.id,
      expectedLeaseVersion: active.version,
    }));
    assert.equal(released.status, 'RELEASED');
    const abandoned = expectSuccess<WriteTrack>(runDriver(fixture, 'abandon'));
    assert.equal(abandoned.status, 'ABANDONED');
    const replayed = expectSuccess<Lease>(runDriver(fixture, 'release', {
      leaseId: released.id,
      expectedLeaseVersion: active.version,
    }));
    assert.equal(replayed.id, released.id);
    assert.equal(replayed.status, 'RELEASED');
    const final = expectSuccess<{
      readonly findings: readonly { readonly code: string }[];
    }>(runDriver(fixture, 'recover', { trackId: 'WT-001' }));
    assert.deepEqual(final.findings.map((finding) => finding.code), ['HEALTHY']);
  });

  test('Scenario B opens the next global Track and preserves its exact Run/Lease/Claim lineage for M02', (t) => {
    const fixture = createFixture(t, 'claim');

    const first = expectSuccess<{ readonly track: WriteTrack; readonly attempt: Attempt }>(
      runDriver(fixture, 'open-ready'),
    );
    assert.equal(first.track.id, 'WT-001');
    assert.equal(first.attempt.id, 'WT-001/A01');
    const firstLease = expectSuccess<Lease>(
      runDriver(fixture, 'grant', { trackId: first.track.id }),
    );
    assert.equal(firstLease.id, 'LSE-001');
    const firstReleased = expectSuccess<Lease>(runDriver(fixture, 'release', {
      leaseId: firstLease.id,
      expectedLeaseVersion: firstLease.version,
    }));
    assert.equal(firstReleased.status, 'RELEASED');
    const firstAbandoned = expectSuccess<WriteTrack>(
      runDriver(fixture, 'abandon', { trackId: first.track.id }),
    );
    assert.equal(firstAbandoned.status, 'ABANDONED');

    if (firstReleased.worktreePath !== undefined) {
      rmSync(firstReleased.worktreePath, { recursive: true, force: true });
    }
    updateWorld(fixture.config.worldPath, (world) => ({ ...world, candidates: [] }));

    const opened = expectSuccess<{ readonly track: WriteTrack; readonly attempt: Attempt }>(
      runDriver(fixture, 'open-next-ready', { featureQualifiedId: 'MIS-002/M01/F02' }),
    );
    assert.equal(opened.track.id, 'WT-002');
    assert.equal(opened.attempt.id, 'WT-002/A01');
    const lease = expectSuccess<Lease>(runDriver(fixture, 'grant', { trackId: opened.track.id }));
    assert.equal(lease.id, 'LSE-002');
    assert.equal(lease.status, 'ACTIVE');
    const run = expectSuccess<{ readonly id: string }>(
      runDriver(fixture, 'open-run', { trackId: opened.track.id }),
    );
    const claim = expectSuccess<{ readonly id: string; readonly status: string }>(
      runDriver(fixture, 'claim', { trackId: opened.track.id }),
    );
    assert.equal(claim.status, 'OPEN');

    const report = expectSuccess<{
      readonly findings: readonly { readonly code: string }[];
    }>(runDriver(fixture, 'recover', { trackId: opened.track.id }));
    assert.deepEqual(report.findings.map((finding) => finding.code), ['HEALTHY']);
    const state = expectSuccess<{
      readonly track: WriteTrack;
      readonly attempt: Attempt;
      readonly run: { readonly id: string };
      readonly lease: Lease;
      readonly claim: { readonly id: string; readonly status: string };
    }>(runDriver(fixture, 'inspect', { trackId: opened.track.id }));
    assert.equal(state.track.status, 'CLAIMED');
    assert.equal(state.attempt.id, opened.attempt.id);
    assert.equal(state.run.id, run.id);
    assert.equal(state.lease.id, lease.id);
    assert.equal(state.claim.id, claim.id);
    assert.equal(state.claim.status, 'OPEN');
    const leasedCandidates = readWorld(fixture.config.worldPath).candidates
      .filter((candidate) => candidate.status === 'leased');
    assert.equal(leasedCandidates.length, 1);
    assert.equal(leasedCandidates[0]?.leaseId, lease.externalLeaseId);
    assert.equal(readWorld(fixture.config.worldPath).externalInvocations, 3);
    assert.equal(git(opened.attempt.sourcePath as string, ['remote']), '');
    assert.equal(git(opened.attempt.sourcePath as string, ['rev-parse', 'HEAD']), fixture.config.baseCommitSha);
    assert.equal(git(fixture.config.canonicalRoot, ['status', '--porcelain']), '');

    const database = new DatabaseSync(fixture.config.databasePath, { readOnly: true });
    try {
      const counts = database.prepare(`
        SELECT
          (SELECT COUNT(*) FROM write_tracks WHERE id = 'WT-002' AND status IN ('ACTIVE', 'CLAIMED')) AS tracks,
          (SELECT COUNT(*) FROM attempts WHERE write_track_id = 'WT-002' AND status = 'OPEN') AS attempts,
          (SELECT COUNT(*) FROM worker_runs WHERE attempt_id = 'WT-002/A01' AND status IN ('STARTING', 'RUNNING', 'IDLE')) AS runs,
          (SELECT COUNT(*) FROM leases WHERE write_track_id = 'WT-002' AND status IN ('REQUESTED', 'ACTIVE', 'RELEASE_PENDING', 'DIVERGED')) AS leases,
          (SELECT COUNT(*) FROM claims WHERE attempt_id = 'WT-002/A01' AND status IN ('OPEN', 'COMPLETED_BY_WORKER', 'UNDER_VERIFICATION')) AS claims
      `).get() as Record<string, number>;
      assert.deepEqual({
        tracks: Number(counts.tracks),
        attempts: Number(counts.attempts),
        runs: Number(counts.runs),
        leases: Number(counts.leases),
        claims: Number(counts.claims),
      }, { tracks: 1, attempts: 1, runs: 1, leases: 1, claims: 1 });
    } finally {
      database.close();
    }
  });
}
