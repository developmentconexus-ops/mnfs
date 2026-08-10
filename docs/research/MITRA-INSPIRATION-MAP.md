---
id: DOC-RESEARCH-MITRA-INSPIRATION-MAP
title: Mitra Inspiration Map
document_type: research_map
form: explanation
authority: research_historical
status: draft
version: 0.4.0
owners:
  - developmentconexus-ops
source_of_truth_for:
  - classification of Mitra platform patterns for MNFS
related:
  - DOC-RESEARCH-FIRSTMATE-INSPIRATION-MAP
  - DOC-PRODUCT-BLUEPRINT
last_reviewed: 2026-08-10
---

# Mitra Inspiration Map

> Idioma: PT-BR intencionalmente (documento de estudo do Operador). Frontmatter e classificação seguem o padrão do repo.

## 1. Propósito e método

Mitra (`agent.mitralab.io`) é uma plataforma cloud brasileira de app-building por prompt ("code-builder"), voltada a apps de negócio (foco ERP: Sankhya, TOTVS Protheus, Omie). Este documento registra o que foi **observado ao vivo** em 2026-08-10, numa sessão real: exploração completa da UI, criação de um app do zero por prompt único, e leitura do código/artefatos gerados.

Método e nível de evidência:

```text
OBSERVADO   visto diretamente na UI, no código gerado ou em request de rede
INFERIDO    conclusão forte a partir de evidência indireta (marcado como tal)
```

Projeto de teste: workspace 146638, projeto 55749 ("Teste"). Prompt usado: app de controle de ordens de serviço para metalúrgica (lista + formulário + dashboard + persistência). Resultado: app completo, testado e publicado para a equipe em ~16 minutos, com 2 bugs reais encontrados e corrigidos pelo próprio agente durante o build.

## 2. Fato central: a harness é Claude Code sobre sandbox E2B

Evidências (todas OBSERVADO, salvo indicação):

- Endpoint de rede `GET /api/e2b-git/{workspaceId}/{projectId}/metadata` → sandbox **E2B** com git por projeto.
- Arquivo **`CLAUDE.md`** na raiz do projeto gerado — o mecanismo de instruções de projeto do Claude Code.
- O agente usou **ToolSearch** (tool nativa do harness Claude Code) com query "mitra project context think question" — tools da plataforma são deferidas e carregadas sob demanda.
- Checklist de execução idêntico ao padrão TodoWrite (itens com checkbox, atualizados ao vivo).
- Configurações → IA → "Claude OAuth: conecte sua assinatura Claude Pro/Max… **Claude Code** — Desconectado — **Conectar via CLI**". A plataforma usa a subscription do usuário via OAuth do Claude Code em vez de créditos de API.
- Working directory do agente: `/home/user/w-146638/p-55749/` (padrão `w-{workspace}/p-{project}` — INFERIDO: múltiplos projetos por sandbox ou naming convention de isolamento).
- Seletor de modelo por mensagem: "Claude Opus 5 Medium/High/xHigh, Sonnet 5 Medium/High/xHigh, Opus 4.8, 4.7" sob o grupo "Anthropic Subscription" — modelo × **reasoning effort** exposto como produto.
- Providers alternativos por API key: Anthropic, OpenAI, GLM (Zhipu), OpenRouter; OAuth de subscription: Claude e OpenAI.
- Telemetria por task exibida ao final: `in: 8.3M · out: 76.6K · cache: 8.3M` tokens.

Implicação para MNFS: valida a tese ARR de rodar uma harness de agente comercial (Pi-first no nosso caso) dentro de um envelope de execução controlado, com instruções de projeto injetadas por arquivo e tools da plataforma expostas como MCP/tool registry deferido.

## 3. Arquitetura do produto (visão de plataforma)

### 3.1 Anatomia de um projeto

| Recurso | O que é (OBSERVADO) |
|---|---|
| Builder (Preview/Código) | Preview live do app + file tree/editor read-only dos arquivos do sandbox |
| Database | MySQL gerenciado por projeto ("Mitra MySQL"), SQL Editor, tabelas do usuário + tabelas nativas `INT_*` (`INT_ACTION`, `INT_ACTIONLOG`, `INT_DMLACTION`…) com log de ações da plataforma no próprio banco |
| Server Functions | Funções de servidor (tipo SQL no app observado) criadas pelo agente via SDK; identificadas por ID numérico; parametrização mustache `{{param}}` |
| Integrações | Templates de auth custom (Basic/Bearer/API Key) + apps prontos (Sankhya, Sankhya Gateway ± Sandbox, TOTVS Protheus, Omie, HubSpot, Stripe, Mercado Pago, Supabase, AllStrategy) + **Mitra Project** (integração projeto→projeto) |
| Membros & Acessos | Usuários do app final + Perfis (roles) |
| Drive | Storage de arquivos por projeto, com toggle "Permitir upload público" |
| Configurações | Geral (nome/logo/cor), Web (domínio `{ws}-{proj}.prod.mitralab.io` + domínio próprio), IA, Integração (API keys do projeto), E-mails (transacional embutido: DKIM, templates de convite/reset com variáveis `$link`, `$emailUsuario`, `$projeto`, remetente do SDK `sendEmailMitra`) |
| Agent | Painel de chat lateral onipresente + lista de **Tasks** (cada conversa = task com status vivo; "Nova Task" sugere paralelismo) |
| Terminal embutido | Botões ocultos na UI: "New terminal", dock left/bottom/right, "Switch to UI Mode" (OBSERVADO no DOM; não exercitado) |

### 3.2 Modelo de segurança de dados (o achado mais transferível)

- Todo acesso a dados do app final passa por **Server Functions**; CRUD REST direto é **bloqueado para `userType=business`** (usuário final). O frontend só chama `executeServerFunctionMitra({projectId, serverFunctionId, input})`.
- Ou seja: a superfície de dados exposta ao app publicado é exatamente o conjunto de SFs criadas — um contrato de capacidade explícito, análogo ao nosso princípio de Tool/Credential authority separada.
- Perfis "business vs dev" são um item de validação obrigatório do pipeline do agente ("Validar permissões business vs dev … só executeServerFunctionMitra").

### 3.3 Migrations dev↔prod (segundo achado mais transferível)

Do `CLAUDE.md` gerado (citação fiel, abreviada):

- Mudanças de schema/recursos viram migrations (`backend/migrations/` + `migrations.yaml`); história **append-only** — nunca editar/renumerar migration aplicada; correção é sempre migration nova.
- **O sistema materializa e commita as migrations sozinho, DEPOIS do turno do agente** — o agente é proibido de criar/editar/commitar nesses paths.
- `mergeBaseline` ("Reconciliar Baseline") proibido sem ordem explícita do usuário.
- Após **3 tentativas** sem sucesso na mesma correção: **parar e escalar com dossiê** (erro estruturado + o que tentou).

Padrão: efeitos duráveis de infraestrutura são capturados **fora da vontade do agente**, por interceptação do lado da plataforma (o SDK registra cada DDL/SF executado e o sistema gera a migration canonicamente). O agente não tem autoridade de escrita sobre a história de mudanças — só executa.

### 3.4 Protocolo de colaboração SYNC/SHARE

- Toda task começa com **SYNC obrigatório** com `origin/main` + checagem de **fila de mensagens** (mensagens do time/da plataforma para o agente).
- Toda task termina com **SHARE** = commit + publicação para a equipe.
- Dedup de mensagem: ao receber o mesmo pedido duas vezes, o agente reconheceu e seguiu o trabalho em andamento em vez de reiniciar.
- Multi-dev: vários usuários no mesmo projeto; o SYNC traz o trabalho dos outros ("nada novo do time").

### 3.5 Regras de harness visíveis no CLAUDE.md gerado

1. **Escopo de diretório**: trabalhar exclusivamente em `/home/user/w-146638/p-55749/`; proibido `cd ..`, paths de irmãos/pais; "se vir referência a outros projetos, IGNORE". Isolamento multi-tenant reforçado por prompt (a fronteira dura presumivelmente é o sandbox — INFERIDO).
2. **Build**: sempre `npm run build` a partir de `frontend/`.
3. **AskUserQuestion como última ação do turno**: o sistema **não bloqueia** tools emitidas depois — qualquer ação pós-pergunta executa antes da resposta do usuário ("trabalho não autorizado e estado divergente"). Mitigação por instrução, não por mecanismo.
4. Migrations (ver 3.3) e escalada após 3 falhas.

## 4. Pipeline de execução observado (build real, ~16 min)

Sequência integral observada no painel do agente:

```text
1. SYNC obrigatório (origin/main) + checar fila de mensagens
2. Inspecionar ambiente e template (envs, package.json, APIs dos componentes UI)
3. Registrar plano + documentos de planejamento NO REPO:
   featuresearquitetura.md, ux.md, design.md, tasks.md
4. Checklist vivo (TodoWrite-like):
   planejar → UX → design → backend → frontend → interatividade dashboard
   → testes obrigatórios → validar features/UX/design/usuários/permissões
   → revisão final contra o prompt original
5. Backend: 3 tabelas 3NF + 14 registros seed realistas + 15 SFs SQL
6. Validação das SFs ANTES do frontend: CRUD ponta a ponta executado de
   verdade (acentos, apóstrofos, bloqueio de exclusão com FK)
7. Frontend: paleta → camada de dados → telas → rotas/título/favicon
8. Auto-revisão em código: encontrou bug de cross-filter (filtro por índice
   quebra com reordenação) e refatorou para filtro por valor
9. Build + lint limpos → smoke test: serve o build e reproduz a sequência
   exata de chamadas que a UI dispara → achou 2º bug (WHERE anulando
   LEFT JOIN numa SF) → corrigiu
10. Validações finais (sessão/logout: checou se a API existe na versão do
    SDK antes de usar — "stopTracking não existe; closeChatMitra existe")
11. SHARE (commit + publicação para a equipe)
12. Relatório final: o que construiu, o que corrigiu, e LIMITAÇÃO HONESTA:
    "não há navegador neste ambiente, então não cliquei na interface —
    validei compilação, arquivos servidos e camada de dados; a renderização
    você confirma no preview"
13. Oferta de próximo passo COM pedido de autorização (ativar IA para
    usuário final exige definir perfis/permissões → decisão do usuário)
```

Os documentos de planejamento ficam versionados no repo do projeto e o `tasks.md` final registra: tabela de tasks com status/output, **log de correções com causa raiz**, revisão item-a-item contra o prompt original, e seção "Não incluído (a combinar com o usuário)".

## 5. Artefatos gerados (estrutura)

```text
/home/user/w-146638/p-55749/
├── CLAUDE.md                  # regras de harness por projeto
├── featuresearquitetura.md    # arquitetura + modelo de dados + regras
├── ux.md                      # fluxos por tela, estados obrigatórios
├── design.md                  # paleta (CSS vars), componentes, refs
├── tasks.md                   # registro durável de execução
├── backend/
│   ├── setup-backend.mjs      # DDL + seed + SFs via mitra-sdk
│   ├── update-dash-por-status.mjs  # correção = script novo (append-only)
│   └── .env(.example)         # MITRA_BASE_URL, MITRA_TOKEN, MITRA_PROJECT_ID
└── frontend/                  # React 19 + TS + Vite + Tailwind 4
    └── src/
        ├── lib/api.ts         # registro de SFs por ID + callSF/callSFWrite
        ├── lib/mitra-auth.ts  # auth nativa da plataforma
        ├── components/ hooks/ pages/
        └── ...
```

SDKs observados:

- **`mitra-sdk`** (backend/dev, `^1.0.58`; observado no app, npm latest `1.0.62`): SDK "completo" com **70 funções** — schema/JDBC/query, Server Functions, integrações, e-mail, tunnels, deploy, perfis, DataLoaders. Depende de `mitra-interactions-sdk`.
- **`mitra-interactions-sdk`** (frontend/runtime, `1.0.61`; npm latest `1.0.63`): SDK "agnóstico" com **60 funções** — execução de SF, CRUD de records, integrações, auth, variáveis, upload, perfis, e controle programático do próprio agente.

Superfície **completa** dos dois SDKs (extraída dos `index.d.ts` do npm), integrações externas (Sankhya) e dispatch de e-mail/WhatsApp no **Anexo técnico (seções 11–12)**. Assinaturas confirmadas e arquitetura do template na seção 11.

## 6. Qualidades do produto dignas de nota

- **Template rico pré-carregado**: biblioteca de componentes (`Button`, `Modal`, `Chart`/Shadcn, `Toast`, `ConfirmDialog`…), `LoginPage` com SSO, auth nativa — o agente monta sobre uma base auditada em vez de gerar UI do zero.
- **Seed data realista por domínio** (usinagem, caldeiraria, estruturas metálicas) — o preview nasce demonstrável.
- **Progresso narrado em linguagem de produto** (frases curtas por fase) com trace de tools expansível — o Operador leigo entende, o técnico audita.
- **Preview com estados** ("Materializando…", "Construindo sua ideia…", "Quase lá…") e botão "Atualizar" ao concluir.
- App final: cross-filter/drill no dashboard, paginação, validação inline, empty/loading states obrigatórios via `ux.md`.

## 7. Classificação para MNFS

Vocabulário: `OWN / ADOPT / ADAPT / SPIKE / REFERENCE / DEFER / REJECT` (CAPABILITY-REALIZATION-METHOD).

| Padrão Mitra | Classificação | Tratamento MNFS |
|---|---|---|
| Harness comercial (Claude Code) dentro de envelope próprio | REFERENCE | Valida a direção ARR (Pi-first); não muda a seleção S1 — OpenCode ACP challenger segue exigido |
| Sandbox cloud E2B por projeto | REFERENCE | ARR-S0/S2 já excluem KVM/Docker no host atual; E2B é dado de mercado, não candidato aceito |
| Instruções por arquivo no workspace (CLAUDE.md por projeto) | ADOPT | Equivalente ao nosso Context Pack materializado no WriteTrack; barato e auditável |
| SYNC obrigatório no início + SHARE no fim do turno | ADAPT | Mapeia para reconciliation de abertura + integração/entrega explícita; em MNFS a entrega exige envelope aprovado, não é automática |
| Fila de mensagens agente↔plataforma com dedup | ADAPT | Já temos `MnfsMessage`; o dedup de pedido repetido é um comportamento a especificar no Lead |
| Migrations append-only materializadas PELO SISTEMA após o turno | ADOPT (princípio) | Forte alinhamento com proof-first e com autoridade separada: efeito durável capturado por interceptação, fora da vontade do Worker; candidato a padrão para efeitos de schema/infra do M2+ |
| Agente sem autoridade de escrita sobre história de mudanças | ADOPT (princípio) | Já é nosso invariante (Worker completion ≠ acceptance); Mitra mostra uma materialização mecânica elegante |
| Escalada após 3 tentativas com dossiê estruturado | ADOPT | Regra simples e barata para Role Contracts de Writer/Investigator |
| AskUserQuestion deve encerrar o turno (mitigação por prompt) | REFERENCE + STRENGTHEN | MNFS deve preferir bloqueio mecânico (harness/gate) a instrução; a fraqueza confessa do prompt-only é o argumento |
| Pipeline fixo com gates de validação embutidos no system prompt (validar features/UX/design/permissões + revisão contra o prompt original) | ADAPT | Nosso análogo é o contrato de validação por milestone; a "revisão final contra o prompt original" é um gate barato a considerar no fechamento de Feature |
| Documentos de planejamento versionados no repo do produto (ux.md, design.md, arquitetura, tasks.md) | ADOPT | Já fazemos (Execution Brief, Evidence); o `tasks.md` com log de correção + causa raiz é um bom formato mínimo |
| Validação de backend ANTES do frontend, executando de verdade (acentos/FK) | ADOPT | Proof-first puro; reforça TEST como deciding proof |
| Smoke test que reproduz a sequência de chamadas da UI sem navegador + reporte honesto do que NÃO foi testado | ADOPT | Padrão de honestidade de Evidence: declarar limites do proof no relatório final |
| Toda a superfície de dados do app final atrás de Server Functions (CRUD REST bloqueado para business) | REFERENCE | Análogo de capability contract; MNFS não é app-builder, mas o princípio "superfície = contratos explícitos" já é nosso |
| Modelo × reasoning effort como seletor de produto por mensagem | REFERENCE | Interessante para o futuro painel do Operador (custo/qualidade por dispatch) |
| Subscription OAuth (Claude Pro/Max via Claude Code CLI) no lugar de API credits | REFERENCE | Relevante a custo de operação; decisão comercial, não de arquitetura |
| Telemetria de tokens por task (in/out/cache) exposta na UI | ADOPT | Barato e alinhado ao Operator Observability; registrar por Worker Run |
| Tabelas nativas `INT_*` (log de ações da plataforma no banco do projeto) | REFERENCE | Nosso análogo é SQLite operacional; não misturar com dados de produto |
| Template de app + component library + seed data realista | DEFER | Só faz sentido quando MNFS tiver um produto de geração; não é o caso |
| Integrações ERP BR prontas / e-mail transacional / Drive / domínios | REJECT (para MNFS) | Feature de app-builder SaaS, fora do domínio MNFS |
| Terminal embutido oculto + "UI Mode" | REFERENCE | Sinal de ferramenta dev-mode progressiva na mesma superfície |

## 8. Lições diretas para a nossa harness

1. **Interceptação > instrução para efeitos duráveis.** O ponto mais forte do Mitra: DDL/SF viram migration por interceptação do SDK, commitadas pelo sistema após o turno. MNFS deve preferir capturar efeitos (writes, DDL, external effects) no envelope de execução — nunca depender do agente "lembrar de registrar".
2. **Onde eles são fracos, nós já somos fortes.** A regra AskUserQuestion-por-prompt admite que o harness não bloqueia; nosso desenho de protected execution fail-closed é a resposta certa. Manter.
3. **Gates de validação como checklist embutido funcionam.** Um pipeline fixo (planejar→executar→testar→validar→revisar contra o pedido original) rendeu 2 bugs reais encontrados e corrigidos sem intervenção. O gate "revisão final contra o prompt original" é barato e candidato a entrar no fechamento de Feature.
4. **Reporte de limitação como cidadão de primeira classe.** "O que não consegui testar" no relatório final é exatamente a semântica de `ACCEPT_WITH_LIMITATIONS` — vale padronizar essa seção em toda Evidence de Worker.
5. **Dossiê de escalada após N falhas.** Regra mecânica (3 tentativas → parar + dossiê estruturado) evita loop de correção infinito; fácil de adicionar aos Role Contracts.
6. **Narração em duas camadas** (frase de produto + trace técnico expansível) é o formato certo para o painel do Operador — já alinhado com "short messages pointing to artifacts".
7. **SYNC/SHARE dá nome simples a um ciclo que já temos** (reconcile na abertura, integração explícita no fim). Nomes simples ajudam Role Contracts.

## 9. Questões em aberto (para eventual segundo passe)

- Terminal embutido: que acesso dá ao sandbox? (não exercitado)
- "Gerenciar Modelos" e perfis de IA para usuário final: como as permissões de tools em linguagem natural ("ensine a IA a usar as tools") são aplicadas em runtime?
- Fila de mensagens: formato, quem produz (só usuários? plataforma? outros agentes?).
- `migrations.yaml`: schema exato (não visível — gerado após o turno; a pasta não apareceu no file tree da UI durante a sessão).
- Publicação de produção ("Publicar") vs SHARE de equipe: pipeline de promoção dev→prod e papel das migrations na promoção.
- Se dois devs disparam tasks concorrentes no mesmo projeto: como o SYNC resolve conflito de branch/estado?

## 10. Registro de evidências

- Sessão: 2026-08-10, projeto `w/146638/p/55749` ("Teste"), operador logado.
- Build observado: prompt único 13:19 → concluído ~13:35; telemetria final `in: 8.3M · out: 76.6K · cache: 8.3M`.
- Rede: `GET /api/e2b-git/146638/55749/metadata`; namespace `/api/mitra-agent/*` (connections/registry, connections/models, auth/claude/status, files?folder=output).
- Domínio de produção gerado: `https://146638-55749.prod.mitralab.io` (status Ativo).
- Citações do CLAUDE.md, tasks.md, featuresearquitetura.md, ux.md, design.md, setup-backend.mjs e frontend/src/lib/api.ts transcritas nas seções 3–5 a partir do file viewer da plataforma.
- App resultante verificado manualmente no preview: criação de ordem (#16) refletida em lista e dashboard em tempo real.
- Extração de código por engenharia reversa (2026-08-10, segundo passe): árvore de arquivos e corpos completos obtidos via endpoint `GET /api/mitra-agent/github-files/146638/55749` (tree) e `/content?path=<url-encoded>` (corpo). Backend (`setup-backend.mjs`, `update-dash-por-status.mjs`, `.env.example`) e frontend (`mitra-auth.ts`, `App.tsx`, `main.tsx`, `api.ts`, `utils.ts`, `useHighlight.ts`, `package.json`, `vite.config.ts`, `index.html`, `README.md`) lidos na íntegra. Detalhe técnico consolidado na seção 11.

## 11. Anexo técnico — engenharia reversa

> Segundo passe (2026-08-10): corpos de arquivo extraídos na íntegra. Identificadores em inglês preservados como no código. Este anexo é a base direta para a nossa harness.

### 11.1 SDK — assinaturas confirmadas

`mitra-sdk` (backend/dev):

```js
configureSdkMitra({ baseURL, token, integrationURL })
runDdlMitra({ projectId, sql })
createRecordsBatchMitra({ projectId, tableName, records: [ {...}, ... ] })
createServerFunctionMitra({ projectId, type: 'SQL', name, description, code })
listServerFunctionsMitra({ projectId })            // → { result: [ { id, name, ... } ] }
updateServerFunctionMitra({ projectId, serverFunctionId, description, code })
```

`mitra-interactions-sdk` (frontend/runtime) — subconjunto usado no app; superfície completa na §12.2:

```js
configureSdkMitra({ baseURL, token, integrationURL?, projectId, authUrl, onTokenRefresh })
executeServerFunctionMitra({ projectId, serverFunctionId, input })
closeChatMitra()                                   // sessão/logout
```

> Correção do 1º passe: `sendEmailMitra` **não** está no SDK runtime — está no SDK **dev** (`mitra-sdk`). Ver §12.4.

Observação de disciplina do agente: antes de usar uma API de sessão ele **checou se ela existe na versão instalada** ("`stopTracking` não existe; `closeChatMitra` existe"). Verificar contrato de SDK contra versão antes de chamar é comportamento reprodutível para os nossos Role Contracts.

### 11.2 Backend setup — padrão canônico

Env auto-populado **pelo servidor** (nunca hardcoded): `MITRA_BASE_URL`, `MITRA_BASE_URL_INTEGRATIONS`, `MITRA_TOKEN`, `MITRA_PROJECT_ID`, `MITRA_WORKSPACE_ID`.

Fluxo de `setup-backend.mjs` (um único script idempotente-por-intenção):

```text
configureSdkMitra(env)
→ runDdlMitra × N            (CREATE TABLE 3NF, com FOREIGN KEY)
→ createRecordsBatchMitra    (seed por tabela, em ordem de FK)
→ const sfs = [ { name, description, code }, ... ]   (array declarativo)
→ for (sf of sfs) createServerFunctionMitra({ type: 'SQL', ...sf })
→ listServerFunctionsMitra   → monta mapa { name: id }
→ console.log(JSON.stringify(mapa))   // IDs p/ hardcode no frontend
```

Correção de SF **não** reexecuta o setup (isso recriaria o schema e apagaria dados) — é um **script separado** (`update-dash-por-status.mjs`) chamando `updateServerFunctionMitra({ serverFunctionId, ... })`. Ou seja: mesmo no lado de dev, a prática é **append-only por script**, espelhando a política de migrations da plataforma (seção 3.3).

### 11.3 Server Function — templating SQL + mustache

Placeholders mustache `{{param}}` interpolados no SQL. Idioma de filtro opcional (o valor vazio desliga o filtro):

```sql
('{{status}}' = '' OR S.NOME = '{{status}}')
```

Consts reaproveitadas entre SFs (DRY no gerador):

```js
const F_STATUS  = "('{{status}}' = '' OR S.NOME = '{{status}}')";
const F_CLIENTE = "('{{cliente}}' = '' OR C.NOME = '{{cliente}}')";
const WHERE_LISTA = `WHERE ('{{busca}}' = '' OR C.NOME LIKE '%{{busca}}%' OR ...)
                       AND ('{{statusId}}' = '' OR O.STATUS_ID = '{{statusId}}')`;
```

Paginação: `LIMIT {{limit}} OFFSET {{offset}}`. Guarda de exclusão por FK: `NOT EXISTS (...)` antes do DELETE.

**Bug real corrigido pelo agente (regra de contrato transferível):** em `dashPorStatus`, o filtro de cliente no `WHERE` externo **anulava o `LEFT JOIN`** — status sem ordens no recorte sumiam do gráfico. Correção: mover o filtro para **dentro da subquery**. O agente deixou o motivo em comentário no código-fonte. Regra destilada: *filtro opcional sobre o lado direito de um `LEFT JOIN` vai na subquery, nunca no `WHERE` externo.*

### 11.4 Frontend — arquitetura do template

Stack: React 19 + `react-router-dom` 7 + Vite 7 + Tailwind 4 (`@tailwindcss/vite`) + `recharts` 2 + `lucide-react`. `vite.config` usa `base: './'` (build com paths relativos → deploy sob subdomínio/subpath). `index.html` `lang="pt-BR"`, título setado pelo agente.

Auth (`lib/mitra-auth.ts`) — padrão de handoff de token seguro:

```text
- Token chega no FRAGMENT (#) da URL: #tokenMitra=...&backURLMitra=...&integrationURLMitra=...
  (fragment não vaza em logs de servidor nem no header Referer)
- initMitra(): lê o hash → salva sessão em localStorage ('mitra-session')
  → limpa o hash via history.replaceState → configura SDK com onTokenRefresh
    (persiste sessão renovada automaticamente)
- Fallback: sessão anterior no localStorage
- token === 'error' → limpa URL (erro já exibido pelo sdk-auth)
```

Roteamento (`App.tsx`): `useState(initMitra)` decide `configured`; HOC `protegida(pagina)` embrulha em `<Layout>` ou redireciona a `/login`; rotas `/`, `/ordens`, `/clientes`, `*→/`.

Camada de dados (`lib/api.ts`): registry `name → ID numérico` (`listarStatus:1 … dashRecentes:15`, resolvido no build do backend), `extractOutput()` normaliza a resposta, `callSF()` **lança** em `executionStatus === 'FAILED'`, `callSFWrite()` para mutações.

Hooks: `useHighlight` (seleção de índices em charts — click normal limpa+seleciona um com toggle-off; shift+click faz toggle individual; devolve `activeIndex` pronto para recharts), `useDrill` (cross-filter/drill do dashboard), `useToast`. Componentes UI pré-carregados: `Button`, `Card`, `Badge`, `Modal`, `ConfirmDialog`, `Input`, `Select`, `Radio`, `Checkbox`, `Toast`, `Chart` (wrappers Shadcn sobre recharts). O agente **compõe sobre esta base auditada** — não gera UI primitiva do zero.

### 11.5 Respostas diretas às perguntas do Operador

- **Usa Pi?** **Não.** A harness é **Claude Code CLI** rodando em sandbox **E2B**. Evidências: `CLAUDE.md` por projeto, tool `ToolSearch`, "Conectar via CLI" para OAuth Claude Pro/Max, endpoint `/api/e2b-git/.../metadata`.
- **Pesquisa na web?** **Não neste build.** Nenhum `WebSearch`/`WebFetch` observado. A query de `ToolSearch` foi `"mitra project context think question"` — carrega tools da **plataforma Mitra** + `think` + `AskUserQuestion`, não busca web. (Não exclui que exista web em outros fluxos; apenas não foi exercitado aqui.)
- **Tools da harness (mapeadas para primitivas Claude Code):** `Bash` (rótulo UI "Executando"), `Read` ("Lendo"), `Write` ("Escrevendo"), `Edit` ("Editando"), `ToolSearch` (carregamento deferido das tools Mitra), `TodoWrite` (checklist vivo), `AskUserQuestion`. **Sem `WebSearch`/`WebFetch`** neste build.
- **Método plan → build → verify (confirmado, seção 4):** plano em documentos versionados no repo → checklist vivo → **backend testado de verdade antes do frontend** (acentos, apóstrofos, bloqueio de FK) → auto-revisão em código (achou bug de cross-filter por índice) → **smoke test reproduzindo a sequência exata de chamadas da UI** sem navegador (achou o bug do `LEFT JOIN`) → relatório com **limitação honesta** do que não foi testado → SHARE (commit + publicação).

### 11.6 Superfície de rede observada (namespace)

```text
GET  /api/e2b-git/{ws}/{proj}/metadata                     sandbox E2B + git
GET  /api/mitra-agent/github-files/{ws}/{proj}             árvore de arquivos (paths + bytes)
GET  /api/mitra-agent/github-files/{ws}/{proj}/content?path=<enc>   corpo cru do arquivo
     /api/mitra-agent/connections/registry|models          providers/modelos
     /api/mitra-agent/auth/claude/status                    estado do OAuth Claude
     /api/mitra-agent/files?folder=output                   artefatos de saída
```

O endpoint `github-files` confirma **git por projeto hospedado no GitHub** por trás do sandbox — o SYNC/SHARE (seção 3.4) opera sobre esse remoto.

## 12. Superfície total dos SDKs, integrações e dispatch

> Extraído dos `dist/index.d.ts` publicados no npm (`mitra-sdk@1.0.62`, `mitra-interactions-sdk@1.0.63`). Fonte autoritativa — assinaturas e JSDoc reais. É a base direta para desenhar a camada equivalente da Conexus.

### 12.1 `mitra-sdk` (dev/backend) — 70 funções por domínio

```text
Plataforma      createMitraSdkInstance · listWorkspacesMitra · listProjectsMitra ·
                createProjectMitra · getProjectsMitra · getProjectContextMitra ·
                updateProjectSettingsMitra · getGitConfigMitra · configureSdkMitra
Instruções IA   updateAdditionalInstructionsMitra ·
                updateAdditionalBusinessInstructionsMitra
Dados/Schema    runQueryMitra · runDdlMitra · runDmlMitra ·
                listTablesMitra · createOnlineTableMitra · updateOnlineTableMitra ·
                listOnlineTablesMitra · createRecordsBatchMitra (via interactions)
JDBC externo    listJdbcConnectionsMitra · createJdbcConnectionMitra ·
                updateJdbcConnectionMitra
DataLoaders     listDataLoadersMitra · createDataLoaderMitra · updateDataLoaderMitra ·
(ETL)           executeDataLoaderMitra · deleteDataLoaderMitra
Server Fns      listServerFunctionsMitra · readServerFunctionMitra ·
                createServerFunctionMitra · updateServerFunctionMitra ·
                deleteServerFunctionMitra · getServerFunctionExecutionMitra ·
                togglePublicExecutionMitra
Integrações     listIntegrationTemplatesMitra · getIntegrationTemplateMitra ·
                createIntegrationMitra · testIntegrationMitra · testIntegrationByIdMitra
E-mail          sendEmailMitra
Perfis/Acesso   listProjectUsersMitra · manageUserAccessMitra · listProfilesMitra ·
                getProfileDetailsMitra · createProfileMitra · updateProfileMitra ·
                deleteProfileMitra · setProfileUsersMitra · setProfileSelectTablesMitra ·
                setProfileScreensMitra · setProfileServerFunctionsMitra
Arquivos        listProjectFilesMitra · getFilePreviewMitra
Tunnels         createTunnelMitra · listTunnelsMitra · getTunnelMitra ·
(on-prem reach) syncTunnelStatusMitra · syncTunnelProcessStatusMitra ·
                updateTunnelAliasMitra · deleteTunnelMitra · getTunnelRouteMitra ·
                addTunnelRouteMitra · updateTunnelRouteMitra · syncTunnelRouteStatusMitra ·
                removeTunnelRouteMitra · activateTunnelMitra · deactivateTunnelMitra ·
                stopTunnelMitra
Deploy/Promote  deployToS3Mitra · pullFromS3Mitra · getDeployStatusMitra
```

### 12.2 `mitra-interactions-sdk` (runtime/frontend) — 60 funções por domínio

```text
Config          createMitraInstance · configureSdkMitra · getConfig · resolveProjectId
Chat/IA app     openChatMitra · closeChatMitra
Auth end-user   loginMitra · loginWithEmailMitra · loginWithGoogleMitra ·
                loginWithMicrosoftMitra · refreshTokenSilently · emailSignupMitra ·
                emailVerifyCodeMitra · emailResendCodeMitra · emailLoginMitra ·
                sendPasswordResetCodeMitra · validatePasswordResetCodeMitra ·
                resetPasswordMitra
Server Fns      executeServerFunctionMitra · executeServerFunctionAsyncMitra ·
                executePublicServerFunctionMitra · executePublicServerFunctionAsyncMitra ·
                getPublicServerFunctionExecutionMitra · stopServerFunctionExecutionMitra
Dados (dev)     listRecordsMitra · getRecordMitra · createRecordMitra · updateRecordMitra ·
                patchRecordMitra · deleteRecordMitra · createRecordsBatchMitra ·
                executeDbActionMitra · executeDataLoaderMitra · runActionMitra
Integrações     listIntegrationsMitra · callIntegrationMitra
Variáveis       setVariableMitra · listVariablesMitra · getVariableMitra
Arquivos        uploadFilePublicMitra · uploadFileLoadableMitra · setFileStatusMitra
Perfis          listProfilesMitra · getProfileDetailsMitra · createProfileMitra ·
                updateProfileMitra · deleteProfileMitra · setProfileUsersMitra ·
                setProfileSelectTablesMitra · setProfileDmlTablesMitra ·
                setProfileActionsMitra · setProfileScreensMitra ·
                setProfileServerFunctionsMitra
Controle agente manageAgentChatMitra · getAgentTaskMitra · manageAgentCredentialMitra
```

### 12.3 Integração externa — como o app fala com Sankhya/Protheus/HubSpot/etc

**Nenhum ERP é método hardcoded no SDK.** Integração é genérica, por três caminhos:

**(a) REST proxy — `callIntegrationMitra`** (o primitivo universal):

```ts
callIntegrationMitra({
  projectId?, connection: string,   // slug da integração configurada no painel
  method: string,                   // GET | POST | PUT | DELETE
  endpoint?: string,                // ex: "/api/v1/pedidos"
  params?, /* query */ body?, headers?
}): Promise<CallIntegrationResponse>
```

A integração guarda `authType` + `credentials` (criada por `createIntegrationMitra({name, slug, blueprintId, blueprintType, authType, credentials})` a partir de um **blueprint/template** ou custom). O servidor injeta a auth e faz o proxy — a credencial **nunca** vai ao browser. Sankhya, TOTVS Protheus, Omie, HubSpot, Stripe, Mercado Pago, Supabase, AllStrategy são blueprints prontos; "Customizado" (Basic/Bearer/API Key) cobre o resto.

**(b) Banco direto — JDBC** (acesso profundo estilo Sankhya):

```ts
createJdbcConnectionMitra({ name, type, host, port, database, user, password })
runQueryMitra({ ... })   // SQL direto no banco do ERP
```

Sankhya expõe base relacional → o app lê/escreve por SQL, além do REST. `DataLoaders` (ETL) sincronizam esse dado para tabelas do projeto; a UI de conexão mostrava `connectionType: QUERY | CSV` e **DynamicCubeQuery** (consulta a cubo/BI).

**(c) On-premise — Tunnels.** Quando o ERP está atrás de firewall do cliente, `createTunnelMitra({alias})` + rotas (`addTunnelRouteMitra`, `activateTunnelMitra`) abrem um **túnel reverso** para a plataforma alcançar o serviço interno. Este é o mecanismo para Sankhya/Protheus on-prem.

### 12.4 Dispatch (e-mail, WhatsApp, notificações)

- **E-mail: nativo, lado dev.** `sendEmailMitra({ projectId?, to: string[], subject, body /* HTML */ })`. Mais o e-mail transacional de auth (convite/reset) da própria plataforma (templates com `$link`, `$emailUsuario`, `$projeto`).
- **WhatsApp / SMS / push / webhook / Slack: NÃO existem nativos.** Grep nos dois `index.d.ts` = 0 ocorrências. Caminho para WhatsApp = **integração custom** (`createIntegrationMitra` → Meta Cloud API/Twilio) chamada por `callIntegrationMitra`. Não há blueprint pronto de mensageria.

Implicação Conexus: dispatch multicanal (WhatsApp/SMS/push) é **lacuna** do Mitra — oportunidade de diferenciação se a Conexus tratar mensageria como capability de primeira classe (ver §7/§8).

### 12.5 Injeção de metodologia (onde mora o "system prompt")

O método plan→build→verify **não** é código no SDK do app — é o system prompt server-side do harness Claude Code, do qual só vemos a fatia por projeto (`CLAUDE.md`, seção 2–3). Os pontos de injeção observados no SDK dev:

- `getProjectContextMitra` — contexto que o agente carrega no início (schema, SFs, envs).
- `updateAdditionalInstructionsMitra` — instruções custom para o **agente dev**.
- `updateAdditionalBusinessInstructionsMitra` — instruções para a **IA voltada ao usuário final** (o chat embutido no app publicado).

Ou seja: duas camadas de instrução persistidas por projeto (dev vs business), somadas ao system prompt fixo do produto. Análogo direto do nosso Context Pack + Role Contract, mas separando audiência.

### 12.6 Controle programático do agente pelo runtime (o modelo de "task/fila")

`getAgentTaskMitra` retorna uma `AgentTaskSession`; `{create:true}` cria um chat novo e o `taskId` é preenchido após o primeiro `send()`. Há stream de eventos tipados: `AgentDeltaEvent`, `AgentToolEvent`, `AgentTurnEndEvent`, `AgentStatusChangeEvent`, `AgentQueueChangeEvent`, `AgentTaskCreatedEvent`, `AgentErrorEvent`, `AgentStatus`. `manageAgentChatMitra` (list/rename/delete) e `manageAgentCredentialMitra` sobre **`/sdk-ws`** (websocket) para credenciais OAuth (Claude/Codex).

Conclusão: a **fila de mensagens** (seção 3.4) e a lista de **Tasks** (seção 3.1) são exatamente essa `AgentTaskSession` com sua `queue` e eventos `AgentQueueChangeEvent` — o SDK expõe dirigir o agente e observar tools/turnos/fila em tempo real. É um contrato de orquestração de agente pronto, muito próximo do que a nossa harness precisa para o painel do Operador.

### 12.7 Novas linhas de classificação para MNFS

| Padrão Mitra (SDK/integração) | Classificação | Tratamento MNFS/Conexus |
|---|---|---|
| `callIntegrationMitra` (proxy REST genérico, credencial fica no servidor) | ADOPT (princípio) | Primitivo de External Effect: app nunca vê credencial; um só contrato para N provedores. Alinhado a Credential Grant + Egress authority |
| Integração por blueprint + custom (Basic/Bearer/API Key) | ADAPT | Registro de conectores; não criar abstração genérica antes do 2º consumidor real (invariante) |
| JDBC direto + `runQuery` + DataLoaders (ETL) para ERP | REFERENCE | Caminho de acesso profundo a Sankhya/Protheus; relevante se Conexus mirar ERP BR |
| Tunnels reversos para on-prem | REFERENCE + SPIKE | Como alcançar sistema do cliente atrás de firewall; candidato a spike se houver caso real |
| `sendEmailMitra` nativo; WhatsApp/SMS ausentes | ADAPT + OPPORTUNITY | Dispatch multicanal como capability de 1ª classe é diferenciação clara da Conexus |
| `updateAdditional(Business)InstructionsMitra` (instrução dev vs business) | ADOPT | Separar instrução por audiência (Operador/dev vs usuário final) é padrão limpo |
| `AgentTaskSession` + eventos (`AgentQueueChangeEvent`, `AgentToolEvent`…) | ADAPT | Contrato de orquestração/observação de agente; mapeia a Worker Run + Domain Events + painel |
| `manageAgentCredentialMitra` via `/sdk-ws` (OAuth Claude/Codex) | REFERENCE | Modelo de conectar subscription do usuário ao harness; decisão comercial |
| Perfis granulares (`setProfileSelectTables/DmlTables/ServerFunctions/Screens`) | ADOPT (princípio) | Autorização por recurso e por audiência = capability contract explícito; forte alinhamento com nossa autoridade separada |
| `deployToS3` + `getDeployStatus` (promote dev→prod) | REFERENCE | Pipeline de promoção; nosso análogo é Integration/Delivery Gate |
| Variáveis de projeto (`setVariable/getVariable`) | REFERENCE | Store de config/segredo por projeto; nosso análogo é Credential/Config authority |

## 13. `Mitra Escopo` — a camada de escopagem pré-build (specialist.mitralab.io)

> Mapeado em 2026-08-10 a partir de `specialist.mitralab.io/t/{uuid}` ("Mitra Escopo"). Ferramenta **separada** do code-builder: transforma "quero um CRM" numa **especificação técnica funcional** que depois alimenta o builder. SPA de bundle único (`index-*.js`), backend `newmitra.mitrasheet.com:8080`.

### 13.1 Achado central: o pipeline usa DOIS modelos, um por trabalho

```text
Mitra Escopo   → Google Gemini 2.5 Pro   (escopagem conversacional + geração de spec)
Code-builder   → Claude Code (Anthropic)  (build agêntico, seções 2–12)
```

Ou seja, Mitra **não usa o mesmo modelo para tudo**: um modelo conversacional barato e de alto contexto (`gemini-2.5-pro`, `temperature 0.7`, `maxOutputTokens 65536`) faz a elicitação de requisitos e gera o documento de escopo; o harness agêntico premium (Claude Code) faz a implementação. Entrada por voz é transcrita com `gemini-2.5-flash` (`inlineData` audio/webm).

Implicação forte para a nossa harness: **separar o agente de escopo/spec do agente de build**, possivelmente com modelos diferentes, é um padrão de custo/qualidade validado em produto. O artefato de escopo é o "prompt certo" de handoff entre as duas etapas.

### 13.2 Arquitetura (dogfooding — o Escopo é ele mesmo um app Mitra)

- O Escopo é um app Mitra (projeto `42949`). Sua **skill (metodologia), a chave Gemini e o modelo** ficam numa tabela do projeto, lidos em runtime por Server Function pública:

```js
executeServerFunction({ projectId: 42949, serverFunctionId: 4, input: {} })
// → result.output.rows[0] = { SKILL_MD, GEMINI_API_KEY, MODELO_GEMINI }
```

- Chamada via SDK anônimo `agentAiShortcut` (`/agentAiShortcut/executeServerFunction`, `setVariable`, `getVariable`, `runAction`) no backend `newmitra.mitrasheet.com:8080`.
- Sinal de conclusão: a IA emite a tag `[ESCOPO_FINALIZADO]` numa linha isolada ao final do documento (regex `/\[?\s*ESCOPO[_ ]FINALIZADO\s*\]?/i`).

### 13.3 System prompt (capturado verbatim do bundle)

O prompt é montado por `Ep(skillMd)`:

```text
Você é um assistente de escopagem técnica da Mitra. Seu trabalho é conduzir o
usuário pela definição do escopo técnico funcional do projeto dele, seguindo a
skill descrita abaixo.

DATA DE HOJE: {data}. Use esta data como referência temporal.

INSTRUÇÕES DE COMPORTAMENTO:
- Sempre responda em português brasileiro
- Seja profissional, objetivo e amigável
- Faça perguntas para entender completamente o projeto do usuário
- Não gere o escopo final até ter informações suficientes sobre: objetivo do
  sistema, personas/atores, regras de negócio principais, fluxos esperados
- Quando você considerar que tem informações suficientes para gerar o escopo
  completo, PERGUNTE ao usuário se ele deseja que você gere o documento de escopo
- Quando o usuário confirmar, gere o documento completo de escopo técnico
  funcional seguindo a estrutura obrigatória da skill
- Ao FINALIZAR o documento completo, inclua EXATAMENTE a tag [ESCOPO_FINALIZADO]
  em uma linha separada no FINAL da sua última mensagem
- NÃO inclua a tag antes de gerar o documento completo / em mensagens intermediárias
- Se o usuário pedir para gerar o escopo antes de ter informações suficientes,
  avise que ainda precisa de mais detalhes

SKILL DE ESCOPO TÉCNICO:
--- {SKILL_MD} ---
```

O **corpo da SKILL_MD** (a "estrutura obrigatória" do documento) fica no servidor e é servido junto com a chave Gemini secreta; não foi extraído verbatim por trazer o segredo acoplado. Sua função é definir a estrutura do documento de escopo técnico funcional — que cobre no mínimo: objetivo do sistema, personas/atores, regras de negócio, fluxos esperados (os gates de suficiência acima).

### 13.4 Método de escopagem (destilado, transferível)

```text
1. Usuário descreve o projeto em linguagem natural (texto ou voz)
2. Agente faz perguntas até cobrir 4 dimensões mínimas:
   objetivo · personas/atores · regras de negócio · fluxos
3. Gate de confirmação: PERGUNTA se pode gerar o documento (não gera sozinho)
4. Gera documento de escopo técnico funcional (estrutura fixa da skill)
5. Marca conclusão com sentinela [ESCOPO_FINALIZADO]
6. Documento vira o input de spec para o code-builder
```

### 13.5 Achados de segurança (anti-patterns a NÃO repetir)

1. **Chave Gemini exposta ao browser**: a chamada é `POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key={GEMINI_API_KEY}` feita direto do cliente — a chave trafega na URL e fica legível no DevTools/Network de qualquer visitante. Cota abusável por terceiros.
2. **Skill + chave servidas anonimamente**: `serverFunctionId 4` do projeto 42949 retorna `SKILL_MD` + `GEMINI_API_KEY` sem autenticação. Lição inversa para nós: segredo de modelo **nunca** no cliente; toda chamada de LLM passa por backend com credencial server-side (alinhado ao nosso Credential Grant / Egress authority).

### 13.6 Classificação para MNFS

| Padrão Mitra Escopo | Classificação | Tratamento MNFS/Conexus |
|---|---|---|
| Etapa de escopagem separada, antes do build | ADOPT | Agente de spec/escopo distinto do agente de build; o escopo é o contrato de handoff (nosso Context Pack/Execution Brief nasce daqui) |
| Modelo diferente por etapa (Gemini p/ escopo, Claude p/ build) | ADAPT | Roteamento de modelo por tarefa (custo/qualidade); decisão a validar, mas o princípio é forte |
| Elicitação guiada por 4 gates de suficiência (objetivo/personas/regras/fluxos) | ADOPT | Checklist barato de completude antes de gerar spec; entra no nosso Discovery→Decision |
| Gate de confirmação humana antes de gerar o documento | ADOPT | Alinhado ao nosso princípio de interrupção só para decisão/aceite do Operador |
| Sentinela de conclusão (`[ESCOPO_FINALIZADO]`) para orquestração | ADAPT | Sinal estruturado de fim-de-fase; nós preferimos evento de domínio a parsing de texto |
| Skill/metodologia versionada como dado (tabela do projeto) e injetada no prompt | ADAPT | Nossas skills já são versionadas; guardar como dado editável sem redeploy é conveniente |
| Chave de LLM no cliente / SF pública com segredo | REJECT | Anti-pattern de segurança; toda credencial de modelo fica server-side |

## 14. Experimentos observados (evidência de comportamento, não só de superfície)

Dois experimentos rodados ao vivo para capturar **comportamento** do agente, não apenas API. Fonte: conversa real do usuário no Escopo (`specialist.mitralab.io/t/b02048a6-…`) e build de migração no code-builder (`agent.mitralab.io`, projeto "controle de OS metalúrgica").

### 14.1 Escopo — saída real capturada (conversa "Conexus Sales Radar")

Input do usuário: prompt-manifesto de 23 seções (princípios anti-mock, gates, autonomia alta, data contract, score determinístico, NBA). Comportamento observado do Escopo (Gemini 2.5 Pro):

1. **Não despejou escopo.** Turno 1 = **5 perguntas de clarificação** exatamente nos 4 eixos de suficiência do system prompt (personas/visibilidade, regra de conversão "ganho", heurística do score, comportamento do feedback, gatilhos de NBA). Ofereceu inferir se o usuário preferisse.
2. Usuário respondeu pedindo recomendação ("me recomende a solução Global Maximum").
3. **Turno 2 = documento de escopo canônico de 10 seções**: Capa+metadados / Objetivo / Atores / Pré-condições (PC-01 ERP read-only Sankhya/Oracle) / Glossário / Regras de Negócio / Fluxo Principal / Fluxos Alternativos / Critérios de Aceite (12) / Pontos em Aberto.
4. **Resolveu ambiguidade inventando valores concretos**: onde o usuário deixou o score aberto, o Escopo definiu `Score = (P1*0.40)+(P2*0.40)+(P3*0.20)` com exemplos numéricos; definiu conversão via vínculo `ID_ORCAMENTO→ID_NOTA_FISCAL`; RLS `ID_VENDEDOR_ERP==ID_USUARIO_MITRA`; snooze de 24h.
5. Fecho: sentinela **"Escopo finalizado com sucesso"** → "documento salvo automaticamente" + botões **Copiar Documento / Pedir Alterações / Nova Conversa**.

**Divergência crítica a mapear**: o princípio do usuário era *"não invente dado/regra sem marcar UNRESOLVED"*. O Escopo faz o **oposto** — resolve ambiguidade com recomendação assertiva e só registra os resíduos em "Pontos em Aberto". Para Conexus isso é ADAPT com trava: gerar spec assertiva **é** desejável para velocidade, mas cada valor inventado precisa carimbo `hipótese`/`UNRESOLVED` explícito, não virar fato silencioso. O Escopo transforma gates→seções numeradas e perde a distinção fato/regra/hipótese que o usuário exigia.

### 14.2 Migração por interceptação — probe de autonomia

Base (msg 1): app de OS metalúrgica — 3 tabelas (CLIENTES, STATUS_ORDEM, ORDENS), 15 SFs SQL, dashboard cross-filter. Achou+corrigiu 2 bugs reais no próprio QA (filtro no WHERE anulando LEFT JOIN; cross-filter por índice vs por valor).

Probe (msg 2, ambiguidades plantadas de propósito): *"cada ordem precisa de VALOR e PRIORIDADE; novo KPI de faturamento; registrar propostas/orçamentos por cliente antes de virarem ordem"* — sem definir escala de prioridade, sem definir o que é "faturamento", sem moeda.

Comportamento observado:

1. **SYNC obrigatório primeiro** ("nada novo do time"), depois **orientação** (17 tool calls lendo o código existente) antes de tocar em qualquer coisa.
2. **NÃO disparou AskUserQuestion** em nenhuma das 3 ambiguidades. Resolveu tudo sozinho — confirma a metodologia de autonomia alta (interromper só em bloqueio material, não em ambiguidade de design).
3. **Migração aditiva explícita**: "Migration aditiva … sem tocar no que já existe." Adicionou colunas `VALOR`+`PRIORIDADE` em ORDENS e criou tabelas novas.
4. **Reuso consistente do padrão lookup**: PRIORIDADE virou tabela `PRIORIDADES` e status de proposta virou `STATUS_PROPOSTA` — espelhando o `STATUS_ORDEM` da base (mesma decisão de modelagem, aplicada por analogia ao código existente).
5. **Refatoração para reuso no 2º passe**: extraiu componentes compartilhados (`CurrencyInput`, `DatePicker`, `KpiCard`) e evoluiu o cross-filter de 2→3 dimensões — em vez de só empilhar código novo.
6. Mesma esteira de QA/validação da base (SFs ponta a ponta, build, lint, permissões business vs dev, revisão final contra o prompt) e SHARE no fim.

**Lições para Conexus**:
- Migração **sempre aditiva por padrão** (nunca destrutiva sem autorização) — ADOPT direto.
- Orientar-se lendo o estado atual **antes** de planejar a evolução (o SYNC+17-tools-de-leitura é barato e evita quebrar contrato existente) — ADOPT.
- Autonomia na ambiguidade **de design** é boa para velocidade, mas ver §14.1: casar com carimbo de hipótese. Para Conexus, a regra é **decidir e registrar a decisão**, não decidir em silêncio.
- Reuso por analogia ao código existente (lookup table, componentes compartilhados) é comportamento emergente forte do agente sobre um template consistente — reforça investir no **template/scaffold** como alavanca de qualidade (ADOPT: template rico → agente herda boas decisões).

## 15. Integração Sankhya ao vivo — mecanismo real (experimento 3)

Experimento decisivo para a pergunta original do usuário: *"como integraria com o Sankhya e saberia acessar tudo lá dentro"*. Rodado no projeto **Sales Radar** (ws 146638 / proj 55785). Operador colou credenciais reais de produção no chat; o agente executou a integração ponta a ponta. **Credenciais redigidas neste doc por política.**

### 15.1 Fluxo de credencial e registro da conexão

1. Operador fornece 3 segredos no chat: `x_token`, `client_id`, `client_secret` (padrão OAuth Sankhya).
2. Agente **não** hardcoda: "`.env` está no gitignore — vou usar isso para as credenciais". Segredo vai para `.env` do sandbox, fora do repo SHARE.
3. Agente lê o blueprint: template **`sankhya_oauth`**, que exige exatamente `x_token` + `client_id` + `client_secret`.
4. `testIntegrationMitra` → **"Conexão validada com sucesso no gateway de produção (`sankhya_oauth`). O sandbox recusou (401)"** — há gateway de **produção** vs **sandbox** distintos; as credenciais eram de produção.
5. `createIntegrationMitra` → integração persistida com **slug `sankhya`**.
6. Chamada de dados: **`callIntegrationMitra({ connection: 'sankhya', … })`** — o agente errou com `integrationSlug`, viu o erro e corrigiu para **`connection`** (confirma a assinatura mapeada em §12).

### 15.2 Como "sabe tudo lá dentro" — introspecção via SQL Oracle

O gateway `sankhya_oauth` expõe **execução de SQL direto contra o Oracle do ERP** ("Query rodando (Oracle)"). Não é REST de entidade nomeada — é query livre. Foi assim que o agente resolveu, **com dado real (não hipótese)**, os pontos que o Escopo deixara em aberto:

| Descoberta real no ERP do cliente | Como obteve |
|---|---|
| Orçamento = **TOP 14** (7.881 docs/12 meses) + **TOP 714** "ORCAMENTO COMISSIONADO" | `SELECT` agregado em TGFCAB por CODTIPOPER (TOP) |
| **`NUNOTAORIG` não existe** nesta base — vínculo padrão orçamento→NF ausente | introspecção de colunas de TGFCAB |
| Campos customizados `AD_VENDIDA`, `AD_STATUSNEG`, `AD_NUMNOTAORIG` carregam a semântica real (prefixo `AD_` = campo do cliente) | leitura do dicionário de colunas |
| **Ambiente multiempresa**: 1 credencial enxerga **6 schemas** de produção (`UNIPARTSPRD, ICROPPRD, ATTRAPRD, PANICEPRD, METALPRD, VASSOURASPRD`) | `SELECT` no catálogo de schemas Oracle |

Insight central: a "integração Sankhya" não é conhecimento embutido de ERP — é **conexão genérica + agente que faz Data Discovery por SQL** sobre o schema real, reconhecendo convenções Sankhya (TGFCAB/TGFTOP, TOP=CODTIPOPER, prefixo AD_ de custom fields, multiempresa por schema).

### 15.3 Achados de governança (para Conexus)

1. **Blast radius da credencial**: um único `x_token`/OAuth deu acesso de leitura a **6 empresas** de produção. Lição: no Conexus, escopar credencial por empresa/schema e registrar o alcance real no momento da conexão.
2. **Produção sem rede de proteção**: o teste bateu direto no gateway de produção do cliente. Não houve etapa de "conectar em homolog primeiro". Para Conexus: exigir seleção explícita de ambiente e marcar leituras em produção.
3. **Segredo em `.env` do sandbox + no histórico do chat**: correto não versionar, mas o segredo trafega no chat e persiste no `.env` do sandbox. Conexus deve ter canal de credencial fora do prompt (nosso Credential Grant), nunca colado no chat.

### 15.4 Classificação para MNFS

| Padrão Mitra (integração) | Classificação | Tratamento Conexus |
|---|---|---|
| Conexão genérica por blueprint (`sankhya_oauth`) + slug reutilizável | ADOPT | Registro de conexão nomeada com blueprint versionado; `connection` como handle |
| Credencial server-side em `.env` gitignored, injetada no gateway | ADOPT | Alinhado ao Credential Grant / Egress authority; segredo nunca no cliente nem no repo |
| Gateway com **SQL livre** contra o ERP | ADAPT (com trava) | Poderoso p/ Discovery, mas SQL livre em produção é risco; Conexus: read-only forçado + allowlist de tabelas/schema por perfil |
| **Data Discovery por SQL** para resolver escopo com dado real | ADOPT (forte) | Exatamente o antídoto ao "inventar regra" do §14.1: o build valida hipóteses do escopo contra o schema real antes de codar |
| Reconhecimento de convenções do ERP (TGFCAB/TOP, AD_, multiempresa) | REFERENCE | Encapsular como "perfil de ERP" plugável (Sankhya, depois outros) — conhecimento de domínio versionado, não hardcoded no agente |
| Credencial de produção colada no chat; 1 token → 6 empresas | REJECT / trava | Canal de credencial dedicado; escopo de credencial por empresa; seleção explícita de ambiente |
| Gateway prod vs sandbox distintos (401 no sandbox) | ADOPT | Separação de ambiente no gateway; default para não-produção |

### 15.5 Artefatos versionados do Discovery (extraídos do repo do projeto)

O agente materializou o trabalho em dois documentos **na raiz do repo** (`discovery-sankhya.md`, `escopo-sales-radar.md`) — spec e evidência são artefatos versionados, não só texto de chat.

**`discovery-sankhya.md`** — fatos técnicos completos:

- **Mecanismo de query**: serviço nativo Sankhya **`DbExplorerSP.executeQuery` via `/gateway/v1/mge/service.sbr`**; limite **5.000 linhas/consulta** (`burstLimit`) → paginação via SQL.
- Schema da conexão: `METALPRD` (Metal Nobre Ferragens Finas Ltda); demais 5 schemas flagados para confirmação de escopo (PA-19).
- **Vínculo de conversão real**: `TGFCAB.NUNOTAORIG` inexistente; conversão rastreada por **`TGFVAR`** (`NUNOTAORIG`→`NUNOTA`), populada (5.171 conversões/12m mapeadas por tipo de destino).
- Cursor incremental viável: `DTALTER` sem nulos. Vendedor↔usuário via `TGFVEN.EMAIL`.
- **Dado contradisse a premissa do escopo**: 67% dos orçamentos abertos (73% do valor, R$ 4,45 mi) têm +10 dias — aplicar o P2 especificado inverteria o propósito do produto. O agente **não recalibrou sozinho**: registrou como decisão de negócio (PA-16) e **bloqueou a implementação** ("Aguardando Discovery Técnico"). Contabilidade explícita: 7 PAs bloqueantes / 5 resolvidos.
- Seção de segurança auto-gerada: recomenda **rotacionar Client Secret/X-Token** por terem sido transmitidos via chat.

**`escopo-sales-radar.md` v2.0** — o build agent **reescreveu** o escopo do specialist (10→15 seções): adicionou RN-06 Explicabilidade Obrigatória, RN-07 Transparência de Origem, RN-08 Imutabilidade do ERP, seção de Riscos, Sequência de Implementação, Aprovação — e assina "**Assistente Conexus**" (veste a marca do produto do usuário). Destaques da seção 6 (protocolo de integração):

- Marcador **`[DECISÃO DO CLIENTE]`**: decisões que o time técnico está proibido de assumir (ex.: modelo de consumo Online × Importação Periódica × Misto, com tabela de prós/contras e recomendação justificada).
- **Staging obrigatório**: `IMP_<entidade>` truncada por execução + upsert atômico (`INSERT … ON DUPLICATE KEY UPDATE`); **proibido** `DELETE + INSERT` (janela de dados vazios).
- Incremental diurno via cursor + **full refresh noturno**; batching parametrizado pelo `burstLimit`.
- **Monitoramento como entrega obrigatória**: log de importações, tela de cargas, alerta por e-mail em falha, indicador "última atualização" em toda tela. Justificativa: carga que falha em silêncio é o pior modo de falha.
- Regra escrita no próprio doc: "**Credenciais do banco jamais são solicitadas ou trafegadas por chat**" — o agente codificou a lição do incidente.

**Contraste central do pipeline (achado mais importante do estudo)**: o Escopo (Gemini) **inventa** valores para fechar spec rápido; o build agent (Claude) **verifica contra o dado real e trava** nas decisões de negócio. O pipeline Mitra funciona porque o segundo estágio audita o primeiro. Para Conexus: ADOPT — spec assertiva no estágio 1 + Discovery com veto no estágio 2; a spec só vira contrato depois de validada contra a fonte real.

### 15.6 Escopo v2.0 completo — template de metodologia (capturado integral)

Esqueleto do `escopo-sales-radar.md` v2.0 (15 seções) — serve de **template canônico de spec** para Conexus:

1. Capa+metadados (status: `Aguardando Discovery Técnico`) · 2. Atores · 3. Pré-condições · 4. Glossário · 5. Regras de Negócio (RN-01..08, cada uma com exemplo numérico) · 6. Arquitetura de Dados e Integração (protocolo §15.5) · 7. Fluxo Principal (9 passos) · 8. Fluxos Alternativos/Exceções · 9. Escopo de Telas (tela×persona×conteúdo) · 10. Critérios de Aceite (15) · 11. **Fora de Escopo explícito** · 12. **Riscos e Mitigação** (RM-01..06) · 13. **Pontos em Aberto** (resolvidos × residuais × bloqueantes) · 14. **Sequência de Implementação** (F0–F6) · 15. **Aprovação** (sign-off de 3 papéis, incl. responsável técnico do ERP).

Padrões dignos de ADOPT direto:

- **PA como moeda de rastreabilidade**: cada ponto em aberto tem ID; o Discovery move PAs de "bloqueante" → "resolvido" com a resolução técnica anotada (ex.: PA-01 → `CODTIPOPER IN (14,714)` + `PENDENTE='S'` sem vínculo em `TGFVAR`). Classe "residual — não bloqueia" com **impacto declarado se não resolvido**.
- **Assunções carimbadas**: PA-02 "**assumido** incremental 30 min + full refresh 3h" — decidiu, mas marcou como assunção reversível ("mudança de configuração, não de arquitetura").
- **Degradação graciosa como regra de spec**: EX-02 "falha de IA não bloqueia o produto" (score+explicabilidade continuam; NBA indisponível); PA-18 → P3 desligado com P1+P2 renormalizados até alinhamento; CA-14/CA-15 amarram isso em critério de aceite.
- **Fases com dependência explícita** (F0 Discovery → F1 cargas+monitoramento → F2 score → F3 UI → F4 IA → F5 gestor → F6 piloto+recalibração) e uma **ordem inegociável justificada**: monitoramento antes do produto ("carga que falha em silêncio = decisões comerciais sobre dado de confiabilidade desconhecida").
- **Recalibração obrigatória embutida** (RM-02: piloto + recalibrar score em 60 dias contra conversão real) — o produto nasce com loop de validação, não como entrega estática.
- Fora de Escopo nomeia o que **não** é: sem ML no score (determinístico+explicável; IA só no texto), sem escrita no ERP, sem envio automático ao cliente final.

## 16. Framework de abstração completo (modelo de dados dos SDKs, verbatim dos d.ts)

Extraído integral dos `.d.ts` publicados (unpkg, `mitra-sdk` + `mitra-interactions-sdk`). Este é o **meta-modelo da plataforma** — a resposta a "como eles abstraem tudo como classe/estrutura".

### 16.1 Tunnel = Cloudflare Tunnel (confirmado na fonte)

Hipótese do Operador validada: TI conecta banco on-prem **sem VPN**. Modelo:

```ts
interface CloudflareTunnel {
  id; workspaceId; tunnelName; alias;
  cfTunnelId: string;          // tunnel Cloudflare real
  tunnelToken: string;         // token que a TI roda no conector (cloudflared)
  status; lastErrorMsg;
  dhStatusLastCheck/LastError/LastSuccess;  // telemetria de saúde
  routes?: CloudflareTunnelRoute[];
}
interface CloudflareTunnelRoute {
  subdomain; alias; hostname;   // hostname público gerado (DNS record)
  internalDbUrl: string;        // IP/host interno do banco
  internalDbPort: number;
  dnsRecordId;
  routeStatus; processStatus;   // status separados: rota DNS × processo conector
  // + timestamps de health por rota e por processo
}
```

**Fluxo operacional** (o que a TI do cliente faz): `createTunnelMitra({alias})` → plataforma devolve `tunnelToken` → TI executa o conector (cloudflared) com o token na rede interna → `addTunnelRouteMitra({tunnelId, alias, internalDbUrl, internalDbPort})` → nasce `hostname` público → `createJdbcConnectionMitra({host: hostname, port, database, user, password})`. Só tráfego de **saída** no cliente; nenhuma porta aberta; health-check por tunnel e por rota. 15 funções de ciclo de vida (activate/deactivate/stop/sync status/CRUD rotas).

### 16.2 Integração REST — blueprint como classe, instância como conexão

```ts
// A "classe": template versionado no catálogo
interface ConnectorTemplateResponse {
  id; name; logo; authStrategy;
  fieldsSchema: { fields: {key; label; type:'text'|'password'; required; placeholder?; default?}[] };
  authenticationConfig;   // fluxo de token (ex.: DYNAMIC_TOKEN — caso Sankhya OAuth)
  authorizationConfig;    // como injetar credencial na request
  docUrl; testEndpoint;   // validação embutida
  custom; active;
}
// Injeção de credencial: union fechada
type AuthorizationConfig =
  | { type:'header'; config:{name;value}[] }
  | { type:'basic';  config:{username;password} }
  | { type:'cookie'; config:{name;value} }
  | { type:'query';  config:{name;value} };
// A "instância"
interface IntegrationResponse { id; projectId; name; slug; blueprintId; blueprintType;
  authType; credentials; status; lastCheckedAt; }
// O runtime (única porta de chamada)
callIntegrationMitra({ connection: slug, method, endpoint?, params?, body? })
  → { statusCode, body }
```

`fieldsSchema` gera o formulário de credencial dinamicamente (por isso o agente soube que `sankhya_oauth` exige `x_token`+`client_id`+`client_secret`); `testEndpoint` dá o teste de conexão padrão; `custom:true` permite blueprint próprio sem template.

### 16.3 Camadas de dados externas — 4 níveis de abstração

| Camada | Estrutura | Função |
|---|---|---|
| 1. Rede | `CloudflareTunnel`+`Route` | banco on-prem alcançável sem VPN |
| 2. Conexão | `JdbcConnection {name,type,host,port,database,user,password}` | credencial de banco nomeada, `isOnline` |
| 3a. Dado virtual | `OnlineTable {jdbcId, name, sqlQuery, columns[]}` | view sobre o banco externo, consultada ao vivo |
| 3b. Dado materializado | `DataLoader {jdbcId, query, tableName, runWhenCreate, input}` → `executionLog {timestamp,rowCount,duration,fileSize,status}` | ETL: query externa → tabela local, com log de execução por carga |
| 4. API REST | blueprint+integration+`callIntegration` | qualquer SaaS/gateway (caso Sankhya) |

**Agendamento embutido**: `ServerFunction` tem `cronExpression`+`cronInputJson` — SF é também job agendado; e SF aceita `jdbcId` → roda SQL **direto no banco externo**. A dupla DataLoader+SF-cron é exatamente a "Importação Periódica" do escopo v2.0 (§15.6) — a plataforma já tem as primitivas.

### 16.4 Meta-modelo do projeto (o "mundo" que o agente enxerga)

`getProjectContextMitra()` devolve o inventário completo em 1 chamada — o world-model do agente:

```ts
{ project: {id, name, instructions},        // instruções injetáveis (metodologia)
  inventory: {
    jdbcs[]; tables[{name, columns[{name,type,isPk,nullable}]}];
    onlineTables[]; dbActions{}; serverFunctions[]; dataLoaders[];
    variables[{key,value}]; sourceFiles } }
```

RBAC como grade `Profile × recurso`: `{users, selectTables, dmlTables, actions, screens, serverFunctions, color, homeScreenId}` — leitura e escrita separadas por tabela, telas e SFs permitidas por perfil. Usuários tipados `dev|business` (`manageUserAccessMitra {action: INVITE|REMOVE|CHANGE_TYPE}`).

Convenção de envelope uniforme: toda resposta é `{status, result, paramsApplied?}`; erros e logs padronizados em SF (`{executionId, executionStatus, output, logs, error, durationMs}`).

### 16.5 Agente embutível como estrutura de dados

`AgentTaskSession` (interactions-sdk) é a superfície completa para embutir o builder em qualquer UI:

- Estado: `'opening'|'idle'|'uploading'|'streaming'|'cancelled'|'error'|'closed'`
- Fila editável: `QueuedItem {id,text,seq,status:'pending'|'sending',injected?}` + `editQueueItem/removeQueueItem/clearQueue`
- Eventos tipados: `historyLoaded, turnStart, delta {kind:'text'|'tool'}, tool {tool,input,content}, turnEnd, taskCreated, cancelled, error, queueChange, statusChange`
- `send(prompt, {agentType?, modelId?, files?})` — **modelo selecionável por mensagem**

### 16.6 Classificação

| Padrão | Classificação | Nota |
|---|---|---|
| Tunnel gerenciado (Cloudflare) com token p/ TI + rotas host:porta | ADOPT | Onboarding on-prem sem VPN; health por rota; nossa versão pode usar cloudflared ou rathole/frp |
| Blueprint de conector com `fieldsSchema` dinâmico + `testEndpoint` | ADOPT | Catálogo versionado de conectores; form de credencial gerado do schema |
| Union fechada de `AuthorizationConfig` (header/basic/cookie/query) + `DYNAMIC_TOKEN` | ADOPT | Cobre 95% dos SaaS; token-refresh server-side |
| 4 camadas de dado externo (rede→conexão→virtual/materializado→REST) | ADOPT | Separação limpa; DataLoader com executionLog é o esqueleto do nosso pipeline de carga |
| SF com cron embutido | ADOPT | Job scheduling sem serviço separado |
| `getProjectContext` como world-model de 1 chamada | ADOPT (forte) | Contexto do agente barato e completo; espelha nosso Context Pack |
| RBAC grade perfil×recurso com select/dml separados | ADOPT | Base do nosso authority model de dados |
| `AgentTaskSession` com fila editável e eventos tipados | REFERENCE | Blueprint do nosso protocolo de sessão de agente embutido |

### 16.6b Databases externos via Cloudflare Tunnel — evidência de UI (bundle do app)

Validação do achado do Operador (conectar qualquer banco on-prem via túnel, sem VPN). Extraído do bundle `entry.Hp59YscR.js` (6,9 MB, agent.mitralab.io):

- **Tela "Cloudflare Tunnels"** nas configurações do workspace: *"Manage Cloudflare tunnels and routes to securely expose internal services. A workspace can have multiple tunnels, each with multiple associated routes."*
- **Form da rota é exatamente IP+porta do banco interno**: placeholder do host `"ex: 192.168.1.100"`, placeholder da porta `"ex: 3306"`. TI preenche IP interno + porta → plataforma gera hostname público → JDBC aponta pro hostname.
- **Drivers JDBC confirmados no código**: `dataBaseDriverType ∈ {ORACLE, MYSQL, SQLSERVER}` (+ `PostgreSQL` no exemplo do README do SDK). Templates "Base de Conhecimento (ORACLE/MySQL/SQLSERVER)" como projetos prontos.
- **Multi-tenant por driver**: endpoint `/multiTenant/tenantConfig?dataBaseDriverType=` — a config de tenant da plataforma é parametrizada pelo tipo de banco; `partnerUsesOracleDB` como getter de licença (parceiros/integradores têm driver associado).
- **Catálogo de credenciais na mesma tela** (i18n do painel de conexões): Gmail (access token / Google Client ID+Secret), Google Calendar, HubSpot (API Key), **SAP (url + client_id + client_secret)**, **Supabase (Project URL + Service Role Key)**, campo `Test Endpoint` ("ex: /health ou /api/status") — a materialização visual do `fieldsSchema` dos blueprints (§16.2).
- Fluxo completo documentado no README do SDK: `createTunnel → addTunnelRoute(internalDbUrl, internalDbPort) → activateTunnel` ("**inicia processos cloudflared**") → `syncTunnelStatus`. O `activate` sobe processo bridge no lado da plataforma (por isso `processStatus` por rota, separado do `routeStatus` DNS).

Classificação: ADOPT — onboarding de banco on-prem vira formulário de 2 campos (IP+porta) para a TI do cliente, com health-check por rota. É o menor atrito possível para o caso "conectar Oracle do ERP sem VPN".

### 16.7 De onde vem o conhecimento de domínio do ERP (avaliado)

Pergunta do Operador: *"como ele sabe e mapeia tudo do Sankhya? Tem um especialista, documentação?"* Resposta: **não há especialista nem doc de ERP embutidos**. Três camadas:

1. **Blueprint = só mecânica.** `sankhya_oauth` carrega `fieldsSchema` (3 campos), `testEndpoint`, `docUrl`. Zero semântica de negócio.
2. **O "especialista" é o pré-treino do LLM.** Sankhya tem documentação pública massiva (developer.sankhya.com.br): OAuth client credentials, gateway `service.sbr?serviceName=`, dicionário TGFCAB/TGFITE/TGFPRO/TGFPAR — e publica até **`llms.txt`** (índice de docs para LLMs). Prova decisiva: `DbExplorerSP.executeQuery` **não consta na doc oficial** — é serviço semi-interno difundido em fóruns/GitHub da comunidade — e o agente o usou mesmo assim. Conhecimento veio do corpus, não da plataforma.
3. **Discovery corrige o prior.** O agente assumiu o padrão público (`NUNOTAORIG`), sondou a base real, constatou ausência e achou o mecanismo verdadeiro (`TGFVAR`, `AD_*`). Prior dá direção; introspecção dá verdade.

**Fórmula**: conector genérico (mecânica) + prior do modelo (domínio) + loop de verificação (base específica).

**Para Conexus**: não construir bases de conhecimento por ERP antecipadamente — o prior cobre sistemas grandes. Mas o prior degrada com a obscuridade do sistema; para nicho, ativar o "perfil de ERP" (§15.4): pacote versionado de convenções + docs do vendor (aproveitar a adoção crescente de `llms.txt` pelos vendors) injetado como contexto quando o Discovery detectar prior fraco (muitas correções seguidas).

## 17. "Sistema de missão" do Mitra — governança mínima viável (comparativo com MNFS)

Pergunta do Operador: nosso sistema de missão é muito complexo/extenso ("talvez até demais") — como o Mitra faz essa parte? Resposta com base nos 3 experimentos: **o Mitra quase não tem sistema de missão** — e entrega qualidade mesmo assim.

### 17.1 Os 4 mecanismos observados

1. **Missão = 1 task de chat com checklist-template fixo.** Os dois builds (criação e migração) usaram a MESMA lista de 13 itens: Planejar → UX → Design → Backend → Frontend → Testes → Validar features/UX/design/usuários/permissões → **Revisão final contra o prompt original**. Não é plano sob medida; é template de disciplina nas instruções, materializado via TodoWrite.
2. **Estado de longo prazo em documentos versionados, não em processo.** `escopo-*.md` (status no cabeçalho = gate; fases F0–F6 com dependências; PAs bloqueantes/residuais) + `discovery-*.md` (evidência). O gate é o campo `status` do doc; o tracking é o ciclo de vida dos PAs; o ledger é o git (SYNC/SHARE).
3. **Zero hierarquia de agentes.** Um agente, tasks sequenciais, sem orquestrador nem validador frio. Validação = 5 itens de auto-validação do checklist + revisão final contra o prompt.
4. **Única máquina de fases separada é o Escopo** (2 estágios, sentinela `[ESCOPO_FINALIZADO]`).

### 17.2 Comparativo

| Dimensão | MNFS | Mitra |
|---|---|---|
| Plano | Mission→Milestone→Feature, planner packs | Checklist fixo por task |
| Gates | P6/P7, validadores frios, contracts | Campo `status` do doc de escopo |
| Rastreio | Ledgers, evidence packs | PAs com ID no doc + git history |
| Validação | Agentes QA dedicados | Auto-validação no checklist |
| Horizonte longo | Sistema de missão | Documentos versionados como estado |

### 17.3 Leitura e classificação

O Mitra comprime disciplina em **template** (checklist invariante + protocolo no doc) em vez de processo externo. Funciona porque cada task tem horizonte curto; o horizonte longo mora nos docs. Qualidade observada: achou e corrigiu os próprios bugs, travou em decisão de negócio — com ~5% da maquinaria do MNFS.

| Padrão | Classificação | Tratamento |
|---|---|---|
| Checklist-template invariante com validações embutidas | ADOPT | Para o agente embutido do produto Conexus; barato e auditável |
| Doc-como-contrato com status-gate e PA lifecycle | ADOPT | Substitui maquinaria pesada para trabalho de produto |
| Auto-validação (sem revisor frio) | ADAPT | Suficiente para app CRUD; manter revisor frio para mudanças de risco (dados, permissões, produção) |
| MNFS-grade completo | manter | Para construir a plataforma em si; não exportar para o produto |
