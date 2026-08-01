# Backlog

## M0 — Foundation

- [x] M0-001 Bootstrap TypeScript package and verification commands.
- [x] M0-002 Implement environment doctor.
- [x] M0-003 Implement repository identity and runtime paths.
- [x] M0-004 Implement SQLite store and migrations.
- [x] M0-005 Implement mission open and status query.
- [x] M0-006 Implement CLI integration tests.
- [x] M0-007 Publish repository, create GitHub tracking issues and open the draft PR.
- [x] M0-008 Run the WSL2 acceptance smoke with Node 24.18+, Pi and the real CLI — [issue #1](https://github.com/developmentconexus-ops/mnfs/issues/1).
- [x] M0-009 Commit `package-lock.json`, then prove `npm ci && npm run verify` from a clean WSL2 clone — [issue #2](https://github.com/developmentconexus-ops/mnfs/issues/2).
- [x] M0-010 Merge the accepted foundation through [PR #4](https://github.com/developmentconexus-ops/mnfs/pull/4).

## M1 — Visual Planning

- [x] M1-000 Define the visual planning microdesign and implementation plan.
- [x] M1-001 Mission plan domain, validation, canonical JSON and content hash.
- [x] M1-002 SQLite plan revision and approval persistence.
- [x] M1-003 Mission plan service and approved contract materialization.
- [x] M1-004 Deterministic, escaped HTML plan renderer.
- [x] M1-005 Lavish open/poll/end process adapter.
- [x] M1-006 CLI plan commands.
- [x] M1-007 Project-local Pi `mnfs-plan` skill and real Pi discovery.
- [x] M1-008 Automated visual-planning walking skeleton and canonical full-suite verification.
- [x] M1-009A Real Pi + Lavish core pilot, revisions, exact-hash approval, fresh-process recovery and committed `MIS-002` contract.
- [x] M1-009B Preserve one Lavish session across revisions through stable `review.html` and immutable revision snapshots.
- [x] M1-009C Render dependency graphs as deterministic inline SVG.
- [x] M1-009D Corrected same-tab/history/SVG browser retest.
- [x] M1-010 Close [issue #3](https://github.com/developmentconexus-ops/mnfs/issues/3) and mark [PR #5](https://github.com/developmentconexus-ops/mnfs/pull/5) ready for review.
- [ ] M1-011 Merge PR #5 after explicit operator authorization.

## Next — M2 One Worker

The authoritative product contract is `.mnfs/missions/MIS-002/plan.json`. M2 implementation starts only after a new microdesign and implementation plan are approved.

- [ ] M2-000 Reconcile the approved MIS-002 contract with the current codebase and research references.
- [ ] M2-001 Microdesign the Treehouse lease boundary and crash ordering.
- [ ] M2-002 Microdesign the durable CLAIM state machine and SQLite schema.
- [ ] M2-003 Microdesign the Pi worker process protocol and context packet.
- [ ] M2-004 Microdesign lead restart reconciliation and gate acceptance.
- [ ] M2-005 Define the fixed deterministic demo task and complete M2 proof.
- [ ] M2-006 Write and approve the M2 implementation plan.
- [ ] M2-007 Implement incrementally with TDD and WSL2 checkpoints.
- [ ] M2-008 Run the real one-worker/restart acceptance pilot.

## Later

See `docs/roadmap.md` for M3–M6.
