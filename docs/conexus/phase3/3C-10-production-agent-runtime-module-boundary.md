# 3C-10 — Production Agent Runtime Module Boundary

**Status:** APROVADO pelo operador  
**Fase:** 3C — Domain / Module Architecture  
**Importante:** esta decisão não constitui C-018, não encerra 3C e não autoriza implementação.

## Decisão em uma frase

No Conexus F1, `Production Agent Runtime` é o módulo Project-scoped que realiza agentes empresariais duráveis usando **Mastra como runtime substrate principal**, preservando no Conexus a autoridade sobre definição/versionamento, Release, Identity & Access, Brain, Connections, Capability Gateway, approvals e triggers. Mastra assume agent loop, model/provider plumbing, memory mechanics, durable workflow/checkpointing, suspend/resume, schedules, signals e background execution; nenhuma dessas mechanics vira segunda authority de produto.

## Por que esta decisão muda C-010

C-010 rejeitou frameworks de agente como fundação porque Mastra/LangGraph, no estado analisado, duplicariam storage, memory, tool semantics e lifecycle do Hub. A pesquisa de 2026-08 mostrou mudança material de capacidade: Mastra 1.x agora possui AgentController/Mastra Code, Memory em camadas, Workflows duráveis, suspend/resume, Schedules, Signals/Inbox, background tasks, tool hooks e substrate de agentes long-running.

A rejeição categórica de framework fica portanto **SUPERSEDED para Production Agents**. A soberania de domínio permanece.

Referências atuais usadas na reconciliação:

- `https://mastra.ai/blog/introducing-durable-agents`
- `https://mastra.ai/blog/introducing-schedules-for-agents-and-workflows`
- `https://mastra.ai/blog/build-claude-code-for-x-with-agentcontroller`
- `https://mastra.ai/blog/introducing-memory-extractors`
- `https://mastra.ai/blog/introducing-tool-hooks`
- `https://mastra.ai/blog/introducing-notification-inbox`

## Cinco conceitos duráveis do domínio

```text
AgentDefinition
Conversation
AgentRun
ApprovalRequest
AgentTrigger
```

### AgentDefinition

É artifact `kind=agent`, contrato `agent/v1`.

```text
Git
→ authoring

Artifact Registry
→ ArtifactRevision(kind=agent), digest, immutable payload, AVAILABLE

Release
→ exact active agent revision + model/runtime composition

Production Agent Runtime
→ what agent/v1 means at runtime
```

Não nasce `AgentRevision` paralelo ao Artifact Registry.

### Conversation

Thread lógico durável para experiência interativa. A realização F1 pode usar Mastra thread/message history, mas a identidade canônica pertence ao Conexus.

```text
Conversation != provider session
Conversation != model context window
```

### AgentRun

Execução concreta de um agente sob uma composição exata.

Um Agent pode viver anos e produzir milhares de AgentRuns. O agente é durável; cada run é uma tentativa/episódio concreto que pode executar, suspender, retomar ou terminar.

AgentRun registra semanticamente:

```text
agent identity
active Release / exact revisions
trigger or conversation context
runtime kind/version
runtime run reference
caller/authority context
correlation/evidence
high-level lifecycle
```

Detalhes internos de checkpoint do Mastra não são duplicados campo a campo no domínio.

### ApprovalRequest

Continua authority Conexus para efeitos originados por agente que exigem decisão humana.

Mastra approval/suspend/resume é **mechanics de continuação**, não authority.

```text
Mastra tool call waits
        ↓
Conexus ApprovalRequest
        ↓
human decision
        ↓
Conexus reauthorization
        ↓
resume mechanics
        ↓
Capability Gateway executes
```

### AgentTrigger

Primeiro consumidor real para agents autônomos/background.

F1 fecha semanticamente:

```text
SCHEDULE
EVENT
```

Manual/chat invocation não exige AgentTrigger persistente.

`SCHEDULE` é realizado por Mastra schedules. `EVENT` entra por um ingress Conexus autenticado/normalizado e acorda o runtime por signal/inbox equivalente.

## Agent durável não significa LLM process 24/7

```text
Agent lifetime = long-lived logical actor
AgentRun = concrete execution
```

Exemplo:

```text
Sales Agent
├── 08:00 schedule → AgentRun #101
├── pergunta do usuário → AgentRun #102
├── evento de pedido → AgentRun #103
└── 08:00 amanhã → AgentRun #104
```

Background agent significa triggers + state + repeated runs, não compute/model call eternamente aberto.

## Mastra como substrate

### ADOPT

- `Agent` loop e model/provider plumbing;
- threads/message history como realization de Conversation;
- Memory mechanics;
- Workflows para durable orchestration;
- snapshots/checkpoints;
- suspend/resume;
- schedules;
- Signals/Inbox para wake-up/event-driven agents;
- branch/parallel/loops quando workflow concreto exigir;
- tool hooks para correlation/diagnostics/defense-in-depth;
- background tasks por consumidor;
- Studio para desenvolvimento/diagnóstico.

### WRAP

- Mastra tools → `Capability Gateway`;
- tool approvals → `ApprovalRequest` Conexus;
- webhook/event ingress → validação/normalização Conexus antes de virar Signal;
- memory configuration → policy/scoping Conexus;
- Mastra runtime IDs → correlation refs, não domain identity.

### DEFER / probe-gated

- Semantic Recall;
- Observational Memory;
- Memory Extractors;
- Durable Agent stream/cache/pubsub;
- Networks/subagents/multi-agent;
- ACP/A2A/MCP edge interoperability;
- Temporal runtime;
- production browser/shell/workspace power.

### REJECT como authority

- Mastra Agent Editor/Stored Agents como source of truth;
- Mastra versioning concorrendo com Artifact Registry/Release;
- self-editing/self-publishing agent configuration;
- Mastra auth/RBAC como authority Conexus;
- tool com acesso direto a DB/ERP/API fora do Gateway;
- Mastra Cloud como requisito arquitetural.

## Memory — quatro coisas não podem ser confundidas

```text
Brain
Conversation
Agent Memory
Automation State
```

### Brain

Organizational truth governada e publicada por humano.

### Conversation

Histórico de uma interação/thread.

### Agent Memory

Contexto cross-run/cross-conversation útil ao agente e não autoritativo, por exemplo preferências, contexto de trabalho e recordações operacionais admissíveis.

Mastra Memory fornece a machinery; policy e scope pertencem ao Conexus.

```text
memory != authorization truth
memory != business database
memory != Brain authority
```

### Automation State

Estado mecânico como cursor, last_run_at, next_run_at, last_processed_event e retry metadata. Não deve ser escondido em LLM memory.

## Policy de memória

`agent/v1` deve conseguir expressar semanticamente quais regimes são habilitados, sem congelar aqui o YAML final.

F1 pode começar conservador:

```text
message history: ON
working memory: ON quando consumidor justificar
semantic recall: OFF até eval
observational memory: OFF até qualificação
```

Ativar OM/semantic recall é mudança explícita/evaluada, não switch ambiental invisível.

Memory Extractors futuramente podem produzir:

```text
AgentMemory update
ou
KnowledgeProposal → Brain review
```

Nunca publicação automática no Brain.

## Durable workflows

Production Agent Runtime pode compor etapas de raciocínio e etapas determinísticas com Mastra Workflows quando o caso exigir:

```text
reason
→ branch
→ parallel reads
→ deterministic step
→ suspend
→ human approval / event / time
→ resume
→ continue
```

Isso **não** reabre Builder como workflow DSL e não transforma o Conexus inteiro em Mastra Workflow.

Builder `Change → Plan → Work Unit → ActorRun` continua domínio independente até a reconciliação específica do coding runtime.

## Suspend / resume

Propriedade F1:

> um AgentRun pode suspender duravelmente e continuar sem manter processo ou model call vivo.

Causas concretas ficam para 3G, mas podem incluir approval, external event, time/schedule ou input.

Mastra snapshot/checkpoint é runtime state opaco; authority para continuar continua vindo do Conexus.

## Tool execution

```text
Mastra Agent
    ↓ tool proposal
Mastra Tool wrapper
    ↓
Capability Gateway
    ↓
Project DB / Connection / external system
```

Nenhuma tool de negócio acessa DB/ERP/Connection diretamente apenas porque Mastra permite `execute()`.

Tool hooks podem aplicar correlation, diagnostics, input shaping e defense-in-depth, mas nunca substituem Gateway admission.

## Schedules e background

Exemplo real do produto:

```text
Sales Agent
SCHEDULE 08:00 America/Sao_Paulo
→ new AgentRun
→ analyze yesterday sales
→ publish/deliver report
```

Outro:

```text
Inventory Monitor
SCHEDULE every 30m
→ inspect changes since cursor
→ no finding: complete
→ finding: analyze and possibly raise ApprovalRequest
```

Não nasce scheduler próprio do Conexus se Mastra satisfizer os invariantes no probe.

## Event-driven agents

```text
external event
→ Conexus ingress
→ authentication/signature/dedupe/normalization
→ trusted normalized event
→ Mastra Signal / inbox
→ AgentRun
```

Mastra acorda o agente; Conexus mantém a trust boundary externa.

## Multi-agent

F1 começa single-agent, mas architecture-compatible com subagents/networks/agent-as-tool.

Não fica normativo `No Multi-Agent Runtime`; fica normativo:

```text
single-agent first
multi-agent only on first real consumer + eval
```

## Storage

F1 prefere Postgres e evita infraestrutura adicional sem necessidade.

Conceitualmente:

```text
Postgres
├── Conexus domain authority
└── Mastra substrate state
    ├── memory
    ├── workflow/checkpoints
    ├── schedules/signals
    └── runtime internals
```

Mastra internal state não deve ser copiado campo a campo para tabelas Conexus.

## Replaceability realista

A boundary substituível é `ProductionAgentRuntime`, não cada detalhe interno do Mastra.

Um run iniciado em Mastra permanece ligado àquela runtime/version até terminal. Troca futura usa drain/cutover:

```text
old in-flight runs → old runtime
new runs → new qualified runtime
```

Não prometemos migrar snapshots internos entre engines diferentes.

## Technology qualification obrigatória

A arquitetura adota Mastra agora, mas o primeiro deploy depende do probe `CX-AGENT-MASTRA-01` em 3L.

O probe deve provar no mínimo:

1. AgentDefinition Conexus compila para Mastra sem segunda authoring authority;
2. ToolProjection → Mastra tools → Gateway, sem rota direta;
3. memory isolation entre users/Projects/agents;
4. Conversation/memory sobrevivem restart do Hub;
5. workflow suspend → kill → fresh process → resume;
6. ApprovalRequest Conexus continua authority e stale approval não retoma;
7. schedule com timezone, restart, overlap e enable/disable;
8. normalized event → Signal → agente correto; duplicate ingress não cria efeito indevido;
9. run antigo preserva Release antiga; run novo usa Release nova;
10. model/provider pin não sofre fallback/drift silencioso;
11. runtime IDs correlacionam com `agent_event` e Gateway evidence;
12. export/backup/recovery do estado necessário é possível.

Falha material do probe reabre o substrate, não a semântica do domínio.

## O que o módulo owns

```text
agent/v1 runtime semantics
Conversation semantics
AgentRun semantics
ApprovalRequest semantics for agent-originated effects
AgentTrigger SCHEDULE | EVENT semantics
runtime memory policy/scoping
runtime workflow/suspend/resume semantics
mapping Conexus → Mastra runtime configuration
correlation between Conexus run and substrate run
```

## O que não owns

```text
Agent ArtifactRevision / digest / AVAILABLE → Artifact Registry
active agent/model/runtime composition → Release
caller authority → Identity & Access
organizational truth → Brain
Connection lifecycle → Connections
business capability physical execution → Capability Gateway
business/project data → data plane
raw telemetry store → Observability
Builder Change/Plan/Work Unit → Builder
external-event trust boundary → integration ingress / applicable owner
```

## Anti-overengineering

Não construir F1:

- framework de agente próprio;
- scheduler de agentes próprio se Mastra schedule provar invariantes;
- workflow/checkpoint engine próprio;
- long-term memory engine próprio;
- vector DB obrigatório;
- Temporal obrigatório;
- multi-agent obrigatório;
- Mastra Cloud dependency;
- second agent-authoring/versioning authority;
- direct-tool power fora do Gateway.

## Decisão final

> O Conexus define o que um Production Agent é; Mastra realiza como ele roda. Essa separação permite schedules, background execution, memory e durable orchestration desde uma base madura sem entregar ao framework a autoridade sobre versão, acesso, conhecimento, efeitos ou Release.
