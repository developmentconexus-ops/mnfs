# Conexus — Current Architecture Baseline

> **Status:** CANDIDATE / R11-D — NOT YET CURRENT AUTHORITY  
> **Parent checkpoint:** `3A-R11 — Whole-Product Authority Rebaseline`  
> **Product meaning:** [PRODUCT-CONTRACT.md](PRODUCT-CONTRACT.md) — candidate until R11 ratification  
> **Decision routing:** [DECISION-RECONCILIATION.md](DECISION-RECONCILIATION.md) — candidate until R11 ratification  
> **Method:** DevelopmentConexus Engineering Method v1.0.0  
> **Implementation:** BLOCKED  
> **C-018:** NOT YET RATIFIED  
> **Package B:** PAUSED / NOT OPENED by R11  

This candidate answers:

> **How is the currently accepted Conexus Product structurally divided, where does authority live, what persistence/runtime mechanisms realize each boundary today, what has already been qualified, what remains an assumption, and what future seams are deliberately preserved without becoming F1 machinery?**

This is a current-state architecture projection, not a second detailed architecture. Exact semantic authority remains in accepted 3B–3K documents; exact technology proof remains in 3L deciding Evidence. If this projection conflicts with an accepted detailed home, this projection is defective unless a material Finding explicitly reopens that authority.

---

# 1. Architecture in one sentence

Conexus F1 is a **Node/TypeScript modular-monolith Hub with PostgreSQL-backed authoritative control state**, Project-owned Git/business-data/Release lifecycles, Workspace-owned Brain and Connections, a Hub-owned Capability Gateway for governed data/effects/credential last-mile, a **Mastra AgentController + E2B Builder runtime** for Project Changes, a **direct Mastra Agent Product Agent Runtime** derived from exact Releases, a bounded Managed Application Runtime for Project apps/jobs, and an agent-first React/TypeScript/Vite/TanStack product shell; all runtime/provider/storage mechanisms remain subordinate to Conexus owner facts, current authorization and exact immutable composition.

---

# 2. Architecture laws

The following are structural laws, not implementation preferences:

```text
one semantic authority per meaning
mechanism != authority
current implementation != target authority by existence
Workspace = sovereign isolation root
Project = independent product/software lifecycle unit
Change != WorkUnit != Builder ActorRun
Builder ActorRun != Product AgentRun != Gateway EffectAttempt != Promotion
Git authoring != Hub control truth != Project business DB != Registry/CAS serving output
Workspace owns Brain/Connections; Project owns explicit typed binding intent
same Workspace != implicit resource authority
Control Plane != Preview != Published App authority
administer != use
runtime/provider/trace/telemetry identity != Conexus authority
Gateway = business/application external-effect + credential-last-mile boundary
approval binds one exact sealed subject
current mutable authority is rechecked at protected control points
OUTCOME_UNKNOWN never grants blind replay
Release = exact immutable composition; governed runtime never resolves by mutable latest
telemetry observation != owner F5/terminal truth
Brain != agent/runtime memory
selected/current architecture != qualified behavior
future seam != dormant implementation
```

---

# 3. Logical whole-system topology

```text
                         ┌──────────────────────────────┐
                         │      Browser / Client        │
                         │ Control Plane / Preview / App│
                         └──────────────┬───────────────┘
                                        │
                             authenticated / typed
                                        │
                                        ▼
┌────────────────────────────────────────────────────────────────────┐
│                     CONEXUS HUB — Node / TS                         │
│                        modular monolith                             │
│                                                                    │
│  Identity & Access          Workspace             Project           │
│          │                       │                    │              │
│          ├─────────────── current authority ─────────┤              │
│          │                       │                    │              │
│  Builder                 Artifact Registry        Release           │
│     │                           │                    │              │
│     │                           │                    │              │
│  Connections ──────── Capability Gateway ─────── external I/O       │
│     │                           │                                   │
│  Brain                   Observability & Audit                      │
│                                                                    │
│  Production Agent Runtime          Managed Application Runtime      │
│            │                                  │                     │
└────────────┼──────────────────────────────────┼─────────────────────┘
             │                                  │
             │ control-side                     │ exact active Release
             ▼                                  ▼
   ┌─────────────────────┐              ┌─────────────────────┐
   │ BuilderMastra       │              │ Published Apps /    │
   │ AgentController     │              │ Managed jobs        │
   │ CodingSession       │              └─────────────────────┘
   │ Workspace           │
   └─────────┬───────────┘
             │
             ▼
      ┌──────────────┐
      │ E2B sandbox  │
      │ guest/root   │
      └──────────────┘

Product Agent path inside trusted Hub runtime:

exact Release
→ RuntimeAgentProjection
→ ParMastra role instance
→ direct Mastra Agent
→ bounded ToolProjection
→ owners / Gateway
```

The diagram is logical. A module box does not imply a service/process/database. Physical first-production placement is defined separately below.

---

# 4. Semantic module/owner architecture

F1 uses one modular monolith with the following current semantic owners.

| Owner/module | Owns | Explicitly does not own |
|---|---|---|
| **Identity & Access** | Account identity/auth/session, memberships, grants, role assignments, effective surface access context | domain preconditions, effect authority, Release eligibility, business data truth |
| **Workspace** | Workspace, Area, organizational structure/lifecycle | Account identity, Project internals, Brain content semantics, Connection credentials |
| **Project** | Project identity/lifecycle, Project Baseline, explicit Brain/Connection binding intent, Project-level composition intent | Workspace resources themselves, runtime implementation, external effect authority |
| **Builder** | Change, WorkUnit, Builder ActorRun, planning/checkpoint/correctness coordination, Findings/routing, coding-session relationship | Project business authority, Product Agent runtime truth, provider/runtime authority |
| **Artifact Registry** | immutable compiled ArtifactRevision identity/digest/payload/availability | authored Git truth, active serving, business meaning of each artifact kind |
| **Connections** | Connection logical identity/lifecycle, qualification/current logical credential relationship | plaintext/ciphertext secret-byte ownership, external effect execution |
| **Capability Gateway** | governed Query/Action/Integration execution, external effect admission/replay/idempotency, credential last-mile, execution receipts | Project/Brain meaning, Account identity, Product Agent lifecycle |
| **Brain** | Workspace-level SEMANTIC/KNOWLEDGE/EVIDENCE meaning, validation/compilation, publication semantics, KnowledgeProposal, semantic health/conformance | RAG/index, agent memory, Project DB, telemetry, security policy |
| **Production Agent Runtime (PAR)** | Conversation, Product AgentRun, ApprovalRequest, AgentTrigger runtime semantics, exact projection execution/terminal owner facts | Agent source definition/Release authority, Gateway effect replay, I&A authority |
| **Release** | exact immutable active Project composition, Release/Promotion semantics and current served composition | authored source, runtime framework mutable state, Project business data |
| **Observability & Audit** | authorized audit facts and operational observations/provenance projections according to their classes | business-state reconstruction by log inference, authorization, F5 terminal authority |
| **Attachments & Blob** | shared byte/storage mechanics and attachment semantics where owner contracts admit them | semantic identity/authorization of every referencing owner |
| **Managed Application Runtime (MAR)** | serving/runtime mechanics for managed applications and admitted job occurrences | Product business meaning, scheduler business authority, arbitrary privileged Project code |

No generic `Workflow`, `Tool`, `ResourceBinding`, `Secret`, `Status`, `Runtime`, `EvidenceGraph` or `Automation` business owner exists merely for conceptual uniformity.

---

# 5. Authority and persistence boundaries

Conexus intentionally has several durable truth classes.

## 5.1 Project Git

Canonical authored Project content includes, according to kind/owner:

```text
Project Baseline readable source
application source
artifact source definitions
agent/v1
brain source where Workspace Brain repository boundary applies
migrations
configuration contracts
verification/test assets
```

Git is authoring/provenance truth. It is not runtime/current authorization/serving truth.

## 5.2 `hub_control` PostgreSQL

Authoritative Hub operational/domain truth for owners such as:

```text
Identity & Access
Workspace
Project
Builder
Artifact Registry metadata
Connections logical state
Gateway effect/current counters
Brain operational state/proposals/health overlays
PAR owner facts
Release/Promotion
Observability/Audit records
MAR occurrence facts
```

Exact table/column names remain post-C-018 derived Realization Planning.

Logical owner schemas/boundaries remain explicit; ordinary owner persistence may not become a broad cross-schema god capability.

## 5.3 Project Database

Project-owned business/runtime application data.

A Project DB can hold:

```text
Project-native business state
derived analytical/read-model state
migrations required by the Project
```

It is not Hub control authority, Brain semantic authority or proof that external synchronization is correct.

Persistent Project databases are environment-specific where needed. Build validation databases are ephemeral proof fixtures, not permanent third business environments by default.

## 5.4 `mastra_builder`

Builder Mastra substrate persistence only:

```text
stored coding thread/runtime state
AgentController-related substrate state
runtime mechanics needed for Builder continuation
```

It never becomes Change/WorkUnit/ActorRun/correctness authority.

## 5.5 `mastra_par`

Product Agent Mastra substrate persistence only:

```text
thread/message history
suspension/checkpoint mechanics
runtime state required for resumed direct Agent execution
```

It never becomes current Release, permission, approval, AgentRun terminal truth or Gateway effect authority.

## 5.6 Artifact/Blob/CAS backing

Digest-addressed/immutable byte storage/serving mechanics according to owner contracts.

```text
same bytes/digest
!= same semantic identity
!= same authorization
```

## 5.7 CredentialBackend backing

Opaque encrypted secret storage/crypto mechanism for Connection credentials behind the narrow `CredentialBackend` boundary.

Connections owns handles/logical grant facts; Gateway receives plaintext only at trusted last-mile use. CredentialBackend does not become a generic Secret domain.

## 5.8 Backups

Backup/recovery material is operational recovery state, not current application authority while running.

Recovery must reconstruct accepted owner truth without fabricating newer/cleaner semantics than the durable evidence actually contains.

---

# 6. Database and least-privilege architecture

## 6.1 PostgreSQL baseline

```text
architecture major = PostgreSQL 17
Q0 probe exact minor = 17.10
```

PG17 is current architecture. `17.10` identifies Q0 deciding Evidence unless explicitly repinned; it is not a permanent promise that production can never use a later supported 17.x under accepted realization/requalification rules.

PG18 is not selected merely because it is newer.

## 6.2 Owner-scoped Hub persistence

Normal owner persistence capability must satisfy the negative property:

```text
owner A arbitrary SQL
-X-> owner B schema
-X-> SET ROLE into unrelated owner authority
-X-> object-owner/superuser/BYPASSRLS privilege
```

Cross-owner DB access is admitted only for explicitly justified atomicity/audit capabilities already frozen by current authority.

Migration/provisioning/backup credentials with broader operational power are separate from ordinary request/runtime credentials.

## 6.3 Physical store separation matrix

```text
hub_control owner credential
-X-> mastra_builder
-X-> mastra_par
-X-> Project DB by default

mastra_builder credential
-X-> hub_control / mastra_par / Project DB

mastra_par credential
-X-> hub_control / mastra_builder / Project DB

Project query/action/migrator credential
-X-> hub_control / Mastra stores / another Project DB
```

Physical co-location does not weaken this matrix.

---

# 7. Workspace / Project architecture

## 7.1 Workspace

Workspace is the visible tenant/isolation root.

```text
Workspace
├── Projects
├── Agents catalog/projection
├── Brain
├── Connections
├── membership/organizational context
└── settings
```

No hidden/default Workspace is created merely to simplify implementation.

## 7.2 Project

Project is the independent product/software lifecycle unit.

```text
Project
├── Baseline
├── source repo
├── Changes
├── Data
├── Capabilities
├── Integration bindings
├── Brain binding
├── Product Agents
├── managed jobs when required
├── Releases
└── Published Application
```

F1 = one canonical source repo per Project.

## 7.3 Project Baseline

The approved Baseline is pinned by digest/revision and is sufficient for the current Change.

```text
ProjectBaselineDigest
+ Change/current contract pins
→ execution/proof identity
```

Discovery requiring material Project-level meaning change must return before the coding actor silently crosses the old Baseline.

## 7.4 Cross-Project reuse

Default:

```text
Project A DB/source/runtime
-X-> Project B direct mutable access
```

Current reuse seams:

```text
Platform published machinery
Workspace Brain + explicit ProjectBrainBinding
Workspace Connection + explicit ProjectConnectionBinding
```

Small duplication is preferred to premature shared mutable authority.

---

# 8. Builder architecture

## 8.1 Current line

```text
Project
→ Change
→ Builder authority
→ CodingWorkerRuntime boundary
→ Mastra AgentController
→ Change-scoped CodingSession
→ role-specific BuilderMastra
→ Mastra Workspace
→ E2B
```

Pi is not the primary F1 Builder runtime. It remains fallback/challenger only if current Mastra qualification eventually exposes a structural failure not repairable through the existing narrow seam.

## 8.2 Cognitive scope

```text
Change lifetime
!= CodingSession mechanics lifetime
!= ActorRun lifetime
!= sandbox lifetime
```

Default:

```text
one persistent CodingSession per Change
persistent thread = ON
Builder Observational Memory = OFF
Project hidden memory = OFF
```

WorkUnits and ActorRuns remain bounded/auditable but do not force cognitive reset.

A new session is used for a new Change, independent material verifier, material contract rebaseline or concrete contamination/isolation reason.

## 8.3 Hub remains Builder authority

Mastra may own coding mechanics; Conexus owns:

```text
Change identity/correctness
approved planning/checkpoints
WorkUnit semantics
ActorRun facts/budgets
Findings/Evidence admission
current permissions/bindings
Git remote authority
Release eligibility handoff
```

```text
harness says done
-X-> Change accepted
```

## 8.4 ActorRun re-entry

Every ActorRun/rebind must mechanically reapply current/pinned owner authority. Runtime state never authorizes itself by continuity.

Source lineage is explicit, conceptually:

```text
FRESH_BASE
CONTINUE_LINEAGE
```

A continued lineage may use the same CodingSession while remaining an independent bounded execution fact.

## 8.5 E2B execution substrate

Current Builder workspace substrate:

```text
Mastra Workspace
→ @mastra/e2b
→ E2B physical sandbox
```

E2B is remote guest/root-capable execution state, never durable business/control truth.

### Mandatory physical-incarnation guard

Package A found a real stock-adapter failure class: an automatic write retry could cross a dead physical sandbox into a replacement incarnation before Conexus regained control.

Current required property:

```text
write operation is bound to exact observed physical sandboxId/incarnation
→ incarnation dies
→ write fails
→ no silent replay on replacement
→ lineage quarantined/rebound only through explicit owner path
```

Current E2B status:

```text
QUALIFIED WITH REQUIRED PHYSICAL-INCARNATION GUARD
```

Product realization must implement semantically equivalent protection; the qualification spike class/API is not Product architecture.

## 8.6 Builder credentials

E2B guest does not receive:

```text
Hub DB credential
Project authoritative DB credential
Connection/ERP credential
CredentialBackend/root material
Git write credential
model-provider credential
backup credential
DEDICATED private key
```

Model calls moved control-side. The historical guest LLM provider key is deleted.

## 8.7 Git custody

Builder may mutate its isolated working copy, but remote Git authority remains Hub/approved infrastructure side.

The durable candidate/result must enter Hub custody before authoritative output/Release progression.

---

# 9. Artifact Registry and Release architecture

## 9.1 Authoring versus compiled revision

```text
Project Git source
→ validate/compile
→ ArtifactRevision exact digest/payload
→ AVAILABLE
```

Registry availability is not Project active use.

Artifact kinds keep owner-specific meaning; `agent`, `brain`, `query`, `action`, `job`, `integration` and later admitted families do not become one semantic type merely because Registry stores their revisions.

## 9.2 Release composition root

Release is the exact immutable composition of the Project Product eligible for serving/runtime execution.

It may pin, according to consumer:

```text
frontend bytes
artifact revisions
Agent revision
ProjectBrainBinding/revision
ProjectConnectionBinding/revision
runtime/model/tool/memory policy pins
job definitions/schedules
configuration contract identity
```

No governed runtime is allowed to select mutable `latest` as correctness shortcut.

## 9.3 Promotion

Promotion changes active serving only through current eligibility/conformance/authorization checks and expected-generation/current-pointer protection.

```text
Release AVAILABLE
→ Promotion decision/process
→ pointer state transition
→ serving verification
→ SERVED_VERIFIED
```

Rollback is a new Promotion to an eligible old composition; business data is not automatically rewound.

---

# 10. Connections architecture

## 10.1 Ownership

```text
Workspace
→ Connection

Project
→ ProjectConnectionBinding intent

Connections
→ logical Connection/qualification/credential-handle facts

CredentialBackend
→ encrypted secret bytes/crypto mechanics

Gateway
→ trusted last-mile execution
```

No generic cross-resource binding framework is introduced.

## 10.2 Connector model

Connector definitions remain narrow/declarative and provider-aware enough to express real source capabilities, effects/idempotency/qualification and environment behavior without copying whole provider DTO models into Product authority.

Native/provider-specific operations are allowed when that is the honest semantic shape.

Free-form provider hook/runtime is not baseline merely for extensibility.

## 10.3 Secret lifecycle

Connection secret plaintext appears only at:

```text
A. write-only administration ingress
B. Gateway trusted last-mile external use
```

No read-back contract exists by default.

Credential material is published durable-before-visible and fails closed on missing/corrupt/unsupported backing/key state.

Logical credential version, crypto key version and transient token generation remain separate axes.

---

# 11. Capability Gateway architecture

Gateway is the narrow physical/execution boundary for governed application/business capability execution.

## 11.1 Gateway owns

```text
current execution admission
exact Connection/binding resolution where external
business/application external I/O
effect identity/idempotency/replay safety
precondition/effect rules at last mile
credential materialization at exact use point
execution receipt / traffic-state truth
external-effect budget authority
```

## 11.2 Gateway does not own

```text
Project business meaning
Brain semantic meaning
Account identity
Product Agent lifecycle
Release source authority
model-spend authority
```

## 11.3 Retry law

```text
runtime retry
!= effect retry permission
```

If an effect may have crossed the external boundary and outcome is ambiguous:

```text
OUTCOME_UNKNOWN
→ reconcile/current evidence
-X-> blind replay
```

---

# 12. Brain architecture

## 12.1 One canonical Brain per Workspace F1

```text
Workspace
→ 0..1 canonical Brain
```

Internal namespaces/domains provide organization without prebuilding multiple Brain lifecycles.

## 12.2 Authority split

```text
Git              → published source
Artifact Registry→ exact immutable brain revision/payload
Brain            → semantic meaning/validation/publication/health
Project          → binding intent
Release          → exact promoted composition
Gateway          → controlled physical data proof/execution
Builder/PAR      → final context composition
```

## 12.3 Brain is not memory/RAG

```text
Brain
!= Conversation memory
!= AgentRun history
!= Builder scratchpad
!= tasks.md
!= personal memory
!= vector index
```

A derived retrieval index may locate candidate Brain IDs later; it never becomes canonical meaning.

## 12.4 Publication/adoption

```text
KnowledgeProposal
→ human Brain review
→ Git publication
→ compile
→ immutable revision AVAILABLE
→ Project sees update
→ Project independently validates/rebinds
→ Release pins exact revision
```

No self-publish from model/session memory.

---

# 13. Production Agent Runtime architecture

## 13.1 Current execution line

```text
exact Conexus Release
→ derived RuntimeAgentProjection
→ role-specific ParMastra
→ direct Mastra Agent
→ AgentRun execution
```

`RuntimeAgentProjection` is derived/rebuildable/cacheable but non-authoritative.

No `RuntimeAgentRevision` domain class exists.

## 13.2 Admission-before-execution

```text
resolve current admissible surface
→ admit Product AgentRun owner fact
→ pin exact Release/agent/tool/model/runtime facts
→ commit
→ only then construct/execute Mastra Agent
```

No model/tool execution may precede AgentRun admission.

## 13.3 Closed override channels

Production Product Agent does not resolve through:

```text
Mastra Stored Agent latest
Editor mutable config
request-body version override
runtime “current” version
```

A suspended old AgentRun is reconstructed from its exact old pins.

## 13.4 Conversation/memory

```text
ConversationId = Conexus identity
Mastra threadId = substrate mechanic
```

Baseline:

```text
Conversation/message history = ON when Conversation exists
Working/Agent Memory          = consumer-gated
Semantic Recall               = OFF until eval/qualification
Observational Memory          = OFF until eval/qualification
Memory Extractors             = OFF until admitted consumer/eval
```

Scheduled runs are threadless by default.

Minimum memory resource scope includes Workspace + Project + Agent + memory class/purpose + subject where applicable.

## 13.5 Suspension/resume

For a genuine durable wait:

```text
PAR owner persists exact pending proposal / ApprovalRequest first
→ commit owner authority
→ runtime suspension/checkpoint in mastra_par
→ process may disappear
→ resume reconstructs exact old projection
→ current owner/security facts rechecked
→ RequestContext replaced whole
→ resume exact same AgentRun
```

Owner wait without runtime snapshot is a recoverable failure case. Runtime snapshot without owner authority is structurally unacceptable.

## 13.6 Exact proposal identity

Resume re-presents:

```text
proposalRef + exact args
```

Mismatch to sealed subject fails closed.

Mastra `toolCallId` is correlation only.

---

# 14. Builder ↔ Product Agent runtime isolation

## 14.1 Role-specific Mastra instances

```text
Builder role
├── BuilderMastra
├── mastra_builder store
├── Builder-local PubSub/runtime namespace
└── Builder-only AgentController/tools/workspaces

PAR role
├── ParMastra
├── mastra_par store
├── PAR-local PubSub/runtime namespace
└── PAR-only Product Agents/tools/schedules/memory
```

Forbidden sharing includes:

```text
same mutable Mastra store
same same-process PubSub instance
same external PubSub namespace/keyPrefix
same Agent object instance
same mutable Memory instance
Builder Workspace/toolset in PAR
standalone/ephemeral fallback for governed runs
```

## 14.2 Same process conditional baseline

Builder and PAR may coexist in the single Hub application process **only if Package B proves enabled F1 process-global mutable state can remain mechanically partitioned/fenced**.

Process split is a trigger, not a stylistic preference.

A material unpartitionable cross-role framework global state in an enabled F1 path forces the smallest safe topology change, potentially separate process/container placement without changing semantic owners.

## 14.3 RequestContext rule

On every Builder dispatch/rebind and PAR dispatch/resume:

```text
current/pinned owner facts
→ build NEW role-specific effective RequestContext
→ REPLACE WHOLE restored/effective context
→ execute
```

Never overlay current keys onto a stale restored snapshot and allow unknown stale keys to survive.

## 14.4 Qualification status

```text
architecture baseline = CURRENT
Package B deciding Evidence = NOT YET RUN / PAUSED BY R11
```

Do not claim same-process safety proven before Package B.

---

# 15. Product Agent authoring architecture

Product Agent authoring remains a specialized Builder experience over Project authority.

```text
structured/manual edit
OR
natural-language Conexus edit
→ same Change
→ same candidate agent/v1
→ same diff/work graph
→ same proof/checkpoint
→ immutable ArtifactRevision
→ same Release
```

There is no `AgentBuilderModule`, second Agent authoring DB or Mastra editor authority.

ToolProjection is compiled from exact admitted owner resources, such as:

```text
Project Query Capability
Project Action Capability
Integration Operation
explicit platform-native tool only with current consumer
```

No `execute(anySlug, anyInput)` primitive is exposed to Product Agent reasoning.

Builder can propose missing dependencies, but they must become explicit Change scope and pass the applicable permission/effect/Release gates.

---

# 16. Managed Application Runtime architecture

MAR realizes serving/runtime mechanics for Project applications and admitted Project jobs.

## 16.1 Published Application serving

```text
request
→ server resolves Project/current authority
→ exact active served Release
→ exact digest-addressed verified frontend/runtime composition
```

No rebuild/latest fallback at serve time.

## 16.2 `job/v1` current F1 profile

First admitted consumer = governed managed sync.

```text
Project job/v1 artifact
→ exact active served Release composition
→ derived schedule
→ MAR job_run occurrence
→ governed Gateway/Project capabilities
```

Current semantics:

```text
manual + fixed interval
single-flight + coalesce
one catch-up after downtime
not N missed-slot replay
```

Rejected F1:

```text
arbitrary privileged Project job code
generic workflow/automation/scheduler business domain
```

## 16.3 Queue/scheduler technology

Current Q0 Package-D candidate:

```text
pg-boss 12.26.3
```

Status:

```text
CANDIDATE / NOT QUALIFIED / NOT AUTHORITY
```

Package D must prove the current 3A-R9 behavior or introduce only the smallest owner-side reconciliation needed.

---

# 17. Model-provider spend architecture

Model spend is **owner-local run authority**, not Gateway/Observability authority.

```text
Builder model spend    → Builder ActorRun
Product Agent spend    → Product AgentRun
```

## 17.1 F1 invariant

```text
committedModelSpendUsd
+
outstandingModelLiabilityUsd
<= effectiveModelSpendCapUsd
```

At most one unsettled billable model liability exists per run in the F1 baseline.

## 17.2 Pre-provider gate

Before every physical billable model-provider attempt:

```text
run current/admissible
+ exact model/provider allowed
+ call-count available
+ qualified finite max cost envelope
+ no outstanding liability
+ cap sufficient
→ durably reserve max liability on owner run fact
→ commit
→ only then provider I/O
```

## 17.3 Retry/fallback

Every physical provider attempt must have fresh owner admission.

Normal F1 target:

```text
automatic retries/fallback below owner gate = disabled
```

A fallback model/provider requires a fresh qualified cost profile/admission.

## 17.4 Missing/ambiguous settlement

```text
usage missing
cost unsupported
response lost
crash
ambiguous outcome
→ never zero
→ conservatively consume reserved maximum
```

## 17.5 Qualification status

Architecture obligation = CURRENT.

Exact Mastra/provider interception/usage/cost-envelope proof = **Package C NOT YET QUALIFIED**.

No model proxy/token broker/BudgetService/ModelCallAttempt domain exists F1.

---

# 18. F5 control handoff and terminal truth

Runtime has two semantically different outbound paths:

```text
A. owner-control F5 proposal
B. Operational Telemetry observation
```

Never reconstruct owner control truth from telemetry after the fact.

## 18.1 In-process baseline

Where runtime and owner are co-located:

```text
runtime
→ narrow typed callback/function bound to owner dispatch context
→ owner validates current facts
→ owner writes owner transition
```

The producer-supplied run ID is cross-check only; effective target identity comes from owner dispatch closure/opaque handle.

## 18.2 Duplicate/lost response

Owner terminal/output rules are write-once/current-guarded so duplicate callback cannot manufacture a second conflicting owner result.

Transport acknowledgement remains different from domain application.

## 18.3 Future process split

If a runtime later moves out of process, narrow authenticated HTTP/RPC/request-reply may preserve the same owner semantics.

No generic RuntimeBus/EventBus/UniversalRuntimeEnvelope exists for optionality.

---

# 19. Observability / audit architecture

## 19.1 Correlation anchors

Durable Conexus IDs are correlation anchors:

```text
ChangeId / CodingSessionId / WorkUnitId / ActorRunId
AgentRunId / ConversationId / ApprovalRequestId / Trigger occurrence
owner-specific Release/Effect/Promotion IDs
```

Runtime/trace/provider IDs remain observations:

```text
traceId/spanId
Mastra run/thread/toolCall refs
E2B sandbox/process refs
provider request IDs
browser/app/request IDs
```

A domain run may legitimately span `0..N` traces.

## 19.2 OpenTelemetry

OTel is preferred vendor-neutral observational plumbing where useful, not correctness authority.

A perfect single distributed trace tree is not required for Product correctness.

High-cardinality owner IDs belong mainly in traces/logs/correlation records, not default metric dimensions.

Owner IDs are not placed in OTel baggage by default because baggage can cross third-party boundaries and has no built-in authority integrity.

## 19.3 Producer trust

Current conceptual trust classes remain:

```text
HUB_AUTHORITY
GATEWAY_AUTHORITY
PROVIDER_OBSERVED
GUEST_OBSERVED
```

Transport/authenticated ingest never upgrades producer trust automatically.

## 19.4 Required verification evidence

Ordinary telemetry may degrade/sample when not correctness-critical.

If an assertion requires a class of runtime Evidence:

```text
required Evidence missing
→ NOT_PROVEN / INCONCLUSIVE
-X-> PASS
```

Package E owns deciding-evidence qualification of the current surfaces.

---

# 20. Security architecture — six logical trust zones

Trust zones are **security classifications, not required deployment units**.

## Z1 — Browser / Client

Untrusted caller even when authenticated.

Caller-provided Project/Release/role/permission/authority fields are never authority.

Control Plane, Preview and Published App browser contexts remain separate authorization surfaces.

## Z2 — Trusted Hub Control

Trusted modular-monolith owners and co-located trusted control-side runtimes.

Module boundary is not intra-process RCE isolation. Full arbitrary trusted-Hub-process compromise remains an explicitly accepted F1 residual class; normal-path least privilege still limits avoidable capability/SQL blast radius.

## Z3 — Guest Execution

Current named guest = E2B Builder sandbox/app-under-test.

Root-capable/untrusted. Receives bounded work/runtime handles only; no durable privileged credentials.

## Z4 — DEDICATED External Application

Authenticated external server-to-platform consumer under the DEDICATED profile when a real consumer exists.

Does not gain Hub internals or Connection/Git/DB credentials.

Physical deployment remains deferred until first real DEDICATED consumer.

## Z5 — External Provider / Enterprise

Model provider, E2B, Git provider, package registries, ERP/marketplace, backup targets and similar external systems.

Authenticated/TLS response is observation/data, never Hub authority merely by transport.

## Z6 — Trusted Data / Storage Infrastructure

Logical storage zone containing:

```text
hub_control
Project databases
mastra_builder
mastra_par
Artifact/Blob/CAS backing
CredentialBackend backing
backup material
```

This is not a single credential domain. Each store preserves owner-specific capabilities and lifecycle.

---

# 21. Trust crossings and egress

## 21.1 Business/application egress

```text
Published/managed app capability
Product Agent business capability
Builder governed enterprise-data capability
→ Capability Gateway
→ exact Connection / Project-data executor
```

Generated app/browser/guest never bypasses Gateway to ERP/enterprise targets.

## 21.2 Platform-control egress

Owner-specific infrastructure adapters may call their exact external providers without forcing all control traffic through Gateway:

```text
CodingRuntime → E2B
GitInfra → Git provider
Model adapter → model provider
Backup operation → backup target
admitted build/package mechanics → pinned registry/catalog target
```

Every privileged platform adapter has a named owner, owner-specific credential and server-derived/pinned destination.

Model/caller/artifact output cannot widen destination authority.

No universal privileged `fetch(url, secret)` service or egress proxy exists F1.

## 21.3 Browser egress

Browser self-only/CSP/session/request-authenticity laws remain platform-controlled. A new cross-origin browser capability is an explicit security/Product contract change, not app-config convenience.

---

# 22. Frontend / Product-shell architecture

Current paved road:

```text
React
TypeScript strict
Vite SPA
TanStack Router / Query family as admitted by current scaffold architecture
```

Frontend framework reconsideration is not open without a real failure class.

## 22.1 Workspace shell

```text
Workspace
├── Projects
├── Agents catalog
├── Brain
├── Connections
├── Members
└── Settings
```

## 22.2 Project shell

```text
Project
├── Build
├── Data
├── Capabilities
├── Integrations
├── Agents
├── Brain
├── Versions
├── Activity
└── Settings
```

Exact labels/order/components are realization decisions; the semantic surfaces are current Product architecture.

## 22.3 Build work surface

```text
Project navigation
+ Preview default/dominant
+ contextual Conexus panel
+ Preview | Code | Diff lenses
```

No second IDE/editor mutation authority is created simply to expose source.

## 22.4 Honest UI

Frontend/client cache is projection only. Product truth remains owner-derived and preserves loading/empty/failure/partial, source/freshness/coverage/provenance, approval exactness and Release/serving distinction.

---

# 23. Published Application access architecture

One Account identity is reused, but access authorities are independent:

```text
CONTROL_PLANE
!= PREVIEW
!= PUBLISHED_APP
```

Current F1 Published Application role set remains:

```text
{admin, member}
```

until a later material decision explicitly changes it.

Important:

```text
Project admin -X-> app admin automatic
app member    -X-> Builder access automatic
```

Published App authorization is server-derived; browser/frontend is never enforcement authority.

---

# 24. First-production physical topology

This is **first-installation architecture**, not universal SaaS topology.

## 24.1 Development/proving

```text
operator Windows workstation
→ Ubuntu WSL2
→ development / qualification / proving
```

WSL2 is not production authority.

## 24.2 First production failure domain

```text
existing company physical server
→ Windows host
→ one dedicated Linux production guest/VM
```

Single-host/VM/storage loss can take the entire installation down. That is accepted initially; no HA claim exists.

## 24.3 Inside Linux guest

Current baseline:

```text
one Node/TS Hub application process
├── Control Plane / L7
├── Managed Application Runtime
├── Capability Gateway
├── Builder control-side runtime
└── Production Agent Runtime

PostgreSQL cluster
├── hub_control
├── mastra_builder
├── mastra_par
└── production Project DBs

local platform backings
├── Artifact/Blob/CAS classes
└── encrypted CredentialBackend backing
```

Physical co-location does not merge owners/stores/credentials.

E2B Builder guest execution remains remote provider substrate outside this VM.

## 24.4 Private ingress

```text
inside company
→ LAN
→ HTTPS
→ Conexus

remote employee
→ existing corporate VPN
→ private company network
→ HTTPS
→ Conexus
```

```text
public Internet ingress = NONE F1
anonymous/public app access = NONE F1
remote plaintext HTTP = DENY
```

VPN is reachability, never authorization.

## 24.5 MANAGED serving

Hub/MAR serves exact active-Release bytes directly under current baseline; no standalone MAR service/CDN/load-balancer/reverse-proxy architecture is required merely for optionality.

Concrete TLS/DNS/service-manager/hypervisor/VM sizing/ports/firewall paths remain derived Realization Planning.

---

# 25. Operational resilience architecture

Current first-installation posture is intentionally bounded:

```text
single physical failure domain accepted
manual restore acceptable initially
off-host recoverable set required
restore proof required before first production
whole-Hub emergency-stop drill required before first production
no HA/automatic failover/multi-region claim
```

Owner durable facts, Git, Project DBs, Mastra stores/backings and secret-recovery material are included according to 3J-02/3J-03 recovery contracts.

3M still owns the semantic question: after interruption/restore, do existing durable facts suffice to decide what may resume/retry/reconcile without fabricated success?

---

# 26. First vertical architecture

The Budget Analyzer deliberately proves one real composition, not every platform capability.

```text
Workspace Brain
→ budget/pending/conversion semantics + caveats

Workspace Connection
→ Sankhya

Project
├── Project Baseline
├── ProjectBrainBinding
├── ProjectConnectionBinding
├── managed governed sync
├── derived analytical Project DB read model
├── registered read-only Query Capabilities
├── React application/dashboard
└── exact Release / Published App
```

Source/data path:

```text
Sankhya
→ Gateway live reads
→ Discovery / qualification / reconciliation / verification / Evidence

Sankhya
→ governed managed sync
→ Project analytical read model
→ registered Query Capabilities
→ dashboard
```

No Product Agent or business/external write is required for this vertical.

Platform default for all future Projects remains **no universal LIVE/MIRROR/HYBRID choice**; Project Baseline chooses per actual consumer.

---

# 27. Technology state matrix

These labels are deliberately different.

| Surface | Current architecture/qualification state | Notes |
|---|---|---|
| Hub | **ARCHITECTURE CURRENT** — Node/TS modular monolith | exact package/runtime composition still derived planning |
| PostgreSQL | **ARCHITECTURE CURRENT** — major 17 | Q0 deciding pin 17.10 |
| Builder runtime | **QUALIFIED for Package-A tested properties** — Mastra AgentController/CodingSession | exact current stable Q0 stack below |
| Builder E2B | **QUALIFIED WITH REQUIRED GUARD** | physical-incarnation write guard mandatory |
| Builder persistent Change thread | **QUALIFIED for A1 persistence/current-dispatch properties** | runtime state remains non-authority |
| native Codex OAuth | **QUALIFIED for Package-A tested path** | not universal model/provider winner |
| Builder Observational Memory | **EVALUATED / KEEP OFF** | net benefit not proven; no authority regression observed |
| Product Agent direct Mastra Agent | **ARCHITECTURE CURRENT / NOT YET PACKAGE-B-QUALIFIED** | R11 pauses B |
| BuilderMastra != ParMastra | **ARCHITECTURE CURRENT / SAME-PROCESS SAFETY NOT YET PACKAGE-B-QUALIFIED** | process split only on material failure |
| Conversation history memory | **ARCHITECTURE CURRENT** | advanced memory gated |
| Model spend pre-provider enforcement | **ARCHITECTURE CURRENT OBLIGATION / PACKAGE C NOT QUALIFIED** | no hidden retries below gate |
| Managed sync/job | **ARCHITECTURE CURRENT SEMANTICS / PACKAGE D NOT QUALIFIED** | pg-boss candidate only |
| pg-boss 12.26.3 | **PACKAGE D CANDIDATE / NOT AUTHORITY** | one-catch-up law must be proved |
| Deciding observability/F5 | **ARCHITECTURE CURRENT SHAPE / PACKAGE E NOT QUALIFIED** | telemetry never authority already architectural |
| React/TS/Vite/TanStack paved road | **ARCHITECTURE CURRENT** | first-build scaffold conformance still required |
| Brain | **ARCHITECTURE CURRENT** | implementation-dependent discovery/feedback/conformance probes still downstream |
| first-production Linux guest/single Hub/private HTTPS | **ARCHITECTURE CURRENT FOR FIRST INSTALLATION** | activation/restore/security proofs still required |

---

# 28. Q0 exact qualification identity currently carried

The latest-stable Package-A closure admitted:

```text
Node              = 24.18.0 probe pin
@mastra/code-sdk  = 1.1.2
@mastra/core      = 1.56.0
@mastra/memory    = 1.25.0
@mastra/pg        = 1.19.0
@mastra/e2b       = 0.8.0
e2b SDK           = 2.40.0
PostgreSQL        = 17.10 probe pin
package-lock SHA-256
= 7f61c6c74ad92b23abd0fb44353bc63f444ab01dd3b62d23cec7d7de4b1051d5
```

These are **deciding Evidence identities**, not a policy to follow `latest`. Any later version drift must be explicitly repinned and only affected criteria requalified.

Known malicious Mastra package families/versions remain denied by Q0/C-016 supply-chain admission.

---

# 29. 3L remaining qualification route

R11 does not change the serial technology-proof dependency; it pauses progression only to reconcile authority.

After R11 final ratification:

```text
rederive Package B from current canonical baseline
↓
Package B — Product Agent + Cross-Runtime
  CX-AGENT-MASTRA-01
  CX-RUNTIME-ISOLATION-01
↓ adjudicate
Package C — Model Economics / Enforcement
↓ adjudicate
Package D — Managed Execution
  includes CX-MANAGED-JOB-01
↓ adjudicate
Package E — Deciding Evidence
↓ adjudicate + completeness/deletion check
ONE final independent Fable review of complete 3L
↓
3L closure
```

No package starts merely because the prior package claimed success; deciding Evidence must be read/adjudicated.

---

# 30. Downstream proof families not pulled into 3L prematurely

Some architecture properties require an actual Product slice to instantiate their full mechanism. They remain mandatory first-build conformance, not fake 3L tests over absent Product code.

Current examples include families for:

```text
Brain discovery/feedback/conformance
scaffold/codegen/frontend contract/security invariants
Observability/audit/redaction/GC Product paths
Release/Promotion/serving conformance
Published App authorization/session/browser security
supply-chain/dependency admission
Connection/Gateway effect and egress properties
first-production restore/emergency-stop/activation properties
first vertical source/read-model reconciliation
```

Exact probe IDs/criteria remain in their accepted source decisions and 3A-R10 proof map.

A future Realization Plan must compile these into the first slice that can actually falsify the property; it may not delete them because they were not executed during architecture-only 3L.

---

# 31. Explicit future seams / no dormant machinery

The architecture preserves, without implementing now:

```text
SaaS onboarding/billing/customer operations
multi-repo Project
cross-Workspace sharing/exchange
DEDICATED physical deployment
stronger HA/PITR/multi-host topology
external SLA monitoring
advanced Product Agent memory
EVENT triggers
Durable Agent reconnect semantics
Agent-as-tool/subagents/agent networks
MCP/A2A/external clients
Product Agent browser/workspace/source access
Connection pools/failover
external Vault/KMS/HSM/per-secret envelope
SSO/SCIM/passkeys
public/embed Published Apps
richer app roles/data-scoping
Brain vector/RAG index
```

No empty module/table/service/registry/engine is created merely to reserve these futures.

---

# 32. Explicit F1 architecture rejects

```text
microservices/service split by aesthetic preference
Kubernetes/service mesh
shared broad Hub DB login
RLS as universal permission engine
generic SecretService
generic BudgetService/quota engine
generic Workflow/Automation/Scheduler domain
generic RuntimeBus/EventBus/UniversalRuntimeEnvelope
generic Tool registry competing with owners
generic ResourceBinding engine
cross-Project mutable DB/runtime access
Product Agent Stored/Editor/latest authority
memory framework as Brain authority
browser/frontend authorization authority
guest durable/model-provider credentials
public Internet first-installation ingress
multiple production coding runtimes for optionality
per-WorkUnit forced cognitive reset
```

---

# 33. Cross-component failure/recovery invariants carried into 3M

R11-D does not solve 3M, but the following durable rules constrain it:

1. owner truth survives runtime/process restart where the capability requires recoverability;
2. runtime snapshot without owner authority never authorizes continuation;
3. current authorization is rechecked on protected re-entry;
4. model spend survives restart/resume through owner facts;
5. effect ambiguity does not become retry permission;
6. Promotion/Release history remains immutable; current serving authority is explicit;
7. Builder physical sandbox recreation never implies write-lineage continuity;
8. Mastra thread/trace continuity is not domain-run continuity;
9. missing required Evidence yields NOT_PROVEN, not reconstructed success;
10. backup/restore cannot fabricate newer semantic truth than recovered owners establish.

3M must test whether the current durable fact set is sufficient to satisfy these laws without inventing a generic recovery engine.

---

# 34. Architecture Verification invariants carried into 3N/3O

Future whole-architecture verification/proof must be able to show at least:

```text
Workspace isolation cannot be bypassed through Project/DB/runtime shortcuts
Project Baseline materially constrains coding execution
Builder runtime state cannot close Change authority
E2B physical-incarnation guard fires on cross-incarnation write risk
Brain binding does not silently follow new Brain revision
Connection binding cannot be replaced by caller/model choice
Gateway effect replay remains owner-safe under duplicate/lost response
Product Agent executes exact old Release pins across suspension/restart
Builder and PAR runtime roles do not leak mutable state/capability into each other
RequestContext stale state cannot resurrect authority
model provider call cannot occur without owner spend reservation
managed sync cannot replay every missed downtime slot
telemetry cannot manufacture F5/terminal truth
Published App authority remains separate from Control Plane
Release AVAILABLE/pointer swap cannot masquerade as SERVED_VERIFIED
first vertical read model cannot prove itself or fabricate unsupported semantics
```

3O must later define the contract-only vertical proof target; this baseline does not pre-implement that proof.

---

# 35. Reopen triggers by architecture family

| Family | Material reopen trigger examples |
|---|---|
| Hub modular monolith | real isolation/scale/availability constraint that cannot be satisfied inside current boundaries |
| Builder Mastra | Package/current implementation proves structural authority/correctness failure behind narrow runtime seam |
| E2B | physical/network/custody failure cannot be guarded proportionally or provider ceases satisfying required substrate properties |
| same-process Builder/PAR | Package B proves enabled F1 process-global mutable state cannot be partitioned/fenced |
| Product Agent direct Mastra | qualification proves direct Agent cannot preserve exact pins/suspension/approval/Gateway safety |
| PostgreSQL 17 | support/security/feature requirement or actual implementation Evidence invalidates current major baseline |
| owner-scoped DB capability | accepted cross-owner atomicity/operational need cannot be expressed without violating current negative property |
| Gateway | new effect/integration class cannot preserve current exact owner/effect/credential boundary |
| Brain | independent lifecycle/trust/scale consumer proves one canonical Workspace Brain no longer sufficient |
| Release | real consumer requires composition/version/cutover semantics current model cannot represent |
| MAR/jobs | real deterministic workflow requires stronger execution semantics beyond managed sync current seam |
| first-production topology | company server unsuitable, RPO/RTO/availability/public consumer/compliance/DEDICATED consumer requires new placement |
| Published App access | real business audience/role/data-scope requirements exceed current closed F1 role model |
| Product Agent memory/tools | named Product Agent consumer needs advanced memory/browser/source/workspace/tool family with acceptable trust/qualification |

Framework popularity, “newer” version or hypothetical scale alone is not material Evidence.

---

# 36. R11-D candidate completeness

```text
Product contract mapped to owners                       = YES
module/authority boundaries represented                 = YES
persistence authorities represented                     = YES
Builder runtime current generation represented          = YES
E2B mandatory guard represented                         = YES
Registry/Release composition represented                = YES
Connections/Gateway/credentials represented             = YES
Brain represented                                       = YES
Product Agent runtime represented                       = YES
Builder/PAR isolation represented                       = YES
managed app/job represented                             = YES
model spend represented                                 = YES
F5 vs telemetry represented                             = YES
six trust zones represented                             = YES
frontend/Product shell represented                      = YES
first-production physical topology represented          = YES
first vertical represented                              = YES
technology qualification matrix explicit                = YES
future seams / F1 rejects explicit                      = YES
3M/3N/3O obligations preserved                          = YES
unqualified technology mislabeled qualified             = NO INTENT
new domain/module/DB/workflow introduced                 = NO
```

---

# 37. Authority provenance

This candidate is derived principally from:

```text
3A-R5  Builder/Coding Runtime Reassessment
3A-R6  Critical Path / Implementation Readiness
3A-R7  Platform Consultant Ownership
3A-R8  Project Baseline / Change Engineering
3A-R9  Managed Job / Deterministic Sync
3A-R10 Pre-Implementation Convergence / Realization Routing
3B     System Context & Boundaries
3C-R1  Domain/Module closure
3D-R1  Dependency closure
3E-R1  Data closure
3F-R1  Contracts/API closure
3G-R1  Behavioral/State closure
3H-01  Builder Runtime Realization
3H-02  Product Agent Runtime Realization
3H-03  Runtime Isolation / F5 / Observability
3H-R1  Runtime closure
3I-01  Current authorization/revocation
3I-02  Credential/capability custody
3I-03  Model spend
3I-04  DEDICATED trusted exchange
3I-05  Trust zones / Hub DB least privilege
3I-R1  Security closure
3J-01  First-production topology
3J-02  Backup/restore
3J-03  Platform lifecycle/emergency stop
3J-R1  Deployment/operations closure
3K-01..04 + 3K-R1 Product architecture
3L-Q0 Qualification Manifest
3L-A Package A deciding Evidence
R11-A census / completion
R11-B candidate Decision Reconciliation
R11-C candidate Product Contract
```

Detailed accepted semantic homes remain controlling until R11 final ratification rewires discovery.

---

# 38. Exact next action

> **R11-E — perform a whole-product scenario/global-coherence pass across `PRODUCT-CONTRACT.md`, `ARCHITECTURE-BASELINE.md`, `DECISION-RECONCILIATION.md` and the detailed accepted authority. Attack omissions, false supersession, duplicate/missing authority, Product↔architecture mismatch, future seams accidentally erased or implemented, and qualification status overstatement before any document can become current authority.**
