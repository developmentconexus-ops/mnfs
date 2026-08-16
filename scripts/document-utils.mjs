import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

export async function exists(root, rel) {
  try {
    await stat(path.join(root, rel));
    return true;
  } catch {
    return false;
  }
}

export async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(full));
    else files.push(full);
  }
  return files;
}

function parseScalar(raw) {
  const value = raw.trim();
  if (value === '') return '';
  if (value === 'null' || value === '~') return null;
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (/^-?\d+$/.test(value)) return Number(value);
  if (/^-?\d+\.\d+$/.test(value)) return Number(value);
  if (value === '[]') return [];
  if (value === '{}') return {};
  if (value.startsWith('[') || value.startsWith('{') || value.startsWith('"')) {
    try { return JSON.parse(value); } catch { /* keep as string */ }
  }
  if (value.startsWith("'") && value.endsWith("'")) return value.slice(1, -1).replace(/''/g, "'");
  return value;
}

export function parseFrontmatter(content, rel = '<document>') {
  if (!content.startsWith('---\n')) return null;
  const end = content.indexOf('\n---\n', 4);
  if (end === -1) throw new Error(`Unclosed frontmatter: ${rel}`);
  const raw = content.slice(4, end);
  const lines = raw.split('\n');
  const metadata = {};
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    const match = line.match(/^([A-Za-z0-9_]+):(?:\s*(.*))?$/);
    if (!match) throw new Error(`Unsupported frontmatter syntax in ${rel}: ${line}`);
    const [, key, rest = ''] = match;
    if (rest.trim() !== '') {
      metadata[key] = parseScalar(rest);
      continue;
    }
    const values = [];
    let j = i + 1;
    while (j < lines.length) {
      const item = lines[j].match(/^\s{2}-\s+(.*)$/);
      if (!item) break;
      values.push(parseScalar(item[1]));
      j += 1;
    }
    metadata[key] = values;
    i = j - 1;
  }
  return { metadata, body: content.slice(end + 5), raw };
}

export function stripFrontmatter(content, rel = '<document>') {
  const parsed = parseFrontmatter(content, rel);
  return parsed ? parsed.body.trim() : content.trim();
}

function typeMatches(value, expected) {
  if (Array.isArray(expected)) return expected.some((item) => typeMatches(value, item));
  if (expected === 'null') return value === null;
  if (expected === 'array') return Array.isArray(value);
  if (expected === 'integer') return Number.isInteger(value);
  if (expected === 'number') return typeof value === 'number' && Number.isFinite(value);
  if (expected === 'object') return value !== null && typeof value === 'object' && !Array.isArray(value);
  return typeof value === expected;
}

export function validateJsonSchema(value, schema, location = '$') {
  const errors = [];
  const resolveRef = (ref) => {
    if (!ref.startsWith('#/')) throw new Error(`Only local JSON Schema refs are supported: ${ref}`);
    return ref.slice(2).split('/').reduce((node, key) => node?.[key.replace(/~1/g, '/').replace(/~0/g, '~')], schema);
  };
  const visit = (current, node, at) => {
    if (!node || typeof node !== 'object') return;
    if (node.$ref) {
      const target = resolveRef(node.$ref);
      if (!target) errors.push(`${at}: unresolved schema ref ${node.$ref}`);
      else visit(current, target, at);
      return;
    }
    if ('const' in node && current !== node.const) errors.push(`${at}: expected constant ${JSON.stringify(node.const)}`);
    if (node.enum && !node.enum.some((item) => JSON.stringify(item) === JSON.stringify(current))) {
      errors.push(`${at}: expected one of ${node.enum.map((item) => JSON.stringify(item)).join(', ')}`);
    }
    if (node.type && !typeMatches(current, node.type)) {
      errors.push(`${at}: expected type ${JSON.stringify(node.type)}, got ${Array.isArray(current) ? 'array' : current === null ? 'null' : typeof current}`);
      return;
    }
    if (typeof current === 'string') {
      if (node.minLength !== undefined && current.length < node.minLength) errors.push(`${at}: string shorter than ${node.minLength}`);
      if (node.pattern && !new RegExp(node.pattern).test(current)) errors.push(`${at}: does not match ${node.pattern}`);
    }
    if (Array.isArray(current)) {
      if (node.minItems !== undefined && current.length < node.minItems) errors.push(`${at}: expected at least ${node.minItems} items`);
      if (node.items) current.forEach((item, index) => visit(item, node.items, `${at}[${index}]`));
    }
    if (current !== null && typeof current === 'object' && !Array.isArray(current)) {
      for (const required of node.required ?? []) {
        if (!(required in current)) errors.push(`${at}: missing required property ${required}`);
      }
      for (const [key, child] of Object.entries(node.properties ?? {})) {
        if (key in current) visit(current[key], child, `${at}.${key}`);
      }
      if (node.additionalProperties === false) {
        const allowed = new Set(Object.keys(node.properties ?? {}));
        for (const key of Object.keys(current)) if (!allowed.has(key)) errors.push(`${at}: unexpected property ${key}`);
      }
    }
  };
  visit(value, schema, location);
  return errors;
}

export function githubSlug(value) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function collectAnchors(content) {
  const anchors = new Set();
  for (const match of content.matchAll(/<a\s+(?:id|name)=["']([^"']+)["'][^>]*>/gi)) anchors.add(match[1]);
  for (const line of content.split('\n')) {
    const heading = line.match(/^#{1,6}\s+(.+?)\s*#*$/);
    if (heading) anchors.add(githubSlug(heading[1]));
  }
  return anchors;
}

const outsideLegacyMnfsDocumentRegistryPrefixes = [
  'docs/conexus/',
  'docs/reference/mitra/',
];

const outsideLegacyMnfsDocumentRegistryPaths = new Set([
  'docs/engineering/standards/root-cause-global-maximum-method.md',
  'docs/research/factory-in-a-box.md',
]);

function belongsToLegacyMnfsDocumentRegistry(root, file) {
  const rel = path.relative(root, file).split(path.sep).join('/');
  if (outsideLegacyMnfsDocumentRegistryPaths.has(rel)) return false;
  return !outsideLegacyMnfsDocumentRegistryPrefixes.some((prefix) => rel.startsWith(prefix));
}

export async function loadDocumentRegistry(root) {
  const documents = new Map();
  const paths = new Map();
  const aliases = new Map();
  const markdownFiles = (await walk(path.join(root, 'docs')))
    .filter((file) => file.endsWith('.md'))
    .filter((file) => belongsToLegacyMnfsDocumentRegistry(root, file));
  for (const file of markdownFiles) {
    const rel = path.relative(root, file);
    const content = await readFile(file, 'utf8');
    const parsed = parseFrontmatter(content, rel);
    if (!parsed?.metadata?.id) continue;
    const record = { id: parsed.metadata.id, rel, file, content, metadata: parsed.metadata, anchors: collectAnchors(content) };
    documents.set(record.id, record);
    paths.set(rel, record);
  }

  const adrIndexPath = path.join(root, 'docs/adr/README.md');
  if (await exists(root, 'docs/adr/README.md')) {
    const index = await readFile(adrIndexPath, 'utf8');
    for (const match of index.matchAll(/\bADR-(\d{4})\b/g)) {
      const id = `ADR-${match[1]}`;
      if (!documents.has(id)) aliases.set(id, { id, rel: 'docs/adr/README.md', metadata: { id, status: 'accepted' }, anchors: new Set() });
    }
  }
  return { documents, paths, aliases, markdownFiles };
}

export function splitReference(reference) {
  const index = reference.indexOf('#');
  if (index === -1) return { id: reference, anchor: null };
  return { id: reference.slice(0, index), anchor: reference.slice(index + 1) };
}

export function resolveDocumentReference(reference, registry) {
  if (/^GH-ISSUE-\d+$/.test(reference)) return { ok: true, external: true };
  const { id, anchor } = splitReference(reference);
  const document = registry.documents.get(id) ?? registry.aliases.get(id);
  if (!document) return { ok: false, reason: `unknown document id ${id}` };
  if (anchor && !document.anchors.has(anchor)) return { ok: false, reason: `unknown anchor ${anchor} in ${id}` };
  return { ok: true, document };
}
