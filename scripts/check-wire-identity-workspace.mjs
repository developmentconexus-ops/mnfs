import fs from 'node:fs';

const oas = JSON.parse(fs.readFileSync('/tmp/conexus-product-openapi.bundle.json', 'utf8'));
const methods = new Set(['get', 'put', 'post', 'delete', 'patch', 'head', 'options', 'trace']);
const operations = new Map();

for (const [path, pathItem] of Object.entries(oas.paths ?? {})) {
  for (const [method, operation] of Object.entries(pathItem ?? {})) {
    if (!methods.has(method)) continue;
    const id = operation?.['x-conexus-4a-id'];
    if (id) operations.set(id, { path, method: method.toUpperCase(), operation });
  }
}

const expectedIds = [
  ...Array.from({ length: 15 }, (_, i) => `IAM-${String(i + 1).padStart(2, '0')}`).filter((id) => id !== 'IAM-16'),
  'IAM-17',
  'WS-01', 'WS-02', 'WS-04', 'WS-05'
];

if (expectedIds.length !== 20) throw new Error(`internal test setup error: expected 20 ids, got ${expectedIds.length}`);

for (const id of expectedIds) {
  const entry = operations.get(id);
  if (!entry) throw new Error(`IAM/Workspace schema closure missing operation ${id}`);
  if (entry.operation['x-conexus-contract-state'] !== 'SCHEMA_CLOSED') {
    throw new Error(`${id} is not SCHEMA_CLOSED`);
  }
  for (const response of Object.values(entry.operation.responses ?? {})) {
    if (response?.['x-conexus-provisional'] === true) throw new Error(`${id} still has provisional response authority`);
  }
}

function op(id) {
  const entry = operations.get(id);
  if (!entry) throw new Error(`missing operation ${id}`);
  return entry.operation;
}

function resolveLocalRef(value) {
  if (!value?.$ref || !value.$ref.startsWith('#/')) return value;
  return value.$ref
    .slice(2)
    .split('/')
    .map((part) => part.replaceAll('~1', '/').replaceAll('~0', '~'))
    .reduce((node, part) => node?.[part], oas);
}

function jsonRequestSchema(id) {
  return op(id).requestBody?.content?.['application/json']?.schema;
}

function resolvedParameters(id) {
  return (op(id).parameters ?? []).map(resolveLocalRef);
}

function hasRequiredParameter(id, where, name) {
  return resolvedParameters(id).some((p) => p?.in === where && p?.name === name && p?.required === true);
}

const provision = jsonRequestSchema('IAM-03');
if (!provision || provision.type !== 'object' || provision.additionalProperties !== false) {
  throw new Error('IAM-03 must have a closed object request schema');
}
if (!provision.required?.includes('externalSubject')) throw new Error('IAM-03 must require externalSubject');
if (provision.properties?.issuer) throw new Error('IAM-03 must not accept caller-selected issuer');
if (!hasRequiredParameter('IAM-03', 'header', 'Idempotency-Key')) throw new Error('IAM-03 must require Idempotency-Key');

const setAccess = jsonRequestSchema('IAM-15');
if (!setAccess || setAccess.additionalProperties !== false) throw new Error('IAM-15 must have a closed request schema');
if (!setAccess.required?.includes('role') || !setAccess.required?.includes('expectedCurrent')) {
  throw new Error('IAM-15 must require desired role and explicit expected current state');
}
const roles = setAccess.properties?.role?.enum ?? [];
if (roles.length !== 2 || !roles.includes('admin') || !roles.includes('member')) {
  throw new Error(`IAM-15 role set must be exactly admin/member; got ${roles.join(',')}`);
}
const expectedVariants = setAccess.properties?.expectedCurrent?.oneOf ?? [];
const states = expectedVariants.map((variant) => variant?.properties?.state?.const).filter(Boolean).sort();
if (states.join(',') !== 'ABSENT,PRESENT') {
  throw new Error(`IAM-15 expectedCurrent must close ABSENT/PRESENT; got ${states.join(',')}`);
}

if (!hasRequiredParameter('IAM-17', 'query', 'expectedRole')) {
  throw new Error('IAM-17 must carry the expected current app role explicitly');
}
const revokeExpectedRole = resolvedParameters('IAM-17').find((p) => p?.in === 'query' && p?.name === 'expectedRole');
const revokeRoles = revokeExpectedRole?.schema?.enum ?? [];
if (revokeRoles.length !== 2 || !revokeRoles.includes('admin') || !revokeRoles.includes('member')) {
  throw new Error('IAM-17 expectedRole must be exactly admin/member');
}

for (const id of ['WS-01', 'WS-05']) {
  if (op(id).requestBody) throw new Error(`${id} must not invent Workspace/Area metadata input`);
  if (!hasRequiredParameter(id, 'header', 'Idempotency-Key')) throw new Error(`${id} must require Idempotency-Key`);
}

console.log('IAM/Workspace schema closure passed (20 operations; no invented Workspace/Area metadata; app role/current-state closed).');
