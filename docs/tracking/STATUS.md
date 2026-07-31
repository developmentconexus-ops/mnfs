# Project status

- **Program:** Pi-first MNFS
- **Canonical environment:** Ubuntu on WSL2
- **Completed milestone:** M0 — Foundation walking skeleton, merged through [PR #4](https://github.com/developmentconexus-ops/mnfs/pull/4)
- **Active milestone:** M1 — Visual mission planning
- **Active design:** `docs/design/2026-07-31-m1-visual-mission-planning.md`
- **Active plan:** `docs/superpowers/plans/2026-07-31-m1-visual-mission-planning.md`
- **Active branch:** `feat/m1-visual-planning`
- **Current state:** M1.1–M1.4 are accepted in the canonical WSL2 full suite; M1.5 Lavish open/poll/end adapter is committed with focused proof; full branch verification is the next gate
- **Repository:** https://github.com/developmentconexus-ops/mnfs
- **M1 draft PR:** https://github.com/developmentconexus-ops/mnfs/pull/5
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
- [x] `mnfs doctor`, verification and walking-skeleton commands pass in the operator Ubuntu WSL2 environment — [issue #1](https://github.com/developmentconexus-ops/mnfs/issues/1).
- [x] committed `package-lock.json` reproduces `npm ci && npm run verify` from a clean clone — [issue #2](https://github.com/developmentconexus-ops/mnfs/issues/2).
- [x] M0 merged to `main` through PR #4.

## M1 definition of done

- [x] mission plan content is validated and content-addressed.
- [x] revisions are append-only, idempotent and stale-write protected.
- [x] plan service validates untrusted JSON and blocks approval on open blocking questions.
- [x] approved contract is materialized atomically under `.mnfs/missions/<id>/plan.json` and can be repaired from SQLite.
- [x] plan HTML is deterministic, escaped, responsive and hash-bound.
- [~] Lavish opens, polls and ends through a narrow process adapter — implementation and focused proof committed; canonical full-suite verification pending.
- [ ] Pi discovers the project-local `mnfs-plan` skill.
- [ ] operator feedback changes structured source and produces a new hash.
- [ ] a fresh process recovers the approved plan.

## Verification evidence

- M0 real WSL2 acceptance and clean-clone reproduction: operator-confirmed complete.
- M1.1 canonical branch verification: green.
- M1.2 canonical branch verification: green.
- M1.3 canonical branch verification: green.
- M1.4 canonical branch verification: green after strict `noUncheckedIndexedAccess` fixture narrowing.
- M1.5 focused adapter proof: 6 tests passed, 0 failed.
- M1.5 coverage includes exact safe argument arrays, no share/host invocation, byte-preserved poll output, named missing/non-zero/interrupted errors and a real `spawn` stdout/stderr proof with `shell: false`.
- M1.5 still requires `npm run verify` in the canonical WSL2 checkout before beginning M1.6.

## Immediate next action

Pull `feat/m1-visual-planning` in WSL2 and run `npm ci && npm run verify`. If green, begin **M1.6 — planning CLI commands**.
