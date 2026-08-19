# 3L Package B — BT-3N Architecture-Lead Adjudication

**Status:** `PASS / LEAD-ADJUDICATED / BT-4N AUTHORIZED NEXT`  
**Phase:** 3L — Technology Qualification  
**Package:** B — Product Agent + Cross-Runtime  
**Authority:** [3L-R1 — Framework-Native Proportional Qualification Rebaseline](3L-R1-framework-native-proportional-qualification-rebaseline.md)  
**Evidence:** [3L-B technology qualification record](3L-B-technology-qualification.md), `spikes/conexus-3l-b/evidence/bt3n.json`, `spikes/conexus-3l-b/evidence/bt3n-source.json`  
**Method:** DevelopmentConexus Engineering Method v1.0.0  
**Operator-ratified route:** 3L-R1 / 2026-08-19  
**Product implementation:** `BLOCKED`  
**C-018:** `NOT RATIFIED`  
**PR #40 merge:** `NOT AUTHORIZED`

## Decision in one sentence

BT-3N is accepted as deciding evidence that the pinned direct-Mastra-Agent F1 realization can use native tool approval plus PostgreSQL-backed suspended-run rediscovery across real process loss while preserving Conexus current-owner sovereignty at the governed tool/effect boundary; stale raw `RequestContext` remains physically observable but is semantically inert, so the earlier BT-3/BT-3A mechanism finding is resolved by the operator-ratified 3L-R1 realization correction rather than by Product-architecture reopen.

---

## 1. Evidence independently revalidated by Architecture Lead

Fresh PR revalidation:

```text
PR #40 = OPEN / DRAFT / NOT MERGED
HEAD   = 8dd6dcc0156ccf38470c43995c26a92c3e6fc0c3
```

Fresh GitHub Actions on that HEAD:

```text
Conexus 3L Package B               = SUCCESS
Documentation                      = SUCCESS
Conexus 3L Package A               = SUCCESS
Conexus 3L Package A Lock Bootstrap= SUCCESS
```

Package-B CI executed:

```text
PostgreSQL 17.10
Node 24.18.0
Package-B exact lock verification
Package-B admission verification
node --test --test-concurrency=1 tests/*.test.mjs

23 tests
23 pass
0 fail
```

The BT-3N suite itself demonstrated all three required paths:

```text
1. current owner revoked after suspend
   → native Mastra mechanical approval occurs
   → tool boundary executes current-owner recheck
   → stale raw RequestContext still carries ALLOW-shaped residue
   → current owner = DENY
   → synthetic effect count = 0

2. current owner remains ALLOW
   → native approval
   → tool boundary recheck = ALLOW
   → synthetic effect count = exactly 1

3. native decline
   → tool boundary execution count = 0
   → synthetic effect count = 0
```

Real provider/model calls, E2B calls and real external effects were all zero.

---

## 2. Exact protected property adjudicated

BT-3N proves the external/framework feasibility slice required by 3L-R1:

```text
static requireApproval
→ suspension before tool execute
→ persisted suspended run in PostgreSQL
→ process A exits
→ process B reconstructs direct Agent + store
→ listSuspendedRuns rediscovers exact run/tool call
→ public approveToolCallGenerate / declineToolCallGenerate path
→ exact original tool args survive mechanically
→ governed boundary rechecks current external owner truth
```

The decisive negative property fired:

```text
stale raw Mastra RequestContext value
-X-> current Conexus authority
-X-> permission
-X-> approval authority
-X-> effect admission
```

The positive path also fired exactly once, so the denial result is not explained by a dead/nonfunctional tool path.

---

## 3. What this PASS does and does not mean

Accepted:

```text
native Mastra HITL pause/resume mechanics are viable for the F1 selected path
persistent suspended-run rediscovery survives real process loss
current Conexus owner truth can remain sovereign after resume
stale RequestContext physical residue is not itself an architecture contradiction
3L-R1 RequestContext realization correction is supported by runtime Evidence
BT-3/BT-3A mechanism finding is resolved for this qualification slice
```

Not proven here:

```text
real Product PAR implementation conformance
real ApprovalRequest transaction ordering
real sealed-proposal implementation
real Gateway effect/idempotency implementation
real current authorization implementation
full CX-AGENT-MASTRA-01 closure
same-process Builder/PAR isolation
scheduler occurrence substrate
Product implementation correctness
```

Those preserved obligations remain at their already-routed proof stages.

---

## 4. Materiality / Global Maximum adjudication

```text
Product architecture contradiction          = NO
new owner / module / durable record / DB    = NO
framework fork / monkey patch               = NO
RuntimeContextService / ContextBus           = NO
mini PAR / mini Gateway in spike             = NO
provider/model live qualification required   = NO
```

The Global Maximum remains the 3L-R1 structure:

```text
Conexus owner truth
> native framework runtime state
```

rather than attempting to force the framework's continuation context object itself to become current business authority.

---

## 5. Verdict

```text
BT-3N = PASS / LEAD-ADJUDICATED

verdict = PASS_NATIVE_HITL_OWNER_BOUNDARY

CX-AGENT-MASTRA-01
= PARTIALLY QUALIFIED FOR:
  direct Agent authority closure
  conversation/memory substrate
  native suspended approval + process-loss rediscovery
  current-owner boundary feasibility

CX-AGENT-MASTRA-01
!= FULLY QUALIFIED YET
```

Package B remains open because BT-4N and BT-5N remain outstanding.

---

## 6. Exact next action

> **BT-4N — Native Scheduler → PAR narrow dispatch seam is now the only authorized Package-B execution.**

BT-5N remains blocked behind BT-4N adjudication.

BT-4N must prove only the framework/substrate question frozen in 3L-R1:

```text
native schedule storage/CAS claims one due slot across concurrent ticks
stable schedule/slot material exists before Product execution
stock direct Product Agent execution is not required
one-step deterministic ingress can receive sufficient occurrence identity through public/stable surfaces
redelivery/duplicate presentation remains deduplicable by stable logical material
no Conexus scheduler/domain/ScheduleOccurrence record is added
```

Allowed outcomes:

```text
PASS_NATIVE_SCHEDULE_INGRESS
NARROW_ADAPTER_REQUIRED
FAIL_SCHEDULER_SUBSTRATE
```

No Product Agent/model/business tool/Gateway effect may execute in BT-4N.

---

## 7. Still forbidden

```text
BT-5N execution
Package C execution
Package D/E automatic activation
Product implementation
C-018 ratification
PR ready-for-review transition
merge
```

A BT-4N failure may fire only the existing narrow-adapter seam or return a material substrate Finding. It may not create a generic scheduler/automation/workflow Product domain by convenience.
