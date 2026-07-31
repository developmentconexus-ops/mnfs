import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { MissionService } from '../../src/services/mission-service.js';
import { SqliteStore } from '../../src/store/sqlite-store.js';

function createService(nowValues: readonly string[]): { service: MissionService; store: SqliteStore } {
  const root = mkdtempSync(join(tmpdir(), 'mnfs-mission-service-'));
  const store = SqliteStore.open(join(root, 'mnfs.db'));
  let index = 0;
  const service = new MissionService(store, {
    now: () => nowValues[index++] ?? nowValues.at(-1) ?? '2026-07-31T00:00:00.000Z',
  });
  return { service, store };
}

test('openMission allocates sequential human-readable mission ids', () => {
  const { service, store } = createService([
    '2026-07-31T18:40:00.000Z',
    '2026-07-31T18:41:00.000Z',
  ]);

  const first = service.openMission({ goal: 'Build the foundation' });
  const second = service.openMission({ goal: 'Add the first worker later' });

  assert.equal(first.id, 'MIS-001');
  assert.equal(second.id, 'MIS-002');
  assert.deepEqual(store.listEvents().map((event) => event.missionId), ['MIS-001', 'MIS-002']);
  store.close();
});

test('getStatus reports counts and active missions from durable state', () => {
  const { service, store } = createService([
    '2026-07-31T18:40:00.000Z',
    '2026-07-31T18:41:00.000Z',
  ]);
  service.openMission({ goal: 'Build the foundation' });
  service.openMission({ goal: 'Prove restart recovery' });

  assert.deepEqual(service.getStatus(), {
    schemaVersion: 1,
    missions: {
      total: 2,
      open: 2,
      closed: 0,
      active: [
        {
          id: 'MIS-001',
          goal: 'Build the foundation',
          status: 'OPEN',
          openedAt: '2026-07-31T18:40:00.000Z',
        },
        {
          id: 'MIS-002',
          goal: 'Prove restart recovery',
          status: 'OPEN',
          openedAt: '2026-07-31T18:41:00.000Z',
        },
      ],
    },
  });
  store.close();
});
