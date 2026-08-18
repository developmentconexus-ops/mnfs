# Conexus — Decision Reconciliation Registry

> **Status:** CANDIDATE / R11-B — ROUND-1 COHERENCE CORRECTED / NOT YET CURRENT AUTHORITY  
> **Parent checkpoint:** `3A-R11 — Whole-Product Authority Rebaseline`  
> **Method:** DevelopmentConexus Engineering Method v1.0.0  
> **Implementation:** BLOCKED  
> **Package B:** PAUSED / NOT OPENED  

This registry answers one question:

> **Which generation of a Conexus decision is current, where does its detailed meaning live, what survives from older decisions, what must not be resurrected, and what remains genuinely deferred/open?**

Until R11 passes Round-2 coherence, Fresh Actor review, independent Fable review, finding adjudication and final operator ratification, this file remains a candidate routing projection.

---

# 1. Role

Once ratified, this registry owns **decision-generation reconciliation/routing only**.

It does not:

- replace detailed semantic authority in C-/3A–3K documents;
- create new Product semantics by summarization;
- turn technology selection into qualification;
- erase historical rationale/Evidence;
- authorize implementation, C-018 or PR #40 merge;
- turn Future seams into dormant F1 machinery.

If this registry disagrees with an accepted detailed semantic home, **this registry is defective** unless a material Finding explicitly reopens that authority.

Absence from this registry is never permission to contradict accepted authority.

---

# 2. Disposition vocabulary

```text
CURRENT
  Current meaning is directly accepted and remains valid.

PRESERVE
  Earlier decision remains coherent and has no material current counterexample.

REFINED
  Essential meaning/invariant survives but later authority sharpened owner,
  boundary, state semantics or realization.

PARTIALLY_SUPERSEDED
  Identified parts survive and identified parts must not be inherited.

SUPERSEDED
  Current accepted authority replaced the old target meaning/realization.

DEFERRED
  Real future capability/decision with an explicit seam/trigger;
  no dormant F1 machinery.

REJECTED_F1
  Deliberately not part of F1; historical existence is not a reopen trigger.

REOPEN
  Material current Evidence falsified or made accepted authority incomplete;
  return to the smallest implicated Decision Loop.
```

A single historical decision may be `PARTIALLY_SUPERSEDED`: the invariant can survive while the mechanism does not.

---

# 3. Current authority-generation routing

For current questions, route by scope:

```text
Product vision / objectives
→ C-001 + accepted Product-facing 3K authority

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

Builder / Product Agent runtime realization
→ 3A-R5 + 3H-01..03 + 3H-R1

Security / authorization / credentials / spend / trust
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
→ 3A-R11 only after final ratification
```

More specific accepted authority controls its exact scope. Recency alone is not authority.

---

# 4. Cross-cutting current laws

```text
one semantic authority per meaning
mechanism != authority
Workspace = sovereign isolation root
Project = independent software/product lifecycle unit
Change != WorkUnit != Builder ActorRun
Builder ActorRun != Product AgentRun != Gateway EffectAttempt != Promotion
Git authoring != Hub control truth != Project business DB != Registry/CAS serving output
Workspace owns Brain/Connection; Project owns explicit typed binding intent
same Workspace membership != resource-use authority
same bytes/digest != same authorization authority
Control Plane != Preview != Published App authorization
administer != use
current authorization is server-derived and rechecked at protected control points
runtime/provider/trace/telemetry identity != Conexus principal/owner truth
Gateway = business/application effect + credential-last-mile/replay authority
approval binds one exact sealed subject and never widens it
unknown/missing/partial != zero/success
OUTCOME_UNKNOWN never grants blind automatic replay
Release/composition is immutable and never resolved by mutable latest
AVAILABLE != PROMOTED != SERVED_VERIFIED
telemetry/observation != owner F5/terminal truth
Brain != agent/runtime memory
future capability preserves seam/trigger without dormant machinery
technology selected != technology qualified
review finding != requirement authority
```

---

# 5. Foundational decisions — current disposition

| Decision | Disposition | Current meaning that survives | Superseded/refined portion | Current semantic home |
|---|---|---|---|---|
| **C-000** | **PARTIALLY_SUPERSEDED** | Conexus is a new Product; MNFS is selective reference/provenance, not inherited target authority. | Early repo-timing/cutover wording. Current route is 3L–3O → C-018 → F3B-R1 → derived Realization Planning. | C-000, 3A-R6/R10, future F3B-R1 |
| **C-001** | **CURRENT / PRESERVE** | Unified AI-first enterprise platform; Builder/Harness, Brain, Applications and Product Agents; internal-first with later SaaS direction; Budget Analyzer first vertical. | Technology examples inside vision never select realization. | C-001, 3A-R7, 3K |
| **C-002** | **PARTIALLY_SUPERSEDED** | Sovereign Hub; Node/TS+Postgres control direction; narrow coding-runtime seam; runtime identity != model; mechanical gates; fresh independent verification when material. | Pi primary Builder, forced fresh cognitive reset per WU, Mastra-outside premise, pg-boss as already-selected authority, old model/auth mechanisms. | 3A-R5, 3H, 3I, 3A-R9/R10, 3L |
| **C-003** | **REFINED / REQUIREMENT INTENT PRESERVED** | Ratified Product/F1 obligations remain traceability authority unless specifically superseded. | Mechanism/phase wording must be read through later accepted architecture; explicit stale cases are routed below. | C-003 + 3A-R7/R8/R10 + exact 3B–3K homes |
| **C-004** | **SUPERSEDED** | Historical sandbox rationale/probe only. | Local Pi+SRT F1 sandbox. | C-008, 3A-R5, 3H-01, 3L-A |
| **C-005** | **REFINED / CORE PRESERVED** | Git-first artifact authoring; stable semantic reference; immutable revision/digest; real binds/roles; exact Release composition; no mutable latest serving. | Kind set/owners/lifecycle expanded and refined; mutable registration/provisioning API is not current authoring authority; `job/v1` narrowed by 3A-R9. | 3C-06/11/15, 3D–3G, 3A-R9 |
| **C-006** | **REFINED / CORE PRESERVED** | PG17; Hub control != Project business DB; real least-privilege roles; migration/validation/drift/restore correctness. | Early physical placement/backup wording is not current deployment authority. | 3B-16, 3E, 3J, 3L-Q0 |
| **C-007** | **REFINED / CORE PRESERVED** | Narrow declarative connectors; Workspace Connection; explicit qualification/environment/revision; opaque credential relation; fail-closed effects. | Gateway/3I now own effect, custody/trust and replay properties; no free-form hook runtime by inheritance. | 3B-15, 3C-07/08, 3D-02, 3G-06, 3I |
| **C-008** | **PARTIALLY_SUPERSEDED / SUBSTRATE QUALIFIED WITH GUARD** | E2B Builder substrate; full-machine agency; durable privileged secrets outside guest; Hub-mediated Git/result custody; governed egress; BuildValidationDatabase distinction. | Pi realization, guest LLM provider key, historical hard session-cutoff doctrine, stock write retry across unseen physical recreation. | 3A-R5, 3H-01, 3I-02, 3L-A |
| **C-009** | **PRESERVE AS RATIONALE/EVIDENCE** | Mechanical invariants beat model goodwill; maintenance must be fixed by class; live credential/egress honesty; orphan/guarantee-break detection; unknown remains unknown. | Mitra-specific runtime/tool/session behavior is not Conexus architecture. | C-009 as Evidence; later authority owns mechanisms |
| **C-010** | **PARTIALLY_SUPERSEDED** | Product Agent as Project-owned git-first artifact; immutable revision/projection; Conversation/AgentRun/ApprovalRequest; bounded tools; Gateway effects; budgets/model identity; mechanical HITL. | Vercel AI SDK light loop, current `ModelProviderAdapter` realization, “Mastra rejected” premise, old continuation mechanics. | 3C-10, 3F-03, 3G-05/06, 3H-02, 3I-03, 3A-R10 |
| **C-011** | **REFINED / CORE PRESERVED** | Workspace Brain; SEMANTIC/KNOWLEDGE/EVIDENCE; own Git source; immutable Registry revision; explicit ProjectBrainBinding; assisted Discovery; KnowledgeProposal; health/drift; AnalyticQuery; hard context budgets. | Brain != RAG/memory; `BrainRevision` is semantic view of exact ArtifactRevision; live inheritance rejected. | 3B-15, 3C-09, 3A-R7/R10 |
| **C-012** | **REFINED / CORE PRESERVED** | Versioned reproducible scaffold; rich infrastructure/poor Product features; Generated vs Platform-Contract vs App-Owned; React/TS/Vite/TanStack; fail-closed generated contracts; honest UI; first-build conformance. | 3K owns current Product shell; exact implementation probes remain downstream, not pre-proven by architecture. | 3K, 3A-R10 |
| **C-013** | **REFINED / CORE PRESERVED** | Causal observation; producer trust; usage/cost states; live checklist; tasks-purpose memory; unknown != zero; no blind ambiguous retry; completion ladder through SERVED_VERIFIED. | Pi-specific telemetry adapter and generic `agent_event` durable-table/owner wording do not survive current 3E/OBS inventory; F5 owner control is separate from telemetry. | 3C-13, 3E, 3H-03, 3K-02, Package E |
| **C-014** | **REFINED / CORE PRESERVED** | Immutable ReleaseManifest composition; branch/Change Git model; exact environments/config; migration gates; EnvironmentConformance; Promotion/CAS/served verification; Project duplication semantics. | Early owner labels/state spellings refine through 3G/3J; managed schedule semantics moved to 3A-R9. | 3C-11, 3G-08, 3J, 3K, 3A-R9 |
| **C-015** | **PARTIALLY_SUPERSEDED** | One Account; server-side opaque session; no durable browser bearer; deny-by-absence; Published App authority independent from Builder; closed F1 app roles `{admin, member}`. | Ambiguous combined `ProjectMembership`; local/tailnet exposure wording; current auth freshness and first-production topology are later authority. | 3B-10..14, 3C-02/12/15, 3I-01, 3J |
| **C-016** | **REFINED / CORE PRESERVED** | Fail-closed supply-chain/security; no secret in client/repo/chat/guest; Gateway business egress; owner-pinned control egress; sanitization/redaction; data minimization; no speculative security platform. | Current authorization/credential/trust/topology mechanics decomposed by 3I/3J. | 3I, 3J, Package C/E + downstream probes |
| **C-017** | **REFINED / CORE PRESERVED** | Project→Change→WorkUnit→ActorRun engineering graph; correctness/acceptance before decomposition; Findings/Evidence owner-routed; proportional rigor; serial baseline; independent verifier; no Mission/Milestone/workflow engine. | Pi/fresh-runtime realization and retry/spend mechanics. | 3B-03/04/07, 3A-R8, 3G-02/03/04, 3H-01, 3I-03, 3L-A |

---

# 6. C-003 requirement-generation corrections

C-003 remains a Product requirement source, but these historical phrases must **not** be implemented literally after later accepted authority:

| Historical requirement wording | Current generation |
|---|---|
| HAR-1/10 fresh worker / disposable cognitive runtime per unit | bounded WU/ActorRun survives; Change-scoped persistent CodingSession is current; fresh independent verifier remains when material |
| HAR-1 “one commit/turn” | one canonical result commit per bounded WorkUnit; worker may have temporary local commits; no cognitive reset implied |
| REG-4 `list → update | create` mutable registry provisioning | git-first source + compilation/Release path; no mutable registration API as authoring authority |
| REG-5 one response envelope | **SUPERSEDED:** 3F owner-specific contracts; no `UniversalEnvelope` |
| CER-1 Brain inherited live by every Project | **REFINED:** Workspace Brain + explicit pinned ProjectBrainBinding; live inheritance rejected |
| AGT-3 cron/webhook + service identity | headless Product Agent survives; `SCHEDULE` admitted; `EVENT` deferred; Product Agent runtime identity is not authorization principal |
| AGT-4 Platform Consultant “uses Brain mechanism” | Platform Consultant survives as Builder-owned Control Plane capability; platform knowledge is not Workspace Brain content |
| AGT-5 historical `AgentTaskSession` transport | interactive Product Agent intent survives through Conversation/AgentRun + Project-designed surface; exact historical transport not authority |
| PUB-2 URL-fragment bearer/token flow | **SUPERSEDED:** server-side session/opaque cookie authority under C-015/3I |
| PUB-4 exact postMessage chat handshake | historical embed mechanism; current interaction surface is Project-designed and no universal widget is mandatory |
| CIC-2 PROD = forked logical Project | **SUPERSEDED WORDING:** PROD is isolated environment/database of the same Project |
| SEG-3 explicit privilege delayed to F2 | promoted/strengthened: current authorization is F1/first-production authority in 3I |
| SEG-4 “no formal security/threat architecture F1” | **SUPERSEDED:** 3I current security/trust architecture is binding |
| QUA-4 Pi × Claude challenger pair | Worker Eval intent survives; concrete runtime/model candidates follow current primary/challenger authority |

C-003 F2 `INT-6 managed tunnel` preserves a future **SaaS↔private/on-prem reachability requirement class**, not a mandatory tunnel technology. Reopen mechanism/topology when the SaaS installation and private target are real.

---

# 7. Phase 3 current disposition

## 3A — Architecture Reconciliation

```text
3A-R5  CURRENT — Builder runtime realization
3A-R6  CURRENT — critical path / MUST DECIDE vs DEFER vs REJECT routing
3A-R7  CURRENT — Platform Consultant ownership correction
3A-R8  CURRENT — SPEC-ANCHORED/LIVING/INCREMENTAL Project Baseline
3A-R9  CURRENT — managed sync/job semantics; scheduler/queue as mechanics
3A-R10 CURRENT — pre-implementation supersession + qualification routing
3A-R11 ACTIVE — whole-product rebaseline; not final current authority until its gates close
```

## 3B — System Context & Boundaries

**Disposition:** `CURRENT`.

Current core: Workspace sovereign root; Project independent unit; Change bounded evolution; Project Baseline; proportional planning; one repo per Project F1; separate Control Plane/Preview/Published App authority; Workspace Brain/Connections + typed Project bindings; no direct cross-Project mutable reach.

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

Semantic owners do not imply separate services/processes/databases.

## 3D — Dependency Architecture

**Disposition:** `CURRENT`.

Modular monolith; typed/direct-call-first owner ports; no cross-owner table/internal access; Gateway last-mile; runtimes receive exact owner projections; no generic orchestrator by convenience.

## 3E — Data Architecture

**Disposition:** `CURRENT`.

`hub_control` owner truth, Project business DBs, Builder/PAR Mastra stores and byte/credential backings remain distinct authority/capability domains. Current durable inventory supersedes generic historical `agent_event` table ownership.

## 3F — Contracts/API Architecture

**Disposition:** `CURRENT`.

Owner-specific payloads; INTERNAL vs INDEPENDENT surfaces; exact approval subject; concrete bindings; stable public failure semantics where justified; no UniversalEnvelope.

## 3G — Behavioral/State Architecture

**Disposition:** `CURRENT`.

Owner-local state machines remain distinct:

```text
Builder ActorRun
!= Product AgentRun
!= Gateway EffectAttempt
!= Promotion
```

No generic lifecycle/state engine.

## 3H — Runtime/Agent Architecture

**Disposition:** `CURRENT ARCHITECTURE / PARTIALLY QUALIFICATION-PENDING`.

Builder:

```text
Change-scoped persistent CodingSession
→ Mastra AgentController
→ BuilderMastra/mastra_builder
→ Workspace/E2B
```

Product Agent:

```text
exact RuntimeAgentProjection
→ ParMastra/mastra_par
→ direct Mastra Agent
```

```text
BuilderMastra != ParMastra
```

Same-process isolation remains Package-B proof, not yet a qualified fact.

## 3I — Security/Authority Architecture

**Disposition:** `CURRENT ARCHITECTURE / SOME TECHNOLOGY PROOF PENDING`.

Current laws include current server-derived authorization, pre-state security checks, control-side credentials/model calls, owner-local spend reservation, Gateway effect authority and **six logical trust-zone classifications**:

```text
Z1 Browser / Client
Z2 Trusted Hub Control
Z3 Guest Execution
Z4 DEDICATED External Application
Z5 External Provider / Enterprise
Z6 Trusted Data / Storage Infrastructure
```

These zones are security classifications, not mandated deployment units.

## 3J — Deployment/Operations Architecture

**Disposition:** `CURRENT FOR FIRST INSTALLATION`, not universal SaaS topology.

```text
existing company physical server
→ Windows host
→ dedicated Linux production guest
→ one Node/TS Hub application process
→ co-located but capability-isolated PostgreSQL/Mastra/backings

private ingress = LAN / existing corporate VPN + HTTPS
public Internet ingress F1 = none
```

## 3K — Frontend/Product Architecture

**Disposition:** `CURRENT`.

Agent-first, simple-by-default, inspectable-by-design Workspace/Project shell; truthful Build/Data/Capabilities/Integrations/Agents/Brain/Versions/Activity surfaces; UI never manufactures owner truth.

## 3L-Q0

**Disposition:** `CURRENT QUALIFICATION ROUTER`.

Exact deciding Evidence identity; serial Package A→B→C→D→E. Historical mechanism-specific probes are recompiled against current authority.

## 3L Package A

**Disposition:** `CURRENT DECIDING EVIDENCE / COMPLETE`.

```text
A1 Mastra/PostgreSQL persistence          PASS
A2 E2B                                   PASS WITH REQUIRED PHYSICAL-INCARNATION GUARD
native Codex OAuth                       PASS for tested A3 path
Builder Observational Memory             EVALUATED / NOT_PROVEN / KEEP OFF
Package A                                COMPLETE
```

Package A does not qualify Product Agent, model economics, managed execution or deciding-evidence paths.

---

# 8. Historical/stale idea → current home

| Historical idea/mechanism | Current routing / instruction |
|---|---|
| MNFS Mission/Milestone/Feature as Conexus work graph | Change/WorkUnit/ActorRun; Mission/Milestone rejected F1 |
| Pi primary Builder | Mastra AgentController + Change-scoped CodingSession + E2B |
| forced fresh cognitive reset per WorkUnit | persistent Change session; fresh verifier/new Change only for material reason |
| local Pi+SRT sandbox | E2B qualification path |
| guest LLM provider key | deleted by 3I-02; model credential control-side |
| Vercel AI SDK Product Agent loop | direct Mastra Agent from exact RuntimeAgentProjection |
| Stored Agent / Editor / latest Agent authority | rejected; exact Release projection only |
| pg-boss as schedule authority | Package-D candidate only; scheduler/queue reconstructible mechanics |
| generic Workflow/Scheduler/Automation domain | rejected F1; MAR managed sync/job owner semantics |
| C-003 one response envelope | superseded by 3F owner-specific contracts; no UniversalEnvelope |
| C-003 mutable list/update/create artifact registration | git-first authoring + immutable compilation/Release |
| C-003 webhook/EVENT mandatory F1 | headless preserved; SCHEDULE current; EVENT deferred |
| Product Agent as service authorization principal | rejected; Agent runtime identity != current authorization principal |
| C-003 URL-fragment token | superseded by server-side opaque session/cookie authority |
| C-003 exact chat postMessage handshake | historical mechanism; Project-designed Product Agent interaction surface |
| `ProjectMembership` as both Control Plane and Published App access | split by 3B-14/3C-02 |
| illustrative 3B app roles replacing `{admin, member}` | rejected; C-015 closed app-role set survives until explicit later decision |
| PROD as forked logical Project | same Project, isolated PROD environment/database |
| C-003 “no formal security/threat architecture F1” | superseded by 3I security/trust architecture |
| generic `agent_event` table/owner | current 3E/OBS owner-specific durable inventory; old type/table wording must not resurrect |
| telemetry/trace = successful owner result | prohibited; owner F5/write-once truth only |
| memory/RAG framework as Brain | explicitly rejected; Brain remains Conexus semantic authority |
| perfect one-tree distributed trace required for correctness | not required; Conexus owner IDs span 0..N trace segments |
| universal ResourceBinding | rejected; typed ProjectBrainBinding + ProjectConnectionBinding |
| direct cross-Project DB/runtime reuse | rejected; explicit Platform/Brain/Connection reuse seams only |
| public Internet first-installation ingress | rejected F1; LAN/corporate VPN + HTTPS |
| DEDICATED physical stack now | deferred until first real DEDICATED consumer |
| Product Agent advanced memory on by default | deferred/eval-gated |
| implementation-dependent product probes executed artificially in 3L | rejected; first real slice that can falsify them owns conformance |
| C-018 directly authorizes coding | false; F3B-R1 + accepted derived Realization Plan still required |

---

# 9. Current deferred / future seams

Preserve the seam/trigger; create no dormant module/table/service/framework:

```text
SaaS self-service/billing/customer operations
SaaS↔private/on-prem authenticated reachability
multi-repo Project
cross-Workspace Brain/Connection/package exchange
DEDICATED physical deployment
stronger HA/PITR/multi-host topology
external SLA monitoring/paging
Product Agent Working/Agent Memory
Semantic Recall
Product Agent Observational Memory
Memory Extractors
Durable Agent reconnect-to-same-stream
EVENT Product Agent triggers
Agent-as-tool/subagents/networks
MCP/A2A/external Agent clients
Product Agent browser/source/workspace access
Connection pools/failover
external Vault/KMS/HSM / per-secret DEK
SSO/SCIM/passkeys
public/embed serving
richer Published App roles/data scoping
Brain vector/RAG index
Project clone/export beyond current bounded duplicate semantics
```

---

# 10. Current REJECTED_F1 inheritance

```text
generic workflow engine
generic scheduler/automation business owner
universal resource-binding engine
universal status/FSM/envelope
generic Secret/Budget/Tool authority
shared mutable cross-Project DB/runtime state
Mission/Milestone/fleet machinery
memory framework as Brain authority
Stored Agent/latest Product authority
browser/frontend authorization authority
guest durable/model-provider credentials
arbitrary privileged Project job code
public Internet first-installation ingress
multiple coding runtimes purely for optionality
forced cognitive reset per WorkUnit
```

---

# 11. Technology state — do not collapse labels

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

| Surface | Current state |
|---|---|
| Node/TS modular-monolith Hub | ARCHITECTURE CURRENT |
| PostgreSQL major 17 | ARCHITECTURE CURRENT; Q0 tested exact 17.10 |
| Mastra Builder harness | QUALIFIED for Package-A tested properties |
| E2B Builder substrate | QUALIFIED WITH REQUIRED PHYSICAL-INCARNATION GUARD |
| native Codex OAuth | QUALIFIED for Package-A tested path |
| Builder Observational Memory | EVALUATED / KEEP OFF |
| direct Mastra Product Agent | ARCHITECTURE CURRENT / PACKAGE B NOT QUALIFIED |
| BuilderMastra/ParMastra same-process isolation | ARCHITECTURE CURRENT / PACKAGE B NOT QUALIFIED |
| owner-local model-spend enforcement | ARCHITECTURE CURRENT OBLIGATION / PACKAGE C NOT QUALIFIED |
| pg-boss 12.26.3 | PACKAGE D CANDIDATE / NOT AUTHORITY |
| deciding observability/F5 surfaces | ARCHITECTURE CURRENT SHAPE / PACKAGE E NOT QUALIFIED |
| React/TS/Vite/TanStack paved road | ARCHITECTURE CURRENT / first-build conformance pending |
| first-production Linux guest/private ingress topology | ARCHITECTURE CURRENT FOR FIRST INSTALLATION / activation proofs pending |

---

# 12. R11 status

R11-A found no irreconcilable accepted-authority conflict.

R11-E Round 1 found **14 candidate-projection defects but 0 material Product/architecture findings**. This corrected registry addresses the reconciliation-specific findings, especially trust-zone count and stale C-003/C-013 mechanism routing.

It must still pass R11-E Round 2, R11-F Fresh Actor review and independent Fable review before ratification.

**Next:** correct/enrich Product Contract and Architecture Baseline, then rerun whole-product coherence.
