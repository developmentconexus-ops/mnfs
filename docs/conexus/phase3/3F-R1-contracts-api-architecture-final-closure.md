# 3F-R1 — Contracts & API Architecture Final Closure

**Status:** APPROVED / CLOSED pelo operador em 2026-08-16  
**Fase:** 3F — Contracts & API Architecture  
**Authority:** reconciliação final de 3F-01..3F-06 após cross-review independente ChatGPT + Fable  
**Método:** DevelopmentConexus Engineering Method v1.0.0  
**Importante:** esta decisão não constitui C-018, não encerra a Fase 3 completa e não autoriza implementação de produto, merge ou PR readiness.

## Decisão em uma frase

3F — Contracts & API Architecture está **CLOSED / APPROVED**: as boundaries, semantics, version-gap laws, approval contracts, Project bindings, public failure contract e exchange `DEDICATED` possuem authority suficiente para alimentar 3G–3O sem nova decisão material de contratos; os resíduos restantes são realization/UX/trust/runtime/qualification work, não justificam `3F-07`, e 3F só reabre por evidence material.

---

## 1. Authority e reconciliação

Este fechamento reconcilia:

- C-000..C-017;
- 3C CLOSED + 3C-R1;
- 3D CLOSED + 3D-R1;
- 3E CLOSED + 3E-R1;
- 3F-01 — Contract Surface Classification & Versioning Boundary;
- 3F-02 — Boundary Payload Semantics & Error Envelope Architecture;
- 3F-03 — Approval Claim & ApprovalRequest Contract;
- 3F-04 — Project Binding Contract Architecture;
- 3F-05 — Public Failure Code & Details Contract;
- 3F-06 — DEDICATED Platform Service Exchange;
- `3F-CHATGPT-R1-final-contracts-api-coherence-review.md` como review independente não-autoritativo;
- `3F-FABLE-R1-final-contracts-api-coherence-review.md` como review independente não-autoritativo.

Os dois reviews congelaram seus verdicts independentemente e convergiram materialmente em:

```text
CLOSE 3F
MATERIAL BLOCKERS = 0
MATERIAL 3F DECISIONS STILL REQUIRED = 0
3F-07 = NOT JUSTIFIED
NEW PROBES = 0
```

Arquivos de review permanecem evidence/input. Somente este fechamento ratificado e as decisões 3F aprovadas possuem authority.

---

## 2. Teste de fechamento

Um resíduo bloquearia 3F somente se diferentes realizações admissíveis pudessem alterar:

```text
invariant/correctness
owner/authority boundary
public or durable contract meaning
trust boundary
mandatory input to a later architecture phase
```

Se todas as realizações admissíveis preservam esses fatos, o resíduo é **realization**, não arquitetura pendente.

Aplicando esse teste ao intake de 3F e aos itens `later 3F`, nenhuma obrigação arquitetural material permanece sem owner.

---

## 3. Resultado final de 3F

### 3.1 Contract surfaces e version gaps — 3F-01

Permanece congelado:

```text
LIVE SURFACE
  INTERNAL | INDEPENDENT
  CONDITIONAL = routing state only

DURABLE REPRESENTATION
  admitted only by D1 / D2 / D3
  persistence alone != contract

VERSION-GAP MODE
  PRESERVE | REJECT_STALE | QUIESCE | TRANSFORM | DISCARD

FAILURE LOCUS
  L1 DOMAIN_OR_AUTHORITY_REJECTION
  L2 CONTRACT_INVALID
  L3 STALE_EXPECTATION
  L4 DURABLE_INTERPRETATION_FAILURE
```

Direct-call-first permanece; module boundary não cria wire/version ceremony por si só; ordinary 3E rows continuam migration-private por default.

### 3.2 Payload semantics — 3F-02

Famílias e traits permanecem distintos:

```text
F1 INTERNAL_TYPED_CALL
F2 RUNTIME_EXECUTION
F3 PLATFORM_OPERATION_RULES
F4 DURABLE_CONTENT
F5 PRODUCER_INGRESS_OR_PROPOSAL

T1 PublicFailureProjection
T2 ExecutionIdentity
T3 Correlation
T4 CompatibilityAttestation
T5 DataMeta
T6 EffectTrafficState
```

Não existe UniversalRequest/Response/Status/InternalFailure. Authority/context é derivado server-side quando pertence ao trusted boundary. Execution failure, lifecycle outcome e effect receipt permanecem vocabulários distintos.

### 3.3 Approval contract — 3F-03

```text
one ApprovalRequest
= one human decision
= one exact sealed effect subject
```

`FIRST_CLAIM` e `RECOVER_BOUND` formam a união fechada necessária; claim + Gateway admission é atômico; approval não é reutilizável nem transferível; PAR mantém custody única do sealed subject; Gateway não ganha segunda source of truth.

### 3.4 Project bindings — 3F-04

Dois contratos concretos, sem generic base:

```text
ProjectConnectionBinding
ProjectBrainBinding
```

Leis finais:

```text
Git source revision        = authored intent
Hub current binding ref    = current Project intent
ReleaseManifest exact pins = served composition
```

Portanto:

```text
new Git commit != current Project binding
new current Project binding != active Release
new owner revision != Project binding changed
```

No `BindingSet`, `bindingSetDigest`, live inheritance, latest semantics, implicit fallback ou runtime mutable-current lookup.

### 3.5 Public failures — 3F-05

Baseline F1:

```text
CLIENT_OUTDATED
CAS_CONFLICT
CAPABILITY_UNAVAILABLE_HEALTH
NOT_FOUND
OPERATION_REJECTED
VALIDATION_FAILED
MANIFEST_INVALID
OUTPUT_CONTRACT_VIOLATION
INTERNAL_ERROR
```

O public `code` é semantic consumer-behavior key; internal variants só entram por boundary admission; details são absent by default e code-discriminated/closed quando existem; `INTERNAL_ERROR` é o único `UNCLASSIFIED` fallback.

### 3.6 DEDICATED exchange — 3F-06

F1 preserva:

```text
browser
→ DEDICATED application boundary
→ DEDICATED server/runtime
→ Conexus Platform Service
```

Asserted identities:

```text
DedicatedApplicationPrincipal
exact ReleaseRef
DelegatedConexusPrincipal?  # somente quando 3I estabelecer independentemente
```

Project, Workspace, service audiences, bindings e service-contract identities são derivados/validados server-side. Exact `ReleaseRef` é a T4 attestation dessa surface. No second contract digest, broad Platform secret ou caller-asserted scope authority.

---

## 4. Global coherence closure

O cross-review verificou a cadeia completa:

```text
3C ownership
→ 3D dependency direction
→ 3E durable truth/reference
→ 3F contract/interaction semantics
```

### 4.1 Release é a composition root única

`ReleaseManifest` continua sendo a única authority de composição servida.

Não existem aggregates concorrentes para bindings, runtime contract ou DEDICATED exchange.

### 4.2 Current intent não é runtime composition

Uniformemente:

```text
PUBLISHED_APP → active Release composition
AGENT_RUN     → run-pinned composition
DEDICATED     → exact ReleaseRef composition
```

Mutable current Project intent nunca troca silenciosamente software já pinado.

### 4.3 MANAGED e DEDICATED continuam uma Factory

Os profiles compartilham Project/Change/Builder/verification/Release e contracts semânticos comuns. Divergem somente onde runtime/trust boundary realmente diverge.

Não existem duas factories nem uma taxonomy/API stack paralela para DEDICATED.

### 4.4 Failure, lifecycle e effect outcome não se unificam

```text
T1 public failure
!= lifecycle/domain outcome
!= attempt/admission state
!= effect receipt outcome
```

`AWAITING_APPROVAL`, `DENY`, `EXPIRE`, `STALE`, `PARTIAL` e `OUTCOME_UNKNOWN` não são reinterpretados como public error codes por conveniência.

### 4.5 Authority continua server-derived

Caller input pode trazer business input, expectations e attestations admitidas; nunca ganha authority apenas por declarar Project, Workspace, role, user ou mutable binding.

### 4.6 PRESERVE horizons permanecem coerentes

O mesmo princípio atravessa durable/public contracts, approval custody, public-code evolution e DEDICATED service-contract support. Remover suporte de contract ainda dentro de seu horizon é breaking change, não upgrade normal.

---

## 5. Compatibility handshake — disposição final

O antigo `3F-01` routing de "exact handshake posterior 3F" está **semanticamente resolvido**.

Por surface:

```text
MANAGED published app
→ C-012 runtimeContractDigest + CLIENT_OUTDATED

DEDICATED
→ 3F-06 exact ReleaseRef as T4 attestation

Control Plane browser
→ 3F-01 fail-closed staleness obligation
+ 3F-02 T4
+ 3F-05 CLIENT_OUTDATED behavior
→ exact transport realization later
```

C-012 é direct authority da published-app/scaffold surface e apenas padrão provado para Control Plane; não é reinterpretado como authority universal.

Deletion test:

```text
remove exact handshake transport
→ CAS/expectations/pins/Release composition still preserve correctness
→ loses precise CLIENT_OUTDATED detection/UX, not integrity authority
```

Logo, placement/nome/serialization da attestation no Control Plane é implementation realization. Alterar semantic source, horizon, stale behavior ou authority model reabre 3F por Decision Loop.

---

## 6. Resíduos reclassificados — sem `later 3F`

| Resíduo | Owner final |
|---|---|
| exact wire layout / HTTP mapping | implementation + contract tests; 3L somente se transport/schema technology exigir qualification |
| exact `MANIFEST_INVALID` diagnostic fields | promote/compile implementation + 3K presentation, sob 3F-05 closed-details law |
| per-family Approval card/display | 3K + implementation, sob 3F-03 exact-subject mechanical projection |
| authored binding file/schema syntax + literal TS/DTO spelling | implementation; 3K para authoring UI; 3L somente se tooling exigir qualification |
| async/attempt status projection | 3G / 3H |
| F5 wire realization | 3H |
| concrete trust/auth/credential realization | 3I |
| deployment/network realization | 3I / 3J |
| frontend/product realization | 3K |
| technology probes | 3L only on concrete technology uncertainty |
| recovery machinery | 3M |
| architecture-wide proof | 3N / 3O |

Nenhum item acima exige `3F-07` agora.

---

## 7. Corolário anti-segunda-chave

Para **authenticated/admitted public failures governadas por 3F-05**:

> `code` é a chave semântica de comportamento do consumidor. HTTP status, route ou transport metadata podem realizar o protocolo, mas não podem criar uma segunda taxonomy concorrente de comportamento.

Isso não congela nem limita outcomes de **pre-contract authentication/credential/challenge**.

Esses continuam integralmente em 3I, conforme 3F-06, incluindo:

```text
challenge semantics
anti-oracle behavior
401/403-or-other transport choice
credential-invalid/expired behavior
replay/proof-of-possession mechanics
```

---

## 8. Proof-at-maturity e buildability

Os cross-reviews encontraram:

```text
material blockers = 0
unsupported mechanisms = 0
new probes required by closure = 0
new subsystems required by closure = 0
```

A arquitetura foi verificada por coherence/deletion/Structural Inversion/Future-Cost no maturity level atual.

Implementation e end-to-end evidence permanecem obrigatórios quando as respectivas claims forem implementadas; documentação/architecture review não prova runtime behavior inexistente.

O repository `npm run verify` voltou a GREEN antes desta closure após corrigir testes documentais que ainda tratavam o antigo `AGENTS.md` como projection de status e separar o registry documental legado MNFS do corpus Conexus. Isso prova a coerência mecânica do bootstrap/documentation tooling, não a implementação futura dos contracts aqui descritos.

---

## 9. Reopen triggers

3F só reabre com evidence material, incluindo:

- independent/mixed-version consumer real que não possa ser expresso pelas current version-gap laws;
- comportamento público real que não possa mapear com segurança para 3F-05 sem perder comportamento do consumidor;
- nova durable representation que falhe o admission test de 3F-01;
- approval consumer real incompatível com exact-subject/single-claim;
- binding consumer real incompatível com os dois contratos concretos de 3F-04;
- evidence de 3H/3I/3J de que uma semântica aprovada não pode ser realizada sem mudar authority ou contract meaning;
- implementation evidence mostrando que um resíduo classificado como realization-only de fato altera public/durable semantics;
- browser-direct DEDICATED Platform-Service consumer real;
- real federation/delegation or windowed compatibility need beyond the current prepared seams.

Nenhum reopen ocorre por preferência de framework, naming local, HTTP aesthetics ou desejo de future-proofing.

---

## 10. Formal closure

Ratificado pelo operador em 2026-08-16:

```text
3F-01 = APPROVED
3F-02 = APPROVED
3F-03 = APPROVED
3F-04 = APPROVED
3F-05 = APPROVED
3F-06 = APPROVED
3F-R1 = APPROVED

3F — Contracts & API Architecture = CLOSED / APPROVED
3G — Behavioral / State Architecture = NEXT / NOT STARTED
```

A Fase 3 inteira permanece aberta até C-018.

Este fechamento não autoriza implementação de produto, não altera o status DRAFT do PR da Fase 3 e não autoriza merge.