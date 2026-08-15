# Fase 3 — Live Ledger

**Status geral:** EM ANDAMENTO  
**Estado:** `3B CLOSED` · `3C CLOSED` · `3D CLOSED / APROVADA` · `3E EM ANDAMENTO — 3E-01 + 3E-02 APROVADAS` · próximo gate `3E-R1 — Data Architecture Cross-Review`  
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

3E-01
→ foundation física de ownership/persistência do Hub

3E-02
→ inventário mínimo durável + identity/ref classes + allowlist FK Tier-2

este LEDGER
→ status/navigation authority
```

Nenhuma conversa é authority. Arquivos `*-FABLE-*` são review inputs não-autoritativos; somente conteúdo ratificado em decisões aprovadas ganha authority.

---

## 2. Estado das fases

| Fase | Estado | Próxima ação |
|---|---|---|
| 3A — Architecture Reconciliation | CONTÍNUA até C-018 | aplicar findings materiais durante 3E–3O |
| 3B — System Context & Boundaries | **CLOSED / APROVADA** | reabrir apenas com Finding material |
| 3C — Domain / Module Architecture | **CLOSED / APROVADA** | reabrir apenas com Finding material |
| 3D — Dependency Architecture | **CLOSED / APROVADA** | [3D-R1](3D-R1-dependency-architecture-final-closure.md) |
| 3E — Data Architecture | **EM ANDAMENTO — 3E-01 + 3E-02 APROVADAS** | 3E-R1 cross-review/closure |
| 3F — Contracts & API Architecture | NÃO INICIADA | somente após closure suficiente de 3E |
| 3G — Behavioral / State Architecture | NÃO INICIADA | FSMs/lifecycles |
| 3H — Runtime & Agent Architecture | NÃO INICIADA | realization/correlation/runtime mechanics |
| 3I — Security / Authority Architecture | NÃO INICIADA | trust/identity/egress/DB roles |
| 3J — Deployment / Operations Architecture | NÃO INICIADA | topology/backup/serving operations |
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

## 4. 3C — CLOSED / APPROVED

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

Resultado final resumido:

```text
modular monolith
acyclic import graph
direct-call-first
no cross-module table/internal access
seven named control-plane use cases
runtime never calls L7
one domain inversion = approval claim
I&A resolved directly at L7 / MAR / Gateway
four infra boundaries = CodingRuntime / CredentialBackend / BlobStore-CAS / GitInfra
MigrationRunner = Release seam
job/v1 machinery = MAR seam
```

3D só pode ser reaberta por Finding material.

---

## 6. 3E — Data Architecture

### 3E-01 — APPROVED

| ID | Decisão | Documento |
|---|---|---|
| 3E-01 | Hub Control Data Ownership & Persistence Boundaries | [3E-01](3E-01-hub-control-data-ownership-persistence-boundaries.md) |

3E-01 congela:

```text
hub_control = um PostgreSQL database de authority do Hub
schemas owner: iam/ws/prj/bld/reg/con/gw/brn/par/rel/mar/obs/att
sem shared/common schema
uma lineage ordenada de migrations do hub_control
Project Data = C-006 database-per-Project
mastra_builder e mastra_par fisicamente isolados
TxScope opaco e non-query-capable
```

Cross-module refs:

```text
Tier 1 = FK intra-owner
Tier 2 = FK cross-owner somente identidade estrutural estável + allowlist explícita
Tier 3 = opaque ref/digest, default
```

Atomicidade:

```text
CreateProject = PRJ + IAM
material effect admission = GW + PAR approval claim
audit-required mutation + OBS = classe transversal fail-closed
```

Gateway minimum:

```text
effect_attempt
idempotency_claim
budget_counter/reservation state onde durability é necessária
```

MAR route mapping pertence a MAR e não espelha active Release. OBS nunca vira current domain truth. Role-per-module não é mecanismo de ownership; DB roles finais pertencem a 3I/ops.

### 3E-02 — APPROVED

| ID | Decisão | Documento |
|---|---|---|
| 3E-02 | Module Durable Record Inventory & Reference Closure | [3E-02](3E-02-module-durable-record-inventory-reference-closure.md) |

3E-02 fecha o piso de **44 classes duráveis**:

```text
iam  7  account / session / workspace_membership / area_membership /
        area_project_grant / account_project_grant / published_app_access
ws   2  workspace / area
prj  5  project / approved_baseline / brain_binding /
        connection_binding / config_contract_revision
bld  8  change / contract_revision / plan_revision / work_unit /
        actor_run / coding_session / finding / change_acceptance
reg  2  artifact / artifact_revision
con  3  connection / connection_revision / connection_qualification
gw   3  effect_attempt / idempotency_claim / budget_counter
brn  3  knowledge_proposal / health / binding_validation
par  4  conversation / agent_run / approval_request / agent_trigger
rel  3  release / promotion / active_pointer
mar  2  serving_route / job_run
obs  2  audit_record / operational_event
att  2  attachment / blob
```

Normas importantes:

```text
CONTROL_PLANE grants != PUBLISHED_APP access
Preview não ganha membership tree própria
ProjectBrainBinding e ProjectConnectionBinding permanecem concretos/tipados
ProjectConnectionBinding pina Connection + EXACT ConnectionRevision ref
Config Contract possui revisão durável content-addressed, sem settings bag
Connection = único conceito com ownerScope WORKSPACE|PROJECT
ConnectionQualification = append-only; sem record por probe técnico
Registry kind→scope fechado:
  integration→PLATFORM
  brain→WORKSPACE
  query/action/job/agent/brain-binding→PROJECT
att.blob = metadata/refcount somente do backing de Attachments
  -X-> global CAS registry/refcount
```

Identity/ref classes:

```text
opaque ID = domain identity
digest = immutable/content-addressed pin; nunca FK Tier-2
generation/CAS = optimistic concurrency do owner
provider/runtime ref = correlation only
```

#### Allowlist fechada — 16 FKs Tier-2

```text
1  iam.workspace_membership.workspace_id → ws.workspace
2  iam.area_membership.area_id → ws.area
3  iam.area_project_grant.area_id → ws.area
4  iam.area_project_grant.project_id → prj.project
5  iam.account_project_grant.project_id → prj.project
6  iam.published_app_access.project_id → prj.project
7  prj.project.workspace_id → ws.workspace
8  con.connection.workspace_id → ws.workspace        [ownerScope=WORKSPACE]
9  con.connection.project_id → prj.project           [ownerScope=PROJECT]
10 reg.artifact.workspace_id → ws.workspace          [kind=brain]
11 reg.artifact.project_id → prj.project             [PROJECT-scoped kinds]
12 bld.change.project_id → prj.project
13 rel.release.project_id → prj.project
14 rel.active_pointer.project_id → prj.project
15 mar.serving_route.project_id → prj.project
16 att.attachment.project_id → prj.project
```

Todas são `RESTRICT/NO ACTION`; nunca CASCADE/SET NULL. Nova FK Tier-2 exige Decision Loop.

Refs explicitamente Tier-3/sem FK incluem:

```text
prj.connection_binding → Connection + exact ConnectionRevision
prj.brain_binding → binding/revision digests
gw.effect_attempt ↔ par.approval_request
runtime/provider refs
obs.* correlations
mastra_* correlations
qualquer digest
```

Historical exact pins são permitidos/obrigatórios; mutable mirror de current-state de outro owner é proibido.

#### Reviews preservados

Inputs não-autoritativos:

- `3E-FABLE-R1-durable-record-inventory-review.md`
- `3E-FABLE-R1.1-iam-workspace-inventory-correction.md`
- `3E-FABLE-R1.2-project-connections-inventory-correction.md`
- `3E-FABLE-R1.3-connections-registry-inventory-correction.md`

3E-02 é a authority resultante e incorpora a emenda do operador sobre exact `ConnectionRevision` no ProjectConnectionBinding e a restrição de `att.blob` ao domínio Attachments.

---

## 7. Open findings / routed work

Estes itens não reabrem fases anteriores automaticamente.

| Finding / questão | Owner posterior |
|---|---|
| F3B-R1 — repo canônico/cutover do produto | 3A / operador — antes de implementação |
| F3B-R2 — legacy `MissionPlan v2` | 3F |
| F3B-R4 — browser/runtime physical trust zones | 3I/3J |
| N3 — Planning Depth × RigorProfile | 3G |
| F3D02-R1 — AgentRun in-flight × stricter new Release | 3G/3I |
| F3D04-R2 — archived Project with active Release | 3G/3I |
| F3E01-R1 — `mastra_par` no procedimento de backup/restore | 3J |
| F3E01-R2 — `hub_control` rebuild 0..N em DB temporário | 3E / implementation verification |
| F3E02-R1 — Mastra `workflowDefinitions` não pode virar authoring authority | 3H/3L probe |
| F3E02-R2 — physical storage/custody do CredentialBackend | 3I / infra implementation |
| Project binding contracts | 3F |
| DEDICATED identity/authority exchange | 3F/3I |
| DEDICATED egress/network policy | 3I/3J |
| MANAGED/DEDICATED deployment topology | 3J |
| Mastra telemetry ↔ Conexus correlation | 3H/3L |
| Verification Observability realization | 3H/3L/3N |
| job/v1 queue/scheduler substrate | 3H/3L only on concrete need |
| DEDICATED multi-install/fleet management | DEFER |

Resolvido:

- F3D04-R1 route mapping ownership → `mar`; topology física continua 3J.
- F3E01-R3 cluster inventory → `hub_control + mastra_builder + mastra_par + project/validation DBs`.

---

## 8. Anti-overengineering guardrail

Fases fechadas/decididas não autorizam:

```text
microservices
database por módulo do Hub
role de DB por módulo
schema shared/common
GenericGrant / relationship graph
GenericProjectBinding / BindingEngine
Generic resource/scope ownership engine
WorkspaceConnection + ProjectConnection classes separadas
EnvironmentModule / DeploymentModule / StorageModule
JobModule / SchedulerModule
ApplicationLayerModule
generic repository / UnitOfWork framework
generic transaction bus
workflow DSL / event bus / command bus
universal mediator / service locator
event sourcing / CQRS / saga framework
outbox/inbox para comunicação local hipotética
OPA/Cedar/OpenFGA por default
RLS por default
RigorModule / policy engine
Gateway split / AdmissionCore
shared JobQueue/Scheduler port
MigrationRunner provider framework
Mastra external migration machinery sem failure class
cross-domain global CAS refcount
Kafka/Kubernetes/Temporal by default
```

Qualquer item retorna apenas pelo Decision Loop com consumidor/failure class real.

---

## 9. Próximo gate — 3E-R1

**3E-R1 — Data Architecture Cross-Review** deve revisar 3E-01 + 3E-02 contra o intake de 3D-R1 e responder:

```text
1. Todo state/authority material aprovado em 3C/3D possui forma durável suficiente?
2. Algum record/FK cria hidden authority ou cross-owner persistence shortcut?
3. Existem mutable mirrors, generic frameworks ou records especulativos?
4. Transactions/OBS/Mastra/Project Data permanecem corretamente separados?
5. Os findings restantes pertencem realmente a 3F+ e não bloqueiam Data Architecture?
6. 3E pode ser CLOSED / APPROVED sem outra subdecisão?
```

3E-R1 não deve inventar colunas finais/DDL, contracts 3F, FSMs 3G, runtime 3H, security 3I ou deployment 3J.

---

## 10. Regra de avanço

```text
3B = CLOSED
3C = CLOSED
3D = CLOSED / APPROVED
3E = EM ANDAMENTO
3E-01 = APPROVED
3E-02 = APPROVED
3E-R1 = NEXT
```

A Fase 3 completa continua em andamento até C-018. Nenhuma implementação de produto está autorizada por este ledger.
