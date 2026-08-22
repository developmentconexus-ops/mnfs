# Conexus OS — Executable Wire Contract

> **Status:** 4B CANDIDATE / REPRESENTATION + 111 FIXED METHOD/PATH BIJECTION CLOSED / SHARED CARRIERS ACTIVE
> **Owner:** 4B — Executable Wire Contract.
> **Product semantics:** current operator-ratified 4A authority, including bounded `4B-F01`, remains canonical above this wire.
> **Implementation:** BLOCKED.

This document owns the human-readable 4B decisions that govern the canonical machine-readable wire artifacts. The machine-readable Product wire must conform to this contract; neither this prose nor generated code may invent Product meaning beyond accepted 4A.

## 1. Representation decision

Current 4B adopts:

```text
HTTP Product wire authority = OpenAPI Specification 3.1.2
Schema semantics             = JSON Schema Draft 2020-12 through OAS 3.1 dialect
jsonSchemaDialect            = https://spec.openapis.org/oas/3.1/dialect/2024-11-10
source format                = YAML 1.2-compatible OpenAPI Description
```

OAS 3.2.0 is deliberately deferred for current F1 4B. No accepted 4A property requires a 3.2-only feature and the current interoperable validation/codegen surface is stronger around 3.1. Reopen only if a current accepted operation requires a 3.2-only property or exact selected tooling makes 3.1 materially unfit.

Bounded Evidence: [../evidence/4b/wire-representation-assessment.md](../evidence/4b/wire-representation-assessment.md).

## 2. Canonical artifact topology

### 2.1 Fixed Conexus Product wire

The single canonical entry document remains:

```text
contracts/api/product/openapi.yaml
```

Real method/path mapping created enough size/maintenance pressure that 4B's previously defined split trigger fired. The OAD is therefore one **multi-file OpenAPI authority**:

```text
contracts/api/product/openapi.yaml                 canonical entrypoint / shared wire law
contracts/api/product/fixed-paths.yaml             baseline referenced Path Item fragment
contracts/api/product/current-state-overrides.yaml bounded current-subject carrier corrections
contracts/api/product/fixed-census-overrides.yaml  bounded 4B-F01 read-preserving census corrections
contracts/api/product/identity-workspace-paths.yaml closed IAM + Workspace Path Items
contracts/api/product/project-paths.yaml            closed Project Path Items
contracts/api/product/builder-paths.yaml            closed Builder Path Items
contracts/api/product/brain-paths.yaml              closed Brain Path Items
contracts/api/product/connection-paths.yaml         closed Connections Path Items
contracts/api/product/release-paths.yaml            closed Release / Promotion / serving Path Items
contracts/api/product/par-paths.yaml                closed Product Agent Runtime Path Items
contracts/api/product/gateway-paths.yaml            closed Gateway inspection Path Items
```

Rules:

```text
one canonical entrypoint authority
+ deterministic local refs
+ validator resolves the whole active graph
+ bundle is generated proof output
+ active bundle ↔ 4A operation census is mechanically checked
```

Fragments are never consumed independently as alternative Product APIs. They are maintenance partitions inside one OAD authority. A stale/dead fragment cannot re-enter authority unless the canonical entrypoint references it and the bundle/bijection proofs admit it.

Generated bundles under `/tmp` are proof artifacts only and are never committed/editable co-authority.

### 2.2 Project-defined operation grammar

```text
contracts/api/project-operation.schema.json
```

is the canonical JSON Schema 2020-12 grammar for exact Release-pinned Project operation declarations.

A concrete Project declaration is authoritative only as part of an exact admitted Project/Release contract. Generated OpenAPI from those declarations is a deterministic projection, not a second editable business-operation contract.

### 2.3 First Budget Analyzer proof instance

The first Budget Analyzer instantiates exactly:

```text
AnalyzePendingBudgets
ListPendingBudgets
```

as `project-operation/v1` declarations and produces an exact generated/conforming application OAD. No third operation is admitted merely for wire convenience.

## 3. Fixed operation identity / HTTP shape law

For fixed platform operations:

```text
operationId = exact accepted 4A semantic operation name
x-conexus-4a-id = exact accepted 4A ledger ID
```

The current fixed shape derivation has mechanically closed after operator-approved `4B-F01`:

```text
4A fixed operations        = 111
OAS fixed operations       = 111
missing                    = 0
extra                      = 0
duplicate operationId      = 0
duplicate 4A ID            = 0
duplicate method+path      = 0
```

`WS-03 UpdateWorkspace`, `WS-06 UpdateArea` and `PRJ-04 UpdateProject` are not current Product wire operations. Their subtraction was a semantic correction, not a route-style choice.

`npm run wire:bijection` must remain green. The checker also rejects generic Product paths shaped like unrestricted `/execute` or `{operationSlug}` dispatch.

HTTP shape Evidence: [../evidence/4b/http-shape-derivation.md](../evidence/4b/http-shape-derivation.md). Bounded subtraction Evidence: [../evidence/4b/fixed-mutation-semantic-gap.md](../evidence/4b/fixed-mutation-semantic-gap.md).

Surface roots preserve 4A ingress separation:

```text
/api/control/...   authenticated Control Plane Product interaction
/api/apps/...      Published Application human interaction
/api/headless/...  explicit Product-Agent headless interaction
/api/runtime/...   owner-neutral PAR read/approval HTTP surface
/api/projects/...  owner-neutral multi-ingress Project/Brain Product capability
```

One operation may admit multiple ingress classes without creating multiple Product operations. A path namespace never grants authority.

## 4. Project-defined static-path generation law

For Project-defined operations:

```text
operationId = exact Release-admitted Project operation identity
```

A generated application OAD must contain one **literal concrete** path for every exact finite `Ops(R)` entry. Runtime path variables that select an arbitrary operation are forbidden.

Current regime roots are intentionally operation-class specific rather than universal:

```text
QUERY       → /api/projects/{projectId}/queries/<static generated operation segment>
ACTION      → /api/projects/{projectId}/actions/<static generated operation segment>
INTEGRATION → /api/projects/{projectId}/integrations/<static generated operation segment>
```

All three use exact typed request/response schemas. A Query may use POST when structured typed analytical input is the honest wire shape; HTTP GET aesthetics do not override semantic input shape.

The literal operation segment must be generated deterministically from the exact `operationId`; it cannot be caller-selected at runtime.

## 5. Naming and schema law

Canonical reusable schemas use stable PascalCase semantic names.

Rules:

```text
wire component name != database table name by default
wire component name != frontend component name
wire component name != provider DTO name unless provider meaning is genuinely Product-visible
```

Request/response schemas are operation-specific where meaning differs. Reuse exists only for a repeated semantic carrier/property.

Forbidden generic abstractions without a proved repeated semantic:

```text
AnyResource
AnyCommand
GenericResult
GenericListResponse
UniversalEntity
ProviderPayload
```

Money/decimal business values must not silently inherit binary floating-point semantics merely because JSON has a number type. Exact decimal representation is decided per accepted business measure before the first real application schema freezes it.

## 6. HTTP Problem contract

4B adopts RFC 9457 Problem Details:

```text
media type = application/problem+json
base schema = Problem
machine discriminator = Problem.type URI/reference
```

Human-readable `detail` MUST NOT be parsed as machine authority.

The accepted semantic outcome classes remain:

```text
401 unauthenticated
403 authenticated + legitimately disclosable subject/surface + denied action/request-authenticity
404 absent or intentionally non-disclosable
409 current owner-state/uniqueness/single-flight conflict
412 stale expected current subject/precondition
422 admitted semantic/business-input validation failure
503 required dependency unavailable
```

No later wire may turn a non-disclosable foreign subject into a 403 existence oracle. Owner-specific problem types are admitted only where a concrete consumer needs stable branching beyond the HTTP class.

## 7. Current-state / conditional contract

IC2 is a **semantic current-subject obligation**, not an automatic `If-Match` instruction.

RFC 9110 `If-Match` is used only when the ETag describes the current representation of the **same HTTP target resource being mutated**.

The current literal `IF_MATCH` set is exactly:

```text
PRJ-12 ClearProjectBrainBinding
PAR-14 ReviseScheduleTrigger
```

Truthful same-target examples:

```text
GET /.../brain-binding
→ strong ETag when present

DELETE same brain-binding target
→ If-Match when present

GET /.../triggers/{triggerId}
→ strong ETag

PATCH same trigger target
→ If-Match
```

`PRJ-11 SetProjectBrainBinding` remains `CURRENT_OR_ABSENT`: the same exact target can later map present-state update through `If-Match` and absent-state create through an exact absent precondition such as `If-None-Match: *`, but 4B must close that request shape explicitly rather than pretending one unconditional ETag exists.

Do **not** reuse an ETag from one resource as `If-Match` on a different command/collection target. Current explicit-semantic examples include:

```text
PromoteRelease
→ expected pointer generation explicitly carried

DecideApprovalRequest
→ exact ApprovalRequest/proposal digest explicitly carried

EnableAgentTrigger
→ exact TriggerRevision explicitly carried

ArchiveProject command subpath
→ exact Project current revision/generation explicitly carried
```

Likewise, when no exact item GET exists (for example a Published-App grant item), 4B must expose an explicit current revision/role/subject carrier rather than pretending the collection's ETag is the item's validator.

`WS-03`, `WS-06` and `PRJ-04` are no longer conditional-carrier cases because `4B-F01` removed those generic Product mutations entirely.

Failed standard representation preconditions remain 412-class Problems. Exact field/header spelling for explicit semantic revisions is operation schema work inside 4B.

Bounded Evidence: [../evidence/4b/current-state-carrier-assessment.md](../evidence/4b/current-state-carrier-assessment.md).

## 8. Idempotency contract

There is no current RFC standardizing `Idempotency-Key`; 4B owns the semantics while adopting the interoperable header name:

```text
Idempotency-Key
```

Where IC3/IC4 maps to caller-supplied repeatable intake:

- one key is scoped to exact operation + authority/containment subject;
- reuse with materially different admitted payload is rejected;
- duplicate admitted intake with the same key cannot create a second owner occurrence/effect;
- unresolved/ambiguous downstream effect remains fenced under IC4; same key never authorizes blind replay;
- server-generated owner/effect identity remains authority above the key;
- expiry/retention must be exact before implementation for every operation class that uses it.

Exact persistence/claim/reconciliation mechanics belong to 4D.

## 9. Authentication/session carriage

### 9.1 Human Product HTTP session

Current F1 carriage is one Conexus-owned opaque `iam.session` cookie:

```text
cookie name = __Host-conexus_session
Secure      = required
HttpOnly    = required
Path        = /
Domain      = forbidden
SameSite    = Lax
```

OpenAPI represents this only as a `securityScheme`; possession of the cookie is authentication/session carriage, not Product authorization.

Current authority remains:

```text
Keycloak OIDC
→ verified human identity
→ Conexus Account
→ opaque Conexus session
→ current Workspace/Project/app/owner authorization on every operation
```

Keycloak bearer tokens, realm roles, groups, organizations and Authorization Services are never accepted as Product authorization substitutes.

### 9.2 Non-HTTP/runtime authority

`PAR_TOOL`, `MAR_JOB`, owner/system transitions and future DEDICATED service projections are not converted into fake human HTTP cookies or arbitrary caller headers merely because OAS needs a security object.

For `RunAnalyticQuery`, current HTTP ingress is CP/PA; `PAR_TOOL` remains explicitly marked as a **non-HTTP** admitted ingress/projection.

## 10. Browser request-authenticity contract

Accepted architecture requires browser self-only/session/request-authenticity to be platform controlled and admits no credentialed cross-origin Product API in F1.

Current 4B law:

```text
credentialed cross-origin Product API = DENY
OIDC redirect/callback                 = separate allowlisted Technical Protocol
```

For browser Product API requests carrying the opaque session:

```text
Sec-Fetch-Site present
→ only same-origin is admitted
→ same-site / cross-site / none rejected for /api Product requests

Sec-Fetch-Site absent on CP/PA browser ingress
→ exact Origin must match the configured current Conexus origin
→ else exact Referer origin must match
→ neither trustworthy signal present = reject
```

`same-site` is intentionally insufficient because sibling subdomains are not Product authority peers.

HEADLESS is a distinct non-browser Product ingress. Absence of Fetch Metadata does not itself deny a legitimate non-browser HEADLESS request, but if browser metadata is present then foreign/same-site-non-origin context is rejected. `agent.headless.invoke` and exact owner facts remain mandatory.

Safe HTTP methods never mutate Product state.

Bounded Evidence: [../evidence/4b/browser-request-authenticity-assessment.md](../evidence/4b/browser-request-authenticity-assessment.md).

## 11. API surface separation

Wire namespaces preserve:

```text
Control Plane Product API
!= Published Application business API
!= Product Agent headless/interactive API
!= exact Project-defined capability wire
!= Technical Ingress / provider protocol
!= internal owner/runtime mechanism
```

Technical/protocol routes never inflate `N_platform` merely because they use HTTP.

For Product Agent execution specifically:

```text
PAR-04 / PAR-05
→ admit exact Conexus AgentRun owner truth
→ 202 AgentRun identity / exact Release pin

live stream / reconnect / runtime observe
→ later Technical Ingress/projection over that exact AgentRun
-X-> seventeenth PAR Product operation
-X-> Mastra runId/toolCallId/threadId as Product identity
-X-> stream end as AgentRun terminal truth
```

Current framework-leverage Evidence favors Mastra-native stream/HITL mechanics and AI-SDK-compatible projection at realization time, but 4B selects no runtime package or React transport. [Bounded Evidence](../evidence/4b/technology-leverage-and-par-streaming-review.md).

## 12. Project-operation declaration law

`contracts/api/project-operation.schema.json` closes at least:

```text
schemaVersion
operationId
regime = QUERY | ACTION | INTEGRATION
input schema
output schema
admitted caller class(es)
Project/app scope
required binding/pin classes
effect/read classification
truth/outcome profile
IC profile
positive proof + negative control identity
```

The grammar accepts only the bounded 4A caller/Permission vocabulary. It does not accept arbitrary global Permission strings, arbitrary target URLs or caller-selected Connections as effective authority.

An exact declaration is not runtime authority by file existence; it must be admitted into the exact Release.

## 13. Pagination / continuation law

There is no global filter/sort/include language.

Each operation exposes only accepted filters.

For mutable/unbounded list results, the reusable transport primitive is an **opaque continuation token**, not database offset/cursor internals. The token:

```text
continues one accepted list/query shape
!= authorization
!= source identity
!= historical snapshot authority
```

Caller-controlled page size is not admitted merely by convention; a real consumer may prove it later. F1 may therefore keep page sizing server-controlled while exposing only an optional opaque `pageToken` and an optional returned `nextPageToken`.

Unless an operation explicitly owns snapshot pinning:

```text
page coordinate A
+ later page coordinate B
→ each coordinate disclosed truthfully where material
→ B MUST NOT masquerade as the same snapshot as A
```

Budget Analyzer F1 specifically has no retained cross-call/page snapshot-pinning promise.

## 14. Truth/provenance wire law

Where 4A admits analytical/provenance truth states, wire schemas must preserve the closed distinctions rather than encode uncertainty through nullable business numbers.

Current closed state vocabulary includes:

```text
SUPPORTED_CURRENT
SUPPORTED_STALE
PARTIAL
UNVERIFIED
INDETERMINATE
UNSUPPORTED
DEPENDENCY_UNAVAILABLE
```

A material analytical response carries an opaque **system-issued result/source coordinate** where 4A requires `as_of`/provenance. The coordinate is output/provenance; it is not arbitrary caller historical input.

Rules:

```text
unknown != zero
partial != complete
stale != current
read-model result != source proof
empty supported-current result != dependency failure
```

The first Budget Analyzer operation schemas are the proving instance for this shared law.

Gateway effect provenance adds one separate owner-specific truth law:

```text
possible external acceptance + ambiguous response
→ OUTCOME_UNKNOWN
→ receipt / reconciliation Evidence
-X-> false FAILED
-X-> false SUCCESS
-X-> caller retry authority
```

`OUTCOME_UNKNOWN` is not part of the analytical truth vocabulary above; it is Gateway-owned external-effect truth.

## 15. Exact bytes

Byte transport remains subordinate to an owning Product operation:

```text
owner subject + current authorization
→ byte retrieval/upload capability
```

Storage keys, object paths, signed provider URLs and blob identifiers never authorize by possession. No global File Manager API is admitted.

## 16. Generated projections

Canonical machine-readable wire may generate implementation-facing artifacts, but final 4D SDK/runtime toolchain is not selected here.

Required property:

```text
canonical source wire
→ deterministic bundle/projection
→ drift from source fails verification
```

Current proof tooling is intentionally build-only:

```text
@redocly/cli@2.47.0  OAS lint + bundle
ajv-cli@5.0.0        JSON Schema 2020-12 compile/validation
ajv-formats@3.0.1    RFC3339 date/date-time validation for proving fixtures
```

These are not runtime dependencies and do not select future server/client codegen.

## 17. Current executable proof

The repository `verify` path currently proves:

```text
repository hygiene / docs / current-state guards
+ repository tests including 4B-F01 census regression
+ OAS lint
+ OAS deterministic bundle
+ Project declaration schema compilation
+ 4A ↔ fixed Product OAS bijection
+ current-state carrier exact-set proof
+ owner-slice schema closure checks for IAM/Workspace, Project, Builder, Brain, Connections, Release, PAR and Gateway
+ Budget declaration/generation/OAS proof
+ Budget truth-state positive and negative controls
```

Current technical GREEN before Gateway closeout-only documentation:

```text
Verify #323 = SUCCESS
candidate HEAD = ab2768b8d33ff0d6bfd47107841577fec76b5c70
fixed 4A↔OAS = 111/111
schema-closed = 103/111
missing = 0
extra = 0
duplicate = 0
literal IF_MATCH = { PRJ-12, PAR-14 }
IAM + Workspace = 20/20
Project = 21/21
Builder = 17/17
Brain = 11/11
Connections = 9/9
Release = 7/7
Product Agent Runtime = 16/16
Gateway = 2/2
Budget static generated paths = 2
```

The bounded `4B-F01` TDD remains preserved:

```text
Verify #233 = FAILURE
expected 111 fixed 4A operations after 4B-F01, found 114
```

The Connections slice added a separate exact TDD chain:

```text
Verify #283 = FAILURE
→ expected RED: CON-01 was not SCHEMA_CLOSED in the canonical bundle

Verify #284 = FAILURE
→ canonical Connections activation reached 78 / 111 schema-closed
→ prior gates remained green
→ checker defect exposed: Path Item parameters were not inherited

Verify #285 = SUCCESS
→ checker now interprets OAS Path Item parameters plus operation overrides without weakening semantic assertions
```

Bounded Evidence: [../evidence/4b/connections-schema-closure.md](../evidence/4b/connections-schema-closure.md).

The Release slice preserved the same test-first law:

```text
Verify #291 = FAILURE
→ expected RED: REL-01 was not SCHEMA_CLOSED in the canonical bundle

Verify #293 = SUCCESS
→ Release reached 7 / 7 and total schema closure reached 85 / 111
```

Bounded Evidence: [../evidence/4b/release-schema-closure.md](../evidence/4b/release-schema-closure.md).

The Product Agent Runtime slice then closed the live-agent Product boundary without importing framework authority:

```text
Verify #303 = FAILURE
→ expected RED: PAR-01 was not SCHEMA_CLOSED in the canonical bundle
→ all prior owner gates remained green

Verify #305 = SUCCESS
→ PAR reached 16 / 16 and total schema closure reached 101 / 111
→ Product command/AgentRun truth remained separate from live stream mechanics
→ 111↔111, IF_MATCH exact set and Budget proof remained green
```

Bounded Evidence: [../evidence/4b/par-schema-closure.md](../evidence/4b/par-schema-closure.md).

The Gateway slice then closed effect inspection without exposing a second effect-control surface:

```text
Verify #321 = FAILURE
→ expected RED: GW-01 was not SCHEMA_CLOSED in the canonical bundle
→ all prior owner gates remained green

Verify #323 = SUCCESS
→ Gateway reached 2 / 2 and total schema closure reached 103 / 111
→ OUTCOME_UNKNOWN remained explicit Gateway truth
→ retry/replay/reconciliation/effect execution remained owner-internal
→ 111↔111, IF_MATCH exact set and Budget proof remained green
```

Bounded Evidence: [../evidence/4b/gateway-schema-closure.md](../evidence/4b/gateway-schema-closure.md).

## 18. Next derivation

Representation, fixed-operation bijection, shared carriers, Project grammar, Budget proving instance and the first eight owner schema slices are established.

Closed owner slices:

```text
IAM + Workspace       = 20 / 20
Project               = 21 / 21
Builder               = 17 / 17
Brain                 = 11 / 11
Connections           = 9 / 9
Release               = 7 / 7
Product Agent Runtime = 16 / 16
Gateway               = 2 / 2
```

The next bounded owner slice is only:

```text
Managed Application Runtime = 3 Product operations
MAR-01 ListManagedJobRuns
MAR-02 GetManagedJobRun
MAR-03 RunManagedJobNow
```

Derive MAR schemas only from accepted managed occurrence/serving authority. Preserve exact Project/Release/job/JobRun disclosure, exact currently served Release + admitted `job/v1` for manual run-now admission, and normal single-flight/coalesce/repeatable-intake law. Queue delivery/redelivery, catch-up and schedule mechanics remain owner/runtime-private; no CreateCron, ReplayMissedSlots, ForceRedelivery or MarkJobSucceeded Product operation is admitted.

After the remaining fixed owner slices close, 4B still must complete Technical Ingress/protocol classification, generated-projection/no-parallel-DTO proof, whole-4B adversarial review and explicit operator ratification.

Do not begin 4C, router/framework selection, persistence design, Paved Road selection, migrations, Sankhya implementation or Product code.
