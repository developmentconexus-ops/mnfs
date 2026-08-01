# Project status

- **Program:** Pi-first MNFS
- **Canonical environment:** Ubuntu on WSL2
- **Completed milestone:** M0 — Foundation walking skeleton, merged through [PR #4](https://github.com/developmentconexus-ops/mnfs/pull/4)
- **Active milestone:** M1 — Visual mission planning
- **Active design:** `docs/design/2026-07-31-m1-visual-mission-planning.md`
- **Active plan:** `docs/superpowers/plans/2026-07-31-m1-visual-mission-planning.md`
- **Active acceptance:** `docs/acceptance/2026-07-31-m1.9-pi-lavish-pilot.md`
- **Active branch:** `feat/m1-visual-planning`
- **Current state:** M1.1–M1.8 are accepted in the canonical WSL2/Pi environment; M1.9 real Pi + Lavish browser acceptance is the final gate
- **Repository:** https://github.com/developmentconexus-ops/mnfs
- **M1 draft PR:** https://github.com/developmentconexus-ops/mnfs/pull/5
- **M1 issue:** https://github.com/developmentconexus-ops/mnfs/issues/3
- **Tooling:** Pi is the reasoning runtime; Lavish is the browser review adapter; Treehouse and Herdr remain deferred to M2

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
- [x] `mnfs doctor`, verification and walking-skeleton commands pass in the operator Ubuntu WSL2 environment — [issue #1](https://github.com/developmentconexus-ops/mnfs/issues/1).
- [x] committed `package-lock.json` reproduces `npm ci && npm run verify` from a clean clone — [issue #2](https://github.com/developmentconexus-ops/mnfs/issues/2).
- [x] M0 merged to `main` through PR #4.

## M1 definition of done

- [x] mission plan content is validated and content-addressed.
- [x] revisions are append-only, idempotent and stale-write protected.
- [x] plan service validates untrusted JSON and blocks approval on open blocking questions.
- [x] approved contract is materialized atomically under `.mnfs/missions/<id>/plan.json` and can be repaired from SQLite.
- [x] plan HTML is deterministic, escaped, responsive and hash-bound.
- [x] Lavish opens, polls and ends through a narrow process adapter.
- [x] all planning operations are available through strict human/JSON CLI contracts.
- [x] Pi discovers and follows the project-local `mnfs-plan` skill.
- [x] independent CLI processes recover revisions, approval and a rematerialized contract.
- [ ] real operator feedback changes structured source and produces a new hash in Lavish.
- [ ] real exact-hash browser approval materializes and versions the accepted contract.

## Verification evidence

- M0 real WSL2 acceptance and clean-clone reproduction: operator-confirmed complete.
- M1.1 canonical branch verification: green.
- M1.2 canonical branch verification: green.
- M1.3 canonical branch verification: green.
- M1.4 canonical branch verification: green after strict `noUncheckedIndexedAccess` fixture narrowing.
- M1.5 canonical branch verification: green.
- M1.6 canonical branch verification: operator-confirmed green.
- M1.7 canonical full suite and real `/skill:mnfs-plan` discovery: operator-confirmed green.
- M1.8 canonical full suite: operator-confirmed green.
- M1.8 automated proof covers independent-process recovery, deterministic rendering, revision supersession, stale-write rejection, wrong-hash rejection, blocking questions, exact-hash approval and contract rematerialization.

## Immediate next action

Run the exact **M1.9 real Pi + Lavish browser pilot** in `docs/acceptance/2026-07-31-m1.9-pi-lavish-pilot.md`. The dogfood mission plans the smallest M2 one-worker slice; do not begin implementation during the pilot.
