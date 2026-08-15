# 3E-FABLE-R1.1 — IAM/Workspace Inventory Correction

**Status:** REVIEW / NÃO-AUTORITATIVO — correção focada de `3E-FABLE-R1-durable-record-inventory-review.md`  
**Fase:** 3E — Data Architecture, segunda rodada (target 3E-02)  
**Revisor:** Fable, sob direção do operador (Finding IAM/Workspace, 2026-08-15)  
**Base revisada:** `c5626dff8b3656e3044b6fbfe782f8b1a5505f0a` (branch `agent/conexus-phase-3-system-design`, PR #40)  
**Importante:** não constitui C-018, não altera `LEDGER.md` nem decisões aprovadas, não autoriza implementação. Onde este R1.1 diverge da R1, **R1.1 prevalece**; todo o restante da R1 permanece como está.

---

## 1. Finding admitido — R1 contradisse autoridade congelada

**F3E02-R1.1 — CONFIRMADO.** A R1 §4 listou apenas `iam.account`, `iam.session`, `iam.project_membership` e `ws.workspace`, e chegou a colocar em DEFER "membership/grants de nível workspace". Isso contradiz autoridade F1 já aprovada:

```text
3C-02 (owns, F1):
  WorkspaceMembership
  AreaMembership
  Area → Project grants
  Account → Project grants
  Published App access relationships
  role assignments
  effective access resolution por superfície

3C-03 (owns, F1):
  Workspace + Area (Area = estado do Workspace, não módulo)

3B-14 / 3C-02:
  CONTROL_PLANE, PREVIEW e PUBLISHED_APP são contextos independentes
  sobre a MESMA Account
```

Dois defeitos distintos na R1:

1. **YAGNI aplicado contra ownership congelado.** DEFER só cabe onde a autoridade não decidiu; 3C-02 decidiu. O DEFER "membership/grants de nível workspace" está **retirado**.
2. **Conflação de superfícies.** O `iam.project_membership` da R1 fundia dois fatos de autoridade diferentes: o **Account → Project grant do CONTROL_PLANE** (3B-10..13, roles de controle como `PROJECT_ADMIN`/`PROJECT_CONTRIBUTOR`) e a **relação de acesso do PUBLISHED_APP** (C-015: conta × projeto → role fechada `{admin, member}` do app). 3C-02 invariante 8 proíbe exatamente essa fusão: `Project Control roles não implicam Published App roles e vice-versa`. O nome `ProjectMembership` em C-015 refere-se à relação do **app publicado**; a R1 o tratou como o grant de controle.

Correção executada abaixo com o mesmo teste guilty-until-justified da R1 §3, restrito a IAM + Workspace.

---

## 2. Modelagens mínimas comparadas

Semânticas a preservar (todas F1, todas com consumidor atual — resolução de acesso deny-by-absence em toda superfície, checkpoints humanos do Builder, gates de Release, serving do app publicado):

```text
R1. Account ↔ Workspace membership          (+ role do scope)
R2. Account ↔ Area membership               (+ papel organizacional aplicável)
R3. Area    → Project grant                 (+ role do scope)
R4. Account → Project grant                 (+ role do scope)
R5. Account ↔ Published App access          (role fechada do app — C-015)
```

### Opção A — um record class por classe de relação aprovada — **ADOTADA**

```text
iam.workspace_membership     (account, workspace, role)
iam.area_membership          (account, area, papel organizacional)
iam.area_project_grant       (area, project, role)
iam.account_project_grant    (account, project, role)
iam.published_app_access     (account, project, app role)
```

Mapeia 1:1 as cinco classes congeladas em 3C-02; zero polimorfismo; cada tabela tem FK real para sujeito e objeto; a pergunta "que autoridade esta linha representa?" é respondida pelo nome da tabela. Resolução efetiva = união das relações aditivas concretas (3C-02), igual em qualquer opção.

### Opção B — tabela genérica `grant(subject_kind, relation, object_kind)` — **REJECT**

É literalmente o `grant(subject, relation, object)` que 3C-02 proíbe como API e o generic relationship graph proibido pelo handoff/3C-02 invariante 15. Nem entra em comparação de custo.

### Opção C — fundir R3+R4 em `iam.project_grant` com `grantee_kind {ACCOUNT|AREA}` — **REJECT**

Economiza uma tabela, mas: introduz coluna polimórfica com XOR check (duas FKs nullable), é o primeiro passo estrutural na direção do graph genérico rejeitado, e não economiza nenhum conceito — a resolução continua tratando os dois ramos separadamente. Menor complexidade real é A, não C: contagem de tabelas não é a métrica; polimorfismo é custo.

### Não nasce junto

```text
iam.role_assignment separada   → REJECT: role sets são fechados por
                                 superfície/scope (3B-13, C-015); a role
                                 viaja NA própria linha da relação;
                                 tabela separada = custom-role machinery
                                 proibida por 3C-02

árvore de membership de PREVIEW → REJECT: 3C-02 invariante 7 — Preview =
                                 authority do Control Plane + permission/
                                 precondition específica; ZERO records novos

sessão por superfície           → REJECT: uma Account, um mecanismo de
                                 sessão (C-015); a superfície é resolvida
                                 na resolução de access context (3B-14),
                                 não em tabelas de sessão paralelas
```

---

## 3. Inventário corrigido — iam e ws

### iam — Identity & Access (3 → **7**)

| Record | Razão de autoridade | Identidade |
|---|---|---|
| `account` | inalterada (R1) | id |
| `session` | inalterada (R1); única classe de sessão para todas as superfícies | id (hash) |
| `workspace_membership` | Account ↔ Workspace + role do scope; deny-by-absence no tenant (3C-02, 3B-10) | id |
| `area_membership` | Account ↔ Area + papel organizacional (3C-02, 3B-11/3B-12) | id |
| `area_project_grant` | Area → Project + role; acesso organizacional a software (3C-02, 3B-10) | id |
| `account_project_grant` | Account → Project + role de CONTROL_PLANE (3C-02) — **não é** a relação do app | id |
| `published_app_access` | Account ↔ Project no contexto PUBLISHED_APP, role fechada `{admin, member}` (C-015; o "ProjectMembership" de C-015 é ESTA classe) | id |

Nota de conflação resolvida: `account_project_grant` e `published_app_access` são fatos de autoridade independentes sobre a mesma Account (3B-14); nenhum implica o outro (3C-02 inv. 8); nomes finais → implementação, semântica congelada aqui.

### ws — Workspace (1 → **2**)

| Record | Razão de autoridade | Identidade |
|---|---|---|
| `workspace` | inalterada (R1) | id |
| `area` | estrutura organizacional owned pelo Workspace; Area ≠ módulo, Area ≠ software (3C-03, 3B-11); opcional por tenant = zero rows, não zero tabela | id |

`ws.area.workspace_id → ws.workspace` é FK **Tier 1** (intra-módulo).

### Total atualizado

```text
R1:   36 classes  (iam 3 + ws 1 = 4)
R1.1: 41 classes  (iam 7 + ws 2 = 9; demais 11 módulos inalterados)
```

---

## 4. Allowlist Tier-2 atualizada — 8 → **13** FKs

A entrada #1 da R1 (`iam.project_membership → prj.project`) é **substituída** pelas seis abaixo; as demais sete da R1 permanecem inalteradas e renumeradas. Regra derivada que fecha a lista com princípio, não conveniência:

> **Toda linha de relação de autoridade do I&A ancora por FK Tier-2 na identidade estrutural que ela alcança/representa. Linha de autoridade nunca fica pendurada em estrutura fantasma.**

| # | FK | Failure class concreta |
|---|---|---|
| 1 | `iam.workspace_membership.workspace_id → ws.workspace(id)` | membership órfã de tenant = acesso latente a workspace reciclado |
| 2 | `iam.area_membership.area_id → ws.area(id)` | membership em área inexistente = relação inauditável |
| 3 | `iam.area_project_grant.area_id → ws.area(id)` | grant cujo SUJEITO é área fantasma = autoridade sem dono |
| 4 | `iam.area_project_grant.project_id → prj.project(id)` | grant cujo OBJETO é projeto fantasma |
| 5 | `iam.account_project_grant.project_id → prj.project(id)` | grant de controle órfão = autorização latente contra projeto reciclado |
| 6 | `iam.published_app_access.project_id → prj.project(id)` | acesso de app publicado órfão de projeto |
| 7 | `prj.project.workspace_id → ws.workspace(id)` | inalterada (R1 #2) |
| 8 | `con.connection.workspace_id → ws.workspace(id)` | inalterada (R1 #3) |
| 9 | `bld.change.project_id → prj.project(id)` | inalterada (R1 #4) |
| 10 | `rel.release.project_id → prj.project(id)` | inalterada (R1 #5) |
| 11 | `rel.active_pointer.project_id → prj.project(id)` | inalterada (R1 #6) |
| 12 | `mar.serving_route.project_id → prj.project(id)` | inalterada (R1 #7) |
| 13 | `att.attachment.project_id → prj.project(id)` | inalterada (R1 #8) |

Condições de 3E-01 §4 valem para todas (PK estável, `RESTRICT/NO ACTION`, nunca CASCADE/SET NULL, sem authority nem acesso cross-schema por consequência). FKs de `account_id`/`session` → `iam.account` são Tier 1 (intra-módulo) e não entram na allowlist.

As rejeições nominais da R1 §7 permanecem, com a referência de renumeração: purge de projeto agora é bloqueado pelas FKs 4/5/6/9/10/11/12/13.

---

## 5. O que este R1.1 NÃO muda

- Restante do inventário da R1 §4 (11 módulos): inalterado — nenhum Finding novo.
- REJECT/DEFER da R1 §6: inalterados, **exceto**: (a) retirada a linha DEFER "iam membership/grants de nível workspace"; (b) adicionados os três REJECTs do §2 deste doc (role_assignment separada; Preview membership tree; sessão por superfície).
- Classificação de identidade R1 §5: as cinco classes novas de relação + `ws.area` entram como opaque IDs; nada mais muda.
- Pins × espelhos (R1 §8), Gateway (R1 §9), substrate/ref-only (R1 §10), guard notes (R1 §11): inalterados.
- Verificações Mastra da R1 §2: não afetadas — esta correção não depende de comportamento de framework.

---

## 6. Recomendação atualizada

3E-02 permanece **decidível diretamente**, agora com:

```text
inventário = 41 classes (piso fechado, teste de admissão da R1 §3)
allowlist Tier-2 = 13 FKs (lista fechada, emenda só via Decision Loop)
REJECT adicionais do §2 incorporados
```

A decisão 3E-02 deve citar R1 + R1.1, com R1.1 prevalecendo no escopo IAM/Workspace.

---

*Fim de 3E-FABLE-R1.1. Review não-autoritativo; nenhuma implementação de produto é autorizada por este documento.*
