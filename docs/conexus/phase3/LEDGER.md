# Fase 3 — Live Ledger

**Status geral:** EM ANDAMENTO  
**Estado:** `3A CONTÍNUA / 3A-R6 APROVADA` · `3B CLOSED` · `3C CLOSED / APROVADA` · `3D CLOSED / APROVADA` · `3E CLOSED / APROVADA` · `3F CLOSED / APROVADA` · `3G CLOSED / APROVADA / 3G-01..3G-08 + 3G-R1 APROVADAS` · `3H CLOSED / APROVADA / 3H-01..3H-03 + 3H-R1 APROVADAS` · `3I EM ANDAMENTO / 3I-01..3I-05 APROVADAS`  
**Fase atual:** `3I — Security / Authority Architecture` — 3I-05 ratificada; próxima ação = bounded independent 3I closure review  
**Base canônica da Fase 3:** `354f44219fb5970bb9233976773db90d2102ae7a`  
**Autoridade anterior:** C-000..C-017  
**Importante:** este ledger não constitui C-018, não encerra a Fase 3 completa e não autoriza implementação de produto.

Este arquivo é o **router/status authority** vivo da Fase 3. Detalhe normativo permanece nos documentos de decisão linkados; review/dialogue files continuam não-autoritativos salvo conteúdo explicitamente ratificado em authority aprovada.

---

## 1. Authority e precedência documental

```text
C-000..C-017
→ autoridade fundacional anterior

3A-R6
→ Phase 3 Critical Path & Implementation Readiness

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

3H-02
→ Production Agent Runtime Realization

3H-03
→ Runtime Isolation, Correlation & Handoff

3H-R1
→ Runtime & Agent Architecture Final Closure

3I-01
→ Current Authorization, Approver Eligibility & Revocation

3I-02
→ Credential & Capability Custody

3I-03
→ Per-ActorRun / Per-AgentRun Model Spend Enforcement

3I-04
→ DEDICATED Trusted Exchange

3I-05
→ Trust Zones, Crossings & hub_control Least Privilege

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
| 3A — Architecture Reconciliation | CONTÍNUA até C-018 / **3A-R6 APROVADA** | aplicar 3A-R6 durante 3I–3O; F3B-R1 antes do Realization Planning |
| 3B — System Context & Boundaries | **CLOSED / APROVADA** | reabrir apenas por Finding material |
| 3C — Domain / Module Architecture | **CLOSED / APROVADA** | reabrir apenas por Finding material |
| 3D — Dependency Architecture | **CLOSED / APROVADA** | reabrir apenas por Finding material |
| 3E — Data Architecture | **CLOSED / APROVADA** | reabrir apenas por Finding material |
| 3F — Contracts & API Architecture | **CLOSED / APROVADA** | reabrir apenas por Finding material |
| 3G — Behavioral / State Architecture | **CLOSED / APROVADA** | [3G-R1](3G-R1-behavioral-state-architecture-final-closure.md) |
| 3H — Runtime & Agent Architecture | **CLOSED / APROVADA** | [3H-R1](3H-R1-runtime-agent-architecture-final-closure.md) |
| 3I — Security / Authority Architecture | **EM ANDAMENTO / 3I-01..3I-05 APROVADAS** | bounded independent 3I closure review; close only if no Material Finding |
| 3J — Deployment / Operations Architecture | NÃO INICIADA | primeira topologia real / backup / serving / stop; future-scale machinery deferred |
| 3K — Frontend / Product Architecture | NÃO INICIADA | F1 product surfaces + first vertical, partindo de C-001 caso 1 salvo redirect |
| 3L — Technology Qualification | NÃO INICIADA | somente probes load-bearing definidos por 3A-R6 |
| 3M — Failure & Recovery Architecture | NÃO INICIADA | structural recovery sufficiency sweep |
| 3N — Architecture Verification | NÃO INICIADA | independent global coherence review |
| 3O — Vertical Architecture Proof Contract | NÃO INICIADA | contract-only end-to-end proof target |

### 2.1 3A-R6 — Critical Path & Implementation Readiness

[3A-R6](3A-R6-phase3-critical-path-implementation-readiness.md) governa a **profundidade/routing** do restante da Fase 3. Não remove nenhuma fase e não altera a DevelopmentConexus Engineering Method.

Outcomes permitidos para cada questão restante:

```text
MUST DECIDE BEFORE IMPLEMENTATION
DEFER SAFELY
REJECT F1
```

Regra:

```text
coding actor teria de escolher owner/authority/durable meaning/trust/public contract?
OR escolha errada causa retrofit material?
OR first product/first production depende da resposta?
OR approved architecture depende de comportamento tecnológico ainda não provado?
→ MUST DECIDE

existing seam + no current consumer + no durable/current contract shaping
→ DEFER SAFELY com trigger + later owner

future optionality / generic machinery sem current consumer/failure class
→ REJECT F1
```

**Esta classificação aloca profundidade; nunca reduz o mínimo não-degradável da metodologia para um MUST DECIDE.**

Critical path ratificado:

```text
3I
→ 3I-04 DEDICATED Trusted Exchange = APPROVED
→ 3I-05 Trust Zones/Crossings + hub_control Least Privilege = APPROVED
→ bounded independent 3I closure review

3J
→ first production topology only
→ DEDICATED physical deployment deferred until first real DEDICATED consumer
→ old Product Agent runtime drain deferred until first post-production upgrade

3K
→ F1 product surfaces + first vertical
→ start from C-001 caso 1 (Analisador de Orçamentos) unless operator redirects

job/v1
→ CONDITIONAL MUST DECIDE only if selected first vertical requires Sankhya mirror/sync

3L
→ load-bearing qualification probes only

3M
→ do existing durable facts suffice for recovery?

3N
→ one independent global coherence review

3O
→ contract-only vertical architecture proof
```

C-018 fecha Architecture & System Design, mas **não autoriza product code**:

```text
3I–3O complete
→ C-018
→ F3B-R1 canonical product repo/cutover gate satisfied
→ post-C-018 Implementation Realization Planning Gate
→ accepted executable implementation plan(s)
→ only then product implementation by coding actors
```

Realization plans são **derived-only**; contradição material volta ao applicable Decision Loop; não nasce segunda architecture authority, nova metodologia, readiness framework ou phase family.

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
- [3A-R6 — Phase 3 Critical Path & Implementation Readiness](3A-R6-phase3-critical-path-implementation-readiness.md)

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

## 9. 3H — CLOSED / APPROVED

| ID | Decisão | Documento |
|---|---|---|
| 3H-01 | Builder Coding Runtime Realization & Session/Sandbox Mapping | [3H-01](3H-01-builder-coding-runtime-realization-session-sandbox-mapping.md) |
| 3H-02 | Production Agent Runtime Realization | [3H-02](3H-02-production-agent-runtime-realization.md) |
| 3H-03 | Runtime Isolation, Correlation & Handoff | [3H-03](3H-03-runtime-isolation-correlation-handoff.md) |
| 3H-R1 | Runtime & Agent Architecture Final Closure | [3H-R1](3H-R1-runtime-agent-architecture-final-closure.md) |

Ratificações pelo operador:

- 3H-01 / 3H-02: **2026-08-16**;
- 3H-03 / 3H-R1: **2026-08-17**.

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

### 9.2 3H-02 — Production Agent runtime laws

```text
Product Agent baseline = direct Mastra Agent
RuntimeAgentProjection derives from exact Release/composition and is rebuildable/non-authoritative
AgentRun admission/pins commit before any model/tool execution
Editor/Stored Agent/latest/version override paths cannot alter Product execution
ConversationId is Conexus identity; Mastra thread is substrate ref
Working/Agent Memory is consumer-gated; Semantic Recall/OM/Extractors are eval-gated
selective durable suspension realizes real waits; ApprovalRequest remains authority
proposal/effect identity is owner-minted/sealed; resumed args must still match exact subject
Gateway alone owns effect replay/idempotency
boot/recovery re-drive must re-enter PAR guards
AgentTrigger is authority; Mastra schedule row is derived timer mechanics
schedule fire enters guarded PAR ingress before Product Agent execution
occurrence identity = stable intended slot before admission; exact mechanism 3L
occurrence cursor = owner-local per (TriggerId, TriggerRevision)
F1 schedule single-flight; overlap occurrence is consumed SKIPPED, no backlog
EVENT/Signals/Inbox external Product ingress remains disabled F1
old non-terminal run resumes exact old Release/runtime projection
Mastra traces/logs/metrics/hooks = Operational Telemetry / diagnostics, never terminal/correctness authority
```

3H-02 framework coverage audit additionally classifica current Mastra primitives:

```text
ADOPT: Agent, threads/messages, tools/hooks, selective suspend/resume, schedules mechanics, observability
SELECTIVE: Workflows, Working Memory, Skills, Goals, Background Tasks, browser/workspace on explicit consumer
DEFER/eval: Semantic Recall, Observational Memory, Memory Extractors, Durable Agents, multi-agent/network, A2A/ACP, Channels, Temporal/Inngest, Mastra Platform deployment options
REJECT as Product authority: Editor/Stored/File-Based Agent SoT, latest resolution, native approval replacing Conexus approval, memory/goal/eval as business authority
```

3H-02 outcome:

```text
prior authority reopen = NONE
Alternative A = GLOBAL MAXIMUM
new module = 0
new durable record class = 0
new queue/scheduler/lease/recovery engine = 0
universal Workflow = 0
Durable Agent cache/pubsub requirement = 0
EVENT ingress = 0
CX-AGENT-MASTRA-01 = mandatory before deploy
```

Review provenance, non-authoritative:

- `3H-FABLE-DIALOGUE-production-agent-runtime-realization.md`;
- `3H-FABLE-DIALOGUE-production-agent-runtime-realization-R2.md`;
- `3H-FABLE-DIALOGUE-production-agent-runtime-realization-R3.md`.

Final result:

```text
CURRENT STRUCTURE CONFIRMED
```

### 9.3 3H-03 — Runtime isolation / correlation / handoff laws

```text
BuilderMastra != ParMastra
mastra_builder != mastra_par
same-process role runtime requires distinct role-local PubSub instances
shared external broker additionally requires distinct per-role namespace/keyPrefix
governed execution cannot use standalone/ephemeral Mastra or in-memory fallback
same-process is allowed only while enabled global mutable state is mechanically isolated
unpartitionable enabled global mutable state => 3J process-split trigger
ActorRunId / AgentRunId remain durable correlation anchors
one domain run may span 0..N trace segments
OTel is preferred observational plumbing, never authority
runtime role must be mechanically attributable on every relevant telemetry signal
RequestContext is rebuilt from owner facts and REPLACED WHOLE on dispatch/resume
Conexus owner IDs do not ride OTel baggage by default
high-cardinality run/trace IDs are not default metric dimensions
F5 control handoff != Operational Telemetry
in-process F5 target identity derives from owner dispatch closure/handle; payload id is cross-check only
producer provenance reuses HUB_AUTHORITY | GATEWAY_AUTHORITY | PROVIDER_OBSERVED | GUEST_OBSERVED
Verification Observability composes Hub + Mastra + E2B + app-under-test while preserving provenance
E2B pull by pinned physical sandboxId is the exact provider observation anchor
E2B OTLP push is best-effort Operational Telemetry enrichment, not sole deciding evidence
required verification evidence missing => NOT_PROVEN/INCONCLUSIVE
```

3H-03 outcome:

```text
prior authority reopen = NONE
Alternative A = GLOBAL MAXIMUM
new module = 0
new durable record class = 0
new runtime bus / queue / generic outbox = 0
mandatory process split = 0 unless CX-RUNTIME-ISOLATION-01 proves it necessary
mandatory OtelBridge / Collector / Sentry / Spotlight = 0
3H-04 = NOT JUSTIFIED
```

Review provenance, non-authoritative:

- `3H-FABLE-DIALOGUE-runtime-isolation-correlation-handoff.md`;
- `3H-FABLE-DIALOGUE-runtime-isolation-correlation-handoff-R2.md`;
- `3H-FABLE-DIALOGUE-runtime-isolation-correlation-handoff-R3.md`.

Final result:

```text
CURRENT STRUCTURE CONFIRMED
```

### 9.4 Final closure — 3H-R1

O closure review adversarial encontrou:

```text
Material Finding against 3H-01/02/03 or prior authority = NONE
missing material 3H decision                             = NONE
3H-04                                                    = NOT JUSTIFIED
reopen                                                   = NONE
verdict                                                  = CLOSE 3H
```

Três correções não-materiais foram incorporadas no closure authority:

1. **model spend-cap enforcement** — C-008 continua load-bearing após 3A-R5; o enforcement point atual é input explícito de 3I, composto com admission/budget/usage evidence existentes;
2. **C-013 admission coherence** — 3N deve provar ActorRun/AgentRun como realizações owner-local de persist-first/reservation/dispatch/honest-terminal, sem `UniversalAttempt` paralelo;
3. **`job/v1` / sync** — continua conscientemente deferred por C-007 `dispatch defer total`; primeiro Golden Path sync/mirror é likely near-term Decision Loop trigger.

Fechamento final:

```text
remaining material 3H decision = 0
3H-04 = NOT JUSTIFIED
prior phase reopen = NONE
new Hub module = 0
new durable record class = 0
new runtime bus / queue / generic outbox = 0
mandatory process split = 0 unless qualification fires
3H = CLOSED / APPROVED
```

---

## 10. 3I — IN PROGRESS

| ID | Decisão | Documento |
|---|---|---|
| 3I-01 | Current Authorization, Approver Eligibility & Revocation | [3I-01](3I-01-current-authorization-approver-eligibility-revocation.md) |
| 3I-02 | Credential & Capability Custody | [3I-02](3I-02-credential-capability-custody.md) |
| 3I-03 | Per-ActorRun / Per-AgentRun Model Spend Enforcement | [3I-03](3I-03-per-run-model-spend-enforcement.md) |
| 3I-04 | DEDICATED Trusted Exchange | [3I-04](3I-04-dedicated-trusted-exchange.md) |
| 3I-05 | Trust Zones, Crossings & `hub_control` Least Privilege | [3I-05](3I-05-trust-zones-crossings-hub-control-least-privilege.md) |

Ratificações pelo operador: **3I-01 / 3I-02 / 3I-03 / 3I-04 / 3I-05 — 2026-08-17**.

### 10.1 3I-01 — Current authorization / revocation laws

```text
current mutable authorization is resolved at protected owner control points
no cross-request cache of mutable I&A authority facts in F1
CONTROL_PLANE != PREVIEW != PUBLISHED_APP authority
security-sensitive mutation uses pre-state authority only
consumed mutable authority facts must be serialized against concurrent revocation through mutation commit
exact concurrency mechanism is implementation; stale pre-read cannot commit
operation owner declares permission; I&A resolves current Account access; owner/Gateway apply remaining gates
human ALLOW_ONCE requires currently eligible Account under exact action permission model on owner-derived surface
self-approval is allowed F1 because approval adds no platform privilege beyond current eligibility
committed approval remains immutable; no live approver-eligibility recheck inside FIRST_CLAIM
approval staleness bounded by existing expiry; incidents use revoke + owner cancel / Gateway close + current last-mile gates
interactive session lifetime != durable ActorRun/AgentRun lifetime
current authority is reapplied at durable re-entry points appropriate to each path; no continuous mid-segment permission polling
historical Release/run/approval facts remain immutable while current owner-committed facts may narrow new protected operations
raw telemetry/provider/guest observation never becomes authorization; owner-committed health/conformance state remains applicable per prior authority
no generic policy/revocation engine, auth snapshot/cache bus, universal four-eyes or security-stop entity
whole-Hub emergency stop is a 3J proof obligation before production
selective per-Project serving stop returns only by Decision Loop on proven incident class; likely owner seam = Release/MAR serving admission
```

3I-01 outcome:

```text
Material Finding against prior authority = NONE
Alternative B = GLOBAL MAXIMUM
CURRENT STRUCTURE CONFIRMED
new module = 0
new durable record class = 0
new Tier-2 FK = 0
new policy/revocation engine = 0
new auth snapshot/cache invalidation bus = 0
new approver role/four-eyes = 0
new stop/hold entity = 0
```

Review provenance, non-authoritative:

- `3I-FABLE-DIALOGUE-security-authority-intake-decomposition.md`;
- `3I-FABLE-DIALOGUE-current-authorization-approver-revocation.md`.

### 10.2 3I-02 — Credential & Capability Custody laws

```text
Connections owns CredentialHandle/logical-grant facts; secret bytes stay in CredentialBackend infrastructure
CredentialBackend F1 consumers remain exactly Connections + Gateway
Connection plaintext appears only at write-only administration ingress + trusted Gateway last-mile use
Qualification uses Gateway external I/O and does not create a third plaintext consumer
platform Git/E2B/model/DB/backup credentials reuse custody principles but remain owner-specific
physical secret backing is infra-owned, opaque-ref addressed, FK-free, domain-opaque and recoverable
filesystem-class backing is existence proof/admissible shape, not a technology pin
new domain record / hub_control schema / database / FK-backed secret store requires Decision Loop
ciphertext objects are write-once; every logical write creates a new unique ref
durable complete backing publication MUST precede domain visibility of credential_ref
replace = publish new durable object → guarded ref swap; never overwrite live ciphertext
normal crash may leave orphan backing only; dangling live ref is integrity incident + fail closed
orphan GC framework is not frozen; cleanup only after proof object cannot be/live become referenced
logical grant version != crypto key_version != transient token generation != future refresh_generation
transient acquired token = memory-only F1; persistence returns on first real provider consumer
root/recovery key material does not share a single non-Hub compromise path with ciphertext backup
old root generation remains decrypt-capable until zero live refs + recovery proof under successor
no KeyRotation FSM/domain record
sandbox telemetry ingest is the one current guest-readable capability class; OTLP push if adopted is same class
guest capability authority is Hub-minted, scoped, server-expiring, server-revocable on every use
guest ActorRun LLM-provider key remains deleted after control-side model-loop move
secret administration/rekey/recovery audit is metadata-only; no default per-use/decrypt ledger
full trusted-Hub-process compromise remains an explicit accepted F1 residual risk
```

3I-02 outcome:

```text
Material Finding against prior authority = NONE
Alternative A = GLOBAL MAXIMUM
CURRENT STRUCTURE CONFIRMED
new Hub module = 0
new durable domain record = 0
new hub_control schema/database = 0
new CredentialBackend consumer = 0
SecretService = 0
external Vault/KMS/HSM F1 = 0
per-secret DEK/envelope F1 = 0
KeyRotation FSM/record = 0
durable transient-token cache = 0
orphan GC framework = 0
per-use secret ledger = 0
guest LLM key = DELETED
```

Review provenance, non-authoritative:

- `3I-FABLE-DIALOGUE-security-authority-intake-decomposition.md`;
- `3I-FABLE-DIALOGUE-credential-capability-custody.md`.

### 10.3 3I-03 — Per-run model spend laws

```text
Builder ActorRun owns Builder model-spend authority; Production AgentRun owns Product model-spend authority
Gateway budget_counter remains external-effect-only; OBS remains evidence/accounting only
effective per-run modelSpendCapUsd/maxModelCalls are server-derived and pinned; caller/runtime cannot widen them
one unsettled billable model-call liability per run is the F1 baseline
provider I/O starts only after exact maximum liability reservation commits on the owner row
committed spend + outstanding liability <= run cap is the absolute owner-accounting invariant
every physical provider attempt requires its own owner admission; retries/fallbacks below the gate are disabled or must re-enter the gate
fallback/substitute provider/model requires a fresh qualified cost profile and reservation
all billable model calls caused by a governed run are budgeted or the feature stays disabled
qualified cost envelope requires exact provider/model/pricing profile + finite billable request ceilings
unknown/missing/ambiguous usage or cost never becomes zero; conservative settlement burns reserved maximum
downward settlement requires qualified usage evidence that preserves MISSING != ZERO; framework aggregates are non-authoritative when missingness can be lost
no NOT_SENT refund optimization F1; no retroactive run-budget refund after conservative settlement
provider/profile may use conservative-only settlement when reliable downward settlement is unavailable
cancel/terminal blocks new calls but does not refund already-admitted liability; monotonic settlement may complete after terminal without reviving the run
restart/resume/suspend/new trace cannot reset spend authority
streaming reserves full qualified maximum before the stream starts
provider-native account/project spend controls are defense-in-depth only, never per-run authority
actual provider-invoice bound is conditional on cost-envelope qualification; broken envelope blocks the profile and returns to 3L
```

3I-03 outcome:

```text
Material Finding against prior authority = NONE
Alternative A = GLOBAL MAXIMUM
CURRENT STRUCTURE CONFIRMED
new Hub module = 0
new durable domain record = 0
new hub_control schema/database = 0
ModelCallAttempt = 0
BudgetService/Runtime = 0
model proxy/token broker = 0
quota engine = 0
per-run provider API key = 0
parallel billable-call machinery = 0
NOT_SENT refund optimization = DEFERRED
```

Review provenance, non-authoritative:

- `3I-FABLE-DIALOGUE-security-authority-intake-decomposition.md`;
- `3I-FABLE-DIALOGUE-per-run-model-spend-enforcement.md`.

### 10.4 3I-04 — DEDICATED Trusted Exchange laws

```text
DEDICATED Platform-Service authority remains server-to-platform only
DedicatedApplicationPrincipal verification/revocation facts are Project-owned
one current Project-scoped asymmetric credential is the F1 baseline
Hub stores public verification material; DEDICATED server owns the private key
client authentication family = private_key_jwt
exact ReleaseRef is signed/bound inside the client assertion
DAP(Project A) + Release(Project B) fails closed
Hub issues short-lived signed bearer access token sealing DAP + exact ReleaseRef + credentialGeneration
every Platform-Service request validates token then rechecks current Project generation/narrowing
valid token is recent authentication + immutable Release assertion, never authorization snapshot
service/audience/Project/Workspace/bindings are server-derived; caller cannot widen them
SERVICE_SCOPED is the only F1 DEDICATED end-user semantic
own-auth app-user refs remain correlation/audit only
Project ARCHIVED does not implicitly disable DEDICATED exchange
explicit Project-owned credential revoke/disable advances current generation/equivalent current fact
access-token TTL bounds bearer-replay exposure; credentialGeneration bounds current revocation
no refresh token; client re-authenticates with its asymmetric credential after expiry
DPoP is DEFER SAFELY with explicit re-entry triggers; mTLS is deferred challenger
same-Project compromised-key residual = union of currently admissible Releases of that Project; no binary attestation claim
Hub token-signing key is owner-specific platform operational credential, not CredentialBackend expansion
```

3I-04 outcome:

```text
Material Finding against prior authority = NONE
CURRENT STRUCTURE CONFIRMED
owner of DAP verification facts = Project
client authentication = private_key_jwt
access token = short-lived signed bearer
per-request current generation recheck = REQUIRED
SERVICE_SCOPED = F1
USER_DELEGATED = DEFER
DPoP = DEFER SAFELY
mTLS = DEFER SAFELY
refresh token = REJECT F1
new Hub module = 0
new durable domain record = 0
DedicatedSession/introspection/blacklist = 0
fleet/per-Release credential/binary attestation = 0
```

Review provenance, non-authoritative:

- `3I-FABLE-DIALOGUE-dedicated-trusted-exchange.md`.

### 10.5 3I-05 — Trust Zones, Crossings & `hub_control` Least Privilege laws

```text
one authority protects two enforcement planes: crossings + persistence capability
six logical security zones do not imply six services/processes
business/application external execution remains Gateway-owned
platform-control egress uses only named owner-specific adapters
privileged egress destination derives from owner-pinned configuration/authority, never model output/caller payload/artifact content
browser request-authenticity and self-only/CSP laws are cited from C-015/C-016, not duplicated
E2B remains untrusted/root-capable; no durable/ERP/Git-write/model-provider/Hub-DB credential enters guest
transport never upgrades producer_trust; guest telemetry cannot mint AuditRecord/HUB_AUTHORITY
credentials/PII/mutable authority/owner IDs do not ride OTel baggage by default
normal hub_control persistence capability cannot reach another owner schema or SET ROLE into another owner
ordinary broad hub_control runtime login is rejected
normal runtime DB capability is non-owner, non-superuser, non-CREATEROLE/CREATEDB/BYPASSRLS
cross-owner atomicity remains closed: CreateProject(prj+iam) + effect admission(gw+par)
audit-required path gets append-only OBS capability only, not OBS read/update/delete authority
hub_control / mastra_builder / mastra_par / Project DB credentials remain physically isolated capabilities
separate DB capabilities do not force process split
full trusted-Hub RCE containment is not claimed by DB least privilege
```

3I-05 outcome:

```text
Material Finding against prior authority = NONE
CURRENT STRUCTURE CONFIRMED
package = ONE authority / TWO enforcement planes
new Hub module = 0
new durable record = 0
new database = 0
new process = 0
service mesh / universal egress = 0
RLS/policy engine = 0
ordinary broad hub_control login = REJECT
owner-scoped normal persistence capability = REQUIRED PROPERTY
cross-owner domain transaction cases = CLOSED SET = 2
remaining material 3I family on current evidence = 0
```

Review provenance, non-authoritative:

- `3I-FABLE-DIALOGUE-trust-zones-crossings-hub-control-least-privilege.md`.

Current dependency/closure shape:

```text
3I-01 = APPROVED
3I-02 = APPROVED
3I-03 = APPROVED
3I-04 = APPROVED
3I-05 = APPROVED
        ↓
bounded independent 3I closure review = NEXT
        ↓
3I-R1 only if no Material Finding
```

No additional material 3I topic is currently justified. The closure review may still surface a Material Finding and reopen only the implicated authority.

---

## 11. Open findings / routed work after 3I-05

Estes itens não reabrem fases anteriores automaticamente. 3A-R6 classifica quando cada item volta ao critical path.

| Finding / questão | Owner posterior |
|---|---|
| F3B-R1 — repo canônico/cutover do produto | **3A / operador — MUST DECIDE antes do post-C-018 Realization Planning Gate** |
| F3B-R4 — browser/runtime physical trust zones | **trust semantics RESOLVED by 3I-05**; physical placement/ingress → 3J according to first-production/first-consumer rules |
| Builder runtime orphan/lost detection policy after 3H-01 liveness surface | 3M structural recovery sweep |
| Production Agent admitted-but-undispatched / active-process-loss / missing-snapshot recovery policy | 3M structural recovery sweep |
| InceptionInvestigation pre-Change agent execution shape, somente se realization futura provar necessidade | Decision Loop / DEFER SAFELY |
| F3E01-R1 — `mastra_par` backup/restore procedure | 3J; required backup set/restore responsibility MUST, procedure detail may defer |
| F3E01-R2 — `hub_control` rebuild 0..N em DB temporário | implementation verification |
| F3E02-R1 — Mastra `workflowDefinitions` never authoring authority | 3L probe / implementation enforcement under 3H-02 |
| CredentialBackend exact encrypted backing primitive/path + host root-key custody | 3I-02 law closed; implementation/3J; no new record/schema/database silently |
| guest telemetry capability pause/resume expiry/scope transport proof | implementation/3L under 3I-02/3I-05 |
| orphan encrypted backing cleanup/repair if selected realization can produce it | 3M/3J/implementation under 3I-02 |
| Builder/PAR model-call pre-provider interception + retry/fallback neutralization | 3L/implementation under 3I-03 — MUST QUALIFY |
| provider usage extraction preserving MISSING != ZERO | 3L under 3I-03 — MUST QUALIFY |
| provider/model/request qualified cost-envelope proof | 3L under 3I-03 — MUST QUALIFY |
| model-bearing optional feature sweep for hidden billable calls | 3L under 3I-03; current baseline features budgeted-or-disabled |
| model-call reservation inclusion in C-013 owner-local admission coherence proof | 3N under 3I-03 + 3H-R1 |
| Product Agent browser/workspace/code execution trust/egress if first consumer enables it | Decision Loop / DEFER SAFELY; 3I-05 pre-binds named-owner/destination-authority requirement |
| whole-Hub emergency stop physical procedure / fail-closed ingress-process stop | **3J MUST DECIDE before first production** |
| post-whole-Hub-stop settlement/recovery | 3M structural recovery sweep |
| selective per-Project serving stop | Decision Loop only if real incident proves owner-local controls + whole-Hub stop unacceptable; likely Release/MAR serving-admission owner |
| DEDICATED trust/authentication semantics | **RESOLVED by 3I-04**; exact libraries/TTL/claim spelling → 3L/Realization Planning |
| DEDICATED egress/network trust semantics | **RESOLVED by 3I-05 + 3I-04**; physical DEDICATED deployment → DEFER SAFELY to 3J until first real deployment |
| MANAGED/DEDICATED physical deployment topology | **MANAGED first-production topology MUST in 3J; DEDICATED physical topology DEFER SAFELY until first real DEDICATED deployment** |
| DEDICATED private-key provisioning / Hub token-signing deployment | 3J only when physical realization is current; owner/custody semantics fixed by 3I-04 |
| DPoP / mTLS sender constraint | DEFER SAFELY / Decision Loop on 3I-04 reopen trigger |
| USER_DELEGATED / federation | Decision Loop on named DEDICATED consumer |
| fleet/per-install credential / per-Release credential / binary attestation | REJECT F1 / Decision Loop on real install-base/security requirement |
| `hub_control` PostgreSQL role/isolation properties | **RESOLVED by 3I-05 at property level**; exact LOGIN/role/GRANT/pool spelling → Realization Planning |
| `hub_control` owner-capability negative privilege matrix | Realization Planning + 3N/3O proof under 3I-05 |
| cross-owner transaction profiles / audit append mechanism | Realization Planning under closed 3E/3I-05 properties; third case → Decision Loop |
| Builder/PAR physical process split only if `CX-RUNTIME-ISOLATION-01` fires | 3J; qualification-triggered |
| old Product Agent runtime coexistence / drain / cutover | **DEFER SAFELY — trigger: first runtime-affecting upgrade after production / 3J** |
| `mastra_par` snapshot/thread schema upgrade compatibility operations | 3J/3L; upgrade operation detail deferred until first relevant upgrade |
| physical Promotion/migration recovery and restore | 3M structural semantics + 3J material operation boundary |
| `OUTCOME_UNKNOWN` reconciliation / settlement | 3M structural recovery sweep |
| output/storage custody repair + orphan recovery | 3M; only structural state requirement blocks C-018 |
| repeated Builder quiescence/reconnect failure policy | 3M; detailed operational refinement may DEFER SAFELY |
| Project purge/retention/GC | 3M/3J — DEFER SAFELY absent first-launch retention requirement |
| archive/unpublish/trigger/recovery UX | 3K only where first vertical requires it; otherwise DEFER SAFELY |
| Release/Promotion/rollback UI | 3K at journey level; detailed component spelling Realization Planning |
| approval-card/display contracts | 3K + implementation |
| Project binding Control Plane UI | 3K where first vertical requires it |
| Product Agent Conversation/memory/trigger UI | 3K where first vertical requires it |
| exact wire/HTTP layout | post-C-018 Realization Planning + contract tests; 3L only if technology behavior is load-bearing |
| exact `MANIFEST_INVALID` diagnostics | Realization Planning/implementation + 3K where user-observable |
| authored Project binding source/file schema + exact mutation DTOs | post-C-018 Realization Planning + implementation |
| exact `brn.binding_validation` ref if proof shows it load-bearing | Decision Loop / 3N |
| exact security-sensitive mutation serialization spelling (`FOR UPDATE`/SERIALIZABLE/equivalent) | Realization Planning/implementation verification; 3L only if pinned PostgreSQL behavior becomes load-bearing |
| binding/Release/runtime end-to-end proof | 3N/3O — MUST |
| exact Mastra telemetry role attributes / OTel Bridge/export realization | 3L only to the extent Verification Observability needs them; exporter topology can defer |
| Verification Observability capture/correlation qualification | 3L/3N — MUST QUALIFY subset |
| C-013 admission-ledger ↔ ActorRun/AgentRun coherence; verify one owner-local attempt realization and no parallel `UniversalAttempt` FSM | 3N — MUST |
| `CX-BUILDER-MASTRA-01` qualification | **3L MUST QUALIFY** |
| `CX-AGENT-MASTRA-01` including stable occurrence transport, restart, memory isolation, upgrade | **3L MUST QUALIFY applicable baseline** |
| `CX-RUNTIME-ISOLATION-01` cross-role qualification | **3L MUST QUALIFY** |
| role-local PubSub/default-bucket/external-broker namespace probes | 3L as part of runtime-isolation qualification |
| E2B pull/OTLP exact pinned-version behavior | E2B control/evidence subset 3L; production exporter topology 3J only if adopted |
| OTel baggage/redaction/egress policy | **RESOLVED by 3I-05 at property level**; exact propagator/header stripping → 3L/Realization Planning |
| platform-control egress destination configuration | **3I-05 property fixed**; exact owner adapter endpoint/config wiring → Realization Planning/3J as applicable |
| Semantic Recall / Observational Memory / Memory Extractors enablement | DEFER SAFELY / named Product consumer + 3L eval |
| Durable Agent enablement and its process-global registry | Decision Loop + 3L on named consumer |
| Observational Memory process-global `activeOps` if enabled | 3L on named consumer |
| Skills / Goals / Background Tasks Product enablement | implementation/Decision Loop when load-bearing; never independent authority |
| Rubric Scorers / Datasets / Experiments / Gates & Verdicts | 3L/3N as evidence tooling, not acceptance authority |
| Mastra Platform managed environments/workspaces/databases/regions | DEFER SAFELY optional deployment qualification |
| `job/v1` / deterministic sync dispatch | **CONDITIONAL MUST DECIDE: if 3K/3O first vertical requires Sankhya mirror/sync, run C-007 Decision Loop before its Realization Planning; otherwise remain deferred** |
| async/attempt status projection for UI/query convenience | 3K/Realization Planning; never second authority |
| pools/failover/shared resources | Decision Loop on real consumer |
| Product multi-agent/subagents/Agent Network | Decision Loop on real consumer |
| EVENT / Signals / Notification Inbox / Webhook Signals | C-007 / Decision Loop on first EVENT consumer |
| break-glass binding/runtime override | Decision Loop on real incident failure class |
| app-origin approvals / second approval consumer | Decision Loop on real consumer |
| duplicate Gateway approval-subject custody | Decision Loop / 3J on real availability split |
| DEDICATED browser-direct Platform-Service authority | Decision Loop on named consumer |
| DEDICATED durable credential/grant record | REJECT F1; Decision Loop only if one-current-Project-credential lifecycle proves insufficient |
| DEDICATED Release retirement/support lifecycle | Decision Loop when real install base requires |
| DEDICATED multi-install/fleet management | REJECT F1 / Decision Loop on real install base |

Technology qualification critical path per 3A-R6:

```text
CX-SBX-E2B-01
CX-BUILDER-MASTRA-01
CX-AGENT-MASTRA-01
CX-RUNTIME-ISOLATION-01
3I-03 model-spend interception/retry/usage subset
Verification Observability deciding-evidence subset
```

3L proves substrate behavior; material failure reopens substrate/realization first, not domain semantics automatically.

---

## 12. Resolved routed work through 3I-05

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
Product Agent exact Release→RuntimeAgentProjection              → 3H-02
Product Agent direct Agent baseline vs selective Workflow       → 3H-02
Conversation / memory scope partition                           → 3H-02
ApprovalRequest ↔ selective suspend/resume realization          → 3H-02
owner-minted sealed effect identity across resume               → 3H-02
Product Agent boot/re-drive guard law                           → 3H-02
SCHEDULE projection/guarded ingress/single-flight               → 3H-02
stable per-revision occurrence admission property               → 3H-02; exact transport 3L
Stored Agent/Editor/version override exclusion                  → 3H-02
EVENT/Signals operational exclusion F1                          → 3H-02; first consumer returns C-007
Mastra capability coverage classification                       → 3H-02; optional features routed to 3L/3N/3J/Decision Loop
Builder↔PAR role-specific Mastra/store/PubSub isolation        → 3H-03
same-process vs condition-triggered process split              → 3H-03; physical topology 3J
Conexus IDs ↔ 0..N OTel/runtime trace correlation              → 3H-03
RequestContext rebuild/replace-whole boundary                  → 3H-03
F5 control handoff identity/channel separation                 → 3H-03
producer_trust mapping for runtime/provider/guest observations → 3H-03
Verification Observability Mastra+E2B+app realization          → 3H-03; qualification 3L/3N
E2B pull anchor + OTLP enrichment semantics                    → 3H-03
3H completeness / no remaining runtime decision                → 3H-R1
current authorization freshness / no mutable auth cache F1     → 3I-01
security-sensitive mutation pre-state + revocation atomicity   → 3I-01
binding/credential/trigger/cancel mutation eligibility law     → 3I-01
ALLOW_ONCE current approver eligibility + self-approval         → 3I-01
post-approval role loss / expiry + cancel/close composition     → 3I-01
Account-origin durable-work authority re-entry                  → 3I-01
old Release current owner/security narrowing                    → 3I-01
owner-committed operational state vs raw observation            → 3I-01
emergency-stop deletion test / no new stop entity               → 3I-01; whole-Hub procedure 3J, selective serving stop Decision Loop
Connection secret plaintext + CredentialBackend custody boundary → 3I-02
CredentialBackend consumer closure = Connections + Gateway      → 3I-02
physical opaque infra-backing class / no new record-schema-DB   → 3I-02; exact primitive implementation/3J
durable-before-visible write-once/new-ref publication           → 3I-02
logical grant × crypto key × transient-token axis separation    → 3I-02
transient token memory-only baseline                             → 3I-02
root-key rekey + backup compromise-path/recovery laws            → 3I-02; runbook 3J
guest telemetry capability server-expiry/revocation              → 3I-02; exact transport proof 3L/implementation
guest ActorRun LLM key deletion                                  → 3I-02
metadata-only secret audit / no per-use secret ledger            → 3I-02
Builder/PAR owner-local model-spend authority                    → 3I-03
one-outstanding per-run model liability + pre-I/O reservation   → 3I-03
unknown/missing model usage burns conservative reservation       → 3I-03
qualified downward settlement preserves MISSING != ZERO          → 3I-03; exact extraction 3L
retry/fallback below model-spend gate prohibited                 → 3I-03; pinned mechanism proof 3L
all billable model-bearing run features budgeted-or-disabled     → 3I-03; capability sweep 3L
cancel/restart/resume cannot reset run spend                      → 3I-03
qualified cost-envelope + broken-profile fail-closed             → 3I-03; exact proof 3L
provider-native spend control = defense-in-depth only             → 3I-03
model-call reservation included in owner-local C-013 coherence   → 3I-03; proof 3N
DEDICATED application-principal credential owner                 → 3I-04 = Project
DEDICATED asymmetric client authentication                       → 3I-04 = private_key_jwt
DEDICATED exact ReleaseRef signed exchange binding               → 3I-04
DEDICATED short-lived bearer token + current generation recheck  → 3I-04
DEDICATED SERVICE_SCOPED-only F1                                 → 3I-04
DEDICATED archive/revoke/disable composition                     → 3I-04
DEDICATED no-session/no-refresh/no-blacklist baseline             → 3I-04
DPoP/mTLS/fleet/per-Release credential/binary attestation         → 3I-04 explicit defer/reject triggers
six logical trust zones / no topology split implication          → 3I-05
business egress Gateway-only × platform-control owner egress     → 3I-05
privileged egress destination anti-injection law                 → 3I-05
telemetry transport cannot elevate producer_trust                 → 3I-05
OTel baggage excludes authority/secrets/owner IDs by default     → 3I-05
hub_control owner-scoped normal persistence capability           → 3I-05
ordinary broad/SET-able umbrella DB login rejected               → 3I-05
two narrow cross-owner atomic transaction capability classes     → 3I-05
audit-required narrow append-only OBS path                        → 3I-05
hub_control/Mastra/Project DB credential isolation                → 3I-05
```

---

## 13. Anti-overengineering guardrail

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
NO mandatory custom E2B wrapper unless qualification proves concrete need
NO universal Product Agent Workflow wrapper
NO Product Agent schedule→agent direct bypass
NO Stored Agent/Editor as Product Agent authority
NO ScheduleOccurrence table / hidden backlog in F1
NO EVENT/Signal ingress before first trusted consumer
NO Durable Agent cache/pubsub requirement without reconnectable-stream consumer
NO semantic/observational memory enabled merely because framework supports it
NO RuntimeBus / EventBus / UniversalRuntimeEvent / generic F5 envelope
NO generic F5 outbox/queue without non-rederivable durable-delivery consumer
NO mandatory Builder/PAR process split without isolation Finding
NO OtelBridge / Collector / Sentry / Spotlight mandatory by architecture
NO owner IDs in OTel baggage by default
NO high-cardinality run IDs as default metric dimensions
NO Kafka/Kubernetes/Temporal/Inngest merely for optionality
NO Mastra Platform dependency as architecture requirement
NO cross-request mutable authorization cache in F1 before measured need
NO AuthoritySnapshot / AuthorizationEpoch / auth invalidation bus
NO generic RevocationEngine / SecurityCommandBus / CurrentSecurityPolicySnapshot
NO ApproverRole / universal requester!=approver / 2-of-N approval engine
NO continuous Account permission polling inside admitted runtime segment
NO public generic EffectAttempt close/admin API
NO EmergencyStop / SecurityHold / ProjectKillSwitch entity without proven incident class
NO generic SecretService / universal Credential domain
NO new Secret/Credential/CapabilityToken domain record or secret schema/database
NO new CredentialBackend consumers merely for uniformity
NO external Vault/KMS/HSM F1 without named trigger
NO per-secret DEK/envelope hierarchy F1
NO KeyRotation FSM/record
NO credential-specific outbox/distributed transaction
NO in-place overwrite of live ciphertext
NO durable transient-token cache F1
NO orphan-GC framework by default
NO per-decrypt/per-use secret audit ledger by default
NO generic guest-capability service
NO revival of guest LLM provider key
NO ModelCallAttempt / ModelBudget / QuotaReservation durable class F1
NO BudgetService / BudgetRuntime / ModelProxy / TokenBroker / generic QuotaService F1
NO provider API key per run merely for accounting isolation
NO parallel billable model-call reservation machinery F1
NO hidden automatic provider retry/fallback below owner spend gate
NO model-call traffic FSM / NOT_SENT refund optimization F1
NO post-invoice run-budget refund engine F1
NO DedicatedApplication / DedicatedCredential / DedicatedAccessGrant / DedicatedSession durable class F1
NO DEDICATED refresh-token/introspection/blacklist state F1
NO DPoP proof/jti/nonce machinery F1 without trigger
NO mTLS PKI / fleet-device identity / per-Release credential / binary attestation F1 without trigger
NO generic machine-identity framework
NO DEDICATED physical topology before first real DEDICATED deployment
NO service mesh / SPIFFE-SPIRE F1
NO UniversalEgressService / privileged generic fetch client F1
NO network microsegmentation between in-process modules F1
NO ordinary broad hub_control runtime login
NO RLS/policy engine for module ownership F1
NO generic cross-owner transaction/UnitOfWork engine
NO dynamic DB credential broker / per-request ephemeral DB roles
NO telemetry PKI / per-span authorization
NO process split solely for owner DB credentials
NO product implementation before C-018 + accepted post-C-018 Realization Planning
NO Realization Planning as second architecture authority/readiness framework
```

Expansion returns only through Decision Loop with named current consumer/failure class.

---

## 14. Regra de avanço

```text
3A = CONTINUOUS until C-018
3A-R6 = APPROVED

3B = CLOSED / APPROVED
3C = CLOSED / APPROVED
3D = CLOSED / APPROVED
3E = CLOSED / APPROVED
3F = CLOSED / APPROVED
3G = CLOSED / APPROVED
3H = CLOSED / APPROVED

3H-01 = APPROVED
3H-02 = APPROVED
3H-03 = APPROVED
3H-04 = NOT JUSTIFIED
3H-R1 = APPROVED / CLOSED

3I = IN PROGRESS
3I-01 = APPROVED
3I-02 = APPROVED
3I-03 = APPROVED
3I-04 = APPROVED
3I-05 = APPROVED
```

3A-R6 foi ratificada em **2026-08-17** após independent Fable challenge com `CURRENT STRUCTURE CONFIRMED`, `Material Finding = NONE`, `method amendment = NONE`; congela a classificação `MUST DECIDE | DEFER SAFELY | REJECT F1`, promove F3B-R1 a blocker antes do Realization Planning, torna `job/v1` conditional blocker se o first vertical precisar mirror/sync, demove DEDICATED physical topology e old-runtime drain para triggered defers, ancora 3K em C-001 caso 1 salvo redirect e estabelece que C-018 fecha architecture mas não autoriza product code.

3H-01 foi ratificada após package intake, ChatGPT/Fable adversarial rounds e final consolidation sem Material Finding contra prior authority.

3H-02 foi ratificada após rounds adversariais, evidence correction e auditoria adicional das capabilities atuais do Mastra, sem primitive material ausente.

3H-03 foi ratificada em **2026-08-17** após dois rounds adversariais, source review de Mastra/E2B/OpenTelemetry/Spotlight e final consolidation.

3H-R1 foi ratificada em **2026-08-17** após closure review adversarial com `Material Finding = NONE`, `missing material 3H decision = NONE`, `3H-04 = NOT JUSTIFIED` e três correções não-materiais de routing/proof visibility incorporadas.

3I intake/decomposition foi concluído sem Material Finding contra 3B..3H. O principal-taxonomy candidate falhou materiality e virou somente preâmbulo de 3I-01; o decomposition restante preserva owner/failure-class boundaries sem numerar antecipadamente decisões.

3I-01 foi ratificada em **2026-08-17** após independent Fable challenge com `CURRENT STRUCTURE CONFIRMED`, incorporando atomicity contra concurrent revocation, durable re-entry current-authority law, exact approver eligibility, post-approval expiry+cancel/close composition, owner-committed-state vs raw-observation split e emergency-stop deletion test.

3I-02 foi ratificada em **2026-08-17** após dois rounds adversariais de custody com `CURRENT STRUCTURE CONFIRMED`, `Material Finding = NONE`, storage tension de 3E resolvida sem novo domain record/schema/database, durable-before-visible cross-store publication, transient-token memory-only YAGNI baseline, crash-safe rekey/recovery e guest-capability closure.

3I-03 foi ratificada em **2026-08-17** após independent Fable challenge com `CURRENT STRUCTURE CONFIRMED`, `Material Finding = NONE`, owner-local ActorRun/AgentRun spend authority, one-outstanding liability, conservative unknown settlement, retry/fallback escape closure, qualified missingness-preserving usage settlement e cost-envelope honesty; a otimização `NOT_SENT` foi deliberadamente deferred por YAGNI.

3I-04 foi ratificada em **2026-08-17** após independent Fable challenge com `CURRENT STRUCTURE CONFIRMED`, `Material Finding = NONE`; congela Project-owned one-current asymmetric DEDICATED credential, `private_key_jwt`, signed exact ReleaseRef binding, short-lived bearer access token, per-request current credential-generation/narrowing recheck e SERVICE_SCOPED-only F1, enquanto DPoP/mTLS/fleet/per-Release credential/binary attestation permanecem triggered defers/rejects.

3I-05 foi ratificada em **2026-08-17** após independent Fable challenge com `CURRENT STRUCTURE CONFIRMED`, `Material Finding = NONE`; fecha trust-zone/crossing semantics, separa business egress de platform-control owner egress com anti-injection de destination authority, mantém producer trust não elevável por transport e torna `hub_control` ownership fisicamente enforçável por owner-scoped DB capabilities + somente duas narrow cross-owner transaction cases, sem novo module/record/database/process/security engine.

Próxima ação dentro de 3I:

> Executar **um único bounded independent 3I closure review** sobre 3I-01..3I-05 + routed work. O review deve verificar somente: missing trust boundary, duplicate authorization authority, widened secret path, missing current revocation path, hidden new durable security record/module, unrouted material C-018 security blocker e contradição com 3A-R6. Se `Material Finding = NONE` e `remaining material 3I decision = 0`, o próximo candidato é `3I-R1 — Security / Authority Architecture Final Closure`; nenhum novo topic intermediário é justificado.

Depois de 3I, 3J–3O seguem integralmente, mas sob 3A-R6. F3B-R1 deve estar decidido antes do post-C-018 Realization Planning Gate. Product implementation permanece proibida até C-018 + accepted derived realization plan(s).

A Fase 3 completa continua em andamento até C-018. Nenhuma implementação de produto está autorizada por este ledger e PR #40 não deve ser mergeado sem autorização explícita do operador.