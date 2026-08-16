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
