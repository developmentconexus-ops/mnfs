import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const adversarialRunner = 'scripts/run-wire-whole-4b-adversarial.mjs';
const projectSchema = 'contracts/api/project-operation.schema.json';
const budgetDeclaration = 'contracts/examples/budget-analyzer/AnalyzePendingBudgets.operation.json';

if (!fs.existsSync(adversarialRunner)) {
  throw new Error('Whole 4B executable proof is missing');
}

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
