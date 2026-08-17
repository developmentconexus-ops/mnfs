# 3I Fable Dialogue — Per-ActorRun / Per-AgentRun Model Spend Enforcement

**Status:** NON-AUTHORITATIVE REVIEW INPUT  
**Candidate:** next material 3I decision; **no `3I-03` authority/ID is created by this file**  
**Phase:** 3I — Security / Authority Architecture  
**Purpose:** ChatGPT candidate for independent Fable challenge. This file does **not** update `LEDGER.md`, does not alter approved 3B..3I-02 authority, and does not authorize implementation, merge, or PR readiness.

---

## 1. Canonical starting point

Read path required by `AGENTS.md`:

```text
DevelopmentConexus Engineering Method v1.0.0
→ docs/DOCUMENTATION-MAP.md
→ docs/conexus/DECISOES.md
→ docs/conexus/phase3/LEDGER.md
→ exact accepted authority
→ external/current evidence only where load-bearing
```

Current canonical state at this candidate:

```text
3B..3H = CLOSED / APPROVED
3I      = IN PROGRESS
3I-01   = APPROVED — Current Authorization, Approver Eligibility & Revocation
3I-02   = APPROVED — Credential & Capability Custody
```

Remaining 3I families from the approved intake:

```text
Per-ActorRun / Per-AgentRun Model Spend Enforcement   ← THIS DIALOGUE
DEDICATED Trusted Exchange
Trust Zones & Crossings / Hub control-side egress / telemetry crossing
hub_control Least-Privilege Realization
```

This dialogue takes **model-spend authority only**.

---

## 2. Authority already frozen before this decision

### 2.1 C-008 — per-ActorRun spend bound survives its original guest-key mechanism

C-008 froze the security invariant that model authority exposed to a Builder execution is bounded, including:

```text
spend cap per ActorRun
fail closed
revocation / reconciliation
```

The original realization coupled that invariant to a guest-readable per-run LLM key.

3A-R5 later moved the Builder model loop control-side, and 3I-02 deleted the guest LLM-key instance. The **mechanism died; the spend invariant did not**.

### 2.2 C-010 — Production Agent already has run-level model-budget semantics

C-010 approved `agent/v1` budget semantics including:

```text
maxModelCalls
maxCostUsd
```

alongside tool/effect/read/time budgets.

It also established the semantic rule that **budget admission before a model call is Conexus-owned**, while provider/runtime telemetry reports usage afterward.

The old Vercel AI SDK runtime realization has since been superseded by the approved Mastra runtime architecture. The budget meaning remains; this decision must place enforcement in the current runtime without reopening the old substrate.

### 2.3 C-013 — unknown usage/cost is not zero

C-013 freezes three independent accounting axes:

```text
usage_state          = REPORTED | INFERRED | MISSING
calculation_state    = CALCULATED | MISSING_USAGE | MISSING_PRICE | UNSUPPORTED
reconciliation_state = NOT_AVAILABLE | PENDING | MATCHED | MISMATCH | ADJUSTED
```

and separate monetary fields:

```text
calculated_cost_usd
provider_reported_cost_usd
reconciled_cost_usd
```

Critical laws:

```text
unknown usage != zero
missing price != zero
price version is recorded
historical accounting is never silently recalculated
telemetry reports what happened; telemetry never owns authorization/lifecycle
```

C-013 also introduced a cross-cutting `persist-first → reserve → dispatch → honest terminal` admission concept. 3H-R1 later explicitly routes its **coherence proof** to 3N: concrete owner-local ActorRun/AgentRun lifecycles must realize the property without a parallel `UniversalAttempt` authority.

Therefore this decision may reuse **reservation discipline**, but it must not resurrect a generic OBS-owned attempt FSM or admission ledger as the authority for model spend.

### 2.4 C-017 / 3G-03 — Builder owns ActorRun budgets

Builder authority already includes budgets. `ActorRun` is one exact durable attempt with applicable budget participation; current retry/new-attempt admission requires budgets to permit it.

3G-03 also freezes:

```text
ActorRun != CodingSession != runtime turn != sandbox
```

and F1 serial execution for one WU-execution ActorRun.

A retry that is a genuinely new provider call still belongs to the current ActorRun while that ActorRun is executing; a retry/new Builder attempt across ActorRun boundary is separately admitted under 3G-03.

### 2.5 3G-05 / 3H-02 — Production AgentRun exists before any model execution

Production `AgentRun` is PAR-owned, exact-Release-pinned and durably admitted before model/tool execution.

Suspension/resume continues the **same** AgentRun.

Therefore spend consumption cannot reset on:

```text
Mastra restart
thread continuation
approval suspension/resume
new trace segment
new process incarnation
```

### 2.6 3G-06 Gateway budget is not model spend

Gateway owns:

```text
gw.effect_attempt
gw.idempotency_claim
gw.budget_counter
```

for **external-effect** execution units/traffic/outcome.

Model spend can occur with zero Gateway effect:

```text
reasoning loop
analysis-only AgentRun
Builder coding turn
approval explanation
failed tool-selection loop
```

Therefore:

> **`gw.budget_counter` is not the owner or storage authority for model spend.**

Reusing it merely because both concepts are called “budget” would collapse owner semantics and make Gateway a universal cost service.

### 2.7 3E-02 closed new durable classes but allows existing record realization

Existing relevant durable records are already admitted:

```text
bld.actor_run
par.agent_run
obs.operational_event
```

No `ModelCallAttempt`, `ModelBudget`, `QuotaReservation` or equivalent durable class exists.

3E-02 freezes the 46-class inventory and requires Decision Loop for a new durable class, while exact columns/fields/DDL inside an existing owner record remain later realization.

### 2.8 3H-R1 routes this exact residue to 3I

3H-R1 explicitly freezes:

> **Per-ActorRun / per-AgentRun model spend-cap and runtime budget enforcement point, including continuity of the C-008 invariant after the control-side credential move → 3I Security / Authority, composed with existing owner/admission/budget and C-013 usage evidence.**

and explicitly rejects implication of:

```text
model proxy
token broker
BudgetRuntime
generic quota engine
```

---

## 3. Current live evidence — evidence only, never Conexus authority

Checked on **2026-08-17**.

### 3.1 Mastra — a per-call pre-provider interception seam exists

Current Mastra `Processor` supports `processLLMRequest`, documented/source-defined to run after prompt conversion and **immediately before the provider call for that LLM step**. Arguments include the exact prompt, model, step number, completed steps and request-local state.

Mastra also exposes output `usage`, `steps`, `providerMetadata`, `response` and `totalUsage`.

Sources:

- https://github.com/mastra-ai/mastra/blob/main/packages/core/src/processors/index.ts
- https://github.com/mastra-ai/mastra/blob/main/packages/core/src/stream/base/output.ts
- https://github.com/mastra-ai/mastra/blob/main/packages/core/src/loop/workflows/agentic-loop/index.ts

This is evidence that current Mastra likely has a viable enforcement seam. **3I must freeze the property, not that API.** Exact coverage for Builder AgentController and Product Agent execution remains a 3L qualification concern.

### 3.2 Mastra usage output is not sufficient as budget authority

Current Mastra code can synthesize aggregate token totals when fields are missing, and at least one agentic-loop path falls back to zero-valued usage when step usage is absent.

Therefore:

```text
Mastra totalUsage
Mastra step usage
trace usage
-X-> authoritative proof that billable usage was zero
```

This exactly matches C-013's `MISSING != zero` law.

### 3.3 Provider usage/cost APIs are reconciliation surfaces, not per-run admission authority

Current OpenAI organization Usage/Costs APIs aggregate by dimensions such as project, API key, model and time bucket; current Anthropic Admin usage reports aggregate by API key/workspace/model/service tier/context window.

Sources:

- https://platform.openai.com/docs/api-reference/usage
- https://docs.anthropic.com/en/api/admin-api/usage-cost/get-messages-usage-report

These surfaces are useful for later reconciliation. They do not identify a Conexus ActorRun/AgentRun strongly enough to replace owner-local pre-call admission.

### 3.4 Provider account/project limits are only defense in depth for this invariant

Provider-level spending/rate controls exist and evolve, but their scope is provider organization/project/workspace/account—not Conexus `ActorRunId` / `AgentRunId`.

OpenAI's current project-management documentation itself contains evolving spend-limit semantics and points to newer developer documentation for latest hard-limit behavior. That instability is another reason not to make provider account controls the Conexus per-run authority.

Source:

- https://help.openai.com/en/articles/9186755-managing-projects-in-the-api-platform

Normative transfer:

> **Provider limits may be enabled as defense in depth, but cannot substitute for owner-bound per-run admission.**

### 3.5 Cost upper bounds are provider/model/request-class specific

Current Anthropic pricing documentation illustrates why a safe upper bound is not simply:

```text
input_tokens * one rate + max_tokens * one rate
```

Pricing can depend on dimensions including cache read/write, long-context tiers and server-side tool usage.

Source:

- https://docs.anthropic.com/en/docs/about-claude/pricing

Therefore the architecture must require a **qualified cost envelope** for the exact admitted provider/model/request feature set. It must not hardcode a universal token-cost formula.

---

## 4. Known / Inferred / Unknown / Deferred

### KNOWN

1. C-008 requires bounded per-ActorRun model spend even though its original guest-key realization is deleted.
2. Production Agent already has `maxCostUsd` / `maxModelCalls` semantics from C-010.
3. ActorRun and AgentRun exist before governed model execution and are owner-local durable facts.
4. Model spend can occur without any Gateway external effect.
5. `gw.budget_counter` is Gateway-owned effect-unit accounting and cannot become model-spend authority by convenience.
6. Unknown/missing provider usage or price never means zero under C-013.
7. Telemetry cannot grant execution capacity.
8. 3H-R1 explicitly requires 3I to close the enforcement point without a model proxy/quota engine by default.
9. New durable record class is not currently admitted by 3E-02.
10. Builder/PAR current F1 runtime loops are control-side and owner-attributable before provider calls.

### INFERRED — candidate laws to attack

1. Effective per-run model cap should be immutable once an ActorRun/AgentRun is admitted.
2. Builder owns ActorRun spend state; PAR owns AgentRun spend state. Shared implementation math does not create a new shared authority owner.
3. F1 should permit **at most one outstanding billable model-call liability per ActorRun/AgentRun**; hidden/parallel model calls are not current baseline.
4. Every model-provider call caused by the governed run must cross the same owner budget gate before provider I/O.
5. The owner can enforce a hard cap using a conservative **pre-call worst-case charge reservation** plus monotonic owner-local consumed spend.
6. Complete qualified usage may settle a reservation down to actual calculated cost.
7. Missing/ambiguous usage, process loss or response loss must consume the entire reserved upper bound rather than release capacity.
8. Conservative settlement is not later refunded into the run budget in F1, even if reconciliation eventually shows a lower invoice cost.
9. Automatic retries beneath the admission seam must be disabled or each retry must re-enter the same reservation gate.
10. Provider account/project spend limits remain defense in depth, never the primary per-run authority.
11. Streaming cutoff is not a hard-spend enforcement point; the full billable upper bound must already be reserved before stream dispatch.
12. A provider/model/request profile whose maximum billable charge cannot be bounded conservatively is not eligible for governed F1 model execution.

### UNKNOWN — do not freeze from intuition

1. Exact Mastra/AgentController hook/wrapper that provably intercepts **every** billable call in both Builder and PAR.
2. Whether current Mastra or underlying model SDK performs automatic retries beneath `processLLMRequest`, and exact control needed to disable/re-route them.
3. Exact token-count/worst-case calculation mechanism per provider/model.
4. Exact current billing dimensions and model-specific maximum-output/reasoning/tool constraints for every qualified provider.
5. Exact fields/columns stored on `bld.actor_run` / `par.agent_run`.
6. Whether a real F1 provider exposes definitive no-processing/no-charge failure evidence worth using to release a reservation.
7. Whether future parallel subagents/multi-model processors can share one owner row safely or require a new lifecycle.

### DEFERRED

```text
exact Mastra/provider interception APIs/version behavior            → 3L
exact provider pricing/tokenizer/max-output proof                   → 3L
pricing refresh cadence / provider drift procedure                  → 3L/3J/implementation
provider invoice reconciliation                                    → C-013 + 3M/ops if repair needed
project/month/team commercial budgets                               → Decision Loop on named product consumer
multi-currency model accounting                                     → later consumer; C-013 v0 USD-only remains
parallel billable subagents/model calls within one run              → Decision Loop
provider-specific Batches / managed-agent session budgets           → Decision Loop / 3L on named consumer
model-proxy / LLM gateway / quota service                           → Decision Loop only if owner-bound seam fails
new durable ModelCallAttempt/Reservation record                      → Decision Loop under 3E-02
```

---

## 5. Root Cause

The unresolved failure class is:

> **a runaway, compromised, retried or crash-recovered agent can continue creating billable model-provider work even when no Gateway effect is executed, unless every provider call consumes run-owned authority before dispatch and ambiguous/missing usage can never recreate spend capacity.**

Unsafe schedules:

```text
ActorRun cap = $1
→ model loop issues 10 calls
→ cost observed only after completion
→ cap is reporting, not enforcement

AgentRun spends $0.80
→ Hub crashes
→ restart reconstructs runtime from thread but not spend state
→ another $0.80 admitted
→ same run exceeded cap

call reserved $0.30
→ provider request sent
→ response/usage lost
→ reservation released as "unknown"
→ retry spends again

main Mastra call passes budget gate
→ hidden processor/subagent/scorer performs another model call below gate
→ spend escapes run authority

one pre-call reservation
→ SDK silently retries request twice under same reservation
→ possible billable liability > reserved amount

provider usage field missing
→ framework reports totalTokens=0
→ run gains artificial capacity
```

---

## 6. Target invariants

### M1 — Per-run owner authority

```text
Builder owns ActorRun model-spend authority
PAR owns AgentRun model-spend authority
```

No OBS/Gateway/provider/framework component becomes model-budget owner.

### M2 — Hard admission inequality

For each model-enabled run:

```text
committedBudgetSpendUsd
+
outstandingModelLiabilityUsd
<=
modelSpendCapUsd
```

must hold before and after every owner mutation.

`committedBudgetSpendUsd` is an **authority/accounting amount counted against this run's cap**, not necessarily the final invoice amount.

### M3 — Provider I/O requires prior liability reservation

> **No billable model-provider request may cross the external provider boundary until the run owner has durably reserved an upper bound for the exact request under a qualified cost envelope.**

### M4 — Unknown never releases authority

```text
complete qualified usage → may settle to known calculated cost
missing/ambiguous usage  → consumes reserved upper bound
crash/response loss      → consumes reserved upper bound on recovery
```

Never:

```text
unknown → zero
unknown → capacity refund
```

### M5 — One outstanding billable liability F1

```text
per ActorRun/AgentRun
→ at most one unsettled billable model-call reservation
```

This matches the serial F1 agent-loop baseline and avoids a new per-call durable record.

Parallel billable model calls require Decision Loop because they create reservation fan-out/identity/recovery semantics not currently needed.

### M6 — Every billable model call caused by governed execution is inside the gate

The budget is not only for “the primary model”. It covers every billable provider call whose execution is caused by that run until its owner terminal boundary, including if enabled:

```text
main reasoning/model steps
model continuations after tools
model retries
model-bearing processors/guards
subagents
memory extractors
model-based scorers/evals executed as part of the run
```

Current optional capabilities that cannot be routed through the same owner gate remain disabled.

Background evaluation with a different owner/budget is a separate future consumer; it does not silently spend the originating run.

### M7 — Hidden retry is forbidden

```text
one owner reservation
-X-> N opaque provider requests
```

Any new provider request requires a new admission/reservation. Automatic retries below the budget seam must be disabled or mechanically re-enter the seam.

### M8 — Cancellation stops future spend, not past liability

```text
run cancel/terminal commits first
→ no new model-call reservation
```

But:

```text
already admitted/in-flight provider call
-X-> budget refund by cancellation
```

Outstanding liability remains until conservative or known settlement.

### M9 — Runtime/session restart cannot reset spend

Spend authority lives in the durable owner record, not Mastra thread/trace/process state.

```text
restart/resume/rebind
→ reads owner spend facts
→ cannot issue next model call while an unresolved reservation exists
```

### M10 — Streaming is transport, not budget authority

A stream is admitted only after the full qualified maximum liability of its request is reserved.

Best-effort abort may reduce actual usage, but no stream-token counter is trusted to make the hard-cap guarantee.

### M11 — Qualified cost envelope or fail closed

A request is admissible only if the selected provider/model/request class has an exact current qualified calculation able to bound all billable dimensions enabled for that request.

Conceptually:

```text
exact provider/model identity
+ exact request/prompt billable upper bounds
+ finite output/reasoning ceilings
+ pricing revision
+ cache worst case
+ enabled provider-side tool/feature fees
→ maxBillableUsdForRequest
```

If any material dimension is `MISSING_PRICE | UNSUPPORTED | unbounded`:

```text
DENY model dispatch
```

### M12 — Budget authority and invoice reconciliation remain different

```text
run cap consumption
→ owner authority

provider usage/cost/invoice reconciliation
→ C-013 evidence/accounting
```

Later reconciliation can report that conservative budget consumption exceeded actual invoice cost. F1 does **not** retroactively refund run capacity after conservative settlement.

---

## 7. Proposed F1 owner-local realization

This is a semantic realization candidate, **not exact schema**.

Each model-enabled ActorRun/AgentRun needs facts equivalent to:

```text
immutable effective modelSpendCapUsd
immutable/effective maxModelCalls when applicable
monotonic admittedModelCallCount
monotonic committedBudgetSpendUsd
optional one outstanding model-call liability:
    reservationGeneration
    exact model/provider/cost-profile refs
    maxBillableUsd
```

Names/packing are implementation.

No new record class is implied.

### 7.1 Effective cap derivation

#### Builder ActorRun

Effective cap is derived server-side at ActorRun admission from current Builder/Change/Work Unit/role budget authority already approved by C-017/C-008, then pinned to that exact ActorRun.

#### Production AgentRun

Effective cap is derived server-side at AgentRun admission from the exact Release-pinned Agent budget (`maxCostUsd`, `maxModelCalls`) plus any current narrower platform/security constraint that already has an owner.

No caller/model/runtime can widen it.

### 7.2 Cap is immutable for the run

F1 has no mid-run budget top-up.

```text
old cap
-X-> mutate upward in-place
```

If more authority is genuinely required, it enters through the applicable fresh owner admission path rather than rewriting historical spend authority.

A newer Release with a larger Product Agent budget does not enlarge an old AgentRun.

### 7.3 Pre-call admission

Immediately before provider I/O:

```text
run non-terminal/current for model execution
AND no outstanding liability
AND maxModelCalls not exhausted
AND exact model/provider pins match run authority
AND cost profile current/qualified
AND exact request maxBillableUsd computable
AND committedBudgetSpendUsd + maxBillableUsd <= modelSpendCapUsd
→ atomically admit one model-call liability on owner row
→ increment admittedModelCallCount
→ commit
→ only then invoke provider
```

No DB transaction remains open through provider I/O.

### 7.4 Successful complete settlement

When exact provider response contains usage that is complete enough for the qualified cost calculator:

```text
exact reservation generation matches
+ provider/model identity matches
+ calculation_state = CALCULATED
+ calculated actual <= reserved maxBillableUsd
→ committedBudgetSpendUsd += calculated actual
→ clear outstanding liability
```

The raw/provider usage is an **input** to an owner mutation, not the authority itself.

### 7.5 Missing/ambiguous settlement

If any of these occur:

```text
usage missing/partial
calculation_state != CALCULATED
price/profile missing at settlement
response lost
provider request outcome ambiguous
process crash with outstanding liability
```

then:

```text
committedBudgetSpendUsd += reserved maxBillableUsd
→ clear outstanding liability
```

This is intentionally pessimistic.

It preserves liveness better than leaving the run permanently blocked while still guaranteeing that uncertainty never creates spend capacity.

### 7.6 No F1 budget refund after conservative settlement

Provider reconciliation may later establish:

```text
actual invoice cost < conservative committed budget amount
```

That can be shown in C-013 accounting/reconciliation, but it does not reopen the original run budget.

Reason:

```text
retroactive refund
→ mutable past admission capacity
→ more race/reconciliation machinery
→ no current F1 need
```

A future high-volume consumer proving material wasted capacity may reopen this through Decision Loop.

### 7.7 Cost-envelope violation

If trustworthy later evidence shows:

```text
actual billable charge > pre-call maxBillableUsd
```

then the qualified cost envelope failed.

Required response:

```text
record mismatch/finding
block further governed calls under the broken profile
no silent price-table patch + history rewrite
return to 3L/provider qualification
```

That call may already have violated the intended invoice bound; the architecture cannot pretend otherwise.

Therefore a provider/model/request profile is not production-admissible until its upper-bound property is mechanically qualified to the standard 3L chooses.

---

## 8. Why no per-call durable record is needed in the current baseline

A `ModelCallAttempt` table would be justified if the current product required any of:

```text
multiple concurrent billable calls inside one run
independent recovery/settlement of N outstanding calls
per-call external reconciliation lifecycle that cannot be derived from events
cross-process independent model-call workers
```

Current F1 does not.

With one outstanding liability, the run row itself can preserve all authority needed for hard admission:

```text
cap
committed consumption
one outstanding reservation
monotonic call count/generation
```

C-013 `operational_event` can preserve detailed per-call observations without becoming spend authority.

Therefore:

```text
new durable ModelCallAttempt = REJECT F1
```

unless Fable finds a failure schedule that cannot be closed with the owner row.

---

## 9. Provider/request cost-envelope law

### 9.1 Do not depend on discounts to admit

For admission, use the most expensive applicable outcome inside the qualified request class.

Examples of dimensions the profile may need to account for:

```text
uncached versus cache-read/write pricing
long-context tier
reasoning/output tokens
provider-side search/tool charges
service tier
input/output asymmetry
```

A cache hit or discount may reduce actual settlement, but **discount availability is never required to stay under the cap**.

### 9.2 Finite output ceilings are required

A hard max liability requires finite request bounds.

If a provider feature can autonomously incur extra paid operations without a finite admitted ceiling, that feature is disabled for governed F1 execution until a bound is proved.

### 9.3 Exact model identity

Run authority pins exact model/provider semantics.

```text
requested exact qualified model
→ expected pricing profile

provider silently returns another pricing/model class
→ qualification/cost-envelope violation
→ no future capacity granted from that observation
```

No latest/alias drift is accepted as spend authority convenience.

### 9.4 Pricing revision

C-013's versioned price mechanism is reused by citation. This decision does not create a `PriceBook` domain object.

The reservation records/links the price/cost-profile revision used for its upper bound.

Exact freshness/revalidation cadence is 3L/implementation/ops.

---

## 10. Framework escape hatches that must remain closed

A model-spend cap is meaningless if the framework can emit model calls outside the seam.

### 10.1 Automatic retry

Current runtime qualification must prove one of:

```text
A. automatic provider retries below the owner gate are disabled
OR
B. every retry re-enters the owner reservation gate as a new provider request
```

Do not “reserve for one call and hope maxRetries stays zero”.

### 10.2 Processors / middleware / moderation

Mastra processors can themselves be configured with models.

A processor that performs model I/O is **not free middleware**.

It is enabled only if:

```text
its model call is routed through the same run budget owner
OR
it has a separately named owner/budget consumer admitted by Decision Loop
```

### 10.3 Subagents / multi-agent

No parallel billable subagent path is baseline.

A subagent that causes model calls must either serialize through the same one-outstanding owner gate or return through Decision Loop if it needs independent/concurrent spend lifecycle.

### 10.4 Memory extractors / observational memory / scorers

Current optional model-bearing memory/eval features remain disabled unless their calls are mechanically attributed and budgeted.

A framework feature does not become “operational overhead” exempt from spend authority merely because Mastra invokes it internally.

### 10.5 Provider-hosted tools

Provider-hosted paid tools/search are disabled unless the cost profile provides a finite admitted upper bound for their possible paid operations in one request.

Conexus/Gateway tools remain separately governed under their own effect/read budgets; model token/tool-selection cost is still part of the run's model budget.

---

## 11. Cancellation, terminalization and resume

### 11.1 Cancel before next reservation

```text
CANCELLED/terminal owner fact commits
→ no new model-call reservation
```

### 11.2 Cancel after reservation/provider invocation

Cancellation does not refund the outstanding model liability.

```text
best-effort runtime/provider abort
→ may reduce actual usage
-X-> authoritative capacity release
```

The reservation settles by known complete cost or conservative max.

### 11.3 Settlement after owner terminal

A run may terminalize while a provider request is still physically finishing due to cancellation/process loss.

The owner may still commit **monotonic spend settlement** after the terminal fact, because settlement does not revive execution authority or alter terminal meaning.

```text
terminal run
→ no new call
→ outstanding liability may still settle
```

### 11.4 Resume/restart

On rebind/resume:

```text
read durable ActorRun/AgentRun spend facts
if outstanding reservation exists
→ conservatively settle it before any next model call
→ re-evaluate remaining cap
```

Mastra thread/snapshot cannot clear or reconstruct spend authority from `totalUsage`.

---

## 12. Streaming

Streaming does not weaken the hard-cap property.

Before stream starts:

```text
reserve full qualified max liability
```

During stream:

```text
usage chunks / token counters
→ diagnostic/settlement inputs
-X-> permission to exceed pre-reserved liability
```

Best-effort cancellation on approaching cap is an optimization only. Provider/network buffering means a local “stop at token N” cannot be the primary hard-bound guarantee.

---

## 13. Provider limits and account-level controls

Provider-native:

```text
project/workspace/org spend limits
rate limits
prepaid credits
API-key restrictions
```

may reduce blast radius outside Conexus.

But they remain:

```text
coarser scope
provider-owned semantics
potentially changing behavior
shared across multiple runs
```

Therefore:

```text
provider limit = defense in depth / ops backstop
-X-> per-ActorRun/per-AgentRun primary authority
```

No per-run API key/token is minted simply to obtain provider-side accounting isolation.

---

## 14. Credible alternatives

### Alternative A — Owner-local one-outstanding liability + conservative upper-bound settlement

```text
ActorRun/AgentRun row
→ immutable cap
→ monotonic consumed amount
→ one outstanding worst-case liability
→ pre-call guard
→ known actual or conservative-max settlement
```

**PROVISIONAL ADOPT / GLOBAL MAXIMUM candidate.**

Why:

- closes concurrency/restart/unknown-usage schedules;
- preserves existing owners;
- needs no new durable class;
- does not depend on telemetry for ALLOW;
- does not require provider-specific hard per-run cap;
- composes naturally with serial F1 runtime;
- leaves detailed usage to C-013 evidence.

### Alternative B — Permanently charge worst-case upper bound for every admitted model call

Simplest shape:

```text
before provider call
→ committedBudgetSpendUsd += worstCaseCallCost
→ never settle downward
```

**REJECT as default, keep as fallback simplification.**

It is extremely safe and needs no outstanding reservation, but wastes budget on every normal successful call. Since current response usage is generally available and owner-local single outstanding settlement is small, the liveness/utility loss is not justified yet.

If implementation proves Alternative A's settlement seam materially unreliable, B is a credible fallback before inventing new infrastructure.

### Alternative C — Reuse `gw.budget_counter`

**REJECT.**

Failure:

```text
Gateway effect units != model spend
Builder/PAR owner facts become dependent on Gateway for pure reasoning
Gateway becomes universal budget service
```

### Alternative D — New ModelCallAttempt / BudgetRuntime / quota service / model proxy

**REJECT F1.**

Would add:

```text
new durable class
new owner
new recovery lifecycle
likely cross-runtime service boundary
credential/proxy blast radius
```

without a current parallel-call consumer.

### Alternative E — Rely on provider project/workspace hard/soft limits + post-hoc usage

**REJECT as primary.**

Cannot enforce an exact Conexus run identity and usage visibility is after provider work has already happened.

---

## 15. Authority / boundary summary

```text
Builder
→ ActorRun effective model cap
→ ActorRun pre-call reservation/settlement
→ no new model call after ActorRun terminal/cancel

PAR
→ AgentRun effective model cap
→ AgentRun pre-call reservation/settlement
→ no new model call after AgentRun terminal/cancel

Mastra / model adapter
→ enforcement plumbing + provider observations
-X-> budget authority
-X-> capacity creation from usage telemetry

C-013 Observability
→ detailed usage/cost/reconciliation evidence
-X-> per-run ALLOW

Gateway
→ external-effect budgets only
-X-> model-spend owner

provider account controls
→ defense in depth
-X-> Conexus run authority
```

Shared pure implementation for cost-envelope math does not create a shared domain owner.

---

## 16. Enforcement candidate

### E1 — Cap is owner-derived and pinned before first model call

No runtime/model/caller-provided cap.

### E2 — Pre-call atomic owner guard

Every billable request checks run terminal/cancel truth, exact pins, model-call count, one-outstanding property, qualified cost envelope and remaining spend in the same owner mutation that admits the reservation.

### E3 — No external I/O under transaction

Reservation commits before provider I/O; network call happens after commit.

### E4 — Unknown burns reserved liability

Missing usage/cost/response/recovery ambiguity never releases capacity; conservative max becomes committed cap consumption.

### E5 — Complete usage can settle downward only through owner validation

Provider/runtime observation must match exact outstanding generation/model/provider and pass complete qualified calculation.

### E6 — No hidden retry/model-call path

Runtime qualification proves every billable call reaches the gate. Uninterceptable hidden paths remain disabled.

### E7 — Terminal/cancel blocks new reservation

Existing run terminal truth is enough; no `BudgetStopped` state.

### E8 — Cost-profile failure blocks future calls

`MISSING_PRICE`, unsupported billing dimension or observed envelope violation cannot be patched by assuming zero/old price.

---

## 17. Proof strategy

Future implementation/3L must attempt to falsify at least:

### Owner / persistence

1. ActorRun with cap C cannot atomically admit a call whose reserved upper bound makes `committed + outstanding > C`;
2. same for AgentRun;
3. two concurrent pre-call attempts against one run cannot both reserve when F1 allows only one outstanding liability;
4. restart with an outstanding reservation cannot issue another call before conservative settlement;
5. newer Agent Release with larger budget does not widen an old AgentRun;
6. caller/model/Mastra context cannot alter the effective cap;
7. `gw.budget_counter` is not read/written as model-spend authority.

### Usage ambiguity

8. provider response with complete qualified usage settles actual cost <= reservation;
9. missing usage settles reservation max, not zero;
10. missing price / unsupported calculation settles reservation max, not zero;
11. process crash after reservation and before durable response eventually consumes reservation max before any next call;
12. later invoice reconciliation showing lower actual cost does not refund original run capacity F1;
13. cost-envelope violation blocks future calls/profile qualification and is visible as a finding/evidence.

### Retry / framework escape

14. configured Mastra/model SDK automatic retry cannot send a second provider request beneath one reservation;
15. tool continuation causes a new model step and re-enters the budget gate;
16. any enabled model-bearing processor/moderator routes through the same owner budget or remains disabled;
17. any enabled subagent cannot create concurrent untracked provider spend;
18. disabled OM/memory extractor/scorer cannot silently call a provider during governed run;
19. provider-hosted paid tool cannot be enabled without finite upper-bound contribution.

### Cancellation / terminal

20. cancel before next reservation blocks model call;
21. cancel after provider invocation does not refund outstanding liability;
22. terminal run cannot create new reservation;
23. post-terminal settlement may complete monotonically without reviving run authority.

### Streaming / price

24. streaming call reserves complete maximum liability before first output token;
25. stream abort is not required for the hard-cap proof;
26. cache discount miss cannot make actual charge exceed reserved amount;
27. long-context pricing threshold is included by the qualified request profile;
28. resolved model/pricing drift is detected; unexpected pricing class does not silently consume stale price metadata;
29. every admitted billable dimension has a finite upper bound; otherwise the request fails closed.

### YAGNI

30. no new durable ModelCallAttempt/Budget/Quota record is required for serial F1;
31. no model proxy/token broker/generic quota engine is required;
32. no per-run provider API key is required;
33. no OBS/Gateway lifecycle becomes a second ActorRun/AgentRun spend authority.

---

## 18. Routing

```text
exact Mastra/AgentController pre-call hook coverage               → 3L
hidden retry/default-retry proof                                  → 3L
provider/model upper-bound pricing/tokenization/features          → 3L
cost-profile refresh/version qualification                         → 3L/implementation
provider usage/invoice reconciliation                              → C-013 / ops / 3M if repair class emerges
owner-row exact SQL/fields/CAS                                    → implementation
parallel billable model calls / subagent fan-out                  → Decision Loop
new ModelCallAttempt durable lifecycle                             → Decision Loop under 3E-02
commercial project/group/month model budgets                       → Decision Loop on product consumer
model proxy / external LLM gateway                                 → Decision Loop only if enforcement seam fails
DEDICATED model spend                                              → only if a named DEDICATED platform model service later exists; not inferred here
```

This decision must not turn provider cost telemetry into a reason to reopen 3H runtime authority unless 3L proves no owner-bound pre-call seam can intercept every billable call.

---

## 19. Reopen triggers if candidate is ratified

1. Mastra/underlying SDK cannot mechanically ensure every F1 billable model request crosses the owner pre-call gate;
2. automatic retries cannot be disabled or individually admitted;
3. current F1 requires >1 concurrent billable model call per ActorRun/AgentRun;
4. one-outstanding owner-row realization cannot survive crash/restart without a new durable per-call lifecycle;
5. provider pricing contains a billable dimension that cannot be finitely bounded for an otherwise required F1 feature;
6. production measurements show conservative ambiguity settlement exhausts budgets materially often enough to justify a refund/reconciliation authority;
7. provider/model actual charges repeatedly exceed the qualified upper-bound envelope;
8. a new product scope needs aggregate Project/Workspace/Group commercial spend authority independent of run caps;
9. model calls must execute from a new out-of-process trust subject/runtime that changes spend owner/enforcement placement.

---

## 20. Adversarial questions for Fable

Fable must reconstruct authority independently and attack at least:

1. **Owner:** Is Builder/PAR run ownership correct, or does some already-approved owner own model-spend capacity instead?
2. **3E:** Can the required durable state fit existing `bld.actor_run` / `par.agent_run` without a new durable class? If not, prove the lifecycle and declare Material Finding against the current 46-class inventory.
3. **One outstanding:** Does F1 truly permit at most one billable provider request outstanding per run? Find hidden parallelism in current Mastra Agent/AgentController, processors, tools, subagents or runtime features.
4. **Crash schedule:** Can `cap + consumed + one outstanding liability` close crash/restart without a durable ModelCallAttempt record?
5. **Unknown settlement:** Is “ambiguity burns the full reserved max and never refunds F1” globally safer/smaller than retaining unresolved reservation? Find a failure class it creates that is unacceptable for current Product Agent/Builder liveness.
6. **Upper-bound proof:** Can a real provider call's maximum billable cost actually be bounded before dispatch given input tokenization, reasoning, cache tiers, long context and paid provider-side tools?
7. **Pricing drift:** What exactly can 3I promise as a hard cap if the external provider changes pricing or billing semantics after qualification? Tighten the invariant honestly; do not make a false invoice guarantee.
8. **Mastra seam:** Does `processLLMRequest` or another current hook cover every relevant call in both AgentController and direct Agent execution? Check current source/docs. If not, route to 3L/Material Finding rather than hand-wave.
9. **Retry:** Does Mastra or the underlying model SDK retry automatically beneath the proposed gate? If yes, can it be disabled or must reservation bound include N requests? Prefer interception over multiplying by a guessed retry count.
10. **Usage trust:** Mastra can synthesize zero-ish totals when usage is missing. Verify the exact current behavior and ensure no framework total becomes ALLOW authority.
11. **`maxModelCalls`:** Should call count remain an independent monotonic guard in addition to USD cap? Does any call-count semantic become ambiguous under retries/tool continuations?
12. **Cancellation:** Is conservative liability retention/settlement correct after cancel, including a still-streaming provider response?
13. **Terminal settlement:** Can cost settle monotonically after ActorRun/AgentRun terminal without contradicting 3G write-once terminal/history semantics?
14. **Gateway:** Confirm model spend must not reuse `gw.budget_counter`; if disagreeing, show why Gateway ownership is not widened.
15. **C-013:** Reconcile this candidate with C-013's admission-ledger language and 3H-R1's prohibition on parallel `UniversalAttempt`. What exact part is pattern versus authority?
16. **Provider controls:** Research current OpenAI/Anthropic primary sources only. Treat provider project/workspace/org limits as primary only if they can bind exact Conexus run identity and prove the same hard-cap semantics.
17. **Hidden model features:** Sweep current enabled F1 Mastra capabilities for model calls outside the primary Agent step. Disable speculative features instead of building a universal meter.
18. **Alternative B:** Is permanently charging every call's worst-case bound actually the better Global Maximum for F1 because it deletes settlement state? Compare real budget waste against state/race cost.
19. **No new machinery:** Can all current proofs be met with zero new module/service/record/queue/proxy/token broker?
20. Does any finding require reopening C-008/C-010/C-013/C-017/3E/3G/3H/3I-01/02? Preference or generic FinOps best practice is not enough.

---

## 21. Provisional candidate outcome before independent review

```text
Material Finding against approved authority = NONE found by ChatGPT so far
prior reopen required                      = NONE currently
candidate family                           = Per-ActorRun / Per-AgentRun Model Spend Enforcement
recommended alternative                    = A / owner-local one-outstanding conservative liability

model-spend owner                           = Builder ActorRun / PAR AgentRun
Gateway model-budget owner                  = NO
OBS model-budget owner                      = NO
provider limit primary authority            = NO

new Hub module                              = 0
new durable record class                    = 0
new database/schema                         = 0
new model proxy                             = 0
new token broker                            = 0
new BudgetRuntime/quota service             = 0
new generic admission FSM                   = 0
per-run provider API key                    = 0
parallel billable calls F1                  = 0
retroactive conservative-budget refund F1   = 0
technology product selected                 = 0
```

The next action is independent adversarial review. **Do not number or ratify this as `3I-03` until review converges and the operator approves.**

---

## 22. Fable independent adversarial review

**Fable: reconstruct applicable authority from the repository and edit below this line only. Do not trust the candidate synthesis. Attack owner-local persistence, one-outstanding-call sufficiency, crash/unknown settlement, pre-call cost upper-bound honesty, Mastra retry/interception coverage, hidden model-bearing framework features, C-013/3H-R1 coherence, and whether Alternative B is actually the smaller global maximum. Use current primary sources/Context7 where behavior is live. Do not alter LEDGER, approved authority or product code and do not create `3I-03`.**
