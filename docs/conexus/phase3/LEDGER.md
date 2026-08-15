# Fase 3 — Live Ledger

**Status geral:** EM ANDAMENTO  
**Estado:** `3B CLOSED` · `3C CLOSED` · `3D CLOSED / APROVADA` · `3E EM ANDAMENTO — 3E-01 APROVADA` · próximo gate `3E-02 — Module Durable Record Inventory & Reference Closure`  
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
→ foundation física de ownership/persistência do Hub; prevalece sobre reviews 3E-FABLE-R0/R0.1

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
| 3E — Data Architecture | **EM ANDAMENTO — 3E-01 APROVADA** | 3E-02 Durable Record Inventory & Reference Closure |
| 3F — Contracts & API Architecture | NÃO INICIADA | após data architecture suficiente |
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
um schema por module owner:
  iam / ws / prj / bld / reg / con / gw / brn / par / rel / mar / obs / att
sem shared/common schema
Rigor = stateless primitive, sem schema
uma lineage ordenada de migrations do hub_control
Project Data permanece C-006 database-per-Project
```

Cluster F1 passa a reconhecer explicitamente:

```text
hub_control
mastra_builder
mastra_par
Project databases
validation databases efêmeros
```

Mastra:

```text
mastra_builder = substrate isolado do Builder; menor durabilidade
mastra_par     = substrate isolado do PAR; Conversation/checkpoint mechanics duráveis
nenhum módulo Conexus lê/escreve tabelas mastra_*
correlação apenas por runtime refs opacos
```

A escolha de dois databases Mastra foi revalidada contra documentação atual do Mastra via Context7; `schemaName` existe, mas dois databases vencem por lifecycle, backup/restore e replaceability, não por limitação de schema support.

### Cross-module persistence

```text
Tier 1: FK intra-módulo normal
Tier 2: FK cross-module somente para identidade estrutural estável
        PK + RESTRICT/NO ACTION; lista exata fica para 3E-02
Tier 3: opaque IDs/digests = default para demais refs
```

Proibido:

```text
cross-module table/repository access
CASCADE/SET NULL em FK cross-module
FK para digest
FK de/para obs.*
FK de/para mastra_*
current-state mirror de outro owner
schema shared/common
```

Pin histórico é permitido/obrigatório quando registra a revisão/digest exata usada naquela ocorrência.

### Atomicidade

Classe de domínio F1 fechada:

```text
CreateProject = PRJ + IAM
material effect admission = GW + PAR approval claim
```

Classe transversal:

```text
audit-required mutation + obs.audit_record
→ mesma transaction quando necessário para fail-closed
→ OBS continua historical sink, não domain authority
```

`TxScope` é opaco e non-query-capable; nunca `pg.Client`, raw connection ou query builder. Shared transaction nunca concede shared table access.

### Gateway durable minimum

Existência/ownership aprovados, shape/FSM ainda abertos:

```text
gw.effect_attempt
gw.idempotency_claim
gw.budget_counter / reservation state onde durability é exigida
```

### MAR route mapping

```text
mar owns route→Project/environment mapping
não espelha active Release
active pointer continua authority de Release
```

### Observability

```text
Audit Trail = histórico durável / fail-closed quando requerido
Operational Telemetry = observação degradável
obs nunca vira source of truth do current domain state
```

### DB roles

3E-01 não congela quantidade/formato de roles do `hub_control`.

```text
role-per-module NÃO é mecanismo de module ownership
runtime/migrator/maintenance/diagnostic roles → 3I/ops
```

### Reviews preservados

- `3E-FABLE-R0-hub-control-data-boundaries-review.md`
- `3E-FABLE-R0.1-hub-control-data-boundaries-corrections.md`

São inputs não-autoritativos; 3E-01 é authority.

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
| Project binding contracts | 3F |
| DEDICATED identity/authority exchange | 3F/3I |
| DEDICATED egress/network policy | 3I/3J |
| MANAGED/DEDICATED deployment topology | 3J |
| Mastra telemetry ↔ Conexus correlation | 3H/3L |
| Verification Observability realization | 3H/3L/3N |
| job/v1 queue/scheduler substrate | 3H/3L only on concrete need |
| DEDICATED multi-install/fleet management | DEFER |

Resolvido por 3E-01:

- F3D04-R1 ownership do route mapping → `mar`; host/path/topology continua 3J.
- F3E01-R3 cluster inventory → `hub_control + mastra_builder + mastra_par + project/validation DBs`.

---

## 8. Anti-overengineering guardrail

Fases fechadas/decididas não autorizam:

```text
microservices
database por módulo do Hub
role de DB por módulo
schema shared/common
EnvironmentModule / DeploymentModule / StorageModule
JobModule / SchedulerModule
ApplicationLayerModule
generic binding framework
workflow DSL / event bus / command bus
universal mediator / service locator
generic repository / UnitOfWork framework
generic transaction bus
event sourcing / CQRS / saga framework
outbox/inbox para comunicação local hipotética
OPA/Cedar/OpenFGA por default
RLS por default
RigorModule / policy engine
Gateway split / AdmissionCore
shared JobQueue/Scheduler port
MigrationRunner provider framework
Mastra external migration machinery sem failure class
Kafka/Kubernetes/Temporal by default
```

Qualquer item retorna apenas pelo Decision Loop com consumidor/failure class real.

---

## 9. Próximo gate — 3E-02

**3E-02 — Module Durable Record Inventory & Reference Closure** deve fechar:

```text
inventário mínimo de records duráveis por módulo
owner de cada record
identidade/chaves conceituais
opaque ID vs digest vs generation/CAS
lista EXATA e fechada de FKs Tier 2
refs/projections necessárias sem current-state mirroring
records explicitamente DEFER/REJECT para evitar schema speculative design
```

Não decidir em 3E-02:

```text
final DTO/HTTP contracts → 3F
full FSMs → 3G
runtime substrate mechanics → 3H
DB security roles/RLS → 3I
deployment/host/DNS/backup procedure details → 3J
technology/tool selection beyond required current verification → 3L
```

Após o fechamento dos gates necessários de 3E, executar cross-review final de Data Architecture antes de 3F.

---

## 10. Regra de avanço

```text
3B = CLOSED
3C = CLOSED
3D = CLOSED / APPROVED
3E = EM ANDAMENTO
3E-01 = APPROVED
3E-02 = NEXT
```

A Fase 3 completa continua em andamento até C-018. Nenhuma implementação de produto está autorizada por este ledger.
