# Conexus OS — Executable Wire Contract

> **Status:** 4B CANDIDATE / REPRESENTATION FOUNDATION CLOSED / OPERATION MAPPING ACTIVE
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

OAS 3.2.0 is deliberately deferred for current F1 4B. It is newer and backward-compatible, but no accepted 4A property requires a 3.2-only feature and current codegen/parser ecosystem support remains less uniform. The bounded Evidence is [../evidence/4b/wire-representation-assessment.md](../evidence/4b/wire-representation-assessment.md).

Reopen only if a current accepted operation requires a 3.2-only property or exact selected tooling makes 3.1 materially unfit.

## 2. Canonical artifact topology

### 2.1 Fixed Conexus Product wire

```text
contracts/api/product/openapi.yaml
```

is the single editable canonical OpenAPI entry document for the 114 fixed Conexus Product operations.

F1 4B starts single-file deliberately. Do not split paths/components merely for aesthetics. If real size/tooling Evidence later requires a multi-document OAD:

```text
one entry document remains canonical
+ references are deterministic
+ bundled output is generated
+ source ↔ bundle equivalence is mechanically proved
```

Generated bundles are never editable co-authority.

### 2.2 Project-defined operation grammar

```text
contracts/api/project-operation.schema.json
```

is the canonical JSON Schema 2020-12 grammar for exact Release-pinned Project operation declarations.

A concrete Project declaration is authoritative only as part of an exact admitted Project/Release contract. Generated OpenAPI from those declarations is a projection, not a second editable business-operation contract.

### 2.3 First Budget Analyzer proof instance

The first Budget Analyzer will provide an exact declaration instance conforming to `project-operation.schema.json`, containing only:

```text
AnalyzePendingBudgets
ListPendingBudgets
```

and a generated/conforming application OAD used as 4B proof. The generated OAD is not independently hand-edited.

## 3. `operationId` law

For fixed platform operations:

```text
operationId = exact accepted 4A semantic operation name
```

Examples:

```text
GetControlPlaneAccessContext
SetProjectBrainBinding
PromoteRelease
SendProductAgentTurn
```

No route/framework prefix or CRUD renaming may replace the accepted semantic name.

For Project-defined operations:

```text
operationId = exact Release-admitted Project operation identity
```

A generated OAD must contain concrete operation IDs/paths for the exact finite `Ops(R)`. No variable operation slug/path may create a runtime `execute(anySlug, anyInput)` surface.

## 4. Naming and schema law

Canonical reusable schemas use stable PascalCase semantic names.

Rules:

```text
wire component name != database table name by default
wire component name != frontend component name
wire component name != provider DTO name unless provider meaning is genuinely Product-visible
```

Request/response schemas should be operation-specific where their meaning differs. Reuse exists only for a real repeated semantic carrier/property.

Forbidden generic abstractions without a proved repeated semantic:

```text
AnyResource
AnyCommand
GenericResult
GenericListResponse
UniversalEntity
ProviderPayload
```

## 5. HTTP Problem contract

4B adopts RFC 9457 Problem Details:

```text
media type = application/problem+json
base schema = Problem
```

The stable machine discriminator is the Problem `type` URI/reference. Human-readable `detail` MUST NOT be parsed as machine authority.

The 4A outcome classes remain:

```text
401 unauthenticated
403 authenticated + legitimately disclosable subject/surface + denied action
404 absent or intentionally non-disclosable
409 current owner-state/uniqueness/single-flight conflict
412 stale expected current subject/precondition
422 admitted semantic/business-input validation failure
503 required dependency unavailable
```

Owner-specific problem types are added only when a concrete consumer needs stable branching beyond the HTTP class.

A generic implementation/debugging exception taxonomy is forbidden.

## 6. Current-state / conditional contract

RFC 9110 strong ETags are the preferred standard representation validator when an accepted IC2 obligation is about current representation state.

```text
read of current representation
→ strong ETag where later mutation needs it

state-changing operation with representation-current precondition
→ If-Match

failed current representation match
→ 412-class Problem
```

Do not force ETag/If-Match when the exact semantic subject is already an immutable digest/revision carried as explicit operation input. The per-operation mapping decides the truthful carrier.

`If-None-Match`/304 caching semantics are admitted only where a real read consumer/property benefits; IC2 does not imply caching by symmetry.

## 7. Idempotency contract

There is no current RFC standardizing `Idempotency-Key`; the IETF HTTPAPI draft expired in April 2026. 4B therefore owns the semantics while adopting the interoperable header field name:

```text
Idempotency-Key
```

Where an operation maps IC3/IC4 to a caller-supplied retry identity, 4B requires:

- one key is scoped to the exact operation + current authority/containment subject;
- reuse with a materially different admitted payload is a conflict/validation failure, never a second effect;
- duplicate admitted intake with the same key cannot create a second owner occurrence/effect;
- an unresolved/ambiguous downstream effect remains fenced under IC4; replay is not authorized merely because the same key is supplied;
- expiry/retention is explicit for that operation class before implementation;
- server-generated owner/effect identities remain authoritative above the header value.

Exact persistence, claim transaction and reconciliation mechanics belong to 4D.

## 8. Authentication/session carriage law

OpenAPI `securitySchemes` document carriage only. They never become Product authorization authority.

Current human path remains:

```text
Keycloak OIDC protocol
→ verified human identity
→ Conexus Account
→ Conexus-owned opaque session
→ current owner authorization per operation
```

The fixed Product OAD will describe the Conexus session cookie as the protected human-operation carriage mechanism once the exact cookie wire name is frozen in 4B.

Published-App roles, ordinary Conexus Permissions, PAR/MAR run context and exact ToolProjection remain operation authority metadata/requirements; they are not encoded as trusted caller-supplied role headers.

No caller may supply an effective Workspace/Project/Release/role/approval authority field merely because a schema contains a similarly named reference.

## 9. API surface separation

Wire namespaces must preserve the 4A distinction:

```text
Control Plane Product API
!= Published Application business API
!= Product Agent headless/interactive API
!= exact Project-defined capability wire
!= Technical Ingress / provider protocol
!= internal owner/runtime mechanism
```

An OpenAPI operation existing in a technical/protocol document does not add it to `N_platform`.

For the fixed Product OAD, only the accepted 114 fixed Product operations count toward the Product operation bijection.

## 10. Project-operation generation law

The Project-operation grammar must contain enough exact information to generate concrete wire without caller/runtime free-form dispatch.

At minimum each declaration closes:

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
proof/negative-control identity
```

Authorization caller classes are closed to the 4A vocabulary. The grammar MUST NOT accept arbitrary global Permission strings or arbitrary provider URLs/Connections.

Generated application wire has **static concrete paths** for each exact `Ops(R)` entry. A path parameter such as `{operationSlug}` used as an unrestricted dispatcher is forbidden.

The exact deterministic method/path generation rule is the next Project-wire decision after the declaration schema proves the required authority fields.

## 11. Pagination/filtering law

There is no global generic filter/sort/include language.

Each operation declares only accepted parameters/filters.

Where a mutable/unbounded list needs pagination, prefer an opaque continuation token rather than exposing database offset/cursor internals. The token is a transport continuation, not authorization or historical-snapshot authority.

Unless an operation explicitly owns snapshot pinning:

```text
page/result coordinate A
+ later page/result coordinate B
→ both coordinates disclosed truthfully
→ B MUST NOT masquerade as the same snapshot as A
```

Budget Analyzer F1 specifically has no retained cross-call/page snapshot-pinning promise.

## 12. Exact bytes

Byte transport is always subordinate to an owning Product operation.

```text
owner subject + current authorization
→ byte capability/response
```

Storage keys, object paths, signed provider URLs and blob identifiers never become Product authorization by possession.

No global File Manager API is admitted.

## 13. Generated projections

The canonical machine-readable wire may generate implementation-facing artifacts, but 4B does not yet choose the final 4D SDK/toolchain.

Required property:

```text
canonical wire
→ reproducible projection
→ implementation consumes projection
→ drift from canonical wire fails verification
```

Candidate later projections include TypeScript types/transport, server validation bindings and operation registry metadata. Selection requires an exact consumer/tooling proof and remains separate from Product semantics.

## 14. Current foundation result

```text
OAS                             = 3.1.2
JSON Schema                     = Draft 2020-12 / explicit OAS 3.1 dialect
fixed Product OAD source        = contracts/api/product/openapi.yaml
Project declaration schema      = contracts/api/project-operation.schema.json
Problem                         = RFC 9457
current representation carrier  = strong ETag / If-Match where semantically applicable
idempotency header              = Idempotency-Key with Conexus-owned semantics
fixed operationId               = exact accepted 4A semantic operation name
Project generic dispatcher      = forbidden
parallel editable DTO authority = forbidden
```

## 15. Next derivation

Proceed in this order:

```text
1. author the canonical OAS root + shared Problem/conditional/idempotency primitives
2. author the Project operation declaration JSON Schema
3. prove both artifacts validate under their exact standards
4. derive fixed-platform owner/prefix mapping into concrete HTTP paths/methods
5. map all 114 operations with exact 4A bijection
6. instantiate Budget Analyzer and generated application wire
```

Do not begin frontend, router/framework, persistence or Product implementation.