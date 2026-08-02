import type {
  MissionPlanContentV1,
  MissionPlanContentV2,
  VerificationPlanV2,
} from '../../src/domain/mission-plan.js';

export function verificationPlan(
  owner = 'MNFS-RUNNER',
  proofOwner = 'MNFS-RUNNER',
): VerificationPlanV2 {
  return {
    method: 'TEST',
    owner,
    proofType: 'RECEIPT',
    proofOwner,
  };
}

export function validPlanV1(
  missionId = 'MIS-001',
  title = 'Historical visual plan',
): MissionPlanContentV1 {
  return {
    schemaVersion: 1,
    missionId,
    title,
    goal: 'Preserve the accepted M1 planning contract',
    successCriteria: ['The exact approved v1 contract remains readable and materializable'],
    scope: {
      included: ['Historical compatibility'],
      excluded: ['Worker implementation'],
    },
    assumptions: ['SQLite remains operational authority'],
    milestones: [
      {
        id: 'M01',
        title: 'Historical planning',
        outcome: 'The v1 plan remains usable',
        dependsOn: [],
        features: [
          {
            id: 'F01',
            title: 'Historical reader',
            outcome: 'A fresh process reads the plan',
            acceptanceCriteria: ['The original content hash is reproduced'],
            dependsOn: [],
          },
        ],
      },
    ],
    risks: [],
    questions: [],
  };
}

export function validPlanV2(
  missionId = 'MIS-001',
  title = 'Governed execution contract',
): MissionPlanContentV2 {
  const requirement = 'CAP-EXEC-REQ-001';
  return {
    schemaVersion: 2,
    missionId,
    title,
    goal: 'Represent an implementation contract with hierarchical proof ownership',
    acceptanceCriteria: [
      {
        id: 'AC-01',
        qualifiedId: `${missionId}/AC-01`,
        statement: 'The Mission contract allocates every deciding requirement',
        requirementRefs: [requirement],
        verificationPlan: verificationPlan(),
      },
    ],
    scope: {
      included: ['Plan schema v2'],
      excluded: ['M2 Worker implementation'],
    },
    assumptions: ['The Capability Spec is repository-owned'],
    productMilestoneRefs: ['M2'],
    capabilityRefs: [
      {
        id: 'CAP-EXECUTION',
        specPath: 'docs/capabilities/CAP-EXECUTION/SPEC.md',
        version: '0.1.0',
      },
    ],
    requirementRefs: [requirement],
    environmentBinding: {
      environmentRef: 'ENV-E1',
      securityPolicyRef: 'SEC-E1',
      securityPolicyHash: `sha256:${'b'.repeat(64)}`,
    },
    documentationImpact: {
      status: 'UPDATED',
      refs: ['DOC-MNFS-PLAN-CONTRACT'],
      rationale: 'The schema reference and Pi skill are updated for v2.',
    },
    requirementsImpact: {
      status: 'UPDATED',
      refs: [requirement],
      rationale: 'The requirement is allocated to explicit hierarchical criteria.',
    },
    milestones: [
      {
        id: 'M01',
        qualifiedId: `${missionId}/M01`,
        title: 'Contract core',
        outcome: 'The contract is validated and content addressed',
        acceptanceCriteria: [
          {
            id: 'AC-01',
            qualifiedId: `${missionId}/M01/AC-01`,
            statement: 'The current contract hash is deterministic',
            requirementRefs: [requirement],
            verificationPlan: verificationPlan(),
          },
        ],
        requirementRefs: [requirement],
        dependsOn: [],
        features: [
          {
            id: 'F01',
            qualifiedId: `${missionId}/M01/F01`,
            title: 'Versioned domain model',
            outcome: 'v1 and v2 are discriminated explicitly',
            acceptanceCriteria: [
              {
                id: 'AC-01',
                qualifiedId: `${missionId}/M01/F01/AC-01`,
                statement: 'Unsupported fields and references are rejected',
                requirementRefs: [requirement],
                verificationPlan: verificationPlan(),
              },
            ],
            requirementRefs: [requirement],
            dependsOn: [],
          },
        ],
      },
      {
        id: 'M02',
        qualifiedId: `${missionId}/M02`,
        title: 'Recovery and approval',
        outcome: 'A fresh process recovers and materializes the approved revision',
        acceptanceCriteria: [
          {
            id: 'AC-01',
            qualifiedId: `${missionId}/M02/AC-01`,
            statement: 'The latest approved revision is materialized atomically',
            requirementRefs: [],
            verificationPlan: verificationPlan(),
          },
        ],
        requirementRefs: [],
        dependsOn: [`${missionId}/M01`],
        features: [
          {
            id: 'F01',
            qualifiedId: `${missionId}/M02/F01`,
            title: 'Fresh-process recovery',
            outcome: 'SQLite reconstructs the versioned plan',
            acceptanceCriteria: [
              {
                id: 'AC-01',
                qualifiedId: `${missionId}/M02/F01/AC-01`,
                statement: 'A new store instance reads the exact schema and hash',
                requirementRefs: [],
                verificationPlan: verificationPlan(),
              },
            ],
            requirementRefs: [],
            dependsOn: [`${missionId}/M01/F01`],
          },
        ],
      },
    ],
    risks: [
      {
        id: 'R01',
        description: 'A downgrade silently removes v2 semantics',
        mitigation: 'Reject v2 to v1 transitions before persistence',
      },
    ],
    questions: [],
  };
}
