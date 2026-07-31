# Project status

- **Program:** Pi-first MNFS
- **Canonical environment:** Ubuntu on WSL2
- **Active milestone:** M0 — Foundation walking skeleton
- **Active plan:** `docs/superpowers/plans/2026-07-31-m0-foundation-walking-skeleton.md`
- **Current state:** planning complete; implementation not started
- **Repository publication:** blocked until an empty GitHub repository exists or repository-creation permission is available

## Current objective

Create the smallest durable control plane that initializes a repository, opens a mission transactionally and recovers status in a new process.

## Definition of done for M0

- [ ] `mnfs doctor` reports required and optional WSL2 tools.
- [ ] `mnfs init` creates a stable repository identity.
- [ ] runtime state is stored outside the checkout.
- [ ] `mnfs mission open` persists a mission and matching event atomically.
- [ ] `mnfs status` returns the same mission from a fresh process.
- [ ] tests, build and typecheck pass.
- [ ] the repository is published and M0 tracking issues exist on GitHub.
