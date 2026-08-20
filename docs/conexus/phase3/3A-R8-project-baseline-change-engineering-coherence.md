# 3A-R8 — Project Baseline & Change Engineering Coherence

**Status:** APPROVED pelo operador em 2026-08-18  
**Fase:** 3A — Architecture Reconciliation contínua  
**Natureza:** bounded reconciliation / gap-fill durante 3K  
**Método:** DevelopmentConexus Engineering Method v1.0.0  
**Importante:** esta decisão não constitui C-018, não encerra 3K nem a Fase 3, não autoriza implementação de produto, merge ou PR readiness.

## Decisão em uma frase

No Conexus F1, a arquitetura de um Project é **spec-anchored, viva e incremental**: o Project Baseline aprovado continua sendo a authority Project-owned sobre o estado intencional do software, mas sua suficiência é julgada proporcionalmente ao `Change` admitido — antes de qualquer coding dispatch, nenhuma decisão material necessária para executar corretamente aquela fatia pode ficar implicitamente delegada ao coding actor; todo Change pina a Baseline aprovada exata; se shaping ou implementação descobrir que a mudança exige alterar significado governado pela Baseline, a execução para antes de cruzar essa boundary, retorna pelo `Finding → REPLAN/HANDOFF_REQUIRED`, e só prossegue contra uma revisão de Baseline explicitamente aprovada.

---

## 1. Outcome

O coherence sweep iniciado durante 3K encontrou uma estrutura principal correta e dois gaps de composição estreitos:

```text
Project Baseline authority                         = EXISTS / SOUND
Engineering Standards + Actor Pack                = EXISTS / SOUND
Change correctness/checkpoint/replan              = EXISTS / SOUND
SDK / scaffold / mechanical gates                 = EXISTS / SOUND

Gap A — baseline sufficiency for current slice    = VALID
Gap B — baseline evolution across Changes         = VALID

new module                                        = 0
new durable record class                          = 0
new database/schema                               = 0
new workflow/architecture engine                  = 0
prior phase structural reopen                     = NONE
outcome                                           = CURRENT STRUCTURE CONFIRMED
                                                     + bounded composition correction
```

3A-R8 does not replace 3B-08, 3C-04, 3C-05, 3E-02, 3G-02, 3G-07, C-005/C-006/C-007/C-012/C-017 or the DevelopmentConexus Engineering Method. It makes their intended composition explicit so a future coding actor cannot become de facto architecture authority through omission.

---

## 2. Root cause

The defect class is not "LLMs write bad code". It is:

```text
strong local coding intelligence
+
missing / stale project-wide architectural authority at execution time
→ locally defensible decisions accumulate without global coherence
```

Typical failure sequence:

```text
Project intent / architecture A
→ Change 1 invents local pattern B
→ Change 2 invents local pattern C
→ codebase becomes the only practical memory
→ later actor infers architecture from accidental implementation
→ duplicate ownership / incompatible APIs / inconsistent errors / schema drift
```

The existing architecture already contains the correct owners and mechanisms. The missing protection was a non-ambiguous law connecting the approved Project Baseline to every Change and to late architecture discovery.

---

## 3. Evidence and research adjudication

### 3.1 Internal authority already points to the same structure

- 3B-08: Project Baseline is the versioned intentional state of the Project; Hub owns which revision/digest is approved; Actors and Changes receive the approved revision pinned; Git edits do not silently change authority.
- 3C-04: Project owns Baseline authority, canonical source association and explicit bindings; Builder does not own Project intent.
- 3E-02: `prj.approved_baseline` already exists as the durable Project-owned record class; no new Baseline entity is needed.
- C-017 / 3G-02: Change owns correctness contract/checkpoint; semantic change causes handoff/reapproval; Finding routes material invalidation through Replan/human; stale evidence is inadmissible.
- C-002 / C-017: Actor Pack is Hub-compiled from scoped context/standards; critical rules must be mechanical where reasonably possible.
- C-005/C-006/C-007/C-012: paved roads already remove recurring engineering choices from coding sessions through SDKs, contracts, database/migration rules, Connector grammar and scaffold/gates.

### 3.2 External research changed the original formulation

The ratification sweep compared the candidate against current industrial and research evidence, including:

- GitHub Spec Kit — spec-driven flow plus explicit documentation of spec persistence / silent divergence and evolving specifications;
- Kiro — Specs, Steering and Hooks as persistent project context + structured implementation + enforcement;
- SpecFirst (`arXiv:2607.27167`) — evidence that separating specification from coding can materially improve evaluated coding outcomes;
- SWE-RPG (`arXiv:2608.09072`) — implicit requirement recovery as a major brownfield bottleneck;
- the engineering-model evidence already catalogued by C-017 (`docs/conexus/23-modelo-engenharia.md`).

The research **rejected** an overly strong interpretation of the first candidate:

```text
"design the whole Project before first code"
```

The accepted formulation is instead:

```text
spec-first / architecture-first only to the depth required by the admitted slice
+
living baseline evolution as evidence arrives
+
no silent spec↔code drift
```

This preserves proportionality and YAGNI and avoids turning Conexus into big-design-up-front / waterfall.

Industrial/research references are evidence only; they do not create Conexus authority.

---

## 4. Four distinct layers remain distinct

```text
DevelopmentConexus Engineering Method
→ how material engineering decisions are reasoned about

Platform Engineering Standards / SDK / scaffold / gates
→ how Conexus-built software follows platform engineering invariants

Project Baseline
→ what THIS Project is intended to be at the architecture/product boundary

Change Contract
→ what THIS bounded evolution must make true
```

Rules:

```text
Platform standard != Project architecture decision
Project Baseline   != Change Contract
Change Contract    != implementation plan
implementation     != authority merely because it exists
```

The Project Baseline should not duplicate scaffold/SDK mechanics already owned by platform standards. It records Project-specific meaning and material choices.

---

## 5. Living / incremental Baseline law

The Baseline is **not** a one-time inception document frozen forever and is **not** a requirement to decide hypothetical future architecture.

Target law:

> **The approved Baseline must be sufficient for the current admitted Change, not complete for every possible future capability.**

Before coding a given Change, unresolved questions may remain safely deferred when they are not required by that Change and can be added later without dismantling current authority or contracts.

Examples of legitimate defer:

```text
future webhook model with no current webhook consumer
future billing architecture in F1 internal product
future multi-region topology with no current requirement
future Product Agent effects in a read-only vertical
```

Examples that cannot be silently delegated when the current Change depends on them:

```text
which domain owns a new durable concept
whether two concepts are one aggregate or independent lifecycles
which system owns business truth
live vs mirror vs hybrid when it materially shapes the current data architecture
new public/external contract semantics
new security / trust boundary
new irreversible/hard-to-reverse topology required by the Change
```

No universal Baseline checklist or readiness score is frozen. Materiality is resolved under the DevelopmentConexus Engineering Method and the current Change evidence.

---

## 6. Baseline sufficiency gate

Before any coding ActorRun for a Change, Builder must establish under the current approved Project authority that:

```text
exact approved Project Baseline is identified
+
Change contract is current and approved
+
all material Project-level decisions required by this Change are resolved
OR explicitly deferred because they are not required by this Change
+
required discovery / current evidence is sufficient
→ coding dispatch may be considered by the remaining existing gates
```

If one material Project-level decision required by the Change is unresolved:

```text
coding dispatch = NOT ADMISSIBLE
```

The agent may investigate, compare alternatives and propose a Baseline revision before coding. It may not use implementation as the mechanism that silently decides the unresolved architecture.

This is a sufficiency predicate, not a new `BaselineStatus` FSM, score, workflow or durable record.

---

## 7. Exact Baseline pin per Change

Every Change semantically pins the exact approved Project Baseline revision/digest against which it was shaped and approved.

Conceptually:

```text
Change
├── projectRef
├── projectBaselineDigest   ← exact approved Baseline used
├── current contract revision
├── plan revision when applicable
└── remaining execution-context pins
```

The exact physical column/DTO/schema spelling belongs to Realization Planning. No new record class is authorized.

`ProjectBaselineDigest` is:

- provenance of Project-level intent;
- an input to Change compatibility/admissibility;
- an explicit component of the ActorRun execution/proof identity.

It is **not**:

- a new permission;
- a Release pointer;
- serving authority;
- a mutable snapshot copied from Project internals.

---

## 8. Execution / proof identity correction

C-017's `executionContextDigest` remains the canonical compositional execution-context identity. 3A-R8 makes one previously implicit semantic pin explicit:

```text
ProjectBaselineDigest
→ MUST participate in executionContextDigest / equivalent proof identity
```

This is a bounded composition clarification over the existing Project layer in Actor Pack and the existing rule that exact semantic pins used by the ActorRun belong in proof identity.

Consequences:

```text
wrong/missing Baseline pin
→ Actor Pack / dispatch / proof is insufficient

Evidence produced under Baseline A
→ proves only the execution context that included Baseline A
```

A newer Baseline revision does **not** automatically invalidate every historical Change or every unrelated in-flight Change. Compatibility with a newer Baseline is judged proportionally through the existing current-authority/checkpoint/revalidation rules. The architecture does not create global cascade invalidation merely because the whole-Baseline digest changed.

Exact compatibility algorithm is Realization Planning; until proven compatible, uncertainty cannot be converted to admissibility.

---

## 9. Baseline-preserving vs Baseline-affecting Change

During shaping/checkpoint, the Builder must determine whether the admitted Change can remain within the currently approved Project Baseline.

Conceptually:

```text
BASELINE_PRESERVING
or
BASELINE_REVISION_REQUIRED
```

These labels are explanatory only. They do **not** create a new persisted enum/FSM.

### Baseline-preserving

The Change fits inside current Project-level meaning/boundaries.

Examples may include:

- local UI refinement;
- query optimization that preserves data meaning and contracts;
- bug fix inside an accepted module boundary;
- adding a filter to an existing capability without changing ownership/contract semantics.

### Baseline-affecting

The Change requires new or altered Project-level meaning, for example:

- owner/boundary changes;
- durable concept/lifecycle changes;
- data-source/data-path architecture changes material to the product;
- public contract architecture changes;
- trust/security boundary changes;
- other hard-to-reverse architecture decisions required by the Change.

For a Baseline-affecting Change:

```text
Change intent / discovery
→ proposed Baseline revision
→ Project-owned Baseline candidate
→ explicit human approval
→ exact new approved Baseline pin
→ Change checkpoint / coding dispatch under that Baseline
```

Builder proposes/explains. Project owns Baseline adoption. Human approval remains explicit. No Builder self-approval of Project architecture.

---

## 10. Late architecture discovery during implementation

A coding ActorRun can discover evidence that the approved Change cannot be implemented correctly without changing Project Baseline meaning.

That discovery does **not** grant permission to implement the architecture change.

Required behavior:

```text
new material evidence
→ existing Finding path
→ route to REPLAN / HUMAN as required by existing C-017 / 3G-02 semantics
→ HANDOFF_REQUIRED / no further architecture-crossing coding dispatch
→ Baseline revision candidate
→ explicit approval
→ revised Change/checkpoint as applicable
→ successor ActorRun only under current approved authority
```

3A-R8 does not add a new Finding type or route enum. The existing Finding fields (`contract_impact`, evidence, route, status) and current routing law carry the decision.

Outputs/Evidence produced before the new Baseline becomes applicable remain historical evidence under their exact pins and are not silently promoted to prove the revised architecture.

---

## 11. Baseline evolution without global invalidation

The Baseline may evolve while other Changes/history exist.

Rules:

```text
new Baseline revision
-X-> rewrite historical Change pins
-X-> rewrite historical Evidence
-X-> rewrite active Release automatically
-X-> invalidate every unrelated Change by default
```

Instead:

```text
historical Change/Evidence retain exact old Baseline provenance
current/new dispatch uses current approved Project authority
in-flight Change under older Baseline must establish compatibility before new dispatch/closure when the newer Baseline is materially relevant
incompatibility/unknown material impact → checkpoint/replan/revalidation
```

This composes with 3G-02 governance/context drift and 3G-07 Project lifecycle without a new global generation or architecture epoch.

---

## 12. Paved-road engineering remains the primary enforcement for recurring mechanics

Project Baseline is not a substitute for mechanical engineering rails.

The division remains:

```text
model / Builder decides
→ Project-specific domain/product architecture
→ feature composition
→ business rules
→ local implementation tactics inside authority

platform decides/enforces through existing rails
→ artifact/query/action/job/integration grammar
→ database/migration/role mechanics
→ Connector contract/credential boundary
→ frontend scaffold/runtime SDK/Honest UI
→ critical gates / generated/platform-contract ownership
```

If a recurring engineering rule can be enforced by SDK, type, parser, role, scaffold, schema or gate at reasonable cost, leaving it only in Baseline prose is weaker and should not be the default.

---

## 13. Brownfield law

For an existing codebase, current code is evidence, not target authority merely because it exists.

Brownfield Inception must reconstruct enough of product/domain/data/contracts/boundaries/current behavior to propose an approved Baseline sufficient for the first admitted Change.

The objective is not to document every private function before work begins. It is to prevent accidental implementation history from remaining the only source of Project-level architectural meaning.

Material inconsistencies found between current implementation and the approved/intended Baseline become explicit Findings / migration/replan inputs; they are not silently normalized in favor of whichever file currently exists.

---

## 14. Cost / proportionality guardrail

3A-R8 is explicitly not a license for design ceremony.

Prohibited interpretation:

```text
small Change
→ full-system architecture redesign
→ exhaustive future requirements
→ architecture documents for unused capabilities
→ mandatory independent agent review of every local choice
```

Required interpretation:

```text
planning depth ∝ materiality / uncertainty / blast radius
+
resolve only Project-level decisions needed by the admitted slice
+
mechanize recurring engineering decisions once at platform level
+
reuse the approved Baseline instead of rediscovering architecture every session
```

The expected economic benefit is not assumed as truth. Future implementation/eval must measure quality gain against token, sandbox, wall-clock and human-attention cost.

---

## 15. Proof strategy

Post-C-018 Realization Planning and later implementation verification must be able to falsify at least these claims:

### P1 — initial/current-slice sufficiency

Given a Change that requires an unresolved Project-level owner/boundary/data-contract decision:

```text
coding dispatch must fail / remain inadmissible
```

until the applicable Baseline decision is approved.

### P2 — exact Baseline pin

Actor Pack / Change / ActorRun proof with missing or mismatched approved Baseline identity must fail the relevant compile/admission/proof gate.

### P3 — late architecture discovery

A worker that discovers a necessary Baseline-affecting decision and attempts to implement across it without replan/reapproval must be rejected; the Finding/Handoff path must be demonstrably reachable.

### P4 — stale/incompatible proof

Evidence under Baseline A must not prove a Baseline-B Change when the relevant meaning changed or compatibility is unknown.

### P5 — proportionality

A local Baseline-preserving Change must not require whole-Project redesign merely because a Baseline exists.

### P6 — economic calibration

Golden benchmark / Worker Eval should compare, where feasible with the same base model/task family:

```text
raw/weak-context coding
vs
paved roads (SDK/scaffold/standards)
vs
Baseline + Change + scoped context + paved roads + gates
```

Measure at least correctness assertions, architectural violations, rework, Findings, token/sandbox/wall-clock cost and human intervention. Architecture does not pre-claim the size of the gain.

---

## 16. Explicit non-goals / anti-overengineering

Do not create for 3A-R8:

```text
ArchitectureEngine
ArchitectureService
ArchitectureDecision domain/table
ADR database as runtime authority
ArchitectureChangeRequest entity
architecture epoch / global Project generation
Baseline FSM / readiness score
universal architecture checklist
new workflow DSL / pipeline
new application use case merely for symmetry
new durable record / FK
automatic semantic-diff AI as acceptance authority
big-design-up-front requirement
spec-as-source code generation requirement
```

Exact Baseline authoring format, UI, semantic compatibility algorithm and compile representation remain Realization Planning/3K where applicable.

---

## 17. Reopen triggers

Reopen 3A-R8 only if evidence shows one of:

1. approved Baseline + Change pins still allow coding actors to create material Project-level meaning without explicit adoption;
2. Baseline evolution produces unacceptable false invalidation / serialized work despite bounded compatibility handling;
3. measured ceremony/cost materially exceeds quality benefit and a smaller invariant preserves the failure-class protection;
4. a future Project class needs multiple independent architecture baselines with real lifecycle/ownership not representable by the current Project Baseline;
5. implementation evidence requires new durable authority state, owner or cross-module orchestration to realize these laws.

Preference for another documentation style is not a reopen trigger.

---

## 18. Final reconciliation

```text
3B-08 Project Baseline authority               = PRESERVED
3C-04 Project ownership                        = PRESERVED
3C-05 Builder ownership                        = PRESERVED
3E-02 durable record inventory                 = PRESERVED / no new class
3G-02 Change + Finding + replan                = PRESERVED / composed
3G-07 Baseline revision flow                   = PRESERVED / composed
C-005/C-006/C-007/C-012 paved roads            = PRESERVED
C-017 engineering model                        = PRESERVED / baseline pin made explicit
DevelopmentConexus Engineering Method          = PRESERVED

new module / record / DB / workflow            = 0
big-design-up-front                            = REJECT
silent architecture delegation to coding actor = REJECT
silent Baseline↔code divergence                = REJECT
Project architecture model                     = SPEC-ANCHORED / LIVING / INCREMENTAL
```

**Verdict:** `CURRENT STRUCTURE CONFIRMED + BOUNDED CORRECTION APPROVED`.

3K Package C may now continue using Sankhya only as the first concrete vertical/evidence case; any Project-specific data-path decision (live/mirror/hybrid) must be justified for that Project/Change under this Baseline law and never becomes an implicit universal Conexus rule.