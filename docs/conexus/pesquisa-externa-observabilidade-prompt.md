# Prompt — deep research externa: Observabilidade mínima de plataforma de agentes (T13)

> Cole o texto abaixo numa sessão de deep research (ChatGPT). Saída esperada: relatório com
> fontes, separando fato de opinião, cobrindo as perguntas na ordem.

---

Pesquise a fundo o estado da arte (2025–2026) de **observabilidade mínima para uma plataforma
de agentes LLM operada por uma pessoa só**, e valide/refute as posições preliminares abaixo.

**Contexto do sistema (fixo, não re-decidir):** plataforma AI-first que constrói e opera apps
de negócio sobre ERPs. Hub Node.js próprio + Postgres (verdade operacional única) + git
(verdade de artefatos publicados). Agente de produção = loop próprio no hub usando Vercel AI
SDK como camada de provider (telemetria da lib desligada por decisão; eventos de trace nascem
no NOSSO loop). Builder = agente em sandbox efêmero (E2B) que devolve trabalho como git bundle
auditado. Fase 1: operador solo, infra ~US$0, inferência BYOK. Já decidido: trace = eventos
estruturados no Postgres com nomes alinhados a OTel `gen_ai.*` (exporter/ferramenta externa
tipo Langfuse só sob gatilho futuro); custo gravado na escrita do evento; captura de conteúdo
raw = opt-in cifrado com TTL; budgets duros por run (incl. maxCostUsd) computados antes do
efeito; UI precisa exibir custo por turno/execução/projeto; checklist vivo de tarefas
(estilo TodoWrite) é requisito; `tasks.md` durável no repo do projeto é requisito.

**Perguntas (responda todas, com fontes):**

1. **Schema de eventos de agente em Postgres puro.** Padrões reais (não SaaS) para tabela
   append-only de eventos de agente: uma tabela genérica com `type` + jsonb vs tabelas por
   tipo (llm_call / tool_call / turn / todo_update)? Chaves de correlação recomendadas?
   Particionamento/retention para volume de operador solo (dezenas de conversas/dia, turnos de
   até milhões de tokens de cache read)? Onde times pequenos se queimaram (índices em jsonb,
   crescimento, vacuum)?
2. **OTel GenAI semantic conventions hoje.** Status exato (o que mudou desde o split para repo
   próprio em jun/2026), risco de rename, e a prática de quem adota só o VOCABULÁRIO como
   nomes de coluna sem stack OTel — casos documentados, arrependimentos.
3. **Custo BYOK multi-provider.** Melhor prática para tabela de preços versionada (LiteLLM
   `model_prices_and_context_window.json` como seed — alternativas?); custo congelado na
   escrita vs recalculado; representação de custo quando `usage` não veio (estados
   estimado/reconciliado/desconhecido — alguém formaliza isso?); tracking separado de cache
   read/write (Anthropic 0,1×/1,25×) — erros comuns de contabilidade; custo de "tempo de
   parede" de sandbox como dimensão separada do custo de token.
4. **Protocolo de eventos de plano/checklist.** Existe padrão emergente para "plan/todo events"
   no fio (AG-UI protocol? Vercel AI SDK data stream parts custom? A2A?)? Como
   Devin/Manus/Claude Code modelam o evento de atualização de plano (schema real, se
   documentado)? Autoridade da lista: cliente, modelo ou servidor?
5. **Arquivo de plano durável no repo.** Prática de "todo.md/tasks.md relido pelo agente"
   (Manus recitation, Claude Code CLAUDE.md/tasks): evidência de eficácia contra perda de
   objetivo após compaction/corte de contexto; conflitos conhecidos entre arquivo-no-repo e
   estado-no-servidor (quem ganha?); alguém trata o arquivo como projeção e o servidor como
   autoridade (ou o inverso) explicitamente?
6. **Semântica de "concluído" em agentes que fazem deploy.** Padrões para separar
   feito/persistido/servido; verificação pós-deploy automática (health check do artefato
   servido, comparação de digest) em plataformas de app-building (v0, Lovable, Bolt, Replit
   Agent) — o que eles verificam de fato antes de dizer "pronto"?
7. **Sucesso parcial como contrato.** Modelos públicos de resultado parcial em execução de
   dados (accepted/rejected/reasons — ex. bulk APIs: Salesforce Bulk, BigQuery load jobs):
   qual o vocabulário consolidado? Vale adotar como forma canônica de resultado de
   escrita/carga?
8. **Pré-cheque de credencial/limite antes do envio.** Como produtos que rodam sobre
   assinatura LLM (OAuth de conta Claude/OpenAI) detectam janela/limite ANTES de consumir a
   mensagem do usuário? Existe API/heurística (rate limit headers, 429 preflight, contadores
   locais de janela de 5h)? O que é possível vs impossível hoje por provider?
9. **Lineage leve leitor/escritor.** Padrões minimalistas para "quem lê / quem escreve cada
   tabela/artefato" derivado de traces de execução (não de parsing estático): alguém faz
   "escrita sem leitura" como alerta? Custo de manter isso como projeção sobre eventos?
10. **Anti-overengineering.** Para operador solo: evidência de que dashboards/alerting/
    sampling/evals-em-CI cedo foram arrependimento; e o inverso — o que times pequenos
    NÃO construíram no dia 1 e custou caro depois (além de: correlação por id, prompt exato
    persistido, tokens crus, status terminal de run — já temos esses).

**Formato:** para cada pergunta: fatos com fonte → inferência → recomendação para ESTE sistema
(solo, US$0, Postgres-only). Termine com: (a) tabela "posição preliminar nossa × sua
avaliação (confirma/refuta/refina)"; (b) top 5 riscos do nosso rascunho; (c) o que você
construiria diferente. Não recomende adotar plataforma SaaS de observabilidade — a decisão
Postgres-only F1 com gatilho já está tomada; critique-a se tiver evidência forte, mas dentro
do quadro solo/US$0.
