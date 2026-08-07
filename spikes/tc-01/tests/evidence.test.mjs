import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { canonicalJson, sha256Bytes } from '../src/canonical-json.mjs';
import {
  createEvidenceStore,
  validateScenarioEvidence,
} from '../src/evidence.mjs';

const ALL_SCENARIOS = Array.from({ length: 15 }, (_, index) => `TC01-S${String(index + 1).padStart(2, '0')}`);

async function temporaryFixture(t) {
  const runRoot = await mkdtemp(join(tmpdir(), 'mnfs-tc01-evidence-'));
  t.after(() => rm(runRoot, { recursive: true, force: true }));
  const artifactsRoot = join(runRoot, 'artifacts');
  await mkdir(artifactsRoot);
  return {
    schemaVersion: 1,
    runId: 'tc01-20260804-002800-a1b2c3d4',
    runRoot,
    artifactsRoot,
  };
}

function processSpec(cwd, args = ['status', '--json']) {
  return {
    file: '/usr/bin/treehouse',
    args,
    cwd,
    env: {
      PATH: '/tmp/wrapper:/tmp/treehouse:/usr/bin:/bin',
      HOME: '/tmp/fake-home',
      LANG: 'C.UTF-8',
      LC_ALL: 'C.UTF-8',
    },
    timeoutMs: 30_000,
    stdoutLimitBytes: 65_536,
    stderrLimitBytes: 65_536,
  };
}

function processResult(stdout = Buffer.from('{"ok":true}\n'), stderr = Buffer.alloc(0)) {
  return {
    startedAt: '2026-08-04T03:00:00.000Z',
    finishedAt: '2026-08-04T03:00:00.125Z',
    durationMs: 125,
    exitCode: 0,
    signal: null,
    stdout,
    stderr,
    timedOut: false,
  };
}

function scenarioRecord({ scenarioId, command, cwd, overrides = {} }) {
  return {
    scenarioId,
    startedAt: '2026-08-04T03:00:00.000Z',
    finishedAt: '2026-08-04T03:00:00.125Z',
    executablePath: '/usr/bin/treehouse',
    executableHash: `sha256:${'a'.repeat(64)}`,
    version: '2.1.1',
    argv: ['status', '--json'],
    cwd,
    timeoutMs: 30_000,
    exitCode: 0,
    signal: null,
    stdoutRef: command.stdoutRef,
    stderrRef: command.stderrRef,
    stdoutHash: command.stdoutHash,
    stderrHash: command.stderrHash,
    stdoutExcerpt: command.stdoutExcerpt,
    stderrExcerpt: command.stderrExcerpt,
    expected: 'The controlled observation satisfies the scenario contract.',
    observations: { sourceCheckoutChanged: false },
    result: 'PASS',
    rationale: 'Trusted observations matched the expected state.',
    ...overrides,
  };
}

async function writeOneScenario(store, fixture, scenarioId, commandId = 'observe') {
  const command = await store.writeCommand({
    scenarioId,
    commandId,
    spec: processSpec(fixture.runRoot),
    result: processResult(Buffer.from(`${scenarioId}\n`, 'utf8')),
  });
  await store.writeScenario(scenarioRecord({ scenarioId, command, cwd: fixture.runRoot }));
  return command;
}

test('canonical JSON ignores object key order while preserving array order', () => {
  const left = canonicalJson({ z: 1, nested: { b: true, a: 'value' }, list: ['first', 'second'] });
  const right = canonicalJson({ list: ['first', 'second'], nested: { a: 'value', b: true }, z: 1 });
  const reorderedArray = canonicalJson({ list: ['second', 'first'], nested: { a: 'value', b: true }, z: 1 });

  assert.equal(left, right);
  assert.notEqual(left, reorderedArray);
  assert.equal(sha256Bytes(Buffer.from(left)), sha256Bytes(Buffer.from(right)));
  assert.notEqual(sha256Bytes(Buffer.from(left)), sha256Bytes(Buffer.from(reorderedArray)));
  assert.match(sha256Bytes(Buffer.from('evidence')), /^sha256:[a-f0-9]{64}$/u);
});

test('writes raw command bytes and bounded metadata under one scenario path', async (t) => {
  const fixture = await temporaryFixture(t);
  const store = await createEvidenceStore(fixture);
  const stdout = Buffer.from(`${'A'.repeat(5_000)}TAIL-RAW-ONLY\u0000`, 'utf8');
  const stderr = Buffer.from('controlled warning\n', 'utf8');

  const command = await store.writeCommand({
    scenarioId: 'TC01-S02',
    commandId: 'acquire',
    spec: processSpec(fixture.runRoot, ['get', '--lease', '--lease-holder', 'holder', '--json']),
    result: processResult(stdout, stderr),
  });

  assert.equal(command.stdoutRef, 'commands/TC01-S02/acquire/stdout.bin');
  assert.equal(command.stderrRef, 'commands/TC01-S02/acquire/stderr.bin');
  assert.equal(command.metadataRef, 'commands/TC01-S02/acquire/metadata.json');
  assert.equal(command.stdoutExcerpt.length, 4_096);
  assert.equal(command.stdoutExcerpt.includes('TAIL-RAW-ONLY'), false);
  assert.equal(command.stderrExcerpt, 'controlled warning\n');
  assert.equal(command.stdoutHash, sha256Bytes(stdout));
  assert.equal(command.stderrHash, sha256Bytes(stderr));

  assert.deepEqual(await readFile(join(fixture.artifactsRoot, command.stdoutRef)), stdout);
  assert.deepEqual(await readFile(join(fixture.artifactsRoot, command.stderrRef)), stderr);

  const metadata = JSON.parse(await readFile(join(fixture.artifactsRoot, command.metadataRef), 'utf8'));
  assert.equal(metadata.scenarioId, 'TC01-S02');
  assert.equal(metadata.commandId, 'acquire');
  assert.deepEqual(metadata.argv, ['get', '--lease', '--lease-holder', 'holder', '--json']);
  assert.equal(metadata.cwd, fixture.runRoot);
  assert.equal(metadata.shell, false);
  assert.equal(metadata.stdin, 'closed');
  assert.deepEqual(metadata.environmentKeys, ['HOME', 'LANG', 'LC_ALL', 'PATH']);
  assert.equal(Object.hasOwn(metadata, 'stdout'), false);
  assert.equal(Object.hasOwn(metadata, 'stderr'), false);

  const directory = await readdir(join(fixture.artifactsRoot, 'commands', 'TC01-S02', 'acquire'));
  assert.deepEqual(directory.sort(), ['metadata.json', 'stderr.bin', 'stdout.bin']);
  assert.equal(directory.some((name) => name.includes('.tmp')), false);
});

test('validates strict scenario identities, argv, cwd and contained artifact references', async (t) => {
  const fixture = await temporaryFixture(t);
  const store = await createEvidenceStore(fixture);
  const command = await store.writeCommand({
    scenarioId: 'TC01-S01',
    commandId: 'identity',
    spec: processSpec(fixture.runRoot, ['--version']),
    result: processResult(Buffer.from('2.1.1\n')),
  });
  const valid = scenarioRecord({ scenarioId: 'TC01-S01', command, cwd: fixture.runRoot, overrides: { argv: ['--version'] } });

  assert.deepEqual(validateScenarioEvidence(valid, fixture.artifactsRoot), valid);
  assert.throws(
    () => validateScenarioEvidence({ ...valid, scenarioId: 'TC01-S16' }, fixture.artifactsRoot),
    (error) => error?.code === 'TC01_EVIDENCE_INVALID',
  );
  assert.throws(
    () => validateScenarioEvidence({ ...valid, argv: [] }, fixture.artifactsRoot),
    (error) => error?.code === 'TC01_EVIDENCE_INVALID',
  );
  assert.throws(
    () => validateScenarioEvidence({ ...valid, cwd: 'relative/repo' }, fixture.artifactsRoot),
    (error) => error?.code === 'TC01_EVIDENCE_INVALID',
  );
  assert.throws(
    () => validateScenarioEvidence({ ...valid, stdoutRef: '../outside.bin' }, fixture.artifactsRoot),
    (error) => error?.code === 'TC01_EVIDENCE_INVALID',
  );
  assert.throws(
    () => validateScenarioEvidence({ ...valid, stdoutHash: `sha256:${'b'.repeat(64)}` }, fixture.artifactsRoot),
    (error) => error?.code === 'TC01_EVIDENCE_INVALID',
  );
});

test('scenario aggregates contain refs and excerpts but never duplicate complete outputs', async (t) => {
  const fixture = await temporaryFixture(t);
  const store = await createEvidenceStore(fixture);
  const stdout = Buffer.from(`${'B'.repeat(5_000)}TAIL-RAW-ONLY`, 'utf8');
  const command = await store.writeCommand({
    scenarioId: 'TC01-S03',
    commandId: 'network-observation',
    spec: processSpec(fixture.runRoot),
    result: processResult(stdout),
  });
  const record = scenarioRecord({ scenarioId: 'TC01-S03', command, cwd: fixture.runRoot });

  await store.writeScenario(record);
  const scenarios = await store.readScenarios();
  assert.deepEqual(scenarios, [record]);
  await assert.rejects(
    store.writeScenario(record),
    (error) => error?.code === 'TC01_EVIDENCE_INVALID',
  );

  const aggregateText = await readFile(join(fixture.artifactsRoot, 'scenarios.json'), 'utf8');
  const aggregate = JSON.parse(aggregateText);
  assert.equal(aggregate.length, 1);
  assert.equal(aggregateText.includes('TAIL-RAW-ONLY'), false);
  assert.equal(aggregateText.includes('stdout.bin'), true);
  assert.equal(Object.hasOwn(aggregate[0], 'stdout'), false);
  assert.equal(Object.hasOwn(aggregate[0], 'stderr'), false);

  const artifactsEntries = await readdir(fixture.artifactsRoot);
  assert.equal(artifactsEntries.some((name) => name.includes('.tmp')), false);
});

test('environment and scenario writes are durable while incomplete finalization fails closed', async (t) => {
  const fixture = await temporaryFixture(t);
  const store = await createEvidenceStore(fixture);
  const environment = {
    schemaVersion: 1,
    environment: 'WSL2',
    treehouseVersion: '2.1.1',
    treehouseExecutableHash: `sha256:${'c'.repeat(64)}`,
  };

  const environmentResult = await store.writeEnvironment(environment);
  assert.equal(environmentResult.ref, 'environment.json');
  assert.equal(environmentResult.sha256, sha256Bytes(Buffer.from(`${canonicalJson(environment)}\n`)));
  assert.deepEqual(JSON.parse(await readFile(join(fixture.artifactsRoot, 'environment.json'), 'utf8')), environment);

  await writeOneScenario(store, fixture, 'TC01-S01');
  await assert.rejects(
    store.finalize(),
    (error) => error?.code === 'TC01_EVIDENCE_INVALID' && error?.details?.missing?.includes('TC01-S15'),
  );
  await assert.rejects(
    store.writeEnvironment({ ...environment, treehouseVersion: 'changed' }),
    (error) => error?.code === 'TC01_EVIDENCE_INVALID',
  );
});

test('finalizes exactly S01 through S15 once and produces a hash-bound manifest', async (t) => {
  const fixture = await temporaryFixture(t);
  const store = await createEvidenceStore(fixture);
  const environment = {
    schemaVersion: 1,
    environment: 'WSL2',
    treehouseVersion: '2.1.1',
    treehouseExecutableHash: `sha256:${'d'.repeat(64)}`,
  };
  await store.writeEnvironment(environment);

  for (const scenarioId of [...ALL_SCENARIOS].reverse()) {
    await writeOneScenario(store, fixture, scenarioId);
  }

  const finalized = await store.finalize({ finalizedAt: '2026-08-04T03:30:00.000Z' });
  assert.equal(finalized.ref, 'manifest.json');
  assert.match(finalized.sha256, /^sha256:[a-f0-9]{64}$/u);

  const scenarios = await store.readScenarios();
  assert.deepEqual(scenarios.map((record) => record.scenarioId), ALL_SCENARIOS);

  const manifest = JSON.parse(await readFile(join(fixture.artifactsRoot, 'manifest.json'), 'utf8'));
  assert.deepEqual(manifest.scenarioIds, ALL_SCENARIOS);
  assert.equal(manifest.scenarioCount, 15);
  assert.equal(manifest.finalizedAt, '2026-08-04T03:30:00.000Z');
  assert.match(manifest.environmentHash, /^sha256:[a-f0-9]{64}$/u);
  assert.match(manifest.scenariosHash, /^sha256:[a-f0-9]{64}$/u);

  await assert.rejects(
    store.finalize(),
    (error) => error?.code === 'TC01_EVIDENCE_INVALID',
  );
  await assert.rejects(
    writeOneScenario(store, fixture, 'TC01-S01', 'duplicate-after-finalize'),
    (error) => error?.code === 'TC01_EVIDENCE_INVALID',
  );
});
