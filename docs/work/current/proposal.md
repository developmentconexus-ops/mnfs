# 3M — Failure & Recovery Architecture Candidate

> **NON-AUTHORITATIVE / REVIEW CANDIDATE / TEMPORARY WORK**
>
> This document is the bounded Lead candidate for independent review. It does **not** close 3M, change `docs/roadmap.md`, ratify C-018, authorize Product implementation, reopen 3L, or supersede accepted authority by itself. If accepted after independent review and operator ratification, its surviving semantics must be projected into durable current authority and this temporary file must be deleted before merge.

## 0. Identity and scope

```text
Phase                         = 3M — Failure & Recovery Architecture
Current roadmap status        = NEXT / NOT STARTED
Candidate outcome             = CURRENT STRUCTURE CONFIRMED + BOUNDED RECOVERY SEMANTICS
Product implementation        = BLOCKED
C-018                         = NOT RATIFIED
New Product requirement       = 0
New semantic owner            = 0
New Hub domain module         = 0
New durable record class      = 0
New database/schema           = 0
New cross-owner transaction   = 0
New generic retry engine      = 0
New generic recovery engine   = 0
Pre-C-018 runtime probe       = NOT CURRENTLY JUSTIFIED
```

### F1 surfaces in scope

3M closes failure/recovery semantics only for already-reachable F1 surfaces:

```text
Builder / ActorRun
Production Agent Runtime / AgentRun / ApprovalRequest / AgentTrigger
Managed Application Runtime / JobRun
Capability Gateway / effect authority
Release / Promotion / serving / migration
first-installation disaster restore and reactivation
```

Explicit future seams remain out of scope unless review finds a present F1 invariant impossible without them:

```text
HA / auto-failover / multi-region
PITR as a Product requirement
DurableAgent active-run reconnect/re-drive
EVENT triggers
cross-host job execution
generic saga/compensation engine
generic Recovery/Workflow/Automation domain
DEDICATED physical deployment
```

## 1. Authority and method basis

Reasoning follows DevelopmentConexus Engineering Method v1.0.0 and the repository-specific authority model:

```text
current Product / architecture authority
→ current decision register + roadmap
→ detailed current references
→ accepted qualification conclusions
→ reproducible Evidence / exact pinned source
→ research / external references / historical Git
```

Primary current repository inputs:

```text
AGENTS.md
docs/index.md
docs/roadmap.md
docs/product/contract.md
docs/architecture/index.md
docs/decisions/index.md
docs/reference/builder-and-harness.md
docs/reference/runtime-and-agents.md
docs/reference/managed-execution.md
docs/reference/managed-execution-qualification.md
docs/reference/integrations-and-gateway.md
docs/reference/data-and-persistence.md
docs/reference/release-deployment-and-operations.md
docs/reference/security-and-authority.md
docs/reference/mastra/current-mapping.md
docs/reference/mastra/qualification-and-reopen-triggers.md
```

Framework-sensitive reasoning preserves the Package-B lesson: Conexus invariants remain sovereign, but realization must use native framework behavior where useful rather than forcing Mastra to imitate an imagined Conexus mechanism.

Current deciding Mastra qualification remains pinned to the accepted 3L identities, including:

```text
@mastra/core   = 1.56.0
@mastra/memory = 1.25.0
@mastra/pg     = 1.19.0
PostgreSQL     = 17.10 probe pin
```

Current/latest Mastra documentation is supporting mechanics only and does not promote newer capabilities into the qualified baseline.

## 2. Root cause and target invariant

The architecture already has durable owner facts for Builder, PAR, MAR, Gateway and Release, but 3M is the named phase that must close what happens when physical execution and durable semantic truth diverge through interruption, timeout, partial failure, process loss, retry, cancellation, orphaned work or disaster restore.

Root failure class:

```text
physical/runtime state becomes incomplete, stale, lost or ambiguous
+
owner durable state and/or external reality may have progressed differently
→ a mechanism guesses success, retry permission or continuity
```

Target invariant:

> **After interruption or restore, Conexus must decide resume, successor admission, reconciliation, refusal and safe reactivation from the correct semantic owner and admissible Evidence without fabricating success, silently widening authority, or letting runtime/provider/queue state become Product truth.**

## 3. Credible alternatives and Global Maximum

### A. Generic Recovery Engine / cross-cutting Recovery owner

Rejected for F1.

It would create a second lifecycle over Builder ActorRun, Product AgentRun, Gateway EffectAttempt, MAR JobRun and Promotion, encouraging generic statuses, generic retry policy and cross-owner persistence. Existing owners already own the meanings required to decide recovery.

### B. Framework-owned recovery

Rejected as architecture.

Mastra, pg-boss, E2B, PostgreSQL and provider SDKs may supply useful recovery/abort/retry mechanics, but none owns Conexus authority. Mastra DurableAgent recovery in current documentation may re-drive LLM and tool calls from persisted snapshots and therefore still requires idempotent/effect-safe tools; it cannot replace Gateway effect authority. It is also not part of the currently qualified F1 baseline.

### C. Universal durable workflow runtime (for example a Temporal-like central workflow lifecycle)

Rejected for current F1.

A durable workflow engine is credible where the Workflow itself is the central domain lifecycle. Conexus already has distinct semantic owners and intentionally rejects a generic Workflow/Automation domain. Adding a new workflow service/runtime now would duplicate lifecycle and operational infrastructure without a named current consumer. External Activities/effects would still require idempotency and settlement.

### D. Owner-local recovery + narrow operational coordination

**Selected candidate Global Maximum.**

```text
owner durable truth
→ owner-specific re-entry / settlement / reconciliation
→ subordinate framework/runtime mechanics where useful
→ owner-specific safe admission
```

Shared operational code may sequence startup/restore and invoke owner entrypoints, but it owns no business meaning and creates no new Product lifecycle.

## 4. Final cross-cutting invariants

### R-01 — owner-local recovery

Recovery meaning remains owned by the existing semantic owner. No generic Recovery owner or universal recovery FSM exists.

### R-02 — mechanics remain subordinate

Runtime/provider/queue/snapshot/thread/trace/process state is mechanism or Evidence. It never becomes Product authority by persistence or survival.

### R-03 — unknown remains unknown

```text
unknown / missing / partial
!= zero
!= success
!= safe retry permission
```

### R-04 — runtime retry is not effect retry permission

PAR retry, MAR retry, HTTP/client retry, queue redelivery, model/provider retry and process restart may never independently re-drive a governed business effect.

### R-05 — Gateway owns semantic effect replay

Possible external acceptance plus ambiguous response becomes Gateway-owned unresolved effect truth. Blind replay is forbidden. Safe re-drive is admitted only through the same semantic effect identity under Gateway idempotency/reconciliation rules.

### R-06 — one semantic retry layer for governed effects

Provider/SDK transport retry is permissible only when bounded by Gateway policy and provably preserves the same semantic effect/idempotency identity. Upstream runtimes do not create an independent effect retry layer.

### R-07 — cancel intent is not quiescence or rollback

```text
cancel requested
!= execution stopped
!= work rolled back
!= external effect did not happen
!= safe retry
```

### R-08 — timeout is a recovery trigger, not a terminal fact

Deadline expiry prevents further unsafe progression, initiates interruption/settlement, and does not by itself mean success, failure, rollback or retryable.

### R-09 — settlement precedes retry decision

After timeout/cancel/orphan/partial failure, owner-specific partial-progress settlement or reconciliation occurs before retry/successor admission.

### R-10 — late result cannot regain authority by arrival alone

Once an owner has settled that an execution may no longer produce authoritative output, a later runtime/substrate callback/result is revalidated against current owner truth and cannot overwrite the settled state merely because it arrived late.

### R-11 — normal restart is surface-scoped

A normal process restart reconciles only affected owner/surface state. One unresolved surface does not automatically block unrelated owners.

### R-12 — same-execution continuation requires positive basis

The same execution identity may resume only when that owner can positively establish the continuation basis required by the surface. Failure to prove continuation never becomes continuity by convenience.

### R-13 — process termination is not rollback

```text
process termination
!= transaction rollback proof
!= external effect rollback
```

Actual database/provider/target state is inspected where material.

### R-14 — restart differs from disaster restore

A normal restart preserves the current durable generation. Disaster restore may reintroduce an older generation whose missing facts do not describe the lost RPO interval.

### R-15 — missing after restore does not mean never happened

Any effect, authorization change, approval decision, trigger transition, runtime execution or authored change that could have occurred after the protected cutoff cannot be inferred as nonexistent solely because the restored generation lacks it.

### R-16 — restored generation is not active PROD

A restored generation remains under a recovery-activation fence until recovery provenance, required closure, security/currentness re-establishment, owner reconciliation, environment conformance and required serving verification have passed.

### R-17 — recovery posture survives another process crash

A disaster-recovery activation fence must survive Hub/process restart and must not depend solely on volatile memory or on application state restored from the older generation. A second crash during recovery must not silently downgrade to a normal restart. Exact mechanism is Realization Planning; no new Product owner/class is implied.

### R-18 — lost mutable authority is not reconstructible by assumption

If the Hub was the only authority for a mutable authorization fact and the fact may have changed after the protected cutoff, the restored value is historical as-of-cutoff, not automatically proven current. Recovery must conservatively re-establish/recertify the authority classes whose stale resurrection can produce privileged, autonomous or effectful actions before those actions are re-enabled.

### R-19 — post-cutoff Git truth is preserved but not auto-promoted

Canonical Project/Brain Git history that survives beyond the restored Hub cutoff remains authored/provenance truth. Newer Git commits are preserved and reconciled explicitly; they do not automatically recreate lost Hub Change/Plan/acceptance/Release/current-serving authority.

## 5. Owner-specific recovery semantics

The following words are conceptual outcomes, not a global persisted enum:

```text
resume same admitted execution
admit successor execution
reconcile uncertainty / partial progress
refuse unsafe progression
```

### 5.1 Builder / ActorRun

Current architecture already distinguishes Change, CodingSession, WorkUnit, ActorRun and physical sandbox.

Normal restart:

```text
non-terminal ActorRun
+ exact sandbox incarnation still exists
+ current compatibility
+ established quiescence
+ no material contamination
→ rebind may resume same ActorRun
```

If physical continuity is dead or unknown:

```text
unknown/orphan physical basis
→ never silently attach replacement sandbox
→ settle interrupted/orphan truth
→ successor ActorRun requires FRESH_BASE unless an independently valid continuation basis exists
```

Cancel/timeout:

```text
owner narrows/stops further execution authority
→ stop/revoke guest capabilities
→ best-effort exact-incarnation interruption
→ establish quiescence
→ inspect/custody produced output
```

Late sandbox output after owner cancellation/interruption is telemetry/quarantine until a current owner path explicitly admits it; it does not regain authority.

Disaster restore:

`mastra_builder` and E2B are not required recovery truth. Recovered Change/Plan/WorkUnit/ActorRun facts plus canonical Git/result custody preserve purpose/correctness history. In-flight Builder physical continuity is not assumed. Canonical remote Git history newer than the Hub cutoff, when it survives, must be preserved and reconciled rather than deleted or auto-promoted.

### 5.2 PAR / Product AgentRun

Durable approved suspension is deliberately different from active ordinary execution.

Normal restart, durable wait:

```text
PAR owner ApprovalRequest remains current/admissible
+ matching persisted Mastra suspension
+ exact old Release/AgentRun pins
+ current owner checks pass
→ native Mastra continuation may resume the same AgentRun
```

Active ordinary AgentRun crash:

```text
no PAR terminal owner fact
-X-> infer completion from trace/message/snapshot
-X-> silently re-drive same execution through a new runtime
```

Current F1 does not inherit DurableAgent active-run crash recovery. A fresh attempt normally requires a new current AgentRun admission.

Cancel/timeout:

PAR prevents new Product-Agent progression, propagates cooperative abort where available, and continues to rely on governed tool/Gateway owner checks. Abort after a tool/effect crossed its boundary does not undo the effect.

Scheduled Product Agent:

An already consumed trigger slot does not create hidden backlog/catch-up merely because its AgentRun was interrupted.

Disaster restore:

Recovered non-terminal PAR runtime/suspension is not automatically actionable. Old restored ApprovalRequests/snapshots cannot resume effect-capable execution merely because they were pending at the cutoff. Material intent must be re-established under current recovery authority before a new/current effectful continuation is allowed.

### 5.3 MAR / JobRun

Package D already qualifies atomic owner JobRun + private pg-boss projection admission for the tested subset.

Admitted but not physically running:

```text
committed exact-pinned JobRun
+ committed queue projection
→ restart discovers same work
→ after owner revalidation, same admitted JobRun may execute
```

RUNNING orphan:

```text
worker/process disappears
→ queue redelivery has zero semantic authority by itself
→ MAR reconciles durable cursor/freshness, Project DB progress, Gateway effects and exact pins
```

If continuation/reexecution is proven idempotent and compatible, the same JobRun may continue. If progress/effects are uncertain, MAR remains blocked pending reconciliation. F1 does not add `JobAttempt` merely to model physical tries.

Cancel/timeout:

```text
owner prevents new retry/redelivery/admission
→ cooperative signal to handler
→ establish handler quiescence
→ settle cursor/partial progress/Gateway effects
→ then decide continuation/terminalization
```

Recurrence after restart remains freshness-derived: at most one current catch-up when due, never N replayed historical intervals.

Disaster restore:

Read-only/replay-safe sync may perform one current freshness reconciliation/catch-up. Effect-capable managed work must first satisfy Gateway lost-window/replay safety.

### 5.4 Capability Gateway / governed effects

Gateway remains the semantic authority for external effect admission, idempotency, replay safety and execution receipt/traffic-state truth.

Before a request can have crossed an external boundary, a proven local failure may be safely re-requested under new/current admission.

Once the provider may have received the request:

```text
no authoritative success/rejection
→ OUTCOME_UNKNOWN / unresolved owner truth
```

Safe re-drive requires one of:

```text
provider-supported idempotency preserving the same semantic effect identity
provider reconciliation proving the effect did not apply
effect contract proving replay is idempotent under current preconditions
```

If none is available, the affected capability remains fail-closed pending operator/business reconciliation.

Cancellation/reversal is itself a new governed effect where the provider exposes a real cancel/void/refund/reverse operation; it is never a magical rollback of the prior effect.

Lost-RPO limitation is explicit:

```text
EffectAttempt created and applied entirely after backup cutoff
+ local control store lost
→ recovered Conexus may have no local record from which to discover it
```

When provider idempotency/correlation/reconciliation is insufficient, automatic correctness is impossible under the accepted RPO. The affected capability remains fail-closed. This is a known residual of the F1 RPO posture, not justification for an unrequested replicated effect ledger.

### 5.5 Release / Promotion

A non-terminal Promotion on restart reconciles actual target state rather than blindly replaying the last intended step.

Migration recovery:

```text
migration may have committed before process loss
→ inspect migration ledger/checksum + actual schema/conformance
→ continue if already correctly applied
→ apply only if proven not applied and still admissible
→ partial/drift enters explicit recovery branch
```

Pointer recovery:

```text
pointer may already be candidate Release
→ do not swap again blindly
→ perform real serving verification
→ only exact served digest match can establish SERVED_VERIFIED
```

CAS conflicts never force-write.

Cancellation before a material boundary stops progression. Cancellation after irreversible/maintenance transition does not roll back reality or silently re-enable incompatible old serving. Existing exits remain forward fix, idempotent continuation, validated restore or safe recovery Promotion.

## 6. Cancellation, timeout, quiescence and settlement

### 6.1 Stop intent

Owner first narrows further progression/admission, then signals the physical mechanism where applicable.

### 6.2 Quiescence

Quiescence is surface-specific evidence that the old execution no longer has a material path capable of producing new mutations under its prior admission.

```text
Builder   → exact sandbox/incarnation can no longer mutate under old admission
PAR       → no model/tool progression remains capable of reaching governed effect boundary
MAR       → no handler/redelivery remains able to advance that JobRun under old admission
Promotion → no new material Promotion step can begin under that Promotion
Gateway   → local executor may be quiescent while external outcome remains unsettled
```

Quiescence is not rollback and is not effect settlement.

### 6.3 Timeout positions

```text
before material boundary
→ if proven, no material partial outcome

inside local transaction
→ actual commit/rollback result decides

after external boundary may be crossed
→ Gateway unresolved effect truth unless reconciled
```

### 6.4 Framework abort mechanics

Mastra `AbortSignal`/abort, pg-boss `job.signal`, E2B/process termination, Node `AbortController` and database cancellation are cooperative/physical mechanisms. They do not prove rollback or absence of a prior external effect.

## 7. Disaster restore and reactivation

Current first-installation posture remains:

```text
single physical failure domain accepted
manual restore acceptable initially
RPO <= 6h
RTO <= 8h
off-host recoverable set required
real complete restore proof before first production
whole-Hub emergency-stop drill before first production
no HA / auto-failover / multi-region claim
```

### 7.1 Recovery consistency property

The mutable PostgreSQL recovery set required for F1 must restore from one internally consistent PostgreSQL recovery generation. Current topology places `hub_control`, `mastra_par` and production Project DBs in the same cluster, making a cluster-consistent generation the smallest current architecture. Exact backup tool is Realization Planning; current PostgreSQL physical backup/WAL/backup-manifest mechanics are supporting Evidence, not Product authority.

### 7.2 Cross-store closure

After PostgreSQL restore, every recovered authoritative reference required for activation must resolve to the exact needed material:

```text
referenced Project/Brain Git commit/tree/source
referenced immutable Artifact/Blob/CAS digest
required CredentialBackend ciphertext generation
exact Release composition and required recovery material
```

Missing required closure blocks affected activation. Extra immutable bytes do not become current merely by existence.

Canonical Git is different from generic CAS: newer canonical Git commits that survived past the Hub cutoff remain authored/provenance truth and require explicit reconciliation; they are neither discarded nor silently promoted into lost Hub operational/Release authority.

### 7.3 Recovery provenance and lost-RPO interval

Recovery records/procedure must establish the protected generation cutoff and enough provenance to know that the running installation is a restored older generation. The interval after that cutoff is uncertain. This need not create a Product `RecoveryIncident` class.

### 7.4 Sticky recovery activation fence

A disaster restore must establish a recovery posture that survives another Hub/process crash until explicit successful activation clears it. The mechanism must not rely solely on restored application state or volatile memory. Concrete host/service-manager/file/config mechanism is derived later.

### 7.5 Security/currentness re-establishment

Because lost-RPO mutable authority cannot be reconstructed from the older Hub generation, recovery must be conservative before normal ingress/autonomy returns:

```text
normal user sessions from restored generation → invalid for normal reuse
normal user/effectful ingress                 → closed until recovery authority established
autonomous PAR/MAR effectful execution        → quiesced
restored pending effectful approvals          → not directly actionable
material privileged/autonomous/effect authority classes
                                             → re-established/recertified under fresh operator recovery control
```

The exact recertification UX/data mechanics belong Realization Planning. The architecture requirement is epistemic honesty: a recovered historical grant/trigger/approval is not automatically proven current if a post-cutoff revocation/decision may have been lost.

After initial recovery activation, unresolved faults return to owner/surface scope; a broken Connection does not require unrelated Builder/administrative surfaces to remain unavailable.

### 7.6 Connections/effects after restore

Recovered ConnectionRevision/binding/ciphertext must be resolvable and qualified sufficiently for current use before effectful capability admission. A lost-window effect with insufficient provider reconciliation keeps only the affected capability fail-closed.

### 7.7 Release/serving activation

Recovered serving does not become normal PROD solely because the pointer exists. Activation requires exact Release closure, target schema/migration/conformance checks, required bindings, and real serving verification where serving is re-enabled.

### 7.8 RPO/RTO meaning

`RPO <= 6h` means the installation maintains a last complete, off-host, verifiable recovery generation within the accepted window; a scheduled job that produced a corrupt/incomplete/local-only backup does not satisfy it.

`RTO <= 8h` is the first-installation recovery objective for useful safe service. Specific unsafe capabilities may remain fail-closed beyond broad platform recovery rather than forcing the system to fabricate certainty.

## 8. Framework-native alignment and no Package-B regression

### 8.1 Mastra primitives kept native

```text
direct code-defined Agent                         = KEEP
native requireApproval / persisted suspension     = KEEP
Memory/thread substrate                           = KEEP
role-specific BuilderMastra / ParMastra           = KEEP
native scheduler mechanics behind PAR ingress     = KEEP
RequestContext as runtime/configuration substrate = KEEP
```

### 8.2 Mastra primitives not pulled forward

```text
DurableAgent active-run crash recovery = KEEP OFF / existing requalification trigger
universal Workflow wrapper              = KEEP REJECTED
advanced memory/global facilities       = KEEP OFF unless separately admitted
```

Current Mastra documentation shows newer durable-agent crash recovery can automatically re-drive orphaned runs and re-execute tool calls from the last persisted snapshot, with idempotent tools required. This supports the current decision not to use runtime recovery as effect authority. It does not establish that the currently pinned/qualified F1 baseline includes or should enable DurableAgent.

### 8.3 Qualification boundary

3L must reopen/requalify if 3M would require changing already-qualified mechanics, including enabling DurableAgent, adding active-run same-stream recovery guarantees, changing cancellation/timeout/orphan behavior of the qualified surfaces, or changing Builder/PAR process/storage topology. This candidate currently requires none of those changes.

## 9. Proof routing

### 9.1 3M architecture proof

3M itself must close reasoning, not fake Product runtime:

```text
every named F1 failure class has a semantic owner
no duplicate recovery/retry authority is introduced
restart and disaster restore differ explicitly
retry/unknown/cancel/timeout/orphan/partial progress are semantically closed
accepted future seams are not required for current correctness
proof obligations are routed to the first stage capable of falsifying them
```

No new pre-C-018 runtime probe is currently justified because remaining claims depend on Product owner records/transitions and real integrated paths that do not yet exist.

### 9.2 3N architecture verification families

3N should attempt to falsify at least:

```text
V1 authority uniqueness
V2 current/exact-pinned re-entry checks
V3 unknown preservation
V4 owner/storage boundary preservation
V5 deletion challenge: no hidden need for DurableAgent/HA/PITR/generic workflow/recovery engine
V6 recovery-latch survivability property is implementable without new semantic owner
V7 restored stale authority cannot regain privileged/autonomous/effectful use by default
V8 newer canonical Git history cannot silently become or be silently discarded as Hub current authority
```

### 9.3 First-build kill-point families

```text
Builder
→ kill after guest output before Hub custody

PAR
→ kill during durable approval wait
→ separately kill active ordinary run before PAR terminal fact

MAR
→ kill after atomic admission
→ kill while RUNNING with partial durable progress
→ handler delays/ignores cooperative stop

Gateway
→ provider accepts, response disappears
→ prove no blind replay / duplicate semantic retry layer

Release
→ kill after migration commit before owner transition
→ kill after pointer swap before SERVED_VERIFIED
```

### 9.4 First-production recovery proof

Before first production, existing operational authority already requires a real complete off-host restore and whole-Hub emergency-stop drill. 3M adds the recovery semantics that proof must exercise:

```text
restore protected generation
prove sticky recovery posture survives process restart
verify PostgreSQL recovery integrity and cross-store closure
invalidate/re-establish temporal/material authority as required
keep autonomous/effectful surfaces fenced
reconcile owner state and newer canonical Git where present
run EnvironmentConformance
verify exact serving
explicitly activate recovered PROD
```

### 9.5 3O / first vertical

Budget Analyzer is deliberately read-only and is a proportional first recovery consumer:

```text
Sankhya read
→ governed MAR sync
→ analytical Project DB
→ dashboard
```

A real vertical proof can falsify interrupted sync, freshness reconciliation, one-catch-up/no-backlog and Release serving behavior without inventing an external write merely to exercise infrastructure.

## 10. YAGNI / deletion challenge

The candidate intentionally does **not** freeze these implementation abstractions:

```text
OwnerReconciler interface
RecoveryService / RecoveryModule
SurfaceReadinessGate class
SettlementEngine
CancellationService
TimeoutService
RetryCoordinator
RecoveryIncident Product class
RecoveryAttempt Product class
JobAttempt Product class
```

Shared implementation utilities may exist later if concrete code repetition justifies them, but they do not own meaning.

The following future capabilities can be deleted from the F1 implementation plan without invalidating this architecture:

```text
DurableAgent
Temporal/universal workflow engine
HA/auto-failover
PITR requirement
multi-region
active-active
replicated zero-loss effect ledger
EVENT triggers
generic saga/compensation engine
```

If independent review finds any current invariant impossible without one of these, that is a material finding and must return to the smallest owning Decision Loop.

## 11. Reopen triggers

Reopen only the smallest implicated boundary on material evidence such as:

```text
first-build kill tests show existing owner facts cannot decide safe recovery
real provider cannot fit Gateway idempotency/reconciliation model
single-cluster recovery-consistency assumption changes
multi-host/HA/PITR/zero-loss effect requirement becomes real
DurableAgent or active-run same-stream recovery is selected
EVENT triggers or materially broader autonomous execution are admitted
Builder/PAR runtime/storage/process topology changes
DEDICATED physical deployment creates a new recovery domain
RPO/RTO cannot be met under accepted first-installation posture
post-cutoff Git reconciliation exposes missing semantic ownership
```

Existing Mastra/pg-boss/E2B qualification triggers remain in force. Preference or availability of a newer framework feature alone is not a reopen trigger.

## 12. Candidate closure test

3M may be proposed for closure only if independent review cannot falsify all of the following:

```text
1. every named F1 failure/recovery class has an owner;
2. no generic recovery/retry authority is needed;
3. Builder/PAR/MAR/Gateway/Release recovery semantics are coherent;
4. timeout/cancel/quiescence/settlement are explicit;
5. runtime retry cannot bypass Gateway effect authority;
6. normal restart and disaster restore are distinct;
7. recovery itself can crash without silently activating restored PROD;
8. lost-RPO mutable authority is treated as unknown/historical, not automatically current;
9. post-cutoff canonical Git truth is preserved without automatic authority projection;
10. no load-bearing technology uncertainty requires another pre-C-018 probe;
11. proof obligations are routed to 3N/first-build/first-production/3O;
12. no future HA/PITR/DurableAgent/workflow machinery is pulled into F1 without a current consumer;
13. global coherence review finds no material contradiction with Product, owner/storage boundaries or accepted 3L qualification.
```

If accepted and projected after independent review:

```text
3M = CLOSED
3N = NEXT
3O = NOT STARTED
C-018 = NOT RATIFIED
Product implementation = BLOCKED
```

## 13. Independent review focus

Fable should reconstruct current authority first and attack this candidate as one coherent package. At minimum challenge:

```text
A. Is owner-local recovery really the Global Maximum?
B. Does any "reconcile" wording hide a missing durable fact or impossible knowledge claim?
C. Can recovery itself crash safely without a new semantic owner?
D. Does RPO <= 6h resurrect unsafe authorization/trigger/approval/credential truth?
E. Is the conservative re-establishment of material authority sufficient, too broad, or under-specified?
F. Are newer post-cutoff canonical Git facts handled with the correct authoring-vs-operational ownership?
G. Is external-effect lost-window handling honest and sufficient under the accepted RPO?
H. Can any governed business effect be retried at more than one semantic layer?
I. Did the candidate underuse an already-qualified native Mastra primitive or overfit to newer unqualified Mastra behavior?
J. Does any proposed law actually require a new durable class/schema/transaction despite claiming zero?
K. Can any invariant/section be deleted without losing correctness?
L. Is any HA/PITR/DurableAgent/Temporal-like capability being pulled forward or incorrectly rejected despite a current consumer?
M. Are proof obligations placed at the earliest stage that can genuinely falsify them rather than proving mocks?
N. Does the candidate preserve first-installation RPO/RTO while keeping recovery operationally achievable?
```

Reviewer output is Evidence only. A finding that proposes new Product authority must return to the Decision Loop rather than enter as an automatic correction.
