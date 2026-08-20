# 3D — Fable Independent Architecture Review Handoff

**Status:** REVIEW BRIEF / NON-AUTHORITATIVE  
**Phase:** 3D — Dependency Architecture, pre-decision review  
**PR:** #40  
**Branch:** `agent/conexus-phase-3-system-design`  
**Prepared against:** `f4204c7dd95fd28ce3d1cd7dc3ec51e60676dab8`  
**Important:** this file is a reviewer brief. It is **not** C-018, not a 3D Decision, not architecture authority, and does not authorize implementation, merge, PR readiness, or 3E.

---

## 1. Role assigned to Fable

For this review, act as an **independent Senior/Staff/Principal Software Engineer and Software Architect**, not as a rubber-stamp reviewer.

The expected technical profile is strong in:

- modular-monolith architecture;
- TypeScript/Node module boundaries and import graphs;
- dependency direction and cycle prevention;
- pragmatic DDD/module ownership;
- application/use-case orchestration;
- transaction and authority boundaries;
- narrow APIs, projections, snapshots and references;
- dependency inversion where it removes a real coupling/failure class;
- recognizing when interfaces/ports are useful versus ceremonial hexagonal architecture;
- testability and replaceability of selected substrates;
- runtime failure modes, stale authority and TOCTOU concerns;
- long-lived software architecture, not only diagram aesthetics.

You are expected to reason down to implementation reality — e.g. what would actually import what, which package would know which types, what data would need to cross the boundary, and where a TypeScript circular dependency or table ownership violation would appear — **without implementing product code in this phase**.

---

## 2. Review posture — adversarial, global optimum, evidence-seeking

Do not optimize for agreement with the current Conexus design.

The governing posture is:

> **Authority freezes execution, not inquiry.**

Current accepted Decisions are the baseline for bounded execution. They are **not the boundary of the solution space during architecture Discovery/Decision**.

Therefore:

- challenge accepted architecture when stronger evidence exposes a material flaw;
- do not preserve a choice because work has already been done;
- do not count sunk cost as architectural justification;
- search for the best-supported global solution, not merely the easiest continuation of the current design;
- distinguish `fact`, `inference`, `assumption` and `preference`;
- state the strongest argument against your own preferred design;
- actively search for hidden cycles, authority inversion, god modules, abstraction leakage, TOCTOU, duplicated truth and fake replaceability;
- if a materially superior alternative requires revisiting C-000..C-017 or 3C, raise a **Finding** instead of silently working around authority;
- do not reopen accepted ownership merely because a different naming style or layering style is aesthetically preferable.

### Complexity burden of proof

Every proposed interface, port, projection, context object, application service or dependency inversion must answer:

1. What current consumer, risk or failure class requires it?
2. Why is a simpler direct in-process call insufficient?
3. What coupling or machinery does it eliminate?
4. What implementation/maintenance cost does it add?
5. Can the design remain concrete rather than become a generic framework?
6. Can it safely be deferred until a second consumer or real failure appears?

If the current benefit is not material, prefer the simpler shape.

---

## 3. Mandatory authority reconstruction — do not trust this handoff as architecture truth

Before reviewing 3D, read `AGENTS.md` and follow its read order rigorously.

At minimum, reconstruct authority from:

```text
AGENTS.md
→ docs/DOCUMENTATION-MAP.md
→ docs/tracking/STATUS.md
→ docs/tracking/DECISIONS.md
→ docs/product/DEVELOPMENT-GOVERNANCE-METHOD.md
→ docs/product/CAPABILITY-REALIZATION-METHOD.md
→ docs/superpowers/specs/2026-08-07-layered-agent-execution-planning-design.md
→ docs/tracking/ARCHITECTURE-REALIZATION-REVIEW.md
→ docs/superpowers/specs/2026-08-08-risk-proportional-execution-governance-design.md
→ docs/superpowers/plans/2026-08-07-architecture-reconciliation-arr-program.md
→ current Conexus task-specific authority
```

For Conexus Phase 3, read the live ledger **early**:

```text
docs/conexus/phase3/LEDGER.md
```

Then reconstruct C-000..C-017 from:

```text
docs/conexus/DECISOES.md
```

and follow the detailed source documents referenced by that register when needed.

### Required 3C/3A inputs before any 3D conclusion

Read especially:

```text
docs/conexus/phase3/3C-R1-cross-review-closure.md
docs/conexus/phase3/3C-15-managed-application-runtime-boundary.md
docs/conexus/phase3/3C-12-application-runtime-profiles.md
docs/conexus/phase3/3C-08-capability-gateway-module-boundary.md
docs/conexus/phase3/3C-07-connections-module-boundary.md
docs/conexus/phase3/3C-10-production-agent-runtime-module-boundary.md
docs/conexus/phase3/3C-11-release-module-boundary.md
docs/conexus/phase3/3C-05-builder-module-boundary.md
docs/conexus/phase3/3A-R5-builder-coding-runtime-reassessment.md
```

Also inspect, at minimum, the boundaries whose dependency direction materially constrains the graph:

```text
docs/conexus/phase3/3C-01-modular-monolith.md
docs/conexus/phase3/3C-02-identity-access-module-boundary.md
docs/conexus/phase3/3C-03-workspace-module-boundary.md
docs/conexus/phase3/3C-04-project-module-boundary.md
docs/conexus/phase3/3C-06-artifact-registry-module-boundary.md
docs/conexus/phase3/3C-09-brain-module-boundary.md
docs/conexus/phase3/3C-13-observability-audit-module-boundary.md
docs/conexus/phase3/3C-14-attachments-storage-boundary.md
docs/conexus/phase3/3B-16-project-internal-resource-ownership.md
```

Read any additional authority/precedence those documents point to.

### Precedence

Use the repository's declared precedence, especially:

```text
C-000..C-017
→ foundational earlier authority

approved 3A / 3B / 3C docs
→ refinements/supersessions only where explicitly stated

3C-R1
→ final 3C reconciliation authority for naming/scope conflicts

phase3/LEDGER.md
→ live Phase-3 status/navigation authority
```

Conversation history is not authority.

---

## 4. Current phase boundary

Reconstruct this from the repository; do not accept this paragraph as authority by itself.

Expected current state is:

```text
3B — System Context & Boundaries    CLOSED / APPROVED
3C — Domain / Module Architecture   CLOSED / APPROVED
3D — Dependency Architecture        NEXT
```

Do not reopen 3C ownership without a material Finding.

Do not implement product code.
Do not merge.
Do not mark PR ready.
Do not begin 3E.

---

## 5. Problem 3D must solve

The core question is:

> **Which module may depend on which other module, through which narrow public capability / projection / immutable context, without circular imports, cross-module table access, duplicated authority, or a universal mediator?**

3C intentionally left several relationships conceptually bidirectional:

```text
Managed Application Runtime ↔ Release / Identity & Access / Capability Gateway
Capability Gateway ↔ Connections
Capability Gateway ↔ Builder
Capability Gateway ↔ Production Agent Runtime
Brain ↔ Artifact Registry / application orchestration
Release ↔ Registry / Connections / Brain during conformance
Project / Inception ↔ Builder engineering execution capability
```

The existence of two-way collaboration does **not** automatically mean two-way structural dependency.

Your job is to distinguish:

```text
collaboration graph
authority graph
code/import dependency graph
runtime call flow
data ownership graph
```

Do not collapse them into one diagram.

---

## 6. Application / Use-case Orchestration Layer — accepted concept, shape still open in 3D

3C-R1 approved the concept of an application/use-case orchestration layer in the modular monolith.

It may:

- coordinate cross-module use cases;
- order calls to independent domain owners;
- assemble narrow contexts;
- carry results from one owner to another.

It must not become:

```text
ApplicationLayerModule
authoritative domain state owner
workflow engine
universal mediator
command bus used for every internal call
event bus
service locator
policy engine
```

Review critically where application orchestration is actually necessary and where a direct module call is safer/simpler.

A key concern to test is whether flows of the form:

```text
A → B → A
```

should be coordinated by a named use-case service so that A and B do not import each other.

Do not assume that is always the best answer; falsify it.

---

## 7. Methodology to preserve

### YAGNI / minimal sufficient architecture

- modular monolith in the Hub;
- in-process calls remain in-process;
- simple direct calls stay simple when safe;
- no abstraction because a diagram looks cleaner;
- no generic `Port`, `Provider`, `Resolver`, `Context`, `Mediator` or `Registry` family unless a real consumer/failure class pays for it;
- no ceremonial hexagonal architecture for every module;
- no microservices, Kafka, service mesh, Temporal, generic workflow engine or universal event bus as a local dependency-cycle cure.

### Authority ≠ mechanics

Framework/runtime mechanisms may realize behavior without becoming product authority.

Examples already important in this architecture include:

```text
Mastra
E2B
Git
BlobStore/CAS
credential backend
MigrationRunner
queue/job substrate
```

Preserve replaceability where a replaceable physical substrate already exists, but do not build speculative provider frameworks.

### No cross-module table access

Sharing `hub_control` physically never grants semantic permission to read another module's private tables as a shortcut.

If a consumer needs a fact owned by another module, evaluate:

```text
public internal call
narrow read projection
immutable ref/snapshot/context
application orchestration
```

before any private-table dependency.

### Pinned fact versus mutable authority

Analyze carefully which facts can safely travel as exact immutable context and which must be revalidated by their owner close to execution.

A useful candidate rule to challenge is:

```text
versioned/pinned facts travel
mutable authority is revalidated
```

Examples that may be safe to pin include exact digests/revision refs. Examples that may require current revalidation include session/account revocation, approval validity, credential/grant state, effect budget and runtime conformance.

Do not turn this into a `UniversalAuthoritySnapshot` without a proven need.

---

## 8. External comparison is required — but external systems are evidence, not authority

Do not review Conexus only from internal consistency.

Compare the architecture against the strongest relevant evidence available now.

### A. Mitra — internal empirical evidence

The repository contains unusually valuable first-hand evidence from the Mitra immersion and maintenance probes.

Inspect the relevant material under:

```text
docs/reference/mitra/
docs/research/MITRA-INSPIRATION-MAP.md
```

and the Conexus decision documents that cite the Mitra observations.

Use Mitra especially to test properties such as:

- platform-managed runtime versus independently deployable software;
- restricted platform capabilities instead of raw credentials/power;
- artifact/build/registry/runtime separation;
- software-factory UX and agent continuity;
- what works well in a highly integrated platform;
- where Mitra's platform connection/runtime expressivity created ceilings;
- which safety guarantees were model behavior rather than mechanical invariants.

Do **not** copy Mitra internals that were not actually observed or evidenced.

### B. Factory.ai — public software-factory benchmark

Inspect both the internal research map and **current public primary Factory.ai documentation**.

Relevant repository material includes:

```text
docs/research/FACTORY-AI-HARNESS-REFERENCE-MAP.md
```

Compare properties such as:

- project/codebase boundary;
- Droid/coding runtime versus higher-level orchestration;
- specifications/planning versus execution;
- organization/project policy boundaries;
- fresh/independent validation where evidenced;
- how much machinery is exposed to the user versus kept inside the platform;
- context/handoff/review semantics;
- whether any observed pattern genuinely supports or challenges Conexus dependency direction.

Do not attribute private internal implementation details to Factory without evidence.

### C. Current primary-source deep research

Perform fresh research when the answer could materially improve 3D.

Prefer current primary sources and real implementations for architectural claims. Candidate comparison areas may include, where useful:

- modular monolith dependency design;
- TypeScript package/import-cycle enforcement;
- application-service/use-case coordination;
- Backstage plugin/service boundaries;
- Kubernetes authorization/admission separation;
- GitHub/GitLab organization/project/package boundaries;
- Harness scopes/connectors/pipeline boundaries;
- Mastra current runtime/workspace/tool boundaries;
- concrete open-source modular-monolith codebases with enforceable import boundaries.

Do not research merely to increase citation volume. Research must have decision value.

### Global-optimum rule

If Mitra, Factory, a strong open-source architecture or first-principles analysis reveals that an accepted Conexus shape is materially inferior, document the contradiction as a Finding and propose the governed Decision/Replan path.

Do not silently preserve Conexus just because it is ours.

---

## 9. Questions your independent review must answer before 3D-01 is approved

Produce an independent answer to all ten questions:

1. What conceptual dependency graph is implied by approved 3C today?
2. Which apparent cycles exist?
3. Which are real authority cycles versus merely bidirectional collaboration?
4. Which dependencies should be direct in-process module dependencies?
5. Which interactions should be coordinated by named application/use-case services?
6. Where do narrow ports/projections genuinely pay for themselves?
7. Where would an interface/port be overengineering?
8. Which facts should travel as immutable refs/snapshots/context instead of being re-read by the consumer — and which mutable authorities must be revalidated?
9. What should the decision order inside 3D be?
10. What exactly should 3D-01 decide?

Additionally answer:

11. Is a structurally acyclic module graph actually achievable without weakening the 3C ownership model?
12. Which proposed edge is the most likely future god-module/cycle source?
13. Where is application orchestration most justified, and where would using it become a mediator anti-pattern?
14. Which dependencies should be compile-time enforceable as package/import rules?
15. Are there any dependencies that should be represented as shared stable value types/opaque IDs rather than a module import?
16. What is the strongest argument that the likely 3D design is wrong?

---

## 10. Candidate hypothesis to attack — explicitly NON-AUTHORITATIVE

A prior independent pass produced the following **hypothesis**, not a Decision:

```text
- prefer direct one-way in-process module calls when narrow and stable;
- use named application/use-case orchestration when a cross-module operation would otherwise require A → B → A or make one module own another module's lifecycle;
- pass exact revision/digest/identity facts as narrow immutable context where safe;
- revalidate mutable authority at the owning boundary close to execution;
- let Gateway depend on several authoritative projections if that is its real job rather than hide them behind a generic policy mediator;
- keep Observability primarily downstream/sink-like;
- avoid reverse dependencies from Gateway into Builder/Agent internals by supplying caller execution context;
- avoid Connections → Gateway structural dependency for qualification by coordinating qualification in the application layer;
- avoid Release ↔ Managed Runtime structural cycles by coordinating served verification in the application layer;
- avoid Brain → Gateway structural dependency for AnalyticQuery/probes by coordinating semantic-plan → physical-execution → semantic-interpretation as a use case;
- avoid Project → Builder structural dependency for Inception by coordinating Project authority + Builder investigation from the application layer.
```

Your job is to **try to falsify this hypothesis**.

Do not give it extra weight because it appears in this file.

If a simpler or stronger model exists, propose it.

---

## 11. Expected review output

Do **not** edit approved 3C decision documents or the live `LEDGER.md` merely to express review opinion.

Create a separate independent review artifact on the same branch, suggested path:

```text
docs/conexus/phase3/3D-FABLE-R0-independent-dependency-review.md
```

The review should contain:

```text
Verdict
Authority reconstructed
Material Findings (if any)
Conceptual collaboration graph
Proposed structural/import DAG
Cycle analysis
Direct dependency matrix
Application-orchestration use cases
Narrow projections/contexts that are justified
Interfaces/ports explicitly rejected as overengineering
Pinned facts versus revalidated authority
External comparison: Mitra / Factory.ai / current research
Strongest counterargument / adversarial falsification
Recommended 3D decision sequence
Recommended scope of 3D-01
Open questions that truly require Operator Decision
```

### Finding severity

A material disagreement with accepted authority must identify whether it is equivalent to:

```text
CONTRACT_VIOLATION
DERIVED_REQUIREMENT
THREAT_MODEL_EXPANSION
FUTURE_HARDENING
or an architecture Discovery/Decision Finding requiring Replan
```

Do not call something a blocker merely because it is an alternative style.

---

## 12. Stopping rule

The review is ready when:

- the current authority chain can be reconstructed from the repository alone;
- the module collaboration graph and proposed import/DAG graph are explicitly distinguished;
- every apparent cycle has a disposition;
- no public interface/port exists only for ceremony;
- every application-layer use case has a named cross-module reason;
- table/internal bypasses are explicitly prohibited;
- external comparisons have decision value rather than decorative citation;
- the preferred architecture has been attacked by its strongest counterargument;
- any conflict with C-000..C-017 / 3C is surfaced as a Finding instead of silently rewritten;
- 3D-01 can be discussed with the Operator without leaving hidden architectural decisions to implementation.

Do not continue into implementation or 3E.
