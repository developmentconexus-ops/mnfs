# Fase 3 — Detailed Decision Index

Este diretório contém as decisões detalhadas da Fase 3.

**Live status / navigation authority:** [LEDGER.md](LEDGER.md)  
**3B historical/detail authority:** `../24-arquitetura-system-design.md` + `3B-*` docs  
**Importante:** 3F está fechada/aprovada; 3G está em andamento com 3G-01, 3G-02 e 3G-03 aprovadas, mas a Fase 3 completa continua em andamento e ainda não constitui C-018.

## Status

| ID | Decisão | Status | Documento |
|---|---|---|---|
| 3B-01..3B-15 | System Context & Boundaries | APROVADO | `../24-arquitetura-system-design.md` |
| 3B-16 | Project-Internal Resource Ownership | APROVADO | [3B-16-project-internal-resource-ownership.md](3B-16-project-internal-resource-ownership.md) |
| 3B-17 | Project Isolation and Explicit Reuse | APROVADO | `../24-arquitetura-system-design.md` |
| 3A-R5 | Builder / Coding Runtime Reassessment | APROVADO | [3A-R5-builder-coding-runtime-reassessment.md](3A-R5-builder-coding-runtime-reassessment.md) |
| 3C-01 | Modular Monolith no F1 | APROVADO | [3C-01](3C-01-modular-monolith.md) |
| 3C-02 | Identity & Access Module Boundary | APROVADO | [3C-02](3C-02-identity-access-module-boundary.md) |
| 3C-03 | Workspace Module Boundary | APROVADO | [3C-03](3C-03-workspace-module-boundary.md) |
| 3C-04 | Project Module Boundary | APROVADO | [3C-04](3C-04-project-module-boundary.md) |
| 3C-05 | Builder Module Boundary | APROVADO | [3C-05](3C-05-builder-module-boundary.md) |
| 3C-06 | Artifact Registry Module Boundary | APROVADO | [3C-06](3C-06-artifact-registry-module-boundary.md) |
| 3C-07 | Connections Module Boundary | APROVADO | [3C-07](3C-07-connections-module-boundary.md) |
| 3C-08 | Capability Gateway Module Boundary | APROVADO | [3C-08](3C-08-capability-gateway-module-boundary.md) |
| 3C-09 | Brain Module Boundary | APROVADO | [3C-09](3C-09-brain-module-boundary.md) |
| 3C-10 | Production Agent Runtime Module Boundary | APROVADO | [3C-10](3C-10-production-agent-runtime-module-boundary.md) |
| 3C-11 | Release Module Boundary | APROVADO | [3C-11](3C-11-release-module-boundary.md) |
| 3C-12 | Application Runtime Profiles | APROVADO | [3C-12](3C-12-application-runtime-profiles.md) |
| 3C-13 | Observability & Audit Module Boundary | APROVADO | [3C-13](3C-13-observability-audit-module-boundary.md) |
| 3C-14 | Attachments / Storage Boundary | APROVADO | [3C-14](3C-14-attachments-storage-boundary.md) |
| 3C-15 | Managed Application Runtime Boundary | APROVADO | [3C-15](3C-15-managed-application-runtime-boundary.md) |
| 3C-R1 | Domain / Module Architecture closure | APROVADO / CLOSED | [3C-R1](3C-R1-cross-review-closure.md) |
| 3D-R1 | Dependency Architecture closure | APROVADO / CLOSED | [3D-R1](3D-R1-dependency-architecture-final-closure.md) |
| 3E-R1 | Data Architecture closure | APROVADO / CLOSED | [3E-R1](3E-R1-data-architecture-final-closure.md) |
| 3F-01..3F-06 | Contracts & API Architecture decisions | APROVADAS | [LEDGER §7](LEDGER.md#7-3f--closed--approved) |
| 3F-R1 | Contracts & API Architecture Final Closure | APROVADO / CLOSED | [3F-R1](3F-R1-contracts-api-architecture-final-closure.md) |
| 3G-01 | ApprovalRequest Lifecycle & Claim-Binding State Architecture | APROVADO | [3G-01](3G-01-approval-request-lifecycle-claim-binding-state-architecture.md) |
| 3G-02 | Builder Change & Finding Lifecycle, Contract Revision & Closure Architecture | APROVADO | [3G-02](3G-02-builder-change-finding-lifecycle-contract-revision-closure-architecture.md) |
| 3G-03 | Builder Work Unit & ActorRun Execution Lifecycle Architecture | APROVADO | [3G-03](3G-03-builder-work-unit-actor-run-execution-lifecycle-architecture.md) |

## Estado atual

```text
3A — Architecture Reconciliation: transversal / contínua até C-018
3B — System Context & Boundaries: CLOSED / APROVADA
3C — Domain / Module Architecture: CLOSED / APROVADA
3D — Dependency Architecture: CLOSED / APROVADA
3E — Data Architecture: CLOSED / APROVADA
3F — Contracts & API Architecture: CLOSED / APROVADA
3G — Behavioral / State Architecture: IN PROGRESS / 3G-01 + 3G-02 + 3G-03 APROVADAS
```

## Mapa estrutural preservado

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

`DEDICATED Application Runtime` é output/runtime de Project, não módulo do Hub.

## Precedência atual

O fechamento de Contracts & API Architecture permanece materializado em [3F-R1](3F-R1-contracts-api-architecture-final-closure.md). Behavioral / State Architecture possui agora três authorities aprovadas: [3G-01](3G-01-approval-request-lifecycle-claim-binding-state-architecture.md), [3G-02](3G-02-builder-change-finding-lifecycle-contract-revision-closure-architecture.md) e [3G-03](3G-03-builder-work-unit-actor-run-execution-lifecycle-architecture.md).

3F-R1 reconcilia 3C–3F e confirma, entre outros pontos:

- `ReleaseManifest` como composition root única;
- current Project intent separado de Release-pinned runtime composition;
- MANAGED e DEDICATED como profiles da mesma Factory;
- approval exact-subject + single-claim;
- dois Project binding contracts concretos;
- public failure `code` como behavior key, sem ErrorRegistry;
- DEDICATED server-to-platform com `DedicatedApplicationPrincipal + exact ReleaseRef`;
- compatibility/PRESERVE horizons coerentes.

3G-01 adiciona:

- `ApprovalRequest` como durable facts + canonical owner-local projection;
- decision write-once, derived expiry, monotonic `STALE`, permanent committed binding;
- captured database-sourced `guardNow`;
- concurrency-safe guarded mutations + admission abort discipline;
- rollback não consome approval e same-attempt recovery não reautoriza.

3G-02 adiciona, sem mega-FSM:

- Change com decision predicates independentes em vez de `ChangeState` exclusivo;
- contract/Plan/governance/discovery como checkpoint/dispatch gates;
- Evidence compatibility pelo full applicable execution context, com staleness derivada;
- Finding apenas para gaps decision-relevant, resolution sem reopen in-place e route separado por autonomia decrescente;
- per-Change serialization root para authority admissions, bounded-work/budget admissions e closure;
- terminal closure write-once em `ACCEPTED | NO_CHANGE_REQUIRED | REJECTED | BLOCKED | ESCALATED`;
- successful closure + immutable `change_acceptance` owner-local atomic;
- context-pinned acceptance que pode ficar inadmissível após drift sem reabrir o Change;
- successor verification Change somente on-demand quando consumidor real precisar restaurar admissibilidade.

3G-03 adiciona, sem Work Unit FSM ou retry engine:

- Work Unit como bounded work authority imutável e membro da current approved/admitted decomposition;
- no máximo uma `acceptedDelivery` por Work Unit, sem durable `FAILED/BLOCKED/SUPERSEDED/DONE` fan-out;
- ActorRun como attempt concreto com execution identity pinada, one exact write-once produced-output identity e terminal partition `DELIVERED | FAILED | CANCELLED`;
- same-output re-presentation idempotente; diferente output exige novo ActorRun;
- output identity no canonical-content level, separada de custody/storage recovery;
- crash sem output durável pode terminalizar explicitamente; crash com output durável retoma julgamento do mesmo exact output;
- `ActorRun DELIVERED + WorkUnit acceptedDelivery` atômicos dentro do Builder para WU execution;
- same-WU retry somente enquanto bounded authority continua current/admissible; mudança de scope/sets/pins/fulfills cria successor Work Unit;
- cancellation vence late runtime output;
- Gateway continua enforcement de external-effect replay safety;
- Mastra/CodingSession/E2B continuam mechanics subordinadas;
- InceptionInvestigaton não recebe `Change` sintético por simetria; exceção pré-Change volta pelo Decision Loop se surgir consumer real.

## Findings roteados

O live ledger mantém a lista completa e seus owners: [LEDGER.md](LEDGER.md#8-open-findings--routed-work).

Resolvido por 3G-01:

```text
ApprovalRequest lifecycle/FSM completo no exact F1 approval path
```

Resolvido por 3G-02:

```text
Builder Change + Finding lifecycle
contract revision/checkpoint gate
Finding routing / loop prevention semantics
Change closure / acceptance proof semantics
```

Resolvido por 3G-03:

```text
Builder Work Unit bounded-authority lifecycle
ActorRun attempt/output/terminal semantics
same-WU retry vs successor Work Unit
cancel / late-output semantics
crash recovery around produced output and delivery boundary
```

Permanecem para decisões posteriores, entre outros:

```text
3G
→ Planning Depth × RigorProfile
→ Gateway effect_attempt lifecycle/state work
→ AgentRun semantic response to approval expiry
→ binding + Project mutation lifecycle
→ AgentRun in-flight × stricter new Release
→ archived Project with active Release
→ DEDICATED old-vs-new Release admissibility window
→ Release-side placement of context-pinned acceptance admissibility

3I / later
→ approver/binding authority enforcement
→ post-admission cancellation / revocation
→ DEDICATED concrete trust/credential realization

3H / 3K / 3M / implementation
→ Mastra ActorRun/CodingSession/Workspace/E2B realization
→ runtime liveness/orphan detection and fresh-session mechanics
→ UI/display e exact wire realization
→ reconciliation / GC / custody/crash recovery machinery
→ numeric correction/attempt-budget calibration
→ InceptionInvestigation pre-Change execution shape only if concrete realization proves need
```

Esses itens não reabrem 3F, 3G-01, 3G-02 ou 3G-03 automaticamente.

## Regra de avanço

3F só reabre diante de evidence material conforme `3F-R1`.

Estado atual:

```text
3F = CLOSED / APPROVED
3G = IN PROGRESS
3G-01 = APPROVED
3G-02 = APPROVED
3G-03 = APPROVED
```

A próxima decisão de 3G deve ser selecionada pelo mesmo Decision Loop e trabalhada com o operador antes de ganhar authority.

Isso não encerra 3G, não encerra a Fase 3 completa, não constitui C-018 e não autoriza implementação, merge ou PR readiness.