# Conexus — Current Product & Architecture Entrypoint

> **Status:** CURRENT / ACCEPTED CURRENT-TREE ROUTER  
> **Whole-product checkpoint:** `3A-R11 CLOSED / APPROVED / OPERATOR RATIFIED`  
> **3L framework/routing amendment:** `3L-R1 CURRENT / APPROVED / OPERATOR RATIFIED 2026-08-19`  
> **3L Package-D/E amendment:** `3L-R2 CURRENT / APPROVED / OPERATOR RATIFIED 2026-08-20`  
> **Phase 3:** IN PROGRESS  
> **C-018:** NOT RATIFIED  
> **Product implementation:** BLOCKED  
> **Package B:** CLOSED / LEAD-ADJUDICATED / QUALIFIED FOR CURRENT F1 TESTED PROPERTIES  
> **Package D:** CLOSED / LEAD-ADJUDICATED / `QUALIFIED_TRANSACTIONAL_MANAGED_OCCURRENCE_ADMISSION`
> **Package E:** DEFER SAFELY / NO PRE-C-018 RUNTIME PROBE  
> **PR #40:** DRAFT / NO MERGE AUTHORIZATION

This page is the shortest safe entrypoint to the **current Conexus Product, architecture and exact next action**.

Do not reconstruct current state from old chat, old checklist order or document date. Historical documents preserve rationale; current amendments may supersede only explicitly named mechanism/routing clauses.

---

## 1. Read in this order

```text
AGENTS.md
→ DevelopmentConexus Engineering Method
→ docs/DOCUMENTATION-MAP.md
→ this current README
→ PRODUCT-CONTRACT.md when Product meaning/scope is relevant
→ ARCHITECTURE-BASELINE.md when structural owner/boundary meaning is relevant
→ DECISION-RECONCILIATION.md when historical decisions appear to conflict
→ 3L-R1 for current Mastra / Package-B / Package-C realization routing
→ 3L-R2 for current Package-D / Package-E realization routing
→ 3L-D final lead closure + 3L preclosure completeness/deletion check
→ docs/conexus/phase3/LEDGER.md for other Phase-3 detail
→ exact accepted semantic authority
→ deciding Evidence/current implementation only when material
```

### Current precedence warning

For the exact clauses named by `3L-R1` and `3L-R2`, these are the current amendments:

> **[3L-R1 — Framework-Native Proportional Qualification Rebaseline](../phase3/3L-R1-framework-native-proportional-qualification-rebaseline.md)**  
> **[3L-R2 — Managed Execution & Deciding Evidence Proportional Rederivation](../phase3/3L-R2-managed-execution-deciding-evidence-proportional-rederivation.md)**

`3L-R1` supersedes the exact historical Package-B / Package-C route and realization rows named by that decision. `3L-R2` supersedes only the stale Package-D / Package-E `REQUIRE PROPORTIONAL REDERIVATION` routing/realization clauses and the rejected delayed-occurrence candidate; neither amendment weakens the structural owner/invariant architecture.

Current route:

```text
BT-3A = NOT NEXT
BT-3A = COMPLETE / native schema route rejected
BT-3N = PASS / LEAD-ADJUDICATED / PASS_NATIVE_HITL_OWNER_BOUNDARY
BT-4N = PASS / LEAD-ADJUDICATED / PASS_NATIVE_SCHEDULE_INGRESS
BT-5N = PASS / LEAD-ADJUDICATED / QUALIFIED_SAME_PROCESS
CX-AGENT-MASTRA-01 = QUALIFIED FOR CURRENT F1 TESTED PROPERTIES
CX-RUNTIME-ISOLATION-01 = QUALIFIED_SAME_PROCESS FOR ENABLED F1 SURFACES
Package B = CLOSED / LEAD-ADJUDICATED / QUALIFIED FOR CURRENT F1 TESTED PROPERTIES
Package C = DEFER SAFELY / NOT EXECUTED
Package D = CLOSED / LEAD-ADJUDICATED / QUALIFIED_TRANSACTIONAL_MANAGED_OCCURRENCE_ADMISSION
Package E = DEFER SAFELY / NO PRE-C-018 RUNTIME PROBE
3L completeness/deletion check = PASS
FINAL INDEPENDENT FABLE REVIEW = NEXT
3L = IN PROGRESS
3M = NOT STARTED
Product implementation = BLOCKED
C-018 = NOT RATIFIED
```

Detailed Package-D acceptance is recorded in [3L-D final lead closure](../phase3/3L-D-final-lead-closure.md). The current critical-path deletion result is recorded in the [3L preclosure completeness/deletion check](../phase3/3L-preclosure-completeness-deletion-check.md). Historical Evidence and authority remain preserved; no executor may re-run closed probes or execute deferred Packages by inheritance.

Historical pre-3L-R2 route, retained only for provenance and superseded by 3L-R2 plus the Package-D closure: `Packages D/E = NOT EXECUTED / REQUIRE PROPORTIONAL REDERIVATION`.

---

## 2. What Conexus is

> **Conexus is an AI-first enterprise software platform for building, evolving and operating business applications and Product Agents over real enterprise systems and data, with reusable enterprise knowledge, governed authority, verifiable engineering and truthful operational evidence.**

Four coherent Product strengths:

```text
Conexus Builder / Harness
Enterprise Brain
Business Applications / Capabilities / Integrations
Product Agents
```

F1 remains company/internal-first. Later SaaS evolution is real but does not justify speculative F1 machinery.

First vertical:

```text
Analisador Inteligente de Orçamentos — Sankhya
```

The first vertical remains intentionally read-only and does not need a fake Product Agent or write path merely to exercise infrastructure.

---

## 3. Current Product and architecture authorities

### Product meaning

> **[PRODUCT-CONTRACT.md](PRODUCT-CONTRACT.md)**

Owns the current accepted projection of:

```text
North Star
users / Product concepts
whole-product journeys
F1 / NEXT / FUTURE / REJECTED scope
Product invariants
whole-product scenario gate
success criterion
```

### Structural architecture

> **[ARCHITECTURE-BASELINE.md](ARCHITECTURE-BASELINE.md)**

Owns the accepted structural projection of:

```text
semantic owners / module boundaries
persistence authorities
Builder / E2B
Brain / Connections / Gateway
Registry / Release / Promotion
PAR
Builder ↔ PAR isolation
managed application runtime
security / trust zones
data / environments / migrations
frontend / scaffold
first-production topology
```

`3L-R1` currently supersedes only the exact Mastra realization, RequestContext, active-run recovery, scheduler-routing and F1 model-economics clauses enumerated in its supersession map. `3L-R2` clarifies Package-D/E technology realization inside existing MAR/OBS boundaries: pg-boss is private MAR mechanics inside the existing `mar` schema for the current candidate, and Package E remains deferred with a corrected Mastra-observability dependency basis. Neither creates a new owner, durable record class, Conexus schema or database.

### Historical reconciliation

> **[DECISION-RECONCILIATION.md](DECISION-RECONCILIATION.md)**

Use it to determine what survives, what was refined/superseded and where detailed semantic authority lives.

---

## 4. Current whole-system map

```text
Workspace — sovereign isolation/resource root
│
├── Projects
│   ├── Project Baseline
│   ├── Changes / Plan / Work Units / Builder runs
│   ├── Data / Capabilities / Integrations
│   ├── explicit Brain / Connection bindings
│   ├── Product Agents
│   ├── Releases / Published Application
│   └── admitted managed jobs when required
│
├── canonical Workspace Brain
└── reusable Workspace-scoped Connections

Trusted Conexus Hub
├── Node/TypeScript modular monolith
├── PostgreSQL authoritative owner state
├── Capability Gateway
├── Builder control runtime
├── Production Agent Runtime — PAR
└── Managed Application Runtime — MAR

Builder
→ Change-scoped CodingSession
→ Mastra AgentController
→ Mastra Workspace
→ E2B

Product Agent
→ exact active Release
→ RuntimeAgentProjection
→ ParMastra
→ direct Mastra Agent
→ bounded tools
→ Conexus owners / Gateway
```

Core law:

> **Mechanism ≠ Authority.**

Mastra, E2B, PostgreSQL, Git, telemetry, provider state, framework memory, queue state and scheduler/timer state never become Product/business authority merely because they persist or execute something.

---

## 5. Current authority truths worth carrying into implementation

```text
Workspace != Project
Change != WorkUnit != Builder ActorRun
Builder ActorRun != Product AgentRun != Gateway EffectAttempt != Promotion
Project Git != Workspace Brain Git != hub_control != Project DB != Registry/CAS
Control Plane != Preview != Published App authorization
administer != use
approval binds one exact sealed subject
OUTCOME_UNKNOWN != safe retry
Release is exact immutable composition; no mutable latest
telemetry/trace != owner terminal truth
Brain != agent/runtime memory
future seam != dormant implementation
selected architecture != qualified behavior
stale runtime state != current Product authority
queue/timer state != managed-job admission authority
```

Current mutable authorization is always server/owner-derived at protected points.

---

## 6. Current Mastra realization — 3L-R1

The framework-first review used:

```text
repo-installed official Mastra skill
→ .agents/skills/mastra/SKILL.md

Context7
→ /mastra-ai/mastra

exact Package-B lock/source
→ @mastra/core 1.56.0
→ @mastra/memory 1.25.0
→ @mastra/pg 1.19.0
→ PostgreSQL 17.10
```

Current mapping:

| Need | Current realization |
|---|---|
| Product Agent | direct Mastra `Agent` |
| Conversation | Mastra Memory with explicit Conexus-derived thread/resource scoping |
| runtime/config context | Mastra `RequestContext`, subordinate and non-authoritative |
| risky tool pause | native `requireApproval` |
| Product approval authority | PAR `ApprovalRequest` |
| effect authority | Capability Gateway |
| generic in-tool information wait | tool `suspend()` only when actually needed |
| approval wait surviving process restart | direct Agent + persistent suspended-run discovery/continuation |
| active-run automatic crash recovery | `DurableAgent` — DEFER SAFELY |
| universal Workflow wrapper around Product Agent | REJECT F1 baseline |
| Product-Agent cron mechanics | native Mastra Scheduler substrate |
| scheduled occurrence → execution | must cross narrow PAR admission seam before AgentRun/model execution |
| Builder/PAR role isolation | separate BuilderMastra / ParMastra instances; qualified for enabled F1 surfaces |

### RequestContext correction

```text
Mastra RequestContext
= runtime / request / configuration / correlation substrate
!= Product/business authority
```

BT-3/BT-3A proved that stale omitted snapshot keys may physically survive resume. They also established that early dynamic Agent shaping uses the fresh caller RequestContext before that backfill in the pinned path.

Therefore the correct invariant is semantic, not object-cleanliness:

> stale raw runtime context may not authorize any current governed Product decision.

Governed tools/Gateway must consume/revalidate current Conexus owner truth rather than trust arbitrary raw `RequestContext` keys.

No `RuntimeContextService`, generic authority service, new owner, new database or universal context bus is admitted.

---

## 7. Current Package-B Evidence

Exact Package-B lock SHA-256:

```text
5e8b2b4ea2ef5ae5676652cdbafd8c7c284be68cfc445de92950b2decdc8a4f0
```

```text
BT-1
Direct exact Agent / mutable-selector negative control
= PASS

BT-2
Conversation / Memory thread-resource isolation on PostgreSQL
= PASS

BT-3
genuine suspend → persisted snapshot → process loss → fresh-process rediscovery/resume
fresh same-key value wins
unknown stale omitted key survives
= REAL BEHAVIOR PROVEN / MECHANISM FINDING

BT-3A
requestContextSchema as post-merge closed authority view
= FALSIFIED BY PINNED SOURCE
= FAIL_SCHEMA_OR_NATIVE_GUARD_INSUFFICIENT

BT-3N
static native requireApproval → PostgreSQL suspension → process loss → fresh-process rediscovery
stale raw RequestContext physically observable but not authoritative
current owner DENY → effect 0
current owner ALLOW → effect exactly 1
native decline → tool boundary 0 / effect 0
= EXECUTION COMPLETE / PASS_NATIVE_HITL_OWNER_BOUNDARY
= PASS / LEAD-ADJUDICATED
```

This does **not** establish Mastra incompatibility and does not reopen Product architecture.

Current route:

```text
BT-3N = PASS / LEAD-ADJUDICATED / PASS_NATIVE_HITL_OWNER_BOUNDARY
BT-4N = PASS / LEAD-ADJUDICATED / PASS_NATIVE_SCHEDULE_INGRESS
BT-5N = PASS / LEAD-ADJUDICATED / QUALIFIED_SAME_PROCESS
CX-AGENT-MASTRA-01 = QUALIFIED FOR CURRENT F1 TESTED PROPERTIES
CX-RUNTIME-ISOLATION-01 = QUALIFIED_SAME_PROCESS FOR ENABLED F1 SURFACES
Package B = CLOSED / LEAD-ADJUDICATED / QUALIFIED FOR CURRENT F1 TESTED PROPERTIES
Package C = DEFER SAFELY / NOT EXECUTED
Package D = CLOSED / LEAD-ADJUDICATED / QUALIFIED_TRANSACTIONAL_MANAGED_OCCURRENCE_ADMISSION
Package E = DEFER SAFELY / NO PRE-C-018 RUNTIME PROBE
Product implementation = BLOCKED
C-018 = NOT RATIFIED
```

Historical pre-execution route, superseded by the executor record above: `BT-5N = NEXT / EXECUTION AUTHORIZED`.

BT-3N proves native HITL + restart + current-owner authority boundary. BT-4N is lead-adjudicated `PASS_NATIVE_SCHEDULE_INGRESS`. BT-5N is lead-adjudicated `QUALIFIED_SAME_PROCESS` for the currently enabled F1 Mastra surfaces; Package B is closed for the tested properties.

The accepted fresh CI observation is bound to executor HEAD `b712dc289a82feb8f0f5edc9d9d579ad18848226`: 28/28 Package-B tests passed; the RED wiring guard and shared-PubSub negative control fired; Builder and PAR each executed one workflow and one local model fixture call; provider calls, E2B calls and real external effects remained zero. Disabled scorer/evaluation, DurableAgent and Observational Memory globals remain deferred and trigger requalification before enablement.

---

## 8. Package C — current F1 route

Operator-ratified classification:

```text
Package C pre-C-018 execution = DEFER SAFELY FOR F1
```

Deferred now:

```text
model benchmarking/calibration program
quality-price model routing
cheapest-model selection
automatic provider/model optimizer
sophisticated fallback cascade
invoice-bound per-run cost machinery
pre-provider maximum-liability reservation subsystem
customer quota/billing machinery
```

F1 still requires a bounded posture:

```text
small explicit model/provider allowlist
no automatic fallback cascade
bounded/disabled hidden retries where controllable
strict retry limits
explicit Agent/loop/tool-step limits
provider/account spending caps where available
usage/token/cost telemetry with MISSING != ZERO
truthful visible failure when unavailable
```

Reopen stronger model-economics machinery for commercialization/billing/quotas, automatic multi-provider routing, sophisticated fallback, contractual per-run budgets, high-autonomy material cost exposure or real evidence that the bounded posture is insufficient.

---

## 9. Package D/E — current route from 3L-R2

### Package D — Managed Execution

Architecture-Lead adjudication projected after the operator-authorized probe:

```text
Package D = CLOSED / LEAD-ADJUDICATED
probe = DT-1' — Transactional Managed-Occurrence Admission
probe = EXECUTED / EVIDENCE ACCEPTED
verdict = QUALIFIED_TRANSACTIONAL_MANAGED_OCCURRENCE_ADMISSION
Material Finding = 0
reviewed executor HEAD = ab6b1841e585b9cafbf8ea04290505832fa1b952
```

Current candidate realization:

```text
pg-boss 12.26.3
→ database = hub_control
→ schema = existing mar owner schema
→ private substrate objects only
→ vendor DDL folded into the one hub_control migration lineage
→ runtime createSchema=false / migrate=false / schedule=false

MAR recurrence
→ startup + process-local wake tick
→ owner reconciliation from current served Release + exact job config + durable sync freshness
→ at most one immediate admitted JobRun when due
→ no rolling future JobRun
→ no nominal missed-slot walk
```

Owner uniqueness on the logical occurrence is the primary correctness fence. pg-boss job identity/policy is projection mechanics only. `boss.send(...) === null` is fail-closed, never successful admission.

For version locking, a managed JobRun becomes admitted/in-flight at its durable admission commit; physical `RUNNING` begins at worker execution. A later Release handoff blocks new old-Release admissions but does not rewrite an already committed exact-pin JobRun.

[`DT-1'` final closure](../phase3/3L-D-final-lead-closure.md) accepts P1–P6 and R1–R3 under the exact pinned stack and confirms owner `INSERT` + `boss.send(...)` through the same physical PostgreSQL transaction adapter. Queue state remains mechanics, never Product authority. The qualification covers only the tested transaction/race/fresh-process/queue-not-authority composition; it does not establish Product MAR, Release, Gateway, sync/ETL, Sankhya, provider/model/E2B, cron, future scheduling or recovery correctness.

### Package E — Deciding Evidence

```text
Package E = DEFER SAFELY
pre-C-018 runtime probe = NONE
```

Exact Package-B source/lock review corrected one factual basis:

```text
@mastra/core 1.56.0
→ public observability contracts/types + no-op path
→ not the concrete full observability implementation

@mastra/observability
→ named F1 realization dependency for the accepted Mastra observability path
→ version UNPINNED
→ C-016 admission NOT PERFORMED
→ first acquisition triggers exact pin/lock/supply-chain admission
```

Future integration remains public Mastra observability → Conexus-authored `ObservabilityExporter` → server-side owner/trust binding → `obs.operational_event`. `MastraStorageExporter` may be diagnostics-only; Conexus must not cross-read `mastra_builder`/`mastra_par` as its OBS truth path. Missing/drop-free telemetry never implies completeness; required evidence missing remains `NOT_PROVEN / INCONCLUSIVE`.

---

## 10. Current technology state

| Surface | Status |
|---|---|
| Hub Node/TS modular monolith | **ARCHITECTURE CURRENT** |
| PostgreSQL | **ARCHITECTURE CURRENT** — major 17; probe pin 17.10 |
| Builder Mastra | **QUALIFIED for Package-A tested properties** |
| E2B | **QUALIFIED WITH REQUIRED PHYSICAL-INCARNATION GUARD** |
| native Codex OAuth | **QUALIFIED for Package-A tested path** |
| Builder Observational Memory | **EVALUATED / KEEP OFF** |
| direct Mastra Product Agent | **QUALIFIED FOR CURRENT F1 TESTED PROPERTIES / PACKAGE B CLOSED** |
| native Product-Agent approval/restart route | **BT-3N PASS / LEAD-ADJUDICATED / PASS_NATIVE_HITL_OWNER_BOUNDARY** |
| native Product-Agent schedule ingress | **BT-4N PASS / LEAD-ADJUDICATED / PASS_NATIVE_SCHEDULE_INGRESS** |
| BuilderMastra ↔ ParMastra same-process isolation | **QUALIFIED_SAME_PROCESS FOR ENABLED F1 SURFACES** |
| advanced per-run model-economics machinery | **DEFER SAFELY FOR F1** |
| managed execution / Package D | **CLOSED / LEAD-ADJUDICATED / QUALIFIED_TRANSACTIONAL_MANAGED_OCCURRENCE_ADMISSION** |
| deciding Evidence / Package E | **DEFER SAFELY / NO PRE-C-018 RUNTIME PROBE / SOURCE BASIS CORRECTED** |
| React/TS/Vite/TanStack paved road | **ARCHITECTURE CURRENT / first-build conformance pending** |
| private Linux-guest first-production topology | **ARCHITECTURE CURRENT FOR FIRST INSTALLATION / activation proof pending** |

Never upgrade a weaker status to `QUALIFIED` merely because a technology appears in architecture or docs.

---

## 11. Explicit future/deferred seams still remembered

Among the current deferred seams:

```text
SaaS signup/billing/customer operations
SaaS ↔ private/on-prem reachability
multi-repo Project
cross-Workspace exchange
DEDICATED physical deployment
HA/PITR/multi-host topology
advanced Product Agent memory / Semantic Recall / OM / Extractors
EVENT triggers
DurableAgent active-run recovery / reconnect-to-same-stream
Agent-as-tool / subagents / networks
MCP/A2A external Agent clients
Product Agent browser/source/workspace access
Connection pools/failover
Vault/KMS/HSM / per-secret envelope
SSO/SCIM/passkeys
public/embed apps
richer app role/data scoping
Brain vector/RAG index
advanced model economics per 3L-R1 reopen triggers
Package-D RUNNING-orphan / cancel / timeout / partial-progress recovery → 3M
real OBS ingestion/trust/correlation implementation → first-build / 3M / 3N/3O
```

Deferred means remembered with a seam/trigger, not secretly implemented.

---

## 12. Explicit F1 non-architecture

Do not resurrect by history or framework convenience:

```text
Pi as primary Builder
fresh cognitive reset every WorkUnit
guest model-provider key
Mastra Stored/Editor/latest Agent authority
Vercel AI SDK as Product Agent authority
generic Workflow/Scheduler/Automation business domain
universal RuntimeContext/Authority service
UniversalEnvelope
Universal Tool/ResourceBinding/Status/Secret/Budget service
generic RuntimeBus/EventBus/outbox without a named failure class
shared mutable cross-Project DB/runtime state
memory/RAG framework as Brain authority
browser/frontend authorization authority
generic agent_event owner/table
public Internet first-installation ingress
rolling future managed JobRun as F1 recurrence baseline
pg-boss cron/schedule as managed-sync admission authority
Mastra Scheduler as MAR baseline
JobSchedule / ScheduleOccurrence authority
Conexus cross-read of Mastra observability vendor tables
```

Native framework mechanisms may be used where admitted; they do not create similarly named Conexus business owners.

---

## 13. Program state right now

```text
3A Architecture Reconciliation     CONTINUOUS through C-018
3A-R11                              CLOSED / APPROVED / OPERATOR RATIFIED
3B System Context                  CLOSED / APPROVED
3C Module Architecture             CLOSED / APPROVED
3D Dependency Architecture         CLOSED / APPROVED
3E Data Architecture               CLOSED / APPROVED
3F Contracts/API                   CLOSED / APPROVED
3G Behavioral/State                CLOSED / APPROVED
3H Runtime/Agent                   CLOSED / APPROVED; selected mechanisms amended by 3L-R1
3I Security/Authority              CLOSED / APPROVED; F1 model-spend mechanism routing amended by 3L-R1
3J Deployment/Operations           CLOSED / APPROVED
3K Frontend/Product                CLOSED / APPROVED

3L Technology Qualification        IN PROGRESS
  Q0                               COMPLETE / evidence discipline retained / route amended by 3L-R1 + 3L-R2
  Package A                        COMPLETE
  Package B                        CLOSED / LEAD-ADJUDICATED / QUALIFIED FOR CURRENT F1 TESTED PROPERTIES
    BT-1                           PASS
    BT-2                           PASS
    BT-3                           BEHAVIOR PROVEN / MECHANISM FINDING
    BT-3A                          COMPLETE / NATIVE SCHEMA ROUTE REJECTED
    BT-3N                          PASS / LEAD-ADJUDICATED / PASS_NATIVE_HITL_OWNER_BOUNDARY
    BT-4N                          PASS / LEAD-ADJUDICATED / PASS_NATIVE_SCHEDULE_INGRESS
    BT-5N                          PASS / LEAD-ADJUDICATED / QUALIFIED_SAME_PROCESS
  CX-AGENT-MASTRA-01              QUALIFIED FOR CURRENT F1 TESTED PROPERTIES
  CX-RUNTIME-ISOLATION-01         QUALIFIED_SAME_PROCESS FOR ENABLED F1 SURFACES
  Architecture-Lead / Package-B   CLOSED / LEAD-ADJUDICATED
  Package C                        DEFER SAFELY / NOT EXECUTED
  Package D                        CLOSED / LEAD-ADJUDICATED / QUALIFIED_TRANSACTIONAL_MANAGED_OCCURRENCE_ADMISSION
  Package E                        DEFER SAFELY / NO PRE-C-018 RUNTIME PROBE
  3L-R2                            APPROVED / OPERATOR RATIFIED 2026-08-20
  3L completeness/deletion check  PASS / ARCHITECTURE-LEAD COMPLETE
  final independent Fable review  NEXT

3M Failure & Recovery              NOT STARTED
3N Architecture Verification       NOT STARTED
3O Vertical Proof Contract         NOT STARTED
C-018                              NOT RATIFIED
Implementation                     BLOCKED
```

---

## 14. Exact next action

> **Perform ONE final independent Fable review of the complete 3L package.**

Package A is **COMPLETE**. Package B and Package D are **CLOSED / LEAD-ADJUDICATED** for their exact tested properties. Package C and Package E remain **DEFER SAFELY**.

The [3L preclosure completeness/deletion check](../phase3/3L-preclosure-completeness-deletion-check.md) is `PASS`, with `remaining material 3L technology question = 0`, but 3L remains **IN PROGRESS** until the final independent review is adjudicated.

Use the [final independent Fable review handoff](../phase3/3L-FABLE-FINAL-INDEPENDENT-REVIEW-HANDOFF.md). Do not self-execute another probe, start 3M, ratify C-018, implement Product code, change PR #40 from Draft or merge by inheritance.

---

## 15. Phase-3 status router

The Phase-3 `LEDGER.md` projects the current 3L route from:

```text
docs/conexus/phase3/3L-R1-framework-native-proportional-qualification-rebaseline.md
docs/conexus/phase3/3L-R2-managed-execution-deciding-evidence-proportional-rederivation.md
```

For all Phase-3 status/detail, the LEDGER remains the live router. Historical pre-rebaseline Package-D/E candidates and BT-3A documents remain Evidence and do not re-authorize execution.
