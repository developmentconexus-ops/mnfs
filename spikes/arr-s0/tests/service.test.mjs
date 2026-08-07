import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { sha256Bytes, writeCanonicalJsonArtifact } from '../src/artifacts.mjs';
import { parseExecutionAuthorizationToken } from '../src/execution-authority.mjs';
import { createInitialRunState } from '../src/model.mjs';
import { preflightS0, reportS0, runS0 } from '../src/service.mjs';

const RUN_ID = 'arr-s0-20260807t120000000z-a1b2c3';
const PLAN_BLOB = '3e78445fcbcca360f612edefd025c6cb0f84f8e5';
const SOURCE = { commitSha: 'a'.repeat(40), treeSha: 'b'.repeat(40) };
const CONTRACT_HASH = `sha256:${'d'.repeat(64)}`;
const EXECUTION_TOKEN = `MNFS_AUTHORIZE_ARR_S0_EXECUTE plan_blob=${PLAN_BLOB} contract_sha256=${CONTRACT_HASH} base_sha=${SOURCE.commitSha} verify_run=31216915662 scope=canonical-host-probe-only`;
const EXECUTION_AUTHORIZATION = parseExecutionAuthorizationToken(
  EXECUTION_TOKEN,
  {
    planGitBlob: PLAN_BLOB,
    contractHash: CONTRACT_HASH,
    baseCommitSha: SOURCE.commitSha,
  },
);
const EXECUTION_AUTHORIZATION_EVIDENCE = {
  gate: EXECUTION_AUTHORIZATION.gate,
  planGitBlob: EXECUTION_AUTHORIZATION.planGitBlob,
  baseCommitSha: EXECUTION_AUTHORIZATION.baseCommitSha,
  contractHash: EXECUTION_AUTHORIZATION.contractHash,
  verificationRunId: EXECUTION_AUTHORIZATION.verificationRunId,
  tokenHash: EXECUTION_AUTHORIZATION.tokenHash,
};
const IDENTITIES = {
  plan: { version: '0.2.0', hash: `sha256:${'c'.repeat(64)}` },
  contract: { version: '1.0.0', hash: CONTRACT_HASH },
  executionAuthorization: EXECUTION_AUTHORIZATION,
};
const CAPABILITY_IDS = [
  'HOST-WSL2',
  'HOST-LINUX-FS',
  'HOST-CPU-VIRT',
  'HOST-KVM-DEVICE',
  'HOST-KVM-RW-OPEN',
  'HOST-USERNS',
  'HOST-SECCOMP-CONFIG',
  'HOST-LANDLOCK-CONFIG',
  'HOST-FUSE-DEVICE',
  'HOST-FUSE-TOOLS',
  'HOST-CGROUP-V2',
  'HOST-DOCKER-CLI',
  'HOST-DOCKER-DAEMON',
  'HOST-BWRAP',
  'HOST-GIT-READONLY',
];

function decisiveObservations() {
  return CAPABILITY_IDS.map((id) => ({
    id,
    state: id === 'HOST-KVM-DEVICE' ? 'ABSENT' : id === 'HOST-KVM-RW-OPEN' ? 'ABSENT' : id.startsWith('HOST-DOCKER') || id === 'HOST-BWRAP' || id === 'HOST-FUSE-TOOLS' ? 'PRESENT' : 'SUPPORTED',
    rationale: `fixture ${id}`,
    artifactRefs: [],
  }));
}

function preflightFacts(overrides = {}) {
  return {
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
    linuxFilesystemSupported: true,
    stateRootFilesystemSupported: true,
    repository: { source: SOURCE, clean: true },
    requiredReadsAvailable: true,
    ...overrides,
  };
}

test('preflight is read-only and requires canonical identity, clean repo, Linux-owned roots and Node 24.18+', async () => {
  const stateRoot = await mkdtemp(path.join(tmpdir(), 'mnfs-arr-s0-preflight-'));
  try {
    const ok = await preflightS0({
      repoRoot: '/home/example/src/mnfs',
      stateRoot,
      identities: IDENTITIES,
      inspect: async () => preflightFacts(),
    });
    assert.equal(ok.ok, true);
    assert.ok(ok.checks.every((check) => check.ok));

    const dirty = await preflightS0({
      repoRoot: '/home/example/src/mnfs',
      stateRoot,
      identities: IDENTITIES,
      inspect: async () => preflightFacts({ repository: { source: SOURCE, clean: false } }),
    });
    assert.equal(dirty.ok, false);
    assert.ok(dirty.checks.some((check) => check.id === 'checkoutClean' && !check.ok));
  } finally {
    await rm(stateRoot, { recursive: true, force: true });
  }
});

test('preflight fails closed when the state-root filesystem is not explicitly reviewed', async () => {
  const stateRoot = await mkdtemp(path.join(tmpdir(), 'mnfs-arr-s0-state-root-fs-'));
  try {
    for (const stateRootFilesystemSupported of [false, undefined]) {
      const result = await preflightS0({
        repoRoot: '/home/example/src/mnfs',
        stateRoot,
        identities: IDENTITIES,
        inspect: async () => preflightFacts({ stateRootFilesystemSupported }),
      });
      assert.equal(result.ok, false);
      assert.ok(result.checks.some((check) => check.id === 'stateRootFilesystem' && check.ok === false));
    }
  } finally {
    await rm(stateRoot, { recursive: true, force: true });
  }
});

test('deterministic run persists lifecycle, execution authority, Evidence manifest, classes and mechanical Verdict', async () => {
  const stateRoot = await mkdtemp(path.join(tmpdir(), 'mnfs-arr-s0-run-'));
  try {
    const result = await runS0({
      repoRoot: '/home/example/src/mnfs',
      stateRoot,
      runId: RUN_ID,
      identities: IDENTITIES,
      preflight: async () => ({ ok: true, facts: preflightFacts(), checks: [] }),
      collect: async ({ capture }) => {
        const raw = await capture.bytes('fixture-raw', 'raw/fixture.bin', Buffer.from('fixture host bytes\n'));
        const observations = decisiveObservations().map((record) => ({ ...record, artifactRefs: [raw.id] }));
        return {
          hostIdentity: preflightFacts().hostIdentity,
          source: SOURCE,
          checkoutClean: true,
          observations,
          limitations: [],
        };
      },
    });

    assert.equal(result.runId, RUN_ID);
    assert.equal(result.phase, 'FINALIZED');
    assert.equal(result.verdict.status, 'ACCEPT');
    assert.equal(result.source.commitSha, SOURCE.commitSha);
    assert.deepEqual(result.executionAuthorization, EXECUTION_AUTHORIZATION_EVIDENCE);
    assert.equal(Object.hasOwn(result.executionAuthorization, 'operatorToken'), false);
    assert.equal(result.capabilities.length, CAPABILITY_IDS.length);
    assert.equal(result.capabilityClasses.length, 5);
    assert.match(result.manifest.sha256, /^sha256:[a-f0-9]{64}$/u);

    const report = await reportS0({ runId: RUN_ID, stateRoot });
    assert.equal(report.complete, true);
    assert.equal(report.phase, 'FINALIZED');
    assert.equal(report.verdict.status, 'ACCEPT');
    assert.deepEqual(report.executionAuthorization, EXECUTION_AUTHORIZATION_EVIDENCE);
    assert.equal(report.integrity.ok, true);
  } finally {
    await rm(stateRoot, { recursive: true, force: true });
  }
});

test('report detects post-recording artifact tamper and derives REJECT without trusting stored Verdict', async () => {
  const stateRoot = await mkdtemp(path.join(tmpdir(), 'mnfs-arr-s0-tamper-'));
  try {
    const result = await runS0({
      repoRoot: '/home/example/src/mnfs',
      stateRoot,
      runId: RUN_ID,
      identities: IDENTITIES,
      preflight: async () => ({ ok: true, facts: preflightFacts(), checks: [] }),
      collect: async ({ capture }) => {
        const raw = await capture.bytes('fixture-raw', 'raw/fixture.bin', Buffer.from('original\n'));
        return {
          hostIdentity: preflightFacts().hostIdentity,
          source: SOURCE,
          checkoutClean: true,
          observations: decisiveObservations().map((record) => ({ ...record, artifactRefs: [raw.id] })),
          limitations: [],
        };
      },
    });
    const runRoot = path.dirname(path.dirname(result.resultPath));
    await writeFile(path.join(runRoot, 'raw/fixture.bin'), 'tampered\n', 'utf8');
    const report = await reportS0({ runId: RUN_ID, stateRoot });
    assert.equal(report.integrity.ok, false);
    assert.equal(report.verdict.status, 'REJECT');
    assert.ok(report.verdict.reasons.some((reason) => reason.includes('evidenceTampered')));
  } finally {
    await rm(stateRoot, { recursive: true, force: true });
  }
});

test('report identifies an incomplete CREATED run and never invents a Verdict', async () => {
  const stateRoot = await mkdtemp(path.join(tmpdir(), 'mnfs-arr-s0-incomplete-'));
  try {
    const runRoot = path.join(stateRoot, 'spikes', 'arr-s0', RUN_ID);
    await mkdir(runRoot, { recursive: true });
    const state = createInitialRunState({
      runId: RUN_ID,
      source: SOURCE,
      plan: IDENTITIES.plan,
      contract: IDENTITIES.contract,
      executionAuthorization: EXECUTION_AUTHORIZATION_EVIDENCE,
    });
    await writeCanonicalJsonArtifact(runRoot, 'state/created.json', state);
    const report = await reportS0({ runId: RUN_ID, stateRoot });
    assert.equal(report.complete, false);
    assert.equal(report.phase, 'CREATED');
    assert.deepEqual(report.state.executionAuthorization, EXECUTION_AUTHORIZATION_EVIDENCE);
    assert.equal(report.verdict, null);
  } finally {
    await rm(stateRoot, { recursive: true, force: true });
  }
});

test('run refuses to start when preflight is not safe', async () => {
  const stateRoot = await mkdtemp(path.join(tmpdir(), 'mnfs-arr-s0-blocked-'));
  try {
    await assert.rejects(
      () => runS0({
        repoRoot: '/home/example/src/mnfs',
        stateRoot,
        runId: RUN_ID,
        identities: IDENTITIES,
        preflight: async () => ({ ok: false, checks: [{ id: 'checkoutClean', ok: false }], facts: preflightFacts() }),
        collect: async () => assert.fail('collector must not run'),
      }),
      /ARR-S0 preflight blocked/u,
    );
  } finally {
    await rm(stateRoot, { recursive: true, force: true });
  }
});
