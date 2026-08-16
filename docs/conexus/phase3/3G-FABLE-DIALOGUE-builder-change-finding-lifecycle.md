# 3G — ChatGPT ↔ Fable Dialogue — Builder Change & Finding Lifecycle

**Status:** WORKING DIALOGUE / NON-AUTHORITATIVE  
**Phase:** 3G — Behavioral / State Architecture  
**Candidate decision:** `3G-02 — Builder Change & Finding Lifecycle, Contract Revision & Closure Architecture`  
**PR:** #40  
**Branch:** `agent/conexus-phase-3-system-design`  
**Starting HEAD:** `3eaeb020baf2f9736d9a79a91ae63c9e3c000c32`  
**Important:** this file is review/co-design only. It is not authority, does not approve/create 3G-02, does not constitute C-018, and does not authorize product implementation, merge or PR readiness.

---

## 0. Review protocol

This dialogue follows the same independent/adversarial protocol used for prior Phase 3 decisions.

1. Reconstruct authority from `AGENTS.md` and follow its read order.
2. Apply DevelopmentConexus Engineering Method v1.0.0 from `docs/engineering/standards/root-cause-global-maximum-method.md`.
3. Read at minimum, as needed for this decision:
   - `docs/conexus/phase3/LEDGER.md`
   - `docs/conexus/phase3/3G-01-approval-request-lifecycle-claim-binding-state-architecture.md`
   - `docs/conexus/phase3/3A-R5-builder-coding-runtime-reassessment.md`
   - `docs/conexus/phase3/3C-05-builder-module-boundary.md`
   - `docs/conexus/17-modelo-engenharia-execucao-agentic.md` or the canonical C-017 source referenced by the repo
   - `docs/conexus/phase3/3D-R1-dependency-architecture-final-closure.md`
   - `docs/conexus/phase3/3E-01-hub-control-data-ownership-persistence-boundaries.md`
   - `docs/conexus/phase3/3E-02-module-durable-record-inventory-reference-closure.md`
   - `docs/conexus/phase3/3F-01-contract-surface-classification-versioning-boundary.md`
   - `docs/conexus/phase3/3F-02-boundary-payload-semantics-error-envelope-architecture.md`
   - `docs/conexus/phase3/3F-R1-contracts-api-architecture-final-closure.md`
   - `docs/research/MITRA-INSPIRATION-MAP.md`
   - `docs/research/FACTORY-AI-HARNESS-REFERENCE-MAP.md`
4. Approved architecture is baseline, not dogma. Reopen only for a material Finding with a concrete failure class and a globally superior correction.
5. Do not reopen for naming, symmetry, convention, framework preference, or hypothetical optionality.
6. Fable acts as an independent Senior/Staff/Principal Software Engineer + Software Architect, reasoning down to durable facts, lifecycle authority, races, crash/restart boundaries, temporal correctness, proof and product realization.
7. Append numbered rounds; do not silently rewrite another actor's round.
8. ChatGPT↔Fable agreement is not operator approval.
9. YAGNI applies aggressively. No generic FSM engine, workflow engine, route-policy framework, retry engine, Mission/Milestone model, generic state registry, event sourcing or new durable record without a current failure class.
10. Mitra and Factory are **evidence/reference**, not authority and not templates to copy. Extract problem/mechanism/cost; do not infer proprietary internals.
11. Mastra Code / AgentController + Mastra Workspace + E2B is the currently approved Builder realization under 3A-R5, but Mastra mechanics are not Builder domain authority. If any argument depends on current Mastra behavior, verify it through Context7 `/mastra-ai/mastra` and applicable Mastra skill/source.
12. No `LEDGER.md` changes, no approved-authority changes, and no product code while this dialogue remains unresolved.

---

# Round 1 — ChatGPT

## 1. Decision target

The target is deliberately smaller than "the Builder FSM".

3G-02 should decide only the minimum behavioral/state architecture necessary for:

```text
Change
→ current/approved correctness-contract revision relationship
→ checkpoint / handoff eligibility
→ dispatch eligibility at the Change boundary
→ Finding lifecycle + authoritative routing semantics
→ evidence/work staleness relationship to contract revision
→ terminal Change closure outcomes
```

It should **not** yet decide:

```text
Work Unit full lifecycle / retry state          → later 3G
ActorRun full lifecycle / crash/retry semantics → later 3G + 3H/3M
PlanningDepth × RigorProfile calculation        → later 3G
Mastra session/sandbox continuation mechanics   → 3H realization under 3A-R5
parallelism / subagents / Missions               → DEFER unless current failure class appears
exact UI labels/cards                            → 3K
exact SQL/columns/indexes                        → implementation
```

Candidate title:

> **3G-02 — Builder Change & Finding Lifecycle, Contract Revision & Closure Architecture**

---

## 2. Authority already fixed before this dialogue

This round does not reopen the following without a material Finding.

### 2.1 Builder ownership

Builder owns at least:

```text
Change
correctness contract
contract revision semantics
approved Plan when applicable
planning/decomposition semantics
Work Unit / ActorRun work graph
validation orchestration
Finding routing
Change readiness / closure
```

Worker/runtime self-report is not acceptance authority.

```text
harness says done
!=
Change accepted
```

### 2.2 Minimal Sufficient Execution

The baseline remains:

```text
1 Change
→ 1 Work Unit
→ 1 ActorRun
```

Additional planning, Work Units, ActorRuns, validators, sandboxes or decomposition require a current reason in risk/context/dependency/failure/proof.

No generic pipeline/workflow DSL in F1.

### 2.3 Mastra coding realization

Under 3A-R5:

```text
Builder
→ CodingWorkerRuntime boundary
→ Mastra Code / AgentController
→ Mastra Workspace
→ E2B
```

Default cognitive scope is one persistent CodingSession per Change.

```text
Change lifetime
!= CodingSession lifetime
!= ActorRun lifetime
!= Sandbox lifetime
```

A later ActorRun may continue the same CodingSession when that is the smallest coherent realization. A fresh session remains available for verifier independence, material contract revision, suspected cognitive contamination, or other concrete risk.

Mastra owns mechanics/cognition, not Conexus product authority.

### 2.4 C-017 correctness/revision law

Correctness precedes decomposition.

Every bounded work/evidence fact is tied to the exact contract revision it was produced under, including at least Work Unit / ActorRun / Evidence via an exact `contractRevisionDigest` or equivalent.

A material semantic contract change requires:

```text
new contract revision
→ prior approved revision no longer sufficient for new dispatch
→ new human checkpoint
→ earlier work/evidence is stale for proving the new current revision unless mechanically revalidated
```

The worker/harness may propose revision; it cannot approve or silently replace authority.

### 2.5 Finding law already present in C-017

A durable Finding survives the ActorRun and includes semantically relevant facts equivalent to:

```text
source
kind/type
severity
evidence ref
affected assertions
fingerprint
contract impact
suggested route
status/current resolution facts
```

Route families already exist conceptually:

```text
LOCAL_FIX
FIX_WORK_UNIT
REPLAN
HUMAN
```

Producer suggests; Hub/Builder determines the authoritative route.

The Hub may elevate intervention; it must not silently downgrade below what proven facts require.

Repeated work without materially new hypothesis/evidence must not loop indefinitely.

### 2.6 Durable inventory already exists

3E already admits the Builder records needed here:

```text
bld.change
bld.contract_revision
bld.plan_revision
bld.work_unit
bld.actor_run
bld.coding_session
bld.finding
bld.change_acceptance
```

This dialogue proposes **zero new durable record classes**.

---

## 3. Evidence from Mitra and Factory — transfer, not imitation

### 3.1 Mitra

The observed Mitra build supports a user-visible shape where the product surface remains simple while the harness performs planning, implementation, checks, local corrections and escalation internally.

Useful transfer:

```text
simple product progress
+ local correction inside the agent task
+ stop/escalate instead of infinite retry
+ durable/platform-owned infrastructure effects outside agent discretion
+ honest final limitation/reporting
```

Do not transfer:

```text
Claude Code-specific vocabulary
fixed task/checklist machinery as domain authority
instruction-only guarantees where Conexus can enforce mechanically
```

### 3.2 Factory

Factory provides a useful external reference for:

```text
correctness before decomposition
worker != validator
validator finds; does not fix what it judges
fix work after proven gaps
operator intervention when work blocks
proportionality between simple direct work and Missions-scale orchestration
```

Do not transfer:

```text
Mission entity by default
Milestone entity by default
fresh worker for every bounded task by default
Missions-scale orchestration for small Changes
Factory proprietary state model by inference
```

### 3.3 Product inference

The Conexus product surface should remain closer to:

```text
UNDERSTAND
→ APPROVE
→ BUILD
→ VERIFY
→ READY / NEEDS YOU / BLOCKED
```

than to exposing every internal `Finding`, Work Unit, ActorRun or route to ordinary users.

The internal rigor exists to make the product safer and simpler, not to expose a workflow designer.

---

## 4. Root cause / failure classes

### FC-1 — coding harness becomes hidden authority

Without owner-local Finding/routing semantics, a Mastra coding session would implicitly decide whether a failure means:

```text
try again locally
create more bounded work
change the contract
ask a human
```

That turns cognitive/runtime state into product authority.

### FC-2 — silent contract drift

A coding session discovers that the approved definition of success is wrong/incomplete and continues implementing a revised meaning without a new checkpoint.

Result:

```text
human approved R1
system builds R2 semantics
```

without an authority transition.

### FC-3 — fan-out staleness mutation duplicates truth

Material revision R1→R2 causes writes such as:

```text
UPDATE WorkUnit status=STALE
UPDATE ActorRun status=STALE
UPDATE Evidence status=STALE
...
```

The same truth is duplicated across records and can partially fail/drift.

### FC-4 — gap exists only in transcript/runtime

If a verifier or runtime proves a material gap but it is not a durable Finding, process/session loss can erase the reason a Change must not close.

### FC-5 — retry/fix loops

The coding harness can repeatedly attempt the same correction because every turn is locally plausible.

Without fingerprint/repetition + aggregate correction limits, "new hypothesis" can become an unbounded escape hatch.

### FC-6 — false-green closure

Examples:

```text
worker says done
zero open Findings
all code compiled
```

are each insufficient to prove the correctness contract.

### FC-7 — operational block conflated with terminal outcome

If `BLOCKED` means both:

```text
cannot proceed right now
and
Change has been permanently closed as blocked
```

runtime/UI/product semantics become ambiguous.

Likewise `HUMAN` route must not automatically mean terminal `ESCALATED`.

### FC-8 — closure history is rewritten

If a terminal Change can later reopen/mutate back to running, an accepted `change_acceptance` ceases to be a stable Release input and historical truth is rewritten.

### FC-9 — workflow-engine creep

If every intermediate operational condition becomes a persisted status and every route becomes another transition state, Builder becomes a generic workflow engine contrary to 3C-05/C-017/YAGNI.

---

## 5. Alternatives

### Alternative A — one persisted Change FSM + one persisted Finding FSM

Example shape:

```text
ChangeStatus =
  DRAFT
  PLANNING
  WAITING_APPROVAL
  READY
  RUNNING
  FIXING
  REPLANNING
  WAITING_HUMAN
  BLOCKED
  ACCEPTED
  ...
```

**Current hypothesis: reject.**

It duplicates facts that already exist, conflates execution mechanics with Change authority, and creates pressure toward a workflow engine.

### Alternative B — derive absolutely everything

No explicit Finding lifecycle fact; all behavior inferred from evidence/transcript/work graph.

**Current hypothesis: reject.**

Finding itself has a current operational meaning: unresolved gap vs durably resolved gap, route escalation, fingerprint recurrence and CAS-like concurrency. Forcing this to be entirely derived hides mutable domain truth.

### Alternative C — hybrid owner-local facts + projections

**Recommended hypothesis.**

```text
Change
→ small durable authority facts
→ canonical operational projections
→ immutable terminal closure

Finding
→ small explicit current resolution facts
→ route is separate from resolution/lifecycle
→ monotonic intervention escalation
```

No generic FSM engine.

---

# Part I — Change

## 6. Change authority: durable facts, not mega-status

Candidate load-bearing facts include semantically:

```text
currentContractRevisionRef
approvedContractRevisionRef
optional terminalClosure
```

Other Builder facts may participate in projections — current approved Plan when required, Findings, assertion/evidence coverage, Work Unit pins — but they are not automatically a single mutable `ChangeStatus`.

Exact columns/names are not frozen here.

Candidate principle:

> Persist a Change fact only when losing that fact would destroy required semantics; derive current operational conditions from facts already retained.

---

## 7. Contract revision / checkpoint relation

Candidate invariant:

```text
currentContractRevision = approvedContractRevision
→ current revision is checkpoint-approved

currentContractRevision != approvedContractRevision
→ new coding dispatch under the new current revision is prohibited
```

Conceptual projection:

```text
R1 current + R1 approved
→ checkpoint satisfied

R2 current + R1 approved
→ CHECKPOINT_REQUIRED / HANDOFF_REQUIRED

R2 current + R2 approved
→ checkpoint satisfied again
```

The exact label is owner-local naming, not a stable public/wire literal.

No separate persisted `HANDOFF_REQUIRED` status is justified by current evidence.

---

## 8. Staleness by revision mismatch, not fan-out rewrite

Candidate global rule:

> A historical work/evidence fact remains true about the exact contract revision it was produced under. Its ability to prove the **current** Change is derived by exact revision compatibility, not by rewriting its historical state merely because the Change current revision changed.

Example:

```text
ActorRun A1.contractRevision = R1
Evidence E1.contractRevision = R1
Change.currentContractRevision = R2

R1 != R2
→ A1/E1 are stale for proving R2
```

This does not mean A1 "did not happen" or E1 became historically false.

Therefore the default should **not** require cascading mutations:

```text
R1→R2
-X-> UPDATE every prior WorkUnit/ActorRun/Evidence to STALE
```

A later mechanically proven revalidation may allow specific evidence to satisfy R2 under C-017's existing law; absence of revalidation never grants validity by assumption.

Fable should challenge whether any current failure class actually requires materialized staleness on old records.

---

## 9. Change operational condition != terminal closure

Candidate separation:

```text
current operational condition
!=
terminal closure outcome
```

While open, a Change may project conditions equivalent to:

```text
SHAPING
CHECKPOINT_REQUIRED
EXECUTABLE
HUMAN_INPUT_REQUIRED
PREREQUISITE_BLOCKED
```

These labels are examples, not frozen literals and not necessarily mutually exclusive UI states.

The architecture should instead freeze the predicates/meaning that determine whether work may proceed.

Do not persist `RUNNING`, `WAITING`, `REPLANNING`, `FIXING`, etc. merely to mirror transient orchestration.

---

## 10. Terminal Change closure outcomes

Current authority already requires honest distinction among at least:

```text
ACCEPTED
NO_CHANGE_REQUIRED
REJECTED
BLOCKED
ESCALATED
```

Candidate rule:

> These are **terminal dispositions** of the Change boundary, not intermediate states the Change repeatedly traverses during normal execution.

### 10.1 ACCEPTED

Means:

> the correctness contract of the current approved revision is satisfied by admissible evidence, with no unresolved condition that prevents closure.

At minimum:

```text
currentContractRevision = approvedContractRevision

all applicable MUST assertions
→ admissible verdict
→ evidence valid for current revision

no applicable MUST assertion = UNVERIFIED/BLOCKED

no unresolved Finding that still requires action before closure

no required checkpoint remains pending
```

Worker/harness self-report is never sufficient.

### 10.2 NO_CHANGE_REQUIRED

Means:

> admissible investigation/proof shows the required truth already holds and no mutation is necessary.

It is not "ACCEPTED with zero diff" and not "nothing happened".

It must be proven under the applicable correctness/checkpoint law.

### 10.3 REJECTED

Means:

> an applicable authority explicitly terminates the Change as something that should not proceed.

A checkpoint response equivalent to "revise the proposal" does **not** automatically mean terminal REJECTED; it may create a new current contract revision and keep the Change open.

### 10.4 BLOCKED

Temporary inability to proceed must not automatically terminalize the Change.

Terminal BLOCKED means approximately:

> a required objective/proof remains unsatisfied; no authorized automatic route remains inside the current constraints/horizon; and the applicable authority closes the Change as unable to complete under those conditions.

Examples may include irrecoverably unavailable required access, exhausted approved correction budget, or no safe oracle when the operator chooses to close rather than continue waiting/re-scoping.

### 10.5 ESCALATED

A Finding routed to HUMAN does not automatically mean the Change is terminally ESCALATED.

Terminal ESCALATED means approximately:

> resolution has moved outside the Builder/Change's current operational authority or scope, and the applicable authority explicitly closes this Change while a higher-level decision/process takes over.

Example: a material architecture decision must be reopened and the operator chooses to stop this Change and address architecture before creating future work.

---

## 11. Closure immutability

Candidate invariant:

```text
open Change
→ one terminal closure at most

terminal closure
-X-> reopen into active execution
-X-> mutate to a different terminal outcome
```

Work discovered after closure becomes a new Change, correlated to the prior Change when needed.

Rationale:

- historical truth remains truthful;
- `bld.change_acceptance` remains a stable Release input;
- later information does not rewrite what was proven/decided at the earlier closure point.

Fable should challenge whether any current F1 product flow truly requires reopening the exact same Change after terminal closure.

---

# Part II — Finding

## 12. Finding lifecycle: minimal resolution fact

Candidate semantic projection:

```text
OPEN
RESOLVED
```

This does **not** imply a mandatory physical `status` column. A representation such as:

```text
resolution absent → OPEN
resolution present → RESOLVED
```

or equivalent may be simpler.

What matters architecturally is the current unresolved/resolved meaning and its concurrency-safe mutation, not enum ceremony.

Do not add:

```text
NEW
ANALYZING
FIXING
REPLANNING
WAITING_HUMAN
REOPENED
...
```

unless a current independent consumer/failure class proves one necessary.

---

## 13. Route is separate from Finding resolution/lifecycle

Candidate route vocabulary remains the already-existing C-017 family:

```text
LOCAL_FIX
FIX_WORK_UNIT
REPLAN
HUMAN
```

A Finding can be:

```text
OPEN + LOCAL_FIX
OPEN + FIX_WORK_UNIT
OPEN + REPLAN
OPEN + HUMAN
```

Route is not status.

A route may begin directly at any intervention level justified by proven facts.

Examples:

```text
material business ambiguity
→ HUMAN immediately

contract invalidation
→ REPLAN immediately

bounded implementation gap with intact contract
→ FIX_WORK_UNIT

small local correction with intact contract/scope/authority
→ LOCAL_FIX
```

---

## 14. Producer suggestion != authoritative route

Mastra coding session, verifier, runtime, deterministic gate or human observation may supply a proposed/suggested route.

Builder owns the authoritative routing decision.

```text
producer suggestedRoute
!=
authoritativeRoute
```

Candidate law:

> authoritative route must be at least the minimum intervention required by proven facts; the runtime/harness cannot lower it by confidence or convenience.

Do not invent a generic policy engine. The initial realization can be one deterministic Builder-owned rule/table/function with closed inputs actually required by current authority.

---

## 15. Route meaning

### 15.1 LOCAL_FIX

Admissible only when the approved meaning remains intact.

At least:

```text
correctness contract unchanged
scope materially unchanged
architecture/boundary assumption unchanged
required authority unchanged
no effect-class widening
correction remains a local/bounded continuation of current work
```

If assertion/scope/effect/boundary/required access materially changes:

```text
-X-> LOCAL_FIX
```

### 15.2 FIX_WORK_UNIT

Used when the approved contract remains correct but correction deserves separate bounded work due to scope, failure isolation, proof, context or operational cost.

3G-02 decides why the route exists; later 3G decides the full Work Unit lifecycle.

### 15.3 REPLAN

Means the current contract/plan authority is no longer sufficient/correct.

Examples include:

```text
assertion meaning changed
requirement changed
scope changed
effect class changed
required access changed
assumed boundary invalidated
```

REPLAN itself does not mutate the Change contract. It requires the authoritative contract-revision path.

```text
Finding REPLAN
→ new/current ContractRevision proposal
→ current != approved
→ checkpoint required
```

### 15.4 HUMAN

Reserved for a material question not safely decidable inside current Builder authority.

Examples:

```text
business ambiguity
irreversible decision
architecture-authority change
security/authority question
material product trade-off requiring operator choice
explicit scope widening
```

LLM uncertainty alone is not sufficient.

---

## 16. Monotonic intervention / no silent downgrade

Candidate law:

> Once an authoritative route has been established, later resolution may keep or elevate the intervention level; it may not silently downgrade below what the durable/proven facts require.

Conceptual intervention order:

```text
LOCAL_FIX
< FIX_WORK_UNIT
< REPLAN
< HUMAN
```

Fable should challenge whether this is a true total order or whether `REPLAN` and `HUMAN` are partially ordered/incomparable in some cases. If a total order is wrong, propose the smallest model that preserves "never reduce required intervention" without inventing route machinery.

---

## 17. Loop prevention

C-017 already names two complementary controls.

### 17.1 Per-Finding repetition

```text
same fingerprint
+ no materially new hypothesis/evidence
→ repeating the same correction is prohibited
→ route/intervention must elevate or human/closure path must be considered
```

Do **not** freeze a numeric "2 retries" architecture law merely because an observed harness used such a number. Exact caps are calibration unless another authority already freezes them.

### 17.2 Per-Change aggregate correction budget

A Change retains bounded correction/validation resources as already required by prior authority, covering classes such as:

```text
fix cycles
ActorRuns / validation work
cost
time
```

This prevents an unbounded series of nominally distinct Findings/hypotheses from bypassing the per-Finding repetition rule.

Exhaustion never becomes success.

```text
stuck
!= complete
```

Exact numeric thresholds remain calibration/implementation unless independently frozen.

No generic RetryEngine is justified.

---

## 18. Finding resolution

Candidate law:

> A Finding becomes resolved only through admissible proof or an applicable authoritative decision; executor self-report alone is insufficient.

Possible semantic resolution reasons may include:

```text
proven corrected
later evidence proves original allegation invalid/non-applicable
new approved contract revision supersedes applicability
applicable human decision resolves the ambiguity
```

Exact reason literals should not be frozen until a current consumer requires them.

### 18.1 No reopen

A resolved Finding is not mutated back to OPEN.

Recurrence creates a new Finding correlated to the prior Finding, e.g. by parent/ref/fingerprint semantics already admitted by C-017.

Reason:

```text
F77 was resolved at time T under evidence E
```

remains historical truth even if a later regression occurs.

This is not event sourcing; it is preservation of one durable engineering fact plus a new recurrence fact.

---

# Part III — Dispatch

## 19. EXECUTABLE is a predicate, not persisted state

Candidate principle:

> `EXECUTABLE` is shorthand for "a new bounded coding dispatch is currently admissible under Change authority". It is derived, not necessarily persisted.

Conceptually:

```text
canDispatch(Change, WorkUnit)
```

should be determined from current authoritative facts.

At minimum a new coding dispatch requires:

```text
Change not terminally closed
current ContractRevision = approved ContractRevision
approved Plan/revision when an explicit Plan is required
Work Unit pinned to the exact current approved revision
no unresolved condition that forbids this dispatch class
required access/preconditions for this dispatch are satisfied
```

Builder dispatch eligibility is not platform-wide authorization.

```text
Builder canDispatch
!=
Gateway/I&A/Connection/Release must allow
```

Other owners preserve their own last-mile authority.

---

## 20. Finding-specific dispatch effects

Do not use the simplistic rule:

```text
any OPEN Finding
→ stop all execution
```

Candidate semantics:

### OPEN + LOCAL_FIX

May permit continuation in the same CodingSession / bounded work context, under the already-authorized contract and correction budget.

### OPEN + FIX_WORK_UNIT

General free-form continuation is not justified; the Builder should create/admit the additional bounded Work Unit required by the route, then dispatch that unit under the later Work Unit lifecycle law.

### OPEN + REPLAN

No new coding dispatch under the changed/new current revision until checkpoint approval restores:

```text
currentContractRevision = approvedContractRevision
```

### OPEN + HUMAN

No autonomous progress that depends on the unresolved human decision. Independent unaffected work should not be forbidden by accident if a current decomposition can prove it is independent; whether that optimization is needed in F1 should be challenged for YAGNI.

This is intentionally more precise than "Finding blocks Change".

---

## 21. Contract-revision hard gate

Candidate invariant:

```text
currentContractRevision != approvedContractRevision
→ no new coding dispatch against the new current revision
```

The coding harness cannot bypass this because it "already understands" the new requirement.

The CodingSession may remain alive mechanically; the authority to perform new bounded work is owned by Builder.

Session reuse/freshness remains realization under 3A-R5/3H.

---

# Part IV — Closure

## 22. Closure predicate

Closure should be determined mechanically from current facts/evidence, not inferred from task narration.

Candidate acceptance gate:

```text
current revision = approved revision

all applicable MUST assertions
→ admissible verdict
→ evidence valid for the current revision

no applicable MUST assertion remains UNVERIFIED/BLOCKED

no unresolved Finding remains that requires action before closure

no required checkpoint remains pending
```

No single one of these is a substitute for the full applicable proof obligation.

In particular:

```text
zero OPEN Findings
!= ACCEPTED

Mastra run complete
!= ACCEPTED

build green
!= ACCEPTED unless build fully answers every applicable correctness assertion
```

---

## 23. Closure record / `change_acceptance`

3E already admits `bld.change_acceptance` as a stable/immutable Release input.

3G-02 should freeze semantic properties, not schema:

```text
closure identity / Change identity
exact closed contract revision
terminal outcome
proof/evidence linkage required by the outcome
closure occurrence identity/time as needed
```

Exact columns/digest shape remain implementation/contract realization unless another accepted authority already freezes them.

No new `ChangeClosure` record is proposed.

---

## 24. Product surface law

Internal rigor must not force internal vocabulary into ordinary UX.

Default user-visible macro-flow may remain equivalent to:

```text
UNDERSTAND
APPROVE
BUILD
VERIFY
READY / NEEDS YOU / BLOCKED
```

Technical drill-down can show:

```text
ContractRevision
Finding
Work Unit
ActorRun
Evidence
```

when useful to an operator/engineer.

3G-02 should not freeze UI copy or screen structure; the law is only that product presentation must not become a second lifecycle authority and should not expose internal ceremony without user value.

---

## 25. Buildability / implementation-reality hypothesis

This candidate requires no distributed workflow engine.

A conventional modular-monolith realization could be bounded domain functions/operations equivalent to:

```text
deriveChangeCondition(...)
canDispatch(...)
routeFinding(...)
resolveFinding(...)
proposeContractRevision(...)
recordCheckpointDecision(...)
evaluateClosure(...)
closeChange(...)
```

backed by the already-approved PostgreSQL records.

Mastra Code / AgentController + E2B execute coding mechanics; Conexus persists/guards domain authority.

No current requirement implies:

```text
Temporal
Kafka
workflow scheduler
state engine
route DSL
retry service
Mission Control clone
```

Current Mastra behavior is realization evidence only and remains probe-gated under 3L/3A-R5.

---

## 26. Candidate invariants

If this decision survives challenge, the minimal invariant set should be approximately:

1. **Change authority is not a mega-status FSM.** Current operational conditions derive from owner-local facts unless a fact is independently load-bearing.
2. **Current contract revision and checkpoint-approved revision are distinct authority facts.** Revision mismatch forbids new coding dispatch under the unapproved revision.
3. **Historical work/evidence remains pinned to the exact contract revision it was produced under.** Staleness for the current revision is derived by compatibility/revalidation, not rewritten history by default.
4. **Change operational conditions are not terminal outcomes.** Temporary block/wait/human input does not automatically close the Change.
5. **Terminal closure is explicit, single and immutable.** `ACCEPTED | NO_CHANGE_REQUIRED | REJECTED | BLOCKED | ESCALATED` are terminal dispositions, not ordinary intermediate states.
6. **ACCEPTED requires complete applicable correctness proof for the current approved revision.** Worker self-report and absence of Findings are insufficient.
7. **NO_CHANGE_REQUIRED requires proof that the target truth already holds without mutation.**
8. **REJECTED means explicit termination, not merely "revise this proposal".**
9. **Terminal BLOCKED is distinct from a temporary prerequisite block.**
10. **Finding HUMAN route is distinct from terminal Change ESCALATED.**
11. **Finding resolution is minimal (`OPEN | RESOLVED` semantics) and need not be a persisted status enum.**
12. **Finding route is separate from Finding resolution/lifecycle.**
13. **Producer-suggested route is not authority.** Builder determines the minimum required intervention from proven facts.
14. **Required intervention never silently downgrades.** Route may stay/elevate according to proven facts.
15. **Repeated same-fingerprint correction without materially new evidence/hypothesis cannot loop.**
16. **Per-Change aggregate correction limits prevent unbounded "new hypothesis" escape.** Exhaustion never becomes success.
17. **Resolved Finding never reopens.** Recurrence is a new Finding correlated to the prior one.
18. **Finding REPLAN does not directly rewrite Change authority.** It forces the contract-revision/checkpoint path.
19. **`EXECUTABLE` is a derived dispatch predicate, not an obligatory persisted Change state.**
20. **Open Finding does not automatically stop every form of work.** The route constrains what work remains admissible.
21. **Mastra/E2B mechanics do not become Change/Finding authority.**
22. **No new subsystem/record/dependency is justified by this decision.**

---

## 27. Proof strategy / falsification traces

A future authoritative 3G-02 should be able to prove/falsify at least:

```text
1. contract R1 approved → R2 proposed
   → no dispatch under R2 before new checkpoint

2. A1/E1 produced under R1, Change moves to R2
   → A1/E1 remain historical facts
   → cannot prove R2 without explicit compatibility/revalidation
   → no fan-out stale writes required for correctness

3. simple coding bug under intact contract
   → Finding LOCAL_FIX
   → same CodingSession may continue
   → no new contract revision/human checkpoint required

4. gap requires bounded additional implementation but contract intact
   → FIX_WORK_UNIT
   → does not force REPLAN

5. Finding proves assertion/scope/effect meaning changed
   → route REPLAN
   → contract revision path
   → harness cannot silently continue new meaning

6. Finding requires business/architecture authority
   → HUMAN
   → Change remains open unless applicable authority explicitly closes ESCALATED/REJECTED/BLOCKED

7. same fingerprint + same hypothesis repeats
   → repetition control demonstrably fires
   → no infinite local-fix loop

8. many distinct Findings consume aggregate correction budget
   → aggregate bound demonstrably fires
   → exhaustion cannot be converted to ACCEPTED

9. Mastra run says done but one MUST assertion UNVERIFIED
   → ACCEPTED fails

10. zero open Findings but missing evidence
    → ACCEPTED fails

11. all MUST evidence valid for R1, current revision R2
    → ACCEPTED fails until R2 proof/checkpoint obligations hold

12. NO_CHANGE_REQUIRED
    → no mutation required
    → proof demonstrates target already true
    → closure is distinguishable from ACCEPTED-with-diff

13. temporary Connection/prerequisite outage
    → Change projects blocked/waiting condition
    → does not automatically terminalize BLOCKED

14. explicit terminal BLOCKED
    → later recovery does not reopen same Change
    → new Change required for resumed/new work

15. checkpoint response "revise"
    → does not terminalize REJECTED
    → new contract revision / checkpoint cycle possible

16. explicit operator termination
    → REJECTED
    → no further dispatch

17. Finding HUMAN receives answer that resolves issue inside same Change
    → Finding resolves
    → Change can continue
    → no forced terminal ESCALATED

18. resolved Finding recurs
    → new Finding correlated to previous
    → previous Finding remains historically resolved

19. concurrent attempts to resolve/escalate same Finding
    → owner-local CAS/guard prevents contradictory current route/resolution facts

20. terminal Change closure races with late Finding/evidence mutation
    → exactly one authority outcome; no accepted Change with a concurrently admitted blocking gap
```

Trace 20 is intentionally left as an adversarial concurrency question: Fable should identify the smallest transaction/guard law required, and whether 3G-02 must explicitly freeze it now.

---

## 28. Explicit anti-overengineering guardrails

3G-02 must **not** imply building:

```text
GenericFSM
WorkflowEngine
StateRegistry
RoutePolicyEngine
RetryEngine
FindingService framework
Mission / Milestone
universal DAG scheduler
parallel agent fleet
fresh worker for every bug
validator for every Change
persistent status column for every projection
fan-out stale updater
Event Sourcing
CQRS
new durable record
new cross-module FK
new cross-owner transaction class
```

Any future addition requires its own current consumer/failure class.

---

## 29. Reopen triggers

Revisit 3G-02 if real evidence later requires any of:

- a terminal Change must genuinely reopen while preserving Release/acceptance semantics;
- another execution engine consumes `Change` independently and current Builder-owned assumptions become wrong;
- a second authoritative Finding consumer/owner appears;
- current revision-based staleness cannot support a required evidence-reuse/recovery case;
- partial/incremental acceptance becomes a real product requirement;
- multiple independent sub-Changes must close separately under one parent authority;
- compliance requires durable recording of operational intermediate states currently treated as projections;
- implementation concurrency proves the proposed owner-local guards cannot preserve closure/routing invariants under the F1 PostgreSQL model;
- Mastra probe evidence materially invalidates a runtime assumption that currently leaks into domain semantics.

Do not reopen for a different enum spelling, UI preference, framework convention or hypothetical future scheduler.

---

## 30. Fable — Round 1 falsification questions

Please attack the candidate, not merely confirm it.

### A. Scope / Global Maximum

1. Is `Change + Finding` the smallest coherent 3G decision, or should they be separated? Name the concrete hidden decision/failure class created by either split/merge.
2. Does this candidate still contain workflow-engine thinking disguised as domain predicates?
3. Which rule can be deleted without reintroducing a concrete failure class?
4. Is any essential C-017 complexity being incorrectly removed under YAGNI?

### B. Change facts / projection

5. Are `currentContractRevisionRef`, `approvedContractRevisionRef`, and terminal closure sufficient as the load-bearing Change facts for this scope, or is another current fact required?
6. Can `CHECKPOINT_REQUIRED/HANDOFF_REQUIRED` safely remain derived from revision mismatch in every current case?
7. Does revision-derived staleness fail for any Evidence/WorkUnit/ActorRun case that requires a monotonic durable invalidation fact analogous to 3G-01 STALE?
8. Can evidence from R1 ever be legitimately reused for R2 without creating a second authority? What must be proven/persisted?

### C. Finding semantics

9. Is `OPEN | RESOLVED` semantic lifecycle sufficient, or is another current Finding state genuinely load-bearing?
10. Is `route != status` globally superior, or does it create ambiguous combinations?
11. Is the proposed route family still correct/minimal under C-017?
12. Is `LOCAL_FIX < FIX_WORK_UNIT < REPLAN < HUMAN` a valid total monotonic order? Construct a counterexample if REPLAN and HUMAN are not meaningfully ordered.
13. What exact durable fact prevents route downgrade under concurrency without freezing schema/DDL?
14. Does "same fingerprint + no materially new hypothesis/evidence" need a more mechanical definition now, or can its realization safely wait?

### D. Dispatch

15. Is revision equality sufficient as the hard gate, or can an approved revision still be non-dispatchable for an owner-local Change reason that must be frozen now?
16. Can OPEN+LOCAL_FIX safely continue in the same CodingSession without creating authority leakage?
17. For OPEN+HUMAN, is allowing independent unaffected work valuable F1 proportionality or speculative complexity that should be rejected for now?
18. Does a Finding route need to atomically coordinate with WorkUnit creation now, or can the later WorkUnit lifecycle safely realize it?

### E. Closure

19. Are all five terminal outcomes necessary? Try to collapse pairs without losing user/system behavior.
20. Is `BLOCKED` truly terminal only on explicit closure, or should some mechanical budget/access exhaustion terminalize automatically?
21. Is `ESCALATED` a real terminal Change outcome or just metadata/reason for BLOCKED/REJECTED?
22. Is immutable terminal closure globally superior to reopening the same Change? Give the strongest real product counterexample.
23. Does `change_acceptance` need to exist for every terminal outcome or only success-class outcomes under 3E authority?
24. What exact concurrency guard is required so a blocking Finding cannot be committed concurrently with ACCEPTED closure?

### F. Mitra / Factory / Mastra / product

25. Compared with the actual Mitra evidence, are we moving too much harness behavior into durable domain state?
26. Compared with Factory, are we losing an important validator/fix-loop invariant by keeping one persistent coding session?
27. Is anything being copied merely because Mitra/Factory has it?
28. Does this design remain usable as a simple product surface, or would it inevitably expose internal workflow machinery?
29. If any current Mastra premise matters, verify it with Context7 `/mastra-ai/mastra` + Mastra sources and distinguish mechanism from authority.

### G. Buildability / hidden decisions

30. Can this be implemented conventionally in the current modular monolith/PostgreSQL model with no generic state engine?
31. Construct the strongest race/crash counterexample involving contract revision, Finding route/resolution and terminal closure.
32. Identify every rule that is implementation detail masquerading as architecture.
33. Identify every material decision still hidden and incorrectly delegated to implementation or a later phase.
34. If prior 3C/3D/3E/3F/3G-01 authority must reopen, name the exact material Finding, failure class and globally superior correction. Do not route around it silently.

For each material disagreement use:

```text
claim challenged
counterexample / failure class
authority affected
smallest correction
reopen required? yes/no
later owner if deferred
```

Append your response as:

```text
# Round 1 — Fable
```

Include:

- verdict;
- reconstructed authority;
- material findings;
- counterexamples;
- minimal corrections;
- unnecessary complexity;
- strongest argument against your own recommendation;
- phase routing/reopens if any;
- whether the candidate can proceed to operator review or needs another round.

Do not modify earlier rounds, `LEDGER.md`, approved authority or product code. Commit/push only this dialogue file.