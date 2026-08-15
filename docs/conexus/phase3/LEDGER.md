# Fase 3 — Live Ledger

**Status geral:** EM ANDAMENTO  
**Estado:** `3B CLOSED` · `3C CLOSED` · `3D CLOSED / APROVADA` · próximo gate `3E — Data Architecture`  
**Base canônica da Fase 3:** `354f44219fb5970bb9233976773db90d2102ae7a`  
**Autoridade anterior:** C-000..C-017  
**Importante:** este ledger não constitui C-018, não encerra a Fase 3 inteira e não autoriza implementação.

## 1. Authority e precedência documental

Este arquivo é o único ledger vivo/navegação de status da Fase 3.

```text
C-000..C-017
→ autoridade fundacional anterior

3A/3B/3C approved docs
→ boundaries/ownership aprovados

3C-R1
→ reconciliação final de 3C

3D-01..3D-04
→ dependency architecture detalhada

3D-04
→ matriz final de imports/infra; prevalece onde estreita intenções anteriores

3D-R1
→ fechamento/reconciliação final de 3D

este LEDGER
→ status/navigation authority
```

Nenhuma conversa é authority. Arquivos `3D-FABLE-*` permanecem review inputs não-autoritativos; somente conteúdo ratificado em decisões aprovadas ganha authority.

---

## 2. Estado das fases

| Fase | Estado | Próxima ação |
|---|---|---|
| 3A — Architecture Reconciliation | CONTÍNUA até C-018 | aplicar findings materiais durante 3E–3O |
| 3B — System Context & Boundaries | **CLOSED / APROVADA** | reabrir apenas com Finding material |
| 3C — Domain / Module Architecture | **CLOSED / APROVADA** | reabrir apenas com Finding material |
| 3D — Dependency Architecture | **CLOSED / APROVADA** | [3D-R1](3D-R1-dependency-architecture-final-closure.md) |
| 3E — Data Architecture | **NEXT / NÃO INICIADA** | materializar ownership/schema/persistence a partir do intake 3D |
| 3F — Contracts & API Architecture | NÃO INICIADA | após dependencies/data adequados |
| 3G — Behavioral / State Architecture | NÃO INICIADA | FSMs/lifecycles |
| 3H — Runtime & Agent Architecture | NÃO INICIADA | realization/correlation/runtime mechanics |
| 3I — Security / Authority Architecture | NÃO INICIADA | trust/identity/egress |
| 3J — Deployment / Operations Architecture | NÃO INICIADA | local/server/cloud/topology |
| 3K — Frontend / Product Architecture | NÃO INICIADA | UX/scaffold/product surfaces |
| 3L — Technology Qualification | NÃO INICIADA | probes/qualification |
| 3M — Failure & Recovery Architecture | NÃO INICIADA | recovery/failure classes |
| 3N — Architecture Verification | NÃO INICIADA | adversarial verification |
| 3O — Vertical Architecture Proof Contract | NÃO INICIADA | end-to-end proof contract |

---

## 3. 3B — authority

Decisões 3B-01..3B-15 vivem em `../24-arquitetura-system-design.md`.

Detalhes adicionais:

- [3B-16 — Project-Internal Resource Ownership](3B-16-project-internal-resource-ownership.md)
- 3B-17 — Project Isolation and Explicit Reuse — registrada no ledger histórico `../24-arquitetura-system-design.md`.

3B permanece `CLOSED / APROVADA`.

---

## 4. 3C — decisões aprovadas

| ID | Boundary/decisão | Documento |
|---|---|---|
| 3C-01 | Modular Monolith | [3C-01](3C-01-modular-monolith.md) |
| 3C-02 | Identity & Access | [3C-02](3C-02-identity-access-module-boundary.md) |
| 3C-03 | Workspace | [3C-03](3C-03-workspace-module-boundary.md) |
| 3C-04 | Project | [3C-04](3C-04-project-module-boundary.md) |
| 3C-05 | Builder | [3C-05](3C-05-builder-module-boundary.md) |
| 3C-06 | Artifact Registry | [3C-06](3C-06-artifact-registry-module-boundary.md) |
| 3C-07 | Connections | [3C-07](3C-07-connections-module-boundary.md) |
| 3C-08 | Capability Gateway | [3C-08](3C-08-capability-gateway-module-boundary.md) |
| 3C-09 | Brain | [3C-09](3C-09-brain-module-boundary.md) |
| 3C-10 | Production Agent Runtime | [3C-10](3C-10-production-agent-runtime-module-boundary.md) |
| 3C-11 | Release | [3C-11](3C-11-release-module-boundary.md) |
| 3C-12 | Runtime Profiles `MANAGED | DEDICATED` | [3C-12](3C-12-application-runtime-profiles.md) |
| 3C-13 | Observability & Audit | [3C-13](3C-13-observability-audit-module-boundary.md) |
| 3C-14 | Attachments / Storage | [3C-14](3C-14-attachments-storage-boundary.md) |
| 3C-15 | Managed Application Runtime | [3C-15](3C-15-managed-application-runtime-boundary.md) |
| 3C-R1 | Cross-review Closure | [3C-R1](3C-R1-cross-review-closure.md) |

Builder runtime realization adicional:

- [3A-R5 — Builder / Coding Runtime Reassessment](3A-R5-builder-coding-runtime-reassessment.md)

---

## 5. 3D — CLOSED / APPROVED

| ID | Decisão | Documento |
|---|---|---|
| 3D-01 | Macro Dependency Architecture | [3D-01](3D-01-macro-dependency-architecture.md) |
| 3D-02 | Capability Gateway Dependency Architecture | [3D-02](3D-02-capability-gateway-dependency-architecture.md) |
| 3D-03 | Application / Use-case Orchestration | [3D-03](3D-03-application-use-case-orchestration.md) |
| 3D-04 | Remaining Module Dependency Closure | [3D-04](3D-04-remaining-module-dependency-closure.md) |
| 3D-R1 | Final Closure & Reconciliation | [3D-R1](3D-R1-dependency-architecture-final-closure.md) |

### Resultado final

```text
modular monolith
acyclic module import graph
direct-call-first
no cross-module table/internal access
immutable refs travel; revocable authority revalidates
Application Orchestration = control-plane-only
seven named F1 use cases
runtime never calls L7
one domain inversion only = effect approval claim
I&A directly resolved at L7 / MAR / Gateway
four justified infra boundaries only:
  CodingRuntime
  CredentialBackend
  BlobStore/CAS
  GitInfra
MigrationRunner = internal Release seam
job/v1 machinery = internal MAR seam
```

### Matriz final resumida

```text
Project      → Workspace
Connections  → Registry
Brain        → Registry
Release      → Project / Registry / Connections / Brain / Rigor
Gateway      → I&A / Project / Registry / Connections / Release
Builder      → Project / Brain / Registry / Gateway / Rigor
PAR          → Release / Registry / Brain / Gateway
MAR          → I&A / Attachments / Brain / Release / Gateway / PAR
```

Observability/Audit permanece leaf/sink de evidence/telemetry/audit.

### Use cases control-plane F1

```text
CreateProject
SetProjectBinding
QualifyConnection
InceptionInvestigation
BrainHealthProbe
ComposeRelease
PromoteRelease
```

`AnalyticQuery` é runtime sequencing direto:

```text
PAR → Brain + Gateway
MAR → Brain + Gateway
```

Review inputs preservados como evidência não-autoritativa:

- `3D-FABLE-R0-independent-dependency-review.md`
- `3D-FABLE-R1-capability-gateway-dependency-review.md`
- `3D-FABLE-R2-application-orchestration-review.md`
- `3D-FABLE-R2-1-analytic-query-orchestration-correction.md`
- `3D-FABLE-R3-remaining-dependency-closure-review.md`
- `3D-FABLE-R3-1-jobqueue-seam-correction.md`
- `3D-FABLE-R4-final-dependency-cross-review.md`

3D só pode ser reaberta por Finding material.

---

## 6. Mapa de módulos aprovado

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

Transversal:

```text
ApplicationRuntimeProfile
├── MANAGED
└── DEDICATED
```

`DEDICATED Application Runtime` é output/runtime de Project, não módulo do Hub.

Infrastructure não promovida a domínio:

```text
Git
PostgreSQL / Project Data
BlobStore / CAS
credential backend / vault
E2B / sandbox
Mastra substrate
MigrationRunner (internal Release seam)
job/queue/scheduler substrate (não selecionado)
serving/deployment infrastructure
```

---

## 7. Open findings / routed work

Estes itens não reabrem 3C/3D automaticamente.

| Finding / questão | Owner posterior |
|---|---|
| F3B-R1 — repo canônico/cutover do produto | 3A / operador — antes de implementação |
| F3B-R2 — legacy `MissionPlan v2` | 3F |
| F3B-R4 — browser/runtime physical trust zones | 3I/3J |
| N3 — Planning Depth × RigorProfile | 3G |
| F3D02-R1 — AgentRun in-flight × stricter new Release | 3G/3I |
| F3D04-R1 — serving route mapping physical representation | **3E/3J** |
| F3D04-R2 — archived Project with active Release | 3G/3I |
| Project binding contracts | 3F |
| DEDICATED identity/authority exchange | 3F/3I |
| DEDICATED egress/network policy | 3I/3J |
| MANAGED/DEDICATED deployment topology | 3J |
| Mastra storage/runtime isolation realization | **3E/3H** |
| Mastra telemetry ↔ Conexus correlation | 3H/3L |
| Verification Observability realization | 3H/3L/3N |
| job/v1 queue/scheduler substrate | 3H/3L only on concrete need |
| DEDICATED multi-install/fleet management | DEFER |

Guard notes:

- future `AgentTrigger EVENT` ingress must declare its authn/trust boundary when activated;
- DEDICATED Platform Services identity exchange must declare its authority boundary in 3F/3I.

---

## 8. Anti-overengineering guardrail

3D CLOSED does not authorize:

```text
microservices
EnvironmentModule
DeploymentModule
StorageModule
JobModule
SchedulerModule
WebhookModule
EventIngressModule before consumer
ApplicationLayerModule
InstallationModule
generic binding framework
workflow DSL / event bus / command bus
universal mediator / service locator
UseCaseBase / UseCaseBus / UseCaseRegistry
runtime → application-layer dispatcher
OPA/Cedar/OpenFGA
RigorModule / policy engine
Gateway split modules / AdmissionCore
UniversalExecutionContext
CallerAuthorityVerifier framework
shared JobQueue/Scheduler port without consumer
MigrationRunner provider framework
runtime profile plugin framework
Kafka/Kubernetes/Temporal by default
outbox/inbox for hypothetical local communication
```

Any of these returns only through the Decision Loop with a named consumer/failure class.

---

## 9. 3E intake — Data Architecture

3E inherits from 3D and must not re-decide module ownership/dependency direction.

Minimum intake:

```text
module-owned persistence/schema boundaries
Gateway admission/effect ledger
budget + idempotency + attempt/traffic-state persistence
CreateProject cross-owner atomic transaction realization
approval-claim + admission atomic relationship
MAR route→Project serving mapping persistence
Observability/Audit persistence + lineage projections
Mastra storage partition/isolation between Builder and PAR
physical representation of narrow refs/projections
no cross-owner persistence shortcut / hidden authority
```

Same PostgreSQL does **not** imply shared table ownership.

---

## 10. Próximo gate — 3E

3E — Data Architecture deve começar pela pergunta:

> Como materializar fisicamente as authorities e estados já aprovados, no menor modelo de dados suficiente, preservando module ownership, atomicidade necessária, auditabilidade e isolamento sem criar um "shared database domain"?

A primeira rodada deve fechar pelo menos:

```text
Hub control-plane persistence topology
module schema/table ownership
cross-module references vs FKs
transaction boundaries
immutable refs/digests
operational ledgers
Mastra substrate storage isolation
Project Data vs Hub control data separation
```

Não decidir em 3E:

```text
final HTTP/DTO contracts → 3F
full FSM semantics → 3G
runtime substrate selection → 3H/3L
security/egress policy → 3I
deployment topology → 3J
```

---

## 11. Regra de avanço

```text
3B = CLOSED
3C = CLOSED
3D = CLOSED / APPROVED
3E = NEXT
```

A Fase 3 completa continua em andamento até C-018. Nenhuma implementação de produto está autorizada por este ledger.
