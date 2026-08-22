import fs from 'node:fs';
import path from 'node:path';

const [, , inputPath, outputPath] = process.argv;
if (!inputPath || !outputPath) {
  throw new Error('usage: node scripts/generate-wire-projection.mjs <bundled-openapi.json> <output.json>');
}

const oas = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
const methods = new Set(['get', 'put', 'post', 'delete', 'patch', 'head', 'options', 'trace']);

function decodePointerPart(part) {
  return part.replaceAll('~1', '/').replaceAll('~0', '~');
}

function resolveLocalRef(value) {
  if (!value?.$ref || !value.$ref.startsWith('#/')) return value;
  return value.$ref
    .slice(2)
    .split('/')
    .map(decodePointerPart)
    .reduce((node, part) => node?.[part], oas);
}

function normalizedSchemaType(schema) {
  const resolved = resolveLocalRef(schema);
  if (!resolved) return null;
  if (typeof resolved.type === 'string') return resolved.type;
  if (Array.isArray(resolved.type)) return [...resolved.type].sort();
  if (resolved.oneOf) return 'oneOf';
  if (resolved.anyOf) return 'anyOf';
  if (resolved.allOf) return 'allOf';
  return null;
}

function normalizeSecurity(operation) {
  const effective = operation.security ?? oas.security ?? [];
  return effective.map((entry) => Object.keys(entry).sort()).sort((a, b) => a.join(',').localeCompare(b.join(',')));
}

function normalizeParameters(pathItem, operation) {
  const byKey = new Map();
  for (const candidate of [...(pathItem.parameters ?? []), ...(operation.parameters ?? [])]) {
    const resolved = resolveLocalRef(candidate);
    if (!resolved?.in || !resolved?.name) continue;
    byKey.set(`${resolved.in}\0${resolved.name}`, {
      in: resolved.in,
      name: resolved.name,
      required: resolved.required === true,
      schemaType: normalizedSchemaType(resolved.schema),
    });
  }
  return [...byKey.values()].sort((a, b) => `${a.in}:${a.name}`.localeCompare(`${b.in}:${b.name}`));
}

function normalizeRequestBody(operation) {
  const requestBody = resolveLocalRef(operation.requestBody);
  if (!requestBody) return null;
  return {
    required: requestBody.required === true,
    contentTypes: Object.keys(requestBody.content ?? {}).sort(),
  };
}

function normalizeResponses(operation) {
  return Object.entries(operation.responses ?? {})
    .map(([status, candidate]) => {
      const response = resolveLocalRef(candidate) ?? {};
      return {
        status,
        contentTypes: Object.keys(response.content ?? {}).sort(),
      };
    })
    .sort((a, b) => a.status.localeCompare(b.status, 'en', { numeric: true }));
}

const operations = [];
for (const [route, rawPathItem] of Object.entries(oas.paths ?? {})) {
  const pathItem = resolveLocalRef(rawPathItem) ?? {};
  for (const [method, rawOperation] of Object.entries(pathItem)) {
    if (!methods.has(method)) continue;
    const operation = resolveLocalRef(rawOperation) ?? {};
    operations.push({
      authorityId: operation['x-conexus-4a-id'] ?? null,
      operationId: operation.operationId ?? null,
      method: method.toUpperCase(),
      path: route,
      parameters: normalizeParameters(pathItem, operation),
      requestBody: normalizeRequestBody(operation),
      responses: normalizeResponses(operation),
      security: normalizeSecurity(operation),
    });
  }
}

operations.sort((a, b) => `${a.authorityId}:${a.operationId}`.localeCompare(`${b.authorityId}:${b.operationId}`));

const projection = {
  schemaVersion: 'conexus-wire-projection/v1',
  source: 'canonical Product OpenAPI bundle',
  authority: 'PROJECTION_ONLY',
  operations,
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(projection, null, 2)}\n`);
