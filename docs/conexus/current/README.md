# Conexus — Current Product & Architecture Entrypoint

> **Status:** CURRENT / ACCEPTED BY 3A-R11 OPERATOR RATIFICATION\
> **Whole-product checkpoint:** 3A-R11 CLOSED / APPROVED
> **R11-H:** APPROVED / OPERATOR RATIFIED 2026-08-18
> **Phase 3:** IN PROGRESS  
> **Technology Qualification:** 3L IN PROGRESS / Q0 COMPLETE / PACKAGE A COMPLETE  
> **Package B:** IN PROGRESS / BT-1 PASS / BT-2 PASS / BT-3 MERGE BEHAVIOR CONFIRMED / BT-3A NEXT — EXECUTION AUTHORIZED / BT-4..BT-5 BLOCKED
> **C-018:** NOT RATIFIED  
> **Product implementation:** BLOCKED  
> **PR #40:** DRAFT / NO MERGE AUTHORIZATION  

This page is the canonical short entrypoint to the **current Conexus Product and architecture**.

The operator ratified this current tree through 3A-R11. Detailed accepted authority still controls if any current-tree projection disagrees with its semantic home.

---

## 1. What Conexus is

> **Conexus is an AI-first enterprise software platform for building, evolving and operating business applications and Product Agents over real enterprise systems and data, with reusable enterprise knowledge, governed authority, verifiable engineering and truthful operational evidence.**

Its four coherent Product strengths are:

```text
Conexus Builder / Harness
Enterprise Brain
Business Applications / Capabilities / Integrations
Product Agents
```

F1 is company/internal-first. Later SaaS evolution remains a real Product direction but does not justify speculative F1 machinery.

First vertical:

```text
Analisador Inteligente de Orçamentos — Sankhya
```

It is intentionally read-only and does not require a fake Product Agent or write just to exercise platform infrastructure.

---

## 2. Read the current tree

### Need to understand the Product?

Read:

> **[PRODUCT-CONTRACT.md](PRODUCT-CONTRACT.md)**

It owns the current accepted projection of:

```text
North Star
users / Product concepts
whole-product journeys
F1 / NEXT / FUTURE / REJECTED scope
Product invariants
whole-product scenario gate
success criterion
```

### Need to understand how it is architected?

Read:

> **[ARCHITECTURE-BASELINE.md](ARCHITECTURE-BASELINE.md)**

It owns the current accepted projection of:

```text
semantic owners and boundaries
persistence authorities
Builder / E2B
Brain / Connections / Gateway
Registry / Release / Promotion
Production Agent Runtime (PAR)
Builder ↔ PAR isolation
managed execution
model spend
F5 / observability
security / trust zones
data / environments / migrations
frontend / scaffold
first-production topology
technology qualification state
future seams / reopen triggers
```

### Found an older decision that says something different?

Read:

> **[DECISION-RECONCILIATION.md](DECISION-RECONCILIATION.md)**

It answers:

```text
what survives?
what was refined?
what was partially/fully superseded?
where is the current detailed semantic home?
what must not resurrect by inheritance?
what remains genuinely deferred?
```

Do **not** choose the oldest/newest document by date alone.

### Need exact Phase-3 status or detailed accepted authority?

Read:

```text
docs/conexus/phase3/LEDGER.md
→ exact accepted 3A/3B/3C/... authority named for the question
```

After R11 closure, the live Phase-3 router requires:

```text
3A-R11 = CLOSED / APPROVED / OPERATOR RATIFIED
Package B = IN PROGRESS
B0 = EXECUTION COMPLETE / LEAD-ADJUDICATED / PASS
Proof-routing amendment = APPROVED / CURRENT
BT-1 = PASS
BT-2 = PASS
BT-3 observed Mastra merge behavior = CONFIRMED EVIDENCE
BT-3 architecture contradiction = NOT YET ESTABLISHED
BT-3A = NEXT / EXECUTION AUTHORIZED
BT-4..BT-5 = BLOCKED
52 B1-01..B4-18 obligations = PRESERVED DOWNSTREAM PROOF INVENTORY / NOT LITERAL PRE-C-018 EXECUTION
CX-AGENT-MASTRA-01 = NOT QUALIFIED / BT-3A PENDING
CX-RUNTIME-ISOLATION-01 = NOT PROVEN / BT-5 NOT EXECUTED
```

---

## 3. Current whole-system map

```text
Workspace — sovereign isolation/resource root
│
├── Projects
│   ├── Project Baseline
│   ├── Changes / Plan / Work Units / Builder runs
│   ├── Data / Capabilities / Integrations
│   ├── private Project-scoped Connections / explicit bindings
│   ├── Product Agents
│   ├── Releases / Published Application
│   └── managed jobs when the Project requires them
│
├── Brain
│   └── explicit ProjectBrainBinding
│
└── reusable Workspace-scoped Connections
    └── Project use through explicit ProjectConnectionBinding

Trusted Conexus Hub
├── Node/TypeScript modular monolith
├── PostgreSQL authoritative owner state
├── Capability Gateway
├── Builder control runtime
├── Production Agent Runtime (PAR)
└── Managed Application Runtime

Builder
→ persistent Change-scoped CodingSession
→ Mastra AgentController
→ Mastra Workspace
→ E2B

Product Agent
→ exact active Release
→ RuntimeAgentProjection
→ direct Mastra Agent
→ bounded ToolProjection
→ Conexus owners / Gateway
```

Key rule:

> **Mechanism ≠ Authority.**

Mastra, E2B, PostgreSQL, Git, telemetry, provider state and framework persistence never become Product/business authority by convenience.

---

## 4. Current authority truths worth knowing first

```text
Workspace != Project
Change != WorkUnit != Builder ActorRun
Builder ActorRun != Product AgentRun != Gateway EffectAttempt != Promotion
Project Git != Workspace Brain Git != hub_control != Project DB != Registry/CAS
Workspace owns the canonical Brain; the Connections module owns one Connection lifecycle
with ownerScope WORKSPACE | PROJECT, and Project use pins an exact revision through
explicit ProjectConnectionBinding
Project ARCHIVED freezes ordinary authoring/future intent expansion; it does not unpublish,
stop current serving, stop pre-existing enabled Product-Agent triggers or stop existing
managed recurrence by itself; explicit trigger DISABLE remains allowed narrowing
Control Plane != Preview != Published App authorization
administer != use
approval binds one exact sealed subject
OUTCOME_UNKNOWN != safe retry
Release is exact immutable composition; no mutable latest
telemetry/trace != owner F5/terminal truth
Product-Agent SCHEDULE overlap is consumed SKIPPED with no backlog/catch-up;
MAR managed-sync downtime may admit at most one catch-up when freshness is behind
ordinary telemetry missing may degrade; audit-required persistence failure is FAIL CLOSED;
verification-required Evidence missing is NOT_PROVEN/INCONCLUSIVE
Brain != agent/runtime memory
future seam != dormant implementation
selected architecture != qualified behavior
```

---

## 5. Current technology state

| Surface | Current status |
|---|---|
| Hub | **ARCHITECTURE CURRENT** — Node/TS modular monolith |
| PostgreSQL | **ARCHITECTURE CURRENT** — major 17; Q0 deciding probe 17.10 |
| Builder Mastra | **QUALIFIED for Package-A tested properties** |
| E2B | **QUALIFIED WITH REQUIRED PHYSICAL-INCARNATION GUARD** |
| native Codex OAuth | **QUALIFIED for Package-A tested path** |
| Builder Observational Memory | **EVALUATED / KEEP OFF** |
| direct Mastra Product Agent | **ARCHITECTURE CURRENT / PACKAGE B NOT QUALIFIED** |
| BuilderMastra ↔ ParMastra same-process isolation | **ARCHITECTURE CURRENT / PACKAGE B NOT QUALIFIED** |
| model-spend pre-provider enforcement | **CURRENT OBLIGATION / PACKAGE C NOT QUALIFIED** |
| managed execution | **CURRENT SEMANTICS / PACKAGE D NOT QUALIFIED** |
| pg-boss 12.26.3 | **PACKAGE D CANDIDATE / NOT AUTHORITY** |
| deciding F5/observability surfaces | **CURRENT SHAPE / PACKAGE E NOT QUALIFIED** |
| React/TS/Vite/TanStack paved road | **ARCHITECTURE CURRENT / first-build conformance pending** |
| first-production private Linux-guest topology | **ARCHITECTURE CURRENT FOR FIRST INSTALLATION / activation proof pending** |

Never upgrade a weaker status to `QUALIFIED` merely because a technology appears in the architecture.

---

## 6. Current first-production shape

First installation only — not universal SaaS topology:

```text
existing company physical server
→ Windows host
→ dedicated Linux production guest
→ one Node/TS Hub process
→ co-located but capability-isolated PostgreSQL/Mastra/backings
```

Ingress:

```text
company LAN + HTTPS
OR
existing corporate VPN → private network + HTTPS
```

```text
public Internet ingress F1 = NONE
```

E2B remains remote Builder guest execution; it does not hold durable Hub/ERP/Git/model-provider credentials.

---

## 7. Current Product scope in plain language

F1 is intended to let a real operator/company:

```text
create/enter a Workspace
→ create/import a Project
→ discover requirements/data/source reality
→ approve a sufficient Project Baseline
→ ask Conexus to build/evolve the software
→ inspect Plan / progress / Preview / Code / Diff / Data / Capabilities / Integrations / Brain / Agents / Versions / Activity
→ discover/publish reusable Brain meaning with human authority
→ bind real enterprise systems through qualified Connections
→ verify candidates with mechanical/runtime/business Evidence
→ create exact Releases
→ promote and prove what is actually served
→ let business users use Published Apps independently from Builder access
→ create/evolve/use Project-owned Product Agents under the same Change/Release laws
→ approve exact external effects when required
→ operate admitted managed sync/jobs without a workflow platform
→ inspect truthful cost/tokens/duration/provenance/failures
→ restore/recover without fabricating authority
```

---

## 8. Important current Product capabilities that must not be lost

The rebaseline deliberately preserves, among others:

```text
visual/proportional Change Plan
Hub-owned live execution checklist
`tasks.md` purpose/context memory — not operational state
Platform Consultant / contextual Conexus assistant
Brain assisted Discovery — machine propose / human decide
Brain health/drift/conformance
static Query + restricted AnalyticQuery read regimes
closed ApplicationRuntimeProfile = MANAGED | DEDICATED inside one Factory
Project duplication — no data/credentials/bindings by default
private-by-default attachment/blob access
Golden Budget Analyzer benchmark
Conexus Worker Eval for real runtime/model comparison
per-run/model token/cost/duration visibility with missing != zero
Release/EnvironmentConformance/migration/served-verification discipline
```

---

## 9. Explicitly future/deferred — remembered, not built now

```text
SaaS signup/billing/customer operations
SaaS↔private/on-prem authenticated reachability
multi-repo Project
cross-Workspace exchange
DEDICATED physical deployment
HA/PITR/multi-host topology
external SLA monitoring
advanced Product Agent memory / Semantic Recall / OM / Extractors
EVENT triggers
Durable Agent reconnect-to-same-stream
Agent-as-tool / subagents / networks
MCP/A2A external Agent clients
Product Agent browser/source/workspace access
Connection pools/failover
Vault/KMS/HSM / per-secret envelope
SSO/SCIM/passkeys
public/embed apps
richer app role/data scoping
Brain vector/RAG index
```

Reopen when a **real consumer, changed requirement, new reachable failure mode or external constraint** fires the seam.

---

## 10. Explicit F1 non-architecture

Do not resurrect by history/framework convenience:

```text
Pi as primary Builder
fresh cognitive reset every WorkUnit
guest model-provider key
Vercel AI SDK Product Agent authority
Mastra Stored/Editor/latest Agent authority
Mission/Milestone/Fleet work model
generic Workflow/Scheduler/Automation domain
UniversalEnvelope
mutable artifact-registration API as authoring authority
universal Tool/ResourceBinding/Status/Secret/Budget services
shared mutable cross-Project DB/runtime state
memory/RAG framework as Brain authority
browser/frontend authorization authority
URL-fragment Published App auth
mandatory universal chat widget/postMessage protocol
PROD as forked logical Project
“security later because F1 is internal”
generic `agent_event` owner/table
public Internet first-installation ingress
```

---

## 11. Program state right now

```text
3A Architecture Reconciliation     CONTINUOUS through C-018
3B System Context                  CLOSED / APPROVED
3C Module Architecture             CLOSED / APPROVED
3D Dependency Architecture         CLOSED / APPROVED
3E Data Architecture               CLOSED / APPROVED
3F Contracts/API                   CLOSED / APPROVED
3G Behavioral/State                CLOSED / APPROVED
3H Runtime/Agent                   CLOSED / APPROVED
3I Security/Authority              CLOSED / APPROVED
3J Deployment/Operations           CLOSED / APPROVED
3K Frontend/Product                CLOSED / APPROVED
3L Technology Qualification        IN PROGRESS
  Q0                               COMPLETE
  Package A                        COMPLETE
  Package B                        IN PROGRESS / BT-3A EXECUTION AUTHORIZED
    BT-1                           PASS
    BT-2                           PASS
    BT-3                           MERGE BEHAVIOR CONFIRMED / CONTRADICTION NOT YET ESTABLISHED
    BT-3A                          NEXT / EXECUTION AUTHORIZED
    BT-4..BT-5                     BLOCKED
    B1-01..B4-18                   DOWNSTREAM PROOF INVENTORY / NOT LITERAL PRE-C-018 EXECUTION
  Packages C–E                     NOT STARTED
3M Failure & Recovery              NOT STARTED
3N Architecture Verification       NOT STARTED
3O Vertical Proof Contract         NOT STARTED
C-018                              NOT RATIFIED
Implementation                     BLOCKED
```

R11 itself:

```text
R11-A Authority Census             COMPLETE
R11-B Decision Reconciliation      CURRENT / ACCEPTED
R11-C Product Contract             CURRENT / ACCEPTED
R11-D Architecture Baseline        CURRENT / ACCEPTED
R11-E Coherence Round 1            COMPLETE / 14 projection findings
R11-E Coherence Round 2            COMPLETE / 14 closed / 0 material findings
R11-F Fresh Actor review           COMPLETE / PASS
R11-G independent Fable review     COMPLETE / BOUNDED CORRECTION REQUIRED
Fable finding adjudication         COMPLETE / FBL-01..17 ACCEPTED
Round-3 Fable corrections          APPLIED
Closure-keyed pass                 FOUND R3C-01..08
Round-3.1 projection correction    APPLIED / VERIFIED
Final GPT authority review         COMPLETE / PASS
R11-H operator ratification        APPROVED / 2026-08-18
R11 closure                        CLOSED / ACCEPTED
```

---

## 12. Exact next action

> **Execute only the operator-ratified [BT-3A Context Authority Discriminant](../phase3/3L-B-BT3A-context-authority-discriminant.md) against the existing exact Package-B lock and return Evidence for Architecture-Lead adjudication. Do not execute BT-4/BT-5 or close BT-3.**

Product implementation remains blocked; C-018 is not ratified, and PR #40 has no merge authorization.

---

## 13. Canonical read path

```text
AGENTS.md
→ DevelopmentConexus Engineering Method
→ docs/DOCUMENTATION-MAP.md
→ docs/conexus/current/README.md
→ PRODUCT-CONTRACT.md / ARCHITECTURE-BASELINE.md / DECISION-RECONCILIATION.md as needed
→ docs/conexus/phase3/LEDGER.md for Phase-3 status/detail while Phase 3 remains active
→ exact accepted detailed semantic authority
→ deciding Evidence/current implementation only when material
```

Historical C-/3A–3L documents remain available for exact rationale, provenance and reopen analysis. They stop being the route by which a Fresh Actor has to reconstruct the present from scratch.
