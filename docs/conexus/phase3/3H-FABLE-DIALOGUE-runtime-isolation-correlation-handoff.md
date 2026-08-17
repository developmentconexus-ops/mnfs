# 3H — ChatGPT ↔ Fable Dialogue — Runtime Isolation, Correlation & Handoff

**Status:** WORKING DIALOGUE / NON-AUTHORITATIVE  
**Phase:** 3H — Runtime & Agent Architecture  
**Candidate decision:** `3H-03 — Runtime Isolation, Correlation & Handoff`  
**PR:** #40  
**Branch:** `agent/conexus-phase-3-system-design`  
**Starting HEAD:** `3af340c037fc13689d5087f0e755e508c6c5d274`  
**Important:** review/co-design only. This file is not authority, does not approve/create 3H-03, does not close 3H, does not constitute C-018, and does not authorize implementation, merge or PR readiness.

---

## 0. Review protocol

1. Reconstruct authority from `AGENTS.md` and follow its required read order.
2. Apply DevelopmentConexus Engineering Method v1.0.0 from `docs/engineering/standards/root-cause-global-maximum-method.md`.
3. Read at minimum, as applicable:
   - `docs/conexus/DECISOES.md`;
   - `docs/conexus/phase3/LEDGER.md`;
   - `docs/conexus/phase3/3C-13-observability-audit-module-boundary.md`;
   - `docs/conexus/phase3/3D-R1-dependency-architecture-final-closure.md`;
   - `docs/conexus/phase3/3E-01-hub-control-data-ownership-persistence-boundaries.md`;
   - `docs/conexus/phase3/3E-02-module-durable-record-inventory-reference-closure.md`;
   - `docs/conexus/phase3/3F-02-boundary-payload-semantics-error-envelope-architecture.md`;
   - `docs/conexus/phase3/3F-R1-contracts-api-architecture-final-closure.md`;
   - `docs/conexus/phase3/3G-R1-behavioral-state-architecture-final-closure.md`;
   - `docs/conexus/phase3/3H-01-builder-coding-runtime-realization-session-sandbox-mapping.md`;
   - `docs/conexus/phase3/3H-02-production-agent-runtime-realization.md`.
4. Approved architecture is baseline, not dogma. Reopen only for a material Finding with a reachable failure class and a globally superior correction.
5. Do not reopen for framework preference, naming, symmetry or optionality.
6. Fable acts as independent Senior/Staff/Principal Software Engineer + Software Architect.
7. If any argument depends on current Mastra/E2B/OpenTelemetry/Spotlight behavior, verify through current primary sources; for Mastra use Context7 `/mastra-ai/mastra` and current source when load-bearing.
8. Append numbered rounds; never silently rewrite another actor's round.
9. ChatGPT↔Fable agreement is not operator approval.
10. YAGNI applies aggressively. No runtime bus, universal event envelope, shared mutable runtime registry, custom tracing protocol, queue, lease, recovery engine, mandatory collector/backend or process split without current failure class.
11. Runtime telemetry and runtime context are mechanics/observations, not authority merely because they are persistent or propagated.
12. `mastra_builder` and `mastra_par` remain physically distinct substrate stores by 3E-01.
13. No `LEDGER.md`, approved authority or product code changes while this dialogue remains unresolved.

---

# Round 1 — ChatGPT

## 1. Decision target

3H-03 should close the minimum architecture necessary for the remaining cross-runtime questions after 3H-01 and 3H-02:

```text
Builder Mastra runtime isolation from Production Agent Mastra runtime
runtime registry / storage / tool / memory bleed prevention
same-process versus separate-process architectural boundary
Conexus IDs ↔ Mastra traces/logs/runtime refs correlation
OpenTelemetry propagation boundary
long-lived run / suspend / restart correlation
runtime RequestContext authority boundary
Builder/PAR runtime → owner F5 handoff realization
control handoff versus operational telemetry separation
Verification Observability correlation across Mastra + E2B + app-under-test
producer provenance and guest-forged correlation handling
telemetry sampling behavior for material verification
```

It should **not** decide:

```text
credential custody / network trust / principal authorization          → 3I
whether Builder/PAR are separate OS processes/containers in PROD     → 3J unless isolation probe forces it
collector/backend topology / Sentry/ClickHouse/etc.                   → 3J/3L
retention/redaction/PII policy                                       → 3I/3J
orphan timeout / lost-run settlement                                 → 3M
frontend trace/debug UI                                               → 3K
exact Mastra/E2B/OTel versions                                       → 3L
architecture-wide verification                                       → 3N/3O
```

Candidate title:

> **3H-03 — Runtime Isolation, Correlation & Handoff**

No separate `3H-04` is currently justified.

---

## 2. Authority already fixed before this dialogue

### 2.1 OBS is a sink, never current-state authority

3C-13 freezes:

```text
Domain owner
→ owns current authoritative state

Observability & Audit
→ owns Audit Trail + Operational Telemetry history

Verifier / QA
→ consumes runtime telemetry as diagnostic/proof input
→ telemetry alone never decides correctness
```

`Observed(X) != Authoritative(X)` remains load-bearing.

### 2.2 Causal navigation is required

3C-13 already requires correlation across:

```text
Builder
Mastra coding runtime
E2B
app-under-test
Capability Gateway
Production Agent Runtime
Release
MANAGED runtime
DEDICATED integrations
```

and explicitly prefers OpenTelemetry as the vendor-neutral technical boundary for traces/logs/metrics while preserving Conexus domain/audit semantics independently.

### 2.3 Runtime substrate storage is already separated

3E-01 freezes:

```text
mastra_builder
!=
mastra_par
```

with separate databases and different durability expectations.

No Conexus module may query `mastra_*` tables directly. Correlation happens through opaque runtime refs/observations, never FK or cross-schema SQL.

### 2.4 Runtime IDs never become domain IDs

3H-01/3H-02 already freeze:

```text
ActorRunId / CodingSessionId / AgentRunId / ConversationId / owner pins
→ Conexus authority/correlation anchors

Mastra run/thread/session/toolCall refs
E2B sandbox/PID refs
trace/span/provider refs
→ runtime correlation / telemetry
```

### 2.5 F5 is rules-only, not universal shape

3F-02 freezes:

```text
OBSERVATION_APPEND
→ producer emits observation
→ never current domain truth by itself

PROPOSAL
→ producer requests owner transition
→ owner validates/decides/applies
→ truth only after durable owner record
```

Transport ACK is never the domain decision. No `UniversalRequest`, `UniversalStatus`, `UniversalRuntimeResult` or generic F5 envelope exists.

### 2.6 Direct-call-first remains architectural default

3D-R1 freezes direct narrow in-process calls by default and prohibits speculative:

```text
CommandBus
Mediator
ServiceLocator
EventBus
WorkflowEngine
provider framework
```

Runtime never calls L7/control-plane orchestration.

---

## 3. Current external evidence verified before this proposal

Evidence IDs `R1..R11` are local to this dialogue.

### R1 — Mastra component registries/storage are instance-owned

Current Mastra source keeps instance fields such as:

```text
#agents
#workflows
#storage
#tools
#memory
#scorers
```

and initializes them per `new Mastra(...)` instance. Storage is an instance property and can be supplied independently.

Implication:

> two role-specific Mastra instances in one process are technically plausible and naturally align with 3E's `mastra_builder` / `mastra_par` split.

Source: current `packages/core/src/mastra/index.ts`.

### R2 — not every Mastra facility is purely instance-local

Current Mastra has a **module-level hook emitter** for scoring/evaluation hooks. Current code associates normal scorer events with an opaque owner token so the appropriate Mastra instance filters them, but public unowned hook dispatch retains broadcast behavior.

This is not a current F1 blocker because scorer/eval runtime is not Product/Builder authority and is later 3L/3N tooling, but it proves an important architectural fact:

> instance separation must be **qualified for the enabled capability set**; we may not assume every future Mastra primitive is free of process-global mutable state.

Sources:

- `packages/core/src/hooks/index.ts`;
- `packages/core/src/hooks/scorer-owner.ts`;
- `packages/core/src/mastra/hooks.ts`.

### R3 — Mastra can participate in existing trace context

Current Mastra supports:

```text
tracingOptions.traceId
tracingOptions.parentSpanId
tracingOptions.metadata
tracingOptions.tags
requestContextKeys → automatic trace metadata extraction
```

Mastra also has an `OtelExporter` for OTLP traces/logs.

Implication:

> Conexus does not need a custom tracing protocol or correlation transport merely to connect Mastra execution to platform traces.

Sources:

- current Mastra tracing overview;
- `@mastra/otel-exporter` current docs/source.

### R4 — OtelBridge exists but is experimental

Current Mastra `OtelBridge` can create native OTel spans, inherit ambient OTel context and preserve parent-child relationships into OTel-instrumented tool/HTTP/DB code. It is explicitly marked **experimental**.

Implication:

> a single perfect distributed trace tree must not be an architectural correctness dependency. 3L may qualify the bridge; the minimum design must remain correct with multiple trace segments linked by Conexus IDs.

Source: current Mastra OpenTelemetry integration docs.

### R5 — RequestContext is powerful and can outlive a single step

Current Mastra `RequestContext` flows into Agent config, tools, workflows and subagents. Workflow RequestContext can survive suspend/resume.

Implication:

> RequestContext is useful for correlation/configuration, but putting current authorization/grants/domain authority into it would create a stale-authority resurrection channel after suspend/restart.

Source: current Mastra RequestContext docs/test utilities.

### R6 — Mastra tracing can auto-extract RequestContext metadata

Current tracing config can allowlist RequestContext keys and attach them as metadata to traces/spans. Explicit trace metadata takes precedence over extracted metadata.

Implication:

> a server-stamped correlation context can reach most Mastra spans without hand-annotating every tool call.

Source: current Mastra tracing overview.

### R7 — OpenTelemetry propagation is appropriate for causal mechanics, not authority

Current OTel guidance:

```text
trace context → distributed causal propagation
baggage       → arbitrary application context propagation
```

but warns that incoming context can be forged and baggage has no built-in integrity and may cross untrusted service boundaries.

Implication:

> no OTel trace/baggage field can by itself assert Workspace/Project/Run authority. External/guest correlation values are observational until re-stamped/validated by Conexus.

Source: current OpenTelemetry context propagation and baggage specs/docs.

### R8 — durable Conexus IDs are high-cardinality and belong in trace/log correlation, not metric labels by default

OpenTelemetry metrics treat high-cardinality attribute combinations as expensive and subject to cardinality limits/overflow.

Implication:

> `ActorRunId`, `AgentRunId`, `ChangeId`, etc. may be trace/log attributes but must not become default metric dimensions.

Source: current OpenTelemetry metrics/cardinality docs.

### R9 — E2B can export provider-side OTLP metrics/logs

Current E2B can export:

```text
e2b.* resource metrics
sandbox lifecycle/action logs
```

via OTLP HTTP/protobuf to an OTel-compatible destination. Export is best effort.

E2B also supports sandbox metadata/environment variables and per-command env values.

Implication:

> Verification Observability can combine app-under-test telemetry with provider-observed sandbox lifecycle/resource telemetry instead of trusting only guest instrumentation.

Sources: current E2B OTel telemetry export and sandbox env/metadata docs.

### R10 — Spotlight remains a real local AI-debugging challenger

Current Spotlight exposes local errors/traces/logs to coding agents via MCP and supports local distributed tracing/debugging using Sentry SDK instrumentation.

Implication:

> Spotlight remains a valuable challenger for the **local Verification Observability experience**, but the capability can sit behind the OTel/provenance architecture rather than becoming mandatory platform authority/backend.

Source: current Spotlight official site.

### R11 — MastraStorageExporter is not enough as the Conexus OBS integration path

Mastra can store observability data in its own storage via `MastraStorageExporter`.

But 3E-01 already forbids Conexus modules from querying `mastra_builder` / `mastra_par` tables directly.

Implication:

> F1's Conexus telemetry path should export/project observations into the OBS/OTel boundary rather than make OBS read vendor substrate tables. MastraStorageExporter may remain dev/Studio convenience if useful, never the sole Conexus telemetry authority.

---

## 4. Root cause

Without a 3H-03 realization law, the architecture is vulnerable to several reachable defect classes:

```text
Builder and PAR share mutable Mastra registry/session/memory state accidentally
Builder high-power tool surface leaks into Product Agent runtime
PAR agent/workflow/schedule definitions become visible to Builder runtime or vice versa
future Mastra process-global hook/cache state silently couples the two roles
same runtime id means different domain identities after restart
traceId is mistaken for ActorRunId/AgentRunId
one long-lived AgentRun is forced into one impossible eternal trace
RequestContext survives resume carrying stale authority
external/guest baggage forges Project/Run correlation
runtime telemetry completion is mistaken for F5 completion proposal or owner terminal truth
F5 control transition is reconstructed from telemetry after the fact
telemetry exporter loss blocks ordinary domain work accidentally
required verification trace is randomly sampled away and absence is interpreted as PASS
app-under-test disables instrumentation and obtains false-green verification
Verifier sees Mastra trace but cannot connect it to sandbox/app request/error
MastraStorageExporter becomes hidden telemetry source requiring cross-read of mastra_* tables
high-cardinality Run IDs explode metrics label cardinality
```

The root cause is not “lack of observability.” It is failure to separate:

```text
runtime role isolation
correlation
control handoff
telemetry
and authority
```

---

## 5. Target invariants

1. Builder and Production Agent runtime mutable state never shares a substrate store.
2. F1 uses distinct role-specific Mastra runtime instances/configurations for Builder and PAR.
3. Same-process co-location is allowed only while enabled F1 capabilities remain mechanically isolated; process separation is the fallback if qualification proves a load-bearing global-state collision.
4. Physical process/container topology itself remains 3J unless the isolation property forces a split.
5. Builder runtime never resolves Product Agent registry/schedules/conversations/memory; PAR never resolves Builder AgentController/coding sessions/workspaces.
6. Builder coding/shell/E2B tool surfaces never become PAR Product Agent tools merely because the framework can register them.
7. `ActorRunId` / `AgentRunId` remain the durable execution correlation anchors; trace/span/runtime ids never replace them.
8. One domain execution may correlate to zero, one or many traces over its lifetime.
9. Trace continuity loss after suspend/restart is an observability boundary, not a domain-run boundary.
10. Correlation facts are stamped at the boundary that already knows the authoritative owner IDs; OBS never infers authority from timestamps or user-provided ids.
11. RequestContext/tracing metadata may carry operational correlation/configuration, never stale authorization/domain truth.
12. Current authority is reconstructed/reapplied at every Builder dispatch/rebind and PAR dispatch/resume as already frozen by 3H-01/02.
13. Incoming trace/baggage/guest correlation is untrusted until sanitized/re-stamped by a Conexus boundary.
14. W3C Trace Context / OTel propagation is preferred where qualified, but OtelBridge or one unified trace tree is not required for correctness.
15. Conexus owner IDs can be trace/log attributes; they are not default metric labels.
16. Runtime has two logically different outbound paths: owner-control F5 handoff and Operational Telemetry emission.
17. Telemetry can never substitute for an owner-control F5 proposal.
18. F5 transport ACK/receive never equals domain apply/terminal truth.
19. F5 remains owner-specific and typed; no universal runtime event/handoff envelope is created.
20. Direct in-process owner handoff is the F1 default where runtimes are co-located; HTTP/RPC later preserves the same semantics without requiring a queue/event bus.
21. Verification Observability correlates material QA to exact candidate/run identity plus runtime telemetry.
22. Verification telemetry preserves producer provenance: platform/Mastra/E2B/guest observations remain distinguishable.
23. Guest/app telemetry cannot claim Hub/Gateway authority by writing correlation fields.
24. Material verification that requires runtime telemetry uses a capture policy that does not randomly sample away the deciding execution; missing required telemetry remains NOT_PROVEN/INCONCLUSIVE.
25. Ordinary Operational Telemetry remains degradable/best-effort unless a specific proof obligation says otherwise.
26. Conexus never queries Mastra vendor tables to reconstruct correlation or control state.
27. No new domain module, runtime bus, handoff ledger, custom tracing protocol or generic provider framework follows from 3H-03.

---

## 6. Alternatives

### Alternative A — role-isolated Mastra instances + Conexus-ID correlation + OTel + direct typed F5

```text
Builder module
→ Builder Mastra instance
→ mastra_builder

PAR module
→ PAR Mastra instance
→ mastra_par

both
→ owner-stamped Conexus IDs
→ Mastra traces/logs
→ OTel/OBS

runtime control outputs
→ direct owner-specific F5 handlers
```

**Recommended / candidate Global Maximum.**

Why:

- satisfies the already-ratified physical storage split;
- uses Mastra's natural instance-owned registries;
- keeps process topology flexible;
- uses standard observability primitives;
- preserves direct-call-first;
- does not invent a generic runtime infrastructure layer.

### Alternative B — separate Builder and PAR OS process/container now

**Defer as mandatory baseline.**

Pros:

```text
stronger blast-radius isolation
simpler secret/process-boundary story
process-global framework state cannot bleed
```

Costs:

```text
network/RPC boundary
supervision/deployment complexity
new failure/retry semantics
more local-dev overhead
premature 3J choice
```

Adopt only if 3L/3I/3J proves same-process isolation insufficient for enabled capabilities or threat model requires it.

### Alternative C — one shared Mastra instance with role namespaces

**Reject.**

It conflicts with the approved separate `mastra_builder`/`mastra_par` storage lifecycle and creates accidental shared registries, Editor/workflow/schedule/memory configuration and tool-surface risk.

### Alternative D — universal RuntimeBus / RuntimeEventEnvelope

**Reject.**

It would duplicate F5 rules, undermine direct-call-first and create a new ontology between runtime and domain owners.

### Alternative E — Sentry/Spotlight-native observability as platform protocol

**Reject as architecture / keep challenger.**

Spotlight is valuable for local AI verification UX; Sentry is a credible backend. Neither should replace OTel as the portable technical boundary or Conexus OBS semantics.

---

## 7. Role-isolated Mastra runtime realization

### 7.1 Two runtime instances/configurations

F1 realization should use conceptually:

```text
BuilderMastra
→ coding AgentController / Builder agents/workspaces
→ mastra_builder
→ Builder-specific tools/runtime config

ParMastra
→ Product Agents / optional Product workflows / schedules
→ mastra_par
→ PAR-specific tools/memory/runtime config
```

These names are illustrative, not frozen public classes.

No third generic `MastraRuntimeRegistry` is introduced.

### 7.2 Instance registry isolation

The Builder instance must not register/resolve Product Agent runtime definitions, PAR schedule rows or PAR conversations/memory.

The PAR instance must not register/resolve:

```text
Builder AgentController
Builder coding sessions
Builder Mastra Workspace/E2B coding tool surface
Builder memory/thread lineage
```

Sharing immutable library code/config helpers is fine. Sharing mutable runtime registries is not.

### 7.3 Tool-surface isolation

Builder's high-power engineering tools:

```text
shell
filesystem
Git-local
E2B workspace/browser
code editing/build/test
```

must not appear automatically in Product Agent tool projection.

PAR Product tools remain the exact Release-pinned Capability Gateway projection of 3H-02.

This is a runtime-registration property; credential/network enforcement remains 3I.

### 7.4 Same process is not semantic sharing

If both Mastra instances run inside one modular-monolith process:

```text
same process
!= shared storage
!= shared agent registry
!= shared thread/memory namespace
!= shared tool surface
!= shared domain identity
```

### 7.5 Process-split trigger

Current Mastra already demonstrates that some ancillary facilities can use process-global machinery (e.g. scorer hook emitter with owner tokens).

Therefore qualification must include a **cross-instance negative test** for every enabled F1 facility that can influence execution.

Law:

```text
enabled facility proves role isolation in one process
→ co-location remains admissible

load-bearing facility uses unavoidable process-global mutable state that can cross role boundaries
→ do not build a complex provider-specific isolation shim by default
→ split Builder and PAR into separate processes at 3J/3I realization
```

This is the Global Maximum trigger: pay the process boundary only when the framework proves it necessary.

Scorer/eval functionality does not force the split now because it is not F1 Product/Builder authority and its current source already has instance owner tokens in normal use.

---

## 8. Failure isolation semantics

3H-03 does not promise that same-process co-location survives a Node process crash independently.

It freezes only:

```text
Builder runtime exception/state corruption
-X-> mutate PAR domain/runtime state by shared registry/storage

PAR runtime exception/state corruption
-X-> mutate Builder domain/runtime state by shared registry/storage
```

A whole-process crash may affect both if 3J chooses co-location. Domain recovery still proceeds independently from owner records.

Availability/blast-radius optimization is 3J, not a reason to invent microservices here.

---

## 9. Correlation model — domain IDs first

### 9.1 Durable anchors

Builder correlation anchors may include as applicable:

```text
WorkspaceId
ProjectId
ChangeId
CodingSessionId
WorkUnitId
ActorRunId
exact candidate/output identity
```

PAR correlation anchors may include:

```text
WorkspaceId
ProjectId
AgentRunId
ConversationId?
AgentTriggerId?
ReleaseRef / exact composition pins
```

Gateway/Release/OBS add their own owner identities such as `EffectAttemptId` / `PromotionId` where the corresponding owner creates them.

Exact physical field names are implementation detail.

### 9.2 No new universal Correlation entity

There is no durable:

```text
CorrelationRecord
UniversalActivity
TraceRun
RuntimeExecution
```

just to join IDs.

The existing owners already possess the identities.

### 9.3 Boundary-stamped causal links

A causal relation should be stamped/emitted at the boundary that already knows both sides.

Examples:

```text
Builder dispatch knows ActorRunId + Mastra run/thread refs
→ emit correlation there

CodingRuntime binds E2B
→ knows ActorRunId + logical/physical sandbox refs
→ emit correlation there

PAR dispatch knows AgentRunId + Mastra run/thread refs
→ emit correlation there

Gateway admits agent-origin effect
→ knows AgentRun/subject context + new EffectAttemptId
→ emit correlation there
```

OBS does not reconstruct these relationships heuristically from timestamps.

### 9.4 Runtime refs are one-to-many observations

A domain run can outlive process/tracing episodes:

```text
AgentRun A17
├── trace T1 before suspension
├── no process while suspended
└── trace T2 after fresh-process resume
```

Therefore:

```text
ActorRunId / AgentRunId
→ 0..N traceIds
```

not:

```text
one AgentRun == one trace forever
```

Trace/span ids remain runtime observations.

---

## 10. Runtime correlation context — ephemeral, owner-stamped

At each admitted dispatch/resume, the owner constructs an ephemeral runtime context containing only the correlation/config facts required by that runtime invocation.

Builder and PAR may have different concrete types; no universal public envelope is required.

The context can be projected into:

```text
Mastra RequestContext
Mastra tracingOptions.metadata / tags
OTel span attributes
runtime logger context
Gateway internal call context
E2B command/sandbox metadata/env when appropriate
```

### 10.1 Authority prohibition

Runtime context never becomes an authorization cache.

Forbidden pattern:

```text
RequestContext contains authorized=true / current grant / mutable permission
→ workflow/snapshot survives restart
→ old value silently authorizes future execution
```

Correct pattern:

```text
runtime context carries identity/correlation/config
→ owner/Gateway rechecks current authority at applicable enforcement point
```

### 10.2 RequestContext may survive; authority may not

Because current Mastra can propagate RequestContext through workflows and suspend/resume, any load-bearing mutable authority found there must be treated as stale on resume and overwritten/rederived.

This mirrors 3H-01's live-session-state authority prohibition and 3H-02's guarded-resume law.

---

## 11. OpenTelemetry mapping

### 11.1 Preferred technical boundary

Use OpenTelemetry semantics/protocol for technical telemetry interoperability:

```text
traces
logs
selected metrics
trace/span context
resource/runtime metadata
```

Conexus Audit/F5/domain schemas remain separate.

### 11.2 Mastra trace integration

Current Mastra can:

```text
export traces/logs through OTLP
accept explicit parent trace/span ids
attach tracing metadata/tags
extract allowlisted RequestContext keys
```

Those capabilities are good candidates for the realization.

### 11.3 Unified tree is optional optimization

A qualified `OtelBridge` or equivalent can make Mastra/tool/HTTP/DB spans part of the same distributed tree.

Because the current Mastra bridge is experimental:

```text
unified W3C trace tree proven in 3L
→ use it

bridge not qualified / trace splits at boundary
→ domain IDs still provide complete causal navigation
```

No correctness invariant depends on a single trace tree.

### 11.4 Metrics cardinality guard

Durable run/resource IDs are high-cardinality.

Baseline:

```text
ActorRunId / AgentRunId / ChangeId / ConversationId
→ trace/log correlation attributes allowed
→ metric label/dimension by default = NO
```

Metrics use low-cardinality dimensions such as runtime role, operation type, outcome class, model/provider family where appropriate.

Exact metrics design remains 3J/3L.

---

## 12. Trace/baggage trust boundary

### 12.1 Incoming external context

Incoming `traceparent`, baggage or equivalent can be used for diagnostic continuity after validation/sanitization, but never to assert domain scope.

```text
external baggage says projectId=P1
-X-> Project authority
```

The server derives Project/Workspace/Run context from the authenticated/admitted operation and stamps the authoritative correlation metadata itself.

### 12.2 Guest context

App-under-test / E2B guest telemetry may claim:

```text
ActorRunId
candidate digest
traceId
```

but such fields remain `GUEST_OBSERVED` unless independently stamped/associated by the platform launch/ingress boundary.

Guest data cannot elevate producer trust.

### 12.3 Sensitive data

Correlation must not require propagating prompts, business payloads, credentials or PII in baggage.

Mastra supports trace-level input/output hiding and sensitive-data processing; exact redaction/security policy remains 3I.

---

## 13. Two runtime output channels — control and telemetry

This is the central 3H-03 separation.

### Channel A — owner-control handoff (F5)

```text
runtime
→ typed owner-specific proposal/observation ingress
→ owner validates current authority/identity
→ owner may commit domain fact
```

Characteristics:

```text
low-volume
correctness-relevant
owner-specific
explicit decision result
replay/idempotency protected by existing owner facts
```

### Channel B — Operational Telemetry

```text
runtime / provider / guest
→ traces/logs/metrics/observations
→ OBS / OTel pipeline
```

Characteristics:

```text
high-volume possible
degradable/best-effort by default
append/observation semantics
never domain transition by itself
```

### Audit is owner-emitted after authority transition

When an action is `audit-required`:

```text
owner transition
→ audit record under 3C-13/3E rules
```

Runtime telemetry does not stand in for audit.

### 13.1 Never infer control from telemetry

Forbidden:

```text
OBS sees Mastra "complete"
→ mark ActorRun DELIVERED / AgentRun COMPLETED
```

Correct:

```text
runtime complete telemetry → OBS
runtime complete proposal   → owner F5 handler
owner guard                 → terminal fact if admissible
```

The two may refer to the same runtime event, but they are different semantic paths.

---

## 14. F5 runtime handoff realization

### 14.1 Direct-call-first

When runtime adapter and owner are in-process:

```text
runtime adapter
→ owner-specific typed ingress method
```

is the baseline.

No queue/bus is required to make a producer proposal “durable.” Domain durability comes from the owner's existing record if/when it accepts the proposal.

### 14.2 Out-of-process future realization

If 3J later places runtime in another process:

```text
HTTP/RPC/other narrow transport
→ same owner-specific F5 semantics
```

Transport choice does not create a new domain entity or change authority.

### 14.3 Owner derives authoritative scope

Runtime payload may carry producer-local refs and proposed content, but the owner derives authoritative scope from the already-admitted runtime/capability context.

```text
producer says Project=P2
admitted ActorRun/AgentRun belongs to P1
→ reject/ignore producer scope assertion
→ P1 authority remains
```

### 14.4 Transport ACK versus owner decision

```text
received / well-formed
!=
applied / accepted / terminalized
```

The handler may return the owner decision already durably recorded, but transport success never self-upgrades to domain success.

### 14.5 Duplicate/lost-response handling

Do not add a generic handoff ledger.

Use existing immutable/write-once owner facts:

```text
Builder producedOutputRef
PAR AgentRun terminal
PAR current proposal binding
PAR occurrence cursor
Gateway EffectAttempt/idempotency
```

A duplicate proposal after response loss must either:

```text
return the already-recorded owner decision
or
be rejected as stale/conflicting
```

without creating a second domain transition.

### 14.6 No UniversalRuntimeResult

Owner-specific semantic families remain separate:

```text
Builder output proposal
Builder runtime completion/failure observation
PAR tool/effect proposal
PAR runtime completion/failure observation
PAR schedule-fire proposal
```

Exact TypeScript names remain implementation detail.

---

## 15. Builder-specific handoff preservation

3H-01 remains authoritative:

```text
runtime produces exact output X
→ Hub-side durable custody of X
→ identity verification
→ Builder admits write-once producedOutputRef X
→ later Work Unit delivery judgment
```

3H-03 adds only cross-runtime/correlation consequences:

- the output proposal carries/derives `ActorRunId` from admitted runtime context;
- runtime refs/trace IDs attach as correlation only;
- telemetry about producing X is separate from Builder's presentation record;
- no new CandidateService or delivery ledger.

---

## 16. PAR-specific handoff preservation

3H-02 remains authoritative.

### Runtime completion

```text
Mastra run completes
→ runtime observation to OBS
→ typed completion proposal to PAR
→ PAR checks AgentRun non-terminal/current admissibility
→ PAR alone commits COMPLETED
```

### Tool/effect proposal

```text
agent proposes exact effect
→ PAR owner-side proposal identity + sealed subject
→ ApprovalRequest if required
→ runtime suspend mechanics if needed
→ Gateway admission after current guards
```

Runtime `toolCallId` remains correlation only.

### Schedule fire

```text
Mastra timer wake
→ guarded PAR schedule-fire proposal
→ trigger/revision/occurrence/single-flight admission
→ AgentRun created/pinned
→ only then Product Agent execution
```

No F5 generic event bus is introduced.

---

## 17. Verification Observability realization

### 17.1 Three observation layers

For material Builder verification, useful evidence can come from:

```text
Layer A — Mastra / Builder runtime
agent/tool/model traces, coding/runtime events

Layer B — E2B provider/runtime
sandbox lifecycle/resource metrics/logs, physical sandbox refs

Layer C — app-under-test
browser/backend traces, logs, errors, request behavior
```

All may export/project to the OBS/OTel pipeline, but producer provenance is preserved.

### 17.2 Correlation at launch boundary

When Builder launches tests/preview/app materialization, the platform boundary already knows:

```text
ActorRunId
exact candidate/output identity
sandbox logical/physical refs
app/preview invocation identity as applicable
```

It should stamp enough non-sensitive correlation context into the launch/telemetry path so OBS/Verifier can navigate:

```text
ActorRun
→ sandbox
→ app process/request/trace
→ observed error/log/trace
```

Exact env/header/OTel-carrier mechanism stays 3L.

E2B currently supports per-sandbox/per-command environment values and metadata, so this is credible without custom E2B infrastructure.

### 17.3 Guest telemetry remains guest telemetry

If the app reports `actorRunId=A1`, that does not prove it really belongs to A1.

The ingestion/launch boundary preserves:

```text
platform-stamped association
vs
guest-claimed fields
```

Exact producer authentication/redaction belongs to 3I.

### 17.4 Required-verification sampling law

Ordinary production telemetry may be sampled.

But when a verification assertion explicitly requires runtime telemetry:

```text
Builder/Verifier marks a server-admitted verification capture context
→ relevant trace/error/log capture must use an always-capture or equivalently reliable policy
→ random ratio sampling cannot be the reason the deciding trace disappeared
```

Current Mastra supports per-config/custom sampling and request-context metadata, making this property realizable.

If capture still fails:

```text
required telemetry missing
→ NOT_PROVEN / INCONCLUSIVE
```

not PASS.

The guest cannot self-assert `verification.required=true` to force cost/authority; the platform stamps it.

### 17.5 Verification query anchor

Verifier queries by authoritative/canonical anchors, not transient trace alone:

```text
ActorRunId
candidate identity
verification scenario identity when already existing
```

then traverses correlated runtime refs/traces.

No `VerificationTrace` durable entity is required.

---

## 18. Mastra observability storage versus Conexus OBS

### 18.1 Preferred production integration

```text
BuilderMastra / ParMastra
→ exporter / OTel projection
→ OBS/collector/backend path
```

OBS does not query Mastra tables.

### 18.2 MastraStorageExporter

May be useful for:

```text
Mastra Studio
local framework diagnostics
dev inspection
```

but if enabled it is a duplicate diagnostic store, not Conexus Operational Telemetry authority.

No architectural requirement says every Mastra trace must be duplicated inside `mastra_builder`/`mastra_par`.

---

## 19. Spotlight disposition

Current Spotlight still provides a compelling local development pattern:

```text
app instrumentation
→ local errors/traces/logs
→ UI + MCP
→ coding/verifier agent inspection
```

Candidate disposition:

```text
Verification Observability property = ADOPT
OpenTelemetry portability boundary  = ADOPT
Spotlight local UX/backend          = CHALLENGER / 3L probe
Sentry SDK mandatory                = NO
Spotlight mandatory                 = NO
```

A Spotlight/Sentry path can coexist with OTel because current Mastra can export OTLP and Sentry itself can ingest OTLP; exact backend choice remains later.

---

## 20. Failure schedules

### S1 — same-process registry bleed

```text
BuilderMastra registers coding agent X
ParMastra resolves X unexpectedly
→ isolation failure
→ same-process realization rejected or corrected
```

### S2 — Builder tool leak into PAR

```text
Builder shell/E2B tool globally registered
Product Agent sees it
→ isolation failure
→ fail qualification
```

### S3 — process-global Mastra facility

```text
enabled F1 facility uses module-global mutable registry
→ Builder event mutates/affects PAR facility
→ if no narrow owner scoping exists, process split trigger fires
```

### S4 — stale RequestContext after resume

```text
AgentRun suspends with context saying old role/grant/config
current authority changes
fresh process resumes snapshot
→ runtime may remember old value diagnostically
-X-> old value authorize Gateway/PAR transition
```

### S5 — trace split on restart

```text
AgentRun A1 trace T1 suspends
fresh process resumes as trace T2
→ A1 remains same domain run
→ OBS query by A1 returns both trace segments
```

### S6 — forged baggage

```text
external caller sends baggage conexus.project=P_ADMIN
→ server ignores it for authority
→ stamped admitted Project remains P_REAL
```

### S7 — duplicate completion handoff

```text
runtime sends completion
PAR commits COMPLETED
response lost
runtime retries completion proposal
→ terminal write-once/idempotent handler returns prior result or rejects stale
→ no second transition
```

### S8 — telemetry complete but F5 absent

```text
OBS records runtime complete
F5 control handoff fails/lost before owner commit
→ owner run remains non-terminal/orphan-recovery path
→ OBS event cannot terminalize it
```

### S9 — telemetry exporter outage

```text
OTLP exporter unavailable
→ ordinary runtime may continue with telemetry degraded
→ required verification assertion may become NOT_PROVEN
→ no generic platform outage
```

### S10 — guest disables app instrumentation

```text
app-under-test suppresses its own telemetry
→ provider/platform layers may still show sandbox/request observations
→ missing required app evidence = NOT_PROVEN
→ never false PASS
```

### S11 — guest forges ActorRunId

```text
app emits ActorRunId=A_GOOD while launched under A_BAD
→ guest claim stored as guest observation at most
→ platform-stamped launch association wins for trusted correlation
```

### S12 — required trace sampled away

```text
verification needs runtime error/trace evidence
ratio sampler drops trace
→ realization violates verification-capture property
```

### S13 — MastraStorageExporter-only design

```text
all Mastra traces stored only in mastra_builder/par
Verifier/OBS needs them
→ cross-vendor-table query temptation
→ reject realization; export through OBS boundary instead
```

---

## 21. F5 atomicity and crash boundaries

F5 does not create distributed transaction semantics.

### In-process owner proposal

```text
runtime calls owner handler
→ owner validates
→ owner transaction commits or refuses
→ handler returns decision
```

### Crash after commit before response

```text
owner fact already durable
→ retry uses same existing identity/subject
→ returns prior decision or refuses duplicate
```

### Crash before owner commit

```text
no owner truth exists
→ runtime/3M may retry/recover according to existing run semantics
```

No generic outbox/handoff table is introduced unless a future physical boundary proves direct semantics insufficient.

Named reopen trigger:

> 3J places a runtime behind an asynchronous/unreliable transport where existing owner IDs/write-once facts cannot provide required handoff recovery without a durable transport record.

That is not the current F1 topology assumption.

---

## 22. 3H versus 3I/3J/3L/3M

### 3H-03 freezes

```text
runtime role isolation property
logical Mastra instance/storage/registry separation
same-process isolation qualification requirement
process-split trigger on unavoidable global mutable coupling
domain-ID-first correlation model
0..N traces per domain run
RequestContext authority prohibition
OTel preferred propagation/interoperability property
control F5 versus telemetry separation
owner-specific direct-call-first F5 semantics
Verification Observability multi-layer correlation/capture property
```

### 3I owns

```text
runtime credentials
producer authentication
network/egress trust
incoming trace/baggage sanitization policy details
PII/secrets/redaction policy
telemetry access authorization
malicious guest threat controls
```

### 3J owns

```text
same/separate process/container deployment topology
collector/backend choice and HA
service supervision
OTLP network topology
Sentry/other backend production use
storage/retention operations
runtime blast-radius optimization
```

### 3L owns

```text
exact Mastra version/APIs
cross-instance isolation probes
OtelBridge/exporter qualification
RequestContext metadata mapping
W3C propagation mechanics
E2B telemetry/metadata correlation capability
Spotlight challenger probe
verification capture/sampling mechanism
```

### 3M owns

```text
lost handoff recovery policy when owner fact absent
orphan/lost run timeout
telemetry outage settlement policy where proof required
repeated runtime-correlation/reconnect failure handling
```

---

## 23. Technology qualification / proof obligations

3H-03 adds cross-runtime obligations to the existing Builder/PAR qualification work. No new domain record is implied.

### Isolation

```text
P1  instantiate BuilderMastra and ParMastra in one process with separate persistent stores
    → Builder threads/memory/workflows/schedules never appear in PAR and vice versa

P2  register same symbolic agent/tool/thread names in both instances
    → resolution remains instance-local; no cross-role collision

P3  Builder shell/workspace/E2B tool exists
    → Product Agent projection cannot discover/invoke it

P4  PAR Product Agent/workflow/schedule exists
    → Builder AgentController cannot resolve/use it unless explicitly projected through a legitimate Conexus capability (none in F1)

P5  exercise every enabled process-global Mastra hook/cache/registry surface
    → event/state from one runtime does not affect the other
    → failure triggers separate-process requirement rather than silent bleed
```

### Correlation

```text
P6  Builder ActorRun dispatch
    → Mastra root trace/log contains owner-stamped ActorRun/Change/Project correlation

P7  PAR AgentRun dispatch
    → Mastra root trace/log contains owner-stamped AgentRun/Project/Release correlation

P8  one suspended AgentRun resumes in fresh process with new trace id
    → OBS query by AgentRunId returns both segments; same-run identity preserved

P9  one Builder execution binds E2B
    → OBS can navigate ActorRun ↔ logical sandbox ↔ physical sandbox ↔ provider telemetry

P10 external/guest forged trace/baggage Conexus IDs
    → cannot alter owner-stamped scope/trust

P11 stale RequestContext survives suspend/resume
    → current authority/config is reintroduced; stale context cannot authorize Gateway/PAR/Builder mutation
```

### F5

```text
P12 runtime completion proposal duplicated after lost response
    → one owner terminal transition only

P13 runtime telemetry says complete but no owner proposal/commit occurs
    → owner remains non-terminal

P14 producer payload asserts wrong Project/Change/Run scope
    → owner derives scope from admitted runtime context; spoofed scope rejected/ignored

P15 Builder exact output proposal without Hub custody
    → refused, preserving 3H-01

P16 PAR resumed effect changes proposalRef/args
    → refused, preserving 3H-02/3F-03

P17 schedule-fire proposal redelivered
    → one occurrence/AgentRun admission per 3H-02 cursor law
```

### Verification Observability

```text
P18 material verifier launches exact candidate X in isolated materialization
    → app request/error trace can be correlated to ActorRun + X

P19 injected browser/backend runtime error
    → verifier can retrieve correlated error/log/trace without relying only on test stdout

P20 app disables/omits its telemetry instrumentation
    → required telemetry assertion becomes NOT_PROVEN/INCONCLUSIVE, never PASS

P21 guest emits forged ActorRunId/candidate id
    → provenance remains guest-observed; cannot replace platform-stamped launch association

P22 required verification capture under configured sampling
    → deciding trace is captured or control fails visibly; random sampling cannot silently erase it

P23 E2B provider OTLP unavailable/dropped
    → observation marked missing/degraded; no false platform-authority inference
```

### OTel / backend independence

```text
P24 run with Mastra OtelExporter or equivalent qualified exporter
    → traces/logs reach OBS-compatible endpoint with Conexus correlation

P25 run without experimental OtelBridge
    → causal navigation still works through Conexus IDs even if trace tree fragments

P26 if OtelBridge is enabled
    → W3C parent-child propagation works across Mastra tool → instrumented HTTP/DB call
    → disabling bridge does not break domain correctness

P27 durable Conexus IDs are absent from default high-cardinality metric dimensions
```

Every claimed control must be demonstrated firing.

---

## 24. YAGNI audit

Candidate adds:

```text
new domain module                    = 0
new durable record class             = 0
new Tier-2 FK                        = 0
new runtime bus                       = 0
new queue                             = 0
new workflow engine                   = 0
new handoff ledger                    = 0
new tracing protocol                  = 0
mandatory Sentry/Spotlight            = 0
mandatory OTel Collector              = 0
mandatory process split               = 0
universal Correlation entity          = 0
UniversalRuntimeResult/EventEnvelope  = 0
```

Essential complexity retained:

```text
two role-specific Mastra instances/configs
two already-approved Mastra substrate DBs
owner-stamped correlation facts
OTel-compatible telemetry projection
owner-specific F5 ingress
verification correlation/capture rules
```

---

## 25. Candidate decision sentence

> **3H-03 — Runtime Isolation, Correlation & Handoff:** In Conexus F1, Builder and Production Agent Runtime are realized through distinct role-isolated Mastra instances/configurations backed respectively by `mastra_builder` and `mastra_par`, with no shared mutable agent/workflow/thread/memory/tool authority; same-process co-location is admissible only while all enabled F1 Mastra facilities prove cross-instance isolation, and any unavoidable load-bearing process-global coupling triggers a later 3J/3I process split rather than a custom provider framework. Conexus owner IDs remain the durable causal anchors while Mastra/E2B/provider trace, span, run, thread, sandbox and tool refs are runtime observations, so one ActorRun/AgentRun may span multiple traces across suspend/restart. Owner-stamped correlation is projected through RequestContext/tracing metadata and OpenTelemetry-compatible propagation where qualified, but external/guest trace/baggage and persisted RequestContext never carry domain authority; a unified experimental OtelBridge trace tree is optional, not correctness-critical. Runtime control handoff is a direct-call-first, owner-specific F5 proposal path distinct from degradable Operational Telemetry; telemetry completion never substitutes for Builder/PAR owner admission or terminal truth, and no universal runtime envelope/bus/handoff ledger is introduced. Verification Observability correlates exact candidate/ActorRun context across Mastra, E2B provider telemetry and app-under-test traces/logs/errors with explicit producer provenance, and verification assertions that require runtime evidence use an always-capture/equivalent policy or become NOT_PROVEN when evidence is missing. Exact process topology, credentials/trust/redaction, collector/backend, recovery policy and technology mechanisms remain 3I/3J/3L/3M concerns.**

---

## 26. Questions for Fable — Round 1

### A. Scope / phase boundary

1. Is 3H-03 correctly one final runtime decision before 3H-R1, or does Verification Observability deserve a separate 3H-04 because it has independent failure classes?
2. Did ChatGPT pull process topology from 3J into 3H by freezing two Mastra instances/configs?
3. Did any 3I trust/security decision leak into the candidate rather than merely defining a later boundary?
4. Which sections only restate 3C-13/3H-01/02 and should be demoted from normative 3H-03?

### B. Mastra runtime isolation

5. Verify current Mastra source: are `agents`, `workflows`, `storage`, `tools`, memory and AgentControllers actually instance-owned in the paths we use?
6. Search current source for **all process/module-global mutable state** reachable by enabled F1 Builder/PAR features, not only scorer hooks.
7. Can two Mastra instances safely coexist in one Node process with separate Postgres stores without hidden default/global registries crossing them?
8. Does current Observability/AsyncLocalStorage or logger machinery introduce cross-instance mutation or only process-wide context plumbing?
9. Can a Mastra Agent/AgentController internally resolve resources from another Mastra instance through static/global fallbacks?
10. Is the process-split trigger globally superior to simply mandating separate processes now?
11. Is there a current load-bearing reason separate process must already be architecture, considering Builder privilege/power?
12. Is there a cheaper isolation control than two Mastra instances that still respects `mastra_builder != mastra_par`?
13. Could two Mastra instances share an immutable model/provider client safely, or should 3H-03 prohibit that too?
14. Should `Agent Editor`, schedule worker and background-task worker existence be explicitly absent from BuilderMastra unless consumed?
15. Construct a same-process test that causes actual cross-role state bleed under current source.

### C. Tool/runtime surface isolation

16. Does the Builder shell/E2B tool surface have any current Mastra registration route that could become globally visible to PAR?
17. Does tool resolution happen strictly on the Agent/Workspace/instance context, or are there global toolsets that need explicit negative qualification?
18. Should Product Agent browser/workspace/code-execution capability, if later enabled, require a distinct sandbox runtime rather than reuse Builder E2B lineage?
19. Is that last question 3I/Decision Loop rather than 3H-03?

### D. Correlation identity model

20. Is `ActorRunId / AgentRunId → 0..N traces` the correct durable relationship, or should a stable root trace ID be persisted and reused across resumes?
21. Construct a failure class that requires one trace ID across process restart instead of domain-ID correlation.
22. Does forcing one trace across days-long suspended AgentRun violate tracing semantics or backend retention assumptions?
23. Which Conexus IDs are truly load-bearing trace metadata versus too many fields on every span?
24. Should only root spans carry the full correlation set while child spans inherit trace context?
25. Can Mastra `requestContextKeys` safely stamp correlation metadata without duplicating it on every span excessively?
26. Should `ReleaseRef` be trace metadata on PAR runs or resolved via AgentRun when querying OBS?
27. Should candidate digest/output identity be trace metadata for Builder verification, or only a separate OBS causal edge?

### E. OTel / Mastra observability

28. Is `OtelExporter` sufficient for F1 correlation, given it exports Mastra spans/logs but does not itself make external OTEL code child spans?
29. Does the experimental `OtelBridge` offer enough value that we should ADOPT it probe-gated rather than merely optional?
30. What exact failure class would make `OtelBridge` mandatory?
31. Are Mastra trace IDs valid W3C/OTel trace IDs on every current path, especially explicit `tracingOptions.traceId`?
32. Does current Mastra correctly correlate logs to traces under OtelExporter/Bridge?
33. Can current Mastra sampling be selected from server-stamped RequestContext metadata as assumed?
34. Is always-capture for material verification technically realizable without forcing all platform telemetry to 100%?
35. Is high-cardinality Run ID metadata safe on traces/logs but inappropriate on metrics as proposed?
36. Could an exemplar-based metric correlation be useful later without Run IDs as metric dimensions?
37. Does this belong entirely to 3L and not need mention in 3H-03?

### F. RequestContext / stale authority

38. Verify which current Mastra paths persist RequestContext across suspend/resume and which do not.
39. Can a direct Agent suspension preserve RequestContext values in a way that survives process death?
40. Construct stale-authority replay using RequestContext with changed Project/role/binding after suspension.
41. Is the law “RequestContext may carry correlation/config, never mutable authority” sufficient, or do we need an allowlist frozen in architecture?
42. Could model/provider/tool projection itself legitimately depend on RequestContext while remaining exact Release-pinned?
43. If yes, what prevents old RequestContext from selecting different tools on resume?

### G. OpenTelemetry context/baggage trust

44. Is using W3C trace context from an external caller safe as diagnostic parentage if authority is independently derived?
45. Should external traceparent be ignored at a privilege boundary to prevent trace poisoning, or can 3I decide?
46. Should Conexus owner IDs ever go in OTel baggage, or is RequestContext + span metadata safer by default?
47. If IDs travel to app-under-test through environment/header context, what prevents them from leaking to external third-party calls?
48. Does the candidate correctly defer detailed propagation/redaction to 3I while freezing only the authority prohibition?

### H. F5 control handoff

49. Is direct in-process typed owner ingress the correct F1 wire realization for F5?
50. Does any current runtime producer require a durable queue/outbox before owner handling?
51. Construct crash-after-owner-commit-before-response and prove existing owner facts are sufficient without a handoff ledger.
52. Construct crash-before-owner-commit and identify who retries/reconciles without a generic F5 record.
53. Is runtime `complete` better represented as a direct return from `generate/stream` rather than a separate proposal call in some paths, and does that change semantics?
54. Should F5 OBSERVATION_APPEND and PROPOSAL use separate owner methods mechanically, or is semantic separation enough?
55. Does any proposed F5 owner-specific payload accidentally become a hidden `UniversalRuntimeResult`?
56. Can runtime producer-supplied `ActorRunId/AgentRunId` ever be trusted in-process, or should the handler always capture identity from a closure/opaque runtime handle?
57. How should out-of-process future callbacks derive owner context without putting auth details into 3H?

### I. Telemetry versus control

58. Can Mastra completion telemetry and owner completion proposal be emitted from one callback without creating atomicity assumptions between OBS and owner write?
59. Which order is safer if both are produced: owner proposal first or telemetry first?
60. Is there any need for an OBS-to-owner feedback path during normal runtime completion?
61. Can a verifier/QA convert an observed runtime error into a Builder Finding proposal without making OBS the owner?
62. Should that conversion be explicitly mentioned, or is it later 3N/implementation?

### J. Verification Observability

63. Are Mastra + E2B + app-under-test the correct three observation layers, or is Gateway/managed serving a fourth independent layer that must be explicit?
64. Does E2B's current OTLP export include enough sandbox identity metadata to correlate provider logs/metrics to an ActorRun without custom provider changes?
65. If E2B OTLP is best-effort, can it ever be required deciding Evidence, or only supplemental provider observation?
66. Is platform-stamped launch correlation technically enforceable when app-under-test controls its own OTel SDK?
67. Should a platform-side proxy/collector attach immutable sandbox/ActorRun resource attributes instead of trusting guest attributes?
68. Is that a 3J/3I mechanism rather than 3H law?
69. Does current Spotlight still materially improve local verifier investigation enough to justify a 3L challenger probe?
70. Could Spotlight's Sentry SDK requirement make it unsuitable for polyglot generated apps compared with OTel auto-instrumentation?
71. What is the globally superior baseline for browser telemetry, where server-side OTel auto-instrumentation alone is insufficient?
72. Should browser console/network capture be a separate Verification Observability source even without Sentry/OTel SDK?
73. Does the candidate need to freeze browser instrumentation at all now?

### K. Sampling / proof

74. Is “material verification-required telemetry cannot be randomly sampled away” a necessary architecture law or merely test configuration?
75. Can custom sampling itself fail or be bypassed by guest code?
76. Should always-capture be applied only to platform/Mastra traces while guest/app telemetry remains independently best-effort?
77. If app telemetry is required proof and is missing, does `NOT_PROVEN` fully close the class?
78. Does 100% tracing in local verification introduce unacceptable performance distortion for some assertions?
79. Should the exact capture policy be assertion-specific rather than global material verification?

### L. Metrics / cardinality / cost

80. Is the rule against per-run metric dimensions justified and correctly scoped?
81. Which low-cardinality runtime dimensions are useful enough to name architecturally, if any?
82. Should cost/token usage remain trace/log/event data and separately aggregated into OBS cost projections, rather than direct per-run metrics?
83. Does Mastra already provide metrics semantics that conflict with this candidate?

### M. Storage / backend

84. Is rejecting `MastraStorageExporter` as the sole Conexus OBS path necessary under 3E-01?
85. Could OBS access Mastra telemetry through a public Mastra API without querying tables and thereby safely use MastraStorageExporter as one backend?
86. Would that be globally superior to direct OTLP export?
87. Is an OTel Collector required to merge Mastra/E2B/app telemetry, or can direct exporters to one backend satisfy the property?
88. Does naming “OBS/OTel pipeline” accidentally pre-decide 3J topology?

### N. Process topology / deployment

89. If Builder and PAR stay same-process, is a crash of one affecting both acceptable under approved F1, or does operational isolation already require two processes?
90. Could an unhandled exception or memory exhaustion from a Builder agent path take down Product Agent serving and create a material current failure class?
91. If yes, is that 3J availability architecture or 3H runtime isolation?
92. What measured/current consumer or SLO would justify the split now?
93. Would forcing separate processes now create a second internal RPC protocol that is more accidental complexity than benefit?

### O. YAGNI / Global Maximum

94. Which candidate rule is most deletable while preserving all current failure classes?
95. Which rule is overengineering disguised as observability rigor?
96. Which deferred mechanism is actually load-bearing now and should be pulled into 3H-03?
97. Is two Mastra instances + OTel + direct F5 still the Global Maximum?
98. Strongest argument for one shared Mastra instance.
99. Strongest argument for mandatory process separation now.
100. Strongest argument for a durable RuntimeBus/handoff ledger.
101. Strongest argument for Sentry/Spotlight as the primary platform observability protocol.
102. Final recommendation: `CURRENT STRUCTURE CONFIRMED`, `RESTRUCTURE NOW`, `TRANSITIONAL SOLUTION`, `STOP/SPLIT PREREQUISITE`, or `DEFER SAFELY`.
103. State whether 3H-03 is ready for ChatGPT consolidation/operator review or requires another adversarial round.

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

Do not modify `LEDGER.md`, approved authority or product code. Append `Round 1 — Fable` to this dialogue file and commit/push only this dialogue change.

---

# Round 1 — Fable

**Role:** independent adversarial Senior/Staff/Principal Software Engineer + Software Architect.
**Authority reconstructed from:** `AGENTS.md` → method → `DECISOES.md` (esp. C-012/C-013/C-016/C-017) → `LEDGER.md` → 3C-13, 3D-R1, 3E-01/02, 3F-02/3F-R1, 3G-R1, 3H-01, 3H-02. This dialogue treated as proposal only.
**Method:** DevelopmentConexus Engineering Method v1.0.0. Nothing here approves 3H-03.

---

## 27. External evidence verified this round

Evidence IDs `F1..F7` are local to this round (ChatGPT's `R1..R11` retained as cited).

| ID | Verified fact | Source |
|---|---|---|
| F1 | OTel **baggage**: "There are no built-in integrity checks to ensure that Baggage items are yours"; automatic instrumentation "includes Baggage in most of your service's network requests"; "downstream services could propagate Baggage outside your network." | opentelemetry.io baggage concepts (current) |
| F2 | `OtelBridge` (experimental) creates native OTel spans against **"your globally configured OpenTelemetry SDK"** and forwards Mastra logs to **"the globally registered OpenTelemetry LoggerProvider"** — the OTel JS pipeline is process-global by design. `OtelExporter` runs its own provider with per-signal toggles/batching. `tracingOptions.traceId/parentSpanId` accepts ids extracted from an active OTel span context (W3C-format compatible in the documented path). | Context7 `/mastra-ai/mastra` `integrations/observability/opentelemetry.mdx`, `reference/observability/tracing/bridges/otel.mdx`, `observability/otel-exporter/README.md`, `docs/observability/tracing/overview.mdx` |
| F3 | Mastra instance config owns `storage`, `agents`, `workflows`, `memory` registry, `pubsub` — all per-instance constructor options; `MastraStorageExporter` requires the instance's configured storage. No additional process-global mutable registry surfaced in the queried docs beyond the known module-level hooks emitter (R2). | Context7 `/mastra-ai/mastra` configuration/reference docs |
| F4 | `WorkflowRunState` (persisted snapshot) includes `requestContext` — RequestContext **is persisted across suspend/restart** in the workflow-snapshot family that also backs agent suspension. | `packages/core/src/workflows/types.ts` (verified in the 3H-02 dialogue evidence chain, current source) |
| F5 | E2B sandbox metrics: CPU/memory/disk sampled ~5s, **retrieved by pull** (`sbx.getMetrics()`, `e2b sandbox logs/metrics <sandboxId>`). The metrics page documents **no OTLP push export, no export metadata fields, no delivery guarantees**; an OTel-export surface appears in docs navigation but its shape/identity metadata could not be verified at primary source this round. | docs.e2b.dev/sandbox/metrics (current) |
| F6 | Spotlight (current): local-only debugging, desktop app, "real-time local errors, traces, and logs to your agent via MCP" (Cursor/Claude Code and other MCP editors); **requires Sentry SDK instrumentation** (`Sentry.init({spotlight: true})`); production use explicitly discouraged; no OTLP ingestion documented on the main site. | spotlightjs.com (current) |
| F7 | 3C-13 already freezes: `producer_trust ∈ {HUB_AUTHORITY, GATEWAY_AUTHORITY, PROVIDER_OBSERVED, GUEST_OBSERVED}`; OTel as preferred technical boundary; Spotlight as challenger; and "runtime evidence required but absent ⇒ NOT_PROVEN/INCONCLUSIVE, never PASS" (invariant 12). | `3C-13-observability-audit-module-boundary.md` |

Disposition on ChatGPT's R1–R11: accurate except **R9, which is partially unverified** — the OTLP push-export claim for E2B could not be confirmed at primary source; the verified provider-observation path is SDK/CLI **pull by `sandboxId`** (FBL-R1-01 below).

---

## 28. Verdict up front

1. **No material Finding against approved authority.** No reopen of 3C-13/3D/3E/3F/3G/3H-01/3H-02.
2. **Alternative A is the Global Maximum**; B correctly deferred with trigger, C/D/E correctly rejected. The process-split *trigger* is globally superior to a mandatory split now (§31 Q10/Q11).
3. Six corrections, all bounded: E2B provider-export claim rewritten to the verified pull path (FBL-R1-01); role attribution under the process-global OTel pipeline made mechanical (FBL-R1-02); §17's layer language mapped onto the existing `producer_trust` taxonomy instead of a second ontology (FBL-R1-03); Conexus IDs banned from OTel baggage by default with verified leak evidence (FBL-R1-04); RequestContext protected by a rebuild-on-resume law rather than prose prohibition (FBL-R1-05); F5 in-process identity derived from the dispatch closure, not producer payload (FBL-R1-06).
4. Several sections are restatements to demote (§31 Q4); nothing rises to overengineering after the §11.4 trim.
5. Disposition: **CURRENT STRUCTURE CONFIRMED** with FBL-R1-01..06; one ChatGPT consolidation round, then operator-ready.

---

## 29. Material findings

Format: claim challenged / counterexample / authority affected / evidence / smallest correction / Global Maximum effect / reopen / later owner.

### FBL-R1-01 — E2B provider telemetry: the verified path is pull-by-`sandboxId`; OTLP push is unverified and must not be load-bearing

- **Claim challenged:** R9 and §17.2/§23-P23 lean on E2B OTLP push export ("e2b.* resource metrics… via OTLP HTTP/protobuf… best effort") as the provider-observation mechanism.
- **Evidence:** F5 — the current metrics documentation shows SDK/CLI pull (`getMetrics`/logs, keyed by `sandboxId`), with no OTLP export shape, no identity-metadata fields, no delivery semantics verifiable at primary source this round.
- **Why this matters:** if the candidate's provider layer depends on an unverified push surface, P23 tests a mechanism that may not exist in the pinned version, and Verification Observability quietly loses its provider layer. The pull path is not a downgrade — it is **inherently correlated**: the platform queries metrics/logs for a physical `sandboxId` it already pinned to the ActorRun (3H-01), so provider observations arrive pre-associated with no trust in guest-supplied fields. This is also exactly the already-approved C-013 shape ("E2B = resumo por run"; 5s samples not imported; `metrics_state COMPLETE|PARTIAL|MISSING`).
- **Smallest correction:** reword the provider layer as: *provider observations are obtained by platform-side pull keyed by the pinned physical `sandboxId` (verified current mechanism), summarized per run under existing C-013 semantics; provider OTLP push export, if 3L verifies it exists with sufficient identity metadata, is an optional enhancement, never a required evidence path.* P23 becomes: pull unavailable/partial ⇒ `metrics_state` degraded honestly; no false authority.
- **Reopen:** no. **Later owner:** 3L (verify push surface), 3J (if adopted).

### FBL-R1-02 — Role attribution must survive the process-global OTel pipeline

- **Claim challenged:** §7 isolates the two Mastra instances, but §11 routes both through OTel — and F2 shows the bridge/logger path is **globally registered by design**. One process ⇒ one global tracer/logger provider serving both roles.
- **Counterexample:** BuilderMastra and ParMastra both emit through the global SDK; a config slip gives both the same `serviceName`/resource identity; OBS can no longer distinguish Builder runtime observations from PAR runtime observations — provenance blur inside a single trust class, silently corrupting Verification Observability queries and any per-role diagnosis.
- **Smallest correction:** freeze: *every span/log/metric emitted by a role-specific Mastra instance carries mechanical role-distinguishing identity (distinct `serviceName`/resource attributes per instance Observability config); sharing the process-global OTel pipeline is acceptable context plumbing (Q8), but role attribution is a per-signal fact, never inferred from deployment.* Probe: both instances emit through one global SDK → every signal attributable to exactly one role.
- **Reopen:** no. **Later owner:** exact attribute names → 3L.

### FBL-R1-03 — §17's layers map onto `producer_trust`; no parallel provenance taxonomy

- **Claim challenged:** §17.1 introduces "Layer A/B/C" and §17.3/§12.2 speak of platform-vs-guest provenance — while 3C-13 already froze the provenance vocabulary: `HUB_AUTHORITY | GATEWAY_AUTHORITY | PROVIDER_OBSERVED | GUEST_OBSERVED` (F7).
- **Failure class:** two provenance vocabularies for the same meaning is the presumed-wrong duplicate-authority pattern (method §3, "two authorities for the same meaning"); implementers would map them ad hoc, and acceptance-eligibility rules (only HUB/GATEWAY authority feeds acceptance) would need re-derivation.
- **Smallest correction:** state that the three observation layers are *sources*, classified by the existing `producer_trust` axis: Mastra runtime telemetry (hub-process, non-authority) and E2B provider pull → `PROVIDER_OBSERVED`-class runtime observation under the C-013 versioned mapping; app-under-test/guest → `GUEST_OBSERVED`; owner/Gateway records → `HUB_AUTHORITY`/`GATEWAY_AUTHORITY`. Q63 dissolves: Gateway is not a "fourth layer" of §17.1 — it is an authority producer already in the taxonomy; effect verification consumes `GATEWAY_AUTHORITY` receipts, not runtime telemetry.
- **Reopen:** no.

### FBL-R1-04 — Conexus owner IDs never ride OTel baggage by default

- **Claim challenged:** §12.3 bans sensitive payloads in baggage but leaves ID placement open (Q46/Q47).
- **Evidence:** F1 — baggage has no integrity, is attached by auto-instrumentation to *most outbound requests*, and propagates beyond the network boundary. An app-under-test with auto-instrumentation calling any third-party endpoint would exfiltrate `ActorRunId`/`ProjectId`-class identifiers as a side effect of correlation plumbing.
- **Smallest correction:** freeze: *Conexus owner IDs are carried in RequestContext, span/log attributes and resource metadata — never in OTel baggage by default. Any future baggage use requires an explicit 3I decision including egress stripping.* This is the correlation-side complement of the §12.1 authority prohibition, with a verified leak mechanism instead of hypothesis.
- **Reopen:** no. **Later owner:** 3I (propagation/redaction policy details, as already routed).

### FBL-R1-05 — RequestContext: rebuild-on-resume law, not prose prohibition

- **Claim challenged:** §10.1/§10.2 forbid authority in RequestContext, and Q41 asks whether a frozen allowlist is needed.
- **Evidence:** F4 — `requestContext` is a persisted field of the workflow snapshot family backing suspension. Whatever is in it *will* come back verbatim after restart.
- **Why prohibition alone is weak:** "don't put authority in it" fails silently the first time an implementer adds a convenient flag; the snapshot then resurrects it. An architecture-frozen key allowlist is the wrong fix (freezes implementation detail into authority).
- **Smallest correction:** freeze the mechanism instead: *at every dispatch/resume, the owner **rebuilds** the runtime context from current owner facts and overwrites what the snapshot carried; snapshot-carried context is diagnostic residue only.* This is the exact 3H-01 "mechanically applied, unconditionally" / 3H-02 "guarded resume" pattern extended to the context object. Q42/Q43 then answer themselves: tool/model/permission surfaces apply mechanically from the pinned composition (3H-02), so a stale context cannot select tools on resume even in principle. Probe (extends P11): poison the snapshot context with a changed role/binding/config flag → resumed execution observably uses rebuilt values.
- **Reopen:** no.

### FBL-R1-06 — In-process F5 identity derives from the dispatch closure, not producer payload

- **Claim challenged:** §14.3 has the owner derive scope from admitted context, but Q56 remains open: in-process, may the handler trust producer-supplied `ActorRunId/AgentRunId`?
- **Failure class:** an in-process runtime adapter holding N concurrent runs mis-wires a callback (classic closure/loop bug) and reports completion for run B with run A's payload id; a handler trusting payload ids commits the wrong run's terminal. No malice needed.
- **Smallest correction:** freeze: *the owner-side handler obtains run identity from the dispatch-scoped closure/opaque handle established at admission; producer-payload ids are cross-checks that must match or the proposal is refused.* One sentence; kills the whole mis-attribution class in-process, and out-of-process transports later inherit the same rule via authenticated context (Q57 → 3I/3J).
- **Reopen:** no.

---

## 30. Block A — scope (Q1–Q4)

- **Q1 —** one decision is correct: Verification Observability shares the correlation model, provenance taxonomy and capture laws with the rest of 3H-03; a 3H-04 split would force cross-references for every shared law and duplicate the evidence base. Independent failure classes exist but hang off the same invariants.
- **Q2 —** no: two role-specific instances/configurations is the *logical runtime realization* forced by the already-ratified `mastra_builder != mastra_par` storage split (storage is an instance property, F3/R1 — one instance cannot honor two stores). Process/container placement stays 3J, with the split trigger as escape valve. Correctly scoped.
- **Q3 —** no 3I leak found. The baggage law (FBL-R1-04) sits at the border but is an authority/correlation prohibition (3H's), with policy mechanics explicitly routed to 3I.
- **Q4 — demote to restatement:** §2 entirely; §13's audit paragraph (3C-13); the NOT_PROVEN core of §17.4 (3C-13 invariant 12 — keep only the *capture-policy* addition as new); §15/§16 (3H-01/3H-02 restates with only the correlation deltas new); §19's ADOPT/challenger table (3C-13 already froze it — keep only the 3L probe pointer). The genuinely new 3H-03 laws: instance isolation + qualification + split trigger, domain-ID-first correlation with 0..N traces, context rebuild law, OTel-preferred-but-optional-bridge, channel separation, direct-call F5 semantics, verification capture policy, cardinality prohibition, and the FBL corrections.

---

## 31. Block B/C — Mastra isolation, tools (Q5–Q19)

- **Q5 —** verified to the extent current docs/source expose it: storage/agents/workflows/memory/pubsub are instance constructor config (F3, R1); the AgentController lives on its instance. Full source sweep of every internal path is a 3L probe obligation (P5), not a dialogue-provable fact — the candidate correctly makes qualification, not assumption, the gate.
- **Q6 —** known module-global surfaces found: the hooks emitter (R2, with owner tokens in normal scorer use but broadcast for unowned public hooks) and the **OTel global provider/logger** (F2 — by OTel design). The first is covered by P5 + the fixture below; the second is FBL-R1-02. No other module-global mutable state surfaced in queried docs; absence is not proven — hence P5's sweep framing is right.
- **Q7 —** yes, per current evidence, with P1/P2 as the proof; hidden global fallbacks are exactly what P5 hunts.
- **Q8 —** the OTel/logger machinery is process-wide **context plumbing**, not cross-instance domain mutation — acceptable with mechanical role attribution (FBL-R1-02). AsyncLocalStorage-based context follows async chains, not instances; concurrent Builder/PAR executions keep separate chains.
- **Q9 —** no static cross-instance resolution path surfaced in current docs; P2/P4 are the negative proofs. The one documented global-ish behavior remains unowned hook broadcast (R2).
- **Q10/Q11 —** the trigger is globally superior. Mandating the split now buys isolation we cannot name a current failure class for, at the price of an internal RPC boundary, supervision, and dev friction (Alternative B costs) — while the trigger converts any *discovered* unavoidable coupling into the split at 3J time. Builder privilege/power is not a process-boundary argument in F1: the dangerous powers live in E2B guests and behind Gateway/credential custody (control-side, 3A-R5/C-008), not in the hub process address space; residual hub-process trust is 3I's threat model.
- **Q12 —** none cheaper exists: one instance cannot satisfy two storages (F3), so two instances is the floor 3E-01 already paid for.
- **Q13 —** sharing immutable/stateless clients (model/provider SDK objects) is mechanism sharing — admissible; the law's "mutable" qualifier already draws the right line. Do not over-prohibit.
- **Q14 —** yes, and generalize it: *each instance enables only the facilities its role consumes* (no Editor, no schedule worker, no background workers on BuilderMastra; no AgentController on ParMastra). Config minimalism is the cheapest attack-surface control in the whole candidate.
- **Q15 — constructed bleed fixture:** register an unowned public hook listener via ParMastra's process context; trigger a Builder-side path that emits through the module-level emitter; listener fires with Builder-originated data (R2 broadcast behavior). Qualification must show either owner-token filtering covers every enabled emission or the event cannot influence PAR execution. This becomes the concrete P5 fixture.
- **Q16/Q17 —** no global toolset registration route surfaced in current docs — tools attach per agent/workspace/instance config; P3 remains the negative qualification. 
- **Q18/Q19 —** yes and yes: future Product Agent code-execution capability gets its own sandbox lineage decision at its Decision Loop/3I — 3H-03 only needs the already-stated fact that Builder E2B lineage is Builder-instance-scoped.

---

## 32. Block D — correlation model (Q20–Q27)

- **Q20 —** `0..N traces` is correct. A persisted reused root-trace-id across resumes produces trace trees whose segments arrive days/weeks apart — real backends bound span-arrival windows and completeness assumptions; the "one eternal trace" would render worse than linked segments (Q22: yes, it violates practical tracing/retention semantics). Domain-ID query assembles the full causal history regardless.
- **Q21 —** none constructible: any consumer that "needs one trace id" actually needs *navigation*, which the domain-ID anchor provides; a trace id has no authority meaning and its continuity buys nothing the anchor doesn't.
- **Q23/Q24 —** root/dispatch spans carry the full owner correlation set; children inherit via trace context — freeze exactly that property (root-stamped, inherited) and leave the field list to 3L. Load-bearing set: Workspace/Project/run-family IDs + runtime role.
- **Q25 —** yes — R6's allowlisted `requestContextKeys` extraction exists for precisely this; per-span duplication cost is a 3L tuning concern.
- **Q26 —** resolve `ReleaseRef` via AgentRun at query time; stamping it on the root span is a cheap optional optimization, not law.
- **Q27 —** candidate/output identity is stamped at the verification **launch boundary** (§17.2, where it is already known); OBS causal edges (C-013 lineage) remain the durable association. Both exist already — no new mechanism.

---

## 33. Block E/G — OTel, trust (Q28–Q48)

- **Q28 —** yes for F1: `OtelExporter` exports Mastra spans/logs under its own provider (F2); external code's spans live in their own segments, linked by Conexus IDs — sufficient because no invariant requires one tree (§11.3).
- **Q29/Q30 —** keep OPTIONAL, probe-gated (not ADOPT): the bridge is experimental and its value is navigation convenience (unified tree through instrumented HTTP/DB/tool code). It becomes mandatory only if a *required* verification correlation provably cannot be achieved by ID-linked segments — no such class is constructible while launch-boundary stamping exists (Q30 answered: none).
- **Q31/Q32/Q33 —** documented paths are W3C-compatible (F2 shows extraction from OTel span context into `tracingOptions`); every-path validity, log-trace correlation fidelity and RequestContext-driven sampling selection are 3L probe items (P24/P26 + a sampling probe). Current evidence supports feasibility; none of it needs architecture text.
- **Q34 —** yes: per-instance/per-config Observability with distinct sampling (F2/R6) means a verification-scoped config can run always-capture while ordinary telemetry stays sampled — no global 100% required.
- **Q35/Q36/Q37 —** yes; exemplars are a later optional note; the *prohibition* (no owner IDs as default metric dimensions) stays in 3H-03 because it protects a boundary implementers cross by habit — the rest of metrics design goes to 3L/3J (trim §11.4's dimension suggestions to illustrative status).
- **Q44/Q45 —** external `traceparent` as diagnostic parentage after sanitization is fine *below* privilege boundaries; at privilege/ingress boundaries prefer new-root + span-link so an attacker-supplied context cannot poison sampling/parentage; exact policy is 3I's — 3H-03 freezes only "authority is never derived from propagated context" (already invariant 13).
- **Q46/Q47 —** answered by FBL-R1-04 with F1 evidence: baggage leaks by design; RequestContext + span attributes are the default carriers; ID-bearing baggage requires a 3I decision.
- **Q48 —** yes, with FBL-R1-04 the deferral is now explicit rather than implicit.

---

## 34. Block F — RequestContext (Q38–Q43)

- **Q38/Q39 —** verified: the workflow snapshot family persists `requestContext` (F4); direct-Agent suspension rides the same snapshot storage (R5 + 3H-02 V1). Assume survival everywhere; design for it.
- **Q40 —** construction: AgentRun suspends with context `{binding: B1, role: R1}`; Project rebinds to B2 and role narrows; fresh process resumes; a tool reads context and calls Gateway "under B1". With FBL-R1-05 the rebuilt context says B2 — and even without the read, Gateway re-resolves current binding authority at admission (3G-06/3H-02), so the class is doubly closed: context rebuild (first line) + owner guard (last line).
- **Q41 —** rebuild-on-resume law (FBL-R1-05) — stronger than prose, cheaper than a frozen allowlist.
- **Q42/Q43 —** yes, context may parameterize projection *inputs* (correlation, request-scoped config), but the load-bearing surfaces (model/tool/permission) apply mechanically from the pinned composition at dispatch/resume (3H-02 law) — old context cannot select tools because tools are never selected *from* context.

---

## 35. Block H/I — F5 handoff, telemetry vs control (Q49–Q62)

- **Q49 —** yes: direct typed owner ingress is the 3D-R1-consistent realization; transport is semantics-free per 3F-02 rule 5.
- **Q50 —** none: every current producer proposal lands on a write-once/guarded owner fact (§14.5 enumeration) that makes redelivery idempotent — an outbox would duplicate that protection at the transport layer.
- **Q51 —** crash-after-commit-before-response: Builder output re-presentation hits `producedOutputRef` idempotent read-back (3G-03 §7.2); PAR completion retry hits terminal write-once and returns the recorded decision; schedule-fire redelivery hits the occurrence cursor (3H-02). Every owner fact needed already exists; no ledger.
- **Q52 —** crash-before-commit: no owner truth exists; the runtime retries per its own semantics (re-present output, re-propose completion) or the run enters the orphan path (3M). The retry *authority* is the producer's existing run context — no generic F5 record required.
- **Q53 —** correct and worth stating: for in-process direct Agents, "completion proposal" is often just the code path after `await generate()` returns. That is an admissible F5 carrier — F5 is rules, not shape (3F-02); the owner guard still runs. No semantics change; add one sentence so implementers don't invent a redundant self-call.
- **Q54 —** semantic separation suffices; method topology is implementation.
- **Q55 —** no — the §14.6 families are owner-specific and remain so; the only risk pattern would be a shared base type carrying semantics, which the law already bans.
- **Q56 —** closed by FBL-R1-06 (closure-derived identity, payload as cross-check).
- **Q57 —** out-of-process callbacks derive owner context from the authenticated transport session + owner lookup; 3H-03 keeps only "owner derives scope" (already §14.3); mechanics → 3I/3J.
- **Q58/Q59 —** the channels are **decoupled by design** — no atomicity assumption exists to protect. Emitting both from one callback is fine; recommended convention: owner proposal first, telemetry second (a crash between them then leaves committed truth + missing telemetry, which is the degradable direction; the reverse leaves S8, also safe but noisier). Convention, not law.
- **Q60 —** none: OBS is a sink (3C-13); normal completion needs no OBS→owner path.
- **Q61/Q62 —** already covered by existing authority: a verifier is an ActorRun whose report proposes Findings through Builder admission (C-017/3G-02); OBS never becomes the owner. Demote — no new text needed.

---

## 36. Block J/K — Verification Observability, sampling (Q63–Q79)

- **Q63 —** layers correct as *sources*, classified by `producer_trust` (FBL-R1-03); Gateway is an authority producer, not a fourth telemetry layer.
- **Q64/Q65 —** FBL-R1-01: pull-by-`sandboxId` is the verified, inherently-correlated mechanism; provider push export is unverified and never required-deciding evidence. Best-effort provider data enters as `PROVIDER_OBSERVED` with honest `metrics_state` absence semantics (C-013).
- **Q66 —** yes, because the platform's association does not depend on guest cooperation: the launch boundary records `ActorRunId ↔ sandboxId ↔ invocation identity` on the platform side regardless of what the guest emits; an uncooperative guest only impoverishes its own layer → NOT_PROVEN for guest-required assertions.
- **Q67/Q68 —** platform-side attachment of immutable resource attributes (proxy/collector) is a good realization and is 3J/3I mechanism — 3H-03 keeps the property (platform-stamped association wins; guest fields stay `GUEST_OBSERVED`).
- **Q69 —** yes — F6 confirms Spotlight currently delivers exactly the local agent-debugging shape (MCP to coding agents); the 3L challenger probe stands as 3C-13 already framed it.
- **Q70 —** the Sentry-SDK requirement is real (F6) but less decisive than it looks: generated apps are born from the Conexus scaffold (C-012), which controls instrumentation as PLATFORM-CONTRACT surface — the platform chooses what the app embeds. Portability still favors OTel-first instrumentation; the probe compares, the architecture does not pre-commit.
- **Q71/Q72/Q73 —** freeze nothing about browser instrumentation now (Q73: no). The realization space — scaffold-embedded instrumentation (C-012 lineage), Builder's browser tooling capturing console/network during verification (a legitimate additional `GUEST/PROVIDER`-class source, Q72: yes), Spotlight challenger — belongs to 3L with C-012 owning the scaffold surface. 3H-03's provenance and capture laws already govern whatever is chosen.
- **Q74 —** necessary as architecture: it is the *capture-policy* consequence of 3C-13's invariant 12 — without it, a realization could satisfy "NOT_PROVEN when missing" while making missingness the common case via default samplers. The law makes required-evidence capture a property, and NOT_PROVEN the exception path, not the steady state.
- **Q75 —** yes — guest code can bypass its own sampling/instrumentation entirely; that is precisely why guest-missing ⇒ NOT_PROVEN (never PASS) and why platform/Mastra layers carry the always-capture obligation (Q76: yes, exactly that split).
- **Q77 —** it closes the false-green class fully; the residual is verification *availability* cost (re-run needed), which is the correct trade.
- **Q78/Q79 —** real concern, correctly resolved by assertion-class awareness: latency/perf-sensitive assertions should not run under distorting 100% capture; the property to freeze is only "required evidence must not be silently sampled away" — the capture policy is per assertion class (Q79: yes), mechanics → 3N/implementation.

---

## 37. Block L/M/N — metrics, storage, topology (Q80–Q93)

- **Q80 —** justified and correctly scoped (R8): per-run dimensions explode cardinality and add nothing traces/logs don't already provide.
- **Q81 —** keep the candidate's list illustrative (role, operation class, outcome class, provider family) — do not freeze names; trim from normative text.
- **Q82 —** yes: cost/usage stays event/trace data aggregated by OBS cost projections (C-013's multi-state cost machinery) — per-run metrics would duplicate that authority.
- **Q83 —** no conflict surfaced in current docs; 3L verifies whatever metrics surface Mastra ships when pinned.
- **Q84 —** yes — necessary consequence of 3E-01's no-cross-store-SQL law.
- **Q85/Q86 —** reading Mastra telemetry via public API into OBS is *possible* but inferior: it couples OBS to runtime read availability, duplicates storage, and inverts the push/projection direction every other producer uses. Export/projection remains globally superior; MastraStorageExporter stays dev/Studio convenience.
- **Q87 —** no collector required: direct exporters to one OBS-compatible endpoint satisfy the property; a collector is a 3J topology choice (P24's "OBS-compatible endpoint" wording already allows both).
- **Q88 —** "OBS/OTel pipeline" is acceptable as a *logical* boundary name; consolidation should add one clarifying line that it does not imply a specific collector/backend topology (3J).
- **Q89–Q92 —** same-process crash coupling is acceptable under approved F1: modular monolith is ratified (3C-01), domain recovery is owner-record-based and independent (§8), and no availability SLO/consumer exists to justify the split — an unhandled Builder OOM killing PAR serving is an *availability* event, 3J's dimension (Q91), with the process-split trigger (§7.5) plus 3J as the escalation path. No measured consumer today (Q92).
- **Q93 —** yes: a forced split now creates an internal RPC protocol, auth surface and supervision graph with zero current failure class — textbook accidental complexity.

---

## 38. Block O — YAGNI / Global Maximum (Q94–Q103)

- **Q94 —** most deletable: §11.4's suggested metric dimensions (keep only the prohibition); §10's projection-target list (illustrative); §19's ADOPT table rows that restate 3C-13.
- **Q95 —** nothing qualifies after the trims; closest was the E2B push-export dependency, which FBL-R1-01 converts from unverified rigor into verified mechanism.
- **Q96 —** pulled in by this round: role attribution under the global OTel pipeline (FBL-R1-02), producer_trust mapping (FBL-R1-03), baggage default prohibition (FBL-R1-04), context rebuild law (FBL-R1-05), closure-derived F5 identity (FBL-R1-06). All are laws on existing acts; zero new machinery.
- **Q97 —** yes.
- **Q98 —** strongest for one shared instance: "one instance, role namespaces, half the config surface." Refuted structurally: storage is per-instance (F3), so a shared instance either violates `mastra_builder != mastra_par` (ratified) or needs a namespacing layer *inside* one store — rebuilding isolation Mastra already gives per instance, with a larger bleed surface (registries, tools, hooks).
- **Q99 —** strongest for mandatory split now: Builder's high-power runtime adjacent to production agent serving in one address space. Refuted for F1: the dangerous capabilities are physically elsewhere (E2B guest, Gateway-mediated credentials); in-process residual risk is a 3I trust-model item; availability blast radius is 3J; and the split trigger already converts any *proven* coupling into the split. Paying the RPC boundary now buys no named class.
- **Q100 —** strongest for RuntimeBus/ledger: "future multi-process topology will need durable handoff anyway." Refuted: §14.5's owner facts already make every current handoff idempotent/recoverable; the named reopen trigger (§21) covers the day an asynchronous transport genuinely lacks recovery anchors — building it now is speculative infrastructure for a topology F1 does not have.
- **Q101 —** strongest for Sentry/Spotlight-primary: best-in-class local DX today, MCP-native agent debugging. Refuted: local-only positioning and Sentry-SDK coupling (F6) versus a platform whose portability boundary is already ratified as OTel (3C-13); the challenger probe captures the DX value without protocol lock-in.
- **Q102 —** **`CURRENT STRUCTURE CONFIRMED`** — with FBL-R1-01..06 and the §30-Q4 demotions/trims.
- **Q103 —** one ChatGPT consolidation round folding the corrections, probe additions below, and trims; then **ready for operator decision**. A further adversarial round is needed only if a correction is contested.

---

## 39. Proof-strategy additions

```text
P28 (new) both Mastra instances emit through one process-global OTel SDK
     → every span/log mechanically attributable to exactly one runtime role
P29 (new) unowned public hook listener registered in one role's context; other role emits
     → event cannot influence the listening role's execution (concrete P5 fixture)
P30 (new) snapshot requestContext poisoned with stale role/binding/config
     → resumed execution observably uses owner-rebuilt context (extends P11)
P31 (new) in-process completion callback mis-wired across two concurrent runs
     → closure-derived identity refuses the mismatched payload; no wrong-run terminal
P32 (new) app-under-test with OTel auto-instrumentation calls an external third-party endpoint
     → no Conexus owner ID present in outbound baggage/headers
P23 (reworded) E2B provider pull unavailable/partial for a run
     → per-run provider summary records degraded metrics_state honestly; no false authority
```

---

## 40. Final disposition

```text
Material Finding against approved authority        = NONE
reopen required                                    = NONE
R9 (E2B OTLP push) evidence status                 = PARTIALLY UNVERIFIED → pull-path law (FBL-R1-01)
process-global OTel pipeline                       = named + role-attribution law (FBL-R1-02)
provenance vocabulary                              = mapped to existing producer_trust (FBL-R1-03)
owner IDs in OTel baggage                          = PROHIBITED by default, evidence-backed (FBL-R1-04)
RequestContext protection                          = rebuild-on-resume law (FBL-R1-05)
in-process F5 identity                             = closure-derived, payload as cross-check (FBL-R1-06)
overengineering                                    = none after trims (§38 Q94)
Alternative A                                      = CONFIRMED Global Maximum
recommendation                                     = CURRENT STRUCTURE CONFIRMED
readiness                                          = ChatGPT consolidation round, then operator decision
```

This round approves nothing. Operator ratification remains the only path to authority.

— Fable, Round 1
