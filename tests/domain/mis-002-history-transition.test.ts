import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  hashPlanContent,
  validateMissionPlan,
} from '../../src/domain/mission-plan.js';

test('preserves revision 3 while allowing a newer current MIS-002 contract', () => {
  const historyText = readFileSync(
    '.mnfs/missions/MIS-002/history/revision-0003.json',
    'utf8',
  );
  const historyBlob = createHash('sha1')
    .update(`blob ${Buffer.byteLength(historyText)}\0`)
    .update(historyText)
    .digest('hex');
  const history = JSON.parse(historyText) as {
    readonly missionId: string;
    readonly revision: number;
    readonly contentHash: string;
    readonly content: unknown;
  };

  assert.equal(historyBlob, '6b79117fe66cd5c9c8142099828812f470ce20de');
  assert.equal(history.missionId, 'MIS-002');
  assert.equal(history.revision, 3);
  assert.equal(
    history.contentHash,
    'sha256:f95ffded37af764e5f76775ec6bbdda69d5638246609451ce37bf524908cf8c1',
  );
  assert.equal(
    hashPlanContent(validateMissionPlan(history.content, history.missionId)),
    history.contentHash,
  );

  const currentText = readFileSync('.mnfs/missions/MIS-002/plan.json', 'utf8');
  const current = JSON.parse(currentText) as {
    readonly missionId: string;
    readonly revision: number;
    readonly contentHash: string;
    readonly content: unknown;
  };
  const normalized = validateMissionPlan(current.content, current.missionId);

  if (current.revision === 3) {
    assert.equal(currentText, historyText);
  } else {
    assert.equal(current.revision >= 4, true);
    assert.equal(normalized.schemaVersion, 2);
    assert.equal(hashPlanContent(normalized), current.contentHash);
  }
});
