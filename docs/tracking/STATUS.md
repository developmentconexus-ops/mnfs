# Project status

- **Program:** Pi-first MNFS
- **Canonical environment:** Ubuntu on WSL2
- **Completed milestone:** M0 — Foundation walking skeleton, merged through [PR #4](https://github.com/developmentconexus-ops/mnfs/pull/4)
- **Active milestone:** M1 — Visual mission planning
- **Active design:** `docs/design/2026-08-01-m1.9-review-continuity-svg-design.md`
- **Active plan:** `docs/superpowers/plans/2026-08-01-m1.9-review-continuity-svg.md`
- **Active branch:** `feat/m1-visual-planning`
- **Current state:** M1.1–M1.8 are accepted. The real M1.9 pilot approved `MIS-002` and proved Pi, Lavish feedback, revision/hash approval and fresh-process recovery, but exposed two visual integration defects. Stable `review.html` continuity and deterministic inline SVG fixes are committed; canonical verification and a short browser retest are the final gates.
- **Repository:** https://github.com/developmentconexus-ops/mnfs
- **M1 draft PR:** https://github.com/developmentconexus-ops/mnfs/pull/5
- **M1 issue:** https://github.com/developmentconexus-ops/mnfs/issues/3
- **Tooling:** Pi is the reasoning runtime; Lavish is browser review/feedback; Treehouse and Herdr remain deferred to M2

## Current objective

Finish M1 without carrying pilot defects forward:

```text
stable review.html session → live reload across revisions → conversation preserved
+ deterministic inline SVG dependency graph → exact-hash approval → recovery
```

## M1 accepted evidence

- [x] mission plan content is validated and content-addressed.
- [x] revisions are append-only, idempotent and stale-write protected.
- [x] blocking product questions prevent approval.
- [x] approved contracts materialize under `.mnfs/missions/<id>/plan.json` and can be repaired from SQLite.
- [x] all planning operations have strict human/JSON CLI contracts.
- [x] Pi discovers and follows `/skill:mnfs-plan`.
- [x] automated independent-process lifecycle proof is green.
- [x] real operator feedback produced newer revisions and hashes.
- [x] `MIS-002` revision 3 was approved by exact hash and committed.
- [x] a fresh process recovered the approved revision and matching contract hash.

## M1.9 defects found by real use

### Review continuity

- Root cause: Lavish keys sessions by canonical HTML path, while MNFS opened `rev-0001.html`, `rev-0002.html`, etc.
- Fix: every mission now has stable `review.html` plus immutable `rev-<NNNN>.html` snapshots.
- `plan open` and `plan poll` use `review.html`; later revisions run `plan render` and continue polling instead of reopening.

### Dependency graph

- Root cause: MNFS emitted raw `<pre class="mermaid">` without a Mermaid runtime.
- Fix: MNFS generates deterministic inline SVG directly from the validated dependency DAG, with no CDN, browser library or new package.

## Verification evidence

- M1.1–M1.8 canonical WSL2/Pi gates: operator-confirmed green.
- M1.9 original browser pilot: core flow green; conversation continuity and graph rendering failed and were reproduced.
- New automated tests cover stable review/snapshot paths, Pi open-once behavior, SVG nodes/edges, escaping, deterministic output and removal of raw Mermaid source.
- Pending: `npm run verify` on the corrected branch and one short browser retest.

## Immediate next action

Pull `feat/m1-visual-planning`, run `npm run verify`, then follow the shortened retest in `docs/acceptance/2026-07-31-m1.9-pi-lavish-pilot.md`. M1 closes only after the same Lavish tab retains history across a new revision and displays the dependency graph as SVG.
