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
| Realization Planning | ACCEPTED / OPERATOR ACCEPTED | Smallest first-build R1–R7 plan accepted after independent Fable challenge; RF-01..RF-04 bounded findings incorporated, no slice decomposition/owner/trust/3L reopen, exact corrected head verified green | Material implementation Evidence falsifies the plan, an applicability disposition, or the ratified/refined authority it compiles |
| Product implementation | BLOCKED / AWAITING EXPLICIT EXECUTION AUTHORITY | Requires this accepted plan to be integrated plus a separate explicit operator execution grant; no planning/merge approval carries forward | No historical authorization carries forward |

```text
3A = CLOSED / consolidated baseline preserved
3L = CLOSED
3M = CLOSED / OPERATOR RATIFIED
3N = CLOSED / OPERATOR RATIFIED
3O = CLOSED / OPERATOR AUTHORIZED CLOSURE
C-018 = RATIFIED / OPERATOR RATIFIED
C-015 = REFINED / KEYCLOAK AUTHENTICATION SELECTED / OPERATOR APPROVED
Realization Planning = ACCEPTED / OPERATOR ACCEPTED
Product implementation = BLOCKED / AWAITING EXPLICIT EXECUTION AUTHORITY
```

## Exact next action

Obtain **explicit operator merge authorization** for Draft PR #52. Do not merge by implication. After integration into `main`, revalidate repository state; Product implementation remains separately **BLOCKED** until the operator gives an explicit Product execution grant.

The accepted Realization Plan is [phases/realization-planning.md](phases/realization-planning.md), with realization research/reuse guidance in [development/production-realization-guide.md](development/production-realization-guide.md). The independent Fable challenge over the pre-correction exact candidate found four bounded material corrections: Keycloak recovery/topology closure, `3N-V24` serving-byte reachability, first-build Release current-proof routing without fake `bld.change_acceptance`, and Keycloak decision-register discoverability. All four were incorporated without changing R1–R7 decomposition, adding a semantic owner/trust zone, or reopening 3A–3O/3L; no second review round is justified because the corrections do not materially change slice scope. The corrected candidate passed the repository aggregate verification gate.

3M closure is summarized in [phases/3m-failure-recovery-architecture.md](phases/3m-failure-recovery-architecture.md); detailed current recovery semantics live in their owning references. 3N closure is summarized in [phases/3n-architecture-verification.md](phases/3n-architecture-verification.md). 3O closure is summarized in [phases/3o-vertical-architecture-proof-contract.md](phases/3o-vertical-architecture-proof-contract.md). C-018 final architecture ratification is summarized in [phases/c-018-final-architecture-ratification.md](phases/c-018-final-architecture-ratification.md). The operator-approved Keycloak requirement fired and resolved only the named C-015 identity-provider reopen trigger; the current refinement is registered in [decisions/index.md](decisions/index.md) and projected into security/data/release-operation references. Product implementation remains **BLOCKED**. 3L reopens only through the triggers in [reference/mastra/qualification-and-reopen-triggers.md](reference/mastra/qualification-and-reopen-triggers.md) or the managed-execution qualification.
