# 3H — ChatGPT ↔ Fable Dialogue — Production Agent Runtime Realization

**Status:** WORKING DIALOGUE / NON-AUTHORITATIVE  
**Phase:** 3H — Runtime & Agent Architecture  
**Candidate decision:** `3H-02 — Production Agent Runtime Realization`  
**PR:** #40  
**Branch:** `agent/conexus-phase-3-system-design`  
**Starting HEAD:** `e6fa92bc6ea172b8e8793806ffb8cb07b865f0ff`  
**Important:** review/co-design only. This file is not authority, does not approve/create 3H-02, does not close 3H, does not constitute C-018, and does not authorize implementation, merge or PR readiness.

---

## 0. Review protocol

1. Reconstruct authority from `AGENTS.md` and follow its required read order.
2. Apply DevelopmentConexus Engineering Method v1.0.0 from `docs/engineering/standards/root-cause-global-maximum-method.md`.
3. Read at minimum, as applicable:
   - `docs/conexus/DECISOES.md`;
   - `docs/conexus/phase3/LEDGER.md`;
   - `docs/conexus/phase3/3C-10-production-agent-runtime-module-boundary.md`;
   - `docs/conexus/phase3/3C-R1-cross-review-closure.md`;
   - `docs/conexus/phase3/3D-R1-dependency-architecture-final-closure.md`;
   - `docs/conexus/phase3/3E-01-hub-control-data-ownership-persistence-boundaries.md`;
   - `docs/conexus/phase3/3E-02-module-durable-record-inventory-reference-closure.md`;
   - `docs/conexus/phase3/3F-02-boundary-payload-semantics-error-envelope-architecture.md`;
   - `docs/conexus/phase3/3F-03-approval-claim-approval-request-contract.md`;
   - `docs/conexus/phase3/3F-R1-contracts-api-architecture-final-closure.md`;
   - `docs/conexus/phase3/3G-01-approval-request-lifecycle-claim-binding-state-architecture.md`;
   - `docs/conexus/phase3/3G-05-production-agent-run-approval-trigger-continuation-architecture.md`;
   - `docs/conexus/phase3/3G-06-gateway-effect-attempt-idempotency-budget-state-architecture.md`;
   - `docs/conexus/phase3/3G-R1-behavioral-state-architecture-final-closure.md`;
   - `docs/conexus/phase3/3H-01-builder-coding-runtime-realization-session-sandbox-mapping.md`.
4. Approved architecture is baseline, not dogma. Reopen only for a material Finding with a concrete reachable failure class and a globally superior correction.
5. Do not reopen for naming, symmetry, framework preference or hypothetical optionality.
6. Fable acts as independent Senior/Staff/Principal Software Engineer + Software Architect. Review must descend to durable facts, authority, process crash/restart, suspend/resume, duplicate schedule fire, approval races, effect replay, memory isolation, exact Release pinning, observability, proof and product realization.
7. If any argument depends on current Mastra behavior, verify through Context7 `/mastra-ai/mastra` and applicable current primary source. Do not rely on model memory.
8. Append numbered rounds; never silently rewrite another actor's round.
9. ChatGPT↔Fable agreement is not operator approval.
10. YAGNI applies aggressively. No second authoring system, generic scheduler, queue, event bus, workflow wrapper, Durable Agent infrastructure, lease/fencing, retry engine, runtime-state mirror, signal ingress or new durable record without a current failure class.
11. Mastra is substrate. `Agent Editor`, Stored Agents, workflow definitions, schedule rows, signals, memory and snapshots never become Conexus product authority merely because Mastra persists them.
12. F1 `AgentTrigger EVENT` remains reserved/not operational under 3C-R1. Only `SCHEDULE` is enabled in this decision candidate.
13. No `LEDGER.md`, approved authority or product-code changes while this dialogue remains unresolved.

---

# Round 1 — ChatGPT

## 1. Decision target

3H-02 should decide the minimum runtime realization necessary to make already-approved Production Agent semantics implementable with Mastra, specifically:

```text
exact Release/AgentDefinition → Mastra Agent runtime projection
Conversation → Mastra thread/message realization
Production AgentRun admission → exact runtime dispatch
normal active run versus durable suspended run
Gateway tool wrapping and ApprovalRequest continuation
ALLOW_ONCE / DENY / EXPIRED / STALE resume mapping
runtime cancel/late-output mechanics
SCHEDULE trigger projection and fire admission
schedule restart/update/disable/duplicate/overlap safety
runtime memory scope and isolation
runtime refs/trace correlation
old-Release / old-runtime resume semantics
```

It should **not** decide:

```text
Builder coding runtime                                       → 3H-01 already APPROVED
Builder/PAR physical-process separation                      → later 3H-03 / 3J
EVENT trigger ingress / webhook trust                        → reserved; C-007 / 3I when first consumer exists
credential custody / egress / caller permissions             → 3I
process/container topology / backup procedures                → 3J
frontend approval/trigger/conversation UX                     → 3K
exact Mastra/E2B/Postgres versions                            → 3L
orphan timeout / checkpoint-corruption recovery policy        → 3M
architecture-wide verification                                → 3N/3O
multi-agent/network/subagent product semantics                → Decision Loop on first consumer
```

Candidate title:

> **3H-02 — Production Agent Runtime Realization**

---

## 2. Authority already fixed before this dialogue

### 2.1 PAR owns semantics; Mastra owns runtime mechanics

3C-10 already freezes:

```text
Conexus owns:
AgentDefinition / Conversation / AgentRun / ApprovalRequest / AgentTrigger semantics
Artifact Registry + Release identity/versioning
I&A / Brain / Connections / Gateway authority

Mastra owns:
agent loop
provider/model plumbing
memory mechanics
workflow/checkpoint mechanics
suspend/resume mechanics
schedules
signals/inbox candidate mechanics
background execution mechanics
```

Mechanism never becomes second product authority.

### 2.2 Exact Release pinning

3G-05 freezes:

```text
new AgentRun
→ current active admissible Release resolved
→ exact composition pinned

newer Release
-X-> mutate in-flight AgentRun
```

Old in-flight/suspended run continues under its pinned Release/runtime while that exact runtime remains supported/admissible. No snapshot migration promise exists across engines.

### 2.3 Approval wait semantics

3G-05 / 3G-01 already freeze:

```text
AgentRun remains non-terminal while approval is pending
ApprovalRequest is the wait authority
Mastra suspension/checkpoint is mechanics only
DENY | EXPIRED | STALE resume the same AgentRun as non-effect outcomes
ALLOW_ONCE does not itself execute an effect
currentPendingProposalRef participates in owner-local guards
```

No durable `AgentRun = AWAITING_APPROVAL` status is required.

### 2.4 External-effect safety

Gateway remains the only owner of:

```text
admission
approval claim consumption
EffectAttempt
idempotency
OUTCOME_UNKNOWN handling
replay safety
```

Mastra retry/workflow/agent behavior never authorizes a repeated external effect.

### 2.5 Trigger scope

3C-R1 supersedes the original broad 3C-10 statement for F1:

```text
SCHEDULE → enabled F1 trigger
EVENT    → semantic capability reserved / not operational
```

No webhook/event-ingress module or generic event bus is created here.

### 2.6 Durable inventory already exists

3E already contains:

```text
par.conversation
par.agent_run
par.approval_request
par.agent_trigger
```

Messages/history/checkpoints/schedules/runtime internals live in `mastra_par` substrate storage. No new durable class is proposed.

---

## 3. Current external evidence verified before this proposal

### M1 — direct Agent suspension is durable across restart with persistent storage

Current Mastra documentation exposes `Agent.listSuspendedRuns()` backed by workflow snapshot storage. Approval-based and explicit tool suspensions can be rediscovered after server restart or on another process and resumed by run ID.

Implication:

> a Production Agent does **not** need to be wrapped in an application-authored Mastra Workflow merely to survive a genuine suspension point.

### M2 — durable workflow snapshot != exactly-once retry semantics

Current Mastra workflow snapshots persist run status, step results, active/suspended/waiting paths and resume metadata. However current default workflow execution keeps retry counts and some status guards in process-local Maps; after crash those Maps are empty.

Implication:

```text
workflow durable resume = real capability
workflow retry = not external-effect authority
```

No exactly-once assumption is allowed.

### M3 — current Schedules are persistent target projections

Current `mastra.schedules.create()` targets either an `agentId` or a `workflowId`, persists a schedule, supports IANA timezone, active/paused status and pause/resume/run operations. Threaded schedules additionally support `threadId/resourceId`, signals and `ifActive/ifIdle` behavior.

Implication:

> if a Mastra schedule directly targets the Production Agent, it can begin runtime execution before PAR creates/admit the Conexus AgentRun. That is structurally unsafe for Conexus even though it is a valid Mastra pattern.

### M4 — Durable Agents solve a different problem

Current `createDurableAgent()` adds cache/pubsub-backed resumable streams and wraps the agentic loop in a workflow so clients can reconnect/observe long-lived streams across disconnects.

Implication:

> client-stream resumability is useful, but it is not currently a named F1 correctness requirement. Adopting it as baseline would add cache/pubsub and workflow wrapping without a current consumer.

### M5 — Mastra Editor/Stored Agents are a genuine competing authoring/versioning system

Current Mastra Agent Editor stores agent configuration separately, creates immutable version snapshots, has draft/publish/rollback, exposes `/api/stored/agents`, and can programmatically update agent configuration.

Implication:

> enabling it as the live source for Conexus Production Agents would create exactly the second AgentDefinition/Release authority 3C-10/3E reject.

### M6 — Signals/Inbox are capable but outside enabled F1 EVENT scope

Mastra Signals can wake/steer agents and can be used with pub/sub and external notifications. They remain candidate mechanics for a future EVENT consumer, but enabling them as external Product Agent ingress now would violate 3C-R1 scope.

---

## 4. Root cause

Without an explicit 3H-02 realization boundary, one of these failure classes becomes reachable:

```text
Mastra Stored Agent/Editor becomes the live agent definition instead of Release
schedule fires a Mastra agent before Conexus AgentRun admission
stale schedule row keeps executing after AgentTrigger DISABLE/update
runtime resume uses latest Release instead of run-pinned Release
Mastra native approval boolean cannot represent DENY/EXPIRED/STALE continuation correctly
runtime checkpoint is treated as permission to execute a Gateway effect
workflow retry duplicates an external effect
client disconnect drives adoption of cache/pubsub/workflow machinery as correctness infrastructure
Conversation thread/resource IDs leak memory across Project/user/agent scopes
runtime `complete` self-terminalizes AgentRun after Conexus CANCELLED
active process crash is silently replayed as the same AgentRun
schedule duplicates create two runs/effects for one occurrence
schedule overlap creates concurrent runs over shared automation/memory state without policy
EVENT/Signals arrive as F1 ingress despite no C-007 trust decision
```

---

## 5. Target invariants

1. `Release`/Registry remains the only authoring/version/composition authority for a Production Agent.
2. Runtime Agent objects/configuration are **derived, rebuildable projections** of exact Release-pinned Conexus state.
3. `ConversationId` and `AgentRunId` are Conexus identities; Mastra thread/run IDs are opaque runtime refs.
4. An AgentRun exists and is fully pinned **before** the production agent loop begins.
5. Runtime `complete/error/suspended` events are proposals/observations; PAR alone writes AgentRun terminal truth.
6. Direct Agent suspension may carry checkpoint mechanics, but resume always re-enters current Conexus guards.
7. ApprovalRequest remains the only authority for approval wait; runtime suspension carries no permission.
8. ALLOW_ONCE resumes through Gateway claim/effect admission; DENY/EXPIRED/STALE resume as non-effect outcomes.
9. Workflow retry or agent repetition never authorizes Gateway effect replay.
10. Mastra schedule rows are derived trigger projections, never AgentTrigger authority.
11. Schedule fire is a proposal to PAR; it never starts Production Agent execution before run admission.
12. Trigger disable/update/revision drift is checked at PAR fire admission, so stale schedule projections fail closed.
13. One logical schedule occurrence admits at most one AgentRun.
14. F1 does not queue overlapping schedule occurrences; one trigger has at most one non-terminal AgentRun at a time.
15. Scheduled runs are threadless by default; Conversation is not hidden automation state.
16. Conversation/Agent Memory scope prevents cross-Workspace/Project/agent/subject leakage.
17. `EVENT` remains disabled; Signals/Inbox cannot become unreviewed external ingress.
18. Normal active direct AgentRun does not promise transparent mid-turn process-crash continuation; genuine suspended runs may resume from persisted substrate state.
19. Old suspended/in-flight run resumes with the exact old Release/runtime projection, never `latest`.
20. `createDurableAgent()`/cache/pubsub, Temporal, multi-agent and Stored Agents remain off baseline until a named consumer proves need.

---

## 6. Alternatives

### Alternative A — direct Mastra Agent baseline + selective durable suspension + guarded PAR schedule ingress

```text
Release
→ derived ephemeral Mastra Agent projection
→ direct AgentRun execution

approval/input wait
→ explicit tool suspension
→ mastra_par snapshot
→ Conexus reauthorization
→ resume same AgentRun

SCHEDULE fire
→ derived Mastra schedule
→ narrow PAR fire ingress
→ AgentRun admission
→ production Agent invocation
```

**Recommended.**

Reasons:

- uses current Mastra Agent durability where it already exists;
- no mandatory workflow wrapper;
- no cache/pubsub requirement;
- keeps AgentRun admission and schedule safety in PAR;
- preserves Gateway authority for effects;
- can be tested with current APIs.

### Alternative B — wrap every Production AgentRun in a Mastra Workflow

```text
AgentRun
→ workflow
→ agent step
→ every wait/effect/resume through workflow
```

**Reject as baseline.**

A workflow is justified when the product has an explicit durable multi-step deterministic orchestration/branch/wait graph. Direct Agent suspension already covers approval/input waits. Universal wrapping would add snapshots, workflow IDs, step semantics and retry behavior without a current consumer.

### Alternative C — `createDurableAgent()` for every Production Agent

**Defer.**

It solves reconnectable streams/multi-client observation, but adds cache/pubsub and workflow wrapping. Current F1 requires durable domain state and recoverable waits, not resumable token-stream ownership after client disconnect.

Named reopen trigger:

> first real product requirement that a disconnected/reconnected client must attach to the same in-flight token/tool stream with no semantic restart.

### Alternative D — Mastra Schedule directly targets the Production Agent

**Reject.**

It bypasses the required Conexus AgentRun admission boundary. A scheduler wake is not permission to execute the current agent composition.

### Alternative E — Mastra Editor / Stored Agent as runtime definition

**Reject as authority.**

It creates a second mutable/versioned agent source beside Git + Artifact Registry + Release.

---

## 7. Exact runtime projection

### 7.1 Runtime Agent projection is derived

A Production Agent runtime object is produced from one exact Release-pinned composition.

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
→ Mastra Agent instance/config
```

The projection is:

```text
derived
rebuildable
cacheable as optimization
non-authoritative
```

No durable `MastraAgentRevision` or Conexus `RuntimeAgentRevision` class is created.

### 7.2 Runtime projection identity

The runtime projection must be keyed strongly enough to prevent latest/config drift, e.g. by exact Release/composition identity.

Exact runtime `agentId` string format remains implementation/3L.

Invariant:

```text
same pinned composition → equivalent runtime projection
new Release/composition → different projection identity/config
```

### 7.3 Old runs

On resume/recovery:

```text
AgentRun pinned Release R17
active Release now R19
→ rebuild/resolve projection R17
→ never execute R19 on behalf of R17
```

If the deployed runtime can no longer interpret the pinned old runtime/version, do not silently migrate; 3J/3M drain/recovery applies.

---

## 8. Mastra Editor / Stored Agent prohibition

Production execution does not resolve Conexus AgentDefinition from:

```text
Mastra Editor published version
Stored Agent draft/published version
/api/stored/agents mutation
Studio authoring state
```

F1 preferred realization:

> code/host constructs the Mastra Agent from the exact Conexus runtime projection.

If Mastra internally persists any definition-like material for mechanics, it must be derived/rebuildable and digest-bound to Conexus authority; it cannot be an independently editable source.

`CX-AGENT-MASTRA-01` must attempt to mutate Stored Agent/Editor state and prove that Conexus Production Agent execution does not change.

---

## 9. Conversation mapping

`par.conversation` remains canonical identity/policy. Mastra owns messages/thread storage.

Conceptual mapping:

```text
ConversationId
→ exact Mastra thread ref

Conexus-selected memory/resource scope
→ Mastra resource scope
```

Properties:

1. no duplicate full message log in `hub_control`;
2. no current authorization derived from thread metadata;
3. thread/resource namespace must include sufficient Conexus scope to prevent cross-tenant/Project/agent/subject bleed;
4. one Conversation can span multiple AgentRuns and Release revisions; each AgentRun independently pins its exact Release;
5. old thread messages remain historical context, not current authority.

Exact ID encoding stays 3L/implementation.

---

## 10. Scheduled run is not a hidden Conversation

F1 SCHEDULE invocation is **threadless by default**.

Reason:

```text
Conversation = interactive thread/history semantic
Automation State = trigger/cursor/run semantic
```

A recurring automation does not silently create one forever-growing shared Conversation merely to gain continuity.

Cross-run memory, when explicitly enabled, uses Agent Memory policy/scoping; deterministic automation cursor belongs in `AgentTrigger`/owner facts when needed.

A future scheduled consumer that explicitly posts into or continues a named Conversation may introduce that binding through a concrete Decision Loop.

---

## 11. AgentRun dispatch sequence

New manual/chat/schedule invocation follows the owner-first order:

```text
1. PAR receives invocation proposal
2. resolve current admissible Release for this new run
3. admit par.agent_run with exact immutable composition pins
4. derive/rebuild exact RuntimeAgentProjection
5. invoke Mastra Agent with Conexus correlation/request context
6. record opaque runtime run ref when observed
7. consume runtime events/results as proposals/telemetry
8. PAR terminalizes or records pending proposal according to owner guards
```

No runtime I/O occurs inside the PAR authority transaction.

### 11.1 Runtime completion

Mastra final completion is not domain completion by itself.

```text
runtime reports complete
→ PAR verifies AgentRun still non-terminal
→ no conflicting current pending approval/effect state prevents completion
→ exact run/composition correlation matches
→ PAR may terminalize COMPLETED
```

If cancellation already won, late completion is telemetry only.

### 11.2 Runtime error

Runtime error/loss is evidence for PAR/3M judgment, not automatic state mirroring.

No `MastraStatus → AgentRunStatus` table exists.

---

## 12. Active versus suspended process loss

### 12.1 Active, non-suspended run

F1 does not promise transparent mid-turn/mid-tool recovery after host process death for an ordinary active direct AgentRun.

```text
process dies during active run
→ no implicit same-run replay
→ liveness/recovery path
→ later FAILED/CANCELLED/recovery decision under 3M
```

A new attempt/invocation is not secretly the same AgentRun.

### 12.2 Genuine suspended run

When the runtime has durably persisted a suspension snapshot:

```text
same AgentRun
→ may be rediscovered after restart
→ exact pinned runtime projection rebuilt
→ current Conexus guards rechecked
→ same runtime run resumed by opaque run ref
```

Snapshot resumability means "the runtime knows where to continue", not "it is currently authorized to continue".

### 12.3 Missing/corrupt snapshot

Conexus does not synthesize checkpoint state. Missing/corrupt substrate state routes to 3M.

---

## 13. Gateway tool wrapper

All business/effectful Production Agent tools are projections into Gateway authority.

```text
Mastra Agent tool call
→ PAR/Gateway tool wrapper
→ exact current AgentRun/Release/tool/capability context
→ Capability Gateway
→ governed read/effect
```

No direct ERP/DB/API/Connection path exists because the framework allows arbitrary tools.

Tool names/descriptions are tactics; allowed capability surface is Release/current-authority projection.

---

## 14. Approval suspension realization

### 14.1 Recommended baseline — explicit tool suspension, not Mastra boolean approval authority

Mastra native `requireToolApproval` / `approveToolCall` / `declineToolCall` is useful mechanics, but Conexus has richer semantic outcomes:

```text
ALLOW_ONCE
DENY
EXPIRED
STALE
```

and must perform claim/effect admission through Gateway after owner revalidation.

Recommended F1 mapping:

```text
Gateway wrapper proposes effect
→ Gateway/PAR says approval required; no effect executed
→ PAR persists/binds exact currentPendingProposal + ApprovalRequest
→ tool suspends with exact non-authoritative proposal/wait refs
→ Mastra persists suspension snapshot
```

Later:

```text
ApprovalRequest outcome becomes current/claimable
→ PAR rechecks run + currentPendingProposal + claim guards
→ resume same suspended Mastra run with typed resume outcome
```

The tool wrapper then behaves:

```text
ALLOW_ONCE
→ invoke Gateway again with exact proposal/claim/effect identity
→ Gateway owns FIRST_CLAIM + EffectAttempt + replay safety
→ return receipt/result to agent

DENY | EXPIRED | STALE
→ DO NOT call effect execution
→ return typed non-effect result to agent
→ same AgentRun may continue
```

This exactly realizes 3G-05 without forcing a two-state runtime approval primitive to become domain semantics.

### 14.2 Native Mastra approval remains probe-eligible, not baseline authority

3L may prove that Mastra native approval mechanics can carry the same Conexus outcome/claim semantics without bypass or loss. If so, the implementation may use it internally.

But:

```text
Mastra approve = permission to execute effect
```

is never accepted as an authority shortcut.

---

## 15. Cross-database wait boundary

`hub_control` and `mastra_par` do not share a transaction.

Safe ordering candidate:

```text
1. persist Conexus pending proposal / ApprovalRequest authority
2. request runtime suspension
```

Why owner-first:

- crash after step 1 but before suspension leaves a domain wait fact but **no external effect**;
- runtime failure to suspend cannot execute the protected effect because Gateway admission already refused it;
- recovery can classify/settle an orphan wait later in 3M.

The inverse ordering can leave a suspended runtime state with no corresponding Conexus wait authority.

3H-02 does **not** add distributed transactions/outbox/saga infrastructure solely to erase this bounded fail-closed window.

Fable should attack whether owner-first is globally superior or whether another ordering/handshake is required.

---

## 16. Approval/cancel/resume races

Owner-local guards from 3G-05 remain decisive.

### 16.1 Cancel wins

```text
AgentRun CANCELLED commits
→ later ApprovalRequest claim/resume guard refuses
→ runtime abort/cleanup best-effort
→ stale suspended snapshot cannot regain authority
```

### 16.2 ALLOW/FIRST_CLAIM wins

If Gateway claim/effect admission commits first:

```text
claim remains consumed/permanent as already defined
→ later cancel cannot rewrite effect history
→ 3G-06 effect close/dispatch laws apply
```

### 16.3 Resume retry

If runtime resume request is repeated because response is lost, the Gateway call after ALLOW uses the same exact proposal/effect identity. Repetition cannot become a second effect merely because Mastra resumes/retries.

---

## 17. Workflow usage

### 17.1 Direct Agent is baseline

A normal Production AgentRun uses Mastra Agent directly.

### 17.2 Workflow is admitted only for a concrete orchestration consumer

A Mastra Workflow is justified when the exact agent/product runtime composition requires explicit durable orchestration such as:

```text
deterministic step A
→ branch/parallel
→ agent reasoning step
→ durable wait
→ deterministic continuation
```

Workflow use must remain a runtime projection of exact Conexus-authored semantics; it is not a generic Hub workflow DSL.

### 17.3 Workflow retry never owns effect replay

If an explicit workflow has an effectful step:

```text
Workflow retry
-X-> authorize repeat external effect
```

Every effect still passes Gateway with stable identity/idempotency semantics. `OUTCOME_UNKNOWN` never becomes "workflow step retry" by default.

---

## 18. `createDurableAgent()` / cache / pubsub

Not baseline F1.

Reason:

```text
current requirement:
durable domain run + durable wait + restart-safe suspended continuation

createDurableAgent adds:
reconnectable stream ownership
cache backend
pub/sub
workflow wrapping
multi-client stream observation mechanics
```

That additional complexity has no named current correctness consumer.

It may be adopted later if the product requires attaching to the same in-flight stream after client disconnect or multi-process streaming semantics.

No Redis requirement follows from 3H-02.

---

## 19. SCHEDULE runtime projection

### 19.1 AgentTrigger is authority

```text
par.agent_trigger
→ enabled/disabled + exact trigger semantic definition

Mastra schedule row
→ derived runtime projection
```

The schedule row is rebuildable substrate state. No direct query from domain modules to Mastra schedule tables.

### 19.2 Direct schedule → Production Agent is forbidden

Although Mastra supports an `agentId` target, Conexus F1 must not use a projection that begins the Production Agent loop before PAR admits the AgentRun.

Required shape:

```text
Mastra scheduler fire
→ narrow deterministic PAR schedule-fire ingress
→ guarded owner-local AgentRun admission
→ exact Release resolution/pinning
→ Production Agent runtime invocation
```

Current plausible realization:

```text
Mastra workflow schedule
→ one deterministic dispatch step
→ PAR schedule-fire ingress
```

This workflow, if used, is static runtime adapter mechanics, not a domain workflow or user-authored automation model.

3L must verify whether this is the smallest current mechanism or whether Mastra exposes an even narrower callback/hook while preserving the same property.

---

## 20. Schedule projection mutation ordering

No cross-DB transaction is required because every fire re-enters PAR guards.

### 20.1 Create/enable/update

Safe principle:

> domain authority is never granted by the schedule projection.

PAR commits current trigger authority, then reconciles runtime projection. A temporarily missing projection is availability loss, not unauthorized execution.

### 20.2 Disable

```text
PAR DISABLE commits first
→ any stale schedule fire is rejected at PAR admission
→ pause/delete/reconcile Mastra row afterwards
```

This gives fail-closed safety if projection mutation fails.

### 20.3 Startup/restart reconciliation

Runtime startup may reconcile enabled `AgentTrigger` authority to derived schedule rows idempotently. This is projection repair, not a second scheduler authority.

No generic reconciliation engine is created.

---

## 21. Trigger revision binding

A schedule projection must carry enough immutable correlation to detect stale rows/fires:

```text
TriggerId
TriggerRevision / equivalent semantic revision identity
```

At fire admission:

```text
fire.triggerId exists
+ trigger enabled
+ fire revision == current admitted trigger revision
+ Project/Release/runtime gates pass
→ maybe admit AgentRun
```

A fire from an old schedule revision after cron/update races is rejected.

The schedule row itself does not pin the Release for future runs. New AgentRun resolves the current active admissible Release **at fire admission**, then pins it.

This ensures a long-lived trigger can naturally use a newly promoted Release for future occurrences without mutating previous runs.

---

## 22. Schedule occurrence identity and duplicate fire

Scheduler delivery is not assumed exactly-once.

F1 needs a semantic occurrence identity equivalent to:

```text
trigger identity
+
trigger revision
+
intended scheduled instant
```

or a substrate-provided equivalent proven stable by 3L.

Property:

```text
same schedule occurrence delivered twice
→ at most one AgentRun admitted
```

This may be enforced with existing `par.agent_trigger` cursor/current facts and/or AgentRun uniqueness/admission facts. No `ScheduleOccurrence` durable class is proposed.

If current Mastra APIs cannot expose a stable intended-fire identity, 3L must prove the smallest adapter needed to construct one; silently accepting duplicate-run semantics is not allowed.

---

## 23. F1 overlap policy — single-flight per SCHEDULE trigger

3G-05 explicitly left overlap for the first real runtime decision. 3H-02 now has a current schedule consumer boundary, so F1 must choose a behavior.

Candidate:

```text
for one SCHEDULE AgentTrigger:
at most one non-terminal AgentRun at a time
```

If a **distinct** schedule occurrence arrives while the previous trigger-origin AgentRun is still non-terminal:

```text
→ do not queue
→ do not start concurrent run
→ record/emit skipped/refused occurrence observation as appropriate
```

No backlog/replay is created.

Why this is the smallest safe baseline:

- prevents shared automation-memory/effect races;
- no queue/scheduler framework;
- preserves deterministic cost/budget behavior;
- periodic monitors normally complete before next cadence;
- a future consumer that requires catch-up, coalescing, queueing or overlap can reopen with concrete semantics.

Fable should attack whether this is too restrictive or whether overlap should remain deferred even at runtime realization.

---

## 24. Manual invocation versus schedule `.run()`

Mastra's manual schedule-fire API is runtime tooling, not Product Agent invocation authority.

A user/operator requesting "run this agent now" should enter PAR through the appropriate manual/ad-hoc invocation surface and create a properly pinned AgentRun, rather than using `mastra.schedules.run()` as an authority shortcut.

Schedule `.run()` may remain diagnostic/qualification mechanics if it still feeds the same guarded fire ingress.

---

## 25. EVENT / Signals / Inbox

3H-02 does not operationalize EVENT.

```text
external webhook
Mastra notification signal
Inbox wake
-X-> F1 Production AgentRun admission
```

unless/until the first real EVENT consumer triggers C-007/3I design.

Signals may still exist internally as framework mechanics for a future approved path, but no external source gains authority through signal metadata.

No webhook module/event bus is introduced.

---

## 26. Memory realization

### 26.1 Four authorities remain distinct

```text
Brain               = governed organizational knowledge authority
Conversation        = interactive thread/history
Agent Memory         = non-authoritative remembered context
Automation State    = deterministic trigger/cursor/run facts
```

### 26.2 F1 memory defaults

Candidate baseline remains conservative:

```text
Conversation message history     = ON when Conversation exists
Working Memory                   = only when exact agent policy/consumer enables it
Semantic Recall                  = OFF until eval/qualification
Observational Memory             = OFF until eval/qualification
Memory Extractor auto-publish    = NEVER to Brain
```

### 26.3 Scope

Memory resource scoping must include the exact Conexus isolation dimensions necessary for the configured memory class, at minimum preventing leakage across Workspace/Project/Agent and subject/user where applicable.

No Mastra resource/thread identifier becomes authorization truth.

### 26.4 Agent Memory versus scheduled runs

A threadless scheduled AgentRun may still use explicitly configured Agent Memory. It does not need a fake Conversation for continuity.

---

## 27. Runtime cancellation

Owner truth first:

```text
PAR terminalizes AgentRun CANCELLED
→ request runtime abort/interrupt
→ refuse future resume/claim/late-complete authority
```

For suspended runs, stale snapshots may remain substrate garbage/history until cleanup, but cannot be resumed after Conexus cancellation guards fail.

Exact physical abort API stays 3L; cleanup/GC stays 3J/3M.

---

## 28. Runtime refs and observability

Persist only load-bearing opaque correlation refs where owner records need them.

Conceptually on AgentRun/Conversation as applicable:

```text
Mastra thread ref
Mastra runtime run ref
runtime kind/version
trace/span refs
schedule projection/fire refs where needed for correlation
```

Everything remains:

```text
provider/runtime correlation
!= domain identity
!= authorization
!= completion authority
```

Mastra native telemetry maps to Conexus OBS as provider-observed operational telemetry. A runtime `complete` event never directly changes AgentRun state.

No second event ontology/status mirror.

---

## 29. `mastra_par` durability boundary

`mastra_par` remains the dedicated Mastra substrate store for:

```text
Conversation messages/history
Agent Memory mechanics
agent/workflow suspended-run snapshots
schedule rows
other qualified PAR runtime internals
```

Conexus modules do not query Mastra tables directly.

Because suspended Production AgentRuns and Conversation history may be product-significant, `mastra_par` remains in the stronger durability/backup class already routed to 3J.

3H-02 does not duplicate that state into `hub_control` merely to make it feel safer.

---

## 30. Runtime upgrade / old snapshot law

A suspended AgentRun pins exact runtime kind/version with its Release/run identity.

Deployment must not assume:

```text
new Mastra version
→ can deserialize every old snapshot automatically
```

F1 architecture law:

```text
old in-flight/suspended run
→ old qualified runtime/version while supported

new run
→ new qualified runtime/version
```

Physical drain/cutover retention belongs to 3J. If old runtime support is lost unexpectedly, 3M handles recovery; no cross-engine snapshot-migration subsystem is promised.

---

## 31. F5 / runtime handoff

Mastra/runtime events and results are producer proposals into PAR, not domain writes.

Examples:

```text
runtime completed
runtime suspended
runtime tool proposed effect
schedule fired
runtime failed
```

Each enters the owner-specific path that judges it.

No `UniversalRuntimeEvent`, `UniversalAgentResult`, `RuntimeStatus` mirror or generic proposal ledger is introduced.

---

## 32. Technology qualification — `CX-AGENT-MASTRA-01`

3H-02 does not qualify a Mastra version. It defines the failure tests 3L must run.

At minimum prove controls **firing** for:

```text
P1  exact Release/AgentDefinition compiles to runtime Agent without Stored-Agent authority
P2  mutate Mastra Editor/Stored Agent draft/published state → Production Agent behavior unchanged
P3  projected business tool cannot access DB/ERP/API outside Capability Gateway
P4  Conversation/message memory isolation across Workspace/Project/Agent/subject
P5  direct Agent tool suspend → kill process → fresh process → list suspended run → resume same AgentRun
P6  ALLOW_ONCE path resumes same run and executes only through Gateway FIRST_CLAIM/EffectAttempt
P7  DENY resumes same run as non-effect outcome; no Gateway effect
P8  EXPIRED resumes same run as non-effect outcome; no Gateway effect
P9  STALE resumes same run as non-effect outcome; no Gateway effect
P10 cancel before claim/resume → runtime snapshot/output cannot regain authority
P11 repeated/lost-response resume on ALLOW cannot duplicate external effect
P12 ordinary active non-suspended process loss does not silently replay same AgentRun
P13 old suspended run after newer Release promotion resumes exact old Release/runtime projection
P14 new run after promotion uses current new Release
P15 model/provider/runtime pin cannot drift/fallback silently
P16 workflow retry/crash cannot authorize repeated external effect
P17 SCHEDULE projection does not start Production Agent before PAR AgentRun admission
P18 timezone/DST behavior matches exact Trigger semantics
P19 DISABLE commits while stale Mastra schedule still exists → stale fire rejected
P20 trigger update old-revision fire → rejected
P21 duplicate same occurrence → at most one AgentRun admitted
P22 distinct overlapping occurrence while prior run non-terminal → no concurrent run / no queue baseline
P23 scheduler/restart preserves or reconstructs derived schedule projection without second authority
P24 occurrence identity is stable enough to dedupe restart/double-fire
P25 scheduled run is threadless unless an explicit Conversation binding exists
P26 Semantic Recall/OM remain OFF when not enabled by exact policy
P27 runtime complete after AgentRun CANCELLED cannot terminalize COMPLETED
P28 runtime trace/run IDs correlate to Conexus AgentRun/Gateway evidence without becoming authority
P29 `createDurableAgent`/cache/pubsub not required for direct suspend/restart proof
P30 EVENT/Signals external ingress remains disabled in F1
```

Qualification failure first reopens substrate/realization, not 3G domain semantics automatically.

---

## 33. YAGNI audit

Candidate adds:

```text
new domain module                    = 0
new durable record class             = 0
new Tier-2 FK                         = 0
new workflow engine                   = 0
new Conexus scheduler                 = 0
new queue/backlog                     = 0
new lease/fencing                     = 0
new retry engine                      = 0
new checkpoint engine                 = 0
new event bus                         = 0
new webhook ingress                   = 0
new runtime-state mirror              = 0
new agent versioning/authoring system = 0
Redis/cache/pubsub requirement        = 0
Temporal requirement                  = 0
Stored Agents runtime authority       = 0
```

One tiny schedule-fire ingress adapter may be required because the current Mastra schedule API targets agent/workflow execution. If a static one-step Mastra workflow is the smallest mechanism, it is substrate adapter code, not a Conexus workflow system.

---

## 34. Explicitly deferred

```text
EVENT trigger / external signals                 → first consumer + C-007 / 3I
reconnectable same-stream UI                     → Decision Loop; maybe Durable Agent
multi-agent/subagents/networks                    → first consumer + eval
Temporal workflow runtime                         → concrete workflow failure class
semantic recall / OM / extractors                 → eval / 3L
schedule catch-up/backlog/coalescing/ALLOW overlap→ first real consumer that needs it
agent goals/task lists as product authority        → reject until explicit semantic consumer
persistent agent filesystem/workspace              → first production consumer
runtime snapshot migration across engines          → not promised
```

---

## 35. Strongest arguments against this proposal

### Objection A — "The deterministic schedule ingress workflow is overengineering; point the schedule at the agent and create the Conexus AgentRun after it starts."

Provisional response:

That reverses authority order. Model/tool execution could happen before Release/current trigger/Project guards commit. A run record created after runtime begins is audit, not admission. The adapter exists to preserve the already-frozen owner boundary, not to introduce orchestration.

Fable should try to find a narrower current Mastra mechanism that preserves owner-first admission.

### Objection B — "Single-flight per schedule trigger will drop legitimate work."

Provisional response:

Correct: it trades catch-up semantics for bounded F1 safety. Queue/coalesce/backlog policies are product semantics, not free scheduler options. If a current F1 consumer demonstrably requires every occurrence, then 3H-02 must decide that now; otherwise skip-on-overlap is the smallest deterministic baseline.

### Objection C — "Using explicit `suspend/resumeData` rather than native tool approval is building around Mastra instead of with it."

Provisional response:

Conexus already has ALLOW_ONCE/DENY/EXPIRED/STALE + claim binding + Gateway effect admission. Native boolean approval is acceptable only if it can preserve those semantics without becoming authority. Generic suspension is currently the more faithful mapping and does not add a new engine.

### Objection D — "Direct Agent baseline is less durable than workflow/durable-agent baseline."

Provisional response:

Durability is failure-class-specific. Direct Agents already persist explicit suspension snapshots. Ordinary mid-turn crash recovery is not currently promised by 3G. Wrapping every run to gain stream continuity changes the problem and adds infrastructure.

### Objection E — "A schedule occurrence key/cursor is secretly a new scheduler."

Provisional response:

It is an admission/idempotency fact for a real at-least-once wake boundary, not a scheduling engine. Mastra still decides when the cron fires. Conexus only ensures one domain run per exact occurrence.

---

## 36. Falsification questions for Fable

### A. Scope / decomposition

1. Is 3H-02 correctly one decision package, or should schedule realization be a separate 3H decision because it carries distinct failure classes?
2. Which sections merely restate 3C/3G and should be demoted from normative 3H-02 text?
3. Did ChatGPT accidentally pull a 3I/3J/3M concern into runtime semantics?

### B. Runtime projection / authoring

4. Is an ephemeral Release-scoped Mastra Agent projection sufficient to prevent Stored-Agent/Editor authority leakage?
5. Can current Mastra require a Stored Agent/Editor path for any capability we need, creating a hidden second authority?
6. What exact runtime keying prevents old/new Release projection collision without creating another revision model?
7. Can a same-thread Conversation safely switch between Agent projections pinned to different Releases?
8. Does any Mastra persisted agent/workflow-definition state survive in a way that can alter execution independently of the current Conexus projection?

### C. Conversation / memory

9. Is threadless-by-default SCHEDULE correct, or does current PAR semantic authority imply a persistent Conversation for autonomous agents?
10. Construct a memory-leak schedule across Workspace/Project/agent/user scopes under the proposed mapping.
11. Does Working Memory need to be ON by default for Production Agents, or is explicit per-agent enablement correct YAGNI?
12. Can old thread messages contain stale tool/authority state that requires mechanical cleansing rather than prompt/runtime projection alone?
13. Is Conversation history in `mastra_par` sufficiently durable without a `hub_control` message mirror?

### D. Direct Agent versus Workflow/Durable Agent

14. Does current Mastra direct Agent suspension truly survive process kill for our exact tool-suspend case, not only native approval?
15. Is there a crash schedule where a direct Agent cannot satisfy an already-approved 3G invariant but a universal workflow wrapper can?
16. Does `createDurableAgent()` solve any current Conexus correctness requirement rather than UX stream continuity?
17. Could direct Agent mid-tool process loss cause a dangerous implicit replay on restart even if Conexus does not ask it to resume?
18. Is any workflow retry bookkeeping/state sufficiently non-durable that our explicit-workflow allowance needs an additional guard?

### E. Approval / suspension

19. Is owner-first `ApprovalRequest/currentPendingProposal` then Mastra suspension the safest cross-DB ordering?
20. Construct the worst crash window between domain wait persistence and runtime snapshot persistence.
21. Does explicit tool `suspend()` preserve enough exact tool-call identity to resume the same proposal after restart?
22. Can DENY/EXPIRED/STALE be resumed as typed data without accidentally re-entering tool execution/effect path?
23. Is native `approveToolCall/declineToolCall` actually semantically sufficient if wrapped correctly, making the generic suspension preference unnecessary?
24. Could ALLOW_ONCE be committed while runtime resume fails permanently; what remains true and who owns recovery?
25. Repeated resume after response loss: can Mastra rerun tool code before Gateway dedupe sees the same effect identity?
26. Does the proposal/claim/effect identity remain stable across runtime suspension/resume without another durable record?

### F. AgentRun / process loss / cancellation

27. Is "no transparent mid-turn process-crash resume for ordinary active run" consistent with 3C-10's durable-agent language?
28. Does any current product requirement actually require active-run process crash recovery now?
29. Can late runtime completion or tool output after PAR CANCELLED race past owner guards?
30. What exact runtime interrupt primitive exists for direct Agent and suspended Agent run, and is a missing physical abort a 3H blocker or 3M concern?
31. Can old suspended snapshots be resumed accidentally by a different process after AgentRun CANCELLED?

### G. Schedule authority / ingress

32. Is direct Mastra Schedule→Production Agent structurally impossible to make safe, or can request-context hooks perform PAR admission before model execution with no workflow adapter?
33. Is a static one-step Mastra workflow the smallest valid schedule-fire transport today?
34. Does using a Mastra Workflow only as a scheduler ingress accidentally create a persisted `workflowDefinitions` authority/bypass?
35. Should schedule projection be one row per AgentTrigger or one row per trigger revision?
36. Which order for create/enable/update minimizes unauthorized execution without requiring cross-DB atomicity?
37. Is domain-first DISABLE + stale-fire rejection sufficient if pause/delete of Mastra row fails forever?
38. Can runtime restart create duplicate schedule rows/fires from projection reconciliation?

### H. Occurrence identity / overlap

39. Does current Mastra expose a stable intended scheduled instant or occurrence identifier suitable for dedupe? Verify current source/docs.
40. If not, what is the smallest adapter that can produce one without creating a Conexus scheduler?
41. Is occurrence dedupe genuinely required by an approved invariant, or can Gateway idempotency alone absorb duplicate schedule AgentRuns?
42. Is `at most one non-terminal AgentRun per trigger` the correct F1 overlap law?
43. Construct a real F1 consumer where skip-on-overlap loses required correctness, not just convenience.
44. Should skipped distinct occurrences be durable facts or telemetry only?
45. Does a trigger cursor on `par.agent_trigger` suffice, or is a durable occurrence class actually unavoidable under crash/restart?
46. Race: occurrence A admitted, Hub crashes before runtime dispatch, scheduler redelivers A — must it resume dispatch of same AgentRun or treat as already admitted no-op?
47. Race: runtime dispatched, AgentRun record committed, response lost, schedule redelivery — prove no second run.

### I. Release/runtime evolution

48. Can a suspended run reliably rebuild exact old Agent projection after newer Release is active?
49. What must remain deployed to interpret old Mastra snapshot/runtime version?
50. Does this belong entirely in 3J, or does 3H-02 need a stricter runtime compatibility seam now?
51. Could thread/message schema changes across Mastra versions make old-run resume impossible while Conversation remains readable?

### J. Signals/EVENT

52. Did ChatGPT correctly keep all current Signals/Inbox external wake behavior out of operational F1?
53. Does SCHEDULE internally use signals in a way that accidentally activates EVENT semantics or external ingress authority?
54. Can a Mastra signal steer an active run through a path not represented by a Conexus invocation/authority context?

### K. Observability / storage

55. Which Mastra refs genuinely need persistence on `par.*` versus OBS telemetry only?
56. Could storing runtime schedule/run IDs become stale current-state mirrors similar to the risk found in 3H-01?
57. Is `mastra_par` sufficiently isolated from Builder state under 3E, or does this decision create a cross-substrate query temptation?
58. Does any runtime completion/suspend event need a new F5 durable handoff record?

### L. YAGNI / Global Maximum

59. Which accepted candidate rule is most deletable while preserving every named failure class?
60. Which proposed mechanism is overengineering disguised as authority enforcement?
61. Which deferred capability is actually load-bearing for a realizable F1 and must be pulled into 3H-02?
62. Is the schedule occurrence identity a necessary seam or accidental complexity?
63. Is explicit tool suspension versus native approval a justified adaptation or unnecessary wrapper logic?
64. Is Direct Agent + selective suspension + schedule-ingress adapter still the Global Maximum compared with universal Workflow/Durable Agent?
65. Strongest argument for rejecting the entire recommended Alternative A.
66. Final recommendation: `CURRENT STRUCTURE CONFIRMED`, `RESTRUCTURE NOW`, `TRANSITIONAL SOLUTION`, `STOP/SPLIT PREREQUISITE`, or `DEFER SAFELY`.
67. State whether 3H-02 is ready for ChatGPT consolidation/operator review or requires another adversarial round.

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

Do not modify earlier rounds, `LEDGER.md`, approved authority or product code. Append `Round 1 — Fable` to this dialogue file and commit/push only this dialogue change.

---

# Round 1 — Fable

**Role:** independent adversarial Senior/Staff/Principal Software Engineer + Software Architect.
**Authority reconstructed from:** `AGENTS.md` → method → `DECISOES.md` (C-000..C-017, esp. C-010/C-013/C-016) → `LEDGER.md` → 3C-10, 3C-R1, 3D-R1, 3E-01/3E-02, 3F-02/3F-03/3F-R1, 3G-01, 3G-02, 3G-03, 3G-05, 3G-06, 3G-R1, 3H-01 (approved). This dialogue treated as proposal only.
**Method:** DevelopmentConexus Engineering Method v1.0.0. Nothing here approves 3H-02.

---

## 37. External evidence verified this round

Evidence IDs `V1..V9` are local to this dialogue (independent of the 3H-01 dialogue's numbering). All verified against Context7 `/mastra-ai/mastra` and raw current source; none from model memory.

| ID | Verified fact | Source |
|---|---|---|
| V1 | `Agent.listSuspendedRuns()` survives restart with persistent storage; returns runs with `toolCalls [{toolCallId, toolName, args, requiresApproval, suspendPayload}]`; resume via `approveToolCall({runId, toolCallId})` (native approval) or `resumeStream(resumeData, {runId})` (generic `suspend()`). Exact tool-call identity and args are preserved in the snapshot. | `docs/agents/agent-approval.mdx`, `reference/agents/listSuspendedRuns.mdx` |
| V2 | Generic tool suspension is first-class: `suspendSchema`/`resumeSchema` + `context.agent.suspend(payload)` / `context.agent.resumeData` (v1 API). | `reference/migrations/upgrade-to-v1/tools.mdx` |
| V3 | Workflow `retryConfig {attempts, delay}` exists, but retry counts live in a **process-local Map** (`retryCounts`), as does `lastPersistedStatusByRun`; the code comment states "on a crash the map is empty". No distributed locking, no exactly-once. | `packages/core/src/workflows/default.ts` |
| V4 | `createRestartExecutionParams` restarts runs with status `running`/`waiting` from the persisted snapshot, **re-using the same `runId` and replaying from stored state**. | `packages/core/src/workflows/utils.ts` |
| V5 | **"When running the local Mastra server, all active workflow runs are restarted automatically upon server startup."** Durable agents add opt-in `recovery.durableAgents: 'auto'` boot recovery that "re-drives every orphaned running durable-agent run"; docs warn recovery **re-issues LLM and tool calls** and requires idempotent tools. | `docs/workflows/overview.mdx`, `reference/core/mastra-class.mdx`, `docs/long-running-agents/durable-agents.mdx` |
| V6 | `mastra.schedules.create()` agent-target = `{id (normalized agent_<slug>), agentId, cron, prompt (required), timezone, threadId/resourceId, signalType, ifActive/ifIdle, status}`; workflow-target = `{id (schedule_<slug>), workflowId, cron, inputData, requestContext, initialState, status}`. Caller may supply a **stable schedule id**. `resumeSchedule` recomputes next fire from the current moment. Static `createWorkflow({schedule})` also exists, registered at boot. | `reference/schedules/overview.mdx`, `docs/workflows/scheduled-workflows.mdx` |
| V7 | Schedule worker: threadless agent fire calls **`agent.generate()` directly** with the row's prompt; threaded fire sends a signal; `scheduleRunMeta {scheduleId, threadId?}` rides `providerOptions`; trigger info `{kind: cron|manual, firedAt}` is available **to hooks**, not to the agent; and a trigger-history row is persisted per fire: `store.recordTrigger({scheduleId, runId, scheduledFireAt, actualFireAt, outcome, error, triggerKind})` — **`scheduledFireAt` exists as a persisted per-fire fact**. | `packages/core/src/schedules/worker.ts` |
| V8 | The schedule worker has **no overlap protection**: it dispatches each fire immediately without checking whether a prior run for the same schedule is still executing. | same source |
| V9 | Stored Agents/Editor: `PATCH /api/stored/agents/<id>` creates a draft; `getAgentById({status | versionId})` resolves published/draft/exact versions; `activateVersion()` switches the active version; and **a published stored override of a code-defined agent takes precedence — only when no active override exists does resolution return "the original code-based agent"**. Generic stored resources may additionally **fall back to the latest snapshot** when no active version exists. | `docs/editor/overview.mdx`, `reference/client-js/agents.mdx`, `reference/editor/versioning.mdx` |

Disposition on ChatGPT's M1–M6: **accurate**, with two material sharpenings — M3 (V7/V8: no substrate overlap guard; `scheduledFireAt` is available) and M5 (V9: the Editor is not merely an optional second authority; its override path **takes precedence over code-defined agents when active**, i.e. a live bypass channel).

---

## 38. Verdict up front

1. **No material Finding against approved authority** (3C-10, 3C-R1, 3G-01/05/06, 3E, 3F, 3H-01). No reopen.
2. **Alternative A (direct Agent + selective durable suspension + guarded PAR schedule ingress) is the Global Maximum.** Alternatives B/C/D/E correctly rejected/deferred — D and E now with direct source evidence (V7: agent-target fire goes straight to `agent.generate()`; V9: override precedence).
3. Two candidate gaps are **material and evidence-backed**: substrate auto-restart/replay is *default* behavior, not a hypothesis, and needs a frozen boot-recovery law (FBL-R1-01); the Stored-Agent prohibition is unenforceable as written because override resolution takes precedence — it must become a mechanical resolution law (FBL-R1-02).
4. Occurrence identity is **constructible today** (V7 `scheduledFireAt`); a trigger cursor + single-flight realizes dedupe with no new durable class (FBL-R1-03). Gateway idempotency alone is not sufficient (Q41).
5. Single-flight-per-trigger is confirmed as the right F1 law — and it must be Conexus-side, because the substrate has none (V8).
6. Owner-first cross-DB ordering (ApprovalRequest before runtime suspension) is confirmed globally superior; its worst crash window is honest and bounded (§44).
7. Threadless-by-default SCHEDULE, memory-scope law (with one concretization, FBL-R1-07), EVENT/Signals exclusion, and the direct-Agent baseline all survive attack.
8. Disposition: **CURRENT STRUCTURE CONFIRMED** with corrections FBL-R1-01..07; requires ChatGPT consolidation round; **not yet operator-ready**.

---

## 39. Material findings

Format: claim challenged / counterexample / authority affected / evidence / smallest correction / Global Maximum effect / reopen / later owner.

### FBL-R1-01 — Implicit replay is substrate default behavior; 3H-02 must freeze a boot-recovery law now

- **Claim challenged:** §12.1 promises "no implicit same-run replay" for ordinary active runs, and §17.3 says workflow retry never owns effect replay — but the candidate treats crash-replay as something Conexus merely *doesn't promise*, routing recovery wholly to 3M.
- **Counterexample / failure class:** V5 — the local Mastra server **automatically restarts all active workflow runs on startup**; V4 — restart re-uses the same `runId` and **replays from stored state**; V3 — retry/status guards are process-local and reset on crash. Durable-agent auto-recovery (`recovery.durableAgents: 'auto'`) re-issues **LLM and tool calls** on boot. Concrete schedule: the schedule-fire ingress workflow crashes after its dispatch step called PAR admission; host restarts; substrate replays the dispatch step → PAR receives the same fire again. Or: a PAR-related workflow/durable-agent run is auto-re-driven at boot with **no PAR admission**, re-issuing model/tool calls under a run PAR may have terminalized. This is not "recovery policy for 3M" — it is *default substrate behavior at every restart*.
- **Authority affected:** realizes 3G-05 §4/§10 (checkpoint is not permission; late output cannot regain authority); no contradiction.
- **Smallest correction — freeze three laws in 3H-02:**
  1. *The PAR host runs with blanket substrate auto-restart/auto-recovery disabled or scoped such that no PAR-originated run (agent, durable agent, or adapter workflow) is re-driven at boot without re-entering PAR guards.*
  2. *Any substrate-initiated restart/redelivery path that does fire (schedule redelivery, ingress-workflow step replay) must land on an idempotent PAR admission — verified-real at-least-once delivery, not hypothetical.*
  3. *Boot recovery for suspended runs remains discovery (`listSuspendedRuns`) + guard-gated resume — never blanket re-drive.*
- **Global Maximum effect:** converts the candidate's correct intentions into enforceable configuration/resolution laws at the exact substrate boundary where the default violates them.
- **Reopen:** no. **Later owner:** exact deployer/server config surface → 3J/3L; orphan policy remains 3M. Probe: crash a plain active agent run mid-tool + restart with the qualified configuration → no re-drive without PAR admission; crash the ingress workflow post-admission → replay is an idempotent no-op (ties to FBL-R1-03).

### FBL-R1-02 — Stored-Agent/Editor override takes precedence; the §8 prohibition must become a mechanical resolution law

- **Claim challenged:** §8 prohibits resolving Production Agents from Editor/Stored state, and P2 tests that mutating stored state changes nothing. As written, this is aspiration: it assumes Conexus controls which resolution path runs.
- **Counterexample / failure class:** V9 — when a **published stored override** exists for a code-defined agent id, `getAgentById` resolution **returns the override, not the code-defined agent**; and `/api/stored/agents/<id>` accepts a PATCH that creates such state. If the PAR host exposes the standard server surface and resolves agents through the registry lookup, one PATCH + activate silently replaces the Release-pinned Production Agent — a second authority not merely available but *winning by default*. The additional latest-snapshot fallback (V9) is the exact `latest`-drift class Conexus bans.
- **Authority affected:** enforces 3C-10 REJECT list; no contradiction.
- **Smallest correction — freeze:**
  1. *PAR resolves a Production Agent exclusively by direct construction from the exact `RuntimeAgentProjection` — never through an override-capable stored/registry resolution path, and never through any `latest`/fallback resolution.*
  2. *The stored-agent/editor API surface is not exposed by the PAR host* (surface enforcement mechanics → 3I/3J, but the resolution law is 3H-02's).
  3. *P2 is strengthened: the probe must create and activate a published stored override for the same agent id and prove Production Agent execution still follows the Conexus projection.*
- **Global Maximum effect:** the prohibition becomes falsifiable; the bypass channel is closed at the resolution point rather than by policy prose.
- **Reopen:** no.

### FBL-R1-03 — Occurrence identity: constructible today; cursor + single-flight realize dedupe; Gateway idempotency alone is insufficient

- **Claim challenged:** §22 wishes for an occurrence identity "or a substrate-provided equivalent proven stable by 3L", leaving open whether it exists and whether dedupe is even required (Q41).
- **Evidence:** V7 — the substrate persists `scheduledFireAt` (intended instant, distinct from `actualFireAt`) per fire in trigger history, and fire hooks receive `{kind, firedAt}`. The identity `(TriggerId, TriggerRevision, scheduledFireAt-or-equivalent)` is therefore constructible with current primitives; only the transport (hook vs. history read vs. run metadata) is 3L's choice. V5 makes dedupe **required**: ingress-workflow step replay after crash redelivers the same fire — a duplicate AgentRun would double model cost, run records and telemetry even when Gateway idempotency blocks the governed *effects*. Admission dedupe is an AgentRun-boundary obligation; Gateway dedupe only guards the effect boundary (Q41 answered).
- **Smallest correction:** freeze the identity requirement with the verified substrate fact named; realize dedupe as **a current-occurrence cursor fact on `par.agent_trigger` + the single-flight law** — because fires for one trigger are serialized by single-flight, a cursor comparison at admission absorbs duplicate/redelivered fires without any `ScheduleOccurrence` durable class (Q45 answered: cursor suffices). Crash-window races (Q46/Q47): occurrence admitted then crash before runtime dispatch → redelivery is refused by cursor as already-admitted; the admitted run follows run-level dispatch recovery (3M), never a second admission. Admitted + dispatched + response lost → same: cursor holds, no second run.
- **Reopen:** no. **Later owner:** transport mechanism → 3L (`CX-AGENT-MASTRA-01`).

### FBL-R1-04 — Invocation-content authority: the schedule row never carries semantic content

- **Claim challenged:** §19/§21 treat the schedule row as derived projection but do not state what the row may *contain*. The substrate's agent-target row **requires a `prompt` column** (V6) — a Mastra-persisted, mutable copy of invocation semantics.
- **Failure class:** if the projection carries the prompt/input content, a stale or mutated row delivers stale semantic content even when trigger identity/revision checks pass — content drift beneath a valid correlation envelope. This is also an independent reason Alternative D (agent-target) is structurally wrong, beyond admission order.
- **Smallest correction:** freeze: *the runtime schedule projection carries correlation only (trigger id/revision, transport needs). All semantic invocation content — prompt, input, agent composition — is resolved at PAR fire admission from current AgentTrigger + pinned Release authority.* The workflow-target projection with static correlation-only `inputData` satisfies this today (V6).
- **Reopen:** no.

### FBL-R1-05 — Effect identity is minted owner-side at proposal admission and carried opaquely across suspend/resume

- **Claim challenged:** §16.3 asserts repeated resume "uses the same exact proposal/effect identity" but never says who mints it or where it lives — if the tool regenerates it at resume, dedupe silently breaks.
- **Failure class (Q25/Q26):** resume re-executes tool code (V1/V2); a tool that recomputes an effect identity (new UUID, re-hashed payload with a timestamp) presents Gateway a *different* identity on each resume → `idempotency_claim` (3G-06) never matches → duplicate effect admission becomes possible under repeated resume.
- **Smallest correction:** freeze: *the exact proposal/effect identity is minted and persisted owner-side (currentPendingProposal/ApprovalRequest binding) at proposal admission; the suspended tool carries it as an opaque ref; resume re-presents the same identity; the tool never re-mints.* This makes P11 enforceable rather than assumed.
- **Reopen:** no.

### FBL-R1-06 — `par.*` runtime refs inherit the 3H-01 expectation law explicitly

3H-01 §8.1 already froze for `bld.*`: stored runtime refs are correlation/history facts and **expectations to be confronted with live observation, never current-runtime authority**. 3H-02 must state the same for `par.*` (thread refs, runtime run refs, schedule/fire refs, runtime kind/version) instead of leaving it implied. This also answers Q56 (stale current-state mirror risk) by construction. Zero new machinery — one sentence citing the 3H-01 precedent.

### FBL-R1-07 — Memory scope law concretized with a constructed leak

- **Claim challenged:** §26.3 requires scope to "include the exact Conexus isolation dimensions" — correct but abstract enough to fail in implementation.
- **Constructed leak (Q10):** the same `agent/v1` artifact is bound in Project A and Project B. If the Mastra memory `resourceId` is keyed by agent identity alone, Working Memory accumulated under Project A's data surfaces inside Project B's runs — cross-Project leakage through a shared artifact, with no access-control event anywhere.
- **Smallest correction:** freeze: *the memory resource key composes at minimum Workspace + Project + Agent identity (and subject/user where the memory class is subject-scoped); artifact identity alone is never a sufficient memory scope.* P4 is strengthened to test exactly the shared-artifact/two-Project construction.
- **Reopen:** no.

---

## 40. Block A — scope / decomposition (Q1–Q3)

- **Q1 —** one package is correct. Schedule realization shares the same root cause (substrate mechanics tempted into authority), the same substrate evidence base and the same owner seam (PAR ↔ Mastra); splitting would duplicate the evidence and interleave reopen triggers.
- **Q2 —** demote to restatement (non-normative in the final 3H-02 text): §2 entirely, §11.1/§11.2's first halves (3G-05 restates), §16 (3G-05/3G-06 restate), §27's first line, §30's first half (3G-05 §7). The genuinely new decisions: projection/resolution laws, dispatch sequence placement, boot-recovery law, suspension mapping, cross-DB ordering, schedule ingress + occurrence/overlap laws, memory scope concretization, ref persistence discipline.
- **Q3 —** one borderline pull: stored-agent API surface exposure (FBL-R1-02.2) touches 3I/3J server-surface territory — resolved by freezing the *resolution* law here and routing surface enforcement mechanics onward. Backup class (§29) correctly stays 3J. Nothing else leaked.

---

## 41. Block B — runtime projection / authoring (Q4–Q8)

- **Q4 —** ephemeral projection is sufficient **only** with FBL-R1-02's resolution law; without it, V9's override precedence defeats the design regardless of how clean the projection is.
- **Q5 —** no capability we need *requires* the Stored/Editor path today (agents are constructible from code/config, V6/V7 flows accept plain Agent instances); the risk is precedence, not necessity — closed by FBL-R1-02.
- **Q6 —** key the projection by exact Release/composition identity (digest-bearing), so distinct Releases can never share a runtime identity; no revision model is created because the key is *derived from* Release identity, not stored as a new sequence. Exact string format → 3L.
- **Q7 —** yes: Conversation is Conexus identity; each AgentRun pins its own Release and mechanically applies its own projection at dispatch (3H-01 precedent). Thread history read under a newer projection is cognition, not authority. The one guard: the projection application must be unconditional per run (3H-01's "unconditionally applied" law extends to PAR dispatch).
- **Q8 —** V9's latest-snapshot fallback is exactly such surviving state; with FBL-R1-02 (never resolve through stored/override/fallback paths) no persisted Mastra definition state can alter execution. Probe P2-strengthened proves it.

---

## 42. Block C — Conversation / memory (Q9–Q13)

- **Q9 —** threadless-by-default is correct. 3C-10's own product examples (Sales Agent daily report, Inventory Monitor) need no Conversation; delivery of output is an effect/artifact, not a thread. A consumer that wants "talk to the agent about its scheduled work" binds a Conversation explicitly via Decision Loop — the candidate already reserves this.
- **Q10 —** leak constructed and closed: FBL-R1-07.
- **Q11 —** explicit per-agent enablement is correct YAGNI and consistent with 3C-10's "ON quando consumidor justificar" — that phrase already means consumer-gated, not ambient default.
- **Q12 —** no cleansing engine. Old messages describing old tools/permissions are cognition; the mechanical guard is that the current tool surface/config is **applied** per run (mechanical application law), so a model believing an old tool exists simply fails to call it. Prompt-level confusion is a quality concern for eval, not an authority hole.
- **Q13 —** yes, sufficient: `mastra_par` sits in the stronger durability/backup class (§29, 3J-routed). A `hub_control` message mirror would duplicate storage and create the exact second-authority drift 3E rejected. Loss of `mastra_par` is a disaster-recovery event (3J/3M), not an architecture gap.

---

## 43. Block D — direct Agent vs Workflow/Durable Agent (Q14–Q18)

- **Q14 —** verified V1/V2: generic `suspend()` (not only native approval) persists suspended runs discoverable by `listSuspendedRuns` after process death, with `suspendPayload` and tool-call identity intact, given persistent storage. The dialogue's M1 claim holds at source level.
- **Q15 —** no such schedule found. Every 3G invariant I attacked (approval wait, non-effect resume outcomes, cancel-vs-claim races, pinning) is satisfiable with direct Agent + owner guards; the universal wrapper adds durable *step* semantics nobody consumes, plus V5's auto-restart exposure on every run — the wrapper makes the implicit-replay surface **larger**, not safer.
- **Q16 —** no. `createDurableAgent()` solves reconnectable stream ownership (M4/V5 recovery semantics); the F1 correctness need (durable domain run + durable wait + guard-gated resume) is covered by direct Agent + PAR facts. Defer stands, with ChatGPT's named reopen trigger.
- **Q17 —** yes — this was real, and it is exactly FBL-R1-01: with default local-server behavior, active workflow-backed runs are auto-restarted at boot; durable-agent 'auto' recovery re-issues LLM/tool calls. The law + qualified host configuration close it; the probe must crash-and-boot with the qualified config.
- **Q18 —** yes: V3 shows retry counts and persisted-status guards are process-local; therefore the explicit-workflow allowance (§17.2) must carry the guard that **any effectful step remains Gateway-governed with owner-minted identity** (FBL-R1-05), because workflow-level `retryConfig` can rerun a step more times than any in-process count suggests after crashes. §17.3 already states the law; V3 confirms it is load-bearing, not theoretical.

---

## 44. Block E — approval / suspension (Q19–Q26)

- **Q19 —** owner-first is globally superior. Inverse ordering (suspend first) can leave a durable suspended run whose wait has no ApprovalRequest — a wait nobody can ever satisfy, discoverable only by scanning substrate state: authority derived from substrate, the root-cause class of §4.
- **Q20 — worst window:** ApprovalRequest + currentPendingProposal committed; crash before the runtime suspension snapshot persists. Result: a claimable ApprovalRequest whose run cannot resume (no snapshot). If the human approves: ALLOW_ONCE is recorded, resume finds no suspended run, **no claim is consumed** (FIRST_CLAIM happens at Gateway admission on the resumed effect path, not at the human decision — 3G-01), no effect executes. The run follows the orphan path; the approval expires naturally; a successor run mints a new proposal + new ApprovalRequest (3G-05 §5.2: approvals are never renewed/transferred). Honest, bounded, no false state. This asymmetry — *wait authority without runtime wait* is recoverable; *runtime wait without wait authority* is not — is the proof owner-first is the right order.
- **Q21 —** yes: V1 shows `toolCallId`, `toolName`, `args` and `suspendPayload` persist in the snapshot and return through `listSuspendedRuns`; combined with FBL-R1-05 (owner-side identity), the same proposal is resumable after restart.
- **Q22 —** yes: generic suspension's `resumeSchema` is exactly typed resume data (V2); DENY/EXPIRED/STALE resume as typed non-effect data the tool returns to the agent without entering the effect path. This is why generic suspension is the faithful baseline: the resume payload is *data*, not an approve/decline verb.
- **Q23 —** native `approveToolCall/declineToolCall` is binary at the resume surface (V1). DENY could ride `declineToolCall`, but EXPIRED/STALE would have to masquerade as declines and ALLOW_ONCE's post-approval Gateway re-admission doesn't fit the native "approve = execute the tool now" shape without the wrapper intercepting anyway. The candidate's stance is right: native mechanics remain probe-eligible internals; generic suspension is the semantic baseline. Not unnecessary wrapper logic (Q63 same answer).
- **Q24 —** answered inside Q20: ALLOW_ONCE recorded + permanent resume failure ⇒ no claim consumed, no effect, orphan path + natural expiry; recovery owner 3M. Nothing new required.
- **Q25/Q26 —** the dangerous variant is the tool re-minting identity on re-execution — closed by FBL-R1-05. With owner-minted identity, repeated resume hits `idempotency_claim` dedupe (3G-06) and cannot double-execute.

---

## 45. Block F — AgentRun / process loss / cancellation (Q27–Q31)

- **Q27 —** consistent. 3C-10's "durable agent" explicitly means long-lived logical actor + durable suspension + repeated runs — "não significa LLM process 24/7" — not mid-turn crash transparency. No contradiction.
- **Q28 —** no current product requirement needs active-run crash recovery: scheduled monitors re-fire next occurrence; interactive chat users retry; report generation is re-runnable. Named absence, not oversight.
- **Q29 —** no: PAR terminal write-once + completion guard (§11.1) refuses late completion; same proven pattern as 3G-03/3G-05. The only requirement is that the completion path actually re-checks non-terminal state inside the owner guard — P27 covers.
- **Q30 —** for suspended runs, no interrupt is needed (nothing is executing; cancellation = guard refusal at any future resume). For active runs, the plain-Agent abort surface (abort signal / stream controller) must be verified by 3L; a missing physical abort is **not** a 3H blocker because authority-first cancel already voids late output — it is a cost/UX concern → 3L/3M. Candidate §27 stands.
- **Q31 —** no: resume paths re-enter PAR guards (invariant 6); a different process resuming a cancelled run's snapshot hits the same guard refusal. P10 proves firing.

---

## 46. Block G — schedule authority / ingress (Q32–Q38)

- **Q32 —** direct agent-target is confirmed structurally unsafe at source level: the worker calls `agent.generate()` immediately with the row's persisted prompt (V7) — there is no admission point, and the row itself carries semantic content (FBL-R1-04). Hooks receive `{kind, firedAt}` (V7); **if** a fire hook can fully gate/veto before any model execution, a hook-based ingress could be narrower than the workflow adapter — unverified depth, exactly what 3L should test. The candidate correctly freezes the property, not the mechanism.
- **Q33 —** it is the smallest *verified* transport today; the hook alternative is the only candidate for smaller, and it is probe-gated. Keep both named.
- **Q34 —** the ingress workflow is static host code registered at boot, not user/authored state; F3E02-R1 (`workflowDefinitions` never authoring authority) already covers the persisted-definition concern, and the workflow's only step is the PAR call — nothing semantic to bypass. One guard: its schedule row is workflow-target with correlation-only `inputData` (FBL-R1-04).
- **Q35 —** one row per AgentTrigger, carrying the current revision in correlation metadata. Per-revision rows would accumulate stale live rows — each a live fire source that must then be raced-and-rejected; one mutable row minimizes the stale-fire surface. Revision checks at admission (§21) remain the correctness backstop either way.
- **Q36 —** authority-commit first, projection reconcile after (candidate §20.1 confirmed): a missing row loses fires (availability, recoverable); a premature row gains fires (unauthorized execution attempts) — asymmetry decides. Enable follows the same order; update = commit new revision, then update row; stale-revision fires from the raced window are rejected (P20).
- **Q37 —** yes, sufficient: every fire re-enters PAR admission, so a permanently unpausable row costs wasted fire→reject cycles (telemetry + ops annoyance), never unauthorized runs. Fail-closed holds without cross-DB atomicity.
- **Q38 —** V6 supports caller-supplied stable schedule ids (`agent_<slug>`/`schedule_<slug>` normalization) — reconciliation must upsert by deterministic id derived from TriggerId, making restart reconciliation idempotent; probe should restart twice and count rows (extends P23).

---

## 47. Block H — occurrence identity / overlap (Q39–Q47)

- **Q39 —** verified: yes — `scheduledFireAt` is persisted per fire in trigger history, distinct from `actualFireAt` (V7); hooks additionally see `firedAt`. Source-level confirmation the dialogue asked for.
- **Q40 —** moot in the strong sense: no adapter needs to *create* an identity; the transport that carries the existing one into the PAR call is 3L's smallest-mechanism choice (workflow input, hook capture, or history read).
- **Q41 —** dedupe is genuinely required at the AgentRun boundary: verified at-least-once redelivery (V5 replay) + Gateway idempotency guards only governed effects — a duplicate run still spends model budget, creates run/telemetry records and may take non-Gateway-governed actions (report composition, memory writes). FBL-R1-03.
- **Q42 —** yes, at most one non-terminal trigger-origin run per SCHEDULE trigger is the correct F1 law: the substrate provides no overlap guard at all (V8), so *some* Conexus-side law is mandatory, and single-flight is the smallest deterministic one.
- **Q43 —** attempted construction: an every-5-min incremental sync where each occurrence carries unique semantic work. But under cursor-based automation state (3C-10 Automation State), a skipped occurrence's work is absorbed by the next run's cursor scan — correctness lives in the cursor, not the occurrence count. I could not construct a *current* F1 consumer where skip-on-overlap loses correctness rather than latency. The reopen trigger (catch-up consumer) is correctly named.
- **Q44 —** telemetry only (`agent_event` observation), plus the trigger cursor fact. A durable skipped-occurrence class would be a backlog in disguise — the exact thing §23 refuses. The product question "why didn't 08:00 run?" is answered by the OBS timeline (C-013), which is its job.
- **Q45 —** cursor suffices; see FBL-R1-03. Crash between cursor advance and run admission is impossible to split because both are the same owner-local admission commit — order them inside one PAR transaction (cursor + `agent_run` row are both `par.*`).
- **Q46 —** already-admitted no-op: cursor holds the occurrence; the crashed-before-dispatch run is a run-level orphan (dispatch recovery / 3M), never re-admitted as a second run.
- **Q47 —** same mechanism: admission committed ⇒ redelivery refused by cursor regardless of dispatch/response fate. P21/P24 prove both orders.

---

## 48. Block I — Release/runtime evolution (Q48–Q51)

- **Q48 —** yes: ArtifactRevision payloads are immutable in the Registry (C-005) and the pinned composition is recorded at admission (3G-05 §2) — the projection is rebuildable from durable Conexus facts alone, which is exactly why it can stay ephemeral.
- **Q49 —** the old runtime kind/version (pinned on the run) must remain deployed/supported until non-terminal runs drain; that is 3J's drain/cutover obligation (3C-10 replaceability), plus storage-schema compatibility for old snapshots.
- **Q50 —** no stricter seam needed in 3H-02: the law (old run → old runtime; new run → new runtime; no snapshot migration promise) is already frozen (3G-05 §7, 3C-10); 3H-02 adds only the projection-rebuild realization. Confirmed 3J.
- **Q51 —** real risk, correctly out of 3H-02: Mastra storage migrations across versions are substrate-qualification facts — 3L must qualify upgrade paths for `mastra_par` (including suspended-run snapshot readability) before any version bump; name it as a `CX-AGENT-MASTRA-01`/3L upgrade-check item rather than new architecture.

---

## 49. Block J — Signals / EVENT (Q52–Q54)

- **Q52 —** yes, correctly excluded. With threadless workflow-target schedules, no signal path is exercised in F1 (V7: signals ride only *threaded* schedule fires).
- **Q53 —** no: `signalType`/`ifActive`/`ifIdle` belong to threaded schedules, which F1 does not use. If the 3L ingress realization internally uses a signal-like wake, it remains internal substrate mechanics with no external source authority — acceptable under 3C-R1 as long as no external ingress feeds it.
- **Q54 —** a signal can steer only what can receive it; F1's runs are threadless and PAR-admitted, and no Conexus surface emits signals into PAR threads. The guard worth stating in consolidation: *no Conexus code path sends Mastra signals to Production Agent threads in F1* — one sentence, closes the class.

---

## 50. Block K — observability / storage (Q55–Q58)

- **Q55 —** persist on `par.agent_run`: opaque runtime run ref, runtime kind/version, thread ref when a Conversation exists, occurrence ref for trigger-origin runs. On `par.agent_trigger`: schedule projection ref + occurrence cursor. On `par.conversation`: thread ref. Everything else (turn ids, toolCall ids, spans, provider request ids) is OBS telemetry.
- **Q56 —** closed by FBL-R1-06 (3H-01 §8.1 expectation law extended to `par.*`).
- **Q57 —** isolation holds: `mastra_builder` and `mastra_par` remain separate substrate stores (3E-R1) and both are behind their runtime boundaries; nothing in 3H-02 requires cross-substrate reads. The one temptation — reading `mastra_par` schedule/trigger-history rows from PAR domain code — is already banned by §19.1/§29; the trigger-history read, if chosen as the occurrence transport, must go through the runtime boundary, not SQL. Worth one sentence in consolidation.
- **Q58 —** no new durable handoff record: runtime completion/suspension/fire events are F5 proposals into owner-specific paths (§31), each judged against owner facts; the durable trace is `agent_event` + owner records, which is the C-013 pattern.

---

## 51. Block L — YAGNI / Global Maximum (Q59–Q67)

- **Q59 —** most deletable: §24 (manual invocation vs `.run()`) is operational guidance, not architecture — demote to a probe note. §20.3's reconciliation paragraph can compress to "idempotent upsert by deterministic id" (Q38).
- **Q60 —** none found disguised as authority enforcement. Closest candidate is the occurrence cursor — but V5/V8 give it a verified current failure class (redelivery + no substrate overlap guard), so it is a seam, not ceremony (Q62 answered: necessary).
- **Q61 —** pulled in by this round: the boot-recovery law (FBL-R1-01) — previously implicit in "3M recovery" but load-bearing for a realizable F1 because the substrate default violates it; and the resolution law (FBL-R1-02) — previously prose. Both are laws on existing acts, zero new machinery.
- **Q63 —** justified adaptation (see Q23): the four-outcome resume semantics do not fit a binary approve/decline surface without the wrapper existing anyway.
- **Q64 —** yes, still the Global Maximum. The workflow-universal baseline adds durable step semantics + larger auto-restart surface (V5) for no consumed benefit; the durable-agent baseline adds cache/pubsub/stream machinery for a UX property nobody named. Direct Agent + selective suspension + guarded ingress is the smallest structure that satisfies every frozen invariant with verified current APIs (V1/V2/V6/V7).
- **Q65 — strongest argument against Alternative A, stated and refuted:** "A future EVENT consumer will force workflows/signals anyway; adopting the workflow baseline now avoids a second migration." Refuted: EVENT's shape (C-007 trust, ingress normalization, dedupe) is *not* the workflow-wrapper shape — adopting Alternative B today would not pre-build EVENT's actual needs, and 3G-05/3C-10 already isolate the pieces EVENT will reuse (trigger authority, admission guards, occurrence discipline). Speculative convergence is exactly what YAGNI §10 bans.
- **Q66 —** **`CURRENT STRUCTURE CONFIRMED`** — with corrections FBL-R1-01..07 applied to the candidate text.
- **Q67 —** requires one ChatGPT consolidation round folding FBL-R1-01..07 and the probe additions below; after that, ready for operator decision. If ChatGPT contests a finding, that point takes one more adversarial pass.

---

## 52. Proof-strategy additions

Add to §32 (controls shown firing):

```text
P31 qualified host boot after mid-tool crash of an active PAR run → no substrate re-drive without PAR admission
P32 ingress-workflow step replay after crash (verified at-least-once) → PAR admission is idempotent; no second AgentRun
P33 published Stored-Agent override active for the same agent id → Production Agent execution unchanged (strengthens P2)
P34 schedule projection row carries no semantic content; fire admission resolves prompt/input from AgentTrigger + pinned Release
P35 tool re-minting an effect identity on resume → Gateway refuses/dedupes; owner-minted identity is the only admissible path
P36 shared agent artifact across two Projects → no Working/Agent Memory leakage (strengthens P4)
P37 double runtime-startup reconciliation → exactly one schedule row per enabled trigger (idempotent upsert)
```

---

## 53. Final disposition

```text
Material Finding against approved authority                 = NONE
reopen required                                             = NONE
Alternative A (direct Agent + selective suspension
  + guarded PAR schedule ingress)                           = CONFIRMED Global Maximum
Alternative D (schedule→agent direct)                       = REJECTED with source evidence (V7)
Alternative E (Stored Agents/Editor)                        = REJECTED; prohibition made mechanical (V9)
material corrections to candidate                           = FBL-R1-01..07
proof additions                                             = P31..P37
recommendation                                              = CURRENT STRUCTURE CONFIRMED
readiness                                                   = ChatGPT consolidation round required;
                                                              not yet operator-ready
```

This round approves nothing. Operator ratification remains the only path to authority.

— Fable, Round 1
