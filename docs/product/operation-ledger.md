# Conexus OS — Product Operation Ledger

> **Status:** CANDIDATE / 4A OPEN / NOT RATIFIED
> **Authority:** derived only from the current accepted Product/architecture authorities routed by `docs/index.md` and the 4A contract.
> **Mutable program status:** owned only by `docs/roadmap.md`.

This ledger is the canonical 4A candidate surface. It is intentionally **not** an HTTP/OpenAPI contract and it does not authorize implementation.

The ledger is built to answer one question before backend/frontend/runtime work begins:

> Which externally meaningful operations actually exist, who owns them, who can consume them, what current authority do they require, and which interactions are protocol/mechanics rather than Product meaning?

No numeric census is ratified yet. Candidate rows may be merged, split, rejected or reclassified while 4A remains open.

---

## 1. Three surface closures

Conexus is a software platform, not one fixed business application. 4A therefore closes three different surfaces.

### 1.1 Fixed Conexus platform surface

Finite exact operations whose Product meaning is owned by Conexus itself.

```text
final fixed platform census = N_platform
candidate count now          = NOT FROZEN
final orphaned               = 0
final speculative            = 0
```

### 1.2 Project-defined Product capability grammar

A Project Release may define business operations that Conexus cannot honestly enumerate globally in advance. Those operations are admitted only through the closed grammar in §4.

```text
exact Release R
→ exact finite Ops(R)
→ each operation owner/consumer/authority/proof closed
→ exact generated/conforming wire in 4B
```

### 1.3 First Budget Analyzer application surface

The named first vertical must instantiate the grammar with a concrete finite operation set before 4A closes.

```text
final Budget Analyzer census = N_budget
candidate count now           = UNRESOLVED_FOR_4A
```

The current repository does not yet contain the exact accepted Brain semantic/result inventory needed to freeze `N_budget`; §19 records that blocker.

---

## 2. Caller / authority classes — candidate closure

These are **authority/caller classes**, not framework identities and not automatically ordinary Permission names.

| Class | Current meaning | Product authority |
| --- | --- | --- |
| `HUMAN_ACCOUNT_SESSION` | authenticated human mapped to one Conexus Account and opaque Conexus session | current Workspace/Project/owner grants resolved server-side |
| `PUBLISHED_APP_HUMAN` | same human identity while using one exact Published App | current `published_app_access` + exact app role `{admin, member}`; does not imply Builder/Project authority |
| `PAR_AGENT_RUN_CONTEXT` | one already-admitted exact Product AgentRun acting through its Release-pinned ToolProjection | PAR/Gateway owner facts; model/runtime identity is not a principal |
| `MAR_JOB_RUN_CONTEXT` | one already-admitted exact managed JobRun | exact Project/Release/job occurrence + current owner gates; queue identity is not authority |
| `SYSTEM_OWNER_TRANSITION` | owner-internal transition after an admitted command/event | no public caller permission; must remain owner-derived/current-guarded |
| `DEDICATED_APPLICATION_PRINCIPAL` | accepted semantic service principal for a future real DEDICATED consumer | current contract is `SERVICE_SCOPED`; concrete Product operation surface remains deferred until the first real consumer |

Explicit non-principals:

```text
Keycloak role/group/organization
Mastra thread / Agent / workflow identity
E2B sandbox/process identity
trace/span/provider request id
storage key/path/url
browser-provided role/project/release/approval ids
```

### 2.1 Permission derivation status

The current accepted authority does **not** expose a closed ordinary Permission-string vocabulary equivalent to Marketplace Central's 29 Permissions. 4A must derive Conexus's vocabulary from the final concrete operations and existing membership/grant/app-role authority.

Until that derivation is stable, candidate rows name the **required owner authority fact** instead of inventing Permission strings prematurely.

This is deliberate:

```text
narrative actor label
-X-> automatic Permission name

UI location
-X-> automatic Permission name
```

---

## 3. Explicit non-Product protocols / mechanics

These interactions are important but are **not fixed Product operations merely because routes/messages exist**.

| Interaction | 4A classification | Reason |
| --- | --- | --- |
| Conexus login redirect to Keycloak | OIDC protocol | authentication ceremony; Keycloak is provider Evidence, not Product authority |
| Keycloak authorization callback/code exchange | OIDC protocol | I&A adapter mechanism; verified identity only establishes Account mapping/session |
| Keycloak logout/provider mechanics | OIDC/provider protocol | does not define Conexus grant/session authority by itself |
| Product-Agent schedule wake | Technical/internal ingress | wake must cross guarded PAR admission before AgentRun exists |
| MAR queue delivery/redelivery | runtime mechanic | queue presentation never authorizes JobRun execution |
| provider callback/token refresh | Technical/provider ingress | provider choreography, not Product capability by existence |
| model-provider call | control-side runtime mechanic | model identity/output never owns Product state |
| E2B sandbox/process calls | Builder runtime mechanic | guest execution only; never Product authority |
| Git provider transport | infrastructure mechanic | Project/Brain Git authority remains semantic/provenance truth above provider protocol |
| Blob/CAS provider URL/object key | storage mechanic | possession never grants semantic identity/access |
| Release asset/static-byte serving transport | serving mechanic | caller authorization + exact active Release decides; storage path does not |
| owner F5 runtime callback | internal owner-control path | runtime proposes; owner validates/applies terminal/current state |
| first-production backup/restore mechanics | operations/recovery control | recovery reconstructs/narrows authority; it is not ordinary Product API by existence |
| emergency-stop physical control | out-of-band operations control | must remain available without trusting ordinary application ingress; no decorative Product button is inferred |

4B may still give protocols exact wire/routes where required. Classification here only prevents protocol shape from becoming Product meaning.

---

## 4. Project-defined Product capability operation grammar — CANDIDATE

### 4.1 Why this grammar exists

Future Conexus Projects define business behavior. A fake global operation census would either pre-invent every future app or force all Project behavior through a dangerous generic executor.

The accepted middle is:

```text
Project-authored semantic operation
→ validated/compiled immutable ArtifactRevision
→ exact Release composition
→ exact operation projection
→ exact caller/authority/binding admission
→ generated/conforming wire
→ current owner/Gateway execution
```

### 4.2 Admitted Project-defined operation regimes

| Regime | Meaning | Authority constraints |
| --- | --- | --- |
| Registered `Query` | exact Project-defined read operation | exact input/output semantics; read-only authority; real bind parameters; no runtime arbitrary SQL/table/join selection |
| Registered `Action` | exact Project-defined consequential/business command | exact owner semantics; current authorization/preconditions; idempotency/reconciliation when repeated intake/effect risk exists |
| Integration Operation | exact provider-aware Project capability where provider-specific meaning is honest | exact Connection/binding/revision/environment; Gateway last-mile; declared read/effect/idempotency/reconciliation scope |

`AnalyticQuery` is **not** an arbitrary Project slug. It is a separate fixed Brain-governed platform read regime and is derived in the fixed platform census below.

### 4.3 Required declaration for every concrete Project-defined operation

A concrete operation is inadmissible unless its exact Release authority closes:

```text
semantic operation identity/name
Project/Product owner meaning
operation regime
input contract
output contract
consumer class
caller/surface
current authorization route
Project/Workspace/app scope
required Brain/Connection/environment pins
read/effect classification
knowledge/freshness/outcome semantics
idempotency/reconciliation scope where consequential
concurrency/current-state requirements
proof/negative-control contract
```

The exact wire spelling belongs 4B.

### 4.4 Forbidden generic authority

```text
execute(anySlug, anyInput)
execute(anySql)
execute(anyProviderOperation)
caller-selected Connection
caller-selected target URL
mutable-latest Query/Action/Agent
unregistered runtime tool creation
```

Internal dispatch may use identifiers as mechanics after the exact operation has already been admitted. The caller never gains a universal capability merely because the runtime has a dispatcher.

### 4.5 Product Agent ToolProjection

A Product Agent receives only the exact Release-derived projected operations admitted for that Agent. A registered Project capability is **not** automatically an Agent tool, and `AnalyticQuery` is not automatically projected.

```text
Project operation exists
-X-> Product Agent can use it

exact Release + exact Agent ToolProjection admits it
→ PAR may expose that exact bounded tool
```

### 4.6 Managed jobs

`job/v1` remains a Release-pinned managed-execution artifact, not a fourth generic business-operation regime. A human manual occurrence and JobRun inspection are Conexus platform operations; the job's internal work calls only exact governed Project/Gateway capabilities.

### 4.7 Exact bytes / attachments

Private byte capability is an operation **carrier/property**, not a global File Manager domain. A Project-defined operation may declare owner-authorized upload/download/exact-byte semantics; 4B will define the wire pattern. No global caller operation `GetBlob(storageKey)` or `UploadAnyFile` is admitted.

---

# 5. Fixed platform operation candidates — Journey A / Identity & Access

Disposition vocabulary in this candidate:

```text
ADMIT_CANDIDATE    strong current Product consumer/owner meaning found
UNRESOLVED         real current intent exists but exact operation split/owner/auth needs adjudication
INTERNAL           owner/runtime transition, not direct Product operation
DEFERRED           accepted seam but no current real consumer
REJECT             convenience/speculative operation with no accepted meaning
```

| ID | Semantic operation | Owner | Consumer/surface | Current authority / scope | Class | Disposition |
| --- | --- | --- | --- | --- | --- | --- |
| `IAM-01` | `GetControlPlaneAccessContext` | I&A | authenticated human / Control Plane shell | current Account session; returns only currently disclosable Workspace/Project context | read | ADMIT_CANDIDATE |
| `IAM-02` | `EndSession` | I&A | authenticated human | exact current Conexus session | command | ADMIT_CANDIDATE |
| `IAM-03` | `ProvisionAccount` | I&A | trusted platform operator/admin UX | trusted F1 administration; no public signup | command | ADMIT_CANDIDATE |
| `IAM-04` | `ListWorkspaceMembers` | I&A | Workspace administration | current authority to administer exact Workspace membership | read | ADMIT_CANDIDATE |
| `IAM-05` | `AddWorkspaceMember` | I&A | Workspace administration | exact Workspace; current membership-admin authority | command / CR-1 candidate | ADMIT_CANDIDATE |
| `IAM-06` | `RemoveWorkspaceMember` | I&A | Workspace administration | exact Workspace; current membership-admin authority | narrowing command / CR-1 candidate | ADMIT_CANDIDATE |
| `IAM-07` | `GrantAccountProjectAccess` | I&A | Workspace/Project administration | exact Workspace + Project containment; current grant authority | command / CR-1 candidate | ADMIT_CANDIDATE |
| `IAM-08` | `RevokeAccountProjectAccess` | I&A | Workspace/Project administration | exact Project; current revoke authority | narrowing command / CR-1 candidate | ADMIT_CANDIDATE |
| `IAM-09` | `AddAreaMember` | I&A | optional Area administration | exact Area inside Workspace; current admin authority | command | ADMIT_CANDIDATE |
| `IAM-10` | `RemoveAreaMember` | I&A | optional Area administration | exact Area; current admin authority | narrowing command | ADMIT_CANDIDATE |
| `IAM-11` | `GrantAreaProjectAccess` | I&A | optional Area/Project administration | exact Area + Project in same Workspace; current grant authority | command / CR-1 candidate | ADMIT_CANDIDATE |
| `IAM-12` | `RevokeAreaProjectAccess` | I&A | optional Area/Project administration | exact Area + Project; current revoke authority | narrowing command / CR-1 candidate | ADMIT_CANDIDATE |
| `IAM-13` | `GetPublishedAppAccessContext` | I&A | human inside exact Published App | current Account session + exact `published_app_access`; role `{admin,member}` only | read | ADMIT_CANDIDATE |
| `IAM-14` | `ListPublishedAppAccess` | I&A | Project/app administration | authority to administer app access; business use not implied | read | ADMIT_CANDIDATE |
| `IAM-15` | `GrantPublishedAppAccess` | I&A | Project/app administration | exact Project/app + Account + admitted app role | command / CR-1 candidate | ADMIT_CANDIDATE |
| `IAM-16` | `ChangePublishedAppAccessRole` | I&A | Project/app administration | exact current app grant; `{admin,member}` only | command / CR-1 candidate | ADMIT_CANDIDATE |
| `IAM-17` | `RevokePublishedAppAccess` | I&A | Project/app administration | exact current app grant | narrowing command / CR-1 candidate | ADMIT_CANDIDATE |

Candidate subtraction question: determine whether `IAM-15` and `IAM-16` should be one semantic `SetPublishedAppAccess` command without hiding grant-vs-role-change concurrency semantics.

---

# 6. Fixed platform operation candidates — Journey A / Workspace

| ID | Semantic operation | Owner | Consumer/surface | Current authority / scope | Class | Disposition |
| --- | --- | --- | --- | --- | --- | --- |
| `WS-01` | `CreateWorkspace` | Workspace | trusted platform operator / first-access flow | F1 trusted Workspace creation authority; no public signup | command | ADMIT_CANDIDATE |
| `WS-02` | `GetWorkspace` | Workspace | Workspace shell/admin | current Workspace membership/disclosure | read | ADMIT_CANDIDATE |
| `WS-03` | `UpdateWorkspace` | Workspace | Workspace administration | exact Workspace + current administer authority | command | ADMIT_CANDIDATE |
| `WS-04` | `ListAreas` | Workspace | Workspace administration | exact Workspace; Area is optional | read | ADMIT_CANDIDATE |
| `WS-05` | `CreateArea` | Workspace | Workspace administration | exact Workspace + current administer authority | command | ADMIT_CANDIDATE |
| `WS-06` | `UpdateArea` | Workspace | Workspace administration | exact Area + current administer authority | command | ADMIT_CANDIDATE |

No `DeleteWorkspace`, `DeleteArea`, generic Organization tree, or hidden/default Workspace operation is admitted from current authority.

---

# 7. Fixed platform operation candidates — Journeys B/C / Project

| ID | Semantic operation | Owner | Consumer/surface | Current authority / scope | Class | Disposition |
| --- | --- | --- | --- | --- | --- | --- |
| `PRJ-01` | `ListProjects` | Project | Workspace Projects surface | current Workspace membership + Project disclosure/grants | read | ADMIT_CANDIDATE |
| `PRJ-02` | `GetProject` | Project | Project shell | exact Project + current disclosure/access | read | ADMIT_CANDIDATE |
| `PRJ-03` | `CreateProject` | Project + existing L7 composition | Workspace operator/admin | exact Workspace; atomically establishes Project + initial I&A grant | command / cross-owner atomic | ADMIT_CANDIDATE |
| `PRJ-04` | `UpdateProject` | Project | Project settings/admin | exact Project + current administer authority | command | ADMIT_CANDIDATE |
| `PRJ-05` | `ArchiveProject` | Project | Project administration | exact Project + current archive authority; archive does **not** unpublish/stop existing automations | command | ADMIT_CANDIDATE |
| `PRJ-06` | `DuplicateProject` | Project | Project administration | source Project authority + destination Workspace authority; default NO DATA; no credential/binding copy | command | ADMIT_CANDIDATE |
| `PRJ-07` | `RunInceptionInvestigation` | Project / existing L7 flow | greenfield/brownfield inception | exact Project; can inspect current source/contracts/data through admitted boundaries; no fake Change | command/investigation | ADMIT_CANDIDATE |
| `PRJ-08` | `GetApprovedProjectBaseline` | Project | Project/Builder | exact Project + current disclosure | read | ADMIT_CANDIDATE |
| `PRJ-09` | `ApproveProjectBaselineRevision` | Project | Project administrator / human checkpoint | exact candidate Baseline digest + current Project authority; stale candidate cannot win | decision/current-state command | ADMIT_CANDIDATE |
| `PRJ-10` | `GetProjectBrainBinding` | Project | Project Brain/Build/Release surfaces | exact Project; returns exact pinned binding + validation/update state when disclosable | read | ADMIT_CANDIDATE |
| `PRJ-11` | `SetProjectBrainBinding` | Project / existing L7 binding composition | Project administrator | exact Brain revision + Project intent + current conformance/authority | command/current-state | ADMIT_CANDIDATE |
| `PRJ-12` | `ClearProjectBrainBinding` | Project | Project administrator | exact current binding; narrowing/removal cannot inherit previous Brain use | narrowing command | ADMIT_CANDIDATE |
| `PRJ-13` | `ListProjectConnectionBindings` | Project | Project Integrations surface | exact Project + current disclosure | read | ADMIT_CANDIDATE |
| `PRJ-14` | `SetProjectConnectionBinding` | Project / existing L7 binding composition | Project administrator | exact qualified compatible ConnectionRevision + environment + Project current authority | command/current-state | ADMIT_CANDIDATE |
| `PRJ-15` | `RemoveProjectConnectionBinding` | Project | Project administrator | exact current binding; removal/narrowing | narrowing command | ADMIT_CANDIDATE |
| `PRJ-16` | `ListProjectCapabilities` | Project projection | Build/Capabilities/App authoring | exact Project; reports exact authored/release capability identities without granting invocation | read | ADMIT_CANDIDATE |
| `PRJ-17` | `GetProjectCapability` | Project projection | Build/Capabilities inspection | exact Project + exact capability identity; provider/runtime IDs subordinate | read | ADMIT_CANDIDATE |
| `PRJ-18` | `ListProjectDataResources` | Project | Data inspectability | exact Project; declared Product/read-model/source resources only; no arbitrary table/catalog browser | read | ADMIT_CANDIDATE |
| `PRJ-19` | `GetProjectDataResource` | Project | Data inspectability | exact declared resource + source/grain/freshness/coverage/provenance where material; never infers read-model completeness | read | ADMIT_CANDIDATE |
| `PRJ-20` | `ListProjectProductAgents` | Project projection | Project Agents surface | exact Project; Agent authored identity/revision/Release state only, not PAR runtime ownership | read | ADMIT_CANDIDATE |
| `PRJ-21` | `GetProjectProductAgent` | Project projection | Project Agent inspection | exact Project/Agent authoring identity + current immutable revisions/Release refs | read | ADMIT_CANDIDATE |
| `PRJ-22` | `ListWorkspaceProductAgents` | Project-owned filtered projection | Workspace access-filtered Agent catalog | current Workspace + per-Project/Agent disclosure; Project remains owner of each Agent definition; no fleet authority | read | ADMIT_CANDIDATE |

`PRJ-18/19` are Product-level declared data-resource projections, **not** a generic database explorer. `PRJ-22` is a filtered projection over Project-owned Agents and creates no Workspace Agent owner.

---

# 8. Fixed platform operation candidates — Journey C/O / Builder

| ID | Semantic operation | Owner | Consumer/surface | Current authority / scope | Class | Disposition |
| --- | --- | --- | --- | --- | --- | --- |
| `BLD-01` | `ListChanges` | Builder | Project Build/Activity | exact Project + current Builder disclosure | read | ADMIT_CANDIDATE |
| `BLD-02` | `GetChange` | Builder | Build | exact Project/Change + current disclosure | read | ADMIT_CANDIDATE |
| `BLD-03` | `CreateChange` | Builder | human states Product/maintenance/Agent intent | exact Project + approved Baseline/current change-creation authority | command | ADMIT_CANDIDATE |
| `BLD-04` | `GetChangePlan` | Builder | Build Plan lens | exact Change + current plan revision | read | ADMIT_CANDIDATE |
| `BLD-05` | `DecideChangePlanCheckpoint` | Builder | eligible Project operator/reviewer | exact Change/plan revision + current checkpoint eligibility; runtime cannot downgrade planning floor | decision/current-state command | ADMIT_CANDIDATE |
| `BLD-06` | `GetChangeProgress` | Builder | live checklist | Hub-owned Plan/item/Change truth; model narration never closes work | read | ADMIT_CANDIDATE |
| `BLD-07` | `GetChangeDiff` | Builder / Git projection | Build Diff lens | exact candidate/result lineage under Hub custody | read | ADMIT_CANDIDATE |
| `BLD-08` | `ListProjectSourceTree` | Project Git via Builder boundary | Code lens | exact Project/source revision + current source disclosure | read | ADMIT_CANDIDATE |
| `BLD-09` | `GetProjectSourceFile` | Project Git via Builder boundary | Code lens | exact Project/source revision/path + current source disclosure | read | ADMIT_CANDIDATE |
| `BLD-10` | `GetRunPreview` | Builder/MAR projection | Preview lens | exact candidate preview identity; `ready != verified != live`; last-good Preview preserved | read | ADMIT_CANDIDATE |
| `BLD-11` | `ListChangeFindings` | Builder | Build/Evidence | exact Change + current disclosure | read | ADMIT_CANDIDATE |
| `BLD-12` | `GetFinding` | Builder | investigator/reviewer | exact Finding + current disclosure | read | ADMIT_CANDIDATE |
| `BLD-13` | `CloseFinding` | Builder | eligible owner/reviewer | exact Finding + current resolution Evidence/authority; worker cannot self-close by prose | decision/current-state command | ADMIT_CANDIDATE |
| `BLD-14` | `ListChangeEvidence` | Builder projection | Build/Evidence | exact Change + Evidence visibility policy | read | ADMIT_CANDIDATE |
| `BLD-15` | `GetEvidence` | Builder projection | investigator/reviewer | exact Evidence identity/provenance; telemetry alone not promoted | read | ADMIT_CANDIDATE |
| `BLD-16` | `AskConexusAboutContext` | Builder | contextual Platform Consultant | exact selected resource/context + current server-derived access; grants no new authority | read/assistant interaction | ADMIT_CANDIDATE |
| `BLD-17` | `GetChangeExecutionDetail` | Builder | progressive technical inspection | exact Change; may project WorkUnit/ActorRun identities and current states without making them primary workflow | read | ADMIT_CANDIDATE |

### 8.1 Change acceptance disposition

A direct generic human `AcceptChange` operation is **not admitted** from current authority.

`bld.change_acceptance` is a current-proof/acceptance owner fact. Human decisions enter through the exact accepted checkpoint/criteria mechanisms; material verification and Builder owner settlement produce current acceptance Evidence/fact, and `ComposeRelease` rechecks the required current proof. A generic `AcceptChange` button would risk bypassing criteria/verifier semantics.

```text
BLD-U01 direct AcceptChange = REJECT
```

No direct `CreateWorkUnit`, arbitrary plan JSON patch, `SetWorkItemStatus`, `CreateActorRun`, `ResumeSandbox`, or `MarkVerified` Product operation is admitted. Those are Builder owner/runtime mechanics derived from accepted Change/Plan authority.

---

# 9. Fixed platform operation candidates — Journeys D/E/G / Brain

| ID | Semantic operation | Owner | Consumer/surface | Current authority / scope | Class | Disposition |
| --- | --- | --- | --- | --- | --- | --- |
| `BRN-01` | `GetWorkspaceBrain` | Brain | Workspace Brain surface / Project inspection | exact Workspace Brain + current disclosure | read | ADMIT_CANDIDATE |
| `BRN-02` | `ListBrainRevisions` | Brain/Registry semantic projection | Brain history/update inspection | exact Workspace Brain + current disclosure | read | ADMIT_CANDIDATE |
| `BRN-03` | `GetBrainRevision` | Brain/Registry semantic projection | Brain/Project/Release inspection | exact immutable revision; availability does not imply Project adoption | read | ADMIT_CANDIDATE |
| `BRN-04` | `StartBrainDiscovery` | Brain | Workspace/Project semantic discovery | exact Workspace/Project + admitted read-only Connection/Gateway scope; proposals remain hypotheses | command/investigation | ADMIT_CANDIDATE |
| `BRN-05` | `ListKnowledgeProposals` | Brain | Brain review | exact Workspace Brain + current review visibility | read | ADMIT_CANDIDATE |
| `BRN-06` | `GetKnowledgeProposal` | Brain | Brain review | exact proposal + provenance/hypothesis state | read | ADMIT_CANDIDATE |
| `BRN-07` | `SubmitKnowledgeProposal` | Brain | human/Builder/Agent-mediated reusable-learning path | exact Workspace Brain + provenance; never self-publishes | command | ADMIT_CANDIDATE |
| `BRN-08` | `DecideKnowledgeProposal` | Brain | eligible Brain human reviewer | exact proposal + current review authority; machine confidence not publication authority | decision | ADMIT_CANDIDATE |
| `BRN-09` | `PublishBrainRevision` | Brain | Brain owner/operator | exact reviewed Brain source/candidate + validation/security gates → immutable revision | consequential command | ADMIT_CANDIDATE |
| `BRN-10` | `GetBrainHealth` | Brain | Brain/Project/Agent inspection | exact Brain/binding context; `UNVERIFIED/VALID/SUSPECT/INVALID/CHECK_ERROR` preserved | read | ADMIT_CANDIDATE |
| `BRN-11` | `RunBrainHealthProbe` | Brain / existing L7 flow | authorized operator/system | exact Brain/binding/source scope; probe output cannot rewrite published meaning | command/proof | ADMIT_CANDIDATE |
| `BRN-12` | `RunAnalyticQuery` | Brain/Gateway governed read regime | admitted app/human caller; Product Agent only if separately projected | exact Project + Brain binding + curated dataset + semantic IDs + current read authority; SELECT-only/restricted plan | read | ADMIT_CANDIDATE |

### 9.1 Discovery interview disposition

No separate `BrainDiscoverySession` owner/record or generic conversational operation is invented. The current candidate treats directed profiling + generated questions + human factual/review input as one bounded Discovery interaction whose durable authority closes through KnowledgeProposal/review/publication.

```text
BRN-U01 separate generic interview operation = REJECT_FOR_NOW
```

If 4C later proves the human interaction cannot be expressed without a separately durable current subject, reopen only the Brain interaction contract.

No vector/RAG search operation, free-form SQL operation, memory-publish operation, or machine `ApproveSemanticMapping` authority is admitted.

---

# 10. Fixed platform operation candidates — Journey F / Connections

| ID | Semantic operation | Owner | Consumer/surface | Current authority / scope | Class | Disposition |
| --- | --- | --- | --- | --- | --- | --- |
| `CON-01` | `ListConnectorDefinitions` | Connections/platform pack projection | Connection creation UX | current admitted Connector definitions only; provider existence grants no Product authority | read | ADMIT_CANDIDATE |
| `CON-02` | `GetConnectorDefinition` | Connections/platform pack projection | Connection creation/inspection | exact Connector version/definition | read | ADMIT_CANDIDATE |
| `CON-03` | `ListConnections` | Connections | Workspace/Project Connections surface | exact Workspace/Project scope + current disclosure; no cross-Workspace leakage | read | ADMIT_CANDIDATE |
| `CON-04` | `GetConnection` | Connections | Connection/Project binding inspection | exact Connection + ownerScope containment + current disclosure | read | ADMIT_CANDIDATE |
| `CON-05` | `CreateConnection` | Connections | Workspace/Project administration | exact ownerScope/owner + Connector; no implicit sibling reuse | command | ADMIT_CANDIDATE |
| `CON-06` | `ReviseConnection` | Connections | Connection administration | exact current logical Connection + new versioned non-secret semantics | command/current-state | ADMIT_CANDIDATE |
| `CON-07` | `SetConnectionCredential` | Connections + CredentialBackend boundary | write-only trusted administration | exact Connection/current credential authority; plaintext never read back | consequential write-only command | ADMIT_CANDIDATE |
| `CON-08` | `QualifyConnection` | Connections / existing L7 flow | authorized operator/system | exact ConnectionRevision/environment + real provider/source Evidence | command/proof | ADMIT_CANDIDATE |
| `CON-09` | `GetConnectionQualification` | Connections | Connection/Project binding UX | exact revision/environment; `configured != qualified != bound != healthy` remains visible | read | ADMIT_CANDIDATE |

No `ReadConnectionSecret`, arbitrary `TestURL`, generic `FetchWithCredential`, lowest-common-denominator provider executor, or cross-Workspace Connection-share operation is admitted.

---

# 11. Fixed platform operation candidates — Journey H / Release, Promotion and serving

| ID | Semantic operation | Owner | Consumer/surface | Current authority / scope | Class | Disposition |
| --- | --- | --- | --- | --- | --- | --- |
| `REL-01` | `ListReleases` | Release | Project Versions | exact Project + current version disclosure | read | ADMIT_CANDIDATE |
| `REL-02` | `GetRelease` | Release | Versions/Build/Published App admin | exact immutable Release composition + current disclosure | read | ADMIT_CANDIDATE |
| `REL-03` | `ComposeRelease` | Release / existing L7 flow | verified candidate handoff | exact current accepted proof + source/artifact/binding/config identities; no mutable latest | consequential command/current-proof | ADMIT_CANDIDATE |
| `REL-04` | `ListPromotions` | Release | Project Versions/operations | exact Project/environment + current disclosure | read | ADMIT_CANDIDATE |
| `REL-05` | `GetPromotion` | Release | Project Versions/operations | exact Promotion history/current state | read | ADMIT_CANDIDATE |
| `REL-06` | `PromoteRelease` | Release / existing L7 flow | eligible Project operator/decision maker | exact Release + target environment + current proof/conformance + expected pointer generation; max one nonterminal `(Project,PROD)` | consequential decision/command | ADMIT_CANDIDATE |
| `REL-07` | `GetProjectServingState` | Release/MAR projection | Versions/Published App administration | exact active pointer + served verification state; AVAILABLE/pointer swap never masquerades as served | read | ADMIT_CANDIDATE |
| `REL-08` | `GetEnvironmentConformance` | Release | promotion/admin inspection | real target PG/privileges/migrations/config/bindings/current pointer checks | read/proof | ADMIT_CANDIDATE |

Rollback is **not** a separate semantic operation in the candidate: it is another governed `PromoteRelease` targeting an eligible previously activated Release. `VerifyServedRelease` is owner/runtime proof mechanics after promotion, not a caller command merely for symmetry.

---

## 12. Journey H Published Application boundary

The platform operations already admitted above cover authentication/access/serving authority:

```text
IAM-13 GetPublishedAppAccessContext
IAM-14..17 app access administration
REL-07 GetProjectServingState
```

The Published Application's **business operations** are not fixed Conexus platform operations. They are the exact Project-defined `Ops(R)` admitted through §4.

Static asset/route byte serving is serving mechanics under current app authorization and exact active Release, not one business Product operation per file/path.

---

# 13. Journeys I/J — Product Agent authoring and use

## 13.1 Authoring is Builder authority, not PAR CRUD

Current Agent authoring entry points:

```text
Project → Agents → New Agent
Project → Agent → Change with Conexus
Project → Build → natural-language Agent intent
```

all converge to:

```text
BLD-03 CreateChange
→ same Builder/Change/Plan/diff/proof path
→ candidate agent/v1
→ immutable ArtifactRevision
→ exact Release
```

Therefore:

```text
CreateProductAgentDefinition direct PAR op = REJECT
UpdateProductAgentDefinition direct PAR op = REJECT
PublishProductAgentOutsideRelease          = REJECT
```

`PRJ-20/21` provide control-plane inspection of Project-owned Agent definitions; PAR starts only at runtime semantics.

## 13.2 PAR runtime operation candidates

| ID | Semantic operation | Owner | Consumer/surface | Current authority / scope | Class | Disposition |
| --- | --- | --- | --- | --- | --- | --- |
| `PAR-01` | `ListConversations` | PAR | Published App Agent UX / authorized Project inspection | exact Project/Agent + current app/owner disclosure; Conversation existence never grants authorization | read | ADMIT_CANDIDATE |
| `PAR-02` | `GetConversation` | PAR | Published App Agent UX | exact Conversation + current exact Project/Agent/app authority; provider thread id remains hidden mechanism | read | ADMIT_CANDIDATE |
| `PAR-03` | `CreateConversation` | PAR | Published App human Agent UX | exact active Release + admitted Agent + current app access; creates Conexus Conversation identity | command | ADMIT_CANDIDATE |
| `PAR-04` | `SendProductAgentTurn` | PAR | interactive Published App user | exact Conversation + current app/Agent/Release authority + typed app context refs; admits exact AgentRun | consequential command | ADMIT_CANDIDATE |
| `PAR-05` | `RunProductAgentHeadless` | PAR | authorized manual headless consumer/operator | exact active Release/Agent + current headless authority; threadless by default | consequential command | ADMIT_CANDIDATE |
| `PAR-06` | `ListAgentRuns` | PAR | Agent/Project technical inspection | exact Project/Agent/Conversation filters + current disclosure | read | ADMIT_CANDIDATE |
| `PAR-07` | `GetAgentRun` | PAR | user/operator/investigator | exact AgentRun + current disclosure; `COMPLETED != every effect succeeded` | read | ADMIT_CANDIDATE |
| `PAR-08` | `ListApprovalRequests` | PAR | eligible approver UX / run inspection | exact Project/AgentRun + current approval disclosure/eligibility | read | ADMIT_CANDIDATE |
| `PAR-09` | `GetApprovalRequest` | PAR | exact eligible approver/investigator | sealed subject + exact args/content/digest + current status; no widening | read | ADMIT_CANDIDATE |
| `PAR-10` | `DecideApprovalRequest` | PAR | current eligible human | exact sealed proposal + current eligibility; only `ALLOW_ONCE` or `DENY` are direct human decisions; changed subject needs new request | decision / CR-1 + Gateway atomicity candidate | ADMIT_CANDIDATE |
| `PAR-11` | `ListAgentTriggers` | PAR | Project Agent administration | exact Project/Agent + current trigger administration disclosure | read | ADMIT_CANDIDATE |
| `PAR-12` | `GetAgentTrigger` | PAR | Project Agent administration | exact TriggerRevision/current state + current disclosure | read | ADMIT_CANDIDATE |
| `PAR-13` | `CreateScheduleTrigger` | PAR | Project Agent administration | exact active/evolvable Agent + current Project authority; archived Project blocks creation | command | ADMIT_CANDIDATE |
| `PAR-14` | `ReviseScheduleTrigger` | PAR | Project Agent administration | exact current TriggerRevision + current authority; material schedule semantics become new revision | command/current-state | ADMIT_CANDIDATE |
| `PAR-15` | `EnableAgentTrigger` | PAR | Project Agent administration | exact current TriggerRevision + active Project/Release/current authority; archived Project cannot enable | consequential command | ADMIT_CANDIDATE |
| `PAR-16` | `DisableAgentTrigger` | PAR | Project Agent administration | exact TriggerRevision; explicit narrowing remains allowed for archived Project | narrowing command | ADMIT_CANDIDATE |

`EXPIRED` and `STALE` ApprovalRequest states are owner/system outcomes, not caller commands. Schedule fire/occurrence admission is Technical/internal ingress, not another Product operation.

No direct Product operation is admitted for Mastra thread creation/resume, tool registry mutation, runtime snapshot mutation, provider message IDs, or `MarkAgentRunCompleted`.

---

# 14. Journey K — Gateway effect authority and receipts

The Product command that requests business effect remains the exact Project-defined `Action`/Integration Operation or exact Product Agent tool invocation. Gateway does **not** become a second business-command API.

Gateway's effect admission/replay/idempotency execution path is owner-internal after an admitted semantic command and, when needed, exact PAR approval.

Read-only inspectability is Product-visible:

| ID | Semantic operation | Owner | Consumer/surface | Current authority / scope | Class | Disposition |
| --- | --- | --- | --- | --- | --- | --- |
| `GW-01` | `ListEffectAttempts` | Gateway | AgentRun/Project Activity/investigator | exact Project and originating semantic run/operation scope + current disclosure; does not imply effect retry authority | read | ADMIT_CANDIDATE |
| `GW-02` | `GetEffectAttempt` | Gateway | exact run/effect technical inspection | exact EffectAttempt + receipt/reconciliation/provenance; `OUTCOME_UNKNOWN` preserved | read | ADMIT_CANDIDATE |

Explicitly internal / rejected as public operations:

```text
AdmitEffect               = INTERNAL owner path
ClaimIdempotency          = INTERNAL owner path
ResumeEffect              = INTERNAL owner path
RetryEffect               = REJECT generic Product operation
MarkEffectSucceeded       = REJECT
ResolveUnknownAsFailure   = REJECT
```

A current unresolved effect fences both replay and new duplicate-scope admission until reconciliation establishes a safe owner result.

---

# 15. Journey L — managed `job/v1`

The job definition/schedule is an exact Release artifact inspected through Project capabilities. MAR owns admitted occurrence/run semantics, not a generic scheduler Product.

| ID | Semantic operation | Owner | Consumer/surface | Current authority / scope | Class | Disposition |
| --- | --- | --- | --- | --- | --- | --- |
| `MAR-01` | `ListManagedJobRuns` | MAR | Project operations/Data/Activity | exact Project + Release/job filters + current disclosure | read | ADMIT_CANDIDATE |
| `MAR-02` | `GetManagedJobRun` | MAR | Project operations/investigator | exact JobRun + exact pinned Release/job/current state | read | ADMIT_CANDIDATE |
| `MAR-03` | `RunManagedJobNow` | MAR | authorized Project operator | exact currently served Release + admitted `job/v1` + current authority; manual occurrence uses normal single-flight/coalesce laws | command | ADMIT_CANDIDATE |

No direct operations are admitted for:

```text
ReplayMissedSlots
CreateCron
PauseQueue
ForceRedelivery
MarkJobSucceeded
ExecuteArbitraryProjectJobCode
```

Fixed-interval occurrence creation/redelivery/restart handling is MAR/queue mechanics under exact Release and freshness law. At most one current catch-up is owner logic, never a user backlog operation.

---

# 16. Activity / Audit / cost / technical observation reads

Observability provides **projections/evidence**, never current business authority.

| ID | Semantic operation | Owner | Consumer/surface | Current authority / scope | Class | Disposition |
| --- | --- | --- | --- | --- | --- | --- |
| `OBS-01` | `ListProjectActivity` | Observability & Audit projection | Project Activity / investigator | exact Project + current disclosure; entries reference owner facts rather than replacing them | read | ADMIT_CANDIDATE |
| `OBS-02` | `GetExecutionObservationDetail` | Observability & Audit projection | technical investigator | exact closed supported subject ref (e.g. ActorRun/AgentRun/JobRun/EffectAttempt) + current disclosure; telemetry cannot decide terminal truth | read | ADMIT_CANDIDATE |
| `OBS-03` | `GetProjectUsageCostSummary` | Observability & Audit projection | Project operator/investigator | exact Project/period + provenance states; missing != zero, calculated != reported/reconciled | read | ADMIT_CANDIDATE |
| `OBS-04` | `ListAuditRecords` | Observability & Audit | authorized auditor/admin | exact Workspace/Project scope + current audit disclosure | read | ADMIT_CANDIDATE |
| `OBS-05` | `GetAuditRecord` | Observability & Audit | authorized auditor/investigator | exact immutable audit fact + current disclosure | read | ADMIT_CANDIDATE |

`OBS-02` uses a **closed typed subject union**, not a universal arbitrary Resource/Status envelope. Owner-specific current truth remains resolved at the owning operation (`GetAgentRun`, `GetManagedJobRun`, `GetPromotion`, etc.).

---

# 17. F1 operational capabilities not admitted as ordinary Product API

Current F1 also requires backup/restore/emergency-stop correctness and Worker/Golden evaluations. Their current consumer/mechanism is operational/engineering rather than an accepted ordinary Product API surface.

| Capability | 4A disposition |
| --- | --- |
| backup execution | OPERATIONS CONTROL / 4D–first-production realization |
| restore execution | OPERATIONS CONTROL / first-production recovery procedure; cannot be ordinary self-authorizing Product command |
| emergency stop | OUT-OF-BAND CONTROL; no app-ingress dependency implied |
| recovery recertification | owner-specific operational path; no generic `ActivateRecoveredSystem` Product authority admitted |
| Budget Analyzer golden benchmark | Builder/engineering evaluation capability; not a business Product operation |
| Worker Eval | Builder engineering/evaluation capability; no generic model leaderboard Product domain admitted |

A future real operator UI can reopen only the smallest surface needed to expose these controls safely; the infrastructure requirement itself does not manufacture HTTP/Product operations now.

---

# 18. Journey coverage checkpoint — second derivation wave

| Journey | Current 4A coverage state |
| --- | --- |
| A — first access / Workspace | COVERED_CANDIDATE (`IAM-*`, `WS-*`) |
| B — Project Inception / Baseline | COVERED_CANDIDATE (`PRJ-*`) |
| C — Plan / build / verify / publish | COVERED_CANDIDATE (`BLD-*`, `REL-*`); direct generic Change acceptance rejected |
| D — Brain assisted Discovery | COVERED_CANDIDATE (`BRN-*`); no separate Discovery-session owner admitted |
| E — Brain publish / bind / feedback | COVERED_CANDIDATE (`BRN-*`, `PRJ-10..12`) |
| F — Connection / Integration | COVERED_CANDIDATE (`CON-*`, `PRJ-13..15`, Project capability grammar) |
| G — Data / static Query / AnalyticQuery | COVERED_CANDIDATE (`PRJ-18/19`, Project Query grammar, `BRN-12`) |
| H — publish/use business application | COVERED_CANDIDATE (`REL-*`, `IAM-13..17`, exact Project `Ops(R)`) |
| I — create/evolve Product Agent | COVERED_CANDIDATE through `BLD-03`, `PRJ-20/21`; direct PAR authoring CRUD rejected |
| J — use Product Agent | COVERED_CANDIDATE (`PAR-01..16`) |
| K — exact effect approval | COVERED_CANDIDATE (`PAR-08..10`, Gateway internal admission, `GW-01/02`) |
| L — managed sync/job | COVERED_CANDIDATE (`MAR-01..03`, Project capability inspection) |
| M — duplicate Project | COVERED_CANDIDATE (`PRJ-06`) |
| N — Budget Analyzer | **BLOCKED_ON_EXACT_SEMANTIC_RESULT_INVENTORY** |
| O — maintenance/reusable learning | COVERED_CANDIDATE (`BLD-03`, `BRN-07..09`, normal Release path) |

This table asserts only derivation coverage, not 4A acceptance. The remaining material blocker is the first vertical semantic/result contract plus final Permission/subtraction/proof closure.

---

# 19. Budget Analyzer operation census blocker — `4A-BUDGET-01`

Current authority fixes the composition:

```text
Workspace Brain
+ Sankhya Connection
+ Budget Analyzer Project/Baseline
+ exact Brain/Connection bindings
+ governed sync
+ Project analytical read model
+ registered read-only Query operations
+ React dashboard
+ exact Release / Published App
```

It deliberately does **not** yet fix the concrete supported result inventory or Query count. 3O requires that the first real candidate enumerate Product-visible analytical results, link each supported result to current semantic authority and cover each materially distinct transformation-rule class.

Therefore:

```text
"budget / pending / conversion" prose
-X-> invent exact KPI formulas
-X-> invent Query operation count
-X-> invent dashboard response contract

no current exact semantic/result inventory
→ N_budget = UNRESOLVED_FOR_4A
```

4A must resolve this through the **smallest current Product/Brain semantic authority** before it can ratify the first-vertical application census. Research/Mitra behavior cannot supply missing business meaning.

This is a closure blocker, not permission to start Brain implementation or live Sankhya work.

---

# 20. Blueprint / Forge design-hypothesis disposition — first pass

Current Product authority already has:

```text
Project Inception / Discovery / approved Baseline
Change
PlanningDepth + RigorProfile
visual Plan/checkpoints
Builder / CodingSession / WorkUnit / ActorRun
Platform Consultant
independent material verifier
Release / Promotion
```

Therefore the current 4A candidate disposition is:

```text
Blueprint as new semantic owner/domain       = REJECT
Forge as new semantic owner/domain           = REJECT
Blueprint/Forge as mandatory new APIs        = REJECT

planning-harness behavior                    = PRESERVE as Builder/Project orchestration design input
possible UX labels/modes                     = 4C question only; must not create new authority by labeling
Paved Road realization                       = 4D
```

This disposition may be reopened only if a real current interaction cannot be expressed through existing Project/Builder authority without a new Product meaning.

---

# 21. Permission derivation — next closure

4A will derive ordinary Permission vocabulary from the surviving concrete operation set; it will **not** use the Published App roles or narrative personas as a shortcut.

The current owner-fact families that Permissions must not flatten include:

```text
Workspace membership/admin authority
Project grant / Project administration
Builder contribution/review/checkpoint authority
Brain read/discovery/review/publication authority
Connection administer/qualify authority
Release compose/promote authority
Published App administer authority
Published App business-use role `{admin,member}`
Product Agent use / trigger / approval authority
Audit/technical investigation authority
```

Published App `{admin,member}` roles are not automatically Control Plane Permissions.

`PlanningDepth`, `RigorProfile`, Keycloak role/group claims and runtime/provider identities are not ordinary Permissions.

Before Permission names are frozen, the next pass must answer for every command/read:

```text
which existing grant/membership/app-access fact authorizes it?
is a distinct semantic Permission genuinely required?
can two operations safely share one Permission without widening authority?
would a proposed Permission merely mirror a screen or CRUD noun?
```

---

# 22. Immediate negative controls for this candidate

The following proposals are rejected unless a later material gap proves otherwise:

```text
CreateWorkflow
ExecuteWorkflow
GenericApprove
GenericRetry
GenericSync
GenericRefresh
SetAnyStatus
ExecuteCapability(anySlug, anyInput)
ExecuteSql
ExecuteProviderOperation(provider, name, payload)
ReadConnectionSecret
SetCurrentReleaseWithoutPromotion
MarkServedVerified
MarkChangeVerified
PublishBrainFromModelMemory
CreateProductAgentOutsideChange
GrantFromKeycloakRole
GetBlobByStorageKeyAsAuthorization
ReplayMissedSlots
CreateCron
ForceQueueRedelivery
MarkAgentRunCompleted
MarkEffectSucceeded
ActivateRecoveredSystem
```

Each rejected shortcut protects a current accepted authority boundary rather than a naming preference.

---

# 23. Next 4A derivation work

Continue in this order:

```text
1. derive candidate ordinary Permission vocabulary from the surviving operations
2. cross-check every operation against 15 journeys + whole-product scenario gate
3. cross-check every operation against 13 owners + 46 durable record classes
4. identify records with no Product operation by design vs missing consumer
5. run subtractive attack: merge/remove CRUD-symmetric/speculative operations
6. bind idempotency/current-authority/CR-1/audit-required obligations per surviving command
7. resolve 4A-BUDGET-01 through the smallest Product/Brain authority
8. produce executable census/consistency guard once the semantic candidate stabilizes
9. independent Fable challenge over the exact consolidated candidate
10. only after corrections/ratification freeze `N_platform`, Permission vocabulary and `N_budget`
```

Do not begin 4B/OpenAPI, frontend wireframes, concrete SDKs/Paved Road, runtime selection or Product code while this ledger is open.