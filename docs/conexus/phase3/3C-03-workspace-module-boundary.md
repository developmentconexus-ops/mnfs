# 3C-03 — Workspace Module Boundary

**Status:** APROVADO pelo operador  
**Fase:** 3C — Domain / Module Architecture  
**Importante:** esta decisão não constitui C-018, não encerra 3C e não autoriza implementação.

## Decisão em uma frase

No Conexus F1, **Workspace** é um módulo estrutural estreito do Hub que owns a raiz soberana de tenancy `Workspace/Group`, seu lifecycle/profile intrínseco e a estrutura organizacional `Area`. `Area` não constitui módulo separado. Project, Brain e Connections permanecem módulos independentes embora sejam logicamente scoped pelo Workspace; Identity & Access continua owner de memberships, grants e role assignments. A regra normativa é:

```text
scoped_by(workspace)
!=
implemented_by(WorkspaceModule)
```

O F1 não terá generic `WorkspaceResource` registry, resource-binding engine ou settings bag.

## Contexto e precedência

Esta decisão materializa, sem reabrir, as seguintes autoridades anteriores:

- 3B-01: `Group` é o nome técnico da raiz soberana e `Workspace` é o nome apresentado ao usuário;
- 3B-02: `Project` é unidade independente de software/produto com lifecycle próprio;
- 3B-09: um source repository canônico por Project no F1;
- 3B-10..3B-13: memberships, grants, roles e permissions formam a authorization boundary do Control Plane;
- 3B-11: `Area` é unidade organizacional opcional, nunca software;
- 3B-12: papel organizacional e papel técnico/operacional são independentes;
- 3B-15: recursos de Workspace são reutilizados por bindings explícitos do Project; `Workspace owns resource / Project owns binding`;
- 3B-16: recurso interno durável possui scope explícito/derivável sem criar ownership engine genérico;
- 3B-17: Projects permanecem isolados; reuso ocorre por Platform/scaffold, Workspace Brain e Workspace Connections;
- C-011: Brain é conhecimento compartilhável em scope de grupo/Workspace com binding pinado por Project;
- C-007: Connection é recurso durável com credential lifecycle, revisões e qualificação próprias;
- C-017: nenhuma entidade ou machinery nasce apenas porque outra plataforma possui; precisa de consumidor/failure class atual;
- 3C-01: modular monolith no Hub; boundaries internos não são microservices;
- 3C-02: Identity & Access owns quem pertence/alcança recursos e com qual role; Workspace owns a estrutura, não as relações de acesso.

Nada aqui escolhe tabelas/FKs (3E), signatures/DTOs/HTTP (3F), estados finais de archive/purge (3G/3M) ou implementação física de tenancy/security (3I/3J).

## Pesquisa comparativa usada para desafiar a boundary

A boundary foi confrontada com plataformas de software factory, developer platform e colaboração organizacional. A comparação serve para extrair padrões, não para copiar machinery.

### Harness

Harness usa uma hierarquia explícita de Account → Organization → Project e permite recursos em diferentes scopes. A transferência útil é que **Organization funciona como scope/governance root sem precisar implementar internamente todo recurso que vive naquele scope**.

Referências:

- `https://developer.harness.io/docs/platform/platform-whats-supported/`
- `https://developer.harness.io/docs/platform/role-based-access-control/rbac-in-harness/`

### Factory

Factory expõe settings hierárquicos Org → Project → Folder → User. Policies organizacionais podem influenciar o comportamento dentro de Projects sem transformar o Project em detalhe interno do domínio Organization.

Referência:

- `https://docs.factory.ai/enterprise/hierarchical-settings-and-org-control`

### GitHub

GitHub separa Organization/Teams de Repository. Teams organizam pessoas e recebem acesso a repositories; o repository continua possuindo identidade e lifecycle independentes. A transferência útil é distinguir **estrutura organizacional** de **unidade de software**.

Referência:

- `https://docs.github.com/en/organizations/organizing-members-into-teams/about-teams`

### Sentry

Sentry separa Organization, Teams e Projects; Teams são associados a Projects para conceder acesso. O vínculo não torna Project parte interna de Team.

Referência:

- `https://docs.sentry.io/api/projects/add-a-team-to-a-project/`

### GitLab

GitLab usa Groups como namespaces/estrutura organizacional e Projects como unidades independentes. A transferência útil é a mesma: scope hierárquico e ownership organizacional não exigem um aggregate técnico único.

Referência:

- `https://docs.gitlab.com/user/group/`

### Mitra

O acervo da imersão mostra uma distinção observável `workspace → project`, inclusive no layout `/w-{ws}/p-{proj}/`, enquanto Git, database, sandbox e artefatos permanecem fortemente project-scoped. Não existe Evidence suficiente para afirmar a modularização proprietária interna da Mitra; a referência é usada apenas como forma observável.

Referências internas:

- `docs/reference/mitra/00-OVERVIEW.md`
- `docs/research/MITRA-INSPIRATION-MAP.md`

## Alternativas avaliadas

### Alternativa A — Workspace estrutural estreito + módulos especializados separados

```text
Workspace
├── Workspace / Group
└── Area

Identity & Access       módulo separado
Project                 módulo separado
Brain                   módulo separado
Connections             módulo separado
```

**Decisão:** ADOTADA para F1.

Benefícios atuais:

- preserva uma raiz de tenancy clara;
- mantém `Area` junto da estrutura que ela descreve;
- evita transformar Workspace em god-module;
- permite Brain/Connections/Project evoluírem por seus próprios consumers/lifecycles;
- mantém memberships/grants numa única access boundary já aprovada em 3C-02;
- não cria registry/settings framework para recursos apenas porque compartilham `workspaceId`.

### Alternativa B — Workspace como aggregate de tudo que é Workspace-scoped

Exemplo rejeitado:

```text
Workspace
├── Areas
├── Projects
├── Brain
├── Connections
├── memberships
├── grants
└── settings
```

**Decisão:** REJECT para F1.

O modelo confunde scope lógico com responsabilidade de módulo. Brain, Connections e Project já possuem semântica própria, consumers próprios e lifecycle suficiente para boundaries independentes. Memberships/grants já pertencem a Identity & Access.

### Alternativa C — fundir Workspace com Identity & Access

**Decisão:** REJECT.

A fusão confundiria duas perguntas diferentes:

```text
Workspace
→ qual estrutura organizacional/tenant existe?

Identity & Access
→ quem pertence/alcança essa estrutura e com qual authority?
```

A distinção foi deliberadamente congelada em 3C-02.

### Alternativa D — fundir Workspace com Project

**Decisão:** REJECT.

`Workspace` é root organizacional/tenancy; `Project` é unidade independente de software. Um Workspace pode existir sem Project e pode ter múltiplos Projects com lifecycle/release/data independentes.

## Responsabilidade do módulo

Workspace responde à pergunta:

> **Qual é o domínio soberano de tenancy e qual é sua estrutura organizacional?**

Forma conceitual:

```text
Workspace / Group
│
├── identity
├── intrinsic profile
├── structural lifecycle
│
└── Areas
    ├── Comercial
    ├── Compras
    ├── Logística
    └── ...
```

A responsabilidade termina antes do lifecycle dos recursos especializados scoped pelo Workspace.

## Ownership detalhado

### Workspace owns — `Workspace / Group`

O módulo owns semanticamente:

```text
Workspace identity
Workspace structural lifecycle
Workspace intrinsic profile/metadata
```

`Group` continua sendo o nome técnico da raiz soberana; `Workspace` continua sendo o termo de produto apresentado ao usuário.

Os campos persistidos, constraints e FKs finais pertencem a 3E.

### O que significa profile/metadata intrínseco

Somente informação inerente à própria identidade/apresentação do Workspace pertence aqui.

Exemplos conceituais admissíveis:

```text
nome
identidade visual simples
status/lifecycle estrutural
```

Isso **não** autoriza um `WorkspaceSettings` genérico para configurações de outros domínios.

Regra:

> Uma configuração pertence ao módulo cuja decisão ela altera.

Exemplos:

```text
Brain configuration        → Brain
Connection configuration   → Connections
Builder policy             → Builder
Release configuration      → Release / Deployment
security/effect policy     → módulo owner da policy
```

### Workspace owns — `Area`

`Area` pertence ao mesmo módulo porque é uma estrutura organizacional dependente do Workspace, não uma unidade independente de software.

`Area`:

- só existe dentro de um Workspace;
- não possui source repository;
- não possui Project Database;
- não possui release;
- não possui artifact registry próprio;
- não possui runtime próprio;
- não possui lifecycle de software independente;
- não owns Projects;
- pode ser reorganizada sem alterar a identidade/lifecycle dos Projects.

Logo:

```text
Workspace module
└── Area
```

é suficiente.

Criar `AreaModule` separado no F1 não eliminaria machinery nem atenderia consumer independente.

## Scope lógico versus module ownership

Esta é a invariante central da decisão:

```text
scoped_by(workspace)
!=
implemented_by(WorkspaceModule)
```

Um recurso pode possuir `workspaceId`, ser isolado por Workspace e ainda assim pertencer a outro módulo.

Exemplos:

```text
Brain
→ Workspace-scoped
→ Brain module

Connection
→ Workspace-scoped
→ Connections module

Project
→ Workspace-scoped
→ Project module
```

Workspace scope define **a que raiz soberana o recurso pertence**. O módulo especializado define **o comportamento, lifecycle e authority próprios do recurso**.

## O que Workspace explicitamente NÃO owns

### Não owns Accounts, memberships, grants ou role assignments

Pertencem a Identity & Access:

```text
Account
WorkspaceMembership
AreaMembership
Area → Project grant
Account → Project grant
role assignments
effective access resolution
```

A divisão é:

```text
Workspace
→ WHAT organizational structure exists

Identity & Access
→ WHO belongs/reaches it and with which role
```

### Não owns Project

Apesar da hierarquia lógica:

```text
Workspace
└── Project
```

Project terá boundary própria.

Workspace não mantém uma segunda coleção mutável autoritativa de Projects como fonte concorrente.

A intenção para 3E é preservar uma única associação canônica/derivável entre Project e Workspace, sem duplicar authority em:

```text
Workspace.projects[]
+
Project.workspaceId
```

A forma física final fica para 3E.

Listagens do tipo “Projects deste Workspace” podem ser projeções/queries derivadas da relação canônica, não outra authority.

### Não owns Brain

Brain é Workspace-scoped, mas possui semântica própria:

```text
BrainDefinition
Brain revision/publication
BrainPack compilation
health/drift
KnowledgeProposal
ProjectBrainBinding
```

O módulo Workspace não compila BrainPack, não resolve metrics/caveats e não promove revisions do Brain.

3B-15 permanece:

```text
Workspace Brain
      │
      │ pinned revision / digest
      ▼
ProjectBrainBinding
```

Nova revision publicada no Workspace não produz live inheritance automática nos Projects.

### Não owns Connections

Connection é Workspace-scoped, mas possui semântica própria:

```text
external-system identity
auth shape
credential lifecycle
revision
qualification/testConnection
health
environment binding
```

Workspace não lê/guarda secrets apenas porque a Connection pertence ao mesmo Workspace.

3B-15 permanece:

```text
Workspace Connection
        │
        ▼
ProjectConnectionBinding
```

Um Project só usa uma Connection por binding explícito.

### Não owns Builder/Change

Change, Plan, Work Unit e ActorRun pertencem à boundary Builder/Project que 3C ainda detalhará.

Workspace não vira container operacional de execução agentic.

### Não owns Release/Deployment

O fato de Releases ocorrerem em Projects do Workspace não transforma Workspace em authority de release.

### Não owns business data

Project business databases continuam fora do módulo Workspace. `hub_control` pode armazenar a identidade/estado operacional do Workspace, mas Workspace não vira database de negócio dos Projects.

## Não criar generic Workspace Resource Registry

F1 não terá:

```text
WorkspaceResource
WorkspaceResourceType
WorkspaceResourceRegistry
WorkspaceOwnedResource
GenericWorkspacePackage
```

nem APIs equivalentes a:

```text
registerWorkspaceResource(type, id)
listAllWorkspaceResources()
attachResourceToWorkspace(...)
```

Os resources reais já são tipados e possuem owners claros.

A existência de vários tipos de resource no mesmo scope não é consumer suficiente para criar uma abstração universal.

## Não criar resource-binding engine genérico

3B-15 já congelou bindings concretos:

```text
ProjectBrainBinding
ProjectConnectionBinding
```

F1 não terá:

```text
GenericResourceBinding
bind(resourceType, resourceId, projectId)
WorkspaceBindingEngine
```

Cada binding preserva as invariantes do recurso específico.

## Não criar settings bag

Também é proibido usar Workspace como gaveta de configuração transversal:

```text
WorkspaceSettings {
  arbitrary_json: ...
}
```

ou equivalentes que acumulem configuração de Brain, Builder, Connection, Release, Security, sandbox ou UI sem ownership explícito.

Configuração transversal real deve ser atribuída ao módulo owner ou receber decisão própria quando surgir consumer material.

## Public internal API sem congelar 3F

3C congela apenas capacidades semânticas. Signatures TypeScript, DTOs, error taxonomy e HTTP pertencem a 3F.

A public internal API deve suportar semanticamente operações equivalentes a:

```text
createWorkspace
readWorkspace
updateWorkspaceProfile
changeWorkspaceLifecycle

createArea
readArea
listAreas
updateArea
retireArea
```

Os nomes são descritivos, não signatures congeladas.

### O que não pertence à API pública do módulo

```text
manageWorkspaceMembership
manageAreaMembership
manageProjectGrant
```

→ Identity & Access.

```text
createProject / project lifecycle
```

→ Project.

```text
publishBrain / compileBrain
```

→ Brain.

```text
createConnection / rotateCredential / testConnection
```

→ Connections.

```text
bindAnyResourceToProject
registerWorkspaceResource
getAllWorkspaceSettings
```

→ não construir no F1.

## Consumers

Consumers naturais incluem, conforme suas operações reais:

```text
Identity & Access
Project
Brain
Connections
Control Plane application layer/UI
```

A existência de consumer não concede importação de internals.

## Allowed dependencies — intenção de 3C

O grafo exato será fechado em 3D. Neste nível:

- Workspace pode depender apenas de primitivas técnicas comuns estritamente necessárias;
- Workspace não precisa importar internals de Identity & Access para existir;
- Workspace não precisa importar internals de Project, Brain ou Connections para representar a raiz/Area;
- módulos scoped pelo Workspace podem referenciar `WorkspaceId` estável/opaque sem depender de internals do Workspace;
- operações multi-boundary podem ser coordenadas pela application layer sem criar cycles artificiais entre módulos.

## Forbidden dependencies

Workspace não pode depender dos internals de:

```text
Identity & Access
Project
Builder
Artifact Registry
Connections
Capability Gateway
Brain
Production Agent Runtime
Release / Deployment
Observability
Storage
Project business database
```

salvo future Finding material e decisão explícita.

Em especial:

```text
Workspace
-X-> Connection secrets
-X-> Brain compiled internals
-X-> Project database
-X-> Builder state
-X-> Release state as its own authority
-X-> Observability logs to decide Workspace truth
```

## Interactions relevantes

3C identifica interactions sem congelar event bus ou schemas.

### Workspace criado

```text
Workspace created
→ a raiz passa a poder receber Project/Brain/Connection resources
```

A criação desses recursos continua sob os módulos owners correspondentes.

### Area criada/renomeada/retirada

```text
Area structural change
→ Workspace structure changes
→ Identity & Access relationships referencing Area must respect current Area state
```

A mecânica de consistência/transação será decidida em 3D/3E/3G.

### Workspace arquivado/desabilitado

Conceitualmente:

```text
Workspace no longer active
→ scoped operations must not continue as if the root were active
```

Os estados exatos, cascades, recovery e retention não são decididos aqui.

### Retirada de Area não apaga recursos técnicos

```text
Area retired/deleted
-X-> delete Project
-X-> delete Brain
-X-> delete Connection
-X-> delete Project database
```

Isso preserva 3B-11 e 3B-16.

## Authority boundary

A frase normativa é:

> **Workspace é autoridade sobre a existência, identidade e estrutura organizacional da raiz de tenancy (`Workspace/Group` e `Area`). Ele não é autoridade sobre quem possui acesso, sobre o lifecycle dos Projects nem sobre o conteúdo/lifecycle de recursos especializados apenas porque estes são Workspace-scoped.**

Consequência:

```text
Workspace exists
!=
principal authorized
```

E:

```text
resource.workspaceId == W
!=
WorkspaceModule owns resource behavior
```

## Por que Workspace merece existir como módulo separado

Workspace é uma authority root compartilhada por vários domínios:

```text
Workspace
├── Projects
├── Brain
├── Connections
├── Areas
└── access relationships
```

Mas nenhum desses recursos deveria own a raiz.

Se Workspace fosse parte de Project:

- Brain/Connections não teriam raiz independente antes/fora de um Project;
- um Workspace vazio seria difícil de representar sem software criado.

Se Workspace fosse parte de Identity & Access:

- estrutura organizacional passaria a depender conceitualmente da resolução de acesso;
- identidade do tenant e relação de acesso ficariam acopladas novamente.

Se todos os recursos fossem implementados dentro de Workspace:

- surgiria um tenant god-module;
- módulos com lifecycle real independente perderiam boundaries claras.

Portanto existe consumer atual suficiente para o módulo, mas não para fazê-lo grande.

## Gatilhos de reavaliação

A boundary deve ser reavaliada somente se Evidence futura mostrar consumer/lifecycle material novo, por exemplo:

- `Area` passa a possuir regras, lifecycle ou recursos próprios além de agrupamento organizacional;
- surge hierarquia organizacional aninhada real com comportamento próprio que não cabe mais em `Area` simples;
- Workspace-level policies tornam-se um domínio complexo com lifecycle/versioning próprio e múltiplos consumers reais;
- cross-Workspace sharing deixa de ser exceção e exige uma capability própria;
- recursos Workspace-scoped ganham um contrato comum real que elimina mais machinery do que introduz.

Nenhum desses gatilhos autoriza antecipar a abstração agora.

## Não construir no F1

- `AreaModule` separado;
- `WorkspaceResource` / `WorkspaceOwnedResource` genérico;
- Workspace resource registry;
- generic resource-binding engine;
- settings bag arbitrário;
- policy engine dentro de Workspace;
- nested Areas;
- cross-Workspace sharing framework;
- Workspace-level workflow engine;
- segunda autoridade `Workspace.projects[]` concorrendo com a relação canônica do Project;
- lifecycle de Brain/Connection/Project dentro do Workspace module.

## Invariantes aprovadas

1. `Workspace/Group` é a raiz soberana de tenancy.
2. `Workspace` é o termo de produto; `Group` permanece nome técnico quando aplicável.
3. Workspace module é estrutural e estreito.
4. Workspace owns `Workspace/Group` e `Area`.
5. `Area` não é módulo separado no F1.
6. Identity & Access owns memberships, grants e role assignments.
7. Project permanece módulo/lifecycle independente.
8. Brain permanece módulo/lifecycle independente e Workspace-scoped.
9. Connections permanece módulo/lifecycle independente e Workspace-scoped.
10. `scoped_by(workspace) != implemented_by(WorkspaceModule)`.
11. `workspaceId` não cria module ownership por si só.
12. Workspace não mantém segunda lista autoritativa de Projects.
13. Workspace não owns Project business data.
14. Workspace não owns Connection credentials.
15. Workspace não owns Brain compilation/health/proposals.
16. Bindings de Brain e Connection continuam tipados e explícitos.
17. Não existe generic Workspace Resource Registry no F1.
18. Não existe generic resource-binding engine no F1.
19. Não existe Workspace settings bag transversal.
20. Configuração pertence ao módulo cuja decisão altera.
21. Retirar Area não apaga Projects/Brain/Connections.
22. Consumer multi-boundary não implica dependency cycle; application orchestration pode coordenar operações.

## Questões deixadas para fases posteriores

- tabelas/FKs/indexes e constraint física da relação Project → Workspace (3E);
- signatures/DTOs/error contracts das APIs internas (3F);
- lifecycle exato de Workspace/Area, archive/restore/purge e cascades permitidas (3G/3M);
- transaction boundaries de criação/retirada multi-módulo (3D/3E/3G);
- security enforcement físico de cross-Workspace deny (3I);
- backup/export/fork/clone e retention (3J/3M);
- UI final de Workspace/Area (3K);
- eventual Workspace-level policy domain somente sob consumidor real.

## Consequências para o mapa de módulos

Após 3C-03:

```text
Conexus Hub
│
├── Identity & Access       APROVADO — 3C-02
│   ├── Identity / Authentication
│   └── Access / Authorization Context
│
├── Workspace               APROVADO — 3C-03
│   ├── Workspace / Group
│   └── Area
│
├── Project                 ainda candidato
├── Builder                 ainda candidato
├── Artifact Registry       ainda candidato
├── Connections             ainda candidato
├── Capability Gateway      ainda candidato
├── Brain                   ainda candidato
├── Production Agent Runtime ainda candidato
├── Release / Deployment    ainda candidato
├── Observability           ainda candidato
└── Storage                 ainda candidato
```

A próxima boundary natural para avaliação é **Project**, sem presumir que toda semântica Project-scoped pertença ao Project module.
