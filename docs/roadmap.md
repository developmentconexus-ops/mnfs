# Conexus OS Roadmap

This is the single current phase/status authority.

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
| 4A — Product Surface & Authority Contract | CLOSED / OPERATOR RATIFIED / `4B-F01` + `4C-F01` ACCEPTED / `4C-F02` OPEN | `N_platform=111`; W-01 challenges source-bootstrap semantics before new authority | Material Evidence shows an accepted F1 interaction needs new Product meaning/owner/trust, or current authority is falsified |
| 4B — Executable Wire Contract | CLOSED / OPERATOR RATIFIED / INTEGRATED / `4C-F02` OPEN | 111↔111; W-01 proves brownfield source onboarding is not caller-expressible before PRJ-07 | 4A changes materially or Evidence falsifies the ratified wire/proof boundary |
| 4C — Frontend Interaction & Authority Realization | OPEN / ACTIVE / `GF-01 LOCKED` / `W-01 PREFLIGHT` / `4C-F02 OPEN` | Human flows/interactions trace to accepted Product/wire authority with locked structural Evidence and zero invented frontend authority | Real interaction exposes a material 4A/4B gap or coherent UX requires invented authority |
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
4A = CLOSED / N_platform=111 / 4B-F01 + 4C-F01 ACCEPTED / 4C-F02 OPEN
4B = CLOSED / INTEGRATED / 111↔111 / 4C-F02 OPEN
4C = OPEN / ACTIVE / GF-01 LOCKED / W-01 PREFLIGHT / 4C-F02 OPEN
4D–4G = NOT STARTED
Product implementation = BLOCKED
```

## Current locked 4C baseline

`GF-01 H1-R2` remains operator-locked; `4C-F02` does not reopen it.

- [GF-01 approved P8 HTML](evidence/4c/gf01-global-frame-wireframe.html)
- [GF-01 H1-R2 structural lock](evidence/4c/gf01-structural-hypotheses.md)
- [GF-01 exact Screen Contract / P10 closure](evidence/4c/gf01-screen-contract.md)

Not opened: `W-04` Workspace Agent catalog; `4C-S06` pending ApprovalRequest discoverability.

## Exact next action

Adjudicate [`4C-F02`](evidence/4c/w01-authority-feasibility-preflight.md): Journey B requires `Create/Import Project` and PRJ-07 is greenfield/brownfield, but current Product wire has no source/repository onboarding authority before inception.

`Verify #458` is RED only for that falsifier after all prior repository/4A/4B/4C tests pass.

If accepted, reopen only Project source-bootstrap semantics. Leading YAGNI correction: enrich `PRJ-03 CreateProject` with closed creation-time `GREENFIELD | IMPORT_GIT`, preserve one canonical Project Git, make import one-time, keep credentials server-side, and leave `PRJ-07` inputless over the admitted source. Recompile only affected 4A/4B Project authority and make the W-01 falsifier green before resuming structural work.

Until then: W-01 HTML and later blocks remain blocked; GF-01 stays locked; 4D/Product implementation stay blocked.
