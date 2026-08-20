# 3C-R1 — Cross-review Closure & Reconciliation

**Status:** APROVADO pelo operador em 2026-08-14  
**Fase:** fechamento de 3C — Domain / Module Architecture  
**Importante:** este documento não constitui C-018, não encerra a Fase 3 inteira e não autoriza implementação.

## Veredito

O cross-review transversal de 3C-01..3C-14, confrontado com C-000..C-017 e uma revisão externa independente, encontrou **um único owner estrutural ausente**: `Managed Application Runtime`, agora fechado por 3C-15.

Não foram encontrados:

```text
authority duplicada material
god-module inevitável
módulo artificial adicional necessário
dois models de Project/Change/Release
duas Software Factories
necessidade de microservices/event sourcing/policy DSL
```

Com 3C-15 e as reconciliações abaixo, 3C pode ser declarada `CLOSED / APROVADA` e o trabalho passa para 3D — Dependency Architecture.

---

## 1. 3C-10-C — AgentTrigger EVENT é reservado, não operacional no F1

3C-10 definiu semanticamente `AgentTrigger = SCHEDULE | EVENT`, mas C-007 havia deixado webhook/event ingress para o primeiro consumidor real.

A reconciliação aprovada é:

```text
F1 enabled trigger
→ SCHEDULE

EVENT
→ semantic capability reserved
→ not enabled/implemented until first real consumer
```

O primeiro Agent que realmente precisar acordar por evento externo dispara o gatilho de C-007 para desenhar ingress autenticado, signature verification, dedupe, persist/enqueue boundary e trust semantics em 3F/3I.

Não nasce `WebhookModule`, `EventIngressModule` ou generic event bus no F1.

Mastra Signals/Inbox permanecem candidate mechanics de wake-up quando EVENT for habilitado; não substituem a trust boundary Conexus.

---

## 2. 3C-12-G — C-016 egress scope depois de DEDICATED

C-016 congelou `Gateway-only` server egress num contexto em que software publicado era essencialmente shared-runtime e registrou como gatilho futuro a primeira superfície de código server-side arbitrário.

3C-12 criou exatamente essa nova classe:

```text
DEDICATED
→ may own server-side application code/runtime
```

Logo a interpretação normativa passa a ser:

### MANAGED / Conexus-governed capabilities

```text
Project Data / external enterprise capability
→ Capability Gateway
```

O app MANAGED não ganha arbitrary network power como escape do Gateway.

### DEDICATED

Um Dedicated Application Runtime pode possuir network behavior próprio do produto, porque sua independência é parte do profile.

Mas quando ele consome poder sob custódia do Conexus:

```text
Dedicated App
→ explicit Conexus binding
→ Capability Gateway / corresponding Platform Service
```

Nunca recebe por consequência:

```text
Workspace Connection credential
Vault master material
Hub DB credential
provider provisioning key
```

Portanto:

```text
Gateway-only
= Conexus-governed capability boundary

Gateway-only
!= universal network stack of every DEDICATED product
```

O desenho físico de egress/firewall/identity exchange para Dedicated pertence a 3I/3J.

---

## 3. 3C-11-E / 3C-12-H — DEDICATED distribution e multi-install

A semântica F1 de Release permanece:

```text
Project
→ immutable Release
→ one active PROD Release
```

Para DEDICATED, F1 governa a **instância PROD operada pelo Conexus** e a versão canônica do produto sob o Project.

Não fica prometido no F1:

```text
CustomerInstallation A
CustomerInstallation B
CustomerInstallation C
ReleaseChannels
fleet rollout
per-customer promotion/conformance
```

Distribuição/multi-install de produto Dedicated fica `DEFER`.

Gatilho nomeado:

> primeiro produto DEDICATED implantado como instalação externa independente cujo lifecycle de versão/promoção precisa ser governado pelo Conexus.

Nesse momento conceitos como `Installation`, `DeploymentTarget` ou `ReleaseChannel` podem ser avaliados pelo consumidor real. Nenhum nasce agora.

A Release continua sendo a identidade de composição/versionamento do produto; somente o gerenciamento de N instalações fica fora do F1.

---

## 4. 3C-04-A / 3C-05-A — execução agentic de Inception

`Project` continua owner de:

```text
Inception semantics
Baseline candidate
Baseline approval
```

Inception continua pré-Change e não cria Change artificial.

Quando Inception precisa de investigação agentic, `Builder` fornece a **engineering execution capability/runtime boundary** sob authority do Project.

```text
Project
→ owns what Inception is and when it is complete enough for Baseline review

Application orchestration
→ requests bounded investigation under Project authority

Builder engineering execution capability
→ realizes coding/research/data-discovery tactics with scoped tools/runtime
```

Isso não cria `InceptionModule`, `InceptionRun` ou `InceptionWorkUnit` obrigatórios.

A representação operacional concreta — por exemplo, se um runtime episode é registrado como ActorRun com purpose específico ou apenas como runtime/correlation record — fica para 3E/3G/3H.

Invariantes:

```text
Inception != Change
Project owns Inception authority
Builder may execute bounded engineering tactics
runtime never approves Baseline by itself
```

---

## 5. 3C-R1-A — Application / Use-case Orchestration Layer

Várias operações cross-module precisam coordenar owners sem criar dependency cycles.

A arquitetura passa a declarar explicitamente uma camada de aplicação/orquestração do modular monolith:

```text
HTTP/UI/command boundary
        ↓
Application / Use-case Service
        ↓
domain modules / runtime boundaries
```

Essa camada:

- coordena use cases cross-module;
- pode ordenar chamadas e montar contexts estreitos;
- não possui domain state autoritativo próprio;
- não vira `ApplicationLayerModule`;
- não vira workflow engine, event bus ou universal mediator;
- não permite que um módulo leia internals/tabelas de outro para "evitar chamadas".

Exemplos conceituais:

```text
CreateProjectUseCase
→ Workspace + I&A + Project

QualifyConnectionUseCase
→ Connections + Gateway

PromoteReleaseUseCase
→ Release + Registry + Connections + Brain
```

3D deve fechar o DAG de dependências, ports/projections e directionality de cada fluxo.

---

## 6. 3C-09-D — `Brain EVIDENCE` passa a `EVIDENCE_SPEC`

Para evitar colisão com `Evidence` real de Builder/verification, a classe de conteúdo do Brain anteriormente chamada `EVIDENCE` passa semanticamente a:

```text
EVIDENCE_SPEC
```

Seu significado permanece:

```text
provenance specifications
assertions / verification requirements
golden cases
validity constraints
```

Distinção normativa:

```text
Brain EVIDENCE_SPEC
→ what should count as/require proof

Builder / verification Evidence
→ actual collected proof refs/digests/facts
```

Os nomes físicos/schema finais ficam para 3E/3F.

---

## 7. 3C-R1-B — authority pattern dos Project bindings

Bindings não ganham segunda source of truth mutável.

Padrão aprovado:

```text
Git
→ human-readable/versioned binding content when binding is authored as repo artifact

Project
→ which binding intent/revision/digest is approved for this Project

Artifact Registry
→ compiled immutable revision when the binding kind is registered

specialized semantic owner
→ validates meaning/conformance

Release
→ exact binding revision included in the served composition
```

Exemplo Brain:

```text
ProjectBrainBinding source → Git
approved Project intent → Project
compiled brain-binding revision → Registry
semantic compatibility → Brain
served pin → Release
```

Uma API conceitual como `setProjectBrainBinding` não significa "Postgres editable JSON is authoring truth".

A forma contratual final fica para 3F.

---

## 8. 3C-R1-C — C-006 scope depois de runtime profiles

A topologia C-006 de Project Database governado pelo Conexus deve ser lida como baseline de `MANAGED` / Conexus-managed Project Data.

```text
MANAGED
→ may use Conexus Project Data topology

DEDICATED
→ may own its own application data plane/schema/runtime
```

Se Dedicated consumir Project Data Conexus, isso ocorre por explicit platform contract/binding; a existência do Project não obriga um produto Dedicated a usar database do Hub.

---

## 9. 3C-R1-D — HAR-10 / fresh worker wording

Textos anteriores que associavam qualidade a "fresh worker per Work Unit" são refinados por 3A-R5.

Baseline atual:

```text
one persistent Mastra coding session per Change by default
Work Unit / ActorRun do not imply fresh cognition
```

Permanece válido:

```text
material verifier
→ fresh independent session/context
→ no implementer transcript
→ no write/fix tools
```

A intenção de independência do validator sobrevive; a obrigatoriedade de fresh implementer por WU não.

---

## 10. 3C-R1-E — convenção `Workspace`

`Workspace` sem qualificador fica reservado ao tenant Conexus.

Quando o termo pertencer ao substrate Mastra, escrever sempre:

```text
Mastra Workspace
```

Quando textos antigos usam `workspace DEV` para o ambiente de desenvolvimento, ler como:

```text
Project DEV / development environment
```

Isso evita confundir tenant, environment e filesystem/sandbox capability.

---

## 11. 3C-R1-F — nomenclatura antiga sob precedência

Até a síntese editorial final:

```text
Storage module
→ Attachments quando houver semântica de arquivo lógico
→ BlobStore/CAS quando houver apenas bytes/infrastructure

Release / Deployment
→ Release no F1

Published App Runtime universal
→ Managed Application Runtime para MANAGED
→ Dedicated Application Runtime para DEDICATED

Pi worker fresh per WU
→ superseded by 3A-R5 Change-scoped Mastra coding cognition

Brain EVIDENCE
→ Brain EVIDENCE_SPEC
```

Essas precedências são normativas e evitam reabrir decisões antigas por nomenclatura stale.

---

## 12. 3C-R1-G — Agent/Builder/Managed observability sources

Mastra native observability é uma fonte legítima de `Operational Telemetry` para Builder e Production Agent Runtime realizados por Mastra.

```text
Conexus IDs
→ domain/correlation authority

Mastra traceId/spanId/runtime IDs
→ runtime correlation references
```

Verification Observability do app-under-test continua camada complementar:

```text
Mastra telemetry
→ what agent/harness did

app runtime telemetry
→ what software-under-test did
```

Nenhuma delas vira correctness authority por ausência de erro.

A integração concreta fica para 3H/3L.

---

## 13. Finding roteado a 3D — cycles conceituais

O cross-review confirmou pares conceitualmente bidirecionais como:

```text
Builder ↔ Gateway
Connections ↔ Gateway
Production Agent Runtime ↔ Gateway
Brain ↔ Registry/application orchestration
Release ↔ specialized owners during conformance
Managed Runtime ↔ Release/I&A/Gateway
```

Isso não cria novo módulo em 3C.

3D deve impedir que a implementação traduza esses relacionamentos em imports/tables access circulares.

Possíveis mecanismos permitidos incluem:

```text
application-service orchestration
narrow ports
immutable authority snapshots/refs
consumer-provided context
read projections
```

sem criar universal mediator/event bus.

---

## 14. Findings antigos ainda abertos, sem reabrir 3C

Permanecem fora do fechamento de module ownership:

- **F3B-R1:** repo canônico do produto / cutover — resolver antes de implementação.
- **F3B-R2:** plan-schema legado — contracts 3F; nunca restaurar Mission/Milestone/Feature literalmente.
- **F3B-R4:** physical browser/runtime trust zones — 3I/3J.
- **N3:** Planning Depth × Rigor relationship — 3G.
- DEDICATED identity/authority exchange com Platform Services — 3F/3I.
- Deployment/hosting físico MANAGED/DEDICATED — 3J.
- DEDICATED scaffold/toolchain — 3K/3L.

Nenhum deles exige novo domínio 3C.

---

## 15. Mapa final de 3C

```text
Conexus Hub — modular monolith

Identity & Access
Workspace
Project
Builder
Artifact Registry
Connections
Capability Gateway
Brain
Production Agent Runtime
Release
Managed Application Runtime
Observability & Audit
Attachments
```

Decisão transversal:

```text
ApplicationRuntimeProfile = MANAGED | DEDICATED
```

`DEDICATED Application Runtime` é output/runtime do Project, não módulo do Hub.

Infrastructure capabilities incluem, sem formar módulos de domínio por si:

```text
PostgreSQL / Project Data infrastructure
Git infrastructure
BlobStore / CAS
credential backend / vault
E2B / sandbox infrastructure
Mastra substrate
MigrationRunner
queue/job substrate
serving/deployment infrastructure
```

---

## 16. YAGNI final — não construir

O fechamento de 3C não autoriza:

```text
EnvironmentModule
DeploymentModule
MigrationModule
StorageModule
JobModule
SchedulerModule
WebhookModule
EventIngressModule
ApplicationLayerModule
InstallationModule
DeploymentTargetModule
InceptionModule
BindingModule
UniversalFile
UniversalEventBus
WorkflowEngine
Policy DSL / OPA / Cedar / OpenFGA
RuntimeProfilePlugin registry
microservices
Kafka
Kubernetes
Temporal obrigatório
ClickHouse obrigatório
Sentry/Spotlight obrigatório
```

A ausência desses mecanismos é deliberada, não dívida automática.

---

## 17. Critério de encerramento 3C

Após materializar 3C-15 e este documento, o cross-review considera satisfeitas as quatro perguntas de fechamento:

```text
1. Todo conceito material F1 possui owner?
→ SIM

2. Existem authorities duplicadas materiais?
→ NÃO encontradas

3. Existe módulo puramente decorativo/genérico sem consumidor?
→ NÃO após rejeição de Storage/Deployment/etc.

4. O que resta é dependency/data/contracts/runtime/security/deployment detail?
→ SIM, roteado a 3D–3O
```

Portanto:

```text
3C — Domain / Module Architecture
CLOSED / APROVADA
```

Próximo gate:

```text
3D — Dependency Architecture
```

Este encerramento não constitui C-018 nem autoriza implementação.