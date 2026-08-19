#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const read = (p) => readFile(path.join(root, p), 'utf8');

const [readme, product, architecture, reconciliation, ledger, q0, bt3a, bt3aLead] = await Promise.all([
  read('docs/conexus/current/README.md'),
  read('docs/conexus/current/PRODUCT-CONTRACT.md'),
  read('docs/conexus/current/ARCHITECTURE-BASELINE.md'),
  read('docs/conexus/current/DECISION-RECONCILIATION.md'),
  read('docs/conexus/phase3/LEDGER.md'),
  read('docs/conexus/phase3/3L-Q0-qualification-manifest.md'),
  read('docs/conexus/phase3/3L-B-BT3A-context-authority-discriminant.md'),
  read('docs/conexus/phase3/3L-B-BT3A-lead-adjudication.md'),
]);

for (const [name, text] of Object.entries({ readme, architecture, reconciliation, ledger })) {
  assert.match(text, /3L-R1/u, `${name} must route through the operator-ratified 3L-R1 amendment`);
}

assert.match(readme, /BT-3N EXECUTION[^\n]*COMPLETE/u, 'current README must record completed BT-3N execution');
assert.match(ledger, /BT-3N[^\n]*EXECUTION COMPLETE/u, 'LEDGER must record completed BT-3N execution');
assert.match(readme, /BT-3N EXECUTOR VERDICT[^\n]*PASS_NATIVE_HITL_OWNER_BOUNDARY/u,
  'current README must preserve the executor verdict without closing Package B');
assert.match(ledger, /BT-3N EXECUTOR VERDICT[^\n]*PASS_NATIVE_HITL_OWNER_BOUNDARY/u,
  'LEDGER must preserve the executor verdict without closing Package B');
assert.doesNotMatch(readme, /BT-3A NEXT/u, 'current README must not re-authorize completed BT-3A');
assert.doesNotMatch(ledger, /BT-3A NEXT/u, 'LEDGER must not re-authorize completed BT-3A');
assert.match(architecture, /RequestContext[^\n]*runtime[^\n]*configuration[^\n]*not[^\n]*authority/iu,
  'Architecture Baseline must project RequestContext as non-authoritative runtime/configuration substrate');
assert.doesNotMatch(architecture, /REPLACE WHOLE restored\/effective context/u,
  'Architecture Baseline must not retain the superseded Mastra object-level replace-whole mechanism');
assert.match(product, /hard per-run USD[^\n]*not[^\n]*F1/iu,
  'Product Contract must not promise a hard per-run USD guarantee in F1');
assert.match(reconciliation, /Package C[^\n]*DEFER/u,
  'Decision Reconciliation must classify Package C as deferred for F1');
assert.match(q0, /Package C[^\n]*DEFER/u,
  'Q0 must project the Package-C deferral amendment');
assert.match(bt3a, /EXECUTED|SUPERSEDED/u,
  'BT-3A discriminant must say it is no longer the next action');
assert.match(bt3aLead, /3L-R1/u,
  'BT-3A lead adjudication must route its superseded candidate direction to 3L-R1');

console.log('Conexus 3L-R1 routing test passed.');
