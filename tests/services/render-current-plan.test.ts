import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import type { MissionPlanContent } from '../../src/domain/mission-plan.js';
import { resolveMissionPlanHtmlPath } from '../../src/runtime/paths.js';
import { MissionPlanService } from '../../src/services/mission-plan-service.js';
import { SqliteStore } from '../../src/store/sqlite-store.js';

function plan(): MissionPlanContent {
  return {
    schemaVersion: 1,
    missionId: 'MIS-001',
    title: 'Render the approved planning surface',
    goal: 'Create one deterministic browser artifact',
    successCriteria: ['The current revision and hash are visible'],
    scope: { included: ['HTML renderer'], excluded: ['Worker execution'] },
    assumptions: ['The artifact is opened through Lavish later'],
    milestones: [
      {
        id: 'M01',
        title: 'Renderer',
        outcome: 'A reviewable artifact exists',
        dependsOn: [],
        features: [
          {
            id: 'F01',
            title: 'Deterministic HTML',
            outcome: 'Repeated rendering is byte-identical',
            acceptanceCriteria: ['The exact content hash is shown'],
            dependsOn: [],
          },
        ],
      },
    ],
    risks: [],
    questions: [],
  };
}

test('renderCurrentPlan writes the deterministic revision artifact under runtime root', () => {
  const root = mkdtempSync(join(tmpdir(), 'mnfs-render-current-plan-'));
  const projectRoot = join(root, 'project');
  const runtimeRoot = join(root, 'runtime');
  const store = SqliteStore.open(join(runtimeRoot, 'mnfs.db'));
  store.openMission({
    missionId: 'MIS-001',
    eventId: 'EVT-MIS-001-OPEN',
    goal: 'Create one deterministic browser artifact',
    openedAt: '2026-07-31T18:00:00.000Z',
  });
  const service = new MissionPlanService({
    store,
    projectRoot,
    runtimeRoot,
    now: () => '2026-07-31T20:00:00.000Z',
  });
  const inputPath = join(root, 'plan.json');
  writeFileSync(inputPath, JSON.stringify(plan()), 'utf8');
  const revision = service.savePlanFromFile({ missionId: 'MIS-001', inputPath });

  const firstResult = service.renderCurrentPlan('MIS-001');
  const expectedPath = resolveMissionPlanHtmlPath(runtimeRoot, 'MIS-001', revision.revision);

  assert.equal(firstResult.htmlPath, expectedPath);
  assert.deepEqual(firstResult.revision, revision);
  assert.equal(existsSync(expectedPath), true);
  const firstHtml = readFileSync(expectedPath, 'utf8');
  assert.equal(firstHtml.includes(revision.contentHash), true);
  assert.equal(firstHtml.includes('Render the approved planning surface'), true);

  const secondResult = service.renderCurrentPlan('MIS-001');
  assert.equal(secondResult.htmlPath, expectedPath);
  assert.equal(readFileSync(expectedPath, 'utf8'), firstHtml);
  store.close();
});
