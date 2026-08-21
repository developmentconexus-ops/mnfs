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
| Realization Planning | OPEN / NOT ACCEPTED | Exact first-build scope, exclusions, ordered slices, FIRST_BUILD applicability, live proof, pre-build qualification and stop/reopen boundaries accepted by operator | Material Evidence falsifies the plan or the ratified architecture it compiles |
| Product implementation | BLOCKED | Requires accepted Realization Planning and separate explicit execution authority | No historical authorization carries forward |

```text
3A = CLOSED / consolidated baseline preserved
3L = CLOSED
3M = CLOSED / OPERATOR RATIFIED
3N = CLOSED / OPERATOR RATIFIED
3O = CLOSED / OPERATOR AUTHORIZED CLOSURE
C-018 = RATIFIED / OPERATOR RATIFIED
Realization Planning = OPEN / NOT ACCEPTED
Product implementation = BLOCKED
```

## Exact next action

Review and adversarially adjudicate the [Realization Planning candidate](phases/realization-planning.md). If the plan survives, the operator may explicitly accept Realization Planning on this same coherent gate. Planning acceptance still does **not** authorize Product implementation; execution requires a separate explicit operator grant.

3M closure is summarized in [phases/3m-failure-recovery-architecture.md](phases/3m-failure-recovery-architecture.md); detailed current recovery semantics live in their owning references. 3N closure is summarized in [phases/3n-architecture-verification.md](phases/3n-architecture-verification.md). 3O closure is summarized in [phases/3o-vertical-architecture-proof-contract.md](phases/3o-vertical-architecture-proof-contract.md). C-018 final architecture ratification is summarized in [phases/c-018-final-architecture-ratification.md](phases/c-018-final-architecture-ratification.md). The accepted architecture remains ratified and Product implementation remains **BLOCKED**. Realization Planning is now open only as a planning candidate; no Product code, live Product execution or production effect is authorized by this transition. 3L reopens only through the triggers in [reference/mastra/qualification-and-reopen-triggers.md](reference/mastra/qualification-and-reopen-triggers.md) or the managed-execution qualification.
