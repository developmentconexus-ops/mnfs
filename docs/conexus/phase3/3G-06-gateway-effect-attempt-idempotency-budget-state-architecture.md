# 3G-06 — Gateway EffectAttempt, Idempotency & Budget State Architecture

**Status:** APPROVED pelo operador em 2026-08-16  
**Fase:** 3G — Behavioral / State Architecture  
**Authority:** sexta decisão aprovada de 3G  
**Importante:** esta decisão não constitui C-018, não encerra a Fase 3 e não autoriza implementação de produto, merge ou PR readiness.

## Decisão em uma frase

No Conexus F1, `gw.effect_attempt` é a única authority owner-local de execução física de efeito e preserva dimensões separadas de traffic, outcome, idempotency e budget; além de `NOT_SENT | SENT_NO_RESPONSE | RESPONSE_RECEIVED`, um fato write-once `closed-before-dispatch` distingue tentativas admitidas que nunca mais podem cruzar I/O, compete atomicamente com dispatch, impede recovery de reexecutar efeito cancelado, libera budget somente como settlement idempotente derivado desse fato, preserva `OUTCOME_UNKNOWN` e `PARTIAL` honestos, e nunca transforma Builder/PAR em segunda replay authority.

---

## 1. Authority e provenance

Materializa sem reabrir:

- C-007 — effects/idempotency declarations;
- C-010/C-013/C-016 — ApprovalRequest/effect units, traffic/outcome ambiguity, PARTIAL, admission ledger, unknown != failure;
- 3D-02 — Gateway owns last-mile effect admission/execution;
- 3E-01/02 — `gw.effect_attempt`, `idempotency_claim`, `budget_counter` já existem como durable classes; atomic approval claim class já existe;
- 3F-02 — traffic state e execution/effect outcome são vocabulários distintos;
- 3F-03 + 3G-01 — effect attempt nasce `NOT_SENT` no admission commit e approval binding é permanente;
- 3G-03/05 — run failure/cancel não vira replay authority;
- pacote ChatGPT↔Fable + R2 Final Review.

Final review confirmou que `closed-before-dispatch` é o menor fato ausente; não exige nova classe nem quarto traffic state.

---

## 2. Root cause e invariant

Sem fato pré-dispatch durável, este schedule é inseguro:

```text
attempt admitted NOT_SENT
→ origin run cancelled
→ budget released
→ Hub crash
→ recovery sees NOT_SENT + permanent approval binding
→ dispatches effect
```

Target invariant:

> **Depois de admission, exatamente um dos dois caminhos pode vencer antes de external I/O: dispatch ou close-before-dispatch. Se close vencer, aquela attempt identity nunca mais pode enviar; se dispatch vencer, qualquer falta de resposta vira ambiguity, nunca "não enviado".**

---

## 3. EffectAttempt facts

Semantic facts, quando aplicáveis:

```text
exact attempt identity
exact effect subject / revision / unit set
caller/surface/execution correlation
ApprovalRequest binding/ref when required
idempotency claim/ref
budget reservation/ref
traffic state
closed-before-dispatch fact?
typed response/receipt outcome when known
ambiguity/history facts
```

Não existe UniversalAttemptState compartilhado com ActorRun/AgentRun/Promotion.

---

## 4. Traffic state

Preserva o vocabulário aprovado:

```text
NOT_SENT
SENT_NO_RESPONSE
RESPONSE_RECEIVED
```

Traffic responde somente:

> **o que sabemos sobre a fronteira física de envio/resposta?**

`closed-before-dispatch` é outra dimensão; não vira quarto traffic value.

### 4.1 `NOT_SENT`

Attempt admitida, mas external dispatch boundary ainda não foi committed.

### 4.2 `SENT_NO_RESPONSE`

Gateway committed que a dispatch boundary será/cruzou de forma conservadora e ainda não possui response durável.

Esse fact é escrito **antes** do external I/O para impedir que um crash pós-send deixe `NOT_SENT` falso.

Pode gerar false uncertainty; isso é preferível a unsafe duplicate effect.

### 4.3 `RESPONSE_RECEIVED`

Response foi duravelmente observado e pode ser interpretado sob typed operation contract.

---

## 5. Admission before I/O

Antes de qualquer external I/O, Gateway comita, conforme aplicável:

```text
effect_attempt + exact subject
ApprovalRequest claim/binding
idempotency claim
budget reservation
traffic = NOT_SENT
required audit
```

usando atomicity já aprovada.

Approval binding que comitou nunca retorna ao pool, inclusive se attempt depois fechar antes de send.

Nenhuma transaction permanece aberta através de external I/O.

---

## 6. Closed-before-dispatch

`gw.effect_attempt` pode carregar fato owner-local write-once equivalente a:

```text
closedBeforeDispatch = true
```

Exact field name não é frozen.

Meaning:

> **esta exact admitted attempt foi encerrada enquanto ainda NOT_SENT e nunca mais é admissível para dispatch.**

Quem tem authority para solicitar/causar post-admission close pertence às policies/authority de 3I/consumer; 3G-06 owns o significado e enforcement no Gateway.

### 6.1 Close × dispatch guarded race

Dois transitions competem sobre a mesma attempt row/current facts:

```text
CLOSE:
traffic = NOT_SENT
AND close absent
→ close = committed

DISPATCH:
traffic = NOT_SENT
AND close absent
→ traffic = SENT_NO_RESPONSE
```

Exactly one may win.

Same-row conditional mutations conflitam sob o baseline F1; não depende de SERIALIZABLE como crutch.

### 6.2 Recovery

```text
NOT_SENT + close present
→ never dispatch

NOT_SENT + close absent
→ same-attempt recovery may still dispatch if all current Gateway gates permit

SENT_NO_RESPONSE
→ ambiguity/reconciliation law; never reclassify as NOT_SENT
```

Isso preserva RECOVER_BOUND de 3G-01 sem transformar approval recovery em send authority.

---

## 7. Response / effect outcome

Known typed outcome family preserva:

```text
SUCCEEDED
FAILED
PARTIAL
OUTCOME_UNKNOWN
```

Traffic e outcome continuam ortogonais.

`OUTCOME_UNKNOWN` nunca é colapsado em `FAILED`.

Atomic operation:

```text
PARTIAL impossible
```

Multi-unit operation:

```text
total = succeeded + rejected + unprocessed + unknown
attempted excludes unprocessed
unknown has highest uncertainty precedence
```

Exact receipt remains operation-specific.

---

## 8. Idempotency

Gateway owns `idempotency_claim`.

```text
same persisted idempotency identity + same exact subject
→ resolve/recover existing semantics

different subject under same identity
→ conflict / fail closed
```

Conexus idempotency não promete provider idempotency.

Para `OUTCOME_UNKNOWN`:

```text
same key
!= permission to send again
```

É identity para recovery/reconciliation até safe resend rule provider-specific ser provada.

No generic retry engine.

---

## 9. Budget reservation / settlement

Budget reservation ocorre antes do send.

### 9.1 Close-before-dispatch

Budget release de attempt admitida mas não enviada só pode ocorrer após durable close fact.

```text
close fact committed
→ budget settlement/release consequence
```

Esse settlement é idempotente.

Crash entre close commit e budget write:

```text
recovery reads durable close
→ repeats settlement safely
```

Budget release nunca é fact independente que possa vencer o close.

### 9.2 Known response

Settle segundo typed attempted/effect units.

### 9.3 PARTIAL

```text
succeeded → settle known
rejected  → settle known per contract
unprocessed → proven not attempted; reservation may release accordingly
unknown   → retain conservative reservation
```

Unknown units não contam como zero e não são liberadas por conveniência.

### 9.4 OUTCOME_UNKNOWN

Retém reserva conservadora até reconciliation/settlement policy posterior.

3M owns repair/expiry mechanics; 3G-06 owns que ambiguity não libera capacidade silenciosamente.

---

## 10. Retry / fresh attempt

`FAILED` nunca implica generic retryability.

Fresh attempt exige fresh current admission.

```text
closed NOT_SENT attempt
→ exact old attempt never dispatches; a genuinely fresh attempt may be admitted only under current authority

SENT_NO_RESPONSE / OUTCOME_UNKNOWN
→ no automatic replay

RESPONSE_RECEIVED proving no effect / connector safe-retry semantics
→ fresh attempt may be possible

PARTIAL
→ succeeded units never auto-repeat
→ unknown units never auto-repeat
→ fresh subject contains only units proven safe
```

New subject requiring approval => new ApprovalRequest. Old ALLOW_ONCE never transfers.

---

## 11. Run cancellation relationship

AgentRun/ActorRun cancel não muta Gateway facts por magic coupling.

Quando applicable authority tenta impedir um admitted-but-not-sent effect:

```text
Gateway close-before-dispatch transition competes with dispatch
```

Schedule:

```text
close wins
→ never sent
→ budget releases idempotently
→ approval remains consumed

dispatch wins
→ SENT_NO_RESPONSE
→ run cancel cannot assert no effect
→ ambiguity/response governs
```

---

## 12. Builder/PAR boundary

Builder/PAR podem ler projection de traffic/outcome como context/evidence.

Eles não podem:

```text
mark effect safe to replay
rewrite gw.effect_attempt
release Gateway budget because their run ended
turn OUTCOME_UNKNOWN into FAILED
```

New run pode continuar unrelated/non-effectful work; somente effect execution passa pelo Gateway enforcement.

---

## 13. Reconciliation history

Future 3M settlement não apaga original ambiguity.

Preservar distinguível:

```text
original traffic/outcome uncertainty
+
subsequent settlement/reconciliation evidence
```

Exact physical representation fica 3M/implementation; nenhuma nova class é aprovada aqui.

---

## 14. Proof obligations

1. crash before admission commit → no admitted attempt;
2. crash after admission but before dispatch → `NOT_SENT`, recoverable only if not closed;
3. close then crash → never dispatch after restart;
4. crash between close and budget release → idempotent release from durable close;
5. close × dispatch both orders → exactly one wins;
6. dispatch then crash before response → `SENT_NO_RESPONSE`/OUTCOME_UNKNOWN, no resend;
7. approval remains permanently consumed whether close or dispatch wins;
8. same idempotency identity + different subject → fail closed;
9. OUTCOME_UNKNOWN + same key → recovery, not resend;
10. PARTIAL unknown units retain conservative reservation while unprocessed release appropriately;
11. fresh run cannot bypass Gateway replay authority;
12. no fourth traffic state or EffectWorkflowEngine is necessary.

---

## 15. YAGNI

Não construir:

```text
EffectWorkflowEngine
universal retry scheduler
exactly-once promise
fourth traffic status for CLOSED
cross-owner Builder/PAR effect transaction
provider-idempotency fiction
status fan-out into run objects
new reconciliation durable class before 3M proves need
```

---

## 16. Later routing

```text
who may revoke/close post-admission → 3I + consumer authority
reconciliation/settlement mechanics → 3M
numeric budgets / reservation expiry → calibration/3M
provider-specific safe resend        → connector qualification/implementation
exact schema/indexes                 → implementation
```

---

## 17. Reopen triggers

1. real provider requires different safe dispatch protocol;
2. multi-unit effect cannot be represented by current accounting;
3. 3M proves settlement history needs new durable class;
4. idempotency cannot prevent duplicate effects under named connector;
5. current topology becomes multi-writer and same-row guard no longer suffices without fencing.

---

## 18. Decisão ratificada

A aprovação do operador em 2026-08-16 congela:

> **EffectAttempt preserves exact physical-effect truth; close-before-dispatch and dispatch are a guarded race, traffic/outcome/budget/idempotency remain separate, ambiguity is never rewritten into convenience, and Gateway remains the sole replay authority.**