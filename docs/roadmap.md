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
| C-015 refinement | REFINED / KEYCLOAK AUTHENTICATION SELECTED / OPERATOR APPROVED | Named identity-provider trigger resolved through a narrow Keycloak OIDC authentication boundary while Conexus retains Account/session/membership/grant/Published-App authorization sovereignty; first-production identity/recovery closure updated | Keycloak security/topology/recovery Evidence makes the selected IdP unfit; stable issuer-subject identity cannot be preserved; or a real SSO/SCIM/passkey/multi-IdP requirement materially changes the contract |
| Realization Planning | ACCEPTED / OPERATOR ACCEPTED | R1–R7 first-build skeleton accepted after independent Fable challenge; retained as Phase-4 input rather than direct Product-code authority | Material Phase-4 Evidence falsifies the skeleton, an applicability disposition, or ratified/refined authority it compiles |
| 4A — Product Surface & Authority Contract | CLOSED / OPERATOR RATIFIED | `N_platform=114`, exact Release-pinned Project capability grammar, `N_budget=2`, 25 ordinary Permissions, 46/46 durable-record classification, 13/13 owner boundaries and complete per-operation authority/IC mapping survived Lead + independent Fable challenge and were explicitly operator-ratified; PR #54 integrated | Material Evidence shows an accepted F1 interaction cannot be expressed without new Product meaning/owner/trust, the Project capability grammar requires an unsafe universal executor, or accepted 4A authority is materially contradictory/falsified |
| 4B — Executable Wire Contract | OPEN / ACTIVE | Canonical machine-readable Product wire closes accepted 4A semantics without parallel DTO/API authority | 4A changes materially or executable wire cannot express an accepted operation safely |
| 4C — Frontend Interaction & Authority Realization | NOT STARTED | Frontend goals/routes/states/consumers derive bidirectionally from accepted Product/wire authority with zero invented frontend operations | Real frontend interaction exposes a material 4A/4B gap |
| 4D — Project Paved Road & Runtime Realization | NOT STARTED | Exact scaffold/ownership classes, backend/frontend/data/integration/verification Paved Road, runtime/persistence/dependencies/deployment and conformance/escape-hatch/evaluation contract ratified before implementation graph | Required property cannot be realized by the Paved Road/runtime without changing accepted authority, or conformance proves the road can be silently bypassed |
| 4E — Whole-System Coherence & Golden Flows | NOT STARTED | Product/wire/frontend/Paved-Road/runtime form one coherent falsifiable system; first Budget Analyzer path and material negatives compose correctly | Composed flow reveals contradiction or missing authority/mechanism |
| 4F — Implementation Program & Execution Graph | NOT STARTED | R1–R7 rederived against exact 4A–4E contracts and exact Paved-Road version/profile into bounded implementation/proof slices | Exact realized contracts require a different implementation graph/order |
| 4G — Adversarial Implementation Readiness | NOT STARTED | Fresh independent challenge converges with no unresolved material implementation-readiness finding | Material finding falsifies any upstream readiness contract |
| Product implementation | BLOCKED | Requires 4A–4G closed/integrated plus a separate explicit operator Product execution grant; no prior planning/merge approval carries forward | No historical authorization carries forward |

```text
3A = CLOSED / consolidated baseline preserved
3L = CLOSED
3M = CLOSED / OPERATOR RATIFIED
3N = CLOSED / OPERATOR RATIFIED
3O = CLOSED / OPERATOR AUTHORIZED CLOSURE
C-018 = RATIFIED / OPERATOR RATIFIED
C-015 = REFINED / KEYCLOAK AUTHENTICATION SELECTED / OPERATOR APPROVED
Realization Planning = ACCEPTED / OPERATOR ACCEPTED / EXECUTION SKELETON
4A = CLOSED / OPERATOR RATIFIED / INTEGRATED
4B = OPEN / ACTIVE
4C–4G = NOT STARTED
Product implementation = BLOCKED
```

## Exact next action

Execute **4B — Executable Wire Contract** only, owned by [phases/4b-executable-wire-contract.md](phases/4b-executable-wire-contract.md).

First close the representation foundation before enumerating HTTP routes:

```text
1. select/pin the exact OpenAPI Specification + JSON Schema dialect from current official Evidence
2. define canonical artifact topology and split/bundle law
3. define operationId/component/Problem/security/conditional/idempotency conventions
4. prove those conventions can represent accepted 4A authority without custom parallel semantics
5. only then map the 114 fixed platform operations and Project-operation grammar
```

The accepted 4A input is fixed:

```text
114 fixed Conexus platform operations
+ exact Release-pinned Project-defined operation grammar
+ 2 Budget Analyzer registered Queries
+ 25 ordinary Permissions and accepted special/runtime/app authority routes
+ accepted disclosure/outcome/current-authority/idempotency-concurrency obligations
```

4B must make these semantics executable without creating a second Product authority in DTOs/routes/schemas. Wire representation may not create new Product operations, Permissions, owners or trust boundaries.

Do **not** begin 4C, choose the Project Paved Road/runtime, implement Product code, create migrations, implement Sankhya, or execute R1–R7 while 4B is open.

The stable Phase-4 sequence is defined in [phases/4-implementation-readiness-program.md](phases/4-implementation-readiness-program.md). Accepted 4A authority is [product/operation-ledger.md](product/operation-ledger.md), [product/permission-contract.md](product/permission-contract.md) and [product/budget-analyzer-contract.md](product/budget-analyzer-contract.md), with [evidence/4a/operation-coverage.md](evidence/4a/operation-coverage.md) retained as supporting Evidence.