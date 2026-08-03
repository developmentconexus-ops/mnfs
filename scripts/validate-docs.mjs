#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import {
  collectAnchors,
  exists,
  loadDocumentRegistry,
  parseFrontmatter,
  resolveDocumentReference,
  validateJsonSchema,
} from './document-utils.mjs';
import { renderBlueprint } from './generate-product-blueprint.mjs';
import { evaluateReadiness, renderApplicability, renderCoverage } from './generate-capability-coverage.mjs';
import { renderRoadmap } from './generate-roadmap.mjs';
import { hashSecE1Bytes, validateSecE1 } from './sec-e1-policy.mjs';

const root = process.cwd();
const errors = [];
const warnings = [];

const required = [
  'docs/DOCUMENTATION-MAP.md',
  'docs/product/README.md',
  'docs/product/PRODUCT-BLUEPRINT.md',
  'docs/product/CAPABILITY-REALIZATION-METHOD.md',
  'docs/capabilities/CAP-EXECUTION/SPEC.md',
  'docs/capabilities/CAP-EXECUTION/TRACEABILITY.json',
  'docs/capabilities/CAP-EXECUTION/APPLICABILITY.md',
  'docs/capabilities/CAP-EXECUTION/COVERAGE.md',
  'docs/research/LEGACY-MNFS-HARNESS-MAP.md',
  'docs/research/FIRSTMATE-INSPIRATION-MAP.md',
  'docs/roadmap.md',
  'policies/SEC-E1.json',
  'schemas/document-metadata.schema.json',
  'schemas/capability-traceability.schema.json',
  'schemas/research-sources.schema.json',
];

for (const rel of required) if (!await exists(root, rel)) errors.push(`Missing required artifact: ${rel}`);

const [documentSchema, traceabilitySchema, researchSourcesSchema] = await Promise.all([
  readJson('schemas/document-metadata.schema.json'),
  readJson('schemas/capability-traceability.schema.json'),
  readJson('schemas/research-sources.schema.json'),
]);

const registry = await loadDocumentRegistry(root);
const metadataById = new Map();
const allowedStatuses = {
  constitutional: new Set(['draft', 'proposed', 'accepted', 'superseded']),
  decision: new Set(['proposed', 'accepted', 'rejected', 'superseded', 'deprecated']),
  specification: new Set(['draft', 'proposed', 'accepted', 'implementing', 'implemented', 'deferred', 'superseded', 'withdrawn']),
  contract: new Set(['draft', 'proposed', 'accepted', 'superseded']),
  standard_policy: new Set(['draft', 'proposed', 'candidate', 'pilot', 'ratified', 'enforced', 'accepted', 'deprecated', 'superseded']),
  policy: new Set(['draft', 'proposed', 'accepted', 'candidate', 'pilot', 'ratified', 'enforced', 'deprecated', 'superseded']),
  reference: new Set(['draft', 'proposed', 'accepted', 'current', 'deprecated', 'generated']),
  guidance: new Set(['draft', 'proposed', 'accepted', 'current', 'deprecated']),
  evidence: new Set(['draft', 'proposed', 'accepted', 'published', 'historical', 'superseded']),
  tracking: new Set(['proposed', 'current', 'completed', 'archived']),
  research_historical: new Set(['draft', 'published', 'superseded', 'historical']),
  generated_projection: new Set(['generated']),
};

for (const file of registry.markdownFiles) {
  const rel = path.relative(root, file);
  const content = await readFile(file, 'utf8');
  let parsed;
  try {
    parsed = parseFrontmatter(content, rel);
  } catch (error) {
    errors.push(error.message);
    continue;
  }
  if (!parsed) {
    errors.push(`Missing frontmatter: ${rel}`);
    continue;
  }
  const metaErrors = validateJsonSchema(parsed.metadata, documentSchema, rel);
  errors.push(...metaErrors);
  const id = parsed.metadata.id;
  if (id) {
    if (metadataById.has(id)) errors.push(`Duplicate document id ${id}: ${metadataById.get(id).rel} and ${rel}`);
    else metadataById.set(id, { rel, metadata: parsed.metadata, content });
  }
  const allowed = allowedStatuses[parsed.metadata.authority];
  if (allowed && !allowed.has(parsed.metadata.status)) {
    errors.push(`${rel}: status ${parsed.metadata.status} is invalid for authority ${parsed.metadata.authority}`);
  }
  if (parsed.metadata.authority === 'generated_projection') {
    if (!parsed.metadata.generated_from?.length) errors.push(`${rel}: generated projection has no generated_from source`);
    if (!content.includes('GENERATED — DO NOT EDIT')) errors.push(`${rel}: generated projection lacks GENERATED — DO NOT EDIT marker`);
  }
  if (parsed.metadata.status === 'accepted' && /\{\{[^}]+\}\}|<TODO>|\bTBD:\b/.test(content)) {
    errors.push(`${rel}: accepted document contains an unresolved placeholder`);
  }
}

for (const [id, record] of metadataById) {
  if (!registry.documents.has(id)) registry.documents.set(id, { ...record, id, anchors: collectAnchors(record.content) });
}

for (const { rel, metadata } of metadataById.values()) {
  for (const field of ['related', 'supersedes']) {
    for (const reference of metadata[field] ?? []) validateRelation(rel, field, reference);
  }
  if (metadata.superseded_by) validateRelation(rel, 'superseded_by', metadata.superseded_by);
  for (const reference of metadata.generated_from ?? []) {
    if (reference.includes('/')) {
      if (!await exists(root, reference)) errors.push(`${rel}: generated_from path does not exist: ${reference}`);
    } else validateRelation(rel, 'generated_from', reference);
  }
  if (metadata.source_manifest) {
    const manifestRel = path.normalize(path.join(path.dirname(rel), metadata.source_manifest));
    if (!await exists(root, manifestRel)) errors.push(`${rel}: source manifest does not exist: ${manifestRel}`);
    else {
      const manifest = await readJson(manifestRel);
      errors.push(...validateJsonSchema(manifest, researchSourcesSchema, manifestRel));
      if (manifest.reportId !== metadata.id) errors.push(`${manifestRel}: reportId ${manifest.reportId} does not match ${metadata.id}`);
    }
  } else if (metadata.document_type === 'research_report' && metadata.status === 'published') {
    errors.push(`${rel}: published research report requires source_manifest`);
  }
}

for (const [id, record] of metadataById) {
  for (const previous of record.metadata.supersedes ?? []) {
    const prior = metadataById.get(previous);
    if (prior && prior.metadata.superseded_by !== id) errors.push(`${record.rel}: supersedes ${previous}, but the prior document does not point back via superseded_by`);
  }
  if (record.metadata.superseded_by) {
    const successor = metadataById.get(record.metadata.superseded_by);
    if (successor && !(successor.metadata.supersedes ?? []).includes(id)) errors.push(`${record.rel}: superseded_by ${record.metadata.superseded_by}, but successor does not list ${id}`);
  }
}

await validateInternalMarkdownLinks(registry.markdownFiles);
await validateAdrs();
await validateTraceability();
await validateGeneratedFiles();
await validateHistoricalMission();
await validateSecE1Policy();

if (errors.length) {
  console.error('Documentation validation failed:');
  for (const error of errors) console.error(`- ${error}`);
  if (warnings.length) {
    console.error('Warnings:');
    for (const warning of warnings) console.error(`- ${warning}`);
  }
  process.exit(1);
}

for (const warning of warnings) console.warn(`Documentation warning: ${warning}`);
console.log(`Documentation validation passed (${metadataById.size} canonical IDs, ${registry.aliases.size} indexed aliases checked).`);

async function readJson(rel) {
  try {
    return JSON.parse(await readFile(path.join(root, rel), 'utf8'));
  } catch (error) {
    errors.push(`${rel}: invalid JSON (${error.message})`);
    return {};
  }
}

function validateRelation(rel, field, reference) {
  const result = resolveDocumentReference(reference, registry);
  if (!result.ok) errors.push(`${rel}: ${field} reference ${reference} is unresolved (${result.reason})`);
}

async function validateInternalMarkdownLinks(files) {
  for (const file of files) {
    const rel = path.relative(root, file);
    const content = await readFile(file, 'utf8');
    for (const match of content.matchAll(/\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
      const target = match[1];
      if (/^(https?:|mailto:)/.test(target)) {
        try { new URL(target); } catch { errors.push(`${rel}: malformed external link ${target}`); }
        continue;
      }
      if (target.startsWith('#')) {
        const anchor = target.slice(1);
        if (!collectAnchors(content).has(anchor)) errors.push(`${rel}: missing local anchor ${target}`);
        continue;
      }
      const [targetPath, anchor] = target.split('#');
      const resolvedRel = path.normalize(path.join(path.dirname(rel), decodeURIComponent(targetPath)));
      if (!await exists(root, resolvedRel)) {
        errors.push(`${rel}: broken relative link ${target}`);
        continue;
      }
      if (anchor && resolvedRel.endsWith('.md')) {
        const targetContent = await readFile(path.join(root, resolvedRel), 'utf8');
        if (!collectAnchors(targetContent).has(anchor)) errors.push(`${rel}: link ${target} references a missing anchor`);
      }
    }
  }
}

async function validateAdrs() {
  if (!await exists(root, 'docs/adr/README.md')) return;
  const index = await readFile(path.join(root, 'docs/adr/README.md'), 'utf8');
  for (const [id, record] of metadataById) {
    if (record.metadata.document_type !== 'architecture_decision_record') continue;
    const match = record.rel.match(/docs\/adr\/(\d{4})-/);
    if (!match) {
      if (!record.rel.endsWith('/template.md')) errors.push(`${record.rel}: ADR filename must start with a four-digit number`);
      continue;
    }
    if (id !== `ADR-${match[1]}`) errors.push(`${record.rel}: ADR id ${id} does not match filename number ${match[1]}`);
    if (!index.includes(id)) errors.push(`docs/adr/README.md: missing ${id}`);
  }
}

async function validateTraceability() {
  const rel = 'docs/capabilities/CAP-EXECUTION/TRACEABILITY.json';
  const data = await readJson(rel);
  errors.push(...validateJsonSchema(data, traceabilitySchema, rel));
  const requirementIds = new Set();
  for (const requirement of data.requirements ?? []) {
    if (requirementIds.has(requirement.id)) errors.push(`${rel}: duplicate requirement id ${requirement.id}`);
    requirementIds.add(requirement.id);
    for (const source of requirement.source ?? []) {
      const resolved = resolveDocumentReference(source, registry);
      if (!resolved.ok) errors.push(`${rel}: ${requirement.id} source ${source} is unresolved (${resolved.reason})`);
    }
  }
  const readiness = await evaluateReadiness(data, registry);
  for (const gateId of ['R0', 'R1', 'R2']) {
    if (readiness[gateId].result !== 'PASS') {
      errors.push(`${rel}: computed ${gateId} is ${readiness[gateId].result}: ${readiness[gateId].reason}`);
      errors.push(...(readiness[gateId].errors ?? []).map((item) => `${rel}: ${gateId}: ${item}`));
    }
  }
}

async function validateGeneratedFiles() {
  const generated = [
    ['docs/product/PRODUCT-BLUEPRINT.md', await renderBlueprint(), 'Product Blueprint aggregate'],
    ['docs/roadmap.md', await renderRoadmap(), 'Capability roadmap projection'],
    ['docs/capabilities/CAP-EXECUTION/APPLICABILITY.md', await renderApplicability(), 'CAP-EXECUTION applicability matrix'],
    ['docs/capabilities/CAP-EXECUTION/COVERAGE.md', await renderCoverage(), 'CAP-EXECUTION coverage report'],
  ];
  for (const [rel, expected, label] of generated) {
    if (!await exists(root, rel)) continue;
    const current = await readFile(path.join(root, rel), 'utf8');
    if (current !== expected) errors.push(`${label} is stale.`);
  }
}

async function validateHistoricalMission() {
  const historicalRel = '.mnfs/missions/MIS-002/history/revision-0003.json';
  const currentRel = '.mnfs/missions/MIS-002/plan.json';

  if (!await exists(root, historicalRel)) {
    errors.push(`Missing historical Mission contract: ${historicalRel}`);
    return;
  }

  let historicalText;
  let historical;
  try {
    historicalText = await readFile(path.join(root, historicalRel), 'utf8');
    historical = JSON.parse(historicalText);
  } catch (error) {
    errors.push(`${historicalRel}: invalid historical contract (${error.message})`);
    return;
  }

  const historicalBlob = createHash('sha1')
    .update(`blob ${Buffer.byteLength(historicalText)}\0`)
    .update(historicalText)
    .digest('hex');

  if (historicalBlob !== '6b79117fe66cd5c9c8142099828812f470ce20de') {
    errors.push('Historical MIS-002 revision 3 bytes changed.');
  }
  if (
    historical.missionId !== 'MIS-002' ||
    historical.revision !== 3 ||
    historical.contentHash !== 'sha256:f95ffded37af764e5f76775ec6bbdda69d5638246609451ce37bf524908cf8c1'
  ) {
    errors.push('Historical MIS-002 revision 3 identity changed.');
  }

  if (!await exists(root, currentRel)) return;
  const current = await readJson(currentRel);
  const currentText = await readFile(path.join(root, currentRel), 'utf8');
  if (current.revision === 3 && currentText !== historicalText) {
    errors.push('Current MIS-002 revision 3 differs from its immutable historical snapshot.');
  }
  if (current.revision > 3 && current.content?.schemaVersion !== 2) {
    errors.push('A post-revision-3 MIS-002 contract must use schemaVersion 2.');
  }
}

async function validateSecE1Policy() {
  const rel = 'policies/SEC-E1.json';
  if (!await exists(root, rel)) return;

  let bytes;
  let value;
  try {
    bytes = await readFile(path.join(root, rel));
    value = JSON.parse(bytes.toString('utf8'));
  } catch (error) {
    errors.push(`${rel}: invalid policy JSON (${error.message})`);
    return;
  }

  for (const error of validateSecE1(value)) errors.push(`${rel}: ${error}`);
  const hash = hashSecE1Bytes(bytes);
  if (!/^sha256:[a-f0-9]{64}$/u.test(hash)) errors.push(`${rel}: invalid definition hash ${hash}`);
}
