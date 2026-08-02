#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();

function pathsFor(capabilityId) {
  const dir = path.join(root, 'docs/capabilities', capabilityId);
  return {
    dir,
    sourcePath: path.join(dir, 'TRACEABILITY.json'),
    outputPath: path.join(dir, 'COVERAGE.md'),
  };
}

function count(requirements, predicate) {
  return requirements.filter(predicate).length;
}

export async function renderCoverage(capabilityId = 'CAP-EXECUTION') {
  const { sourcePath } = pathsFor(capabilityId);
  const data = JSON.parse(await readFile(sourcePath, 'utf8'));
  const reqs = data.requirements ?? [];
  const rows = [
    ['Requirements', reqs.length],
    ['MUST', count(reqs, (r) => r.level === 'MUST')],
    ['SHOULD', count(reqs, (r) => r.level === 'SHOULD')],
    ['Unassessed', count(reqs, (r) => r.state === 'UNASSESSED')],
    ['Requirements with source', `${count(reqs, (r) => r.source?.length > 0)}/${reqs.length}`],
    ['Requirements with proposed allocation', `${count(reqs, (r) => r.proposedAllocation?.length > 0)}/${reqs.length}`],
    ['Requirements with verification method', `${count(reqs, (r) => r.verifiedBy?.length > 0)}/${reqs.length}`],
    ['Designed', count(reqs, (r) => r.state === 'DESIGNED')],
    ['Blocked', count(reqs, (r) => r.state === 'BLOCKED')],
    ['Verified', count(reqs, (r) => r.state === 'VERIFIED')],
    ['Evidenced', count(reqs, (r) => r.evidencedBy?.length > 0)],
  ];

  const readiness = Object.entries(data.readiness ?? {})
    .map(([gate, value]) => `| ${gate} | ${value.result} | ${value.reason} |`)
    .join('\n');

  const blockers = (data.blockingItems ?? [])
    .map((item, index) => `${index + 1}. **${item.id}:** ${item.statement}`)
    .join('\n');

  const next = (data.nextSequence ?? []).join('\n→ ');

  return `<!-- GENERATED — DO NOT EDIT
Source: docs/capabilities/${capabilityId}/TRACEABILITY.json
Generator: scripts/generate-capability-coverage.mjs
Generator version: 1
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

## Blocking items

${blockers || 'None.'}

## Required next sequence

\`\`\`text
${next || 'No next sequence recorded.'}
\`\`\`

## Coverage interpretation

This report does not claim implementation readiness unless R0–R4 pass. It makes omissions, deferments and blockers explicit rather than depending on Lead memory.
`;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  const capabilityArg = args.find((arg) => arg.startsWith('--capability='));
  const capabilityId = capabilityArg?.split('=')[1] ?? 'CAP-EXECUTION';
  const check = args.includes('--check');
  const { outputPath } = pathsFor(capabilityId);
  const rendered = await renderCoverage(capabilityId);
  if (check) {
    const current = await readFile(outputPath, 'utf8');
    if (current !== rendered) {
      console.error(`${capabilityId} coverage report is stale.`);
      process.exit(1);
    }
    console.log(`${capabilityId} coverage report is current.`);
  } else {
    await writeFile(outputPath, rendered, 'utf8');
    console.log(`Generated ${path.relative(root, outputPath)}.`);
  }
}
