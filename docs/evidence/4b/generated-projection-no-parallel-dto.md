# 4B Evidence — Generated Projection / No-Parallel-DTO Proof

> **Kind:** bounded 4B executable Evidence; not Product authority and not final 4D SDK/toolchain selection authority.
> **Status:** OPERATOR-APPROVED DESIGN / REAL-OAS PROBE GREEN.
> **Product census impact:** exactly `0`; canonical Product authority remains `111 / 111`.

Repository current authority outranks this Evidence.

## Decision question

Can the canonical Conexus Product wire deterministically produce implementation-facing types/client projections without requiring a second editable DTO/API model, and can a current mature generator consume the **real** 111-operation Conexus OAS rather than only a toy example?

## Canonical custody law

```text
accepted Product authority
→ contracts/api/product/openapi.yaml
→ deterministic canonical bundle
→ generated projection(s)
→ implementation consumption later in 4D
```

Forbidden:

```text
hand-owned transport DTOs beside OpenAPI
generated file patched by hand
frontend interfaces that redefine wire semantics
client-specific error/status taxonomy
codegen output becoming Product authority
```

Generated proof output remains under `/tmp` and is disposable/reproducible.

## Tool-neutral projection proof

`scripts/generate-wire-projection.mjs` consumes the canonical bundled Product OAS and emits a deterministic `conexus-wire-projection/v1` manifest containing, for each fixed Product operation:

```text
x-conexus-4a-id / authority identity
operationId
HTTP method + path
path/query/header/cookie parameter carriage
request-body presence/content types
response statuses/content types
security carriage
```

The verifier generates this manifest twice and requires byte-identical output plus exactly 111 unique Product operations.

This manifest is a proving projection, not a new contract source.

## Real Kubb probe

The bounded native-first candidate probe uses exact build-only versions:

```text
Kubb / @kubb/* = 5.0.0
TypeScript      = 7.0.2
plugins         = TypeScript + Fetch only
```

The probe installs them inside `/tmp/conexus-kubb-real-oas-probe`; no Kubb package or generated artifact is added to Product runtime dependencies or committed as editable source.

It executes against the actual canonical Product bundle, not Petstore or a reduced fixture.

Required falsifiers:

```text
generate twice → byte-identical files
source method+path pairs = 111
Kubb Fetch method+path pairs = exact same 111
missing routes = 0
invented routes = 0
If-Match survives generation
Idempotency-Key survives generation
__Host-conexus_session security carriage survives generation
401/403/404/409/412/422/503 distinctions survive generated types
explicit public `any` = 0
strict TypeScript no-emit compile = green
```

A failure in any of those properties rejects the current candidate rather than authorizing hand-maintained DTO repair.

## TDD / probe chain

```text
Verify #353 = expected RED
→ Generated wire projection proof is missing
→ Product 111/111, Technical Ingress and every prior owner gate remained green

Verify #355 = probe FAILURE / harness finding
→ real Kubb generation reached strict TypeScript compile
→ generated Kubb internal client imports use explicit `.ts` extensions
→ probe tsconfig lacked allowImportingTsExtensions
→ no Product/OAS schema was changed and no Kubb semantic assertion was weakened

bounded harness correction
→ keep noEmit=true
→ add allowImportingTsExtensions=true

Verify #356 = SUCCESS
→ deterministic tool-neutral 111-operation projection green
→ real Kubb 5.0.0 generation on the Conexus OAS green
→ exact 111 method+path preservation green
→ carrier/security/status checks green
→ explicit public any check green
→ strict TypeScript 7.0.2 compile green
→ Budget Analyzer positive/negative truth proof remains green
```

The #355 finding is intentionally preserved as Evidence. It proves the probe is exercising generated code rather than accepting codegen output by file existence.

## Disposition

```text
Kubb 5.0.0 = EMPIRICALLY VIABLE 4D ADOPT CANDIDATE
              not selected Paved Road authority in 4B

Orval       = fallback probe only if a future material Kubb falsifier fires
Hey API     = deferred current comparison candidate
```

Because Kubb survived the exact 4B falsifiers, running equivalent full probes across every generator now would add comparison cost without improving the current no-parallel-DTO closure.

## Why TanStack Query and generated Zod stop here

4B needs to prove deterministic implementation projections can exist without parallel DTO authority. It does **not** select the final frontend SDK/runtime validation composition.

Therefore this slice deliberately stops after TypeScript + Fetch:

```text
TanStack Query integration → focused 4D consumer/Paved-Road evaluation
runtime Zod generation     → focused 4D validation evaluation
```

Canonical schema authority remains:

```text
OpenAPI 3.1.2 + JSON Schema 2020-12 / AJV proof
> generated TypeScript
> any future generated Zod projection
```

If generated Zod later cannot preserve an accepted JSON Schema invariant, the generated validator is rejected/adapted; Product schemas are not weakened to fit it.

## Closure consequence

4B now has executable Evidence that:

```text
canonical Product OAS
→ deterministic projection
→ current real generator
→ strict-compiling implementation-facing output
```

without a second editable DTO/API authority.

The next bounded 4B gate is the whole-4B executable/negative proof. Product implementation and 4C remain blocked/not started.
