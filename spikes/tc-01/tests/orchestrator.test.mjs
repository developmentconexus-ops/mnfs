import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { canonicalJson, sha256Bytes } from '../src/canonical-json.mjs';
import {
  cleanupTc01,
  generateTc01RunId,
  reportTc01,
  runTc01,
} from '../src/orchestrator.mjs';

const HASH_A = `sha256:${'a'.repeat(64)}`;
const HASH_B = `sha256:${'b'.repeat(64)}`;

async function temporaryRoot(t) {
  const root = await mkdtemp(join(tmpdir(), 'mnfs-tc01-orchestrator-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}

function provenance() {
  return {
    schemaVersion: 1,
    environment: 'WSL2',
    ubuntuRelease: '24.04',
    kernelRelease: '6.6.87.2-microsoft-standard-WSL2',
    nodeVersion: 'v24.18.0',
    gitVersion: '2.54.0',
    treehouseVersion: '2.1.1',
    treehouseExecutable: '/usr/local/bin/treehouse',
    treehouseExecutableHash: HASH_A,
    capabilities: {
      leaseJson: true,
      statusJson: true,
      conditionalLeaseId: true,
      conditionalHolder: true,
    },
    capturedAt: '2026-08-04T12:00:00Z',
  };
}

function scenarios(result = 'PASS') {
  return Array.from({ length: 15 }, (_, index) => ({
    scenarioId: `TC01-S${String(index + 1).padStart(2, '0')}`,
    result,
    expected: 'deterministic expected behavior',
    observations: {},
    rationale: `${result} scenario`,
    stdoutRef: `commands/TC01-S${String(index + 1).padStart(2, '0')}/command-001/stdout.bin`,
    stderrRef: `commands/TC01-S${String(index + 1).padStart(2, '0')}/command-001/stderr.bin`,
    stdoutHash: HASH_A,
    stderrHash: HASH_B,
  }));
}

function fixtureAt(runRoot, runId) {
  return {
    schemaVersion: 1,
    runId,
    runRoot,
    sourceRepo: join(runRoot, 'source-repo'),
    poolRoot: join(runRoot, 'pool-root'),
    artifactsRoot: join(runRoot, 'artifacts'),
    snapshotsRoot: join(runRoot, 'snapshots'),
    fakeHome: join(runRoot, 'fake-home'),
    gitWrapperRoot: join(runRoot, 'git-wrapper'),
    holder: `mnfs-tc01-${runId}`,
    initialCommit: 'a'.repeat(40),
    createdAt: '2026-08-04T12:00:00Z',
  };
}

function acceptedVerdict(value = 'ACCEPT') {
  return {
    schemaVersion: 1,
    verdict: value,
    rationale: `${value} rationale`,
    scenarioCount: 15,
    scenarioIds: scenarios().map((record) => record.scenarioId),
    missingScenarioIds: [],
    failures: value === 'REJECT' ? [{ scenarioId: 'TC01-S08', result: 'FAIL', rationale: 'fencing failed' }] : [],
    blocked: [],
    limitations: [],
    bindings: {
      treehouseExecutableHash: HASH_A,
      treehouseVersion: '2.1.1',
      gitVersion: '2.54.0',
      kernelRelease: '6.6.87.2-microsoft-standard-WSL2',
      ubuntuRelease: '24.04',
      commandShapeHash: HASH_A,
      scenariosHash: HASH_B,
    },
    cleanup: { state: 'NOT_REQUESTED', rationale: 'Cleanup has not been requested.' },
  };
}

test('generates one canonical UTC run id with an exact random suffix', () => {
  const runId = generateTc01RunId({
    now: new Date('2026-08-04T12:34:56.789Z'),
    randomBytes: () => Buffer.from('a1b2c3d4', 'hex'),
  });
  assert.equal(runId, 'tc01-20260804-123456-a1b2c3d4');
});

test('run creates, finalizes and reports one deterministic TC-01 execution', async (t) => {
  const stateRoot = await temporaryRoot(t);
  const runId = 'tc01-20260804-123456-a1b2c3d4';
  const runRoot = join(stateRoot, 'fixtures', 'tc-01', runId);
  const fixture = fixtureAt(runRoot, runId);
  const calls = [];
  const records = scenarios();
  const environment = provenance();
  const manifest = {
    schemaVersion: 1,
    runId,
    scenariosHash: HASH_B,
  };

  const summary = await runTc01(
    { runId, stateRoot },
    {
      resolveStateRoot() {
        calls.push('resolve-state');
        return stateRoot;
      },
      async createFixture() {
        calls.push('create-fixture');
        await Promise.all([
          mkdir(fixture.sourceRepo, { recursive: true }),
          mkdir(fixture.poolRoot, { recursive: true }),
          mkdir(fixture.artifactsRoot, { recursive: true }),
          mkdir(fixture.snapshotsRoot, { recursive: true }),
          mkdir(fixture.fakeHome, { recursive: true }),
          mkdir(fixture.gitWrapperRoot, { recursive: true }),
        ]);
        return fixture;
      },
      async createEvidenceStore() {
        calls.push('create-evidence');
        return {
          async writeEnvironment(value) {
            calls.push('write-environment');
            assert.deepEqual(value.provenance, environment);
          },
          async finalize() {
            calls.push('finalize-evidence');
          },
        };
      },
      async createRuntime() {
        calls.push('create-runtime');
        return {
          commandShapeHash: HASH_A,
          async discoverProvenance() {
            calls.push('discover-provenance');
            return environment;
          },
          async runScenarios() {
            calls.push('run-scenarios');
            return records;
          },
        };
      },
      async loadFinalizedRun() {
        calls.push('load-finalized');
        return {
          fixture,
          provenance: environment,
          scenarios: records,
          scenariosHash: manifest.scenariosHash,
          commandShapeHash: HASH_A,
          cleanup: { state: 'NOT_REQUESTED', rationale: 'Cleanup has not been requested.' },
        };
      },
      deriveVerdict() {
        calls.push('derive-verdict');
        return acceptedVerdict('ACCEPT');
      },
      renderReport() {
        calls.push('render-report');
        return '# deterministic TC-01 report\n';
      },
    },
  );

  assert.deepEqual(calls, [
    'resolve-state',
    'create-fixture',
    'create-evidence',
    'create-runtime',
    'discover-provenance',
    'write-environment',
    'run-scenarios',
    'finalize-evidence',
    'load-finalized',
    'derive-verdict',
    'render-report',
  ]);
  assert.equal(summary.runId, runId);
  assert.equal(summary.runRoot, runRoot);
  assert.equal(summary.verdict, 'ACCEPT');
  assert.equal(summary.reportPath, join(fixture.artifactsRoot, 'report.md'));
  assert.equal(summary.verdictPath, join(fixture.artifactsRoot, 'verdict.json'));
  assert.match(summary.nextAction, /cleanup --run-root/u);
  assert.equal(await readFile(summary.reportPath, 'utf8'), '# deterministic TC-01 report\n');
  assert.equal(JSON.parse(await readFile(summary.verdictPath, 'utf8')).verdict, 'ACCEPT');
});

test('a material Verdict preserves the fixture and emits a cleanup-blocked next action', async (t) => {
  const stateRoot = await temporaryRoot(t);
  const runId = 'tc01-20260804-123456-a1b2c3d4';
  const runRoot = join(stateRoot, 'fixtures', 'tc-01', runId);
  const fixture = fixtureAt(runRoot, runId);
  const records = scenarios();
  records[7] = { ...records[7], result: 'FAIL', rationale: 'stale Lease ID released current work' };

  const summary = await runTc01(
    { runId, stateRoot },
    {
      resolveStateRoot: () => stateRoot,
      async createFixture() {
        await mkdir(fixture.artifactsRoot, { recursive: true });
        return fixture;
      },
      async createEvidenceStore() {
        return { async writeEnvironment() {}, async finalize() {} };
      },
      async createRuntime() {
        return {
          commandShapeHash: HASH_A,
          async discoverProvenance() { return provenance(); },
          async runScenarios() { return records; },
        };
      },
      async loadFinalizedRun() {
        return {
          fixture,
          provenance: provenance(),
          scenarios: records,
          scenariosHash: HASH_B,
          commandShapeHash: HASH_A,
          cleanup: { state: 'NOT_REQUESTED', rationale: 'Cleanup has not been requested.' },
        };
      },
      deriveVerdict: () => acceptedVerdict('REJECT'),
      renderReport: () => '# rejected\n',
    },
  );

  assert.equal(summary.verdict, 'REJECT');
  assert.equal(summary.cleanup.state, 'PRESERVED');
  assert.match(summary.nextAction, /cleanup is blocked/iu);
  assert.equal(await readFile(join(fixture.artifactsRoot, 'cleanup.json'), 'utf8').then(JSON.parse).then((value) => value.state), 'PRESERVED');
});

test('report verifies finalized hashes before parsing or rendering scenario data', async (t) => {
  const runRoot = await temporaryRoot(t);
  const runId = 'tc01-20260804-123456-a1b2c3d4';
  const fixture = fixtureAt(runRoot, runId);
  await Promise.all([
    mkdir(fixture.sourceRepo),
    mkdir(fixture.poolRoot),
    mkdir(fixture.artifactsRoot),
    mkdir(fixture.snapshotsRoot),
    mkdir(fixture.fakeHome),
    mkdir(fixture.gitWrapperRoot),
  ]);
  await writeFile(join(runRoot, 'fixture.json'), `${JSON.stringify(fixture)}\n`, 'utf8');
  const environmentBytes = Buffer.from(`${canonicalJson({ schemaVersion: 1 })}\n`);
  const originalScenarios = Buffer.from('[]\n');
  await writeFile(join(fixture.artifactsRoot, 'environment.json'), environmentBytes);
  await writeFile(join(fixture.artifactsRoot, 'scenarios.json'), originalScenarios);
  await writeFile(join(fixture.artifactsRoot, 'manifest.json'), `${canonicalJson({
    schemaVersion: 1,
    runId,
    finalizedAt: '2026-08-04T12:00:00Z',
    environmentRef: 'environment.json',
    environmentHash: sha256Bytes(environmentBytes),
    scenariosRef: 'scenarios.json',
    scenariosHash: sha256Bytes(originalScenarios),
    scenarioCount: 15,
    scenarioIds: scenarios().map((record) => record.scenarioId),
  })}\n`);
  await writeFile(join(fixture.artifactsRoot, 'scenarios.json'), '[{"tampered":true}]\n');

  await assert.rejects(
    reportTc01({ runRoot }),
    (error) => error?.code === 'TC01_EVIDENCE_INVALID' && /hash/iu.test(error.message),
  );
});

test('cleanup fails closed for live, dirty, changed or unrecognized resources', async (t) => {
  const runRoot = await temporaryRoot(t);
  const runId = 'tc01-20260804-123456-a1b2c3d4';
  const fixture = fixtureAt(runRoot, runId);
  await mkdir(fixture.artifactsRoot, { recursive: true });
  let removeCalls = 0;

  for (const blocker of ['LIVE_LEASE', 'DIRTY_WORKTREE', 'SOURCE_CHANGED', 'UNRECOGNIZED_RUN_PATH']) {
    await assert.rejects(
      cleanupTc01(
        { runRoot },
        {
          async loadFinalizedRun() {
            return {
              fixture,
              provenance: provenance(),
              scenarios: scenarios(),
              scenariosHash: HASH_B,
              commandShapeHash: HASH_A,
              cleanup: { state: 'READY_FOR_CLEANUP', rationale: 'Safe Verdict permits cleanup review.' },
            };
          },
          deriveVerdict: () => acceptedVerdict('ACCEPT'),
          async assessCleanupSafety() {
            return { safe: false, blockers: [blocker] };
          },
          async removeEphemeralPaths() {
            removeCalls += 1;
          },
        },
      ),
      (error) => error?.code === 'TC01_CLEANUP_BLOCKED' && error.details?.blockers?.includes(blocker),
      blocker,
    );
  }
  assert.equal(removeCalls, 0);
});
