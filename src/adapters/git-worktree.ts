import { isAbsolute, resolve } from 'node:path';
import { TextDecoder } from 'node:util';

import { MnfsError, type MnfsErrorCode } from '../domain/errors.js';
import type { GitObjectFormat } from '../execution/model.js';
import type { ProcessResult, ProcessSpec } from '../runtime/process-runner.js';

const READ_TIMEOUT_MS = 10_000;
const READ_OUTPUT_LIMIT_BYTES = 1_048_576;
const FATAL_UTF8 = new TextDecoder('utf-8', { fatal: true });
const SHA1_PATTERN = /^[0-9a-f]{40}$/;
const SHA256_PATTERN = /^[0-9a-f]{64}$/;
const ENVIRONMENT_ALLOWLIST = ['PATH', 'HOME', 'TMPDIR', 'LANG', 'LC_ALL', 'TZ'] as const;
const OWNED_GIT_CONFIG = [
  ['core.fsmonitor', 'false'],
  ['core.hooksPath', '/dev/null'],
  ['credential.helper', ''],
  ['uploadpack.packObjectsHook', ''],
] as const;

export interface GitRepositoryObservation {
  readonly repositoryPath: string;
  readonly gitDirPath: string;
  readonly commonDirPath: string;
  readonly objectDirPath: string;
  readonly objectFormat: GitObjectFormat;
  readonly headCommitSha: string;
  readonly headTreeSha: string;
  readonly statusPorcelainV1Z: Buffer;
  readonly remotes: readonly string[];
}

export interface GitWorktreeObservation {
  readonly path: string;
  readonly headSha: string;
  readonly branch?: string;
  readonly detached: boolean;
  readonly bare: boolean;
  readonly lockedReason?: string;
  readonly prunableReason?: string;
}

export interface GitObjectObservation {
  readonly sha: string;
  readonly objectFormat: GitObjectFormat;
}

export interface GitWorktreeInspectorInput {
  readonly gitExecutable: string;
  readonly runProcess: (spec: ProcessSpec) => Promise<ProcessResult>;
  readonly environment: Readonly<Record<string, string>>;
}

function controlledGitEnvironment(
  environment: Readonly<Record<string, string>>,
): Readonly<Record<string, string>> {
  const result: Record<string, string> = {};
  for (const name of ENVIRONMENT_ALLOWLIST) {
    const value = environment[name];
    if (value !== undefined) result[name] = value;
  }

  result.GIT_CONFIG_GLOBAL = '/dev/null';
  result.GIT_CONFIG_NOSYSTEM = '1';
  result.GIT_TERMINAL_PROMPT = '0';
  result.GCM_INTERACTIVE = 'Never';
  result.GIT_OPTIONAL_LOCKS = '0';
  result.GIT_NO_LAZY_FETCH = '1';
  result.GIT_CONFIG_COUNT = String(OWNED_GIT_CONFIG.length);
  for (const [index, [key, value]] of OWNED_GIT_CONFIG.entries()) {
    result[`GIT_CONFIG_KEY_${index}`] = key;
    result[`GIT_CONFIG_VALUE_${index}`] = value;
  }
  return Object.freeze(result);
}

function requireAbsolutePath(path: string, code: MnfsErrorCode): string {
  if (!isAbsolute(path) || path.includes('\0') || path.includes('\n') || path.includes('\r')) {
    throw new MnfsError(code, `Git path must be one absolute single-line path: ${path}.`);
  }
  return resolve(path);
}

function decodeUtf8(bytes: Buffer, code: MnfsErrorCode, label: string): string {
  try {
    return FATAL_UTF8.decode(bytes);
  } catch {
    throw new MnfsError(code, `${label} is not valid UTF-8.`);
  }
}

function oneLine(bytes: Buffer, code: MnfsErrorCode, label: string): string {
  const text = decodeUtf8(bytes, code, label);
  if (text.includes('\0') || text.includes('\r')) {
    throw new MnfsError(code, `${label} contains invalid control bytes.`);
  }
  const withoutFinalNewline = text.endsWith('\n') ? text.slice(0, -1) : text;
  if (withoutFinalNewline.length === 0 || withoutFinalNewline.includes('\n')) {
    throw new MnfsError(code, `${label} must contain exactly one non-empty line.`);
  }
  return withoutFinalNewline;
}

function requireObjectFormat(value: string, code: MnfsErrorCode): GitObjectFormat {
  if (value !== 'sha1' && value !== 'sha256') {
    throw new MnfsError(code, `Unsupported Git object format: ${value}.`);
  }
  return value;
}

function requireObjectId(
  value: string,
  objectFormat: GitObjectFormat,
  code: MnfsErrorCode,
): string {
  const pattern = objectFormat === 'sha1' ? SHA1_PATTERN : SHA256_PATTERN;
  if (!pattern.test(value)) {
    throw new MnfsError(code, `Malformed ${objectFormat} Git object id: ${value}.`);
  }
  return value;
}

function requirePotentialObjectId(value: string): string {
  if (!SHA1_PATTERN.test(value) && !SHA256_PATTERN.test(value)) {
    throw new MnfsError('GIT_OBJECT_INVALID', `Malformed Git object id: ${value}.`);
  }
  return value;
}

function commandFailure(
  code: MnfsErrorCode,
  args: readonly string[],
  result: ProcessResult,
): never {
  const evidence = result.stderr.subarray(0, 512).toString('utf8').trim();
  throw new MnfsError(
    code,
    `Git ${args.join(' ')} failed${evidence.length === 0 ? '' : `: ${evidence}`}.`,
  );
}

export class GitWorktreeInspector {
  readonly #gitExecutable: string;
  readonly #runProcess: (spec: ProcessSpec) => Promise<ProcessResult>;
  readonly #environment: Readonly<Record<string, string>>;

  constructor(input: GitWorktreeInspectorInput) {
    this.#gitExecutable = requireAbsolutePath(input.gitExecutable, 'GIT_WORKTREE_INVALID');
    this.#runProcess = input.runProcess;
    this.#environment = controlledGitEnvironment(input.environment);
  }

  async #git(
    cwd: string,
    args: readonly string[],
    code: MnfsErrorCode,
  ): Promise<Buffer> {
    const repositoryPath = requireAbsolutePath(cwd, code);
    const result = await this.#runProcess({
      executable: this.#gitExecutable,
      args: [...args],
      cwd: repositoryPath,
      env: this.#environment,
      timeoutMs: READ_TIMEOUT_MS,
      stdoutLimitBytes: READ_OUTPUT_LIMIT_BYTES,
      stderrLimitBytes: READ_OUTPUT_LIMIT_BYTES,
    });
    if (result.exitCode !== 0 || result.signal !== null || result.timedOut) {
      commandFailure(code, args, result);
    }
    return Buffer.from(result.stdout);
  }

  async #objectFormat(path: string, code: MnfsErrorCode): Promise<GitObjectFormat> {
    const stdout = await this.#git(path, ['rev-parse', '--show-object-format'], code);
    return requireObjectFormat(oneLine(stdout, code, 'Git object format'), code);
  }

  async observeRepository(path: string): Promise<GitRepositoryObservation> {
    const requestedPath = requireAbsolutePath(path, 'GIT_WORKTREE_INVALID');
    const repositoryPath = requireAbsolutePath(
      oneLine(
        await this.#git(requestedPath, ['rev-parse', '--show-toplevel'], 'GIT_WORKTREE_INVALID'),
        'GIT_WORKTREE_INVALID',
        'Git repository path',
      ),
      'GIT_WORKTREE_INVALID',
    );
    if (repositoryPath !== requestedPath) {
      throw new MnfsError(
        'GIT_WORKTREE_INVALID',
        `Git repository observation escaped the requested root: ${repositoryPath}.`,
      );
    }

    const gitDirPath = requireAbsolutePath(
      oneLine(
        await this.#git(repositoryPath, ['rev-parse', '--absolute-git-dir'], 'GIT_WORKTREE_INVALID'),
        'GIT_WORKTREE_INVALID',
        'Git directory path',
      ),
      'GIT_WORKTREE_INVALID',
    );
    const commonRaw = oneLine(
      await this.#git(repositoryPath, ['rev-parse', '--git-common-dir'], 'GIT_WORKTREE_INVALID'),
      'GIT_WORKTREE_INVALID',
      'Git common directory path',
    );
    const objectsRaw = oneLine(
      await this.#git(repositoryPath, ['rev-parse', '--git-path', 'objects'], 'GIT_WORKTREE_INVALID'),
      'GIT_WORKTREE_INVALID',
      'Git object directory path',
    );
    const commonDirPath = requireAbsolutePath(
      isAbsolute(commonRaw) ? commonRaw : resolve(repositoryPath, commonRaw),
      'GIT_WORKTREE_INVALID',
    );
    const objectDirPath = requireAbsolutePath(
      isAbsolute(objectsRaw) ? objectsRaw : resolve(repositoryPath, objectsRaw),
      'GIT_WORKTREE_INVALID',
    );
    const objectFormat = await this.#objectFormat(repositoryPath, 'GIT_WORKTREE_INVALID');
    const headCommitSha = requireObjectId(
      oneLine(
        await this.#git(repositoryPath, ['rev-parse', '--verify', 'HEAD'], 'GIT_WORKTREE_INVALID'),
        'GIT_WORKTREE_INVALID',
        'Git HEAD commit',
      ),
      objectFormat,
      'GIT_WORKTREE_INVALID',
    );
    const headTreeSha = requireObjectId(
      oneLine(
        await this.#git(
          repositoryPath,
          ['rev-parse', '--verify', 'HEAD^{tree}'],
          'GIT_WORKTREE_INVALID',
        ),
        'GIT_WORKTREE_INVALID',
        'Git HEAD tree',
      ),
      objectFormat,
      'GIT_WORKTREE_INVALID',
    );
    const statusPorcelainV1Z = await this.#git(
      repositoryPath,
      ['status', '--porcelain=v1', '-z', '--untracked-files=all'],
      'GIT_WORKTREE_INVALID',
    );
    const remoteText = decodeUtf8(
      await this.#git(repositoryPath, ['remote'], 'GIT_WORKTREE_INVALID'),
      'GIT_WORKTREE_INVALID',
      'Git remote list',
    );
    if (remoteText.includes('\0') || remoteText.includes('\r')) {
      throw new MnfsError('GIT_WORKTREE_INVALID', 'Git remote list contains invalid control bytes.');
    }
    const remotes = remoteText
      .split('\n')
      .filter((value) => value.length > 0)
      .map((value) => {
        if (value.trim() !== value || /\s/.test(value)) {
          throw new MnfsError('GIT_WORKTREE_INVALID', `Invalid Git remote name: ${value}.`);
        }
        return value;
      })
      .sort();
    if (new Set(remotes).size !== remotes.length) {
      throw new MnfsError('GIT_WORKTREE_INVALID', 'Git remote list contains duplicates.');
    }

    return {
      repositoryPath,
      gitDirPath,
      commonDirPath,
      objectDirPath,
      objectFormat,
      headCommitSha,
      headTreeSha,
      statusPorcelainV1Z: Buffer.from(statusPorcelainV1Z),
      remotes,
    };
  }

  async observeWorktrees(path: string): Promise<readonly GitWorktreeObservation[]> {
    const repositoryPath = requireAbsolutePath(path, 'GIT_WORKTREE_INVALID');
    const text = decodeUtf8(
      await this.#git(
        repositoryPath,
        ['worktree', 'list', '--porcelain'],
        'GIT_WORKTREE_INVALID',
      ),
      'GIT_WORKTREE_INVALID',
      'Git worktree list',
    );
    if (text.includes('\0') || text.includes('\r')) {
      throw new MnfsError('GIT_WORKTREE_INVALID', 'Git worktree list contains invalid control bytes.');
    }

    const records = text
      .split(/\n\n/)
      .map((record) => record.trimEnd())
      .filter((record) => record.length > 0);
    const paths = new Set<string>();
    const observations: GitWorktreeObservation[] = [];

    for (const record of records) {
      let worktreePath: string | undefined;
      let headSha: string | undefined;
      let branch: string | undefined;
      let detached = false;
      let bare = false;
      let lockedReason: string | undefined;
      let prunableReason: string | undefined;

      for (const line of record.split('\n')) {
        const separator = line.indexOf(' ');
        const key = separator === -1 ? line : line.slice(0, separator);
        const value = separator === -1 ? '' : line.slice(separator + 1);
        switch (key) {
          case 'worktree':
            if (worktreePath !== undefined || value.length === 0) {
              throw new MnfsError('GIT_WORKTREE_INVALID', 'Duplicate or empty worktree path.');
            }
            worktreePath = requireAbsolutePath(value, 'GIT_WORKTREE_INVALID');
            break;
          case 'HEAD':
            if (headSha !== undefined || (!SHA1_PATTERN.test(value) && !SHA256_PATTERN.test(value))) {
              throw new MnfsError('GIT_WORKTREE_INVALID', `Invalid worktree HEAD: ${value}.`);
            }
            headSha = value;
            break;
          case 'branch':
            if (branch !== undefined || !value.startsWith('refs/heads/')) {
              throw new MnfsError('GIT_WORKTREE_INVALID', `Invalid worktree branch: ${value}.`);
            }
            branch = value;
            break;
          case 'detached':
            if (value.length !== 0 || detached) {
              throw new MnfsError('GIT_WORKTREE_INVALID', 'Invalid detached worktree marker.');
            }
            detached = true;
            break;
          case 'bare':
            if (value.length !== 0 || bare) {
              throw new MnfsError('GIT_WORKTREE_INVALID', 'Invalid bare worktree marker.');
            }
            bare = true;
            break;
          case 'locked':
            if (lockedReason !== undefined) {
              throw new MnfsError('GIT_WORKTREE_INVALID', 'Duplicate worktree lock marker.');
            }
            lockedReason = value;
            break;
          case 'prunable':
            if (prunableReason !== undefined) {
              throw new MnfsError('GIT_WORKTREE_INVALID', 'Duplicate prunable worktree marker.');
            }
            prunableReason = value;
            break;
          default:
            throw new MnfsError('GIT_WORKTREE_INVALID', `Unknown worktree field: ${key}.`);
        }
      }

      if (
        worktreePath === undefined
        || headSha === undefined
        || (branch === undefined && !detached && !bare)
        || (branch !== undefined && (detached || bare))
        || (detached && bare)
        || paths.has(worktreePath)
      ) {
        throw new MnfsError('GIT_WORKTREE_INVALID', 'Incomplete or conflicting worktree record.');
      }
      paths.add(worktreePath);
      observations.push({
        path: worktreePath,
        headSha,
        ...(branch === undefined ? {} : { branch }),
        detached,
        bare,
        ...(lockedReason === undefined ? {} : { lockedReason }),
        ...(prunableReason === undefined ? {} : { prunableReason }),
      });
    }

    return observations;
  }

  async requireCommit(path: string, sha: string): Promise<GitObjectObservation> {
    return await this.#requireObject(path, sha, 'commit');
  }

  async requireTree(path: string, sha: string): Promise<GitObjectObservation> {
    return await this.#requireObject(path, sha, 'tree');
  }

  async #requireObject(
    path: string,
    sha: string,
    type: 'commit' | 'tree',
  ): Promise<GitObjectObservation> {
    const repositoryPath = requireAbsolutePath(path, 'GIT_OBJECT_INVALID');
    requirePotentialObjectId(sha);
    const objectFormat = await this.#objectFormat(repositoryPath, 'GIT_OBJECT_INVALID');
    requireObjectId(sha, objectFormat, 'GIT_OBJECT_INVALID');
    await this.#git(
      repositoryPath,
      ['cat-file', '-e', `${sha}^{${type}}`],
      'GIT_OBJECT_INVALID',
    );
    return { sha, objectFormat };
  }
}
