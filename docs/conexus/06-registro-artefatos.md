# Tópico 5 — Registro de artefatos + 2 SDKs

**Status: DECIDIDO — C-005, ratificado pelo operador em 2026-08-11.**
Fontes: acervo Mitra ([02-registro-artefatos](../reference/mitra/02-registro-artefatos.md)) + 2
pesquisas web independentes (AI builders: Lovable/Bolt/v0/Replit/Riff/Base44/Anything; code-first:
Convex/Windmill/Supabase/Hasura/PostgREST/Trigger.dev/Retool/Prisma/Atlas/Flyway — fontes
primárias, 2026-08-11) + revisão adversarial externa em 2 rodadas (Codex `gpt-5.6-sol`, reasoning
xhigh: 6,5/10 inicial → 8,5/10 "aprovada tecnicamente" após ajustes) + corte anti-overengineering.
Herda [C-002](04-runtime-agente.md) (hub soberano), [C-003](03-requisitos.md) (piso REG-1..5) e
[C-004](05-sandbox.md) (Capability Gateway, credencial nunca no sandbox).

## A decisão em uma frase

**Artefato executável é arquivo no repo git do projeto; merge da branch validada dispara um
deployment atômico que o ativa num registry imutável; um parser pinado compila `:param` para bind
real com inputSchema validado antes de executar; e dois SDKs separam o poder de construir
(sandbox, via Capability Gateway) do poder de executar (app publicado, `execute(slug, input)`).**

## Contexto da escolha

- Mitra prova o conceito (registry + input, envelope, async/stop, 2 SDKs) mas com defeitos
  documentados: id numérico (gambiarra `sf-ids.ts`), 3 sintaxes de binding todas por interpolação
  (SQL injection real), zero validação de input, zero versionamento (update vale na hora, sem
  rollback — o "script idempotente" do agente é muleta de versão).
- Regra do operador para o tópico: validar tudo contra Mitra (provada), Factory (robusta) e
  global maximum (melhor prática de mercado).

## Evidência-chave

| Fato | Fonte |
|---|---|
| Arquivo-no-repo domina: 7/7 AI builders têm agente escrevendo arquivo; Convex deriva nome da função do path; Windmill versiona por hash imutável; Trigger.dev tem versão atômica por deploy + promote. Registro-via-API (estilo Mitra) é minoria no-code | pesquisas 2026-08-11 |
| Precedente exato de "merge dispara deploy": Supabase Branching + GitHub (merge aplica migrations + deploya functions; required check bloqueia inválida) | supabase.com/docs (2026-08-11) |
| Bind real é default universal: Retool/Appsmith/Superblocks convertem `{{ }}` em prepared statement; PostgREST/Hasura 100% parametrizado; interpolação só existe como opt-out marcado perigoso | docs primários (2026-08-11) |
| Nenhum AI builder enforça bind params (proteção = ORM+RLS, e falha: CVE-2025-48757, 170+ apps Lovable expostos). Validação obrigatória de args: só Convex; Windmill não valida por default | pesquisas 2026-08-11 |
| DDL ad-hoc em produção não é sancionado em lugar nenhum (Prisma db push / Drizzle push / Atlas declarativo = dev; produção = migration file + histórico + checksum). Atlas híbrido: DDL livre em dev, `migrate diff` gera arquivo p/ produção | docs primários (2026-08-11) |
| Codex xhigh (2 rodadas): derrubou upsert-por-artefato (estado meio-deployado), versão=SHA-do-repo (README criaria versão de query), `executeArtifact` testando versão ativa em vez do candidato, rollback de ponteiro com migration (DDL não volta), kind-como-label (query pode escrever via CTE). Convergiu em 8,5/10 com deployment atômico + roles reais | sessão Codex 2026-08-11 |

## Decisão por componente

| # | Componente | Decisão |
|---|---|---|
| 1 | **Git-first** | Artefato é ARQUIVO no repo do projeto (`artifacts/dash_por_cliente.query.sql`). Slug = nome do arquivo, único por projeto. Sem id numérico, sem `sf-ids.ts`, sem API de registro — agente só escreve arquivo. |
| 2 | **Versão dupla** | `sourceCommitSha` (proveniência) + `artifactRevisionDigest` (sha256 do conteúdo normalizado — commit de README não cria revisão de query). Registry guarda payload compilado IMUTÁVEL, não ponteiro pra git. |
| 3 | **Registry único com kinds** | Uma tabela de artefatos, kinds `query`/`action`/`job`/`integration`. Mesmo envelope e lifecycle. Kind escolhe executor e ROLE REAL de banco (não é label): query → role+transação read-only; action → DML-only (zero DDL/GRANT/ownership); migration → role separada; integration → allow-list de host do conector; job → fila com timeout/retry/lease, efeitos sempre via Gateway. |
| 4 | **Parâmetros** | Sintaxe única `:param` compilada para placeholder real do driver — NUNCA interpolação. Parser: gramática deliberadamente limitada (single statement, sem identificador dinâmico, IN via `= ANY(:array)`) validada por biblioteca SQL estabelecida e pinada; `::type` cast suportado. Idioma opcional `(:x IS NULL OR col = :x)` mantido (conveniência documentada). |
| 5 | **inputSchema obrigatório** | JSON Schema (draft pinado) no cabeçalho do arquivo; runtime valida ANTES de executar; `additionalProperties:false` default; limite de tamanho/profundidade pré-validação; erro tipado no envelope (código estável + fase + parâmetro). Job/integration recebem objeto tipado — sem globals `event.x`. Ativação exige: cabeçalho parseia, todo `:param` declarado no schema, kind válido. |
| 6 | **Deployment atômico** | Merge da branch validada (QA já rodou suíte no commit exato) DISPARA deployment; ativação = troca atômica de ponteiro por ambiente (compare-and-swap, geração monotônica, fila serializada por ambiente). Manifesto é conjunto completo: artefato fora dele sai do ativo. 1 artefato inválido → nada ativa. Registry no mesmo Postgres do hub → tudo em 1 transação. Verificação mecânica pós-promoção (deploymentId, geração, digest, payload disponível). |
| 7 | **Migrations** | Arquivos timestamp em `migrations/`, imutáveis (checksum divergente REJEITA), tabela de histórico no banco. Ordem: compila bundle → migra → troca ponteiro. Falha de migration mantém deployment anterior ativo (DDL Postgres é transacional → rollback grátis); migration ok + promoção falha = estado recuperável, repete sem reaplicar. Header declara `compatibility: backward-compatible \| maintenance-required`. DEV 100% recriável das migrations — QA reprova drift (runDdl de iteração não pode divergir do conjunto). |
| 8 | **Rollback** | Ponteiro volta pra deployment anterior SÓ quando não há migration no meio (caso comum: artefato/frontend). Com migration: roll-forward (preferência documentada) ou restore de backup. Expand/contract N/N-1 = recomendação ao builder, não gate. |
| 9 | **SDK de build** (sandbox, token do ActorRun, tudo via Capability Gateway) | `runDdl`/`runDml`/`runQuery` SÓ contra banco DEV do projeto; `executeCandidate(slug, input)` compila e executa o arquivo exato do workspace em DEV (nunca o registro ativo). Sem API de criar/atualizar artefato. Credencial de banco nunca no sandbox (C-004). |
| 10 | **SDK de runtime** (app publicado) | `execute(slug, input)` → valida schema → bind → envelope; `executeAsync`/`status`/`stop` (estados `cancel_requested`/`cancelled`/terminado). Request autenticada; projeto/app/deployment derivados SERVER-SIDE ou de token assinado — nunca aceitos do browser; allow-list de slugs = manifesto do deployment; SDK nunca carrega token amplo de projeto. |
| 11 | **Envelope** | `{executionId, status, error?, output}` — união discriminada (success×failed nunca coexistem). Serialização GLOBAL definida (decimal→string, timestamp→ISO 8601, bigint→string) — mata o normalizador defensivo de 3 formas da Mitra. Contrato de coluna `name/value/code` p/ gráficos mantido (detalhe no tópico 8). Execução grava deploymentId + artifactRevision usados; version-locking: execução em andamento (e retries de job) termina na revisão em que começou. |
| 12 | **Versão de app** | Release = deployment (frontend + artefatos co-versionados no mesmo repo); sem tabela separada na fase 1. Tag de release + versão visível no app: mecânica no tópico 11. |
| 13 | **Removal conditions (gatilhos fase 2, congeladas)** | **RC-1** segundo tenant/usuário externo/grupos com permissões distintas → audience por artefato + tenant binding. **RC-2** primeiro artefato com dado sensível ou conector de efeito financeiro/destrutivo/irreversível → capabilities/effects declarados + budgets. **RC-3** QA≠PROD topológico, deployments concorrentes, zero-downtime/SLA ou primeira migration não-transacional sem janela → STAGING + smoke pós-deploy + gate expand/contract obrigatório. |

## Mitra: o que sobrevive e o que morre

ADOPT preservado: registry+input, envelope com executionId, async/stop, fronteira 2 SDKs (poder
no build), fragmentos SQL compostos (vivem nos arquivos-fonte), cross-filter "SF de X nunca recebe
`:x`" + `name/value/code` (tópico 8), parâmetro opcional. REJECT corrigido: id numérico → slug;
3 bindings por interpolação → 1 sintaxe com bind real; sem versão → digest+deployment; job-string
→ arquivo; provisionamento idempotente como muleta → git+deployment entregam o mesmo estado
reproduzível nativamente.

## O que NÃO vamos fazer (anti-overengineering, gatilho registrado)

- **Não** outputSchema obrigatório por artefato — serialização global + `name/value/code` bastam
  (gatilho: primeiro consumidor externo do envelope).
- **Não** capabilities/effects/policy engine por artefato (RC-2).
- **Não** DNS pinning/bloqueio de metadata endpoint — fase 1a é local; entra com o gatilho de
  nuvem da C-004 (allow-list de host por conector já vale).
- **Não** STAGING, smoke pós-merge, análise estática de compatibilidade de schema (RC-3).
- **Não** atestação de CI/toolchain no manifesto — deployment grava SHA + versão do compilador.
- **Não** codegen de tipos (`conexus types`) dentro do C-005 — assunto do template, tópico 8.
- **Não** tombstone/alias de rename — manifesto-conjunto-completo resolve; frontend co-versionado
  não quebra par.

## Consequências

- Tópico 6 (camada de dados) herda: DEV+PROD por projeto, DEV recriável das migrations, roles por
  kind, histórico de migrations; candidato a avaliar: rollback código+dados estilo Replit/Neon.
- Tópico 8 (scaffold) herda: cross-filter + `name/value/code` como convenção do layer de
  visualização; codegen de tipos no template.
- Tópico 11 (ciclo de vida) herda: release=deployment, tag, versão visível no app, DEV→PROD.
- Tópico 12 (runtime publicado) herda: auth do `execute` (derivação server-side já normativa).
- Builder (C-002) ganha: `executeCandidate` no Actor Pack; prompt recomenda expand/contract.
