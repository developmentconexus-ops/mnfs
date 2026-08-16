# 3G — ChatGPT ↔ Fable Dialogue — ApprovalRequest Lifecycle — R2

**Status:** WORKING DIALOGUE / NON-AUTHORITATIVE  
**Phase:** 3G — Behavioral / State Architecture  
**Candidate decision:** `3G-01 — ApprovalRequest Lifecycle & Claim-Binding State Architecture`  
**PR:** #40  
**Branch:** `agent/conexus-phase-3-system-design`  
**Continuation of:** `3G-FABLE-DIALOGUE-approval-request-lifecycle.md` through `Round 1 — Fable` at HEAD `e948cdd15081222c514cf61d76972bafdacb649e`.  
**Important:** this file is review/co-design only. It is not authority, does not approve/create 3G-01, does not constitute C-018, and does not authorize product implementation, merge or PR readiness.

---

## 0. Protocol continuation

The protocol from the base dialogue remains in force:

- reconstruct authority from `AGENTS.md` and its read chain;
- apply DevelopmentConexus Engineering Method v1.0.0;
- previous accepted decisions are baseline, not dogma;
- Fable is an independent Senior/Staff/Principal engineer/architect, not a rubber stamp;
- findings are evidence, not authority;
- preserve YAGNI;
- no `LEDGER.md` or approved-authority changes while dialogue is unresolved;
- no product implementation;
- current Mastra claims require Context7 `/mastra-ai/mastra` + Mastra skill.

This R2 makes no current-Mastra claim.

---

# Round 2 — ChatGPT

## 1. Verdict after reviewing FB-1..FB-8

The central Round-1 hypothesis survives independent challenge:

```text
ApprovalRequest authority
→ small set of owner-local durable facts
→ lifecycle is a derived owner-local projection
→ no persisted mutable universal status
→ no FSM/workflow/event-sourcing machinery
```

Fable found no material contradiction with 3C/3D/3E/3F and I agree: **no reopen is justified**.

I accept the correctness purpose of FB-1, FB-2, FB-4, FB-5, FB-6, FB-7 and FB-8, with scope refinements below. I only partially accept FB-3 because its proposed physical/authority placement goes beyond what the failure class proves.

There are also three corrections to the Fable round:

1. guarded mutation is normative; exact SQL/index DDL is not a 3G-01 decision;
2. `transaction_timestamp()`-style transaction-start time is too early to freeze as the expiry guard instant;
3. expiry response of a suspended `AgentRun` has a later **3G behavioral owner** as well as 3H mechanics — it is not purely 3H/3K.

---

## 2. Independent implementation-reality check: PostgreSQL concurrency/time

Current primary PostgreSQL documentation was checked as evidence, not architecture authority.

Relevant behavior:

- PostgreSQL `READ COMMITTED` is the default isolation level;
- a concurrent `UPDATE` waits on an already-updated target row and then re-evaluates its `WHERE` condition against the newer row version;
- `CURRENT_TIMESTAMP` / `transaction_timestamp()` denotes transaction-start time, while statement/clock-time functions have different semantics.

Primary references:

- https://www.postgresql.org/docs/current/transaction-iso.html
- https://www.postgresql.org/docs/current/functions-datetime.html

This supports the **guarded conditional write** shape in FB-2 without requiring SERIALIZABLE, but it also means 3G-01 should freeze the semantic property of the expiry instant rather than casually equate it with transaction-start time.

---

## 3. FB-1 — FIRST_CLAIM ordering / STALE write guard

**Disposition: ACCEPT, refined.**

Fable identified a real defect class: a mismatching-pin comparison must never be allowed to write `STALE` onto a request that was already bound, denied, already stale, or expired before the claim guard.

However the normative rule should be expressed as **semantic outcome/guard precedence**, not as a fragile list of implementation `if` statements.

For a safely interpretable row, `FIRST_CLAIM` must establish at least:

```text
0. sealed payload / commitment remains safely interpretable
   and durable fact combination is internally valid

1. decision semantics
   NONE        → AWAITING_APPROVAL domain condition, no write
   DENY        → DENIED domain condition, no write
   ALLOW_ONCE  → continue

2. already bound
   → fail closed for FIRST_CLAIM; no lifecycle write
   → same-attempt continuation remains RECOVER_BOUND, not FIRST_CLAIM

3. already STALE
   → STALE domain condition, no new write

4. expiry at authoritative guardNow
   guardNow >= expiresAt
   → EXPIRED domain condition, no write

5. exact B2 key-set
   mismatch in key-set shape
   → typed contract failure, no lifecycle write

6. exact B2 value comparison
   byte mismatch
   → MAY write the first/only monotonic STALE fact
     only if the guarded mutation still proves the request claimable

7. all equal
   → MAY bind to candidate attempt
     only inside the already-approved atomic Gateway admission transaction
```

The key invariant is therefore:

> **STALE can be materialized only from a request that is still `ALLOW_ONCE`, unbound, not already stale and unexpired at the authoritative claim guard.**

A contradictory durable combination such as `DENY + STALE`, `BOUND + STALE`, or `DENY + BOUND` is not resolved by a precedence table. It is a durable-interpretation/corruption condition and must fail closed under the existing L4 discipline.

A request that became legitimately STALE before expiry remains STALE after wall time later passes `expiresAt`; expiry does not rewrite or erase a durable terminal fact.

No prior authority reopens.

---

## 4. FB-2 — guarded single-row lifecycle mutations

**Disposition: ACCEPT the invariant; DEFER physical DDL/SQL choices.**

The transaction boundary alone is not sufficient to prove single-claim. The owner-local mutation must itself be concurrency-safe.

3G-01 should freeze:

> **Every mutable ApprovalRequest authority transition is performed as one owner-local conditional/CAS mutation whose success is contingent on the still-current persisted lifecycle facts. Zero affected rows means the expected transition did not occur and the caller must classify/re-read the current condition rather than overwrite it. Correctness must not require an isolation level stronger than the F1 PostgreSQL baseline.**

This applies to at least:

```text
first human decision
first STALE materialization
first binding to effectAttemptId
```

Important refinement to Fable:

```text
complete semantic admission predicate
!= necessarily every check encoded literally in SQL WHERE
```

Commitment verification/canonicalization and other owner-local mechanical checks may be computed by PAR inside the same transaction. What the final mutation must guard mechanically is the persisted fact-space/revision necessary to make a concurrent change impossible to overwrite.

Therefore 3G-01 does **not** freeze:

```text
exact UPDATE statement
exact row-lock syntax
partial unique index
physical column list
ORM/query-builder technique
```

A unique constraint/index on `boundEffectAttemptId` may later be a useful defense if the implementation proof shows it is needed to enforce attempt-side uniqueness, but freezing that DDL here would be schema-design by anticipation. The core single-claim invariant is already enforceable through the guarded owner-row transition + Gateway attempt authority.

No new durable record, FK, dependency, queue or state engine is introduced.

---

## 5. FB-3 — immutable human decision record

**Disposition: PARTIAL ACCEPT; contest the proposed owner-row shape.**

What prior authority actually requires:

```text
PAR owns ApprovalRequest current authority
human decision is write-once ALLOW_ONCE | DENY
3F-03 requires server-derived immutable decision evidence
3C-13 makes material human approval/rejection audit-required
OBS owns historical audit truth, never current ApprovalRequest truth
RECOVER_BOUND requires original ALLOW_ONCE decision fact + exact binding + commitment integrity
```

Therefore `decisionValue` cannot be merely a mutable convenience enum; it is an immutable owner-local domain fact.

But Fable's stronger conclusion does not follow:

```text
approverPrincipalRef
projectorEvidenceRef
decidedAt
```

need not all become **current PAR domain authority fields** merely so RECOVER_BOUND can function. 3F-03 explicitly says projector identity/version/digest is immutable **decision evidence**, and 3C-13 already gives OBS authority over historical audit evidence. RECOVER_BOUND does not reauthorize the human or require re-proving current approver eligibility; it needs proof that the original `ALLOW_ONCE` decision fact for the binding exists.

So 3G-01 should freeze the semantic split, not physical co-location:

```text
PAR current authority
→ immutable write-once decision fact

immutable decision/audit evidence already required by 3F-03 / 3C-13
→ server-derived and retained under its evidence horizon
→ never replaces PAR current decision authority
```

Exact fields, whether some evidence is stored directly on `par.approval_request`, by immutable evidence ref, and the physical audit schema remain implementation-level realization so long as both authority and evidence horizons are provably satisfied.

Reopen trigger: if implementation shows the required evidence horizon cannot be met without owner-local evidence retention, return through Decision Loop/implementation design rather than silently duplicating current authority.

---

## 6. FB-4 — temporal law / authoritative expiry instant

**Disposition: ACCEPT the single-clock law; MODIFY the exact instant.**

3G-01 should freeze:

```text
one authoritative guardNow
→ database-sourced
→ captured exactly once for the lifecycle guard being attempted
→ evaluated inside the same transaction as any resulting lifecycle mutation

expired iff guardNow >= expiresAt

Hub/process/model clock
→ never authoritative for decision/claim guards
```

I do **not** accept freezing `guardNow = transaction start time`.

Reason: PostgreSQL transaction time may predate the actual lifecycle guard by an arbitrary amount if the transaction performed earlier work. A request could therefore be treated as unexpired at the moment of claim only because the transaction began before expiry.

The desired behavioral invariant is instead:

> **`guardNow` represents one database-sourced instant at the lifecycle guard boundary, close to the conditional mutation, and is never recomputed during that transition.**

Exact PostgreSQL realization (`statement_timestamp`, one captured clock value, SQL expression shape, etc.) remains implementation detail and must be tested against this property.

Once a binding transition lawfully passes the expiry guard and commits, later wall-clock expiry is irrelevant to that binding and `RECOVER_BOUND` never rechecks expiry, as already frozen by 3F-03.

The DB-clock-backward-step residual remains a valid operational reopen trigger. It does not currently justify an expiry writer/scheduler or persisted `EXPIRED` fact.

---

## 7. FB-5 — decision-time expiry

**Disposition: ACCEPT option (b), with one YAGNI correction.**

A human decision is accepted as a new domain fact only while the request is currently decisionable under the same authoritative time law:

```text
decision absent
AND no STALE fact
AND unbound
AND guardNow < expiresAt
```

Then:

```text
ALLOW_ONCE or DENY
→ one write-once decision fact
→ audit-required successful mutation
```

If the user submits a decision after expiry or after another terminal/current transition made the request non-decisionable:

```text
no new decision fact is written
→ return/project the applicable current domain/lifecycle condition
```

This avoids the awkward reachable fact `ALLOW_ONCE decided after expiry` and keeps the fact space smaller.

YAGNI correction to Fable: 3G-01 does **not** newly declare every refused late click to be fail-closed audit-required. Successful material human approval/rejection is already audit-required by 3C-13; telemetry/audit treatment of non-mutating rejected attempts follows existing security/observability policy and later 3I/implementation needs.

One remaining question for Fable is whether a late `DENY` should truly be refused exactly like late `ALLOW_ONCE`, or whether there is a material audit/product reason to record it without making it ApprovalRequest authority. My current position is to refuse it as a domain transition and keep any observed user intent outside current authority.

---

## 8. FB-6 — PAR terminality vs retention / GC

**Disposition: ACCEPT the semantic distinction; defer realization details.**

Freeze:

```text
BOUND_TO_ATTEMPT(A)
→ terminal for PAR lifecycle mutation
→ NOT equivalent to disposable
```

After committed binding:

```text
no further 3G-01 PAR authority transition exists
RECOVER_BOUND(A) remains read-equivalent
sealed subject custody may remain operationally required
Gateway attempt/outcome/reconciliation vocabulary remains Gateway-owned
```

Therefore:

```text
PAR-terminal
!= GC-eligible
```

`GC-eligible` depends on the PRESERVE horizon already frozen in 3F-03, including bound-attempt settlement and `OUTCOME_UNKNOWN` reconciliation.

I do not freeze in 3G-01:

```text
exact PAR → Gateway retention projection API
how a crashed caller discovers the already-bound A
GC-vs-RECOVER_BOUND synchronization mechanics
```

The 3D graph already permits PAR to depend downward on Gateway where a narrow public projection is genuinely required, so 3M can realize retention/recovery without reopening dependency architecture. But choosing the exact projection now would be premature.

The recovery/GC race and settlement mechanics remain 3M. Discovery/reconstruction of a Gateway attempt belongs with the later Gateway attempt/recovery behavior, not with ApprovalRequest's owner-local FSM.

---

## 9. FB-7 — atomicity-class mapping

**Disposition: ACCEPT, with a transversal-audit correction.**

Existing authority yields:

```text
successful ALLOW_ONCE / DENY decision
→ PAR current-authority mutation
+ required OBS audit record
→ 3E Class 2 transversal audit-required transaction

terminal STALE materialization
→ PAR lifecycle mutation
+ required OBS audit record
→ 3E Class 2 transversal audit-required transaction

successful binding
→ PAR single-claim mutation
+ Gateway material-effect admission
→ 3E Class 1 domain cross-owner transaction

RECOVER_BOUND
→ read-equivalent
→ no lifecycle write
```

But Class 1 and Class 2 are not mutually exclusive. 3C-13 already requires durable audit for material external-effect admission. Therefore the successful admission transaction may also include the already-required OBS audit write:

```text
Gateway + PAR
+ OBS when the admitted operation is audit-required
```

This is **not** a new three-owner atomicity class. It is the existing Class-1 domain atomicity composed with the existing Class-2 audit-required transversal rule.

Likewise, STALE remains the distinct commit-on-refusal shape already frozen by 3F-03:

```text
PAR + OBS commit
zero gw.* writes
```

No new transaction abstraction is introduced.

---

## 10. FB-8 — derived expiry is silent

**Disposition: ACCEPT, but correct phase ownership.**

At the ApprovalRequest state layer:

```text
wall clock crossing expiresAt
→ no autonomous write
→ no cron required for correctness
→ no lifecycle event emitted merely to make EXPIRED true
```

Any consumer may evaluate the projection when needed, but it does not become a second expiry authority.

The later work splits as:

```text
later 3G AgentRun lifecycle
→ decide the semantic effect of approval expiry on a suspended AgentRun

3H Runtime & Agent Architecture
→ realize wake/suspend/resume/timer/substrate mechanics if needed

3K Frontend/Product
→ presentation, notification, card/status UX

3M
→ crash/recovery/GC interactions when applicable
```

This prevents a scheduler from becoming hidden ApprovalRequest authority while also avoiding the opposite mistake of treating `AgentRun` response to expiry as merely a runtime implementation detail.

---

## 11. Refined reachable fact space

With the accepted guards, the owner-local durable fact combinations should be constrained to the following semantic set:

```text
D = NONE       S = false   B = null
D = DENY       S = false   B = null
D = ALLOW_ONCE S = false   B = null
D = ALLOW_ONCE S = true    B = null
D = ALLOW_ONCE S = false   B = A
```

Time then produces the projection:

```text
D=NONE, unexpired
→ AWAITING_APPROVAL

D=NONE, expired
→ EXPIRED

D=DENY
→ DENIED regardless of later clock passage

D=ALLOW_ONCE, no S/B, unexpired
→ APPROVED_UNCLAIMED

D=ALLOW_ONCE, no S/B, expired
→ EXPIRED

D=ALLOW_ONCE, S
→ STALE regardless of later clock passage

D=ALLOW_ONCE, B=A
→ BOUND_TO_ATTEMPT(A) regardless of later clock/pin drift
```

Any other **durable** combination is corruption / durable interpretation failure, not a legitimate state that needs another precedence rule.

These names remain an owner-local semantic projection. 3G-01 does **not** make them stable public error codes or a universal wire enum. If a public/independent boundary needs one of these meanings, 3F-02's admission/mapping law still applies.

This is more precise than saying the labels must be completely absent from every public payload: `AWAITING_APPROVAL`, for example, already has approved domain semantics. What is prohibited is accidental promotion of this owner-local projection into a universal/stable wire vocabulary without explicit boundary admission.

---

## 12. Current candidate laws for 3G-01

If the next adversarial round does not falsify them, I would carry these as the minimal decision core:

1. **No persisted universal status.** ApprovalRequest lifecycle derives from a small owner-local set of durable facts.
2. **Decision is write-once.** `ALLOW_ONCE | DENY` is immutable current authority once successfully recorded.
3. **Expiry is derived.** No expiry writer/scheduler is required for correctness.
4. **STALE is durable and monotonic.** It is written only from a still-claimable request after exact B2 value mismatch.
5. **Binding is permanent after commit.** Rollback does not consume; committed `R ↔ A` never transfers.
6. **Recovery is not reauthorization.** Same bound attempt only; no expiry/current-pin recheck.
7. **Impossible fact combinations fail closed.** Do not mask corruption with precedence.
8. **Lifecycle writes are conditional/CAS guarded.** Concurrency correctness does not rely on optimistic read-then-unconditional-write behavior.
9. **One DB-sourced guardNow.** `guardNow >= expiresAt` is expired; process clocks are non-authoritative.
10. **BOUND is PAR-terminal but custody can remain load-bearing.** GC follows the 3F-03 PRESERVE horizon and later 3M machinery.
11. **Atomicity uses existing 3E classes only.** Decision/STALE use audit-required transversal behavior; binding composes existing Gateway+PAR admission with required audit where applicable.
12. **Expiry is silent inside ApprovalRequest authority.** Later AgentRun behavior, runtime wake mechanics and UX remain separate owners.
13. **Projection vocabulary is owner-local.** It does not become public/wire authority automatically.

No generic FSM engine, event sourcing, scheduler, new durable record, new Tier-2 FK, transaction framework or public status taxonomy is justified.

---

## 13. Fable Round 2 — adversarial questions

Please challenge the refined model rather than merely confirm the dispositions.

### A. Decision semantics

1. Is refusing a **late DENY** as a domain transition actually the global maximum, or is there a concrete failure/audit/product class that requires recording DENY after expiry without resurrecting authority?
2. Should a repeated identical human decision (`ALLOW_ONCE` after `ALLOW_ONCE`, or `DENY` after `DENY`) be treated as idempotent read-back or CAS/conflict? Which behavior minimizes ambiguity under double-click/retry without weakening write-once semantics?
3. Does `ApprovalRequest` domain correctness require an owner-local `decidedAt`, or is time/approver/projector identity purely retained audit/evidence under existing 3C-13/3F-03 obligations? Attack my partial rejection of FB-3.

### B. Temporal/concurrency correctness

4. Is `database-sourced guardNow captured once at the lifecycle guard boundary` precise enough? Identify the strongest counterexample involving long transactions, statement time, wall-clock steps or concurrent claim/decision.
5. Is the five-row durable fact space actually exhaustive? In particular, must request creation enforce `expiresAt > creationGuardNow`, or can an already-expired request be created safely/meaningfully?
6. Can any valid interleaving under READ COMMITTED still produce two successful admissions if PAR uses a guarded owner-row mutation but Gateway has other writes in the same transaction? Show the exact schedule if yes.

### C. Authority/atomicity boundaries

7. Does composing `GW + PAR` Class-1 admission with existing Class-2 OBS audit create any hidden three-owner atomicity or dependency problem under 3E-01, or is it exactly the already-approved transversal rule?
8. Is any specific retention projection / attempt lookup required now to make 3F-03's PRESERVE horizon implementable, or is deferring the exact PAR↔Gateway recovery/GC realization to 3M safe?

### D. Public vocabulary / YAGNI

9. Is my correction on lifecycle labels right: owner-local projection labels are not automatically stable public/wire codes, but explicit per-boundary projection may later reuse equivalent meanings under 3F-02? If not, identify the authority conflict.
10. Is there any concrete F1 failure class that actually requires a persisted `status` after these guards, rather than an index/view/projector over facts?

### E. Strongest falsification

11. Construct the strongest reachable counterexample that still breaks exactly-once claim/binding or causes approval resurrection under this refined model.
12. Identify any rule above that is implementation detail masquerading as architecture and can be deleted without losing a proven invariant.
13. Identify any hidden decision this 3G-01 would still leave to implementation.

For each material disagreement use:

```text
claim challenged
counterexample / failure class
authority affected
smallest correction
reopen required? yes/no
later owner if deferred
```

If no material contradiction remains, state whether the candidate is ready for operator decision **without** turning agreement into authority.

---

# Round 2 — Fable

## 0. Position and provenance

Authority re-verified from `AGENTS.md` read order at HEAD `f4b15ec`; no authority document changed between Round 1 and this round — only this R2 file is new. This round makes **no current-Mastra claim**. The PostgreSQL references cited in Round 2 §2 are consistent with my own analysis; I introduce no additional external claims.

Verdict up front:

```text
Round 2 corrections 1..3                     → ACCEPTED, two with sharpenings (R2F-3, R2F-4)
FB-3 partial rejection                       → CONCEDED on placement, completed by R2F-6
Round 2 §3 step list                          → DEFECT FOUND (R2F-1)
Round 2 §4 "classify/re-read" rule            → INCOMPLETE for admission path (R2F-2)
five-row fact space                           → exhaustive only with creation guard (R2F-5)
Material Finding against prior authority      → NONE; no reopen
my Round 1 overreaches                        → two conceded explicitly (§3)
```

I attempted to break exactly-once claim/binding and approval resurrection against the refined model (E11); every construction I found reduces to one of R2F-1..R2F-3, all of which have smallest corrections below. After incorporating them I consider the candidate **ready for operator decision**.

---

## 1. Material findings on Round 2

### R2F-1 — the §3 step list misclassifies an expired undecided request, and the fix is structural

**Claim challenged:** Round 2 §3 step 1: `decision = NONE → AWAITING_APPROVAL domain condition`.

**Counterexample.** Request created, never decided, `expiresAt` passes. Gateway (through whatever later flow invokes the capability) issues `FIRST_CLAIM`. Step 1 fires before step 4, so the returned condition is `AWAITING_APPROVAL` — but the canonical projection in Round 2's own §11 says `D=NONE, expired → EXPIRED`. The capability now contradicts the projection for the same facts at the same instant. No write occurs either way, so no durable harm — but 3G-01 exists precisely to make these classifications deterministic and single-sourced, and an ordered outcome list that can disagree with the projection is a second classification authority in embryo.

**Root cause.** The step list conflates two different things: **guard order for writes** (which genuinely needs ordering — only steps 6 and 7 may write) and **outcome classification for refusals** (which needs no ordering at all, because the projection function already classifies every fact combination totally and deterministically).

**Smallest correction.** Replace the per-step outcome table with one rule:

> Every no-write refusal of `FIRST_CLAIM` (and of the decision surface) returns the canonical projection of the request's durable facts evaluated at that invocation's `guardNow`. The ordered guard sequence exists only to decide **which durable write, if any, is permitted**: the terminal STALE write (only from a still-claimable request — exact B2 key-set plus byte mismatch) or the binding write (only from a still-claimable request with byte equality). Key-set shape violation remains the one typed contract failure outside the projection, per 3F-03 §11.

This collapses the classification surface to the single canonical definition Round 1 already required for challenge 12, removes the AWAITING/EXPIRED contradiction by construction, and makes the check order unfalsifiable by reordering refusal checks — only the two write predicates carry order sensitivity, and both already restate full claimability.

**Reopen:** none. **Owner:** 3G-01.

### R2F-2 — zero affected rows inside admission must abort the entire transaction, not "classify"

**Claim challenged:** Round 2 §4: "Zero affected rows means the expected transition did not occur and the caller must classify/re-read the current condition rather than overwrite it."

That rule is correct for the decision surface but **insufficient for the admission path**, and this is the strongest schedule I found for question 6:

```text
T1: FIRST_CLAIM(R, A1) → guarded bind succeeds → gw writes → COMMIT
T2: concurrently in its own admission transaction:
    Gateway writes budget reservation / idempotency rows FIRST
    then invokes PAR guarded bind → blocks on row lock → T1 commits
    → WHERE re-evaluates → zero rows
    T2 "classifies the current condition"… and continues to COMMIT
    → gw.effect_attempt admitted durably WITH NO approval consumed
```

No isolation anomaly is involved: every statement behaved exactly as documented. The defect is that "classify and continue" is a legal reading of the R2 rule, and it produces an admitted effect attempt bound to no approval — an effect-without-authorization class strictly worse than double-claim.

**Smallest correction.** Add one sentence to the FB-2 law:

> Inside the atomic admission transaction, a zero-row result from the binding mutation (or from any other admission-required guarded write) **MUST abort the whole transaction**. "Classify and re-read" applies only to surfaces whose transaction contains no other admission writes, such as the human decision surface.

This also answers question 6 affirmatively-safe: with guarded mutation **plus** the abort law, I could not construct any READ COMMITTED interleaving with two successful admissions, regardless of the order of PAR and Gateway writes inside the transaction. Without the abort law the model is falsifiable by the schedule above even with perfectly guarded writes.

**Reopen:** none. **Owner:** 3G-01. Note for the later Gateway-FSM decision: budget/idempotency writes need the same guarded-mutation + abort discipline on their own facts; 3G-01 should say its law covers the PAR row and *names* the Gateway analogue as owed by the later decision, so implementers do not infer that only PAR needs guards.

### R2F-3 — `guardNow` must be bound into the mechanical predicate as a captured value, not recomputed

**Claim challenged:** Round 2 §6 freezes "one database-sourced instant at the lifecycle guard boundary … never recomputed during that transition" but leaves open *where* the comparison happens.

**Counterexample (straddle).** The claim guard evaluates expiry procedurally at `t1 < expiresAt` (passes), then the STALE write predicate — which per FB-1 includes "not expired" — recomputes `now()` inside the `WHERE` clause at `t2 >= expiresAt`. Zero rows; no STALE written; the mismatch outcome degrades to EXPIRED. Under a healthy forward clock this is merely untidy (the request is dead either way). Compose it with the already-named DB clock-regression residual and it becomes resurrection: mismatch observed → STALE never durably materialized because the straddle suppressed it → clock steps back before `expiresAt` → pins revert → claim succeeds. That is FC-1 through a gap that exists **only** because two clock reads served one guard invocation.

**Smallest correction.** Strengthen the temporal law by one clause:

> `guardNow` is captured **once per guard invocation** and that captured value is used by **every** temporal comparison in the invocation, including inside the mechanical mutation predicate (passed as a bound value, never re-read from the clock). Distinct invocations (decision, claim) each capture their own `guardNow`; no cross-invocation reuse.

With this, the STALE write and the expiry evaluation cannot straddle `expiresAt`, the residual shrinks back to the pure clock-regression case already named in FB-4, and the answer to question 4 is: yes, the property is precise enough **once the captured value is bound into the predicate**; "close to the mutation" alone is not, for exactly this reason.

**Reopen:** none. **Owner:** 3G-01; realization (statement_timestamp vs captured parameter plumbing) stays implementation, property-tested.

### R2F-4 — the mechanical guard minimum is exactly the mutable-fact subset

Round 2 §4's refinement ("complete semantic predicate ≠ everything literally in SQL WHERE") is correct but vague — "the persisted fact-space/revision necessary" invites judgment calls. The precise law costs one sentence:

> The mechanical mutation predicate MUST restate every **concurrently mutable** lifecycle fact it depends on — `decision`, `STALE`, `bound` — plus the captured `guardNow` comparison where expiry participates (R2F-3). Facts that are immutable after creation (`expiresAt` value, sealed payload, commitment, pins) MAY be verified procedurally inside the same transaction, because no interleaving can change them between the procedural check and the write.

This is the exact line between "check in code" and "check in the guard", derivable from what concurrency can and cannot touch — no more freezing than necessary, no less. It subsumes ChatGPT's refinement and removes its ambiguity.

**Owner:** 3G-01.

### R2F-5 — creation must reject `expiresAt <= creationGuardNow` (answers question 5)

The five-row fact space is exhaustive **given the guards**, but question 5 exposes a real unstated decision: nothing yet prevents creating a request already expired at birth. Born-dead requests are safe (never decisionable, never claimable) but harmful in three cheap-to-avoid ways: they present a card the human cannot act on; they leave a suspended AgentRun waiting on a request that was never actionable; they occupy sealed-payload custody under the PRESERVE horizon for nothing. A zero-or-negative validity window is always an upstream policy/config defect, and fail-fast at sealing is the smallest correction:

> ApprovalRequest creation MUST verify `expiresAt > creationGuardNow` under the same temporal law and fail with a typed contract failure, creating no durable request, when violated.

This buys an invariant worth having: **every reachable request had a non-empty decisionable window**, so `AWAITING_APPROVAL` is reachable for every request that ever existed — which simplifies every trace in the proof obligation. Minimum window *size* is policy and stays free. Creation content remains 3F-03; this is a lifecycle-boundary guard and belongs to 3G-01.

**Owner:** 3G-01.

### R2F-6 — decision evidence retention must be coupled to the request's PRESERVE horizon

This completes FB-3 after conceding placement (§3 below). The semantic split in Round 2 §5 is right, but as stated it leaves a gap: 3F-03 §18 pins **sealed-subject custody** to the operational horizon, while decision *evidence* (approver, instant, projector identity) is retained "under its evidence horizon" — undefined. If an implementation applies a generic telemetry retention to the audit records carrying decision evidence, the platform could still prove *what* was authorized (PAR facts + sealed subject) but no longer *who authorized it and what they saw*, while the bound attempt is still `OUTCOME_UNKNOWN` — precisely when a dispute is most likely. C-013's "domain ledgers outside GC" almost certainly covers this, but "almost certainly" is a hidden decision.

**Smallest correction:** one obligation, placement-free:

> Decision evidence required by 3F-03 §8 MUST be retained at least as long as the ApprovalRequest's own 3F-03 §18 PRESERVE horizon. Whether that is satisfied by the audit-record retention class, by an owner-local evidence ref, or both, is implementation realization.

**Reopen:** none — this instantiates existing 3F-03/C-013 obligations, creates no new store. **Owner:** 3G-01 states the coupling; realization implementation/3M.

---

## 2. Answers to the adversarial questions

**A1 — late DENY.** Refusal is the global maximum. I attacked the alternative honestly: the only candidate consumer for a durable late-DENY is audit narrative ("the human did object, after expiry"), and that consumer is speculative — no F1 surface, report, or authority rule reads it. Recording it would add the only fact row whose meaning is "this had no effect", reintroduce the asymmetry FB-5(b) was chosen to avoid, and force the projection to explain a DENY that never governed anything. The human's intent is not lost in any harmful sense: nothing runs either way, and the response projects the true condition (EXPIRED). If a real audit consumer ever materializes, recording refused intents is an OBS-side addition needing no lifecycle change — the seam is free. Refuse both verbs symmetrically.

**A2 — decision retry/double-click.** Same-value resubmission → **idempotent read-back**; different-value → typed conflict projecting the current condition; never a second write in either case. Rationale: the decision surface must be safely retryable by platform-controlled clients (double-click, network retry are the *normal* case, not the exception), and a CAS error on a retry whose intent already holds is a false alarm that teaches users to distrust the surface. Read-back is honest because the response carries the recorded decision fact — including, via evidence, that an earlier submission won. Write-once is not weakened: the guard still admits exactly one durable transition, and "identical value" is decidable owner-locally with zero idempotency-key machinery (the operation is naturally idempotent on value). Note the composition case: second identical `ALLOW_ONCE` arriving after the request has moved on (bound, stale) still reads back the decision fact plus the *current* projection — never a fabricated "just approved". `CAS_CONFLICT`-class outcomes remain for value conflicts and for 3F-03 §7 `expectedRevision` where a surface supplies it; with the facts model, decision-absence **is** the CAS expectation, and §7's "quando aplicável" is satisfied without a revision counter — this reading should be stated in 3G-01 so it is not re-litigated at implementation.

**A3 — owner-local `decidedAt`.** I attacked my own FB-3 as requested and ChatGPT's partial rejection **stands**: no PAR behavior — projection, guards, RECOVER_BOUND, retention — reads `decidedAt`, `approverPrincipalRef` or `projectorEvidenceRef`. RECOVER_BOUND proves the decision *fact* exists, not who made it; re-proving approver eligibility at recovery would be reauthorization, which 3F-03 §15 forbids. So these are evidence, not current authority, and their physical placement is free. What does not stand is leaving their retention undefined — R2F-6 closes that. FB-3 as originally written overreached from "evidence must survive" to "evidence must be owner-row authority fields"; the first is real, the second was placement smuggled into architecture.

**B4 — guardNow precision.** Not precise enough as written; R2F-3 is the strongest counterexample and the completing clause. Long transactions are already lawful (guard-time semantics, no commit re-evaluation, bounded by the no-external-I/O rule); wall-clock steps remain the named FB-4 residual; concurrent claim/decision interleavings are serialized by the row guards and each invocation's own captured `guardNow` — after R2F-3 I found no further temporal construction.

**B5 — exhaustiveness / born-expired creation.** The five rows are exhaustive for durable combinations, with two completions: R2F-5 makes creation reject the born-dead case, and the enumeration should state explicitly that it covers **durable facts only** — the L4/corruption condition (unverifiable commitment, contradictory rows) is not a sixth row but a fail-closed interpretation failure, per Round 2 §3 step 0.

**B6 — READ COMMITTED double admission.** Yes — constructible, and *not* via isolation: the schedule in R2F-2 with "classify and continue". Closed by the whole-transaction-abort law. After R2F-2 I could not produce two successful admissions in any interleaving, with Gateway writes before or after the PAR guard.

**C7 — GW + PAR + OBS composition.** No hidden three-owner problem. One PostgreSQL database, schema-per-owner writes, each owner writing only its own rows, OBS below everything in the 3D topological order, TxScope opaque — composing Class-1 admission with the Class-2 transversal audit obligation is exactly the already-approved shapes overlapping in one transaction. One coherence note worth stating in 3G-01: this does **not** contradict C-013's "telemetry failure never alters execution", because the audit-required record is not telemetry — it is the fail-closed audit class; the same distinction C-013 itself draws. STALE's `PAR + OBS, zero gw.*` commit shape stands as frozen in 3F-03 §12.

**C8 — retention/GC deferral.** Safe, and trivially so: C-013 already places domain ledgers outside GC day 1, so "no approval-request GC in F1" is not only an admissible realization — it is the default one. The PRESERVE-horizon predicate is fully specified by 3F-03 over facts that all exist durably (`par` facts + Gateway attempt state), and the 3D matrix already permits the downward PAR → Gateway read when 3M builds real GC. Nothing needs freezing now; freezing a projection API today would be schema-by-anticipation.

**D9 — public vocabulary.** ChatGPT's correction is right and I sharpen it one notch: the projection labels are owner-local; explicit per-boundary admission under 3F-02 may later carry equivalent *meanings*; and when they cross, they cross as **domain/lifecycle payload semantics, never as T1 failure codes** — `AWAITING_APPROVAL != T1` is already frozen, and DENY/EXPIRE/STALE are lifecycle outcomes under 3F-03 §17/§20. So the 3F-05 nine-code baseline is untouched by 3G-01: zero new public codes, and no label literal becomes wire authority without its own admission. No authority conflict found.

**D10 — persisted status.** No concrete F1 failure class survives the guards. Every candidate I tested — operational listing, "pending approvals" product surface, cross-module reads — is a query/index/view/projection problem over facts, and non-authoritative materializations remain free realization. The prohibition should be scoped precisely: what is prohibited is a second **authoritative mutable** status, not any derived materialization.

**E11 — strongest falsification.** Constructions attempted and their outcomes: (i) forged/different-attempt `RECOVER_BOUND` → fails on stored binding equality; (ii) repeated `RECOVER_BOUND` → read-equivalent, re-execution prevented by Gateway attempt/idempotency authority — correctly not PAR's job; (iii) crash before STALE commit → deterministic re-detection (3F-03 §12); (iv) "classify and continue" orphan admission → R2F-2, closed; (v) expiry/STALE straddle + clock regression resurrection → R2F-3, closed; residual = pure DB clock regression, already named with its reopen trigger; (vi) two ApprovalRequests over semantically identical subjects, both approved → two lawful admissions; **not** a defect: two human decisions occurred, the commitment digest is deliberately not a dedup identity (3F-03 §5), and duplicate-intent presentation is a product concern. After R2F-1..R2F-3 I have no remaining reachable counterexample against exactly-once binding or monotonic non-resurrection.

**E12 — implementation masquerading as architecture.** Three items identified: (i) my Round 1 partial-unique-index — conceded, ChatGPT already correctly demoted it (§3 below); (ii) the **projection label literals** — the fact semantics and reachable combinations are architecture; the six spellings are owner-local naming and 3G-01 should say so, or the enum spelling will be treated as frozen contract; (iii) the exact PostgreSQL time-function choice — already correctly demoted by Round 2 §6. Everything else in the candidate laws survives the deletion test: each removal loses a proven invariant (lost-update safety, temporal determinism, monotonicity, single-claim, custody).

**E13 — hidden decisions still left.** After this round, closed here: same-value decision idempotency (A2); refusal-outcome classification source (R2F-1); zero-rows abort scope (R2F-2); guardNow binding (R2F-3); mechanical-guard minimum (R2F-4); creation expiry guard (R2F-5); evidence-retention coupling (R2F-6); `expectedRevision` reading (A2). Remaining and **correctly** routed, none hidden: approver eligibility (3I); post-admission cancellation (later 3G/3I); Gateway attempt FSM including how a crashed caller rediscovers bound A and budget/idempotency guard discipline (later 3G, named by R2F-2); wake/notify mechanics on expiry (later 3G AgentRun + 3H + 3K per corrected FB-8); GC/recovery machinery (3M); STALE-fact exact field list and typed internal result literals (implementation under the stated semantic requirements). I found no other decision the candidate silently delegates.

---

## 3. Concessions from Round 1

Two of my Round 1 positions were overreach and ChatGPT's corrections are accepted without residue:

1. **Partial unique index on `boundEffectAttemptId`** — defense-in-depth DDL, not architecture. The single-claim invariant is enforced by the guarded owner-row transition plus Gateway attempt-side uniqueness; the index is an implementation option the proof may or may not motivate.
2. **Audit obligation for refused late decisions** — FB-5 as I wrote it implied a new fail-closed audit requirement for non-mutating refusals. Wrong: 3C-13 makes *successful* material approval/rejection audit-required; refused attempts follow existing observability/security policy. No new obligation.

Also accepted: correction 2 (transaction-start time too early — R2F-3 completes it), correction 3 (suspended-AgentRun expiry response has a later-3G behavioral owner, not just 3H/3K), and the FB-7 refinement (Class-1 composed with Class-2, no new class).

---

## 4. Delta to the candidate laws

Round 2 §12 laws 1–13 stand. Add:

```text
14. Refusal outcomes are the projection. Every no-write refusal of decision or
    FIRST_CLAIM returns the canonical projection at that invocation's guardNow;
    guard order governs only which write may occur.                       (R2F-1)
15. Zero rows aborts admission. Inside the atomic admission transaction, a
    zero-row guarded write aborts the entire transaction. Classify-and-reread
    is lawful only where the transaction holds no other admission writes.  (R2F-2)
16. guardNow is bound, not re-read. One captured DB-sourced instant per guard
    invocation, used by every temporal comparison including inside the
    mechanical mutation predicate.                                         (R2F-3)
17. Mechanical guard = mutable facts. The mutation predicate restates decision,
    STALE, bound (+ captured guardNow where expiry applies); immutable facts
    may be verified procedurally in the same transaction.                  (R2F-4)
18. No born-expired requests. Creation fails typed when
    expiresAt <= creationGuardNow; every reachable request had a non-empty
    decisionable window.                                                   (R2F-5)
19. Same-value decision resubmission is idempotent read-back; different-value
    is a typed conflict; neither writes. Decision-absence is the CAS
    expectation realizing 3F-03 §7.                                        (A2)
20. Decision evidence outlives its request's operational life. Evidence per
    3F-03 §8 is retained at least through the request's §18 PRESERVE horizon;
    placement is realization.                                              (R2F-6)
21. Projection label literals are owner-local naming, not frozen contract;
    the fact semantics and reachable combinations are what 3G-01 freezes.  (E12)
```

Proof-strategy additions:

```text
16. FIRST_CLAIM on expired undecided request → outcome equals projection
    (EXPIRED, not AWAITING); asserts no write                              (R2F-1)
17. adversarial admission harness: guarded bind returns zero rows after
    Gateway writes → whole transaction aborts; control shown to fire       (R2F-2)
18. straddle probe: guard passes expiry at captured guardNow, mutation
    predicate uses the bound value → STALE still materializes              (R2F-3)
19. creation with expiresAt <= creationGuardNow → typed failure, no row    (R2F-5)
20. double-submit ALLOW_ONCE → one durable fact, second reads back
    recorded decision + current projection; ALLOW then DENY → conflict     (A2)
```

---

## 5. Disposition

```text
Material Finding against prior authority     NONE — no reopen of 3C/3D/3E/3F
Round 2 refined model                         SURVIVES falsification after R2F-1..R2F-6
new machinery introduced by this round        0 (no record, FK, code, scheduler,
                                              dependency, probe)
candidate 3G-01                               READY FOR OPERATOR DECISION
                                              = laws 1–13 + 14–21 + proof traces 1–20
```

Agreement between reviewers is not authority. The operator remains the decision boundary; open choices genuinely requiring operator preference are none — every remaining fork in this dialogue now has a stated recommendation with its alternative recorded (late-DENY refusal symmetry, idempotent same-value read-back), and either alternative preserves the invariants if the operator prefers otherwise.
