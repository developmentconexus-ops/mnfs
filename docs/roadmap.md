# Conexus OS Roadmap

This is the single current phase/status authority. It is not a worklog.

| Phase | Status | Exit condition / preserved result | Reopen trigger |
| --- | --- | --- | --- |
| 3A | CLOSED | Whole-product authority reconciled and ratified | Material Product or owner contradiction |
| 3B–3K | CLOSED | Context, modules, dependencies, data, contracts, behavior, runtime, security, operations, and frontend architecture accepted | Evidence invalidates an accepted invariant or boundary |
| 3L | CLOSED | Packages A, B, and D closed for exact tested properties; C and E safely deferred | A named qualification trigger fires |
| 3M | CLOSED | Owner-local failure/recovery architecture and first-installation restore/reactivation contract operator-ratified; no generic recovery owner or new pre-C-018 probe | A named recovery/topology/effect/implementation falsifier in the 3M closure fires |
| 3N | NEXT / NOT STARTED | Architecture verification contract accepted and executed | Begins only from the closed 3M authority projection |
| 3O | NOT STARTED | Vertical proof contract accepted | Begins only after 3N closure |
| C-018 | NOT RATIFIED | Final architecture ratification remains pending | Ratification requires preceding closures |
| Product implementation | BLOCKED | Requires C-018, realization planning, and explicit execution authority | No historical authorization carries forward |

```text
3A = CLOSED / consolidated baseline preserved
3L = CLOSED
3M = CLOSED / OPERATOR RATIFIED
3N = NEXT / NOT STARTED
3O = NOT STARTED
C-018 = NOT RATIFIED
Product implementation = BLOCKED
```

3M closure is summarized in [phases/3m-failure-recovery-architecture.md](phases/3m-failure-recovery-architecture.md); detailed current recovery semantics live in their owning references. 3N now owns the exact next action: define the bounded architecture verification contract against accepted 3A–3M authority, execute only the proofs that can genuinely falsify those architecture claims, and route first-build/first-production/3O properties forward rather than mocking them pre-implementation. 3L reopens only through the triggers in [reference/mastra/qualification-and-reopen-triggers.md](reference/mastra/qualification-and-reopen-triggers.md) or the managed-execution qualification.

