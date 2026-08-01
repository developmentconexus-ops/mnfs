# Project status

- **Program:** Pi-first MNFS
- **Canonical environment:** Ubuntu on WSL2; Windows remains the browser, terminal and desktop host
- **Completed milestones:**
  - M0 — Foundation walking skeleton, merged through [PR #4](https://github.com/developmentconexus-ops/mnfs/pull/4)
  - M1 — Visual mission planning, accepted through the real Pi + Lavish pilot and corrected browser retest
- **Current integration:** [PR #5](https://github.com/developmentconexus-ops/mnfs/pull/5) is ready for final review and merge into `main`
- **Next milestone:** M2 — One worker
- **Approved M2 contract:** `.mnfs/missions/MIS-002/plan.json`
- **Active branch:** `feat/m1-visual-planning`
- **Repository:** https://github.com/developmentconexus-ops/mnfs
- **M1 issue:** [#3](https://github.com/developmentconexus-ops/mnfs/issues/3), closed as completed
- **Tooling:** Pi is the agent runtime; Lavish is the accepted browser planning surface; Treehouse enters in M2; Herdr remains optional presentation

## Product direction

MNFS is a planning-first development harness. It turns an operator objective into a structured, revisioned and explicitly approved contract, then will execute that contract through isolated AI workers with durable evidence, risk-adaptive review, integration and live QA.

```text
operator intent
→ structured mission plan
→ browser review and exact-hash approval
→ isolated write tracks
→ durable CLAIM and verification
→ controlled integration
→ user-level QA
```

## Accepted M0 evidence

- [x] WSL2 environment contract and `doctor` command.
- [x] stable repository identity under `.mnfs/`.
- [x] operational runtime outside individual worktrees.
- [x] SQLite mission and event persistence.
- [x] fresh-process mission recovery.

## Accepted M1 evidence

- [x] mission plans are validated, normalized and content-addressed.
- [x] revisions are append-only, idempotent and stale-write protected.
- [x] blocking product questions prevent approval.
- [x] every planning operation has strict human and `--json` CLI output.
- [x] Pi discovers and follows `/skill:mnfs-plan`.
- [x] Lavish opens in the Windows browser while MNFS remains in WSL2.
- [x] operator feedback produces newer revisions using the exact previous hash.
- [x] approval is bound to the exact current hash.
- [x] approved contracts materialize under `.mnfs/missions/<id>/plan.json` and can be repaired from SQLite.
- [x] a fresh process recovers the approved revision and matching contract hash.
- [x] one stable `review.html` preserves the Lavish tab and conversation across revisions.
- [x] dependency graphs render as deterministic inline SVG rather than raw Mermaid source.
- [x] the real pilot approved and committed the M2 contract as `MIS-002`.

## Current boundary

M2 has **not** started. The following remain intentionally absent until its microdesign is approved:

- Pi worker process adapter;
- Treehouse lease adapter;
- durable CLAIM lifecycle;
- lead restart recovery for workers;
- Herdr presentation adapter;
- worker integration or parallelism.

## Immediate next action

1. Perform final review of PR #5.
2. Merge M1 into `main` after operator authorization.
3. Re-read the approved `MIS-002` contract.
4. Conduct the M2 microdesign section by section before implementation.
