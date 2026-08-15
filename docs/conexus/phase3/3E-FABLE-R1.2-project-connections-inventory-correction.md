# 3E-FABLE-R1.2 — Project/Connections Inventory Correction

**Status:** REVIEW / NÃO-AUTORITATIVO — correção focada de `3E-FABLE-R1-durable-record-inventory-review.md` (+ R1.1)  
**Fase:** 3E — Data Architecture, segunda rodada (target 3E-02)  
**Revisor:** Fable, sob direção do operador (Finding Project/Connections, 2026-08-15)  
**Base revisada:** `7d775f23ef1e930a809985c979a0ac843d8ae62e` (branch `agent/conexus-phase-3-system-design`, PR #40)  
**Importante:** não constitui C-018, não altera `LEDGER.md` nem decisões aprovadas, não autoriza implementação. Precedência entre reviews: **R1.2 > R1.1 > R1** nos escopos que cada correção cobre; todo o restante permanece como está.

---

## 1. Findings admitidos

### F3E02-R1.2a — `prj.project_binding` genérico contradiz 3C-04

A R1 §4 inventariou **uma** classe `project_binding` ("approved binding intent por consumer/environment"). 3C-04 congela o oposto:

```text
3C-04 (owns, F1):
  ProjectBrainBinding        — binding tipado, concreto
  ProjectConnectionBinding   — binding tipado, concreto

3C-04 (anti-overengineering):
  "Continuam concretos: ProjectBrainBinding, ProjectConnectionBinding.
   Nenhum GenericProjectBinding é autorizado."
```

Uma classe única com discriminador é exatamente a forma física de um `GenericProjectBinding`. Mesma família do defeito corrigido em R1.1: a review re-generalizou o que a autoridade deliberadamente manteve concreto.

### F3E02-R1.2b — Project Config Contract ausente do inventário

3C-04 dá ao Project authority explícita sobre o Config Contract — declaração tipada do shape de configuração requerido, com operações semânticas `publishProjectConfigContract` / `resolveProjectConfigContract` — e C-014 pina `configContractDigest` na identidade do release. A R1 não materializou nenhuma forma durável para isso. Omissão real; corrigida no §3.

---

## 2. Re-falsificação — representação física dos dois bindings

Semânticas a preservar (3C-04 + autoridade herdada):

```text
ProjectBrainBinding
  "como ESTE Project consome ESTA revisão do Brain"
  → intent aprovado apontando revisão de binding pinada por digest
    (authoring git-first `brain-binding/v1` compilado no Registry — C-011;
     cadeia 3C-R1: Git authoring → Project approved intent → Registry
     compiled revision → specialized validation → Release pin)
  → chave: project (slot único F1 — C-011 v0 = 1 grupo/1 Brain dirigido)

ProjectConnectionBinding
  "qual Connection/revision/environment para qual FINALIDADE"
  → intent operacional: purpose (`erp.primary`) × environment
    (BUILD/PREVIEW/PROD — C-014 binding ambiente-app × Connection-environment)
  → alvo: Connection operacional no hub_control (C-007), não artefato git
  → chave: project × purpose × environment
```

### Opção A — duas classes tipadas — **ADOTADA**

```text
prj.brain_binding        (project [slot único F1], binding revision digest, estado de intent)
prj.connection_binding   (project, purpose, environment, connection ref, estado de intent)
```

### Opção B — tabela única com discriminador — **REJECT, com prova**

Não é rejeição por estética; a forma única perde nos três testes que o operador exigiu:

1. **Polimorfismo/nullable/json machinery.** As duas semânticas têm **chaves diferentes** (`project` vs `project × purpose × environment`) e **alvos diferentes** (digest content-addressed de artefato de Registry vs ID opaco de Connection operacional). Uma tabela única exige: coluna discriminadora + colunas nullable mutuamente exclusivas (`binding_digest` XOR `connection_id`/`purpose`/`environment`) com CHECKs, ou payload jsonb — ambas mais complexas que duas tabelas simples, e a unicidade correta (slot único do brain vs chave tripla da connection) vira constraint parcial condicionada ao discriminador.
2. **Apagamento das semânticas tipadas.** A pergunta "que intent esta linha representa?" deixa de ser respondida pela estrutura e passa a depender do discriminador — o passo inicial do `GenericProjectBinding` proibido.
3. **Economia inexistente.** Consumidores (compile, conformance, `SetProjectBinding` de 3D-03 §5.2, composição de Release) tratam os dois tipos por caminhos distintos de qualquer forma; a tabela única não economiza um conceito, só um `CREATE TABLE`.

### Regras acopladas (preservadas, agora nomeando as tabelas certas)

- Binding é **intent, nunca activation**: mudança não altera serving; só chega ao runtime via Release (3C-04). Nenhuma das duas tabelas guarda estado de serving — sem espelho (3E-01 §5).
- Validação semântica não mora no Project: Brain valida via `brn.binding_validation` (R1); Connections/Gateway/Release julgam eligibilidade da connection nas operações (3C-04).
- `prj.brain_binding.binding_digest` = pin content-addressed → **nunca FK** (3E-01 §4).
- `prj.connection_binding.connection_id → con.connection` permanece **Tier 3 — FK rejeitada** (reafirma R1 §7 com as tabelas novas): o alvo é autoridade operacional revogável revalidada em compile/conformance/Release gates (3D-01 §8, 3D-03 §5.2); FK daria falsa garantia de eligibilidade, acoplaria migrations `prj`↔`con` e não elimina failure class que os gates já não capturem.

---

## 3. Project Config Contract — forma durável mínima

Duas formas comparadas:

### Coluna-pin em `prj.project` (digest ativo) — REJECT

Perde a identidade de **revisão** que consumidores aprovados já exigem: `publish` é ato de authority com histórico ("mudança funcional no Config Contract pode tornar candidate/release anterior inadequado" — 3C-04; a mecânica stale/revalidation de 3G precisa comparar revisões, não só ler o digest mais recente), e C-014 pina `configContractDigest` por release — auditar qual revisão estava ativa quando exige linhas, não um UPDATE destrutivo em coluna.

### Record próprio append-only — **ADOTADA**

```text
prj.config_contract_revision
  → digest do contrato (conteúdo tipado autorado no repo do Project /
    compilado — bytes fora, git/CAS)
  → identidade de revisão + published_at + estado (qual revisão é a ativa)
```

Simetria exata com `prj.approved_baseline` (mesma estrutura de autoridade: conteúdo git-first + authority do Hub sobre qual revisão vale — 3B-08 aplicado por analogia). `resolveProjectConfigContract` = revisão ativa; `publishProjectConfigContract` = append + troca de ativa.

**Não é settings bag** (3C-04 anti-overengineering): o record guarda digest + metadata mínima de revisão; o shape tipado vive no conteúdo content-addressed; valores/material resolvidos por ambiente continuam fora do Project (Release/Connections/secret storage — 3C-04 §Config Contract). Nenhuma coluna de "valores".

---

## 4. Lado Connections — verificado, sem mudança

Contra o owns de C-007/3C-04: Connections owns identity, credential lifecycle, ConnectionRevision, qualification/testConnection, health. O inventário R1 (`con.connection` + `con.connection_revision`, qualification como estado na revision/connection, segredo só via `credential_backend`+`credential_ref` — guard note F3E02-R2 para 3I) **cobre as semânticas congeladas sem classe faltante nem genérica**. Nenhum Finding.

---

## 5. Inventário corrigido — prj (3 → **5**)

| Record | Razão de autoridade | Identidade |
|---|---|---|
| `project` | inalterada (R1) | id |
| `approved_baseline` | inalterada (R1) | digest |
| `brain_binding` | ProjectBrainBinding: intent aprovado pinando revisão `brain-binding/v1` por digest (3C-04, C-011, 3C-R1) | id + digest pinado |
| `connection_binding` | ProjectConnectionBinding: purpose × environment → Connection ref (3C-04, C-007, C-014) | id + ref opaco |
| `config_contract_revision` | authority do Project sobre digest/revisão do Config Contract; publish/resolve (3C-04, C-014) | digest, append-only |

A classe `prj.project_binding` da R1 está **retirada**.

### Total atualizado

```text
R1:    36 classes
R1.1:  41 classes  (iam 7 + ws 2)
R1.2:  43 classes  (prj 3 → 5; demais módulos inalterados)
```

---

## 6. Allowlist Tier-2 — **inalterada (13 FKs)**

Nenhuma FK nova: `brain_binding` pina digest (nunca FK); `connection_binding → con.connection` rejeitada nominalmente (§2); ambas as tabelas novas de binding e a de config contract são satelites intra-módulo de `prj.project` (FKs Tier 1). A lista de 13 da R1.1 §4 permanece exata.

---

## 7. O que este R1.2 NÃO muda

- iam/ws conforme R1.1; demais 10 módulos conforme R1.
- REJECT/DEFER da R1 §6 + R1.1 §2, com **um REJECT adicional**: tabela única de bindings com discriminador/jsonb (= `GenericProjectBinding` físico — §2).
- Classificação de identidade (R1 §5): `brain_binding`/`connection_binding` = opaque ID + pin/ref; `config_contract_revision` = digest append-only.
- Pins × espelhos, Gateway, substrate/ref-only, guard notes, verificações Mastra: inalterados — esta correção não depende de comportamento de framework.

---

## 8. Recomendação atualizada

3E-02 permanece **decidível diretamente**:

```text
inventário = 43 classes (piso fechado, teste de admissão R1 §3)
allowlist Tier-2 = 13 FKs (inalterada — R1.1 §4)
REJECT adicional: binding table única com discriminador
```

A decisão 3E-02 deve citar R1 + R1.1 + R1.2, com precedência R1.2 > R1.1 > R1 nos escopos respectivos.

---

*Fim de 3E-FABLE-R1.2. Review não-autoritativo; nenhuma implementação de produto é autorizada por este documento.*
