# 3F-03 — Approval Claim & ApprovalRequest Contract

**Status:** APPROVED pelo operador em 2026-08-16  
**Fase:** 3F — Contracts & API Architecture  
**Authority:** terceira decisão aprovada de 3F  
**Importante:** esta decisão não constitui C-018, não encerra 3F nem a Fase 3, e não autoriza implementação de produto, merge ou PR readiness.

## Decisão em uma frase

No Conexus F1, uma decisão humana `ALLOW_ONCE` autoriza exatamente um **effect subject selado e imutável**, sob custody de PAR, claimable uma única vez para um único `Gateway effectAttemptId` dentro da admissão atômica; o mesmo subject pode ser recuperado apenas pelo mesmo attempt já admitido, governing-pin mismatch antes da admissão terminaliza a ApprovalRequest de forma monotônica, e nenhuma aprovação pode ser transferida, editada, widened/narrowed ou reutilizada como permissão genérica.

---

## 1. Authority, método e provenance

Esta decisão fecha o contrato exato roteado por authority anterior e reconcilia:

- C-007 — connector `effects[]`, idempotency classification e Connection semantics;
- C-010 — durable `ApprovalRequest`, `ALLOW_ONCE | DENY`, exact approved envelope, deterministic executor e `AWAITING_APPROVAL`;
- C-013 — persist-before-effect, attempt/traffic/outcome, `OUTCOME_UNKNOWN`, reconciliation e observability;
- C-016 — sanitized/public failure discipline e effect uncertainty;
- 3D-02 / 3D-R1 — única inversão de domínio F1 = narrow approval-claim capability; Gateway continua last-mile admission/execution owner;
- 3E-01 — atomicidade cross-owner `Gateway admission + PAR single-claim`, ownership por schema e `TxScope` opaco;
- 3F-01 — durable contract trait, commitment/canonicalization, replay-safe persisted identity e PRESERVE horizons;
- 3F-02 — `AWAITING_APPROVAL` não é T1 failure; request authority server-derived; execution success ≠ effect outcome.

Review/provenance não-autoritativa:

- `3F-FABLE-DIALOGUE-approval-claim-approval-request-contract.md`;
- `3F-FABLE-DIALOGUE-approval-claim-approval-request-contract-R2.md`;
- `3F-FABLE-DIALOGUE-approval-claim-approval-request-contract-R3.md`.

O diálogo passou por três rounds adversariais ChatGPT ↔ Fable, incluindo buildability e Global Maximum. Resultado final:

```text
READY FOR OPERATOR APPROVAL
nenhum Material Finding contra authority anterior
nenhum mecanismo UNSUPPORTED
zero probes novos exigidos por 3F-03
```

Mitra, Factory, práticas internas e fontes externas foram usadas apenas como evidência de construibilidade, nunca como authority normativa.

---

## 2. Escopo fechado F1

3F-03 fecha somente o **ApprovalRequest path já ratificado por C-010/PAR**.

Fluxo F1:

```text
PAR
→ Gateway PREPARE exact effect meaning
→ PAR seals + persists immutable ApprovalRequest
→ human ALLOW_ONCE | DENY
→ Gateway invokes PAR narrow claim capability
→ atomic admission
→ effect_attempt = NOT_SENT
→ COMMIT
→ external I/O
```

Não generalizar por simetria para app-origin approvals, generic approval originators ou outros consumidores ainda não ratificados. Um novo consumidor material retorna ao Decision Loop.

Não nasce:

```text
ApprovalService
ApprovalRepository compartilhado
ApprovalOriginator abstraction
PolicyProviderRegistry
WorkflowEngine
```

A única reverse dependency continua a narrow approval capability já aprovada por 3D.

---

## 3. PREPARE — Gateway resolve o efeito exato sem executá-lo

`PREPARE` pertence ao Gateway porque o Gateway já owns a execução física e as regras de composição/binding/admission necessárias para resolver o efeito.

PREPARE:

```text
resolve defaults / normalization
resolve exact artifact/tool revision
resolve exact Connection + ConnectionRevision quando aplicável
resolve exact target / recipient / effect-unit set
resolve final effect content
capture execution-relevant precondition parameter values
return exact canonicalizable effect meaning + governing/origin metadata
```

PREPARE:

```text
-X-> external I/O effectful
-X-> Gateway effect_attempt admission
-X-> budget reservation
-X-> idempotency claim
-X-> ApprovalRequest persistence
```

PAR não recompila defaults/targets/bindings nem interpreta a semântica do efeito; ele faz sealing/custody sobre o material resolvido pelo Gateway.

---

## 4. Conteúdo da ApprovalRequest

### 4.1 `EFFECT_SUBJECT`

Conteúdo executable/sealed cuja alteração material exige **nova ApprovalRequest**:

```text
Project identity
exact artifact/tool revision
exact Connection + ConnectionRevision quando aplicável
resolved input after defaults/normalization
complete explicit target / recipient / effect-unit set
final effect content/body relevante
execution-relevant precondition parameter VALUES captured at PREPARE
```

Critério:

> O subject contém valores cuja mudança pode alterar o efeito físico e que não são já provados somente por uma revisão/pin imutável exato.

### 4.2 `GOVERNING_VALIDITY`

#### B1 — request-local validity facts

```text
expiresAt
```

- imutável;
- extensão de expiry sob a mesma aprovação é proibida;
- checked by PAR somente **antes do primeiro claim/admission**.

#### B2 — externally-compared governing pins

```text
policy snapshot digest quando aplicável
governing deployment/composition identity da surface real
```

Para `AGENT_RUN`, a composition relevante é a **run-pinned composition**, não automaticamente o active Release atual.

Gateway escolhe quais B2 pins governam a request no PREPARE e resolve seus valores atuais no primeiro claim; PAR apenas compara opaque bytes.

### 4.3 `ORIGIN_CORRELATION`

Metadata imutável de provenance/correlação, fora do effect commitment:

```text
AgentRun
Conversation
execution/correlation refs necessários por C-013
```

Não vira effect semantics só por ser importante para trace.

### 4.4 `DERIVED_AT_ADMISSION`

Não duplicar no subject valores já governed pelo exact artifact/tool revision:

```text
effect classification
idempotency class
approvalFloor
precondition specification
```

Na admission, eles são derivados **da revisão exata pinada no EFFECT_SUBJECT, nunca de uma current revision**.

Per-unit idempotency keys também não são subject content; são computadas uma vez na admission a partir das identities aprovadas/request/attempt/unit e depois persistidas/reutilizadas verbatim conforme 3F-01.

Credential secret material nunca entra no subject. Rotação de custody material sob a mesma semantic Connection/ConnectionRevision não altera o que foi aprovado.

---

## 5. Sealing, commitment e encryption

PAR owns sealing/custody.

No momento de criar a ApprovalRequest:

```text
PAR generates high-entropy commitmentNonce
→ canonicalizes domainTag + commitmentNonce + EFFECT_SUBJECT
→ computes approvalCommitmentDigest
→ encrypts commitmentNonce + exact EFFECT_SUBJECT
→ persists encrypted sealed payload + plaintext commitment digest + immutable metadata
```

`commitmentNonce`:

- não é effect/business meaning;
- não é mostrado ao humano;
- fica somente dentro do ciphertext;
- evita que um atacante com leitura do banco use o plaintext digest como oracle para confirmar subjects sensíveis parcialmente adivinháveis.

O digest é um **request-specific integrity commitment**, não uma identidade de deduplicação/equivalência semântica entre ApprovalRequests.

O domínio de commitment deve obedecer 3F-01:

```text
typed/domain context
canonical bytes profile
hash algorithm/profile
pinned canonicalization implementation identity
profile evolution rule
```

Não nasce HMAC/keyed-hash subsystem nem UniversalDigestFramework.

Claim/display/recovery falham fechado se o payload decryptado/canônico não verificar contra o commitment digest.

---

## 6. ApprovalRequest immutability

Após criação:

```text
EFFECT_SUBJECT bytes = immutable
approvalCommitmentDigest = immutable
GOVERNING_VALIDITY pins = immutable
ORIGIN_CORRELATION = immutable
expiresAt = immutable
```

Writings posteriores são apenas decision/lifecycle/binding facts.

Se qualquer execution-relevant subject/pin precisar mudar:

```text
create new ApprovalRequest identity
```

Proibido:

```text
approve once → patch args
approve once → change recipient/amount/content
approve once → extend expiry
approve once → transfer to another effectAttempt
```

---

## 7. Human decision contract

Input público mínimo:

```text
approvalRequestId
ALLOW_ONCE | DENY
expectedRevision / CAS expectation quando aplicável
optional human reason/comment
```

Derivado server-side:

```text
approver principal
eligibility/authority
Project/Agent/Connection scope
sealed subject / commitment
projector identity actually served
```

Cliente não envia como authority:

```text
subject bytes
subject digest
Project/Workspace/Agent authority
Connection
recipient/target
approvalWasValid
role/permissions
projector identity
```

Approver eligibility exata continua 3I.

Unknown/foreign request deve seguir a disciplina de not-found indistinguível aplicável de C-015.

---

## 8. Mechanical approval card + evidence

Não existe stored approval card como segunda cópia da authority.

Display:

```text
decrypt sealed payload
→ verify approvalCommitmentDigest
→ family-specific versioned mechanical projector
→ sanitized / anti-exfil rendering
```

Não existe `UniversalApprovalCard`.

O projector deve mostrar o significado material necessário à decisão, quando aplicável:

```text
effect family/type
target / Connection / external actor
exact effect-unit count + identities
final effect content/value relevante
Project/business scope
expiry
```

Para conjuntos grandes:

```text
stable deterministic ordering
exact total count
bounded deterministic preview
full exact list available before decision
never model-selected representative sampling
```

Set authoritative nunca é truncado silenciosamente. Subject grande demais falha explicitamente em PREPARE.

### Decision evidence

No momento da decisão, a plataforma registra **server-derived immutable evidence** da identidade/version/digest do controlled projector efetivamente usado para aquela exibição.

Esse evidence:

- não é client-asserted;
- deve ser reproduzível/resolúvel sob evidence retention;
- prova a semantic projection mostrada;
- nunca se torna executable authority.

Se locale/timezone/formatting puder alterar materialmente o significado, o futuro display contract 3F/3K deve normalizar isso ou persistir apenas o material display context necessário; não nasce `DisplayContext` bag genérico em 3F-03.

---

## 9. Approval-pending semantics

`AWAITING_APPROVAL` permanece normal domain/lifecycle condition e **não T1 public failure** conforme 3F-02.

Sem congelar um universal outer envelope, a superfície deve preservar ao menos semanticamente:

```text
approvalRequestId
request revision/expectation quando necessário para decision CAS
mechanical card/projection access
```

Isso não significa que effect já foi admitted/sent.

---

## 10. Narrow approval capability — dois intents fechados

Continua **uma única capability estreita/inversion**. Seu input é semanticamente discriminado para tornar impossível aplicar regras de first-claim ao recovery.

### `FIRST_CLAIM`

```text
FIRST_CLAIM {
  approvalRequestId
  candidateEffectAttemptId
  currentValidityPins   # exact complete B2 key-set
  TxScope
}
```

### `RECOVER_BOUND`

```text
RECOVER_BOUND {
  approvalRequestId
  boundEffectAttemptId
}
```

`RECOVER_BOUND`:

```text
no currentValidityPins
no TxScope
read-equivalent
no lifecycle write
no budget/idempotency work
```

A capability retorna, quando permitida:

```text
exact verified EFFECT_SUBJECT
approvalCommitmentDigest
stored governing pins / decision facts necessários
```

Nunca retorna apenas `approved=true`.

---

## 11. FIRST_CLAIM semantics

PAR executa somente request-owned mechanical checks:

```text
decision = ALLOW_ONCE
not expired
unbound to another committed attempt
commitment verifies
exact currentValidityPins key-set equality
byte-for-byte B2 value equality
```

### Exact key-set rule

```text
supplied keys == stored B2 keys
```

Então:

```text
missing key
extra/unknown key
→ typed contract error
→ no terminalization

exact set + any byte mismatch
→ terminal STALE

exact set + all bytes equal
→ may proceed to claim/admission
```

PAR não resolve pins, não consulta Release/Project/Connections, não interpreta policy e não decide caller authority. Gateway fornece os opaque current values da surface apropriada; PAR faz somente igualdade e owner-local lifecycle write.

---

## 12. Monotonic STALE — commit-on-refusal

Governing-pin mismatch **antes do primeiro committed admission** precisa invalidar a request permanentemente para impedir resurrection após rollback/policy reversion.

Outcome de STALE:

```text
candidate attemptId exists only in memory
Gateway resolves exact current B2 pin values

BEGIN
  PAR FIRST_CLAIM checks exact key-set
  exact key-set + any B2 value mismatch
    → PAR writes terminal STALE
    → audit-required OBS record/event
COMMIT
```

Resultado:

```text
no claim bound to an attempt
no budget reservation
no idempotency claim
no gw.effect_attempt
zero gw.* writes
request never resurrects even if pins later return to previous values
```

Esse commit usa a classe transversal já aprovada por 3E para mutation audit-required + OBS; não é material-effect admission porque nenhum effect foi admitted.

Crash antes desse COMMIT é seguro: mismatch é determinístico e será detectado novamente.

---

## 13. Atomic claim + Gateway admission

Candidate `effectAttemptId` é mintado em memória. Não existe durable preallocation state antes da transação.

Gateway resolve read-only os current B2 values necessários.

Admission válida:

```text
BEGIN
  PAR FIRST_CLAIM
    → decision/expiry/commitment checks
    → exact pin key-set + byte equality
    → conditionally binds ApprovalRequest → candidate effectAttemptId
    → returns exact verified EFFECT_SUBJECT

  Gateway last-mile checks
    → caller authority applicable to the surface
    → Connection/current eligibility/revocation as applicable
    → other revocable admission facts

  Gateway derives exact effect-unit set FROM claimed subject
  Gateway reserves budget for ALL approved units or none
  Gateway persists per-unit/per-attempt idempotency claims
  Gateway persists gw.effect_attempt = NOT_SENT
    + approvalRequestId
    + approvalCommitmentDigest
    + exact admitted pins/refs
COMMIT
```

Se qualquer Gateway check/write falhar:

```text
ROLLBACK
→ PAR binding rolls back
→ no effect attempt admitted
→ no external I/O occurred
→ request remains claimable within horizon unless a separately committed terminal fact exists
```

Somente depois do COMMIT:

```text
external physical I/O
```

Executable source = subject retornado por PAR. Caller-resubmitted args nunca substituem o approved subject.

---

## 14. Single-claim / replay / transfer law

A **primeira admission que COMMITA com sucesso** liga permanentemente:

```text
ApprovalRequest R
↔ effectAttemptId A
```

Depois disso:

```text
R + A
→ replay-safe recovery permitido

R + any different attemptId
→ fail closed
```

Race de duas candidates:

```text
two candidates
→ race same owner-local single-claim condition
→ at most one transaction commits
```

Rollback não consome approval.

Attempt cancelado/abandonado depois de admission consome a approval; ela não é transferida para outro attempt.

Sticky/reusable approval não existe.

---

## 15. RECOVER_BOUND — recovery não é nova autorização

Quando a request já está duravelmente bound ao **mesmo** `boundEffectAttemptId`, PAR deve permitir recovery do exact subject mesmo se, depois da admission original:

```text
expiry passou
policy/deployment/composition pins mudaram
```

Recovery verifica somente o que é necessário para provar o binding histórico e custody:

```text
request is bound to exactly this attempt
original ALLOW_ONCE/decision facts for the binding exist
commitment integrity verifies
```

Recovery:

```text
-X-> rechecks expiry
-X-> compares current validity pins
-X-> terminalizes request from later pin change
-X-> mutates lifecycle/binding
```

Motivo: o effect já foi lawfully admitted. Recovery precisa reconstruir **o que já foi admitido**, não pedir autorização novamente.

Gateway então aplica qualquer current post-admission cancellation/revocation rule que authority posterior definir. Essa política continua roteada para 3G/3I (`F3D02-R1` family); 3F-03 não decide silenciosamente por torná-lo irrecuperável.

---

## 16. Batch / multi-unit law

Uma ApprovalRequest representa **uma decisão humana sobre um exact effect subject**.

O subject pode conter 1..N effect units quando o produto as apresenta como uma única intenção humana.

Não existe universal batch cardinality nem `BatchApproval`.

Se um subject contém N units:

```text
approved set must be complete and explicit
no silent widening
no silent narrowing
admission budget/idempotency = all N units or none
```

Não é permitido:

```text
human approved 500
budget covers 400
→ planned admission of 400
```

Após physical dispatch, reality pode ser:

```text
PARTIAL
OUTCOME_UNKNOWN
```

conforme C-013; isso é effect outcome, não alteração planejada do approved subject.

---

## 17. Temporary refusal vs terminal invalidation

Temporary/current Gateway refusal que não é governing-pin invalidation:

```text
caller temporarily ineligible
Connection unavailable/revoked according to later lifecycle rules
budget unavailable
other temporary last-mile refusal
```

não deve consumir/transferir a approval dentro desta decisão.

Se admission não commitou:

```text
no claim binding survives rollback
request stays claimable within its horizon
```

A taxonomy completa de lifecycle/refusal/admin revocation continua 3G/3I.

`DENY`, `EXPIRE`, `STALE`, `AWAITING_APPROVAL` são lifecycle/domain outcomes, não T1 failures. T1 aplica a contract misuse/invalid requests conforme 3F-02.

---

## 18. Recovery retention / PRESERVE horizon

PAR é a única custody source do sealed executable subject em F1.

Não duplicar ciphertext do subject em `gw.effect_attempt` apenas por redundância.

PAR deve reter o sealed payload enquanto:

```text
ApprovalRequest is non-terminal
OR
any bound attempt is non-terminal
OR
any bound attempt is OUTCOME_UNKNOWN and reconciliation/settlement is not concluded
```

GC de request com subject operacionalmente necessário é proibido.

Esse é um 3F-01 `PRESERVE` horizon.

Depois de settlement/reconciliation, retention/evidence/minimization policy pode reduzir custody conforme regras posteriores, enquanto digests/receipts/audit evidence permanecem conforme suas próprias obligations.

Se topologia futura criar availability domain no qual Gateway recovery precisa ocorrer quando PAR custody está indisponível, duplicate custody pode reentrar pelo Decision Loop com esse failure class concreto.

---

## 19. Post-admission invariants

Após committed admission:

```text
sealed subject can never be altered
approval can never be transferred to another attempt
```

A única intervenção que authority posterior pode acrescentar sem reescrever o approved subject é cancellation/stop do **mesmo attempt antes do send**, se 3G/3I assim decidir.

Reconciliation-driven re-send beyond the committed attempt é novo attempt e, por default, exige nova ApprovalRequest, salvo futura authority 3M/3G que prove uma regra mais estreita e segura.

---

## 20. Failure / outcome classification

Normal lifecycle/domain outcomes:

```text
AWAITING_APPROVAL
DENY
EXPIRE
STALE
```

não são T1 failures.

T1/public failure projection é reservada a contract misuse/failure apropriado, como:

```text
unknown/foreign request under security-safe not-found semantics
malformed decision
CAS/revision conflict
invalid FIRST_CLAIM key-set
request bound to different attempt
commitment/durable interpretation failure
```

Literal stable codes e exact public envelopes permanecem later-3F/implementation work sob 3F-02.

---

## 21. Buildability disposition

Classificação final:

```text
atomic single-claim + cross-owner transaction      CONVENTIONAL / in-house proven class
sealed encrypted subject + request commitment     CONVENTIONAL
FIRST_CLAIM / RECOVER_BOUND typed discrimination  CONVENTIONAL
exact key-set + byte equality                     CONVENTIONAL
commit-on-STALE owner-local lifecycle write       CONVENTIONAL
mechanical card projection + pinned evidence      CONVENTIONAL
all-units-or-nothing admission                    CONVENTIONAL
PAR custody + recovery horizon                    CONVENTIONAL
```

Nenhum mecanismo `UNSUPPORTED`.

Nenhum probe novo é exigido por 3F-03. A prova end-to-end de claim/concurrency/crash/recovery continua corretamente pertencendo a 3N/3O.

---

## 22. Non-goals / YAGNI

3F-03 não autoriza:

```text
approved:boolean permission token
sticky approvals
reusable approvals
approval transfer
client-resubmitted executable subject
editable card that mutates approved subject
stored ApprovalCard copy
UniversalApprovalCard
ApprovalService
ApprovalRepository shared across modules
ApprovalOriginator abstraction
Gateway-created ApprovalRequest
Gateway read of par.* tables
Gateway duplicate custody of sealed subject
second reverse markStale API
eager push-invalidation as primary correctness mechanism
keyed-hash commitment subsystem
persistent attempt preallocation record
BatchApproval framework
UniversalAuthoritySnapshot
DisplayContext bag
transaction across external I/O
subject reconstruction from mutable/current state
```

Qualquer mecanismo futuro retorna somente por consumidor/failure class concreto + Decision Loop.

---

## 23. Routed onward

| Questão | Owner posterior |
|---|---|
| ApprovalRequest lifecycle/FSM completo | 3G |
| admin revocation / post-admission cancellation | 3G / 3I |
| approver eligibility / authority | 3I |
| in-flight attempt after stricter policy/release | 3G / 3I (`F3D02-R1`) |
| reconciliation / re-send after `OUTCOME_UNKNOWN` | 3M / 3G |
| per-family card/display contracts | later 3F / 3K |
| literal type names / fields / stable codes | later 3F / implementation |
| end-to-end claim/concurrency/crash-recovery proof | 3N / 3O |
| app-origin approvals or second approval consumer | Decision Loop when real consumer exists |
| duplicate Gateway custody under future availability split | Decision Loop / 3J if real topology requires |

---

## 24. Formal disposition

Operator approval on 2026-08-16 ratifies:

```text
3F-01 = APPROVED
3F-02 = APPROVED
3F-03 = APPROVED
3F = IN PROGRESS
```

Esta decisão não encerra 3F, não constitui C-018, não autoriza implementação de produto e não altera o status DRAFT do PR da Fase 3.
