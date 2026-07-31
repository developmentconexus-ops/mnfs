import assert from 'node:assert/strict';
import test from 'node:test';

import { parseArgs } from '../../src/cli/args.js';
import { runCli, type CliDependencies } from '../../src/cli/main.js';
import { MnfsError } from '../../src/domain/errors.js';
import type { MissionPlanRevision } from '../../src/domain/mission-plan.js';

const CONTENT_HASH = `sha256:${'a'.repeat(64)}`;

function planRevision(status: MissionPlanRevision['status'] = 'DRAFT'): MissionPlanRevision {
  return {
    missionId: 'MIS-001',
    revision: 2,
    status,
    contentHash: CONTENT_HASH,
    content: {
      schemaVersion: 1,
      missionId: 'MIS-001',
      title: 'Visual planning',
      goal: 'Approve one exact implementation plan',
      successCriteria: ['The current hash is explicit'],
      scope: { included: ['Planning'], excluded: ['Worker execution'] },
      assumptions: ['Lavish runs on loopback'],
      milestones: [
        {
          id: 'M01',
          title: 'Plan',
          outcome: 'An approved contract exists',
          dependsOn: [],
          features: [
            {
              id: 'F01',
              title: 'CLI',
              outcome: 'The planning loop is executable',
              acceptanceCriteria: ['Every command has JSON output'],
              dependsOn: [],
            },
          ],
        },
      ],
      risks: [],
      questions: [],
    },
    createdAt: '2026-07-31T22:00:00.000Z',
    ...(status === 'APPROVED' ? { approvedAt: '2026-07-31T23:00:00.000Z' } : {}),
  };
}

function baseDependencies(overrides: Partial<CliDependencies> = {}): CliDependencies {
  return {
    inspect: () => ({
      schemaVersion: 1,
      ready: true,
      environment: 'wsl2',
      nodeVersion: 'v24.18.0',
      cwd: '/home/leandro/src/mnfs',
      tools: [],
      problems: [],
      missingRequired: [],
      missingOptional: [],
    }),
    ...overrides,
  };
}

test('parses every planning command with strict named arguments', () => {
  assert.deepEqual(
    parseArgs([
      'plan',
      'save',
      '--mission',
      'MIS-001',
      '--input',
      '/tmp/plan.json',
      '--expected-hash',
      CONTENT_HASH,
      '--json',
    ]),
    {
      kind: 'plan-save',
      missionId: 'MIS-001',
      inputPath: '/tmp/plan.json',
      expectedPreviousHash: CONTENT_HASH,
      json: true,
    },
  );
  assert.deepEqual(parseArgs(['plan', 'show', '--mission', 'MIS-001']), {
    kind: 'plan-show', missionId: 'MIS-001', json: false,
  });
  assert.deepEqual(parseArgs(['plan', 'render', '--mission', 'MIS-001']), {
    kind: 'plan-render', missionId: 'MIS-001', json: false,
  });
  assert.deepEqual(parseArgs(['plan', 'open', '--mission', 'MIS-001']), {
    kind: 'plan-open', missionId: 'MIS-001', json: false,
  });
  assert.deepEqual(parseArgs(['plan', 'poll', '--mission', 'MIS-001', '--json']), {
    kind: 'plan-poll', missionId: 'MIS-001', json: true,
  });
  assert.deepEqual(parseArgs(['plan', 'approve', '--mission', 'MIS-001', '--hash', CONTENT_HASH]), {
    kind: 'plan-approve', missionId: 'MIS-001', contentHash: CONTENT_HASH, json: false,
  });
  assert.deepEqual(parseArgs(['plan', 'materialize', '--mission', 'MIS-001']), {
    kind: 'plan-materialize', missionId: 'MIS-001', json: false,
  });
});

test('rejects missing, duplicate and unknown planning arguments', () => {
  const invalidCommands: readonly (readonly string[])[] = [
    ['plan', 'save', '--mission', 'MIS-001'],
    ['plan', 'show'],
    ['plan', 'approve', '--mission', 'MIS-001'],
    ['plan', 'show', '--mission', 'MIS-001', '--mission', 'MIS-002'],
    ['plan', 'render', '--mission', 'MIS-001', '--wat'],
  ];

  for (const command of invalidCommands) {
    assert.equal(parseArgs(command).kind, 'invalid', command.join(' '));
  }
});

test('wires JSON planning commands to asynchronous dependencies', async () => {
  const calls: string[] = [];
  const revision = planRevision();
  const approved = planRevision('APPROVED');
  const dependencies = baseDependencies({
    savePlan: async (input) => {
      calls.push(`save:${input.missionId}:${input.inputPath}`);
      return revision;
    },
    showPlan: async (missionId) => {
      calls.push(`show:${missionId}`);
      return revision;
    },
    renderPlan: async (missionId) => {
      calls.push(`render:${missionId}`);
      return { revision, htmlPath: '/tmp/rev-0002.html' };
    },
    openPlan: async (missionId) => {
      calls.push(`open:${missionId}`);
      return { revision, htmlPath: '/tmp/rev-0002.html', lavishOutput: 'opened' };
    },
    pollPlan: async (missionId) => {
      calls.push(`poll:${missionId}`);
      return { revision, htmlPath: '/tmp/rev-0002.html', feedback: 'change the title' };
    },
    approvePlan: async (input) => {
      calls.push(`approve:${input.missionId}:${input.contentHash}`);
      return { revision: approved, contractPath: '/repo/.mnfs/missions/MIS-001/plan.json' };
    },
    materializePlan: async (missionId) => {
      calls.push(`materialize:${missionId}`);
      return { revision: approved, contractPath: '/repo/.mnfs/missions/MIS-001/plan.json' };
    },
  });

  const commands: readonly (readonly string[])[] = [
    ['plan', 'save', '--mission', 'MIS-001', '--input', '/tmp/plan.json', '--json'],
    ['plan', 'show', '--mission', 'MIS-001', '--json'],
    ['plan', 'render', '--mission', 'MIS-001', '--json'],
    ['plan', 'open', '--mission', 'MIS-001', '--json'],
    ['plan', 'poll', '--mission', 'MIS-001', '--json'],
    ['plan', 'approve', '--mission', 'MIS-001', '--hash', CONTENT_HASH, '--json'],
    ['plan', 'materialize', '--mission', 'MIS-001', '--json'],
  ];

  for (const command of commands) {
    const result = await runCli(command, dependencies);
    assert.equal(result.exitCode, 0, result.stderr);
    assert.doesNotThrow(() => JSON.parse(result.stdout));
  }
  assert.equal(calls.length, 7);
});

test('human planning output contains the exact hash and a concrete next action', async () => {
  const result = await runCli(
    ['plan', 'save', '--mission', 'MIS-001', '--input', '/tmp/plan.json'],
    baseDependencies({ savePlan: () => planRevision() }),
  );

  assert.equal(result.exitCode, 0);
  assert.match(result.stdout, new RegExp(CONTENT_HASH));
  assert.match(result.stdout, /Next: mnfs plan render --mission MIS-001/);
});

test('planning command failures preserve stable MNFS error codes', async () => {
  const result = await runCli(
    ['plan', 'save', '--mission', 'MIS-001', '--input', '/tmp/plan.json'],
    baseDependencies({
      savePlan: () => {
        throw new MnfsError('PLAN_INVALID', 'plan.title must be present.');
      },
    }),
  );

  assert.equal(result.exitCode, 1);
  assert.equal(result.stdout, '');
  assert.match(result.stderr, /^PLAN_INVALID: plan\.title must be present\./);
});
