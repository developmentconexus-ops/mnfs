import assert from 'node:assert/strict';
import test from 'node:test';

import { deriveTc01Verdict, renderTc01Report } from '../src/report.mjs';

const HASH = `sha256:${'a'.repeat(64)}`;

function blockedProvenance() {
  return {
    schemaVersion: 1,
    status: 'BLOCKED',
    environment: null,
    ubuntuRelease: null,
    kernelRelease: null,
    nodeVersion: 'v24.18.0',
    gitVersion: null,
    treehouseVersion: null,
    treehouseExecutable: null,
    treehouseExecutableHash: null,
    capabilities: {
      leaseJson: false,
      statusJson: false,
      conditionalLeaseId: false,
      conditionalHolder: false,
    },
    capturedAt: '2026-08-04T12:00:00Z',
    error: {
      code: 'TC01_NOT_WSL2',
      message: 'Canonical WSL2 kernel was not observed.',
    },
  };
}

function records() {
  return Array.from({ length: 15 }, (_, index) => {
    const scenarioId = `TC01-S${String(index + 1).padStart(2, '0')}`;
    return {
      scenarioId,
      result: 'BLOCKED',
      expected: 'Canonical conformance proof.',
      observations: index === 0
        ? { error: { code: 'TC01_NOT_WSL2' } }
        : { blockedBy: 'TC01-S01' },
      rationale: index === 0
        ? 'Canonical WSL2 provenance was not observed.'
        : 'S01 did not establish required provenance.',
      stdoutRef: `commands/${scenarioId}/internal-observation/stdout.bin`,
      stderrRef: `commands/${scenarioId}/internal-observation/stderr.bin`,
      stdoutHash: HASH,
      stderrHash: HASH,
    };
  });
}

test('BLOCKED provenance produces an honest report with no invented version or executable hash', () => {
  const input = {
    provenance: blockedProvenance(),
    scenarios: records(),
    scenariosHash: HASH,
    commandShapeHash: HASH,
    cleanup: { state: 'PRESERVED', rationale: 'Blocked Evidence is preserved.' },
  };

  const verdict = deriveTc01Verdict(input);
  const report = renderTc01Report(input);

  assert.equal(verdict.verdict, 'BLOCKED');
  assert.equal(verdict.bindings.treehouseExecutableHash, null);
  assert.equal(verdict.bindings.treehouseVersion, null);
  assert.match(report, /TC01_NOT_WSL2/u);
  assert.match(report, /NOT_OBSERVED/u);
  assert.doesNotMatch(report, /undefined/u);
  assert.doesNotMatch(report, /sha256:0{64}/u);
});
