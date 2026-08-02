import assert from 'node:assert/strict';
import test from 'node:test';

import { MnfsError } from '../../src/domain/errors.js';
import {
  canonicalJson,
  hashPlanContent,
  hasOpenBlockingQuestions,
  validateMissionPlan,
  type MissionPlanContentV1,
} from '../../src/domain/mission-plan.js';

function validPlan(): MissionPlanContentV1 {
  return {
    schemaVersion: 1,
    missionId: 'MIS-001',
    title: 'Visual planning',
    goal: 'Build a reliable planning loop',
    successCriteria: ['The operator approves an exact plan hash'],
    scope: {
      included: ['Structured planning'],
      excluded: ['Worker execution'],
    },
    assumptions: ['Lavish runs on loopback'],
    milestones: [
      {
        id: 'M01',
        title: 'Planning',
        outcome: 'An approved plan',
        dependsOn: [],
        features: [
          {
            id: 'F01',
            title: 'Revision model',
            outcome: 'Plans are content addressed',
            acceptanceCriteria: ['A stale update is rejected'],
            dependsOn: [],
          },
          {
            id: 'F02',
            title: 'Visual review',
            outcome: 'Feedback updates structured source',
            acceptanceCriteria: ['The browser shows the exact hash'],
            dependsOn: ['F01'],
          },
        ],
      },
    ],
    risks: [
      {
        id: 'R01',
        description: 'HTML becomes source of truth',
        mitigation: 'Render from JSON only',
      },
    ],
    questions: [{ id: 'Q01', question: 'Approve M1 scope?', blocking: true, status: 'OPEN' }],
  };
}

function expectInvalid(plan: unknown, message: RegExp): void {
  assert.throws(
    () => validateMissionPlan(plan, 'MIS-001'),
    (error: unknown) =>
      error instanceof MnfsError && error.code === 'PLAN_INVALID' && message.test(error.message),
  );
}

test('validates and normalizes a complete mission plan', () => {
  const input = validPlan();
  const result = validateMissionPlan({ ...input, title: '  Visual planning  ' }, 'MIS-001');

  assert.equal(result.title, 'Visual planning');
  assert.equal(result.milestones[0]?.features[1]?.dependsOn[0], 'F01');
  assert.equal(hasOpenBlockingQuestions(result), true);
});

test('hash is stable across object key order but preserves array order', () => {
  const plan = validPlan();
  const reordered = JSON.parse(canonicalJson(plan)) as MissionPlanContentV1;
  const extended = { ...plan, successCriteria: [...plan.successCriteria, 'A second criterion'] };
  const reversed = { ...extended, successCriteria: [...extended.successCriteria].reverse() };

  assert.equal(hashPlanContent(plan), hashPlanContent(reordered));
  assert.notEqual(hashPlanContent(extended), hashPlanContent(reversed));
});

test('rejects duplicate feature ids', () => {
  const plan = validPlan();
  const first = plan.milestones[0]?.features[0];
  assert.ok(first);
  expectInvalid(
    { ...plan, milestones: [{ ...plan.milestones[0], features: [first, { ...first }] }] },
    /duplicate id F01/,
  );
});

test('rejects unknown dependencies', () => {
  const plan = validPlan();
  const feature = plan.milestones[0]?.features[0];
  assert.ok(feature);
  expectInvalid(
    {
      ...plan,
      milestones: [
        { ...plan.milestones[0], features: [{ ...feature, dependsOn: ['F99'] }] },
      ],
    },
    /unknown id F99/,
  );
});

test('rejects dependency cycles', () => {
  const plan = validPlan();
  const [first, second] = plan.milestones[0]?.features ?? [];
  assert.ok(first && second);
  expectInvalid(
    {
      ...plan,
      milestones: [
        { ...plan.milestones[0], features: [{ ...first, dependsOn: ['F02'] }, second] },
      ],
    },
    /dependency cycle/,
  );
});

test('requires an answer for answered questions', () => {
  const plan = validPlan();
  expectInvalid(
    { ...plan, questions: [{ ...plan.questions[0], status: 'ANSWERED' }] },
    /answer.*required/,
  );
});
