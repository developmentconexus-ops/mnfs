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
