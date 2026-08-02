#!/usr/bin/env node
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { renderBlueprint } from './generate-product-blueprint.mjs';
import { renderCoverage } from './generate-capability-coverage.mjs';

const root = process.cwd();
const errors = [];

async function exists(rel) {
  try {
    await stat(path.join(root, rel));
    return true;
  } catch {
    return false;
  }
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(full));
    else files.push(full);
  }
  return files;
}

function frontmatter(value) {
  if (!value.startsWith('---\n')) return null;
  const end = value.indexOf('\n---\n', 4);
  if (end === -1) return null;
  const raw = value.slice(4, end);
  const id = raw.match(/^id:\s*(.+)$/m)?.[1]?.trim();
  const status = raw.match(/^status:\s*(.+)$/m)?.[1]?.trim();
  const owners = /^owners:\s*$/m.test(raw) && /^\s{2}-\s+.+$/m.test(raw);
  return { id, status, owners };
}

const required = [
  'docs/DOCUMENTATION-MAP.md',
  'docs/product/README.md',
  'docs/product/PRODUCT-BLUEPRINT.md',
  'docs/product/CAPABILITY-REALIZATION-METHOD.md',
  'docs/capabilities/CAP-EXECUTION/SPEC.md',
  'docs/capabilities/CAP-EXECUTION/TRACEABILITY.json',
  'docs/capabilities/CAP-EXECUTION/COVERAGE.md',
  'docs/research/LEGACY-MNFS-HARNESS-MAP.md',
  'docs/research/FIRSTMATE-INSPIRATION-MAP.md',
  'docs/roadmap.md',
];

for (const rel of required) {
  if (!await exists(rel)) errors.push(`Missing required document: ${rel}`);
}

const canonicalRoots = [
  'docs/product',
  'docs/capabilities',
  'docs/research',
];

const ids = new Map();
for (const relRoot of canonicalRoots) {
  if (!await exists(relRoot)) continue;
  for (const file of await walk(path.join(root, relRoot))) {
    if (!file.endsWith('.md')) continue;
    const content = await readFile(file, 'utf8');
    const meta = frontmatter(content);
    const rel = path.relative(root, file);
    if (!meta) {
      if (!rel.endsWith('PRODUCT-BLUEPRINT.md') && !rel.endsWith('COVERAGE.md')) {
        errors.push(`Missing or invalid frontmatter: ${rel}`);
      }
      continue;
    }
    if (!meta.id) errors.push(`Missing document id: ${rel}`);
    if (!meta.status) errors.push(`Missing document status: ${rel}`);
    if (!meta.owners) errors.push(`Missing owners list: ${rel}`);
    if (meta.id) {
      if (ids.has(meta.id)) errors.push(`Duplicate document id ${meta.id}: ${ids.get(meta.id)} and ${rel}`);
      else ids.set(meta.id, rel);
    }
  }
}

const aggregatePath = path.join(root, 'docs/product/PRODUCT-BLUEPRINT.md');
if (await exists('docs/product/PRODUCT-BLUEPRINT.md')) {
  const current = await readFile(aggregatePath, 'utf8');
  const rendered = await renderBlueprint();
  if (current !== rendered) errors.push('Product Blueprint aggregate is stale.');
}

if (await exists('docs/capabilities/CAP-EXECUTION/COVERAGE.md')) {
  const current = await readFile(path.join(root, 'docs/capabilities/CAP-EXECUTION/COVERAGE.md'), 'utf8');
  const rendered = await renderCoverage();
  if (current !== rendered) errors.push('CAP-EXECUTION coverage is stale.');
}

if (await exists('.mnfs/missions/MIS-002/plan.json')) {
  const plan = JSON.parse(await readFile(path.join(root, '.mnfs/missions/MIS-002/plan.json'), 'utf8'));
  if (plan.revision !== 3 || plan.contentHash !== 'sha256:f95ffded37af764e5f76775ec6bbdda69d5638246609451ce37bf524908cf8c1') {
    errors.push('Historical MIS-002 revision 3 was modified; use Replan instead.');
  }
}

if (errors.length) {
  console.error('Documentation validation failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Documentation validation passed (${ids.size} canonical IDs checked).`);
