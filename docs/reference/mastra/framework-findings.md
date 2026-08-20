# 3L-R1 — Framework-Native Proportional Qualification Rebaseline

> Frozen accepted-decision snapshot. [../../ROADMAP.md](../../roadmap.md) alone owns current phase and implementation status.

**Status:** `APPROVED / OPERATOR RATIFIED 2026-08-19`  
**Phase:** 3L — Technology Qualification  
**Scope:** Product-Agent Mastra realization, Package-B proof route, Package-C F1 critical-path disposition, and downstream 3L routing  
**Method:** DevelopmentConexus Engineering Method v1.0.0  
**Product implementation:** `BLOCKED`  
**C-018:** `NOT RATIFIED`  
**PR #40 merge:** `NOT AUTHORIZED`

## 1. Decision in one sentence

Conexus Product/authority invariants remain current, but the Product-Agent realization and its proof route are rederived **framework-first** against the official Mastra skill, current Mastra documentation/Context7 and the exact pinned `@mastra/core 1.56.0` source: F1 uses a direct code-defined Mastra `Agent`, native tool approval as pause/resume mechanics, persistent storage-backed suspended-run discovery, native scheduler mechanics behind a narrow PAR ingress, and separate role-specific Mastra instances; raw Mastra `RequestContext` is runtime/configuration substrate and never business authority; active-run `DurableAgent` recovery and universal Workflow wrapping remain deferred/rejected; Package B continues through three minimal native probes, while Package C's hard monetary reservation/cost-envelope qualification is removed from the F1 critical path under a bounded finite-execution safety baseline.

This is a material but bounded realization/critical-path amendment. It does not change what Conexus is, create a new Product requirement, module, durable record, database, generic runtime service or framework.

---

## 2. Why this rebaseline is required

Package B exposed a methodology risk:

```text
Conexus mechanism imagined first
→ framework forced to imitate that mechanism
→ adapter/guard/probe created around the imagined shape
```

BT-3 and BT-3A demonstrated the concrete consequence. The accepted invariant was valid — stale runtime state must never regain current authority — but the selected mechanism expected the Mastra `RequestContext` object itself to behave as whole-replacement authority state. Exact runtime/source Evidence showed that Mastra intentionally preserves continuation context and backfills snapshot keys absent from a fresh resume context.

The root cause is not that Mastra is incompatible. The root cause is that earlier realization wording collapsed:

```text
A. Conexus business/current authority
B. Mastra request/continuation/runtime context
```

The Global Maximum is to keep A sovereign, use B according to its native lifecycle, and add only the narrow Conexus boundary that a real invariant requires.

Method outcome:

```text
CURRENT PRODUCT / AUTHORITY              = CONFIRMED
CURRENT MASTRA SELECTION                 = STRENGTHENED
REALIZATION WORDING                      = BOUNDED CORRECTION
PRE-C-018 PROOF ROUTING                  = BOUNDED CORRECTION
PRODUCT REOPEN                           = NO
NEW MODULE / RECORD / DB / SERVICE       = 0
```

---

## 3. Evidence basis

This decision reconciles:

```text
current/ Product Contract + Architecture Baseline + Decision Reconciliation
3A-R6 critical-path/proportionality law
3A-R10 current-realization compilation law
3H-02 Product Agent runtime realization
3H-03 runtime isolation/correlation/handoff
3I-03 model-spend architecture
3L-Q0 qualification manifest
3L-B proof-routing amendment
BT-1 / BT-2 / BT-3 / BT-3A Evidence
```

Framework Evidence used:

```text
project-installed official Mastra skill
→ .agents/skills/mastra/SKILL.md
→ upstream mastra-ai/skills, skill v2.1.0

Context7 current documentation
→ /mastra-ai/mastra

exact Package-B lock
→ @mastra/core   1.56.0
→ @mastra/memory 1.25.0
→ @mastra/pg     1.19.0
→ PostgreSQL     17.10

exact evidence
→ qualification/3l/mastra-runtime/evidence/bt1.json
→ qualification/3l/mastra-runtime/evidence/bt2.json
→ qualification/3l/mastra-runtime/evidence/bt3.json
→ qualification/3l/mastra-runtime/evidence/bt3a-source.json
```

Known results:

```text
BT-1 direct code-defined Agent / Editor closure         = PASS
BT-2 thread/resource memory substrate isolation         = PASS
BT-3 suspend + PG persistence + fresh-process discovery = PASS
BT-3 fresh same-key caller value wins                    = PASS
BT-3 unknown stale RequestContext key survives           = CONFIRMED
BT-3A post-merge requestContextSchema closed view        = NOT SUPPORTED
Mastra incompatibility                                  = NOT ESTABLISHED
```

BT-3A also established that the direct-Agent path resolves fresh caller defaults/model/instructions/tool shaping before workflow resume backfills absent snapshot keys. The stale-key risk is therefore localized to resumed/later runtime consumers, not proof that every early Agent decision is already contaminated.

---

## 4. Protected invariants — unchanged

The following remain non-negotiable:

```text
exact Release / exact RuntimeAgentProjection
no Stored Agent / Editor / latest execution authority
Conversation identity and memory scopes do not alias
current authorization/revocation is owner-derived and rechecked
ApprovalRequest binds one exact sealed subject
Mastra approval/suspend state is not Product approval authority
runtime/provider identity is not a Conexus principal
raw runtime/snapshot context is never business authority
Gateway remains effect admission/replay/idempotency authority
runtime completion/telemetry cannot self-terminalize AgentRun
schedule mechanics cannot bypass PAR admission
Builder and PAR mutable runtime surfaces remain isolated
```

The corrected stale-authority invariant is:

> **Mastra may preserve runtime/continuation context, but no preserved value may become current Conexus permission, role, binding, approval, trigger, tool, model or effect authority. Every governed decision consumes current/pinned Conexus owner facts at the boundary that owns that decision.**

This is stronger and more framework-neutral than requiring physical deletion of every stale runtime key.

---

## 5. Mastra-native realization map

| Conexus need | Mastra-native primitive | Current realization | Disposition |
|---|---|---|---|
| open-ended Product Agent reasoning | direct `Agent` | exact code-defined Agent from exact RuntimeAgentProjection | `USE_NATIVE` |
| dynamic request-local configuration | `RequestContext` | correlation/configuration/current request inputs; never business authority | `USE_NATIVE / NON-AUTHORITATIVE` |
| Conversation substrate | Memory thread/resource | explicit Conexus-derived thread/resource scopes | `USE_NATIVE` |
| bounded capability/tool | `createTool` / dynamic tools | facade over exact Release-derived Conexus capability | `USE_NATIVE + OWNER BOUNDARY` |
| pre-execution human approval | `requireApproval` + approve/decline APIs | pause/resume mechanics only | `USE_NATIVE` |
| approval meaning/eligibility/sealed subject | none — outside framework responsibility | PAR `ApprovalRequest` + current owner checks | `CONEXUS_OWNER_ONLY` |
| in-tool request for additional data | tool `suspend()` / `resumeData` | use when the tool genuinely needs continuation input | `USE_NATIVE SELECTIVELY` |
| suspended approval after restart | persistent store + suspended-run discovery + approve/decline | direct Agent path | `USE_NATIVE` |
| active in-flight run recovery/reconnect | `DurableAgent` | no current F1 consumer | `DEFER SAFELY` |
| deterministic multi-step process | Workflow | use only for a named predefined flow; never wrap every Product Agent | `USE SELECTIVELY` |
| cron/timer mechanics | native schedules/scheduler | derived schedule projection + narrow PAR fire ingress | `USE_NATIVE + BOUNDARY` |
| same-process Builder/PAR | separate `Mastra` instances/stores/PubSubs | allow if enabled F1 surfaces remain partitioned | `QUALIFICATION-PENDING` |

---

## 6. Bounded amendments to 3H-02 / 3H-03

### 6.1 Direct Agent remains the F1 baseline

The 3H-02 direct-Agent choice is confirmed.

```text
exact Release
→ RuntimeAgentProjection
→ direct code-defined Mastra Agent
```

Universal Workflow wrapping remains rejected. `DurableAgent` remains deferred until a named requirement needs active-run recovery or reconnect to the same in-flight stream.

### 6.2 Native tool approval becomes the preferred pause mechanism

The 3H-02 sentence that treated native Mastra approve/decline as merely an optional adapter candidate is refined.

For pre-tool approval:

```text
Mastra requireApproval
→ mechanical suspension
→ PAR owns exact ApprovalRequest
→ current human decision/eligibility
→ Conexus revalidates exact subject/current authority
→ approveToolCall / declineToolCall
→ tool boundary revalidates before any effect
```

Mastra approval state never replaces `ApprovalRequest`, `ALLOW_ONCE`, exact proposal identity or Gateway effect admission.

Generic tool `suspend()` remains available for a genuine in-execution wait/clarification. It is not the default approval primitive.

### 6.3 `RequestContext = REPLACE WHOLE` is superseded as a framework-object requirement

The following literal mechanism wording in 3H-03 and current projections is superseded:

```text
Mastra effective RequestContext must be physically replaced whole
and all unknown snapshot keys must disappear.
```

Current realization law:

```text
fresh caller RequestContext
→ complete current request/runtime configuration needed by early Agent shaping

raw Mastra RequestContext / restored snapshot
→ runtime substrate only
→ never permission/role/binding/approval/effect authority

governed tool/effect/owner transition
→ current Conexus owner recheck
→ fail closed on stale/revoked/mismatched authority
```

A small implementation function/value object may later project current owner facts into runtime configuration. This decision does not create a `RuntimeContextService`, context database, context bus or new owner.

### 6.4 Active ordinary Agent crash recovery is not a Package-B prerequisite

The old Package-B requirement to characterize/recover an ordinary actively executing Agent after process death is reclassified:

```text
suspended approval/wait durability required by F1  = MUST QUALIFY
active in-flight run recovery / re-drive            = DEFER SAFELY
```

Reopen when a real Product requirement demands active-run recovery/reconnect rather than honest interruption/retry through owner admission.

3M still evaluates whether existing durable owner facts produce honest failure/recovery semantics for an interrupted active AgentRun; it does not require `DurableAgent` by inheritance.

### 6.5 Scheduler mechanics are adopted, Product execution remains PAR-guarded

Native schedule storage/CAS/timer mechanics are preferred. The stock agent-target worker may not become Product execution authority.

Preferred realization to qualify:

```text
native schedule occurrence
→ narrow deterministic adapter/one-step Workflow where supported
→ guarded PAR schedule-fire ingress
→ current TriggerRevision/schedule/single-flight/Release admission
→ AgentRun
→ direct Agent
```

The adapter owns no business meaning and contains no LLM, Product Agent invocation or Gateway effect.

### 6.6 Same-process isolation is narrowed to enabled F1 facilities

Two role-specific Mastra instances remain current. Package B does not need to prove every optional Mastra feature globally safe.

It must prove current enabled F1 surfaces are partitioned. A process-global optional facility such as scorer/eval hooks does not force process split when it is not admitted into the baseline and cannot influence governed execution.

---

## 7. Package B — rederived current proof route

Previous BT-1/BT-2/BT-3/BT-3A Evidence is preserved. Do not rerun it merely to rename the route.

```text
BT-1 = PASS
BT-2 = PASS
BT-3 = FRAMEWORK BEHAVIOR CHARACTERIZED
BT-3A = NATIVE SCHEMA/CLOSED-VIEW HYPOTHESIS REJECTED
```

Package B now has exactly three remaining probes.

### BT-3N — Native HITL + current-owner authority

Question:

> Can a direct Mastra Agent use native tool approval, survive process loss through persistent suspended-run discovery, and resume without allowing raw/stale RequestContext data or Mastra approval state to authorize a governed effect contrary to current Conexus owner truth?

Must prove/falsify:

```text
static/native requireApproval pauses before tool execution
suspended run persists in PostgreSQL
fresh process discovers exact suspended run/tool call
native approve/decline API resumes through supported public surface
same exact tool args/proposal correlation survives mechanically
current owner decision is checked after suspension and before effect boundary
revocation/denial after suspend blocks effect even if Mastra is mechanically approved
raw stale RequestContext may remain observable but is semantically inert
no provider/model/E2B/real external effect is required
```

Allowed verdicts:

```text
PASS_NATIVE_HITL_OWNER_BOUNDARY
FAIL_NATIVE_HITL_RECOVERY
FAIL_OWNER_RECHECK_BOUNDARY
MATERIAL_REALIZATION_FAILURE
```

A deterministic test authority fixture may model current owner truth, but it must not claim Product owner implementation is proven.

### BT-4N — Native Scheduler → PAR narrow dispatch seam

Question:

> Can native Mastra scheduling expose one stable logical occurrence through a supported deterministic seam before any Product Agent executes, so PAR can remain the only AgentRun admission authority?

Preferred candidate:

```text
native workflow-target schedule
→ deterministic one-step ingress Workflow
→ occurrence identity/correlation
→ PAR ingress fixture
→ no Product Agent/model/tool effect
```

Must prove/falsify:

```text
native schedule storage/CAS claims one due slot across concurrent ticks
stable schedule/slot material exists before Product execution
stock direct Product Agent execution is not required
one-step ingress can receive sufficient occurrence identity through public/stable surfaces
redelivery/duplicate presentation remains deduplicable by stable logical material
no Conexus scheduler/domain/occurrence record is added
```

Allowed verdicts:

```text
PASS_NATIVE_SCHEDULE_INGRESS
NARROW_ADAPTER_REQUIRED
FAIL_SCHEDULER_SUBSTRATE
```

### BT-5N — Role-instance isolation + enabled-global canary

Question:

> Can BuilderMastra and ParMastra coexist in one Node process with separate stores, PubSubs and registered surfaces, while every process-global facility actually enabled by the F1 baseline remains unable to influence the opposite role's governed execution?

Must prove/falsify:

```text
BuilderMastra != ParMastra object graph
mastra_builder != mastra_par persistent state
explicit role PubSub instances remain disjoint
opposite-role Agent/tool/memory/schedule resolution fails
standalone/ephemeral fallback is not required
module-default PubSub receives zero governed role traffic
one negative shared-PubSub fixture demonstrates why the wiring guard matters
currently disabled scorer/eval/DurableAgent/OM globals are recorded as not admitted, not falsely qualified
```

Allowed verdicts:

```text
QUALIFIED_SAME_PROCESS
PROCESS_SPLIT_REQUIRED
NOT_PROVEN
```

Process split fires only on reachable load-bearing bleed in an enabled F1 capability with no smaller reliable fence.

### 7.1 Package-B closure

Package B may close after Architecture-Lead adjudication when:

```text
BT-1 = PASS
BT-2 = PASS
BT-3N = PASS or bounded failure adjudicated
BT-4N = PASS or existing narrow-adapter seam fired
BT-5N = QUALIFIED_SAME_PROCESS | PROCESS_SPLIT_REQUIRED
```

The downstream 52 proof obligations remain preserved for first-build conformance, 3M, Package E and 3N as already routed. Package-B closure does not claim Product implementation correctness.

---

## 8. Package C — DEFER SAFELY from the F1 critical path

### 8.1 What is explicitly not required now

F1 does not need:

```text
model benchmarking to choose the cheapest model
model calibration/automatic model optimizer
multi-provider routing/fallback optimizer
commercial quota/billing engine
hard per-run USD invoice guarantee
qualified pricing table for every provider/model/request class
pre-provider monetary reservation/outstanding-liability settlement machinery
```

Mastra/provider binding remains replaceable through exact Release/configuration seams. Newer/better/cheaper model selection remains a later evaluation/policy concern.

### 8.2 Finite F1 execution safety remains mandatory

Deferring hard monetary enforcement does **not** permit unbounded agents.

F1 must preserve:

```text
small server-allowlisted provider/model set
exact Release-pinned model identity
finite server-derived maxModelCalls / maxSteps
explicit bounded framework/provider retries
no automatic fallback cascade unless separately admitted
optional billable model features disabled unless named and bounded
provider/account/project spend limits as defense in depth
truthful usage/cost observation with MISSING != ZERO
no claim of hard per-run USD/invoice protection
```

These are implementation/first-build conformance obligations unless a remaining external technology uncertainty is shown to be load-bearing.

### 8.3 3I-03 disposition

3I-03 is `PARTIALLY SUPERSEDED FOR F1 TIMING`, not erased.

Preserved:

```text
model/runtime/provider is not spend authority
caller/model cannot widen server-derived execution limits
maxModelCalls remains independent and finite
hidden retries/fallback/model-backed optional features must be controlled
usage/cost missing never becomes zero
restart/resume cannot invent successful usage/cost history
no generic BudgetService/model proxy/token broker
```

Deferred until a real trigger:

```text
effectiveModelSpendCapUsd hard guarantee
pre-provider worst-case monetary reservation
one outstanding monetary liability
qualified finite cost envelope per request class
actual-vs-conservative monetary settlement
hard per-run provider-invoice-bound claim
```

### 8.4 Reopen triggers

Reopen Package C / deferred 3I-03 monetary enforcement when any is real:

```text
self-service/commercial Conexus
customer/project quotas or billing
multi-provider automatic routing/fallback
long-running autonomous agents with material cost exposure
user-configurable loops beyond bounded internal operation
contractual hard per-run budget
provider/account limits insufficient for accepted risk
measured cost incident or first-build evidence showing current finite guards are not sufficient
```

Package C is therefore:

```text
F1 critical-path execution = REMOVED
future seam/authority       = PRESERVED
current package run         = NOT AUTHORIZED
```

---

## 9. Revised 3L critical path

```text
Q0                         COMPLETE
Package A                  COMPLETE
Package B                  IN PROGRESS
  BT-1                     PASS
  BT-2                     PASS
  BT-3 / BT-3A             EVIDENCE ACCEPTED / ROUTE REFINED
  BT-3N                    NEXT
  BT-4N                    BLOCKED behind BT-3N
  BT-5N                    BLOCKED behind BT-4N
Package C                  DEFER SAFELY / NO F1 EXECUTION
Package D                  MUST BE REDERIVED AFTER B; execute only remaining load-bearing substrate question
Package E                  MUST BE REDERIVED AFTER B/D; execute only Evidence capability required before C-018
final independent Fable    one review of complete 3L
3L closure                 only after proportional completeness check
```

Q0's old unconditional serial `A → B → C → D → E` route is amended by this decision. Serial adjudication remains, but a deferred package is not executed merely to preserve sequence ceremony.

D and E do not inherit their old breadth. Before execution each receives the same adversarial question:

> If this package is removed now, would a later coding actor have to silently choose a material owner/boundary/technology behavior, or could a load-bearing technology assumption fail only after expensive retrofit?

Only the smallest positive answer remains in 3L.

---

## 10. Explicit non-build list

This decision creates none of:

```text
RuntimeContextService
AuthorityProjection service/database
ContextBus / RuntimeBus / EventBus
new Product Agent wrapper runtime
universal Workflow
DurableAgent baseline
custom scheduler
ScheduleOccurrence durable record
model proxy / token broker / BudgetService
pricing/calibration engine
multi-provider optimizer
new module / schema / Tier-2 FK
Product code
```

---

## 11. Supersession map

```text
3H-02 direct Agent baseline                         = PRESERVED
3H-02 native approval only-after-adapter wording    = REFINED; native approval preferred as mechanics
3H-02 generic suspend as approval baseline          = REFINED; reserve for genuine in-tool wait
3H-02 active ordinary Agent crash Package-B proof   = DEFERRED / 3M honesty review
3H-02 scheduler guarded PAR ingress                 = PRESERVED
3H-03 role-specific Mastra/store/PubSub              = PRESERVED
3H-03 RequestContext REPLACE-WHOLE mechanism         = SUPERSEDED
3H-03 stale-authority invariant                      = PRESERVED / STRENGTHENED
3H-03 prove all optional globals                     = REFINED to enabled F1 surfaces
3L-B proof inventory                                 = PRESERVED
3L-B old BT-3/4/5 route                              = SUPERSEDED by BT-3N/4N/5N
3I-03 owner/non-authority/missingness principles     = PRESERVED
3I-03 hard monetary F1 enforcement                   = DEFERRED
3L-Q0 unconditional Package-C execution              = SUPERSEDED
```

---

## 12. Exact next action

1. Project this operator-ratified decision into `current/`, `LEDGER.md`, Q0 and Package-B routing; remove every stale `BT-3A NEXT` / unconditional Package-C execution instruction.
2. Execute **BT-3N only** against the existing exact Package-B lock using the installed Mastra skill, Context7 and exact pinned source.
3. Return Evidence for Architecture-Lead adjudication.
4. BT-4N and BT-5N remain serially blocked until the preceding probe is read and adjudicated.

```text
Product implementation = BLOCKED
C-018                 = NOT RATIFIED
Package C execution   = NOT AUTHORIZED
merge                  = NOT AUTHORIZED
```
