# 3L-R1 — Mastra-Native Qualification & F1 Routing Reconciliation

**Status:** `CURRENT / APPROVED / OPERATOR RATIFIED 2026-08-19`  
**Phase:** 3L — Technology Qualification  
**Scope:** Package B realization routing + Package C F1 critical-path correction  
**Method:** DevelopmentConexus Engineering Method v1.0.0  
**Product implementation:** BLOCKED  
**C-018:** NOT RATIFIED  
**PR #40 merge:** NOT AUTHORIZED  

## 1. Decision in one sentence

Conexus keeps its accepted Product meanings, semantic owners and security/authority invariants, but its **Mastra realization is rederived from Mastra's native mental model instead of forcing earlier implementation assumptions onto the framework**: F1 Product Agents use direct Mastra `Agent`, native tool approval is the pause mechanism, `RequestContext` is subordinate runtime/configuration context rather than Product authority, owner/Gateway checks remain authoritative, active-run `DurableAgent` recovery is deferred, Mastra's native scheduler is reused as mechanism behind a narrow PAR admission seam, and Package C advanced model-economics machinery is removed from the F1 pre-C-018 critical path under explicit reopen triggers.

This is a bounded realization/routing correction. It is **not** a Product redesign and does not authorize Product code.

---

## 2. Why this reconciliation exists

Package B produced real Evidence that invalidated an overly literal realization assumption without invalidating the protected Product invariant.

Previous realization wording effectively assumed:

```text
fresh RequestContext on resume
→ REPLACE WHOLE restored/effective RequestContext
→ therefore stale authority-shaped context disappears physically
```

Exact pinned runtime Evidence showed instead:

```text
fresh caller RequestContext
→ early Agent default/model/instruction/tool shaping
→ workflow resume
→ snapshot keys absent from fresh RequestContext are backfilled
→ merged RequestContext reaches resumed execution/tool
```

The correct Method response is not to force Mastra to mimic the old mechanism. It is to preserve the real invariant:

> **No stale runtime/provider/framework state may become current Conexus authority or authorize a governed Product decision.**

Method law:

```text
Mechanism != Authority
```

---

## 3. Authority and Evidence basis

### 3.1 Conexus authority

This amendment is derived from and preserves the enduring semantic authority of:

```text
3A-R6  — Critical Path & Implementation Readiness
3A-R10 — Pre-Implementation Convergence & Realization Routing
3A-R11 — Whole-Product Authority Rebaseline
3H-02  — Production Agent Runtime Realization
3H-03  — Runtime Isolation, Correlation & Handoff
3I-01  — Current Authorization / Revocation
3I-03  — historical detailed model-spend architecture, as F1-routed below
3K-04  — Product Agent authoring / management / use
3L-Q0  — qualification identity and evidence discipline, as routing-amended below
3L-B proof-routing amendment
```

Exact earlier mechanism clauses are superseded only where this document says so. Historical decisions remain provenance and rationale.

### 3.2 Existing Package-B deciding Evidence

Exact Package-B lock remains:

```text
Node             = 24.18.0
@mastra/core     = 1.56.0
@mastra/memory   = 1.25.0
@mastra/pg       = 1.19.0
PostgreSQL       = 17.10
lock SHA-256     = 5e8b2b4ea2ef5ae5676652cdbafd8c7c284be68cfc445de92950b2decdc8a4f0
```

Evidence already earned and preserved:

```text
BT-1  Direct Agent authority closure                 = PASS
BT-2  Conversation / memory substrate isolation      = PASS
BT-3  fresh-process suspended resume                 = REAL BEHAVIOR PROVEN
      same-key fresh value wins                      = PASS
      unknown stale snapshot key physically survives = CONFIRMED
BT-3A requestContextSchema as closed post-merge view = FALSIFIED BY PINNED SOURCE
```

Evidence files:

```text
spikes/conexus-3l-b/evidence/bt1.json
spikes/conexus-3l-b/evidence/bt2.json
spikes/conexus-3l-b/evidence/bt3.json
spikes/conexus-3l-b/evidence/bt3a-source.json
```

Lead adjudication:

```text
docs/conexus/phase3/3L-B-BT3A-lead-adjudication.md
```

### 3.3 Required Mastra execution skill and documentation route

Repository-installed official Mastra skill:

```text
.agents/skills/mastra/SKILL.md
```

Provenance:

```text
.agents/skills/mastra/UPSTREAM.md
upstream = mastra-ai/skills
skill    = mastra v2.1.0
license  = Apache-2.0
```

Current external documentation lookup:

```text
Context7 library id = /mastra-ai/mastra
```

For deciding version-specific behavior, current docs remain secondary to exact installed/pinned source and bounded runtime proof.

---

## 4. Protected Product / authority invariants — unchanged

The following remain mandatory:

```text
exact Release / no mutable latest
current authorization and revocation at protected points
Workspace / Project containment
PAR owns Conversation, Product AgentRun, ApprovalRequest and AgentTrigger semantics
Gateway owns external effect admission, replay/idempotency and credential last-mile
approval binds one exact sealed subject
runtime/provider/framework state never becomes Product authority by persistence
stale runtime state cannot authorize a current governed decision
schedule fire cannot bypass PAR admission
Builder authority and PAR authority remain capability-isolated
telemetry/runtime correlation != owner truth
```

Nothing in this amendment permits a model, Mastra snapshot, `RequestContext`, schedule row, tool call, trace or runtime cache to mint Product authority.

---

## 5. Mastra-native F1 realization map

| Conexus need | Mastra primitive | Current F1 use | Classification |
|---|---|---|---|
| open-ended Product Agent | `Agent` | exact code-defined direct Agent derived from exact Release | `USE_NATIVE` |
| request-local/dynamic runtime context | `RequestContext` | runtime/config/correlation inputs only; never business authority | `USE_NATIVE` |
| Conversation | Memory thread/resource | explicit Conexus-derived thread/resource scoping | `USE_NATIVE` |
| bounded business capability | `createTool` / Agent tools | façade to Conexus capability / governed boundary | `USE_NATIVE + OWNER BOUNDARY` |
| pause before risky tool execution | `requireApproval` | runtime pause mechanic | `USE_NATIVE` |
| approval authority | no Mastra Product authority | PAR `ApprovalRequest` | `CONEXUS_OWNER_ONLY` |
| external effect authority | no Mastra Product authority | Capability Gateway | `CONEXUS_OWNER_ONLY` |
| in-tool wait for information | tool `suspend()` / resume data | only where a real tool needs resumable input | `USE_NATIVE WHEN NEEDED` |
| suspended approval after restart | direct Agent + persistent storage / suspended-run discovery | F1 durability path | `USE_NATIVE / MUST PROVE CURRENT-OWNER BOUNDARY` |
| active run recovery after process death | `DurableAgent` | no current F1 consumer | `DEFER SAFELY` |
| wrap every Product Agent in Workflow | Workflow | structurally unnecessary for open-ended Product Agent | `REJECT F1 BASELINE` |
| cron schedule mechanics | native Mastra Scheduler | recurrence substrate | `USE_NATIVE` |
| stable intended occurrence | native scheduler CAS + deterministic occurrence material | substrate identity input | `USE_NATIVE / EXACT BOUNDARY PROOF PENDING` |
| schedule occurrence → Product Agent execution | stock Agent schedule path | must pass through PAR admission | `NARROW BOUNDARY REQUIRED` |
| Builder/PAR role separation | two Mastra instances | same-process baseline when enabled facilities are fenced | `LIKELY USE_NATIVE / PROOF PENDING` |
| optional process-global Mastra facilities | facility-specific | no blanket admission | `DEFER UNTIL NAMED CONSUMER` |

---

## 6. Direct Agent remains the Product-Agent baseline

Product Agent behavior is naturally open-ended:

```text
reason
→ choose bounded tools
→ converse
→ produce output / propose action
```

Therefore F1 remains:

```text
exact active Release
→ RuntimeAgentProjection
→ ParMastra
→ direct Mastra Agent
→ bounded tools
```

A Workflow may be used later for a genuinely structured Product process with a named consumer. It is not a universal wrapper around every Product Agent merely to obtain durability.

`DurableAgent` is also not the default F1 Product Agent. Its active-run recovery/re-drive/resumable-stream capabilities solve a broader problem than F1 currently requires and introduce replay/recovery questions that should not be purchased speculatively.

---

## 7. Approval realization correction

### 7.1 Native pause mechanic

For a tool call that requires human approval before execution, prefer Mastra's native approval surface:

```text
Agent proposes tool call
→ Mastra requireApproval pauses before tool execution
→ PAR owner persists one exact sealed ApprovalRequest
→ human decision under current eligibility
→ current Conexus authority recheck
→ approveToolCall / declineToolCall as runtime continuation mechanism
→ governed tool boundary
→ Gateway current effect recheck
→ external effect only if admitted
```

Mastra approval is **not** the Product approval authority.

### 7.2 Generic suspension remains distinct

Generic tool `suspend()` is reserved for a real in-execution need for resume data or another tool-specific wait. It is not the default Product approval model merely because it can pause execution.

### 7.3 Exact proposal identity remains mandatory

```text
ApprovalRequest sealed subject
+ exact args / proposal digest
+ current owner facts
```

must match before continuation/effect. Mastra `toolCallId` remains correlation/mechanics, not Product authority.

---

## 8. RequestContext realization correction

### 8.1 Current meaning

```text
Mastra RequestContext
= request/runtime/configuration/correlation substrate
!= Product/business authority
```

It may carry current inputs needed by dynamic Agent configuration, but no arbitrary raw key can become permission, approval, binding, identity or effect authority by being present.

### 8.2 What BT-3 / BT-3A mean

Pinned Evidence establishes:

```text
fresh caller values can override same-key snapshot values
unknown omitted snapshot keys may physically survive resume
initial dynamic Agent shaping occurs from fresh caller RequestContext before snapshot backfill
requestContextSchema is not a post-merge closed replacement execution view in 1.56.0
```

Therefore the old mechanism:

```text
RequestContext itself = REPLACE WHOLE authority state
```

is superseded.

### 8.3 Current enforcement direction

Governed code must obtain/validate authority from current Conexus owner facts at the applicable boundary.

Forbidden:

```text
raw requestContext.get("role")         → business permission authority
raw requestContext.get("approved")     → ApprovalRequest authority
raw requestContext.get("connectionId") → current binding authority without owner validation
raw snapshot/runtime value              → Gateway effect authority
```

A small derived runtime input/value object may later exist in Realization Planning if useful. This amendment does **not** create a `RuntimeContextService`, generic authority service, new database, new owner or universal context adapter.

---

## 9. Suspension / restart scope for F1

F1 must prove the case it actually needs:

```text
Agent reaches native approval wait
→ durable suspended state exists
→ process A disappears
→ process B rediscovers the suspended run
→ current owner facts may have changed while waiting
→ approval continuation cannot bypass current authority
→ governed effect remains fail-closed
```

The following broader property is not a current F1 critical-path requirement:

```text
Agent is actively reasoning/executing between wait boundaries
→ process dies
→ automatically recover/re-drive that active run
```

That broader property belongs to `DurableAgent`/active-run recovery and is now `DEFER SAFELY` until a named consumer/failure requirement makes it load-bearing.

The old unfinished "plain active-Agent crash characterization" is therefore **not inherited as a mandatory pre-C-018 probe**.

---

## 10. Native scheduler realization correction

Exact 1.56.0 source research indicates the native scheduler already provides the relevant substrate concepts:

```text
due schedule lookup
→ next-fire computation
→ compare-and-swap claim of current nextFireAt
→ deterministic claim/run material derived from schedule + intended fire slot
→ event carrying scheduled fire time
```

This is source Evidence to compile into BT-4R; BT-4R remains responsible for any deciding property not already sufficiently established against the exact Package-B lock.

Conexus Product semantics remain:

```text
Mastra scheduled occurrence
→ guarded PAR schedule-fire ingress
→ validate current AgentTrigger / TriggerRevision
→ stable intended-slot identity
→ single-flight / overlap law
→ current exact Release resolution
→ AgentRun admission
→ Agent
```

Stock framework behavior that directly runs an Agent is not allowed to bypass PAR owner admission merely because Mastra supports Agent schedules.

No custom scheduler, generic EventBus, outbox or Automation domain is introduced.

---

## 11. Same-process BuilderMastra ↔ ParMastra realization

Current baseline remains two role-specific Mastra instances:

```text
one trusted Node/TS Hub process
├── BuilderMastra → mastra_builder → Builder-only agents/tools/workspaces
└── ParMastra     → mastra_par     → PAR-only agents/tools/memory/schedules
```

Instance-local storage/pubsub/registries are expected to provide most ordinary isolation.

A Mastra facility that is module-global/process-global is **not automatically admitted** into both roles. Optional facilities without an F1 consumer are deferred rather than forcing a process split.

Concrete research has identified scorer hooks as an example of module-global plumbing. That does not itself create a material same-process contradiction because scorer use is not admitted as Product authority and has no current load-bearing F1 consumer in this route.

Only a load-bearing enabled F1 facility that cannot be fenced would justify `PROCESS_SPLIT_REQUIRED`.

---

## 12. Package B — rederived remaining proof route

Historical BT-1/BT-2/BT-3/BT-3A Evidence is preserved. The old literal BT-3A-next route is closed/superseded.

Current Package-B route:

```text
BT-1  = PASS / PRESERVED EVIDENCE
BT-2  = PASS / PRESERVED EVIDENCE
BT-3  = BEHAVIOR PROVEN / MECHANISM FINDING PRESERVED
BT-3A = SOURCE DISCRIMINANT COMPLETE / NATIVE SCHEMA ROUTE REJECTED

BT-3R = NEXT / ONLY EXECUTION AUTHORIZED AFTER CURRENT-DOC PROJECTION ROLL-FORWARD
BT-4R = BLOCKED
BT-5R = BLOCKED

Package B = IN PROGRESS
```

### 12.1 BT-3R — Native HITL + current-owner boundary

Question:

> Can direct Mastra Agent + native `requireApproval` + persistent suspended-run storage survive process loss while every governed continuation/effect consumes current Conexus owner authority and stale raw `RequestContext` remains semantically inert?

Minimum falsification scenario:

```text
process A
→ exact direct Agent
→ risky deterministic local tool requires native approval
→ suspended state persisted
→ current owner fact initially ALLOW
→ process A exits

between A and B
→ current owner fact changes to DENY / approval-relevant authority narrows

process B
→ rediscover exact suspended run
→ native approval continuation attempted
→ governed Conexus boundary rechecks current owner truth
→ DENY
→ tool real effect fixture not executed
```

Required negative/control evidence:

```text
control without current-owner recheck would execute deterministic local effect fixture
→ control fires

guarded path
→ stale raw RequestContext may remain physically observable
→ but cannot make guarded effect execute
```

No Product implementation is created. Use a deterministic spike-local owner/boundary fixture solely to falsify the realization ordering; it must not become a new Product owner/service/schema.

If public/stable Mastra surfaces cannot place the current-owner boundary before tool execution:

```text
FAIL_REALIZATION_MATERIAL
→ STOP / Architecture Lead + operator
```

If a narrow public adapter is necessary but architecture semantics remain intact:

```text
NARROW_ADAPTER_REQUIRED
→ STOP / Architecture Lead
```

BT-3R does not authorize BT-4R by inheritance.

### 12.2 BT-4R — Native Scheduler → PAR admission

Not yet execution-authorized.

When authorized, it must reuse accepted exact-source evidence for native scheduler mechanics and prove only the residual load-bearing property:

```text
native intended occurrence
→ supported/narrow interception or dispatch seam
→ PAR admission happens before AgentRun/model execution
```

The proof must preserve current TriggerRevision/slot/single-flight/Release laws. If the public framework seam is insufficient, return `NARROW_ADAPTER_REQUIRED`; do not build a scheduler.

### 12.3 BT-5R — role-instance isolation

Not yet execution-authorized.

When authorized, prove only the enabled F1 role surfaces:

```text
BuilderMastra + ParMastra
same Node process
+ separate stores
+ separate pubsub/registries/agent objects
→ no admitted-role bleed
```

Optional process-global facilities without a named F1 consumer are not activated merely to create a failure. A material enabled-facility bleed may return `PROCESS_SPLIT_REQUIRED`.

---

## 13. Package C — F1 critical-path correction

### 13.1 Classification

The operator approved:

```text
Package C pre-C-018 execution = DEFER SAFELY for F1
```

This supersedes Q0's old literal serial execution route `A → B → C → D → E` **for Package C execution only**. Q0's pinning, evidence, supply-chain and qualification-discipline laws remain current.

### 13.2 What is deferred

Do not build/qualify now:

```text
model benchmark/calibration program
GPT vs Claude vs Gemini quality-price routing
cheapest-model selection
automatic provider/model optimizer
sophisticated automatic fallback cascade
invoice-bound per-run cost-envelope machinery
pre-provider maximum-liability reservation subsystem
customer quota/billing model-spend machinery
```

### 13.3 F1 safe posture that remains mandatory

F1 does not become unbounded. The smallest sustainable posture is:

```text
small explicit allowlist of admitted provider/model identifiers
no automatic fallback cascade
hidden framework/provider retry behavior disabled or strictly bounded where controllable
strict bounded retry counts
explicit Agent/loop/tool-step limits
provider/account-level spending caps where available
usage/token/cost telemetry with MISSING != ZERO
operator-visible failure when a model/provider path is unavailable
```

This is a bounded operational/realization posture, not a generic BudgetService or Model Gateway business domain.

### 13.4 3I-03 reconciliation

The enduring safety intent of 3I-03 survives:

```text
model spend must be bounded
missing/ambiguous usage is never silently zero
retry/fallback cannot silently create unlimited liability
owner/run correlation must remain truthful
```

The detailed F1 mechanism previously requiring owner-local pre-provider maximum-liability reservation and exact per-run invoice-bound enforcement is **superseded for F1 by the bounded posture above** until a reopen trigger fires.

Historical 3I-03 remains provenance for the deferred stronger design; it is not deleted or forgotten.

### 13.5 Reopen triggers

Reopen the stronger model-economics/spend-control decision when any material consumer appears, including:

```text
customer/self-service commercialization
billing or quotas per customer/Workspace/Project
contractual per-run budget guarantee
automatic multi-provider/model routing
sophisticated fallback/retry policy
long-running/high-autonomy agents with material cost exposure
provider/account cap no longer bounds the reachable loss acceptably
real observed spend incident demonstrating the bounded F1 posture is insufficient
```

---

## 14. Packages D / E after Package B

This amendment does not auto-defer or auto-execute Package D or Package E.

After Package B is adjudicated, apply the 3A-R6 deletion test again:

> If this package disappeared today, would a coding actor have to make a material architecture decision silently, or could a load-bearing technology incompatibility be discovered only after expensive realization?

Only the smallest surviving load-bearing proof is admitted.

No old Q0 package sequence creates execution authority by inheritance.

---

## 15. Exact supersession map

This amendment supersedes only the following current-mechanism/routing claims:

```text
3H-03 / current Architecture Baseline:
  "RequestContext replaced whole" as required Mastra object semantics
  raw effective RequestContext as the vehicle that itself guarantees current Product authority
  unfinished plain active-Agent crash characterization as inherited pre-C-018 obligation

current Architecture Baseline section 24.5 / 25.3:
  same exact REPLACE-WHOLE mechanism wording

current Architecture Baseline section 28 + 3I-03, F1 routing only:
  exact pre-provider maximum-liability reservation / invoice-bound per-run enforcement
  as mandatory F1 realization before Product implementation

3L-Q0 section 13, routing only:
  automatic A → B → C → D → E execution sequence

old current router / LEDGER Package-B rows:
  BT-3A = NEXT / EXECUTION AUTHORIZED
  BT-4..BT-5 names as unrederived next probes
```

It does **not** supersede semantic owner boundaries, exact Release laws, current authorization, sealed approval subject, Gateway effect authority, PAR schedule semantics, least privilege, Evidence discipline or Product scope.

---

## 16. Projection roll-forward requirement

Before BT-3R runtime execution, repository mechanics must roll this ratified amendment into the current projections that still display stale route/mechanism wording, at minimum:

```text
docs/conexus/current/README.md
docs/conexus/current/ARCHITECTURE-BASELINE.md
docs/conexus/phase3/LEDGER.md
```

Historical authority files may receive a supersession note but must not be rewritten as though the earlier decision never existed.

A stale projection must never cause BT-3A to be re-executed.

---

## 17. Current status / next action

```text
3A-R11 = CLOSED / APPROVED / OPERATOR RATIFIED
3L-Q0  = COMPLETE / discipline preserved; execution route amended
Package A = COMPLETE

Package B = IN PROGRESS
  BT-1  = PASS
  BT-2  = PASS
  BT-3  = REAL BEHAVIOR PROVEN / MECHANISM FINDING
  BT-3A = COMPLETE / FAIL_SCHEMA_OR_NATIVE_GUARD_INSUFFICIENT
  BT-3R = NEXT, AFTER CURRENT-PROJECTION ROLL-FORWARD
  BT-4R = BLOCKED
  BT-5R = BLOCKED

Package C = DEFER SAFELY FOR F1 / REOPEN TRIGGERS RECORDED
Packages D/E = RE-DERIVE AFTER PACKAGE B; NOT AUTO-AUTHORIZED

3M = NOT STARTED
3N = NOT STARTED
3O = NOT STARTED
C-018 = NOT RATIFIED
Product implementation = BLOCKED
PR #40 merge = NOT AUTHORIZED
```

**Exact next action:** mechanically roll this ratified amendment into the current README / Architecture Baseline / LEDGER, verify repository coherence, then execute **BT-3R only** against the existing exact Package-B lock. Stop and return Evidence for Architecture-Lead adjudication before any BT-4R/BT-5R work.