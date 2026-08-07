#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const file = path.join(process.cwd(), 'scripts/test-documentation-tooling.mjs');
let source = await readFile(file, 'utf8');

source = source.replace(
  "import { readFile } from 'node:fs/promises';",
  "import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';\nimport { tmpdir } from 'node:os';\nimport { spawnSync } from 'node:child_process';",
);

const marker = "console.log('Documentation tooling tests passed.');";
if (!source.includes(marker)) throw new Error('documentation tooling completion marker not found');
if (source.includes('Architecture Spike Evidence validator accepts one exact valid fixture')) {
  console.log('B1 RED tests already staged.');
  process.exit(0);
}

const block = String.raw`
const spikeEvidenceTemp = await mkdtemp(path.join(tmpdir(), 'mnfs-arr-spike-evidence-'));
try {
  const artifactRoot = path.join(spikeEvidenceTemp, 'artifacts');
  await mkdir(artifactRoot, { recursive: true });
  const rawBytes = Buffer.from('raw-spike-evidence\n', 'utf8');
  await writeFile(path.join(artifactRoot, 'raw.bin'), rawBytes);
  const rawSha256 = 'sha256:' + createHash('sha256').update(rawBytes).digest('hex');

  const validSpikeEvidence = {
    schemaVersion: 1,
    spikeId: 'ARR-TEST',
    contractVersion: '1.0.0',
    runId: 'arr-test-run-001',
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

  async function invokeSpikeEvidenceValidator(name, evidence) {
    const evidencePath = path.join(spikeEvidenceTemp, name + '.json');
    await writeFile(evidencePath, JSON.stringify(evidence, null, 2) + '\n', 'utf8');
    const result = spawnSync(
      process.execPath,
      [
        path.join(root, 'scripts/validate-docs.mjs'),
        '--architecture-spike-evidence',
        evidencePath,
        '--artifact-root',
        artifactRoot,
      ],
      {
        cwd: root,
        encoding: 'utf8',
        shell: false,
      },
    );
    return {
      status: result.status,
      output: String(result.stdout ?? '') + '\n' + String(result.stderr ?? ''),
    };
  }

  {
    const result = await invokeSpikeEvidenceValidator('valid', validSpikeEvidence);
    assert.equal(result.status, 0, result.output);
    assert.match(result.output, /Architecture Spike Evidence validation passed/u);
  }

  {
    const evidence = structuredClone(validSpikeEvidence);
    delete evidence.contractVersion;
    const result = await invokeSpikeEvidenceValidator('missing-contract-version', evidence);
    assert.notEqual(result.status, 0, 'missing contractVersion must fail');
    assert.match(result.output, /missing required property contractVersion/u);
  }

  {
    const evidence = structuredClone(validSpikeEvidence);
    evidence.candidate = { id: 'candidate-without-provenance' };
    const result = await invokeSpikeEvidenceValidator('candidate-without-provenance', evidence);
    assert.notEqual(result.status, 0, 'candidate without provenance must fail');
    assert.match(result.output, /missing required property provenance/u);
  }

  {
    const evidence = structuredClone(validSpikeEvidence);
    evidence.rawArtifacts[0].sha256 = 'sha256:not-a-digest';
    const result = await invokeSpikeEvidenceValidator('invalid-artifact-sha', evidence);
    assert.notEqual(result.status, 0, 'invalid SHA-256 reference must fail');
    assert.match(result.output, /does not match/u);
  }

  {
    const evidence = structuredClone(validSpikeEvidence);
    evidence.criteria.push(structuredClone(evidence.criteria[0]));
    const result = await invokeSpikeEvidenceValidator('duplicate-criterion', evidence);
    assert.notEqual(result.status, 0, 'duplicate criterion IDs must fail');
    assert.match(result.output, /duplicate criterion id CRIT-001/u);
  }

  for (const failingResult of ['FAIL', 'BLOCKED', 'UNKNOWN']) {
    const evidence = structuredClone(validSpikeEvidence);
    evidence.criteria[0].result = failingResult;
    const result = await invokeSpikeEvidenceValidator('pass-with-' + failingResult.toLowerCase(), evidence);
    assert.notEqual(result.status, 0, 'PASS cannot contain required ' + failingResult);
    assert.match(result.output, /PASS verdict input cannot include required criterion CRIT-001/u);
  }

  {
    const evidence = structuredClone(validSpikeEvidence);
    evidence.rawArtifacts[0].sha256 = 'sha256:' + '0'.repeat(64);
    const result = await invokeSpikeEvidenceValidator('artifact-hash-mismatch', evidence);
    assert.notEqual(result.status, 0, 'artifact hash mismatch must fail');
    assert.match(result.output, /artifact hash mismatch for raw-001/u);
  }
} finally {
  await rm(spikeEvidenceTemp, { recursive: true, force: true });
}

`;

source = source.replace(marker, `${block}${marker}`);
await writeFile(file, source, 'utf8');
console.log('Staged B1 Architecture Spike Evidence RED tests.');
