# 3H-02 — Production Agent Runtime Realization

**Status:** APPROVED pelo operador em 2026-08-16  
**Fase:** 3H — Runtime & Agent Architecture  
**Authority:** segunda decisão aprovada de 3H  
**Importante:** esta decisão não constitui C-018, não encerra 3H nem a Fase 3, e não autoriza implementação de produto, merge ou PR readiness.

## Decisão em uma frase

No Conexus F1, cada Production `AgentRun` é admitido e pinado pelo PAR antes de qualquer model/tool execution e roda por default sobre uma `RuntimeAgentProjection` efêmera/rebuildable derivada da Release exata e executada como Mastra `Agent` direto; Mastra fornece agent loop, thread/message memory substrate, selective durable suspension/resume, schedule mechanics, runtime events e workflows apenas quando um consumidor determinístico real os exige, enquanto Conexus permanece authority de AgentDefinition/Release, Conversation, AgentRun, ApprovalRequest, AgentTrigger, exact proposal/effect identity e terminal truth; schedule fire nunca executa Product Agent diretamente, mas entra por guarded PAR ingress com stable intended-slot identity, cursor per `(TriggerId, TriggerRevision)` e single-flight; Gateway permanece única authority de effect replay/idempotency; Editor/Stored Agents/latest/version overrides, universal Workflow, `createDurableAgent()`, EVENT/Signals externos, generic recovery engine, queue, lease e scheduler próprio não são baseline.

---

## 1. Authority, método e provenance

Esta decisão aplica a **DevelopmentConexus Engineering Method v1.0.0** e materializa, sem reabrir:

- 3C-10 — Production Agent Runtime owns runtime semantics enquanto Registry/Release/I&A/Brain/Connections/Gateway permanecem product authorities;
- 3C-R1 — somente `SCHEDULE` é AgentTrigger operacional no F1; `EVENT` permanece reservado até consumidor real;
- 3D-R1 — direct-call-first e nenhum generic scheduler/workflow/provider owner novo;
- 3E-01 / 3E-02 — `par.conversation`, `par.agent_run`, `par.approval_request`, `par.agent_trigger` já são inventory suficiente; `mastra_par` permanece substrate store isolado;
- 3F-02 / 3F-03 / 3F-R1 — runtime ingress/output é proposal/observation; exact approval subject permanece sealed e owner-controlled;
- 3G-01 — approval lifecycle/claim binding;
- 3G-05 — AgentRun pins, terminal write-once, suspension boundary, trigger races e Release evolution;
- 3G-06 — Gateway EffectAttempt/idempotency/replay sovereignty;
- 3G-R1 — behavioral closure sem generic FSM/workflow engine;
- 3H-01 — runtime mechanics/refs nunca viram domain authority apenas por persistirem no substrate.

Review/provenance não-autoritativa:

- `3H-FABLE-DIALOGUE-production-agent-runtime-realization.md`;
- `3H-FABLE-DIALOGUE-production-agent-runtime-realization-R2.md`;
- `3H-FABLE-DIALOGUE-production-agent-runtime-realization-R3.md`.

O desenho passou por dois rounds adversariais ChatGPT ↔ Fable e uma consolidação final, incluindo source-level review de Agent suspend/resume, workflow recovery/retry, schedules, Editor/version overrides, memory scoping e occurrence identity.

Convergência antes da ratificação:

```text
Material Finding contra approved authority = NONE
reopen required                            = NONE
Alternative A                              = GLOBAL MAXIMUM
Direct Agent baseline                       = CONFIRMED
universal Workflow baseline                = REJECTED
createDurableAgent baseline                = DEFERRED
schedule→Product Agent direct              = REJECTED
Stored Agent/Editor authority              = REJECTED
new infrastructure                         = NONE
```

---

## 2. Target invariant

```text
Conexus/PAR owns:
AgentDefinition meaning
Conversation identity
AgentRun admission + exact pins
ApprovalRequest authority
AgentTrigger authority
current proposal/effect identity
terminal truth

Mastra owns:
agent loop
thread/message substrate
memory machinery
suspend/resume snapshot mechanics
schedule mechanics
optional workflow mechanics
runtime events

Mastra runtime state
!= Product Agent authority
!= current Release
!= permission
!= approval
!= AgentRun terminal truth
!= external-effect replay authority
```

---

## 3. Final F1 runtime baseline

```text
exact Conexus Release composition
        ↓
derived RuntimeAgentProjection
        ↓
direct Mastra Agent instance
        ↓
AgentRun execution

wait requiring durable continuation
        ↓
selective direct-Agent tool suspension
        ↓
mastra_par snapshot
        ↓
PAR guard-gated resume

SCHEDULE
        ↓
derived Mastra schedule projection
        ↓
guarded schedule-fire ingress
        ↓
PAR occurrence + single-flight admission
        ↓
AgentRun creation/pinning
        ↓
direct Mastra Agent execution
```

Normative consequences:

```text
normal Product Agent execution → direct Agent
universal Workflow wrapper     → NOT baseline
createDurableAgent             → NOT baseline
Editor/Stored Agent            → NOT Product authority
EVENT / external Signals       → NOT operational F1
```

---

## 4. RuntimeAgentProjection — exact, derived, rebuildable

Every Production Agent invocation executes one exact runtime projection derived from already-admitted Conexus composition.

Conceptually:

```text
ReleaseRef
+
exact agent ArtifactRevision
+
model/provider/runtime pins
+
exact tool/capability projection
+
Brain/Connection/binding refs as applicable
+
memory policy
+
Release-pinned skills/goals configuration when a future admitted consumer enables them
→ RuntimeAgentProjection
→ Mastra Agent instance
```

Properties:

```text
derived
rebuildable
cacheable only as optimization
non-authoritative
never resolved by latest
```

No durable `RuntimeAgentRevision` or `MastraAgentRevision` class is introduced.

### 4.1 AgentRun exists before model execution

```text
resolve current admissible surface
→ admit AgentRun in PAR
→ pin exact Release/runtime/agent/tool/model facts
→ commit owner transaction
→ construct/retrieve exact RuntimeAgentProjection
→ only then start Mastra Agent execution
```

No Product Agent model/tool execution may precede its Conexus AgentRun admission.

---

## 5. Stored Agent / Editor / override channels are closed

Production Agent execution:

```text
MUST use the exact RuntimeAgentProjection instance directly
MUST NOT request draft/published/latest/versionId Stored Agent resolution
MUST NOT apply Editor overrides to the Product Agent projection
MUST NOT apply Mastra-instance sub-agent version overrides
MUST NOT accept request-body sub-agent version overrides
MUST NOT accept invocation-level sub-agent version overrides
MUST NOT use fallback whose meaning is latest/current Stored Agent state
```

If Mastra registration is mechanically required, it remains plumbing only; exact Conexus projection is the object selected for Product execution.

The PAR production host must not expose a live Stored-Agent mutation surface capable of altering Product Agent execution. HTTP/auth/deployer enforcement remains 3I/3J.

A suspended run resumes against a host-reconstructed exact old projection from AgentRun pins, never Editor/latest resolution.

---

## 6. Conversation and memory realization

`ConversationId` is Conexus identity.

```text
ConversationId
!= Mastra threadId
!= provider session
!= model context window
```

Mastra thread/message history realizes the Conversation substrate. `hub_control` does not mirror every message; `mastra_par` owns substrate history.

### 6.1 Scheduled runs are threadless by default

```text
scheduled report / monitor / automation
→ threadless AgentRun by default
```

Scheduled work does not silently become Conversation state.

### 6.2 Memory baseline

```text
Conversation/message history = ON when Conversation exists
Working/Agent Memory         = consumer-gated
Semantic Recall              = OFF until eval/qualification
Observational Memory         = OFF until eval/qualification
Memory Extractors            = OFF until admitted consumer/eval
```

The baseline is conservative deliberately. Mastra memory is cognition/context machinery, not permissions, payment status, Brain truth or business database authority.

### 6.3 Minimum memory scope

A memory resource key must include at minimum:

```text
Workspace
Project
Agent identity
memory class/purpose
subject/user when that memory class is subject-scoped
```

Artifact identity alone is insufficient because the same artifact may serve multiple Projects.

Conversation/thread state and Agent/Working Memory must not alias merely because project/agent/subject dimensions match.

---

## 7. Agent versus Workflow versus Durable Agent

### 7.1 Direct Mastra Agent — ADOPT baseline

Use for open-ended reasoning where model decides next action/tools.

### 7.2 Mastra Workflow — ADOPT selectively

Use only when a real behavior requires a predefined deterministic graph, for example:

```text
step A
→ deterministic branch
→ durable wait
→ step B
→ parallel deterministic work
```

Workflow durability/retry is mechanics. It is never Gateway effect replay authority.

### 7.3 `createDurableAgent()` — DEFER

Current capability primarily solves reconnectable/resumable stream ownership and long-running client observation with cache/pubsub/event machinery.

Reopen trigger:

> a real product requirement says a disconnected/reconnected client must reattach to the same in-flight token/tool stream without semantic restart.

### 7.4 Temporal/Inngest workflow engines — DEFER

They may become valid substrate choices when a concrete durable deterministic workflow requires stronger managed execution/retry/scale. They are not baseline merely because Mastra supports them.

---

## 8. Durable suspension and approval continuation

On a genuine wait, direct Agent may use Mastra persisted tool suspension.

```text
agent proposes governed effect
→ PAR persists current proposal + ApprovalRequest authority
→ runtime tool suspends
→ mastra_par persists suspension snapshot
→ process may disappear
→ later resume discovers exact suspended run/tool call
→ PAR rechecks authority
→ same AgentRun continues
```

### 8.1 Owner-first cross-database ordering

No distributed transaction is added between `hub_control` and `mastra_par`.

```text
FIRST PAR owner transaction:
currentPendingProposalRef / exact sealed subject
ApprovalRequest
commit

THEN:
runtime suspension/checkpoint
```

Owner wait without runtime snapshot is an honest recovery case. Runtime wait without owner authority is structurally unacceptable.

### 8.2 Resume outcome mapping

```text
ALLOW_ONCE
→ same AgentRun resumes
→ exact sealed proposal re-presented
→ PAR/Gateway guards rechecked
→ FIRST_CLAIM/effect admission

DENY | EXPIRED | STALE
→ typed non-effect resume data
→ no effect is represented as successful
→ same AgentRun may explain / choose alternative / finish / create a new exact proposal
```

Generic tool `suspend()/resumeData` is the semantic baseline. Native Mastra approve/decline is admissible only if 3L proves an adapter preserves these exact semantics.

---

## 9. Exact proposal/effect identity

Proposal/effect identity is minted and persisted owner-side at proposal admission.

Suspension carries it opaquely.

Every resume validates:

```text
proposalRef
+
presented tool args
→ exact match to sealed proposal subject
```

Mismatch fails closed.

```text
same proposalRef + changed args
-X-> execute

resume mints new identity
-X-> execute as old approved proposal
```

Mastra `toolCallId` remains correlation/mechanics only.

---

## 10. Gateway remains sole effect replay/idempotency authority

```text
runtime retried
!= effect may be retried
```

Mastra workflow retry, Agent repetition, process restart, resume retry, Durable Agent recovery or response-loss retry never grant effect replay authority.

Effectful runtime paths always reach Gateway with the exact owner-minted identity.

---

## 11. Boot recovery / restart

No substrate-initiated recovery/re-drive may regain Product Agent authority without re-entering PAR guards before new model/tool/effect authority is exercised.

This is **guarded recovery**, not recovery-never.

### 11.1 Suspended runs

```text
discover suspended run
→ map exact Conexus AgentRun
→ rebuild exact pinned RuntimeAgentProjection
→ recheck non-terminal + proposal/wait authority
→ resume only on explicit current decision/input
```

### 11.2 Schedule-ingress workflow if selected

If 3L chooses a one-step workflow adapter, it contains only deterministic PAR fire submission and contains no Product Agent invocation, LLM call, business tool or Gateway effect.

Workflow replay can therefore only resubmit the same occurrence to idempotent PAR admission.

### 11.3 Plain active Agent recovery remains qualification-sensitive

Exact Mastra behavior for a crashed ordinary active Agent remains a `CX-AGENT-MASTRA-01` fact. Whatever the substrate does, any re-drive must hit PAR guards before renewed authority.

---

## 12. Cancellation and late runtime state

```text
PAR commits AgentRun CANCELLED
→ best-effort runtime abort
→ future resume/recovery checks terminal state
→ late completion/tool output/snapshot activity = telemetry/quarantine only
```

A surviving snapshot cannot reauthorize a cancelled AgentRun.

---

## 13. Schedule ownership partition

```text
par.agent_trigger
→ enabled/disabled truth
→ current TriggerRevision
→ cron/timezone semantics
→ Project/Agent relationship
→ owner occurrence cursor

mastra_par schedule row
→ timer mechanics
→ derived projection/correlation facts
```

Schedule row is mechanics, never trigger authority.

### 13.1 Projection may contain

```text
deterministic projection id
cron
timezone
runtime active/paused state needed by Mastra
TriggerId / TriggerRevision correlation
transport-only correlation
```

### 13.2 Projection must not own

```text
Product Agent prompt/business instruction
ReleaseRef
agent/model/tool composition
approval policy
memory authority
business effect identity
```

Product invocation semantics are resolved owner-side after fire admission.

---

## 14. Authority-first schedule projection mutation

```text
CREATE / UPDATE / ENABLE / DISABLE
→ commit AgentTrigger authority in hub_control
→ reconcile derived Mastra schedule projection afterward
```

Missing projection causes availability loss. Premature live projection creates unauthorized wake surface. Availability loss is safer.

Reconciliation uses deterministic projection identity and idempotent upsert; no row per trigger revision is required.

---

## 15. Schedule fire is guarded ingress, never direct Product Agent execution

F1 rejects Mastra agent-target schedule as Product execution path because it can invoke an Agent directly and can persist invocation prompt.

Required flow:

```text
schedule wake
→ guarded PAR schedule-fire ingress
→ current trigger/revision/schedule validation
→ occurrence + single-flight admission
→ exact current Release resolved/pinned
→ AgentRun created
→ commit
→ RuntimeAgentProjection built
→ direct Mastra Agent invoked
```

Exact transport stays 3L.

Candidate mechanisms:

1. proven substrate path exposes stable intended-slot identity before PAR admission;
2. narrow adapter around scheduler fire exposes that identity;
3. owner-side intended-slot derivation/validation only if delayed-redelivery/DST aliasing is proven safe.

A static one-step workflow-target adapter is plausible, not architecture dogma.

---

## 16. Stable occurrence identity and cursor

`claimId` or any per-delivery token is not the logical occurrence key.

Architecture requires:

> one logical scheduled occurrence presents a stable intended-slot key **before AgentRun admission**, and duplicate/redelivery presents the same logical key.

Conceptually:

```text
TriggerId
+
TriggerRevision
+
intended scheduled-slot identity
```

Exact Mastra field/adapter representation remains 3L.

### 16.1 Owner occurrence cursor

No `ScheduleOccurrence` durable class is created.

`par.agent_trigger` holds a high-water/consumption fact scoped per current:

```text
(TriggerId, TriggerRevision)
```

Revision change starts a new cursor scope.

### 16.2 Atomic owner admission

One PAR transaction:

```text
lock/CAS trigger owner fact
→ confirm enabled + exact current revision
→ validate occurrence against current cron/timezone
→ compare/consume cursor
→ enforce single-flight
→ resolve/pin exact current Release
→ create AgentRun if admitted
→ commit
```

No Mastra/external I/O occurs inside the transaction.

---

## 17. Schedule semantics are revalidated at admission

Runtime schedule cron/timezone is mechanics, not authority.

```text
stale/corrupt runtime row
+ occurrence invalid under current TriggerRevision schedule
→ reject wake
→ no AgentRun
```

This is admission validation, not a second scheduler.

---

## 18. Single-flight / overlap

F1 allows at most one non-terminal trigger-origin AgentRun per SCHEDULE AgentTrigger.

```text
new valid occurrence + no active run
→ consume occurrence
→ admit AgentRun

new valid occurrence + non-terminal run exists
→ consume occurrence as SKIPPED
→ no AgentRun
```

Consume-on-skip prevents later redelivery from becoming hidden backlog/catch-up.

Skipped details live in OBS/telemetry; no durable skipped-occurrence class exists.

No F1 backlog/catch-up semantics.

Reopen trigger:

> first real Product Agent whose correctness depends on executing every scheduled occurrence distinctly.

---

## 19. EVENT / Signals / Inbox

`EVENT` remains reserved/not operational in F1.

No Conexus Product Agent code path accepts external/business Mastra Signals, Webhook Signals, Notification Inbox or custom Signal Provider as Product Agent authority in this phase.

Those capabilities are valid future mechanics after C-007/Decision Loop defines external trust, normalization, dedupe and ingress semantics.

Internal Mastra signal use does not create EVENT authority by itself.

---

## 20. Runtime refs — pins versus expectations

### Immutable admitted pins

```text
runtime kind/version admitted for AgentRun
exact Release/composition identity
exact model/tool/runtime pins
```

These are immutable historical authority about what was admitted.

### Correlation/current-state refs

```text
Mastra thread ref
Mastra run ref
schedule projection ref
suspended-run ref / toolCall ref
trace/provider refs
```

These are correlation/history or expectations to confront with live substrate state when reused; they do not prove liveness/permission.

---

## 21. Runtime events and observability

Mastra events such as:

```text
complete
error
suspended
resumed
schedule fired
```

are observational/proposal inputs.

```text
runtime complete
→ PAR checks AgentRun still non-terminal/admissible
→ only PAR commits COMPLETED
```

Mastra traces/logs/metrics/tool hooks are **ADOPTED as Operational Telemetry / diagnostics / defense-in-depth surfaces**, correlated to Conexus IDs, but never correctness, approval or terminal authority.

No second runtime status mirror is created.

---

## 22. Old Release / runtime continuation

```text
A17 pinned R17/M17
current R19/M19
→ A17 rebuilds R17/M17 projection
→ no latest migration
```

Deployment retains old supported runtime long enough to drain/recover non-terminal runs or later recovery policy fails them honestly.

Snapshot/thread schema upgrade compatibility is mandatory 3L qualification before runtime version changes; no generic snapshot migration engine.

---

## 23. Mastra capability coverage audit — 2026-08-16

This section records the explicit framework-coverage audit performed after operator conceptual approval so the design does not depend on conversation memory.

Mastra capabilities are evidence/substrate options, not obligations to enable every feature.

### 23.1 ADOPT now

```text
Mastra Agent
→ default open-ended Product Agent loop

AgentController / Mastra coding harness
→ Builder/collaborative coding realization already governed by 3H-01

Mastra thread/message storage
→ Conversation substrate

Tool create/execute surfaces
→ wrapped behind Capability Gateway

Agent/tool/workspace hooks
→ correlation, validation, diagnostics, defense-in-depth

Agent explicit suspension/resume
→ durable wait mechanics

Schedules
→ timer mechanics behind guarded PAR ingress

Traces / logs / metrics
→ Operational Telemetry input to OBS
```

### 23.2 ADOPT selectively on real consumer

```text
Mastra Workflows
→ deterministic multi-step Product behavior only

Working Memory / Agent Memory
→ when exact Product Agent consumer needs persistent context

First-Class Skills
→ attach only from Release-pinned Conexus agent/package semantics;
   never dynamic independent authority

Goals
→ may be runtime cognition/objective mechanism;
   LLM-judged goal completion never substitutes Conexus correctness/acceptance

Background Tasks / progress surfaces
→ when a long-running tool/product UX needs them

Browser / Workspace / code-execution capabilities
→ only under explicit consumer + 3I security/Gateway/sandbox boundaries
```

### 23.3 DEFER to eval / later phase

```text
Semantic Recall
Observational Memory
Memory Extractors
Response Caching
createDurableAgent / resumable stream cache+pubsub
Agent Network / multi-agent / subagents as Product topology
A2A / ACP edge interoperability
Channels (Slack/Discord/etc.)
Temporal/Inngest workflow substrate
Mastra Platform managed environments/databases/workspaces/regions
```

Routing:

```text
memory quality/recall/extractors        → 3L eval + Product consumer
Rubric Scorers / Datasets / Experiments
/Gates & Verdicts                       → 3L / 3N evidence tooling
observability backend/ClickHouse        → 3J / 3L based on scale
managed environments/workspaces         → 3J / 3L deployment qualification
signals/inbox/webhooks                  → first EVENT consumer / C-007 / 3I
multi-agent/subagents                    → Decision Loop on real consumer
```

### 23.4 REJECT as Product authority

```text
Agent Editor / Stored Agents / File-Based Agents as independent SoT
latest/draft/published runtime version resolution
Mastra auth/RBAC as replacement for Conexus authority
native tool approval as replacement for ApprovalRequest/Gateway claim semantics
Mastra goal/eval score as acceptance authority
Mastra memory as Brain/business/permission authority
schedule row as AgentTrigger authority
runtime complete as AgentRun terminal authority
workflow retry as effect replay authority
Mastra Cloud/Platform as architectural requirement
```

File-Based Agents or Editor may remain development/diagnostic/compile conveniences only if they cannot alter Product execution independently of exact Conexus Release authority.

### 23.5 Why not enable every Mastra feature

The framework itself separates primitives by problem shape:

```text
open-ended reasoning         → Agent
predefined deterministic flow → Workflow
reconnectable same stream     → Durable Agent
conversation/user context     → appropriate Memory layer
external wake/event           → Signals/Inbox
quality evaluation            → Evals/Scorers/Gates
```

Conexus deliberately selects the minimum primitive whose semantics match the current consumer. Unused optionality is not architecture debt.

---

## 24. Technology qualification — `CX-AGENT-MASTRA-01`

3H-02 freezes properties, not exact library version/API names.

3L must prove controls firing, including at minimum:

```text
exact Release projection; no latest/Editor override
Conversation/memory cross-Project isolation
suspend → process loss → exact guard-gated resume
ALLOW_ONCE / DENY / EXPIRED / STALE exact semantics
same proposalRef + changed args fails closed
Gateway dedupe under repeated resume/retry
plain active Agent crash/restart actual behavior
cancelled suspended snapshot cannot resume authority
stable intended-slot occurrence key before AgentRun admission
duplicate/redelivery → no second AgentRun
runtime schedule drift → wake rejected
single-flight consume-on-skip
trigger revision/update/disable races
idempotent schedule projection reconciliation
old suspended run survives supported runtime upgrade or upgrade blocks/drains honestly
runtime complete cannot self-terminalize AgentRun
Mastra telemetry correlates to Conexus IDs
```

Additional capability evals before enabling optional features:

```text
Working Memory usefulness + scope
Semantic Recall precision/leakage/cost
Observational Memory fidelity/cost/isolation
Memory Extractor accuracy/provenance
Goals usefulness vs LLM-judge false-positive risk
Skills package/projection integrity
Durable Agent reconnect semantics/cost if consumer arises
Workflow/Temporal replay characteristics if consumer arises
Rubric/Gates calibration before using as verification evidence input
```

Probe failure reopens substrate/realization first, not domain semantics automatically.

---

## 25. Storage isolation

```text
hub_control = domain authority
mastra_par  = threads/messages/memory/snapshots/schedules/runtime internals
```

PAR domain code never queries `mastra_par` tables directly.

If occurrence transport needs schedule metadata/history, it uses the qualified runtime boundary/API, never cross-schema SQL.

`mastra_builder` and `mastra_par` remain isolated.

---

## 26. Failure/recovery partition

3H-02 decides what replay/resume/admission may mean.

3M later decides:

```text
orphan timeout
admitted-but-undispatched recovery
active process-loss terminalization
missing/corrupt suspension recovery
unsupported old snapshot/runtime recovery
operator repair/reconciliation
```

3J owns deploy/supervision/recovery topology. No RecoveryEngine/lease is created here.

---

## 27. YAGNI / explicit non-build list

```text
new module                              = 0
new ScheduleOccurrence durable class    = 0
new queue                               = 0
new scheduler                           = 0
universal Workflow wrapper              = 0
Durable Agent cache/pubsub requirement  = 0
lease/fencing subsystem                 = 0
retry engine                            = 0
checkpoint engine                       = 0
runtime-state mirror                    = 0
Stored Agent registry                   = 0
memory service/vector DB requirement    = 0
snapshot migration engine               = 0
EVENT ingress/event bus                 = 0
Temporal/Inngest requirement            = 0
Mastra Platform requirement             = 0
```

The per-revision occurrence cursor is admission/idempotency state on an existing `par.agent_trigger`, not a scheduler.

---

## 28. Alternatives — final

### A — Direct Agent + selective suspension + guarded schedule ingress

**ADOPT / GLOBAL MAXIMUM.**

### B — universal Workflow wrapper

**REJECT baseline.** Adds durable step/retry/recovery semantics to every run without a current consumer.

### C — `createDurableAgent()` for every Product Agent

**DEFER.** Reconnectable-stream/cache/pubsub solves a distinct UX requirement not currently required.

### D — Mastra schedule directly targets Product Agent

**REJECT.** Bypasses AgentRun admission and can carry persisted invocation semantics.

### E — Stored Agent / Editor-driven Product definition

**REJECT.** Creates independent version/override/latest paths outside Registry/Release.

---

## 29. Reopen triggers

Reopen 3H-02 only on material evidence such as:

```text
direct Agent suspension cannot reliably rediscover/resume exact waits
no feasible schedule ingress can expose stable occurrence identity before admission
occurrence identity cannot avoid delayed-redelivery aliasing even with narrow adapter
single-flight skip breaks correctness for a named every-occurrence consumer
Product requires reconnectable same-run token/tool stream
Product requires a durable deterministic Workflow graph as baseline
subagent/network becomes real Product requirement and cannot preserve exact Release projection
old-runtime drain/support impossible without changing AgentRun semantics
current Mastra primitive materially changes and invalidates a frozen enforcement assumption
```

Framework preference, new feature availability, Studio convenience or generic future optionality are not reopen triggers.

---

## 30. Final result

```text
Material Finding against approved authority = NONE
reopen required                              = NONE
Alternative A                                = GLOBAL MAXIMUM
Direct Agent baseline                         = APPROVED
selective suspension                          = APPROVED
schedule guarded ingress                     = APPROVED
occurrence cursor                             = per-(TriggerId, TriggerRevision)
occurrence identity                           = stable intended slot before admission; exact mechanism 3L
Gateway replay authority                      = PRESERVED
Editor/Stored Agent authority                 = REJECTED
universal Workflow                            = REJECTED baseline
createDurableAgent                            = DEFERRED
Mastra capability coverage audit              = COMPLETED; no missing material primitive found
new infrastructure                            = NONE
YAGNI violation                               = NONE found
Buildability                                  = CREDIBLE; `CX-AGENT-MASTRA-01` mandatory before deploy
```

## 31. Ratificação

A aprovação explícita do operador em 2026-08-16 congela esta 3H-02.

3H permanece aberta. Próximo pacote esperado:

> **3H-03 — Runtime Isolation, Correlation & Handoff**, sujeito ao mesmo Decision Loop e review adversarial antes de authority.
