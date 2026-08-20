# 3C-07 — Connections Module Boundary

**Status:** APROVADO pelo operador  
**Fase:** 3C — Domain / Module Architecture  
**Importante:** esta decisão não constitui C-018, não encerra 3C e não autoriza implementação.

## Decisão em uma frase

No Conexus F1, **`Connections` é o módulo que owns as instâncias concretas de acesso a sistemas externos**. Existe um único conceito `Connection`, com ownership scope fechado `WORKSPACE | PROJECT`; o provider não determina o scope. Uma `Connection` possui identidade estável e revisões imutáveis de sua configuração não secreta, cada revisão pinando uma `ConnectorDefinition` exata da Platform e um target/environment externo concreto. Material secreto permanece atrás de um `CredentialHandle` opaco e de um credential backend substituível; rotação técnica, refresh ou recriptografia do mesmo grant não criam `ConnectionRevision` nem Release. Connections owns qualification e health semantics, mas external I/O, secret resolution e effect enforcement permanecem fora do módulo. `ProjectConnectionBinding` continua sendo a decisão explícita de um Project consumir determinada `ConnectionRevision`; Workspace ownership nunca implica uso automático.

As invariantes centrais são:

```text
ConnectorDefinition
!=
Connection
!=
ProjectConnectionBinding

Connection qualified
!=
Project authorized to use it

Connection healthy
!=
operation permitted

secret rotation / token refresh
!=
ConnectionRevision
```

## Contexto e precedência

Esta decisão materializa e refina, sem reabrir fora do finding aprovado, as seguintes autoridades anteriores:

- C-004/C-008/C-016: credenciais duráveis não entram no guest/sandbox; egress e efeitos são governados;
- C-005: `integration` é artifact versionado e imutável; Registry não é authoring;
- C-007: Connector/Connection/CredentialRef/qualification foram separados semanticamente; Connection é operacional no `hub_control`;
- C-010: agentes e apps consomem operações classificadas; secret material não é dado ao LLM;
- C-011: significado empresarial/semântico de sistemas externos pertence ao Brain, não à Connection;
- C-014: ReleaseManifest pina Connection/config bindings e EnvironmentConformance mede a revisão efetiva; secret material fica fora da identidade de Release;
- 3B-15: Workspace resources podem ser consumidos por Project apenas por binding explícito;
- 3B-17: reuse entre Projects é explícito, nunca implícito;
- 3C-03: Workspace scope não transforma tudo em implementação do Workspace module;
- 3C-04: Project owns `ProjectConnectionBinding`, enquanto Connections owns Connection identity/revision/qualification;
- 3C-06: `integration` no Artifact Registry significa `ConnectorDefinition / connector/v1` Platform-scoped; `Connection` concreta não é artifact e admite scope `WORKSPACE | PROJECT`.

Nada aqui escolhe tabelas/FKs físicas (3E), DTOs/signatures/HTTP (3F), FSM completa (3G), runtime físico do Gateway (3H/3I) ou backend concreto de secret storage (3I/3J).

## Finding material que refinou C-007

A formulação original de C-007 falava em Connection "por empresa/ambiente" e configuração por Project. A revisão de 3C mostrou que isso não cobre corretamente dois casos reais:

```text
Metal Nobre — Sankhya PROD
→ capacidade organizacional
→ vários Projects podem usar
→ continua existindo se um Project for removido
→ ownership natural: WORKSPACE
```

versus:

```text
Marketplace Hub — Mercado Livre
→ dependência potencialmente exclusiva daquele software
→ não precisa ser compartilhada no Workspace
→ pode perder razão de existir se o Project for removido
→ ownership natural: PROJECT
```

A correção aprovada é:

```text
ConnectorDefinition
→ COMO falar com uma classe de sistema externo
→ PLATFORM / Artifact Registry

Connection
→ QUAL target/account/environment real está conectado
→ WORKSPACE | PROJECT / Connections

ProjectConnectionBinding
→ COMO este Project escolheu consumir uma ConnectionRevision
→ Project module
```

O provider não codifica o scope. Uma Connection Mercado Livre pode ser Workspace-scoped se vários Projects compartilham a mesma conta; uma Connection Sankhya pode ser Project-scoped em um caso experimental isolado.

## Pesquisa comparativa usada para desafiar a boundary

A pesquisa foi usada para extrair forma, não para copiar machinery de terceiros.

### Mitra

O acervo Mitra separa blueprint/template de integração, conexão nomeada e credencial server-side. Uma Server Function de integração referencia a Connection por handle simbólico; o repo e o cliente não recebem o segredo. Também foi observado que o `testEndpoint` real é incompleto e que provar ambiente/credencial pode cair indevidamente no agente quando a plataforma não torna qualification obrigatória.

Transferências úteis:

```text
connection handle server-side
!=
credential material

artifact de integração
!=
connection concreta
```

Referências internas:

- `docs/reference/mitra/04-integracao-externa.md`
- `docs/research/MITRA-INSPIRATION-MAP.md`

### Harness

Harness permite Connectors em múltiplos scopes hierárquicos, inclusive Organization e Project. Um connector de escopo superior pode ser reutilizado por Projects; um connector Project-scoped permanece específico daquele Project.

Transferência útil para Conexus:

```text
shared organizational connection
vs
project-private connection
```

O Conexus deliberadamente não copia herança automática nem uma hierarquia Account/Org/Project genérica: Workspace Connection só é consumida por Project através de binding explícito.

Referência:

- `https://developer.harness.io/3k-docs/platform/getting-started/connectors/`

### Nango

Nango diferencia provider/integration configuration de Connections reais e suporta connections associadas a users ou organizations, além de múltiplas Connections para a mesma API. O lifecycle operacional inclui armazenamento/refresh de credentials e detecção de falhas de autorização.

Transferência útil:

```text
provider type
!=
connection owner scope
```

User-level Connection é trigger futuro útil, mas não consumidor F1 do Conexus.

Referência:

- `https://docs.nango.dev/guides`

### Factory

Factory administra integrações/MCPs permitidos em nível organizacional e permite que Projects habilitem/configurem subconjuntos. Não é o mesmo domain model de Connection, mas reforça a separação entre catálogo/allowance superior e uso concreto local.

Referência:

- `https://docs.factory.ai/enterprise/models-llm-gateways-and-integrations`

### Airbyte

Airbyte separa connector definition da Source concreta configurada em um Workspace. O nome `Connection` no Airbyte significa pipeline Source→Destination e, portanto, não é transferido semanticamente.

Transferência útil:

```text
connector definition
!=
configured instance
```

Referências:

- `https://reference.airbyte.com/reference/createsource`
- `https://reference.airbyte.com/reference/createconnection`

## Alternativas avaliadas

### Alternativa A — um conceito `Connection` com scope fechado

```text
Connection
├── ownerScope = WORKSPACE | PROJECT
├── stable identity
├── revisions
├── credential handle relation
├── qualification
└── health
```

**Decisão:** ADOTADA para F1.

Benefícios:

- um só lifecycle;
- uma só semantics de qualification/health;
- uma só integração com credential backend;
- suporta compartilhamento organizacional e isolamento privado já comprovados por casos reais;
- evita duplicar aggregate/service/repository para WorkspaceConnection e ProjectConnection;
- provider não codifica política de ownership;
- preserva binding explícito do Project.

### Alternativa B — `WorkspaceConnection` e `ProjectConnection` como tipos/aggregates separados

**Decisão:** REJECT.

Ambos precisariam da mesma machinery de:

- connector revision pinning;
- target/environment;
- credential lifecycle;
- qualification;
- health;
- sanitized error/status;
- binding/release integration.

A diferença real é ownership scope, não comportamento suficiente para justificar dois domínios.

### Alternativa C — Connection sempre Workspace-scoped

**Decisão:** REJECT.

Poluiria o Workspace com dependências privadas de software e aumentaria superfície de descoberta/administração sem benefício.

### Alternativa D — Connection sempre Project-scoped

**Decisão:** REJECT.

Duplicaria ERP/Google/etc. compartilhados e criaria drift de configuração/credenciais entre Projects.

### Alternativa E — provider determina scope

Exemplo rejeitado:

```text
Sankhya      → sempre WORKSPACE
MercadoLivre → sempre PROJECT
```

**Decisão:** REJECT.

Scope segue ownership, reuse e lifecycle reais da conexão, não o fornecedor.

### Alternativa F — generic resource/scope engine

Exemplo rejeitado:

```text
ConnectionScope = arbitrary resource type
inheritance rules
selected-project ACL engine
scope transfer
nested ownership
```

**Decisão:** REJECT para F1.

Somente `WORKSPACE | PROJECT` possuem consumidor real agora.

## Responsabilidade do módulo

Connections responde à pergunta:

> **Qual sistema/conta/ambiente externo concreto existe como recurso do Conexus, qual configuração não secreta/revisão o define, com qual grant de credencial ele se relaciona, e temos prova operacional suficiente de que essa configuração funciona?**

Forma conceitual:

```text
Artifact Registry
└── ConnectorDefinition @ digest
          │
          ▼
Connections
└── Connection
    ├── owner scope
    ├── stable identity
    ├── ConnectionRevision R1
    ├── ConnectionRevision R2
    ├── CredentialHandle relation
    ├── Qualification records
    └── Health projection
          │
          ▼
ProjectConnectionBinding
          │
          ▼
Release / Deployment
          │
          ▼
Capability Gateway
```

## Um único conceito `Connection`

F1 possui um único domain concept:

```text
Connection
```

com ownership scope fechado:

```text
WORKSPACE
PROJECT
```

Conceitualmente:

```text
Connection
├── connectionId
├── ownerScope
├── ownerId
├── human name
└── revisions
```

A forma física não é congelada aqui.

Invariantes:

- `ownerScope = WORKSPACE` exige Workspace válido;
- `ownerScope = PROJECT` exige Project válido e seu Workspace correspondente;
- provider não pode alterar ownerScope;
- ausência de binding impede Project de consumir Workspace Connection;
- cross-Workspace use é proibido no F1;
- uma Project Connection não é implicitamente reutilizável por sibling Projects.

## Regra prática de escolha do scope

Heurística aprovada:

> **Se este Project desaparecer amanhã, a Connection ainda faz sentido existir?**

Se sim e ela representa capacidade organizacional reutilizável, tende a `WORKSPACE`.

Se não e ela é dependência privada daquele software, tende a `PROJECT`.

É uma heurística de produto/administração, não uma inferência automática de authority. O operador/fluxo de criação escolhe o scope permitido; o Hub valida invariantes.

## Connection identity versus ConnectionRevision

`Connection` tem identidade estável ao longo do tempo.

`ConnectionRevision` representa uma configuração semanticamente exata e imutável dessa conexão.

Exemplo:

```text
Connection: Metal Nobre — Sankhya PROD
├── R1 → sankhya@A + endpoint/config X
└── R2 → sankhya@B + endpoint/config Y
```

Isso permite:

```text
Project A → pin R1
Project B → pin R2
```

sem alteração silenciosa de todos os consumidores de uma Workspace Connection.

A revisão se paga porque já existem consumidores concretos do pin:

- `ProjectConnectionBinding`;
- `ReleaseManifest` / config binding;
- EnvironmentConformance.

## O que pertence a `ConnectionRevision`

Semanticamente, uma revisão contém configuração **não secreta** que altera o alvo ou significado operacional da conexão, incluindo informação equivalente a:

```text
exact ConnectorDefinition revision/digest
external target identity
environment
endpoint/base URL quando aplicável
tenant/account/domain configuration não secreta
connector-specific non-secret configuration
expected auth/config shape relationship
```

Detalhes de schema final ficam para 3E/3F.

## Uma Connection representa um target/environment concreto

F1 prefere Connections separadas por target/environment real:

```text
Sankhya HOMOLOG
Sankhya PROD
```

em vez de:

```text
Sankhya
├── HOMOLOG credential
└── PROD credential
```

Razões:

- credentials podem ser diferentes;
- target/base URL pode ser diferente;
- qualification é independente;
- blast radius é diferente;
- Release binding fica explícito;
- auditoria fica mais simples.

A taxonomia final de environments do sistema externo fica no contrato da Connection/Connector; esta decisão congela apenas que uma ConnectionRevision aponta para um target/environment concreto, não uma coleção mutável de ambientes.

## Credencial: relação opaca, não material do domínio

Connections owns a **relação com um credential grant/handle**, não os bytes secretos.

Forma conceitual:

```text
Connection
    │
    ▼
CredentialHandle
    │
    ▼
credential backend
    │
    └── secret material
```

Secret material inclui, quando aplicável:

- password;
- client secret;
- refresh token;
- API key;
- private key;
- tokens transitórios.

Nunca entra em:

- Git;
- Artifact Registry payload;
- ConnectionRevision legível;
- ReleaseManifest;
- Pi/E2B Actor Pack;
- browser.

## Finding 3C-07-A — qualification não depende de `key_version` criptográfica

C-007 ligava o resultado de validação a `(revision, environment, key_version)`.

3C-07 refina essa semântica porque `key_version` do vault é detalhe de criptografia/custódia e pode mudar sem alterar a autorização externa real.

Exemplo:

```text
mesmo client_secret
ciphertext re-encriptado
K1 → K2
```

não deve transformar a Connection semanticamente em não qualificada.

Da mesma forma, refresh/reacquisition de token transitório pode ocorrer sem mudar o grant lógico.

A identidade conceitual da Qualification passa a ser ligada a informação equivalente a:

```text
ConnectionRevision
+
ConnectorDefinitionRevision
+
CredentialBinding/Grant Version
+
External Target
```

onde `CredentialBinding/Grant Version` muda quando o **grant lógico/material autorizado relevante muda**, não quando o backend apenas rotaciona criptografia, renova access token transitório ou reencapsula o mesmo secret.

Nome e forma técnica final ficam para 3E/3F/3I.

## Credential replacement, revoke e refresh

Connections owns a semântica de que a Connection passou a referenciar outro grant/credential binding e deve ser requalificada quando materialmente necessário.

O credential backend owns:

- encryption;
- key rotation;
- storage format;
- token material;
- secret version storage;
- provider/KMS implementation.

Regras:

```text
new logical credential/grant
→ may invalidate qualification

vault re-encryption only
→ does not create ConnectionRevision
→ does not create Release

access-token refresh/reacquisition
→ does not create ConnectionRevision
→ does not create Release
```

Revogação de grant torna uso inelegível/fail-closed mesmo se a ConnectionRevision continuar existindo.

## Qualification: uma operação semântica, não três gates cerimoniais

C-007 distinguia `testConnection` e live smoke. 3C-07 simplifica isso no nível de domínio para uma única capability:

```text
qualify ConnectionRevision
```

Ela deve produzir evidência suficiente, proporcional ao Connector, para responder pelo menos:

```text
credential/grant funciona?
target alcançado é o esperado?
environment é o esperado?
tenant/account resolvido é aceitável?
capability mínima requerida funciona?
prova é não-mutante?
```

O Connector/Gateway pode precisar de uma, duas ou várias probes concretas. Isso não cria estados/gates de domínio separados.

Invariante:

```text
implementation probe count
!=
domain workflow step count
```

Qualification retorna resultado tipado equivalente a:

```text
PASS
FAIL
```

com evidence/sanitized diagnostics suficientes; forma final em 3F/3G.

## Qualification deve ser independente do agente que criou/configurou

LLM/Builder pode:

- propor Connection config;
- auxiliar setup;
- interpretar erro sanitizado;
- sugerir correção.

Mas não pode declarar:

```text
"testei e está funcionando"
```

como authority.

Qualification é determinada pelo Hub através do caminho controlado de execução.

## Quem realiza external I/O da Qualification

Connections owns **o significado e o resultado de qualification**, mas não abre socket arbitrário nem recebe segredo em plaintext para executar provider calls.

Fluxo conceitual:

```text
Connections
     │
     │ request qualification
     ▼
Artifact Registry
     │ exact ConnectorDefinition
     ▼
Capability Gateway
     ├── resolve credential handle
     ├── enforce host/network policy
     ├── apply auth strategy
     ├── execute non-mutating probe(s)
     └── sanitize result
     │
     ▼
Connections
     └── records Qualification
```

Regra:

```text
Connections owns qualification semantics.
Gateway owns controlled external execution.
Credential infrastructure owns secret material.
```

## Health: observação operacional, não revisionamento

Qualification e health são conceitos distintos.

```text
Qualification
→ "esta revisão/grant foi provada funcional em determinado momento/contexto"

Health
→ "o que observações recentes indicam sobre a capacidade de usar essa Connection agora"
```

Exemplo:

```text
10:00 Qualification PASS
13:00 credential revoked externally
13:05 runtime receives 401
```

A ConnectionRevision não muda.

Health pode se degradar com base em observações operacionais.

F1 não exige daemon/polling constante. Sinais suficientes podem vir de:

- qualification;
- explicit requalification;
- runtime successes/failures;
- authorization/credential failures observados.

Scheduled proactive probes são trigger futuro quando SLO/escala exigir.

## Health não é authority de autorização

Mesmo `HEALTHY` não autoriza operação.

```text
HEALTHY
!=
allowed
```

Authorization/effects permanecem em Identity & Access + Capability Gateway + domain policies.

Da mesma forma, telemetry/health não reduz approval floor nem bypassa Release binding.

## ProjectConnectionBinding

3C-04 já congela que Project owns:

```text
ProjectConnectionBinding
```

Ele responde:

> **Como ESTE Project escolheu consumir ESTA Connection/revision/environment para determinada finalidade?**

Uma Workspace Connection não é herdada automaticamente:

```text
Workspace: Metal Nobre
└── Sankhya PROD
      ├── binding → Compras
      ├── binding → BI Comercial
      └── binding → CRM

RH
-X-> no binding
```

Ausência de binding = ausência de consumo autorizado/configurado por aquele Project, independentemente de membership comum no Workspace.

## Project-scoped Connection também preserva binding semantics

Mesmo quando `ownerScope = PROJECT`, semanticamente continuam distintas as perguntas:

```text
Connection exists?
```

versus:

```text
this software/release is configured to use it for purpose X?
```

Portanto `ProjectConnectionBinding` permanece boundary semântica.

Isso **não obriga** duas tabelas/rows físicas em 3E. A realização pode ser simplificada se invariantes permanecerem observáveis.

## Binding, Qualification e Release são gates independentes

```text
ConnectionRevision exists
        │
        ├── qualification PASS?
        │
        ├── Project binding exists?
        │
        └── Release pins exact binding/revision?
```

Nenhum substitui o outro.

Consequências:

```text
qualified but not bound
→ Project cannot use

bound but unqualified/stale qualification
→ promotion/runtime eligibility may fail closed per later contracts

available new ConnectionRevision
→ no Project changes automatically

credential revoked
→ use fails closed even if Release still references same revision
```

A FSM/policies exatas ficam em 3G/3I.

## Relação com Release / EnvironmentConformance

C-014 exige que o alvo real esteja conforme com a Connection revision pinada no Release/config binding.

3C-07 preserva:

```text
ConnectionRevision pin
→ parte da configuração funcional versionada

secret material / token refresh
→ fora da Release identity
```

Logo:

- mudar endpoint/target/ConnectorDefinition/config semântico → nova ConnectionRevision e pode tornar candidate stale;
- trocar apenas secret material do mesmo slot/grant conforme política → não cria Release;
- ConnectorDefinition nova disponível → não atualiza Connection/Project automaticamente;
- Project decide mover para revisão nova por binding/config/release posterior.

## Relação com Brain

Connections não owns significado empresarial do sistema conectado.

Exemplo:

```text
Connection: Metal Nobre — Sankhya PROD
→ como alcançar o sistema real

Brain: Metal Nobre
→ o que TGFCAB/TGFITE/TOPs/margem/etc. significam
```

Invariante:

```text
reachability/authentication knowledge
→ Connections / ConnectorDefinition

business/semantic knowledge
→ Brain
```

Isso evita transformar Connection em catálogo de schema/ERP semantics.

## Relação com Builder / Pi / E2B

Builder/Pi/E2B nunca recebem credential material durável.

Fluxo:

```text
Pi / E2B
   │
   │ authorized capability request
   ▼
Capability Gateway
   │
   ├── ConnectionRevision
   ├── CredentialHandle
   └── policy/effect enforcement
   │
   ▼
external system
```

Pi pode receber apenas informação necessária e sanitizada sobre Connection identity/capabilities/errors dentro da authority concedida.

## O que Connections owns

O módulo owns semanticamente:

```text
Connection stable identity
owner scope: WORKSPACE | PROJECT
owner relationship/lifecycle
ConnectionRevision semantics
exact ConnectorDefinition revision binding
external target/environment identity
non-secret connection configuration
CredentialHandle / logical grant relationship
credential replace/revoke relationship semantics
Qualification meaning/results
Health interpretation/projection
sanitized operational status/last failure
facts needed to determine Connection eligibility
```

## O que Connections explicitamente NÃO owns

### ConnectorDefinition source/revision

```text
ConnectorDefinition
→ Artifact Registry + connector contract semantics
```

Connections apenas pina uma revisão exata.

### Secret bytes / encryption

```text
secret material
vault crypto
KMS
refresh token bytes
private keys
```

→ credential backend / security infrastructure.

### External effect execution

```text
HTTP/JDBC/API execution
host enforcement
redirect/DNS/egress policy
effect budget
idempotency execution protocol
```

→ Capability Gateway/runtime owners.

### Project intent

```text
ProjectConnectionBinding
```

→ Project module.

### Release / serving

```text
ReleaseManifest
promotion
active environment composition
```

→ Release / Deployment.

### Business semantics

```text
ERP tables
business rules
metrics
glossary
```

→ Brain.

### Telemetry store

Connection may expose semantic health/status, but raw event/timeline storage belongs to Observability.

## Semantic public operations — sem congelar 3F

O módulo precisa suportar semanticamente operações equivalentes a:

```text
create Connection
inspect Connection
create/revise non-secret Connection configuration
replace/revoke credential binding
request Qualification
record Qualification result
requalify
inspect current health/status
record relevant sanitized runtime health signal
retire Connection
```

E consultas necessárias para:

```text
Project validates binding eligibility
Release resolves exact ConnectionRevision
Gateway resolves authorized execution context
```

Signatures/DTOs/HTTP ficam para 3F.

## Dependências permitidas — intenção de 3C

Connections pode consumir boundaries estreitas de:

```text
Workspace / Project identity validation
Artifact Registry → exact ConnectorDefinition revision
Identity & Access → caller authorization context
Credential backend → opaque credential/grant handle lifecycle
Capability Gateway → qualification execution
Observability → event recording/health signals
```

A direção exata do grafo será congelada em 3D.

Regra:

```text
Connections may coordinate specialized owners.
Connections must not absorb their authority.
```

## Dependências proibidas / boundary violations

F1 proíbe:

- Connection armazenar credential plaintext;
- worker/LLM receber durable secret;
- provider determinar ownerScope;
- Workspace Connection ficar automaticamente disponível para todos os Projects;
- Project Connection ser referenciada por sibling Project;
- cross-Workspace binding;
- Connection auto-upgrade para latest ConnectorDefinition;
- Connector `main` alterar consumidores existentes;
- qualification baseada apenas em declaração do agente;
- health telemetry virar autorização;
- vault `key_version` criptográfica ser tratada como identidade de negócio da Qualification;
- token refresh gerar ConnectionRevision/Release;
- Connections executar effects arbitrários diretamente;
- Connections acumular business semantics do ERP;
- generic connection policy DSL.

## Anti-overengineering / minimal sufficient model

A implementação F1 deve começar com o menor modelo que preserve as invariantes:

```text
Connection
ConnectionRevision
CredentialHandle relation
Qualification
Health/status projection
```

mais `ProjectConnectionBinding` já owned pelo Project.

Não serão introduzidos sem trigger real:

```text
WorkspaceConnection class
ProjectConnection class
Area Connection
Account/User Connection
cross-Workspace Connection
scope inheritance engine
selected-project ACL engine além do binding
Connection scope transfer/move
generic ConnectionGroup
shared Credential aggregate de negócio
credential marketplace
Connection aliases
automatic provider→scope mapping
mandatory periodic health polling
generic OAuth broker abstraction
connection policy DSL
```

## Por que `Account/User Connection` fica fora

Produtos como Nango mostram valor de user-level connection para OAuth delegado/account linking.

Esse consumidor ainda não existe no F1.

Trigger de reabertura:

> primeiro fluxo em que um usuário final precisa conectar sua própria conta externa com consentimento/delegação independente do Workspace/Project.

Até lá:

```text
ConnectionScope = WORKSPACE | PROJECT
```

permanece união fechada.

## Por que não existe `move Connection to Workspace`

Se uma Project Connection passa a ter consumidores organizacionais, F1 prefere operação explícita e auditável:

```text
create new Workspace Connection
→ qualify
→ create/update Project bindings
→ validate Release candidates
→ retire old Project Connection when safe
```

em vez de:

```text
promoteScope(connection)
```

Isso evita semântica de ownership transfer, ACL migration, hidden consumer expansion e rollback de scope sem consumidor atual que justifique a complexidade.

## Exemplo completo — Sankhya corporativo

```text
Platform
└── ConnectorDefinition: sankhya@digest-A

Workspace: Metal Nobre
└── Connection: "Sankhya PROD"
    ownerScope = WORKSPACE
    └── R1
        ├── connector = sankhya@digest-A
        ├── environment = PROD
        ├── target = production endpoint
        └── credentialHandle = grant-42
            │
            ▼
       qualify
            │
            ▼
       Gateway → Sankhya
            │
            ▼
       Qualification PASS

Projects:
├── Compras
│   └── ERP_PROD → Connection R1
├── BI Comercial
│   └── ERP_PROD → Connection R1
└── CRM
    └── ERP_PROD → Connection R1

RH
└── no binding
```

Se `BI Comercial` for removido, a Connection continua existindo porque seu lifecycle é do Workspace.

## Exemplo completo — Mercado Livre privado

```text
Platform
└── ConnectorDefinition: mercadolivre@digest-X

Project: Marketplace Hub
└── Connection: "Mercado Livre — Metal Nobre"
    ownerScope = PROJECT
    └── R1
        ├── connector = mercadolivre@digest-X
        ├── target/account = account A
        └── credentialHandle = grant-99
            │
            ▼
       Qualification PASS

ProjectConnectionBinding
MARKETPLACE_PRIMARY → R1
```

Sibling Projects não enxergam/consomem essa Connection por pertencerem ao mesmo Workspace.

Se no futuro vários Projects precisarem da mesma conta, cria-se uma nova Workspace Connection explicitamente; F1 não move scope in-place.

## Consequências positivas

- resolve o caso real Workspace ERP × Project marketplace sem provider hardcode;
- evita duplicação de Connection por Project para recursos corporativos;
- evita poluir Workspace com dependências privadas;
- preserva pinning e rollout independente por Project;
- separa secrets de configuration identity;
- permite rotação/refresh sem Release desnecessária;
- mantém qualification mecânica e simples;
- mantém Gateway como único caminho de I/O/effect enforcement;
- preserva Brain como dono do conhecimento semântico;
- reduz C-007 de várias possíveis ceremonies para uma boundary operacional clara.

## Custos aceitos

- Workspace Connection exige binding explícito por Project;
- mesma conta compartilhada precisa de lifecycle administrado no Workspace;
- ConnectionRevision adiciona revision pinning, mas o custo é pago por consumidores atuais (Project binding + Release);
- separar grant lógico de `key_version` criptográfica exige contrato de credential backend mais preciso em 3I;
- health pode ficar stale entre observações no F1 sem polling contínuo; isso é custo deliberado até existir SLO que pague probes proativas.

## Questões deliberadamente deixadas para fases posteriores

### 3D — Dependency Architecture

- direção exata Connections ↔ Gateway ↔ Artifact Registry ↔ Credential infrastructure;
- como evitar ciclo na qualification orchestration;
- boundary de consultas usada por Release.

### 3E — Data Architecture

- tables/keys de Connection e ConnectionRevision;
- representação polimórfica de `ownerScope/ownerId` sem generic resource framework;
- armazenamento de Qualification/health projection;
- relação física com ProjectConnectionBinding;
- constraints cross-scope.

### 3F — Contracts & API

- `ConnectionRef` / `ConnectionRevisionRef`;
- config schema do Connector versus Connection;
- result contract de Qualification;
- sanitized error taxonomy;
- credential binding/grant version contract;
- semantic operation signatures.

### 3G — Behavioral / State

- lifecycle/FSM concreta de Connection;
- qualification stale/invalid semantics;
- retirement/revocation behavior;
- exact promotion eligibility rules.

### 3I — Security / Authority

- credential backend contract;
- vault/KMS realization;
- distinction grant version × cryptographic key version;
- who may create/replace credentials at Workspace/Project scope;
- auditing/retention of secret operations.

### 3J — Deployment / Operations

- proactive health probes trigger/SLO;
- on-prem network/tunnel realization;
- secret backend operations/rotation runbooks.

## Decisão final

No Conexus F1:

```text
ConnectorDefinition
→ PLATFORM artifact
→ Artifact Registry

Connection
→ WORKSPACE | PROJECT operational resource
→ Connections module

ConnectionRevision
→ immutable non-secret config + exact ConnectorDefinition + concrete external target

CredentialHandle / logical grant
→ opaque relationship
→ secret backend owns bytes

Qualification
→ one semantic operation
→ Gateway performs controlled non-mutating I/O
→ Connections owns result meaning

Health
→ operational interpretation
→ never authorization authority

ProjectConnectionBinding
→ Project-owned explicit consumption decision

Release
→ pins exact binding/revision

Gateway
→ executes external operations and enforces effect/network/credential boundaries
```

Sem subclasses `WorkspaceConnection`/`ProjectConnection`, sem scope inheritance engine, sem provider→scope mapping, sem Account/Area connection e sem polling obrigatório no F1.

## Próxima decisão

A próxima boundary natural de 3C é **Capability Gateway Module Boundary**, porque Connections agora define **qual target/grant existe**, enquanto o Gateway deve definir **como capabilities externas, dados e effects são realmente executados sob authority mecânica sem absorver Connections, Identity & Access ou business semantics**.
