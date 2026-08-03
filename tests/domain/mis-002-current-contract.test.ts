import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  hashPlanContent,
  validateMissionPlan,
} from '../../src/domain/mission-plan.js';

const APPROVED_CONTRACT_HASH =
  'sha256:d82252504044cab40e00013dc30534654382887b7819d60a916d2a9a56db4cc3';
const SEC_E1_HASH =
  'sha256:f3dfca19f39bdd733f414831834a380b997e4938c10669c89a034cd9ad9c2471';
const REVISION_3_BLOB = '6b79117fe66cd5c9c8142099828812f470ce20de';
const REVISION_3_HASH =
  'sha256:f95ffded37af764e5f76775ec6bbdda69d5638246609451ce37bf524908cf8c1';

test('materializes the exact approved MIS-002 revision 5 while preserving revision 3', () => {
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

  assert.equal(historyBlob, REVISION_3_BLOB);
  assert.equal(history.missionId, 'MIS-002');
  assert.equal(history.revision, 3);
  assert.equal(history.contentHash, REVISION_3_HASH);
  assert.equal(
    hashPlanContent(validateMissionPlan(history.content, history.missionId)),
    history.contentHash,
  );

  const currentText = readFileSync('.mnfs/missions/MIS-002/plan.json', 'utf8');
  const current = JSON.parse(currentText) as {
    readonly missionId: string;
    readonly revision: number;
    readonly contentHash: string;
    readonly approvedAt?: string;
    readonly content: unknown;
  };
  const content = validateMissionPlan(current.content, current.missionId);

  assert.equal(current.missionId, 'MIS-002');
  assert.equal(current.revision, 5);
  assert.equal(current.contentHash, APPROVED_CONTRACT_HASH);
  assert.equal(typeof current.approvedAt, 'string');
  assert.ok((current.approvedAt ?? '').length > 0);
  assert.equal(content.schemaVersion, 2);
  assert.equal(hashPlanContent(content), APPROVED_CONTRACT_HASH);
  assert.equal(content.environmentBinding?.securityPolicyHash, SEC_E1_HASH);

  assert.deepEqual(
    content.milestones.map((milestone) => milestone.qualifiedId),
    ['MIS-002/M01', 'MIS-002/M02'],
  );
  assert.deepEqual(
    content.milestones.map((milestone) => milestone.features.length),
    [3, 5],
  );
  assert.equal(content.acceptanceCriteria.length, 7);
  assert.deepEqual(
    content.milestones.map((milestone) => milestone.acceptanceCriteria.length),
    [8, 16],
  );

  const m01 = content.milestones[0];
  const m02 = content.milestones[1];
  assert.ok(m01, 'M01 must exist');
  assert.ok(m02, 'M02 must exist');
  const m01f01 = m01.features[0];
  assert.ok(m01f01, 'M01/F01 must exist');
  assert.equal(m01f01.acceptanceCriteria.length, 5);

  assert.ok(
    content.acceptanceCriteria.some(
      (criterion) => criterion.qualifiedId === 'MIS-002/AC-07',
    ),
  );
  assert.ok(
    m01.acceptanceCriteria.some(
      (criterion) => criterion.qualifiedId === 'MIS-002/M01/AC-08',
    ),
  );
  assert.ok(
    m02.acceptanceCriteria.some(
      (criterion) => criterion.qualifiedId === 'MIS-002/M02/AC-16',
    ),
  );
  assert.ok(
    m01f01.acceptanceCriteria.some(
      (criterion) => criterion.qualifiedId === 'MIS-002/M01/F01/AC-05',
    ),
  );

  assert.equal(content.requirementRefs.length, 28);
  assert.equal(new Set(content.requirementRefs).size, 28);
  assert.equal(
    content.questions.some((question) => question.blocking && question.status === 'OPEN'),
    false,
  );
  assert.ok(content.risks.some((risk) => risk.id === 'R09'));
});
