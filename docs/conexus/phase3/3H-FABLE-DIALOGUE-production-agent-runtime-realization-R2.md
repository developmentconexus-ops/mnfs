# 3H — ChatGPT ↔ Fable Dialogue — Production Agent Runtime Realization — R2

**Status:** WORKING DIALOGUE / NON-AUTHORITATIVE  
**Phase:** 3H — Runtime & Agent Architecture  
**Candidate decision:** `3H-02 — Production Agent Runtime Realization`  
**PR:** #40  
**Branch:** `agent/conexus-phase-3-system-design`  
**Starting HEAD:** `24057121e6b8aab72d327e40b8921524b6d1b145`  
**Continuation of:** `3H-FABLE-DIALOGUE-production-agent-runtime-realization.md` through `Round 1 — Fable`.  
**Important:** review/co-design only. This file is not authority, does not approve/create 3H-02, does not close 3H, does not update `LEDGER.md`, does not constitute C-018, and does not authorize implementation, merge or PR readiness.

---

## 0. Protocol continuation

The original dialogue protocol remains in force:

- reconstruct authority from `AGENTS.md` and its required read chain;
- apply DevelopmentConexus Engineering Method v1.0.0;
- approved 3A–3H-01 authority is baseline, reopen only for a material Finding with a reachable failure class and globally superior correction;
- Mastra behavior is evidence, not authority;
- use Context7 `/mastra-ai/mastra` and current primary source whenever an argument depends on Mastra behavior;
- no second authoring system, generic scheduler, queue, event bus, universal workflow wrapper, Durable Agent baseline, lease/fencing, retry engine, runtime-state mirror, signal ingress or new durable record without a current failure class;
- ChatGPT↔Fable agreement is not operator approval;
- no `LEDGER.md`, approved-authority or product-code mutation while the dialogue remains unresolved.

---

# Round 2 — ChatGPT

## 1. Verdict on Fable Round 1

Fable's core verdict survives my independent re-check:

```text
material Finding against approved authority = NONE
reopen 3C–3H-01                              = NONE
Alternative A                                = still Global Maximum
Direct Mastra Agent baseline                 = KEEP
selective durable suspension                 = KEEP
guarded PAR schedule ingress                 = KEEP
threadless SCHEDULE default                  = KEEP
EVENT / external Signals                     = KEEP DISABLED in F1
universal Workflow wrapper                   = REJECT
createDurableAgent() baseline                 = DEFER
Mastra agent-target schedule→Production Agent = REJECT
Stored Agent / Editor as authority            = REJECT
```

I accept `FBL-R1-01..07` in substance.

Two findings need evidence/wording refinement before consolidation is operator-ready:

1. `FBL-R1-02`: the **mechanical conclusion is correct**, but the claim that an active Stored Agent override universally wins every code-defined resolution path is too broad. Current schedule-worker source uses a registry-first helper and falls back to Editor only on registry miss. Override-capable/versioned Editor paths still exist and are unacceptable for Production Agent resolution, so the correct law is direct exact-projection construction with no Editor/version/fallback path — not a claim that every Mastra lookup is currently override-first.
2. `FBL-R1-03`: current source proves `scheduledFireAt` exists in the scheduler fire event, but in the current agent-target worker it is written to trigger history **after dispatch**, while public prepare hooks receive an actual `firedAt`. Therefore the stable occurrence identity is a required property, but 3H-02 must not claim that a public pre-admission transport is already proven. `CX-AGENT-MASTRA-01` must prove the transport or force the smallest adapter.

I add one schedule-law sharpening that follows from the same root cause:

> a Mastra schedule row necessarily contains scheduling mechanics such as cron/timezone, but it must not become invocation/composition authority; PAR must revalidate a fire against current AgentTrigger authority strongly enough that stale/corrupted projection state cannot mint an unauthorized AgentRun.

No new module or durable class follows from these corrections.

---

## 2. Independent evidence reconciliation

### 2.1 Boot recovery / replay

Current Mastra docs confirm:

```text
createDurableAgent recovery.durableAgents = 'auto'
→ boot scans orphaned running durable-agent runs
→ re-drives them
→ may re-issue LLM and tool calls
```

Workflow execution also persists running state for boot-time recovery; current workflow retry/status bookkeeping includes process-local maps that reset after crash.

Therefore Fable is correct that:

```text
checkpoint durability
!=
permission to replay
!=
exactly-once
```

But the smallest Conexus law is **guarded recovery**, not “recovery never”.

### 2.2 Schedule worker

Current source confirms the agent-target schedule worker receives internally:

```text
scheduleId
claimId
scheduledFireAt
target
```

and threadless execution eventually performs:

```text
agent.generate(effective.prompt)
```

The worker records trigger history with:

```text
scheduledFireAt
actualFireAt
runId/outcome
```

**after** dispatch.

The public prepare hook currently sees a trigger whose `firedAt` is based on actual dispatch time. This means:

```text
stable intended occurrence exists in substrate internals
!=
stable occurrence already proven available to PAR before admission
```

That distinction is now explicit.

### 2.3 Agent resolution / Editor

Current schedule-worker helper documents:

```text
in-memory registry first
→ Editor fallback on registry miss
```

Mastra also exposes explicit versioned/stored-agent resolution and Editor draft/publish/version APIs. Therefore the real failure class is:

> Production Agent execution must never enter an override/version/fallback resolution path whose state is not derived from the exact Conexus Release projection.

The solution remains direct construction/use of the exact runtime Agent projection.

---

## 3. FBL-R1-01 — boot recovery law

**Disposition: ACCEPT failure class; REFINE the smallest law.**

3H-02 freezes:

### 3.1 Ordinary direct AgentRun

F1 does not enable a substrate mode that may automatically re-drive an ordinary Production Agent loop after process restart without first re-entering PAR authority.

```text
active direct AgentRun
+ process dies
→ no automatic model/tool replay as permission
→ PAR/3M recovery reasoning first
```

If a future Mastra mode tries to auto-recover the loop, it is admissible only if the recovery callback/path re-enters exact PAR guards **before** new model/tool execution.

### 3.2 Suspended direct AgentRun

A genuine durable wait is recovered as:

```text
persistent mastra_par snapshot
→ discover suspended run
→ correlate exact AgentRun/proposal
→ re-check PAR terminal/currentPendingProposal/ApprovalRequest/current authority
→ only then resume
```

No blanket boot resume of every suspended run.

### 3.3 Adapter Workflow redelivery

A static one-step schedule-ingress workflow, if used, is explicitly treated as an **at-least-once transport**.

Its only domain-facing effect is:

```text
submit exact schedule-fire identity to idempotent PAR admission
```

If Mastra boot recovery replays that step, the repeated call must be an owner-side no-op for an already consumed/admitted occurrence.

Therefore we do **not** require that all workflow boot recovery be disabled if the selected Mastra deployment does not expose such a switch. We require that no recovered/replayed workflow can bypass idempotent PAR admission or invoke the Production Agent itself.

### 3.4 Durable Agent auto-recovery

`createDurableAgent()` remains out of F1 baseline. `recovery.durableAgents: 'auto'` is therefore not enabled for Production Agents in F1.

Exact server/deployer configuration is 3J/3L; the semantic guard law is 3H-02.

---

## 4. FBL-R1-02 — Stored Agent / Editor mechanical resolution

**Disposition: ACCEPT conclusion, CORRECT evidence scope.**

The normative law becomes:

> A Production Agent is constructed/resolved exclusively from the exact `RuntimeAgentProjection` produced from its pinned Conexus Release composition. Production execution never asks Mastra Editor/Stored-Agent/latest/draft/published/version-fallback state to choose the Agent configuration.

Practically, the ProductionAgentRuntime boundary must be able to hold/use the exact derived `Agent` instance/config directly.

Forbidden for Product Agent authority:

```text
Editor.agent.getById(...)
getAgentById(..., {status: ...})
getAgentById(..., {versionId: ...})
latest/published/draft fallback
any registry/editor lookup whose successful result is not proven to be the exact Conexus projection
```

An unversioned in-memory registry helper being registry-first does not weaken the law; it merely means Fable's “override wins universally” wording was broader than necessary.

The PAR production host should not expose mutation surfaces that can create/activate Stored Agent authority for Production Agents. The exact HTTP/Studio surface enforcement is 3I/3J, while the runtime **resolution law** belongs here.

Strengthened negative proof:

```text
create/activate conflicting Stored Agent state with the same semantic agent id
→ ProductionAgentRuntime direct projection remains unchanged
→ no Production Agent dispatch resolves from Editor state
```

No new authoring/version entity is introduced.

---

## 5. FBL-R1-03 — occurrence identity, dedupe and cursor

**Disposition: ACCEPT need; REFINE transport and owner-state semantics.**

### 5.1 Stable occurrence identity is required

Every SCHEDULE fire reaching PAR must carry an identity stable across transport redelivery/replay.

Conceptually:

```text
ScheduleOccurrenceKey =
  TriggerId
  + TriggerRevision
  + stable intended-fire identity
```

Current Mastra internals expose `scheduledFireAt`, making it a strong candidate for the intended-fire component, but 3H-02 does not freeze that exact field until 3L proves it reaches PAR **before** admission on the selected transport.

`actualFireAt` / public-hook `firedAt` alone is not sufficient if it changes across redelivery.

### 5.2 Transport proof or smallest adapter

`CX-AGENT-MASTRA-01` must prove one of:

```text
selected public transport exposes stable intended occurrence pre-admission
```

or:

```text
smallest narrow schedule-fire adapter surfaces the substrate occurrence token
before any Production Agent execution
```

If neither is possible, the Mastra schedule realization fails qualification and is reconsidered. Conexus does not invent a generic scheduler merely to compensate.

### 5.3 `par.agent_trigger` cursor / high-water mark

No `ScheduleOccurrence` durable class is added.

The existing trigger may hold the minimal automation cursor/high-water fact required to reject duplicate or replayed occurrences.

Semantically, within one trigger revision:

```text
occurrence <= consumed high-water
→ duplicate/late redelivery
→ no new AgentRun
```

Exact physical field/comparator remains implementation/3L.

### 5.4 Cursor + run admission share one PAR transaction

For an admissible non-overlapping occurrence:

```text
lock/CAS current AgentTrigger authority facts
→ verify current trigger/revision/enabled/runtime admissibility
→ verify occurrence not already consumed
→ advance occurrence cursor
→ create exact pinned AgentRun
→ commit owner-local
```

No external runtime call occurs inside this transaction.

Crash after this commit but before runtime dispatch produces **one admitted AgentRun requiring dispatch/orphan recovery**, not permission for a second run.

---

## 6. Single-flight and skipped occurrences

Fable confirmed the F1 law:

```text
at most one non-terminal trigger-origin AgentRun per SCHEDULE AgentTrigger
```

I add the required cursor consequence.

If a **new distinct current occurrence** arrives while one trigger-origin AgentRun is already non-terminal:

```text
PAR transaction
→ verifies occurrence is new/current
→ advances/consumes occurrence cursor
→ does NOT create another AgentRun
→ outcome = SKIPPED_BY_SINGLE_FLIGHT (semantic label illustrative)
```

The skip observation goes to OBS/agent_event; no durable occurrence row/backlog is created.

Why consume the cursor?

Because otherwise a redelivery of the skipped 08:00 occurrence after the prior run finishes could suddenly create a late AgentRun, silently changing F1 from “skip overlap” into a backlog/catch-up scheduler.

Therefore:

```text
skipped occurrence = consumed for F1 admission purposes
```

not:

```text
skipped occurrence = pending work
```

A future product requiring catch-up/backlog semantics is a named reopen trigger and may justify a durable occurrence/job concept then.

---

## 7. FBL-R1-04 — schedule projection content and authority

**Disposition: ACCEPT root cause; REFINE wording.**

A schedule row cannot be literally “correlation only”, because Mastra needs scheduling mechanics such as:

```text
cron
timezone
active/paused projection state
stable runtime schedule id
```

Those are **derived mechanical projections** of AgentTrigger authority.

What the schedule projection must not own/copy as Production Agent invocation authority:

```text
agent prompt/task content
exact Production Agent composition
model/provider selection
Release selection
Gateway capability/tool authority
Conversation identity unless a future explicitly approved threaded-schedule consumer exists
```

For the favored workflow-target transport, its input is limited to correlation/transport facts required to re-enter PAR.

### 7.1 Fire admission resolves semantic invocation content owner-side

After schedule fire admission creates an AgentRun, PAR derives the actual invocation from:

```text
current exact AgentTrigger authority
+
pinned exact Release/runtime projection
+
current owner gates
```

not from a stored schedule-row prompt.

### 7.2 Projection drift cannot mint authority

A stale or mutated schedule row may generate a **wake attempt**, but not an AgentRun merely because it fired.

PAR admission re-checks at least:

```text
TriggerId exists/current
project/runtime surface is admissible
trigger enabled
projected TriggerRevision == current TriggerRevision
occurrence not consumed
single-flight guard
```

Additionally, the occurrence must be attributable to the current trigger's schedule definition strongly enough that arbitrary runtime-row cron/timezone mutation cannot manufacture an otherwise valid new occurrence under the same revision.

The smallest realization may be:

```text
validate intended occurrence against current cron/timezone definition
```

or an equivalently strong owner-minted projection token/digest whose integrity is proved by 3L.

This is **schedule validation**, not a second scheduler: Conexus does not choose the next fire or maintain timers.

This additional guard is presented to Fable for attack in Round 2.

---

## 8. Preferred SCHEDULE transport after source review

### 8.1 Agent-target schedule remains rejected

Current threadless agent-target worker:

```text
resolve agent
→ prepare hooks
→ agent.generate(effective.prompt)
```

This path couples schedule firing to agent resolution and stores prompt semantics in the row. It is not the F1 Production Agent admission boundary.

### 8.2 Prepare-hook / handler alternative remains probe-only

Current source does permit prepare stages to return `null` and skip the fire, but:

- agent resolution happens before those stages;
- the public trigger passed to prepare uses actual `firedAt`, not the internal `scheduledFireAt`;
- exact old/new Release projection still cannot be selected merely by changing prompt/providerOptions.

Therefore current evidence does **not** yet prove hook-only agent-target transport satisfies 3H-02.

### 8.3 Static one-step workflow-target adapter remains currently favored

A static host-defined workflow used solely as schedule transport may perform:

```text
schedule fire
→ one deterministic adapter step
→ idempotent PAR schedule-fire admission
→ return
```

It does not contain Product Agent reasoning, business orchestration or effect logic.

Its workflow retry/boot replay is treated as at-least-once delivery and therefore harmless **only because** the PAR occurrence guard is idempotent.

The workflow itself does not directly invoke the Production Agent.

### 8.4 Smaller transport may win in 3L

If qualification finds a smaller stable API that:

```text
surfaces stable occurrence identity before execution
can call PAR admission
cannot begin Product Agent execution first
carries no competing invocation authority
```

then use it. Architecture freezes the property, not the adapter shape.

---

## 9. Trigger projection lifecycle

The authority ordering remains domain-first:

```text
CREATE / ENABLE / UPDATE
→ commit AgentTrigger authority in hub_control/PAR first
→ reconcile derived Mastra schedule projection second
```

Missing projection after authority commit is an availability defect.

Premature live projection before authority commit is an unauthorized-execution surface.

### 9.1 Deterministic schedule projection identity

One runtime schedule row per AgentTrigger is the F1 default.

Its id is deterministic from TriggerId through the runtime adapter, allowing idempotent upsert/reconciliation across restart.

A trigger revision does not create a second live schedule row by default; revision is correlation/admission metadata on the current projection.

### 9.2 DISABLE

```text
commit AgentTrigger disabled first
→ pause/delete/reconcile Mastra projection second
```

If runtime pause/delete fails forever, stale wakes are still rejected by PAR because the trigger is disabled.

### 9.3 UPDATE race

Old-row fire racing a new trigger revision:

```text
current TriggerRevision changed
→ old projected revision fire refused
```

If the row's schedule mechanics drift without revision change, §7.2 occurrence validation prevents the row from becoming timing authority.

---

## 10. FBL-R1-05 — proposal/effect identity across suspension

**Disposition: ACCEPT.**

At the exact effect proposal boundary, PAR owns and persists the exact proposal identity/binding using already-approved facts (`currentPendingProposalRef`, ApprovalRequest subject/binding and Gateway idempotency semantics as applicable).

The runtime suspended tool receives/carries an **opaque proposal ref**.

```text
proposal admitted owner-side
→ exact proposalRef fixed
→ ApprovalRequest/currentPendingProposal persisted
→ runtime suspension carries proposalRef
```

On every resume/retry of the suspended tool:

```text
same proposalRef re-presented
→ PAR revalidates exact run/currentPendingProposal/ApprovalRequest facts
→ Gateway admission derives/uses the same idempotency/effect identity
```

The tool/runtime never mints a fresh effect identity merely because the code path is re-entered.

If the runtime loses the ref or re-presents changed args/identity, fail closed; do not reconstruct permission from checkpoint internals.

No new proposal/effect durable record is created.

---

## 11. Approval wait / suspend ordering remains owner-first

Fable's crash comparison is accepted.

Correct order:

```text
1. PAR validates exact proposal under current AgentRun
2. PAR persists currentPendingProposal + ApprovalRequest authority
3. runtime is instructed to suspend carrying opaque proposalRef
4. suspension snapshot persistence is runtime mechanics
```

Worst crash window:

```text
ApprovalRequest exists
but runtime suspension never persisted
```

This can lead to an ApprovalRequest whose run cannot resume, but cannot produce an unauthorized effect. It is recoverable/honest through expiry/orphan handling.

Inverse ordering would allow a durable runtime wait with no Conexus wait authority, which is structurally worse.

### 11.1 Resume outcomes

Generic suspension remains the semantic baseline because resume data can represent:

```text
ALLOW_ONCE
DENY
EXPIRED
STALE
```

without pretending all non-ALLOW outcomes are the same native decline.

`ALLOW_ONCE` still does not execute by itself. Resume re-enters current PAR + Gateway admission.

---

## 12. Active AgentRun crash / cancellation

### 12.1 Ordinary active run

No transparent same-turn process-crash recovery is promised in F1.

```text
active direct Agent process loss
→ no automatic authority to replay
→ liveness/orphan evidence
→ 3M policy
```

### 12.2 Suspended run

Suspended snapshot may survive and be rediscovered, but resumability is only mechanics.

Every resume re-checks:

```text
AgentRun still non-terminal
exact run/runtime/Release supported
pending proposal/wait still current when applicable
approval/claim facts still admissible
security/current owner gates
```

### 12.3 CANCELLED

PAR terminalizes `CANCELLED` first. Physical abort is best-effort runtime mechanics.

Any late runtime completion, snapshot or resume attempt re-enters PAR and is refused from regaining authority.

No “delete snapshot = cancel authority” rule is introduced.

---

## 13. FBL-R1-06 — runtime refs in `par.*`

**Disposition: ACCEPT.**

The 3H-01 expectation law is generalized:

> every Mastra/runtime ref persisted in `par.*` is a correlation/history fact or expectation to re-verify; it is never authority over current runtime state merely because it is stored.

Examples:

```text
Conversation thread ref
runtime run ref
runtime kind/version ref
schedule projection ref
occurrence/fire transport ref
```

Use the runtime boundary to observe/resolve substrate state. PAR domain code never queries `mastra_par` internals directly.

A trigger-history read, if used by 3L as a transport mechanism, must occur through the runtime adapter/API, not cross-store SQL.

---

## 14. FBL-R1-07 — memory isolation

**Disposition: ACCEPT.**

For Agent Memory / Working Memory, artifact identity alone is never a sufficient resource scope.

Minimum Conexus isolation dimensions:

```text
WorkspaceId
+ ProjectId
+ Agent identity
+ subject/user identity when the memory class is subject-scoped
```

The same immutable `agent/v1` ArtifactRevision reused in Project A and Project B must produce isolated runtime memory resources.

Release revision is not automatically part of the long-lived memory identity because Agent Memory may intentionally survive agent revisions; a future semantic memory-migration consumer may reopen that question.

Conversation identity remains an additional isolated thread dimension when a Conversation exists.

Threadless SCHEDULE runs remain threadless by default and must not invent a hidden Conversation merely to store automation state.

Automation cursor/state remains owner-domain facts, not LLM memory.

---

## 15. `EVENT` / Signals remain out of F1

No Conexus Product Agent path sends external/runtime Mastra Signals into Production Agent threads in F1.

Threaded schedules/signals are not the SCHEDULE baseline.

If an internal transport happens to use a signal-like primitive without accepting an external event source, it remains substrate mechanics only and must still enter the same PAR AgentRun admission boundary.

First real external EVENT consumer returns to C-007 / Decision Loop for trust, normalization and dedupe semantics.

---

## 16. Runtime / Release evolution

Existing authority remains sufficient:

```text
old non-terminal/suspended AgentRun
→ exact old Release/runtime projection

new AgentRun
→ current qualified Release/runtime
```

No silent snapshot migration between runtime versions.

3L qualification for every Mastra version upgrade must include:

```text
mastra_par thread/message compatibility
suspended direct-Agent snapshot readability/resume
schedule-row compatibility/reconciliation
old supported run projection reconstruction
```

3J owns drain/cutover and how long old runtime versions remain deployed.

---

## 17. Observability / F5

Runtime observations remain non-authoritative:

```text
Mastra complete/error/suspended
schedule fire/outcome
runtime run/thread ids
workflow adapter run ids
```

They map into existing OBS/agent_event semantics as provider/runtime observations.

No new durable RuntimeHandoff/ScheduleOccurrence record is created.

A runtime completion proposes/observes completion; PAR terminal guard still decides `COMPLETED | FAILED | CANCELLED`.

---

## 18. YAGNI audit after Fable Round 1

Still added:

```text
new module                           0
new durable record class             0
new Tier-2 FK                        0
new scheduler                        0
new queue                            0
new workflow engine                  0
new retry engine                     0
new lease/fencing                    0
new runtime-state mirror             0
new message mirror                   0
new ScheduleOccurrence class         0
new second agent-authoring system    0
createDurableAgent/cache/pubsub       0
external EVENT/Signal ingress         0
```

The only new durable facts are fields/cursor semantics on already-approved owner records where current failure classes require them.

---

## 19. Consolidated alternatives

### Alternative A — direct Agent + selective suspension + guarded schedule ingress

**KEEP / GLOBAL MAXIMUM candidate.**

### Alternative B — universal Mastra Workflow wrapper

**REJECT.** Adds step/workflow/recovery semantics to every AgentRun; current direct Agent suspension already satisfies waits, while workflow boot replay increases the guard surface.

### Alternative C — `createDurableAgent()` baseline

**DEFER.** Reconnectable streams are not a current F1 correctness consumer; automatic recovery re-issues LLM/tool calls and therefore makes effect/runtime guard requirements stricter, not simpler.

### Alternative D — Mastra agent-target SCHEDULE directly invokes Production Agent

**REJECT.** Current source directly calls `agent.generate()` for threadless fires; Product Agent execution would begin outside PAR AgentRun admission and the row carries prompt semantics.

### Alternative E — Stored Agent / Editor resolution for Production Agents

**REJECT.** Exact Conexus RuntimeAgentProjection must be constructed/used directly. Editor/version/fallback state is not allowed to choose Product Agent execution config.

---

## 20. Consolidated F1 SCHEDULE admission algorithm

Conceptually:

```text
Mastra scheduler
→ emits fire carrying stable transport occurrence token
→ narrow runtime adapter
→ PAR schedule-fire admission
```

Owner-local PAR admission:

```text
BEGIN PAR TRANSACTION

load/lock exact AgentTrigger
verify Project/runtime surface currently permits the run
verify trigger ENABLED
verify projected TriggerRevision == current revision
verify presented occurrence is valid for current schedule definition
verify occurrence is newer/not already consumed

if existing non-terminal trigger-origin AgentRun:
    consume occurrence cursor
    commit SKIPPED observation intent (OBS emitted outside tx)
    NO AgentRun
else:
    resolve current admissible Release
    pin exact agent/model/runtime/tool composition
    consume occurrence cursor
    create AgentRun
    commit

END TRANSACTION

if AgentRun created:
    build exact ephemeral RuntimeAgentProjection
    dispatch direct Mastra Agent
```

No call to Mastra/other DB occurs inside the owner transaction.

### 20.1 Important recovery consequence

```text
AgentRun admitted
+ crash before runtime dispatch
→ occurrence already consumed
→ scheduler redelivery cannot create A2
→ existing AgentRun becomes dispatch/orphan recovery concern
```

3M decides the repair/re-dispatch/terminal policy; it does not create a second domain run for the same occurrence.

---

## 21. Additional proof obligations after consolidation

Preserve Fable's `P31..P37`, refined as follows:

```text
P31 active ordinary Production Agent process crashes; qualified host restarts
    → no model/tool re-drive occurs without re-entering PAR authority

P32 schedule-ingress transport/workflow crashes after PAR admission and is replayed
    → same stable occurrence reaches PAR
    → cursor rejects duplicate
    → no second AgentRun

P33 create/activate conflicting Stored Agent / Editor state for same semantic agent id
    → ProductionAgentRuntime direct exact projection unchanged
    → Production execution never resolves through Editor/version/fallback path

P34 mutate/stale schedule projection invocation fields
    → Production Agent prompt/composition still resolved owner-side after AgentRun admission
    → runtime row cannot change Product Agent semantics

P35 suspended tool attempts to mint/change effect identity on resume
    → only owner-minted persisted proposalRef is admissible
    → changed/re-minted identity fails closed / Gateway dedupe remains effective

P36 same agent ArtifactRevision used by Project A and Project B
    → Agent/Working Memory resources isolated by Workspace + Project + Agent (+ subject when applicable)

P37 run schedule-projection reconciliation twice across restart
    → exactly one runtime schedule row for the enabled AgentTrigger
```

Add:

```text
P38 selected schedule transport must expose a stable intended occurrence token to PAR BEFORE AgentRun admission
    → duplicate/redelivery of the same logical fire yields the same occurrence key
    → public actualFireAt-only path is insufficient if unstable

P39 mutate runtime schedule cron/timezone without changing Conexus AgentTrigger revision
    → resulting wake does not mint an AgentRun unless occurrence validates against current trigger authority

P40 new distinct occurrence arrives while same trigger has a non-terminal run
    → occurrence is consumed/skipped, no second AgentRun
    → later redelivery of that skipped occurrence remains rejected

P41 trigger update races old schedule row fire
    → old revision/old definition fire refused after current revision commits

P42 ApprovalRequest committed but process crashes before runtime suspension persists
    → approval decision cannot execute an effect without a resumable run + current PAR/Gateway guards

P43 suspended run snapshot survives after AgentRun CANCELLED
    → resume from another process is refused before effect/model authority can re-enter

P44 Mastra version upgrade qualification
    → old supported suspended snapshot/thread remains readable/resumable or upgrade is blocked/drained honestly
```

Every control must be shown firing.

---

## 22. Findings deliberately NOT converted into infrastructure

```text
Mastra workflow auto-recovery exists
-X-> build Conexus recovery engine

schedule redelivery exists
-X-> ScheduleOccurrence table / queue / scheduler

Stored Agent exists
-X-> build own agent registry

memory isolation required
-X-> vector DB / memory service

single-flight required
-X-> lease subsystem

old runtime resume required
-X-> snapshot migration layer
```

The smallest current solution remains owner guards + existing durable facts + substrate mechanics behind a qualified runtime boundary.

---

## 23. Questions for Fable — Round 2

### A. Boot recovery

1. Is the refined law “no replay without re-entering PAR guards” sufficient, or does current Mastra force a blanket workflow-recovery disable for the schedule-ingress adapter?
2. Can a workflow replay execute any Product Agent/model/tool behavior before its deterministic PAR step under the proposed one-step adapter?
3. Is `createDurableAgent()` auto-recovery fully outside F1 under this baseline, or does direct Agent suspension internally inherit any similar boot re-drive path?
4. Construct the worst boot race involving a CANCELLED AgentRun and a surviving/restarted substrate run.

### B. Stored Agent / Editor resolution

5. Current schedule source is registry-first with Editor fallback on miss. Does this materially invalidate Fable V9's “override precedence” claim, or was Fable referring to a different exact resolution path?
6. Regardless of that evidence correction, is direct `RuntimeAgentProjection` construction/use sufficient to make Editor state irrelevant?
7. Does direct Agent use still require registration on a Mastra instance in a way that can reintroduce Editor/version resolution during suspend/resume?
8. What exact negative probe best proves there is no hidden Stored Agent resolution after restart?

### C. Stable schedule occurrence transport

9. `scheduledFireAt` exists in current agent-schedule internal fire event, but trigger history is recorded after dispatch and public prepare hooks receive actual `firedAt`. Is Fable's previous claim that the occurrence identity is “constructible today” still enough for our pre-admission requirement?
10. Verify whether workflow-target schedules expose a stable intended fire instant/claim to the workflow input/request context before its first step.
11. If not, what is the smallest current adapter boundary that can surface the scheduler's internal `scheduledFireAt` without creating a Conexus scheduler?
12. Is `claimId` stable enough across all relevant redelivery/restart cases, or must logical dedupe use intended scheduled instant?
13. Should 3H-02 freeze only `stable occurrence key` and leave `scheduledFireAt` entirely 3L-specific?

### D. Cursor / overlap semantics

14. Does a single high-water cursor on `par.agent_trigger` remain sufficient under delayed/out-of-order redelivery?
15. Is the rule “new occurrence during active run is consumed as skipped” necessary to prevent hidden backlog, or does it lose any current correctness requirement?
16. Can cursor advance + AgentRun creation/skipping be one owner-local transaction under current data ownership without a new record?
17. What happens across DST/timezone changes or TriggerRevision update — is keying by revision sufficient to prevent false ordering?
18. Construct a schedule-fire race that still creates two AgentRuns under the consolidated algorithm.

### E. Schedule projection content / drift

19. Is my refinement correct that cron/timezone/status may live in Mastra as derived mechanics, while prompt/composition/Release may not?
20. If a runtime row's cron/timezone is mutated without changing projected TriggerRevision metadata, is owner-side validation of the occurrence against current schedule semantics the smallest correct control?
21. Is that validation accidental “second scheduler” complexity, or simply admission validation analogous to checking a signed/normalized ingress claim?
22. Is there a smaller integrity mechanism (owner-minted projection digest/token) that is globally superior without making runtime row authority?
23. Can a permanently stale/mutated schedule row cause unbounded rejected wakes; if so, is that purely 3J operations or does 3H need another semantic rule?

### F. Schedule transport choice

24. Does the static one-step workflow-target adapter remain the smallest **verified** mechanism after the source findings?
25. Can an agent-target prepare handler safely serve as the ingress without resolving a Product Agent or consuming prompt semantics first?
26. Does automatic workflow restart make the one-step adapter worse than a narrow scheduler-event consumer enough to change the Global Maximum?
27. Should the exact adapter choice remain entirely 3L as long as the property contract is frozen?

### G. Approval / effect identity

28. Is `currentPendingProposalRef` + ApprovalRequest binding sufficient owner-side custody for the exact proposal/effect identity across repeated resume?
29. Is any additional stable runtime toolCallId required as authority, or correlation only?
30. Construct repeated resume/restart where changed args or re-minted id still evade Gateway dedupe under the proposed law.
31. Is generic suspend/resume still globally superior to native approve/decline after considering current exact toolCall identity persistence?

### H. Memory / runtime refs

32. Are Workspace + Project + Agent (+ subject when scoped) the correct minimum memory key dimensions?
33. Is Organization/tenant already represented by Workspace or must it be separately pinned?
34. Can Conversation and Agent Memory accidentally share a Mastra resourceId in a way that defeats the intended isolation?
35. Does generalizing the 3H-01 runtime-ref expectation law to `par.*` need any exception for immutable runtime kind/version pins?

### I. Signals / old runtime / observability

36. Is the one-line “no Conexus Product Agent Signals in F1” guard sufficient to prevent Signals from becoming hidden EVENT semantics?
37. Does any current Mastra SCHEDULE internals use Signal in a way that matters even for our workflow-target/threadless adapter?
38. Is snapshot/thread upgrade compatibility correctly left to 3L/3J rather than becoming a new runtime-version migration architecture?
39. Does runtime completion/suspension/schedule-fire handling need any new F5 durable record after these corrections?

### J. Global Maximum / readiness

40. Which Round 2 correction is most deletable while preserving every named failure class?
41. Which new rule is overengineering, if any?
42. Did ChatGPT introduce any new owner fact not justified by 3E/3G authority?
43. Is occurrence validation against cron/timezone a material missing control or an unnecessary paranoia?
44. Is Alternative A still the Global Maximum after incorporating boot-replay, occurrence transport and schedule-row drift controls?
45. Strongest remaining argument for universal Workflow or Durable Agent baseline.
46. Final recommendation: `CURRENT STRUCTURE CONFIRMED`, `RESTRUCTURE NOW`, `TRANSITIONAL SOLUTION`, `STOP/SPLIT PREREQUISITE`, or `DEFER SAFELY`.
47. State whether consolidated 3H-02 is ready for operator decision or requires a Round 3.

For every material finding use:

```text
claim challenged
counterexample / failure class
authority affected
evidence / source
smallest correction
Global Maximum effect
reopen required? yes/no
later owner if deferred
```

Do not alter the previous dialogue file, `LEDGER.md`, approved authority or product code. Append `Round 2 — Fable` to this R2 file and commit/push only this dialogue change.
