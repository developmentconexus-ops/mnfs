import fs from 'node:fs';

const bundlePath = '/tmp/conexus-product-openapi.bundle.json';
const oas = JSON.parse(fs.readFileSync(bundlePath, 'utf8'));
const methods = new Set(['get', 'put', 'post', 'delete', 'patch', 'head', 'options', 'trace']);
const operations = new Map();

for (const [path, pathItem] of Object.entries(oas.paths ?? {})) {
  for (const [method, operation] of Object.entries(pathItem ?? {})) {
    if (!methods.has(method)) continue;
    const id = operation?.['x-conexus-4a-id'];
    if (!id) continue;
    if (operations.has(id)) throw new Error(`duplicate 4A id while checking carriers: ${id}`);
    operations.set(id, { path, method: method.toUpperCase(), operation });
  }
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

console.log(`wire carrier proof passed (${operations.size} operations; IF_MATCH exact set=${[...exactIfMatch].join(',')}; 7 cross-resource false conditionals remain removed).`);