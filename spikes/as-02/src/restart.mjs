import { isAbsolute } from 'node:path';

import { canonicalJson, sha256Text } from './canonical-json.mjs';
import { as02Error, assertAs02 } from './errors.mjs';

const HASH_PATTERN = /^sha256:[a-f0-9]{64}$/u;
const ISO_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u;
const REQUIRED_SCENARIOS = Object.freeze(['S1', 'S3', 'S5', 'S9', 'S11', 'S13']);
const REQUIRED_DEPENDENCIES = Object.freeze([
  'node',
  'npm',
  'pi',
  'treehouse',
  'sandboxRuntime',
  'bwrap',
  'socat',
]);

function invalid(message, details = {}) {
  throw as02Error('RESTART_CHECKPOINT_INVALID', message, details);
}

function assertHash(value, label) {
  if (typeof value !== 'string' || !HASH_PATTERN.test(value)) invalid(`${label} must be a full SHA-256 digest.`, { value });
}

function normalizeInput(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) invalid('Restart checkpoint input must be an object.');
  if (typeof input.runId !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(input.runId)) invalid('runId is invalid.');
  if (typeof input.createdAt !== 'string' || !ISO_PATTERN.test(input.createdAt) || Number.isNaN(Date.parse(input.createdAt))) invalid('createdAt is invalid.');
  if (typeof input.checkpointPath !== 'string' || !isAbsolute(input.checkpointPath)) invalid('checkpointPath must be absolute.');
  assertHash(input.policyHash, 'policyHash');
  assertHash(input.fixtureManifestHash, 'fixtureManifestHash');

  if (!input.dependencies || typeof input.dependencies !== 'object' || Array.isArray(input.dependencies)) invalid('dependencies are required.');
  const dependencies = {};
  for (const key of REQUIRED_DEPENDENCIES) {
    const value = input.dependencies[key];
    if (typeof value !== 'string' || value.length === 0) invalid(`dependencies.${key} is required.`);
    dependencies[key] = value;
  }

  if (!input.wsl || typeof input.wsl !== 'object' || Array.isArray(input.wsl)) invalid('wsl identity is required.');
  const wsl = {};
  for (const key of ['distro', 'uname', 'architecture']) {
    const value = input.wsl[key];
    if (typeof value !== 'string' || value.length === 0) invalid(`wsl.${key} is required.`);
    wsl[key] = value;
  }

  if (!input.scenarioDigests || typeof input.scenarioDigests !== 'object' || Array.isArray(input.scenarioDigests)) invalid('scenarioDigests are required.');
  const keys = Object.keys(input.scenarioDigests);
  if (keys.length !== REQUIRED_SCENARIOS.length || REQUIRED_SCENARIOS.some((key) => !keys.includes(key))) {
    invalid(`scenarioDigests must contain exactly ${REQUIRED_SCENARIOS.join(', ')}.`);
  }
  const scenarioDigests = {};
  for (const scenarioId of REQUIRED_SCENARIOS) {
    assertHash(input.scenarioDigests[scenarioId], `scenarioDigests.${scenarioId}`);
    scenarioDigests[scenarioId] = input.scenarioDigests[scenarioId];
  }

  return {
    schemaVersion: 1,
    runId: input.runId,
    createdAt: input.createdAt,
    checkpointPath: input.checkpointPath,
    policyHash: input.policyHash,
    dependencies,
    wsl,
    fixtureManifestHash: input.fixtureManifestHash,
    scenarioDigests,
  };
}

function bodyFromCheckpoint(checkpoint) {
  const { checkpointHash: _ignored, ...body } = checkpoint;
  return body;
}

export async function createRestartCheckpoint(input) {
  const body = normalizeInput(input);
  return {
    ...body,
    checkpointHash: sha256Text(canonicalJson(body)),
  };
}

function recordDrift(drift, field, expected, actual) {
  if (expected !== actual) drift.push({ field, expected, actual });
}

export async function verifyRestartCheckpoint(checkpoint, currentInput) {
  if (!checkpoint || typeof checkpoint !== 'object' || Array.isArray(checkpoint)) {
    throw as02Error('RESTART_CHECKPOINT_TAMPERED', 'Restart checkpoint is not an object.');
  }
  const storedBody = normalizeInput(bodyFromCheckpoint(checkpoint));
  const computedHash = sha256Text(canonicalJson(storedBody));
  if (checkpoint.checkpointHash !== computedHash) {
    throw as02Error('RESTART_CHECKPOINT_TAMPERED', 'Restart checkpoint content does not match its hash.', {
      expected: checkpoint.checkpointHash,
      actual: computedHash,
    });
  }

  const current = normalizeInput(currentInput);
  const drift = [];
  recordDrift(drift, 'policyHash', storedBody.policyHash, current.policyHash);
  for (const key of REQUIRED_DEPENDENCIES) {
    recordDrift(drift, `dependencies.${key}`, storedBody.dependencies[key], current.dependencies[key]);
  }
  for (const key of ['distro', 'uname', 'architecture']) {
    recordDrift(drift, `wsl.${key}`, storedBody.wsl[key], current.wsl[key]);
  }
  recordDrift(drift, 'fixtureManifestHash', storedBody.fixtureManifestHash, current.fixtureManifestHash);
  for (const scenarioId of REQUIRED_SCENARIOS) {
    recordDrift(
      drift,
      `scenarioDigests.${scenarioId}`,
      storedBody.scenarioDigests[scenarioId],
      current.scenarioDigests[scenarioId],
    );
  }

  return {
    status: drift.length === 0 ? 'PASS' : 'RESTART_DRIFT',
    drift,
    checkpointHash: checkpoint.checkpointHash,
  };
}
