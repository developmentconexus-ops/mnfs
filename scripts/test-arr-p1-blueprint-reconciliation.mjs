#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const sourceDir = path.join(root, 'docs/product/blueprint');
const affected = [
  '01-product-vision.md',
  '02-domain-model.md',
  '03-lifecycle-flows.md',
  '04-engineering-system.md',
  '05-system-architecture.md',
  '06-roles-authority.md',
  '07-quality-evidence.md',
  '08-state-recovery.md',
  '09-context-memory.md',
  '10-security-isolation.md',
  '12-capability-roadmap.md',
  '13-documentation-governance.md',
];

const texts = Object.fromEntries(await Promise.all(
  affected.map(async (name) => [name, await readFile(path.join(sourceDir, name), 'utf8')]),
));

const specificMarkers = new Map([
  ['01-product-vision.md', 'Thin Sovereign Semantic Kernel'],
  ['02-domain-model.md', 'Runtime Session is observational'],
  ['03-lifecycle-flows.md', 'Validation Baseline'],
  ['04-engineering-system.md', 'OWN / ADOPT / ADAPT / SPIKE / REFERENCE / DEFER / REJECT'],
  ['05-system-architecture.md', 'Replaceable Agent Runtime'],
  ['06-roles-authority.md', 'Validator does not receive write authority by default'],
  ['07-quality-evidence.md', 'Implementer completion never grants acceptance'],
  ['08-state-recovery.md', 'Fresh Recovery does not depend on runtime transcript'],
  ['09-context-memory.md', 'HANDOFF_REQUIRED'],
  ['10-security-isolation.md', 'E0 → E4 ordinal ladder is superseded'],
  ['12-capability-roadmap.md', 'ARR-S0'],
  ['13-documentation-governance.md', 'Layered Agent Execution Planning'],
]);

for (const name of affected) {
  const text = texts[name];
  assert.match(text, /ARR-RECONCILIATION-2026-08-07/u, `${name} lacks ARR reconciliation marker`);
  assert.ok(text.includes(specificMarkers.get(name)), `${name} lacks section-specific reconciled semantics`);
}

function reject(name, pattern, message) {
  assert.doesNotMatch(texts[name], pattern, `${name}: ${message}`);
}

// Current product semantics cannot bind the harness to the superseded Pi/Treehouse realization.
reject('01-product-vision.md', /construída sobre Pi/u, 'product definition still says MNFS is built on Pi');
reject('01-product-vision.md', /workers Pi executam em worktrees isolados/u, 'operator flow still requires Pi workers/worktrees');
reject('01-product-vision.md', /No MNFS Pi-first/u, 'code-first rule is still Pi-first');
reject('01-product-vision.md', /Pi é o primeiro runtime/u, 'product direction still selects Pi-first runtime');
reject('01-product-vision.md', /Pi Lead\s*\n→ múltiplos Pi workers/u, 'evolution still selects Pi actors');
reject('01-product-vision.md', /Pi SDK ou RPC/u, 'future architecture still selects Pi transport');

// Domain semantics must describe replaceable runtime/workspace/environment bindings.
reject('02-domain-model.md', /Treehouse administra o lifecycle físico/u, 'Lease semantics still assign Treehouse as physical authority');
reject('02-domain-model.md', /Worker Run representa uma execução concreta de um agente Pi/u, 'Worker Run still means Pi execution');
reject('02-domain-model.md', /\| Lease \| Lead requests \| MNFS \+ Treehouse adapter/u, 'authority matrix still binds Lease to Treehouse');
reject('02-domain-model.md', /\| Worker Run \| Pi adapter/u, 'authority matrix still binds Worker Run to Pi');
assert.match(texts['02-domain-model.md'], /WriteTrack[^\n]*isolated mutable workspace/iu);
assert.match(texts['02-domain-model.md'], /Worker Run representa uma execução concreta de um Agent Runtime/u);

// Lifecycle must dispatch through current runtime/environment/workspace bindings, not selected vendors.
reject('03-lifecycle-flows.md', /DISPATCH DE WORKERS PI/u, 'canonical lifecycle still dispatches Pi workers');
reject('03-lifecycle-flows.md', /\| Alocação \| MNFS \+ Treehouse/u, 'phase table still binds allocation to Treehouse');
reject('03-lifecycle-flows.md', /\| Dispatch \| MNFS \+ Pi adapter/u, 'phase table still binds dispatch to Pi');
reject('03-lifecycle-flows.md', /## 3\.11\.3 Pi Worker/u, 'execution section still defines Pi Worker as canonical actor');
reject('03-lifecycle-flows.md', /solicitar worktree ao Treehouse/u, 'workspace allocation still requires Treehouse');
assert.match(texts['03-lifecycle-flows.md'], /Agent Runtime/u);
assert.match(texts['03-lifecycle-flows.md'], /isolated mutable workspace/u);

// Current architecture must be provider-neutral; vendor deep-dives may remain only as incumbent/historical evidence.
reject('05-system-architecture.md', /│ Pi Lead/u, 'current system diagram still binds Lead to Pi');
reject('05-system-architecture.md', /Treehouse worktree WT-001 → Pi Worker/u, 'current system diagram still binds workspace and Worker to vendors');
reject('05-system-architecture.md', /processos Pi separados para workers/u, 'modular-monolith definition still requires Pi processes');
reject('05-system-architecture.md', /Worktree physical\s+→ Treehouse/u, 'authority mapping still selects Treehouse');
reject('05-system-architecture.md', /Agent reasoning\s+→ Pi/u, 'authority mapping still selects Pi');
reject('05-system-architecture.md', /Pi executa raciocínio e workers; Treehouse fornece worktrees/u, 'chapter conclusion still selects Pi/Treehouse');
assert.match(texts['05-system-architecture.md'], /Historical \/ Incumbent Evidence — Pi Integration Architecture/u);
assert.match(texts['05-system-architecture.md'], /Historical \/ Incumbent Evidence — Treehouse Adapter/u);

// Recovery truth is provider-neutral. Concrete Treehouse/Pi examples must not own the current source-of-truth matrix or conclusion.
reject('08-state-recovery.md', /\| Worktree físico \| Treehouse \+ Git/u, 'source-of-truth matrix still selects Treehouse');
reject('08-state-recovery.md', /\| Worker Run state \| MNFS\/SQLite \| process adapter, Pi events/u, 'source-of-truth matrix still selects Pi events');
reject('08-state-recovery.md', /reconcilia esse estado com Git, Treehouse, processos, Pi sessions/u, 'chapter conclusion still selects Pi/Treehouse observations');
assert.match(texts['08-state-recovery.md'], /Mutable Workspace binding/u);
assert.match(texts['08-state-recovery.md'], /Runtime Session/u);

// Memory architecture is session-provider-neutral; Pi research is reference evidence, not the memory model.
reject('09-context-memory.md', /L3 — Exact Pi Session History/u, 'memory strata still define Pi-specific L3');
reject('09-context-memory.md', /## 9\.4\.4 L3 — Exact Pi Session History/u, 'memory model still defines Pi-specific L3');
reject('09-context-memory.md', /Não incorporar `@mastra\/memory` ao MNFS Pi-first/u, 'current memory decision is still Pi-first');
reject('09-context-memory.md', /Pi JSONL é reutilizado como ledger exato da Session/u, 'chapter conclusion still requires Pi JSONL');
assert.match(texts['09-context-memory.md'], /L3 — Exact Runtime Session History/u);
assert.match(texts['09-context-memory.md'], /Historical \/ Incumbent Runtime Reference — Pi session capabilities/u);

// E0-E4 and fixed E1 are historical realization vocabulary, not the current environment model.
for (const level of ['E0', 'E1', 'E2', 'E3', 'E4']) {
  reject('10-security-isolation.md', new RegExp(`## 10\\.8\\.[1-5] ${level} —`, 'u'), `${level} is still defined as a current isolation level`);
}
reject('10-security-isolation.md', /O target local do Writer será E1/u, 'chapter conclusion still selects fixed E1');
reject('10-security-isolation.md', /# 10\.34 AS-02 — Local Pi Sandbox on WSL2/u, 'AS-02 is still presented as a current architecture spike');
assert.match(texts['10-security-isolation.md'], /# 10\.8 Execution Environment property model/u);
assert.match(texts['10-security-isolation.md'], /Historical \/ Incumbent Evidence — AS-02 Local Pi Sandbox on WSL2/u);

// Section 12 is the current product roadmap and must not retain the superseded AB1/AS-02/Pi-first path as current.
reject('12-capability-roadmap.md', /\| AB1 \| Architecture Baseline and Contract Reconciliation \| `CURRENT GATE`/u, 'AB1 is still the current gate');
reject('12-capability-roadmap.md', /\| AS-02 \| Local Pi Sandbox on WSL2 \| `PREREQUISITE`/u, 'AS-02 is still a current prerequisite');
reject('12-capability-roadmap.md', /# 12\.9 AB1 — Architecture Baseline and Contract Reconciliation/u, 'old AB1 section remains in current roadmap');
reject('12-capability-roadmap.md', /# 12\.10 AS-02 — Local Pi Sandbox on WSL2/u, 'old AS-02 section remains in current roadmap');
reject('12-capability-roadmap.md', /Um único Pi Worker executa uma tarefa fixa/u, 'M2 current outcome still requires Pi');
reject('12-capability-roadmap.md', /### M2\.C2 Treehouse Lease/u, 'M2 current capability still requires Treehouse');
reject('12-capability-roadmap.md', /### M2\.C5 Pi Worker Process Adapter/u, 'M2 current capability still requires Pi adapter');
reject('12-capability-roadmap.md', /# 12\.13 AS-01 — Pi Session Memory and Messaging/u, 'old Pi-specific AS-01 remains in current roadmap');
reject('12-capability-roadmap.md', /O próximo passo é o Architecture Baseline Gate AB1/u, 'roadmap conclusion still points to AB1');
assert.match(texts['12-capability-roadmap.md'], /ARR-S0[\s\S]*ARR-S1[\s\S]*ARR-S2[\s\S]*ARR-S3/u);
assert.match(texts['12-capability-roadmap.md'], /M2 — Secure One-Worker Vertical Slice[\s\S]*OPPORTUNITY_REPLAN/u);

reject('13-documentation-governance.md', /AB1 só fecha depois/u, 'documentation-governance conclusion still points to AB1');

const aggregate = await readFile(path.join(root, 'docs/product/PRODUCT-BLUEPRINT.md'), 'utf8');
const roadmap = await readFile(path.join(root, 'docs/roadmap.md'), 'utf8');
for (const marker of [
  'ARR-RECONCILIATION-2026-08-07',
  'Thin Sovereign Semantic Kernel',
  'Replaceable Agent Runtime',
  'E0 → E4 ordinal ladder is superseded',
  'HANDOFF_REQUIRED',
  'ARR-S0',
]) {
  assert.ok(aggregate.includes(marker), `generated Product Blueprint lacks ${marker}`);
}
assert.doesNotMatch(aggregate, /\| AB1 \| Architecture Baseline and Contract Reconciliation \| `CURRENT GATE`/u);
assert.doesNotMatch(aggregate, /Um único Pi Worker executa uma tarefa fixa/u);
assert.doesNotMatch(roadmap, /\| AB1 \| Architecture Baseline and Contract Reconciliation \| `CURRENT GATE`/u);
assert.doesNotMatch(roadmap, /Um único Pi Worker executa uma tarefa fixa/u);
assert.match(roadmap, /M2 Opportunity Replan/u);
assert.match(roadmap, /ARR-S0/u);

console.log('ARR P1 Blueprint reconciliation tests passed.');
