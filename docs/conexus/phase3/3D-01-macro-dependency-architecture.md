# 3D-01 — Macro Dependency Architecture

**Status:** APROVADO pelo operador em 2026-08-14  
**Fase:** 3D — Dependency Architecture  
**Importante:** esta decisão não constitui C-018, não encerra a Fase 3, não autoriza implementação, não autoriza merge e não inicia 3E.

## Decisão em uma frase

O Conexus F1 adota um **grafo estrutural de dependências acíclico** dentro do modular monolith: chamadas internas diretas e estreitas são o default; a Application / Use-case Orchestration Layer coordena apenas fluxos cross-module cuja chamada direta criaria ciclo estrutural ou precisaria ordenar múltiplas authorities; módulos nunca acessam tables/internals de outro owner; fatos imutáveis/content-addressed podem viajar como refs/context, enquanto authority revogável é revalidada no owner o mais próximo possível da execução. O F1 admite uma única inversão de dependência de domínio quando necessária para revalidar approval no instante de um efeito, preserva `RigorProfile` como primitive compartilhada pura e não-domínio, permite atomicidade transacional cross-module somente através dos owners participantes, e proíbe que substrates compartilhados criem acoplamento oculto entre módulos.

---

## 1. Contexto e precedência

Esta decisão materializa o primeiro gate de 3D após:

- C-000..C-017;
- 3B CLOSED;
- 3C CLOSED;
- 3C-R1 — Cross-review Closure & Reconciliation;
- 3A-R5 — Builder / Coding Runtime Reassessment;
- revisão independente não-autoritativa `3D-FABLE-R0-independent-dependency-review.md`.

A revisão independente encontrou um ciclo estrutural composto não explicitado em 3C-R1:

```text
Builder → Capability Gateway → Release → Builder
```

Também confirmou que os pares conceitualmente bidirecionais de 3C não são ciclos de authority: cada fato material continua possuindo exatamente um owner. 3D deve impedir que colaboração bidirecional seja traduzida em imports ou table access circulares.

Nenhum Finding encontrado exige reabrir C-000..C-017 ou ownership de 3C.

---

## 2. Cinco grafos não podem ser confundidos

3D distingue explicitamente:

```text
collaboration graph
→ quem colabora com quem em algum fluxo

authority graph
→ quem decide cada fato

import graph
→ quem pode importar public code/types de quem

runtime call flow
→ ordem de chamadas em uma operação concreta

data ownership graph
→ quem pode ler/escrever internals/tables autoritativas
```

Regras:

```text
bidirectional collaboration
!= circular import

A → B → A runtime flow
!= A imports B and B imports A

same PostgreSQL
!= shared table ownership
```

O **import graph deve permanecer um DAG**.

---

## 3. Regra default — direct call first

Em um modular monolith, uma chamada in-process simples é preferida quando:

- a dependência é unidirecional;
- o consumer usa uma public internal capability estreita do owner;
- não existe cycle estrutural;
- não existe necessidade de ordenar múltiplas authorities numa operação cross-module;
- não existe failure class que exija inversion/port;
- a chamada não acessa internals/tables do owner.

Forma preferida:

```text
Module A
→ public internal API / projection de Module B
```

Não criar por default:

```text
IModuleBPort
ModuleBAdapter
CommandBus
Mediator
ServiceLocator
ApplicationService genérico
```

Interfaces/ports não existem para “deixar hexagonal”. Devem eliminar coupling/failure class real ou isolar substrate realmente replaceable.

---

## 4. Application / Use-case Orchestration Layer — exceção justificada

3C-R1 aprovou conceitualmente uma camada stateless de application/use-case orchestration. 3D-01 congela sua regra de admissão.

Um named use case é justificado quando pelo menos uma condição material é verdadeira:

```text
A. uma chamada direta criaria aresta estrutural proibida / ciclo de imports;

B. a operação coordena múltiplos owners com ordem, checkpoint ou atomicidade material;

C. um fluxo precisa obter fato de A, executar em B e devolver resultado a A sem fazer A importar B;

D. composition/promotion/inception/binding exige orchestration cross-module já comprovada por consumer real.
```

Caso contrário:

```text
direct module call
```

A Application Layer:

```text
PODE
→ ordenar chamadas
→ montar context/ref estreito
→ abrir/coordenar transaction scope quando §10 permitir
→ transportar resultados entre owners

NÃO PODE
→ possuir domain state autoritativo
→ possuir invariantes que deveriam viver no owner
→ tornar-se ApplicationLayerModule
→ virar universal mediator
→ virar command bus
→ virar event bus
→ virar workflow engine
→ virar policy engine
```

Regra normativa:

> **O use case coordena; o owner decide.**

Nenhuma invariante de domínio pode existir somente na application layer.

---

## 5. Quebra do ciclo `Builder → Gateway → Release → Builder`

As três arestas seriam individualmente plausíveis:

```text
Builder → Gateway
→ discovery/capability execution

Gateway → Release
→ validar composição ativa/candidate permitida

Release → Builder
→ perguntar se Change está accepted
```

Juntas formariam ciclo estrutural.

A aresta removida é:

```text
Release -X-> Builder
```

O fluxo passa a ser coordenado por um use case de composição equivalente semanticamente a:

```text
ComposeReleaseUseCase
├── Builder → ChangeAcceptance / accepted candidate/evidence refs
└── Release → compose immutable Release candidate using pinned refs
```

Release não navega `Plan`, `WorkUnit`, `ActorRun` ou Builder internals.

`ChangeAcceptance` é input de composição, não authority contínua que Release precise consultar por import.

A Promotion/conformance continua podendo reprovar uma Release composta que tenha se tornado stale antes de servir.

---

## 6. Approval — única inversão de dependência de domínio F1

Production Agent Runtime owns `ApprovalRequest` semantics.

Capability Gateway owns last-mile effect admission/execution e 3C-08 exige revalidar approval imediatamente antes do efeito.

Não é suficiente transportar no caller context:

```text
approvalWasValid = true
```

porque approval pode ser revogada/expirar entre a leitura e o efeito.

Também são proibidos:

```text
Gateway → importar Production Agent Runtime
Gateway → ler tables internas de ApprovalRequest
Gateway → confiar em snapshot stale de approval
```

Portanto F1 admite **uma capability de inversão estreita**:

```text
Gateway
→ depende de capability de verificar approval exata

Production Agent Runtime
→ fornece a implementação sobre sua própria authority

composition root
→ liga as duas boundaries
```

3D-01 congela a propriedade, não a sintaxe de implementação.

Pode futuramente ser uma pequena interface, função/callback ou forma equivalente definida em 3F/implementação.

Ela deve permitir revalidar, na hora H, informação equivalente a:

```text
approvalRef
exact execution/effect identity
valid | invalid/stale/revoked
```

Nenhum `CallerAuthorityVerifier`, `PolicyProviderRegistry` ou framework genérico nasce por consequência.

---

## 7. Caller contexts — usar refs, não criar reverse dependencies

Para relações como Builder → Gateway e outros hot paths sem authority revogável owned pelo caller que precise ser consultada atomicamente pelo Gateway, o caller pode fornecer contexto estreito e previamente validado.

Exemplo conceitual do Builder:

```text
BuilderExecutionContext
├── ActorRunRef
├── ChangeRef
├── ProjectRef
├── candidate/composition ref quando aplicável
├── permitted surface/scope
└── bounded execution facts necessários
```

Gateway continua revalidando o que pertence ao próprio admission path:

```text
I&A
Project binding
Artifact revision
Connection/target
active Release/candidate eligibility
physical limits/budget
preconditions
approval quando aplicável
```

Context não pode carregar internals do Builder, transcript Mastra ou uma cópia de authority que deveria ser revalidada no owner.

---

## 8. Regra de refs/snapshots — imutável viaja, revogável revalida

A formulação normativa de 3D-01 é:

> **Content-addressed/immutable facts podem viajar por value/ref. Fatos que podem ser revogados ou invalidados depois da leitura devem viajar como referência e ser revalidados no owner o mais próximo possível da decisão material.**

### Podem viajar/pinar

Exemplos:

```text
opaque IDs
approved Baseline digest
contract revision digest
ArtifactRef / artifact revision digest
ConnectorDefinition revision
ConnectionRevision identity
Brain revision / binding digest
ReleaseManifest digest
frontend dist digest
runtimeContractDigest
candidate/source/evidence digests
```

### Devem ser revalidados quando materialmente relevantes

Exemplos:

```text
Account/session enabled state
current effective access
approval validity
active Release pointer
credential/grant revocation
Connection eligibility/qualification relevante
budget durável disponível
material precondition
production conformance
attachment current availability/access
```

Não criar:

```text
UniversalAuthoritySnapshot
UniversalExecutionContext
AuthorityTicket genérico
```

---

## 9. Narrow projections pertencem à public API do owner

Um consumer não recebe aggregate/internals inteiros apenas porque precisa de um fato.

Projeções/ref shapes estreitos podem existir quando reduzem coupling real, por exemplo semanticamente:

```text
Identity & Access
→ EffectiveAccessContext

Project
→ WorkspaceId, runtimeProfile, approvedBaselineDigest,
   exact binding/config refs

Artifact Registry
→ ExactRevision / ArtifactRef / compiled payload ref

Connections
→ exact ConnectionRevision, target/environment,
   credential handle ref, eligibility facts necessários

Release
→ active Release / exact active composition projection

Builder
→ ChangeAcceptance / candidate/evidence refs

Brain
→ EffectiveBrainSlice / compiled semantic plan
```

Não criar pacote universal de DTOs. O owner define e serve sua projeção pública mínima.

---

## 10. Atomicidade cross-module no mesmo PostgreSQL

F1 permite que um named application use case use **uma única transaction** envolvendo operações de mais de um módulo quando existe uma invariante verdadeiramente atômica a preservar.

Exemplo conceitual:

```text
BEGIN
  Project public operation writes Project-owned state
  Identity & Access public operation writes I&A-owned state
COMMIT
```

Regra fundamental:

```text
shared transaction atomicity
!= shared data ownership
```

Mesmo dentro da mesma transaction:

- cada módulo executa seus próprios statements/repository operations;
- o use case não escreve tables internas dos módulos diretamente;
- um módulo não lê/escreve tables internas do outro;
- nenhuma FK ou transaction helper cria authority cruzada por consequência;
- transaction compartilhada é usada quando evita estado intermediário material, não por default em toda orchestration.

3E decide a realização física, transaction context e schema boundaries. 3M tratará recovery/failure quando aplicável.

F1 **não** adota consistência eventual/compensação/outbox apenas para preservar uma extração hipotética futura de microservices.

---

## 11. `RigorProfile` é primitive compartilhada, não módulo de domínio

C-017 exige detector único/versionado de rigor e 3C-05 identifica Builder e Release como consumers.

Colocá-lo dentro de Builder criaria pressão para:

```text
Release → Builder
```

reabrindo o ciclo §5.

Portanto existe uma **primitive compartilhada de avaliação de rigor**, semanticamente equivalente a:

```text
mechanical declared signals
→ deterministic versioned evaluation
→ FAST | BOUNDED | CONTROLLED
```

Propriedades:

```text
pure
versioned
deterministic
fail-closed sobre indeterminação aplicável
no I/O
no persistent domain state
no generic policy DSL
no plugin registry
```

Não nasce:

```text
RigorModule
PolicyEngine
RiskPolicyService
GenericRuleEngine
```

O posicionamento concreto de código pode ficar em shared kernel/engineering primitive adequada, preservando seu caráter não-domínio.

A relação final Planning Depth × RigorProfile continua pertencendo a 3G conforme N3.

---

## 12. Shared kernel é deliberadamente mínimo

Para impedir imports artificiais apenas para obter IDs/refs, F1 pode possuir um kernel técnico mínimo de value types compartilháveis.

Pode conter apenas primitives realmente universais e estáveis, como:

```text
opaque identity types
content digests/refs
pequenos value types técnicos transversais comprovados
```

Não é local para despejar:

```text
domain entities
business policies
large DTOs
service interfaces genéricas
shared mutable state
module repositories
all errors/events by default
```

Tipos específicos continuam no owner que lhes dá significado.

`shared/`, `common/` ou equivalente não pode virar boundary sem ownership.

---

## 13. Observability — sink em dataflow, leaf em imports

Observability & Audit recebe facts de múltiplos módulos e é downstream no dataflow.

No import graph, porém, a direção permitida é:

```text
Module → Observability public emit/query capability
```

Não:

```text
Observability → Module internals
```

Correlação usa IDs/refs estáveis, não navegação de aggregates.

Observability nunca decide authorization, Change closure, Release state, Connection state ou correctness.

Audit-required fail-closed é dependency de availability/operation semantics, não authority inversion.

---

## 14. Substrate compartilhado não pode criar dependency escondida

Builder e Production Agent Runtime podem usar Mastra como substrate conforme 3A-R5 e 3C-10.

Isso não autoriza um mutable global registry/runtime state que acople os dois módulos fora do grafo declarado.

Invariante:

> **Compartilhar a mesma tecnologia não cria permissão para compartilhar mutable runtime registry, tool registration, configuration authority ou state namespace de forma que mudança num consumidor altere implicitamente o outro.**

3D congela somente a propriedade de isolamento.

3H decidirá a realização suficiente, que pode ser, por exemplo:

```text
separate runtime instances
ou
provably isolated/namespaced substrate realization
```

sem congelar duas instâncias físicas agora.

A replaceability do Builder não pode depender de trocar também o Production Agent Runtime, e vice-versa.

---

## 15. Macro import topology aprovada

3D-01 congela a seguinte **ordem topológica conceitual**, sem congelar package layout físico:

```text
L0  technical shared primitives / infrastructure ports where already justified

L1  Identity & Access
    Workspace
    Artifact Registry
    Observability & Audit
    shared Rigor evaluation primitive

L2  Attachments
    Connections
    Brain
    Project

L3  Release

L4  Capability Gateway

L5  Builder
    Production Agent Runtime

L6  Managed Application Runtime

L7  Application / Use-case Orchestration
    HTTP/UI/command boundaries
```

A ordem significa:

```text
higher layer may depend on lower public boundaries when explicitly allowed
lower layer must not import higher module internals
```

Ela não significa que todo módulo de uma layer deva importar todos os módulos abaixo.

Dependências permanecem sob **least dependency necessary**.

### Assimetria intencional do Capability Gateway

Gateway possui fan-in relevante porque last-mile admission exige facts de vários owners.

Isso é permitido quando limitado às projeções públicas estritamente necessárias de:

```text
Identity & Access
Project
Artifact Registry
Connections
Release
```

Gateway não vira policy owner desses módulos.

A alternativa de obrigar cada caller a montar um `AdmissionContext` completo com authority mutável é rejeitada porque duplica revalidation e aumenta TOCTOU.

---

## 16. Relações macro aprovadas / proibidas

### Diretas aprovadas como intenção arquitetural

Exemplos principais:

```text
Project → Workspace
Brain → Artifact Registry
Connections → Artifact Registry
Release → Project / Registry / Connections / Brain
Gateway → I&A / Project / Registry / Connections / Release
Builder → Project / Brain / Registry / Gateway / Observability
Production Agent Runtime → Release / Registry / Brain / Gateway / Observability
Managed Application Runtime → I&A / Release / Gateway / PAR / Attachments / Observability
```

As relações acima não obrigam cada call específica; significam que uma dependency pública estreita é arquiteturalmente admissível.

### Relações que devem ser orchestration/use-case em vez de reverse import

```text
Connections → Gateway para Qualification
Project → Builder para Inception investigation
Brain → Gateway para AnalyticQuery/probes
Release → Builder para Change acceptance/composition
Release → Managed Application Runtime para served verification
Project → Brain/Connections quando a operação de binding exige validação cross-owner
```

### Proibidas

```text
module → tables/internals de outro módulo
circular module imports
runtime → direct Project DB bypassando Gateway quando capability é governed
runtime → direct Connection credential material
Release → Builder internals
Registry → specialized module compiler internals
Observability → domain owner state para decidir authority
Application Layer → domain tables diretamente
shared Mastra registry como autoridade implícita entre Builder e PAR
```

---

## 17. Enforcement é obrigatório; ferramenta não é decidida em 3D

A architecture de dependências não pode depender apenas de disciplina humana.

A implementação deve tornar mecanicamente verificável pelo menos:

```text
no circular module imports
allowed/forbidden module edges
public-entrypoint-only cross-module imports
no deep imports into internals de outro módulo
```

A escolha concreta de tooling é reversível e não é congelada aqui.

Candidatos podem incluir `dependency-cruiser`, `eslint-plugin-boundaries`, script pequeno próprio ou equivalente qualificado posteriormente.

Não adotar dois tools apenas porque cobrem parcialmente o mesmo problema; cada dependency adicional precisa demonstrar classe de falha incremental que elimina.

A Technology Qualification/implementation escolherá a menor combinação suficiente.

---

## 18. Decisões explicitamente não tomadas aqui

3D-01 não decide:

```text
TypeScript interface/signature exata da approval capability        → 3F/implementation
DTOs/projections finais                                             → 3F
schema/table/FK/transaction implementation                          → 3E
FSM/lifecycle                                                       → 3G
realization Mastra/E2B                                              → 3H
security/egress/trust physical enforcement                          → 3I
process/deployment topology                                         → 3J
frontend/API client shape                                           → 3K
dependency-cruiser/eslint/specific architecture tooling             → 3L/implementation
failure/recovery detalhado de cross-module transaction              → 3M
```

---

## 19. Anti-overengineering guardrail

3D-01 não autoriza criar:

```text
ApplicationLayerModule
UniversalMediator
CommandBus
EventBus
WorkflowEngine
ServiceLocator de domínio
Generic ModulePort framework
Generic CallerAuthorityVerifier
UniversalAuthoritySnapshot
UniversalExecutionContext
RigorModule
PolicyEngine
Rules DSL
Integration Events/Outbox/Inbox para comunicação local por default
microservices para "resolver" imports
shared mutable registry entre módulos
```

A ausência desses mecanismos é deliberada.

---

## 20. Invariantes aprovadas

1. O import graph do Hub deve ser acíclico.
2. Collaboration bidirecional não autoriza imports bidirecionais.
3. Direct in-process calls são o default quando unidirecionais e seguros.
4. Application orchestration só entra por cycle/multi-authority/ordering/atomicity material.
5. Use case coordena; domain owner continua decidindo invariantes.
6. Cross-module table/internal access é proibido mesmo em `hub_control` compartilhado.
7. Immutable/content-addressed facts podem viajar; revocable authority é revalidada no owner perto da decisão.
8. Gateway pode consumir várias narrow authoritative projections porque admission é sua responsabilidade real.
9. Approval de agent-originated effect é revalidada na hora H por uma única dependency-inversion capability estreita; não por snapshot stale.
10. `Release → Builder` não é direct dependency; Change acceptance entra na composição via application orchestration.
11. Connections qualification, Brain physical probes, Inception investigation e served verification não criam reverse imports.
12. `RigorProfile` evaluation é primitive pura compartilhada, não domínio/policy engine.
13. Transaction cross-module pode compartilhar atomicidade quando necessária, nunca data ownership.
14. Shared kernel permanece mínimo e não vira gaveta de DTOs/policies/services.
15. Observability é leaf em imports e nunca authority de estado de outros domínios.
16. Shared technology/substrate não pode criar hidden mutable coupling entre modules.
17. Dependency rules devem ser mecanicamente enforceable; a ferramenta concreta fica aberta.
18. Nenhuma interface/port genérica nasce sem consumer/failure class real.

---

## 21. Próximo gate

Com a macro dependency architecture congelada, o próximo trabalho de 3D é:

```text
3D-02 — Capability Gateway Dependency Architecture
```

Deve fechar em detalhe:

- narrow projections consumidas pelo Gateway;
- caller execution contexts;
- boundary de revalidação de ApprovalRequest;
- active Release / candidate resolution;
- Connection execution facts;
- budget/admission authority boundaries;
- transaction/TOCTOU concerns locais ao admission path;
- forbidden reverse dependencies;
- o menor contrato suficiente sem policy framework.

3D-02 não implementa produto e não reabre 3C sem Finding material.
