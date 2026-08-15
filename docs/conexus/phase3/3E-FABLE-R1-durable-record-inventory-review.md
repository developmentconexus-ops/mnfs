# 3E-FABLE-R1 — Durable Record Inventory & Reference Closure Review

**Status:** REVIEW / NÃO-AUTORITATIVO  
**Fase:** 3E — Data Architecture, segunda rodada (target 3E-02)  
**Revisor:** Fable (independent Senior/Staff/Principal review, per `3E-02-FABLE-DURABLE-RECORD-INVENTORY-HANDOFF.md`)  
**Base revisada:** `14b6450a39b01634757e8bfc17a391ff75f5055c` (branch `agent/conexus-phase-3-system-design`, PR #40)  
**Importante:** não constitui C-018, não altera `LEDGER.md` nem decisões aprovadas, não autoriza implementação. A decisão 3E-02 é ato do operador sobre este parecer.

---

## 1. Verdict

# **3E-02 PODE SER DECIDIDA DIRETAMENTE**

O inventário mínimo fecha em **36 classes de record duráveis em 13 schemas** (§4), com lista fechada de **8 FKs Tier-2** (§7), lista explícita de REJECT/DEFER (§6) e nenhuma contradição contra 3E-01, C-006, 3C ou 3D. Dois guard notes (§11) acompanham a decisão sem exigir rodada de correção.

Postura recomendada para a decisão: o inventário é **piso fechado** — classe nova de record durável entra pelo mesmo teste de admissão (owner nomeado + consumidor/invariante atual), registrada em decisão/review, nunca por migration de conveniência; a lista REJECT só reabre com failure class nomeada.

---

## 2. Método e fontes

Autoridade reconstruída: `AGENTS.md` → `LEDGER.md` → `3E-01-hub-control-data-ownership-persistence-boundaries.md` (autoridade direta) → 3D-01..3D-R1 → 3C-02..3C-15 → 3A-R5 → C-005..C-017.

Disciplina aplicada conforme handoff: **todo record proposto nasce culpado**; só sobrevive com owner + consumidor/invariante da autoridade aprovada. Projeção derivável, cache, telemetry e espelho de current-state foram removidos do inventário e listados no §6.

### Verificação Mastra (obrigatória para afirmações de comportamento atual)

A skill de Mastra citada no handoff **não existe neste ambiente** — `ListSkills`/`SearchSkills` retornam vazio para "mastra" (re-verificado nesta rodada). Fato registrado conforme instruído; a verificação usou **Context7** (`/mastra-ai/mastra`, source reputation High, docs + source atuais):

```text
F-M1  storage domain `memory` persiste threads, messages e resources
      (working memory thread-scoped e resource-scoped) no storage do substrate

F-M2  storage domain `workflows` persiste run snapshots para suspend/resume
      (persistWorkflowSnapshot/loadWorkflowSnapshot por runId);
      existe também domain `workflowDefinitions` que persiste
      DEFINIÇÕES dinâmicas de workflow → guard note §11.1

F-M3  schedules são PERSISTIDOS no storage do substrate ("stored with the
      schedule row"), sobrevivem restart/redeploy, CRUD via
      mastra.schedules, com id estável opcional (`agent_<slug>`)
```

Consequência direta: conteúdo de conversa, checkpoints de workflow e rows de schedule vivem em `mastra_par`/`mastra_builder` (3E-01 §10); as tabelas Conexus correspondentes guardam **identidade, policy, pins e refs de correlação** — nunca cópia do conteúdo do substrate (3C-10: "Mastra internal state não deve ser copiado campo a campo").

---

## 3. Regra de admissão aplicada

Cada classe abaixo sobreviveu a este teste:

```text
1. owner único de 3C nomeado?
2. consumidor/invariante ATUAL da autoridade aprovada exige durabilidade?
3. não é derivável de outra fonte autoritativa (projeção)?
4. não é espelho de current-state de outro owner (3E-01 §5)?
5. não é estado interno de substrate (mastra_* / E2B / CAS bytes)?
```

Falhou em qualquer item → §6 (REJECT/DEFER).

---

## 4. Inventário mínimo — módulo → record class → razão de autoridade

Nomes são semânticos (colunas/DDL → implementação; FSMs → 3G). Identidade: `id` = opaque ID; `digest` = content-addressed; `gen` = generation/CAS; `rref` = provider/runtime ref (correlação apenas).

### iam — Identity & Access (3)

| Record | Razão de autoridade | Identidade |
|---|---|---|
| `account` | conta estável, credencial Argon2id versionada, enable/disable, auth_version (C-015) | id |
| `session` | sessão server-side, só hash, idle+absolute expiry, revogação total em disable/reset (C-015) | id (hash armazenado) |
| `project_membership` | conta × projeto → role; membership checada ANTES de role; ausência = 404 (C-015) | id |

### ws — Workspace (1)

| Record | Razão | Identidade |
|---|---|---|
| `workspace` | tenant/structural root; escopo de Connections e Projects (3C-03, 3C-R1) | id |

### prj — Project (3)

| Record | Razão | Identidade |
|---|---|---|
| `project` | identidade, workspace ref, `runtimeProfile MANAGED\|DEDICATED`, lifecycle (active/archived), estado de associação Git (3C-04, 3C-12, 3D-04 §5.3) | id |
| `project_binding` | approved binding intent por consumer/environment (3C-R1: Project approved intent; 3D-03 §5.2) — intent, nunca autoridade de serving | id + refs opacos |
| `approved_baseline` | pin append-only do Baseline aprovado (3B-16; 3D-01 §9 `approvedBaselineDigest`) | digest |

### bld — Builder (8)

| Record | Razão | Identidade |
|---|---|---|
| `change` | boundary pública/durável da evolução de software; pina contract revision ATIVA; rigor floor; closure (C-017, 3A-R5) | id |
| `contract_revision` | revisões imutáveis do correctness contract; revisão semântica ⇒ STALE/HANDOFF (C-017) | digest |
| `plan_revision` | plano aprovado pinado por digest quando planning depth exigir (HAR-7/C-017; DIRECT\|LIGHT\|FULL) | digest |
| `work_unit` | unidade bounded; default 1 por Change (C-017, 3A-R5) | id |
| `actor_run` | tentativa/episódio auditável; runtime kind/version + run ref; budgets/outcome (C-017, 3A-R5) | id + rref |
| `coding_session` | identidade CS-`Change`; atravessa WUs/ActorRuns; thread ref do substrate (3A-R5 §3, probe item 1) | id + rref |
| `finding` | projeção operacional autoritativa de Finding: fingerprint canônico, transições CAS, parent ref, roteamento (C-017; current-state é do Builder — 3C-13 §4) | id + gen |
| `change_acceptance` | registro imutável do aceite: matriz assertion×verdict completa por digest, evidence refs, snapshot de política — input de `ComposeRelease` (C-017; 3D-01 §5) | digest |

### reg — Artifact Registry (2)

| Record | Razão | Identidade |
|---|---|---|
| `artifact` | identidade slug/kind por Project (C-005: slug = nome, registry único de kinds) | id |
| `artifact_revision` | revisão imutável: digest, payload ref no CAS, contrato/classification (effects, approvalFloor, agentEligible, idempotency), directReads/Writes declarados, estado AVAILABLE (C-005, C-010, C-013) | digest |

### con — Connections (2)

| Record | Razão | Identidade |
|---|---|---|
| `connection` | objeto operacional: workspace ref, target/environment, `credential_backend`+`credential_ref` opacos, estado (C-007) | id |
| `connection_revision` | revisão imutável pinada por projeto/ambiente; **estado de qualification vive aqui/na connection** — sem tabela standalone de qualification (C-007; eventos → obs) | id imutável |

Material de segredo **não** é record `con.*`: custody é do `CredentialBackend` (infra boundary 3D-04 §6); realização física → guard note §11.2.

### gw — Capability Gateway (3 — congeladas por 3E-01 §8, confirmadas sem expansão)

| Record | Razão | Identidade |
|---|---|---|
| `effect_attempt` | persist-before-effect: pins exatos admitidos, approval ref, traffic/outcome/receipt linkage (3D-02 §9–10) | id + digests pinados |
| `idempotency_claim` | claim durável UNIQUE por escopo, vinculado à attempt (3D-02 §10) | id + chave de escopo |
| `budget_counter` | enforcement durável só nas classes C-016 (EXTERNAL_EFFECT, EXPORT, WRITE_LOCAL com approvalFloor>NONE); família única — contadores de rate limit duráveis NÃO viram tabela separada | id + gen |

Confirmações adversariais: receipt = linkage/digest na attempt, não classe própria; reads sem ledger (3D-02 §12); DENY comum não vira row de ledger (audit/telemetry quando material).

### brn — Brain (3)

| Record | Razão | Identidade |
|---|---|---|
| `knowledge_proposal` | retroalimentação com gate humano, NO AUTO MERGE, anti-MINJA (C-011) | id |
| `health` | observações de health append-only + reducer versionado; runtime respeita 5 estados; **current health = projeção derivada/reconstruível**, nunca autoridade própria (C-011) | id, append-only |
| `binding_validation` | prova imutável de conformidade por binding revision (C-011 ProjectBrainBinding; 3C-R1 specialized validation) | digest |

BrainDefinition/BrainPack **não** são tabelas `brn.*`: git + registry/CAS; `brn.*` só referencia por digest.

### par — Production Agent Runtime (4)

| Record | Razão | Identidade |
|---|---|---|
| `conversation` | identidade canônica Conexus + policy/escopo; conteúdo (threads/messages) fica no substrate por F-M1; `Conversation != provider session` (C-010, 3C-10) | id + rref (thread) |
| `agent_run` | run com composição pinada (Release/manifest digest), trigger/conversation ref, runtime kind/version + run ref, lifecycle alto nível; checkpoint payload fica no substrate por F-M2 (3C-10; 3D-02 AGENT_RUN) | id + digests + rref |
| `approval_request` | autoridade Conexus de approval: AWAITING_APPROVAL durável, hash total do envelope exato (cifrado), campos de claim single-use (C-010; 3E-01 §9) | id + digest (envelope) |
| `agent_trigger` | SCHEDULE operacional F1 (`EVENT` reserved — 3C-R1); autoridade de existência/enable/disable é Conexus; a schedule row do Mastra é mechanics (F-M3), correlacionada por id estável; **automation state F1 (cursor/last_run_at) vive aqui** — nunca escondido em LLM memory (3C-10) | id + rref (schedule) |

### rel — Release (3)

| Record | Razão | Identidade |
|---|---|---|
| `release` | identidade + pin do ReleaseManifest digest + estado de candidate (C-014; conteúdo do manifest no CAS) | id + digest |
| `promotion` | PromotionRecord append-only; evidence refs do gate (incl. permission diff C-015 e dependency diff C-016); steps = eventos obs por promotionId (C-014) | id, append-only |
| `active_pointer` | (project, environment) → manifest digest + generation; CAS com expectedGeneration (C-014) | gen |

EnvironmentConformance **não** vira tabela standalone: resultado acompanha a promotion + evidência obs; DRIFT⇒STOP é comportamento (3G). Ledger de migrations aplicadas vive no database alvo (padrão do runner), não em `rel.*`.

### mar — Managed Application Runtime (2)

| Record | Razão | Identidade |
|---|---|---|
| `serving_route` | route→Project/environment, estado operacional; **sem espelho de Release ativa** (3E-01 §11; F3D04-R1) | id |
| `job_run` | lifecycle operacional job/v1: dispatch/lease/timeout/retry/status/stop, version-locked à revisão que iniciou (3C-15 §7; kind `job` é F1 em C-005) | id + digest pinado |

Queue/scheduler substrate permanece seam interno não-selecionado (3D-04 §6); o **record** de run é autoridade MAR, o mecanismo de fila não é decidido aqui.

### obs — Observability & Audit (2 + derivadas)

| Record | Razão | Identidade |
|---|---|---|
| `audit_record` | histórico durável append-only, fail-closed quando audit-required (3C-13; 3E-01 §6 Classe 2), FORA do GC (C-013) | id, append-only |
| `operational_event` | evento operacional platform-wide: hot fields + payload, dedup de ingestão (producer_instance_id+producer_event_id+source_seq), producer_trust, parent ref, retenção/GC (C-013, 3C-13) | id + chave de dedup |

Projeções derivadas (lineage edges, timeline, custo) são reconstruíveis e não-autoritativas; podem materializar sem virar classe de autoridade.

### att — Attachments (2)

| Record | Razão | Identidade |
|---|---|---|
| `attachment` | autoridade inteira do attachment: project association, estado PENDING→AVAILABLE por CAS, acesso só por id opaco (C-015) | id + gen |
| `blob` | registro do blob CAS: digest SHA-256, size, state, refcount, generation — mesmo database para transação ACID única com attachment (C-015) | digest + gen |

**Total: 36 classes.** Qualquer record durável fora desta lista não existe no F1 sem passar pelo teste de admissão do §3.

---

## 5. Classificação de identidade/ref (Q3)

```text
OPAQUE ID (autoridade de existência no owner)
  account, session, membership, workspace, project, binding, change,
  work_unit, actor_run, coding_session, finding, artifact, connection,
  connection_revision, proposal, conversation, agent_run, approval_request,
  agent_trigger, release, promotion, serving_route, job_run, attachment,
  audit_record, operational_event

CONTENT-ADDRESSED DIGEST (imutável; viaja/pina; NUNCA FK)
  artifact_revision digest, compiled payload ref, ReleaseManifest digest,
  frontend dist digest, BrainPack/binding digests, contract_revision digest,
  plan_revision digest, approved_baseline digest, change_acceptance digest,
  envelope hash da approval, receipt digest, blob digest, evidence digests

GENERATION / CAS (concorrência otimista do próprio owner)
  rel.active_pointer generation, att.blob/attachment generation (GC 2 fases),
  bld.finding transitions, gw.budget_counter

PROVIDER / RUNTIME REF (correlação apenas; nunca autoridade, nunca FK)
  Mastra thread/run/workflow-snapshot/schedule ids (F-M1..F-M3),
  E2B sandbox ids, provider message ids, OTel trace/span ids
```

---

## 6. REJECT / DEFER — o que NÃO vira tabela autoritativa (Q4)

### REJECT (existir como autoridade contradiz decisão aprovada)

```text
ReleaseRecord como tabela           → projeção (C-014)
tabela de Evidence                  → Evidence é composição de refs (3B-16/C-017)
rollups de custo/usage              → GROUP BY derivado (C-013)
lineage edges como autoridade       → derivado/reconstruível (C-013)
current health materializado como
  autoridade                        → deriva de brn.health + reducer (C-011)
tabela standalone de qualification  → estado na connection/revision (C-007)
tabela standalone de
  EnvironmentConformance            → acompanha promotion + obs (C-014)
tabela de checklist/tasks duplicada → plan/work_unit são a autoridade;
                                      tasks.md = memória de propósito (C-013)
conteúdo de thread/message em par.* → substrate, F-M1 (3C-10)
checkpoint/snapshot de workflow em
  par.*                             → substrate, F-M2 (3C-10)
schedule mechanics em par.*         → substrate, F-M3; par.agent_trigger é
                                      a autoridade de existência/enable
tabelas de agent memory em par.*    → substrate; policy/escopo no domínio
espelho campo a campo de estado
  Mastra                            → proibido (3C-10)
ledger durável de reads / DENY      → reads leves (3D-02 §12)
rate-limit READ_* durável           → memória (C-016)
tabela de preços de modelo          → preço pinado por versão git (C-013)
event store / UniversalActivity     → proibidos (3C-13, guardrails)
```

### DEFER (gatilho nomeado; não criar agora)

```text
iam membership/grants de nível workspace   → primeiro consumidor real
                                             (F1: operador + membership por projeto)
ingress/dedup store de AgentTrigger EVENT  → ativação de EVENT (guard note 3D-R1)
classe genérica par.automation_state       → primeiro consumidor além do cursor
                                             do trigger (F1 vive no agent_trigger)
mar.job_schedule                           → primeiro job recorrente real (3C-15 §7)
tabelas de dependency catalog/proposal     → F1: catálogo = artefato git pinado;
                                             DEPENDENCY_PROPOSAL = evidência do
                                             gate de promotion + audit (C-016)
storage físico do CredentialBackend        → 3I (guard note §11.2)
particionamento/GIN/warehouse de obs       → gatilhos medidos (C-013)
```

---

## 7. Lista fechada de FKs Tier-2 (Q5)

Regras de 3E-01 §4 aplicadas: alvo = PK pública/estável; `ON DELETE RESTRICT/NO ACTION`; nunca CASCADE/SET NULL; constraint não concede authority nem acesso cross-schema. **Ausência é o default** — cada entrada abaixo tem failure class de integridade concreta.

### Allowlist F1 — exatamente 8

| # | FK | Failure class concreta que elimina |
|---|---|---|
| 1 | `iam.project_membership.project_id → prj.project(id)` | membership órfã = autorização latente contra projeto fantasma/reciclado; RESTRICT bloqueia purge com membership viva |
| 2 | `prj.project.workspace_id → ws.workspace(id)` | projeto sem tenant root quebra a derivação de escopo (membership antes de role — C-015) |
| 3 | `con.connection.workspace_id → ws.workspace(id)` | connection portadora de `credential_ref` órfã de tenant = superfície de credencial sem dono |
| 4 | `bld.change.project_id → prj.project(id)` | work graph/história de engenharia ancorada a projeto real; purge bloqueado enquanto Changes existirem |
| 5 | `rel.release.project_id → prj.project(id)` | composição servível órfã de projeto |
| 6 | `rel.active_pointer.project_id → prj.project(id)` | ponteiro ativo apontando para projeto inexistente = serving fantasma |
| 7 | `mar.serving_route.project_id → prj.project(id)` | rota inroteável / entrada de serving órfã (F3D04-R1) |
| 8 | `att.attachment.project_id → prj.project(id)` | autoridade de attachment sem projeto = blob alcançável fora do escopo de membership |

Nota: todas RESTRICT — nenhuma pré-decide F3D04-R2 (archived Project + Release ativa → 3G/3I); arquivamento é estado, não DELETE.

### Rejeições nominais (permanecem Tier 3)

```text
prj.project_binding -X-> con.connection
  binding referencia autoridade REVOGÁVEL, revalidada em compile/conformance/
  Release gates (3D-01 §8); FK daria falsa garantia de eligibilidade e
  acoplaria migrations de intent a operational state

par.conversation / par.agent_run -X-> prj.project
  escopo enforced na serving/admission boundary; purge de projeto já é
  bloqueado pelas FKs 1/4/5/6/7/8; ordem de purge por classe (3B-16) cobre

gw.effect_attempt <-X-> par.approval_request
  consistência nasce do claim atômico (3E-01 §9); FK bidirecional entre
  ledgers de owners distintos = acoplamento sem eliminar failure class

mar.job_run -X-> rel.release        → pin histórico por digest, não FK
bld.* -X-> reg.* / brn.* -X-> reg.* → refs por digest (imutável)
qualquer FK sobre digest            → proibido (3E-01 §4)
de/para obs.*                       → proibido (3E-01 §12)
de/para mastra_*                    → proibido (3E-01 §10; cross-database)
```

Pós-decisão: FK nova = emenda da lista via Decision Loop (3E-01 §4), nunca migration de conveniência.

---

## 8. Verificação pins × espelhos (Q6)

Varredura do inventário contra 3E-01 §5:

```text
gw.effect_attempt        pins de admissão     → históricos, imutáveis ✓
par.agent_run            composition digest   → pin do run (3D-02 AGENT_RUN) ✓
mar.job_run              revision digest      → version-lock histórico ✓
rel.promotion            evidence/diff refs   → históricos append-only ✓
bld.change_acceptance    matriz + política    → digest imutável ✓
mar.serving_route        SEM release digest   → resolve via projeção Release ✓
bld.change → contract_revision ativa          → transição controlada do PRÓPRIO
                                                owner (STALE/HANDOFF), não espelho ✓
brn current health                            → projeção derivada, não autoridade ✓
```

OBS e `mastra_*` permanecem fora da autoridade referencial de domínio: zero FKs em qualquer direção; correlação só por IDs/refs opacos (§5).

---

## 9. Gateway — confirmação sem expansão (Q7)

As três classes de 3E-01 §8 são suficientes e nenhuma quarta classe é necessária antes de 3F/3G:

- settlement/retry/reconciliation/`OUTCOME_UNKNOWN` machinery = **colunas/estados futuros sobre as classes existentes** (3G/3M), não classes novas;
- receipt = linkage + digest na attempt;
- contadores de rate limit duráveis (C-016) = mesma família `budget_counter`;
- reads e DENYs comuns continuam fora do ledger.

---

## 10. Persistido × substrate/ref-only (Q8)

```text
BUILDER
  persiste (bld.*)   change, contract/plan revisions, work_unit, actor_run,
                     coding_session, finding, change_acceptance
  substrate          threads/task state do coding harness (mastra_builder),
                     E2B execution state — perda degrada cognição, nunca
                     autoridade (3A-R5 probe item 3)
  ref-only           candidate/evidence/Actor Pack digests (CAS/git)

PAR
  persiste (par.*)   conversation (identidade/policy), agent_run,
                     approval_request, agent_trigger (+cursor F1)
  substrate          messages/threads/memory (F-M1), workflow snapshots
                     (F-M2), schedule rows (F-M3) — em mastra_par, com
                     durabilidade/backup superiores (3E-01 §10, F3E01-R1)
  ref-only           composition/manifest digests, envelope hash

MAR
  persiste (mar.*)   serving_route, job_run
  substrate/seam     mecanismo de fila/scheduler (3H/3L)
  ref-only           dist digest servido do CAS; active pointer via Release

RELEASE
  persiste (rel.*)   release, promotion, active_pointer
  ref-only           ReleaseManifest/config contract digests (CAS);
                     ledger de migrations aplicadas vive no database alvo
```

---

## 11. Guard notes / findings

Nenhuma contradição com 3E-01 ou autoridade anterior. Dois guard notes:

### 11.1 F3E02-R1 — Mastra `workflowDefinitions` não pode virar authoring authority

Verificado via Context7 que o storage atual do Mastra possui domain `workflowDefinitions` que **persiste definições dinâmicas de workflow** (F-M2). 3C-10 já rejeita Stored Agents/Editor como source of truth; este guard note estende explicitamente: definição runtime no substrate deriva **somente** do artifact compilado pinado pela Release, e o probe `CX-AGENT-MASTRA-01` deve incluir verificação de que nenhuma definição persistida no substrate sobrevive/atua fora do que a Release pina. **Owner: 3H/3L (probe).** Não bloqueia 3E-02.

### 11.2 F3E02-R2 — storage físico do CredentialBackend não é tabela `con.*`

C-007 descreve vault mínimo (crypto autenticada, chave fora do banco, key_version); 3D-04 congela `CredentialBackend` como infra boundary. A decisão 3E-02 deve registrar que a realização física do custody (tabela cifrada própria, arquivo, backend externo) é decisão de **3I/implementação da infra boundary** — `con.*` guarda apenas `credential_backend` + `credential_ref` opacos. Evita que o inventário congele por omissão uma tabela de segredos no domínio. **Owner: 3I.** Não bloqueia 3E-02.

---

## 12. Recomendação

Decidir 3E-02 diretamente com:

1. inventário do §4 como **piso fechado** (36 classes; classe nova = teste de admissão §3 + registro em decisão);
2. allowlist do §7 como **lista fechada de 8 FKs Tier-2** (emenda só via Decision Loop);
3. REJECT/DEFER do §6 incorporados como anti-speculative guardrail;
4. guard notes §11 roteados (3H/3L probe; 3I).

Próximo gate sugerido após 3E-02: **3E-R1 — Data Architecture Cross-Review** (validar 3E-01+3E-02 contra o intake de 3D-R1 §12 antes de abrir 3F), salvo se o operador preferir fechar antes retention/GC/backup operacional em rodada própria com 3J.

---

*Fim de 3E-FABLE-R1. Review não-autoritativo; nenhuma implementação de produto é autorizada por este documento.*
