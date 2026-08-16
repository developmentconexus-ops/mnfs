# Fase 3 — Detailed Decision Index

Este diretório contém as decisões detalhadas da Fase 3.

**Live status / navigation authority:** [LEDGER.md](LEDGER.md)  
**3B historical/detail authority:** `../24-arquitetura-system-design.md` + `3B-*` docs  
**Estado atual:** 3B–3G fechadas/aprovadas; **3H — Runtime & Agent Architecture é NEXT**. A Fase 3 completa continua em andamento e ainda não constitui C-018.

## Status

| ID | Decisão | Status | Documento |
|---|---|---|---|
| 3B-01..3B-15 | System Context & Boundaries | APROVADO | `../24-arquitetura-system-design.md` |
| 3B-16 | Project-Internal Resource Ownership | APROVADO | [3B-16](3B-16-project-internal-resource-ownership.md) |
| 3B-17 | Project Isolation and Explicit Reuse | APROVADO | `../24-arquitetura-system-design.md` |
| 3A-R5 | Builder / Coding Runtime Reassessment | APROVADO | [3A-R5](3A-R5-builder-coding-runtime-reassessment.md) |
| 3C-01..3C-15 | Domain / Module Architecture decisions | APROVADAS | [LEDGER §4](LEDGER.md#4-3c--closed--approved) |
| 3C-R1 | Domain / Module Architecture closure | APROVADO / CLOSED | [3C-R1](3C-R1-cross-review-closure.md) |
| 3D-01..3D-04 | Dependency Architecture decisions | APROVADAS | [LEDGER §5](LEDGER.md#5-3d--closed--approved) |
| 3D-R1 | Dependency Architecture closure | APROVADO / CLOSED | [3D-R1](3D-R1-dependency-architecture-final-closure.md) |
| 3E-01..3E-02 | Data Architecture decisions | APROVADAS | [LEDGER §6](LEDGER.md#6-3e--closed--approved) |
| 3E-R1 | Data Architecture closure | APROVADO / CLOSED | [3E-R1](3E-R1-data-architecture-final-closure.md) |
| 3F-01..3F-06 | Contracts & API Architecture decisions | APROVADAS | [LEDGER §7](LEDGER.md#7-3f--closed--approved) |
| 3F-R1 | Contracts & API Architecture closure | APROVADO / CLOSED | [3F-R1](3F-R1-contracts-api-architecture-final-closure.md) |
| 3G-01 | ApprovalRequest Lifecycle & Claim-Binding State Architecture | APROVADO | [3G-01](3G-01-approval-request-lifecycle-claim-binding-state-architecture.md) |
| 3G-02 | Builder Change & Finding Lifecycle, Contract Revision & Closure Architecture | APROVADO | [3G-02](3G-02-builder-change-finding-lifecycle-contract-revision-closure-architecture.md) |
| 3G-03 | Builder Work Unit & ActorRun Execution Lifecycle Architecture | APROVADO | [3G-03](3G-03-builder-work-unit-actor-run-execution-lifecycle-architecture.md) |
| 3G-04 | Planning Depth & Rigor Composition Architecture | APROVADO | [3G-04](3G-04-planning-depth-rigor-composition-architecture.md) |
| 3G-05 | Production AgentRun, Approval Continuation & Trigger Architecture | APROVADO | [3G-05](3G-05-production-agent-run-approval-trigger-continuation-architecture.md) |
| 3G-06 | Gateway EffectAttempt, Idempotency & Budget State Architecture | APROVADO | [3G-06](3G-06-gateway-effect-attempt-idempotency-budget-state-architecture.md) |
| 3G-07 | Project Lifecycle & Binding Mutation Architecture | APROVADO | [3G-07](3G-07-project-lifecycle-binding-mutation-architecture.md) |
| 3G-08 | Release, Promotion & Runtime Admissibility Architecture | APROVADO | [3G-08](3G-08-release-promotion-runtime-admissibility-architecture.md) |
| 3G-R1 | Behavioral / State Architecture Final Closure | APROVADO / CLOSED | [3G-R1](3G-R1-behavioral-state-architecture-final-closure.md) |

## Estado atual

```text
3A — Architecture Reconciliation: transversal / contínua até C-018
3B — System Context & Boundaries: CLOSED / APROVADA
3C — Domain / Module Architecture: CLOSED / APROVADA
3D — Dependency Architecture: CLOSED / APROVADA
3E — Data Architecture: CLOSED / APROVADA
3F — Contracts & API Architecture: CLOSED / APROVADA
3G — Behavioral / State Architecture: CLOSED / APROVADA
3H — Runtime & Agent Architecture: NOT STARTED / NEXT
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

## Fechamentos principais

### 3F

[3F-R1](3F-R1-contracts-api-architecture-final-closure.md) fecha Contracts & API Architecture preservando:

```text
ReleaseManifest as composition root
current Project intent != runtime composition
exact approval subject + single claim
concrete Project bindings
stable public failure behavior keys
DEDICATED server-to-platform under exact ReleaseRef
```

### 3G

[3G-R1](3G-R1-behavioral-state-architecture-final-closure.md) fecha Behavioral / State Architecture com state spaces owner-local e sem engine universal.

Global non-unification:

```text
Builder ActorRun
!= Production AgentRun
!= Gateway effect_attempt
!= Promotion
```

E:

```text
Change ACCEPTED
!= WorkUnit acceptedDelivery
!= Builder ActorRun DELIVERED
!= Production AgentRun COMPLETED
!= effect SUCCEEDED
!= Release AVAILABLE
!= active pointer swapped
!= SERVED_VERIFIED
```

3G concluiu:

```text
remaining material 3G decision = 0
3G-09 = NOT JUSTIFIED
new module / durable class / Tier-2 FK = 0
new workflow engine / queue / scheduler / lease = 0
```

Os reviews package-level permanecem evidence não-autoritativa:

- `3G-FABLE-PACKAGE-remaining-behavioral-state-architecture.md`
- `3G-FABLE-PACKAGE-remaining-behavioral-state-architecture-R2.md`

Final review: `PACKAGE CURRENT STRUCTURE CONFIRMED`.

## Routed work

A lista atual completa de work ainda aberto e seus owners está em [LEDGER §9](LEDGER.md#9-open-findings--routed-work-after-3g).

Principais próximos owners:

```text
3H → Mastra/AgentController/CodingSession/Workspace/E2B/runtime realization
3I → trust/authority/revocation/DEDICATED credentials
3J → physical deployment/operations/backup/serving
3K → product UX / archive / trigger / Release / approval surfaces
3L → technology probes, including CX-BUILDER-MASTRA-01 and CX-AGENT-MASTRA-01
3M → crash/reconciliation/custody/migration recovery/GC
3N → adversarial architecture verification
3O → vertical architecture proof contract
```

## Regra de avanço

A próxima etapa é **3H — Runtime & Agent Architecture**.

3H deve começar por intake/decomposition do pacote de realization, usando as authorities 3C/3D/3E/3F/3G como constraints, e só deve depender de comportamento atual do Mastra/E2B após verificação por fontes primárias/Context7 quando material.

A Fase 3 completa continua em andamento até C-018. Nenhuma implementação de produto está autorizada por este índice, e PR #40 não deve ser mergeado sem autorização explícita do operador.