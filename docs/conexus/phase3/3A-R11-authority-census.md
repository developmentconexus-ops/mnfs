# 3A-R11-A — Whole-Product Authority Census

**Status:** WORKING / R11-A  
**Authority:** traceability and reconciliation input only  
**NOT CURRENT PRODUCT AUTHORITY:** candidate dispositions in this file are not ratified current-state semantics  
**Parent:** [3A-R11 — Whole-Product Authority Rebaseline](3A-R11-whole-product-authority-rebaseline.md)  
**Activation:** [3A-R11 Operator Activation Record](3A-R11-activation.md)  
**Scope:** C-000..C-017 + accepted 3A..3L Package A  

---

## 1. Purpose and safety boundary

This census answers a narrower question than the final R11 current tree:

> **What material authority exists, which later accepted generation appears to govern the same meaning now, and where must R11-B deliberately reconcile partial/full supersession before a canonical current-state projection is written?**

This file is intentionally **not** a summary authority. It must not be used to implement product behavior or to bypass the detailed accepted semantic homes.

Rules:

1. `candidate disposition` is evidence for R11-B, not a ratified disposition;
2. later accepted authority wins only for the exact meaning it deliberately supersedes/refines;
3. an older invariant not contradicted by later authority remains a preservation candidate;
4. implementation, spike, CI, review or framework behavior is Evidence unless accepted authority explicitly adopts it;
5. `SELECTED`, `ARCHITECTURE CURRENT` and `QUALIFIED` are distinct states;
6. Unknown/Deferred remains Unknown/Deferred;
7. F1 YAGNI does not erase a justified future seam or reopen trigger;
8. no historical mechanism may re-enter the target merely because an old probe/document names it.

---

## 2. Corpus coverage

### 2.1 Foundational decisions

Reviewed from `docs/conexus/DECISOES.md` and their semantic homes:

```text
C-000..C-017 = LOCATED / INCLUDED
```

### 2.2 Phase 3 accepted authority

```text
3A-R5                              LOCATED / INCLUDED where runtime reconciliation matters
3A-R6                              LOCATED / INCLUDED
3A-R7                              LOCATED / INCLUDED
3A-R8                              LOCATED / INCLUDED
3A-R9                              LOCATED / INCLUDED
3A-R10                             LOCATED / INCLUDED
3A-R11                             APPROVED / ACTIVE parent checkpoint

3B-01..3B-15                      LOCATED in ../24-arquitetura-system-design.md
3B-16                             LOCATED in 3B-16-project-internal-resource-ownership.md
3B-17                             LOCATED in ../24-arquitetura-system-design.md

3C-01..3C-15 + 3C-R1             LOCATED / INCLUDED
3D-01..3D-04 + 3D-R1             LOCATED / INCLUDED
3E-01..3E-02 + 3E-R1             LOCATED / INCLUDED
3F-01..3F-06 + 3F-R1             LOCATED / INCLUDED
3G-01..3G-08 + 3G-R1             LOCATED / INCLUDED
3H-01..3H-03 + 3H-R1             LOCATED / INCLUDED
3I-01..3I-05 + 3I-R1             LOCATED / INCLUDED
3J-01..3J-03 + 3J-R1             LOCATED / INCLUDED
3K-01..3K-04 + 3K-R1             LOCATED / INCLUDED
3L-Q0                             LOCATED / INCLUDED
3L Package A + deciding Evidence  LOCATED / INCLUDED
```

Dialogue/review files remain provenance/Evidence unless their findings were ratified into the accepted authority above.

---

## 3. Current-generation map before detailed reconciliation

This section records **where R11-B must look for the latest accepted generation**, not a new semantic hierarchy.

| Meaning family | Latest accepted generation to reconcile against | Notes |
|---|---|---|
| Product vision / system objective | C-001 + 3A-R7 + 3K | 3A-R7 explicitly preserves C-001 as product vision authority. |
| Workspace / Project / Change boundary | 3B + 3C + 3G + 3K | Later phases add owner/state/UI detail without erasing 3B system boundaries. |
| Project Baseline / change engineering | 3B-05..08 + 3A-R8 + 3G | Baseline is living/spec-anchored and pinned per Change; not BDUF. |
| Builder runtime | 3A-R5 + 3H-01 + 3H-R1 + 3L-A | Mastra AgentController/CodingSession/Workspace/E2B current; E2B qualified with required physical-incarnation guard. |
| Product Agent runtime | 3C-10 + 3G-05 + 3H-02 + 3H-R1 + 3A-R10 | Exact RuntimeAgentProjection → direct Mastra Agent; Package B qualification still pending. |
| Runtime-role isolation | 3H-03 + 3H-R1 + 3A-R10 | BuilderMastra != ParMastra; same-process baseline is not yet Package-B-qualified. |
| Artifacts / Release / promotion | C-005 + 3C-06/11 + 3G-08 + 3K | Git authoring, immutable compiled revisions, Release composition, no `latest`. |
| Connections / external effects | C-007 + 3B-15 + 3C-07/08 + 3D-02 + 3G-06 + 3I | Workspace owns Connection; Project owns typed binding; Gateway owns effects/credentials/replay safety. |
| Brain | C-011 + 3B-15 + 3C-09 + 3A-R7 + 3A-R10 | Workspace knowledge and Project binding preserved; memory framework never Brain authority. |
| Data / PostgreSQL | C-006 + 3B-16 + 3E + 3J | PG17 architecture current; Hub truth vs Project DB vs CAS/serving remain distinct. |
| Security / credentials / spend | C-016 + 3I + 3J | Current security authority is decomposed by trust zone and owner; model credentials are control-side. |
| Observability / Evidence / F5 | C-013 + 3C-13 + 3H-03 + 3K-02 | Telemetry never authority; authoritative terminal/result ingress remains owner-held/write-once. |
| Frontend / scaffold / product shell | C-012 + 3K + 3A-R10 | React/TS/Vite/TanStack current; implementation-dependent scaffold probes remain downstream. |
| Published app / managed runtime | C-015 + 3B-14 + 3C-12/15 + 3J + 3K | Control Plane/Preview/Published App authority separation survives; exact old topology/role shape requires reconciliation. |
| Managed jobs | C-005/C-014 residues + 3A-R9 + 3C-15 + 3K-03 | First F1 consumer = governed managed sync; scheduler/queue are reconstructible mechanics; Package D qualifies. |
| Engineering/correctness model | C-017 + 3B-03/04/07 + 3G + 3A-R8 | Change/WU/ActorRun remain distinct; concrete Builder runtime is later authority. |
| Production topology / operations | C-015/C-016 residues + 3J-R1 | First-prod current topology is 3J; old local/Fly assumptions cannot control target. |
| Technology qualification | 3A-R6 + 3A-R10 + 3L-Q0 + Package A | Architecture selection is not deciding qualification. |

---

## 4. C-000..C-017 candidate disposition census

These dispositions are deliberately provisional until R11-B performs claim-level reconciliation.

| ID | Candidate disposition | What appears to survive | What appears superseded/refined | Current semantic homes to adjudicate |
|---|---|---|---|---|
| **C-000** | **PARTIALLY_SUPERSEDED** | Conexus is a new product; MNFS is reference/provenance rather than target product authority; selective reuse rather than inheritance. | The early statement that the product simply moves to its own repo after early topics is no longer the active cutover rule; F3B-R1 now owns canonical product repo/cutover before post-C-018 realization planning. | C-000, 3A-R6, 3A-R10, later F3B-R1 gate. |
| **C-001** | **CURRENT / PRESERVE** | AI-first enterprise platform vision over business systems; internal-first foundation with SaaS evolution; Harness/Brain/Product Agent/Application composition objective. | Concrete technology examples in the original vision are not selection authority. | C-001; 3A-R7 explicitly preserves it; 3K supplies current product surfaces. |
| **C-002** | **PARTIALLY_SUPERSEDED** | Sovereign Hub; Node/TS + Postgres control authority; narrow replaceable coding-runtime boundary; runtime identity distinct from model; mechanical human gates; fresh independent verification where material. | Pi as primary Builder realization; fresh worker as cognitive baseline for every unit; `pg-boss` as already-selected Hub queue; Mastra-outside-Hub premise; old auth/model realization assumptions. | 3A-R5, 3H-01/03/R1, 3I-02/03, 3A-R9/10, 3L-A/D. |
| **C-003** | **REFINED / PRESERVE REQUIREMENT INTENT** | Ratified product/F1 requirements and mechanical-gate/visual-plan/multi-role objectives remain traceability inputs; 3A-R7 found zero F1 orphan requirements at that checkpoint. | Requirement wording tied to old runtime/mechanism is interpreted through later owner/runtime decisions; requirements do not resurrect Pi/Mission/old topology. | C-003, 3A-R7/8/10, 3B–3K detailed authorities. |
| **C-004** | **SUPERSEDED** | Historical rationale/probes only. | Local Pi+SRT sandbox realization explicitly superseded by C-008. | C-008, 3A-R5, 3H-01, 3L-A. |
| **C-005** | **REFINED / CORE PRESERVED** | Git-first authoring; immutable compiled revisions; SHA/digest identity; typed kinds/executors; real DB privilege separation; validated schemas/binds; Release/deployment composition; fail-closed compilation; no registration API as semantic owner. | Kind set and contracts expanded by later decisions; exact deployment/promotion/state mechanics and owner boundaries were redefined by 3C/3E/3F/3G; `job/v1` narrowed to managed sync first consumer. | 3C-06/11/15, 3D, 3E, 3F, 3G-08, 3A-R9. |
| **C-006** | **REFINED / CORE PRESERVED** | PostgreSQL 17 class; `hub_control` vs Project business DB separation; Project/environment database isolation; real roles; deterministic validation databases; migration/restore/drift correctness. | Early local/QA/cloud placement and exact backup/topology prescriptions are not first-production authority; 3E/3J own current physical/data boundaries. | 3B-16, 3E, 3J, 3A-R10, 3L-Q0/A. |
| **C-007** | **REFINED / CORE PRESERVED** | Narrow declarative connector contract; Workspace Connection; pinning/qualification; credential indirection; explicit environment; fail-closed unknown effects; no free-form hook/runtime without consumer. | Credential custody, trusted crossings, replay safety and effective operation authority are now owned more precisely by Gateway/3I; any old direct secret/runtime implication yields to current trust-zone rules. | 3B-15, 3C-07/08, 3D-02, 3G-06, 3I. |
| **C-008** | **PARTIALLY_SUPERSEDED / QUALIFIED SUBSTRATE** | E2B as Builder execution substrate; full-machine agency; durable business secrets not readable by guest; Hub-mediated Git/custody; governed egress; BuildValidationDatabase distinction; E2B must be qualified, not assumed. | Pi worker realization is gone; guest-readable model-provider key/capability is removed by 3I-02; stock write retry across physical E2B incarnation is invalid and requires the qualified narrow guard; old runtime timing/topology is not target authority by itself. | 3A-R5, 3H-01, 3I-02, 3L-A. |
| **C-009** | **PRESERVE AS EVIDENCE/RATIONALE** | Mechanical invariants beat model goodwill; maintenance corrected by failure class; orphan/lineage detection; live credential state; governed egress; unknown must remain honest. | Mitra-specific observations and session limits are evidence, not current Conexus realization contracts. | C-009 as research evidence; later concrete authority in C-005/007/013/016 and 3C–3I. |
| **C-010** | **PARTIALLY_SUPERSEDED** | Product Agent as git-first `agent` artifact; immutable revision/projection; Conversation/AgentRun/ApprovalRequest meanings; constrained tool projection; Gateway-owned effects; exact approval binding; budgets; model identity/pinning and truthful receipts. | Vercel AI SDK light-loop + `ModelProviderAdapter` as current runtime; “no agent framework / Mastra rejected” premise; old HITL implementation mechanics where later 3F/3G/3H are more specific. | 3C-10, 3F-03, 3G-05/06, 3H-02/R1, 3I-03, 3A-R10; Package B/C. |
| **C-011** | **REFINED / CORE PRESERVED** | Git-first Workspace Brain; semantic/knowledge/evidence separation; immutable BrainPack + ProjectBrainBinding; pinning/provenance; update != promotion; explicit override/refinement; health/drift honesty; controlled analytic read regime; human-gated feedback. | Exact v0 DSL/framework/mechanism choices are subordinate to later module/contracts and implementation-dependent slice proofs; platform assistant knowledge is explicitly not Workspace Brain. | 3B-15, 3C-09, 3A-R7/10; downstream Brain probes. |
| **C-012** | **REFINED / CORE PRESERVED** | Reproducible scaffold; infrastructure-rich/feature-poor template; generated/platform-contract/app-owned separation; React+TS+Vite/TanStack family; honest UI; Hub-controlled codegen/contracts; frontend auth is presentation only; downstream scaffold conformance required. | Many exact scaffold/library/security serving mechanisms are implementation-slice obligations, not proof already obtained in 3L; later 3K owns current product-shell/navigation semantics. | 3K-01..04/R1, 3A-R10 downstream probe map. |
| **C-013** | **REFINED / CORE PRESERVED** | Structured causal observations; telemetry never authorization/acceptance authority; trust/provenance; unknown != zero; admission/attempt honesty; `OUTCOME_UNKNOWN` no blind replay; result/evidence ladder; durable domain facts outside telemetry GC. | Pi-specific telemetry adapter and old five-layer wording are historical realization details; authoritative F5/result ingress is now explicitly distinct from telemetry and owner-held in 3H/3K. | 3C-13, 3E, 3H-03/R1, 3K-02, Package E. |
| **C-014** | **REFINED / CORE PRESERVED** | Immutable ReleaseManifest/composition; active serving pointer; no schema/artifact/config change outside governed Release path; candidate/promotion distinction; environment conformance; no `latest`; rollback as new governed promotion; served verification. | Exact early environment/topology/queue and some lifecycle labels are superseded by 3G/3J; managed-job scheduling is now 3A-R9; implementation-dependent release probes remain downstream. | 3C-11, 3G-08, 3J, 3K, 3A-R9/10. |
| **C-015** | **PARTIALLY_SUPERSEDED** | One Account identity; server-side authorization; opaque session/no browser bearer; Published App authority distinct from builder/control authority; fail-closed permissions; resource derived server-side; authenticated blob access/provenance; no automatic production authority from Project role. | `ProjectMembership` as both Project/app access was explicitly split by 3B-14; old `{admin,member}` and local/loopback serving assumptions require reconciliation against later I&A/product runtime/3J; physical first-prod topology is superseded by 3J. | 3B-10..14, 3C-02/12/15, 3I, 3J, 3K. |
| **C-016** | **REFINED / CORE PRESERVED** | Fail-closed security posture; dependency admission/supply-chain control; no secret to model/browser/guest; Gateway-only external effects; exact-origin egress; sanitized errors; durable high-risk counters; explicit LGPD/data-minimization obligations; no generic policy/security machinery without consumer. | Exact early implementation details and trust topology are decomposed/replaced by 3I/3J; model credential handling specifically follows 3I-02/03; later qualification must prove provider/runtime controls. | 3I-01..05/R1, 3J, Package C/E and downstream security probes. |
| **C-017** | **REFINED / CORE PRESERVED** | Builder work graph `Workspace/Project → Change → WorkUnit → ActorRun`; correctness/assertions before decomposition; contract/policy digests; Findings durable and not self-closed by worker; proportional rigor; explicit current authority; serial baseline; fresh verifier when material; no Mission/Milestone/workflow engine F1. | Pi-specific Builder/validator runtime; any fresh-runtime assumption conflicting with persistent Change-scoped CodingSession; exact retry/runtime mechanics now governed by 3G/3H/3I and qualification. | 3B-03/04/07, 3A-R8, 3G-02/03/04, 3H-01, 3I-03, 3L-A. |

---

## 5. 3B System Context & Boundaries census

All 3B decisions remain **APPROVED** system-context authority unless a more specific later phase deliberately refines their implementation/detail. No material 3B reopen is known at R11-A.

| ID/family | Current load-bearing meaning for reconciliation | Later specificity |
|---|---|---|
| 3B-01 | Workspace is sovereign isolation root; common Account never implies cross-Workspace access. | 3C Workspace/I&A; 3I trust/current auth. |
| 3B-02 | Project is independent software/product lifecycle unit inside Workspace. | 3C Project; 3G Project lifecycle; 3K Project shell. |
| 3B-03 | Change is bounded/verifiable evolution; COR truth != WorkUnit != ActorRun. | 3A-R8; 3G Builder state; 3H runtime. |
| 3B-04 | Builder strategy replaceable by isolation; no generic workflow/graph DSL F1. | 3C Builder; 3H; 3L. |
| 3B-05/06 | Greenfield/brownfield Inception produces Project Baseline candidate; human approval establishes “what we build”. | 3A-R8 living/incremental Baseline. |
| 3B-07 | Planning depth and execution rigor are independent/proportional; uncertainty never lowers rigor. | 3G-04 and C-017. |
| 3B-08 | Baseline readable content in Project Git; Hub pins approved revision/digest. | 3A-R8 ProjectBaselineDigest. |
| 3B-09 | One canonical source repo per Project F1; multi-repo deferred. | F3B-R1 later owns canonical product repo/cutover for Conexus itself. |
| 3B-10..13 | Limited explicit ReBAC/roles/permissions/policies for Control Plane; deny-by-absence; org role != Project authority. | 3C-02 and 3I-01 provide detailed current authorization semantics. |
| 3B-14 | One Account identity, but CONTROL_PLANE / PREVIEW / PUBLISHED_APP authorization contexts are independent; administer != use. | 3C/3I/3J current realization. |
| 3B-15 | Workspace owns Brain/Connections; Project owns typed explicit same-Workspace bindings; credentials remain Hub/Vault/Gateway custody; no generic resource-binding engine. | 3C-07/08/09, 3D-02, 3I. |
| 3B-16 | Git authoring, Hub operational authority, Project DB business data and Registry/CAS serving output are distinct; DEV/PROD persistent when present; validation DB conditional/ephemeral. | 3E and 3J. |
| 3B-17 | Projects isolated by default; reuse only through explicit Platform/Brain/Connections seams; no direct cross-Project mutable access; small duplication preferred to premature abstraction. | 3C/3D/3E. |

3B cross-review precedence already records two important laws:

- legacy MNFS Plan schema reuse means validation/revision/digest/render/dependency/proof patterns retyped to Change/WorkUnit; it does **not** resurrect Mission/Milestone/Feature in F1;
- the old C-015 published-app role set must be reconciled through current later I&A/runtime authority rather than inferred from illustrative 3B examples.

---

## 6. Phase-family census: accepted current semantic homes

### 6.1 3A — cross-phase reconciliation

```text
3A-R5   Builder realization reassessment
3A-R6   critical path / implementation-readiness routing
3A-R7   platform assistant ownership gap closure
3A-R8   Project Baseline / Change engineering coherence
3A-R9   managed-job deterministic sync reconciliation
3A-R10  pre-implementation convergence + technology qualification routing
3A-R11  ACTIVE whole-product authority rebaseline
```

Candidate R11 treatment: **CURRENT routing/reconciliation authority**, each limited to its exact scope.

### 6.2 3C — module ownership

Current owner set:

```text
Identity & Access
Workspace
Project
Builder
Artifact Registry
Connections
Capability Gateway
Brain
Production Agent Runtime
Release
Observability & Audit
Attachments & Blob
Managed Application Runtime
```

Key law: owner/module distinctions are semantic boundaries, not mandated separate services/databases/processes.

### 6.3 3D — dependency architecture

Current laws:

```text
modular monolith
typed/direct-call-first module ports
no cross-module table/internal access
Gateway sole external-effect/credential boundary
runtime cannot become authority by calling internals
PAR receives exact Release/artifact projection
MAR receives exact active Release composition
```

### 6.4 3E — data architecture

Current laws:

```text
hub_control/PostgreSQL = authoritative Hub operational truth
module-owned logical schemas
Project business database != hub_control
immutable history append-only where required
no plaintext secrets
telemetry/logs != authority
Mastra Builder store != Mastra PAR store
```

Exact physical schema/migrations remain realization work; current semantic meaning is fixed.

### 6.5 3F — contracts/API architecture

Current laws:

```text
mechanism != authority
INTERNAL vs INDEPENDENT contract surfaces
owner-specific payloads; no UniversalEnvelope
exact approval subject / single claim
concrete typed Project bindings
stable public failure semantics only where boundary requires
ReleaseManifest composition root
```

### 6.6 3G — behavioral/state architecture

Current state authorities remain owner-local:

```text
ApprovalRequest
Builder Change / Finding
Builder WorkUnit / ActorRun
PlanningDepth / Rigor
Production AgentRun / AgentTrigger
Gateway EffectAttempt / idempotency / budget
Project lifecycle / binding intent
Release / Promotion / active pointer
```

No unification of these lifecycle/state machines is admitted.

### 6.7 3H — runtime/agent architecture

Current architecture:

```text
Builder:
  Change-scoped persistent CodingSession
  → stored Mastra thread
  → ephemeral AgentController live Session incarnations
  → current write-capable Workspace/E2B lineage

Product Agent:
  exact RuntimeAgentProjection
  → direct Mastra Agent

BuilderMastra != ParMastra
Conexus durable owner truth != Mastra runtime state
```

Same-process runtime-role isolation remains an architectural baseline but requires Package B deciding Evidence.

### 6.8 3I — security/authority architecture

Current laws:

```text
current authority rechecked at sensitive action time
approval cannot widen exact claim
credentials control-side
model calls control-side
model attempt intercepted before provider call
Gateway owns external-effect safety
OUTCOME_UNKNOWN never free retry
five trust zones
Hub/Postgres security truth
```

### 6.9 3J — deployment/operations architecture

Current first-production architecture:

```text
US-local production compute
public ingress only Hub/Web
Builder / ProductAgent / ManagedApplication worker classes
PostgreSQL off compute box with HA posture
Hub restartable/stateless where possible
multitenant first-production default
DEDICATED physical deployment deferred until real consumer
recovery bound to owner/F5 truth, not blind replay
```

### 6.10 3K — frontend/product architecture

Current product surfaces include:

```text
Project list + Project shell
Data / Functions / Applications / Agents / Connections / Brain
Builds / Releases / Changes
Build workspace with plan/WU/diff/findings/runtime/evidence
one Terminal surface
current truth vs decision vs observable distinction
Product Agent authoring/management/use journey
manual Product Agent through PAR
manual+scheduled managed jobs through MAR
```

Provider/framework jargon remains hidden by default from normal product UX.

### 6.11 3L — technology qualification

```text
Q0 = COMPLETE
Package A = COMPLETE
  A1 Mastra/Postgres persistence = PASS
  A2 E2B = PASS WITH REQUIRED PHYSICAL-INCARNATION GUARD
  A3 native Codex OAuth = PASS
  Builder OM = EVALUATED / NOT_PROVEN FOR ENABLEMENT / KEEP OFF

Package B = PAUSED / NOT OPENED by R11
Packages C–E = NOT STARTED
```

R11 must not relabel unexecuted Package B–E assumptions as qualified.

---

## 7. Highest-risk supersession hotspots for R11-B

R11-B must adjudicate these at claim level before any current tree is canonicalized.

### H1 — Builder cognitive/runtime generation

```text
C-002/C-017: Pi / fresh-worker realization
vs
3A-R5 + 3H-01 + 3L-A: persistent Change-scoped Mastra CodingSession
```

Expected direction: preserve Hub authority, WorkUnit/ActorRun boundedness and fresh independent verification; supersede Pi/fresh-cognitive-reset realization.

### H2 — Builder model credential custody

```text
C-008: guest-readable ephemeral model-provider capability
vs
3I-02: model-provider credential is control-side and never guest
```

Expected direction: exact guest provider credential realization is superseded; generic bounded capability principle may survive for non-model sandbox services only where current authority admits it.

### H3 — Product Agent runtime

```text
C-010: Vercel AI SDK light loop / no agent framework
vs
3H-02: exact RuntimeAgentProjection → direct Mastra Agent
```

Expected direction: Product Agent semantic model survives; concrete runtime realization is superseded.

### H4 — Queue/scheduler authority

```text
C-002: pg-boss selected in Hub
vs
3A-R9: scheduler/queue are reconstructible mechanics
vs
3L Package D: exact technology still to qualify
```

Expected direction: pg-boss cannot appear in current baseline as qualified/permanent architecture before Package D.

### H5 — Published app authorization and runtime topology

```text
C-015 ProjectMembership / local serving assumptions
vs
3B-14 independent surface authorization
vs
3C/3I current authorization ownership
vs
3J first-production topology
```

Need deliberate split between preserved identity/session/security invariants and superseded role/topology mechanism.

### H6 — Observability vs authoritative result truth

```text
C-013 event/telemetry evidence language
vs
3H-03 / 3K-02 F5 owner-held authoritative ingress
```

Current projection must never imply telemetry/log/event observation can establish terminal owner truth.

### H7 — Brain vs runtime memory

```text
C-011 Workspace Brain
vs
Mastra memory / OM mechanics
```

No memory framework can become Brain authority. Builder OM remains OFF after A3; Product Agent optional memory remains consumer/eval-gated.

### H8 — Future capability preservation vs dormant machinery

The source corpus names many future seams (DEDICATED, cross-Workspace exchange, richer memory, multi-repo, RAG, public/embed, SSO/SCIM, pools/failover, etc.). R11 must preserve evidenced triggers without carrying dormant F1 modules/tables/services/frameworks.

---

## 8. Known Unknown/Deferred classes that must remain visible

This census does not close these:

```text
Package B Product Agent + cross-runtime qualification
Package C model economics/enforcement qualification
Package D managed execution qualification
Package E deciding-evidence qualification
3M failure/recovery sufficiency
3N independent global architecture verification
3O vertical proof contract
C-018
F3B-R1 canonical product repo/cutover
post-C-018 derived implementation realization plans
implementation-dependent Brain/Scaffold/Observability/Publication/Release/Security probes
DEDICATED physical deployment until real consumer
multi-repo Project support until real consumer
cross-Workspace sharing/exchange until real consumer
Product Agent extra memory/semantic recall/extractors until eval/consumer
```

Unknown/Deferred never means “pick a plausible implementation now”.

---

## 9. R11-A completeness verdict

### Corpus presence

```text
C-000..C-017                          COVERED
3A accepted reconciliation set       COVERED
3B-01..3B-17                         COVERED
3C–3K accepted closure families      COVERED
3L-Q0 + Package A deciding outcome   COVERED
```

### Remaining work before R11-A can be considered complete

The corpus is located and family-level meaning is mapped. Before R11-B canonical disposition, perform a targeted claim-level check of the high-risk hotspots H1–H8 against their exact detailed semantic homes. This is **reconciliation depth**, not missing corpus discovery.

No material contradiction has yet been classified as `REOPEN`. If claim-level reconciliation finds two simultaneously accepted authorities that cannot be reconciled by scoped supersession/specificity, R11 must STOP and reopen only that smallest implicated Decision Loop.

---

## 10. Exact next action

```text
R11-A targeted claim-level hotspot verification H1–H8
→ completeness check
→ R11-B Decision Reconciliation
```

Do not create the final `docs/conexus/current/*` tree until R11-B dispositions are explicit enough that the current Product Contract and Architecture Baseline cannot silently inherit stale mechanisms.
