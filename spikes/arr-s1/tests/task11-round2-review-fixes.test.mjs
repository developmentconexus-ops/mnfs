import assert from 'node:assert/strict';
import { copyFile, mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { createS1Fixture } from '../src/fixture.mjs';
import { sha256Bytes } from '../src/artifacts.mjs';
import { S1_FROZEN_CANDIDATE_PROVENANCE } from '../src/preflight.mjs';

const CONTRACT_HASH = 'sha256:bd34f566bec1c3fc32b8ab1617dac88f997ab9a91cbc6b83e42eb27dcbf9736a';
const PLAN_BLOB = '277dffc521754a4370bfd94132dc9467589fdcf0';
const POLICY = Object.freeze({
  pinningRule: 'pin the exact reviewed candidate identity',
  upgradeTrigger: 'supported public-boundary or security change',
  mandatoryConformanceRerun: 'rerun the complete S1 contract',
  rollbackRule: 'restore the last passing identity',
});
const REMOVAL = Object.freeze({
  removeOrReplaceWhen: 'the candidate no longer conforms',
  authorityOrSecurityTrigger: 'authority or security is no longer bounded',
  provenanceOrLicenseTrigger: 'provenance or license cannot be verified',
  maintenanceTrigger: 'maintenance cost exceeds eliminated machinery',
  replacementOrExitPath: 'replace with another concrete passing adapter',
});

async function gitHead(repoRoot) {
  return new Promise((resolve, reject) => {
    const child = spawn('/usr/bin/git', ['-C', repoRoot, 'rev-parse', 'HEAD'], { stdio: ['ignore', 'pipe', 'pipe'] });
    const chunks = [];
    child.stdout.on('data', (chunk) => chunks.push(chunk));
    child.once('error', reject);
    child.once('close', (code) => code === 0 ? resolve(Buffer.concat(chunks).toString('utf8').trim()) : reject(new Error(`git exited ${code}`)));
  });
}

function runCliProcess(argv, cwd, env) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, argv, { cwd, env, stdio: ['ignore', 'pipe', 'pipe'] });
    const stdout = [];
    const stderr = [];
    child.stdout.on('data', (chunk) => stdout.push(chunk));
    child.stderr.on('data', (chunk) => stderr.push(chunk));
    child.once('error', reject);
    child.once('close', (exitCode, signal) => resolve({
      outcome: signal ? 'SIGNAL_DEATH' : 'NORMAL_EXIT',
      exitCode,
      stdout: Buffer.concat(stdout).toString('utf8'),
      stderr: Buffer.concat(stderr).toString('utf8'),
    }));
  });
}

test('CLI production composition runs the raw Pi double in a trusted child and blocks unavailable ACP surfaces', async () => {
  const fixture = await createS1Fixture();
  const base = await mkdtemp(path.join(tmpdir(), 'mnfs-arr-s1-round2-cli-'));
  const stateRoot = path.join(base, 'mnfs');
  const doubleSource = path.resolve('spikes/arr-s1/tests/fixtures/production-doubles.mjs');
  const stagedDouble = path.join(stateRoot, 'candidates', 'production-doubles.mjs');
  try {
    await mkdir(path.dirname(stagedDouble), { recursive: true });
    await copyFile(doubleSource, stagedDouble);
    const bytes = await readFile(stagedDouble);
    const stagedFile = {
      path: 'candidates/production-doubles.mjs',
      role: 'UPSTREAM_MODULE',
      sha256: sha256Bytes(bytes),
      sizeBytes: bytes.length,
    };
    const records = {};
    for (const [candidateShape, frozen] of Object.entries(S1_FROZEN_CANDIDATE_PROVENANCE)) {
      if (candidateShape === 'SECOND-ACP') continue;
      records[candidateShape] = {
        ...frozen,
        stagingMode: 'TEST_DOUBLE',
        stagedPaths: [stagedFile],
        upstreamSurfaces: { runtimeModule: stagedFile },
        environment: {
          PATH: '/usr/bin:/bin',
          LANG: 'C',
          LC_ALL: 'C',
          PI_CODING_AGENT_DIR: path.join(base, 'pi-credentials'),
          XDG_DATA_HOME: path.join(base, 'opencode-data'),
        },
        upgradePolicy: POLICY,
        removalConditions: REMOVAL,
      };
    }
    await writeFile(path.join(stateRoot, 'candidates', 'staging-manifest.json'), JSON.stringify({
      schemaVersion: 1,
      source: 'MNFS_TRUSTED_STAGING_V1',
      records,
    }));

    const baseSha = await gitHead(fixture.workspacePath);
    const token = `MNFS_AUTHORIZE_ARR_S1_EXECUTE plan_blob=${PLAN_BLOB} contract_sha256=${CONTRACT_HASH} base_sha=${baseSha} verify_run=987654321 scope=pi-first-runtime-conformance`;
    const cliPath = path.resolve('spikes/arr-s1/src/cli.mjs');
    const env = {
      ...process.env,
      HOME: base,
      XDG_STATE_HOME: base,
      PI_CODING_AGENT_DIR: path.join(base, 'pi-credentials'),
      XDG_DATA_HOME: path.join(base, 'opencode-data'),
      MNFS_ARR_S1_EXECUTE_AUTHORIZATION: token,
    };
    const run = await runCliProcess([cliPath, 'run', '--json', '--provider-class', 'fixture', '--auth-method-class', 'local-double'], fixture.workspacePath, env);
    assert.equal(run.outcome, 'NORMAL_EXIT');
    assert.equal(run.exitCode, 2, JSON.stringify(run));
    const runEntries = (await readdir(path.join(stateRoot, 'spikes', 'arr-s1'), { withFileTypes: true }))
      .filter((entry) => entry.isDirectory() && /^arr-s1-/u.test(entry.name));
    assert.equal(runEntries.length, 1);
    const runId = runEntries[0].name;

    const fresh = await runCliProcess([cliPath, 'report', '--run-id', runId, '--json'], fixture.workspacePath, env);
    assert.equal(fresh.outcome, 'NORMAL_EXIT');
    assert.equal(fresh.exitCode, 2);

    const runRoot = path.join(stateRoot, 'spikes', 'arr-s1', runId);
    const manifest = JSON.parse(await readFile(path.join(runRoot, 'manifest.json'), 'utf8'));
    const report = JSON.parse(await readFile(path.join(runRoot, 'report.json'), 'utf8'));
    const reportRecord = manifest.records.find((record) => record.path === 'report.json');
    const candidateRecords = manifest.records.filter((record) => record.binding?.candidateShape && record.binding.candidateShape !== 'S1-RUN');
    assert.ok(candidateRecords.length > 0, JSON.stringify({ run, report, manifest }));
    for (const record of candidateRecords) {
      assert.equal(record.binding.runId, reportRecord.binding.runId);
      assert.equal(record.binding.contractHash, reportRecord.binding.contractHash);
      assert.equal(record.binding.fixtureHash, reportRecord.binding.fixtureHash);
      assert.equal(record.binding.sourceTreeHash, reportRecord.binding.sourceTreeHash);
    }

    const tampered = candidateRecords[0];
    await writeFile(path.join(runRoot, tampered.path), 'tampered\n');
    const afterTamper = await runCliProcess([cliPath, 'report', '--run-id', runId, '--json'], fixture.workspacePath, env);
    assert.notEqual(afterTamper.exitCode, 0);
  } finally {
    await fixture.dispose();
    await rm(base, { recursive: true, force: true });
  }
});
