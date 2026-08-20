# 3H-R1 — Runtime & Agent Architecture Final Closure

**Status:** APPROVED / CLOSED pelo operador em 2026-08-17  
**Fase:** 3H — Runtime & Agent Architecture  
**Authority:** reconciliação final de 3H-01..3H-03 após closure review adversarial  
**Método:** DevelopmentConexus Engineering Method v1.0.0  
**Importante:** este fechamento não constitui C-018, não encerra a Fase 3 completa, não autoriza implementação de produto, merge ou PR readiness.

## Decisão em uma frase

3H — Runtime & Agent Architecture está **CLOSED / APPROVED**: Builder e Production Agent possuem realizações distintas e deliberadas sobre Mastra, com lifetimes e authorities owner-specific, isolamento de runtime/store/PubSub, correlação ancorada em IDs duráveis do Conexus, F5 owner-bound separado de Operational Telemetry, Verification Observability com provenance preservada e nenhuma quarta decisão material de runtime justificável; as incertezas restantes pertencem explicitamente a 3I/3J/3L/3M/3N/3O, implementação ou Decision Loop por consumidor concreto.

---

## 1. Authority e provenance

Este fechamento reconcilia:

- C-000..C-017;
- 3A-R5 — Builder / Coding Runtime Reassessment;
- 3C CLOSED + 3C-R1;
- 3D CLOSED + 3D-R1;
- 3E CLOSED + 3E-R1;
- 3F CLOSED + 3F-R1;
- 3G CLOSED + 3G-R1;
- `3H-01-builder-coding-runtime-realization-session-sandbox-mapping.md`;
- `3H-02-production-agent-runtime-realization.md`;
- `3H-03-runtime-isolation-correlation-handoff.md`.

Review/provenance não-autoritativa:

- `3H-FABLE-DIALOGUE-final-runtime-agent-architecture-closure.md`;
- `3H-FABLE-DIALOGUE-final-runtime-agent-architecture-closure-R2.md`.

O closure review independente retornou:

```text
Material Finding against 3H-01/02/03 or prior authority = NONE
missing material 3H decision                             = NONE
3H-04                                                    = NOT JUSTIFIED
reopen                                                   = NONE
verdict                                                  = CLOSE 3H
```

As três correções de fechamento foram verificadas contra authority canônica e incorporadas nas seções 8–10 abaixo. Nenhuma altera uma runtime law já aprovada.

---

## 2. Teste de fechamento

Uma pendência bloquearia o fechamento de 3H somente se exigisse decidir agora pelo menos um destes fatos:

```text
runtime identity / lifetime
runtime authority boundary
agent execution substrate shape
session/thread/sandbox relationship
runtime-to-owner handoff semantics
cross-runtime isolation property
correlation/provenance semantics
mandatory runtime infrastructure
```

Se a propriedade já está congelada e resta apenas:

```text
trust / credential / revocation          → 3I
process/container/backup/deploy topology → 3J
version-pinned technology proof           → 3L
orphan/recovery/settlement policy         → 3M
product/UX projection                     → 3K
architecture proof                        → 3N/3O
implementation spelling                   → implementation
future optional consumer                  → Decision Loop
```

então não existe nova decisão material de 3H.

Aplicando este teste ao pacote completo:

```text
remaining material 3H decision = 0
3H-04 = NOT JUSTIFIED
prior phase reopen = NONE
```

---

## 3. Builder runtime closure — 3H-01

Builder mantém a separação explícita de lifetimes:

```text
Change
!= CodingSession
!= WorkUnit
!= ActorRun
!= Mastra AgentController Session
!= Mastra thread/run
!= E2B logical sandbox
!= E2B physical sandbox incarnation
```

Leis finais preservadas:

```text
CodingSession = durable Builder cognitive/runtime lineage per Change
persistent thread carries cognition, never authority
current Conexus authority/config reapplied mechanically each dispatch/rebind
ActorRun disposition = immutable FRESH_BASE | CONTINUE_LINEAGE
FAILED alone never authorizes lineage reuse
CANCELLED reuse requires explicit applicable-authority admission
physical sandbox incarnation is observed/reverified
CONTINUE_LINEAGE requires quiescence
unknown physical continuity => fail closed / fresh successor, never silent continuity
Hub-side durable custody precedes producedOutputRef presentation
Builder terminal cancel commits before best-effort physical abort
late runtime output cannot regain authority
material verifier uses fresh cognition + fresh candidate materialization
runtime refs remain observations/expectations, never current authority
```

No F1 subsystem was introduced for:

```text
SandboxPool
ProcessRegistry
lease/fencing
retry engine
checkpoint engine
universal Candidate/Delivery service
```

Exact Mastra/E2B behavior remains technology qualification, not an open runtime decision.

---

## 4. Production Agent runtime closure — 3H-02

Product Agent execution remains intentionally different from Builder execution:

```text
Builder          → AgentController / coding harness
Production Agent → direct Release-projected Mastra Agent
```

No shared `ConexusAgentRuntime` abstraction is justified.

Leis finais:

```text
AgentDefinition authority = Git → Registry ArtifactRevision → Release
RuntimeAgentProjection = rebuildable/non-authoritative projection of exact pins
AgentRun and exact composition commit before model/tool execution
newer Release never mutates an in-flight AgentRun
Editor/Stored Agent/latest/version fallback cannot alter Product execution
ConversationId = Conexus identity; Mastra thread = substrate ref
message history baseline ON when Conversation exists
Working/Agent Memory = consumer-gated
Semantic Recall / OM / Extractors = eval-gated
ApprovalRequest remains sole wait/approval authority
Mastra suspend/resume = mechanics only
proposal/effect identity owner-minted and sealed across resume
resumed arguments must still match the exact approved subject
Gateway alone owns external-effect replay/idempotency
boot/recovery re-drive must re-enter owner guards
SCHEDULE timer mechanics derive from AgentTrigger authority
schedule fire must reach guarded PAR admission before Product Agent execution
stable intended occurrence identity required before AgentRun admission
occurrence cursor scoped by (TriggerId, TriggerRevision)
F1 schedule single-flight; overlap occurrence consumed SKIPPED, no backlog
EVENT / Signals / Inbox external Product ingress remains disabled F1
old non-terminal run resumes exact old Release/runtime projection
runtime complete/error/suspend events are proposals/observations, not terminal truth
```

Mastra capability selection remains explicit:

```text
ADOPT      → Agent, thread/messages, tools/hooks, selective suspend/resume,
             schedule mechanics, observability
SELECTIVE  → Workflow, Working Memory, Skills, Goals, Background Tasks,
             browser/workspace on a concrete consumer
DEFER/EVAL → Semantic Recall, OM, Memory Extractors, Durable Agents,
             multi-agent/network, A2A/ACP, Channels, Temporal/Inngest,
             managed platform options
REJECT AS AUTHORITY
           → Editor/Stored/File-Based Agent SoT, latest resolution,
             native approval replacing Conexus approval,
             memory/goal/eval replacing business authority
```

---

## 5. Cross-runtime isolation closure — 3H-03

F1 freezes two role-specific runtime compositions:

```text
Builder role
├── BuilderMastra instance
├── mastra_builder persistent store
├── Builder-local PubSub/runtime namespace
├── Builder-only AgentController/coding agents/tools/workspaces
└── Builder telemetry role identity

PAR role
├── ParMastra instance
├── mastra_par persistent store
├── PAR-local PubSub/runtime namespace
├── PAR-only Product Agent projections/tools/schedules/memory
└── PAR telemetry role identity
```

Same-process co-location is allowed only while enabled framework state is mechanically isolated.

```text
process-global != automatically unsafe

mutable process-global
+ cannot be safely partitioned for enabled F1 capability
→ mandatory process-split trigger for 3J
```

Current source-evidence-based guards include:

```text
same-process roles use distinct PubSub instances
shared external broker additionally uses distinct per-role namespace/keyPrefix
no governed standalone/ephemeral Mastra execution
no role instance serving governed runs on implicit in-memory storage
no same mutable Agent/Memory/runtime registry convenience sharing
new enabled Mastra capability triggers pinned-version global-state sweep
```

Known deferred global-state examples such as Durable Agent registry and Observational Memory operation state do not force a process split while those capabilities remain disabled.

---

## 6. Correlation and context closure

Durable owner identities remain the causal anchors:

```text
Builder: ChangeId / CodingSessionId / WorkUnitId / ActorRunId
PAR:     AgentRunId / ConversationId / ApprovalRequestId / Trigger identity
others:  owner-specific Release/Gateway/etc. IDs
```

Runtime observations remain secondary:

```text
Mastra thread/run/toolCall ids
traceId/spanId
E2B sandbox/process refs
provider request ids
browser/app request/error refs
```

Normative law:

```text
domain run lifetime != trace lifetime

ActorRun / AgentRun
→ 0..N trace segments
```

A restart/resume may create a new trace without creating a new domain run.

OpenTelemetry is preferred vendor-neutral observational plumbing, but:

```text
OTel trace/span != authority
OtelBridge != correctness dependency
single perfect distributed trace != correctness dependency
```

Role attribution is mechanically present on relevant telemetry signals; with a shared global OTel SDK, per-signal role attribution remains required.

### 6.1 RequestContext

Mastra-persisted RequestContext never regains current authority on resume.

```text
snapshot context
→ diagnostic residue only

owner facts / exact pins
→ construct fresh effective runtime context
→ REPLACE WHOLE, never merge
→ dispatch/resume
```

Replace-whole prevents unknown stale keys from surviving by omission.

### 6.2 Baggage and metric cardinality

```text
Conexus owner IDs -X-> OTel baggage by default
high-cardinality Run/Change/trace IDs -X-> default metric labels
```

Any future baggage use requires explicit 3I trust/egress/redaction decision.

---

## 7. F5 handoff and Verification Observability closure

Runtime exposes two semantically distinct outbound paths:

```text
A. owner-control F5 handoff
B. Operational Telemetry
```

They cannot substitute for one another.

### 7.1 F5

```text
runtime proposes
→ owner validates against authoritative state
→ owner commits truth
```

In-process target identity derives from owner dispatch closure/opaque context. Producer payload IDs are cross-checks only.

```text
dispatch-bound run A
+ payload claims run B
→ refuse proposal
→ never terminalize B
```

A future process split may replace direct call with narrow authenticated request/reply without introducing a queue/outbox if current proposals remain re-derivable after transport loss.

Generic RuntimeBus/EventBus/UniversalRuntimeEvent/generic F5 envelope remain rejected.

### 7.2 Provenance

The existing C-013 trust vocabulary remains the only top-level provenance classification:

```text
HUB_AUTHORITY
GATEWAY_AUTHORITY
PROVIDER_OBSERVED
GUEST_OBSERVED
```

No parallel runtime provenance taxonomy is created.

### 7.3 Verification Observability

Material verification can correlate:

```text
Hub owner facts
+ Mastra runtime observations
+ E2B provider observations
+ app-under-test/browser/backend observations
```

without allowing observations to manufacture truth.

E2B dual path:

```text
platform pull by pinned physical sandboxId
→ minimum exact provider observation anchor for the ActorRun

E2B OTLP push
→ best-effort Operational Telemetry enrichment
→ not sole deciding evidence
```

Required evidence absent:

```text
NOT_PROVEN / INCONCLUSIVE
never PASS by absence
```

---

## 8. Closure correction — runtime model spend-cap remains an explicit 3I input

C-008 froze bounded guest-readable model capability semantics including:

```text
expires_at <= bounded run lifetime
spend cap per ActorRun
fail closed
revocation / reconciliation
```

3A-R5 moved the primary model loop/provider credential control-side. That changes the enforcement placement, not the invariant.

Therefore 3H closes while explicitly routing:

> **Per-ActorRun / per-AgentRun model spend-cap and runtime budget enforcement point, including continuity of the C-008 invariant after the control-side credential move → 3I Security / Authority, composed with existing Gateway/admission/budget and C-013 usage evidence.**

3H does not create a model proxy, token broker, `BudgetRuntime` or generic quota engine.

Reopen 3H only if 3I proves the invariant cannot be enforced through existing owner/admission boundaries without a genuinely new runtime mechanic.

---

## 9. Closure correction — C-013 admission semantics become an explicit 3N coherence proof

C-013 freezes the cross-cutting execution-admission property:

```text
persist first
→ reserve atomically
→ dispatch
→ honest terminal
```

with its generic attempt vocabulary.

3G/3H later created concrete owner-local state spaces deliberately:

```text
Builder ActorRun
Production AgentRun
Gateway EffectAttempt
Promotion
...
```

Closure law:

> **3N must verify that ActorRun and AgentRun admission realize the applicable C-013 persist-first / reservation / dispatch / honest-terminal semantics without creating a second parallel attempt state machine or reinterpreting owner-local states.**

Expected proof:

```text
owner state remains authority
C-013 remains a cross-cutting invariant
OBS may project events
OBS never owns lifecycle
UniversalAttempt = absent
```

This is architecture verification, not a new runtime object or FSM.

---

## 10. Closure correction — deterministic `job/v1` / sync dispatch is consciously deferred

C-007 explicitly ratified:

```text
dispatch defer total
```

for sync/job execution until a concrete consumer exposes the required shape.

The strongest candidate for a hypothetical 3H-04 is:

```text
3H-04 — Deterministic Job / Sync Execution Substrate
```

Likely near-term trigger:

```text
first Golden Path
→ Sankhya mirror/sync
→ cursor + overlap + staging + upsert
```

But the correct smallest substrate depends on that consumer and could be:

```text
MAR-local deterministic job
PAR SCHEDULE reuse
narrow dedicated worker
another already-existing runtime seam
```

Choosing now would override C-007's intentional deferral without the evidence it asked to wait for.

Therefore:

> **`job/v1` / sync dispatch remains deferred under C-007 `dispatch defer total`. The first Golden Path sync/mirror implementation is a likely near-term Decision Loop trigger and must choose the smallest concrete execution substrate before that consumer is implemented.**

Consequences:

```text
3H-04 now = NOT JUSTIFIED
sync/job work = not forgotten
first real sync consumer = Decision Loop
```

No generic Job entity, scheduler port, queue or worker framework is created by closure.

---

## 11. Final routed work after 3H

### 3I — Security / Authority

```text
credential custody
principal/trust boundaries
approver eligibility/revocation
last-mile authorization
browser/workspace/code-exec trust if enabled
DEDICATED delegation
network/egress authority
OTel baggage/redaction/egress rules
current security narrowing/emergency stop
per-run model spend-cap enforcement point
```

### 3J — Deployment / Operations

```text
MANAGED/DEDICATED physical topology
Builder/PAR process split if qualification fires
mastra_par backup/restore
old Product Agent runtime coexistence/drain/cutover
collector/backend topology if adopted
E2B OTLP production configuration if adopted
```

### 3K — Frontend / Product

```text
runtime/agent status presentation
Conversation/memory/trigger UX
approval cards
release/rollback UI
trace/debug presentation
```

### 3L — Technology Qualification

```text
CX-BUILDER-MASTRA-01
CX-AGENT-MASTRA-01
CX-RUNTIME-ISOLATION-01
stable schedule occurrence transport
role-local PubSub/default-bucket/external-broker behavior
Mastra global-state sweep at pinned version
E2B pull/OTLP behavior
OTel exporter/bridge qualification
memory/snapshot/version upgrade behavior
```

### 3M — Failure & Recovery

```text
orphan/lost timing and policy
admitted-but-undispatched recovery
missing/corrupt suspension snapshot
OUTCOME_UNKNOWN settlement
output custody repair
repeated quiescence/reconnect failure
operator/reconciliation paths
```

### 3N — Architecture Verification

```text
runtime authority boundary proof
cross-role isolation proof
Verification Observability proof
binding/Release/runtime proof
C-013 admission-ledger ↔ ActorRun/AgentRun coherence proof
no second attempt state machine
```

### 3O — Vertical Architecture Proof

End-to-end proof may compose the above but does not reopen 3H unless a material failure demonstrates that a frozen runtime invariant itself is unsound.

### Decision Loop / concrete consumer

```text
job/v1 deterministic sync substrate
first EVENT consumer
Product multi-agent/network
Durable Agent
Observational Memory
pools/failover/shared resources
Product Agent browser/code-exec capability
other optional framework capabilities
```

---

## 12. Technology qualification does not keep 3H open

Open probes are deliberate implementation gates:

```text
CX-BUILDER-MASTRA-01
CX-AGENT-MASTRA-01
CX-RUNTIME-ISOLATION-01
```

3H freezes **what must be true**.

3L proves **whether the pinned technology realization makes it true**.

```text
probe PASS
→ realization qualified

probe FAIL
→ reopen substrate/realization first
→ do not automatically reopen domain semantics
```

Keeping 3H open until probes run would add no new decision power and would incorrectly serialize Security architecture behind Technology Qualification.

---

## 13. Anti-overengineering closure

3H closes with:

```text
new Hub module                              = 0
new durable record class                   = 0
new Tier-2 FK                              = 0
ConexusAgentRuntime universal abstraction   = 0
RuntimeBus / EventBus                       = 0
UniversalRuntimeEvent                       = 0
generic F5 envelope                         = 0
generic F5 outbox/queue                     = 0
shared scheduler                            = 0
retry/checkpoint engine                     = 0
lease/fencing subsystem                     = 0
mandatory Builder/PAR process split         = 0
mandatory OtelBridge / collector/backend    = 0
mandatory Durable Agent                     = 0
mandatory Observational Memory              = 0
ScheduleOccurrence durable entity           = 0
EVENT ingress F1                            = 0
3H-04                                       = NOT JUSTIFIED
```

YAGNI is preserved without sacrificing named safety properties.

---

## 14. Reopen triggers

3H may reopen only for a Material Finding such as:

1. pinned Mastra/E2B behavior makes an approved runtime invariant impossible;
2. an enabled framework capability introduces unavoidable cross-role mutable state that cannot be partitioned without changing the runtime architecture;
3. a real Product Agent requires a runtime lifecycle not expressible by AgentRun + current selective Workflow/suspend model;
4. a real schedule consumer requires catch-up/backlog/concurrent occurrence semantics that invalidate F1 single-flight;
5. a future process split reveals current F5 proposals are non-rederivable and therefore need durable transport semantics;
6. the first deterministic sync/job consumer requires a genuinely new runtime class rather than an existing seam;
7. a new EVENT consumer requires runtime ingress semantics not owned by C-007/3I and existing PAR admission;
8. 3I proves spend-cap/credential authority cannot be enforced without a new runtime mechanism;
9. 3N proves C-013 admission semantics conflict materially with ActorRun/AgentRun realization rather than merely needing projection/proof;
10. Verification Observability cannot provide the required causal/provenance evidence using the frozen owner/runtime/provider boundaries.

Framework preference, newer feature availability, aesthetic symmetry or optionality alone do not reopen 3H.

---

## 15. Final closure verdict

```text
3H-01 = APPROVED
3H-02 = APPROVED
3H-03 = APPROVED
3H-04 = NOT JUSTIFIED
3H-R1 = APPROVED / CLOSED

Material Finding = NONE
reopen = NONE
remaining material 3H decision = 0

3H — Runtime & Agent Architecture = CLOSED / APPROVED
next phase = 3I — Security / Authority Architecture
```

3H is therefore closed as an architecture phase while its technology probes, security realization, deployment topology and recovery policy proceed under their designated owners.

This closure does **not** constitute C-018 and does **not** authorize merge or product implementation.