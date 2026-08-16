# 3G-05 — Production AgentRun, Approval Continuation & Trigger Architecture

**Status:** APPROVED pelo operador em 2026-08-16  
**Fase:** 3G — Behavioral / State Architecture  
**Authority:** quinta decisão aprovada de 3G  
**Importante:** esta decisão não constitui C-018, não encerra a Fase 3 e não autoriza implementação de produto, merge ou PR readiness.

## Decisão em uma frase

No Conexus F1, `Production AgentRun` é uma execução PAR-owned pinada a uma composição exata, com terminal write-once `COMPLETED | FAILED | CANCELLED`; suspensão/checkpoint permanece mechanics do Mastra, `ApprovalRequest` continua a única authority do wait por aprovação, DENY/EXPIRED/STALE retomam o mesmo run como non-effect outcome em vez de terminalizá-lo, cancel/claim/trigger races usam guards PAR-local conflitantes, nova Release nunca muta run em andamento, e `ARCHIVED` congela authoring mas não mata serving nem novos runs originados por uma Release já ativa/pre-existing enabled trigger, preservando explicit trigger `DISABLE` como narrowing permitido.

---

## 1. Authority e provenance

Materializa sem reabrir:

- 3C-10 — PAR owns Conversation/AgentRun/ApprovalRequest/AgentTrigger semantics; Mastra owns runtime mechanics;
- 3F-03 + 3G-01 — exact ApprovalRequest, ALLOW_ONCE/DENY, expiry/STALE, permanent claim binding;
- 3D-02/04 — Gateway last-mile authority; PAR não re-resolve I&A;
- 3F-06 — exact ReleaseRef é runtime compatibility identity para DEDICATED;
- C-013/C-016 — ambiguity, budgets, current owner enforcement;
- 3G-07 — archive é control-plane freeze, não serving authority;
- pacote ChatGPT↔Fable + R2 Final Review.

Final review confirmou:

```text
AgentRun terminals = COMPLETED | FAILED | CANCELLED
AWAITING_APPROVAL durable AgentRun status = NOT REQUIRED
origin-run/trigger guards = REQUIRED
new Release auto-mutates in-flight run = REJECTED
archive kills serving/agents = REJECTED
trigger DISABLE while archived = KEEP as narrowing
```

---

## 2. AgentRun semantic core

AgentRun é graph distinto de Builder ActorRun.

Admission pina semanticamente:

```text
Project + Agent identity
exact ReleaseRef / Release-pinned agent/model/tool/policy composition
conversation or trigger origin
caller/authority context appropriate to surface
runtime kind/version + opaque runtime refs
correlation/evidence identity
```

Após admission:

```text
mutable current Project binding
latest agent revision
new active Release
-X-> silently mutate this run
```

---

## 3. Terminal partition

Owner-local terminal write-once:

```text
COMPLETED
FAILED
CANCELLED
```

`COMPLETED` = run terminou sua execução de agente de forma normal o suficiente para produzir output/receipts finais do run.

Não significa:

```text
all effects succeeded
Release current
all approvals allowed
business objective achieved
```

`FAILED` = run não consegue continuar/completar seu episódio atual por failure run/runtime/domain.

`CANCELLED` = applicable authority encerrou deliberadamente o run.

Não nasce quarto terminal para:

```text
SUSPENDED
AWAITING_APPROVAL
OUTCOME_UNKNOWN
STALE_RELEASE
```

---

## 4. Suspension / Mastra boundary

Process/model ausência não terminaliza AgentRun por si só.

```text
PAR domain facts
!=
Mastra checkpoint/workflow internal state
```

Mastra pode manter snapshot/checkpoint durável sem duplicação campo-a-campo em `par.*`.

Resumption sempre passa pela authority Conexus aplicável; checkpoint resumível não é permissão.

---

## 5. Approval wait / continuation

Quando tool proposal requer approval:

```text
AgentRun non-terminal
→ exact ApprovalRequest created
→ runtime may suspend
```

Não é necessário persistir `AgentRun.status = AWAITING_APPROVAL` porque o wait authority já é o ApprovalRequest correlacionado.

### 5.1 ALLOW_ONCE

Se request ainda claimable e proposal/run ainda current:

```text
same AgentRun resumes/continues
→ Gateway FIRST_CLAIM/admission
→ effect attempt under 3G-06
→ structured receipt/outcome returns
```

Approval não executa efeito por si só.

### 5.2 DENY / EXPIRED / STALE

Não auto-terminalizam AgentRun.

Run recebe semanticamente:

```text
effect was not executed
reason = DENIED | EXPIRED | STALE
```

Pode:

```text
explain
choose safe alternative
ask for changed input
finish without effect
create a genuinely new exact effect proposal
```

Nova proposal approval-required => nova ApprovalRequest. Approval antiga nunca é renovada/transferida.

Wake/timer mechanics ficam 3H.

---

## 6. Current pending proposal e claim guard

PAR mantém um owner-local mutable fact equivalente a:

```text
currentPendingProposalRef?
```

naturalmente associado ao `par.agent_run`.

Esse fato:

- escopa admissibility do consumer boundary;
- não redefine `ApprovalRequest` lifecycle;
- não é segunda subject authority;
- não cria AgentRun FSM.

Claim/effect admission dependente de agent-origin proposal exige conjuntamente:

```text
origin AgentRun non-terminal
currentPendingProposal == request proposal
ApprovalRequest claim facts still admissible
```

### 6.1 Concurrency law — cross-row facts must conflict

Quando facts concorrentes estão em rows diferentes, não basta plain pre-read/subquery.

A realization deve usar operação conflitante dentro do owner PAR, por exemplo família equivalente a:

```text
locking read/CAS on guarded fact row
owner-local serialization scope
constraint/guard that mechanically excludes write skew
```

Mechanism exato é implementation; propriedade é authority.

Same-row guards seguem CAS/conditional mutation normal.

O controle deve ser demonstrável firing conforme 3G-01.

### 6.2 Cancel × FIRST_CLAIM

```text
cancel wins first
→ claim guard refuses
→ ALLOW_ONCE history remains immutable

claim/admission wins first
→ approval binding permanent
→ later cancel cannot rewrite admitted attempt
→ 3G-06 close/dispatch laws govern what still may happen
```

---

## 7. Release pinning

New run:

```text
resolve current active Release
→ pin exact composition
```

In-flight:

```text
new Release promoted
-X-> mutate existing run
```

Old run may continue while pinned Release is interpretable/supported and no current owner/security/health authority refuses a specific capability.

Pin = compatibility identity, não irrevocable permission.

Runtime substrate upgrade idem:

```text
old run → old runtime/version
new run → new qualified runtime/version
```

Sem snapshot migration promise entre engines.

---

## 8. AgentTrigger

F1:

```text
SCHEDULE | EVENT
```

Manual/chat invocation não exige trigger record.

Current trigger facts mínimos:

```text
enabled | disabled
Project/Agent relationship
schedule/event definition
provenance/version as applicable
```

Trigger firing = guarded admission de novo AgentRun.

### 8.1 Disable × firing race

Trigger enabled fact é concurrently mutable PAR fact e participa de guard conflitante, não plain pre-read.

```text
DISABLE commits first
→ firing cannot admit run

run admission commits first
→ admitted run continues
```

Disable nunca cancela automaticamente already-admitted run.

---

## 9. ARCHIVED Project × AgentRun

A decisão adota explicitamente:

> **Archive congela expansão/authoring de intent; não vira serving authority.**

Enquanto Project ARCHIVED e existe active Release:

Continuam admissíveis, sujeitos a gates correntes:

```text
served MANAGED request/conversation → AgentRun
pre-existing enabled trigger         → AgentRun
DEDICATED exchange under admissible exact ReleaseRef → run/call as applicable
```

Bloqueados:

```text
new trigger CREATE
trigger ENABLE / RE-ENABLE
trigger semantic reconfiguration
ad-hoc control-plane authoring/dev invocation that requires ACTIVE Project intent
```

### 9.1 Explicit DISABLE while archived

`DISABLE` de trigger existente continua permitido porque reduz live runtime behavior.

Isso é deliberate narrowing:

```text
ARCHIVED + enabled trigger
→ DISABLE allowed
```

Não reabre authoring surface.

Rationale normativo:

```text
trigger DISABLE
→ narrows live behavior with otherwise no stop path short of restore

binding UNBIND
→ edits future composition intent only; archive already freezes it
```

Por isso DISABLE e UNBIND não precisam ser simétricos.

UX 3K deve deixar explícito que arquivar **não para automações nem despublica**; para parar automação, disable trigger é ação explícita.

---

## 10. Cancel / late runtime output

Terminalization write-once.

```text
AgentRun CANCELLED
→ later Mastra output/checkpoint progress may be telemetry
-X-> regain PAR authority
-X-> initiate new Gateway effect from this run
```

Physical interrupt fica 3H.

---

## 11. Proof obligations

Demonstrar pelo menos:

1. approval expires during suspension → same run resumes with non-effect outcome; no send;
2. DENY → same run can continue safely;
3. cancel before FIRST_CLAIM → claim refused;
4. FIRST_CLAIM/admission before cancel → binding remains consumed; 3G-06 decides close-vs-dispatch;
5. cross-row guard implementation excludes write skew under accepted PostgreSQL isolation;
6. newer Release during run → old run composition stable, new run uses current Release;
7. last-mile current revocation can reject operation from old pinned Release;
8. trigger disable × firing both orders → exactly expected result;
9. archived + pre-existing enabled trigger → firing may admit run;
10. archived + trigger DISABLE → future firing refused;
11. archived + ENABLE/CREATE → refused;
12. served conversation while archived remains runtime-capable under active Release;
13. late runtime output after CANCELLED cannot regain authority;
14. no durable AWAITING_APPROVAL AgentRun status is required.

---

## 12. YAGNI

Não construir:

```text
AgentRun universal FSM
Conexus workflow/checkpoint engine
scheduler parallel to Mastra by default
resume token as authority
runtime snapshot migration layer
new Release auto-migration of in-flight runs
approval auto-renewal
trigger overlap framework without consumer
archive-triggered mass cancellation
```

---

## 13. Later routing

```text
Mastra suspend/resume/wake/timer mapping → 3H/3L
physical interrupt                     → 3H
approver/cancel/revocation permissions → 3I
archive/trigger UX                     → 3K
recovery mechanics                     → 3M
```

---

## 14. Reopen triggers

1. suspension reason requires new Conexus business authority not representable by current owner facts;
2. real schedule consumer needs domain-level overlap semantics;
3. in-flight pinning fails under real Release/runtime evolution;
4. owner revocation cannot be enforced without mutating run composition;
5. named product requirement says Archive must stop serving/agents, knowingly changing Project-vs-serving authority;
6. multi-writer PAR topology requires lease/fencing beyond current owner-local serialization.

---

## 15. Decisão ratificada

A aprovação do operador em 2026-08-16 congela:

> **AgentRun é composição pinada e terminal write-once; ApprovalRequest governa approval wait, Mastra governa suspend mechanics, guard facts concorrentes devem realmente conflitar, newer Release não reescreve run, e Project archive não despublica nem para run/trigger já autorizado, preservando explicit DISABLE como narrowing.**