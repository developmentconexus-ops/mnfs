import assert from 'node:assert/strict';
import test from 'node:test';
import { buildReportView, renderHumanReport } from '../src/report.mjs';

const fixture = {
  runId: 'arr-s0-20260807t120000000z-a1b2c3',
  source: { commitSha: 'a'.repeat(40), treeSha: 'b'.repeat(40) },
  hostIdentity: {
    platform: 'linux',
    isWsl2: true,
    kernelRelease: '6.18.33.2-microsoft-standard-WSL2',
    distroId: 'ubuntu',
    distroVersion: '26.04',
    architecture: 'x86_64',
    nodeVersion: 'v24.18.0',
    gitVersion: '2.51.0',
  },
  capabilities: [
    { id: 'HOST-KVM-DEVICE', state: 'ABSENT', rationale: 'fixture', artifactRefs: ['raw-1'] },
  ],
  capabilityClasses: [
    { classId: 'CLASS-MICROVM-KVM', eligibility: 'BLOCKED_BY_HOST', reasons: ['HOST-KVM-DEVICE absent'], relevantCapabilities: ['HOST-KVM-DEVICE'] },
  ],
  verdict: { status: 'ACCEPT', reasons: ['decisive Evidence'] },
  limitations: ['KVM unavailable'],
  manifest: { path: 'manifest/evidence.json', sha256: `sha256:${'c'.repeat(64)}`, sizeBytes: 100 },
};

test('JSON report view contains only governed S0 fields', () => {
  const view = buildReportView(fixture);
  assert.deepEqual(Object.keys(view), [
    'runId', 'source', 'hostIdentity', 'capabilities', 'capabilityClasses', 'verdict', 'limitations', 'artifactManifestHash', 'nextGovernedAction',
  ]);
  assert.equal(view.artifactManifestHash, fixture.manifest.sha256);
  assert.match(view.nextGovernedAction, /GATE-S0-EXECUTE|S1\/S2 planning/u);
  assert.equal(JSON.stringify(view).includes('HTTP_PROXY'), false);
});

test('human report is deterministic and never claims a named candidate is accepted', () => {
  const first = renderHumanReport(fixture);
  const second = renderHumanReport(structuredClone(fixture));
  assert.equal(first, second);
  assert.match(first, /ARR-S0 Host Capability Report/u);
  assert.match(first, /HOST-KVM-DEVICE\s+ABSENT/u);
  assert.match(first, /CLASS-MICROVM-KVM\s+BLOCKED_BY_HOST/u);
  assert.match(first, /Verdict: ACCEPT/u);
  for (const forbidden of ['nono accepted', 'BoxLite accepted', 'smolvm accepted', 'Sandbox Runtime accepted']) {
    assert.equal(first.includes(forbidden), false);
  }
});
