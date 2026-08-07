#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const sourceDir = path.join(root, 'docs/product/blueprint');
const affected = [
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
  '12-capability-roadmap.md',
  '13-documentation-governance.md',
];

const specificMarkers = new Map([
  ['01-product-vision.md', 'Thin Sovereign Semantic Kernel'],
  ['02-domain-model.md', 'Runtime Session is observational'],
  ['03-lifecycle-flows.md', 'Validation Baseline'],
  ['04-engineering-system.md', 'OWN / ADOPT / ADAPT / SPIKE / REFERENCE / DEFER / REJECT'],
  ['05-system-architecture.md', 'Replaceable Agent Runtime'],
  ['06-roles-authority.md', 'Validator does not receive write authority by default'],
  ['07-quality-evidence.md', 'Implementer completion never grants acceptance'],
  ['08-state-recovery.md', 'Fresh Recovery does not depend on runtime transcript'],
  ['09-context-memory.md', 'HANDOFF_REQUIRED'],
  ['10-security-isolation.md', 'E0 → E4 ordinal ladder is superseded'],
  ['12-capability-roadmap.md', 'ARR-S0'],
  ['13-documentation-governance.md', 'Layered Agent Execution Planning'],
]);

for (const name of affected) {
  const text = await readFile(path.join(sourceDir, name), 'utf8');
  assert.match(text, /ARR-RECONCILIATION-2026-08-07/u, `${name} lacks ARR reconciliation marker`);
  assert.match(
    text,
    /Any conflicting tool-specific statement below is historical realization context, not current constitutional authority\./u,
    `${name} does not bound stale realization language`,
  );
  assert.ok(text.includes(specificMarkers.get(name)), `${name} lacks section-specific reconciled semantics`);
}

const aggregate = await readFile(path.join(root, 'docs/product/PRODUCT-BLUEPRINT.md'), 'utf8');
for (const marker of [
  'ARR-RECONCILIATION-2026-08-07',
  'Thin Sovereign Semantic Kernel',
  'Replaceable Agent Runtime',
  'E0 → E4 ordinal ladder is superseded',
  'HANDOFF_REQUIRED',
  'ARR-S0',
]) {
  assert.ok(aggregate.includes(marker), `generated Product Blueprint lacks ${marker}`);
}

console.log('ARR P1 Blueprint reconciliation tests passed.');
