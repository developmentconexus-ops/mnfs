# 4B — Independent Fable Review Lead Adjudication

**Status:** LEAD ADJUDICATION / CORRECTIONS APPLIED / FINAL EXACT-HEAD VERIFY PENDING

**Independent reviewed HEAD:** `734c00854b11d5c6cdbf28cecf001b0081ce22dc`

**Independent Evidence:** [fable-independent-review.md](fable-independent-review.md)

**4A reopen:** NO

**Product implementation:** BLOCKED

This adjudication treats the independent review as Evidence, not authority. Corrections are admitted only where repository authority plus executable falsification shows a real 4B defect.

## 1. Material findings

### M1 — ACCEPTED WITH NARROWER CORRECTION

The finding was reproduced under TDD:

```text
Verify #368 = expected RED
→ project-operation/v1 accepted inputSchema=true + outputSchema={}
→ exact Project operation could therefore carry semantically unconstrained payloads

Verify #369 = SUCCESS
→ grammar rejects semantically unconstrained root schemas
→ existing Budget declarations remain valid
```

The Fable-proposed `type: object` root restriction was **not** adopted because current authority does not require every future exact Project operation to use an object payload. Primitive, array, union, `enum`, `const` and `$ref`-rooted exact schemas remain legitimate possibilities.

The bounded correction instead requires every `inputSchema` and `outputSchema` to be a JSON Schema object with at least one root constraining form:

```text
$ref | $dynamicRef | type | const | enum | oneOf | anyOf | allOf | not
```

Boolean schemas and `{}` are therefore rejected without inventing a DTO-shape convention.

No additional prohibition on names such as `ExecuteAnyOperation` was added. Semantic boundedness comes from exact Release admission + static generated path + constrained input/output; banning English verbs by pattern would be aesthetic authority, not Product authority.

The optional Fable suggestion to force `ACTIVE_RELEASE` into every declaration's `requiredPins` was also not adopted. Release admission itself already supplies the exact Release context; `requiredPins` enumerates additional runtime/owner pins and must not duplicate structural Release membership without accepted authority requiring it.

### M2 — ACCEPTED

The finding was reproduced mechanically:

```text
Verify #370 = expected RED
→ unreachable Product YAML:
   current-state-overrides.yaml
   fixed-census-overrides.yaml
   fixed-paths.yaml
```

The three dead fragments were deleted rather than deprecated or archived. The whole-4B gate now rejects any `.yaml` under `contracts/api/product/` that is not reachable from the canonical `openapi.yaml` entrypoint.

```text
Verify #373 = SUCCESS
→ active Product wire remains 111 / 111
→ 0 dead parallel Product YAML fragments
```

This is a subtraction-only 4B correction. `4B-F01` remains unchanged and 4A does not reopen.

## 2. Non-material findings

### N1 — ACCEPTED

The independent reviewer reproduced repository-test self-interference. The proportional correction is intentionally smaller than a fixture-framework refactor:

- repository mutation tests now run with `--test-concurrency=1`;
- the hygiene negative control removes the `docs/work` tree only when that test created it.

This preserves the existing tests and makes repeated local verification deterministic without adding a new testing abstraction.

```text
Verify #375 = SUCCESS
```

### N2 — ACCEPTED

The carrier checker now verifies both semantic annotations and actual bundled HTTP parameters:

```text
semantic IF_MATCH set       = { PRJ-12, PAR-14 }
HTTP If-Match parameter set = { PRJ-11, PRJ-12, PAR-14 }
HTTP If-None-Match set      = { PRJ-11 }
```

`PRJ-11` remains the accepted current-or-absent special case with optional `If-Match` XOR `If-None-Match: *`; `PRJ-12` and `PAR-14` require actual `If-Match` carriage.

### N3 — ACCEPTED PARTIALLY

The valuable masking concern was corrected: each in-memory whole-4B negative must now fail with the expected defect class, not merely throw anything.

Artifact freshness remains intentionally guaranteed by the ordered `wire:verify` composition that creates the `/tmp` bundle/projections immediately before `wire:whole-4b`. Adding a second hash/provenance subsystem for ephemeral same-run proof files would duplicate the build graph without a demonstrated failure mode.

The parsed-object duplicate-method/path assertion is retained as harmless defensive documentation; Redocly remains the actual duplicate-key parser/lint boundary. No ratification claim relies on that assertion alone.

```text
Verify #377 = SUCCESS
```

### N4 — DEFER_TO_4D

Per-operation Problem subsets are already explicit in canonical OAS. Stronger consumer-branching/conformance assertions should be added only where the selected 4D client/server Paved Road or a concrete consumer requires stable branching. No Product meaning gap was shown.

### N5 — NON_MATERIAL / DEFER

Description-divergent `ProjectId`/`AgentId` components create Redocly bundle rename warnings but no schema or authority divergence. Hoisting/unifying them is cleanup, not a 4B correctness prerequisite. Avoid churn before ratification; 4D codegen/conformance can re-evaluate if generated duplicate types create real friction.

### N6 — NO BOUNDED CORRECTION JUSTIFIED

The review identifies possible additional couplings (`regime ↔ outcomeProfile`, proof-ID registry, dedicated-service identity). Current accepted authority does not define those stronger constraints. Adding them now would invent a new taxonomy/registry rather than close a demonstrated defect.

A non-HTTP-only declaration is grammar-valid but the HTTP OAD generator fails closed because it has no admitted HTTP projection. That is consistent with the rule that non-HTTP authority must never be fabricated as HTTP; a future 4D projection mechanism may consume it separately.

### N7 — NO CURRENT CORRECTION

A bare Technical OIDC callback `400` is acceptable for the protocol surface and no current consumer requires Problem Details there. RP-initiated Keycloak logout remains unneeded in F1 because `IAM-02 EndSession` owns current Conexus session termination. Reopen only on a real SLO consumer.

## 3. Warning disposition

Independent classification is accepted:

- OAS license warning: non-authoritative metadata; do not invent legal licensing.
- OIDC 302/303 versus Redocly 2XX recommendation: honest protocol shape wins.
- Budget conditional-schema warnings: JSON Schema-valid tool-shape warnings; executable positive/negative AJV proof remains decisive.
- AJV strict-type notes: tool-shape noise for validated conditionals, not semantic failure.
- bundle `ProjectId`/`AgentId` rename warnings: real but non-material N5 cleanup signal.

No warning is being converted into false schema semantics merely to make lint output aesthetically clean.

## 4. Lead conclusion

The independent review materially improved 4B without reopening Product authority:

```text
M1 = corrected with narrower semantic rule
M2 = corrected by deletion + reachability guard
N1 = corrected
N2 = proof hardened
N3 = masking corrected; duplicate freshness subsystem rejected
N4 = defer 4D
N5 = non-material defer
N6 = no new authority justified
N7 = no current consumer / no change

4A reopen = NO
new Product operations = 0
new subsystem = 0
Product implementation = BLOCKED
```

After human-authority/roadmap synchronization and a final full Verify on the exact resulting HEAD, the only remaining 4B gate is **explicit operator ratification**.
