# Fase 3 — Live Ledger

**Status geral:** EM ANDAMENTO  
**Estado:** `3A CONTÍNUA / 3A-R6 + 3A-R7 + 3A-R8 + 3A-R9 + 3A-R10 APROVADAS / 3A-R11 CLOSED — APPROVED / OPERATOR RATIFIED` · `3B CLOSED` · `3C CLOSED / APROVADA` · `3D CLOSED / APROVADA` · `3E CLOSED / APROVADA` · `3F CLOSED / APROVADA` · `3G CLOSED / APROVADA / 3G-01..3G-08 + 3G-R1 APROVADAS` · `3H CLOSED / APROVADA / 3H-01..3H-03 + 3H-R1 APROVADAS` · `3I CLOSED / APROVADA / 3I-01..3I-05 + 3I-R1 APROVADAS` · `3J CLOSED / APROVADA / 3J-01..3J-03 + 3J-R1 APROVADAS` · `3K CLOSED / APROVADA / 3K-01..3K-04 + 3K-R1 APROVADAS` · `3L IN PROGRESS / 3L-R1 CURRENT / PACKAGE A COMPLETE / PACKAGE B CLOSED — LEAD-ADJUDICATED — QUALIFIED FOR CURRENT F1 TESTED PROPERTIES / BT-5N QUALIFIED_SAME_PROCESS / PACKAGE C DEFER SAFELY / NOT EXECUTED / PACKAGES D/E NOT EXECUTED — REQUIRE PROPORTIONAL REDERIVATION`
**Fase atual:** `3L — Technology Qualification` — **IN PROGRESS / Q0 COMPLETE / 3L-R1 APPROVED-CURRENT / PACKAGE A COMPLETE / PACKAGE B CLOSED — LEAD-ADJUDICATED — QUALIFIED FOR CURRENT F1 TESTED PROPERTIES / BT-1 PASS / BT-2 PASS / BT-3 FRAMEWORK BEHAVIOR CHARACTERIZED / BT-3A COMPLETE — NATIVE SCHEMA HYPOTHESIS REJECTED / BT-3N PASS — LEAD-ADJUDICATED — PASS_NATIVE_HITL_OWNER_BOUNDARY / BT-4N PASS — LEAD-ADJUDICATED — PASS_NATIVE_SCHEDULE_INGRESS / BT-5N PASS — LEAD-ADJUDICATED — QUALIFIED_SAME_PROCESS / PACKAGE C DEFER SAFELY — NOT EXECUTED / PACKAGES D/E NOT EXECUTED — REQUIRE PROPORTIONAL REDERIVATION**; `3A-R11 — Whole-Product Authority Rebaseline` = **CLOSED / APPROVED / OPERATOR RATIFIED em 2026-08-18**; [3L-R1 — Framework-Native Proportional Qualification Rebaseline](3L-R1-framework-native-proportional-qualification-rebaseline.md) = **APPROVED / CURRENT / OPERATOR RATIFIED em 2026-08-19**; [3L-Q0 — Technology Qualification Manifest](3L-Q0-qualification-manifest.md) = **APPROVED / COMPLETE / ROUTE PARTIALLY SUPERSEDED BY 3L-R1**; `3A-R10 — Pre-Implementation Convergence & Realization Routing` = **APPROVED / CURRENT STRUCTURE CONFIRMED + BOUNDED ROUTING CORRECTION**
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

3A-R7
→ Platform Consultant Ownership Reconciliation

3A-R8
→ Project Baseline & Change Engineering Coherence

3A-R9
→ Managed Job / Deterministic Sync Dispatch Reconciliation

3A-R10
→ Pre-Implementation Convergence & Realization Routing

3A-R11
→ Whole-Product Authority Rebaseline / CLOSED / APPROVED / OPERATOR RATIFIED

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

3I-R1
→ Security / Authority Architecture Final Closure

3J-01
→ First Production Topology, Placement & Ingress

3J-02
→ Operational State, Backup & Restore Architecture

3J-03
→ Platform Lifecycle, Secret Injection, Emergency Stop & Availability

3J-R1
→ Deployment / Operations Architecture Final Closure

3K-01
→ Product Model, Project Shell, Build Workspace & Inspectability

3K-02
→ Trust, Decision & Observable Truth

3K-03
→ First Vertical Composition & Data Path

3K-04
→ Product Agent Authoring, Management & Use Journey

3K-R1
→ Frontend / Product Architecture Final Closure

3L-Q0
→ Technology Qualification Manifest / exact probe pins + serial package admission

este LEDGER
→ status / navigation authority da Fase 3
```

Regra de leitura:

```text
AGENTS.md
→ docs/engineering/standards/root-cause-global-maximum-method.md
→ docs/DOCUMENTATION-MAP.md
→ docs/conexus/current/README.md
→ current Product Contract / Architecture Baseline / Decision Reconciliation conforme a questão
→ este LEDGER quando Phase-3 status/detail for relevante
→ exact accepted detailed semantic authority
→ deciding Evidence/current implementation somente quando material
```

Nenhuma conversa cria authority.

---

## 2. Estado das fases

| Fase | Estado | Próxima ação |
|---|---|---|
| 3A — Architecture Reconciliation | CONTÍNUA até C-018 / **3A-R6..R10 APPROVED / 3A-R11 CLOSED — APPROVED / OPERATOR RATIFIED** | reabrir somente por Finding material; current tree é o entrypoint canônico |
| 3B — System Context & Boundaries | **CLOSED / APROVADA** | reabrir apenas por Finding material |
| 3C — Domain / Module Architecture | **CLOSED / APROVADA** | reabrir apenas por Finding material |
| 3D — Dependency Architecture | **CLOSED / APROVADA** | reabrir apenas por Finding material |
| 3E — Data Architecture | **CLOSED / APROVADA** | reabrir apenas por Finding material |
| 3F — Contracts / API Architecture | **CLOSED / APROVADA** | reabrir apenas por Finding material |
| 3G — Behavioral / State Architecture | **CLOSED / APROVADA** | [3G-R1](3G-R1-behavioral-state-architecture-final-closure.md) |
| 3H — Runtime & Agent Architecture | **CLOSED / APROVADA** | [3H-R1](3H-R1-runtime-agent-architecture-final-closure.md) |
| 3I — Security / Authority Architecture | **CLOSED / APROVADA** | [3I-R1](3I-R1-security-authority-architecture-final-closure.md); reabrir apenas por Finding material |
| 3J — Deployment / Operations Architecture | **CLOSED / APROVADA** | reabrir apenas por Finding material |
| 3K — Frontend / Product Architecture | **CLOSED / APROVADA / 3K-01..3K-04 + 3K-R1 APROVADAS** | [3K-R1](3K-R1-frontend-product-architecture-final-closure.md); reabrir apenas por Finding material |
| 3L — Technology Qualification | **IN PROGRESS / 3L-R1 CURRENT / PACKAGE A COMPLETE / PACKAGE B CLOSED — LEAD-ADJUDICATED — QUALIFIED FOR CURRENT F1 TESTED PROPERTIES / BT-5N QUALIFIED_SAME_PROCESS / PACKAGE C DEFER SAFELY / NOT EXECUTED / PACKAGES D/E NOT EXECUTED — REQUIRE PROPORTIONAL REDERIVATION** | [3L-R1](3L-R1-framework-native-proportional-qualification-rebaseline.md); fresh BT-5N Evidence is recorded; `CX-RUNTIME-ISOLATION-01` is qualified for enabled F1 surfaces and downstream obligations remain routed to first-build conformance, 3M, Package E and 3N |
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
OR first product/first production depende disso?
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
→ 3I-R1 Security / Authority Architecture Final Closure = APPROVED / CLOSED

3J
→ first production topology only
→ DEDICATED physical deployment deferred until first real DEDICATED consumer
→ old Production Agent Runtime drain deferred until first post-production upgrade

3K
→ CLOSED / APPROVED by 3K-R1
→ 3K-01..3K-04 approved
→ internal closure Material Finding = 0
→ final independent Fable Material Finding = 0

job/v1
→ RESOLVED FOR FIRST VERTICAL by 3A-R9
→ managed sync only; MANAGED_JOB Gateway surface; Release-derived schedule; no generic automation/workflow runtime

3L
→ IN PROGRESS
→ Q0 Qualification Manifest = APPROVED / COMPLETE
→ Package A — Builder Substrate + Cognition = COMPLETE / A1 PASS / A2 PASS WITH REQUIRED GUARD / A3 KEEP OM OFF
→ 3A-R11 = CLOSED / APPROVED / OPERATOR RATIFIED
→ Package B — Product Agent + Cross-Runtime = CLOSED / LEAD-ADJUDICATED / QUALIFIED FOR CURRENT F1 TESTED PROPERTIES
→ B0 = EXECUTION COMPLETE / LEAD-ADJUDICATED / PASS
→ proof-routing amendment = APPROVED / CURRENT
→ BT-1 = PASS
→ BT-2 = PASS
→ BT-3 observed Mastra continuation behavior = FRAMEWORK BEHAVIOR CHARACTERIZED
→ BT-3A = COMPLETE / NATIVE SCHEMA HYPOTHESIS REJECTED
→ 3L-R1 = APPROVED / CURRENT / OPERATOR RATIFIED
→ BT-3N = PASS / LEAD-ADJUDICATED / PASS_NATIVE_HITL_OWNER_BOUNDARY
→ BT-4N = PASS / LEAD-ADJUDICATED / PASS_NATIVE_SCHEDULE_INGRESS
→ BT-5N = PASS / LEAD-ADJUDICATED / QUALIFIED_SAME_PROCESS
→ CX-AGENT-MASTRA-01 = QUALIFIED FOR CURRENT F1 TESTED PROPERTIES
→ CX-RUNTIME-ISOLATION-01 = QUALIFIED_SAME_PROCESS FOR ENABLED F1 SURFACES
→ Package B = CLOSED / LEAD-ADJUDICATED / QUALIFIED FOR CURRENT F1 TESTED PROPERTIES
→ Package C = DEFER SAFELY / NOT EXECUTED
→ Packages D/E = NOT EXECUTED / REQUIRE PROPORTIONAL REDERIVATION
→ Product implementation = BLOCKED
→ C-018 = NOT RATIFIED
→ B1-01..B4-18 = PRESERVED DOWNSTREAM PROOF INVENTORY / NOT LITERAL PRE-C-018 EXECUTION
→ BT-5N fresh Evidence accepted by Architecture-Lead closure adjudication
→ load-bearing qualification probes only
→ includes CX-MANAGED-JOB-01 from 3A-R9
→ routing refined by 3A-R10

3M
→ do existing durable facts suffice for recovery?

3N
→ one independent global coherence review

3O
→ contract-only vertical architecture proof
```

Historical pre-execution route, superseded by the executor record above: `BT-5N = NEXT / EXECUTION AUTHORIZED`.

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

### 2.2 3A-R7 + pre-3K Global Platform Coherence Checkpoint — CLOSED / POSITIVE

[3A-R7 — Platform Consultant Ownership Reconciliation](3A-R7-platform-consultant-ownership-reconciliation.md) foi ratificada pelo operador em **2026-08-17** como bounded gap-fill e fecha o único finding material do pre-3K Global Platform Coherence Checkpoint.

Resultado do checkpoint:

```text
pre-3K Global Platform Coherence Checkpoint = CLOSED / POSITIVE
CURRENT STRUCTURE CONFIRMED
único finding F-GPC-01 / AGT-4 = RESOLVED por 3A-R7
C-003 F1 orphan requirements = 0
reopen 3B–3J = NONE
```

Conteúdo essencial de 3A-R7 (não reabre 3B–3J): `AGT-4` = capability de assistência **owned pelo Builder e apresentada pelo Control Plane**; platform knowledge publicado/versionado/provenance-preserving/digest-pinned sob a pack discipline do Conexus, nunca Workspace Brain content; contexto tenant sempre derivado server-side do current authorized Workspace/Project; `new module / principal / PLATFORM-scoped agent artifact / hidden tenant / PAR lifecycle / cross-Workspace authority / global agent state = 0`; surface concreta → 3K; platform agent global persistente → Decision Loop com consumidor real. **C-001 permanece a product vision authority.**

Review provenance, não-autoritativa: `3A-FABLE-DIALOGUE-pre-3K-global-platform-coherence-checkpoint.md`.

### 2.3 3A-R8 — Project Baseline & Change Engineering Coherence — APPROVED

[3A-R8 — Project Baseline & Change Engineering Coherence](3A-R8-project-baseline-change-engineering-coherence.md) foi ratificada pelo operador em **2026-08-18** após coherence sweep interno + pesquisa externa adversarial.

Resultado:

```text
CURRENT STRUCTURE CONFIRMED + BOUNDED CORRECTION APPROVED
Project architecture = SPEC-ANCHORED / LIVING / INCREMENTAL
big-design-up-front = REJECT
new module / record / DB / workflow = 0
prior phase structural reopen = NONE
```

Lei essencial:

> O Project Baseline aprovado deve ser suficiente para o `Change` atual, não completo para toda capacidade futura. Antes de coding dispatch, nenhuma decisão material requerida por aquele Change pode ser delegada implicitamente ao coding actor. Todo Change pina a Baseline exata; descoberta que exige alterar Project-level meaning interrompe antes de cruzar a boundary, retorna por Finding/Replan/Handoff e só prossegue contra revisão de Baseline explicitamente aprovada. `ProjectBaselineDigest` passa a participar explicitamente da identidade de execução/prova.

3A-R8 preserva C-005/C-006/C-007/C-012 como paved roads: platform mechanics devem continuar mecanizados; Baseline governa Project-specific meaning e não vira manual duplicado de SDK/scaffold.

### 2.4 3A-R9 — Managed Job / Deterministic Sync Dispatch — APPROVED

[3A-R9 — Managed Job / Deterministic Sync Dispatch Reconciliation](3A-R9-managed-job-deterministic-sync-dispatch-reconciliation.md) foi ratificada pelo operador em **2026-08-18** após o trigger de 3K-03.

Resultado:

```text
CURRENT STRUCTURE CONFIRMED + BOUNDED CORRECTION APPROVED
job/v1 first consumer = governed managed sync
Managed Application Runtime owner = preserved
mar.job_run = sufficient durable occurrence record
MANAGED_JOB Gateway surface = explicit
schedule authority = exact active served Release composition
scheduler/queue = reconstructible mechanics
manual + fixed interval = F1
single-flight + coalesce = F1
one catch-up after downtime = F1
arbitrary privileged Project job code = REJECT F1
workflow/automation/scheduler domain = REJECT F1
new module / record / DB = 0
CX-MANAGED-JOB-01 = MUST QUALIFY in 3L
```

Lei essencial:

> `job/v1` não é um mini workflow engine nem arbitrary Project code executando dentro do Hub. O primeiro profile admitido coordena sync por capabilities governadas; credentials/network/DB authority permanecem no Gateway/owners. A Release pinada governa o que pode produzir ocorrências futuras e o scheduler é projeção reconstruível. Cada `job_run` pina exact Release/job revision, single-flight evita overlap e downtime gera no máximo um catch-up do sync, nunca replay de todos os slots perdidos.

3A-R9 adiciona somente a bounded surface `MANAGED_JOB` a 3D-02 e a qualification `CX-MANAGED-JOB-01` ao 3L; não reabre 3C/3E nem cria novo domain.

### 2.5 3A-R10 — Pre-Implementation Convergence & Realization Routing — APPROVED

[3A-R10 — Pre-Implementation Convergence & Realization Routing](3A-R10-pre-implementation-convergence-realization-routing.md) foi ratificada pelo operador em **2026-08-18** antes da execução de 3L.

Resultado:

```text
CURRENT STRUCTURE CONFIRMED + BOUNDED ROUTING CORRECTION
prior structural phase reopen = NONE
new module / record / DB / workflow = 0
architecture/readiness framework = 0
product implementation = BLOCKED

technology selected != technology qualified
historical probe != executable verbatim after later authority supersession
Builder Observational Memory / long-context = MUST EVALUATE, NOT MUST ENABLE
CX-BUILDER-COGNITION-01 = 3L deciding-evidence identifier
Product Agent OM / Semantic Recall / Extractors = remain consumer/eval-gated
first-build implementation-dependent probes = mandatory downstream, not pulled into 3L
post-C-018 Realization Planning = REQUIRED / DERIVED-ONLY
```

3L passa a executar cinco packages:

```text
A — Builder Substrate + Cognition
B — Product Agent + Cross-Runtime
C — Model Economics / Enforcement
D — Managed Execution
E — Deciding Evidence
```

Regra essencial:

> Um probe histórico deve primeiro identificar o invariant protegido, aplicar a current authority, apagar criteria de mechanism explicitamente superseded, pinar a stack exata e só então executar. Um mechanism antigo não pode ser ressuscitado por fixture histórica.

3A-R10 também torna explícito o downstream proof map (`CX-BRAIN-V0-01`, `CX-BRAIN-DISCOVERY-01`, `CX-BRAIN-FEEDBACK-01`, `CX-SCAFFOLD-V0-01`, `CX-OBS-V0-01`, `CX-PUB-V0-01`, `CX-REL-V0-01`, QA-DB e Security conformance): estes probes continuam obrigatórios nos slices que implementam suas capabilities, mas não pertencem a 3L quando exigem product bytes para existir.

### 2.6 3L-Q0 — Technology Qualification Manifest — APPROVED / COMPLETE

[3L-Q0 — Technology Qualification Manifest](3L-Q0-qualification-manifest.md) foi ratificada pelo operador em **2026-08-18** e abre formalmente 3L sem executar nenhum probe.

Resultado:

```text
3L = OPEN / IN PROGRESS
Q0 = APPROVED / COMPLETE
Package A = COMPLETE / A1 PASS / A2 PASS WITH REQUIRED PHYSICAL-INCARNATION GUARD / A3 EVALUATED — KEEP OM OFF
Package B = CLOSED / LEAD-ADJUDICATED / QUALIFIED FOR CURRENT F1 TESTED PROPERTIES / BT-1 PASS / BT-2 PASS / BT-3 FRAMEWORK BEHAVIOR CHARACTERIZED / BT-3A COMPLETE — NATIVE SCHEMA HYPOTHESIS REJECTED / BT-3N PASS — LEAD-ADJUDICATED — PASS_NATIVE_HITL_OWNER_BOUNDARY / BT-4N PASS — LEAD-ADJUDICATED — PASS_NATIVE_SCHEDULE_INGRESS / BT-5N PASS — LEAD-ADJUDICATED — QUALIFIED_SAME_PROCESS
Package C = DEFER SAFELY / NOT EXECUTED
Packages D/E = NOT EXECUTED / REQUIRE PROPORTIONAL REDERIVATION
CX-AGENT-MASTRA-01 = QUALIFIED FOR CURRENT F1 TESTED PROPERTIES
CX-RUNTIME-ISOLATION-01 = QUALIFIED_SAME_PROCESS FOR ENABLED F1 SURFACES
product implementation = BLOCKED
prior architecture reopen = NONE
```

Q0 congela **identidade de qualificação, não arquitetura permanente**: Node/npm/TypeScript do probe host, PostgreSQL 17 current-minor probe pin, exact candidate pins de Mastra/Memory/PG/E2B, supply-chain admission, exact model/provider/pricing identity antes de chamadas billable e pg-boss como incumbent candidate. A antiga execução incondicional `A → B → C → D → E` foi parcialmente superseded por 3L-R1: serial adjudication permanece, C é deferred e D/E são rederivados antes de admissão. `latest`, alias mutável, semver range/transitive dependency não congelada e historical criterion não compilado contra current authority são deciding identities inadmissíveis.

Q0 não instala dependências, não implementa probe harness e não executa Package A.

### 2.7 3A-R11 — Whole-Product Authority Rebaseline — CLOSED / APPROVED / OPERATOR RATIFIED

[3A-R11 — Whole-Product Authority Rebaseline](3A-R11-whole-product-authority-rebaseline.md) foi ativada pelo operador em **2026-08-18**. O independent whole-product Fable review terminou, e [a adjudicação](3A-R11-fable-review-adjudication.md) classificou `FBL-01..17` como correções obrigatórias de projeção/roteamento sobre authority já fechada.

Estado de execução:

```text
R11-F independent Fable review = COMPLETE / PASS
R11-G adjudication = COMPLETE / BOUNDED CORRECTION REQUIRED
FBL-01..17 = ADJUDICATED / CORRECT_PROJECTION
Round-3 Fable corrections = APPLIED
closure-keyed pass = FOUND R3C-01..08
Round-3.1 projection correction = APPLIED / VERIFIED
final GPT authority review = COMPLETE / PASS
R11-H operator ratification = APPROVED / 2026-08-18
R11 = CLOSED / ACCEPTED
Package B = NEXT / NOT STARTED
```

As correções não reabriram 3B–3K e não criaram requirement de produto, owner, module, durable record, database ou processo. A final GPT authority review verificou a projeção, e o operador ratificou os blobs exatos do current tree. Package B agora é apenas o próximo pacote a ser rederivado/admitido; não foi iniciado. Implementação de produto permanece bloqueada.

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
- [3A-R10 — Pre-Implementation Convergence & Realization Routing](3A-R10-pre-implementation-convergence-realization-routing.md)

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

3H-02 framework coverage audit adicionalmente classifica current Mastra primitives:

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
RequestContext is runtime/configuration/correlation substrate, never current Product authority
governed owner/tool/Gateway decisions recheck current Conexus owner truth after continuation
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

## 10. 3I — CLOSED / APPROVED

| ID | Decisão | Documento |
|---|---|---|
| 3I-01 | Current Authorization, Approver Eligibility & Revocation | [3I-01](3I-01-current-authorization-approver-eligibility-revocation.md) |
| 3I-02 | Credential & Capability Custody | [3I-02](3I-02-credential-capability-custody.md) |
| 3I-03 | Per-ActorRun / Per-AgentRun Model Spend Enforcement | [3I-03](3I-03-per-run-model-spend-enforcement.md) |
| 3I-04 | DEDICATED Trusted Exchange | [3I-04](3I-04-dedicated-trusted-exchange.md) |
| 3I-05 | Trust Zones, Crossings & `hub_control` Least Privilege | [3I-05](3I-05-trust-zones-crossings-hub-control-least-privilege.md) |
| 3I-R1 | Security / Authority Architecture Final Closure | [3I-R1](3I-R1-security-authority-architecture-final-closure.md) |

Ratificações pelo operador: **3I-01 / 3I-02 / 3I-03 / 3I-04 / 3I-05 / 3I-R1 — 2026-08-17**.

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
guest ActorRun model-provider / LLM-provider key = deleted from guest baseline
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
guest model-provider / LLM-provider key = DELETED
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

### 10.6 Final closure — 3I-R1

O bounded independent closure review encontrou:

```text
Material Finding against approved authority = NONE
missing material 3I decision                 = 0
unrouted material security blocker           = 0
3I-06                                        = NOT JUSTIFIED
reopen                                       = NONE
verdict                                      = CLOSE 3I
```

Uma única ambiguidade de composição foi incorporada sem reabrir 3I-01/3I-05:

```text
3I-01 current-authority serialization
+
3I-05 owner-scoped persistence / no cross-owner schema authority
→ devem ser provadas simultaneamente na mesma realization
→ stale authority cannot commit after concurrent revoke/narrow
→ consuming owner não ganha broad iam SQL / umbrella role para realizar o guard
```

Exact conflict/serialization primitive pertence ao post-C-018 Realization Planning. A necessidade de broad cross-owner privilege, new durable authority state ou new authorization owner para realizar essa propriedade é reopen trigger material.

Fechamento:

```text
3I = CLOSED / APPROVED
3I-01..3I-05 = APPROVED
3I-R1 = APPROVED / CLOSED
remaining material 3I decision = 0
prior phase reopen = NONE
new Hub module = 0
new durable security record = 0
new security DB/schema/service/engine = 0
```

Review provenance, non-authoritative:

- `3I-FABLE-DIALOGUE-final-security-authority-closure.md`.

---

## 11. 3J — CLOSED / APPROVED

| ID | Decisão | Documento |
|---|---|---|
| 3J-01 | First Production Topology, Placement & Ingress | [3J-01](3J-01-first-production-topology-placement-ingress.md) |
| 3J-02 | Operational State, Backup & Restore Architecture | [3J-02](3J-02-operational-state-backup-restore-architecture.md) |
| 3J-03 | Platform Lifecycle, Secret Injection, Emergency Stop & Availability | [3J-03](3J-03-platform-lifecycle-secret-injection-emergency-stop-availability.md) |
| 3J-R1 | Deployment / Operations Architecture Final Closure | [3J-R1](3J-R1-deployment-operations-architecture-final-closure.md) |

Ratificações pelo operador: **3J-01 / 3J-02 / 3J-03 — 2026-08-17**; **3J-R1 — 2026-08-17**.

### 11.1 3J-01 — First production topology laws

```text
first production placement = existing company server / on-prem
production execution class = one dedicated Linux VM/guest
Hub application process baseline = one
Postgres/Mastra/Blob/CredentialBackend = co-located same VM/failure domain
public ingress = 0; private ingress = company LAN/VPN + HTTPS
bounded amendment = C-015 §5 + C-016 §6 exposure realization only
Sankhya topology authority = 0 — remains Connector/Connection/Gateway under C-007
extra MANAGED deployment unit = 0
E2B: no generic/public Hub inbound surface; transport truth = 3L
```

**Escopo:** 3J-01 é **installation-scoped** — primeira topologia de produção da instalação corrente, não deployment law universal do produto. **C-001 permanece a product vision authority.**

### 11.2 3J-02 — Operational state / backup / restore laws

```text
backup model = class-based recovery set, não checklist de arquivos
REQUIRED: hub_control · production Project DBs · mastra_par ·
          non-reconstructible digest bytes · CredentialBackend ciphertext
          backing · canonical Git off-provider bundle · recovery manifests
mastra_builder / ephemeral / reconstructible = NOT REQUIRED BY DEFAULT
off-host generation immutable contra credenciais residentes no host
non-regenerable recovery material = independent path REQUIRED
reissuable operational credentials em backup = FORBIDDEN by default
pre-production complete restore proof = REQUIRED; periodic proof = REQUIRED
RPO <= 6h / RTO <= 8h; sem PITR/replication/second provider/backup platform
cross-store atomic snapshot = REJECT
```

3J-02 protege a plataforma Conexus e seus Projects; Metal Nobre é somente first-deployment evidence e nenhum ERP/integration vira backup truth model. **C-001 permanece a product vision authority.**

### 11.3 3J-03 — Platform lifecycle / secrets / stop / availability laws

```text
one Hub application process + bounded backup/migration operational job
  contexts; backup/migrator/admin credentials fora do Hub runtime
secrets owner-scoped, injetados só no consumer que os usa; missing secret
  = capability fail-closed, sem fallback; root/KEK ausente = incident class
hub_control indisponível/incompatível = whole Hub NOT READY, sem
  cached/latest fallback; degradation capability-local quando seguro
restart supervisionado reconstrói de durable authority; settlement = 3M
platform deploy != Project Promotion; uma única target revision identity;
  pre-migration verified checkpoint; post-deploy proof antes de reabrir;
  rollback só com schema/config comprovadamente compatíveis
whole-Hub emergency stop out-of-band derrota TODA camada de auto-start
  (supervisor, VM autostart, host power-on) até release explícito
sem HA/zero-downtime/orchestrator/PlatformDeployment/EmergencyStop record
```

`3J-04 = NOT JUSTIFIED` — ownership 3A-R6 §7 completo em 3J-01/02/03; dois defers de 3A-R6 (DEDICATED physical; old-PAR drain) preservados com triggers. **C-001 permanece product vision authority.**

### 11.4 Final closure — 3J-R1

O bounded independent closure review encontrou:

```text
Material Finding against 3J-01/02/03            = NONE
missing material 3J decision                     = 0
3J-04                                            = NOT JUSTIFIED
unrouted material deployment/operations blocker  = 0
prior phase reopen                               = NONE
C-001 product guardrail preserved                = YES — installation-scoped
Metal Nobre / Sankhya                            = first-deployment evidence /
                                                   ordinary integration only
DEDICATED physical + old-PAR drain               = still DEFER SAFELY with triggers
3L/3M/3K/Realization boundaries preserved        = YES
new module/record/engine required by closure     = 0
verdict                                          = CLOSE 3J
```

Conteúdo ratificado do closure:

1. **Pre-production gate family** consolidada por citação, sem nova obrigação: complete restore proof (3J-02) + whole-Hub emergency-stop drill (3I-01 §13 / 3J-03) — ambas exigidas antes de produção por authority já aprovada.
2. **Única amendment de prior authority em 3J** confirmada bounded: C-015 §5 + C-016 §6 exposure realization, registrada em 3J-01; não reabre mais nada.
3. **3A-R6 §7 coverage snapshot no fechamento** (binding):

```text
first Hub deployment shape / single-host+split trigger / monolith placement
PG / hub_control / Project DB / Mastra store placement / E2B connectivity
MANAGED serving / TLS-ingress                                    → 3J-01
backup ownership + required set + restore-proof responsibility   → 3J-02
secret injection/custody / startup-shutdown-restart / deploy
sequence / whole-Hub emergency stop / minimum availability set   → 3J-03
host-loss/restart honesty → 3J-01 failure domain / 3J-02 RPO-RTO / 3J-03 procedure
```

4. Defers/rejects preservados por citação; `3J-04 = NOT JUSTIFIED`.
5. **3J fecha installation-scoped**: contrato de operações da primeira instalação; C-001 product vision authority intacta; Metal Nobre/Sankhya são first-deployment evidence/integração ordinária apenas.

Review provenance, não-autoritativa:

- `3J-FABLE-DIALOGUE-intake-decomposition.md`;
- `3J-FABLE-DIALOGUE-first-production-topology-placement-ingress.md`;
- `3J-FABLE-DIALOGUE-operational-state-backup-restore.md`;
- `3J-FABLE-DIALOGUE-platform-lifecycle-secrets-stop-availability.md`;
- `3J-FABLE-DIALOGUE-final-deployment-operations-closure.md`.

---

## 12. Open findings / routed work after 3I-R1

Estes itens não reabrem fases anteriores automaticamente. 3A-R6 + 3A-R10 classificam quando cada item volta ao critical path.

| Finding / questão | Owner posterior |
|---|---|
| F3B-R1 — repo canônico/cutover do produto | **3A / operador — MUST DECIDE antes do post-C-018 Realization Planning Gate** |
| F3B-R4 — browser/runtime physical trust zones | **trust semantics RESOLVED by 3I-05**; physical placement/ingress → 3J according to first-production/first-consumer rules |
| Builder runtime orphan/lost detection policy after 3H-01 liveness surface | 3M structural recovery sweep |
| Production Agent admitted-but-undispatched / active-process-loss / missing-snapshot recovery policy | 3M structural recovery sweep |
| InceptionInvestigation pre-Change agent execution shape, somente se realization futura provar necessidade | Decision Loop / DEFER SAFELY |
| F3E01-R1 — `mastra_par` backup/restore procedure | **RESOLVED by 3J-02** (required recovery set + restore proof); procedure detail → Realization |
| F3E01-R2 — `hub_control` rebuild 0..N em DB temporário | implementation verification |
| F3E02-R1 — Mastra `workflowDefinitions` never authoring authority | 3L probe / implementation enforcement under 3H-02 |
| CredentialBackend exact encrypted backing primitive/path + host root-key custody | 3I-02 law closed; implementation/3J; no new record/schema/database silently |
| guest telemetry capability pause/resume expiry/scope transport proof | implementation/3L under 3I-02/3I-05 |
| orphan encrypted backing cleanup/repair if selected realization can produce it | 3M/3J/implementation under 3I-02 |
| Builder/PAR model-call pre-provider interception + retry/fallback neutralization | 3L/implementation under 3I-03 — MUST QUALIFY |
| provider usage extraction preserving MISSING != ZERO | 3L under 3I-03 — MUST QUALIFY |
| provider/model/request qualified cost-envelope proof | 3L under 3I-03 — MUST QUALIFY |
| model-bearing optional feature sweep for hidden billable calls | 3L under 3I-03; current baseline features budgeted-or-disabled |
| Builder long-context / Observational Memory ON×OFF evaluation | **3L Package A — `CX-BUILDER-COGNITION-01` MUST EVALUATE; enablement only on deciding evidence** |
| model-call reservation inclusion in C-013 owner-local admission coherence proof | 3N under 3I-03 + 3H-R1 |
| Product Agent browser/workspace/code execution trust/egress if first consumer enables it | **3K-04 confirms REJECT/DEFER by default; Decision Loop / 3I-05 / 3L on first named consumer** |
| whole-Hub emergency stop physical procedure / fail-closed ingress-process stop | **RESOLVED by 3J-03**; pre-production drill permanece gate (3I-01/3J-03/3J-R1) |
| post-whole-Hub-stop settlement/recovery | 3M structural recovery sweep |
| selective per-Project serving stop | Decision Loop only if real incident proves owner-local controls + whole-Hub stop unacceptable; likely owner seam = Release/MAR serving-admission owner |
| DEDICATED trust/authentication semantics | **RESOLVED by 3I-04**; exact libraries/TTL/claim spelling → 3L/Realization Planning |
| DEDICATED egress/network trust semantics | **RESOLVED by 3I-05 + 3I-04**; physical DEDICATED deployment → DEFER SAFELY to 3J until first real deployment |
| MANAGED/DEDICATED physical deployment topology | **MANAGED first-production topology RESOLVED by 3J-01**; DEDICATED physical topology DEFER SAFELY until first real DEDICATED deployment |
| DEDICATED private-key provisioning / Hub token-signing deployment | 3J only when physical realization is current; owner/custody semantics fixed by 3I-04 |
| DPoP / mTLS sender constraint | DEFER SAFELY / Decision Loop on 3I-04 reopen trigger |
| USER_DELEGATED / federation | Decision Loop on named DEDICATED consumer |
| fleet/per-install credential / per-Release credential / binary attestation | REJECT F1 / Decision Loop on real install-base/security requirement |
| `hub_control` PostgreSQL role/isolation properties | **RESOLVED by 3I-05 at property level**; exact LOGIN/role/GRANT/pool spelling → Realization Planning |
| `hub_control` owner-capability negative privilege matrix | Realization Planning + 3N/3O proof under 3I-05 |
| current-authority serialization × owner-isolation combined proof (3I-R1 CR-1) | **Realization Planning + 3N/3O**; broad cross-owner privilege/new authority state requirement → Decision Loop |
| cross-owner transaction profiles / audit append mechanism | Realization Planning under closed 3E/3I-05 properties; third case → Decision Loop |
| Builder/PAR physical process split only if `CX-RUNTIME-ISOLATION-01` fires | 3L qualification-triggered; one-process baseline fixado por 3J-01 |
| old Production Agent Runtime coexistence / drain / cutover | **DEFER SAFELY — trigger: first runtime-affecting upgrade after production / 3J** |
| `mastra_par` snapshot/thread schema upgrade compatibility operations | 3J/3L; upgrade operation detail deferred until first relevant upgrade |
| physical Promotion/migration recovery and restore | 3M structural semantics + 3J material operation boundary |
| `OUTCOME_UNKNOWN` reconciliation / settlement | 3M structural recovery sweep |
| output/storage custody repair + orphan recovery | 3M; only structural state requirement blocks C-018 |
| repeated Builder quiescence/reconnect failure policy | 3M; detailed operational refinement may DEFER SAFELY |
| Project purge/retention/GC | 3M/3J — DEFER SAFELY absent first-launch retention requirement |
| archive/unpublish/trigger/recovery UX | first vertical did not require it; **DEFER SAFELY**; reopen 3K only on material named consumer |
| Release/Promotion/rollback UI | 3K journey/truth laws RESOLVED by 3K-01/3K-02/3K-R1; detailed component spelling → Realization Planning |
| approval-card/display contracts | 3K product law RESOLVED by 3K-02/3K-R1 over 3F-03; exact component realization → implementation |
| Project binding Control Plane UI | **RESOLVED at product-architecture level by 3K-01/3K-03/3K-R1**; exact forms/DTOs → Realization Planning |
| Product Agent authoring/management/use + Conversation/memory/trigger product UI | **RESOLVED by 3K-04 + 3K-R1**; exact transport/components and gated feature realization → Realization/3L as applicable |
| exact wire/HTTP layout | post-C-018 Realization Planning + contract tests; 3L only if technology behavior is load-bearing |
| exact `MANIFEST_INVALID` diagnostics | Realization Planning/implementation + 3K truth laws where user-observable |
| authored Project binding source/file schema + exact mutation DTOs | post-C-018 Realization Planning + implementation |
| exact `brn.binding_validation` ref if proof shows it load-bearing | Decision Loop / 3N |
| exact security-sensitive mutation serialization spelling (`FOR UPDATE`/SERIALIZABLE/guard/equivalent) | **3I-R1 property closed**; exact realization → Realization Planning/implementation verification; 3L only if pinned behavior becomes load-bearing |
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
| Product Agent Semantic Recall / Observational Memory / Memory Extractors enablement | DEFER SAFELY / named Product consumer + 3L eval; 3K-04 exposes only admitted regimes |
| Durable Agent enablement and its process-global registry | Decision Loop + 3L on named consumer |
| Observational Memory process-global `activeOps` if enabled in Builder | **3L under `CX-BUILDER-COGNITION-01` + `CX-RUNTIME-ISOLATION-01`** |
| Skills / Goals / Background Tasks Product enablement | implementation/Decision Loop when load-bearing; never independent authority; 3K-04 keeps them out of baseline F1 authoring |
| Rubric Scorers / Datasets / Experiments / Gates & Verdicts | 3L/3N as evidence tooling, not acceptance authority |
| Mastra Platform managed environments/workspaces/databases/regions | DEFER SAFELY optional deployment qualification |
| `job/v1` / deterministic sync dispatch | **RESOLVED by [3A-R9](3A-R9-managed-job-deterministic-sync-dispatch-reconciliation.md) for first vertical; `CX-MANAGED-JOB-01` → 3L; future background-work classes re-enter Decision Loop on named consumer** |
| async/attempt status projection for UI/query convenience | 3K-02 truth law closed; exact projection realization → Realization Planning; never second authority |
| pools/failover/shared resources | Decision Loop on real consumer |
| Product multi-agent/subagents/Agent Network | Decision Loop on real consumer; 3K-04 keeps them out of F1 Agent Builder baseline |
| EVENT / Signals / Notification Inbox / Webhook Signals | C-007 / Decision Loop on first EVENT consumer; 3K-04 does not expose unsupported EVENT controls |
| break-glass binding/runtime override | Decision Loop on real incident failure class |
| app-origin approvals / second approval consumer | Decision Loop on real consumer |
| duplicate Gateway approval-subject custody | Decision Loop / 3J on real availability split |
| DEDICATED browser-direct Platform-Service authority | Decision Loop on named consumer |
| DEDICATED durable credential/grant record | REJECT F1; Decision Loop only if one-current-Project-credential lifecycle proves insufficient |
| DEDICATED Release retirement/support lifecycle | Decision Loop when real install base requires |
| DEDICATED multi-install/fleet management | REJECT F1 / Decision Loop on real install base |

Technology qualification critical path after 3A-R10:

```text
Package A — Builder Substrate + Cognition
  CX-SBX-E2B-01
  CX-BUILDER-MASTRA-01
  CX-BUILDER-COGNITION-01

Package B — Product Agent + Cross-Runtime
  CX-AGENT-MASTRA-01
  CX-RUNTIME-ISOLATION-01

Package C — DEFER SAFELY / NO F1 EXECUTION
  finite model-call/step limits and truthful usage/cost missingness remain F1 obligations
  hard per-run monetary reservation/cost-envelope machinery deferred until a named trigger

Package D — Managed Execution
  CX-MANAGED-JOB-01

Package E — Deciding Evidence
  Verification Observability deciding-evidence subset
```

**Q0 Qualification Manifest = APPROVED / COMPLETE.** Exact Package admission still freezes the resolved lock digest, model/provider identities and live E2B/provider facts for the execution being judged. Historical probe criteria are compiled against current authority first. 3L proves substrate behavior; material failure reopens substrate/realization first, not domain semantics automatically.

---

## 13. Resolved routed work through 3I-R1

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
RequestContext non-authority + current-owner recheck boundary  → 3H-03; amended by 3L-R1
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
guest ActorRun model-provider / LLM-provider key deletion        → 3I-02
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
business/application external execution remains Gateway-owned    → 3I-05
platform-control egress uses only named owner-specific adapters  → 3I-05
privileged egress destination anti-injection law                 → 3I-05
telemetry transport cannot elevate producer_trust                 → 3I-05
OTel baggage excludes authority/secrets/owner IDs by default     → 3I-05
hub_control owner-scoped normal persistence capability           → 3I-05
ordinary broad/SET-able umbrella DB login rejected               → 3I-05
two narrow cross-owner atomic transaction capability classes     → 3I-05
audit-required narrow append-only OBS path                        → 3I-05
hub_control/Mastra/Project DB credential isolation                → 3I-05
current-authority serialization × owner isolation composition     → 3I-R1
3I global security/authority coherence + completeness             → 3I-R1
```

---

## 14. Anti-overengineering guardrail

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
NO second Agent authoring database / AgentBuilderModule / AgentBuilderRuntime
NO Workspace-owned Product Agent fleet/runtime authority
NO UniversalTool domain competing with Capability/Integration owners
NO generic execute(anySlug) exposed to Product Agent
NO hidden capability/permission/effect creation while authoring Agent
NO Product Agent repo/source/shell/filesystem/browser power by default
NO mandatory universal chat widget in every app
NO unsupported EVENT/memory/multi-agent feature merely because Mastra supports it
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
NO ArchitectureEngine / ArchitectureService / ArchitectureDecision domain/table
NO Baseline FSM / readiness score / universal architecture checklist
NO big-design-up-front requirement merely because Project Baseline exists
NO JobModule / SchedulerModule / AutomationModule for first sync consumer
NO JobSchedule authority table / generic schedule DSL
NO arbitrary Project-authored privileged job code inside Hub
NO per-tick sync backlog / replay of every missed interval
NO product implementation before C-018 + accepted post-C-018 Realization Planning
NO Realization Planning as second architecture authority/readiness framework
```

Expansion returns only through Decision Loop with named current consumer/failure class.

---

## 15. Regra de avanço

```text
3A = CONTINUOUS until C-018
3A-R6 = APPROVED
3A-R7 = APPROVED
3A-R8 = APPROVED
3A-R9 = APPROVED
3A-R10 = APPROVED
3A-R11 = CLOSED / APPROVED / OPERATOR RATIFIED
R11-G = COMPLETE / BOUNDED CORRECTION REQUIRED
FBL-01..17 = ADJUDICATED / CORRECT_PROJECTION
closure-keyed pass = FOUND R3C-01..08
Round-3.1 projection correction = APPLIED / VERIFIED
final GPT authority review = COMPLETE / PASS
R11-H = APPROVED / 2026-08-18

3B = CLOSED / APPROVED
3C = CLOSED / APPROVED
3D = CLOSED / APPROVED
3E = CLOSED / APPROVED
3F = CLOSED / APPROVED
3G = CLOSED / APPROVED
3H = CLOSED / APPROVED
3I = CLOSED / APPROVED

3I-01 = APPROVED
3I-02 = APPROVED
3I-03 = APPROVED
3I-04 = APPROVED
3I-05 = APPROVED
3I-06 = NOT JUSTIFIED
3I-R1 = APPROVED / CLOSED

3J = CLOSED / APPROVED
3J-01 = APPROVED
3J-02 = APPROVED
3J-03 = APPROVED
3J-04 = NOT JUSTIFIED
3J-R1 = APPROVED / CLOSED

pre-3K Global Platform Coherence Checkpoint = CLOSED / POSITIVE
CURRENT STRUCTURE CONFIRMED
F-GPC-01 / AGT-4 = RESOLVED por 3A-R7
C-003 F1 orphan requirements = 0
reopen 3B–3J = NONE

3K = CLOSED / APPROVED
3K-01 = APPROVED
3K-02 = APPROVED
3K-03 = APPROVED
3K-04 = APPROVED
3K-R1 = APPROVED / CLOSED
F3K-IC-01 Product Agent authoring/management/use = RESOLVED BY 3K-04
3K internal closure Material Finding = 0
3K final independent Fable Material Finding = 0
3K final Fable verdict = CURRENT STRUCTURE CONFIRMED WITH NON-MATERIAL CORRECTIONS
3K non-material corrections = 5 / ADJUDICATED BY 3K-R1

job/v1 / deterministic sync dispatch = RESOLVED BY 3A-R9
CX-MANAGED-JOB-01 = MUST QUALIFY in 3L
CX-BUILDER-COGNITION-01 = MUST EVALUATE in 3L / NOT MUST ENABLE

3L = IN PROGRESS / Q0 COMPLETE
3L-Q0 = APPROVED / COMPLETE
Package A = COMPLETE / A1 PASS / A2 PASS WITH REQUIRED PHYSICAL-INCARNATION GUARD / A3 EVALUATED — KEEP OM OFF
Package B = CLOSED / LEAD-ADJUDICATED / QUALIFIED FOR CURRENT F1 TESTED PROPERTIES / BT-1 PASS / BT-2 PASS / BT-3 FRAMEWORK BEHAVIOR CHARACTERIZED / BT-3A COMPLETE — NATIVE SCHEMA HYPOTHESIS REJECTED / BT-3N PASS — LEAD-ADJUDICATED — PASS_NATIVE_HITL_OWNER_BOUNDARY / BT-4N PASS — LEAD-ADJUDICATED — PASS_NATIVE_SCHEDULE_INGRESS / BT-5N PASS — LEAD-ADJUDICATED — QUALIFIED_SAME_PROCESS
Package C = DEFER SAFELY / NO F1 EXECUTION
Packages D/E = NOT EXECUTED / REQUIRE PROPORTIONAL REDERIVATION
CX-AGENT-MASTRA-01 = QUALIFIED FOR CURRENT F1 TESTED PROPERTIES
CX-RUNTIME-ISOLATION-01 = QUALIFIED_SAME_PROCESS FOR ENABLED F1 SURFACES
product implementation = BLOCKED
prior architecture reopen = NONE
```

3A-R6 foi ratificada em **2026-08-17** após independent Fable challenge com `CURRENT STRUCTURE CONFIRMED`, `Material Finding = NONE`, `method amendment = NONE`; congela a classificação `MUST DECIDE | DEFER SAFELY | REJECT F1`, promove F3B-R1 a blocker antes do Realization Planning, torna `job/v1` conditional blocker se o first vertical precisar mirror/sync, demove DEDICATED physical topology e old-runtime drain para triggered defers, ancora 3K em C-001 caso 1 salvo redirect e estabelece que C-018 fecha architecture mas não autoriza product code.

3H-R1 foi ratificada em **2026-08-17** após closure review adversarial com `Material Finding = NONE`, `missing material 3H decision = NONE`, `3H-04 = NOT JUSTIFIED` e três correções não-materiais de routing/proof visibility incorporadas.

3I-01 foi ratificada em **2026-08-17** após independent Fable challenge com `CURRENT STRUCTURE CONFIRMED`, incorporando atomicity contra concurrent revocation, durable re-entry current-authority law, exact approver eligibility, post-approval expiry+cancel/close composition, owner-committed-state vs raw-observation split e emergency-stop deletion test.

3I-02 foi ratificada em **2026-08-17** após dois rounds adversariais de custody com `CURRENT STRUCTURE CONFIRMED`, `Material Finding = NONE`, storage tension de 3E resolvida sem novo domain record/schema/database, durable-before-visible cross-store publication, transient-token memory-only YAGNI baseline, crash-safe rekey/recovery e guest-capability closure.

3I-03 foi ratificada em **2026-08-17** após independent Fable challenge com `CURRENT STRUCTURE CONFIRMED`, `Material Finding = NONE`, owner-local ActorRun/AgentRun spend authority, one-outstanding liability, conservative unknown settlement, retry/fallback escape closure, qualified missingness-preserving usage settlement e cost-envelope honesty; a otimização `NOT_SENT` foi deliberadamente deferred por YAGNI.

3I-04 foi ratificada em **2026-08-17** após independent Fable challenge com `CURRENT STRUCTURE CONFIRMED`, `Material Finding = NONE`; congela Project-owned one-current asymmetric DEDICATED credential, `private_key_jwt`, signed exact ReleaseRef binding, short-lived bearer access token, per-request current credential-generation/narrowing recheck e SERVICE_SCOPED-only F1, enquanto DPoP/mTLS/fleet/per-Release credential/binary attestation permanecem triggered defers/rejects.

3I-05 foi ratificada em **2026-08-17** após independent Fable challenge com `CURRENT STRUCTURE CONFIRMED`, `Material Finding = NONE`; fecha trust-zone/crossing semantics, separa business egress de platform-control owner egress com anti-injection de destination authority, mantém producer trust não elevável por transport e torna `hub_control` ownership fisicamente enforçável por owner-scoped DB capabilities + somente duas narrow cross-owner transaction cases, sem novo module/record/database/process/security engine.

3I-R1 foi ratificada em **2026-08-17** após bounded independent closure review com `Material Finding = NONE`, `missing material 3I decision = 0`, `3I-06 = NOT JUSTIFIED`, `reopen = NONE` e `CLOSE 3I`. O closure tornou explícita uma única composição: current-authority serialization de 3I-01 deve ser realizada e provada junto do owner-isolation de 3I-05, sem broad IAM SQL/umbrella role; exact conflict primitive permanece derived Realization Planning.

3J-01 foi ratificada em **2026-08-17** após independent Fable challenge com `ACCEPT CANDIDATE`; congela first production on-prem (company server → dedicated Linux VM), one Hub process, stores co-located no mesmo failure domain, private ingress company LAN/VPN + HTTPS com bounded amendment de C-015 §5 + C-016 §6 (exposure realization only), zero public ingress, Sankhya sem topology authority e E2B sem generic/public inbound. **Installation-scoped**: primeira topologia da instalação corrente, não deployment law universal do produto; **C-001 permanece product vision authority**.

3J-02 foi ratificada em **2026-08-17** após independent Fable challenge com `ACCEPT CANDIDATE`; congela recovery set class-based (`hub_control`, production Project DBs, `mastra_par`, non-reconstructible digest bytes, CredentialBackend backing, Git bundle off-provider, recovery manifests), `mastra_builder` fora por default, off-host immutability contra host-credential compromise, independent path para recovery material não-regenerável, proibição de credenciais operacionais reemitíveis em backup, pre-production complete restore proof, `RPO <= 6h / RTO <= 8h` e rejeição de PITR/replication/second provider/backup platform. **C-001 permanece product vision authority.**

3J-03 foi ratificada em **2026-08-17** após independent Fable challenge com `ACCEPT CANDIDATE`; congela one Hub process + bounded operational job contexts, exclusão de backup/migrator/admin credentials do runtime, secrets owner-scoped fail-closed, `hub_control down => NOT READY`, restart supervisionado de durable authority, platform deploy com single target revision identity e checkpoint/proof fail-closed, emergency stop out-of-band derrotando toda camada de auto-start, e capability-local degradation sem availability orchestrator. `3J-04 = NOT JUSTIFIED`. **C-001 permanece product vision authority.**

3J-R1 foi ratificada em **2026-08-17** após bounded independent closure review com `Material Finding = NONE`, `missing material 3J decision = 0`, `3J-04 = NOT JUSTIFIED`, `unrouted material deployment/operations blocker = 0`, `prior phase reopen = NONE` e `CLOSE 3J`; consolida a pre-production gate family por citação (complete restore proof 3J-02 + whole-Hub emergency-stop drill 3I-01 §13/3J-03), confirma a única prior-authority amendment de 3J (C-015 §5 + C-016 §6 exposure realization, registrada em 3J-01) como bounded, congela o 3A-R6 §7 coverage snapshot em [3J-R1](3J-R1-deployment-operations-architecture-final-closure.md) e fecha 3J **installation-scoped**, com **C-001 preservada como product vision authority**.

O pre-3K Global Platform Coherence Checkpoint foi executado e fechou **POSITIVE em 2026-08-17** com `CURRENT STRUCTURE CONFIRMED`: único finding material `F-GPC-01 / AGT-4` resolvido por 3A-R7, `C-003 F1 orphan requirements = 0`, `reopen 3B–3J = NONE`. 3A-R7 foi ratificada em **2026-08-17** como bounded gap-fill: Platform Consultant = Builder-owned / Control-Plane-presented assistance capability, platform knowledge publicado/digest-pinned sob a pack discipline (nunca Workspace Brain content), contexto tenant derivado server-side, zero novo module/principal/global agent artifact/hidden tenant/cross-Workspace authority; surface concreta → 3K; platform agent global persistente → Decision Loop. **C-001 permanece product vision authority.**

3A-R8 foi ratificada pelo operador em **2026-08-18** após coherence sweep interno e pesquisa externa adversarial. `CURRENT STRUCTURE CONFIRMED + BOUNDED CORRECTION APPROVED`: Project Baseline permanece Project-owned e passa a ser explicitamente `spec-anchored / living / incremental`; sua suficiência é proporcional ao Change atual; todo Change pina a Baseline aprovada exata; decisão material requerida pelo Change não pode ser delegada silenciosamente ao coding actor; late architecture discovery retorna por Finding/Replan/Handoff antes de atravessar a boundary; `ProjectBaselineDigest` participa explicitamente da execution/proof identity; big-design-up-front, ArchitectureEngine, novo record/DB/workflow e global invalidation por qualquer mudança de digest são rejeitados. Nenhuma prior phase foi estruturalmente reaberta e implementação permanece bloqueada.

3A-R9 foi ratificada pelo operador em **2026-08-18** após 3K-03 disparar o primeiro consumidor real de mirror/sync. `CURRENT STRUCTURE CONFIRMED + BOUNDED CORRECTION APPROVED`: `job/v1` permanece artifact Project-scoped e MAR-owned no runtime; primeira realization = governed sync capability-driven; `MANAGED_JOB` vira surface explícita do Gateway; schedule é derivado da exact active served Release; `mar.job_run` permanece record suficiente; fixed interval/manual, single-flight/coalesce e one-catch-up fecham o primeiro consumer; arbitrary privileged Project job code, Workflow/Automation/Scheduler domain e generic calendar DSL são rejeitados F1; `CX-MANAGED-JOB-01` entra no 3L. Nenhuma prior phase foi estruturalmente reaberta e implementação permanece bloqueada.

3A-R10 foi ratificada pelo operador em **2026-08-18** como checkpoint bounded de convergência antes de 3L. `CURRENT STRUCTURE CONFIRMED + BOUNDED ROUTING CORRECTION`: compila supersessões de realization sem apagar invariantes históricos; congela `technology selected != technology qualified`; proíbe executar probe histórico literalmente quando authority posterior mudou o mechanism; promove Builder long-context/Observational Memory para `CX-BUILDER-COGNITION-01 MUST EVALUATE / NOT MUST ENABLE`; preserva Product Agent OM/Semantic Recall/Extractors consumer-gated; organiza 3L em Packages A–E com Q0 exact-version Qualification Manifest; preserva mandatory downstream first-build probes sem trazê-los para 3L; e explicita o post-C-018 Implementation Realization Planning Gate como derived-only. Nenhuma prior phase foi estruturalmente reaberta e implementação permanece bloqueada.

3L-Q0 foi ratificada pelo operador em **2026-08-18** como manifesto de admissão/reprodutibilidade da Technology Qualification. `Q0 = APPROVED / COMPLETE`: fixa a qualification stack/candidate identities, supply-chain gates, historical-probe compilation, model/provider pin law, E2B live-run identity requirements, pg-boss incumbent candidate e ordem serial `A → B → C → D → E`; não instala dependências, não implementa harness de probe e não executa Package A. Durante Package A, antes de qualquer A3 model-bearing call, o operador aprovou uma latest-stable reconciliation: `core 1.56.0 / memory 1.25.0 / pg 1.19.0 / e2b 0.8.0 / code-sdk 1.1.2`, lock `7f61c6c7…`; A1 6/6, adapter 3/3, incarnation guard 5/5 e A3 contracts 15/15 passaram no novo lock, sem rerodar provider-live surfaces cujo E2B SDK `2.40.0` e release behavior relevante não mudaram. O smoke OAuth admitiu os exatos `gpt-5.6-sol` e `gpt-5.6-luna`; `A0 → A1 → B0 → B1` executou exatamente uma vez no run `32183868645`. A1 respondeu corretamente, mas falhou a admissão por `OM_DID_NOT_FIRE`; B1 preservou correção com menos Actor tokens, porém latência materialmente maior e usage de Observer/Reflector `MISSING`. Assim, `CX-BUILDER-COGNITION-01 = EVALUATED / NOT_PROVEN FOR ENABLEMENT / KEEP OM OFF`. Package A fechou `COMPLETE`, sem Finding material ou reopen arquitetural. `3L = IN PROGRESS`; implementação permanece bloqueada.

3A-R11 foi ativada e ratificada pelo operador em **2026-08-18** como Whole-Product Authority Rebaseline. O independent Fable review e sua adjudicação classificaram `FBL-01..17` como `CORRECT_PROJECTION`; o closure-keyed pass encontrou `R3C-01..08`; a correção bounded Round-3.1 foi aplicada e a final GPT authority review fechou `PASS`. O operador ratificou os blobs exatos do current tree: `R11 = CLOSED / ACCEPTED`, `Package B = NEXT / NOT STARTED`, sem reabrir arquitetura, adicionar requirement de produto ou autorizar implementação.

3K-01 foi ratificada pelo operador em **2026-08-17** e abriu formalmente 3K. Congela Workspace shell ≠ Project shell; Project-scoped navigation; Build agent-first com Preview como work surface dominante e Conexus contextual/retrátil; Data/Capabilities/Integrations/Agents/Brain/Versions/Activity diretamente inspecionáveis; Code/Diff como Build lenses; machinery interna apenas progressive detail; `Product`/`Resources` artificiais rejeitados; exact visual/component/streaming realization deferred. Nenhuma prior authority foi reaberta e implementação permanece bloqueada.

3K-02 foi ratificada pelo operador em **2026-08-17**. Congela context-local truth + progressive Evidence; UI como projection, nunca authority; separation entre observed/verified, empty/loading/failed/partial, AgentRun/effect outcome e completion ladder até SERVED_VERIFIED; exact ApprovalRequest presentation, context-local Change/Effect/Publish/Access decisions, permission/dependency widening never-hide, cost missingness, known limitations e Activity causal; `Trust Center`, universal status/approval, truth score e generic retry over uncertainty rejeitados. Nenhuma prior authority foi reaberta e implementação permanece bloqueada.

3K-03 foi ratificada pelo operador em **2026-08-18**. Congela que Conexus não possui default universal `live|mirror|hybrid`; Connector declara source capabilities e Project Baseline decide o data path do slice. Para o caso 1, aprova read-only analytics com Project analytical read model derivado, sync governado, live Gateway reads como source anchor para Discovery/qualification/reconciliation/verification/Evidence, registered read-only queries para a UI, Brain semantic binding, zero Product Agent/WRITE/business effect e separação entre historical Golden benchmark e current operational truth. O trigger `job/v1` previsto por 3A-R6/C-007 foi disparado e está **RESOLVED por 3A-R9**. Sankhya permanece first-vertical evidence, nunca product-wide topology/ERP law.

3K-04 foi ratificada pelo operador em **2026-08-18** após pesquisa externa + decomposição adversarial do finding `F3K-IC-01`. Product Agents permanecem Project-owned/git-first/Release-pinned sob canonical `agent/v1`; Agent Builder = specialized Builder experience, nunca segundo module/DB/authority; structured/manual + natural-language authoring convergem para a mesma Change/candidate; missing Capabilities podem ser propostas apenas como expansão explícita da Change; runtime tools continuam compiled `ToolProjection` sobre owners existentes, sem UniversalTool; Workspace ganha `Agents` como access-filtered cross-Project catalog/projection sem Agent fleet ownership; Builder é source-aware, Product Agent é product/context-aware e não recebe repo/source/shell/filesystem/browser por default; interactive/headless permanecem o mesmo Product Agent concept; Mastra Editor/Stored Agent nunca substitui Registry/Release authority. `F3K-IC-01 = RESOLVED`, `new module/record/DB = 0`.

O **3K internal closure completeness/deletion check** foi executado após 3K-04. Resultado:

```text
Workspace / Project selection + creation                    → COVERED 3K-01
Inception / Project Baseline                                → COVERED 3K-01 + 3A-R8
Change / correctness / progress                             → COVERED 3K-01 + 3K-02
Finding / Evidence / verifier feedback                      → COVERED 3K-02
human decision families                                     → COVERED 3K-02
Connections administration/use/qualification journey        → COVERED 3K-01 + 3K-03
Brain binding/use                                            → COVERED 3K-01 + 3K-03
Preview / review                                             → COVERED 3K-01 + 3K-02
Release / Promotion / rollback                              → COVERED 3K-01 + 3K-02
Production Agent definition/use                             → COVERED 3K-04
MANAGED application access/serving                          → COVERED 3K-01 + 3K-02
runtime/operational timeline                                → COVERED 3K-01 + 3K-02
permissions/access-management                               → COVERED 3K-01 + 3K-02 + C-015
first vertical / data path                                  → COVERED 3K-03 + 3A-R9
CIC-4 Project duplication semantics                         → ALREADY CLOSED C-014; UI placement = Realization
Workspace Agents catalog dependency                         → direct read/public projection under 3D-03; no eighth L7 use case
Material Finding                                            = 0
prior structural phase reopen                               = NONE
new module / durable record / database from closure         = 0
verdict                                                     = INTERNALLY CONVERGED
```

O único independent final Fable challenge de 3K foi executado em **2026-08-18** e registrado como evidence não-autoritativa em `3K-FABLE-DIALOGUE-final-product-architecture-review.md`. Verdict: `CURRENT STRUCTURE CONFIRMED WITH NON-MATERIAL CORRECTIONS`, `Material findings = NONE`, `reopen 3B–3J = NONE`, `new module/record/database = 0`. As cinco correções não-materiais foram adjudicadas em [3K-R1](3K-R1-frontend-product-architecture-final-closure.md): três restaurações de links/wording do LEDGER + duas clarificações bounded de 3K-04 (Workspace Agent attention é discovery projection, nunca decision surface; structured Agent edit sem LLM continua no Change/work graph + C-014/C-017 commit matrix).

3K-R1 foi ratificada pelo operador em **2026-08-18** e fecha `3K — Frontend / Product Architecture` como **CLOSED / APPROVED**. `3K-01..3K-04 = APPROVED`; internal Material Finding = 0; final Fable Material Finding = 0; prior structural reopen = NONE; implementação continua bloqueada.

Próxima ação:

> **Package B is CLOSED / LEAD-ADJUDICATED / QUALIFIED FOR CURRENT F1 TESTED PROPERTIES. Package C remains DEFER SAFELY / NOT EXECUTED; Packages D/E remain NOT EXECUTED / REQUIRE PROPORTIONAL REDERIVATION. Do not execute them, Product implementation or C-018.**

3L–3O seguem integralmente sob 3A-R6 + 3A-R8 + 3A-R9 + 3A-R10 e o current tree ratificado por 3A-R11. F3B-R1 deve estar decidido antes do post-C-018 Realization Planning Gate. Product implementation permanece proibida até C-018 + F3B-R1 + accepted derived realization plan(s).

A Fase 3 completa continua em andamento até C-018. Nenhuma implementação de produto está autorizada por este ledger e PR #40 não deve ser mergeado sem autorização explícita do operador.
