# 3G-07 — Project Lifecycle & Binding Mutation Architecture

**Status:** APPROVED pelo operador em 2026-08-16  
**Fase:** 3G — Behavioral / State Architecture  
**Authority:** sétima decisão aprovada de 3G  
**Importante:** esta decisão não constitui C-018, não encerra a Fase 3 e não autoriza implementação de produto, merge ou PR readiness.

## Decisão em uma frase

No Conexus F1, Project lifecycle é uma projeção estrutural mínima `INCEPTION | ACTIVE | ARCHIVED` derivada de Baseline approval + archive fact, governa future-intent/control-plane mutation sem virar serving authority, permite setup em INCEPTION somente quando explicitamente admitido pela authority de Inception, bloqueia ordinary Change/binding/config/Promotion authoring em ARCHIVED, preserva serving e runtime já autorizados por active Release, permite trigger `DISABLE` como narrowing live behavior, mantém bindings como immutable versions + expected-current CAS sem Binding FSM, e restringe recovery sob ARCHIVED a Releases previamente ativadas e ainda conformes.

---

## 1. Authority e provenance

Materializa sem reabrir:

- 3B-05/16 — Inception/Baseline e Archive-before-purge;
- 3C-04 — Project owns identity/lifecycle/current intent, não Builder/Release/runtime;
- 3C-10/11 — PAR/Release são owners separados;
- 3D-03/04 — InceptionInvestigation e SetProjectBinding use cases; archived serving residue roteado para 3G;
- 3F-04 — immutable typed binding versions, Git-first, expected-current CAS, no BindingSet;
- 3G-03 — Inception pre-Change runtime shape permanece open;
- 3G-05 — runtime/trigger behavior under archive;
- 3G-08 — Promotion/recovery rules;
- pacote ChatGPT↔Fable + final review.

Final review confirmou archive como authoring freeze, não unpublish, e aprovou explicit trigger DISABLE como narrowing.

---

## 2. Root cause e invariant

Erros a evitar:

```text
Project archive => hidden unpublish
Project archive => mass cancel runtime
Project intent mutation => live Release mutation
restore => auto latest adoption
binding needs health status mirror
"recovery" label => bypass archive
```

Target invariant:

> **Project lifecycle controla o que pode ser autorado/adotado para o futuro; Release/runtime controlam o que já está servido/executando. Archive não expande authority e não causa efeitos cross-owner ocultos.**

---

## 3. Minimal lifecycle projection

Sem generic FSM engine.

```text
ARCHIVED
  if explicit archive fact present

INCEPTION
  if not archived AND no approved Project Baseline

ACTIVE
  if not archived AND approved Project Baseline exists
```

Exact field/enum não é frozen.

Não nasce `DISABLED` como sinônimo de not-served.

---

## 4. INCEPTION

Admite somente flows necessários para estabelecer Project intent inicial sob authority existente:

```text
Inception investigation
Baseline candidate/proposal/approval
canonical repository setup
necessary connection/brain/config setup explicitly admitted by existing Inception authority
```

Não congela a forma operacional do Inception runtime.

Initial normal Builder Change permanece bloqueado até approved Baseline conforme prior authority.

### 4.1 Binding during Inception

Binding SET/UNBIND gate não exige universalmente ACTIVE.

Regra:

```text
Project lifecycle admits this mutation
  = ACTIVE
  OR INCEPTION setup explicitly admitted by current Inception authority
AND specialized owner checks pass
AND expectedCurrentBindingRef matches
→ mutation may commit
```

Isso não inventa pre-Change ActorRun/Change shape.

---

## 5. ACTIVE

Admite ordinary current-intent evolution sob specialized gates:

```text
new Change
Baseline revision flow
ProjectConnectionBinding SET/UNBIND
ProjectBrainBinding SET/UNBIND
Config Contract revision
trigger/config authoring
Release compose/promote under Release rules
```

Project lifecycle nunca substitui owner-specific validation/authority.

---

## 6. ARCHIVED

Archive é explicit Project owner fact, guarded/CAS, e congela authority expansion/future intent.

Ordinary mutations recusadas:

```text
new Change admission
binding SET/UNBIND
new Baseline/config adoption
ordinary new Release composition/promotion
new trigger CREATE
trigger ENABLE / RE-ENABLE
trigger semantic reconfiguration
ordinary control-plane/dev authoring invocation requiring ACTIVE intent
```

Preservados:

```text
history/read/audit/export
existing immutable bindings/releases
active Release pointer owned by Release
already-admitted runtime
serving-rooted runtime admissions per 3G-05
recovery actions narrowly bounded below
```

Archive nunca apaga ou cascata resources.

---

## 7. Archived Project with active Release

Esta decisão fecha F3D04-R2:

```text
archive Project
-X-> active pointer mutation
-X-> automatic unpublish
-X-> cancel in-flight AgentRun
-X-> disable existing trigger automatically
```

Enquanto active Release existe, continuam como runtime behavior:

```text
MANAGED serving
served conversation/request → new AgentRun
pre-existing enabled trigger → new AgentRun
DEDICATED exact ReleaseRef path while independently admissible
```

Tudo continua sujeito a current last-mile security/health/approval/budget gates.

### 7.1 Explicit trigger DISABLE exception

Enquanto archived:

```text
existing enabled trigger → DISABLE allowed
```

porque reduz live behavior.

Continua proibido:

```text
CREATE
ENABLE
RE-ENABLE
semantic expansion/reconfiguration
```

Rationale:

```text
DISABLE trigger = narrowing live behavior without another stop path
UNBIND binding = future composition edit; already frozen and not consumed by current active Release
```

Não aplicar simetria artificial.

3K deve comunicar que Archive não significa Stop/Unpublish.

---

## 8. Archive / restore

Archive/restore são owner-local guarded mutations.

Restore, desde que purge não tenha ocorrido:

```text
approved Baseline exists → ACTIVE
no approved Baseline     → INCEPTION
```

Restore NÃO:

```text
auto-adopts latest Connection/Brain/config
auto-enables disabled triggers
creates Release
promotes Release
rewrites historical refs
```

Cada future mutation passa novamente pelos current owner gates.

---

## 9. Binding lifecycle

3F-04 já é authority:

```text
immutable historical versions
current exact ref per concrete binding key
expected-current CAS for SET/UNBIND
Git-first authoring
```

3G-07 adiciona somente Project-lifecycle admission.

Não criar:

```text
BindingState
BindingLifecycleEngine
BindingSetGeneration
global ProjectGeneration
health/qualification status mirror
```

Target deixar de ser adoptable para nova binding não reescreve history/current exact intent automaticamente; runtime eligibility é julgada por specialized owners/Release/Gateway.

`update available` permanece projection read-only.

---

## 10. Concurrency

Independent binding keys conservam independent CAS.

Archive/restore × ordinary intent mutation:

```text
archive commits first
→ later ordinary mutation refused

mutation commits first
→ archive may commit afterward
→ future mutations frozen
```

Project lifecycle fact deve participar do guarded adoption; plain stale pre-read não é suficiente quando concurrency puder alterar resultado.

Nenhuma transaction cruza Git/network/external I/O.

---

## 11. Recovery / rollback while ARCHIVED

Archive não pode prender um unsafe active serving state sem recovery path, mas "recovery" não pode ser label-based bypass.

Regra mecânica:

> **Enquanto ARCHIVED, recovery/rollback Promotion pode target somente uma Release que já tenha sido previamente ativada para o mesmo Project, provado por existing Promotion/active-pointer history, e que passe current rollback/conformance gates.**

Portanto:

```text
previously activated + currently admissible
→ recovery Promotion may proceed

never activated
→ ordinary deployment disguised as recovery
→ refused

previously activated but schema/config currently incompatible
→ rollback refused by current conformance
```

Essa regra não cria record novo.

Operator permission/security para recovery fica 3I/3K.

---

## 12. Inception runtime shape remains open

3G-07 não força synthetic Change ou ActorRun pré-Change.

Se 3H provar necessidade real de pre-Change agent execution cuja authority não cabe no work graph atual:

```text
Decision Loop
```

conforme reopen trigger existente de 3G-03.

---

## 13. Proof obligations

1. no Baseline → initial normal Change refused;
2. INCEPTION setup binding explicitamente admitida → possível sem declarar Project ACTIVE;
3. archive × binding mutation both orders → no post-archive ordinary mutation;
4. archive leaves active pointer unchanged;
5. archived served request/pre-existing trigger may continue runtime admission;
6. archive itself does not auto-disable/cancel;
7. explicit trigger DISABLE while archived stops future firing;
8. trigger ENABLE/CREATE while archived refused;
9. restore does not auto-adopt/enable/publish;
10. UNBIND affects future intent only; current served Release remains pinned;
11. never-activated Release cannot be promoted under recovery label while archived;
12. previously activated but now incompatible Release still fails rollback conformance;
13. no Project/Binding FSM engine required.

---

## 14. YAGNI

Não construir:

```text
ProjectStateMachine engine
Generic Disabled/Deleted/Purged graph
archive-triggered unpublish/cascade
archive-triggered mass run cancellation
BindingState engine
BindingSet generation
latest auto-adoption on restore
synthetic Inception Change
recovery-purpose boolean as authority bypass
```

---

## 15. Later routing

```text
physical purge/retention       → 3M/3J
archive/trigger/recovery UX    → 3K
operator permissions/revokes   → 3I
pre-Change runtime realization → 3H + Decision Loop only if needed
```

---

## 16. Reopen triggers

1. named product requirement explicitly says archive must stop serving;
2. purge lifecycle becomes current product consumer;
3. restore cannot safely reuse retained exact intent without new fact;
4. independent binding consumer requires lifecycle not derivable from immutable version + current ref;
5. recovery rollback set cannot be mechanically bounded by previous activation + current conformance.

---

## 17. Decisão ratificada

A aprovação do operador em 2026-08-16 congela:

> **Project lifecycle remains narrow: INCEPTION establishes intent, ACTIVE evolves it, ARCHIVED freezes expansion without becoming serving authority. Existing serving/runtime may continue; explicit trigger DISABLE narrows behavior; recovery is mechanically bounded to previously activated conformant Releases; bindings need no FSM.**