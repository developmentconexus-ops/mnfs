import { randomUUID } from 'node:crypto';
import { existsSync, lstatSync, readFileSync, realpathSync } from 'node:fs';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { basename, dirname, isAbsolute, join, normalize, resolve, sep } from 'node:path';

import { canonicalJson, sha256Bytes } from './canonical-json.mjs';
import { assertTc01, tc01Error } from './errors.mjs';
import { assertLinuxOwnedAbsolutePath, validateRunId } from './paths.mjs';

const SCENARIO_PATTERN = /^TC01-S(0[1-9]|1[0-5])$/u;
const COMMAND_ID_PATTERN = /^[a-z0-9][a-z0-9-]{0,63}$/u;
const SHA256_PATTERN = /^sha256:[a-f0-9]{64}$/u;
const RESULTS = new Set(['PASS', 'FAIL', 'BLOCKED', 'INCONCLUSIVE']);
const EXCERPT_LIMIT = 4_096;
const ALL_SCENARIOS = Array.from({ length: 15 }, (_, index) => `TC01-S${String(index + 1).padStart(2, '0')}`);
const SCENARIO_KEYS = [
  'argv', 'cwd', 'executableHash', 'executablePath', 'exitCode', 'expected', 'finishedAt',
  'observations', 'rationale', 'result', 'scenarioId', 'signal', 'startedAt', 'stderrExcerpt',
  'stderrHash', 'stderrRef', 'stdoutExcerpt', 'stdoutHash', 'stdoutRef', 'timeoutMs', 'version',
].sort(compareCodeUnits);

function compareCodeUnits(left, right) {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function isPlainObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function evidencePath(value, label) {
  try {
    return assertLinuxOwnedAbsolutePath(value, label);
  } catch (error) {
    if (error?.code === 'TC01_EVIDENCE_INVALID') throw error;
    throw tc01Error('TC01_EVIDENCE_INVALID', `${label} is not a valid Linux-owned absolute path.`, {
      label,
      value,
      causeCode: error?.code ?? null,
      causeMessage: error instanceof Error ? error.message : String(error),
    });
  }
}

function evidenceRunId(value) {
  try {
    return validateRunId(value);
  } catch (error) {
    throw tc01Error('TC01_EVIDENCE_INVALID', 'Evidence run id is invalid.', {
      value,
      causeCode: error?.code ?? null,
      causeMessage: error instanceof Error ? error.message : String(error),
    });
  }
}

function assertExactKeys(value, expected, label) {
  const actual = Object.keys(value).sort(compareCodeUnits);
  assertTc01(
    actual.length === expected.length && actual.every((key, index) => key === expected[index]),
    'TC01_EVIDENCE_INVALID',
    `${label} contains unknown or missing fields.`,
    { actual, expected },
  );
}

function validateScenarioId(value) {
  assertTc01(
    typeof value === 'string' && SCENARIO_PATTERN.test(value),
    'TC01_EVIDENCE_INVALID',
    'TC-01 scenario id must be TC01-S01 through TC01-S15.',
    { value },
  );
  return value;
}

function validateCommandId(value) {
  assertTc01(
    typeof value === 'string' && COMMAND_ID_PATTERN.test(value),
    'TC01_EVIDENCE_INVALID',
    'TC-01 command id must be a bounded lowercase slug.',
    { value },
  );
  return value;
}

function validateTimestamp(value, label) {
  assertTc01(
    typeof value === 'string' && value.length > 0 && Number.isFinite(Date.parse(value)),
    'TC01_EVIDENCE_INVALID',
    `${label} must be a valid timestamp.`,
    { label, value },
  );
  return value;
}

function validateHash(value, label) {
  assertTc01(
    typeof value === 'string' && SHA256_PATTERN.test(value),
    'TC01_EVIDENCE_INVALID',
    `${label} must be a complete SHA-256 reference.`,
    { label, value },
  );
  return value;
}

function canonicalBytes(value) {
  return Buffer.from(`${canonicalJson(value)}\n`, 'utf8');
}

async function writeAtomic(path, bytes) {
  const destination = evidencePath(path, 'Evidence destination');
  await mkdir(dirname(destination), { recursive: true });
  const temporary = join(dirname(destination), `.${basename(destination)}.${process.pid}.${randomUUID()}.tmp`);
  try {
    await writeFile(temporary, bytes, { flag: 'wx' });
    await rename(temporary, destination);
  } catch (error) {
    await rm(temporary, { force: true }).catch(() => {});
    throw error;
  }
}

function excerpt(bytes) {
  return Buffer.from(bytes).toString('utf8').slice(0, EXCERPT_LIMIT);
}

function validateArtifactRef(ref, artifactsRoot, scenarioId, label) {
  assertTc01(
    typeof ref === 'string' && ref.length > 0 && !isAbsolute(ref) && !ref.includes('\\'),
    'TC01_EVIDENCE_INVALID',
    `${label} must be a relative POSIX artifact reference.`,
    { label, ref },
  );
  const normalized = normalize(ref).split(sep).join('/');
  assertTc01(
    normalized === ref && !ref.split('/').some((segment) => segment === '' || segment === '.' || segment === '..'),
    'TC01_EVIDENCE_INVALID',
    `${label} contains unsafe path segments.`,
    { label, ref },
  );
  assertTc01(
    ref.startsWith(`commands/${scenarioId}/`),
    'TC01_EVIDENCE_INVALID',
    `${label} is not scoped to its scenario.`,
    { label, ref, scenarioId },
  );

  const root = evidencePath(artifactsRoot, 'Evidence artifacts root');
  const absolute = resolve(root, ref);
  assertTc01(
    absolute.startsWith(`${root}${sep}`),
    'TC01_EVIDENCE_INVALID',
    `${label} escaped the Evidence artifacts root.`,
    { label, ref, absolute, artifactsRoot: root },
  );
  assertTc01(existsSync(absolute), 'TC01_EVIDENCE_INVALID', `${label} does not exist.`, { label, ref });
  const stat = lstatSync(absolute);
  assertTc01(stat.isFile() && !stat.isSymbolicLink(), 'TC01_EVIDENCE_INVALID', `${label} must reference a regular file.`, { label, ref });
  const real = realpathSync(absolute);
  assertTc01(real.startsWith(`${root}${sep}`), 'TC01_EVIDENCE_INVALID', `${label} resolved outside the artifacts root.`, { label, ref, real });
  return { ref, absolute: real };
}

function validateProcessSpec(spec) {
  assertTc01(isPlainObject(spec), 'TC01_EVIDENCE_INVALID', 'Command process spec must be an object.');
  const file = evidencePath(spec.file, 'Evidence command executable');
  const cwd = evidencePath(spec.cwd, 'Evidence command cwd');
  assertTc01(file === spec.file, 'TC01_EVIDENCE_INVALID', 'Command executable must be canonical.', { actual: spec.file, canonical: file });
  assertTc01(cwd === spec.cwd, 'TC01_EVIDENCE_INVALID', 'Command cwd must be canonical.', { actual: spec.cwd, canonical: cwd });
  assertTc01(
    Array.isArray(spec.args) && spec.args.length > 0
      && spec.args.every((value) => typeof value === 'string' && !value.includes('\n') && !value.includes('\r')),
    'TC01_EVIDENCE_INVALID',
    'Command argv must be a non-empty newline-free string array.',
    { args: spec.args },
  );
  assertTc01(isPlainObject(spec.env), 'TC01_EVIDENCE_INVALID', 'Command environment must be an object.');
  assertTc01(
    Object.entries(spec.env).every(([key, value]) => typeof key === 'string' && key.length > 0 && typeof value === 'string'),
    'TC01_EVIDENCE_INVALID',
    'Command environment values must be strings.',
  );
  for (const label of ['timeoutMs', 'stdoutLimitBytes', 'stderrLimitBytes']) {
    assertTc01(
      Number.isSafeInteger(spec[label]) && spec[label] > 0,
      'TC01_EVIDENCE_INVALID',
      `${label} must be a positive safe integer.`,
      { label, value: spec[label] },
    );
  }
  return { file, cwd };
}

function validateProcessResult(result) {
  assertTc01(isPlainObject(result), 'TC01_EVIDENCE_INVALID', 'Command process result must be an object.');
  validateTimestamp(result.startedAt, 'Command startedAt');
  validateTimestamp(result.finishedAt, 'Command finishedAt');
  assertTc01(Date.parse(result.finishedAt) >= Date.parse(result.startedAt), 'TC01_EVIDENCE_INVALID', 'Command finishedAt precedes startedAt.');
  assertTc01(Number.isSafeInteger(result.durationMs) && result.durationMs >= 0, 'TC01_EVIDENCE_INVALID', 'Command duration must be a non-negative safe integer.');
  assertTc01(result.exitCode === null || Number.isSafeInteger(result.exitCode), 'TC01_EVIDENCE_INVALID', 'Command exit code must be an integer or null.');
  assertTc01(result.signal === null || (typeof result.signal === 'string' && result.signal.length > 0), 'TC01_EVIDENCE_INVALID', 'Command signal must be a non-empty string or null.');
  assertTc01(Buffer.isBuffer(result.stdout), 'TC01_EVIDENCE_INVALID', 'Command stdout must be a Buffer.');
  assertTc01(Buffer.isBuffer(result.stderr), 'TC01_EVIDENCE_INVALID', 'Command stderr must be a Buffer.');
  assertTc01(typeof result.timedOut === 'boolean', 'TC01_EVIDENCE_INVALID', 'Command timedOut must be boolean.');
}

export function validateScenarioEvidence(value, artifactsRoot) {
  assertTc01(isPlainObject(value), 'TC01_EVIDENCE_INVALID', 'Scenario Evidence must be an object.');
  assertExactKeys(value, SCENARIO_KEYS, 'Scenario Evidence');
  const scenarioId = validateScenarioId(value.scenarioId);
  validateTimestamp(value.startedAt, 'Scenario startedAt');
  validateTimestamp(value.finishedAt, 'Scenario finishedAt');
  assertTc01(Date.parse(value.finishedAt) >= Date.parse(value.startedAt), 'TC01_EVIDENCE_INVALID', 'Scenario finishedAt precedes startedAt.');

  const executablePath = evidencePath(value.executablePath, 'Scenario executable');
  const cwd = evidencePath(value.cwd, 'Scenario cwd');
  assertTc01(executablePath === value.executablePath, 'TC01_EVIDENCE_INVALID', 'Scenario executable path must be canonical.');
  assertTc01(cwd === value.cwd, 'TC01_EVIDENCE_INVALID', 'Scenario cwd must be canonical.');
  validateHash(value.executableHash, 'Scenario executable hash');
  assertTc01(typeof value.version === 'string' && value.version.length > 0, 'TC01_EVIDENCE_INVALID', 'Scenario version is required.');
  assertTc01(
    Array.isArray(value.argv) && value.argv.length > 0
      && value.argv.every((item) => typeof item === 'string' && !item.includes('\n') && !item.includes('\r')),
    'TC01_EVIDENCE_INVALID',
    'Scenario argv must be a non-empty newline-free string array.',
  );
  assertTc01(Number.isSafeInteger(value.timeoutMs) && value.timeoutMs > 0, 'TC01_EVIDENCE_INVALID', 'Scenario timeout must be a positive safe integer.');
  assertTc01(value.exitCode === null || Number.isSafeInteger(value.exitCode), 'TC01_EVIDENCE_INVALID', 'Scenario exit code must be an integer or null.');
  assertTc01(value.signal === null || (typeof value.signal === 'string' && value.signal.length > 0), 'TC01_EVIDENCE_INVALID', 'Scenario signal must be a non-empty string or null.');
  assertTc01(typeof value.expected === 'string' && value.expected.length > 0, 'TC01_EVIDENCE_INVALID', 'Scenario expected behavior is required.');
  assertTc01(isPlainObject(value.observations), 'TC01_EVIDENCE_INVALID', 'Scenario observations must be an object.');
  canonicalJson(value.observations);
  assertTc01(RESULTS.has(value.result), 'TC01_EVIDENCE_INVALID', 'Scenario result is invalid.', { result: value.result });
  assertTc01(typeof value.rationale === 'string' && value.rationale.length > 0, 'TC01_EVIDENCE_INVALID', 'Scenario rationale is required.');
  assertTc01(typeof value.stdoutExcerpt === 'string' && value.stdoutExcerpt.length <= EXCERPT_LIMIT, 'TC01_EVIDENCE_INVALID', 'Scenario stdout excerpt exceeds the limit.');
  assertTc01(typeof value.stderrExcerpt === 'string' && value.stderrExcerpt.length <= EXCERPT_LIMIT, 'TC01_EVIDENCE_INVALID', 'Scenario stderr excerpt exceeds the limit.');

  const stdout = validateArtifactRef(value.stdoutRef, artifactsRoot, scenarioId, 'Scenario stdout reference');
  const stderr = validateArtifactRef(value.stderrRef, artifactsRoot, scenarioId, 'Scenario stderr reference');
  validateHash(value.stdoutHash, 'Scenario stdout hash');
  validateHash(value.stderrHash, 'Scenario stderr hash');
  assertTc01(sha256Bytes(readFileSync(stdout.absolute)) === value.stdoutHash, 'TC01_EVIDENCE_INVALID', 'Scenario stdout hash does not match the artifact.', { ref: value.stdoutRef });
  assertTc01(sha256Bytes(readFileSync(stderr.absolute)) === value.stderrHash, 'TC01_EVIDENCE_INVALID', 'Scenario stderr hash does not match the artifact.', { ref: value.stderrRef });
  return value;
}

export async function createEvidenceStore(fixture) {
  assertTc01(isPlainObject(fixture), 'TC01_EVIDENCE_INVALID', 'Evidence fixture must be an object.');
  evidenceRunId(fixture.runId);
  const runRoot = evidencePath(fixture.runRoot, 'Evidence run root');
  const artifactsRoot = evidencePath(fixture.artifactsRoot, 'Evidence artifacts root');
  assertTc01(runRoot === fixture.runRoot, 'TC01_EVIDENCE_INVALID', 'Evidence run root must be canonical.');
  assertTc01(artifactsRoot === fixture.artifactsRoot, 'TC01_EVIDENCE_INVALID', 'Evidence artifacts root must be canonical.');
  assertTc01(artifactsRoot.startsWith(`${runRoot}${sep}`), 'TC01_EVIDENCE_INVALID', 'Evidence artifacts root escaped the fixture run root.');
  await mkdir(artifactsRoot, { recursive: true });

  const environmentPath = join(artifactsRoot, 'environment.json');
  const scenariosPath = join(artifactsRoot, 'scenarios.json');
  const manifestPath = join(artifactsRoot, 'manifest.json');

  function assertMutable() {
    assertTc01(!existsSync(manifestPath), 'TC01_EVIDENCE_INVALID', 'TC-01 Evidence has already been finalized.', { manifestPath });
  }

  async function readScenariosInternal() {
    if (!existsSync(scenariosPath)) return [];
    let parsed;
    try {
      parsed = JSON.parse(await readFile(scenariosPath, 'utf8'));
    } catch (error) {
      throw tc01Error('TC01_EVIDENCE_INVALID', 'Unable to read TC-01 scenarios.', {
        scenariosPath,
        cause: error instanceof Error ? error.message : String(error),
      });
    }
    assertTc01(Array.isArray(parsed), 'TC01_EVIDENCE_INVALID', 'TC-01 scenarios aggregate must be an array.');
    const seen = new Set();
    for (const record of parsed) {
      validateScenarioEvidence(record, artifactsRoot);
      assertTc01(!seen.has(record.scenarioId), 'TC01_EVIDENCE_INVALID', 'TC-01 scenarios aggregate contains a duplicate.', { scenarioId: record.scenarioId });
      seen.add(record.scenarioId);
    }
    return parsed.sort((left, right) => compareCodeUnits(left.scenarioId, right.scenarioId));
  }

  return {
    async writeCommand({ scenarioId, commandId, spec, result }) {
      assertMutable();
      const safeScenarioId = validateScenarioId(scenarioId);
      const safeCommandId = validateCommandId(commandId);
      const { file, cwd } = validateProcessSpec(spec);
      validateProcessResult(result);

      const commandRoot = join(artifactsRoot, 'commands', safeScenarioId, safeCommandId);
      assertTc01(!existsSync(commandRoot), 'TC01_EVIDENCE_INVALID', 'Command Evidence already exists.', { scenarioId, commandId });
      await mkdir(commandRoot, { recursive: true });

      const stdoutRef = `commands/${safeScenarioId}/${safeCommandId}/stdout.bin`;
      const stderrRef = `commands/${safeScenarioId}/${safeCommandId}/stderr.bin`;
      const metadataRef = `commands/${safeScenarioId}/${safeCommandId}/metadata.json`;
      const stdoutHash = sha256Bytes(result.stdout);
      const stderrHash = sha256Bytes(result.stderr);
      const stdoutExcerpt = excerpt(result.stdout);
      const stderrExcerpt = excerpt(result.stderr);

      await writeAtomic(join(artifactsRoot, stdoutRef), result.stdout);
      await writeAtomic(join(artifactsRoot, stderrRef), result.stderr);

      const metadata = {
        schemaVersion: 1,
        scenarioId: safeScenarioId,
        commandId: safeCommandId,
        executablePath: file,
        argv: [...spec.args],
        cwd,
        timeoutMs: spec.timeoutMs,
        stdoutLimitBytes: spec.stdoutLimitBytes,
        stderrLimitBytes: spec.stderrLimitBytes,
        shell: false,
        stdin: 'closed',
        environmentKeys: Object.keys(spec.env).sort(compareCodeUnits),
        startedAt: result.startedAt,
        finishedAt: result.finishedAt,
        durationMs: result.durationMs,
        exitCode: result.exitCode,
        signal: result.signal,
        timedOut: result.timedOut,
        stdoutRef,
        stderrRef,
        stdoutHash,
        stderrHash,
        stdoutByteLength: result.stdout.length,
        stderrByteLength: result.stderr.length,
        stdoutExcerpt,
        stderrExcerpt,
      };
      await writeAtomic(join(artifactsRoot, metadataRef), canonicalBytes(metadata));
      return { metadataRef, stdoutRef, stderrRef, stdoutHash, stderrHash, stdoutExcerpt, stderrExcerpt };
    },

    async writeScenario(record) {
      assertMutable();
      validateScenarioEvidence(record, artifactsRoot);
      const scenarios = await readScenariosInternal();
      assertTc01(
        !scenarios.some((existing) => existing.scenarioId === record.scenarioId),
        'TC01_EVIDENCE_INVALID',
        'Scenario Evidence already exists.',
        { scenarioId: record.scenarioId },
      );
      scenarios.push(record);
      scenarios.sort((left, right) => compareCodeUnits(left.scenarioId, right.scenarioId));
      await writeAtomic(scenariosPath, canonicalBytes(scenarios));
      return record;
    },

    async writeEnvironment(environment) {
      assertMutable();
      assertTc01(!existsSync(environmentPath), 'TC01_EVIDENCE_INVALID', 'Environment Evidence already exists.', { environmentPath });
      assertTc01(isPlainObject(environment), 'TC01_EVIDENCE_INVALID', 'Environment Evidence must be an object.');
      const bytes = canonicalBytes(environment);
      await writeAtomic(environmentPath, bytes);
      return { ref: 'environment.json', sha256: sha256Bytes(bytes) };
    },

    async readScenarios() {
      return readScenariosInternal();
    },

    async finalize({ finalizedAt = new Date().toISOString() } = {}) {
      assertMutable();
      validateTimestamp(finalizedAt, 'Evidence finalizedAt');
      assertTc01(existsSync(environmentPath), 'TC01_EVIDENCE_INVALID', 'Environment Evidence is missing.');
      const scenarios = await readScenariosInternal();
      const present = scenarios.map((record) => record.scenarioId);
      const missing = ALL_SCENARIOS.filter((scenarioId) => !present.includes(scenarioId));
      const unexpected = present.filter((scenarioId) => !ALL_SCENARIOS.includes(scenarioId));
      assertTc01(
        scenarios.length === ALL_SCENARIOS.length && missing.length === 0 && unexpected.length === 0,
        'TC01_EVIDENCE_INVALID',
        'TC-01 Evidence requires exactly S01 through S15 before finalization.',
        { present, missing, unexpected },
      );

      const environmentBytes = await readFile(environmentPath);
      const scenariosBytes = await readFile(scenariosPath);
      const manifest = {
        schemaVersion: 1,
        runId: fixture.runId,
        finalizedAt,
        environmentRef: 'environment.json',
        environmentHash: sha256Bytes(environmentBytes),
        scenariosRef: 'scenarios.json',
        scenariosHash: sha256Bytes(scenariosBytes),
        scenarioCount: scenarios.length,
        scenarioIds: present,
      };
      const bytes = canonicalBytes(manifest);
      await writeAtomic(manifestPath, bytes);
      return { ref: 'manifest.json', sha256: sha256Bytes(bytes) };
    },
  };
}
