# 3E-FABLE-R0 — Hub-Control Data Boundaries Review

**Status:** REVIEW / NÃO-AUTORITATIVO  
**Fase:** 3E — Data Architecture, primeira rodada (target 3E-01)  
**Revisor:** Fable (independent Senior/Staff/Principal review, per `3E-01-FABLE-HUB-CONTROL-DATA-BOUNDARIES-HANDOFF.md`)  
**Base revisada:** `ae090ef46cf614875d27bf6e0b49570eacfd8bf9` (branch `agent/conexus-phase-3-system-design`, PR #40)  
**Importante:** este documento não constitui C-018, não altera `LEDGER.md` nem decisões aprovadas, e não autoriza implementação. A adoção do modelo recomendado é ato do operador sobre este parecer.

---

## 1. Verdict

# **RECOMENDA: schema-per-module em um único `hub_control`, uma lineage de migrations, um DB role F1, FKs cross-module só em identidade estável e sem cascade, dois sites de atomicidade cross-owner (CreateProject e admissão+approval-claim), e substrate Mastra em databases próprios fora do `hub_control`.**

O menor modelo físico que preserva as boundaries de 3C/3D sem ritual é:

```text
cluster PostgreSQL único (PG17 pinado — C-006)
├── hub_control                    ← 13 schemas, um por módulo; autoridade de controle
├── mastra_builder                 ← substrate Mastra do Builder (vendor-managed DDL)
├── mastra_par                     ← substrate Mastra do PAR (vendor-managed DDL)
├── {proj}_* databases             ← C-006, intocado (1 database por Project + PROD lazy C-014)
└── validation DBs efêmeros        ← C-006/3B-16, intocado
```

Nenhum Finding material contra C-006 ou 3D foi encontrado. Três requisitos derivados são roteados adiante (§12) sem reabrir decisão aprovada.

---

## 2. Método e autoridade de entrada

Estado reconstruído por: `AGENTS.md` → `LEDGER.md` (3D CLOSED, 3E NEXT) → `3D-R1` §12 (intake de 3E) → C-006 (topologia Project Data + `hub_control`) → 3D-01 §10/§14 (transaction rule, substrate isolation) → 3D-02 §8–§10 (approval claim, admission atomicity, Gateway-owned state) → 3D-03 §5.1/§10 (CreateProject, transaction rule da orchestration) → 3D-04 §4–§6 (matriz final, infra boundaries, seams) → 3C-08/3C-10/3C-13/3C-15 (Gateway/PAR/OBS/MAR) → 3A-R5 (coding harness Mastra) → 3B-16 (quatro responsabilidades de substrato) → C-013/C-014/C-015/C-016 (evento/auditoria, release, sessões/attachments/backup, contadores duráveis).

Cada pergunta do handoff foi tratada como hipótese a falsificar: alternativas enumeradas, custo comparado, alternativa vencedora justificada pela menor forma enforcement-ável — não pela mais "arquitetural".

---

## 3. Q1 — Modelo físico de ownership dentro de `hub_control`

### Alternativas

```text
A. um schema PostgreSQL por módulo (13 schemas)
B. um schema único (public) + convenção de prefixo/ownership de tabela
C. schemas por "camada" (control/runtime/evidence) agrupando módulos
D. role de banco por módulo + privilégios por schema
```

### Kill reasoning

**D morre primeiro.** Role por módulo exigiria conexão (ou `SET ROLE`) distinta por módulo — mas os dois fluxos atômicos aprovados (CreateProject em 3D-03 §5.1; admissão+approval-claim em 3D-02 §8–9) exigem operações de **dois owners na mesma transação**, logo na mesma conexão e sessão. Privilégio por role quebraria exatamente as duas transações que a arquitetura sanciona, ou forçaria ginástica de `SET ROLE` intra-transação sem failure class que a pague. O enforcement de "no cross-module table access" no F1 é **estático/estrutural** (3D-01 §17 exige enforceabilidade mecânica, não exige que ela seja privilégio de banco). Role-hardening por schema permanece disponível como defesa adicional futura via 3I, sem rename, precisamente porque A preserva a fronteira nomeada.

**C morre em seguida.** Agrupar por camada cria fronteira física que não corresponde a nenhum owner de 3C — uma tabela em `runtime` não diz de quem é. A pergunta de review "quem pode tocar esta tabela?" voltaria a depender de convenção documental.

**B é o competidor real.** É o default de muitos monolitos e funciona com disciplina. Perde para A em três pontos objetivos:

1. **Enforceabilidade.** Com A + `search_path = ''` (qualificação obrigatória), toda referência cross-módulo é sintaticamente visível (`gw.effect_attempt`, `iam.project_membership`) e o check mecânico vira trivial: *SQL do módulo X só referencia schema X, exceto lista fechada de exceções declaradas* (FKs tier-2 do §4 e o código do próprio OBS). Com B, `JOIN approval_request` e `JOIN gw_effect_attempt` são indistinguíveis para o parser de um linter simples; o check precisa manter um mapa tabela→módulo fora do banco.
2. **Migration review.** Em A, o arquivo de migration declara e o DDL evidencia o owner; CI valida "DDL só toca o schema do owner declarado". Em B isso é convenção de nome, que decai.
3. **Custo de correção.** Se B decair, migrar para A depois custa rename de todas as referências; A custa ~nada hoje (schemas são gratuitos em Postgres; `pg_dump` do database é idêntico).

Custos honestos de A: algumas ferramentas ORM/codegen têm fricção com multi-schema — item de verificação para 3L/implementação, não bloqueio arquitetural; e o time precisa da regra "sempre qualificar" (que `search_path=''` torna mecânica, não disciplinar).

### Diferença do "schema-per-service ritual"

O guardrail do handoff é contra o ritual microservice-shaped. A recomendação difere dele em todos os pontos que definem o ritual:

```text
ritual                              recomendação
──────────────────────────────      ─────────────────────────────────
migrations por serviço              UMA lineage ordenada de hub_control
proibição dogmática de FK           FK tier-2 permitida (§4)
conexão/credencial por schema       UM role hub F1
schema como fronteira de deploy     schema como fronteira de OWNERSHIP
```

### Recomendação Q1

```text
hub_control
├── iam   — Identity & Access      (accounts, sessions-hash, memberships, grants)
├── ws    — Workspace
├── prj   — Project                (project state, bindings intent, baseline digests)
├── bld   — Builder                (Change, WorkUnit, ActorRun, Finding, coding-session refs)
├── reg   — Artifact Registry      (revisions, digests, metadata; payload em CAS)
├── con   — Connections            (connections, revisions, credential_ref; segredo via CredentialBackend)
├── gw    — Capability Gateway     (admission/effect ledger — §7)
├── brn   — Brain                  (proposals, health, binding operacional)
├── par   — Production Agent Runtime (AgentDefinition runtime state, Conversation, AgentRun, ApprovalRequest, AgentTrigger)
├── rel   — Release                (manifest pins, PromotionRecord append-only, active pointer + generation)
├── mar   — Managed App Runtime    (serving_route — §9; job records quando job/v1 realizar)
├── obs   — Observability & Audit  (audit_record, operational_event, lineage projections — §10)
└── att   — Attachments            (attachment authority, blob registry state/refcount/generation — C-015)
```

Regras acopladas:

- **Rigor não tem schema.** É primitive pura sem estado persistente (3D-01 §11). Schema `rigor` seria contradição.
- **Sem schema `shared`/`common`.** O shared kernel de 3D-01 §12 é código, não dados. Tabela sem owner é boundary sem ownership.
- **Uma lineage de migrations do `hub_control`** (ledger único ordenado); cada arquivo declara o módulo owner; CI valida que o DDL só toca o schema do owner (exceção: cláusula `REFERENCES` tier-2). Só DDL transacional, herdando a regra C-006 componente 5.
- **Um role de aplicação F1** para o processo do hub em `hub_control`. As roles mecânicas C-006 (`{proj}_query`/`{proj}_action`/`{proj}_migrator`) continuam exclusivas dos databases de projeto; `{proj}_query` não conecta ao `hub_control` (C-015).

---

## 4. Q2 — Referências cross-module: três tiers

A pergunta certa é a que o handoff faz: **integridade referencial ≠ autoridade de domínio.** Um FK prova que a linha referenciada existia no commit; nunca prova que a autoridade que ela representa continua válida (3D-01 §8 — revogável revalida no owner). Nenhum FK substitui revalidação.

### Tier 1 — intra-módulo

FKs normais, livres, dentro do schema do owner. Nenhuma regra nova.

### Tier 2 — FK cross-module de identidade estrutural (permitido, restrito)

Permitido **somente** quando todas as condições valem:

```text
a. o alvo é identidade estável exposta como parte da identidade pública
   do owner (ex.: iam.account(id), prj.project(id), ws.workspace(id))
b. ON DELETE RESTRICT / NO ACTION — NUNCA CASCADE, NUNCA SET NULL
c. o FK aponta para a PK, não para detalhe interno do owner
d. o referenciador não ganha por consequência leitura/escrita
   do schema alvo — o constraint é do banco, não do código
```

`CASCADE` é proibido porque seria escrita implícita de um módulo nas tabelas de outro — exatamente o hidden authority shortcut que o intake de 3D-R1 §12 item 9 proíbe. `RESTRICT` também materializa 3B-16 "archive antes de purge": nenhum `DELETE project` apaga membership por efeito colateral.

Exemplos legítimos tier-2:

```text
iam.project_membership.project_id  → prj.project(id)
prj.project.workspace_id           → ws.workspace(id)
rel.release.project_id             → prj.project(id)
mar.serving_route.project_id       → prj.project(id)
att.attachment.project_id          → prj.project(id)
```

### Tier 3 — ID opaco / digest, sem FK (default para todo o resto)

```text
correlation IDs                    (changeId, actorRunId, agentRunId, promotionId…)
content-addressed refs             (revision digest, ReleaseManifest digest, dist digest,
                                    BrainPack digest, contract revision digest…)
refs entre ledgers operacionais    (gw.effect_attempt ↔ par.approval_request — §7)
TODA referência partindo de obs.*  (§10)
```

Motivos: digest referencia conteúdo imutável — a integridade é verificação de digest, não constraint; refs entre ledgers de owners distintos ganham consistência da transação atômica no instante do claim (§7), e um FK bidirecional entre `gw` e `par` criaria acoplamento de migration/lifecycle sem eliminar nenhuma failure class; e Observability é registro histórico que precisa sobreviver independentemente das linhas de domínio (GC/retention próprios — C-013), logo **nunca declara FK para dentro de schema de domínio**, e nenhum schema de domínio declara FK para `obs.*`.

---

## 5. Regra transversal derivada — pin histórico ≠ espelho de estado

Duas linhas com o mesmo formato têm semânticas opostas, e 3E deve tratá-las de forma oposta:

```text
PIN HISTÓRICO (correto, obrigatório)
linha de registro/attempt/promotion grava o digest/revision EXATO
que foi admitido/composto/servido — fato imutável, nunca atualizado

ESPELHO DE ESTADO (proibido)
tabela de um módulo mantém cópia do estado ATUAL de outro owner
(ex.: mar.serving_route guardando "active release digest")
```

O espelho é a segunda fonte de verdade que o intake proíbe. O pin é o que C-014/3D-02 exigem. Teste mecânico: se a coluna precisaria de UPDATE quando o outro owner muda, é espelho — remova e leia a projection pública do owner na hora do uso.

---

## 6. Q3 — CreateProject: atomicidade sem escrita cruzada

Realização física da única transação cross-owner de L7 (3D-03 §5.1):

```text
L7 CreateProject
→ withTransaction(async (tx) => {
     projectRef = await Project.createProject(tx, input)     // SQL só em prj.*
     await IAM.grantInitialMembership(tx, accountRef, projectRef, role)  // SQL só em iam.*
  })
```

Regras que tornam isso enforcement-ável e não-framework:

1. **`TxScope` é primitive técnica do shared kernel** (handle opaco de transação/conexão — 3D-01 §12 admite value types técnicos transversais). Passar o handle não concede acesso a tabela nenhuma: cada operação pública executa apenas os statements do próprio schema.
2. **Só named use cases L7 abrem transação cross-owner.** Módulo nunca abre transação que envolva operação de outro owner. A exceção runtime única é a admissão do Gateway (§7), já sancionada por 3D-02 §9.
3. **Sem UnitOfWork/repository framework.** Um helper `withTransaction` no composition root + operações públicas que aceitam `TxScope` opcional é a forma inteira. Nenhuma base class, nenhum registry.
4. **I/O externo fora.** Provisionamento GitInfra do repo do Project é I/O externo e fica **fora** desta transação (3D-03 §10). O par atômico é exatamente `prj.project` + `iam.project_membership` — o estado de associação Git nasce em passo separado com estado explícito (forma exata do lifecycle → 3G).
5. O FK tier-2 `iam.project_membership.project_id → prj.project(id)` é satisfeito dentro da mesma transação — o constraint reforça, não substitui, a atomicidade.

Nota de precedência para o fresh actor: 3D-03 §10 diz "hoje: CreateProject é o único caso F1" **no escopo da orchestration L7**; 3D-02 §9 sanciona separadamente a atomicidade local da admissão de efeito. São dois sites, sem contradição — este review os trata como a lista fechada F1 de transação cross-owner (§7).

---

## 7. Q4 + Q5 — Ledger de admissão do Gateway e o approval claim

### 7.1 Realização atômica (Q4)

A admissão de efeito material com approval é **uma transação** aberta pelo Gateway, com cada owner executando os próprios statements:

```text
BEGIN                                            ── Gateway abre (runtime, não L7)
  gw:  budget reservation / debit                   (gw.budget_counter)
  gw:  idempotency claim INSERT                     (gw.idempotency_claim, UNIQUE)
  par: approval claim via capability injetada       (par.approval_request —
       UPDATE ... SET claimed_by_attempt = :attemptId
       WHERE id = :approvalId
         AND status = 'APPROVED'
         AND claimed_by_attempt IS NULL)            ← CAS single-use
  gw:  effect_attempt INSERT (traffic_state = NOT_SENT, pins exatos)
COMMIT
→ (fora da transação) execução física do efeito
→ nova transação: traffic_state / receipt / outcome
```

Propriedades preservadas:

- **Ownership de tabela intacto.** O código que toca `par.approval_request` é a **implementação do PAR** da narrow approval-claim capability (a única inversão de domínio de 3D). A assinatura da capability aceita `TxScope`; o composition root faz o wiring. O Gateway nunca emite SQL contra `par.*` — ele invoca a capability.
- **Single-claim/replay-safe fisicamente:** o CAS `WHERE claimed_by_attempt IS NULL` + a coluna única fazem a segunda tentativa de claim falhar por construção; retry/recovery da **mesma** attempt reusa o estado durável daquela attempt (a linha `gw.effect_attempt` existente), nunca um novo claim — exatamente 3D-02 §8.
- **Vínculo exato sem FK bidirecional:** `par.approval_request.claimed_by_attempt` guarda o attempt id; `gw.effect_attempt.approval_ref` guarda o approval id. A consistência do par nasce da transação atômica; IDs opacos (tier 3) evitam acoplamento de migration entre os dois schemas.
- **Nenhuma transação atravessa I/O externo.** O send acontece pós-COMMIT; `SENT_NO_RESPONSE`/`OUTCOME_UNKNOWN` são gravados em transação nova (3D-02 §13, C-013 persist-first).

### 7.2 Registros duráveis do Gateway agora vs depois (Q5)

**Necessários antes de 3F/3G** (existência + ownership + relações atômicas; shape de coluna e FSM ficam para 3F/3G):

```text
gw.effect_attempt      identidade da attempt; pins exatos admitidos (capability
                       revision digest, composition/binding refs, ConnectionRevision,
                       surface + caller context refs); approval_ref quando aplicável;
                       traffic_state {NOT_SENT|SENT_NO_RESPONSE|RESPONSE_RECEIVED};
                       outcome; receipt linkage (receipt digest / envelope hash C-010);
                       timestamps
gw.idempotency_claim   chave de escopo (capability + idempotency key + escopo)
                       → attempt, UNIQUE constraint
gw.budget_counter      contadores/reservas DURÁVEIS somente para as classes que
                       C-016 exige duráveis: EXTERNAL_EFFECT, EXPORT, e WRITE_LOCAL
                       quando approvalFloor > NONE; restart não zera limite de efeito
```

**Explicitamente deferido:**

```text
3G/3M   FSM completa da attempt, settlement, retry/reconciliation machinery,
        reconciliação de OUTCOME_UNKNOWN, crash recovery de NOT_SENT
3F      colunas finais, error taxonomy, envelope/receipt shape exato
NUNCA   ledger durável para reads comuns — reads permanecem leves (3D-02 §12);
        rate-limit READ_* fica em memória (C-016); DENY comum é audit/telemetry
        quando material, não linha de ledger de efeito
```

---

## 8. Q6 — Substrate Mastra: fora do `hub_control`, um database por consumidor

### Alternativas

```text
A. tabelas Mastra dentro de hub_control (schemas mastra_bld/mastra_par)
B. um database mastra compartilhado com dois schemas
C. dois databases: mastra_builder e mastra_par            ← RECOMENDADA
```

### Por que A morre

O DDL do substrate Mastra é **vendor-managed** — a biblioteca cria/migra as próprias tabelas em runtime. Dentro do `hub_control` isso destruiria três invariantes de uma vez: a lineage única de migrations revisadas (§3) passaria a conviver com DDL não-revisado; o drift check do database de autoridade perderia significado; e backup/restore do `hub_control` (C-015: dump PRIMEIRO, autoridade de contas/bindings/attachments) acoplaria seu RPO ao estado interno de um framework. Substrate state não é autoridade (3C-10, 3A-R5) — não pertence ao database de autoridade.

### Por que B perde para C

O mesmo argumento de 3D-01 §14: tecnologia compartilhada não pode virar acoplamento mutável escondido. Com um database único, o isolamento Builder×PAR dependeria da configuração de schema do adapter do vendor — precisamente a superfície que não controlamos. Dois databases com **credenciais/pools distintos** tornam o cross-use estruturalmente impossível no nível da conexão, custam ~zero no cluster local, e dão a replaceability real de 3A-R5: se `CX-BUILDER-MASTRA-01` acionar removal condition e Pi voltar como fallback, `DROP DATABASE mastra_builder` não toca o PAR — e vice-versa.

### Regras acopladas

```text
1. nenhum módulo Conexus lê/escreve mastra_*; só o runtime substrate
   do respectivo consumidor conecta ao seu database
2. correlação via runtime run refs gravados nas tabelas Conexus
   (bld.actor_run / par.agent_run guardam o ID de run do substrate);
   NUNCA FK para dentro de mastra_*, NUNCA query cross-database
3. estado do substrate nunca é fonte de recovery de autoridade:
   perda de mastra_builder degrada cognição, nunca perde
   Change/COR/Plan/Findings (3A-R5 probe item 3)
4. assimetria de durabilidade reconhecida:
   mastra_builder = cognição Change-scoped (perda tolerável)
   mastra_par     = realização de Conversation + checkpoints de
                    AgentRun suspenso (perda NÃO tolerável)
   → mastra_par entra no procedimento de backup (Finding roteado §12.1)
```

Isso estende o inventário de databases do cluster além do enunciado literal de C-006 ("1 por projeto + hub_control"). Não é contradição — C-006 decidiu topologia de **Project Data** — mas é extensão que a aprovação de 3E-01 deve ratificar explicitamente (§12.3).

---

## 9. Q7 — MAR route→Project serving mapping (F3D04-R1)

Vive em `mar.serving_route`, ownership MAR, consistente com 3D-04 §5.11 ("estado operacional da serving boundary"):

```text
mar.serving_route
├── route key (host/path shape física → 3J)
├── project_id           FK tier-2 RESTRICT → prj.project(id)
├── environment          (PROD | preview quando aplicável)
└── estado operacional da rota (ativa/suspensa — semântica → 3G)
```

O que a linha **não** contém: digest da Release ativa, releaseId, ponteiro servido. Resolução em request-time:

```text
request → mar.serving_route → project/environment
        → Release public projection (active pointer + generation)  ← authority C-014
        → bytes por digest via BlobStore/CAS
```

Guardar o digest ativo na rota seria espelho de estado (§5) e quebraria o CAS de ponteiro como autoridade única do Release. O FK tier-2 para `prj.project` não é import `MAR → Project` (proibido em 3D-04): é constraint de integridade sobre identidade estável, sem leitura de `prj.*` pelo código do MAR. `RESTRICT` também não pré-decide F3D04-R2 (Project arquivado com Release ativa → 3G/3I): arquivamento é estado, não DELETE.

Cache/invalidação → 3H; hostname/DNS/TLS → 3J. Registros de `job/v1` (JobRun ou equivalente) nascem no schema `mar` quando 3G fechar o lifecycle — 3E-01 só fixa o ownership físico.

---

## 10. Q8 — Observability/Audit: duas classes físicas, nunca segunda verdade

O schema `obs` materializa a separação semântica de 3C-13 em **duas tabelas com regimes opostos**:

```text
obs.audit_record          append-only, FORA do GC, retenção longa
                          (ledger durável — C-013 "ledgers fora do GC")

obs.operational_event     INSERT-only, hot fields + payload jsonb (C-013),
                          dedup de ingestão (producer_instance_id +
                          producer_event_id + source_seq), producer_trust,
                          occurred_at ≠ recorded_at, parent_event_id,
                          retenção 90d + high-water mark + GC por run
```

Regimes transacionais opostos:

- **Audit-required é transacional.** Ação material hub-local (grant, promotion step, mudança de credential authority) grava o `audit_record` **na mesma transação** da escrita de domínio — o emit é capability pública do OBS invocada pelo owner, o SQL é do OBS no schema `obs`, dentro do `TxScope` ambiente. Se o insert de audit falha, a transação aborta: realização física direta do fail-closed de 3C-13 §7, sem inversão de autoridade (3D-01 §13). Para efeitos externos, o audit ancora nos registros de admissão/settlement do Gateway (§7), nunca em transação atravessando I/O.
- **Telemetry comum é assíncrona e nunca entra em transação de domínio.** Buffer bounded, `events_dropped` coalescido, degradação sem parar o domínio (C-013: falha de telemetria com Postgres saudável nunca altera execução).

Fronteiras contra segunda fonte de verdade:

```text
obs.* não declara FK para schema de domínio; domínio não declara FK para obs.*
nenhum módulo lê obs.* para decidir estado/autorização atual
acceptance consome apenas registros HUB_AUTHORITY/GATEWAY_AUTHORITY (C-013)
lineage projections (resolvedReads/Writes, edges) = DERIVADAS e reconstruíveis
no schema obs — nunca autoridade; supressões legítimas preservadas
sem GIN/partição dia 1 — gatilhos por latência/vacuum medidos (C-013)
```

---

## 11. Q9 — O que permanece content-addressed ref, nunca estado mutável duplicado

Regra única (com o teste mecânico do §5): **bytes vivem no CAS; `hub_control` guarda digest + metadata mínima indexável; registros históricos pinam digests; nenhum current-state espelha current-state alheio.**

Inventário do que viaja/persiste só como digest/ref em `hub_control`:

```text
reg   compiled payload            → bytes no BlobStore/CAS; reg.* guarda digest/metadata
rel   ReleaseManifest             → conteúdo imutável content-addressed; rel.* pina digest;
                                    active pointer = (project, env) → manifest digest + generation CAS
rel   frontend dist digest        → bytes servidos pelo MAR direto do CAS (3D-04)
brn   BrainPack / binding digests → pin por digest (C-011)
bld   contract revision digest, Actor Pack digests, evidence digests,
      candidate/source digests    → C-017
con   ConnectorDefinition revision, ConnectionRevision identity
gw    todos os pins do effect_attempt (§7) — pin histórico, imutável
att   blob bytes                  → filesystem CAS; att.* = autoridade de attachment,
                                    state/refcount/generation (C-015); digest nunca é rota/credencial
obs   content_digest + original_byte_length para conteúdo não capturado (C-013)
```

---

## 12. Findings e requisitos derivados

**Nenhum Finding material contra C-006, 3C ou 3D.** Nada aqui exige reabrir decisão aprovada. Três itens roteados:

### 12.1 F3E01-R1 — `mastra_par` precisa entrar no procedimento de backup

C-015 mecanizou o backup como `hub_control` PRIMEIRO → projetos enumerados → blobs+manifesto. `mastra_par` conterá realização de Conversation e checkpoints de AgentRun suspenso — perda destrói conversas e runs suspensos mesmo com toda autoridade intacta. O procedimento de backup/restore-test deve enumerar `mastra_par` (tier abaixo do `hub_control`, acima de `mastra_builder`, que é sacrificável). **Owner: 3J** (extensão do procedimento C-015, não contradição).

### 12.2 F3E01-R2 — disciplina de migration do próprio `hub_control`

C-006 definiu QA gates para databases de **projeto**. O `hub_control` precisa do análogo mínimo: lineage única transacional (§3) + prova de rebuild 0..N em database temporário no CI da plataforma. Requisito derivado, sem novo mecanismo de produto. **Owner: próxima rodada 3E / implementação da plataforma.**

### 12.3 F3E01-R3 — ratificar a extensão do inventário do cluster

A aprovação de 3E-01 deve declarar explicitamente o inventário do §1 (hub_control + mastra_builder + mastra_par + project DBs + efêmeros) como leitura vigente de C-006 componente 2, para que um fresh actor não trate `mastra_*` como drift. **Owner: decisão 3E-01 do operador.**

---

## 13. Síntese normativa recomendada para a decisão 3E-01

### Permitido / proibido — relações de persistência cross-module

```text
PERMITIDO
schema próprio por módulo; FK intra-módulo livre
FK cross-module tier-2 (identidade estável, PK, RESTRICT/NO ACTION)
transação cross-owner APENAS em: CreateProject (L7) e
  admissão de efeito + approval claim (Gateway, via capability com TxScope)
audit_record na mesma transação da ação audit-required
pins de digest imutável em registros históricos

PROIBIDO
SQL de um módulo contra schema de outro (única exceção: cláusula REFERENCES tier-2)
CASCADE/SET NULL em FK cross-module
FK de/para obs.*; FK para mastra_*; FK sobre digest
espelho de estado atual de outro owner (§5)
módulo abrindo transação que envolva operação de outro owner
transação cross-owner atravessando I/O externo
tabela em schema sem owner (shared/common)
leitura de obs.* como autoridade de estado atual
qualquer módulo Conexus conectando em mastra_*
```

### YAGNI — rejeições explícitas desta rodada

```text
role de banco por módulo / conexão por módulo          (mata as transações sancionadas)
generic repository / UnitOfWork framework              (withTransaction + TxScope bastam)
outbox/inbox, event sourcing, CQRS, sagas               (sem failure class local)
schema-per-service ritual (migrations por módulo,
  proibição dogmática de FK)                            (§3)
GIN/partição/warehouse de eventos dia 1                (gatilhos C-013 preservados)
database separado para observability                   (schema obs + regimes de GC bastam)
RLS / row security no hub_control                      (gatilho 3I)
soft-delete framework / audit-table por tabela          (audit_record cobre ações materiais)
ORM/tooling decidido em 3E                              (3L/implementação; multi-schema é critério)
JobQueue/Scheduler port compartilhada                   (reafirmado; seam interno MAR)
espelhamento de estado Mastra campo a campo em tabelas
  Conexus                                               (3C-10 preservado)
```

### Próximo gate recomendado

```text
3E-02 — Module Durable Record Inventory & Reference Closure
```

Fechar, sobre o modelo físico daqui: o inventário mínimo de registros duráveis por módulo (o §7.2 fez isso para o Gateway; falta o análogo enxuto para bld/par/rel/mar/brn/con — existência, ownership e chaves, sem colunas finais), as convenções de identidade (ID opaco, digest, generation/CAS), e a lista fechada de FKs tier-2. Depois, `3E-R1 — Data Architecture Cross-Review` valida o conjunto contra o intake de 3D-R1 §12 antes de abrir 3F.

---

*Fim de 3E-FABLE-R0. Review não-autoritativo; nenhuma implementação de produto é autorizada por este documento.*
