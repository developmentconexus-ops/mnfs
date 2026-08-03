import { randomUUID } from 'node:crypto';
import { isAbsolute, join, relative } from 'node:path';
import {
  mkdir,
  readFile,
  realpath,
  rename,
  writeFile,
} from 'node:fs/promises';

import { canonicalJson } from './canonical-json.mjs';
import { as02Error, assertAs02 } from './errors.mjs';

const RUN_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;
const ISO_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u;
const STATUSES = new Set([
  'PHASE_ONE_RUNNING',
  'AWAITING_RESTART',
  'RESTART_RUNNING',
  'COMPLETE',
  'FAILED',
  'CLEANED',
]);
const TOP_LEVEL_KEYS = new Set([
  'schemaVersion',
  'runId',
  'status',
  'createdAt',
  'updatedAt',
  'repositoryPath',
  'artifactRoot',
  'fixtureRoot',
  'lease',
  'preflight',
  'policies',
  'scenarios',
  'performance',
  'checkpointPath',
  'restart',
  'decision',
  'reportPath',
  'cleanup',
]);
const TRANSITIONS = Object.freeze({
  PHASE_ONE_RUNNING: new Set(['PHASE_ONE_RUNNING', 'AWAITING_RESTART', 'FAILED', 'CLEANED']),
  AWAITING_RESTART: new Set(['AWAITING_RESTART', 'RESTART_RUNNING', 'FAILED', 'CLEANED']),
  RESTART_RUNNING: new Set(['RESTART_RUNNING', 'COMPLETE', 'FAILED', 'CLEANED']),
  COMPLETE: new Set(['COMPLETE', 'CLEANED']),
  FAILED: new Set(['FAILED', 'CLEANED']),
  CLEANED: new Set(['CLEANED']),
});

function invalid(message, details = {}) {
  throw as02Error('RUN_STATE_INVALID', message, details);
}

function linuxPath(value, label, { nullable = false } = {}) {
  if (nullable && value === null) return value;
  if (
    typeof value !== 'string' ||
    !isAbsolute(value) ||
    value === '/mnt' ||
    value.startsWith('/mnt/') ||
    /[\r\n]/u.test(value)
  ) {
    invalid(`${label} must be one absolute Linux path outside /mnt.`, { value, label });
  }
  return value;
}

function iso(value, label) {
  if (typeof value !== 'string' || !ISO_PATTERN.test(value) || Number.isNaN(Date.parse(value))) {
    invalid(`${label} must be an ISO-8601 UTC timestamp.`, { value });
  }
  return value;
}

export function validateRunState(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.getPrototypeOf(value) !== Object.prototype) {
    invalid('Run state must be a plain object.');
  }
  for (const key of Object.keys(value)) {
    if (!TOP_LEVEL_KEYS.has(key)) invalid(`Unknown run state field: ${key}.`, { key });
  }
  for (const key of TOP_LEVEL_KEYS) {
    if (!Object.hasOwn(value, key)) invalid(`Missing run state field: ${key}.`, { key });
  }
  if (value.schemaVersion !== 1) invalid('Run state schemaVersion must be 1.');
  if (typeof value.runId !== 'string' || !RUN_ID_PATTERN.test(value.runId)) invalid('Run state runId is invalid.');
  if (!STATUSES.has(value.status)) invalid('Run state status is invalid.', { status: value.status });
  iso(value.createdAt, 'createdAt');
  iso(value.updatedAt, 'updatedAt');
  if (Date.parse(value.updatedAt) < Date.parse(value.createdAt)) invalid('updatedAt must not precede createdAt.');
  linuxPath(value.repositoryPath, 'repositoryPath');
  linuxPath(value.artifactRoot, 'artifactRoot');
  linuxPath(value.fixtureRoot, 'fixtureRoot');
  linuxPath(value.checkpointPath, 'checkpointPath', { nullable: true });
  linuxPath(value.reportPath, 'reportPath', { nullable: true });
  if (!(value.lease === null || (typeof value.lease === 'object' && !Array.isArray(value.lease)))) invalid('lease must be an object or null.');
  if (!value.preflight || typeof value.preflight !== 'object' || Array.isArray(value.preflight)) invalid('preflight must be an object.');
  if (!value.policies || typeof value.policies !== 'object' || Array.isArray(value.policies)) invalid('policies must be an object.');
  if (!Array.isArray(value.scenarios)) invalid('scenarios must be an array.');
  if (!(value.performance === null || (typeof value.performance === 'object' && !Array.isArray(value.performance)))) invalid('performance must be an object or null.');
  if (!(value.restart === null || (typeof value.restart === 'object' && !Array.isArray(value.restart)))) invalid('restart must be an object or null.');
  if (!(value.decision === null || (typeof value.decision === 'object' && !Array.isArray(value.decision)))) invalid('decision must be an object or null.');
  if (!value.cleanup || typeof value.cleanup !== 'object' || Array.isArray(value.cleanup)) invalid('cleanup must be an object.');
  if (!['PENDING', 'RUNNING', 'COMPLETE', 'FAILED'].includes(value.cleanup.status)) invalid('cleanup.status is invalid.');
  if (!Number.isInteger(value.cleanup.attempts) || value.cleanup.attempts < 0) invalid('cleanup.attempts is invalid.');
  return structuredClone(value);
}

function assertRunId(runId) {
  if (typeof runId !== 'string' || !RUN_ID_PATTERN.test(runId)) invalid('Run ID is invalid.', { runId });
}

function contained(base, candidate) {
  const relation = relative(base, candidate);
  return relation === '' || (!relation.startsWith('..') && !isAbsolute(relation));
}

async function atomicJson(path, value) {
  const temp = `${path}.tmp-${process.pid}-${randomUUID()}`;
  await writeFile(temp, `${canonicalJson(value)}\n`, { flag: 'wx', mode: 0o600 });
  await rename(temp, path);
}

async function parseJson(path, notFoundCode) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch (cause) {
    if (cause?.code === 'ENOENT') throw as02Error(notFoundCode, `Run state file not found: ${path}.`, { path });
    throw as02Error('RUN_STATE_INVALID', `Run state file is invalid: ${path}.`, {
      path,
      cause: cause instanceof Error ? cause.message : String(cause),
    });
  }
}

export async function createRunStore(basePath) {
  linuxPath(basePath, 'Run store base');
  await mkdir(basePath, { recursive: true, mode: 0o700 });
  const base = await realpath(basePath);

  function runDirectory(runId) {
    assertRunId(runId);
    const path = join(base, runId);
    if (!contained(base, path)) invalid('Run directory escapes store base.', { runId });
    return path;
  }

  async function save(input) {
    const state = validateRunState(input);
    const directory = runDirectory(state.runId);
    await mkdir(directory, { recursive: true, mode: 0o700 });
    await atomicJson(join(directory, 'state.json'), state);
    await atomicJson(join(base, 'latest.json'), { runId: state.runId });
    return state;
  }

  async function load(runId) {
    const state = await parseJson(join(runDirectory(runId), 'state.json'), 'RUN_STATE_NOT_FOUND');
    return validateRunState(state);
  }

  async function latest() {
    const index = await parseJson(join(base, 'latest.json'), 'RUN_STATE_NOT_FOUND');
    assertRunId(index?.runId);
    return load(index.runId);
  }

  async function update(runId, updater) {
    assertAs02(typeof updater === 'function', 'RUN_STATE_INVALID', 'Run state updater is required.');
    const current = await load(runId);
    const next = validateRunState(await updater(structuredClone(current)));
    if (next.runId !== current.runId) invalid('Run ID cannot change during update.');
    if (!TRANSITIONS[current.status].has(next.status)) {
      throw as02Error('RUN_STATE_TRANSITION_INVALID', `Invalid run state transition ${current.status} -> ${next.status}.`, {
        from: current.status,
        to: next.status,
      });
    }
    return save(next);
  }

  async function beginCleanup(runId, startedAt) {
    iso(startedAt, 'cleanup startedAt');
    return update(runId, (current) => ({
      ...current,
      updatedAt: startedAt,
      cleanup: {
        status: 'RUNNING',
        attempts: current.cleanup.attempts + 1,
        startedAt,
      },
    }));
  }

  return Object.freeze({ base, save, load, latest, update, beginCleanup });
}
