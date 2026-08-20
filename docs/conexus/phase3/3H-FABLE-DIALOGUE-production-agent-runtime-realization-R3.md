# 3H — ChatGPT ↔ Fable Dialogue — Production Agent Runtime Realization — R3

**Status:** FINAL CONSOLIDATION / NON-AUTHORITATIVE  
**Phase:** 3H — Runtime & Agent Architecture  
**Candidate decision:** `3H-02 — Production Agent Runtime Realization`  
**PR:** #40  
**Branch:** `agent/conexus-phase-3-system-design`  
**Starting HEAD:** `3e0c9ffaf7e2de0284bea67b60109c4bf62e3be7`  
**Continuation of:**
- `3H-FABLE-DIALOGUE-production-agent-runtime-realization.md`
- `3H-FABLE-DIALOGUE-production-agent-runtime-realization-R2.md`

**Important:** this file is the final ChatGPT consolidation of the adversarial 3H-02 dialogue. It is not authority, does not approve/create 3H-02, does not update `LEDGER.md`, does not close 3H, does not constitute C-018, and does not authorize implementation, merge or PR readiness. Operator ratification remains required.

---

## 0. Protocol / provenance

This consolidation follows the same Phase 3 protocol used for 3H-01:

1. reconstruct authority from `AGENTS.md` and the required read chain;
2. apply DevelopmentConexus Engineering Method v1.0.0;
3. treat approved 3A–3H-01 decisions as baseline, reopening only for a material Finding with a concrete reachable failure class and a globally superior correction;
4. use current Mastra behavior as evidence, never authority;
5. prefer the smallest realization that closes current failure classes;
6. no new durable record/module/queue/scheduler/workflow wrapper/recovery engine/lease/pubsub/cache merely for optionality;
7. ChatGPT↔Fable agreement is not operator approval.

Round 1 and Round 2 established:

```text
Material Finding against approved authority = NONE
reopen required                              = NONE
Alternative A                                = GLOBAL MAXIMUM
Direct Agent baseline                         = CONFIRMED
universal Workflow baseline                  = REJECTED
createDurableAgent baseline                  = DEFERRED
Mastra schedule→Production Agent direct      = REJECTED
Stored Agent/Editor as Product Agent source  = REJECTED
```

Round 1 produced `FBL-R1-01..07`. Round 2 accepted ChatGPT's evidence corrections and produced `FBL-R2-01..06`. This R3 incorporates both sets and removes the weaker projection-digest alternative identified by Fable.

---

# Round 3 — ChatGPT — Final Consolidation

## 1. Final method verdict

> **CURRENT STRUCTURE CONFIRMED.**

No material Finding requires reopening:

- 3C-10 Production Agent Runtime module boundary;
- 3C-R1 trigger/Event scope reconciliation;
- 3D-R1 dependency architecture;
- 3E-01 / 3E-02 persistence ownership and durable inventory;
- 3F-02 / 3F-03 / 3F-R1 contract and exact approval-subject laws;
- 3G-01 approval lifecycle;
- 3G-05 AgentRun / suspension / trigger semantics;
- 3G-06 Gateway effect / idempotency semantics;
- 3G-R1 behavioral closure;
- 3H-01 runtime-mechanism-versus-authority pattern.

3H-02 is a realization decision. It does not introduce a second Product Agent ontology.

### 1.1 Final target invariant

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

## 2. Final architecture baseline

The F1 Production Agent realization is:

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

A universal Mastra Workflow wrapper is not the baseline.

`createDurableAgent()` is not the baseline.

Mastra Editor / Stored Agents are not the Production Agent authoring or resolution authority.

---

## 3. RuntimeAgentProjection — exact, derived, rebuildable

Every Production Agent invocation executes one exact runtime projection derived from the already-admitted Conexus composition.

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

### 3.1 Projection identity

The realization must key/cache projections strongly enough that:

```text
same exact Release/composition → equivalent projection
changed Release/composition    → distinct projection identity/config
```

The exact string form of Mastra `agentId` remains 3L/implementation.

### 3.2 AgentRun exists before model execution

Law:

```text
resolve current admissible surface
→ admit AgentRun in PAR
→ pin exact Release/runtime/agent/tool/model facts
→ commit owner transaction
→ construct/retrieve exact RuntimeAgentProjection
→ only then start Mastra Agent execution
```

No Production Agent model/tool execution may precede its Conexus AgentRun admission.

---

## 4. Stored Agent / Editor / version-override channels are closed

Round 2 corrected an overbroad evidence claim: plain `getAgentById(id)` is registry-first for code-defined agents. The failure class nevertheless remains real on explicit Editor/version/override-capable paths.

The final law is therefore mechanism-specific rather than rhetorical:

Production Agent execution:

```text
MUST use the exact RuntimeAgentProjection instance directly
MUST NOT request draft/published/latest/versionId Stored Agent resolution
MUST NOT apply Editor overrides to the Product Agent projection
MUST NOT apply Mastra-instance sub-agent version overrides
MUST NOT accept request-body sub-agent version overrides
MUST NOT accept invocation-level sub-agent version overrides
MUST NOT use any fallback whose meaning is latest/current Stored Agent state
```

If registration inside a Mastra instance is mechanically required, it is plumbing only; the exact Conexus projection remains the object selected for Product Agent execution.

The PAR production host must not expose a live Stored-Agent mutation surface capable of altering Product Agent execution. Exact HTTP/security/deployer enforcement belongs to 3I/3J, but the resolution prohibition is 3H-02 authority.

### 4.1 Resume path

A suspended AgentRun is resumed against a host-reconstructed exact old projection derived from the AgentRun's pins. Resume does not rediscover the Product Agent from Editor/latest state.

---

## 5. Conversation and runtime thread mapping

`ConversationId` is Conexus identity.

Mastra thread/message history is the substrate realization.

```text
ConversationId
!= Mastra threadId
!= provider session
!= model context window
```

A Conversation maps to an opaque Mastra thread ref recorded for correlation/reconstruction.

`hub_control` does not mirror Mastra messages merely for redundancy. `mastra_par` owns the substrate history under the stronger durability/backup obligations already routed by 3E.

### 5.1 Scheduled execution remains threadless by default

F1 SCHEDULE does not silently create/reuse a Conversation.

```text
scheduled report / monitor / automation
→ threadless AgentRun by default
```

A future consumer that explicitly requires scheduled work to occur inside a durable user-facing Conversation returns through the Decision Loop.

---

## 6. Agent Memory scope and isolation

Memory machinery belongs to Mastra; memory policy/scope belongs to Conexus.

F1 remains conservative:

```text
Conversation/message history = enabled when Conversation exists
Working/Agent Memory         = enabled only when the agent/consumer explicitly requires it
Semantic Recall              = OFF until eval/qualification
Observational Memory         = OFF until eval/qualification
```

### 6.1 Minimum key dimensions

A memory resource key must include at minimum:

```text
Workspace
Project
Agent identity
memory class/purpose
subject/user when that memory class is subject-scoped
```

`Workspace` is the Conexus tenant dimension; no speculative extra Organization identity is introduced.

Artifact identity alone is never sufficient because the same agent ArtifactRevision can be used by more than one Project.

### 6.2 Memory-class discriminator

The realization must prevent Conversation/thread-scoped state from aliasing Agent/Working Memory merely because they share the same project/agent/subject dimensions.

This is satisfied by either:

```text
explicit memory-class/purpose discriminator in derived keys
```

or a 3L-proven Mastra mapping that makes the relevant stores/scopes disjoint even under equal resource strings.

---

## 7. Direct Agent is the default execution primitive

F1 normal Product Agent execution uses a direct Mastra Agent.

A Mastra Workflow is introduced only when a concrete Product Agent behavior actually needs a durable multi-step deterministic graph such as:

```text
step A
→ deterministic branch
→ durable wait
→ step B
→ parallel deterministic work
```

A workflow is not added merely because AgentRun is durable as a domain record.

`createDurableAgent()` remains deferred because its reconnectable-stream/cache/pubsub behavior has no current correctness consumer.

Named reopen trigger:

> a real product requirement that a disconnected/reconnected client must reattach to the same in-flight token/tool stream without semantic restart.

---

## 8. Durable suspension is selective, not universal workflow wrapping

When an AgentRun reaches a genuine durable wait, the direct Agent may use Mastra's persisted tool suspension mechanics.

Current intended use:

```text
agent proposes governed effect
→ PAR persists exact current proposal + ApprovalRequest authority
→ runtime tool suspends
→ mastra_par persists suspension snapshot
→ process may disappear
→ later resume discovers exact suspended run/tool call
→ PAR rechecks authority
→ same AgentRun continues
```

Direct Agent suspension is runtime mechanics; `ApprovalRequest` remains the approval wait authority.

---

## 9. Owner-first cross-database ordering

`hub_control` and `mastra_par` are separate persistence authorities and no distributed transaction is introduced.

For approval-required waits the ordering is deliberately asymmetric:

```text
FIRST:
PAR owner transaction
→ persist currentPendingProposalRef / exact proposal subject
→ persist ApprovalRequest authority
→ commit

THEN:
runtime suspension/checkpoint in mastra_par
```

Why:

```text
owner wait exists, runtime snapshot missing
→ honest orphan/recovery case; effect cannot execute without guards

runtime suspended, owner wait missing
→ substrate state would become the only discoverable authority
→ structurally worse
```

No cross-DB transaction coordinator is added.

---

## 10. Resume semantics — ALLOW_ONCE / DENY / EXPIRED / STALE

The runtime resume surface must faithfully preserve the already-approved four-outcome semantics.

### 10.1 ALLOW_ONCE

Human approval does not execute an effect by itself.

```text
ALLOW_ONCE recorded
→ same AgentRun resumes
→ exact sealed proposal is re-presented
→ PAR/Gateway guards rechecked
→ FIRST_CLAIM/effect admission
→ Gateway executes or refuses according to current authority
```

### 10.2 DENY / EXPIRED / STALE

These resume the same AgentRun as typed **non-effect outcomes**.

```text
DENY
EXPIRED
STALE
→ runtime receives typed data saying effect did not execute
→ agent may explain / choose safe alternative / finish / create a genuinely new proposal
```

They are not masqueraded as successful tool execution.

Generic tool `suspend()/resumeData` is therefore the semantic baseline. Native approve/decline may be used internally only if 3L proves an adaptation that preserves these exact semantics.

---

## 11. Exact proposal/effect identity is owner-minted and sealed

The runtime/tool never mints a new effect identity merely because it resumed or retried.

At proposal admission PAR owns the exact proposal/effect identity and subject.

The suspension carries that identity as an opaque reference.

On every resume:

```text
presented proposalRef
+
presented tool args
→ compare against sealed exact proposal subject
```

Mismatch fails closed.

```text
changed args under same proposalRef
-X-> execute

new UUID / re-minted identity on resume
-X-> execute as same approved proposal
```

A genuine changed effect requires a new exact proposal and, where applicable, a new ApprovalRequest.

Mastra toolCallId is correlation/mechanics only, never approval/effect authority.

---

## 12. Gateway remains sole external-effect replay authority

Mastra workflow retries, Agent repetition, process restart, resume retries or response-loss retries never grant external-effect replay authority.

Any effectful runtime step must ultimately reach Gateway with the exact owner-minted identity.

Workflow retry counts or checkpoint state are not trusted as exactly-once semantics.

```text
runtime retried
!= effect may be retried
```

The Gateway's `EffectAttempt` / idempotency / ambiguity laws remain sovereign.

---

## 13. Boot recovery / restart law

Current Mastra evidence includes workflow boot restart and optional Durable Agent recovery that can re-issue LLM/tool calls. Exact behavior for a crashed **plain active Agent** remains a 3L Unknown and must stay Unknown until probed.

The final architecture law is therefore substrate-agnostic:

> **No substrate-initiated boot recovery/re-drive may regain Product Agent authority without re-entering PAR guards before new model/tool/effect authority is exercised.**

This is intentionally **not** a blanket “recovery never” law.

### 13.1 Suspended runs

Preferred boot behavior for suspended Product Agent runs:

```text
discover suspended run
→ map to exact Conexus AgentRun
→ rebuild exact pinned RuntimeAgentProjection
→ recheck AgentRun non-terminal + current proposal/wait authority
→ resume only on explicit current input/decision
```

No blanket replay merely because a snapshot exists.

### 13.2 Adapter workflow replay

If the schedule-ingress realization uses a Mastra Workflow, that workflow contains **only** the deterministic PAR fire-submission step.

It contains no:

```text
Product Agent invocation
LLM call
business tool execution
Gateway effect execution
```

Therefore an automatic workflow replay can at most resubmit the same occurrence to idempotent PAR admission.

### 13.3 Worst-case active-run re-drive

If 3L proves that a crashed active direct Agent can be re-driven by the qualified host, the re-drive path must perform PAR non-terminal/current-authority checks before any new model/tool activity. A cancellation that wins before the guard blocks the re-drive; a cancellation that races after the guard still retains owner-terminal/late-output protection.

Exact topology/configuration belongs to 3J/3L.

---

## 14. Cancellation / late runtime state

PAR terminal truth is written before best-effort physical interruption.

```text
AgentRun CANCELLED
→ request runtime abort when active
→ future resume/recovery paths recheck terminal state
→ late completion/tool output/snapshot activity = telemetry/quarantine only
```

A surviving suspended snapshot after cancellation cannot reauthorize the AgentRun.

A missing active-run physical abort primitive is not an authority blocker because PAR terminal guards still refuse late authority; its operational cost/latency consequences remain 3L/3M.

---

## 15. Schedule ownership partition

`AgentTrigger` is the Product authority.

A Mastra schedule row is a derived runtime projection.

```text
par.agent_trigger
→ current enabled/disabled truth
→ current TriggerRevision
→ cron/timezone semantics
→ agent/Project relationship
→ owner occurrence cursor

mastra_par schedule row
→ timer mechanics
→ derived correlation/projection facts
```

The runtime row never becomes source of Product Agent invocation semantics.

---

## 16. What the runtime schedule row may contain

The projection may carry the timer mechanics Mastra needs, including:

```text
deterministic schedule projection id
cron
timezone
runtime status needed to realize active/paused mechanics
TriggerId / TriggerRevision correlation metadata
transport-only correlation data
```

It must not be the source of:

```text
Product Agent prompt/business instruction
ReleaseRef
agent/model/tool composition
approval policy
memory authority
business effect identity
```

All semantic invocation content is resolved owner-side after schedule-fire admission from current AgentTrigger + exact current admissible Release.

A schedule row may therefore be stale/corrupt and still be unable to select Product Agent semantics by itself.

---

## 17. Schedule projection mutation ordering

Cross-DB atomicity is not introduced.

The safe ordering is authority-first:

```text
CREATE / UPDATE / ENABLE / DISABLE
→ commit AgentTrigger authority in hub_control
→ reconcile derived Mastra schedule projection afterward
```

Reason:

```text
missing projection after authority commit
→ availability loss

live projection before authority commit
→ unauthorized fire surface
```

Availability loss is the safer failure.

Every fire still re-enters current PAR guards, so a stale row that cannot be paused/deleted produces reject/telemetry noise rather than Product Agent execution.

Projection reconciliation is idempotent using a deterministic runtime schedule id derived from TriggerId. No per-revision schedule-row accumulation is required.

---

## 18. Schedule fire is an ingress proposal, never direct Product Agent execution

F1 does **not** use Mastra's agent-target schedule path to run the Production Agent directly.

A schedule fire must first reach a narrow schedule-fire ingress that supplies enough immutable occurrence evidence for PAR admission.

Then:

```text
schedule wake
→ PAR validates current Trigger authority
→ occurrence admission/single-flight transaction
→ exact current Release resolved/pinned
→ AgentRun created
→ commit
→ RuntimeAgentProjection built
→ direct Mastra Agent invoked
```

The exact transport mechanism remains 3L.

Candidate mechanisms include:

1. a proven substrate path that exposes a stable intended-slot identity to the PAR ingress before admission;
2. the smallest narrow adapter around the scheduler fire event that surfaces that identity;
3. owner-side intended-slot derivation/validation from current authoritative cron/timezone, if 3L proves delay/DST/redelivery ambiguity is bounded safely.

A static one-step workflow-target adapter remains a currently plausible mechanism, not architectural dogma.

---

## 19. Stable occurrence identity — property, not Mastra field name

`claimId` is explicitly rejected as the logical dedupe identity because current evidence shows it is generated per delivery.

Architecture freezes only:

> one logical scheduled occurrence must present a **stable intended-slot key available before AgentRun admission**, and duplicate/redelivery of that occurrence must present the same logical key.

A conceptual key is:

```text
TriggerId
+
TriggerRevision
+
intended scheduled-slot identity
```

The exact substrate field/adapter representation is 3L.

Current internal Mastra `scheduledFireAt` is useful evidence, but 3H-02 does not freeze that field because its pre-admission transport is not yet proven.

### 19.1 Owner-side derivation candidate

Owner-side slot derivation is admissible only if qualification proves it cannot alias delayed redelivery to a newer slot incorrectly.

The edge case to falsify is:

```text
occurrence A is delayed beyond occurrence B's nominal slot
→ arrival-time derivation must not relabel A as B
```

If this cannot be proved, the realization must carry a substrate intended-slot token through a narrow adapter.

---

## 20. Occurrence cursor is owner-local and scoped per TriggerRevision

No `ScheduleOccurrence` durable class is introduced.

`par.agent_trigger` holds the minimum owner-local occurrence-consumption fact equivalent to a high-water cursor for the **current `(TriggerId, TriggerRevision)` scope**.

A TriggerRevision change starts a new cursor scope.

This is required because comparing scheduled instants across changed cron/timezone revisions can reject valid new-revision occurrences.

Within one revision, the occurrence key uses the intended timezone-aware instant/slot.

### 20.1 Atomic admission

For a valid new occurrence, one PAR transaction performs the relevant operations together:

```text
lock/CAS trigger owner fact
→ confirm enabled + exact current TriggerRevision
→ validate occurrence against current cron/timezone semantics
→ compare/consume occurrence cursor
→ enforce single-flight
→ resolve/pin exact current Release
→ create AgentRun when admitted
→ commit
```

No Mastra/external call occurs inside this transaction.

---

## 21. Current schedule semantics are revalidated at admission

A runtime schedule row's cron/timezone is mechanics, not authority.

Therefore a fire must be validated against the **current AgentTrigger revision and schedule definition**.

```text
runtime row mutated/stale
+ occurrence not valid under current TriggerRevision cron/timezone
→ refuse fire
→ no AgentRun
```

The weaker alternative “row carries owner projection digest/token, therefore trust its slot” is rejected: provenance of the row does not prove the occurrence belongs to the current cron/timezone schedule.

This validation is not a second scheduler. Mastra still decides *when to wake*. PAR only judges whether a presented wake is admissible under current owner semantics.

---

## 22. Single-flight / overlap law

F1 allows at most one non-terminal trigger-origin AgentRun per SCHEDULE AgentTrigger.

Mastra's scheduler does not own this Product law.

```text
new valid occurrence
+ no non-terminal run for trigger
→ consume occurrence
→ admit AgentRun

new valid occurrence
+ existing non-terminal run
→ consume occurrence as SKIPPED
→ do not create AgentRun
```

### 22.1 Consume-on-skip is required

A skipped occurrence is consumed in the same owner transaction.

Otherwise a later redelivery after the active run finishes would turn the skipped occurrence into hidden backlog/catch-up behavior.

Skipped occurrence detail is OBS/telemetry; no durable skipped-occurrence record class is created.

### 22.2 No backlog/catch-up semantics in F1

Missed or overlapping occurrences are not queued for later replay.

Current automation consumers are expected to use their own cursor/state to process “since last successful run” where necessary.

Named reopen trigger:

> first real Product Agent whose correctness depends on executing every scheduled occurrence distinctly rather than on latest-state/cursor processing.

That consumer may justify backlog/catch-up semantics later.

---

## 23. Trigger disable/update races remain owner-guarded

Every fire rechecks the current `AgentTrigger` row under a conflicting owner-local guard.

```text
DISABLE commits first
→ stale fire refused

fire admission commits first
→ admitted AgentRun remains valid
→ later DISABLE does not retroactively cancel it
```

For UPDATE/revision change:

```text
old revision fire after new revision commits
→ refused
```

No cross-DB lock or distributed lease is added.

---

## 24. EVENT / Signals remain outside operational F1

Only SCHEDULE is enabled here.

No Conexus Product Agent code path sends external/business Mastra Signals into Production Agent threads in F1.

Signals used internally by Mastra mechanics do not create EVENT authority, provided no Conexus/external ingress can use them to steer a Production Agent outside a PAR-admitted invocation.

First real EVENT consumer returns through C-007/Decision Loop for trust, normalization, dedupe and ingress semantics.

---

## 25. Runtime refs — pins versus expectations

3H-01's “stored runtime refs are not current runtime authority” pattern extends to `par.*`, but with an explicit taxonomy.

### 25.1 Immutable admitted pins

Facts such as:

```text
runtime kind/version admitted for AgentRun
exact Release/composition identity
exact model/tool/runtime pins
```

are immutable historical authority about **what was admitted**.

They are not “reverified against latest runtime” and never drift to current/latest.

### 25.2 Current-state/correlation refs

Facts such as:

```text
Mastra thread ref
Mastra run ref
schedule projection ref
substrate suspended-run ref/toolCall ref
trace/provider refs
```

are correlation/history facts or expectations to confront with live substrate state when reused. They do not prove current liveness/permission by themselves.

This avoids both errors:

```text
stale runtime ref becomes current-state authority
-X-

immutable AgentRun pin is weakened into "latest runtime observation"
-X-
```

---

## 26. Completion and suspension events are F5 observations/proposals

Mastra runtime events such as:

```text
complete
error
suspended
resumed
schedule fired
```

are observational/proposal inputs to owner-specific handlers.

They do not write Product terminal truth directly.

```text
runtime complete
→ PAR checks AgentRun still non-terminal/admissible
→ only PAR may commit COMPLETED
```

No generic runtime-status mirror or new durable F5 handoff record is introduced.

---

## 27. Old Release / old runtime continuation

A suspended/in-flight AgentRun always resumes with the exact composition/runtime identity pinned at admission.

```text
A17 pinned Release R17 / runtime M17
current active Release R19 / runtime M19
→ A17 rebuilds R17/M17 projection
→ A17 never silently uses R19/M19
```

The deployment must retain support for old non-terminal runs long enough to drain/recover them, or explicitly fail them according to later recovery policy.

Exact process placement, version coexistence and drain/cutover are 3J.

Mastra storage/snapshot schema upgrade compatibility is a mandatory 3L qualification item before version changes; no generic snapshot migration engine is introduced.

---

## 28. Storage isolation

`hub_control` remains domain authority.

`mastra_par` remains opaque substrate storage for:

```text
threads/messages
memory internals
suspension/workflow snapshots
schedule rows/history
runtime internals
```

PAR domain code does not query `mastra_par` tables directly.

If occurrence transport requires reading substrate schedule metadata/history, that read occurs through the qualified runtime boundary/API, never cross-schema SQL.

`mastra_builder` and `mastra_par` remain isolated; 3H-02 creates no cross-substrate query path.

---

## 29. Failure / recovery ownership partition

3H-02 freezes what runtime replay/resume/admission is allowed to mean.

3M later decides failure policy such as:

```text
when an admitted but undispatched AgentRun becomes orphaned
when an active process-loss AgentRun becomes FAILED
how long to wait for missing suspension snapshot
what to do when old runtime/snapshot cannot be restored
operator recovery/repair workflow
```

3J owns deploy/supervision/recovery topology.

3L proves the current Mastra mechanics.

No RecoveryEngine or AgentRun lease is created here.

---

## 30. Technology qualification — `CX-AGENT-MASTRA-01`

The existing probe remains mandatory. 3H-02 adds/refines the following controls, all of which must be demonstrated **firing**.

Preserve prior P1–P30 and add/refine:

```text
P31 active ordinary Production Agent process crashes; qualified host restarts
    → determine actual plain-Agent boot-recovery behavior
    → no model/tool authority is re-driven without re-entering PAR guards

P32 schedule-ingress workflow/transport crashes after PAR admission and is replayed/redelivered
    → same logical intended occurrence reaches PAR
    → occurrence cursor refuses second AgentRun

P33 conflicting Stored Agent / Editor state + version override channels are activated
    → new Product Agent dispatch still uses exact Conexus RuntimeAgentProjection
    → post-restart resume of an old suspended run still uses exact old projection
    → request/invocation/sub-agent version overrides cannot alter Product execution

P34 mutate/stale runtime schedule projection semantic-looking fields
    → prompt/Release/agent/tool composition still resolved owner-side only
    → runtime row cannot alter Product Agent semantics

P35 suspended tool retries resume with:
      a) re-minted effect identity
      b) same proposalRef but changed args
    → owner-sealed subject validation fails closed
    → no duplicate/different effect rides old approval

P36 same exact agent ArtifactRevision is used in Project A and Project B
    → no Agent/Working Memory leakage
    → Conversation versus Agent Memory classes do not alias

P37 projection reconciliation runs twice / after restart
    → exactly one runtime schedule row per current enabled trigger
    → deterministic projection id/upsert

P38 selected schedule ingress provides a stable logical intended-slot key BEFORE AgentRun admission
    → duplicate/redelivery produces same key
    → claimId/per-delivery wall-clock is rejected as dedupe identity

P39 runtime schedule cron/timezone is corrupted/stale
    → occurrence fails current TriggerRevision schedule validation
    → no AgentRun

P40 distinct new occurrence arrives while same trigger has a non-terminal run
    → occurrence is consumed SKIPPED
    → no second AgentRun
    → later redelivery remains rejected

P41 TriggerRevision update races old projection fire
    → old revision fire refused after new revision commits
    → new revision uses its own cursor scope

P42 ApprovalRequest/current proposal commit succeeds; process crashes before runtime suspension snapshot persists
    → approval cannot cause effect without resumable run + current PAR/Gateway guards

P43 suspended snapshot survives after AgentRun CANCELLED
    → resume from fresh process is refused before new model/tool/effect authority

P44 Mastra/runtime version upgrade
    → supported old suspended snapshot/thread remains readable/resumable under pinned old runtime
      OR upgrade is blocked/drained honestly
```

Additional probe requirement for owner-side occurrence derivation candidate:

```text
redelivery delayed past one or more later nominal slots
→ derivation cannot relabel old delivery as a newer occurrence
```

Failure of the substrate/mechanism probe reopens the realization choice first, not Product Agent domain semantics automatically.

---

## 31. YAGNI audit

After both Fable rounds the candidate adds no new:

```text
module
ScheduleOccurrence durable class
queue
scheduler
workflow engine
universal Workflow wrapper
Durable Agent cache/pubsub substrate
lease/fencing subsystem
retry engine
checkpoint engine
runtime-state mirror
Stored Agent registry
memory service/vector DB requirement
snapshot migration engine
EVENT ingress/event bus
```

New owner facts are limited to facts already justified by current PAR semantics:

```text
AgentRun exact pins
current proposal binding
AgentTrigger current revision/enabled state
per-revision occurrence consumption cursor
```

The cursor is not a scheduler; it is admission/idempotency state for a verified at-least-once wake boundary.

---

## 32. Alternatives — final comparison

### Alternative A — Direct Agent + selective suspension + guarded schedule ingress

**ADOPT / GLOBAL MAXIMUM.**

Closes every current failure class with the fewest new mechanics and preserves Conexus authority boundaries.

### Alternative B — universal Workflow wrapper

**REJECT as baseline.**

Adds durable step graph/retry/recovery semantics to every run, increases replay surface and has no current consumer beyond waits already supported by direct Agent suspension.

### Alternative C — `createDurableAgent()` for every Product Agent

**DEFER.**

Adds reconnectable stream/cache/pubsub mechanics for an unrequested UX capability.

### Alternative D — Mastra schedule directly targets Production Agent

**REJECT.**

Current agent-target schedule mechanics can resolve and invoke the agent before Conexus AgentRun admission and can carry a persisted prompt. This structurally bypasses the PAR admission invariant.

### Alternative E — Stored Agent / Editor-driven Product runtime definition

**REJECT.**

Creates an override/version/latest path independent of Registry/Release and allows request/invocation-level version channels that are not Product authority.

---

## 33. Reopen triggers

3H-02 should reopen only on material evidence such as:

```text
current Mastra direct Agent suspension cannot reliably rediscover/resume exact waits after restart
no feasible schedule ingress can provide a stable intended occurrence identity before PAR admission
owner-side or substrate occurrence identity cannot avoid delayed-redelivery aliasing even with a narrow adapter
single-flight skip semantics break correctness for a named Product Agent consumer requiring every occurrence
Product requirement needs reconnectable same-run token/tool stream ownership across client disconnects
Production Agent requires a concrete durable multi-step deterministic workflow graph as baseline rather than local consumer
sub-agent/network behavior becomes a real Product requirement and cannot preserve exact Release/authority projection
old-runtime drain/support is operationally impossible without changing AgentRun semantics
```

Framework preference, symmetry, Editor convenience, generic retry/recovery desire or “future EVENT may need it” are not reopen triggers.

---

## 34. Final consistency check

### 3C-10

Conexus still defines Product Agent semantics; Mastra realizes mechanics. No Stored Agent/versioning authority is introduced.

### 3C-R1

Only SCHEDULE is operational. EVENT remains reserved. No external Signal ingress is created.

### 3D-R1

No new cross-module dependency or generic scheduler/workflow owner is added.

### 3E

No new durable record class/FK. `par.agent_trigger`, `par.agent_run`, `par.conversation`, `par.approval_request` remain sufficient. `mastra_par` remains opaque substrate state.

### 3F

Runtime/schedule/completion events remain F5 proposals/observations. Exact ApprovalRequest subject remains sealed and owner-controlled.

### 3G-01 / 3G-05

ApprovalRequest remains approval authority; AgentRun remains pinned and terminal write-once; trigger disable/fire races remain owner-guarded; newer Release never rewrites old run.

### 3G-06

Gateway remains sole effect replay/idempotency authority. Runtime retries never grant effect replay permission.

### 3H-01

Same mechanism-versus-authority discipline: runtime refs are observations/correlation; admitted pins are immutable authority facts; live runtime state never becomes Product authority.

No contradiction found.

---

## 35. Final recommendation to operator

```text
Material Finding against approved authority = NONE
Reopen required                              = NONE
Alternative A                               = GLOBAL MAXIMUM
FBL-R1-01..07                               = INCORPORATED
FBL-R2-01..06                               = INCORPORATED
claimId dedupe                              = REJECTED
occurrence cursor                           = per-(TriggerId, TriggerRevision)
occurrence identity                         = stable intended slot before admission; exact mechanism 3L
universal Workflow                          = REJECTED baseline
createDurableAgent                          = DEFERRED
schedule→Production Agent direct            = REJECTED
Stored Agent/Editor authority               = REJECTED mechanically
new infrastructure                          = NONE
Overengineering finding                     = NONE
YAGNI violation                             = NONE found
Buildability with current substrate         = CREDIBLE, `CX-AGENT-MASTRA-01` still required
3H-02 candidate status                      = READY FOR OPERATOR DECISION
```

### Candidate decision sentence

> **3H-02 — Production Agent Runtime Realization:** In Conexus F1, every Production `AgentRun` is admitted and pinned in PAR before model/tool execution and runs through a directly constructed, rebuildable Mastra `Agent` projection derived from its exact Conexus Release composition; Mastra Editor/Stored Agent/version/latest/sub-agent override channels never select Product Agent semantics. Conversation/message history and optional Agent Memory use `mastra_par` mechanics under Conexus-scoped isolation, while normal Agent execution remains direct and only genuine durable waits use Mastra suspension/checkpoint mechanics. ApprovalRequest and the sealed owner-minted proposal remain the only approval/effect authority across resume, with all resume paths revalidating exact subject/args and Gateway retaining sole replay/idempotency authority. Substrate boot recovery or replay may never regain model/tool/effect authority without re-entering PAR guards; suspended runs resume only against their exact pinned old projection. `SCHEDULE` is realized as a derived Mastra timer projection whose fire is only a proposal to a guarded PAR ingress: one stable intended occurrence identity must be available before admission; a per-`(TriggerId, TriggerRevision)` owner cursor provides dedupe; current cron/timezone/revision/enabled facts are revalidated; F1 single-flight consumes overlapping occurrences as skipped rather than creating backlog; only after admission does PAR create/pin the AgentRun and invoke the Production Agent. Runtime schedule rows may carry timer mechanics but never prompt/Release/composition authority. EVENT/Signals external ingress, universal Workflow wrapping, `createDurableAgent()`, scheduler/queue/lease/recovery engines and new occurrence records remain out of F1 unless a named consumer/failure class justifies them.**

This consolidation remains non-authoritative until explicit operator ratification.
