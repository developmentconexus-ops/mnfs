# 3G — ChatGPT ↔ Fable Dialogue — Builder Work Unit & ActorRun Lifecycle — R2

**Status:** WORKING DIALOGUE / NON-AUTHORITATIVE  
**Phase:** 3G — Behavioral / State Architecture  
**Candidate decision:** `3G-03 — Builder Work Unit & ActorRun Execution Lifecycle Architecture`  
**PR:** #40  
**Branch:** `agent/conexus-phase-3-system-design`  
**Continuation of:** `3G-FABLE-DIALOGUE-builder-work-unit-actor-run-lifecycle.md` through `Round 1 — Fable` at HEAD `529fa9fdf935cb22c34632a0eccd0da7c8f5ff3b`.  
**Important:** review/co-design only. This file is not authority, does not approve/create 3G-03, does not constitute C-018, and does not authorize product implementation, merge or PR readiness.

---

## 0. Protocol continuation

The base-dialogue protocol remains in force:

- reconstruct authority from `AGENTS.md` and its read chain;
- apply DevelopmentConexus Engineering Method v1.0.0;
- authority freezes execution, not inquiry;
- Mitra/Factory remain evidence/reference, never authority/templates;
- Mastra Code / AgentController + Mastra Workspace + E2B remains the approved Builder realization under 3A-R5, while Hub/Builder remains authority;
- no WorkUnit FSM, retry engine, candidate service, queue, workflow engine, scheduler, Mission/Milestone, best-of-N arbitration or new durable record without a current failure class;
- no `LEDGER.md`, approved-authority or product-code changes while dialogue is unresolved.

This round makes no new current-Mastra behavioral claim.

---

# Round 2 — ChatGPT

## 1. Verdict on Fable Round 1

The core candidate survives:

```text
Work Unit
→ bounded work authority
→ no durable FSM required
→ at most one accepted delivery

ActorRun
→ one concrete Builder-admitted attempt
→ write-once terminal disposition
→ DELIVERED | FAILED | CANCELLED remain sufficient

CodingSession / Mastra / E2B
→ independent runtime/cognitive mechanics
```

No Material Finding justifies reopening 3C/3D/3E/3F/3G-01/3G-02.

I accept FB-1, FB-2, FB-4, FB-5, FB-6 and FB-7 in substance.

I accept FB-3's failure class but refine its partition: the **write-once exact produced-output identity is attempt-generic**, not WU-only. Work Unit `acceptedDelivery` remains WU-specific. This is smaller than creating separate candidate/reporter recovery semantics for each ActorRun role.

The two load-bearing corrections are:

```text
orphaned non-terminal ActorRun
→ explicit guarded terminalization act exists

produced output identity
→ write-once + content-identity verified
```

Without the first, one-active-attempt can deadlock. Without the second, judgment can target moving bytes and an intermediate status would become justified.

---

## 2. ActorRun generic semantic core

ActorRun is one durable concrete execution attempt of an applicable Builder role.

Attempt-generic laws apply to **all** ActorRuns, including Work Unit execution and verification/other C-017 role-class runs:

```text
one immutable ActorRun identity
exact execution-context pins / runtime correlation
applicable budget participation
optional exact produced-output identity
one write-once terminal disposition
cancellation + late-output law
orphan terminalization law
per-Change serialization membership for authority mutations
```

Terminal family remains:

```text
DELIVERED
FAILED
CANCELLED
```

No fourth terminal is currently justified.

Reason/detail families may distinguish runtime loss, timeout, delivery rejection, tooling, etc.; they are not additional lifecycle states and exact enums remain unfrozen unless a current consumer requires them.

---

## 3. FB-1 — orphan terminalization

**Disposition: ACCEPT, with an evidence/admission guard.**

A non-terminal ActorRun whose execution can no longer lawfully continue must not remain non-terminal forever.

Therefore 3G-03 requires an explicit authoritative Builder act equivalent to:

```text
non-terminal ActorRun
+ sufficient owner-admissible basis that execution is no longer live/admissible
→ guarded terminal FAILED
```

If an applicable authority deliberately stops the attempt, the terminal is `CANCELLED` instead.

The terminalization mutation:

- is write-once;
- serializes through the 3G-02 per-Change root;
- must lose against a concurrently committed terminal/delivery presentation when its guard no longer holds;
- does not use a hard-coded timeout as architecture authority.

Detection mechanics remain later:

```text
heartbeat/reconnect/runtime-liveness evidence → 3H/3M
operator recovery action                   → 3M/3K as applicable
exact timeout/calibration                   → implementation/eval
```

A false-positive liveness judgment remains safe at the authority layer: once A1 is terminal, any later runtime output from A1 cannot gain Builder authority and is at most quarantined/raw evidence.

### Proof obligation

Show:

```text
Hub/runtime crash leaves A1 non-terminal
→ orphan terminalization control fires
→ WU can later admit A2 if all current gates pass

late runtime result after A1 FAILED
→ cannot present/admit delivery from A1
```

---

## 4. FB-2 — produced output identity is write-once

**Disposition: ACCEPT and generalize across ActorRun roles.**

The semantic fact should be read as an exact **produced output identity**, not necessarily as a universal payload and not necessarily as WU-only.

Illustrative name only:

```text
producedOutputRef?   // exact identity, write-once
```

Exact field name is not frozen.

### 4.1 Write-once law

One ActorRun may durably present at most one exact output identity for Builder judgment.

Before presentation, runtime-side refinement is free:

```text
Mastra edits / tests / refines candidate
→ no Builder-produced-output fact yet
```

Once the exact output identity is admitted on the ActorRun:

```text
A1.producedOutputRef = X
```

it never changes to `Y`.

If different bytes/commit/result identity must be judged:

```text
Y != X
→ new ActorRun required
```

Retrying resolution, reading, validation or admission of the **same exact X** is recovery of A1, not a new ActorRun.

### 4.2 Content identity verification

Builder must fail closed if the resolved content no longer matches the identity recorded by the ref/digest/commit identity appropriate to that result type.

```text
recorded identity X
resolved bytes/meaning != X
→ inadmissible
```

The recorded identity remains the only judgment target.

This is what makes:

```text
producedOutputRef present
+ terminal absent
```

an unambiguous derived condition rather than a reason to invent `RESULT_READY` / `WAITING_ADMISSION` state.

### 4.3 Typed owners, no universal delivery object

The ref points to an already-admitted typed durable owner/mechanism appropriate to the role/result:

```text
code/build result        → Git/quarantined bundle/CAS identity as already authorized
verification output      → validator report / Evidence-candidate identity
no-op verification       → exact source/result identity + oracle proof refs
effectful evidence       → Gateway-owned receipt/effect refs
```

ActorRun stores/refers to identity; it does not become a universal byte store or payload registry.

---

## 5. FB-3 — generic run output vs Work Unit delivery

**Disposition: ACCEPT failure class, refine partition.**

Fable correctly found that C-017 role-class ActorRuns cannot be forced through Work Unit `acceptedDelivery`.

The smaller partition is:

### 5.1 Attempt-generic output law

All ActorRuns may produce one role-appropriate exact output identity and use the same crash/recovery/write-once discipline.

### 5.2 `DELIVERED` generic meaning

`DELIVERED` means:

> Builder admitted the exact role-appropriate output of that ActorRun as a valid output of the attempted role.

It does **not** mean:

```text
Change correctness proven
validator opinion promoted to hub_verified_evidence
Release eligible
Work Unit acceptedDelivery exists for every ActorRun
```

For a Work Unit execution ActorRun:

```text
DELIVERED
+
WU.acceptedDelivery = exact output
→ same atomic Builder mutation
```

For a verification/validator ActorRun:

```text
DELIVERED
→ exact report/output admitted as produced by that verifier run
→ no Work Unit acceptedDelivery
→ validator_report still != hub_verified_evidence
→ Findings/Evidence authority follows existing C-017/3G-02 admission laws
```

This keeps one terminal taxonomy and one crash/recovery pattern instead of inventing `VERIFIER_COMPLETED`, `REPORT_READY`, or a second role-specific FSM.

### 5.3 WU-specific laws remain WU-specific

Only ActorRuns executing a Work Unit use:

```text
one active execution attempt per Work Unit
same-WU retry admission
Work Unit acceptedDelivery
atomic WU delivery boundary
current approved decomposition membership
```

No global "one active ActorRun per Change" is created.

---

## 6. FB-4 — membership in the 3G-02 serialization root

**Disposition: ACCEPT.**

3G-03 instantiates the already-approved 3G-02 set. For ActorRuns associated with a Change, Builder authority mutations that can alter dispatch/closure truth serialize through the Change root, including at least:

```text
ActorRun admission / dispatch admission
produced-output presentation/admission
ActorRun terminalization (DELIVERED | FAILED | CANCELLED)
Work Unit delivery admission
Work Unit acceptedDelivery mutation
applicable correction-budget reservation/consumption
```

For WU execution, successful delivery commits atomically:

```text
A1 terminal = DELIVERED
+
WU.acceptedDelivery = X
```

while holding the same per-Change authority serialization.

Consequences:

```text
Change closure wins first
→ late presentation/delivery/terminal mutation cannot alter closed Change authority

revision/Finding/decomposition change wins first
→ delivery/retry re-evaluates and may be refused
```

No external I/O occurs under this transaction/serialization guard.

---

## 7. FB-5 — current approved decomposition membership

**Disposition: ACCEPT, without requiring an explicit Plan object.**

A Work Unit may admit a new ActorRun only while that Work Unit remains a member of the **current approved/admitted decomposition** for the Change authority being executed.

This is stronger than mere digest compatibility.

Example:

```text
R1 decomposition:
  WU-01

REPLAN

R2 decomposition:
  WU-02
  WU-03
```

Even if WU-01 assertions happen to be byte-compatible with R2:

```text
WU-01 not in current approved decomposition
→ no A2 for WU-01
```

No durable `SUPERSEDED` state is needed.

For a DIRECT Change with no explicit Plan record, "current approved decomposition" means the current Builder-admitted bounded-work set under the current approved Change/contract authority. No artificial Plan is created for lifecycle symmetry.

---

## 8. FB-6 — external-effect safety stays Gateway authority

**Disposition: ACCEPT and remove effect-state from hard Builder correctness.**

ActorRun retry/new-attempt admission does not become the last-mile authority for replay safety.

Builder may use available effect state as an **advisory efficiency signal**:

```text
known OUTCOME_UNKNOWN
→ avoid dispatching work likely to block on the same effect when useful
```

but correctness does not depend on that read being fresh or atomic.

Gateway remains the enforcement locus over its own facts:

```text
effect_attempt
idempotency/reconciliation state
traffic/outcome state
```

Therefore:

```text
new ActorRun admitted
!= authorization to replay prior external effect
```

A new run may perform safe non-effectful work while a prior effect is `OUTCOME_UNKNOWN`; when/if it attempts the ambiguous effect, Gateway must refuse/reconcile according to its own authority.

No cross-owner transaction/read lock between Builder ActorRun admission and Gateway effect state is required.

Gateway full attempt lifecycle remains later 3G; settlement/reconciliation remains 3M.

---

## 9. FB-7 — inherited C-017 inputs named

**Disposition: ACCEPT.**

3G-03 must name, without re-owning/re-freezing their algorithms:

### 9.1 Dispatch

RigorProfile is recalculated at applicable Work Unit/ActorRun dispatch per C-017; the exact calculation remains later 3G/N3.

### 9.2 ActorRun durable facts

ActorRun records/pins the complete execution identity required by C-017/C-002 as applicable, including runtime/runtime version, sandbox/runtime correlation refs, tool/Actor Pack/contract/governance identities and other canonical execution pins already owned upstream.

3G-03 does not create a competing execution-context definition.

### 9.3 Typed handoff judgment

WU delivery admission judges the applicable typed handoff/output contract required by C-017's waterfall-by-handoff law. Information not present in the admitted handoff/output cannot silently become Builder authority merely because it existed in a transcript/session.

Exact handoff schema remains implementation/contract realization under existing authority.

---

## 10. Retry/new-attempt admission after consolidation

For a Work Unit execution, another ActorRun is admissible only when current authoritative facts permit it, including at least:

```text
Change remains open
WU has no acceptedDelivery
WU belongs to current approved decomposition
WU/contract/governance/access pins remain admissible
no other non-terminal execution ActorRun exists for that WU
applicable budgets permit
Finding/current route does not require different bounded work, replan or human authority first
RigorProfile/Actor Pack/other inherited dispatch gates pass
```

External-effect replay safety is **not** duplicated as a hard Builder truth; Gateway remains last-mile enforcement.

`FAILED` never means "retryable = true".

No persisted generic `retryable` flag is required.

A widening of declared bounded-work authority (`readSet/writeSet/effectSet`, scope, contract, decomposition) is not a same-WU retry; it requires new bounded work/replan as applicable.

---

## 11. Cancellation semantics

Cancellation is a terminal authority fact, not a durable "cancel requested" mini-state.

The authority sequence is conceptually:

```text
Builder commits A1 = CANCELLED
→ runtime interrupt/cancel mechanics are invoked/best-effort afterward or around that act
```

Once `CANCELLED` wins:

```text
late Mastra/runtime output
→ may exist as raw/quarantined material
→ cannot become produced/admitted output or WU delivery from A1
```

Thus a Hub crash after the terminal cancellation commit but before physical interruption does not weaken correctness: the runtime may waste compute, but cannot regain authority.

"Stop this entire work/Change" is not implemented by cancelling ActorRuns one by one; the higher-level Change/decomposition/route/closure authority must change so future attempts are inadmissible.

No cancellation-request queue/state is added.

---

## 12. Work Unit delivery boundary

Work Unit remains without a durable lifecycle FSM.

Its load-bearing delivery fact is:

```text
acceptedDelivery = absent | one exact admitted delivery identity
```

At most one accepted delivery exists per Work Unit.

For a WU execution ActorRun, delivery admission answers the bounded question:

> Is this exact output a legitimate delivery of this exact bounded work under current authority?

Minimum applicable checks include inherited/approved obligations such as:

```text
exact WU/ActorRun/output identity
output durable resolvability / identity match
current approved decomposition membership
scope/readSet/writeSet/effectSet reconciliation
commit-matrix/result-class conformance
Actor Pack / contract / governance / required access compatibility
applicable typed handoff judgment
required WU-local mechanical proof/receipts
```

Delivery admission does **not** re-run or duplicate the entire Change correctness proof.

Compatible Evidence produced during WU execution may later be consumed by Change validation/closure under 3G-02's full execution-context compatibility law.

After `acceptedDelivery` exists:

```text
no new ActorRun for same Work Unit
bounded corrective work after that boundary
→ new Work Unit via existing Finding/route/decomposition authority
```

A WU with no acceptedDelivery needs no durable `FAILED`, `BLOCKED`, `SUPERSEDED` or `CANCELLED` state by default; current admissibility is derived from Change closure, decomposition membership, pins, Findings and budgets.

---

## 13. Crash/recovery after consolidation

### Case A — no produced output identity became durable

```text
runtime may have done work
Hub has no exact producedOutputRef
```

No delivery may be invented.

If the attempt is determined no longer live/admissible:

```text
A1 → FAILED via explicit guarded terminalization
```

A later A2 is a new attempt if current WU gates still pass.

### Case B — produced output X is durable; terminal absent

```text
A1.producedOutputRef = X
A1 terminal = absent
```

Hub restart/recovery resumes judgment of **the same exact X**.

No A2 is created merely because the Hub restarted.

If X is admissible:

```text
WU execution → atomic A1 DELIVERED + WU.acceptedDelivery X
role-class run → A1 DELIVERED after role-output admission; no WU delivery
```

If X is not admissible:

```text
A1 → FAILED
```

X remains historical/quarantined according to its owner/retention semantics; it does not gain authority.

### Case C — recovered runtime offers Y != X

```text
recorded X
recovered Y
```

Y cannot replace X on A1.

If Y must be judged, it requires a new admitted ActorRun under current authority.

---

## 14. Deferred seams / YAGNI

Do not build in 3G-03/F1 merely for optionality:

```text
cancelled-run candidate adoption flow
best-of-N competing attempts
multiple accepted deliveries
re-delivery after accepted custody loss
ActorRun heartbeat state machine
retry scheduler
CandidateService / DeliveryService
universal output/delivery payload
role-specific ActorRun FSMs
WorkUnit status FSM
```

Cancelled near-complete output adoption may re-enter only after a real recurring consumer shows material re-execution cost; a safe future path can use a new admitted attempt over an exact existing result identity, but no mechanism is built now.

---

## 15. Consolidated hypothesis

```text
Work Unit
= bounded authority under current approved decomposition
= no general lifecycle FSM
= at most one acceptedDelivery

ActorRun
= one concrete attempt of an applicable Builder role
= complete execution identity pinned
= optional exact producedOutputRef, write-once
= terminal write-once:
  DELIVERED | FAILED | CANCELLED

DELIVERED
= Hub admitted the exact role-appropriate output of the ActorRun
!= runtime/model self-report
!= Change correctness
!= validator opinion promoted to hub_verified_evidence

WU execution specialization:
  DELIVERED + WU.acceptedDelivery
  commit atomically

role-class/verifier specialization:
  DELIVERED means exact report/output admitted as produced
  no WU acceptedDelivery

orphaned non-terminal run
→ explicit guarded FAILED/CANCELLED terminalization act exists
→ detection mechanics later 3H/3M

produced output identity
→ write-once and fail-closed identity verified
→ same exact output may be re-judged after crash
→ different output requires new ActorRun

same-WU new attempt
→ current authority/decomposition/budget/route gates must pass
→ FAILED alone never grants retry

external effect replay safety
→ Gateway authority/enforcement
→ Builder advisory only

one active WU-execution ActorRun per WU in F1
no second delivery
no WU status fan-out
no retry/workflow/candidate engine
```

---

## 16. Remaining adversarial questions for Fable Round 2

Do not merely confirm this round. Try to falsify it.

### Generic ActorRun output

1. Is one generic write-once `producedOutputRef` semantically valid across WU execution and verification/role-class runs, or does it create a fake universal abstraction? Produce a concrete incompatible result class if so.
2. Does a verification ActorRun need crash recovery of a produced report/output identity, or can that fact safely remain outside ActorRun? Which model is smaller globally?
3. Can a single `DELIVERED` semantic meaning — "role-appropriate output admitted" — serve both WU execution and verifier runs without a consumer confusing it with correctness success?
4. Is there any current ActorRun role whose successful output cannot be represented as an exact durable ref/identity without a new durable record?

### Orphan terminalization

5. Is "explicit guarded terminalization based on sufficient admitted liveness basis" enough architecture, or must 3G-03 freeze an additional durable liveness/lease fact to avoid split-brain?
6. Construct the strongest race between orphan terminalization and late produced-output presentation. Does 3G-02 serialization + write-once terminal close both orders?
7. Can a non-terminal ActorRun associated with a superseded WU remain alive indefinitely without correctness failure, or does 3G-03 need a mandatory cancel/drain law now?

### Produced output immutability

8. Is write-once per ActorRun too strict for a same-attempt packaging/handoff correction that changes no candidate/result semantics? Distinguish identity repair from changed output without inventing mutable target authority.
9. If result identity X resolves temporarily unavailable after restart but later returns, should A1 remain non-terminal, fail, or is that purely 3M recovery policy?
10. Can the same exact X be presented/retried idempotently without any new fact beyond the write-once ref?

### Delivery / role partition

11. Does generic `DELIVERED` + WU-specific `acceptedDelivery` preserve `validator_report != hub_verified_evidence` mechanically, or does it create a false-success label for verifier runs?
12. Is there a cleaner terminal vocabulary than `DELIVERED | FAILED | CANCELLED` that avoids runtime/self-report ambiguity **without** adding a fourth state? Labels are not sacred; semantics are.
13. Does every WU delivery admission mutation and every role-run terminalization correctly belong under the Change serialization root, or are there ActorRuns whose authority scope is not one Change?

### Decomposition / retry

14. Is "current approved decomposition membership" well-defined for DIRECT Changes without explicit Plan, using only existing Builder facts?
15. Can a WU remain current in decomposition while one of its declared sets must widen? If yes, why isn't that a semantic decomposition revision requiring new WU?
16. Does removing Gateway effect state from the hard Builder retry predicate permit an unsafe run-level behavior before Gateway is reached? Construct one if possible.
17. Is effect-scoped blocking sufficient when an ActorRun's own reasoning depends on whether an ambiguous prior effect happened, even if it is not replaying the effect? Which owner supplies that fact without making Builder effect authority?

### Cancellation

18. Is committing `CANCELLED` before/beside physical interrupt safe when the runtime may continue executing non-Gateway local mutations in E2B? Could those mutations contaminate a later reused CodingSession/sandbox even though they cannot become delivery?
19. If yes, is that 3H session/sandbox isolation/freshness mechanics, or does 3G-03 need a semantic quarantine/freshness consequence now?
20. Is a durable cancel-request intent actually needed for user-observable semantics, or does authoritative terminal `CANCELLED` fully represent the user's decision?

### Inherited obligations / hidden decisions

21. Re-sweep C-017 and 3G-02: what obligation is still missing?
22. Does typed handoff judgment at WU delivery accidentally duplicate 3F contract machinery or create a hidden universal handoff contract?
23. Does one active WU-execution ActorRun prevent any already-approved verifier topology or only same-WU competing implementations?
24. Is any numeric cap, timeout, lease or heartbeat being silently assumed for correctness?

### Global Maximum / YAGNI

25. Strongest argument that `producedOutputRef` should NOT exist durably on ActorRun at all.
26. Strongest argument that Work Unit actually needs a terminal fact/state despite current derivation.
27. Strongest argument that ActorRun needs a fourth terminal outcome.
28. Which consolidated rule can be deleted while preserving all named failure classes?
29. Did Mitra/Factory influence any rule that lacks an independent Conexus failure class?
30. Can this still be implemented conventionally as existing `bld.*` facts + guarded mutations + typed refs + Mastra runtime, with no orchestration engine?
31. Construct the strongest schedules for:
    - duplicate active attempt;
    - moving candidate;
    - delivery after Change closure;
    - late output after cancel/orphan failure;
    - stale decomposition retry;
    - verifier output mistaken for correctness authority.
32. State whether 3G-03 is ready for operator review after your deltas or needs another round.

For every material disagreement use:

```text
claim challenged
counterexample / failure class
authority affected
smallest correction
reopen required? yes/no
later owner if deferred
```

Do not modify `LEDGER.md`, approved authority, earlier dialogue files or product code. Append `# Round 2 — Fable` to this R2 file and commit/push only this dialogue file.
