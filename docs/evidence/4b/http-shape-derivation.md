# 4B Evidence — HTTP Shape Derivation

> **Kind:** bounded 4B derivation Evidence; not Product authority and not the canonical machine-readable wire.
> **Canonical destination:** `contracts/api/product/openapi.yaml`.
> **Accepted source:** 4A `docs/product/operation-ledger.md`.
> **Status:** candidate mapping under executable falsification.

## 1. Derivation law

The mapping below assigns one HTTP operation shape to each of the 114 accepted fixed Product operations before request/response schema authoring.

Rules:

```text
accepted read/provenance read
→ GET unless structured analytical/assistant input makes POST materially clearer

accepted create with server-owned new identity
→ POST collection + Idempotency-Key when IC3 requires repeatable intake

accepted mutable representation update
→ PATCH exact resource + If-Match when IC2 is representation-current

accepted exact membership/grant replacement/removal
→ PUT / DELETE exact subject when the Product meaning is precisely that subject

accepted semantic command/decision/proof
→ POST semantic command/decision collection
→ do not manufacture a CRUD resource identity just to look RESTful

IC1
→ no mandatory caller precondition by symmetry; current authority is rechecked through owner commit

IC2
→ If-Match only when the protected subject is a current HTTP representation
→ otherwise carry the exact immutable revision/digest/current subject explicitly

IC3
→ Idempotency-Key when the caller can repeat consequential intake
→ naturally idempotent PUT plus owner uniqueness can satisfy only where accepted semantics are the exact resource assignment

IC4
→ caller header only where it is the correct effect-intake carrier
→ otherwise exact owner/Gateway effect fence remains internal and must be proved later

path identifier
→ untrusted reference only
→ never authority by possession
→ 404/403 disclosure law still applies server-side
```

Surface roots:

```text
/api/control/...   authenticated Control Plane Product interaction
/api/apps/...      Published Application human interaction
/api/headless/...  admitted Product-Agent headless interaction
/api/runtime/...   owner-neutral PAR read/approval surface where 4A admits CP and/or PA
/api/projects/...  owner-neutral multi-ingress fixed capability such as AnalyticQuery
```

A shared `MULTI` route does not merge authorization planes. Exact admitted ingress classes remain operation metadata and current owner authorization is rechecked independently.

## 2. Candidate census

```text
fixed operations = 114
unique operationIds = 114
unique method+path pairs = 114
GET    = 65
POST   = 31
PUT    = 7
PATCH  = 4
DELETE = 7
```

## 3. Exact operation shape map

| 4A ID | operationId | Surface | Method | Candidate path | Caller/current-state carrier |
| --- | --- | --- | --- | --- | --- |
| `IAM-01` | `GetControlPlaneAccessContext` | `CP` | `GET` | `/api/control/access-context` | `NONE` |
| `IAM-02` | `EndSession` | `CP` | `DELETE` | `/api/control/session` | `OWNER_CURRENT` |
| `IAM-03` | `ProvisionAccount` | `CP` | `POST` | `/api/control/accounts` | `IDEMPOTENCY_KEY` |
| `IAM-04` | `ListWorkspaceMembers` | `CP` | `GET` | `/api/control/workspaces/{workspaceId}/members` | `NONE` |
| `IAM-05` | `AddWorkspaceMember` | `CP` | `PUT` | `/api/control/workspaces/{workspaceId}/members/{accountId}` | `OWNER_CURRENT` |
| `IAM-06` | `RemoveWorkspaceMember` | `CP` | `DELETE` | `/api/control/workspaces/{workspaceId}/members/{accountId}` | `OWNER_CURRENT` |
| `IAM-07` | `GrantAccountProjectAccess` | `CP` | `PUT` | `/api/control/projects/{projectId}/account-grants/{accountId}` | `OWNER_CURRENT` |
| `IAM-08` | `RevokeAccountProjectAccess` | `CP` | `DELETE` | `/api/control/projects/{projectId}/account-grants/{accountId}` | `OWNER_CURRENT` |
| `IAM-09` | `AddAreaMember` | `CP` | `PUT` | `/api/control/workspaces/{workspaceId}/areas/{areaId}/members/{accountId}` | `OWNER_CURRENT` |
| `IAM-10` | `RemoveAreaMember` | `CP` | `DELETE` | `/api/control/workspaces/{workspaceId}/areas/{areaId}/members/{accountId}` | `OWNER_CURRENT` |
| `IAM-11` | `GrantAreaProjectAccess` | `CP` | `PUT` | `/api/control/projects/{projectId}/area-grants/{areaId}` | `OWNER_CURRENT` |
| `IAM-12` | `RevokeAreaProjectAccess` | `CP` | `DELETE` | `/api/control/projects/{projectId}/area-grants/{areaId}` | `OWNER_CURRENT` |
| `IAM-13` | `GetPublishedAppAccessContext` | `PA` | `GET` | `/api/apps/{projectId}/access-context` | `NONE` |
| `IAM-14` | `ListPublishedAppAccess` | `CP` | `GET` | `/api/control/projects/{projectId}/app-access` | `NONE` |
| `IAM-15` | `SetPublishedAppAccess` | `CP` | `PUT` | `/api/control/projects/{projectId}/app-access/{accountId}` | `CURRENT_OR_ABSENT` |
| `IAM-17` | `RevokePublishedAppAccess` | `CP` | `DELETE` | `/api/control/projects/{projectId}/app-access/{accountId}` | `IF_MATCH` |
| `WS-01` | `CreateWorkspace` | `CP` | `POST` | `/api/control/workspaces` | `IDEMPOTENCY_KEY` |
| `WS-02` | `GetWorkspace` | `CP` | `GET` | `/api/control/workspaces/{workspaceId}` | `NONE` |
| `WS-03` | `UpdateWorkspace` | `CP` | `PATCH` | `/api/control/workspaces/{workspaceId}` | `IF_MATCH` |
| `WS-04` | `ListAreas` | `CP` | `GET` | `/api/control/workspaces/{workspaceId}/areas` | `NONE` |
| `WS-05` | `CreateArea` | `CP` | `POST` | `/api/control/workspaces/{workspaceId}/areas` | `IDEMPOTENCY_KEY` |
| `WS-06` | `UpdateArea` | `CP` | `PATCH` | `/api/control/workspaces/{workspaceId}/areas/{areaId}` | `IF_MATCH` |
| `PRJ-01` | `ListProjects` | `CP` | `GET` | `/api/control/workspaces/{workspaceId}/projects` | `NONE` |
| `PRJ-02` | `GetProject` | `CP` | `GET` | `/api/control/projects/{projectId}` | `NONE` |
| `PRJ-03` | `CreateProject` | `CP` | `POST` | `/api/control/workspaces/{workspaceId}/projects` | `IDEMPOTENCY_KEY` |
| `PRJ-04` | `UpdateProject` | `CP` | `PATCH` | `/api/control/projects/{projectId}` | `IF_MATCH` |
| `PRJ-05` | `ArchiveProject` | `CP` | `POST` | `/api/control/projects/{projectId}/commands/archive` | `IF_MATCH` |
| `PRJ-06` | `DuplicateProject` | `CP` | `POST` | `/api/control/projects/{projectId}/commands/duplicate` | `IDEMPOTENCY_KEY` |
| `PRJ-07` | `RunInceptionInvestigation` | `CP` | `POST` | `/api/control/projects/{projectId}/inception-investigations` | `IDEMPOTENCY_KEY` |
| `PRJ-08` | `GetApprovedProjectBaseline` | `CP` | `GET` | `/api/control/projects/{projectId}/baseline` | `NONE` |
| `PRJ-09` | `ApproveProjectBaselineRevision` | `CP` | `POST` | `/api/control/projects/{projectId}/baseline/decisions` | `EXPLICIT_REVISION` |
| `PRJ-10` | `GetProjectBrainBinding` | `CP` | `GET` | `/api/control/projects/{projectId}/brain-binding` | `NONE` |
| `PRJ-11` | `SetProjectBrainBinding` | `CP` | `PUT` | `/api/control/projects/{projectId}/brain-binding` | `CURRENT_OR_ABSENT` |
| `PRJ-12` | `ClearProjectBrainBinding` | `CP` | `DELETE` | `/api/control/projects/{projectId}/brain-binding` | `IF_MATCH` |
| `PRJ-13` | `ListProjectConnectionBindings` | `CP` | `GET` | `/api/control/projects/{projectId}/connection-bindings` | `NONE` |
| `PRJ-14` | `SetProjectConnectionBinding` | `CP` | `POST` | `/api/control/projects/{projectId}/commands/set-connection-binding` | `EXPLICIT_CURRENT_SUBJECT` |
| `PRJ-15` | `RemoveProjectConnectionBinding` | `CP` | `POST` | `/api/control/projects/{projectId}/commands/remove-connection-binding` | `EXPLICIT_CURRENT_SUBJECT` |
| `PRJ-16` | `ListProjectCapabilities` | `CP` | `GET` | `/api/control/projects/{projectId}/capabilities` | `NONE` |
| `PRJ-17` | `GetProjectCapability` | `CP` | `GET` | `/api/control/projects/{projectId}/capabilities/{capabilityId}` | `NONE` |
| `PRJ-18` | `ListProjectDataResources` | `CP` | `GET` | `/api/control/projects/{projectId}/data-resources` | `NONE` |
| `PRJ-19` | `GetProjectDataResource` | `CP` | `GET` | `/api/control/projects/{projectId}/data-resources/{dataResourceId}` | `NONE` |
| `PRJ-20` | `ListProjectProductAgents` | `CP` | `GET` | `/api/control/projects/{projectId}/product-agents` | `NONE` |
| `PRJ-21` | `GetProjectProductAgent` | `CP` | `GET` | `/api/control/projects/{projectId}/product-agents/{agentId}` | `NONE` |
| `PRJ-22` | `ListWorkspaceProductAgents` | `CP` | `GET` | `/api/control/workspaces/{workspaceId}/product-agents` | `NONE` |
| `BLD-01` | `ListChanges` | `CP` | `GET` | `/api/control/projects/{projectId}/changes` | `NONE` |
| `BLD-02` | `GetChange` | `CP` | `GET` | `/api/control/projects/{projectId}/changes/{changeId}` | `NONE` |
| `BLD-03` | `CreateChange` | `CP` | `POST` | `/api/control/projects/{projectId}/changes` | `IDEMPOTENCY_KEY` |
| `BLD-04` | `GetChangePlan` | `CP` | `GET` | `/api/control/projects/{projectId}/changes/{changeId}/plan` | `NONE` |
| `BLD-05` | `DecideChangePlanCheckpoint` | `CP` | `POST` | `/api/control/projects/{projectId}/changes/{changeId}/plan/decisions` | `EXPLICIT_REVISION` |
| `BLD-06` | `GetChangeProgress` | `CP` | `GET` | `/api/control/projects/{projectId}/changes/{changeId}/progress` | `NONE` |
| `BLD-07` | `GetChangeDiff` | `CP` | `GET` | `/api/control/projects/{projectId}/changes/{changeId}/diff` | `NONE` |
| `BLD-08` | `ListProjectSourceTree` | `CP` | `GET` | `/api/control/projects/{projectId}/source/tree` | `NONE` |
| `BLD-09` | `GetProjectSourceFile` | `CP` | `GET` | `/api/control/projects/{projectId}/source/file` | `NONE` |
| `BLD-10` | `GetRunPreview` | `CP` | `GET` | `/api/control/projects/{projectId}/changes/{changeId}/preview` | `NONE` |
| `BLD-11` | `ListChangeFindings` | `CP` | `GET` | `/api/control/projects/{projectId}/changes/{changeId}/findings` | `NONE` |
| `BLD-12` | `GetFinding` | `CP` | `GET` | `/api/control/projects/{projectId}/changes/{changeId}/findings/{findingId}` | `NONE` |
| `BLD-13` | `CloseFinding` | `CP` | `POST` | `/api/control/projects/{projectId}/changes/{changeId}/findings/{findingId}/commands/close` | `EXPLICIT_CURRENT_SUBJECT` |
| `BLD-14` | `ListChangeEvidence` | `CP` | `GET` | `/api/control/projects/{projectId}/changes/{changeId}/evidence` | `NONE` |
| `BLD-15` | `GetEvidence` | `CP` | `GET` | `/api/control/projects/{projectId}/changes/{changeId}/evidence/{evidenceId}` | `NONE` |
| `BLD-16` | `AskConexusAboutContext` | `CP` | `POST` | `/api/control/projects/{projectId}/assistant/queries` | `NONE` |
| `BLD-17` | `GetChangeExecutionDetail` | `CP` | `GET` | `/api/control/projects/{projectId}/changes/{changeId}/execution-detail` | `NONE` |
| `BRN-01` | `GetWorkspaceBrain` | `CP` | `GET` | `/api/control/workspaces/{workspaceId}/brain` | `NONE` |
| `BRN-02` | `ListBrainRevisions` | `CP` | `GET` | `/api/control/workspaces/{workspaceId}/brain/revisions` | `NONE` |
| `BRN-03` | `GetBrainRevision` | `CP` | `GET` | `/api/control/workspaces/{workspaceId}/brain/revisions/{brainRevisionId}` | `NONE` |
| `BRN-04` | `StartBrainDiscovery` | `CP` | `POST` | `/api/control/workspaces/{workspaceId}/brain/discoveries` | `IDEMPOTENCY_KEY` |
| `BRN-05` | `ListKnowledgeProposals` | `CP` | `GET` | `/api/control/workspaces/{workspaceId}/brain/proposals` | `NONE` |
| `BRN-06` | `GetKnowledgeProposal` | `CP` | `GET` | `/api/control/workspaces/{workspaceId}/brain/proposals/{proposalId}` | `NONE` |
| `BRN-07` | `SubmitKnowledgeProposal` | `CP` | `POST` | `/api/control/workspaces/{workspaceId}/brain/proposals` | `IDEMPOTENCY_KEY` |
| `BRN-08` | `DecideKnowledgeProposal` | `CP` | `POST` | `/api/control/workspaces/{workspaceId}/brain/proposals/{proposalId}/decisions` | `EXPLICIT_CURRENT_SUBJECT` |
| `BRN-09` | `PublishBrainRevision` | `CP` | `POST` | `/api/control/workspaces/{workspaceId}/brain/publications` | `EXPLICIT_REVISION` |
| `BRN-10` | `GetBrainHealth` | `CP` | `GET` | `/api/control/workspaces/{workspaceId}/brain/health` | `NONE` |
| `BRN-12` | `RunAnalyticQuery` | `MULTI` | `POST` | `/api/projects/{projectId}/analytic-queries` | `NONE` |
| `CON-01` | `ListConnectorDefinitions` | `CP` | `GET` | `/api/control/connectors` | `NONE` |
| `CON-02` | `GetConnectorDefinition` | `CP` | `GET` | `/api/control/connectors/{connectorDefinitionId}` | `NONE` |
| `CON-03` | `ListConnections` | `CP` | `GET` | `/api/control/connection-scopes/{ownerScopeKind}/{ownerId}/connections` | `NONE` |
| `CON-04` | `GetConnection` | `CP` | `GET` | `/api/control/connections/{connectionId}` | `NONE` |
| `CON-05` | `CreateConnection` | `CP` | `POST` | `/api/control/connection-scopes/{ownerScopeKind}/{ownerId}/connections` | `IDEMPOTENCY_KEY` |
| `CON-06` | `ReviseConnection` | `CP` | `POST` | `/api/control/connections/{connectionId}/revisions` | `IF_MATCH` |
| `CON-07` | `SetConnectionCredential` | `CP` | `PUT` | `/api/control/connections/{connectionId}/credential` | `IDEMPOTENCY_KEY` |
| `CON-08` | `QualifyConnection` | `CP` | `POST` | `/api/control/connections/{connectionId}/qualifications` | `IDEMPOTENCY_KEY` |
| `CON-09` | `GetConnectionQualification` | `CP` | `GET` | `/api/control/connections/{connectionId}/qualifications/{qualificationId}` | `NONE` |
| `REL-01` | `ListReleases` | `CP` | `GET` | `/api/control/projects/{projectId}/releases` | `NONE` |
| `REL-02` | `GetRelease` | `CP` | `GET` | `/api/control/projects/{projectId}/releases/{releaseId}` | `NONE` |
| `REL-04` | `ListPromotions` | `CP` | `GET` | `/api/control/projects/{projectId}/promotions` | `NONE` |
| `REL-05` | `GetPromotion` | `CP` | `GET` | `/api/control/projects/{projectId}/promotions/{promotionId}` | `NONE` |
| `REL-06` | `PromoteRelease` | `CP` | `POST` | `/api/control/projects/{projectId}/promotions` | `IF_MATCH+IDEMPOTENCY_KEY` |
| `REL-07` | `GetProjectServingState` | `CP` | `GET` | `/api/control/projects/{projectId}/serving-state` | `NONE` |
| `REL-08` | `GetEnvironmentConformance` | `CP` | `GET` | `/api/control/projects/{projectId}/environments/{environmentId}/conformance` | `NONE` |
| `PAR-01` | `ListConversations` | `PA` | `GET` | `/api/apps/{projectId}/agents/{agentId}/conversations` | `NONE` |
| `PAR-02` | `GetConversation` | `PA` | `GET` | `/api/apps/{projectId}/agents/{agentId}/conversations/{conversationId}` | `NONE` |
| `PAR-03` | `CreateConversation` | `PA` | `POST` | `/api/apps/{projectId}/agents/{agentId}/conversations` | `IDEMPOTENCY_KEY` |
| `PAR-04` | `SendProductAgentTurn` | `PA` | `POST` | `/api/apps/{projectId}/agents/{agentId}/conversations/{conversationId}/turns` | `IDEMPOTENCY_KEY` |
| `PAR-05` | `RunProductAgentHeadless` | `HEADLESS` | `POST` | `/api/headless/projects/{projectId}/agents/{agentId}/runs` | `IDEMPOTENCY_KEY` |
| `PAR-06` | `ListAgentRuns` | `MULTI` | `GET` | `/api/runtime/projects/{projectId}/agent-runs` | `NONE` |
| `PAR-07` | `GetAgentRun` | `MULTI` | `GET` | `/api/runtime/projects/{projectId}/agent-runs/{agentRunId}` | `NONE` |
| `PAR-08` | `ListApprovalRequests` | `MULTI` | `GET` | `/api/runtime/projects/{projectId}/approval-requests` | `NONE` |
| `PAR-09` | `GetApprovalRequest` | `MULTI` | `GET` | `/api/runtime/projects/{projectId}/approval-requests/{approvalRequestId}` | `NONE` |
| `PAR-10` | `DecideApprovalRequest` | `MULTI` | `POST` | `/api/runtime/projects/{projectId}/approval-requests/{approvalRequestId}/decisions` | `IF_MATCH` |
| `PAR-11` | `ListAgentTriggers` | `CP` | `GET` | `/api/control/projects/{projectId}/agents/{agentId}/triggers` | `NONE` |
| `PAR-12` | `GetAgentTrigger` | `CP` | `GET` | `/api/control/projects/{projectId}/agents/{agentId}/triggers/{triggerId}` | `NONE` |
| `PAR-13` | `CreateScheduleTrigger` | `CP` | `POST` | `/api/control/projects/{projectId}/agents/{agentId}/triggers` | `IDEMPOTENCY_KEY` |
| `PAR-14` | `ReviseScheduleTrigger` | `CP` | `PATCH` | `/api/control/projects/{projectId}/agents/{agentId}/triggers/{triggerId}` | `IF_MATCH` |
| `PAR-15` | `EnableAgentTrigger` | `CP` | `POST` | `/api/control/projects/{projectId}/agents/{agentId}/triggers/{triggerId}/commands/enable` | `IF_MATCH` |
| `PAR-16` | `DisableAgentTrigger` | `CP` | `POST` | `/api/control/projects/{projectId}/agents/{agentId}/triggers/{triggerId}/commands/disable` | `OWNER_CURRENT` |
| `GW-01` | `ListEffectAttempts` | `CP` | `GET` | `/api/control/projects/{projectId}/effect-attempts` | `NONE` |
| `GW-02` | `GetEffectAttempt` | `CP` | `GET` | `/api/control/projects/{projectId}/effect-attempts/{effectAttemptId}` | `NONE` |
| `MAR-01` | `ListManagedJobRuns` | `CP` | `GET` | `/api/control/projects/{projectId}/job-runs` | `NONE` |
| `MAR-02` | `GetManagedJobRun` | `CP` | `GET` | `/api/control/projects/{projectId}/job-runs/{jobRunId}` | `NONE` |
| `MAR-03` | `RunManagedJobNow` | `CP` | `POST` | `/api/control/projects/{projectId}/jobs/{jobId}/runs` | `IDEMPOTENCY_KEY` |
| `OBS-01` | `ListProjectActivity` | `CP` | `GET` | `/api/control/projects/{projectId}/activity` | `NONE` |
| `OBS-02` | `GetExecutionObservationDetail` | `CP` | `GET` | `/api/control/projects/{projectId}/execution-observations/{observationId}` | `NONE` |
| `OBS-03` | `GetProjectUsageCostSummary` | `CP` | `GET` | `/api/control/projects/{projectId}/usage-cost-summary` | `NONE` |
| `OBS-04` | `ListAuditRecords` | `CP` | `GET` | `/api/control/workspaces/{workspaceId}/audit-records` | `NONE` |
| `OBS-05` | `GetAuditRecord` | `CP` | `GET` | `/api/control/workspaces/{workspaceId}/audit-records/{auditRecordId}` | `NONE` |

## 4. Deliberate non-derivations

The map does not yet decide:

- exact request/response properties;
- exact path/query parameter schemas beyond the semantic references visible above;
- session-cookie wire name;
- per-operation Problem subtype URIs;
- pagination token schema;
- exact retention window for `Idempotency-Key`;
- server/runtime/controller implementation;
- generated client/server SDK toolchain.

Those are subsequent 4B closures. The final OpenAPI Description, not this Evidence table, is canonical.

## 5. Negative controls

A valid final mapping must reject:

```text
POST /execute/{operationSlug}
POST /sql
POST /provider/{provider}/{operation}
caller-selected target URL or Connection as effective authority
one HTTP operation representing two accepted 4A operationIds
two HTTP operations representing one accepted 4A operationId merely for UI ingress
technical callback added to N_platform
foreign path ID causing a 403 existence oracle when 404 non-disclosure is required
```

The next executable step is to encode this candidate map in the canonical OAD and mechanically compare its `operationId` census with accepted 4A.
