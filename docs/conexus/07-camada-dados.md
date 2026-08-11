# Tópico 6 — Camada de dados

**Status: DECIDIDO — C-006, ratificado pelo operador em 2026-08-11.**
Fontes: acervo Mitra ([03-camada-dados](../reference/mitra/03-camada-dados.md)) + 2 pesquisas web
internas (P1 engine/isolamento/efêmero/WSL2; P2 backup/rollback/ETL/fixtures/estilo — fontes
primárias, 2026-08-11) + deep research externa independente (8 perguntas,
[prompt](pesquisa-externa-dados-prompt.md)) + revisão adversarial em 2 rodadas (Codex
`gpt-5.6-sol`, reasoning xhigh: 8,3/10 → 9,3/10 "convergido, sem divergência arquitetural").
Herda [C-002](04-runtime-agente.md) (hub Node/TS + Postgres + pg-boss), [C-004](05-sandbox.md)
(fase 1a local WSL2, Capability Gateway, credencial nunca no sandbox) e
[C-005](06-registro-artefatos.md) (migrations imutáveis como gate, kinds → roles reais,
deployment com CAS de ponteiro, roll-forward first).

## A decisão em uma frase

**PostgreSQL único (piso PG17, major pinado), um database por projeto numa instância local,
roles least-privilege provisionadas mecanicamente, três QA gates em database temporário do
próprio cluster, só migration transacional na fase 1, backup lógico diário com cópia cifrada em
B2, roll-forward como caminho normal, ETL cursor+staging+upsert mantido, e template de schema
congelado no scaffold.**

## Contexto da escolha

- Mitra prova a fronteira banco-por-projeto, mas com defeitos rejeitados: MySQL (atomic DDL ≠
  transactional DDL — quebraria o gate de migration da C-005), container Docker por projeto,
  DEV=PROD sem ambiente de teste, smoke contra dados reais, migration como log pós-fato.
- Regra do operador: validar contra Mitra (provada), Factory (robusta) e global maximum.
- Divergências reais entre as 3 pesquisas (backup, QA efêmero, collation, uuidv7, time-travel)
  foram adjudicadas pelo Codex nas 2 rodadas; posição final abaixo é a convergida.

## Evidência-chave

| Fato | Fonte |
|---|---|
| MySQL: "atomic DDL is not transactional DDL" — DDL encerra transação implícita; CREATE TABLE + INSERT no mesmo rollback é impossível. Postgres tem DDL transacional → eliminatório p/ o gate da C-005 | dev.mysql.com / wiki.postgresql.org (2026-08-11) |
| Argumento "LLM erra menos SQL em Postgres" descartado: evidência pública conflitante (PARROT favorece PG; BIRD antigo favorecia MySQL; UniQL/PolySQL só provam sensibilidade a dialeto). Engine escolhida por razão estrutural, não por percepção de treino | arXiv (2026-08-11) |
| `pg_dump` opera por database = fronteira natural por projeto; PITR físico é do CLUSTER inteiro — com N projetos na mesma instância, time-travel de 1 projeto exigiria restore em scratch + extração. Granularidade decidiu o baseline de backup | postgresql.org docs (2026-08-11) |
| pgBackRest arquivado abr/2026 e revivido mai/2026 com coalizão (AWS, Supabase, pgEdge, Percona; v2.59 jul/2026) — vivo, mas custo operacional (archive health, retenção WAL, restore físico) sem requisito de RPO que o justifique na fase 1 | pgbackrest.org / github (2026-08-11) |
| Replit App History = commit git + branch CoW do Neon; equivalente 100% local exigiria ZFS/DBLab (WSL2 padrão é ext4 no VHDX) — desproporcional p/ operador solo | replit.com / learn.microsoft.com (2026-08-11) |
| Snaplet morreu (2024, manutenção comunitária); Greenmask faz subset + anonimização preservando FK sobre pg_dump/pg_restore; PostgreSQL Anonymizer avisa que sampling quebra FK | docs.greenmask.io / supabase.com (2026-08-11) |
| Codex 2 rodadas: derrubou pgBackRest dia 1, padrão PITR-checkpoint e template `proj_tpl` contínuo (segunda representação do estado); corrigiu drain (jobs queued/deferred/retry executam pós-migration) e recuperação (pg_dump não leva roles/extensões → manifesto obrigatório). Convergiu em 9,3/10 | sessão Codex 2026-08-11 |

## Decisão por componente

| # | Componente | Decisão |
|---|---|---|
| 1 | **Engine** | PostgreSQL único p/ bancos de projeto. Motivo estrutural: DDL transacional + granularidade de roles p/ Capability Gateway + fronteira de backup por database. Piso técnico PG17 (builtin `C.UTF-8`); major pinado concreto e IGUAL em local/QA/cloud. MySQL REJECT (incompatível com gate de migration); outro engine DEFER. |
| 2 | **Isolamento** | 1 instância Postgres local (apt nativo no WSL2; PGDATA em ext4 interno, nunca `/mnt/c`), 1 database por projeto + `hub_control` separado. Não schema-por-projeto (search_path, backup, autoridade), não container-por-projeto (lifecycle × zero-ops), não Neon/branching (DEFER por gatilho). |
| 3 | **Roles por projeto** (provisão mecânica, nunca lembrada pelo agente) | `{proj}_owner` NOLOGIN possui objetos; `{proj}_migrator` assume owner (sem SUPERUSER/CREATEROLE, sem autoridade fora do projeto) — usado só pelo migration runner; `{proj}_query` = CONNECT + USAGE + SELECT + `default_transaction_read_only`; `{proj}_action` = DML no conjunto permitido, sem CREATE, sem ownership. `ALTER DEFAULT PRIVILEGES` configurado na criação. Gateway seleciona credencial pelo kind do artefato (C-005). Query/action JAMAIS owners. |
| 4 | **QA — 3 gates** (nenhum contra produção) | **QA-DB-1 Rebuild**: database temporário de `template0` → migrations 0..N como migrator → PASS. **QA-DB-2 Golden fixtures**: rebuild + fixtures determinísticas → asserções de valor exato (`pendentes == 187`) + provas negativas de privilégio (query não escreve; action não faz DDL). **QA-DB-3 Migration rehearsal**: restore de `pg_dump -Fc` sanitizado → migration candidata → integridade + asserções → destrói. Tudo em database temporário no próprio cluster (mesmo major/extensões do alvo, sem Docker no fluxo diário); `CREATE DATABASE ... TEMPLATE`/reflink só como otimização descartável quando métrica pedir (template regenerado de migrations+fixtures aprovadas, nunca clonado de banco vivo); testcontainers só p/ CI/testes do harness. |
| 5 | **Migrations / deployment** | Fase 1 aceita SÓ DDL transacional — executor rejeita `CREATE INDEX CONCURRENTLY` e afins (via não-transacional entra por gatilho como procedimento `maintenance-required` idempotente). Termo corrigido da C-005: **"gated deployment com migration transacional e cutover controlado"** (schema + pointer-swap não são transação distribuída única; mecânica CAS intacta). `compatibility` validado mecanicamente; compatibilidade vale até drenar requests/jobs da versão anterior — não só até o CAS. `maintenance-required` = janela: bloquear novos requests mutantes + enqueues → drenar síncronos e ativos → confirmar ZERO jobs queued/deferred/retry (ou cancelar explícito) → migrar → CAS; fail-closed se não zerar na janela. Pipeline: compile → QA-DB-1/2 → QA-DB-3 (se migration) → deployment lock → quiesce se necessário → dump + checksum + manifesto → migration transacional → verificação da candidata → CAS → verificação da release → unlock. |
| 6 | **Fixtures** | Determinísticas, seed fixo, versionadas, casos intencionais (pendente/convertido/cancelado, devolução, nulos, timezone boundary, arredondamento, duplicata, cursor atrasado). Correção de texto da C-005: **schema recriável das migrations; estado de teste recriável das fixtures/seeds** (migration ≠ fixture). Dado production-like não é default: Greenmask (subset + masking preservando FK) por gatilho; rehearsal usa só snapshot aprovado/sanitizado. |
| 7 | **Backup dia 1** | `pg_dump -Fc` diário por projeto + dump pré-migration + **manifesto de recuperação** (major, extensões, roles/memberships, grants — pg_dump não os inclui). Retenção 7 diários / 4 semanais. Segunda mídia: cópia cifrada → Backblaze B2 via `rclone copy` (nunca `sync`; nomes imutáveis projeto+timestamp+migration-head+checksum; `crypt` no remote; chave B2 restrita sem permissão de delete; retenção por lifecycle — job não apaga; segredo do crypt guardado fora do equipamento; falha de upload = job falho + alerta; dump pré-migration só libera migration após upload confirmado, salvo override manual registrado). Restore-test mensal BAIXANDO do B2 (não da cópia local) em database temporário + query semântica conhecida. Agendamento WSL2 com catch-up + alarme "último backup bem-sucedido". **PITR/pgBackRest só por gatilho de RPO** (dado não reconstruível com RPO menor que a menor frequência prática de dump, ou RTO do restore lógico insuficiente) — antes disso, aumentar frequência de dump. |
| 8 | **Rollback código+dados** | Roll-forward = caminho normal pós-migration (C-005). Paraquedas: identidade git/deployment + head/checksums de migrations + dump pré-migration → restore em database scratch → validação → recuperação controlada só em incidente extraordinário. SEM time-travel local (tag git + timestamp não é checkpoint consistente: cursor de ETL e efeitos externos no Sankhya ficam fora de qualquer mecanismo de banco). Gatilho p/ branching CoW real (Neon-like): restore lógico lento demais, previews paralelos frequentes, ou "voltar projeto p/ momento X" virar feature do produto. |
| 9 | **ETL Sankhya → projeto** | Mantém o padrão provado: cursor/watermark + janela de overlap + paginação + staging + upsert `INSERT ... ON CONFLICT DO UPDATE` + **cursor avança só pós-merge** (nunca antes). Estado durável em `sync_state` (source, entity, cursor, contadores, status, erro). **Obrigatório no blueprint de conector (tópico 7)**: política de DELETES por entidade — exatamente uma entre tombstone da fonte / soft-delete / reconciliação integral periódica / imutável-com-evidência-do-contrato ("nunca some" exige prova, não suposição) — e contrato do cursor (desempate estável, resolução de timestamp, paginação em fronteira, atualizações retroativas). CDC inaplicável (fonte é REST, sem txlog); Airbyte overkill; dlt = referência/ADOPT futuro se conectores multiplicarem. |
| 10 | **Template de schema congelado** (scaffold, verificado por SQLFluff no CI) | Encoding UTF8; cluster/database default builtin `C.UTF-8` (imutável, zero risco de corrupção de índice em upgrade) + collation ICU `conexus_pt_br` (locale pt-BR) provisionada mecanicamente e declarada NAS COLUNAS de apresentação (nome de cliente/produto/cidade — índices de apresentação na mesma collation); campos técnicos (ids, códigos, chaves de origem, enums) ficam em `C.UTF-8`. TimeZone UTC; `timestamptz` p/ instantes, `date` só p/ calendário. Dinheiro = `numeric` (nunca float/`money`). snake_case lowercase sem quoted identifiers. PK interno = `bigint GENERATED ALWAYS AS IDENTITY`; sem `DEFAULT uuidv7()` no template (pin desnecessário em PG18) — ID externo quando requisito real = coluna `uuid` com UUIDv7 gerado na aplicação. `text` + CHECK (não varchar(n)). NOT NULL como default semântico. Índice em toda FK (Postgres não cria automático). Identidade de origem: `source_system`/`source_entity`/`source_id` + unique. Campos operacionais: `created_at`/`updated_at`/`synced_at`/`source_updated_at`. JSONB só p/ dado genuinamente flexível, não modelagem. Constraints são a camada de integridade — não a IA. |
| 11 | **Invariante de audiência** | "Mesma audiência" (single-tenant, usuários internos, um grupo de permissão) é invariante DECLARADA do projeto, não suposição. RC-1 dispara ANTES de habilitar segundo grupo de permissão; RC-2 dispara ANTES de ativar o primeiro artefato financeiro/destrutivo/de impacto material — na admissão/ativação do artefato, não depois da primeira execução. Timeouts de statement/lock = higiene básica, não budgets. |

## Mitra: o que sobrevive e o que morre

ADOPT preservado: fronteira banco-por-projeto (sem o container Docker), credencial fora do
alcance do agente (→ Capability Gateway; corrige a inconsistência da Mitra de credencial externa
cifrada DENTRO do banco do projeto — vault no tópico 7), FK placeholders p/ dado sujo do ERP
(`CODVEND=0`), padrão ETL staging+chunk+cursor (validado pelo mercado: é o que dlt implementa).
REJECT corrigido: MySQL → Postgres (atomic ≠ transactional DDL); DEV=PROD sem teste → 3 QA
gates em base efêmera; smoke contra dados reais → asserção de valor exato em base determinística;
migration como log pós-fato → migration como gate (C-005); collation problemática → híbrido
`C.UTF-8` + ICU pt-BR mecânico no template.

## O que NÃO vamos fazer (anti-overengineering, gatilho registrado)

- **Não** pgBackRest/WAL/PITR dia 1 — gatilho: RPO real menor que frequência de dump viável.
- **Não** generation fencing formal no Gateway — version-locking + janela com drain bastam;
  gatilho: RC-3 (zero-downtime/SLA, deployments concorrentes).
- **Não** time-travel local (ZFS/btrfs, DBLab, Neon, PITR-checkpoint) — roll-forward + dump
  pré-migration; gatilho registrado no componente 8.
- **Não** container Postgres por projeto, não schema-por-projeto.
- **Não** template `proj_tpl` mantido continuamente — só otimização descartável por métrica.
- **Não** Airbyte/Debezium/CDC/dlt como dependência — padrão TS próprio do conector.
- **Não** `DEFAULT uuidv7()` (pin PG18), não UUID em toda tabela.
- **Não** audience/budgets/RLS (RC-1/RC-2), não STAGING (RC-3), não banco analítico separado.
- **Não** Greenmask/anonimização como default — só quando shape real sair do perímetro.

## Consequências

- Tópico 7 (integração externa) herda OBRIGATÓRIOS: política de deletes por entidade + contrato
  de cursor no blueprint de conector; vault único de credenciais (corrigir inconsistência Mitra).
- Tópico 8 (scaffold) herda: template congelado (componente 10) como arquivos do scaffold +
  SQLFluff no CI; collation de apresentação como regra mecânica de geração.
- Tópico 11 (ciclo de vida) herda: pipeline de deployment (componente 5) + janela
  `maintenance-required` com drain completo.
- Tópico 13 (observabilidade) herda: alarme "último backup bem-sucedido" + status de sync_state.
- Evidências de execução pendentes (não bloqueiam a decisão; viram itens do build): restore
  completo a partir do B2 em cluster limpo (com roles/extensões via manifesto); ensaio de janela
  `maintenance-required` com jobs deferred/retry; QA gates rodando com roles reais + snapshot
  sanitizado.

## Adendo pós-C-008 (2026-08-11) — `BuildValidationDatabase` no sandbox × autoridade local

A [C-008](05-sandbox.md) cria um segundo lugar onde Postgres roda — e este adendo garante que
NÃO cria uma segunda autoridade (o que violaria a C-006):

- **`BuildValidationDatabase`** (nome próprio, nunca "DEV"): PG17 exato dentro do sandbox E2B,
  localhost/Unix socket, porta 5432 jamais exposta, **sintético e efêmero** — reconstruído por
  run a partir de migrations + golden fixtures pequenas (a C-006 já exige DEV recriável; aqui a
  exigência vira mecanismo). Roda QA-DB-1/2 + smoke de browser dentro do orçamento de sessão.
- **Continua LOCAL e autoritativo**, via Capability Gateway: DEV por projeto, ETL Sankhya
  (staging+cursor+upsert com dados grandes), Data Discovery (HAR-2), QA-DB-3 (rehearsal com
  dump sanitizado), validação final pré-deployment e hub_control. Worker remoto **nunca** recebe
  credencial de Postgres local — dado real chega a ele só como fixture sanitizada mínima ou
  evidência estruturada produzida pelo Gateway.
- **Probes de paridade** (itens do `CX-SBX-E2B-01`): mesmas extensões, ICU/collations pt-BR,
  roles com testes negativos, tempo initdb+migrations+fixtures dentro do orçamento, pico de
  RAM/disco, teardown limpo.
- Drift entre `BuildValidationDatabase` e DEV é impossível por construção: ambos nascem das
  mesmas migrations + fixtures versionadas; qualquer divergência reprova no gate do hub.
