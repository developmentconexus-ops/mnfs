# Fase 3 — Architecture & System Design

**Status:** EM ANDAMENTO — ledger de decisões aprovadas pelo operador  
**Base canônica:** `354f44219fb5970bb9233976773db90d2102ae7a`  
**Início:** 2026-08-12  
**Autoridade anterior:** C-000..C-017  
**Importante:** este documento ainda **não** constitui C-018, não encerra a Fase 3 e não autoriza implementação.

## 1. Propósito

A Fase 3 transforma as decisões fundacionais C-000..C-017 em uma arquitetura e um System Design implementáveis. Ela deve eliminar decisões arquiteturais escondidas da futura implementação, sem tentar prescrever cada função privada ou criar abstrações genéricas para futuros imaginários.

O desenho será desenvolvido em níveis:

```text
3A  Architecture Reconciliation
3B  System Context & Boundaries
3C  Domain / Module Architecture
3D  Dependency Architecture
3E  Data Architecture
3F  Contracts & API Architecture
3G  Behavioral / State Architecture
3H  Runtime & Agent Architecture
3I  Security / Authority Architecture
3J  Deployment / Operations Architecture
3K  Frontend / Product Architecture
3L  Technology Qualification
3M  Failure & Recovery Architecture
3N  Architecture Verification
3O  Vertical Architecture Proof Contract
```

## 2. Regra documental

Este arquivo é o ledger vivo da Fase 3 até que a Architecture Synthesis final seja ratificada.

- Cada decisão recebe ID estável, status, decisão, consequências e questões deixadas abertas.
- IDs nunca são reutilizados.
- `DRAFT` não é autoridade aprovada.
- Após aprovação explícita do operador, a decisão passa para `APROVADO` e deve ser commitada.
- Emendas posteriores registram claramente a decisão afetada; não dependem de memória da conversa.
- A partir de 3B-14, a expectativa normal é **um commit incremental por decisão aprovada**.
- As decisões 3B-01..3B-13 foram materializadas juntas neste primeiro commit de recuperação documental.

## 3. Princípios transversais já aplicáveis

1. **Liberdade tática, autoridade mecânica:** LLMs interpretam, investigam e propõem; o Hub controla identidade, autoridade, boundaries, budgets, gates, Evidence e estados terminais.
2. **Proporcionalidade:** mudanças simples não recebem cerimônia desnecessária; risco detectável nunca é reduzido pela autodeclaração do agente.
3. **Replaceability por isolamento:** componentes substituíveis ficam atrás de boundaries pequenos; não se cria framework universal antes de existir segundo consumidor real.
4. **Git e Postgres respondem perguntas diferentes:** Git contém conteúdo versionado; o Hub/Postgres governa autoridade e lifecycle operacional.
5. **Ausência de relação significa deny:** nenhum acesso é inferido apenas porque duas coisas pertencem à mesma Account ou ao mesmo Workspace.
6. **Control Plane e app publicado são superfícies distintas:** autorização para construir/administrar um Project não implica automaticamente autorização para usar o aplicativo publicado.

---

# 4. Decisões 3B — System Context & Boundaries

## 3B-01 — Workspace como raiz soberana

**Status:** APROVADO

`Group` é o nome técnico da raiz soberana de tenancy; **Workspace** é o nome apresentado ao usuário.

Um Workspace representa um domínio isolado de conhecimento, recursos, dados e Projects. Pode representar uma empresa, iniciativa pessoal, laboratório ou cliente.

```text
Account: Leandro
├── Workspace: Metal Nobre
└── Workspace: Aurora
```

Consequências:

- uma Account pode participar de vários Workspaces;
- membership comum não cria comunicação entre Workspaces;
- Brain, Connections, dados, permissões e Projects são isolados por Workspace;
- cross-Workspace é deny-by-default;
- qualquer compartilhamento futuro deve ser explícito, versionado e autorizado.

## 3B-02 — Project como unidade independente de software

**Status:** APROVADO

`Project` é a unidade independente de software/produto dentro de um Workspace, com lifecycle próprio.

Um Project pode conter várias superfícies do mesmo produto:

```text
Project
├── frontend
├── backend
├── artifacts
├── production agents
├── jobs
└── integrations
```

Essas superfícies não viram Projects separados apenas por serem tecnicamente distintas. Um novo Project nasce quando precisa de evolução, releases, dados ou lifecycle independentes.

## 3B-03 — Change como unidade verificável de evolução

**Status:** APROVADO

`Change` é uma unidade limitada, verificável e aprovável de evolução de um Project. É usada tanto durante a construção inicial quanto na manutenção posterior.

Um Change descreve **o que deve passar a ser verdade**, não as tarefas técnicas para realizá-lo.

```text
Project
  ↓
Change
  ├── intenção
  ├── contexto
  ├── escopo
  ├── constraints
  ├── expected effects
  └── correctness assertions COR-*
```

- `COR-*` descreve verdade verificável;
- `Work Unit` descreve trabalho;
- `ActorRun` é uma tentativa concreta de executar uma Work Unit;
- um Change pode terminar com implementação, bloqueio, rejeição ou `NO_CHANGE_REQUIRED`;
- criar o container Project não é um Change.

## 3B-04 — Builder substituível por isolamento

**Status:** APROVADO

A semântica durável de evolução do Project é separada da estratégia concreta do Builder.

No F1:

```text
Change → Plan → Work Unit → ActorRun
```

No futuro, a estratégia poderia ser substituída ou envolvida por outra forma, como Mission/Milestone/Feature, sem exigir reconstrução dos demais domínios.

A proteção vem de isolamento, não de abstração antecipada:

- `Plan`, `Work Unit` e detalhes de decomposição são internos ao Builder;
- outros módulos não dependem diretamente dessas estruturas;
- não haverá workflow DSL, plugin registry, graph engine genérico ou `UniversalWorkflowEngine` no F1.

## 3B-05 — Project Inception / Discovery

**Status:** APROVADO

Um Project greenfield é criado primeiro como container vazio dentro do Workspace. Antes do primeiro Change, passa por Inception/Discovery.

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

A Inception pode:

- compreender objetivo, usuários, problema e restrições;
- pesquisar referências e tecnologias quando necessário;
- identificar integrações e sistemas externos;
- realizar discovery de dados reais quando aplicável;
- registrar assumptions, riscos e limitações;
- propor escopo e primeira estrutura do produto.

O workflow pertence ao Hub. Pi ou outro runtime executa papéis dentro do contexto, tools e authority concedidos pelo Hub. Inception não é Change nem exige entidade Mission.

Para brownfield, o processo inclui leitura da codebase, arquitetura, contratos e estado real existentes.

## 3B-06 — Aprovação humana do Project Baseline

**Status:** APROVADO

O Project Baseline exige aprovação humana explícita antes de o Conexus iniciar a construção inicial.

O sistema pode investigar, pesquisar, estruturar e propor; não transforma o Baseline candidate em Changes executáveis sem o checkpoint: **“é isto que vamos construir”**.

## 3B-07 — Planejamento proporcional

**Status:** APROVADO

O Conexus não impõe o mesmo workflow a todo Change.

A profundidade de planejamento e o rigor de execução são eixos distintos:

```text
Planning depth
DIRECT | LIGHT | FULL
```

```text
Execution rigor
FAST | BOUNDED | CONTROLLED
```

As labels acima são conceitos de design; sua forma técnica final será qualificada posteriormente.

Regras:

- a LLM interpreta intenção, contexto e impacto e recomenda profundidade;
- o Hub aplica pisos determinísticos de planejamento e risco;
- mudanças simples podem seguir sem plano separado;
- mudanças materiais exigem discovery e/ou plano proporcional;
- sinais como migration, auth, permission, dependency, credential, DML ou external effect elevam o rigor;
- o diff real pode elevar a classificação antes do fechamento;
- dúvida/indeterminação nunca produz o menor rigor;
- o roteamento será qualificado por eval com Changes representativos antes de sua realização ser congelada.

## 3B-08 — Project Baseline em Git + autoridade no Hub

**Status:** APROVADO

O Project Baseline é a especificação versionada do estado intencional do Project.

- o conteúdo legível vive no source repository Git do Project;
- o Hub registra qual revisão/digest está aprovada;
- Actors e Changes recebem a revisão aprovada pinada;
- edição posterior no Git não muda automaticamente a autoridade ativa;
- mudança local não exige nova revisão do Baseline;
- mudança semanticamente material pode propor nova revisão e novo checkpoint.

Git responde **qual é o conteúdo**. O Hub responde **qual revisão está autorizada**.

## 3B-09 — Um source repository canônico por Project no F1

**Status:** APROVADO

No F1, cada Project possui exatamente um source repository Git canônico.

- greenfield: o Project nasce com repositório novo criado ou associado;
- brownfield: um repositório existente é conectado e passa por discovery;
- um repo pode conter várias superfícies do produto;
- multi-repo por Project fica adiado até existir consumidor concreto.

O Brain de Workspace permanece um recurso acima dos Projects e não obriga multi-repo no Project.

## 3B-10 — ReBAC limitado entre Workspace, Area, Account e Project

**Status:** APROVADO

O acesso ao Control Plane usa um modelo ReBAC limitado e explícito.

```text
Account → Workspace
Account → Area
Area → Project grant
Account → Project grant
```

Regras:

- `WORKSPACE_OWNER` herda acesso administrativo a todos os Projects do Workspace;
- `WORKSPACE_ADMIN` administra membros, Areas e grants, mas não acessa conteúdo de Projects sem grant explícito;
- `WORKSPACE_MEMBER` não recebe Projects automaticamente;
- grants diretos e grants por Area são aditivos;
- o maior papel efetivo prevalece;
- ausência de relação válida resulta em deny;
- F1 não terá engine FGA externa, custom roles, deny explícito, Areas aninhadas ou sharing cross-Workspace.

A realização inicial deve preferir tabelas PostgreSQL explícitas e um único `AuthorizationService`, preservando uma boundary para eventual substituição futura sem introduzir engine genérica agora.

## 3B-11 — Area organizacional opcional

**Status:** APROVADO

`Area` é uma unidade organizacional opcional e configurável dentro do Workspace. Representa agrupamentos de pessoas como Comercial, Compras, Logística ou Engenharia — nunca software.

```text
Workspace: Metal Nobre
├── Area Comercial
├── Area Compras
├── Area Logística
└── Projects
    ├── Análise de Vendedores
    ├── Análise de Compras
    └── Marketplace Central
```

- cada Workspace possui zero ou várias Areas;
- o Workspace pessoal Aurora pode não possuir nenhuma;
- uma Account pode participar de várias Areas;
- um Project pode receber grants de zero, uma ou várias Areas;
- Project não possui `area_id` obrigatório;
- Area não possui source, dados, releases nem lifecycle do Project;
- reorganizar ou excluir uma Area não exclui Projects;
- `Team` não será entidade paralela no F1.

## 3B-12 — Papéis de Area e Project são independentes

**Status:** APROVADO

Papel organizacional na Area não implica papel técnico/operacional no Project.

```text
Oscar
└── AREA_ADMIN na Area Comercial

Area Comercial
└── PROJECT_MEMBER no CRM

Resultado:
Oscar é PROJECT_MEMBER no CRM, não PROJECT_ADMIN.
```

O papel obtido no Project por meio de uma Area é determinado pelo grant `Area → Project`. Um grant direto `Account → Project` pode elevar o papel efetivo.

Administrar pessoas e estrutura organizacional não é o mesmo que administrar software, releases ou bindings técnicos.

## 3B-13 — ReBAC + roles + permissions + policies

**Status:** APROVADO

A autorização do Control Plane combina quatro camadas:

```text
Relationship
→ Role
→ Permission
→ Policy / Precondition
```

1. **Relationship/ReBAC:** determina onde a Account alcança o recurso.
2. **Role:** pacote fechado e administrável de permissions.
3. **Permission:** ação atômica efetivamente autorizada.
4. **Policy/Precondition:** determina se a ação pode acontecer naquele contexto e estado.

Roles fechadas de Project no F1:

```text
PROJECT_VIEWER
PROJECT_CONTRIBUTOR
PROJECT_ADMIN
```

Essas roles são bundles versionados; não são a autoridade final espalhada em `if role == ...`.

Exemplos conceituais de permissions — catálogo ainda não congelado:

```text
project.read
change.create
builder.dispatch
preview.review
release.approve
release.promote
project.access.manage
```

Regras:

- backend autoriza por permission efetiva;
- frontend usa effective permissions para presentation policy, nunca como segurança suficiente;
- possuir permission não ignora gates, approvals ou preconditions do domínio;
- `WORKSPACE_OWNER` herda o pacote administrativo dos Projects, mas não bypassa invariantes da plataforma;
- F1 não terá custom roles, permission builder nem grants individuais de permissions;
- a matriz concreta será derivada das operações reais durante Identity & Access Design;
- avaliar renomear `ViewerContext.capabilities` para `effectivePermissions`, evitando colisão com outros usos arquiteturais de “capability”.

## 3B-14 — Separação entre Control Plane, Preview e aplicativo publicado

**Status:** APROVADO

### Decisão

O Conexus utiliza uma única identidade global `Account` e uma sessão central do Hub, mas mantém **três contextos de autorização independentes**:

```text
Account
  │
  │ autenticação central
  │
  ├── CONTROL_PLANE
  ├── PREVIEW
  └── PUBLISHED_APP
```

A Account responde **quem é a pessoa**. Cada superfície responde, independentemente, **o que essa Account pode fazer naquele recurso e naquele contexto**.

```text
                     Account
                        │
             sessão opaca do Hub
                        │
          ┌─────────────┼─────────────┐
          │             │             │
          ▼             ▼             ▼
   Control Plane     RunPreview    Published App
   Authorization   Authorization   Authorization
```

Nenhuma role ou permission é transferida implicitamente entre essas superfícies.

### Control Plane

A autorização do Control Plane é a já definida por 3B-10..3B-13:

```text
Account
  ├── WorkspaceMembership
  ├── AreaMembership
  ├── Area → Project grant
  └── Account → Project grant
          │
          ▼
PROJECT_VIEWER
PROJECT_CONTRIBUTOR
PROJECT_ADMIN
          │
          ▼
effective control-plane permissions
```

Ela governa, conforme a matriz de permissions que será detalhada posteriormente:

- visibilidade do Project no Conexus;
- leitura e alteração do Project Baseline;
- criação e evolução de Changes;
- dispatch e acompanhamento do Builder;
- acesso a Plans, ActorRuns, Findings e Evidence;
- revisão de previews;
- configuração de bindings e policies;
- aprovação e promoção de Releases;
- administração de acesso ao Project e, quando autorizado, ao app publicado.

Ter acesso ao Control Plane **não concede automaticamente acesso aos dados ou capabilities empresariais do aplicativo publicado**.

### Aplicativo publicado

O aplicativo publicado possui seu próprio domínio de grants, roles/profiles, permissions e audience/data scope:

```text
Account
  ├── grant direto para o app
  └── Area → app grant
          │
          ▼
   published-app role/profile
          │
          ▼
   effective app permissions
```

Exemplos ilustrativos, ainda não congelados:

```text
orders.view
orders.approve
products.view
price.simulate
shipment.update
agent.use
```

Essas permissions governam capacidades de negócio do runtime. Elas não concedem acesso a source, Changes, Plans, ActorRuns, Findings, configurações técnicas ou Releases do Project.

A forma final de `PublishedApp`, `AppMembership`, roles de app e audience será detalhada em Identity & Access Design e Runtime Architecture. Esta decisão congela a separação de autoridade, não nomes de tabelas ou APIs.

### Preview

`RunPreview` pertence ao lifecycle de construção e é acessado por permissions do Control Plane, como uma futura `preview.review`.

```text
Project Control Grant
        │
        │ preview.review
        ▼
    RunPreview
        ├── candidate digest pinado
        ├── ambiente de preview
        ├── identidade de revisão
        └── dados sintéticos ou controlados
```

Preview não reutiliza silenciosamente:

- app membership de produção;
- credenciais de produção;
- dados de produção;
- audience de produção;
- permissões empresariais do usuário final.

Quando a validação exigir comportamento por perfil, o Hub fornece identidades e fixtures de preview explicitamente limitadas e auditáveis.

### Exemplos normativos

#### Funcionário operacional sem acesso ao Builder

```text
Oscar
├── Area Comercial
├── app grant no Marketplace Central
└── nenhum Project Control Grant

Resultado:
- usa o aplicativo publicado;
- consulta e executa apenas as capabilities permitidas;
- não vê source, Changes, ActorRuns, Findings ou Releases.
```

#### Construtor sem acesso a dados empresariais de produção

```text
Carlos
├── PROJECT_CONTRIBUTOR no Marketplace Central
└── nenhum published-app grant

Resultado:
- trabalha na evolução do software;
- revisa o RunPreview permitido;
- não recebe acesso implícito ao app em produção nem aos dados reais.
```

#### Owner do Workspace

```text
Leandro
└── WORKSPACE_OWNER
    └── PROJECT_ADMIN em todos os Projects por herança
```

O owner pode administrar o acesso dos apps, mas não herda automaticamente todas as app permissions e todos os dados empresariais.

Caso precise utilizar o app, pode conceder a si mesmo uma role de app no F1. Esse self-grant deve ser explícito, auditado, revogável e visível. Separação de deveres que proíba self-grant ou exija segunda aprovação fica condicionada a risco/compliance real futuro.

#### Area com relações independentes

```text
Area Comercial
├── PROJECT_VIEWER no Control Plane do Marketplace Central
└── APP_ROLE_VENDEDOR no app publicado
```

As duas relações podem coexistir, mas uma não cria a outra.

Outra Area pode possuir apenas uma delas:

```text
Area Tecnologia
├── PROJECT_CONTRIBUTOR no Control Plane
└── nenhum app grant de produção
```

### Administrar acesso não significa exercer o acesso

A plataforma preserva explicitamente:

```text
app_access.manage
≠
app.use
```

Uma Account com autoridade administrativa pode conceder, remover, revisar e auditar memberships/roles do app sem possuir automaticamente permissions de negócio como leitura financeira, aprovação de pedidos ou execução de efeitos.

Da mesma forma:

```text
PROJECT_ADMIN
≠
APP_ADMIN ou APP_USER
```

E:

```text
APP_ADMIN ou APP_USER
≠
PROJECT_VIEWER
```

### Conta de usuário final sem membership organizacional

O modelo permite futuramente uma Account acessar um app sem possuir `WorkspaceMembership` ou acesso ao Control Plane, por exemplo em um portal externo.

```text
Account: Cliente externo
├── Published App Grant
├── sem WorkspaceMembership
└── sem Project Control Grant
```

Isso é uma propriedade do modelo, não autorização para self-signup ou usuários públicos no F1. Provisionamento externo, convite, self-signup, SSO e SCIM permanecem sujeitos às decisões e gatilhos posteriores.

### Resolução de autorização por request

Uma única sessão identifica a Account. O Hub resolve a autorização conforme a rota e o serving context:

```text
Browser
  │
  │ cookie opaco
  ▼
Hub
  ├── rota do Control Plane
  │     → resolve ControlPlaneAuthorization
  │
  ├── rota de Preview
  │     → resolve PreviewAuthorization
  │
  └── rota do app publicado
        → resolve PublishedAppAuthorization
```

Sequência conceitual:

```text
1. validar sessão e status da Account;
2. derivar server-side a superfície e o recurso;
3. resolver relações e effective permissions daquela superfície;
4. aplicar policy e preconditions do domínio;
5. autorizar ou negar;
6. registrar superfície, recurso e decisão para auditoria.
```

Workspace, Project, app e deployment são derivados pelo Hub a partir da rota, do host e do serving context. Eles nunca são confiados ao payload enviado pelo browser como fronteira de autorização.

A sessão não precisa carregar um snapshot gigantesco com todos os Workspaces, Areas, Projects, apps, roles e permissions. A autoridade efetiva é resolvida server-side no contexto da request.

### Contextos de visualização

A arquitetura deverá manter projeções distintas, conceitualmente:

```text
ControlPlaneViewerContext
├── account
├── activeWorkspace
├── workspaceRole
├── areaRelations
├── projectRole
└── effectivePermissions
```

```text
AppViewerContext
├── account
├── app/runtime surface
├── deployment
├── appRole/profile
├── effectivePermissions
└── audience/dataScope
```

Os nomes finais ainda não estão congelados. A invariante é que roles e permissions de uma superfície não sejam usadas como autoridade da outra.

### Invariantes

1. **Uma identidade:** uma pessoa possui uma única Account central no Hub.
2. **Autorizações independentes:** Control Plane, Preview e Published App são contextos distintos.
3. **Sem herança implícita entre superfícies:** `PROJECT_ADMIN` não implica app role e app role não implica acesso ao Project.
4. **Administrar não implica usar:** `app_access.manage` não concede `app.use` nem permissions empresariais.
5. **Owner não herda dados do app:** `WORKSPACE_OWNER` administra Projects e grants, mas não recebe automaticamente todas as app permissions.
6. **Grants de Area são separados:** `Area → Project Control Role` e `Area → Published App Role` são relações independentes.
7. **Preview pertence ao Control Plane:** revisão de candidate usa ambiente e identidade de preview, não membership de produção.
8. **Disable revoga ambos:** desabilitar uma Account encerra sua autoridade em todas as superfícies.
9. **Recurso derivado server-side:** IDs recebidos do cliente nunca definem sozinhos o boundary de autorização.
10. **Auditoria identifica a superfície:** decisões de acesso distinguem `CONTROL_PLANE`, `PREVIEW` e `PUBLISHED_APP`.
11. **Policy continua aplicável:** possuir permission nunca bypassa approval, budget, effect gate, EnvironmentConformance ou outras preconditions do domínio.
12. **Deny por ausência:** sem relação válida na superfície específica, o acesso é negado.

### Reconciliação com C-015

C-015 utiliza atualmente `ProjectMembership(account_id, project_id, role)` para descrever acesso ao app publicado. Depois das decisões 3B-10..3B-14, o nome e a responsabilidade ficaram ambíguos.

A reconciliação futura deverá separar conceitualmente:

```text
Project Control Grant
```

para:

```text
PROJECT_VIEWER
PROJECT_CONTRIBUTOR
PROJECT_ADMIN
```

E algo da família:

```text
App Membership / Published App Grant / Runtime Audience Grant
```

para o runtime publicado.

Os nomes finais serão decididos em Data Architecture e Identity & Access Design. Até lá, a semântica efetiva é a separação aprovada nesta decisão.

### Consequências

- usuário operacional pode usar um app sem enxergar o Project no Conexus;
- construtor pode evoluir o software sem receber dados/capabilities de produção;
- Project Admin administra acesso ao app sem precisar utilizá-lo;
- Workspace Owner administra todos os Projects, mas não é usuário universal de todos os apps;
- RunPreview possui boundary próprio de revisão;
- roles do Control Plane permanecem exclusivas do Control Plane;
- roles, permissions e data audience do app são projetadas separadamente;
- uma futura Account externa pode acessar um app sem ser colaboradora do Workspace;
- offboarding central por Account revoga todas as superfícies;
- permission diffs e auditoria deverão indicar a superfície afetada.

### Não construir no F1

```text
- dois diretórios de identidade;
- dois logins para a mesma pessoa;
- custom roles universais;
- sincronização automática Control Plane → app;
- owner com bypass silencioso de dados/capabilities;
- impersonação livre;
- self-signup público;
- policy engine genérica;
- compartilhamento cross-Workspace;
- separation-of-duties complexa sem consumidor real.
```

### Deliberadamente deixado para etapas posteriores

- nomes finais de tabelas e agregados;
- quantidade e natureza das superfícies publicadas por Project;
- catálogo de app roles e permissions;
- roles fixas versus roles definidas pelo Project;
- audience e row/field-level data scope;
- convite e provisionamento de usuários finais;
- identidade de preview e fixtures por perfil;
- SSO, SCIM, passkeys e self-signup;
- break-glass, impersonation e suporte;
- restrição de self-grant por compliance;
- caching e invalidação de effective permissions.

---

# 5. Questões abertas para concluir 3B

As decisões abaixo ainda não estão aprovadas:

1. **3B-15 — Recursos do Workspace × bindings do Project**  
   Definir ownership e bindings explícitos de Brain, Connections, credentials e recursos compartilháveis.

2. **3B-16 — Ownership dos recursos internos do Project**  
   Fechar ownership de source, data environments, artifacts, agents, releases, findings e Evidence.

3. **3B-17 — Reutilização e compartilhamento entre Projects**  
   Definir isolamento default e as formas permitidas de reuso sem acoplamento oculto.

Após essas fronteiras, 3B pode ser encerrado e o trabalho avança para Domain/Module Architecture.

# 6. Estado de progresso

```text
3A — Architecture Reconciliation       substancialmente analisada; não consolidada
3B — System Context & Boundaries       em andamento — 3B-01..3B-14 aprovadas
3C..3O                                 não iniciadas formalmente
```

A quantidade de IDs aprovados não deve ser confundida com percentual linear da Fase 3: Data Architecture, Contracts/APIs, behavioral models, technology qualification, failure/recovery e vertical proof ainda são blocos grandes.