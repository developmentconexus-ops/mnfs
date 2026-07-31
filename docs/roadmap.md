# MNFS roadmap

## M0 — Foundation walking skeleton

- WSL2 environment contract and doctor command.
- Repository identity committed under `.mnfs/`.
- Runtime home outside worktrees.
- SQLite schema, mission open and status recovery.
- Minimal CLI and tests.

**Proof:** initialize a temporary Git repository, open a mission, terminate the process, run status in a new process and observe the same mission.

## M1 — Visual mission planning

- Mission contract schema.
- Planning service and revision hashes.
- HTML renderer.
- Lavish review loop.

**Proof:** edit a plan in the browser, return structured feedback and freeze an approved revision.

## M2 — One visible worker

- Pi worker process adapter.
- Treehouse lease adapter.
- Claim artifact.
- Optional Herdr presentation adapter.

**Proof:** one worker runs in an isolated worktree, reports a claim and survives lead-session restart.

## M3 — Review and local correction

- Risk classification v1.
- Independent review packet.
- Finding schema.
- Reuse the same worker and worktree for one local correction.

## M4 — Parallel write tracks and integration

- Write-set ownership.
- Two disjoint tracks.
- Serial integration queue.
- Composition verification in a clean workspace.

## M5 — Adaptive gates and live QA

- Static, executable, live and judgment criteria.
- Receipt runner.
- Browser QA for user-facing criteria.
- Anti-loop fingerprint and replan policy.

## M6 — Delivery and calibration

- Optional no-mistakes adapter.
- PR/CI delivery.
- Token, latency and intervention telemetry.
- Policy calibration from local evidence.
