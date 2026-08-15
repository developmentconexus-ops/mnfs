# Fase 3 — Live Ledger

**Status geral:** EM ANDAMENTO  
**Estado:** `3B CLOSED` · `3C CLOSED` · `3D EM ANDAMENTO — 3D-01 + 3D-02 + 3D-03 APROVADAS` · próximo gate `3D-04 — Remaining Module Dependency Closure`  
**Base canônica da Fase 3:** `354f44219fb5970bb9233976773db90d2102ae7a`  
**Autoridade anterior:** C-000..C-017  
**Importante:** este ledger não constitui C-018, não encerra a Fase 3 inteira e não autoriza implementação.

## 1. Authority e precedência documental

A partir do fechamento de 3C, **este arquivo é o único ledger vivo/navegação de status da Fase 3**.

`../24-arquitetura-system-design.md` permanece autoridade histórica/detalhada das decisões 3B registradas nele, mas sua antiga afirmação de ser o "ledger vivo" fica superseded por este arquivo para evitar dupla autoridade de status.

Regras:

```text
C-000..C-017
→ autoridade fundacional anterior

3A/3B/3C approved docs
→ refinam/supersede linguagem anterior somente quando explicitamente declarado

3C-R1
→ authority de reconciliação final de 3C sobre nomenclatura/escopo conflitante

3D approved docs
→ fecham dependency architecture sem reabrir ownership de 3C salvo Finding material

este LEDGER
→ status/navigation authority
→ não substitui conteúdo detalhado dos decision docs
```

Nenhuma conversa é authority. Review briefs/reviews como `3D-FABLE-*` são inputs não-autoritativos até que conteúdo seja ratificado por decisão aprovada. O repositório deve bastar para reconstruir o estado da arquitetura.

---

## 2. Estado das fases

| Fase | Estado | Próxima ação |
|---|---|---|
| 3A — Architecture Reconciliation | CONTÍNUA até C-018 | aplicar apenas findings materiais durante 3D–3O |
| 3B — System Context & Boundaries | **CLOSED / APROVADA** | nenhuma reabertura sem finding material |
| 3C — Domain / Module Architecture | **CLOSED / APROVADA** | nenhuma reabertura sem finding material |
| 3D — Dependency Architecture | **EM ANDAMENTO — 3D-01 + 3D-02 + 3D-03 APROVADAS** | 3D-04 Remaining Module Dependency Closure |
| 3E — Data Architecture | NÃO INICIADA | após 3D |
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
| 3C-12 | Application Runtime Profiles `MANAGED | DEDICATED` | [3C-12](3C-12-application-runtime-profiles.md) |
| 3C-13 | Observability & Audit | [3C-13](3C-13-observability-audit-module-boundary.md) |
| 3C-14 | Attachments / Storage Boundary | [3C-14](3C-14-attachments-storage-boundary.md) |
| 3C-15 | Managed Application Runtime | [3C-15](3C-15-managed-application-runtime-boundary.md) |
| 3C-R1 | Cross-review Closure & Reconciliation | [3C-R1](3C-R1-cross-review-closure.md) |

Builder runtime realization adicional:

- [3A-R5 — Builder / Coding Runtime Reassessment](3A-R5-builder-coding-runtime-reassessment.md)

---

## 5. 3D — decisões aprovadas

| ID | Decisão | Documento |
|---|---|---|
| 3D-01 | Macro Dependency Architecture | [3D-01](3D-01-macro-dependency-architecture.md) |
| 3D-02 | Capability Gateway Dependency Architecture | [3D-02](3D-02-capability-gateway-dependency-architecture.md) |
| 3D-03 | Application / Use-case Orchestration | [3D-03](3D-03-application-use-case-orchestration.md) |

### 3D-01 congela

```text
acyclic import graph
direct-call-first
named application orchestration only when justified
immutable/content-addressed refs travel; revocable authority revalidates
single narrow approval revalidation inversion
Release -X-> Builder direct import
shared pure Rigor evaluation primitive
cross-module transaction atomicity without cross-module data ownership
no hidden mutable substrate coupling
mechanically enforceable dependency boundaries; tooling still open
```

### 3D-02 congela

```text
Gateway = one Admission + Execution boundary
GW direct projections only from I&A / Project / Registry / Connections / Release
source of composition/binding is surface-specific
PUBLISHED_APP → active Release pins
AGENT_RUN → run-pinned composition
BUILDER/CANDIDATE → current approved Project/Change intent
QUALIFICATION → exact ConnectionRevision/ConnectorDefinition
caller authority revalidation is surface-specific
approval effect = exact single-claim/replay-safe atomic admission
Gateway-owned effect/idempotency/budget-enforcement mechanics
architecturally closed admission authority families
reads stay lightweight
health != authorization
OUTCOME_UNKNOWN != blind retry
```

### 3D-03 congela

```text
Application / Use-case Orchestration = control-plane-only
module/runtime → Application Layer é proibido
use case não aninha use case por default
use case owns coordination, nunca domain truth
cross-owner ordering/atomicity pode pertencer ao named use case
nenhuma transaction de orchestration atravessa external I/O
sete named F1 use cases:
  CreateProject
  SetProjectBinding
  QualifyConnection
  InceptionInvestigation
  BrainHealthProbe
  ComposeRelease
  PromoteRelease
AnalyticQuery = direct runtime sequencing
PAR → Brain + Gateway
MAR → Brain + Gateway
nova aresta estreita MAR → Brain aprovada
```

Review inputs preservados, sem authority própria:

- `3D-FABLE-R0-independent-dependency-review.md` — revisão adversarial que alimentou 3D-01.
- `3D-FABLE-R1-capability-gateway-dependency-review.md` — revisão adversarial que alimentou 3D-02.
- `3D-FABLE-R2-application-orchestration-review.md` — revisão adversarial que alimentou 3D-03.
- `3D-FABLE-R2-1-analytic-query-orchestration-correction.md` — correção adversarial que removeu o `AnalyticQueryUseCase` e fechou runtime → L7.

Próximo gate:

```text
3D-04 — Remaining Module Dependency Closure
```

---

## 6. Mapa final de módulos 3C

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
ApplicationRuntimeProfile
├── MANAGED
└── DEDICATED
```

`DEDICATED Application Runtime` é runtime/output do Project e não módulo do Hub.

Infrastructure não promovida a domínio:

```text
Git
PostgreSQL / Project Data infrastructure
BlobStore / CAS
credential backend / vault
E2B / sandbox
Mastra substrate
MigrationRunner
queue/job substrate
serving/deployment infrastructure
```

---

## 7. Cross-review 3C — resultado

Veredito final: **CLOSE 3C WITH BOUNDED AMENDMENTS → amendments applied by 3C-15 + 3C-R1.**

Findings resolvidos:

- Managed App Runtime owner ausente → **3C-15**.
- `job/v1` runtime owner ausente → **3C-15**, sem `JobModule`.
- `AgentTrigger EVENT` sem ingress owner → `EVENT` reserved/deferred; `SCHEDULE` operacional F1.
- C-016 Gateway-only universal × DEDICATED → scope refinado em 3C-R1.
- DEDICATED multi-install → explicitamente DEFER.
- Inception execution dispatcher → Project authority + Builder engineering execution capability.
- application/orchestration layer implícita → declarada por 3C-R1; dependency/orchestration rules agora **CLOSED por 3D-01/3D-03**.
- Brain `EVIDENCE` collision → `EVIDENCE_SPEC` semantic rename.
- binding authority pattern → Git authoring + Project approved intent + Registry compiled revision + specialized validation + Release pin.
- stale Pi/Workspace/Storage/Deployment terminology → precedence registrada.

Não foram encontrados blockers restantes de module ownership.

---

## 8. Open findings / routed work

Estes itens **não reabrem 3C**; possuem owner posterior explícito.

| Finding | Owner |
|---|---|
| F3B-R1 — repo canônico/cutover do produto | 3A / operador — resolver antes de implementação |
| F3B-R2 — legacy `MissionPlan v2` | 3F — re-tipar para Change/Work Unit; não restaurar Mission/Milestone/Feature |
| F3B-R4 — browser/runtime physical trust zones | 3I/3J |
| N3 — Planning Depth × RigorProfile | 3G — primitive compartilhada posicionada em 3D-01; relação behavioral ainda aberta |
| Gateway↔Builder/Connections/AgentRuntime conceptual cycles | **dependency direction CLOSED por 3D-01/3D-02** |
| F3D02-R1 — in-flight AgentRun policy narrowing após nova Release mais restritiva | **3G/3I** — não assumir preserve/revoke silenciosamente |
| Managed Runtime + remaining module dependency graph/ports | **3D-04** |
| Project binding contracts | 3F |
| DEDICATED identity/authority exchange | 3F/3I |
| DEDICATED network/egress physical policy | 3I/3J |
| MANAGED/DEDICATED deployment topology | 3J |
| Mastra telemetry ↔ Conexus correlation realization | 3H/3L |
| Mastra substrate isolation Builder × Production Agent Runtime | regra de dependency em **3D-01**; realization em 3H |
| Verification Observability realization (Spotlight/OTel/etc.) | 3H/3L/3N |
| DEDICATED multi-install/fleet management | DEFER; trigger = first external independent installation requiring Conexus-governed lifecycle |

---

## 9. Anti-overengineering guardrail

3C CLOSED + 3D-01/3D-02/3D-03 APPROVED não autorizam criar:

```text
microservices
EnvironmentModule
DeploymentModule
StorageModule
JobModule
SchedulerModule
WebhookModule
EventIngressModule
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
UniversalExecutionContext / CallerAuthorityVerifier
runtime profile plugin framework
Kafka/Kubernetes/Temporal as defaults
outbox/inbox apenas para comunicação local futura
```

Qualquer item só volta ao Decision Loop com consumidor/failure class real.

---

## 10. Próximo gate — 3D-04

3D-04 deve fechar o dependency graph restante e provar que o conjunto final de módulos continua acíclico após 3D-01/02/03.

Prioridade:

```text
Managed Application Runtime
  → I&A / Release / Gateway / PAR / Attachments / Observability / Brain
  → job/queue substrate como infra, não domínio

Release
  → Project / Registry / Connections / Brain / migration+serving infra
  -X-> Builder / MAR reverse import

Builder / Project / Inception
Connections / Qualification
Brain / Registry / health paths
Production Agent Runtime
Attachments
Workspace
Identity & Access
Observability & Audit
shared primitives / infrastructure seams
```

3D-04 deve produzir:

```text
remaining allowed/forbidden edge closure
narrow projections/contexts necessários
no hidden cycles
no new generic ports sem failure class
full compatibility com 3D-03 runtime-vs-control-plane rule
```

Se o fechamento estiver limpo, a próxima ação será uma cross-review final de 3D antes de 3E.

---

## 11. Regra de avanço

```text
3B = CLOSED
3C = CLOSED
3D = EM ANDAMENTO
3D-01 = APPROVED
3D-02 = APPROVED
3D-03 = APPROVED
3D-04 = NEXT
```

A Fase 3 completa continua em andamento até C-018. Nenhuma implementação de produto está autorizada por este ledger.
