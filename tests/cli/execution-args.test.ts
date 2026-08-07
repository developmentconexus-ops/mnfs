import assert from 'node:assert/strict';
import test from 'node:test';

import { parseArgs } from '../../src/cli/args.js';

const CONTRACT_HASH = `sha256:${'a'.repeat(64)}`;
const BASE_COMMIT = '1'.repeat(40);
const TRACK_OPEN_KEY = 'track:open:MIS-002:M01:F01:base-1';
const LEASE_GRANT_KEY = 'lease:grant:WT-001:A01:g1';
const LEASE_RELEASE_KEY = 'lease:release:LSE-001:v2';

const TRACK_OPEN = [
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
] as const;

function requireExecutionParser(): void {
  const probe = parseArgs(TRACK_OPEN);
  assert.notEqual(
    probe.kind,
    'invalid',
    `M01 execution CLI parser is not implemented: ${
      probe.kind === 'invalid' ? probe.message : probe.kind
    }`,
  );
}

test('parses the complete strict M01 execution command surface', () => {
  requireExecutionParser();

  assert.deepEqual(parseArgs([...TRACK_OPEN, '--json']), {
    kind: 'track-open',
    missionId: 'MIS-002',
    milestoneId: 'M01',
    featureId: 'F01',
    contractHash: CONTRACT_HASH,
    baseCommitSha: BASE_COMMIT,
    idempotencyKey: TRACK_OPEN_KEY,
    json: true,
  });
  assert.deepEqual(parseArgs(['track', 'show', '--track', 'WT-001']), {
    kind: 'track-show',
    trackId: 'WT-001',
    json: false,
  });
  assert.deepEqual(
    parseArgs(['track', 'abandon', '--track', 'WT-001', '--expected-version', '3', '--json']),
    {
      kind: 'track-abandon',
      trackId: 'WT-001',
      expectedVersion: 3,
      json: true,
    },
  );
  assert.deepEqual(
    parseArgs([
      'lease',
      'grant',
      '--track',
      'WT-001',
      '--expected-version',
      '1',
      '--idempotency-key',
      LEASE_GRANT_KEY,
    ]),
    {
      kind: 'lease-grant',
      trackId: 'WT-001',
      expectedVersion: 1,
      idempotencyKey: LEASE_GRANT_KEY,
      json: false,
    },
  );
  assert.deepEqual(parseArgs(['lease', 'show', '--lease', 'LSE-001', '--json']), {
    kind: 'lease-show',
    leaseId: 'LSE-001',
    json: true,
  });
  assert.deepEqual(
    parseArgs([
      'lease',
      'release',
      '--lease',
      'LSE-001',
      '--expected-version',
      '2',
      '--idempotency-key',
      LEASE_RELEASE_KEY,
    ]),
    {
      kind: 'lease-release',
      leaseId: 'LSE-001',
      expectedVersion: 2,
      idempotencyKey: LEASE_RELEASE_KEY,
      json: false,
    },
  );
  assert.deepEqual(parseArgs(['recover']), {
    kind: 'recover',
    json: false,
  });
  assert.deepEqual(parseArgs(['recover', '--track', 'WT-001', '--json']), {
    kind: 'recover',
    trackId: 'WT-001',
    json: true,
  });
});

test('rejects missing values, duplicate flags, unknown flags and positional extras', () => {
  requireExecutionParser();

  const invalidCommands: readonly (readonly string[])[] = [
    ['track', 'open', '--mission', 'MIS-002'],
    [...TRACK_OPEN, '--contract', CONTRACT_HASH],
    [...TRACK_OPEN, '--unknown', 'value'],
    [...TRACK_OPEN, 'positional'],
    ['track', 'show'],
    ['track', 'show', '--track', 'WT-001', '--track', 'WT-002'],
    ['track', 'abandon', '--track', 'WT-001'],
    ['lease', 'grant', '--track', 'WT-001', '--expected-version', '1'],
    ['lease', 'show', '--lease'],
    ['lease', 'release', '--lease', 'LSE-001', '--expected-version', '2'],
    ['recover', '--track'],
    ['recover', '--json', '--json'],
    ['recover', 'WT-001'],
  ];

  for (const command of invalidCommands) {
    const parsed = parseArgs(command);
    assert.equal(parsed.kind, 'invalid', command.join(' '));
  }
});

test('rejects malformed identities, hashes and non-positive expected versions', () => {
  requireExecutionParser();

  const invalidCommands: readonly (readonly string[])[] = [
    [...TRACK_OPEN.slice(0, 3), 'MIS-003', ...TRACK_OPEN.slice(4)],
    [...TRACK_OPEN.slice(0, 5), 'M02', ...TRACK_OPEN.slice(6)],
    [...TRACK_OPEN.slice(0, 7), 'feature', ...TRACK_OPEN.slice(8)],
    [...TRACK_OPEN.slice(0, 9), `sha256:${'a'.repeat(63)}`, ...TRACK_OPEN.slice(10)],
    [...TRACK_OPEN.slice(0, 11), 'not-a-git-object', ...TRACK_OPEN.slice(12)],
    ['track', 'show', '--track', 'WT-01'],
    ['track', 'abandon', '--track', 'WT-001', '--expected-version', '0'],
    ['track', 'abandon', '--track', 'WT-001', '--expected-version', '-1'],
    ['track', 'abandon', '--track', 'WT-001', '--expected-version', '1.5'],
    [
      'lease',
      'grant',
      '--track',
      'WT-01',
      '--expected-version',
      '1',
      '--idempotency-key',
      LEASE_GRANT_KEY,
    ],
    [
      'lease',
      'grant',
      '--track',
      'WT-001',
      '--expected-version',
      'NaN',
      '--idempotency-key',
      LEASE_GRANT_KEY,
    ],
    ['lease', 'show', '--lease', 'LSE-1'],
    [
      'lease',
      'release',
      '--lease',
      'LSE-001',
      '--expected-version',
      '0',
      '--idempotency-key',
      LEASE_RELEASE_KEY,
    ],
    ['recover', '--track', 'WT-ABC'],
  ];

  for (const command of invalidCommands) {
    const parsed = parseArgs(command);
    assert.equal(parsed.kind, 'invalid', command.join(' '));
  }
});

test('rejects execution operations outside the accepted M01 CLI boundary', () => {
  requireExecutionParser();

  for (const command of [
    ['track', 'close'],
    ['attempt', 'supersede'],
    ['run', 'open'],
    ['claim', 'open'],
    ['lease', 'force-release'],
    ['recover', '--repair'],
  ] as const) {
    assert.equal(parseArgs(command).kind, 'invalid', command.join(' '));
  }
});
