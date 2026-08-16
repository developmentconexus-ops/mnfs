# 3G — ChatGPT ↔ Fable Package — Remaining Behavioral / State Architecture

**Status:** WORKING PACKAGE / NON-AUTHORITATIVE  
**Phase:** 3G — Behavioral / State Architecture  
**Candidate decisions:** `3G-04` .. `3G-08` + `3G-R1` closure review  
**PR:** #40  
**Branch:** `agent/conexus-phase-3-system-design`  
**Starting HEAD:** `31a6b1822b0a1d90e542dcf5e6b010b090e7c2cf`  
**Important:** this package is review/co-design input only. It does not approve any candidate decision, does not close 3G, does not constitute C-018, and does not authorize implementation, merge or PR readiness.

---

## 0. Protocol and authority

1. Reconstruct authority from `AGENTS.md` and follow its exact read chain.
2. Apply DevelopmentConexus Engineering Method v1.0.0 from `docs/engineering/standards/root-cause-global-maximum-method.md`.
3. Current Phase-3 navigation authority is `docs/conexus/phase3/LEDGER.md`.
4. Approved 3G authority already frozen:
   - `3G-01` — ApprovalRequest lifecycle;
   - `3G-02` — Change/Finding/contract/closure;
   - `3G-03` — Work Unit/ActorRun execution lifecycle.
5. Dialogue/review files remain non-authoritative until ratified into an approved decision.
6. Authority freezes execution, not inquiry. Reopen an approved decision only for a material failure class, not symmetry, naming or framework preference.
7. Mechanism != Authority. Mastra, E2B, Postgres, CAS, schedulers and runtime checkpoints may realize semantics but never gain product/domain authority by convenience.
8. No universal lifecycle/state framework. Each owner keeps its own meaning.
9. YAGNI is aggressive but cannot remove a known correctness, authority, recovery, audit or external-effect invariant.
10. Mitra and Factory are evidence/reference. Never copy their ontology/mechanisms merely because they exist.
11. This package makes no new claim about current Mastra APIs. Substrate realization remains 3H/3L; Context7 is required only if a review argument actually depends on current Mastra behavior.
12. No `LEDGER.md`, accepted authority or product-code changes while this package is unresolved.

---

# 1. Sweep result — what remains in 3G

The current ledger routes these material behavioral/state questions to later 3G:

```text
N3 — Planning Depth × RigorProfile
semantic effect of approval expiry on suspended AgentRun
Gateway effect_attempt complete lifecycle + budget/idempotency guarded state
binding / Project mutation lifecycle
AgentRun in-flight × stricter/new Release
archived Project with active Release
DEDICATED old-vs-new Release admissibility window
Release-side placement of context-pinned change_acceptance admissibility
```

The following are **not** new 3G decisions unless this review proves otherwise:

```text
Mastra ActorRun/CodingSession/Workspace/E2B realization       → 3H
runtime heartbeat/reconnect/orphan detection                   → 3H/3M
security/approver/revocation/trust mechanisms                   → 3I
physical deployment/serving topology                           → 3J
product labels/progress/status projection                       → 3K
OUTCOME_UNKNOWN settlement/custody/crash-repair mechanics      → 3M
exact SQL/columns/indexes/ORM                                   → implementation
numeric budgets/timeouts/retry caps                             → calibration/eval
async status materialization solely for query/UI convenience    → 3H/3K/implementation unless authority consumer appears
```

The smallest coherent partition is five owner-centered decisions plus one Global Coherence Review:

```text
3G-04  Planning Depth & Rigor Composition
3G-05  Production AgentRun / Approval / Trigger Continuation
3G-06  Gateway EffectAttempt / Idempotency / Budget State
3G-07  Project Lifecycle & Binding Mutation
3G-08  Release / Promotion / Runtime Admissibility
3G-R1  3G global coherence and closure
```

Why not fewer documents:

- PAR and Gateway own different state and must not share one effect/agent FSM;
- Project intent/archive must not become serving authority;
- Release/Promotion is a durable recovery domain already independent in 3C-11/C-014;
- Planning/Rigor is a shared decision primitive, not lifecycle of any one runtime owner.

Why not more documents: each candidate below resolves one current owner/failure cluster completely enough to avoid another microdecision loop.

---

# 2. Cross-package invariants

These laws apply across the five candidates without creating a universal framework.

```text
owner-local durable facts > duplicated status
current mutable intent != pinned runtime composition
newer != automatically invalidating older
external-effect ambiguity != generic execution failure
terminal history is not rewritten to make recovery look clean
runtime absence/self-report never creates domain truth
consumer-time admissibility can change without mutating immutable historical proof
no external I/O inside authority transactions
all authority mutations use owner-local guards/CAS appropriate to their concurrency risk
```

Product law:

```text
rigor underneath
simple surface above
```

Internal state names are not automatically public/wire vocabulary.

---

# 3. Candidate 3G-04 — Planning Depth & Rigor Composition Architecture

## 3.1 Root cause

C-017 and 3C-05 intentionally created two dimensions:

```text
PlanningDepth = DIRECT | LIGHT | FULL
RigorProfile  = FAST | BOUNDED | CONTROLLED
```

The unresolved risk is accidental coupling:

```text
small plan => weak proof
or
high-risk change => giant plan
or
9-cell policy matrix that becomes a second workflow engine
```

The target invariant is:

> Planning depth answers how much explicit understanding/decomposition is required; rigor answers how much execution/verification control is required. Neither axis may silently lower the other.

## 3.2 Decision

The axes remain orthogonal and compose by independent floors.

### PlanningDepth

`PlanningDepth` is a Change-level planning requirement, not a Work Unit FSM and not a risk score.

Semantics:

```text
DIRECT
→ correctness can be fixed/checkpointed and one coherent bounded Work Unit can be admitted
  without a separate ordered Plan artifact

LIGHT
→ an explicit concise Plan/decomposition is required to make dependencies, ordering,
  handoffs or multiple bounded Work Units unambiguous, while architecture/authority
  remains inside accepted boundaries

FULL
→ safe decomposition itself depends on resolving material architecture/authority/boundary,
  competing structural alternatives, or discovery whose result changes the approved Plan;
  the explicit Plan is authority-bearing contract identity before dispatch
```

These are semantic thresholds, not file-count/LOC thresholds.

Examples that **do not** force deeper planning by themselves:

```text
frontend + backend folders
many changed files
high token count
CONTROLLED rigor
migration presence when the migration design is already fully known and bounded
```

A tiny permission change may legitimately be:

```text
DIRECT + CONTROLLED
```

A large but read-only refactor may legitimately be:

```text
FULL + BOUNDED
```

### Planning admission / evolution

- system/operator may elevate PlanningDepth;
- agent/runtime cannot silently lower an approved floor;
- a material change that makes an explicit Plan newly required is a semantic contract/plan revision under 3G-02 and requires the applicable checkpoint before new dispatch;
- an already-approved Plan is not erased merely because later discovery suggests a smaller plan would have sufficed;
- future revision may simplify planning only through normal approved revision semantics, never by in-place runtime downgrade.

No `PlanningEngine`, `PlanStateMachine` or persisted universal planning status is introduced.

## 3.3 RigorProfile

C-017 remains authority:

```text
FAST < BOUNDED < CONTROLLED
```

Per Work Unit floor:

```text
max(
  declared effects/authority risk,
  mechanically detected diff/artifact signals,
  target-environment risk
)
```

Unknown never reduces rigor.

The exact signal table remains the C-017 table plus future evidence-based amendments; 3G-04 does not create a second classifier.

Recalculation points remain:

```text
Work Unit / ActorRun dispatch
Change closure
Release composition
```

A higher recalculated floor invalidates insufficient proof; it does not rewrite historical ActorRuns/Evidence.

System/operator may elevate; agent may never lower below derived floor.

## 3.4 Composition law

PlanningDepth controls **pre-execution understanding/decomposition/checkpoint material**.

RigorProfile controls **execution, isolation, evidence and verification strength**.

No 3×3 workflow matrix is authoritative.

Conceptually:

```text
planning gate passes
AND
rigor gate passes
→ dispatch may proceed if all other 3G-02/03 gates pass
```

At Release composition, Release consumes the recalculated rigor floor of the exact composition. If the composition's required floor exceeds the proof that supported its `change_acceptance`, composition is not eligible until directed revalidation produces admissible proof. Historical Change/acceptance remains immutable.

## 3.5 Product surface

The user may see:

```text
compact approval
or
expanded plan/review
```

They do not need to understand the two internal axes.

## 3.6 Proof obligations

1. `DIRECT + CONTROLLED` is representable without forcing a full Plan.
2. `FULL + BOUNDED` is representable without manufacturing CONTROLLED gates.
3. agent attempts to lower either applicable floor → refused.
4. risk signal discovered after WU execution raises closure floor → insufficient Evidence cannot close Change.
5. Release composition discovers a higher floor → stale/insufficient acceptance cannot compose until revalidated.
6. PlanningDepth increase that makes Plan mandatory → new dispatch blocked until revision/checkpoint.
7. no 9-cell state/policy matrix is required for any above control.

## 3.7 YAGNI

Do not build:

```text
PlanningEngine
RigorModule beyond the already-approved shared pure evaluation primitive
9-cell workflow matrix
LOC/file-count risk scoring
LLM-only risk classifier
persistent mutable "current rigor status" fan-out
automatic plan simplifier
```

## 3.8 Reopen triggers

- measured consumer proves the two axes are not independent enough to decide a real gate;
- current risk class cannot be represented by C-017 floor semantics;
- implementation evidence shows late rigor escalation cannot be handled by directed revalidation without duplicate authority.

---

# 4. Candidate 3G-05 — Production AgentRun, Approval Continuation & Trigger Architecture

## 4.1 Root cause

3C-10 froze:

```text
AgentRun = concrete production-agent execution under exact composition
Mastra = runtime/checkpoint/suspend/resume mechanics
Conexus = domain authority
```

3G-01 froze ApprovalRequest independently but deliberately deferred the semantic reaction of a suspended AgentRun when approval is denied, expires or becomes stale.

The failure classes are:

- Mastra checkpoint becoming resume authority;
- newer Release silently mutating an in-flight run;
- approval expiry leaving a run suspended forever at the semantic layer;
- run cancellation leaving an approved request executable;
- trigger disable racing run admission.

## 4.2 AgentRun durable semantic core

AgentRun remains a separate PAR-owned graph from Builder ActorRun.

It pins at admission:

```text
Project / Agent identity
exact ReleaseRef / Release-pinned agent+model+tool+policy composition
conversation or trigger origin as applicable
caller/authority context appropriate to the surface
runtime kind/version + opaque runtime run/checkpoint correlation refs
correlation/evidence identity
```

No mutable-current Project binding lookup occurs after pinning.

High-level terminal partition:

```text
COMPLETED
FAILED
CANCELLED
```

Terminal meaning is owner-local, write-once and not a public failure taxonomy.

`COMPLETED` means the production AgentRun finished its agent execution normally enough to produce its final run output/receipts; it does **not** mean every external effect succeeded. Effect outcomes remain Gateway facts and may include `PARTIAL`/`OUTCOME_UNKNOWN`.

`FAILED` means the run cannot continue/complete under its current execution episode because of a run-level/runtime/domain failure.

`CANCELLED` means applicable authority deliberately ended the run.

No fourth terminal for `AWAITING_APPROVAL`, `OUTCOME_UNKNOWN`, `STALE_RELEASE` or `SUSPENDED` is justified.

## 4.3 Suspension is mechanics unless a Conexus authority fact depends on it

A non-terminal AgentRun may have no live model/process while Mastra holds a durable checkpoint. Process absence is not `FAILED` by itself.

F1 does **not** duplicate every Mastra workflow step/checkpoint into PAR state.

For approval-gated effects, the load-bearing Conexus fact already exists as `ApprovalRequest`, correlated to the AgentRun. Therefore no separate `AgentRun.status = AWAITING_APPROVAL` authority is required.

Other time/event/input suspension mechanics remain in `mastra_par` unless a future Conexus business decision requires a new domain fact. Resumption still flows through PAR and never occurs merely because Mastra says a checkpoint is resumable.

## 4.4 Approval wait / resume semantics

When an effect proposal needs human approval:

```text
AgentRun non-terminal
→ exact ApprovalRequest created/sealed
→ runtime may suspend
```

The ApprovalRequest remains the authority described by 3F-03/3G-01.

### Human ALLOW_ONCE

If the request remains claimable and the originating AgentRun remains non-terminal/current for that proposal:

```text
PAR resumes/continues the same AgentRun
→ Gateway FIRST_CLAIM/admission for exact subject
→ effect attempt proceeds under 3G-06
→ structured result/receipt returns to the run
```

Approval does not itself execute the effect.

### DENY / EXPIRED / STALE

These do **not** automatically terminalize AgentRun.

PAR resumes/continues the same AgentRun with a typed non-effect outcome equivalent to:

```text
approved effect was not executed
reason = denied | expired | stale
```

The agent may then:

```text
explain
choose a safe alternative
ask for changed input
finish without the effect
or produce a genuinely new exact effect proposal that, if approval-required, creates a new ApprovalRequest
```

No automatic re-approval/reseal of the old request.

Expiry itself remains silent request authority as in 3G-01; wake/timer mechanics that cause the suspended runtime to observe expiry belong to 3H.

## 4.5 Origin-run terminal guard

An ApprovalRequest may remain historically decisionable/approved according to its own 3G-01 projection even if its origin run later terminates. That historical fact does not grant execution.

PAR's agent-origin decision/claim surface must additionally require:

```text
origin AgentRun remains non-terminal
AND
request still belongs to the current pending proposal of that run
```

If not:

```text
decision/claim request is refused at the agent-origin consumer boundary
ApprovalRequest historical facts are not rewritten
```

This is owner-local PAR lifecycle enforcement, not a new B2 pin, not a new STALE cause and not a reopen of 3G-01/3F-03.

Consequences:

```text
AgentRun CANCELLED
→ unbound approval from that run can never later execute
```

and stale UI/double-submit cannot resurrect an effect.

## 4.6 New Release while run is in flight

At AgentRun admission:

```text
resolve current active Release
→ pin exact Release/composition
```

After admission:

```text
new active Release
-X-> mutate existing AgentRun composition
```

Existing run may continue under its pinned Release while that Release remains interpretable/supported and no independent current owner authority revokes/narrows a capability.

Last-mile current security/health/authorization still applies at Gateway/owners. A pin is compatibility identity, not irrevocable permission.

New AgentRuns resolve the then-current active Release.

Runtime-substrate upgrade follows the same rule from 3C-10:

```text
old in-flight run → old runtime/version
new run           → new qualified runtime/version
```

No snapshot migration promise between engines.

## 4.7 AgentTrigger lifecycle

F1 has concrete `SCHEDULE | EVENT` AgentTriggers. Manual/chat invocation does not require a trigger record.

A trigger needs only current admission facts, not a workflow FSM.

Minimum semantics:

```text
enabled / disabled current intent
exact Agent/Project relationship
trigger-specific schedule/event definition
source provenance/version as applicable
```

Trigger firing is a guarded admission to a **new AgentRun**.

Race law:

```text
disable commits first → no new AgentRun from that firing
AgentRun admission commits first → admitted run continues under its pinned composition
```

Disabling a trigger does not cancel already-admitted runs.

Schedule overlap policy, event dedupe implementation and signal/inbox mechanics remain trigger/runtime-specific realization unless a real consumer requires a domain-level overlap policy. No shared scheduler is created.

## 4.8 Cancel / late output

AgentRun terminalization is write-once.

Once `CANCELLED` commits, later Mastra output/checkpoint progress may be observed diagnostically but cannot regain PAR authority or initiate a new Gateway effect through that run.

Physical interrupt is 3H mechanics; authority does not wait for process cooperation.

## 4.9 Proof obligations

1. Approval expires while runtime sleeps → run later resumes with non-effect expiry outcome; no effect sent.
2. Approval DENY → same run can safely continue without effect.
3. run CANCELLED while request awaits/has ALLOW_ONCE → later decision/claim cannot execute.
4. new Release promoted during in-flight run → run retains old exact composition; new run uses new Release.
5. old run capability later revoked by current owner → last-mile call fails despite old Release pin.
6. trigger disable × firing race, both orders → either no run or one already-admitted run; no half-admission.
7. Mastra process absent during durable suspension → AgentRun is not auto-failed.
8. late runtime output after CANCELLED → cannot regain authority.
9. no AgentRun `AWAITING_APPROVAL` durable status is required for correctness.

## 4.10 YAGNI

Do not build:

```text
AgentRun universal workflow FSM
Conexus workflow/checkpoint engine
scheduler parallel to Mastra by default
resume token as domain authority
runtime snapshot migration layer
new Release auto-migration of in-flight runs
approval auto-renewal
trigger overlap framework without consumer
```

## 4.11 Reopen triggers

- a real suspension reason needs Conexus-owned business authority not representable by current owner facts;
- a current product consumer requires domain-level schedule overlap semantics;
- an in-flight run cannot remain safely pinned across a real Release/runtime evolution case;
- current owner revocation cannot be enforced without mutating AgentRun composition.

---

# 5. Candidate 3G-06 — Gateway EffectAttempt, Idempotency & Budget State Architecture

## 5.1 Root cause

Gateway already owns last-mile physical effect admission/execution. 3F-03 freezes atomic ApprovalRequest claim + `effect_attempt = NOT_SENT` before external I/O. C-013/C-016 freeze traffic/outcome ambiguity and no automatic retry on unknown effects.

The unresolved failure class is crash/retry correctness across:

```text
admission
send boundary
response
PARTIAL
OUTCOME_UNKNOWN
idempotency
budget reservation/settlement
```

without turning ActorRun/PAR into a second effect authority.

## 5.2 Durable facts, not one universal status

`gw.effect_attempt` keeps owner-local effect execution truth.

Semantic facts include, as applicable:

```text
exact attempt identity
exact effect subject / operation revision / effect-unit identity set
caller/surface/execution correlation
idempotency claim/ref
budget reservation/ref
traffic state
typed receipt/response outcome when known
original ambiguity facts when unknown
```

No generic cross-domain `AttemptState` is created.

### Traffic state

Preserve 3F-02/C-013 semantics:

```text
NOT_SENT
SENT_NO_RESPONSE
RESPONSE_RECEIVED
```

`SENT_NO_RESPONSE` means the attempt crossed the durable external-dispatch boundary and no response is durably observed; it is deliberately conservative and may include a crash in the tiny interval before the provider actually processed bytes.

Safety prefers false uncertainty over unsafe duplicate effects.

## 5.3 Admission before I/O

For an effectful attempt, before external I/O Gateway commits the applicable authority bundle:

```text
effect_attempt identity + exact subject
required ApprovalRequest claim when applicable
idempotency claim when applicable
budget reservation
traffic = NOT_SENT
required audit
```

using the already-approved atomicity classes.

Rollback before this admission commit consumes none of those authorities except facts independently committed earlier.

Approval binding, once committed, remains permanent even if the attempt later cancels before send; a new effect attempt cannot reuse that approval.

## 5.4 External dispatch boundary

Immediately before crossing into external I/O, Gateway performs an owner-local guarded transition equivalent to:

```text
NOT_SENT
→ SENT_NO_RESPONSE
```

Then external I/O occurs outside the transaction.

If the process crashes after that transition and before a response is durably admitted:

```text
OUTCOME_UNKNOWN semantics
```

apply. No generic automatic resend is allowed.

Cancellation is only semantically safe as `not sent` while the attempt remains `NOT_SENT`. After `SENT_NO_RESPONSE`, "cancel" cannot assert that the external effect did not occur.

## 5.5 Response / receipt outcome

A durably observed response moves traffic to:

```text
RESPONSE_RECEIVED
```

and admits a typed outcome/receipt under the exact operation contract.

Outcome semantics remain distinct from traffic and from caller execution success.

Known outcome family includes the already-approved meanings:

```text
SUCCEEDED
FAILED
PARTIAL       # only where operation semantics admit multi-unit partiality
OUTCOME_UNKNOWN
```

`OUTCOME_UNKNOWN` is never collapsed into generic `FAILED`.

For atomic operations:

```text
PARTIAL = impossible
```

For multi-unit operations, breakdown preserves at least the approved C-012/C-013 accounting law:

```text
total = succeeded + rejected + unprocessed + unknown
attempted excludes unprocessed
unknown has highest uncertainty precedence
```

Exact receipt schemas stay operation-specific.

## 5.6 Idempotency

`idempotency_claim` remains Gateway-owned and subject-bound.

Minimum laws:

```text
same idempotency identity + same exact subject
→ resolve/reuse the existing claim/attempt semantics

different subject under the same persisted idempotency identity
→ conflict / fail closed
```

A persisted idempotency identity does not prove the external provider itself is idempotent unless the connector contract says so.

For an `OUTCOME_UNKNOWN` attempt, reusing the same key does **not** mean "send again". It means recover/reconcile the existing ambiguity until a provider-specific safe resend rule is proven.

No generic retry engine is introduced.

## 5.7 Budget reservation / settlement

Budget admission happens before send.

Semantics:

```text
NOT_SENT + cancelled/known-not-executed
→ reservation may be released/settled according to exact budget policy

known response/outcome
→ settle against actual attempted/effect units under typed operation accounting

OUTCOME_UNKNOWN
→ retain conservative reservation; never release merely because caller/run ended
```

Settlement/reconciliation mechanics and expiry/repair of an unresolved reservation belong to 3M/calibration; 3G-06 freezes only that ambiguity cannot silently free capacity or count as zero.

Numeric ceilings remain policy/calibration, not architecture law.

## 5.8 Retry/new attempt law

Gateway does not infer generic retryability from `FAILED`.

A fresh attempt is possible only through fresh admission under current authority.

Known rules:

```text
NOT_SENT and no committed external-dispatch boundary
→ a later fresh attempt may be admissible

SENT_NO_RESPONSE / OUTCOME_UNKNOWN
→ no automatic effect replay

RESPONSE_RECEIVED + exact response proves no effect / safe retry under connector contract
→ fresh attempt may be admitted according to connector/idempotency semantics

PARTIAL
→ succeeded units are never repeated automatically;
   unknown units are never repeated automatically;
   any new bounded subject must contain only units proven safe for another attempt
```

If a new subject needs human approval, it receives a new ApprovalRequest. Old `ALLOW_ONCE` never transfers.

## 5.9 Reconciliation preserves history

3M may later establish a settlement result for an `OUTCOME_UNKNOWN` attempt, but it must not erase the fact that the original execution was ambiguous at the time.

```text
original traffic/ambiguity history
+
subsequent settlement/reconciliation evidence
```

remain distinguishable.

Exact same-row vs linked/event representation is deferred to 3M/implementation; no new durable class is admitted here.

## 5.10 Builder/PAR relationship

Builder or PAR may consume Gateway traffic/outcome projection as context/evidence.

They never become replay authority.

A new ActorRun/AgentRun may perform unrelated safe work while an older effect is `OUTCOME_UNKNOWN`; only the ambiguous effect's re-execution is blocked/enforced at Gateway.

## 5.11 Proof obligations

1. crash before effect admission commit → no admitted attempt/effect claim.
2. crash after admission but before dispatch transition → attempt remains NOT_SENT; no false send.
3. crash after dispatch transition before response → OUTCOME_UNKNOWN; no auto resend.
4. cancel while NOT_SENT → no send; approval binding still not transferable once committed.
5. cancel after SENT_NO_RESPONSE → cannot claim no effect occurred.
6. same idempotency identity + different subject → fail closed.
7. OUTCOME_UNKNOWN + same idempotency key → recovery, not blind resend.
8. PARTIAL breakdown → no succeeded/unknown unit automatically repeated.
9. OUTCOME_UNKNOWN → conservative budget reservation remains load-bearing.
10. new ActorRun/AgentRun doing unrelated work is not globally blocked by one ambiguous effect.
11. no Builder/PAR effect-state mutation can bypass Gateway enforcement.

## 5.12 YAGNI

Do not build:

```text
EffectWorkflowEngine
universal retry scheduler
exactly-once promise
cross-owner Builder/PAR effect transaction
provider-idempotency fiction
status fan-out to AgentRun/ActorRun
new reconciliation record without 3M failure class
```

## 5.13 Reopen triggers

- concrete provider requires a different safe dispatch protocol;
- a real multi-unit effect cannot be represented by current breakdown semantics;
- 3M proves settlement cannot preserve ambiguity history without a new durable class;
- current idempotency model cannot prevent duplicate effects under a named connector.

---

# 6. Candidate 3G-07 — Project Lifecycle & Binding Mutation Architecture

## 6.1 Root cause

Project owns identity, Inception/Baseline authority and current binding/config intent, while Release owns serving. The unresolved risk is letting Project lifecycle accidentally mutate production or letting archive become an implicit purge/deploy action.

The target invariant is:

> Project lifecycle governs future intent/control-plane mutation; serving remains governed by Release/active runtime authority.

## 6.2 Minimal lifecycle projection

No large Project FSM is required.

Use existing owner-local facts to derive the structural projection:

```text
ARCHIVED
  if explicit current archive fact is present

INCEPTION
  if not archived and no approved Project Baseline exists

ACTIVE
  if not archived and an approved Project Baseline exists
```

Exact field/enum representation is not frozen.

`DISABLED` is not introduced as a synonym for "not served" because Project is not serving authority.

### Archive is not purge

Archive preserves:

```text
Project identity
canonical repo association
approved Baseline history
binding/config history
Changes/Releases/AgentRuns/history
active Release pointer owned elsewhere
```

Purge/retention remains later 3M/ops and never `DELETE CASCADE`.

## 6.3 Archive / restore

F1 permits explicit archive and restore while no purge has occurred.

Archive/restore uses owner-local guarded/CAS mutation so concurrent lifecycle edits do not silently overwrite.

Restore projection becomes:

```text
approved Baseline exists → ACTIVE
no approved Baseline     → INCEPTION
```

Restore does not auto-adopt latest Brain/Connection/config, does not create Release and does not republish anything.

All future mutations re-run their current specialized owner gates normally.

## 6.4 Mutation admissibility by Project lifecycle

### INCEPTION

Allowed:

```text
Inception investigation flow
Baseline candidate/proposal/approval
canonical repository setup required for Inception
necessary setup explicitly admitted by existing Inception authority
```

Initial Builder Change admission remains blocked until approved Baseline as already frozen.

### ACTIVE

Normal Project intent mutations may be admitted under their existing specialized contracts:

```text
new Change
Baseline revision flow
ProjectConnectionBinding SET/UNBIND
ProjectBrainBinding SET/UNBIND
Config Contract revision
Release composition/promotion via Release rules
```

### ARCHIVED

Ordinary future-intent mutations are refused:

```text
new Change admission
new binding SET/UNBIND
new Config Contract/Baseline authoring adoption
ordinary new Release composition/promotion
new control-plane trigger/config authoring
```

Historical reads/audit/export/recovery remain possible according to their owners.

Runtime already authorized by an active Release is **not silently disabled merely because Project was archived**.

## 6.5 Archived Project with active Release

This closes F3D04-R2.

F1 chooses:

```text
archive Project
-X-> mutate Release active pointer
-X-> automatically stop serving
-X-> automatically cancel in-flight runtime
```

Reason: `Project intent mutation != live deployment mutation` is already a cross-phase invariant. Auto-unpublishing on archive would create a second serving authority and a hidden cross-owner side effect.

Therefore:

```text
Project ARCHIVED + active Release
→ existing MANAGED serving may continue
→ already-admitted production runtime may continue
→ scheduled/runtime behavior of that active Release remains runtime behavior
```

Product UI must make this explicit; exact copy belongs to 3K.

If a future consumer requires "archive and unpublish", that is an explicit serving/deactivation feature and returns through the Decision Loop; it is not smuggled into Project archive.

### Operational recovery exception

While archived, ordinary new Promotion is blocked, but recovery/rollback necessary to keep an already-served Release safe may still be admitted by Release under explicit recovery authority. Archive must not trap an unsafe active version by forbidding all recovery.

Exact operator permission belongs to 3I/3K; lifecycle admissibility belongs here/3G-08.

## 6.6 Binding mutation lifecycle

3F-04 already freezes immutable binding versions + expected-current CAS.

3G-07 adds only Project-lifecycle admission:

```text
Project ACTIVE
AND specialized owner new-adoption checks pass
AND expectedCurrentBindingRef matches
→ SET/UNBIND may commit
```

ARCHIVED refuses ordinary SET/UNBIND.

No binding status FSM is needed.

Current binding may remain historical/current intent even if its target later stops being adoptable for **new** adoption. Future Release/EnvironmentConformance/Gateway gates decide current runtime eligibility; Project does not mirror Connection/Brain health/qualification/revocation.

UNBIND:

```text
removes current Project intent
preserves immutable history
-X-> active Release mutation
```

`update available` remains read-only projection, never lifecycle state.

## 6.7 Concurrency

Independent binding slots retain independent CAS. No global `ProjectGeneration`/`BindingSetGeneration` is introduced merely to serialize unrelated edits.

Project archive/restore races with an ordinary intent mutation must fail closed under a Project lifecycle guard:

```text
archive wins first → later ordinary mutation refused
mutation wins first → archive may then commit and freezes future mutations
```

No transaction crosses Git/network/external I/O; Git-first authoring occurs before owner adoption as already approved.

## 6.8 Inception shape remains deliberately open

3G-07 does not force `InceptionInvestigation` to create a synthetic Change.

If 3H realization proves a true pre-Change AgentRun/Builder-run class is required, it returns through the Decision Loop under the existing 3G-03 reopen trigger.

## 6.9 Proof obligations

1. Project without approved Baseline → initial Change admission refused.
2. archive × binding mutation race, both orders → no post-archive ordinary mutation.
3. archived Project with active Release → active pointer unchanged; serving does not silently disappear.
4. archive does not unbind Brain/Connections or erase history.
5. restore does not auto-adopt latest resources or publish.
6. active Release recovery/rollback remains possible under explicit Release recovery authority while Project archived.
7. UNBIND changes future intent only; current served Release remains pinned.
8. no global BindingSet/Project lifecycle engine is required.

## 6.10 YAGNI

Do not build:

```text
ProjectStateMachine engine
generic Disabled/Deleted/Purged state graph
archive-triggered cascade/unpublish
BindingState engine
BindingSet generation
automatic latest adoption on restore
synthetic Inception Change for symmetry
```

## 6.11 Reopen triggers

- named F1 requirement says archive must stop serving;
- purge lifecycle becomes an implementation-stage current consumer;
- restore cannot safely reuse current intent without a new lifecycle fact;
- an independent binding lifecycle consumer requires state not derivable from current immutable versions + current ref.

---

# 7. Candidate 3G-08 — Release, Promotion & Runtime Admissibility Architecture

## 7.1 Root cause

3C-11/C-014 freeze ReleaseManifest, Promotion, active pointer, migrations, rollback and `SERVED_VERIFIED`. 3G-02 adds context-pinned `change_acceptance` whose current admissibility may drift. 3F-06 allows old/new DEDICATED Releases to coexist.

The unresolved failure classes are:

- Release composed from stale acceptance;
- Release valid at compose but stale at promote;
- promotion crash before/after migration/pointer swap;
- confusing active pointer with verified serving;
- newer Release silently killing in-flight AgentRun/DEDICATED clients;
- Project archive becoming second serving authority;
- rollback pretending to restore data/schema.

## 7.2 Release construction lifecycle — facts first

A Release is immutable once AVAILABLE.

C-014's semantic stages are retained but need not become a giant mutable enum. Owner-local facts may derive:

```text
BUILDING
→ exact Release identity allocated; composition not yet fully verified/finalized

VERIFIED
→ immutable ReleaseManifest candidate and required composition verification exist

AVAILABLE
→ finalized immutable Release/manifest is eligible as a version subject to current consumer-time gates
```

Exact persistence representation is not frozen.

Failure before AVAILABLE never creates a silently usable Release. Recovery/cleanup of abandoned BUILDING records is 3M/implementation.

Once AVAILABLE:

```text
ReleaseManifest bytes/refs never mutate
```

A later eligibility failure is **derived current inadmissibility**, not mutation of the historical Release.

## 7.3 ComposeRelease and change_acceptance

ComposeRelease is the only Builder→Release handoff path already approved through L7.

At compose guard:

```text
exact relevant change_acceptance refs resolve
AND each acceptance is currently admissible for required contract/governance/execution context
AND exact source/result identity matches composition
AND current required Rigor floor is satisfied
AND exact Registry/Brain/Connection/config/database refs are structurally resolvable
→ composition may advance to AVAILABLE
```

If a required acceptance is currently inadmissible:

```text
no Release composition
→ Builder successor verification Change may be created ON-DEMAND under 3G-02
```

No acceptance is rewritten. No automatic revalidation fan-out.

A successfully composed Release pins the acceptance/proof identities it relied on.

## 7.4 Promotion rechecks consumer-time admissibility

`AVAILABLE` means the immutable version exists. It is not a timeless permission to activate.

Before material Promotion steps, Release re-evaluates current gates including as applicable:

```text
Project lifecycle permits ordinary Promotion
pinned acceptance/proof remains admissible under current required context
exact artifacts/bindings/Brain/config resolve
Connection/Brain/owner current eligibility/conformance
EnvironmentConformance against real PROD
permission/effect/dependency/migration diffs required by prior authority
human Promotion approval
```

If governance/context drift makes the pinned acceptance inadmissible after compose:

```text
Release remains immutable AVAILABLE
Promotion is refused until current proof is restored
```

Restoration uses the 3G-02 on-demand verification Change and, if the composition identity/proof changes, a new Release is composed. No old Release mutation.

## 7.5 Promotion as durable attempt

One `Promotion` is one concrete attempt to activate one exact Release in `PROD`.

Promotion history is append-only; retry/recovery continues the same Promotion only where the already-committed step is idempotently recoverable. A materially new activation attempt gets a new Promotion identity.

Durable step facts/projection must distinguish at least:

```text
APPROVED / admitted for execution
pre-swap conformance and migration progress
POINTER_SWAPPED
SERVED_VERIFIED
failure before swap
serve verification failure after swap
MAINTENANCE_RECOVERY_REQUIRED when old serving is no longer safe
```

These are semantic conditions; exact enum/storage is not frozen.

No universal workflow engine is introduced.

## 7.6 Step ordering / idempotency

Each material step is guarded and records completion before the next irreversible step depends on it.

Recovery reads durable Release/Promotion facts; L7 has no hidden workflow state.

No external I/O runs under a long transaction.

### Before pointer swap

Ordinary failure leaves active pointer unchanged.

Re-running the same Promotion must not blindly repeat an already-completed migration/privileged step; it reads the durable step fact and either continues idempotently or enters explicit recovery.

### Pointer swap

```text
expectedGeneration == currentGeneration
→ CAS swap to exact Release

mismatch
→ CAS_CONFLICT; no silent last-writer-wins
```

Once swap commits, active pointer truth is independent of whether served verification later passes.

### After pointer swap

Served verification proves:

```text
real serving path returns expected served/runtime/frontend identity
```

First probe failure does not rewrite the pointer or claim the previous Release is still active.

If served verification cannot be established under bounded retries/policy:

```text
Promotion is not SERVED_VERIFIED
active pointer remains whatever actually committed
recovery/rollback is explicit
```

No automatic rollback by generic policy.

## 7.7 Backward-compatible vs maintenance-required migration

Preserve C-014.

### Backward-compatible path

Old Release may remain served while compatible migration executes and until pointer swap.

Failure before swap can leave old serving intact if conformance proves it remains valid.

### Maintenance-required path

Once the migration step crosses the point where the old Release can no longer safely serve:

```text
old serving must be blocked/drained
```

If Promotion cannot complete pointer swap / compatible serving:

```text
MAINTENANCE_RECOVERY_REQUIRED
```

is an honest lifecycle condition. Recovery may be forward-fix, restore or another explicitly safe action under 3M/C-014; never silently resume incompatible old serving.

This condition is not a generic platform-wide maintenance FSM.

## 7.8 Rollback

Rollback is a **new Promotion** to an older exact Release.

Before rollback:

```text
older Release must still be resolvable
current schema/config/Connection/Brain/service-contract context must admit it
```

If incompatible:

```text
rollback refused
```

Rollback does not imply:

```text
git revert
down migration
data restore
```

When Project is ARCHIVED, explicit operational rollback/recovery of the still-active serving path may be admitted even though ordinary new Promotion is blocked by 3G-07.

## 7.9 MANAGED / AgentRun / DEDICATED runtime admissibility

### MANAGED published app

```text
new request
→ active Release pointer
```

Only active Release is serving composition.

Project archive does not alter this pointer.

### Production AgentRun

At new run admission:

```text
current active Release
→ exact run-pinned composition
```

Later active Release changes do not mutate the in-flight run (3G-05).

### DEDICATED

DEDICATED exchange presents an exact ReleaseRef and is not forced to equal the current MANAGED active pointer.

Lifecycle law:

```text
newer Release exists
-X-> old Release automatically invalid
```

An old exact Release remains interpretable/admissible while its applicable `PRESERVE`/support obligations remain in force and no independent 3I/owner authority revokes/narrows access.

3G-08 does **not** invent time-based retirement, ReleaseLease, fleet registry or latest-only policy.

End-of-support / explicit retirement mechanics require a real deployment/install-base consumer and are completed by 3I/3J under 3F-01/3F-06. Until then, lifecycle must fail closed rather than silently treating `latest` as the only valid Release.

Security emergency revocation is 3I authority and may narrow an otherwise in-horizon Release without rewriting it.

## 7.10 Active Release after governance drift

A governance change after `SERVED_VERIFIED` does not automatically mutate/deactivate the active pointer merely because a new proof would now be required for a **new Promotion**.

Current last-mile owner/security policies may still block particular operations immediately.

If product policy requires rebuilding/revalidating the composition, the next release/promotion uses current proof. Emergency global stop remains 3I/ops decision, not implicit `change_acceptance` staleness fan-out.

## 7.11 Proof obligations

1. acceptance valid at compose but stale at promote → Release remains AVAILABLE; Promotion refused.
2. on-demand successor verification restores proof → new/current composition can be admitted without mutating old acceptance.
3. failure before pointer swap → active pointer unchanged.
4. CAS race between two Promotions → exactly one pointer swap wins.
5. crash after pointer swap before served verification → recovery sees new active pointer; never assumes old version active.
6. serve verification failure after swap → no false SERVED_VERIFIED, no automatic historical rewrite.
7. maintenance-required migration interrupted after incompatibility point → old serving not silently resumed.
8. rollback target schema-incompatible → rollback refused.
9. Project archived with active Release → serving continues; ordinary new Promotion refused; explicit recovery rollback can proceed.
10. new AgentRun after promotion uses new Release; in-flight run keeps old.
11. DEDICATED exact old Release in support horizon → not rejected merely because newer exists.
12. current security revocation can block old Release operation without mutating ReleaseManifest.
13. no Release/Promotion workflow engine is required.

## 7.12 YAGNI

Do not build:

```text
DeploymentModule
Release workflow engine / Temporal by default
canary / blue-green / rollout strategy framework
automatic rollback framework
latest-only Release admissibility
ReleaseLease / fleet registry
mutable ReleaseManifest
stale-status fan-out into every old Release
persistent staging target
synthetic "archive unpublishes" coupling
```

## 7.13 Reopen triggers

- real DEDICATED install base requires explicit support/retirement lifecycle;
- multiple deployment targets/providers develop independent lifecycle;
- a Promotion step cannot be recovered safely from current durable facts;
- implementation proves active pointer + Promotion facts insufficient after partial migration;
- F1 product adds explicit unpublish/deactivate serving requirement.

---

# 8. Candidate 3G-R1 — Behavioral / State Architecture Global Closure

3G may close only after independent review of **the whole stage**, not just acceptance of 3G-04..08 in isolation.

The closure review must prove coherence across these distinct state spaces:

```text
ApprovalRequest             → 3G-01
Change / Finding            → 3G-02
Work Unit / Builder ActorRun→ 3G-03
Planning / Rigor            → 3G-04 candidate
Production AgentRun/Trigger → 3G-05 candidate
Gateway EffectAttempt       → 3G-06 candidate
Project / Binding lifecycle → 3G-07 candidate
Release / Promotion         → 3G-08 candidate
```

## 8.1 Non-unification proof

Review must demonstrate that no state label is being reused as shared authority across owners merely for convenience.

Particularly:

```text
Builder ActorRun != Production AgentRun != Gateway effect_attempt != Promotion
```

and:

```text
Change success != WorkUnit delivery != AgentRun completion != effect outcome != Release active != served verified
```

## 8.2 End-to-end behavioral traces to attack

### Builder to Release

```text
Change contract/checkpoint
→ WorkUnit/ActorRun
→ Evidence/Findings
→ Change ACCEPTED + change_acceptance
→ acceptance remains current
→ Release AVAILABLE
→ Promotion
→ active pointer
→ SERVED_VERIFIED
```

Attack governance drift at every boundary.

### Production agent effect

```text
trigger/chat
→ AgentRun pinned Release
→ tool proposal
→ PREPARE
→ ApprovalRequest
→ deny/expire/allow
→ effect_attempt admission
→ dispatch
→ response / OUTCOME_UNKNOWN
→ AgentRun continues/completes
```

Attack cancel, expiry, crash and new Release at every boundary.

### Archive

```text
Project ACTIVE + active Release
→ archive
→ future intent blocked
→ existing serving continues
→ recovery rollback still possible
→ restore
```

Attack any hidden cross-owner mutation.

## 8.3 Closure burden

`3G-R1 = CLOSE` only if:

```text
material blockers against 3B–3F / 3G-01..03 = 0
remaining material 3G decisions = 0
no duplicate state authority
no reachable false-success path
no runtime/framework self-report used as authority
no speculative engine/record introduced
all deferred mechanics have explicit later owner/reopen trigger
```

If a current 3G requirement cannot be represented by the five candidates, add the smallest decision necessary **before** closure. Do not create numbered decisions for mere realization details.

---

# 9. Package-level YAGNI audit

The current proposal adds:

```text
new module                     0
new durable record class       0
new Tier-2 FK                  0
new cross-owner atomicity class0
new scheduler/queue            0
new workflow engine            0
new lease/fencing fact         0
new public failure taxonomy    0
```

It may require new fields/facts inside already-approved owner records when implementation realizes the semantics; exact schema remains 3E/implementation authority and cannot create a new meaning not approved here.

---

# 10. Independent review assignment — Fable

Fable must review this as **one behavioral architecture package**, not five isolated style reviews.

Required attacks:

## A. Sweep completeness

1. Is any material 3G item from C-000..C-017 / 3B–3F / LEDGER missing?
2. Is any proposed candidate actually a 3H/3I/3J/3M realization concern and should be deleted from 3G?
3. Is any candidate too broad and combining owners in a way that creates shared authority?
4. Is any additional numbered 3G decision really required, or can 3G close with these five?

## B. 3G-04

5. Can PlanningDepth and RigorProfile truly remain orthogonal? Produce a current counterexample if not.
6. Are DIRECT/LIGHT/FULL semantics deterministic enough for implementation without an LLM planning classifier becoming authority?
7. Does Release-time rigor recalculation duplicate Change acceptance or correctly act as consumer admissibility?
8. Is any 3×3 interaction actually load-bearing rather than accidental ceremony?

## C. 3G-05

9. Does `COMPLETED | FAILED | CANCELLED` suffice for Production AgentRun without hiding suspension/uncertainty?
10. Can ApprovalRequest alone represent approval wait authority without AgentRun `AWAITING_APPROVAL` durable status?
11. Does origin-run terminal guard conflict with 3F-03 ORIGIN_CORRELATION / 3G-01 lifecycle rules?
12. Can DENY/EXPIRE/STALE safely resume the same run as a typed non-effect result?
13. Does a newer Release ever need to invalidate an in-flight run beyond current owner/Gateway enforcement?
14. Is AgentTrigger enable/disable enough state, and does the race law survive real schedules/events?
15. Does any current Mastra behavior become load-bearing? If yes, verify with Context7 `/mastra-ai/mastra` + primary source.

## D. 3G-06

16. Is marking `SENT_NO_RESPONSE` before external I/O the correct conservative dispatch boundary, or does it contradict current C-013/3F-02 semantics?
17. Can traffic/outcome/budget facts recover every crash schedule without another durable state?
18. Does PARTIAL/new-attempt law over- or under-block any current connector/effect class?
19. Does idempotency claim reuse accidentally promise provider idempotency?
20. Is there any cross-owner atomicity missing between effect_attempt, approval claim and budget/idempotency?
21. Can settlement preserve original ambiguity without a new record? If unknown, route honestly to 3M.

## E. 3G-07

22. Is `ARCHIVED` as control-plane freeze while serving continues the globally safest interpretation of prior authority?
23. Does reversible restore contradict 3B-16 or require a new fact/lifecycle?
24. Is ordinary Promotion correctly blocked while archived but recovery rollback allowed without creating a hidden bypass?
25. Does Project archive need to disable scheduled production agents for user expectations, or would that wrongly make Project serving authority?
26. Can binding mutation lifecycle really remain CAS + Project gate with no durable status?

## F. 3G-08

27. Are BUILDING/VERIFIED/AVAILABLE required as durable Release states, derived facts, or can one be deleted without losing C-014 meaning?
28. Is consumer-time `change_acceptance` recheck required at both compose and promote? Attack TOCTOU and redundant-proof cases.
29. Does serve-verification failure after pointer swap need an additional terminal state or can current Promotion facts represent it honestly?
30. Is maintenance-required recovery state sufficiently separated from 3M mechanics?
31. Does archive + active Release + rollback produce any authority cycle?
32. Does DEDICATED old-release admissibility remain underspecified enough to block 3G closure?
33. Is there a current need for explicit Release retirement/deactivation, or is that YAGNI until install-base/unpublish consumer appears?
34. Can an active Release remain served after governance drift without violating a current safety invariant?

## G. Global schedules

35. approval expires exactly while run cancellation commits;
36. ALLOW_ONCE commits, then AgentRun cancels before FIRST_CLAIM;
37. effect attempt admission commits, then AgentRun cancels before external dispatch;
38. external dispatch ambiguity + new run + new Release;
39. binding changes while old Release serves and a new Release composes;
40. archive races with Change admission / binding mutation / Promotion;
41. change_acceptance drifts after Release AVAILABLE but before promotion;
42. two Promotions race and one performs migration before losing pointer CAS;
43. maintenance-required migration completes but Hub crashes before pointer swap;
44. DEDICATED old Release calls while newer MANAGED Release is active;
45. verifier/Builder proof floor raises at Release composition.

For each reachable contradiction use:

```text
claim challenged
→ concrete failure schedule / consumer
→ authority affected
→ smallest correction
→ reopen prior decision? yes/no
→ later owner if deferred
```

## H. Final disposition

Fable must end with exactly one of:

```text
PACKAGE CURRENT STRUCTURE CONFIRMED → ready for operator package review
PACKAGE NEEDS ONE CONSOLIDATION ROUND
STOP / SPLIT PREREQUISITE
```

and state:

```text
which 3G-04..08 candidates survive
which need correction
whether any candidate should be deleted/merged/split
whether a 3G-09 is materially required
whether 3G can proceed to 3G-R1 closure after consolidation
whether any prior 3B–3F / 3G-01..03 decision needs material reopen
```

Do not edit `LEDGER.md`, accepted authority or product code. Append review to this package file and commit/push only this package.