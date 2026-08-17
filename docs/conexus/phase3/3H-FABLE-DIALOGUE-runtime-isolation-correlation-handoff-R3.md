# 3H — ChatGPT ↔ Fable Dialogue — Runtime Isolation, Correlation & Handoff — R3

**Status:** FINAL CONSOLIDATION / NON-AUTHORITATIVE  
**Phase:** 3H — Runtime & Agent Architecture  
**Candidate decision:** `3H-03 — Runtime Isolation, Correlation & Handoff`  
**PR:** #40  
**Branch:** `agent/conexus-phase-3-system-design`  
**Starting HEAD:** `17b3fb8946b3ae254175b075dbe90a56c33b4be8`  
**Continuation of:**
- `3H-FABLE-DIALOGUE-runtime-isolation-correlation-handoff.md`
- `3H-FABLE-DIALOGUE-runtime-isolation-correlation-handoff-R2.md`

**Important:** this file is the final ChatGPT consolidation of the adversarial 3H-03 dialogue. It is not authority, does not approve/create 3H-03, does not update `LEDGER.md`, does not close 3H, does not constitute C-018, and does not authorize implementation, merge or PR readiness. Operator ratification remains required.

---

## 0. Protocol / provenance

This consolidation follows the Phase 3 protocol and DevelopmentConexus Engineering Method v1.0.0:

1. approved architecture remains baseline, not dogma;
2. current framework/runtime behavior is evidence, never product authority;
3. reopen requires a reachable Material Finding plus a globally superior correction;
4. current Mastra/E2B/OpenTelemetry/Spotlight behavior was checked against current primary sources where load-bearing;
5. YAGNI applies aggressively;
6. no new module, durable record, runtime bus, queue, generic outbox, custom tracing protocol, mandatory process split, collector/backend, lease or recovery engine is introduced without a current failure class;
7. ChatGPT↔Fable agreement is not operator approval.

Round 1 and Round 2 converged on:

```text
Material Finding against approved authority = NONE
reopen required                              = NONE
Alternative A                                = GLOBAL MAXIMUM
mandatory Builder/PAR process split          = NOT JUSTIFIED
new 3H-04                                    = NOT JUSTIFIED
recommendation                               = CURRENT STRUCTURE CONFIRMED
```

Round 1 produced `FBL-R1-01..06`. Round 2 corrected the E2B evidence record, accepted `CGPT-R2-01`, refined the isolation contract and produced the final sharpenings that are incorporated below.

---

# Round 3 — ChatGPT — Final Consolidation

## 1. Final method verdict

> **CURRENT STRUCTURE CONFIRMED.**

No material Finding requires reopening:

- 3C-13 Observability & Audit;
- 3D-R1 Dependency Architecture;
- 3E-01 / 3E-02 persistence ownership;
- 3F-02 / 3F-R1 F5 and correlation semantics;
- 3G-R1 owner-local behavioral state;
- 3H-01 Builder runtime realization;
- 3H-02 Production Agent runtime realization.

3H-03 closes the remaining **cross-runtime realization** question without creating a new runtime ontology or deployment topology.

### 1.1 Final target invariant

```text
runtime role isolation
+
Conexus-domain-first correlation
+
owner-control F5 handoff
+
Operational Telemetry / Verification Observability

must compose without allowing:

runtime mutable state
trace context
RequestContext
telemetry
provider state
or transport metadata

to become product authority.
```

More precisely:

```text
Conexus owner identity / pins / terminal facts
!=
Mastra runtime identity / state
!=
OTel trace/span identity
!=
E2B provider observation
!=
guest/app telemetry
```

---

## 2. What 3H-03 actually decides

3H-03 owns four realization families:

```text
A. Builder ↔ PAR runtime-role isolation
B. Conexus IDs ↔ runtime / trace / provider correlation
C. runtime → owner F5 handoff
D. Verification Observability cross-layer realization
```

It does **not** decide:

```text
credential custody / egress / principal authorization        → 3I
production process/container placement                        → 3J unless qualification forces split
collector/backend topology                                    → 3J/3L
retention/redaction/PII policy                                → 3I/3J
orphan/lost-run settlement                                    → 3M
trace/debug UX                                                → 3K
exact Mastra/E2B/OTel versions and APIs                       → 3L
architecture-wide verification                                → 3N/3O
```

No separate `3H-04` is justified.

---

# Part A — Runtime Role Isolation

## 3. Two role-specific Mastra runtimes are mandatory logical structure

F1 has two logically distinct Mastra runtime roles:

```text
Builder role
→ BuilderMastra

Production Agent Runtime role
→ ParMastra
```

This is not optional symmetry. The roles have different:

```text
product authority owners
storage durability expectations
tool surfaces
memory/thread populations
runtime objects
lifecycle/recovery semantics
security exposure
verification responsibilities
```

The role boundary must therefore be mechanically observable in runtime configuration and qualification.

---

## 4. Role-specific substrate contract

### 4.1 Builder

```text
BuilderMastra
├── mastra_builder persistent store
├── Builder-local PubSub identity/namespace
├── Builder-only AgentController/coding runtime registrations
├── Builder-only coding/shell/workspace/sandbox tools
├── Builder role observability identity
└── Builder runtime configuration
```

### 4.2 PAR

```text
ParMastra
├── mastra_par persistent store
├── PAR-local PubSub identity/namespace
├── PAR-only RuntimeAgentProjection / Product Agent registrations
├── PAR-only Product/Gateway-wrapped tools
├── PAR conversations/memory/schedule mechanics
├── PAR role observability identity
└── PAR runtime configuration
```

### 4.3 Forbidden cross-role mutable sharing

F1 does not intentionally share:

```text
same mutable Mastra storage
same PubSub runtime namespace
same Agent object instance
same mutable Memory object instance
same mutable workflow/runtime object instance
same Builder Workspace/toolset in PAR
same PAR conversation/schedule state in Builder
standalone/ephemeral governed Agent execution
```

No `RuntimeRegistry` or generic runtime-provider framework is introduced to enforce this.

---

## 5. PubSub is part of the isolation boundary

Current Mastra source includes process-global thread-stream machinery whose mutable runtime state is partitioned by `PubSub` identity.

Therefore role isolation is not satisfied by database separation alone.

### 5.1 Same-process realization

When Builder and PAR share a Node process:

> **BuilderMastra and ParMastra use distinct PubSub object instances.**

The current Mastra constructor naturally supports this because each instance creates its own `EventEmitterPubSub` when a PubSub is not supplied.

### 5.2 Shared external broker realization

If 3J/3L later chooses a common external broker such as Redis Streams:

> distinct client objects alone are insufficient; Builder and PAR must also use distinct role namespaces/topic/key prefixes so broker delivery cannot reunify the runtime roles.

Exact prefix/topic names remain 3L/implementation.

### 5.3 Default PubSub fallback is not allowed to carry governed role traffic

Current Mastra thread-runtime code contains a module-default PubSub fallback.

Qualification must prove:

```text
full Builder + PAR governed exercise
→ zero governed role events land in defaultAgentThreadPubSub
```

A canary/negative probe is sufficient. No custom PubSub framework is required.

---

## 6. Governed execution never falls back to standalone/ephemeral Mastra

Current Mastra can create ephemeral/in-memory runtime plumbing for standalone Agent use. Current Mastra also warns that the default `InMemoryStore` is not durable and is unsafe for production persistence.

That capability is useful for tests/examples but incompatible with the governed F1 runtime contract.

Law:

> **Every governed Builder or PAR execution resolves storage, PubSub, memory/runtime state and observability through the correct role Mastra instance. No governed run may lazily create or depend on standalone/ephemeral Mastra substrate.**

Consequences:

```text
role Mastra persistent storage not explicitly configured
→ governed runtime refuses to serve/start

Product Agent detached from ParMastra and falling back to ephemeral state
→ configuration/qualification failure

Builder coding runtime detached from BuilderMastra role substrate
→ configuration/qualification failure
```

The architecture freezes the property, not a particular registration API call.

---

## 7. Same process is allowed; process split is a qualification escape hatch

Physical process/container separation is **not** required by 3H-03.

Same-process co-location is admissible when enabled F1 capabilities satisfy the role-isolation contract.

```text
one Node process
├── BuilderMastra → builder role substrate
└── ParMastra     → PAR role substrate
```

### 7.1 Mandatory split trigger

Process separation becomes mandatory if `CX-RUNTIME-ISOLATION-01` proves that an **enabled** F1 capability has process-global mutable state that:

1. can influence execution, tool surface, permissions, memory, thread/run state or authority-sensitive behavior across roles; and
2. cannot be mechanically partitioned/fenced by the existing role-specific instance boundary.

Examples of valid triggers:

```text
unpartitionable global mutable run registry
cross-role hook/event behavior that can alter execution
shared thread/suspension/signal state despite role-local PubSub
one role can resolve/mutate another role's runtime objects through framework global state
role-specific persistent substrate cannot be selected independently
```

Not split triggers by themselves:

```text
global OTel SDK
AsyncLocalStorage tracing context
immutable module constants/code
the Mastra constructor holder
same OS process
process-global facility whose mutable state is mechanically partitioned by role
```

Physical split topology remains 3J.

---

## 8. Known current process-global surfaces and disposition

3H-03 explicitly records known current-source findings so future work does not rely on conversation memory.

### Enabled / relevant F1

```text
Mastra module-level evaluation/scorer hook emitter
→ owner-token/fencing exists for normal scorer path
→ qualification must prove no cross-role execution influence

Agent thread-stream runtime machinery
→ process-global runtime surface
→ mutable state partitioned by PubSub identity
→ role-local PubSub is load-bearing

OTel global SDK / LoggerProvider when OtelBridge is used
→ process-global observability plumbing
→ allowed because it does not own execution authority
→ role attribution must exist on every signal
```

### Deferred capability globals

```text
Durable Agent globalRunRegistry
→ createDurableAgent is OFF/deferred in F1
→ future enablement requires same-process multi-role qualification

Observational Memory activeOps registry / current single-process assumptions
→ Observational Memory is OFF/eval-gated in F1
→ future enablement requires multi-role/horizontal qualification
```

The existence of a global variable is not itself a failure. The admission question is whether it produces reachable cross-role mutable behavior for the capability set actually enabled.

---

# Part B — Correlation

## 9. Conexus identities remain durable correlation anchors

### Builder anchors

```text
WorkspaceId / ProjectId as applicable
ChangeId
CodingSessionId
WorkUnitId
ActorRunId
exact candidate/output identity
```

### Production Agent anchors

```text
WorkspaceId / ProjectId
AgentRunId
ConversationId when applicable
ApprovalRequestId when applicable
AgentTrigger / occurrence identity when applicable
Release/composition pins
```

### Other owners

Gateway/Release/etc. continue using their already-approved owner-specific IDs.

These identities remain valid even when every runtime process/trace/provider ref disappears.

---

## 10. Runtime refs remain observations/correlation, not domain identity

Runtime-side identifiers include:

```text
Mastra run/thread/session/toolCall refs
traceId / spanId
provider/model request refs
E2B physical sandboxId
PID/process refs
app request/browser/error refs
```

They can support causal navigation and recovery reasoning but do not replace owner identity or authority.

---

## 11. One domain execution may have zero, one or many traces

Law:

```text
ActorRun lifetime != trace lifetime
AgentRun lifetime != trace lifetime
```

Therefore:

```text
ActorRun / AgentRun
→ 0..N trace segments
```

Examples:

```text
run starts
→ trace T1
→ suspend/process loss
→ later resume
→ trace T2
→ same AgentRun
```

or:

```text
telemetry disabled/degraded
→ zero captured traces
→ domain run still has its owner identity
```

A single eternal trace is not a correctness requirement.

---

## 12. OpenTelemetry is preferred causal plumbing, not correctness infrastructure

F1 prefers standard OpenTelemetry/W3C trace context for technical causal propagation where qualified.

Mastra currently supports:

```text
tracingOptions.traceId
tracingOptions.parentSpanId
trace metadata/tags
RequestContext metadata extraction
OtelExporter
experimental OtelBridge
```

### 12.1 OtelExporter

Vendor-neutral OTLP export is a normal admissible F1 telemetry path.

### 12.2 OtelBridge

The Mastra OtelBridge can preserve native parent-child tracing through a globally configured OTel SDK but is currently experimental.

Therefore:

```text
OtelBridge qualified and useful
→ use it for better unified trace trees

OtelBridge unavailable/drifts/fails qualification
→ multiple trace segments linked by Conexus owner IDs remain correct
```

No custom tracing protocol is built.

---

## 13. Runtime role identity is mandatory on every telemetry signal

Same-process and shared-global-SDK realizations make process/container inference unreliable.

Every runtime telemetry signal must be mechanically attributable to exactly one runtime role:

```text
BUILDER
PAR
```

Exact attribute names are 3L/implementation.

### 13.1 Separate provider/exporter realization

Distinct role service/resource identity may be sufficient when each role has its own provider/exporter context.

### 13.2 Shared global SDK / OtelBridge realization

When Builder and PAR share one global OTel SDK/LoggerProvider:

> per-span/per-log role attributes are mandatory; a process-level OTel resource/serviceName cannot be assumed to distinguish the roles.

Role attribution is a signal fact, never inferred from port/PID/container/backend.

---

## 14. RequestContext is transport/runtime context, never durable authority

Current Mastra can persist workflow/agent-related RequestContext across suspension/restart.

That creates a stale-context resurrection risk unless the runtime realization treats snapshot context as non-authoritative residue.

### 14.1 Replace-whole law

At every governed Builder dispatch/rebind and PAR dispatch/resume:

```text
load current + pinned owner facts
→ construct a fresh role-specific runtime RequestContext/config object
→ replace the effective propagated/persisted context as a whole
→ mechanically reapply load-bearing config
→ dispatch/resume
```

**Never merge current values over the old snapshot context.**

Why:

```text
merge(new-known-keys, stale-context)
→ unknown stale keys survive
→ future code may accidentally consume resurrected state
```

Snapshot-carried context may remain available as a separate diagnostic artifact if useful, but not as effective runtime authority/config.

### 14.2 Snapshot context may not restore

```text
current permissions
role eligibility
current revocation state
current binding authority
approval authority
current trigger/schedule authority
tool/model surface beyond exact admitted/pinned composition
```

Current/pinned owner rules remain sovereign.

---

## 15. Conexus owner IDs do not ride OTel Baggage by default

Current OTel baggage has no built-in integrity guarantee and may propagate automatically to downstream/third-party requests.

Therefore:

> **Conexus owner IDs are not placed in OTel Baggage by default.**

They may be carried, subject to later 3I redaction policy, in server-stamped:

```text
RequestContext
trace/span attributes
log correlation fields
resource/runtime metadata
```

Future baggage use requires explicit 3I decision including egress stripping/trust rules.

Incoming trace/baggage values remain untrusted correlation input until the Conexus boundary re-stamps/validates the authoritative owner context.

---

## 16. High-cardinality owner IDs are not default metric dimensions

IDs such as:

```text
ActorRunId
AgentRunId
ChangeId
ProjectId
traceId
sandboxId
```

are valuable for traces/logs but create metric-cardinality risk.

F1 law:

> owner/runtime execution IDs are not default metric labels/dimensions.

Use metrics for bounded dimensions such as runtime role, operation family, model/provider class, outcome class or environment where justified.

Exact metric schema remains 3L/implementation.

---

# Part C — F5 Runtime Handoff

## 17. Control handoff and telemetry are different channels

A governed runtime has two semantically different outbound paths:

### Owner-control proposal

```text
runtime
→ typed owner-specific F5 proposal/callback
→ owner validates current facts
→ owner may persist transition
```

### Operational observation

```text
runtime
→ telemetry/log/trace/event
→ OBS
→ observation/history only
```

Law:

```text
telemetry complete
!= F5 completion proposal
!= owner terminal truth
```

OBS is never used to reconstruct a missed owner transition after the fact.

---

## 18. Direct typed in-process F5 is the F1 baseline

Because direct-call-first is already approved and same-process is admissible, the normal F1 owner handoff is a narrow typed callback/function boundary.

Examples conceptually:

```text
Builder runtime output proposal
→ Builder owner handler

PAR runtime completion proposal
→ PAR owner handler
```

No generic:

```text
RuntimeBus
RuntimeEventEnvelope
UniversalRuntimeResult
CommandBus
EventBus
handoff ledger
queue
outbox
```

is introduced.

---

## 19. Owner identity comes from the dispatch-bound handle/closure

For in-process execution the owner already knows which domain run it dispatched.

Law:

```text
owner dispatches runtime for ActorRun A
→ callback/opaque handle is bound by owner-side closure/context to A
→ producer payload runId is cross-check only
```

If:

```text
closure/handle identity A
!=
payload claims B
```

then:

```text
refuse proposal
record diagnostic/finding as applicable
never terminalize/deliver B
```

This prevents accidental concurrent-run callback misattribution without inventing a new durable handle entity.

For a future out-of-process realization, the equivalent trusted identity comes from authenticated/admitted transport context, not a producer-asserted field; exact mechanism is 3I/3J.

---

## 20. Duplicate/lost-response F5 remains safe under existing owner guards

### Builder

Builder output presentation remains anchored by exact durable custody + write-once `producedOutputRef` and existing delivery judgment.

Duplicate presentation/callback cannot create a second authoritative output silently.

### PAR

PAR AgentRun terminal truth remains terminal write-once and guarded by current owner state.

Duplicate completion callback after response loss cannot re-terminalize or rewrite the run.

Therefore a queue/outbox is not required merely to make current direct handoff retryable.

---

## 21. Future process split does not automatically imply queue/outbox

If 3J later separates the roles physically:

```text
same typed semantics
→ narrow HTTP/RPC/request-reply may be enough
```

A durable queue/outbox becomes justified only if a concrete future transport/failure model proves a proposal can be **non-re-derivable** after loss and losing it violates a product invariant.

That is a named Decision Loop/reopen trigger, not F1 infrastructure.

---

# Part D — Verification Observability

## 22. Observation sources use the existing producer_trust taxonomy

3H-03 does not create a second provenance ontology.

Conceptual source mapping remains under the existing 3C-13 classes:

```text
owner/audit history                    → HUB_AUTHORITY
Gateway receipts/effect evidence       → GATEWAY_AUTHORITY
Mastra runtime telemetry               → PROVIDER_OBSERVED-class runtime observation
E2B platform/provider observation      → PROVIDER_OBSERVED
app-under-test / guest telemetry       → GUEST_OBSERVED
```

The exact versioned producer identity/source mapping can distinguish Mastra-vs-E2B within `PROVIDER_OBSERVED`; no new top-level trust class is required.

---

## 23. Verification Observability uses multiple evidence layers without conflating trust

For a material Builder/Verifier scenario, the preferred causal view is:

```text
exact candidate X / ActorRun A
│
├── Hub/Builder owner facts
│
├── Mastra runtime telemetry
│   ├── agent/model/tool traces
│   ├── runtime logs
│   └── token/latency/cost observations
│
├── E2B provider observations
│   ├── physical sandbox identity
│   ├── provider metrics/logs
│   └── sandbox lifecycle/resource observations
│
└── app-under-test telemetry
    ├── browser/client errors
    ├── backend traces/logs
    ├── request failures
    └── app/runtime diagnostics
```

The verifier can navigate these sources by server-stamped Conexus correlation anchors while preserving their trust/provenance differences.

---

## 24. E2B provider evidence uses a dual path

Current E2B provides both a platform-side pull path and best-effort OTLP push export.

### 24.1 Pull-by-physical-sandboxId — minimum exact provider association

For Builder execution, 3H-01 already requires observing/pinning the exact physical E2B `sandboxId`.

Therefore platform-side provider observation can be queried/summarized by the exact physical sandbox identity associated with the ActorRun.

Law:

> **Provider evidence used as the run-associated E2B summary is anchored by the exact physical `sandboxId`.**

This path does not trust guest-supplied correlation metadata.

### 24.2 E2B OTLP push — live telemetry enrichment

Current official E2B documentation exposes OTLP HTTP/protobuf export of `e2b.*` metrics and lifecycle/action logs.

It is:

```text
real/current capability
provider-observed
best effort
onboarding/config dependent
```

Current documented contract does not guarantee a stable per-sandbox identity attribute on pushed signals.

Therefore:

```text
push data arrives + independently correlated
→ useful PROVIDER_OBSERVED Operational Telemetry enrichment

push missing/delayed/dropped
→ telemetry degrades honestly
→ never infer "nothing happened"

push alone
-X-> sole deciding provider evidence for exact ActorRun
```

3L may qualify stronger per-sandbox OTLP metadata at the pinned version later.

---

## 25. App-under-test telemetry remains guest-observed

The candidate application can emit traces/logs/errors and these observations are extremely useful for finding false greens.

However:

```text
app says success
app emits no error
app emits owner-like IDs
```

never upgrades the evidence to Hub/Gateway authority.

App/guest telemetry remains `GUEST_OBSERVED` and must be correlated/re-stamped from the platform launch/verification context rather than trusted for scope/identity claims.

---

## 26. Material verification controls sampling/capture intentionally

Ordinary Operational Telemetry may use sampling.

Material verification is different when a correctness assertion explicitly requires runtime evidence.

Law:

> **The verification execution is run under a capture policy that deliberately retains the deciding trace/log/error surfaces required by that verification scenario, rather than leaving them to random production sampling.**

If required runtime evidence is still unavailable:

```text
required evidence missing
→ NOT_PROVEN / INCONCLUSIVE
→ never PASS by absence
```

This realizes 3C-13 without making all production telemetry 100%-sampled.

Exact capture/sampling configuration belongs to 3L/3N.

---

## 27. Verification instrumentation should not be solely implementer-controlled

Where technically feasible, Verification Observability should prefer platform-controlled seams such as:

```text
runtime launch wrapper
platform/scaffold instrumentation contract
external/provider observations
collector/proxy outside guest control
mechanical instrumentation-presence checks
```

rather than relying only on code the same Change can delete or spoof.

This still does not make provider/platform telemetry correctness authority; it improves observation independence.

Exact enforcement/security belongs to 3I/3L/3N.

---

## 28. Spotlight remains a challenger, not architecture authority

Spotlight currently provides a strong local developer/verifier experience for errors/traces/logs via Sentry SDK + MCP.

Disposition:

```text
Spotlight local UX proves valuable under qualification
→ may be adopted as local challenger/tooling

Spotlight unavailable/changes
→ architecture remains valid through OTel + normal OBS query surfaces
```

Spotlight is not required for production observability and no Sentry dependency is frozen by 3H-03.

---

## 29. MastraStorageExporter may coexist but never becomes the Conexus OBS source of truth

Mastra may store its own observability data for Studio/dev convenience.

But:

```text
OBS domain code
-X-> query mastra_builder / mastra_par vendor tables directly
```

Conexus telemetry must flow/project through the qualified observability boundary/API/export path.

No cross-schema vendor-table coupling is introduced.

---

# Part E — Failure/Degradation Semantics

## 30. Ordinary telemetry remains degradable

```text
OTLP exporter down
provider push delayed
Mastra trace dropped
logging unavailable
```

must not automatically block ordinary Builder/PAR work unless a specific current operation has a separately approved evidence/audit requirement.

Telemetry degradation is observed honestly.

---

## 31. Audit-required remains separate from telemetry-required

Audit Trail rules already approved by 3C-13/3E remain unchanged.

```text
audit-required authority mutation
→ required audit failure may fail closed

ordinary telemetry exporter failure
→ operational degradation
```

3H-03 does not turn every trace/log into transactional authority.

---

## 32. Recovery ownership remains 3M

3H-03 decides:

```text
what runtime state may be shared
what must be isolated
what correlation can be trusted for what purpose
how runtime proposal identity is bound
what telemetry absence means
what evidence paths exist
```

3M later decides:

```text
orphan timeout
lost process/run settlement
missing provider observation recovery
operator repair/reconciliation
corrupt/missing runtime state policy
```

No RecoveryEngine is created here.

---

# Part F — Qualification

## 33. `CX-RUNTIME-ISOLATION-01`

A dedicated cross-runtime qualification package is justified because 3H-03 contains framework-global-state assumptions not fully covered by Builder-only/PAR-only probes.

It is a **probe package**, not a new runtime subsystem.

Required properties include:

```text
P1  BuilderMastra and ParMastra bind different persistent stores
P2  Builder and PAR registries cannot resolve one another's role objects
P3  Builder coding/shell/workspace tools cannot appear in PAR Product Agent surface
P4  PAR Product tools/conversations/schedules cannot appear in Builder runtime

P5  pinned-version source/behavior sweep enumerates enabled-capability process-global mutable state
P6  enabled process-global state either proves role-safe partition or fires process-split/guard trigger

P7  same-process Builder/PAR use distinct PubSub instances
P8  same-PubSub negative fixture is rejected by qualification/configuration
P9  canary on module-default PubSub sees zero governed Builder/PAR role events
P10 shared external broker realization, if selected, uses distinct role namespace/keyPrefix and shows no cross-role delivery

P11 governed Product Agent cannot fall back to standalone/ephemeral Mastra
P12 governed Builder runtime cannot fall back to ephemeral substrate
P13 role Mastra instance without explicitly configured persistent storage refuses governed service/start

P14 both role instances emit concurrently under same process with no registry/thread/memory/tool bleed
P15 global scorer/evaluation hook fixture cannot influence the wrong runtime role
P16 any newly-enabled Durable Agent / Observational Memory / future global-state capability re-runs cross-role qualification before admission

P17 one ActorRun/AgentRun across restart/resume may produce multiple trace segments while owner identity remains stable
P18 every relevant trace/log segment carries server-stamped owner/run correlation
P19 no telemetry segment is treated as owner authority merely because IDs match

P20 both roles through separate provider/exporter setup are mechanically distinguishable
P21 both roles through shared global OTel SDK/OtelBridge are mechanically distinguishable on every span/log via role signal attributes
P22 guest/external forged trace metadata cannot change authoritative run/project scope
P23 app-under-test outbound request carries no Conexus owner IDs in OTel baggage by default

P24 snapshot RequestContext poisoned with stale known authority/config values
    → effective resumed context uses owner-rebuilt values
P25 snapshot RequestContext contains unknown stale key
    → effective resumed context omits it; replacement is whole, not merge

P26 concurrent run callbacks are intentionally mis-wired
    → closure/dispatch-bound identity mismatch refuses proposal
    → no wrong-run terminal/delivery transition
P27 duplicate/lost-response F5 callback remains owner-idempotent/write-once without queue/outbox

P28 material verification capture policy retains required runtime evidence or yields NOT_PROVEN
P29 guest disables/breaks app instrumentation
    → provider/platform observations still exist where applicable
    → no false PASS from missing guest telemetry

P30 E2B pull by pinned physical sandboxId returns/attempts exact run-associated provider summary
P31 E2B pull unavailable/partial
    → existing provider metrics/evidence state degrades honestly
P32 E2B OTLP push enabled
    → e2b.* metrics/logs enrich OBS
P33 E2B OTLP push outage/drop
    → does not become false negative/false authority
P34 pinned E2B version does not rely on undocumented per-sandbox push attributes unless qualification verifies them explicitly

P35 Conexus owner IDs appear in trace/log correlation but not as unbounded default metric labels
```

Exact probe implementation, versions and fixtures belong to 3L.

---

## 34. Relationship to existing probes

`CX-RUNTIME-ISOLATION-01` complements rather than replaces:

```text
CX-BUILDER-MASTRA-01
→ Builder session/sandbox/runtime semantics

CX-AGENT-MASTRA-01
→ Production Agent suspend/resume/schedule/runtime semantics

CX-RUNTIME-ISOLATION-01
→ cross-role isolation + correlation + handoff + observability composition
```

A probe failure reopens the smallest realization assumption first, not domain semantics automatically.

---

# Part G — YAGNI / Global Maximum

## 35. Alternatives — final disposition

### Alternative A — role-specific Mastra instances + logical isolation + qualified same-process co-location + domain-ID-first correlation + direct typed F5 + layered observability

**ADOPT / GLOBAL MAXIMUM.**

It closes all named current failure classes while preserving direct-call-first and avoiding speculative deployment/infrastructure.

### Alternative B — mandatory Builder/PAR separate processes now

**DEFER / conditional.**

It becomes mandatory only if qualification finds enabled, unpartitionable process-global mutable state.

### Alternative C — shared single Mastra instance for Builder and PAR

**REJECT.**

Conflicts with distinct stores, tool surfaces, runtime roles and isolation requirements.

### Alternative D — RuntimeBus/EventBus/UniversalRuntimeEvent for F5 and telemetry

**REJECT.**

Combines control proposal and observation semantics and adds infrastructure with no current need.

### Alternative E — telemetry-driven owner transitions

**REJECT.**

Violates `Observed(X) != Authoritative(X)` and F5 rules.

---

## 36. Explicit no-build list

3H-03 does **not** create:

```text
new domain module
new durable record class
new Tier-2 FK
RuntimeRegistry
shared mutable runtime object registry
RuntimeBus / EventBus
UniversalRuntimeEvent / UniversalRuntimeResult
custom tracing protocol
mandatory OTel Collector/backend
mandatory Sentry/Spotlight
queue/outbox merely for callback reliability
lease/fencing merely for cross-role isolation
mandatory Builder/PAR process split
custom PubSub abstraction
custom E2B telemetry adapter beyond narrow qualified use
telemetry-derived domain FSM
second producer-trust taxonomy
```

---

## 37. Reopen / Decision Loop triggers

3H-03 should reopen or route through Decision Loop only on material evidence such as:

```text
an enabled F1 Mastra capability has unpartitionable process-global mutable state
role-local PubSub cannot isolate current thread/suspend/signal machinery
framework requires same mutable storage/runtime registry for Builder and PAR
future Durable Agent / OM / new capability cannot preserve same-process role isolation
a product transport creates non-re-derivable owner proposals requiring durable outbox/queue
a real multi-process topology requires semantics not preserved by narrow request/reply
OTel correlation cannot carry server-stamped run identity without custom protocol
material verification cannot obtain trustworthy-enough runtime evidence through current source mix
a named verification invariant requires a stronger provider evidence class than current pull/push surfaces can provide
```

Not reopen triggers:

```text
"microservices are safer"
"OTel SDK is global"
"we may need Kafka later"
"Spotlight/Sentry has a nicer UI"
"Mastra has a new feature"
"separate processes feel cleaner"
```

---

## 38. Final consistency check

### 3C-13

OBS remains Audit Trail + Operational Telemetry. Existing `producer_trust` taxonomy remains the only provenance/trust class set. Verification telemetry supports proof/investigation but never becomes correctness authority.

### 3D-R1

Direct-call-first remains. No bus, mediator, provider framework or new control-plane orchestration is introduced.

### 3E

`mastra_builder` / `mastra_par` remain physically separate. No Conexus cross-read of Mastra vendor tables. No new durable class or FK.

### 3F

F5 remains owner-specific proposal/observation semantics. Runtime producer identity is not trusted from payload; owner-side context binds the proposal. No universal F5 wire shape is invented.

### 3G

Owner terminal/write-once/idempotent behaviors remain sovereign; duplicate runtime callbacks cannot manufacture new terminal truth.

### 3H-01

Builder runtime still owns explicit CodingSession/ActorRun/sandbox continuity and exact output custody. 3H-03 only adds cross-role isolation/correlation laws.

### 3H-02

PAR still uses exact Release-pinned RuntimeAgentProjection, guarded resume and direct Agent baseline. 3H-03 adds role-local PubSub/context/correlation realization; it does not weaken PAR authority.

No contradiction found.

---

## 39. Final recommendation to operator

```text
Material Finding against approved authority          = NONE
reopen required                                      = NONE
Alternative A                                        = GLOBAL MAXIMUM
FBL-R1-01..06                                       = INCORPORATED with corrected E2B evidence
CGPT-R2-01                                          = INCORPORATED
Fable Round 2 refinements                           = INCORPORATED
E2B provider evidence                               = pull-by-physical-sandboxId anchor + best-effort OTLP enrichment
Mastra role isolation                               = instance + persistent store + PubSub + role-bound runtime
standalone/ephemeral governed execution              = PROHIBITED
same-process Builder/PAR                             = ALLOWED after qualification
mandatory process split                              = ONLY on unpartitionable enabled global mutable state
correlation                                           = durable Conexus IDs; runtime refs/trace ids observational
trace lifetime                                        = 0..N per domain run
owner IDs in OTel baggage                             = PROHIBITED by default
RequestContext resume                                 = REBUILD + REPLACE WHOLE
F5 in-process identity                                = dispatch closure/handle; payload cross-check only
telemetry vs F5                                       = separate channels
producer provenance                                   = existing producer_trust only
Verification Observability                            = Hub/Mastra/E2B/app sources with provenance preserved
new infrastructure                                    = NONE
3H-04                                                 = NOT JUSTIFIED
3H-03 candidate status                                = READY FOR OPERATOR DECISION
```

### Candidate decision sentence

> **3H-03 — Runtime Isolation, Correlation & Handoff:** Conexus F1 realizes Builder and Production Agent execution through distinct role-bound Mastra instances with separate persistent stores and role-local PubSub/runtime namespaces, allowing same-process co-location only while qualification proves enabled process-global framework state cannot cause cross-role mutable behavior and requiring physical split only on an unpartitionable material finding; durable Conexus owner IDs remain the causal anchors across zero-to-many runtime trace segments, with OTel used as preferred observational plumbing but never authority, RequestContext rebuilt and replaced from owner facts on every dispatch/resume, owner IDs excluded from OTel baggage by default and high-cardinality metrics labels, and runtime control handoff kept as owner-bound typed F5 proposals whose identity derives from the owner dispatch context rather than producer payload; Operational Telemetry remains a separate degradable path using the existing producer-trust taxonomy, while Verification Observability correlates exact candidate/run facts with Mastra runtime observations, E2B provider evidence anchored by the pinned physical sandbox plus best-effort OTLP enrichment, and guest/app telemetry without allowing any observational source to manufacture domain truth.

---

## 40. Operator decision gate

This R3 approves nothing.

If the operator ratifies 3H-03, the next canonical actions are:

1. materialize `3H-03-runtime-isolation-correlation-handoff.md` as approved authority;
2. update `LEDGER.md`;
3. evaluate whether 3H now has any remaining justified decision package;
4. if no material 3H residue remains, produce the appropriate 3H closure/reconciliation artifact rather than inventing `3H-04`;
5. continue to 3I only after the 3H closure state is explicit.

No merge is authorized by this dialogue.