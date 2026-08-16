# 3G — ChatGPT ↔ Fable Dialogue — Builder Work Unit & ActorRun Lifecycle

**Status:** WORKING DIALOGUE / NON-AUTHORITATIVE  
**Phase:** 3G — Behavioral / State Architecture  
**Candidate decision:** `3G-03 — Builder Work Unit & ActorRun Execution Lifecycle Architecture`  
**PR:** #40  
**Branch:** `agent/conexus-phase-3-system-design`  
**Starting HEAD:** `626b56dadcaa6275552b18e3f91dc8698755d0f9`  
**Important:** review/co-design only. This file is not authority, does not approve/create 3G-03, does not constitute C-018, and does not authorize implementation, merge or PR readiness.

---

## 0. Review protocol

1. Reconstruct authority from `AGENTS.md` and follow its read order.
2. Apply DevelopmentConexus Engineering Method v1.0.0 from `docs/engineering/standards/root-cause-global-maximum-method.md`.
3. Read at minimum, as applicable:
   - `docs/conexus/phase3/LEDGER.md`
   - `docs/conexus/phase3/3A-R5-builder-coding-runtime-reassessment.md`
   - `docs/conexus/phase3/3C-05-builder-module-boundary.md`
   - `docs/conexus/23-modelo-engenharia.md` (canonical C-017 source)
   - `docs/conexus/phase3/3D-R1-dependency-architecture-final-closure.md`
   - `docs/conexus/phase3/3E-01-hub-control-data-ownership-persistence-boundaries.md`
   - `docs/conexus/phase3/3E-02-module-durable-record-inventory-reference-closure.md`
   - `docs/conexus/phase3/3F-01-contract-surface-classification-versioning-boundary.md`
   - `docs/conexus/phase3/3F-02-boundary-payload-semantics-error-envelope-architecture.md`
   - `docs/conexus/phase3/3F-R1-contracts-api-architecture-final-closure.md`
   - `docs/conexus/phase3/3G-02-builder-change-finding-lifecycle-contract-revision-closure-architecture.md`
   - `docs/research/MITRA-INSPIRATION-MAP.md`
   - `docs/research/FACTORY-AI-HARNESS-REFERENCE-MAP.md`
4. Approved architecture is baseline, not dogma. Reopen only for a material Finding with a concrete failure class and globally superior correction.
5. Do not reopen for naming, symmetry, framework preference, or hypothetical optionality.
6. Fable acts as independent Senior/Staff/Principal Software Engineer + Software Architect and must reason down to durable facts, authority, concurrency, crash/restart, retries, effect ambiguity, evidence, proof and product realization.
7. Append numbered rounds; do not silently rewrite another actor's round.
8. ChatGPT↔Fable agreement is not operator approval.
9. YAGNI applies aggressively. No WorkUnit FSM, retry engine, queue, candidate service, workflow engine, scheduler, best-of-N arbitration, Mission/Milestone, universal delivery object or new durable record without a current failure class.
10. Mitra and Factory are evidence/reference, not authority or templates to copy.
11. Mastra Code / AgentController + Mastra Workspace + E2B remains the approved Builder realization under 3A-R5, but Mastra mechanics are not Builder domain authority. If an argument depends on current Mastra behavior, verify through Context7 `/mastra-ai/mastra` and applicable primary source/skill.
12. No `LEDGER.md` changes, no approved-authority changes and no product code while this dialogue remains unresolved.

---

# Round 1 — ChatGPT

## 1. Decision target

3G-03 should decide the minimum behavioral/state architecture necessary for:

```text
Work Unit as bounded work authority
ActorRun as one concrete execution attempt
ActorRun terminal disposition
same-Work-Unit retry admission
cancel semantics
produced candidate/result recovery
Work Unit delivery admission / delivery boundary
one active attempt per Work Unit in F1
relationship to Finding routes and Change authority
```

It should **not** decide:

```text
PlanningDepth × RigorProfile exact calculation             → later 3G / N3
Mastra exact AgentController/session APIs                  → 3H
sandbox pause/resume/recreate/reconnect                    → 3H/3M
network/process recovery mechanics                         → 3M
numeric retry/correction caps                              → calibration/eval
parallel Work Unit scheduling                              → Decision Loop on measured need
Finding routing                                            → already 3G-02
Change closure                                             → already 3G-02
Gateway effect_attempt complete lifecycle                  → later 3G
Release lifecycle                                          → later 3G
exact UI labels                                            → 3K
exact SQL/columns/indexes/ORM/lock primitive               → implementation
```

Candidate title:

> **3G-03 — Builder Work Unit & ActorRun Execution Lifecycle Architecture**

---

## 2. Authority already fixed before this dialogue

### 2.1 Minimal Sufficient Execution

3C-05/C-017 remain normative:

```text
1 Change
→ 1 Work Unit
→ 1 ActorRun
```

Additional Work Units/ActorRuns require concrete benefit or failure class; technical layer boundaries alone are not decomposition reasons.

Serial is the F1 default. Parallelism is not built merely because the model can imagine it.

### 2.2 Work Unit meaning

Work Unit is the internal bounded unit answering:

> What focused work may be executed within one exact Change authority context?

It is not a feature, user story, milestone, service, frontend/backend module or workflow step.

A Work Unit is linked to applicable correctness assertions, exact contract revision and applicable scope/pins/sets required by C-017.

### 2.3 ActorRun meaning

ActorRun is one durable concrete execution attempt of a Work Unit or applicable Builder role.

```text
ActorRun
!= CodingSession
!= E2B sandbox
!= Mastra run/session identity
```

Runtime/provider refs are correlation/mechanics, never product authority.

### 2.4 CodingSession continuity

3A-R5 freezes:

```text
Change lifetime
!= CodingSession lifetime
!= ActorRun lifetime
!= Sandbox lifetime
```

Default F1 uses one persistent coding session per Change. Later ActorRuns and later Work Units may continue the same CodingSession when safe; a new ActorRun or Work Unit does not automatically reset cognition.

Fresh sessions remain available on real triggers such as verifier independence, material semantic revision or cognitive-contamination risk.

### 2.5 3G-02 admission/serialization law

Every Builder authority mutation/admission whose result can change checkpoint, dispatch or closure admissibility serializes through one Change-owned root before commit.

This already includes bounded-work/Work Unit/ActorRun admission and budget reservation/consumption.

No transaction spans Mastra/E2B/external I/O.

### 2.6 Findings and routes

3G-02 freezes one durable Finding concept and routes:

```text
LOCAL_FIX
FIX_WORK_UNIT
REPLAN
HUMAN
```

Route is decreasing autonomous authority, not a work-size taxonomy.

`LOCAL_FIX` is only admissible before the producing bounded work crosses its delivery boundary. After delivery, corrective bounded work requires at least `FIX_WORK_UNIT`.

### 2.7 Effect safety remains Gateway authority

ActorRun execution semantics must not create a second idempotency/effect-attempt engine.

3F/C-017 already preserve:

```text
EFFECTFUL + SENT_NO_RESPONSE / OUTCOME_UNKNOWN
→ no blind automatic retry
→ reconcile/settle first
```

ActorRun failure cannot silently authorize repeating ambiguous effects.

### 2.8 Durable inventory

3E already has:

```text
bld.work_unit
bld.actor_run
bld.coding_session
```

plus Change/Finding/etc. No new durable record class is proposed.

---

## 3. Root cause and target invariants

### Root cause

Without explicit separation between bounded-work authority, concrete attempt, coding-session mechanics and accepted delivery, one of these failures becomes reachable:

```text
runtime self-report becomes work acceptance
technical retry becomes silent scope/contract change
crash loses which exact candidate was produced/judged
cancelled run later wins by late runtime output
same Work Unit accepts multiple competing deliveries
ActorRun retry becomes second external-effect retry authority
persistent CodingSession becomes implicit permission to keep changing delivered work
per-layer status explosion grows into workflow engine
```

### Target invariants

1. Work Unit means **authorized bounded work**, not attempt history.
2. ActorRun means **one concrete attempt**, not session lifetime.
3. Runtime completion/self-report never equals delivery acceptance.
4. A terminal ActorRun never reopens; another attempt is another ActorRun.
5. Work Unit admits at most one accepted delivery.
6. A durable produced result is not yet accepted delivery.
7. Crash after durable result capture can resume judgment of the same result without forcing a new ActorRun.
8. Same-WU retry is admitted only while the same bounded authority remains valid and safe.
9. Cancellation of ActorRun is not Work Unit abandonment or Change termination.
10. External-effect retry safety remains Gateway authority.
11. Delivery acceptance validates bounded-work legitimacy, not full Change correctness.
12. No Work Unit mega-FSM, retry engine, queue or generic workflow mechanism is needed for F1.

---

## 4. Alternatives

### Alternative A — explicit FSMs for Work Unit and ActorRun

Example:

```text
WorkUnit:
PENDING → READY → RUNNING → RETRYING → VERIFYING → BLOCKED → DONE

ActorRun:
QUEUED → STARTING → RUNNING → WAITING → FAILED → RETRYING → DONE
```

**Reject.**

Failure: duplicated/transitional state begins encoding orchestration mechanics rather than durable meaning; simultaneous conditions explode enum cardinality; it tends toward a workflow engine.

### Alternative B — Mastra/runtime state as lifecycle authority

```text
Mastra status/session
→ Work Unit/ActorRun status
```

**Reject.**

Runtime state is replaceable mechanics and cannot decide Conexus work authority, delivery, retry safety or bounded scope.

### Alternative C — bounded Work Unit facts + immutable ActorRun attempts + atomic delivery admission

**Recommended.**

```text
Work Unit
→ bounded authority + optional one acceptedDelivery

ActorRun
→ attempt identity + optional producedResultRef + optional terminal outcome

CodingSession
→ separate cognitive/runtime continuity
```

Persist load-bearing facts; derive current admissibility.

---

## 5. Work Unit structural semantics

### 5.1 Work Unit is bounded work authority

A Work Unit represents one exact admitted unit of work under an exact Change authority context.

Conceptually, it is tied to applicable facts such as:

```text
Change identity
contract revision / semantic authority identity
fulfills COR-* set
bounded scope / declared readSet/writeSet/effectSet
applicable authority/context pins
```

Exact columns are not frozen here.

### 5.2 Work Unit is not an attempt

A single Work Unit may legitimately have sequential ActorRuns:

```text
WU-01
├── A1 FAILED
├── A2 FAILED
└── A3 DELIVERED
```

provided the same bounded work remains current/admissible and retry safety/budget gates pass.

Therefore:

```text
new ActorRun
!= new Work Unit
```

### 5.3 Work Unit does not require a generic status FSM

Candidate minimum:

```text
acceptedDelivery = absent | exact accepted delivery identity
```

When absent, the unit has no accepted delivery. Whether another ActorRun may begin is derived from current Change/WU/route/budget/effect facts.

When present, the Work Unit has crossed its delivery boundary and may not accept another delivery.

No persisted default:

```text
PENDING | READY | RUNNING | RETRYING | WAITING | SUPERSEDED | BLOCKED | FAILED | DONE
```

unless review proves a current consumer/failure class requires a fact that cannot be derived.

### 5.4 Stale/superseded Work Unit does not need fan-out mutation by default

Example:

```text
WU-01 pins R1
acceptedDelivery absent
Change current authority moves to R2
```

WU-01 remains true historical bounded work under R1, but new ActorRun admission is no longer compatible.

No default need for:

```text
WU.status = SUPERSEDED
```

Compatibility/admissibility is derived from current authority/pins.

---

## 6. ActorRun structural semantics

### 6.1 One ActorRun = one concrete attempt

ActorRun is one execution episode admitted by Builder for one Work Unit.

It may correlate to Mastra/session/sandbox/runtime facts, but none of those identities substitute for ActorRun.

### 6.2 ActorRun never reopens

Once terminal:

```text
DELIVERED | FAILED | CANCELLED
```

it never transitions back to active/non-terminal.

Another attempt is a new ActorRun.

### 6.3 Minimal terminal dispositions

Candidate terminal family:

```text
DELIVERED
FAILED
CANCELLED
```

Meanings:

`DELIVERED`

> Builder admitted the exact produced result as this Work Unit's sole delivery.

`FAILED`

> The attempt ended without an accepted delivery.

This covers both:

```text
no recoverable produced result
```

and:

```text
produced result exists but delivery admission rejects it
```

with reason/evidence distinguishing failure cause.

`CANCELLED`

> Applicable authority deliberately terminated the attempt before accepted delivery.

Cancellation reason is not automatically Work Unit/Change termination.

### 6.4 Failure/cancel reasons are not lifecycle states

Examples such as:

```text
TIMEOUT
RUNTIME_LOST
TOOLING
OUTPUT_CONTRACT
SCOPE_RECONCILIATION
USER_INTERRUPT
AUTHORITY_WITHDRAWN
```

may later be typed reasons where consumers require them; they are not proposed as ActorRun states merely for taxonomy symmetry.

---

## 7. One active ActorRun per Work Unit in F1

Normative candidate:

```text
at most one non-terminal ActorRun per Work Unit
```

Reason:

- F1 has no accepted best-of-N consumer for the same Work Unit;
- concurrent same-WU attempts create duplicate cost, candidate arbitration, source conflicts, budget races and winner semantics;
- C-017 is serial by default.

This does not prohibit future parallelism across proven-independent Work Units if the Decision Loop later admits that consumer.

No `ExecutionScheduler` or queue follows from this law.

---

## 8. Produced result versus accepted delivery

### 8.1 Produced result is not delivery authority

An ActorRun may produce an exact candidate/result before Builder admits it.

Conceptually:

```text
producedResultRef = absent | exact durable result identity
```

Exact field name is not frozen.

Possible condition:

```text
producedResultRef present
terminal absent
```

means the exact result is preserved and awaits/re-enters Builder judgment; it does not require a persisted `WAITING_ADMISSION` status.

### 8.2 Produced result must be durably resolvable before it is recorded as produced

Builder must not durably record a result identity whose underlying result disappears with a sandbox/session crash.

The result may be recoverable through the correct typed mechanism, for example:

```text
Git/CAS/quarantined bundle
Evidence refs
Gateway receipts
no-mutation proof
```

according to work class.

No requirement that every result be a ZIP or one universal payload.

### 8.3 No UniversalDelivery / Candidate entity

3G-03 freezes only:

> one exact typed result identity may be produced by an ActorRun and one exact typed delivery identity may be admitted by its Work Unit.

It does not create:

```text
UniversalWorkUnitResult
Candidate record
CandidateService
DeliveryQueue
DeliveryRegistry
```

---

## 9. Crash/recovery of candidate judgment

### 9.1 Crash after result identity is durable, before delivery admission

Example:

```text
A1 producedResultRef = X
terminal outcome absent
Hub crashes
```

After restart:

```text
recover X
→ rerun/recover Builder delivery judgment over X
→ same ActorRun
```

This is recovery of the same produced result, not a new execution attempt.

The system should not create A2 merely because the Hub restarted.

### 9.2 Crash before durable result identity exists

If runtime produced something but Builder has no durable recoverable result identity and 3H/3M cannot recover it truthfully:

```text
-X-> invent delivered/result fact
```

The attempt may later terminate `FAILED`; a new ActorRun may be admitted if same-WU retry gates pass.

The architecture does not add a distributed transaction across Mastra/E2B/CAS/Postgres solely to eliminate this bounded loss window.

### 9.3 Recovery is not retry

Repeated evaluation/admission of the same exact durable result is recovery.

```text
same result X
+ same ActorRun A1
→ repeat/continue judgment
```

A new ActorRun means a new execution attempt, not a replay of Builder admission logic.

---

## 10. Work Unit delivery acceptance

### 10.1 Delivery acceptance answers a bounded question

Work Unit delivery admission asks:

> Is this exact result a legitimate delivery of the bounded work authority this Work Unit received?

It does **not** ask:

> Is the entire Change now proven correct?

The latter remains Change-level validation/closure under 3G-02.

### 10.2 Minimum semantic delivery checks

Delivery admission must establish, as applicable:

1. **exact identity**
   - Work Unit, ActorRun, contract/context pins, exact produced result;
2. **durable recoverability**
   - accepted result remains resolvable after Hub/runtime/sandbox restart/loss according to its type;
3. **bounded-authority reconciliation**
   - actual work/read/write/effect scope does not exceed admitted Work Unit authority;
4. **delivery-local required checks**
   - output/envelope/commit/bundle/effect/no-op proof and mechanical checks necessary to admit this bounded delivery are satisfied.

This does not require blindly rerunning the full Change validation stack at every Work Unit boundary.

### 10.3 Reuse proof, do not duplicate proof

Evidence produced during Work Unit execution/delivery may later support Change closure when it remains compatible under 3G-02's full execution-context compatibility law.

```text
WU evidence E
→ still compatible at Change proof
→ Change may consume E
```

Layer transition alone is not reason to re-run the same proof.

### 10.4 Typed delivery shapes

Different work classes may have different exact delivery identities:

```text
code mutation
→ canonical commit/tree/bundle identity + applicable Evidence

verification no-op
→ no-mutation proof + oracle Evidence

effectful/no-source work
→ Gateway receipts/effect Evidence
```

C-017's commit matrix remains authority. 3G-03 does not flatten these into one universal schema.

---

## 11. Atomic delivery boundary

The Work Unit crosses its delivery boundary only when Builder atomically admits one exact result as the Work Unit's sole delivery and terminalizes its producer ActorRun as `DELIVERED`.

Semantic property:

```text
ActorRun A → DELIVERED
+
WorkUnit W → acceptedDelivery = exact X from A

commit atomically inside Builder
```

Impossible stable states:

```text
A = DELIVERED but W has no matching acceptedDelivery

W acceptedDelivery = A/X but A is not DELIVERED

W has more than one acceptedDelivery
```

Both records are Builder-owned; no new cross-owner atomicity class is created.

The exact SQL/locking implementation remains unfrozen.

---

## 12. Delivery rejection

A produced result can remain a true historical result while failing delivery admission.

Example:

```text
A1 produced X
actual writeSet exceeds WU authority
→ X exists as candidate/history/quarantine
→ delivery refused
→ A1 FAILED
→ WU acceptedDelivery absent
```

Next action is decided from current authority:

```text
same-WU new ActorRun
or Finding route
or replan/new bounded work
or human
```

Runtime self-report `done` cannot override a rejected delivery.

---

## 13. LOCAL_FIX and the delivery boundary

Before Work Unit has accepted delivery:

```text
bounded authority still open for delivery
```

A tactical/local correction may remain inside current work authority when 3G-02 route rules permit.

After:

```text
acceptedDelivery present
```

the Work Unit is delivered.

Correction discovered after that boundary requires new bounded work, at least `FIX_WORK_UNIT`; an alive CodingSession does not authorize more mutation of the delivered Work Unit.

The exact physical delivery mechanism (`SHARE`, bundle handoff, commit operation, etc.) remains implementation/3H detail; authority boundary is Builder admission.

---

## 14. Same-Work-Unit retry admission

### 14.1 FAILED does not imply retry

A terminal `FAILED` ActorRun is evidence that one attempt ended without accepted delivery. It does not itself authorize A2.

A new ActorRun for the same WU is admissible only when current facts still permit the same bounded work.

Conceptually, gates include at least:

```text
Work Unit acceptedDelivery absent
Change still open/current for this bounded work
WU pins compatible with current approved Change authority
no other active ActorRun for WU
applicable budget available
Finding/current route does not require different work/replan/human first
prior external-effect state permits safe new execution
other inherited dispatch gates from C-017/3G-02 still pass
```

No persisted generic `retryable` flag is required as second authority.

### 14.2 Operational failure may retry same WU

Examples:

```text
sandbox/runtime loss before recoverable candidate
transient local/tooling failure
interrupt with same work still desired
```

may admit another ActorRun without creating a new Work Unit when all gates remain valid.

### 14.3 Semantic change is not retry

If:

```text
contract changed
scope meaning changed
required bounded work changed
Finding requires FIX_WORK_UNIT / REPLAN / HUMAN
```

then a new same-WU ActorRun is not a legal way to continue. The appropriate new bounded work/revision/decision path must occur.

Retry cannot hide semantic drift.

---

## 15. External-effect retry safety

ActorRun terminal failure never independently authorizes repeating prior effectful actions.

If a prior execution reached effect ambiguity such as:

```text
SENT_NO_RESPONSE
OUTCOME_UNKNOWN
```

then new execution must remain blocked from blindly repeating that effect until Gateway/effect-attempt authority permits safe continuation after reconciliation/settlement.

This keeps responsibilities distinct:

```text
ActorRun
→ execution attempt

Gateway effect_attempt
→ effect admission/idempotency/outcome safety
```

3G-03 does not invent its own effect retry ledger.

---

## 16. ActorRun cancellation semantics

### 16.1 Cancel ActorRun != abandon Work Unit != terminate Change

`CANCELLED` means that attempt was deliberately terminated by applicable authority before accepted delivery.

It does not automatically mean:

```text
Work Unit cancelled
Change rejected
no future ActorRun
```

A future same-WU attempt may be admissible if current authority says the work still stands.

If the user's intent is "do not do this work anymore", authority above ActorRun must change accordingly (Change decision/revision/route/etc.).

### 16.2 Cancel versus late runtime output

Race:

```text
T1 cancellation terminalizes A1
T2 runtime completes and returns X
```

If `CANCELLED` wins terminal authority first:

```text
late X cannot turn A1 into DELIVERED
```

It may exist as non-authoritative/quarantined output if retained, but it cannot become Work Unit delivery from that cancelled ActorRun.

Conversely, if atomic delivery wins first:

```text
A1 DELIVERED + W.acceptedDelivery X
```

late cancellation cannot rewrite A1 to CANCELLED.

Terminal ActorRun disposition is write-once.

---

## 17. Delivery/candidate concurrency

### 17.1 One Work Unit accepts exactly zero or one delivery

Even under bugs/recovery races, delivery admission must enforce:

```text
acceptedDelivery absent → one winner may set it
acceptedDelivery present → later candidate cannot replace/append
```

No winner arbitration/best-of-N/merge-candidate mechanism is introduced.

### 17.2 Two active ActorRuns should already be structurally refused

The one-active-run-per-WU law makes competing candidates exceptional rather than normal. The delivery guard remains fail-closed as defense in depth.

---

## 18. Budget semantics

### 18.1 Per-attempt and aggregate limits remain distinct

ActorRun may carry/use bounded attempt budget such as time/tokens/cost.

Work Unit/Change correction budgets bound repeated attempts/fixes across attempts.

Exact numeric caps are calibration, not architecture law.

### 18.2 Exhaustion blocks new automatic attempts; it does not auto-terminalize WU/Change

If budget is exhausted:

```text
new same-WU ActorRun inadmissible
```

but 3G-02 remains authority:

```text
-X-> automatically close Change BLOCKED
```

Operator/applicable authority may increase budget, re-scope, escalate or close honestly.

No retry scheduler is needed.

---

## 19. Relationship to CodingSession/Mastra

Normal shape:

```text
Change C184
└── CodingSession CS184
    ├── WU-01
    │   ├── A1 FAILED
    │   └── A2 DELIVERED
    └── WU-02
        └── A3 DELIVERED
```

The same coding session may support multiple attempts and multiple Work Units within the same Change when safe.

Therefore:

```text
new ActorRun
-X-> mandatory new Mastra session

new Work Unit
-X-> mandatory new Mastra session
```

Mastra may provide run/interrupt/session/workspace mechanics, but it does not decide:

```text
same-WU retry admissibility
acceptedDelivery
Work Unit delivery boundary
ActorRun terminal authority
external-effect retry safety
```

Those remain Conexus/owner authority.

---

## 20. Product-shape law

Internal lifecycle rigor must not leak as mandatory user ceremony.

A normal surface can remain:

```text
Construindo…
Tentativa interrompida. Retomando com segurança…
Validando entrega…
Corrigindo um problema detectado…
Pronto.
```

Technical/audit drill-down may expose WU/ActorRun/result refs/recovery facts when useful.

This preserves Mitra-like product simplicity while retaining Factory-like bounded correction/independent validation principles without copying Missions ontology.

---

## 21. Concrete examples

### Example A — simple successful execution

```text
Change C184
→ WU-01
→ A1
→ Mastra produces X
→ X durable
→ delivery-local checks pass
→ atomic: A1 DELIVERED + WU-01 acceptedDelivery X
→ Change-level proof later decides correctness
```

### Example B — sandbox loss, same work

```text
WU-01
→ A1 runtime lost before recoverable result
→ A1 FAILED
→ WU still current, budget/effects safe
→ A2 admitted
→ same CodingSession may continue if runtime realization allows
```

No new Work Unit is required merely for technical retry.

### Example C — produced result survives Hub crash

```text
A1 producedResultRef X
→ Hub crashes before delivery admission
→ restart
→ same X re-evaluated for same A1
→ no A2 merely because Hub restarted
```

### Example D — candidate exceeds scope

```text
WU authority writeSet = dashboard/*
A1 candidate X also changes auth/*
→ delivery refused
→ A1 FAILED
→ WU no delivery
→ Finding/route or same-WU retry according to current facts
```

### Example E — verifier finds bug after delivery

```text
WU-01 accepted X
→ independent validation finds COR-003 gap
→ Finding F77 = FIX_WORK_UNIT
→ WU-02
→ A2/A3 as applicable
```

Do not mutate delivered WU-01 just because CodingSession is still alive.

### Example F — contract changes during attempt

```text
A1 runs under R1
→ Change moves to material R2/checkpoint path
→ A1 output under R1 cannot gain authority for R2 merely by completing
```

Interrupt/cancel/drain mechanics stay later 3G/3H/3M; compatibility law is already 3G-02.

### Example G — ambiguous external effect

```text
A1 sends effectful request
→ connection lost
→ Gateway effect state OUTCOME_UNKNOWN
→ A1 FAILED
→ same-WU A2 cannot blindly repeat effect
→ Gateway reconciliation/settlement authority first
```

### Example H — cancel race

```text
cancel commits first
→ A1 CANCELLED
→ late runtime success/result cannot become delivery

or

delivery commits first
→ A1 DELIVERED + WU delivery
→ late cancel cannot rewrite terminal history
```

---

## 22. Candidate proof obligations

Before implementation could conform to this candidate, proof should falsify at least:

1. runtime/model says success but Builder rejects candidate → no DELIVERED;
2. ActorRun terminal then retry attempts to reopen same ActorRun → refused;
3. A1 FAILED from transient runtime loss, all same-WU gates valid → A2 can be admitted without WU-02;
4. Work Unit pins stale/current authority changed → same-WU A2 refused;
5. one active ActorRun exists for WU → concurrent A2 admission refused;
6. A1 produced durable X, Hub crashes before delivery → restart judges same X/A1, no forced A2;
7. runtime produced X but no durable recoverable identity exists after crash → system cannot invent delivery;
8. candidate result ref points to non-resolvable/transient-only bytes → produced-result admission refused;
9. candidate exceeds declared bounded authority → delivery refused;
10. Work Unit acceptedDelivery present → later ActorRun admission refused;
11. two candidate deliveries race → exactly one delivery can commit;
12. ActorRun DELIVERED and WorkUnit acceptedDelivery are atomic; neither half-state can persist;
13. cancelled ActorRun receives late runtime success/candidate → cannot become delivered;
14. delivered ActorRun receives late cancel → cannot become cancelled;
15. FAILED with OUTCOME_UNKNOWN effect → blind effect retry/new attempt path blocked by Gateway authority;
16. produced result accepted as WU delivery but Change verifier later finds gap → WU delivery remains historical truth, Change not falsely accepted;
17. WU-level Evidence compatible at Change proof → may be reused without layer-driven rerun;
18. WU under old contract/current semantic revision moved → no fan-out `SUPERSEDED` status required for correctness;
19. correction after accepted delivery → same WU mutation/ActorRun refused; new bounded work required;
20. budget exhausted → new automatic ActorRun refused; WU/Change not auto-terminalized;
21. cancellation of ActorRun alone → does not implicitly reject Change or permanently abandon WU;
22. session remains alive after WU delivery → cannot use session liveness as authority to mutate delivered WU.

Controls must be shown firing, not merely happy-path tested.

---

## 23. YAGNI / anti-overengineering audit

Candidate adds:

```text
new durable record class   0
new Tier-2 FK              0
new subsystem              0
new cross-owner atomicity  0
new public code            0
new queue/scheduler        0
```

Explicitly reject/defer in F1:

```text
WorkUnitStatus mega-enum/FSM
ActorRun workflow state graph beyond required terminal facts
RetryEngine
retry queue/scheduler
Candidate record/service/registry
DeliveryQueue
UniversalDelivery/UniversalWorkResult
best-of-N candidate arbitration for same WU
parallel same-WU ActorRuns
Mission/Milestone
workflow/pipeline DSL
distributed transaction across Mastra/E2B/CAS/Postgres
persistent generic retryable flag as second authority
fixed retry count as architecture law
status fan-out on contract revision change
session liveness as work authority
ActorRun-owned idempotency/effect retry engine
full Change validation rerun at every WU boundary by default
```

---

## 24. Strongest argument against this proposal

The most credible objection is that:

```text
WorkUnit.acceptedDelivery
+
ActorRun.producedResultRef
+
ActorRun terminal DELIVERED|FAILED|CANCELLED
```

may still be too small to represent crash/recovery or delivery-in-progress truth, and that an explicit intermediate state such as `RESULT_READY`/`DELIVERY_PENDING` may be necessary.

My response is provisional:

- if producedResultRef exists and terminal is absent, the intermediate condition is already exactly derivable;
- adding another mutable status would duplicate those facts unless a consumer needs a fact that cannot be recovered from them;
- Fable should attack this aggressively with crash and concurrency schedules.

Second credible objection: `DELIVERED` may be misnamed if it means Hub-admitted bounded delivery rather than runtime delivery. Naming is non-authoritative; Fable should challenge the semantic partition, not just the word.

Third: Work Unit may genuinely need a terminal non-delivery disposition for operational UX/audit/recovery. Fable should produce a consumer that cannot derive the needed condition from current Change/WU/ActorRun/route facts before adding one.

---

## 25. Falsification questions for Fable

### A. Scope / decomposition

1. Are Work Unit + ActorRun correctly scoped together, or does one hide a material dependency on later decisions?
2. Is `1 Change → 1 WU → 1 ActorRun` still the correct minimal execution baseline under persistent Mastra CodingSession?
3. Does any surviving rule accidentally recreate Factory Missions semantics or workflow machinery?

### B. Work Unit facts

4. Is `bounded authority + optional acceptedDelivery` sufficient current durable meaning for WU?
5. Construct a current F1 consumer that requires `WU FAILED/BLOCKED/CANCELLED/SUPERSEDED/DONE` as durable fact rather than derived condition.
6. Can a delivered WU ever legitimately need a second delivery without actually being new bounded work?
7. Is one active ActorRun per WU too restrictive for a current consumer, or correct YAGNI?

### C. ActorRun terminal semantics

8. Are `DELIVERED | FAILED | CANCELLED` semantically sufficient and mutually exclusive?
9. Is there a fourth terminal disposition with distinct downstream behavior that cannot be represented by failure/cancel reason plus current authority?
10. Does `FAILED` improperly collapse runtime failure and delivery rejection in a way a current consumer cannot recover from?
11. Should runtime completion be persisted separately from producedResultRef/terminal outcome, or is that implementation telemetry?

### D. Candidate/result durability and crash recovery

12. Find a crash schedule where `producedResultRef present + terminal absent` cannot recover correct meaning without another durable state.
13. Is “result identity must be durably resolvable before producedResultRef is authoritative” implementable without inventing a candidate subsystem?
14. What exact owner should hold result identity for code/no-op/effectful work while preserving 3E ownership and no universal result object?
15. Does recovery of the same candidate after Hub crash ever need a new ActorRun for authority/audit reasons?
16. Can runtime/session recovery produce a result after restart that is not byte/identity-equivalent to the originally presented result, and how must Builder guard it?

### E. Delivery admission / atomicity

17. Is atomic `ActorRun DELIVERED + WorkUnit acceptedDelivery` the correct minimum?
18. Does delivery admission need to create/admit another durable fact not already in 3E?
19. Can delivery-local checks be kept distinct from full Change correctness without creating false positives or duplicated proof?
20. Is “accepted delivery can later be found incorrect at Change level” semantically honest, or should DELIVERED imply stronger correctness?
21. Can the delivery boundary race with a concurrent Change revision/Finding/closure in a way 3G-02's per-Change serialization does not close?

### F. Retry semantics

22. Is same-WU retry correctly derived from current facts instead of persisted retryable state?
23. Construct a retry case where same intent/contract/scope still holds but a new Work Unit is nevertheless required.
24. Construct a case where ActorRun FAILED but retry must never happen even though no Finding exists.
25. Does budget reservation/consumption need ActorRun-specific additional concurrency law beyond 3G-02 serialization?
26. Could a transient failure happen after an irreversible local/source mutation but before candidate preservation, making “same WU retry” unsafe without more facts?

### G. Cancel / authority races

27. Does CANCELLED need a durable cancellation-request/intent fact before terminal outcome, especially if interruption is asynchronous?
28. Can a cancellation request race with delivery in a way write-once terminal facts alone are insufficient?
29. If user wants “stop this run but preserve partial work”, does the candidate represent that without new state?
30. If user wants “stop this work entirely”, is changing Change/WU-level authority rather than ActorRun cancellation sufficient and product-realistic?

### H. External effects

31. Does deferring effect replay safety to Gateway fully prevent ActorRun from becoming a second idempotency authority?
32. Is there any actor-run retry decision that must consume Gateway effect state atomically with new ActorRun admission?
33. Could a new ActorRun perform safe non-effectful work while one prior effect remains OUTCOME_UNKNOWN, or does the current gate over-block? If selective continuation is needed, does that belong here or later to Work Unit/effect-set decomposition?

### I. Mastra/product alignment

34. Does persistent CodingSession create any hidden reason why ActorRun should map 1:1 to Mastra run/turn? If current Mastra behavior matters, verify it.
35. Can the proposed semantics be realized cleanly using Mastra Code/AgentController + Workspace/E2B without wrapping Mastra in a second orchestration engine?
36. Does the product surface remain simple, or will the internal distinction result/candidate/delivery leak into mandatory UX?
37. What should Mitra/Factory teach us here, and what must explicitly not be copied?

### J. Global Maximum / YAGNI

38. Which candidate rule is most deletable while preserving every named failure class?
39. Which candidate rule is actually hidden implementation detail and should be demoted?
40. Which missing C-017/3G-02 invariant did ChatGPT accidentally drop?
41. Is there any new durable record, state, engine or abstraction that current evidence actually requires?
42. Strongest argument against `WorkUnit no FSM + ActorRun three terminals + producedResultRef + acceptedDelivery`.
43. Final recommendation: current structure confirmed / restructure now / split prerequisite / defer safely.
44. State whether candidate is ready for operator review or requires another consolidation round.

For every material finding use:

```text
claim challenged
counterexample / failure class
authority affected
smallest correction
reopen required? yes/no
later owner if deferred
```

Do not modify earlier rounds, `LEDGER.md`, approved authority or product code. Commit/push only this dialogue file.
