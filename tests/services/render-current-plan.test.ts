import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import type { MissionPlanContent } from '../../src/domain/mission-plan.js';
import {
  resolveMissionPlanHtmlPath,
  resolveMissionPlanReviewPath,
} from '../../src/runtime/paths.js';
import { MissionPlanService } from '../../src/services/mission-plan-service.js';
import { SqliteStore } from '../../src/store/sqlite-store.js';

function plan(title = 'Render the approved planning surface'): MissionPlanContent {
  return {
    schemaVersion: 1,
    missionId: 'MIS-001',
    title,
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

test('renderCurrentPlan keeps one stable Lavish path and immutable revision snapshots', () => {
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

  const firstInput = join(root, 'plan-1.json');
  writeFileSync(firstInput, JSON.stringify(plan()), 'utf8');
  const revision1 = service.savePlanFromFile({ missionId: 'MIS-001', inputPath: firstInput });
  const firstResult = service.renderCurrentPlan('MIS-001');

  const reviewPath = resolveMissionPlanReviewPath(runtimeRoot, 'MIS-001');
  const snapshot1 = resolveMissionPlanHtmlPath(runtimeRoot, 'MIS-001', 1);
  assert.equal(firstResult.htmlPath, reviewPath);
  assert.equal(firstResult.snapshotPath, snapshot1);
  assert.equal(existsSync(reviewPath), true);
  assert.equal(existsSync(snapshot1), true);
  assert.equal(readFileSync(reviewPath, 'utf8'), readFileSync(snapshot1, 'utf8'));

  const secondInput = join(root, 'plan-2.json');
  writeFileSync(secondInput, JSON.stringify(plan('Revised planning surface')), 'utf8');
  const revision2 = service.savePlanFromFile({
    missionId: 'MIS-001',
    inputPath: secondInput,
    expectedPreviousHash: revision1.contentHash,
  });
  const secondResult = service.renderCurrentPlan('MIS-001');
  const snapshot2 = resolveMissionPlanHtmlPath(runtimeRoot, 'MIS-001', 2);

  assert.equal(secondResult.htmlPath, reviewPath);
  assert.equal(secondResult.snapshotPath, snapshot2);
  assert.notEqual(secondResult.snapshotPath, firstResult.snapshotPath);
  assert.equal(existsSync(snapshot1), true);
  assert.equal(existsSync(snapshot2), true);
  assert.equal(readFileSync(reviewPath, 'utf8'), readFileSync(snapshot2, 'utf8'));
  assert.equal(readFileSync(reviewPath, 'utf8').includes(revision2.contentHash), true);
  assert.equal(readFileSync(snapshot1, 'utf8').includes(revision1.contentHash), true);
  store.close();
});
