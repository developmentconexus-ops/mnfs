---
id: DOC-RESEARCH-MITRA-INSPIRATION-MAP
title: Mitra Inspiration Map
document_type: research_map
form: explanation
authority: research_historical
status: draft
version: 0.6.0
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

## 18. Harness plugável — BYOK / BYOS / multi-agente (achado tardio, alto impacto)

Cluster de tipos do interactions-sdk não visto antes. Revela que o builder do Mitra **não é fixo em Claude Code** — é um harness plugável de credencial, modelo e runtime de agente. Explica o "**Sub**" em "Claude Opus 5 High Sub" = assinatura Claude conectada via OAuth.

### 18.1 Três eixos de plugabilidade (verbatim dos tipos)

```ts
// Runtime do agente (a CLI que roda no sandbox)
type AgentType = 'claudecode' | 'codex' | 'opencode-cli' | 'opencode-sdk';
// Credencial por assinatura (BYOS — traga sua conta)
type AgentSubscriptionTarget = 'claude' | 'openai_oauth' | 'codex';
type ConnectableSubscriptionTarget = 'claude' | 'codex';
// Credencial por API key (BYOK — 8 provedores)
type AgentApiKeyTarget = 'anthropic'|'openai'|'gemini'|'kimi'|'minimax'|'glm'|'qwen'|'openrouter';
type CredentialAccessType = 'subscription' | 'api_key';
type AuthMethod = 'api_key' | 'paste_code' | 'device';
```

O usuário do Mitra pode: (a) **conectar a própria assinatura** Claude Max/Pro ou ChatGPT/Codex via OAuth; (b) **colar API key** de 8 provedores (Anthropic, OpenAI, Gemini, Kimi, MiniMax, GLM, Qwen, OpenRouter); (c) escolher o **runtime** (Claude Code, Codex CLI, OpenCode). O modelo é selecionável por mensagem (`SendOptions.modelId`).

### 18.2 Máquina de credencial (`manageAgentCredentialMitra`)

Uma função, 3 overloads, ação-máquina:

```ts
type CredentialAction = 'auth'|'connect'|'status'|'remove'|'list'|'list_models'
  |'list_providers'|'validate'|'save'|'oauth_start'|'oauth_exchange'
  |'device_start'|'device_poll'|'device_cancel';
```

- **OAuth assinatura Claude**: `{action:'auth', target:'claude'}` → `AuthClaudeResult {authUrl, state}` (abre browser) → `{action:'connect', target:'claude', code, state}` → `ConnectAgentSubscriptionResult {success, account:{email, orgName}, expiresAt}`.
- **Device flow Codex**: `{action:'auth', target:'codex'}` → `AuthCodexResult {userCode, verificationUrl, pollId}` → poll `device_poll`.
- **Provider list p/ UI**: `list_providers` → `AgentProviderListItem {name, type, connected, account, maskedKey, expiresAt}` (é o seletor de modelo que vimos); `list_models` → grupos `AgentModelGroup {type: 'subscription'|'api_key', models[]}`.
- Credencial roda sobre websocket `/sdk-ws` (visto no `useAgentWebSocket` do bundle).

### 18.3 Task do agente amarrada à credencial

```ts
interface GetAgentTaskCreateOptions { create:true; projectId?; agentType?:AgentType;
  modelId?:string; name?:string; connectionId?:string; }
```

`connectionId` liga a task a uma credencial específica → multiusuário com contas próprias. `manageAgentChatMitra` faz list/rename/delete de chats (histórico por projeto).

### 18.4 Por que isso importa para Conexus

Este é o achado mais estratégico do estudo. O Mitra provou um **harness agnóstico**: mesma plataforma roda Claude Code OU Codex OU OpenCode, sobre assinatura do usuário OU API key de 8 provedores. Implicações:

- **Economia**: cliente traz a própria assinatura Claude Max → custo de inferência sai do provedor da plataforma. Modelo de negócio diferente do "revende tokens".
- **Portabilidade de modelo**: não acopla ao Anthropic; troca de provedor é configuração.
- **Risco de qualidade**: a metodologia (§17) tem que ser robusta a modelo variável — o que funciona no Opus pode degradar no Qwen. O template+checklist viram ainda mais críticos.

| Padrão | Classificação | Tratamento Conexus |
|---|---|---|
| Runtime de agente plugável (claudecode/codex/opencode) | ADAPT | Forte, mas começar com 1 runtime sólido; abstrair a interface de sessão desde já (`AgentTaskSession` §16.5) |
| BYOS via OAuth (Claude/Codex) | ADOPT | Muda a economia; conectar assinatura do cliente com token-refresh server-side |
| BYOK 8 provedores + seletor de modelo por mensagem | ADOPT | Roteamento de modelo por tarefa/custo; catálogo `list_providers`/`list_models` |
| Credencial sobre `/sdk-ws` com máquina OAuth/device completa | REFERENCE | Blueprint do nosso fluxo de conexão de credencial de agente |
| `connectionId` amarrando task↔credencial | ADOPT | Multiusuário com conta/quota própria por sessão de agente |

## 19. Balanço de cobertura (honesto) — o que está mapeado e o que falta

Auditoria contra a lista exaustiva de exports (mitra-sdk 70 fns, interactions-sdk 56 fns + ~110 tipos).

**Mapeado com profundidade (fato+evidência):**
- Harness = Claude Code/E2B; pipeline 2 modelos (Escopo Gemini → build Claude) §2–4, §13
- Superfície completa dos 2 SDKs: assinaturas + modelo de dados verbatim §11–12, §16
- Integração externa: blueprint, `callIntegration`, auth union, teste §16.2
- Databases via Tunnel Cloudflare (Oracle/MySQL/SQLServer/Postgres), fluxo IP+porta §16.6b
- Sankhya ponta a ponta ao vivo: `DbExplorerSP.executeQuery`, TGFCAB/TGFVAR/AD_, multiempresa §15
- 4 camadas de dado, SF-cron, `getProjectContext` world-model, RBAC §16.3–16.4
- Origem do conhecimento de ERP (prior do LLM + discovery) §16.7
- Sistema de missão mínimo vs MNFS §17
- Harness plugável BYOK/BYOS/multi-agente §18
- Escopo real (5 perguntas → doc 15 seções, metodologia) §13–14, §15.6
- Anti-patterns de segurança (chave Gemini no browser) §13.5

**Mapeado parcial (assinatura conhecida, comportamento não observado ao vivo):**
- `manageAgentCredential` OAuth/device — tipos completos, fluxo não exercido (não vou conectar credencial real)
- `AgentTaskSession` embutível — interface completa, não instanciado fora do builder
- Deploy S3 / `getGitConfig` / SYNC-SHARE — visto nos logs do build, protocolo `migrations.yaml` interno não extraído
- `dbActions` — presente no world-model, semântica exata não isolada
- Voice agent do Escopo (gemini-flash) — mencionado, não investigado

**Não investigado (fronteira à época do §19):**
- ~~Wire protocol do `/sdk-ws`~~ → **fechado** em §20 e §26.7 (frames completos)
- ~~Superfície REST do backend~~ → **fechado** em §20, §23, §24, §25
- ~~Internals do sandbox E2B / scaffold~~ → **fechado** em §21
- ~~System prompt da harness~~ → **parcial** em §22 (CLAUDE.md e wrapper do Escopo extraídos; prompt base do CLI não trafega pelo frontend)
- Planos/preços/limites (`burstLimit` visto = 5000; resto não) — **ainda aberto**

### 19.1 Estado da cobertura após §20–26 (revisão 2026-08-10)

**Fronteira atual — o que continua fora, e por quê:**

| Item | Status | Motivo |
|---|---|---|
| `SKILL_MD` do Escopo (metodologia completa) | **Bloqueado por decisão** | Fica na SF#4 do projeto 42949, co-localizada com a `GEMINI_API_KEY`. Buscá-la exporia o segredo. Metodologia inferida do output em §13/§15.6 |
| System prompt base do Claude Code CLI | **Inalcançável daqui** | Roda dentro do sandbox; não trafega pelo frontend |
| `coordinator_*` (login Claude do coordenador) | **Fechado** em §28.1 | Protocolo existe (escopo workspace); **nenhuma UI o chama** nos 367 chunks. Capacidade server-side sem frontend |
| Ciclo DEV→PROD, releases, CHANGELOG | **Fechado** em §27 | Era o buraco real — maior que o coordinator |
| Planos, preços, limites, cotas | Não investigado | Só `burstLimit = 5000` |
| `manageAgentCredential` OAuth/device ao vivo | **Não exercido por decisão** | Exigiria conectar credencial real |
| `AgentTaskSession` embutível | Assinatura conhecida | Não instanciado fora do builder |
| `dbActions` — semântica exata | Assinatura conhecida | Presente no world-model, comportamento não isolado |
| Protocolo interno de `migrations.yaml` | Parcial | Regra append-only conhecida; formato interno não extraído |
| Voice agent do Escopo (gemini-flash) | Não investigado | Mencionado, baixa prioridade |
| `opencode-cli` / `opencode-sdk` ao vivo | Superfície conhecida | Existe no dispatch (§26.6); nunca observado executando |

**Conclusão honesta (revisada):** produto, harness, framework de abstração, ciclo de desenvolvimento, sessão/contexto, publicação e conexões de dados estão **cobertos com evidência direta**. O que resta é (a) dois segredos que decidi não perseguir, (b) o prompt base do CLI que é estruturalmente inalcançável de fora do sandbox, e (c) uma cauda de itens de baixo valor para o Conexus — exceto o **coordinator**, que é o único candidato real a um próximo passe.

## 20. Lógica interna dos SDKs (JS real, não d.ts) — REST + wire do websocket

Extraído dos bundles publicados `dist/index.mjs` de ambos os SDKs (fetch cross-origin do unpkg). Isto é o **como funciona por dentro**.

### 20.1 Resposta direta: Pi? OpenCode? — NÃO

Grep exaustivo no código executável dos dois SDKs: **zero** ocorrência de `pi`, `poolside`, `opencode`, `anthropic`, `generativelanguage`, `wss`. O default de runtime é literal:

```js
const agentType = options?.agentType ?? this._agentType ?? "claudecode";
```

Codex existe como caminho alternativo (`device_start` → `userCode`/`pollId`). OpenCode aparece só como *valor de tipo* no d.ts (§18), não no runtime. **Conclusão: Mitra roda Claude Code por padrão; não usa Pi nem OpenCode em produção.**

### 20.2 Topologia de backend (descoberta no código)

Dois frontends, dois backends de auth:

```js
{ "https://coder.mitralab.io/sdk-auth/":  "https://api0.mitraecp.com:1005",
  "https://agent.mitralab.io/sdk-auth/":  "https://api2.mitrasheet.com:4133" }
```

Os domínios de backend — **`mitraecp.com`** (Mitra ECP) e **`mitrasheet.com`** (MitraSheet) — revelam a linhagem: o produto nasceu de um ERP/planilha (MitraSheet/MitraECP). Explica o DNA fortemente voltado a integração ERP. Base da API resolvida via `window.__mitraEnv.apiBaseURL` (injetado por build-proxy) ou `authApiURL` nas options.

### 20.3 Superfície REST real

**Dev SDK (`mitra-sdk`)** — tudo sob prefixo `/agentAiShortcut/`:
```
GET  /agentAiShortcut/listWorkspaces
POST /agentAiShortcut/createProject
POST /agentAiShortcut/serverFunction/togglePublicExecution
GET  /agentAiShortcut/cloudflare/${id}/tunnel-status
... runQuery/runDdl/etc via POST com body {projectId, sql}
```
Chamada: `${config.baseURL}${endpoint}` + `Authorization: formatToken(token)`.

**Runtime SDK (`mitra-interactions-sdk`)** — prefixo `/interactions/` + tenant-scoped:
```
POST /interactions/executeDataLoader
POST /interactions/executeDbAction
POST /interactions/setFileStatus
GET  /interactions/records/${tableName}         (page,size,jdbcConnectionConfigId,...filters)
GET  /interactions/records/${tableName}/${id}
GET  /refreshedToken/${projectId}               (token refresh silencioso)
```

**Achado que explica o bug ao vivo**: `callIntegrationMitra` mapeia no wire `{ integrationSlug: options.connection }`. A API pública renomeou o param para `connection`, mas o corpo HTTP ainda usa `integrationSlug`. Foi exatamente a confusão que o agente teve no experimento Sankhya ("O campo correto é connection, não integrationSlug") — resíduo de versão da renomeação.

### 20.4 Wire do websocket do agente (frames reais)

Conexão: `new WebSocket(getWsUrl())`, url de `config.agentWsUrl` ou `window.__mitraEnv.agentWsUrl`, com timeout de abertura.

**Cliente→servidor**: `socket.send(JSON.stringify({ type, requestId, payload, taskId? }))`

**Servidor→cliente** (`onmessage → routeMessage`), tipos de frame decodificados:
| Frame `type` | Efeito |
|---|---|
| `task_update` (`payload.action='created'`) | nasce a task; emite `taskCreated` |
| `stream_delta` (`payload.subtype='thinking'` → `kind:'tool'`, senão `text`) | append no conteúdo; emite `delta` |
| `stream_tool_activity` | emite `tool {tool, input}` |
| `turn_started` | emite `turnStart` |
| `error` | emite `error` |

O SDK traduz frames de baixo nível (`stream_delta`/`stream_tool_activity`) nos eventos públicos tipados de `AgentTaskSession` (§16.5). A sessão instancia com `{kind:'new', projectId, agentType, modelId}` ou `{kind:'existing', taskId}`.

### 20.5 Fluxo de credencial de agente (OAuth via postMessage)

```js
var AUTH_READY_TYPE = "mitra-auth-ready";
var AUTH_CREDENTIALS_TYPE = "mitra-auth-credentials";
function openSilentAuthIframe(authUrl, projectId, credentials){ ... }
```

OAuth roda por **iframe/popup silencioso** que faz `postMessage({type:'mitra-auth-credentials', ...creds}, origin)` de volta ao app — o mesmo padrão do login por fragmento (§11). Credenciais de assinatura (`manageAgentCredential`) usam `rpc(options)` sobre o transport (websocket/http), ações `auth/connect/device_poll` (§18.2).

### 20.6 Classificação

| Achado | Classificação | Nota Conexus |
|---|---|---|
| Runtime default `claudecode`, sem Pi/OpenCode | REFERENCE | Confirma: harness = Claude Code; nossa escolha de base está alinhada |
| REST em 2 camadas: `/agentAiShortcut` (dev) × `/interactions` (runtime) | ADOPT | Separar plano de controle (build) do plano de dados (runtime do app) |
| `records/${table}` genérico com filtros/paginação server-side | ADOPT | CRUD tabular genérico é a espinha do runtime; nós já caminhamos p/ isso |
| Wire ws com `stream_delta`/`stream_tool_activity` → eventos tipados | REFERENCE | Blueprint do nosso protocolo de streaming de agente |
| OAuth por postMessage de iframe silencioso | ADAPT | Funciona, mas validar origin rigorosamente; preferir PKCE server-side |
| Renome `connection`↔`integrationSlug` vazando no wire | REJECT (lição) | Versionar contrato de API; não deixar rename de param divergir do corpo |
| Backend legado ERP (mitraecp/mitrasheet) exposto em portas altas | REFERENCE | Linhagem ERP; nós começamos limpos, sem dívida de porta:1005/4133 |

## 21. Sandbox + scaffold (template real do projeto gerado)

Extraído da árvore git do projeto 55785 via `/api/mitra-agent/github-files/*`. Isto é **o template com que todo app nasce** + o layout do sandbox.

### 21.1 Layout do sandbox (E2B)

O `CLAUDE.md` do template fixa o working dir: **`/home/user/w-{workspaceId}/p-{projectId}/`**. Confirma E2B (`/home/user/`), namespaced por workspace/projeto. Guardrails no prompt: trabalhar EXCLUSIVAMENTE nesse dir, proibido `cd ..`/sibling — vários projetos coexistem no mesmo box (multi-tenant), isolados só por instrução.

### 21.2 Estrutura do scaffold

```
CLAUDE.md                    (8150) — contrato operacional do agente (§22.1)
.gitignore / .gitkeep
backend/
  package.json               (131)  — deps: mitra-sdk ^1.0.58 + dotenv. SÓ isso.
  .env.example               — auto-populado pelo servidor (NÃO hardcode)
  setup-backend.mjs          (18740)— provisiona tabelas+SFs (idempotente)
  (migrations/ + migrations.yaml — criados pelo SISTEMA fora do turno)
frontend/                    — Vite 7 + React 19 + Tailwind 4 (@tailwindcss/vite)
  package.json               — mitra-interactions-sdk 1.0.61, react-router-dom 7,
                               recharts 2.15, lucide-react. build: tsc -b && vite build
  vite.config.ts             — base:'./' (servível de qualquer path)
  src/lib/
    conexus.ts               — camada de dados: mapa SF{id} + callSF() (§21.4)
    mitra-auth.ts            — bootstrap de sessão via fragment (§21.5)
  src/components/ui/         — biblioteca UI pré-scaffoldada: Button,Card,Modal,
                               Select,Toast,Chart(56KB/recharts),Badge,Checkbox…
  src/hooks/                 — useDrill (drill-down), useHighlight, useToast
  src/pages/                 — LoginPage, MonitoramentoPage (app real)
```

**Achado central: backend sem `src/`.** O "backend" é só `setup-backend.mjs` + a `mitra-sdk`. Não há servidor Node self-hosted — a lógica vive como **Server Functions gerenciadas** no runtime Mitra. Confirma §16.

### 21.3 `setup-backend.mjs` — provisioning idempotente (a arquitetura runtime inteira)

Importa da `mitra-sdk`: `configureSdkMitra, runDdlMitra, createServerFunctionMitra, listServerFunctionsMitra, updateServerFunctionMitra` (+ `runDmlMitra` dentro do código da SF). Fluxo:

1. **DDL**: cria tabelas-espelho (EMPRESAS, VENDEDORES, CLIENTES, ORCAMENTOS, ORCAMENTO_ITENS, LOG_IMPORTACOES) via `runDdlMitra`.
2. **SF de carga (JAVASCRIPT)**: string `CODIGO_SYNC` — roda NO backend Mitra, puxa Sankhya via `callIntegrationMitra` e faz upsert. Detalhes reais:
   - `endpoint:'/gateway/v1/mge/service.sbr?serviceName=DbExplorerSP.executeQuery&outputType=json'`, lê `responseBody.fieldsMetadata[].name` p/ colunas.
   - `PAGINA=4000` (< teto 5000 do DbExplorer); `TOPS_ORCAMENTO='14,714'`.
   - `upsert()` em lotes de 400: `INSERT ... ON DUPLICATE KEY UPDATE col=VALUES(col)` → **o DB gerenciado é MySQL** (sintaxe ON DUPLICATE KEY), enquanto a fonte Sankhya é Oracle. O espelho faz a ponte Oracle→MySQL.
   - Aberto: `C.PENDENTE='S' AND NOT EXISTS (SELECT 1 FROM TGFVAR VA WHERE VA.NUNOTAORIG=C.NUNOTA)`; conversão via `TGFVAR MIN(DTNEG)`.
   - Loga em LOG_IMPORTACOES (ENTIDADE, STATUS='SUCESSO').
3. **SFs SQL (monitor\*)**: as queries do dashboard (resumo: ORCAMENTOS_TOTAL, ORCAMENTOS_ABERTOS, VALOR_ABERTO, CONVERTIDOS…).
4. **Idempotência**: `listServerFunctionsMitra` → acha por nome → `update` se existe, senão `create`. Tipos de SF: `'SQL'` e JAVASCRIPT.
5. **Cron**: `updateServerFunctionMitra({ cronExpression:'0 */30 * * * *' })` → a carga Sankhya→espelho roda **a cada 30 min server-side**. É assim que o "última carga" do monitor funciona.

**Arquitetura completa**: Sankhya/Oracle (verdade, read-only via DbExplorer) → SF JAVASCRIPT em cron 30min faz upsert atômico → DB gerenciado MySQL (espelho) → SFs SQL leem o espelho → frontend chama SF por ID inteiro. Zero DELETE, zero janela vazia.

### 21.4 `conexus.ts` — camada de dados do app (uso real do interactions-SDK)

> Nota: `conexus.ts` é a lib do app gerado (marca do cliente Conexus), **não** o nosso harness. Padrão:
- `export const SF = { sincronizarSankhya:1, monitorUltimaCarga:2, monitorHistoricoCargas:3, monitorResumoBase:4 }` — IDs inteiros das SFs (provisionados pelo setup; comentário instrui rodar o setup e atualizar o mapa ao criar SF nova).
- `callSF(id,input)` → `executeServerFunctionMitra({ projectId, serverFunctionId, input })`; trata `result.executionStatus==='FAILED'`; normaliza output (string→JSON, `.result[]`). **Colunas voltam UPPERCASE** (herança Oracle).
- Helpers pt-BR: moeda BRL, data `dd/mm/aaaa`, tempo relativo.

### 21.5 `mitra-auth.ts` — bootstrap de sessão (o fluxo de login §11 com nomes reais)

- `configureSdkMitra({ baseURL, token, integrationURL, projectId, authUrl, onTokenRefresh })`; sessão em `localStorage['mitra-session']`.
- `initMitra()`: lê tokens do **fragment (#)** — params `tokenMitra`, `backURLMitra`, `integrationURLMitra` — "para não vazar em logs/referrer". Trata `token==='error'`. Prefixa `Bearer`. Limpa hash via `replaceState`. Fallback pra sessão no localStorage. `onTokenRefresh` persiste a nova sessão.

### 21.6 Classificação

| Achado | Classificação | Nota Conexus |
|---|---|---|
| Sandbox `/home/user/w-{ws}/p-{proj}/`, isolamento por instrução | ADAPT | Preferir isolamento real (container/worktree) a guardrail de prompt |
| Backend serverless = só SFs gerenciadas, sem `src/` | ADOPT | Reduz superfície; lógica versionada como SF + migration |
| `setup-backend.mjs` idempotente (list→update|create) | ADOPT | Provisioning declarativo idempotente é o padrão certo |
| Espelho Oracle→MySQL com upsert atômico ON DUPLICATE KEY | ADOPT | Espelho read-only + upsert; nunca DELETE+INSERT |
| SF de sync em cron 30min server-side | ADOPT | Agendamento no runtime, não no cliente |
| Frontend chama SF por **ID inteiro** hardcoded no `SF{}` | REJECT | Frágil (setup renumera). Preferir chamada por nome/slug estável |
| UI lib + hooks pré-scaffoldados no template | ADOPT | Template rico corta tempo de build; nós já temos design system |
| Tokens no fragment `#`, limpeza via replaceState | ADOPT | Bom: não vaza em referrer/log |

## 22. System prompts extraídos (todos os que são alcançáveis)

Pedido: "extrair todos system prompts, traga tudo". Resultado da caça — 3 camadas de prompt no pipeline Mitra.

### 22.1 [BUILD AGENT] `CLAUDE.md` do template — EXTRAÍDO NA ÍNTEGRA

É o contrato operacional que acompanha o Claude Code em todo projeto. Blocos-chave (verbatim resumido):
- **Directory scope**: trabalhar só em `/home/user/w-{ws}/p-{proj}/`, proibido `cd ..`/sibling.
- **Build**: sempre `cd frontend && npm run build`.
- **Regra de pausa do AskUserQuestion** (revelação de harness): *"O sistema NÃO bloqueia tools posteriores — qualquer ação DEPOIS de `AskUserQuestion` será EXECUTADA no sandbox antes da resposta do usuário."* → a pausa é forçada **por prompt**, não pelo runtime. `AskUserQuestion` DEVE ser a última ação do turno.
- **Migrations dev↔prod**: `backend/migrations/` + `migrations.yaml` são **append-only** e **gerenciados exclusivamente pelo sistema, fora do turno** — o agente nunca cria/edita/commita esses paths; DDL/SF via SDK viram migration automaticamente após o turno. `mergeBaseline` proibido sem ordem explícita. Após 3 tentativas falhas → PARE e escale com dossiê.
- **SYNC/SHARE multi-usuário via git**: repo `github.com/mitra-agent-projects/p-{proj}`, branch `user/{userId}`, `main` = baseline compartilhada. **Todo turno**: `git fetch && git merge origin/main` PRIMEIRO (mesmo p/ "oi"), ler o diff. **Fim do turno**: 1 commit + 1 push (não por arquivo). Conflito → SEMPRE `AskUserQuestion` em linguagem de negócio, nunca resolver sozinho. Idle 20min descarta o sandbox → trabalho não-pushado some. Nunca `--force`, nunca `--rebase`, sempre merge.

### 22.2 [ESCOPO / GEMINI] wrapper de system instruction — EXTRAÍDO NA ÍNTEGRA

Função `Ep(skillMd)` no bundle do `specialist.mitralab.io`. Verbatim:

> "Você é um assistente de escopagem técnica da Mitra. Seu trabalho é conduzir o usuário pela definição do escopo técnico funcional do projeto dele, seguindo a skill descrita abaixo. DATA DE HOJE: {data}. […] Sempre responda em português brasileiro […] Não gere o escopo final até ter informações suficientes sobre: objetivo do sistema, personas/atores, regras de negócio principais, fluxos esperados […] Ao FINALIZAR o documento completo, inclua EXATAMENTE a tag `[ESCOPO_FINALIZADO]` em uma linha separada no FINAL […] NÃO inclua a tag antes de gerar o documento completo […] SKILL DE ESCOPO TÉCNICO: --- {skillMd} ---"

- Tag de conclusão que sinaliza o pipeline: **`[ESCOPO_FINALIZADO]`**.
- **Arquitetura (achado de segurança)**: o navegador carrega `{SKILL_MD, GEMINI_API_KEY, MODELO_GEMINI}` de uma linha de tabela via **Server Function #4** do projeto Escopo (id `42949`), e chama o Gemini **direto do cliente**: `POST … {systemInstruction:{parts:[{text:Ep(skillMd)}]}, contents, generationConfig:{temperature:0.7, maxOutputTokens:65536}}`, modelo `gemini-2.5-pro` (fallback `gemini-2.5-flash`). **A `GEMINI_API_KEY` é exposta ao browser** — chave de LLM no client-side. Para o Conexus: REJECT — proxy server-side obrigatório, nunca key de modelo no cliente.

### 22.3 [ESCOPO SKILL_MD] corpo da skill — server-gated, NÃO extraído (por escolha)

O texto cru da skill (`SKILL_MD`) vem da SF#4 do projeto 42949, **co-locado com a `GEMINI_API_KEY` na mesma linha**. Puxá-lo exigiria a sessão do Escopo (token in-memory, não persistido) e devolveria a key junto. **Decisão: não perseguir** — mesma regra dos segredos Sankhya. A **estrutura de saída** dessa skill já está mapeada em §15.6 (template escopo v2.0, 15 seções, ciclo PA).

### 22.4 [BASE] system prompt do Claude Code no sandbox — não extraível sem tráfego ao vivo

O system prompt base (Claude Code + injeção do harness Mitra) é montado server-side no spawn do E2B — **não é commitado no repo** (varri `.claude/`, `AGENTS.md`, `.mitra/`, etc → todos 404) e **não é shipado ao cliente** (zero literais de prompt no bundle de `agent.mitralab.io`). Só sai com captura de tráfego do agente ao vivo ou acesso ao filesystem do sandbox. O `CLAUDE.md` (§22.1) é a camada Mitra-específica que se soma a ele.

### 22.5 Resumo

| Camada | Modelo | Fonte | Status |
|---|---|---|---|
| Build agent — `CLAUDE.md` | Claude (claudecode) | repo do projeto | ✅ íntegra |
| Escopo — wrapper `Ep()` | gemini-2.5-pro | bundle specialist | ✅ íntegra |
| Escopo — `SKILL_MD` | — | SF#4 proj 42949 | ⚠️ gated (estrutura em §15.6) |
| Claude Code base | Claude | sandbox server-side | ❌ precisa tráfego ao vivo |

## 23. Configurações de projeto, tools/métodos, e integração projeto↔projeto

Extraído dos chunks Nuxt de `agent.mitralab.io` (`server_function_store`, `integrations_store`, `CodeBuilderAIKeysPanel`, `AgentTaskContextModal`, `useAgentBackendBridge`, `connection_settings_store`). Responde: o que dá pra configurar por projeto, como tools/métodos entram no harness, e como um projeto grava na tabela de outro.

### 23.1 Superfícies de configuração do projeto (5 planos)

| Plano | Endpoint base | O que configura |
|---|---|---|
| **Modelo/Agente** (`ActivateAIModelsModal`, `CodeBuilderAIKeysPanel`) | `/api/mitra-agent/auth/{claude\|codex\|openai}`, `/api/mitra-agent/keys` | `agentType` (claudecode/codex/opencode), `target` de assinatura (claude/openai_oauth/codex), `provider`+`apiKey` (BYOK) |
| **Integrações** (`integrations_store`) | `/integration`, `/integration/${id}`, `/integration/test`, `/integration/${id}/duplicate` | conectores REST/OAuth |
| **Connections/DB** (`connection_settings_store`) | `/connection*`, `/jdbcConnectionConfig`, `/freeDB*` | DBs externos, tabelas gerenciadas, tunnel |
| **Server Functions** (`server_function_store`) | `/serverFunction*` | lógica executável (ver 23.2) |
| **Contexto de task** (`AgentTaskContextModal`) | `/mitraspace/userSpaces/v2` | tag de outros projetos como contexto (ver 23.4) |

**BYOK providers** (imagens `/images/providers/`): claude-code, openai, anthropic, gemini, minimax, kimi, glm, qwen, openrouter. Confirma §18. É aqui que se "define método de utilização" (qual harness + qual credencial).

### 23.2 Server Functions — tipos, execução, cron, público

`server_function_store` expõe o CRUD + execução:
- Endpoints: `POST /serverFunction`, `PATCH/GET /serverFunction/${id}`, `POST /serverFunction/${id}/execute`, `GET /serverFunction/${id}/executions`, `GET /serverFunction/execution/${id}`, `POST /serverFunction/execution/${id}/stop`.
- **3 tipos** (com templates default):
  - `JAVASCRIPT`: `export default async function handler(event) { … }`
  - `SQL`: `SELECT * FROM tabela WHERE id = {{id}}` (parametrizado com `{{param}}`)
  - `INTEGRATION`: `{ "url":"", "method":"GET", "headers":{}, "body":{} }` — chamada REST declarativa
- **Cron**: campo `cronExpression` (ex: `0 */30 * * * *` no setup do Sales Radar).
- **Tornar pública** (a chave da sua pergunta): `togglePublicExecution(id, bool)` → `PATCH /serverFunction/${id}/publicExecution` body `{ publicExecution: true }`. Liga a execução pública da SF → passa a ser chamável de fora do projeto via `/serverFunction/${id}/execute`.

### 23.3 Integrações — conectores (o "criar chave de API")

`integrations_store`: `createIntegration`, `updateIntegration`, `testConnection`, `testConnectionById`. Modelo do registro: `{ name, slug, type, authType, baseURL, method, username, password, token, secret }`.
- **Blueprints prontos**: `sankhya`, `sankhya_url`, `gmail`, `google_calendar`, `hubspot`, e **`custom`** (REST arbitrário).
- **authType** (é a "chave de API"): `bearer_token`, `basic_auth`, `api_key`, `custom`. O segredo vai em `token`/`secret`/`password`.
- Runtime: `callIntegrationMitra({ connection: slug, method, endpoint, params, body })` resolve o slug → executa com a auth configurada (§16.2). No wire vira `integrationSlug` (§20.3).

### 23.4 Contexto cross-projeto (como o agente "enxerga" outro projeto)

`AgentTaskContextModal` carrega `GET /mitraspace/userSpaces/v2?getProjects=true&includeV2MitraVersion=true` e deixa você marcar **outros workspaces/projetos** como contexto da task. Cada tag: `{ id, label, type:'workspace'|'project', contextCategory:'admin'|'dev'|'business', accessType, workspaceId }`.
- Categorias por `accessType`: **admin** (CREATOR/OWNER/ADMIN), **dev** (OWNER/CREATOR), **business** (demais). Isto dá ao build agent conhecimento do schema/regras de OUTRO projeto — mas é **contexto de build**, não escrita de dados em runtime.

### 23.5 Resposta: projeto A grava na tabela do projeto B

Dois caminhos, ambos suportados:

**(a) Via Server Function pública + Integração (o que você viu):**
1. No **projeto B**: cria SF (`JAVASCRIPT` ou `SQL`) que faz INSERT/UPSERT na tabela de B → `togglePublicExecution(true)`. Vira endpoint público `/serverFunction/{idB}/execute`.
2. No **projeto A**: Configuração > Integração > nova integração `custom`, `authType: api_key`/`bearer_token`, `baseURL` = endpoint público da SF de B, `secret/token` = a chave.
3. Em A, chama via `callIntegrationMitra({ connection:'slug-de-B', method:'POST', body:{…} })` ou uma SF tipo `INTEGRATION` com `{url, method, headers, body}`. → A grava na tabela de B pela API.

**(b) Via Connection JDBC compartilhada:** se ambos apontam o mesmo `jdbcConnectionConfigId`, A escreve direto na tabela gerenciada (mesma origem de dados). Menos isolado — evitar salvo intenção explícita.

### 23.6 Classificação

| Achado | Classificação | Nota Conexus |
|---|---|---|
| SF pública via toggle `publicExecution` | ADAPT | Útil, mas exige authz forte no endpoint público (rate-limit, escopo, rotação de key) — não deixar SF pública sem auth |
| Integração `custom` REST com authType bearer/basic/api_key | ADOPT | Conector genérico é o certo; nós já modelamos integração como classe/data-structure |
| SF tipos JAVASCRIPT/SQL/INTEGRATION | ADOPT | Três tipos cobrem quase tudo; SQL parametrizado `{{}}` é limpo |
| Projeto→projeto por SF pública + integração | ADAPT | Padrão de composição bom; preferir contrato/versionado e authz mútua a URL+key solta |
| Contexto cross-projeto por categoria admin/dev/business | ADOPT | Escopar contexto por papel de acesso é o modelo certo p/ multi-projeto |
| Connection JDBC compartilhada entre projetos | REJECT (default) | Quebra isolamento; só com intenção explícita |
| Firebase web API key exposta no bundle do cliente | REFERENCE (lição) | Config Firebase é "pública" por design, mas evitar expor qualquer key de serviço no cliente |

## 24. Publicar / tornar visível ao externo (deploy do app gerado)

Extraído de `PublishAppButton.vue` (+ `useAppAddressVerify`, `custom_app_validator`). É como o app buildado sai do sandbox e vira site acessível.

### 24.1 Dois tipos de publicação

i18n `WHITE_LABEL.*`:
- **`internal_publish`** — servido em subdomínio Mitra (host gerenciado, sem domínio próprio).
- **`external_publish`** — domínio **custom / white-label** próprio do cliente.

O usuário escolhe em `choose_publish_type`; estados `published_internal` / `published_external`; `unpublish` reverte.

### 24.2 Três modos de visibilidade

- **`PRIVATE`** — só o dono/colaboradores.
- **`PUBLIC_WITH_LOGIN`** — URL pública, mas exige login Mitra (o fluxo de fragment do §21.5) para entrar.
- **`PUBLIC`** — aberto, sem login.

### 24.3 API de domínio custom (`external_publish`)

Função `e1()`:
```
POST   /cb-domain            body {domain, workspaceId, projectId}   // createDomain
GET    /cb-domain            query {workspaceId, projectId}          // getDomain
GET    /cb-domain/verify     query {domain}  (retry:0)               // verifyDomain (DNS)
DELETE /cb-domain            query {domain, workspaceId, projectId}  // deleteDomain
```
Fluxo: registra o domínio → aponta DNS (CNAME) → `verifyDomain` confere a propagação → publica externo nele.

### 24.4 Deploy por snapshot + status de sincronização

- **Publicar** = `POST /api/cb-publish-snapshot {workspaceId, projectId}` — **copia o output do build** para produção. Retorna `{copiedCount, matchedFormats}`. Há re-snapshot após `publish-done` (não-fatal se falhar).
- **Status** = `GET /api/cb-publish-status?wsId&pId` → `{inSync, hasOutput, published, prodLastModifiedAt, version}`.
- O botão calcula "há mudanças a publicar" por `!(inSync && hasOutput && published)` → estados `publish_changes` / `publish_changes_up_to_date`. Versionado (`version`, `prodLastModifiedAt`).

### 24.5 Modelo mental

Sandbox (dev, efêmero) → `npm run build` → **snapshot** copiado p/ prod → servido em subdomínio Mitra (interno) **ou** domínio custom verificado por DNS (externo) → gate de visibilidade PRIVATE / PUBLIC_WITH_LOGIN / PUBLIC. Deploy é **imutável por snapshot versionado**, não live-mount do sandbox.

### 24.6 Classificação

| Achado | Classificação | Nota Conexus |
|---|---|---|
| Deploy por snapshot versionado (não live-mount do sandbox) | ADOPT | Prod imutável e reproduzível; sandbox nunca serve tráfego real |
| Status `inSync/hasOutput/published/version` → diff "publicar mudanças" | ADOPT | UX clara de "há mudanças não publicadas"; espelhar |
| 3 modos de visibilidade (private/public_with_login/public) | ADOPT | Gate de auth por nível é o modelo certo |
| Domínio custom com verify DNS (`/cb-domain/verify`) | ADAPT | Bom; garantir emissão de TLS automática + checagem de posse robusta |
| Publish interno vs externo (white-label) | REFERENCE | Separar host gerenciado de domínio do cliente desde o início |

## 25. Formulário de conexão de banco — precisão total (túnel, rota, JDBC, dataset)

Extraído de `connection_settings_store`, `ConnectionEdit`, e os blocos i18n do entry. É o formulário exato de "Configuração > Banco/Conexão".

### 25.1 Túnel Cloudflare (nível 1 — o canal on-prem)

Formulário "Criar Túnel" (labels verbatim):
| Campo | Label PT | Placeholder | Notas |
|---|---|---|---|
| `tunnel_name` | Nome do Túnel | `ex: meu-tunnel` | nome lógico |
| status | — | — | enum: **Ativo / Inativo / Offline / Degraded / Error** |
| `process_status` / `route_status` | Process Status / Route Status | — | saúde separada do processo e da rota |
| token | Tunnel Token | (View/Copy) | *"Use this token to configure the Cloudflare Tunnel connector"* — é o token do `cloudflared` que a TI instala on-prem |

Ações: criar túnel, excluir (remove túnel + rotas), ver/copiar token. Mensagens: "Tunnel created successfully", "Tunnel and routes removed successfully".

### 25.2 Rota do túnel (nível 2 — cada banco/serviço exposto)

"Add Route" / "Edit Route" — uma rota mapeia um recurso interno:
| Campo | Label | Placeholder | Mapeia p/ (§16.1) |
|---|---|---|---|
| `alias` | Alias | `ex: minha-rota` | `CloudflareTunnelRoute.alias` |
| `internal_db_url` | URL Interna do Banco | `ex: 192.168.1.100` | `internalDbUrl` |
| `port` | Porta | `ex: 3306` | `internalDbPort` |
| `hostname` | Hostname | `ex: app.exemplo.com` | `hostname` (subdomínio público gerado) |
| `service` | Service | `ex: http://localhost:8080` | serviço HTTP genérico |
| `path` | Path | `ex: / ou /api` | rota HTTP |

**Achado**: o túnel expõe **HTTP genérico** (hostname+service+path), não só banco. É reverse-tunnel de propósito geral — DB é um caso. TI preenche IP+porta internos; zero VPN; egress-only (§16.1 confirmado).

### 25.3 JDBC Connection Config (nível 3 — a conexão de banco em si)

CRUD (`connection_settings_store` / entry):
```
POST   /jdbcConnectionConfig          body {config}   // criar
PUT    /jdbcConnectionConfig          body {config}   // atualizar
GET    /jdbcConnectionConfig          params          // listar
DELETE /jdbcConnectionConfig/${id}    params          // excluir
```
Drivers suportados (do bundle da SDK, §16.6b): **ORACLE, MYSQL, SQLSERVER, POSTGRESQL**. Campo `jdbcConnectionConfigId` é a chave que amarra dataset/records/SF à conexão (aparece em `/interactions/records/${table}?jdbcConnectionConfigId=`, §20.3). Oracle usa `service` (SERVICE_NAME).

### 25.4 Connection / Dataset (nível 4 — camada BI sobre a conexão)

`ConnectionEdit` é a modelagem de dados (não a conexão crua):
- `POST /connection/types` e `/connection/types/${id}` — cria dataset a partir de um tipo.
- **Tipo `CSV`**: upload de arquivo via `FormData` (`metadata.connectionType==="CSV"` → `append("file", Blob)`).
- Endpoints da camada: `/connection`, `/connection/${id}`, `/connection/verifyColumns/${id}`, `/connection/allFiles`, `/connection/execute/${id}`, `/connection/execution/${id}`, `/connection/log/{filters,variables}/${id}`, `/treeReader/testConnection?id=`, `/dimension?jdbcConnectionConfigId=`, `/mergeDimension/databaseView`, `/dmlAction?databaseDml=true`.
- **freeDB** (tabelas gerenciadas — o MySQL do espelho, §21.3): `/freeDBDDLTable`, `/freeDBDDLColumn`, `/freeDBTableMetadata`, `/freeDBTableContent/${table}` — DDL e leitura de conteúdo das tabelas internas via API (metadados: colunas com tipo `date`/`numeric`/`text`, FK, dimensão, cubo, calendário).

### 25.5 Hierarquia mental (4 níveis)

```
Túnel Cloudflare (canal on-prem, 1 token cloudflared)
  └─ Rota (alias → IP:porta interno OU service HTTP)
       └─ JDBC Connection Config (driver ORACLE/MYSQL/SQLSERVER/POSTGRESQL, id)
            └─ Connection/Dataset (dimensão, cubo, CSV, freeDB DDL) → consumido por SF/records
```

### 25.6 Classificação

| Achado | Classificação | Nota Conexus |
|---|---|---|
| Túnel = reverse-tunnel HTTP genérico (não só DB) | REFERENCE | Nosso canal on-prem pode ser genérico igual; DB é um caso |
| Token cloudflared visível/copiável na UI p/ a TI instalar | ADOPT | Fluxo TI-self-service certo; garantir escopo mínimo do token |
| 4 níveis túnel→rota→jdbc→dataset | ADAPT | Boa separação; talvez fundir rota+jdbc p/ menos fricção |
| `jdbcConnectionConfigId` amarra tudo (records/SF/dataset) | ADOPT | Chave única de conexão propagada é o modelo certo |
| freeDB DDL/conteúdo via API REST | ADOPT | Tabelas gerenciadas manipuláveis por API é essencial p/ o agente |
| CSV como connection type (upload FormData) | ADOPT | Importar CSV como fonte é feature barata e útil |
| Status ricos (Ativo/Offline/Degraded/Error, process×route) | ADOPT | Observabilidade de conexão granular; espelhar |

## 26. Sessão, contexto, compactação e catálogo de modelos (evidência de runtime)

Nível de evidência: **OBSERVADO** — estado Pinia lido ao vivo do runtime (`WsMessageStore`, `MitraTaskStore`) + `useAgentWebSocket.VPzUV7t7.js` (65KB) + varredura do bundle inteiro (6.9MB entry, 367 chunks).

### 26.1 Uma task = uma sessão contínua

Medido na task real `gPB3o6wYEZI1nfY8MNYW` (projeto Sales Radar):

| Métrica | Valor medido |
|---|---|
| Mensagens na sessão | **322** (93 `text`, 227 `tool_activity`, 1 `build_status`, 1 `turn_end`) |
| Duração | **133 min** contínuos, mesmo `taskId` |
| Ferramentas usadas | Bash 135, Edit 51, Write 22, Read 14, ToolSearch 3, WebFetch 2 |

Não existe conceito de "nova sessão" dentro da task: `taskId` **é** o identificador da sessão. Um novo chat = `task_create` = nova sessão de agente. `sendMidSessionInput` marca `midSession:true` no payload — input entregue no meio de um turno em andamento, sem reiniciar sessão.

### 26.2 Steering por arquivo de fila (achado importante)

Mensagem enviada durante um turno **não interrompe** o CLI. Vai para uma fila em arquivo no sandbox, que o agente lê no início de cada turno junto com o SYNC do git. Comando real observado:

```bash
git fetch origin 2>&1 | tail -3; git merge origin/main --no-edit 2>&1 | tail -10; echo "---QUEUE---"; cat /tmp/mitra-queue-*.jsonl 2>/dev/null
```

Protocolo WS correspondente: `message_queued` → `message_injected`. Isso explica por que o CLAUDE.md manda fazer SYNC todo turno — é o mesmo comando que drena a fila.

### 26.3 Janela de contexto: NÃO é 1M, e Mitra não a gerencia

Varredura do bundle completo (6.9MB + chunks do agente):

| Termo | Ocorrências | Veredito |
|---|---|---|
| `contextWindow` / `context_window` | **0** | — |
| `1000000` / `200000` / `tokenLimit` | **0** | — |
| `compact` | 7 | **todos falsos positivos** (ícones `mdiViewCompact`, prop `compact` do antd, `compactDisplay` do Intl) |
| `summar` | **0** | — |
| `contextLimitHint` | 1 | pertence ao **Lila** (builder de telas legado): "desative o contexto das demais telas" — limite de *telas*, não de tokens |

Nas 322 mensagens da sessão real: `compact`/`summar`/`context left`/`previous conversation` = **0 ocorrências**.

**Conclusão factual:** a janela de contexto é a nativa do modelo escolhido. Mitra **não implementou** gestão de contexto, indicador de uso, botão de compactar, nem sumarização própria. Se há compactação, é a auto-compact nativa do Claude Code CLI rodando dentro do sandbox — invisível e não instrumentada pelo frontend.

### 26.4 Prompt caching é o que sustenta a sessão longa

`taskUsage` (cumulativo por sessão, escrito no `stream_end`):

| Task | inputTokens | cacheRead | cacheCreation | output | costUSD | authMode |
|---|---|---|---|---|---|---|
| `gPB3o6w…` | 729 | **11.709.402** | 42.855 | 33.193 | 11,55 | — |
| `Uposjo…` | 12.738 | **17.904.042** | 267.008 | 112.587 | 8,71 | `subscription` |
| `moo7tH…` | 6.388 | 1.896.790 | 222.105 | 16.935 | 2,28 | — |

Razão cacheRead:input ≈ **16.000:1**. `turn_end` traz custo por turno (`{turnDurationMs, toolCount, commitHash, costUSD:1.60}`) — logo `taskUsage` é o acumulado da sessão. `authMode: "subscription"` = assinatura OAuth, não API key.

### 26.5 Catálogo de modelos (`OPENCODE_MODELS`) — 4 providers

Cada modelo tem flags `subscriptionOnly` (só via OAuth) ou `apiKeyOnly` (só via BYOK), `isDefault`, `enabledByDefault`, `disabled`.

- **anthropic** — Opus 5 (`:low/:medium/:high/:xhigh` + base), Fable 5 (mesmos tiers), Sonnet 5 (mesmos tiers), Opus 4.8, Opus 4.7, Opus 4.6, Sonnet 4.6. Default subscription: **Opus 5 High**; default API key: **Opus 5**.
- **openai** — GPT-5.6 Sol / Terra / Luna (cada um `:low`→`:max`), GPT-5.5 (`:low`→`:xhigh`, default `:medium`), GPT-5.5 Pro (`disabled`), GPT-5.4.
- **glm** — GLM 5.1 (default).
- **openrouter** — espelha Claude Opus 4.7/4.6, Sonnet 4.6, GPT-5.6 ×3, GPT-5.5, GPT-5.4, GLM 5.1.

O sufixo `:low|medium|high|xhigh|max` é **reasoning effort** exposto como se fosse modelo distinto.

### 26.6 Correção ao §20: OpenCode existe

O mapa anterior afirmava "sem OpenCode no runtime". **Errado.** `useAgentWebSocket` tem `Ot(e) => e==="opencode-cli" || e==="opencode-sdk"`. Resolução de modelo por agentType:

```js
claudecode → {provider:"anthropic", model: selecionado ?? "anthropic/claude-opus-4-8"}
codex      → {provider:"openai",    model: selecionado ?? "openai/gpt-5.4"}
opencode-cli | opencode-sdk → {provider: entry.providerId, model: entry.id}
```

Confirmado que a task real roda `agentType: "claudecode"`.

### 26.7 Protocolo WebSocket completo

**Enviados:** `user_input`, `approval_response`, `user_question_response`, `task_cancel`, `task_create`, `build_project`, `conflict_resolution`, `revert_commit`, `git_log_request`, `ping`, `claude_login_{start,callback,cancel}`, `coordinator_claude_login_{start,callback,cancel}`.

**Recebidos:** `connected`, `message`, `task_update`, `streaming_state`, `turn_started`, `stream_delta`, `stream_tool_activity`, `stream_tool_activity_update`, `stream_end`, `approval_request`, `user_question_request`, `auth_required`, `build_status`, `preview_ready`, `message_status`, `message_queued`, `message_injected`, `sandbox_status`, `server_restarting`, `attachment_progress`, `attachment_ready`, `error`.

Notas: existe um **coordinator** com login Claude próprio (separado do login por task). `streaming_state` reidrata stream em andamento após reconexão. O WS faz **reconexão proativa aos 12 min** — comentário literal no código: `"Proactive reconnect at 12min (Railway limit prevention)"` — confirma backend hospedado em Railway.

### 26.8 Classificação

| Achado | Classificação | Nota Conexus |
|---|---|---|
| taskId = sessão contínua (sem limite artificial de turnos) | ADOPT | Sessão longa por unidade de trabalho é o modelo certo |
| Steering por fila em arquivo + drenagem no SYNC | **ADOPT** | Elegante: zero interrupção do CLI, agente decide quando ler |
| Zero gestão/telemetria de contexto na UI | **REJECT** | Falha real: usuário não vê quanto contexto resta nem quando compactou |
| Delegar compactação ao CLI nativo | ADAPT | Aceitável como base, mas expor estado ao usuário |
| Telemetria de custo/token por turno **e** por sessão | ADOPT | `turn_end.costUSD` + `taskUsage` acumulado é o mínimo |
| Reasoning effort como sufixo de modelo (`:high`) | ADOPT | Simplifica UI; um seletor só |
| `subscriptionOnly` × `apiKeyOnly` no catálogo | ADOPT | Modela corretamente OAuth vs BYOK por modelo |
| Reconexão proativa 12min por limite de PaaS | REFERENCE | Sintoma de Railway; evitar essa restrição na escolha de infra |
| Múltiplos agentType (claudecode/codex/opencode) | ADAPT | Abstração de harness existe; validar custo de manter N backends |

### 26.9 Correção de leitura anterior sobre o projeto monitorado

Registro de honestidade: relatos anteriores neste mapa disseram que o Sales Radar estava "parado em escopo v2.0, com números inventados pelo Escopo/Gemini". Isso veio de ler apenas o topo do chat (mensagem mais antiga). O estado real da sessão mostra o oposto — o Claude Code **executou Data Discovery contra o Sankhya real**:

- "Discovery: TIPMOV e TOPs da base Sankhya"
- "Discovery: status, vínculo e colunas dos orçamentos"
- "Analisar janela real de conversão e os 2801 fechados"
- "Curva de sobrevivência e taxa real de conversão"

E seguiu para implementação: Server Functions publicadas, matriz de segurança revalidada, feature "ver como" (impersonation de vendedor) com trava de autorização, `ux.md`, builds limpos, commits na `main`. O documento de escopo do topo é o artefato inicial; os pesos foram depois confrontados com dados reais. **O padrão §14 não se aplica a esta sessão.**

## 27. Promote DEV→PROD e sistema de releases (o achado maior — §24 estava incompleto)

Nível de evidência: **OBSERVADO** — composable `sa()` em `LabSidebar.zayUnn7U.js` (69KB) + bloco i18n `PROMOTE` completo do entry.

O §24 mapeou só o *publish* (snapshot para link público). Faltava a camada de cima: **promoção para produção com projeto PROD separado, versionamento semver e releases no GitHub**. Isto é o ciclo de vida real do app.

### 27.1 Modelo mental: DEV e PROD são dois projetos ligados

Texto literal da UI: *"Create a production version of \"{name}\". This action creates a linked PROD project and ships the first release (v0.1.0)."*

`promoteFirstTime` retorna `{prodProjectId, tag}` — o backend **forka um projeto novo**. A lista de projetos ganha filtros `Dev` / `Production` e o par aparece como `DEV → PROD`. Há atalhos "Open production project" / "Open development project".

Isto é diferente de tudo em §24: publish = link público de um snapshot; promote = **ambiente de produção separado, com banco e migrations próprios**.

### 27.2 API completa

Auth de todas: query `?userId=` + header `x-user-jwt`.

| Função | Verbo + rota | Retorno / efeito |
|---|---|---|
| `previewPromote` | `GET /api/mitra-agent/promote/${ws}/${proj}/preview` | delta a promover; em erro traz `errorCode` |
| `promoteFirstTime` | `POST /api/mitra-agent/promote/${ws}/${proj}` | `{prodProjectId, tag}` — cria PROD + v0.1.0 |
| `updateProd` | `POST /api/mitra-agent/promote/${ws}/${proj}/update` | `{tag}` — nova versão no PROD existente |
| `saveRelease` | `POST /api/mitra-agent/release-tag/${ws}/${proj}` | cria git tag em DEV, **sem promover** |
| `pollStatus` | `GET /api/mitra-agent/promote/${ws}/${proj}/status` | `{state, steps[], error, prodProjectId, releaseTag}` |
| `cancelPromote` | `POST /api/mitra-agent/promote/${ws}/${proj}/cancel` | — |
| `unpublishProd` | `POST /api/mitra-agent/promote/${ws}/${proj}/unpublish` | tira de produção, mantém histórico |
| `deleteRelease` | `DELETE /api/mitra-agent/release/${ws}/${proj}/${tag}` | remove bundle + GitHub Release |
| `getReleaseFile` | `GET /api/mitra-agent/github-files/${ws}/${proj}/release-content?version=` | conteúdo de arquivo numa versão |
| — | `GET .../release-tree`, `.../releases` | árvore e lista de versões |

`state` ∈ `idle | running | success | error`.

### 27.3 As 12 etapas do promote (nomes literais)

Agrupadas em blocos na UI:

| # | Step | Label | Bloco |
|---|---|---|---|
| 1 | `step_preview` | Compute delta | Preparing production |
| 2 | `step_fork` | **Create Production project** | Preparing production |
| 3 | `step_env` | Materialize `.env.production` | Preparing production |
| 4 | `step_baseline` | Initialize baseline | Preparing production |
| 5 | `step_build` | Build frontend | Publishing application |
| 6 | `step_tarball` | Pack bundle | Publishing application |
| 7 | `step_sync_prod_repo` | **Sync code DEV→PROD** | Publishing application |
| 8 | `step_apply` | **Apply PROD migrations** | Applying database changes |
| 9 | `step_deploy` | Deploy to S3 | Publishing application |
| 10 | `step_changelog` | Update CHANGELOG | Recording version |
| 11 | `step_github_release` | Publish GitHub Release | Recording version |
| 12 | `step_tag` | Create git tag | Recording version |

Blocos adicionais: `block_legacy` ("Updating internal publication" — ponte para o publish do §24), `block_save`, `block_save_changelog`.

### 27.4 Regras de negócio observadas (as partes difíceis)

- **Migrations são forward-only.** Literal: *"Migrations already applied in PROD are NOT reverted (forward-only)"*. Apagar uma release remove bundle e GitHub Release, mas **não desfaz o banco**.
- **Dry run acontece dentro do promote**, não antes: *"{n} pending migrations — the dry run runs during promote"*.
- **O agente conserta falha de promote.** Em erro, a UI mostra "Failed at step \"{step}\"" com botão **"Resolve with the agent"** / "Resolve now". O gate diz *"There are pending items — the agent can resolve them"*. Ou seja: falha de deploy vira tarefa do agente, com o step nomeado como contexto.
- **Não cancelável na prática**: apesar do endpoint `/cancel`, a UI diz *"Please wait for completion. This process cannot be cancelled."*
- **Save Release ≠ Promote**: *"Creates a git tag in DEV as a snapshot. Does not promote to production."* Permite acumular versões e promover uma antiga depois ("Promote this version").
- **Promover versão arbitrária**: escolhe-se entre "IN EDITING" (`Current project (create new version)` — inclui mudanças não salvas) e "SAVED RELEASES".
- **Unpublish** derruba o link público imediatamente, mas mantém o histórico para republicar.
- Preview mostra: `Pending migrations`, `Commits since last version`, `Next version`.
- Release detail traz: changelog, commit SHA, "Released by", migrations da versão, lista de commits, link "View on GitHub".

### 27.5 Achado lateral: `TEMPLATE_LOCK`

No mesmo bloco i18n: projetos criados de template oficial carregam badge "Official template" / "Customized", com aviso *"Using the Agent will unlink the project from the template"* e "New version available" + botão Update. Existe um `POST /api/mitra-agent/proxy/agentAiShortcut/mergeMitraPackageBaseline` que faz o merge do baseline do pacote Mitra — é como templates recebem atualização upstream enquanto não foram "destravados" pelo agente.

### 27.6 Classificação

| Achado | Classificação | Nota Conexus |
|---|---|---|
| PROD como projeto forkado e ligado ao DEV | **ADOPT** | Isolamento real de ambiente; melhor que flag de "modo prod" |
| 12 steps nomeados e observáveis no status | **ADOPT** | Deploy legível passo a passo é requisito, não luxo |
| Falha de deploy vira tarefa do agente ("Resolve with the agent") | **ADOPT** | Fecha o loop agente↔operação. Padrão forte pro Conexus |
| Migrations forward-only, sem rollback | ADAPT | Correto por default, mas precisa de plano de compensação explícito |
| Dry run só dentro do promote | **REJECT** | Descobrir migration quebrada no meio do deploy é tarde; validar antes |
| Save Release desacoplado de Promote | ADOPT | Separar "marcar versão" de "publicar versão" é o certo |
| Promote de release arbitrária (rollback via promote de tag antiga) | ADOPT | Rollback de código sem rollback de schema — coerente com forward-only |
| GitHub Release + CHANGELOG automáticos | ADOPT | Histórico auditável de graça |
| Endpoint `/cancel` que a UI diz não poder cancelar | REJECT | Contrato inconsistente; ou cancela ou não expõe |
| `mergeMitraPackageBaseline` p/ atualizar template upstream | REFERENCE | Resolve "template evoluiu depois que o cliente forkou" |

## 28. Coordinator, chaves BYOK e login OAuth no sandbox

### 28.1 Coordinator: existe no protocolo, não existe na UI

Varredura dos **367 chunks**: `coordinator` aparece em **um único arquivo** (`useAgentWebSocket`), nas três funções que o emitem — e **nenhum componente as importa**.

```js
sendCoordinatorClaudeLoginStart(workspaceId)    → {type:"coordinator_claude_login_start",    payload:{workspaceId}, taskId:""}
sendCoordinatorClaudeLoginCallback(ws, url)     → {type:"coordinator_claude_login_callback", payload:{workspaceId, callbackUrl}, taskId:""}
sendCoordinatorClaudeLoginCancel(workspaceId)   → {type:"coordinator_claude_login_cancel",   payload:{workspaceId}, taskId:""}
```

Diferença de escopo é o que importa: o login normal é por **task** (`batchGroupId` + `userIds[]`), o do coordinator é por **workspace**. Sugere um processo de agente de nível de workspace — orquestrador acima das tasks — cuja credencial é provisionada separadamente. **Conclusão factual: capacidade server-side com UI ausente** (feature em construção, removida, ou acionada por rota interna). Não há evidência de comportamento; não afirmo que existe orquestração multi-task, só que o protocolo a prevê.

### 28.2 Login Claude roda como terminal dentro do sandbox

Componente `ClaudeLoginTerminal`, props `{batchGroupId, userIds}`. Fluxo por WS, sem REST:

1. emite `claude_login_start {batchGroupId, userIds}`
2. recebe `claude_login_data` — payload traz `automaticUrl`, aberto em nova aba
3. usuário cola o código de callback → `claude_login_callback {callbackUrl}`
4. recebe `claude_login_complete {success}` ou `claude_login_error {error}`
5. timeout de **30s** esperando resposta do servidor

`batchGroupId` + `userIds[]` = provisionamento de credencial **em lote para vários usuários** de uma vez.

### 28.3 Painel de chaves: escopo e providers

`scope.kind` ∈ **`user` | `connection`** — chave pessoal ou chave amarrada a uma conexão.

Dois modos de auth: **OAuth** (`claude-oauth` / `openai-oauth`) e **API key** por provider. Providers com logo no painel: `anthropic`, `openai`, `gemini`, `minimax`, `kimi`, `glm`, `qwen`, `openrouter` — **minimax, kimi e qwen não aparecem no `OPENCODE_MODELS`** do §26.5, logo o catálogo de chaves é mais largo que o de modelos selecionáveis (provavelmente via `isDynamicProvider`/`fetchModels`, que busca modelos do provider em runtime).

Claude OAuth é **gated por domínio**: `isClaudeOAuthAllowed` vem de `loadEnabledDomains` (há um `manageProviderDomainsModal`). Modelos marcados `isFree` são auto-habilitados ao validar a chave.

Endpoints: `/api/mitra-agent/keys`, `/keys/validate`, `/models/${provider}`, `/connections`, `/connections/models`, `/connections/registry`, `/connections/auth/{claude,openai}`, `/auth/{claude,codex,openai}`.

### 28.4 Persistência do histórico de task

`GET /api/mitra-agent/tasks/` e `GET /api/mitra-agent/tasks/${taskId}/messages` — é daqui que vêm as 322 mensagens medidas em §26.1. Histórico é server-side e recarregável, não estado efêmero de socket.

### 28.5 Classificação

| Achado | Classificação | Nota Conexus |
|---|---|---|
| Credencial de agente com escopo workspace (coordinator) | **SPIKE** | Se vamos ter orquestrador, ele precisa de identidade própria — desenhar antes |
| Login OAuth em lote (`batchGroupId` + `userIds[]`) | ADOPT | Onboarding de time sem N logins manuais |
| OAuth conduzido por WS com terminal no sandbox | ADAPT | Funciona, mas colar código manualmente é fricção |
| `scope: user \| connection` para chaves | **ADOPT** | Separar chave pessoal de chave de integração é correto |
| Claude OAuth gated por domínio de email | ADOPT | Controle de quem pode usar assinatura corporativa |
| Catálogo de chaves > catálogo de modelos | REFERENCE | Providers dinâmicos evitam hardcode de modelo |
| Histórico de task via REST paginável | ADOPT | Sessão longa exige histórico server-side |
