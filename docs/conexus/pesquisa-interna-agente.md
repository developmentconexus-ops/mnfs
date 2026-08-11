# Pesquisa interna — agente de 1ª classe (tópico 9)

> **Natureza.** Pesquisa interna do tópico 9, conduzida em 2026-08-11 por 4 varreduras paralelas
> de fontes primárias (docs oficiais, pricing pages, specs, repos, papers), cada uma cobrindo um
> cluster das 10 perguntas do [prompt externo](pesquisa-externa-agente-prompt.md). Todo achado
> marcado como **fato** (URL verificada em 2026-08-11) ou **inferência**. Confrontada com a
> evidência primária Mitra ([doc 09](../reference/mitra/09-agente-embarcado.md)) e Factory
> ([factory-in-a-box](../research/factory-in-a-box.md)). Insumo para cruzar com o HANDOFF da
> deep research externa antes da revisão adversarial (Codex) e ratificação.

---

## Q1 — Abstração de agente: config declarativa venceu

**Fatos.**

- OpenAI **matou** seu modelo "agente como recurso server-side" — Assistants API deprecada,
  desligamento total em **26/08/2026**; substituto é Responses/Conversations + Agents SDK
  code-first **sem versionamento de agente documentado** (versionar = versionar seu código).
- **Toda plataforma que opera agentes em produção com rollback convergiu para config declarativa
  versionada por cima de runtime fixo**:
  - **LangGraph Platform** — a referência mais próxima do nosso desenho: *graph* (código
    deployado) × *assistant* (config declarativa sobre o graph); cada update cria versão; rollback
    = "promote any version to be the active version".
  - **Anthropic Managed Agents** — agente é recurso de API com `id` + `version` inteiro;
    update gera versão nova; concorrência otimista (409); a doc endossa explicitamente o padrão
    "CI job that syncs checked-in agent definitions" (git → apply).
  - **Retool Agents** — deploy cria release Major/Minor/Patch com revert por dropdown; functions
    versionadas junto do agente "so they never get out of sync".
  - **Salesforce Agentforce** — grafo de metadata XML; Winter '26 **isolou versões via bundles**
    para matar o "global ripple" (mudança em asset compartilhado quebrava todos os agentes).
  - **Claude Code subagents** — Markdown + frontmatter YAML git-first (nosso modelo natural).
  - **Letta .af** — serializa definição **e estado** (memória, mensagens) num arquivo; anti-modelo
    para nós: mistura artefato com dado de runtime.
- Não documentado: benchmark direto "LLM gera agent-config vs agent-code". Evidência é
  estrutural: config declarativa é validável por schema antes do deploy, diffável, lintável — e o
  ecossistema já gera esses formatos por LLM (skills de geração de Dify DSL, subagentes Claude
  Code, `.agent` script Salesforce "human-readable por design").

**Confronto Mitra.** A Mitra não tem abstração Agente — a "receita Playground" é re-entregue como
prompt de missão a cada task (doc 09 §1, system prompt real capturado em §3.8). O mercado de
produção inteiro contradiz essa aposta. Nosso OWN central (AGT-1) está validado por evidência
externa dupla: a Mitra prova que o *conteúdo* da receita funciona; o mercado prova que a *forma*
correta é artefato versionado.

**Posição Conexus.**

- **Agente = kind novo no registro C-005** (`agent/v1`): arquivo no repo, slug, inputSchema do
  manifest validado na compilação, deployment atômico. **Não inventar segundo mecanismo de
  versão/rollback** — o deployment por ponteiro do C-005 já é o modelo "promote version" do
  LangGraph.
- **Pinagem de refs no deployment** (lição Agentforce): na publicação, resolver e pinar as
  versões das operações de conector e artefatos `query`/`action` referenciados. Referência solta
  a "versão atual" reproduz o global ripple que a Salesforce levou 2 anos para consertar.
- **Nunca serializar estado no artefato** (anti-Letta): conversa/memória é linha de banco.
- Manifest mínimo (rascunho para a decisão):

```yaml
kind: agent/v1
slug: analisador-orcamentos
name: "Analisador de Orçamentos"
description: "..."                  # para listagem e roteamento futuro
model: { id: <modelo>, params: { maxTokens: ..., temperature: ... } }
systemPrompt: |                     # corpo longo (camada "agente" do contexto em camadas)
  ...
tools:                              # SÓ refs: operações de conector + artefatos query|action
  - ref: sankhya.pedidos.consultar  # projection resolve name/descrição/schema
    overrides: { description: "...", inputExamples: [...] }   # opcional, por agente
policies:
  approvalDefault: ask|allow        # NUNCA rebaixa o approvalFloor da operação (piso vence)
  maxTurns: N
  budget: { maxToolCalls: N, maxUsd: N }
ui: { greeting: "...", channel: app }
evalRef: analisador-orcamentos.evals
```

---

## Q2 — Superfície de tools: contrato técnico não basta, falta a camada agent-facing

**Fatos.**

- Mercado convergiu no **mesmo trio** que o connector/v1 já declara: allowlist estática
  (≈ `agentEligible`), política por risco com default conservador para o que vem de fora
  (Managed Agents: toolset MCP `always_ask` por default ≈ nossos `effects[]`), aprovação por
  chamada com deny que **retorna ao modelo como tool_result corrigível** (≈ `approvalFloor`).
- Definição de tool — evidência oficial: descrição prescritiva de 3–4+ frases é "by far the most
  important factor in tool performance" (Anthropic); `input_examples` levou acurácia de **72% →
  90%** em parameter handling complexo; enums/estrutura para tornar estado inválido
  irrepresentável; **não fazer o modelo preencher o que o runtime já sabe** (OpenAI; versão
  low-code: `$fromAI` do n8n); namespacing por serviço/recurso; resposta da tool importa tanto
  quanto o input (campos de alto sinal, truncamento com default, erros acionáveis).
- Quantidade: OpenAI "**fewer than 20 functions**" por turno; Retool "**1–10 tools**" ótimo;
  Anthropic mediu 5 MCP servers ≈ 55K tokens de definição e Tool Search recuperando acurácia
  (49%→74% Opus 4); paper arXiv 2605.24660: média adaptativa de **7.4 tools** iguala baseline de
  50.
- **τ-bench**: "function calling agents are not great at following rules provided in the policy
  documents" — **política no prompt não é enforcement**. Valida pôr a política no contrato do
  conector e o gate no hub.
- Geração de tool a partir de contrato: Speakeasy (OpenAPI→MCP) documenta agente **inventando
  registro** porque a descrição não dizia quando usar o endpoint; correções deles = descrições
  "for AI, not humans", operationId action-oriented, scopes read/write/destructive controlando
  exposição. Arcade.dev declara **auth como atributo da tool**. Composio cura schemas para reduzir
  tokens em vez de gerar cru.

**Confronto Mitra.** O agente embarcado da Mitra opera com **1 tool genérica**
(`executeServerFunction`) + contexto injetado — piso viável comprovado (13 queries sem
exploração). Mas o system prompt precisa gritar "não existe outra forma, não procure outras
ferramentas" (doc 09 §3.8) — sintoma de superfície mal projetada. Tools nomeadas projetadas por
operação, com descrição e schema próprios, são o upgrade.

**Posição Conexus (a tool projection — este tópico é o gatilho adiado do C-007).**

- Projection = **compilação** (determinística, no build do deployment): operação `connector/v1`
  → tool com nome `conector_recurso_verbo`, schema do inputSchema com **parâmetros de runtime
  removidos** (tenant, usuário, empresa/filial injetados pelo hub), resposta moldada.
- **Correção ao connector/v1**: acrescentar a camada agent-facing por operação —
  `agentDescription` (3–4+ frases, quando usar / quando não), `inputExamples`,
  `responseProjection` (quais campos voltam ao modelo). Payloads Sankhya são verbosos; sem
  shaping, queimam contexto e induzem erro. Overrides por agente no manifest.
- Orçamento: **alvo ~10, teto 20 tools por agente — validação do manifest falha acima do teto.**
  Tool search só com gatilho de catálogo grande (mitigação já existe madura no mercado; não
  construir).
- Fluxo de aprovação: pausa → allow/deny → **deny_message vira tool_result**. Enforcement
  mecânico no hub, prompt é só UX (τ-bench).

---

## Q3 — Headless: run termina, aprovação vira registro; nunca re-hidratar o LLM

**Fatos.**

- **Anti-padrão documentado**: Copilot Studio roda agente autônomo **com credenciais do maker**
  ("all triggers and actions... must use the maker's credentials") — exatamente o que nosso
  desenho evita.
- **Validação do nosso desenho**: Agentforce roda agente como **usuário dedicado com permission
  sets próprios** (fail-closed por construção da plataforma) — agente como principal próprio é
  prática de vendor líder.
- Cron de agente: LangGraph Platform tem cron de 1ª classe (thread nova por run); Claude Code
  routines (preview) idem; OpenAI Agents SDK **não tem scheduler**. Nosso AGT-3 (cron do pg-boss)
  está alinhado.
- O problema "aprovação sem humano presente" tem 3 respostas reais no mercado: (a) fila
  assíncrona (OpenAI `RunState.to_json()` em banco "aprovações que duram horas ou dias";
  LangGraph interrupt + Agent Inbox; Temporal signal + **timer durável** — único com expiração de
  1ª classe; Inngest `waitForEvent` com timeout; HumanLayer como produto inteiro); (b) degradação
  para negar — só Anthropic documenta como modo nomeado (`dontAsk`: "hard deny" para "fixed,
  explicit tool surface for a headless agent"); (c) notificar-e-abortar — blocos existem, ninguém
  nomeia como padrão.
- Orçamento por run: Claude Agent SDK tem `max_turns` **e** `max_budget_usd`; OpenAI só
  `maxTurns`; cap por **nº de ações de escrita** não documentado em nenhum vendor — contador de
  aplicação.

**Posição Conexus (fase 1).**

- Headless = job pg-boss com **identidade de agente como principal próprio** (role de banco do
  agente, Connection própria, budget por run: maxTurns + maxUsd + **maxWriteActions** — o
  contador que ninguém tem).
- **Run headless não pausa: termina.** Modo deny-por-default (equivalente `dontAsk`): ação acima
  do floor → grava **registro de aprovação pendente** no hub + notificação, run encerra. Após
  aprovação, **executor determinístico consome o registro e executa a ação exata** — não
  re-hidratar o LLM para "concluir" (mais barato; elimina a janela de o modelo re-decidir após a
  aprovação).

---

## Q4 — Contexto em camadas: mapeia 1:1 nos cache breakpoints; caching é pré-requisito

**Fatos.**

- Anthropic: 4 breakpoints `cache_control`; hierarquia `tools` → `system` → `messages` com
  invalidação em cascata; match byte a byte; TTL 5min (renova a cada hit) / 1h; escrita 1.25×/2×,
  leitura 0.1×; break-even do 5-min = 2 requests. OpenAI: automático ≥1024 tokens, leitura 10%,
  TTL ~5–30min (24h em modelos selecionados).
- Aritmética do nosso cenário (30k de prefixo estável, dezenas de conversas/dia): por turno,
  prefixo cacheado custa ~1/10 do não-cacheado; no custo total da conversa, caching corta
  **~3.7×** (conta na Q10). **Não é otimização: é pré-requisito do desenho.**
- Context rot (Chroma, 18 modelos): degradação com crescimento do input mesmo em tarefa trivial;
  **distratores degradam mais que tamanho**; LongMemEval: input focado (~300 tokens relevantes)
  supera input completo (~113k). Faixas de degradação relatadas começam ~300–400k em modelos 1M —
  **1–2 ordens de magnitude acima dos nossos 10–30k**. Anthropic oficial: "smallest possible set
  of high-signal tokens"; Claude Code usa híbrido (CLAUDE.md upfront + exploração just-in-time).
- Regressão de prompt mínima viável: **promptfoo** (MIT, local, CI, assertions determinísticas +
  LLM-rubric). Langfuse prompt-management/Braintrust = valiosos com time/volume, não fase 1.

**Confronto Mitra.** Os 3 blocos injetados (TOKENS + SCHEMA + CONVENCOES, doc 09 §3.3f) e as 13
queries sem exploração replicam o achado LongMemEval: contexto focado > exploração. A Mitra não
versiona nem camadiza (2 campos de texto concatenados). Nosso desenho em camadas é o upgrade — e
a ordem plataforma → grupo → projeto → agente → runtime **já é** a ordem estável→volátil que o
cache exige.

**Posição Conexus.**

- Alocação dos 4 breakpoints: (1) fim de `tools` (projection compilada do deployment), (2) fim de
  plataforma+grupo+projeto, (3) fim da camada agente (muda por deploy do agente), (4) breakpoint
  móvel no fim do histórico. Dados voláteis por turno **depois** do último breakpoint, nunca no
  meio do prefixo.
- Camadas = artefatos versionados (git + deployment), compostas pelo hub por request. Hash da
  composição gravado no trace (Q8) — regressão de prompt vira diff mecânico.
- Schema inline: manter enquanto curado por projeto. **Gatilho para híbrido** (resumo inline +
  tool de detalhe): schema curado > ~50–100 tabelas ou prefixo estável > ~60–80k tokens. O limite
  é curadoria/distrator, não contagem.
- Dia 1: promptfoo com 10–20 golden questions do caso 1 (assertions sobre slug chamado/SQL/número
  correto), rodando a cada mudança de camada.

---

## Q5 — Runtime do embarcado: loop direto no hub. NÃO reusar o harness do builder

**A maior correção da pesquisa à nossa direção.**

**Fatos.**

- O produto oficial da OpenAI para chat multi-turno é **loop stateless + estado persistido
  server-side** (Conversations API) — não sandbox. LangGraph produção = PostgresSaver
  (checkpoints em Postgres). Vercel AI SDK = app é dono do histórico (`onFinish` → DB). **Retool
  Agents roda loop LLM sobre Temporal** (workflow durável), não sandbox-por-conversa — o
  app-builder mais próximo do nosso caso escolheu loop + workflow engine.
- A doc do próprio Claude Agent SDK adverte: "Don't rely on session resume... capture results as
  application state... often more robust than shipping transcript files around".
- Custo/latência de sandbox no caminho crítico: E2B cold ~150ms (Firecracker 125–200ms) + sessão
  máx 1h + **20 concorrentes no free tier** (estoura com 5–50 usuários); Modal 2–4s cold.
- Nenhuma fonte primária encontrada usa coding-harness-em-sandbox para chat embarcado de
  produção.

**Confronto Mitra.** A Mitra usa Claude Code CLI em E2B **também** para o embarcado (doc 09) — é
o mesmo backend do builder, com system prompt mandando o agente ignorar as próprias ferramentas
("não liste projetos, não leia arquivos, não explore"). Funciona, mas paga sandbox + harness de
engenharia de software para um caso que só chama tools declarativas. Distrator custa acurácia
(Chroma), além de custo e latência.

**Posição Conexus.**

- **Runtime embarcado = loop de chat no próprio hub**: mensagem → compõe camadas (Q4) → chama API
  com tools = projection do deployment → executa tool calls in-process via `execute(slug, input)`
  e operações de conector (Capability Gateway) → persiste turno no Postgres → responde. Sessão
  stateless por turno; histórico em tabela `conversation`/`message`; janela = últimas N + resumo
  quando crescer.
- Sandbox continua **exclusivo do builder** (C-008), onde há código arbitrário. O embarcado não
  executa código arbitrário — sandbox não protege nada ali, só adiciona cold start, custo,
  limite de concorrência e vendor no caminho de toda mensagem. Efeito colateral positivo:
  **reduz** dependência E2B (chat funciona com PC do operador ligado e zero infra alugada).
- Responde o "runtime decide no tópico 9" do AGT-2: dois runtimes, um harness — builder (worker
  Pi fresco em microVM) e embarcado (loop leve no hub). `AgentTaskSession` (AGT-5) é a interface
  de eventos tipados sobre esse loop (streaming, fila, reconexão — requisitos confirmados pela
  resiliência do WS Mitra, doc 09 §2).

---

## Q6 — HITL mecânico: registro durável, hash do payload, expiração fail-closed

**Fatos.**

- Bloqueio real existe e é padrão: Claude SDK `canUseTool` **pausa até o callback responder** (e
  deny rules valem até em bypass); LangGraph `interrupt()` não anda sem `Command(resume)`, estado
  no checkpointer Postgres; OpenAI "the tool call does not execute" sem decisão, `RunState`
  serializável, aprovação amarrada a `arguments` da chamada específica.
- Lacunas do mercado: **nenhum SDK documenta TTL/expiração de aprovação** (só Temporal/Inngest
  têm timers duráveis); LangGraph reexecuta o nó desde o início no resume (efeitos colaterais
  rodam 2×); Claude SDK: pausa default é promise em memória (morre com o processo; `defer` é o
  caminho durável opt-in); footgun documentado: "auto-approved tools never reach canUseTool".
- Escopo: "always" no Claude SDK **vira política persistida em arquivo versionável**, não flag de
  sessão.

**Confronto Mitra.** Gate mecânico existe só para tools do builder; a pergunta ao usuário
(AskUserQuestion) é convenção de prompt — sistema não bloqueia tools posteriores (doc 09 /
handoff). Confirmado como gap que cobrimos com regime mecânico único.

**Posição Conexus.**

- Tabela `approval_request` no hub desde o dia 1: `{ id, run_id, agente, operacao, payload_json,
  payload_hash, floor, status, expires_at, decided_by, decided_at }`.
  - **Hash do payload canônico** — aprovação amarra à chamada exata; executor recusa se divergir
    (TOCTOU). Aprovar "a intenção" e deixar o LLM re-emitir é convenção, não gate.
  - **`expires_at` com expirado = rejeitado** (fail-closed). Coluna + predicado; ficamos à frente
    da doc de todos os vendors.
  - Escopo **once por default**; "always" só como mutação de política ratificada (contrato /
    política do projeto, versionada), nunca flag efêmera.
- Chat interativo (fase 1, operador presente): pausa in-process aceitável, **mas o registro é
  gravado antes de pausar** — processo morre, aprovação sobrevive, executor determinístico
  completa (mesma mecânica do headless Q3).
- **Card de aprovação renderiza do registro mecânico** (operação, parâmetros, effects, floor) —
  nunca da prosa do agente: modelo exposto a conteúdo não confiável pode mentir sobre a ação.
- Deny com mensagem volta ao modelo como tool_result (contexto corrigível).

---

## Q7 — Memória: fase 1 não tem camada dedicada; gatilho definido

**Fatos.**

- Estado 2026: Anthropic memory tool GA (client-side, self-write, segurança por sua conta — path
  traversal citado na própria doc); Mem0 (extração por LLM, aditivo); Zep (grafo temporal com
  invalidação, maduro); Letta **em transição de arquitetura** (SDK V1 deprecado → V2 MemFS);
  Mastra Memory (working memory + semantic recall + **observational memory por processo
  assíncrono**); OpenAI: memória do ChatGPT **não existe na API**.
- Envenenamento medido: **MINJA — >95% de sucesso injetando memória maliciosa só com queries de
  usuário comum** (arXiv 2601.05504); AgentPoison persiste em memória/KB. Mitigações da
  literatura: memória candidata separada da confiável, **promoção mediada pelo runtime** (não
  pelo agente em contato com o usuário), gating em 2 estágios.

**Confronto Mitra.** Memória Mitra = 2 campos de texto por projeto + docs de planejamento relidos
(builder). Sem camadas, sem versão, sem por-usuário. Nosso contexto em camadas versionado já
supera; o slot que nem nós cobrimos é **por usuário**.

**Posição Conexus.**

- Fase 1: memória = histórico de conversa (Postgres) + camadas de contexto versionadas
  (auditáveis via git, com dono e review — **imunes a MINJA por construção**: usuário não escreve
  nelas). A "memória factual" verdadeira do caso de uso mora no ERP, acessada por
  `execute(slug,input)`.
- **Gatilho observável para camada dedicada**: recorrência registrada de usuários re-ensinando o
  agente entre conversas ("já falei que frete entra no total") **e** o fato ser por-usuário (não
  promovível à camada do projeto). Quando disparar: tabela `user_facts` no Postgres (fato tipado,
  origem, escopo usuário×projeto), **escrita por job assíncrono de extração com gate do runtime —
  nunca self-write do agente em chat multi-usuário** (MINJA), injetada como bloco na camada
  runtime. Zep/Mem0 só se a tabela caseira falhar.

---

## Q8 — Observabilidade: trace no Postgres do hub, nomes OTel, promptfoo; Langfuse por gatilho

**Fatos.**

- Langfuse: core MIT, mas self-host atual (v4) exige **4 serviços** (Postgres + ClickHouse +
  Redis + S3) — para dezenas de conversas/dia é overengineering contra a fase 1. Cloud Hobby
  grátis (50k units/mês) cobriria o volume, **se** dados de ERP pudessem sair (governança: não).
- LangSmith self-host só Enterprise; Braintrust free = retenção 14 dias (não serve de store);
  Phoenix = Elastic License (não OSI).
- OTel GenAI semconv: repo dedicado, status **"Development" — não estável**; atributos-chave:
  `gen_ai.operation.name`, `gen_ai.provider.name`, `gen_ai.request/response.model`,
  `gen_ai.usage.input_tokens/output_tokens/cache_creation.input_tokens/cache_read.input_tokens`
  (mapeiam 1:1 no `usage` da API Anthropic).
- promptfoo: MIT, 24k stars, local, CI. Eval de desenvolvimento/regressão — não monitor de
  produção.

**Posição Conexus (instrumentar desde o dia 1 — hub já intermedia tudo, custo ~zero).**

- Tabela `llm_call` (nomes alinhados a `gen_ai.*`, coluna `schema_version` — semconv ainda muda):
  trace_id (conversa), session_id, user_id, parent_span_id; modelos request/response + provider +
  operation; **os 4 campos de usage separados, nunca somados** (sem isso não audita caching
  depois); **custo USD calculado na escrita + `price_table_version`** (recalcular retroativo é
  impossível); started/ended, time_to_first_token, stop_reason, error; params;
  **`prompt_version`/hash da composição de camadas + variáveis separadas do texto final** (o
  campo de que mais se arrepende de não ter); payloads completos em JSONB (replay → golden
  dataset).
- Tabela `tool_call`: nome, input, resultado (truncado + tamanho original), duração, erro, span
  pai. Append-only (dobra como trilha de auditoria da Q9).
- Tabela `score` (nome, valor, fonte: user_feedback | judge | manual) ligada a trace_id — modelo
  Langfuse/Braintrust; habilita eval online futuro sem migração.
- Eval: promptfoo 20–50 golden questions + thumbs up/down do usuário + revisão manual semanal dos
  scores negativos. LLM-as-judge só quando volume inviabilizar revisão manual.
- **Gatilho Langfuse** (self-host ou cloud conforme governança): necessidade real de UI de
  análise / annotation queue / judge em escala. Migração mecânica (ambos falam OTel).

---

## Q9 — Segurança: desenho mais estrito que os defaults de mercado; 2 adições baratas

**Fatos.**

- Lethal trifecta (Willison) + paper "Design Patterns for Securing LLM Agents" (arXiv
  2506.08837): uma vez ingerido input não confiável, deve ser **impossível** disparar ação
  consequente — padrões Action-Selector / Plan-Then-Execute / Dual-LLM / CaMeL.
- Meta "Rule of Two": máx 2 de {input não confiável; dados sensíveis; mudar estado/comunicar} por
  sessão sem supervisão. Willison forçou correção de "safe" para "lower risk".
- Números honestos: safeguards Anthropic reduziram ataque 23.6%→11.2% (autônomo) — mitigação
  real existe, eliminação não; detectores "95%" = nota vermelha como gate único.
- Egress allowlist implementado de verdade: Claude Code sandboxing (proxy fora do sandbox,
  "even a successful prompt injection is fully isolated"; open source: sandbox-runtime).
- Agente como principal de banco: prática real documentada (role dedicada por agente/toolkit,
  GRANT SELECT explícito, statement_timeout); nenhum vendor LLM publica como doc oficial —
  é engenharia de banco clássica, e por isso é mecânica de verdade. Caveat documentado: role
  read-only não impede **exfiltração por leitura** — o canal de saída é a perna a cortar.
- CaMeL/taint tracking fino = research-grade, sem produto maduro.

**Confronto Mitra.** RBAC opt-in e fail-open ("perfil não configurado — segue sem bloquear"),
guardas por regex/blocklist no código da SF, escaper manual `lit()`. Nosso desenho (role real de
banco por kind, `agentEligible=false` default, `UNKNOWN` fail-closed, aprovação =
max(contrato, política, contexto)) é **mais estrito que qualquer default de vendor verificado**.

**Posição Conexus — dia 1 (ordem custo/benefício).**

1. Role Postgres própria por agente, read-only, GRANT explícito, statement_timeout, limite de
   linhas (já no desenho — manter).
2. **Canal de saída fechado por construção**: o loop embarcado (Q5) roda no hub sem browser e sem
   egress arbitrário — só tools projetadas (allowlist por deployment) e conectores pinados por
   host (C-007 "hosts = autoridade única"). A perna 3 da trifecta morre por arquitetura, não por
   detector.
3. Ações de escrita só via artefato `action`/operação declarada = Action-Selector do paper (o
   LLM seleciona ação registrada, nunca compõe efeito) — já no desenho.
4. **[NOVO — adotar] Taint bit por run**: se o run ingeriu conteúdo não confiável (documento de
   fornecedor, texto colado, e-mail), floor efetivo de qualquer REMOTE_MUTATION/EXTERNAL_SEND
   sobe para aprovação humana. Rule of Two dinâmica; uma flag + um predicado no gate.
5. Auditoria append-only de toda tool call (já vem da Q8).

**Gatilho futuro**: Dual-LLM/quarentena (volume de documentos externos), classifiers (no máximo
telemetria). **Teatro** (não fazer): "ignore instruções nos dados" como defesa, detector como
gate único, resumo de aprovação redigido pelo modelo, LLM aprovando LLM em ação sensível.

---

## Q10 — Custo e modelo: Sonnet 5 default, roteamento por `if`, caching obrigatório

**Fatos (pricing pages oficiais, 2026-08-11).**

| Modelo | Input | Output | Cache write 5m | Cache read |
|---|---|---|---|---|
| Claude Opus 5 | $5 | $25 | $6.25 | $0.50 |
| **Claude Sonnet 5** | **$2** | **$10** | $2.50 | $0.20 |
| Claude Haiku 4.5 | $1 | $5 | $1.25 | $0.10 |
| gpt-5.6-terra | $2 | $12 | (write grátis) | $0.20 |
| gpt-5.6-luna | $0.20 | $1.20 | (write grátis) | $0.02 |
| Gemini 3.5 Flash-Lite | $0.30 | $2.50 | — | $0.03 |

- **Sonnet 5 $2/$10 virou permanente** (aumento para $3/$15 de 01/09 cancelado — página oficial
  2026-08-11; nota: varredura Q4 citou o preço antigo de cache da skill de 06/2026 — vale a
  página oficial). Caveat: tokenizer dos 4.7+ gera ~30% mais tokens (preço efetivo ~$2.60/$13 —
  ainda mais barato que Sonnet 4.6).
- Batch API: 50% (Anthropic, OpenAI, Google). Anthropic não cobra premium de long context; OpenAI
  cobra.
- Routers LLM (OpenRouter Auto/Not Diamond/Martian): Martian absorvida pela Notion (descartar);
  Not Diamond real — mas resolve query imprevisível em marketplace. **Nosso caso tem rotas
  conhecidas: router = `if` por papel da chamada no hub** (determinístico, auditável, sem
  intermediário vendo dados de ERP).
- Conta do cenário (900 conversas/mês, ~25 chamadas/conversa, ~15k contexto médio, caching):
  Haiku ~$105/mês · Sonnet 5 ~$270/mês · Opus ~$680/mês · mix 80/15/5 ≈ **$160/mês**.
  **Caching corta ~3.7× o custo total** — pré-requisito, não otimização (Q4).

**Posição Conexus.**

- **Default do embarcado: Sonnet 5** (tool use confiável; diferença p/ Haiku ≈ $165/mês —
  irrelevante frente a resposta errada sobre dado de ERP). Cache 5-min sempre.
- **Haiku 4.5** para sub-tarefas mecânicas do fluxo (classificação de intenção, extração,
  sumarização de resultado de tool), roteadas por papel da chamada.
- **Opus 5 por gatilho explícito** (2+ falhas do loop, análise multi-entidade, flag do usuário) —
  nunca por router automático.
- Batch para o não-interativo (relatórios noturnos, eval de golden questions).
- Cross-provider barato (luna/Flash-Lite) só se custo mensal passar ~US$1k — quebra unificação
  de caching/trace por menos que isso não paga.

---

## Correções à nossa direção (o que a pesquisa mudou)

1. **Runtime do embarcado**: descartada a hipótese "reusar harness do builder com perfil leve".
   Loop direto no hub; sandbox só onde há código arbitrário. Zero precedente de mercado para
   coding-harness-em-sandbox em chat de produção; doc do próprio vendor aponta contra. (Q5)
2. **connector/v1 precisa de extensão agent-facing** por operação: `agentDescription`,
   `inputExamples`, `responseProjection`. Contrato técnico (schema+effects) não basta para acerto
   de LLM — evidência Speakeasy/Anthropic. (Q2)
3. **Headless não pausa loop**: termina em deny fail-closed; aprovação = registro pendente;
   pós-aprovação executa executor determinístico com payload hasheado — sem re-hidratar LLM. (Q3)
4. **Aprovação ganha 3 propriedades que nenhum vendor documenta junto**: `expires_at` fail-closed,
   hash do payload (TOCTOU), card renderizado do registro mecânico. (Q6)
5. **Taint bit por run** elevando approvalFloor de mutação/envio quando houver conteúdo não
   confiável no contexto — Rule of Two dinâmica, custo de uma flag. (Q9)
6. **Pinagem de versões das refs no deployment do agente** — anti "global ripple" Agentforce. (Q1)
7. **Cap de ações de escrita por run** (`maxWriteActions`) — orçamento que nenhum vendor tem e
   nosso modelo de effects torna trivial. (Q3)

## Proposta de decisão (1 página, rascunho para cruzar com a externa)

- **Abstração**: agente = artefato `agent/v1` no registro C-005 (config declarativa git-first;
  manifest com schema; versão/rollback = deployment atômico existente; refs pinadas; estado fora
  do artefato).
- **Tools**: projection compilada no build do deployment (operação/artefato → tool nomeada
  `conector_recurso_verbo`, params de runtime injetados pelo hub, resposta moldada); extensão
  agent-facing no connector/v1; alvo 10 / teto 20 com validação.
- **Runtime**: loop de chat no hub (stateless por turno, histórico Postgres, tools in-process via
  Gateway); harness Pi + microVM fica exclusivo do builder; `AgentTaskSession` = eventos tipados
  sobre o loop (streaming, reconexão, F5 recovery à la Mitra).
- **Headless**: job pg-boss, agente como principal próprio (role DB + Connection + budget
  maxTurns/maxUsd/maxWriteActions), deny fail-closed + fila de aprovação assíncrona + executor
  determinístico.
- **HITL**: tabela `approval_request` durável desde o dia 1 (hash, expires_at fail-closed, once
  por default, card mecânico); mesmo regime para chat e headless.
- **Contexto**: camadas versionadas alinhadas aos 4 cache breakpoints; schema inline curado;
  caching obrigatório; promptfoo como regressão.
- **Memória**: fase 1 = histórico + camadas; gatilho user_facts definido (extração async mediada,
  nunca self-write).
- **Observabilidade**: trace nas tabelas do hub com nomes OTel `gen_ai.*` + custo na escrita +
  hash de prompt; score table; Langfuse por gatilho.
- **Segurança**: pernas da trifecta cortadas por arquitetura (egress fechado do loop, ação só
  registrada, role read-only) + taint bit; detectores no máximo telemetria.
- **Modelo**: Sonnet 5 default, Haiku sub-tarefas, Opus por gatilho, batch no não-interativo,
  router = `if` no hub.
- **Adiar com gatilho**: tool search (catálogo grande), híbrido de schema (>50–100 tabelas),
  memória dedicada (re-ensino por usuário), Langfuse (volume/annotation), Dual-LLM (documentos
  externos em volume), Best-of-N no embarcado (seam já previsto no hub — gatilho = tarefa de
  alto valor).

## Pendências que a pesquisa não fecha

- Cruzar com o HANDOFF da deep research externa (rodando em paralelo) — divergências viram pauta
  da revisão adversarial.
- Sonda P1 (CLAUDE.md completo do builder Mitra) alimenta o desenho fino das camadas; P2/P3
  (feedback de erro, steering) alimentam o protocolo de turno do `AgentTaskSession`; P5
  (subagentes) alimenta perfil de runtime. Nenhuma bloqueia a decisão.
- Forma exata da extensão agent-facing no connector/v1 (campos novos no contrato vs camada de
  override só na projection) — decidir na revisão com o custo de migração do C-007 na mesa.
