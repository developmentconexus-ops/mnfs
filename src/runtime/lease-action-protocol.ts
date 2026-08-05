import { createHash } from 'node:crypto';
import { constants } from 'node:fs';
import {
  link,
  lstat,
  open,
  realpath,
  unlink,
} from 'node:fs/promises';
import path from 'node:path';
import { TextDecoder } from 'node:util';

import { MnfsError } from '../domain/errors.js';
import type { ProcessIdentity } from '../execution/model.js';
import { writeDurableFile } from './durable-artifact.js';

const FATAL_UTF8 = new TextDecoder('utf-8', { fatal: true });
const SHA256_PATTERN = /^sha256:[0-9a-f]{64}$/u;
const ACTION_TOKEN_PATTERN = /^[a-z0-9][a-z0-9-]{0,127}$/u;
const SAFE_VALUE_PATTERN = /^[^\0\r\n]+$/u;
const SIGNAL_PATTERN = /^SIG[A-Z0-9]+$/u;
const OPERATION_MODE = 0o400;
const OUTPUT_MODE = 0o600;

const ENVIRONMENT_KEYS = [
  'GCM_INTERACTIVE',
  'GIT_CONFIG_COUNT',
  'GIT_CONFIG_GLOBAL',
  'GIT_CONFIG_KEY_0',
  'GIT_CONFIG_KEY_1',
  'GIT_CONFIG_KEY_2',
  'GIT_CONFIG_NOSYSTEM',
  'GIT_CONFIG_VALUE_0',
  'GIT_CONFIG_VALUE_1',
  'GIT_CONFIG_VALUE_2',
  'GIT_NO_LAZY_FETCH',
  'GIT_OPTIONAL_LOCKS',
  'GIT_TERMINAL_PROMPT',
  'HOME',
  'LANG',
  'LC_ALL',
  'PATH',
  'TREEHOUSE_NO_UPDATE_CHECK',
  'XDG_CONFIG_HOME',
] as const;

export interface LeaseActionOperation {
  readonly schemaVersion: 1;
  readonly actionToken: string;
  readonly kind: 'GRANT' | 'RELEASE';
  readonly executable: string;
  readonly argv: readonly string[];
  readonly cwd: string;
  readonly env: Readonly<Record<string, string>>;
  readonly timeoutMs: number;
  readonly stdoutLimitBytes: number;
  readonly stderrLimitBytes: number;
  readonly startedPath: string;
  readonly resultPath: string;
}

export interface LeaseActionStarted {
  readonly schemaVersion: 1;
  readonly actionToken: string;
  readonly operationSha256: string;
  readonly runner: ProcessIdentity;
  readonly startedAt: string;
}

export interface LeaseActionOutputRef {
  readonly path: string;
  readonly sha256: string;
  readonly byteLength: number;
}

export interface LeaseActionFinished {
  readonly schemaVersion: 1;
  readonly actionToken: string;
  readonly operationSha256: string;
  readonly startedSha256: string;
  readonly runner: ProcessIdentity;
  readonly process: Readonly<{
    readonly exitCode: number | null;
    readonly signal: NodeJS.Signals | null;
    readonly timedOut: boolean;
  }>;
  readonly stdout: LeaseActionOutputRef;
  readonly stderr: LeaseActionOutputRef;
  readonly finishedAt: string;
}

export interface PublishedLeaseActionOperation {
  readonly operation: LeaseActionOperation;
  readonly bytes: Buffer;
  readonly operationSha256: string;
}

export interface PublishedLeaseActionStarted {
  readonly started: LeaseActionStarted;
  readonly bytes: Buffer;
  readonly startedSha256: string;
}

export interface PublishedLeaseActionFinished {
  readonly finished: LeaseActionFinished;
  readonly bytes: Buffer;
  readonly finishedSha256: string;
}

type JsonRecord = Record<string, unknown>;

function protocolError(message: string, cause?: unknown): MnfsError {
  const detail = cause instanceof Error ? ` ${cause.message}` : '';
  return new MnfsError('INTERNAL_ERROR', `${message}${detail}`);
}

function fail(message: string): never {
  throw protocolError(message);
}

function isErrorCode(error: unknown, code: string): boolean {
  return (error as NodeJS.ErrnoException).code === code;
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function exactKeys(record: JsonRecord, expected: readonly string[], label: string): void {
  const actual = Object.keys(record).sort();
  const wanted = [...expected].sort();
  if (actual.length !== wanted.length || actual.some((key, index) => key !== wanted[index])) {
    fail(`${label} has an unexpected shape.`);
  }
}

function requireSafeString(value: unknown, label: string): string {
  if (typeof value !== 'string' || !SAFE_VALUE_PATTERN.test(value)) {
    fail(`${label} must be one non-empty single-line string.`);
  }
  return value;
}

function requirePositiveInteger(value: unknown, label: string): number {
  if (!Number.isSafeInteger(value) || (value as number) <= 0) {
    fail(`${label} must be a positive safe integer.`);
  }
  return value as number;
}

function requireSha256(value: unknown, label: string): string {
  const digest = requireSafeString(value, label);
  if (!SHA256_PATTERN.test(digest)) {
    fail(`${label} must be one lowercase SHA-256 identity.`);
  }
  return digest;
}

function requireActionToken(value: unknown): string {
  const token = requireSafeString(value, 'Lease action token');
  if (!ACTION_TOKEN_PATTERN.test(token)) {
    fail('Lease action token has an unsafe format.');
  }
  return token;
}

function isMountedPath(value: string): boolean {
  return value === '/mnt' || value.startsWith('/mnt/');
}

function requireAbsoluteLinuxPath(value: unknown, label: string): string {
  const candidate = requireSafeString(value, label);
  if (!path.isAbsolute(candidate)) {
    fail(`${label} must be absolute.`);
  }
  const normalized = path.resolve(candidate);
  if (normalized !== candidate || isMountedPath(normalized)) {
    fail(`${label} is outside the accepted Linux boundary.`);
  }
  return normalized;
}

function isContained(parent: string, child: string): boolean {
  const suffix = path.relative(parent, child);
  return suffix.length > 0
    && suffix !== '..'
    && !suffix.startsWith(`..${path.sep}`)
    && !path.isAbsolute(suffix);
}

function requireContainedPath(parent: string, value: unknown, label: string): string {
  const child = requireAbsoluteLinuxPath(value, label);
  if (!isContained(parent, child)) {
    fail(`${label} escapes its owned action root.`);
  }
  return child;
}

function canonicalValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(canonicalValue);
  }
  if (!isRecord(value)) {
    return value;
  }
  const output: Record<string, unknown> = {};
  for (const key of Object.keys(value).sort()) {
    output[key] = canonicalValue(value[key]);
  }
  return output;
}

function canonicalBytes(value: unknown): Buffer {
  return Buffer.from(JSON.stringify(canonicalValue(value)), 'utf8');
}

function sha256(bytes: Buffer): string {
  return `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
}

function decodeCanonicalJson(bytes: Buffer, label: string): unknown {
  let text: string;
  try {
    text = FATAL_UTF8.decode(bytes);
  } catch (error) {
    throw protocolError(`${label} is not valid UTF-8.`, error);
  }
  if (text.length === 0) {
    fail(`${label} is empty.`);
  }
  let value: unknown;
  try {
    value = JSON.parse(text) as unknown;
  } catch (error) {
    throw protocolError(`${label} must contain exactly one JSON value.`, error);
  }
  if (!canonicalBytes(value).equals(bytes)) {
    fail(`${label} is not canonical JSON.`);
  }
  return value;
}

function requireIsoTimestamp(value: unknown, label: string): string {
  const timestamp = requireSafeString(value, label);
  if (!timestamp.endsWith('Z') || !Number.isFinite(Date.parse(timestamp))) {
    fail(`${label} must be one UTC timestamp.`);
  }
  return timestamp;
}

function requireProcessIdentity(value: unknown, label: string): ProcessIdentity {
  if (!isRecord(value)) {
    fail(`${label} must be one process identity.`);
  }
  exactKeys(value, ['bootId', 'pid', 'startTicks'], label);
  return {
    bootId: requireSafeString(value.bootId, `${label} boot ID`),
    pid: requirePositiveInteger(value.pid, `${label} pid`),
    startTicks: requireSafeString(value.startTicks, `${label} start ticks`),
  };
}

function requireEnvironment(
  value: unknown,
  executable: string,
): Readonly<Record<string, string>> {
  if (!isRecord(value)) {
    fail('Lease action environment must be one object.');
  }
  exactKeys(value, ENVIRONMENT_KEYS, 'Lease action environment');
  const env: Record<string, string> = {};
  for (const key of ENVIRONMENT_KEYS) {
    env[key] = typeof value[key] === 'string'
      ? value[key] as string
      : fail(`Lease action environment ${key} must be a string.`);
    if (key !== 'GIT_CONFIG_VALUE_1' && !SAFE_VALUE_PATTERN.test(env[key] as string)) {
      fail(`Lease action environment ${key} is empty or multiline.`);
    }
    if (key === 'GIT_CONFIG_VALUE_1' && env[key] !== '') {
      fail('Lease action credential helper must be disabled with an empty value.');
    }
  }

  const expectedFixed: Readonly<Record<string, string>> = {
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
    GIT_CONFIG_KEY_1: 'credential.helper',
    GIT_CONFIG_KEY_2: 'core.fsmonitor',
    GIT_CONFIG_VALUE_1: '',
    GIT_CONFIG_VALUE_2: 'false',
  };
  for (const [key, expected] of Object.entries(expectedFixed)) {
    if (env[key] !== expected) {
      fail(`Lease action environment ${key} differs from the accepted value.`);
    }
  }

  const expectedPath = `${path.dirname(executable)}:/usr/bin:/bin`;
  if (env.PATH !== expectedPath) {
    fail('Lease action PATH differs from the accepted Linux-only shape.');
  }
  env.HOME = requireAbsoluteLinuxPath(env.HOME, 'Lease action HOME');
  env.XDG_CONFIG_HOME = requireAbsoluteLinuxPath(
    env.XDG_CONFIG_HOME,
    'Lease action XDG_CONFIG_HOME',
  );
  env.GIT_CONFIG_VALUE_0 = requireAbsoluteLinuxPath(
    env.GIT_CONFIG_VALUE_0,
    'Lease action hooks path',
  );
  return Object.freeze(env);
}

function requireOperation(
  value: unknown,
  actionRootInput: string,
  operationPathInput: string,
): LeaseActionOperation {
  if (!isRecord(value)) {
    fail('Lease action operation must be one object.');
  }
  exactKeys(value, [
    'actionToken',
    'argv',
    'cwd',
    'env',
    'executable',
    'kind',
    'resultPath',
    'schemaVersion',
    'startedPath',
    'stderrLimitBytes',
    'stdoutLimitBytes',
    'timeoutMs',
  ], 'Lease action operation');
  if (value.schemaVersion !== 1) {
    fail('Lease action operation schema version is unsupported.');
  }

  const actionRoot = requireAbsoluteLinuxPath(actionRootInput, 'Lease action root');
  const operationPath = requireContainedPath(actionRoot, operationPathInput, 'Lease action operation path');
  const actionToken = requireActionToken(value.actionToken);
  const tokenRoot = path.dirname(operationPath);
  if (path.dirname(tokenRoot) !== actionRoot || path.basename(tokenRoot) !== actionToken) {
    fail('Lease action operation path is not owned by its action token.');
  }

  const executable = requireAbsoluteLinuxPath(value.executable, 'Lease action executable');
  const cwd = requireAbsoluteLinuxPath(value.cwd, 'Lease action cwd');
  const startedPath = requireContainedPath(tokenRoot, value.startedPath, 'Lease action STARTED path');
  const resultPath = requireContainedPath(tokenRoot, value.resultPath, 'Lease action FINISHED path');
  if (startedPath === resultPath || operationPath === startedPath || operationPath === resultPath) {
    fail('Lease action control paths must be distinct.');
  }

  const kind = value.kind;
  if (kind !== 'GRANT' && kind !== 'RELEASE') {
    fail('Lease action kind is unsupported.');
  }
  if (!Array.isArray(value.argv) || value.argv.some((item) => typeof item !== 'string')) {
    fail('Lease action argv must be one string array.');
  }
  const argv = value.argv.map((item, index) => requireSafeString(item, `Lease action argv ${index}`));

  if (kind === 'GRANT') {
    if (
      argv.length !== 5
      || argv[0] !== 'get'
      || argv[1] !== '--lease'
      || argv[2] !== '--lease-holder'
      || argv[4] !== '--json'
    ) {
      fail('Lease GRANT argv differs from the reviewed command shape.');
    }
    requireSafeString(argv[3], 'Lease GRANT holder');
  } else {
    if (
      argv.length !== 6
      || argv[0] !== 'return'
      || argv[2] !== '--if-lease-id'
      || argv[4] !== '--if-lease-holder'
    ) {
      fail('Lease RELEASE argv differs from the reviewed command shape.');
    }
    requireAbsoluteLinuxPath(argv[1], 'Lease RELEASE worktree path');
    requireSafeString(argv[3], 'Lease RELEASE external ID');
    requireSafeString(argv[5], 'Lease RELEASE holder');
  }

  return {
    schemaVersion: 1,
    actionToken,
    kind,
    executable,
    argv,
    cwd,
    env: requireEnvironment(value.env, executable),
    timeoutMs: requirePositiveInteger(value.timeoutMs, 'Lease action timeout'),
    stdoutLimitBytes: requirePositiveInteger(value.stdoutLimitBytes, 'Lease action stdout limit'),
    stderrLimitBytes: requirePositiveInteger(value.stderrLimitBytes, 'Lease action stderr limit'),
    startedPath,
    resultPath,
  };
}

function requireStarted(value: unknown): LeaseActionStarted {
  if (!isRecord(value)) {
    fail('Lease action STARTED must be one object.');
  }
  exactKeys(value, [
    'actionToken',
    'operationSha256',
    'runner',
    'schemaVersion',
    'startedAt',
  ], 'Lease action STARTED');
  if (value.schemaVersion !== 1) {
    fail('Lease action STARTED schema version is unsupported.');
  }
  return {
    schemaVersion: 1,
    actionToken: requireActionToken(value.actionToken),
    operationSha256: requireSha256(value.operationSha256, 'Lease action operation hash'),
    runner: requireProcessIdentity(value.runner, 'Lease action runner'),
    startedAt: requireIsoTimestamp(value.startedAt, 'Lease action STARTED timestamp'),
  };
}

function requireOutputRef(value: unknown, label: string): LeaseActionOutputRef {
  if (!isRecord(value)) {
    fail(`${label} must be one output reference.`);
  }
  exactKeys(value, ['byteLength', 'path', 'sha256'], label);
  return {
    path: requireAbsoluteLinuxPath(value.path, `${label} path`),
    sha256: requireSha256(value.sha256, `${label} SHA-256`),
    byteLength: requirePositiveInteger(value.byteLength, `${label} byte length`),
  };
}

function requireFinished(value: unknown): LeaseActionFinished {
  if (!isRecord(value)) {
    fail('Lease action FINISHED must be one object.');
  }
  exactKeys(value, [
    'actionToken',
    'finishedAt',
    'operationSha256',
    'process',
    'runner',
    'schemaVersion',
    'startedSha256',
    'stderr',
    'stdout',
  ], 'Lease action FINISHED');
  if (value.schemaVersion !== 1) {
    fail('Lease action FINISHED schema version is unsupported.');
  }
  if (!isRecord(value.process)) {
    fail('Lease action FINISHED process result must be one object.');
  }
  exactKeys(value.process, ['exitCode', 'signal', 'timedOut'], 'Lease action process result');
  const exitCode = value.process.exitCode;
  if (exitCode !== null && (!Number.isSafeInteger(exitCode) || (exitCode as number) < 0)) {
    fail('Lease action process exit code is invalid.');
  }
  const signal = value.process.signal;
  if (signal !== null && (typeof signal !== 'string' || !SIGNAL_PATTERN.test(signal))) {
    fail('Lease action process signal is invalid.');
  }
  if (typeof value.process.timedOut !== 'boolean') {
    fail('Lease action process timeout marker is invalid.');
  }

  return {
    schemaVersion: 1,
    actionToken: requireActionToken(value.actionToken),
    operationSha256: requireSha256(value.operationSha256, 'Lease action operation hash'),
    startedSha256: requireSha256(value.startedSha256, 'Lease action STARTED hash'),
    runner: requireProcessIdentity(value.runner, 'Lease action runner'),
    process: {
      exitCode: exitCode as number | null,
      signal: signal as NodeJS.Signals | null,
      timedOut: value.process.timedOut,
    },
    stdout: requireOutputRef(value.stdout, 'Lease action stdout'),
    stderr: requireOutputRef(value.stderr, 'Lease action stderr'),
    finishedAt: requireIsoTimestamp(value.finishedAt, 'Lease action FINISHED timestamp'),
  };
}

async function requireSafeDirectory(directoryPathInput: string, label: string): Promise<string> {
  const directoryPath = requireAbsoluteLinuxPath(directoryPathInput, label);
  let metadata;
  let canonical: string;
  try {
    [metadata, canonical] = await Promise.all([
      lstat(directoryPath),
      realpath(directoryPath),
    ]);
  } catch (error) {
    throw protocolError(`${label} cannot be observed.`, error);
  }
  if (!metadata.isDirectory() || metadata.isSymbolicLink() || canonical !== directoryPath) {
    fail(`${label} must be one canonical directory without symlinks.`);
  }
  if (process.getuid !== undefined && metadata.uid !== process.getuid()) {
    fail(`${label} is not owned by the current user.`);
  }
  return directoryPath;
}

async function requireActionFileBoundary(
  actionRootInput: string,
  filePathInput: string,
): Promise<Readonly<{ actionRoot: string; tokenRoot: string; filePath: string }>> {
  const actionRoot = await requireSafeDirectory(actionRootInput, 'Lease action root');
  const filePath = requireContainedPath(actionRoot, filePathInput, 'Lease action file');
  const tokenRoot = path.dirname(filePath);
  if (path.dirname(tokenRoot) !== actionRoot) {
    fail('Lease action file must be directly token-scoped below the action root.');
  }
  await requireSafeDirectory(tokenRoot, 'Lease action token root');
  return { actionRoot, tokenRoot, filePath };
}

async function readOwnedRegularFile(
  filePath: string,
  expectedMode: number,
  label: string,
): Promise<Buffer> {
  let before;
  try {
    before = await lstat(filePath);
  } catch (error) {
    throw protocolError(`${label} cannot be inspected.`, error);
  }
  if (
    !before.isFile()
    || before.isSymbolicLink()
    || before.nlink !== 1
    || (before.mode & 0o777) !== expectedMode
    || (process.getuid !== undefined && before.uid !== process.getuid())
  ) {
    fail(`${label} has an unsafe file shape, owner or mode.`);
  }

  const handle = await open(filePath, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const opened = await handle.stat();
    if (
      !opened.isFile()
      || opened.dev !== before.dev
      || opened.ino !== before.ino
      || opened.nlink !== 1
      || (opened.mode & 0o777) !== expectedMode
      || (process.getuid !== undefined && opened.uid !== process.getuid())
    ) {
      fail(`${label} changed while it was being opened.`);
    }
    const bytes = await handle.readFile();
    const after = await handle.stat();
    if (
      after.dev !== opened.dev
      || after.ino !== opened.ino
      || after.size !== opened.size
      || after.mtimeMs !== opened.mtimeMs
      || after.ctimeMs !== opened.ctimeMs
    ) {
      fail(`${label} changed while it was being read.`);
    }
    return bytes;
  } catch (error) {
    throw error instanceof MnfsError
      ? error
      : protocolError(`${label} cannot be read safely.`, error);
  } finally {
    await handle.close();
  }
}

async function syncDirectory(directoryPath: string): Promise<void> {
  const directory = await open(directoryPath, constants.O_RDONLY | constants.O_DIRECTORY);
  try {
    await directory.sync();
  } finally {
    await directory.close();
  }
}

async function publishExclusive(
  finalPath: string,
  bytes: Buffer,
  mode: number,
): Promise<void> {
  const temporaryPath = path.join(
    path.dirname(finalPath),
    `.${path.basename(finalPath)}.${process.pid}.${Date.now().toString(36)}.tmp`,
  );
  let handle;
  try {
    handle = await open(
      temporaryPath,
      constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW,
      mode,
    );
    await handle.chmod(mode);
    await handle.writeFile(bytes);
    await handle.sync();
    await handle.close();
    handle = undefined;
    await link(temporaryPath, finalPath);
    await unlink(temporaryPath);
    await syncDirectory(path.dirname(finalPath));
  } catch (error) {
    await handle?.close().catch(() => undefined);
    await unlink(temporaryPath).catch(() => undefined);
    if (isErrorCode(error, 'EEXIST')) {
      throw protocolError(`Lease action Artifact already exists: ${finalPath}.`);
    }
    throw error instanceof MnfsError
      ? error
      : protocolError(`Lease action Artifact cannot be published: ${finalPath}.`, error);
  }
}

export async function leaseActionFileExists(
  actionRoot: string,
  filePath: string,
): Promise<boolean> {
  const boundary = await requireActionFileBoundary(actionRoot, filePath);
  try {
    await lstat(boundary.filePath);
    return true;
  } catch (error) {
    if (isErrorCode(error, 'ENOENT')) return false;
    throw protocolError('Lease action file existence cannot be observed.', error);
  }
}

export function canonicalizeLeaseActionOperation(input: Readonly<{
  readonly actionRoot: string;
  readonly operationPath: string;
  readonly operation: LeaseActionOperation;
}>): PublishedLeaseActionOperation {
  const operation = requireOperation(input.operation, input.actionRoot, input.operationPath);
  const bytes = canonicalBytes(operation);
  return {
    operation,
    bytes,
    operationSha256: sha256(bytes),
  };
}

export async function publishLeaseActionOperation(input: Readonly<{
  readonly actionRoot: string;
  readonly operationPath: string;
  readonly operation: LeaseActionOperation;
}>): Promise<PublishedLeaseActionOperation> {
  await requireActionFileBoundary(input.actionRoot, input.operationPath);
  const published = canonicalizeLeaseActionOperation(input);
  await writeDurableFile(input.operationPath, published.bytes, OPERATION_MODE);
  return await readLeaseActionOperation({
    actionRoot: input.actionRoot,
    operationPath: input.operationPath,
    expectedActionToken: published.operation.actionToken,
    expectedOperationSha256: published.operationSha256,
  });
}

export async function readLeaseActionOperation(input: Readonly<{
  readonly actionRoot: string;
  readonly operationPath: string;
  readonly expectedActionToken: string;
  readonly expectedOperationSha256: string;
}>): Promise<PublishedLeaseActionOperation> {
  await requireActionFileBoundary(input.actionRoot, input.operationPath);
  const bytes = await readOwnedRegularFile(input.operationPath, OPERATION_MODE, 'Lease action operation');
  const operation = requireOperation(
    decodeCanonicalJson(bytes, 'Lease action operation'),
    input.actionRoot,
    input.operationPath,
  );
  const operationSha256 = sha256(bytes);
  if (
    operation.actionToken !== requireActionToken(input.expectedActionToken)
    || operationSha256 !== requireSha256(input.expectedOperationSha256, 'Expected operation hash')
  ) {
    fail('Lease action operation identity differs from the expected token or hash.');
  }
  return { operation, bytes, operationSha256 };
}

export async function publishLeaseActionStarted(input: Readonly<{
  readonly actionRoot: string;
  readonly startedPath: string;
  readonly started: LeaseActionStarted;
}>): Promise<PublishedLeaseActionStarted> {
  await requireActionFileBoundary(input.actionRoot, input.startedPath);
  const started = requireStarted(input.started);
  const bytes = canonicalBytes(started);
  await publishExclusive(input.startedPath, bytes, OPERATION_MODE);
  return await readLeaseActionStarted({
    actionRoot: input.actionRoot,
    startedPath: input.startedPath,
    expectedActionToken: started.actionToken,
    expectedOperationSha256: started.operationSha256,
  });
}

export async function readLeaseActionStarted(input: Readonly<{
  readonly actionRoot: string;
  readonly startedPath: string;
  readonly expectedActionToken: string;
  readonly expectedOperationSha256: string;
}>): Promise<PublishedLeaseActionStarted> {
  await requireActionFileBoundary(input.actionRoot, input.startedPath);
  const bytes = await readOwnedRegularFile(input.startedPath, OPERATION_MODE, 'Lease action STARTED');
  const started = requireStarted(decodeCanonicalJson(bytes, 'Lease action STARTED'));
  if (
    started.actionToken !== requireActionToken(input.expectedActionToken)
    || started.operationSha256 !== requireSha256(
      input.expectedOperationSha256,
      'Expected operation hash',
    )
  ) {
    fail('Lease action STARTED identity differs from the expected operation.');
  }
  return { started, bytes, startedSha256: sha256(bytes) };
}

async function verifyOutputReference(
  tokenRoot: string,
  reference: LeaseActionOutputRef,
  label: string,
): Promise<void> {
  const outputPath = requireContainedPath(tokenRoot, reference.path, `${label} path`);
  const bytes = await readOwnedRegularFile(outputPath, OUTPUT_MODE, label);
  if (bytes.length !== reference.byteLength || sha256(bytes) !== reference.sha256) {
    fail(`${label} bytes differ from their FINISHED reference.`);
  }
}

export async function publishLeaseActionFinished(input: Readonly<{
  readonly actionRoot: string;
  readonly resultPath: string;
  readonly finished: LeaseActionFinished;
}>): Promise<PublishedLeaseActionFinished> {
  const boundary = await requireActionFileBoundary(input.actionRoot, input.resultPath);
  const finished = requireFinished(input.finished);
  await Promise.all([
    verifyOutputReference(boundary.tokenRoot, finished.stdout, 'Lease action stdout'),
    verifyOutputReference(boundary.tokenRoot, finished.stderr, 'Lease action stderr'),
  ]);
  const bytes = canonicalBytes(finished);
  await writeDurableFile(input.resultPath, bytes, OPERATION_MODE);
  return await readLeaseActionFinished({
    actionRoot: input.actionRoot,
    resultPath: input.resultPath,
    expectedActionToken: finished.actionToken,
    expectedOperationSha256: finished.operationSha256,
    expectedStartedSha256: finished.startedSha256,
  });
}

export async function readLeaseActionFinished(input: Readonly<{
  readonly actionRoot: string;
  readonly resultPath: string;
  readonly expectedActionToken: string;
  readonly expectedOperationSha256: string;
  readonly expectedStartedSha256: string;
}>): Promise<PublishedLeaseActionFinished> {
  const boundary = await requireActionFileBoundary(input.actionRoot, input.resultPath);
  const bytes = await readOwnedRegularFile(input.resultPath, OPERATION_MODE, 'Lease action FINISHED');
  const finished = requireFinished(decodeCanonicalJson(bytes, 'Lease action FINISHED'));
  if (
    finished.actionToken !== requireActionToken(input.expectedActionToken)
    || finished.operationSha256 !== requireSha256(
      input.expectedOperationSha256,
      'Expected operation hash',
    )
    || finished.startedSha256 !== requireSha256(
      input.expectedStartedSha256,
      'Expected STARTED hash',
    )
  ) {
    fail('Lease action FINISHED identity differs from the expected Artifact chain.');
  }
  await Promise.all([
    verifyOutputReference(boundary.tokenRoot, finished.stdout, 'Lease action stdout'),
    verifyOutputReference(boundary.tokenRoot, finished.stderr, 'Lease action stderr'),
  ]);
  return { finished, bytes, finishedSha256: sha256(bytes) };
}

export async function publishLeaseActionOutput(
  actionRoot: string,
  outputPath: string,
  bytes: Buffer,
): Promise<LeaseActionOutputRef> {
  const boundary = await requireActionFileBoundary(actionRoot, outputPath);
  if (path.dirname(outputPath) !== boundary.tokenRoot) {
    fail('Lease action output must be directly token-scoped.');
  }
  await writeDurableFile(outputPath, bytes, OUTPUT_MODE);
  const verified = await readOwnedRegularFile(outputPath, OUTPUT_MODE, 'Lease action output');
  return {
    path: outputPath,
    sha256: sha256(verified),
    byteLength: verified.length,
  };
}
