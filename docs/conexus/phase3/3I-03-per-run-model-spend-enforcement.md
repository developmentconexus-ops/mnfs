# 3I-03 — Per-ActorRun / Per-AgentRun Model Spend Enforcement

**Status:** APPROVED pelo operador em 2026-08-17  
**Fase:** 3I — Security / Authority Architecture  
**Authority:** terceira decisão aprovada de 3I  
**Importante:** esta decisão não constitui C-018, não encerra 3I nem a Fase 3, e não autoriza implementação de produto, merge ou PR readiness.

## Decisão em uma frase

No Conexus F1, **model spend é autoridade owner-local do `Builder ActorRun` e do `Production AgentRun`**, nunca do Gateway ou da Observability: cada run recebe cap server-derived/pinado, mantém no máximo uma liability billable não liquidada, reserva antes de cada provider attempt o pior custo qualificado daquela request class, só então cruza provider I/O, liquida para custo menor apenas com usage evidence qualificada que preserve `MISSING != ZERO`, consome conservadoramente a reserva máxima quando usage/custo/outcome são ausentes ou ambíguos, impede retry/fallback/model-call oculto abaixo do gate, preserva spend em restart/resume/cancel, e não cria `ModelCallAttempt`, BudgetService/Runtime, model proxy, quota engine, token broker, provider key per-run ou nova durable record class sem novo failure class material.

---

## 1. Authority, método e provenance

Esta decisão aplica a **DevelopmentConexus Engineering Method v1.0.0** e materializa, sem reabrir:

- C-008 — per-ActorRun bounded model spend/fail-closed invariant survives the deleted guest LLM-key mechanism;
- C-010 — Product Agent budget semantics include `maxModelCalls` and `maxCostUsd`, with budget admission Conexus-owned;
- C-013 — `usage_state`, `calculation_state`, `reconciliation_state`, `unknown != zero`, versioned pricing evidence and persist-first/reserve/dispatch/honest-terminal pattern;
- C-017 / 3G-03 — Builder budgets belong to bounded `ActorRun` execution; retry/new attempt remains current-authority gated;
- 3G-05 / 3H-02 — Production `AgentRun` is admitted/pinned before model execution and keeps the same identity across suspend/resume/restart;
- 3G-06 — `gw.budget_counter` remains external-effect budget authority and is not model-spend authority;
- 3E-01 / 3E-02 — `bld.actor_run`, `par.agent_run` and `obs.operational_event` already exist; durable class inventory stays closed while exact owner-row fields remain realization detail;
- 3H-R1 — per-ActorRun/per-AgentRun model spend is explicitly routed to 3I after the control-side runtime move, without implying model proxy/token broker/BudgetRuntime;
- 3I-01 — current authority/revocation laws remain applicable at owner control points;
- 3I-02 — model-provider credential custody remains owner-specific and control-side; guest LLM key stays deleted.

Review/provenance não-autoritativa:

- `3I-FABLE-DIALOGUE-security-authority-intake-decomposition.md`;
- `3I-FABLE-DIALOGUE-per-run-model-spend-enforcement.md`.

Independent review converged with:

```text
Material Finding against approved authority = NONE
reopen required                            = NONE
Alternative A                              = GLOBAL MAXIMUM
outcome                                    = CURRENT STRUCTURE CONFIRMED
new durable record class                   = 0
model proxy / token broker / quota service = 0
parallel billable calls F1                 = 0
```

The review also found current framework retry/usage hazards. Their **security properties** are frozen here; exact current Mastra/AI-SDK mechanism names/versions are 3L proof inputs, not eternal architecture pins.

---

## 2. Scope

3I-03 closes:

```text
A. model-spend owner for Builder ActorRun and Product AgentRun
B. immutable/effective per-run spend-cap and model-call-count semantics
C. one-outstanding billable-liability F1 baseline
D. pre-provider reservation and owner-row atomic admission law
E. retry/fallback/hidden-model-call escape prohibition
F. actual-vs-conservative settlement law under usage/cost uncertainty
G. restart/resume/cancel/terminal interaction with spend facts
H. streaming spend semantics
I. provider/model/request cost-envelope qualification requirement
J. provider-native limits as defense-in-depth only
K. exact YAGNI exclusions and reopen triggers
```

It does **not** close:

```text
exact owner-row columns/types/SQL/CAS spelling              → implementation
exact Mastra/AgentController hook/configuration names       → 3L + implementation
exact provider usage extraction APIs                        → 3L
exact provider/model pricing tables                         → C-013 mechanism + 3L/ops
numeric default caps for product tiers                      → calibration/product policy
Project/account commercial billing/quotas                   → later product/billing decision
parallel model-call lifecycle                               → Decision Loop on real consumer
post-invoice refund of run spend capacity                   → Decision Loop on measured need
NOT_SENT zero-settlement optimization                       → DEFER; 3L may only reintroduce via Decision Loop if material
provider-native org/project spend controls                  → 3J/ops defense-in-depth
```

---

## 3. Root cause

The unresolved failure class is:

> **a looping, compromised, retrying or restarted governed agent can accumulate model-provider liability without crossing Gateway external-effect budget authority, unless every billable model attempt is bounded by durable owner-run authority before provider I/O and uncertainty can never recreate spend capacity.**

Unsafe schedules include:

```text
run cap = $1
→ framework retries one logical step three times below budget hook
→ one $0.30 reservation becomes up to $0.90 liability

provider request sent
→ process crashes before usage persisted
→ restart treats usage as 0
→ budget capacity resurrects

AgentRun suspended for approval
→ host restarts
→ runtime starts with fresh in-memory counter
→ old spend forgotten

framework title/scorer/memory/subagent invokes another model
→ call bypasses primary-model budget gate

provider pricing/profile becomes unqualified
→ admission still computes an invented max
→ false hard-cap guarantee
```

---

## 4. Target invariants

### M1 — Owner-local authority

```text
Builder model spend     → bld.actor_run owner facts
Production model spend  → par.agent_run owner facts
```

Not:

```text
gw.budget_counter       -X-> model spend authority
obs.operational_event   -X-> model spend authority
Mastra totalUsage       -X-> model spend authority
provider account limit  -X-> per-run authority
```

Shared pure cost-envelope math may be implementation utility; it owns no authority.

### M2 — Absolute owner-accounting invariant

For every governed model-enabled run:

```text
committedModelSpendUsd
+
outstandingModelLiabilityUsd
<=
effectiveModelSpendCapUsd
```

This invariant is mechanical and owner-local.

### M3 — Provider I/O only after reservation

No billable provider attempt may start before its exact maximum admitted liability is durably reserved against the run.

### M4 — Unknown never creates capacity

```text
usage missing
cost unsupported
response lost
process crash
ambiguous provider outcome
unqualified settlement evidence
→ NEVER treated as 0
```

Default settlement is the reserved maximum.

### M5 — One outstanding liability in F1

```text
per ActorRun/AgentRun
→ at most one unsettled billable model-call reservation
```

This is the F1 concurrency shape, not a universal platform law.

### M6 — Every billable model call caused by the run is governed

`framework-owned != free`.

Billable classes include, when enabled:

```text
main model steps
post-tool continuations
retries / fallbacks
model-backed processors/guards/moderation
title generation
subagents / networks
memory observers/extractors
embedding calls
model-backed scorers/evals executed as part of the governed run
provider-hosted billable model/tool features
```

A class that cannot be routed through the same owner gate remains disabled unless it has a separately admitted named owner/budget consumer.

### M7 — Runtime/session state cannot reset spend

```text
Mastra restart
thread resume
approval resume
new trace segment
process incarnation change
sandbox reconnect
→ same durable owner spend facts
```

### M8 — Cancel stops future calls, not past liability

A terminal/cancel owner fact blocks new reservations. Already admitted liability still settles monotonically.

### M9 — No false invoice guarantee

Conexus distinguishes:

```text
Tier 1 — absolute owner-accounting bound
Tier 2 — actual provider-invoice bound conditional on qualified cost envelope correctness
```

Architecture never claims it can prevent a provider from retroactively or unexpectedly changing external billing semantics.

---

## 5. Effective cap semantics

### 5.1 Builder ActorRun

The effective cap is derived server-side at ActorRun admission from already-approved Builder/Change/Work Unit/role budget authority, including the surviving C-008 per-run spend invariant.

The runtime, model, guest or caller cannot widen it.

### 5.2 Production AgentRun

The effective cap is derived server-side at AgentRun admission from the exact Release-pinned agent budget, including current approved `maxCostUsd` / `maxModelCalls` semantics and any already-owned narrower platform/security constraint.

A newer Release with a larger budget does not enlarge an old AgentRun.

### 5.3 No mid-run top-up F1

```text
existing run cap
-X-> mutate upward in place
```

If more authority is materially required, it enters through the applicable fresh owner admission path rather than rewriting historical run authority.

### 5.4 `maxModelCalls` remains independent

Monetary cap and call-count cap are separate guards.

With retry-neutralization, every physical provider attempt is one admitted call, so `maxModelCalls` remains mechanically meaningful.

---

## 6. Owner-row durable facts

Exact schema is implementation, but each model-enabled run must preserve facts equivalent to:

```text
immutable/effective modelSpendCapUsd
immutable/effective maxModelCalls when applicable
monotonic admittedModelCallCount
monotonic committedModelSpendUsd

optional one outstanding liability:
  reservationGeneration
  exact provider/model identity
  exact qualified cost-profile/pricing revision ref
  maxBillableUsd
```

Properties:

```text
no second concurrent reservation
no decrement of committed spend
no caller-controlled widening
no reconstruction from runtime telemetry after crash
```

### 6.1 Why no `ModelCallAttempt` durable class

The owner row is sufficient while all are true:

```text
one outstanding billable call per run
no independent N-call settlement lifecycle
no parallel model-call workers
no cross-process concurrent provider-call fan-out
```

Therefore F1 does not create:

```text
ModelCallAttempt
ModelBudget
QuotaReservation
ModelSpendLedger
```

A new durable class requires Decision Loop / 3E reopen Finding with a concrete lifecycle that the owner row cannot preserve.

---

## 7. Pre-call admission

Immediately before provider I/O, the owner must verify at least:

```text
run is still admissible for model execution
run is non-terminal for new execution
no outstanding billable liability exists
maxModelCalls remains available
requested provider/model matches exact run authority
qualified cost profile exists for exact request class
all enabled billable dimensions have finite upper bounds
maxBillableUsd is computable
committedModelSpendUsd + maxBillableUsd <= effectiveModelSpendCapUsd
```

Then, atomically on the owner row:

```text
create one outstanding liability
increment admittedModelCallCount
commit
```

Only after that commit may provider I/O start.

No database transaction remains open through model/provider execution.

### 7.1 Deny behavior

If any required fact is:

```text
MISSING
UNKNOWN
UNQUALIFIED
UNBOUNDED
MISMATCHED
EXHAUSTED
```

then model dispatch is denied/fail-closed for that call.

No default model/provider/price profile is substituted by convenience.

---

## 8. Retry and fallback law

This is normative because hidden retry is a current, credible failure class.

### 8.1 Every physical provider attempt requires admission

```text
attempt #1 → owner reservation/admission
attempt #2 → new owner reservation/admission
attempt #3 → new owner reservation/admission
```

Never:

```text
one reservation
→ N opaque physical provider attempts
```

### 8.2 Automatic retry below the gate is prohibited

For governed F1 execution, every runtime/provider/SDK layer below the owner admission seam must satisfy one of:

```text
A. automatic retry/fallback is mechanically disabled
OR
B. every additional physical provider attempt re-enters owner admission as a fresh call
```

The normal F1 target is **A — disabled below the gate**.

### 8.3 Framework-specific checklist belongs to 3L

Current review evidence names classes such as:

```text
Mastra model transport retries
processor/error-processor retries
coding-harness stream retry processors
model fallback lists
AI-SDK/adapter retry defaults where applicable
```

These names/versions are **qualification checklist inputs**, not architecture constants. 3L must re-prove the exact pinned runtime stack.

### 8.4 Fallback model is a different cost profile

A substitute/fallback model cannot inherit the original reservation blindly.

```text
model/provider/profile changes
→ fresh admission + fresh upper bound
```

---

## 9. Qualified cost envelope

The owner may reserve only when the exact request class has a qualified finite maximum liability.

Conceptually:

```text
exact provider/model identity
+ exact pricing revision/profile
+ bounded input/request dimensions
+ finite output/reasoning ceilings
+ worst applicable cache pricing
+ enabled paid provider-feature bounds
+ service/context/pricing tier where applicable
→ maxBillableUsdForRequest
```

### 9.1 Discounts are never required for admission

Cache hits, discounts or favorable tier behavior may reduce actual settlement but are never required to keep the request under its cap.

Admission uses the worst applicable qualified outcome for the admitted class.

### 9.2 Finite ceilings required

If a provider feature can autonomously create unbounded additional billable work, that feature is disabled for governed F1 execution until a finite bound is qualified.

### 9.3 Exact model/profile identity

Alias/latest/substitution drift cannot silently change billing class.

If observed provider/model identity conflicts with the qualified profile:

```text
no future governed call under that broken profile
→ evidence/finding
→ 3L requalification
```

Historical admission facts remain unchanged.

---

## 10. Settlement

### 10.1 Qualified downward settlement

The outstanding reservation may settle below its maximum only when evidence for the exact request is complete and trusted enough for the qualified calculator.

```text
exact reservation generation matches
exact provider/model/profile matches
usage evidence preserves MISSING != ZERO
calculation_state = CALCULATED
calculated actual <= reserved maxBillableUsd
→ committedModelSpendUsd += calculated actual
→ clear outstanding liability
```

### 10.2 Framework aggregate totals are not authority

A framework/runtime aggregate such as `totalUsage` may be diagnostic/cross-check evidence.

It cannot be used for downward settlement if its representation can collapse missing fields into zero or otherwise lose the C-013 missingness distinction.

The settlement source must be a **qualified usage-evidence extraction** for the exact provider/request path.

This law intentionally avoids pinning the architecture to a forever-specific raw response field; 3L proves which current source preserves the required semantics.

### 10.3 Conservative settlement

If any of these applies:

```text
usage absent or partial
usage source cannot preserve missingness
cost calculator cannot calculate
pricing/profile missing at settlement
response lost
provider processing outcome ambiguous
process crashed with outstanding liability
stream ended without qualified final usage
```

then:

```text
committedModelSpendUsd += reserved maxBillableUsd
→ clear outstanding liability
```

Uncertainty consumes capacity; it never creates capacity.

### 10.4 No F1 `NOT_SENT` refund optimization

3I-03 deliberately does **not** introduce transport-state machinery to prove a request was never billable.

Baseline:

```text
reservation exists
+ no qualified downward-settlement evidence
→ burn reserved maximum
```

A future measured liveness/cost problem may return through Decision Loop if a safe known-zero transport class materially pays for itself.

### 10.5 No retroactive run-budget refund F1

Later provider/invoice reconciliation may show:

```text
actual invoice < conservative committed run spend
```

C-013 may report/reconcile that difference, but the original run does not regain execution capacity.

This avoids reopening past admission capacity and building refund/reconciliation machinery without current need.

### 10.6 Per-profile degraded mode

A qualified provider/profile whose usage evidence is not reliable enough for downward settlement may still be admitted if a finite maximum envelope exists:

```text
reserve max
→ always commit max
```

This is not a new domain state machine; it is a qualification property of the cost profile.

One weak provider does not force every provider into conservative-only settlement.

---

## 11. Cost-envelope violation

If trustworthy later evidence shows:

```text
actual billable charge > pre-call reserved maximum
```

then the cost-envelope qualification failed.

Required response:

```text
record mismatch/finding/evidence
block new governed calls under the broken profile
preserve historical run facts
return profile to 3L qualification
```

Never:

```text
silently patch price table
→ reinterpret historical owner spend
→ continue calls without requalification
```

### 11.1 Two-tier guarantee

#### Tier 1 — mechanical guarantee

Conexus guarantees:

```text
owner committed spend
+
owner outstanding liability
<=
owner run cap
```

under every owner-local schedule.

#### Tier 2 — provider-invoice bound

Conexus guarantees actual external provider invoice against the run cap **only while the qualified cost envelope correctly upper-bounds the provider billing semantics of the admitted request class**.

If external billing changes unexpectedly, the residual exposure is bounded by the in-flight admitted call under the one-outstanding F1 law, after which the broken profile blocks.

No stronger promise is made.

---

## 12. Cancellation, terminalization and recovery

### 12.1 Cancel/terminal before next reservation

```text
run terminal/cancel fact commits
→ no new model-call reservation
```

### 12.2 Cancel after provider-call reservation

Cancellation does not refund already admitted liability.

Best-effort stream/provider abort may reduce actual external cost, but it is not spend-cap authority.

The liability settles by qualified actual or reserved maximum.

### 12.3 Post-terminal settlement is allowed

A run terminal is write-once lifecycle truth.

Monotonic completion of a liability **admitted before terminalization** may still commit after terminal:

```text
terminal run
→ cannot execute again
→ existing outstanding liability may settle
```

This accounting completion:

```text
-X-> reopens run
-X-> changes terminal meaning
-X-> grants new execution authority
```

### 12.4 Restart/resume

On restart/rebind/resume:

```text
read durable owner spend facts
if outstanding liability exists
→ conservatively settle it before any new model call
→ recompute remaining admission capacity from owner facts
```

No Mastra thread/snapshot/trace/provider total reconstructs authority.

---

## 13. Streaming

Streaming is transport, not spend authority.

Before a stream begins:

```text
reserve the full qualified maximum liability
```

During stream:

```text
partial token/usage observations
→ diagnostics / possible settlement inputs
-X-> additional authority
```

A best-effort abort near budget limit is an optimization only. The hard admission guarantee comes from the pre-call maximum reservation.

Interrupted stream without qualified complete usage settles conservatively.

---

## 14. Hidden/model-bearing framework features

### 14.1 General law

Any feature that causes a billable provider/model call because of a governed ActorRun/AgentRun must either:

```text
A. flow through the same run owner admission
B. execute under another explicitly admitted named owner/budget consumer
C. remain disabled
```

There is no “framework overhead is free” category.

### 14.2 Current F1 baseline

Features already deferred/disabled by 3H remain off unless separately admitted, including model-bearing variants of:

```text
semantic recall / embeddings
observational memory observer/reflector
memory extractors
model-backed scorers/evals
multi-agent/subagent/network fan-out
model-backed moderation/processors
```

Current source review additionally identified title-generation paths that can bypass the normal agentic-loop interception. Such paths remain disabled until a qualified owner gate exists.

Exact feature/default inventory is 3L evidence, not a frozen forever-list.

### 14.3 Background eval is not silently charged to the originating run

A future background verifier/eval/scorer with its own lifecycle must get a named owner/budget decision. It cannot silently continue billing after the originating run's terminal boundary by calling itself “observability”.

---

## 15. Provider-native spend controls

Provider-native controls such as:

```text
workspace/project/org spend limits
rate limits
API-key restrictions
prepaid credit ceilings
```

are useful defense-in-depth/operations controls.

They are not primary per-ActorRun/per-AgentRun authority because they generally operate at broader provider scopes and do not bind Conexus run identity.

F1 does not mint per-run provider API keys merely to simulate provider-side run isolation.

---

## 16. Enforcement candidates

### E1 — Owner admission

Every billable physical provider attempt originates from an exact owner run and is admitted on that owner row.

### E2 — Atomic one-outstanding guard

Two competing call admissions cannot both create outstanding liability for the same F1 run.

### E3 — Reserve before I/O

Provider I/O cannot begin until reservation commits.

### E4 — Restart guard

Outstanding liability discovered after restart is conservatively settled before another call.

### E5 — Missingness-preserving settlement

Downward settlement requires qualified usage evidence that preserves unknown/missing vs zero.

### E6 — Retry/fallback neutralization

All retry/fallback layers below the owner gate are disabled or mechanically re-enter the gate for every physical attempt.

### E7 — Model-bearing feature closure

No enabled framework/runtime feature can emit a billable model/provider call outside the admitted owner budget path.

### E8 — Broken profile blocks

Cost-envelope violation or model/profile drift makes that profile ineligible for new governed calls until requalified.

---

## 17. Proof strategy

Future implementation/qualification must falsify at least:

1. run cap $X + N sequential model calls → owner accounting never admits `committed + outstanding > X`;
2. two concurrent reservation requests on same run → at most one outstanding liability commits;
3. provider call path cannot begin before owner reservation commit;
4. crash after reservation and before usage persist → restart burns reserved max before next call;
5. crash before next call cannot reset model-call count or committed spend;
6. AgentRun approval suspension/resume preserves exact spend facts;
7. newer Release with larger budget does not enlarge old AgentRun cap;
8. cancel/terminal before next call blocks new reservation;
9. cancel after reservation does not refund outstanding liability;
10. settlement after terminal does not revive run execution authority;
11. missing/partial usage cannot settle as zero;
12. framework aggregate usage that zero-fills missing fields cannot reduce owner spend;
13. complete qualified provider usage can settle below reservation when profile permits;
14. conservative-only profile always settles reserved max without new domain state machine;
15. retry defaults/fallbacks at the pinned runtime stack are disabled below the gate or every attempt re-enters admission;
16. one logical model step cannot cause N provider attempts under one reservation;
17. fallback/substitute model requires fresh qualified reservation;
18. streaming starts only after full maximum liability reservation;
19. interrupted stream without qualified final usage burns max;
20. enabled title/scorer/memory/embedding/subagent/model-backed processor path cannot bypass the owner gate;
21. provider/model/request class lacking finite qualified maximum is denied;
22. observed charge above qualified envelope blocks new calls under that profile and creates evidence without rewriting history;
23. `gw.budget_counter` is not read/written as model-spend authority;
24. OBS/telemetry loss never grants additional model-spend capacity;
25. provider-native account/project limits are not required for the owner accounting invariant;
26. no new `ModelCallAttempt`/BudgetService/proxy/quota engine/token broker is required in the F1 baseline;
27. 3N coherence proof includes the owner-row model-call reservation as a realization of C-013 persist-first/reserve/dispatch semantics without `UniversalAttempt`.

---

## 18. Credible alternatives

### Alternative A — Owner-local one-outstanding liability + qualified downward settlement

**ADOPT / GLOBAL MAXIMUM.**

Benefits:

```text
hard owner-accounting bound
usable run caps near intended real spend
crash/restart safety
no new durable class/service
provider-specific degraded mode when usage unreliable
```

### Alternative B — Always charge permanent worst-case for every call

**REJECT as global default; retain as per-profile degraded mode/fallback.**

It is simpler in settlement, but a usable cap would need to be inflated toward the sum of worst-case request envelopes. That inflation weakens the actual runaway-spend protection the cap exists to provide.

The usage/accounting pipeline exists anyway for C-013, so deleting downward owner settlement saves little structural complexity.

### Alternative C — Universal BudgetService / QuotaEngine

**REJECT.**

Creates a new cross-owner budget authority with no need. Builder/PAR already own the runs.

### Alternative D — Model proxy/token broker as mandatory enforcement point

**REJECT F1.**

No current failure class proves an extra network/service hop is needed. Re-enter only if selected runtimes/providers cannot satisfy owner admission mechanically.

### Alternative E — Provider-native spend controls as primary

**REJECT as primary.**

Wrong scope and authority; keep as defense-in-depth only.

---

## 19. YAGNI / explicit non-construction

F1 does not build:

```text
ModelCallAttempt durable record
ModelBudget / QuotaReservation durable record
BudgetService
BudgetRuntime
ModelProxy
TokenBroker
QuotaService / generic quota engine
UniversalAttempt / OBS admission owner
provider API key per ActorRun/AgentRun
parallel billable-call reservation fan-out
model-call traffic FSM
NOT_SENT refund detector
post-invoice run-budget refund engine
dynamic provider-cost router
model-spend event bus
cross-owner budget transaction
```

No architecture is added merely because provider APIs/frameworks expose more counters, retry modes or billing endpoints.

---

## 20. Routing

```text
exact bld.actor_run/par.agent_run spend fields + atomic mutation → implementation
Mastra/AgentController pre-call interception                    → 3L
retry/fallback/default neutralization at pinned versions        → 3L
provider-layer usage extraction preserving missingness          → 3L
stream usage/completion behavior                                → 3L
qualified provider/model/request cost-envelope proofs           → 3L
model-bearing optional feature sweep                            → 3L
C-013 owner-local admission coherence incl. model reservation   → 3N
provider account/workspace backstop config                      → 3J/ops
orphan/corrupt owner spend state repair                         → 3M if a concrete failure requires policy
parallel model/subagent fan-out                                 → Decision Loop on real consumer
commercial billing/project quotas                               → future product/billing decision
```

---

## 21. Reopen triggers

Return through Decision Loop if any becomes real:

1. a governed run needs multiple concurrent billable model calls;
2. one outstanding liability cannot be recovered/settled safely from the owner row;
3. selected runtime makes it impossible to intercept/disable hidden retries or model calls without a new mandatory mechanic;
4. a model-bearing framework feature must be enabled but cannot be attributed to any admitted owner budget;
5. provider billing cannot be bounded by any finite qualified request class for a required feature;
6. conservative settlement wastes enough real run capacity to justify refund/known-NOT_SENT machinery;
7. independent per-call reconciliation lifecycle becomes material enough to justify `ModelCallAttempt` durable state;
8. a true cross-run/project commercial quota requires a new owner distinct from Builder/PAR;
9. provider-native per-run enforcement becomes both available and materially superior without violating owner semantics;
10. 3L falsifies the assumed interception/usage/cost-envelope properties of the selected stack.

---

## 22. Final ratified outcome

Operator approval on **2026-08-17** ratifies:

```text
3I-03 = APPROVED
Material Finding against prior authority = NONE
reopen = NONE
Alternative A = GLOBAL MAXIMUM / CURRENT STRUCTURE CONFIRMED

model-spend owner = Builder ActorRun / Production AgentRun
one outstanding billable liability F1 = YES
pre-provider max-liability reservation = REQUIRED
missing/ambiguous settlement = reserved maximum
qualified actual downward settlement = ALLOWED
hidden retry/fallback below gate = FORBIDDEN
provider limit primary authority = NO
NOT_SENT refund optimization F1 = NO / DEFERRED

new Hub module = 0
new durable domain record = 0
new hub_control schema/database = 0
ModelCallAttempt = 0
BudgetService/Runtime = 0
model proxy/token broker = 0
quota engine = 0
per-run provider API key = 0
parallel billable-call machinery = 0
```

3I remains **IN PROGRESS**. The dependency path from the approved intake now advances to **DEDICATED Trusted Exchange**; `hub_control` Least-Privilege Realization remains able to advance in parallel without driving authority semantics.