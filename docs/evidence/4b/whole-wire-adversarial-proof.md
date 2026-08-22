# 4B Evidence — Whole-Wire Executable / Negative Proof

> **Kind:** bounded 4B executable Evidence; not new Product authority and not 4D technology-selection authority.  
> **Status:** TECHNICAL GREEN / pending independent review and operator 4B ratification.  
> **Implementation:** BLOCKED.

Repository current authority outranks this Evidence.

## Purpose

Falsify the composed 4B wire rather than merely rerun owner-local checks. The whole proof consumes the already-proven Product bundle, Project-operation grammar and generated Budget OAD, Technical Ingress bundle, deterministic Product projection and codegen proof, then adds only cross-surface attacks not owned by a single earlier checker.

## TDD chain

```text
Verify #361 = expected RED
→ every prior repository/Product/Technical/Kubb/Budget gate green
→ Whole 4B executable proof is missing

Verify #363 = genuine adversarial falsifier
→ every prior gate green
→ AnalyzePendingBudgets lost exact HTTP caller/authorization projection

Verify #364 = technical GREEN
→ Project HTTP generator correction admitted
→ whole cross-surface proof and all negatives green
→ all prior gates remain green
```

## Material finding exposed by the whole proof

The Project declaration grammar already owns exact caller class, Permission/role, scope and effect classification, but `scripts/generate-project-openapi.mjs` previously projected only the static route/schema plus Published-App role convenience. It also rejected a valid mixed declaration containing a human HTTP caller and a non-HTTP caller.

That created a real authority-loss risk:

```text
exact Project declaration
→ generated HTTP OAD
-X-> silently forget CONTROL_PLANE Permission / scope / effectClass
-X-> reject CP + PAR_TOOL even though PAR_TOOL is a separate non-HTTP ingress
```

The bounded correction is deliberately smaller than a new transport/runtime design:

```text
HTTP callers     = PUBLISHED_APP | CONTROL_PLANE
non-HTTP callers = PAR_TOOL | MAR_JOB | DEDICATED_SERVICE_SCOPED

Project HTTP generator
→ requires at least one admitted HTTP caller
→ preserves exact HTTP caller objects
→ preserves non-HTTP caller objects as classification/projection only
→ preserves declared scope
→ preserves effectClass
-X-> creates HTTP auth for runtime callers
-X-> creates runtime bus/RPC
-X-> changes Project-operation grammar
```

This is projection fidelity, not new Product meaning.

## Cross-surface executable proof

The whole runner proves together:

```text
fixed Product operations = 111
Technical Ingress        = 3
Budget Project operations = 2 generated static paths
Product projection        = 111 / PROJECTION_ONLY
```

and preserves separation:

```text
Product routes          → /api/... + exact operationId + x-conexus-4a-id
Technical routes        → /protocol/... + zero x-conexus-4a-id
Project generated wire  → /api/projects/{projectId}/<regime>/<literal operation segment>
generated projection    → cannot become editable authority
```

A synthetic valid `InspectGovernedProjectState` declaration additionally proves the previously unexercised mixed-ingress case:

```text
QUERY
CONTROL_PLANE / project.read
+ PAR_TOOL
CURRENT_WORKSPACE / CURRENT_PROJECT / no Published App
ACTIVE_RELEASE
READ_ONLY / READ / IC0
```

The generated HTTP projection keeps `CONTROL_PLANE + project.read`, classifies `PAR_TOOL` only as non-HTTP ingress, keeps exact scope/effectClass, and emits the literal route:

```text
/api/projects/{projectId}/queries/inspect-governed-project-state
```

## Negative controls

All fired in Verify #364:

```text
Technical Ingress cannot acquire x-conexus-4a-id
Product wire cannot escape into /protocol
Project operation cannot become generic {operationSlug} dispatch
generated wire projection cannot become editable authority
generated wire projection cannot drift method/path identity
Project grammar rejects arbitrary global Permission
Project grammar rejects caller-selected target URL authority
Project generator rejects generic execute dispatch after valid declaration admission
```

Earlier owner/truth negatives remain independently active, including `OUTCOME_UNKNOWN`, usage/cost missing != zero, Budget truth-state negatives, current-state carriers and Technical/runtime identity separation. The whole runner does not duplicate those owner-local assertions.

## Result

The composed 4B executable wire survived the bounded whole-system attacks after one genuine projection-fidelity defect was exposed and corrected at its source.

No operation census, Product owner, Permission vocabulary, Technical surface, Project regime, runtime framework or implementation authority was added.

Next authority step is independent adversarial review of the exact 4B candidate, followed by Lead adjudication and explicit operator ratification. 4C and Product implementation remain blocked.
