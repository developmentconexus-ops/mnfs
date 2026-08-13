# 3C-02 — Identity & Access Module Boundary

**Status:** APROVADO pelo operador  
**Fase:** 3C — Domain / Module Architecture  
**Importante:** esta decisão não constitui C-018, não encerra 3C e não autoriza implementação.

## Decisão em uma frase

No Conexus F1, **Identity & Access** é um único módulo do Hub, com duas boundaries internas conceitualmente distintas — **Identity / Authentication** e **Access / Authorization Context**. O módulo owns identidade de `Account`, autenticação e sessão, memberships, grants, role assignments e resolução de acesso por superfície. Cada domínio continua owner das operações/recursos que protege e declara as permissions necessárias; um `ALLOW` de Identity & Access nunca bypassa policies, approvals, effects, budgets, release/environment state ou outras preconditions de domínio.

## Contexto e precedência

Esta decisão materializa, sem reabrir, as seguintes autoridades anteriores:

- 3B-01: `Workspace` é a raiz soberana de tenancy apresentada ao usuário;
- 3B-10: ReBAC limitado e explícito entre `Workspace`, `Area`, `Account` e `Project`;
- 3B-11: `Area` é estrutura organizacional, não software;
- 3B-12: papel organizacional e papel técnico/operacional são independentes;
- 3B-13: autorização combina `Relationship → Role → Permission → Policy / Precondition`;
- 3B-14: `CONTROL_PLANE`, `PREVIEW` e `PUBLISHED_APP` são contextos de autorização independentes sobre a mesma `Account`;
- 3B-16: Hub/Postgres governa authority/lifecycle operacional; Project DB não é control-plane authority;
- C-015: conta central, sessão server-side, roles fechadas do app publicado e enforcement server-side;
- C-017: Hub controla identidade/authority/boundaries/gates; não criar entidade ou mecanismo sem consumidor/failure class atual;
- 3C-01: F1 é modular monolith; módulos são boundaries internas, não serviços independentes.

Nada aqui escolhe tabelas (3E), contratos TypeScript/HTTP (3F), máquina comportamental (3G) ou implementação de segurança (3I).

## Pesquisa comparativa usada para desafiar a boundary

A decisão foi confrontada com referências externas e com o acervo interno da imersão Mitra.

### Factory

A documentação pública de Factory trata Identity & Access Management como capability coerente que usa identidade, organização/projeto e settings hierárquicos para determinar quais policies se aplicam a um run. A transferência útil é a centralização da identidade/contexto de acesso sem transformar IAM no owner de toda policy operacional da plataforma.

Referências:

- `https://docs.factory.ai/enterprise/identity-and-access`
- `https://docs.factory.ai/enterprise/hierarchical-settings-and-org-control`

### Backstage

Backstage fornece o principal contraexemplo útil à centralização excessiva: plugins/domínios declaram os recursos e actions protegíveis; o permission framework/policy toma a decisão; o backend owner do recurso aplica o resultado. Isso reforça que o Conexus não deve colocar o significado de toda permission dentro de Identity & Access.

Referências:

- `https://backstage.io/docs/permissions/overview/`
- `https://backstage.io/docs/permissions/concepts/`
- `https://backstage.io/docs/auth/`

### Harness

Harness modela RBAC hierárquico em scopes de Account/Organization/Project com principals, roles e resource groups. A transferência útil é manter access relationships e assignments coerentes por scope, sem copiar resource groups, custom-role machinery ou a escala enterprise que o Conexus F1 ainda não consome.

Referência:

- `https://developer.harness.io/docs/platform/role-based-access-control/rbac-in-harness/`

### GitHub

GitHub separa permissions atômicas de roles que agrupam permissions e mantém access em scopes distintos de organização e repositório. Isso reforça roles como bundles e permissions como ações nomeadas, em vez de checks locais espalhados.

Referências:

- `https://docs.github.com/en/organizations/managing-peoples-access-to-your-organization-with-roles/roles-in-an-organization`
- `https://docs.github.com/en/organizations/managing-user-access-to-your-organizations-repositories/managing-repository-roles/repository-roles-for-an-organization`

### Mitra

O acervo extraído durante a imersão mostra separação entre plano de controle/build e runtime publicado, usuário final diferente do construtor e RBAC do app publicado. Não existe Evidence suficiente para afirmar a modularização interna do backend proprietário da Mitra, portanto ela é usada como referência de produto/boundary observável, não como prova de estrutura interna.

Referências internas:

- `docs/reference/mitra/06-runtime-publicado.md`
- `docs/conexus/pesquisa-interna-runtime-publicado.md`
- `docs/research/MITRA-INSPIRATION-MAP.md`

## Alternativas avaliadas

### Alternativa A — um módulo `Identity & Access`, duas boundaries internas

```text
Identity & Access
│
├── Identity / Authentication
│   ├── Account
│   ├── credential lifecycle
│   └── sessions
│
└── Access / Authorization Context
    ├── memberships
    ├── grants
    ├── role assignments
    └── effective access resolution
```

**Decisão:** ADOTADA para F1.

Benefícios atuais:

- uma autoridade coerente para principal/session/access relationships;
- revogação e disable não dependem de coordenação entre módulos artificiais;
- resolve access graph sem espalhar membership/grant semantics;
- preserva separação conceitual AuthN × AuthZ;
- permite extração futura se aparecer lifecycle/consumer independente;
- evita machinery de um authorization product dedicado sem consumidor atual.

### Alternativa B — `Identity` e `Authorization` como módulos independentes agora

**Decisão:** DEFER.

É uma decomposição arquitetural legítima, mas no F1 adicionaria API/dependency boundary, coordenação e lifecycle separado sem eliminar machinery atual. Não existe IdP externo como authority, SSO/SCIM ativo, authorization service independente ou processo externo que exija consumir AuthZ separadamente do Hub.

### Alternativa C — autorização distribuída entre os módulos

Exemplo rejeitado:

```text
Workspace → memberships
Project   → project grants
Release   → app access roles
Builder   → builder authorization
```

**Decisão:** REJECT para F1.

Isso produziria múltiplas interpretações para a pergunta “este principal alcança este recurso com qual role/permission?”, aumentaria risco de checks divergentes e recriaria access-control semantics em cada domínio.

## Responsabilidade do módulo

Identity & Access responde à pergunta:

> **Quem é este principal e qual autoridade de acesso ele possui sobre este recurso nesta superfície?**

Fluxo conceitual:

```text
authentication
     ↓
Principal
     ↓
relationships
     ↓
role assignment
     ↓
effective platform permissions / access context
```

A responsabilidade termina antes da autorização completa de uma operação de domínio.

Uma operação ainda pode depender de:

```text
domain precondition
approval gate
effect classification
budget
environment state
release policy
artifact eligibility
connection state
health/conformance
```

## Boundary interna 1 — Identity / Authentication

Responsabilidade:

- identidade global de `Account`;
- account lifecycle relevante à autenticação;
- credential lifecycle F1;
- autenticação;
- session lifecycle;
- session rotation/revocation;
- account enable/disable;
- resolução de sessão para principal autenticado ou estado anônimo.

A `Account` é global ao Hub. Nenhum Workspace ou Project owns a identidade da pessoa.

```text
Account: Leandro
├── Workspace: Metal Nobre
└── Workspace: Aurora
```

Logo, `Workspace` não pode ser owner de `Account` apenas porque a Account participa dele.

## Boundary interna 2 — Access / Authorization Context

Responsabilidade:

- `Account ↔ Workspace` membership;
- `Account ↔ Area` membership;
- `Area → Project` grant;
- `Account → Project` grant;
- relações de acesso do aplicativo publicado;
- role assignments nos role sets já aprovados por cada superfície/scope;
- resolução das relações aditivas;
- cálculo do contexto efetivo de acesso;
- deny-by-absence;
- separação entre `CONTROL_PLANE`, `PREVIEW` e `PUBLISHED_APP`.

Esta boundary não cria graph engine genérico. As relações permanecem concretas e limitadas ao modelo aprovado em 3B.

## Ownership detalhado

### Identity & Access owns

```text
Account identity + lifecycle relevante a auth
credentials F1
sessions
WorkspaceMembership
AreaMembership
Area → Project grants
Account → Project grants
Published App access relationships
role assignments
effective access resolution por superfície
account-wide revocation
```

Os nomes técnicos finais das estruturas persistidas pertencem a 3E.

### Workspace module owns

```text
Workspace
Area
estrutura organizacional
lifecycle dessas estruturas
```

A distinção é intencional:

```text
Workspace owns WHAT the organizational structure is.
Identity & Access owns WHO belongs/reaches it and with what access role.
```

### Project module owns

```text
Project identity/lifecycle
Project Baseline authority
Project-level product state que 3C ainda detalhará
```

Project não owns a semântica de membership/grant apenas porque o grant aponta para `ProjectId`.

## Permissions — ownership distribuído de forma controlada

Esta decisão refina a interpretação de 3B-13.

### O domínio owner da operação declara a permission necessária

Exemplos conceituais já existentes:

```text
Project
→ project.read

Builder
→ change.create
→ builder.dispatch

Release / Deployment
→ release.approve
→ release.promote

Identity & Access
→ project.access.manage
```

A lista não é catálogo final e não é congelada aqui.

### Identity & Access não inventa as operações dos outros domínios

O módulo pode resolver role bundles/effective platform permissions, mas a existência e o significado da operação protegida pertencem ao módulo que owns essa operação.

Isso evita transformar Identity & Access em um catálogo universal de regras de domínio.

### Termo semântico

3C usa **effective permissions** como termo semântico para permissions derivadas server-side. A decisão sobre o nome exato de campo/DTO — por exemplo, se `ViewerContext.capabilities` será renomeado para `effectivePermissions` — permanece para 3F. Nenhuma compatibilidade de contrato é decidida aqui.

## Três superfícies independentes

Identity & Access preserva:

```text
Account
  │
  ├── CONTROL_PLANE
  ├── PREVIEW
  └── PUBLISHED_APP
```

### Control Plane

Usa relationships/roles/permissions aprovadas em 3B-10..3B-13.

### Preview

Preview pertence ao Control Plane. Não nasce uma terceira árvore de memberships/roles apenas para Preview.

Conceitualmente:

```text
Control Plane access
+
preview-specific permission/precondition
→ acesso ao RunPreview
```

Preview nunca reutiliza implicitamente Published App membership.

### Published App

Published App access permanece independente do Control Plane.

```text
PROJECT_ADMIN
-X-> app admin automático

app member
-X-> Builder access automático
```

Identity & Access resolve a Account, sessão, relações e roles do app. O Capability Gateway e os módulos de domínio continuam responsáveis por aplicar a policy completa da capability/operação.

## Public internal API sem congelar 3F

3C congela somente capacidades semânticas da boundary. Signatures TypeScript, DTOs, erros concretos e HTTP ficam para 3F.

A API interna pública deve suportar semanticamente operações equivalentes a:

```text
resolvePrincipal
resolveAccessContext
authorizePlatformPermission

manageAccount
manageSession
manageWorkspaceMembership
manageAreaMembership
manageProjectGrant
managePublishedAppAccess
```

Os nomes acima são descritivos, não signatures congeladas.

## O que NÃO construir como API F1

```text
grant(subject, relation, object)
createPolicyExpression(...)
evaluateGenericRelationshipGraph(...)
GenericPrincipal
GenericResourceAuthorizationEngine
Policy DSL
custom-role builder
individual permission grants
```

O modelo aprovado é concreto. A existência de sistemas como OpenFGA/Zanzibar ou resource-group engines enterprise não cria consumidor para machinery equivalente no Conexus F1.

## Consumers

Consumers naturais da public internal API incluem, conforme suas operações reais:

```text
Workspace
Project
Builder
Artifact Registry
Connections
Capability Gateway
Brain
Production Agent Runtime
Release / Deployment
Storage
```

Observability pode observar decisões/eventos de acesso, mas não é source de authorization truth.

A existência de muitos consumers não autoriza importação dos internals do módulo.

## Allowed dependencies — intenção de 3C

A direção exata do grafo será fechada em 3D, mas esta decisão impõe as seguintes intenções:

- Identity & Access pode operar sobre IDs estáveis/opaques como `WorkspaceId`, `AreaId` e `ProjectId` sem possuir os recursos correspondentes;
- validação de lifecycle/existência do recurso pode ser orquestrada pela operação de aplicação ou pela public API do módulo owner; não autoriza ciclo estrutural;
- primitivas técnicas comuns inevitáveis não devem virar domínio genérico apenas para satisfazer esta boundary;
- o módulo não precisa navegar internals de Workspace/Project para resolver suas relações persistidas.

## Forbidden dependencies / access

Identity & Access não pode usar como authority própria:

```text
Builder internals
Project business database
Artifact Registry internals
Brain content
Connection credentials
Release mutable internals
Observability logs
sandbox state
worker/session transcript
```

E consumers não podem fazer:

```text
Project -> SELECT direto nas tabelas internas de Identity & Access
Builder -> SELECT direto nas tabelas internas de Identity & Access
Gateway -> SELECT direto nas tabelas internas de Identity & Access
```

O fato de módulos compartilharem fisicamente `hub_control` não elimina a boundary do modular monolith.

## Authority boundary

Regra normativa:

> **Um `ALLOW` de Identity & Access significa apenas que o principal possui a relação/role/permission de plataforma necessária naquela superfície. Ele não é autoridade suficiente para bypassar domain invariants, approval gates, effect authority, budgets, environment conformance, release policy, capability policy, connection state ou qualquer outra precondition pertencente ao domínio que executa a operação.**

Consequência:

```text
I&A DENY
→ operação negada

I&A ALLOW
→ continuar avaliação das demais preconditions
```

Nunca:

```text
I&A ALLOW
→ executar incondicionalmente
```

## Interactions / events relevantes

Sem congelar event schema:

### Account disabled

```text
Account DISABLED
→ sessões deixam de autorizar
→ novas resoluções em todas as superfícies resultam em deny
```

C-015 continua sendo a precedência para revogação de sessões.

### Membership/grant alterado

```text
relationship change
→ próximas decisões usam a nova authority
```

Caching/invalidation técnica fica para fases posteriores.

### Published App execution

```text
request
→ I&A resolve principal + app access context
→ Capability Gateway/domínio avalia policy completa
→ execução ou deny
```

### Audit/observability

```text
access decision
→ pode produzir agent_event/audit observation
```

Mas:

```text
observability
-X-> authorization authority
```

## Por que merece existir como módulo separado

Existem consumidores e classes de falha atuais suficientes:

1. `Account` é global e cross-Workspace, portanto não pertence naturalmente a Workspace ou Project;
2. sessões e disable precisam ter semântica única no Hub;
3. relationships/grants atravessam Workspace, Area, Project e Published App;
4. duplicar resolution logic em módulos distintos criaria decisões inconsistentes;
5. Control Plane, Preview e Published App precisam permanecer logicamente independentes sobre a mesma identidade;
6. quase todos os módulos consomem access decisions, mas nenhum deles deve se tornar owner da identidade global.

Logo, esta boundary elimina uma classe concreta de duplicação/inconsistência e possui consumidores atuais.

## Por que Identity e Authorization NÃO são dois módulos F1

A separação conceitual é real e fica explícita internamente. A separação modular ainda não apresenta benefício material suficiente.

Estado F1 atual:

```text
uma Account authority
uma sessão central do Hub
um backend implantável
um mecanismo inicial de autenticação
revogação coordenada
sem SSO/SCIM como authority externa
sem authorization service independente
sem processo externo consumidor de AuthZ
```

Dois módulos agora acrescentariam principalmente boundary/API/coordenação.

## Gatilhos para reavaliar `Identity` × `Authorization`

A divisão retorna ao Decision Loop se surgir pelo menos um consumidor/boundary material, por exemplo:

- IdP/SSO/SCIM passa a ser authority de identidade com lifecycle independente;
- machine/service identities tornam-se materialmente diferentes das Accounts humanas;
- authorization precisa de processo, disponibilidade, escala ou deployment lifecycle próprio;
- um authorization substrate externo real for qualificado/adotado;
- outro processo/service precisa consumir authorization independentemente do Hub;
- Identity e Authorization passam a possuir dependências incompatíveis ou evolução materialmente independente;
- o módulo deixa de poder manter uma public internal API estreita sem acoplamento indevido.

A extração futura deve reutilizar a boundary sem reescrever domain history.

## Não owns

Identity & Access explicitamente NÃO owns:

```text
Workspace/Area lifecycle
Project lifecycle
Project Baseline
Change / Plan / Work Unit / ActorRun
RigorProfile
artifact definitions/revisions
artifact effects
approvalFloor
agentEligible
Connection credentials
Brain knowledge
business data
business data audience rules
row/field filters de domínio
Release/Promotion lifecycle
EnvironmentConformance
budgets de outros domínios
Finding/Evidence verdicts
attachment/blob lifecycle
telemetry truth
```

A identidade do usuário pode ser input para uma policy de domínio, mas isso não transfere ownership da policy para Identity & Access.

## Relação com os findings encaminhados de 3B

### F3B-R2 — Plan schema legado

Sem impacto. Continua owner 3C/3F no contexto do Builder; Identity & Access não reutiliza Mission/Milestone/Feature.

### F3B-R3 — Registry scope

Sem resolução aqui. Registry multi-scope continua decisão própria de 3C/3E/3F.

### N3 — Planning Depth × RigorProfile

Sem resolução aqui. Identity & Access fornece authority/access context; planning depth e rigor continuam eixos do Builder/3G.

### N4 — Architecture Reconciliation

Permanece transversal até C-018.

## Invariantes aprovadas

1. F1 possui um módulo `Identity & Access`, não dois módulos AuthN/AuthZ independentes.
2. AuthN e AuthZ permanecem boundaries conceitualmente distintas dentro do módulo.
3. `Account` é identidade global do Hub, não recurso owned por Workspace/Project.
4. Identity & Access owns autenticação, sessão, memberships, grants, role assignments e access-context resolution.
5. Workspace owns `Workspace`/`Area`; Project owns `Project`; apontar para o ID não transfere ownership.
6. `CONTROL_PLANE`, `PREVIEW` e `PUBLISHED_APP` permanecem contextos independentes.
7. Preview reutiliza authority do Control Plane; não ganha membership tree própria no F1.
8. Project Control roles não implicam Published App roles e vice-versa.
9. Cada domínio owns a operação/recurso que protege e declara a permission necessária.
10. Identity & Access não owns domain policy completa.
11. `I&A DENY` é deny; `I&A ALLOW` apenas permite continuar a avaliação das demais preconditions.
12. Consumers usam a public internal API e não leem internals/tabelas diretamente.
13. Compartilhar `hub_control` fisicamente não remove module ownership.
14. Observability nunca é authorization authority.
15. F1 não ganha FGA engine, Policy DSL, custom roles ou generic relationship graph.
16. Separar Identity/AuthZ em módulos só volta à decisão sob consumidor/lifecycle independente real.

## Não construir no F1 por esta decisão

- módulo `Identity` separado;
- módulo `Authorization` separado;
- OpenFGA/Cedar/OPA/Zanzibar-like engine próprio;
- graph authorization genérico;
- Policy DSL;
- custom-role builder;
- grants individuais de permissions;
- Preview membership model independente;
- role checks espalhados como segunda authority;
- acesso cross-module direto às tabelas de I&A;
- policy baseada em telemetria como authority;
- service/process de IAM separado do Hub.

## Deixado para fases posteriores

- 3D: direção exata das dependências e prevenção mecânica de ciclos;
- 3E: tabelas, FKs, índices, uniqueness e storage ownership concreto;
- 3F: signatures, DTOs, contracts, erro semântico e nome final de `effectivePermissions` no viewer/access context;
- 3G: estados/lifecycle detalhados de Account/session/grant onde material;
- 3I: enforcement security, CSRF/session details, privilege changes, self-grant, cache/invalidation e threat boundaries;
- 3J: bind/TLS/deployment implications;
- futuro sob trigger: SSO, SCIM, passkeys, external IdP, service identities e authorization substrate externo.

## Consequência

Os próximos módulos de 3C podem assumir uma boundary estável para principal/access sem replicar IAM. Ao mesmo tempo, cada domínio continua owner da sua semântica operacional: **Identity & Access determina quem alcança; o domínio/Gateway determina se a operação completa pode acontecer agora.**
