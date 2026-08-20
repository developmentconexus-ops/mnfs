# 3C-15 — Managed Application Runtime Module Boundary

**Status:** APROVADO pelo operador em 2026-08-14  
**Fase:** 3C — Domain / Module Architecture  
**Importante:** esta decisão não constitui C-018, não encerra a Fase 3 e não autoriza implementação.

## Decisão em uma frase

No Conexus F1, `Managed Application Runtime` é a boundary in-process do Hub que **realiza Projects `MANAGED` sob uma Release ativa**. Ele owns a superfície de serving do aplicativo MANAGED, a resolução do runtime context, o serving do build real pinado pela Release, a compatibilidade do `runtimeContractDigest`, a superfície server-side do runtime SDK e o lifecycle operacional de `job/v1`. Ele não owns identidade, Release, ArtifactRevision, business data, Connections, Brain, agentes, attachments, audit ou capability admission/execution. `DEDICATED` não usa esta boundary como seu runtime.

A separação normativa é:

```text
Release
→ qual composição MANAGED está ativa

Managed Application Runtime
→ como essa composição MANAGED é materializada para uso

Capability Gateway
→ se/como query/action/integration pode executar

Production Agent Runtime
→ como agents pinados pela Release rodam
```

---

## 1. Finding que exigiu a boundary

O cross-review de 3C encontrou uma responsabilidade sem owner.

3C-11 já distinguia:

```text
Release
→ WHAT is active

Published runtime
→ HOW requests are served
```

3C-12 depois corrigiu a topologia universal para:

```text
ApplicationRuntimeProfile
├── MANAGED
└── DEDICATED
```

mas deixou explicitamente o `Managed App Runtime` para a etapa final de 3C. 3C-13 e 3C-14 passaram a consumir a ideia de um runtime MANAGED sem que a boundary fosse fechada.

O mesmo cross-review encontrou outro sintoma do mesmo gap: `job/v1` já é artifact F1 e possui queue/timeout/retry/lease/status/stop semantics em C-005, mas Registry só versiona, Gateway só admite/executa capabilities, e Production Agent Runtime executa agents. Faltava o runtime owner do job MANAGED.

3C-15 fecha os dois gaps sem criar `JobModule`, `SchedulerModule`, `PublishedRuntimeService` ou runtime plugin framework.

---

## 2. Responsabilidade do módulo

`Managed Application Runtime` responde à pergunta:

> Como uma Release MANAGED ativa se torna uma aplicação realmente utilizável, preservando as authorities já pertencentes aos demais módulos?

Ele owns semanticamente:

```text
MANAGED application serving boundary
serving-context resolution
active Release consumption
exact frontend build materialization
runtime-contract compatibility
runtime SDK server-side surface
routing to named platform capabilities
job/v1 operational execution lifecycle
runtime correlation / health facts próprios da surface
```

Ele é uma boundary de runtime/application platform, não um domínio de negócio do aplicativo.

---

## 3. O build servido é o build real

A propriedade aprovada em 3C-12 permanece:

```text
verified build artifact
=
artifact served by the active Release
```

Para um frontend React/Vite, por exemplo:

```text
source
  ↓ build
frontend dist real
  ↓ digest
Release R-18
  ↓ active
Managed Application Runtime
  ↓
serve exatamente aquele dist
```

O Runtime não reconstrói uma representação alternativa do app, não recompila no serve e não usa "último arquivo do filesystem" como authority.

Runtime/bootstrap config que eventualmente precise ser resolvida sem rebuild deve usar contratos não secretos definidos posteriormente em 3F/3K. Esta decisão não congela mutação dinâmica de `index.html`.

---

## 4. Serving context é derivado server-side

O browser não escolhe authority por payload.

O Managed Runtime deriva, conforme rota/host/surface e state autoritativo:

```text
Project
runtimeProfile = MANAGED
active Release
runtimeContractDigest
frontend/runtime identity
request surface
```

Identity & Access resolve o principal e o contexto de acesso `PUBLISHED_APP`.

Logo:

```text
browser-supplied projectId/releaseId/role
!= authority
```

Os detalhes físicos de route/host/same-origin/hostname ficam para 3F/3I/3J.

---

## 5. Runtime SDK surface

C-005/C-012 já congelaram a intenção de um runtime SDK restrito para o app publicado.

3C-15 atribui a boundary de entrada desse SDK ao Managed Runtime.

Conceitualmente:

```text
Browser / Managed App
        ↓
runtime SDK request
        ↓
Managed Application Runtime
        ├── resolve serving context
        ├── resolve principal/access context via I&A
        ├── enforce runtime-contract compatibility
        └── route to exact runtime capability owner
```

Não significa que Managed Runtime execute a regra de negócio.

Exemplos:

```text
query/action/integration
→ Capability Gateway

agent interaction
→ Production Agent Runtime

attachment lifecycle
→ Attachments
```

DTOs, HTTP routes, envelope e SDK codegen pertencem a 3F/3K.

---

## 6. `runtimeContractDigest` compatibility

O runtime MANAGED é o owner da compatibilidade browser ↔ serving runtime para a Release ativa.

Exemplo:

```text
browser code = contract C17
active Release = contract C18
```

O sistema não permite que código stale atravesse silenciosamente um contrato incompatível.

A taxonomia final de read/action behavior (`CLIENT_OUTDATED`, reload, fail-closed etc.) permanece sob as regras já aprovadas por C-012 e será formalizada em 3F/3G.

Regra:

```text
runtime contract compatibility
→ Managed Application Runtime

capability business admission
→ Gateway / domain owners
```

---

## 7. `job/v1` — runtime owner, sem `JobModule`

`job/v1` continua artifact Project-scoped versionado pelo Artifact Registry e pinado pela Release.

No regime MANAGED:

```text
job artifact revision
        ↓
active Release
        ↓
Managed Application Runtime
        ↓
job execution lifecycle
```

O Managed Runtime owns semanticamente a realização operacional necessária para:

```text
dispatch/enqueue
queued/running/terminal lifecycle
lease/ownership of execution attempt
timeout
retry policy realization
status
cancel/stop request semantics
version-locking to the Release/revision that started the run
correlation to observability
```

A forma persistida final e o nome de eventual record (`JobRun` ou equivalente) ficam para 3E/3G.

### Job não ganha poder direto

Quando o job acessa Project Data ou sistema externo:

```text
Managed job execution
→ Capability Gateway
→ Project Data / Connection / external target
```

Logo:

```text
Job Runtime semantics
!=
Capability execution authority
```

### Scheduling

3C-15 não congela scheduler próprio nem substrate. Se o primeiro job recorrente exigir schedule, 3H/3L qualificam a menor realization suficiente — por exemplo queue/scheduler já existente — sem criar domínio `Scheduler`.

---

## 8. Sync/ETL

Quando um sync/ETL MANAGED é realizado como `job/v1`, o mesmo owner vale:

```text
sync contract / artifact
→ Registry + semantic owner aplicável

job execution lifecycle
→ Managed Application Runtime

external reads/effects
→ Capability Gateway + Connections

business rows
→ Project Data
```

Cursor, staging, delete policy e data semantics continuam conforme C-006/C-007; o Managed Runtime não passa a ser owner do significado do sync.

---

## 9. Boundary com RunPreview — machinery pode ser reutilizada, authority não

`RunPreview` continua pertencendo ao lifecycle do Builder/Control Plane.

```text
Builder
→ owns candidate / preview lifecycle

Identity & Access
→ owns PREVIEW access context
```

Quando o candidate é MANAGED, a plataforma pode reutilizar a mesma machinery técnica de serving/runtime para materializar o candidate.

Mas:

```text
shared serving machinery
!=
shared authority
```

Preview não resolve a active PROD Release, não herda app membership de produção e não transforma o Managed Runtime em owner do candidate.

A realização exata de candidate-serving fica para 3H/3J/3K.

---

## 10. Boundary com Release

Release owns:

```text
ReleaseManifest
Release eligibility
Promotion
active PROD pointer
EnvironmentConformance
production migration orchestration
rollback/re-point
SERVED_VERIFIED
```

Managed Runtime apenas consome a composição ativa.

```text
Release says WHAT is active.
Managed Runtime realizes HOW MANAGED requests/jobs use it.
```

Managed Runtime não promove, não troca pointer e não escolhe revision mais nova por conta própria.

---

## 11. Boundary com Identity & Access

I&A owns Account/session/memberships/grants/roles/effective access context.

Managed Runtime:

- deriva a surface e recurso server-side;
- solicita/consome o access context aplicável;
- nunca cria role paralela;
- nunca trata `I&A ALLOW` como bypass de Gateway/domain preconditions.

```text
app access ALLOW
!=
capability execution ALLOW
```

---

## 12. Boundary com Capability Gateway

Managed Runtime não se torna segundo Gateway.

Ele pode receber:

```text
execute(slug, input)
```

mas a execução de Project Data / external integration é encaminhada ao Gateway, que continua owner do last-mile admission e physical execution boundary.

Managed Runtime owns request/runtime context; Gateway owns capability admission/execution.

---

## 13. Boundary com Production Agent Runtime

Uma interação com agent pinado pela Release segue:

```text
Managed App
→ Managed Application Runtime
→ Production Agent Runtime
→ Capability Gateway quando houver tool/capability
```

Conversation/AgentRun/ApprovalRequest/AgentTrigger permanecem no Production Agent Runtime.

Managed Runtime não chama model/provider diretamente para "implementar chat".

---

## 14. Boundary com Attachments

Upload/download/lifecycle de arquivo lógico MANAGED pertence a Attachments.

Managed Runtime apenas fornece a surface da aplicação para expressar a intenção e transportar a request autenticada ao owner apropriado.

```text
runtime serving
!=
attachment lifecycle
```

---

## 15. Boundary com Observability & Audit

Managed Runtime produz fatos de serving/job/runtime e correlation metadata.

Observability & Audit continua owner de Audit Trail e Operational Telemetry.

Managed Runtime não usa telemetry como authority de Release, auth ou correctness.

---

## 16. `DEDICATED` não usa esta boundary como runtime

Um Project `DEDICATED` produz seu próprio Application Runtime.

```text
DEDICATED Project
→ own frontend/server/data/runtime as applicable
```

Ele pode consumir Platform Services Conexus por bindings explícitos, mas não é materializado "dentro" do Managed Application Runtime.

Isso preserva a razão arquitetural da 3C-12:

```text
MANAGED
→ application-platform-first

DEDICATED
→ software-product-first
```

---

## 17. In-process no F1

`Managed Application Runtime` é módulo/boundary do modular monolith.

F1 não cria processo/service independente apenas para servir apps MANAGED.

Separação física só volta à decisão sob failure class real como:

```text
public internet trust boundary
independent scale
blast-radius requirement
multi-node serving
availability lifecycle independente
```

A topologia concreta permanece 3J.

---

## 18. O que NÃO construir por 3C-15

```text
- PublishedRuntime microservice;
- JobModule separado;
- SchedulerModule separado;
- Queue abstraction/plugin framework;
- runtime profile plugin registry;
- generic deployment target registry;
- per-app backend/container para MANAGED por default;
- own authorization model no runtime;
- direct Connection credentials no app/runtime;
- second capability gateway;
- automatic MANAGED↔DEDICATED conversion;
- RunPreview domain transfer para Managed Runtime.
```

---

## 19. Deliberadamente deixado para fases posteriores

### 3D

- grafo de dependências e ports sem cycles;
- application/use-case orchestration entre Runtime, Release, I&A, Gateway, Agent Runtime e Attachments.

### 3E

- records de runtime/job necessários;
- ownership físico de job state e runtime metadata.

### 3F

- runtime SDK/HTTP contracts;
- server-side context contract;
- job commands/status/errors;
- Dedicated → Conexus service contracts.

### 3G

- job lifecycle/FSM;
- cancel/retry/lease semantics finais;
- stale/runtime-contract transitions.

### 3H

- queue/job substrate interaction;
- Builder Preview realization;
- runtime correlation.

### 3I

- runtime trust/auth boundaries;
- Dedicated identity exchange;
- sensitive runtime config.

### 3J

- localhost/LAN/tailnet/cloud;
- process/container topology;
- DNS/TLS/ingress;
- supervision/restart/health.

### 3K/3L

- scaffold/runtime client shape;
- technology qualification for job/serving machinery.

---

## 20. Invariantes aprovadas

1. `Managed Application Runtime` existe somente para o profile `MANAGED`.
2. O frontend servido é o build real pinado pela Release ativa.
3. Browser não escolhe Project/Release/role authority por payload.
4. I&A continua authority de principal/access; Managed Runtime apenas consome o contexto.
5. Gateway continua authority de capability admission/execution.
6. Production Agent Runtime continua authority de Conversation/AgentRun/ApprovalRequest.
7. Attachments continua authority de attachment lifecycle.
8. Release continua authority de active composition/Promotion.
9. `job/v1` MANAGED tem runtime owner no Managed Application Runtime; não nasce JobModule.
10. Job effects/data access continuam via Gateway quando cruzam a capability boundary.
11. RunPreview continua Builder/Control Plane authority; serving machinery pode ser reutilizada sem transferir ownership.
12. `DEDICATED` possui runtime próprio e não é hospedado semanticamente por esta boundary.
13. F1 permanece modular monolith; separação física é deferida.
14. Queue/scheduler/provider concreto não é decidido em 3C.

## Consequência

Com 3C-15, o caminho MANAGED deixa de possuir um owner ausente:

```text
Browser
  ↓
Managed Application Runtime
  ├── I&A
  ├── active Release
  ├── query/action/integration → Gateway
  ├── agent → Production Agent Runtime
  ├── job → managed job lifecycle → Gateway quando necessário
  └── attachment → Attachments
```

A boundary fecha serving e job runtime sem ampliar authority de nenhum domínio existente.