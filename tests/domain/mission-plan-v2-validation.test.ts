import assert from 'node:assert/strict';
import test from 'node:test';

import { MnfsError } from '../../src/domain/errors.js';
import { validateMissionPlan } from '../../src/domain/mission-plan.js';
import { validPlanV2 } from '../fixtures/mission-plans.js';

function expectInvalid(plan: unknown, message: RegExp): void {
  assert.throws(
    () => validateMissionPlan(plan, 'MIS-001'),
    (error: unknown) =>
      error instanceof MnfsError && error.code === 'PLAN_INVALID' && message.test(error.message),
  );
}

test('rejects duplicate local Feature IDs inside one Milestone', () => {
  const plan = validPlanV2();
  const first = plan.milestones[0]?.features[0];
  assert.ok(first);
  expectInvalid(
    {
      ...plan,
      milestones: [
        {
          ...plan.milestones[0],
          features: [first, { ...first }],
        },
        plan.milestones[1],
      ],
    },
    /duplicate id F01/,
  );
});

test('rejects malformed requirement IDs before allocation', () => {
  const plan = validPlanV2();
  expectInvalid(
    {
      ...plan,
      requirementRefs: ['not-a-requirement'],
    },
    /invalid reference format: not-a-requirement/,
  );
});

test('rejects malformed Security Policy hashes', () => {
  const plan = validPlanV2();
  expectInvalid(
    {
      ...plan,
      environmentBinding: {
        ...plan.environmentBinding,
        securityPolicyHash: 'sha256:not-a-digest',
      },
    },
    /securityPolicyHash.*invalid identifier format/,
  );
});

test('requires both Environment and Security Policy references', () => {
  const plan = validPlanV2();
  expectInvalid(
    {
      ...plan,
      environmentBinding: {
        securityPolicyRef: 'SEC-E1',
      },
    },
    /environmentRef.*non-empty string/,
  );
});
