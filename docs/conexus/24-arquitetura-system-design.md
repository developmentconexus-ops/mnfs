# Fase 3 — Architecture & System Design

**Status:** EM ANDAMENTO — ledger de decisões aprovadas pelo operador · **3B CLOSED**; próximo gate: 3C — Domain / Module Architecture  
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

## 3B-15 — Recursos do Workspace e bindings explícitos do Project

**Status:** APROVADO

### Decisão em uma frase

No F1, **Brain e Connections são recursos compartilháveis pertencentes ao Workspace; o Project não os herda, copia nem possui — ele os consome apenas por bindings explícitos, tipados, versionados, pinados e restritos ao mesmo Workspace.** Credentials permanecem sob custódia do Hub/Vault e vinculadas a Connections; nunca são recursos entregues diretamente ao Project.

### Três níveis de ownership

A arquitetura separa três níveis:

```text
PLATFORM
   ↓ fornece tipos, compilers e mecanismos

WORKSPACE
   ↓ possui recursos empresariais compartilháveis

PROJECT
   ↓ possui bindings e uso concreto desses recursos
```

#### Recursos da Platform

A Platform possui definições e mecanismos reutilizáveis, sem dados nem credenciais de um Workspace específico:

```text
Platform
├── Connector Definitions
├── Connector Compiler
├── Gateway Auth Strategies
├── Artifact Schemas
├── Scaffold Versions
├── Runtime Adapters
├── Policy Compilers
└── Platform Standards
```

Exemplo:

```text
Connector Definition: sankhya/v1
```

Essa definição pode descrever autenticação, operações, input/output schemas, efeitos, idempotência, hosts e testes. Ela não contém `client_id`, `client_secret`, `X-Token`, conta empresarial ou endpoint privado da Metal Nobre.

#### Recursos do Workspace

No F1, existem apenas dois tipos principais de recurso compartilhável:

```text
Workspace
├── Brain
└── Connections
```

O corte é deliberadamente pequeno. Não nasce um catálogo genérico de “qualquer recurso compartilhável”.

#### Recursos do Project

O Project possui a decisão e o contrato de como utiliza um recurso:

```text
Project
├── ProjectBrainBinding
└── ProjectConnectionBindings
```

A regra central é:

```text
Workspace owns resource
Project owns binding
```

### Brain como recurso do Workspace

O Brain representa conhecimento reutilizável entre Projects do mesmo Workspace:

```text
Brain
├── semantic model
├── metrics e measures
├── glossary
├── business rules
├── processes
├── caveats
├── provenance
└── executable evidence
```

Sua fonte publicada pertence ao Workspace. O Project não duplica o Brain nem recebe live inheritance.

### ProjectBrainBinding

A forma conceitual é:

```text
Workspace Brain
      │
      │ BrainRevision / BrainPack digest
      ▼
ProjectBrainBinding
      ├── revisão pinada
      ├── logical IDs usados
      ├── logical → local implementation mapping
      ├── assertions de conformidade
      ├── refinements/overrides explícitos
      └── binding digest
      │
      ▼
Project
```

O Brain pode dizer:

```text
company:margin
= receita líquida menos custo canônico
```

O binding do Project precisa dizer e provar:

```text
company:margin
→ vw_margem_venda
→ grain por item
→ key e cardinalidade declaradas
→ assertions de unicidade e consistência
```

Portanto:

```text
semântica compartilhada
≠
implementação física automaticamente correta
```

O Project só consome a semântica quando sua implementação local e suas provas correspondentes estão pinadas e válidas.

### Atualização do Brain não é live inheritance

Se `BR-12` está ativo em três Projects e `BR-13` é publicado:

```text
BR-13 publicada
        ↓
Projects recebem UPDATE_AVAILABLE
        ↓
Project avalia binding, impacto e golden evidence
        ↓
Project produz candidate/release próprio
        ↓
Project promove BR-13 explicitamente
```

Enquanto isso não ocorre:

```text
Project continua usando BR-12
```

Publicação no Workspace não significa adoção nem promoção por nenhum Project.

### Connection como recurso do Workspace

Uma Connection representa uma identidade/configuração concreta para acessar um sistema externo:

```text
Connection
├── connector revision
├── external environment
├── account/tenant externo identificado
├── non-secret configuration revision
├── credential_ref
├── qualification result
├── authorization metadata
├── health/status
└── audit identity
```

Mesmo quando uma Connection é inicialmente usada por apenas um Project, ela pertence ao Workspace porque:

- representa uma conta ou ambiente empresarial;
- a credencial não pertence ao código do Project;
- rotação, revogação e requalificação possuem lifecycle próprio;
- outros Projects podem reutilizá-la explicitamente;
- o blast radius e os dependentes precisam ser observáveis centralmente.

### ProjectConnectionBinding

Um Project usa uma Connection somente por binding explícito:

```text
Workspace Connection
        │
        ▼
ProjectConnectionBinding
        ├── project
        ├── project-local symbolic slot
        ├── project environment
        ├── connection revision
        ├── connection environment
        ├── usage boundary
        └── binding revision/digest
        │
        ▼
Release / Runtime
```

Um Project pode possuir:

```text
0..N ProjectConnectionBindings
```

E uma Connection pode possuir:

```text
0..N Project consumers
```

Nenhuma dessas cardinalidades cria autoridade implícita.

### Slots lógicos locais do Project

Código e artifacts não devem depender de um ID físico ou nome administrativo instável da Connection:

```text
connection_id = 9d34f...
Sankhya Metal Nobre Produção 2026
```

Eles dependem de um contrato lógico local, por exemplo:

```text
erp.primary
marketplace.primary
```

Os nomes finais dos slots serão definidos em Contracts/Data Architecture. A propriedade congelada é que o software depende de uma referência lógica e o Hub resolve o recurso físico por ambiente.

Exemplo:

```text
slot: erp.primary

workspace → Sankhya Homologação
preview   → Sankhya Homologação
PROD      → Sankhya Produção
```

### Mapeamento de ambiente explícito

Cada Project environment deve resolver uma Connection environment compatível e explicitamente configurada:

```text
Project workspace/DEV
→ Connection sandbox ou homologação

RunPreview
→ Connection homologação ou fixture/sink controlado

Project PROD
→ Connection produção
```

Nenhum ambiente é escolhido por nome parecido, fallback implícito ou “a única Connection disponível”.

Exceções, quando realmente necessárias, são configurações explícitas, auditáveis e sujeitas a conformance.

### Exemplo completo — Metal Nobre

```text
Workspace: Metal Nobre
│
├── Brain
│   ├── BR-12
│   └── BR-13
│
├── Connections
│   ├── Sankhya Homologação
│   ├── Sankhya Produção
│   └── Mercado Livre Produção
│
└── Projects
    ├── Análise de Vendedores
    ├── Análise de Compras
    └── Marketplace Central
```

#### Análise de Vendedores

```text
Brain Binding
└── BR-12

Connection Binding: erp.primary
├── workspace → Sankhya Homologação
├── preview   → Sankhya Homologação
└── PROD      → Sankhya Produção
```

Esse Project não recebe nenhum binding do Mercado Livre.

#### Análise de Compras

```text
Brain Binding
└── BR-12

Connection Binding: erp.primary
├── workspace → Sankhya Homologação
├── preview   → Sankhya Homologação
└── PROD      → Sankhya Produção
```

Ele pode compartilhar as mesmas Connections do Sankhya sem compartilhar source, artifacts, budgets, Releases ou authority com o Project de Vendas.

#### Marketplace Central

```text
Brain Binding
└── BR-13

Connection Binding: erp.primary
├── workspace → Sankhya Homologação
└── PROD      → Sankhya Produção

Connection Binding: marketplace.primary
└── PROD      → Mercado Livre Produção
```

Os dois bindings do Marketplace Central não ampliam os demais Projects.

### Binding não concede todas as operações

Vincular um Project a uma Connection não significa autorizar acesso irrestrito ao sistema externo.

A autoridade efetiva é a interseção de múltiplas camadas:

```text
Connector Contract
∩ Connection qualification/authorization
∩ ProjectConnectionBinding
∩ ReleaseManifest
∩ Artifact/Tool classification
∩ caller effective permissions
∩ policies e domain preconditions
=
effective operation authority
```

Uma Connection Sankhya pode possuir acesso técnico amplo, enquanto um Project expõe apenas:

```text
sankhya.orcamentos.list
sankhya.vendedores.list
sankhya.faturamento.read
```

A existência de uma operação como:

```text
sankhya.pedido.create
```

no Connector não a torna executável pelo Project. Ela precisa estar classificada, vinculada, incluída no manifesto, autorizada para o caller e admitida pelas policies e effect gates aplicáveis.

### O Project nunca recebe a credencial

Fluxo autorizado:

```text
Project code / artifact / agent
        │
        │ usa slot simbólico e operação tipada
        ▼
ReleaseManifest / ConfigBinding
        │
        ▼
Capability Gateway
        ├── deriva Workspace, Project e environment
        ├── resolve binding pinado
        ├── valida Connection revision e health
        ├── valida operação, permission e policy
        ├── resolve credential_ref server-side
        └── executa a chamada permitida
                │
                ▼
              Vault
                │
                ▼
          External System
```

Fluxos proibidos:

```text
Project → lê client_secret
Browser → recebe credential_ref
Pi/E2B → recebe segredo durável
Artifact → escolhe Connection física arbitrária
```

Workers podem receber capabilities efêmeras para usar tools do Gateway, mas nunca o material secreto durável.

### Ownership, custódia e consumo são conceitos diferentes

```text
Business ownership
Workspace → Connection

Physical custody
Hub/Vault → credential material

Consumption
Project → ProjectConnectionBinding
```

O Project não é owner nem custodiante da credencial.

### Rotação operacional versus mudança funcional

A arquitetura separa duas classes de mudança.

#### Rotação operacional compatível

Exemplo:

```text
client_secret v7
→ client_secret v8
```

Mantendo a mesma:

- conta externa;
- empresa/tenant;
- environment;
- authorization footprint;
- host/destination;
- Connector revision;
- semântica do binding.

Essa rotação pode ocorrer sem novo build do Project:

```text
novo secretVersion
→ testConnection/requalificação
→ activation/rollback operacional
→ evento auditado
→ binding lógico permanece
```

Ela não deve exigir alterar frontend, source ou artifact somente porque o segredo mudou.

#### Mudança funcional

Exemplos:

```text
Homologação → Produção
empresa 1 → empresa 2
conta A → conta B
host A → host B
read-only → escrita
Connector revision v1 → v2
```

Essas mudanças alteram semântica, authority ou blast radius:

```text
nova Connection revision e/ou binding revision
→ candidates dependentes ficam STALE
→ conformance e revalidação
→ novo ReleaseManifest
→ approval/promotion aplicável
```

### Health operacional não muda silenciosamente a identidade

Uma Connection pode passar de:

```text
READY
→ AUTH_FAILED / UNREACHABLE / DEGRADED
```

O binding continua identificando a mesma Connection. A capability dependente fica bloqueada ou indisponível de forma honesta.

Nunca ocorre:

```text
“essa Connection falhou,
então usei outra parecida”
```

Failover automático ou pools de Connections exigem decisão futura, consumer e provas próprias.

### Lifecycle e remoção

#### Remover um binding

```text
remove ProjectConnectionBinding
```

não remove a Connection do Workspace. Outros Projects podem continuar consumindo-a.

#### Remover ou reorganizar uma Area

Area governa pessoas e acesso. Ela não é owner de Brain, Connection nem binding técnico. Reorganização organizacional não reconfigura integrações silenciosamente.

#### Desabilitar/remover uma Connection

Uma Connection não pode desaparecer silenciosamente enquanto existirem:

- bindings ativos;
- Releases ativas ou históricas que a referenciam;
- execuções em andamento;
- jobs pendentes;
- receipts, traces ou Evidence que dependam de sua identidade.

O lifecycle detalhado será decidido em Behavioral Architecture, mas deve preservar:

```text
listar dependentes
→ impedir novos usos quando aplicável
→ migrar/remover bindings explicitamente
→ reconciliar execuções
→ preservar identidade histórica e provenance
```

#### Brain revisions históricas

Revisões utilizadas por Releases e Evidence permanecem identificáveis. Retenção ou remoção de conteúdo não pode tornar uma Release histórica inexplicável.

### Cross-Workspace permanece proibido

Mesmo que uma Account seja owner de dois Workspaces:

```text
Workspace Metal Nobre
Workspace Aurora
```

continua proibido:

```text
Project Aurora
→ Connection Sankhya Metal Nobre
```

ou:

```text
Project Aurora
→ Brain Metal Nobre
```

O Hub valida:

```text
Project.workspace_id
==
Resource.workspace_id
```

Compartilhamento futuro, se admitido, ocorre por capability explícita de export/publication/import, com consentimento, provenance e policy própria — nunca por referência viva acidental.

### Area não é binding técnico

```text
Area → Project grant
```

responde:

> Quem pode acessar o Project?

```text
Project → Workspace Resource Binding
```

responde:

> Quais recursos técnicos esse software utiliza?

Uma Area pode receber acesso ao Project e ao app publicado, mas não escolhe automaticamente Brain revision, Connection, environment ou credential.

### Administração e separation of authority

A matriz final de permissions será definida em Identity & Access Design, mas o modelo deve permitir separar ações como:

```text
workspace_resource.create
workspace_resource.update
workspace_resource.disable
workspace_resource.bind
project_binding.manage
connection.secret.rotate
connection.qualify
brain.publish
brain.bind
```

Exemplos de separação desejada:

- um `PROJECT_ADMIN` pode solicitar ou administrar um binding sem receber o segredo;
- um responsável por integração pode rotacionar/requalificar Connection sem promover Release;
- um steward do Brain pode publicar nova revisão sem forçar Projects a adotá-la;
- quem usa o app publicado não recebe authority para alterar o binding que o alimenta.

### Não criar resource-binding engine genérico

O F1 possui explicitamente:

```text
ProjectBrainBinding
ProjectConnectionBinding
```

Não terá uma abstração genérica como:

```text
workspace_resources
resource_bindings
resource_type
subject_type
binding_payload
```

Bindings tipados preservam:

- foreign keys claras;
- schemas próprios;
- invariantes específicas;
- lifecycle compreensível;
- mensagens de erro úteis;
- policies por tipo de recurso.

Um terceiro recurso compartilhável só nasce quando houver um consumer real e receberá seu próprio contrato e binding.

### Recursos deliberadamente não compartilhados no F1

```text
Artifacts          → pertencem ao Project
Production Agents  → pertencem ao Project
Project Databases  → pertencem ao Project/environment
Releases           → pertencem ao Project
Findings/Evidence  → pertencem ao lifecycle do Project/Change
Credentials        → pertencem à custódia da Connection/Vault
Connector defs     → pertencem à Platform
```

Não serão criados antecipadamente:

```text
SharedAgent
SharedArtifact
SharedDatabase
SharedJob
SharedSecret
SharedProjectModule
GenericWorkspacePackage
```

A reutilização legítima entre Projects será tratada em 3B-17.

### Modelo consolidado

```text
PLATFORM
├── Connector Definitions
├── Artifact Schemas
├── Runtime Adapters
└── Compilers
        │
        ▼
WORKSPACE
├── Brain
│    ├── BrainRevision
│    └── BrainPack
│
└── Connections
     ├── Connector Revision Ref
     ├── Environment
     ├── Credential Ref
     ├── Qualification
     └── Health
        │
        │ typed + explicit bindings
        ▼
PROJECT
├── ProjectBrainBinding
├── ProjectConnectionBindings
├── Config Contract
└── ReleaseManifest
        │
        ▼
RUNTIME
└── Capability Gateway
     ├── resolve binding
     ├── resolve policy
     ├── resolve credential
     └── execute
```

### Invariantes

1. **Ownership separado:** Workspace possui o recurso; Project possui o binding.
2. **Binding explícito:** pertencer ao mesmo Workspace não concede uso do recurso.
3. **Mesmo Workspace:** um Project só pode bindar Brain/Connection do próprio Workspace.
4. **Binding tipado:** F1 não possui engine genérico de recursos.
5. **Slot lógico local:** código e artifacts dependem de referência lógica, não de secret ou ID físico arbitrário.
6. **Environment mapping explícito:** cada Project environment resolve uma Connection environment compatível.
7. **Credential nunca pertence ao Project:** material secreto permanece no Vault e só é usado pelo Gateway.
8. **Pinning:** Brain e revisões funcionais de Connection não possuem live inheritance.
9. **Atualização não é promoção:** nova revisão só gera `UPDATE_AVAILABLE`; Project precisa revalidar e promover.
10. **Health bloqueia, não reconfigura:** falha operacional nunca provoca rebind silencioso.
11. **Binding não concede todas as operações:** authority efetiva é a interseção de contratos, manifesto, caller e policies.
12. **Rotação de secret é distinta de mudança funcional:** rotação compatível pode ocorrer sem rebuild; mudança semântica exige nova revisão/release.
13. **Remoção preserva provenance:** recursos referenciados historicamente não desaparecem de forma a quebrar explicabilidade.
14. **Area não governa binding técnico:** autorização organizacional e dependência técnica são grafos distintos.
15. **Auditoria identifica consumidor:** uso compartilhado registra Workspace, Project, environment, deployment, operation e Actor/Account.
16. **Fail-closed:** binding ausente, stale, inválido, cross-Workspace ou incompatível com environment impede execução.
17. **Hub é o resolver:** Project, browser, Worker e LLM não escolhem credencial ou recurso físico fora do binding aprovado.

### Consequências

- Brain da Metal Nobre pode ser reutilizado por vários Projects sem duplicação;
- Sankhya Produção pode atender vários Projects sem distribuir sua credencial;
- cada Project escolhe explicitamente quais recursos e revisões utiliza;
- um Project pode usar zero, uma ou várias Connections;
- uma Connection pode possuir zero, um ou vários Projects consumidores;
- Project code usa slots lógicos;
- ReleaseManifest fixa os bindings funcionais exatos;
- novo Brain não altera automaticamente nenhum app;
- Connection inválida bloqueia capabilities dependentes;
- Project Aurora não acessa Brain ou Connection da Metal Nobre;
- shared resources adicionais não entram sem consumidor real;
- Data Architecture deverá materializar ownership, revisions, constraints e dependências históricas dessa boundary.

### Não construir no F1

```text
- resource-binding engine genérico;
- live inheritance de Brain;
- escolha automática de Connection;
- fallback/failover implícito;
- secret disponível no Project/browser/sandbox;
- compartilhamento cross-Workspace;
- shared artifacts/agents/databases/jobs;
- pools de Connections;
- catálogo universal de resource slots;
- DSL genérica de binding.
```

### Deliberadamente deixado para etapas posteriores

- nomes finais de tabelas e agregados;
- schema exato dos bindings;
- forma autorada do `ProjectConnectionBinding` no repo;
- estados detalhados de Connection, qualification e binding;
- catálogo e convenção final de slots;
- operação allowlist no binding versus manifesto;
- permissions administrativas exatas;
- UI de impacto, dependentes e upgrade;
- caching e invalidação de bindings;
- failover e Connection pools;
- shared resources adicionais;
- import/export e packages cross-Workspace;
- retenção legal de secrets e Connection metadata.

## 3B-16 — Ownership dos recursos internos do Project

**Status:** APROVADO

Decisão detalhada em [phase3/3B-16-project-internal-resource-ownership.md](phase3/3B-16-project-internal-resource-ownership.md).

Em uma frase: todo recurso interno durável pertence logicamente a um Project ou a uma sub-raiz inequivocamente pertencente a ele; Git, Hub/Postgres, Project Database e Registry/CAS/serving possuem responsabilidades distintas e não são fontes de verdade concorrentes; DEV e PROD são ambientes persistentes quando existentes; bancos de validação são temporários e condicionais.

## 3B-17 — Isolamento de Projects e reuso explícito

**Status:** APROVADO

Síntese normativa: Projects são independentes e isolados por padrão. Reuso F1 ocorre por Platform/scaffold, Workspace Brain e Workspace Connections. Não há acesso direto entre databases, source repos ou recursos runtime internos de Projects distintos. Duplicação local pequena é preferível a abstração compartilhada prematura. Nova abstração compartilhada só nasce após consumidores reais demonstrarem semântica e lifecycle estáveis.

---

# 5. Precedências e reconciliações registradas (cross-review 3B)

Registros de precedência entre a autoridade anterior (C-000..C-017) e as decisões 3B. Nenhum item abaixo cria mecanismo novo nem reabre decisão aprovada.

1. **Plan schema v2 (C-000/C-017 · HAR-7).** O veredito REUSE cobre os padrões de validação, revision/digest, render visual, dependency graph e proof mapping — **re-tipados para Change/Work Unit**. Mission/Milestone/Feature **não** são reutilizados no F1 (C-017 invariante 1 prevalece sobre a leitura literal do schema legado). A forma final do schema re-tipado será definida em 3C/3F.
2. **Role set do app publicado (C-015 §6 × 3B-14).** O conjunto fechado `{admin, member}` do C-015 §6 permanece o role set F1 do aplicativo publicado, com seu gatilho nomeado de abertura. `APP_ROLE_VENDEDOR` e exemplos similares em 3B-14 são ilustrativos do modelo de superfícies — não constituem emenda ao role set.

# 6. Encerramento de 3B e estado de progresso

```text
3B — System Context & Boundaries: CLOSED
próximo gate: 3C — Domain / Module Architecture
```

3B-01..3B-17 aprovadas; review transversal concluído — findings, owners e dívida editorial registrados em [phase3/README.md](phase3/README.md).

```text
3A — Architecture Reconciliation       reconciliation transversal contínua até C-018
3B — System Context & Boundaries       CLOSED — 3B-01..3B-17 aprovadas
3C..3O                                 não iniciadas formalmente
```

Este encerramento não constitui C-018, não encerra a Fase 3 e não autoriza implementação. A quantidade de IDs aprovados não deve ser confundida com percentual linear da Fase 3: Data Architecture, Contracts/APIs, behavioral models, technology qualification, failure/recovery e vertical proof ainda são blocos grandes.