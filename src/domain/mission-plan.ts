import { createHash } from 'node:crypto';

import { MnfsError } from './errors.js';

export interface MissionPlanContent {
  readonly schemaVersion: 1;
  readonly missionId: string;
  readonly title: string;
  readonly goal: string;
  readonly successCriteria: readonly string[];
  readonly scope: {
    readonly included: readonly string[];
    readonly excluded: readonly string[];
  };
  readonly assumptions: readonly string[];
  readonly milestones: readonly MilestonePlan[];
  readonly risks: readonly RiskPlan[];
  readonly questions: readonly PlanQuestion[];
}

export interface MilestonePlan {
  readonly id: string;
  readonly title: string;
  readonly outcome: string;
  readonly dependsOn: readonly string[];
  readonly features: readonly FeaturePlan[];
}

export interface FeaturePlan {
  readonly id: string;
  readonly title: string;
  readonly outcome: string;
  readonly acceptanceCriteria: readonly string[];
  readonly dependsOn: readonly string[];
}

export interface RiskPlan {
  readonly id: string;
  readonly description: string;
  readonly mitigation: string;
}

export interface PlanQuestion {
  readonly id: string;
  readonly question: string;
  readonly blocking: boolean;
  readonly status: 'OPEN' | 'ANSWERED';
  readonly answer?: string;
}

export type MissionPlanRevisionStatus = 'DRAFT' | 'SUPERSEDED' | 'APPROVED';

export interface MissionPlanRevision {
  readonly missionId: string;
  readonly revision: number;
  readonly status: MissionPlanRevisionStatus;
  readonly contentHash: string;
  readonly content: MissionPlanContent;
  readonly createdAt: string;
  readonly approvedAt?: string;
}

type JsonPrimitive = null | boolean | number | string;
type JsonValue = JsonPrimitive | readonly JsonValue[] | { readonly [key: string]: JsonValue };

const ID_PATTERNS = {
  mission: /^MIS-\d{3,}$/,
  milestone: /^M\d{2,}$/,
  feature: /^F\d{2,}$/,
  risk: /^R\d{2,}$/,
  question: /^Q\d{2,}$/,
} as const;

function fail(path: string, message: string): never {
  throw new MnfsError('PLAN_INVALID', `${path}: ${message}`);
}

function objectAt(value: unknown, path: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    fail(path, 'must be an object.');
  }
  return value as Record<string, unknown>;
}

function stringAt(value: unknown, path: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    fail(path, 'must be a non-empty string.');
  }
  return value.trim();
}

function booleanAt(value: unknown, path: string): boolean {
  if (typeof value !== 'boolean') fail(path, 'must be a boolean.');
  return value;
}

function stringArrayAt(value: unknown, path: string, options: { readonly nonEmpty?: boolean } = {}): string[] {
  if (!Array.isArray(value)) fail(path, 'must be an array.');
  const result = value.map((item, index) => stringAt(item, `${path}[${index}]`));
  if (options.nonEmpty && result.length === 0) fail(path, 'must contain at least one item.');
  if (new Set(result).size !== result.length) fail(path, 'must not contain duplicate values.');
  return result;
}

function idAt(value: unknown, path: string, pattern: RegExp): string {
  const id = stringAt(value, path);
  if (!pattern.test(id)) fail(path, `has invalid identifier format: ${id}.`);
  return id;
}

function assertUnique(ids: readonly string[], path: string): void {
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) fail(path, `contains duplicate id ${id}.`);
    seen.add(id);
  }
}

function assertReferencesExist(
  owner: string,
  references: readonly string[],
  available: ReadonlySet<string>,
  path: string,
): void {
  for (const reference of references) {
    if (reference === owner) fail(path, `must not reference itself (${owner}).`);
    if (!available.has(reference)) fail(path, `references unknown id ${reference}.`);
  }
}

function assertAcyclic(nodes: readonly string[], edges: ReadonlyMap<string, readonly string[]>, path: string): void {
  const visiting = new Set<string>();
  const visited = new Set<string>();

  const visit = (node: string): void => {
    if (visited.has(node)) return;
    if (visiting.has(node)) fail(path, `contains a dependency cycle at ${node}.`);

    visiting.add(node);
    for (const dependency of edges.get(node) ?? []) visit(dependency);
    visiting.delete(node);
    visited.add(node);
  };

  for (const node of nodes) visit(node);
}

function parseFeature(value: unknown, path: string): FeaturePlan {
  const input = objectAt(value, path);
  return {
    id: idAt(input.id, `${path}.id`, ID_PATTERNS.feature),
    title: stringAt(input.title, `${path}.title`),
    outcome: stringAt(input.outcome, `${path}.outcome`),
    acceptanceCriteria: stringArrayAt(input.acceptanceCriteria, `${path}.acceptanceCriteria`, { nonEmpty: true }),
    dependsOn: stringArrayAt(input.dependsOn, `${path}.dependsOn`),
  };
}

function parseMilestone(value: unknown, path: string): MilestonePlan {
  const input = objectAt(value, path);
  if (!Array.isArray(input.features) || input.features.length === 0) {
    fail(`${path}.features`, 'must contain at least one feature.');
  }

  return {
    id: idAt(input.id, `${path}.id`, ID_PATTERNS.milestone),
    title: stringAt(input.title, `${path}.title`),
    outcome: stringAt(input.outcome, `${path}.outcome`),
    dependsOn: stringArrayAt(input.dependsOn, `${path}.dependsOn`),
    features: input.features.map((feature, index) => parseFeature(feature, `${path}.features[${index}]`)),
  };
}

function parseRisk(value: unknown, path: string): RiskPlan {
  const input = objectAt(value, path);
  return {
    id: idAt(input.id, `${path}.id`, ID_PATTERNS.risk),
    description: stringAt(input.description, `${path}.description`),
    mitigation: stringAt(input.mitigation, `${path}.mitigation`),
  };
}

function parseQuestion(value: unknown, path: string): PlanQuestion {
  const input = objectAt(value, path);
  const status = input.status;
  if (status !== 'OPEN' && status !== 'ANSWERED') fail(`${path}.status`, 'must be OPEN or ANSWED.');

  const answer = input.answer === undefined ? undefined : stringAt(input.answer, `${path}.answer`);
  if (status === 'ANSWERED' && answer === undefined) fail(`${path}.answer`, 'is required for an answered question.');
  if (status === 'OPEN' && answer !== undefined) fail(`${path}.answer`, 'must be omitted while the question is open.');

  return {
    id: idAt(input.id, `${path}.id`, ID_PATTERNS.question),
    question: stringAt(input.question, `${path}.question`),
    blocking: booleanAt(input.blocking, `${path}.blocking`),
    status,
    ...(answer === undefined ? {} : { answer }),
  };
}

export function validateMissionPlan(value: unknown, expectedMissionId: string): MissionPlanContent {
  const input = objectAt(value, 'plan');
  if (input.schemaVersion !== 1) fail('plan.schemaVersion', 'must equal 1.');

  const missionId = idAt(input.missionId, 'plan.missionId', ID_PATTERNS.mission);
  if (missionId !== expectedMissionId) {
    fail('plan.missionId', `must equal target mission ${expectedMissionId}.`);
  }

  if (!Array.isArray(input.milestones) || input.milestones.length === 0) {
    fail('plan.milestones', 'must contain at least one milestone.');
  }
  if (!Array.isArray(input.risks)) fail('plan.risks', 'must be an array.');
  if (!Array.isArray(input.questions)) fail('plan.questions', 'must be an array.');

  const milestones = input.milestones.map((item, index) => parseMilestone(item, `plan.milestones[${index}]`));
  const risks = input.risks.map((item, index) => parseRisk(item, `plan.risks[${index}]`));
  const questions = input.questions.map((item, index) => parseQuestion(item, `plan.questions[${index}]`));
  const features = milestones.flatMap((milestone) => milestone.features);

  assertUnique(milestones.map((item) => item.id), 'plan.milestones');
  assertUnique(features.map((item) => item.id), 'plan.features');
  assertUnique(risks.map((item) => item.id), 'plan.risks');
  assertUnique(questions.map((item) => item.id), 'plan.questions');

  const milestoneIds = new Set(milestones.map((item) => item.id));
  const featureIds = new Set(features.map((item) => item.id));
  for (const milestone of milestones) {
    assertReferencesExist(milestone.id, milestone.dependsOn, milestoneIds, `milestone ${milestone.id}.dependsOn`);
  }
  for (const feature of features) {
    assertReferencesExist(feature.id, feature.dependsOn, featureIds, `feature ${feature.id}.dependsOn`);
  }

  assertAcyclic(
    milestones.map((item) => item.id),
    new Map(milestones.map((item) => [item.id, item.dependsOn])),
    'plan.milestones',
  );
  assertAcyclic(
    features.map((item) => item.id),
    new Map(features.map((item) => [item.id, item.dependsOn])),
    'plan.features',
  );

  return {
    schemaVersion: 1,
    missionId,
    title: stringAt(input.title, 'plan.title'),
    goal: stringAt(input.goal, 'plan.goal'),
    successCriteria: stringArrayAt(input.successCriteria, 'plan.successCriteria', { nonEmpty: true }),
    scope: (() => {
      const scope = objectAt(input.scope, 'plan.scope');
      return {
        included: stringArrayAt(scope.included, 'plan.scope.included', { nonEmpty: true }),
        excluded: stringArrayAt(scope.excluded, 'plan.scope.excluded'),
      };
    })(),
    assumptions: stringArrayAt(input.assumptions, 'plan.assumptions'),
    milestones,
    risks,
    questions,
  };
}

export function hasOpenBlockingQuestions(content: MissionPlanContent): boolean {
  return content.questions.some((question) => question.blocking && question.status === 'OPEN');
}

function canonicalValue(value: unknown): JsonValue {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) fail('canonicalJson', 'does not support non-finite numbers.');
    return value;
  }
  if (Array.isArray(value)) return value.map(canonicalValue);
  if (typeof value === 'object') {
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      fail('canonicalJson', 'supports only plain JSON objects.');
    }
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, child]) => child !== undefined)
        .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
        .map(([key, child]) => [key, canonicalValue(child)]),
    );
  }
  fail('canonicalJson', `does not support ${typeof value}.`);
}

export function canonicalJson(value: unknown): string {
  return JSON.stringify(canonicalValue(value));
}

export function hashPlanContent(content: MissionPlanContent): string {
  return `sha256:${createHash('sha256').update(canonicalJson(content), 'utf8').digest('hex')}`;
}
