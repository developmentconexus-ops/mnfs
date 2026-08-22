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
  'PRJ-01', 'PRJ-02', 'PRJ-03',
  ...Array.from({ length: 18 }, (_, i) => `PRJ-${String(i + 5).padStart(2, '0')}`),
];

if (expectedIds.length !== 21) throw new Error(`internal test setup error: expected 21 Project ids, got ${expectedIds.length}`);
if (operations.has('PRJ-04')) throw new Error('PRJ-04 must remain subtracted after 4B-F01 / 4C-F01');

for (const id of expectedIds) {
  const entry = operations.get(id);
  if (!entry) throw new Error(`Project schema closure missing operation ${id}`);
  if (entry.operation['x-conexus-contract-state'] !== 'SCHEMA_CLOSED') throw new Error(`${id} is not SCHEMA_CLOSED`);
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

function resolvedParameters(id) {
  return (op(id).parameters ?? []).map(resolveLocalRef);
}

function hasParameter(id, where, name, required = undefined) {
  return resolvedParameters(id).some((p) => p?.in === where && p?.name === name && (required === undefined || p?.required === required));
}

function requestSchema(id) {
  return resolveSchema(op(id).requestBody?.content?.['application/json']?.schema);
}

function successSchema(id, status = '200') {
  return resolveSchema(op(id).responses?.[status]?.content?.['application/json']?.schema);
}

function requiredFields(schema) {
  return new Set(resolveSchema(schema)?.required ?? []);
}

function assertClosedObject(schema, label) {
  const resolved = resolveSchema(schema);
  if (!resolved || resolved.type !== 'object' || resolved.additionalProperties !== false) {
    throw new Error(`${label} must be a closed object schema`);
  }
  return resolved;
}

function propertySchema(schema, name) {
  return resolveSchema(resolveSchema(schema)?.properties?.[name]);
}

function assertHumanName(schema, label) {
  const resolved = assertClosedObject(schema, label);
  if (!requiredFields(resolved).has('name')) throw new Error(`${label} must require name`);
  const name = propertySchema(resolved, 'name');
  if (name?.type !== 'string' || (name.minLength ?? 0) < 1 || typeof name.pattern !== 'string') {
    throw new Error(`${label} name must be an explicit non-blank string schema`);
  }
  return name;
}

// 4C-F01: creation establishes one human-readable identity property only; no generic metadata mutation is admitted.
const createProject = assertHumanName(requestSchema('PRJ-03'), 'PRJ-03 request');
for (const forbidden of ['description', 'settings', 'metadata']) {
  if (requestSchema('PRJ-03').properties?.[forbidden]) throw new Error(`PRJ-03 must not expose speculative Project field ${forbidden}`);
}
if (!hasParameter('PRJ-03', 'header', 'Idempotency-Key', true)) throw new Error('PRJ-03 must require Idempotency-Key');

const projectRepresentation = assertHumanName(successSchema('PRJ-02'), 'PRJ-02 success');
const projectList = resolveSchema(successSchema('PRJ-01'));
const projectSummary = assertHumanName(resolveSchema(projectList?.items), 'PRJ-01 item');
for (const field of ['projectId', 'workspaceId', 'archived']) {
  if (!requiredFields(projectSummary).has(field)) throw new Error(`PRJ-01 item must require ${field}`);
}
for (const field of ['projectId', 'workspaceId', 'projectRevision', 'archived']) {
  if (!requiredFields(projectRepresentation).has(field)) throw new Error(`PRJ-02 success must require ${field}`);
}

// ArchiveProject: current Project subject is explicit because command subpath cannot truthfully reuse Project ETag.
const archive = assertClosedObject(requestSchema('PRJ-05'), 'PRJ-05 request');
if (!requiredFields(archive).has('expectedProjectRevision')) throw new Error('PRJ-05 must require expectedProjectRevision');
if (archive.properties?.name || archive.properties?.settings || archive.properties?.metadata) {
  throw new Error('PRJ-05 must not become rename/generic Project mutation');
}

// DuplicateProject: destination Workspace and a new human-readable destination identity are explicit; default remains NO DATA.
const duplicate = assertClosedObject(requestSchema('PRJ-06'), 'PRJ-06 request');
for (const field of ['destinationWorkspaceId', 'name']) {
  if (!requiredFields(duplicate).has(field)) throw new Error(`PRJ-06 must require ${field}`);
}
const duplicateName = propertySchema(duplicate, 'name');
if (duplicateName?.type !== 'string' || (duplicateName.minLength ?? 0) < 1 || typeof duplicateName.pattern !== 'string') {
  throw new Error('PRJ-06 name must be an explicit non-blank destination identity');
}
for (const forbidden of ['copyData', 'dataMode', 'copyCredentials', 'copyConnectionBindings', 'connectionBindings', 'credentials']) {
  if (duplicate.properties?.[forbidden]) throw new Error(`PRJ-06 must not expose speculative duplication field ${forbidden}`);
}
if (!hasParameter('PRJ-06', 'header', 'Idempotency-Key', true)) throw new Error('PRJ-06 must require Idempotency-Key');

// Inception remains a Project command over current admitted sources; no generic caller-selected source/URL scope.
const inception = requestSchema('PRJ-07');
if (inception) {
  for (const forbidden of ['url', 'targetUrl', 'connectionId', 'sourceId', 'sql']) {
    if (inception.properties?.[forbidden]) throw new Error(`PRJ-07 must not accept caller-selected ${forbidden}`);
  }
}
if (!hasParameter('PRJ-07', 'header', 'Idempotency-Key', true)) throw new Error('PRJ-07 must require Idempotency-Key');

// Approved Baseline exposes exact pinned source + digest and the closed runtime profile union.
const baseline = assertClosedObject(successSchema('PRJ-08'), 'PRJ-08 success');
for (const field of ['baselineDigest', 'sourceRevision', 'sourceText', 'applicationRuntimeProfile']) {
  if (!requiredFields(baseline).has(field)) throw new Error(`PRJ-08 must require ${field}`);
}
const profiles = propertySchema(baseline, 'applicationRuntimeProfile')?.enum ?? [];
if (profiles.length !== 2 || !profiles.includes('MANAGED') || !profiles.includes('DEDICATED')) {
  throw new Error(`PRJ-08 runtime profile must be exactly MANAGED/DEDICATED; got ${profiles.join(',')}`);
}

const approveBaseline = assertClosedObject(requestSchema('PRJ-09'), 'PRJ-09 request');
if (!requiredFields(approveBaseline).has('candidateBaselineDigest')) throw new Error('PRJ-09 must require candidateBaselineDigest');

// Brain binding: one same-target conditional contract. GET emits ETag; PUT requires exactly one present/absent HTTP precondition; DELETE requires If-Match.
const getBrainBinding200 = op('PRJ-10').responses?.['200'];
if (!getBrainBinding200?.headers?.ETag) throw new Error('PRJ-10 must emit ETag for the current binding representation');
const setBrain = assertClosedObject(requestSchema('PRJ-11'), 'PRJ-11 request');
if (!requiredFields(setBrain).has('brainRevisionId')) throw new Error('PRJ-11 must require exact brainRevisionId');
if (!hasParameter('PRJ-11', 'header', 'If-Match', false)) throw new Error('PRJ-11 must expose optional If-Match for present-state update');
if (!hasParameter('PRJ-11', 'header', 'If-None-Match', false)) throw new Error('PRJ-11 must expose optional If-None-Match for absent-state create');
const preconditions = op('PRJ-11')['x-conexus-precondition-one-of'] ?? [];
if (preconditions.length !== 2 || !preconditions.includes('If-Match') || !preconditions.includes('If-None-Match')) {
  throw new Error('PRJ-11 must require exactly one of If-Match / If-None-Match');
}
if (!hasParameter('PRJ-12', 'header', 'If-Match', true)) throw new Error('PRJ-12 must require If-Match');

// Connection binding: identify the logical Connection, exact revision/environment and explicit expected current subject.
const setConnection = assertClosedObject(requestSchema('PRJ-14'), 'PRJ-14 request');
for (const field of ['connectionId', 'connectionRevisionId', 'environment', 'expectedCurrent']) {
  if (!requiredFields(setConnection).has(field)) throw new Error(`PRJ-14 must require ${field}`);
}
const expectedConnectionVariants = propertySchema(setConnection, 'expectedCurrent')?.oneOf ?? [];
const expectedConnectionStates = expectedConnectionVariants.map((variant) => variant?.properties?.state?.const).filter(Boolean).sort();
if (expectedConnectionStates.join(',') !== 'ABSENT,PRESENT') {
  throw new Error(`PRJ-14 expectedCurrent must close ABSENT/PRESENT; got ${expectedConnectionStates.join(',')}`);
}
const removeConnection = assertClosedObject(requestSchema('PRJ-15'), 'PRJ-15 request');
for (const field of ['connectionId', 'expectedConnectionRevisionId', 'expectedEnvironment']) {
  if (!requiredFields(removeConnection).has(field)) throw new Error(`PRJ-15 must require ${field}`);
}

// Capabilities remain exact finite Project capability projections, not invocation authority.
const capability = assertClosedObject(successSchema('PRJ-17'), 'PRJ-17 success');
for (const field of ['capabilityId', 'operationId', 'regime']) {
  if (!requiredFields(capability).has(field)) throw new Error(`PRJ-17 must require ${field}`);
}
const regimes = propertySchema(capability, 'regime')?.enum ?? [];
if (regimes.length !== 3 || !['QUERY', 'ACTION', 'INTEGRATION'].every((value) => regimes.includes(value))) {
  throw new Error(`PRJ-17 regime must be exactly QUERY/ACTION/INTEGRATION; got ${regimes.join(',')}`);
}

// DataResource detail must preserve the four accepted provenance axes without a generic database-explorer payload.
const dataResource = assertClosedObject(successSchema('PRJ-19'), 'PRJ-19 success');
for (const field of ['dataResourceId', 'grain', 'freshness', 'coverage', 'provenance']) {
  if (!requiredFields(dataResource).has(field)) throw new Error(`PRJ-19 must require ${field}`);
}
for (const forbidden of ['table', 'schema', 'sql', 'connectionString', 'storageKey']) {
  if (dataResource.properties?.[forbidden]) throw new Error(`PRJ-19 must not expose generic physical-data field ${forbidden}`);
}

// Authored Product-Agent projection remains Project/Release identity only; runtime/Mastra override identity is not Project Product authority.
const agent = assertClosedObject(successSchema('PRJ-21'), 'PRJ-21 success');
for (const field of ['agentId', 'authoredRevisionId', 'releaseRefs', 'activeReleaseId']) {
  if (!requiredFields(agent).has(field)) throw new Error(`PRJ-21 must require ${field}`);
}
for (const forbidden of ['mastraAgentId', 'runtimeRevisionId', 'requestRevisionOverride', 'storedAgentId']) {
  if (agent.properties?.[forbidden]) throw new Error(`PRJ-21 must not expose runtime-authority field ${forbidden}`);
}

console.log('Project schema closure passed (21 operations; human Project identity closed; generic mutation still absent; Baseline/bindings/projections closed).');
