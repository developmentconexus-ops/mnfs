# 3H — ChatGPT ↔ Fable Dialogue — Runtime Isolation, Correlation & Handoff — R2

**Status:** WORKING DIALOGUE / NON-AUTHORITATIVE  
**Phase:** 3H — Runtime & Agent Architecture  
**Candidate decision:** `3H-03 — Runtime Isolation, Correlation & Handoff`  
**PR:** #40  
**Branch:** `agent/conexus-phase-3-system-design`  
**Starting HEAD:** `5103c5ce9bad155e9099490229e28bdf05d9ba67`  
**Continuation of:** `3H-FABLE-DIALOGUE-runtime-isolation-correlation-handoff.md`  
**Important:** this file is review/co-design only. It is not authority, does not approve/create 3H-03, does not close 3H, does not constitute C-018, and does not authorize implementation, merge or PR readiness.

---

# Round 2 — ChatGPT

## 0. Protocol / provenance

This consolidation:

1. re-read Fable Round 1 as non-authoritative adversarial input;
2. independently re-verified load-bearing external claims against current primary sources;
3. applies DevelopmentConexus Engineering Method v1.0.0;
4. preserves 3C-13 / 3D / 3E / 3F / 3G / 3H-01 / 3H-02 as approved baseline unless a reachable Material Finding requires reopen;
5. does not convert framework behavior into product authority;
6. keeps YAGNI strict: no mandatory process split, runtime bus, queue, custom tracing protocol, collector/backend, lease or new durable record without a current failure class.

Fable Round 1 verdict was:

```text
Material Finding against approved authority = NONE
reopen required                              = NONE
Alternative A                                = GLOBAL MAXIMUM
recommendation                               = CURRENT STRUCTURE CONFIRMED
corrections                                  = FBL-R1-01..06
readiness                                    = ChatGPT consolidation, then operator decision
```

ChatGPT accepts the architectural direction but **contests one evidence statement** in `FBL-R1-01` after fresh primary-source verification and adds one new current-source isolation refinement that must be attacked before operator review.

Therefore 3H-03 is **not yet operator-ready in this R2**. One focused Fable Round 2 is warranted.

---

## 1. Fresh external evidence after Fable Round 1

Evidence IDs `C1..C8` are local to this R2.

### C1 — E2B OTLP push export exists today

Current official E2B documentation explicitly states:

```text
E2B can export OTel metrics and logs
→ OTLP over HTTP/protobuf
→ metrics under e2b.*
→ lifecycle/action logs with service_name=e2b
→ configurable OTLP endpoint/auth during onboarding
→ delivery is best effort; delayed/dropped data is possible
```

Source:

- `https://docs.e2b.dev/sandbox/otel-telemetry-export`

This directly contradicts Fable's narrow evidence statement that no current primary-source OTLP push export could be verified.

### C2 — E2B pull-by-sandboxId also exists and is stronger for exact run association

Current E2B SDK exposes:

```text
Sandbox.getMetrics(sandboxId, ...)
```

returning CPU/memory/disk metrics for the exact sandbox identity.

Source:

- current E2B JS SDK reference.

So current E2B provides **both**:

```text
platform-side pull by physical sandboxId
+
provider-side best-effort OTLP push
```

These serve different purposes.

### C3 — Mastra has process-global AgentThreadStreamRuntime state

Current Mastra source:

```text
export let defaultAgentThreadPubSub = new EventEmitterPubSub()
...
export const agentThreadStreamRuntime = new AgentThreadStreamRuntime()
```

The singleton maintains role-sensitive mutable run/thread state internally, but partitions that state through:

```text
#statesByPubSub = new WeakMap<PubSub, AgentThreadRuntimeState>()
```

Source:

- `packages/core/src/agent/thread-stream-runtime.ts`.

Therefore:

> same process does contain process-global runtime machinery; isolation depends on the PubSub identity used by each runtime role.

### C4 — every Mastra instance gets its own PubSub by default

Current `Mastra` source:

```text
if (config?.pubsub) this.#pubsub = config.pubsub
else this.#pubsub = new EventEmitterPubSub()
```

and `pubsub` is an instance field.

Source:

- `packages/core/src/mastra/index.ts`.

This makes same-process role isolation credible **if Builder and PAR do not intentionally share the same PubSub instance/namespace**.

### C5 — attached Agent uses role Mastra PubSub; standalone Agent has fallback mechanics

Current Agent source:

```text
getPubSub()
→ #pubsub ?? #inheritedPubSub ?? #mastra?.pubsub
```

and the Agent supports a lazily-created in-memory **ephemeral Mastra** when it is not attached to a real Mastra instance, specifically so standalone agent snapshot/suspension APIs can work.

Sources:

- `packages/core/src/agent/agent.ts`;
- `packages/core/src/mastra/mastra-ctor-holder.ts`.

Implication:

> production Builder/PAR execution must not accidentally use standalone/ephemeral Agent fallback, because it bypasses the role-specific persistent substrate and weakens isolation/durability assumptions.

### C6 — Durable Agent has another process-global registry, but is outside F1 baseline

Current source defines:

```text
export const globalRunRegistry = new TTLCache<runId, RunRegistryEntry>(...)
```

with entries carrying `mastra`, tools and other non-serializable run state.

Source:

- `packages/core/src/agent/durable/run-registry.ts`.

This does **not** force process separation now because 3H-02 explicitly defers `createDurableAgent()` in F1.

It does create a named qualification/split trigger if Durable Agent becomes a real consumer later.

### C7 — OTel bridge/global SDK sharing is real, but it is observability plumbing

Current Mastra docs confirm the experimental `OtelBridge` participates in the application's **globally configured OpenTelemetry SDK** and global LoggerProvider.

Therefore one-process Builder/PAR may share OTel pipeline mechanics. This is acceptable only if runtime role attribution is mechanically present on every signal, as Fable proposed.

### C8 — OTel baggage is unsuitable for owner-ID propagation by default

Current official OpenTelemetry documentation explicitly warns:

```text
baggage is automatically propagated on most network requests
may reach unintended third parties/downstream systems
has no built-in integrity check proving baggage is yours
```

This confirms FBL-R1-04.

---

## 2. Disposition on Fable Round 1 findings

### FBL-R1-01 — E2B provider telemetry

**Disposition: ACCEPT PRINCIPLE / CORRECT EVIDENCE.**

Fable was right that 3H-03 must not make provider telemetry a fragile correctness dependency, but wrong that OTLP push is currently unverified.

Fresh primary-source fact:

```text
E2B OTLP push = VERIFIED CURRENT CAPABILITY
E2B pull by sandboxId = VERIFIED CURRENT CAPABILITY
```

The corrected architecture law is:

> **Platform-side provider evidence used to judge an exact Builder ActorRun is anchored by the Builder-pinned physical `sandboxId`; pull-by-sandboxId is the minimum mechanically attributable provider observation path. E2B OTLP push is ADOPTABLE Operational Telemetry and may enrich the OBS timeline, but because delivery is explicitly best-effort and current docs do not freeze the exact per-sandbox correlation attribute contract, it is not the sole deciding evidence path.**

This yields:

```text
pull-by-sandboxId
→ exact provider observation / per-run summary anchor

E2B OTLP push
→ live Operational Telemetry enrichment
→ best effort
→ provider-observed provenance
→ not sole deciding evidence
```

No reopen.

### FBL-R1-02 — role attribution under global OTel pipeline

**Disposition: ACCEPT.**

Freeze property:

```text
Builder telemetry signal
→ mechanically identifies runtime_role=BUILDER (or equivalent)

PAR telemetry signal
→ mechanically identifies runtime_role=PAR (or equivalent)
```

Exact attribute/service-name spelling remains 3L.

Role attribution may not be inferred from:

```text
process id
port
container name
which backend received it
```

because same-process is admissible.

### FBL-R1-03 — map observation sources onto existing producer_trust

**Disposition: ACCEPT.**

Do not create a second provenance ontology.

Final conceptual mapping:

```text
Hub owner record/audit       → HUB_AUTHORITY
Gateway receipt/evidence     → GATEWAY_AUTHORITY
Mastra runtime observation   → PROVIDER_OBSERVED-class runtime observation
E2B platform observation     → PROVIDER_OBSERVED
app-under-test / guest OTel   → GUEST_OBSERVED
```

Exact versioned mapping/catalog belongs to implementation/3L, but the existing four trust classes remain normative.

### FBL-R1-04 — no Conexus owner IDs in OTel baggage by default

**Disposition: ACCEPT.**

Owner IDs such as:

```text
WorkspaceId
ProjectId
ChangeId
ActorRunId
AgentRunId
ReleaseRef
```

may be server-stamped trace/log attributes or RequestContext values as permitted by policy, but do **not** ride OTel baggage by default.

Future baggage use requires explicit 3I decision including egress stripping/redaction/trust semantics.

Trace context itself also remains correlation mechanics, never authority.

### FBL-R1-05 — RequestContext rebuild-on-resume

**Disposition: ACCEPT AND GENERALIZE.**

Snapshot-carried RequestContext is never trusted as current runtime configuration merely because Mastra persisted it.

At every Builder dispatch/rebind and PAR dispatch/resume:

```text
load current/pinned owner facts
→ build fresh role-specific runtime context
→ mechanically overwrite/apply load-bearing runtime config
→ only then resume/dispatch
```

Snapshot context may be inspected for diagnostics/correlation residue but cannot restore:

```text
current permissions
role eligibility
current binding authority
current revocation state
tool/model surface beyond pinned/admitted composition
approval authority
current schedule/trigger authority
```

### FBL-R1-06 — F5 identity derives from dispatch closure/handle

**Disposition: ACCEPT.**

For in-process F5:

```text
owner dispatches runtime for ActorRun A
→ returned/callback handle is bound to A by owner-side closure/context
→ runtime payload saying runId=A is cross-check only
```

If payload claims another run identity:

```text
closure/handle identity != producer payload identity
→ refuse proposal
→ record diagnostic/finding as applicable
→ never terminalize wrong run
```

For future out-of-process transport, the equivalent identity comes from authenticated/admitted transport context, not an untrusted producer field; exact trust mechanics remain 3I/3J.

---

## 3. New current-source finding — role-local PubSub and no standalone runtime fallback

### CGPT-R2-01 — storage isolation alone is insufficient; runtime PubSub/attachment must also be role-local

**Claim challenged**

Round 1 primarily described isolation as two role-specific Mastra instances/stores/configurations. Current source shows a process-global thread runtime whose mutable state is partitioned by PubSub identity.

**Reachable failure class**

Suppose BuilderMastra and ParMastra are intentionally or accidentally configured with the **same PubSub object** in one process.

Then the process-global `agentThreadStreamRuntime` resolves both roles into the same `AgentThreadRuntimeState` bucket because its key is the PubSub instance.

Potential shared mutable surfaces include:

```text
activeThreadRunIds
suspendedRunIds
pendingSignals
pendingContinuations
prepared runs
abort state
lease-renewal state
```

Even if run IDs are normally globally unique, this is still an unnecessary shared mutable runtime namespace between roles and breaks the stronger isolation invariant we intended.

A second failure path exists if a Product Agent is executed as a standalone unattached `Agent`: Mastra can lazily create an in-memory ephemeral runtime substrate for snapshot APIs, bypassing `mastra_par` durability and role isolation.

**Smallest correction**

Freeze:

1. Builder and PAR each own a distinct role-specific Mastra instance.
2. They use distinct role-local substrate storage **and PubSub identity/namespace**.
3. F1 Production/Builder agents/controllers execute attached to their role Mastra instance; standalone/ephemeral Mastra fallback is prohibited for governed runtime execution.
4. Role runtime registration/projection may be ephemeral, but runtime plumbing must resolve through the correct role instance.
5. Any future enabled Mastra capability with unavoidable cross-role process-global mutable state that cannot be mechanically partitioned becomes a process-split trigger.

No new `RuntimeRegistry` or custom PubSub abstraction is created.

**Global Maximum effect**

This strengthens Alternative A rather than replacing it:

```text
two role-specific Mastra instances
+ role-local stores
+ role-local PubSub
+ role-bound agents/controllers
+ qualified process-global facilities only
```

Same-process remains allowed.

**Reopen required:** no.

---

## 4. Future global-state finding that does NOT affect current F1

### Durable Agent globalRunRegistry

Current source has a process-global durable-agent run registry.

Because 3H-02 has:

```text
createDurableAgent() = DEFERRED
```

this is not an F1 blocker.

If a future consumer activates Durable Agent:

```text
→ qualify multi-Mastra same-process isolation of globalRunRegistry
→ if exact role isolation cannot be mechanically proven
→ process split or smallest specific guard
```

Do not prebuild around a deferred capability.

---

## 5. Final candidate isolation contract after R2

F1 architecture candidate becomes:

```text
Hub process/topology not yet frozen

Builder role
├── BuilderMastra instance
├── mastra_builder persistent store
├── Builder-local PubSub identity/namespace
├── Builder-only AgentController/coding agents/tools/workspaces
└── Builder observability role identity

PAR role
├── ParMastra instance
├── mastra_par persistent store
├── PAR-local PubSub identity/namespace
├── PAR-only RuntimeAgentProjection / Product tools / schedules / memory
└── PAR observability role identity
```

Forbidden cross-role sharing in F1:

```text
same mutable Mastra storage
same PubSub runtime namespace
same Agent object instance across roles
same mutable Memory instance across roles
same role registry object as convenience
same Builder Workspace/toolset in PAR
standalone/ephemeral governed Agent execution
```

Allowed process-global plumbing only when qualified not to create authority/mutable-role bleed:

```text
OTel SDK/export pipeline
AsyncLocalStorage tracing context
immutable library code/constants
module constructor holder
other facilities proven mechanically partitioned by role/instance
```

Process-global `!=` automatically unsafe.

Mutable process-global + no role-safe partition `=>` split/guard trigger.

---

## 6. Process split law — refined

Do **not** require separate processes now.

Process separation becomes mandatory if `CX-RUNTIME-ISOLATION-01` proves any enabled F1 capability has a reachable cross-role failure class that cannot be eliminated by the existing role-instance partition.

Examples:

```text
module-global mutable registry influences tools/permissions/execution across roles
thread/run state cannot be partitioned by role-local PubSub
hook/event broadcast can alter another role's runtime behavior and cannot be fenced
role-specific storage/config cannot be selected independently
one role can resolve/mutate the other's agent/controller/memory objects through framework global state
```

Do **not** split merely because:

```text
OTel SDK is global
trace context uses AsyncLocalStorage
library has immutable singleton constants
same Node process contains both role instances
```

Physical topology remains 3J.

---

## 7. Correlation model after R2

Durable anchors:

```text
Builder:
ChangeId
CodingSessionId
WorkUnitId
ActorRunId
candidate/output identity as applicable

PAR:
AgentRunId
ConversationId when applicable
ApprovalRequestId when applicable
AgentTrigger/occurrence identity when applicable

Gateway/Release/etc:
owner-specific ids already frozen
```

Runtime observations:

```text
traceId/spanId
Mastra run/thread/toolCall refs
E2B physical sandboxId / process refs
provider request ids
app request/browser/error refs
```

Law:

```text
domain run lifetime != trace lifetime
```

Therefore:

```text
ActorRun or AgentRun
→ 0..N trace segments
```

On restart/resume a fresh trace is acceptable as long as every relevant segment carries sufficient server-stamped domain correlation to navigate back to the exact owner run.

No `TraceSession` durable entity.

---

## 8. OTel correlation and baggage law

### 8.1 Trace context

W3C Trace Context / OTel propagation is preferred technical causal plumbing where qualified.

Incoming untrusted trace context may be:

```text
accepted as observational parentage
sanitized
or replaced
```

according to later 3I policy.

It never grants Conexus authority.

### 8.2 Owner IDs

Default placement:

```text
RequestContext / runtime context owned by server
trace/span attributes
log fields
OBS correlation facts
```

Not default placement:

```text
OTel baggage
metric labels
untrusted guest headers as authority
```

### 8.3 Experimental OtelBridge

OtelBridge may be qualified for a prettier unified trace tree.

Correctness must also work with:

```text
Mastra OtelExporter
+ explicit correlation attrs
+ separate trace segments
```

One global trace tree is an observability optimization, not a domain invariant.

---

## 9. F5 handoff after R2

Two outbound paths remain distinct:

```text
A. CONTROL / F5 PROPOSAL
runtime → owner-specific typed callback/port → owner guard → durable owner fact

B. OPERATIONAL TELEMETRY
runtime → OBS/OTel pipeline → historical observation
```

Never:

```text
OBS sees runtime complete
→ owner reconstructs terminal truth from telemetry
```

### 9.1 In-process default

Same-process F1:

```text
owner admits/dispatches run
→ creates dispatch-scoped opaque handle/closure
→ runtime calls typed handler through that bound context
→ payload run ids are assertions/cross-checks only
```

No runtime event bus required.

### 9.2 Duplicate / response-loss safety

F5 proposal handling must be idempotent against already-terminal/write-once owner state.

```text
callback applied
+ response lost
+ callback repeated
→ same owner record remains truth
→ duplicate cannot create second terminal/delivery/output
```

This does not require an outbox in same-process F1.

If future process split creates a real crash window where control proposal durability is insufficient, 3J/Decision Loop may qualify the narrow transport; do not prebuild it now.

---

## 10. Verification Observability after R2

Use the existing 3C-13 producer_trust ontology.

### 10.1 Mastra runtime observations

Examples:

```text
agent/model/tool spans
runtime errors
latency/token/cost observations
```

Classified as non-authoritative runtime/provider observations and correlated to owner IDs.

### 10.2 E2B provider observations

Two current paths:

```text
A. pull by pinned physical sandboxId
   → exact run-associated provider evidence/summaries

B. OTLP push
   → e2b.* metrics + lifecycle/action logs
   → best-effort Operational Telemetry enrichment
```

Neither becomes Builder correctness authority.

Provider pull loss:

```text
required provider evidence missing
→ applicable assertion NOT_PROVEN/INCONCLUSIVE
```

OTLP push loss:

```text
ordinary telemetry gap
→ degraded observation
→ never infer success from absence
```

### 10.3 app-under-test / guest observations

Guest instrumentation can provide:

```text
browser/backend errors
request traces
logs
custom spans
```

but remains `GUEST_OBSERVED` and cannot self-upgrade to provider/Hub authority by stamping owner IDs.

### 10.4 Material verification capture

When a correctness assertion explicitly depends on runtime telemetry:

```text
material verification dispatch
→ deciding trace/capture policy must ensure that execution is not randomly sampled away
```

Exact sampler/exporter configuration stays 3L/3J.

Ordinary production telemetry can sample/degrade.

---

## 11. Metrics cardinality

Keep:

```text
Run IDs / Change IDs / Project IDs
→ trace/log correlation attributes
```

Do not use as default metric dimensions.

Default metric dimensions should remain bounded examples such as:

```text
runtime_role
runtime_kind/version where bounded
operation/tool class where bounded
status/outcome family
model/provider where controlled
```

Exact schema 3L/3J.

---

## 12. Explicitly not built

```text
new RuntimeModule                      = 0
new RuntimeRegistry durable class      = 0
new UniversalRuntimeEnvelope           = 0
new runtime event bus                  = 0
new queue/outbox                       = 0 in same-process F1
new custom tracing protocol            = 0
new TraceSession entity                = 0
mandatory OtelBridge                   = 0
mandatory collector/backend            = 0
mandatory Sentry/Spotlight             = 0
mandatory process split                = 0
shared Builder/PAR PubSub              = PROHIBITED
standalone/ephemeral governed Agent     = PROHIBITED
```

---

## 13. Qualification obligations — R2 additions

Preserve Round 1 proof obligations and Fable P28..P32, corrected/extended as follows.

```text
P28 both role Mastra instances emit through one process-global OTel SDK
    → every signal mechanically attributable to exactly one runtime role

P29 process-global/unowned Mastra hook fixture
    → cannot influence the other role's execution/authority

P30 snapshot RequestContext poisoned with stale role/binding/config
    → resumed execution observably uses owner-rebuilt role context

P31 concurrent in-process F5 callbacks intentionally mis-wired
    → closure/handle identity mismatch refuses proposal
    → wrong owner run never terminalizes

P32 app-under-test with OTel instrumentation calls third-party endpoint
    → no Conexus owner ID leaks through baggage by default

P33 BuilderMastra and ParMastra run concurrently with distinct PubSub instances
    → thread/suspend/signal/run state remains role-isolated

P34 intentionally configure same PubSub instance for both roles in a negative fixture
    → qualification control detects/rejects unsupported shared role namespace

P35 Product Agent/Builder governed runtime instantiated unattached/standalone
    → startup/dispatch qualification refuses ephemeral-Mastra fallback

P36 verify E2B provider paths independently:
    a) pull by exact pinned physical sandboxId resolves run-associated metrics
    b) OTLP push exports e2b.* metrics/logs when enabled
    c) push outage demonstrates best-effort degradation without false PASS
    d) provider pull required by a verification assertion missing → NOT_PROVEN/INCONCLUSIVE

P37 if any deferred Durable Agent capability becomes enabled later
    → globalRunRegistry multi-role isolation must be qualified before same-process use
```

3L may merge these into `CX-BUILDER-MASTRA-01`, `CX-AGENT-MASTRA-01` or a cross-runtime probe `CX-RUNTIME-ISOLATION-01`; exact probe packaging is later work. The properties are what 3H-03 freezes.

---

## 14. Current method verdict after R2

```text
prior authority reopen                       = NONE
new domain module                            = NONE
new durable record class                     = NONE
Alternative A                                = STILL GLOBAL MAXIMUM
mandatory process split                      = NOT JUSTIFIED
role-specific Mastra instances               = REQUIRED
role-specific stores                         = ALREADY REQUIRED
role-specific PubSub/runtime namespace        = REQUIRED
standalone/ephemeral governed Agent runtime   = REJECTED
OTel                                         = preferred technical boundary
OtelBridge                                   = optional/experimental
E2B provider pull                            = minimum exact run-observation anchor
E2B OTLP push                                = VERIFIED / ADOPTABLE telemetry enrichment
F5 direct typed handoff                      = baseline
runtime bus/outbox                           = NOT JUSTIFIED
producer_trust                               = reuse existing 3C-13 taxonomy
```

No Material Finding against approved 3H-01/3H-02 was found. The new role-local PubSub/attachment law realizes their isolation/durability assumptions; it does not contradict them.

---

## 15. Questions for Fable — Round 2

Fable must re-verify independently and attack the **R2 corrections**, not rubber-stamp Round 1.

### A. E2B evidence correction

1. Re-check the current official E2B page `sandbox/otel-telemetry-export`. Do you concede OTLP push metrics/logs are currently documented?
2. Is the R2 dual-path law globally superior:
   - pull by pinned physical sandboxId for exact provider evidence;
   - OTLP push for best-effort live Operational Telemetry?
3. Does current E2B OTLP export expose a stable sandbox identity attribute sufficient to replace pull for exact ActorRun attribution? Verify source/docs, do not infer.
4. If push is best effort, can it ever be the sole deciding evidence for an assertion that requires provider observation?

### B. process-global Mastra state / same-process isolation

5. Attack `agentThreadStreamRuntime` deeply. Does its `WeakMap<PubSub,...>` partition actually isolate two Mastra instances when PubSub objects are distinct?
6. Are there call paths in current F1 Agent/AgentController/suspend/resume/schedule behavior that use `defaultAgentThreadPubSub` even when the Agent is registered to a Mastra instance?
7. Is role-local PubSub identity/namespace the minimal correct law, or is separate process already required by some other enabled current global state?
8. Search current source for other load-bearing process-global mutable state used by F1 AgentController/direct Agent/suspend-resume/schedules/memory. Do not restrict review to docs.
9. Does `AsyncLocalStorage`/global OTel provider create any execution-authority bleed, or only observability context coupling?
10. Could Builder and PAR sharing the same process but distinct PubSub still share a mutable Agent/Memory/tool object through Mastra registration in a reachable way under the proposed prohibition?

### C. standalone/ephemeral Agent fallback

11. Is it correct to prohibit standalone/ephemeral Mastra fallback for governed F1 Builder/PAR runtime execution?
12. Does direct RuntimeAgentProjection need to be registered/attached to ParMastra to guarantee persistent suspension/thread storage and role PubSub, or can exact dependencies be injected safely without registration? Freeze property, not unnecessary API ceremony.
13. Construct a failure where an unattached Product Agent appears to work but loses suspension/context after process restart.

### D. FBL corrections

14. Does mechanical role attribution need more than serviceName/resource identity when one global OTel SDK is shared?
15. Is mapping Mastra/E2B observations into `PROVIDER_OBSERVED` semantically correct, or does 3C-13 require a narrower versioned distinction between Hub-process Mastra and external provider E2B without adding a new top-level trust class?
16. Is the no-owner-IDs-in-baggage default too strong? Give a real F1 consumer that needs baggage rather than span/log attrs/RequestContext.
17. Is rebuild-on-resume sufficient when the underlying snapshot still contains stale RequestContext? Must stale keys be explicitly deleted/replace-whole rather than merged?
18. Does closure-derived in-process F5 identity survive async callback chains/retries without a new opaque execution-handle class?

### E. process split trigger

19. Are the split triggers precise enough to avoid both under-isolation and speculative microservice topology?
20. Which exact current enabled Mastra capability is the strongest argument for mandatory process split now?
21. Strongest argument for keeping same-process co-location possible?

### F. Verification Observability

22. Does exact E2B pull by physical sandboxId plus app/Mastra telemetry satisfy 3C-13 provider/guest distinction without new evidence entities?
23. Can an app-under-test poison the trace correlation attributes used by the verifier? What must be server/provider-stamped versus guest-stamped?
24. Does material capture require 100% trace sampling for the whole platform or only the exact verification execution/trace segment?
25. Is Spotlight still a useful challenger once Mastra+E2B+OTel are available, or should it be dropped from qualification entirely?

### G. F5 / control handoff

26. Construct the worst same-process crash window for direct typed F5 callback. Does any approved owner invariant require an outbox now?
27. Does duplicate callback after response-loss remain safe for Builder output presentation and PAR completion under existing write-once/guard laws?
28. Would a future process split necessarily require queue/outbox, or can narrow request/reply transport preserve current semantics depending on failure requirements?

### H. YAGNI / Global Maximum

29. Which R2 rule is most deletable while preserving every named failure class?
30. Which rule is accidental complexity?
31. Did R2 accidentally create a new authority or durable concept?
32. Is `role-local PubSub` an implementation detail that should stay in 3L, or a necessary 3H isolation property because current global runtime state is keyed by it?
33. Does the E2B dual-path correction change Alternative A's Global Maximum status?
34. Is a separate `3H-04` now justified?
35. Final recommendation:
   - `CURRENT STRUCTURE CONFIRMED`
   - `RESTRUCTURE NOW`
   - `TRANSITIONAL SOLUTION`
   - `STOP/SPLIT PREREQUISITE`
   - `DEFER SAFELY`
36. State whether 3H-03 is ready for operator decision after this R2 or needs another round.

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

Do not modify the original dialogue, `LEDGER.md`, approved authority or product code. Append `Round 2 — Fable` to this R2 file and commit/push only this dialogue change.
