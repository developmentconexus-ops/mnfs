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
| 4A — Product Surface & Authority Contract | OPEN / ACTIVE | Complete admitted F1 operation census + owner/principal/Permission/scope/consumer/ingress/outcome/current-authority closure ratified | Material Evidence shows an accepted F1 interaction cannot be expressed without new Product meaning/owner/trust or the 4A contract is internally contradictory |
| 4B — Executable Wire Contract | NOT STARTED | Canonical machine-readable Product wire closes accepted 4A semantics without parallel DTO/API authority | 4A changes materially or executable wire cannot express an accepted operation safely |
| 4C — Frontend Interaction & Authority Realization | NOT STARTED | Frontend goals/routes/states/consumers derive bidirectionally from accepted Product/wire authority with zero invented frontend operations | Real frontend interaction exposes a material 4A/4B gap |
| 4D — Runtime / Persistence / Process / Deployment Realization | NOT STARTED | Exact runtime, persistence, process, deployment and dependency mechanics selected only for accepted consumers/properties and proved proportionally | Required property cannot be realized by the selected mechanism without changing accepted authority |
| 4E — Whole-System Coherence & Golden Flows | NOT STARTED | Product/wire/frontend/runtime form one coherent falsifiable system; first Budget Analyzer path and material negatives compose correctly | Composed flow reveals contradiction or missing authority/mechanism |
| 4F — Implementation Program & Execution Graph | NOT STARTED | R1–R7 rederived against exact 4A–4E contracts into bounded implementation/proof slices | Exact realized contracts require a different implementation graph/order |
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
4A = OPEN / ACTIVE
4B–4G = NOT STARTED
Product implementation = BLOCKED
```

## Exact next action

Execute **4A — Product Surface & Authority Contract** only.

Derive the complete admitted F1 Product operation ledger from current Product/architecture authority before choosing HTTP paths, frontend screens, physical tables or runtime frameworks. The operation census, principal classes and ordinary Permission vocabulary must emerge from the derivation; do not copy counts from sibling repositories or choose target counts in advance.

4A must establish, for every admitted Product operation, one semantic owner, current consumer class, principal/authorization route, scope, ingress class, outcome/disclosure/current-authority obligations and any idempotency/concurrency property that later wire/runtime stages must preserve. Product implementation, OpenAPI authorship, frontend realization, runtime selection and R1 execution remain **BLOCKED** while 4A is open.

The stable Phase-4 sequence is defined in [phases/4-implementation-readiness-program.md](phases/4-implementation-readiness-program.md); the current owning 4A contract is [phases/4a-product-surface-and-authority-contract.md](phases/4a-product-surface-and-authority-contract.md).

The accepted [Realization Plan](phases/realization-planning.md) remains useful as an execution skeleton and first-build proof budget. It is consumed/rederived in 4F after Product surface, wire, frontend, runtime and coherence contracts are exact; it does not authorize starting R1 directly from Phase 3.

3M closure is summarized in [phases/3m-failure-recovery-architecture.md](phases/3m-failure-recovery-architecture.md); detailed current recovery semantics live in their owning references. 3N closure is summarized in [phases/3n-architecture-verification.md](phases/3n-architecture-verification.md). 3O closure is summarized in [phases/3o-vertical-architecture-proof-contract.md](phases/3o-vertical-architecture-proof-contract.md). C-018 final architecture ratification is summarized in [phases/c-018-final-architecture-ratification.md](phases/c-018-final-architecture-ratification.md). The operator-approved Keycloak requirement fired and resolved only the named C-015 identity-provider reopen trigger; the current refinement remains registered in [decisions/index.md](decisions/index.md) and projected into security/data/release-operation references. 3L reopens only through the triggers in [reference/mastra/qualification-and-reopen-triggers.md](reference/mastra/qualification-and-reopen-triggers.md) or the managed-execution qualification.
