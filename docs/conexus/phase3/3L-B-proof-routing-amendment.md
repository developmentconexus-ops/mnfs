# 3L-B — Proportional Proof-Routing Amendment

**Status:** `APPROVED / OPERATOR RATIFIED 2026-08-19`  
**Fase:** 3L — Technology Qualification  
**Scope:** Package B — Product Agent + Cross-Runtime  
**Parent:** [3L-B-product-agent-cross-runtime-qualification.md](3L-B-product-agent-cross-runtime-qualification.md)  
**B0:** [3L-B0-final-lead-adjudication.md](3L-B0-final-lead-adjudication.md) — `PASS / LEAD-ADJUDICATED`  
**Method:** DevelopmentConexus Engineering Method v1.0.0  
**Important:** this amendment changes **proof timing/routing only**. It does not change Product meaning, owner/boundary semantics, 3G/3H architecture, C-018, implementation authorization or merge authority.

> **Current supersession:** [3L-R1](3L-R1-framework-native-proportional-qualification-rebaseline.md) preserves this proof-obligation inventory but supersedes the old `BT-3/BT-4/BT-5` execution route. `BT-3A` is complete; current execution is `BT-3N` only, while `BT-4N` and `BT-5N` remain blocked.

## 1. Decision in one sentence

Package B will no longer execute its 52 compiled obligations as 52 pre-implementation tests. The 52 remain a durable **proof-obligation inventory**, while 3L executes only five bounded technology probes capable of falsifying the selected Mastra/runtime realization before C-018; Conexus-owned correctness rules are proven against the real implementation at first-build conformance, recovery-specific obligations close in 3M, and deciding-observability obligations remain in Package E/3N.

## 2. Why this amendment is required

3A-R6 defines 3L as qualification of **load-bearing technology assumptions**, not as premature implementation conformance.

The previous B1→B4 execution decomposition correctly preserved important invariants, but several criteria test future Conexus-owned behavior such as:

```text
AgentRun admission ordering
ApprovalRequest transaction ordering
sealed proposal enforcement
Gateway idempotency / OUTCOME_UNKNOWN
PAR occurrence-cursor atomicity
trigger disable/update races
F5 owner terminal write-once
telemetry != owner terminal truth
```

Those are mandatory rules, but building miniature PAR/Gateway/owner implementations inside a pre-C-018 spike merely to test them would create accidental complexity and weaker evidence than testing the real Product implementation later.

Target invariant:

> **Before C-018, prove only external/substrate assumptions whose failure can invalidate the selected realization. Preserve every internal correctness obligation and prove it at the earliest stage where real implementation bytes exist.**

This is a bounded proof-routing correction, not an architecture reopen.

```text
current architecture               = CONFIRMED
new Product requirement            = 0
new module/record/database          = 0
52 proof obligations                = PRESERVED
pre-C-018 Package-B technology work = 5 bounded probes
old 52-test execution plan          = SUPERSEDED AS EXECUTION ROUTE ONLY
```

## 3. Five Package-B technology probes

### BT-1 — Direct Agent authority closure

Question:

> Can the exact pinned Mastra family execute the exact direct `Agent` instance selected by Conexus without Stored-Agent/latest/Editor/version-override machinery silently becoming execution authority?

Must prove/falsify only the substrate properties needed by current 3H-02:

```text
code-defined direct Agent is executable
exact constructed instance can be invoked directly
Editor override surface can be mechanically closed for governed fields
Stored/latest/version resolution is not required for the selected execution path
no hidden mutable resolution is forced below the direct-instance call
```

Primary source obligations informing this probe:

```text
B1-02
B1-03
source/substrate slice of B1-01
```

Do not build Release/PAR owner logic merely to run BT-1.

### BT-2 — Conversation / memory substrate isolation

Question:

> Can the exact pinned Mastra memory/thread substrate represent explicitly separated Conversation/resource scopes without unavoidable cross-scope aliasing?

Must prove/falsify:

```text
explicit thread identity is supported
explicit resource identity is supported
thread-scoped and resource-scoped behavior differ as documented/source-proven
insufficient scope can be made to leak in a negative control
sufficient distinct scope prevents that substrate-level leakage
same thread identity under incompatible resource ownership is refused or otherwise mechanically non-aliasing
advanced memory features remain unnecessary for this proof
```

Primary source obligations informing this probe:

```text
substrate slice of B1-06
substrate slice of B1-07
B1-08
```

Owner-key encoding/collision resistance itself remains first-build Conexus conformance.

### BT-3 — Suspend / fresh-process resume + RequestContext capability

Question:

> Can a direct Mastra Product-Agent path persist a genuine suspension, survive process loss, be discovered/resumed by a fresh process, and accept a freshly rebuilt RequestContext rather than requiring restored stale authority-shaped context?

Must prove/falsify:

```text
direct-Agent selective suspension persists in the exact configured store
fresh process can discover the exact suspended runtime continuation
fresh process can resume it through the supported direct-Agent mechanism
resume can receive current caller-supplied RequestContext
restored snapshot context is not an unavoidable authority input when a fresh context is supplied
plain non-suspended active-Agent process loss is characterized honestly
```

Primary source obligations informing this probe:

```text
technology slice of B2-02
technology slice of B2-03
technology slice of B2-04
B2-10 crash characterization
technology slice of B2-12
technology slice of B4-12 / B4-13
```

Do not implement ApprovalRequest, Gateway effect replay or PAR recovery policy inside BT-3. Their Product proofs remain downstream.

### BT-4 — Schedule occurrence identity substrate

Question:

> Does the exact pinned Mastra schedule path expose enough stable intended-fire information before Product execution to support guarded PAR occurrence admission and duplicate/redelivery identity, or does the already-authorized narrow adapter seam need to fire?

Must prove/falsify:

```text
schedule wake can target a bounded adapter/ingress instead of direct Product Agent execution
pre-execution wake data exposes or allows deterministic recovery of intended scheduled slot identity
same logical scheduled slot remains distinguishable from transport/delivery time
redelivery/retry can present a stable logical occurrence key or source facts sufficient for the narrow adapter to do so
cron/timezone source facts needed to validate intended slot are available
```

Primary source obligations informing this probe:

```text
substrate slice of B3-03
B3-04
substrate slice of B3-05
substrate slice of B3-10
substrate slice of B3-11
```

Do not implement `par.agent_trigger`, owner cursor, SKIPPED, disable/update races or AgentRun admission inside BT-4.

Allowed outcome if native mechanics are insufficient:

```text
narrow intended-slot adapter seam REQUIRED
```

This is an existing realization seam, not a new scheduler/domain.

### BT-5 — Builder ↔ PAR same-process isolation

Question:

> Can two governed Mastra role instances coexist in one Node process with separate persistent stores, PubSub/runtime state and registered surfaces, without an enabled F1 process-global mutable facility causing reachable cross-role bleed?

Must prove/falsify:

```text
BuilderMastra != ParMastra object graph
mastra_builder != mastra_par persistent state
explicit distinct PubSub instances remain disjoint
intentionally shared PubSub negative control demonstrates why sharing is unsafe
module-default PubSub receives zero governed role traffic under explicit wiring
opposite-role registered Agent/memory/schedule surfaces are not resolved by the other role
standalone/ephemeral fallback is not required by the framework for governed execution
current enabled process-global facilities are enumerated and challenged
```

Primary source obligations informing this probe:

```text
technology slice of B4-01
B4-02
technology slice of B4-04
B4-05
B4-06
B4-07
B4-08
technology slice of B4-10
technology slice of B4-11
```

Allowed verdicts:

```text
QUALIFIED_SAME_PROCESS
PROCESS_SPLIT_REQUIRED
NOT_PROVEN
```

`PROCESS_SPLIT_REQUIRED` fires only on the already-approved 3H-03 trigger:

```text
reachable cross-role mutable bleed
+
enabled/load-bearing F1 capability
+
no smallest reliable role/instance partition
```

No RuntimeBus/EventBus/queue/outbox/microservice architecture follows automatically.

## 4. The 52 obligations are preserved, not deleted

`spikes/conexus-3l-b/admission/criteria.json` remains the durable compiled inventory of B1-01..B4-18.

The inventory must no longer be interpreted as:

```text
52 obligations
→ 52 tests required before C-018
```

Instead:

```text
52 obligations
→ preserve invariant + semantic home + negative path
→ derive only the load-bearing external technology slice into BT-1..BT-5
→ prove Conexus-owned behavior on real implementation bytes later
```

A source obligation may inform a 3L technology probe **and still remain a first-build conformance obligation**. Passing a substrate probe does not prove Product code that does not yet exist.

## 5. Primary downstream proof routing

### FIRST-BUILD CONFORMANCE

The primary final proof stage for the Conexus-owned behavior of these criteria is the first implementing slice after C-018 + accepted Realization Planning:

```text
B1-01..B1-10

B2-01
B2-03..B2-09
B2-11..B2-12

B3-01..B3-12

B4-01..B4-18
```

Technology slices listed in BT-1..BT-5 may be qualified earlier, but the Product-owned part remains here.

Examples that must wait for real implementation bytes:

```text
exact Release → RuntimeAgentProjection owner mapping
AgentRun exists before runtime execution
new Release does not mutate old AgentRun
owner-derived Conversation/memory keys
ApprovalRequest owner-first ordering
sealed proposal / ALLOW_ONCE checks
Gateway idempotency and OUTCOME_UNKNOWN
owner occurrence cursor + AgentRun atomicity
SKIPPED/no-backlog semantics
disable/update × fire races
RequestContext built from real owner facts
F5 dispatch-handle identity
terminal write-once / duplicate callback behavior
telemetry cannot manufacture owner terminal truth
```

### 3M — FAILURE & RECOVERY

Recovery sufficiency remains primarily routed to 3M for:

```text
B2-02 owner-wait vs runtime-snapshot asymmetric recovery sufficiency
B2-10 final policy for plain active-Agent process loss after BT-3 characterizes substrate behavior
```

The first implementation may contain the smallest guards needed to exercise these paths; 3M decides whether existing durable facts are structurally sufficient or a Material Finding exists.

### PACKAGE E / 3N

The nine observability/deciding-evidence families already compiled as `ROUTED_TO_E` remain there. They are not pulled back into Package B.

B4-17/B4-18 owner-control-vs-telemetry behavior is first-build conformance and later receives global cross-check in Package E/3N; Package E does not become owner terminal authority.

3N remains one independent global coherence review, not a replay of all 52 tests.

## 6. Evidence proportionality

For BT-1..BT-5:

```text
Mastra skill                      = execution guidance
Context7 /mastra-ai/mastra       = current external Evidence when needed
exact locked package source       = version-specific Evidence
local/Postgres/process probe      = behavioral Evidence
provider/model call               = NOT REQUIRED by default
E2B live call                      = NOT REQUIRED
```

Do not create a new evidence document per trivial assertion. One bounded result artifact per BT probe is sufficient if it records:

```text
exact HEAD + lock identity
question/invariant
source/API used
negative/control result
positive result
Known / Unknown / limitation
verdict
```

B5 remains `NOT ADMITTED` unless one of BT-1..BT-5 is otherwise complete but still cannot answer a load-bearing question without native provider/model behavior.

## 7. Package-B closure condition

Package B may close before Product implementation when the five technology questions are adjudicated:

```text
BT-1 direct Agent authority closure       = proven / bounded failure adjudicated
BT-2 conversation/memory substrate        = proven / bounded failure adjudicated
BT-3 suspend/process-loss substrate        = proven / bounded failure adjudicated
BT-4 schedule occurrence substrate        = proven or narrow adapter seam fired
BT-5 same-process isolation               = QUALIFIED_SAME_PROCESS or PROCESS_SPLIT_REQUIRED
```

Then:

```text
CX-AGENT-MASTRA-01
→ qualified only for the technology properties actually proven

CX-RUNTIME-ISOLATION-01
→ QUALIFIED_SAME_PROCESS | PROCESS_SPLIT_REQUIRED | NOT_PROVEN
```

Package-B closure never means the downstream 52 Product conformance obligations disappeared.

## 8. Supersession statement

The prior sectioned `B1 → B2 → B3 → B4` plan in `3L-B-product-agent-cross-runtime-qualification.md` remains useful as provenance/proof inventory, but is **PARTIALLY_SUPERSEDED for execution timing** by this amendment.

Precisely:

```text
protected invariants             = PRESERVE
semantic homes                   = PRESERVE
negative-path intent             = PRESERVE
52-obligation inventory          = PRESERVE
literal 52-test pre-C-018 route  = SUPERSEDED
BT-1..BT-5 technology route      = CURRENT
```

No historical mechanism regains authority through this amendment.

## 9. Exact next action

> Execute BT-1..BT-5 as one bounded Package-B technology-qualification line against the existing exact Package-B lock, using deterministic/source/PostgreSQL/process evidence first. Stop on material architecture contradiction; do not build Product owners merely to make a probe pass.

After BT-1..BT-5, Evidence returns to the Architecture Lead for adjudication. Fable enters only after a reviewable Package-B result or a material split/failure finding.
