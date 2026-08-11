# Prompt de pesquisa externa — sandbox de execução (para ChatGPT)

> Copie tudo abaixo da linha e cole no ChatGPT (com browsing/deep research ligado).
> Objetivo: análise independente para comparar com a nossa. Não contém nossas conclusões.

---

Você é um pesquisador técnico sênior. Preciso de um relatório profundo, com **fontes primárias
(repos oficiais, docs oficiais, páginas de preço) + URLs + datas de verificação**, para uma
decisão de arquitetura. Data de hoje: 2026-08-10 — verifique o estado ATUAL (preços mudam).

## Contexto do produto

Estamos construindo o **Conexus**: plataforma AI-first que constrói e opera aplicativos de
negócio integrados a ERPs. Fase 1 é uso interno (poucos usuários, 1–5 builds simultâneos,
custo importa); fase 2 vira SaaS multi-tenant. Stack: TypeScript/Node, Postgres.

Referência de concorrente (engenharia reversa verificada): a Mitra (agent.mitralab.io) roda o
builder (Claude Code CLI) **dentro de um sandbox E2B por projeto**, com repo git, dev server de
preview e tools da plataforma via MCP.

## O que já decidimos (restrições, não re-discutir)

1. Harness em forma de **HUB próprio** (Node/TS + Postgres + pg-boss): um Lead decompõe o
   trabalho e despacha **workers de código frescos por unidade de trabalho** (agente Pi via SDK,
   multi-modelo por papel), com validadores independentes e gates de aprovação humana.
2. **Cada worker roda em sandbox isolado** — a decisão AGORA é qual tecnologia/fornecedor de
   sandbox e qual topologia.
3. Tools da plataforma são TypeScript nativas no boundary do hub; contexto vem compilado pelo
   hub (Actor Pack). Credenciais de ERP/banco **nunca** podem ficar visíveis ao agente.
4. Workers são **muitos e de vida curta** (frescos por unidade de trabalho) — latência de spawn
   e custo por hora importam mais que uptime longo.

## O que o sandbox precisa suportar (requisitos)

- Repo git do projeto (clone/worktree), Node/TS toolchain, rodar testes.
- **Dev server de preview** por projeto que o usuário humano abre no navegador (URL pública ou
  tunelada).
- Acesso de rede CONTROLADO: egress só para allowlist (ERP Sankhya via gateway, npm registry,
  APIs de LLM) — bloquear o resto.
- Injeção de segredos sem expor valor ao agente (ex.: placeholder substituído fora do alcance
  do processo do agente).
- Acesso ao Postgres do projeto (1 banco por projeto, credencial no vault do servidor).
- Pool/pre-warm opcional para reduzir cold start (workers frescos frequentes).
- Fase 2: isolamento forte multi-tenant (código de cliente A jamais alcança dados do cliente B).

## Pergunta de topologia (parte da decisão)

Duas topologias possíveis — avalie ambas:

- **A) Agente dentro do sandbox**: processo do worker (Pi) roda dentro do sandbox com o repo
  (estilo Mitra). Hub conversa com ele por rede/stdio.
- **B) Agente fora, execução dentro**: worker roda no host do hub; só as tools de
  execução (bash, filesystem, testes) são "bridged" para dentro do sandbox.

## Candidatos (avalie todos; combinações válidas)

**Gerenciados:** E2B (o que a Mitra usa) · Daytona · Modal · Fly.io Machines · Cloudflare
Sandboxes/Containers · Vercel Sandbox · outros relevantes que encontrar.
**Self-host / OSS:** Docker hardened (gVisor/Kata) · Firecracker direto · **Gondolin**
(micro-VM da Earendil, usada no pi-chat — investigue o mecanismo de placeholder de secrets e
allowlist de hosts) · sandbox-runtime da Anthropic · microsandbox ou similares.
**Local/dev:** WSL2/Docker Desktop para desenvolvimento da própria plataforma.

## Perguntas obrigatórias

1. **Estado atual de cada candidato**: preço real (por segundo/hora/GB), cold start medido,
   persistência/snapshot/pause-resume, template custom, limites (CPU/RAM/disco), região
   (América do Sul?), licença, maturidade, o que acontece no idle.
2. **E2B em detalhe** (benchmark do concorrente): modelo de cobrança, sandbox persistente ×
   efêmero, egress control, secrets, SDK TS, self-host existe?
3. **Caminho self-host em detalhe**: esforço real de operar Firecracker/gVisor vs Docker
   simples; Gondolin está pronto pra produção? O que o pi-chat da Earendil faz exatamente
   (1 VM por sessão? secrets? rede?).
4. **Custo estimado** para nosso perfil: 1–5 builds simultâneos, worker médio de 10–40 min,
   ~200 execuções/mês na fase 1 — calcule para os 3 melhores candidatos.
5. **O que produtos reais usam** para sandbox de coding agent — Mitra (=E2B, verificado),
   Cursor background agents, GitHub Copilot coding agent, Ona/Gitpod, Devin, Factory,
   OpenHands, Codex da OpenAI, Claude Code on the web da Anthropic: tecnologia própria ou
   fornecedor? Conte o placar (gerenciado × self-host × híbrido).
6. **Preview de app**: como cada candidato expõe um dev server com URL pública/tunelada
   (subdomínio? proxy? auth na frente?).

## Formato de saída

- Relatório estruturado em markdown, seções numeradas, URL + data em cada fato relevante.
- Tabela comparativa: candidatos × critérios (custo no nosso perfil; cold start; egress
  allowlist; secrets sem expor ao agente; preview URL; pool/pre-warm; isolamento multi-tenant;
  esforço de operação; lock-in; licença).
- **Recomendação final com nível de confiança** — separando: (a) fase 1 interna, (b) fase 2
  SaaS, (c) topologia A × B — e os 3 maiores riscos.
- Marque explicitamente o que você NÃO conseguiu verificar.
