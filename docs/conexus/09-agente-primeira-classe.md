# Tópico 9 — Agente de 1ª classe (C-010)

> **Status:** DECIDIDO — C-010, ratificado 2026-08-11.
> **Fontes:** acervo Mitra ([09-agente-embarcado](../reference/mitra/09-agente-embarcado.md)) +
> [pesquisa interna](pesquisa-interna-agente.md) (Q1–Q10, 7 correções) + deep research externa
> ([prompt](pesquisa-externa-agente-prompt.md); 3 erros de preço corrigidos com fonte primária) +
> Codex gpt-5.6-sol xhigh, 2 rodadas adversariais (7,3 → 8,9/10, "sem contradição arquitetural
> material com as decisões congeladas").
> **Herda:** C-002 (hub soberano, loop leve, multi-modelo por papel, Mastra fora do hub), C-005
> (registro git-first, deployment atômico, RC-1/2/3), C-006 (roles mecânicas por projeto), C-007
> (connector/v1: effects/idempotency/agentEligible/approvalFloor, vault, Connection), C-008
> (E2B exclusivo do builder).

## Decisão em uma frase

Agente de produção é **artefato declarativo git-first** (kind `agent`, contrato `agent/v1`) no
registro C-005, executado por **loop leve no hub** (via adapter de provider — fase 1 = SDK
Anthropic; domínio model-agnostic — sem framework de agente e sem sandbox), enxergando o mundo
só por **ToolProjection compilada fail-closed** de artefatos
classificados, com **HITL mecânico durável** (ApprovalRequest com hash de envelope + executor
determinístico), budgets por unidade de efeito, trace estruturado com captura raw opt-in, e
modelo pinado por deployment escolhido por golden eval — **apenas 4 objetos novos**
(AgentDefinition, Conversation, AgentRun, ApprovalRequest).

## Contexto

Este tópico define o agente que vive no app publicado (caso 1: Analisador de Orçamentos), fala
com usuário final, consulta ERP e executa ações. É o OWN central contra a Mitra: ela remonta o
agente por prompt a cada sessão, sem identidade, versão, tools declaradas ou builder.

**Manifesto declarativo = fundação do construtor de agentes** (AGT-2, visão C-001): agente novo =
arquivo YAML novo (modelo + prompt + tools referenciadas + policies + budget) + deployment C-005 —
zero código por agente. UI ou builder-agent escrevem o manifesto. Casos de uso nomeados da tranche
headless (F1), registrados na ratificação: (a) avaliador de produtos do marketplace com relatório
na fila de avaliação; (b) monitor de estoque que cria pedido de compra **para aprovação humana**
(o inbox de ApprovalRequest é exatamente esse fluxo); (c) scout de produtos novos via conector;
(d) análise de acessados-não-convertidos com sugestões.

**Framework de agentes: rejeitado.** Mastra/LangGraph entregam a parte trivial (loop, retry) e
trariam segunda autoridade (storage/memória/abstração de tool próprias) contra registro/Gateway.
Agente Mastra é código TS — para usuário criar agente seria preciso construir camada declarativa
por cima de qualquer forma. Mastra segue minerada como referência; Observational Memory =
candidata isolada no T15 (C-002).

## Evidência

| Fonte | Achado decisivo |
|---|---|
| Acervo Mitra 09 | Agente embarcado real: 13 consultas SQL exploratórias num turno observado; sem abstração de agente (prompt remontado); RBAC por perfil prova RC-1 real; instruções adicionais por projeto = embrião do T15. |
| Pesquisa interna | Agent = kind novo no C-005 sem 2º mecanismo de versão; projection `conector_recurso_verbo`; approval durável com payload_hash TOCTOU + expires_at fail-closed; 4 camadas de contexto cacheáveis (caching corta ~3,7×); trifecta cortada por arquitetura + taint bit. |
| Deep research externa | ContextPack L0–L6 com trustClass; AWAITING_APPROVAL; budgets granulares; raw trace redacted por default; effects=[] ≠ safe; Gemini free tier treina com dados (pago não). 3 erros de preço corrigidos: Sonnet 5 $2/$10 **permanente** (aumento de 01/09 cancelado), Luna $0.20/$1.20, Terra $2/$12. |
| Codex rodada 1 (7,3) | Cortou 5 dos 9 objetos da externa; derrubou role/Connection por agente (contradiz C-006/C-007); furos que AMBAS pesquisas perderam: exfil por markdown do chat, TOCTOU de negócio (alvo muda após card), OUTCOME_UNKNOWN sem protocolo, budget burlável por lote (1 call, 500 destinatários), supply chain de prompt via metadata do builder, gap analítico vs as 13 queries da Mitra. |
| Codex rodada 2 (8,9) | 5 correções (atestação de eval separada do manifesto; idempotency key por efeito; actorId estável; RC-1≠RC-2; envelope de aprovação cifrado); precondição default-none rejeitada (guarda no próprio efeito); tool analítica adiada ao T15 com condições; kind `agent` mantido com invariante generalizado. |

## Decisão — componentes

| # | Componente | Decisão |
|---|---|---|
| 1 | Formato | Agente = artefato git no registro C-005, kind **`agent`**, contrato **`agent/v1`**: slug, systemPrompt, modelo solicitado + params, tools (refs pinadas a artefatos + overrides que só APERTAM), policies (approvalDefault, budget), ui, evalRef. Extensão da união de kinds do C-005 = decisão explícita desta ratificação. Invariante C-005 generalizado: **kind escolhe contrato de compilação, lifecycle e runtime handler** (handler do `agent` = ProductionAgentRuntime, session-oriented `start/continue AgentRun` — não `execute(slug,input)`). Sem taxonomia pública "config × executável". |
| 2 | Deployment | **Sem objeto AgentDeployment** — manifesto de deployment C-005 estendido: agentRevisionDigest, modelo solicitado+resolvido+provider, digests das camadas de contexto/policy, toolProjectionDigest + versão do compilador, bindings de Connections, digest da golden suite. **Resultado do eval = atestação imutável separada** referenciando o deploymentManifestDigest (nunca dentro do manifesto — circularidade). |
| 3 | Identidade | **Sem AgentPrincipal, sem role Postgres ou Connection por agente** (contradiria C-006/C-007). AgentRun grava `actorType=AGENT` + `actorId` **estável entre deployments** (projeto+agentSlug) + deployment. Interativo = autoridade do usuário ∩ allowlist do agente ∩ policies; headless = só autoridade declarada. Gateway segue com `{proj}_query/{proj}_action` por kind. Gatilho p/ agregado: revogação/delegação independente, grants distintos entre agentes, 1º headless real. |
| 4 | Runtime | **Loop leve no hub** via **adapter de provider** (mesmo padrão do `CodingWorkerRuntime` C-002: interface mínima, 1 adapter na fase 1 = SDK Anthropic). Domínio (manifesto, ContextPack, ToolProjection, trace) é **model-agnostic** — provider novo = adapter novo, zero mudança de domínio; troca real gatilhada por eval (comp. 15). Sem framework, sem sandbox (E2B segue exclusivo do builder, C-008). Limites de processo no hub: memória/corpo/tempo/concorrência/parser. Se o runtime de produção ganhar browser/shell/código/HTTP arbitrário, gatilho de sandbox reabre. |
| 5 | ToolProjection | Compilada mecanicamente no deployment (nomes `conector_recurso_verbo`, descrição agent-facing, schema estreitado): **nunca** `execute(slug,input)` genérico ao LLM. Fail-closed: artefato sem classificação = fora. Alvo 4–8 tools; >8 exige evidência de eval; 20 = teto do compilador. Projection = **compilador de segurança**: conformance tests + prova de que override não amplia autoridade. Metadata agent-facing gerada pelo builder passa validação/lint/limites/review (supply chain de prompt). |
| 6 | Metadata nos artefatos | No **contrato do artefato** (payload imutável C-005, não overlay): `agentEligible` default **false**, `effects` (taxonomia C-007), `idempotency`, `approvalFloor`, sensibilidade de leitura, teto de resposta/campos. **Aciona formalmente RC-2 do C-005** (migração aditiva: artefato antigo funciona para consumidores atuais, inelegível para agente até classificar). |
| 7 | Leitura | Só queries registradas (SQL livre nunca), views/colunas curadas, LIMIT + teto de bytes + statement_timeout + responseProjection. Escopo de dado **declarado** (caso 1 = PROJECT_WIDE explícito). RC-1 dispara antes da publicação se: carteira por vendedor, usuário externo. Dado classe salário/sensível = RC-2. |
| 8 | HITL | ApprovalRequest durável: run fica **AWAITING_APPROVAL** (processo pode morrer, estado não). APPROVE = claim atômico → reautorização (policy/deployment/expiry) → **executor determinístico** do envelope EXATO (hash cobre args resolvidos + defaults + projeto + Connection + destinatários + conteúdo final + deployment + revisão da tool). Depois, NOVA chamada do modelo só **redige** a resposta a partir do receipt — nunca reemite ação. Card/receipt mecânico sempre visível. DENY/EXPIRE = zero efeito. Envelope da aprovação = estado sensível: cifrado, minimizado, retenção própria. Aprovação pendente invalidada se deployment/policy mudar. Sticky approval não existe (ALLOW_ONCE/DENY; redução futura = mudança de policy versionada, nunca botão no card). |
| 9 | Precondições | Ausência de guarda = **decisão explícita, nunca default silencioso**: `precondition: NONE` declarado e justificado (ex.: envio com destinatário+conteúdo já vinculados); mutação dependente de estado = guarda **no próprio efeito** (Postgres: DML condicional `WHERE status=esperado` na mesma transação, cardinalidade exata; API: If-Match/versão); sem suporte atômico = `BEST_EFFORT` declarado + recheck imediato + classes de efeito limitadas. Complementa (não substitui) expires_at curto. |
| 10 | Protocolo de efeito | Estende semântica de execução C-007: **idempotency key por execução de efeito** (não só por aprovação; com aprovação, deriva de approvalRequestId+effectUnit), claim atômico, receipt no ledger do Gateway (sem agregado ActionReceipt novo), estado **OUTCOME_UNKNOWN** + reconciliação; retry cego de NON_IDEMPOTENT/UNKNOWN proibido. |
| 11 | Contexto | Camadas versionadas com digest (plataforma → empresa/cérebro → projeto → agente → conversa), trustClass por camada + **taint bit latched** por run compõem — camada ≠ confiança do conteúdo (ERP e texto de usuário são untrusted onde aparecerem). ContextPack **provider-agnóstico**: cache breakpoints = decisão do adapter Anthropic, não do domínio. Schema semântico inline curado. |
| 12 | Memória | Fase 1 = histórico da Conversation (Postgres) + camadas de contexto + cérebro read-only (T15). Sem framework de memória, sem self-write. Gatilho extração de fatos: user_facts recorrentes; extração async mediada por review. Observational Memory (Mastra) = candidata avaliada no T15. |
| 13 | Budgets | Por **unidade** de efeito/destinatário/registro, computados ANTES do efeito; cardinalidade desconhecida = fail-closed. v1: maxModelCalls, maxToolCalls, maxRemoteMutationUnits, maxExternalSendUnits, maxReadRows, maxToolResultBytes, maxWallTimeMs, maxCostUsd. Separação: contrato da tool (maxRowsPerCall/maxResultBytesPerCall) ≠ budget do run (confidencialidade ≠ orçamento operacional). EXTERNAL_SEND incrementa também REMOTE_MUTATION (C-007). maxTurns não existe (ambíguo). |
| 14 | Trace | Eventos estruturados sempre (nomes alinhados a OTel `gen_ai.*`, exporter real = gatilho), custo gravado na escrita; mensagens armazenadas 1× e referenciadas; resultado ao modelo já moldado; raw fora do trace principal. Captura completa: **opt-in por run**, cifrada, TTL, auditada; `capturePolicyId` no schema desde o dia 1. Golden dataset curado à mão do capturado (sanitizado), nunca promoção automática — perder replay retroativo é o custo do default seguro. |
| 15 | Modelo | Golden eval **Haiku 4.5 × Sonnet 5** (grounding, tool use, negações, adversariais); escolhe o mais barato que passa COM MARGEM; pinado por deployment; registra modelo solicitado + retornado (drift de alias invalida qualificação). Sem router dinâmico; sub-tarefas Haiku só com prova de eval. Cross-provider = gatilho medido (adapter+governança+economia), sem número mágico. "Fase 1 US$0" = infra; inferência é BYOK pago. Política explícita de quais classes de dado vão a qual provider. |
| 16 | Renderer | Sanitização do chat: markdown sem HTML cru, **sem imagem remota**, URL só com confirmação — corta exfiltração por markdown (a "trifecta cortada por arquitetura" não se sustenta sem isso). |
| 17 | Headless | Semântica no MVP (estados, ApprovalRequest, identidade compatíveis); scheduler/trigger/executor reais na tranche F1. **Schema pronto NÃO fecha AGT-3** — só consumidor executável fecha. Loop headless encerra ao criar aprovação; pós-APPROVE só executor; raciocínio posterior = novo AgentRun alimentado pelo receipt. |
| 18 | Escopo do MVP | **Explicitamente mais estreito que a Mitra**: perguntas e ações curadas do caso 1, não paridade com exploração BI aberta (as 13 queries exploratórias). Lacunas da golden suite registradas como "não suportado" — agente nunca improvisa. **Tool analítica tipada** (dimensões/métricas/filtros allowlisted) = gatilho nomeado ligado ao **T15** (DynamicCubeQuery/dimension_store, OBS-47): dispara no T15 OU se pergunta real exigir combinação fora do catálogo OU se a golden suite reprovar por expressividade. T15 = dono do modelo semântico; T9 = dono de autorização/budget/projection/execução. |

## Objetos novos (só 4)

`AgentDefinition` (artefato git) · `Conversation` · `AgentRun` · `ApprovalRequest`.
Cortados da proposta externa: AgentDeployment (manifesto C-005 estendido), AgentPrincipal
(actorType no run), ToolProjection/ContextPack como entidades mutáveis (valores compilados do
deployment), ActionReceipt (ledger do Gateway).

## Casos golden mínimos (dia 1)

Bulk exfiltration; mudança de alvo pós-aprovação; timeout remoto (OUTCOME_UNKNOWN); cross-user;
prompt injection via metadata de artefato; XSS/markdown exfil; negações (fora do catálogo =
recusa explícita).

## Ajustes registrados a decisões anteriores

- **C-002**: projeção "tópico 9 = ActorRuns Pi" em [04-runtime-agente.md](04-runtime-agente.md)
  substituída — Pi permanece worker de CÓDIGO; agente de produção = loop leve no hub.
- **C-005**: kind `agent` adicionado; invariante "kind escolhe executor" generalizado para
  "contrato de compilação + lifecycle + runtime handler"; **RC-2 acionada** (metadata de
  segurança nos artefatos query/action).
- **C-007**: gatilho da tool projection **acionado** (este tópico é o 1º consumidor agente);
  idempotência estendida a toda execução de efeito; EXTERNAL_SEND conta em ambos os budgets.
- **C-006/C-008**: sem contradição (role por agente removida; E2B segue só builder).

## NÃO-construir agora (com gatilhos)

| Item | Gatilho de entrada |
|---|---|
| Tool analítica tipada | T15 decidido OU pergunta real fora do catálogo OU golden suite reprova por expressividade |
| Executor/scheduler headless | 1º consumidor headless real (tranche F1; candidatos ratificados: avaliador marketplace, monitor de estoque→compras, scout de produtos, análise de conversão) |
| AgentPrincipal como agregado | Revogação/delegação independente, grants distintos entre agentes, 1º headless |
| Framework de agente (Mastra etc.) | Nunca como fundação; módulos isolados (OM) avaliados no T15 |
| Framework de memória / self-write | user_facts recorrentes → extração mediada; self-write nunca |
| Router dinâmico de modelo / sub-tarefas Haiku | Prova de eval |
| Cross-provider (Luna/Flash etc.) | Adapter + governança + economia medida |
| Langfuse / exporter OTel real | Necessidade de UI de trace além do Postgres |
| MCP server / tool search | 1º consumidor externo; catálogo > teto |
| Sticky approvals | Nunca como botão; redução = policy versionada |

## Consequências

- **Tópico 8 (scaffold)**: chat do app = renderer sanitizado + card de aprovação mecânico;
  superfícies vêm do registry.
- **Tópico 10 (LLM)**: herda política de seleção por eval + preços verificados (Sonnet 5 $2/$10
  permanente; Haiku $1/$5; cache hit 0,1×).
- **Tópico 13 (observabilidade)**: herda trace estruturado + capturePolicy + custo por turno.
- **Tópico 15 (cérebro)**: recebe o gatilho da tool analítica tipada + avaliação da OM; cérebro
  entra como camada de contexto read-only do agente.
- **Pendências de execução (não reabrem a decisão)** — caminho declarado pelo revisor para 9+:
  contrato exato de precondição atômica (`NONE/BEST_EFFORT`); protocolo completo do ledger
  (claim, OUTCOME_UNKNOWN, reconciliação, key por unidade); critérios mensuráveis do benchmark
  estreito (perguntas suportadas, qualidade mínima, gatilho objetivo da tool analítica).
