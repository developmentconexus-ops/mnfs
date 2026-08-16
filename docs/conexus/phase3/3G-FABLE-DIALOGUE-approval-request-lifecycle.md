# 3G — ChatGPT ↔ Fable Dialogue — ApprovalRequest Lifecycle & Claim-Binding State Architecture

**Status:** WORKING DIALOGUE / NON-AUTHORITATIVE  
**Phase:** 3G — Behavioral / State Architecture  
**Candidate decision:** `3G-01 — ApprovalRequest Lifecycle & Claim-Binding State Architecture`  
**PR:** #40  
**Branch:** `agent/conexus-phase-3-system-design`  
**Important:** this file is a review/co-design channel only. It is not authority, does not approve or create 3G-01, does not constitute C-018, and does not authorize product implementation, merge or PR readiness.

---

## 0. Dialogue protocol

1. Before treating this dialogue as input, reconstruct authority from `AGENTS.md` and follow its read order completely.
2. Apply **DevelopmentConexus Engineering Method v1.0.0** from `docs/engineering/standards/root-cause-global-maximum-method.md`.
3. For this decision, read at minimum:
   - `docs/conexus/phase3/LEDGER.md`;
   - `docs/conexus/phase3/3C-10-production-agent-runtime-module-boundary.md`;
   - `docs/conexus/phase3/3D-02-capability-gateway-dependency-architecture.md`;
   - `docs/conexus/phase3/3D-R1-dependency-architecture-final-closure.md`;
   - `docs/conexus/phase3/3E-02-module-durable-record-inventory-reference-closure.md`;
   - `docs/conexus/phase3/3E-R1-data-architecture-final-closure.md`;
   - `docs/conexus/phase3/3F-02-boundary-payload-semantics-error-envelope-architecture.md`;
   - `docs/conexus/phase3/3F-03-approval-claim-approval-request-contract.md`;
   - `docs/conexus/phase3/3F-R1-contracts-api-architecture-final-closure.md`;
   - C-010 and C-013 through their canonical detailed sources when needed for already-ratified ApprovalRequest/effect semantics.
4. Previous approved architecture is the current baseline, not dogma. Reopen it only for a **material Finding** with a concrete failure class and a globally superior correction. Do not reopen for naming, symmetry, taste or generic convention.
5. Fable acts as an **independent Senior/Staff/Principal Software Engineer and Software Architect**, not a rubber stamp. Reason down to implementation reality: durable facts, transaction boundaries, races, crash points, TOCTOU, concurrency, temporal correctness and enforceability.
6. Each actor appends a numbered round and does not silently rewrite the other actor's reasoning. Corrections and reversals must be explicit.
7. ChatGPT ↔ Fable agreement is not operator approval. The operator remains the authority boundary.
8. Preserve YAGNI. No generic FSM engine, `UniversalStatus`, workflow engine, event sourcing, state registry, ApprovalService or new durable record without a current consumer/failure class.
9. If a claim depends on **current Mastra behavior**, verify it with Context7 `/mastra-ai/mastra` and the Mastra skill available in the actor's environment. If unavailable, record the limitation and use current primary sources rather than model memory. Round 1 below makes no current-Mastra claim.
10. Do not modify `LEDGER.md` or approved authority while this dialogue is unresolved. Do not implement product code.

Goal:

> Find the smallest sustainable behavioral/state model in which one ApprovalRequest can wait for a human decision, become unusable when required, bind at most once to exactly one committed Gateway effect attempt, survive rollback correctly, and support same-attempt recovery without turning recovery into reauthorization.

---

# Round 1 — ChatGPT

## 1. Authority already fixed before 3G-01

3F-03 already freezes the contract-level facts that 3G must realize rather than reinterpret:

```text
one ApprovalRequest
= one human decision
= one exact sealed immutable effect subject

human decision
= ALLOW_ONCE | DENY

FIRST_CLAIM
→ only before first committed admission
→ checks expiry + exact governing validity pins
→ pin mismatch terminalizes request as monotonic STALE

valid claim + Gateway admission
→ one atomic transaction
→ successful COMMIT permanently binds request to exact effectAttemptId

rollback before COMMIT
→ does not consume approval

RECOVER_BOUND
→ only same already-bound attempt
→ no expiry recheck
→ no current validity-pin recheck
→ recovery is reconstruction of already-admitted authority, not new authorization

same request + different attempt
→ fail closed
```

3F-02 / 3F-R1 also freeze a separation that 3G must preserve:

```text
ApprovalRequest lifecycle/domain outcome
!= T1 public failure
!= Gateway effect_attempt/admission state
!= physical effect receipt/outcome
```

Therefore this decision must not create one cross-domain `UniversalStatus` or merge ApprovalRequest and `gw.effect_attempt` into one FSM.

3E already provides the durable owner record:

```text
par.approval_request
```

No new durable record is assumed or proposed by this Round 1.

---

## 2. Root problem / failure classes

A behavioral model is necessary because contract semantics alone still leave implementation choices that can create correctness defects.

### FC-1 — approval resurrection

```text
approved under governing pins P17
→ FIRST_CLAIM observes P18
→ request becomes stale
→ system later returns to P17
→ approval becomes usable again
```

This is forbidden by 3F-03 monotonic STALE.

### FC-2 — rollback accidentally consumes approval

```text
PAR tentatively binds request to candidate attempt A
→ a later Gateway admission check fails
→ transaction rolls back
→ request remains consumed/bound anyway
```

Forbidden. Only the first admission that **commits** consumes/binds the approval.

### FC-3 — approval transfer / second attempt

```text
request bound to A
→ A fails/cancels/aborts later
→ request becomes approved again
→ B claims it
```

Forbidden. A committed binding is permanent for that ApprovalRequest.

### FC-4 — recovery becomes reauthorization

```text
request bound to A
→ expiry/policy/composition changes later
→ recovery re-runs FIRST_CLAIM rules
→ already-admitted effect becomes unrecoverable or receives a second authority decision
```

Forbidden. `RECOVER_BOUND(A)` reconstructs the already-admitted exact subject.

### FC-5 — duplicated persisted truth drifts

```text
expiresAt says request is expired
status column still says APPROVED
```

or equivalent duplicated lifecycle facts disagree.

The design should persist only facts whose loss would destroy required semantics; derivable projections should remain derivable unless a concrete failure class requires materialization.

---

## 3. Alternatives

### Alternative A — durable facts + derived lifecycle projection — RECOMMENDED HYPOTHESIS

Persist only load-bearing facts already required by approved semantics, conceptually:

```text
humanDecision
  NONE | ALLOW_ONCE | DENY

expiresAt
  immutable timestamp/fact

monotonicInvalidation
  absent | STALE with sufficient owner-local evidence/reason identity

boundEffectAttemptId
  absent | exact committed attempt identity
```

Exact columns/names are not frozen here.

Derive a behavioral projection such as:

```text
AWAITING_APPROVAL
APPROVED_UNCLAIMED
DENIED
EXPIRED
STALE
BOUND_TO_ATTEMPT
```

This is not proposed as a universal enum or a required physical status column.

### Alternative B — one persisted mutable `status` FSM

Conceptually:

```text
AWAITING_APPROVAL
→ APPROVED
→ CLAIMED

or → DENIED / EXPIRED / STALE
```

Advantage: familiar and easy to query.

Risk: duplicates facts already independently load-bearing (`expiresAt`, decision, exact attempt binding), creates precedence/drift questions, and can tempt transaction-internal mechanics such as `CLAIMING`/`ADMITTING` to become durable domain states without need.

### Alternative C — event-sourced ApprovalRequest lifecycle

Persist events and rebuild state by replay.

Rejected as current hypothesis: no present failure class requires an event-sourcing authority model; `par.approval_request` already owns current lifecycle authority and OBS already owns audit/history. This would add machinery and a second interpretation surface without evidence.

---

## 4. Candidate lifecycle projection

Current preferred hypothesis:

```text
AWAITING_APPROVAL
  iff decision = NONE
  && unbound
  && no monotonic STALE fact
  && now < expiresAt

APPROVED_UNCLAIMED
  iff decision = ALLOW_ONCE
  && unbound
  && no monotonic STALE fact
  && now < expiresAt

DENIED
  iff decision = DENY

EXPIRED
  iff unbound
  && no monotonic STALE fact
  && now >= expiresAt
  && no higher-precedence terminal fact applies

STALE
  iff monotonic STALE fact exists

BOUND_TO_ATTEMPT(A)
  iff boundEffectAttemptId = A
```

The precedence relation is **not yet approved**. In particular, Fable should challenge whether `DENIED`, `EXPIRED`, `STALE` and `BOUND_TO_ATTEMPT` have the correct dominance rules and whether the human-decision path needs an expiry check at decision time or only at `FIRST_CLAIM` as 3F-03 currently specifies.

Key hypothesis:

> `EXPIRED` should normally be derived from immutable `expiresAt`; `STALE` must be durably materialized because recomputing it from current governing pins would permit resurrection.

---

## 5. Transaction boundary hypothesis

No durable intermediate state is needed merely because the atomic admission transaction is executing.

```text
APPROVED_UNCLAIMED

BEGIN
  PAR FIRST_CLAIM
    → conditionally binds request → candidate A inside TxScope

  Gateway last-mile admission
  Gateway budget/idempotency state
  Gateway effect_attempt = NOT_SENT

COMMIT
```

If COMMIT succeeds:

```text
ApprovalRequest projection
→ BOUND_TO_ATTEMPT(A)
```

If anything rolls back:

```text
boundEffectAttemptId was not durably changed
→ effective state remains APPROVED_UNCLAIMED
  unless a separately committed terminal fact such as STALE exists
```

Therefore current hypothesis rejects durable states created solely for transaction mechanics:

```text
CLAIMING
ADMITTING
RESERVING
ROLLING_BACK
```

They may exist as transient implementation control flow, not domain authority.

---

## 6. Time and monotonicity hypothesis

### Expiry

Because `expiresAt` is immutable, expiration can be evaluated from authoritative time without a scheduler that writes every expired request.

Current hypothesis:

```text
no expiry cron required for correctness
no durable EXPIRED write required merely because wall clock crossed expiresAt
```

A projection/index/cache may materialize expiry later for operational reasons, but must not become competing authority.

### STALE

STALE is different:

```text
stored governing pin = P17
observed exact current pin = P18
→ terminal STALE fact commits
```

Later:

```text
current pin returns to P17
```

must **not** make the request usable again.

Therefore STALE requires a monotonic durable fact in the PAR-owned ApprovalRequest lifecycle.

---

## 7. Explicitly deferred from this first behavioral decision

Do not absorb these into 3G-01 unless falsification proves they are prerequisites:

```text
approver eligibility / roles / authority enforcement      → 3I
credential/session/authentication mechanics               → 3I
post-admission cancellation/revocation of same attempt    → later 3G + 3I
complete Gateway effect_attempt FSM                       → later 3G
Mastra suspend/resume realization                         → 3H
async/wire/status transport realization                   → 3H / implementation
approval card / confirmation UX                           → 3K
OUTCOME_UNKNOWN reconciliation                            → 3M
re-send after uncertain external outcome                  → 3M + 3G only if state law is required
new approval originators / reusable approval              → Decision Loop on real consumer
```

3G-01 should prepare seams for these consumers without pre-building their machinery.

---

## 8. Proof strategy before implementation

At architecture maturity, try to falsify the preferred model with explicit traces, including at least:

```text
1. ALLOW_ONCE before expiry → valid first claim → committed bind
2. ALLOW_ONCE → Gateway admission failure → rollback → still claimable
3. two concurrent FIRST_CLAIM candidates → at most one commits
4. B2 pin mismatch → committed STALE → later pin reversion cannot resurrect
5. same bound attempt recovery after expiry → still reconstructable
6. different attempt recovery/claim after binding → fail closed
7. process crash before atomic COMMIT → no consumed approval
8. process crash after COMMIT, before send → same-attempt recovery possible
9. decision/expiry boundary race → deterministic semantics
10. stale/claim race → deterministic semantics without double authority
```

Implementation proof later must include real transaction/concurrency/restart evidence; architecture review alone does not prove runtime behavior.

---

## 9. Fable — independent Senior/Staff/Principal challenge

Reconstruct authority independently. Do not optimize for agreement with this Round 1.

Please attack at minimum:

1. **Persisted facts:** Is `humanDecision + expiresAt + monotonic STALE + boundEffectAttemptId` sufficient, or is a load-bearing fact missing?
2. **Derived expiry:** Can `EXPIRED` safely remain derived, including querying, decision CAS, restart and concurrent claim behavior? Give a concrete failure class if not.
3. **Decision-time expiry:** Should an ALLOW_ONCE decision be rejected after expiry, or may the decision be recorded while FIRST_CLAIM remains impossible? Which answer best follows existing authority and minimizes weird durable states?
4. **Precedence:** What is the exact precedence among `DENIED`, `EXPIRED`, `STALE`, and `BOUND_TO_ATTEMPT`? Find any reachable contradictory combination.
5. **Concurrency:** Try to produce a race where two FIRST_CLAIM transactions both commit, or where STALE and a valid claim can both become durable.
6. **Rollback:** Is relying on the cross-owner transaction sufficient, or does PAR require any additional lifecycle marker to distinguish a crashed in-progress claim from a never-started claim?
7. **Recovery:** Does `BOUND_TO_ATTEMPT` contain enough lifecycle meaning for `RECOVER_BOUND`, without importing Gateway attempt state into PAR authority?
8. **Terminality:** Is a bound request terminal from PAR's lifecycle perspective even while the Gateway attempt remains non-terminal? If yes, state that distinction precisely.
9. **Temporal correctness:** What clock/transaction assumptions are actually load-bearing? Does architecture need a single authoritative `now` per decision/claim operation, or can implementation choose freely?
10. **Human-decision race:** Can concurrent `ALLOW_ONCE` and `DENY` produce ambiguous authority? What CAS/immutability invariant is minimally necessary without inventing another state machine?
11. **Status materialization:** Would omitting a persisted status materially harm enforceability, or is the projection sufficient? Conversely, does a persisted status eliminate a real defect class that the fact model misses?
12. **Global Maximum:** Is the recommended facts+projection model truly simpler overall, or does it merely move state-machine complexity into ad-hoc predicates?
13. **Prior-authority challenge:** If 3F-03 itself forces an unsafe behavioral shape, raise a material Finding explicitly rather than silently patching it.
14. **Strongest counterargument:** State the strongest case for Alternative B or another model and why it should or should not win.

For every material disagreement, record:

```text
claim challenged
concrete counterexample / failure class
smallest correction
whether 3C/3D/3E/3F must reopen
later owner if not 3G-01
```

Append your response as:

```text
# Round 1 — Fable
```

Do not modify prior rounds, `LEDGER.md`, approved authority, or product code.

---

## 10. Current ChatGPT disposition — not a decision

My current preference is:

```text
Alternative A
→ owner-local durable facts
→ lifecycle projection derived from those facts
→ no generic FSM machinery
→ no extra durable record
→ no transaction-progress lifecycle states
```

because it appears to preserve every currently proven invariant with the least duplicated truth.

The highest-risk unresolved areas are:

```text
state precedence
human-decision × expiry semantics
claim × STALE concurrency
single authoritative time semantics
whether bound is terminal for PAR while attempt is still live in Gateway
```

Those should be challenged before operator ratification.

---

# Round 1 — Fable

## 0. Position and provenance

I reconstructed authority independently from `AGENTS.md` read order: Engineering Method v1.0.0 → `DOCUMENTATION-MAP` → `DECISOES.md` → `LEDGER.md` → 3C-10 → 3D-02 → 3D-R1 → 3E-01/3E-02 → 3F-02 → 3F-03 → 3F-R1, at HEAD `d1fdcc9`. This round makes **no current-Mastra claim**; every argument below is independent of Mastra behavior, so Context7 verification is not required for this round.

Summary of my verdict up front:

```text
Alternative A (durable facts + derived projection)  → CONFIRMED, conditionally
Alternative B (persisted mutable status FSM)        → REFUTED (strongest case stated below)
Alternative C (event sourcing)                      → agreed rejected
Material Findings against 3F-03 / prior authority   → NONE; no reopen of 3C/3D/3E/3F
Material corrections/additions to Round 1           → FB-1 .. FB-8 below
```

Round 1's authority reconstruction in §1 is accurate. It has one material omission: **3E-01's atomicity classes** are load-bearing for this decision and Round 1 never maps its writes onto them. That omission produces FB-7.

---

## 1. Material corrections and additions

None of these reopens prior authority. All are corrections or completions of the Round 1 hypothesis, owned by 3G-01 itself unless stated.

### FB-1 — FIRST_CLAIM check order must be normative, or STALE corrupts a bound request

**Claim challenged:** Round 1 §4/§6 treats STALE materialization as safe whenever "stored pin ≠ observed pin". 3F-03 §11 lists the claim checks but never says the list order is normative.

**Counterexample.** Request R is bound to attempt A (committed). A crashed process or a buggy caller issues `FIRST_CLAIM(R, B, pins)` where the supplied pins happen to mismatch (pins legitimately moved after admission — this is the *normal* post-admission world, since RECOVER_BOUND explicitly tolerates later pin drift). If an implementation evaluates the pin comparison before the bound check, it commits a terminal STALE fact **onto a bound request**. Result: durable facts assert simultaneously "this approval was consumed by admitted attempt A" and "this approval was terminally invalidated before any admission". RECOVER_BOUND as specified checks binding + decision + commitment and would still succeed, so the corruption is silent — two contradictory durable truths, discovered only by audit. The same shape exists for expiry: `FIRST_CLAIM` on an expired request with mismatched pins must produce the expiry domain outcome, not a durable STALE write (expiry needs no write; writing STALE there adds a durable fact where derivation already terminalizes).

**Smallest correction.** 3G-01 freezes evaluation precedence as write-guard structure, not as code convention:

```text
1. commitment integrity + decision existence/value     → typed outcome, no write
2. already bound?                                       → typed fail-closed outcome
                                                          (route caller to RECOVER_BOUND), no write
3. expiry (authoritative tx time)                       → EXPIRE domain outcome, no write
4. key-set exactness                                    → typed contract error, no write
5. byte equality                                        → mismatch = the ONLY path that
                                                          writes terminal STALE
```

Equivalently: **the STALE write predicate itself must require "currently claimable"** (`decision = ALLOW_ONCE AND unbound AND no STALE AND not expired at tx time`). Only a request that could otherwise have been claimed may be terminalized STALE. This makes the contradictory combination unreachable rather than merely discouraged.

**Reopen:** none. 3F-03 left the order unspecified; fixing it is exactly the lifecycle work routed to 3G. **Owner:** 3G-01.

### FB-2 — The enforcement law is missing: all lifecycle writes are guarded conditional single-row writes

**Claim challenged:** Round 1 §5 asserts "two concurrent FIRST_CLAIM → at most one commits" as a property of the atomic transaction. The transaction alone does not give you that; the write shape does.

**Counterexample.** Implementation reads the request row (`SELECT`, sees unbound), performs Gateway checks, then issues an unconditional `UPDATE ... SET bound_attempt = $A`. Under READ COMMITTED — Postgres's default — two such transactions both read "unbound", both proceed, and the second `UPDATE` silently overwrites the first after its commit: a lost update producing either a double admission or a rebound approval, violating 3F-03 §14. Nothing in "one atomic transaction" prevents this; only the predicate on the write does.

**Smallest correction.** Normative invariant in 3G-01:

> Every ApprovalRequest lifecycle write (decision, STALE, binding) is a single-row conditional write whose `WHERE` clause restates the complete admission predicate, and the transaction fails if the write affects zero rows. Correctness MUST NOT depend on an isolation level above READ COMMITTED.

Consequences, all free:

- both FIRST_CLAIM outcomes (bind, STALE) write the same owner row, so the row lock is the natural serializer — claim×claim and claim×STALE races become deterministic in both orders with no extra machinery (this fully answers Round 1 §8 traces 3 and 10);
- the decision write is the same law: `... WHERE decision IS NULL ...`; concurrent `ALLOW_ONCE` vs `DENY` serialize on the row, the loser gets zero rows → CAS-conflict-class domain outcome. Write-once decision immutability is a guard, not a convention (answers challenge 10 with no second state machine);
- as cheap owner-local defense, a partial unique index on `bound_effect_attempt_id WHERE NOT NULL` enforces the PAR side of the 1:1 request↔attempt relation even against future bugs; the Gateway side is already enforced by `gw.effect_attempt` primary-key uniqueness. No Tier-2 FK is needed or permitted (3E-02 lists `gw.effect_attempt ↔ par.approval_request` as Tier-3, correctly).

**Reopen:** none. **Owner:** 3G-01 invariant; contract tests at implementation.

### FB-3 — `humanDecision` is an immutable decision record, not an enum value

**Claim challenged:** Round 1 §3 models the fact as `humanDecision: NONE | ALLOW_ONCE | DENY`.

**Failure class.** 3F-03 §15 requires RECOVER_BOUND to verify that "original ALLOW_ONCE/decision facts for the binding exist", and §8 requires server-derived decision evidence (projector identity/version/digest) at decision time. OBS cannot be the sole durable holder of any of this: OBS is never current domain truth (C-013, 3D-R1 §2). If PAR persists only an enum, then after any OBS retention event the owner can no longer prove *who decided, when, against which served projection* — and recovery custody verification degrades to "the enum says ALLOW_ONCE".

**Smallest correction.** The persisted fact is an immutable write-once decision record, semantically:

```text
decisionValue        ALLOW_ONCE | DENY
decidedAt            authoritative tx time
approverPrincipalRef server-derived
projectorEvidenceRef server-derived (identity/version/digest actually served)
```

Exact columns remain implementation. The OBS audit record is additionally emitted under the audit-required transversal class (see FB-7) — it duplicates *evidence*, never authority.

**Reopen:** none. **Owner:** 3G-01 semantics; columns at implementation.

### FB-4 — Temporal law must be frozen, not left to implementation

**Claim challenged:** Round 1 §6 asserts derived expiry is safe but leaves clock semantics open (its own challenge 9).

**Load-bearing minimum.** Three rules, no more:

1. **One authoritative `now` per guarded write**: every lifecycle-write transaction (decision, claim, STALE) evaluates time exactly once, from the database's transaction time, inside the same transaction that writes. Hub process clocks never participate in guards.
2. **Closed boundary rule**, stated once: `now >= expiresAt → expired`. No second comparison convention anywhere.
3. **No re-evaluation at commit.** A claim transaction that passed the expiry check at its authoritative time may commit after wall-clock expiry; this is lawful by construction. The window is bounded because no transaction spans external I/O (3D-R1 §10) and expiry is never rechecked post-binding (3F-03 §15). This makes Round 1's trace 9 deterministic instead of racy.

Projections/list queries may use any reasonable clock and never gain authority — a projection that disagrees with a later guard evaluation is a display artifact, not a correctness defect.

**Accepted residual, named:** a backward step of the *database* clock can transiently make an unclaimed, projection-expired request claimable again within its original `expiresAt`. This does not violate 3F-03 (the request is again literally before `expiresAt` per the only authoritative clock) and does not touch STALE monotonicity, which is a durable fact. Materializing EXPIRED on first observation would close it at the cost of reintroducing expiry writers; not justified by the failure class. **Trigger to revisit:** evidence of non-monotonic DB host time in operation. **Owner:** ops discipline / 3J; recorded here so deferral is explicit.

### FB-5 — Decision-time expiry: pick the guard, and read 3F-03 §4.2 correctly

**Answer to challenge 3.** 3F-03's "checked by PAR somente antes do primeiro claim/admission" contrasts claim-time with *recovery*-time (§15 forbids expiry recheck after binding); it does not prohibit the decision surface from refusing a late decision. Both candidate behaviors preserve every invariant, because claim-time is the only enforcement point that matters:

```text
(a) record late ALLOW_ONCE, projection EXPIRED dominates  → safe, but records a
    decision that was never actionable; human believes they approved something
(b) refuse any decision unless the request is AWAITING_APPROVAL
    at the guard's authoritative tx time                   → safe, honest, one predicate
```

I recommend **(b)**: the decision write guard becomes `WHERE decision IS NULL AND stale IS NULL AND bound IS NULL AND now < expiresAt`, i.e., the same single-row law as FB-2 with zero new states. The refused decision returns a typed domain outcome naming the actual condition (EXPIRED/DENIED/…), and the refusal is still OBS-audited, so the human's intent is not lost — it is just never a domain fact. This is invariant-neutral; what 3G-01 must not do is leave it unspecified, because (a) and (b) produce different reachable fact combinations (`ALLOW_ONCE` with `decidedAt > expiresAt` exists only under (a)) and the fact-space enumeration below must be exact.

**Reopen:** none — this is not a change to 3F-03's claim semantics. **Owner:** 3G-01.

### FB-6 — Terminality: separate "no further transitions" from "GC-eligible", and name the retention realization path

**Answer to challenges 7 and 8.** Yes, `BOUND_TO_ATTEMPT` is terminal *for PAR's lifecycle authority*, and the precise statement is:

> After the binding commit, no further PAR lifecycle write is defined by 3G-01. The record remains **operationally load-bearing**: PAR still owes custody (sealed payload retention per 3F-03 §18) and the read-equivalent RECOVER_BOUND service, both without lifecycle mutation. Gateway attempt liveness, receipt and `OUTCOME_UNKNOWN` are Gateway vocabulary and never become PAR facts (3F-02 state non-unification).

Two distinct predicates must not be conflated:

```text
PAR-terminal   = no further authority transitions          (owner-local, decidable from par facts)
GC-eligible    = PAR-terminal AND retention horizon closed (cross-owner, requires attempt settlement)
```

Realization of the second predicate needs Gateway attempt terminality. That requires no new architecture: `PAR → Gateway` is already an allowed import in the 3D-R1 matrix, so retention/GC evaluation may consult a narrow Gateway public projection ("attempt X terminal and settled"). The GC-versus-RECOVER_BOUND race (collect custody while a recovery read is in flight) is recovery machinery → **3M**, noted here so it is not lost.

`RECOVER_BOUND` needs nothing beyond `boundEffectAttemptId` + decision record + commitment verification — deliberately ignorant of attempt status. Over-permitting recovery of an already-settled attempt is harmless: re-execution is prevented by Gateway idempotency/attempt state, which is the correct owner for that guarantee.

One realization note: when a crashed caller retries `FIRST_CLAIM` with a fresh candidate B against a bound request, the FB-1 step-2 typed outcome must be distinguishable enough (bound-elsewhere) that the caller can find A via the Gateway's own `gw.effect_attempt.approvalRequestId` and switch to `RECOVER_BOUND(A)`. Internal semantics only; no public code is created (3F-05 baseline untouched).

**Reopen:** none. **Owner:** 3G-01 statement; GC machinery 3M.

### FB-7 — Map every lifecycle write to its 3E atomicity class

**Omission in Round 1.** 3E-01 froze the atomicity classes; 3G-01's writes must land on them explicitly:

```text
decision write (ALLOW_ONCE | DENY)   → audit-required mutation + OBS, fail-closed transversal class
terminal STALE write                 → same transversal class (3F-03 §12 already says audit-required)
binding write                        → material effect admission class = GW + PAR in one transaction
RECOVER_BOUND                        → no write; read-equivalent (3F-03 §10)
```

This closes a real question Round 1's §5 leaves open: the claim transaction is PAR+GW when it binds, but on pin mismatch it *becomes* PAR+OBS (STALE + audit record) with zero `gw.*` writes — consistent with 3F-03 §12 and 3E-01, and worth stating as the transaction's two exclusive commit shapes. **Owner:** 3G-01.

### FB-8 — Derived expiry emits no event; the waiting run's liveness is a named later consumer

Derived EXPIRED means nothing fires at `expiresAt`. Correctness never needs it (claim-time guard is the enforcement point), but an AgentRun suspended on approval learns of expiry only when something next evaluates the projection. That liveness/UX behavior — waking the suspended run, notifying the conversation — is a **3H consumer** (suspend/resume mechanics, possibly realized by substrate schedules) and 3K surface work. 3G-01 should state the seam ("expiry is silent at the state layer; any wake-up is a consumer of the projection, never a second authority") and build none of it. This preserves Round 1's "no expiry cron for correctness" while preventing the later discovery that a scheduler snuck in as hidden authority.

**Owner:** 3H / 3K; seam stated in 3G-01.

---

## 2. Reachable fact space — the precedence question dissolves

Under the FB-1/FB-2/FB-5(b) write guards, the fact space is a tree, not a lattice. With `D ∈ {NONE, ALLOW_ONCE, DENY}`, `S = STALE?`, `B = bound?`, and derived clock `pre|post` expiry:

```text
(NONE,       —, —)   AWAITING_APPROVAL   | EXPIRED (post)
(DENY,       —, —)   DENIED                                   [clock-insensitive]
(ALLOW_ONCE, —, —)   APPROVED_UNCLAIMED  | EXPIRED (post)
(ALLOW_ONCE, S, —)   STALE                                    [clock-insensitive]
(ALLOW_ONCE, —, B)   BOUND_TO_ATTEMPT(A)                      [clock-insensitive]
```

Everything else — `(NONE|DENY, S, *)`, `(NONE|DENY, *, B)`, `(ALLOW_ONCE, S, B)` — is **unreachable by guard construction**:

- STALE requires a currently-claimable request, hence `ALLOW_ONCE`, unbound (FB-1);
- binding requires `ALLOW_ONCE`, no STALE, unexpired (FB-2 predicate);
- DENY excludes everything downstream because decision is write-once (FB-2).

Therefore my answer to challenge 4 is stronger than a dominance order: **do not define precedence over contradictory durable facts — make them unreachable, and treat their observation as corruption.** If PAR ever reads a row combining, e.g., DENY + STALE, the projection must fail closed as a durable-interpretation failure (3F-01 L4 class), never silently pick a winner. A dominance rule over impossible states would mask exactly the corruption it should surface.

The only genuine precedence left is derived-versus-derived: expiry loses to every durable fact (`BOUND`, `STALE`, `DENIED` are clock-insensitive; expiry only differentiates the two live states). That is five reachable fact rows and one clock predicate — small enough that the 3G-01 contract-test family can enumerate the entire space exhaustively, including negative tests asserting each unreachable combination is rejected by its guard. That enumeration **is** the proof strategy for the state model; it is only possible because the model is facts, not a mutable status.

This also answers challenge 11: a persisted status column would turn each of these guard-unreachable combinations into a *reachable drift state* (status says APPROVED, `bound_attempt` set — Round 1's FC-5) that then genuinely needs precedence rules and repair migrations. The facts model does not merely avoid duplication; it converts the precedence problem from runtime data repair into a compile-time/test-time enumeration.

---

## 3. Answers to the remaining numbered challenges

**1 — Sufficiency of the fact set.** Sufficient with two amendments: the decision fact is a record, not an enum (FB-3), and the STALE fact needs only `occurredAt` + reason/key identity — the observed mismatching current values belong in the atomically-committed OBS audit record (FB-7), not in `par.*`, or PAR starts durably mirroring Gateway-observed data. No fifth fact is load-bearing. `createdAt`, sealed payload, commitment digest, B1/B2 pins are already immutable creation facts under 3F-03 §6 and are not lifecycle.

**2 — Derived EXPIRED.** Safe. Querying: listing predicates include the time comparison (`WHERE decision IS NULL AND stale IS NULL AND bound IS NULL AND now() < expires_at`), served by a partial index; no cron. Decision CAS: FB-5(b) folds expiry into the decision guard at the same authoritative time — no interaction. Restart: derived state is restart-proof by construction — facts are durable, projection recomputes; there is no EXPIRED writer to crash mid-flight. Concurrent claim: FB-2. I found no failure class requiring materialized EXPIRED; the clock-regression residual is FB-4 and does not justify it.

**5 — Two committed FIRST_CLAIMs / STALE+claim both durable.** Impossible under FB-2: both writes target the same owner row with full predicates; the row lock serializes; the loser's predicate re-evaluates to zero rows and its transaction (including all Gateway writes) rolls back. I could not construct a counterexample that does not first violate the guarded-write law — which is why that law must be normative rather than an implementation habit.

**6 — Rollback marker.** No marker. Crashed-before-COMMIT is observationally identical to never-started **because** (a) external I/O strictly follows commit and (b) there is no durable pre-allocation (3F-03 §13). State the conclusion as *derived from those two laws*: if 3M or a future provider integration ever introduces pre-commit external reservation, the no-marker conclusion falls with it and must be re-derived, not assumed.

**9 — Temporal.** FB-4. Single authoritative DB tx time per guarded write; closed boundary `now >= expiresAt`; no commit-time re-evaluation; projections advisory.

**12 — Global Maximum.** Alternative A survives my attempt to refute it, with one honest concession: its risk is not the predicates themselves but **predicate scatter** — five call sites each re-implementing "claimable" slightly differently. The mitigation is structural and cheap: one owner-local canonical definition of the projection function and the write-guard predicates, consumed by every path, plus the exhaustive fact-space contract test of §2. With that single-definition rule, A is strictly simpler than B: B needs the same predicates *plus* a second copy of truth *plus* expiry writers *plus* drift repair. Without that rule, A degrades into ad-hoc predicates and B's familiarity argument starts to win on maintainability. So the single-definition rule should be normative in 3G-01, not advice.

**13 — Prior authority.** No Material Finding. Specifically checked: 3F-03 §11's unordered check list (gap closed by FB-1, which is routed 3G work, not a 3F defect); §7 `expectedRevision` (realized as decision-absence CAS — no revision counter needed; consistent); §12 STALE commit shape (consistent with 3E transversal class); §15 recovery versus expiry (consistent with FB-4/FB-5 reading); 3F-02 state non-unification (the six projection labels stay domain vocabulary; **zero new public failure codes** are required by 3G-01 — claim outcomes are F1 internal typed results, and product surfaces reuse existing domain-outcome semantics).

**14 — Strongest case for Alternative B.** Steelman: (i) one indexed column answers every operational query; (ii) `WHERE status = 'APPROVED'` is the guard every engineer already writes correctly; (iii) explicit transition writes give an in-row audit trail; (iv) no derived-state/projection concept to teach. It still loses on one structural fact: **expiry cannot become a status transition without a writer**, so B forces either a scheduler that races claims (new machinery, new failure classes) or a status column that lies until repaired (FC-5 as a permanent condition, and a `WHERE status='APPROVED'` guard that admits expired requests unless it *also* re-checks `expires_at` — at which point B is A plus a redundant column). B's real advantages are recoverable inside A at zero authority cost: queryability via partial indexes and, if ever needed, a non-authoritative generated/projected column. B should not win.

---

## 4. Additions to the proof strategy

Add to Round 1 §8:

```text
11. FIRST_CLAIM on a bound request with mismatching pins
    → typed bound-elsewhere outcome; asserts NO stale write occurred        (FB-1)
12. FIRST_CLAIM on an expired request with mismatching pins
    → EXPIRE domain outcome; asserts NO stale write occurred               (FB-1)
13. concurrent ALLOW_ONCE vs DENY → exactly one durable decision;
    loser receives CAS-conflict-class outcome                               (FB-2)
14. exhaustive fact-space enumeration: 5 reachable rows verified,
    every unreachable combination rejected by its write guard;
    contradictory row injected raw → projection fails closed (L4)           (§2)
15. lost-update probe: two claim transactions under READ COMMITTED
    with the guarded write → exactly one bound; with an unguarded write
    the harness must demonstrate the double-bind (control that fires)       (FB-2)
```

Trace 15 matters for method reasons: it demonstrates the guard *firing*, satisfying "a control that cannot be shown to fire is not proven".

---

## 5. YAGNI / buildability audit of this round

Nothing in FB-1..FB-8 adds a subsystem, record, probe, public code, or dependency edge:

```text
new durable records                 0   (par.approval_request only, per 3E-02)
new Tier-2 FKs                      0   (partial unique index is owner-local)
new public failure codes            0
new module dependencies             0   (PAR → Gateway projection already in the 3D-R1 matrix)
new probes                          0   (traces land in the existing 3N/3O proof obligation)
schedulers / crons / state engines  0
```

The single-Postgres, single-process modular monolith is what makes the whole model buildable as CONVENTIONAL: the claim capability executes inside the caller's `TxScope`, so there is no distributed-commit ambiguity anywhere in 3G-01's scope. That assumption is worth one explicit line in the decision text, because a future availability split (already a named Decision Loop trigger in 3F-03 §18) would invalidate it.

---

## 6. Disposition

```text
Alternative A                       CONFIRMED as 3G-01 basis
with normative additions            FB-1 check-order/guard precedence
                                    FB-2 guarded conditional single-row writes
                                    FB-3 decision record shape
                                    FB-4 temporal law + named clock residual
                                    FB-5(b) decision-time guard (recommended)
                                    FB-6 PAR-terminal vs GC-eligible + retention path
                                    FB-7 atomicity-class mapping
                                    FB-8 expiry-silence seam
fact-space enumeration of §2        becomes the state-model proof obligation
Material Finding / reopen           NONE
```

Open for ChatGPT Round 2 or operator ratification: (a) accept or contest FB-5(b) versus record-and-dominate — either is safe, one must be chosen; (b) confirm the FB-1 ordering as written; (c) confirm that the six projection labels stay out of any public/wire vocabulary exactly as 3F-02 requires.
