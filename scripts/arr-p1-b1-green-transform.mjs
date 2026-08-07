#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const file = path.join(process.cwd(), 'scripts/validate-docs.mjs');
let source = await readFile(file, 'utf8');

source = source.replace(
  "import { readFile } from 'node:fs/promises';",
  "import { lstat, readFile, realpath } from 'node:fs/promises';",
);

const rootMarker = "const root = process.cwd();\n";
if (!source.includes(rootMarker)) throw new Error('validate-docs root marker not found');
if (!source.includes("--architecture-spike-evidence")) {
  source = source.replace(
    rootMarker,
    `${rootMarker}if (process.argv.includes('--architecture-spike-evidence')) await runArchitectureSpikeEvidenceCli();\n`,
  );
}

const requiredMarker = "  'schemas/research-sources.schema.json',\n";
if (!source.includes(requiredMarker)) throw new Error('required schema marker not found');
if (!source.includes("'schemas/architecture-spike-evidence.schema.json'")) {
  source = source.replace(
    requiredMarker,
    `${requiredMarker}  'schemas/architecture-spike-evidence.schema.json',\n`,
  );
}

const functionMarker = 'async function readJson(rel) {';
if (!source.includes(functionMarker)) throw new Error('readJson marker not found');
if (!source.includes('async function runArchitectureSpikeEvidenceCli()')) {
  const functions = String.raw`
async function runArchitectureSpikeEvidenceCli() {
  const evidenceFlag = '--architecture-spike-evidence';
  const artifactFlag = '--artifact-root';
  let evidencePath;
  let artifactRoot;
  const seen = new Set();

  for (let index = 2; index < process.argv.length; index += 1) {
    const flag = process.argv[index];
    if (![evidenceFlag, artifactFlag].includes(flag)) {
      failArchitectureSpikeEvidence([`unknown Architecture Spike Evidence argument ${flag}`]);
    }
    if (seen.has(flag)) failArchitectureSpikeEvidence([`duplicate Architecture Spike Evidence argument ${flag}`]);
    seen.add(flag);
    const value = process.argv[index + 1];
    if (!value || value.startsWith('--')) failArchitectureSpikeEvidence([`missing value for ${flag}`]);
    index += 1;
    if (flag === evidenceFlag) evidencePath = path.resolve(value);
    if (flag === artifactFlag) artifactRoot = path.resolve(value);
  }

  const argumentErrors = [];
  if (!evidencePath) argumentErrors.push(`missing required argument ${evidenceFlag}`);
  if (!artifactRoot) argumentErrors.push(`missing required argument ${artifactFlag}`);
  if (argumentErrors.length) failArchitectureSpikeEvidence(argumentErrors);

  let schema;
  let evidence;
  try {
    schema = JSON.parse(await readFile(path.join(root, 'schemas/architecture-spike-evidence.schema.json'), 'utf8'));
  } catch (error) {
    failArchitectureSpikeEvidence([`architecture spike evidence schema is unreadable or invalid JSON (${error.message})`]);
  }
  try {
    evidence = JSON.parse(await readFile(evidencePath, 'utf8'));
  } catch (error) {
    failArchitectureSpikeEvidence([`evidence file is unreadable or invalid JSON (${error.message})`]);
  }

  const validationErrors = validateJsonSchema(evidence, schema, '$');
  if (validationErrors.length === 0) {
    validationErrors.push(...await validateArchitectureSpikeEvidenceSemantics(evidence, artifactRoot));
  }

  if (validationErrors.length) failArchitectureSpikeEvidence(validationErrors);
  console.log('Architecture Spike Evidence validation passed.');
  process.exit(0);
}

function failArchitectureSpikeEvidence(validationErrors) {
  console.error('Architecture Spike Evidence validation failed:');
  for (const error of validationErrors) console.error(`- ${error}`);
  process.exit(1);
}

async function validateArchitectureSpikeEvidenceSemantics(evidence, artifactRoot) {
  const validationErrors = [];

  const criterionIds = new Set();
  for (const criterion of evidence.criteria) {
    if (criterionIds.has(criterion.id)) validationErrors.push(`duplicate criterion id ${criterion.id}`);
    criterionIds.add(criterion.id);
    if (evidence.verdictInput.status === 'PASS' && criterion.required && criterion.result !== 'PASS') {
      validationErrors.push(`PASS verdict input cannot include required criterion ${criterion.id} with result ${criterion.result}`);
    }
  }

  const artifactById = new Map();
  for (const artifact of evidence.rawArtifacts) {
    if (artifactById.has(artifact.id)) validationErrors.push(`duplicate raw artifact id ${artifact.id}`);
    artifactById.set(artifact.id, artifact);
    if (artifact.sizeBytes < 0) validationErrors.push(`artifact ${artifact.id} has negative sizeBytes`);
  }

  for (const criterion of evidence.criteria) {
    for (const artifactId of criterion.artifactRefs) {
      if (!artifactById.has(artifactId)) validationErrors.push(`criterion ${criterion.id} references unknown artifact ${artifactId}`);
    }
  }
  for (const measurement of evidence.measurements) {
    for (const artifactId of measurement.artifactRefs) {
      if (!artifactById.has(artifactId)) validationErrors.push(`measurement ${measurement.id} references unknown artifact ${artifactId}`);
    }
  }

  const startedAt = Date.parse(evidence.startedAt);
  const finishedAt = Date.parse(evidence.finishedAt);
  if (!Number.isFinite(startedAt)) validationErrors.push('startedAt is not a valid timestamp');
  if (!Number.isFinite(finishedAt)) validationErrors.push('finishedAt is not a valid timestamp');
  if (Number.isFinite(startedAt) && Number.isFinite(finishedAt) && finishedAt < startedAt) {
    validationErrors.push('finishedAt precedes startedAt');
  }

  let rootRealpath;
  try {
    rootRealpath = await realpath(artifactRoot);
  } catch (error) {
    validationErrors.push(`artifact root is unavailable (${error.code ?? error.message})`);
    return validationErrors;
  }

  for (const artifact of evidence.rawArtifacts) {
    const normalized = path.normalize(artifact.path);
    if (
      path.isAbsolute(artifact.path)
      || artifact.path.includes('\\')
      || normalized === '..'
      || normalized.startsWith(`..${path.sep}`)
      || normalized === '.'
    ) {
      validationErrors.push(`artifact path escapes or is ambiguous for ${artifact.id}`);
      continue;
    }

    const candidatePath = path.resolve(rootRealpath, normalized);
    if (candidatePath !== rootRealpath && !candidatePath.startsWith(`${rootRealpath}${path.sep}`)) {
      validationErrors.push(`artifact path escapes root for ${artifact.id}`);
      continue;
    }

    let stats;
    try {
      stats = await lstat(candidatePath);
    } catch (error) {
      validationErrors.push(`artifact missing for ${artifact.id} (${error.code ?? error.message})`);
      continue;
    }
    if (stats.isSymbolicLink()) {
      validationErrors.push(`artifact symlink is not allowed for ${artifact.id}`);
      continue;
    }
    if (!stats.isFile()) {
      validationErrors.push(`artifact is not a regular file for ${artifact.id}`);
      continue;
    }

    let artifactRealpath;
    try {
      artifactRealpath = await realpath(candidatePath);
    } catch (error) {
      validationErrors.push(`artifact realpath unavailable for ${artifact.id} (${error.code ?? error.message})`);
      continue;
    }
    if (artifactRealpath !== rootRealpath && !artifactRealpath.startsWith(`${rootRealpath}${path.sep}`)) {
      validationErrors.push(`artifact realpath escapes root for ${artifact.id}`);
      continue;
    }

    let bytes;
    try {
      bytes = await readFile(artifactRealpath);
    } catch (error) {
      validationErrors.push(`artifact unreadable for ${artifact.id} (${error.code ?? error.message})`);
      continue;
    }
    if (bytes.length !== artifact.sizeBytes) {
      validationErrors.push(`artifact size mismatch for ${artifact.id}: expected ${artifact.sizeBytes}, observed ${bytes.length}`);
    }
    const observedHash = `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
    if (observedHash !== artifact.sha256) validationErrors.push(`artifact hash mismatch for ${artifact.id}`);
  }

  return validationErrors;
}

`;
  source = source.replace(functionMarker, `${functions}${functionMarker}`);
}

await writeFile(file, source, 'utf8');
console.log('Applied Architecture Spike Evidence validator hook.');
