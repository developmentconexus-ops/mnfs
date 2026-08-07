import assert from 'node:assert/strict';
import test from 'node:test';
import { buildReportView, renderHumanReport } from '../src/report.mjs';

const fixture = {
  runId: 'arr-s0-20260807t120000000z-a1b2c3',
  source: { commitSha: 'a'.repeat(40), treeSha: 'b'.repeat(40) },
  executionAuthorization: {
    gate: 'GATE-S0-EXECUTE',
    baseCommitSha: 'a'.repeat(40),
    contractHash: `sha256:${'d'.repeat(64)}`,
    verificationRunId: 31216915662,
    tokenHash: `sha256:${'e'.repeat(64)}`,
  },
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

test('JSON report view contains governed S0 authority and Evidence fields without a raw token', () => {
  const view = buildReportView(fixture);
  assert.deepEqual(Object.keys(view), [
    'runId', 'source', 'executionAuthorization', 'hostIdentity', 'capabilities', 'capabilityClasses', 'verdict', 'limitations', 'artifactManifestHash', 'nextGovernedAction',
  ]);
  assert.deepEqual(view.executionAuthorization, fixture.executionAuthorization);
  assert.equal(Object.hasOwn(view.executionAuthorization, 'operatorToken'), false);
  assert.equal(view.artifactManifestHash, fixture.manifest.sha256);
  assert.match(view.nextGovernedAction, /GATE-S0-EXECUTE|S1\/S2 planning/u);
  assert.equal(JSON.stringify(view).includes('HTTP_PROXY'), false);
  assert.equal(JSON.stringify(view).includes('MNFS_AUTHORIZE_ARR_S0_EXECUTE'), false);
});

test('human report is deterministic, identifies hashed execution authority, and never claims a named candidate is accepted', () => {
  const first = renderHumanReport(fixture);
  const second = renderHumanReport(structuredClone(fixture));
  assert.equal(first, second);
  assert.match(first, /ARR-S0 Host Capability Report/u);
  assert.match(first, /GATE-S0-EXECUTE/u);
  assert.match(first, new RegExp(fixture.executionAuthorization.tokenHash, 'u'));
  assert.match(first, /HOST-KVM-DEVICE\s+ABSENT/u);
  assert.match(first, /CLASS-MICROVM-KVM\s+BLOCKED_BY_HOST/u);
  assert.match(first, /Verdict: ACCEPT/u);
  assert.doesNotMatch(first, /MNFS_AUTHORIZE_ARR_S0_EXECUTE/u);
  for (const forbidden of ['nono accepted', 'BoxLite accepted', 'smolvm accepted', 'Sandbox Runtime accepted']) {
    assert.equal(first.includes(forbidden), false);
  }
});
