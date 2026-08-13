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

---

# 5. Questões abertas para concluir 3B

As decisões abaixo ainda não estão aprovadas:

1. **3B-14 — Control Plane access × Published App access**  
   Separar quem constrói/administra o Project de quem apenas usa o aplicativo publicado.

2. **3B-15 — Recursos do Workspace × bindings do Project**  
   Definir ownership e bindings explícitos de Brain, Connections, credentials e recursos compartilháveis.

3. **3B-16 — Ownership dos recursos internos do Project**  
   Fechar ownership de source, data environments, artifacts, agents, releases, findings e Evidence.

4. **3B-17 — Reutilização e compartilhamento entre Projects**  
   Definir isolamento default e as formas permitidas de reuso sem acoplamento oculto.

Após essas fronteiras, 3B pode ser encerrado e o trabalho avança para Domain/Module Architecture.

# 6. Estado de progresso

```text
3A — Architecture Reconciliation       substancialmente analisada; não consolidada
3B — System Context & Boundaries       em andamento
3C..3O                                 não iniciadas formalmente
```

A quantidade de IDs aprovados não deve ser confundida com percentual linear da Fase 3: Data Architecture, Contracts/APIs, behavioral models, technology qualification, failure/recovery e vertical proof ainda são blocos grandes.
