import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { SqliteStore } from '../../src/store/sqlite-store.js';
import { validPlanV2 } from '../fixtures/mission-plans.js';

test('a fresh store process recovers the exact approved schema v2 revision', () => {
  const directory = mkdtempSync(join(tmpdir(), 'mnfs-plan-v2-approved-recovery-'));
  const databasePath = join(directory, 'mnfs.db');
  const first = SqliteStore.open(databasePath);
  first.openMission({
    missionId: 'MIS-001',
    eventId: 'EVT-MIS-001-OPEN',
    goal: 'Recover an approved schema v2 contract',
    openedAt: '2026-08-02T12:00:00.000Z',
  });
  const saved = first.saveMissionPlanRevision({
    missionId: 'MIS-001',
    content: validPlanV2(),
    createdAt: '2026-08-02T12:01:00.000Z',
  });
  const approved = first.approveMissionPlan({
    missionId: 'MIS-001',
    contentHash: saved.contentHash,
    approvedAt: '2026-08-02T12:02:00.000Z',
  });
  first.close();

  const recovered = SqliteStore.open(databasePath);
  assert.deepEqual(recovered.getCurrentMissionPlan('MIS-001'), approved);
  assert.deepEqual(recovered.getLatestApprovedMissionPlan('MIS-001'), approved);
  assert.equal(recovered.listMissionPlanRevisions('MIS-001').length, 1);
  recovered.close();
});
