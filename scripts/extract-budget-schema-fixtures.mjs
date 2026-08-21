import fs from 'node:fs';
import path from 'node:path';

const dir = 'contracts/examples/budget-analyzer';
const operations = ['AnalyzePendingBudgets', 'ListPendingBudgets'];

for (const operationId of operations) {
  const declarationPath = path.join(dir, `${operationId}.operation.json`);
  const declaration = JSON.parse(fs.readFileSync(declarationPath, 'utf8'));
  if (declaration.operationId !== operationId) {
    throw new Error(`declaration identity mismatch for ${declarationPath}`);
  }
  const outputPath = `/tmp/${operationId}.output.schema.json`;
  fs.writeFileSync(outputPath, `${JSON.stringify(declaration.outputSchema, null, 2)}\n`);
  console.log(`wrote ${outputPath}`);
}
