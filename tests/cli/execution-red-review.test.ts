import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

import { parseArgs } from '../../src/cli/args.js';
import { runCli, type CliDependencies } from '../../src/cli/main.js';
import type { EnvironmentReport } from '../../src/runtime/environment.js';

const CONTRACT_HASH = `sha256:${'a'.repeat(64)}`;
const SHA256_BASE = '2'.repeat(64);
const TRACK_OPEN_KEY = 'track:open:MIS-002:M01:F01:sha256-base';
const REPORT_HASH = `sha256:${'c'.repeat(64)}`;

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

function trackOpen(input: Readonly<{
  mission?: string;
  milestone?: string;
  feature?: string;
  contract?: string;
  base?: string;
}> = {}): readonly string[] {
  return [
    'track',
    'open',
    '--mission',
    input.mission ?? 'MIS-002',
    '--milestone',
    input.milestone ?? 'M01',
    '--feature',
    input.feature ?? 'F01',
    '--contract',
    input.contract ?? CONTRACT_HASH,
    '--base',
    input.base ?? SHA256_BASE,
    '--idempotency-key',
    TRACK_OPEN_KEY,
  ];
}

function requireExecutionParser(): void {
  const parsed = parseArgs(trackOpen());
  assert.notEqual(
    parsed.kind,
    'invalid',
    `M01 execution CLI parser is not implemented: ${
      parsed.kind === 'invalid' ? parsed.message : parsed.kind
    }`,
  );
}

test('accepts SHA-256 Git object ids and rejects non-canonical M01 identities and hashes', () => {
  requireExecutionParser();

  assert.deepEqual(parseArgs([...trackOpen(), '--json']), {
    kind: 'track-open',
    missionId: 'MIS-002',
    milestoneId: 'M01',
    featureId: 'F01',
    contractHash: CONTRACT_HASH,
    baseCommitSha: SHA256_BASE,
    idempotencyKey: TRACK_OPEN_KEY,
    json: true,
  });

  for (const command of [
    trackOpen({ mission: 'MIS-02' }),
    trackOpen({ milestone: 'M1' }),
    trackOpen({ feature: 'F1' }),
    trackOpen({ contract: `sha256:${'A'.repeat(64)}` }),
    trackOpen({ base: '2'.repeat(41) }),
    trackOpen({ base: '2'.repeat(65) }),
  ]) {
    assert.equal(parseArgs(command).kind, 'invalid', command.join(' '));
  }
});

test('dispatches unscoped Recovery without inventing a Write Track identity', async () => {
  const calls: unknown[] = [];
  const report = {
    schemaVersion: 1,
    findings: [],
    contentHash: REPORT_HASH,
  };
  const dependencies = {
    inspect: () => READY_REPORT,
    recover: async (input: Readonly<{ writeTrackId?: string }>) => {
      calls.push(input);
      return report;
    },
  } as unknown as CliDependencies;

  const result = await runCli(['recover', '--json'], dependencies);
  assert.notEqual(
    result.exitCode,
    2,
    `M01 execution CLI dispatch is not implemented: ${result.stderr}`,
  );
  assert.equal(result.exitCode, 0, result.stderr);
  assert.deepEqual(calls, [{}]);
  assert.equal(result.stdout, `${JSON.stringify(report)}\n`);
  assert.equal(result.stderr, '');
});

test('read-only show dispatch never touches unrelated physical-operation dependencies', async () => {
  const touched: string[] = [];
  const dependencies: Record<string, unknown> = {
    inspect: () => READY_REPORT,
    showWriteTrack: async (trackId: string) => {
      touched.push(`track:${trackId}`);
      return {
        track: {
          id: trackId,
          status: 'ACTIVE',
          version: 1,
          contractHash: CONTRACT_HASH,
        },
      };
    },
    showLease: async (leaseId: string) => {
      touched.push(`lease:${leaseId}`);
      return {
        id: leaseId,
        status: 'ACTIVE',
        version: 2,
        contractHash: CONTRACT_HASH,
      };
    },
  };
  for (const name of [
    'openWriteTrack',
    'abandonWriteTrack',
    'grantLease',
    'releaseLease',
    'recover',
  ]) {
    Object.defineProperty(dependencies, name, {
      enumerable: true,
      get(): never {
        throw new Error(`unrelated dependency was touched: ${name}`);
      },
    });
  }

  for (const argv of [
    ['track', 'show', '--track', 'WT-001', '--json'],
    ['lease', 'show', '--lease', 'LSE-001', '--json'],
  ] as const) {
    const result = await runCli(argv, dependencies as unknown as CliDependencies);
    assert.notEqual(
      result.exitCode,
      2,
      `M01 execution CLI dispatch is not implemented: ${result.stderr}`,
    );
    assert.equal(result.exitCode, 0, result.stderr);
  }
  assert.deepEqual(touched, ['track:WT-001', 'lease:LSE-001']);
});

test('production entry composes current-schema readiness and the complete bounded M01 runtime', () => {
  const source = readFileSync(resolve('src/cli/entry.ts'), 'utf8');
  const requiredMarkers = [
    'ensureDatabaseReady',
    'SqliteStore.openCurrent',
    'ExecutionService',
    'LeaseService',
    'RecoveryService',
    'ExecutionSourceAdapter',
    'GitWorktreeInspector',
    'TreehouseAdapter',
    'LeaseActionRunner',
    'LinuxProcessIdentityInspector',
    'openWriteTrack:',
    'showWriteTrack:',
    'abandonWriteTrack:',
    'grantLease:',
    'showLease:',
    'releaseLease:',
    'recover:',
  ] as const;
  const missing = requiredMarkers.filter((marker) => !source.includes(marker));
  assert.deepEqual(
    missing,
    [],
    `M01 production composition root is not implemented: missing ${missing.join(', ')}`,
  );
  assert.match(
    source,
    /await ensureDatabaseReady\([\s\S]*?SqliteStore\.openCurrent\(/u,
    'current-schema readiness must complete before the execution store opens',
  );
  assert.match(
    source,
    /SqliteStore\.openCurrent\([\s\S]*?try\s*\{[\s\S]*?\}\s*finally\s*\{[\s\S]*?\.close\(\)/u,
    'the one current execution store must close in a finally block',
  );
});
