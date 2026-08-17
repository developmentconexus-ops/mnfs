# 3H — ChatGPT ↔ Fable Dialogue — Runtime & Agent Architecture Final Closure — R2

**Status:** FINAL CONSOLIDATION / NON-AUTHORITATIVE  
**Phase:** 3H — Runtime & Agent Architecture  
**Candidate closure:** `3H-R1 — Runtime & Agent Architecture Final Closure`  
**PR:** #40  
**Branch:** `agent/conexus-phase-3-system-design`  
**Starting HEAD:** `da905a8447f0ab99c0beb23450510d944d632b1d`  
**Continuation of:** `3H-FABLE-DIALOGUE-final-runtime-agent-architecture-closure.md`  

**Important:** this file is a final closure consolidation only. It is not authority, does not close 3H, does not update `LEDGER.md`, does not constitute C-018, does not authorize implementation or merge, and requires operator ratification before any canonical `3H-R1` closure is materialized.

---

# Round 2 — ChatGPT — Final Closure Consolidation

## 0. Protocol and scope

This consolidation applies the DevelopmentConexus Engineering Method v1.0.0 to the already-approved 3H package:

```text
3H-01 — Builder Coding Runtime Realization & Session/Sandbox Mapping
3H-02 — Production Agent Runtime Realization
3H-03 — Runtime Isolation, Correlation & Handoff
```

Closure question:

> After 3H-01..03, does any current material Runtime & Agent Architecture decision remain unresolved, or can all remaining uncertainty be safely routed to Security, Deployment, Technology Qualification, Recovery, Product/UX, Verification, implementation, or a future Decision Loop triggered by a concrete consumer?

Rules:

1. approved authority is baseline, not dogma;
2. a new 3H decision is justified only by a reachable current failure class whose owner cannot be a later phase;
3. framework/API uncertainty with a frozen property + named probe is not itself a missing architecture decision;
4. no new runtime abstraction is admitted for symmetry or optionality;
5. ChatGPT/Fable agreement is not operator approval.

---

## 1. Independent disposition on Fable closure review

Fable Round 1 returned:

```text
Material Finding against 3H-01/02/03 or prior authority = NONE
missing material 3H decision                             = NONE
3H-04                                                    = NOT JUSTIFIED
reopen                                                   = NONE
verdict                                                  = CLOSE 3H
wording corrections                                     = THREE non-material
```

ChatGPT independently rechecked the three corrections against canonical repository authority.

Disposition:

```text
Fable verdict                         = ACCEPT
material Finding                      = NONE
reopen                                = NONE
additional adversarial round required = NO
candidate closure                     = CLOSE 3H
```

No correction changes a runtime law. All three improve routing/proof visibility only.

---

## 2. Correction 1 — preserve model spend-cap enforcement as explicit 3I input

### Canonical basis

C-008 freezes a guest-readable model capability as bounded by, among other properties:

```text
expires_at <= run TTL
spend cap per ActorRun
fail closed
revocation + reconciliation
```

Later 3A-R5 materially changed the Builder runtime topology so the model loop/long-lived provider credential is control-side rather than a durable secret exposed to E2B.

The **location of enforcement moved**, but the budget invariant did not disappear.

### Closure correction

3H-R1 must explicitly route:

> **Per-ActorRun / per-AgentRun model spend-cap and runtime budget enforcement point, including the C-008 invariant after the control-side credential move → 3I Security/Authority, composed with existing Gateway/budget/admission and C-013 usage evidence.**

Why 3I rather than a new 3H decision:

```text
3H already defines:
run identity
pins
runtime dispatch/resume
correlation

3I must define:
who may spend
which current authority constrains spend
credential/capability custody
revocation/narrowing
last-mile enforcement trust
```

No new `BudgetRuntime`, token broker, generic quota engine or model proxy is created by closure.

### Reopen trigger

Only if 3I proves the budget invariant cannot be enforced through the existing owner/admission boundaries without introducing a new runtime mechanic.

---

## 3. Correction 2 — 3N must prove coherence with C-013 admission-ledger semantics

### Canonical basis

C-013 freezes a generic execution-admission pattern:

```text
persist first
→ reserve atomically
→ dispatch
→ honest terminal

PENDING / PENDING_CAPACITY
→ RESERVED
→ DISPATCHED
→ COMPLETED | FAILED | OUTCOME_UNKNOWN | CANCELLED
```

Later domain architecture intentionally owns concrete state spaces separately:

```text
Builder ActorRun
Production AgentRun
Gateway EffectAttempt
Promotion
...
```

These are not supposed to become a second competing generic attempt ontology.

### Closure correction

Add a mandatory 3N coherence-proof requirement:

> **Verify that Builder ActorRun and Production AgentRun admission realize the applicable C-013 persist-first / reservation / dispatch / honest-terminal semantics without introducing a second parallel attempt machine or reinterpretation of owner states.**

The proof must demonstrate:

```text
owner-local state remains authority
C-013 admission semantics remain a cross-cutting invariant
OBS timeline may project the facts
OBS does not own the lifecycle
no UniversalAttempt entity/state machine is introduced
```

This is proof, not a new runtime decision.

### Why this matters

Without the explicit proof line, an implementer could accidentally build:

```text
ActorRun state
+
AgentRun state
+
generic runtime attempt FSM
```

and create three competing answers to "what is currently executing?".

3H already prohibits that structurally; 3N must now prove the implementation preserves it.

---

## 4. Correction 3 — `job/v1` remains deferred, but mark the Golden Path as a likely near-term trigger

### Canonical basis

C-007 explicitly ratified:

```text
dispatch defer total
```

for the deterministic sync/job execution substrate until the first real consumer exposes the required execution shape.

3D-R1 likewise refused a shared JobQueue/Scheduler abstraction without a current concrete need.

### Strongest candidate for a hypothetical 3H-04

The strongest honest candidate is:

> `3H-04 — Deterministic Job / Sync Execution Substrate`

Potential near-term consumer:

```text
first Golden Path
→ Sankhya mirror/sync
→ cursor + overlap + staging + upsert
```

But the execution substrate cannot be globally selected yet because the real consumer shape determines whether the smallest realization is:

```text
MAR-local deterministic job
PAR SCHEDULE reuse
narrow dedicated worker
another existing runtime seam
```

Choosing one before the consumer exists would violate the method.

### Closure correction

3H-R1 must therefore say explicitly:

> **`job/v1` / sync dispatch remains deferred under C-007's ratified `dispatch defer total`; this is not forgotten work. The first Golden Path sync/mirror implementation is a likely near-term Decision Loop trigger and must resolve the smallest concrete execution substrate before that consumer is implemented.**

Consequences:

```text
3H-04 now = NOT JUSTIFIED
job/sync substrate = not implemented by default
first actual sync consumer = Decision Loop trigger
```

No queue, worker framework, scheduler port or generic Job entity is introduced now.

---

## 5. Full completeness closure

After incorporating the three corrections, every current runtime/agent failure class has an owner.

### 5.1 Builder execution

Owned by 3H-01:

```text
CodingSession cognitive lineage
AgentController/live Session distinction
WorkUnit / ActorRun execution mapping
FRESH_BASE | CONTINUE_LINEAGE
physical sandbox incarnation
quiescence
output custody before presentation
cancel-before-physical-interrupt
fresh verifier cognition/materialization
CodingRuntime observable/control surface
```

Remaining uncertainty:

```text
exact Mastra/E2B mechanics → 3L
orphan/lost policy         → 3M
security/trust details     → 3I
physical topology          → 3J
```

No missing 3H decision.

### 5.2 Production Agent execution

Owned by 3H-02:

```text
Release-pinned RuntimeAgentProjection
AgentRun admission before execution
direct Mastra Agent baseline
selective Workflow only on real deterministic consumer
Conversation/thread mapping
memory-class isolation
selective suspend/resume
ApprovalRequest continuation
sealed proposal/effect identity
Gateway replay sovereignty
boot/re-drive guard
SCHEDULE guarded ingress
stable occurrence property
single-flight / skip semantics
Editor/Stored Agent authority exclusion
EVENT disabled pending first consumer
old Release/runtime continuation
```

Remaining uncertainty:

```text
exact schedule intended-slot mechanism → 3L
recovery/failure settlement            → 3M
deployment coexistence/drain           → 3J
security narrowing/approver trust      → 3I
```

No missing 3H decision.

### 5.3 Cross-runtime isolation and observability

Owned by 3H-03:

```text
BuilderMastra != ParMastra
mastra_builder != mastra_par
role-local PubSub/runtime namespace
no standalone/ephemeral governed runtime
same-process allowed behind qualification
process split only on unpartitionable enabled global mutable state
Conexus IDs as durable correlation anchors
0..N traces per domain run
OTel as observation, not authority
RequestContext rebuild + replace-whole
no owner IDs in OTel baggage by default
F5 control handoff != telemetry
closure-derived in-process proposal target identity
existing producer_trust taxonomy
Verification Observability across Hub/Mastra/E2B/app
E2B pull anchor + best-effort OTLP enrichment
```

Remaining uncertainty:

```text
role attributes / OTel bridge/exporter exact realization → 3L
redaction/egress/baggage trust policy                    → 3I
collector/backend/deploy topology                        → 3J
verification effectiveness                               → 3N
```

No missing 3H decision.

---

## 6. Coherence proof across 3H-01 / 3H-02 / 3H-03

### 6.1 Two runtime shapes are intentional

```text
Builder
→ AgentController / coding harness

Production Agent
→ direct Release-projected Agent
```

No shared `ConexusAgentRuntime` is justified.

They share only the correct lower-level concepts:

```text
Mastra substrate
owner-first authority
F5 semantics
correlation/provenance
isolation contract
```

A universal runtime abstraction would erase real lifecycle differences.

### 6.2 Durable identities remain owner-specific

```text
Builder ActorRun
!= Production AgentRun
!= Mastra run
!= trace
!= sandbox
```

Correlation does not unify lifecycle authority.

### 6.3 Same-process does not mean shared runtime state

```text
same OS process
!= same Mastra instance
!= same store
!= same PubSub namespace
!= same memory/tool registry
```

Process split is escalation, not baseline architecture.

### 6.4 Context replacement does not destroy cognition

`RequestContext` replacement affects runtime configuration/correlation context only.

It does not erase:

```text
Builder persistent cognition thread
PAR Conversation history
runtime suspension snapshot
exact old Release pins
```

Thus stale authority is removed without discarding required durable cognition/state.

### 6.5 F5 remains transport-independent

Current F1:

```text
runtime
→ narrow typed in-process owner call
```

Future split may become:

```text
runtime process
→ authenticated narrow request/reply
→ owner
```

Neither case requires an event bus/outbox unless a future proposal becomes non-rederivable after transport loss.

---

## 7. Routed work after closure

3H-R1 should explicitly leave these later-phase owners visible.

### 3I — Security / Authority

```text
credential custody
principal/trust boundaries
approver eligibility/revocation
browser/workspace/code-exec trust if enabled
DEDICATED delegation
egress/network authority
OTel baggage/redaction/egress rules
current security narrowing/emergency stop
per-run model spend-cap enforcement point
```

### 3J — Deployment / Operations

```text
MANAGED/DEDICATED physical topology
Builder/PAR process split if qualification fires
mastra_par backup/restore
old runtime coexistence/drain/cutover
observability collector/backend if adopted
E2B OTLP production configuration if adopted
```

### 3L — Technology Qualification

```text
CX-BUILDER-MASTRA-01
CX-AGENT-MASTRA-01
CX-RUNTIME-ISOLATION-01
stable schedule occurrence transport
role-local PubSub/default-bucket/external-broker behavior
Mastra global-state sweep at pinned version
E2B pull/OTLP behavior
OTel exporter/bridge qualification
memory/snapshot/version upgrade behavior
```

### 3M — Failure & Recovery

```text
orphan/lost timing and policy
admitted-but-undispatched handling
missing suspension snapshot
OUTCOME_UNKNOWN settlement
output custody repair
repeated quiescence/reconnect failure
operator recovery flows
```

### 3N — Architecture Verification

```text
runtime authority boundary proof
cross-role isolation proof
Verification Observability proof
binding/Release/runtime proof
C-013 admission-ledger ↔ ActorRun/AgentRun coherence proof
no second attempt state machine
```

### Decision Loop / named consumer

```text
job/v1 deterministic sync substrate
first EVENT consumer
Product multi-agent/network
Durable Agent
Observational Memory
pools/failover/shared resources
browser/code-exec Product Agent capability
other optional framework capability
```

---

## 8. Closure criteria

3H can close only if all of the following are true:

```text
[PASS] Builder runtime realization is frozen
[PASS] Production Agent runtime realization is frozen
[PASS] cross-runtime isolation is frozen
[PASS] runtime ↔ owner handoff is frozen
[PASS] correlation/provenance semantics are frozen
[PASS] Verification Observability realization boundary is frozen
[PASS] current framework capability selection/defer decisions are explicit
[PASS] exact technology uncertainties have named 3L probes
[PASS] failure-policy uncertainty is routed to 3M
[PASS] security/trust uncertainty is routed to 3I
[PASS] deployment topology is routed to 3J
[PASS] no current consumer requires a fourth 3H decision
[PASS] strongest 3H-04 candidate was constructed and safely deferred under prior authority
```

Result:

```text
closure criteria = PASS
```

---

## 9. Anti-overengineering closure

Across 3H-01..03 + proposed 3H-R1:

```text
new domain module                     = 0
new generic runtime abstraction       = 0
new universal AgentRuntime            = 0
new durable record class              = 0
new cross-module FK                    = 0
new runtime bus/event bus              = 0
new generic F5 envelope                = 0
new queue                              = 0
new shared scheduler                   = 0
new generic outbox                     = 0
new retry/checkpoint engine            = 0
new lease/fencing subsystem            = 0
mandatory process split                = 0
mandatory OtelBridge/collector/backend = 0
mandatory Durable Agent                = 0
mandatory Observational Memory         = 0
3H-04                                  = NOT JUSTIFIED
```

The package adds guards/properties to existing acts rather than speculative infrastructure.

---

## 10. Reopen triggers after 3H closure

Closing 3H does not make it immutable forever.

Material reopen examples:

```text
CX-BUILDER-MASTRA-01 proves current Builder invariants cannot be realized by the selected substrate
CX-AGENT-MASTRA-01 proves direct Agent/suspend/schedule realization cannot preserve frozen semantics
CX-RUNTIME-ISOLATION-01 proves enabled same-process global state causes unpartitionable cross-role behavior
first real Product Agent requires deterministic multi-step Workflow as baseline rather than local consumer
first real schedule consumer requires every occurrence rather than current skip/latest-state model
first EVENT consumer requires runtime ingress semantics not covered by current authority
first job/sync consumer proves its execution substrate changes a frozen runtime boundary
future process split introduces non-rederivable F5 proposals requiring durable handoff
new Mastra capability materially alters isolation/authority semantics
```

Framework preference, convenience, visual symmetry or "might need later" do not reopen 3H.

---

## 11. Final closure verdict

```text
3H-01                                        = APPROVED
3H-02                                        = APPROVED
3H-03                                        = APPROVED
Material Finding against approved authority = NONE
missing material runtime decision            = NONE
reopen required                              = NONE
3H-04                                        = NOT JUSTIFIED
closure corrections                          = 3 routing/proof visibility items incorporated
3H-R1 candidate                              = CLOSE 3H
next phase after operator ratification       = 3I — Security / Authority Architecture
```

### Candidate 3H-R1 decision sentence

> **3H-R1 — Runtime & Agent Architecture Final Closure:** Runtime & Agent Architecture is CLOSED / APPROVED after reconciliation of 3H-01..03: Builder uses its approved Change-scoped AgentController/CodingSession/E2B realization; Production Agents execute exact Release-pinned direct Mastra Agent projections with selective durable continuation and guarded SCHEDULE ingress; Builder and PAR remain role-isolated through distinct Mastra instances, persistent stores and runtime/PubSub namespaces with same-process deployment allowed only behind qualification; Conexus owner identities and owner state remain sovereign over runtime refs, RequestContext, traces, provider state and telemetry; F5 control proposals remain owner-bound and separate from Operational Telemetry; Verification Observability preserves producer provenance and exact candidate/run attribution; all remaining trust, deployment, technology, recovery and proof questions are explicitly routed to 3I/3J/3L/3M/3N or a consumer-triggered Decision Loop, including the preserved model spend-cap enforcement invariant, C-013 admission-ledger coherence proof and C-007-deferred near-term job/sync trigger; no 3H-04 or new runtime infrastructure is justified.

---

## 12. Operator gate

This file closes nothing.

If the operator approves this closure:

1. materialize `3H-R1-runtime-agent-architecture-final-closure.md` as authority;
2. update `LEDGER.md` to `3H CLOSED / APPROVED`;
3. set `3I — Security / Authority Architecture` as NEXT;
4. preserve the three closure visibility corrections in canonical routing/proof obligations;
5. do not merge PR #40 unless separately and explicitly authorized.
