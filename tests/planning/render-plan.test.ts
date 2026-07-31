import assert from 'node:assert/strict';
import test from 'node:test';

import type { MissionPlanContent, MissionPlanRevision } from '../../src/domain/mission-plan.js';
import { renderMissionPlanHtml } from '../../src/planning/render-plan.js';

function revision(contentOverrides: Partial<MissionPlanContent> = {}): MissionPlanRevision {
  const content: MissionPlanContent = {
    schemaVersion: 1,
    missionId: 'MIS-001',
    title: 'Visual planning',
    goal: 'Approve a complete implementation contract',
    successCriteria: ['Plan is editable', 'Approval binds the current hash'],
    scope: {
      included: ['Structured plan', 'Browser review'],
      excluded: ['Worker execution'],
    },
    assumptions: ['Lavish runs on loopback'],
    milestones: [
      {
        id: 'M01',
        title: 'Foundation',
        outcome: 'A durable plan exists',
        dependsOn: [],
        features: [
          {
            id: 'F01',
            title: 'Plan domain',
            outcome: 'Content is validated',
            acceptanceCriteria: ['Invalid content is rejected'],
            dependsOn: [],
          },
        ],
      },
      {
        id: 'M02',
        title: 'Review',
        outcome: 'The operator reviews the plan',
        dependsOn: ['M01'],
        features: [
          {
            id: 'F02',
            title: 'Lavish artifact',
            outcome: 'Feedback is precise',
            acceptanceCriteria: ['The exact hash is visible'],
            dependsOn: ['F01'],
          },
        ],
      },
    ],
    risks: [{ id: 'R01', description: 'Stale approval', mitigation: 'Bind approval to hash' }],
    questions: [
      {
        id: 'Q01',
        question: 'Is the scope correct?',
        blocking: true,
        status: 'ANSWERED',
        answer: 'Yes',
      },
    ],
    ...contentOverrides,
  };

  return {
    missionId: 'MIS-001',
    revision: 2,
    status: 'DRAFT',
    contentHash: `sha256:${'a'.repeat(64)}`,
    content,
    createdAt: '2026-07-31T22:00:00.000Z',
  };
}

test('renders every plan section and the exact revision identity', () => {
  const value = revision();
  const html = renderMissionPlanHtml(value);

  for (const expected of [
    value.content.title,
    value.content.goal,
    value.content.successCriteria[0],
    value.content.scope.included[0],
    value.content.scope.excluded[0],
    value.content.milestones[0]?.title ?? '',
    value.content.milestones[0]?.features[0]?.title ?? '',
    value.content.risks[0]?.description ?? '',
    value.content.questions[0]?.question ?? '',
    value.missionId,
    `Revision ${value.revision}`,
    value.contentHash,
  ]) {
    assert.equal(html.includes(expected), true, `missing rendered value: ${expected}`);
  }
});

test('escapes every semantic text surface instead of executing it', () => {
  const payload = '<img src=x onerror="alert(1)">';
  const html = renderMissionPlanHtml(revision({
    title: payload,
    goal: payload,
    successCriteria: [payload],
    scope: { included: [payload], excluded: [payload] },
    assumptions: [payload],
    milestones: [
      {
        id: 'M01',
        title: payload,
        outcome: payload,
        dependsOn: [],
        features: [
          {
            id: 'F01',
            title: payload,
            outcome: payload,
            acceptanceCriteria: [payload],
            dependsOn: [],
          },
        ],
      },
    ],
    risks: [{ id: 'R01', description: payload, mitigation: payload }],
    questions: [{ id: 'Q01', question: payload, blocking: false, status: 'ANSWERED', answer: payload }],
  }));

  assert.equal(html.includes(payload), false);
  assert.match(html, /&lt;img src=x onerror=&quot;alert\(1\)&quot;&gt;/);
});

test('produces deterministic self-contained HTML without external assets', () => {
  const value = revision();
  const first = renderMissionPlanHtml(value);
  const second = renderMissionPlanHtml(value);

  assert.equal(first, second);
  assert.doesNotMatch(first, /<(?:script|link|img)[^>]+(?:src|href)=["']https?:/i);
});

test('binds Lavish review controls to the exact mission and hash', () => {
  const value = revision();
  const html = renderMissionPlanHtml(value);
  const identity = `mission=${value.missionId} hash=${value.contentHash}`;

  assert.equal(html.includes(`MNFS_APPROVE_PLAN ${identity}`), true);
  assert.equal(html.includes(`MNFS_REQUEST_CHANGES ${identity}`), true);
  assert.match(html, /window\.lavish\.queuePrompt/);
  assert.match(html, /data-lavish-question="mnfs-plan-review"/);
});

test('includes Mermaid dependency source only when dependency edges exist', () => {
  const withDependencies = renderMissionPlanHtml(revision());
  assert.match(withDependencies, /class="mermaid"/);
  assert.match(withDependencies, /M01 --&gt; M02/);
  assert.match(withDependencies, /F01 --&gt; F02/);

  const withoutDependencies = revision({
    milestones: revision().content.milestones.map((milestone) => ({
      ...milestone,
      dependsOn: [],
      features: milestone.features.map((feature) => ({ ...feature, dependsOn: [] })),
    })),
  });
  assert.doesNotMatch(renderMissionPlanHtml(withoutDependencies), /class="mermaid"/);
});
