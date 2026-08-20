# 3M — Failure & Recovery Architecture Candidate

> **NON-AUTHORITATIVE / REVIEWED CANDIDATE / TEMPORARY WORK**
>
> This file is not current Product/architecture authority. It does not close 3M, change `docs/roadmap.md`, ratify C-018, authorize Product implementation, or reopen 3L. Fable Round 1 is complete; no material contradiction survives. Operator ratification of the material first-installation operations refinements in §7 is still required before durable projection and closure.

## 0. Identity and current disposition

```text
Phase                              = 3M — Failure & Recovery Architecture
Roadmap                            = NEXT / NOT STARTED
Candidate outcome                  = CURRENT STRUCTURE CONFIRMED + BOUNDED RECOVERY SEMANTICS
Fable Round 1                      = COMPLETE
Material contradictions surviving = 0
Round 2                            = NOT JUSTIFIED
3L requalification                = NO under this correction path
C-018                              = NOT RATIFIED
Product implementation             = BLOCKED

new Product capability             = 0
new semantic owner                 = 0
new Hub domain module              = 0
new durable record class           = 0
new database/schema                = 0
new cross-owner transaction        = 0
new generic retry/recovery engine  = 0
new pre-C-018 runtime probe        = 0

proposed first-installation operational refinements = 7
operator ratification required before authority projection = YES
```

3M covers only already-reachable F1 surfaces:

```text
Builder / ActorRun
PAR / AgentRun / ApprovalRequest / AgentTrigger
MAR / JobRun — current governed-sync consumer
Capability Gateway / governed effects
Release / Promotion / migration / serving
first-installation disaster restore and reactivation
```

Still deferred unless a real trigger fires:

```text
HA / auto-failover / multi-region
PITR as a Product requirement
DurableAgent active-run recovery/reconnect
EVENT triggers
cross-host managed execution
Temporal/universal Workflow lifecycle
generic saga/compensation/recovery domain
replicated zero-loss effect ledger
DEDICATED physical deployment
```

## 1. Evidence, root cause and Global Maximum

Current Product/architecture/decision authority remains sovereign. Framework docs, provider docs and review output are Evidence only; exact 3L pins and accepted qualification decide version-specific framework claims.

Root failure class:

```text
physical/runtime state becomes incomplete, stale, lost or ambiguous
+
owner durable truth and/or external reality may have progressed differently
→ mechanism guesses success, continuity, current authority or replay permission
```

Target invariant:

> After interruption or restore, Conexus must decide continuation, successor admission, reconciliation, refusal and reactivation through the correct existing owner and admissible Evidence, without fabricating success, silently widening authority, or promoting runtime/provider/queue state into Product truth.

Credible alternatives were re-checked under the Method and Fable challenge:

```text
Generic Recovery owner/engine         = REJECTED; duplicates five accepted lifecycles.
Framework-owned recovery              = REJECTED as authority; framework remains mechanics.
Temporal/universal durable Workflow   = REJECTED F1; no current consumer, does not remove effect settlement.
Owner-local recovery + narrow
operational coordination              = GLOBAL MAXIMUM CONFIRMED.
```

No additional pre-C-018 probe is justified: the remaining falsifiers require real Product owner records/transitions and integrated paths, not larger fixtures.

## 2. Recovery laws

Existing structural laws remain owned where they already live — especially `mechanism != authority`, `unknown/missing/partial != success`, telemetry not owner terminal truth, Gateway effect authority, exact Release composition and Builder lineage. 3M cites rather than duplicates them.

### R-01 — recovery is owner-local

No generic recovery authority or universal recovery FSM exists. Each existing owner decides the meaning of interruption and recovery for its own lifecycle.

### R-02 — normal restart is surface-scoped

A restart of the same positively established durable generation reconciles only affected owner/surface state. An unresolved surface does not automatically block unrelated owners.

### R-03 — continuation requires positive owner-specific basis

The same execution identity may continue only when its owner can positively establish the basis required by that surface. Failure to prove continuity never becomes continuity by convenience.

### R-04 — stop, timeout and process loss are not rollback

```text
cancel requested != quiescent != rolled back
timeout          != terminal outcome
process death    != transaction/effect rollback proof
```

Owner-specific settlement/reconciliation precedes retry or successor admission. Late runtime/substrate output never regains authority by arrival alone.

### R-05 — one logical effect intent has one Gateway replay identity

For governed external effects:

```text
one logical effect intent
→ one Gateway-owned semantic effect/replay identity
→ derived server-side from exact sealed effect subject
   + owner-stable intent/context facts admitted by the capability
→ independent of runtime/model/AgentRun/transport attempt
→ stable across retry/recovery of that intent
→ never allocated from a counter/sequence namespace that a restored generation can reuse
```

Identical payload/subject does not mean all future legitimate repetitions are the same intent. The capability/connector defines the semantic **idempotency/reconciliation scope** that distinguishes duplicate risk from a later legitimate intent.

That scope is not trusted as arbitrary author metadata: it must be validated through the existing Connection/capability qualification and exact Release composition gates. A deliberately under-declared scope is a required first-build negative falsifier.

### R-06 — unresolved effect truth fences new admission, not only replay

Gateway refuses a new effect admission when it could duplicate unresolved effect truth inside the validated idempotency/reconciliation scope. A fresh AgentRun, ApprovalRequest, JobRun, transport attempt or process restart cannot bypass the unresolved Gateway fence.

Provider/SDK retry is permitted only when bounded by Gateway policy and preserving the same semantic effect/replay identity. Upstream runtimes never become an independent semantic retry layer.

### R-07 — disaster restore is not restart

A disaster restore may reintroduce an older generation. Missing facts after the protected cutoff do not prove that an effect, revocation, approval decision, trigger change, execution or authored change never happened.

### R-08 — normal PROD requires positive generation continuity

Normal restart/PROD admission requires positive evidence that the running installation continues the current generation. Missing, unreadable or unknown continuity evidence is `UNKNOWN` and enters deny-only recovery posture; absence of a recovery marker is never proof of normal continuity.

The exact continuity mechanism belongs Realization Planning. If it cannot be established without a new semantic owner/durable Product class, return to the smallest Decision Loop.

### R-09 — recovery fence is deny-only infrastructure

The disaster-recovery posture may deny normal ingress/autonomy but can never grant, widen or prove Product authority. No owner may read the fence or its clearing as evidence that an operation is permitted.

Clearing the deny is an operator/infrastructure procedure only. Re-enablement occurs through ordinary existing-owner operations. If realization requires a composite Hub-side `ActivateRecoveredProd` flow, durable activation record, or owner that consumes the fence as permission, that is an L7/owner Decision Loop amendment.

### R-10 — lost-RPO mutable authority is historical, not current by assumption

If the Hub was the only authority for a mutable fact and that fact may have changed after the recovery cutoff, the restored value is historical as-of-cutoff. Privileged/autonomous/effectful use remains fenced until the responsible existing owner re-establishes/recertifies the required current authority.

### R-11 — external effects fail closed by class during initial disaster recovery

Because an EffectAttempt created wholly in the lost interval may be absent from restored local state, initial disaster recovery must not infer a safe affected-set from locally unresolved attempts.

```text
disaster recovery active
→ all governed external-effect admission DENY by default
→ each effect-capable Gateway/Connection surface re-enabled only through existing owners
   after provider/business reconciliation establishes acceptable current safety
```

If interval-level reconciliation is insufficient, that effect surface remains fail-closed until explicit operator/business reconciliation under existing owner authority. After broad recovery posture clears, remaining faults become surface-scoped again.

### R-12 — post-cutoff canonical Git is preserved but not auto-promoted

Canonical Project/Brain Git history that survives beyond the restored Hub cutoff remains authoring/provenance truth. It is preserved and explicitly reconciled; it does not recreate lost Change/Plan/acceptance/Release/current-serving authority automatically.

Git-write-capable Builder/authoring paths remain fenced until the surviving canonical history has been reconciled against restored owner facts.

### R-13 — recoverable ciphertext requires recoverable decryption means

For every recoverable CredentialBackend ciphertext generation, the referenced decryption key generation or recovery means must also be recoverable and restore-time decryptability must be proven. Ciphertext backup custody and key/recovery-key custody remain separate, preserving the existing compromise-separation law.

### R-14 — current MAR recovery stays limited to the real F1 consumer

The current `job/v1` consumer is governed sync. Its recovery settlement is limited to:

```text
exact JobRun / Release / job pins
durable sync freshness/cursor
deterministic Project DB merge/commit state
single-flight / one-current-catch-up rules
```

No generic MAR→Gateway unresolved-effect discovery seam is admitted now. A future real **effect-capable MANAGED_JOB** reopens the smallest MAR/Gateway recovery boundary and must then establish whatever narrow correlation/discovery mechanism is actually required.

## 3. Owner-specific deltas

### Builder

Normal restart may rebind the same ActorRun only with the already-required positive compatibility, physical continuity, quiescence and contamination checks. Unknown/orphan physical lineage does not attach a replacement sandbox silently; successor work uses the existing admission rules, including `FRESH_BASE` where continuity is not positively established.

After disaster restore, in-flight physical Builder continuity is not assumed. Restored Builder owner facts plus canonical Git/result custody preserve purpose/correctness history. Post-cutoff canonical Git is preserved and reconciled before Git-write-capable authoring resumes.

### PAR

Normal restart of an exact admitted durable approval/suspension may resume the same AgentRun through the already-qualified native path when the owner ApprovalRequest and current checks remain admissible.

An ordinary actively executing AgentRun that loses its process does not reconstruct completion from Mastra snapshot/thread/trace and does not gain DurableAgent re-drive by inheritance. A later attempt requires owner admission.

After disaster restore, recovered pending ApprovalRequests/suspensions are not automatically actionable; effect-capable continuation is re-established under current owner authority.

### MAR

An already admitted exact-pinned JobRun may execute after restart when current owner facts still admit it. A RUNNING orphan settles durable sync cursor/freshness and Project DB merge/commit state before same-JobRun continuation or terminalization. Queue redelivery is never authority.

Current F1 managed-sync recovery does **not** include generic Gateway-effect settlement. Effect-capable managed work is a future reopen trigger, not dormant F1 machinery.

### Gateway

Gateway owns semantic effect identity, idempotency/reconciliation scope validation, unresolved effect truth, new-admission conflict checks, replay safety and receipts. Cancellation/reversal is a new governed effect when a provider offers a real cancel/void/refund/reverse operation; it is not rollback of the previous effect.

### Release

Recovery adds no second Promotion lifecycle. A non-terminal Promotion reconciles actual migration/pointer/served state through existing Release/Promotion authority rather than replaying the last intended step. Existing migration ledger/checksum, CAS and `SERVED_VERIFIED` laws remain authoritative by reference.

## 4. Owner-local stop / quiescence / settlement

The vocabulary below is reasoning language only. It must project into each owner reference, never into a shared lifecycle/domain:

```text
stop intent
→ owner narrows further progression
→ cooperative physical interruption where available
→ surface-specific quiescence
→ owner-specific partial-progress settlement/reconciliation
→ continuation / successor / refusal according to that owner
```

Quiescence means only that the old execution can no longer produce new mutations under its prior admission. It is not rollback and does not settle external effects.

Examples remain owner-specific:

```text
Builder   → old sandbox/incarnation cannot mutate under old admission
PAR       → no model/tool progression can reach a governed effect boundary
MAR       → no handler/redelivery can advance that JobRun
Promotion → no new material Promotion step can begin
Gateway   → local executor can be quiescent while provider outcome remains unresolved
```

## 5. Seven first-installation operational refinements — OPERATOR RATIFICATION REQUIRED

These refine the accepted operations contract; they are not smuggled in as `new requirement = 0`.

### O-01 — fail-closed generation continuity

Normal PROD starts only with positive evidence of unbroken/current generation continuity. Missing/unreadable/unknown continuity enters recovery posture.

### O-02 — one internally consistent PostgreSQL recovery generation

The mutable PostgreSQL recovery set required for F1 restores from one internally consistent PostgreSQL generation. Current first-installation topology makes this the smallest present property; exact backup mechanism is Realization Planning.

### O-03 — temporal/current authority re-establishment

Restored normal sessions are invalid for normal reuse. Normal user/effectful ingress and autonomous effectful execution remain fenced until the responsible existing owners re-establish the material privileged/autonomous/effectful authority classes required for use. The closed class enumeration is a Realization Planning + first-production proof obligation, not a new domain model.

### O-04 — external effects deny-by-default during initial disaster recovery

All governed external-effect admission is denied initially and re-enabled per existing Gateway/Connections authority only after acceptable reconciliation/current safety is established. Missing local EffectAttempts never prove a surface safe.

### O-05 — credential key-generation recoverability

Every recoverable ciphertext generation has separately custodied recoverable key-generation/recovery means, and restore proves decryptability before dependent effectful use is enabled.

### O-06 — deny-only recovery posture + per-owner reactivation

Recovery posture survives process restart and cannot grant Product state. Restricted operator/infrastructure recovery ingress may exist while normal ingress is fenced. Re-enablement is performed through existing owners; exact Release closure, EnvironmentConformance and required real serving verification precede restored serving activation.

### O-07 — RTO truthfulness

`RPO <= 6h` continues to mean a complete, off-host, verifiable recovery generation within the accepted window.

`RTO <= 8h` is the first-installation objective for **useful safe platform service**, not a guarantee that every effect-capable integration is safe within eight hours. Effect surfaces whose lost interval cannot yet be reconciled remain fail-closed beyond broad platform recovery rather than fabricating certainty. The minimum useful-safe service set is fixed in Realization Planning and proved before first production.

## 6. Cross-store closure

After PostgreSQL restore, recovered authoritative references needed for a re-enabled surface must close over their exact referenced material:

```text
Project/Brain Git identity required by recovered owner truth
immutable Artifact/Blob/CAS digest
CredentialBackend ciphertext generation
referenced decryption key-generation/recovery means under separate custody
exact Release composition and required recovery Evidence
```

Presence alone is not enough for credentials: decryptability is a recovery proof. Extra immutable bytes do not become current by existence. Newer canonical Git is treated per R-12, not as generic extra CAS.

## 7. Proof routing

### 3N — architecture verification

3N should try to falsify at least:

```text
V1  exactly one semantic owner decides each recovery meaning
V2  re-entry uses current/exact-pinned owner facts, not runtime survival
V3  unknown/partial/lost response never becomes success/replay permission
V4  owner/storage/dependency boundaries remain closed
V5  no hidden need for RecoveryEngine, DurableAgent, HA/PITR or universal Workflow
V6  positive generation-continuity / deny-only recovery posture is implementable without new owner/class
V7  stale restored authority cannot regain privileged/autonomous/effectful use by default
V8  post-cutoff canonical Git is preserved without silent deletion or authority promotion
V9  Gateway new-admission fence cannot be bypassed by a fresh AgentRun/ApprovalRequest
V10 capability idempotency/reconciliation scope cannot be accepted when deliberately under-declared
V11 current MAR recovery contains no effect-capable dependency without a real consumer
```

### First-build falsifiers

```text
Builder
→ kill after guest output before Hub custody; no authoritative late output

PAR
→ kill during admitted durable approval wait; exact continuation remains guarded
→ kill ordinary active run before PAR terminal fact; no fabricated completion

MAR
→ kill after atomic admission
→ kill RUNNING sync with partial durable cursor/merge progress
→ delayed/ignored cooperative stop does not create concurrent retry

Gateway
→ provider accepts then response disappears; no blind replay
→ fresh AgentRun proposes same unresolved logical effect intent; new admission remains fenced
→ restore rolls back local counters; provider idempotency identity must not collide across unrelated intents
→ deliberately under-declare idempotency/reconciliation scope; qualification/Release guard must reject it

Release
→ kill after migration commit before owner transition
→ kill after pointer swap before SERVED_VERIFIED; reconcile actual target
```

### First-production recovery proof

The real off-host restore proof must include:

```text
restore without establishing positive continuity evidence
→ normal PROD must remain denied

restore protected PostgreSQL generation
→ verify integrity + cross-store closure + credential decryptability
→ recovery posture survives another process restart
→ restored sessions invalid for normal reuse
→ external-effect admission deny-by-default
→ reconcile post-cutoff canonical Git before Git-write paths reopen
→ existing owners re-establish required current authority/readiness
→ EnvironmentConformance + exact serving verification
→ remove only the extra deny; no composite grant is created
```

The existing whole-Hub emergency-stop drill remains required.

### 3O / first vertical

Budget Analyzer remains the proportional first recovery consumer: read-only Sankhya sync can falsify interrupted sync, deterministic cursor/merge recovery, one-catch-up/no-backlog and exact serving without inventing a business write.

## 8. Projection destination map

Durable projection must not create a second cross-cutting authority. `docs/phases/3m-failure-recovery-architecture.md`, if useful, is a closure/result summary that routes by reference only.

### Invariants

| Item | Durable destination | Action |
| --- | --- | --- |
| R-01 owner-local recovery | `docs/architecture/index.md` structural summary + owner refs | PROJECT-NEW narrowly |
| R-02 restart surface scope | `docs/reference/release-deployment-and-operations.md` + owner refs | PROJECT-NEW |
| R-03 positive continuation basis | Builder/PAR/MAR owning refs | PROJECT-NEW deltas; cite existing Builder law |
| R-04 stop/timeout/process-loss semantics | Builder/PAR/MAR/Release owning refs | PROJECT-NEW owner-locally; no shared FSM |
| R-05 effect identity | `docs/reference/integrations-and-gateway.md` | PROJECT-NEW |
| R-06 unresolved-admission/retry fence | `docs/reference/integrations-and-gateway.md` | PROJECT-NEW |
| R-07 restore != restart | `docs/reference/release-deployment-and-operations.md` | PROJECT-NEW |
| R-08 positive generation continuity | `docs/reference/release-deployment-and-operations.md` | PROJECT-NEW |
| R-09 deny-only fence | `docs/reference/release-deployment-and-operations.md` | PROJECT-NEW; architecture cites boundary only |
| R-10 stale restored authority | `docs/reference/security-and-authority.md` + operations ref | PROJECT-NEW |
| R-11 external-effect disaster default | `docs/reference/integrations-and-gateway.md` + operations ref | PROJECT-NEW |
| R-12 post-cutoff Git | `docs/reference/builder-and-harness.md` + operations ref | PROJECT-NEW |
| R-13 credential key closure | `docs/reference/data-and-persistence.md` + operations ref | PROJECT-NEW after operator ratification |
| R-14 current MAR bounded recovery | `docs/reference/managed-execution.md` | PROJECT-NEW / DELETE premature Gateway seam |

Existing global laws such as `mechanism != authority`, `unknown != success`, telemetry not terminal truth, CAS/migration laws and Builder late-output quarantine are PROJECT-BY-REFERENCE and must not be copied as new 3M authority.

### Owner/recovery sections

| Candidate content | Destination | Action |
| --- | --- | --- |
| Builder restart/restore/Git deltas | `docs/reference/builder-and-harness.md` | PROJECT-NEW deltas only |
| PAR restart/restore deltas | `docs/reference/runtime-and-agents.md` | PROJECT-NEW deltas only |
| MAR sync recovery | `docs/reference/managed-execution.md` | PROJECT-NEW; future effect-capable trigger explicit |
| Gateway effect recovery | `docs/reference/integrations-and-gateway.md` | PROJECT-NEW |
| Release recovery deltas | `docs/reference/release-deployment-and-operations.md` | PROJECT-NEW deltas; existing Promotion law BY-REFERENCE |
| stop/quiescence/settlement vocabulary | each owning reference | PROJECT-NEW owner-locally; DELETE shared lifecycle text after projection |
| O-01..O-07 | operations/security/data/integration owning refs | PROJECT-NEW only after operator ratification |
| phase result | `docs/phases/3m-failure-recovery-architecture.md` if retained | summary/by-reference only |
| mutable phase status | `docs/roadmap.md` | only after operator ratification + successful projection/verification |

Any surviving rule with no admissible existing destination is a missing-owner signal and reopens the smallest Decision Loop; no new authority home is invented for convenience.

## 9. YAGNI / framework boundary

3M deliberately does not introduce:

```text
RecoveryService / RecoveryModule / RecoveryIncident / RecoveryAttempt
OwnerReconciler domain interface
SurfaceReadinessGate domain class
SettlementEngine / RetryCoordinator / CancellationService
JobAttempt
generic MAR→Gateway effect-discovery seam without effect-capable consumer
DurableAgent active-run recovery
universal Workflow/Temporal lifecycle
HA/PITR/multi-region/replicated effect ledger
```

Current native Mastra choices remain exactly those already qualified/admitted: direct Agent, native approval/persisted suspension, Memory scoping, role-specific instances and scheduler ingress. DurableAgent remains off and is a requalification trigger. No latest/unpinned Mastra claim is needed to decide 3M.

## 10. Reopen triggers

Reopen only the smallest affected boundary on material evidence such as:

```text
positive generation continuity cannot be established without a new owner/class
real provider cannot satisfy validated Gateway idempotency/reconciliation semantics
first real effect-capable MANAGED_JOB is admitted
single-cluster recovery-consistency assumption changes
credential key recovery cannot satisfy separate-custody security law
first-build kill tests show owner facts are insufficient
multi-host/HA/PITR/zero-loss effects become a real requirement
DurableAgent/active-run same-stream recovery is selected
EVENT triggers or broader autonomous execution are admitted
Builder/PAR topology or isolation changes
DEDICATED physical deployment creates another recovery domain
RPO/RTO cannot be met under the ratified first-installation posture
post-cutoff Git reconciliation exposes missing semantic ownership
```

Existing 3L Mastra/pg-boss/E2B requalification triggers remain in force. Availability of a newer framework feature alone is not a trigger.

## 11. Independent review result

Fable Round 1 reconstructed current authority, attacked the candidate, confirmed owner-local recovery as the Global Maximum, and produced eight material findings. The Lead accepted/adjudicated all roots; Fable then re-read the adjudication and explicitly conceded the two challenged points:

```text
M-06 Lead YAGNI position              = UPHELD
M-02 Lead effect-identity refinement  = ACCEPTED AS SUPERIOR
material contradictions surviving     = 0
Round 2 justified                      = NO
architecture Global Maximum            = OWNER-LOCAL RECOVERY CONFIRMED
3L requalification                     = NO
```

Review output remains Evidence, never authority.

## 12. Candidate closure gate

After operator ratification of §5, durable projection may proceed only if:

```text
1. every named F1 failure/recovery class has exactly one owner;
2. no generic recovery/retry authority is introduced;
3. effect identity + unresolved new-admission fence are Gateway-owned and restore-stable;
4. current MAR recovery contains only the real governed-sync semantics;
5. normal restart requires positive generation continuity;
6. disaster-recovery posture is deny-only and survives restart;
7. stale/lost-RPO authority is not treated as current by absence;
8. initial external-effect admission is deny-by-default after disaster restore;
9. credential ciphertext + required decryption means are actually recoverable under separate custody;
10. post-cutoff canonical Git is preserved/reconciled before write paths reopen;
11. proof obligations are routed to 3N/first-build/first-production/3O;
12. all surviving semantics have exactly one durable destination;
13. repository verification passes after temporary review/work files are removed from the merge candidate.
```

Only after successful projection, verification and explicit operator closure:

```text
3M = CLOSED
3N = NEXT
3O = NOT STARTED
C-018 = NOT RATIFIED
Product implementation = BLOCKED
```
