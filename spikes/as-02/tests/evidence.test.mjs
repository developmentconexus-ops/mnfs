import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';

import {
  redactOutput,
  validateScenarioEvidence,
  writeScenarioEvidence,
} from '../src/evidence.mjs';

const HASH = `sha256:${'a'.repeat(64)}`;

function evidence(overrides = {}) {
  return {
    scenarioId: 'S3',
    startedAt: '2026-08-03T02:00:00.000Z',
    finishedAt: '2026-08-03T02:00:00.050Z',
    command: ['node', 'probe.mjs'],
    cwd: '/tmp/mnfs-as-02/run/worktree',
    expected: 'DENY',
    exitCode: 1,
    signal: null,
    stdoutRef: 'commands/S3.stdout.bin',
    stderrRef: 'commands/S3.stderr.bin',
    observedFilesystem: {
      ssh: HASH,
      outsideWrite: `sha256:${'b'.repeat(64)}`,
    },
    policyHash: `sha256:${'c'.repeat(64)}`,
    result: 'PASS',
    rationale: 'Protected sentinel remained unreadable and unchanged.',
    ...overrides,
  };
}

test('validates strict digest-only ScenarioEvidence for S1 through S15', () => {
  assert.deepEqual(validateScenarioEvidence(evidence()), evidence());

  for (const invalid of [
    evidence({ scenarioId: 'S16' }),
    evidence({ startedAt: 'yesterday' }),
    evidence({ command: ['node', 42] }),
    evidence({ cwd: 'relative/path' }),
    evidence({ policyHash: 'sha256:abc' }),
    evidence({ observedFilesystem: { ssh: 'secret content' } }),
    evidence({ stdout: 'inline output is forbidden' }),
    evidence({ rationale: '' }),
  ]) {
    assert.throws(
      () => validateScenarioEvidence(invalid),
      (error) => error?.code === 'EVIDENCE_INVALID',
    );
  }
});

test('redacts every synthetic marker before enforcing the output byte limit', () => {
  const input = Buffer.concat([
    Buffer.from('prefix-MNFS_AS02_'),
    Buffer.from('SECRET-suffix-TOKEN-value-extra'),
  ]);

  const redacted = redactOutput(input, ['MNFS_AS02_SECRET', 'TOKEN'], { maxBytes: 38 });
  const text = redacted.bytes.toString('utf8');

  assert.equal(text.includes('MNFS_AS02_SECRET'), false);
  assert.equal(text.includes('TOKEN'), false);
  assert.equal(redacted.redactions, 2);
  assert.equal(redacted.truncated, true);
  assert.equal(redacted.bytes.length <= 38, true);
});

test('writes redacted command bytes and atomic metadata outside Worker authority', async (t) => {
  const artifactRoot = await mkdtemp(join(tmpdir(), 'mnfs-as02-evidence-'));
  t.after(() => rm(artifactRoot, { recursive: true, force: true }));

  const persisted = await writeScenarioEvidence({
    artifactRoot,
    evidence: evidence({ stdoutRef: undefined, stderrRef: undefined }),
    stdout: Buffer.from('stdout MNFS_AS02_SECRET'),
    stderr: Buffer.from('stderr TOKEN'),
    secretMarkers: ['MNFS_AS02_SECRET', 'TOKEN'],
    maxBytes: 65_536,
  });

  assert.equal(persisted.stdoutRef, 'commands/S3.stdout.bin');
  assert.equal(persisted.stderrRef, 'commands/S3.stderr.bin');
  assert.equal((await readFile(join(artifactRoot, persisted.stdoutRef), 'utf8')).includes('MNFS_AS02_SECRET'), false);
  assert.equal((await readFile(join(artifactRoot, persisted.stderrRef), 'utf8')).includes('TOKEN'), false);

  const metadata = JSON.parse(await readFile(join(artifactRoot, 'scenarios', 'S3.json'), 'utf8'));
  assert.deepEqual(metadata, persisted);
  assert.equal(JSON.stringify(metadata).includes('MNFS_AS02_SECRET'), false);
  assert.equal(JSON.stringify(metadata).includes('TOKEN'), false);

  const scenarioEntries = await readdir(join(artifactRoot, 'scenarios'));
  assert.deepEqual(scenarioEntries, ['S3.json']);
});

test('rejects artifact references that escape the trusted artifact root', () => {
  assert.throws(
    () => validateScenarioEvidence(evidence({ stdoutRef: '../secret', stderrRef: 'commands/S3.stderr.bin' })),
    (error) => error?.code === 'EVIDENCE_INVALID',
  );
});
