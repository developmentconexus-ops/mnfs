import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { runTc01 } from '../src/orchestrator.mjs';

const HASH = `sha256:${'a'.repeat(64)}`;
const RUN_ID = 'tc01-20260804-123456-a1b2c3d4';

function fixtureAt(runRoot) {
  return {
    schemaVersion: 1,
    runId: RUN_ID,
    runRoot,
    sourceRepo: join(runRoot, 'source-repo'),
    poolRoot: join(runRoot, 'pool-root'),
    artifactsRoot: join(runRoot, 'artifacts'),
    snapshotsRoot: join(runRoot, 'snapshots'),
    fakeHome: join(runRoot, 'fake-home'),
    gitWrapperRoot: join(runRoot, 'git-wrapper'),
    holder: `mnfs-tc01-${RUN_ID}`,
    initialCommit: 'a'.repeat(40),
    createdAt: '2026-08-04T12:00:00Z',
  };
}

function blockedScenarios() {
  return Array.from({ length: 15 }, (_, index) => ({
    scenarioId: `TC01-S${String(index + 1).padStart(2, '0')}`,
    result: 'BLOCKED',
    expected: 'blocked conformance proof',
    observations: index === 0 ? { error: { code: 'TC01_NOT_WSL2' } } : { blockedBy: 'TC01-S01' },
    rationale: index === 0 ? 'Canonical WSL2 provenance is unavailable.' : 'S01 did not establish provenance.',
    stdoutRef: `commands/TC01-S${String(index + 1).padStart(2, '0')}/internal-observation/stdout.bin`,
    stderrRef: `commands/TC01-S${String(index + 1).padStart(2, '0')}/internal-observation/stderr.bin`,
    stdoutHash: HASH,
    stderrHash: HASH,
  }));
}

test('a blocking provenance failure becomes finalized S01 BLOCKED Evidence instead of aborting the run', async (t) => {
  const stateRoot = await mkdtemp(join(tmpdir(), 'mnfs-tc01-blocked-run-'));
  t.after(() => rm(stateRoot, { recursive: true, force: true }));
  const fixture = fixtureAt(join(stateRoot, 'fixtures', 'tc-01', RUN_ID));
  const records = blockedScenarios();
  const calls = [];
  let blockedProvenance;

  const summary = await runTc01(
    { runId: RUN_ID, stateRoot },
    {
      resolveStateRoot: () => stateRoot,
      async createFixture() {
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
        return {
          async writeEnvironment(value) {
            calls.push('write-environment');
            blockedProvenance = value.provenance;
          },
          async finalize() { calls.push('finalize'); },
        };
      },
      async createRuntime() {
        return {
          commandShapeHash: HASH,
          expectedEnvironmentKeySets: [['PATH']],
          async discoverProvenance() {
            calls.push('discover');
            const error = new Error('Canonical WSL2 kernel was not observed.');
            Object.defineProperty(error, 'code', { value: 'TC01_NOT_WSL2', enumerable: true });
            throw error;
          },
          async runScenarios({ provenance }) {
            calls.push('run-scenarios');
            assert.equal(provenance.status, 'BLOCKED');
            assert.equal(provenance.error.code, 'TC01_NOT_WSL2');
            return records;
          },
        };
      },
      async loadFinalizedRun() {
        return {
          fixture,
          provenance: blockedProvenance,
          scenarios: records,
          scenariosHash: HASH,
          commandShapeHash: HASH,
          cleanup: { state: 'NOT_REQUESTED', rationale: 'Cleanup has not been requested.' },
        };
      },
      deriveVerdict() {
        return {
          schemaVersion: 1,
          verdict: 'BLOCKED',
          rationale: 'Required TC-01 Evidence is blocked.',
          scenarioCount: 15,
          scenarioIds: records.map((record) => record.scenarioId),
          missingScenarioIds: [],
          failures: [],
          blocked: [{ scenarioId: 'TC01-S01', result: 'BLOCKED', rationale: 'Canonical WSL2 provenance is unavailable.' }],
          limitations: [],
          bindings: { commandShapeHash: HASH, scenariosHash: HASH },
          cleanup: { state: 'NOT_REQUESTED', rationale: 'Cleanup has not been requested.' },
        };
      },
      renderReport: () => '# blocked TC-01 report\n',
    },
  );

  assert.deepEqual(calls, ['discover', 'write-environment', 'run-scenarios', 'finalize']);
  assert.equal(summary.verdict, 'BLOCKED');
  assert.equal(summary.cleanup.state, 'PRESERVED');
  assert.match(summary.nextAction, /cleanup is blocked/iu);
});
