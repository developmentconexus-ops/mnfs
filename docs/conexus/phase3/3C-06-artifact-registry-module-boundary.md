# 3C-06 — Artifact Registry Module Boundary

**Status:** APROVADO pelo operador  
**Fase:** 3C — Domain / Module Architecture  
**Importante:** esta decisão não constitui C-018, não encerra 3C e não autoriza implementação.

## Decisão em uma frase

No Conexus F1 existe **um único módulo `Artifact Registry`** para registrar e resolver revisões compiladas imutáveis, mas isso **não significa um único scope de negócio**. O Registry owns identidade, kind, scope lógico, revision digest, proveniência de source/compilador, payload compilado e disponibilidade da revisão. Git continua sendo a authority de authoring; módulos especializados continuam owners da semântica; `Release / Deployment` continua sendo a única authority que decide o que está efetivamente servido.

O mapa F1 é fechado e distingue **definição versionada** de **instância operacional**:

```text
kind              conteúdo registrado                    scope do artifact     authoring root
────────────────────────────────────────────────────────────────────────────────────────────
integration       ConnectorDefinition / connector/v1     PLATFORM              Platform Connector Catalog Git
brain             BrainDefinition / brain/v1             WORKSPACE             Workspace Brain Git root
query             query definition                       PROJECT               canonical Project repository
action            action definition                      PROJECT               canonical Project repository
job               job definition                         PROJECT               canonical Project repository
agent             AgentDefinition / agent/v1             PROJECT               canonical Project repository
brain-binding     brain-binding/v1 contract              PROJECT               canonical Project repository
```

`Connection` concreta **não é artifact do Registry**. Ela é recurso operacional do módulo Connections e, no F1, seu scope permitido é a união fechada `WORKSPACE | PROJECT`, escolhida pelo domínio real de ownership/reuse da conexão — nunca hardcoded pelo provider. Uma `WorkspaceConnection` pode ser reutilizada por vários Projects somente por bindings explícitos; uma `ProjectConnection` permanece privada ao Project. O ConnectorDefinition técnico continua Platform-scoped em ambos os casos.

As invariantes centrais são:

```text
Artifact Definition
!=
Operational Instance

AVAILABLE in Registry
!=
ACTIVE / SERVED

same physical bytes
!=
same logical authority
```

## Contexto e precedência

Esta decisão materializa e reconcilia, sem reabrir, as seguintes autoridades anteriores:

- C-005: artifacts são git-first; o Registry guarda payload compilado imutável; revision digest é derivado do conteúdo normalizado; runtime não usa Git como serving store;
- C-007: Connector é artefato versionado `connector/v1`; Connection é objeto operacional no `hub_control`, com credential lifecycle, environment, qualification e health próprios;
- C-010: agente de produção é artifact declarativo `agent/v1`; Conversation, AgentRun e ApprovalRequest são objetos runtime separados;
- C-011: Brain é Workspace/Group-scoped, git-first, publicado como revisão/payload imutável; `brain-binding/v1` é Project-scoped;
- C-014: `ReleaseManifest` é composition root e authority sobre a composição promovida/servida; Registry `AVAILABLE` não ativa ambiente;
- 3B-15: `Workspace owns resource / Project owns binding`; reuse nunca é implícito;
- 3B-16: Git, Hub/Postgres, Project Database e Registry/CAS respondem perguntas diferentes; same bytes não criam mesma authority;
- 3B-17: Projects permanecem isolados e reuse é explícito;
- 3C-01: F1 é modular monolith; Artifact Registry é boundary de módulo, não microservice;
- 3C-03: `scoped_by(workspace) != implemented_by(WorkspaceModule)`;
- 3C-04: Project owns seus bindings/intenção de consumo; `Project-scoped != Project-module-owned`;
- 3C-05: Builder produz mudanças/candidates, mas não ganha authority para publicar/servir artifacts diretamente.

Nada aqui escolhe tables/FKs/índices físicos (3E), signatures/DTOs/HTTP (3F), lifecycle/FSM completa (3G), placement físico do CAS/object storage (3J) ou implementação concreta dos compilers.

## Finding material que refinou a decisão

A primeira formulação de 3C-06 tratava `integration → PLATFORM` corretamente no nível do **ConnectorDefinition**, mas corria o risco de transportar esse scope para a **Connection concreta**.

O operador trouxe dois casos reais que provam que isso seria errado:

```text
Metal Nobre — Sankhya PROD
→ é capacidade organizacional da empresa
→ vários Projects podem precisar dela
→ continua fazendo sentido mesmo se um Project específico desaparecer
→ candidato natural a WORKSPACE Connection
```

versus:

```text
Marketplace Hub — Mercado Livre
→ pode ser dependência exclusiva daquele software
→ não precisa ficar visível/reutilizável no Workspace inteiro
→ candidato natural a PROJECT Connection
```

A conclusão é que três conceitos devem permanecer separados:

```text
ConnectorDefinition
→ COMO falar com uma classe de sistema externo
→ artifact versionado da PLATFORM

Connection
→ QUAL sistema/conta/ambiente real está conectado
→ recurso operacional WORKSPACE ou PROJECT

ProjectConnectionBinding
→ COMO este Project escolheu consumir determinada Connection/revision/environment
→ intenção explícita owned pelo Project
```

Essa distinção fecha a ambiguidade sem criar registry por scope e sem transformar Connections em artifacts.

## Pesquisa comparativa usada para desafiar a boundary

A comparação foi usada para extrair forma, não para importar produtos inteiros.

### Mitra

O acervo Mitra prova o padrão `build/authoring → registry → runtime restrito`, mas seus registries observados são fortemente Project-scoped (`serverFunction`, `dataLoader`, `dbAction`) e usam IDs numéricos. Também separa Connection/credencial server-side do JSON declarativo de uma Server Function de integração.

Transferência útil:

```text
artifact executável versionável
!=
credencial/conexão operacional
```

Referências internas:

- `docs/reference/mitra/02-registro-artefatos.md`
- `docs/reference/mitra/04-integracao-externa.md`
- `docs/research/MITRA-INSPIRATION-MAP.md`

### Factory

Factory externaliza source, validation contracts e shared work artifacts em arquivos/Git e mantém runtime/orchestration como preocupação distinta. Não existe Evidence pública suficiente para afirmar que seu backend possui um universal executable artifact registry equivalente ao Conexus.

Transferência útil:

```text
authoring/shared source state
!=
runtime operational state
```

Referência interna:

- `docs/research/FACTORY-AI-HARNESS-REFERENCE-MAP.md`

### OCI Distribution Specification

OCI separa registry, repository namespace, manifest/reference e content digest. O valor transferível é que um mecanismo comum de distribuição pode servir vários namespaces enquanto o digest identifica conteúdo de forma imutável.

Referência:

- `https://github.com/opencontainers/distribution-spec/blob/main/spec.md`

O Conexus não implementará OCI no F1; usa apenas o padrão conceitual `namespace + immutable content digest`.

### GitHub Packages

GitHub Packages demonstra que o mesmo produto de registry pode possuir packages em scopes diferentes, incluindo organization/user scope e repository scope, sem exigir serviços de registry separados.

Referência:

- `https://docs.github.com/en/packages/learn-github-packages/about-permissions-for-github-packages`

Transferência útil:

```text
one registry capability
!=
one business scope
```

### Harness — finding importante para Connections

Harness suporta Connectors em múltiplos níveis hierárquicos; recursos em Organization scope podem ser reutilizados pelos Projects daquela Organization, enquanto recursos Project-scoped permanecem específicos daquele Project.

Referências:

- `https://developer.harness.io/docs/platform/platform-whats-supported/`
- `https://developer.harness.io/docs/platform/connectors/code-repositories/connect-to-code-repo/`

A transferência útil é diretamente compatível com os casos Sankhya versus Mercado Livre, mas o Conexus F1 mantém somente os scopes que já têm consumidor concreto:

```text
WORKSPACE
PROJECT
```

Não copia Account/Org/Project generic hierarchy de resources nem resource inheritance engine.

## Alternativas avaliadas

### Alternativa A — um Registry, kinds/scopes fechados, instâncias operacionais fora

```text
Artifact Registry
├── PLATFORM artifacts
│   └── integration / ConnectorDefinition
├── WORKSPACE artifacts
│   └── brain
└── PROJECT artifacts
    ├── query
    ├── action
    ├── job
    ├── agent
    └── brain-binding

Connections module
├── WorkspaceConnection
└── ProjectConnection
```

**Decisão:** ADOTADA para F1.

Benefícios atuais:

- uma só machinery de revision/digest/provenance/immutable payload;
- preserva ownership real por scope;
- não duplica Registry por Workspace/Project;
- não transforma Connection/credentials em artifact;
- mantém Release como único caminho para serving;
- fecha F3B-R3 no nível de ownership/module scope;
- não cria framework genérico de resource ownership.

### Alternativa B — três registries separados por scope

```text
PlatformArtifactRegistry
WorkspaceArtifactRegistry
ProjectArtifactRegistry
```

**Decisão:** REJECT.

Duplicaria:

- revision identity;
- digest;
- provenance;
- compiled-payload storage;
- lookup;
- availability;
- artifact-set computation;
- archive/retention mechanics.

Não elimina uma failure class atual.

### Alternativa C — tudo Project-scoped

**Decisão:** REJECT.

Duplicar ConnectorDefinitions e BrainDefinitions em cada Project destruiria reuse explícito e criaria drift entre cópias.

### Alternativa D — generic artifact/resource ownership framework

Exemplo rejeitado:

```text
registerArtifactKind(kind, compiler, handler, allowedScopes)
registerResourceOwner(type)
transferOwnership(...)
GenericOwnedResource
UniversalArtifactScope
```

**Decisão:** REJECT para F1.

Kinds e scopes atuais são poucos, concretos e já conhecidos. União fechada é suficiente.

### Alternativa E — provider determina scope da Connection

Exemplo rejeitado:

```text
Sankhya      → sempre WORKSPACE
MercadoLivre → sempre PROJECT
```

**Decisão:** REJECT.

O mesmo provider pode ter uma conexão organizacional compartilhada ou uma conexão privada a um Project. Scope segue ownership/lifecycle/reuse real, não o nome do fornecedor.

## Responsabilidade do Artifact Registry

Artifact Registry responde à pergunta:

> **Qual revisão compilada exata de um artifact existe, em qual namespace lógico ela pertence, de qual source/compilador veio e quais bytes imutáveis representam essa revisão?**

Forma conceitual:

```text
Git authoring root
      │
      ▼
kind-specific validation/compilation
      │
      ▼
Artifact Registry
├── logical identity
├── scope identity
├── kind
├── slug
├── revision digest
├── source provenance
├── compiler/schema provenance
└── immutable compiled payload
      │
      ▼
AVAILABLE
```

A responsabilidade termina antes de decidir se o artifact pode ser executado por um principal ou se pertence à Release atualmente servida.

## Artifact Registry owns

O módulo owns semanticamente:

```text
Artifact identity
Artifact kind
Artifact logical scope identity
Artifact slug / logical name
ArtifactRevision identity
artifactRevisionDigest
source provenance
compiler/schema provenance
compiled immutable payload reference
revision availability/publication state
exact revision resolution
artifact-set digest computation
relationship to content-addressed payload storage
```

Nomes físicos de columns/tables ficam para 3E.

## ArtifactRef conceitual

Uma referência exata precisa carregar informação equivalente a:

```text
scopeType
scopeId
kind
slug
revisionDigest
```

Isso não congela DTO nem primary key.

O objetivo é impedir ambiguidades como:

```text
query:vendas
```

sem saber de qual Project/revisão estamos falando.

A forma final pertence a 3F.

## Scope fechado por kind

F1 não aceita `scope` arbitrário declarado pelo artifact.

A regra é server-side/schema-side:

```text
integration
→ PLATFORM only

brain
→ WORKSPACE only

query | action | job | agent | brain-binding
→ PROJECT only
```

Um artifact não pode se autodeclarar em outro scope para ampliar visibilidade.

Exemplo inválido:

```yaml
kind: brain
scope: PROJECT
```

Se a semântica futura exigir novo scope real, isso exige decisão arquitetural explícita, não configuração dinâmica.

## Kind versus owner semântico

`kind` determina o contrato de compilação/validação e o namespace permitido, mas não transfere a semântica do domínio para o Registry.

### `query`, `action`, `job`

O Registry guarda a **definição compilada/revisão**.

Ele não owns:

```text
executionId
job run
query result
remote effect receipt
runtime authorization
```

Execuções pertencem aos runtimes/Gateway/Observability correspondentes.

### `agent`

O Registry guarda:

```text
AgentDefinition / agent/v1 revision
```

Ele não guarda como artifact:

```text
Conversation
AgentRun
ApprovalRequest
```

Esses objetos pertencem ao Production Agent Runtime conforme C-010.

### `brain`

O Registry guarda a revisão/payload compilado do Brain.

Brain module continua owner de:

```text
BrainDefinition semantics
BrainRevision publication semantics
BrainPack compilation semantics
health
KnowledgeProposal
EffectiveBrainPlan
```

Registry fornece identity/integrity/serving payload store, não conhecimento de negócio.

### `brain-binding`

Existe uma distinção deliberada:

```text
Project
→ owns ProjectBrainBinding intent

Git do Project
→ authors brain-binding/v1 contract

Brain
→ validates binding semantics against Brain revision

Artifact Registry
→ owns immutable compiled revision of that contract

Release
→ pins exact revision served
```

Logo `brain-binding` ser artifact não transforma Registry em owner da intenção de binding.

### `integration`

No Registry, `integration` significa:

```text
ConnectorDefinition / connector/v1
```

Não significa:

```text
Connection
credential
account/token
WorkspaceConnection
ProjectConnection
ProjectConnectionBinding
```

Essa distinção é normativa.

## Connection fica fora do Registry

Connection é estado operacional e possui lifecycle diferente de source artifact.

Ela contém semanticamente coisas como:

```text
connector revision reference
environment
credential backend/ref
qualification/testConnection
health
resolved external account/tenant metadata
last error / operational state
```

Esses fatos podem mudar sem criar uma nova ConnectorDefinition.

Exemplo:

```text
ConnectorDefinition Sankhya revision ABC
        │
        ├── Connection Metal Nobre Sankhya PROD
        │      credential key version 7
        │
        └── Connection Metal Nobre Sankhya HOMOLOG
               credential key version 3
```

Rotacionar a credencial não cria nova revisão do ConnectorDefinition.

## ConnectionScope F1 — `WORKSPACE | PROJECT`

A discussão com o operador identificou dois consumidores atuais distintos. Portanto o F1 congela apenas:

```text
ConnectionScope = WORKSPACE | PROJECT
```

Sem `AREA`, `ACCOUNT`, cross-Workspace, nested scope ou generic sharing policy.

### Workspace Connection

Use quando a conexão representa uma capacidade durável da organização/Workspace e faz sentido sobreviver aos Projects consumidores.

Exemplos naturais:

```text
ERP corporativo
CRM corporativo
Data Warehouse corporativo
Google Workspace corporativo
```

Exemplo principal:

```text
Workspace: Metal Nobre
└── Connection: Sankhya PROD
    ├── binding → Análise de Vendas
    ├── binding → Compras Inteligentes
    └── binding → CRM
```

A conexão estar no Workspace **não** concede uso automático a todos os Projects. `ProjectConnectionBinding` continua obrigatório para consumo.

### Project Connection

Use quando a conexão existe como dependência privada daquele software e não precisa de lifecycle/reuse independente.

Exemplo principal:

```text
Project: Marketplace Hub
└── Connection: Mercado Livre — Metal Nobre
```

Outros Projects não recebem acesso apenas por compartilhar Workspace.

### Provider não determina scope

O mesmo provider pode existir nos dois regimes.

Exemplo:

```text
Mercado Livre corporativo compartilhado por 3 Projects
→ WORKSPACE Connection

Mercado Livre exclusivo de um único Marketplace Hub
→ PROJECT Connection
```

Da mesma forma:

```text
Sankhya corporativo principal
→ WORKSPACE Connection

Sankhya sandbox isolado para um Project experimental
→ pode ser PROJECT Connection
```

Regra conceitual:

> Scope segue quem owns o lifecycle da conexão e qual é seu domínio real de reuse, nunca o provider.

Heurística útil, não algoritmo normativo:

> **Se este Project desaparecer, a Connection ainda possui razão própria para existir?**

- sim → forte sinal de `WORKSPACE`;
- não → forte sinal de `PROJECT`.

A operação/UX concreta de criação e mudança de scope será detalhada na decisão do módulo Connections; não nasce aqui um transfer/reparent engine.

## Connection versus Brain

A Connection não deve absorver conhecimento semântico empresarial.

Separação:

```text
Connection Sankhya
→ COMO/ONDE alcançar o sistema real

Workspace Brain
→ O QUE os dados/processos significam
```

Exemplo:

```text
Connection
├── endpoint
├── environment
├── credentialRef
└── qualification

Brain
├── TGFCAB = cabeçalho de documento
├── TGFITE = itens
├── TOPs válidas de venda
├── definição de devolução
├── regra de margem
└── caveats de VLRCUS
```

Isso impede que credencial/lifecycle de integração e semântica de negócio virem um aggregate único.

## Authoring roots por kind

### Platform Connector Catalog Git root

`integration / connector/v1` é authorado em uma raiz Git owned pela plataforma.

3C congela a **raiz lógica de authority**, não o repositório físico final.

Não fica dentro do primeiro Project que usa o provider.

### Workspace Brain Git root

`brain/v1` é authorado na raiz Git do Workspace/Group, conforme C-011.

Não fica dentro de um Project consumidor.

### Canonical Project repository

Ficam no repo canônico do Project:

```text
query
action
job
agent
brain-binding
```

Paths exatos ficam para scaffold/contracts.

## Registry não é authoring

Regra normativa:

```text
Git
→ human/agent editable source

Registry
→ compiled immutable projection
```

Não haverá API de produto equivalente a:

```text
createArtifactInRegistry(...)
updateArtifactPayload(...)
editArtifactRevision(...)
```

como segundo caminho autoritativo de authoring.

Nova revisão nasce de source autorizado + validação/compilação, nunca de mutation direta do payload registrado.

## Registry não é execution authority

Artifact Registry pode responder:

```text
"esta revisão existe"
"este é seu digest"
"estes são exatamente os bytes compilados"
"esta é sua proveniência"
```

Mas não pode responder sozinho:

```text
"Leandro pode executar isto"
"este artifact pode enviar WhatsApp"
"este artifact está em PROD"
"este Project pode usar esta Connection"
"este Brain está ativo neste Project"
```

Essas respostas pertencem a Identity & Access, Capability Gateway, Project, Brain, Connections e Release/Deployment conforme o caso.

## `AVAILABLE != ACTIVE`

Uma revisão compilada pode estar disponível no Registry sem fazer parte de qualquer Release ativa.

Exemplo:

```text
Registry
├── query vendas rev A  AVAILABLE
├── query vendas rev B  AVAILABLE
└── query vendas rev C  AVAILABLE

PROD Release 42
└── query vendas rev B
```

Publicar rev C não altera PROD.

Somente Release/Deployment pode compor/pinar/promover a nova revisão.

O mesmo vale para Brain e ConnectorDefinition.

## Cross-scope usage

Registry reconhece identity/scope, mas não cria inheritance automática.

### Project consumindo Brain

```text
Workspace Brain revision
        │
        ▼
ProjectBrainBinding explícito
        │
        ▼
ReleaseManifest
```

Project não pode consumir Brain de outro Workspace apenas porque conhece um digest.

### Project consumindo ConnectorDefinition

```text
Platform ConnectorDefinition
        │
        ▼
WorkspaceConnection ou ProjectConnection
        │
        ▼
ProjectConnectionBinding
        │
        ▼
ReleaseManifest / runtime config
```

Conhecer `connectorRevisionDigest` nunca concede credential ou access.

### Project artifact de outro Project

Continua deny por 3B-17.

Registry possuir revisões de vários Projects não cria cross-project reuse implícito.

## Physical CAS versus logical authority

Payloads podem usar storage content-addressed compartilhado e deduplicar bytes fisicamente.

Porém:

```text
ArtifactRef(Project A, digest X)
ArtifactRef(Project B, digest X)
```

não viram a mesma authority apenas porque os bytes coincidem.

Registry preserva namespace lógico separadamente da identidade física do blob.

A decisão sobre Postgres bytea, filesystem, object storage ou combinação fica para 3E/3J.

## Compilation boundaries

F1 não terá compiler plugin registry dinâmico.

Os kinds são fechados e conhecidos.

Conceitualmente:

```text
query/action/job
→ compiler/validator conhecido

integration
→ Connector compiler/validator

agent
→ Agent compiler/validator

brain
→ Brain compiler/validator

brain-binding
→ Brain/Project binding compiler/validator
```

O módulo especializado continua owner da semântica e pode fornecer a capability de compilação/validação. O Registry recebe somente payload elegível para publicação e registra provenance/integrity.

O grafo exato de dependências e orchestration do compile fica para 3D.

## Public internal API sem congelar 3F

3C congela apenas capacidades semânticas equivalentes a:

```text
publishCompiledRevision
resolveExactRevision
resolveArtifactRef
listAvailableRevisions
inspectRevisionProvenance
computeArtifactSetDigest
verifyPayloadDigest
```

Os nomes não são signatures finais.

APIs genéricas rejeitadas no F1:

```text
registerKind(...)
registerCompiler(...)
registerRuntimeHandler(...)
createArbitraryScope(...)
transferArtifactOwnership(...)
registerGenericResource(...)
```

## Consumers

Consumers naturais incluem:

```text
Builder
Project
Brain
Connections
Capability Gateway
Production Agent Runtime
Release / Deployment
```

Observability pode correlacionar execution/revision digests, mas não é source de registry truth.

## Allowed dependencies — intenção de 3C

O grafo exato fica para 3D, mas esta decisão impõe:

- Registry pode conhecer stable scope IDs e kind discriminators sem importar internals de Workspace/Project;
- Registry não depende de Project Database;
- Registry não depende de credential material;
- Registry não depende de runtime execution state para provar payload identity;
- consumers usam public internal API, não tables/internals do Registry;
- módulos especializados validam semântica própria sem transformar Registry em god-module.

## Forbidden dependencies / bypasses

F1 proíbe:

```text
runtime lendo artifact source diretamente do Git
worker publicando diretamente no Registry
worker fazendo push remoto com credential ampla
Registry lendo credential backend
Registry executando query/action/integration por conta própria
Registry promovendo Release
Registry decidindo authorization/effects
Project A importando revision interna de Project B por digest cru
browser escolhendo scopeId/ProjectId não validado server-side
```

## F3B-R3 — disposição

O finding fica **RESOLVIDO em 3C no nível de module ownership/scope e authoring roots**:

```text
integration → PLATFORM → Platform Connector Catalog Git
brain       → WORKSPACE → Workspace Brain Git
project kinds → PROJECT → canonical Project repo
```

E fica explicitamente resolvida a ambiguidade:

```text
integration artifact
= ConnectorDefinition
!= Connection operational instance
```

Resíduos legítimos:

- 3E: physical schema/keys/FKs/indexes e realização do namespace/CAS;
- 3F: ArtifactRef/Publish/Resolve contracts e DTOs;
- future Connections boundary: lifecycle/API/UX exatos de `ConnectionScope = WORKSPACE | PROJECT` e invariantes de creation/archive/rebind.

Esses resíduos não reabrem a decisão de module ownership.

## Anti-overengineering / explicitamente NÃO construir no F1

Não construir:

```text
3 registries separados
GenericOwnedResource
ArtifactScope DSL
dynamic kind registration
compiler plugin marketplace
runtime handler registry
artifact ownership transfer engine
AREA-scoped Connections
ACCOUNT-scoped Connections
cross-Workspace Connection sharing
provider→scope hardcode
auto-inheritance de Workspace Connection
cross-project artifact reuse genérico
OCI compatibility layer
Harbor/Artifactory-like product
```

Cada item exige consumidor/failure class real antes de entrar.

## Consequências

### Positivas

- uma única machinery de revision/integrity/provenance;
- reuse organizacional de Brain e Connections preservado;
- Project isolation preservado;
- ConnectorDefinition não duplica por empresa/conta;
- rotação de credential não cria artifact revision;
- Release continua composition root único;
- definição versus instância fica explícita;
- o caso Sankhya versus Mercado Livre é representado naturalmente sem exceções por provider.

### Custos aceitos

- ArtifactRef precisa incluir scope explícito/derivável;
- compilação/publicação precisa validar `kind → allowed scope`;
- Connections precisará carregar scope operacional próprio;
- UI futura terá que distinguir shared Workspace Connections de Project Connections.

Esses custos eliminam ambiguidade real e possuem consumidores atuais.

## Exemplos completos

### Exemplo A — Sankhya corporativo

```text
PLATFORM
└── ConnectorDefinition sankhya@ABC

WORKSPACE Metal Nobre
├── Brain Metal Nobre@BRAIN17
│   └── semântica Sankhya / negócio
│
└── Connection Sankhya PROD
    ├── connectorRef = sankhya@ABC
    ├── environment = PROD
    └── credentialRef = vault/...

PROJECT Análise de Vendas
├── ProjectConnectionBinding → Sankhya PROD
├── ProjectBrainBinding → Brain@BRAIN17
├── query:vendas@Q1
└── ReleaseManifest
    ├── query:vendas@Q1
    ├── brain-binding@BB1
    └── config/connection pins
```

Nenhuma credencial está no Artifact Registry.

### Exemplo B — Mercado Livre privado do Marketplace Hub

```text
PLATFORM
└── ConnectorDefinition mercadolivre@ML5

PROJECT Marketplace Hub
├── ProjectConnection: Mercado Livre — Metal Nobre
│   ├── connectorRef = mercadolivre@ML5
│   └── credentialRef = vault/...
│
├── agent:marketplace-analyst@A3
├── job:sync-orders@J8
└── ReleaseManifest
```

A Connection não aparece automaticamente para CRM, Compras ou Análise de Vendas.

### Exemplo C — mesmo Mercado Livre compartilhado depois

Se surgir consumer real em vários Projects, a Connection pode nascer como recurso Workspace-scoped na criação apropriada:

```text
WorkspaceConnection Mercado Livre — Metal Nobre
├── binding → Marketplace Hub
├── binding → Product Intelligence
└── binding → Atendimento Marketplace
```

Isso não altera o ConnectorDefinition Platform-scoped.

F1 não precisa de `move ProjectConnection → WorkspaceConnection`; se surgir necessidade real de reparent/migration de scope, a decisão do módulo Connections define o mecanismo.

## Questões deliberadamente deixadas para fases posteriores

### 3D

- direção exata Registry ↔ specialized compiler modules;
- orchestration da publicação;
- dependency cycles a evitar.

### 3E

- tables/constraints;
- unique keys por scope/kind/slug;
- storage físico do payload;
- CAS/dedup;
- retention/archive;
- representação física de ConnectionScope.

### 3F

- `ArtifactRef` final;
- DTOs Publish/Resolve;
- errors;
- HTTP/internal contracts;
- schemas exatos dos kinds.

### 3G

- estados completos de revision publication/archive;
- stale/invalid transitions.

### Connections boundary

- creation/lifecycle de WorkspaceConnection e ProjectConnection;
- quem pode criá-las/arquivá-las;
- UX de shared versus project connection;
- regras de ProjectConnectionBinding;
- semântica de rebind/revision/environment;
- eventual migration de scope somente se surgir consumer real.

## Veredito

```text
Artifact Registry
= one immutable compiled-revision boundary

Artifact kinds
= closed union with fixed logical scope/authoring root

ConnectorDefinition
= PLATFORM artifact

Connection
= operational resource outside Registry
= WORKSPACE | PROJECT

Registry AVAILABLE
!= Release ACTIVE/SERVED
```

Esta decisão fecha 3C-06 sem criar registry genérico, ownership engine ou workflow adicional.

A próxima decisão natural é **3C-07 — Connections Module Boundary**, porque o finding que refinou 3C-06 já revelou a distinção concreta `ConnectorDefinition → PLATFORM` versus `Connection → WORKSPACE | PROJECT`, e agora falta fechar responsibility/ownership/API/dependencies/authority do módulo Connections sem reabrir C-007.