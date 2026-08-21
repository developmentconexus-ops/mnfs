# 4B — Executable Wire Contract

Current mutable status and exact next action live only in [../roadmap.md](../roadmap.md). This document owns the bounded 4B contract for compiling accepted 4A Product semantics into canonical machine-readable wire authority without creating a parallel Product model.

## 1. Decision question

> What is the smallest canonical executable wire model that expresses every accepted 4A Product operation and Project-operation admission rule exactly enough for backend/frontend/codegen consumers to implement without inventing DTO, route, auth, scope, outcome or concurrency meaning locally?

4B is contract realization. It is not Product implementation, frontend design, persistence design or runtime/framework selection.

## 2. Root failure to prevent

```text
accepted 4A semantic operation exists
→ wire is incomplete/ambiguous
→ backend invents request/response/path/auth detail
→ frontend invents a second DTO/error/state model
→ Project codegen invents generic executor semantics
→ transport convenience becomes Product authority
```

4B must make this failure mechanically detectable.

## 3. Binding inputs

Derive only from current accepted authority, principally:

- [Phase 4 Implementation Readiness Program](4-implementation-readiness-program.md);
- [Product Operation Ledger](../product/operation-ledger.md);
- [Permission Contract](../product/permission-contract.md);
- [Budget Analyzer Contract](../product/budget-analyzer-contract.md);
- one exact owning security/data/runtime reference only when a concrete wire question cannot be answered from 4A.

Research, sibling repositories, framework docs and reviewer output may inform wire mechanics but cannot add Product meaning.

## 4. Required 4B closures

4B must close four related but non-confusable wire surfaces.

### 4.1 Fixed Conexus platform wire

Every one of the accepted 114 fixed platform operations receives one canonical executable wire definition with no duplicate hand-written DTO authority.

Required closure:

```text
fixed platform operations                     = 114
fixed platform operations with operationId    = 114
fixed platform operations with request shape  = 114 where input exists
fixed platform operations with success shape  = 114
fixed platform operations with auth carriage  = 114
fixed platform operations with semantic errors= 114
orphan semantic operations                    = 0
wire-only invented Product operations         = 0
```

A lifecycle/internal/protocol interaction that 4A rejected as a Product operation must not re-enter the Product census because OpenAPI makes it convenient to expose.

### 4.2 Project-defined operation wire grammar

Future Project business operations cannot be statically pre-enumerated by the platform. 4B therefore freezes a deterministic machine-readable definition/codegen grammar for exact Release-pinned `Ops(R)`.

It must express at least the 4A-admitted regimes:

```text
registered Query
registered Action
honest Integration Operation
```

and must encode enough exact metadata to deterministically derive wire without a global runtime capability such as:

```text
execute(anySlug, anyInput)
execute(anySql)
execute(anyProviderOperation)
```

A Project operation definition must remain exact-Release authority. Generated transport is a projection, not a second editable Product contract.

### 4.3 First Budget Analyzer wire instance

The accepted first vertical instantiates the Project grammar exactly with:

```text
AnalyzePendingBudgets
ListPendingBudgets
```

The generated/conforming wire must preserve:

- closed R1–R6 result boundary;
- admitted filters only;
- no arbitrary dimensions/metrics/groupBy/SQL;
- system-resolved result coordinate disclosure;
- no caller-selected historical `as_of`;
- no false cross-call/page snapshot guarantee;
- `SUPPORTED_CURRENT | SUPPORTED_STALE | PARTIAL | UNVERIFIED/INDETERMINATE | UNSUPPORTED | DEPENDENCY_UNAVAILABLE` distinctions;
- negative Budget age never clamped/banded as valid truth.

### 4.4 Non-Product protocol / Technical Ingress separation

4B must decide exact wire homes for externally reachable protocol/technical interactions where a concrete current consumer requires them while keeping them outside the 114 Product operation census.

Examples include, only where current authority requires exact wire:

```text
OIDC login/callback/logout protocol mechanics
schedule wake / managed-runtime delivery ingress
provider callback/token-refresh ingress
owner runtime callback/RPC shape if it must cross a process boundary
```

A technical route may be executable and documented without becoming Product authority. Product and Technical Ingress operation identifiers/namespaces must not collide.

## 5. Canonical wire authority law

4B must establish one explicit custody rule:

```text
accepted 4A semantics
→ canonical machine-readable wire source
→ generated server/client/type projections
→ implementation consumes projections
```

Forbidden:

```text
OpenAPI + separately hand-maintained DTOs as co-authority
frontend interfaces that redefine transport semantics
router decorators/validators that silently widen schemas
runtime-generated arbitrary Project endpoints
mutable-latest Project operation resolution
copy-pasted per-client error-code enums
```

Generated artifacts may be checked in only when the repository deliberately treats them as reproducible generated output and mechanically proves drift; checked-in generated files never become an editable parallel authority.

## 6. Representation decision

OpenAPI is the preferred Product HTTP wire authority under the Phase-4 program where it faithfully represents the accepted surface.

4B must deliberately select and pin:

- exact OpenAPI Specification version;
- exact JSON Schema dialect/usage required by that version;
- canonical repository paths and split/bundle law;
- `operationId` naming law;
- component/schema naming law;
- tags/namespaces for owner/surface classification without making tags authority;
- deterministic codegen/projection contract;
- lint/validation/bundle proof.

The selection must use current official specification Evidence. A newer spec is not adopted merely because it exists; the chosen version must support the required semantics/tooling without unnecessary custom machinery.

## 7. HTTP semantic derivation law

HTTP shape is derived from operation meaning rather than CRUD aesthetics.

For every Product operation 4B must decide, as applicable:

```text
method
path
path/query/header/cookie parameters
request body schema
success response schema
semantic Problem outcomes
auth/session carriage
cache/conditional semantics
pagination
idempotency carrier
current-subject/precondition carrier
exact-byte/upload carrier
```

Rules:

- no one-route-per-durable-record symmetry;
- no generic `/execute/{slug}` Product escape hatch;
- no client-selected Workspace/Project/Release/role treated as authority merely because it appears in a path/body;
- server resolves current containment/authority from canonical subjects;
- route naming cannot merge Control Plane, Published App, Product Agent, Project capability and Technical Ingress authority classes.

## 8. Authentication / authorization carriage

Wire describes how authenticated identity/session and operation-local authority requirements are carried; it does not move authorization ownership into OpenAPI/security-scheme metadata.

4B must preserve:

```text
Keycloak/OIDC proof -> Conexus Account/session only
Conexus session     -> current owner authorization still required
Published-App role  -> independent app authority
PAR/MAR context     -> exact runtime projection authority
DEDICATED           -> only where a real current operation is admitted
```

A security scheme or role string in an OAD is documentation/transport metadata, never sufficient authorization by itself.

## 9. Disclosure and Problem contract

The accepted 4A semantic classes must receive one canonical executable Problem vocabulary/schema without changing their meaning:

```text
401-class unauthenticated
403-class authenticated/disclosable but denied
404-class absent or intentionally non-disclosable
409-class owner-state/uniqueness/single-flight conflict
412-class stale current-subject/precondition conflict
422-class admitted semantic/business-input failure
503-class required dependency unavailable
```

Owner-specific machine-readable codes may refine these classes only where a real consumer needs stable branching. Do not create a universal error taxonomy by symmetry.

Unknown/partial/stale/unsupported analytical truth is domain/result semantics and must not be flattened into generic HTTP success/failure shortcuts.

## 10. Conditional and concurrency carriers

4B converts accepted `IC0..IC4` properties into wire carriers only where a carrier is needed.

The semantic obligations remain:

```text
IC0 read-only
IC1 current authority through protected commit
IC2 exact current subject / expected revision-generation precondition
IC3 repeatable consequential intake with stable semantic identity
IC4 external/ambiguous effect fence + idempotency/reconciliation
```

4B may select standard carriers such as conditional headers or idempotency headers when they preserve the property. Exact transaction/lock/database realization remains 4D.

A header alone never proves the protected property is implemented.

## 11. Pagination, filtering and query semantics

Pagination/filtering must be operation-specific and deterministic enough that codegen clients cannot invent meaning.

4B must decide:

- pagination style(s) actually needed by accepted operations;
- stable continuation/order semantics where correctness requires them;
- filtering schema from accepted operation semantics only;
- behavior when a continuation/result coordinate is stale or no longer valid;
- no ambient generic `filter`, `sort`, `fields`, `include`, `groupBy` language unless one accepted operation genuinely owns that meaning.

Budget Analyzer specifically does not gain retained historical snapshot selection merely to make pagination convenient.

## 12. Exact bytes / attachments

Where an accepted owning operation carries bytes, wire must preserve owner authorization before byte access and must never make storage identity authorization.

Forbidden generic authority:

```text
GET /blobs/{storageKey}
POST /files as universal upload manager
provider URL possession => access
```

Upload/download patterns may be reusable wire mechanics only when the owning operation remains the semantic authority.

## 13. Generated projection contract

4B must define which outputs are generated from canonical wire and which are hand-owned.

Candidate generated outputs, only where real consumers exist:

```text
TypeScript transport types/client
server request/response validation bindings
operation registry metadata
Project operation Release projection
wire conformance test fixtures
```

4B does not choose the final frontend/backend SDK abstraction. 4D owns the Paved Road that consumes these generated contracts.

## 14. Proof package

4B cannot close because an OpenAPI file parses. The candidate must prove at least:

1. **4A bijection** — every accepted fixed Product operation maps to exactly one Product wire operation and every Product wire operation maps back to accepted 4A authority.
2. **Project grammar closure** — exact Release operation definitions deterministically produce bounded wire; arbitrary/mutable/unregistered operation execution is structurally impossible through the grammar.
3. **Budget instantiation** — `AnalyzePendingBudgets` and `ListPendingBudgets` conform without inventing generic analytics semantics.
4. **Authority separation** — CP / PA / HEADLESS / PAR_TOOL / MAR_JOB / SYSTEM-or-technical ingress cannot silently collapse.
5. **Problem/disclosure closure** — accepted 401/403/404/409/412/422/503 classes remain mechanically distinguishable where reachable.
6. **Truth-state closure** — unknown/partial/stale/unsupported/indeterminate states survive schema/codegen.
7. **Conditional/idempotency routing** — every accepted IC obligation has the required wire carrier or an explicit proof that no caller carrier is needed.
8. **No parallel DTO authority** — generated projection drift is mechanically detectable.
9. **Spec validity** — canonical documents validate/bundle under the exact selected specification/toolchain.
10. **Negative attack** — generic executor, generic CRUD, guessed cross-scope IDs, technical ingress promotion and arbitrary analytics/history proposals are rejected.

Executable proof tooling is Evidence/mechanics, not Product authority.

## 15. Working order

```text
1. pin exact specification/dialect + canonical artifact topology
2. define operationId/naming/component/error/security conventions
3. derive shared semantic wire primitives only from repeated accepted properties
4. map all 114 fixed operations
5. derive Project-operation definition/codegen grammar
6. instantiate Budget Analyzer BUD-01/BUD-02
7. classify exact Technical Ingress/protocol wire that current consumers require
8. derive generated projections + no-parallel-DTO law
9. execute census/bijection/spec-validity/negative proof
10. independent adversarial review
11. Lead adjudication
12. explicit operator 4B ratification
```

Do not start from React screens, router handlers, database tables or SDK helper design.

## 16. Explicit non-scope

4B MUST NOT:

```text
begin 4C frontend interaction realization
choose frontend package/feature topology
select backend router/framework
select ORM/query builder
select physical PostgreSQL schema/indexes
select queue/scheduler runtime
select exact Keycloak deployment/version
select concrete Paved-Road SDK APIs
implement handlers/controllers
implement generated client consumption in Product code
implement migrations
implement Sankhya sync/read model
start R1–R7
```

## 17. Stop / reopen conditions

STOP and reopen only the smallest owning authority when:

- accepted 4A semantics cannot be represented safely without a new Product operation/Permission/owner/trust boundary;
- two 4A operations necessarily collapse into one indistinguishable wire action or one operation necessarily requires contradictory wire semantics;
- the Project-operation grammar requires a universal mutable executor to function;
- accepted disclosure/current-authority/idempotency/truth-state semantics cannot be carried without changing Product meaning;
- the first Budget Analyzer wire requires analytics/history meaning not admitted by 4A;
- generated-projection discipline cannot prevent a second editable wire authority.

Do not reopen for REST aesthetics, naming preference, sibling-repository symmetry or framework convenience.

## 18. Exit condition

4B can close only when the exact candidate establishes:

```text
canonical machine-readable fixed platform wire for all 114 operations
+ deterministic exact-Release Project-operation wire grammar
+ exact Budget Analyzer BUD-01/BUD-02 wire instance
+ complete Problem/disclosure/truth-state contract
+ complete conditional/idempotency carrier mapping
+ Product vs protocol/Technical-Ingress separation
+ generated projection/no-parallel-DTO law
+ executable census/bijection/spec-validity proof
+ zero invented/orphan wire operations
+ independent adversarial challenge passed
+ repository verification green
+ explicit operator ratification
```

Only then may 4C derive frontend interaction realization from the accepted Product/wire authority.