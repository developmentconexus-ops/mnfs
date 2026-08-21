# Conexus OS — Product Operation Ledger

> **Status:** CLOSED CANDIDATE / 4A OPEN / INDEPENDENT REVIEW ADJUDICATED / NOT RATIFIED
> **Authority:** derived only from current accepted Product/architecture authority routed by `docs/index.md`, the 4A contract and the operator-approved first Budget Analyzer semantic contract.
> **Mutable program status:** owned only by `docs/roadmap.md`.

This ledger is the canonical 4A Product-operation authority. It is intentionally **not** HTTP/OpenAPI, frontend, database, SDK or runtime design and it does not authorize Product implementation.

The ledger closes three different surfaces because Conexus is a software-publishing platform rather than one fixed business application:

```text
fixed Conexus platform operations = 114
Project-defined operations        = exact finite Ops(R) admitted by the grammar in §4
first Budget Analyzer operations  = 2
ordinary Conexus Permissions      = 25 (owned by permission-contract.md)
```

The numbers are derivation results, not targets. The complete candidate survived independent Fable challenge with bounded consistency/precision corrections and remains unratified until explicit operator 4A ratification.

---

## 1. Surface closure

### 1.1 Fixed platform census

```text
N_platform = 114
platform operations with named owner       = 114
platform operations with real consumer     = 114
platform operations with authority mapping = 114
orphaned platform operations                = 0
speculative platform operations             = 0
```

### 1.2 Project-defined capability grammar

Every exact Release has a finite exact operation set:

```text
exact Release R
→ exact Ops(R)
→ each operation has one semantic owner
→ exact consumer + principal + ingress + authorization + scope
→ exact read/effect/outcome/current-authority obligations
→ generated/conforming wire only later in 4B
```

There is no global mutable Product authority `execute(anySlug, anyInput)`.

### 1.3 First Budget Analyzer census

The operator-approved first-vertical semantic contract closes:

```text
BUD-01 AnalyzePendingBudgets
BUD-02 ListPendingBudgets
N_budget = 2
```

Both are exact Project-defined registered `Query` operations of the Budget Analyzer Release, not fixed Conexus platform operations.

---

## 2. Principal / actor classes

| Class | Meaning | Authority root |
| --- | --- | --- |
| `HUMAN_ACCOUNT_SESSION` | authenticated human mapped to one Conexus Account and opaque Conexus session | current server-resolved Workspace/Project/owner grants |
| `PUBLISHED_APP_HUMAN` | authenticated human using one exact Published App | current `published_app_access` + exact app role `{admin, member}` + exact active Release |
| `PAR_AGENT_RUN_CONTEXT` | one already-admitted Product AgentRun | exact Release-pinned ToolProjection + PAR/Gateway owner facts; model identity is not principal authority |
| `MAR_JOB_RUN_CONTEXT` | one already-admitted managed JobRun | exact Project/Release/job occurrence + current owner gates; queue identity is not authority |
| `SYSTEM_OWNER_TRANSITION` | owner-internal transition after admitted command/event/proof | no public Permission; current owner facts only |
| `DEDICATED_APPLICATION_PRINCIPAL` | future real DEDICATED service principal | exact `SERVICE_SCOPED` projection only; no concrete F1 operation is admitted without a real consumer |

Explicit non-principals:

```text
Keycloak role/group/organization
Mastra Agent/thread/workflow identity
E2B sandbox/process identity
trace/span/provider request id
storage key/path/url
browser-supplied role/project/release/approval ids
```

---

## 3. Ingress classes

| Code | Product meaning |
| --- | --- |
| `CP` | authenticated Control Plane Product interaction |
| `PA` | exact Published Application human Product interaction |
| `HEADLESS` | explicit Product-Agent headless invocation surface |
| `PAR_TOOL` | exact Product Agent ToolProjection invocation of an admitted Project/Brain operation |
| `MAR_JOB` | exact managed JobRun projection invoking an admitted Project capability |
| `SYSTEM` | owner-internal transition/proof/runtime path; not a public Product operation |

OIDC callback/redirect, provider callback/token refresh, queue delivery/redelivery, model-provider calls, E2B calls, Git transport, Blob/CAS URLs, static-byte transport, owner runtime callbacks, backup/restore and emergency-stop controls are protocols/mechanics/operations control, not Product operations by existence.

---

## 4. Project-defined capability admission grammar

### 4.1 Admitted regimes

| Regime | Meaning | Required closure |
| --- | --- | --- |
| registered `Query` | exact Project-defined read | exact input/output; read-only semantics; named consumer; exact Release/source/binding scope; truthful freshness/outcome; `IC0` |
| registered `Action` | exact Project-defined consequential/business command | exact owner semantics; current authorization/preconditions; at least current-state protection; `IC3` when consequential intake can repeat; `IC4` whenever an external/ambiguous effect can escape |
| Integration Operation | exact provider-aware Project capability where provider-specific meaning is honest | exact Connection/binding/revision/environment; Gateway last mile; declared read/effect scope; effectful operations require `IC4` idempotency/reconciliation semantics |

`AnalyticQuery` is not an arbitrary Project slug. It remains the fixed Brain-governed platform read regime `BRN-12`.

### 4.2 Required declaration

A Project-defined operation is inadmissible unless its exact Release authority closes:

```text
semantic identity/name
single Product/Project semantic owner
operation regime
input + output meaning
consumer class
principal + ingress
current authorization route
Workspace/Project/Published-App scope
required Brain/Connection/environment/revision pins
read/effect class
knowledge/freshness/outcome semantics
idempotency/reconciliation where consequential
concurrency/current-state requirements
proof + deterministic negative control
```

### 4.3 Forbidden authority

```text
execute(anySlug, anyInput)
execute(anySql)
execute(anyProviderOperation)
caller-selected Connection
a caller-selected target URL
mutable-latest Query/Action/Agent
unregistered runtime tool creation
```

Internal dispatch by identifier is only mechanism **after** exact Release admission.

A Project operation is not automatically a Product-Agent tool. PAR may expose it only when the exact Release + Agent ToolProjection admits that exact operation. A managed `job/v1` is likewise not a fourth generic business-operation regime; its work can invoke only exact governed Project/Gateway capabilities.

Attachments/private bytes are carrier properties of exact owning operations, never a global File Manager (`GetBlob(storageKey)` / `UploadAnyFile` are rejected).

---

# 5. Fixed Conexus platform census

The tables below are the exact 114 Product operations. IDs deliberately remain stable around subtracted candidates so review history does not silently renumber authority.

## 5.1 Identity & Access — 16

| ID | Operation | Owner | Consumer / authority root | Class |
| --- | --- | --- | --- | --- |
| `IAM-01` | `GetControlPlaneAccessContext` | I&A | Control Plane shell; current Account session and disclosable context | read |
| `IAM-02` | `EndSession` | I&A | authenticated human; exact current Conexus session | command |
| `IAM-03` | `ProvisionAccount` | I&A | trusted platform operator/admin | command |
| `IAM-04` | `ListWorkspaceMembers` | I&A | Workspace administration | read |
| `IAM-05` | `AddWorkspaceMember` | I&A | exact Workspace membership administration | command/current-authority |
| `IAM-06` | `RemoveWorkspaceMember` | I&A | exact Workspace; narrowing | narrowing command/current-authority |
| `IAM-07` | `GrantAccountProjectAccess` | I&A | exact Workspace + contained Project | command/current-authority |
| `IAM-08` | `RevokeAccountProjectAccess` | I&A | exact Project; narrowing | narrowing command/current-authority |
| `IAM-09` | `AddAreaMember` | I&A | exact Area in Workspace | command |
| `IAM-10` | `RemoveAreaMember` | I&A | exact Area; narrowing | narrowing command |
| `IAM-11` | `GrantAreaProjectAccess` | I&A | exact Area + Project in same Workspace | command/current-authority |
| `IAM-12` | `RevokeAreaProjectAccess` | I&A | exact Area + Project; narrowing | narrowing command/current-authority |
| `IAM-13` | `GetPublishedAppAccessContext` | I&A | exact Published App human; current app access/role | read |
| `IAM-14` | `ListPublishedAppAccess` | I&A | Project/app administration; business use not implied | read |
| `IAM-15` | `SetPublishedAppAccess` | I&A | exact Project/app + Account + `{admin,member}` + expected current grant state, including explicit absent state on create | command/current-authority |
| `IAM-17` | `RevokePublishedAppAccess` | I&A | exact current app grant; narrowing | narrowing command/current-authority |

`IAM-16 ChangePublishedAppAccessRole` was subtracted into `IAM-15`: grant and role change are one Product meaning over `iam.published_app_access`; wire-level create/update/precondition detail belongs to 4B.

## 5.2 Workspace — 6

| ID | Operation | Owner | Consumer / authority root | Class |
| --- | --- | --- | --- | --- |
| `WS-01` | `CreateWorkspace` | Workspace | trusted F1 operator/first-access flow | command |
| `WS-02` | `GetWorkspace` | Workspace | current Workspace member/admin disclosure | read |
| `WS-03` | `UpdateWorkspace` | Workspace | exact Workspace administration | command/current-state |
| `WS-04` | `ListAreas` | Workspace | exact Workspace administration | read |
| `WS-05` | `CreateArea` | Workspace | exact Workspace administration | command |
| `WS-06` | `UpdateArea` | Workspace | exact Area + Workspace administration | command/current-state |

No `DeleteWorkspace`, `DeleteArea`, generic Organization tree or hidden/default Workspace operation is admitted.

## 5.3 Project — 22

| ID | Operation | Owner | Consumer / authority root | Class |
| --- | --- | --- | --- | --- |
| `PRJ-01` | `ListProjects` | Project | Workspace Projects surface; current disclosure/grants | read |
| `PRJ-02` | `GetProject` | Project | exact Project disclosure/access | read |
| `PRJ-03` | `CreateProject` | Project + accepted L7 composition | exact Workspace; atomically establishes Project + initial I&A grant | command/cross-owner atomic |
| `PRJ-04` | `UpdateProject` | Project | exact Project administration | command/current-state |
| `PRJ-05` | `ArchiveProject` | Project | exact Project archive authority; does not unpublish/stop automations | command/current-state |
| `PRJ-06` | `DuplicateProject` | Project | source authority + destination Workspace create authority; default NO DATA; no credential/binding copy | command/cross-scope |
| `PRJ-07` | `RunInceptionInvestigation` | Project | exact greenfield/brownfield Project; governed read-only source inspection where admitted | investigation command |
| `PRJ-08` | `GetApprovedProjectBaseline` | Project | exact Project/Baseline disclosure | read |
| `PRJ-09` | `ApproveProjectBaselineRevision` | Project | exact candidate Baseline digest + current approval authority | decision/current-state |
| `PRJ-10` | `GetProjectBrainBinding` | Project | exact pinned binding + validation/update state | read |
| `PRJ-11` | `SetProjectBrainBinding` | Project + accepted L7 composition | exact immutable Brain revision + conformance + Project authority | command/current-state |
| `PRJ-12` | `ClearProjectBrainBinding` | Project | exact current binding; narrowing | narrowing command |
| `PRJ-13` | `ListProjectConnectionBindings` | Project | exact Project disclosure | read |
| `PRJ-14` | `SetProjectConnectionBinding` | Project + accepted L7 composition | exact qualified compatible ConnectionRevision/environment | command/current-state |
| `PRJ-15` | `RemoveProjectConnectionBinding` | Project | exact current binding; narrowing | narrowing command |
| `PRJ-16` | `ListProjectCapabilities` | Project projection | exact authored/Release capabilities; no invocation grant | read |
| `PRJ-17` | `GetProjectCapability` | Project projection | exact Project/capability identity | read |
| `PRJ-18` | `ListProjectDataResources` | Project | declared Product/read-model/source resources only | read/provenance |
| `PRJ-19` | `GetProjectDataResource` | Project | exact resource + grain/freshness/coverage/provenance | read/provenance |
| `PRJ-20` | `ListProjectProductAgents` | Project projection | authored Agent identities/revisions/Release state | read |
| `PRJ-21` | `GetProjectProductAgent` | Project projection | exact Agent authoring identity/revisions/Release refs | read |
| `PRJ-22` | `ListWorkspaceProductAgents` | Project-owned filtered projection | Workspace access-filtered catalog; no Workspace Agent owner | read |

`PRJ-18/19` are declared data-resource projections, not a generic database explorer.

## 5.4 Builder — 17

| ID | Operation | Owner | Consumer / authority root | Class |
| --- | --- | --- | --- | --- |
| `BLD-01` | `ListChanges` | Builder | exact Project Build/Activity | read |
| `BLD-02` | `GetChange` | Builder | exact Project/Change | read |
| `BLD-03` | `CreateChange` | Builder | exact Project + approved Baseline/current build authority | command |
| `BLD-04` | `GetChangePlan` | Builder | exact Change + current Plan revision | read |
| `BLD-05` | `DecideChangePlanCheckpoint` | Builder | exact Change/Plan revision + current reviewer eligibility | decision/current-state |
| `BLD-06` | `GetChangeProgress` | Builder | Hub-owned Plan/item/Change truth | read |
| `BLD-07` | `GetChangeDiff` | Builder/Git projection | exact candidate/result lineage | read/source |
| `BLD-08` | `ListProjectSourceTree` | Project Git via Builder | exact Project/source revision | read/source |
| `BLD-09` | `GetProjectSourceFile` | Project Git via Builder | exact Project/source revision/path | read/source |
| `BLD-10` | `GetRunPreview` | Builder/MAR projection | exact candidate Preview; `ready != verified != live` | read |
| `BLD-11` | `ListChangeFindings` | Builder | exact Change + Evidence visibility | read/review |
| `BLD-12` | `GetFinding` | Builder | exact Finding + disclosure | read/review |
| `BLD-13` | `CloseFinding` | Builder | exact Finding + current resolution Evidence/authority | decision/current-state |
| `BLD-14` | `ListChangeEvidence` | Builder projection | exact Change + Evidence visibility | read/review |
| `BLD-15` | `GetEvidence` | Builder projection | exact Evidence/provenance | read/review |
| `BLD-16` | `AskConexusAboutContext` | Builder | selected current authorized Project context; grants no new authority | read/assistant interaction |
| `BLD-17` | `GetChangeExecutionDetail` | Builder | exact Change; subordinate WorkUnit/ActorRun projection | read |

A generic `AcceptChange` is rejected. `bld.change_acceptance` remains an owner current-proof fact produced by exact checkpoints/verifier/Builder settlement. Direct `CreateWorkUnit`, plan-JSON patch, `SetWorkItemStatus`, `CreateActorRun`, `ResumeSandbox` and `MarkVerified` are owner/runtime mechanics.

## 5.5 Brain — 11

| ID | Operation | Owner | Consumer / authority root | Class |
| --- | --- | --- | --- | --- |
| `BRN-01` | `GetWorkspaceBrain` | Brain | exact Workspace Brain disclosure | read |
| `BRN-02` | `ListBrainRevisions` | Brain/Registry projection | exact Workspace Brain history | read |
| `BRN-03` | `GetBrainRevision` | Brain/Registry projection | exact immutable revision | read |
| `BRN-04` | `StartBrainDiscovery` | Brain | exact Workspace/Project + admitted read-only source scope; proposals remain hypotheses | investigation command |
| `BRN-05` | `ListKnowledgeProposals` | Brain | exact Workspace Brain review visibility | read/review |
| `BRN-06` | `GetKnowledgeProposal` | Brain | exact proposal + provenance/hypothesis state | read/review |
| `BRN-07` | `SubmitKnowledgeProposal` | Brain | exact Workspace Brain + provenance; never self-publishes | command |
| `BRN-08` | `DecideKnowledgeProposal` | Brain | exact proposal + current human review authority | decision/current-state |
| `BRN-09` | `PublishBrainRevision` | Brain | exact reviewed/validated candidate → immutable revision | consequential command/current-proof |
| `BRN-10` | `GetBrainHealth` | Brain | exact Brain/binding context; preserves `UNVERIFIED/VALID/SUSPECT/INVALID/CHECK_ERROR` | read/provenance |
| `BRN-12` | `RunAnalyticQuery` | Brain/Gateway governed read regime | exact Project + Brain binding + curated dataset + semantic IDs + admitted caller route | analytic read |

`BRN-11 RunBrainHealthProbe` is `SYSTEM_OWNER_TRANSITION`: owner/proof orchestration may produce health Evidence but is not a caller Product command. No generic discovery-session owner, vector/RAG search operation, free-form SQL, memory publication or machine semantic approval is admitted.

## 5.6 Connections — 9

| ID | Operation | Owner | Consumer / authority root | Class |
| --- | --- | --- | --- | --- |
| `CON-01` | `ListConnectorDefinitions` | Connections/platform-pack projection | admitted Connector definitions | read |
| `CON-02` | `GetConnectorDefinition` | Connections/platform-pack projection | exact Connector version/definition | read |
| `CON-03` | `ListConnections` | Connections | exact Workspace/Project scope | read |
| `CON-04` | `GetConnection` | Connections | exact Connection + ownerScope containment | read |
| `CON-05` | `CreateConnection` | Connections | exact ownerScope/owner + Connector; no sibling reuse | command |
| `CON-06` | `ReviseConnection` | Connections | exact current logical Connection → immutable/new revision semantics | command/current-state |
| `CON-07` | `SetConnectionCredential` | Connections + CredentialBackend boundary | exact Connection; write-only secret boundary | consequential write-only command |
| `CON-08` | `QualifyConnection` | Connections | exact ConnectionRevision/environment + real source Evidence | proof command |
| `CON-09` | `GetConnectionQualification` | Connections | exact revision/environment; configured/qualified/bound/healthy remain distinct | read/provenance |

No secret read, arbitrary TestURL, generic credential fetch/executor or cross-Workspace share operation is admitted.

## 5.7 Release / Promotion / serving — 7

| ID | Operation | Owner | Consumer / authority root | Class |
| --- | --- | --- | --- | --- |
| `REL-01` | `ListReleases` | Release | exact Project version disclosure | read |
| `REL-02` | `GetRelease` | Release | exact immutable Release composition | read |
| `REL-04` | `ListPromotions` | Release | exact Project/environment history | read |
| `REL-05` | `GetPromotion` | Release | exact Promotion history/current state | read |
| `REL-06` | `PromoteRelease` | Release | exact Release + environment + current proof/conformance + expected pointer generation | consequential decision/current-state |
| `REL-07` | `GetProjectServingState` | Release/MAR projection | exact active pointer + served verification; AVAILABLE != served | read/provenance |
| `REL-08` | `GetEnvironmentConformance` | Release | exact target PG/privileges/migrations/config/bindings/current pointer checks | read/proof |

`REL-03 ComposeRelease` is `SYSTEM_OWNER_TRANSITION`: exact accepted proof causes owner-controlled immutable composition; no separate human command is required. Rollback is another governed `PromoteRelease` to an eligible prior Release. Pointer setting and served verification are not direct caller operations.

## 5.8 Product Agent Runtime — 16

| ID | Operation | Owner | Consumer / authority root | Class |
| --- | --- | --- | --- | --- |
| `PAR-01` | `ListConversations` | PAR | exact Project/Agent + current Published-App disclosure | read |
| `PAR-02` | `GetConversation` | PAR | exact Conversation + current Project/Agent/app authority | read |
| `PAR-03` | `CreateConversation` | PAR | exact active Release + Agent + current app access | command |
| `PAR-04` | `SendProductAgentTurn` | PAR | exact Conversation + current app/Agent/Release authority; admits exact AgentRun | consequential command |
| `PAR-05` | `RunProductAgentHeadless` | PAR | exact active Release/Agent + explicit headless authority | consequential command |
| `PAR-06` | `ListAgentRuns` | PAR | exact Project/Agent/Conversation + current disclosure | read |
| `PAR-07` | `GetAgentRun` | PAR | exact AgentRun; `COMPLETED != every effect succeeded` | read/provenance |
| `PAR-08` | `ListApprovalRequests` | PAR | current eligible approver UX; exact Project/AgentRun disclosure | read/approval |
| `PAR-09` | `GetApprovalRequest` | PAR | current eligible approver or separately authorized investigator; exact sealed subject/current state | read/approval |
| `PAR-10` | `DecideApprovalRequest` | PAR | current eligible human shown the exact sealed proposal; surface does not confer eligibility | decision/current-authority |
| `PAR-11` | `ListAgentTriggers` | PAR | exact Project/Agent trigger administration | read |
| `PAR-12` | `GetAgentTrigger` | PAR | exact TriggerRevision/current state | read |
| `PAR-13` | `CreateScheduleTrigger` | PAR | exact active/evolvable Agent + current Project authority | command |
| `PAR-14` | `ReviseScheduleTrigger` | PAR | exact current TriggerRevision + authority | command/current-state |
| `PAR-15` | `EnableAgentTrigger` | PAR | exact TriggerRevision + active Project/Release/current authority | consequential command/current-state |
| `PAR-16` | `DisableAgentTrigger` | PAR | exact TriggerRevision; explicit narrowing allowed for archived Project | narrowing command |

Agent authoring stays in `BLD-03` + normal Change/Release. Mastra thread/tool-registry/runtime snapshot/provider IDs and owner terminal transitions are not Product operations.

Approval is owner-specific rather than Control-Plane-specific:

```text
exact ApprovalRequest subject
→ current eligible human through the exact admitted approval surface
→ PAR revalidates eligibility + revocation + Release + sealed proposal
→ only then can ALLOW_ONCE reach Gateway effect admission
```

The exact approval surface may be Control Plane or Published Application when the current Product experience admits it. Published-App role `{admin,member}` by itself never grants approval authority, and exposing approval in a Published App never grants Builder/Control-Plane access. `PAR-09` may additionally be inspected read-only through the separately authorized audit/investigator route; that route can never list the approval queue through `PAR-08` or decide the request.

## 5.9 Gateway inspection — 2

| ID | Operation | Owner | Consumer / authority root | Class |
| --- | --- | --- | --- | --- |
| `GW-01` | `ListEffectAttempts` | Gateway | exact Project/originating run/operation + audit disclosure; no retry authority | read/effect evidence |
| `GW-02` | `GetEffectAttempt` | Gateway | exact EffectAttempt receipt/reconciliation/provenance; preserves `OUTCOME_UNKNOWN` | read/effect evidence |

Effect admission, idempotency claim, resume/reconciliation are owner-internal after an admitted business command. Generic Retry/MarkSucceeded/ResolveUnknown shortcuts are rejected.

## 5.10 Managed Application Runtime — 3

| ID | Operation | Owner | Consumer / authority root | Class |
| --- | --- | --- | --- | --- |
| `MAR-01` | `ListManagedJobRuns` | MAR | exact Project + Release/job filters | read |
| `MAR-02` | `GetManagedJobRun` | MAR | exact JobRun + pinned Release/job/current state | read/provenance |
| `MAR-03` | `RunManagedJobNow` | MAR | exact currently served Release + admitted `job/v1` + current authority | command/occurrence |

Queue/redelivery/catch-up/single-flight mechanics remain owner/runtime behavior. No CreateCron, ReplayMissedSlots, ForceRedelivery or MarkJobSucceeded Product operation is admitted.

## 5.11 Observability & Audit — 5

| ID | Operation | Owner | Consumer / authority root | Class |
| --- | --- | --- | --- | --- |
| `OBS-01` | `ListProjectActivity` | OBS/Audit projection | exact Project disclosure; entries reference owner facts | read |
| `OBS-02` | `GetExecutionObservationDetail` | OBS/Audit projection | exact closed typed execution subject + technical disclosure | read/evidence |
| `OBS-03` | `GetProjectUsageCostSummary` | OBS/Audit projection | exact Project/period + provenance; missing != zero | read/provenance |
| `OBS-04` | `ListAuditRecords` | OBS/Audit | exact Workspace/Project audit scope | read/audit |
| `OBS-05` | `GetAuditRecord` | OBS/Audit | exact immutable audit fact | read/audit |

Telemetry/evidence never becomes current owner truth.

---

## 6. Product-visible Published Application boundary

Platform access/serving operations are fixed platform authority:

```text
IAM-13 GetPublishedAppAccessContext
IAM-14 ListPublishedAppAccess
IAM-15 SetPublishedAppAccess
IAM-17 RevokePublishedAppAccess
REL-07 GetProjectServingState
```

Published Application **business operations** are exact Project-defined `Ops(R)`. Static byte/path serving is transport under current app authorization and exact active Release, not one Product operation per file or route.

---

## 7. First Budget Analyzer application census — 2

The operator-approved `docs/product/budget-analyzer-contract.md` closes the first Project-defined operation set:

| ID | Operation | Regime | Owner | Consumer | Product authority |
| --- | --- | --- | --- | --- | --- |
| `BUD-01` | `AnalyzePendingBudgets` | registered `Query` | Budget Analyzer Project/Product semantic contract | Published-App human | exact active Budget Analyzer Release; current app access; role `{admin,member}`; exact ProjectConnectionBinding/Brain mapping + system-resolved result coordinate |
| `BUD-02` | `ListPendingBudgets` | registered `Query` | Budget Analyzer Project/Product semantic contract | Published-App human | same exact Release/app/source authority; each response/page has its own disclosed system-resolved result coordinate |

`AnalyzePendingBudgets` returns exactly the closed R1–R5 analytical snapshot under the admitted filter set; it is not arbitrary metrics/dimensions/group-by/SQL. `ListPendingBudgets` returns R6 drilldown. F1 does not promise cross-call or cross-page snapshot pinning: a changed result coordinate must remain visible and mixed-coordinate data must not be represented as one coherent snapshot. Neither operation admits arbitrary historical reconstruction through caller-selected `as_of`.

```text
N_budget = 2
Budget Analyzer orphan operations = 0
Budget Analyzer speculative operations = 0
```

Margin is unsupported, Mitra conversion-probability weighting is rejected, actual conversion metrics remain deferred until separately proved/admitted, and a negative Budget age is never silently clamped into an aging band.

---

# 8. Permission / principal / scope / ingress closure

The ordinary Permission vocabulary is canonically owned by `permission-contract.md`. No Project-defined business name creates a global Permission string.

The following grouped matrix is **complete**: every fixed platform operation appears exactly once in one row below; the two Budget operations are mapped separately. The operation table above supplies the exact semantic owner and subject; this matrix supplies the remaining cross-cutting authority fields.

### 8.1 Outcome profiles

| Profile | Required semantic behavior |
| --- | --- |
| `READ` | truthful success/empty; unauthenticated/denied/non-disclosable remain distinct; dependency failure is not empty |
| `PROVENANCE_READ` | `READ` plus current/stale/partial/unknown/provenance distinctions where reachable |
| `COMMAND` | applied/accepted vs validation/denial/conflict remain distinct; no fake success on rejected mutation |
| `DECISION` | exact current subject; stale/changed subject cannot win; accepted/denied/rejected distinguishable |
| `CONSEQUENTIAL` | accepted/pending/terminal/ambiguous where effects can escape; no blind replay of unknown effect |
| `ANALYTIC` | `SUPPORTED_CURRENT`, `SUPPORTED_STALE`, `PARTIAL`, `UNVERIFIED/INDETERMINATE`, `UNSUPPORTED`, `DEPENDENCY_UNAVAILABLE`; unknown != zero |
| `PROOF` | success/failure/error/unknown proof states do not rewrite Product meaning or current owner facts by narration |

### 8.1.1 Disclosure and semantic outcome law

4A fixes the semantic distinction; 4B later chooses the exact Problem schema/code spelling.

```text
401-class unauthenticated
= no valid current Conexus session/principal for a protected human surface

404-class absent / intentionally non-disclosable
= subject does not exist OR current disclosure policy must not confirm that foreign/out-of-scope subject exists
= default for guessed/cross-Workspace/cross-Project identifiers when existence itself is not disclosable

403-class authenticated but denied
= the subject/surface is legitimately disclosable to this current caller, but the caller lacks the required action/decision authority

409-class conflict
= current owner state/uniqueness/single-flight conflict where the request is otherwise admitted

412-class stale precondition/current-subject conflict
= caller named an expected revision/generation/digest/current subject that is no longer current or cannot win

422-class admitted semantic/business-input failure
= caller is authorized for the operation, but the admitted input violates the operation's semantic validation contract

503-class required dependency unavailable
= required current provider/source/runtime dependency is unavailable and the operation cannot truthfully complete
```

Rules:

```text
foreign identifier + no disclosure authority -X-> 403 existence oracle
non-disclosable unknown                     -X-> convenient negative answer
stale/current-authority conflict            -X-> silent last-write-wins
required dependency unavailable             -X-> empty/zero/success
```

Owner-specific finer distinctions may narrow disclosure further, but no later wire/frontend layer may collapse these classes into a more permissive meaning.

### 8.2 Idempotency / concurrency profiles

| Profile | Required property |
| --- | --- |
| `IC0` | read-only; no mutation idempotency requirement |
| `IC1` | ordinary owner mutation; current containment/authority rechecked at protected commit; uniqueness/current-state conflict cannot be hidden |
| `IC2` | exact immutable/current subject or expected revision/generation precondition; stale candidate cannot win |
| `IC3` | consequential intake must be safely repeatable through stable semantic request/subject identity; duplicate intake cannot create duplicate effect/occurrence |
| `IC4` | external/ambiguous effect fence + idempotency/reconciliation; `OUTCOME_UNKNOWN` blocks blind replay/new duplicate-scope admission |

`IC1` is the 4A projection of the accepted current-authority/CR-1 property. Exact carrier/transaction/ETag/lock syntax belongs to 4B/4D.

### 8.3 Complete fixed-platform authority matrix

| Operation IDs | Principal / ingress | Permission or special condition | Scope/current-authority rule | Outcome | IC |
| --- | --- | --- | --- | --- | --- |
| `IAM-01` | `HUMAN_ACCOUNT_SESSION / CP` | `authenticated` | exact current Conexus session; server resolves only disclosable Workspace/Project context | `READ` | `IC0` |
| `IAM-02` | `HUMAN_ACCOUNT_SESSION / CP` | `authenticated` | exact current session subject | `COMMAND` | `IC1` |
| `IAM-03` | `HUMAN_ACCOUNT_SESSION / CP` | trusted `platform_operator` | trusted F1 provisioning boundary; stable provisioned human identity/uniqueness prevents duplicate Account creation; no public signup | `COMMAND` | `IC3` |
| `IAM-04..12` | `HUMAN_ACCOUNT_SESSION / CP` | `workspace.access.manage` | exact Workspace/Area/Project containment; grant/revoke target and current authority rechecked at commit | read rows `READ`; writes `COMMAND` | reads `IC0`; writes `IC1` |
| `IAM-13` | `PUBLISHED_APP_HUMAN / PA` | exact app access + role | exact Published App + active Release; app role never implies Control Plane authority | `READ` | `IC0` |
| `IAM-14` | `HUMAN_ACCOUNT_SESSION / CP` | `project.manage` | exact Project/app administration | `READ` | `IC0` |
| `IAM-15,IAM-17` | `HUMAN_ACCOUNT_SESSION / CP` | `project.manage` | exact Project/app/Account subject; current grant state includes explicit absent state for create and exact current role/grant for change/revoke | `COMMAND` | `IC2` |
| `WS-01` | `HUMAN_ACCOUNT_SESSION / CP` | trusted `platform_operator` | trusted first-access Workspace creation | `COMMAND` | `IC3` |
| `WS-02` | `HUMAN_ACCOUNT_SESSION / CP` | current Workspace membership | exact Workspace disclosure | `READ` | `IC0` |
| `WS-03` | `HUMAN_ACCOUNT_SESSION / CP` | `workspace.manage` | exact current Workspace administration; stale/current revision cannot win | `COMMAND` | `IC2` |
| `WS-04` | `HUMAN_ACCOUNT_SESSION / CP` | `workspace.manage` | exact Workspace administration/disclosure | `READ` | `IC0` |
| `WS-05` | `HUMAN_ACCOUNT_SESSION / CP` | `workspace.manage` | exact Workspace + stable create intake/subject identity; duplicate intake cannot create duplicate Area | `COMMAND` | `IC3` |
| `WS-06` | `HUMAN_ACCOUNT_SESSION / CP` | `workspace.manage` | exact current Area + Workspace administration; stale/current revision cannot win | `COMMAND` | `IC2` |
| `PRJ-01,PRJ-02` | `HUMAN_ACCOUNT_SESSION / CP` | `project.read` + exact Project grant where applicable | current Workspace/Project disclosure | `READ` | `IC0` |
| `PRJ-03` | `HUMAN_ACCOUNT_SESSION / CP` | `project.create` | destination Workspace + atomic Project/initial-grant composition | `COMMAND` | `IC3` |
| `PRJ-04,PRJ-05` | `HUMAN_ACCOUNT_SESSION / CP` | `project.manage` | exact current Project; archive preserves independent serving/automation laws | `COMMAND` | `IC2` |
| `PRJ-06` | `HUMAN_ACCOUNT_SESSION / CP` | source `project.manage` + destination `project.create` | source Project + destination Workspace; NO DATA/no credentials/no bindings by default | `COMMAND` | `IC3` |
| `PRJ-07` | `HUMAN_ACCOUNT_SESSION / CP` | `project.manage`; plus `connection.use` when an external Connection is used | exact inception Project + declared source scope; investigation cannot publish authority directly | `PROOF` | `IC3` |
| `PRJ-08,PRJ-09,PRJ-10,PRJ-12,PRJ-13,PRJ-15` | `HUMAN_ACCOUNT_SESSION / CP` | `project.manage` | exact Project/current Baseline or binding subject; removals are narrowing | reads `READ`; decisions/writes `DECISION/COMMAND` | reads `IC0`; writes `IC2` |
| `PRJ-11` | `HUMAN_ACCOUNT_SESSION / CP` | `project.manage + brain.bind` | exact immutable Brain revision + current conformance + exact Project binding subject | `DECISION` | `IC2` |
| `PRJ-14` | `HUMAN_ACCOUNT_SESSION / CP` | `project.manage + connection.use` | exact qualified compatible ConnectionRevision/environment + current Project binding | `DECISION` | `IC2` |
| `PRJ-16,PRJ-17` | `HUMAN_ACCOUNT_SESSION / CP` | `project.read` | exact Project + capability identity; inspection does not grant invocation | `READ` | `IC0` |
| `PRJ-18,PRJ-19` | `HUMAN_ACCOUNT_SESSION / CP` | `project.data.read` | exact declared data resource + admitted source/read-model scope | `PROVENANCE_READ` | `IC0` |
| `PRJ-20,PRJ-21` | `HUMAN_ACCOUNT_SESSION / CP` | `project.source.read` | exact Project/Agent authored identity/revision | `READ` | `IC0` |
| `PRJ-22` | `HUMAN_ACCOUNT_SESSION / CP` | `project.read` | Workspace-filtered Project-owned Agent disclosure; no fleet owner | `READ` | `IC0` |
| `BLD-01..04,BLD-06,BLD-10,BLD-16,BLD-17` | `HUMAN_ACCOUNT_SESSION / CP` | `project.build` | exact Project/Change/Plan/Preview/current selected context | reads `READ`; `BLD-03` `COMMAND` | reads `IC0`; `BLD-03` `IC3` |
| `BLD-05,BLD-11..15` | `HUMAN_ACCOUNT_SESSION / CP` | `project.review` | exact Change/Plan/Finding/Evidence subject + current eligibility | reads `READ`; decisions `DECISION` | reads `IC0`; decisions `IC2` |
| `BLD-07..09` | `HUMAN_ACCOUNT_SESSION / CP` | `project.source.read` | exact immutable/current source revision/path/lineage | `READ` | `IC0` |
| `BRN-01..03,BRN-10` | `HUMAN_ACCOUNT_SESSION / CP` | `brain.read` | exact Workspace Brain/revision/binding context | `PROVENANCE_READ` | `IC0` |
| `BRN-04` | `HUMAN_ACCOUNT_SESSION / CP` | `brain.discover`; plus `connection.use` for external source | exact Workspace/Project/source scope; hypotheses only | `PROOF` | `IC3` |
| `BRN-05,BRN-06,BRN-08` | `HUMAN_ACCOUNT_SESSION / CP` | `brain.review` | exact proposal/review subject + current reviewer authority | reads `READ`; decision `DECISION` | reads `IC0`; decision `IC2` |
| `BRN-07` | `HUMAN_ACCOUNT_SESSION / CP` | `brain.propose` | exact Workspace Brain + provenance; cannot self-publish | `COMMAND` | `IC3` |
| `BRN-09` | `HUMAN_ACCOUNT_SESSION / CP` | `brain.publish` | exact reviewed/validated candidate + current publication authority | `DECISION` | `IC2` |
| `BRN-12` Control Plane route | `HUMAN_ACCOUNT_SESSION / CP` | `brain.read + project.data.read` | exact Project + Brain binding + curated dataset + semantic IDs + current Project grant | `ANALYTIC` | `IC0` |
| `BRN-12` Published-App route | `PUBLISHED_APP_HUMAN / PA` | exact Release-declared app role subset | exact active Release + app access + Brain/dataset projection | `ANALYTIC` | `IC0` |
| `BRN-12` Agent route | `PAR_AGENT_RUN_CONTEXT / PAR_TOOL` | exact ToolProjection | exact active AgentRun/Release/Brain/dataset projection | `ANALYTIC` | `IC0` |
| `CON-01..04,CON-09` | `HUMAN_ACCOUNT_SESSION / CP` | `connection.read` | exact Connector/Connection/revision/environment/ownerScope | `CON-09` `PROVENANCE_READ`; others `READ` | `IC0` |
| `CON-05..07` | `HUMAN_ACCOUNT_SESSION / CP` | `connection.manage` | exact ownerScope/current Connection; credential is write-only; no sibling reuse | `COMMAND`/`CONSEQUENTIAL` | `CON-05` `IC3`; `CON-06` `IC2`; `CON-07` `IC3` |
| `CON-08` | `HUMAN_ACCOUNT_SESSION / CP` | `connection.qualify` | exact ConnectionRevision/environment + real provider/source Evidence | `PROOF` | `IC3` |
| `REL-01,REL-02,REL-04,REL-05,REL-07` | `HUMAN_ACCOUNT_SESSION / CP` | `project.read` | exact Project/Release/Promotion/serving disclosure | `REL-07` `PROVENANCE_READ`; others `READ` | `IC0` |
| `REL-06` | `HUMAN_ACCOUNT_SESSION / CP` | `release.promote` | exact Release/environment + current proof/conformance + expected pointer generation; repeatable promotion intake cannot manufacture duplicate Promotion/effect | `CONSEQUENTIAL` | `IC2 AND IC3` |
| `REL-08` | `HUMAN_ACCOUNT_SESSION / CP` | `release.promote` | exact target-environment conformance subject; read grants no pointer mutation | `PROOF` | `IC0` |
| `PAR-01..04` | `PUBLISHED_APP_HUMAN / PA` | exact app access/role + active Release/Agent | exact Project/Agent/Conversation/Release scope | reads `READ`; `PAR-03` `COMMAND`; `PAR-04` `CONSEQUENTIAL` | reads `IC0`; create/turn `IC3`; downstream effects additionally `IC4` |
| `PAR-05` | `HUMAN_ACCOUNT_SESSION / HEADLESS` | `agent.headless.invoke` | exact active Release/Agent + current headless admission | `CONSEQUENTIAL` | `IC3`; downstream effects `IC4` |
| `PAR-06,PAR-07` | `HUMAN_ACCOUNT_SESSION / CP` or `PUBLISHED_APP_HUMAN / PA` | Control Plane `project.read` or exact in-scope app access | exact AgentRun/Conversation/Project disclosure | `PAR-07` `PROVENANCE_READ`; `PAR-06` `READ` | `IC0` |
| `PAR-08` | `HUMAN_ACCOUNT_SESSION / CP` or `PUBLISHED_APP_HUMAN / PA` | `agent.effect.approve` + exact current approver eligibility | exact Project/AgentRun/ApprovalRequest scope; PA additionally requires current app access/Release; app role alone is never approval authority | `READ` | `IC0` |
| `PAR-09` | eligible approver via `CP` or `PA`, or `HUMAN_ACCOUNT_SESSION / CP` investigator | approver route: `agent.effect.approve` + exact current eligibility; investigator route: `audit.read` | exact sealed ApprovalRequest/proposal digest; investigator is read-only; PA app role alone is never approval authority | `PROVENANCE_READ` | `IC0` |
| `PAR-10` | `HUMAN_ACCOUNT_SESSION / CP` or `PUBLISHED_APP_HUMAN / PA` | `agent.effect.approve` + exact current approver eligibility | exact sealed proposal + current revocation/Release/eligibility recheck; changed subject requires new request; PA additionally requires current app access/Release | `DECISION` | `IC2/IC4` |
| `PAR-11..16` | `HUMAN_ACCOUNT_SESSION / CP` | `agent.trigger.manage` | exact Project/Agent/TriggerRevision; archive blocks creation/enable but narrowing disable remains allowed | reads `READ`; writes `COMMAND` | reads `IC0`; create `IC3`; revise/enable `IC2`; disable `IC1` |
| `GW-01,GW-02` | `HUMAN_ACCOUNT_SESSION / CP` | `audit.read` | exact Project + originating run/operation/effect subject; no retry authority | `PROVENANCE_READ` | `IC0` (underlying effect owner uses `IC4`) |
| `MAR-01,MAR-02` | `HUMAN_ACCOUNT_SESSION / CP` | `project.read` | exact Project/Release/job/JobRun | `MAR-02` `PROVENANCE_READ`; `MAR-01` `READ` | `IC0` |
| `MAR-03` | `HUMAN_ACCOUNT_SESSION / CP` | `job.run` | exact currently served Release + admitted job + normal single-flight/coalesce laws | `COMMAND` | `IC3` |
| `OBS-01,OBS-03` | `HUMAN_ACCOUNT_SESSION / CP` | `project.read` | exact Project/current disclosure; usage result preserves provenance | `OBS-03` `PROVENANCE_READ`; `OBS-01` `READ` | `IC0` |
| `OBS-02,OBS-04,OBS-05` | `HUMAN_ACCOUNT_SESSION / CP` | `audit.read` | exact closed typed execution/audit subject + current disclosure | `PROVENANCE_READ` | `IC0` |

### 8.4 Budget Analyzer authority matrix

| Operation | Principal / ingress | Permission/special condition | Scope/current-authority rule | Outcome | IC |
| --- | --- | --- | --- | --- | --- |
| `BUD-01 AnalyzePendingBudgets` | `PUBLISHED_APP_HUMAN / PA` | exact app role `{admin,member}` | exact active Budget Analyzer Release + current app access + exact Project/Brain/Connection/read-model binding + system-resolved result coordinate | `ANALYTIC` | `IC0` |
| `BUD-02 ListPendingBudgets` | `PUBLISHED_APP_HUMAN / PA` | exact app role `{admin,member}` | same exact Release/app/source authority; each response/page binds its own system-resolved coordinate; no cross-call/page snapshot pinning is promised | `ANALYTIC` | `IC0` |

No Product Agent, MAR JobRun or DEDICATED caller is admitted for `BUD-01/02` merely to exercise infrastructure.

---

# 9. Subtractive decisions and explicit non-operations

The first candidate had 117 admitted fixed-platform rows. The completed subtractive pass applies:

```text
117
- 1 IAM GrantPublishedAppAccess + ChangePublishedAppAccessRole
    → one IAM-15 SetPublishedAppAccess semantic operation
- 1 BRN-11 RunBrainHealthProbe
    → SYSTEM owner/proof orchestration
- 1 REL-03 ComposeRelease
    → SYSTEM owner transition gated by current accepted proof
= 114 fixed Conexus platform Product operations
```

Kept after attack because their exact detail has independent Product meaning:

```text
GetConnectionQualification
List/Get EffectAttempt
purpose-built list/detail pairs where detail is materially richer or immutable/exact-subject scoped
```

Rejected convenience/mechanism operations include:

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
ExecuteProviderOperation(provider,name,payload)
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

---

# 10. Durable-record / owner closure

The supporting proof in `docs/evidence/4a/operation-coverage.md` classifies all 46 accepted durable record classes as `DIRECT`, `PROJECTION`, `INTERNAL` or `CARRIER` and preserves all 13 semantic owner boundaries.

```text
record classes checked                      = 46/46
unclassified                                = 0
record classes requiring CRUD by symmetry   = 0
mutable foreign-owner mirrors required      = 0
semantic owner boundaries preserved         = 13/13
```

Artifact Registry remains semantic projection rather than Universal Artifact CRUD. Attachments/Blob remain owner-bound carriers. Gateway remains last-mile effect authority rather than a second business-command owner. PAR owns runtime, not authored Agent definition. MAR owns serving/job-run mechanics, not a generic scheduler Product domain.

---

# 11. Blueprint / Forge disposition

Current Product authority already has Project Inception/approved Baseline, Change, PlanningDepth/RigorProfile, Plan/checkpoints, Builder WorkUnit/ActorRun/CodingSession, Platform Consultant, independent verification and Release/Promotion.

Therefore:

```text
Blueprint as new semantic owner/domain = REJECT
Forge as new semantic owner/domain     = REJECT
Blueprint/Forge mandatory Product APIs = REJECT
planning-harness behavior              = PRESERVE as Project/Builder design input
possible UX labels/modes               = 4C only; labels cannot create authority
Paved Road realization                 = 4D
```

The bounded SoftwareForge review changes none of the 114 fixed operations, the Project grammar, `N_budget`, owner boundaries or trust boundaries.

---

# 12. Closure assertions after independent review

```text
N_platform                              = 114
N_budget                                = 2
ordinary Permissions                    = 25
fixed operations with semantic owner    = 114/114
fixed operations with consumer          = 114/114
fixed operations with principal/ingress = 114/114
fixed operations with auth/scope route  = 114/114
fixed operations with outcome profile   = 114/114
fixed operations with exact IC profile  = 114/114
Budget operations with all fields       = 2/2
Project grammar exact-Release pinned     = yes
universal execute authority              = rejected
orphan concrete operations               = 0
speculative concrete operations          = 0
independent trust-critical falsifiers    = survived
unresolved material review findings      = 0
```

Independent Fable review found two material consistency defects and five minor precision defects. Lead adjudication accepted all seven because they narrow or make explicit already-admitted authority without adding an operation, Permission, owner or trust boundary:

```text
4A-IR-01 ACCEPT → PAR-08 is approver-list only; audit investigator route remains PAR-09 exact-subject read
4A-IR-02 ACCEPT → remove unsupported retained cross-call/page snapshot guarantee; every response/page discloses its own system coordinate
4A-IR-03 ACCEPT → bind WS-03/04/05/06 IC profiles exactly; REL-06 requires IC2 AND IC3
4A-IR-04 ACCEPT → IAM-03 creation uses IC3; IAM-15 absent/create state is explicit under IC2
4A-IR-05 ACCEPT → PAR-01 wording aligned to its PA-only matrix route
4A-IR-06 ACCEPT → project.read explicitly lists PAR-06/07 Control-Plane consumers in permission-contract.md
4A-IR-07 ACCEPT → negative Budget age is never clamped/banded; PARTIAL or UNVERIFIED/INDETERMINATE preserves truth
```

No second independent round is required because every accepted correction is exactly within a reviewer-proposed bounded resolution, removes ambiguity rather than introducing a new capability, and leaves the challenged counts/topology unchanged. Fresh repository verification on the corrected exact HEAD remains required before operator ratification.

The candidate remains **not ratified** and does not authorize 4B or Product implementation.