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

---

# Fable Package Review — Round 1

**Reviewer:** Fable (independent adversarial reviewer)  
**Reviewed at HEAD:** `c25f1ad896e045b93d7a2dd57aa09864e5906f0e`  
**Method:** DevelopmentConexus Engineering Method v1.0.0, applied to the package as one behavioral/state architecture system.  
**Authority basis re-read for this review:** 3G-01/3G-02/3G-03 full approved texts, LEDGER, C-013/C-014/C-016/C-017 decision records, 3E-02 durable inventory, 3F-02/3F-03/3F-04/3F-06 as summarized in the live ledger.  
**Mastra note:** no conclusion below depends on current Mastra API behavior. The only Mastra assumption the package leans on — durable checkpoint/suspend/resume as runtime mechanics — was already frozen by 3C-10/3A-R5 and remains routed to 3H/3L realization. Context7 verification was therefore not required and no new Mastra claim is introduced here.

## R1.0 Verdict summary

```text
PACKAGE NEEDS ONE CONSOLIDATION ROUND

3G-04 survives — one clarifying correction (F6)
3G-05 survives — one material correction (F1)
3G-06 survives — one material correction (F2) + one minor alignment (M1)
3G-07 survives — one material decision to make explicit (F4) + two corrections (F5, F7)
3G-08 survives — one material correction (F3)

delete / merge / split          = NONE justified
3G-09 materially required       = NO
reopen 3B–3F / 3G-01..03        = NONE
after consolidation             = proceed directly to 3G-R1
```

No finding below invalidates the partition into five candidates, creates a new durable record class, or requires a new subsystem. Every correction is expressible as fields/guards inside already-approved owner records and as explicit sentences in the candidate texts. The package's own template (`claim challenged → schedule → authority → root cause → smallest correction → complexity → reopen → later owner`) is used for each material finding.

## R1.1 Sweep completeness (assignment A, questions 1–4)

**Q1 — missing material 3G items.** I checked every ledger-routed behavioral item against the package: N3 → 3G-04; approval expiry × suspended AgentRun → 3G-05; Gateway effect_attempt/budget/idempotency → 3G-06; Project/binding mutation lifecycle → 3G-07; F3D02-R1 (in-flight run × new Release) → 3G-05 (3I authority part stays routed); F3D04-R2 (archived Project × active Release) → 3G-07; DEDICATED old-vs-new window → 3G-08 (residual honestly routed to 3I/3J); Release-side `change_acceptance` placement → 3G-08. All routed items land in exactly one candidate.

I also swept the 46 durable classes for behavioral/state semantics not covered by 3G-01..08 or prior authority:

```text
brn.knowledge_proposal / health      → C-011 already froze the human-gate proposal flow,
                                       NO AUTO MERGE, self-write REJECT, and the 5-state
                                       drift machine (UNVERIFIED/VALID/SUSPECT/INVALID/CHECK_ERROR)
                                       with runtime obligations; remaining work is realization
con.connection/revision/qualification → C-007 gates + append-only qualification + C-016
                                       registered rotation design (trigger-gated) suffice
att.attachment/blob                   → C-015 froze PENDING→AVAILABLE CAS + two-phase GC
mar.job_run                           → C-013 admission-ledger machine already frozen; substrate 3H
iam session / reg artifact / obs.*    → C-015 / C-005 / append-only; no open behavioral decision
par.conversation / bld.coding_session → container/correlation facts; lifecycle is realization (3H)
```

**Conclusion: the sweep is complete. No material 3G decision is missing and no 3G-09 is justified.** What would falsify this: a durable class above whose owner cannot answer an admission/closure/recovery question from existing authority during 3G-R1 or 3N.

**Q2 — anything that should be deleted from 3G as 3H/3I/3J/3M.** No candidate is a realization concern in disguise. 3G-08 is the closest call — much of §7.5–7.8 restates C-014 — but it adds genuinely new authority: consumer-time acceptance recheck at compose **and** promote, rollback-under-archive admissibility, DEDICATED fail-closed admissibility, and the drift law of §7.10. Keep all five.

**Q3 — shared-authority combination.** None found. 3G-04 spans Builder and Release but only as consumer-time admissibility (correct). 3G-05's origin-run guard is PAR-internal. 3G-07 explicitly refuses cross-owner mutation on archive.

**Q4 — can 3G close with these five.** Yes, after the corrections below.

## R1.2 Material findings

### F1 — 3G-05: cross-fact admission guards lack the concurrency law they depend on

- **Claim challenged:** §4.5/§4.7 — "AgentRun CANCELLED → unbound approval from that run can never later execute" and "disable commits first → no new AgentRun from that firing".
- **Concrete failure schedule:** run R non-terminal; human ALLOW_ONCE commits; agent-origin claim path reads `R non-terminal` (plain read); concurrently PAR commits `R = CANCELLED`; the FIRST_CLAIM admission transaction commits bind + Gateway admission; external effect executes for a cancelled run. Symmetric schedule exists for trigger firing: firing admission reads `enabled`, disable commits, admission commits anyway.
- **Authority affected:** 3G-05 §4.5 origin-run terminal guard, §4.5 "current pending proposal" membership, §4.7 trigger race law.
- **Root cause:** 3G-01 §10 requires the mutation predicate to restate every *ApprovalRequest* fact it depends on; 3G-05 adds three new concurrently mutable PAR facts to the claim/admission decision (origin-run terminality, current-pending-proposal membership, trigger enabled) but states them as preconditions without stating the guard discipline. A precondition checked by pre-read is not a control that can be shown to fire.
- **Smallest globally coherent correction:** one normative sentence in 3G-05: the origin-run non-terminal fact, the current-pending-proposal fact and the trigger enabled fact are concurrently mutable PAR-owned facts and MUST participate in the owner-local guarded/CAS predicate of the admission that depends on them (or be serialized by an equivalent PAR-owned guard), under the same discipline as 3G-01 §10. All facts are PAR-local (`par.agent_run`, `par.approval_request`, `par.agent_trigger` — same owner schema), so no cross-owner machinery and no new atomicity class is created. "Current pending proposal" may be realized as a field inside `par.agent_run` under the package's §9 allowance.
- **Essential vs accidental:** essential — it protects the package's own headline invariant; without it the invariant is aspirational.
- **Reopen prior authority:** NO — this is an application of 3G-01's discipline inside 3G-05's own scope.
- **Later owner if deferred:** not deferrable; belongs in the consolidated 3G-05.

### F2 — 3G-06: "closed before dispatch" is referenced but has no durable fact, and schedule 37 has no committed answer

- **Claim challenged:** §5.2/§5.7/Q17 — traffic 3-state + outcome + budget facts can recover every crash schedule; budget law "NOT_SENT + cancelled/known-not-executed → reservation may be released".
- **Concrete failure schedule:** admission commits (`NOT_SENT`); applicable authority cancels the attempt (e.g., the origin run cancelled — schedule 37); budget reservation is released per §5.7; Hub crashes; recovery finds a `NOT_SENT` attempt with a committed approval binding — and 3G-01 proof 17 explicitly sanctions recovering and dispatching such an attempt. The effect executes after cancellation with its budget already released. There is no durable fact that distinguishes "NOT_SENT, pending dispatch" from "NOT_SENT, closed, never to be dispatched".
- **Authority affected:** 3G-06 §5.4 cancellation semantics, §5.7 budget release, §5.8 fresh-attempt law, interaction with 3G-01 §13/§14 recovery.
- **Root cause:** the model has three traffic states and a response-side outcome family, but no pre-dispatch disposition. "Cancelled while NOT_SENT" is used as a load-bearing condition without a fact to carry it.
- **Smallest globally coherent correction:** add one owner-local, write-once **closed-before-dispatch disposition fact** on `gw.effect_attempt` (a field, not a new durable class — covered by §9). Laws: (a) the dispatch transition `NOT_SENT → SENT_NO_RESPONSE` and the close transition compete under guarded mutation; exactly one wins; (b) budget release for a not-sent attempt is admissible only after the close fact commits; (c) recovery of `NOT_SENT + closed` never dispatches; recovery of `NOT_SENT` without the close fact may dispatch (admission remains the point of no return, consistent with 3G-01); (d) the consumed approval binding remains permanent either way. This also gives schedule 37 its committed answer: cancel-vs-dispatch is a guarded race; if no close is attempted, dispatch proceeds under committed admission authority. *Who* may close post-admission remains 3I authority as already routed; 3G-06 owns only the semantic fact and its guard.
- **Essential vs accidental:** essential — recovery correctness and budget honesty both hang on this fact; it is the Gateway analogue of 3G-03's write-once terminal discipline, not new machinery.
- **Reopen prior authority:** NO — 3F-03/3G-01 untouched; approval consumption stays permanent.
- **Later owner if deferred:** not deferrable; belongs in the consolidated 3G-06.

### F3 — 3G-08: pointer CAS does not serialize Promotions; migrations can interleave

- **Claim challenged:** §7.6/proof 4/schedule 42 — "CAS race between two Promotions → exactly one pointer swap wins" presented as sufficient.
- **Concrete failure schedule:** Promotion P1 (Release X) and P2 (Release Y) both admitted for the same Project PROD; both execute migration steps concurrently against the same database; interleaved DDL produces a schema neither Release's conformance proof describes. Worse: P2 runs a maintenance-required migration, blocks/drains old serving, then loses the pointer CAS to P1 — serving resumes under P1's Release on a schema P2 half-migrated. Pointer CAS fired correctly and the system is still wrong, because the CAS protects only the final step.
- **Authority affected:** 3G-08 §7.5–7.7; C-014 migration safety (not contradicted — under-enforced).
- **Root cause:** Promotion's material steps (conformance, migration, drain) are neither idempotent nor commutative across concurrent Promotions; the only serialization point in the text is the last step.
- **Smallest globally coherent correction:** one law in 3G-08: **at most one non-terminal Promotion per (Project, PROD target) at a time**; Promotion admission is a guarded owner-local check against existing Promotion facts; a second admission fails closed while one is non-terminal (recovery/continuation of the same Promotion is already covered by §7.5). This is a guard on already-approved records — no queue, no scheduler, no workflow engine. C-014's human-gated promote flow already implies it; freezing it makes the implication enforceable.
- **Essential vs accidental:** essential — migration safety is an existing C-014 invariant; this is the missing enforcement, not new capability.
- **Reopen prior authority:** NO — narrows/enforces C-014, does not change it.
- **Later owner if deferred:** not deferrable; belongs in the consolidated 3G-08.

### F4 — 3G-07/3G-05: archived Project × NEW AgentRun admission is undecided, and both readings are currently supportable

- **Claim challenged:** §6.4 blocks "new control-plane trigger/config authoring" while §6.5 says "scheduled/runtime behavior of that active Release remains runtime behavior". Neither sentence decides whether a **new** AgentRun (trigger-fired or conversation-originated from the served app) may be **admitted** while the Project is ARCHIVED.
- **Concrete failure schedule/consumer:** Project archived with active Release and an enabled SCHEDULE trigger. Reading A: the trigger keeps admitting new AgentRuns indefinitely, autonomously producing approval requests/effects on an "archived" project. Reading B: new-run admission is refused while archived — but then the served MANAGED app's embedded agent conversation breaks, i.e., serving silently degrades, contradicting §6.5's own commitment. Two implementers can build opposite systems from the current text.
- **Authority affected:** 3G-07 §6.4/§6.5, 3G-05 §4.7, F3D04-R2 closure.
- **Root cause:** the candidate resolves the Release pointer question but never classifies new AgentRun admission as intent-side or serving-side.
- **Smallest globally coherent correction:** decide it explicitly in the consolidated text. **Recommendation: Reading A (serving-side).** AgentRun executes under Release-pinned composition; an enabled trigger + active Release is standing runtime authorization exactly like a MANAGED request path; archive freezes trigger/binding/Change **authoring**, not firing. Reading B would make Project lifecycle a partial serving authority — the precise failure §6.5 exists to prevent — and would silently break served apps. Product consequence (archive does not stop scheduled agents; user disables triggers first, UI must say so) is a 3K surfacing obligation and should be named as such. This is an operator-visible product decision; if the operator instead wants B, it must be chosen knowingly, not inherited from ambiguity.
- **Essential vs accidental:** essential to decide; either mechanism is simple.
- **Reopen prior authority:** NO.
- **Later owner if deferred:** not deferrable as ambiguity; the 3K copy is deferrable.

### F5 — 3G-07: §6.6 contradicts §6.4 for INCEPTION-time binding

- **Claim challenged:** §6.6 — "Project ACTIVE AND specialized owner checks pass AND expectedCurrentBindingRef matches → SET/UNBIND may commit".
- **Concrete counterexample:** §6.4 INCEPTION explicitly admits "necessary setup explicitly admitted by existing Inception authority", and InceptionInvestigation touching real ERP data plausibly requires a Connection binding before any Baseline exists. Under §6.6's literal law that SET is unreachable: textual contradiction inside the same candidate.
- **Authority affected:** 3G-07 §6.4/§6.6; Inception shape (deliberately open per §6.8/3G-03 §5.1).
- **Root cause:** §6.6 wrote the common case (ACTIVE) as the universal law.
- **Smallest globally coherent correction:** rephrase §6.6's gate to "Project lifecycle admits the mutation — ACTIVE, or INCEPTION setup explicitly admitted by existing Inception authority — AND …". No new state, no new fact.
- **Essential vs accidental:** textual; zero added mechanism.
- **Reopen prior authority:** NO.
- **Later owner:** consolidated 3G-07.

### F6 — 3G-04: PlanningDepth's authoritative selection point is unnamed

- **Claim challenged:** Q6 — "are DIRECT/LIGHT/FULL deterministic enough without an LLM planning classifier becoming authority?" §3.2 gives elevation/lowering laws but never says **who** fixes the applicable floor.
- **Concrete risk:** DIRECT/LIGHT/FULL are semantic thresholds, so the de-facto classifier is the proposing agent; without an anchored authority point, agent proposal silently becomes floor authority — the exact hidden-classifier failure 3G-04 §3.7 forbids.
- **Authority affected:** 3G-04 §3.2; C-017 checkpoint law; 3G-02 §4.2.
- **Root cause:** the selection authority already exists in prior decisions but the candidate does not cite it as the mechanism.
- **Smallest globally coherent correction:** one sentence: the applicable PlanningDepth is fixed at the existing C-017 **checkpoint approval** — 3G-02 §4.2 already makes the plan requirement part of the approved contract-revision identity — with mechanical/operator signals able only to elevate; agent proposal is never floor authority. No new gate, no classifier.
- **Essential vs accidental:** essential clarification, zero mechanism.
- **Reopen prior authority:** NO.
- **Later owner:** consolidated 3G-04.

### F7 — 3G-07/3G-08: recovery rollback under ARCHIVED has no mechanical discriminator from ordinary Promotion

- **Claim challenged:** §6.5/§7.8/Q24 — "ordinary new Promotion blocked; recovery/rollback still admissible under explicit recovery authority".
- **Concrete failure schedule:** Project archived; operator invokes "recovery" Promotion targeting an arbitrary older AVAILABLE Release that was never served — functionally an ordinary deployment wearing the recovery label. The archive freeze is bypassed by intent-naming, which no guard can check.
- **Authority affected:** 3G-07 §6.5, 3G-08 §7.8.
- **Root cause:** "recovery" is defined by purpose ("keep already-served Release safe") but admitted by label.
- **Smallest globally coherent correction:** while ARCHIVED, a recovery Promotion may target only a Release **previously activated for that Project** (provable from existing pointer/Promotion history — no new record). That is exactly the set reachable by honest rollback; everything else is ordinary Promotion and stays blocked. Operator permission for the recovery act remains 3I/3K as routed.
- **Essential vs accidental:** essential — converts an intent check into a mechanical guard.
- **Reopen prior authority:** NO.
- **Later owner:** consolidated 3G-07/3G-08 (one of the two texts states it; the other references it).

### M1 — 3G-06 minor: PARTIAL settlement must keep unknown units conservative

§5.7's "known response/outcome → settle against actual attempted/effect units" should state explicitly that within a `PARTIAL` breakdown, **unknown units retain conservative reservation** under C-013's precedence law; only succeeded/rejected/unprocessed units settle. Likely intended; one clause makes it enforceable.

## R1.3 Confirmed claims (attacked and survived)

- **SENT_NO_RESPONSE marked before external I/O (Q16):** CORRECT and the only safe order. Marking after I/O can leave a durable `NOT_SENT` for an effect that was actually sent, which would license unsafe retry under 3F-02's own retry law. The pre-I/O transition matches C-013's OUTCOME_UNKNOWN discipline and C-016's traffic_state semantics; §5.2's reading ("dispatch boundary crossed", conservatively over-uncertain) is the honest one. No contradiction with prior authority.
- **AgentRun `COMPLETED | FAILED | CANCELLED` with no fourth terminal (Q9):** holds. Suspension is a non-terminal run + runtime checkpoint mechanics; approval wait authority is fully carried by the correlated ApprovalRequest (Q10 — yes; C-010's durable `AWAITING_APPROVAL` was already reconciled into the 3G-01 projection, so no duplicate durable status is needed). `COMPLETED != effects succeeded` preserves receipt honesty.
- **Origin-run terminal guard vs 3F-03/3G-01 (Q11):** no conflict *as a concept* — ApprovalRequest facts are never rewritten; the refusal is a PAR consumer-boundary condition outside the 3G-01 projection, analogous to §11's "outside projection" family. It becomes sound only with F1's guard law.
- **DENY/EXPIRED/STALE resuming the same run as a typed non-effect outcome (Q12):** safe and correctly avoids both auto-terminalization and auto-re-approval. Expiry stays silent in ApprovalRequest authority; wake mechanics stay 3H.
- **In-flight run pinning vs newer Release (Q13, schedule 38, 44):** correct; pin is compatibility identity, not permission; last-mile owner/Gateway checks remain live. The 3I "stricter authority" residue stays routed.
- **PlanningDepth × RigorProfile orthogonality (Q5, Q8):** holds. The same input (e.g., material authority surface) may elevate both floors — that is input correlation, not axis coupling; each axis gates independently and both `DIRECT+CONTROLLED` and `FULL+BOUNDED` are representable. No 3×3 cell is load-bearing; the two-gate conjunction suffices.
- **Release-time rigor recalculation (Q7) and acceptance recheck at compose AND promote (Q28):** correct consumer-time admissibility, not duplicate authority. Compose and promote are separated in time; promote's recheck is the TOCTOU defense and is cheap when nothing drifted. Schedule 41/45 resolve to "Promotion refused / composition refused until directed revalidation" with history immutable — coherent with 3G-02 §16.
- **BUILDING/VERIFIED/AVAILABLE as derived facts (Q27):** consistent with C-014; none of the three can be deleted without losing the "failure before AVAILABLE never yields a usable Release" boundary or the compose/verify separation.
- **Serve-verification failure needs no new terminal (Q29); maintenance-required separation (Q30):** confirmed; Promotion step facts + `MAINTENANCE_RECOVERY_REQUIRED` represent both honestly, mechanics stay 3M/C-014.
- **Archive semantics (Q22, Q31):** control-plane freeze with serving continuity is the globally safest reading of `Project intent != serving authority`; no authority cycle once F4/F7 land. Restore without auto-adoption (Q23) is consistent with 3B-16 and 3F-04; no new lifecycle fact required.
- **Binding mutation with CAS + Project gate, no Binding FSM (Q26):** holds under 3F-04's immutable versions + expected-current CAS; `update available` stays read-only projection.
- **DEDICATED old-Release admissibility (Q32):** deliberately incomplete but honestly fail-closed with named owners (3I/3J) and reopen triggers; does not block 3G closure.
- **No explicit unpublish/retire Release in F1 (Q33):** YAGNI holds. F1 is the internal phase; an operational stop path exists at 3J/3I level, and product-level unpublish enters only with a named consumer through the Decision Loop — correctly listed as a reopen trigger, not built.
- **Active Release after governance drift (Q34):** confirmed; automatic deactivation would be `change_acceptance` staleness fan-out — the exact defect class 3G-02 forbids. Emergency stop remains 3I/ops.
- **Builder/PAR never second effect authority (Q11 of §5, §5.10, schedule 38):** preserved; effect-state projection is advisory context only; replay refusal is Gateway-local.
- **No hidden workflow engine / state fan-out / duplicate authority:** none found across the five candidates after F1–F7; Promotion step facts are append-only facts, not an engine; no state label is shared across owners (`DELIVERED` vs `COMPLETED` vs effect outcome vs `SERVED_VERIFIED` stay distinct vocabularies).

## R1.4 The 45 assignment items — disposition ledger

```text
 1 no missing material 3G item                      → R1.1
 2 nothing to delete to 3H/3I/3J/3M                 → R1.1
 3 no shared-authority combination                  → R1.1
 4 3G closes with five candidates + corrections     → R1.1
 5 orthogonality holds; no counterexample           → R1.3
 6 deterministic via checkpoint anchoring           → F6
 7 Release recalculation = consumer admissibility   → R1.3
 8 no load-bearing 3×3 interaction                  → R1.3
 9 three terminals suffice                          → R1.3
10 ApprovalRequest alone carries wait authority     → R1.3
11 origin-run guard compatible, needs F1 guard law  → F1/R1.3
12 DENY/EXPIRE/STALE resume safe                    → R1.3
13 newer Release never auto-invalidates in-flight   → R1.3
14 trigger enable/disable sufficient; race law needs F1 discipline → F1
15 no load-bearing current-Mastra claim; Context7 not required     → header note
16 pre-I/O SENT_NO_RESPONSE correct                 → R1.3
17 crash schedules recoverable ONLY with F2's closed-before-dispatch fact → F2
18 PARTIAL/new-attempt law neither over- nor under-blocks; unknown units conservative → M1
19 no provider-idempotency promise                  → confirmed (§5.6 explicit)
20 no missing cross-owner atomicity (Class-1 + Class-2 suffice)    → confirmed
21 settlement-vs-ambiguity representation honestly routed to 3M    → confirmed
22 ARCHIVED as control-plane freeze = safest        → R1.3 (with F4 decided)
23 restore needs no new fact; no 3B-16 conflict     → R1.3
24 recovery-vs-ordinary needs mechanical bound      → F7
25 archive must NOT disable scheduled agents (recommended Reading A; explicit decision required) → F4
26 binding stays CAS + Project gate, no durable status → R1.3
27 BUILDING/VERIFIED/AVAILABLE all needed as derived facts → R1.3
28 recheck at compose AND promote both required     → R1.3
29 no additional terminal for serve-verification failure → R1.3
30 maintenance-required cleanly separated from 3M   → R1.3
31 no authority cycle in archive+active+rollback    → R1.3 (after F7)
32 DEDICATED residue does not block closure         → R1.3
33 explicit Release retirement = YAGNI until consumer → R1.3
34 served Release after drift violates no invariant → R1.3
35 expiry × cancel: both derived/guarded paths refuse claim; no write conflict → safe
36 ALLOW_ONCE then cancel before FIRST_CLAIM: claim refused by origin-run guard (F1);
   request rests APPROVED_UNCLAIMED and expires silently; no STALE (correct — no B2 mismatch) → safe
37 admission commits then run cancels before dispatch: resolved by F2's guarded
   close-vs-dispatch race; approval stays consumed either way → F2
38 ambiguity + new run + new Release: unrelated work proceeds; replay refused at Gateway;
   old attempt unaffected by new Release → safe
39 binding change during serve+compose: old Release pinned; compose captures guard-time intent;
   C-014 EnvironmentConformance (pinned Connection revision == active) catches drift at promote → safe
40 archive races: fail closed under Project lifecycle guard (§6.7); ordinary Promotion
   admission must restate not-archived in its guard (fold into F3's admission guard) → safe
41 acceptance drift after AVAILABLE: promote recheck refuses; Release immutable → safe
42 two Promotions, migration before losing CAS: NOT safe on current text → F3
43 maintenance migration done, crash before swap: durable step facts resume same
   Promotion idempotently or enter MAINTENANCE_RECOVERY_REQUIRED; old serving stays blocked → safe
44 DEDICATED old Release call: admissible in horizon; not rejected for newness → safe
45 floor raise at composition: compose refused until directed revalidation; history immutable → safe
```

## R1.5 Final disposition

```text
PACKAGE NEEDS ONE CONSOLIDATION ROUND
```

1. **Survivors:** 3G-04, 3G-05, 3G-06, 3G-07, 3G-08 all survive as scoped.
2. **Corrections required:** F1 (3G-05 guard law), F2 (3G-06 closed-before-dispatch fact + schedule-37 answer), F3 (3G-08 single non-terminal Promotion per Project/PROD), F4 (3G-07/05 archived × new AgentRun admission — explicit decision, Reading A recommended), F5 (3G-07 §6.6 INCEPTION wording), F6 (3G-04 checkpoint anchoring), F7 (recovery-rollback target bound), M1 (PARTIAL unknown-unit reservation clause).
3. **Delete / merge / split:** none. The five-owner partition is the smallest coherent one; every merge candidate would fuse distinct state authorities.
4. **3G-09:** not materially required. Brain/Connections/Attachments/MAR/IAM behavioral semantics are already frozen by C-007/C-011/C-013/C-015/C-016; remainder is realization.
5. **Reopen 3B–3F / 3G-01..03:** NO for all. Every finding is a correction inside the candidates; F1 and F3 apply existing disciplines (3G-01 §10, C-014) rather than changing them.
6. **Path to closure:** after exactly **one** consolidation round incorporating F1–F7/M1 into the candidate texts, the package is ready for operator review and 3G can proceed directly to 3G-R1. The 3G-R1 closure burden should additionally verify, end-to-end, the three corrected schedules (36/37/42) and the F4 decision as ratified.
7. **No new machinery:** all corrections are guards, write-once facts inside approved records, or explicit sentences — zero new modules, records, FKs, atomicity classes, schedulers, engines or public codes. The package-level YAGNI table in §9 remains true after consolidation.