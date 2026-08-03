#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { evaluateReadiness } from './generate-capability-coverage.mjs';
import { loadDocumentRegistry, parseFrontmatter, resolveDocumentReference, validateJsonSchema } from './document-utils.mjs';

const root = process.cwd();
const registry = await loadDocumentRegistry(root);
const traceability = JSON.parse(await readFile(path.join(root, 'docs/capabilities/CAP-EXECUTION/TRACEABILITY.json'), 'utf8'));
const metadataSchema = JSON.parse(await readFile(path.join(root, 'schemas/document-metadata.schema.json'), 'utf8'));

const historicalMissionText = await readFile(
  path.join(root, '.mnfs/missions/MIS-002/history/revision-0003.json'),
  'utf8',
);
const historicalMissionBlob = createHash('sha1')
  .update(`blob ${Buffer.byteLength(historicalMissionText)}\0`)
  .update(historicalMissionText)
  .digest('hex');
assert.equal(historicalMissionBlob, '6b79117fe66cd5c9c8142099828812f470ce20de');

const parsed = parseFrontmatter(`---\nid: DOC-TEST\ntitle: Test\ndocument_type: reference\nauthority: reference\nstatus: accepted\nowners:\n  - owner\n---\n\n# Test\n`, 'fixture.md');
assert.deepEqual(parsed.metadata.owners, ['owner']);
assert.equal(validateJsonSchema(parsed.metadata, metadataSchema).length, 0);
assert.ok(validateJsonSchema({ ...parsed.metadata, owners: [] }, metadataSchema).some((error) => error.includes('at least 1')));

assert.equal(resolveDocumentReference('DOC-PRODUCT-BLUEPRINT-01#pb-p4', registry).ok, true);
assert.equal(resolveDocumentReference('DOC-NOT-REAL', registry).ok, false);

const base = await evaluateReadiness(structuredClone(traceability), registry);
assert.equal(base.R0.result, 'PASS');
assert.equal(base.R1.result, 'PASS');
assert.equal(base.R2.result, 'PASS');

const staleBaseline = structuredClone(traceability);
staleBaseline.baseline.roadmap.version = '0.0.0';
assert.equal((await evaluateReadiness(staleBaseline, registry)).R0.result, 'BLOCKED');

const unassessed = structuredClone(traceability);
unassessed.applicability[0].state = 'UNASSESSED';
assert.equal((await evaluateReadiness(unassessed, registry)).R1.result, 'BLOCKED');

const unresolvedSource = structuredClone(traceability);
unresolvedSource.requirements[0].source = ['DOC-NOT-REAL'];
assert.equal((await evaluateReadiness(unresolvedSource, registry)).R2.result, 'BLOCKED');

const missingProof = structuredClone(traceability);
missingProof.requirements.find((item) => item.level === 'MUST').verifiedBy = [];
assert.equal((await evaluateReadiness(missingProof, registry)).R2.result, 'BLOCKED');

console.log('Documentation tooling tests passed.');
