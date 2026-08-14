# Fase 3 — Detailed Decision Index

Este diretório contém as decisões detalhadas da Fase 3.

**Live status / navigation authority:** [LEDGER.md](LEDGER.md)  
**3B historical/detail authority:** `../24-arquitetura-system-design.md` + `3B-*` docs  
**Importante:** 3C está fechada, mas a Fase 3 completa continua em andamento e ainda não constitui C-018.

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
| 3C-R1 | Cross-review Closure & Reconciliation | APROVADO | [3C-R1-cross-review-closure.md](3C-R1-cross-review-closure.md) |

## Estado atual

```text
3A — Architecture Reconciliation: transversal / contínua até C-018
3B — System Context & Boundaries: CLOSED / APROVADA
3C — Domain / Module Architecture: CLOSED / APROVADA
3D — Dependency Architecture: NEXT
```

## Mapa final 3C

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

O cross-review final está materializado em [3C-R1](3C-R1-cross-review-closure.md).

Ele registra, entre outros refinements:

- `AgentTrigger EVENT` reservado/deferred; `SCHEDULE` operacional no F1;
- C-016 `Gateway-only` reinterpretado para MANAGED / Conexus-governed capabilities, sem impedir network surface própria de DEDICATED;
- DEDICATED multi-install explicitamente DEFER;
- Project owns Inception; Builder fornece engineering execution capability sem criar Change artificial;
- application/use-case orchestration layer declarada como stateless e sem authority própria;
- Brain `EVIDENCE` passa semanticamente a `EVIDENCE_SPEC`;
- bindings seguem Git authoring + Project approved intent + Registry compiled revision + specialized validation + Release pin;
- 3A-R5 supersede fresh implementer-per-WU; fresh independent verifier permanece;
- `Workspace` sem qualificador significa tenant Conexus; usar `Mastra Workspace` para o substrate;
- C-006 Project Data topology é baseline MANAGED, não persistence obrigatória de DEDICATED;
- `Storage`, `Deployment`, `Published App Runtime` universal e outras nomenclaturas antigas são lidas sob a precedência de 3C-R1.

## Findings roteados

O live ledger mantém a lista completa e seus owners: [LEDGER.md](LEDGER.md#7-open-findings--routed-work).

Itens principais para a próxima etapa:

```text
3D
→ cycles conceituais e dependency DAG
→ Managed Runtime ports
→ Gateway/Connections/Builder/Agent Runtime directionality

3F/3I
→ DEDICATED identity/authority exchange

3I/3J
→ physical trust/egress/deployment topology
```

## Regra de fechamento

3C não deve reabrir por detalhe de tabela, DTO, FSM, queue provider, Docker, DNS, TLS, Mastra implementation ou frontend shape. Esses temas pertencem a 3D–3L conforme o ledger.

Uma boundary 3C só volta ao Decision Loop diante de finding material que demonstre:

```text
owner ausente
authority duplicada
god module inevitável
módulo artificial comprovado
ou consumer real sem boundary existente
```

Até lá:

```text
3C = CLOSED
3D = NEXT
```

Isso não encerra a Fase 3 completa, não constitui C-018 e não autoriza implementação.