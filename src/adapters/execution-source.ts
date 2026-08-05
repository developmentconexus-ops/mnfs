import { createHash } from 'node:crypto';
import {
  closeSync,
  existsSync,
  fsyncSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  openSync,
  readdirSync,
  readFileSync,
  realpathSync,
  renameSync,
  rmSync,
} from 'node:fs';
import {
  basename,
  dirname,
  isAbsolute,
  join,
  relative,
  resolve,
} from 'node:path';
import { TextDecoder } from 'node:util';

import { MnfsError, type MnfsErrorCode } from '../domain/errors.js';
import type { GitObjectFormat } from '../execution/model.js';
import { resolveExecutionSourcePath } from '../runtime/paths.js';
import type { ProcessResult, ProcessSpec } from '../runtime/process-runner.js';
import type {
  GitRepositoryObservation,
  GitWorktreeInspector,
} from './git-worktree.js';

const COMMAND_TIMEOUT_MS = 30_000;
const COMMAND_OUTPUT_LIMIT_BYTES = 1_048_576;
const FATAL_UTF8 = new TextDecoder('utf-8', { fatal: true });
const REPOSITORY_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
const TEMP_NAME_PATTERN = /^source\.tmp-[A-Za-z0-9._-]+$/;
const SHA1_PATTERN = /^[0-9a-f]{40}$/;
const SHA256_PATTERN = /^[0-9a-f]{64}$/;

export interface PrepareExecutionSourceInput {
  readonly repositoryId: string;
  readonly trackId: string;
  readonly attemptId: string;
  readonly canonicalCheckoutPath: string;
  readonly baseCommitSha: string;
  readonly gitObjectFormat: GitObjectFormat;
}

export interface ReadyExecutionSource {
  readonly status: 'READY';
  readonly sourcePath: string;
  readonly fingerprint: string;
  readonly observation: GitRepositoryObservation;
}

export interface DivergedExecutionSource {
  readonly status: 'DIVERGED';
  readonly sourcePath: string;
  readonly reasonCode: Extract<
    MnfsErrorCode,
    | 'EXECUTION_SOURCE_INVALID'
    | 'EXECUTION_SOURCE_CHANGED'
    | 'EXECUTION_SOURCE_REMOTE_PRESENT'
    | 'EXECUTION_SOURCE_SHARED_OBJECTS'
  >;
}

export type PrepareExecutionSourceResult = ReadyExecutionSource | DivergedExecutionSource;

export interface ExecutionSourceAdapterInput {
  readonly runtimeRoot: string;
  readonly gitExecutable: string;
  readonly runProcess: (spec: ProcessSpec) => Promise<ProcessResult>;
  readonly gitInspector: Pick<
    GitWorktreeInspector,
    'observeRepository' | 'observeWorktrees' | 'requireCommit' | 'requireTree'
  >;
  readonly environment: Readonly<Record<string, string>>;
}

interface VerifiedSource {
  readonly observation: GitRepositoryObservation;
  readonly branch: string;
  readonly fingerprint: string;
}

function isBelowMount(path: string): boolean {
  const absolute = resolve(path);
  return absolute === '/mnt' || absolute.startsWith('/mnt/');
}

function requireAbsoluteLinuxPath(path: string, label: string): string {
  if (
    !isAbsolute(path)
    || path.includes('\0')
    || path.includes('\n')
    || path.includes('\r')
  ) {
    throw new MnfsError('EXECUTION_SOURCE_INVALID', `${label} must be an absolute single-line path.`);
  }
  const absolute = resolve(path);
  if (isBelowMount(absolute)) {
    throw new MnfsError(
      'LINUX_FILESYSTEM_REQUIRED',
      `${label} must be on a Linux-owned filesystem: ${absolute}.`,
    );
  }
  return absolute;
}

function requireExistingRealDirectory(path: string, label: string): string {
  const absolute = requireAbsoluteLinuxPath(path, label);
  let stat;
  try {
    stat = lstatSync(absolute);
  } catch (error) {
    throw new MnfsError(
      'EXECUTION_SOURCE_INVALID',
      `${label} is not available: ${error instanceof Error ? error.message : String(error)}.`,
    );
  }
  if (!stat.isDirectory() || stat.isSymbolicLink() || realpathSync(absolute) !== absolute) {
    throw new MnfsError('EXECUTION_SOURCE_INVALID', `${label} must be one real directory without symlinks.`);
  }
  return absolute;
}

function ensureContained(parent: string, child: string, label: string): void {
  const suffix = relative(parent, child);
  if (suffix.length === 0 || suffix === '..' || suffix.startsWith(`..${process.platform === 'win32' ? '\\' : '/'}`) || isAbsolute(suffix)) {
    throw new MnfsError('EXECUTION_SOURCE_INVALID', `${label} escaped its expected parent.`);
  }
}

function controlledEnvironment(
  environment: Readonly<Record<string, string>>,
  hooksPath: string,
): Readonly<Record<string, string>> {
  const result: Record<string, string> = { ...environment };
  for (const name of [
    'HTTP_PROXY',
    'HTTPS_PROXY',
    'ALL_PROXY',
    'NO_PROXY',
    'http_proxy',
    'https_proxy',
    'all_proxy',
    'no_proxy',
    'GIT_ASKPASS',
    'SSH_ASKPASS',
    'SSH_AUTH_SOCK',
    'GIT_PROXY_COMMAND',
    'GIT_SSH',
    'GIT_SSH_COMMAND',
    'GIT_DIR',
    'GIT_WORK_TREE',
    'GIT_INDEX_FILE',
    'GIT_OBJECT_DIRECTORY',
    'GIT_ALTERNATE_OBJECT_DIRECTORIES',
  ]) {
    delete result[name];
  }
  result.GIT_CONFIG_GLOBAL = '/dev/null';
  result.GIT_CONFIG_NOSYSTEM = '1';
  result.GIT_TERMINAL_PROMPT = '0';
  result.GCM_INTERACTIVE = 'Never';
  result.GIT_OPTIONAL_LOCKS = '0';
  result.GIT_ALLOW_PROTOCOL = 'file';
  result.GIT_CONFIG_COUNT = '2';
  result.GIT_CONFIG_KEY_0 = 'core.hooksPath';
  result.GIT_CONFIG_VALUE_0 = hooksPath;
  result.GIT_CONFIG_KEY_1 = 'credential.helper';
  result.GIT_CONFIG_VALUE_1 = '';
  return Object.freeze(result);
}

function decodeOneLine(bytes: Buffer, label: string): string {
  let text: string;
  try {
    text = FATAL_UTF8.decode(bytes);
  } catch {
    throw new MnfsError('EXECUTION_SOURCE_INVALID', `${label} is not valid UTF-8.`);
  }
  if (text.includes('\0') || text.includes('\r')) {
    throw new MnfsError('EXECUTION_SOURCE_INVALID', `${label} contains invalid control bytes.`);
  }
  const value = text.endsWith('\n') ? text.slice(0, -1) : text;
  if (value.length === 0 || value.includes('\n')) {
    throw new MnfsError('EXECUTION_SOURCE_INVALID', `${label} must contain exactly one line.`);
  }
  return value;
}

function requireObjectId(value: string, format: GitObjectFormat): string {
  const pattern = format === 'sha1' ? SHA1_PATTERN : SHA256_PATTERN;
  if (!pattern.test(value)) {
    throw new MnfsError('GIT_OBJECT_INVALID', `Malformed ${format} object id: ${value}.`);
  }
  return value;
}

function repositorySemanticSnapshot(observation: GitRepositoryObservation): string {
  return JSON.stringify({
    repositoryPath: observation.repositoryPath,
    gitDirPath: observation.gitDirPath,
    commonDirPath: observation.commonDirPath,
    objectDirPath: observation.objectDirPath,
    objectFormat: observation.objectFormat,
    headCommitSha: observation.headCommitSha,
    headTreeSha: observation.headTreeSha,
    status: observation.statusPorcelainV1Z.toString('hex'),
    remotes: [...observation.remotes],
  });
}

function listRegularFiles(root: string): string[] {
  if (!existsSync(root)) return [];
  const result: string[] = [];
  const visit = (directory: string): void => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isSymbolicLink()) {
        throw new MnfsError('EXECUTION_SOURCE_SHARED_OBJECTS', `Object storage contains a symlink: ${path}.`);
      }
      if (entry.isDirectory()) visit(path);
      else if (entry.isFile()) result.push(path);
      else throw new MnfsError('EXECUTION_SOURCE_SHARED_OBJECTS', `Unexpected object storage entry: ${path}.`);
    }
  };
  visit(root);
  return result.sort();
}

function inodeKey(path: string): string {
  const stat = lstatSync(path);
  return `${stat.dev}:${stat.ino}`;
}

function objectStorageFingerprint(root: string): readonly Readonly<Record<string, string | number>>[] {
  return listRegularFiles(root).map((path) => {
    const stat = lstatSync(path);
    return {
      path: relative(root, path),
      size: stat.size,
      sha256: createHash('sha256').update(readFileSync(path)).digest('hex'),
    };
  });
}

function fsyncDirectory(path: string): void {
  const descriptor = openSync(path, 'r');
  try {
    fsyncSync(descriptor);
  } finally {
    closeSync(descriptor);
  }
}

function divergence(
  sourcePath: string,
  reasonCode: DivergedExecutionSource['reasonCode'],
): DivergedExecutionSource {
  return { status: 'DIVERGED', sourcePath, reasonCode };
}

export class ExecutionSourceAdapter {
  readonly #runtimeRoot: string;
  readonly #gitExecutable: string;
  readonly #runProcess: (spec: ProcessSpec) => Promise<ProcessResult>;
  readonly #gitInspector: ExecutionSourceAdapterInput['gitInspector'];
  readonly #environment: Readonly<Record<string, string>>;

  constructor(input: ExecutionSourceAdapterInput) {
    this.#runtimeRoot = requireAbsoluteLinuxPath(input.runtimeRoot, 'Execution runtime root');
    this.#gitExecutable = requireAbsoluteLinuxPath(input.gitExecutable, 'Git executable');
    this.#runProcess = input.runProcess;
    this.#gitInspector = input.gitInspector;
    this.#environment = Object.freeze({ ...input.environment });
  }

  async #git(
    cwd: string,
    args: readonly string[],
    environment: Readonly<Record<string, string>>,
  ): Promise<Buffer> {
    const result = await this.#runProcess({
      executable: this.#gitExecutable,
      args: [...args],
      cwd,
      env: environment,
      timeoutMs: COMMAND_TIMEOUT_MS,
      stdoutLimitBytes: COMMAND_OUTPUT_LIMIT_BYTES,
      stderrLimitBytes: COMMAND_OUTPUT_LIMIT_BYTES,
    });
    if (result.exitCode !== 0 || result.signal !== null || result.timedOut) {
      const evidence = result.stderr.subarray(0, 512).toString('utf8').trim();
      throw new MnfsError(
        'EXECUTION_SOURCE_INVALID',
        `Git ${args.join(' ')} failed${evidence.length === 0 ? '' : `: ${evidence}`}.`,
      );
    }
    return Buffer.from(result.stdout);
  }

  #removeRecognizedIncompleteTemps(parent: string): void {
    if (!existsSync(parent)) return;
    for (const entry of readdirSync(parent, { withFileTypes: true })) {
      if (!TEMP_NAME_PATTERN.test(entry.name)) continue;
      const path = join(parent, entry.name);
      if (entry.isSymbolicLink() || !entry.isDirectory() || realpathSync(path) !== path) {
        continue;
      }
      const children = readdirSync(path);
      if (children.length === 1 && children[0] === '.git') {
        const gitPath = join(path, '.git');
        const gitStat = lstatSync(gitPath);
        if (gitStat.isDirectory() && !gitStat.isSymbolicLink()) {
          rmSync(path, { recursive: true, force: false });
        }
      }
    }
  }

  async #verifySource(input: {
    readonly sourcePath: string;
    readonly canonicalObservation: GitRepositoryObservation;
    readonly baseCommitSha: string;
    readonly baseTreeSha: string;
    readonly gitObjectFormat: GitObjectFormat;
    readonly environment: Readonly<Record<string, string>>;
  }): Promise<VerifiedSource | DivergedExecutionSource> {
    let observation: GitRepositoryObservation;
    try {
      observation = await this.#gitInspector.observeRepository(input.sourcePath);
    } catch {
      return divergence(input.sourcePath, 'EXECUTION_SOURCE_INVALID');
    }

    if (observation.remotes.length !== 0) {
      return divergence(input.sourcePath, 'EXECUTION_SOURCE_REMOTE_PRESENT');
    }
    if (
      observation.objectFormat !== input.gitObjectFormat
      || observation.headCommitSha !== input.baseCommitSha
      || observation.headTreeSha !== input.baseTreeSha
      || observation.statusPorcelainV1Z.length !== 0
    ) {
      return divergence(input.sourcePath, 'EXECUTION_SOURCE_CHANGED');
    }

    const branch = decodeOneLine(
      await this.#git(
        input.sourcePath,
        ['rev-parse', '--abbrev-ref', 'HEAD'],
        input.environment,
      ),
      'Execution source branch',
    );
    if (branch !== 'main') {
      return divergence(input.sourcePath, 'EXECUTION_SOURCE_CHANGED');
    }

    const sourceCommon = resolve(observation.commonDirPath);
    const sourceObjects = resolve(observation.objectDirPath);
    const canonicalCommon = resolve(input.canonicalObservation.commonDirPath);
    const canonicalObjects = resolve(input.canonicalObservation.objectDirPath);
    if (sourceCommon === canonicalCommon || sourceObjects === canonicalObjects) {
      return divergence(input.sourcePath, 'EXECUTION_SOURCE_SHARED_OBJECTS');
    }
    const sourceRelativeCommon = relative(input.sourcePath, sourceCommon);
    const sourceRelativeObjects = relative(input.sourcePath, sourceObjects);
    if (
      sourceRelativeCommon.startsWith('..')
      || sourceRelativeObjects.startsWith('..')
      || isAbsolute(sourceRelativeCommon)
      || isAbsolute(sourceRelativeObjects)
    ) {
      return divergence(input.sourcePath, 'EXECUTION_SOURCE_SHARED_OBJECTS');
    }

    const alternates = join(sourceObjects, 'info', 'alternates');
    if (existsSync(alternates)) {
      return divergence(input.sourcePath, 'EXECUTION_SOURCE_SHARED_OBJECTS');
    }

    let sourceFiles: string[];
    let canonicalFiles: string[];
    try {
      sourceFiles = listRegularFiles(sourceObjects);
      canonicalFiles = listRegularFiles(canonicalObjects);
    } catch {
      return divergence(input.sourcePath, 'EXECUTION_SOURCE_SHARED_OBJECTS');
    }
    if (sourceFiles.length === 0) {
      return divergence(input.sourcePath, 'EXECUTION_SOURCE_INVALID');
    }
    const canonicalInodes = new Set(canonicalFiles.map(inodeKey));
    for (const sourceFile of sourceFiles) {
      const stat = lstatSync(sourceFile);
      if (stat.nlink !== 1 || canonicalInodes.has(inodeKey(sourceFile))) {
        return divergence(input.sourcePath, 'EXECUTION_SOURCE_SHARED_OBJECTS');
      }
    }

    const fingerprint = `sha256:${createHash('sha256').update(JSON.stringify({
      schemaVersion: 1,
      sourcePath: input.sourcePath,
      observation: JSON.parse(repositorySemanticSnapshot(observation)) as unknown,
      branch,
      objects: objectStorageFingerprint(sourceObjects),
    })).digest('hex')}`;
    return { observation, branch, fingerprint };
  }

  async prepare(input: PrepareExecutionSourceInput): Promise<PrepareExecutionSourceResult> {
    if (!REPOSITORY_ID_PATTERN.test(input.repositoryId)) {
      throw new MnfsError('EXECUTION_SOURCE_INVALID', `Invalid repository id: ${input.repositoryId}.`);
    }
    const runtimeRoot = requireExistingRealDirectory(this.#runtimeRoot, 'Execution runtime root');
    if (basename(runtimeRoot) !== input.repositoryId) {
      throw new MnfsError(
        'EXECUTION_SOURCE_INVALID',
        `Runtime root ${runtimeRoot} is not owned by repository ${input.repositoryId}.`,
      );
    }
    const canonicalPath = requireExistingRealDirectory(
      input.canonicalCheckoutPath,
      'Canonical checkout',
    );
    const baseCommitSha = requireObjectId(input.baseCommitSha, input.gitObjectFormat);
    const finalPath = resolveExecutionSourcePath(runtimeRoot, input.trackId, input.attemptId);
    ensureContained(runtimeRoot, finalPath, 'Execution source path');
    const parent = dirname(finalPath);
    mkdirSync(parent, { recursive: true, mode: 0o700 });
    if (realpathSync(parent) !== parent) {
      throw new MnfsError('EXECUTION_SOURCE_INVALID', 'Execution source parent contains a symlink.');
    }
    const hooksPath = join(parent, '.empty-hooks');
    mkdirSync(hooksPath, { recursive: true, mode: 0o700 });
    const environment = controlledEnvironment(this.#environment, hooksPath);

    const canonicalBefore = await this.#gitInspector.observeRepository(canonicalPath);
    if (canonicalBefore.objectFormat !== input.gitObjectFormat) {
      throw new MnfsError('GIT_OBJECT_INVALID', 'Canonical repository object format does not match the Attempt.');
    }
    await this.#gitInspector.requireCommit(canonicalPath, baseCommitSha);
    const baseTreeSha = requireObjectId(
      decodeOneLine(
        await this.#git(
          canonicalPath,
          ['rev-parse', '--verify', `${baseCommitSha}^{tree}`],
          environment,
        ),
        'Attempt base tree',
      ),
      input.gitObjectFormat,
    );
    await this.#gitInspector.requireTree(canonicalPath, baseTreeSha);

    if (existsSync(finalPath)) {
      const finalStat = lstatSync(finalPath);
      if (!finalStat.isDirectory() || finalStat.isSymbolicLink() || realpathSync(finalPath) !== finalPath) {
        return divergence(finalPath, 'EXECUTION_SOURCE_INVALID');
      }
      const verified = await this.#verifySource({
        sourcePath: finalPath,
        canonicalObservation: canonicalBefore,
        baseCommitSha,
        baseTreeSha,
        gitObjectFormat: input.gitObjectFormat,
        environment,
      });
      if ('status' in verified) return verified;
      const canonicalAfter = await this.#gitInspector.observeRepository(canonicalPath);
      if (repositorySemanticSnapshot(canonicalAfter) !== repositorySemanticSnapshot(canonicalBefore)) {
        return divergence(finalPath, 'EXECUTION_SOURCE_CHANGED');
      }
      return {
        status: 'READY',
        sourcePath: finalPath,
        fingerprint: verified.fingerprint,
        observation: verified.observation,
      };
    }

    this.#removeRecognizedIncompleteTemps(parent);
    const temporaryPath = mkdtempSync(join(parent, 'source.tmp-'));
    ensureContained(parent, temporaryPath, 'Temporary execution source');

    await this.#git(parent, ['init', `--object-format=${input.gitObjectFormat}`, temporaryPath], environment);
    await this.#git(parent, [
      '-C',
      temporaryPath,
      '-c',
      'protocol.file.allow=always',
      'fetch',
      '--no-tags',
      '--no-write-fetch-head',
      canonicalPath,
      baseCommitSha,
    ], environment);
    await this.#git(parent, [
      '-C',
      temporaryPath,
      'update-ref',
      'refs/heads/main',
      baseCommitSha,
    ], environment);
    await this.#git(parent, [
      '-C',
      temporaryPath,
      'checkout',
      '-B',
      'main',
      baseCommitSha,
    ], environment);

    const verifiedTemporary = await this.#verifySource({
      sourcePath: temporaryPath,
      canonicalObservation: canonicalBefore,
      baseCommitSha,
      baseTreeSha,
      gitObjectFormat: input.gitObjectFormat,
      environment,
    });
    if ('status' in verifiedTemporary) return verifiedTemporary;

    const canonicalAfterAction = await this.#gitInspector.observeRepository(canonicalPath);
    if (repositorySemanticSnapshot(canonicalAfterAction) !== repositorySemanticSnapshot(canonicalBefore)) {
      return divergence(temporaryPath, 'EXECUTION_SOURCE_CHANGED');
    }
    if (existsSync(finalPath)) {
      return divergence(finalPath, 'EXECUTION_SOURCE_INVALID');
    }
    renameSync(temporaryPath, finalPath);
    fsyncDirectory(parent);

    const verifiedFinal = await this.#verifySource({
      sourcePath: finalPath,
      canonicalObservation: canonicalBefore,
      baseCommitSha,
      baseTreeSha,
      gitObjectFormat: input.gitObjectFormat,
      environment,
    });
    if ('status' in verifiedFinal) return verifiedFinal;
    const canonicalAfterPublish = await this.#gitInspector.observeRepository(canonicalPath);
    if (repositorySemanticSnapshot(canonicalAfterPublish) !== repositorySemanticSnapshot(canonicalBefore)) {
      return divergence(finalPath, 'EXECUTION_SOURCE_CHANGED');
    }

    return {
      status: 'READY',
      sourcePath: finalPath,
      fingerprint: verifiedFinal.fingerprint,
      observation: verifiedFinal.observation,
    };
  }
}
