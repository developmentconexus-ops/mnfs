# 3C-12 — Application Runtime Profiles

**Status:** APROVADO pelo operador em 2026-08-14  
**Fase:** 3C — Domain / Module Architecture  
**Importante:** esta decisão não constitui C-018, não encerra 3C e não autoriza implementação.

## Decisão em uma frase

O Conexus é **uma única Software Factory + Application Platform**, com um único modelo de Project/Change/Builder/verification/Release, mas Projects que publicam software possuem exatamente um `ApplicationRuntimeProfile` aprovado no Project Baseline, em união fechada F1:

```text
MANAGED
DEDICATED
```

`MANAGED` é destinado a aplicações organizacionais executadas sobre o runtime e os serviços governados compartilhados do Conexus. `DEDICATED` é destinado a aplicações/produtos independentemente executáveis, com runtime próprio, que podem consumir serviços Conexus somente por bindings explícitos. Os dois perfis produzem artifacts reais, versionados e verificáveis; nenhum perfil cria uma segunda Software Factory.

A regra estrutural é:

```text
same Factory
same Project model
same Change/correctness model
same Builder
same verification discipline
same Release authority

runtime realization may differ by approved profile
```

---

## 1. Finding material que abriu esta decisão

A primeira formulação de 3C-12 tratava todo app publicado como uma SPA cujo backend seria essencialmente o runtime compartilhado do Hub, em shape próximo ao observado na Mitra.

Esse shape é excelente para um consumidor real do Conexus:

```text
empresa
├── dashboard comercial
├── app de compras
├── CRM interno
├── consulta de estoque
└── ferramenta departamental
```

Criar backend/container/auth/secret-store/deployment completamente independentes para cada pequena solução organizacional desperdiçaria a principal alavanca de uma application platform.

Mas o Conexus possui um segundo consumidor igualmente real:

```text
Software Factory do próprio operador
├── MetalDocs
├── Marketplace Central
├── futuros SaaS
└── software comercializável / deployável fora do Conexus
```

Forçar esses produtos a serem apenas skins sobre um runtime compartilhado criaria lock-in estrutural contra a própria fábrica e limitaria backend custom, deployment independente, distribuição e evolução comercial.

Logo a pergunta correta não é `Mitra-style ou standalone?`, mas:

> Qual parte da fábrica é única e em qual boundary exatamente dois regimes de runtime já possuem consumidores concretos?

A resposta aprovada é `MANAGED | DEDICATED`.

---

## 2. Um único modelo de engenharia

F1 não cria duas factories.

O pipeline conceitual permanece único:

```text
Workspace
  ↓
Project
  ↓
Inception / Discovery
  ↓
Project Baseline
  ↓
Change
  ↓
COR-*
  ↓
Mastra CodingSession
  ↓
Work Units / ActorRuns
  ↓
build + verification
  ↓
Release
  ↓
Promotion
```

Não existem:

```text
ManagedBuilder
DedicatedBuilder
ManagedChange
DedicatedChange
ManagedRelease
DedicatedRelease
```

O perfil afeta a **forma do application runtime e dos outputs de deployment**, não a semântica de como o Conexus entende, constrói, verifica e governa software.

---

## 3. `ApplicationRuntimeProfile` é fato material do Project Baseline

O profile é decidido durante Inception/Discovery e ratificado no Project Baseline.

A LLM pode recomendar; o Hub não deixa a escolha virar inference invisível.

### Exemplo MANAGED

```text
"Quero um painel interno para compradores acompanharem ruptura de estoque usando Sankhya e o Brain da empresa."
```

Sinais naturais:

```text
organizational/internal use
heavy reuse of Workspace Brain/Connections
no independent commercial lifecycle
platform-managed data/capabilities are desirable
```

Recomendação:

```text
runtimeProfile = MANAGED
```

### Exemplo DEDICATED

```text
"Quero construir o MetalDocs como produto que poderá ser vendido e implantado independentemente."
```

Sinais naturais:

```text
independent deployment lifecycle
own server-side application logic
commercial distribution / portability
independent operational scaling or topology
```

Recomendação:

```text
runtimeProfile = DEDICATED
```

Alterar `MANAGED ↔ DEDICATED` depois do Baseline é revisão material de arquitetura do Project. F1 não promete conversão automática.

---

## 4. Profile MANAGED

### Responsabilidade

`MANAGED` é o regime application-platform-first.

O app continua sendo software real e seu frontend publicado continua sendo o artifact real produzido e verificado no build.

Forma conceitual:

```text
Managed Project
├── real frontend build
├── queries
├── actions
├── jobs
├── agents
├── migrations / project data model quando aplicável
└── explicit bindings
      │
      ▼
Conexus Managed Runtime / Platform Services
├── Identity & Access
├── Capability Gateway
├── Connections
├── Brain
├── Production Agent Runtime
├── governed Project Data
└── platform governance/audit
```

### Invariante do artifact

```text
verified build artifact
=
artifact served by the active Release
```

O Conexus não reconstrói uma representação do app no publish. O frontend build real é pinado por digest e servido/executado conforme a Release ativa.

### Backend

No Golden Path MANAGED, o app **não recebe backend de aplicação dedicado por default**.

Backend capabilities são expressas pelas primitives governadas do Conexus, por exemplo:

```text
query
action
job
agent
AnalyticQuery
platform/runtime APIs
```

Se um Project passa a exigir backend arbitrário, processo próprio ou lifecycle operacional independente como propriedade central, isso é sinal para avaliar `DEDICATED`, não para transformar MANAGED em runtime universal configurável.

### Custódia

Credenciais empresariais e poderes sensíveis permanecem server-side na Platform:

```text
Connection credentials
provider/model durable credentials
Git remote authority
Brain authority
Gateway enforcement
```

O app consome handles/capabilities, não material secreto bruto.

---

## 5. Profile DEDICATED

### Responsabilidade

`DEDICATED` é o regime software-product-first.

O Project produz uma unidade de aplicação independentemente executável, com runtime próprio.

Forma conceitual:

```text
Dedicated Project
        ↓
real build
        ↓
Application Release
├── frontend artifact
├── server/runtime artifact quando necessário
├── app-owned migrations/data model
├── assets
├── runtime contracts
├── dependencies
└── optional Conexus Platform bindings
        ↓
Dedicated Application Runtime
```

A tecnologia física desse runtime — processo, Docker, VM, cloud, on-prem — pertence a 3J.

### Software real e portabilidade

A propriedade a preservar é:

```text
Dedicated Project
= real application that can own its runtime
```

Não:

```text
Dedicated Project
= configuration that only exists inside Conexus Managed Runtime
```

F1 não promete export one-click nem execução sem qualquer dependência Conexus. Mas a arquitetura não deve tornar dependência do Managed Runtime inevitável para um produto Dedicated.

### Conexus como Platform Service opcional/explicita

Dedicated apps podem consumir serviços Conexus:

```text
Brain
Connections / Gateway
Production Agent Runtime
Identity, quando escolhido
enterprise capabilities
```

por bindings e contratos explícitos.

Exemplo:

```text
Marketplace Dedicated Runtime
        ↓ named platform capability
Conexus Gateway
        ↓
Sankhya
```

Isso não exige entregar `SANKHYA_CLIENT_SECRET` ao runtime dedicado.

### Dedicated não é privileged platform process

Runtime dedicado não recebe por default:

```text
Hub database credentials
Vault master material
Git remote write credentials
Workspace Brain internals
provider provisioning keys
```

Ele continua sendo application code, não extensão privilegiada do Control Plane.

---

## 6. Comparação normativa

| Dimensão | MANAGED | DEDICATED |
|---|---|---|
| Caso principal | app organizacional/interno | produto/software independente |
| Frontend | build real | build real |
| Backend dedicado por app | não no Golden Path | permitido/esperado quando necessário |
| Runtime próprio | não por app | sim como unidade lógica deployável |
| Runtime compartilhado Conexus | sim | não como requisito |
| Brain | Platform service | binding opcional/explicito |
| Connections/Gateway | Platform service | binding opcional/explicito |
| Production Agents | Platform service | binding opcional/explicito |
| Identity | Conexus I&A baseline | Conexus I&A apenas se o contrato do produto escolher; auth própria pode existir |
| Portabilidade fora do Managed Runtime | não é objetivo | propriedade arquitetural preservada |
| Factory/Builder/Change/Release | os mesmos | os mesmos |

A tabela não congela DTOs, protocolos ou deployment technology.

---

## 7. Release continua única — refinamento normativo de 3C-11

3C-11 permanece authority de `ReleaseManifest`, `Release`, `Promotion`, active PROD pointer, conformance, production migration orchestration e rollback.

3C-12 adiciona uma propriedade material à composição:

```text
ReleaseManifest
└── runtimeProfile = MANAGED | DEDICATED
```

O profile altera quais outputs são necessários para a Release ser válida.

### Managed Release

Forma conceitual:

```text
ReleaseManifest
├── runtimeProfile = MANAGED
├── frontendDist
├── runtimeContract
├── queries/actions/jobs/agents
├── Brain/bindings
├── schema/config
└── evidence
```

### Dedicated Release

Forma conceitual:

```text
ReleaseManifest
├── runtimeProfile = DEDICATED
├── frontend artifact quando existir
├── server/runtime artifact quando existir
├── app migrations/data contract
├── application dependencies
├── optional Conexus bindings
└── evidence
```

`ReleaseManifest` continua composition root e não vira registry de runtime plugins.

### PROD continua sendo semântica única

```text
Project
→ active PROD Release
```

A realização física diverge por profile:

```text
MANAGED   → Managed Runtime realization
DEDICATED → Dedicated Application Runtime realization
```

Onde e como isso roda pertence a 3J.

---

## 8. Refinamento material de C-012 — scaffold/runtime

C-012 contém a afirmação arquitetural `hub já é o backend`, adequada ao shape MANAGED então dominante.

3C-12 restringe essa afirmação:

```text
C-012 "Hub is the backend"
→ baseline MANAGED
→ NÃO é universal para DEDICATED
```

As propriedades de scaffold que continuam transversais incluem:

```text
versioned/reproducible scaffold
real build artifacts
digests
ownership classes
mechanical verification
runtime contracts
honest UI
migration kits para platform-contract areas
```

O scaffold DEDICATED pode incluir server-side application structure e contratos adicionais. A forma final pertence a 3K/3L e não autoriza segundo scaffold framework agora.

---

## 9. Refinamento material de C-015 — published runtime/auth

C-015 congelou uma topologia de published app fortemente shared-runtime:

```text
central Hub account/session
same-origin serving
shared published runtime assumptions
```

3C-12 limita essa topologia ao profile `MANAGED`.

Portanto:

```text
C-015 serving/auth topology
→ MANAGED baseline
```

Para `DEDICATED`:

- o app pode escolher Conexus Identity & Access por binding/contract explícito;
- ou possuir auth própria quando o produto exige independência;
- usar serviços Conexus requer identidade/authority exchange explícitos e fail-closed;
- detalhes de trust, tokens/cookies, ingress, domains e isolation ficam para 3I/3J;
- Dedicated não herda implicitamente grants do Control Plane nem credenciais da Platform.

Essa emenda não reabre a separação já aprovada entre `CONTROL_PLANE`, `PREVIEW` e uso de software publicado; apenas impede tratar uma topologia de auth/hosting como universal para produtos independentes.

---

## 10. Boundary com Builder

Builder não ganha duas estratégias de engenharia.

A coding session recebe o `runtimeProfile` aprovado como parte do contexto/Project Baseline e constrói dentro daquele contrato.

```text
Builder
→ same correctness model
→ same Change/WU/ActorRun semantics
→ profile-specific implementation/output
```

Exemplo:

```text
MANAGED
→ prefere named platform capabilities
→ não inventa backend dedicado sem revisão material

DEDICATED
→ pode construir server runtime próprio
→ platform integrations continuam por bindings/explicit contracts
```

O agente não muda profile silenciosamente para resolver uma dificuldade local.

---

## 11. Boundary com Platform Services

Os seguintes owners permanecem únicos:

```text
Identity & Access      → Conexus identity/access authority quando consumida
Capability Gateway     → governed enterprise capability admission/execution
Connections            → credentials/targets/qualification
Brain                  → organizational semantic authority
Production Agent Runtime → Conexus-hosted production agents
Artifact Registry      → immutable registered artifact revisions
Release                → composition/promotion authority
```

MANAGED consome essas capabilities como runtime natural.

DEDICATED pode consumi-las somente quando seu Baseline/Release possui binding explícito correspondente.

---

## 12. Dados

3C-12 não congela database topology.

Direção semântica:

### MANAGED

Dados de aplicação podem usar Project Data governado pela plataforma conforme C-006/3E, e browser/app acessa dados por capabilities aprovadas, não credencial direta.

### DEDICATED

O app pode possuir seu próprio data plane e schema como parte de sua unidade operacional, além de consumir dados/capabilities Conexus quando explicitamente integrado.

A separação física de databases, roles e backups pertence a 3E/3J.

---

## 13. Runtime profiles não são módulos simétricos

`ApplicationRuntimeProfile` é uma decisão de Project, não uma interface de plugin.

F1 não cria:

```text
RuntimeProfilePlugin
RuntimeAdapterRegistry
DeploymentProviderRegistry
BackendStrategy
ServerStrategy
CustomRuntimeType
```

`MANAGED` poderá exigir uma boundary/módulo interno de Managed App Runtime no Hub, a ser detalhada quando fecharmos as últimas boundaries de 3C.

`DEDICATED` não é outro módulo do Hub: é uma classe de output/runtime produzida pelo Project e operada fora do processo soberano conforme 3J.

---

## 14. Pesquisa comparativa usada

### Mitra

A Mitra observada valida fortemente o profile MANAGED:

```text
real React/Vite SPA
→ restricted runtime SDK
→ platform-hosted functions/data/integrations/auth
```

A transferência útil é application platform compartilhada para apps organizacionais. Não se transfere a conclusão de que todo software produzido pela factory deve depender desse runtime.

Referências internas:

- `docs/reference/mitra/05-ciclo-de-vida.md`
- `docs/reference/mitra/06-runtime-publicado.md`
- `docs/research/MITRA-INSPIRATION-MAP.md`

### Factory.ai

A arquitetura pública de Software Factory separa Intake/Context/Planning/Execution/Review/Delivery. A transferência relevante é que a factory pode produzir software correto sem impor uma única forma de hosting/runtime ao produto entregue.

Referências internas:

- `docs/research/FACTORY-AI-HARNESS-REFERENCE-MAP.md`

### Vercel for Platforms

Vercel documenta dois regimes reais para plataformas: multi-tenant/shared deployment e multi-project com builds/functions/env isolados. A transferência é a legitimidade de dois regimes fechados quando há dois consumidores concretos, sem importar sua infraestrutura.

Referência externa:

- `https://vercel.com/changelog/introducing-vercel-for-platforms`

### Cloudflare Workers for Platforms

Valida o padrão de código isolado por aplicação/tenant consumindo platform-managed bindings sem receber necessariamente a custódia direta dos serviços subjacentes.

Referência externa:

- `https://developers.cloudflare.com/cloudflare-for-platforms/workers-for-platforms/`

---

## 15. Alternativas avaliadas

### A — apenas MANAGED

**REJECT como arquitetura global.**

Excelente para aplicações internas, mas transformaria produtos independentes em extensões do runtime Conexus e limitaria portabilidade/deployment próprio.

### B — apenas DEDICATED

**REJECT como arquitetura global.**

Faria cada pequeno app empresarial pagar backend/runtime/deployment/ops próprios, destruindo a alavanca de uma application platform compartilhada.

### C — duas Software Factories

**REJECT.**

Duplicaria Change, Builder, verification, Release e standards sem nenhuma failure class que justifique.

### D — uma Factory + dois profiles fechados

**ADOPT.**

Resolve os dois consumidores atuais com a menor divergência possível.

### E — universal runtime/deployment plugin framework

**REJECT F1.**

Dois consumidores conhecidos não justificam generalização para N profiles/providers.

---

## 16. F1 e ordem de prova

A arquitetura reconhece os dois profiles agora, mas isso não exige implementar os dois verticalmente no mesmo momento.

A ordem de qualificação recomendada é:

```text
1. MANAGED vertical proof
   → exercita o coração da Application Platform
   → Brain + Connections + Gateway + I&A + Agents + Release

2. DEDICATED vertical proof
   → prova que a mesma Factory produz software independentemente executável
   → usa produto real como consumidor
```

Essa ordem é planejamento de prova, não autorização de implementação.

---

## 17. Invariantes

1. **Uma Factory:** ambos os profiles usam o mesmo Project/Change/Builder/verification/Release model.
2. **Dois profiles apenas:** `MANAGED | DEDICATED` é união fechada F1.
3. **Baseline authority:** profile é explícito e aprovado; agente não o muda silenciosamente.
4. **Build real:** ambos produzem artifacts reais e versionados; publish não reconstrói um app fictício.
5. **Managed platform-first:** backend dedicado não é Golden Path MANAGED.
6. **Dedicated app-first:** runtime próprio é permitido e portabilidade arquitetural é preservada.
7. **No raw privilege:** Dedicated não vira extensão privilegiada do Hub e Managed não recebe durable secrets no browser.
8. **Explicit bindings:** Dedicated consome Conexus services somente por contratos/bindings explícitos.
9. **Release única:** active PROD Release continua authority de versão; runtimeProfile faz parte da composição.
10. **Sem plugin framework:** profiles não são handlers registráveis nem deployment strategies genéricas.
11. **Physical topology deferred:** processo/Docker/VM/cloud/localhost/domain pertencem a 3J.
12. **Auth topology não universal:** C-015 shared-runtime auth/serving é MANAGED baseline; Dedicated será desenhado conforme seu profile em 3I/3J.

---

## 18. Deliberadamente deixado para fases posteriores

### 3D — Dependency Architecture

- dependências exatas entre Managed Runtime e Platform modules;
- dependências permitidas para dedicated bindings;
- prevenção de ciclos entre app runtime, Release e Gateway.

### 3E — Data Architecture

- Project Data MANAGED;
- dedicated app data ownership;
- control-plane records de runtimeProfile/bindings;
- database/schema isolation.

### 3F — Contracts & API Architecture

- runtime SDK/contracts MANAGED;
- Dedicated → Conexus service contracts;
- identity/authority exchange para dedicated bindings;
- ReleaseManifest physical contract.

### 3G/3H

- profile transitions/lifecycle;
- runtime behavior;
- jobs/agents interactions.

### 3I — Security / Authority

- trust boundaries de Dedicated runtime;
- auth options e identity bridge;
- token/capability material;
- least privilege.

### 3J — Deployment / Operations

- Managed hosting topology;
- Dedicated process/container/VM realization;
- ingress/DNS/TLS;
- scaling/restart/health/backup.

### 3K/3L

- profile-specific scaffold/application shape;
- toolchain qualification.

---

## 19. Consequência arquitetural

O Conexus passa a ser descrito corretamente como:

```text
Conexus
├── Software Factory
│   └── constrói/verifica/releases Projects de ambos os profiles
│
└── Application Platform
    ├── Managed Runtime para software organizacional
    └── Platform Services consumíveis por Dedicated Apps via bindings
```

Isso permite que uma organização crie muitas soluções internas com baixo custo operacional e, ao mesmo tempo, permite que a mesma fábrica produza MetalDocs, Marketplace Central e futuros produtos com runtime e lifecycle próprios.

---

## 20. Não construir no F1

```text
- terceira classe de runtime sem consumidor real;
- runtime profile plugin registry;
- automatic MANAGED↔DEDICATED conversion;
- two Builder implementations;
- two Release domains;
- arbitrary deployment strategy DSL;
- mandatory Conexus auth for every Dedicated product;
- raw Workspace/Connection credentials inside Dedicated runtime;
- dedicated backend for every MANAGED app by default;
- forced Managed Runtime dependency for every Dedicated product.
```

## Próximo passo

3C deve agora completar as boundaries restantes à luz desta decisão. Em especial, a antiga pergunta `Published App Runtime` se divide corretamente em:

```text
Managed App Runtime
→ internal Hub/application-platform boundary

Dedicated Application Runtime
→ Project-produced deployable class, physical realization deferred to 3J
```

A próxima decisão pode então fechar Observability/remaining module boundaries sem voltar a tratar uma única topologia de serving como universal.