# Fase 3 — Live Ledger

**Status geral:** EM ANDAMENTO  
**Estado:** `3B CLOSED` · `3C CLOSED / APROVADA` · `3D CLOSED / APROVADA` · `3E CLOSED / APROVADA` · `3F CLOSED / APROVADA` · `3G CLOSED / APROVADA / 3G-01..3G-08 + 3G-R1 APROVADAS` · `3H IN PROGRESS / 3H-01 APROVADA`  
**Próxima decisão:** `3H-02 — Production Agent Runtime Realization`  
**Base canônica da Fase 3:** `354f44219fb5970bb9233976773db90d2102ae7a`  
**Autoridade anterior:** C-000..C-017  
**Importante:** este ledger não constitui C-018, não encerra a Fase 3 completa e não autoriza implementação de produto.

Este arquivo é o **router/status authority** vivo da Fase 3. Detalhe normativo permanece nos documentos de decisão linkados; review/dialogue files continuam não-autoritativos salvo conteúdo explicitamente ratificado em authority aprovada.

---

## 1. Authority e precedência documental

```text
C-000..C-017
→ autoridade fundacional anterior

3B
→ System Context & Boundaries

3C-01..3C-15 + 3C-R1
→ Domain / Module Architecture

3D-01..3D-04 + 3D-R1
→ Dependency Architecture

3E-01 + 3E-02 + 3E-R1
→ Data Architecture

3F-01..3F-06 + 3F-R1
→ Contracts & API Architecture

3G-01..3G-08 + 3G-R1
→ Behavioral / State Architecture

3H-01
→ Builder Coding Runtime Realization & Session/Sandbox Mapping

este LEDGER
→ status / navigation authority da Fase 3
```

Regra de leitura:

```text
AGENTS.md
→ docs/engineering/standards/root-cause-global-maximum-method.md
→ docs/DOCUMENTATION-MAP.md
→ docs/conexus/DECISOES.md
→ este LEDGER
→ exact accepted phase/task authority
→ supporting evidence/current implementation quando material
```

Nenhuma conversa cria authority.

---

## 2. Estado das fases

| Fase | Estado | Próxima ação |
|---|---|---|
| 3A — Architecture Reconciliation | CONTÍNUA até C-018 | aplicar findings materiais durante 3H–3O |
| 3B — System Context & Boundaries | **CLOSED / APROVADA** | reabrir apenas por Finding material |
| 3C — Domain / Module Architecture | **CLOSED / APROVADA** | reabrir apenas por Finding material |
| 3D — Dependency Architecture | **CLOSED / APROVADA** | reabrir apenas por Finding material |
| 3E — Data Architecture | **CLOSED / APROVADA** | reabrir apenas por Finding material |
| 3F — Contracts & API Architecture | **CLOSED / APROVADA** | reabrir apenas por Finding material |
| 3G — Behavioral / State Architecture | **CLOSED / APROVADA** | [3G-R1](3G-R1-behavioral-state-architecture-final-closure.md) |
| 3H — Runtime & Agent Architecture | **IN PROGRESS / 3H-01 APROVADA** | 3H-02 — Production Agent Runtime Realization |
| 3I — Security / Authority Architecture | NÃO INICIADA | trust/identity/egress/DB roles |
| 3J — Deployment / Operations Architecture | NÃO INICIADA | topology/backup/serving operations |
| 3K — Frontend / Product Architecture | NÃO INICIADA | UX/scaffold/product surfaces |
| 3L — Technology Qualification | NÃO INICIADA | probes/qualification |
| 3M — Failure & Recovery Architecture | NÃO INICIADA | recovery/failure classes |
| 3N — Architecture Verification | NÃO INICIADA | adversarial verification |
| 3O — Vertical Architecture Proof Contract | NÃO INICIADA | end-to-end proof contract |

---

## 3. 3B — CLOSED / APPROVED

Decisões 3B-01..3B-15 vivem em `../24-arquitetura-system-design.md`.

Detalhes adicionais:

- [3B-16 — Project-Internal Resource Ownership](3B-16-project-internal-resource-ownership.md)
- 3B-17 — Project Isolation and Explicit Reuse — registrada em `../24-arquitetura-system-design.md`.

---

## 4. 3C — CLOSED / APPROVED

| ID | Decisão | Documento |
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

Builder runtime reconciliation relevante:

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

Final topology continua:

```text
modular monolith
acyclic import graph
direct-call-first
no cross-module table/internal access
seven named control-plane use cases
runtime never calls L7
one narrow domain inversion = approval claim
I&A resolved at L7 / MAR / Gateway
infra boundaries = CodingRuntime / CredentialBackend / BlobStore-CAS / GitInfra
```

---

## 6. 3E — CLOSED / APPROVED

| ID | Decisão | Documento |
|---|---|---|
| 3E-01 | Hub Control Data Ownership & Persistence Boundaries | [3E-01](3E-01-hub-control-data-ownership-persistence-boundaries.md) |
| 3E-02 | Module Durable Record Inventory & Reference Closure | [3E-02](3E-02-module-durable-record-inventory-reference-closure.md) |
| 3E-R1 | Data Architecture Final Closure | [3E-R1](3E-R1-data-architecture-final-closure.md) |

Fechamento:

```text
hub_control = one PostgreSQL authority database
13 owner schemas
46 durable record classes
16 Tier-2 FKs, closed allowlist
mastra_builder / mastra_par isolated substrate stores
no shared/common schema
no cross-module table/internal reads
```

---

## 7. 3F — CLOSED / APPROVED

| ID | Decisão | Documento |
|---|---|---|
| 3F-01 | Contract Surface Classification & Versioning Boundary | [3F-01](3F-01-contract-surface-classification-versioning-boundary.md) |
| 3F-02 | Boundary Payload Semantics & Error Envelope Architecture | [3F-02](3F-02-boundary-payload-semantics-error-envelope-architecture.md) |
| 3F-03 | Approval Claim & ApprovalRequest Contract | [3F-03](3F-03-approval-claim-approval-request-contract.md) |
| 3F-04 | Project Binding Contract Architecture | [3F-04](3F-04-project-binding-contract-architecture.md) |
| 3F-05 | Public Failure Code & Details Contract | [3F-05](3F-05-public-failure-code-details-contract.md) |
| 3F-06 | DEDICATED Platform Service Exchange | [3F-06](3F-06-dedicated-platform-service-exchange.md) |
| 3F-R1 | Contracts & API Architecture Final Closure | [3F-R1](3F-R1-contracts-api-architecture-final-closure.md) |

Final laws incluem:

```text
mechanism != authority
INTERNAL vs INDEPENDENT contract surfaces
owner-specific payload families; no UniversalEnvelope/Status
exact approval subject + single claim
concrete ProjectConnectionBinding / ProjectBrainBinding
stable public failure behavior keys only where boundary needs them
DEDICATED = server-to-platform under application principal + exact ReleaseRef
ReleaseManifest remains composition root
```

---

## 8. 3G — CLOSED / APPROVED

| ID | Decisão | Documento |
|---|---|---|
| 3G-01 | ApprovalRequest Lifecycle & Claim-Binding State Architecture | [3G-01](3G-01-approval-request-lifecycle-claim-binding-state-architecture.md) |
| 3G-02 | Builder Change & Finding Lifecycle, Contract Revision & Closure Architecture | [3G-02](3G-02-builder-change-finding-lifecycle-contract-revision-closure-architecture.md) |
| 3G-03 | Builder Work Unit & ActorRun Execution Lifecycle Architecture | [3G-03](3G-03-builder-work-unit-actor-run-execution-lifecycle-architecture.md) |
| 3G-04 | Planning Depth & Rigor Composition Architecture | [3G-04](3G-04-planning-depth-rigor-composition-architecture.md) |
| 3G-05 | Production AgentRun, Approval Continuation & Trigger Architecture | [3G-05](3G-05-production-agent-run-approval-trigger-continuation-architecture.md) |
| 3G-06 | Gateway EffectAttempt, Idempotency & Budget State Architecture | [3G-06](3G-06-gateway-effect-attempt-idempotency-budget-state-architecture.md) |
| 3G-07 | Project Lifecycle & Binding Mutation Architecture | [3G-07](3G-07-project-lifecycle-binding-mutation-architecture.md) |
| 3G-08 | Release, Promotion & Runtime Admissibility Architecture | [3G-08](3G-08-release-promotion-runtime-admissibility-architecture.md) |
| 3G-R1 | Behavioral / State Architecture Final Closure | [3G-R1](3G-R1-behavioral-state-architecture-final-closure.md) |

Ratificação conjunta pelo operador: **2026-08-16**.

### 8.1 Global coherence

State spaces permanecem owner-local:

```text
PAR ApprovalRequest
Builder Change / Finding
Builder Work Unit / ActorRun
Builder PlanningDepth / Rigor
PAR Production AgentRun / AgentTrigger
Gateway EffectAttempt / Idempotency / Budget
Project lifecycle / binding intent
Release / Promotion / active pointer
```

Não unificar:

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

### 8.2 Resultado do fechamento

```text
remaining material 3G decision = 0
3G-09 = NOT JUSTIFIED
prior phase reopen = NONE
new module = 0
new durable record class = 0
new Tier-2 FK = 0
new workflow engine / queue / scheduler / lease = 0
```

Principais laws finais:

```text
PlanningDepth DIRECT|LIGHT|FULL ⟂ Rigor FAST|BOUNDED|CONTROLLED
ApprovalRequest owns approval wait; Mastra owns suspend mechanics
Production AgentRun pins exact Release; newer Release does not rewrite in-flight run
Gateway alone owns external-effect replay safety
EffectAttempt close-before-dispatch × dispatch = guarded exclusive race
Project ARCHIVED freezes future intent but is not Unpublish/Stop/Purge
explicit trigger DISABLE while archived is allowed narrowing
Release immutable; acceptance/current rigor rechecked at compose and promote
max one non-terminal Promotion per Project/PROD
maintenance serving-block survives failed Promotion terminalization
rollback = new Promotion + current conformance
DEDICATED old exact Release is not invalid merely because newer exists
```

Review provenance, non-authoritative:

- `3G-FABLE-PACKAGE-remaining-behavioral-state-architecture.md`
- `3G-FABLE-PACKAGE-remaining-behavioral-state-architecture-R2.md`

Final independent result:

```text
PACKAGE CURRENT STRUCTURE CONFIRMED
```

---

## 9. 3H — IN PROGRESS

| ID | Decisão | Documento |
|---|---|---|
| 3H-01 | Builder Coding Runtime Realization & Session/Sandbox Mapping | [3H-01](3H-01-builder-coding-runtime-realization-session-sandbox-mapping.md) |

Ratificação pelo operador: **2026-08-16**.

### 9.1 3H-01 — Builder runtime laws

```text
CodingSession = Builder durable cognitive/runtime lineage
CodingSession != AgentController live Session != Mastra thread/run != E2B sandbox
persistent Mastra thread carries cognition, never authority
current Conexus runtime config is mechanically reapplied on every dispatch/rebind
write-capable ActorRun disposition = immutable FRESH_BASE | CONTINUE_LINEAGE
FAILED does not imply safe lineage reuse; unknown/orphan basis → FRESH_BASE
CANCELLED lineage reuse requires explicit applicable-authority admission
logical sandbox id != physical sandboxId != continuity proof
physical sandbox incarnation is observable and reverified
quiescence is required before CONTINUE_LINEAGE
Hub-side durable custody precedes producedOutputRef presentation
cancellation authority commits before best-effort physical interrupt
material verifier uses fresh cognition + fresh candidate materialization
runtime refs/telemetry remain correlation only
```

3H-01 outcome:

```text
prior authority reopen = NONE
new module = 0
new durable record class = 0
new Tier-2 FK = 0
new workflow/queue/scheduler/lease/retry/checkpoint engine = 0
mandatory E2B wrapper = 0 unless CX-BUILDER-MASTRA-01 proves attribution requires it
```

Review provenance, non-authoritative:

- `3H-FABLE-DIALOGUE-builder-coding-runtime-realization.md`
- `3H-FABLE-DIALOGUE-builder-coding-runtime-realization-R2.md`
- `3H-FABLE-DIALOGUE-builder-coding-runtime-realization-R3.md`

Final result:

```text
CURRENT STRUCTURE CONFIRMED
```

**3H permanece aberta. Próxima decisão:** `3H-02 — Production Agent Runtime Realization`.

---

## 10. Open findings / routed work after 3H-01

Estes itens não reabrem fases anteriores automaticamente.

| Finding / questão | Owner posterior |
|---|---|
| F3B-R1 — repo canônico/cutover do produto | 3A / operador — antes de implementação |
| F3B-R4 — browser/runtime physical trust zones | 3I/3J |
| runtime orphan/lost detection policy after 3H-01 liveness surface | 3M |
| InceptionInvestigation pre-Change agent execution shape, somente se realization provar necessidade | Decision Loop / later 3H |
| Production Agent suspend/resume/wake/timer + schedule/signal realization | 3H-02/3L |
| F3E01-R1 — `mastra_par` backup/restore procedure | 3J |
| F3E01-R2 — `hub_control` rebuild 0..N em DB temporário | implementation verification |
| F3E02-R1 — Mastra `workflowDefinitions` nunca vira authoring authority | 3H-02/3L probe |
| F3E02-R2 — physical CredentialBackend custody | 3I / infra implementation |
| approver eligibility / post-admission cancellation / revocation authority | 3I |
| guest-held capability after E2B pause/resume: server-side expiry must remain enforcement point | 3I |
| DEDICATED concrete trust/credential/delegation mechanism | 3I |
| current security narrowing for old Releases / emergency stop | 3I/3J |
| DEDICATED egress/network policy | 3I/3J |
| MANAGED/DEDICATED physical deployment topology | 3J |
| physical Promotion/migration recovery and restore | 3M/3J |
| `OUTCOME_UNKNOWN` reconciliation / settlement | 3M |
| output/storage custody repair + orphan recovery | 3M |
| repeated quiescence/reconnect failure policy | 3M |
| Project purge/retention/GC | 3M/3J |
| archive/unpublish/trigger/recovery UX | 3K |
| Release/Promotion/rollback UI | 3K |
| approval-card/display contracts | 3K + implementation |
| Project binding Control Plane UI | 3K |
| exact wire/HTTP layout | implementation + contract tests; 3L only if technology requires qualification |
| exact `MANIFEST_INVALID` diagnostics | implementation + 3K |
| authored Project binding source/file schema + exact mutation DTOs | implementation + 3K |
| exact `brn.binding_validation` ref if proof shows it load-bearing | Decision Loop / 3N |
| binding change permissions | 3I |
| binding/Release/runtime end-to-end proof | 3N/3O |
| Production/cross-runtime F5 handoff realization; Builder side resolved by 3H-01 | later 3H / implementation |
| Mastra telemetry ↔ Conexus correlation beyond Builder-specific mapping | later 3H / 3L |
| Verification Observability package realization beyond 3H-01 verifier isolation | later 3H / 3L / 3N |
| `CX-BUILDER-MASTRA-01` P1..P29 qualification | 3L |
| quiescence template/process/deferred-execution surface qualification | 3L |
| `job/v1` queue/scheduler substrate | 3H/3L only on concrete need |
| async/attempt status projection for UI/query convenience | 3H/3K/implementation; never second authority |
| pools/failover/shared resources | Decision Loop on real consumer |
| break-glass binding/runtime override | Decision Loop on real incident failure class |
| app-origin approvals / second approval consumer | Decision Loop on real consumer |
| duplicate Gateway approval-subject custody | Decision Loop / 3J on real availability split |
| DEDICATED browser-direct Platform-Service authority | Decision Loop on named consumer |
| DEDICATED durable credential/grant record | Decision Loop if 3I proves lifecycle need |
| DEDICATED Release retirement/support lifecycle | Decision Loop when real install base requires |
| DEDICATED multi-install/fleet management | DEFER |

Technology qualification already named:

```text
CX-BUILDER-MASTRA-01
CX-AGENT-MASTRA-01
```

3L proves substrate behavior; failure material reopens substrate/realization, not domain semantics automatically.

---

## 11. Resolved routed work through 3H-01

```text
ApprovalRequest exact contract + lifecycle                     → 3F-03 + 3G-01
Builder Change/Finding/checkpoint/closure                      → 3G-02
Work Unit / Builder ActorRun retry/delivery/cancel             → 3G-03
N3 PlanningDepth × RigorProfile                                → 3G-04
Production AgentRun approval expiry/continuation/trigger       → 3G-05
AgentRun in-flight × newer Release behavioral law              → 3G-05
Gateway effect_attempt / budget / idempotency lifecycle        → 3G-06
Project binding mutation + Project lifecycle                   → 3G-07
archived Project with active Release                           → 3G-07
Release-side change_acceptance admissibility                   → 3G-08
Release/Promotion crash/concurrency behavioral semantics       → 3G-08
DEDICATED old-vs-new Release behavioral law                    → 3G-08; trust/retirement realization remains later
3G global coherence / completeness                             → 3G-R1
Builder ActorRun/CodingSession/AgentController/Workspace/E2B   → 3H-01
Builder source-lineage FRESH_BASE | CONTINUE_LINEAGE           → 3H-01
physical E2B incarnation observation/reverification            → 3H-01; exact mechanism 3L
Builder quiescence property + continue-lineage gate            → 3H-01; repeated recovery policy 3M
Builder-side F5 output custody/presentation                     → 3H-01
fresh verifier cognition/materialization isolation             → 3H-01; exact qualification 3L
CodingRuntime liveness/control capability surface              → 3H-01; orphan/recovery policy 3M
AgentController live-session state authority prohibition       → 3H-01
```

---

## 12. Anti-overengineering guardrail

Normative anti-overengineering details live in the exact approved decisions. Global summary:

```text
NO microservices by default
NO database-per-Hub-module / shared-common schema
NO generic ownership/binding/state/policy engine
NO UniversalRequest/Response/Status/Error/Envelope
NO workflow DSL / workflow engine across domain owners
NO event sourcing/CQRS/saga framework by default
NO shared retry engine / persisted generic retryable
NO Mission/Milestone without current consumer
NO CandidateService / DeliveryQueue / best-of-N arbitration
NO mutable historical acceptance/output/Release authority
NO state fan-out to mirror current drift
NO external-I/O-spanning transaction
NO runtime/provider/OBS self-report as domain authority
NO latest/current implicit runtime binding resolution
NO archive-triggered hidden unpublish/mass cancel
NO automatic effect replay under ambiguity
NO exactly-once fiction for external effects
NO Promotion queue/lease/fencing in single-writer F1
NO Release latest-only retirement policy without install-base consumer
NO SandboxPool / ProcessRegistry / RuntimeRegistry by default
NO mandatory custom E2B wrapper unless qualification proves the concrete need
NO Kafka/Kubernetes/Temporal merely for optionality
```

Expansion returns only through the Decision Loop with a named current consumer/failure class.

---

## 13. Regra de avanço

```text
3B = CLOSED / APPROVED
3C = CLOSED / APPROVED
3D = CLOSED / APPROVED
3E = CLOSED / APPROVED
3F = CLOSED / APPROVED
3G = CLOSED / APPROVED

3H = IN PROGRESS
3H-01 = APPROVED
3H-02 = NEXT
```

3H-01 foi ratificada após package intake, ChatGPT Round 1, independent Fable Round 1, ChatGPT Round 2 consolidation, independent Fable Round 2 e final ChatGPT Round 3 consolidation, sem Material Finding contra prior authority.

Próxima decisão:

> **3H-02 — Production Agent Runtime Realization**, cobrindo Mastra Agent runtime projection, Conversation/AgentRun mapping, suspend/resume/checkpoint, ApprovalRequest continuation e F1 SCHEDULE realization sem promover Mastra mechanics a product authority.

A Fase 3 completa continua em andamento até C-018. Nenhuma implementação de produto está autorizada por este ledger e PR #40 não deve ser mergeado sem autorização explícita do operador.