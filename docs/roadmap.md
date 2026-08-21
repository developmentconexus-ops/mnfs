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
| 4A — Product Surface & Authority Contract | CLOSED / OPERATOR RATIFIED / MATERIAL REOPEN CANDIDATE `4B-F01` | Ratified 4A remains current unless operator accepts the bounded downstream falsifier; `4B-F01` shows three generic update operations lack a closed mutable Product property set and cannot be safely schema-authored without inventing meaning | Material Evidence shows an accepted F1 interaction cannot be expressed safely; `4B-F01` is the current bounded trigger under operator adjudication |
| 4B — Executable Wire Contract | OPEN / BLOCKED ON `4B-F01` OPERATOR ADJUDICATION | Canonical machine-readable Product wire closes accepted/corrected 4A semantics without parallel DTO/API authority | Upstream operation semantics change materially or executable wire exposes another accepted-operation contradiction |
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
4A = CLOSED / OPERATOR RATIFIED / MATERIAL REOPEN CANDIDATE 4B-F01
4B = OPEN / BLOCKED ON 4B-F01 OPERATOR ADJUDICATION
4C–4G = NOT STARTED
Product implementation = BLOCKED
```

## Exact next action

Adjudicate **`4B-F01` — generic fixed-mutation semantic gap** only.

4B has already established and must preserve:

```text
OpenAPI 3.1.2 + JSON Schema 2020-12 representation
single multi-file Product OAD authority
114 ↔ 114 accepted fixed-operation method/path bijection at the pre-finding census
opaque Conexus session + same-origin browser request-authenticity law
truthful IC2 carrier rule; cross-resource If-Match rejected
Project-defined project-operation/v1 declaration grammar
Budget Analyzer exact two-query generation
Budget truth-state negative controls
```

The material downstream finding is bounded to:

```text
WS-03  UpdateWorkspace
WS-06  UpdateArea
PRJ-04 UpdateProject
```

For these three operations, accepted Product/owner authority contains no closed mutable property inventory. 4B therefore cannot author an exact request schema without inventing Product meaning.

Lead recommendation in [evidence/4b/fixed-mutation-semantic-gap.md](evidence/4b/fixed-mutation-semantic-gap.md):

```text
SUBTRACT WS-03
SUBTRACT WS-06
SUBTRACT PRJ-04

N_platform 114 → 111
```

Do **not** replace them by preference with rename/settings/generic patch operations. If a later real consumer requires a rename or metadata edit, admit the smallest exact semantic operation then.

Because 4A was operator-ratified, this bounded correction requires explicit operator approval before 4A authority or the OAS census changes.

Until adjudicated:

- do not mass-author fixed request/response schemas on top of the unresolved three operations;
- do not open 4C;
- do not choose runtime/Paved Road/persistence mechanics;
- do not implement Product code, Sankhya, migrations, or R1–R7.

The current 4B owning contract is [phases/4b-executable-wire-contract.md](phases/4b-executable-wire-contract.md). Current human-readable wire authority is [product/wire-contract.md](product/wire-contract.md). Accepted 4A authority remains [product/operation-ledger.md](product/operation-ledger.md) until explicit operator adjudication changes it.
