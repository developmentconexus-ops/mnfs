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
| 4A — Product Surface & Authority Contract | OPEN / COMPLETE CANDIDATE / INDEPENDENT REVIEW NEXT | Candidate closes `N_platform=114`, exact Release-pinned Project capability grammar, `N_budget=2`, 25 ordinary Permissions and complete owner/principal/Permission/scope/consumer/ingress/outcome/disclosure/current-authority/idempotency-concurrency mapping; operator ratification still required | Material Evidence shows an accepted F1 interaction cannot be expressed without new Product meaning/owner/trust, the Project capability grammar requires an unsafe universal executor, the completed candidate is internally contradictory, or independent review finds a material defect |
| 4B — Executable Wire Contract | NOT STARTED | Canonical machine-readable Product wire closes accepted 4A semantics without parallel DTO/API authority | 4A changes materially or executable wire cannot express an accepted operation safely |
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
4A = OPEN / COMPLETE CANDIDATE / INDEPENDENT REVIEW NEXT
4B–4G = NOT STARTED
Product implementation = BLOCKED
```

## Exact next action

Perform the **independent adversarial review of the complete 4A candidate on one exact candidate HEAD**.

The completed candidate under review establishes:

```text
fixed Conexus platform operations = 114
Project-defined operation grammar = exact finite Release-pinned Ops(R)
first Budget Analyzer operations  = 2
ordinary Permissions              = 25
46 durable record classes         = classified without CRUD symmetry
13 semantic owners                = preserved
known unresolved Lead findings    = 0
```

The operator explicitly approved `4A-BUDGET-01` on 2026-08-21. The accepted first-vertical Product semantics are owned by [product/budget-analyzer-contract.md](product/budget-analyzer-contract.md): pending-budget intelligence; source mappings remain Brain/source Evidence rather than Product meaning; `as_of` is a system-resolved reconciliation/provenance coordinate rather than arbitrary historical query input; Budget age uses the canonical Budget business date rather than `DTALTER`; margin is unsupported; heuristic probability is rejected; conversion remains deferred; and the exact application operations are `AnalyzePendingBudgets` + `ListPendingBudgets`.

The canonical candidate Product-operation and authorization authorities are [product/operation-ledger.md](product/operation-ledger.md) and [product/permission-contract.md](product/permission-contract.md). The census/subtractive/consistency and Lead-adversarial Evidence is [evidence/4a/operation-coverage.md](evidence/4a/operation-coverage.md).

The independent reviewer must attempt to falsify, at minimum:

```text
missing accepted journey/consumer
speculative or CRUD/mechanism operation
owner collision or hidden owner
unsafe universal Project executor
Permission inferred from Keycloak/app role/UI location
cross-scope disclosure oracle
authority checked only before a protected mutation/decision
stale exact subject/generation winning
repeatable consequential intake duplicating effects/occurrences
OUTCOME_UNKNOWN blind replay
unknown/partial/stale analytics becoming zero/current
Budget source mapping becoming Product meaning
arbitrary caller-selected historical as_of
approval surface conferring approver eligibility
internal probe/composition/runtime mechanics promoted to Product API
```

After independent findings are returned:

```text
1. adjudicate each finding against current repository authority
2. correct only genuine material defects on the candidate branch
3. rerun repository verification on the resulting exact HEAD
4. if material candidate changes occurred, re-challenge the changed properties independently as required
5. only with zero unresolved material findings seek explicit operator 4A ratification
```

Do **not** open 4B, author OpenAPI, choose frontend/runtime/Paved-Road mechanics, implement Product code or merge PR #54 while 4A remains open.

The stable Phase-4 sequence is defined in [phases/4-implementation-readiness-program.md](phases/4-implementation-readiness-program.md); the owning 4A contract is [phases/4a-product-surface-and-authority-contract.md](phases/4a-product-surface-and-authority-contract.md).

The [Blueprint Harness design input](development/blueprint-harness-design.md) remains provider-independent planning/research/review/Paved-Road input. Its `Blueprint` / `Forge` working names are not admitted Product owners/APIs. Concrete scaffold/SDK/Mastra realization remains routed to 4D only after upstream Phase-4 authority closes.

The accepted [Realization Plan](phases/realization-planning.md) remains an execution skeleton and first-build proof budget consumed/rederived in 4F; it does not authorize starting R1 directly from Phase 3 or from 4A.