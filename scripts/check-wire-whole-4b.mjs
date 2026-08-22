import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const adversarialRunner = 'scripts/run-wire-whole-4b-adversarial.mjs';
const projectSchema = 'contracts/api/project-operation.schema.json';
const budgetDeclaration = 'contracts/examples/budget-analyzer/AnalyzePendingBudgets.operation.json';
const productDirectory = 'contracts/api/product';
const productEntrypoint = path.join(productDirectory, 'openapi.yaml');

if (!fs.existsSync(adversarialRunner)) {
  throw new Error('Whole 4B executable proof is missing');
}

const productSource = fs.readFileSync(productEntrypoint, 'utf8');
const directlyReferencedYaml = new Set(
  [...productSource.matchAll(/\$ref:\s*['"]?\.\/([^#'"\s]+\.yaml)#/g)].map((match) => match[1]),
);
const productYaml = fs.readdirSync(productDirectory)
  .filter((name) => name.endsWith('.yaml') && name !== 'openapi.yaml')
  .sort();
const unreachableYaml = productYaml.filter((name) => !directlyReferencedYaml.has(name));
if (unreachableYaml.length) {
  throw new Error(`Product contract directory contains unreachable YAML authority: ${unreachableYaml.join(', ')}`);
}
console.log(`Product wire topology passed (${productYaml.length} reachable YAML fragments; 0 dead parallel fragments).`);

const result = spawnSync('node', [adversarialRunner], {
  encoding: 'utf8',
  maxBuffer: 20 * 1024 * 1024,
});

process.stdout.write(result.stdout ?? '');
process.stderr.write(result.stderr ?? '');

if (result.status !== 0) {
  throw new Error('Whole 4B adversarial proof failed');
}

const broadPayloadProbe = JSON.parse(fs.readFileSync(budgetDeclaration, 'utf8'));
broadPayloadProbe.operationId = 'ExecuteAnyOperation';
broadPayloadProbe.inputSchema = true;
broadPayloadProbe.outputSchema = {};
broadPayloadProbe.proof = {
  positiveCaseId: 'whole-4b-broad-payload-positive',
  negativeControlId: 'whole-4b-broad-payload-negative',
};
const broadPayloadPath = '/tmp/conexus-4b-broad-payload.operation.json';
fs.writeFileSync(broadPayloadPath, `${JSON.stringify(broadPayloadProbe, null, 2)}\n`);
const broadPayloadResult = spawnSync(
  'npx',
  ['--yes', 'ajv-cli@5.0.0', 'validate', '--spec=draft2020', '-s', projectSchema, '-d', broadPayloadPath],
  { encoding: 'utf8' },
);
if (broadPayloadResult.status === 0) {
  throw new Error('Project grammar accepted a semantically unbounded input/output schema');
}
console.log('negative control fired: Project grammar rejects semantically unbounded payload schemas');

console.log('Whole 4B executable proof passed.');
