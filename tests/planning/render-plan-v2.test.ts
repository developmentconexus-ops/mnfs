import assert from 'node:assert/strict';
import test from 'node:test';

import type { MissionPlanContentV2, MissionPlanRevision } from '../../src/domain/mission-plan.js';
import { renderMissionPlanHtml } from '../../src/planning/render-plan.js';
import { validPlanV2 } from '../fixtures/mission-plans.js';

function revision(content: MissionPlanContentV2 = validPlanV2()): MissionPlanRevision {
  return {
    missionId: content.missionId,
    revision: 4,
    status: 'DRAFT',
    contentHash: `sha256:${'c'.repeat(64)}`,
    content,
    createdAt: '2026-08-02T12:00:00.000Z',
  };
}

test('renders every deciding schema v2 field on the Lavish review surface', () => {
  const value = revision();
  const html = renderMissionPlanHtml(value);
  const content = value.content as MissionPlanContentV2;
  const milestone = content.milestones[0];
  const feature = milestone?.features[0];
  const criterion = feature?.acceptanceCriteria[0];
  assert.ok(milestone && feature && criterion);

  const expectedValues = [
    'Schema v2',
    content.acceptanceCriteria[0]?.qualifiedId,
    content.productMilestoneRefs[0],
    content.capabilityRefs[0]?.id,
    content.capabilityRefs[0]?.specPath,
    content.requirementRefs[0],
    content.environmentBinding?.environmentRef,
    content.environmentBinding?.securityPolicyRef,
    content.environmentBinding?.securityPolicyHash,
    content.documentationImpact.status,
    content.documentationImpact.rationale,
    content.requirementsImpact.status,
    content.requirementsImpact.rationale,
    milestone.qualifiedId,
    milestone.acceptanceCriteria[0]?.qualifiedId,
    feature.qualifiedId,
    criterion.qualifiedId,
    criterion.verificationPlan.method,
    criterion.verificationPlan.owner,
    criterion.verificationPlan.proofType,
    criterion.verificationPlan.proofOwner,
    value.contentHash,
  ];

  for (const expected of expectedValues) {
    assert.ok(expected !== undefined, 'v2 renderer fixture must provide every deciding value');
    assert.equal(html.includes(expected), true, `missing rendered value: ${expected}`);
  }
});

test('escapes schema v2 semantic text and renders qualified dependency edges', () => {
  const payload = '<svg onload="alert(1)">';
  const base = validPlanV2();
  const content: MissionPlanContentV2 = {
    ...base,
    title: payload,
    acceptanceCriteria: [
      {
        ...base.acceptanceCriteria[0]!,
        statement: payload,
      },
    ],
    capabilityRefs: [
      {
        ...base.capabilityRefs[0]!,
        specPath: 'docs/capabilities/CAP-EXECUTION/SPEC.md',
      },
    ],
    documentationImpact: {
      ...base.documentationImpact,
      rationale: payload,
    },
    milestones: base.milestones.map((milestone, milestoneIndex) => ({
      ...milestone,
      title: milestoneIndex === 0 ? payload : milestone.title,
      features: milestone.features.map((feature, featureIndex) => ({
        ...feature,
        title: milestoneIndex === 0 && featureIndex === 0 ? payload : feature.title,
      })),
    })),
  };
  const html = renderMissionPlanHtml(revision(content));

  assert.equal(html.includes(payload), false);
  assert.match(html, /&lt;svg onload=&quot;alert\(1\)&quot;&gt;/);
  assert.match(html, /data-edge="MIS-001\/M01-&gt;MIS-001\/M02"/);
  assert.match(html, /data-edge="MIS-001\/M01\/F01-&gt;MIS-001\/M02\/F01"/);
});

test('schema v2 rendering remains deterministic and exact-hash bound', () => {
  const value = revision();
  const first = renderMissionPlanHtml(value);
  const second = renderMissionPlanHtml(value);
  const identity = `mission=${value.missionId} hash=${value.contentHash}`;

  assert.equal(first, second);
  assert.equal(first.includes(`MNFS_APPROVE_PLAN ${identity}`), true);
  assert.equal(first.includes(`MNFS_REQUEST_CHANGES ${identity}`), true);
  assert.doesNotMatch(first, /<(?:script|link|img)[^>]+(?:src|href)=["']https?:/i);
});
