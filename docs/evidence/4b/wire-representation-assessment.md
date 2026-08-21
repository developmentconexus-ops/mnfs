# 4B Evidence — Wire Representation Assessment

> **Kind:** bounded technical Evidence; not Product authority.
> **Decision owner:** `docs/phases/4b-executable-wire-contract.md` + current 4B wire authority.
> **Date:** 2026-08-21.

## 1. Question

> Which current standards and minimum artifact topology best express accepted 4A wire semantics without introducing unsupported feature surface or a fragile codegen/tooling dependency?

## 2. Current standards Evidence

### OpenAPI

Official OpenAPI Initiative sources establish:

- OAS **3.2.0** is the latest published specification, released 2025-09-19.
- OAS 3.2 is backward-compatible with 3.1 and adds new feature classes such as streaming/sequential media guidance, hierarchical tags, `QUERY`, `querystring` parameters and security metadata.
- OAS **3.1.2** is the latest 3.1 patch and uses JSON Schema Draft 2020-12 semantics through the OAS 3.1 dialect.
- The current OAS 3.1 dialect published by the OAI is `https://spec.openapis.org/oas/3.1/dialect/2024-11-10`.

Primary sources:

- https://spec.openapis.org/oas/
- https://spec.openapis.org/oas/v3.2.0.html
- https://spec.openapis.org/oas/v3.1.2.html
- https://spec.openapis.org/oas/3.1/dialect/2024-11-10.html
- https://www.openapis.org/blog/2025/09/23/announcing-openapi-v3-2
- https://learn.openapis.org/upgrading/v3.1-to-v3.2.html

### Ecosystem state

Current tooling Evidence is mixed for OAS 3.2:

- Swagger announced broad 3.2 support in April 2026.
- Redocly CLI supports 3.2 linting/processing, but its standalone `build-docs` path still documents 3.0/3.1-only support as of current docs.
- OpenAPI Generator 7.24.0 documents OpenAPI 3.1 as beta and does not list 3.2 support; its 3.2 support request remains open in current public Evidence.
- `swagger-parser` also still has a current 3.2 support request in public Evidence.

Sources:

- https://swagger.io/blog/swagger-launches-support-for-openapi-3-2-0/
- https://redocly.com/docs/cli/changelog
- https://redocly.com/docs/cli/commands/build-docs
- https://github.com/OpenAPITools/openapi-generator
- https://github.com/OpenAPITools/openapi-generator/issues/22728
- https://github.com/swagger-api/swagger-parser/issues/2248

## 3. Protected-property test

Accepted 4A requires:

```text
114 fixed HTTP-capable Product operations
Project-defined Query/Action/Integration wire grammar
Budget Analyzer two-query instance
JSON request/response contracts
cookie/session carriage
Problem/disclosure classes
pagination/filtering
strong current-state preconditions where needed
idempotency/effect carriers where needed
exact bytes where owning operations require them
```

No accepted 4A property currently requires a 3.2-only feature:

```text
hierarchical tags          = documentation convenience only
QUERY method               = no current accepted operation requires it
querystring schema         = no current generic query language admitted
streaming-specific 3.2     = no accepted 4A semantic requires streaming transport
OAuth metadata additions   = Keycloak/OIDC protocol does not become Product authorization
```

Therefore adopting 3.2 solely because it is latest would add a feature-set/tooling constraint without a current protected property.

## 4. Decision Evidence — OAS 3.1.2

Disposition:

```text
OAS 3.2.0 = DEFER for current 4B
OAS 3.1.2 = ADOPT for F1 canonical HTTP Product wire
JSON Schema = Draft 2020-12 through explicit OAS 3.1 dialect
```

Reason:

- fully sufficient for current accepted 4A semantics;
- current OAI patch/dialect remains modern JSON Schema 2020-12;
- broader current interoperability across validators/renderers/generators;
- avoids selecting unused 3.2 feature surface;
- migration to 3.2 is documented as backward-compatible if a real later property requires it.

Reopen only when a current accepted operation/projection needs a 3.2-only property or exact selected tooling makes 3.1 materially unfit.

## 5. HTTP Problem Evidence

RFC 9457 is the current Standards Track **Problem Details for HTTP APIs** specification and obsoletes RFC 7807.

Disposition:

```text
application/problem+json = ADOPT
RFC 9457 Problem model   = ADOPT as base machine error envelope
```

Conexus-specific problem types remain bounded to stable consumer needs. Human-readable `detail` is never a machine branching contract.

Source:

- https://www.rfc-editor.org/rfc/rfc9457.html

## 6. Conditional request Evidence

RFC 9110 defines strong entity-tag `If-Match` preconditions and 412 failure semantics specifically suitable for preventing lost updates on state-changing operations.

Disposition:

```text
ETag + If-Match = ADOPT where an accepted IC2 property maps to current representation state
```

Do not force `If-Match` onto every IC2 operation when the exact semantic subject is instead an immutable digest/revision carried as business input. 4B maps the carrier per operation.

Source:

- https://www.rfc-editor.org/rfc/rfc9110.html#name-if-match

## 7. Idempotency header Evidence

The IETF HTTPAPI `Idempotency-Key` work reached draft-07 but **expired on 2026-04-18 and is not an RFC** in current Evidence.

Disposition:

```text
header field name `Idempotency-Key` = ADOPT as Conexus wire convention where IC3/IC4 requires client retry identity
normative semantics                 = OWNED BY CONEXUS 4B, not delegated to the expired draft
```

The Conexus contract must define at least scope, uniqueness/reuse rule, payload mismatch behavior, retention/expiry expectations at semantic-wire level and relationship to owner/effect identity. Exact persistence/transaction mechanics remain 4D.

Source:

- https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/

## 8. Artifact-topology test

No current repository wire exists. For 114 fixed operations, premature multi-file splitting would create reference/bundle complexity before a real maintainability problem is observed.

Recommended initial authority topology:

```text
contracts/api/product/openapi.yaml
= one canonical editable OAS 3.1.2 entry document for the fixed Conexus Product HTTP wire

contracts/api/project-operation.schema.json
= one canonical JSON Schema 2020-12 grammar for exact Release-pinned Project operation declarations

later exact Project operation declaration instance
→ validated by project-operation.schema.json
→ deterministically projected to a generated/conforming application OAD
```

The fixed Product OAD remains single-file in F1 4B unless real size/tooling Evidence proves splitting improves correctness. If split later, one entry document remains canonical and bundle equivalence must be mechanically proved.

## 9. Result

```text
OAS version                         = 3.1.2 candidate ADOPT
Schema dialect                      = OAS 3.1 dialect / JSON Schema 2020-12
fixed Product OAD topology          = one canonical editable entry file
Project operation authority         = separate exact-release declaration schema, not generic executor
Problem base                        = RFC 9457 application/problem+json
IC2 standard carrier                = strong ETag / If-Match where semantically applicable
Idempotency-Key                     = Conexus-owned convention; current IETF draft is non-normative
OAS 3.2-only features               = DEFER under YAGNI
```

This Evidence does not select a router, server framework, frontend SDK, code generator or runtime.