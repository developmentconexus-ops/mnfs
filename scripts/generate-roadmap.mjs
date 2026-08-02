#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { stripFrontmatter } from './document-utils.mjs';

const root = process.cwd();
const sourceRel = 'docs/product/blueprint/12-capability-roadmap.md';
const outputRel = 'docs/roadmap.md';
const sourcePath = path.join(root, sourceRel);
const outputPath = path.join(root, outputRel);

export async function renderRoadmap() {
  const source = await readFile(sourcePath, 'utf8');
  const body = stripFrontmatter(source, sourceRel);
  return `---
id: DOC-CAPABILITY-ROADMAP
title: MNFS Capability Roadmap
document_type: product_roadmap
form: reference
authority: generated_projection
status: generated
version: 2.0.0
owners:
  - developmentconexus-ops
generated_from:
  - DOC-PRODUCT-BLUEPRINT-12
related:
  - DOC-PRODUCT-BLUEPRINT
  - DOC-MNFS-CAPABILITY-REALIZATION-METHOD
---

<!-- GENERATED — DO NOT EDIT
Source: ${sourceRel}
Generator: scripts/generate-roadmap.mjs
Generator version: 1
-->

# MNFS capability roadmap

**Status:** Accepted architecture baseline  
**Version:** 2.0.0  
**Current gate:** AB1 — Architecture Baseline and Contract Reconciliation

> Edit the canonical Product Blueprint Section 12 and regenerate this projection.

---

${body}
`;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const check = process.argv.includes('--check');
  const rendered = await renderRoadmap();
  if (check) {
    const current = await readFile(outputPath, 'utf8');
    if (current !== rendered) {
      console.error('Capability roadmap projection is stale. Run npm run docs:generate.');
      process.exit(1);
    }
    console.log('Capability roadmap projection is current.');
  } else {
    await writeFile(outputPath, rendered, 'utf8');
    console.log(`Generated ${outputRel}.`);
  }
}
