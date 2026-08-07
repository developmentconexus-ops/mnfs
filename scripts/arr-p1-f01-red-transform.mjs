#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const file = path.join(process.cwd(), 'scripts/test-documentation-tooling.mjs');
let source = await readFile(file, 'utf8');

const readAnchor = "const toolingText = await readFile(path.join(root, 'docs/tooling-adoption.md'), 'utf8');\n";
if (!source.includes(readAnchor)) throw new Error('F01 RED read anchor not found');
if (!source.includes("const statusText = await readFile(path.join(root, 'docs/tracking/STATUS.md'), 'utf8');")) {
  source = source.replace(
    readAnchor,
    readAnchor + "const statusText = await readFile(path.join(root, 'docs/tracking/STATUS.md'), 'utf8');\n",
  );
}

const assertionAnchor = "assert.doesNotMatch(toolingText, /Pi[^\\n]*`ADOPTED`/u);\n";
if (!source.includes(assertionAnchor)) throw new Error('F01 RED assertion anchor not found');
if (!source.includes('STATUS current phase must be P1 review')) {
  const block = [
    '',
    "assert.match(statusText, /\\*\\*Current phase:\\*\\* `ARR P1 — Pre-Spike Reconciliation Review`/u, 'STATUS current phase must be P1 review');",
    "assert.match(statusText, /Master ARR program plan 0\\.2\\.0:[^\\n]*ACCEPTED — GATE-P0/u, 'STATUS must record master plan acceptance');",
    "assert.match(statusText, /ARR-S0 plan 0\\.2\\.0:[^\\n]*ACCEPTED — GATE-P0/u, 'STATUS must record S0 plan acceptance');",
    "assert.match(statusText, /ARR P1 A1-A4 \\+ B1 \\+ P1-F01:[^\\n]*IMPLEMENTED \\/ VERIFIED \\/ REVIEW_REQUIRED/u, 'STATUS must record P1 implementation review state');",
    "assert.match(statusText, /ARR-S0 harness implementation:[^\\n]*PROHIBITED pending GATE-S0-IMPLEMENT/u, 'STATUS must keep S0 implementation gated');",
    "assert.match(statusText, /## Immediate next action — P1 review/u, 'STATUS next action must be P1 review');",
    "assert.doesNotMatch(statusText, /Pre-Spike reconciliation execution:[^\\n]*PROHIBITED pending plan approval\\/gate/u, 'STATUS must not prohibit the already-authorized P1 tranche');",
    "assert.doesNotMatch(statusText, /## Immediate next action — GATE-P0/u, 'STATUS must not point back to completed GATE-P0');",
    '',
  ].join('\n');
  source = source.replace(assertionAnchor, assertionAnchor + block);
}

await writeFile(file, source, 'utf8');
console.log('Applied P1-F01 RED status regression checks.');
