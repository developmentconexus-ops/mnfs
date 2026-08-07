#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const root = process.cwd();
const schema = JSON.parse(await readFile(path.join(root, 'schemas/architecture-spike-evidence.schema.json'), 'utf8'));

assert.ok(schema.required.includes('contractHash'), 'Architecture Spike Evidence must require contractHash');
assert.equal(schema.properties.contractHash.pattern, '^sha256:[a-f0-9]{64}$');

const temp = await mkdtemp(path.join(tmpdir(), 'mnfs-arr-contract-binding-'));
try {
  const artifactRoot = path.join(temp, 'artifacts');
  await mkdir(artifactRoot, { recursive: true });

  const contractPath = path.join(temp, 'arr-test-contract.md');
  const contractBytes = Buffer.from('# ARR-TEST frozen contract\n\ncriterion: CRIT-001\n', 'utf8');
  await writeFile(contractPath, contractBytes);
  const contractHash = 'sha256:' + createHash('sha256').update(contractBytes).digest('hex');

  const rawBytes = Buffer.from('raw-spike-evidence\n', 'utf8');
  await writeFile(path.join(artifactRoot, 'raw.bin'), rawBytes);
  const rawSha256 = 'sha256:' + createHash('sha256').update(rawBytes).digest('hex');

  const evidence = {
    schemaVersion: 1,
    spikeId: 'ARR-TEST',
    contractVersion: '1.0.0',
    contractHash,
    runId: 'arr-test-run-contract-binding',
    startedAt: '2026-08-07T12:00:00.000Z',
    finishedAt: '2026-08-07T12:00:01.000Z',
    canonicalHost: {
      kind: 'ubuntu-wsl2',
      identity: 'fixture-host',
    },
    source: {
      commitSha: 'a'.repeat(40),
      treeSha: 'b'.repeat(40),
    },
    candidate: null,
    criteria: [
      {
        id: 'CRIT-001',
        required: true,
        result: 'PASS',
        artifactRefs: ['raw-001'],
      },
    ],
    rawArtifacts: [
      {
        id: 'raw-001',
        path: 'raw.bin',
        sha256: rawSha256,
        sizeBytes: rawBytes.length,
      },
    ],
    limitations: [],
    measurements: [],
    verdictInput: {
      status: 'PASS',
      reasons: ['all required fixture criteria passed'],
    },
  };

  async function invoke(name, value, { contract = contractPath } = {}) {
    const evidencePath = path.join(temp, name + '.json');
    await writeFile(evidencePath, JSON.stringify(value, null, 2) + '\n', 'utf8');
    const argv = [
      path.join(root, 'scripts/validate-docs.mjs'),
      '--architecture-spike-evidence',
      evidencePath,
      '--artifact-root',
      artifactRoot,
    ];
    if (contract) argv.push('--contract', contract);
    const result = spawnSync(process.execPath, argv, {
      cwd: root,
      encoding: 'utf8',
      shell: false,
    });
    return {
      status: result.status,
      output: String(result.stdout ?? '') + '\n' + String(result.stderr ?? ''),
    };
  }

  {
    const result = await invoke('valid-contract-binding', evidence);
    assert.equal(result.status, 0, result.output);
    assert.match(result.output, /Architecture Spike Evidence validation passed/u);
  }

  {
    const result = await invoke('missing-contract-argument', evidence, { contract: null });
    assert.notEqual(result.status, 0, 'validator must require exact contract bytes');
    assert.match(result.output, /missing required argument --contract/u);
  }

  {
    const mismatched = structuredClone(evidence);
    mismatched.contractHash = 'sha256:' + '0'.repeat(64);
    const result = await invoke('contract-hash-mismatch', mismatched);
    assert.notEqual(result.status, 0, 'contract hash mismatch must fail');
    assert.match(result.output, /contract hash mismatch/u);
  }
} finally {
  await rm(temp, { recursive: true, force: true });
}

console.log('Architecture Spike contract binding tests passed.');
