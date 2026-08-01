import assert from 'node:assert/strict';
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { MnfsError } from '../../src/domain/errors.js';
import type { MissionPlanContent } from '../../src/domain/mission-plan.js';
import { resolveMissionPlanContractPath } from '../../src/runtime/paths.js';
import { MissionPlanService } from '../../src/services/mission-plan-service.js';
import { SqliteStore } from '../../src/store/sqlite-store.js';

function validPlan(options: { readonly blockingQuestion?: boolean; readonly title?: string } = {}): MissionPlanContent {
  return {
    schemaVersion: 1,
    missionId: 'MIS-001',
    title: options.title ?? 'Visual planning',
    goal: 'Build a reliable planning loop',
    successCriteria: ['The operator approves an exact plan hash'],
    scope: { included: ['Structured planning'], excluded: ['Worker execution'] },
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
        ],
      },
    ],
    risks: [],
    questions: options.blockingQuestion
      ? [{ id: 'Q01', question: 'Choose the product boundary', blocking: true, status: 'OPEN' }]
      : [],
  };
}

function fixture(): {
  readonly root: string;
  readonly projectRoot: string;
  readonly store: SqliteStore;
  readonly service: MissionPlanService;
} {
  const root = mkdtempSync(join(tmpdir(), 'mnfs-plan-service-'));
  const projectRoot = join(root, 'project');
  const store = SqliteStore.open(join(root, 'runtime', 'mnfs.db'));
  store.openMission({
    missionId: 'MIS-001',
    eventId: 'EVT-MIS-001-OPEN',
    goal: 'Build a reliable planning loop',
    openedAt: '2026-07-31T18:00:00.000Z',
  });
  const service = new MissionPlanService({
    store,
    projectRoot,
    now: () => '2026-07-31T20:00:00.000Z',
  });
  return { root, projectRoot, store, service };
}

function writePlan(root: string, content: unknown): string {
  const path = join(root, 'plan-input.json');
  writeFileSync(path, JSON.stringify(content), 'utf8');
  return path;
}

function hasCode(code: string): (error: unknown) => boolean {
  return (error: unknown) => error instanceof MnfsError && error.code === code;
}

test('savePlanFromFile validates, normalizes and persists structured content', () => {
  const { root, store, service } = fixture();
  const inputPath = writePlan(root, validPlan({ title: '  Visual planning  ' }));

  const revision = service.savePlanFromFile({ missionId: 'MIS-001', inputPath });

  assert.equal(revision.revision, 1);
  assert.equal(revision.content.title, 'Visual planning');
  assert.deepEqual(store.getCurrentMissionPlan('MIS-001'), revision);
  store.close();
});

test('invalid JSON is rejected before any revision is written', () => {
  const { root, store, service } = fixture();
  const inputPath = join(root, 'invalid.json');
  writeFileSync(inputPath, '{not-json', 'utf8');

  assert.throws(
    () => service.savePlanFromFile({ missionId: 'MIS-001', inputPath }),
    hasCode('PLAN_INVALID'),
  );
  assert.equal(store.getCurrentMissionPlan('MIS-001'), undefined);
  store.close();
});

test('the service preserves stale-write protection through the file boundary', () => {
  const { root, store, service } = fixture();
  const firstPath = writePlan(root, validPlan());
  const first = service.savePlanFromFile({ missionId: 'MIS-001', inputPath: firstPath });
  const secondPath = writePlan(root, validPlan({ title: 'Revised plan' }));

  assert.throws(
    () => service.savePlanFromFile({
      missionId: 'MIS-001',
      inputPath: secondPath,
      expectedPreviousHash: 'sha256:stale',
    }),
    hasCode('PLAN_REVISION_CONFLICT'),
  );
  assert.equal(store.getCurrentMissionPlan('MIS-001')?.contentHash, first.contentHash);
  assert.equal(store.listMissionPlanRevisions('MIS-001').length, 1);
  store.close();
});

test('approval is blocked while a blocking product question remains open', () => {
  const { root, projectRoot, store, service } = fixture();
  const revision = service.savePlanFromFile({
    missionId: 'MIS-001',
    inputPath: writePlan(root, validPlan({ blockingQuestion: true })),
  });

  assert.throws(
    () => service.approvePlan({ missionId: 'MIS-001', contentHash: revision.contentHash }),
    hasCode('PLAN_BLOCKED'),
  );
  assert.equal(store.getCurrentMissionPlan('MIS-001')?.status, 'DRAFT');
  assert.equal(existsSync(resolveMissionPlanContractPath(projectRoot, 'MIS-001')), false);
  store.close();
});

test('exact-hash approval publishes one atomic versioned contract', () => {
  const { root, projectRoot, store, service } = fixture();
  const revision = service.savePlanFromFile({
    missionId: 'MIS-001',
    inputPath: writePlan(root, validPlan()),
  });

  const result = service.approvePlan({ missionId: 'MIS-001', contentHash: revision.contentHash });
  const contractPath = resolveMissionPlanContractPath(projectRoot, 'MIS-001');
  const contract = JSON.parse(readFileSync(contractPath, 'utf8')) as Record<string, unknown>;

  assert.equal(result.contractPath, contractPath);
  assert.equal(result.revision.status, 'APPROVED');
  assert.equal(contract.schemaVersion, 1);
  assert.equal(contract.missionId, 'MIS-001');
  assert.equal(contract.revision, 1);
  assert.equal(contract.contentHash, revision.contentHash);
  assert.equal(contract.approvedAt, '2026-07-31T20:00:00.000Z');
  assert.deepEqual(contract.content, revision.content);
  assert.deepEqual(readdirSync(join(projectRoot, '.mnfs', 'missions', 'MIS-001')), ['plan.json']);
  store.close();
});

test('a publish failure preserves approved SQLite state for explicit repair', () => {
  const { root, projectRoot, store, service } = fixture();
  const revision = service.savePlanFromFile({
    missionId: 'MIS-001',
    inputPath: writePlan(root, validPlan()),
  });
  writeFileSync(projectRoot, 'blocks directory creation', 'utf8');

  assert.throws(
    () => service.approvePlan({ missionId: 'MIS-001', contentHash: revision.contentHash }),
    hasCode('PLAN_MATERIALIZATION_FAILED'),
  );
  assert.equal(store.getCurrentMissionPlan('MIS-001')?.status, 'APPROVED');

  const repairRoot = join(root, 'repair-project');
  const repairService = new MissionPlanService({ store, projectRoot: repairRoot });
  const repairedPath = repairService.materializeApprovedPlan('MIS-001');
  assert.equal(existsSync(repairedPath), true);
  store.close();
});

test('materializeApprovedPlan repairs a missing contract from approved SQLite state', () => {
  const { root, projectRoot, store, service } = fixture();
  const revision = service.savePlanFromFile({
    missionId: 'MIS-001',
    inputPath: writePlan(root, validPlan()),
  });
  service.approvePlan({ missionId: 'MIS-001', contentHash: revision.contentHash });
  const contractPath = resolveMissionPlanContractPath(projectRoot, 'MIS-001');
  rmSync(contractPath);

  const repairedPath = service.materializeApprovedPlan('MIS-001');

  assert.equal(repairedPath, contractPath);
  assert.equal(existsSync(contractPath), true);
  const repaired = JSON.parse(readFileSync(contractPath, 'utf8')) as { contentHash: string };
  assert.equal(repaired.contentHash, revision.contentHash);
  store.close();
});

test('materialization refuses a draft plan', () => {
  const { root, store, service } = fixture();
  service.savePlanFromFile({ missionId: 'MIS-001', inputPath: writePlan(root, validPlan()) });

  assert.throws(() => service.materializeApprovedPlan('MIS-001'), hasCode('PLAN_APPROVAL_CONFLICT'));
  store.close();
});
