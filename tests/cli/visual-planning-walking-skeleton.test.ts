import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import test from 'node:test';

import type {
  MissionPlanContent,
  MissionPlanRevision,
} from '../../src/domain/mission-plan.js';
import type { Mission } from '../../src/domain/types.js';

const cliPath = resolve('bin/mnfs.mjs');

interface RenderPlanOutput {
  readonly revision: MissionPlanRevision;
  readonly htmlPath: string;
}

interface ApprovePlanOutput {
  readonly revision: MissionPlanRevision;
  readonly contractPath: string;
}

function makeGitRepository(): { readonly root: string; readonly runtimeHome: string } {
  const root = mkdtempSync(join(tmpdir(), 'mnfs-visual-plan-repo-'));
  const runtimeHome = mkdtempSync(join(tmpdir(), 'mnfs-visual-plan-home-'));
  const git = spawnSync('git', ['init', '-b', 'main'], {
    cwd: root,
    encoding: 'utf8',
  });
  assert.equal(git.status, 0, git.stderr);
  return { root, runtimeHome };
}

function run(root: string, runtimeHome: string, args: readonly string[]) {
  return spawnSync(process.execPath, [cliPath, ...args], {
    cwd: root,
    encoding: 'utf8',
    env: {
      ...process.env,
      MNFS_HOME: runtimeHome,
      NODE_NO_WARNINGS: '1',
    },
  });
}

function runJson<T>(
  root: string,
  runtimeHome: string,
  args: readonly string[],
): T {
  const result = run(root, runtimeHome, args);
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout) as T;
}

function writePlan(
  root: string,
  fileName: string,
  content: MissionPlanContent,
): string {
  const path = join(root, fileName);
  writeFileSync(path, `${JSON.stringify(content, null, 2)}\n`, 'utf8');
  return path;
}

function plan(
  missionId: string,
  title: string,
  options: { readonly blockingQuestion?: boolean } = {},
): MissionPlanContent {
  return {
    schemaVersion: 1,
    missionId,
    title,
    goal: 'Approve a durable visual planning contract',
    successCriteria: [
      'A stale revision is rejected',
      'Approval binds the exact current hash',
    ],
    scope: {
      included: ['Structured revisions', 'Deterministic HTML', 'Explicit approval'],
      excluded: ['Worker execution'],
    },
    assumptions: ['Lavish remains a review surface, not state authority'],
    milestones: [
      {
        id: 'M01',
        title: 'Planning contract',
        outcome: 'The operator can approve one exact revision',
        dependsOn: [],
        features: [
          {
            id: 'F01',
            title: 'Revision lifecycle',
            outcome: 'Revisions and approval survive fresh processes',
            acceptanceCriteria: [
              'Revision 2 supersedes revision 1',
              'The approved contract can be rematerialized',
            ],
            dependsOn: [],
          },
        ],
      },
    ],
    risks: [
      {
        id: 'R01',
        description: 'A stale session approves old content',
        mitigation: 'Require the exact current content hash',
      },
    ],
    questions: options.blockingQuestion
      ? [
          {
            id: 'Q01',
            question: 'Which product boundary should be approved?',
            blocking: true,
            status: 'OPEN',
          },
        ]
      : [],
  };
}

test('the visual planning lifecycle survives independent CLI processes', () => {
  const { root, runtimeHome } = makeGitRepository();

  runJson(root, runtimeHome, ['init', '--json']);

  const primaryMission = runJson<Mission>(root, runtimeHome, [
    'mission',
    'open',
    '--goal',
    'Prove the complete visual planning lifecycle',
    '--json',
  ]);
  const blockedMission = runJson<Mission>(root, runtimeHome, [
    'mission',
    'open',
    '--goal',
    'Prove blocking questions stop approval',
    '--json',
  ]);
  assert.equal(primaryMission.id, 'MIS-001');
  assert.equal(blockedMission.id, 'MIS-002');

  // Process A creates revision 1.
  const revision1Path = writePlan(
    root,
    'plan-revision-1.json',
    plan(primaryMission.id, 'Initial visual plan'),
  );
  const revision1 = runJson<MissionPlanRevision>(root, runtimeHome, [
    'plan',
    'save',
    '--mission',
    primaryMission.id,
    '--input',
    revision1Path,
    '--json',
  ]);
  assert.equal(revision1.revision, 1);
  assert.equal(revision1.status, 'DRAFT');

  // Process B recovers revision 1 and renders deterministic HTML.
  const recoveredRevision1 = runJson<MissionPlanRevision>(root, runtimeHome, [
    'plan',
    'show',
    '--mission',
    primaryMission.id,
    '--json',
  ]);
  assert.equal(recoveredRevision1.contentHash, revision1.contentHash);

  const firstRender = runJson<RenderPlanOutput>(root, runtimeHome, [
    'plan',
    'render',
    '--mission',
    primaryMission.id,
    '--json',
  ]);
  assert.equal(existsSync(firstRender.htmlPath), true);
  const firstHtml = readFileSync(firstRender.htmlPath, 'utf8');
  assert.equal(firstHtml.includes(revision1.contentHash), true);

  const repeatedRender = runJson<RenderPlanOutput>(root, runtimeHome, [
    'plan',
    'render',
    '--mission',
    primaryMission.id,
    '--json',
  ]);
  assert.equal(repeatedRender.htmlPath, firstRender.htmlPath);
  assert.equal(readFileSync(repeatedRender.htmlPath, 'utf8'), firstHtml);

  // Revision 2 must bind revision 1's exact hash.
  const revision2Path = writePlan(
    root,
    'plan-revision-2.json',
    plan(primaryMission.id, 'Revised visual plan'),
  );
  const revision2 = runJson<MissionPlanRevision>(root, runtimeHome, [
    'plan',
    'save',
    '--mission',
    primaryMission.id,
    '--input',
    revision2Path,
    '--expected-hash',
    revision1.contentHash,
    '--json',
  ]);
  assert.equal(revision2.revision, 2);
  assert.notEqual(revision2.contentHash, revision1.contentHash);

  const stalePath = writePlan(
    root,
    'plan-stale.json',
    plan(primaryMission.id, 'Stale competing plan'),
  );
  const stale = run(root, runtimeHome, [
    'plan',
    'save',
    '--mission',
    primaryMission.id,
    '--input',
    stalePath,
    '--expected-hash',
    revision1.contentHash,
    '--json',
  ]);
  assert.equal(stale.status, 1);
  assert.match(stale.stderr, /^PLAN_REVISION_CONFLICT:/);

  const currentAfterStale = runJson<MissionPlanRevision>(root, runtimeHome, [
    'plan',
    'show',
    '--mission',
    primaryMission.id,
    '--json',
  ]);
  assert.equal(currentAfterStale.contentHash, revision2.contentHash);
  assert.equal(currentAfterStale.revision, 2);

  const wrongApproval = run(root, runtimeHome, [
    'plan',
    'approve',
    '--mission',
    primaryMission.id,
    '--hash',
    `sha256:${'f'.repeat(64)}`,
    '--json',
  ]);
  assert.equal(wrongApproval.status, 1);
  assert.match(wrongApproval.stderr, /^PLAN_APPROVAL_CONFLICT:/);

  const blockedPath = writePlan(
    root,
    'plan-blocked.json',
    plan(blockedMission.id, 'Plan with unresolved product decision', {
      blockingQuestion: true,
    }),
  );
  const blockedRevision = runJson<MissionPlanRevision>(root, runtimeHome, [
    'plan',
    'save',
    '--mission',
    blockedMission.id,
    '--input',
    blockedPath,
    '--json',
  ]);
  const blockedApproval = run(root, runtimeHome, [
    'plan',
    'approve',
    '--mission',
    blockedMission.id,
    '--hash',
    blockedRevision.contentHash,
    '--json',
  ]);
  assert.equal(blockedApproval.status, 1);
  assert.match(blockedApproval.stderr, /^PLAN_BLOCKED:/);

  const approved = runJson<ApprovePlanOutput>(root, runtimeHome, [
    'plan',
    'approve',
    '--mission',
    primaryMission.id,
    '--hash',
    revision2.contentHash,
    '--json',
  ]);
  assert.equal(approved.revision.status, 'APPROVED');
  assert.equal(approved.revision.revision, 2);
  assert.equal(approved.revision.contentHash, revision2.contentHash);
  assert.equal(existsSync(approved.contractPath), true);

  const contract = JSON.parse(
    readFileSync(approved.contractPath, 'utf8'),
  ) as {
    readonly revision: number;
    readonly contentHash: string;
  };
  assert.equal(contract.revision, 2);
  assert.equal(contract.contentHash, revision2.contentHash);

  // Process C recovers approval, then repairs a deliberately missing contract.
  const recoveredApproved = runJson<MissionPlanRevision>(root, runtimeHome, [
    'plan',
    'show',
    '--mission',
    primaryMission.id,
    '--json',
  ]);
  assert.equal(recoveredApproved.status, 'APPROVED');
  assert.equal(recoveredApproved.contentHash, revision2.contentHash);

  rmSync(approved.contractPath);
  assert.equal(existsSync(approved.contractPath), false);

  const rematerialized = runJson<ApprovePlanOutput>(root, runtimeHome, [
    'plan',
    'materialize',
    '--mission',
    primaryMission.id,
    '--json',
  ]);
  assert.equal(rematerialized.contractPath, approved.contractPath);
  assert.equal(existsSync(rematerialized.contractPath), true);

  const repairedContract = JSON.parse(
    readFileSync(rematerialized.contractPath, 'utf8'),
  ) as { readonly contentHash: string };
  assert.equal(repairedContract.contentHash, revision2.contentHash);
});
