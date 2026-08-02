import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { MnfsError } from '../../src/domain/errors.js';
import { MissionPlanService } from '../../src/services/mission-plan-service.js';
import { SqliteStore } from '../../src/store/sqlite-store.js';
import { validPlanV1, validPlanV2 } from '../fixtures/mission-plans.js';

interface Fixture {
  readonly root: string;
  readonly projectRoot: string;
  readonly store: SqliteStore;
  readonly service: MissionPlanService;
}

function fixture(): Fixture {
  const root = mkdtempSync(join(tmpdir(), 'mnfs-plan-v2-service-'));
  const projectRoot = join(root, 'project');
  const store = SqliteStore.open(join(root, 'runtime', 'mnfs.db'));
  store.openMission({
    missionId: 'MIS-001',
    eventId: 'EVT-MIS-001-OPEN',
    goal: 'Evolve the plan contract',
    openedAt: '2026-08-02T12:00:00.000Z',
  });
  let tick = 0;
  const service = new MissionPlanService({
    store,
    projectRoot,
    now: () => `2026-08-02T12:00:${String(tick++).padStart(2, '0')}.000Z`,
  });
  return { root, projectRoot, store, service };
}

function writePlan(root: string, name: string, content: unknown): string {
  const path = join(root, name);
  writeFileSync(path, JSON.stringify(content), 'utf8');
  return path;
}

function expectCode(code: string, operation: () => unknown): void {
  assert.throws(
    operation,
    (error: unknown) => error instanceof MnfsError && error.code === code,
  );
}

test('legacy schema v1 drafts remain editable and approvable', () => {
  const { root, store, service } = fixture();
  const first = service.savePlanFromFile({
    missionId: 'MIS-001',
    inputPath: writePlan(root, 'v1-first.json', validPlanV1()),
  });
  const second = service.savePlanFromFile({
    missionId: 'MIS-001',
    inputPath: writePlan(root, 'v1-second.json', validPlanV1('MIS-001', 'Revised v1 draft')),
    expectedPreviousHash: first.contentHash,
  });
  const approved = service.approvePlan({
    missionId: 'MIS-001',
    contentHash: second.contentHash,
  });

  assert.equal(approved.revision.content.schemaVersion, 1);
  assert.equal(approved.revision.revision, 2);
  store.close();
});

test('an approved v1 contract can only move forward through an exact-hash v2 Replan', () => {
  const { root, store, service } = fixture();
  const v1 = service.savePlanFromFile({
    missionId: 'MIS-001',
    inputPath: writePlan(root, 'v1.json', validPlanV1()),
  });
  service.approvePlan({ missionId: 'MIS-001', contentHash: v1.contentHash });

  expectCode('PLAN_REVISION_CONFLICT', () =>
    service.savePlanFromFile({
      missionId: 'MIS-001',
      inputPath: writePlan(root, 'v1-rewrite.json', validPlanV1('MIS-001', 'Forbidden rewrite')),
      expectedPreviousHash: v1.contentHash,
    }),
  );
  expectCode('PLAN_REVISION_CONFLICT', () =>
    service.savePlanFromFile({
      missionId: 'MIS-001',
      inputPath: writePlan(root, 'v2-stale.json', validPlanV2()),
      expectedPreviousHash: 'sha256:stale',
    }),
  );

  const v2 = service.savePlanFromFile({
    missionId: 'MIS-001',
    inputPath: writePlan(root, 'v2.json', validPlanV2()),
    expectedPreviousHash: v1.contentHash,
  });
  assert.equal(v2.revision, 2);
  assert.equal(v2.content.schemaVersion, 2);
  assert.deepEqual(
    store.listMissionPlanRevisions('MIS-001').map(({ revision, status }) => ({ revision, status })),
    [
      { revision: 1, status: 'APPROVED' },
      { revision: 2, status: 'DRAFT' },
    ],
  );
  store.close();
});

test('schema v2 can never be downgraded silently to schema v1', () => {
  const { root, store, service } = fixture();
  const v2 = service.savePlanFromFile({
    missionId: 'MIS-001',
    inputPath: writePlan(root, 'v2.json', validPlanV2()),
  });

  expectCode('PLAN_REVISION_CONFLICT', () =>
    service.savePlanFromFile({
      missionId: 'MIS-001',
      inputPath: writePlan(root, 'v1.json', validPlanV1()),
      expectedPreviousHash: v2.contentHash,
    }),
  );
  assert.equal(store.listMissionPlanRevisions('MIS-001').length, 1);
  store.close();
});

test('materialization keeps the latest approved contract authoritative during Replan', () => {
  const { root, projectRoot, store, service } = fixture();
  const v1 = service.savePlanFromFile({
    missionId: 'MIS-001',
    inputPath: writePlan(root, 'v1.json', validPlanV1()),
  });
  const approvedV1 = service.approvePlan({
    missionId: 'MIS-001',
    contentHash: v1.contentHash,
  });
  const v2 = service.savePlanFromFile({
    missionId: 'MIS-001',
    inputPath: writePlan(root, 'v2.json', validPlanV2()),
    expectedPreviousHash: v1.contentHash,
  });

  service.materializeApprovedPlan('MIS-001');
  const contractPath = join(projectRoot, '.mnfs', 'missions', 'MIS-001', 'plan.json');
  const beforeApproval = JSON.parse(readFileSync(contractPath, 'utf8')) as {
    readonly schemaVersion: number;
    readonly revision: number;
    readonly contentHash: string;
  };
  assert.equal(beforeApproval.schemaVersion, 1);
  assert.equal(beforeApproval.revision, approvedV1.revision.revision);
  assert.equal(beforeApproval.contentHash, approvedV1.revision.contentHash);

  service.approvePlan({ missionId: 'MIS-001', contentHash: v2.contentHash });
  const afterApproval = JSON.parse(readFileSync(contractPath, 'utf8')) as {
    readonly schemaVersion: number;
    readonly revision: number;
    readonly contentHash: string;
  };
  assert.equal(afterApproval.schemaVersion, 2);
  assert.equal(afterApproval.revision, 2);
  assert.equal(afterApproval.contentHash, v2.contentHash);
  assert.equal(store.listMissionPlanRevisions('MIS-001')[0]?.status, 'APPROVED');
  assert.equal(store.listMissionPlanRevisions('MIS-001')[1]?.status, 'APPROVED');
  store.close();
});
