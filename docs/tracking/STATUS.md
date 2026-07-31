# Project status

- **Program:** Pi-first MNFS
- **Canonical environment:** Ubuntu on WSL2
- **Completed acceptance:** real M0 WSL2 smoke — [issue #1](https://github.com/developmentconexus-ops/mnfs/issues/1)
- **Active milestone:** M1 — Visual mission planning
- **Active design:** `docs/design/2026-07-31-m1-visual-mission-planning.md`
- **Active plan:** `docs/superpowers/plans/2026-07-31-m1-visual-mission-planning.md`
- **Active branch:** `feat/m1-visual-planning`
- **Current state:** M1 design and task plan committed; implementation starts with plan domain, validation and revision hashing
- **Repository:** https://github.com/developmentconexus-ops/mnfs
- **M0 draft PR:** https://github.com/developmentconexus-ops/mnfs/pull/4
- **M1 issue:** https://github.com/developmentconexus-ops/mnfs/issues/3
- **Tooling:** Pi is the reasoning runtime; Lavish is the M1 browser review adapter; Treehouse and Herdr remain deferred to M2

## Current objective

Prove the smallest complete visual planning loop:

```text
open mission → structured revision → deterministic HTML → Lavish feedback
→ newer structured revision → exact-hash operator approval → versioned contract
```

## M0 acceptance

- [x] `mnfs doctor` reports required and optional WSL2 tools.
- [x] repository service creates a stable, idempotent identity.
- [x] runtime root resolves outside the checkout from the committed repository UUID.
- [x] SQLite persists a mission and matching `MISSION_OPENED` event atomically.
- [x] `mnfs status` recovers the same mission from a fresh CLI process.
- [x] implementation, tests and tracking files are published in draft PR #4.
- [x] `mnfs doctor`, verification and walking-skeleton commands pass in the operator Ubuntu WSL2 environment — [issue #1](https://github.com/developmentconexus-ops/mnfs/issues/1).
- [ ] commit `package-lock.json` and prove `npm ci && npm run verify` from a brand-new clone — [issue #2](https://github.com/developmentconexus-ops/mnfs/issues/2).

## M1 definition of done

- [ ] mission plan content is validated and content-addressed.
- [ ] revisions are append-only, idempotent and stale-write protected.
- [ ] plan HTML is deterministic, escaped and hash-bound.
- [ ] Lavish opens and polls through a narrow process adapter.
- [ ] Pi discovers the project-local `mnfs-plan` skill.
- [ ] operator feedback changes structured source and produces a new hash.
- [ ] approval requires the exact current hash and no open blocking question.
- [ ] approved plan is materialized under `.mnfs/missions/<id>/plan.json`.
- [ ] a fresh process recovers the approved plan.

## Immediate next action

Implement **Task 1 — canonical plan content and validation** using TDD. Do not begin Treehouse, Herdr, workers or parallelism.
