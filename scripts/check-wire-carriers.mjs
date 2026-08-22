import fs from 'node:fs';

const bundlePath = '/tmp/conexus-product-openapi.bundle.json';
const oas = JSON.parse(fs.readFileSync(bundlePath, 'utf8'));
const methods = new Set(['get', 'put', 'post', 'delete', 'patch', 'head', 'options', 'trace']);
const operations = new Map();

function resolveLocalRef(value) {
  if (!value?.$ref || !value.$ref.startsWith('#/')) return value;
  return value.$ref
    .slice(2)
    .split('/')
    .map((part) => part.replaceAll('~1', '/').replaceAll('~0', '~'))
    .reduce((node, part) => node?.[part], oas);
}

for (const [path, pathItem] of Object.entries(oas.paths ?? {})) {
  for (const [method, operation] of Object.entries(pathItem ?? {})) {
    if (!methods.has(method)) continue;
    const id = operation?.['x-conexus-4a-id'];
    if (!id) continue;
    if (operations.has(id)) throw new Error(`duplicate 4A id while checking carriers: ${id}`);
    operations.set(id, { path, method: method.toUpperCase(), pathItem, operation });
  }
}

function parametersFor(entry) {
  const byKey = new Map();
  for (const candidate of [...(entry.pathItem?.parameters ?? []), ...(entry.operation?.parameters ?? [])]) {
    const resolved = resolveLocalRef(candidate);
    if (!resolved?.in || !resolved?.name) continue;
    byKey.set(`${resolved.in}\0${resolved.name}`, resolved);
  }
  return [...byKey.values()];
}

const exactIfMatch = new Set(['PRJ-12', 'PAR-14']);
const actualIfMatch = new Set();
for (const [id, { operation }] of operations) {
  const carrier = String(operation['x-conexus-current-state-carrier'] ?? '');
  if (carrier.includes('IF_MATCH')) actualIfMatch.add(id);
}

const missingIfMatch = [...exactIfMatch].filter((id) => !actualIfMatch.has(id));
const extraIfMatch = [...actualIfMatch].filter((id) => !exactIfMatch.has(id));
if (missingIfMatch.length || extraIfMatch.length) {
  throw new Error(`IF_MATCH carrier set mismatch; missing=${missingIfMatch.join(',') || '-'} extra=${extraIfMatch.join(',') || '-'}`);
}

const actualIfMatchParameter = new Set();
const actualIfNoneMatchParameter = new Set();
for (const [id, entry] of operations) {
  for (const parameter of parametersFor(entry)) {
    if (parameter.in !== 'header') continue;
    if (parameter.name === 'If-Match') actualIfMatchParameter.add(id);
    if (parameter.name === 'If-None-Match') actualIfNoneMatchParameter.add(id);
  }
}
const expectedIfMatchParameter = new Set(['PRJ-11', 'PRJ-12', 'PAR-14']);
const expectedIfNoneMatchParameter = new Set(['PRJ-11']);
for (const [label, expected, actual] of [
  ['If-Match HTTP parameter', expectedIfMatchParameter, actualIfMatchParameter],
  ['If-None-Match HTTP parameter', expectedIfNoneMatchParameter, actualIfNoneMatchParameter],
]) {
  const missing = [...expected].filter((id) => !actual.has(id));
  const extra = [...actual].filter((id) => !expected.has(id));
  if (missing.length || extra.length) {
    throw new Error(`${label} set mismatch; missing=${missing.join(',') || '-'} extra=${extra.join(',') || '-'}`);
  }
}

for (const id of exactIfMatch) {
  const parameter = parametersFor(operations.get(id)).find((candidate) => candidate.in === 'header' && candidate.name === 'If-Match');
  if (!parameter || parameter.required !== true) throw new Error(`${id} must carry required If-Match HTTP parameter`);
}
const currentOrAbsent = operations.get('PRJ-11');
for (const name of ['If-Match', 'If-None-Match']) {
  const parameter = parametersFor(currentOrAbsent).find((candidate) => candidate.in === 'header' && candidate.name === name);
  if (!parameter || parameter.required !== false) throw new Error(`PRJ-11 ${name} must remain optional inside exact current-or-absent one-of`);
}
if (JSON.stringify(currentOrAbsent.operation['x-conexus-precondition-one-of']) !== JSON.stringify(['If-Match', 'If-None-Match'])) {
  throw new Error('PRJ-11 must preserve exact If-Match/If-None-Match one-of precondition metadata');
}

const expectedCarriers = new Map([
  ['IAM-15', 'CURRENT_OR_ABSENT'],
  ['IAM-17', 'EXPLICIT_CURRENT_SUBJECT'],
  ['PRJ-05', 'EXPLICIT_CURRENT_SUBJECT'],
  ['PRJ-11', 'CURRENT_OR_ABSENT'],
  ['CON-06', 'EXPLICIT_CURRENT_REVISION'],
  ['REL-06', 'EXPECTED_POINTER_GENERATION+IDEMPOTENCY_KEY'],
  ['PAR-10', 'EXPLICIT_SEALED_SUBJECT'],
  ['PAR-15', 'EXPLICIT_TRIGGER_REVISION'],
]);

for (const [id, expected] of expectedCarriers) {
  const entry = operations.get(id);
  if (!entry) throw new Error(`carrier check missing operation ${id}`);
  const actual = entry.operation['x-conexus-current-state-carrier'];
  if (actual !== expected) {
    throw new Error(`carrier mismatch for ${id}: expected ${expected}, got ${actual}`);
  }
}

const approval = operations.get('PAR-10')?.operation;
if (approval?.['x-conexus-effect-fence'] !== 'OWNER_GATEWAY_IC4') {
  throw new Error('PAR-10 must preserve owner/Gateway IC4 effect fence independently from caller current-subject carrier');
}

console.log(`wire carrier proof passed (${operations.size} operations; IF_MATCH semantic set=${[...exactIfMatch].join(',')}; HTTP If-Match set=${[...expectedIfMatchParameter].join(',')}; 7 cross-resource false conditionals remain removed).`);
