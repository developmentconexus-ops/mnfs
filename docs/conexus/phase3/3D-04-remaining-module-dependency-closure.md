# 3D-04 — Remaining Module Dependency Closure

**Status:** APROVADO  
**Fase:** 3D — Dependency Architecture  
**Importante:** esta decisão não constitui C-018, não encerra a Fase 3, não autoriza implementação, merge, PR readiness nem início de 3E antes do cross-review final de 3D.

## Decisão em uma frase

O Conexus F1 fecha o grafo restante do modular monolith como um DAG menor que a hipótese inicial: módulos interiores não re-resolvem I&A; authz entra por três boundaries explícitas (Control Plane/L7, Managed Application Runtime e Capability Gateway); Managed Runtime consome apenas as boundaries necessárias e serve bytes imutáveis diretamente por BlobStore/CAS; `MigrationRunner` e machinery de `job/v1` permanecem seams internos dos respectivos owners; e as únicas portas de infraestrutura congeladas em 3D são as quatro que já possuem failure class/consumer real: `CodingRuntime`, `CredentialBackend`, `BlobStore/CAS` e `GitInfra`.

---

## 1. Precedência e inputs

Esta decisão reconcilia:

- C-000..C-017;
- 3C-01..3C-15 + 3C-R1;
- 3A-R5;
- 3D-01 — Macro Dependency Architecture;
- 3D-02 — Capability Gateway Dependency Architecture;
- 3D-03 — Application / Use-case Orchestration;
- `3D-FABLE-R3-remaining-dependency-closure-review.md` como review não-autoritativo;
- `3D-FABLE-R3-1-jobqueue-seam-correction.md` como correção não-autoritativa da R3.

Quando esta decisão estreita uma aresta anteriormente descrita de forma mais ampla em 3D-01/R0, **3D-04 prevalece para o grafo final de imports**, sem mover ownership de 3C.

---

## 2. Resultado do fechamento

A varredura final remove dependências que não pagam seu custo:

```text
Connections -X-> I&A
Builder     -X-> I&A
PAR         -X-> I&A
Attachments -X-> I&A
Project     -X-> I&A
```

Esses módulos continuam recebendo contextos/refs necessários e enforçando suas próprias invariantes, mas **não re-resolvem principal/membership/access**.

A única nova aresta de módulo introduzida durante 3D permanece:

```text
Managed Application Runtime → Brain
```

limitada ao consumo runtime já justificado — principalmente compilação de `AnalyticQuery` e leitura de projeções de health quando aplicável.

Nova dependência de infraestrutura justificada:

```text
Managed Application Runtime → BlobStore/CAS
```

para servir bytes content-addressed do frontend/runtime por digest, sem transformar Artifact Registry em CDN/serving layer.

Não nasce:

```text
Managed Application Runtime → Artifact Registry
Managed Application Runtime → Project
Release → Managed Application Runtime
Release → Builder
```

---

## 3. Regra final de authz — três boundaries

I&A é resolvida diretamente em exatamente três boundaries do import graph:

```text
1. L7 / Control Plane
   → resolve principal + authority antes de chamar use case/operação

2. Managed Application Runtime
   → resolve principal + PUBLISHED_APP access context por request

3. Capability Gateway
   → revalida a authority revogável/material aplicável ao caller/surface
      no last-mile admission
```

Regra normativa:

> **Módulo interior não importa I&A para re-resolver principal. A boundary de entrada resolve o access context; authority revogável/material é revalidada no enforcement point já definido por 3D-02.**

Isso não elimina defense-in-depth físico. 3I ainda poderá exigir egress controls, database roles, CSP, sandboxing e outras fronteiras físicas.

Não autoriza confiar em boolean snapshots como:

```text
wasAuthorized = true
sessionWasValid = true
```

quando 3D-02 exige revalidação na hora H.

---

## 4. Matriz final de módulos

Linha importa coluna. `●` = direct public dependency permitida. `approval` = única inversão estreita de domínio aprovada. Vazio = import proibido. Emissão para Observability é tratada separadamente como leaf/sink e não aparece na matriz.

| importa → | IAM | WS | REG | RIGOR | ATT | CON | BRN | PRJ | REL | GW | BLD | PAR | MAR |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **IAM** | · | | | | | | | | | | | | |
| **WS** | | · | | | | | | | | | | | |
| **REG** | | | · | | | | | | | | | | |
| **RIGOR** | | | | · | | | | | | | | | |
| **ATT** | | | | | · | | | | | | | | |
| **CON** | | | ● | | | · | | | | | | | |
| **BRN** | | | ● | | | | · | | | | | | |
| **PRJ** | | ● | | | | | | · | | | | | |
| **REL** | | | ● | ● | | ● | ● | ● | · | | | | |
| **GW** | ● | | ● | | | ● | | ● | ● | · | | approval | |
| **BLD** | | | ● | ● | | | ● | ● | | ● | · | | |
| **PAR** | | | ● | | | | ● | | ● | ● | | · | |
| **MAR** | ● | | | | ● | | ● | | ● | ● | | ● | · |

Application / use-case orchestration L7 pode coordenar os módulos necessários aos **sete named control-plane flows aprovados em 3D-03**, mas isso não transforma L7 em universal mediator nem autoriza runtime→L7.

Ordem topológica conceitual:

```text
OBS
< {IAM, WS, REG, RIGOR}
< {ATT, CON, BRN, PRJ}
< REL
< GW
< {BLD, PAR}
< MAR
< L7/control-plane orchestration
```

Toda aresta da matriz aponta para baixo. **Nenhum ciclo estrutural permanece.**

---

## 5. Fechamento por módulo

### 5.1 Identity & Access

I&A permanece owner de identity/authentication/access-context semantics.

No import graph:

```text
I&A → Observability emit
```

I&A opera sobre IDs opacos e não precisa importar Workspace/Project/consumidores para navegar recursos.

Consumidores diretos autorizados de I&A no grafo final:

```text
L7 / Control Plane
Managed Application Runtime
Capability Gateway
```

### 5.2 Workspace

Workspace permanece structural root/Area owner e não vira registry de recursos.

```text
Workspace → Observability
Project   → Workspace
```

Nada adicional.

### 5.3 Project

Project final depende de:

```text
Workspace
GitInfra (repository association/mechanics boundary)
Observability emit
```

Bindings que exigem semantic validation continuam via `SetProjectBinding` de 3D-03; não justificam `Project → Brain/Connections`.

Project não importa Builder, Release, I&A ou Gateway.

### 5.4 Artifact Registry

Registry final depende de:

```text
BlobStore/CAS
Observability emit
```

Registry continua leaf de domain dependencies:

- não chama compilers especializados;
- não executa artifact;
- não promove Release;
- não resolve credential;
- não serve frontend/runtime por conveniência.

### 5.5 Connections

Connections final depende de:

```text
Artifact Registry
CredentialBackend
Observability emit
```

Qualification continua `QualifyConnection` em L7:

```text
Connections state/ref
→ Gateway physical probe
→ Connections interpretation/state
```

Connections não importa Gateway ou I&A.

### 5.6 Brain

Brain final depende de:

```text
Artifact Registry
Observability emit
```

Physical reads permanecem no Gateway.

Runtime consumers:

```text
PAR → Brain
MAR → Brain
```

para `AnalyticQuery`/health projections conforme 3D-03, sem criar `AnalyticQueryUseCase` ou mediator runtime.

### 5.7 Release

Release final depende de:

```text
Project
Artifact Registry
Connections
Brain
shared Rigor evaluation primitive
production DB/serving infra necessários à Promotion
Observability emit
```

Não depende de:

```text
Builder
Managed Application Runtime
I&A
```

`ChangeAcceptance` chega via `ComposeRelease`; served verification é dirigido pelo `PromoteRelease` usando probe/cliente de serving, sem reverse import.

### 5.8 Capability Gateway

Mantém 3D-02:

```text
Gateway → I&A / Project / Registry / Connections / Release
Gateway → CredentialBackend infra
PAR     → Gateway approval-claim contract implementation
```

Gateway não ganha Brain, Builder, MAR ou Attachments como dependência.

### 5.9 Builder

Builder final depende de:

```text
Project
Brain
Artifact Registry
Capability Gateway
shared Rigor evaluation primitive
CodingRuntime
GitInfra
Observability emit/query para Verification Observability
```

Builder não re-resolve I&A; control-plane checkpoints são autorizados antes do dispatch e Gateway revalida a authority material quando cruza capability boundary.

### 5.10 Production Agent Runtime

PAR final depende de:

```text
Release
Artifact Registry
Brain
Capability Gateway
Mastra substrate isolado
Observability emit
```

PAR implementa a narrow approval-claim capability definida pelo Gateway.

PAR não importa I&A: caller/authority context é derivado pela surface apropriada e o Gateway revalida authority material na admission. Scheduled/background agents não dependem de sessão humana viva.

### 5.11 Managed Application Runtime

MAR final depende de:

```text
I&A
Release
Capability Gateway
Production Agent Runtime
Attachments
Brain
BlobStore/CAS
Observability emit
```

Responsabilidades dependency-relevant:

- serving context e PUBLISHED_APP access;
- runtime-contract compatibility;
- serving dos bytes imutáveis pinados por digest;
- query/action/integration → Gateway;
- agent → PAR;
- attachment → Attachments;
- AnalyticQuery → Brain compile + Gateway execute;
- `job/v1` lifecycle interno ao MAR.

Não nasce:

```text
MAR → Project
MAR → Registry
MAR → shared JobQueue port
```

O mapping host/route→Project/active serving identity é estado operacional da serving boundary; sua forma física segue para 3E/3J.

### 5.12 Attachments

Attachments final depende de:

```text
BlobStore/CAS
Observability emit
```

A surface entrega access context validado. Attachments enforça suas invariantes próprias de ownership/lifecycle/Project association sem re-resolver membership no I&A.

### 5.13 Observability & Audit

Observability permanece leaf absoluta de domain imports.

```text
Module → OBS emit/query capability
OBS -X-> module internals
```

Telemetry nunca vira authority.

---

## 6. Infra ports/seams finais de 3D

### Portas/capabilities justificadas agora

Apenas quatro infrastructure boundaries são congeladas como portas/seams substituíveis explícitos porque já possuem consumidor/failure class real:

```text
CodingRuntime
→ Builder
→ Mastra Code hoje; fallback/challenger já é requirement real de 3A-R5

CredentialBackend
→ Connections + Gateway
→ secret material/custody substituível já é invariante

BlobStore/CAS
→ Registry + Attachments + MAR
→ mesmo primitive de bytes content-addressed, consumidores reais distintos

GitInfra
→ Project + Builder + Hub-side Git operations
→ provider/transport mechanics separados da semântica de Project/Builder
```

### Seams internos — não portas genéricas

```text
MigrationRunner
→ seam interno do Release/Promotion

job/v1 execution machinery
→ seam interno do Managed Application Runtime

serving verification client/probe
→ detalhe do PromoteRelease flow
```

`MigrationRunner` e job machinery **não** viram provider abstractions hoje porque têm um único owner real e nenhum substituto/failure class que exija uma boundary compartilhada.

### JobQueue/Scheduler

F1 **não congela shared `JobQueue`/Scheduler port**.

```text
job/v1
→ MAR-owned internal machinery
→ substrate escolhido/qualificado em 3H/3L quando necessário

L7 housekeeping/background work
→ menor mecanismo suficiente no primeiro consumidor real
→ não é pré-unificado com job/v1
```

Gatilho para reconsiderar uma capability compartilhada:

> surgir fora do MAR uma segunda machinery concreta com os mesmos requisitos operacionais de lease/retry/status/version-lock e benefício real de compartilhamento.

---

## 7. Narrow projections/contexts finais

3D fecha apenas as necessidades sem prescrever DTOs de 3F:

```text
I&A
→ EffectiveAccessContext

Release
→ ActiveReleaseComposition / exact composition by digest

Connections
→ ConnectionExecutionFacts

Project
→ identity/runtimeProfile/binding/config facts necessários por consumer

Builder
→ ChangeAcceptance / candidate/evidence refs

Registry
→ ExactRevision / ArtifactRef / compiled payload ref

Brain
→ compileAnalyticQuery + health/effective projections necessárias

Observability
→ audit/telemetry queries para verifier/control-plane
```

Caller contexts permanecem surface-specific conforme 3D-02:

```text
BuilderExecutionContext
AgentExecutionContext
ServingContext
QualificationContext
```

Nenhum pacote universal de DTOs/contextos nasce.

---

## 8. Findings roteados — não bloqueiam 3D

### F3D04-R1 — Serving route mapping physical representation

O mapping host/route→Project/serving identity pertence semanticamente à boundary do Managed Runtime. A forma persistida/índices/constraints ficam para **3E** e a topologia/hostname para **3J**.

Não exige `MAR → Project`.

### F3D04-R2 — Project archived com Release ativa

3D não decide se um Project arquivado com Release ativa continua servível, drena ou deixa de servir imediatamente. Isso é lifecycle/authority behavior e segue para **3G/3I**.

Nenhuma resposta plausível exige nova aresta de módulo.

---

## 9. Anti-overengineering / forbidden shortcuts

3D-04 reforça:

```text
no per-module I&A re-resolution
no MAR → Registry para servir bytes
no MAR → Project só para validar existência
no Release → Builder
no Release → MAR
no generic JobQueue/Scheduler port antes do consumer
no MigrationRunner provider framework
no generic infra adapter catalog
no UniversalContext/UniversalAuthoritySnapshot
no event bus/outbox para comunicação local futura
no workflow engine para compor os sete use cases
```

Uma tecnologia usada por dois lugares não vira domínio compartilhado automaticamente; semântica e failure class decidem a boundary.

---

## 10. Consequências para implementação futura

A implementação deverá conseguir enforçar mecanicamente:

- allowed/forbidden module edges da matriz;
- imports apenas via public internal entrypoints;
- ausência de cycles;
- ausência de cross-module table access;
- ausência de runtime→L7;
- única domain inversion = approval claim;
- quatro infra boundaries justificadas, sem gerar adapters extras por convenção.

A ferramenta exata permanece para 3L/implementation; 3D congela a propriedade, não o pacote npm.

---

## 11. Próximo gate — 3D-R1

3D-04 não fecha 3D sozinha.

Antes de iniciar 3E, executar um **cross-review final de Dependency Architecture** que deve provar:

1. matriz 3D-04 consistente com 3D-01/02/03 e precedência explicitada onde 3D-04 estreitou linguagem anterior;
2. zero cycles no import graph completo;
3. zero module→L7;
4. os sete use cases continuam sem invariantes de domínio vazadas para L7;
5. a única domain inversion continua sendo approval claim;
6. quatro infra boundaries passam burden-of-proof individual;
7. nenhum finding aberto exige reabrir ownership de 3C;
8. findings roteados têm owner posterior explícito.

Se o cross-review passar, `3D = CLOSED / APROVADA` e o próximo estágio será `3E — Data Architecture`.

---

*Fim de 3D-04. Nenhuma implementação de produto é autorizada por esta decisão.*