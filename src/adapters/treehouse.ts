import { lstat, readdir } from 'node:fs/promises';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { TextDecoder } from 'node:util';

import type { GitRepositoryObservation } from './git-worktree.js';
import { MnfsError, type MnfsErrorCode } from '../domain/errors.js';
import type { GitObjectFormat } from '../execution/model.js';
import type { ProcessResult, ProcessSpec } from '../runtime/process-runner.js';

export const TREEHOUSE_COMMAND_SHAPE_SHA256 =
  'sha256:f2077cfd037cbaefdcfc94385a0cfeb7e1647ef294ca8ceee3cd61a1b109dc84';

const PROCESS_TIMEOUT_MS = 30_000;
const OUTPUT_LIMIT_BYTES = 65_536;
const ACCEPTED_TREEHOUSE_VERSION = '2.1.1';
const FATAL_UTF8 = new TextDecoder('utf-8', { fatal: true });
const SHA256_PATTERN = /^sha256:[0-9a-f]{64}$/;
const SHA1_OBJECT_PATTERN = /^[0-9a-f]{40}$/;
const SHA256_OBJECT_PATTERN = /^[0-9a-f]{64}$/;
const SAFE_VALUE_PATTERN = /^[^\0\n\r]+$/;
const CAPABILITY_FLAG_PATTERN = /--[a-z0-9-]+/gu;
const RFC3339_TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/u;

export interface ReadyTreehouseSourceIdentity {
  readonly fingerprint: string;
  readonly baseCommitSha: string;
  readonly baseTreeSha: string;
  readonly objectFormat: GitObjectFormat;
}

export interface TreehouseBoundary {
  readonly sourcePath: string;
  readonly canonicalCheckoutPath: string;
  readonly homePath: string;
  readonly xdgConfigHome: string;
  readonly poolRoot: string;
  readonly hooksPath: string;
  readonly readySource: ReadyTreehouseSourceIdentity;
}

export interface AcceptedTreehouseCandidate {
  readonly executableSha256: string;
  readonly semanticVersion: '2.1.1';
  readonly commandShapeSha256: string;
  readonly nodeVersion: string;
  readonly gitVersion: string;
  readonly kernelRelease: string;
  readonly ubuntuRelease: string;
}

export interface TreehouseLeaseObservation {
  readonly path: string;
  readonly leaseId: string;
  readonly leaseHolder: string;
  readonly leasedAt: string;
}

export interface TreehouseStatusProcess {
  readonly pid: number;
  readonly name: string;
}

export interface TreehouseStatusItem {
  readonly name: string;
  readonly path: string;
  readonly status: 'available' | 'leased';
  readonly leaseId?: string;
  readonly leaseHolder?: string;
  readonly leasedAt?: string;
  readonly processes: readonly TreehouseStatusProcess[];
}

export interface TreehouseSourceIntegrityInput {
  readonly sourcePath: string;
  readonly canonicalCheckoutPath: string;
  readonly baseCommitSha: string;
  readonly baseTreeSha: string;
  readonly gitObjectFormat: GitObjectFormat;
}

export interface TreehouseSourceIntegrityObservation {
  readonly status: 'READY';
  readonly sourcePath: string;
  readonly fingerprint: string;
  readonly observation: GitRepositoryObservation;
}

export interface TreehouseAdapterInput {
  readonly acceptedCandidate: AcceptedTreehouseCandidate;
  readonly runProcess: (spec: ProcessSpec) => Promise<ProcessResult>;
  readonly resolveExecutable: (name: 'treehouse' | 'git' | 'uname') => Promise<string>;
  readonly hashFile: (path: string) => Promise<string>;
  readonly readTextFile: (path: string) => Promise<string>;
  readonly realpath: (path: string) => Promise<string>;
  readonly nodeVersion: () => string;
  readonly osReleasePath: string;
  readonly environment: Readonly<Record<string, string>>;
  readonly gitInspector: {
    observeRepository(path: string): Promise<GitRepositoryObservation>;
  };
  readonly sourceIntegrity: {
    observeReadySource(
      input: TreehouseSourceIntegrityInput,
    ): Promise<TreehouseSourceIntegrityObservation>;
  };
}

interface ValidatedBoundary {
  readonly sourcePath: string;
  readonly canonicalPath: string;
  readonly homePath: string;
  readonly xdgConfigHome: string;
  readonly poolRoot: string;
  readonly hooksPath: string;
  readonly readySource: ReadyTreehouseSourceIdentity;
}

interface FreshContext {
  readonly treehouseExecutable: string;
  readonly environment: Readonly<Record<string, string>>;
  readonly boundary: ValidatedBoundary;
}

type JsonRecord = Record<string, unknown>;

function fail(code: MnfsErrorCode, message: string): never {
  throw new MnfsError(code, message);
}

function isMountedPath(path: string): boolean {
  return path === '/mnt' || path.startsWith('/mnt/');
}

function requireStringValue(value: unknown, label: string, code: MnfsErrorCode): string {
  if (typeof value !== 'string' || !SAFE_VALUE_PATTERN.test(value)) {
    fail(code, `${label} must be one non-empty single-line string.`);
  }
  return value;
}

function requireAbsolutePath(value: string, label: string, code: MnfsErrorCode): string {
  requireStringValue(value, label, code);
  if (!isAbsolute(value)) {
    fail(code, `${label} must be absolute.`);
  }
  const absolute = resolve(value);
  if (absolute !== value || isMountedPath(absolute)) {
    fail(code, `${label} is outside the accepted Linux boundary.`);
  }
  return absolute;
}

function isContained(parent: string, child: string): boolean {
  const suffix = relative(parent, child);
  return suffix.length > 0
    && suffix !== '..'
    && !suffix.startsWith(`..${sep}`)
    && !isAbsolute(suffix);
}

function pathsOverlap(first: string, second: string): boolean {
  return first === second || isContained(first, second) || isContained(second, first);
}

function decodeUtf8(bytes: Buffer, label: string): string {
  try {
    return FATAL_UTF8.decode(bytes);
  } catch {
    fail('TREEHOUSE_OUTPUT_INVALID', `${label} is not valid UTF-8.`);
  }
}

function decodeUtf8ForCode(
  bytes: Buffer,
  label: string,
  code: MnfsErrorCode,
): string {
  try {
    return FATAL_UTF8.decode(bytes);
  } catch {
    fail(code, `${label} is not valid UTF-8.`);
  }
}

function decodeOneLine(
  bytes: Buffer,
  label: string,
  code: MnfsErrorCode,
): string {
  const text = decodeUtf8ForCode(bytes, label, code);
  if (text.includes('\0') || text.includes('\r')) {
    fail(code, `${label} contains invalid control bytes.`);
  }
  const value = text.endsWith('\n') ? text.slice(0, -1) : text;
  if (value.length === 0 || value.includes('\n')) {
    fail(code, `${label} must contain exactly one line.`);
  }
  return value;
}

function combineCapabilityStreams(result: ProcessResult): Buffer {
  const errorBytes = result.stderr;
  return Buffer.concat([Buffer.from(result.stdout), Buffer.from('\n'), Buffer.from(errorBytes)]);
}

function decodeCapabilityEvidence(bytes: Buffer, label: string): string {
  const text = decodeUtf8ForCode(bytes, label, 'TREEHOUSE_VERSION_UNSUPPORTED');
  if (text.indexOf('\0') !== -1) {
    fail('TREEHOUSE_VERSION_UNSUPPORTED', `${label} contains invalid control bytes.`);
  }
  return text;
}

function extractCapabilityFlags(text: string): ReadonlySet<string> {
  const flags = new Set<string>();
  for (const found of text.matchAll(CAPABILITY_FLAG_PATTERN)) {
    const value = found[0];
    if (value !== undefined) flags.add(value);
  }
  return flags;
}

function parseOneJsonValue(bytes: Buffer, label: string): unknown {
  const text = decodeUtf8(bytes, label);
  if (text.trim().length === 0) {
    fail('TREEHOUSE_OUTPUT_INVALID', `${label} is empty.`);
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    fail('TREEHOUSE_OUTPUT_INVALID', `${label} must contain exactly one JSON value.`);
  }
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function requireExactKeys(
  record: JsonRecord,
  expected: readonly string[],
  label: string,
): void {
  const actual = Object.keys(record).sort();
  const wanted = [...expected].sort();
  if (actual.length !== wanted.length || actual.some((key, index) => key !== wanted[index])) {
    fail('TREEHOUSE_OUTPUT_INVALID', `${label} has an unexpected shape.`);
  }
}

function requireIsoTimestamp(value: unknown, label: string): string {
  const timestamp = requireStringValue(value, label, 'TREEHOUSE_OUTPUT_INVALID');
  if (!RFC3339_TIMESTAMP_PATTERN.test(timestamp) || !Number.isFinite(Date.parse(timestamp))) {
    fail('TREEHOUSE_OUTPUT_INVALID', `${label} must be a valid RFC3339 timestamp.`);
  }
  return timestamp;
}

function processSpec(
  executable: string,
  args: readonly string[],
  sourcePath: string,
  environment: Readonly<Record<string, string>>,
): ProcessSpec {
  return {
    executable,
    args: [...args],
    cwd: sourcePath,
    env: environment,
    timeoutMs: PROCESS_TIMEOUT_MS,
    stdoutLimitBytes: OUTPUT_LIMIT_BYTES,
    stderrLimitBytes: OUTPUT_LIMIT_BYTES,
  };
}

function requireSuccessfulResult(
  result: ProcessResult,
  timeoutCode: MnfsErrorCode,
  failureCode: MnfsErrorCode,
  label: string,
): ProcessResult {
  if (result.timedOut) {
    fail(timeoutCode, `${label} timed out.`);
  }
  if (result.exitCode !== 0 || result.signal !== null) {
    fail(failureCode, `${label} failed with exit code ${String(result.exitCode)}.`);
  }
  return result;
}

function requireSuccessfulProcess(
  result: ProcessResult,
  timeoutCode: MnfsErrorCode,
  failureCode: MnfsErrorCode,
  label: string,
): Buffer {
  return Buffer.from(requireSuccessfulResult(result, timeoutCode, failureCode, label).stdout);
}

function parseTreehouseVersion(bytes: Buffer): string {
  const raw = decodeOneLine(bytes, 'Treehouse version', 'TREEHOUSE_VERSION_UNSUPPORTED');
  const semantic = raw.startsWith('v') ? raw.slice(1) : raw;
  if (semantic !== ACCEPTED_TREEHOUSE_VERSION || (raw.startsWith('v') && raw.startsWith('vv'))) {
    fail('TREEHOUSE_VERSION_UNSUPPORTED', `Unsupported Treehouse version: ${raw}.`);
  }
  return semantic;
}

function parseGitVersion(bytes: Buffer): string {
  const raw = decodeOneLine(bytes, 'Git version', 'TREEHOUSE_OBSERVATION_CONFLICT');
  const prefix = 'git version ';
  if (!raw.startsWith(prefix) || raw.length === prefix.length) {
    fail('TREEHOUSE_OBSERVATION_CONFLICT', 'Git returned an invalid version string.');
  }
  return raw.slice(prefix.length);
}

function parseUbuntuRelease(text: string): Readonly<{ id: string; version: string }> {
  const values = new Map<string, string>();
  for (const rawLine of text.split('\n')) {
    if (rawLine.length === 0) continue;
    const separator = rawLine.indexOf('=');
    if (separator <= 0) continue;
    const key = rawLine.slice(0, separator);
    let value = rawLine.slice(separator + 1);
    if (value.startsWith('"') && value.endsWith('"') && value.length >= 2) {
      value = value.slice(1, -1);
    }
    values.set(key, value);
  }
  const id = values.get('ID');
  const version = values.get('VERSION_ID');
  if (id === undefined || version === undefined) {
    fail('TREEHOUSE_OBSERVATION_CONFLICT', 'Ubuntu release evidence is incomplete.');
  }
  return { id, version };
}

function requireCapabilities(
  getHelp: string,
  statusHelp: string,
  returnHelp: string,
): void {
  const getFlags = extractCapabilityFlags(getHelp);
  const statusFlags = extractCapabilityFlags(statusHelp);
  const returnFlags = extractCapabilityFlags(returnHelp);
  const accepted = getFlags.has('--lease')
    && getFlags.has('--lease-holder')
    && getFlags.has('--json')
    && statusFlags.has('--json')
    && returnFlags.has('--if-lease-id')
    && returnFlags.has('--if-lease-holder');
  if (!accepted) {
    fail('TREEHOUSE_VERSION_UNSUPPORTED', 'Treehouse is missing an accepted capability.');
  }
}

function requireReadySourceIdentity(value: unknown): ReadyTreehouseSourceIdentity {
  if (!isRecord(value)) {
    fail('TREEHOUSE_OBSERVATION_CONFLICT', 'Treehouse boundary is missing READY-source identity.');
  }
  requireExactRuntimeKeys(
    value,
    ['fingerprint', 'baseCommitSha', 'baseTreeSha', 'objectFormat'],
    'READY-source identity',
  );
  const fingerprint = requireStringValue(
    value.fingerprint,
    'READY-source fingerprint',
    'TREEHOUSE_OBSERVATION_CONFLICT',
  );
  if (!SHA256_PATTERN.test(fingerprint)) {
    fail('TREEHOUSE_OBSERVATION_CONFLICT', 'READY-source fingerprint is malformed.');
  }
  const objectFormat = value.objectFormat;
  if (objectFormat !== 'sha1' && objectFormat !== 'sha256') {
    fail('TREEHOUSE_OBSERVATION_CONFLICT', 'READY-source object format is unsupported.');
  }
  const objectPattern = objectFormat === 'sha1' ? SHA1_OBJECT_PATTERN : SHA256_OBJECT_PATTERN;
  const baseCommitSha = requireStringValue(
    value.baseCommitSha,
    'READY-source base commit',
    'TREEHOUSE_OBSERVATION_CONFLICT',
  );
  const baseTreeSha = requireStringValue(
    value.baseTreeSha,
    'READY-source base tree',
    'TREEHOUSE_OBSERVATION_CONFLICT',
  );
  if (!objectPattern.test(baseCommitSha) || !objectPattern.test(baseTreeSha)) {
    fail('TREEHOUSE_OBSERVATION_CONFLICT', 'READY-source Git identity is malformed.');
  }
  return { fingerprint, baseCommitSha, baseTreeSha, objectFormat };
}

function requireExactRuntimeKeys(
  record: JsonRecord,
  expected: readonly string[],
  label: string,
): void {
  const actual = Object.keys(record).sort();
  const wanted = [...expected].sort();
  if (actual.length !== wanted.length || actual.some((key, index) => key !== wanted[index])) {
    fail('TREEHOUSE_OBSERVATION_CONFLICT', `${label} has an unexpected shape.`);
  }
}

function canonicalTreehouseConfig(poolRoot: string): string {
  return `max_trees = 2\nroot = ${JSON.stringify(poolRoot)}\n`;
}

function exactEntries(actual: readonly string[], expected: readonly string[]): boolean {
  const sorted = [...actual].sort();
  const wanted = [...expected].sort();
  return sorted.length === wanted.length
    && sorted.every((value, index) => value === wanted[index]);
}

function buildEnvironment(
  treehouseExecutable: string,
  gitExecutable: string,
  boundary: ValidatedBoundary,
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

function repositoryMatchesReadyIdentity(
  repository: GitRepositoryObservation,
  boundary: ValidatedBoundary,
): boolean {
  return repository.repositoryPath === boundary.sourcePath
    && repository.objectFormat === boundary.readySource.objectFormat
    && repository.headCommitSha === boundary.readySource.baseCommitSha
    && repository.headTreeSha === boundary.readySource.baseTreeSha
    && repository.statusPorcelainV1Z.length === 0
    && repository.remotes.length === 0;
}

export class TreehouseAdapter {
  readonly #acceptedCandidate: AcceptedTreehouseCandidate;
  readonly #runProcess: (spec: ProcessSpec) => Promise<ProcessResult>;
  readonly #resolveExecutable: TreehouseAdapterInput['resolveExecutable'];
  readonly #hashFile: TreehouseAdapterInput['hashFile'];
  readonly #readTextFile: TreehouseAdapterInput['readTextFile'];
  readonly #realpath: TreehouseAdapterInput['realpath'];
  readonly #nodeVersion: TreehouseAdapterInput['nodeVersion'];
  readonly #osReleasePath: string;
  readonly #gitInspector: TreehouseAdapterInput['gitInspector'];
  readonly #sourceIntegrity: TreehouseAdapterInput['sourceIntegrity'] | undefined;

  constructor(input: TreehouseAdapterInput) {
    this.#acceptedCandidate = input.acceptedCandidate;
    this.#runProcess = input.runProcess;
    this.#resolveExecutable = input.resolveExecutable;
    this.#hashFile = input.hashFile;
    this.#readTextFile = input.readTextFile;
    this.#realpath = input.realpath;
    this.#nodeVersion = input.nodeVersion;
    this.#osReleasePath = input.osReleasePath;
    this.#gitInspector = input.gitInspector;
    this.#sourceIntegrity = input.sourceIntegrity;
    void input.environment;
  }

  async #realDirectory(value: string, label: string): Promise<string> {
    const absolute = requireAbsolutePath(value, label, 'TREEHOUSE_OBSERVATION_CONFLICT');
    let canonical: string;
    try {
      canonical = await this.#realpath(absolute);
    } catch {
      fail('TREEHOUSE_OBSERVATION_CONFLICT', `${label} cannot be resolved.`);
    }
    if (canonical !== absolute) {
      fail('TREEHOUSE_OBSERVATION_CONFLICT', `${label} must not be a symbolic path.`);
    }
    return canonical;
  }

  async #validateBoundary(boundary: TreehouseBoundary): Promise<ValidatedBoundary> {
    const sourceValue = boundary.sourcePath;
    const canonicalValue = boundary.canonicalCheckoutPath;
    const homeValue = boundary.homePath;
    const xdgValue = boundary.xdgConfigHome;
    const poolValue = boundary.poolRoot;
    const hooksValue = boundary.hooksPath;

    const sourcePath = await this.#realDirectory(sourceValue, 'Treehouse source');
    const canonicalPath = await this.#realDirectory(canonicalValue, 'Canonical checkout');
    const homePath = await this.#realDirectory(homeValue, 'Treehouse HOME');
    const xdgConfigHome = await this.#realDirectory(xdgValue, 'Treehouse XDG config');
    const poolRoot = await this.#realDirectory(poolValue, 'Treehouse pool');
    const hooksPath = await this.#realDirectory(hooksValue, 'Treehouse hooks');
    const readySource = requireReadySourceIdentity(boundary.readySource as unknown);

    if (pathsOverlap(sourcePath, canonicalPath)) {
      fail('TREEHOUSE_OBSERVATION_CONFLICT', 'Treehouse source overlaps the canonical checkout.');
    }
    if (xdgConfigHome !== join(homePath, '.config')) {
      fail(
        'TREEHOUSE_OBSERVATION_CONFLICT',
        'Treehouse XDG config must be the controlled HOME/.config directory.',
      );
    }
    const controlled = [homePath, poolRoot, hooksPath];
    for (const path of controlled) {
      if (pathsOverlap(sourcePath, path) || pathsOverlap(canonicalPath, path)) {
        fail('TREEHOUSE_OBSERVATION_CONFLICT', 'Treehouse runtime path overlaps a repository boundary.');
      }
    }
    for (let first = 0; first < controlled.length; first += 1) {
      for (let second = first + 1; second < controlled.length; second += 1) {
        const firstPath = controlled[first];
        const secondPath = controlled[second];
        if (firstPath === undefined || secondPath === undefined) {
          fail('INTERNAL_ERROR', 'Treehouse runtime path validation is incomplete.');
        }
        if (pathsOverlap(firstPath, secondPath)) {
          fail('TREEHOUSE_OBSERVATION_CONFLICT', 'Treehouse controlled runtime paths overlap.');
        }
      }
    }

    return {
      sourcePath,
      canonicalPath,
      homePath,
      xdgConfigHome,
      poolRoot,
      hooksPath,
      readySource,
    };
  }

  async #validateControlledContent(boundary: ValidatedBoundary): Promise<void> {
    const configDirectory = join(boundary.xdgConfigHome, 'treehouse');
    const configPath = join(configDirectory, 'config.toml');
    const repositoryConfigPath = join(boundary.sourcePath, 'treehouse.toml');
    let canonicalConfigDirectory: string;
    let canonicalConfigPath: string;
    let configText: string;
    let xdgEntries: string[];
    let configEntries: string[];
    let hookEntries: string[];

    try {
      const [configDirectoryStat, configStat] = await Promise.all([
        lstat(configDirectory),
        lstat(configPath),
      ]);
      if (
        !configDirectoryStat.isDirectory()
        || configDirectoryStat.isSymbolicLink()
        || !configStat.isFile()
        || configStat.isSymbolicLink()
        || configStat.nlink !== 1
      ) {
        fail('TREEHOUSE_OBSERVATION_CONFLICT', 'Treehouse user configuration has an unsafe filesystem shape.');
      }
      [
        canonicalConfigDirectory,
        canonicalConfigPath,
        configText,
        xdgEntries,
        configEntries,
        hookEntries,
      ] = await Promise.all([
        this.#realpath(configDirectory),
        this.#realpath(configPath),
        this.#readTextFile(configPath),
        readdir(boundary.xdgConfigHome),
        readdir(configDirectory),
        readdir(boundary.hooksPath),
      ]);
    } catch (error) {
      if (error instanceof MnfsError) throw error;
      fail('TREEHOUSE_OBSERVATION_CONFLICT', 'Treehouse controlled configuration cannot be observed.');
    }

    if (
      canonicalConfigDirectory !== configDirectory
      || canonicalConfigPath !== configPath
      || !exactEntries(xdgEntries, ['treehouse'])
      || !exactEntries(configEntries, ['config.toml'])
      || hookEntries.length !== 0
    ) {
      fail('TREEHOUSE_OBSERVATION_CONFLICT', 'Treehouse XDG configuration or hooks differ from the accepted shape.');
    }

    const expectedConfig = canonicalTreehouseConfig(boundary.poolRoot);
    if (configText !== expectedConfig) {
      fail('TREEHOUSE_OBSERVATION_CONFLICT', 'Treehouse user configuration differs from the accepted pool binding.');
    }

    try {
      const repositoryConfigStat = await lstat(repositoryConfigPath);
      if (
        !repositoryConfigStat.isFile()
        || repositoryConfigStat.isSymbolicLink()
        || repositoryConfigStat.nlink !== 1
      ) {
        fail('TREEHOUSE_OBSERVATION_CONFLICT', 'Repository Treehouse configuration has an unsafe filesystem shape.');
      }
      const [canonicalRepositoryConfig, repositoryConfigText] = await Promise.all([
        this.#realpath(repositoryConfigPath),
        this.#readTextFile(repositoryConfigPath),
      ]);
      if (
        canonicalRepositoryConfig !== repositoryConfigPath
        || repositoryConfigText !== expectedConfig
      ) {
        fail('TREEHOUSE_OBSERVATION_CONFLICT', 'Repository Treehouse configuration overrides the accepted policy.');
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return;
      if (error instanceof MnfsError) throw error;
      fail('TREEHOUSE_OBSERVATION_CONFLICT', 'Repository Treehouse configuration cannot be observed safely.');
    }
  }

  async #validateReadySource(boundary: ValidatedBoundary): Promise<void> {
    if (this.#sourceIntegrity === undefined) {
      fail('TREEHOUSE_OBSERVATION_CONFLICT', 'READY-source integrity authority is unavailable.');
    }

    let observedIntegrity: TreehouseSourceIntegrityObservation;
    let repository: GitRepositoryObservation;
    try {
      [observedIntegrity, repository] = await Promise.all([
        this.#sourceIntegrity.observeReadySource({
          sourcePath: boundary.sourcePath,
          canonicalCheckoutPath: boundary.canonicalPath,
          baseCommitSha: boundary.readySource.baseCommitSha,
          baseTreeSha: boundary.readySource.baseTreeSha,
          gitObjectFormat: boundary.readySource.objectFormat,
        }),
        this.#gitInspector.observeRepository(boundary.sourcePath),
      ]);
    } catch {
      fail('TREEHOUSE_OBSERVATION_CONFLICT', 'READY-source integrity could not be observed.');
    }

    if (
      observedIntegrity.status !== 'READY'
      || observedIntegrity.sourcePath !== boundary.sourcePath
      || observedIntegrity.fingerprint !== boundary.readySource.fingerprint
      || !repositoryMatchesReadyIdentity(observedIntegrity.observation, boundary)
      || !repositoryMatchesReadyIdentity(repository, boundary)
    ) {
      fail('TREEHOUSE_OBSERVATION_CONFLICT', 'Attempt source differs from its accepted READY identity.');
    }
  }

  async #resolveTool(name: 'treehouse' | 'git' | 'uname'): Promise<string> {
    let discovered: string;
    try {
      discovered = await this.#resolveExecutable(name);
    } catch {
      fail('TREEHOUSE_NOT_FOUND', `Required executable ${name} was not found.`);
    }
    const absolute = requireAbsolutePath(discovered, `${name} executable`, 'TREEHOUSE_NOT_FOUND');
    let canonical: string;
    try {
      canonical = await this.#realpath(absolute);
    } catch {
      fail('TREEHOUSE_NOT_FOUND', `Required executable ${name} cannot be resolved.`);
    }
    return requireAbsolutePath(canonical, `${name} executable`, 'TREEHOUSE_NOT_FOUND');
  }

  async #provenanceResult(
    executable: string,
    args: readonly string[],
    sourcePath: string,
    environment: Readonly<Record<string, string>>,
    label: string,
    code: MnfsErrorCode,
  ): Promise<ProcessResult> {
    const result = await this.#runProcess(processSpec(executable, args, sourcePath, environment));
    return requireSuccessfulResult(result, code, code, label);
  }

  async #provenanceCommand(
    executable: string,
    args: readonly string[],
    sourcePath: string,
    environment: Readonly<Record<string, string>>,
    label: string,
    code: MnfsErrorCode,
  ): Promise<Buffer> {
    return Buffer.from((await this.#provenanceResult(
      executable,
      args,
      sourcePath,
      environment,
      label,
      code,
    )).stdout);
  }

  async #capabilityEvidence(
    executable: string,
    args: readonly string[],
    sourcePath: string,
    environment: Readonly<Record<string, string>>,
    label: string,
  ): Promise<string> {
    const result = await this.#provenanceResult(
      executable,
      args,
      sourcePath,
      environment,
      label,
      'TREEHOUSE_VERSION_UNSUPPORTED',
    );
    return decodeCapabilityEvidence(combineCapabilityStreams(result), label);
  }

  async #freshContext(boundaryInput: TreehouseBoundary): Promise<FreshContext> {
    const boundary = await this.#validateBoundary(boundaryInput);
    await this.#validateControlledContent(boundary);
    await this.#validateReadySource(boundary);

    const treehouseExecutable = await this.#resolveTool('treehouse');
    const gitExecutable = await this.#resolveTool('git');
    const unameExecutable = await this.#resolveTool('uname');
    const environment = buildEnvironment(treehouseExecutable, gitExecutable, boundary);

    if (this.#acceptedCandidate.commandShapeSha256 !== TREEHOUSE_COMMAND_SHAPE_SHA256) {
      fail('TREEHOUSE_OBSERVATION_CONFLICT', 'Treehouse command shape no longer matches the accepted candidate.');
    }
    if (!SHA256_PATTERN.test(this.#acceptedCandidate.executableSha256)) {
      fail('TREEHOUSE_VERSION_UNSUPPORTED', 'Accepted Treehouse executable hash is malformed.');
    }

    let executableHash: string;
    try {
      executableHash = await this.#hashFile(treehouseExecutable);
    } catch {
      fail('TREEHOUSE_NOT_FOUND', 'Treehouse executable bytes cannot be read.');
    }
    if (executableHash !== this.#acceptedCandidate.executableSha256) {
      fail('TREEHOUSE_VERSION_UNSUPPORTED', 'Treehouse executable bytes differ from the accepted candidate.');
    }

    const version = parseTreehouseVersion(await this.#provenanceCommand(
      treehouseExecutable,
      ['--version'],
      boundary.sourcePath,
      environment,
      'Treehouse version command',
      'TREEHOUSE_VERSION_UNSUPPORTED',
    ));
    const getHelp = await this.#capabilityEvidence(
      treehouseExecutable,
      ['get', '--help'],
      boundary.sourcePath,
      environment,
      'Treehouse get help',
    );
    const statusHelp = await this.#capabilityEvidence(
      treehouseExecutable,
      ['status', '--help'],
      boundary.sourcePath,
      environment,
      'Treehouse status help',
    );
    const returnHelp = await this.#capabilityEvidence(
      treehouseExecutable,
      ['return', '--help'],
      boundary.sourcePath,
      environment,
      'Treehouse return help',
    );
    requireCapabilities(getHelp, statusHelp, returnHelp);

    if (version !== this.#acceptedCandidate.semanticVersion) {
      fail('TREEHOUSE_VERSION_UNSUPPORTED', 'Treehouse semantic version differs from the accepted candidate.');
    }

    const gitVersion = parseGitVersion(await this.#provenanceCommand(
      gitExecutable,
      ['--version'],
      boundary.sourcePath,
      environment,
      'Git version command',
      'TREEHOUSE_OBSERVATION_CONFLICT',
    ));
    const kernelRelease = decodeOneLine(await this.#provenanceCommand(
      unameExecutable,
      ['-r'],
      boundary.sourcePath,
      environment,
      'Kernel observation command',
      'TREEHOUSE_OBSERVATION_CONFLICT',
    ), 'Kernel release', 'TREEHOUSE_OBSERVATION_CONFLICT');

    let osReleaseText: string;
    try {
      osReleaseText = await this.#readTextFile(this.#osReleasePath);
    } catch {
      fail('TREEHOUSE_OBSERVATION_CONFLICT', 'Ubuntu release evidence cannot be read.');
    }
    const ubuntu = parseUbuntuRelease(osReleaseText);
    const nodeVersion = this.#nodeVersion();

    if (
      gitVersion !== this.#acceptedCandidate.gitVersion
      || nodeVersion !== this.#acceptedCandidate.nodeVersion
      || kernelRelease !== this.#acceptedCandidate.kernelRelease
      || ubuntu.id !== 'ubuntu'
      || ubuntu.version !== this.#acceptedCandidate.ubuntuRelease
    ) {
      fail('TREEHOUSE_OBSERVATION_CONFLICT', 'Treehouse host provenance differs from the accepted candidate.');
    }

    return { treehouseExecutable, environment, boundary };
  }

  async #canonicalPoolPath(path: string, poolRoot: string): Promise<string> {
    const absolute = requireAbsolutePath(path, 'Treehouse worktree path', 'TREEHOUSE_OUTPUT_INVALID');
    let canonical: string;
    try {
      canonical = await this.#realpath(absolute);
    } catch {
      fail('TREEHOUSE_OUTPUT_INVALID', 'Treehouse worktree path cannot be resolved.');
    }
    if (canonical !== absolute || !isContained(poolRoot, canonical)) {
      fail('TREEHOUSE_OUTPUT_INVALID', 'Treehouse worktree path escapes the controlled pool.');
    }
    return canonical;
  }

  async #releasePoolPath(path: string, poolRoot: string): Promise<string> {
    const absolute = requireAbsolutePath(path, 'Treehouse return path', 'TREEHOUSE_OBSERVATION_CONFLICT');
    let canonical: string;
    try {
      canonical = await this.#realpath(absolute);
    } catch {
      fail('TREEHOUSE_OBSERVATION_CONFLICT', 'Treehouse return path cannot be resolved.');
    }
    if (canonical !== absolute || !isContained(poolRoot, canonical)) {
      fail('TREEHOUSE_OBSERVATION_CONFLICT', 'Treehouse return path escapes the controlled pool.');
    }
    return canonical;
  }

  async #parseAcquisition(
    bytes: Buffer,
    expectedHolder: string,
    poolRoot: string,
  ): Promise<TreehouseLeaseObservation> {
    const value = parseOneJsonValue(bytes, 'Treehouse acquisition output');
    if (!isRecord(value)) {
      fail('TREEHOUSE_OUTPUT_INVALID', 'Treehouse acquisition must be one object.');
    }
    requireExactKeys(value, ['path', 'lease_id', 'lease_holder', 'leased_at'], 'Treehouse acquisition');
    const leaseHolder = requireStringValue(value.lease_holder, 'Treehouse lease holder', 'TREEHOUSE_OUTPUT_INVALID');
    if (leaseHolder !== expectedHolder) {
      fail('TREEHOUSE_OUTPUT_INVALID', 'Treehouse acquisition holder does not match the request.');
    }
    const path = await this.#canonicalPoolPath(
      requireStringValue(value.path, 'Treehouse lease path', 'TREEHOUSE_OUTPUT_INVALID'),
      poolRoot,
    );
    return {
      path,
      leaseId: requireStringValue(value.lease_id, 'Treehouse lease id', 'TREEHOUSE_OUTPUT_INVALID'),
      leaseHolder,
      leasedAt: requireIsoTimestamp(value.leased_at, 'Treehouse leased timestamp'),
    };
  }

  async #parseStatus(bytes: Buffer, poolRoot: string): Promise<readonly TreehouseStatusItem[]> {
    const value = parseOneJsonValue(bytes, 'Treehouse status output');
    if (!Array.isArray(value)) {
      fail('TREEHOUSE_OUTPUT_INVALID', 'Treehouse status must be one array.');
    }
    const paths = new Set<string>();
    const leaseIds = new Set<string>();
    const holders = new Set<string>();
    const result: TreehouseStatusItem[] = [];

    for (const [index, item] of value.entries()) {
      if (!isRecord(item)) {
        fail('TREEHOUSE_OUTPUT_INVALID', `Treehouse status item ${index} must be an object.`);
      }
      const status = requireStringValue(item.status, 'Treehouse status', 'TREEHOUSE_OUTPUT_INVALID');
      if (status !== 'available' && status !== 'leased') {
        fail('TREEHOUSE_OUTPUT_INVALID', `Treehouse status item ${index} has an invalid state.`);
      }
      if (status === 'leased') {
        requireExactKeys(
          item,
          ['name', 'path', 'status', 'lease_id', 'lease_holder', 'leased_at', 'processes'],
          `Treehouse status item ${index}`,
        );
      } else {
        const legacyAvailable = Object.keys(item).sort().join('\u0000')
          === ['name', 'path', 'status', 'processes'].sort().join('\u0000');
        const realAvailable = Object.keys(item).sort().join('\u0000')
          === ['name', 'path', 'status', 'lease_id', 'lease_holder', 'leased_at', 'processes']
            .sort().join('\u0000');
        if (!legacyAvailable && !realAvailable) {
          fail('TREEHOUSE_OUTPUT_INVALID', `Treehouse status item ${index} has an unexpected shape.`);
        }
        if (
          realAvailable
          && (item.lease_id !== '' || item.lease_holder !== '' || item.leased_at !== null)
        ) {
          fail('TREEHOUSE_OUTPUT_INVALID', `Treehouse available item ${index} has a lease identity.`);
        }
      }
      const path = await this.#canonicalPoolPath(
        requireStringValue(item.path, 'Treehouse status path', 'TREEHOUSE_OUTPUT_INVALID'),
        poolRoot,
      );
      if (paths.has(path)) {
        fail('TREEHOUSE_OUTPUT_INVALID', 'Treehouse status contains a duplicate path.');
      }
      paths.add(path);

      if (!Array.isArray(item.processes)) {
        fail('TREEHOUSE_OUTPUT_INVALID', 'Treehouse status processes must be an array.');
      }
      const processes = item.processes.map((processValue, processIndex) => {
        if (!isRecord(processValue)) {
          fail('TREEHOUSE_OUTPUT_INVALID', `Treehouse process ${processIndex} must be an object.`);
        }
        requireExactKeys(processValue, ['pid', 'name'], `Treehouse process ${processIndex}`);
        if (!Number.isSafeInteger(processValue.pid) || (processValue.pid as number) <= 0) {
          fail('TREEHOUSE_OUTPUT_INVALID', `Treehouse process ${processIndex} has an invalid pid.`);
        }
        return {
          pid: processValue.pid as number,
          name: requireStringValue(processValue.name, 'Treehouse process name', 'TREEHOUSE_OUTPUT_INVALID'),
        };
      });

      const name = requireStringValue(item.name, 'Treehouse status name', 'TREEHOUSE_OUTPUT_INVALID');
      if (status === 'available') {
        result.push({ name, path, status, processes });
        continue;
      }

      const leaseId = requireStringValue(item.lease_id, 'Treehouse status lease id', 'TREEHOUSE_OUTPUT_INVALID');
      const leaseHolder = requireStringValue(
        item.lease_holder,
        'Treehouse status lease holder',
        'TREEHOUSE_OUTPUT_INVALID',
      );
      if (leaseIds.has(leaseId) || holders.has(leaseHolder)) {
        fail('TREEHOUSE_OUTPUT_INVALID', 'Treehouse status contains a duplicate external identity.');
      }
      leaseIds.add(leaseId);
      holders.add(leaseHolder);
      result.push({
        name,
        path,
        status,
        leaseId,
        leaseHolder,
        leasedAt: requireIsoTimestamp(item.leased_at, 'Treehouse status leased timestamp'),
        processes,
      });
    }

    return result;
  }

  async acquire(input: Readonly<{
    boundary: TreehouseBoundary;
    holder: string;
  }>): Promise<TreehouseLeaseObservation> {
    const holder = requireStringValue(input.holder, 'Treehouse lease holder', 'TREEHOUSE_OBSERVATION_CONFLICT');
    const context = await this.#freshContext(input.boundary);
    const result = await this.#runProcess(processSpec(
      context.treehouseExecutable,
      ['get', '--lease', '--lease-holder', holder, '--json'],
      context.boundary.sourcePath,
      context.environment,
    ));
    const stdout = requireSuccessfulProcess(
      result,
      'TREEHOUSE_TIMEOUT',
      'TREEHOUSE_COMMAND_FAILED',
      'Treehouse acquisition',
    );
    return await this.#parseAcquisition(stdout, holder, context.boundary.poolRoot);
  }

  async status(input: Readonly<{
    boundary: TreehouseBoundary;
  }>): Promise<readonly TreehouseStatusItem[]> {
    const context = await this.#freshContext(input.boundary);
    const result = await this.#runProcess(processSpec(
      context.treehouseExecutable,
      ['status', '--json'],
      context.boundary.sourcePath,
      context.environment,
    ));
    const stdout = requireSuccessfulProcess(
      result,
      'TREEHOUSE_TIMEOUT',
      'TREEHOUSE_COMMAND_FAILED',
      'Treehouse status',
    );
    return await this.#parseStatus(stdout, context.boundary.poolRoot);
  }

  async release(input: Readonly<{
    boundary: TreehouseBoundary;
    path: string;
    leaseId: string;
    holder: string;
  }>): Promise<ProcessResult> {
    const leaseId = requireStringValue(input.leaseId, 'Treehouse lease id', 'TREEHOUSE_OBSERVATION_CONFLICT');
    const holder = requireStringValue(input.holder, 'Treehouse lease holder', 'TREEHOUSE_OBSERVATION_CONFLICT');
    const context = await this.#freshContext(input.boundary);
    const path = await this.#releasePoolPath(input.path, context.boundary.poolRoot);
    return await this.#runProcess(processSpec(
      context.treehouseExecutable,
      ['return', path, '--if-lease-id', leaseId, '--if-lease-holder', holder],
      context.boundary.sourcePath,
      context.environment,
    ));
  }
}
