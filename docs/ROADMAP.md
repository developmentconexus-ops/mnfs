# Conexus OS Roadmap

This is the single current phase/status authority. It is not a worklog.

| Phase | Status | Exit condition / preserved result | Reopen trigger |
| --- | --- | --- | --- |
| 3A | CLOSED | Whole-product authority reconciled and ratified | Material Product or owner contradiction |
| 3B–3K | CLOSED | Context, modules, dependencies, data, contracts, behavior, runtime, security, operations, and frontend architecture accepted | Evidence invalidates an accepted invariant or boundary |
| 3L | CLOSED | Packages A, B, and D closed for exact tested properties; C and E safely deferred | A named qualification trigger fires |
| 3M | NEXT / NOT STARTED | Must define failure and recovery architecture under a separately accepted phase authority | Do not infer content before phase start |
| 3N | NOT STARTED | Architecture verification contract accepted and executed | Begins only after 3M closure |
| 3O | NOT STARTED | Vertical proof contract accepted | Begins only after 3N closure |
| C-018 | NOT RATIFIED | Final architecture ratification remains pending | Ratification requires preceding closures |
| Product implementation | BLOCKED | Requires C-018, realization planning, and explicit execution authority | No historical authorization carries forward |

```text
3A = CLOSED / consolidated baseline preserved
3L = CLOSED
3M = NEXT / NOT STARTED
3N = NOT STARTED
3O = NOT STARTED
C-018 = NOT RATIFIED
Product implementation = BLOCKED
```

3M entry requires a named phase authority and exact current inputs. Its exit must close recovery invariants, partial failure, retry/unknown outcomes, cancellation, timeout, orphaned work, and restart behavior without changing accepted owners silently. 3L reopens only through the triggers in [reference/mastra/qualification-and-reopen-triggers.md](reference/mastra/qualification-and-reopen-triggers.md) or the managed-execution qualification.

