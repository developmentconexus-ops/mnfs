#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const sections = [
  '01-product-vision.md',
  '02-domain-model.md',
  '03-lifecycle-flows.md',
  '04-engineering-system.md',
  '05-system-architecture.md',
  '06-roles-authority.md',
  '07-quality-evidence.md',
  '08-state-recovery.md',
  '09-context-memory.md',
  '10-security-isolation.md',
  '11-operator-observability.md',
  '12-capability-roadmap.md',
  '13-documentation-governance.md',
];

const root = process.cwd();
const sourceDir = path.join(root, 'docs/product/blueprint');
const outputPath = path.join(root, 'docs/product/PRODUCT-BLUEPRINT.md');

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function stripFrontmatter(value) {
  if (!value.startsWith('---\n')) return value.trim();
  const end = value.indexOf('\n---\n', 4);
  if (end === -1) throw new Error('Unclosed frontmatter');
  return value.slice(end + 5).trim();
}

export async function renderBlueprint() {
  const loaded = [];
  for (const name of sections) {
    const rel = `docs/product/blueprint/${name}`;
    const content = await readFile(path.join(sourceDir, name), 'utf8');
    loaded.push({ rel, content, body: stripFrontmatter(content) });
  }

  const manifest = loaded.map(({ rel, content }) => `${rel}:${sha256(content)}`).join('\n');
  const manifestHash = sha256(manifest);

  const header = `<!-- GENERATED — DO NOT EDIT
Source: docs/product/blueprint/*.md
Generator: scripts/generate-product-blueprint.mjs
Generator version: 1
Source manifest hash: sha256:${manifestHash}
-->

# MNFS Product Blueprint

**Status:** Accepted architecture baseline  
**Version:** 1.0.0  
**Authority:** Constitutional  
**Tracking:** GitHub Issue #6

> The editable sources are the 13 files under \`docs/product/blueprint/\`.
> This aggregate exists for complete reading and publication.

---

`;

  return header + loaded.map(({ body }) => body).join('\n\n---\n\n') + '\n';
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const check = process.argv.includes('--check');
  const rendered = await renderBlueprint();
  if (check) {
    const current = await readFile(outputPath, 'utf8');
    if (current !== rendered) {
      console.error('Product Blueprint aggregate is stale. Run npm run docs:generate.');
      process.exit(1);
    }
    console.log('Product Blueprint aggregate is current.');
  } else {
    await writeFile(outputPath, rendered, 'utf8');
    console.log(`Generated ${path.relative(root, outputPath)}.`);
  }
}
