import assert from 'node:assert/strict';
import test from 'node:test';

import { runCli, type CliDependencies, type CliResult } from '../../src/cli/main.js';
import { MnfsError, type MnfsErrorCode } from '../../src/domain/errors.js';
import type { Attempt, Lease, WriteTrack } from '../../src/execution/model.js';
import type { EnvironmentReport } from '../../src/runtime/environment.js';
import type { RecoveryReport } from '../../src/services/recovery-service.js';

const CONTRACT_HASH = `sha256:${'a'.repeat(64)}`;
const SOURCE_FINGERPRINT = `sha256:${'b'.repeat(64)}`;
const REPORT_HASH = `sha256:${'c'.repeat(64)}`;
const COLLECTION_HASH = `sha256:${'d'.repeat(64)}`;
const BASE_COMMIT = '1'.repeat(40);
const BASE_TREE = '2'.repeat(40);
const TRACK_OPEN_KEY = 'track:open:MIS-002:M01:F01:base-1';
const LEASE_GRANT_KEY = 'lease:grant:WT-001:A01:g1';
const LEASE_RELEASE_KEY = 'lease:release:LSE-001:v2';
const CREATED_AT = '2026-08-05T18:00:00.000Z';
const UPDATED_AT = '2026-08-05T18:01:00.000Z';

const READY_REPORT: EnvironmentReport = {
  schemaVersion: 1,
  ready: true,
  environment: 'wsl2',
  nodeVersion: '24.18.0',
  cwd: '/home/leandro/src/mnfs',
  tools: [],
  problems: [],
  missingRequired: [],
  missingOptional: [],
};

const TRACK: WriteTrack = {
  id: 'WT-001',
  missionId: 'MIS-002',
  milestoneQualifiedId: 'MIS-002/M01',
  featureQualifiedId: 'MIS-002/M01/F01',
  contractHash: CONTRACT_HASH,
  status: 'ACTIVE',
  version: 1,
  createdAt: CREATED_AT,
  updatedAt: CREATED_AT,
};

const ATTEMPT: Attempt = {
  id: 'WT-001/A01',
  writeTrackId: TRACK.id,
  ordinal: 1,
  contractHash: CONTRACT_HASH,
  gitObjectFormat: 'sha1',
  baseCommitSha: BASE_COMMIT,
  sourceStatus: 'READY',
  sourcePath: '/home/leandro/.local/state/mnfs/repos/repo/execution-sources/WT-001/WT-001/A01/source',
  sourceFingerprint: SOURCE_FINGERPRINT,
  status: 'OPEN',
  version: 2,
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

const ACTIVE_LEASE: Lease = {
  id: 'LSE-001',
  writeTrackId: TRACK.id,
  attemptId: ATTEMPT.id,
  contractHash: CONTRACT_HASH,
  generation: 1,
  status: 'ACTIVE',
  grantIdempotencyKey: LEASE_GRANT_KEY,
  grantInputHash: `sha256:${'e'.repeat(64)}`,
  holder: 'mnfs-repo-lse001-g1',
  externalLeaseId: 'treehouse-lease-001',
  worktreePath: '/home/leandro/.local/state/mnfs/treehouse/pool/tree-001',
  externalLeasedAt: CREATED_AT,
  lastObservedAt: UPDATED_AT,
  version: 2,
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

const RELEASED_LEASE: Lease = {
  ...ACTIVE_LEASE,
  status: 'RELEASED',
  releaseIdempotencyKey: LEASE_RELEASE_KEY,
  releaseInputHash: `sha256:${'f'.repeat(64)}`,
  releaseRequestedAt: UPDATED_AT,
  releaseObservedAt: UPDATED_AT,
  version: 4,
};

const ABANDONED_TRACK: WriteTrack = {
  ...TRACK,
  status: 'ABANDONED',
  version: 2,
  updatedAt: UPDATED_AT,
};

const TRACK_VIEW = {
  track: TRACK,
  attempt: ATTEMPT,
  lease: ACTIVE_LEASE,
};

const RECOVERY_REPORT: RecoveryReport = {
  schemaVersion: 1,
  writeTrackId: TRACK.id,
  expected: {
    writeTrack: TRACK,
    attempt: ATTEMPT,
    lease: ACTIVE_LEASE,
  },
  findings: [{
    code: 'HEALTHY',
    target: TRACK.id,
    severity: 'INFO',
    safeActions: ['continue with the current operation'],
    requiredAuthority: 'NONE',
    nextAction: 'No recovery action is required.',
  }],
  observed: {
    sources: [{
      status: 'READY',
      attemptId: ATTEMPT.id,
      path: ATTEMPT.sourcePath as string,
      fingerprint: SOURCE_FINGERPRINT,
      baseCommitSha: BASE_COMMIT,
      baseTreeSha: BASE_TREE,
      objectFormat: 'sha1',
    }],
    leases: [{
      path: ACTIVE_LEASE.worktreePath as string,
      managed: true,
      sourcePath: ATTEMPT.sourcePath as string,
      status: 'leased',
      gitStatus: 'CLEAN',
      leaseId: ACTIVE_LEASE.externalLeaseId as string,
      holder: ACTIVE_LEASE.holder,
      leasedAt: ACTIVE_LEASE.externalLeasedAt as string,
    }],
    actions: [],
    processes: [],
  },
  observationHashes: {
    sources: COLLECTION_HASH,
    leases: COLLECTION_HASH,
    actions: COLLECTION_HASH,
    processes: COLLECTION_HASH,
  },
  contentHash: REPORT_HASH,
};

type Awaitable<T> = T | Promise<T>;

interface OpenTrackCommandInput {
  readonly missionId: string;
  readonly milestoneQualifiedId: string;
  readonly featureQualifiedId: string;
  readonly contractHash: string;
  readonly baseCommitSha: string;
  readonly idempotencyKey: string;
}

interface AbandonTrackCommandInput {
  readonly writeTrackId: string;
  readonly expectedTrackVersion: number;
}

interface GrantLeaseCommandInput {
  readonly writeTrackId: string;
  readonly expectedTrackVersion: number;
  readonly idempotencyKey: string;
}

interface ReleaseLeaseCommandInput {
  readonly leaseId: string;
  readonly expectedLeaseVersion: number;
  readonly idempotencyKey: string;
}

interface RecoverCommandInput {
  readonly writeTrackId?: string;
}

type ExecutionOperation =
  | 'track-open'
  | 'track-show'
  | 'track-abandon'
  | 'lease-grant'
  | 'lease-show'
  | 'lease-release'
  | 'recover';

interface ExecutionCliDependencies {
  inspect(): EnvironmentReport;
  openWriteTrack(input: OpenTrackCommandInput): Awaitable<Readonly<{ track: WriteTrack; attempt: Attempt }>>;
  showWriteTrack(writeTrackId: string): Awaitable<typeof TRACK_VIEW>;
  abandonWriteTrack(input: AbandonTrackCommandInput): Awaitable<WriteTrack>;
  grantLease(input: GrantLeaseCommandInput): Awaitable<Lease>;
  showLease(leaseId: string): Awaitable<Lease>;
  releaseLease(input: ReleaseLeaseCommandInput): Awaitable<Lease>;
  recover(input: RecoverCommandInput): Awaitable<RecoveryReport>;
}

interface RecordedCall {
  readonly kind: ExecutionOperation;
  readonly input: unknown;
}

function dependenciesFor(
  calls: RecordedCall[],
  failures: Partial<Record<ExecutionOperation, MnfsError>> = {},
): ExecutionCliDependencies {
  function fail(kind: ExecutionOperation): void {
    const error = failures[kind];
    if (error !== undefined) throw error;
  }

  return {
    inspect: () => READY_REPORT,
    openWriteTrack: async (input) => {
      calls.push({ kind: 'track-open', input });
      fail('track-open');
      return { track: TRACK, attempt: ATTEMPT };
    },
    showWriteTrack: async (writeTrackId) => {
      calls.push({ kind: 'track-show', input: writeTrackId });
      fail('track-show');
      return TRACK_VIEW;
    },
    abandonWriteTrack: async (input) => {
      calls.push({ kind: 'track-abandon', input });
      fail('track-abandon');
      return ABANDONED_TRACK;
    },
    grantLease: async (input) => {
      calls.push({ kind: 'lease-grant', input });
      fail('lease-grant');
      return ACTIVE_LEASE;
    },
    showLease: async (leaseId) => {
      calls.push({ kind: 'lease-show', input: leaseId });
      fail('lease-show');
      return ACTIVE_LEASE;
    },
    releaseLease: async (input) => {
      calls.push({ kind: 'lease-release', input });
      fail('lease-release');
      return RELEASED_LEASE;
    },
    recover: async (input) => {
      calls.push({ kind: 'recover', input });
      fail('recover');
      return RECOVERY_REPORT;
    },
  };
}

async function runExecutionCommand(
  argv: readonly string[],
  dependencies: ExecutionCliDependencies,
): Promise<CliResult> {
  const result = await runCli(argv, dependencies as unknown as CliDependencies);
  assert.notEqual(
    result.exitCode,
    2,
    `M01 execution CLI dispatch is not implemented: ${result.stderr}`,
  );
  return result;
}

const JSON_CASES: ReadonlyArray<Readonly<{
  argv: readonly string[];
  expected: unknown;
}>> = [
  {
    argv: [
      'track',
      'open',
      '--mission',
      'MIS-002',
      '--milestone',
      'M01',
      '--feature',
      'F01',
      '--contract',
      CONTRACT_HASH,
      '--base',
      BASE_COMMIT,
      '--idempotency-key',
      TRACK_OPEN_KEY,
      '--json',
    ],
    expected: { track: TRACK, attempt: ATTEMPT },
  },
  {
    argv: ['track', 'show', '--track', 'WT-001', '--json'],
    expected: TRACK_VIEW,
  },
  {
    argv: ['track', 'abandon', '--track', 'WT-001', '--expected-version', '1', '--json'],
    expected: ABANDONED_TRACK,
  },
  {
    argv: [
      'lease',
      'grant',
      '--track',
      'WT-001',
      '--expected-version',
      '1',
      '--idempotency-key',
      LEASE_GRANT_KEY,
      '--json',
    ],
    expected: ACTIVE_LEASE,
  },
  {
    argv: ['lease', 'show', '--lease', 'LSE-001', '--json'],
    expected: ACTIVE_LEASE,
  },
  {
    argv: [
      'lease',
      'release',
      '--lease',
      'LSE-001',
      '--expected-version',
      '2',
      '--idempotency-key',
      LEASE_RELEASE_KEY,
      '--json',
    ],
    expected: RELEASED_LEASE,
  },
  {
    argv: ['recover', '--track', 'WT-001', '--json'],
    expected: RECOVERY_REPORT,
  },
];

test('routes every JSON execution command to exactly one dependency with stable output', async () => {
  const calls: RecordedCall[] = [];
  const dependencies = dependenciesFor(calls);

  for (const item of JSON_CASES) {
    const before = calls.length;
    const result = await runExecutionCommand(item.argv, dependencies);
    assert.equal(result.exitCode, 0, result.stderr);
    assert.equal(result.stderr, '');
    assert.equal(result.stdout, `${JSON.stringify(item.expected)}\n`);
    assert.equal(calls.length, before + 1, item.argv.join(' '));
  }

  assert.deepEqual(calls, [
    {
      kind: 'track-open',
      input: {
        missionId: 'MIS-002',
        milestoneQualifiedId: 'MIS-002/M01',
        featureQualifiedId: 'MIS-002/M01/F01',
        contractHash: CONTRACT_HASH,
        baseCommitSha: BASE_COMMIT,
        idempotencyKey: TRACK_OPEN_KEY,
      },
    },
    { kind: 'track-show', input: 'WT-001' },
    {
      kind: 'track-abandon',
      input: { writeTrackId: 'WT-001', expectedTrackVersion: 1 },
    },
    {
      kind: 'lease-grant',
      input: {
        writeTrackId: 'WT-001',
        expectedTrackVersion: 1,
        idempotencyKey: LEASE_GRANT_KEY,
      },
    },
    { kind: 'lease-show', input: 'LSE-001' },
    {
      kind: 'lease-release',
      input: {
        leaseId: 'LSE-001',
        expectedLeaseVersion: 2,
        idempotencyKey: LEASE_RELEASE_KEY,
      },
    },
    { kind: 'recover', input: { writeTrackId: 'WT-001' } },
  ]);
});

test('human execution output exposes identity, version, hashes and a concrete next action', async () => {
  const calls: RecordedCall[] = [];
  const dependencies = dependenciesFor(calls);
  const cases: ReadonlyArray<Readonly<{
    argv: readonly string[];
    patterns: readonly RegExp[];
  }>> = [
    {
      argv: [
        'track',
        'open',
        '--mission',
        'MIS-002',
        '--milestone',
        'M01',
        '--feature',
        'F01',
        '--contract',
        CONTRACT_HASH,
        '--base',
        BASE_COMMIT,
        '--idempotency-key',
        TRACK_OPEN_KEY,
      ],
      patterns: [/WT-001/u, /WT-001\/A01/u, /version 1/iu, new RegExp(CONTRACT_HASH), /Next:/u],
    },
    {
      argv: ['track', 'show', '--track', 'WT-001'],
      patterns: [/WT-001/u, /ACTIVE/u, /version 1/iu, new RegExp(CONTRACT_HASH), /Next:/u],
    },
    {
      argv: ['track', 'abandon', '--track', 'WT-001', '--expected-version', '1'],
      patterns: [/WT-001/u, /ABANDONED/u, /version 2/iu, new RegExp(CONTRACT_HASH), /Next:/u],
    },
    {
      argv: [
        'lease',
        'grant',
        '--track',
        'WT-001',
        '--expected-version',
        '1',
        '--idempotency-key',
        LEASE_GRANT_KEY,
      ],
      patterns: [/LSE-001/u, /ACTIVE/u, /version 2/iu, /treehouse-lease-001/u, /Next:/u],
    },
    {
      argv: ['lease', 'show', '--lease', 'LSE-001'],
      patterns: [/LSE-001/u, /ACTIVE/u, /version 2/iu, new RegExp(CONTRACT_HASH), /Next:/u],
    },
    {
      argv: [
        'lease',
        'release',
        '--lease',
        'LSE-001',
        '--expected-version',
        '2',
        '--idempotency-key',
        LEASE_RELEASE_KEY,
      ],
      patterns: [/LSE-001/u, /RELEASED/u, /version 4/iu, new RegExp(CONTRACT_HASH), /Next:/u],
    },
    {
      argv: ['recover', '--track', 'WT-001'],
      patterns: [/HEALTHY/u, new RegExp(REPORT_HASH), /No recovery action is required/u, /Next:/u],
    },
  ];

  for (const item of cases) {
    const result = await runExecutionCommand(item.argv, dependencies);
    assert.equal(result.exitCode, 0, result.stderr);
    assert.equal(result.stderr, '');
    for (const pattern of item.patterns) {
      assert.match(result.stdout, pattern, `${item.argv.join(' ')} lacks ${pattern}`);
    }
  }
  assert.equal(calls.length, cases.length);
});

test('help advertises the complete bounded M01 execution command surface', async () => {
  const calls: RecordedCall[] = [];
  const dependencies = dependenciesFor(calls);

  await runExecutionCommand(JSON_CASES[0]!.argv, dependencies);
  const result = await runCli(['--help'], dependencies as unknown as CliDependencies);

  assert.equal(result.exitCode, 0);
  for (const pattern of [
    /mnfs track open/u,
    /mnfs track show/u,
    /mnfs track abandon/u,
    /mnfs lease grant/u,
    /mnfs lease show/u,
    /mnfs lease release/u,
    /mnfs recover/u,
  ]) {
    assert.match(result.stdout, pattern);
  }
  assert.equal(calls.length, 1);
});

test('every execution command preserves its stable typed MNFS error', async () => {
  const cases: ReadonlyArray<Readonly<{
    kind: ExecutionOperation;
    code: MnfsErrorCode;
    argv: readonly string[];
  }>> = [
    { kind: 'track-open', code: 'WRITE_TRACK_CONFLICT', argv: JSON_CASES[0]!.argv },
    { kind: 'track-show', code: 'WRITE_TRACK_CONFLICT', argv: JSON_CASES[1]!.argv },
    {
      kind: 'track-abandon',
      code: 'WRITE_TRACK_NOT_ABANDONABLE',
      argv: JSON_CASES[2]!.argv,
    },
    { kind: 'lease-grant', code: 'LEASE_CONFLICT', argv: JSON_CASES[3]!.argv },
    { kind: 'lease-show', code: 'LEASE_CONFLICT', argv: JSON_CASES[4]!.argv },
    { kind: 'lease-release', code: 'LEASE_FENCE_CONFLICT', argv: JSON_CASES[5]!.argv },
    { kind: 'recover', code: 'RECOVERY_DIVERGENCE', argv: JSON_CASES[6]!.argv },
  ];

  for (const item of cases) {
    const calls: RecordedCall[] = [];
    const dependencies = dependenciesFor(calls, {
      [item.kind]: new MnfsError(item.code, `injected ${item.kind} failure`),
    });
    const result = await runExecutionCommand(item.argv, dependencies);
    assert.equal(result.exitCode, 1);
    assert.equal(result.stdout, '');
    assert.match(result.stderr, new RegExp(`^${item.code}: injected ${item.kind} failure`));
    assert.equal(calls.length, 1);
    assert.equal(calls[0]?.kind, item.kind);
  }
});
