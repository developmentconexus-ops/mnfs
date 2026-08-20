# 3F-02 — Boundary Payload Semantics & Error Envelope Architecture

**Status:** APPROVED pelo operador em 2026-08-15  
**Fase:** 3F — Contracts & API Architecture  
**Authority:** segunda decisão aprovada de 3F  
**Importante:** esta decisão não constitui C-018, não encerra 3F nem a Fase 3, e não autoriza implementação de produto, merge ou PR readiness.

## Decisão em uma frase

O Conexus F1 representa payloads de boundary por cinco famílias semânticas fechadas e seis traits condicionais, preservando os contratos C-005/C-012/C-013 já ratificados, sem criar `UniversalRequest`, `UniversalSuccess`, `UniversalStatus`, `UniversalInternalFailure` ou envelope genérico de plataforma; falhas públicas são sanitizadas e keyed por stable code, retry é derivado mecanicamente de operação/effects/traffic/outcome e execução permanece semanticamente separada do resultado do efeito.

---

## 1. Authority, método e provenance

Esta decisão foi trabalhada após `3F-01 APPROVED` e reconciliada contra:

- C-005 — registry/runtime execution envelope;
- C-007 — connector `effects[]` / idempotency semantics;
- C-010 — ApprovalRequest / effect receipt semantics;
- C-012 — runtime client, output contract, `dataMeta`, `RuntimeClientError`;
- C-013 — observability, attempt state, `OUTCOME_UNKNOWN`, proposal→Hub-apply semantics;
- C-016 — sanitized errors, `traffic_state`, public-boundary security;
- C-017 — proposal/finding/handoff authority model;
- `3F-01-contract-surface-classification-versioning-boundary.md`.

Review/provenance não-autoritativa:

- `3F-FABLE-DIALOGUE-boundary-payload-error-envelope.md`;
- `3F-FABLE-DIALOGUE-boundary-payload-error-envelope-R2.md`;
- `3F-FABLE-DIALOGUE-boundary-payload-error-envelope-R3.md`.

O diálogo passou por três rounds adversariais ChatGPT ↔ Fable, incluindo buildability/Global Maximum. Resultado final:

```text
READY FOR OPERATOR APPROVAL
nenhum Material Finding contra authority anterior
nenhum mecanismo UNSUPPORTED
zero probes novos exigidos por 3F-02
```

Mitra, Factory e práticas internas foram evidência/referência de construibilidade, nunca authority normativa.

---

## 2. Famílias semânticas de boundary

Família significa **semântica/obrigações**, não wrapper comum.

### F1 — `INTERNAL_TYPED_CALL`

Superfícies `INTERNAL` de 3F-01 usam tipos nativos do owner/domínio.

```text
native typed request/result/failure
no wire wrapper
no serialized public error DTO inward
```

Mappings públicos só nascem no outer boundary real.

### F2 — `RUNTIME_EXECUTION`

Preserva a família discriminada já ratificada por C-005/C-012/C-013, sem structural rewrite.

Inclui, quando aplicável:

```text
execution identity
execution status/error
output
revision/deployment provenance
conditional dataMeta
conditional ActionReceiptMeta
conditional traffic/outcome semantics
```

`executeAsync / status / stop` permanecem dentro de F2; não nasce um generic async/command framework.

`status(executionId)` deve projetar a authority existente sem inventar lifecycle sintético que reinterprete states congelados.

### F3 — `PLATFORM_OPERATION_RULES`

F3 é **rules-only**, definido negativamente:

```text
request = operation-specific typed input
success = named/exported operation-specific typed payload
failure = T1 PublicFailureProjection
trusted authority/context = derived server-side
```

Não existe shape de success compartilhado para F3.

Qualquer proposta de campo compartilhado como:

```text
status
meta
serverTime
warnings
version
```

volta ao Decision Loop com consumidor/failure class real.

### F4 — `DURABLE_CONTENT`

Contratos duráveis/versionados mantêm seu próprio schema e as regras de horizon/gap mode de 3F-01.

Exemplos:

```text
agent/v1
connector/v1
brain/v1
ReleaseManifest
ApprovalRequest durable representation
binding/config revisions
backup manifests
```

Nunca são embrulhados em `ApiResponse`/`RuntimeResult` apenas por serem contratos.

### F5 — `PRODUCER_INGRESS_OR_PROPOSAL`

F5 é **classification/rules-only**; não introduz shape ou transporte comum.

Possui duas subclasses semânticas:

#### `OBSERVATION_APPEND`

```text
producer emits observation/evidence/event
→ admitted or bounded-dropped under C-013 semantics
→ never by itself changes current domain truth
```

OBS/evidence continuam não sendo current domain truth.

#### `PROPOSAL`

```text
producer requests a domain transition
→ owner/Hub validates/decides/applies
→ transition becomes truth only after durable owner record
```

Exemplos: `complete_requested`, structured SHARE/checklist proposal, KnowledgeProposal, finding proposal.

Regras comuns F5:

1. producer-supplied identity/authority nunca é confiada só porque apareceu no payload;
2. Hub deriva/estampa authoritative scope a partir da capability/context admitida;
3. C-013 producer_trust/idempotency/append semantics são preservadas;
4. proposal significa pedido, não transição já ocorrida;
5. transport pode ser HTTP/tool/RPC — transporte não redefine authority;
6. ACK de transporte/validação (`received / well-formed`) **não prova** transição de domínio;
7. uma resposta pode projetar a decisão **já registrada pelo owner** (`applied revision N`, `rejected stale revision`), e somente essa decisão registrada reporta domain truth;
8. F2/F3 não envelopam F5 apenas por consistência visual.

Wire realization continua trabalho de 3H quando aplicável.

---

## 3. T1 — Public Failure Projection

Quando uma falha atravessa uma boundary pública/independente, a projeção mínima é:

```text
stable code
sanitized presentation-safe message/key
correlationId
details?   # somente quando o stable code declara schema fechado
```

`details` é uma branch discriminada pelo `code`, nunca bag genérico.

Proibido:

```text
details: Record<string, unknown>
metadata: any
context: object
arbitrary internal path/stack/sql/secret fields
```

Guardrails:

- details descreve a falha, não vira data-return channel;
- public field/path identifiers só podem referir identificadores que já pertencem ao contrato público;
- CAS/error detail não pode devolver fresh domain state para evitar uma leitura autorizada normal;
- unknown/generic fallback não carrega details;
- literal per-code details schemas permanecem later 3F.

Consumidores atuais que justificam `details` incluem server-side form validation e compile/promote diagnostics sobre identificadores públicos.

### Approval-pending

```text
AWAITING_APPROVAL / approval-required
!= T1 public failure
```

Approval required não pode ser representado como exceptional/public-error path só porque a execução não pode prosseguir imediatamente.

A **forma exata** de result/envelope de approval-pending continua propriedade da futura decisão do approval-capability contract; ela deve preservar ApprovalRequest durable identity e C-010/C-013 authority semantics sem ser predecidida por 3F-02.

---

## 4. Traits condicionais

### T2 — Execution Identity

Só quando existe execution object real.

```text
executionId
```

Domain identity já existente vence minted identity desnecessária: ApprovalRequest, Promotion, ActorRun, AgentRun etc. usam suas identidades próprias quando essa é a authority real.

### T3 — Correlation

Public failure sempre carrega `correlationId` conforme C-016.

Success não recebe `correlationId` globalmente:

```text
F2 → executionId já correlaciona execution
F3 → domain/operation identity existente
F5 → producer/event/domain identities + Hub evidence
```

Transport request/trace ids podem existir futuramente como metadata diagnóstica; isso não força campo em todos os payloads.

### T4 — Compatibility Attestation

Somente em boundary com mixed-version expectation já admitida por 3F-01.

Exemplos:

```text
runtimeContractDigest
artifact kind/vN
pinned revision/digest
```

Sem `version` genérico em toda request.

### T5 — Data Metadata

`dataMeta` permanece específico das C-012 data-bearing success semantics.

Não é transport metadata genérica.

### T6 — Effect Traffic State

Somente quando external-effect send/outcome ambiguity existe.

```text
NOT_SENT
SENT_NO_RESPONSE
RESPONSE_RECEIVED
```

Provider/raw evidence permanece server-side/redacted conforme C-016; sanitized provider status só pode atravessar quando `RESPONSE_RECEIVED`; presentation só pode nomear o ator externo como parte falhante quando existe evidência de `RESPONSE_RECEIVED`.

---

## 5. Retry law

`retryable` não pertence ao T1 wire/public projection.

C-012 `RuntimeClientError.retryable` pode permanecer como **derived client semantic**. 3F-02 não exige que esse boolean exista no wire.

Se presente no client type:

> `retryable=true` significa que o platform-controlled client pode repetir automaticamente a mesma operação sem prerequisite refresh/reload/reapproval/reconciliation/user decision e sem violar operation/effect/idempotency policy.

Não significa “algum dia pode tentar novamente”.

### Matriz normativa

```text
READ / effects=[]
  NOT_SENT             → allowlisted transient-code policy may retry
  SENT_NO_RESPONSE     → allowlisted transient-code policy may retry
  RESPONSE_RECEIVED    → stable code/policy decides

EFFECTFUL / effects!=[]
  NOT_SENT             → send ambiguity absent; operation/idempotency/code policy decides
  SENT_NO_RESPONSE     → OUTCOME_UNKNOWN-class ambiguity; no automatic retry;
                         settlement/reconciliation first
  RESPONSE_RECEIVED    → code/effect policy decides; receipt/outcome semantics apply

connector idempotency=UNKNOWN
  → generic automatic retry prohibited by C-007 regardless of traffic_state
```

Declared `IDEMPOTENT` **não** libera automatic retry para effectful `SENT_NO_RESPONSE` / `OUTCOME_UNKNOWN` em F1. Reconciliation/settlement primeiro.

`NOT_SENT` remove send ambiguity, mas não concede retry por si só.

Retry de attempt já admitido reutiliza verbatim a stored idempotency key conforme 3F-01.

A segurança da coluna READ depende da fidelidade de `effects[]`: operação que muta mas declara `effects=[]` é falha de contrato/qualification C-007 e deve ser detectada pelos gates existentes; não é hole da retry law.

---

## 6. Error mapping law

Não existe `UniversalInternalFailure`.

Owners podem manter unions locais e fechadas:

```text
ProjectFailure
ConnectionFailure
GatewayFailure
...
```

### Public admission

Uma variante owner-local só ganha public projection semantics quando for admitida a uma public/independent boundary.

Per-boundary mapping é mecanicamente exaustivo sobre a set de variants admitidas naquela surface:

```text
new known variant admitted
+ no mapping
→ compile/contract-test failure
```

### Cross-boundary default

Quando a **mesma owner failure variant** é admitida a mais de uma public boundary, os shared public semantics precisam de um owner-level default mínimo:

```text
stable public code
+ optional admitted details-contract identity
```

Não nasce uma `RecoveryClass` taxonomy.

Boundary pode divergir intencionalmente apenas com override explícito + rationale.

**Gatilho mecânico:** a segunda public admission da mesma owner variant exige o default; a relação `(variant → admitted public boundaries)` é enumerável, e a mesma contract-test family de exhaustiveness falha quando encontra `>1` admissions sem declared owner-level default.

Internal-only variants não recebem public code/projection por completude.

Recovery/retry behavior continua derivado por controlled policy de:

```text
stable code
operation class
effects[]
traffic/outcome state
concurrency/compatibility state
```

---

## 7. Unknown/untyped fallback

Known failures devem mapear mecanicamente/exaustivamente.

Genuinamente unforeseen fault / third-party untyped throw:

```text
one bounded generic public code
correlationId
no details
no retryable
```

A ocorrência é defect signal, não comportamento normal.

O signal usa o caminho C-013 já existente:

```text
emit once
best effort
bounded
non-blocking while only telemetry is degraded
drop-counted via events_dropped
emission failure never recurses into/changing public response mapping
```

Se Postgres/domain authority estiver indisponível, permanece a regra separada já congelada por C-013: o domínio para fail-closed.

---

## 8. Two-level semantics

Para F2 effectful branches:

```text
execution status/error
!=
effect receipt outcome
```

Envelope success pode carregar receipt:

```text
outcome = SUCCEEDED
outcome = FAILED
outcome = PARTIAL
outcome = OUTCOME_UNKNOWN
```

porque execution pode ter concluído corretamente e produzido uma descrição honesta de effect failure/partial/uncertainty.

`error` branch nunca vira sinônimo de business/effect failure.

Atomic operations nunca `PARTIAL` conforme C-013; queries não carregam effect receipt — usam data/output metadata apropriada.

---

## 9. State-machine non-unification

Permanecem vocabulários distintos:

```text
C-005 execution envelope status
C-013 attempt/admission state
C-012 RequestState<T>
effect/receipt outcome
plan/checklist state
promotion state
WORK_COMPLETED → ... → SERVED_VERIFIED ladder
```

F1 não possui `UniversalStatus`.

Projection entre máquinas pode existir quando explicitamente definida; shared enum/reinterpretation por conveniência é proibida.

---

## 10. Request authority law

Não existe universal request envelope.

Server/trusted boundary deriva authority/context quando já é sua responsabilidade:

```text
principal/session
workspace/project/app scope quando route/session determina
roles/capabilities
active deployment/release selection
Gateway idempotency identity
```

Podem viajar como input/expectation/attestation legítimos:

```text
operation-specific business input
runtimeContractDigest
expectedGeneration / expectedRevision
ApprovalRequest identity + user decision input
```

`expectedGeneration`/`expectedRevision` são expectations a testar, nunca authority para mutar.

DEDICATED exchange continua deliberadamente não-forçado em F2/F3/F5 até a decisão específica later 3F/3I.

---

## 11. Failure loci

Os loci de 3F-01:

```text
L1 DOMAIN_OR_AUTHORITY_REJECTION
L2 CONTRACT_INVALID
L3 STALE_EXPECTATION
L4 DURABLE_INTERPRETATION_FAILURE
```

ficam **fora do wire público**.

Stable code é o consumer behavior key.

Later 3F deve manter mapping mecânico:

```text
public stable code → exactly one semantic locus
```

para auditabilidade e consistência, sem expor L1-L4 ao cliente.

---

## 12. Baseline family/trait classification

| Surface / representation | F1 classification |
|---|---|
| internal module → module | F1 `INTERNAL_TYPED_CALL` |
| L7 → modules | F1 |
| Gateway artifact/runtime execute | F2 `RUNTIME_EXECUTION` |
| published app → runtime execute | F2 + T4 + conditional T5/T6 |
| async execute/status/stop | F2; no async framework |
| Control Plane browser → Hub operation | F3 `PLATFORM_OPERATION_RULES` |
| approval capability internal call | F1; exact approval result/signature later 3F |
| ApprovalRequest durable representation | F4 `DURABLE_CONTENT` |
| connector/artifact kind/vN, manifests, bindings | F4 |
| OBS/runtime telemetry/event ingestion | F5 `OBSERVATION_APPEND` |
| worker/checklist/SHARE/knowledge/finding proposal | F5 `PROPOSAL` |
| adapter → vendor SDK/API | vendor boundary; adapter maps failures into our owner/public semantics as applicable |
| DEDICATED identity/authority exchange | unforced; later 3F/3I |

---

## 13. Buildability disposition

A convergência final classificou o modelo como combinação de mechanisms `PROVEN | CONVENTIONAL` apoiados por authority/evidence existente.

```text
no UNSUPPORTED mechanism
zero new probes required
zero new subsystems required
no Material Finding against 3F-01/C-005/C-007/C-010/C-012/C-013/C-016/C-017
```

F5/fallback reutilizam machinery C-013 já coberta pelo `CX-OBS-V0-01`; nenhuma qualification nova nasce desta decisão.

---

## 14. Não autorizado / YAGNI

3F-02 não autoriza:

```text
UniversalRequest / ApiRequest<T>
UniversalSuccess / ApiResponse<T>
UniversalStatus
UniversalInternalFailure
central error framework / error registry service
public failure locus L1-L4
retryable:boolean como wire authority genérica
RecoveryClass taxonomy sem consumidor
generic details/metadata/context bag
generic async/command framework
public code para internal-only failure variant
shared success metadata por conveniência
field-level DTO inventory
HTTP route inventory
OpenAPI / GraphQL / gRPC selection
schema/error library selection
```

Qualquer item retorna apenas pelo Decision Loop com named consumer/failure class real.

---

## 15. Trabalho roteado adiante

Later 3F:

```text
literal stable public codes
per-code details schemas
public-code → failure-locus table
exact wire field/layout decisions por boundary concreta
approval capability exact signature/result shape
Project binding contract shapes
DEDICATED exchange shape
```

Later phases:

```text
async/attempt status projection → 3G/3H
F5 wire realization           → 3H
trust/authority enforcement   → 3I
technology/schema qualification → 3L
recovery machinery            → 3M
```

---

## 16. Global Maximum / reopen rule

3F-02 passou por três rounds adversariais e closure, incluindo buildability, sem Material Finding contra prior authority.

Isso preserva:

```text
3F-01 surface/version-gap architecture
C-005 runtime envelope family
C-012 honest-runtime/client semantics
C-013 observability/proposal/effect-state separation
C-016 sanitized-error/traffic-state security
```

Nenhuma decisão anterior vira dogma. Finding material futuro com failure class concreta pode reabrir esta decisão ou authority anterior pelo Decision Loop.

---

## 17. Estado após aprovação

Ratificado pelo operador em 2026-08-15:

```text
3F-01 = APPROVED
3F-02 = APPROVED
3F — Contracts & API Architecture = IN PROGRESS
3G = NOT STARTED
```

A próxima decisão de 3F deve ser trabalhada com o operador antes de materialização. A Fase 3 inteira continua aberta até C-018.
