# 3G-R1 — Behavioral / State Architecture Final Closure

**Status:** CANDIDATE / AWAITING OPERATOR RATIFICATION / NOT AUTHORITY  
**Fase:** 3G — Behavioral / State Architecture  
**Importante:** este draft consolida o fechamento proposto de 3G após review independente do pacote inteiro. Ele NÃO fecha 3G, não atualiza `LEDGER.md`, não constitui C-018 e não autoriza implementação, merge ou PR readiness até ratificação explícita do operador.

## Decisão em uma frase

Se 3G-04..3G-08 forem ratificadas juntamente com este fechamento, o Conexus F1 encerra Behavioral / State Architecture com oito decisões coerentes e owner-local: ApprovalRequest, Change/Finding, WorkUnit/ActorRun, Planning/Rigor, Production AgentRun/Trigger, Gateway EffectAttempt, Project/Binding lifecycle e Release/Promotion; nenhum estado universal, workflow engine, queue, lease, nova durable record class ou 3G-09 é necessário, nenhuma authority anterior precisa reabrir, e os resíduos restantes pertencem explicitamente a runtime/security/deployment/product/recovery/verification posteriores.

---

## 1. Authority e provenance

Closure candidate considera:

```text
3G-01 ApprovalRequest
3G-02 Change / Finding / closure
3G-03 Work Unit / Builder ActorRun
3G-04 PlanningDepth / Rigor candidate
3G-05 Production AgentRun / Trigger candidate
3G-06 Gateway EffectAttempt candidate
3G-07 Project / Binding lifecycle candidate
3G-08 Release / Promotion candidate
```

Inputs não-autoritativos de challenge:

- `3G-FABLE-PACKAGE-remaining-behavioral-state-architecture.md`;
- `3G-FABLE-PACKAGE-remaining-behavioral-state-architecture-R2.md`.

Fable Package Final Review terminou:

```text
PACKAGE CURRENT STRUCTURE CONFIRMED
surviving candidates   = 3G-04..3G-08 all
material 3G-09         = NO
prior reopen           = NONE
new module/record/FK   = NONE
new engine/queue/lease = NONE
reachable false-success after corrections = 0 found
```

As authority-draft notes AD-1..AD-5 foram incorporadas nos respectivos drafts candidatos.

---

## 2. Global coherence — owner-local state spaces

3G fecha somente porque os state spaces permanecem distintos:

```text
PAR ApprovalRequest
Builder Change / Finding
Builder Work Unit / ActorRun
Builder PlanningDepth / Rigor
PAR Production AgentRun / AgentTrigger
Gateway EffectAttempt / Idempotency / Budget
Project lifecycle / binding intent
Release / Promotion / active pointer
```

Não existe shared state engine.

Especialmente:

```text
Builder ActorRun
!= Production AgentRun
!= Gateway effect_attempt
!= Promotion
```

E:

```text
Change ACCEPTED
!= WorkUnit acceptedDelivery
!= ActorRun DELIVERED
!= Production AgentRun COMPLETED
!= effect SUCCEEDED
!= Release AVAILABLE
!= active pointer swapped
!= SERVED_VERIFIED
```

Nenhuma dessas condições pode ser inferida por conveniência da outra.

---

## 3. End-to-end Builder → Release trace

Coherent path:

```text
Change intent
→ assertions / contract / checkpoint
→ PlanningDepth + applicable Plan
→ Work Unit immutable bounded authority
→ ActorRun attempt(s)
→ exact produced output / delivery
→ Evidence + Findings
→ Change closure
→ immutable context-pinned change_acceptance
→ ComposeRelease consumer-time recheck
→ immutable Release AVAILABLE
→ Promotion admission
→ current gates / conformance / migration
→ pointer CAS
→ SERVED_VERIFIED
```

Global laws:

- worker self-report nunca aceita Change/Release;
- Evidence incompatibility blocks current consumer, never rewrites history;
- higher rigor at closure/composition requires directed proof, not automatic success/failure rewrite;
- Release consumes Builder proof through refs, never imports Builder authority internals;
- Promotion is separate from Release existence.

---

## 4. End-to-end production agent effect trace

```text
served request / conversation / trigger
→ AgentRun admitted under exact Release
→ tool/effect proposal
→ Gateway PREPARE exact subject
→ ApprovalRequest if required
→ ALLOW_ONCE | DENY | derived EXPIRED | STALE
→ same run continues or claim attempted
→ Gateway effect_attempt admission
→ NOT_SENT
→ close-before-dispatch OR SENT_NO_RESPONSE
→ external I/O
→ RESPONSE_RECEIVED / PARTIAL / OUTCOME_UNKNOWN
→ receipt/context to AgentRun
→ run COMPLETED | FAILED | CANCELLED
```

Global laws:

- ApprovalRequest owns approval lifecycle; AgentRun does not duplicate AWAITING_APPROVAL status;
- run cancel cannot rewrite approval history;
- approval bind cannot be transferred;
- close-before-dispatch and dispatch are mutually exclusive guarded paths;
- OUTCOME_UNKNOWN is never generic FAILED/retry permission;
- PAR never becomes replay authority;
- current security/health/owner authority remains last-mile capable of narrowing old Release pins.

---

## 5. Project archive trace

```text
Project ACTIVE + active Release + enabled trigger
→ ARCHIVE
→ ordinary future intent expansion freezes
→ active pointer unchanged
→ serving continues
→ served requests / pre-existing enabled triggers may still admit runtime work
→ explicit trigger DISABLE remains allowed as narrowing
→ ordinary SET/UNBIND/CREATE/ENABLE/Promotion blocked
→ operational recovery may use previously activated conformant Release only
→ RESTORE returns ACTIVE or INCEPTION from retained Baseline truth
```

Global law:

```text
Project lifecycle != serving authority
```

Archive is not Unpublish, not Stop All, not Purge.

---

## 6. Corrected concurrency/recovery schedules

### 6.1 Schedule 36 — ALLOW_ONCE × AgentRun cancel before FIRST_CLAIM

```text
ALLOW_ONCE commits

cancel wins guard first
→ FIRST_CLAIM consumer guard refuses
→ ApprovalRequest remains historical ALLOW_ONCE/unbound until derived expiry

FIRST_CLAIM/admission wins first
→ approval becomes permanently bound
→ later AgentRun cancel cannot undo effect admission
→ Schedule 37 decides send-vs-close
```

Cross-row PAR facts must be guarded by conflicting owner-local mechanism, not plain pre-read.

### 6.2 Schedule 37 — admitted NOT_SENT × cancel before dispatch

```text
attempt = NOT_SENT + approval consumed

close wins
→ closed-before-dispatch committed
→ never send after crash/restart
→ budget settlement/release idempotent from close fact

send wins
→ SENT_NO_RESPONSE committed
→ close no longer admissible
→ external ambiguity laws apply
```

Approval remains consumed in both paths.

### 6.3 Schedule 42 — two Promotions before migration

```text
P1/P2 request same Project/PROD
→ Release-owner conflicting one-non-terminal admission guard
→ exactly one Promotion admits
→ loser performs zero migration/drain
```

No queue/lease required in single-writer F1.

### 6.4 Maintenance stuck Promotion recovery

```text
maintenance-required path crosses old-serving incompatibility point
→ durable serving-block
→ Promotion becomes stuck/fails
→ applicable recovery authority terminalizes old Promotion write-once
→ serving-block remains
→ successor recovery Promotion may admit
→ only safe forward-fix/restore/CAS path exits maintenance
```

Terminalizing failed Promotion never resurrects incompatible old serving.

### 6.5 Acceptance drift between compose and promote

```text
acceptance valid at compose
→ Release AVAILABLE
→ governance/context changes
→ promote-time consumer recheck fails
→ Release remains historical AVAILABLE
→ no pointer swap
→ on-demand successor verification restores current proof when needed
```

No fan-out stale mutation.

---

## 7. Sweep completeness

Package review swept all 46 durable classes from 3E-02.

Material 3G semantics already owned:

```text
PAR approval/run/trigger      → 3G-01/05
Builder change/work/finding   → 3G-02/03/04
Gateway effect state          → 3G-06
Project binding/lifecycle     → 3G-07
Release/promotion             → 3G-08
```

Remaining classes are already behaviorally sufficient under C-005/C-007/C-011/C-013/C-015/C-016 or require realization only:

```text
Brain proposal/health
Connections qualification/revision
Attachments/blob lifecycle
MAR job_run substrate
IAM session/access
Registry immutable artifact lifecycle
OBS append-only records
PAR conversation container
Builder coding_session continuity/correlation
```

Conclusion candidate:

```text
remaining material 3G decision = 0
3G-09 = NOT JUSTIFIED
```

---

## 8. Non-unification / no duplicate authority

The following patterns remain rejected:

```text
UniversalStatus
GenericFSM / StateRegistry
WorkflowEngine across domain owners
one shared Attempt lifecycle
one shared Retryable flag
state fan-out for current drift
OBS-derived current authority
runtime/provider self-report as domain terminal truth
mutable historical proof/release/output
```

Mechanism may be shared where commodity, but meaning stays with owner.

---

## 9. YAGNI final audit

Across 3G-04..08:

```text
new module                      0
new durable record class        0
new Tier-2 FK                   0
new cross-owner atomicity class 0
new queue/scheduler             0
new workflow engine             0
new lease/fencing               0
new public failure taxonomy     0
```

New semantic facts fit approved records only:

```text
gw.effect_attempt.closed-before-dispatch equivalent
PAR current-pending-proposal / guarded lifecycle facts
Release Promotion admission/step/terminal facts inside rel.promotion
```

Exact columns/indexes remain implementation.

---

## 10. Later routing after 3G

### 3H — Runtime & Agent Architecture

```text
Mastra AgentController / Code mapping
Production Agent runtime workflow/checkpoint/suspend/resume realization
Builder CodingSession/ActorRun/Workspace/E2B mapping
trigger schedules/signals/inbox mechanics
runtime correlation and F5 handoff realization
process interrupt / runtime liveness interfaces
```

### 3I — Security / Authority Architecture

```text
approver eligibility
post-admission cancellation/revocation authority
current authority narrowing for old Releases
DEDICATED concrete trust/credential mechanism
operator recovery permissions
network/credential trust
```

### 3J — Deployment / Operations

```text
physical serving topology
process supervision
DB/process placement
backup/restore operational topology
multi-writer topology trigger
TLS/DNS/proxy
```

### 3K — Frontend / Product Architecture

```text
archive != unpublish disclosure
trigger disable UX
release/promotion/recovery UI
status/progress projections
approval presentation
```

### 3L — Technology Qualification

```text
CX-BUILDER-MASTRA-01
CX-AGENT-MASTRA-01
E2B/Mastra current API/substrate qualification
other technology probes already routed
```

### 3M — Failure & Recovery

```text
orphan/liveness detection
output/storage custody repair
OUTCOME_UNKNOWN reconciliation/settlement
Promotion/migration physical recovery
GC/retention/purge
restore machinery
```

### 3N / 3O

```text
architecture verification
negative/concurrency/restart proof
vertical end-to-end architecture proof contract
```

---

## 11. Reopen triggers for 3G

Reopen only on material evidence, including:

1. a current durable class cannot answer admission/closure/recovery without missing behavior authority;
2. implementation exposes reachable false-success not representable by approved owner facts/guards;
3. multi-writer topology makes current owner serialization insufficient;
4. named product requirement changes archive/unpublish/automation semantics;
5. real install base requires Release retirement/support lifecycle;
6. real connector/effect breaks current traffic/idempotency/partial accounting;
7. runtime suspension reason needs new Conexus business authority;
8. PlanningDepth/Rigor axes cannot independently express a real gate;
9. state correctness requires new durable class rather than a field/projection on current owner record.

Framework preference, naming, symmetry, vendor feature or hypothetical future optionality do not reopen.

---

## 12. Closure candidate

If the operator ratifies 3G-04, 3G-05, 3G-06, 3G-07, 3G-08 and this 3G-R1 together, the intended status becomes:

```text
3G-01 = APPROVED
3G-02 = APPROVED
3G-03 = APPROVED
3G-04 = APPROVED
3G-05 = APPROVED
3G-06 = APPROVED
3G-07 = APPROVED
3G-08 = APPROVED
3G-R1 = APPROVED
3G = CLOSED / APPROVED
```

This closure would **not**:

```text
constitute C-018
close Phase 3
start product implementation
merge PR #40
preapprove 3H decisions
```

It only closes Behavioral / State Architecture and advances the architecture sequence to 3H.

---

## 13. Candidato à ratificação

> **Behavioral / State Architecture is globally coherent when each owner keeps its own state truth, cross-owner workflows remain composition rather than shared FSMs, history stays immutable while current consumers re-evaluate admissibility, ambiguity is preserved rather than hidden, and every deferred mechanism has a named later owner. Under that model, no additional 3G decision is justified.**
