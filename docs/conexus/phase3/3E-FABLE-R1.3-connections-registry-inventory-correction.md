# 3E-FABLE-R1.3 — Connections/Registry Inventory Correction

**Status:** REVIEW / NÃO-AUTORITATIVO — correção focada de `3E-FABLE-R1-durable-record-inventory-review.md` (+ R1.1 + R1.2)  
**Fase:** 3E — Data Architecture, segunda rodada (target 3E-02)  
**Revisor:** Fable, sob direção do operador (Finding Connections/Registry, 2026-08-15)  
**Base revisada:** `34071068aebc37eb6bca646fc03c9ad9731acc26` (branch `agent/conexus-phase-3-system-design`, PR #40)  
**Importante:** não constitui C-018, não altera `LEDGER.md` nem decisões aprovadas, não autoriza implementação. Precedência entre reviews: **R1.3 > R1.2 > R1.1 > R1** nos escopos que cada correção cobre; todo o restante permanece como está.

---

## 1. Findings admitidos

### F3E02-R1.3a — `con.connection` ignorou o ownership scope fechado de 3C-07

A R1 descreveu `con.connection` com "workspace ref" e a R1.1 criou FK incondicional `con.connection.workspace_id → ws.workspace`. 3C-07 congela:

```text
um único conceito Connection
Connection.ownerScope = WORKSPACE | PROJECT
provider NÃO determina scope
WORKSPACE exige Workspace válido
PROJECT exige Project válido (e seu Workspace correspondente)
Project Connection privada; sibling reuse proibido
Workspace Connection exige ProjectConnectionBinding para consumo
sem WorkspaceConnection/ProjectConnection separadas (Alt B REJECT)
```

A forma da R1/R1.1 só representava o caso WORKSPACE.

### F3E02-R1.3b — qualification "na connection/revision" não sobrevive à identidade de 3C-07-A

A R1 (mantida pela R1.2 §4) rejeitou tabela standalone de qualification e colocou o estado "na revision/connection". Isso quebra em quatro fatos congelados:

```text
ConnectionRevision é IMUTÁVEL                      → estado mutável nela = contradição
várias revisions permanecem pinadas em paralelo    → um estado por connection não basta
qualification é repetível (requalify)              → overwrite destrói história
identidade semântica = ConnectionRevision
  + ConnectorDefinitionRevision
  + CredentialBinding/Grant Version
  + External Target                (3C-07-A)      → grant version muda SEM nova revision;
                                                     estado na revision não captura a dimensão
```

E 3C-07 é literal: fluxo termina em "Connections **records Qualification**"; o modelo mínimo aprovado lista `Qualification` como elemento próprio. **A rejeição da R1 está retirada** — hipótese do operador confirmada.

### F3E02-R1.3c — `reg.artifact` "por Project" contradiz o scope fechado de 3C-06

3C-06 congela **um** Registry com kind→scope fechado:

```text
integration                                → PLATFORM
brain                                      → WORKSPACE
query | action | job | agent | brain-binding → PROJECT
```

A R1 descreveu `reg.artifact` como "slug/kind por Project" — apagava PLATFORM e WORKSPACE.

---

## 2. Re-falsificação — forma física do Connection ownership

### Opção A — `owner_scope + refs condicionais com XOR` — **ADOTADA**

```text
con.connection
├── owner_scope   WORKSPACE | PROJECT
├── workspace_id  nullable, FK → ws.workspace(id)
├── project_id    nullable, FK → prj.project(id)
└── CHECK:  (owner_scope='WORKSPACE' AND workspace_id IS NOT NULL AND project_id IS NULL)
         OR (owner_scope='PROJECT'  AND project_id  IS NOT NULL AND workspace_id IS NULL)
```

Garante mecanicamente as cinco exigências: WORKSPACE⇒Workspace válido (FK real); PROJECT⇒Project válido (FK real; Workspace correspondente derivado por `prj.project.workspace_id`, sem cópia); provider não aparece na forma (scope é coluna de ownership, jamais derivada do connector); privacidade do PROJECT scope e exigência de binding para WORKSPACE são enforcement de operação/admission (3C-07), não de FK — a forma não as enfraquece.

### Alternativas mortas

```text
B. owner_scope + owner_id opaco único (sem FK)
   → perde integridade real (connection portadora de credential_ref
     órfã de dono = failure class direta), e owner_id polimórfico é o
     embrião do generic resource/scope engine rejeitado por 3C-07 Alt F

C. WorkspaceConnection / ProjectConnection separadas
   → REJECT literal de 3C-07 Alt B; inadmissível

D. workspace_id sempre NOT NULL + project_id condicional
   → workspace_id do caso PROJECT vira cópia denormalizada de
     prj.project.workspace_id (espelho de estado, 3E-01 §5) exigindo
     constraint composta para não divergir; mais machinery que o XOR
```

### Consistência com R1.1/R1.2 — por que XOR aqui SIM e lá NÃO

Critério único, agora explícito: **a forma física segue a ontologia congelada.** 3C-02/3C-04 congelam **conceitos concretos separados** (grants distintos; bindings distintos) → tabela por conceito; discriminador ali fundiria conceitos = generalização proibida. 3C-07/3C-06 congelam **UM conceito com união fechada de scope** (Alt B "duas classes" explicitamente REJECT) → discriminador é a forma fiel; duas tabelas aqui é que violariam a decisão. Sem contradição entre as correções.

---

## 3. Re-falsificação — Qualification como classe durável

### `con.connection_qualification` — **ADOTADA** (append-only)

```text
con.connection_qualification
├── connection ref            (Tier 1, intra)
├── connection_revision ref   (Tier 1, intra — pina ConnectorDefinitionRevision
│                              e External Target por construção, pois a revision
│                              imutável já os carrega)
├── credential grant version  (a dimensão que muda SEM nova revision — 3C-07-A;
│                              key_version criptográfica NUNCA entra)
├── resultado PASS | FAIL + evidence refs sanitizadas (digests/obs refs)
└── occurred_at
```

Identidade 4-tupla de 3C-07-A preservada sem duplicação: revision ref resolve ConnectorDefinitionRevision + Target; a linha adiciona grant version + tempo + resultado. Append-only: requalificações e qualifications de revisions/grants paralelos coexistem sem overwrite, sem mutar `ConnectionRevision`, sem segunda authority (resultado é fato histórico do próprio owner; elegibilidade atual é derivação/policy — 3G).

**Sem record por probe técnico**: `implementation probe count != domain workflow step count` (3C-07) — uma operação semântica de qualification = uma linha; as N probes físicas do Gateway são execução, evidência via refs.

**Health permanece projeção/current operational state** (sem classe nova): derivável de qualification records + sinais sanitizados de runtime (3C-07: qualification, requalificação explícita, sucessos/falhas observados); estado atual no próprio owner é permitido (3E-01 §5 — own-module current state, não espelho). `HEALTHY != ALLOW` intacto.

**Grant version não vira classe própria**: vive na relação de credencial da connection (`credential_backend` + `credential_ref` + versão de grant lógico); contrato exato do backend → 3I (guard note F3E02-R2 já roteado). Replace/revoke = transição do próprio owner; qualification rows pinam a versão provada.

---

## 4. Re-falsificação — `reg.artifact` com scope fechado

### Forma adotada

```text
reg.artifact
├── kind          (união fechada C-005/C-010/C-011: integration | brain |
│                  query | action | job | agent | brain-binding)
├── slug          (único por scope)
├── workspace_id  nullable, FK → ws.workspace(id)
├── project_id    nullable, FK → prj.project(id)
└── CHECK por kind (mapa fechado de 3C-06):
      kind = 'integration'                      → workspace_id NULL,     project_id NULL
      kind = 'brain'                            → workspace_id NOT NULL, project_id NULL
      kind ∈ {query,action,job,agent,brain-binding} → project_id NOT NULL, workspace_id NULL
```

`scopeType` não vira coluna independente decidível: é **função fechada do kind** (3C-06); armazená-la separada criaria par kind×scope inconsistente possível. O CHECK por kind é a representação mínima de `scopeType + scope identity`. Um único Registry (sem três registries — 3C-06 Alt B REJECT), sem `UniversalArtifactScope`/`allowedScopes` registry (Alt D REJECT), sem generic ownership framework.

### FKs de scope: Tier-2 SIM para WORKSPACE/PROJECT, nada para PLATFORM

Failure class declarada (mesma regra-âncora da R1.1 §4): entrada de registry é identidade longeva compilável/servível; órfã de dono = artefato resolvível fora de qualquer escopo de administração/purge. `RESTRICT` bloqueia purge do owner enquanto identidades de registry existirem — coerente com archive-before-purge e com as FKs já aprovadas de `att`/`rel`/`bld`. PLATFORM: **sem FK artificial** — não existe (nem nasce) tabela de "Platform owner"; scope PLATFORM = ambas refs NULL por CHECK. Refs de consumo entre módulos continuam por digest (Tier 3), inalteradas.

`reg.artifact_revision`: forma da R1 preservada (imutável, digest, payload no CAS); FK para `reg.artifact` é Tier 1.

---

## 5. Inventário atualizado

### con — Connections (2 → **3**)

| Record | Razão de autoridade | Identidade |
|---|---|---|
| `connection` | conceito único com `owner_scope WORKSPACE\|PROJECT` + XOR refs (§2); credential relation opaca com grant version | id |
| `connection_revision` | inalterada (R1) — imutável; pina ConnectorDefinitionRevision + target/environment + config não secreta | id imutável |
| `connection_qualification` | **nova** — registro append-only da qualification com identidade 3C-07-A (§3) | id, append-only + grant version |

### reg — Artifact Registry (2, forma corrigida)

| Record | Razão de autoridade | Identidade |
|---|---|---|
| `artifact` | identidade slug/kind com **scope fechado por kind** (§4) — não mais "por Project" | id + scope refs condicionais |
| `artifact_revision` | inalterada (R1) | digest |

### Total atualizado

```text
R1:    36 classes
R1.1:  41 classes
R1.2:  43 classes
R1.3:  44 classes  (con 2 → 3; reg conta igual, forma corrigida)
```

---

## 6. Classificação de identidade — deltas

```text
OPAQUE ID          + connection_qualification (append-only)
GENERATION-LIKE    + credential grant version (versão do grant lógico na
                     relação de credencial da connection; ≠ key_version
                     criptográfica, que NUNCA aparece no domínio)
FK CONDICIONAL     con.connection e reg.artifact: refs de scope nullable
                     governadas por CHECK de união fechada
```

Demais classificações da R1 §5 (+R1.1/R1.2) inalteradas.

---

## 7. REJECT / DEFER — deltas

**Retirado da R1 §6:** `tabela standalone de qualification → REJECT` (revertido pelo §3; a linha correta agora é a classe `connection_qualification`).

**REJECTs adicionados:**

```text
WorkspaceConnection / ProjectConnection como classes/tabelas   (3C-07 Alt B)
qualification como estado mutável em connection/revision       (§1-b; overwrite
                                                                destrói história e
                                                                dimensão de grant)
record por probe técnico de qualification                      (3C-07: probe count
                                                                != domain steps)
três registries por scope                                      (3C-06 Alt B)
coluna scopeType independente do kind no reg.artifact          (§4; par inconsistente)
owner_id polimórfico sem FK para scope de Connection/artifact  (§2 Opção B)
generic resource/scope engine, scope inheritance,
  scope transfer/move                                          (3C-07 Alt F; 3C-06 Alt D)
```

DEFERs da R1/R1.1/R1.2 inalterados.

---

## 8. Allowlist Tier-2 v3 — **16 FKs** (renumerada, substitui R1.1 §4)

A antiga #8 (`con.connection.workspace_id` incondicional) é substituída pelo par condicional; entram as duas FKs de scope do `reg.artifact`. Regra-âncora mantida: **linha de autoridade/identidade longeva nunca pendura em estrutura fantasma; ausência continua sendo o default.**

| # | FK | Failure class |
|---|---|---|
| 1 | `iam.workspace_membership.workspace_id → ws.workspace(id)` | R1.1 — inalterada |
| 2 | `iam.area_membership.area_id → ws.area(id)` | R1.1 — inalterada |
| 3 | `iam.area_project_grant.area_id → ws.area(id)` | R1.1 — inalterada |
| 4 | `iam.area_project_grant.project_id → prj.project(id)` | R1.1 — inalterada |
| 5 | `iam.account_project_grant.project_id → prj.project(id)` | R1.1 — inalterada |
| 6 | `iam.published_app_access.project_id → prj.project(id)` | R1.1 — inalterada |
| 7 | `prj.project.workspace_id → ws.workspace(id)` | R1.1 — inalterada |
| 8 | `con.connection.workspace_id → ws.workspace(id)` *(nullable; ownerScope=WORKSPACE)* | Workspace Connection portadora de credential_ref órfã de tenant |
| 9 | `con.connection.project_id → prj.project(id)` *(nullable; ownerScope=PROJECT)* | Project Connection privada órfã de dono = superfície de credencial sem escopo de administração/purge |
| 10 | `reg.artifact.workspace_id → ws.workspace(id)` *(nullable; kind=brain)* | identidade de Brain artifact órfã de Workspace = conhecimento compilável fora de qualquer tenant |
| 11 | `reg.artifact.project_id → prj.project(id)` *(nullable; kinds PROJECT)* | identidade de artifact órfã de Project = artefato resolvível/servível sem dono; RESTRICT protege archive-before-purge |
| 12 | `bld.change.project_id → prj.project(id)` | R1.1 — inalterada |
| 13 | `rel.release.project_id → prj.project(id)` | R1.1 — inalterada |
| 14 | `rel.active_pointer.project_id → prj.project(id)` | R1.1 — inalterada |
| 15 | `mar.serving_route.project_id → prj.project(id)` | R1.1 — inalterada |
| 16 | `att.attachment.project_id → prj.project(id)` | R1.1 — inalterada |

Condições 3E-01 §4 valem para todas; FKs condicionais participam dos CHECKs de união fechada (§2/§4). PLATFORM sem FK. Rejeições nominais anteriores (R1 §7 + R1.2 §2) permanecem; `con.connection_qualification → connection/revision` são Tier 1.

---

## 9. Mini-varredura final — consistência R1.1/R1.2

```text
critério discriminador × tabelas separadas   → único e explícito (§2):
  conceito único com união fechada (3C-07/3C-06)  → discriminador fiel
  conceitos concretos separados (3C-02/3C-04)     → tabela por conceito
  R1.1 (grants separados) e R1.2 (bindings separados) intactos ✓

prj.connection_binding (R1.2)                → alvo continua sendo Connection
  por ref opaco; a mudança de forma da connection não afeta o binding;
  rejeição da FK binding→connection permanece válida ✓

brn.binding_validation / prj.brain_binding   → não tocados; brain artifact
  agora corretamente WORKSPACE-scoped no reg.artifact, coerente com C-011
  (fonte git de escopo GRUPO) ✓

gw admission                                 → consome eligibility via projeção
  de Connections (3D-02); qualification como classe própria não muda a
  boundary nem cria leitura cross-schema ✓

espelhos (3E-01 §5)                          → nenhum novo: workspace do caso
  PROJECT é derivado, não copiado (§2-D rejeitada); health segue derivável ✓

R1 §8/§9/§10 (pins, Gateway, substrate)      → inalterados ✓
guard notes F3E02-R1/R2                      → inalterados; grant version
  reforça a fronteira do CredentialBackend já roteada a 3I ✓
```

Nenhuma contradição residual encontrada.

---

## 10. Recomendação atualizada

3E-02 permanece **decidível diretamente**:

```text
inventário = 44 classes (piso fechado, teste de admissão R1 §3)
allowlist Tier-2 = 16 FKs (tabela única v3 do §8 substitui as anteriores)
REJECT/DEFER conforme R1 §6 + R1.1 §2 + R1.2 §7 + §7 deste doc
```

A decisão 3E-02 deve citar R1 + R1.1 + R1.2 + R1.3, com precedência R1.3 > R1.2 > R1.1 > R1 nos escopos respectivos.

---

*Fim de 3E-FABLE-R1.3. Review não-autoritativo; nenhuma implementação de produto é autorizada por este documento.*
