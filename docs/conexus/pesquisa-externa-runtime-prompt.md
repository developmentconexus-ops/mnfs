# Prompt de pesquisa externa — runtime do agente (para ChatGPT)

> Copie tudo abaixo da linha e cole no ChatGPT (com browsing/deep research ligado).
> Objetivo: análise independente para comparar com a nossa. Não contém nossas conclusões.

---

Você é um pesquisador técnico sênior. Preciso de um relatório profundo, com **fontes primárias
(repos oficiais, docs oficiais, npm registry) + URLs + datas de verificação**, para uma decisão
de arquitetura. Data de hoje: 2026-08-10 — verifique o estado ATUAL, não posts antigos.

## Contexto do produto

Estamos construindo o **Conexus**: plataforma AI-first que constrói e opera aplicativos de
negócio integrados a ERPs (estilo Lovable/Base44, mas B2B com conhecimento profundo da empresa
do cliente). Fase 1 é uso interno (nós entregamos apps para clientes usando a plataforma);
fase 2 vira SaaS. Stack alvo: TypeScript/Node, Postgres.

Nós fizemos engenharia reversa completa de um concorrente brasileiro (Mitra, agent.mitralab.io).
Como a Mitra funciona, em resumo verificado: o builder é o **Claude Code CLI** spawnado
server-side num sandbox E2B por projeto; a única camada de instrução por projeto é um `CLAUDE.md`
na raiz do repo; tools da plataforma entram via **MCP**; auth via OAuth da assinatura Claude
Pro/Max do usuário ou API key BYOK; é **uma sessão única de builder** (sem orquestração
multi-agente); etapa de escopo usa Gemini com template de prompt; checklist de tarefas via
TodoWrite do Claude Code aparece na UI; sem skills, sem plugins.

## O que já decidimos (restrições, não re-discutir)

1. Nosso harness de build terá forma de **HUB**: um Lead decompõe o trabalho e despacha
   **workers** (agentes de código) com contexto fresco por unidade de trabalho, validadores
   independentes do implementador, estado externalizado em **Postgres**, gates de aprovação
   humana (plano visual aprovável antes de codar), eventos ao vivo para a UI web (checklist,
   progresso, custo). Inspiração: Factory.ai Missions e FirstMate (crew orchestrator do
   Mario Zechner sobre o agente Pi).
2. **Multi-modelo por papel é requisito**: ex. scope com modelo barato, builder com modelo
   forte, validator com modelo diferente para independência real.
3. Cada worker roda em **sandbox** isolado (decisão de qual sandbox é separada — não pesquisar).
4. Precisamos de **controle total do system prompt** dos workers (injetamos contexto em camadas:
   plataforma → empresa → projeto → tarefa).
5. Tools da plataforma (registrar artefatos, rodar SQL, provisionar) expostas ao worker — o
   mecanismo (MCP ou tools nativas TS) faz parte da decisão.

## A decisão a pesquisar

**Qual runtime executa os workers de código, e qual camada orquestra o hub?** Candidatos:

- **Pi** (github.com/earendil-works/pi, ex badlogic/pi-mono, criado por Mario Zechner, hoje na
  Earendil do Armin Ronacher) — agente de código minimalista TS, embutível via SDK
  (`createAgentSession`), multi-provedor (~30), tools customizadas via extensions.
- **Claude Agent SDK** (Anthropic) — mesmo motor do Claude Code como biblioteca TS; hooks,
  MCP in-process, sessões, custo por turno; só modelos Claude.
- **Mastra** (mastra.ai, v1.0 GA jan/2026) — framework TS de agentes: workflows duráveis com
  suspend/resume, supervisor agents, memória (incl. observational memory), evals, streaming,
  `@mastra/acp` para embrulhar CLIs de código como agentes.
- **Hub próprio** (Node/TS + Postgres + fila tipo pg-boss, ou Temporal/Inngest para
  durabilidade) orquestrando qualquer um dos runtimes acima como workers.

Combinações são válidas (ex.: hub próprio + workers Pi; Mastra + workers Claude Agent SDK...).

## Perguntas obrigatórias

1. **Estado atual de cada candidato** (versão, data de release, cadência, mantenedores,
   bus factor, licença, breaking changes recentes, downloads npm).
2. **Pi em detalhe**: SDK embutível está estável? MCP (não tem nativo — quais adaptadores
   existem? mcporter? esforço de extension própria?); delegação/subagents (não tem nativo —
   que padrões/implementações existem? FirstMate? /control do Ronacher?); economia real de
   tokens (system prompt <1k?); performance verificável vs Claude Code (Terminal-Bench etc.);
   o que o login por assinatura Claude Pro/Max dentro do Pi realmente cobra (franquia do plano
   ou "extra usage" por token?).
3. **Mastra em detalhe**: o que o core Apache 2.0 inclui vs o que exige Enterprise License
   (ee/ — auth/RBAC/SSO/Agent Builder?); supervisor agents (mecânica real); observational
   memory (arquitetura, dá pra usar isolada?); issues abertas relevantes de escala (snapshots
   grandes com suspend/resume humano, crescimento de tokens em workflows multi-step); estado
   pós-incidente de supply chain de jun/2026 (145 pacotes) — o que mudou.
4. **Claude Agent SDK em detalhe**: viabilidade como worker num hub multi-modelo (só Claude —
   isso mata como runtime único?); política da Anthropic sobre terceiros usarem login/assinatura
   claude.ai em produto próprio; hooks/permissões/eventos de task para UI.
5. **O que orquestradores reais de coding agents usam** — Factory.ai Missions, Codebuff,
   OpenHands, sistema multi-agente da Anthropic, GitHub Copilot coding agent, Cursor background
   agents, Ona/Gitpod, vibe-kanban, Claude Squad, Terragon: framework pronto ou código próprio?
   Com evidência. Conte o placar.
6. **Código aberto reutilizável**: quais desses (e do ecossistema Pi: FirstMate, Treehouse,
   Lavish, pi-chat) são MIT/Apache e valem minerar código/ideias para o nosso hub?

## Formato de saída

- Relatório estruturado em markdown, seções numeradas, URL + data em cada fato relevante.
- Tabela comparativa final: candidatos × critérios (multi-modelo por papel; controle do system
  prompt; tools próprias; eventos streaming p/ UI; sessões retomáveis; durabilidade/cron do
  hub; maturidade/risco; licença/custo; esforço de integração).
- **Recomendação final com nível de confiança** (arquitetura completa: hub + runtime + como
  tools da plataforma entram), e os 3 maiores riscos da recomendação.
- Marque explicitamente o que você NÃO conseguiu verificar.
