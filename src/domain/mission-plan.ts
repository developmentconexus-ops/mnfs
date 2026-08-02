import { createHash } from 'node:crypto';

import { MnfsError } from './errors.js';

export interface MissionPlanContentV1 {
  readonly schemaVersion: 1;
  readonly missionId: string;
  readonly title: string;
  readonly goal: string;
  readonly successCriteria: readonly string[];
  readonly scope: PlanScope;
  readonly assumptions: readonly string[];
  readonly milestones: readonly MilestonePlanV1[];
  readonly risks: readonly RiskPlan[];
  readonly questions: readonly PlanQuestion[];
}

export interface MilestonePlanV1 {
  readonly id: string;
  readonly title: string;
  readonly outcome: string;
  readonly dependsOn: readonly string[];
  readonly features: readonly FeaturePlanV1[];
}

export interface FeaturePlanV1 {
  readonly id: string;
  readonly title: string;
  readonly outcome: string;
  readonly acceptanceCriteria: readonly string[];
  readonly dependsOn: readonly string[];
}

export type VerificationMethod =
  | 'TEST'
  | 'INSPECTION'
  | 'ANALYSIS'
  | 'DEMONSTRATION'
  | 'OPERATOR_CONFIRMATION';
export type ProofType = 'RECEIPT' | 'ARTIFACT' | 'VERDICT' | 'RECORD';

export interface VerificationPlanV2 {
  readonly method: VerificationMethod;
  readonly owner: string;
  readonly proofType: ProofType;
  readonly proofOwner: string;
}

export interface AcceptanceCriterionV2 {
  readonly id: string;
  readonly qualifiedId: string;
  readonly statement: string;
  readonly requirementRefs: readonly string[];
  readonly verificationPlan: VerificationPlanV2;
}

export interface CapabilitySpecReferenceV2 {
  readonly id: string;
  readonly specPath: string;
  readonly version?: string;
}

export interface EnvironmentBindingV2 {
  readonly environmentRef: string;
  readonly securityPolicyRef: string;
  readonly securityPolicyHash?: string;
}

export interface DocumentationImpactV2 {
  readonly status: 'NONE' | 'UPDATED' | 'FOLLOW_UP_REQUIRED';
  readonly refs: readonly string[];
  readonly rationale: string;
  readonly followUp?: string;
}

export interface RequirementsImpactV2 {
  readonly status: 'NONE' | 'UPDATED' | 'NEW_REQUIREMENT' | 'REPLAN_REQUIRED';
  readonly refs: readonly string[];
  readonly rationale: string;
}

export interface MissionPlanContentV2 {
  readonly schemaVersion: 2;
  readonly missionId: string;
  readonly title: string;
  readonly goal: string;
  readonly acceptanceCriteria: readonly AcceptanceCriterionV2[];
  readonly scope: PlanScope;
  readonly assumptions: readonly string[];
  readonly productMilestoneRefs: readonly string[];
  readonly capabilityRefs: readonly CapabilitySpecReferenceV2[];
  readonly requirementRefs: readonly string[];
  readonly environmentBinding?: EnvironmentBindingV2;
  readonly documentationImpact: DocumentationImpactV2;
  readonly requirementsImpact: RequirementsImpactV2;
  readonly milestones: readonly MilestonePlanV2[];
  readonly risks: readonly RiskPlan[];
  readonly questions: readonly PlanQuestion[];
}

export interface MilestonePlanV2 {
  readonly id: string;
  readonly qualifiedId: string;
  readonly title: string;
  readonly outcome: string;
  readonly acceptanceCriteria: readonly AcceptanceCriterionV2[];
  readonly requirementRefs: readonly string[];
  readonly environmentBinding?: EnvironmentBindingV2;
  readonly dependsOn: readonly string[];
  readonly features: readonly FeaturePlanV2[];
}

export interface FeaturePlanV2 {
  readonly id: string;
  readonly qualifiedId: string;
  readonly title: string;
  readonly outcome: string;
  readonly acceptanceCriteria: readonly AcceptanceCriterionV2[];
  readonly requirementRefs: readonly string[];
  readonly dependsOn: readonly string[];
}

export type MissionPlanContent = MissionPlanContentV1 | MissionPlanContentV2;
export type MilestonePlan = MilestonePlanV1 | MilestonePlanV2;
export type FeaturePlan = FeaturePlanV1 | FeaturePlanV2;

export interface PlanScope {
  readonly included: readonly string[];
  readonly excluded: readonly string[];
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
  criterion: /^AC-\d{2,}$/,
  risk: /^R\d{2,}$/,
  question: /^Q\d{2,}$/,
  capability: /^CAP-[A-Z0-9][A-Z0-9-]*$/,
  reference: /^[A-Za-z0-9][A-Za-z0-9._:/#-]*$/,
  requirement: /^[A-Z][A-Z0-9-]*-REQ-\d{3,}$/,
  hash: /^sha256:[a-f0-9]{64}$/,
  semver: /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/,
} as const;

const VERIFICATION_METHODS = new Set<VerificationMethod>([
  'TEST',
  'INSPECTION',
  'ANALYSIS',
  'DEMONSTRATION',
  'OPERATOR_CONFIRMATION',
]);
const PROOF_TYPES = new Set<ProofType>(['RECEIPT', 'ARTIFACT', 'VERDICT', 'RECORD']);

function fail(path: string, message: string): never {
  throw new MnfsError('PLAN_INVALID', `${path}: ${message}`);
}

function objectAt(value: unknown, path: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    fail(path, 'must be an object.');
  }
  return value as Record<string, unknown>;
}

function assertKnownKeys(
  input: Readonly<Record<string, unknown>>,
  allowed: readonly string[],
  path: string,
): void {
  const allowedKeys = new Set(allowed);
  for (const key of Object.keys(input)) {
    if (!allowedKeys.has(key)) fail(`${path}.${key}`, 'is not supported by this schema version.');
  }
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

function stringArrayAt(
  value: unknown,
  path: string,
  options: { readonly nonEmpty?: boolean; readonly pattern?: RegExp } = {},
): string[] {
  if (!Array.isArray(value)) fail(path, 'must be an array.');
  const result = value.map((item, index) => {
    const text = stringAt(item, `${path}[${index}]`);
    if (options.pattern !== undefined && !options.pattern.test(text)) {
      fail(`${path}[${index}]`, `has invalid reference format: ${text}.`);
    }
    return text;
  });
  if (options.nonEmpty && result.length === 0) fail(path, 'must contain at least one item.');
  if (new Set(result).size !== result.length) fail(path, 'must not contain duplicate values.');
  return result;
}

function idAt(value: unknown, path: string, pattern: RegExp): string {
  const id = stringAt(value, path);
  if (!pattern.test(id)) fail(path, `has invalid identifier format: ${id}.`);
  return id;
}

function optionalQualifiedId(
  input: Readonly<Record<string, unknown>>,
  path: string,
  expected: string,
): void {
  if (input.qualifiedId === undefined) return;
  const provided = stringAt(input.qualifiedId, `${path}.qualifiedId`);
  if (provided !== expected) fail(`${path}.qualifiedId`, `must equal derived identity ${expected}.`);
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

function assertAcyclic(
  nodes: readonly string[],
  edges: ReadonlyMap<string, readonly string[]>,
  path: string,
): void {
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

function assertCriterionRequirementOwnership(
  criteria: readonly AcceptanceCriterionV2[],
  ownerRequirementRefs: ReadonlySet<string>,
  path: string,
): void {
  for (const criterion of criteria) {
    for (const requirementRef of criterion.requirementRefs) {
      if (!ownerRequirementRefs.has(requirementRef)) {
        fail(
          `${path}.${criterion.id}.requirementRefs`,
          `references ${requirementRef} outside its owning element.`,
        );
      }
    }
  }
}

export function qualifyMilestoneId(missionId: string, milestoneId: string): string {
  return `${missionId}/${milestoneId}`;
}

export function qualifyFeatureId(
  missionId: string,
  milestoneId: string,
  featureId: string,
): string {
  return `${qualifyMilestoneId(missionId, milestoneId)}/${featureId}`;
}

export function qualifyMissionCriterionId(missionId: string, criterionId: string): string {
  return `${missionId}/${criterionId}`;
}

export function qualifyMilestoneCriterionId(
  missionId: string,
  milestoneId: string,
  criterionId: string,
): string {
  return `${qualifyMilestoneId(missionId, milestoneId)}/${criterionId}`;
}

export function qualifyFeatureCriterionId(
  missionId: string,
  milestoneId: string,
  featureId: string,
  criterionId: string,
): string {
  return `${qualifyFeatureId(missionId, milestoneId, featureId)}/${criterionId}`;
}

function parseScope(value: unknown, path: string): PlanScope {
  const input = objectAt(value, path);
  assertKnownKeys(input, ['included', 'excluded'], path);
  return {
    included: stringArrayAt(input.included, `${path}.included`, { nonEmpty: true }),
    excluded: stringArrayAt(input.excluded, `${path}.excluded`),
  };
}

function parseRisk(value: unknown, path: string): RiskPlan {
  const input = objectAt(value, path);
  assertKnownKeys(input, ['id', 'description', 'mitigation'], path);
  return {
    id: idAt(input.id, `${path}.id`, ID_PATTERNS.risk),
    description: stringAt(input.description, `${path}.description`),
    mitigation: stringAt(input.mitigation, `${path}.mitigation`),
  };
}

function parseQuestion(value: unknown, path: string): PlanQuestion {
  const input = objectAt(value, path);
  assertKnownKeys(input, ['id', 'question', 'blocking', 'status', 'answer'], path);
  const status = input.status;
  if (status !== 'OPEN' && status !== 'ANSWERED') {
    fail(`${path}.status`, 'must be OPEN or ANSWERED.');
  }

  const answer = input.answer === undefined ? undefined : stringAt(input.answer, `${path}.answer`);
  if (status === 'ANSWERED' && answer === undefined) {
    fail(`${path}.answer`, 'is required for an answered question.');
  }
  if (status === 'OPEN' && answer !== undefined) {
    fail(`${path}.answer`, 'must be omitted while the question is open.');
  }

  return {
    id: idAt(input.id, `${path}.id`, ID_PATTERNS.question),
    question: stringAt(input.question, `${path}.question`),
    blocking: booleanAt(input.blocking, `${path}.blocking`),
    status,
    ...(answer === undefined ? {} : { answer }),
  };
}

function parseFeatureV1(value: unknown, path: string): FeaturePlanV1 {
  const input = objectAt(value, path);
  assertKnownKeys(input, ['id', 'title', 'outcome', 'acceptanceCriteria', 'dependsOn'], path);
  return {
    id: idAt(input.id, `${path}.id`, ID_PATTERNS.feature),
    title: stringAt(input.title, `${path}.title`),
    outcome: stringAt(input.outcome, `${path}.outcome`),
    acceptanceCriteria: stringArrayAt(input.acceptanceCriteria, `${path}.acceptanceCriteria`, {
      nonEmpty: true,
    }),
    dependsOn: stringArrayAt(input.dependsOn, `${path}.dependsOn`),
  };
}

function parseMilestoneV1(value: unknown, path: string): MilestonePlanV1 {
  const input = objectAt(value, path);
  assertKnownKeys(input, ['id', 'title', 'outcome', 'dependsOn', 'features'], path);
  if (!Array.isArray(input.features) || input.features.length === 0) {
    fail(`${path}.features`, 'must contain at least one feature.');
  }
  return {
    id: idAt(input.id, `${path}.id`, ID_PATTERNS.milestone),
    title: stringAt(input.title, `${path}.title`),
    outcome: stringAt(input.outcome, `${path}.outcome`),
    dependsOn: stringArrayAt(input.dependsOn, `${path}.dependsOn`),
    features: input.features.map((feature, index) =>
      parseFeatureV1(feature, `${path}.features[${index}]`),
    ),
  };
}

function parseVerificationPlanV2(value: unknown, path: string): VerificationPlanV2 {
  const input = objectAt(value, path);
  assertKnownKeys(input, ['method', 'owner', 'proofType', 'proofOwner'], path);
  const method = stringAt(input.method, `${path}.method`) as VerificationMethod;
  if (!VERIFICATION_METHODS.has(method)) fail(`${path}.method`, `has unsupported method ${method}.`);
  const proofType = stringAt(input.proofType, `${path}.proofType`) as ProofType;
  if (!PROOF_TYPES.has(proofType)) {
    fail(`${path}.proofType`, `has unsupported proof type ${proofType}.`);
  }
  return {
    method,
    owner: idAt(input.owner, `${path}.owner`, ID_PATTERNS.reference),
    proofType,
    proofOwner: idAt(input.proofOwner, `${path}.proofOwner`, ID_PATTERNS.reference),
  };
}

function parseCriterionV2(
  value: unknown,
  path: string,
  qualifiedId: string,
): AcceptanceCriterionV2 {
  const input = objectAt(value, path);
  assertKnownKeys(
    input,
    ['id', 'qualifiedId', 'statement', 'requirementRefs', 'verificationPlan'],
    path,
  );
  const id = idAt(input.id, `${path}.id`, ID_PATTERNS.criterion);
  optionalQualifiedId(input, path, qualifiedId);
  return {
    id,
    qualifiedId,
    statement: stringAt(input.statement, `${path}.statement`),
    requirementRefs: stringArrayAt(input.requirementRefs, `${path}.requirementRefs`, {
      pattern: ID_PATTERNS.requirement,
    }),
    verificationPlan: parseVerificationPlanV2(input.verificationPlan, `${path}.verificationPlan`),
  };
}

function parseCapabilityReferenceV2(
  value: unknown,
  path: string,
): CapabilitySpecReferenceV2 {
  const input = objectAt(value, path);
  assertKnownKeys(input, ['id', 'specPath', 'version'], path);
  const specPath = stringAt(input.specPath, `${path}.specPath`);
  if (
    specPath.startsWith('/')
    || specPath.includes('\\')
    || specPath.split('/').includes('..')
    || !specPath.endsWith('.md')
  ) {
    fail(`${path}.specPath`, 'must be a repository-relative Markdown path without parent traversal.');
  }
  const version = input.version === undefined
    ? undefined
    : idAt(input.version, `${path}.version`, ID_PATTERNS.semver);
  return {
    id: idAt(input.id, `${path}.id`, ID_PATTERNS.capability),
    specPath,
    ...(version === undefined ? {} : { version }),
  };
}

function parseEnvironmentBindingV2(value: unknown, path: string): EnvironmentBindingV2 {
  const input = objectAt(value, path);
  assertKnownKeys(input, ['environmentRef', 'securityPolicyRef', 'securityPolicyHash'], path);
  const securityPolicyHash = input.securityPolicyHash === undefined
    ? undefined
    : idAt(input.securityPolicyHash, `${path}.securityPolicyHash`, ID_PATTERNS.hash);
  return {
    environmentRef: idAt(input.environmentRef, `${path}.environmentRef`, ID_PATTERNS.reference),
    securityPolicyRef: idAt(
      input.securityPolicyRef,
      `${path}.securityPolicyRef`,
      ID_PATTERNS.reference,
    ),
    ...(securityPolicyHash === undefined ? {} : { securityPolicyHash }),
  };
}

function parseDocumentationImpactV2(value: unknown, path: string): DocumentationImpactV2 {
  const input = objectAt(value, path);
  assertKnownKeys(input, ['status', 'refs', 'rationale', 'followUp'], path);
  const status = input.status;
  if (status !== 'NONE' && status !== 'UPDATED' && status !== 'FOLLOW_UP_REQUIRED') {
    fail(`${path}.status`, 'must be NONE, UPDATED or FOLLOW_UP_REQUIRED.');
  }
  const refs = stringArrayAt(input.refs, `${path}.refs`, { pattern: ID_PATTERNS.reference });
  const rationale = stringAt(input.rationale, `${path}.rationale`);
  const followUp = input.followUp === undefined
    ? undefined
    : stringAt(input.followUp, `${path}.followUp`);
  if (status === 'NONE' && refs.length !== 0) {
    fail(`${path}.refs`, 'must be empty when status is NONE.');
  }
  if (status === 'NONE' && followUp !== undefined) {
    fail(`${path}.followUp`, 'must be omitted when status is NONE.');
  }
  if (status !== 'NONE' && refs.length === 0) {
    fail(`${path}.refs`, 'must contain at least one reference when documentation is affected.');
  }
  if (status === 'FOLLOW_UP_REQUIRED' && followUp === undefined) {
    fail(`${path}.followUp`, 'is required when status is FOLLOW_UP_REQUIRED.');
  }
  return { status, refs, rationale, ...(followUp === undefined ? {} : { followUp }) };
}

function parseRequirementsImpactV2(value: unknown, path: string): RequirementsImpactV2 {
  const input = objectAt(value, path);
  assertKnownKeys(input, ['status', 'refs', 'rationale'], path);
  const status = input.status;
  if (
    status !== 'NONE'
    && status !== 'UPDATED'
    && status !== 'NEW_REQUIREMENT'
    && status !== 'REPLAN_REQUIRED'
  ) {
    fail(`${path}.status`, 'must be NONE, UPDATED, NEW_REQUIREMENT or REPLAN_REQUIRED.');
  }
  const refs = stringArrayAt(input.refs, `${path}.refs`, { pattern: ID_PATTERNS.requirement });
  const rationale = stringAt(input.rationale, `${path}.rationale`);
  if (status === 'NONE' && refs.length !== 0) {
    fail(`${path}.refs`, 'must be empty when status is NONE.');
  }
  if (status !== 'NONE' && refs.length === 0) {
    fail(`${path}.refs`, 'must contain at least one reference when requirements are affected.');
  }
  return { status, refs, rationale };
}

function parseCriteriaV2(
  value: unknown,
  path: string,
  qualify: (criterionId: string) => string,
): AcceptanceCriterionV2[] {
  if (!Array.isArray(value) || value.length === 0) {
    fail(path, 'must contain at least one acceptance criterion.');
  }
  const criteria = value.map((criterion, index) => {
    const raw = objectAt(criterion, `${path}[${index}]`);
    const criterionId = idAt(raw.id, `${path}[${index}].id`, ID_PATTERNS.criterion);
    return parseCriterionV2(criterion, `${path}[${index}]`, qualify(criterionId));
  });
  assertUnique(criteria.map((criterion) => criterion.id), path);
  return criteria;
}

function parseFeatureV2(
  value: unknown,
  path: string,
  missionId: string,
  milestoneId: string,
): FeaturePlanV2 {
  const input = objectAt(value, path);
  assertKnownKeys(
    input,
    ['id', 'qualifiedId', 'title', 'outcome', 'acceptanceCriteria', 'requirementRefs', 'dependsOn'],
    path,
  );
  const id = idAt(input.id, `${path}.id`, ID_PATTERNS.feature);
  const qualifiedId = qualifyFeatureId(missionId, milestoneId, id);
  optionalQualifiedId(input, path, qualifiedId);
  const requirementRefs = stringArrayAt(input.requirementRefs, `${path}.requirementRefs`, {
    pattern: ID_PATTERNS.requirement,
  });
  const acceptanceCriteria = parseCriteriaV2(
    input.acceptanceCriteria,
    `${path}.acceptanceCriteria`,
    (criterionId) => qualifyFeatureCriterionId(missionId, milestoneId, id, criterionId),
  );
  assertCriterionRequirementOwnership(
    acceptanceCriteria,
    new Set(requirementRefs),
    `${path}.acceptanceCriteria`,
  );
  return {
    id,
    qualifiedId,
    title: stringAt(input.title, `${path}.title`),
    outcome: stringAt(input.outcome, `${path}.outcome`),
    acceptanceCriteria,
    requirementRefs,
    dependsOn: stringArrayAt(input.dependsOn, `${path}.dependsOn`, {
      pattern: ID_PATTERNS.reference,
    }),
  };
}

function parseMilestoneV2(value: unknown, path: string, missionId: string): MilestonePlanV2 {
  const input = objectAt(value, path);
  assertKnownKeys(
    input,
    [
      'id',
      'qualifiedId',
      'title',
      'outcome',
      'acceptanceCriteria',
      'requirementRefs',
      'environmentBinding',
      'dependsOn',
      'features',
    ],
    path,
  );
  if (!Array.isArray(input.features) || input.features.length === 0) {
    fail(`${path}.features`, 'must contain at least one feature.');
  }
  const id = idAt(input.id, `${path}.id`, ID_PATTERNS.milestone);
  const qualifiedId = qualifyMilestoneId(missionId, id);
  optionalQualifiedId(input, path, qualifiedId);
  const requirementRefs = stringArrayAt(input.requirementRefs, `${path}.requirementRefs`, {
    pattern: ID_PATTERNS.requirement,
  });
  const acceptanceCriteria = parseCriteriaV2(
    input.acceptanceCriteria,
    `${path}.acceptanceCriteria`,
    (criterionId) => qualifyMilestoneCriterionId(missionId, id, criterionId),
  );
  assertCriterionRequirementOwnership(
    acceptanceCriteria,
    new Set(requirementRefs),
    `${path}.acceptanceCriteria`,
  );
  const environmentBinding = input.environmentBinding === undefined
    ? undefined
    : parseEnvironmentBindingV2(input.environmentBinding, `${path}.environmentBinding`);
  const features = input.features.map((feature, index) =>
    parseFeatureV2(feature, `${path}.features[${index}]`, missionId, id),
  );
  assertUnique(features.map((feature) => feature.id), `${path}.features`);
  return {
    id,
    qualifiedId,
    title: stringAt(input.title, `${path}.title`),
    outcome: stringAt(input.outcome, `${path}.outcome`),
    acceptanceCriteria,
    requirementRefs,
    ...(environmentBinding === undefined ? {} : { environmentBinding }),
    dependsOn: stringArrayAt(input.dependsOn, `${path}.dependsOn`, {
      pattern: ID_PATTERNS.reference,
    }),
    features,
  };
}

function parseCommonCollections(input: Readonly<Record<string, unknown>>): {
  readonly risks: RiskPlan[];
  readonly questions: PlanQuestion[];
} {
  if (!Array.isArray(input.risks)) fail('plan.risks', 'must be an array.');
  if (!Array.isArray(input.questions)) fail('plan.questions', 'must be an array.');
  const risks = input.risks.map((item, index) => parseRisk(item, `plan.risks[${index}]`));
  const questions = input.questions.map((item, index) =>
    parseQuestion(item, `plan.questions[${index}]`),
  );
  assertUnique(risks.map((item) => item.id), 'plan.risks');
  assertUnique(questions.map((item) => item.id), 'plan.questions');
  return { risks, questions };
}

function validateMissionPlanV1(
  input: Readonly<Record<string, unknown>>,
  missionId: string,
): MissionPlanContentV1 {
  assertKnownKeys(
    input,
    [
      'schemaVersion',
      'missionId',
      'title',
      'goal',
      'successCriteria',
      'scope',
      'assumptions',
      'milestones',
      'risks',
      'questions',
    ],
    'plan',
  );
  if (!Array.isArray(input.milestones) || input.milestones.length === 0) {
    fail('plan.milestones', 'must contain at least one milestone.');
  }
  const milestones = input.milestones.map((item, index) =>
    parseMilestoneV1(item, `plan.milestones[${index}]`),
  );
  const features = milestones.flatMap((milestone) => milestone.features);
  const { risks, questions } = parseCommonCollections(input);
  assertUnique(milestones.map((item) => item.id), 'plan.milestones');
  assertUnique(features.map((item) => item.id), 'plan.features');
  const milestoneIds = new Set(milestones.map((item) => item.id));
  const featureIds = new Set(features.map((item) => item.id));
  for (const milestone of milestones) {
    assertReferencesExist(
      milestone.id,
      milestone.dependsOn,
      milestoneIds,
      `milestone ${milestone.id}.dependsOn`,
    );
  }
  for (const feature of features) {
    assertReferencesExist(
      feature.id,
      feature.dependsOn,
      featureIds,
      `feature ${feature.id}.dependsOn`,
    );
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
    scope: parseScope(input.scope, 'plan.scope'),
    assumptions: stringArrayAt(input.assumptions, 'plan.assumptions'),
    milestones,
    risks,
    questions,
  };
}

function validateMissionPlanV2(
  input: Readonly<Record<string, unknown>>,
  missionId: string,
): MissionPlanContentV2 {
  assertKnownKeys(
    input,
    [
      'schemaVersion',
      'missionId',
      'title',
      'goal',
      'acceptanceCriteria',
      'scope',
      'assumptions',
      'productMilestoneRefs',
      'capabilityRefs',
      'requirementRefs',
      'environmentBinding',
      'documentationImpact',
      'requirementsImpact',
      'milestones',
      'risks',
      'questions',
    ],
    'plan',
  );
  if (!Array.isArray(input.milestones) || input.milestones.length === 0) {
    fail('plan.milestones', 'must contain at least one milestone.');
  }
  if (!Array.isArray(input.capabilityRefs)) fail('plan.capabilityRefs', 'must be an array.');
  const requirementRefs = stringArrayAt(input.requirementRefs, 'plan.requirementRefs', {
    pattern: ID_PATTERNS.requirement,
  });
  const acceptanceCriteria = parseCriteriaV2(
    input.acceptanceCriteria,
    'plan.acceptanceCriteria',
    (criterionId) => qualifyMissionCriterionId(missionId, criterionId),
  );
  assertCriterionRequirementOwnership(
    acceptanceCriteria,
    new Set(requirementRefs),
    'plan.acceptanceCriteria',
  );
  const capabilityRefs = input.capabilityRefs.map((item, index) =>
    parseCapabilityReferenceV2(item, `plan.capabilityRefs[${index}]`),
  );
  assertUnique(capabilityRefs.map((item) => item.id), 'plan.capabilityRefs');
  const environmentBinding = input.environmentBinding === undefined
    ? undefined
    : parseEnvironmentBindingV2(input.environmentBinding, 'plan.environmentBinding');
  const milestones = input.milestones.map((item, index) =>
    parseMilestoneV2(item, `plan.milestones[${index}]`, missionId),
  );
  const features = milestones.flatMap((milestone) => milestone.features);
  const missionRequirementSet = new Set(requirementRefs);
  for (const milestone of milestones) {
    for (const requirementRef of milestone.requirementRefs) {
      if (!missionRequirementSet.has(requirementRef)) {
        fail(
          `${milestone.qualifiedId}.requirementRefs`,
          `references ${requirementRef} outside the Mission requirement set.`,
        );
      }
    }
    for (const feature of milestone.features) {
      for (const requirementRef of feature.requirementRefs) {
        if (!missionRequirementSet.has(requirementRef)) {
          fail(
            `${feature.qualifiedId}.requirementRefs`,
            `references ${requirementRef} outside the Mission requirement set.`,
          );
        }
      }
    }
  }
  const { risks, questions } = parseCommonCollections(input);
  assertUnique(milestones.map((item) => item.id), 'plan.milestones');
  assertUnique(milestones.map((item) => item.qualifiedId), 'plan.milestones');
  assertUnique(features.map((item) => item.qualifiedId), 'plan.features');
  const milestoneIds = new Set(milestones.map((item) => item.qualifiedId));
  const featureIds = new Set(features.map((item) => item.qualifiedId));
  for (const milestone of milestones) {
    assertReferencesExist(
      milestone.qualifiedId,
      milestone.dependsOn,
      milestoneIds,
      `${milestone.qualifiedId}.dependsOn`,
    );
  }
  for (const feature of features) {
    assertReferencesExist(
      feature.qualifiedId,
      feature.dependsOn,
      featureIds,
      `${feature.qualifiedId}.dependsOn`,
    );
  }
  assertAcyclic(
    milestones.map((item) => item.qualifiedId),
    new Map(milestones.map((item) => [item.qualifiedId, item.dependsOn])),
    'plan.milestones',
  );
  assertAcyclic(
    features.map((item) => item.qualifiedId),
    new Map(features.map((item) => [item.qualifiedId, item.dependsOn])),
    'plan.features',
  );
  return {
    schemaVersion: 2,
    missionId,
    title: stringAt(input.title, 'plan.title'),
    goal: stringAt(input.goal, 'plan.goal'),
    acceptanceCriteria,
    scope: parseScope(input.scope, 'plan.scope'),
    assumptions: stringArrayAt(input.assumptions, 'plan.assumptions'),
    productMilestoneRefs: stringArrayAt(
      input.productMilestoneRefs,
      'plan.productMilestoneRefs',
      { pattern: ID_PATTERNS.reference },
    ),
    capabilityRefs,
    requirementRefs,
    ...(environmentBinding === undefined ? {} : { environmentBinding }),
    documentationImpact: parseDocumentationImpactV2(
      input.documentationImpact,
      'plan.documentationImpact',
    ),
    requirementsImpact: parseRequirementsImpactV2(
      input.requirementsImpact,
      'plan.requirementsImpact',
    ),
    milestones,
    risks,
    questions,
  };
}

export function validateMissionPlan(value: unknown, expectedMissionId: string): MissionPlanContent {
  const input = objectAt(value, 'plan');
  const missionId = idAt(input.missionId, 'plan.missionId', ID_PATTERNS.mission);
  if (missionId !== expectedMissionId) {
    fail('plan.missionId', `must equal target mission ${expectedMissionId}.`);
  }
  if (input.schemaVersion === 1) return validateMissionPlanV1(input, missionId);
  if (input.schemaVersion === 2) return validateMissionPlanV2(input, missionId);
  fail('plan.schemaVersion', 'must equal 1 or 2.');
}

export function isMissionPlanV2(content: MissionPlanContent): content is MissionPlanContentV2 {
  return content.schemaVersion === 2;
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
