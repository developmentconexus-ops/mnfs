# Conexus — Decision Reconciliation Registry

> **Status:** CANDIDATE / R11-B — NOT YET CURRENT AUTHORITY  
> **Parent checkpoint:** `3A-R11 — Whole-Product Authority Rebaseline`  
> **Method:** DevelopmentConexus Engineering Method v1.0.0  
> **Implementation:** BLOCKED  
> **Package B:** PAUSED / NOT OPENED  

This candidate exists to answer one question:

> **Which generation of a Conexus decision is current, where does its detailed semantic meaning live, what older mechanism must not be implemented by inheritance, what survives from the older decision, and what remains genuinely deferred/open?**

Until R11 passes whole-product coherence, independent Fable review, finding adjudication and final operator ratification, this file is a **candidate reconciliation projection**, not a replacement for accepted detailed authority.

---

# 1. Role and non-role

This registry owns only **decision-generation reconciliation/routing** once ratified.

It does not:

- replace detailed semantic authority in C-/3A–3K documents;
- create new Product semantics by summarization;
- make a technology qualified because architecture selected it;
- make historical Evidence disappear;
- authorize implementation, C-018 or merge;
- convert a Future seam into dormant F1 machinery.

If this registry conflicts with an accepted detailed semantic home, **the registry is defective and must be corrected** unless a material Finding explicitly reopens that authority.

Absence from this registry is never permission to contradict accepted authority.

---

# 2. Disposition vocabulary

```text
CURRENT
  Current meaning is directly accepted and remains valid.

PRESERVE
  Earlier decision remains coherent and has no material current counterexample.

REFINED
  Essential meaning/invariant survives but later authority sharpened owner, boundary,
  state semantics or realization.

PARTIALLY_SUPERSEDED
  Identified parts survive and identified parts must not be inherited.

SUPERSEDED
  Current accepted authority replaced the old target meaning/realization.

DEFERRED
  Real future capability/decision with explicit seam/trigger; no dormant F1 machinery.

REJECTED_F1
  Deliberately not part of F1; historical existence is not a reopen trigger.

REOPEN
  Material current Evidence falsified or made accepted authority incomplete;
  return to the smallest implicated Decision Loop.
```

A single source decision may be `PARTIALLY_SUPERSEDED` because a mechanism changed while its invariant survived.

---

# 3. Current authority-generation routing

For a current Product/architecture question, route by scope:

```text
Product vision / objectives
→ C-001 + accepted product-facing 3K authority

System context / boundaries
→ 3B-01..3B-17

Module ownership
→ 3C-01..3C-15 + 3C-R1

Dependencies / orchestration
→ 3D-01..3D-04 + 3D-R1

Data ownership / durable meaning
→ 3E-01..3E-02 + 3E-R1

Contracts / API semantics
→ 3F-01..3F-06 + 3F-R1

Behavioral / state semantics
→ 3G-01..3G-08 + 3G-R1

Builder/Product Agent runtime realization
→ 3A-R5 + 3H-01..03 + 3H-R1

Security / authorization / credential / spend / trust
→ 3I-01..05 + 3I-R1

First-installation deployment / operations
→ 3J-01..03 + 3J-R1

Frontend / Product surfaces / truthful presentation
→ 3K-01..04 + 3K-R1

Technology selection-vs-proof routing
→ 3A-R6 + 3A-R8 + 3A-R9 + 3A-R10 + 3L-Q0

Completed Builder substrate deciding Evidence
→ 3L-A

Whole-product current-generation reconciliation
→ 3A-R11 once finally ratified
```

More specific later accepted authority controls only its exact scope. Recency alone is not authority.

---

# 4. Cross-cutting current laws

The following laws are repeatedly preserved across the accepted corpus and must not be silently re-decided by realization convenience:

```text
one semantic authority per meaning
mechanism != authority
Workspace = sovereign isolation root
Project = independent software/product lifecycle unit
Change != WorkUnit != ActorRun
Builder ActorRun != Product AgentRun != Gateway EffectAttempt != Promotion
Git authoring/content != Hub operational authority != Project business DB != Registry/CAS serving output
Workspace owns Brain/Connection; Project owns explicit typed binding
same Workspace membership != resource-use authority
same bytes/digest != same authorization authority
Control Plane != Preview != Published App authorization
administer != use
current authorization is server-derived and rechecked at protected control points
runtime/provider/trace/telemetry identity != Conexus principal/owner truth
Gateway = sole external-effect/credential last-mile/replay authority
approval binds one exact sealed subject and never widens it
unknown/missing/partial != zero/success
OUTCOME_UNKNOWN never grants blind automatic replay
Release/composition is immutable and never resolved by `latest`
AVAILABLE != PROMOTED != SERVED_VERIFIED
telemetry/observation != F5/terminal owner truth
Brain != agent/runtime memory
future capability preserves seam/trigger without dormant machinery
technology selected != technology qualified
review finding != requirement authority
```

---

# 5. Foundational decision dispositions — C-000..C-017

## C-000 — Conexus as new product / relationship to MNFS

**Disposition:** `PARTIALLY_SUPERSEDED`

### Survives

- Conexus is a new product rather than MNFS M2 continuation.
- MNFS is reference/provenance for selected patterns, not target-product authority by inheritance.
- Reuse is selective and meaning-preserving; old governance/runtime machinery does not transfer automatically.

### Superseded/refined

The early repo-timing statement is not current cutover authority.

Current program law:

```text
3L–3O complete
→ C-018
→ F3B-R1 canonical product repo/cutover gate
→ post-C-018 derived Realization Planning
→ accepted executable plan(s)
→ implementation
```

### Do not resurrect

- MNFS Mission/Milestone/lease/governance architecture merely because it existed;
- early “move repo after topics 3+4” timing as current execution authorization.

**Current homes:** C-000; 3A-R6; 3A-R10; future F3B-R1.

---

## C-001 — Product vision

**Disposition:** `CURRENT / PRESERVE`

Current product vision remains:

- unified AI-first enterprise platform over ERPs/business systems;
- Conexus Harness/Builder as governed software-engineering capability;
- Brain as reusable enterprise knowledge/semantic capability;
- applications and Product Agents as first-class product outputs/capabilities;
- internal/company-first proof with future SaaS evolution;
- first vertical anchored in the Budget Analyzer unless operator redirects.

3A-R7 explicitly preserves C-001 as product vision authority.

Technology examples inside old vision text are not technology-selection authority.

**Current homes:** C-001; 3A-R7; 3K.

---

## C-002 — Sovereign Hub + original Pi runtime

**Disposition:** `PARTIALLY_SUPERSEDED`

### Preserved

```text
sovereign Hub authority
Node/TypeScript + PostgreSQL control-plane direction
narrow CodingWorkerRuntime replaceability boundary
runtime identity != model identity
mechanical human gates
current authority supplied by Hub
fresh independent verification when material
```

### Superseded

```text
Pi = primary F1 Builder runtime
fresh cognitive reset per WorkUnit/ActorRun
Mastra outside Builder baseline
pg-boss = already-selected permanent queue authority
old model/auth realization assumptions
```

Current Builder line:

```text
Builder
→ CodingWorkerRuntime boundary
→ Mastra AgentController
→ Change-scoped persistent CodingSession
→ Mastra Workspace
→ E2B
```

Queue/schedule technology remains Package-D qualification, not an architectural owner.

**Current homes:** 3A-R5; 3H-01/03/R1; 3I-02/03; 3A-R9/10; 3L.

---

## C-003 — Ratified Product/F1 requirements

**Disposition:** `REFINED / REQUIREMENT INTENT PRESERVED`

C-003 remains a requirement/traceability source. Later architecture owns how those requirements are realized.

Current rules:

- mechanism-specific wording is read through later accepted owner/runtime decisions;
- a requirement cannot resurrect Pi, Mission/Milestone, old topology or another superseded mechanism;
- pre-3K coherence found `C-003 F1 orphan requirements = 0` after 3A-R7 closure;
- future Product Contract must preserve the actual user/product obligations, not every historical implementation phrase.

**Current homes:** C-003; 3A-R7/8/10; exact 3B–3K owner authorities.

---

## C-004 — Local Pi/SRT sandbox

**Disposition:** `SUPERSEDED`

Historical probe/rationale only.

Explicitly superseded by C-008 and later Builder runtime authority.

**Current homes:** C-008; 3A-R5; 3H-01; 3L-A.

---

## C-005 — Artifact Registry / compiled executable artifacts

**Disposition:** `REFINED / CORE PRESERVED`

### Preserved

- git-first authoring;
- immutable compiled revision identity/digest;
- registry is compiled/served revision authority, not mutable authoring;
- typed artifact kinds and executor semantics;
- validated input/output contracts and real SQL binds/roles;
- Release/deployment composition must be exact and fail closed;
- active serving is selected by governed pointer/composition, never mutable source/latest.

### Refined

- artifact kinds were extended by later product decisions (`agent`, `brain`, etc.);
- exact owner boundaries are now 3C/3D;
- data/durable records are 3E;
- contract/error semantics are 3F;
- Release/Promotion behavior is 3G;
- `job/v1` first F1 consumer is narrowed by 3A-R9 to governed managed sync.

### Do not resurrect

A universal registry/business owner or generic execution envelope that erases kind/owner semantics.

**Current homes:** 3C-06/11/15; 3D; 3E; 3F; 3G-08; 3A-R9.

---

## C-006 — PostgreSQL/data baseline

**Disposition:** `REFINED / CORE PRESERVED`

### Preserved

```text
PostgreSQL major 17 architecture baseline
hub_control != Project business database
real least-privilege roles
Project/environment data isolation
clean validation DB when proof requires it
migration reproducibility/drift correctness
honest backup/restore proof
```

### Refined

- 3B-16 separates authoring/control/business-data/serving responsibilities;
- 3E owns current durable-record/data semantics;
- 3J owns first-installation placement/backup/restore operations;
- exact current PG17 minor is qualification/realization pin, not product semantics.

### Do not resurrect

- permanent TEST DB per Project;
- DB-per-gate/temp DB for every Change;
- PG18 migration merely because newer;
- Project DB as Hub/control authority.

**Current homes:** 3B-16; 3E; 3J; 3L-Q0.

---

## C-007 — External integrations / connector model

**Disposition:** `REFINED / CORE PRESERVED`

### Preserved

- narrow declarative connector contract;
- native/provider-specific semantics where needed rather than fake universal model;
- Workspace Connection identity/lifecycle;
- explicit qualification/environment/revision;
- credential indirection and write-only secret administration;
- fail-closed unknown/ambiguous effects;
- no arbitrary hook runtime without real provider consumer.

### Refined

```text
Workspace owns Connection
Project owns ProjectConnectionBinding
Gateway owns execution/effects/credential last-mile
CredentialBackend owns opaque secret mechanics
3I owns current custody/trust/security laws
```

**Current homes:** 3B-15; 3C-07/08; 3D-02; 3G-06; 3I.

---

## C-008 — E2B Builder sandbox

**Disposition:** `PARTIALLY_SUPERSEDED / SUBSTRATE QUALIFIED WITH GUARD`

### Preserved/current

- E2B is selected Builder execution substrate;
- full-machine agency is intentional;
- durable ERP/Vault/Git/Hub credentials never enter guest;
- Hub-mediated remote Git/result custody;
- governed external network boundary;
- BuildValidationDatabase is not the Project DEV authority;
- E2B behavior must be proven, not assumed.

### Superseded

```text
Pi worker realization
old guest-readable LLM provider key
historical hard session cutoff as architecture
stock E2B write retry across unobserved physical recreation
```

### Qualification outcome

Package A proved E2B candidate with one mandatory correction:

> write execution must be bound to the observed physical sandbox incarnation; if that incarnation dies, no silent write replay on a replacement physical sandbox is admissible.

Current result:

```text
E2B = QUALIFIED WITH REQUIRED PHYSICAL-INCARNATION GUARD
```

**Current homes:** 3A-R5; 3H-01; 3I-02; 3L-A.

---

## C-009 — Mitra maintenance probe

**Disposition:** `PRESERVE AS RATIONALE/EVIDENCE`

Preserved architectural lessons include:

- platform floor is the worst mechanically allowed behavior, not the model's best voluntary behavior;
- correctness must be enforced by class, not prompt goodwill;
- content/proof matters more than merely checking the channel;
- orphan/unused writer-reader relationships are useful guarantee-break detectors;
- real Connections require live credential state + governed egress;
- Unknown must remain honest;
- a smart agent discovering/fixing a flaw does not remove the need for a mechanical invariant.

Mitra-specific tool/session behavior is Evidence, not Conexus target realization.

---

## C-010 — First-class Product Agent

**Disposition:** `PARTIALLY_SUPERSEDED`

### Preserved

```text
Product Agent = git-first Project artifact
immutable agent revision/projection
Conversation
AgentRun
ApprovalRequest
constrained ToolProjection/capability surface
Gateway-owned effect execution/replay safety
exact approval subject
model/budget/pin truth
mechanical HITL semantics
```

### Superseded realization

```text
Vercel AI SDK light loop as current Product Agent runtime
ModelProviderAdapter as current primary runtime boundary
“Mastra rejected as agent foundation”
framework-specific old continuation mechanics
```

Current realization:

```text
exact Release
→ exact RuntimeAgentProjection
→ direct Mastra Agent
```

Stored Agent/Editor/latest are not Product authority. Universal Workflow and `createDurableAgent()` are not baseline.

**Current homes:** 3C-10; 3F-03; 3G-05/06; 3H-02/R1; 3I-03; 3A-R10; Package B/C.

---

## C-011 — Brain

**Disposition:** `REFINED / CORE PRESERVED`

Current preserved meaning:

```text
Workspace-scoped canonical Brain
SEMANTIC | KNOWLEDGE | EVIDENCE classes
Git published source
Registry immutable revision/payload
Brain semantic authority
ProjectBrainBinding explicit/pinned
publish != Project adoption/promotion
human-governed KnowledgeProposal
health/conformance honesty
analytic semantic query regime
```

Critical refinements:

- `BrainRevision` is semantic view of exact `ArtifactRevision(kind=brain)`, not duplicate revision authority;
- Brain meaning != physical implementation;
- Brain != RAG/index;
- Brain != agent memory;
- Builder/platform-assistant knowledge does not become Workspace Brain automatically;
- implementation-dependent Brain discovery/feedback/v0 probes remain downstream.

**Current homes:** 3B-15; 3C-09; 3A-R7/10; downstream Brain probes.

---

## C-012 — Scaffold + frontend paved road

**Disposition:** `REFINED / CORE PRESERVED`

### Preserved

- reproducible/versioned scaffold;
- rich infrastructure, poor in Product features;
- Generated vs Platform-Contract vs App-Owned distinction;
- React + TypeScript + Vite + TanStack paved road;
- Hub-owned/generated contracts and fail-closed output shapes;
- honest UI (`unknown != zero`, partial/coverage/provenance explicit);
- frontend permission/display is not authorization authority;
- platform security-critical scaffold surfaces cannot be silently bypassed;
- first-build scaffold conformance is mandatory.

### Refined

3K owns current Product shell/navigation/Build/Agent/Application surfaces. Many exact scaffold packages/CSP/codegen/serving checks remain implementation-dependent first-build proof, not already-qualified 3L substrate facts.

**Current homes:** 3K; 3A-R10 downstream proof map.

---

## C-013 — Observability / evidence plumbing

**Disposition:** `REFINED / CORE PRESERVED`

### Preserved

- structured causal observations;
- producer provenance/trust;
- telemetry never authorization/acceptance authority;
- missing usage/evidence never becomes zero/PASS;
- `OUTCOME_UNKNOWN` has no blind automatic retry;
- domain facts/ledgers survive telemetry GC;
- verification must bind Evidence/provenance rather than model narration;
- truthful completion ladder culminating in `SERVED_VERIFIED`.

### Refined

- Pi-specific adapter/telemetry wording is historical;
- current Builder observations are Mastra/E2B/app-under-test paths;
- owner-control F5 is explicitly separate from Operational Telemetry;
- trace/provider/runtime identity is correlation only;
- exact deciding-evidence qualification belongs Package E/downstream proofs.

**Current homes:** 3C-13; 3H-03; 3K-02; 3A-R10; Package E.

---

## C-014 — Release / promotion / environment lifecycle

**Disposition:** `REFINED / CORE PRESERVED`

Current meaning:

- immutable ReleaseManifest/composition root;
- no governed schema/artifact/config transition outside Release path;
- candidate availability != Promotion != serving verification;
- environment conformance is fail-closed;
- promotion uses expected/current generation safeguards;
- pointer swap alone is not `SERVED_VERIFIED`;
- rollback is a new governed Promotion and does not pretend to roll back business data;
- no `latest` resolution for governed runtime composition.

Later authorities own exact state vocabulary, first-installation operations and managed-job scheduling.

**Current homes:** 3C-11; 3G-08; 3J; 3K-02; 3A-R9/10.

---

## C-015 — Published runtime / app access

**Disposition:** `PARTIALLY_SUPERSEDED`

### Preserved

```text
one central Account identity
server-side session/access authority
opaque cookie / no durable browser bearer
server-derived Project/app/surface identity
fail-closed membership/role checks
Published App access independent from Builder internals
closed F1 published-app roles = {admin, member}
permission manifest cannot weaken effect/approval laws
administer access != use business capability
```

### Superseded/refined

- combined/ambiguous `ProjectMembership` wording is split by 3B-14/3C-02 into Control Plane access vs Published App access;
- `PROJECT_ADMIN` never implies app admin/user automatically;
- local/tailnet serving wording is superseded by 3J's explicit first-installation ingress contract;
- current authorization freshness/revocation is 3I-01;
- first-production topology is 3J.

### Important preservation

3B cross-review explicitly says illustrative app-role names in 3B-14 do **not** replace C-015's F1 `{admin, member}` role set.

**Current homes:** 3B-10..14; 3C-02/12/15; 3I-01; 3J; 3K.

---

## C-016 — Proportional F1 security

**Disposition:** `REFINED / CORE PRESERVED`

Preserved security properties include:

- deterministic dependency/supply-chain admission;
- no secret in project source/browser/model/guest;
- external effects only through governed Gateway path;
- explicit egress origin/destination rules;
- fail-closed credential/error behavior;
- durable limits for consequential effect classes where restart must not reset safety;
- sanitization/redaction and traffic-state honesty;
- data minimization/LGPD obligations;
- no generic OPA/FGA/Vault/KMS/security platform absent a real failure class.

3I/3J now own current authorization, credential custody, model spend, DEDICATED trust and operational trust-zone realization. Package C/E and downstream security probes own remaining technology proof.

**Current homes:** 3I; 3J; 3L Package C/E; downstream security conformance.

---

## C-017 — Engineering / correctness model

**Disposition:** `REFINED / CORE PRESERVED`

### Preserved

```text
Hub authority; agent tactical freedom
Project → Change → WorkUnit → ActorRun Builder graph
correctness/assertions before decomposition
contract revision/digest pinning
Evidence is not agent self-assertion
Finding is durable/owner-routed, not worker-owned closure
proportional planning/rigor
serial baseline
human checkpoints where authority requires
fresh independent verifier when material
NO_CHANGE_REQUIRED is valid when proven
Mission/Milestone/fleet/workflow engine rejected F1
```

### Superseded/refined

- Pi-specific implementer/verifier realization;
- “fresh runtime every execution” where it conflicts with persistent Change-scoped CodingSession;
- exact retry/spend/runtime details now belong 3G/3H/3I/3L.

**Current homes:** 3B-03/04/07; 3A-R8; 3G-02/03/04; 3H-01; 3I-03; 3L-A.

---

# 6. Phase 3 decision-family dispositions

## 3A — Architecture Reconciliation

### 3A-R5

**Disposition:** `CURRENT` for Builder runtime realization.

Current Builder = Mastra AgentController + persistent Change-scoped CodingSession + E2B; Pi fallback/challenger only on structural qualification failure.

### 3A-R6

**Disposition:** `CURRENT` critical-path/routing law.

```text
MUST DECIDE BEFORE IMPLEMENTATION
DEFER SAFELY
REJECT F1
```

allocates decision depth; it never weakens Method correctness obligations.

### 3A-R7

**Disposition:** `CURRENT` bounded ownership correction.

Platform assistant capability is Builder-owned/presented by Control Plane; platform knowledge is not Workspace Brain; no global persistent platform agent without real consumer.

### 3A-R8

**Disposition:** `CURRENT` Project Baseline/Change law.

Project Baseline is `SPEC-ANCHORED / LIVING / INCREMENTAL`; sufficient for the current Change, not complete for imagined future; material Project-level meaning change returns before coding crosses the boundary.

### 3A-R9

**Disposition:** `CURRENT` managed-job law.

First F1 `job/v1` consumer = governed managed sync; MAR owns runtime semantics; Release owns future occurrence composition; `mar.job_run` is sufficient durable occurrence record; queue/scheduler are mechanics; arbitrary privileged Project job code/generic workflow runtime rejected F1.

### 3A-R10

**Disposition:** `CURRENT` pre-implementation supersession + qualification routing law.

Historical probes must be recompiled against current authority. Product Agent advanced memory remains gated. Technology selected != qualified. Post-C-018 Realization Planning is required and derived-only.

### 3A-R11

**Disposition:** `ACTIVE CHECKPOINT / NOT YET FINAL CURRENT AUTHORITY`.

It becomes the whole-product current-generation reconciliation authority only after its own Fable/adjudication/operator-ratification gates close.

---

## 3B — System Context & Boundaries

**Disposition:** `CURRENT`, with more specific later phases governing detailed ownership/state/security/realization.

Current core:

- Workspace sovereign isolation root;
- Project independent lifecycle unit;
- Change bounded/verifiable evolution;
- Builder strategy isolated/replaceable, no generic workflow DSL;
- approved Project Baseline before initial construction and materially revised Baseline when required;
- planning depth independent of execution rigor;
- Baseline content in Git, approved digest in Hub;
- one canonical source repo per Project F1;
- explicit limited Control Plane access graph;
- Area is organizational, not software/technical binding;
- Control Plane / Preview / Published App authorization are independent;
- Workspace owns Brain/Connections, Project owns typed bindings;
- Project-internal durable resources remain Project-scoped;
- no direct cross-Project mutable storage; explicit reuse only.

No known 3B material reopen is active.

---

## 3C — Domain / Module Architecture

**Disposition:** `CURRENT`.

Current semantic owners:

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

These semantic modules do not imply separate services/processes/databases.

---

## 3D — Dependency Architecture

**Disposition:** `CURRENT`.

Current laws include modular monolith, acyclic/typed direct-call-first boundaries, no cross-module internals/table access, Gateway-only effects/credentials, exact owner projections into runtimes and no generic orchestration/queue authority by convenience.

---

## 3E — Data Architecture

**Disposition:** `CURRENT`.

`hub_control` PostgreSQL remains Hub operational truth with module-owned logical schemas; Project business databases remain separate business-data authorities; Registry/CAS/BlobStore remain owner-specific output/byte mechanisms; no shared/common schema or plaintext secret authority.

Exact physical schema spelling belongs later derived realization, not this registry.

---

## 3F — Contracts & API Architecture

**Disposition:** `CURRENT`.

Current laws: owner-specific contracts, INTERNAL vs INDEPENDENT surfaces, no UniversalEnvelope, exact approval subject, concrete Project bindings, stable public failure keys only where needed and ReleaseManifest as exact composition root.

---

## 3G — Behavioral / State Architecture

**Disposition:** `CURRENT`.

Owner-local machines remain distinct. In particular:

```text
Builder ActorRun
!= Product AgentRun
!= Gateway EffectAttempt
!= Promotion
```

Terminal truth is durable/write-once where applicable; stale/duplicate/ambiguous resume/replay cannot manufacture success; Project archive, Release, approval and effect states remain owner-specific.

---

## 3H — Runtime & Agent Architecture

**Disposition:** `CURRENT ARCHITECTURE / PARTIALLY QUALIFICATION-PENDING`.

### Builder

Current architecture and Package-A result:

```text
persistent Change-scoped CodingSession
→ Mastra AgentController
→ role-specific Mastra runtime/store
→ Workspace/E2B

E2B = QUALIFIED WITH REQUIRED PHYSICAL-INCARNATION GUARD
Builder OM = KEEP OFF
```

### Product Agent

Current architecture:

```text
exact RuntimeAgentProjection
→ direct Mastra Agent
```

But Product Agent substrate/cross-runtime behavior is **not yet Package-B-qualified**.

### Runtime isolation

```text
BuilderMastra != ParMastra
```

same-process baseline is conditional on proving enabled F1 process-global mutable state can be partitioned/fenced. Package B owns that deciding Evidence.

---

## 3I — Security / Authority Architecture

**Disposition:** `CURRENT ARCHITECTURE / SOME TECHNOLOGY PROOF PENDING`.

Current laws include:

- current server-derived authorization at protected control points;
- pre-state authorization for security-sensitive mutations;
- immutable history + prospective current narrowing;
- Connection secret plaintext only write-only ingress + Gateway last-mile;
- model-provider credential control-side;
- guest cannot mint/widen/refresh bounded capability;
- one owner-local outstanding model-spend liability per run semantics;
- DEDICATED trust remains owner-preserving;
- five trust zones and least-privilege Hub control;
- runtime/trace/provider refs never principals.

Package C and later first-build probes still owe technology-specific proof.

---

## 3J — Deployment / Operations Architecture

**Disposition:** `CURRENT` for first installation, not universal SaaS topology.

Current first-installation baseline:

```text
on-prem / single-host realization
company LAN / existing corporate VPN + HTTPS
no public Internet ingress F1
```

This is Metal Nobre/first-deployment evidence, **not** universal product law.

3J also owns backup/restore, operational secret injection, lifecycle, whole-Hub emergency stop and availability proof boundaries.

Deferred by trigger:

```text
DEDICATED physical deployment
old Product Agent runtime coexistence/drain
PITR/HA where required
external SLA monitoring
future deployment scaling machinery
```

---

## 3K — Frontend / Product Architecture

**Disposition:** `CURRENT`.

Current Product surfaces include Project list/shell, Data, Functions, Applications, Agents, Connections, Brain, Builds, Releases, Changes and one Terminal surface.

Current Product truth law:

```text
UI projects owner truth
-X-> UI/model/telemetry manufactures truth
```

Build/Preview/Release/served/effect/data/access states remain semantically honest and inspectable.

---

## 3L-Q0 — Qualification manifest

**Disposition:** `CURRENT QUALIFICATION ROUTER`.

Q0 pins deciding Evidence identity and serial Package order; it does not permanently select every technology version.

```text
A → B → C → D → E
```

Historical mechanism-specific checklists cannot execute verbatim after later authority supersession.

---

## 3L Package A — Builder Substrate + Cognition

**Disposition:** `CURRENT DECIDING EVIDENCE / COMPLETE`.

```text
A1 Mastra/PostgreSQL persistent runtime = PASS
A2 E2B substrate = PASS WITH REQUIRED PHYSICAL-INCARNATION GUARD
A3 native Codex OAuth = PASS
A3 Builder OM = EVALUATED / NOT_PROVEN FOR ENABLEMENT / KEEP OFF
Package A = COMPLETE
```

Package-A Evidence does not qualify Product Agent, model economics, managed jobs or deciding-evidence paths owned by Packages B–E.

---

# 7. Historical idea → current semantic home

| Historical / stale idea | Current routing |
|---|---|
| MNFS Mission/Milestone/Feature as Conexus work graph | C-017/3B/3G: Change/WorkUnit/ActorRun; Mission/Milestone rejected F1. |
| Pi primary Builder | 3A-R5 + 3H-01 + 3L-A: Mastra AgentController/CodingSession/E2B. |
| fresh cognitive reset every WU/run | persistent Change-scoped CodingSession; fresh verifier/new Change when material. |
| local Pi+SRT sandbox | C-008/3H/3L-A E2B. |
| guest LLM provider key | 3I-02 deleted; model provider is control-side. |
| Vercel AI SDK Product Agent loop | 3H-02 direct Mastra Agent from exact projection. |
| Stored Agent/latest/Editor Product authority | rejected; exact Release/RuntimeAgentProjection. |
| pg-boss as schedule authority | 3A-R9 + Q0 Package D candidate only. |
| generic job/workflow/scheduler domain | rejected F1; MAR-managed sync + Release schedule semantics. |
| ProjectMembership as both builder/control and app access | 3B-14/3C-02 split Control Plane vs Published App relationships. |
| illustrative app roles replacing `{admin,member}` | rejected by 3B cross-review; C-015 set remains until explicit later decision. |
| telemetry/trace = successful run/result | 3H-03/3K-02 prohibit; owner F5/write-once truth only. |
| memory/RAG framework as Brain | 3C-09 explicitly rejects; Brain remains Conexus semantic authority. |
| one perfect distributed trace required for correctness | Conexus owner IDs span 0..N trace segments; trace continuity not domain continuity. |
| universal resource-binding engine | rejected; ProjectBrainBinding + ProjectConnectionBinding typed. |
| cross-Project direct DB/runtime reuse | rejected; explicit Platform/Brain/Connection reuse only. |
| public Internet first-installation ingress | rejected F1; LAN/corporate VPN + HTTPS. |
| DEDICATED physical stack built now | deferred until real DEDICATED consumer. |
| advanced Product Agent memory on by default | deferred/eval-gated. |
| implementation-dependent probes pulled into 3L | rejected; remain mandatory on first slice that can actually instantiate them. |
| C-018 directly authorizes coding | false; F3B-R1 + accepted derived Realization Plan still required. |

---

# 8. Current Deferred / Rejected-F1 classes

The following are preserved deliberately without dormant realization machinery:

## Deferred / trigger-based

```text
DEDICATED physical deployment
multi-repo Project
cross-Workspace sharing/export/import/exchange
Product Agent Working/Agent Memory beyond named consumer
Product Agent Semantic Recall
Product Agent Observational Memory
Memory Extractors
createDurableAgent reconnectable same-stream semantics
EVENT Product Agent trigger
external Vault/KMS/HSM
per-secret envelope/DEK hierarchy
Connection pools/failover
public/embed/self-signup
SSO/SCIM/passkeys
PITR/HA until recovery/availability need pays for it
external monitoring/paging until SLA consumer
process split Builder/PAR unless Package B proves unpartitionable global mutable state
```

## Rejected F1 absent new material evidence

```text
generic workflow engine
generic scheduler/automation domain
universal resource-binding engine
universal status/FSM/envelope
shared mutable cross-Project database/runtime state
Mission/Milestone/fleet machinery
memory framework as Brain authority
Stored Agent/latest Product authority
browser/frontend authorization authority
guest durable/model-provider credentials
arbitrary privileged Project job code
```

A future item reopens only on a named consumer, changed requirement/ownership/scale, newly reachable failure mode or external change that materially invalidates current assumptions.

---

# 9. Technology state — do not collapse these labels

The final Architecture Baseline must preserve distinctions like:

```text
ARCHITECTURE CURRENT
SELECTED / NOT YET QUALIFIED
QUALIFIED
QUALIFIED WITH REQUIRED GUARD
EVALUATED / KEEP OFF
CANDIDATE
DEFERRED
REJECTED F1
```

Current examples:

| Surface | Current state |
|---|---|
| Node/TS modular-monolith Hub | ARCHITECTURE CURRENT |
| PostgreSQL 17 major | ARCHITECTURE CURRENT; Q0 probes use exact 17.10 |
| Mastra Builder harness | QUALIFIED within Package-A tested properties |
| E2B Builder substrate | QUALIFIED WITH REQUIRED PHYSICAL-INCARNATION GUARD |
| native Codex OAuth path | QUALIFIED for Package-A smoke/experiment path |
| Builder Observational Memory | EVALUATED / KEEP OFF |
| direct Mastra Product Agent | ARCHITECTURE CURRENT / PACKAGE B NOT YET QUALIFIED |
| BuilderMastra/ParMastra same-process isolation | ARCHITECTURE CURRENT / PACKAGE B NOT YET QUALIFIED |
| model-spend interception/enforcement | ARCHITECTURE CURRENT OBLIGATION / PACKAGE C NOT YET QUALIFIED |
| pg-boss 12.26.3 | PACKAGE D CANDIDATE, NOT AUTHORITY |
| deciding observability surfaces | ARCHITECTURE CURRENT SHAPE / PACKAGE E NOT YET QUALIFIED |

---

# 10. No current material reopen from R11-A

R11-A checked the highest-risk supersession families:

```text
Builder runtime
model credential custody
Product Agent runtime
queue/scheduler authority
Published App access
observability/F5
Brain/runtime memory
future seams/YAGNI
```

Result:

```text
irreconcilable accepted-authority conflict = NONE FOUND
material REOPEN required                   = NONE
```

This registry must still pass R11 whole-product Product Contract/Architecture Baseline coherence and independent Fable challenge before ratification.

---

# 11. R11-B candidate verdict and next step

Candidate reconciliation outcome:

```text
historical corpus preserved                     = YES
stale mechanisms explicitly routed              = YES
current detailed semantic homes identified      = YES
technology selection vs qualification separated = YES
Deferred/Rejected-F1 seams preserved             = YES
new Product semantics introduced                 = NO INTENT
material Decision Loop reopen                    = NONE
```

**Next:** derive `PRODUCT-CONTRACT.md` from the reconciled current meaning, then derive `ARCHITECTURE-BASELINE.md` from Product Contract + current detailed architecture + qualification evidence. Neither becomes final authority before R11 E–H gates close.
