# 3F-05 — Public Failure Code & Details Contract

**Status:** APPROVED pelo operador em 2026-08-16  
**Fase:** 3F — Contracts & API Architecture  
**Authority:** quinta decisão aprovada de 3F  
**Importante:** esta decisão não constitui C-018, não encerra 3F nem a Fase 3 e não autoriza implementação, merge ou PR readiness.

## Decisão em uma frase

Conexus F1 usa **owner-default + boundary-admission** para mapear failures internas a um conjunto pequeno de public failure codes orientados ao comportamento do consumidor, com uma projeção estática única de `code → locus + details-contract`, details fechados apenas quando existe consumidor real, evolução aditiva enquanto Releases pinadas dependem do contrato e nenhum ErrorRegistry/service/framework.

## 1. Authority e método

Esta decisão especializa o trabalho explicitamente roteado por 3F-02 e reconcilia 3F-01..3F-04, C-005, C-007, C-011..C-016 e a DevelopmentConexus Engineering Method v1.0.0.

Review/provenance não-autoritativa:

- `3F-FABLE-DIALOGUE-public-failure-code-details-contract.md`.

A revisão adversarial terminou em `CURRENT STRUCTURE CONFIRMED` com correções limitadas e `READY FOR OPERATOR APPROVAL`; não encontrou Material Finding contra 3F-01..3F-04 ou C-016.

## 2. Leis de public code

### 2.1 Literal é a unidade de authority pública

Cada literal possui uma única definição de contrato público:

```text
meaning
+ semantic locus (L1..L4) ou UNCLASSIFIED para o fallback único
+ details-contract identity quando aplicável
```

Owner-default, boundary admission e override escolhem **qual literal** uma failure variant usa; nunca redefinem o significado do literal.

A projeção é contrato estático, não runtime registry.

### 2.2 Owner-local primeiro, public admission depois

```text
owner-local failure variant
→ permanece privada
→ só ganha public semantics quando admitida a uma public/independent boundary
```

Mappings públicos são mecanicamente exaustivos.

A segunda public admission da mesma owner variant exige owner-level default. Divergência de boundary requer override explícito + rationale.

### 2.3 Um literal por comportamento do consumidor

Failures de owners diferentes **devem compartilhar** o mesmo literal quando o comportamento correto do consumidor é o mesmo.

Distinct literal exige distinct evidenced client behavior, não owner diferente, mensagem diferente ou exception interna diferente.

### 2.4 Namespace plano e sem vazamento de módulo

Permitido:

```text
stable product/domain vocabulary
```

Proibido:

```text
PRJ_*
GW_*
BLD_*
package/module prefixes
```

Refactor interno não deve virar public contract change.

### 2.5 Failure classes internas não são public codes automaticamente

As classes semânticas de 3F-03/3F-04 não são promovidas em massa.

Elas mapeiam para os codes baseline quando o comportamento do cliente já é coberto; novo literal entra apenas quando um comportamento público distinto é evidenciado.

## 3. Baseline F1 — 9 public codes

| Literal | Locus | Comportamento do consumidor | Details |
|---|---|---|---|
| `CLIENT_OUTDATED` | L3 | atualizar/recarregar attestation/contract e tentar novamente | none |
| `CAS_CONFLICT` | L3 | reler estado atual, reavaliar e tentar novamente | none; nunca data-return channel |
| `CAPABILITY_UNAVAILABLE_HEALTH` | L1 | apresentar indisponibilidade; evitar retry storm | none |
| `NOT_FOUND` | L1 | tratar como inexistente/indisponível sem revelar existência indevida | none |
| `OPERATION_REJECTED` | L1 | apresentar mensagem sanitizada; sem automatic retry | none |
| `VALIDATION_FAILED` | L2 | apresentar issues por campo público | `ValidationIssues` |
| `MANIFEST_INVALID` | L2 | apresentar diagnostics públicos de compile/promote | closed issue collection; exact fields later-3F |
| `OUTPUT_CONTRACT_VIOLATION` | L2 | falhar operação e apresentar platform-side contract defect | none agora |
| `INTERNAL_ERROR` | `UNCLASSIFIED` | generic failure + correlationId | none; no retryable; defect signal obrigatório |

`INTERNAL_ERROR` é a **única** exceção à tabela `public code → exactly one L1..L4 locus`, porque genuinely unforeseen faults não devem ser classificados falsamente.

## 4. `NOT_FOUND` security law

Foreign/unauthorized identity e nonexistent identity são **semanticamente indistinguíveis no contrato público**:

```text
same public code
same public shape/presentation policy
no existence-revealing details
```

Isso não exige byte equality literal: `correlationId` e metadata diagnóstica permitida podem variar por request. O contrato nunca cria existence oracle.

## 5. Details contracts

Details são **ausentes por default**.

Quando existem:

```text
closed
code-discriminated
presentation-safe
public identifiers only
never data-return channel
```

Continuam proibidos:

```text
Record<string, unknown>
metadata:any
context:object
stack/sql/internal paths/secrets
```

### 5.1 `VALIDATION_FAILED`

O único shape mínimo congelado agora é:

```text
ValidationIssues = {
  issues: Array<{
    field: PublicContractPath
    issueCode: ClosedValidationIssueCode
    params?: ParamsForThatIssueCode
  }>
}
```

`params?` é fechado/discriminado por `issueCode`; nunca generic bag.

Isso existe para forms atuais poderem destacar campos sem parsing de mensagem.

### 5.2 `MANIFEST_INVALID`

F1 congela apenas:

```text
closed issue collection over public identifiers
```

Os fields exatos pertencem ao futuro contract da promote/compile surface.

Dois codes podem referenciar o mesmo schema fechado por identidade; isso não cria `UniversalIssue`.

## 6. Static contract projection

Mínimo suficiente de implementação futura:

```text
one typed constant module:
  literal → locus | UNCLASSIFIED
          → details-contract identity | none

one contract-test family:
  public mapping exhaustiveness
  owner-default on second admission
  literal uniqueness
  no locus/details semantic collision
  exactly one UNCLASSIFIED literal
  baseline-floor: foreseen rejection maps without inventing a new generic
```

Não existe runtime component, DB ou service.

## 7. Evolution

Enquanto um literal estiver dentro do `PRESERVE` horizon de Releases/consumidores pinados:

```text
new literal                 → additive admission
rename in place             → prohibited
meaning change              → prohibited
locus change                → prohibited
breaking details change     → prohibited
split/merge                 → explicit contract evolution
```

Não criar aliases/deprecation/version registry em F1. Reabrir apenas quando existir mixed-version/windowed compatibility consumer real.

## 8. UX

Public code é machine key; usuário não precisa vê-lo.

```text
code
→ generated/client behavior
→ localized sanitized product language
```

Exemplo:

```text
CAS_CONFLICT
→ "Esta configuração mudou enquanto você editava. Atualize a tela e tente novamente."
```

`correlationId` é a ponte de suporte/diagnóstico, não detalhe de implementação apresentado como linguagem de produto.

## 9. Non-goals / YAGNI

3F-05 não autoriza:

```text
ErrorRegistry service/database
UniversalError / UniversalIssue / UniversalDiagnostic
RecoveryClass taxonomy
module-prefixed public codes
complete owner failure catalogs
public codes para internal-only variants
HTTP status/route inventory
SDK generation
schema/error library selection
localization framework
alias/deprecation machinery
runtime error registry
```

## 10. Routed onward

```text
exact wire layout por boundary                  → later 3F / implementation
exact MANIFEST_INVALID diagnostic fields        → promote/compile surface contract
HTTP mapping                                    → later 3F / implementation
schema/tooling realization                      → implementation / 3L when qualification matters
new public literal                              → boundary admission + Decision Loop
recovery machinery                              → 3M
```

## 11. Proof strategy

Architecture-stage falsification:

1. internal refactor does not require public-code rename;
2. every known public owner variant maps exhaustively;
3. same consumer behavior across owners maps to one literal;
4. details never become generic/data channel;
5. every classified literal maps to exactly one locus;
6. exactly one code is `UNCLASSIFIED`;
7. every foreseen rejection on current surfaces maps without minting accidental generic;
8. no authority/failure detail leaks through public projection.

Implementation evidence later must show compile/test failure on seeded violations.

## 12. Reopen triggers

Reopen only on material evidence, including:

- real consumer needing behavior not expressible by the baseline without loss;
- real mixed-version consumer requiring alias/deprecation compatibility;
- third-party/public SDK semantics requiring namespace composition;
- a details consumer that cannot be expressed safely by closed code-specific schema;
- implementation evidence showing static projection cannot enforce the approved laws.

## 13. Formal disposition

Operator approval on 2026-08-16 ratifies:

```text
3F-01 = APPROVED
3F-02 = APPROVED
3F-03 = APPROVED
3F-04 = APPROVED
3F-05 = APPROVED
3F = IN PROGRESS
```

Esta decisão não encerra 3F, não constitui C-018, não autoriza implementação de produto e não altera o status DRAFT do PR da Fase 3.
