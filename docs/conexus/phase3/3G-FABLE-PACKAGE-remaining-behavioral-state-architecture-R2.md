# 3G — ChatGPT ↔ Fable Package — Remaining Behavioral / State Architecture — R2

**Status:** WORKING PACKAGE / NON-AUTHORITATIVE  
**Phase:** 3G — Behavioral / State Architecture  
**Candidates:** `3G-04` .. `3G-08` + `3G-R1`  
**PR:** #40  
**Branch:** `agent/conexus-phase-3-system-design`  
**Continuation of:** `3G-FABLE-PACKAGE-remaining-behavioral-state-architecture.md` through `Fable Package Review — Round 1` at HEAD `7f863787d8b7930a2f88d6557ff9a697fc6b3a91`.  
**Important:** this is the single consolidation round requested by the independent review. It is not authority, does not close 3G, does not constitute C-018, and does not authorize implementation, merge or PR readiness.

---

## 0. Consolidation verdict

Fable Round 1 confirms the package partition and the sweep:

```text
3G-04 survives
3G-05 survives
3G-06 survives
3G-07 survives
3G-08 survives
3G-09 = NOT JUSTIFIED
prior reopen = NONE
one consolidation round = sufficient if corrections survive final review
```

I accept `F1`, `F2`, `F3`, `F5`, `F6`, `F7` and `M1` in substance.

I accept `F4` and choose the reviewer-recommended globally coherent reading:

> `ARCHIVED` freezes Project authoring/future-intent mutation but is **not** serving authority. Runtime admissions whose authority is already rooted in the active Release and pre-existing runtime configuration may continue until an explicit runtime/serving/narrowing action changes that authority.

This means archive does not silently unpublish, does not silently cancel in-flight runs and does not silently disable already-enabled schedules. That consequence is operator-visible and must be explicit in 3K.

One small refinement is added for final review, because it reduces operational trap without making archive serving authority:

```text
while ARCHIVED:
  disabling an already-existing AgentTrigger MAY remain admissible as an explicit narrowing action
  enabling/re-enabling/creating/changing trigger behavior remains refused until Project lifecycle admits authoring
```

Rationale: disabling reduces future execution and does not mutate Release composition; requiring restore merely to stop an automation is accidental ceremony. This refinement is non-authoritative until the final package review and operator ratification.

No other new semantic content is introduced beyond the Round-1 findings.

---

# 1. Consolidated 3G-04 — Planning Depth & Rigor Composition

## 1.1 Invariant

Two axes remain orthogonal:

```text
PlanningDepth = DIRECT | LIGHT | FULL
RigorProfile  = FAST | BOUNDED | CONTROLLED
```

Planning depth answers:

> how much explicit understanding/decomposition must be approved before execution?

Rigor answers:

> how strong must execution, isolation, evidence and verification controls be?

Neither axis may silently lower the other.

No 3×3 workflow/state matrix is authority.

## 1.2 PlanningDepth semantics

```text
DIRECT
→ correctness can be fixed/checkpointed and bounded work admitted without a separate ordered Plan artifact

LIGHT
→ explicit concise Plan/decomposition is required to make dependencies/order/handoffs/multiple bounded Work Units unambiguous while staying inside accepted architecture/authority

FULL
→ safe decomposition depends on resolving material architecture/authority/boundary alternatives or discovery whose result changes the approved Plan
```

Depth is not derived from file count, LOC, token count or technical layer count.

Examples remain representable:

```text
DIRECT + CONTROLLED
FULL   + BOUNDED
```

## 1.3 F6 — authoritative PlanningDepth selection

The applicable PlanningDepth floor is fixed by the **existing C-017/3G-02 human checkpoint approval** as part of the approved Change/contract/Plan semantic identity.

```text
agent proposes planning depth
-X-> authority

checkpoint-approved depth
→ current planning floor
```

Deterministic system/mechanical signals and operator judgment may elevate the required floor before dispatch. An agent/runtime may never lower it.

If elevation makes an explicit Plan newly required:

```text
semantic contract/plan revision
→ applicable checkpoint
→ no new dispatch before approval
```

No `PlanningClassifier` or LLM-only classifier becomes authority.

## 1.4 RigorProfile

C-017 remains authoritative:

```text
FAST < BOUNDED < CONTROLLED
```

Per Work Unit floor is the maximum of applicable:

```text
declared effects/authority risk
mechanically detected diff/artifact signals
target-environment risk
```

Unknown never lowers rigor.

Recalculate at:

```text
Work Unit / ActorRun dispatch
Change closure
Release composition
```

A higher later floor invalidates insufficient proof for the current consumer; it does not rewrite historical ActorRuns, Evidence, Change or `change_acceptance`.

System/operator may elevate; agent may not lower below the derived floor.

## 1.5 Composition law

Dispatch requires independently:

```text
planning gate passes
AND rigor gate passes
AND all other 3G-02/03 gates pass
```

At Release composition, a higher current rigor floor makes insufficient acceptance/proof inadmissible until directed revalidation. Historical proof remains immutable.

## 1.6 Proof additions

Final review must show:

1. agent proposes DIRECT but checkpoint approves LIGHT → LIGHT governs;
2. deterministic risk signal elevates planning before dispatch → new checkpoint occurs if Plan identity changes;
3. DIRECT+CONTROLLED and FULL+BOUNDED both remain reachable;
4. late rigor elevation blocks insufficient closure/composition without state fan-out;
5. no 3×3 policy matrix is necessary.

## 1.7 YAGNI

No:

```text
PlanningEngine
LLM planning classifier as authority
9-cell workflow matrix
mutable planning status fan-out
second Rigor classifier/module
```

---

# 2. Consolidated 3G-05 — Production AgentRun, Approval Continuation & Trigger

## 2.1 AgentRun semantic core

Production `AgentRun` remains PAR-owned and distinct from Builder `ActorRun`.

At admission it pins exact runtime/composition identity including the exact Release and applicable agent/model/tool/policy identities.

Terminal semantic partition remains:

```text
COMPLETED
FAILED
CANCELLED
```

Terminal is write-once owner-local truth and not a public failure taxonomy.

```text
COMPLETED
!= every external effect succeeded
```

Effect outcome remains Gateway authority.

Suspension/checkpoint/wake state remains Mastra mechanics unless a distinct Conexus business-authority fact is required.

## 2.2 Approval wait

Approval wait authority is the correlated `ApprovalRequest`; no duplicate durable `AgentRun.status = AWAITING_APPROVAL` is required.

For a non-terminal current proposal:

```text
ALLOW_ONCE
→ same AgentRun may continue
→ Gateway FIRST_CLAIM/admission attempts exact effect
```

For:

```text
DENY | EXPIRED | STALE
```

PAR continues/resumes the same non-terminal AgentRun with a typed non-effect result equivalent to:

```text
approved effect not executed
reason = denied | expired | stale
```

No automatic run terminalization and no automatic re-approval.

## 2.3 F1 — PAR cross-fact guarded admission

When an agent-origin decision/claim/admission depends on PAR-owned mutable facts, those facts are part of the **same owner-local guarded/CAS predicate or equivalent short PAR serialization** used by that admission.

At minimum, the applicable claim/admission must guard:

```text
origin AgentRun remains non-terminal
request remains the current pending proposal for that run
ApprovalRequest own 3G-01 claim guards still pass
```

For trigger firing / AgentRun admission:

```text
trigger enabled fact
+ exact trigger/version expectation as applicable
```

must likewise participate in the guarded owner-local admission.

A plain pre-read is not sufficient.

All these facts are `par.*`; this adds no cross-owner atomicity class.

Consequences:

```text
CANCELLED wins first
→ later FIRST_CLAIM for that run/proposal refuses

FIRST_CLAIM/admission wins first
→ later run cancellation does not rewrite committed effect admission
```

ApprovalRequest historical facts remain untouched.

## 2.4 Release pinning

At AgentRun admission:

```text
current active Release
→ exact run-pinned Release/composition
```

Later Release changes never mutate the in-flight AgentRun.

Current last-mile security/health/revocation still applies. A pin is compatibility identity, not irrevocable permission.

Runtime substrate upgrade follows the same law:

```text
old in-flight run → old runtime/version
new run           → new qualified runtime/version
```

No snapshot migration promise.

## 2.5 AgentTrigger

Trigger durable intent remains minimal:

```text
enabled | disabled
exact Project/Agent relationship
SCHEDULE | EVENT definition
source/version provenance as applicable
```

Firing is admission of a new AgentRun; disable-vs-fire is a guarded race.

```text
disable commits first
→ that firing cannot admit a new AgentRun

AgentRun admission commits first
→ disabling does not cancel that already-admitted run
```

No shared scheduler/overlap framework is added.

## 2.6 F4 — ARCHIVED Project and new AgentRuns

`ARCHIVED` is an authoring/control-plane freeze, **not serving authority**.

Therefore Project archive does not by itself invalidate runtime admissions already rooted in the active Release.

While an active Release remains served and independent current authority has not revoked the operation:

```text
served conversation/request path
→ may admit a new AgentRun under the active Release

pre-existing enabled AgentTrigger
→ may fire and admit a new AgentRun under the active Release

already-admitted AgentRun
→ may continue under its pinned Release
```

Archive does **not** automatically:

```text
disable triggers
cancel runs
invalidate active Release
```

Control-plane ad-hoc authoring/dev invocation is not automatically converted into a serving right merely because runtime admissions continue; it remains subject to the Project lifecycle gate of its originating surface.

### Narrowing trigger action while archived — consolidation refinement

Explicitly disabling an existing trigger is a safe narrowing action and MAY be admitted while archived.

While archived:

```text
DISABLE existing trigger → admissible narrowing action subject to normal authority
CREATE / ENABLE / RE-ENABLE / materially change trigger → refused until Project lifecycle admits authoring
```

This prevents archive from becoming an automation trap while preserving that archive itself has no hidden serving side effect.

3K must surface clearly that archive alone does not stop serving or schedules.

## 2.7 Cancel / late runtime output

Once AgentRun `CANCELLED` commits, late runtime/model/checkpoint output cannot regain PAR authority or originate a new effect through that run.

Physical interrupt is 3H mechanics.

## 2.8 Proof additions

1. ALLOW_ONCE × run CANCELLED, both orders → only guard-winning path commits authority;
2. trigger disable × firing, both orders → no post-disable half-admission;
3. archived + active Release + served conversation → AgentRun may admit;
4. archived + pre-existing enabled schedule → firing may admit;
5. archived + trigger DISABLE → permitted narrowing; later firing refused;
6. archived + trigger ENABLE/CREATE → refused;
7. newer Release → in-flight run keeps exact old composition; new run uses current active Release.

---

# 3. Consolidated 3G-06 — Gateway EffectAttempt, Idempotency & Budget State

## 3.1 EffectAttempt authority

`gw.effect_attempt` remains the sole last-mile domain authority for one admitted effect execution attempt.

Retain separate semantic dimensions:

```text
exact attempt/subject/correlation identity
traffic state
response/outcome when known
idempotency claim/ref
budget reservation/ref
pre-dispatch closure fact when applicable
original ambiguity history
```

No universal cross-domain attempt FSM is created.

## 3.2 Traffic state

```text
NOT_SENT
SENT_NO_RESPONSE
RESPONSE_RECEIVED
```

`SENT_NO_RESPONSE` is committed **immediately before** external I/O. It conservatively means the external-dispatch boundary was crossed from Conexus authority and no response is durably known.

Crash after that transition and before durable response → `OUTCOME_UNKNOWN` semantics; no generic resend.

## 3.3 Admission before I/O

Before external I/O, Gateway commits the applicable bundle using already-approved atomicity:

```text
effect_attempt = NOT_SENT
exact subject
ApprovalRequest claim when required
idempotency claim when applicable
budget reservation
required audit
```

Committed ApprovalRequest binding is permanent even if the effect never sends.

## 3.4 F2 — closed-before-dispatch fact

`NOT_SENT` alone is insufficient to distinguish:

```text
admitted and still dispatchable
vs
admitted but explicitly closed before dispatch
```

Therefore `gw.effect_attempt` carries one owner-local write-once semantic fact equivalent to:

```text
closedBeforeDispatch = absent | present(reason/provenance as applicable)
```

Exact physical field/name is not frozen.

The two competing mutations are:

```text
DISPATCH:
  traffic = NOT_SENT
  AND closedBeforeDispatch absent
  → traffic = SENT_NO_RESPONSE

CLOSE-BEFORE-DISPATCH:
  traffic = NOT_SENT
  AND closedBeforeDispatch absent
  → closedBeforeDispatch present
```

Both are guarded owner-local mutations. Exactly one may win.

Consequences:

```text
NOT_SENT + closed
→ never dispatch on recovery
→ budget may release/settle only after close fact committed
→ consumed approval remains consumed/permanently bound

NOT_SENT + not closed
→ same admitted attempt remains eligible for recovery dispatch under current authority
```

Which principal/authority may request a post-admission close belongs to 3I/owner authority; 3G-06 owns the semantic fact and race law.

No `EffectAttemptCancelled` record or queue is added.

## 3.5 Response/outcome

Durably observed response:

```text
traffic → RESPONSE_RECEIVED
+ typed operation-specific outcome/receipt
```

Known outcome semantics remain distinct from traffic/caller execution:

```text
SUCCEEDED
FAILED
PARTIAL     # only multi-unit semantics
OUTCOME_UNKNOWN
```

Atomic operations cannot be PARTIAL.

For multi-unit effects:

```text
total = succeeded + rejected + unprocessed + unknown
attempted excludes unprocessed
unknown has highest uncertainty precedence
```

## 3.6 M1 — PARTIAL budget settlement

For `PARTIAL`:

```text
succeeded units   → settle as effected
rejected units    → settle according to typed accounting
unprocessed units → release/settle as not attempted when proven
unknown units     → KEEP conservative reservation until reconciliation/settlement
```

A PARTIAL receipt never frees unknown-unit reservation merely because some units are known.

## 3.7 Idempotency

Gateway-owned idempotency law remains:

```text
same persisted idempotency identity + same exact subject
→ recover/reuse existing claim/attempt semantics

different subject under same identity
→ fail closed
```

Provider idempotency is never inferred from Conexus persistence.

`OUTCOME_UNKNOWN + same key` means recover/reconcile, not blind resend.

## 3.8 Fresh attempt/replay law

`FAILED` does not imply retry.

A new effect execution requires fresh admission under current authority.

```text
NOT_SENT + closed
→ old attempt never sends; a new subject/attempt may be admitted only through fresh authority

SENT_NO_RESPONSE / OUTCOME_UNKNOWN
→ no automatic replay

RESPONSE_RECEIVED proves safe retry under connector contract
→ fresh attempt may be admitted

PARTIAL
→ succeeded and unknown units never automatically repeat
→ new subject may contain only units proven safe for another attempt
```

If approval is required, fresh subject → fresh ApprovalRequest.

## 3.9 Ambiguity/reconciliation history

3M settlement may later add resolution, but it never erases the historical fact that the attempt was ambiguous.

Exact same-row vs linked/event mechanics remain 3M/implementation unless proof shows a new durable class is required.

Builder/PAR may read Gateway projection as evidence/context; they never mutate replay truth.

## 3.10 Proof additions

1. admission commits, run cancels before dispatch, close wins → attempt never dispatches after restart; budget not double-spent;
2. dispatch wins before close → close loses; ambiguity/outcome path governs;
3. NOT_SENT+closed recovery → no dispatch;
4. approval stays consumed in both close/dispatch orders;
5. PARTIAL unknown units retain conservative reservation;
6. unrelated non-effect work proceeds while ambiguous effect remains blocked at Gateway.

---

# 4. Consolidated 3G-07 — Project Lifecycle & Binding Mutation

## 4.1 Structural lifecycle projection

Keep the minimal owner-local projection:

```text
ARCHIVED
  if explicit archive fact exists

INCEPTION
  if not archived and no approved Project Baseline exists

ACTIVE
  if not archived and an approved Project Baseline exists
```

Exact enum/storage is not frozen.

Archive is not purge and not unpublish.

Restore removes the current archive condition and derives ACTIVE/INCEPTION from the still-existing Baseline facts; it does not auto-adopt resources or create/publish a Release.

## 4.2 Mutation admission

### INCEPTION

Permitted only under existing Inception authority, including as applicable:

```text
InceptionInvestigation
Baseline candidate/proposal/approval
canonical repo setup
necessary Project setup/binding explicitly admitted by the Inception flow
```

Initial normal Builder Change admission remains blocked until approved Baseline.

### ACTIVE

Normal Project intent mutation may proceed under specialized owner contracts/guards.

### ARCHIVED

Ordinary future-intent authoring/mutation is refused, including:

```text
new Change admission
ordinary binding SET/UNBIND
new Config Contract/Baseline adoption
ordinary new Release compose/promote
new/enabled/reconfigured triggers
```

Historical read/audit/export and explicitly safe operational recovery/narrowing remain separate owner actions, not implicit archive effects.

## 4.3 F5 — binding gate applies to lifecycle-admitted mutation, not ACTIVE only

3F-04 binding mutation now composes with Project lifecycle as:

```text
Project lifecycle admits this mutation
  where common normal case = ACTIVE
  and INCEPTION setup is allowed only when explicitly admitted by existing Inception authority
AND specialized owner new-adoption checks pass
AND expectedCurrentBindingRef matches
→ SET/UNBIND may commit
```

ARCHIVED refuses ordinary SET/UNBIND.

No Binding FSM/status is added.

## 4.4 Archive and serving

```text
archive Project
-X-> active Release pointer mutation
-X-> implicit unpublish
-X-> implicit run cancellation
-X-> implicit trigger disable
```

Existing serving remains Release/MAR authority.

Runtime-new-run semantics are those consolidated in 3G-05 §2.6.

If user needs the archive operation to stop serving, that is an explicit unpublish/deactivation consumer and returns through Decision Loop; it is not hidden inside archive.

## 4.5 F7 — archived recovery/rollback is mechanically bounded

While Project is ARCHIVED, ordinary new Release compose/promotion remains blocked.

A recovery/rollback Promotion is lifecycle-admissible only if its target exact Release is **provably in the set of Releases previously activated for that same Project** according to existing Release/Promotion/active-pointer history.

```text
ARCHIVED
+ target Release previously activated for Project
+ current Release-side rollback/conformance gates pass
+ applicable recovery authority passes
→ recovery Promotion may be admitted

ARCHIVED
+ target Release never previously activated
→ ordinary deployment disguised as recovery
→ refused
```

No recovery label is trusted as authority.

The exact operator permission is 3I/3K; the mechanical target bound is 3G.

## 4.6 Concurrency

Archive/restore races with Project-intent mutation under owner-local guard:

```text
archive wins → later ordinary mutation refuses
mutation wins → archive may then freeze future mutations
```

Independent binding slots retain independent expected-current CAS; no `BindingSetGeneration`/global Project generation is introduced.

No transaction crosses Git/network I/O.

## 4.7 Inception remains deliberately open

Nothing here forces a synthetic Change/ActorRun shape for Inception. If 3H proves a real pre-Change runtime class is necessary, use the existing Decision Loop/reopen trigger.

## 4.8 Proof additions

1. INCEPTION explicitly admitted Connection setup can SET binding without ACTIVE Baseline;
2. INCEPTION unapproved/ordinary mutation still refuses;
3. archived ordinary binding/promotion refuses;
4. archived recovery to previously-activated Release may proceed if Release gates pass;
5. archived "recovery" to never-activated Release refuses mechanically;
6. archive never changes active pointer/serving/run terminal truth.

---

# 5. Consolidated 3G-08 — Release, Promotion & Runtime Admissibility

## 5.1 Release facts

Release remains immutable once AVAILABLE.

Semantic construction conditions remain:

```text
BUILDING
VERIFIED
AVAILABLE
```

They may be derived from owner-local facts; exact enum/storage is not frozen.

Failure before AVAILABLE never yields usable Release.

Later current inadmissibility never mutates the immutable ReleaseManifest.

## 5.2 ComposeRelease consumer-time gates

At compose:

```text
required change_acceptance refs resolve
+ each proof currently admissible for required context/governance
+ exact source/result identity matches
+ current required rigor floor satisfied
+ required Registry/Brain/Connection/config/database refs structurally resolve
+ Project lifecycle admits ordinary composition
→ composition may become AVAILABLE
```

If proof is stale/inadmissible:

```text
no composition
→ on-demand successor verification Change under 3G-02 when real consumer needs it
```

No acceptance mutation/fan-out.

## 5.3 Promote consumer-time recheck

`AVAILABLE` is existence of an immutable version, not timeless activation permission.

Before material Promotion steps, re-evaluate current gates including:

```text
Project lifecycle admits this Promotion kind
pinned proof/acceptance currently admissible
current rigor floor satisfied
exact artifacts/bindings/Brain/config resolve
owner eligibility/conformance
EnvironmentConformance
permission/effect/dependency/migration diffs
human Promotion approval
```

If drift occurred after compose:

```text
Release remains AVAILABLE
Promotion refuses until current proof restored
```

If restored proof/composition identity differs, compose a new Release; never mutate old one.

## 5.4 F3 — one non-terminal Promotion per Project/PROD

Pointer CAS alone is insufficient because migration/drain/conformance steps are non-commutative.

F1 therefore freezes:

> At most one non-terminal `Promotion` may exist for a given `(Project, PROD)` at a time.

Promotion admission is an owner-local guarded mutation/check against existing Release-owned Promotion facts.

```text
no non-terminal Promotion for Project/PROD
+ all admission gates pass
→ new Promotion may admit

existing non-terminal Promotion
→ second distinct Promotion admission refused
```

Recovery/continuation of the **same** Promotion is not a second admission.

This is serialization, not a queue/scheduler/workflow engine.

It protects all pre-pointer material steps, not only the final CAS.

## 5.5 Promotion step facts / recovery

One Promotion is one concrete activation attempt for one exact Release.

Durable step facts must be sufficient to distinguish, as applicable:

```text
admitted/approved
pre-swap conformance
migration/drain progress
POINTER_SWAPPED
SERVED_VERIFIED
failure before swap
serve-verification failure after swap
MAINTENANCE_RECOVERY_REQUIRED
```

Exact enum/storage remains unfrozen.

Each material step records completion before a later irreversible step depends on it. External I/O occurs outside long transactions.

Recovery reads durable Release/Promotion facts; L7 owns no hidden workflow state.

Same Promotion may continue only where the committed step is safely/idempotently recoverable; otherwise explicit recovery takes over.

## 5.6 Pointer and served truth

Pointer swap remains CAS:

```text
expectedGeneration == currentGeneration
→ swap
else
→ CAS_CONFLICT
```

After swap, active pointer is actual serving composition authority even if served verification later fails.

`SERVED_VERIFIED` requires real serving identity proof; failure never rewrites history or pretends old Release remained active.

No generic automatic rollback.

## 5.7 Migration paths

### Backward-compatible

Old Release may serve while proven-compatible migration runs before pointer swap.

### Maintenance-required

After crossing the point where old serving is no longer safe:

```text
old serving blocked/drained
```

If completion cannot be established:

```text
MAINTENANCE_RECOVERY_REQUIRED
```

Old incompatible serving never silently resumes. Recovery mechanics are 3M/C-014.

## 5.8 Rollback / ARCHIVED recovery

Rollback is a **new Promotion** to an older exact Release, subject to current schema/config/Connection/Brain/service-contract admissibility.

It never implies git revert/down migration/data restore.

When Project is ARCHIVED, the F7 mechanical law applies:

```text
recovery target must have been previously activated for that Project
```

and all current rollback/conformance/recovery-authority gates must pass.

A never-activated AVAILABLE Release cannot be smuggled through archive as "rollback".

## 5.9 Runtime Release pinning

### MANAGED

New request resolves the active Release pointer. Archive alone does not mutate it.

### Production AgentRun

New runtime admission rooted in active serving resolves exact current active Release; in-flight run keeps its pin.

### DEDICATED

Exact ReleaseRef need not equal current MANAGED active pointer.

```text
newer Release exists
-X-> old exact Release automatically invalid
```

Old Release remains interpretable/admissible while its applicable support/PRESERVE horizon remains and no independent current 3I/owner authority revokes/narrows it.

No time-based retirement/ReleaseLease/fleet registry is introduced.

## 5.10 Drift after SERVED_VERIFIED

Governance drift after serving verification does not automatically mutate/deactivate active pointer or historical Release.

Current last-mile owner/security policy may block operations immediately. New compose/promote consumes current proof.

Emergency global stop remains explicit 3I/ops authority, not implicit acceptance-staleness fan-out.

## 5.11 Proof additions

1. two Promotions race before migration → exactly one Promotion admission succeeds;
2. second Promotion cannot perform DDL/drain while first is non-terminal;
3. same Promotion crash/recovery resumes from durable step facts without duplicate material step where idempotency is not proven;
4. archived rollback target never activated → refused;
5. archived rollback target previously activated but now schema-incompatible → refused by current rollback gate;
6. acceptance valid at compose but stale at promote → Promotion refuses; Release remains immutable;
7. pointer swap then served-check failure → pointer history remains truthful, no false SERVED_VERIFIED.

---

# 6. Consolidated 3G-R1 closure burden

If the final independent package review confirms this R2, 3G needs no additional numbered decision.

`3G-R1` must cross-review the complete behavioral/state system:

```text
3G-01 ApprovalRequest
3G-02 Change / Finding / closure
3G-03 Work Unit / Builder ActorRun
3G-04 Planning / Rigor
3G-05 Production AgentRun / Trigger
3G-06 Gateway EffectAttempt
3G-07 Project / Binding lifecycle
3G-08 Release / Promotion
```

## 6.1 Required end-to-end corrected schedules

Closure must explicitly show controls firing for at least:

### Schedule 36 — ALLOW_ONCE then run cancel before FIRST_CLAIM

```text
ALLOW_ONCE commits
→ run cancellation vs FIRST_CLAIM race
→ PAR current-run/current-proposal guarded claim decides
→ if cancel wins, claim refuses
→ ApprovalRequest historical ALLOW_ONCE remains immutable
```

### Schedule 37 — effect admission then run cancel before dispatch

```text
effect attempt admitted NOT_SENT + approval consumed
→ close-before-dispatch vs dispatch guarded race
→ close wins: never dispatch, budget release after close fact
→ dispatch wins: SENT_NO_RESPONSE/outcome ambiguity law governs
→ approval remains consumed in both orders
```

### Schedule 42 — two Promotions before migration

```text
two promotion requests
→ one-non-terminal-promotion admission guard
→ exactly one admits
→ losing request performs no migration/drain
```

### Archived Project runtime

```text
archive commits
→ active pointer unchanged
→ pre-existing active serving remains
→ served request / pre-existing enabled trigger may admit new AgentRun
→ archive itself does not disable/cancel
→ explicit trigger disable may narrow future run admission
```

### Archived recovery

```text
recovery target previously activated → may proceed if current gates pass
never-activated target → mechanically refused as ordinary Promotion
```

## 6.2 Closure success conditions

`CLOSE 3G` only if final review confirms:

```text
remaining material 3G decisions = 0
prior material reopen = 0
no duplicate state authority
no false-success path remains reachable
no runtime/framework self-report is authority
no speculative engine/record/queue/scheduler added
all realization/recovery/security/product leftovers have explicit later owner
```

If final review finds a current contradiction, correct it before authority drafting. Do not create `3G-09` for realization details.

---

# 7. Package YAGNI after consolidation

The package still adds:

```text
new module                      0
new durable record class        0
new Tier-2 FK                   0
new cross-owner atomicity class 0
new scheduler/queue             0
new workflow engine             0
new lease/fencing record        0
new public failure taxonomy     0
```

New load-bearing facts fit inside already-approved owner records:

```text
gw.effect_attempt
→ closed-before-dispatch fact

existing par.* facts
→ guarded together where admission depends on them

existing rel.promotion facts
→ one-non-terminal-per-Project/PROD admission guard
```

No new record class is implied.

---

# 8. Final independent review assignment — Fable Round 2

Review the **whole original package + Fable Round 1 + this R2 consolidation** as one system.

Do not re-run five style reviews. Try to falsify only what remains load-bearing.

## 8.1 Required attacks

1. Does F1's PAR-local guard composition actually close cancel-vs-FIRST_CLAIM and disable-vs-trigger-admission without new cross-owner atomicity?
2. Can `current pending proposal` be represented inside existing PAR facts without introducing a hidden Approval FSM or mutable second subject authority?
3. Does `closedBeforeDispatch` create any contradiction with 3F-03 permanent approval binding or 3G-01 recovery?
4. Is `NOT_SENT + closed` sufficient to make budget release and crash recovery honest in every order?
5. Does a close-vs-dispatch race need a fourth traffic state, or do separate facts remain smaller?
6. Does one non-terminal Promotion per `(Project, PROD)` actually protect all migration/drain races without creating an implicit queue/lease?
7. Could two Promotions still interleave because admission and first material step are not under one durable ownership guard?
8. Does recovery of the same Promotion need a claim/lease in the current single-writer modular-monolith topology, or is that 3J/3M only if topology changes?
9. Does the chosen F4 reading preserve `Project intent != serving authority` without allowing an archived Project to become an uncontrolled automation source?
10. Is allowing explicit trigger DISABLE while archived a globally smaller safe narrowing rule, or does it contradict the archive freeze enough that it should be removed?
11. Should runtime AgentRun admission while archived be limited exactly to active-Release serving + pre-existing enabled triggers, as consolidated, or is a broader/narrower boundary required?
12. Does F7's "previously activated Release" mechanically distinguish recovery rollback from ordinary deployment in every current case?
13. Could previously-activated-but-never-current-after-a-schema-break still be incorrectly allowed? Confirm current rollback/conformance gates close this.
14. Is F5's INCEPTION setup wording sufficient without predeciding the unresolved pre-Change runtime shape?
15. Does checkpoint anchoring of PlanningDepth make the floor deterministic enough without a second classifier?
16. Can system/mechanical elevation of PlanningDepth race dispatch; if so, which existing guard/checkpoint law settles it?
17. Does PARTIAL settlement keep unknown-unit budget conservative without blocking known unprocessed units unnecessarily?
18. Re-attack schedules 36, 37 and 42 in both commit orders.
19. Re-attack archive × active serving × schedule × trigger-disable.
20. Re-attack acceptance drift at compose/promote after these deltas.
21. Re-sweep all 46 durable classes: is there still a material 3G decision omitted?
22. Is any `3G-09` now justified by a correction introduced in R2?
23. Did any R2 correction accidentally create a new authority, record, subsystem, workflow or public contract?
24. Can 3G proceed directly to authority drafting of 3G-04..08 + `3G-R1`, or is there a concrete STOP prerequisite?

## 8.2 Finding format

For any material disagreement:

```text
claim challenged
→ concrete schedule/consumer
→ authority affected
→ root cause
→ smallest correction
→ essential vs accidental complexity
→ reopen prior authority? yes/no
→ later owner if deferred
```

## 8.3 Required final disposition

End with exactly one:

```text
PACKAGE CURRENT STRUCTURE CONFIRMED
→ ready for operator package ratification + authority drafting + 3G-R1 closure

STOP / SPLIT PREREQUISITE
→ name the exact blocking decision/evidence
```

Do **not** request another consolidation round for naming, editorial sharpening or realization detail. If the structure is sound with only non-material wording edits, list them as authority-draft notes and return `CURRENT STRUCTURE CONFIRMED`.

Do not edit `LEDGER.md`, accepted authority or product code. Append final review to this R2 file and commit/push only the R2 package.

---

# Fable Package Final Review — Round 2

**Reviewer:** Fable (independent adversarial reviewer)  
**Reviewed at HEAD:** `eaf9c317a524d796fc03386fb0d742fca218e25f`  
**Scope:** original package + Fable Round 1 + this R2 consolidation, reviewed as one behavioral/state system under DevelopmentConexus Engineering Method v1.0.0.  
**Authority basis:** 3G-01/3G-02/3G-03 approved texts, LEDGER, C-013/C-014/C-016/C-017, 3E-02 inventory, 3F-02/3F-03/3F-04/3F-06.  
**Mastra note:** no conclusion below depends on current Mastra API behavior. The single Mastra assumption in the system — durable checkpoint/suspend/resume as subordinate runtime mechanics — was frozen by 3C-10/3A-R5 and its realization stays 3H/3L. Context7 verification therefore was not required; no new Mastra claim is made.

## FR2.0 Verdict

```text
PACKAGE CURRENT STRUCTURE CONFIRMED
```

All Round-1 corrections (F1, F2, F3, F5, F6, F7, M1) are incorporated with correct semantics. The F4 decision as consolidated — archive is authoring freeze, not serving authority — plus the trigger-DISABLE narrowing refinement survive adversarial attack and are the smallest Global Maximum I can construct for that failure cluster. No material finding remains. Five authority-draft notes (AD-1..AD-5) are recorded below as **mandatory drafting content**, none of which changes structure, adds mechanism, or requires another consolidation round.

## FR2.1 Falsification results — the 24 required attacks

**1. F1 guard composition closes cancel×FIRST_CLAIM and disable×firing?** YES at the architecture level. All participating facts (`agent_run` terminality, current-pending-proposal, `approval_request` claim facts, `agent_trigger` enabled) are `par.*`, so the guard composes inside the existing Class-1 admission transaction and the standalone PAR mutations without any new cross-owner atomicity. One realization hazard is real and is captured as AD-2: under the accepted F1 PostgreSQL baseline (no SERIALIZABLE crutch, per 3G-01), restating a *different-row* fact inside a mutation predicate via a non-conflicting read does not serialize — write skew across `approval_request`/`agent_run` rows remains schedulable. The R2 text already forbids "plain pre-read" and offers "equivalent short PAR serialization", which is the correct mechanism family (locking read/CAS on the fact's row, or the owner serialization scope). Structure correct; draft must not let "predicate" be read as "subquery".

**2. Current-pending-proposal without hidden FSM?** YES. It is one owner-local mutable PAR fact (naturally realized on `par.agent_run` under the package's new-fields allowance), advanced/cleared under the same guard family. It scopes consumer-boundary admissibility only; ApprovalRequest keeps sole authority over its own lifecycle. No second subject authority, no FSM. Recorded as AD-3 so the draft names it explicitly as non-authority-bearing over the request.

**3. `closedBeforeDispatch` vs 3F-03 permanent binding / 3G-01 recovery?** NO contradiction. RECOVER_BOUND remains read-equivalent subject reconstruction; whether a recovered `NOT_SENT` attempt may still dispatch is Gateway current-attempt authority, which 3G-01 §14 explicitly leaves with Gateway. `NOT_SENT + closed → never dispatch` refines Gateway's own side without touching approval facts; the binding stays permanently consumed in every order. 3G-01 proof 17 remains satisfiable: crash-recovery of an unclosed `NOT_SENT` attempt still recovers and may dispatch.

**4. `NOT_SENT + closed` honest in every order?** YES. Close-then-crash: recovery sees the write-once close fact, never dispatches; budget release settles idempotently from the closed fact (AD-5). Dispatch-then-crash: `SENT_NO_RESPONSE` → `OUTCOME_UNKNOWN`, reservation retained, close guard can no longer fire (requires `NOT_SENT`). Close×dispatch race: both are conditional mutations on the **same** `gw.effect_attempt` row, so they conflict under the baseline isolation and exactly one wins — this pair, unlike attack 1, needs no extra serialization care.

**5. Fourth traffic state vs separate fact?** Separate fact is strictly smaller and correct. `traffic_state {NOT_SENT|SENT_NO_RESPONSE|RESPONSE_RECEIVED}` is C-016-frozen envelope vocabulary describing what crossed the boundary; disposition-before-dispatch is a different dimension. A fourth traffic value would mutate frozen vocabulary and conflate dimensions. Confirmed as consolidated.

**6. One non-terminal Promotion per (Project, PROD) protects migration/drain races?** YES, provided material steps execute only under the admitted non-terminal Promotion — which §5.5 requires. Admission refusal is not a queue (no ordering/retention promise); no lease exists or is needed.

**7. Could two Promotions still interleave between admission and first material step?** Only through the same enforcement hazard as attack 1: "at most one non-terminal" must be enforced by a conflicting guard (uniqueness over non-terminal promotions per Project/target, or admission through the Release-owner serialization scope), not by a read-then-insert. Folded into AD-2. With that, no interleaving schedule survives: the loser fails admission and performs zero DDL/drain.

**8. Same-Promotion recovery claim/lease?** Not needed. Single-authority-writer modular monolith (the 3G-03 §17 rationale carries unchanged to Release); recovery reads durable step facts. Lease/fencing returns only via the existing multi-writer reopen trigger (3J/Decision Loop).

**9. Does the F4 reading preserve `Project intent != serving authority` without an uncontrolled automation source?** YES. New-run admission while archived is bounded by: active Release serving root, pre-existing enabled trigger or served-surface origin, all last-mile owner/security/health checks, approval floors and budgets unchanged, plus the explicit DISABLE narrowing path and the mandatory 3K disclosure. Every autonomous action an archived Project can take was individually authorized before archive and remains individually revocable without restore. That is controlled, and the alternative readings are worse (silent serving degradation, or Project lifecycle becoming partial serving authority).

**10. Trigger DISABLE while archived — keep or remove?** KEEP. It is monotone narrowing, the same asymmetry family as "operator may elevate rigor, agent may never lower" and 3I revocation narrowing an in-horizon Release. The alternative (restore → disable → re-archive) transiently reopens the entire authoring surface to stop one automation — strictly more dangerous and more ceremony. The freeze is on authority *expansion*; narrowing does not contradict it. The deliberate asymmetry with binding UNBIND (still refused while archived) is coherent and worth one recorded sentence — AD-4: DISABLE narrows live runtime behavior that has no other stop path; UNBIND only edits future composition intent, which is already frozen and has no urgency while archived.

**11. Is the archived new-run boundary exactly right?** YES as consolidated: serving-rooted admissions (served conversation/request paths, pre-existing enabled triggers, DEDICATED exchange under an in-horizon exact ReleaseRef) continue; control-plane ad-hoc/dev/authoring invocation stays behind the Project lifecycle gate of its originating surface. I attempted to construct a run class that is neither and found none within approved surfaces.

**12. Does "previously activated" mechanically separate recovery from deployment?** YES. The set is provable from existing Promotion/active-pointer history — no new record, no trusted label. A never-activated AVAILABLE Release is refused mechanically in every schedule I could construct, including "compose just before archive, then claim recovery".

**13. Previously-activated-but-schema-broken target?** Closed. F7 admissibility explicitly composes with current rollback/conformance gates; C-014's `ROLLBACK_UNAVAILABLE_SCHEMA_INCOMPATIBLE` refuses the incompatible target regardless of history membership. A target whose swap committed but never reached `SERVED_VERIFIED` is honestly in the previously-activated set — it was the actual serving composition — and remains subject to the same current gates.

**14. F5 INCEPTION wording sufficient without predeciding pre-Change runtime shape?** YES. "Explicitly admitted by existing Inception authority" gates setup mutations without asserting anything about how Inception executes; §4.7 keeps the shape open with the existing reopen trigger. The §6.6-vs-§6.4 contradiction from Round 1 is resolved.

**15. Checkpoint anchoring of PlanningDepth deterministic?** YES. The floor is fixed by the existing C-017/3G-02 human checkpoint as part of approved semantic identity; deterministic signals and operator judgment elevate only; agent proposal is input, never authority. No second classifier exists to drift.

**16. Mechanical elevation × dispatch race?** Settled by an **existing** guard: elevation that changes the required Plan/contract identity is a semantic revision, and 3G-02 §12 places both contract/checkpoint mutation and dispatch admission under the same per-Change serialization root. Elevation-first → dispatch refused pending checkpoint; dispatch-first → in-flight output falls under 3G-02 §5.1 superseded-context law. No new mechanism required; this is exactly why anchoring on the checkpoint was the right correction.

**17. PARTIAL settlement conservative without over-blocking?** YES. Unknown units retain reservation until reconciliation; succeeded/rejected settle per typed accounting; unprocessed units are proven not-attempted by the C-013 accounting law itself (`attempted excludes unprocessed`), so their release requires no extra proof machinery and they are not blocked.

**18. Schedules 36/37/42, both orders:**

```text
36a cancel commits first        → guarded FIRST_CLAIM refuses; request rests APPROVED_UNCLAIMED,
                                  expires silently; ALLOW_ONCE fact immutable          → HOLDS
36b claim admission commits 1st → binding permanent; later cancel cannot rewrite
                                  committed admission; schedule 37 laws take over      → HOLDS
37a close wins                  → never dispatches, incl. after crash/restart; budget
                                  releases only after close fact; approval consumed    → HOLDS
37b dispatch wins               → SENT_NO_RESPONSE; ambiguity law governs; close guard
                                  can no longer fire; approval consumed                → HOLDS
42a P1 admitted, P2 requests    → P2 admission refused; zero DDL/drain by P2           → HOLDS
42b both request concurrently   → guarded admission (AD-2 enforcement) admits exactly
                                  one; loser performs no material step                 → HOLDS
```

**19. Archive × serving × schedule × disable:** archive commits → pointer/serving/runs/triggers untouched → firing admits new run under guards → explicit DISABLE commits → next firing refused → ENABLE/CREATE refused until restore → restore → ACTIVE re-admits authoring. All races resolve through the F1/§4.6 guard family. HOLDS.

**20. Acceptance drift compose→promote after deltas:** unchanged and correct — compose is guard-time lawful, promote recheck refuses on drift, Release stays immutable, restoration is on-demand successor verification, no fan-out. The new Project-lifecycle clause in both gates composes without circularity. HOLDS.

**21. Final re-sweep of 46 durable classes:** result unchanged from Round 1 — `brn.*` (C-011), `con.*` (C-007/C-016), `att.*` (C-015), `mar.*` (C-013), `iam.*` (C-015), `reg.*` (C-005), `obs.*` (append-only), `par.conversation`/`bld.coding_session` (container/correlation, realization). The R2 corrections added no durable class and left no class without an owner/lifecycle answer. **No material 3G decision is missing.**

**22. Does any R2 correction justify a 3G-09?** NO. `closedBeforeDispatch` lives inside 3G-06's owner scope; the Promotion guard inside 3G-08's; the PAR guard law inside 3G-05's. Nothing crosses candidates in a way that needs a new decision container.

**23. Did any R2 correction create hidden authority/record/subsystem/contract?** NO. Re-audited: one write-once field in `gw.effect_attempt`; guard predicates over existing `par.*`/`rel.*` facts; explicit lifecycle sentences. Terminal vocabularies remain distinct per owner; no public/wire code was created; no engine, queue, scheduler, lease, or fan-out entered.

**24. Proceed to authority drafting + 3G-R1?** YES — see disposition.

## FR2.2 Authority-draft notes (mandatory content; non-structural; no further consolidation round required)

**AD-1 — 3G-08: Promotion terminalization and maintenance serving-block survival.** The F3 guard makes one interaction with C-014 recovery worth stating explicitly in the drafted authority, because a naive reading could either deadlock or silently resume unsafe serving: (i) a stuck/abandoned Promotion is explicitly terminalized — write-once terminal outcome by applicable recovery authority — and only then may a successor/recovery Promotion be admitted under the one-non-terminal guard (otherwise `MAINTENANCE_RECOVERY_REQUIRED` + forward-fix would be unreachable); (ii) the maintenance-required serving-block is carried by durable serving/Release-side facts that **survive** that terminalization, so closing the failed Promotion never resumes incompatible old serving — exit remains only through C-014's CAS/restore/forward-fix; (iii) 3G-R1 closure schedules must include: maintenance-required stuck → old Promotion terminalized → recovery Promotion admitted → serving-block persists until safe serving is established. All of this is derivable from C-014 plus the R2 structure; nothing structural changes.

**AD-2 — 3G-05/3G-08: cross-row guards must conflict, not merely restate.** The drafts must state that when an admission depends on a concurrently mutable fact stored on a **different row/record** (origin-run terminality, pending-proposal, trigger enabled; absence of another non-terminal Promotion), the guard must be realized as a conflicting operation under the accepted F1 PostgreSQL baseline — a locking read/CAS on the fact's row, a uniqueness guarantee over the guarded condition, or the applicable owner serialization scope — because a non-conflicting predicate read does not exclude write-skew schedules. Same-row guarded mutations (`approval_request` decision/bind, `effect_attempt` close/dispatch) already conflict and need nothing extra. Mechanism choice stays implementation; the 3G-01 §18 "demonstrate the control firing" discipline applies to every one of these guards.

**AD-3 — 3G-05: current-pending-proposal fact.** Name it in the draft as an owner-local mutable PAR fact (naturally on `par.agent_run`), advanced/cleared under the same guard family, explicitly **not** a second authority over ApprovalRequest and never a hidden run FSM.

**AD-4 — 3G-07: record the DISABLE/UNBIND asymmetry rationale.** One sentence: while ARCHIVED, trigger DISABLE is admissible because it narrows live runtime behavior that has no other stop path short of restore; binding UNBIND stays refused because it edits only future composition intent, which archive already freezes and which nothing consumes while archived. This blocks future symmetry creep in either direction.

**AD-5 — 3G-06: budget release after close is idempotent settlement.** Crash between close-fact commit and budget release must settle idempotently from the durable closed fact on recovery; release is a consequence of the fact, never an independent write racing it.

## FR2.3 YAGNI final audit

```text
new module                      0
new durable record class        0
new Tier-2 FK                   0
new cross-owner atomicity class 0
new queue/scheduler             0
new workflow engine             0
new lease/fencing               0
new public failure taxonomy     0
duplicate state authority       0 found
runtime self-report as authority 0 found
reachable false-success path    0 found after F1–F7/M1 + AD-1
```

## FR2.4 Final disposition

Answering assignment 8.3 and the operator's questions directly: 3G-04, 3G-05, 3G-06, 3G-07 and 3G-08 stand as consolidated; nothing needs deletion, merger or split; no 3G-09 is justified; no 3B–3F or 3G-01..03 decision needs reopening; the AD-1..AD-5 notes are drafting obligations, not corrections, and 3G-R1's closure burden already lists the corrected schedules plus AD-1's addition.

```text
PACKAGE CURRENT STRUCTURE CONFIRMED
→ ready for operator package ratification + authority drafting + 3G-R1 closure
```
