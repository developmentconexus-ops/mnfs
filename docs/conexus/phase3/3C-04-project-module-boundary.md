# 3C-04 — Project Module Boundary

**Status:** APROVADO pelo operador  
**Fase:** 3C — Domain / Module Architecture  
**Importante:** esta decisão não constitui C-018, não encerra 3C e não autoriza implementação.

## Decisão em uma frase

No Conexus F1, **Project** é o módulo de identidade, lifecycle e configuração intencional da unidade independente de software. Ele owns a associação ao Workspace, o source repository canônico, a semântica de Project Inception, a authority sobre a Project Baseline aprovada, os bindings tipados `ProjectBrainBinding` e `ProjectConnectionBinding`, e o Project Config Contract. Ele não owns a estratégia/execution graph do Builder, Artifact Registry, Project business data, environments, Release/Deployment, Production Agent Runtime, Observability ou Storage. Alterar Baseline, binding ou config não altera automaticamente o que está servido: a mudança só chega ao runtime por uma Release posteriormente validada e promovida.

A invariante central é:

```text
Project
= software identity + approved intent + explicit bindings

Project-scoped
!=
Project-module-owned
```

## Contexto e precedência

Esta decisão materializa, sem reabrir, as seguintes autoridades anteriores:

- 3B-01: Workspace é a raiz soberana de tenancy;
- 3B-02: Project é unidade independente de software/produto, com lifecycle próprio;
- 3B-03: Change é unidade verificável de evolução de um Project;
- 3B-04: a semântica durável de evolução é separada da estratégia concreta do Builder; `Plan` e `Work Unit` são internos ao Builder;
- 3B-05: Project greenfield nasce como container vazio e passa por Inception/Discovery antes do primeiro Change;
- 3B-06: Project Baseline exige aprovação humana explícita antes de iniciar Initial Changes;
- 3B-08: Baseline é conteúdo git-first, mas sua revisão/digest aprovada é authority do Hub;
- 3B-09: um source repository canônico por Project no F1;
- 3B-15: `Workspace owns resource / Project owns binding`, com bindings tipados e explícitos;
- 3B-16: Git, Hub/Postgres, Project Database e Registry/CAS possuem responsabilidades distintas;
- 3B-17: Projects permanecem isolados; reuse é explícito;
- C-005: artifacts são autorados em Git e compilados para registry imutável; registry não é authoring;
- C-007: Connections possuem identity, credential lifecycle, revision e qualification próprias;
- C-011: Brain é Workspace-scoped, publicado separadamente, e Project apenas pina/realiza seu binding;
- C-014: ReleaseManifest é composition root; environment/serving/promotion são authority de Release/Deployment, não do Project intent;
- C-017: `Group → Project → Change → Work Unit → ActorRun` é o work graph do builder, com correctness antes da decomposição;
- 3C-01: F1 é modular monolith;
- 3C-02: Identity & Access owns principal/access relationships;
- 3C-03: `scoped_by(workspace) != implemented_by(WorkspaceModule)`.

Nada aqui escolhe tabelas/FKs (3E), signatures/DTOs/HTTP (3F), FSM/lifecycle concreto (3G), runtime de agente (3H), physical security (3I) ou deployment topology (3J).

## Pesquisa comparativa usada para desafiar a boundary

A boundary foi confrontada com software factories, developer platforms e o acervo Mitra. O objetivo é extrair forma, não copiar machinery.

### Factory

Factory trata Project como contexto de uma codebase/configuração, enquanto Droid runtime, Missions, policies e execution targets permanecem capacidades separadas. A transferência útil é que **Project contextualiza o software; não precisa incorporar a implementação do sistema que o constrói**.

Referências:

- `https://docs.factory.ai/`
- `docs/research/FACTORY-AI-HARNESS-REFERENCE-MAP.md`

### Harness

Harness mantém Account → Organization → Project como escopos, mas pipelines, services, environments, connectors e deployment machinery continuam capabilities próprias. A transferência útil é separar **working scope** de **módulo que implementa tudo naquele scope**.

Referências:

- `https://developer.harness.io/docs/platform/platform-whats-supported/`
- `https://developer.harness.io/docs/platform/role-based-access-control/rbac-in-harness/`

### GitHub

Repository funciona como unidade durável de source/history, enquanto Actions, Environments, Deployments, Packages e organization/team access possuem lifecycles próprios. A transferência útil é que a unidade de software pode referenciar infraestrutura especializada sem incorporá-la num aggregate único.

Referência:

- `https://docs.github.com/`

### Mitra

O acervo observado mostra Project como unidade fortemente scoped de repo/database/app, enquanto a qualidade de construção emerge de sandbox, CLI, planejamento, SDK, Git e lifecycle separados. O padrão de projeto real é uma sequência de discovery → arquitetura → alinhamento → checkpoint → planejamento → implementação → teste → revisão, sem workflow engine proprietário consolidando tudo numa entidade Project.

Referências internas:

- `docs/reference/mitra/00-OVERVIEW.md`
- `docs/reference/mitra/07-padrao-de-projeto.md`
- `docs/research/MITRA-INSPIRATION-MAP.md`

## Alternativas avaliadas

### Alternativa A — Project como control/intent boundary estreita

```text
Project
├── identity + lifecycle
├── Workspace scope
├── canonical source repository association
├── Project Inception semantics
├── approved Project Baseline authority
├── ProjectBrainBinding
├── ProjectConnectionBinding
└── Project Config Contract

Builder                 separado
Artifact Registry       separado
Release / Deployment    separado
Production Runtime      separado
Storage                 separado
```

**Decisão:** ADOTADA para F1.

Benefícios atuais:

- preserva Project como unidade independente de software;
- mantém intenção aprovada distinta de execução e serving;
- permite trocar Builder/runtime/deployment sem reconstruir identidade do Project;
- mantém bindings como decisões explícitas do consumidor;
- evita `ProjectGodModule`;
- evita o extremo oposto de Project ser mero `{id, workspaceId, name}` sem authority real.

### Alternativa B — Project como aggregate de tudo Project-scoped

Exemplo rejeitado:

```text
Project
├── Change / Work Unit / ActorRun
├── artifacts
├── agents
├── database
├── environments
├── releases
├── attachments
├── connections
└── observability
```

**Decisão:** REJECT.

Isso confunde scope lógico com module ownership, transforma Project em god-module e elimina as boundaries já necessárias para Builder, Registry, Release, runtime e Storage.

### Alternativa C — Project como mero registro de identidade

Exemplo insuficiente:

```text
Project {
  id
  workspaceId
  name
}
```

**Decisão:** REJECT.

Nesse desenho, Baseline approval, canonical repo, Inception e bindings teriam que ser espalhados por módulos arbitrários, fragmentando a pergunta central: **“qual software é este e qual intenção/configuração está aprovada para ele?”**

### Alternativa D — fundir Project e Builder

**Decisão:** REJECT.

C-017 define o work graph do builder e 3B-04 exige isolamento entre semântica durável do Project e estratégia concreta de decomposição/execução. Project precisa sobreviver à substituição da estratégia de Builder.

## Responsabilidade do módulo

Project responde à pergunta:

> **Qual unidade independente de software existe, o que ela pretende ser, qual source canônico a representa e quais recursos externos ao seu próprio domínio ela escolheu explicitamente usar?**

Forma conceitual:

```text
Workspace
  │
  ▼
Project
├── identity / lifecycle
├── canonical source repository
├── Inception / Baseline authority
├── Brain binding
├── Connection binding(s)
└── Config Contract
```

A responsabilidade termina antes de decidir **como** o Project será implementado, compilado, servido ou operado em produção.

## Project owns — identity, scope e lifecycle estrutural

Project owns semanticamente:

```text
Project identity
Workspace scope
intrinsic Project profile
structural lifecycle
```

O vínculo ao Workspace é parte da identidade/scoping do Project. Isso não transfere Project para o Workspace module e não autoriza segunda lista autoritativa em `Workspace.projects[]`.

A forma física da relação pertence a 3E.

## Project owns — canonical source repository association

3B-09 congela exatamente um source repository canônico por Project no F1.

Logo Project owns semanticamente a associação:

```text
Project
└── CanonicalSourceRepositoryRef
```

A associação responde:

> **“Qual source repository é o authoring root canônico deste software?”**

Mas Project **não owns a implementação Git**.

Ficam fora do módulo:

```text
fetch/push
GitHub credentials
bundle creation/import
quarantine
worktree mechanics
commit transfer
branch implementation
diff mechanics
Git provider SDK
```

Regra:

```text
Project owns repository identity/association.
Git infrastructure owns repository transport/mechanics.
```

GitHub é provider F1, não parte da semântica do domínio Project.

## Project owns — Inception semantics

3B-05 define:

```text
Create Project
  ↓
Inception / Discovery
  ↓
Project Baseline candidate
  ↓
Human approval
  ↓
Initial Changes
```

A **semântica** dessa progressão pertence ao Project module porque ela estabelece o que o software é antes do primeiro Change.

Project owns perguntas como:

- o Project ainda precisa de Inception?;
- qual Baseline candidate está em avaliação?;
- a Inception já produziu material suficiente para checkpoint?;
- qual revisão foi aprovada como Baseline ativa?;
- Initial Changes já podem ser admitidos?

Project não owns a estratégia concreta usada para investigar.

Inception pode usar:

```text
Pi/E2B runtime
Gateway
Brain
Connections
repository inspection
web/research tools
```

conforme authority e necessidade.

Regra:

```text
Project owns inception meaning/authority.
Runtime/Builder-adjacent mechanisms execute investigation tactics.
```

A FSM exata fica para 3G.

## Project owns — Project Baseline authority

O Project Baseline tem duas naturezas deliberadamente separadas:

```text
Git
→ human-readable/versioned Baseline content

Project module / Hub authority
→ which revision/digest is approved and active
```

Portanto:

```text
git HEAD
!=
approved Project Baseline
```

Editar o arquivo de Baseline no repo não muda automaticamente a authority que Actors/Builder podem assumir.

Project owns semanticamente:

```text
Baseline candidate identity
approved Baseline revision/digest
approval relationship to Project
active Baseline authority
```

A forma persistida final pertence a 3E.

### O que Project Baseline não é

Não é:

- Release;
- current deployment;
- artifact registry snapshot;
- Change contract;
- runtime configuration material;
- conversation memory;
- latest git commit por definição.

É a especificação aprovada do estado intencional do Project.

## Project owns — ProjectBrainBinding

3B-15 congela:

```text
Workspace owns resource
Project owns binding
```

Brain owns:

```text
BrainDefinition
BrainRevision
BrainPack
Brain compilation
Brain health
KnowledgeProposal lifecycle
```

Project owns:

```text
ProjectBrainBinding
```

porque o binding responde:

> **“Como ESTE Project escolheu consumir ESTA revisão do Brain?”**

O binding pode pin-ar revisão/digest, logical IDs e mapeamentos locais conforme C-011/3B-15.

Project **não** compila BrainPack e não decide sozinho se o binding é semanticamente válido. A validação contra BrainRevision/BrainPack permanece capability do Brain module.

Regra:

```text
Brain owns reusable knowledge resource.
Project owns consumer-specific binding intent.
Brain validates Brain semantics.
Release later pins the exact composition served.
```

## Project owns — ProjectConnectionBinding

Connections owns:

```text
Connection identity
credential lifecycle
ConnectionRevision
qualification/testConnection
provider/auth behavior
health
```

Project owns:

```text
ProjectConnectionBinding
```

porque o binding responde:

> **“Qual Connection/revision/environment relationship este Project decidiu usar para determinada finalidade?”**

A existência de binding não implica que a Connection esteja saudável, qualificada para PROD ou autorizada para qualquer effect.

Essas decisões continuam em Connections/Gateway/Release conforme a operação.

## Project owns — Project Config Contract

Project owns a declaração do **shape de configuração requerido pelo software**.

Exemplo conceitual:

```text
Project Config Contract
├── CRM_CONNECTION required
├── DEFAULT_TIMEZONE required
└── FEATURE_MODE optional/typed
```

A pergunta é:

> **“Que configuração este software exige para funcionar?”**

Isso é parte da intenção/configuração do Project.

Mas Project não owns os valores/material resolvidos por ambiente.

Divisão:

```text
Project
→ required configuration shape/contract

Release / Deployment
→ exact config contract digest in candidate/release
→ target-environment conformance

Connections
→ Connection identity/revision

Secret storage / credential backend
→ secret material/version
```

Mudança funcional no Config Contract pode tornar um candidate/release anterior inadequado, mas a mecânica exata de stale/revalidation pertence a Release/3G.

## Project-scoped não significa Project-owned

A decisão reutiliza explicitamente a invariante de 3C-03:

```text
scoped_by(project)
!=
implemented_by(ProjectModule)
```

Exemplos:

```text
Change / Work Unit / ActorRun
→ Project-scoped
→ Builder boundary

ArtifactRevision
→ Project-scoped para kinds de Project
→ Artifact Registry

ReleaseManifest
→ Project-scoped
→ Release / Deployment

Conversation / production AgentRun
→ Project-scoped
→ Production Agent Runtime

Attachment authority
→ Project-scoped
→ Storage

business rows
→ Project-scoped por database/environment
→ Project business data plane
```

## O que Project explicitamente NÃO owns

### Não owns Builder strategy/execution graph

Project não owns os internals:

```text
Plan
Work Unit
ActorRun
validator execution
Finding routing
RigorProfile calculation
planning-depth machinery
```

C-017 chama `Group → Project → Change → Work Unit → ActorRun` de **work graph do builder**.

`Change` merece uma nota de boundary: ele é uma unidade durável de evolução do Project, mas seu ownership final não é redefinido silenciosamente por 3C-04. Esta decisão congela apenas que `Change` **não é internal state do Project module**. 3C-05 deverá decidir como `Change` aparece como public durable boundary do Builder enquanto `Plan`/`Work Unit` permanecem estratégia interna conforme 3B-04.

Isso evita dois erros:

```text
Project module owns whole builder graph     ← god-module
```

ou

```text
Change becomes disposable Builder tactic   ← viola semântica durável
```

### Não owns Artifact Registry

C-005 separa:

```text
Artifact Source
→ authored in Project repo

Artifact Revision / compiled payload
→ immutable registry
```

Portanto:

```text
artifact authored in Project repo
!=
Artifact Registry belongs to Project module
```

Project não owns:

- registry lifecycle;
- compiled payload;
- artifact executor;
- activation pointer;
- kind-specific execution;
- artifact serving authority.

F3B-R3 — Registry multi-scope — continua aberto para a decisão própria do Registry.

### Não owns Release / Deployment

Project não owns:

```text
ReleaseManifest
ReleaseRecord
PromotionRecord
active environment pointer
EnvironmentConformance
promote
rollback
SERVED_VERIFIED
```

C-014 mantém três histórias separadas:

```text
source history        → Git
operational execution → ActorRun / agent_event
served product version→ Release / Promotion
```

Project intent não é deployed reality.

### Não owns environments

DEV, RunPreview, validation DBs e PROD são scoped pelo Project, mas sua materialização/lifecycle operacional não pertence ao Project module.

```text
Project
→ software exists and has approved intent

Release / Deployment / Data plane
→ where/how candidate or release is materialized
```

3C-04 não cria `ProjectEnvironment` generic object.

### Não owns Project Database business data

Project module não lê/escreve tabelas de negócio apenas porque o database é do Project.

```text
hub_control Project state
!=
Project business database
```

Business rows, transactional state e domain data do app não viram internals de Project module.

### Não owns Production Agent Runtime

Project-scoped agents/conversations/runs não entram no Project module.

Ficam para Production Agent Runtime:

```text
AgentDefinition runtime semantics
Conversation / turns
production AgentRun
model/tool projection execution
approval interactions
runtime budgets
```

### Não owns Storage

Attachments/blobs podem ser Project-scoped, mas Storage owns upload/download/authorization/lifecycle do recurso armazenado.

### Não owns Observability

ProjectId é dimensão de correlação, não motivo para Project own telemetry/event storage.

Observability nunca vira source de Project authority.

### Não owns Identity & Access

Project não own memberships/grants/roles. I&A pode autorizar `project.*`, mas isso não transfere access graph para Project.

## Binding intent não é activation

Mudanças em Baseline, Brain binding, Connection binding ou Config Contract **não alteram automaticamente o serving atual**.

Exemplo:

```text
ProjectConnectionBinding v3 aprovado
        │
        ├── current PROD Release continua em composição anterior
        │
        ▼
future candidate
        ↓
ReleaseManifest
        ↓
validation/conformance
        ↓
human promotion gate
        ↓
active pointer
```

O mesmo vale para Brain/config.

Regra:

```text
Project intent mutation
!=
live deployment mutation
```

Essa separação impede live inheritance e mudança invisível de produção.

## Public internal API sem congelar 3F

3C congela capacidades semânticas, não signatures TypeScript, DTOs, routes ou error taxonomy.

A API pública deve suportar semanticamente operações equivalentes a:

```text
createProject
readProject
updateProjectProfile
changeProjectLifecycle

associateCanonicalRepository
resolveCanonicalRepository

beginInception
proposeProjectBaseline
approveProjectBaseline
resolveApprovedProjectBaseline

setProjectBrainBinding
resolveProjectBrainBinding

setProjectConnectionBinding
resolveProjectConnectionBindings

publishProjectConfigContract
resolveProjectConfigContract
```

Os nomes são descritivos, não contratos finais.

### O que não pertence à Project API

```text
planChange / dispatchWorkUnit / runActor
```

→ Builder.

```text
compileArtifact / activateArtifact
```

→ Artifact Registry / Release.

```text
promote / rollback / resolveActiveRelease
```

→ Release / Deployment.

```text
testConnection / rotateCredential
```

→ Connections.

```text
compileBrain / publishBrain
```

→ Brain.

```text
executeProductionAgent
```

→ Production Agent Runtime.

```text
uploadAttachment / fetchBlob
```

→ Storage.

## Consumers

Consumers naturais incluem:

```text
Identity & Access
Builder
Artifact Registry
Brain
Connections
Capability Gateway
Production Agent Runtime
Release / Deployment
Storage
Control Plane application/UI
```

A maioria dos consumers deve precisar apenas de projeções estreitas, como:

```text
ProjectId
WorkspaceId
canonicalRepositoryRef
approvedBaselineDigest
brainBindingDigest
connectionBinding refs/digests
configContractDigest
```

Isso reduz acoplamento sem criar DTO universal prematuramente.

## Allowed dependencies — intenção de 3C

O grafo exato pertence a 3D. Neste nível:

- Project pode depender da public boundary de Workspace para validar scope/lifecycle quando necessário;
- Project pode depender da public boundary de Brain para validar/pinar uma revisão/binding;
- Project pode depender da public boundary de Connections para validar identidade/revisão elegível ao binding;
- Project pode depender de uma porta estreita de repository infrastructure para associar/observar o source canônico;
- operações multi-boundary podem ser coordenadas pela application layer sem criar cycles artificiais;
- IDs/references estáveis não autorizam importação de internals.

## Forbidden dependencies

Project não deve depender de:

```text
Builder internals
Artifact Registry internals
Release internals
Production Agent Runtime internals
Observability storage as authority
Project business database
E2B SDK
Pi runtime SDK
GitHub SDK directly in domain semantics
Connection secret material
Brain compiler internals
blob/object-storage internals
```

Também é proibido:

```text
Project.currentDeployment == source of Project truth
```

A realidade servida pertence ao Release/Deployment boundary.

## Interactions e eventos conceituais

3C não cria event bus nem schemas finais. Os eventos abaixo descrevem facts úteis a consumers.

### Project created

```text
create empty Project container
→ Project eligible for Inception
```

Não implica automaticamente:

```text
PROD database created
Release created
Agent created
Brain adopted
Connection adopted
artifacts registered
```

### Inception completed / Baseline candidate proposed

```text
Inception evidence
→ Baseline candidate
→ human checkpoint
```

Ainda não permite Initial Changes até approval.

### Baseline approved

```text
Baseline candidate
→ explicit human approval
→ approved Baseline authority
→ Builder may admit Initial Changes
```

Aprovar Baseline não aprova automaticamente nenhum Change posterior.

### Brain/Connection binding changed

```text
Project binding revision changes
→ future candidate composition may change
→ current serving remains unchanged
```

### Config Contract changed

```text
Project Config Contract revision changes
→ future release candidate must use new contract
→ serving does not change directly
```

### Canonical source repository changed

Troca de authoring root é operação material porque altera a origem do software.

3C-04 não congela o workflow, mas exige que a mudança não seja tratada como simples rename de metadata. 3G/3I devem considerar re-discovery/reconciliation e authority explícita.

### Project archived

Conceitualmente:

```text
Project archived
→ no new ordinary evolution/promotion admissions
```

Mas archive não significa purge automático:

```text
-X-> delete databases
-X-> delete Releases
-X-> delete attachments
-X-> delete Brain
-X-> delete Connections
```

Archive-before-purge de 3B-16 permanece.

## Authority boundary

A formulação normativa é:

> **Project é authority sobre a identidade e lifecycle da unidade independente de software, seu Workspace scope, seu source repository canônico, a Project Baseline aprovada e seus contratos explícitos de uso de recursos Workspace-scoped. Ele não é authority sobre como Changes são decompostos/executados, quais artifacts estão ativos, qual Release está servida, qual environment está saudável ou quais business data existem.**

Resumo:

```text
Workspace
→ sovereign organizational root

Project
→ software identity + approved intent + bindings

Builder
→ controlled evolution of the software

Artifact Registry
→ executable immutable materialization

Release / Deployment
→ exact served composition

Production Agent Runtime
→ live business-agent execution
```

## Por que Project merece módulo separado

Project contém facts que precisam sobreviver à substituição de praticamente todo o restante:

```text
"Este é o Project X,
 pertence ao Workspace Y,
 usa este source repository canônico,
 tem Baseline Z aprovada,
 e escolheu estes bindings/config contracts."
```

Podemos trocar:

- Builder strategy;
- Pi/runtime provider;
- sandbox provider;
- Artifact Registry implementation;
- deployment machinery;
- database realization;
- Git hosting provider.

A identidade/intenção do Project continua válida.

Isso constitui responsabilidade estável e consumidores reais suficientes para uma boundary própria.

## Anti-overengineering

### Não criar Project God Object

F1 não terá aggregate universal que carregue snapshot de todos os subsistemas:

```text
ProjectState {
  builder
  artifacts
  releases
  agents
  database
  connections
  attachments
  telemetry
  ...
}
```

Consumers consultam os módulos owners de cada dimensão.

### Não criar GenericProjectResource

Não haverá:

```text
ProjectResource
ProjectResourceType
ProjectOwnedResourceRegistry
attachResource(project, type, id)
```

Os resources reais têm semantics próprias.

### Não criar generic binding engine

Continuam concretos:

```text
ProjectBrainBinding
ProjectConnectionBinding
```

Nenhum `GenericProjectBinding` é autorizado.

### Não criar ProjectSettings bag

Configuração é tipada pelo owner. Project Config Contract declara requirements do software; não é um JSON arbitrário para settings de outros módulos.

### Não duplicar Release state no Project

Não manter:

```text
Project.activeRelease
```

como segunda authority concorrente ao Release/active pointer. Uma projeção de leitura pode exibir release atual, mas authority permanece no módulo owner.

## Relação com findings encaminhados de 3B

### F3B-R1 — repo canônico do produto Conexus

Sem resolução. Trata do repo do próprio produto Conexus antes da implementação, não da semântica `CanonicalSourceRepositoryRef` de Projects gerados.

### F3B-R2 — Plan schema legado

Não é resolvido aqui. Project não adota Mission/Milestone/Feature. 3C-05 Builder deve re-tipar o que for reutilizável para Change/Work Unit, preservando C-017.

### F3B-R3 — Registry scope + kind → authoring root

Parcialmente esclarecido, não encerrado:

- source Project-scoped é autorado no canonical repo do Project;
- Brain continua authoring root Workspace/group-scoped;
- Connector/platform scope continua questão do Registry/Connections.

O mapa completo kind→authoring root permanece para Registry/3E/3F.

### N3 — Planning depth × RigorProfile

Sem resolução. Ambos pertencem ao Builder/3G; Project apenas fornece Baseline/intent authority necessária ao contexto.

### N4 — Architecture Reconciliation

Permanece transversal até C-018.

## Invariantes aprovadas

1. Project é módulo independente no F1.
2. Project owns identity, Workspace scope e structural lifecycle da unidade de software.
3. Project owns a associação ao source repository canônico; não owns Git transport/provider mechanics.
4. Project owns a semântica/authority de Inception que conduz ao Baseline candidate.
5. Project owns qual Project Baseline revision/digest está aprovada.
6. Git contém Baseline content; Git HEAD não muda authority automaticamente.
7. Project owns `ProjectBrainBinding`; Brain owns Brain resource/compilation/health.
8. Project owns `ProjectConnectionBinding`; Connections owns Connection/credential/qualification.
9. Project owns o Project Config Contract como declaração do shape requerido pelo software.
10. Environment-specific resolved material não pertence ao Project module.
11. Project-scoped não significa Project-module-owned.
12. Project não owns Plan/Work Unit/ActorRun internals.
13. Change não é silently reclassified como Project internal; 3C-05 decide sua public Builder boundary.
14. Project não owns Artifact Registry.
15. Project não owns Release/Deployment nem active serving pointer.
16. Project não owns environments nem EnvironmentConformance.
17. Project não owns business data do Project Database.
18. Project não owns Production Agent Runtime.
19. Project não owns Storage/attachments.
20. Project não owns Observability authority.
21. Baseline/binding/config changes não alteram live serving diretamente.
22. Project intent chega ao serving apenas por Release validada/promovida.
23. F1 não terá Project God Object, GenericProjectResource, GenericProjectBinding ou ProjectSettings bag.
24. Archive não é purge.

## Questões deixadas para fases posteriores

- ownership e public surface exatos de Change no Builder (3C-05);
- grafo exato de dependências/cycles (3D);
- tabelas/FKs/uniqueness e forma persistida de Baseline/bindings/config contract (3E);
- signatures/DTOs/error contracts (3F);
- lifecycle/FSM exatos de Project/Inception/Baseline/archive/repository reassociation (3G);
- Actor Pack/Builder consumption do approved Baseline (3H);
- authorization e trust requirements para create/archive/rebind/repository reassociation (3I);
- repository/provider/deployment operational details (3J);
- UI de Inception/Baseline/bindings (3K);
- failure/recovery de operações multi-boundary e archive/purge (3M).

## Consequências para o mapa de módulos

Após 3C-04:

```text
Conexus Hub
│
├── Identity & Access        APROVADO — 3C-02
│
├── Workspace                APROVADO — 3C-03
│   ├── Workspace / Group
│   └── Area
│
├── Project                  APROVADO — 3C-04
│   ├── identity / lifecycle
│   ├── canonical repository association
│   ├── Inception / Baseline authority
│   ├── Brain binding
│   ├── Connection binding(s)
│   └── Config Contract
│
├── Builder                  próxima boundary
├── Artifact Registry        ainda candidato
├── Connections              ainda candidato
├── Capability Gateway       ainda candidato
├── Brain                    ainda candidato
├── Production Agent Runtime ainda candidato
├── Release / Deployment     ainda candidato
├── Observability            ainda candidato
└── Storage                  ainda candidato
```

A próxima decisão natural é **3C-05 — Builder Module Boundary**, incluindo a posição exata de `Change` versus os internals `Plan`/`Work Unit` e a separação entre planejamento proporcional e `RigorProfile`.