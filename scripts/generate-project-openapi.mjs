import fs from 'node:fs';
import path from 'node:path';

const declarationDir = process.argv[2];
const outputPath = process.argv[3];
const writeMode = process.argv.includes('--write');

if (!declarationDir || !outputPath) {
  throw new Error('usage: node scripts/generate-project-openapi.mjs <declaration-dir> <output-path> [--write]');
}

const files = fs.readdirSync(declarationDir)
  .filter((name) => name.endsWith('.operation.json'))
  .sort();

if (files.length === 0) throw new Error(`no project operation declarations found in ${declarationDir}`);

const declarations = files.map((name) => {
  const filePath = path.join(declarationDir, name);
  return { filePath, value: JSON.parse(fs.readFileSync(filePath, 'utf8')) };
});

function slugifyOperationId(value) {
  const slug = value
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[._]+/g, '-')
    .toLowerCase();
  if (!/^[a-z][a-z0-9-]*$/.test(slug)) throw new Error(`operationId cannot be deterministically slugified: ${value}`);
  return slug;
}

const regimeRoot = {
  QUERY: 'queries',
  ACTION: 'actions',
  INTEGRATION: 'integrations',
};

const paths = {};
const operationIds = new Set();
for (const { filePath, value: declaration } of declarations) {
  const operationId = declaration.operationId;
  if (operationIds.has(operationId)) throw new Error(`duplicate Project operationId: ${operationId}`);
  operationIds.add(operationId);

  const root = regimeRoot[declaration.regime];
  if (!root) throw new Error(`unsupported Project operation regime in ${filePath}: ${declaration.regime}`);

  const literalSegment = slugifyOperationId(operationId);
  const operationPath = `/api/projects/{projectId}/${root}/${literalSegment}`;
  if (operationPath.includes('{operationSlug}') || /(^|\/)execute(\/|$)/i.test(operationPath)) {
    throw new Error(`generic executor-shaped Project operation path: ${operationPath}`);
  }
  if (paths[operationPath]) throw new Error(`generated Project operation path collision: ${operationPath}`);

  const publishedAppCaller = declaration.callers.find((caller) => caller.kind === 'PUBLISHED_APP');
  const unsupportedHttpCaller = declaration.callers.find((caller) => !['PUBLISHED_APP', 'CONTROL_PLANE'].includes(caller.kind));
  if (unsupportedHttpCaller) {
    throw new Error(`generator has no admitted HTTP carriage for caller ${unsupportedHttpCaller.kind} in ${operationId}`);
  }

  paths[operationPath] = {
    parameters: [
      {
        name: 'projectId',
        in: 'path',
        required: true,
        description: 'Untrusted Project reference; current containment and authority are resolved server-side.',
        schema: { type: 'string', minLength: 1 },
      },
    ],
    post: {
      summary: operationId,
      operationId,
      'x-conexus-project-operation-regime': declaration.regime,
      'x-conexus-contract-state': 'SCHEMA_MAPPED',
      'x-conexus-required-pins': declaration.requiredPins,
      'x-conexus-outcome-profile': declaration.outcomeProfile,
      'x-conexus-ic-profiles': declaration.icProfiles,
      ...(publishedAppCaller ? { 'x-conexus-app-roles': publishedAppCaller.roles } : {}),
      requestBody: {
        required: true,
        content: {
          'application/json': { schema: declaration.inputSchema },
        },
      },
      responses: {
        '200': {
          description: `${operationId} result`,
          content: {
            'application/json': { schema: declaration.outputSchema },
          },
        },
        '401': { '$ref': '#/components/responses/Problem401' },
        '403': { '$ref': '#/components/responses/Problem403' },
        '404': { '$ref': '#/components/responses/Problem404' },
        '422': { '$ref': '#/components/responses/Problem422' },
        '503': { '$ref': '#/components/responses/Problem503' },
      },
    },
  };
}

const oas = {
  openapi: '3.1.2',
  jsonSchemaDialect: 'https://spec.openapis.org/oas/3.1/dialect/2024-11-10',
  info: {
    title: 'Generated Conexus Project Operations',
    version: 'project-operation-v1',
    description: 'Generated projection from exact Release-pinned project-operation/v1 declarations. Do not edit by hand.',
  },
  servers: [{ url: '/', description: 'Relative Product API root; deployment origin remains outside 4B.' }],
  security: [{ ConexusSession: [] }],
  'x-conexus-generated': true,
  'x-conexus-source-schema': 'contracts/api/project-operation.schema.json',
  'x-conexus-browser-request-authenticity': {
    credentialedCrossOriginProductApi: 'DENY',
    browserFetchMetadata: 'SAME_ORIGIN_ONLY',
    fallback: 'EXACT_ORIGIN_OR_REFERER',
  },
  paths,
  components: {
    securitySchemes: {
      ConexusSession: {
        type: 'apiKey',
        in: 'cookie',
        name: '__Host-conexus_session',
        description: 'Opaque Conexus iam.session; Secure; HttpOnly; Path=/; no Domain; SameSite=Lax.',
      },
    },
    schemas: {
      Problem: {
        type: 'object',
        additionalProperties: true,
        required: ['type', 'title', 'status'],
        properties: {
          type: { type: 'string', format: 'uri-reference' },
          title: { type: 'string' },
          status: { type: 'integer', minimum: 100, maximum: 599 },
          detail: { type: 'string' },
          instance: { type: 'string', format: 'uri-reference' },
        },
      },
    },
    responses: Object.fromEntries([
      [401, 'No valid current Conexus session/principal.'],
      [403, 'Current caller or browser request context is denied.'],
      [404, 'Subject absent or intentionally non-disclosable.'],
      [422, 'Admitted semantic/business input is invalid.'],
      [503, 'Required current dependency is unavailable.'],
    ].map(([status, description]) => [
      `Problem${status}`,
      {
        description,
        content: { 'application/problem+json': { schema: { '$ref': '#/components/schemas/Problem' } } },
      },
    ])),
  },
};

const generated = `${JSON.stringify(oas, null, 2)}\n`;
if (writeMode) {
  fs.writeFileSync(outputPath, generated);
  console.log(`wrote ${outputPath} from ${declarations.length} Project operation declarations`);
} else {
  const existing = fs.readFileSync(outputPath, 'utf8');
  if (existing !== generated) {
    throw new Error(`${outputPath} drifted from deterministic Project operation declarations`);
  }
  console.log(`Project OAD generation check passed (${declarations.length} declarations; ${Object.keys(paths).length} static paths).`);
}
