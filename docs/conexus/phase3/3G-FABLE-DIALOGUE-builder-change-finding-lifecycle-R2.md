# 3G — ChatGPT ↔ Fable Dialogue — Builder Change & Finding Lifecycle — R2

**Status:** WORKING DIALOGUE / NON-AUTHORITATIVE  
**Phase:** 3G — Behavioral / State Architecture  
**Candidate decision:** `3G-02 — Builder Change & Finding Lifecycle, Contract Revision & Closure Architecture`  
**PR:** #40  
**Branch:** `agent/conexus-phase-3-system-design`  
**Continuation of:** `3G-FABLE-DIALOGUE-builder-change-finding-lifecycle.md` through `Round 1 — Fable` at HEAD `f9f1e30a071bf507210ab371861888d4ca8056c8`.  
**Important:** review/co-design only. This file is not authority, does not approve/create 3G-02, does not constitute C-018, and does not authorize product implementation, merge or PR readiness.

---

## 0. Protocol continuation

The base-dialogue protocol remains in force:

- reconstruct authority from `AGENTS.md` and its read chain;
- apply DevelopmentConexus Engineering Method v1.0.0;
- authority freezes execution, not inquiry;
- Mitra/Factory are evidence/reference, never templates or authority;
- Mastra Code / AgentController + Mastra Workspace + E2B remains the approved Builder realization under 3A-R5, but mechanics never become Builder authority;
- no generic FSM/workflow/retry/route-policy engine, Mission/Milestone, event sourcing or new durable record without a current failure class;
- no `LEDGER.md`, approved-authority or product-code changes while dialogue is unresolved.

This round makes no new current-Mastra behavioral claim.

---

# Round 2 — ChatGPT

## 1. Verdict on Fable Round 1

The central structure survives challenge:

```text
Change
→ durable authority facts
→ independent decision predicates
→ one immutable terminal closure

Finding
→ durable gap fact
→ tiny resolution semantics
→ separate authoritative route axis

Mastra/E2B
→ coding/runtime mechanics only
```

No Material Finding justifies reopening 3C/3D/3E/3F/3G-01.

I accept FB-2, FB-3, FB-4, FB-6, FB-7, FB-8 and FB-10 in substance.

I accept FB-1, FB-5 and FB-9 with refinements because their failure classes are real but their original wording can accidentally freeze more implementation/topology than the invariant requires.

The most important correction to my Round 1 is broader than a detail:

> **3G-02 must not copy 3G-01's single exclusive projection shape. Change has simultaneous independent conditions; it needs decision predicates, not a `ChangeState` enum.**

The second important correction is restoration of frozen C-017 complexity that my first round under-modeled:

```text
semantic policy / standards / gate snapshot
+ full pinned execution context
```

YAGNI cannot delete those existing invariants.

---

## 2. FB-1 — one serialization root for Builder-side closure authority

**Disposition: ACCEPT, narrowed to the authoritative admission boundary.**

Fable's counterexample is real:

```text
closure reads no blocking Finding
→ concurrent Finding commits
→ closure commits ACCEPTED
```

Under READ COMMITTED this is a legal interleaving and violates the core invariant.

3G-02 therefore needs a serialization law.

### Normative property

For one Change, every **Builder-owned authority mutation whose admitted result can change dispatch or closure admissibility** serializes through one Change-owned root before committing.

This includes at least Builder admission/mutation of:

```text
contract revision adoption/current-ref change
checkpoint/approved-ref change
Finding create
Finding authoritative-route elevation
Finding resolution
admission of assertion verdict / evidence reference into Builder closure authority
terminal closure
success acceptance creation
```

Terminal closure is a write-once guarded mutation on the same root.

Once terminal closure commits:

```text
no later Builder mutation may alter that closed Change authority
```

A losing guarded mutation fails/aborts rather than silently committing contradictory state.

### Important refinement to Fable

The law does **not** mean every producer of raw evidence must transact through `bld.change`.

For example:

```text
OBS event creation
CAS/blob persistence
external test output
validator raw report
```

may exist independently under their own owners/mechanics.

What must serialize is the **Builder admission** of such material into authoritative Change/Finding/closure truth.

Therefore:

```text
external evidence production
!=
Builder acceptance of evidence as closure authority
```

This avoids inventing cross-owner transactions or turning OBS/CAS into Builder lifecycle participants.

### Why Change is the correct serialization scope

C-017 already makes execution serial by default and one Change is the unit whose closure is being protected. Per-Change serialization therefore does not create a new global bottleneck or scheduler.

3G-02 freezes the property, not:

```text
SELECT ... FOR UPDATE syntax
advisory locks
ORM primitive
column used as generation
exact SQL statement
```

### Proof obligation

Show both orders:

```text
Finding admission wins first
→ closure sees it and refuses

closure wins first
→ late Builder Finding admission cannot mutate closed Change
```

and demonstrate the losing control actually fires.

---

## 3. FB-2 — Plan and policy/standards snapshot are real co-gates

**Disposition: ACCEPT.**

My Round 1 incorrectly made contract-revision equality look sufficient by itself.

### Plan

When the Change requires an explicit Plan, the exact approved Plan revision is part of the Change's semantic contract identity.

Therefore:

```text
same contract assertions
+ different required Plan revision
→ semantic contract revision transition
→ checkpoint path
```

No third mutable `currentPlan / approvedPlan` state pair is required merely for lifecycle symmetry.

### Policy / standards / gates

C-017 invariant 8 is load-bearing and remains authority:

```text
dispatch
→ pin exact applicable policy/standards/gates snapshot

semantic governance drift
→ blocks new dispatch
→ blocks acceptance under stale governance
→ requires checkpoint/revalidation
```

The Change must therefore carry/resolve the required immutable governance snapshot identity already required by C-017.

Currency/compatibility is a comparison/property; no fan-out mutation is required simply because governance changed.

### Temporal boundary

The closure/dispatch decision is evaluated against one exact applicable governance snapshot at its authority guard.

A governance change **after** a lawful terminal closure does not rewrite historical closure. It may, however, make the immutable acceptance proof no longer admissible to a later consumer such as Release until the later C-017 governance/revalidation obligation is satisfied.

This raises one cross-lifecycle question for Fable in §15: how should a post-closure/pre-Release governance change realize the required re-checkpoint/revalidation without violating closure immutability?

No answer should silently reopen a closed Change or mutate an old `change_acceptance`.

---

## 4. FB-3 — Evidence validity follows the complete applicable execution context

**Disposition: ACCEPT, strengthened to the canonical C-017 identity rather than a hand-picked list.**

Contract revision alone is not enough.

C-017 already defines an `executionContextDigest`-class identity over the complete applicable execution pins and states that any component change after validation makes Evidence stale.

Therefore the 3G-02 law should be expressed as:

> Evidence is admissible for a closure proof only when its exact contract identity and the complete applicable pinned execution context required by C-017 are compatible with the candidate/context being closed, or when an explicitly admitted mechanical revalidation has established compatibility.

Do not freeze a smaller parallel list in 3G-02 such as only:

```text
tree
policy
environment
```

because that could drift from C-017's canonical definition.

### Derived staleness remains correct

No monotonic durable `STALE` flag is justified here.

```text
Evidence pins = current required pins
→ compatible

Evidence pins != current required pins
→ stale/inadmissible for that proof
```

If the entire exact compatible state genuinely returns, old Evidence may become compatible again. That is not approval resurrection: it is proof about the same exact state becoming relevant again.

This is deliberately different from 3G-01 `ApprovalRequest.STALE`, whose monotonicity protects one-time authorization.

### Mechanical revalidation

Old Evidence never silently proves a new context.

Revalidation is an explicit admitted proof act that:

```text
references prior Evidence
+ proves compatibility under the new required context
+ creates/adopts current proof identity
```

The exact physical representation remains implementation/verification work.

---

## 5. FB-4 — zero OPEN Findings at successful closure

**Disposition: ACCEPT, with an anti-noise guard.**

My phrase "no unresolved Finding that still requires action" left a hidden classifier.

For successful closure:

```text
OPEN Finding count = 0
```

No implementation may silently declare an OPEN Finding "non-blocking" merely because it looks cosmetic.

If an applicable authority decides the gap does not block the Change, that is a **Finding resolution** with recorded reason/evidence/decision as applicable.

Examples of resolution semantics may include:

```text
FIXED / PROVED_RESOLVED
NOT_APPLICABLE
WAIVED_BY_AUTHORITY
SUPERSEDED_BY_NEW_REVISION
```

The exact reason enum is not frozen here unless a current consumer requires it.

### Anti-overengineering guard

Not every observation must become a durable Finding.

A Finding is the durable object for a proved gap that participates in engineering routing/closure semantics. Pure commentary/telemetry with no engineering decision need not be admitted as a Finding merely to later waive it.

This preserves:

```text
zero OPEN Findings at success
```

without creating Finding/waiver ceremony for every informational note.

---

## 6. FB-5 — terminal closure and `change_acceptance`

**Disposition: ACCEPT the split, add atomic success law.**

3E already froze `bld.change_acceptance` as an immutable/stable Release input. It must not become a generic tombstone for every closure reason.

### Terminal Change fact

The Change itself carries one write-once terminal closure outcome:

```text
ACCEPTED
NO_CHANGE_REQUIRED
REJECTED
BLOCKED
ESCALATED
```

This is the historical lifecycle fact.

### `change_acceptance`

Only successful closure creates a `change_acceptance`:

```text
ACCEPTED
NO_CHANGE_REQUIRED
```

Non-success closure:

```text
REJECTED
BLOCKED
ESCALATED
→ no change_acceptance
```

### Atomicity inside Builder

Success closure and its immutable `change_acceptance` proof must commit atomically inside the Builder owner boundary:

```text
terminal success closure
+
change_acceptance proof identity
→ one Builder transaction
```

This prevents:

```text
Change = ACCEPTED but acceptance proof missing
```

or:

```text
change_acceptance exists for a Change not successfully closed
```

No new cross-owner atomicity class is created; both are `bld.*`.

### `NO_CHANGE_REQUIRED`

`NO_CHANGE_REQUIRED` may still produce an acceptance proof:

```text
base/result source identity unchanged
+ no-mutation proof
+ complete assertion/evidence matrix
```

This does **not** mean new deployable bytes exist. It records a successful proof outcome and may be consumed only where that no-op acceptance is semantically relevant.

### Consumer partition

```text
SUCCESS = ACCEPTED | NO_CHANGE_REQUIRED
NON_SUCCESS = REJECTED | BLOCKED | ESCALATED
```

Only SUCCESS can produce a Release/verification-eligible acceptance proof.

The five outcome meanings remain distinct for product/audit; the core machine law is the success/non-success partition.

---

## 7. FB-6 — Change uses independent decision predicates, not one canonical operational projection

**Disposition: ACCEPT.**

This is the cleanest simplification from Fable's review.

3G-01 has a total/exclusive projection because its durable fact-space makes that correct.

Change does not.

These may all be true simultaneously:

```text
contract checkpoint required
human-routed Finding open
required-access unavailable
correction budget exhausted
```

Therefore 3G-02 must not define a single exclusive `ChangeState` such as:

```text
WAITING_APPROVAL | BLOCKED | HUMAN | RUNNING | ...
```

Instead it freezes a minimal family of independent decision predicates over authoritative facts.

At least conceptually:

```text
checkpointRequired(change, governance)

dispatchAdmissible(change, intendedBoundedWork, authorityContext)

closureAdmissible(change, proposedOutcome, proofContext)
```

Names/signatures are illustrative, not API authority.

Presentation may compose multiple true conditions into simple product language.

This is a deliberate architectural difference from 3G-01:

```text
same fact-discipline
!=
same projection topology
```

The Round-1 labels such as `SHAPING`, `EXECUTABLE`, `HUMAN_INPUT_REQUIRED` and `PREREQUISITE_BLOCKED` are therefore deleted as candidate architecture vocabulary. They may reappear later only as 3K presentation if useful.

---

## 8. FB-7 — route order means monotonically decreasing autonomous authority

**Disposition: ACCEPT, refined as an authority law rather than severity/order-of-work law.**

The route family remains:

```text
LOCAL_FIX
FIX_WORK_UNIT
REPLAN
HUMAN
```

Do not interpret this as:

```text
small problem
< bigger problem
< even bigger problem
```

The useful total order is the amount of autonomous authority remaining:

```text
LOCAL_FIX
→ continuation inside existing bounded-work authority

FIX_WORK_UNIT
→ new bounded work must be explicitly admitted

REPLAN
→ agent/Builder may propose; contract authority must be checkpointed

HUMAN
→ no autonomous substitute for the missing decision
```

Automatic/derived routing may only preserve or withdraw autonomy; it never silently restores more autonomy.

### Human decision is not a route downgrade

If a HUMAN-routed Finding is answered with:

```text
"this is safe; fix locally"
```

the old Finding is resolved by the superior authority decision. Any newly authorized work then receives its own correct admission/route facts.

Do not mutate:

```text
HUMAN → LOCAL_FIX
```

on the same unresolved Finding merely to disguise the human authorization as an automatic downgrade.

### Mechanical realization

Current route/elevation must be concurrency-safe and monotonic under Builder authority.

Exact columns/CAS syntax remain implementation.

---

## 9. FB-8 — exhaustion blocks autonomy; it does not auto-close the Change

**Disposition: ACCEPT, with authority wording corrected.**

A transient or adjustable exhaustion condition must not irreversibly terminalize the Change merely because closure is immutable.

Therefore:

```text
correction budget exhausted
required access absent
other recoverable prerequisite exhausted/unavailable
→ automatic dispatch prohibited as applicable
→ condition surfaced to authority
```

It does **not** automatically write terminal `BLOCKED`.

A terminal outcome is produced by an explicit admitted Builder closure mutation under the authority appropriate to that outcome.

"Explicit" does not mean every closure must be manually clicked by a human:

- `ACCEPTED` / `NO_CHANGE_REQUIRED` may be mechanically closed by the Hub when all frozen proof/authority predicates permit it;
- `REJECTED` is inherently an applicable authority decision;
- `BLOCKED` / `ESCALATED` require an admitted conclusion that the Change is being ended in that disposition, rather than merely observing a temporary inability to proceed.

This reconciles terminal immutability with C-017 `stuck != complete` without manufacturing a new Change every time a budget can be raised.

---

## 10. FB-9 — LOCAL_FIX is bounded-work continuation, not session continuation

**Disposition: ACCEPT, replace literal SHARE with the authoritative bounded-work delivery boundary.**

My Round 1 over-associated persistent Mastra CodingSession with authorization.

Correct law:

> `LOCAL_FIX` is admissible only while the producing bounded work remains open and the correction stays inside its existing authority, contract/write/effect scope and correction budget.

Once that bounded work has crossed its authoritative delivery/completion boundary:

```text
minimum correction route = FIX_WORK_UNIT
```

The same persistent CodingSession may still be reused by the new Work Unit under 3A-R5.

Therefore:

```text
CodingSession still alive
!=
authority to mutate without new bounded-work admission
```

Do not freeze the historical word `SHARE` as the lifecycle boundary unless later Work Unit realization chooses that exact mechanism.

---

## 11. FB-10 — in-flight ActorRun under superseded authority

**Disposition: ACCEPT and route mechanics explicitly.**

If an ActorRun is already executing when contract/governance authority changes:

```text
it does not gain authority to complete the new current Change merely because it started earlier
```

Its output/evidence is admitted or rejected under the same complete compatibility rules as any other evidence.

At minimum:

```text
superseded-context output
-X-> current closure authority by assumption
```

The detailed behavior:

```text
interrupt
cancel
drain
allow-to-finish-but-quarantine
resume/rebase
```

belongs to the later Work Unit / ActorRun lifecycle decision plus 3H/3M mechanics.

This deferral is safe because 3G-02 already prevents superseded output from becoming current authority silently.

---

## 12. Consolidated candidate model after Round 1 review

### 12.1 Change authority

The minimum current authority is semantic facts equivalent to:

```text
current contract revision identity
approved/checkpointed contract revision identity
applicable approved Plan identity inside contract semantic identity when required
applicable governance/policy/standards snapshot identities
terminal closure = absent | one of five outcomes
correction-budget/current control facts already required by C-017
references/admissions needed for assertion×verdict proof
```

No universal mutable operational status.

### 12.2 Change decision predicates

Independent, not exclusive:

```text
checkpoint requirement
bounded-work dispatch admissibility
terminal closure admissibility
```

No architecture-level `RUNNING/WAITING/HUMAN/BLOCKED` enum.

### 12.3 Finding

Semantic lifecycle:

```text
OPEN
RESOLVED
```

which may be realized by absence/presence of immutable resolution facts rather than a mandatory mutable status column.

Authoritative route:

```text
LOCAL_FIX
FIX_WORK_UNIT
REPLAN
HUMAN
```

Route and lifecycle are different axes.

Routing monotonically decreases autonomous authority until an applicable human/owner decision resolves the Finding and authorizes a new path.

### 12.4 Evidence

Compatibility is derived from exact applicable C-017 pins/context.

No fan-out STALE writes and no ApprovalRequest-style monotonic stale fact.

### 12.5 Closure

One immutable terminal fact:

```text
ACCEPTED
NO_CHANGE_REQUIRED
REJECTED
BLOCKED
ESCALATED
```

Successful closure atomically creates the immutable `change_acceptance` proof.

Closure cannot be committed concurrently with a Builder-side blocking/closure-relevant admission due to per-Change serialization.

### 12.6 Runtime/product

```text
Mastra/E2B
→ mechanics

Builder records/predicates
→ authority

3K UI
→ simple macro-progress / intervention surface
```

No internal Finding/state vocabulary is automatically public/wire authority.

---

## 13. YAGNI deletion test after Fable review

Still rejected:

```text
Change FSM engine
GenericFSM / StateRegistry
workflow DSL
Mission/Milestone
route-policy framework/service
RetryEngine
AI novelty classifier
parallel scheduler
Finding event sourcing
new durable ChangeState record
new durable FindingState record
new Tier-2 FK
status column merely for presentation
public status taxonomy
```

The retained complexity pays for current failure classes:

```text
Change serialization root
→ prevents accepted-with-concurrent-gap and post-close mutation

contract/plan/governance checkpoint gates
→ prevents silent authority drift

multi-pin Evidence compatibility
→ prevents stale proof from accepting changed candidate/context

Finding + route
→ prevents runtime transcript from deciding engineering authority

correction budgets/fingerprint
→ prevents infinite work loops

immutable terminal closure
→ preserves historical truth and stable Release input
```

---

## 14. Proof strategy delta

In addition to the Round-1 traces, future 3G-02 authority should prove at least:

```text
1. late Finding admission vs ACCEPTED closure in both orders
   → exactly one ordering wins; no accepted Change gains later Builder gap mutation

2. contract revision transition vs Work Unit dispatch race
   → dispatch cannot admit under superseded/unapproved revision

3. semantic policy/standards drift
   → new dispatch refused; successful closure refused until required re-checkpoint/revalidation

4. Evidence contract matches but executionContextDigest/current applicable pins differ
   → proof inadmissible

5. mechanical revalidation of old Evidence
   → only explicit admitted compatibility proof restores eligibility

6. OPEN Finding at success closure
   → closure fails unless Finding is explicitly resolved

7. route concurrent elevation attempts
   → no autonomy-restoring lost update

8. correction budget exhaustion
   → automatic dispatch stops, but no irreversible terminal closure appears by observation alone

9. post-bounded-work LOCAL_FIX attempt
   → refused; requires FIX_WORK_UNIT or stronger route

10. successful closure
    → terminal Change fact + immutable change_acceptance commit atomically

11. non-success closure
    → terminal Change fact commits; zero change_acceptance

12. in-flight output from superseded context
    → cannot satisfy current closure without current compatibility/revalidation proof
```

---

## 15. Round 2 — Fable falsification questions

Please attack the consolidated model rather than merely confirm FB dispositions.

### A. Serialization / authority

1. Is the narrowed FB-1 boundary correct: only **Builder admission into Change authority** must serialize, while raw OBS/CAS/validator evidence production may remain independent? Construct a counterexample if this is insufficient.
2. Does one Change serialization root accidentally create a hidden global bottleneck or make future parallel Work Units impossible, despite C-017's parallelism trigger?
3. Are any Builder mutations missing from the set that must serialize because they can change dispatch/closure admissibility?

### B. Governance drift × immutable closure

4. Strongest unresolved question: semantic policy/standards drift occurs **after Change ACCEPTED but before Release consumes `change_acceptance`**. C-017 requires new checkpoint/revalidation before promote, while 3G-02 makes Change closure immutable. What is the smallest sustainable realization?
   - immutable closed Change + new acceptance/revalidation proof?
   - successor verification Change?
   - Release-owned revalidation gate?
   - another smaller model?
   Do not silently reopen the Change or mutate old acceptance proof.
5. Does the answer to Q4 require 3G-02 to decide more now, or is a precise cross-lifecycle invariant + routing to later Release-state work sufficient?

### C. `change_acceptance`

6. Is `terminal success closure + change_acceptance` atomic inside Builder the correct minimum, or does 3E imply a different authority relationship?
7. Is producing `change_acceptance` for `NO_CHANGE_REQUIRED` semantically sound? Show a current consumer/failure class either for keeping it or for omitting it.
8. Does `change_acceptance` need to be unique per Change closure, or can governance revalidation legitimately create more than one immutable acceptance proof for one immutable closed Change? This is deliberately unresolved because Q4 may decide it.

### D. Findings / waiver / route

9. Does `zero OPEN Findings at successful closure` over-block F1? If so, propose a smaller explicit rule that does not recreate a hidden non-blocking classifier.
10. Is "do not admit pure informational observations as Findings" sufficient to keep waiver fatigue from becoming product ceremony?
11. Is decreasing autonomous authority the globally best interpretation of the C-017 route order, or is there a concrete route pair still incomparable under that reading?
12. Can a human resolution + newly admitted lesser work be implemented without weakening the no-silent-downgrade invariant?

### E. Derived predicates / overengineering

13. Are `checkpointRequired`, `dispatchAdmissible`, and `closureAdmissible` the minimal decision-predicate family, or can one be derived from the others without losing a protected decision?
14. Is any surviving rule still an implementation detail masquerading as architecture?
15. Is any required C-017 obligation still missing after restoring Plan, governance snapshot, and complete execution-context Evidence compatibility?

### F. Product / references

16. Does the model still preserve Mitra-like simple product experience and Factory-like correctness/independent-validation lessons without importing Missions-scale machinery?
17. Identify any rule whose only justification is "Factory/Mitra does something similar" rather than an in-house invariant/failure class; delete it if found.

### G. Strongest counterexample

18. Construct the strongest reachable schedule that can still produce:
   - false ACCEPTED;
   - work admitted under stale authority;
   - stale Evidence accepted;
   - route autonomy silently increased;
   - terminal closure later rewritten.
19. If no such schedule survives, state whether 3G-02 is ready for operator review or needs one more round.

For every material disagreement use:

```text
claim challenged
counterexample / failure class
authority affected
smallest correction
reopen required? yes/no
later owner if deferred
```

If current Mastra behavior becomes material to an argument, verify through Context7 `/mastra-ai/mastra` and applicable primary Mastra source/skill.

Do not modify `LEDGER.md`, approved authority, earlier rounds or product code.
