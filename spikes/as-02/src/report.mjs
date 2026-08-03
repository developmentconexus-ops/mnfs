import { canonicalJson } from './canonical-json.mjs';
import { as02Error, assertAs02 } from './errors.mjs';

const REQUIRED_SCENARIOS = Array.from({ length: 15 }, (_, index) => `S${index + 1}`);
const MATERIAL_FAILURES = new Set([
  'FILESYSTEM_POLICY_BYPASS',
  'NETWORK_POLICY_BYPASS',
  'SOCKET_POLICY_BYPASS',
  'POLICY_HASH_MISMATCH',
  'POLICY_TAMPER',
  'CHILD_PROCESS_ESCAPE',
  'FAIL_OPEN_DETECTED',
]);

function orderedScenarios(scenarios) {
  return [...scenarios].sort((left, right) => Number(left.scenarioId.slice(1)) - Number(right.scenarioId.slice(1)));
}

function unique(values) {
  return [...new Set(values.filter((value) => typeof value === 'string' && value.trim().length > 0))];
}

export function deriveDecision(input) {
  assertAs02(input && typeof input === 'object', 'DECISION_INVALID', 'Decision input must be an object.');
  assertAs02(Array.isArray(input.scenarios), 'DECISION_INVALID', 'Decision scenarios must be an array.');

  const scenarios = input.scenarios;
  const materialFailures = scenarios.filter(
    (scenario) => scenario?.result === 'FAIL' && MATERIAL_FAILURES.has(scenario?.failureCode),
  );
  if (materialFailures.length > 0) {
    return {
      verdict: 'REJECT',
      reasons: materialFailures.map(
        (scenario) => `${scenario.scenarioId}: ${scenario.failureCode} — ${scenario.rationale}`,
      ),
      entryCriteria: [],
    };
  }

  const otherFailures = scenarios.filter((scenario) => scenario?.result === 'FAIL');
  if (otherFailures.length > 0) {
    return {
      verdict: 'REJECT',
      reasons: otherFailures.map(
        (scenario) => `${scenario.scenarioId}: ${scenario.failureCode ?? 'SCENARIO_FAILED'} — ${scenario.rationale}`,
      ),
      entryCriteria: [],
    };
  }

  if (input.preflight?.status !== 'READY') {
    return {
      verdict: 'BLOCKED',
      reasons: [`Preflight is ${input.preflight?.status ?? 'MISSING'}.`],
      entryCriteria: [],
    };
  }

  const ids = scenarios.map((scenario) => scenario?.scenarioId);
  const idSet = new Set(ids);
  const missing = REQUIRED_SCENARIOS.filter((scenarioId) => !idSet.has(scenarioId));
  const duplicates = ids.filter((scenarioId, index) => ids.indexOf(scenarioId) !== index);
  if (missing.length > 0 || duplicates.length > 0) {
    return {
      verdict: 'BLOCKED',
      reasons: [
        ...(missing.length > 0 ? [`Missing required scenarios: ${missing.join(', ')}.`] : []),
        ...(duplicates.length > 0 ? [`Duplicate scenario evidence: ${unique(duplicates).join(', ')}.`] : []),
      ],
      entryCriteria: [],
    };
  }

  if (input.restart?.status !== 'PASS') {
    return {
      verdict: 'BLOCKED',
      reasons: [`Restart proof is ${input.restart?.status ?? 'MISSING'}.`],
      entryCriteria: [],
    };
  }

  const blocked = scenarios.filter((scenario) => scenario.result === 'BLOCKED');
  if (blocked.length > 0) {
    return {
      verdict: 'BLOCKED',
      reasons: blocked.map((scenario) => `${scenario.scenarioId}: ${scenario.rationale}`),
      entryCriteria: [],
    };
  }

  const inconclusive = scenarios.filter((scenario) => scenario.result === 'INCONCLUSIVE');
  const unsupportedSocket = inconclusive.filter(
    (scenario) => scenario.scenarioId === 'S8' && scenario.failureCode === 'SOCKET_POLICY_UNSUPPORTED',
  );
  const otherInconclusive = inconclusive.filter((scenario) => !unsupportedSocket.includes(scenario));
  if (otherInconclusive.length > 0) {
    return {
      verdict: 'BLOCKED',
      reasons: otherInconclusive.map((scenario) => `${scenario.scenarioId}: ${scenario.rationale}`),
      entryCriteria: [],
    };
  }

  if (input.performance?.measured !== true) {
    return {
      verdict: 'BLOCKED',
      reasons: ['Performance evidence is missing.'],
      entryCriteria: [],
    };
  }

  const entryCriteria = unique([
    ...(input.limitations ?? []),
    ...(input.performance?.limitations ?? []),
    ...(unsupportedSocket.length > 0
      ? ['Require a supported architecture with proven socket enforcement before M2 Worker execution.']
      : []),
  ]);

  if (entryCriteria.length > 0) {
    return {
      verdict: 'ACCEPT_WITH_LIMITATIONS',
      reasons: [
        ...(unsupportedSocket.length > 0 ? ['S8 socket enforcement is not proven on this architecture.'] : []),
        ...entryCriteria,
      ],
      entryCriteria,
    };
  }

  return {
    verdict: 'ACCEPT',
    reasons: ['All required AS-02 evidence passed.'],
    entryCriteria: [],
  };
}

function cell(value) {
  return String(value).replaceAll('|', '\\|').replace(/[\r\n]+/gu, ' ').trim();
}

export function renderReport({ title, environment, policyHash, scenarios, decision }) {
  assertAs02(typeof title === 'string' && title.trim().length > 0, 'DECISION_INVALID', 'Report title is required.');
  assertAs02(environment && typeof environment === 'object', 'DECISION_INVALID', 'Report environment is required.');
  assertAs02(typeof policyHash === 'string', 'DECISION_INVALID', 'Report policy hash is required.');
  assertAs02(Array.isArray(scenarios), 'DECISION_INVALID', 'Report scenarios must be an array.');
  assertAs02(decision && typeof decision === 'object', 'DECISION_INVALID', 'Report decision is required.');

  const lines = [
    `# ${title.trim()}`,
    '',
    `**Verdict:** \`${decision.verdict}\`  `,
    `**Policy hash:** \`${policyHash}\``,
    '',
    '## Environment',
    '',
    '```json',
    canonicalJson(environment),
    '```',
    '',
    '## Scenarios',
    '',
    '| Scenario | Expected | Result | Failure | Rationale |',
    '|---|---|---|---|---|',
  ];

  for (const scenario of orderedScenarios(scenarios)) {
    lines.push(
      `| ${cell(scenario.scenarioId)} | ${cell(scenario.expected)} | ${cell(scenario.result)} | ${cell(scenario.failureCode ?? '')} | ${cell(scenario.rationale)} |`,
    );
  }

  lines.push('', '## Decision reasons', '');
  for (const reason of decision.reasons ?? []) lines.push(`- ${reason}`);
  lines.push('', '## Required M2 entry criteria', '');
  if ((decision.entryCriteria ?? []).length === 0) lines.push('- None introduced by this decision.');
  else for (const criterion of decision.entryCriteria) lines.push(`- ${criterion}`);
  lines.push('');
  return lines.join('\n');
}
