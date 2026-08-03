import { randomUUID } from 'node:crypto';
import { isAbsolute, join } from 'node:path';
import { mkdir, realpath, rename, writeFile } from 'node:fs/promises';

import { canonicalJson } from './canonical-json.mjs';
import { as02Error, assertAs02 } from './errors.mjs';

const SCENARIO_PATTERN = /^S(?:[1-9]|1[0-5])$/u;
const HASH_PATTERN = /^sha256:[a-f0-9]{64}$/u;
const ISO_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u;
const EXPECTED_VALUES = new Set(['ALLOW', 'DENY', 'FAIL_CLOSED', 'OBSERVE']);
const RESULT_VALUES = new Set(['PASS', 'FAIL', 'BLOCKED', 'INCONCLUSIVE']);
const BASE_KEYS = new Set([
  'scenarioId',
  'startedAt',
  'finishedAt',
  'command',
  'cwd',
  'expected',
  'exitCode',
  'signal',
  'stdoutRef',
  'stderrRef',
  'observedFilesystem',
  'policyHash',
  'result',
  'rationale',
  'failureCode',
  'stdoutRedactions',
  'stderrRedactions',
  'stdoutTruncated',
  'stderrTruncated',
]);

function invalid(message, details = {}) {
  throw as02Error('EVIDENCE_INVALID', message, details);
}

function assertIso(value, label) {
  if (typeof value !== 'string' || !ISO_PATTERN.test(value) || Number.isNaN(Date.parse(value))) {
    invalid(`${label} must be an ISO-8601 UTC timestamp.`, { label, value });
  }
}

function validateRef(value, scenarioId, stream) {
  const expected = `commands/${scenarioId}.${stream}.bin`;
  if (value !== expected) invalid(`${stream}Ref must be ${expected}.`, { value, expected });
}

function assertOptionalCount(value, label) {
  if (value !== undefined && (!Number.isInteger(value) || value < 0)) invalid(`${label} must be a non-negative integer.`, { value });
}

function assertOptionalBoolean(value, label) {
  if (value !== undefined && typeof value !== 'boolean') invalid(`${label} must be boolean.`, { value });
}

export function validateScenarioEvidence(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) invalid('ScenarioEvidence must be an object.');
  for (const key of Object.keys(value)) {
    if (!BASE_KEYS.has(key)) invalid(`Unknown ScenarioEvidence field: ${key}.`, { key });
  }

  if (typeof value.scenarioId !== 'string' || !SCENARIO_PATTERN.test(value.scenarioId)) invalid('scenarioId must be S1 through S15.');
  assertIso(value.startedAt, 'startedAt');
  assertIso(value.finishedAt, 'finishedAt');
  if (Date.parse(value.finishedAt) < Date.parse(value.startedAt)) invalid('finishedAt must not precede startedAt.');
  if (!Array.isArray(value.command) || value.command.length === 0 || !value.command.every((entry) => typeof entry === 'string')) invalid('command must be a non-empty string array.');
  if (typeof value.cwd !== 'string' || !isAbsolute(value.cwd) || /[\r\n]/u.test(value.cwd)) invalid('cwd must be one absolute path.');
  if (!EXPECTED_VALUES.has(value.expected)) invalid('expected is invalid.', { expected: value.expected });
  if (!(value.exitCode === null || Number.isInteger(value.exitCode))) invalid('exitCode must be an integer or null.');
  if (!(value.signal === null || typeof value.signal === 'string')) invalid('signal must be a string or null.');
  validateRef(value.stdoutRef, value.scenarioId, 'stdout');
  validateRef(value.stderrRef, value.scenarioId, 'stderr');

  if (!value.observedFilesystem || typeof value.observedFilesystem !== 'object' || Array.isArray(value.observedFilesystem)) invalid('observedFilesystem must be an object.');
  for (const [logicalId, resourceHash] of Object.entries(value.observedFilesystem)) {
    if (!/^[A-Za-z0-9._-]+$/u.test(logicalId) || typeof resourceHash !== 'string' || !HASH_PATTERN.test(resourceHash)) {
      invalid('observedFilesystem must contain logical IDs and SHA-256 digests only.', { logicalId, resourceHash });
    }
  }

  if (typeof value.policyHash !== 'string' || !HASH_PATTERN.test(value.policyHash)) invalid('policyHash must be a complete SHA-256 digest.');
  if (!RESULT_VALUES.has(value.result)) invalid('result is invalid.', { result: value.result });
  if (typeof value.rationale !== 'string' || value.rationale.trim().length === 0 || value.rationale.length > 4_096) invalid('rationale must be bounded non-empty text.');
  if (value.failureCode !== undefined && (typeof value.failureCode !== 'string' || !/^[A-Z][A-Z0-9_]*$/u.test(value.failureCode))) invalid('failureCode is invalid.');
  assertOptionalCount(value.stdoutRedactions, 'stdoutRedactions');
  assertOptionalCount(value.stderrRedactions, 'stderrRedactions');
  assertOptionalBoolean(value.stdoutTruncated, 'stdoutTruncated');
  assertOptionalBoolean(value.stderrTruncated, 'stderrTruncated');

  return { ...value, command: [...value.command], observedFilesystem: { ...value.observedFilesystem } };
}

function replaceAllBytes(input, marker, replacement) {
  const chunks = [];
  let cursor = 0;
  let redactions = 0;
  while (cursor < input.length) {
    const index = input.indexOf(marker, cursor);
    if (index === -1) {
      chunks.push(input.subarray(cursor));
      break;
    }
    chunks.push(input.subarray(cursor, index), replacement);
    cursor = index + marker.length;
    redactions += 1;
  }
  return { bytes: Buffer.concat(chunks), redactions };
}

export function redactOutput(buffer, secretMarkers, { maxBytes = 65_536 } = {}) {
  assertAs02(Buffer.isBuffer(buffer), 'EVIDENCE_INVALID', 'Output must be a Buffer.');
  assertAs02(Array.isArray(secretMarkers), 'EVIDENCE_INVALID', 'secretMarkers must be an array.');
  assertAs02(Number.isInteger(maxBytes) && maxBytes > 0, 'EVIDENCE_INVALID', 'maxBytes must be a positive integer.');

  let bytes = Buffer.from(buffer);
  let redactions = 0;
  const uniqueMarkers = [...new Set(secretMarkers)]
    .filter((marker) => typeof marker === 'string' && marker.length > 0)
    .sort((left, right) => right.length - left.length);
  const replacement = Buffer.from('[REDACTED:AS02]', 'utf8');

  for (const marker of uniqueMarkers) {
    const result = replaceAllBytes(bytes, Buffer.from(marker, 'utf8'), replacement);
    bytes = result.bytes;
    redactions += result.redactions;
  }

  const truncated = bytes.length > maxBytes;
  if (truncated) bytes = bytes.subarray(0, maxBytes);
  return { bytes, redactions, truncated };
}

async function atomicWrite(path, content) {
  const temp = `${path}.tmp-${process.pid}-${randomUUID()}`;
  await writeFile(temp, content, { mode: 0o600, flag: 'wx' });
  await rename(temp, path);
}

export async function writeScenarioEvidence({ artifactRoot, evidence, stdout, stderr, secretMarkers = [], maxBytes = 65_536 }) {
  assertAs02(typeof artifactRoot === 'string' && isAbsolute(artifactRoot), 'EVIDENCE_INVALID', 'artifactRoot must be absolute.');
  const root = await realpath(artifactRoot);
  const scenarioId = evidence?.scenarioId;
  if (typeof scenarioId !== 'string' || !SCENARIO_PATTERN.test(scenarioId)) invalid('scenarioId must be S1 through S15.');

  const stdoutRef = `commands/${scenarioId}.stdout.bin`;
  const stderrRef = `commands/${scenarioId}.stderr.bin`;
  const redactedStdout = redactOutput(stdout, secretMarkers, { maxBytes });
  const redactedStderr = redactOutput(stderr, secretMarkers, { maxBytes });
  const persisted = validateScenarioEvidence({
    ...evidence,
    stdoutRef,
    stderrRef,
    stdoutRedactions: redactedStdout.redactions,
    stderrRedactions: redactedStderr.redactions,
    stdoutTruncated: redactedStdout.truncated,
    stderrTruncated: redactedStderr.truncated,
  });

  const commandsRoot = join(root, 'commands');
  const scenariosRoot = join(root, 'scenarios');
  await mkdir(commandsRoot, { recursive: true, mode: 0o700 });
  await mkdir(scenariosRoot, { recursive: true, mode: 0o700 });
  await atomicWrite(join(root, stdoutRef), redactedStdout.bytes);
  await atomicWrite(join(root, stderrRef), redactedStderr.bytes);

  const metadata = `${canonicalJson(persisted)}\n`;
  for (const marker of secretMarkers) {
    if (typeof marker === 'string' && marker.length > 0 && metadata.includes(marker)) {
      throw as02Error('EVIDENCE_SECRET_EXPOSURE', 'A synthetic marker would enter evidence metadata.', { scenarioId });
    }
  }
  await atomicWrite(join(scenariosRoot, `${scenarioId}.json`), metadata);
  return persisted;
}
