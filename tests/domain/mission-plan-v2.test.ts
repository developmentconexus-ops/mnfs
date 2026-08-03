import assert from 'node:assert/strict';
import test from 'node:test';

import { MnfsError } from '../../src/domain/errors.js';
import {
  hashPlanContent,
  validateMissionPlan,
  type MissionPlanContentV1,
  type MissionPlanContentV2,
} from '../../src/domain/mission-plan.js';

function verification() {
  return {
    method: 'TEST',
    owner: 'MNFS-RUNNER',
    proofType: 'RECEIPT',
    proofOwner: 'MNFS-RUNNER',
  } as const;
}

function validV2(): unknown {
  return {
    schemaVersion: 2,
    missionId: 'MIS-002',
    title: 'Secure execution contract',
    goal: 'Prove one governed Worker',
    acceptanceCriteria: [
      {
        id: 'AC-01',
        statement: 'The Mission is bound to the capability requirements',
        requirementRefs: ['CAP-EXEC-REQ-001'],
        verificationPlan: verification(),
      },
    ],
    scope: { included: ['Schema v2'], excluded: ['Worker implementation'] },
    assumptions: [],
    productMilestoneRefs: ['M2'],
    capabilityRefs: [
      {
        id: 'CAP-EXECUTION',
        specPath: 'docs/capabilities/CAP-EXECUTION/SPEC.md',
        version: '0.1.0',
      },
    ],
    requirementRefs: ['CAP-EXEC-REQ-001'],
    environmentBinding: {
      environmentRef: 'ENV-E1',
      securityPolicyRef: 'SEC-E1',
      securityPolicyHash: `sha256:${'a'.repeat(64)}`,
    },
    documentationImpact: {
      status: 'UPDATED',
      refs: ['DOC-MNFS-PLAN-CONTRACT'],
      rationale: 'Schema reference and planning skill change',
    },
    requirementsImpact: {
      status: 'UPDATED',
      refs: ['CAP-EXEC-REQ-001'],
      rationale: 'The contract allocates the requirement explicitly',
    },
    milestones: [
      {
        id: 'M01',
        title: 'Durable core',
        outcome: 'State is durable',
        acceptanceCriteria: [
          {
            id: 'AC-01',
            statement: 'One Attempt is current',
            requirementRefs: ['CAP-EXEC-REQ-001'],
            verificationPlan: verification(),
          },
        ],
        requirementRefs: ['CAP-EXEC-REQ-001'],
        dependsOn: [],
        features: [
          {
            id: 'F01',
            title: 'Attempt model',
            outcome: 'Attempts are explicit',
            acceptanceCriteria: [
              {
                id: 'AC-01',
                statement: 'Duplicate current Attempts are rejected',
                requirementRefs: ['CAP-EXEC-REQ-001'],
                verificationPlan: verification(),
              },
            ],
            requirementRefs: ['CAP-EXEC-REQ-001'],
            dependsOn: [],
          },
        ],
      },
      {
        id: 'M02',
        title: 'Recovery',
        outcome: 'Fresh Lead recovery works',
        acceptanceCriteria: [
          {
            id: 'AC-01',
            statement: 'Recovery is independent from transcripts',
            requirementRefs: [],
            verificationPlan: verification(),
          },
        ],
        requirementRefs: [],
        dependsOn: ['MIS-002/M01'],
        features: [
          {
            id: 'F01',
            title: 'Fresh process',
            outcome: 'State recovers',
            acceptanceCriteria: [
              {
                id: 'AC-01',
                statement: 'A fresh process reads state',
                requirementRefs: [],
                verificationPlan: verification(),
              },
            ],
            requirementRefs: [],
            dependsOn: ['MIS-002/M01/F01'],
          },
        ],
      },
    ],
    risks: [],
    questions: [],
  };
}

function validV1(): MissionPlanContentV1 {
  return {
    schemaVersion: 1,
    missionId: 'MIS-002',
    title: 'Historical plan',
    goal: 'Preserve M1 history',
    successCriteria: ['The exact historical content remains readable'],
    scope: { included: ['Read compatibility'], excluded: [] },
    assumptions: [],
    milestones: [
      {
        id: 'M01',
        title: 'History',
        outcome: 'History is readable',
        dependsOn: [],
        features: [
          {
            id: 'F01',
            title: 'Reader',
            outcome: 'v1 is parsed',
            acceptanceCriteria: ['v1 remains readable'],
            dependsOn: [],
          },
        ],
      },
    ],
    risks: [],
    questions: [],
  };
}

function expectInvalid(plan: unknown, message: RegExp): void {
  assert.throws(
    () => validateMissionPlan(plan, 'MIS-002'),
    (error: unknown) =>
      error instanceof MnfsError && error.code === 'PLAN_INVALID' && message.test(error.message),
  );
}

test('normalizes schema v2 and derives every qualified identity', () => {
  const result = validateMissionPlan(validV2(), 'MIS-002') as MissionPlanContentV2;
  assert.equal(result.schemaVersion, 2);
  assert.equal(result.acceptanceCriteria[0]?.qualifiedId, 'MIS-002/AC-01');
  assert.equal(result.milestones[0]?.qualifiedId, 'MIS-002/M01');
  assert.equal(result.milestones[0]?.acceptanceCriteria[0]?.qualifiedId, 'MIS-002/M01/AC-01');
  assert.equal(result.milestones[0]?.features[0]?.qualifiedId, 'MIS-002/M01/F01');
  assert.equal(
    result.milestones[0]?.features[0]?.acceptanceCriteria[0]?.qualifiedId,
    'MIS-002/M01/F01/AC-01',
  );
  assert.equal(result.milestones[1]?.features[0]?.qualifiedId, 'MIS-002/M02/F01');
});

test('allows repeated local feature IDs because qualified identities differ', () => {
  const result = validateMissionPlan(validV2(), 'MIS-002') as MissionPlanContentV2;
  assert.equal(result.milestones[0]?.features[0]?.id, 'F01');
  assert.equal(result.milestones[1]?.features[0]?.id, 'F01');
});

test('rejects an input qualified identity that disagrees with the derived identity', () => {
  const plan = validV2() as any;
  plan.milestones[0].features[0].qualifiedId = 'MIS-002/M02/F99';
  expectInvalid(plan, /must equal derived identity MIS-002\/M01\/F01/);
});

test('rejects ambiguous local dependency references in schema v2', () => {
  const plan = validV2() as any;
  plan.milestones[1].features[0].dependsOn = ['F01'];
  expectInvalid(plan, /unknown id F01/);
});

test('rejects cross-level dependency references', () => {
  const plan = validV2() as any;
  plan.milestones[1].features[0].dependsOn = ['MIS-002/M01'];
  expectInvalid(plan, /unknown id MIS-002\/M01/);
});

test('rejects criterion requirement references not owned by the same element', () => {
  const plan = validV2() as any;
  plan.milestones[0].features[0].requirementRefs = [];
  expectInvalid(plan, /outside its owning element/);
});

test('rejects element requirement references outside the Mission requirement set', () => {
  const plan = validV2() as any;
  plan.milestones[0].requirementRefs.push('CAP-EXEC-REQ-999');
  plan.milestones[0].acceptanceCriteria[0].requirementRefs.push('CAP-EXEC-REQ-999');
  expectInvalid(plan, /outside the Mission requirement set/);
});

test('rejects unknown fields instead of silently dropping them', () => {
  expectInvalid({ ...(validV2() as object), secretToken: 'do-not-store' }, /secretToken.*not supported/);
});

test('environment binding accepts only references and an optional content hash', () => {
  const plan = validV2() as any;
  plan.environmentBinding.apiKey = 'secret';
  expectInvalid(plan, /apiKey.*not supported/);
});

test('impact state and references remain internally consistent', () => {
  const plan = validV2() as any;
  plan.documentationImpact = { status: 'NONE', refs: ['DOC-ONE'], rationale: 'No impact' };
  expectInvalid(plan, /must be empty when status is NONE/);
});

test('requires explicit documentation follow-up details', () => {
  const plan = validV2() as any;
  plan.documentationImpact = {
    status: 'FOLLOW_UP_REQUIRED',
    refs: ['DOC-MNFS-PLAN-CONTRACT'],
    rationale: 'A later guide must be updated',
  };
  expectInvalid(plan, /followUp.*required/);
});

test('schema version participates in deterministic hashing while v1 remains readable', () => {
  const v1 = validateMissionPlan(validV1(), 'MIS-002');
  const v2 = validateMissionPlan(validV2(), 'MIS-002');
  assert.equal(v1.schemaVersion, 1);
  assert.notEqual(hashPlanContent(v1), hashPlanContent(v2));
  assert.equal(hashPlanContent(v2), hashPlanContent(validateMissionPlan(validV2(), 'MIS-002')));
});
