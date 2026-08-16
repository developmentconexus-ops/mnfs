# Fase 3 — Detailed Decision Index

Este diretório contém as decisões detalhadas da Fase 3.

**Live status / navigation authority:** [LEDGER.md](LEDGER.md)  
**3B historical/detail authority:** `../24-arquitetura-system-design.md` + `3B-*` docs  
**Importante:** 3F está fechada/aprovada, mas a Fase 3 completa continua em andamento e ainda não constitui C-018.

## Status

| ID | Decisão | Status | Documento |
|---|---|---|---|
| 3B-01..3B-15 | System Context & Boundaries | APROVADO | `../24-arquitetura-system-design.md` |
| 3B-16 | Project-Internal Resource Ownership | APROVADO | [3B-16-project-internal-resource-ownership.md](3B-16-project-internal-resource-ownership.md) |
| 3B-17 | Project Isolation and Explicit Reuse | APROVADO | `../24-arquitetura-system-design.md` |
| 3A-R5 | Builder / Coding Runtime Reassessment | APROVADO | [3A-R5-builder-coding-runtime-reassessment.md](3A-R5-builder-coding-runtime-reassessment.md) |
| 3C-01 | Modular Monolith no F1 | APROVADO | [3C-01-modular-monolith.md](3C-01-modular-monolith.md) |
| 3C-02 | Identity & Access Module Boundary | APROVADO | [3C-02-identity-access-module-boundary.md](3C-02-identity-access-module-boundary.md) |
| 3C-03 | Workspace Module Boundary | APROVADO | [3C-03-workspace-module-boundary.md](3C-03-workspace-module-boundary.md) |
| 3C-04 | Project Module Boundary | APROVADO | [3C-04-project-module-boundary.md](3C-04-project-module-boundary.md) |
| 3C-05 | Builder Module Boundary | APROVADO | [3C-05-builder-module-boundary.md](3C-05-builder-module-boundary.md) |
| 3C-06 | Artifact Registry Module Boundary | APROVADO | [3C-06-artifact-registry-module-boundary.md](3C-06-artifact-registry-module-boundary.md) |
| 3C-07 | Connections Module Boundary | APROVADO | [3C-07-connections-module-boundary.md](3C-07-connections-module-boundary.md) |
| 3C-08 | Capability Gateway Module Boundary | APROVADO | [3C-08-capability-gateway-module-boundary.md](3C-08-capability-gateway-module-boundary.md) |
| 3C-09 | Brain Module Boundary | APROVADO | [3C-09-brain-module-boundary.md](3C-09-brain-module-boundary.md) |
| 3C-10 | Production Agent Runtime Module Boundary | APROVADO | [3C-10-production-agent-runtime-module-boundary.md](3C-10-production-agent-runtime-module-boundary.md) |
| 3C-11 | Release Module Boundary | APROVADO | [3C-11-release-module-boundary.md](3C-11-release-module-boundary.md) |
| 3C-12 | Application Runtime Profiles | APROVADO | [3C-12-application-runtime-profiles.md](3C-12-application-runtime-profiles.md) |
| 3C-13 | Observability & Audit Module Boundary | APROVADO | [3C-13-observability-audit-module-boundary.md](3C-13-observability-audit-module-boundary.md) |
| 3C-14 | Attachments / Storage Boundary | APROVADO | [3C-14-attachments-storage-boundary.md](3C-14-attachments-storage-boundary.md) |
| 3C-15 | Managed Application Runtime Module Boundary | APROVADO | [3C-15-managed-application-runtime-boundary.md](3C-15-managed-application-runtime-boundary.md) |
| 3C-R1 | Domain / Module Architecture closure | APROVADO / CLOSED | [3C-R1-cross-review-closure.md](3C-R1-cross-review-closure.md) |
| 3D-R1 | Dependency Architecture closure | APROVADO / CLOSED | [3D-R1-dependency-architecture-final-closure.md](3D-R1-dependency-architecture-final-closure.md) |
| 3E-R1 | Data Architecture closure | APROVADO / CLOSED | [3E-R1-data-architecture-final-closure.md](3E-R1-data-architecture-final-closure.md) |
| 3F-01..3F-06 | Contracts & API Architecture decisions | APROVADAS | [LEDGER §7](LEDGER.md#7-3f--closed--approved) |
| 3F-R1 | Contracts & API Architecture Final Closure | APROVADO / CLOSED | [3F-R1-contracts-api-architecture-final-closure.md](3F-R1-contracts-api-architecture-final-closure.md) |

## Estado atual

```text
3A — Architecture Reconciliation: transversal / contínua até C-018
3B — System Context & Boundaries: CLOSED / APROVADA
3C — Domain / Module Architecture: CLOSED / APROVADA
3D — Dependency Architecture: CLOSED / APROVADA
3E — Data Architecture: CLOSED / APROVADA
3F — Contracts & API Architecture: CLOSED / APROVADA
3G — Behavioral / State Architecture: NOT STARTED / NEXT
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

## Precedência de fechamento

O fechamento mais recente está materializado em [3F-R1](3F-R1-contracts-api-architecture-final-closure.md).

Ele reconcilia 3C–3F e confirma, entre outros pontos:

- `ReleaseManifest` como composition root única;
- current Project intent separado de Release-pinned runtime composition;
- MANAGED e DEDICATED como profiles da mesma Factory, não duas factories;
- approval exact-subject + single-claim;
- dois Project binding contracts concretos, sem GenericBinding/BindingSet;
- public failure `code` como behavior key, sem ErrorRegistry;
- DEDICATED server-to-platform com `DedicatedApplicationPrincipal + exact ReleaseRef` e authority derivada server-side;
- compatibility/PRESERVE horizons coerentes;
- nenhum `3F-07`, blocker material ou probe novo necessário para avançar.

Detalhes históricos de 3C permanecem em [3C-R1](3C-R1-cross-review-closure.md); 3D e 3E permanecem fechadas por seus respectivos `*-R1`.

## Findings roteados

O live ledger mantém a lista completa e seus owners: [LEDGER.md](LEDGER.md#8-open-findings--routed-work).

Itens principais que alimentam a próxima fase incluem:

```text
3G
→ ApprovalRequest lifecycle/FSM
→ binding + Project mutation lifecycle
→ AgentRun in-flight × stricter new Release
→ archived Project with active Release
→ DEDICATED old-vs-new Release admissibility window

3I / later
→ approver/binding authority enforcement
→ DEDICATED concrete trust/credential realization

3H / 3K / implementation
→ runtime transport, UI/display e exact wire realization já constrangidos por 3F
```

Esses itens não reabrem 3F automaticamente.

## Regra de avanço

3F só reabre diante de evidence material conforme `3F-R1`.

Até lá:

```text
3F = CLOSED / APPROVED
3G = NEXT / NOT STARTED
```

A primeira decisão de 3G deve ser trabalhada com o operador antes de ganhar authority.

Isso não encerra a Fase 3 completa, não constitui C-018 e não autoriza implementação, merge ou PR readiness.