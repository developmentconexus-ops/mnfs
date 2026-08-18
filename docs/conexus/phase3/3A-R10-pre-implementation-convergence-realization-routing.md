# 3A-R10 — Pre-Implementation Convergence & Realization Routing

**Status:** APPROVED pelo operador em 2026-08-18  
**Fase:** 3A — Architecture Reconciliation contínua até C-018  
**Natureza:** bounded pre-implementation convergence checkpoint / routing reconciliation  
**Método:** DevelopmentConexus Engineering Method v1.0.0  
**Importante:** esta decisão não constitui C-018, não encerra a Fase 3, não autoriza implementação de produto, não autoriza merge do PR #40 e não transforma Realization Planning em segunda architecture authority.

## Decisão em uma frase

Antes de iniciar 3L ou permitir futura tradução para código, o Conexus compila sua arquitetura aprovada em **uma única linha de realização**: decisions posteriores prevalecem sobre mechanisms históricos sem apagar seus invariantes; tecnologia selecionada continua **não qualificada** até prova version-pinned; 3L é reorganizada em cinco packages load-bearing e passa a incluir **Builder long-context / Observational Memory como MUST EVALUATE, não MUST ENABLE**; probes históricos são recompilados contra authority atual antes de rodar; probes que exigem produto implementado permanecem downstream e obrigatórios no first-build conformance; após C-018, um único derived Implementation Realization Planning Gate congela packages/schema/contracts/config/version pins necessários para que coding actors executem sem decidir arquitetura por conveniência.

---

## 1. Outcome

O checkpoint foi aberto porque 3B–3K fecharam arquitetura material suficiente para aproximar o programa da implementação, mas a cadeia C-000..C-017 + 3A–3K contém **realization supersessions legítimas** e probes criados sob substrates antigos. Sem compilá-los agora, um Fresh Actor poderia executar checklist histórico literalmente, preservar mechanism superseded ou escolher detalhes técnicos materialmente diferentes durante implementation.

Resultado:

```text
architecture 3B–3K                              = CURRENT STRUCTURE CONFIRMED
prior structural reopen                        = NONE
new domain/module/record/database/workflow     = 0
new architecture phase/framework               = 0
implementation authorization                   = NO
C-018                                           = NOT YET RATIFIED
3L                                             = NEXT / NOT STARTED

bounded routing correction                     = YES
Builder OM / long-context                      = MUST EVALUATE in 3L
Builder OM                                     = NOT automatically enabled
Product Agent OM / Semantic Recall / Extractors= remain consumer/eval-gated
old probe literal execution                    = REJECTED
post-C-018 Realization Planning                = REQUIRED / DERIVED-ONLY
first-build conformance proof map              = PRESERVED / EXPLICIT
```

O checkpoint não redecide o produto e não volta a comparar frameworks por preferência. Ele responde somente:

> **Qual é a architecture atual depois de todas as supersessões, quais assumptions ainda podem estar falsas e qual sequência única transforma essa architecture em código sem delegar decisão material ao coding actor?**

---

## 2. Root cause

O defect class é:

```text
approved architecture
+
long design history
+
technology/platform evolution
+
mechanism-specific probes written at different dates
→ future implementation actor encounters multiple locally-valid readings
→ picks one by convenience
→ historical mechanism silently becomes current authority
OR
→ current architecture is implemented without proving its substrate assumption
```

Exemplos reais no acervo:

```text
C-002               → Pi as original coding runtime
3A-R5 / 3H-01       → Builder current realization = Mastra AgentController/Workspace/E2B

C-008               → guest-readable LLM key with TTL/spend cap
3I-02               → guest model-provider key DELETED; model-provider credential control-side

C-010               → Product Agent loop realization described with own light loop / AI SDK
3H-02               → Product Agent current realization = exact Release-projected direct Mastra Agent

C-013               → Builder telemetry text written around Pi
3H-03               → current runtime evidence composition = Mastra + E2B + OTel/provenance rules

C-015/C-016         → historical tailnet exposure wording
3J-01               → current first-production exposure = company LAN/VPN + HTTPS

C-002               → pg-boss selected early as Hub queue
3A-R9               → scheduler/queue is replaceable mechanics; managed-job properties require CX-MANAGED-JOB-01
```

Nenhum destes exemplos exige apagar a authority histórica. Exige aplicar precedence corretamente e preservar somente o invariant que sobrevive.

Target invariant:

> **Cada future implementation choice deve ser derivável de uma current accepted authority, de uma qualification concluída ou de um explicit Realization decision; nenhum coding actor deve precisar reconstruir por memória qual mechanism histórico ainda vale.**

---

## 3. Scope exato

3A-R10 fecha somente:

```text
A. current realization/supersession map before 3L
B. 3L package decomposition and dependency ordering
C. Builder cognition / Observational Memory routing correction
D. current external technology evidence snapshot used to sharpen 3L
E. historical-probe compilation rule
F. downstream first-build proof map
G. post-C-018 Realization Planning boundary and minimum technical closure
H. single program route from 3L to first served vertical
```

Não fecha:

```text
exact package versions / lockfile                       → Q0 / 3L + Realization Planning
exact Node runtime version                              → Realization Planning
exact database table/column/constraint spelling         → Realization Planning
exact HTTP routes/DTOs                                  → Realization Planning
exact pg-boss vs replacement selection                  → CX-MANAGED-JOB-01 adjudication
whether Builder OM is enabled                           → CX-BUILDER-COGNITION-01 evidence
3M failure/recovery policy                              → 3M
3N global architecture verification                     → 3N
3O end-to-end architecture proof contract               → 3O
F3B-R1 canonical product repo/cutover                    → 3A/operator before Realization Planning
product code                                            → prohibited until C-018 + accepted Realization Planning
```

---

## 4. Authority precedence for realization

Current precedence remains repository authority, not document recency by itself.

For a realization question:

```text
exact later approved decision that intentionally reconciles/supersedes the mechanism
→ wins for that mechanism

older invariant not superseded
→ survives

older mechanism-specific wording contradicted by current authority
→ historical evidence only

review/research/tool docs
→ evidence only
```

### 4.1 Current realization map

| Surface | Current accepted realization/routing | Historical mechanism that must not silently revive |
|---|---|---|
| Hub | Node/TS modular monolith + PostgreSQL authorities, owner boundaries from 3C–3J | framework-owned orchestration authority |
| Builder harness | Mastra AgentController / persistent Change-scoped CodingSession | Pi as F1 primary runtime |
| Builder workspace | Mastra Workspace → E2B remote sandbox, subject to qualification | SRT/local-process baseline as normal path |
| Builder model credential | control-side owner-specific credential + 3I-03 spend gate | guest LLM key |
| Product Agent | direct Mastra Agent from exact RuntimeAgentProjection | C-010 historical light-loop spelling / Stored Agent latest resolution |
| Product Agent authoring | Project `agent/v1` → Registry → Release | Mastra Editor/Stored Agent authority |
| Production memory baseline | Conversation history; other memory policies only when admitted | automatic Semantic Recall/OM/Extractors |
| Runtime role isolation | BuilderMastra != ParMastra; same-process only if qualified | shared mutable Mastra namespace |
| Managed sync | MAR-owned `job/v1`, Release-derived schedule, `mar.job_run` durable occurrence | generic workflow/scheduler domain |
| Model spend | owner-local ActorRun/AgentRun one-outstanding liability | C-013 generic attempt machinery as separate owner |
| Observability | Conexus owner IDs/provenance + Mastra/E2B/app observations; telemetry never authority | Pi-specific telemetry schema as platform doctrine |
| First production | one dedicated Linux guest on current company server, private LAN/VPN HTTPS | tailnet-specific exposure requirement |
| Frontend | React + TS + Vite SPA + TanStack paved road from C-012 | framework reconsideration without failure class |
| Database | PostgreSQL 17 major baseline from C-006; exact current minor pin later | upgrade to PG18 merely because it exists |
| Brain | Conexus-owned git-first Brain/compiler/binding architecture | memory framework as Brain authority |

---

## 5. Current external evidence snapshot — 2026-08-18

External sources are **Evidence only**. 3L must re-check exact pinned versions/configurations before a PASS because technology can change after this checkpoint.

### 5.1 Mastra AgentController / coding harness

Current primary evidence confirms that AgentController is Mastra's current control layer for long-running interactive agent experiences and is used by Mastra Code; the former Harness entry point remains compatibility history while current examples use `AgentController`.

Evidence:

- Mastra — “Build Claude Code for X with Agent Controller”, 2026-06-30: `https://mastra.ai/blog/build-claude-code-for-x-with-agentcontroller`
- Mastra — “Anatomy of a harness: building a coding agent that can run for hours”, 2026-06-05: `https://mastra.ai/blog/anatomy-of-a-coding-agent`

Adjudication:

```text
3A-R5 / 3H-01 Builder selection = still credible
exact package/API/version       = MUST PIN / QUALIFY
old Harness naming              = historical compatibility, not current domain vocabulary
```

### 5.2 Mastra Observational Memory

Current Mastra evidence describes OM as long-context machinery that replaces growing raw history with observations and reflection. The implementation uses model-bearing Observer/Reflector work; Mastra explicitly positions OM for long-running/coding-agent context.

Evidence:

- Mastra OM research, 2026-02-09: `https://mastra.ai/research/observational-memory`
- Mastra OM announcement, 2026-02-09: `https://mastra.ai/blog/observational-memory`
- Mastra Code harness anatomy, 2026-06-05: `https://mastra.ai/blog/anatomy-of-a-coding-agent`

This creates a **current named consumer/failure class** in the Builder:

```text
persistent CodingSession per Change
+
long codebase investigation / multiple ActorRuns
+
context growth / compaction
→ forgotten requirement / repeated rediscovery / contradictory local decision / rework
```

But OM also touches:

```text
model spend
background/synchronous observer-reflector calls
restart continuity
runtime isolation/process-global state
stale authority contamination
```

Therefore Builder OM is promoted from generic defer to **MUST EVALUATE**, not to automatic adoption.

### 5.3 Mastra schedules

Current Mastra schedules were introduced as a dedicated API in July 2026; primary evidence documents threadless/threaded agent schedule modes and requires `@mastra/core >= 1.50.0` for the feature family at that publication date.

Evidence:

- Mastra — “Introducing Schedules for Mastra Agents and Workflows”, 2026-07-08: `https://mastra.ai/blog/introducing-schedules-for-agents-and-workflows`

Adjudication:

```text
3H-02 schedule mechanics remain plausible
stable intended-slot identity / redelivery / race semantics remain NOT_PROVEN
CX-AGENT-MASTRA-01 remains mandatory
```

### 5.4 E2B

Current E2B APIs continue exposing:

```text
sandboxID + template/envd identity
secure access tokens
network allowOut / denyOut / allowPublicTraffic
internet deny switch
pause/resume preserving filesystem + memory + running process state
lifecycle onTimeout / autoResume
CPU / memory / disk metrics
```

Evidence:

- create sandbox/network config: `https://e2b.dev/docs/api-reference/sandboxes/create-sandbox`
- sandbox persistence: `https://e2b.dev/docs/sandbox/persistence`
- sandbox metrics: `https://e2b.dev/docs/api-reference/envd/get-the-stats-of-the-service`

Adjudication:

```text
E2B selection remains credible
exact egress firing / physical incarnation attribution / orphan lifecycle / private preview / resource viability remain NOT_PROVEN
CX-SBX-E2B-01 remains mandatory
```

### 5.5 AI SDK retries — concrete 3I-03 hazard

Current AI SDK Core docs expose `maxRetries` with **default 2** on both `generateText` and `streamText`; `0` disables retry.

Evidence:

- `https://ai-sdk.dev/docs/reference/ai-sdk-core/generate-text`
- `https://ai-sdk.dev/docs/reference/ai-sdk-core/stream-text`

Adjudication:

> Any F1 path whose physical provider attempt can traverse AI SDK retry behavior below the Conexus owner admission gate must set retries to zero or prove that every additional physical attempt re-enters owner admission. Default retry is not admissible by convenience.

This is direct deciding evidence for the 3I-03 qualification subset; it does not create a new budget architecture.

### 5.6 pg-boss — useful incumbent, not qualified schedule authority

Current pg-boss remains an active PostgreSQL-backed queue with transactional job creation, exactly-once job delivery claims, retries, concurrency policies and cron scheduling.

Evidence:

- repository/docs: `https://github.com/timgit/pg-boss`

However, a current open issue documents a known schedule-resilience concern: cron execution can be missed when no service instance is running at the scheduled instant, with proposed persistence of `nextExecution` as a possible improvement.

Evidence:

- pg-boss issue #557 — “Job scheduling: save nextExecution in the DB to be more resilient to service outages”: `https://github.com/timgit/pg-boss/issues/557`

Adjudication:

```text
pg-boss = incumbent candidate, not authority
queue/durable job mechanics = credible
3A-R9 one-catch-up-after-downtime = MUST BE PROVEN/REALIZED by Conexus
native scheduler catch-up semantics = NOT ASSUMED
CX-MANAGED-JOB-01 may retain pg-boss with narrow owner-side reconciliation if sufficient
outbox/dispatcher framework does not pre-exist the failure proof
```

### 5.7 PostgreSQL

PostgreSQL 17 remains supported; current project versioning policy at this checkpoint lists 17.10 as the current 17 minor and support through 2029-11-08. PostgreSQL 18 is current major, but no approved consumer or defect requires a major migration before first implementation.

Evidence:

- PostgreSQL Versioning Policy: `https://www.postgresql.org/support/versioning/`

Adjudication:

```text
PG17 major architecture pin = CONFIRMED
Realization Planning should pin current supported PG17 minor
PG18 migration because “newer” = REJECT
```

### 5.8 Frontend tooling

Current TanStack Router continues to support/prefer file-based routing with Vite integration. Vite current documentation requires Node.js `20.19+` or `22.12+` for Vite 7-era tooling.

Evidence:

- TanStack file-based routing: `https://tanstack.com/router/latest/docs/routing/file-based-routing`
- TanStack Vite integration: `https://tanstack.com/router/latest/docs/installation/with-vite`
- Vite getting started: `https://vite.dev/guide/`

Adjudication:

```text
React/TS/Vite/TanStack paved road = CONFIRMED
frontend framework re-evaluation   = NO
exact Node/package pins            = Realization Planning
```

---

## 6. Bounded routing correction — Builder cognition / OM

3A-R6 previously grouped Semantic Recall, Observational Memory and related Mastra memory features under consumer-gated defer. 3A-R10 makes **one narrow correction**:

```text
Builder Observational Memory / long-context cognition
→ current consumer exists
→ MUST EVALUATE in 3L

Product Agent Observational Memory
Semantic Recall
Memory Extractors
Working/Agent Memory beyond current consumer
→ remain consumer/eval-gated under 3H-02
```

No memory feature becomes authority.

### 6.1 Stable evidence identifier

The evaluation family receives the conceptual probe/evidence identifier:

```text
CX-BUILDER-COGNITION-01
```

This identifier creates **no domain object, module, record, service or phase**. It exists only so deciding Evidence can be referenced unambiguously.

### 6.2 Required comparison

At minimum compare under equivalent representative Changes:

```text
A. persistent Change-scoped Mastra thread + OM OFF
B. persistent Change-scoped Mastra thread + OM ON
```

Control as far as practical:

```text
same base model/provider class
same approved Project Baseline / Change contract
same tool surface
same E2B/template class
same representative task family
same verification criteria
```

Measure at least:

```text
correctness assertions
architectural violations
forgotten/stale requirement incidence
rediscovery/repeated reads
rework / Findings
context/token use
model cost including Observer/Reflector
wall clock / latency
restart continuity
runtime-isolation effects
human intervention
```

### 6.3 Required adversarial fixtures

```text
old thread/OM says authority X
current ActorRun authority says Y
→ Y must win mechanically

OM observer/reflection emits billable call
→ call must have admitted owner/budget or OM stays disabled

Builder OM enabled in same-process topology
→ cannot influence PAR state/Memory/runtime

restart/resume with OM
→ same CodingSession cognition may survive
→ runtime/OM state still cannot become permission, current Baseline, accepted output or terminal truth
```

### 6.4 Allowed outcomes

```text
PASS + material net gain
→ OM may become enabled Builder F1 realization

PASS + no material gain
→ keep OFF; complexity does not pay

gain but spend/isolation failure
→ smallest guard if justified, otherwise keep OFF

structural conflict with 3H/3I
→ REJECT Builder OM F1 or reopen only smallest implicated realization assumption

weak/missing evidence
→ NOT_PROVEN; do not enable
```

---

## 7. Historical-probe compilation law

A probe written before a later approved realization change MUST NOT be executed verbatim merely because its ID survives.

Required pre-execution step:

```text
historical probe criterion
↓
identify protected invariant
↓
apply current authority / supersession
↓
DELETE obsolete mechanism-specific criterion
↓
REPLACE with current mechanism needed to falsify the same invariant
↓
pin exact versions/config
↓
execute
```

Examples:

```text
CX-SBX-E2B-01 “Pi functional”
→ current meaning = Builder Mastra AgentController/Workspace workload functional in E2B

CX-SBX-E2B-01 guest LLM key TTL/spend-cap
→ deleted; 3I-02 removed guest model-provider key
→ model spend now tested control-side under 3I-03

C-008 hard <=45min wording
→ 3A-R5 reclassified as operational checkpoint/budget signal
→ resource/cost viability remains, fixed architectural 45m failure does not

CX-OBS-V0-01 Pi adapter
→ compile to current Mastra Builder telemetry / owner-provenance path
→ preserve missingness and non-authority law
```

A deleted historical mechanism cannot be revived by a test fixture.

---

## 8. Final 3L decomposition

3L remains **Technology Qualification**, not generic framework benchmark. It is organized by shared failure class/dependency while each criterion retains its own verdict.

### Package A — Builder Substrate + Cognition

```text
CX-SBX-E2B-01
CX-BUILDER-MASTRA-01
CX-BUILDER-COGNITION-01
```

Must prove/falsify:

```text
E2B machine/safety/resource/lifecycle envelope
Mastra thread/session/workspace continuity without authority leakage
physical sandbox incarnation attribution
quiescence + FRESH_BASE/CONTINUE_LINEAGE behavior
Hub-side output custody + cancel ordering
fresh verifier isolation
long-context quality / OM ON vs OFF
OM model-spend and runtime-isolation compatibility
```

### Package B — Product Agent + Cross-Runtime

```text
CX-AGENT-MASTRA-01
CX-RUNTIME-ISOLATION-01
```

Must prove/falsify:

```text
exact Release→RuntimeAgentProjection, no latest/Editor override
Conversation/memory scope isolation
suspend/process-loss/guarded resume
approval outcome semantics + sealed proposal args
Gateway dedupe under repeated resume/retry
plain active Agent crash behavior
stable schedule intended-slot identity before AgentRun admission
trigger/update/disable/redelivery races
Builder/PAR store/PubSub/global-state isolation
RequestContext replace-whole
same-process admissibility or 3J split trigger
F5 control != telemetry
```

### Package C — Model Economics / Enforcement

3I-03 technology-dependent subset:

```text
pre-provider interception
hidden model-call closure
retry/fallback neutralization
OM Observer/Reflector call accounting if Package A enables OM candidate
usage extraction preserving MISSING != ZERO
stream final-usage behavior
finite cost envelope for exact F1 provider/model/request classes
alias/profile drift fail-closed
```

Concrete deciding fixture:

```text
AI SDK or framework path with retry default
→ one owner reservation MUST NOT create N hidden physical attempts
```

### Package D — Managed Execution

```text
CX-MANAGED-JOB-01
```

Must prove/falsify:

```text
fixed interval occurrence
JobRun durable-before-physical execution
persist→enqueue crash recoverability
same-occurrence restart/race dedupe
single-flight/coalesce
one catch-up after downtime, no N-slot backlog
timeout honest settlement
retry exact Release/job pins
cancel blocks new retry/admission
scheduler projection reconstructible from Release/job authority
old Release no future occurrences after handoff
new Release no recurrence before admitted serving state
MANAGED_JOB Gateway caller cannot widen authority
```

`pg-boss` is the incumbent candidate because it is already aligned with the Postgres/Node topology and transactional job creation, but it **must not be declared winner before this package**.

### Package E — Deciding Evidence

Verification Observability deciding-evidence subset:

```text
exact ActorRun/AgentRun + candidate/output correlation
Mastra/runtime observations tied without becoming owner identity
E2B provider observation anchored by pinned physical sandboxId
guest/app provenance remains GUEST_OBSERVED
producer cannot forge HUB/GATEWAY authority
required-evidence capture policy
dropped/missing required evidence → NOT_PROVEN / INCONCLUSIVE
telemetry outage never manufactures PASS
F5 valid without telemetry still reaches owner truth
telemetry complete without F5 never moves owner truth
```

OTel exporter/backend/Spotlight/Sentry/E2B OTLP push remain optional unless a deciding criterion proves they are necessary.

---

## 9. 3L minimum execution order

Before any package run:

### Q0 — Qualification Manifest

Record exact tested stack:

```text
Node runtime
package manager + lockfile
Mastra core / AgentController / memory / workspace / E2B packages
E2B SDK + template hash + envd/runtime identity + network/lifecycle config
model provider adapter / AI SDK versions where reachable
exact provider/model IDs and pricing profile refs for model-spend qualification
pg-boss version/config or selected managed-job candidate
PostgreSQL version used where substrate behavior matters
OTel/runtime exporter packages when part of a criterion
```

No `latest` may be a deciding evidence identity.

Then minimum dependency order:

```text
Q0
├─→ Package A — Sandbox + Builder + Cognition
├─→ Package B — Product Agent base
├─→ Package D — Managed Job (independent enough to run early)
│
Package A + Package B
├─→ Package C — actual model-call path closure
└─→ Package B isolation half / same-process composition
       ↓
Package E — deciding cross-layer evidence
```

A package may run subprobes in parallel only where they do not share mutable state or require an earlier result.

---

## 10. Qualification adjudication law

For every failed criterion:

```text
1. which exact approved assumption was falsified?
2. is failure config/API/version-local?
   → bounded correction + reprobe
3. is failure a substrate limitation behind an existing seam?
   → smallest adapter/guard/substrate replacement
4. does evidence invalidate an architectural invariant/boundary?
   → Material Finding / reopen exact implicated decision only
5. is evidence missing/ambiguous?
   → NOT_PROVEN; never force green
```

Examples:

| Failure | First reopen/correction target |
|---|---|
| E2B egress cannot fail closed | C-008 provider realization/removal condition; qualify challenger |
| E2B physical reincarnation not attributable | narrow 3H-01 runtime guard; wrapper only if proven necessary |
| Builder OM bills outside owner gate | keep OM off or smallest 3I-03-compatible gate; no new BudgetService by default |
| Mastra mutable global state bleeds Builder↔PAR | 3H-03 same-process assumption → 3J process-split trigger |
| native Mastra approval cannot preserve sealed proposal | use generic suspend/resume adapter; ApprovalRequest authority unchanged |
| usage missing but finite max exists | conservative-only settlement; no architecture reopen |
| hidden retry cannot be disabled/re-gated | 3I-03 realization; model proxy only if direct realization truly impossible |
| pg-boss misses downtime schedule | narrow Release/owner-side catch-up reconciliation if sufficient; alternative substrate if not |
| persist→enqueue window loses admitted job forever | smallest reconciliation/transaction mechanism; outbox only if evidence proves necessary |
| E2B OTLP push drops | telemetry degrades; exact provider pull anchor remains baseline |
| required deciding evidence unavailable | NOT_PROVEN; 3N/3O cannot lower proof bar |

Framework preference alone never reopens a decision.

---

## 11. What remains DEFER SAFELY / REJECT F1 after this checkpoint

### DEFER SAFELY / consumer-gated

```text
Product Agent Observational Memory
Semantic Recall
Memory Extractors
Working/Agent Memory without current Product consumer
Durable Agent / reconnectable same-stream machinery
Mastra Workflows except named deterministic behavior
Skills / Goals / Background Tasks unless exact consumer requires
Temporal/Inngest
Mastra Platform managed deployment/workspace options
E2B OTLP push as mandatory path
stable PreviewEnvironment
self-host E2B
DPoP/mTLS without 3I trigger
DEDICATED physical deployment until first real consumer
old-PAR drain until first runtime-affecting production upgrade
```

### REJECT F1 absent new consumer/failure class

```text
generic framework bake-off
Mastra vs LangGraph/CrewAI/etc benchmark
E2B vs every sandbox-provider shootout before removal trigger
pg-boss vs BullMQ/Temporal/Inngest generic benchmark
workflow/automation/scheduler domain
Product multi-agent/Agent Network baseline
Kubernetes/service mesh/multi-region/HA experiments
universal memory service
model proxy/token broker by aesthetics
new architecture/readiness framework
```

---

## 12. Downstream first-build proof map — mandatory but NOT 3L

3L proves external/substrate assumptions. Several already-approved probes require actual Conexus implementation and therefore **must not be pulled into 3L**, but they also cannot disappear from Implementation Realization Planning.

| First-built capability | Existing mandatory proof |
|---|---|
| Brain compiler/binding/AnalyticQuery core | `CX-BRAIN-V0-01` before first Brain-backed deploy |
| Brain assisted Discovery | `CX-BRAIN-DISCOVERY-01` before CER-3 implementation/activation |
| Brain feedback/promotion | `CX-BRAIN-FEEDBACK-01` before CER-4 implementation/activation |
| Frontend scaffold/runtime SDK/Honest UI | `CX-SCAFFOLD-V0-01` before first case-1 deploy |
| Observability causal composition | `CX-OBS-V0-01`, compiled against current Mastra realization |
| Published Runtime/Auth/RBAC | `CX-PUB-V0-01` |
| Release/Promotion/rollback | `CX-REL-V0-01` |
| Project database/migrations | QA-DB-1 rebuild + QA-DB-2 golden/privilege negatives + QA-DB-3 rehearsal when applicable |
| Security realization | C-016 F1 Security Baseline positive/negative conformance + 3I/3J current laws |
| First Builder quality | C-003 QUA-1 Golden benchmark + QUA-4 Worker Eval when applicable |
| First vertical | 3O contract + first-build proof + served exact Release identity |

Rule:

```text
architecture proof obligation exists
-X-> must run during 3L

requires implementation bytes/DB/routes/UI to exist
→ Realization Plan must place the probe after the smallest implementing slice and before the relevant activation/deploy gate
```

---

## 13. Post-C-018 Implementation Realization Planning Gate

C-018 will close Architecture & System Design only. It does **not** authorize coding.

After C-018 and F3B-R1, Realization Planning must translate accepted architecture into exact executable choices without becoming a second authority.

Minimum closure before coding actors receive implementation work:

### R1 — Runtime/toolchain pins

```text
Node runtime
package manager
TypeScript/tooling
Mastra packages
E2B SDK/template/envd identity
PostgreSQL 17 current minor
frontend framework/package pins
OTel packages if used
pg-boss/managed-job substrate selected by 3L
provider/model/AI-SDK stack qualified for initial model paths
```

### R2 — Repository/package topology

Exact modules/packages/folders and allowed dependency directions realizing 3C/3D without new domain ownership.

### R3 — Database realization

```text
exact schemas/tables/columns/constraints/indexes
owner roles/login capabilities/pools
cross-owner transaction profiles already authorized
migration runner / Project role spelling
Mastra store separation
```

No schema invents a new durable meaning absent architecture authority.

### R4 — Contracts

```text
exact HTTP routes / in-process surfaces
DTOs / JSON schemas
failure codes/details
public vs internal boundaries
exact approval/proposal/effect payloads
runtime SDK wire contracts
```

### R5 — Builder runtime wiring

```text
CodingSession ↔ exact Mastra thread/session implementation
ActorRun dispatch/rebind
Workspace/E2B create/connect/pause/resume/destroy
physical sandbox attribution
quiescence check
output custody
cancel/interrupt
fresh verifier
OM ON/OFF result from 3L
```

### R6 — Production Agent runtime wiring

```text
RuntimeAgentProjection construction
Mastra Agent config
memory baseline
suspend/resume adapter
schedule-fire transport selected by qualification
RequestContext replace-whole
PAR terminal/F5 callback wiring
```

### R7 — Model spend/provider wiring

```text
owner-row reservation mutation
pre-provider interception point
retry=0 or re-entry proof
usage extraction
stream settlement
pricing/cost profile representation
broken-profile block
OM observer/reflection accounting when enabled
```

### R8 — Managed-job realization

```text
selected queue/scheduler library/config
Release→projection reconciliation
JobRun durable-before-execution path
stable occurrence identity
single-flight/coalesce/catch-up
restart reconciliation
cancel/retry/timeout semantics
MANAGED_JOB Gateway caller derivation
```

### R9 — Observability/proof realization

```text
Conexus event schema/current projection
Mastra/E2B/app mapping
producer trust stamping
required-evidence capture policy
correlation fields
OTel mapping/exporter only where useful
```

### R10 — Security/deployment wiring

```text
exact owner DB grants
credential injection paths
E2B network policy
CSP/session cookie/TLS config
service manager / VM process supervision
backup paths/keys
whole-Hub stop procedure
```

### R11 — Scaffold + first vertical slice

```text
exact scaffold package/generator versions
ownership-map/generated boundaries
first Budget Analyzer dataset slice
Sankhya discovery/source operations
migrations/read model
sync job
registered queries
Brain binding
frontend route/component sequence
proof placements
```

### R12 — Verification matrix

Every material invariant in the implementation slice maps to:

```text
mechanical check
integration/probe
negative fixture
served proof
human gate where required
```

No coding task may receive “decide whichever library/shape seems best” for an unresolved material choice.

---

## 14. Single program route to first implementation

```text
3A-R10 — APPROVED checkpoint
↓
3L — Technology Qualification
  Package A Builder substrate+cognition
  Package B Product Agent+runtime isolation
  Package C model economics/enforcement
  Package D managed execution
  Package E deciding evidence
↓
3M — Failure & Recovery structural sufficiency
↓
3N — one independent global architecture verification
↓
3O — contract-only first vertical architecture proof
↓
C-018 — Architecture & System Design closure
↓
F3B-R1 — canonical product repo/cutover gate
↓
Implementation Realization Planning Gate
↓
accepted executable implementation plan(s)
↓
product code
↓
downstream first-build conformance probes at their owning slices
↓
Golden Budget Analyzer
↓
SERVED_VERIFIED exact Release
```

No branch of this route may silently skip back into architecture from implementation. A material contradiction returns through the applicable Decision Loop and reopens only what the evidence actually falsifies.

---

## 15. Proof strategy for this checkpoint

3A-R10 is falsified if a Fresh Actor following current authority can still encounter any of:

```text
P1  two approved mechanisms both appear current for the same realization choice
P2  a 3L probe still tests a mechanism explicitly deleted/superseded by later authority
P3  a load-bearing external assumption is left for coding actor convenience
P4  Builder long-context policy can change post-implementation without touching spend/isolation assumptions
P5  a downstream mandatory probe can disappear because it was not a 3L item
P6  Realization Planning is allowed to change owner/domain meaning instead of deriving implementation
P7  current pg-boss/AI-SDK/Mastra/E2B behavior is treated as eternal architecture rather than version-pinned evidence
P8  product implementation can start before C-018 + F3B-R1 + accepted Realization Plan
```

Current outcome after this reconciliation:

```text
P1–P8 known contradiction = NONE
remaining unknown technology behavior = intentionally routed to 3L
remaining structural recovery = 3M
remaining global proof = 3N/3O
```

---

## 16. Reopen triggers

Reopen 3A-R10 only if:

```text
new approved decision changes a current realization map materially
3L reveals an orphan load-bearing qualification family not routed here
3M/3N/3O proves the program sequence itself leaves a material architecture decision to implementation
post-C-018 Realization Planning discovers an unavoidable material choice not derivable from approved architecture
an old probe is found whose protected invariant cannot be reconstructed under current authority
```

Do not reopen for:

```text
new framework release merely existing
new benchmark leaderboard
minor package upgrade
preference for newer PostgreSQL/Node/frontend stack
optional feature discovery
implementation-level file/folder naming that preserves all owners/contracts
```

---

## 17. Explicit non-goals / anti-overengineering

3A-R10 creates none of:

```text
new product module
new durable record
new database/schema
ArchitectureEngine / ReadinessEngine
TechnologyRegistry domain
ProbeOrchestrator domain
second architecture authority
new lifecycle/phase family
universal framework benchmark
mandatory multi-provider abstraction beyond already-approved seams
mandatory OM/memory service
mandatory process split
mandatory queue/outbox/workflow engine
```

The stable `CX-BUILDER-COGNITION-01` name is evidence/navigation vocabulary only.

---

## 18. Final ratified outcome

Operator approval on **2026-08-18** ratifies:

```text
3A-R10 = APPROVED
outcome = CURRENT STRUCTURE CONFIRMED + BOUNDED ROUTING CORRECTION
prior structural phase reopen = NONE

Builder primary harness = Mastra AgentController / current Mastra realization
Builder workspace substrate = E2B / probe-gated
Pi = fallback/challenger only
Builder OM = MUST EVALUATE / NOT MUST ENABLE
CX-BUILDER-COGNITION-01 = 3L deciding-evidence family
Product Agent OM / Semantic Recall / Extractors = remain consumer/eval-gated
Product Agent runtime = exact Release-projected direct Mastra Agent / probe-gated
pg-boss = incumbent managed-job candidate / NOT qualified winner
AI SDK hidden retry default = explicit 3I-03 qualification hazard where reachable
PostgreSQL 17 major = preserved
React/TS/Vite/TanStack paved road = preserved
historical probe literal execution = forbidden; compile against current authority first
first-build downstream probes = mandatory / not pulled into 3L
post-C-018 Realization Planning = required / derived-only
product implementation = BLOCKED
C-018 = NOT YET RATIFIED
PR #40 merge = requires explicit operator authorization
```

3L is the next phase. Its first action after this checkpoint is **Q0 Qualification Manifest + Package A–E execution planning**, not product implementation and not generic technology research.