#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { loadDocumentRegistry, resolveDocumentReference } from './document-utils.mjs';

const root = process.cwd();
const APPLICABILITY_STATES = new Set(['UNASSESSED', 'APPLICABLE', 'DEFERRED', 'NOT_APPLICABLE', 'BLOCKED', 'SUPERSEDED']);

function pathsFor(capabilityId) {
  const dir = path.join(root, 'docs/capabilities', capabilityId);
  return {
    dir,
    sourcePath: path.join(dir, 'TRACEABILITY.json'),
    coveragePath: path.join(dir, 'COVERAGE.md'),
    applicabilityPath: path.join(dir, 'APPLICABILITY.md'),
  };
}

function count(requirements, predicate) {
  return requirements.filter(predicate).length;
}

function gate(result, reason, errors = []) {
  return { result, reason, errors };
}

export async function evaluateReadiness(data, registry = null) {
  registry ??= await loadDocumentRegistry(root);
  const reqs = data.requirements ?? [];
  const applicability = data.applicability ?? [];

  const r0Errors = [];
  const baselineDocs = [data.baseline?.blueprint, data.baseline?.roadmap].filter(Boolean);
  for (const binding of baselineDocs) {
    const resolved = resolveDocumentReference(binding.documentId, registry);
    if (!resolved.ok) r0Errors.push(`${binding.documentId}: ${resolved.reason}`);
    else if (resolved.document.metadata?.version !== binding.version) {
      r0Errors.push(`${binding.documentId}: expected version ${binding.version}, found ${resolved.document.metadata?.version ?? 'none'}`);
    }
  }
  for (const adr of data.baseline?.adrs ?? []) {
    const resolved = resolveDocumentReference(adr, registry);
    if (!resolved.ok) r0Errors.push(`${adr}: ${resolved.reason}`);
  }
  if (!data.baseline?.missionContract?.missionId || !Number.isInteger(data.baseline?.missionContract?.currentRevision)) {
    r0Errors.push('Mission contract baseline is incomplete.');
  }
  const r0 = r0Errors.length
    ? gate('BLOCKED', `${r0Errors.length} baseline source(s) unresolved or stale`, r0Errors)
    : gate('PASS', 'Blueprint, roadmap, ADR and Mission baseline bindings resolve to the declared versions.');

  const r1Errors = [];
  const seenDomains = new Set();
  for (const item of applicability) {
    if (!item.domain) r1Errors.push('Applicability entry without domain.');
    if (seenDomains.has(item.domain)) r1Errors.push(`Duplicate applicability domain: ${item.domain}`);
    seenDomains.add(item.domain);
    if (!APPLICABILITY_STATES.has(item.state)) r1Errors.push(`${item.domain}: invalid state ${item.state}`);
    if (item.state === 'UNASSESSED') r1Errors.push(`${item.domain}: remains UNASSESSED`);
    if (!item.rationale?.trim()) r1Errors.push(`${item.domain}: missing rationale`);
    if (!item.requiredOutput?.trim()) r1Errors.push(`${item.domain}: missing required output/disposition`);
    if (item.state === 'DEFERRED' && !item.deferredTo?.trim()) r1Errors.push(`${item.domain}: DEFERRED without destination Product Milestone`);
  }
  if (!applicability.length) r1Errors.push('No applicability domains declared.');
  const r1 = r1Errors.length
    ? gate('BLOCKED', `${r1Errors.length} applicability defect(s)`, r1Errors)
    : gate('PASS', `${applicability.length} impact domains assessed with explicit dispositions.`);

  const r2Errors = [];
  const seenRequirements = new Set();
  for (const requirement of reqs) {
    if (seenRequirements.has(requirement.id)) r2Errors.push(`${requirement.id}: duplicate requirement ID`);
    seenRequirements.add(requirement.id);
    for (const source of requirement.source ?? []) {
      const resolved = resolveDocumentReference(source, registry);
      if (!resolved.ok) r2Errors.push(`${requirement.id}: source ${source} ${resolved.reason}`);
    }
    if (requirement.level === 'MUST' && !(requirement.proposedAllocation?.length > 0)) {
      r2Errors.push(`${requirement.id}: MUST has no proposed allocation`);
    }
    if (requirement.level === 'MUST' && !(requirement.verifiedBy?.length > 0)) {
      r2Errors.push(`${requirement.id}: MUST has no verification method`);
    }
  }
  if (!reqs.length) r2Errors.push('No capability requirements declared.');
  const r2 = r2Errors.length
    ? gate('BLOCKED', `${r2Errors.length} requirement traceability defect(s)`, r2Errors)
    : gate('PASS', `${reqs.length} requirements are uniquely identified, sourced and proof-planned.`);

  const computed = { R0: r0, R1: r1, R2: r2 };
  for (const key of ['R3', 'R4', 'R5', 'R6', 'R7', 'R8']) {
    computed[key] = data.readiness?.[key] ?? gate('NOT_STARTED', 'No readiness disposition recorded.');
  }
  return computed;
}

export async function renderApplicability(capabilityId = 'CAP-EXECUTION') {
  const { sourcePath } = pathsFor(capabilityId);
  const data = JSON.parse(await readFile(sourcePath, 'utf8'));
  const rows = (data.applicability ?? []).map((item) => {
    const state = item.state === 'DEFERRED' && item.deferredTo ? `${item.state} → ${item.deferredTo}` : item.state;
    return `| ${item.domain} | ${state} | ${item.rationale} | ${item.requiredOutput} |`;
  }).join('\n');

  return `---
id: ${capabilityId}-APPLICABILITY
title: ${capabilityId} Applicability Matrix
document_type: applicability_matrix
form: reference
authority: generated_projection
status: generated
version: ${data.capabilityVersion}
owners:
  - developmentconexus-ops
generated_from:
  - ${capabilityId}
related:
  - ${capabilityId}
---

<!-- GENERATED — DO NOT EDIT
Source: docs/capabilities/${capabilityId}/TRACEABILITY.json
Generator: scripts/generate-capability-coverage.mjs
Generator version: 2
-->

# ${capabilityId} Applicability Matrix

| Domain | State | Rationale | Required output or disposition |
|---|---|---|---|
${rows}

## Readiness statement

Every impact domain has an explicit state. \`DEFERRED\` entries name a Product Milestone and \`NOT_APPLICABLE\` entries retain a rationale and disposition.
`;
}

export async function renderCoverage(capabilityId = 'CAP-EXECUTION') {
  const { sourcePath } = pathsFor(capabilityId);
  const data = JSON.parse(await readFile(sourcePath, 'utf8'));
  const reqs = data.requirements ?? [];
  const readinessData = await evaluateReadiness(data);
  const rows = [
    ['Requirements', reqs.length],
    ['MUST', count(reqs, (r) => r.level === 'MUST')],
    ['SHOULD', count(reqs, (r) => r.level === 'SHOULD')],
    ['Unassessed requirements', count(reqs, (r) => r.state === 'UNASSESSED')],
    ['Applicability domains', data.applicability?.length ?? 0],
    ['Requirements with source', `${count(reqs, (r) => r.source?.length > 0)}/${reqs.length}`],
    ['Requirements with proposed allocation', `${count(reqs, (r) => r.proposedAllocation?.length > 0)}/${reqs.length}`],
    ['Requirements with verification method', `${count(reqs, (r) => r.verifiedBy?.length > 0)}/${reqs.length}`],
    ['Designed', count(reqs, (r) => r.state === 'DESIGNED')],
    ['Blocked', count(reqs, (r) => r.state === 'BLOCKED')],
    ['Verified', count(reqs, (r) => r.state === 'VERIFIED')],
    ['Evidenced', count(reqs, (r) => r.evidencedBy?.length > 0)],
  ];

  const readiness = Object.entries(readinessData)
    .map(([gateId, value]) => `| ${gateId} | ${value.result} | ${value.reason} |`)
    .join('\n');
  const calculationErrors = Object.entries(readinessData)
    .flatMap(([gateId, value]) => (value.errors ?? []).map((error) => `- **${gateId}:** ${error}`));
  const blockers = (data.blockingItems ?? [])
    .map((item, index) => `${index + 1}. **${item.id}:** ${item.statement}`)
    .join('\n');
  const next = (data.nextSequence ?? []).join('\n→ ');

  return `---
id: ${capabilityId}-COVERAGE
title: ${capabilityId} Planning Coverage
document_type: coverage_report
form: reference
authority: generated_projection
status: generated
version: ${data.capabilityVersion}
owners:
  - developmentconexus-ops
generated_from:
  - ${capabilityId}
related:
  - ${capabilityId}
  - ${capabilityId}-APPLICABILITY
---

<!-- GENERATED — DO NOT EDIT
Source: docs/capabilities/${capabilityId}/TRACEABILITY.json
Generator: scripts/generate-capability-coverage.mjs
Generator version: 2
-->

# ${capabilityId} Planning Coverage

## Summary

| Measure | Result |
|---|---:|
${rows.map(([name, value]) => `| ${name} | ${value} |`).join('\n')}

## Readiness Gates

| Gate | Result | Reason |
|---|---|---|
${readiness}

## Computed gate defects

${calculationErrors.join('\n') || 'None.'}

## Blocking items

${blockers || 'None.'}

## Required next sequence

\`\`\`text
${next || 'No next sequence recorded.'}
\`\`\`

## Coverage interpretation

R0–R2 are computed from canonical document versions, the Applicability Matrix and requirement traceability. R3–R8 remain lifecycle dispositions until their corresponding work exists. This report does not claim implementation readiness unless R0–R4 pass.
`;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  const capabilityArg = args.find((arg) => arg.startsWith('--capability='));
  const capabilityId = capabilityArg?.split('=')[1] ?? 'CAP-EXECUTION';
  const check = args.includes('--check');
  const { coveragePath, applicabilityPath } = pathsFor(capabilityId);
  const coverage = await renderCoverage(capabilityId);
  const applicability = await renderApplicability(capabilityId);
  if (check) {
    const [currentCoverage, currentApplicability] = await Promise.all([
      readFile(coveragePath, 'utf8'),
      readFile(applicabilityPath, 'utf8'),
    ]);
    const stale = [];
    if (currentCoverage !== coverage) stale.push(`${capabilityId} coverage report`);
    if (currentApplicability !== applicability) stale.push(`${capabilityId} applicability matrix`);
    if (stale.length) {
      console.error(`${stale.join(' and ')} ${stale.length === 1 ? 'is' : 'are'} stale.`);
      process.exit(1);
    }
    console.log(`${capabilityId} coverage and applicability projections are current.`);
  } else {
    await Promise.all([
      writeFile(coveragePath, coverage, 'utf8'),
      writeFile(applicabilityPath, applicability, 'utf8'),
    ]);
    console.log(`Generated ${path.relative(root, applicabilityPath)} and ${path.relative(root, coveragePath)}.`);
  }
}
