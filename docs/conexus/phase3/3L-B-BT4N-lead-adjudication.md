# 3L-B — BT-4N Architecture-Lead Adjudication

**Status:** `PASS / LEAD-ADJUDICATED / BT-5N AUTHORIZED`  
**Phase:** 3L — Technology Qualification  
**Scope:** Package B — native Mastra Scheduler → deterministic PAR-ingress seam  
**Execution authority:** [3L-R1 — Framework-Native Proportional Qualification Rebaseline](3L-R1-framework-native-proportional-qualification-rebaseline.md)  
**Executor Evidence:**
- `spikes/conexus-3l-b/evidence/bt4n-source.json`
- `spikes/conexus-3l-b/evidence/bt4n.json`
- `spikes/conexus-3l-b/tests/bt4n-native-scheduler-ingress.test.mjs`

**Exact executor HEAD:** `de4baf466f57222c3e560f0711537ea4290633a2`  
**Package-B lock SHA-256:** `5e8b2b4ea2ef5ae5676652cdbafd8c7c284be68cfc445de92950b2decdc8a4f0`  
**Pinned stack:** `@mastra/core 1.56.0`, `@mastra/memory 1.25.0`, `@mastra/pg 1.19.0`, PostgreSQL `17.10`, Node `24.18.0`  
**Product implementation:** `BLOCKED`  
**C-018:** `NOT RATIFIED`  
**PR #40 merge:** `NOT AUTHORIZED`

## 1. Verdict

```text
BT-4N
= PASS / LEAD-ADJUDICATED
= PASS_NATIVE_SCHEDULE_INGRESS

native Mastra scheduler substrate
= QUALIFIED for the exact tested schedule-claim / workflow-ingress properties

custom Conexus scheduler
= NOT REQUIRED

new ScheduleOccurrence durable class
= NOT REQUIRED

Package B
= IN PROGRESS / NOT CLOSED

BT-5N
= NEXT / EXECUTION AUTHORIZED
```

No Product, domain-owner, data-inventory or topology decision is reopened.

## 2. What was actually proved

The exact pinned Mastra family supports a workflow-target schedule path that remains mechanically separate from direct Product-Agent execution:

```text
native Mastra schedule row
→ due-slot read
→ deterministic run identity
→ PostgreSQL compare-and-swap claim
→ workflow.start publication
→ deterministic one-step workflow ingress
→ synthetic PAR-ingress observation
```

The deciding runtime result established:

```text
scheduleId       = schedule_bt4n-native-slot
scheduledFireAt  = 1767225600000
runId            = sched_schedule_bt4n-native-slot_1767225600000
logical occurrence
                 = schedule_bt4n-native-slot:1767225600000
```

Two scheduler contenders were deliberately forced to read the same due row before either compare-and-swap. The actual PostgreSQL schedule store admitted:

```text
native trigger rows       = 1
synthetic ingress count   = 1
claimed logical run       = 1
```

The PubSub redelivery control presented the same native event twice with:

```text
deliveryAttempt = 1 → 2
same runId       = YES
same logical slot= YES
```

The selected path executed:

```text
Product Agent executions = 0
model calls               = 0
business tool calls       = 0
provider calls            = 0
E2B calls                 = 0
real external effects     = 0
```

## 3. Why this is sufficient before C-018

BT-4N was not required to implement or prove the future PAR owner transaction. It needed to answer the load-bearing external question:

> Can the selected Mastra substrate expose one stable scheduled occurrence through a deterministic non-Agent seam before Product execution, so PAR can remain the sole AgentRun admission authority?

The answer is `YES` for the exact pinned family.

The substrate supplies enough stable material for the existing architecture seam:

```text
Mastra scheduleId
+
intended scheduledFireAt
→ stable occurrence material
→ future guarded PAR ingress
```

Therefore a coding actor will not need to choose between:

```text
custom scheduler
new occurrence domain
Product Agent direct schedule execution
```

That material realization decision is closed.

## 4. Important limitation — exact-version adapter contract

The deterministic ingress derives the intended slot from the exact pinned run-id format:

```text
sched_<scheduleId>_<scheduledFireAt>
```

This is valid deciding Evidence for `@mastra/core 1.56.0`, because the run-id construction was source-bound and runtime-proven. It is not promoted into an eternal Product contract.

The future realization must therefore treat the parser/normalizer as one narrow version-bound adapter with these properties:

```text
exact pinned/runtime-supported format only
fail closed on malformed or ambiguous material
never fall back to delivery time, PID, UUID or process-local identity
never become AgentTrigger or occurrence authority
requalify on any scheduler/run-id/trigger-payload behavior change
```

A future supported Mastra field that exposes `scheduleId` and `scheduledFireAt` directly may replace this adapter without changing domain architecture.

## 5. What BT-4N does not prove

The following remain Product/first-build or later-stage obligations:

```text
AgentTrigger owns enabled/revision/cron/timezone semantics
schedule projection reconciliation follows owner truth
current TriggerRevision is revalidated at PAR ingress
owner occurrence cursor consumption is atomic with AgentRun admission
single-flight and SKIPPED/no-backlog semantics
trigger update/disable × fire races
Release selection/pinning after owner admission
Gateway/effect behavior
publish-after-CAS recovery and reconciliation policy
```

PubSub redelivery stability proves transport material only. It does not replace owner idempotency or prove end-to-end Product occurrence consumption.

The executor used same-process contenders over the real PostgreSQL CAS. This proves the selected storage claim property, not future distributed deployment topology.

## 6. Global-Maximum adjudication

Credible alternatives:

### A — native Scheduler + deterministic workflow ingress + PAR boundary

```text
verdict = ADOPT / GLOBAL MAXIMUM
```

Uses the framework according to its native model and preserves Conexus authority with one narrow seam.

### B — direct agent-target schedule

```text
verdict = REJECT F1
```

Would let scheduler mechanics reach Product execution before guarded PAR AgentRun admission.

### C — custom scheduler / queue / outbox / ScheduleOccurrence owner

```text
verdict = REJECT / YAGNI
```

No current failure class requires that machinery.

### D — no schedule support in F1

```text
verdict = REJECT
```

`SCHEDULE` is an accepted F1 Product-Agent trigger capability.

## 7. Qualification status after adjudication

```text
BT-1  = PASS
BT-2  = PASS
BT-3  = FRAMEWORK BEHAVIOR CHARACTERIZED
BT-3A = NATIVE SCHEMA/CLOSED-VIEW HYPOTHESIS REJECTED
BT-3N = PASS / LEAD-ADJUDICATED / PASS_NATIVE_HITL_OWNER_BOUNDARY
BT-4N = PASS / LEAD-ADJUDICATED / PASS_NATIVE_SCHEDULE_INGRESS
BT-5N = NEXT / EXECUTION AUTHORIZED

CX-AGENT-MASTRA-01
= PARTIALLY QUALIFIED / schedule-substrate slice accepted

CX-RUNTIME-ISOLATION-01
= NOT YET PROVEN / BT-5N REQUIRED

Package B
= IN PROGRESS / NOT CLOSED
```

## 8. Projection defect discovered during review

At executor HEAD, `current/README.md` and `LEDGER.md` correctly report BT-4N executor completion, but `current/ARCHITECTURE-BASELINE.md` and `current/DECISION-RECONCILIATION.md` still contain `BT-4N NEXT / EXECUTION AUTHORIZED` projections.

This is a bounded router/projection defect, not an architecture Finding.

Before BT-5N runtime execution, the executor must:

```text
extend the 3L-R1 routing fitness test to cover all current-tree projections
→ prove RED against the stale Architecture Baseline / Decision Reconciliation
→ project this lead adjudication everywhere
→ prove GREEN
```

## 9. Exact next action

> Execute only `BT-5N — Role-instance isolation + enabled-global canary` under a new accepted execution plan. Prove whether BuilderMastra and ParMastra can coexist in one Node process with distinct stores, PubSubs and registries while no enabled F1 process-global facility can influence the opposite role.

Do not execute Package C, D or E by inheritance. Do not close Package B, ratify C-018, implement Product code, mark PR #40 ready or merge.