import { assertTc01 } from './errors.mjs';

const HASH_PATTERN = /^sha256:[a-f0-9]{64}$/u;
const RESULTS = new Set(['PASS', 'FAIL', 'BLOCKED', 'INCONCLUSIVE']);
const SCENARIO_IDS = Object.freeze(Array.from(
  { length: 15 },
  (_, index) => `TC01-S${String(index + 1).padStart(2, '0')}`,
));
const SCENARIO_ID_SET = new Set(SCENARIO_IDS);
const MATERIAL_REJECT_SCENARIOS = new Set([
  'TC01-S02',
  'TC01-S03',
  'TC01-S04',
  'TC01-S05',
  'TC01-S07',
  'TC01-S08',
  'TC01-S09',
  'TC01-S10',
  'TC01-S12',
]);

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

function requireString(value, label) {
  assertTc01(
    typeof value === 'string' && value.length > 0,
    'TC01_EVIDENCE_INVALID',
    `${label} must be a non-empty string.`,
    { label },
  );
  return value;
}

function requireOptionalString(value, label) {
  if (value === null) return null;
  return requireString(value, label);
}

function requireHash(value, label) {
  assertTc01(
    typeof value === 'string' && HASH_PATTERN.test(value),
    'TC01_EVIDENCE_INVALID',
    `${label} must be a complete SHA-256 identifier.`,
    { label, value: value ?? null },
  );
  return value;
}

function requireOptionalHash(value, label) {
  if (value === null) return null;
  return requireHash(value, label);
}

function validateProvenance(provenance) {
  assertTc01(isPlainObject(provenance), 'TC01_EVIDENCE_INVALID', 'TC-01 report provenance must be an object.');
  assertTc01(provenance.schemaVersion === 1, 'TC01_EVIDENCE_INVALID', 'TC-01 report provenance schema is unsupported.');
  assertTc01(isPlainObject(provenance.capabilities), 'TC01_EVIDENCE_INVALID', 'TC-01 provenance capabilities must be an object.');

  if (provenance.status === 'BLOCKED') {
    assertTc01(isPlainObject(provenance.error), 'TC01_EVIDENCE_INVALID', 'Blocked TC-01 provenance requires an error object.');
    requireString(provenance.error.code, 'Blocked TC-01 provenance error code');
    requireString(provenance.error.message, 'Blocked TC-01 provenance error message');
    requireString(provenance.nodeVersion, 'TC-01 provenance nodeVersion');
    requireString(provenance.capturedAt, 'TC-01 provenance capturedAt');
    for (const field of [
      'environment',
      'ubuntuRelease',
      'kernelRelease',
      'gitVersion',
      'treehouseVersion',
      'treehouseExecutable',
    ]) {
      requireOptionalString(provenance[field], `TC-01 provenance ${field}`);
    }
    requireOptionalHash(provenance.treehouseExecutableHash, 'TC-01 Treehouse executable hash');
    return provenance;
  }

  for (const field of [
    'environment',
    'ubuntuRelease',
    'kernelRelease',
    'nodeVersion',
    'gitVersion',
    'treehouseVersion',
    'treehouseExecutable',
  ]) {
    requireString(provenance[field], `TC-01 provenance ${field}`);
  }
  requireHash(provenance.treehouseExecutableHash, 'TC-01 Treehouse executable hash');
  return provenance;
}

function validateCleanup(cleanup) {
  assertTc01(isPlainObject(cleanup), 'TC01_EVIDENCE_INVALID', 'TC-01 cleanup state must be an object.');
  return {
    state: requireString(cleanup.state, 'TC-01 cleanup state'),
    rationale: requireString(cleanup.rationale, 'TC-01 cleanup rationale'),
  };
}

function validateScenario(record) {
  assertTc01(isPlainObject(record), 'TC01_EVIDENCE_INVALID', 'TC-01 scenario report input must be an object.');
  const scenarioId = requireString(record.scenarioId, 'TC-01 scenario ID');
  assertTc01(
    SCENARIO_ID_SET.has(scenarioId),
    'TC01_EVIDENCE_INVALID',
    'TC-01 report contains an unexpected scenario ID.',
    { scenarioId },
  );
  assertTc01(
    RESULTS.has(record.result),
    'TC01_EVIDENCE_INVALID',
    'TC-01 scenario result is invalid.',
    { scenarioId, result: record.result ?? null },
  );
  requireString(record.rationale, `${scenarioId} rationale`);
  requireString(record.expected, `${scenarioId} expected behavior`);
  assertTc01(isPlainObject(record.observations), 'TC01_EVIDENCE_INVALID', `${scenarioId} observations must be an object.`);
  requireString(record.stdoutRef, `${scenarioId} stdout reference`);
  requireString(record.stderrRef, `${scenarioId} stderr reference`);
  requireHash(record.stdoutHash, `${scenarioId} stdout hash`);
  requireHash(record.stderrHash, `${scenarioId} stderr hash`);
  return record;
}

function normalizeInput(input) {
  assertTc01(isPlainObject(input), 'TC01_EVIDENCE_INVALID', 'TC-01 report input must be an object.');
  const provenance = validateProvenance(input.provenance);
  const scenariosHash = requireHash(input.scenariosHash, 'TC-01 scenarios hash');
  const commandShapeHash = requireHash(input.commandShapeHash, 'TC-01 command-shape hash');
  const cleanup = validateCleanup(input.cleanup);
  assertTc01(Array.isArray(input.scenarios), 'TC01_EVIDENCE_INVALID', 'TC-01 report scenarios must be an array.');

  const seen = new Set();
  const records = input.scenarios.map((record) => {
    const validated = validateScenario(record);
    assertTc01(
      !seen.has(validated.scenarioId),
      'TC01_EVIDENCE_INVALID',
      'TC-01 report contains a duplicate scenario ID.',
      { scenarioId: validated.scenarioId },
    );
    seen.add(validated.scenarioId);
    return validated;
  }).sort((left, right) => compareCodeUnits(left.scenarioId, right.scenarioId));

  return {
    provenance,
    scenarios: records,
    scenariosHash,
    commandShapeHash,
    cleanup,
    missingScenarioIds: SCENARIO_IDS.filter((scenarioId) => !seen.has(scenarioId)),
  };
}

function issueEntry(record) {
  return {
    scenarioId: record.scenarioId,
    result: record.result,
    rationale: record.rationale,
  };
}

function limitationEntries(records) {
  const limitations = [];
  for (const record of records) {
    const limitation = record.observations?.limitation;
    if (typeof limitation === 'string' && limitation.length > 0) {
      limitations.push({
        scenarioId: record.scenarioId,
        code: limitation,
        rationale: record.rationale,
      });
    }
    if (
      record.scenarioId === 'TC01-S15'
      && record.result === 'BLOCKED'
      && record.observations?.stale === true
    ) {
      const changedFields = Array.isArray(record.observations.changedFields)
        ? record.observations.changedFields
          .filter((field) => typeof field === 'string' && field.length > 0)
          .sort(compareCodeUnits)
        : [];
      limitations.push({
        scenarioId: record.scenarioId,
        code: 'EVIDENCE_IDENTITY_DRIFT',
        changedFields,
        rationale: record.rationale,
      });
    }
  }
  return limitations.sort((left, right) => compareCodeUnits(left.scenarioId, right.scenarioId));
}

export function deriveTc01Verdict(input) {
  const normalized = normalizeInput(input);
  const failures = normalized.scenarios
    .filter((record) => record.result === 'FAIL')
    .map(issueEntry);
  const limitations = limitationEntries(normalized.scenarios);
  const limitedScenarioIds = new Set(limitations.map((entry) => entry.scenarioId));
  const blocked = normalized.scenarios
    .filter((record) => (
      (record.result === 'BLOCKED' || record.result === 'INCONCLUSIVE')
      && !limitedScenarioIds.has(record.scenarioId)
    ))
    .map(issueEntry);
  const materialFailures = failures.filter((entry) => MATERIAL_REJECT_SCENARIOS.has(entry.scenarioId));
  const nonMaterialFailures = failures.filter((entry) => !MATERIAL_REJECT_SCENARIOS.has(entry.scenarioId));

  let verdict;
  let rationale;
  if (materialFailures.length > 0) {
    verdict = 'REJECT';
    rationale = 'One or more material safety scenarios failed the TC-01 adapter contract.';
  } else if (
    normalized.missingScenarioIds.length > 0
    || blocked.length > 0
    || nonMaterialFailures.length > 0
  ) {
    verdict = 'BLOCKED';
    rationale = 'Required TC-01 Evidence is incomplete, blocked or inconclusive.';
  } else if (limitations.length > 0) {
    verdict = 'ACCEPT_WITH_LIMITATIONS';
    rationale = 'No material safety failure was observed, but explicit TC-01 limitations remain binding.';
  } else {
    verdict = 'ACCEPT';
    rationale = 'All fifteen TC-01 scenarios passed with no recorded limitation.';
  }

  return {
    schemaVersion: 1,
    verdict,
    rationale,
    scenarioCount: normalized.scenarios.length,
    scenarioIds: normalized.scenarios.map((record) => record.scenarioId),
    missingScenarioIds: normalized.missingScenarioIds,
    failures,
    blocked,
    limitations,
    bindings: {
      treehouseExecutableHash: normalized.provenance.treehouseExecutableHash,
      treehouseVersion: normalized.provenance.treehouseVersion,
      gitVersion: normalized.provenance.gitVersion,
      kernelRelease: normalized.provenance.kernelRelease,
      ubuntuRelease: normalized.provenance.ubuntuRelease,
      commandShapeHash: normalized.commandShapeHash,
      scenariosHash: normalized.scenariosHash,
    },
    cleanup: normalized.cleanup,
  };
}

function markdownText(value) {
  return String(value)
    .replace(/[\r\n\0]+/gu, ' ')
    .replaceAll('\\', '\\\\')
    .replaceAll('|', '\\|')
    .replaceAll('`', "'")
    .trim();
}

function markdownCode(value) {
  return `\`${value === null ? 'NOT_OBSERVED' : markdownText(value)}\``;
}

function renderIssueSection(title, entries, emptyText) {
  const lines = [`## ${title}`, ''];
  if (entries.length === 0) {
    lines.push(emptyText, '');
    return lines;
  }
  for (const entry of entries) {
    lines.push(`- ${markdownCode(entry.scenarioId)} — ${markdownText(entry.rationale)}`);
  }
  lines.push('');
  return lines;
}

export function renderTc01Report(input) {
  const normalized = normalizeInput(input);
  const verdict = deriveTc01Verdict(input);
  const lines = [
    '# TC-01 Treehouse Conformance Report',
    '',
    '## Decision',
    '',
    `- Verdict: ${markdownCode(verdict.verdict)}`,
    `- Rationale: ${markdownText(verdict.rationale)}`,
    `- Scenario coverage: ${markdownCode(`${verdict.scenarioCount}/${SCENARIO_IDS.length}`)}`,
    `- Scenarios SHA-256: ${markdownCode(normalized.scenariosHash)}`,
    `- Command-shape SHA-256: ${markdownCode(normalized.commandShapeHash)}`,
    `- Cleanup state: ${markdownCode(normalized.cleanup.state)}`,
    `- Cleanup rationale: ${markdownText(normalized.cleanup.rationale)}`,
    '',
    '## Provenance',
    '',
    '| Field | Value |',
    '| --- | --- |',
    `| Environment | ${markdownCode(normalized.provenance.environment)} |`,
    `| Ubuntu | ${markdownCode(normalized.provenance.ubuntuRelease)} |`,
    `| Kernel | ${markdownCode(normalized.provenance.kernelRelease)} |`,
    `| Node.js | ${markdownCode(normalized.provenance.nodeVersion)} |`,
    `| Git | ${markdownCode(normalized.provenance.gitVersion)} |`,
    `| Treehouse version | ${markdownCode(normalized.provenance.treehouseVersion)} |`,
    `| Treehouse executable | ${markdownCode(normalized.provenance.treehouseExecutable)} |`,
    `| Treehouse executable SHA-256 | ${markdownCode(normalized.provenance.treehouseExecutableHash)} |`,
  ];
  if (normalized.provenance.status === 'BLOCKED') {
    lines.push(
      `| Provenance status | ${markdownCode('BLOCKED')} |`,
      `| Blocking error | ${markdownCode(normalized.provenance.error.code)} — ${markdownText(normalized.provenance.error.message)} |`,
    );
  }
  lines.push('', '## Limitations', '');

  if (verdict.limitations.length === 0) {
    lines.push('No explicit limitation was recorded.', '');
  } else {
    for (const limitation of verdict.limitations) {
      const changed = Array.isArray(limitation.changedFields) && limitation.changedFields.length > 0
        ? `; changed fields: ${limitation.changedFields.map(markdownCode).join(', ')}`
        : '';
      lines.push(`- ${markdownCode(limitation.scenarioId)} — ${markdownCode(limitation.code)}${changed}: ${markdownText(limitation.rationale)}`);
    }
    lines.push('');
  }

  lines.push(
    '## Scenario results',
    '',
    '| Scenario | Result | Rationale | stdout artifact | stderr artifact |',
    '| --- | --- | --- | --- | --- |',
  );
  for (const record of normalized.scenarios) {
    lines.push(
      `| ${markdownCode(record.scenarioId)} | ${markdownCode(record.result)} | ${markdownText(record.rationale)} | ${markdownCode(record.stdoutRef)} | ${markdownCode(record.stderrRef)} |`,
    );
  }
  lines.push('');

  lines.push(...renderIssueSection('Failures', verdict.failures, 'No scenario failure was recorded.'));
  lines.push(...renderIssueSection('Blocked or inconclusive Evidence', verdict.blocked, 'No blocked or inconclusive scenario was recorded.'));

  lines.push(
    '## Hash bindings',
    '',
    '| Binding | SHA-256 or identity |',
    '| --- | --- |',
    `| Treehouse executable | ${markdownCode(verdict.bindings.treehouseExecutableHash)} |`,
    `| Treehouse version | ${markdownCode(verdict.bindings.treehouseVersion)} |`,
    `| Git version | ${markdownCode(verdict.bindings.gitVersion)} |`,
    `| Kernel | ${markdownCode(verdict.bindings.kernelRelease)} |`,
    `| Ubuntu | ${markdownCode(verdict.bindings.ubuntuRelease)} |`,
    `| Command shapes | ${markdownCode(verdict.bindings.commandShapeHash)} |`,
    `| Scenarios | ${markdownCode(verdict.bindings.scenariosHash)} |`,
    '',
    '## Authority boundary',
    '',
    'This Verdict is an R5 design input and does not authorize M01 implementation.',
    '',
  );
  return `${lines.join('\n')}\n`;
}
