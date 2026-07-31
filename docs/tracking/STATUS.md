# Project status

- **Program:** Pi-first MNFS
- **Canonical environment:** Ubuntu on WSL2
- **Active milestone:** M0 — Foundation walking skeleton
- **Active plan:** `docs/superpowers/plans/2026-07-31-m0-foundation-walking-skeleton.md`
- **Current state:** implementation and GitHub publication complete; WSL2 acceptance and clean-clone reproducibility remain
- **Repository:** https://github.com/developmentconexus-ops/mnfs
- **Draft PR:** https://github.com/developmentconexus-ops/mnfs/pull/4
- **Tooling status:** Pi is required by the environment contract; Lavish, Treehouse and Herdr are detected but their adapters intentionally begin in M1/M2; see `docs/tooling-adoption.md`

## Current objective

Complete the two external M0 acceptance gates, then begin the visual Pi + Lavish planning loop.

## Definition of done for M0

- [x] `mnfs doctor` reports required and optional WSL2 tools.
- [x] repository service creates a stable, idempotent identity.
- [x] runtime root resolves outside the checkout from the committed repository UUID.
- [x] SQLite persists a mission and matching `MISSION_OPENED` event atomically.
- [x] `mnfs status` recovers the same mission from a fresh CLI process.
- [x] implementation, tests and tracking files are published in draft PR #4.
- [x] remaining M0 and M1 work is represented by GitHub issues.
- [ ] `mnfs doctor` and the walking-skeleton commands pass in the operator's Ubuntu WSL2 environment with Node 24.18+ and Pi installed — [issue #1](https://github.com/developmentconexus-ops/mnfs/issues/1).
- [ ] a clean WSL2 clone reproduces dependencies with `npm ci` from a committed lockfile and passes `npm run verify` — [issue #2](https://github.com/developmentconexus-ops/mnfs/issues/2).

## Next milestone

M1 visual mission planning is tracked in [issue #3](https://github.com/developmentconexus-ops/mnfs/issues/3).
