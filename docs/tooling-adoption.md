# Tooling adoption

MNFS is **Pi-first** but does not vendor or fork the FirstMate stack. FirstMate is a reference implementation and source of field-tested patterns. Each external tool enters behind a narrow adapter only when a named milestone needs it and has an explicit behavioral proof.

## Current status

| Tool | Role in MNFS | Current status | Required proof |
|---|---|---|---|
| **Pi** | Primary reasoning and worker runtime | Project-local planning skill is implemented and accepted in M1; worker process adapter begins in M2 | M2: one Pi worker executes a fixed task in a leased worktree and produces a durable claim |
| **Lavish** | Browser review and operator feedback | Narrow open/poll/end adapter, stable `review.html` session and real browser pilot accepted in M1 | Complete: feedback creates a newer hash-bound revision and exact-hash approval freezes the contract |
| **Treehouse** | Reusable leased worktrees for `write_track` | Deferred until M2; not yet integrated | M2: one durable lease survives lead restart, maps to the real worktree and can be released safely |
| **Herdr** | Optional terminal projection for lead and workers | Deferred and explicitly non-authoritative; not a deciding criterion of M2 | Later: workers remain correct and recoverable with Herdr absent |
| **no-mistakes** | Optional final PR/CI delivery gate | Deferred until MNFS quality gates exist | M6: an MNFS-green change is delivered through PR and CI without duplicating review authority |
| **SQLite** | Local operational state | Implemented and accepted since M0; expanded with plan revisions in M1 | Missions, revisions, approval and later claims survive process restart transactionally |
| **Git** | Code, contracts and accepted evidence | Implemented | Approved contracts and final evidence are versioned; transient runtime state is not |
| **FirstMate** | Reference, benchmark and pattern source | Never a runtime dependency or repository base | Research, comparative dogfood and selective pattern adoption only |

## Authority boundaries

```text
MNFS core   -> mission, contracts, state, criteria, decisions and gates
Pi          -> probabilistic reasoning and agent execution
Treehouse   -> physical worktree pool and lease lifecycle
Herdr       -> terminal presentation and operational visibility only
Lavish      -> human visual feedback surface only
Git         -> code, commits, approved contracts and accepted evidence
SQLite      -> local operational state and recovery
no-mistakes -> optional final delivery to PR/CI
```

No adapter may become the source of truth for the MNFS domain:

- removing Herdr must not stop or invalidate execution;
- losing a transport message must not lose durable state;
- a Pi process exiting successfully must not close a feature;
- a worker emits a CLAIM, never its own verdict;
- only MNFS gates can accept work;
- Lavish feedback changes structured source, not rendered HTML directly.

## Adoption order

1. **M0 — Foundation:** TypeScript, SQLite, CLI, repository identity and recovery — complete.
2. **M1 — Visual planning:** mission contract, revisions, Pi skill, deterministic HTML/SVG and Lavish review — complete.
3. **M2 — One worker:** Pi process adapter, Treehouse lease adapter, durable CLAIM and lead restart recovery — next.
4. **M3–M5 — Quality:** independent review, local correction reuse, parallel write tracks, controlled integration and live QA.
5. **M6 — Delivery:** optional no-mistakes adapter and policy calibration.

## YAGNI rule

An external tool is not integrated merely because FirstMate uses it. It enters only when:

1. a named observed failure or capability gap exists;
2. the tool is simpler than implementing the same mechanism correctly;
3. the integration has a narrow replaceable adapter;
4. MNFS remains the domain authority;
5. a real acceptance proof demonstrates value;
6. a removal condition is known if the tool fails to outperform the simpler baseline.
