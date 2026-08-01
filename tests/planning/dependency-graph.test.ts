import assert from 'node:assert/strict';
import test from 'node:test';

import type { MissionPlanContent } from '../../src/domain/mission-plan.js';
import { renderDependencyGraphSvg } from '../../src/planning/dependency-graph.js';

function plan(withDependencies = true): MissionPlanContent {
  return {
    schemaVersion: 1,
    missionId: 'MIS-001',
    title: 'Dependency graph',
    goal: 'Render a deterministic dependency graph',
    successCriteria: ['Every dependency is visible'],
    scope: { included: ['Static SVG'], excluded: ['Browser Mermaid runtime'] },
    assumptions: [],
    milestones: [
      {
        id: 'M01',
        title: 'Foundation <safe>',
        outcome: 'Foundation exists',
        dependsOn: [],
        features: [
          {
            id: 'F01',
            title: 'Worker runtime',
            outcome: 'A worker can run',
            acceptanceCriteria: ['Worker starts'],
            dependsOn: [],
          },
        ],
      },
      {
        id: 'M02',
        title: 'Recovery',
        outcome: 'Recovery works',
        dependsOn: withDependencies ? ['M01'] : [],
        features: [
          {
            id: 'F02',
            title: 'Durable CLAIM',
            outcome: 'The lead recovers the claim',
            acceptanceCriteria: ['Claim survives restart'],
            dependsOn: withDependencies ? ['F01'] : [],
          },
        ],
      },
    ],
    risks: [],
    questions: [],
  };
}

test('renders a deterministic inline SVG with every dependency node and edge', () => {
  const first = renderDependencyGraphSvg(plan());
  const second = renderDependencyGraphSvg(plan());

  assert.ok(first !== undefined);
  assert.equal(first, second);
  assert.match(first, /<svg class="dependency-graph"/);
  assert.match(first, /data-node="M01"/);
  assert.match(first, /data-node="M02"/);
  assert.match(first, /data-node="F01"/);
  assert.match(first, /data-node="F02"/);
  assert.match(first, /data-edge="M01-&gt;M02"/);
  assert.match(first, /data-edge="F01-&gt;F02"/);
  assert.match(first, /Foundation &lt;safe&gt;/);
  assert.doesNotMatch(first, /<pre class="mermaid"/);
  assert.doesNotMatch(first, /<(?:script|image|use)[^>]+https?:\/\//i);
});

test('omits the graph when the plan has no dependency edges', () => {
  assert.equal(renderDependencyGraphSvg(plan(false)), undefined);
});
