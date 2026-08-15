# 3D-02 — Capability Gateway Dependency Architecture

**Status:** APROVADO pelo operador em 2026-08-14  
**Fase:** 3D — Dependency Architecture  
**Importante:** esta decisão não constitui C-018, não encerra a Fase 3, não autoriza implementação, não autoriza merge e não inicia 3E.

## Decisão em uma frase

No Conexus F1, o `Capability Gateway` permanece uma boundary única de **last-mile admission + controlled physical execution**. Ele pode depender diretamente apenas das public projections estreitas de `Identity & Access`, `Project`, `Artifact Registry`, `Connections` e `Release`, além de infrastructure capabilities já justificadas; recebe do caller apenas refs/contextos imutáveis ou previamente delimitados e nunca cópias de authority revogável. A fonte da composição/binding é definida pela surface (`PUBLISHED_APP`, `AGENT_RUN`, `BUILDER/CANDIDATE`, `CONNECTION_QUALIFICATION`), approval de efeito é single-claim e vinculada à execução exata dentro da admissão atômica, e novas classes de authority/dependency não podem ser adicionadas silenciosamente ao Gateway. Reads comuns permanecem leves; effects usam a machinery durável necessária para budget, idempotency, traffic state, receipt e `OUTCOME_UNKNOWN`.

---

## 1. Contexto e precedência

Esta decisão detalha 3D-01 para o principal pressure point do dependency graph:

```text
Builder / Production Agent Runtime / Managed Runtime / use cases
                         ↓
                 Capability Gateway
                         ↓
 I&A + Project + Registry + Connections + Release + physical executors
```

Preserva integralmente:

- C-005/C-010/C-013/C-014/C-015/C-016;
- 3C-02, 3C-04, 3C-06, 3C-07, 3C-08, 3C-10, 3C-11, 3C-15;
- 3D-01 — Macro Dependency Architecture;
- `Minimal Enforcement Surface`;
- `No Universal Privileged Bus`;
- `I&A ALLOW != EXECUTE`;
- `AVAILABLE != ACTIVE`;
- authority ≠ mechanics;
- cross-module table/internal access proibido.

Input adversarial usado na reconciliação:

- `3D-FABLE-R1-capability-gateway-dependency-review.md`.

A revisão confirmou o macro-DAG de 3D-01, encontrou refinamentos materiais de binding/composition source e approval claim, e não encontrou Finding que reabra 3C ou 3D-01.

---

## 2. O Gateway continua uma única boundary

F1 mantém:

```text
Capability Gateway
├── admission
├── controlled execution
├── effect/idempotency mechanics
├── traffic state / receipt / outcome
└── authoritative Gateway execution evidence
```

Não dividir agora em:

```text
AdmissionModule
ExecutionModule
ProjectDataGateway
ExternalIntegrationGateway
PolicyEngine
```

Motivo: a separação criaria interface/transação maior, duplicaria a conjunção de admission ou exigiria um terceiro `AdmissionCore` sem eliminar failure class atual.

Os executores físicos de Project Data e External Integration permanecem internals fechados do Gateway, não módulos autônomos.

---

## 3. Dependências diretas permitidas do Gateway

O Gateway pode importar apenas public internal APIs/projections estreitas dos owners necessários à admission.

### Identity & Access

Fornece fatos equivalentes a:

```text
principal / caller identity aplicável
surface access context
effective access / revocation state relevante
```

O Gateway não navega memberships/roles tables nem duplica a resolução de access.

### Project

Fornece apenas fatos Project-owned quando a surface exige **intent atual**, por exemplo:

```text
ProjectRef / WorkspaceRef
runtime profile
current Project binding facts para Builder/candidate flows
```

Project não vira source universal de runtime composition.

### Artifact Registry

Fornece revisão compilada exata e content-addressed, incluindo apenas metadata necessária à execução, como:

```text
ArtifactRef / revision digest
compiled payload reference
input/output contract
classification/effects/approval floor/idempotency metadata aplicável
executor class
```

Registry não executa capability nem decide autorização.

### Connections

Fornece:

```text
ConnectionRevision identity
exact target/environment
opaque credential/grant handle relation
current eligibility/revocation facts necessários
```

Nunca secret bytes.

`HEALTHY != ALLOW`: health operacional continua diagnóstico/projeção do owner e não entra automaticamente como authority de admission.

### Release

Fornece somente identidade/pins de composition, por exemplo:

```text
active Release ref quando a surface usa active PROD
ReleaseManifest digest
exact artifact/binding/config pins
```

Release não recebe caller identity e não vira policy aggregator.

### Observability & Audit

O Gateway apenas **emite** Gateway-authoritative execution/audit facts.

```text
Gateway → Observability
```

Nunca:

```text
Observability → decide Gateway admission
```

---

## 4. Dependências proibidas

F1 proíbe:

```text
Gateway → Builder internals
Gateway → Production Agent Runtime runtime/domain imports
Gateway → Managed Runtime internals
Gateway → Brain imports
Gateway → Workspace internals
Gateway → Attachments internals
Gateway → ApprovalRequest tables
Gateway → secret bytes
Gateway → Observability query como authority
Gateway → arbitrary policy/service locator
```

O fato de uma relação existir no runtime call flow não autoriza reverse import.

---

## 5. A fonte da composição depende da surface

Esta é uma regra normativa de 3D-02.

Não existe uma pergunta universal:

```text
"qual é o binding atual deste Project?"
```

que possa governar todos os callers.

### `PUBLISHED_APP`

```text
Managed Runtime request
→ active PROD Release
→ ReleaseManifest pinado
→ artifact/binding/config da Release ativa
→ Gateway
```

Mudança posterior em `ProjectBrainBinding`, `ProjectConnectionBinding` ou Config Contract **não altera o app servido** antes de nova Release/Promotion.

Logo:

```text
PUBLISHED_APP
-X-> current Project binding as runtime authority
```

### `AGENT_RUN`

Um AgentRun preserva a composition pinada quando iniciou.

```text
AgentRun
→ governing ReleaseManifest/composition ref pinada
→ exact artifact/tool/binding refs
→ Gateway
```

Nova Release disponível/promovida não troca silenciosamente a composition de run in-flight.

A questão de narrowing/revocation de policy para runs antigos é Finding separado roteado a 3G/3I (§14).

### `BUILDER / CANDIDATE`

Builder constrói o estado futuro do software e opera sob authority de Change/Project atual.

```text
Builder discovery/candidate
→ approved Change/Baseline context
→ current Project intent/bindings aplicáveis
→ Gateway
```

Não consulta active Release para decidir qual binding o futuro candidate deve investigar.

### `CONNECTION_QUALIFICATION`

Qualification opera sobre uma `ConnectionRevision` concreta e ConnectorDefinition exata.

```text
Qualification
→ ConnectionRevisionRef
→ ConnectorDefinitionRef
→ controlled non-mutating probe through Gateway
```

Não exige Release e não exige Project binding quando a própria operação é qualification da Connection.

### `ANALYTIC_QUERY`

O Brain/use case fornece plano semântico compilado confiável; Gateway realiza apenas enforcement/execution física de leitura.

```text
Brain semantic plan
→ Gateway physical read
```

Sem `Gateway → Brain` reverse import.

---

## 6. Caller context não é authority universal

Caller contexts podem transportar:

```text
opaque IDs/refs
content-addressed digests
exact artifact/composition refs
scope/limits já delimitados pela authority do caller
correlation identity
```

Não podem transportar como verdade suficiente:

```text
approvalWasValid = true
sessionWasValid = true
connectionStillAuthorized = true
activeReleaseWas = X
budgetStillAvailable = true
```

quando o fato é revogável/material para a execução.

3D-02 congela a propriedade de contextos **surface-specific**, sem congelar DTOs ou nomes finais de 3F.

---

## 7. Authority revalidation depende do tipo de caller

A revisão adversarial modelou corretamente revalidação perto da execução, mas 3D-02 refina uma simplificação importante:

> **Nem todo efeito exige uma sessão humana viva. O Gateway revalida a authority atual aplicável ao tipo de caller/surface.**

Exemplos conceituais:

```text
PUBLISHED_APP / humano
→ Account/session + app access context + domain admission

interactive AgentRun
→ AgentRun/caller authority + composition + approval/effect policy

scheduled/background AgentRun
→ AgentRun/Agent/Project authority aplicável
→ NÃO exige sessão humana ativa por construção

Builder
→ Change/ActorRun scoped authority + read/tool scope aplicável

Connection Qualification
→ qualification authority/context explicitamente concedido
```

A forma exata de revogar/cancelar caller authority durante runs pertence a 3G/3I.

---

## 8. Approval de efeito — single-claim atômico

3D-01 aprovou uma única inversão estreita para approval. 3D-02 precisa sua semântica conforme C-010.

A capability não é apenas:

```text
verify approval → true/false
```

Ela deve preservar semanticamente:

```text
ApprovalRequest approved
+
exact effect/execution identity
+
claim single-use / replay-safe
+
atomic relationship with admitted effect attempt
```

Regra:

> **Uma approval para efeito é vinculada à identidade exata da unidade de efeito e é claimed atomicamente junto da admissão da tentativa. Retry/recovery da mesma tentativa pode reutilizar o estado durável daquela tentativa; uma approval antiga nunca autoriza silenciosamente um novo efeito.**

A inversão permanece mínima:

```text
Gateway
→ depende de uma narrow approval-claim capability

Production Agent Runtime
→ realiza a capability sobre sua própria ApprovalRequest authority

composition root
→ wiring
```

Não nasce:

```text
CallerAuthorityVerifier
ApprovalService universal
PolicyProviderRegistry
Authorization callback framework
```

Nomes de methods/results, envelope hash final e signatures ficam para 3F/3G.

---

## 9. Admission de effects — atomicidade local

Para effect material, a admission precisa permitir que fatos/claims locais que evitam overspend/replay sejam comprometidos de forma atômica quando aplicável.

Conceitualmente, o conjunto pode incluir:

```text
current applicable authority checks
exact compiled capability/composition/binding
Connection/grant eligibility
approval claim quando requerido
budget reservation
idempotency claim
effect attempt record = NOT_SENT
```

A transação pode atravessar operações de vários owners conforme 3D-01, mas:

```text
shared transaction atomicity
!=
shared data ownership
```

Cada owner continua executando apenas a operação sobre seus próprios dados.

A forma física do ledger/tables/transactions pertence a 3E.

---

## 10. Gateway-owned admission/effect state

Sem congelar schema, o Gateway owns a machinery durável necessária para executar a própria boundary, incluindo quando aplicável:

```text
budget reservation/counter mechanics
idempotency claim
effect execution identity/attempt
traffic_state
receipt/outcome
OUTCOME_UNKNOWN classification/retry eligibility
```

A definição dos valores/policies continua nos respectivos owners/contracts.

Exemplo:

```text
artifact/project/agent policy
→ qual é o limite/floor

Gateway
→ aplica/debita/enforça fisicamente
```

Logo:

```text
Gateway owns enforcement mechanics
!=
Gateway owns every policy value
```

---

## 11. Closed admission classes — guard contra god-module

As famílias atuais que justificam participação do Gateway ficam arquiteturalmente fechadas.

Forma conceitual:

```text
CALLER / ACCESS
CAPABILITY REVISION + CLASSIFICATION
GOVERNING COMPOSITION / CANDIDATE
PROJECT BINDING quando a surface usa current intent
CONNECTION / TARGET ELIGIBILITY
APPROVAL quando aplicável
BUDGET / PHYSICAL LIMIT
PRECONDITION / IDEMPOTENCY / EFFECT CLAIM quando aplicável
```

Isso **não** congela campos nem impede evoluir facts dentro de uma família já aprovada.

Regra normativa:

> **Adicionar uma nova classe de authority/admission que introduza novo owner, nova dependência estrutural ou amplie a responsabilidade do Gateway exige Decision. Evoluir dados dentro de uma classe existente não reabre arquitetura.**

Portanto não é permitido por implementação casual:

```text
"agora Gateway também consulta Brain para decidir"
"agora Gateway também faz release promotion"
"agora toda operação administrativa passa pelo Gateway"
```

---

## 12. Reads permanecem leves

A existência da machinery de effects não transforma reads comuns em mini-transações de efeito.

Reads normais não recebem por default:

```text
approval claim
durable effect budget reservation
idempotency claim
effect attempt record
traffic state lifecycle
```

Eles continuam sujeitos a:

```text
caller/access apropriado
exact capability/composition/binding aplicável
read-only physical authority
input/output contract
row/byte/time/pagination ceilings
```

Algumas classes de leitura de maior risco — por exemplo export material — podem ser classificadas posteriormente como effect-like por 3I/C-016. Isso não torna toda leitura effectful agora.

---

## 13. TOCTOU — regra de classificação

3D-02 não congela isolation level ou SQL, mas congela o tratamento conceitual:

### Content-addressed/immutable

```text
artifact revision
ConnectorDefinition revision
ConnectionRevision identity
ReleaseManifest digest
compiled contract/digest
```

→ viaja/pina; não precisa de lookup semântico repetido para provar conteúdo.

### Revogável e material para effect

```text
caller authority aplicável
approval
Connection grant/eligibility
budget
active Release pointer quando essa surface usa active PROD
```

→ revalidar o mais próximo possível da admission/efeito.

### Precondition que pode mudar no target

```text
row version
ETag
expected cardinality
external state
```

→ enforce no próprio effect/target; nunca "read first and trust later".

### External uncertainty

Após possível send:

```text
SENT_NO_RESPONSE
```

não vira `FAILED` por conveniência.

`OUTCOME_UNKNOWN` não recebe blind retry.

---

## 14. Finding roteado — policy de AgentRun antigo após narrowing

A revisão R1 expôs uma questão real fora de Dependency Architecture:

```text
AgentRun inicia sob composition R17
→ suspende
→ R18 é promovida com policy mais restritiva
→ run R17 retoma e tenta effect
```

3D-02 não decide se:

```text
A. run preserva integralmente a policy pinada de R17
```

ou:

```text
B. narrowing material de R18 revoga/eleva policy de runs antigos
```

porque a resposta envolve lifecycle/revocation/threat semantics.

Disposition:

```text
F3D02-R1 — In-flight AgentRun policy narrowing
→ owner: 3G / 3I
→ não bloqueia 3D
→ não autoriza implementação assumir A ou B silenciosamente
```

---

## 15. O que 3D-02 NÃO decide

### 3E

- tables/PK/FK/indexes do admission/effect ledger;
- transaction boundaries físicas;
- lock/isolation mechanics.

### 3F

- signatures dos caller contexts;
- DTOs;
- approval capability API concreta;
- error taxonomy;
- exact effect envelope/hash representation.

### 3G

- effect FSM;
- settlement/retry/reconciliation;
- approval lifecycle concreto;
- qualification gating details;
- in-flight policy narrowing com 3I.

### 3H

- caches;
- projection invalidation;
- runtime performance/pooling.

### 3I

- caller authority/revocation semantics;
- egress physical enforcement;
- credential/security realization;
- in-flight policy narrowing com 3G.

### 3M

- crash recovery de attempts `NOT_SENT`/unknown;
- orphan/reconciliation drills.

---

## 16. Anti-overengineering

3D-02 não autoriza:

```text
Gateway split em múltiplos domain modules
OPA/Cedar/OpenFGA
Generic Policy Engine
Universal Admission Context
Universal Caller Authority Verifier
command/event bus
service locator
dynamic executor registry
raw proxy surface
Gateway → Brain dependency
Gateway → Builder/PAR/MAR reverse import
health-as-authorization
session-required-for-all-agent-effects
```

---

## 17. Invariantes aprovadas

1. Gateway continua boundary única Admission + Execution no F1.
2. Gateway possui import DAG descendente somente para public projections necessárias.
3. Gateway não lê tables/internals de outro módulo.
4. Project current intent não governa runtime publicado; Release pin governa `PUBLISHED_APP`.
5. AgentRun usa composition pinada do run, não latest Release, salvo futura policy explícita de revocation/narrowing.
6. Builder/candidate usa current approved Project/Change intent, não active PROD como source do futuro software.
7. Qualification opera sobre ConnectionRevision exata e não exige Release.
8. Caller context carrega refs/limits, não snapshots de authority revogável.
9. Revalidação de caller authority é surface/caller-specific; scheduled/background Agent não exige sessão humana viva por construção.
10. Approval de effect é single-claim/replay-safe e atomicamente vinculada à tentativa exata.
11. Gateway owns effect admission/execution mechanics e ledger próprio, não os valores semânticos de todas as policies.
12. Nova classe de admission/authority que cria novo owner/dependency exige Decision.
13. Reads comuns permanecem lightweight.
14. `HEALTHY != ALLOW`; health não é authorization fact por default.
15. `OUTCOME_UNKNOWN` nunca vira blind retry.
16. Promotion, migration, Git, Registry publication, Attachments e ordinary internal calls continuam fora do Gateway.

## Consequência

O Gateway permanece deliberadamente poderoso no ponto físico certo, mas estreito no dependency graph:

```text
caller expresses intent/context
        ↓
Gateway resolves/revalidates only approved authority families
        ↓
DENY
ou
atomic admission of exact attempt
        ↓
controlled physical execution
        ↓
receipt / honest outcome
```

Ele não vira mediator universal, policy engine, workflow engine ou owner das authorities que consulta.
