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
| 4B — Executable Wire Contract | OPEN / ACTIVE | Canonical machine-readable Product wire closes current 4A semantics without parallel DTO/API authority | 4A changes materially or executable wire cannot express an accepted operation safely |
| 4C — Frontend Interaction & Authority Realization | NOT STARTED | Frontend goals/routes/states/consumers derive bidirectionally from accepted Product/wire authority with zero invented frontend operations | Real frontend interaction exposes a material 4A/4B gap |
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
4B = OPEN / ACTIVE
4C–4G = NOT STARTED
Product implementation = BLOCKED
```

## Exact next action

Continue **4B — Executable Wire Contract** only.

```text
fixed Product bijection = 111 ↔ 111
schema-closed = 101 / 111
missing / extra / duplicate = 0
literal IF_MATCH = { PRJ-12, PAR-14 }
IAM+Workspace 20/20; Project 21/21; Builder 17/17; Brain 11/11
Connections 9/9; Release 7/7; PAR 16/16 = CLOSED
Budget Analyzer two-query proof = green; Verify #305 = SUCCESS
```

Next bounded slice:

```text
Gateway inspection = 2 Product operations
GW-01 ListEffectAttempts
GW-02 GetEffectAttempt
```

Close only caller-visible effect-attempt inspection. Preserve exact originating run/operation/effect disclosure, receipt/reconciliation/provenance, `OUTCOME_UNKNOWN`, and zero retry/effect-execution authority. Effect admission, idempotency claim, resume and reconciliation remain owner-internal.

PAR Evidence: [schema closure](evidence/4b/par-schema-closure.md); [technology leverage](evidence/4b/technology-leverage-and-par-streaming-review.md) remains bounded 4D input only.

Do **not** begin 4C, select runtime/Paved Road/persistence mechanics, implement Product code, create migrations, implement Sankhya, or execute R1–R7 while 4B is open.

Authority: [4B contract](phases/4b-executable-wire-contract.md) → [wire contract](product/wire-contract.md) → [4A operation ledger](product/operation-ledger.md).