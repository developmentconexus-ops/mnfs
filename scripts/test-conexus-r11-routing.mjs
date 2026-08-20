#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const ledger = await readFile(path.join(root, 'docs/conexus/phase3/LEDGER.md'), 'utf8');

assert.match(
  ledger,
  /3A-R11\n→ Whole-Product Authority Rebaseline \/ CLOSED \/ APPROVED \/ OPERATOR RATIFIED/u,
  'Phase-3 precedence must project the closed/operator-ratified R11 state',
);

const readRuleMatch = ledger.match(/Regra de leitura:\s*\n\n```text\n([\s\S]*?)\n```/u);
assert.ok(readRuleMatch, 'LEDGER must expose one canonical Regra de leitura block');
const readRule = readRuleMatch[1];

assert.match(
  readRule,
  /docs\/conexus\/current\/README\.md/u,
  'LEDGER read path must enter Conexus through the canonical current entrypoint',
);
assert.doesNotMatch(
  readRule,
  /docs\/conexus\/DECISOES\.md/u,
  'LEDGER read path must not route through the historical decision index before current authority',
);
assert.ok(
  readRule.indexOf('docs/conexus/current/README.md') < readRule.indexOf('este LEDGER'),
  'LEDGER read path must place current authority before Phase-3 status/detail',
);

console.log('Conexus R11 routing test passed.');
