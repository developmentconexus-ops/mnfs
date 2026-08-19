# 3L-B — Product Agent + Cross-Runtime Qualification

**Status:** IN PROGRESS / B0 LEAD-ADJUDICATED — PASS / PROOF-ROUTING AMENDMENT APPROVED — CURRENT / BT-1..BT-5 NEXT — NOT EXECUTED
**Fase:** 3L — Technology Qualification  
**Package:** B — Product Agent + Cross-Runtime  
**Authority:** current accepted `docs/conexus/current/*` tree + 3A-R10 + 3L-Q0 + current 3G/3H/3I/3J semantic authority  
**Method:** DevelopmentConexus Engineering Method v1.0.0  
**Operator ratification:** 2026-08-18  
**Current execution authority:** [3L-B-proof-routing-amendment.md](3L-B-proof-routing-amendment.md)
**Important:** this package is qualification/evidence-only. It does not authorize Product implementation, does not constitute C-018, does not authorize merge of PR #40, and does not authorize Package C–E by inheritance.

## 1. Decision in one sentence

Package B qualifies the current Product Agent and Builder↔PAR realization by **property-sliced, deterministic-first proof** rather than by replaying historical probes literally: `B0 Admission/Compilation → BT-1..BT-5 proportional technology probes → Architecture-Lead adjudication`; the 52 `B1-01..B4-18` obligations remain durable downstream proof inventory, not literal pre-C-018 execution, and `B5` remains not admitted. Historical mechanisms are compiled away before tests, Context7 + the installed Mastra skill are mandatory execution inputs, exact pinned source/runtime behavior remains deciding evidence, and any material contradiction stops execution instead of being hidden by harness redesign.

The B1→B4 sections below remain authoritative as proof inventory but are partially superseded **only for execution timing** by the current proof-routing amendment. They do not authorize literal B1→B4 execution in this package stage.

---

## 2. Why Package B is structured this way

Current accepted architecture already decides the target shape:

```text
exact active Release
→ RuntimeAgentProjection
→ ParMastra role instance
→ direct Mastra Agent
→ bounded ToolProjection
→ Conexus owners / Capability Gateway
```

and:

```text
BuilderMastra != ParMastra
mastra_builder != mastra_par
role-local PubSub/runtime namespace
same-process only if qualified
RequestContext = rebuild + REPLACE WHOLE
F5 control != Operational Telemetry
```

What remains unknown is whether the **exact pinned Mastra/runtime realization** can satisfy those properties without hidden authority leakage, mutable cross-role bleed, unsafe resume/retry behavior, unstable schedule occurrence identity or control/telemetry inversion.

The root failure class is:

```text
historical criterion
+
current framework capability
+
long architecture history
→ harness accidentally tests an old mechanism
OR
→ framework convenience becomes authority
OR
→ one large end-to-end probe fails without locating the violated boundary
```

Target invariant:

> **Package B must produce falsifiable, version-bound Evidence for each current load-bearing Product-Agent/cross-runtime property while preserving Conexus owner authority and without introducing Product implementation or speculative infrastructure.**

---

## 3. Execution actors and authority split

The operator ratifies this working split:

```text
Operator
→ ratifies material decisions / reopen / closure

Architecture Lead / ChatGPT
→ reads current authority
→ designs proof contracts
→ adjudicates Evidence
→ controls scope and material findings

Codex
→ inspects exact repo/package source
→ implements qualification harness/tests
→ runs RED/GREEN/probes
→ debugs mechanical/runtime failures
→ records reproducible Evidence

Fable
→ independent bounded challenger after a reviewable Package-B result
→ especially challenges false PASS, false split trigger, stale-mechanism revival and proof gaps
```

Rules:

- Codex may iterate freely inside the admitted proof contract; it does not decide Product architecture because a test is difficult.
- Fable output is Evidence, not requirement/architecture authority.
- A material finding returns to the Decision Loop and the smallest implicated authority only.
- No actor may merge PR #40 without explicit operator authorization.

---

## 4. Required execution protocol — Method + standards + Mastra skill + Context7

Before any B0–B5 Mastra-specific edit or probe, the executing actor MUST follow `AGENTS.md` and this sequence:

```text
DevelopmentConexus Engineering Method
→ docs/DOCUMENTATION-MAP.md
→ docs/conexus/current/README.md
→ current Product/Architecture/Reconciliation projection as needed
→ Phase-3 LEDGER + exact Package-B semantic homes
→ installed Mastra skill
→ Context7 current Mastra documentation
→ exact pinned package source/config/lock
→ proof design
→ harness/probe
→ Evidence
→ adjudication
```

### 4.1 Mastra skill is mandatory execution guidance

For any Mastra-specific planning, source inspection, harness construction or API use:

```text
load installed Mastra skill first
```

If the executing environment cannot access the Mastra skill:

```text
STOP / MISSING EXECUTION PREREQUISITE
-X-> guess API from memory
-X-> silently substitute generic agent-framework knowledge
```

The skill guides execution mechanics. It does not override accepted Conexus Product/architecture authority.

### 4.2 Context7 is mandatory current-doc evidence

Current resolved Mastra library for this admission is:

```text
Context7 library id = /mastra-ai/mastra
retrieval date      = 2026-08-18
```

Context7 must be queried by **one exact concept at a time** when a Mastra API/behavior is needed. It is preferred over remembered APIs or generic web snippets for current library documentation.

However:

```text
Context7 current docs
!= exact Package-B version behavior by itself
```

If Context7 documents behavior from a newer branch/release than the qualification pin, the exact locked source and/or real bounded probe decides the version-specific claim.

### 4.3 External Evidence observed at admission

Current Context7 `/mastra-ai/mastra` evidence relevant to Package B shows, subject to exact-version verification in B0:

```text
Agent config accepts runtime-resolved DynamicArgument fields using RequestContext
Agent requestContext can be passed per execution
Agent editor configuration exposes a way to disable editor overrides in current docs
thread/resource memory scopes are materially different
resource-scoped memory may span multiple threads under the same resource
shared storage/PubSub backends are intentionally capable of sharing durable runtime state
workflow snapshots persist requestContext/state for resume
some workflow retry/guard maps are process-local rather than exactly-once durable state
```

Adjudication:

```text
useful API/source lead            = YES
current external Evidence         = YES
Conexus authority                 = NO
proof of exact @mastra/core pin   = NO until B0 source/probe confirmation
proof of exactly-once effect      = NO; Gateway remains replay authority
```

### 4.4 Method application is non-optional

Every material Package-B question must retain:

```text
Evidence
→ Known / Inferred / Unknown / Deferred
→ Root Cause
→ Target Invariant
→ Constraints
→ credible alternatives when a failure fires
→ essential vs accidental complexity
→ YAGNI/future seam
→ authority/mechanism separation
→ proof/falsification strategy
→ adversarial challenge
→ outcome
→ reopen trigger
```

Do not duplicate the organizational Method into harness docs. Cite it and operationalize only the task-specific obligations.

---

## 5. Package-B admission laws

### 5.1 Exact identity

Before the first executable criterion, B0 freezes:

```text
current repo HEAD
Q0 revision/commit
Package-B spec revision/commit
Node/npm identity
exact direct @mastra/* pins
exact transitive lock closure + integrity
lockfile digest
PostgreSQL identity when storage behavior matters
any cache/PubSub provider identity actually used
model/provider identity only if B5 is admitted
```

`latest`, floating aliases or unrecorded transitive ranges cannot be deciding identities.

### 5.2 Historical-probe compilation

No P1–P30 or earlier Package-B criterion is executed literally before compilation.

Required transformation:

```text
historical criterion
→ protected invariant
→ current accepted semantic home
→ current mechanism
→ DELETE obsolete mechanism wording
→ REPLACE with falsifiable current property
→ classify B1/B2/B3/B4/E/reopen
→ pin exact source/config
→ execute only the compiled criterion
```

A deleted historical mechanism cannot return through a fixture.

### 5.3 Proof before implementation

For every current criterion:

```text
claim
→ falsifying negative fixture
→ expected Evidence
→ RED/control-firing proof when meaningful
→ minimal GREEN realization
→ rerun
→ exact result
```

A GREEN-only test that never demonstrates the protected control can fail is insufficient when a meaningful negative is available.

### 5.4 Deterministic-first

```text
local deterministic/source/storage/process proof sufficient
→ do not spend provider/model calls

remaining property inherently requires native provider/model behavior
→ admit B5 narrowly
```

Mocks/fakes may prove local contract/control behavior; they do not prove a real integration property they cannot exercise.

---

# 6. B0 — Admission + Criterion Compilation

**State:** EXECUTION COMPLETE / FINAL ARCHITECTURE-LEAD ADJUDICATION PASS.

B0 performs no Product implementation and no billable Product-Agent execution.

Required outputs:

```text
1. fresh repo/PR/HEAD revalidation
2. exact Package-B lock/source identity
3. Mastra skill load record
4. Context7 concept/source record
5. exact pinned-source API/behavior map
6. historical→current criterion compilation matrix
7. deterministic vs native/live classification
8. negative-fixture/falsification map
9. expected Evidence/provenance map
10. explicit B5 necessity = NO by default
```

B0 cannot silently change architecture. If exact source makes a current assumption impossible, record a Finding and stop before constructing a compensating architecture.

B0 is complete. The approved next execution is only `BT-1..BT-5`; literal B1→B4 execution remains superseded for this pre-C-018 stage.

---

# 7. B1 — Exact Projection + Conversation

**Purpose:** qualify the direct Product-Agent base and `CX-AGENT-MASTRA-01` projection/memory subset.

Current protected properties:

```text
B1-01 exact Release facts produce one exact RuntimeAgentProjection
B1-02 Product execution invokes the exact direct Mastra Agent instance; no mutable latest resolution
B1-03 Stored Agent / Editor / version override paths cannot change governed Product execution
B1-04 AgentRun owner admission exists before any model/tool execution path is allowed
B1-05 in-flight/old AgentRun remains pinned when a newer Release becomes current
B1-06 ConversationId remains Conexus identity and maps to a scoped Mastra thread/resource substrate
B1-07 Workspace/Project/Agent/memory-class/subject dimensions cannot alias across memory scope
B1-08 resource-scoped/thread-scoped negative fixtures demonstrate leakage if keys are insufficient, then prove corrected isolation
B1-09 Product baseline carries Conversation history only when a Conversation exists; OM/Semantic Recall/Extractors/extra Working Memory remain OFF unless separately admitted
B1-10 scheduled AgentRun is threadless by default unless an exact Product consumer says otherwise
```

Version-specific configuration such as `editor:false` is a realization candidate only after B0 confirms the exact pinned source/API. The invariant is closure of override authority, not loyalty to one option spelling.

B1 does not qualify model economics, advanced memory quality or Product UI.

---

# 8. B2 — Suspend / Restart / Approval / Effect

**Purpose:** qualify guarded continuation across real process loss without moving approval/effect authority into Mastra.

Current protected properties:

```text
B2-01 owner proposal + exact ApprovalRequest commit precedes runtime suspension/checkpoint
B2-02 owner wait without runtime snapshot is an honest recovery case; runtime wait without owner authority is rejected
B2-03 process may disappear after suspend; a fresh process reconstructs the exact old pinned RuntimeAgentProjection
B2-04 resume re-enters current PAR guards before renewed model/tool/effect authority
B2-05 ALLOW_ONCE re-presents the exact sealed proposal subject; changed args/proposal identity fail closed
B2-06 DENY / EXPIRED / STALE resume the same AgentRun as typed non-effect outcome; they do not fabricate effect success or force a new terminal state
B2-07 repeated resume/retry cannot create duplicate physical effect authority; Gateway identity/dedupe remains sovereign
B2-08 same idempotency identity + different subject fails closed
B2-09 OUTCOME_UNKNOWN / SENT_NO_RESPONSE never becomes blind resend
B2-10 plain active Agent crash behavior is characterized without inventing owner terminal truth; any supported re-drive re-enters PAR guards
B2-11 CANCELLED followed by late runtime completion/tool/snapshot activity cannot regain authority or terminalize another state
B2-12 a domain AgentRun may span fresh process/trace segments while retaining the same durable owner identity
```

A native Mastra approve/decline convenience API is admissible only if it preserves these exact semantics. Generic suspend/resume adaptation remains preferred over changing ApprovalRequest authority.

---

# 9. B3 — Schedule

**Purpose:** qualify Mastra schedule mechanics only as a derived timer behind PAR guarded ingress.

Current protected properties:

```text
B3-01 AgentTrigger remains enabled/revision/cron/timezone authority; runtime schedule row remains mechanics
B3-02 schedule projection contains no Product prompt, ReleaseRef, agent/model/tool composition, approval policy or business effect identity
B3-03 schedule wake never executes Product Agent directly; it submits guarded PAR fire ingress first
B3-04 stable intended-slot identity exists before AgentRun admission
B3-05 duplicate/redelivery of one logical occurrence presents the same logical occurrence identity
B3-06 owner cursor consumption + AgentRun admission are atomic with current trigger/revision validation
B3-07 overlap with a non-terminal trigger-origin run consumes the occurrence as SKIPPED and creates no backlog/catch-up
B3-08 disable × fire both commit orders produce exactly the current 3G/3H result
B3-09 trigger update/revision × stale fire cannot admit under the old revision after current authority changes
B3-10 stale/corrupt runtime schedule semantics invalid under current cron/timezone are rejected owner-side
B3-11 consumed occurrence followed by process restart/redelivery cannot become a hidden second AgentRun
B3-12 Product-Agent SCHEDULE semantics remain distinct from MAR one-catch-up-after-downtime semantics
```

Package B must not reuse Package-D/MAR catch-up behavior as Product-Agent schedule authority.

---

# 10. B4 — Builder↔PAR Isolation + RequestContext + F5

**Purpose:** qualify `CX-RUNTIME-ISOLATION-01` for the enabled current F1 path and decide same-process admissibility.

Current load-bearing criteria compiled from 3H-03:

```text
B4-01 BuilderMastra uses Builder role persistence; ParMastra uses PAR role persistence
B4-02 Builder registry cannot resolve PAR Product Agent/schedule/memory and vice versa
B4-03 Builder coding/shell/E2B tools are absent from PAR Product tool surface
B4-04 Agent/Memory/PubSub/mutable runtime objects are distinct across roles
B4-05 enabled process-global Mastra facilities cannot influence the other role execution
B4-06 distinct same-process PubSub instances keep thread/suspend/signal state disjoint
B4-07 intentionally shared PubSub negative fixture demonstrates the failure/control and is rejected by qualification/wiring guard
B4-08 module-default PubSub canary receives zero governed Builder/PAR events
B4-09 shared external broker, only if actually used, has distinct role namespace/keyPrefix and no cross-role delivery
B4-10 governed Builder/PAR work cannot execute through standalone/ephemeral fallback
B4-11 role instance without explicit required persistent storage refuses governed work
B4-12 poisoned restored RequestContext is replaced whole; unknown stale keys disappear
B4-13 stale RequestContext cannot select current permission/tool/model/binding/approval authority
B4-14 F5 callback target is bound by owner dispatch closure/opaque handle; producer payload ID is cross-check only
B4-15 payload target mismatch is refused and cannot terminalize another run
B4-16 duplicate F5 callbacks remain owner-idempotent/write-once safe
B4-17 telemetry complete without valid F5 proposal cannot set owner terminal truth
B4-18 valid F5 proposal without telemetry still reaches owner truth
```

### 10.1 Criteria compiled out of Package B

The following historical 3H-03 families are preserved but routed to **Package E — Deciding Evidence / observability** rather than duplicated in B:

```text
forged owner IDs / trace metadata and producer provenance
OTel baggage leakage/correlation policy
shared-global-OTel per-signal role attribution
telemetry-exporter degradation behavior
required verification evidence missing/sampled → NOT_PROVEN
app-under-test forged authority fields remain GUEST_OBSERVED
E2B provider-pull / OTLP-push deciding evidence composition
high-cardinality metric-dimension controls
MastraStorageExporter / OBS cross-schema non-authority proof
```

This routing does not delete the obligations. It prevents Package B from becoming a second Package E.

### 10.2 Historical P30 is a reopen trigger, not an always-on test

```text
enable a previously-deferred process-global Mastra capability
→ re-run cross-role isolation qualification before same-process admission
```

Examples include future Product-Agent OM, Durable Agent machinery or another process-global enabled feature. Do not instantiate deferred machinery just to execute P30 now.

---

# 11. B4 same-process verdict

`CX-RUNTIME-ISOLATION-01` does not end in a generic boolean only.

Allowed adjudicated states:

```text
QUALIFIED_SAME_PROCESS
PROCESS_SPLIT_REQUIRED
NOT_PROVEN
```

`PROCESS_SPLIT_REQUIRED` is valid only when Evidence shows all three:

```text
reachable cross-role mutable bleed
+
load-bearing enabled F1 capability
+
no smallest reliable instance/role partition or fence
```

If that trigger fires:

```text
same-process realization = rejected for the qualified topology
→ bounded 3J process-split realization trigger fires
→ no automatic RuntimeBus/EventBus/queue/outbox/microservice architecture
→ narrow transport remains preferred
```

A difficult test, global OTel SDK, immutable singleton or mere same-process co-location does not justify split.

---

# 12. B5 — Native/provider-live confirmation necessity gate

**Default:** `NOT ADMITTED`.

B5 is opened only when an otherwise-complete B1–B4 record shows one load-bearing property remains `NOT_PROVEN` because deterministic/source/local-runtime evidence cannot credibly exercise it.

Before any billable/model-provider call B5 must freeze:

```text
exact unresolved property
why deterministic proof is insufficient
provider
requested + resolved model identity
model parameters/reasoning controls
adapter/SDK path
maximum number of calls
pricing profile/ref
expected deciding Evidence
stop condition
```

No opportunistic expansion is allowed.

```text
"we are already live"
-X-> test advanced memory
-X-> test OM
-X-> benchmark models
-X-> test Product UI
-X-> test Browser/MCP/A2A/multi-agent
```

---

# 13. Package-B verdicts

## 13.1 `CX-AGENT-MASTRA-01`

Allowed final states:

```text
QUALIFIED
QUALIFIED_WITH_LIMITATION
NOT_PROVEN
FAIL_REALIZATION
```

## 13.2 `CX-RUNTIME-ISOLATION-01`

Allowed final states:

```text
QUALIFIED_SAME_PROCESS
PROCESS_SPLIT_REQUIRED
NOT_PROVEN
```

Package B closes only when every current load-bearing criterion is either proven for the exact qualified topology or explicitly adjudicated under an existing authorized limitation/realization trigger. Missing Evidence never becomes PASS.

---

# 14. Evidence contract

Every executable criterion records at minimum:

```text
criterion ID
protected invariant
current semantic authority
repo HEAD
Package-B spec/admission identity
lock digest + relevant package/source identity
Mastra skill load evidence available to executor
Context7 library/concept used when external docs informed the probe
exact fixture/config
negative/control-firing result
positive result
commands/process/restart sequence
PostgreSQL/runtime/provider identity when material
observed output/artifact digest where applicable
Known / Unknown / limitation
verdict
```

Evidence generated by a fake may be deciding only for the local property the fake actually exercises. It cannot be promoted to real-provider/runtime proof by wording.

---

# 15. Stop / escalation law

For each failed criterion:

```text
config/API/version-local defect
→ smallest correction + RED/GREEN reprobe

substrate limitation behind an already accepted seam
→ smallest adapter/guard or existing split trigger

missing/ambiguous Evidence
→ NOT_PROVEN

material invariant/authority contradiction
→ STOP
→ Material Finding
→ reopen exact implicated decision only
```

Examples:

```text
direct Agent override channel can be closed by exact config
→ bounded correction

native approval convenience cannot preserve sealed proposal
→ generic suspend/resume adapter; ApprovalRequest authority unchanged

Mastra global mutable state bleeds Builder↔PAR and cannot be fenced
→ PROCESS_SPLIT_REQUIRED trigger

scheduler does not expose stable logical slot identity
→ smallest adapter/owner derivation only if correctness can be proven

runtime retry repeats a Gateway effect without re-entry
→ FAIL_REALIZATION / material correction; never claim exactly-once from framework
```

---

# 16. Explicit Package-B non-goals

Package B does **not** build or qualify:

```text
Product UI / Agent Builder UI
first Sankhya vertical
real business effect
Product implementation
full Package-C model-spend enforcement
MAR / Package-D one-catch-up managed jobs
full Package-E deciding observability/provenance
Brain Discovery / AnalyticQuery
Product Agent Observational Memory
Semantic Recall / Memory Extractors / advanced Working Memory
EVENT triggers
Durable Agent reconnect-to-same-stream
Agent-as-tool / subagents / networks
Browser / source / workspace Product Agent access
MCP / A2A edge clients
generic workflow/automation/scheduler domain
RuntimeBus / EventBus / generic outbox / universal handoff protocol
C-018 ratification
PR merge
```

---

# 17. Independent review gate

After Codex completes the admitted Package-B execution and the Architecture Lead adjudicates the Evidence, run **one independent bounded Fable review** before final Package-B closure.

Fable must attack at least:

```text
false PASS from fake/mock scope
historical mechanism revived by fixture
Context7/current-doc behavior mistaken for exact pinned-version behavior
Stored/Editor/latest override path still reachable
memory/resource key aliasing
resume after process loss bypassing current owner guards
sealed proposal mutation / duplicate effect
schedule redelivery/overlap/revision race hole
same-process false confidence or false split trigger
RequestContext merge residue
F5 reconstructed from telemetry
Package-E obligations accidentally deleted rather than routed
new abstraction smuggled in as a test helper
```

If `PROCESS_SPLIT_REQUIRED` is proposed, the independent review must explicitly challenge whether split is truly required or whether the harness/config is wrong.

Reviewer findings remain Evidence and are adjudicated against current authority before correction.

---

# 18. Reopen triggers

Reopen only the smallest implicated authority if Evidence shows, for example:

```text
exact direct Agent realization cannot preserve immutable Release-pinned Product execution
selective direct-Agent suspension cannot preserve guarded continuation without changing Product semantics
stable schedule intended-slot identity cannot be established before AgentRun admission
current memory/thread substrate cannot satisfy required scope isolation
current enabled Mastra process-global state cannot be partitioned across Builder/PAR
RequestContext cannot be replaced/fenced sufficiently to block stale authority
F5 cannot remain owner-bound without a new durable transport meaning
```

Do not reopen for framework preference, a newer Mastra release existing, microservice aesthetics or speculative future features.

---

# 19. Operator-ratified next action

```text
BT-1 → BT-2 → BT-3 → BT-4 → BT-5
```

The executor must first revalidate the current PR/branch HEAD and read `AGENTS.md`; [the proof-routing amendment](3L-B-proof-routing-amendment.md) is current execution authority, and this parent remains the durable proof inventory.

Do not execute `B1-01..B4-18` literally. Do not auto-admit B5 or any next package after the five proportional technology probes.
