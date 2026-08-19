# Conexus — Current Architecture Baseline

> **Status:** CURRENT / ACCEPTED BY 3A-R11 OPERATOR RATIFICATION\
> **Parent checkpoint:** `3A-R11 — CLOSED / APPROVED`
> **R11-H:** APPROVED / OPERATOR RATIFIED 2026-08-18
> **Product meaning:** [PRODUCT-CONTRACT.md](PRODUCT-CONTRACT.md) — current accepted projection
> **Decision routing:** [DECISION-RECONCILIATION.md](DECISION-RECONCILIATION.md) — current accepted reconciliation
> **Method:** DevelopmentConexus Engineering Method v1.0.0  
> **Implementation:** BLOCKED  
> **C-018:** NOT YET RATIFIED  
> **Package B:** STOPPED AT BT-3 / BT-1 PASS / BT-2 PASS / BT-3 FAIL_REALIZATION / BT-4..BT-5 NOT EXECUTED / LEAD ADJUDICATION REQUIRED

This current accepted authority projection answers:

> **How is the currently accepted Conexus Product structurally divided, where does authority live, which mechanisms currently realize each boundary, what has actually been qualified, what remains qualification-pending, and which future seams are deliberately preserved without becoming F1 machinery?**

This is a current-state architecture projection, not a second detailed architecture. Exact semantic authority remains in accepted 3B–3K documents; deciding technology proof remains in 3L Evidence. If this projection conflicts with an accepted detailed home, this projection is defective unless a material Finding explicitly reopens that authority.

---

# 1. Architecture in one sentence

Conexus F1 is a **Node/TypeScript modular-monolith Hub with PostgreSQL-backed authoritative control state**, Project-owned Git/business-data/Release lifecycles, a separate Workspace Brain Git authority, Connections-module-owned Workspace- or Project-scoped Connections, a Hub-owned Capability Gateway for governed data/effects/credential last-mile, a **Mastra AgentController + E2B Builder runtime** for Project Changes, a **direct Mastra Agent Production Agent Runtime (PAR)** derived from exact Releases, a bounded Managed Application Runtime for Project apps/jobs, and an agent-first React/TypeScript/Vite/TanStack Product shell; every runtime/provider/storage mechanism remains subordinate to Conexus owner facts, current authorization and exact immutable composition.

---

# 2. Structural laws

```text
one semantic authority per meaning
mechanism != authority
current implementation != target authority by existence
Workspace = sovereign isolation root
Project = independent software/product lifecycle unit
Change != WorkUnit != Builder ActorRun
Builder ActorRun != Product AgentRun != Gateway EffectAttempt != Promotion
Project Git != Workspace Brain Git != Hub control truth != Project business DB != Registry/CAS serving output
Workspace owns the canonical Brain; Connections owns one Connection lifecycle with
ownerScope WORKSPACE | PROJECT; Project use requires explicit exact-revision binding
same Workspace != implicit resource-use authority
same bytes/digest != same semantic identity/authorization
Control Plane != Preview != Published App authorization
administer != use
current mutable authorization is server-derived and rechecked at protected control points
runtime/provider/trace/telemetry identity != Conexus authority/principal
Gateway = business/application effect + credential-last-mile/replay authority
approval binds one exact sealed subject and never widens it
unknown/missing/partial != zero/success
OUTCOME_UNKNOWN never grants blind automatic replay
Release/composition is immutable and never resolved by mutable latest
AVAILABLE != PROMOTED != SERVED_VERIFIED
telemetry/observation != owner F5/terminal truth
Brain != agent/runtime memory
future seam != dormant implementation
selected/current architecture != qualified behavior
review finding != requirement authority
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
│ Identity & Access      Workspace               Project              │
│        │                   │                      │                 │
│        ├──────────── current authority ──────────┤                 │
│        │                   │                      │                 │
│ Builder              Artifact Registry         Release              │
│    │                       │                      │                 │
│ Connections ───── Capability Gateway ───────── external I/O         │
│    │                                                              │
│ Brain                Observability & Audit                         │
│                                                                    │
│ Production Agent Runtime          Managed Application Runtime       │
└───────────────┬──────────────────────────────┬─────────────────────┘
                │                              │
                │ control-side                 │ exact active Release
                ▼                              ▼
       ┌────────────────────┐          ┌──────────────────────┐
       │ BuilderMastra      │          │ Published Apps /     │
       │ AgentController    │          │ managed job runtime  │
       │ CodingSession      │          └──────────────────────┘
       │ Workspace          │
       └─────────┬──────────┘
                 │
                 ▼
          ┌─────────────┐
          │ E2B sandbox │
          │ guest/root  │
          └─────────────┘

Product Agent control-side path:

exact active Release
→ RuntimeAgentProjection
→ ParMastra role instance
→ direct Mastra Agent
→ bounded ToolProjection
→ Conexus owners / Gateway
```

The diagram is logical. A module box does not imply a separate service/process/database. Physical first-production placement is defined later.

---

# 4. Semantic owner/module architecture

F1 is a modular monolith with explicit semantic owners:

| Owner/module | Owns | Explicitly does not own |
|---|---|---|
| **Identity & Access** | Account identity/auth/session, memberships, grants, role assignments, effective surface access context | domain preconditions, external effects, Release eligibility, business-data truth |
| **Workspace** | Workspace, Area, organizational structure/lifecycle | Account identity, Project internals, Brain semantic content, Connection credentials |
| **Project** | Project identity/lifecycle, Project Baseline, explicit Brain/Connection binding intent, Project-level composition intent | Workspace resources themselves, runtime implementation, external effect authority |
| **Builder** | Change, Plan/current plan items, WorkUnit, Builder ActorRun, checkpoints/correctness coordination, Findings/routing, CodingSession relationship | Project business authority, PAR runtime truth, provider/runtime authority |
| **Artifact Registry** | immutable compiled ArtifactRevision identity/digest/payload/availability | authored Git truth, active serving, business meaning of each artifact kind |
| **Connections** | one Connection logical lifecycle with `ownerScope = WORKSPACE | PROJECT`, qualification/current logical credential relationship | plaintext/ciphertext secret-byte ownership, external effect execution, cross-Workspace use |
| **Capability Gateway** | governed Query/Action/Integration execution, effect admission/replay/idempotency, credential last-mile, execution receipts | Project/Brain meaning, Account identity, Product Agent lifecycle, model-spend authority |
| **Brain** | Workspace `SEMANTIC | KNOWLEDGE | EVIDENCE_SPEC` meaning, validation/compilation/publication, Discovery proposal semantics, KnowledgeProposal, health/conformance | actual Builder/verification Evidence, RAG/index, agent memory, Project DB, telemetry, security policy |
| **Production Agent Runtime (PAR)** | Conversation, Product AgentRun, ApprovalRequest, AgentTrigger runtime semantics, exact-projection execution/terminal owner facts | Agent authored source/Release authority, Gateway effect replay, I&A authority |
| **Release** | exact immutable Project composition, Release/Promotion/current serving authority | authored source, mutable framework state, Project business data |
| **Observability & Audit** | authorized audit facts and operational observations/provenance projections | business-state reconstruction from logs, authorization, owner F5 terminal truth |
| **Attachments & Blob** | shared byte/storage mechanics and attachment semantics where owner contracts admit them | semantic identity/authorization of every owner referencing the bytes |
| **Managed Application Runtime (MAR)** | managed app serving mechanics and admitted job occurrences | Product business meaning, scheduler business authority, arbitrary privileged Project code |

No generic `Workflow`, `Tool`, `ResourceBinding`, `Secret`, `Budget`, `Status`, `Runtime`, `EvidenceGraph` or `Automation` business owner exists simply for uniformity.

## 4.1 Closed dependency architecture

The modular-monolith import graph is acyclic. Narrow direct in-process calls are the default; a module or runtime may not call L7, and L7 is not a universal mediator.

The closed F1 L7 control-plane orchestration set contains exactly seven flows:

```text
CreateProject
SetProjectBinding
QualifyConnection
InceptionInvestigation
BrainHealthProbe
ComposeRelease
PromoteRelease
```

There is exactly one domain dependency inversion: Gateway defines the narrow approval-claim capability, PAR owns `ApprovalRequest` and implements that capability, and the composition root wires it. The 3D infrastructure boundaries are exactly `CodingRuntime`, `CredentialBackend`, `BlobStore/CAS` and `GitInfra`.

The later 3A-R9 `MANAGED_JOB` addition is a Gateway caller-surface amendment, not an eighth L7 orchestration flow.

---

# 5. Durable authority and storage boundaries

## 5.1 Project Git

Canonical authored **Project-scoped** content includes, according to the Project Baseline and artifact kind:

```text
Project Baseline readable source
application/frontend/backend source
artifact source definitions
agent/v1 definitions
ProjectBrainBinding + Project-local refinements/overrides
ProjectConnectionBinding declarations
migrations
config schema/contracts
verification/test assets
tasks.md purpose/context memory
```

Project Git is authoring/provenance truth. It is not current authorization, runtime or serving truth.

## 5.2 Workspace Brain Git

Canonical published Brain source lives in a **Workspace/group-scoped Git tree/repository independent from the first Project repo**.

```text
Workspace Brain Git
→ BrainDefinition published source
→ semantic/knowledge/evidence-spec source material
→ publication history
```

A Project repo pins/binds/refines/overrides according to Brain rules; it does not become the canonical Workspace Brain source by being the first consumer.

This separation prevents Project-local implementation from silently becoming company-level meaning.

## 5.3 `hub_control` PostgreSQL

Authoritative Hub operational/domain truth for current owners such as:

```text
Identity & Access
Workspace
Project
Builder Change/Plan/WorkUnit/ActorRun/Findings
Artifact Registry metadata
Connections logical state/qualification
Gateway effect/current counters/receipts
Brain operational proposals/health overlays
PAR owner facts
Release/Promotion/current serving state
Observability/Audit records
MAR job-run occurrence facts
```

Exact table/column spellings belong post-C-018 derived Realization Planning. Logical owner schemas/capabilities remain explicit.

## 5.4 Project Database

Project-owned business/application data:

```text
Project-native business state
derived analytical/read-model state
Project-owned migrations
```

Project DB is not Hub control authority, Brain semantic authority or proof that an external source was synchronized correctly.

Persistent DEV/PROD databases exist where the Project needs them. Validation databases are ephemeral proof fixtures, not a permanent third business environment by default.

## 5.5 `mastra_builder`

Builder Mastra substrate persistence only:

```text
stored coding thread/runtime mechanics
AgentController/session substrate state
runtime continuation mechanics
```

Never Change/Plan/WorkUnit/ActorRun/correctness authority.

## 5.6 `mastra_par`

Product Agent Mastra substrate persistence only:

```text
thread/message history
suspension/checkpoint mechanics
runtime state needed to resume exact Agent execution
```

Never current Release/permission/approval/AgentRun terminal/Gateway effect authority.

## 5.7 Artifact/Blob/CAS backing

Digest-addressed/immutable byte storage/serving mechanics according to owner contracts.

```text
same bytes/digest
!= same semantic identity
!= same authorization
```

Storage/provider path/key/prefix is never Product authority.

## 5.8 CredentialBackend backing

Opaque encrypted secret-byte/crypto mechanism behind the narrow `CredentialBackend` boundary.

Connections owns logical credential handles/grant facts; Gateway receives plaintext only at trusted last-mile use. CredentialBackend is not a generic Secret domain.

Outside the trusted Hub boundary, no single compromise path/location/credential may yield both the Connection ciphertext backup set and root/recovery-key material. F1 transient acquired tokens are memory-only; no durable transient-token cache is admitted.

## 5.9 Backup material

Operational recovery state, not current application authority while the system is running. Recovery may reconstruct durable owner truth; it may not fabricate newer/cleaner semantic truth than recovered Evidence establishes.

---

# 6. PostgreSQL and least-privilege architecture

## 6.1 Version baseline

```text
architecture major = PostgreSQL 17
Q0 deciding probe minor = PostgreSQL 17.10
```

PG17 is current architecture. The 17.10 minor is deciding Evidence identity, not a permanent ban on later supported 17.x under accepted repin/requalification.

## 6.2 Owner-scoped Hub capabilities

Normal owner persistence must satisfy the negative property:

```text
owner A arbitrary SQL
-X-> owner B schema
-X-> SET ROLE into unrelated owner authority
-X-> object-owner / superuser / BYPASSRLS authority
```

The F1 cross-owner domain atomicity set is closed:

```text
1. CreateProject     → prj + iam initial grant
2. effect admission → gw + par approval claim
```

Audit-required same-transaction paths receive only the narrow append capability needed for `obs.audit_record`; they do not gain OBS read/update/delete authority. No generic cross-owner UnitOfWork exists.

Migration/provisioning/backup credentials with broader operational power remain separate from normal request/runtime roles.

## 6.3 Physical-store capability matrix

```text
hub owner credential
-X-> mastra_builder
-X-> mastra_par
-X-> Project DB by default

mastra_builder
-X-> hub_control / mastra_par / Project DB

mastra_par
-X-> hub_control / mastra_builder / Project DB

Project query/action/migrator role
-X-> hub_control / Mastra stores / another Project DB
```

Physical co-location never weakens the matrix.

RLS is not a universal Role/Area/permission engine. Canonical current authorization remains application/domain authority.

## 6.4 CR-1 — current-authority serialization × owner isolation

A security-sensitive mutation that consumes mutable authority owned elsewhere must conflict/serialize with concurrent revoke/narrow through the protected commit:

```text
stale authority pre-read + concurrent revoke/narrow
-X-> protected mutation commits
```

The same realization must preserve owner-scoped persistence: the consuming owner cannot directly read/write/lock unrelated `iam` state, `SET ROLE` into another owner or use a broad umbrella role. 3N/3O must prove both sides together; the exact primitive remains derived Realization Planning.

## 6.5 Closed F1 data inventory

`hub_control` has exactly 13 owner schemas:

```text
iam ws prj bld reg con gw brn par rel mar obs att
```

The F1 durable inventory is closed at 46 record classes, and the Tier-2 structural cross-module FK allowlist is closed at exactly 16. Tier-3 semantic references/digests are the default for non-structural cross-owner references. There is no shared/common schema, and a mutable current-state mirror of another owner is forbidden.

The exact 46-class inventory and 16-FK allowlist live in 3E-02. A new durable class or Tier-2 FK requires the Decision Loop/material Finding; this projection does not reproduce those full lists.

---

# 7. Workspace / Project / Baseline architecture

## 7.1 Workspace

Visible tenant/isolation root:

```text
Workspace
├── Projects
├── access-filtered Agents catalog
├── Brain
├── Connections
├── Members / Areas
└── Settings
```

No hidden/default Workspace is invented to simplify implementation.

## 7.2 Project

Independent Product/software lifecycle unit:

```text
Project
├── Baseline
├── source repository
├── Changes / Plan
├── Data
├── Capabilities
├── Integration bindings
├── Brain binding
├── Product Agents
├── managed jobs when required
├── Releases / Versions
└── Published Application
```

F1 = one canonical source repo per Project.

For every software-publishing Project, the approved Baseline carries the closed F1 fact:

```text
ApplicationRuntimeProfile = MANAGED | DEDICATED
```

Both profiles share Project/Change/Builder/verification/Release and semantic contracts inside one Factory. `MANAGED` is realized by the Managed Application Runtime. `DEDICATED` may own its independently executable runtime/data plane and Product-specific network behavior; Gateway-only is the Conexus-governed capability boundary, not a universal DEDICATED network stack. Conexus-owned capabilities require explicit binding/Platform Service, with no inherited Connection/Hub/Vault credential. Profile choice is material Baseline authority; there is no automatic conversion, plugin registry or second Factory. The DEDICATED semantic/trust contract is current while physical deployment remains deferred to its first real deployment.

## 7.3 Project Baseline

```text
SPEC-ANCHORED
LIVING
INCREMENTAL
```

Readable specification in Git; Hub pins exact approved revision/digest.

```text
ProjectBaselineDigest
+ exact Change/current contract pins
→ execution/proof identity
```

A material Project-level meaning change discovered during coding stops execution before the actor silently crosses the prior Baseline.

## 7.4 Cross-Project reuse

Default:

```text
Project A DB/source/runtime
-X-> Project B direct mutable access
```

Current reuse seams:

```text
published Platform machinery
Workspace Brain + explicit ProjectBrainBinding
Workspace-scoped Connection + explicit ProjectConnectionBinding
```

Small duplication is preferred to premature shared mutable authority.

---

# 8. Plan, checklist and durable purpose memory

## 8.1 Visual Plan

For Changes whose planning depth warrants explicit decomposition, Builder produces an approvable Plan whose current representation can expose:

```text
Work Units / work items
dependency graph
acceptance/assertion links
known blockers/unknowns
current progress
```

The Plan is derived from current accepted Project/Change authority. Planning depth and execution rigor remain independent dimensions.

## 8.2 Hub-owned live checklist

Model/worker proposes transitions; Hub owns application of current state:

```text
plan.item.proposed / start_requested / complete_requested / blocked
→ Hub validates expected current revision/state
→ Hub writes started/completed/blocked/interrupted facts
→ UI projects current truth
```

Arbitrary JSON Patch or model prose does not command the state machine.

Worker/runtime death must produce an honest interrupted/recoverable state rather than leaving UI falsely green.

## 8.3 `tasks.md`

`tasks.md` is Project-Git **purpose/context memory**:

```text
what we are building
why
what remains
known limitations
root-cause/correction notes
```

It is not operational state authority.

At SHARE, a fenced structured status block **must** be checked mechanically against the Hub-owned `planRevision` and current item state. A stale revision or incompatible `statusCode` fails closed. Free prose remains context, not state authority.

## 8.4 Acceptance completeness

Material delivery closes only against accepted criteria/assertions and known limitations. “No Finding” or “agent says complete” is not acceptance.

## 8.5 `PlanningDepth` × `RigorProfile`

```text
PlanningDepth = DIRECT | LIGHT | FULL
RigorProfile  = FAST | BOUNDED | CONTROLLED
```

The axes are orthogonal: `DIRECT + CONTROLLED` and `FULL + BOUNDED` are valid. Human checkpoint/Change authority fixes the `PlanningDepth` floor; system/operator elevation is allowed, but runtime downgrade is not. `RigorProfile` is the maximum calculated from declared effect/authority risk, detected diff/artifact risk and environment risk; unknown never lowers it. Dispatch requires both the planning and rigor gates to pass.

No 3×3 policy matrix, `PlanningEngine`, LOC score or LLM-authoritative classifier is admitted.

---

# 9. Builder runtime architecture

## 9.1 Current execution line

```text
Project
→ Change
→ Builder authority
→ CodingWorkerRuntime boundary
→ Mastra AgentController
→ Change-scoped CodingSession
→ BuilderMastra / mastra_builder
→ Mastra Workspace
→ E2B
```

Pi is not primary F1 Builder. It remains fallback/challenger only if current qualification exposes a structural failure not repairable through the narrow runtime seam.

## 9.2 Cognitive and durable identity

```text
Change lifetime
!= CodingSession mechanics lifetime
!= WorkUnit lifetime
!= ActorRun lifetime
!= physical sandbox lifetime
```

Baseline:

```text
one persistent CodingSession per Change
persistent thread = ON
Builder Observational Memory = OFF
Project hidden memory = OFF
```

WorkUnits/ActorRuns remain bounded/auditable; they do not force cognitive reset.

New session is appropriate for a new Change, independent material verification, material rebaseline or concrete contamination/isolation reason.

## 9.3 Hub remains authority

Mastra owns coding mechanics; Conexus owns:

```text
Change identity/correctness
accepted Plan/checkpoints
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

## 9.4 Re-entry/currentness

Every ActorRun/rebind re-applies current/pinned owner authority mechanically. Runtime continuity never authorizes itself.

Conceptual source lineage is explicit:

```text
FRESH_BASE
CONTINUE_LINEAGE
```

### 9.4.1 Immutable lineage admission

Every write-capable ActorRun receives one immutable admission disposition. `CONTINUE_LINEAGE` requires current compatibility, verified physical continuity, established quiescence and no material contamination:

```text
FAILED alone                         -X-> authorize reuse
FAILED + positively admitted basis   → continuation may be admitted
CANCELLED predecessor                → explicit applicable-authority admission required
unknown/orphan basis                 → FRESH_BASE
```

If an admitted continuation later fails binding/quiescence/continuity gates, that ActorRun aborts or terminalizes with the typed basis; it never silently downgrades to `FRESH_BASE`. A later successor may receive a fresh admission.

### 9.4.2 Output custody and cancellation truth

```text
runtime output X
→ Hub-side durable custody + exact identity verification
→ only then producedOutputRef/presentation authority

Builder commits ActorRun CANCELLED
→ best-effort physical abort/inspection
→ late output/snapshot is telemetry/quarantine only and never regains authority
```

## 9.5 E2B substrate

```text
Mastra Workspace
→ @mastra/e2b
→ E2B physical sandbox
```

Guest/root-capable execution only; never durable Product/control truth.

### Required physical-incarnation guard

Package A found that stock E2B write retry could cross from a dead physical sandbox to a replacement before Conexus regained control.

Required F1 property:

```text
write bound to exact observed physical sandboxId/incarnation
→ incarnation dies
→ operation fails
→ no silent replay on replacement
→ lineage quarantined/rebound only through explicit owner path
```

Status:

```text
E2B = QUALIFIED WITH REQUIRED PHYSICAL-INCARNATION GUARD
```

The qualification spike API/class is not Product architecture; semantically equivalent protection is mandatory.

## 9.6 Builder credentials

E2B guest never receives by inheritance:

```text
Hub DB credential
Project authoritative DB credential
Connection/ERP credential
CredentialBackend/root material
Git remote write credential
model-provider credential
backup credential
DEDICATED private key
```

Model-provider calls are control-side. Historical guest LLM provider key is deleted.

Any guest-readable capability is Hub-minted, bound to exact Project/ActorRun/consumer/scope, bounded, server-expiring and server-revocable with current validation on every use. The guest cannot mint, refresh or widen it; E2B pause/resume never preserves authority after server expiry/revocation.

## 9.7 Material verifier independence

Material verification requires both fresh cognition and fresh candidate materialization:

```text
exact candidate X under Hub custody
→ fresh verifier context
+ fresh independent materialization of X
→ verifier report binds exact X
```

The verifier cannot run against the implementer's live mutable lineage or mutate it.

---

# 10. Git / Change result model

Current C-014/C-017 Git law survives the move from fresh Pi workers to persistent CodingSession:

```text
logical branch per Change
→ successive bounded Work Units contribute result commits
→ Hub owns remote push/integration authority
```

Worker/agent may create temporary local commits inside isolated working state. The durable SHARE/result contract yields **one canonical result commit per bounded WorkUnit** tied to the ActorRun/result lineage.

Normal integration:

```text
no force push
no hidden rebase rewriting accepted lineage
merge conflict
→ explicit resolution / business-owner question where meaning is ambiguous
```

This law governs durable result identity; it does not imply a fresh cognitive session per WorkUnit.

---

# 11. Artifact Registry architecture

## 11.1 Authoring vs immutable revision

```text
authorized Git source
→ validate/compile
→ immutable ArtifactRevision
→ exact digest/payload
→ AVAILABLE
```

Registry availability is not Project active use.

Stable human/project references use semantic slugs/names where the contract requires them; arbitrary numeric persistence IDs do not become Product-level artifact identity.

Artifact kinds keep owner-specific meaning. Common storage/compilation does not create a Universal Artifact business owner.

## 11.2 Build-time vs runtime authority

Privileged build/migration/provisioning mechanics remain distinct from restricted runtime execution. Runtime executes exact admitted compiled capabilities; it does not inherit build-time DDL/provisioning authority.

## 11.3 SQL and parameters

Where SQL artifacts exist, input schema validation and real bind parameters remain mandatory. Runtime string interpolation is not an admitted parameter mechanism.

---

# 12. Release and Promotion architecture

## 12.1 ReleaseManifest = exact composition root

Current Release composition is one immutable closure over the Product facts needed by serving/runtime, for example:

```text
source commit/tree/bundle identities
frontend/runtime-contract digests
registry artifact set / exact artifact revisions
agent revision + model/tool/context/policy pins where applicable
Brain revision + ProjectBrainBinding
ProjectConnectionBinding / qualified Connection revision
migration head + schema fingerprint + PG major
configContractDigest
lockfile/dependency digest
verification/validation Evidence digest
provenance / run identities
```

Exact schema spelling belongs Realization Planning, but the composition-root law is current.

```text
source/build/evidence digests close first
→ canonical ReleaseManifest closes over them
→ external attestations may reference the closed digest
```

No circular “manifest writes itself into source it hashes” design.

## 12.2 Three separate histories

```text
operational/run detail
!= Git source/change history
!= user-visible Release/Version history
```

## 12.3 Candidate/release vs promotion/environment state

These are separate planes, not one generic Status FSM.

Conceptual current candidate/release lifecycle:

```text
BUILDING
→ VERIFIED
→ AVAILABLE
terminal rejection/invalidity where applicable
```

Conceptual target-environment promotion progression includes:

```text
APPROVED
→ CONFORMANCE_CHECKED
→ migration/recovery branch when required
→ POINTER_SWAPPED
→ SERVED_VERIFIED
```

Material failures remain explicit, such as conformance failure, migration failure, CAS conflict and served-digest verification failure.

`DRIFT`, `STALE` and schema-rollback ineligibility are orthogonal blocking conditions, not proof of success.

## 12.4 CAS / expected state

Promotion pointer changes use expected current generation/pointer semantics. Conflict never force-writes over a new current state; candidate must revalidate/reconcile against the new state.

## 12.5 Serving verification

Pointer swap is not completion.

```text
real serving path GET/read
+ served revision/runtime/frontend digest == expected exact Release
→ SERVED_VERIFIED
```

HTTP 200 from stale content is not success.

## 12.6 Current proof and Promotion concurrency

```text
change_acceptance/current proof
→ rechecked at ComposeRelease
→ rechecked immediately before material Promotion steps
→ stale/inadmissible proof refuses progression without rewriting history
```

F1 admits at most one non-terminal Promotion per `(Project, PROD)`. Admission must use a conflicting Release-owner guard; the concurrent loser performs zero DDL, drain or other material step. This is refusal, not a Promotion queue/lease.

## 12.7 Maintenance and post-serving truth

Once a maintenance-required transition makes old serving incompatible, its serving-block survives Promotion failure/terminalization. Closing a Promotion never silently re-enables the old Release; exit remains forward-fix, validated restore or safe recovery Promotion.

Governance/proof drift after `SERVED_VERIFIED` does not automatically deactivate or rewrite the active pointer. Current security/health/owner gates may still narrow individual operations, and future Promotion uses current proof.

---

# 13. Environment architecture

Current environment classes are deliberately bounded:

```text
BuildValidationDatabase   ephemeral proof fixture
workspace DEV             persistent Project development business DB when needed
RunPreview                ephemeral authenticated candidate serving
PROD                      persistent production environment of the SAME Project
```

No permanent generic staging environment F1.

## 13.1 PROD is not a forked logical Project

PROD is the same Project under separate environment/database/current Release authority.

A production Project DB is isolated from DEV by connection/roles and is provisioned lazily on the first Promotion under the C-014 `PROVISIONING → READY | PROVISION_FAILED` semantics; partial/orphan provisioning is reconciled rather than treated as ready.

## 13.2 Environment ↔ Connection binding

Environment use of external systems is explicit. PROD does not silently use a sandbox Connection and DEV/Preview do not silently use production Connection merely because the provider is the same.

---

# 14. EnvironmentConformance

Promotion measures the **real target**, not just source files.

Current conformance properties include, where applicable:

```text
PostgreSQL major/extensions
current DB role + prohibited privilege checks
owner grants / least privilege
migration ledger + checksums
schemaFingerprint real target
required config bindings resolvable
exact pinned Connection revision == exact active revision in target environment
current Release pointer / expected generation
served digest after switch
```

Schema fingerprint is a deterministic versioned catalog representation; privilege/extension/PG-major checks remain separate proofs rather than being hidden inside one fingerprint.

Material divergence:

```text
DRIFT
→ STOP / reconcile
-X-> apply the rest and hope
```

---

# 15. Config identity and secret rotation

Two independent axes:

## 15.1 `configContractDigest`

Part of Release identity: slots/semantics/scope/type/non-secret values and exact logical environment bindings needed by the Product.

Functional config-contract change makes the candidate stale/requires governed revalidation/Release treatment.

## 15.2 Secret material

Outside Release identity:

```text
slot/credential handle
→ secretVersion / cryptoKeyVersion / token generation
```

Compatible secret rotation may change value/version without rebuilding the Product Release. Secret value never enters manifest/source/artifact.

Conformance verifies required references/resolvability, never logs secret plaintext.

---

# 16. Migration architecture

Every production schema change remains a governed Release/migration transition with real validation, not a post-fact log.

For every migration, the universal proof order is:

```text
QA-DB-1 → QA-DB-2 → QA-DB-3
```

The migration class changes fixture/rehearsal depth, never removes the gate. A periodic live-database × migration-ledger drift check remains required between builds.

Promotion never rebuilds/recompiles a candidate under the same Release identity. Config/proof drift makes the candidate `STALE` and requires revalidation; it never silently produces different bytes under the same Release.

Current F1 uses two semantic branches:

## 16.1 Backward-compatible migration

Old runtime + new schema and new runtime + new schema compatibility are proven where the branch claims compatibility.

Expand/contract remains a design technique; compatibility proof is the gate.

A migration already recorded/checksummed is not blindly re-applied on Promotion retry.

## 16.2 Maintenance-required migration

Used when old runtime cannot safely serve the new schema.

Current properties:

```text
drain relevant mutating/queued/deferred/retry work
pre-migration backup confirmed
apply migration
post-migration conformance
old incompatible serving remains blocked
recover via idempotent continuation / forward fix / validated restore
```

No silent reopening of incompatible old serving.

## 16.3 Production migration direction

Successful production migrations are **forward-only**. Down migrations are not the Release rollback mechanism. Reverse migration can remain a DEV/investigation tool where safe; disaster restore is a recovery mechanism, not normal Release rollback.

## 16.4 Pre-migration recovery evidence

Promotion requiring migration records/validates required backup/recovery material before crossing the irreversible/maintenance boundary according to 3J-02 current recovery authority.

---

# 17. Project duplication architecture

Current C-014 Product contract is intentionally narrow:

```text
Duplicate Project
→ copy source/code
→ copy config schema/contracts
→ copy declarations/source artifacts as applicable
→ ask about business data
→ default = NO DATA
```

Never silently copy:

```text
Project DB contents
credentials
Connection bindings
current external authorization
runtime sessions/history
```

The accepted C-014 base is no Project DB contents, credentials or Connection bindings. Excluding current external authorization and runtime sessions/history is a monotonic consequence of their separate owner authority, not a new copy authority.

Destination must explicitly establish its own current Brain/Connection/environment/access bindings.

---

# 18. Connections architecture

## 18.1 Ownership

```text
Connection.ownerScope = WORKSPACE | PROJECT

WORKSPACE
→ reusable organizational Connection

PROJECT
→ private Project Connection, not implicitly reusable by siblings

Connections
→ logical Connection/qualification/credential-handle facts

Project
→ ProjectConnectionBinding to exact ConnectionRevision

CredentialBackend
→ encrypted secret-byte/crypto mechanics

Gateway
→ trusted last-mile execution
```

Provider does not determine scope, and cross-Workspace use is denied. These rules preserve one Connection class; they do not create two Connection classes, a generic scope engine or a generic ResourceBinding framework.

## 18.2 Connector model

Connector definitions remain narrow/declarative and provider-aware enough to express real auth shape, operations, effects/idempotency, environment/qualification and bounded provider-specific behavior.

Native/provider-specific operations are admissible where that is the honest semantic shape. Lowest-common-denominator flattening and full provider DTO mirroring are both rejected.

Free-form hook runtime is not baseline merely for future flexibility.

## 18.3 Secret lifecycle

Connection secret plaintext exists only at:

```text
A. write-only trusted administration ingress
B. Gateway trusted last-mile external use
```

No read-back API by default. Credential material is durable-before-visible and fails closed on corrupt/missing/unsupported backing/key state.

Logical credential version, crypto key version and transient access-token generation remain separate meanings.

---

# 19. Capability Gateway architecture

Gateway is the narrow execution boundary for governed business/application capabilities and enterprise effects.

## 19.1 Owns

```text
current capability/effect admission
exact Connection/binding resolution where external
business/application external I/O
effect identity/idempotency/replay safety
last-mile precondition/effect rules
credential materialization at exact use point
execution receipt / traffic-state truth
external-effect unit/budget authority
```

## 19.2 Does not own

```text
Project business meaning
Brain semantic meaning
Account identity
Product Agent lifecycle
Release source authority
model-spend authority
```

## 19.3 Caller surfaces and the 3A-R9 amendment

Gateway caller context is surface-specific. Current callers include the bounded explicit:

```text
MANAGED_JOB
```

This is the 3A-R9 amendment to the older 3D-02 caller list. The Hub derives exact `JobRun`, Project/environment, Release, Job ArtifactRevision and admitted input/occurrence identity server-side; the caller cannot select arbitrary Project, Connection, Release, revision or environment. Package D must prove this context cannot widen authority.

## 19.4 Retry law

```text
runtime retry != effect retry permission
```

Possible external acceptance + ambiguous response:

```text
OUTCOME_UNKNOWN
→ current reconciliation/evidence
-X-> blind replay
```

## 19.5 Closed Contracts/API projection

```text
LIVE SURFACE = INTERNAL | INDEPENDENT
CONDITIONAL  = routing only
persistence alone != contract
VERSION-GAP  = PRESERVE | REJECT_STALE | QUIESCE | TRANSFORM | DISCARD
```

Payload families remain owner-specific; there is no `UniversalRequest`, `UniversalResponse`, `UniversalStatus` or `InternalFailure`. One `ApprovalRequest` represents one human decision over one exact sealed effect subject. Bindings remain concrete: `ProjectConnectionBinding` and `ProjectBrainBinding`.

The closed public consumer-behavior code baseline is:

```text
CLIENT_OUTDATED
CAS_CONFLICT
CAPABILITY_UNAVAILABLE_HEALTH
NOT_FOUND
OPERATION_REJECTED
VALIDATION_FAILED
MANIFEST_INVALID
OUTPUT_CONTRACT_VIOLATION
INTERNAL_ERROR
```

`code` is the semantic consumer-behavior key; HTTP/transport status is not a second taxonomy. Exact route and DTO spelling remain derived realization, not frozen here.

---

# 20. Brain architecture

## 20.1 One canonical Brain per Workspace F1

```text
Workspace
→ 0..1 canonical Brain
```

Namespaces/domains organize content without creating multiple independent Brain authorities prematurely.

## 20.2 Authority split

```text
Workspace Brain Git      → published source
Artifact Registry        → exact immutable Brain artifact revision/payload
Brain owner              → semantic meaning/validation/publication/health
Project                  → ProjectBrainBinding intent
Project Git              → binding/refinement/override/local realization
Release                  → exact promoted composition
Gateway                  → controlled physical data proof/execution
Builder/PAR              → bounded final context composition
```

`BrainRevision` is the semantic view of exact immutable `ArtifactRevision(kind=brain)`, not duplicate revision authority.

Every admitted `ProjectBrainBinding` must carry/pass the accepted local conformance proof, including required grain/uniqueness assertions; inheriting semantic meaning is not proof that the Project realizes it correctly.

## 20.3 Brain is not memory/RAG

```text
Brain
!= Conversation memory
!= AgentRun history
!= Builder scratchpad
!= tasks.md
!= personal memory
!= vector index
```

A later retrieval index is derived and can only locate candidate canonical IDs; it never becomes meaning authority.

## 20.4 Published revision/adoption

```text
Brain source review
→ publish/merge under Brain authority
→ compile
→ immutable revision AVAILABLE
→ Project sees UPDATE_AVAILABLE
→ Project independently validates/rebinds
→ Release pins exact Brain+binding composition
```

No live inheritance.

## 20.5 Effective Brain context identity

Every relevant Brain runtime trace records all four identities:

```text
brainDigest
projectBindingDigest
healthSnapshotDigest
effectiveBrainSliceDigest
```

A health/state change can alter the effective slice without mutating the immutable published Brain revision.

## 20.6 Hard context budgets

Brain delivery remains deterministic/bounded. Current architecture preserves hard limits such as `maxBrainTokens` / stable-context budget semantics at compile/deployment time.

Dependency closure matters: a metric must not be injected without the critical caveat/binding/definition needed to interpret it safely. If the required bundle does not fit, fail compilation or omit the capability rather than silently drop the caveat.

## 20.7 Content-security boundary

```text
real ERP data in Brain Git                              = FORBIDDEN
sample_values / verified-query fixtures                 = enum | synthetic only
sampleSource                                             = REQUIRED
PII lint + secret scanning + human review               = REQUIRED
custom_instructions command authorization/tools/
  approvals/credentials/platform policy                 = FORBIDDEN
Brain creates/widens grant, tool, data or platform scope = NEVER
```

Brain content is knowledge under the authority lattice, not a privileged control channel.

---

# 21. Brain assisted Discovery architecture

Current F1 discovery is **machine-propose / human-decide**.

```text
source dictionary/catalog metadata
+ directed profiling of relevant candidate structures
→ semantic candidates
→ provenance/confidence/hypothesis state
→ prioritized human interview
→ reviewed Brain change proposal
→ published authority only after human Brain decision
```

For the current Sankhya consumer, Discovery is TDD*-first: native TDD dictionary/catalog plus PostgreSQL catalog precede directed profiling; profiling is targeted audit, not indiscriminate full-ERP scanning.

Discovery source access occurs through trusted Hub/Gateway read-only authority. ERP credentials do not enter E2B merely for Brain semantic discovery.

An inferred relation never becomes canonical merely because the model is confident.

---

# 22. AnalyticQuery architecture

C-011 admits a second read regime beside static registered Query:

```text
A. static registered Query artifact
OR
B. Brain-bound restricted AnalyticQuery
```

Current AnalyticQuery v0:

```text
semantic IDs only
→ validate exact EffectiveBrainPlan / Project binding
→ canonical restricted semantic plan
→ allowlisted AST / expressions
→ SELECT-only parser proof
→ Gateway/read executor
→ Project query role + read-only transaction
→ result shaping/budgets
```

One query targets one curated analytical dataset in v0. The runtime LLM cannot choose arbitrary SQL, physical table names, expressions or new join topology.

Cross-dataset analytical need that current curated source cannot represent returns to Builder/Project work.

Static Query and AnalyticQuery remain separate read regimes; no universal “execute arbitrary query” tool is introduced.

---

# 23. Brain health/drift architecture

Published Brain content and operational health are distinct.

Operational states include:

```text
UNVERIFIED
VALID
SUSPECT
INVALID
CHECK_ERROR
```

`ASSERTION_FAILED != CHECK_ERROR`.

Health is an operational overlay; it never rewrites Git/immutable BrainPack.

Critical numeric/effectful semantics marked `SUSPECT`/`INVALID` **block** dependent use under the accepted severity/type policy rather than being silently consumed.

Every Brain-dependent AgentRun pins a health snapshot. Before final response and before any effect/approval execution, critical dependency health is rechecked; critical change invalidates continuation/approval and recomposes context. Brain-dependent approval binds `effectiveBrainSliceDigest`.

---

# 24. Production Agent Runtime architecture

## 24.1 Current line

```text
exact active Conexus Release
→ derived RuntimeAgentProjection
→ ParMastra / mastra_par
→ direct Mastra Agent
→ Product AgentRun
```

Runtime projection is derived/rebuildable/cacheable, non-authoritative.

No `RuntimeAgentRevision` business class.

## 24.2 Admission before execution

```text
resolve current admissible surface
→ admit Product AgentRun owner fact
→ pin exact Release/agent/tool/model/runtime facts
→ commit
→ only then model/tool execution
```

## 24.3 Closed override channels

Production never resolves authoritative Agent behavior from:

```text
Mastra Stored Agent latest
Editor mutable config
request-body revision override
runtime “current version”
```

A suspended old run reconstructs from exact old pins.

## 24.4 Conversation/memory

```text
ConversationId = Conexus identity
Mastra threadId = substrate mechanism
```

Baseline:

```text
Conversation/message history = ON when Conversation exists
Working/Agent Memory          = consumer/eval-gated
Semantic Recall               = OFF until admitted/evaluated
Observational Memory          = OFF until admitted/evaluated
Memory Extractors             = OFF until admitted/evaluated
```

Scheduled Agent runs are threadless by default.

Memory resource scope includes Workspace + Project + Agent + memory class/purpose + subject where applicable.

## 24.5 Suspension/resume

For durable waits:

```text
PAR owner persists exact proposal/ApprovalRequest first
→ owner commit
→ runtime suspension/checkpoint in mastra_par
→ process may disappear
→ resume rebuilds exact old projection
→ current authorization/owner facts rechecked
→ RequestContext replaced whole
→ resume exact same AgentRun
```

Owner wait without runtime snapshot is a recoverable failure case. Runtime snapshot without owner authority is structurally unacceptable.

## 24.6 Exact proposal identity

Resume re-presents exact:

```text
proposalRef + args
```

Mismatch to the sealed subject fails closed. Mastra `toolCallId` is correlation only.

## 24.7 Product-Agent `SCHEDULE`

Product-Agent recurrence is PAR-owned and distinct from MAR managed-sync catch-up:

```text
schedule wake
→ guarded PAR schedule-fire ingress
→ validate current trigger/revision/schedule
→ stable intended-slot identity before AgentRun admission
→ consume cursor scoped by (TriggerId, TriggerRevision)
→ enforce single-flight
→ resolve/pin exact current Release
→ admit AgentRun
```

```text
valid occurrence + active trigger-origin AgentRun
→ consume occurrence as SKIPPED
→ no AgentRun
→ no hidden backlog/catch-up
```

Schedule fire never executes the Product Agent directly. Exact transport remains Package-B proof.

---

# 25. Builder ↔ Production Agent Runtime isolation

## 25.1 Role-specific Mastra

```text
Builder role
├── BuilderMastra
├── mastra_builder
├── Builder-local PubSub/runtime namespace
└── Builder-only AgentController/tools/Workspaces

PAR role
├── ParMastra
├── mastra_par
├── PAR-local PubSub/runtime namespace
└── PAR-only Agents/tools/schedules/memory
```

Forbidden sharing:

```text
same mutable Mastra store
same same-process PubSub instance
same external PubSub namespace/keyPrefix
same Agent object instance
same mutable Memory instance
Builder Workspace/toolset in PAR
standalone/ephemeral fallback for governed runs
```

## 25.2 Same-process baseline is conditional

Builder and PAR may coexist in one Hub application process only if Package B proves all enabled F1 process-global mutable state can be partitioned/fenced.

Material unpartitionable cross-role framework global state fires the process-split trigger; semantic owners do not change.

## 25.3 RequestContext

Every dispatch/rebind/resume:

```text
current/pinned owner facts
→ build NEW role-specific RequestContext
→ REPLACE WHOLE restored/effective context
→ execute
```

Never merge only known keys onto a stale restored context and leave unknown stale authority-bearing values alive.

## 25.4 Status

```text
architecture = CURRENT
Package B B0 = EXECUTION COMPLETE / LEAD-ADJUDICATED / PASS
Package B proof-routing amendment = APPROVED / CURRENT
Package B BT-1 = PASS
Package B BT-2 = PASS
Package B BT-3 = FAIL_REALIZATION / LOAD-BEARING STOP
Package B BT-4..BT-5 = NOT EXECUTED
Package B B1-01..B4-18 = PRESERVED DOWNSTREAM PROOF INVENTORY / NOT LITERAL PRE-C-018 EXECUTION
CX-AGENT-MASTRA-01 = FAIL_REALIZATION / LEAD ADJUDICATION REQUIRED
CX-RUNTIME-ISOLATION-01 = NOT PROVEN / BT-5 NOT EXECUTED
```

No claim of same-process safety is allowed before B.

---

# 26. Product Agent authoring architecture

Agent authoring is a specialized Builder experience over Project authority:

```text
structured/manual edit
OR
natural-language Conexus edit
→ same Change
→ same candidate agent/v1
→ same Plan/diff/work graph
→ same proof/checkpoint
→ immutable ArtifactRevision
→ same Release
```

No `AgentBuilderModule`, second Agent DB or Mastra Editor authority.

ToolProjection compiles exact admitted owner resources such as:

```text
Project Query
Project Action
Integration Operation
explicit platform-native tool with real consumer
```

AnalyticQuery remains an admitted Brain read regime, but it is **not** an automatic Product-Agent ToolProjection source. A named current consumer plus exact Release/tool authority must explicitly admit that use.

No `execute(anySlug, anyInput)` capability primitive is exposed to the model.

Missing dependency can be proposed by Builder, but must become explicit Change scope and pass applicable effect/access/Release gates.

---

# 27. Managed Application Runtime architecture

## 27.1 Published Application serving

```text
request
→ server resolves Project/current authority
→ exact active served Release
→ exact digest-addressed verified frontend/runtime composition
```

No rebuild/latest fallback at serve time.

## 27.2 `job/v1`

First F1 consumer = governed managed sync.

```text
Project job/v1 artifact
→ exact active Release composition
→ derived schedule
→ MAR job_run occurrence
→ governed Gateway/Project capabilities
```

Current laws:

```text
manual + fixed interval
single-flight + coalesce
after downtime, at most one catch-up only when the current served Release still requires
  sync and current freshness is behind
not N missed-slot replay
```

This is the bounded MAR managed-sync profile. It is not a shared recurrence abstraction and does not apply to Product-Agent `SCHEDULE` skipped slots.

Rejected:

```text
arbitrary privileged Project job code
generic workflow/automation/scheduler business domain
```

## 27.3 Queue/scheduler technology

Q0 incumbent Package-D candidate:

```text
pg-boss 12.26.3
```

Status:

```text
CANDIDATE / NOT QUALIFIED / NOT AUTHORITY
```

Package D must prove 3A-R9 behavior or introduce only the smallest owner-side reconciliation required.

---

# 28. Model-provider spend architecture

Model spend is owner-local run authority:

```text
Builder model spend → Builder ActorRun
Product Agent spend → Product AgentRun
```

## 28.1 Invariant

```text
committedModelSpendUsd
+
outstandingModelLiabilityUsd
<= effectiveModelSpendCapUsd
```

At most one unsettled billable liability per run in F1 baseline.

An admitted run cap is immutable upward: there is no in-place mid-run top-up. Materially more authority requires a fresh owner admission path.

## 28.2 Pre-provider gate

Before every physical billable model attempt:

```text
run current/admissible
+ exact provider/model allowed
+ call count available
+ qualified finite max-cost envelope
+ no outstanding liability
+ cap sufficient
→ durably reserve maximum liability in owner run fact
→ commit
→ only then provider I/O
```

Streaming follows the same gate: reserve the full qualified maximum liability before the stream/provider attempt starts.

## 28.3 Retry/fallback

Every physical attempt needs fresh owner admission. Hidden automatic retries/fallback below the owner gate are disabled in the F1 target.

Fallback provider/model requires its own qualified profile/admission.

## 28.4 Missing/ambiguous usage

```text
usage missing
cost unsupported
response lost
crash
ambiguous provider outcome
→ never zero
→ conservatively consume/reserve max according to owner settlement law
```

## 28.5 Status

Architecture obligation = CURRENT.

Exact Mastra/provider interception/usage/cost-envelope proof = **Package C NOT YET QUALIFIED**.

No generic BudgetService/model proxy/token broker/ModelCallAttempt business domain F1.

---

# 29. F5 owner-control handoff

Runtime has two semantically different outbound paths:

```text
A. owner-control F5 proposal
B. Operational Telemetry observation
```

Never reconstruct owner control truth from telemetry.

## 29.1 In-process

```text
runtime
→ narrow typed callback/function bound to owner dispatch context
→ owner validates current facts
→ owner writes owner transition
```

Producer-supplied run ID = cross-check only. Effective target identity comes from the owner dispatch closure/opaque handle.

```text
owner dispatch target identity != producer payload identity
→ refuse proposal
→ diagnostic/Finding as applicable
-X-> terminalize or mutate another run
```

## 29.2 Duplicate/lost response

Owner terminal/output transitions are current-guarded/write-once where required; duplicate callback cannot manufacture a second conflicting terminal fact.

Transport acknowledgement != domain application.

## 29.3 Future process split

If runtime later moves out of process, narrow authenticated RPC may preserve the same owner semantics.

No generic RuntimeBus/EventBus/UniversalRuntimeEnvelope for optionality.

---

# 30. Observability, audit, cost and execution transparency

## 30.1 Durable owner facts vs observation

Current Phase-3 data authority uses owner-specific durable records/projections. Historical C-013 `agent_event` exact table/type wording is **not** a current generic event-owner/table requirement.

C-013 enduring semantics survive:

```text
append-only/auditable observations where appropriate
producer trust
causal correlation
usage/cost state honesty
live checklist
completion ladder
missing != zero
telemetry never acceptance authority
```

## 30.2 Correlation anchors

Conexus IDs:

```text
ChangeId / CodingSessionId / WorkUnitId / ActorRunId
ConversationId / AgentRunId / ApprovalRequestId / trigger occurrence
Release/Promotion/Effect owner IDs
```

Observational IDs:

```text
traceId/spanId
Mastra run/thread/tool refs
E2B sandbox/process refs
provider request IDs
browser/request IDs
```

Domain run may span `0..N` traces.

## 30.3 OTel

OpenTelemetry is preferred vendor-neutral observation plumbing where useful, not correctness authority.

A perfect one-tree trace is not required. High-cardinality owner IDs belong mainly in traces/logs/correlation records, not default metric dimensions.

OTel baggage excludes by default:

```text
credentials
security decisions / mutable authority facts
PII / secrets
all Conexus owner IDs
```

Baggage is cleared/omitted before external or untrusted egress unless a future explicitly admitted crossing says otherwise. Trace context remains correlation only.

## 30.4 Producer trust classes

```text
HUB_AUTHORITY
GATEWAY_AUTHORITY
PROVIDER_OBSERVED
GUEST_OBSERVED
```

Authenticated transport never upgrades trust class by itself.

## 30.5 Cost/usage states

Execution surfaces preserve distinctions such as:

```text
usage_state:
  REPORTED | INFERRED | MISSING

calculation_state:
  CALCULATED | MISSING_USAGE | MISSING_PRICE | UNSUPPORTED

reconciliation_state:
  NOT_AVAILABLE | PENDING | MATCHED | MISMATCH | ADJUSTED
```

Calculated/provider-reported/reconciled cost remain separate facts.

User-facing execution detail may show, when available:

```text
model/provider
token classes (input/output/cache/reasoning)
USD/cost state
duration
tools/runtime observations
sandbox wall-clock monetary cost separately from LLM cost
```

Rollup can aggregate by turn/run/conversation/Project/period without creating aggregate tables as new business authority.

## 30.6 Three degradation classes

```text
ordinary Operational Telemetry missing
→ degraded/MISSING; domain work may continue where telemetry is not required

audit-required durable AuditRecord unavailable
→ FAIL CLOSED

verification-required Evidence missing
→ NOT_PROVEN / INCONCLUSIVE
-X-> PASS
```

Audit Trail and Operational Telemetry remain distinct meanings inside the Observability & Audit owner.

## 30.7 Required Evidence

If an assertion requires a class of runtime evidence:

```text
required Evidence missing
→ NOT_PROVEN / INCONCLUSIVE
-X-> PASS
```

Package E owns deciding-evidence qualification of current surfaces.

---

# 31. Security architecture — six logical trust zones

Zones are **security classifications, not mandated deployment units**.

## Z1 — Browser / Client

Authenticated or not, caller remains untrusted for authority-bearing fields. Client Project/Release/role/approval IDs are references/hints only and resolved server-side.

Control Plane, Preview and Published App browser contexts remain separate.

## Z2 — Trusted Hub Control

Trusted modular-monolith owners and co-located trusted control-side runtimes.

Module boundary is not intra-process RCE isolation. Full arbitrary trusted-Hub-process compromise remains an accepted F1 residual class; normal-path least privilege still limits avoidable blast radius.

## Z3 — Guest Execution

Current named guest = E2B Builder sandbox/app-under-test.

Root-capable/untrusted; gets bounded run/work capabilities only, no durable privileged credentials.

## Z4 — DEDICATED External Application

Authenticated external server-to-platform consumer under DEDICATED profile when a real consumer exists.

Its independently executable application may own its runtime/data plane and Product-specific network behavior. Conexus-owned capability access is explicit binding/Platform Service only; Gateway is that governed capability boundary, not the application's universal network stack. No Hub internals, Connection/Hub/Vault credentials or Project DB credentials are inherited. Physical DEDICATED deployment remains deferred until first real deployment.

## Z5 — External Provider / Enterprise

Model provider, E2B, Git provider, package registries, ERP/marketplace, backup targets and similar systems.

Authenticated/TLS provider response is observation/data, never Hub authority merely by transport.

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

Not one credential domain. Each store preserves owner-specific capabilities/lifecycle.

---

# 32. Trust crossings and egress

## 32.1 Business/application egress

```text
Published/managed app capability
Product Agent business capability
Builder governed enterprise-data capability
→ Capability Gateway
→ exact Connection / Project-data executor
```

Generated app/browser/guest never bypasses Gateway to ERP/enterprise target.

## 32.2 Platform-control egress

Owner-specific infrastructure adapters may call exact providers without routing all control traffic through Gateway:

```text
CodingRuntime → E2B
GitInfra → Git provider
Model adapter → model provider
backup operation → backup target
admitted build/package mechanics → pinned registry/catalog target
```

Every privileged adapter has a named owner, owner-specific credential and server-derived/pinned destination.

No universal privileged `fetch(url, secret)` service/egress proxy F1.

## 32.3 Browser egress

Browser self-only/CSP/session/request-authenticity laws are platform-controlled. New cross-origin browser capability is explicit Product/security contract change, not app-config convenience.

## 32.4 Future SaaS ↔ private/on-prem reachability

C-003 preserves a real future requirement class:

```text
SaaS Conexus selected
+ enterprise target only reachable privately/on-prem
→ decide authenticated private reachability/custody topology
```

Current architecture does **not** preselect or deploy a managed tunnel F1. Mechanism is rederived from real SaaS/customer topology.

## 32.5 DEDICATED trusted exchange

The DEDICATED trust contract is current even though its physical deployment is deferred:

```text
principal              = DedicatedApplicationPrincipal
client authentication  = private_key_jwt
signed assertion binds = exact ReleaseRef
access token           = short-lived signed bearer
F1 mode                = SERVICE_SCOPED only
```

Every Platform Service request rechecks current `credentialGeneration`, Project/Release containment, Release-pinned service composition and current owner/security gates. No auth record/session store, refresh-token, DPoP, mTLS or fleet machinery is introduced.

---

# 33. Scaffold and frontend architecture

Current paved road:

```text
React
TypeScript strict
Vite SPA
TanStack Router/Query family under current scaffold authority
```

Framework reconsideration is not open absent real failure class.

## 33.1 Versioned deterministic scaffold

The platform scaffold is versioned/byte-controlled and intentionally **infrastructure-rich / Product-feature-poor**.

It carries paved-road mechanics so each generated Project does not ask its coding agent to reinvent auth boundaries, API/client contract patterns, error/loading truth, security headers/CSP rules, test/build gates, telemetry hooks or other accepted platform invariants.

An escape hatch exists for a real Project need; using it does not silently waive platform/security contracts.

## 33.2 Three ownership layers

Generated code is classified conceptually as:

```text
GENERATED
→ reproducible from platform source/model; do not hand-own divergent semantics

PLATFORM-CONTRACT
→ Project-visible seam controlled by platform contract; app can consume but not weaken invariant

APP-OWNED
→ Project business/product source the Builder may legitimately evolve
```

This prevents regeneration from overwriting Project-owned work and prevents app code from mutating platform security/authority seams by convenience.

## 33.3 First-build conformance

Scaffold presence is not proof. The first real Product slice must demonstrate the applicable scaffold/codegen/frontend/security contracts actually fire.

Implementation-dependent scaffold probes remain downstream rather than being faked in 3L without Product code.

## 33.4 Workspace shell

```text
Workspace
├── Projects
├── Agents
├── Brain
├── Connections
├── Members
└── Settings
```

## 33.5 Project shell

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

Exact labels/order/components are realization details; semantic surfaces are current.

## 33.6 Build surface

```text
Project navigation
+ Preview dominant/default
+ contextual Conexus/Platform Consultant panel
+ Preview | Code | Diff lenses
+ Plan/checklist/Evidence/cost detail as needed
```

No second IDE/editor mutation authority.

Load-bearing projection laws:

```text
working != blocked != waiting-for-user != completed
building next candidate != currently inspectable last-good Preview
```

Building the next candidate must not require destroying/replacing the last usable Preview before the new candidate is ready.

## 33.7 Honest client projection

Frontend/cache is projection only. It preserves loading/empty/failure/partial, source/freshness/coverage/provenance, exact approval subject and Release/serving distinctions.

## 33.8 Contextual inspectability / progressive disclosure

```text
REAL PRODUCT RESOURCES
→ directly inspectable: Data, Capabilities, Integrations, Product Agents, Brain binding,
  Versions, Preview, Code/Diff and Activity/Evidence entry

PLATFORM MACHINERY
→ progressive detail: WorkUnit/ActorRun internals, Gateway/Registry/CAS mechanics,
  Mastra/E2B refs, owner rows and technical digests unless material
```

`Ask Conexus about this` passes selected resource/context to the contextual assistant under current server-derived authorization. It grants no new authority, capability or cross-Project access.

---

# 34. Published Application access and private storage

## 34.1 Independent app authorization

```text
CONTROL_PLANE
!= PREVIEW
!= PUBLISHED_APP
```

Current closed F1 Published App role set:

```text
{admin, member}
```

until explicit later material Product decision changes it.

```text
Project admin -X-> app admin automatically
app member    -X-> Builder/source access automatically
```

Published App authorization is server-derived; frontend is not enforcement authority.

## 34.2 Session boundary

Current C-015/3I direction uses server-owned opaque session/cookie semantics; historical URL-fragment bearer flow is not current authority.

## 34.3 Private-by-default bytes

Attachments/blobs are private by default:

```text
owner record/current authorization
→ access decision
→ storage byte retrieval
```

Public exposure requires explicit admitted Product policy/consumer. Storage key/path/prefix/provider URL never grants semantic access by possession alone.

---

# 35. First-production physical topology

This is **first-installation architecture**, not universal SaaS doctrine.

## 35.1 Development/proving

```text
operator Windows workstation
→ Ubuntu WSL2
→ development / qualification / proving
```

WSL2 is not production authority.

## 35.2 Physical failure domain

```text
existing company physical server
→ Windows host
→ one dedicated Linux production guest/VM
```

Physical host/Windows/guest/storage loss may take the entire installation down. Accepted initially; no HA claim.

## 35.3 Inside Linux guest

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

Physical co-location never merges owners/stores/credentials.

E2B remains remote guest execution outside the production VM.

## 35.4 Private ingress

```text
inside company → LAN → HTTPS → Conexus
remote employee → existing corporate VPN → private company network → HTTPS → Conexus
```

```text
public Internet ingress F1 = NONE
anonymous/public app access F1 = NONE
remote plaintext HTTP = DENY
```

VPN is reachability, never authorization.

Remote production HTTPS must be normally trusted by first-user browsers; certificate-warning click-through is not a normal production state. Placement must also preserve an out-of-band infrastructure/host path to administer or stop ingress/application independently from the served Conexus web path.

## 35.5 MANAGED serving

Hub/MAR serves exact active-Release bytes directly in the baseline. No standalone MAR service/CDN/load balancer/reverse-proxy architecture is required for optionality.

Concrete hypervisor, Linux distro, VM sizing, hostname/DNS/TLS termination, service manager, ports/firewall/storage paths belong derived Realization Planning/activation proof.

Development/proving state can never silently become PROD authority. Activation requires explicit production identity/configuration and proof; failure blocks activation rather than relabeling the proving environment.

---

# 36. Operational resilience architecture

Current first-installation posture:

```text
single physical failure domain accepted
manual restore acceptable initially
RPO <= 6h
RTO <= 8h
off-host recoverable set required
complete restore proof from a real off-host protected generation before first production
whole-Hub emergency-stop drill before first production
no HA/auto-failover/multi-region claim
```

Required recovery set:

```text
hub_control
all production Project DBs
mastra_par
non-reconstructible digest-addressed bytes
CredentialBackend ciphertext backing
provider-independent canonical Git recovery bundles
recovery manifests
```

Not required by default: `mastra_builder` and E2B/validation/cache/reconstructible state. The RPO/RTO numbers are the first-installation operations contract, not a SaaS SLA.

3M still owns the semantic question: after interruption/restore, do current durable facts suffice to decide resume/retry/reconcile without fabricated success?

---

# 37. First vertical architecture — Budget Analyzer

The first vertical proves one real composition, not every platform capability.

```text
Workspace: Metal Nobre
├── Workspace Brain
│   └── budget/pending/conversion semantics + caveats
├── Connection
│   └── Sankhya
└── Project: Budget Analyzer
    ├── Project Baseline
    ├── ProjectBrainBinding
    ├── ProjectConnectionBinding
    ├── governed managed sync
    ├── derived analytical Project DB read model
    ├── registered read-only Query capabilities
    ├── React application/dashboard
    └── exact Release / Published Application
```

Data path:

```text
Sankhya
→ Gateway live reads
→ Discovery / qualification / reconciliation / verification / Evidence

Sankhya
→ governed sync
→ Project analytical read model
→ registered Query capabilities
→ dashboard
```

Truth laws:

```text
Project DB != Sankhya source authority
Project DB != Brain semantic authority
read model exists != sync completeness proved
historical benchmark != current operational truth
```

No Product Agent or external/business write is required for this vertical.

The Sankhya/read-model pattern is not universal doctrine; every future Project selects the minimum path required by its current Baseline.

---

# 38. Engineering quality / evaluation architecture

## 38.1 Golden benchmark

Budget Analyzer remains a reproducible Builder regression/quality benchmark. Same accepted spec/input expectations are compared against known benchmark behavior and prior Conexus versions, while correctness/evidence remain more important than superficial visual identity.

## 38.2 Conexus Worker Eval

F1 keeps a real-task evaluation suite for coding runtime/model candidates across representative tasks such as:

```text
backend feature
migration
React page
complex bug
Sankhya integration
recovery/failure task
```

Purpose:

```text
measure current primary runtime/model
compare challenger when material trigger fires
avoid framework/provider selection by anecdote
```

Historical `Pi × Claude Agent SDK` is not the permanent candidate set. Current primary/challenger identities follow current architecture/qualification authority.

## 38.3 Independent material verification

Where material, verifier remains independent from implementer/coding continuation context according to current Builder/Method authority. Persistent CodingSession does not eliminate independent verification.

---

# 39. Technology-state matrix

Labels are deliberately distinct:

```text
ARCHITECTURE CURRENT
SELECTED / NOT YET QUALIFIED
QUALIFIED
QUALIFIED WITH REQUIRED GUARD
EVALUATED / KEEP OFF
CANDIDATE
DEFERRED
REJECTED F1
```

| Surface | Current state | Notes |
|---|---|---|
| Hub | **ARCHITECTURE CURRENT** — Node/TS modular monolith | exact implementation packages derived later |
| PostgreSQL | **ARCHITECTURE CURRENT** — major 17 | Q0 tested exact 17.10 |
| Builder Mastra | **QUALIFIED for Package-A tested properties** | persistent/current-dispatch properties only as tested |
| E2B | **QUALIFIED WITH REQUIRED PHYSICAL-INCARNATION GUARD** | guard mandatory in Product realization |
| native Codex OAuth | **QUALIFIED for Package-A tested path** | not universal model/provider winner |
| Builder Observational Memory | **EVALUATED / KEEP OFF** | net benefit not proven; no stale-authority regression observed |
| direct Mastra Product Agent | **ARCHITECTURE CURRENT / PACKAGE B FAIL_REALIZATION PENDING ADJUDICATION** | BT-1 and BT-2 passed; BT-3 proved stale unknown RequestContext keys survive fresh-process resume; BT-4/BT-5 were not executed after the mandatory stop |
| BuilderMastra != ParMastra same-process isolation | **ARCHITECTURE CURRENT / PACKAGE B NOT QUALIFIED** | split only on material failure |
| Conversation history baseline | **ARCHITECTURE CURRENT** | advanced memory gated |
| model-spend pre-provider enforcement | **ARCHITECTURE CURRENT OBLIGATION / PACKAGE C NOT QUALIFIED** | hidden retries below gate must stay disabled/qualified |
| managed sync/job semantics | **ARCHITECTURE CURRENT / PACKAGE D NOT QUALIFIED** | MAR/Release law current |
| pg-boss 12.26.3 | **PACKAGE D CANDIDATE / NOT AUTHORITY** | one-catch-up law must be proved |
| deciding F5/observability surfaces | **ARCHITECTURE CURRENT SHAPE / PACKAGE E NOT QUALIFIED** | telemetry-never-authority is already architectural |
| React/TS/Vite/TanStack paved road | **ARCHITECTURE CURRENT** | first-build scaffold conformance pending |
| Brain semantic architecture | **ARCHITECTURE CURRENT** | implementation-dependent Discovery/feedback/conformance probes downstream |
| first-production Linux guest/private ingress | **ARCHITECTURE CURRENT FOR FIRST INSTALLATION** | activation/restore/security proofs remain |

---

# 40. Q0 exact qualification identity currently carried

Latest-stable Package-A deciding identity:

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

These are deciding Evidence identities, not a `latest` policy. Version drift requires explicit repin and affected-criteria requalification.

Known malicious Mastra package families/versions remain denied under Q0/C-016 supply-chain admission.

---

# 41. Remaining 3L qualification route

R11 is closed; the remaining 3L route preserves serial proof dependency.

Current route:

```text
adjudicate Package-B BT-3 FAIL_REALIZATION; do not resume probes without explicit direction
↓
Package B — Product Agent + Cross-Runtime — STOPPED / LEAD ADJUDICATION REQUIRED
  B0 EXECUTION COMPLETE / LEAD-ADJUDICATED / PASS
  BT-1 PASS / BT-2 PASS / BT-3 FAIL_REALIZATION
  BT-4..BT-5 NOT EXECUTED
  B1-01..B4-18 PRESERVED DOWNSTREAM PROOF INVENTORY / NOT LITERAL PRE-C-018 EXECUTION
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

A package does not start merely because the previous package claimed success; deciding Evidence must be read/adjudicated.

---

# 42. Downstream proof families not pulled artificially into 3L

Some architecture properties require the first real Product slice to instantiate the mechanism. They remain mandatory first-build conformance, not fake architecture-only tests.

Examples:

```text
Brain Discovery/feedback/conformance/health
scaffold/codegen/frontend contract/security invariants
Observability/audit/redaction/GC Product paths
Release/Promotion/EnvironmentConformance/serving
Published App authorization/session/browser security
private attachment/blob authorization
supply-chain/dependency admission
Connection/Gateway effect/egress
first-production restore/emergency-stop/activation
first vertical live-source/read-model reconciliation
Golden benchmark / Worker Eval integration into engineering system
```

Named proof routing remains explicit:

```text
CX-BUILDER-MASTRA-01   = Package-A deciding proof / COMPLETE for tested properties
CX-BRAIN-V0-01         = before first Brain-backed deploy
CX-BRAIN-DISCOVERY-01  = before Brain Discovery implementation/activation
CX-BRAIN-FEEDBACK-01   = before Brain feedback implementation/activation
```

The Brain identities are current downstream obligations, not already-qualified results.

A future Realization Plan must compile these into the first slice that can actually falsify the property; it may not delete them because they were not executed in 3L.

---

# 43. Explicit future seams — no dormant machinery

Preserved without implementation now:

```text
SaaS onboarding/billing/customer operations
SaaS↔private/on-prem authenticated reachability
multi-repo Project
cross-Workspace sharing/exchange
DEDICATED physical deployment
stronger HA/PITR/multi-host topology
external SLA monitoring/paging
Product Agent Working/Agent Memory
Semantic Recall
Product Agent Observational Memory
Memory Extractors
Durable Agent reconnect semantics
EVENT triggers
Agent-as-tool/subagents/networks
MCP/A2A/external Agent clients
Product Agent browser/workspace/source access
Connection pools/failover
external Vault/KMS/HSM / per-secret envelope/DEK
SSO/SCIM/passkeys
public/embed Published Apps
richer app roles/data scoping
Brain vector/RAG index
Brain G2 Graph projection for measured traversal/impact/dependency reasoning
Brain G4 Advanced knowledge governance for a real ontology/DMN-BPMN/temporal/formal-rule consumer
broader Project export/import/clone workflows
```

No empty module/table/service/registry/engine exists merely to reserve these futures.

---

# 44. Explicit F1 architecture rejects

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
forced per-WorkUnit cognitive reset
mandatory tunnel infrastructure before SaaS/private-source consumer
```

---

# 45. Recovery invariants carried into 3M

R11-D does not solve 3M. Current durable architecture constrains it:

1. owner truth survives runtime/process restart where recoverability is required;
2. runtime snapshot without owner authority never authorizes continuation;
3. current authorization is rechecked on protected re-entry;
4. model spend survives restart/resume through owner facts;
5. external-effect ambiguity never becomes retry permission;
6. Release/Promotion history remains immutable and serving authority explicit;
7. Builder physical sandbox recreation never implies write-lineage continuity;
8. Mastra thread/trace continuity is not domain-run continuity;
9. missing required Evidence yields NOT_PROVEN, not reconstructed success;
10. restore cannot fabricate newer semantic truth than recovered owners establish;
11. migration recovery branch remains explicit after irreversible/maintenance transition;
12. current Plan/WorkUnit/ActorRun facts must be sufficient to settle interrupted Builder work without trusting session prose.

3M tests whether existing durable facts are sufficient without inventing a generic recovery engine.

---

# 46. Verification invariants carried into 3N / 3O

Future architecture verification/proof must be able to falsify at least:

```text
Workspace isolation bypass through Project/DB/runtime shortcuts
coding crossing a materially insufficient Project Baseline
runtime/session closing Change authority by itself
Plan/tasks/UI state disagreeing with Hub authority without detection
E2B cross-incarnation silent write replay
Brain canonical source accidentally residing in first Project repo
Brain binding silently following new Brain revision
Brain Discovery proposal becoming authority without human publish
AnalyticQuery escaping semantic/SELECT-only boundaries
caller/model selecting arbitrary Connection/effect destination
Gateway duplicate/lost-response replay manufacturing second effect
Product Agent losing exact old Release pins across suspension/restart
Builder/PAR mutable-state leakage
stale RequestContext authority resurrection
provider call occurring without spend reservation
managed sync replaying all missed slots
telemetry manufacturing F5/terminal truth
Published App authority collapsing into Control Plane
Release AVAILABLE/pointer swap masquerading as SERVED_VERIFIED
migration/EnvironmentConformance drift hidden as success
storage object key bypassing owner authorization
first vertical read model proving itself / unsupported KPI fabricated
```

3O later defines the contract-only end-to-end vertical proof target; this baseline does not pre-implement it.

---

# 47. Reopen triggers by family

| Family | Material reopen trigger examples |
|---|---|
| Hub modular monolith | real isolation/scale/availability constraint impossible within current boundaries |
| Builder Mastra | qualification/implementation proves structural authority/correctness failure behind narrow runtime seam |
| E2B | provider no longer satisfies required physical/network/custody properties or guard becomes insufficient |
| same-process Builder/PAR | Package B proves enabled F1 global mutable state cannot be partitioned/fenced |
| Product Agent direct Mastra | B proves direct Agent cannot preserve exact pins/suspension/approval/Gateway safety |
| PostgreSQL 17 | support/security/feature requirement or implementation Evidence invalidates current major |
| owner-scoped DB capability | accepted cross-owner atomicity/ops requirement cannot be expressed without violating negative property |
| Gateway | new effect/integration class cannot preserve current owner/effect/credential boundary |
| Brain | independent lifecycle/trust/scale consumer proves one Workspace Brain insufficient |
| Release | real consumer needs composition/version/cutover semantics current model cannot represent |
| MAR/jobs | real deterministic workflow needs semantics beyond managed-sync seam |
| first-production topology | company server unsuitable; RPO/RTO/public/compliance/DEDICATED consumer demands new placement |
| Published App access | real role/audience/data-scope needs exceed closed F1 role model |
| Product Agent memory/tools | named Product Agent needs advanced memory/browser/source/workspace capability with acceptable proof |
| SaaS private reachability | SaaS deployment + real private/on-prem enterprise target |
| scaffold/frontend | real Product need cannot be expressed without breaking current Generated/Platform/App ownership seam |

Framework popularity, newer package version or hypothetical scale alone is not material Evidence.

---

# 48. R11-D Round-1 correction completeness

```text
Project Git vs Workspace Brain Git separated             = YES
Plan/checklist/tasks.md architecture restored            = YES
current Git branch/result model restored                 = YES
Release composition/state/CAS/serving restored           = YES
environment/config/migration detail restored              = YES
Project duplication semantics represented                = YES
Brain Discovery represented                              = YES
AnalyticQuery represented                                = YES
Brain health/context-budget semantics represented        = YES
cost/tokens/duration observability represented           = YES
private storage property represented                     = YES
Worker Eval / Golden benchmark represented               = YES
scaffold ownership/conformance represented               = YES
SaaS↔private reachability seam represented               = YES
six trust zones preserved                                = YES
qualification strengths preserved                        = YES
new semantic owner/module/DB/workflow introduced         = NO
```

---

# 49. Authority provenance

Primary derivation:

```text
C-003 Product/F1 requirements
C-005 Artifact Registry
C-006 data
C-007 integrations
C-008 sandbox
C-011 Brain
C-012 scaffold/frontend
C-013 observability/checklist/cost
C-014 Release/lifecycle/duplication
C-015 Published App access
C-016 security
C-017 engineering model
3A-R5..R10
3B-01..17
3C-R1
3D-R1
3E-R1
3F-R1
3G-R1
3H-01..03 + 3H-R1
3I-01..05 + 3I-R1
3J-01..03 + 3J-R1
3K-01..04 + 3K-R1
3L-Q0 + 3L-A
R11-A census/completion
R11-B accepted current Decision Reconciliation
R11-C accepted current Product Contract
R11-E Round-1 coherence findings
R11-F Fresh Actor review
R11-G independent Fable review + accepted FBL-01..17 adjudication
```

Detailed accepted homes remain controlling for exact semantic depth and when resolving any projection conflict.

---

# 50. Exact next action

> **Adjudicate the BT-3 `FAIL_REALIZATION` in [3L-B-technology-qualification.md](../phase3/3L-B-technology-qualification.md). Do not resume BT-4/BT-5, execute B1-01..B4-18 literally or authorize the next package without explicit Architecture-Lead direction.**
