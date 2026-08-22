# 4B Evidence — Connections Schema Closure

> **Kind:** bounded 4B executable Evidence; not Product authority by itself.
> **Accepted semantic source:** current 4A Product authority plus accepted Connections / Integrations / Gateway authority.
> **Machine authority under proof:** `contracts/api/product/openapi.yaml` resolved graph.

## 1. Decision question

> Can all 9 current Connections Product operations be given exact wire shapes without creating secret readback, generic provider execution, cross-Workspace sharing, duplicate Project-binding authority, or a collapsed readiness/authorization state?

## 2. Exact Product slice

```text
CON-01 → CON-09
```

Total:

```text
9 Product operations
```

Canonical active Path Items:

```text
contracts/api/product/connection-paths.yaml
```

They become authority only through the canonical `contracts/api/product/openapi.yaml` entrypoint and resolved bundle.

## 3. Closure laws proved

### 3.1 Owner scope remains exact

The only admitted logical Connection owner scopes are:

```text
WORKSPACE | PROJECT
```

The owner scope and owner identifier are path-owned containment subjects, not caller-smuggled request fields. A Project-owned Connection remains private to that Project; provider identity never implies wider reuse and no cross-Workspace sharing operation exists.

### 3.2 Connector definition/version remains exact

Connector definitions are declarative platform-pack projections. The wire exposes exact definition/version, provider identity, admitted environments/operations and machine-readable configuration / credential-input schemas without exposing credential values.

`CreateConnection` names the exact Connector definition/version and accepts provider-specific **non-secret** configuration validated against that exact definition. It does not accept owner reassignment, sibling sharing or credential material.

### 3.3 Connection revisions remain immutable

`ReviseConnection` requires the exact current logical revision through:

```text
expectedCurrentRevisionId
```

and creates a new immutable `ConnectionRevision`. It does not mutate an old revision, alter owner scope, accept secret material, or manufacture a false cross-resource `If-Match` contract.

### 3.4 Credential ingress is write-only

`SetConnectionCredential` accepts provider-specific plaintext only through a `writeOnly` credential object validated against the exact Connector definition/version credential-input schema.

The success response is `204` with no credential content. The Product wire exposes neither plaintext, ciphertext, access/refresh tokens nor a credential-read API.

Logical credential presence may be projected as the non-secret fact:

```text
credentialConfigured
```

That fact does not imply qualification, Project binding, runtime health or caller authorization.

### 3.5 Qualification is exact and provenance-bearing

`QualifyConnection` is bound to:

```text
exact ConnectionRevision
+ exact environment
+ real provider/source Evidence
```

The request does not admit escape hatches such as:

```text
credential / secret
TestURL / arbitrary URL
SQL
Project binding selection
```

`GetConnectionQualification` returns the exact Connection/revision/environment coordinate plus qualification state and non-empty Evidence references.

The qualification-state vocabulary remains owner-issued because current Product authority does not ratify a closed lifecycle enum.

### 3.6 Distinct truths remain distinct

The wire preserves the accepted non-equivalence:

```text
configured
!= qualified
!= bound
!= healthy
!= authorized
```

Connections does not absorb Project-owned `ProjectConnectionBinding`, Gateway runtime health/effect admission, or Product authorization.

## 4. Executable falsifiers

The Connections checker rejects at least:

```text
any CON-01..09 operation not SCHEMA_CLOSED
provisional Connections response authority
ownerScope outside WORKSPACE | PROJECT
caller-smuggled owner/share fields
secret or credential readback
credential material on CreateConnection / ReviseConnection / qualification
mutable-revision semantics or false cross-resource If-Match
qualification against arbitrary URL / SQL / binding selection
qualification without exact revision/environment/provenance
collapsed bound/healthy/authorized/readiness status
invented qualification lifecycle enum
```

Machine guard:

```text
scripts/check-wire-connections.mjs
```

The guard resolves Path Item parameters plus operation-level overrides by `(in, name)`, matching OpenAPI 3.1.2 parameter inheritance rather than requiring redundant operation-local copies.

Technical reference used only for checker mechanics:

```text
https://spec.openapis.org/oas/v3.1.2.html#path-item-object
https://spec.openapis.org/oas/v3.1.2.html#operation-object
```

## 5. TDD proof

```text
Verify #283 = FAILURE
→ expected RED before canonical Connections activation
→ exact first failure: CON-01 is not SCHEMA_CLOSED

Verify #284 = FAILURE
→ canonical activation raised schema-closed count to 78 / 111
→ bijection, carriers and all previously closed owner gates passed
→ Connections checker then exposed a harness defect: it ignored inherited Path Item parameters
→ Product wire was not widened to satisfy the harness

Verify #285 = SUCCESS
HEAD = 176b4bd608630e567714f3e839ebdcb7cca5e36b
→ checker fixed to interpret OAS Path Item parameter inheritance without weakening any semantic assertion
```

Final established counts:

```text
fixed 4A operations      = 111
fixed OAS operations     = 111
schema-closed operations = 78
IAM + Workspace          = 20 / 20
Project                  = 21 / 21
Builder                  = 17 / 17
Brain Product            = 11 / 11
Connections              = 9 / 9
missing                  = 0
extra                    = 0
duplicate                = 0
literal IF_MATCH          = { PRJ-12, PAR-14 }
```

The same successful full Verify preserved the two-operation Budget Analyzer declaration/codegen proof and all truth-state positive/negative controls.

## 6. Result

```text
IAM + Workspace = CLOSED inside 4B
Project         = CLOSED inside 4B
Builder         = CLOSED inside 4B
Brain           = CLOSED inside 4B
Connections     = CLOSED inside 4B
schema-closed   = 78 / 111
4B overall      = OPEN / ACTIVE
Product code    = BLOCKED
```

No Product meaning, Permission, owner, trust boundary, runtime choice, persistence choice or Paved-Road/SDK decision was added by this closure.