# 3K-04 — Product Agent Authoring, Management & Use Journey

**Status:** APPROVED pelo operador em 2026-08-18  
**Fase:** 3K — Frontend / Product Architecture  
**Authority:** quarta decisão aprovada de 3K  
**Método:** DevelopmentConexus Engineering Method v1.0.0  
**Importante:** esta decisão não constitui C-018, não encerra 3K nem a Fase 3, não autoriza implementação de produto, merge ou PR readiness.

## Decisão em uma frase

No Conexus F1, Product Agents são recursos **Project-owned, git-first e Release-pinned** cujo authoring canônico continua sendo `agent/v1`; o produto oferece uma **Agent Builder experience especializada dentro do mesmo Builder / Change lifecycle**, na qual edição estruturada/manual e natural-language authoring convergem para a mesma candidate definition, dependências ausentes podem ser propostas como Capabilities/Integrations explícitas da mesma Change, e nenhuma UI ou storage do runtime vira segunda authority. Agent Tools são uma **ToolProjection compilada pela Release** sobre recursos governados — principalmente Query/Action Capabilities e Integration Operations — sem novo domínio universal `Tool`. O Workspace ganha uma **Agents catalog/projection access-filtered** para descobrir e observar a força de Agents da empresa sem mover ownership, Release ou mutation authority para Workspace. Durante authoring o Builder é source-aware; em produção o Product Agent é product/context-aware e não recebe repo/source/shell/filesystem/browser por default.

---

## 1. Outcome

O internal closure sweep de 3K encontrou um único gap material após 3K-01/02/03 + 3A-R8/R9:

```text
3A-R6 MUST DECIDE
→ Production Agent definition/use

backend/runtime authority          = EXISTS / SOUND
Project Agent surface              = EXISTS / PARTIAL
canonical agent/v1                 = EXISTS / SOUND
Product authoring journey          = GAP
Published-app Agent use journey    = GAP
Workspace-level discovery/catalog  = GAP once current operator consumer was stated
```

A decomposição adversarial + pesquisa externa convergiu em:

```text
Agent remains Project-owned                         = YES
canonical agent/v1 remains source of authoring      = YES
Agent Builder as second module/domain               = NO
manual + AI definitions diverge                     = NO
Mastra Stored/Editor Agent as Conexus authority     = NO
ToolProjection reused                               = YES
Universal Tool domain                               = NO
Builder may propose missing Capabilities            = YES / explicit Change only
Workspace Agent ownership/fleet runtime             = NO
Workspace Agents catalog/projection                 = YES
Builder source-aware                                = YES / scoped
Product Agent source-aware by default               = NO
Product Agent application-context-aware             = YES / typed + non-authoritative
new Hub module                                      = 0
new durable record class                            = 0
new database/schema                                 = 0
prior structural phase reopen                       = NONE
```

---

## 2. Authority e composição

3K-04 compõe, sem reabrir estruturalmente:

- C-003 — `AGT-1` Agent first-class, `AGT-2` central de agentes, `AGT-3` headless trigger requirement, `AGT-5` embeddable agent session;
- C-005 — git-first Artifact Registry, immutable revisions e Release-pinned execution;
- C-007 — Integration Operations tipadas e dual-face, credentials/Gateway authority;
- C-010 — `agent/v1`, ToolProjection, agent policy/budgets/approvals, tools sem generic execute ao LLM;
- C-011 — Workspace Brain + Project binding, Brain ≠ Agent memory;
- C-012 — frontend/runtime SDK e Honest UI;
- C-014 — ReleaseManifest composition root e active serving authority;
- C-017 — Change checkpoint, discovery, plan/proof/evidence proporcional;
- 3A-R7 — Platform Consultant é Builder-owned / Control-Plane-presented e não global Product Agent;
- 3A-R8 — Project Baseline spec-anchored, Change sempre pinada e material architecture não pode ser decidida silenciosamente pelo coding actor;
- 3C-10 / 3H-02 — Production Agent Runtime, exact Release pins, Mastra como substrate e Stored/Editor latest overrides excluídos da authority;
- 3F/3G/3I — owner-local contracts/state/security/approval/effect rules;
- 3K-01 — Project shell, Agents surface, Build workspace, Workspace/Project distinction;
- 3K-02 — context-local truth, exact approvals, AgentRun ≠ effect success, cost/missingness/Evidence;
- 3K-03 — first vertical não precisa Product Agent; zero fake Agent apenas para exercitar arquitetura.

Esta decisão fecha somente a **product architecture de authoring, management, discovery e use** de Product Agents.

---

## 3. Evidência externa — convergência, não authority

A pesquisa externa foi usada como challenger/evidence, nunca como product authority.

### Mastra — Agent Builder + file-based agents

Em 2026, Mastra expôs duas ideias relevantes:

```text
Agent Builder
→ developers register tools/models/workflows
→ broader org composes agents by UI/natural language
→ private/draft/public + RBAC

File-based agents
→ one authoring directory per agent
→ config / instructions / tools / skills / memory / workspace / subagents
```

Isto valida:

- Agent como unidade first-class de authoring;
- natural-language + structured authoring;
- composição de agents a partir de primitives existentes;
- necessidade de catalog/visibility/governance.

Mastra também possui Stored/Editor Agents capazes de manter config mutável/publishable separada do source code. O Conexus **não adota essa authority model**: Mastra continua runtime substrate; Conexus Registry/Release continuam source of truth.

### Salesforce Agentforce

Agentforce Agent Script oferece:

```text
chat-assisted authoring
+
Canvas visual
+
Script view / DX
```

sobre uma definição versionável do Agent, além de Tools/Actions e lógica determinística. Isso sustenta a tese de que manual, natural-language e pro-code authoring podem convergir para uma representação canônica em vez de criar três produtos incompatíveis.

### Google Agent Registry

Google Cloud Agent Registry tornou explícito um padrão organizacional:

```text
centralized catalog
→ agents
→ tools / MCP servers
→ skills/endpoints
→ discovery + governance
```

Isso suporta um Workspace-level inventory/catalog no Conexus, mas não exige mover ownership para Workspace.

### Padrão derivado

A convergência externa observada é:

```text
local/owned authoring
+
composable tools/context/triggers
+
central discovery/governance
+
runtime-specific mechanics
```

O Conexus adiciona sua própria síntese:

```text
Project Baseline
+ Change
+ Capabilities
+ Integrations
+ Brain
+ Release
+ Evidence
```

como uma composição única de software e Agent.

---

## 4. Root cause

Sem 3K-04, coding/realization actors poderiam escolher silenciosamente produtos incompatíveis:

```text
A. Agents page edits runtime storage directly
B. Agents page edits git source but bypasses Change/Release
C. natural-language Agent Builder creates separate hidden definition
D. every app receives mandatory universal chat widget
E. Product Agent receives repo/source code merely because Builder is source-aware
F. Workspace owns a second global Agent fleet
G. every Agent tool becomes a new UniversalTool aggregate
H. missing Agent dependencies are created silently behind approval
```

Todos alterariam materialmente authority, product model, security ou user journey.

Target invariant:

> **Agent authoring is another form of Project evolution, not a parallel platform. Agent use is another product capability, not a reason to bypass Project/Release/Gateway authority.**

---

## 5. Alternativas adjudicadas

### A — Agent as code only

```text
repo / agent/v1
→ developer edits
→ Release
```

**REJECT como product experience.**

É coerente como engineering substrate, mas não atende AGT-2 nem a visão de uma plataforma AI-first em que operador/business user possa criar e evoluir Agents sem operar diretamente source files.

### B — Agent Studio / runtime storage as independent authority

```text
Agent UI
→ runtime DB/stored agent
→ publish independently from Project Release
```

**REJECT F1.**

Cria segunda definition/version/publish authority e pode produzir:

```text
repo says Agent A
runtime editor says Agent B
```

violando Registry/Release/3A-R8.

### C — Project-owned canonical Agent + specialized Builder experience

```text
manual UI / natural language
→ same Change
→ same candidate agent/v1
→ same verification
→ same Release
```

**APPROVED / GLOBAL MAXIMUM para F1.**

Preserva facilidade de uso sem perder source-controlled architecture.

---

## 6. Product Agent continua Project-owned

Ownership permanece:

```text
Project
→ Agent definition identity/revision relationship
→ Project-specific capabilities/bindings/use

Artifact Registry
→ immutable agent/v1 ArtifactRevision

Release
→ exact active Agent revision + runtime composition

Production Agent Runtime
→ executes exact Release-pinned Agent
```

Não criar:

```text
WorkspaceAgent owner
AgentFleet domain owner
AgentDeployment parallel to Release
AgentRevision table parallel to Registry
Global Agent config authority
```

Agent headless continua pertencendo a um Project mesmo quando não há uma grande Published App UI.

---

## 7. Agent Builder = specialized Build experience, não módulo novo

O Conexus Builder continua a única product-authoring owner/boundary para evolução do Project.

Conceitualmente:

```text
CONEXUS BUILDER
├── Build Application
├── Build Data / schema when current Change requires
├── Build Capability
├── Build Integration
└── Build Agent
```

`Agent Builder` é nome de uma **experiência especializada** dentro desse sistema, não novo bounded context/module/runtime.

Entradas equivalentes:

```text
Project → Agents → New Agent
Project → Agents → Agent → Change with Conexus
Project → Build → "quero um agente que..."
```

Todas convergem para o mesmo Change lifecycle.

---

## 8. Manual structured authoring + natural-language authoring convergem

O produto suporta duas famílias de interação:

```text
STRUCTURED / MANUAL
→ fields/forms/selection/editing where semantically safe

NATURAL LANGUAGE / CONEXUS
→ elicitation/reasoning/discovery/build assistance
```

Mas ambas produzem:

```text
same Change
→ same candidate AgentDefinition
→ same agent/v1 canonical artifact
→ same verification / Release path
```

Explicitamente proibido:

```text
ManualAgentDefinition
AIAgentDefinition
StoredAgentDefinition
EditorAgentDefinition
```

como authorities concorrentes.

---

## 9. Structured edit não precisa obrigatoriamente de coding-model call

Canonical governance não implica LLM para toda mutation.

Quando uma mudança puder ser representada deterministicamente e já estiver admitida pela architecture, a Agent Builder experience pode produzir candidate mutation estruturada sem coding LLM, por exemplo conceptualmente:

```text
budget limit change
qualified model choice within allowed set
memory policy switch already admitted/qualified
attach/detach an already-admitted read capability
```

Ainda assim:

```text
structured edit
→ Change
→ exact candidate diff
→ applicable checkpoint/proof
→ Release
```

Quando a mudança exige reasoning/discovery/code/capability creation, o Conexus Builder executa o fluxo agentic apropriado.

A escolha da mutation mechanism física pertence ao Realization Planning; authority/lifecycle é único.

---

## 10. Agent authoring core — product concepts

3K congela conceitos que a Agent Builder experience precisa tornar compreensíveis, não um YAML/JSON schema final.

### Core authoring

```text
Identity / purpose
Instructions / behavioral intent
Model policy / qualified model choice
Tools / capabilities available to reasoning
Brain / contextual knowledge binding
Memory policy
Interaction mode/surface intent
Policies / approvals / budgets / limits
Verification / evals / known limitations
```

### Adjacent management projections

```text
Triggers
Runs
Versions
Activity
Evidence
Used by / usage relationships
current published context
```

Adjacent projections podem viver na mesma Agent detail surface sem serem campos owned por `agent/v1`.

---

## 11. ToolProjection continua a interface do Agent

C-010 já possui o mecanismo correto:

```text
Release composition
→ approved resources
→ compile ToolProjection
→ Agent runtime sees bounded tools
```

3K-04 não cria `Tool` como novo universal domain aggregate.

Fontes atuais/admissíveis de ToolProjection incluem, conforme current authority:

```text
Project Query Capability
Project Action Capability
Integration Operation
explicitly admitted platform-native tool if a current consumer justifies it
```

Future families como:

```text
Agent-as-tool
MCP tool
external tool registry
special browser/workspace tool
```

continuam consumer/Decision-Loop gated.

Logo:

```text
Capability → often ToolProjection source
```

mas:

```text
all Tool == Capability
```

é **REJECT**.

---

## 12. Agent não recebe generic capability executor

O Product Agent nunca recebe uma primitive genérica equivalente a:

```text
execute(anySlug, anyInput)
```

como tool de negócio.

A ToolProjection compila apenas recursos explicitamente permitidos pela exact Release/policy, com schema/metadata/limits adequados.

A apresentação no Agent Builder pode mostrar linguagem amigável como:

```text
Tools
✓ Consultar estoque
✓ Consultar vendas
✓ Consultar preços de mercado
✓ Propor ajuste de preço
```

mas a runtime tool surface continua derivada mecanicamente da authority.

---

## 13. Builder pode propor Capabilities ausentes — nunca criá-las escondido

Um Agent intent pode revelar missing dependencies.

Exemplo:

```text
"Crie um Purchasing Agent"

required resources
├── inventory history      EXISTS
├── sales history          EXISTS
├── supplier lead time     MISSING
└── purchase suggestion    MISSING
```

O Builder pode propor expandir a mesma Change para incluir:

```text
new Query Capability
new Action Capability
new Integration Operation/binding if truly needed
new AgentDefinition
optional app Agent surface
```

Mas a expansão é materialmente visível no Change checkpoint.

Nunca:

```text
user approves "create Agent"
→ hidden new DB/API/action/effect permissions
```

Quando a dependência aumenta permissions/effects/dependencies, 3K-02 never-hide + C-017/3A-R8 continuam aplicáveis.

---

## 14. Agent Builder dependency analysis

Antes de coding/authoring material, o Builder deve conseguir representar ao operador, conforme materialidade:

```text
what Agent intends to do
which existing Capabilities/Integrations/Brain context satisfy it
what is missing
what new resources must be created
what permissions/effects would widen
what remains unsupported/deferred
```

Isso não cria `AgentDependencyGraph` domain record. É Change planning/inspection derivada dos recursos existentes.

---

## 15. Mastra relationship — adopt runtime, reject competing authoring authority

Mastra permanece Production Agent runtime substrate conforme 3C-10/3H-02.

ADOPT/USE where qualified:

```text
Agent runtime mechanics
model/provider plumbing
Conversation/thread realization
approved memory mechanics
suspend/resume
schedules
observability
other consumer-gated runtime capabilities
```

REJECT as Conexus authority:

```text
Mastra Stored Agent current config
Mastra Agent Editor current version
Mastra "latest" Agent resolution
self-editing/self-publishing runtime Agent
Mastra Studio config overriding Release
```

File-based Agents são useful reference/realization inspiration, mas `agent/v1` continua canonical Conexus product contract.

---

## 16. Builder source-aware ≠ Product Agent source-aware

Esta é uma boundary normativa de 3K-04.

### Builder / Agent Builder authoring context

Durante criação/evolução, o Builder pode receber contexto source-aware governado e proporcional ao Change, incluindo conforme aplicável:

```text
Project Baseline
relevant source files
current agent/v1
Capabilities
Integration definitions/bindings
Brain binding
app structure
existing tests/evals
usage/used-by relationships
```

Isso serve para **construir software**.

### Production Product Agent runtime

Por default o Product Agent NÃO recebe:

```text
repository contents
source tree
raw source code
shell
filesystem
arbitrary workspace
browser/computer-use
raw network
platform internals
```

porque essas capabilities aumentam confidentiality, injection, cost e execution authority surfaces.

Um Product Agent que realmente precise code/workspace/browser retorna ao named consumer/Decision Loop e às qualification/trust rules já previstas em 3H/3I.

Regra resumida:

```text
Builder = source-aware
Product Agent = product/context-aware
```

---

## 17. Product Agent recebe app context tipado, não browser truth

Um Product Agent embutido no app pode ser contextual ao que o usuário está vendo.

Exemplo:

```text
current page: Customer detail
selected customerRef: C-123
selected quoteRef: Q-8172
current bounded filter context
```

A surface pode enviar **refs/context hints tipados**.

Mas:

```text
browser-provided business value
-X-> source authority
```

Quando o Agent precisa de fato atual/material, usa ToolProjection/Capability para resolver a informação sob current authority.

Conceitualmente:

```text
Published App context
→ bounded refs/hints
→ Production Agent Runtime
→ governed ToolProjection
→ actual data/effects through owners/Gateway
```

Exact DTO/context envelope é Realization/contract work, não 3K.

---

## 18. Published App Agent surface é Project product design, não universal widget

3K-04 rejeita um chat global obrigatório para todo app.

Um Project pode expor seu Product Agent como, por exemplo:

```text
right-side copilot
inline "Ask Agent" affordance
dedicated assistant page
contextual action from a business object
conversation-first app
headless only / no interactive surface
```

A placement é Project product design.

A runtime relation permanece:

```text
Published App Agent surface
→ exact Release-pinned Product Agent
→ Conversation / AgentRun
```

O primeiro vertical 3K-03 continua legitimamente sem Product Agent.

---

## 19. Control Plane Agent management ≠ Published App Agent use

Duas experiências distintas:

### Project / Control Plane

```text
Agents
→ create/change/inspect
→ tools
→ Brain
→ memory policy
→ triggers
→ runs
→ versions
→ Evidence
```

### Published App

```text
business user
→ app-owned Agent interaction surface
→ exact active Release context
```

Logo:

```text
Control Plane Agent management
!= Published App Agent interaction
```

E:

```text
Control Plane permission
!= Published App access authority
```

I&A/runtime owners continuam aplicáveis.

---

## 20. Interactive e headless Agents são o mesmo Agent product concept

Não criar categorias de Agent separadas por UI.

### Interactive

```text
user/app context
→ Conversation
→ AgentRun
```

### Headless

```text
admitted trigger
→ AgentRun
```

Um Agent pode possuir um ou ambos os usos quando a Release/policy assim permitir.

Não criar `ChatAgent`, `ScheduledAgent` ou `AutomationAgent` como domínios separados.

---

## 21. Triggers são adjacent owner-derived projections

Visualmente Agent detail pode mostrar:

```text
Triggers
Manual
Conversation
Schedule
EVENT when eventually admitted
```

Mas triggers continuam seguindo sua authority própria (`AgentTrigger`/PAR), não viram campos mutáveis soltos dentro do `agent/v1` apenas porque aparecem na mesma tela.

Current F1 product only presents/configures trigger families that current authority has admitted.

`EVENT` permanece disabled/deferred até real consumer conforme 3H-02/C-007.

No fake unsupported trigger options.

---

## 22. Memory controls only expose admitted regimes

A Agent Builder experience pode apresentar memory policy, porém apenas regimes atualmente qualificados/admitidos.

Baseline continua conforme 3H-02:

```text
Conversation history            = available baseline
Working Memory                  = consumer-gated
Semantic Recall                 = eval-gated
Observational Memory            = eval-gated
Memory Extractors               = consumer/eval-gated
```

UI não transforma framework capability em product capability por existir.

Unsupported/unqualified feature não aparece como switch funcional.

---

## 23. Skills/subagents/MCP/A2A remain gated

Pesquisa externa mostra plataformas crescendo em:

```text
Skills
Subagents
MCP tools
A2A
agent networks
browser/workspace
channels
```

3K-04 deliberadamente NÃO promove essas families ao Agent Builder F1 apenas por trend parity.

Elas entram somente se:

```text
current consumer
+ compatible authority
+ required qualification
```

forem aprovados pelo applicable Decision Loop.

---

## 24. Agent candidate preview / testing

Agent authoring precisa possuir uma experiência de candidate inspection antes de Publish.

Conceitualmente:

```text
Agent candidate
→ Test / Preview
→ example conversations / calls
→ ToolProjection inspection
→ applicable assertions/evals
→ approval/effect behavior proof where relevant
→ known limitations
→ VERIFIED when authority actually establishes it
→ Publish
```

Invariantes:

```text
Agent test passed
!= active production Agent

candidate Agent verified
!= published/served Agent
```

3K-02 truth laws permanecem load-bearing.

Exact simulator/chat component/eval harness UI pertence a Realization/3L where substrate behavior matters.

---

## 25. Active Agent truth = exact Release

Alterar authoring source não altera Agent ativo.

```text
agent/v1 source changed
-X-> production Agent changed

candidate Agent verified
-X-> production Agent changed
```

Only:

```text
new AgentRevision
→ candidate/verification
→ Release
→ Promotion
→ SERVED_VERIFIED / applicable active Release
→ new Agent composition becomes product-active
```

AgentRun iniciado anteriormente preserva exact old Release/revision conforme 3G/3H.

---

## 26. Project Agents surface

Project → Agents é a resource surface do owner context.

A Agent detail pode projetar, conforme current consumer:

```text
name / purpose
active version/context
instructions summary
Tools/Capabilities
Brain binding/context
memory policy
triggers
where used
runs/activity
verification/evals
known limitations
cost/spend summary where available
Evidence / diagnostics
```

A surface pode oferecer:

```text
[New Agent]
[Change with Conexus]
[Test]
[Inspect Version]
```

sem criar alternate mutation authority.

---

## 27. Workspace Agents catalog/projection — bounded amendment to 3K-01

O operador declarou um consumer atual para enxergar a força de Agents da empresa através de vários Projects.

Além disso, C-003 AGT-2 exige uma central de agentes.

Portanto 3K-04 amenda boundedmente a Workspace shell de 3K-01:

```text
Workspace
├── Projects
├── Agents
├── Brain
├── Connections
└── Workspace administration / membership
```

`Agents` em Workspace significa **aggregate catalog/projection**, não new owner.

---

## 28. Workspace catalog does not create fleet authority

Mantém-se REJECT:

```text
Workspace owns Product Agents
Workspace publishes Agent definitions
Workspace owns Agent Releases
Workspace-wide runtime Agent authority
Global Agent state/config current truth
Agent fleet scheduler/runtime owner
```

A nova surface apenas agrega owner-derived facts de Agents pertencentes aos Projects.

Conceitualmente:

```text
Workspace Agents
→ authorized cross-Project projection
→ Agent A — Project Purchasing
→ Agent B — Project Price Intelligence
→ Agent C — Project CRM
```

Click-through retorna ao owning Project/Agent surface.

---

## 29. Workspace catalog is access-filtered server-side

Membership no Workspace não implica automaticamente discoverability de todo Agent de todo Project.

A projection deve usar current server-side authorization e retornar somente Agents que o caller pode descobrir/inspecionar segundo a authority vigente.

```text
Workspace Agents
→ current authorized Project scope
→ aggregate projection
```

Nunca:

```text
browser filters hidden Agents after receiving them
Workspace membership alone grants all Project visibility
```

I&A/Project ownership continua decidindo acesso.

---

## 30. Workspace catalog product truth

O catálogo pode projetar informações úteis como:

```text
Agent name/purpose
owning Project
interaction mode: interactive/headless/both where derived
active version/current Release context
last activity/run
attention items
pending decisions where authorized
cost/activity summary where material
```

Mas 3K-02 continua proibindo um badge universal `Healthy` sem owner facts que sustentem aquele claim.

Exemplos:

```text
Last run failed
2 pending approvals
No recent run
Agent has no active Release
```

são preferíveis a um score opaco.

---

## 31. Workspace New Agent preserves Project ownership

Se a Workspace catalog possuir `New Agent`, a ação precisa resolver explicitamente o Project owner:

```text
Workspace → Agents → New Agent
→ choose authorized owning Project
OR create a new authorized Project
→ enter Project Agent Builder experience
```

Nunca criar Agent Workspace-owned por conveniência.

---

## 32. Agent-only / headless-first Project remains valid

Um Project pode ter Product Agents como recursos principais mesmo sem uma grande Published App UI.

Exemplo:

```text
Project: Purchasing Intelligence
├── Purchasing Agent
├── Data
├── Capabilities
├── Integrations
└── Brain binding
```

Isso não exige mover Agent para Workspace.

O Project continua unidade coerente de software/composição/Release/ownership.

---

## 33. Agent-addressable platform principle

O Conexus não deve depender de browser clicking para o próprio Builder operar recursos da plataforma.

Normative product/engineering direction:

```text
Human UI
    ↓
owner APIs / typed platform capabilities
    ↑
Builder / governed automation
```

UI não deve conter business mutation semantics inacessíveis ao Builder por uma boundary tipada equivalente.

Isso NÃO congela um public MCP server, CLI protocol ou external agent API agora.

Adapters como:

```text
MCP
CLI
external coding-agent integration
```

podem surgir depois sobre owners existentes quando houver consumer real.

O princípio agora é somente:

> **same platform authorities, multiple controlled clients; no browser-automation requirement as the canonical Builder path.**

---

## 34. Agent Builder sees architecture, Product Agent sees product context

A vantagem estratégica do Conexus vem da composição:

```text
Agent Builder
+ Project Baseline
+ source
+ Capabilities
+ Integrations
+ Brain
+ Release
+ Evidence
```

Isso permite construir Agents coerentes com o software existente.

Mas essa capacidade de authoring não vaza automaticamente para runtime:

```text
Production Agent
→ approved product context
→ Brain/context
→ exact ToolProjection
→ owner-governed facts/effects
```

Essa assimetria é intencional e reduz cost/trust surface.

---

## 35. Agent product page composes owners without flattening them

Agent detail é uma product composition surface, não um novo aggregate owner.

Pode reunir:

```text
AgentDefinition      → Registry / Release
Tools                → compiled ToolProjection
Brain                → Brain binding
Memory               → PAR policy/runtime projection
Triggers             → AgentTrigger
Runs                 → AgentRun
Approvals             → ApprovalRequest
Versions             → Release / artifact history
Evidence             → applicable owners / OBS
```

A proximidade visual não transfere ownership.

---

## 36. Human decisions remain context-local

Agent authoring uses the normal Change checkpoint.

Effect approvals continue exact ApprovalRequest.

Publish continues Release/Promotion gate.

Access mutations continue Settings/Access owner.

Não criar:

```text
Agent Approval Center
Agent-specific Change lifecycle
Agent-specific Publish authority
Agent-specific RBAC engine
```

---

## 37. First vertical remains Agent-free

3K-04 não altera 3K-03.

O Analisador Inteligente de Orçamentos continua:

```text
Product Agents = 0 required
external WRITE = 0
business automation = 0
```

Project → Agents apresenta empty state honesto.

3K-04 fecha F1 product architecture sem adulterar o benchmark com feature artificial.

---

## 38. Explicit REJECT F1

```text
Mastra Stored/Editor Agent as Conexus authority
second Agent authoring database
AgentBuilderModule / AgentBuilderRuntime / AgentBuilderDB
Workspace-owned Product Agents
Workspace Agent fleet runtime owner
Global Agent config current authority
Universal Tool domain/registry competing with existing owners
Generic execute(anySlug) exposed to LLM
hidden creation of Capabilities/permissions/effects while creating Agent
Product Agent repo/source-code access by default
Product Agent shell/filesystem/browser/workspace by default
mandatory universal chat widget in every app
ChatAgent / ScheduledAgent / AutomationAgent domain subclasses
unsupported EVENT toggle merely because runtime library supports it
Semantic/Observational memory switches before qualification
Skills/subagents/MCP/A2A/network merely for parity
cross-Project Agent mutation from Workspace catalog by default
global Stop/Edit/Publish controls without named owner/failure class
```

---

## 39. DEFER SAFELY / Realization boundary

3K-04 não congela:

```text
exact Agent Builder form/component layout
exact field names in agent/v1
YAML vs JSON vs TS authoring syntax
manual structured mutation implementation
exact app-context DTO
exact React/streaming/chat component
SSE/WebSocket protocol
exact Agent test simulator
exact eval UI
Workspace catalog query/cache implementation
MCP/CLI/public external Builder adapter
agent template gallery
Agent marketplace
cross-Project reusable Agent templates
Skills/Subagents/Agent Networks
external channels
EVENT ingress
browser/workspace/code Product Agent power
```

Esses itens entram no Realization Planning ou novo Decision Loop quando material.

---

## 40. Falsification strategy

3K-04 é falsificada se qualquer propriedade abaixo exigir nova authority não reconhecida:

1. manual Agent edit precisa bypassar Change/Release para ser utilizável;
2. natural-language Agent Builder precisa manter definition separada do `agent/v1`;
3. Mastra Stored/Editor current config precisa virar runtime source of truth;
4. ToolProjection não consegue representar current Query/Action/Integration tool consumers sem UniversalTool owner;
5. criar Agent corretamente exige hidden creation de material capabilities/permissions depois do checkpoint;
6. Workspace catalog precisa possuir Agent lifecycle para listar/observar cross-Project Agents;
7. access-filtered catalog não pode ser realizado sem broad Workspace visibility;
8. Product Agent só consegue receber current app context se browser payload virar business authority;
9. Agent embedded in app exige raw source/repo/shell by default;
10. headless Agent não consegue continuar Project-owned/Release-pinned;
11. Agent candidate cannot be tested/verified without becoming production-active;
12. active Agent cannot remain exact Release truth after manual/AI source edits;
13. Agent Builder can only operate Conexus through brittle browser automation because owner APIs are not available to the platform itself.

Material failure retorna ao smallest applicable Decision Loop.

---

## 41. Reopen triggers

Reabrir somente por evidence material, incluindo:

- first cross-Project Agent mutation requirement that cannot remain Project-owned;
- first real Agent template/reuse requirement spanning Projects with durable independent lifecycle;
- first Agent-as-tool consumer;
- first MCP/A2A/external tool registry consumer requiring contract changes;
- first Product Agent requiring code/repo/workspace/browser execution;
- first EVENT-driven production consumer;
- first multi-agent/subagent architecture consumer;
- first organizational operation requiring centralized stop/revoke beyond existing Project/PAR/security owners;
- measured scale where computed Workspace catalog becomes materially inadequate and a reconstructible projection/cache needs explicit realization;
- evidence that `agent/v1` cannot express a required Product Agent capability without new semantic contract.

Framework feature availability, visual preference or symmetry are not reopen triggers.

---

## 42. 3K-01 bounded amendment

3K-04 amends only these product-model points from 3K-01:

### Workspace shell

Previously:

```text
Workspace
├── Projects
├── Brain
├── Connections
└── Workspace administration / membership
```

Now:

```text
Workspace
├── Projects
├── Agents
├── Brain
├── Connections
└── Workspace administration / membership
```

`Agents` = access-filtered cross-Project catalog/projection.

### Prior Workspace-global Agent fleet rejection

Clarification:

```text
Workspace-global Agent ownership/runtime/fleet authority
→ remains REJECT F1

Workspace-level Agent catalog/projection
→ APPROVED by current consumer + AGT-2
```

No other 3K-01 product shell decision is reopened.

---

## 43. Coverage of 3A-R6 / C-003

3K-04 closes the remaining product-architecture portion of:

```text
3A-R6: Production Agent definition/use
C-003 AGT-2: central to create/manage/observe agents
C-003 AGT-5: embeddable Agent use is a Published-App surface over governed runtime
```

AGT-5 transport/event mechanics remain 3F/3H/Realization concerns; 3K fixes the product journey and authority boundary.

AGT-3 headless semantics remain PAR/trigger authority; 3K fixes their management/presentation relationship without inventing fake EVENT support.

---

## 44. Final product flow

```text
WORKSPACE
  │
  ├── Projects
  └── Agents — aggregate catalog
          │
          └── choose Agent
                 ↓
              PROJECT
                 │
        ┌────────┴────────┐
        │                 │
      Build             Agents
        │                 │
        └──── specialized Agent Build
                 │
               Change
                 │
        ┌────────┼──────────┐
        │        │          │
   Capabilities agent/v1  app surface
        │        │          │
        └────────┼──────────┘
                 ↓
           Verification
                 ↓
              Release
                 ↓
          active composition
                 │
       ┌─────────┴──────────┐
       │                    │
Published App          Headless Trigger
Agent surface               │
       │                    │
       └─────────┬──────────┘
                 ↓
       Production Agent Runtime
                 │
          exact ToolProjection
                 │
         owners / Gateway
```

---

## 45. Final verdict

```text
F3K-IC-01 Product Agent authoring/management/use        = RESOLVED
Product Agent ownership                                = PROJECT
canonical authoring                                    = agent/v1 / Registry
active production authority                            = exact Release
Agent Builder                                          = specialized Builder experience
manual + natural-language authoring                    = same Change / same candidate
missing capability creation                            = explicit Change expansion only
Tool interface                                         = compiled ToolProjection
Universal Tool domain                                  = REJECT
Builder source-aware                                   = YES / scoped
Product Agent source-aware default                     = NO
Product Agent typed app context                        = YES
mandatory universal Agent UI                           = NO
interactive + headless                                 = same Product Agent concept
Workspace Agents catalog                               = APPROVED projection
Workspace Agent ownership/fleet runtime                = REJECT
new Hub module                                         = 0
new durable record class                               = 0
new database/schema                                    = 0
prior structural phase reopen                          = NONE
implementation                                         = BLOCKED
```

## Próxima ação

Executar **3K internal closure completeness/deletion check** sobre 3K-01..3K-04 + 3A-R8/R9 contra C-001/C-003/3A-R6 e prior authority.

Se `Material Finding = 0`, 3K torna-se **INTERNALLY CONVERGED / READY FOR FINAL INDEPENDENT ADVERSARIAL REVIEW**. A revisão externa independente continua reservada a **uma única chamada no fechamento global de 3K**, conforme decisão do operador.

Nenhuma implementação de produto está autorizada.