# 3K-01 — Product Model, Project Shell, Build Workspace & Inspectability

**Status:** APPROVED pelo operador em 2026-08-17  
**Fase:** 3K — Frontend / Product Architecture  
**Authority:** primeira decisão aprovada de 3K  
**Método:** DevelopmentConexus Engineering Method v1.0.0  
**Importante:** esta decisão não constitui C-018, não encerra 3K nem a Fase 3, não autoriza implementação de produto, merge ou PR readiness.

## Decisão em uma frase

No Conexus F1, a experiência é **agent-first, simple by default e inspectable by design**: Workspace e Project são shells de produto distintos; ao entrar em um Project, a navegação passa a ser Project-scoped; o Build combina navegação do Project, uma work surface dominada pelo Preview e um painel contextual/retrátil do Conexus; recursos reais do Project — Data, Capabilities, Integrations, Agents, Brain bindings, Versions e Activity — são diretamente inspecionáveis, enquanto Code/Diff são lentes do Build e maquinaria interna como ActorRun, Gateway, CAS, Mastra/E2B e digests permanece progressive detail, nunca linguagem obrigatória do Golden Path.

---

## 1. Authority, evidência e provenance

Esta decisão materializa o trabalho 3K exigido por:

- C-001 — produto F1 operado pelo operador para construir/entregar aplicativos de negócio; Brain, AI-first e first vertical do Analisador de Orçamentos;
- C-003 — Workspace/Project, Brain, Connections, Product Agents, checklist vivo, observabilidade, Preview, Release/Promotion e superfícies F1;
- C-012 — scaffold/frontend e Honest UI já congelados; 3K não redesenha infraestrutura frontend;
- C-013..C-017 — truth, lifecycle, approval, Release e engenharia agentic que a UI apenas projeta;
- 3A-R6 — 3K MUST DECIDE product navigation, user-observable authority e main journeys, deixando pixel-perfect/realization para depois;
- 3A-R7 — Platform Consultant = Builder-owned / Control-Plane-presented, sem hidden tenant ou global Product Agent;
- 3B..3J — owners, boundaries, state, runtime, security e deployment já fechados.

Evidência/referência não-autoritativa usada para procurar o Global Maximum:

- `docs/research/MITRA-INSPIRATION-MAP.md`;
- `docs/reference/mitra/00-OVERVIEW.md`;
- `docs/reference/mitra/DECISION-REGISTER.md`;
- `docs/reference/mitra/07-padrao-de-projeto.md`;
- `docs/conexus/17-log-observacao-mitra.md`;
- `docs/research/FACTORY-AI-HARNESS-REFERENCE-MAP.md`;
- `docs/conexus/pesquisa-interna-scaffold.md`;
- candidate/dialogue 3K anteriores, usados apenas como input e superseded por esta ratificação onde divergirem.

A evidência Mitra mostrou simultaneamente duas propriedades úteis: Golden Path guiado pelo agente **e** recursos técnicos reais inspecionáveis (Preview/code, Database, Server Functions, integrations, access, tasks). Factory reforça proporcionalidade e inspectability de trabalho complexo. O erro seria copiar a topologia de qualquer referência ou, no extremo oposto, concluir que AI-first exige caixa-preta.

---

## 2. Root cause

Sem uma decisão 3K explícita, implementation poderia escolher silenciosamente entre quatro produtos incompatíveis:

```text
A. chat-first black box
B. IDE/technical console como produto principal
C. portal global com Project apenas selecionado
D. agent-first Project workspace com inspectability proporcional
```

Essas alternativas alteram materialmente navegação, modelo mental do operador, alcance do Project, visibilidade de recursos reais, relação Agent ↔ Preview ↔ Code ↔ Data ↔ Capabilities e contexto de administração vs uso do app publicado. Logo não podem ser deixadas ao coding actor.

---

## 3. Alternativas e Global Maximum

### A — Chat-first / black box

`Chat → Preview → Publish`.

**REJECT.** Simples, mas opaco demais para o operador F1; esconde recursos reais, dificulta auditoria e transforma o agente na única lente sobre o produto.

### B — Technical console / IDE como interface principal

`Code / DB / Functions / Logs / runtime mechanics primeiro`.

**REJECT como modelo principal.** Transparente, porém força o usuário a operar a arquitetura mesmo quando quer apenas construir/evoluir um produto.

### C — Workspace-global shell persistente com Project selecionado

**REJECT.** Mistura Workspace e Project, enfraquece a sensação de contexto e torna recursos Project-scoped secundários a uma navegação global.

### D — Agent-first + Project-scoped + inspectable by design

**APPROVED / GLOBAL MAXIMUM candidate ratified.**

`intenção/construção pelo Conexus + Preview como resultado central + recursos reais diretamente inspecionáveis + detalhe técnico proporcional sob demanda`.

Preserva velocidade, auditabilidade, controle e crescimento sem duplicar authority nem construir uma IDE completa.

---

## 4. Dois shells distintos

### 4.1 Workspace shell

Fora de um Project, o usuário opera contexto organizacional:

```text
Workspace
├── Projects
├── Brain
├── Connections
└── Workspace administration / membership
```

Workspace é a shell visível de organização/tenancy; Brain e Connections permanecem Workspace-owned e reutilizáveis entre Projects; não existe Workspace oculto/default criado por conveniência. First access continua seguindo C-015: Account provisionada pelo operador, setup credential one-time, troca obrigatória, sem self-signup F1; seleção/criação de Workspace respeita authority atual derivada server-side.

### 4.2 Enter Project = context transition

Ao entrar em um Project, o operador entra numa **Project shell própria**.

`Workspace context → choose Project → Project workspace`.

A navegação dominante deixa de listar recursos globais do Workspace. Workspace permanece acessível somente como contexto suficiente para breadcrumb/back navigation, Workspace/Project switcher e owner link quando um recurso Project usa Brain/Connection Workspace-owned.

A Project shell responde prioritariamente: **o que existe, está sendo construído, está em uso ou precisa de atenção neste Project?**

---

## 5. Project shell F1

Navegação conceitual Project-scoped:

```text
Project
├── Build
├── Data
├── Capabilities
├── Integrations
├── Agents
├── Brain
├── Versions
├── Activity
└── Settings
```

Regras:

- esta é arquitetura de produto; exact labels, ordering, icons, tabs, widths e responsive behavior pertencem à Realization;
- não existe categoria intermediária obrigatória `Resources` apenas para agrupar Data/Capabilities/Agents;
- não existe `Product` como aggregate, module, record ou aba artificial: o próprio Project já é a unidade de software/produto;
- `Open App` é ação/transição explícita para PUBLISHED_APP, não novo domínio de navegação;
- `Publish` pode existir como ação contextual de alta frequência enquanto Versions mantém histórico/gestão; spelling exato pertence à Realization.

---

## 6. Build = primary construction workspace

Build é a experiência padrão de criação/evolução.

Composição conceitual: `Project navigation + dominant work surface + contextual Conexus assistance`.

Direção F1 aprovada:

```text
left/contextual area  → Project navigation
center/dominant area  → work surface, Preview by default
right/contextual area → Conexus AI Builder / Platform Consultant, collapsible
```

Isso congela a **hierarquia de atenção**, não pixels ou framework de layout.

### 6.1 Agent-first, not agent-only

O usuário inicia pelo objetivo de negócio e conversa com o Conexus:

`intent → Inception / Discovery quando aplicável → Baseline / Change checkpoint → approved plan when applicable → governed build → Preview → verification → Publish`.

A UI não exige que o usuário escolha primeiro `query`, `action`, `agent`, `table` ou outra primitive técnica para começar um produto.

### 6.2 Conexus panel

O Conexus é contextual ao Project e pode ser retraído para dar prioridade à work surface. A surface pode carregar conversation, elicitation/decision prompts, user-relevant progress, blocked/waiting states e links/references to Project resources.

3K não decide token streaming, chunking, SSE, WebSocket, event names ou refresh cadence.

Load-bearing product law:

```text
working != blocked != waiting-for-user != completed
```

Trabalho em andamento precisa ser observável honestamente; realization da progressividade textual é posterior.

---

## 7. Build work lenses

A work surface possui três lenses conceitualmente necessárias: `Preview | Code | Diff`. Exact tabs/split panes/shortcuts são Realization.

### 7.1 Preview — default lens

Preview é a lente default porque mostra o objeto que o usuário está construindo, não a machinery que o produz.

`PREVIEW != PUBLISHED_APP`; Preview access != production access; Preview state != Release/Promotion truth.

Enquanto uma nova candidate está sendo construída, a experiência não deve exigir destruir/substituir o último Preview utilizável por um candidate ainda não pronto. Exact refresh/swap policy fica para Realization, mas `building next candidate` e `currently inspectable Preview` são conceitos distintos.

### 7.2 Code

Code é inspection-first em F1: file tree/source inspection, contextual source understanding e provenance/diff navigation quando material.

F1 **não exige** IDE manual completa nem cria editor concorrente como segundo caminho obrigatório de mutação do produto. Manual editing futuro volta por named workflow/consumer; não é proibido universalmente.

### 7.3 Diff

Diff responde: **o que esta Change alterou?** A superfície pode mostrar mudanças em linguagem técnica suficiente para auditoria, sem tornar Git SHA/commit internals o vocabulário principal do produto.

---

## 8. Contextual inspectability — `Ask Conexus about this`

Uma propriedade transversal de produto é que recursos inspecionáveis do Project podem ser referenciados ao Conexus contextual, por exemplo Preview element/region, source file/range, Data table/field, Capability, Agent, Integration binding, Brain item/context e Version/Finding/Evidence reference quando aplicável.

Isto não concede authority ao chat:

`selected UI/resource context → context input under current server-derived authorization -X-> new authority / hidden capability / cross-Project access`.

Ações authority-bearing continuam usando seus owners/gates aprovados.

---

## 9. Data surface

Data é superfície diretamente inspecionável quando o Project possui/usa dados relevantes. Product-level capabilities podem incluir environment identity, schemas/tables/fields, relationships, provenance, bounded data sample/read-only exploration e usage by Project resources.

F1 não cria raw mutable database console como caminho paralelo de authority.

`Data inspectability = YES`; `ad-hoc DDL/DML bypassing governed lifecycle = REJECT`.

C-003 INT-5 continua: SQL livre somente em Discovery, read-only + allowlist quando aplicável. Exact explorer/query implementation é Realization.

---

## 10. Capabilities surface

Capabilities tornam legíveis as capacidades reais do Project sem expor Registry internals como produto.

Baseline product vocabulary: `Queries | Actions`.

Uma capability pode projetar, quando material: name/business meaning, kind, inputs/outputs, source/Connection, permission/effect meaning, used-by relationships e verification/evidence summary.

`Registry artifact kind`, digest, handler, Gateway internals e storage representation permanecem detalhe técnico/auditável, não linguagem obrigatória.

3K não cria novo Capability aggregate/domain owner; projeta artifacts/capabilities já owned por authority anterior.

---

## 11. Integrations surface

O Project precisa responder: **quais integrações este Project usa e em qual contexto?**

A Project surface projeta bindings e health/qualification relevantes, enquanto Connection permanece Workspace-owned.

`Workspace owns Connection → Project binds/uses Connection`.

Quando o operador precisa administrar a Connection em si, a UI navega para o owner Workspace surface sem duplicar credential/Connection authority. Credential entry continua dedicated/write-only e nunca chat.

---

## 12. Agents surface

Product Agents são recursos Project-scoped e Release-pinned segundo authority anterior.

A Project surface pode tornar legível Agent definition/identity, current/published version context, Capabilities used, Brain/context relationships, triggers only when consumer exists e usage/operational entry where applicable.

Mas não transforma Mastra Agent, PAR internals, thread/run substrate ou runtime process em linguagem principal.

Workspace-global Agent fleet continua REJECT/DEFER F1 sem consumidor real.

---

## 13. Brain surface inside Project

Brain continua Workspace-owned, mas o Project precisa tornar legível **qual conhecimento está usando**.

Project Brain surface é projection/binding view, por exemplo: bound Workspace Brain, revision/provenance when material, business rules/metrics/processes available, used-by Project resources e health/update availability when material; fornece navegação explícita ao Workspace Brain owner para editar/publicar.

`Brain update != Project update != active Release update`.

Platform-published Conexus knowledge permanece distinto de tenant Workspace Brain e user/project-authored content conforme 3A-R7.

---

## 14. Versions / Publish / Open App

Versions é a surface estável para candidate/version history, current active production, verification readiness, Promotion history/state projection, rollback entry when eligible e known limitations when relevant.

Package B define truth/decision presentation detalhada dessa surface.

`Publish` é ação sobre a current candidate/Release path, não sinônimo de build completion.

`Open App` muda explicitamente do Control Plane para PUBLISHED_APP. `Control Plane authority != Published App authority`.

Exact browser origin/routing permanece C-015/3I-05/3J-01/Realization, não 3K-01.

---

## 15. Activity / diagnostic inspectability

Activity é a Project-scoped entry para história operacional suficiente a trust/diagnosis, sem criar segundo status store.

Pode projetar, conforme owner facts: Changes/build activity, verification/Finding milestones, Preview/Release/Promotion events, Agent/runtime activity e operational events relevant to the Project.

C-013 Run Timeline permanece deep causal diagnostic authority/projection. Activity é produto/navigation projection; não cria lifecycle ou EventStore novo.

Detalhe WorkUnit/ActorRun/attempt/runtime é progressive drill-down, útil quando o trabalho ou diagnóstico exige.

---

## 16. Settings

Settings concentra Project administration que não precisa competir com o daily build flow. Pode incluir conforme current authority/consumer: General, Access, Environments, source/Git relationship e other Project administration.

A lista final/ordem não é congelada por 3K-01. Security-sensitive access mutation continua owner-enforced; UI nunca é controle de autorização por si só.

---

## 17. Progressive disclosure — regra corrigida

A lei final não é “hide internals”. É:

> **Esconder accidental machinery do Golden Path sem esconder recursos reais, authority, truth ou auditability.**

```text
REAL PRODUCT RESOURCES — directly inspectable
Data
Capabilities
Integrations
Product Agents
Brain binding/context
Versions
Preview
Code/Diff
Activity/Evidence entry

PLATFORM MACHINERY — progressive detail
ActorRun / WorkUnit raw internals
Gateway internals
Registry storage mechanics
CAS generations
Mastra sessions/threads
E2B sandbox IDs
TxScope / DB owner rows
technical digests unless material
```

WorkUnit/ActorRun podem aparecer em drill-down quando úteis para progresso, trust ou diagnóstico; não viram linguagem obrigatória da navegação normal.

---

## 18. Golden Path resultante

### First access

`operator provisions Account → one-time setup credential → mandatory credential replacement → resolve authorized Workspace → choose/create authorized Workspace`.

### New Project

```text
Workspace
→ Create Project from business/product intent
→ enter Project shell
→ Build / Conexus-assisted Inception & Discovery
→ resolve required Brain/Integration context through owner surfaces
→ Baseline/Change review
→ approved plan when applicable
→ build with user-relevant progress
→ Preview as central work lens
→ inspect Code/Data/Capabilities/Agents as needed
→ verification readiness
→ Publish
→ SERVED_VERIFIED
→ Open App / real PUBLISHED_APP use
```

No step requires the user to operate ActorRun/Gateway/Registry machinery merely to complete the Golden Path.

---

## 19. YAGNI / REJECT F1

Não construir apenas por optionality:

```text
full IDE clone / terminal-as-product
raw mutable production DB console
Workspace-global sidebar dominating Project context
artificial Product aggregate/tab
mandatory Resources intermediate navigation category
Trust Center / Approval Center merely for symmetry
Project-global generic workflow designer
Mission/Milestone orchestration console as default Golden Path
Workspace-global Agent fleet
user-editable Rigor
second frontend state machine
chat as sole interface to every durable resource
```

---

## 20. DEFER SAFELY / Realization boundary

3K-01 deliberadamente não congela pixel-perfect visual design, design system final, sidebar widths, exact responsive behavior, exact tab vs split-pane composition, component hierarchy, React component/library choices, code editor technology, manual editing workflow absent named consumer, agent token/chunk streaming, SSE/WebSocket/event payload spelling, preview refresh mechanics/cadence, Data explorer implementation/query API, exact capability cards/forms, Activity filtering/export detail, route/URL scheme e final labels/copy/icons.

Esses itens entram no post-C-018 Implementation Realization Planning Gate ou retornam ao Decision Loop apenas se uma escolha provar ser material à architecture.

---

## 21. Package routing após 3K-01

```text
3K-01 — Product Model, Project Shell, Build Workspace & Inspectability
→ APPROVED

Package B — Trust, Decision & Observable Truth
→ NEXT
→ decide como authority/truth/evidence/approval/status aparecem dentro das surfaces de 3K-01

Package C — First Vertical Composition & Data Path
→ after Package B
→ exercita caso 1 / Analisador de Orçamentos e decide conditional consumers, inclusive mirror/sync trigger

Final 3K whole-phase adversarial review
→ executar uma vez após os packages internos estarem coerentes
→ independent review input, nunca authority por si só
```

Intermediate package work continua sob operador + ChatGPT; revisão independente adicional durante um package só volta se um novo material trust/authority/reopen issue exigir pelo método.

---

## 22. Proof / falsification strategy

3K-01 é falsificada se o first vertical ou um current F1 requirement demonstrar que:

1. entrar no Project ainda exige navegar principalmente por Workspace/global surfaces;
2. um operador não consegue construir e observar o produto com Preview como work result central;
3. Data/Capability/Agent/Integration/Brain truth relevante só pode ser acessada via chat;
4. tornar um recurso inspecionável exige duplicate authority ou novo owner;
5. Project-scoped integration view não consegue preservar Workspace Connection ownership;
6. Project Brain view não consegue preservar Workspace Brain ownership;
7. Code/Diff inspectability exige uma segunda mutation authority para ser útil;
8. user-critical trust/diagnosis exige transformar raw ActorRun/Gateway/runtime machinery em primary navigation;
9. app-only use não consegue permanecer separado de Control Plane authority;
10. Package C / caso 1 não consegue percorrer intent → Build → Preview → verification → Publish → real app sem redefinir a shell.

---

## 23. Reopen triggers

Reabrir 3K-01 somente por evidence material, incluindo: real first vertical prova que Project shell/navigation não comporta tarefa necessária; real second Project prova que Workspace/Project separation impede reuse legítimo; real F1 operator workflow exige manual IDE editing como first-class mutation path; real capability family não cabe em Query/Action product vocabulary sem perda material; real multi-app Project exige outro agrupamento; named app-only/multi-app consumer exige launcher global; named cross-Project Agent operations consumer exige aggregate projection; first DEDICATED/public/embed journey muda materially a product shell; user-critical task requer novo directly inspectable resource; security authority é explicitamente reaberta e muda control/published context topology.

Preference, visual polish, framework choice ou desejo de simetria não reabrem.

---

## 24. Ratificação

A aprovação do operador em **2026-08-17** ratifica:

```text
3K = IN PROGRESS
3K-01 = APPROVED
next package = Trust, Decision & Observable Truth
implementation = BLOCKED
merge = NOT AUTHORIZED
C-018 = NOT CREATED
```

Decisão final:

> **Conexus F1 entra de verdade em cada Project: a Project shell domina o contexto, Preview domina o Build, o Conexus permanece contextual e retrátil, recursos reais ficam diretamente inspecionáveis e machinery interna permanece progressive detail. AI-first significa que intenção e mudança começam pelo agente; não significa que o produto vira uma caixa-preta.**
