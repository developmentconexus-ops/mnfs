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

function resolveSchema(schema) {
  let current = schema;
  const seen = new Set();
  while (current?.$ref?.startsWith('#/')) {
    if (seen.has(current.$ref)) throw new Error(`schema ref cycle while checking ${current.$ref}`);
    seen.add(current.$ref);
    current = resolveLocalRef(current);
  }
  return current;
}

function jsonRequestSchema(id) {
  return resolveSchema(op(id).requestBody?.content?.['application/json']?.schema);
}

function successSchema(id, status = '200') {
  return resolveSchema(op(id).responses?.[status]?.content?.['application/json']?.schema);
}

function resolvedParameters(id) {
  return (op(id).parameters ?? []).map(resolveLocalRef);
}

function hasRequiredParameter(id, where, name) {
  return resolvedParameters(id).some((p) => p?.in === where && p?.name === name && p?.required === true);
}

function assertClosedObject(schema, label) {
  const resolved = resolveSchema(schema);
  if (!resolved || resolved.type !== 'object' || resolved.additionalProperties !== false) {
    throw new Error(`${label} must be a closed object schema`);
  }
  return resolved;
}

function assertHumanName(schema, label) {
  const resolved = resolveSchema(schema);
  if (!resolved?.required?.includes('name')) throw new Error(`${label} must require name`);
  const name = resolveSchema(resolved.properties?.name);
  if (name?.type !== 'string' || (name.minLength ?? 0) < 1 || typeof name.pattern !== 'string') {
    throw new Error(`${label} name must be an explicit non-blank string schema`);
  }
  return name;
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

// 4C-F01: current Control Plane disclosure must carry human-recognizable Workspace and Project identity.
const accessContext = assertClosedObject(successSchema('IAM-01'), 'IAM-01 success');
const workspaceItems = resolveSchema(accessContext.properties?.workspaces?.items);
const projectItems = resolveSchema(accessContext.properties?.projects?.items);
if (!workspaceItems?.required?.includes('workspaceId')) throw new Error('IAM-01 Workspace projection must require workspaceId');
assertHumanName(workspaceItems, 'IAM-01 Workspace projection');
if (!projectItems?.required?.includes('projectId') || !projectItems?.required?.includes('workspaceId')) {
  throw new Error('IAM-01 Project projection must require projectId + workspaceId');
}
assertHumanName(projectItems, 'IAM-01 Project projection');

const createWorkspace = assertClosedObject(jsonRequestSchema('WS-01'), 'WS-01 request');
assertHumanName(createWorkspace, 'WS-01 request');
for (const forbidden of ['description', 'settings', 'metadata']) {
  if (createWorkspace.properties?.[forbidden]) throw new Error(`WS-01 must not expose speculative Workspace field ${forbidden}`);
}
if (!hasRequiredParameter('WS-01', 'header', 'Idempotency-Key')) throw new Error('WS-01 must require Idempotency-Key');
const createdWorkspace = assertClosedObject(successSchema('WS-01', '201'), 'WS-01 success');
if (!createdWorkspace.required?.includes('workspaceId')) throw new Error('WS-01 success must require workspaceId');
assertHumanName(createdWorkspace, 'WS-01 success');
const workspaceRead = assertClosedObject(successSchema('WS-02'), 'WS-02 success');
if (!workspaceRead.required?.includes('workspaceId')) throw new Error('WS-02 success must require workspaceId');
assertHumanName(workspaceRead, 'WS-02 success');

// Area semantics remain unchanged by 4C-F01.
if (op('WS-05').requestBody) throw new Error('WS-05 must not invent Area metadata input');
if (!hasRequiredParameter('WS-05', 'header', 'Idempotency-Key')) throw new Error('WS-05 must require Idempotency-Key');
if (operations.has('WS-03')) throw new Error('4C-F01 must not resurrect WS-03 UpdateWorkspace');

console.log('IAM/Workspace schema closure passed (20 operations; Workspace human identity closed; Area metadata not invented; app role/current-state closed).');
