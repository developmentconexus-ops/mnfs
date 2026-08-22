# Conexus OS Roadmap

This is the single current phase/status authority. It is not a worklog.

| Phase | Status | Exit condition / preserved result | Reopen trigger |
| --- | --- | --- | --- |
| 3A | CLOSED | Whole-product authority reconciled and ratified | Material Product or owner contradiction |
| 3B–3K | CLOSED | Context, modules, dependencies, data, contracts, behavior, runtime, security, operations, and frontend architecture accepted | Evidence invalidates an accepted invariant or boundary |
| 3L | CLOSED | Packages A, B, and D closed for exact tested properties; C and E safely deferred | A named qualification trigger fires |
| 3M | CLOSED | Owner-local failure/recovery architecture and first-installation restore/reactivation contract operator-ratified; no generic recovery owner or new pre-C-018 probe | A named recovery/topology/effect/implementation falsifier in the 3M closure fires |
| 3N | CLOSED | Architecture verification contract accepted and executed; accepted 3A–3M architecture survived Lead + independent Fable challenge; bounded authority/proof-routing/data-closure defects corrected | Material Evidence falsifies an accepted architecture invariant or proves a routed proof stage incapable of genuine falsification |
| 3O | CLOSED | First Budget Analyzer vertical proof contract accepted; independent live-source/read-model falsification, semantic admission, representative coverage and 3N forward routing preserved without Product implementation | Material Evidence falsifies the contract, proves a routed proof stage incapable of genuine falsification, or exposes a contradiction with accepted Product/architecture authority |
| C-018 | RATIFIED / OPERATOR RATIFIED | Final Product architecture continuity ratified after exact-head R1–R7 review; implementation-dependent proof remains routed downstream | Material Evidence falsifies the ratified Product/architecture target, qualification scope, owner/trust boundary, or genuine downstream falsifiability |
| C-015 refinement | REFINED / KEYCLOAK AUTHENTICATION SELECTED / OPERATOR APPROVED | Named identity-provider trigger resolved through a narrow Keycloak OIDC authentication boundary while Conexus retains Account/session/membership/grant/Published-App authorization sovereignty; first-production identity/recovery closure updated | Keycloak security/topology/recovery Evidence makes the selection unfit; stable issuer-subject identity cannot be preserved; or a real SSO/SCIM/passkey/multi-IdP requirement materially changes the authentication contract |
| Realization Planning | ACCEPTED / OPERATOR ACCEPTED | R1–R7 first-build skeleton accepted after independent Fable challenge; retained as Phase-4 input rather than direct Product-code authority | Material Phase-4 Evidence falsifies the skeleton, an applicability disposition, or ratified/refined authority it compiles |
| 4A — Product Surface & Authority Contract | CLOSED / OPERATOR RATIFIED / `4B-F01` BOUNDED CORRECTION ACCEPTED | Current authority is `N_platform=111`, exact Release-pinned Project capability grammar, `N_budget=2`, 25 ordinary Permissions, 46/46 durable-record classification and 13/13 owner boundaries; `WS-03`, `WS-06`, `PRJ-04` were operator-approved downstream subtractions rather than speculative DTO repair | Material Evidence shows another accepted F1 interaction cannot be expressed without new Product meaning/owner/trust, or the current authority is materially contradictory/falsified |
| 4B — Executable Wire Contract | CLOSED / OPERATOR RATIFIED / INTEGRATED | Canonical Product wire is 111↔111 schema-closed; Technical Ingress remains 3 protocol-only operations with zero Product-count impact; Project grammar, Budget proof, generated projections, whole adversarial proof, independent Fable review and Lead adjudication converged with no 4A reopen | 4A changes materially, executable wire cannot express an accepted operation safely, or new Evidence falsifies the ratified wire/proof boundary |
| 4C — Frontend Interaction & Authority Realization | NEXT / NOT STARTED | Frontend goals/routes/states/consumers derive bidirectionally from accepted Product/wire authority with zero invented frontend operations | Real frontend interaction exposes a material 4A/4B gap |
| 4D — Project Paved Road & Runtime Realization | NOT STARTED | Exact scaffold/ownership classes, backend/frontend/data/integration/verification Paved Road, runtime/persistence/dependencies/deployment and conformance/escape-hatch/evaluation contract ratified before implementation graph | Required property cannot be realized by the Paved Road/runtime without changing accepted authority, or conformance proves the road can be silently bypassed |
| 4E — Whole-System Coherence & Golden Flows | NOT STARTED | Product/wire/frontend/Paved-Road/runtime form one coherent falsifiable system; first Budget Analyzer path and material negatives compose correctly | Composed flow reveals contradiction or missing authority/mechanism |
| 4F — Implementation Program & Execution Graph | NOT STARTED | R1–R7 rederived against exact 4A–4E contracts and exact Paved-Road version/profile into bounded implementation/proof slices | Exact realized contracts require a different implementation graph/order |
| 4G — Adversarial Implementation Readiness | NOT STARTED | Fresh independent challenge converges with no unresolved material implementation-readiness finding | Material finding falsifies any upstream readiness contract |
| Product implementation | BLOCKED | Requires 4A–4G closed/integrated plus a separate explicit operator Product execution grant; no prior planning/merge approval carries forward | No historical authorization carries forward |

```text
3A–3O = CLOSED
C-018 = RATIFIED / OPERATOR RATIFIED
C-015 = REFINED / KEYCLOAK AUTHENTICATION SELECTED / OPERATOR APPROVED
Realization Planning = ACCEPTED / OPERATOR ACCEPTED
4A = CLOSED / OPERATOR RATIFIED / 4B-F01 ACCEPTED / N_platform=111
4B = CLOSED / OPERATOR RATIFIED / INTEGRATED
4C = NEXT / NOT STARTED
4D–4G = NOT STARTED
Product implementation = BLOCKED
```

## Exact next action

Open **4C — Frontend Interaction & Authority Realization** as a fresh Phase-4 authority gate from current integrated `main`.

Integrated 4B preserves:

```text
fixed Product bijection/schema closure = 111 / 111
missing / extra / duplicate = 0
semantic IF_MATCH = { PRJ-12, PAR-14 }
HTTP If-Match = { PRJ-11, PRJ-12, PAR-14 }
HTTP If-None-Match = { PRJ-11 }
all fixed owner slices = CLOSED
Budget Analyzer proof = green
Technical Ingress = CLOSED / 3 protocol-only HTTP operations / N_platform impact 0
generated projection / no-parallel-DTO = CLOSED / real Kubb 5.0.0 OAS probe green
whole-4B executable/negative proof = CLOSED
Product YAML topology = 10 reachable fragments / 0 dead parallel fragments
independent Fable review = COMPLETE / 2 bounded material findings corrected
Lead adjudication = COMPLETE / 4A reopen NO
operator ratification = COMPLETE
```

4C must derive frontend goals, routes, states and consumers bidirectionally from accepted 4A+4B authority with zero invented frontend operations, DTOs or authority.

Do **not** begin 4D or Product implementation. Opening 4C does not select the final Paved Road/runtime.

Current bounded Evidence: [Technical Ingress](evidence/4b/technical-ingress-classification.md) → [Generated Projection / No Parallel DTO](evidence/4b/generated-projection-no-parallel-dto.md) → [Whole-Wire Adversarial Proof](evidence/4b/whole-wire-adversarial-proof.md) → [Independent Fable Review](evidence/4b/fable-independent-review.md) → [Lead Adjudication](evidence/4b/fable-review-adjudication.md).

Authority: [4B contract](phases/4b-executable-wire-contract.md) → [wire contract](product/wire-contract.md) → canonical Product + Technical machine-readable wire.
