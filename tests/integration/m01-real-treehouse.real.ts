import assert from 'node:assert/strict';
import { spawn, spawnSync, type ChildProcess } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import {
  accessSync,
  constants,
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { platform } from 'node:os';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';

import { SqliteStore } from '../../src/store/sqlite-store.js';

const RUNS_ROOT = '/home/leandrotheodoro/.local/state/mnfs/test-runs';
const ACCEPTED_TREEHOUSE_VERSION = '2.1.1';
const ACCEPTED_TREEHOUSE_HASH =
  'sha256:c0b45a6b7cd7ee5b79bd614136847d84b4c6c3fc8dbe0fd80b71703b7a102cf3';
const CONTRACT_PATH = resolve('.mnfs/missions/MIS-002/plan.json');
const CONTRACT_HASH =
  'sha256:d82252504044cab40e00013dc30534654382887b7819d60a916d2a9a56db4cc3';
const COMMAND_TIMEOUT_MS = 30_000;
const LEAD_CLEANUP_TIMEOUT_MS = 10_000;
const CONTROLLED_PATH = [...new Set([
  dirname(process.execPath),
  '/usr/local/bin',
  '/usr/bin',
  '/bin',
])].join(':');

interface Layout {
  readonly runId: string;
  readonly root: string;
  readonly project: string;
  readonly state: string;
  readonly evidence: string;
  readonly commands: string;
  readonly snapshots: string;
  readonly repoId: string;
  readonly databasePath: string;
}

interface CommandResult {
  readonly argv: readonly string[];
  readonly cwd: string;
  readonly status: number | null;
  readonly signal: NodeJS.Signals | null;
  readonly stdout: string;
  readonly stderr: string;
  readonly stdoutPath: string;
  readonly stderrPath: string;
  readonly metadataPath: string;
}

interface TreehousePreparation {
  readonly executablePath: string;
  readonly executableHash: string;
  readonly version: string;
  readonly capabilities: Readonly<Record<string, boolean>>;
}

interface CliJsonResult<T> {
  readonly command: CommandResult;
  readonly value: T;
}

interface LeaseView {
  readonly id: string;
  readonly status: string;
  readonly version: number;
  readonly holder: string;
  readonly externalLeaseId?: string;
  readonly worktreePath?: string;
  readonly externalLeasedAt?: string;
}

interface TrackView {
  readonly id: string;
  readonly status: string;
  readonly version: number;
}

interface AttemptView {
  readonly id: string;
  readonly status: string;
  readonly sourceStatus: string;
  readonly sourcePath?: string;
  readonly sourceFingerprint?: string;
  readonly baseCommitSha: string;
}

interface OpenedView {
  readonly track: TrackView;
  readonly attempt: AttemptView;
}

interface TrackStatusView {
  readonly track: TrackView;
  readonly attempt?: AttemptView;
  readonly lease?: LeaseView;
}

function sha256(value: Buffer | string): string {
  return `sha256:${createHash('sha256').update(value).digest('hex')}`;
}

function fileHash(path: string): string {
  return sha256(readFileSync(path));
}

function writeJson(path: string, value: unknown): void {
  mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, {
    encoding: 'utf8',
    mode: 0o600,
  });
}

function writeEvidence(layout: Layout, name: string, value: unknown): string {
  const path = join(layout.evidence, name);
  writeJson(path, value);
  return path;
}

function controlledEnvironment(layout: Layout): Readonly<Record<string, string>> {
  return Object.freeze({
    PATH: CONTROLLED_PATH,
    HOME: join(layout.state, 'home'),
    XDG_CONFIG_HOME: join(layout.state, 'xdg-config'),
    LANG: 'C',
    LC_ALL: 'C',
    MNFS_HOME: layout.state,
    MNFS_MANAGED_HELPER_MARKER: join(layout.evidence, 'managed-helper-invoked.jsonl'),
    GIT_CONFIG_GLOBAL: '/dev/null',
    GIT_CONFIG_NOSYSTEM: '1',
    GIT_TERMINAL_PROMPT: '0',
    GIT_OPTIONAL_LOCKS: '0',
  });
}

function runCommand(
  layout: Layout,
  id: string,
  executable: string,
  args: readonly string[],
  cwd: string,
): CommandResult {
  const safeId = id.replace(/[^A-Za-z0-9._-]/gu, '-');
  const stdoutPath = join(layout.commands, `${safeId}.stdout`);
  const stderrPath = join(layout.commands, `${safeId}.stderr`);
  const metadataPath = join(layout.commands, `${safeId}.json`);
  const argv = [executable, ...args];
  const environment = controlledEnvironment(layout);
  const result = spawnSync(executable, [...args], {
    cwd,
    env: environment,
    input: Buffer.alloc(0),
    maxBuffer: 1_048_576,
    shell: false,
    timeout: COMMAND_TIMEOUT_MS,
  });
  const stdout = result.stdout ?? Buffer.alloc(0);
  const stderr = result.stderr ?? Buffer.alloc(0);
  const stdoutText = Buffer.isBuffer(stdout) ? stdout.toString('utf8') : String(stdout);
  const stderrText = Buffer.isBuffer(stderr) ? stderr.toString('utf8') : String(stderr);
  writeFileSync(stdoutPath, stdout, { mode: 0o600 });
  writeFileSync(stderrPath, stderr, { mode: 0o600 });
  writeJson(metadataPath, {
    argv,
    cwd,
    environment,
    exitCode: result.status,
    signal: result.signal,
    error: result.error?.message ?? null,
    stdoutPath: relative(layout.root, stdoutPath),
    stderrPath: relative(layout.root, stderrPath),
    stdoutSha256: sha256(stdout),
    stderrSha256: sha256(stderr),
  });
  return {
    argv,
    cwd,
    status: result.status,
    signal: result.signal,
    stdout: stdoutText,
    stderr: stderrText,
    stdoutPath,
    stderrPath,
    metadataPath,
  };
}

function runMnfs(
  layout: Layout,
  id: string,
  args: readonly string[],
): CommandResult {
  return runCommand(layout, id, process.execPath, [resolve('bin/mnfs.mjs'), ...args], layout.project);
}

interface SpawnedCommand {
  readonly child: ChildProcess;
  readonly result: Promise<CommandResult>;
}

function spawnMnfs(
  layout: Layout,
  id: string,
  args: readonly string[],
): SpawnedCommand {
  const safeId = id.replace(/[^A-Za-z0-9._-]/gu, '-');
  const stdoutPath = join(layout.commands, `${safeId}.stdout`);
  const stderrPath = join(layout.commands, `${safeId}.stderr`);
  const metadataPath = join(layout.commands, `${safeId}.json`);
  const executable = process.execPath;
  const argv = [executable, resolve('bin/mnfs.mjs'), ...args];
  const child = spawn(executable, argv.slice(1), {
    cwd: layout.project,
    env: controlledEnvironment(layout),
    shell: false,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const stdoutChunks: Buffer[] = [];
  const stderrChunks: Buffer[] = [];
  let spawnError: string | null = null;
  child.stdout?.on('data', (chunk: Buffer) => stdoutChunks.push(Buffer.from(chunk)));
  child.stderr?.on('data', (chunk: Buffer) => stderrChunks.push(Buffer.from(chunk)));
  const result = new Promise<CommandResult>((resolveResult) => {
    child.once('error', (error: Error) => {
      spawnError = error.message;
    });
    child.once('close', (status, signal) => {
      const stdout = Buffer.concat(stdoutChunks);
      const stderr = Buffer.concat(stderrChunks);
      writeFileSync(stdoutPath, stdout, { mode: 0o600 });
      writeFileSync(stderrPath, stderr, { mode: 0o600 });
      writeJson(metadataPath, {
        argv,
        cwd: layout.project,
        environment: controlledEnvironment(layout),
        pid: child.pid ?? null,
        exitCode: status,
        signal,
        error: spawnError,
        stdoutPath: relative(layout.root, stdoutPath),
        stderrPath: relative(layout.root, stderrPath),
        stdoutSha256: sha256(stdout),
        stderrSha256: sha256(stderr),
      });
      resolveResult({
        argv,
        cwd: layout.project,
        status,
        signal,
        stdout: stdout.toString('utf8'),
        stderr: stderr.toString('utf8'),
        stdoutPath,
        stderrPath,
        metadataPath,
      });
    });
  });
  return { child, result };
}

async function awaitCommandResultBounded(
  command: SpawnedCommand,
  timeoutMs = 2_000,
): Promise<CommandResult | undefined> {
  return await Promise.race([
    command.result,
    new Promise<undefined>((resolveResult) => setTimeout(() => resolveResult(undefined), timeoutMs)),
  ]);
}

async function waitFor(
  label: string,
  predicate: () => boolean,
  timeoutMs = COMMAND_TIMEOUT_MS,
): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (!predicate()) {
    if (Date.now() >= deadline) throw new Error(`Timed out waiting for ${label}.`);
    await new Promise<void>((resolveWait) => setTimeout(resolveWait, 25));
  }
}

interface LinuxChildObservation {
  readonly pid: number;
  readonly startTicks: string;
  readonly argv: readonly string[];
  readonly cmdline: string;
}

interface LinuxProcessObservation {
  readonly pid: number;
  readonly startTicks: string;
  readonly state: string;
  readonly children: readonly LinuxChildObservation[];
}

function observeLinuxProcess(pid: number): LinuxProcessObservation | undefined {
  try {
    const statLine = readFileSync(`/proc/${pid}/stat`, 'utf8');
    const closeParenthesis = statLine.lastIndexOf(')');
    if (closeParenthesis <= 0) return undefined;
    const fields = statLine.slice(closeParenthesis + 1).trim().split(/\s+/u);
    const state = fields[0];
    const startTicks = fields[19];
    if (state === undefined || startTicks === undefined) return undefined;
    const childText = readFileSync(`/proc/${pid}/task/${pid}/children`, 'utf8').trim();
    const childPids = childText.length === 0
      ? []
      : childText.split(/\s+/u).map((value) => Number(value));
    if (childPids.some((childPid) => !Number.isSafeInteger(childPid) || childPid <= 0)) return undefined;
    const children: LinuxChildObservation[] = [];
    for (const childPid of childPids) {
      const childStatLine = readFileSync(`/proc/${childPid}/stat`, 'utf8');
      const childCloseParenthesis = childStatLine.lastIndexOf(')');
      if (childCloseParenthesis <= 0) return undefined;
      const childFields = childStatLine.slice(childCloseParenthesis + 1).trim().split(/\s+/u);
      const childStartTicks = childFields[19];
      if (childStartTicks === undefined || !/^\d+$/u.test(childStartTicks)) return undefined;
      const rawCmdline = readFileSync(`/proc/${childPid}/cmdline`, 'utf8');
      const argv = rawCmdline.split('\u0000').filter((value) => value.length > 0);
      if (argv.length === 0) return undefined;
      children.push({
        pid: childPid,
        startTicks: childStartTicks,
        argv,
        cmdline: argv.join(' '),
      });
    }
    return { pid, state, startTicks, children };
  } catch {
    return undefined;
  }
}

function sameObservedProcess(identity: Readonly<{ pid: number; startTicks: string }>): boolean {
  const observed = observeLinuxProcess(identity.pid);
  return observed !== undefined && observed.startTicks === identity.startTicks;
}

function signalObservedProcess(
  identity: Readonly<{ pid: number; startTicks: string }>,
  signal: NodeJS.Signals,
): void {
  assert.equal(
    sameObservedProcess(identity),
    true,
    `Refusing to signal process ${identity.pid}: persisted start identity no longer matches.`,
  );
  process.kill(identity.pid, signal);
}

function signalObservedProcessGroup(
  identity: Readonly<{ pid: number; startTicks: string }>,
  signal: NodeJS.Signals,
): void {
  if (!sameObservedProcess(identity)) return;
  process.kill(-identity.pid, signal);
}

function processFileHashes(root: string): Record<string, string> {
  if (!existsSync(root)) return {};
  return Object.fromEntries(
    regularFiles(root).sort().map((path) => [relative(root, path), fileHash(path)]),
  );
}

interface StartedGrantEvidence {
  readonly tokenRoot: string;
  readonly operationPath: string;
  readonly startedPath: string;
  readonly finishedPath: string;
  readonly operation: Record<string, unknown>;
  readonly started: Record<string, unknown>;
}

function findStartedGrant(layout: Layout, expectedSourcePath: string): StartedGrantEvidence | undefined {
  const actionRoot = join(layout.state, 'repos', layout.repoId, 'lease-actions');
  if (!existsSync(actionRoot)) return undefined;
  for (const entry of readdirSync(actionRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const tokenRoot = join(actionRoot, entry.name);
    const operationPath = join(tokenRoot, 'operation.json');
    const startedPath = join(tokenRoot, 'started.json');
    const finishedPath = join(tokenRoot, 'finished.json');
    if (!existsSync(operationPath) || !existsSync(startedPath)) continue;
    const operation = JSON.parse(readFileSync(operationPath, 'utf8')) as Record<string, unknown>;
    const started = JSON.parse(readFileSync(startedPath, 'utf8')) as Record<string, unknown>;
    if (operation.kind !== 'GRANT' || operation.cwd !== expectedSourcePath) continue;
    if (operation.actionToken !== entry.name || started.actionToken !== entry.name) continue;
    return { tokenRoot, operationPath, startedPath, finishedPath, operation, started };
  }
  return undefined;
}

function leaseActionRoot(layout: Layout): string {
  return join(layout.state, 'repos', layout.repoId, 'lease-actions');
}

function parseCliJson<T>(layout: Layout, id: string, args: readonly string[]): CliJsonResult<T> {
  const command = runMnfs(layout, id, args);
  assert.equal(command.status, 0, `${command.argv.join(' ')}: ${command.stderr}`);
  assert.notEqual(command.stdout.trim(), '', `${command.argv.join(' ')} returned no JSON.`);
  return { command, value: JSON.parse(command.stdout) as T };
}

function assertRfc3339(value: string, label: string): void {
  assert.match(
    value,
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/u,
    `${label} is not RFC3339: ${value}`,
  );
  assert.equal(Number.isFinite(Date.parse(value)), true, `${label} is not a timestamp: ${value}`);
}

function assertContained(parent: string, child: string, label: string): void {
  const parentPath = resolve(parent);
  const childPath = resolve(child);
  const suffix = relative(parentPath, childPath);
  assert.notEqual(suffix, '', `${label} must be inside, not equal to, ${parentPath}`);
  assert.equal(
    suffix !== '..' && !suffix.startsWith(`..${sep}`) && !suffix.startsWith('/'),
    true,
    `${label} escaped ${parentPath}: ${childPath}`,
  );
}

function regularFiles(root: string): string[] {
  const entries = readdirSync(root, { withFileTypes: true });
  const result: string[] = [];
  for (const entry of entries) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) result.push(...regularFiles(path));
    else if (entry.isFile()) result.push(path);
    else assert.equal(entry.isSymbolicLink(), false, `Unexpected symlink under ${root}: ${path}`);
  }
  return result;
}

function gitPath(layout: Layout, cwd: string, args: readonly string[], id: string): string {
  return git(layout, id, args, cwd);
}

function assertIndependentSource(layout: Layout, sourcePath: string, baseCommitSha: string): Record<string, unknown> {
  const canonicalGitDirValue = gitPath(layout, layout.project, ['rev-parse', '--absolute-git-dir'], 'canonical-absolute-git-dir');
  const sourceGitDirValue = gitPath(layout, sourcePath, ['rev-parse', '--absolute-git-dir'], 'source-absolute-git-dir');
  const canonicalGitDir = realpathSync(canonicalGitDirValue);
  const sourceGitDir = realpathSync(sourceGitDirValue);
  const canonicalObjects = gitPath(layout, layout.project, ['rev-parse', '--git-path', 'objects'], 'canonical-objects');
  const sourceObjects = gitPath(layout, sourcePath, ['rev-parse', '--git-path', 'objects'], 'source-objects');
  const canonicalObjectFiles = regularFiles(resolve(layout.project, canonicalObjects));
  const sourceObjectFiles = regularFiles(resolve(sourcePath, sourceObjects));
  const canonicalInodes = new Set(canonicalObjectFiles.map((path) => {
    const metadata = statSync(path);
    return `${metadata.dev}:${metadata.ino}`;
  }));
  for (const path of sourceObjectFiles) {
    const metadata = statSync(path);
    assert.equal(
      canonicalInodes.has(`${metadata.dev}:${metadata.ino}`),
      false,
      `source object is hardlinked to canonical Git object: ${path}`,
    );
  }

  const alternates = join(sourceGitDir, 'objects', 'info', 'alternates');
  const sourceSnapshot = captureGitSnapshotAt(layout, 'source-ready', sourcePath);
  assert.equal(sourceSnapshot.head, baseCommitSha);
  assert.equal(sourceSnapshot.status, '');
  assert.equal(sourceSnapshot.remotes, '');
  assert.equal(existsSync(alternates), false, 'source uses Git alternates');
  assert.notEqual(sourceGitDir, canonicalGitDir, 'source shares the canonical Git directory');
  assert.notEqual(
    realpathSync(resolve(sourcePath, sourceObjects)),
    realpathSync(resolve(layout.project, canonicalObjects)),
  );
  return {
    canonicalGitDir,
    sourceGitDir,
    canonicalObjects: resolve(layout.project, canonicalObjects),
    sourceObjects: resolve(sourcePath, sourceObjects),
    sourceSnapshot,
    hardlinkChecked: sourceObjectFiles.length,
  };
}

function git(layout: Layout, id: string, args: readonly string[], cwd: string): string {
  const executable = findExecutable('git');
  assert.notEqual(executable, undefined, 'git is not available on the controlled PATH');
  const result = runCommand(layout, id, executable as string, args, cwd);
  assert.equal(result.status, 0, `${result.argv.join(' ')}: ${result.stderr}`);
  return result.stdout.trim();
}

function findExecutable(name: string): string | undefined {
  for (const directory of CONTROLLED_PATH.split(':')) {
    if (directory.length === 0) continue;
    const candidate = join(directory, name);
    try {
      accessSync(candidate, constants.X_OK);
      return realpathSync(candidate);
    } catch {
      // Continue through the controlled PATH.
    }
  }
  return undefined;
}

function isMountedPath(path: string): boolean {
  return path === '/mnt' || path.startsWith('/mnt/');
}

function existingPath(path: string): boolean {
  try {
    lstatSync(path);
    return true;
  } catch {
    return false;
  }
}

function nearestExistingPath(path: string): string {
  let candidate = resolve(path);
  while (!existingPath(candidate)) {
    const parent = dirname(candidate);
    if (parent === candidate) {
      throw new Error(`No existing ancestor for ${path}.`);
    }
    candidate = parent;
  }
  return candidate;
}

function validateLinuxOwnedDirectory(
  path: string,
  label: string,
  expectedDevice?: number,
): void {
  const absolute = resolve(path);
  assert.equal(isMountedPath(absolute), false, `${label} cannot be under /mnt`);
  const link = lstatSync(absolute);
  assert.equal(link.isSymbolicLink(), false, `${label} cannot be a symlink`);
  assert.equal(realpathSync(absolute), absolute, `${label} must have a stable realpath`);
  const metadata = statSync(absolute);
  const getUid = process.getuid;
  if (getUid === undefined) {
    throw new Error(`${label} cannot be validated without a Linux UID.`);
  }
  const currentUid = getUid();
  assert.equal(metadata.uid, currentUid, `${label} must be owned by the current Linux UID`);
  if (expectedDevice !== undefined) {
    assert.equal(metadata.dev, expectedDevice, `${label} cannot be a mounted filesystem root`);
  }
}

function prepareRunsRoot(): number {
  const parent = nearestExistingPath(dirname(RUNS_ROOT));
  validateLinuxOwnedDirectory(parent, 'runs-root parent');
  const parentDevice = statSync(parent).dev;
  if (!existingPath(RUNS_ROOT)) {
    mkdirSync(RUNS_ROOT, { recursive: true, mode: 0o700 });
  }
  validateLinuxOwnedDirectory(RUNS_ROOT, 'runs-root', parentDevice);
  return parentDevice;
}

function preserveFailureEvidence(
  root: string,
  evidence: string,
  runId: string,
  phase: string,
  error: unknown,
): void {
  try {
    mkdirSync(evidence, { recursive: true, mode: 0o700 });
    writeJson(join(evidence, 'failure.json'), {
      runId,
      root,
      phase,
      status: 'INCONCLUSIVE',
      error: error instanceof Error
        ? { name: error.name, message: error.message, stack: error.stack }
        : String(error),
      preserved: true,
    });
  } catch {
    // Preserve the original failure when the partial root cannot be written.
  }
}

function createLayout(): Layout {
  assert.equal(platform(), 'linux', 'real Treehouse preparation requires Linux');
  const parentDevice = prepareRunsRoot();
  const runId = `m01-${new Date().toISOString().replace(/[^0-9]/gu, '')}-${process.pid}-${randomUUID()}`;
  const root = join(RUNS_ROOT, runId);
  const project = join(root, 'project');
  const state = join(root, 'state');
  const evidence = join(root, 'evidence');
  const commands = join(evidence, 'commands');
  const snapshots = join(evidence, 'snapshots');
  const repoId = `m01-real-${runId}`;
  const databasePath = join(state, 'repos', repoId, 'mnfs.db');
  const layout: Layout = { runId, root, project, state, evidence, commands, snapshots, repoId, databasePath };
  mkdirSync(root, { mode: 0o700 });
  try {
    mkdirSync(evidence, { recursive: true, mode: 0o700 });
    for (const path of [project, state, commands, snapshots]) {
      mkdirSync(path, { recursive: true, mode: 0o700 });
    }
    mkdirSync(dirname(databasePath), { recursive: true, mode: 0o700 });
    for (const path of [join(state, 'home'), join(state, 'xdg-config')]) {
      mkdirSync(path, { recursive: true, mode: 0o700 });
    }
    for (const path of [
      root,
      project,
      state,
      evidence,
      commands,
      snapshots,
      dirname(databasePath),
      join(state, 'home'),
      join(state, 'xdg-config'),
    ]) {
      validateLinuxOwnedDirectory(path, `fixture directory ${path}`, parentDevice);
    }
    return layout;
  } catch (error) {
    preserveFailureEvidence(root, evidence, runId, 'create-layout', error);
    throw error;
  }
}

function captureGitSnapshotAt(layout: Layout, label: string, repositoryPath: string): Record<string, unknown> {
  const gitExecutable = findExecutable('git');
  assert.notEqual(gitExecutable, undefined, 'git is not available on the controlled PATH');
  const snapshot = {
    label,
    capturedAt: new Date().toISOString(),
    repositoryPath,
    head: git(layout, `${label}-head`, ['rev-parse', 'HEAD'], repositoryPath),
    tree: git(layout, `${label}-tree`, ['rev-parse', 'HEAD^{tree}'], repositoryPath),
    objectFormat: git(layout, `${label}-object-format`, ['rev-parse', '--show-object-format'], repositoryPath),
    commonDir: git(layout, `${label}-common-dir`, ['rev-parse', '--git-common-dir'], repositoryPath),
    status: runCommand(
      layout,
      `${label}-status`,
      gitExecutable as string,
      ['status', '--porcelain=v1', '-z', '--untracked-files=all'],
      repositoryPath,
    ).stdout,
    remotes: git(layout, `${label}-remotes`, ['remote', '-v'], repositoryPath),
    localConfig: git(layout, `${label}-config`, ['config', '--local', '--list'], repositoryPath),
    worktrees: git(layout, `${label}-worktrees`, ['worktree', 'list', '--porcelain'], repositoryPath),
  };
  writeJson(join(layout.snapshots, `${label}.json`), snapshot);
  return snapshot;
}

function captureGitSnapshot(layout: Layout, label: string): Record<string, unknown> {
  return captureGitSnapshotAt(layout, label, layout.project);
}

function verifyTreehouse(layout: Layout): TreehousePreparation {
  const nodeExecutable = findExecutable('node');
  const gitExecutable = findExecutable('git');
  const executablePath = findExecutable('treehouse');
  writeEvidence(layout, 'controlled-toolchain.json', {
    PATH: CONTROLLED_PATH,
    node: nodeExecutable,
    git: gitExecutable,
    treehouse: executablePath,
  });
  assert.notEqual(nodeExecutable, undefined, 'node is not available on the controlled PATH');
  assert.notEqual(gitExecutable, undefined, 'git is not available on the controlled PATH');
  assert.notEqual(executablePath, undefined, 'treehouse is not available on the controlled PATH');
  const versionResult = runCommand(layout, 'treehouse-version', executablePath as string, ['--version'], layout.project);
  const getHelpResult = runCommand(layout, 'treehouse-get-help', executablePath as string, ['get', '--help'], layout.project);
  const statusHelpResult = runCommand(layout, 'treehouse-status-help', executablePath as string, ['status', '--help'], layout.project);
  const returnHelpResult = runCommand(layout, 'treehouse-return-help', executablePath as string, ['return', '--help'], layout.project);
  const help = [getHelpResult, statusHelpResult, returnHelpResult]
    .map((result) => `${result.stdout}\n${result.stderr}`)
    .join('\n');
  const capabilities = {
    getLeaseJson: /--lease\b/u.test(help) && /--lease-holder\b/u.test(help) && /--json\b/u.test(help),
    statusJson: /status[\s\S]*--json\b/u.test(help),
    returnLeaseId: /--if-lease-id\b/u.test(help),
    returnLeaseHolder: /--if-lease-holder\b/u.test(help),
  };
  const observation = {
    executablePath,
    executableHash: fileHash(executablePath as string),
    version: versionResult.stdout.trim(),
    versionStderr: versionResult.stderr.trim(),
    capabilities,
    commands: {
      version: versionResult.argv,
      getHelp: getHelpResult.argv,
      statusHelp: statusHelpResult.argv,
      returnHelp: returnHelpResult.argv,
    },
  };
  writeEvidence(layout, 'treehouse-preflight.json', observation);
  assert.equal(versionResult.status, 0, versionResult.stderr);
  assert.match(versionResult.stdout, /(?:^|\s)v?2\.1\.1(?:\s|$)/u);
  assert.equal(observation.executableHash, ACCEPTED_TREEHOUSE_HASH);
  assert.equal(getHelpResult.status, 0, getHelpResult.stderr);
  assert.equal(statusHelpResult.status, 0, statusHelpResult.stderr);
  assert.equal(returnHelpResult.status, 0, returnHelpResult.stderr);
  for (const [name, present] of Object.entries(capabilities)) {
    assert.equal(present, true, `Treehouse capability missing: ${name}`);
  }
  return {
    executablePath: executablePath as string,
    executableHash: observation.executableHash,
    version: observation.version,
    capabilities,
  };
}

function prepareFixture(layout: Layout): {
  readonly baseCommitSha: string;
  readonly baseTreeSha: string;
  readonly sentinelHash: string;
  readonly contractFileHash: string;
  readonly embeddedContractHash: string;
  readonly canonicalContractFileHash: string;
  readonly helperHash: string;
  readonly treehouse: TreehousePreparation;
} {
  writeEvidence(layout, 'preparation-started.json', {
    runId: layout.runId,
    root: layout.root,
    project: layout.project,
    state: layout.state,
    evidence: layout.evidence,
    MNFS_HOME: layout.state,
    scenarioCommandsExecuted: [],
  });

  const origin = join(layout.root, 'origin.git');
  git(layout, 'origin-init', ['init', '--bare', origin], layout.root);
  git(layout, 'project-init', ['init', '-b', 'main', layout.project], layout.root);
  git(layout, 'project-user-name', ['config', 'user.name', 'MNFS Real Fixture'], layout.project);
  git(layout, 'project-user-email', ['config', 'user.email', 'mnfs-real-fixture@mnfs.invalid'], layout.project);

  const canonicalContract = readFileSync(CONTRACT_PATH);
  const canonicalContractFileHash = sha256(canonicalContract);
  const parsedContract = JSON.parse(canonicalContract.toString('utf8')) as {
    readonly revision?: unknown;
    readonly contentHash?: unknown;
    readonly content?: { readonly schemaVersion?: unknown };
  };
  assert.equal(parsedContract.revision, 5);
  assert.equal(parsedContract.content?.schemaVersion, 2);
  assert.equal(parsedContract.contentHash, CONTRACT_HASH);
  const fixtureContractPath = join(layout.project, '.mnfs', 'missions', 'MIS-002', 'plan.json');
  mkdirSync(dirname(fixtureContractPath), { recursive: true, mode: 0o700 });
  writeFileSync(fixtureContractPath, canonicalContract, { mode: 0o600 });
  const fixtureContractFileHash = fileHash(fixtureContractPath);
  assert.deepEqual(readFileSync(fixtureContractPath), canonicalContract);
  assert.equal(fixtureContractFileHash, canonicalContractFileHash);
  writeJson(join(layout.project, '.mnfs', 'repo.json'), {
    schemaVersion: 1,
    repoId: layout.repoId,
    createdAt: '2026-08-06T00:00:00.000Z',
  });

  const sentinelPath = join(layout.project, 'fixture-sentinel.txt');
  writeFileSync(sentinelPath, `MNFS-M01-REAL-TREEHOUSE-SENTINEL ${layout.runId}\n`, {
    encoding: 'utf8',
    mode: 0o600,
  });
  const hostileHelperPath = join(layout.project, 'bin', 'mnfs-lease-action.mjs');
  mkdirSync(dirname(hostileHelperPath), { recursive: true, mode: 0o700 });
  writeFileSync(hostileHelperPath, `#!/usr/bin/env node
import { appendFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const marker = process.env.MNFS_MANAGED_HELPER_MARKER
  ?? fileURLToPath(new URL('./managed-helper-invoked.jsonl', import.meta.url));
mkdirSync(dirname(marker), { recursive: true, mode: 0o700 });
appendFileSync(marker, JSON.stringify({ argv: process.argv.slice(2), cwd: process.cwd() }) + '\\n');
process.stderr.write('HOSTILE_MANAGED_PROJECT_HELPER_USED\\n');
process.exitCode = 97;
`, { encoding: 'utf8', mode: 0o755 });

  git(layout, 'project-add-origin', ['remote', 'add', 'origin', '../origin.git'], layout.project);
  git(layout, 'project-add', ['add', '--all'], layout.project);
  git(layout, 'project-commit-base', ['commit', '-m', 'M01 real Treehouse fixture base'], layout.project);

  const baseCommitSha = git(layout, 'base-commit', ['rev-parse', 'HEAD'], layout.project);
  const baseTreeSha = git(layout, 'base-tree', ['rev-parse', 'HEAD^{tree}'], layout.project);
  const sentinelHash = fileHash(sentinelPath);
  const embeddedContractHash = parsedContract.contentHash as string;
  const helperHash = fileHash(hostileHelperPath);
  const gitSnapshot = captureGitSnapshot(layout, 'pre-scenario');
  const treehouse = verifyTreehouse(layout);
  const managedHelperMarkerPath = join(layout.evidence, 'managed-helper-invoked.jsonl');
  const managedHelperMarker = {
    path: managedHelperMarkerPath,
    exists: existsSync(managedHelperMarkerPath),
    sha256: existsSync(managedHelperMarkerPath) ? fileHash(managedHelperMarkerPath) : null,
  };
  writeEvidence(layout, 'managed-helper-marker.json', managedHelperMarker);
  assert.equal(managedHelperMarker.exists, false, 'managed project helper was invoked during preparation');
  const sqliteSnapshot = {
    databasePath: layout.databasePath,
    exists: existsSync(layout.databasePath),
    sha256: existsSync(layout.databasePath) ? fileHash(layout.databasePath) : null,
    note: 'MNFS SQLite is intentionally not initialized until the real lifecycle scenarios.',
  };
  writeEvidence(layout, 'sqlite-pre-scenario.json', sqliteSnapshot);
  writeEvidence(layout, 'fixture-prepared.json', {
    runId: layout.runId,
    MNFS_HOME: layout.state,
    origin,
    baseCommitSha,
    baseTreeSha,
    canonicalContractFileHash,
    contractFileHash: fixtureContractFileHash,
    embeddedContractHash,
    sentinelHash,
    helperHash,
    treehouse,
    managedHelperMarker,
    gitSnapshot,
    scenarioCommandsExecuted: [],
  });
  writeEvidence(layout, 'preparation-complete.json', {
    runId: layout.runId,
    status: 'PREPARED_ONLY',
    nextStep: 'Task 8 may run the separately authorized real lifecycle scenarios.',
  });
  return {
    baseCommitSha,
    baseTreeSha,
    sentinelHash,
    contractFileHash: fixtureContractFileHash,
    embeddedContractHash,
    canonicalContractFileHash,
    helperHash,
    treehouse,
  };
}

function setupApprovedMission(layout: Layout, goal: string): void {
  const contractPath = join(layout.project, '.mnfs', 'missions', 'MIS-002', 'plan.json');
  const originalContract = readFileSync(contractPath);
  const envelope = JSON.parse(originalContract.toString('utf8')) as {
    readonly content: unknown;
  };
  const planInputPath = join(layout.root, 'plan-content.json');
  writeJson(planInputPath, envelope.content);

  const initialized = parseCliJson<Record<string, unknown>>(layout, 'cli-init', ['init', '--json']);
  assert.equal(initialized.value.repoId, layout.repoId);
  const store = SqliteStore.open(layout.databasePath);
  try {
    store.openMission({
      missionId: 'MIS-002',
      eventId: `EVT-MIS-002-R1-${layout.runId}-OPEN`,
      goal,
      openedAt: new Date().toISOString(),
    });
  } finally {
    store.close();
  }
  const saved = parseCliJson<Record<string, unknown>>(layout, 'cli-plan-save', [
    'plan', 'save', '--mission', 'MIS-002', '--input', planInputPath, '--json',
  ]);
  assert.equal(saved.value.contentHash, CONTRACT_HASH);
  const approved = parseCliJson<Record<string, unknown>>(layout, 'cli-plan-approve', [
    'plan', 'approve', '--mission', 'MIS-002', '--hash', CONTRACT_HASH, '--json',
  ]);
  assert.equal((approved.value.revision as { readonly revision?: unknown }).revision, 1);
  writeFileSync(contractPath, originalContract, { mode: 0o600 });
  assert.deepEqual(readFileSync(contractPath), originalContract);
}

function actionOperations(layout: Layout): Array<Record<string, unknown>> {
  const actionRoot = join(layout.state, 'repos', layout.repoId, 'lease-actions');
  if (!existsSync(actionRoot)) return [];
  return regularFiles(actionRoot)
    .filter((path) => path.endsWith('/operation.json'))
    .sort()
    .map((path) => JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>);
}

function sqliteEvidence(layout: Layout): Record<string, unknown> {
  assert.equal(existsSync(layout.databasePath), true, 'MNFS SQLite database was not created');
  const database = new DatabaseSync(layout.databasePath, { readOnly: true });
  try {
    return {
      tracks: database.prepare('SELECT id, status, version FROM write_tracks ORDER BY id').all(),
      attempts: database.prepare('SELECT id, write_track_id, source_status, source_path FROM attempts ORDER BY id').all(),
      leases: database.prepare('SELECT id, status, version, holder, external_lease_id, worktree_path, external_leased_at FROM leases ORDER BY id').all(),
      events: database.prepare('SELECT type, event_id FROM events ORDER BY seq').all(),
    };
  } finally {
    database.close();
  }
}

function runR1Lifecycle(layout: Layout, prepared: ReturnType<typeof prepareFixture>): Record<string, unknown> {
  const originalContract = JSON.parse(readFileSync(join(layout.project, '.mnfs', 'missions', 'MIS-002', 'plan.json'), 'utf8')) as {
    readonly content: { readonly goal: string };
  };
  setupApprovedMission(layout, originalContract.content.goal);
  const canonicalBeforeTrack = captureGitSnapshot(layout, 'canonical-before-track');

  const opened = parseCliJson<OpenedView>(layout, 'cli-track-open', [
    'track', 'open',
    '--mission', 'MIS-002',
    '--milestone', 'M01',
    '--feature', 'F01',
    '--contract', CONTRACT_HASH,
    '--base', prepared.baseCommitSha,
    '--idempotency-key', `r1-track-${layout.runId}`,
    '--json',
  ]);
  assert.equal(opened.value.track.id, 'WT-001');
  assert.equal(opened.value.attempt.id, 'WT-001/A01');
  assert.equal(opened.value.attempt.sourceStatus, 'READY');
  assert.notEqual(opened.value.attempt.sourcePath, undefined);
  const sourcePath = opened.value.attempt.sourcePath as string;
  assertContained(join(layout.state, 'repos', layout.repoId), sourcePath, 'Attempt source');
  assert.notEqual(resolve(sourcePath), resolve(layout.project), 'Attempt source is canonical checkout');
  const sourceEvidence = assertIndependentSource(layout, sourcePath, prepared.baseCommitSha);
  const canonicalAfterTrack = captureGitSnapshot(layout, 'canonical-after-track');
  assert.equal(canonicalAfterTrack.status, '');
  assert.equal(canonicalAfterTrack.head, canonicalBeforeTrack.head);
  assert.equal(canonicalAfterTrack.tree, canonicalBeforeTrack.tree);

  const granted = parseCliJson<LeaseView>(layout, 'cli-lease-grant', [
    'lease', 'grant', '--track', opened.value.track.id,
    '--expected-version', String(opened.value.track.version),
    '--idempotency-key', `r1-grant-${layout.runId}`, '--json',
  ]);
  const lease = granted.value;
  assert.equal(lease.status, 'ACTIVE');
  assert.match(lease.id, /^LSE-\d+$/u);
  assert.match(lease.holder, /^mnfs-[a-z0-9]+-[a-z0-9]+-g\d+$/u);
  assert.notEqual(lease.externalLeaseId, undefined);
  assert.notEqual(lease.worktreePath, undefined);
  assert.notEqual(lease.externalLeasedAt, undefined);
  assertContained(
    join(layout.state, 'repos', layout.repoId, 'treehouse', opened.value.track.id, opened.value.attempt.id, 'pool'),
    lease.worktreePath as string,
    'Treehouse leased path',
  );
  assertRfc3339(lease.externalLeasedAt as string, 'Treehouse lease timestamp');
  assert.equal(existsSync(lease.worktreePath as string), true);
  const leasedSnapshot = captureGitSnapshotAt(layout, 'leased-worktree', lease.worktreePath as string);
  assert.equal(leasedSnapshot.status, '');
  assert.equal(leasedSnapshot.head, prepared.baseCommitSha);

  const freshObservation = parseCliJson<Record<string, unknown>>(layout, 'cli-recover-after-grant', [
    'recover', '--track', opened.value.track.id, '--json',
  ]);
  assert.equal(typeof freshObservation.value, 'object');
  const grantOperations = actionOperations(layout);
  assert.equal(grantOperations.length, 1, 'grant must publish exactly one external operation');
  assert.deepEqual(grantOperations[0]?.argv, ['get', '--lease', '--lease-holder', lease.holder, '--json']);
  assert.equal(grantOperations[0]?.kind, 'GRANT');

  const released = parseCliJson<LeaseView>(layout, 'cli-lease-release', [
    'lease', 'release', '--lease', lease.id,
    '--expected-version', String(lease.version),
    '--idempotency-key', `r1-release-${layout.runId}`, '--json',
  ]);
  assert.equal(released.value.status, 'RELEASED');
  assert.equal(released.value.externalLeaseId, lease.externalLeaseId);
  assert.equal(released.value.holder, lease.holder);
  assert.equal(released.value.worktreePath, lease.worktreePath);
  assert.equal(released.value.externalLeasedAt, lease.externalLeasedAt);
  assert.equal(existsSync(lease.worktreePath as string), true, 'returned worktree path was not retained in the pool');

  const finalObservation = parseCliJson<Record<string, unknown>>(layout, 'cli-recover-after-release', [
    'recover', '--track', opened.value.track.id, '--json',
  ]);
  const observedLeases = ((finalObservation.value as {
    readonly observed?: { readonly leases?: readonly Record<string, unknown>[] };
  }).observed?.leases ?? []);
  const returnedCandidate = observedLeases.filter(
    (candidate) => candidate.path === lease.worktreePath,
  );
  assert.equal(returnedCandidate.length, 1, 'fresh recovery did not observe the returned path');
  const available = returnedCandidate[0] as Record<string, unknown>;
  assert.equal(available.status, 'available');
  assert.equal('leaseId' in available, false);
  assert.equal('holder' in available, false);
  assert.equal('leasedAt' in available, false);

  const repeated = parseCliJson<LeaseView>(layout, 'cli-lease-release-idempotent', [
    'lease', 'release', '--lease', lease.id,
    '--expected-version', String(lease.version),
    '--idempotency-key', `r1-release-${layout.runId}`, '--json',
  ]);
  assert.deepEqual(repeated.value, released.value);
  const releaseOperations = actionOperations(layout);
  assert.equal(releaseOperations.length, 2, 'idempotent release must not publish another operation');
  const releaseOperation = releaseOperations.find((operation) => operation.kind === 'RELEASE');
  assert.notEqual(releaseOperation, undefined);
  assert.deepEqual(releaseOperation?.argv, [
    'return', lease.worktreePath, '--if-lease-id', lease.externalLeaseId, '--if-lease-holder', lease.holder,
  ]);
  assert.equal(releaseOperations.filter((operation) => operation.kind === 'GRANT').length, 1);
  assert.equal(releaseOperations.filter((operation) => operation.kind === 'RELEASE').length, 1);
  const hostileMarkers = [
    join(layout.evidence, 'managed-helper-invoked.jsonl'),
    join(layout.project, 'bin', 'managed-helper-invoked.jsonl'),
    join(sourcePath, 'bin', 'managed-helper-invoked.jsonl'),
  ];
  for (const marker of hostileMarkers) assert.equal(existsSync(marker), false, `hostile helper invoked: ${marker}`);
  const sqlite = sqliteEvidence(layout);
  const canonicalFinal = captureGitSnapshot(layout, 'canonical-final');
  assert.equal(canonicalFinal.status, '');
  assert.equal(canonicalFinal.tree, canonicalBeforeTrack.tree);
  return {
    status: 'GREEN',
    runId: layout.runId,
    root: layout.root,
    track: opened.value.track,
    attempt: opened.value.attempt,
    lease: lease,
    releasedLease: released.value,
    sourceEvidence,
    freshObservation,
    finalObservation,
    sqlite,
    actionOperations: releaseOperations,
    hostileHelperMarkers: hostileMarkers,
    canonicalFinal,
  };
}

interface RecoveryView {
  readonly expected: Record<string, unknown>;
  readonly findings: readonly Record<string, unknown>[];
  readonly observed: {
    readonly leases: readonly Record<string, unknown>[];
    readonly actions: readonly Record<string, unknown>[];
    readonly processes: readonly Record<string, unknown>[];
  };
  readonly observationHashes: Record<string, string>;
  readonly contentHash: string;
}

function findingCodes(report: RecoveryView): string[] {
  return report.findings.map((finding) => String(finding.code));
}

async function runR2Lifecycle(
  layout: Layout,
  prepared: ReturnType<typeof prepareFixture>,
): Promise<Record<string, unknown>> {
  let runnerIdentity: { pid: number; startTicks: string } | undefined;
  let leadIdentity: { pid: number; startTicks: string } | undefined;
  let leadKilled = false;
  let runnerStopped = false;
  let primaryFailure: unknown;
  let leadGrant: SpawnedCommand | undefined;
  let cleanupEvidenceWritten = false;
  let cleanupEvidenceError: string | undefined;
  try {
    const originalContract = JSON.parse(readFileSync(join(layout.project, '.mnfs', 'missions', 'MIS-002', 'plan.json'), 'utf8')) as {
      readonly content: { readonly goal: string };
    };
    setupApprovedMission(layout, originalContract.content.goal);
    const canonicalBeforeTrack = captureGitSnapshot(layout, 'r2-canonical-before-track');
    const opened = parseCliJson<OpenedView>(layout, 'r2-cli-track-open', [
      'track', 'open',
      '--mission', 'MIS-002',
      '--milestone', 'M01',
      '--feature', 'F01',
      '--contract', CONTRACT_HASH,
      '--base', prepared.baseCommitSha,
      '--idempotency-key', `r2-track-${layout.runId}`,
      '--json',
    ]);
    const sourcePath = opened.value.attempt.sourcePath;
    assert.notEqual(sourcePath, undefined);
    const source = sourcePath as string;
    assert.equal(opened.value.attempt.sourceStatus, 'READY');
    const sourceEvidence = assertIndependentSource(layout, source, prepared.baseCommitSha);
    const actionRoot = leaseActionRoot(layout);
    leadGrant = spawnMnfs(layout, 'r2-cli-lease-grant-lead', [
      'lease', 'grant', '--track', opened.value.track.id,
      '--expected-version', String(opened.value.track.version),
      '--idempotency-key', `r2-grant-${layout.runId}`, '--json',
    ]);
    const grant = leadGrant;
    assert.notEqual(grant.child.pid, undefined, 'Lead process did not expose a PID immediately after spawn.');
    await waitFor('real Lead identity immediately after spawn', () => {
      const observed = observeLinuxProcess(grant.child.pid as number);
      if (observed === undefined) return false;
      leadIdentity = {
        pid: grant.child.pid as number,
        startTicks: observed.startTicks,
      };
      return true;
    }, 5_000);
    assert.notEqual(leadIdentity, undefined, 'Lead identity was not captured after spawn.');
    const leadIdentityForKill = leadIdentity as { pid: number; startTicks: string };
    let started: StartedGrantEvidence | undefined;
    await waitFor('real grant STARTED publication', () => {
      started = findStartedGrant(layout, source);
      return started !== undefined;
    });
    const published = started as StartedGrantEvidence;
    const operationArgv = published.operation.argv as readonly string[];
    const poolRoot = join(
      layout.state, 'repos', layout.repoId, 'treehouse', opened.value.track.id, opened.value.attempt.id, 'pool',
    );
    assert.deepEqual(operationArgv, [
      'get', '--lease', '--lease-holder', operationArgv[3], '--json',
    ]);
    assert.equal(published.operation.actionToken, published.started.actionToken);
    assert.equal(published.operation.cwd, source);
    assert.equal(published.operation.startedPath, published.startedPath);
    assert.equal(published.operation.resultPath, published.finishedPath);
    const startedRunner = published.started.runner as {
      readonly bootId?: unknown;
      readonly pid?: unknown;
      readonly startTicks?: unknown;
    };
    assert.equal(typeof startedRunner.bootId, 'string');
    assert.equal(typeof startedRunner.pid, 'number');
    assert.equal(typeof startedRunner.startTicks, 'string');
    runnerIdentity = {
      pid: startedRunner.pid as number,
      startTicks: startedRunner.startTicks as string,
    };
    assert.equal(sameObservedProcess(runnerIdentity), true, 'STARTED runner is not a live real process.');
    const helperIdentity = runnerIdentity;
    const expectedTreehouseArgv = [
      String(published.operation.executable),
      ...operationArgv,
    ];
    let helperBeforeStop: LinuxProcessObservation | undefined;
    let treehouseChild: LinuxChildObservation | undefined;
    await waitFor('real Treehouse child and immediate helper stop', () => {
      const observation = observeLinuxProcess(helperIdentity.pid);
      if (observation === undefined) return false;
      const child = observation.children.find(
        (candidate) => candidate.argv.join('\u0000') === expectedTreehouseArgv.join('\u0000'),
      );
      if (child === undefined) return false;
      helperBeforeStop = observation;
      treehouseChild = child;
      signalObservedProcess(helperIdentity, 'SIGSTOP');
      runnerStopped = true;
      return true;
    }, 10_000);
    assert.notEqual(helperBeforeStop, undefined, 'STARTED helper disappeared before the crash window.');
    assert.notEqual(
      treehouseChild,
      undefined,
      `Live helper child is not the expected real Treehouse operation: ${JSON.stringify((helperBeforeStop as LinuxProcessObservation).children)}`,
    );
    await waitFor('real helper STOPPED state', () => observeLinuxProcess(helperIdentity.pid)?.state === 'T');
    const helperStoppedObservation = observeLinuxProcess(helperIdentity.pid);
    assert.equal(helperStoppedObservation?.state, 'T', 'Helper was not observed stopped after the fenced SIGSTOP.');
    assert.equal(existsSync(actionRoot), true, 'Action root disappeared before Lead termination.');
    assert.equal(existsSync(poolRoot), true, 'Exact Treehouse pool root disappeared before Lead termination.');
    assert.equal(existsSync(published.finishedPath), false, 'Grant finished before the crash window was injected.');
    writeEvidence(layout, 'r2-crash-window.json', {
      actionRoot,
      tokenRoot: published.tokenRoot,
      operationPath: published.operationPath,
      startedPath: published.startedPath,
      finishedPath: published.finishedPath,
      operation: published.operation,
      started: published.started,
      leadIdentity,
      poolRoot,
      actionRootExistsBeforeLeadKill: existsSync(actionRoot),
      poolRootExistsBeforeLeadKill: existsSync(poolRoot),
      helperObservationBeforeStop: helperBeforeStop,
      helperStoppedObservation,
      treehouseChild,
      runnerStopped: true,
      actionFilesBeforeLeadKill: processFileHashes(actionRoot),
    });

    signalObservedProcess(leadIdentityForKill, 'SIGKILL');
    leadKilled = true;
    const leadResult = await grant.result;
    assert.equal(leadResult.signal, 'SIGKILL', `Lead did not terminate by SIGKILL: ${leadResult.stderr}`);
    assert.equal(existsSync(actionRoot), true, 'Lead termination removed the action root.');
    assert.equal(existsSync(poolRoot), true, 'Lead termination removed the exact Treehouse pool root.');
    writeEvidence(layout, 'r2-lead-terminated.json', {
      leadIdentity,
      result: leadResult,
      actionRoot,
      poolRoot,
      actionRootExists: existsSync(actionRoot),
      poolRootExists: existsSync(poolRoot),
    });

    const sqliteBeforeRecovery = sqliteEvidence(layout);
    const actionBeforeRecovery = processFileHashes(actionRoot);
    const recoveryWhileStarted = parseCliJson<RecoveryView>(layout, 'r2-cli-recover-started', [
      'recover', '--track', opened.value.track.id, '--json',
    ]).value;
    const recoveryCodes = findingCodes(recoveryWhileStarted);
    assert.equal(recoveryCodes.includes('ADOPTABLE'), true, `Expected ADOPTABLE, got ${recoveryCodes.join(',')}.`);
    assert.equal(recoveryWhileStarted.observed.actions.length, 1);
    assert.equal(recoveryWhileStarted.observed.actions[0]?.state, 'STARTED');
    assert.equal(recoveryWhileStarted.observed.actions[0]?.actionToken, published.operation.actionToken);
    const observedRunner = recoveryWhileStarted.observed.processes.find(
      (candidate) => (candidate.identity as { readonly pid?: unknown }).pid === runnerIdentity?.pid,
    );
    assert.notEqual(observedRunner, undefined, 'Recovery omitted the persisted STARTED runner.');
    assert.deepEqual(observedRunner?.identity, published.started.runner);
    assert.equal(observedRunner?.alive, true, 'Recovery did not observe the real stopped helper as alive.');
    const physical = recoveryWhileStarted.observed.leases.find(
      (candidate) => candidate.status === 'leased' && candidate.holder === operationArgv[3],
    );
    assert.notEqual(physical, undefined, 'Recovery did not observe a real physical Lease.');
    const physicalLease = physical as Record<string, unknown>;
    assert.equal(typeof physicalLease.leaseId, 'string');
    assert.equal(typeof physicalLease.path, 'string');
    assert.equal(physicalLease.sourcePath, source);
    assert.deepEqual(sqliteEvidence(layout), sqliteBeforeRecovery);
    assert.deepEqual(processFileHashes(actionRoot), actionBeforeRecovery);
    writeEvidence(layout, 'r2-recovery-started-evidence.json', recoveryWhileStarted);

    const reconciled = parseCliJson<LeaseView>(layout, 'r2-cli-lease-grant-reconcile', [
      'lease', 'grant', '--track', opened.value.track.id,
      '--expected-version', String(opened.value.track.version),
      '--idempotency-key', `r2-grant-${layout.runId}`, '--json',
    ]).value;
    assert.equal(reconciled.status, 'ACTIVE');
    assert.equal(reconciled.externalLeaseId, physicalLease.leaseId);
    assert.equal(reconciled.holder, physicalLease.holder);
    assert.equal(reconciled.worktreePath, physicalLease.path);
    assert.equal(typeof reconciled.externalLeasedAt, 'string');
    assert.equal(actionOperations(layout).length, 1, 'STARTED recovery/reconciliation published a second get operation.');
    writeEvidence(layout, 'r2-reconciled-lease.json', {
      physical: physicalLease,
      reconciled,
      actionOperations: actionOperations(layout),
      actionToken: published.operation.actionToken,
    });

    signalObservedProcess(runnerIdentity, 'SIGCONT');
    runnerStopped = false;
    await waitFor('real helper FINISHED publication', () => existsSync(published.finishedPath));
    await waitFor('real helper exit after FINISHED publication', () => !sameObservedProcess(runnerIdentity as { pid: number; startTicks: string }), 10_000);
    const recoveryActive = parseCliJson<RecoveryView>(layout, 'r2-cli-recover-active', [
      'recover', '--track', opened.value.track.id, '--json',
    ]).value;
    assert.equal(findingCodes(recoveryActive).includes('HEALTHY'), true, `Expected HEALTHY after adoption, got ${findingCodes(recoveryActive).join(',')}.`);
    const activePhysical = recoveryActive.observed.leases.find(
      (candidate) => candidate.path === reconciled.worktreePath,
    );
    assert.equal(activePhysical?.leaseId, reconciled.externalLeaseId);
    assert.equal(activePhysical?.holder, reconciled.holder);
    assert.equal(activePhysical?.sourcePath, source);

    const releaseKey = `r2-release-${layout.runId}`;
    const released = parseCliJson<LeaseView>(layout, 'r2-cli-lease-release', [
      'lease', 'release', '--lease', reconciled.id,
      '--expected-version', String(reconciled.version),
      '--idempotency-key', releaseKey, '--json',
    ]).value;
    assert.equal(released.status, 'RELEASED');
    assert.equal(released.externalLeaseId, reconciled.externalLeaseId);
    assert.equal(released.holder, reconciled.holder);
    assert.equal(released.worktreePath, reconciled.worktreePath);
    const operationsAfterRelease = actionOperations(layout);
    assert.equal(operationsAfterRelease.length, 2);
    const releaseOperation = operationsAfterRelease.find((operation) => operation.kind === 'RELEASE');
    assert.deepEqual(releaseOperation?.argv, [
      'return', reconciled.worktreePath, '--if-lease-id', reconciled.externalLeaseId,
      '--if-lease-holder', reconciled.holder,
    ]);
    const repeated = parseCliJson<LeaseView>(layout, 'r2-cli-lease-release-idempotent', [
      'lease', 'release', '--lease', reconciled.id,
      '--expected-version', String(reconciled.version),
      '--idempotency-key', releaseKey, '--json',
    ]).value;
    assert.deepEqual(repeated, released);
    assert.equal(actionOperations(layout).length, 2, 'Idempotent release published another action.');

    const finalRecovery = parseCliJson<RecoveryView>(layout, 'r2-cli-recover-released', [
      'recover', '--track', opened.value.track.id, '--json',
    ]).value;
    assert.equal(findingCodes(finalRecovery).includes('HEALTHY'), true, `Expected HEALTHY after release, got ${findingCodes(finalRecovery).join(',')}.`);
    const available = finalRecovery.observed.leases.find((candidate) => candidate.path === released.worktreePath);
    assert.equal(available?.status, 'available');
    assert.equal('leaseId' in (available ?? {}), false);
    assert.equal('holder' in (available ?? {}), false);
    assert.equal('leasedAt' in (available ?? {}), false);
    const sqlite = sqliteEvidence(layout);
    const canonicalFinal = captureGitSnapshot(layout, 'r2-canonical-final');
    assert.equal(canonicalFinal.status, '');
    assert.equal(canonicalFinal.head, canonicalBeforeTrack.head);
    assert.equal(canonicalFinal.tree, canonicalBeforeTrack.tree);
    const hostileMarkers = [
      join(layout.evidence, 'managed-helper-invoked.jsonl'),
      join(layout.project, 'bin', 'managed-helper-invoked.jsonl'),
      join(source, 'bin', 'managed-helper-invoked.jsonl'),
    ];
    for (const marker of hostileMarkers) assert.equal(existsSync(marker), false, `hostile helper invoked: ${marker}`);
    writeEvidence(layout, 'r2-final-observations.json', {
      recoveryWhileStarted,
      recoveryActive,
      finalRecovery,
      published,
      leadIdentity,
      poolRoot,
      treehouseChild,
      reconciled,
      released,
      repeated,
      actionOperations: operationsAfterRelease,
      sqlite,
      canonicalFinal,
      hostileMarkers,
    });
    return {
      status: 'GREEN',
      runId: layout.runId,
      root: layout.root,
      track: opened.value.track,
      attempt: opened.value.attempt,
      sourceEvidence,
      crashWindow: published,
      leadIdentity,
      poolRoot,
      treehouseChild,
      leadResult,
      recoveryWhileStarted,
      physicalLease: physicalLease,
      reconciledLease: reconciled,
      recoveryActive,
      releasedLease: released,
      repeatedRelease: repeated,
      finalRecovery,
      actionOperations: operationsAfterRelease,
      sqlite,
      canonicalFinal,
      hostileMarkers,
    };
  } catch (error) {
    primaryFailure = error;
    throw error;
  } finally {
    let leadAbsent = false;
    let leadCleanupError: string | undefined;
    let leadCloseUnconfirmed = false;
    let leadHandleFallbackUsed = false;
    let leadSignalSent = false;
    const recordLeadCleanupError = (error: unknown): void => {
      const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
      leadCleanupError = leadCleanupError === undefined ? message : `${leadCleanupError}; ${message}`;
    };
    if (leadIdentity !== undefined) {
      if (sameObservedProcess(leadIdentity)) {
        try {
          signalObservedProcess(leadIdentity, 'SIGKILL');
          leadSignalSent = true;
        } catch (error) {
          recordLeadCleanupError(error);
        }
      }
    }
    if (leadGrant !== undefined && !leadSignalSent) {
      leadHandleFallbackUsed = true;
      try {
        if (leadGrant.child.exitCode === null && leadGrant.child.signalCode === null) {
          if (leadGrant.child.kill('SIGKILL')) {
            leadKilled = true;
          } else {
            recordLeadCleanupError('Lead ChildProcess.kill(SIGKILL) returned false.');
          }
        }
      } catch (error) {
        recordLeadCleanupError(error);
      }
    }
    if (leadGrant !== undefined) {
      try {
        const leadResult = await awaitCommandResultBounded(leadGrant, LEAD_CLEANUP_TIMEOUT_MS);
        if (leadResult !== undefined) {
          leadKilled ||= leadResult.signal === 'SIGKILL';
          leadAbsent = true;
        } else {
          leadCloseUnconfirmed = true;
          leadAbsent = false;
          recordLeadCleanupError(`Lead process close did not settle within ${LEAD_CLEANUP_TIMEOUT_MS}ms.`);
          try {
            if (leadGrant.child.kill('SIGKILL')) {
              leadKilled = true;
            } else {
              recordLeadCleanupError('Lead retry ChildProcess.kill(SIGKILL) returned false.');
            }
          } catch (error) {
            recordLeadCleanupError(error);
          }
          try {
            const retryResult = await awaitCommandResultBounded(leadGrant, LEAD_CLEANUP_TIMEOUT_MS);
            if (retryResult !== undefined) {
              leadAbsent = true;
              leadCloseUnconfirmed = false;
              leadKilled ||= retryResult.signal === 'SIGKILL';
            } else {
              recordLeadCleanupError(`Lead retry close did not settle within ${LEAD_CLEANUP_TIMEOUT_MS}ms.`);
            }
          } catch (error) {
            recordLeadCleanupError(error);
          }
        }
      } catch (error) {
        leadCloseUnconfirmed = true;
        leadAbsent = false;
        recordLeadCleanupError(error);
      }
    }
    if (leadIdentity !== undefined) {
      try {
        await waitFor('real Lead absence after cleanup', () => !sameObservedProcess(leadIdentity as { pid: number; startTicks: string }), 2_000);
        if (!leadCloseUnconfirmed) leadAbsent = true;
      } catch (error) {
        if (!leadCloseUnconfirmed) leadAbsent = !sameObservedProcess(leadIdentity);
        recordLeadCleanupError(error);
      }
    }
    let helperAbsent: boolean | undefined;
    let helperCleanupError: string | undefined;
    if (runnerIdentity !== undefined && runnerStopped && sameObservedProcess(runnerIdentity)) {
      try {
        signalObservedProcess(runnerIdentity, 'SIGCONT');
        runnerStopped = false;
      } catch (error) {
        helperCleanupError = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
      }
    }
    if (runnerIdentity !== undefined && sameObservedProcess(runnerIdentity)) {
      try {
        await waitFor('real helper cleanup', () => !sameObservedProcess(runnerIdentity as { pid: number; startTicks: string }), 2_000);
        helperAbsent = true;
      } catch {
        if (sameObservedProcess(runnerIdentity)) {
          try {
            signalObservedProcessGroup(runnerIdentity, 'SIGTERM');
            await new Promise<void>((resolveWait) => setTimeout(resolveWait, 100));
            if (sameObservedProcess(runnerIdentity)) signalObservedProcessGroup(runnerIdentity, 'SIGKILL');
          } catch (error) {
            helperCleanupError = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
          }
          try {
            await waitFor('real helper absence after group cleanup', () => !sameObservedProcess(runnerIdentity as { pid: number; startTicks: string }), 2_000);
            helperAbsent = true;
          } catch (error) {
            helperAbsent = !sameObservedProcess(runnerIdentity);
            helperCleanupError ??= error instanceof Error ? `${error.name}: ${error.message}` : String(error);
          }
        }
      }
    } else if (runnerIdentity !== undefined) {
      helperAbsent = true;
    }
    try {
      writeEvidence(layout, 'r2-cleanup-processes.json', {
        cleanupEvidenceWritten: true,
        primaryFailure: primaryFailure instanceof Error
          ? { name: primaryFailure.name, message: primaryFailure.message }
          : primaryFailure === undefined ? null : String(primaryFailure),
        lead: {
          identity: leadIdentity,
          killed: leadKilled,
          handleFallbackUsed: leadHandleFallbackUsed,
          absent: leadAbsent,
          cleanupError: leadCleanupError ?? null,
        },
        helper: {
          identity: runnerIdentity,
          stoppedAtCleanup: runnerStopped,
          absent: helperAbsent,
          cleanupError: helperCleanupError ?? null,
        },
      });
      cleanupEvidenceWritten = true;
    } catch (error) {
      cleanupEvidenceError = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    }
    if (primaryFailure === undefined) {
      assert.equal(cleanupEvidenceWritten, true, cleanupEvidenceError ?? 'Cleanup evidence was not written.');
      assert.equal(leadAbsent, true, leadCleanupError ?? 'Lead process remained present after fenced cleanup.');
      if (runnerIdentity !== undefined) {
        assert.equal(helperAbsent, true, 'Helper process remained present after fenced cleanup.');
      }
    }
  }
}

test('R1 executes the real Track/Attempt, independent source, Treehouse lease and fenced release', () => {
  let layout: Layout | undefined;
  let completed = false;
  try {
    layout = createLayout();
    const prepared = prepareFixture(layout);
    const result = runR1Lifecycle(layout, prepared);
    writeEvidence(layout, 'r1-final-evidence.json', result);
    writeEvidence(layout, 'cleanup-authorized.json', {
      runId: layout.runId,
      status: 'GREEN',
      evidencePath: 'evidence/r1-final-evidence.json',
      capturedAt: new Date().toISOString(),
      cleanup: 'fixture-only run root removal after evidence publication',
    });
    completed = true;
  } catch (error) {
    if (layout !== undefined) {
      preserveFailureEvidence(layout.root, layout.evidence, layout.runId, 'r1-real-lifecycle', error);
    }
    throw error;
  } finally {
    if (completed && layout !== undefined) rmSync(layout.root, { recursive: true, force: true });
  }
});

test('R2 recovers a real STARTED grant after Lead termination without repeating get', async () => {
  let layout: Layout | undefined;
  try {
    layout = createLayout();
    const prepared = prepareFixture(layout);
    const result = await runR2Lifecycle(layout, prepared);
    writeEvidence(layout, 'r2-final-evidence.json', result);
  } catch (error) {
    if (layout !== undefined) {
      preserveFailureEvidence(layout.root, layout.evidence, layout.runId, 'r2-real-lifecycle', error);
    }
    throw error;
  }
});
