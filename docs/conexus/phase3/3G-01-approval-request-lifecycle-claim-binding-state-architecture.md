# 3G-01 — ApprovalRequest Lifecycle & Claim-Binding State Architecture

**Status:** APPROVED pelo operador em 2026-08-16  
**Fase:** 3G — Behavioral / State Architecture  
**Authority:** primeira decisão aprovada de 3G  
**Importante:** esta decisão não constitui C-018, não encerra 3G nem a Fase 3, e não autoriza implementação de produto, merge ou PR readiness.

## Decisão em uma frase

No Conexus F1, `ApprovalRequest` não possui um `status` autoritativo duplicado nem uma FSM genérica: PAR persiste apenas os fatos owner-local load-bearing — decisão humana write-once, `expiresAt` imutável, invalidação `STALE` monotônica e binding permanente ao primeiro `effectAttemptId` cuja admission comitou — e deriva deles uma única projeção canônica; todas as mutations são concurrency-safe, expiry é derivado de um único `guardNow` database-sourced por invocation, rollback nunca consome approval, recovery do mesmo attempt nunca reautoriza, e combinações duráveis impossíveis falham fechado.

---

## 1. Authority, método e provenance

Esta decisão aplica a **DevelopmentConexus Engineering Method v1.0.0** e reconcilia, sem reabrir:

- C-010 — `ApprovalRequest`, `ALLOW_ONCE | DENY`, exact approved envelope e `AWAITING_APPROVAL` durável;
- C-013 — persist-before-effect, traffic/outcome, `OUTCOME_UNKNOWN`, audit/evidence e recovery constraints;
- 3C-10 — Production Agent Runtime owns `ApprovalRequest` e high-level AgentRun lifecycle;
- 3C-13 — audit-required material human decisions / external effects e separação Audit vs Operational Telemetry;
- 3D-02 / 3D-R1 — narrow approval-claim inversion e Gateway last-mile admission/execution;
- 3E-01 — `hub_control`, owner-local schemas, opaque `TxScope`, Class-1 Gateway↔PAR material-effect admission e Class-2 audit-required transversal atomicity;
- 3E-02 — `par.approval_request` já é a única durable record class necessária; `gw.effect_attempt ↔ par.approval_request` permanece Tier-3/opaque ref;
- 3F-01 — durable interpretation/failure loci e PRESERVE horizons;
- 3F-02 — lifecycle/domain outcome != public failure != effect outcome; sem `UniversalStatus`;
- 3F-03 — exact sealed subject, immutable expiry/pins, monotonic STALE, single-claim, atomic admission, permanent binding e `RECOVER_BOUND`;
- 3F-R1 — Contracts/API fechada e 3G como owner das FSM/lifecycle semantics restantes.

Review/provenance não-autoritativa:

- `3G-FABLE-DIALOGUE-approval-request-lifecycle.md`;
- `3G-FABLE-DIALOGUE-approval-request-lifecycle-R2.md`.

O desenho passou por dois rounds adversariais ChatGPT ↔ Fable, com counterexamples explícitos de race, rollback, temporal straddle, approval resurrection e admission sem approval. Resultado antes da ratificação:

```text
Material Finding contra 3C/3D/3E/3F = NONE
reopen anterior = NONE
candidate 3G-01 = READY FOR OPERATOR DECISION
new subsystem/record/dependency = NONE
```

---

## 2. Escopo fechado

3G-01 fecha somente o lifecycle/state model da `ApprovalRequest` já ratificada por C-010/3F-03.

Ela decide:

```text
creation validity window
decision write-once semantics
canonical lifecycle projection
expiry semantics
STALE terminalization
single-claim binding semantics
concurrency / guarded mutation laws
rollback behavior
same-attempt recovery relationship
durable-fact consistency
PAR-terminal vs custody/retention behavior
```

Ela não decide:

```text
approver eligibility / roles / revocation              → 3I
post-admission cancellation / authority narrowing      → later 3G + 3I
Gateway effect_attempt complete FSM                    → later 3G
AgentRun semantic response to approval expiry           → later 3G
Mastra suspend/resume/timer realization                 → 3H
approval-card/product presentation                      → 3K
OUTCOME_UNKNOWN reconciliation / resend / GC machinery → 3M
exact SQL / columns / indexes / ORM                     → implementation
stable public/wire literals                             → existing 3F admission/mapping laws
```

Não nasce `ApprovalService`, shared repository, workflow engine, event sourcing, scheduler authority ou generic FSM framework.

---

## 3. Owner-local durable facts

A current authority de `ApprovalRequest` é formada semanticamente por fatos equivalentes a:

```text
decision
  absent | ALLOW_ONCE | DENY

expiresAt
  immutable

stale
  absent | monotonic STALE fact

boundEffectAttemptId
  absent | exact committed effectAttemptId
```

Exact field names/physical columns não são congelados aqui.

Additional immutable material from 3F-03 remains part of the record/custody contract:

```text
sealed EFFECT_SUBJECT
approvalCommitmentDigest
GOVERNING_VALIDITY pins
ORIGIN_CORRELATION
```

These are not lifecycle states.

Normative rule:

> Persist what would otherwise lose required semantics; derive what is already provable from retained facts.

Therefore F1 does **not** persist a second mutable authoritative `status` merely for convenience.

A view/index/cache/materialized projection may later exist as non-authoritative realization if a real query/performance consumer requires it; it never becomes second lifecycle truth.

---

## 4. Canonical lifecycle projection

For safely interpretable durable facts, PAR exposes one owner-local canonical projection evaluated at an invocation-specific `guardNow`:

```text
D = decision
S = stale fact
B = boundEffectAttemptId
```

### Reachable durable combinations

```text
D = absent      S = false   B = null
D = DENY        S = false   B = null
D = ALLOW_ONCE  S = false   B = null
D = ALLOW_ONCE  S = true    B = null
D = ALLOW_ONCE  S = false   B = A
```

### Projection semantics

```text
D=absent, unexpired
→ AWAITING_APPROVAL

D=absent, expired
→ EXPIRED

D=DENY
→ DENIED

D=ALLOW_ONCE, no S/B, unexpired
→ APPROVED_UNCLAIMED

D=ALLOW_ONCE, no S/B, expired
→ EXPIRED

D=ALLOW_ONCE, S
→ STALE

D=ALLOW_ONCE, B=A
→ BOUND_TO_ATTEMPT(A)
```

Projection labels above are owner-local semantic names, **not automatically stable public/wire literals**.

Explicit public/independent boundary admission continues governed by 3F-02/3F-05. `AWAITING_APPROVAL`, `DENIED`, `EXPIRED`, `STALE` remain lifecycle/domain meanings, not T1 failure codes.

### Impossible combinations

Examples:

```text
DENY + STALE
DENY + BOUND
STALE + BOUND
absent decision + STALE
absent decision + BOUND
```

They are not resolved through a dominance/precedence table.

Observation of an impossible durable combination is a fail-closed durable interpretation/corruption condition under the existing L4 discipline.

---

## 5. Creation law — no born-expired request

ApprovalRequest creation captures a database-sourced `creationGuardNow` under the same temporal law used below.

Required invariant:

```text
expiresAt > creationGuardNow
```

If not:

```text
typed contract failure
no durable ApprovalRequest created
no human card / wait lifecycle established
```

No minimum positive lifetime is frozen here; concrete horizon/policy remains policy/config authority elsewhere.

This guarantees that every durable request had a non-empty decisionable window when created.

---

## 6. Human decision law

The domain transition is write-once:

```text
absent → ALLOW_ONCE
absent → DENY
```

A first successful decision is immutable current PAR authority.

A new decision is permitted only while the canonical projection at its `guardNow` is `AWAITING_APPROVAL`.

Therefore a request that is already:

```text
EXPIRED
STALE
BOUND_TO_ATTEMPT
DENIED
APPROVED_UNCLAIMED
```

does not accept a new different human decision transition.

### Retry / double-click

Same-value resubmission after the decision already exists is idempotent read-back:

```text
ALLOW_ONCE after recorded ALLOW_ONCE → no write; return recorded decision + current projection
DENY after recorded DENY             → no write; return recorded decision + current projection
```

Different-value resubmission fails as typed conflict and never overwrites authority:

```text
ALLOW_ONCE then DENY → conflict
DENY then ALLOW_ONCE → conflict
```

No decision idempotency-key subsystem or revision counter is introduced solely for this path. Decision absence is the owner-local CAS expectation unless another already-approved boundary requirement makes an explicit revision expectation necessary.

A late `DENY` after expiry is refused as lifecycle mutation, symmetrically with late `ALLOW_ONCE`. A future product/audit consumer that needs to record refused human intent may add OBS-side evidence through Decision Loop without mutating ApprovalRequest authority.

---

## 7. Temporal correctness — one captured `guardNow`

Every lifecycle guard invocation that depends on expiry captures **one database-sourced instant**:

```text
guardNow
```

Rules:

1. `guardNow` is captured once per invocation;
2. process/host clocks are non-authoritative for lifecycle mutations;
3. every temporal comparison in that invocation uses the same captured value;
4. the captured value is also used by the mechanical mutation predicate — the clock is not re-read there;
5. distinct invocations capture distinct `guardNow` values;
6. expiry boundary is closed:

```text
guardNow >= expiresAt → expired
```

7. a transition valid at its captured `guardNow` is not re-evaluated merely because wall time crosses expiry before transaction commit;
8. no transaction remains open across external physical I/O, preserving the bounded nature of this window.

This decision freezes the semantic property, not the exact PostgreSQL time function or parameter plumbing.

### Named residual / reopen trigger

A material backward step of the authoritative database clock could transiently place an unbound request before `expiresAt` again.

F1 does not materialize EXPIRED solely to defend against hypothetical non-monotonic database time because that would reintroduce expiry writers/schedulers with no current evidence.

Reopen trigger:

```text
observed operational evidence of materially non-monotonic authoritative DB time
```

Operational clock discipline belongs to 3J.

---

## 8. Expiry is derived and silent

Expiry is a projection from immutable `expiresAt` + invocation `guardNow`.

Crossing wall-clock `expiresAt` alone causes:

```text
no ApprovalRequest lifecycle write
no required cron/scheduler
no required domain event merely to make EXPIRED true
```

Correctness is enforced when a boundary evaluates the projection/guard.

A later consumer may use runtime scheduling/timers to wake a suspended flow, but such mechanics are a consumer of the ApprovalRequest projection and never a second expiry authority.

Later routing:

```text
AgentRun semantic effect of approval expiry → later 3G
wake/suspend/resume/timer mechanics          → 3H
notification/card/status UX                 → 3K
crash/recovery/GC interactions              → 3M
```

---

## 9. STALE law — durable, monotonic, pre-admission only

`STALE` differs from derived expiry because later return of external governing pins must never resurrect an approval.

A first `STALE` write is permitted only when all are true at the same claim invocation:

```text
decision = ALLOW_ONCE
unbound
not already STALE
guardNow < expiresAt
exact B2 key-set is structurally valid
at least one exact B2 value differs byte-for-byte
```

Then:

```text
PAR writes terminal monotonic STALE
+ required OBS audit under existing audit-required transversal rule
COMMIT
```

and:

```text
zero gw.* writes
no budget reservation
no idempotency claim
no effect_attempt admission
```

Returning the external system/policy to the old pin values never removes STALE.

A key-set shape violation remains typed contract failure and does not terminalize.

A request already expired/bound/denied/stale cannot acquire a new STALE fact from a later `FIRST_CLAIM` call.

---

## 10. Guarded mutation / concurrency law

Transaction existence alone does not prove single-claim or write-once behavior.

Every mutable ApprovalRequest authority transition is therefore one owner-local **conditional/CAS guarded mutation** whose success depends on the still-current persisted lifecycle facts.

Applies to:

```text
first decision
first STALE materialization
first binding to effectAttemptId
```

The mechanical mutation predicate must restate every concurrently mutable lifecycle fact on which the transition depends:

```text
decision
STALE presence
boundEffectAttemptId
+ captured guardNow comparison where expiry participates
```

Facts immutable after request creation, such as exact `expiresAt`, sealed subject/commitment and governing pins, may be verified procedurally in the same transaction; no concurrent actor may mutate them between verification and write.

Normative result:

```text
guarded mutation affects 1 row → transition may proceed
0 rows                        → expected transition did not occur
```

This decision intentionally does not freeze:

```text
exact SQL
SELECT ... FOR UPDATE syntax
specific index/constraint
ORM/query builder
physical column layout
```

Correctness must not require an isolation level stronger than the accepted F1 PostgreSQL baseline merely to make this ApprovalRequest model work.

---

## 11. FIRST_CLAIM classification vs write permission

3G-01 separates two concerns deliberately:

```text
refusal classification
!=
write admission
```

### No-write domain/lifecycle refusal

When `FIRST_CLAIM` or the decision surface does not perform a lifecycle write because the request is not in the required current lifecycle condition, the returned domain/lifecycle meaning comes from the **canonical projection** evaluated at that invocation's `guardNow`.

This prevents a second ordered-check taxonomy from disagreeing with the projection — for example, returning `AWAITING_APPROVAL` for an undecided request that is already expired.

### Outside projection

Contract/security/interpretation failures remain outside lifecycle projection, including as applicable:

```text
malformed decision
unknown/foreign request under safe not-found semantics
invalid FIRST_CLAIM key-set shape
commitment verification failure
impossible/corrupt durable fact combination
```

They continue governed by existing 3F failure semantics.

### Write permission

The only new durable writes possible from `FIRST_CLAIM` are:

```text
still-claimable + exact B2 values mismatch → STALE
still-claimable + exact B2 values match    → tentative binding inside atomic admission
```

Both must satisfy the complete concurrency/time guard at mutation time using the same captured `guardNow`.

---

## 12. Atomic binding + Gateway admission

A valid first claim retains the 3F-03 transaction shape:

```text
candidate effectAttemptId minted in memory

BEGIN
  PAR guarded bind ApprovalRequest R → candidate A
  Gateway performs remaining last-mile admission checks
  Gateway reserves complete approved budget/idempotency set
  Gateway persists gw.effect_attempt = NOT_SENT with approval correlation/pins
  required fail-closed AuditRecord(s) participate where existing audit policy requires
COMMIT

external physical I/O only after COMMIT
```

Exact internal ordering may vary only if all already-approved invariants remain satisfied; no implementation may allow an admitted Gateway attempt to commit without the successful PAR binding required for that attempt.

### Zero-row abort law

Inside the atomic material-effect admission transaction:

> A zero-row result from the required PAR binding mutation — or from any other admission-required guarded write in that transaction — **MUST abort the whole transaction**.

It is forbidden to:

```text
Gateway writes budget/idempotency/effect_attempt
→ PAR bind loses concurrent race / affects 0 rows
→ classify/re-read
→ still COMMIT Gateway writes
```

This would admit an external effect without the required consumed approval.

`classify/re-read` after zero rows is allowed only for a transaction/surface whose failure leaves no other material admission writes to commit, such as the standalone human-decision mutation path.

The later complete Gateway attempt/budget/idempotency FSM must preserve the analogous guard+abort discipline on Gateway-owned facts; 3G-01 does not design that FSM early.

---

## 13. Commit is the single-claim point of no return

The first material-effect admission transaction that successfully commits establishes permanently:

```text
ApprovalRequest R ↔ effectAttemptId A
```

After commit:

```text
R cannot bind B
R cannot return to APPROVED_UNCLAIMED
A failing/cancelling/abandoning later does not recycle R
later expiry does not alter binding
later governing-pin drift does not alter binding
```

Before commit:

```text
transaction rollback
→ tentative PAR binding rolls back
→ approval remains claimable if its canonical projection still permits claim
→ no physical external I/O occurred
```

Race of two candidate attempts is therefore resolved by the owner-local guarded binding condition plus whole-admission abort semantics: at most one admission can commit against one ApprovalRequest.

---

## 14. RECOVER_BOUND — bound recovery is not reauthorization

`RECOVER_BOUND` remains the same-attempt, read-equivalent capability from 3F-03.

Required checks are limited to historical custody/binding correctness:

```text
request bound exactly to supplied attempt A
original ALLOW_ONCE decision fact exists
sealed subject/commitment remains safely interpretable
```

It does **not**:

```text
recheck expiry
compare current governing pins
materialize STALE due to later drift
mutate decision/lifecycle/binding
reserve budget/idempotency again
create a new attempt
```

Reason:

> Recovery reconstructs authority already admitted by a committed transaction; it does not authorize a new effect.

Gateway remains owner of current attempt state/idempotency and any later post-admission cancellation/reconciliation rules.

---

## 15. PAR-terminal != GC-eligible

After committed binding, `ApprovalRequest` is terminal with respect to **PAR lifecycle authority**:

```text
no further 3G-01 lifecycle transition exists
```

But the record/ciphertext may remain operationally load-bearing for `RECOVER_BOUND` while the Gateway attempt is unsettled.

Therefore distinguish:

```text
PAR-terminal
= no further ApprovalRequest authority transition

GC-eligible
= PAR-terminal
  + all 3F-03 PRESERVE-horizon obligations closed
```

3F-03 already requires custody while, for example:

```text
bound attempt non-terminal
OR
OUTCOME_UNKNOWN reconciliation/settlement not concluded
```

3G-01 creates no GC projection/API or cross-owner table access. Exact retention/GC/recovery machinery remains 3M.

F1 may conservatively retain longer; premature custody deletion is prohibited.

---

## 16. Decision evidence retention

3F-03 already requires server-derived immutable decision evidence for what the human actually saw/approved, including controlled projector identity/version/digest as applicable.

3G-01 freezes the horizon coupling:

> Decision evidence required by 3F-03 MUST be retained at least through the ApprovalRequest's own 3F-03 PRESERVE horizon.

This prevents the system from retaining executable approval custody for an unsettled attempt while prematurely discarding the evidence of who/what was presented in the decision flow.

Placement remains realization:

```text
PAR current authority
→ write-once decision fact

historical decision/audit evidence
→ retained under existing evidence/audit architecture
→ may use owner-local evidence ref and/or OBS realization
→ never replaces PAR current authority
```

`decidedAt`, approver identity and projector evidence do not become mandatory current PAR state fields solely because they are required audit/evidence.

---

## 17. Atomicity classes

3G-01 introduces **no new atomicity class**.

Existing mappings:

```text
successful first human decision
→ PAR authority mutation
+ OBS in same transaction when existing audit-required policy requires
→ 3E Class-2 transversal behavior

STALE terminalization
→ PAR + required OBS audit
→ Class-2 transversal behavior
→ zero gw.* writes

successful binding/material-effect admission
→ Gateway + PAR
→ existing 3E Class-1 cross-owner domain transaction
→ composed with existing Class-2 audit-required write where required

RECOVER_BOUND
→ read-equivalent
→ no lifecycle write
```

Class 1 and Class 2 may compose; this is not a new three-owner domain atomicity class.

Audit-required records are distinct from degradable Operational Telemetry. Existing fail-closed audit semantics do not contradict the C-013 rule that ordinary telemetry failure must not recursively alter execution.

---

## 18. Proof strategy

Before implementation can claim conformance, architecture verification must be able to falsify at least these classes:

```text
1. create request with expiresAt <= creationGuardNow
   → typed failure; no row

2. undecided + unexpired
   → AWAITING_APPROVAL

3. undecided + expired
   → EXPIRED, never AWAITING

4. ALLOW_ONCE before expiry
   → one durable decision

5. DENY before expiry
   → one durable decision; no later claim

6. same-value decision double-submit
   → one write + idempotent read-back

7. opposite-value decision race/retry
   → exactly one wins; other typed conflict; no overwrite

8. two concurrent FIRST_CLAIM candidates
   → at most one admission commits

9. FIRST_CLAIM on already-bound request with mismatching current pins
   → no STALE write; no second admission

10. FIRST_CLAIM on expired request with mismatching pins
    → EXPIRED projection; no STALE write

11. exact key-set + B2 mismatch while still claimable
    → monotonic STALE commit; zero gw.* writes

12. pins later revert after STALE
    → request remains STALE

13. admission later Gateway check/write fails
    → rollback removes tentative binding; no physical I/O

14. adversarial schedule where Gateway writes occur before losing PAR guarded bind
    → zero-row bind aborts whole transaction; no orphan gw admission

15. guardNow expiry straddle
    → one captured guardNow used by all comparisons/mutation predicate

16. crash before STALE commit
    → no false terminal fact; mismatch safely re-detected

17. crash after committed binding before physical send
    → same A recoverable through RECOVER_BOUND

18. RECOVER_BOUND after later expiry/pin drift
    → same subject recovered; no reauthorization/lifecycle mutation

19. same request + different attempt recovery
    → fail closed

20. injected impossible durable combination
    → durable interpretation failure; no precedence masking
```

For concurrency controls, verification must demonstrate the control firing, not merely assert that the happy path passes.

Detailed physical harness/test placement remains 3N/3O + implementation.

---

## 19. YAGNI / explicit rejections

3G-01 does not create or authorize:

```text
persisted universal lifecycle status
UniversalStatus / GenericFSM / StateRegistry
workflow engine / Temporal
ApprovalService
shared ApprovalRepository
ApprovalOriginator framework
BatchApproval framework
event sourcing / CQRS
expiry cron/scheduler as correctness authority
separate expiration event log
new durable record
new Tier-2 FK
gw↔par cross-table reads
partial unique index as architecture requirement
SERIALIZABLE as correctness crutch
exact SQL/row-lock pattern
new public failure/status code family
sticky/reusable approval
approval transfer between attempts
post-admission reauthorization in RECOVER_BOUND
Gateway duplicate sealed-subject custody
GC/recovery API before 3M consumer
```

Any future item requires its own real consumer/failure class and Decision Loop.

---

## 20. Deferred / routed work

This decision deliberately leaves the following outside 3G-01:

| Item | Owner |
|---|---|
| approver eligibility, session/role authority, admin revocation | 3I |
| post-admission cancellation / stricter new authority over in-flight attempts | later 3G + 3I |
| Gateway `effect_attempt` complete state machine, budget/idempotency guard states | later 3G |
| semantic effect of approval expiry on suspended AgentRun | later 3G |
| Mastra/checkpoint/timer/wake realization | 3H |
| approval-card/status/product UX | 3K |
| reconciliation/re-send after `OUTCOME_UNKNOWN` | 3M + later 3G where semantic state is needed |
| retention/GC/recovery machinery | 3M |
| exact SQL/schema/index/ORM implementation | implementation |
| concurrency/restart/end-to-end proofs | 3N / 3O |

No deferred item weakens the invariants frozen here.

---

## 21. Coherence / Global Maximum disposition

Against the credible alternatives:

```text
A. owner-local durable facts + canonical projection
B. one mutable persisted status FSM
C. event-sourced ApprovalRequest lifecycle
```

3G-01 chooses **A**.

Why B loses:

- expiry becomes truthful only with an autonomous writer, or the status becomes stale/duplicated truth;
- expiry guard would still need `expiresAt`, making the status redundant;
- transaction-internal mechanics tempt accidental durable states such as `CLAIMING`/`ADMITTING`;
- queryability can be solved without second authority.

Why C loses:

- no current recovery/audit/failure class requires event-sourced current authority;
- `par.approval_request` already owns lifecycle truth;
- OBS already owns audit/history semantics;
- it introduces a second interpretation surface and machinery without consumer.

Global Maximum outcome:

```text
CURRENT STRUCTURE CONFIRMED
smallest sustainable state architecture = durable facts + derived projection
material reopen of 3C/3D/3E/3F = NONE
new architecture subsystem = NONE
```

---

## 22. Reopen triggers

Reopen 3G-01 only with material evidence such as:

```text
new approval consumer whose lifecycle cannot satisfy this exact one-decision/one-attempt model
real requirement for reusable/sticky approval
real availability split that makes PAR custody unavailable to required recovery
observed DB clock behavior invalidating guardNow assumptions
implementation evidence that guarded conditional mutation cannot enforce the approved race invariants
new product requirement requiring durable late-decision intent as domain authority
material recovery model requiring a different binding lifecycle
```

Style preference, desire for a generic FSM framework, or convenience querying are not reopen triggers.

---

## 23. Status after operator ratification

```text
3G = IN PROGRESS
3G-01 = APPROVED
3G remains open
Phase 3 remains open until C-018
```

The next 3G decision must be selected through the same Decision Loop from the remaining routed lifecycle work; this document does not pre-approve `3G-02` or any implementation.