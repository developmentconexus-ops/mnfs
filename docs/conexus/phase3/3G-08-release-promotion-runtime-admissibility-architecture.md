# 3G-08 — Release, Promotion & Runtime Admissibility Architecture

**Status:** CANDIDATE / AWAITING OPERATOR RATIFICATION / NOT AUTHORITY  
**Fase:** 3G — Behavioral / State Architecture  
**Importante:** este draft não altera authority existente, não fecha 3G e não autoriza implementação até ratificação explícita do operador.

## Decisão em uma frase

No Conexus F1, Release permanece versão imutável composta a partir de proof atual e Promotion permanece tentativa durável de ativação em PROD; `change_acceptance` é rechecado tanto em compose quanto imediatamente antes de steps materiais de promote, apenas uma Promotion não-terminal por `(Project, PROD)` pode existir de cada vez, recovery da mesma Promotion usa durable step facts sem queue/lease, stuck Promotion pode ser terminalizada sem apagar maintenance serving-block, rollback é nova Promotion sujeita a current conformance e, sob Project ARCHIVED, somente para Release previamente ativada, enquanto MANAGED, AgentRun e DEDICATED consomem exact Release identities sem política `latest-only` nem mutação retroativa por governance drift.

---

## 1. Authority e provenance

Materializa sem reabrir:

- C-014 — ReleaseManifest immutable composition root, Release vs Promotion, migrations, pointer CAS, rollback, maintenance-required e SERVED_VERIFIED;
- 3C-11 — Release owns composition/Promotion/active pointer; PROD é único persistent target F1;
- 3D-03/04 — ComposeRelease/PromoteRelease em L7; Release não importa Builder/MAR;
- 3G-02 — change_acceptance immutable/context-pinned e successor verification on-demand;
- 3G-04 candidate — Release-time rigor consumer admissibility;
- 3G-05 candidate — new run pins current active Release; in-flight run not rewritten;
- 3G-07 candidate — Archive freezes ordinary Promotion but not active serving/recovery;
- 3F-06 — DEDICATED exact ReleaseRef and PRESERVE support horizon;
- pacote ChatGPT↔Fable + final review.

Final review confirmou single non-terminal Promotion, maintenance recovery semantics e no need para ReleaseLease/workflow engine.

---

## 2. Root cause e invariant

Falhas a impedir:

```text
stale acceptance composes/promotes
Promotion P1/P2 migrations interleave before pointer CAS
crash causes already-run migration to repeat blindly
pointer swapped but system pretends old version active after serve failure
maintenance failed Promotion terminalizes and old unsafe serving resumes
archive recovery deploys never-served Release by label
new Release silently kills old AgentRun/DEDICATED runtime
governance drift rewrites active Release history
```

Target invariant:

> **Release history is immutable; current admissibility is evaluated at each consumer boundary; Promotion material effects serialize per Project/PROD and recover from durable owner facts; active serving truth is never rewritten to make failure look clean.**

---

## 3. Release construction facts

C-014 stages remain semantic projection, not giant FSM requirement:

```text
BUILDING
→ identity/composition work exists, not finalized

VERIFIED
→ exact manifest candidate + required composition proof exist

AVAILABLE
→ immutable Release finalized and can be considered by current consumer gates
```

Once AVAILABLE:

```text
ReleaseManifest bytes/refs immutable
```

Later drift changes current admissibility, not historical Release.

Failure before AVAILABLE never produces usable Release.

Cleanup of abandoned BUILDING stays 3M/implementation.

---

## 4. ComposeRelease gate

At compose guard, require as applicable:

```text
exact relevant change_acceptance refs resolve
acceptances are currently admissible for required context
exact result/source identity matches composition
current Rigor floor is satisfied
Registry/Brain/Connection/config/database refs resolve structurally
Project lifecycle admits ordinary composition
```

If acceptance is inadmissible:

```text
no Release AVAILABLE from that composition
→ on-demand successor verification Change per 3G-02
```

No acceptance mutation/fan-out.

Release pins the proof identities actually consumed.

---

## 5. Promotion consumer-time recheck

AVAILABLE é existence, não timeless activation permission.

Immediately before material Promotion steps, re-evaluate current gates as applicable:

```text
Project lifecycle permits this ordinary/recovery Promotion
pinned acceptance/proof remains admissible
current required Rigor satisfied
exact artifacts/bindings/Brain/config resolve
owner current eligibility/conformance
EnvironmentConformance against actual PROD
permission/effect/dependency/migration diffs required by prior authority
human Promotion approval
```

If proof drifted:

```text
Release remains AVAILABLE
Promotion refused before material steps
→ directed on-demand revalidation
```

No historical mutation.

---

## 6. One non-terminal Promotion per Project/PROD

Material Promotion steps are not commutative.

F1 law:

> **At most one non-terminal Promotion may be admitted for a given `(Project, PROD target)` at a time.**

A second Promotion request while one is non-terminal fails closed; this is refusal, not queueing.

### 6.1 Enforcement must conflict

A read-then-insert check é insuficiente sob write skew.

Admission deve ser realized por operação conflitante no Release owner, família equivalente a:

```text
uniqueness/constraint over active non-terminal condition
Release-owner serialization scope
locking/CAS guard with conflicting fact
```

Mechanism físico não é frozen; propriedade é.

Losing request performs **zero** migration/drain/material steps.

Não nasce lease ou scheduler no single-writer modular-monolith topology.

---

## 7. Promotion durable attempt

Uma Promotion = uma tentativa concreta de ativar uma exact Release em PROD.

A materially new activation attempt => new Promotion identity.

Recovery da mesma attempt somente quando step history permite continuation idempotente.

Durable step facts/projection distinguish at least:

```text
admitted/approved
pre-swap conformance/migration progress
maintenance serving-block when crossed
POINTER_SWAPPED
SERVED_VERIFIED
failure/terminal outcome where applicable
MAINTENANCE_RECOVERY_REQUIRED
```

Exact enum/storage not frozen.

L7 não owns hidden workflow state.

No external I/O under long transaction.

---

## 8. Step order / recovery

Cada irreversible/material step registra durable completion antes que o próximo dependa dele.

Recovery lê facts e não repete blindly migration/privileged step.

### 8.1 Before pointer swap

Ordinary failure deixa active pointer unchanged, salvo maintenance path já ter invalidado old serving.

### 8.2 Pointer CAS

```text
expectedGeneration == currentGeneration
→ swap to exact Release

mismatch
→ CAS_CONFLICT
```

Pointer truth comitou independentemente de served verification posterior.

### 8.3 After pointer swap

Served verification prova real served identity.

Probe failure não volta pointer/history por narrativa.

Se bounded verification falha:

```text
Promotion not SERVED_VERIFIED
active pointer remains actual committed value
recovery/rollback explicit
```

No generic automatic rollback.

---

## 9. Promotion terminalization & maintenance survival

Stuck/abandoned Promotion pode precisar de terminal write-once por applicable recovery authority antes de successor/recovery Promotion ser admitida sob single-non-terminal law.

Porém:

> **Terminalizar a Promotion não terminaliza/limpa automaticamente o maintenance serving-block.**

Se maintenance-required migration já cruzou o ponto onde old Release não pode servir:

```text
serving block remains durable
```

mesmo se a Promotion falhar/for terminalizada.

Saída continua somente por C-014 safe recovery family:

```text
forward-fix
restore where valid
safe recovery Promotion / pointer action
```

Nunca simplesmente “close Promotion → resume old incompatible serving”.

Proof de 3G-R1 deve exercitar esse schedule.

---

## 10. Migration paths

### 10.1 Backward-compatible

Old Release pode permanecer served durante migration compatível e até pointer swap.

Failure before swap pode preservar old serving somente se conformance prova segurança.

### 10.2 Maintenance-required

Ao cruzar incompatibility point:

```text
old serving blocked/drained
```

Falha posterior:

```text
MAINTENANCE_RECOVERY_REQUIRED
```

3M owns physical recovery; 3G-08 owns que old serving não reaparece silenciosamente.

---

## 11. Rollback

Rollback = **new Promotion** para older exact Release.

Antes de material step:

```text
Release resolves
current schema/config/Connection/Brain/service contracts admit target
current proof/authority gates pass
```

Se incompatível:

```text
rollback refused
```

Rollback não é:

```text
git revert
down migration
data restore
```

---

## 12. ARCHIVED Project recovery bound

Ordinary compose/promotion is blocked by 3G-07 candidate.

Recovery while archived may target only:

```text
Release previously activated for same Project
AND current rollback/conformance gates pass
```

Previous activation derives from existing Promotion/pointer history.

```text
never activated AVAILABLE Release
-X-> recovery exception
```

Isso converte purpose-label em mechanical guard.

Previously activated but now incompatible target still fails current conformance.

---

## 13. Runtime admissibility

### 13.1 MANAGED

New request resolves:

```text
active Release pointer
```

Project archive does not mutate pointer.

### 13.2 Production AgentRun

At new run admission:

```text
current active Release → exact run pin
```

Later pointer change does not mutate in-flight run; current last-mile owner/security rules still apply.

### 13.3 DEDICATED

DEDICATED presents exact ReleaseRef; it is not required to equal MANAGED current active pointer.

Law:

```text
newer Release exists
-X-> automatically invalidate older exact Release
```

Old Release remains interpretable/admissible while:

```text
applicable PRESERVE/support horizon valid
AND no independent current owner/3I authority revokes/narrows access
```

No latest-only policy, ReleaseLease, fleet registry or time retirement invented.

Explicit support/retirement lifecycle returns with real install-base consumer.

---

## 14. Governance drift after SERVED_VERIFIED

Governance/proof drift after successful serving does not automatically mutate/deactivate active pointer merely because a **new Promotion** would require new proof.

Current security/health/owner policies may block particular operations immediately.

Future release/promotion uses current proof.

Emergency global stop belongs to 3I/ops, not change_acceptance fan-out.

---

## 15. Proof obligations

1. acceptance valid compose / stale promote → Release stays AVAILABLE, promote refused;
2. directed successor verification restores proof without old acceptance mutation;
3. concurrent Promotion requests → exactly one admits, loser zero DDL/drain;
4. admission guard demonstrates write-skew exclusion;
5. crash after migration step → same Promotion recovery does not repeat blindly;
6. crash after pointer swap before verify → recovery sees actual pointer;
7. serve verification fail → no false SERVED_VERIFIED/history rewrite;
8. maintenance incompatibility crossed + stuck Promotion terminalized → serving-block survives;
9. successor recovery Promotion may admit only after prior non-terminal Promotion terminalized;
10. rollback incompatible → refused;
11. archived + never-activated target labeled recovery → refused;
12. archived + previously activated but incompatible target → refused;
13. new AgentRun after promotion uses new Release, in-flight stays old;
14. DEDICATED older in-horizon Release not rejected for newness;
15. governance drift after SERVED_VERIFIED does not auto-deactivate pointer;
16. no workflow engine/queue/lease required.

---

## 16. YAGNI

Não construir:

```text
DeploymentModule
Promotion queue/scheduler
Release workflow engine / Temporal by default
Promotion lease/fencing in single-writer F1
canary / blue-green / rollout framework
automatic rollback framework
latest-only Release admissibility
ReleaseLease / fleet registry
mutable ReleaseManifest
stale-status fan-out
persistent staging target
archive-unpublish coupling
```

---

## 17. Later routing

```text
physical migration/recovery/restore       → 3M/3J
Promotion process/runtime realization     → 3H/3J
operator recovery/security authority      → 3I
Release/promotion/rollback UI              → 3K
DEDICATED support retirement once consumer→ Decision Loop / 3I/3J
```

---

## 18. Reopen triggers

1. real DEDICATED install base requires explicit retirement lifecycle;
2. multiple deployment targets/providers gain independent lifecycle;
3. Promotion step cannot recover from existing durable facts;
4. active pointer + Promotion facts insufficient after partial migration;
5. F1 product gains explicit unpublish/deactivate serving requirement;
6. Hub becomes distributed multi-writer and needs lease/fencing;
7. one-non-terminal Promotion rule creates measured operational bottleneck requiring a different concurrency model.

---

## 19. Candidato à ratificação

Se ratificado:

> **Release stays immutable, current eligibility is checked at compose/promote, one Promotion owns PROD material activation at a time, recovery follows durable steps without hidden workflow state, maintenance safety survives failed Promotion terminalization, rollback remains explicit/currently conformant, and runtime identities never become `latest` by convenience.**
