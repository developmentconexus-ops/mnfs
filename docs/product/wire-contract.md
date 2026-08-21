# Conexus OS — Executable Wire Contract

> **Status:** 4B CANDIDATE / REPRESENTATION + FIXED METHOD/PATH BIJECTION CLOSED / SHARED CARRIERS ACTIVE
> **Owner:** 4B — Executable Wire Contract.
> **Product semantics:** accepted 4A authority remains canonical above this wire.
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

Real method/path mapping created enough size/maintenance pressure that 4B's previously defined split trigger fired. The OAD is therefore now a **single multi-file OpenAPI authority**:

```text
contracts/api/product/openapi.yaml     canonical entrypoint / shared wire law
contracts/api/product/fixed-paths.yaml referenced Path Item source fragment
```

Rules:

```text
one editable entrypoint authority
+ deterministic local refs
+ validator resolves the whole graph
+ bundle is generated proof output
+ source ↔ bundle operation census is mechanically checked
```

`fixed-paths.yaml` is not a second Product API and is never consumed independently as an alternative entrypoint. Its existence is a maintenance partition inside one OAD authority.

Generated bundles under `/tmp` are proof artifacts only and are never committed/editable co-authority.

### 2.2 Project-defined operation grammar

```text
contracts/api/project-operation.schema.json
```

is the canonical JSON Schema 2020-12 grammar for exact Release-pinned Project operation declarations.

A concrete Project declaration is authoritative only as part of an exact admitted Project/Release contract. Generated OpenAPI from those declarations is a deterministic projection, not a second editable business-operation contract.

### 2.3 First Budget Analyzer proof instance

The first Budget Analyzer must instantiate exactly:

```text
AnalyzePendingBudgets
ListPendingBudgets
```

as `project-operation/v1` declarations and produce an exact generated/conforming application OAD. No third operation is admitted merely for wire convenience.

## 3. Fixed operation identity / HTTP shape law

For fixed platform operations:

```text
operationId = exact accepted 4A semantic operation name
x-conexus-4a-id = exact accepted 4A ledger ID
```

The current fixed shape derivation has mechanically closed:

```text
4A fixed operations        = 114
OAS fixed operations       = 114
missing                    = 0
extra                      = 0
duplicate operationId      = 0
duplicate 4A ID            = 0
duplicate method+path      = 0
```

`npm run wire:bijection` must remain green. The checker also rejects generic Product paths shaped like unrestricted `/execute` or `{operationSlug}` dispatch.

HTTP shape Evidence: [../evidence/4b/http-shape-derivation.md](../evidence/4b/http-shape-derivation.md).

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

Truthful cases include:

```text
GET /api/control/workspaces/{workspaceId}
→ strong ETag

PATCH same workspace target
→ If-Match

GET /api/control/projects/{projectId}
→ strong ETag

PATCH same Project target
→ If-Match

GET /.../brain-binding
→ strong ETag when present

PUT/DELETE same brain-binding target
→ If-Match when present
→ If-None-Match: * may protect exact absent-create semantics where applicable
```

Do **not** reuse an ETag from one resource as `If-Match` on a different command/collection target. Examples that therefore require explicit semantic current-subject input rather than cross-resource ETag abuse include:

```text
PromoteRelease
→ expected pointer generation explicitly carried

DecideApprovalRequest
→ exact ApprovalRequest/proposal revision/digest explicitly carried

EnableAgentTrigger
→ exact TriggerRevision explicitly carried

ArchiveProject command subpath
→ exact Project current revision/generation explicitly carried if the command target remains distinct
```

Likewise, when no exact item GET exists (for example an Area or Published-App grant item), 4B must expose an explicit current revision/role/subject carrier rather than pretending the collection's ETag is the item's validator.

Failed standard representation preconditions remain 412-class Problems. Exact field/header spelling for explicit semantic revisions is operation schema work inside 4B.

## 8. Idempotency contract

There is no current RFC standardizing `Idempotency-Key`; the IETF HTTPAPI draft expired in April 2026. 4B owns the semantics while adopting the interoperable header name:

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
ajv-cli@5.0.0        JSON Schema 2020-12 compile
```

These are not runtime dependencies and do not select future server/client codegen.

## 17. Current executable proof

The repository `verify` path currently proves:

```text
repository hygiene / docs / current-state guards
+ repository tests
+ OAS lint
+ OAS deterministic bundle
+ Project declaration schema compilation
+ 4A ↔ fixed Product OAS bijection
```

Latest established green proof before this amendment:

```text
Verify #205 = SUCCESS
fixed 4A↔OAS = 114/114
missing = 0
extra = 0
duplicate = 0
```

Any current HEAD after this amendment must be freshly reverified before the proof result is advanced.

## 18. Next derivation

Proceed in this order:

```text
1. encode request-authenticity/session attributes in machine-readable shared wire metadata
2. correct exact IC2 carrier mapping where cross-resource If-Match would be semantically false
3. freeze shared Problem / continuation / truth-provenance schemas
4. instantiate the two Budget Analyzer project-operation declarations
5. deterministically generate and validate the Budget application OAD
6. use that vertical to falsify Project operation generation before mass request/response schema closure
7. then complete exact request/response/error/carrier mapping across the 114 fixed operations
```

Do not begin 4C, router/framework selection, persistence design, Paved Road selection, migrations, Sankhya implementation or Product code.
