# Prompt de pesquisa externa — agente de 1ª classe (tópico 9)

> Copie tudo abaixo da linha e cole no ChatGPT (modo deep research), em chat novo.

---

Estamos projetando a camada de AGENTES DE PRODUÇÃO de uma plataforma que constrói e opera
aplicativos de negócio sobre ERPs usando IA. Não é o agente que CONSTRÓI o app (isso já está
decidido) — é o agente que vive DENTRO do app publicado, conversa com usuário final, consulta
dados e executa ações de negócio. Pesquise com fontes primárias (docs oficiais, specs, repos,
pricing), cite URL + data de acesso, marque fato verificado vs inferência sua, diga "não
documentado publicamente" quando for o caso. Se alguma direção nossa parecer errada, critique com
evidência — preferimos correção a confirmação.

## Contexto (decisões já tomadas — são premissas, não estão em debate)

- Hub orquestrador próprio Node/TS + Postgres + pg-boss no PC do operador (fase 1); agentes
  construtores = workers frescos via SDK pinado, com validador independente e gates humanos
  MECÂNICOS (não convenção de prompt). Multi-modelo por papel.
- Sandbox local; TODO acesso a credencial passa por Capability Gateway no hub — credencial nunca
  entra no sandbox nem no browser.
- Registro de artefatos git-first: artefato executável = arquivo no repo (kinds
  `query`/`action`/`job`/`integration`), slug = nome, inputSchema obrigatório com bind real,
  deployment atômico com manifesto, SDK runtime `execute(slug, input)`.
- Postgres, 1 database por projeto; roles de banco mecânicas (query read-only, action DML-only).
- Conectores externos: contrato declarativo `connector/v1` onde cada operação declara
  `effects[]` (REMOTE_MUTATION/EXTERNAL_SEND; vazio = leitura), `idempotency`
  (IDEMPOTENT/NON_IDEMPOTENT/UNKNOWN fail-closed), `agentEligible` (default false) e
  `approvalFloor`. Aprovação efetiva = max(contrato, política, contexto). A CONSTRUÇÃO da
  "tool projection" (operação → tool com naming/descrição pra LLM) foi adiada para o 1º
  consumidor agente real — **este tópico É esse gatilho**.
- Operador solo, custo ~US$0 fase 1, anti-overengineering: cada peça só entra com gatilho real.

## Evidência da plataforma de referência ("Mitra" — dissecada, funciona em produção)

- Mesmo backend agêntico serve builder E agente embarcado. NÃO existe abstração "Agent": a
  "receita" do agente é re-entregue como prompt de missão a cada task. Maior aposta deles que
  consideramos errada — queremos agente como artefato de 1ª classe (identidade, versão, config).
- Injeção de contexto inline é a alma da velocidade deles: design tokens + schema do banco +
  convenções entram no prompt — observamos 13 consultas SQL executadas SEM nenhuma exploração
  prévia do schema. Agente com 1 única tool genérica (executar server function) + contexto
  injetado = agente mínimo viável funcionando.
- Canal do agente = WebSocket de usuário logado — headless é IMPOSSÍVEL lá (cron/webhook não
  têm como acionar agente). Gap que queremos cobrir.
- Contexto persistente = 2 campos de texto por projeto (instruções adicionais + instruções de
  negócio), concatenados a toda mensagem. Sem versionamento, sem camadas, sem cross-projeto.
- RBAC de agente ({usuários} × {ações permitidas} × {tabelas SELECT}) existe mas é opt-in e
  FALHA ABERTO (perfil não configurado → segue sem bloquear). Nós exigimos fail-closed.
- Aprovação de ação sensível: gate mecânico existe para tools do builder (arquivo de aprovação
  com requestId, allow_once/allow_session/deny), mas a pergunta ao usuário (AskUserQuestion) é
  só convenção de prompt — sistema não bloqueia tools posteriores. Vamos unificar no regime
  mecânico.
- Sandbox por task do agente embarcado; sessão contínua por task sem limite de turnos.

## A visão (importa para o desenho, não para o escopo da fase 1)

Futuro: CONSTRUTOR DE AGENTES — usuário final cria agentes que falam com o app dele E com third
parties. Camada semântica por grupo de projetos ("cérebro da empresa": schema + regras + processos)
alimentando contexto dos agentes. Fase 1: 1 agente embarcado no caso 1 (Analisador de Orçamentos
sobre ERP Sankhya) — consulta dados, explica números, executa poucas ações com aprovação.

## As 10 perguntas

1. **Abstração de agente**: agente como artefato versionado (identidade, versão, config
   declarativa: prompt, tools, modelo, políticas) — como modelam: OpenAI (Assistants/Agents SDK),
   Anthropic (Agent SDK, Managed Agents), Mastra, LangGraph Platform, Letta, Dify, Copilot
   Studio, Retool Agents, Salesforce Agentforce. O que exatamente versiona e o que é config de
   runtime? Agent-as-config (declarativo) × agent-as-code — qual aguenta melhor GERAÇÃO POR IA
   (nosso builder vai gerar agentes)? Recomende um desenho de "agent manifest" mínimo.
2. **Superfície de tools**: como restringem tools por agente (allowlist, permissão por risco,
   aprovação). Nosso desenho: tools = projeção de operações de conector (`agentEligible` ∩
   exposição por projeto) + artefatos `query`/`action` do registro + tools de plataforma. Boas
   práticas COM EVIDÊNCIA de naming/descrição/schema de tool pra LLM (limites práticos de
   quantidade de tools, formatos que aumentam acerto). Alguém gera tool a partir de contrato
   declarativo de conector (OpenAPI→tool, n8n node→tool, Composio)?
3. **Headless**: execução de agente sem usuário presente (cron, webhook, evento de fila).
   Identidade do agente como PRINCIPAL próprio (auth, RBAC, service account), orçamento por
   execução (tokens/tempo/nº de ações), e o problema central: ação que exigiria aprovação humana
   quando não há humano — fila de aprovação assíncrona? degrada para somente-leitura? notifica e
   aborta? Quem resolve isso bem hoje?
4. **Contexto em camadas**: system prompt composto (plataforma → grupo de projetos → projeto →
   agente → injeção de runtime). Versionamento de prompt, testes de regressão de prompt, prompt
   caching (Anthropic/OpenAI: o que muda no custo com camadas estáveis). A evidência Mitra diz
   que injetar schema+convenções inline elimina exploração e dá velocidade — até que tamanho de
   schema isso escala? Práticas de context budget documentadas.
5. **Runtime do agente embarcado**: reusar o MESMO harness do builder (worker fresco por task)
   com perfil leve × runtime separado para chat de app (Q&A + ação pontual)? Dados de
   latência/custo de cold start por conversa; sessões efêmeras × persistentes; multi-turn com
   estado (threads OpenAI, checkpoints LangGraph, tasks Mitra). Para chat embarcado em app de
   negócio com 5–50 usuários, o que o mercado usa?
6. **Human-in-the-loop embarcado**: aprovação MECÂNICA de ação sensível dentro do app (nosso
   `approvalFloor`): padrões de UX + mecânica (pausa real do loop, resumo da ação, escopo da
   aprovação, expiração). Implementações de referência (Agent SDK interrupts, LangGraph
   interrupts, Copilot Studio approvals). O que é bloqueio real × convenção de prompt?
7. **Memória**: memória por usuário / por agente / por projeto (curto × longo prazo), quem
   escreve, como evita poisoning. Estado 2026 de Mastra Memory/OM, Letta, Zep, Mem0 — o que é
   maduro o suficiente pra operador solo, e o que é gatilho futuro?
8. **Observabilidade e eval**: trace por turno (tools chamadas, tokens, custo, latência), eval
   contínuo de agente em produção (golden questions, regression de prompt), LangSmith × Langfuse
   × Braintrust × OTel GenAI — mínimo viável self-host/solo. O que instrumentar DESDE o dia 1
   pra não se arrepender?
9. **Segurança**: agente como principal com RBAC fail-closed; prompt injection num agente com
   tools de escrita e dados de ERP (lethal trifecta: dado privado + conteúdo não confiável +
   canal de saída). Mitigações REAIS de mercado (tool sandboxing, taint tracking, egress
   allowlist, aprovação por efeito) × teatro. Recomendações práticas para nosso caso.
10. **Custo e modelo por agente**: seleção de modelo por agente/tarefa (roteamento), caching de
    contexto estável, orçamento mensal previsível para chat embarcado (estimativa: 5–50
    usuários, dezenas de conversas/dia, contexto ~10–30k tokens). Preços atuais verificados dos
    modelos relevantes (Anthropic, OpenAI, Google) e recomendação de tiering.

## Formato de resposta

HANDOFF estruturado: resposta por pergunta com fontes; lista "correções à direção de vocês";
proposta de decisão em 1 página (abstração de agente + runtime + headless + camadas de contexto
+ o que adiar com gatilho). Direto, sem preâmbulo.
