# Fase 3 — Live Ledger

**Status geral:** EM ANDAMENTO  
**Estado:** `3B CLOSED` · `3C CLOSED` · `3D CLOSED / APROVADA` · `3E CLOSED / APROVADA` · `3F CLOSED / APROVADA / 3F-01 APROVADA / 3F-02 APROVADA / 3F-03 APROVADA / 3F-04 APROVADA / 3F-05 APROVADA / 3F-06 APROVADA / 3F-R1 APROVADA`  
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

3E-R1
→ fechamento/reconciliação final de 3E; inclui correção aritmética 44→46 sem mudança semântica

3F-01
→ classificação de contract surfaces, durable representations, version gaps e failure loci

3F-02
→ famílias semânticas de boundary/payload, public failure projection, retry/error mapping e state non-unification

3F-03
→ exact sealed approval subject, single-claim/recovery binding, monotonic stale e atomic Gateway↔PAR admission

3F-04
→ typed ProjectConnectionBinding/ProjectBrainBinding contracts, Git-first adoption, exact pins, CAS e UX-safe product surface

3F-05
→ public failure code semantics, baseline literals, closed details contracts e static code→locus projection

3F-06
→ DEDICATED server-to-platform exchange, application+Release authority context, Release-as-attestation e support horizon

3F-R1
→ fechamento/reconciliação final de Contracts & API Architecture; routing de realization e reopen triggers

este LEDGER
→ status/navigation authority
```

Nenhuma conversa é authority. Arquivos `*-FABLE-*` e `*-CHATGPT-*` são review inputs não-autoritativos; somente conteúdo ratificado em decisões aprovadas ganha authority.

---

## 2. Estado das fases

| Fase | Estado | Próxima ação |
|---|---|---|
| 3A — Architecture Reconciliation | CONTÍNUA até C-018 | aplicar findings materiais durante 3G–3O |
| 3B — System Context & Boundaries | **CLOSED / APROVADA** | reabrir apenas com Finding material |
| 3C — Domain / Module Architecture | **CLOSED / APROVADA** | reabrir apenas com Finding material |
| 3D — Dependency Architecture | **CLOSED / APROVADA** | [3D-R1](3D-R1-dependency-architecture-final-closure.md) |
| 3E — Data Architecture | **CLOSED / APROVADA** | [3E-R1](3E-R1-data-architecture-final-closure.md) |
| 3F — Contracts & API Architecture | **CLOSED / APROVADA** | [3F-R1](3F-R1-contracts-api-architecture-final-closure.md) |
| 3G — Behavioral / State Architecture | **NÃO INICIADA / NEXT** | próxima fase — FSMs/lifecycles |
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

## 6. 3E — CLOSED / APPROVED

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

3E-02 fecha o piso de **46 classes duráveis**:

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
- `3E-FABLE-R2-final-data-architecture-cross-review.md`
- `3E-FABLE-R2.1-arithmetic-erratum.md`

Os totais aritméticos históricos R1→R1.3 ficaram sempre subcontados em 2; isso é documentado no erratum R2.1 e em 3E-R1. 3E-02 é a authority resultante e incorpora a emenda do operador sobre exact `ConnectionRevision` no ProjectConnectionBinding e a restrição de `att.blob` ao domínio Attachments.

### 3E-R1 — APPROVED / CLOSED

| ID | Decisão | Documento |
|---|---|---|
| 3E-R1 | Data Architecture Final Closure | [3E-R1](3E-R1-data-architecture-final-closure.md) |

Fechamento final:

```text
3E-01 = APPROVED
3E-02 = APPROVED
3E-R1 = APPROVED
46 durable record classes
16 Tier-2 FKs
nenhuma classe removida por correção aritmética
nenhum Finding material adicional de Data Architecture
```

3E só pode ser reaberta por Finding material.

---

## 7. 3F — CLOSED / APPROVED

### 3F-01 — APPROVED

| ID | Decisão | Documento |
|---|---|---|
| 3F-01 | Contract Surface Classification & Versioning Boundary | [3F-01](3F-01-contract-surface-classification-versioning-boundary.md) |

3F-01 congela o modelo mínimo:

```text
LIVE SURFACE
  INTERNAL | INDEPENDENT
  CONDITIONAL = routing state only

DURABLE REPRESENTATION
  admitted only by D1 / D2 / D3
  persistence alone != contract

VERSION-GAP MODES
  PRESERVE | REJECT_STALE | QUIESCE | TRANSFORM | DISCARD

FAILURE LOCI
  DOMAIN_OR_AUTHORITY_REJECTION
  CONTRACT_INVALID
  STALE_EXPECTATION
  DURABLE_INTERPRETATION_FAILURE
```

Regras normativas importantes:

```text
direct-call-first permanece
wire/version ceremony não nasce por module boundary
PRESERVE exige semantic horizon + end-of-horizon behavior
idempotency key de attempt admitido = persist-once + reuse-verbatim
Conexus dedup != external-system idempotency guarantee
OUTCOME_UNKNOWN permanece fora de contract failure taxonomy
cada authority-bearing digest domain define typed context + canonical bytes + algorithm/profile
+ pinned canonicalization implementation + evolution rule
no universal digest/serializer framework
```

Baseline classification inclui:

```text
L7/module/Gateway internal calls → INTERNAL
browser↔Hub e published app↔platform → INDEPENDENT
artifact kind/vN family → durable trait / PRESERVE horizon
approval envelope/claim → durable trait
four infra boundaries → internal port + independent vendor side
Builder/PAR live transport → CONDITIONAL até 3H/3J
ordinary 3E relational rows → migration-private por default
```

Review/provenance não-autoritativa:

- [3F-FABLE-DIALOGUE-contract-surface-classification.md](3F-FABLE-DIALOGUE-contract-surface-classification.md)

O review adversarial + buildability encontrou:

```text
no UNSUPPORTED mechanism
zero new probes
zero new subsystems
no Material Finding against 3D/3E
```

Mitra/Factory/in-house evidence permaneceram referências/evidência, não authority.

### 3F-02 — APPROVED

| ID | Decisão | Documento |
|---|---|---|
| 3F-02 | Boundary Payload Semantics & Error Envelope Architecture | [3F-02](3F-02-boundary-payload-semantics-error-envelope-architecture.md) |

3F-02 congela:

```text
F1 INTERNAL_TYPED_CALL
F2 RUNTIME_EXECUTION
F3 PLATFORM_OPERATION_RULES
F4 DURABLE_CONTENT
F5 PRODUCER_INGRESS_OR_PROPOSAL
   OBSERVATION_APPEND | PROPOSAL

T1 PublicFailureProjection
T2 ExecutionIdentity
T3 Correlation
T4 CompatibilityAttestation
T5 DataMeta
T6 EffectTrafficState
```

Guardrails principais:

```text
NO UniversalRequest
NO UniversalSuccess
NO UniversalStatus
NO UniversalInternalFailure
NO RecoveryClass taxonomy sem consumidor

public failure = stable code + sanitized message/key + correlationId
+ optional code-discriminated closed details
L1-L4 ficam fora do wire
retryable não é public-wire authority genérica
execution status/error != effect receipt outcome
state machines permanecem vocabulários distintos
server deriva authority/context
AWAITING_APPROVAL != T1 public failure
```

Retry law preserva effect ambiguity:

```text
READ / effects=[] + NOT_SENT|SENT_NO_RESPONSE
  → allowlisted transient-code policy may retry

EFFECTFUL + SENT_NO_RESPONSE / OUTCOME_UNKNOWN
  → no automatic retry; reconcile/settle first

idempotency=UNKNOWN
  → generic automatic retry proibido
```

A coluna READ depende de `effects[]` fiel; mutation declarada como `effects=[]` é contract/qualification failure C-007.

Error mapping permanece proporcional:

```text
internal-only variants não ganham public projection
per-boundary mapping = mechanically exhaustive
second public admission da mesma owner variant
→ owner-level default dos shared public semantics se torna obrigatório
→ contract test falha em >1 admission sem default
intentional deviation → explicit annotated override + rationale
```

Fallback genuinely unforeseen usa sanitized generic code + correlation e defect signal pelo caminho bounded/non-blocking C-013, sem recursão.

Review/provenance não-autoritativa:

- [3F-FABLE-DIALOGUE-boundary-payload-error-envelope.md](3F-FABLE-DIALOGUE-boundary-payload-error-envelope.md)
- [3F-FABLE-DIALOGUE-boundary-payload-error-envelope-R2.md](3F-FABLE-DIALOGUE-boundary-payload-error-envelope-R2.md)
- [3F-FABLE-DIALOGUE-boundary-payload-error-envelope-R3.md](3F-FABLE-DIALOGUE-boundary-payload-error-envelope-R3.md)

Convergência final:

```text
READY FOR OPERATOR APPROVAL
no UNSUPPORTED mechanism
zero new probes
no Material Finding against prior authority
```

### 3F-03 — APPROVED

| ID | Decisão | Documento |
|---|---|---|
| 3F-03 | Approval Claim & ApprovalRequest Contract | [3F-03](3F-03-approval-claim-approval-request-contract.md) |

3F-03 congela:

```text
one ApprovalRequest = one human decision over one exact sealed effect subject
ALLOW_ONCE binds only to first successfully committed effectAttemptId
same request + same committed attempt → recovery allowed
same request + different attempt → fail closed
PAR owns sealing/custody; Gateway owns PREPARE + last-mile admission/execution
claim inversion remains one narrow capability
```

Claim capability possui dois intents fechados:

```text
FIRST_CLAIM
  exact complete currentValidityPins key-set
  TxScope
  pre-admission expiry/pin checks
  mismatch → terminal monotonic STALE

RECOVER_BOUND
  same bound attempt only
  no current pins
  no TxScope
  no expiry/pin recheck
  read-equivalent exact-subject recovery
```

Admission semantics:

```text
FIRST_CLAIM + Gateway admission = one atomic transaction
claim precedes subject-derived budget/idempotency
budget/idempotency over complete approved unit set = all-or-nothing
gw.effect_attempt = NOT_SENT before external I/O
rollback consumes no approval
external I/O only after commit
```

Approval subject/custody:

```text
EFFECT_SUBJECT = exact executable meaning
GOVERNING_VALIDITY = immutable expiry + externally-compared pins
ORIGIN_CORRELATION = immutable metadata outside effect commitment
DERIVED_AT_ADMISSION = re-derived only from exact pinned revision
PAR generates hidden commitmentNonce, canonicalizes, commits digest and encrypts payload
no duplicate Gateway custody in F1
```

Human display:

```text
no stored ApprovalCard copy
card = mechanical projection from verified sealed subject
projector identity/version/digest recorded server-side as decision evidence
large sets use deterministic preview + exact total + full list before decision
```

PRESERVE horizon keeps sealed payload while request/attempt remains operationally load-bearing, incluindo `OUTCOME_UNKNOWN` until reconciliation/settlement concludes.

Review/provenance não-autoritativa:

- [3F-FABLE-DIALOGUE-approval-claim-approval-request-contract.md](3F-FABLE-DIALOGUE-approval-claim-approval-request-contract.md)
- [3F-FABLE-DIALOGUE-approval-claim-approval-request-contract-R2.md](3F-FABLE-DIALOGUE-approval-claim-approval-request-contract-R2.md)
- [3F-FABLE-DIALOGUE-approval-claim-approval-request-contract-R3.md](3F-FABLE-DIALOGUE-approval-claim-approval-request-contract-R3.md)

Convergência final:

```text
READY FOR OPERATOR APPROVAL
no UNSUPPORTED mechanism
zero new probes
no Material Finding against prior authority
```

### 3F-04 — APPROVED

| ID | Decisão | Documento |
|---|---|---|
| 3F-04 | Project Binding Contract Architecture | [3F-04](3F-04-project-binding-contract-architecture.md) |

3F-04 congela dois contratos concretos:

```text
ProjectConnectionBinding
→ immutable pointer version
→ (Project, slot, DEV|PREVIEW|PROD)
→ exact Connection + exact ConnectionRevision

ProjectBrainBinding
→ immutable adoption/version
→ exact Brain revision + exact brain-binding/v1 artifact revision
```

Shared laws, sem shared base:

```text
Git-first reproducible authoring
mandatory source revision + acting principal provenance
Hub current-authority adoption via expected-current CAS
immutable historical versions
same-Workspace / owner-admissibility checks
no selector fallback / no live inheritance
specialized-owner validation
explicit Git-first UNBIND
Release pins exact refs
PUBLISHED_APP/AGENT_RUN never resolve mutable current Project binding
```

A assimetria é deliberada:

```text
brain-binding/v1 = semantic CONTENT → Registry artifact justified
ProjectConnectionBinding = POINTER → no connection-binding artifact
```

Connection binding não copia credential, ConnectorDefinition, external environment, health, qualification, operation allowlist ou Release state. Qualification pode permanecer pending: binding structurally valid pode ser current Project intent, mas Release continua fail-closed até os gates atuais passarem.

Brain binding não embute target Brain digest no artifact; o mesmo `brain-binding/v1` revision pode ser explicitamente revalidado/adotado com Brain revision posterior quando compatível, sem live inheritance.

No `BindingSet`/`bindingSetDigest`: ReleaseManifest digest já commits the complete served composition.

Product-experience laws:

```text
rigorous architecture underneath; simple experience on top
UX-1 selection-time exact capture
  friendly UI choice → exact revision captured at Save → deterministic Git source
UX-2 update-available is read-only projection
  never auto-adopts; explicit user action uses the same Git-first path
```

Git/digest/revision/CAS/binding-version internals não precisam fazer parte do vocabulário do usuário; Control Plane pode author/commit Git automaticamente e apresentar `Usar conexão`, `Testar conexão`, `Salvar`, `Atualização disponível`, `Parar de usar`, `Publicar` e `Histórico`.

Review/provenance não-autoritativa:

- [3F-FABLE-DIALOGUE-project-binding-contract-architecture.md](3F-FABLE-DIALOGUE-project-binding-contract-architecture.md)
- [3F-FABLE-DIALOGUE-project-binding-contract-architecture-R2.md](3F-FABLE-DIALOGUE-project-binding-contract-architecture-R2.md)

Convergência final:

```text
READY FOR OPERATOR APPROVAL
no UNSUPPORTED mechanism
zero new probes
no Material Finding against prior authority
```

### 3F-05 — APPROVED

| ID | Decisão | Documento |
|---|---|---|
| 3F-05 | Public Failure Code & Details Contract | [3F-05](3F-05-public-failure-code-details-contract.md) |

3F-05 congela o menor contrato público de failure:

```text
owner-local failure variant
→ public admission only when a public boundary needs it
→ one semantic code per consumer-behavior family
→ one static code→locus/details contract projection
```

Baseline F1:

```text
CLIENT_OUTDATED                 L3
CAS_CONFLICT                    L3
CAPABILITY_UNAVAILABLE_HEALTH   L1
NOT_FOUND                       L1
OPERATION_REJECTED              L1
VALIDATION_FAILED               L2
MANIFEST_INVALID                L2
OUTPUT_CONTRACT_VIOLATION       L2
INTERNAL_ERROR                  UNCLASSIFIED (sole fallback)
```

Regras centrais:

```text
literal meaning/locus/details identity defined once
owner defaults/boundary admissions select; never redefine
same consumer behavior across owners → same literal
module/package prefixes prohibited; stable product/domain vocabulary allowed
3F-03/3F-04 semantic classes do not bulk-promote to public codes
NOT_FOUND preserves public semantic indistinguishability without requiring literal byte equality
INTERNAL_ERROR is sole UNCLASSIFIED code; no details/retryable; correlation + defect signal
```

Details:

```text
absent by default
closed + code-discriminated + public-identifiers-only
VALIDATION_FAILED freezes ValidationIssues
params? closed/discriminated by issueCode; never generic bag
MANIFEST_INVALID exact diagnostic fields → promote/compile implementation + 3K presentation
```

Implementation future mínimo:

```text
one typed constant projection
+ one contract-test family
no ErrorRegistry runtime/service/database
```

Evolution F1 é additive-only dentro do PRESERVE horizon; in-place rename/meaning/locus/breaking-details changes são proibidos enquanto consumidor pinado depender deles. Alias/deprecation machinery só reentra com mixed-version consumer real.

Review/provenance não-autoritativa:

- [3F-FABLE-DIALOGUE-public-failure-code-details-contract.md](3F-FABLE-DIALOGUE-public-failure-code-details-contract.md)

Convergência final:

```text
CURRENT STRUCTURE CONFIRMED
READY FOR OPERATOR APPROVAL
zero new probes
no Material Finding against 3F-01..3F-04/C-016
```

### 3F-06 — APPROVED

| ID | Decisão | Documento |
|---|---|---|
| 3F-06 | DEDICATED Platform Service Exchange | [3F-06](3F-06-dedicated-platform-service-exchange.md) |

3F-06 congela o menor exchange semântico DEDICATED:

```text
F1 access surface = server-to-platform
asserted identities = DedicatedApplicationPrincipal + exact ReleaseRef
optional DelegatedConexusPrincipal somente quando 3I estabelecer independentemente
Project/Workspace/audiences/bindings/service-contract identities = derived + verified server-side
```

Authority/composition:

```text
caller scope fields never grant authority
Release must belong to principal Project or fail closed
one operation targets one service owner; audience eligibility derives from Release-pinned composition
runtime never resolves mutable current Project bindings
new binding revision → authoring/adoption → new Release
ApplicationPrincipal != end-user principal
app-user ref under own auth = correlation only, never Conexus authority
```

Compatibility:

```text
DEDICATED ReleaseManifest pins exact service-contract identities consumed by build
exact ReleaseRef = T4 compatibility attestation for this surface
no second per-call contract digest/attestation
in-horizon pinned contracts MUST remain supported
support removal while still in PRESERVE horizon = contract-breaking change
```

Failures/security boundary:

```text
3F-05 baseline governs authenticated/admitted exchanges
NOT_FOUND keeps semantic indistinguishability / no existence oracle
authentication/credential failures are PRE-CONTRACT → 3I
raw Connection/platform master credentials never cross merely to enable service call
```

3I continua responsável por OAuth/mTLS/JWT/keys-or-other, credential issuance/rotation/revocation, bearer-vs-PoP, replay/challenge/anti-oracle semantics, delegation realization, instance identity, network/egress e break-glass.

Review/provenance não-autoritativa:

- [3F-FABLE-DIALOGUE-dedicated-platform-service-exchange.md](3F-FABLE-DIALOGUE-dedicated-platform-service-exchange.md)

Convergência final:

```text
CURRENT STRUCTURE CONFIRMED
READY FOR OPERATOR APPROVAL
no Material Finding against 3F-01..3F-05, 3C-12 or C-014
```

### 3F-R1 — APPROVED / CLOSED

| ID | Decisão | Documento |
|---|---|---|
| 3F-R1 | Contracts & API Architecture Final Closure | [3F-R1](3F-R1-contracts-api-architecture-final-closure.md) |

Cross-review independente ChatGPT + Fable convergiu antes da ratificação:

```text
CLOSE 3F
material blockers = 0
material 3F decisions still required = 0
3F-07 = NOT JUSTIFIED
new probes = 0
```

Fechamento global:

```text
3C ownership
→ 3D dependency direction
→ 3E durable truth/reference
→ 3F contract/interaction semantics
```

`ReleaseManifest` permanece composition root única; current Project intent não é runtime composition; MANAGED e DEDICATED continuam uma única Factory; public failure, lifecycle e effect outcome permanecem separados; authority continua server-derived; PRESERVE horizons são coerentes.

O antigo routing de exact compatibility handshake está semanticamente resolvido:

```text
MANAGED published app → C-012 runtimeContractDigest
DEDICATED → exact ReleaseRef as T4
Control Plane → 3F-01 fail-closed staleness + 3F-02 T4 + 3F-05 CLIENT_OUTDATED
exact transport placement → implementation
```

Para authenticated/admitted failures de 3F-05, `code` é a behavior key; HTTP status/transport não vira segunda taxonomy. Pre-contract auth/challenge permanece integralmente 3I.

3F só reabre por evidence material conforme [3F-R1](3F-R1-contracts-api-architecture-final-closure.md).

---

## 8. Open findings / routed work

Estes itens não reabrem fases anteriores automaticamente.

| Finding / questão | Owner posterior |
|---|---|
| F3B-R1 — repo canônico/cutover do produto | 3A / operador — antes de implementação |
| F3B-R4 — browser/runtime physical trust zones | 3I/3J |
| N3 — Planning Depth × RigorProfile | 3G |
| F3D02-R1 — AgentRun in-flight × stricter new Release | 3G/3I |
| F3D04-R2 — archived Project with active Release | 3G/3I |
| F3E01-R1 — `mastra_par` no procedimento de backup/restore | 3J |
| F3E01-R2 — `hub_control` rebuild 0..N em DB temporário | implementation verification |
| F3E02-R1 — Mastra `workflowDefinitions` não pode virar authoring authority | 3H/3L probe |
| F3E02-R2 — physical storage/custody do CredentialBackend | 3I / infra implementation |
| exact wire layout / HTTP mapping por public boundary | implementation + contract tests; 3L somente se transport/schema technology exigir qualification |
| exact `MANIFEST_INVALID` promote/compile diagnostic fields | promote/compile implementation + 3K presentation, sob 3F-05 |
| per-family approval card/display contracts | 3K + implementation, sob 3F-03 |
| ApprovalRequest lifecycle/FSM completo | 3G |
| approver eligibility / admin revocation / post-admission cancellation | 3I / 3G |
| reconciliation / re-send after `OUTCOME_UNKNOWN` | 3M / 3G |
| authored Project binding source/file schema + exact literal mutation DTOs | implementation; 3K authoring UI; 3L somente se tooling exigir qualification |
| exact `brn.binding_validation` ref if 3N proves it load-bearing | Decision Loop / 3N |
| Project binding Control Plane UI realization | 3K |
| binding lifecycle state labels / Project mutation lifecycle | 3G |
| binding change permissions / authority enforcement | 3I |
| binding/Release/runtime end-to-end proof | 3N / 3O |
| pools/failover/shared resource extensions | Decision Loop on real consumer |
| break-glass binding/runtime override | Decision Loop on real incident failure class |
| DEDICATED trust/credential mechanism + optional delegation realization | 3I |
| DEDICATED Release admissibility window / old-vs-new lifecycle | 3G/3I |
| DEDICATED egress/network policy | 3I/3J |
| MANAGED/DEDICATED deployment topology | 3J |
| async/attempt status projection | 3G/3H |
| F5 wire realization | 3H |
| Mastra telemetry ↔ Conexus correlation | 3H/3L |
| Verification Observability realization | 3H/3L/3N |
| job/v1 queue/scheduler substrate | 3H/3L only on concrete need |
| app-origin approvals / second approval consumer | Decision Loop when real consumer exists |
| duplicate Gateway approval-subject custody under future availability split | Decision Loop / 3J when real topology requires |
| DEDICATED browser-direct Platform-Service authority | Decision Loop on named consumer |
| DEDICATED durable credential/grant record | Decision Loop if 3I proves lifecycle need |
| DEDICATED multi-install/fleet management | DEFER |

Resolvido:

- F3D04-R1 route mapping ownership → `mar`; topology física continua 3J.
- F3E01-R3 cluster inventory → `hub_control + mastra_builder + mastra_par + project/validation DBs`.
- 3E arithmetic discrepancy `44 vs 46` → corrigida como defeito documental; nenhuma classe removida.
- F3B-R2 legacy `MissionPlan v2` → 3F-01 define one-time `TRANSFORM` para semântica atual de Change / Work Unit; sem compatibility layer permanente.
- approval capability exact claim/recovery semantics + ApprovalRequest exact-subject contract → **RESOLVIDO por 3F-03**; lifecycle, approver authority e post-admission cancellation permanecem roteados.
- Project binding contract shapes → **RESOLVIDO por 3F-04** como dois contratos concretos, Git-first, exact-pinned e sem GenericBinding/BindingSet; lifecycle, authority e UI permanecem roteados.
- literal stable public codes + per-code baseline details + public-code→locus contract → **RESOLVIDO por 3F-05** com 9-code baseline, details fechados e static projection; exact wire/HTTP/promote diagnostics são realization roteada.
- DEDICATED identity/authority exchange shape → **RESOLVIDO por 3F-06** como server-to-platform exchange com `DedicatedApplicationPrincipal + exact ReleaseRef`, scope/audience derivados, Release-as-attestation e support horizon; concrete trust/credential/delegation mechanics permanecem 3I.
- exact compatibility handshake posterior de 3F-01 → **RESOLVIDO semanticamente por C-012 + 3F-02 T4 + 3F-05 + 3F-06**; exact transport placement/serialization permanece implementation realization, e mudança de semantic source/horizon/stale behavior/authority exige reopen 3F.
- 3F final coherence/closure → **RESOLVIDO por 3F-R1** após reviews independentes ChatGPT + Fable; zero blocker material, zero decisão 3F adicional e zero probe novo.

---

## 9. Anti-overengineering guardrail

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
wire DTO / /v1 por module boundary
generic contract registry service
UniversalContract / UniversalEnvelope
UniversalRequest / UniversalSuccess / UniversalStatus
UniversalInternalFailure / central error registry
RecoveryClass taxonomy sem consumidor
generic details/metadata/context bag
universal serializer / UniversalDigestFramework
shadow versioning layer sobre as 46 classes duráveis
negotiated multi-version windows sem consumidor nomeado
ApprovalService / shared ApprovalRepository
ApprovalOriginator framework / BatchApproval framework
UniversalApprovalCard / stored ApprovalCard copy
sticky/reusable approvals / approval transfer
Gateway-created ApprovalRequest / Gateway read of par.*
Gateway duplicate custody of sealed approval subject sem availability failure class
second reverse markStale API / eager push-invalidation as primary correctness
keyed-hash approval commitment subsystem
persistent effect-attempt preallocation record
UniversalAuthoritySnapshot / DisplayContext bag
transaction across external I/O
Binding<T> / BindingRepository / BindingService / BindingSet / bindingSetDigest
generic binding mutation `{kind,target,payload}`
connection-binding Registry artifact
universal slot catalog / automatic slot inference
binding-level credential/health/qualification/ConnectorDefinition/environment mirrors
binding operation allowlist
embedded target Brain digest apenas para simetria
binding `latest` / `current` / name-matching / time-varying auto-selection
implicit selector fallback or Connection failover
dual Git + Hub-only binding authoring paths
DB-only emergency binding rebind sem Decision Loop
runtime mutable-current Project binding lookup para PUBLISHED_APP/AGENT_RUN
ErrorRegistry service/database
UniversalError / UniversalIssue / UniversalDiagnostic
module/package-prefixed public failure namespace
public failure alias/deprecation machinery sem mixed-version consumer real
Universal DedicatedRequest/Response/Error/Context
PlatformServiceRegistry / service mesh / runtime plugin registry
caller-asserted Project/Workspace/audience authority fields
DEDICATED per-call compatibility digest paralelo à Release
wildcard DEDICATED service audience
DEDICATED direct browser→Platform-Service authority sem consumidor
DedicatedAccessGrant / PlatformServiceBinding / DedicatedSession / ServiceCredential domain records sem lifecycle provado
DEDICATED identity federation/delegation framework sem consumidor
OAuth/mTLS/JWT/API-key architecture predecidida em 3F
Kafka/Kubernetes/Temporal by default
```

Qualquer item retorna apenas pelo Decision Loop com consumidor/failure class real.

---

## 10. Regra de avanço

```text
3B = CLOSED
3C = CLOSED
3D = CLOSED / APPROVED
3E = CLOSED / APPROVED
3E-01 = APPROVED
3E-02 = APPROVED
3E-R1 = APPROVED
3F = CLOSED / APPROVED
3F-01 = APPROVED
3F-02 = APPROVED
3F-03 = APPROVED
3F-04 = APPROVED
3F-05 = APPROVED
3F-06 = APPROVED
3F-R1 = APPROVED
3G = NOT STARTED / NEXT
```

A próxima fase é 3G. A primeira decisão de Behavioral / State Architecture deve ser trabalhada com o operador antes de ser documentada como authority.

A Fase 3 completa continua em andamento até C-018. Nenhuma implementação de produto está autorizada por este ledger.