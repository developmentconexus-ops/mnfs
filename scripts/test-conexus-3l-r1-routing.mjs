#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const read = (p) => readFile(path.join(root, p), 'utf8');

const [readme, product, architecture, reconciliation, ledger, q0, bt3a, bt3aLead, bt4nLead] = await Promise.all([
  read('docs/conexus/current/README.md'),
  read('docs/conexus/current/PRODUCT-CONTRACT.md'),
  read('docs/conexus/current/ARCHITECTURE-BASELINE.md'),
  read('docs/conexus/current/DECISION-RECONCILIATION.md'),
  read('docs/conexus/phase3/LEDGER.md'),
  read('docs/conexus/phase3/3L-Q0-qualification-manifest.md'),
  read('docs/conexus/phase3/3L-B-BT3A-context-authority-discriminant.md'),
  read('docs/conexus/phase3/3L-B-BT3A-lead-adjudication.md'),
  read('docs/conexus/phase3/3L-B-BT4N-lead-adjudication.md'),
]);

const staleBt4nProjectionPattern = /BT-4N\b(?:(?!BT-\d+[A-Z]+\b)[^\n])*(?:\bNEXT\b|ADJUDICATION(?:(?!BT-\d+[A-Z]+\b)[^\n])*\bPENDING\b)/iu;
const historicalBt5nRoutePattern = /Historical pre-execution route, superseded by (?:the executor record above|current executor projection): `BT-5N = NEXT \/ EXECUTION AUTHORIZED`/u;
const staleBt5nVerdictPattern = /BT-5N[^\n]*\bNOT_PROVEN\b/iu;
const staleBt5nAdjudicationPattern = /BT-5N\s+(?:EXECUTION|EXECUTOR VERDICT)[^\n]*(?:\n[^\n]*){0,2}\bPENDING\b/iu;
const stalePackageBPattern = /Package B[^\n]*\bIN PROGRESS\b/iu;
const stalePackageDEInheritancePattern = /Packages? D(?:\/E| and E)?[^\n]*\bNEXT\b[^\n]*inheritance/iu;

const acceptedCurrentOutcomePatterns = {
  packageB: /Package B\s*=\s*CLOSED\s*\/\s*LEAD-ADJUDICATED\s*\/\s*QUALIFIED FOR CURRENT F1 TESTED PROPERTIES/iu,
  bt5n: /BT-5N\s*=\s*PASS\s*\/\s*LEAD-ADJUDICATED\s*\/\s*QUALIFIED_SAME_PROCESS/iu,
  agent: /CX-AGENT-MASTRA-01\s*=\s*QUALIFIED FOR CURRENT F1 TESTED PROPERTIES/iu,
  isolation: /CX-RUNTIME-ISOLATION-01\s*=\s*QUALIFIED_SAME_PROCESS(?:\s+FOR ENABLED F1 SURFACES)?/iu,
  packageC: /Package C\s*=\s*DEFER SAFELY\s*\/\s*NOT EXECUTED/iu,
  packagesDE: /Packages D\/E\s*=\s*NOT EXECUTED\s*\/\s*REQUIRE PROPORTIONAL REDERIVATION/iu,
  implementation: /Product implementation\s*=\s*BLOCKED/iu,
  c018: /C-018\s*=\s*NOT RATIFIED/iu,
};

for (const staleProjection of [
  'BT-4N NEXT — EXECUTION AUTHORIZED',
  'BT-4N NEXT',
  'BT-4N ADJUDICATION = PENDING',
]) {
  assert.match(
    staleProjection,
    staleBt4nProjectionPattern,
    `stale BT-4N matcher must identify ${staleProjection}`,
  );
}
assert.doesNotMatch(
  'BT-4N = PASS / LEAD-ADJUDICATED / PASS_NATIVE_SCHEDULE_INGRESS / BT-5N = NEXT / EXECUTION AUTHORIZED',
  staleBt4nProjectionPattern,
  'BT-4N stale matcher must not consume a later BT-5N NEXT projection on the same line',
);

for (const [name, text] of Object.entries({ readme, architecture, reconciliation, ledger })) {
  assert.match(text, /3L-R1/u, `${name} must route through the operator-ratified 3L-R1 amendment`);
}

assert.match(readme, /BT-3N[^\n]*PASS_NATIVE_HITL_OWNER_BOUNDARY/u,
  'current README must preserve the accepted BT-3N verdict without closing Package B');
assert.match(ledger, /BT-3N[^\n]*PASS_NATIVE_HITL_OWNER_BOUNDARY/u,
  'LEDGER must preserve the accepted BT-3N verdict without closing Package B');
assert.match(readme, /BT-3N[^\n]*PASS[^\n]*LEAD-ADJUDICATED/iu,
  'current README must project the lead-adjudicated BT-3N PASS');
assert.match(ledger, /BT-3N[^\n]*PASS[^\n]*LEAD-ADJUDICATED/iu,
  'LEDGER must project the lead-adjudicated BT-3N PASS');
for (const [name, text] of Object.entries({ readme, architecture, reconciliation, ledger })) {
  assert.match(
    text,
    /BT-4N[^\n]*PASS[^\n]*LEAD-ADJUDICATED[^\n]*PASS_NATIVE_SCHEDULE_INGRESS/iu,
    `${name} must project the lead-adjudicated BT-4N PASS`,
  );
  for (const [outcome, pattern] of Object.entries(acceptedCurrentOutcomePatterns)) {
    assert.match(text, pattern, `${name} must project accepted current outcome: ${outcome}`);
  }
  assert.doesNotMatch(text, staleBt5nVerdictPattern,
    `${name} must reject stale BT-5N NOT_PROVEN projection`);
  assert.doesNotMatch(text, staleBt5nAdjudicationPattern,
    `${name} must reject stale BT-5N adjudication-pending projection`);
  assert.doesNotMatch(text, stalePackageBPattern,
    `${name} must reject stale Package B IN PROGRESS projection`);
  assert.doesNotMatch(text, stalePackageDEInheritancePattern,
    `${name} must reject inherited Package D/E NEXT routing`);
  assert.match(
    text,
    historicalBt5nRoutePattern,
    `${name} must retain the explicitly labeled historical pre-execution route`,
  );
  assert.doesNotMatch(
    text,
    /(?:^|\n)\s*>?\s*\*{0,2}Execute only `BT-5N\b[^\n]*/iu,
    `${name} must not instruct a current BT-5N rerun`,
  );
  assert.doesNotMatch(
    text,
    /(?:^|\n)\s*(?:authorize|authorise) only (?:Package-B )?BT-5N\b[^\n]*/iu,
    `${name} must not authorize a completed BT-5N rerun`,
  );
  assert.doesNotMatch(
    text,
    staleBt4nProjectionPattern,
    `${name} must not retain stale BT-4N execution or pending-adjudication state`,
  );
}
assert.match(
  bt4nLead,
  /PASS_NATIVE_SCHEDULE_INGRESS/iu,
  'router projection must be anchored in the BT-4N lead adjudication',
);
assert.doesNotMatch(
  readme,
  /BT-3N EXECUTION[^\n]*COMPLETE\s*\nBT-3N EXECUTOR VERDICT[^\n]*\s*\nARCHITECTURE-LEAD ADJUDICATION = PENDING/iu,
  'current README must not retain pending BT-3N Architecture-Lead adjudication'
);
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
