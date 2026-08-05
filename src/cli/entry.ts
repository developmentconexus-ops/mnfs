import { createHash } from 'node:crypto';
import { accessSync, constants, existsSync } from 'node:fs';
import {
  lstat,
  mkdir,
  readFile,
  realpath,
  writeFile,
} from 'node:fs/promises';
import { homedir, release } from 'node:os';
import { delimiter, dirname, join } from 'node:path';

import { ExecutionSourceAdapter } from '../adapters/execution-source.js';
import { GitWorktreeInspector } from '../adapters/git-worktree.js';
import { openLavishPlan, pollLavishPlan } from '../adapters/lavish.js';
import {
  LinuxProcessIdentityInspector,
  sameProcessIdentity,
} from '../adapters/process-identity.js';
import {
  TREEHOUSE_COMMAND_SHAPE_SHA256,
  TreehouseAdapter,
  type TreehouseBoundary,
} from '../adapters/treehouse.js';
import { MnfsError } from '../domain/errors.js';
import type { ProjectIdentity } from '../domain/types.js';
import type {
  Attempt,
  Lease,
  ProcessIdentity,
  WriteTrack,
} from '../execution/model.js';
import { inspectEnvironment } from '../runtime/environment.js';
import {
  leaseActionFileExists,
  publishLeaseActionOperation,
  readLeaseActionFinished,
  readLeaseActionOperation,
  readLeaseActionStarted,
  type LeaseActionOperation,
} from '../runtime/lease-action-protocol.js';
import { LeaseActionRunner } from '../runtime/lease-action-runner.js';
import {
  resolveExecutionAttemptRuntimePaths,
  resolveLeaseActionRoot,
  resolveMissionPlanHtmlPath,
  resolveMissionPlanReviewPath,
  resolveRuntimeRoot,
} from '../runtime/paths.js';
import { runProcess } from '../runtime/process-runner.js';
import { ExecutionService } from '../services/execution-service.js';
import {
  LeaseService,
  type LeaseActionAuthority,
  type LeasePhysicalAuthority,
  type PhysicalLeaseCandidate,
  type PhysicalSourceObservation,
} from '../services/lease-service.js';
import { MissionPlanService } from '../services/mission-plan-service.js';
import { MissionService } from '../services/mission-service.js';
import { initializeProject, loadProject } from '../services/project-service.js';
import {
  RecoveryService,
  type RecoveryActionCandidate,
  type RecoveryLeaseCandidate,
  type RecoveryProcessCandidate,
  type RecoverySourceObservation,
  type RecoveryWorldObservation,
} from '../services/recovery-service.js';
import { ensureDatabaseReady } from '../store/sqlite-maintenance.js';
import { SqliteStore } from '../store/sqlite-store.js';
import {
  runCli,
  type InitializedProjectView,
  type RecoverCommandInput,
  type WriteTrackView,
} from './main.js';

const ACCEPTED_TREEHOUSE = Object.freeze({
  executableSha256: 'sha256:c0b45a6b7cd7ee5b79bd614136847d84b4c6c3fc8dbe0fd80b71703b7a102cf3',
  semanticVersion: '2.1.1' as const,
  commandShapeSha256: TREEHOUSE_COMMAND_SHAPE_SHA256,
  nodeVersion: 'v24.18.0',
  gitVersion: '2.53.0',
  kernelRelease: '6.18.33.2-microsoft-standard-WSL2',
  ubuntuRelease: '26.04',
});
const TREEHOUSE_TIMEOUT_MS = 30_000;
const TREEHOUSE_OUTPUT_LIMIT_BYTES = 65_536;

function now(): string {
  return new Date().toISOString();
}

function findExecutable(name: string): string | null {
  for (const directory of (process.env.PATH ?? '').split(delimiter)) {
    if (!directory) continue;
    const candidate = join(directory, name);
    try {
      accessSync(candidate, constants.X_OK);
      return candidate;
    } catch {
      // Search the next PATH entry.
    }
  }
  return null;
}

function requireExecutable(name: string): string {
  const executable = findExecutable(name);
  if (executable === null) {
    throw new MnfsError('TREEHOUSE_NOT_FOUND', `Required executable ${name} was not found.`);
  }
  return executable;
}

function processEnvironment(): Readonly<Record<string, string>> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (value !== undefined) result[key] = value;
  }
  return Object.freeze(result);
}

async function fileSha256(filePath: string): Promise<string> {
  return `sha256:${createHash('sha256').update(await readFile(filePath)).digest('hex')}`;
}

function runtimeRoot(identity: ProjectIdentity): string {
  return resolveRuntimeRoot({
    repoId: identity.repoId,
    env: process.env,
    homeDir: homedir(),
  });
}

function withMissionService<T>(operation: (service: MissionService) => T): T {
  const identity = loadProject(process.cwd());
  const store = SqliteStore.open(join(runtimeRoot(identity), 'mnfs.db'));
  try {
    return operation(new MissionService(store));
  } finally {
    store.close();
  }
}

async function withMissionPlanService<T>(
  operation: (service: MissionPlanService, runtimeRoot: string) => T | Promise<T>,
): Promise<T> {
  const identity = loadProject(process.cwd());
  const root = runtimeRoot(identity);
  const store = SqliteStore.open(join(root, 'mnfs.db'));
  try {
    return await operation(new MissionPlanService({
      store,
      projectRoot: identity.projectRoot,
      runtimeRoot: root,
    }), root);
  } finally {
    store.close();
  }
}

interface ExecutionContext {
  readonly identity: ProjectIdentity;
  readonly runtimeRoot: string;
  readonly store: SqliteStore;
  readonly processIdentity: ProcessIdentity;
  readonly processInspector: LinuxProcessIdentityInspector;
}

async function currentProcessIdentity(
  inspector: LinuxProcessIdentityInspector,
): Promise<ProcessIdentity> {
  const observed = await inspector.observe(process.pid);
  if (observed === undefined) {
    throw new MnfsError('INTERNAL_ERROR', 'The current Linux process identity is unavailable.');
  }
  return observed;
}

async function withExecutionStore<T>(
  writeMode: boolean,
  operation: (context: ExecutionContext) => T | Promise<T>,
): Promise<T> {
  const identity = loadProject(process.cwd());
  const root = runtimeRoot(identity);
  const databasePath = join(root, 'mnfs.db');
  const processInspector = new LinuxProcessIdentityInspector();
  const processIdentity = await currentProcessIdentity(processInspector);

  await ensureDatabaseReady({
    databasePath,
    writeMode,
    processIdentity,
    now: now(),
  });
  const store = SqliteStore.openCurrent(databasePath);
  try {
    return await operation({
      identity,
      runtimeRoot: root,
      store,
      processIdentity,
      processInspector,
    });
  } finally {
    store.close();
  }
}

function gitInspector(): GitWorktreeInspector {
  return new GitWorktreeInspector({
    gitExecutable: requireExecutable('git'),
    runProcess,
    environment: processEnvironment(),
  });
}

function sourceAdapter(
  context: ExecutionContext,
  inspector: GitWorktreeInspector,
): ExecutionSourceAdapter {
  return new ExecutionSourceAdapter({
    runtimeRoot: context.runtimeRoot,
    gitExecutable: requireExecutable('git'),
    runProcess,
    gitInspector: inspector,
    environment: processEnvironment(),
  });
}

function sourceEventId(attemptId: string, suffix: string): string {
  return `EVT-${attemptId.replaceAll('/', '-')}-SOURCE-${suffix}`;
}

function appendSourceRequested(
  context: ExecutionContext,
  track: WriteTrack,
  attempt: Attempt,
  occurredAt: string,
): void {
  const eventId = sourceEventId(attempt.id, 'REQUESTED');
  if (context.store.listEvents().some((event) => event.eventId === eventId)) return;
  context.store.execution.runAtomic((session) => {
    session.appendEvent({
      eventId,
      type: 'EXECUTION_SOURCE_REQUESTED',
      payloadSchemaVersion: 1,
      missionId: track.missionId,
      occurredAt,
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

async function prepareOpenedAttempt(
  context: ExecutionContext,
  track: WriteTrack,
  attempt: Attempt,
  inspector: GitWorktreeInspector,
  occurredAt: string,
): Promise<Attempt> {
  if (attempt.sourceStatus === 'DIVERGED') {
    throw new MnfsError('EXECUTION_SOURCE_CHANGED', `Attempt ${attempt.id} source is DIVERGED.`);
  }
  appendSourceRequested(context, track, attempt, occurredAt);
  const prepared = await sourceAdapter(context, inspector).prepare({
    repositoryId: context.identity.repoId,
    trackId: track.id,
    attemptId: attempt.id,
    canonicalCheckoutPath: context.identity.projectRoot,
    baseCommitSha: attempt.baseCommitSha,
    gitObjectFormat: attempt.gitObjectFormat,
  });

  return context.store.execution.runAtomic((session) => {
    const current = context.store.execution.getAttempt(attempt.id);
    if (current === undefined || current.writeTrackId !== track.id) {
      throw new MnfsError('ATTEMPT_CONFLICT', `Attempt ${attempt.id} lineage changed during source preparation.`);
    }

    if (prepared.status === 'READY') {
      if (
        current.sourceStatus === 'READY'
        && current.sourcePath === prepared.sourcePath
        && current.sourceFingerprint === prepared.fingerprint
      ) return current;
      if (current.sourceStatus !== 'REQUESTED') {
        throw new MnfsError('ATTEMPT_CONFLICT', `Attempt ${attempt.id} cannot become READY from ${current.sourceStatus}.`);
      }
      const ready = session.setAttemptState({
        id: current.id,
        expectedVersion: current.version,
        status: current.status,
        sourceStatus: 'READY',
        sourcePath: prepared.sourcePath,
        sourceFingerprint: prepared.fingerprint,
        updatedAt: occurredAt,
      });
      session.appendEvent({
        eventId: sourceEventId(attempt.id, 'READY'),
        type: 'EXECUTION_SOURCE_READY',
        payloadSchemaVersion: 1,
        missionId: track.missionId,
        occurredAt,
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
    }

    if (current.sourceStatus !== 'DIVERGED') {
      const diverged = session.setAttemptState({
        id: current.id,
        expectedVersion: current.version,
        status: current.status,
        sourceStatus: 'DIVERGED',
        sourcePath: prepared.sourcePath,
        updatedAt: occurredAt,
      });
      session.appendEvent({
        eventId: sourceEventId(attempt.id, 'DIVERGED'),
        type: 'EXECUTION_SOURCE_DIVERGED',
        payloadSchemaVersion: 1,
        missionId: track.missionId,
        occurredAt,
        payload: {
          writeTrackId: track.id,
          attemptId: diverged.id,
          sourcePath: prepared.sourcePath,
          reasonCode: prepared.reasonCode,
        },
      });
    }
    throw new MnfsError(prepared.reasonCode, `Attempt ${attempt.id} source diverged during preparation.`);
  });
}

async function openWriteTrack(
  input: Parameters<NonNullable<Parameters<typeof runCli>[1]['openWriteTrack']>>[0],
): Promise<Readonly<{ track: WriteTrack; attempt: Attempt }>> {
  return await withExecutionStore(true, async (context) => {
    const inspector = gitInspector();
    const commit = await inspector.requireCommit(context.identity.projectRoot, input.baseCommitSha);
    const service = new ExecutionService({
      store: context.store,
      git: {
        requireCommit: (sha) => {
          if (sha !== commit.sha) {
            throw new MnfsError('GIT_OBJECT_INVALID', 'The requested base changed after Git observation.');
          }
          return commit;
        },
      },
    });
    const occurredAt = now();
    const opened = service.openWriteTrack({ ...input, occurredAt });
    const attempt = await prepareOpenedAttempt(
      context,
      opened.track,
      opened.attempt,
      inspector,
      occurredAt,
    );
    return { track: opened.track, attempt };
  });
}

function requireTrackVersion(track: WriteTrack | undefined, expectedVersion: number): WriteTrack {
  if (track === undefined) throw new MnfsError('WRITE_TRACK_CONFLICT', 'Write Track was not found.');
  if (track.version !== expectedVersion) {
    throw new MnfsError('CONCURRENCY_CONFLICT', `Stale Write Track version for ${track.id}.`);
  }
  return track;
}

async function showWriteTrack(writeTrackId: string): Promise<WriteTrackView> {
  return await withExecutionStore(false, (context) => {
    const track = context.store.execution.getWriteTrack(writeTrackId);
    if (track === undefined) {
      throw new MnfsError('WRITE_TRACK_CONFLICT', `Write Track ${writeTrackId} was not found.`);
    }
    const attempt = context.store.execution.getCurrentAttempt(track.id);
    const lease = context.store.execution.getCurrentLease(track.id)
      ?? context.store.execution.getLatestLease(track.id);
    return {
      track,
      ...(attempt === undefined ? {} : { attempt }),
      ...(lease === undefined ? {} : { lease }),
    };
  });
}

async function abandonWriteTrack(input: Readonly<{
  writeTrackId: string;
  expectedTrackVersion: number;
}>): Promise<WriteTrack> {
  return await withExecutionStore(true, (context) => {
    const track = requireTrackVersion(
      context.store.execution.getWriteTrack(input.writeTrackId),
      input.expectedTrackVersion,
    );
    const attempt = context.store.execution.getCurrentAttempt(track.id);
    const lease = context.store.execution.getCurrentLease(track.id);
    const run = attempt === undefined
      ? undefined
      : context.store.execution.getCurrentWorkerRun(attempt.id);
    const claim = attempt === undefined
      ? undefined
      : context.store.execution.getCurrentClaim(attempt.id);
    const service = new ExecutionService({
      store: context.store,
      git: {
        requireCommit: () => {
          throw new MnfsError('INTERNAL_ERROR', 'Track abandonment must not inspect a new Git base.');
        },
      },
    });
    return service.abandonWriteTrack({
      ...input,
      observation: {
        sourcePreserved: attempt?.sourceStatus !== 'DIVERGED',
        evidencePreserved: true,
        worktreeState: lease === undefined || lease.status === 'RELEASED' ? 'ABSENT' : 'UNKNOWN',
        unclassifiedWork: run !== undefined || claim !== undefined,
      },
      occurredAt: now(),
    });
  });
}

async function ensureCanonicalDirectory(directoryPath: string): Promise<void> {
  await mkdir(directoryPath, { recursive: true, mode: 0o700 });
  const [metadata, canonical] = await Promise.all([lstat(directoryPath), realpath(directoryPath)]);
  if (!metadata.isDirectory() || metadata.isSymbolicLink() || canonical !== directoryPath) {
    throw new MnfsError('TREEHOUSE_OBSERVATION_CONFLICT', `Unsafe Treehouse directory: ${directoryPath}.`);
  }
}

async function ensureTreehouseControl(boundary: TreehouseBoundary): Promise<void> {
  await ensureCanonicalDirectory(boundary.homePath);
  await ensureCanonicalDirectory(boundary.xdgConfigHome);
  await ensureCanonicalDirectory(boundary.poolRoot);
  await ensureCanonicalDirectory(boundary.hooksPath);
  const configDirectory = join(boundary.xdgConfigHome, 'treehouse');
  await ensureCanonicalDirectory(configDirectory);
  const configPath = join(configDirectory, 'config.toml');
  const expected = `max_trees = 2\nroot = ${JSON.stringify(boundary.poolRoot)}\n`;
  try {
    await writeFile(configPath, expected, { encoding: 'utf8', flag: 'wx', mode: 0o600 });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
    const existing = await readFile(configPath, 'utf8');
    if (existing !== expected) {
      throw new MnfsError(
        'TREEHOUSE_OBSERVATION_CONFLICT',
        'Existing Treehouse control configuration differs from the accepted pool binding.',
      );
    }
  }
}

interface AttemptPhysicalRuntime {
  readonly boundary: TreehouseBoundary;
  readonly source: PhysicalSourceObservation;
  readonly inspector: GitWorktreeInspector;
  readonly adapter: TreehouseAdapter;
}

async function attemptPhysicalRuntime(
  context: ExecutionContext,
  track: WriteTrack,
  attempt: Attempt,
  createControl: boolean,
): Promise<AttemptPhysicalRuntime> {
  if (
    attempt.sourceStatus !== 'READY'
    || attempt.sourcePath === undefined
    || attempt.sourceFingerprint === undefined
  ) {
    throw new MnfsError('EXECUTION_SOURCE_CHANGED', `Attempt ${attempt.id} has no READY source.`);
  }
  const inspector = gitInspector();
  const prepared = await sourceAdapter(context, inspector).prepare({
    repositoryId: context.identity.repoId,
    trackId: track.id,
    attemptId: attempt.id,
    canonicalCheckoutPath: context.identity.projectRoot,
    baseCommitSha: attempt.baseCommitSha,
    gitObjectFormat: attempt.gitObjectFormat,
  });
  if (
    prepared.status !== 'READY'
    || prepared.sourcePath !== attempt.sourcePath
    || prepared.fingerprint !== attempt.sourceFingerprint
  ) {
    throw new MnfsError('EXECUTION_SOURCE_CHANGED', `Attempt ${attempt.id} source changed after READY.`);
  }
  const paths = resolveExecutionAttemptRuntimePaths(
    context.runtimeRoot,
    track.id,
    attempt.id,
  );
  const boundary: TreehouseBoundary = {
    sourcePath: prepared.sourcePath,
    canonicalCheckoutPath: context.identity.projectRoot,
    homePath: paths.homePath,
    xdgConfigHome: paths.xdgConfigHome,
    poolRoot: paths.poolRoot,
    hooksPath: paths.hooksPath,
    readySource: {
      fingerprint: prepared.fingerprint,
      baseCommitSha: attempt.baseCommitSha,
      baseTreeSha: prepared.observation.headTreeSha,
      objectFormat: attempt.gitObjectFormat,
    },
  };
  if (createControl) await ensureTreehouseControl(boundary);

  const adapter = new TreehouseAdapter({
    acceptedCandidate: ACCEPTED_TREEHOUSE,
    runProcess,
    resolveExecutable: async (name) => await realpath(requireExecutable(name)),
    hashFile: fileSha256,
    readTextFile: async (filePath) => await readFile(filePath, 'utf8'),
    realpath,
    nodeVersion: () => process.version,
    osReleasePath: '/etc/os-release',
    environment: processEnvironment(),
    gitInspector: inspector,
    sourceIntegrity: {
      observeReadySource: async () => {
        const observed = await sourceAdapter(context, inspector).prepare({
          repositoryId: context.identity.repoId,
          trackId: track.id,
          attemptId: attempt.id,
          canonicalCheckoutPath: context.identity.projectRoot,
          baseCommitSha: attempt.baseCommitSha,
          gitObjectFormat: attempt.gitObjectFormat,
        });
        if (observed.status !== 'READY') {
          throw new MnfsError(observed.reasonCode, 'READY-source integrity observation diverged.');
        }
        return {
          status: 'READY' as const,
          sourcePath: observed.sourcePath,
          fingerprint: observed.fingerprint,
          observation: observed.observation,
        };
      },
    },
  });

  return {
    boundary,
    source: {
      status: 'READY',
      path: prepared.sourcePath,
      fingerprint: prepared.fingerprint,
      baseCommitSha: attempt.baseCommitSha,
      baseTreeSha: prepared.observation.headTreeSha,
      objectFormat: attempt.gitObjectFormat,
    },
    inspector,
    adapter,
  };
}

async function treehouseCandidates(
  runtime: AttemptPhysicalRuntime,
  lease?: Lease,
): Promise<readonly PhysicalLeaseCandidate[]> {
  const status = await runtime.adapter.status({ boundary: runtime.boundary });
  const candidates: PhysicalLeaseCandidate[] = [];
  for (const item of status) {
    let gitStatus: PhysicalLeaseCandidate['gitStatus'] = 'UNKNOWN';
    try {
      const repository = await runtime.inspector.observeRepository(item.path);
      gitStatus = repository.statusPorcelainV1Z.length === 0 ? 'CLEAN' : 'DIRTY';
    } catch {
      gitStatus = 'UNKNOWN';
    }
    candidates.push({
      path: item.path,
      managed: true,
      sourcePath: runtime.source.path,
      status: item.status,
      gitStatus,
      ...(item.leaseId === undefined ? {} : { leaseId: item.leaseId }),
      ...(item.leaseHolder === undefined ? {} : { holder: item.leaseHolder }),
      ...(item.leasedAt === undefined ? {} : { leasedAt: item.leasedAt }),
    });
  }
  if (
    lease?.worktreePath !== undefined
    && !candidates.some((candidate) => candidate.path === lease.worktreePath)
  ) {
    candidates.push({
      path: lease.worktreePath,
      managed: false,
      sourcePath: runtime.source.path,
      status: 'missing',
      gitStatus: 'UNKNOWN',
      ...(lease.externalLeaseId === undefined ? {} : { leaseId: lease.externalLeaseId }),
      holder: lease.holder,
      ...(lease.externalLeasedAt === undefined ? {} : { leasedAt: lease.externalLeasedAt }),
    });
  }
  return candidates;
}

function operationEnvironment(
  treehouseExecutable: string,
  gitExecutable: string,
  boundary: TreehouseBoundary,
): Readonly<Record<string, string>> {
  return Object.freeze({
    PATH: `${dirname(treehouseExecutable)}:${dirname(gitExecutable)}:/usr/bin:/bin`,
    HOME: boundary.homePath,
    XDG_CONFIG_HOME: boundary.xdgConfigHome,
    LANG: 'C.UTF-8',
    LC_ALL: 'C.UTF-8',
    GIT_CONFIG_GLOBAL: '/dev/null',
    GIT_CONFIG_NOSYSTEM: '1',
    GIT_TERMINAL_PROMPT: '0',
    GIT_OPTIONAL_LOCKS: '0',
    GIT_NO_LAZY_FETCH: '1',
    GCM_INTERACTIVE: 'Never',
    TREEHOUSE_NO_UPDATE_CHECK: '1',
    GIT_CONFIG_COUNT: '3',
    GIT_CONFIG_KEY_0: 'core.hooksPath',
    GIT_CONFIG_VALUE_0: boundary.hooksPath,
    GIT_CONFIG_KEY_1: 'credential.helper',
    GIT_CONFIG_VALUE_1: '',
    GIT_CONFIG_KEY_2: 'core.fsmonitor',
    GIT_CONFIG_VALUE_2: 'false',
  });
}

function actionPaths(actionRoot: string, actionToken: string): Readonly<{
  tokenRoot: string;
  operationPath: string;
  startedPath: string;
  resultPath: string;
}> {
  const tokenRoot = join(actionRoot, actionToken);
  return {
    tokenRoot,
    operationPath: join(tokenRoot, 'operation.json'),
    startedPath: join(tokenRoot, 'started.json'),
    resultPath: join(tokenRoot, 'finished.json'),
  };
}

function createActionAuthority(
  context: ExecutionContext,
  actionRoot: string,
): LeaseActionAuthority {
  const runner = new LeaseActionRunner({
    runProcess,
    observeProcessIdentity: async (pid) => await context.processInspector.observe(pid),
    now,
  });

  return {
    observe: async (actionToken) => {
      const paths = actionPaths(actionRoot, actionToken);
      if (!existsSync(paths.tokenRoot) || !existsSync(paths.operationPath)) return { state: 'ABSENT' };
      try {
        const operationSha256 = await fileSha256(paths.operationPath);
        const operation = await readLeaseActionOperation({
          actionRoot,
          operationPath: paths.operationPath,
          expectedActionToken: actionToken,
          expectedOperationSha256: operationSha256,
        });
        if (!await leaseActionFileExists(actionRoot, operation.operation.startedPath)) {
          return { state: 'ABSENT' };
        }
        const started = await readLeaseActionStarted({
          actionRoot,
          startedPath: operation.operation.startedPath,
          expectedActionToken: actionToken,
          expectedOperationSha256: operationSha256,
        });
        if (!await leaseActionFileExists(actionRoot, operation.operation.resultPath)) {
          return {
            state: 'STARTED',
            runner: started.started.runner,
            startedRef: operation.operation.startedPath,
          };
        }
        const finished = await readLeaseActionFinished({
          actionRoot,
          resultPath: operation.operation.resultPath,
          expectedActionToken: actionToken,
          expectedOperationSha256: operationSha256,
          expectedStartedSha256: started.startedSha256,
          stdoutLimitBytes: operation.operation.stdoutLimitBytes,
          stderrLimitBytes: operation.operation.stderrLimitBytes,
        });
        return {
          state: 'FINISHED',
          runner: finished.finished.runner,
          startedRef: operation.operation.startedPath,
          resultRef: operation.operation.resultPath,
        };
      } catch {
        return { state: 'CONFLICT' };
      }
    },
    launch: async (input) => {
      const lease = context.store.execution.getLease(input.leaseId);
      if (lease === undefined) throw new MnfsError('LEASE_CONFLICT', `Lease ${input.leaseId} disappeared.`);
      const track = context.store.execution.getWriteTrack(lease.writeTrackId);
      const attempt = context.store.execution.getAttempt(lease.attemptId);
      if (track === undefined || attempt === undefined) {
        throw new MnfsError('LEASE_CONFLICT', 'Lease launch lineage is missing.');
      }
      const physical = await attemptPhysicalRuntime(context, track, attempt, true);
      await physical.adapter.status({ boundary: physical.boundary });
      const treehouseExecutable = await realpath(requireExecutable('treehouse'));
      const gitExecutable = await realpath(requireExecutable('git'));
      if (await fileSha256(treehouseExecutable) !== ACCEPTED_TREEHOUSE.executableSha256) {
        throw new MnfsError('TREEHOUSE_VERSION_UNSUPPORTED', 'Treehouse bytes changed before action launch.');
      }

      await ensureCanonicalDirectory(actionRoot);
      const paths = actionPaths(actionRoot, input.actionToken);
      await ensureCanonicalDirectory(paths.tokenRoot);
      const argv = input.kind === 'GRANT'
        ? ['get', '--lease', '--lease-holder', input.holder, '--json']
        : [
            'return',
            input.worktreePath as string,
            '--if-lease-id',
            input.externalLeaseId as string,
            '--if-lease-holder',
            input.holder,
          ];
      const operation: LeaseActionOperation = {
        schemaVersion: 1,
        actionToken: input.actionToken,
        kind: input.kind,
        executable: treehouseExecutable,
        argv,
        cwd: input.sourcePath,
        env: operationEnvironment(treehouseExecutable, gitExecutable, physical.boundary),
        timeoutMs: TREEHOUSE_TIMEOUT_MS,
        stdoutLimitBytes: TREEHOUSE_OUTPUT_LIMIT_BYTES,
        stderrLimitBytes: TREEHOUSE_OUTPUT_LIMIT_BYTES,
        startedPath: paths.startedPath,
        resultPath: paths.resultPath,
      };
      const published = await publishLeaseActionOperation({
        actionRoot,
        operationPath: paths.operationPath,
        operation,
      });
      await runner.run({
        actionRoot,
        operationPath: paths.operationPath,
        expectedActionToken: input.actionToken,
        expectedOperationSha256: published.operationSha256,
      });
    },
  };
}

function createLeaseService(
  context: ExecutionContext,
): LeaseService {
  const actionRoot = resolveLeaseActionRoot(context.runtimeRoot);
  const physical: LeasePhysicalAuthority = {
    observe: async ({ writeTrack, attempt, lease }) => {
      const runtime = await attemptPhysicalRuntime(context, writeTrack, attempt, true);
      return {
        source: runtime.source,
        candidates: await treehouseCandidates(runtime, lease),
      };
    },
  };
  return new LeaseService({
    store: context.store,
    repositoryId: context.identity.repoId,
    actionRoot,
    candidate: {
      executableSha256: ACCEPTED_TREEHOUSE.executableSha256,
      semanticVersion: ACCEPTED_TREEHOUSE.semanticVersion,
      commandShapeSha256: ACCEPTED_TREEHOUSE.commandShapeSha256,
    },
    ownerIdentity: context.processIdentity,
    physical,
    actions: createActionAuthority(context, actionRoot),
    processes: {
      isAlive: async (identity) => {
        const observed = await context.processInspector.observe(identity.pid);
        return observed !== undefined && sameProcessIdentity(observed, identity);
      },
    },
    now,
  });
}

async function grantLease(input: Readonly<{
  writeTrackId: string;
  expectedTrackVersion: number;
  idempotencyKey: string;
}>): Promise<Lease> {
  return await withExecutionStore(true, async (context) => {
    requireTrackVersion(
      context.store.execution.getWriteTrack(input.writeTrackId),
      input.expectedTrackVersion,
    );
    return await createLeaseService(context).grant({
      writeTrackId: input.writeTrackId,
      idempotencyKey: input.idempotencyKey,
      occurredAt: now(),
    });
  });
}

async function showLease(leaseId: string): Promise<Lease> {
  return await withExecutionStore(false, (context) => {
    const lease = context.store.execution.getLease(leaseId);
    if (lease === undefined) throw new MnfsError('LEASE_CONFLICT', `Lease ${leaseId} was not found.`);
    return lease;
  });
}

async function releaseLease(input: Readonly<{
  leaseId: string;
  expectedLeaseVersion: number;
  idempotencyKey: string;
}>): Promise<Lease> {
  return await withExecutionStore(true, async (context) => await createLeaseService(context).release({
    ...input,
    occurredAt: now(),
  }));
}

function sourceObservationFromAttempt(attempt: Attempt): RecoverySourceObservation {
  if (attempt.sourceStatus === 'REQUESTED') {
    return {
      status: 'REQUESTED',
      attemptId: attempt.id,
      baseCommitSha: attempt.baseCommitSha,
      objectFormat: attempt.gitObjectFormat,
    };
  }
  if (attempt.sourceStatus === 'DIVERGED') {
    return {
      status: 'CHANGED',
      attemptId: attempt.id,
      ...(attempt.sourcePath === undefined ? {} : { path: attempt.sourcePath }),
      baseCommitSha: attempt.baseCommitSha,
      objectFormat: attempt.gitObjectFormat,
    };
  }
  return {
    status: existsSync(attempt.sourcePath as string) ? 'READY' : 'MISSING',
    attemptId: attempt.id,
    path: attempt.sourcePath,
    fingerprint: attempt.sourceFingerprint,
    baseCommitSha: attempt.baseCommitSha,
    objectFormat: attempt.gitObjectFormat,
  };
}

async function recoveryObservation(
  context: ExecutionContext,
  input: RecoverCommandInput,
): Promise<RecoveryWorldObservation> {
  if (input.writeTrackId === undefined) {
    return { sources: [], leases: [], actions: [], processes: [] };
  }
  const track = context.store.execution.getWriteTrack(input.writeTrackId);
  const attempt = track === undefined
    ? undefined
    : context.store.execution.getCurrentAttempt(track.id);
  const lease = track === undefined
    ? undefined
    : context.store.execution.getCurrentLease(track.id)
      ?? context.store.execution.getLatestLease(track.id);
  const sources: RecoverySourceObservation[] = attempt === undefined
    ? []
    : [sourceObservationFromAttempt(attempt)];
  const leases: RecoveryLeaseCandidate[] = [];
  if (
    track !== undefined
    && attempt !== undefined
    && attempt.sourceStatus === 'READY'
    && attempt.sourcePath !== undefined
    && existsSync(attempt.sourcePath)
  ) {
    try {
      const runtime = await attemptPhysicalRuntime(context, track, attempt, false);
      for (const candidate of await treehouseCandidates(runtime, lease)) leases.push(candidate);
      sources[0] = {
        status: 'READY',
        attemptId: attempt.id,
        path: runtime.source.path,
        fingerprint: runtime.source.fingerprint,
        baseCommitSha: runtime.source.baseCommitSha,
        baseTreeSha: runtime.source.baseTreeSha,
        objectFormat: runtime.source.objectFormat,
      };
    } catch {
      sources[0] = {
        ...sourceObservationFromAttempt(attempt),
        status: 'UNKNOWN',
      };
    }
  }

  const actions: RecoveryActionCandidate[] = [];
  const processes: RecoveryProcessCandidate[] = [];
  if (lease?.actionToken !== undefined && lease.actionKind !== undefined) {
    const observation = await createActionAuthority(
      context,
      resolveLeaseActionRoot(context.runtimeRoot),
    ).observe(lease.actionToken);
    actions.push({
      actionToken: lease.actionToken,
      state: observation.state === 'ABSENT' ? 'CLAIMED' : observation.state,
      kind: lease.actionKind,
      ...(observation.runner === undefined ? {} : { runner: observation.runner }),
      ...(observation.startedRef === undefined ? {} : { startedRef: observation.startedRef }),
      ...(observation.resultRef === undefined ? {} : { resultRef: observation.resultRef }),
    });
    for (const identity of [lease.actionOwner, observation.runner]) {
      if (
        identity === undefined
        || processes.some((candidate) => sameProcessIdentity(candidate.identity, identity))
      ) continue;
      const observed = await context.processInspector.observe(identity.pid);
      processes.push({
        identity,
        alive: observed !== undefined && sameProcessIdentity(observed, identity),
      });
    }
  }
  return { sources, leases, actions, processes };
}

async function recover(input: RecoverCommandInput): Promise<Awaited<ReturnType<RecoveryService['recover']>>> {
  return await withExecutionStore(false, async (context) => await new RecoveryService({
    store: context.store,
    observations: {
      observe: async (requested) => await recoveryObservation(context, requested),
    },
  }).recover(input));
}

const result = await runCli(process.argv.slice(2), {
  inspect: () => inspectEnvironment({
    platform: process.platform,
    release: release(),
    nodeVersion: process.version,
    cwd: process.cwd(),
    which: findExecutable,
  }),
  initialize: (): InitializedProjectView => {
    const identity = initializeProject({ cwd: process.cwd() });
    const root = runtimeRoot(identity);
    const store = SqliteStore.open(join(root, 'mnfs.db'));
    store.close();
    return { ...identity, runtimeRoot: root };
  },
  openMission: (goal) => withMissionService((service) => service.openMission({ goal })),
  status: () => withMissionService((service) => service.getStatus()),
  savePlan: (input) => withMissionPlanService((service) => service.savePlanFromFile(input)),
  showPlan: (missionId) => withMissionPlanService((service) => service.getCurrentPlan(missionId)),
  renderPlan: (missionId) => withMissionPlanService((service) => service.renderCurrentPlan(missionId)),
  openPlan: (missionId) => withMissionPlanService(async (service) => {
    const rendered = service.renderCurrentPlan(missionId);
    const lavishOutput = await openLavishPlan(rendered.htmlPath);
    return { ...rendered, lavishOutput };
  }),
  pollPlan: (missionId) => withMissionPlanService(async (service, root) => {
    const revision = service.getCurrentPlan(missionId);
    const htmlPath = resolveMissionPlanReviewPath(root, missionId);
    const snapshotPath = resolveMissionPlanHtmlPath(root, missionId, revision.revision);
    const feedback = await pollLavishPlan(htmlPath);
    return { revision, htmlPath, snapshotPath, feedback };
  }),
  approvePlan: (input) => withMissionPlanService((service) => service.approvePlan(input)),
  materializePlan: (missionId) => withMissionPlanService((service) => {
    const revision = service.getCurrentPlan(missionId);
    const contractPath = service.materializeApprovedPlan(missionId);
    return { revision, contractPath };
  }),
  openWriteTrack: async (input) => await openWriteTrack(input),
  showWriteTrack: async (writeTrackId) => await showWriteTrack(writeTrackId),
  abandonWriteTrack: async (input) => await abandonWriteTrack(input),
  grantLease: async (input) => await grantLease(input),
  showLease: async (leaseId) => await showLease(leaseId),
  releaseLease: async (input) => await releaseLease(input),
  recover: async (input) => await recover(input),
  debug: process.env.MNFS_DEBUG === '1',
});

if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);
process.exitCode = result.exitCode;
