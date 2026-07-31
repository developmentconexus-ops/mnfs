# Worklog

## 2026-07-31

### M0 foundation

- Accepted the Pi-first, WSL2-first direction.
- Created the clean MNFS repository baseline with ADRs, roadmap, backlog and the M0 implementation plan.
- Completed M0 Task 1: environment doctor and CLI report contract.
- Completed M0 Task 2: stable repository UUID, atomic identity creation and one runtime root shared by worktrees.
- Completed M0 Task 3: SQLite migration v1, WAL/foreign-key setup, atomic mission+event transaction, rollback coverage and restart persistence.
- Completed M0 Task 4: sequential mission IDs and a stable project status view.
- Completed M0 Task 5: `init`, `mission open` and `status` CLI paths with stable errors and a fresh-process subprocess proof.
- Published `main` and `feat/m0-foundation` to https://github.com/developmentconexus-ops/mnfs.
- Opened draft PR #4 and issues #1–#3.
- Operator confirmed the complete Ubuntu WSL2 acceptance sequence passed: Pi/Node setup, `npm run verify`, `mnfs doctor`, initialization, mission creation and fresh-process status recovery.
- Generated and committed `package-lock.json`; operator confirmed a clean clone completed `npm ci && npm run verify` successfully.
- Closed issues #1 and #2 as completed.
- Marked PR #4 ready and merged M0 into `main` at commit `e26214111ca6e6245a7f8c89f95391be71bf828b`.

### M1 visual mission planning

- Created branch `feat/m1-visual-planning` and draft PR #5.
- Defined the M1 authority split: MNFS owns structured state and approval; Pi reasons; Lavish transports visual feedback; HTML is projection only.
- Chose a project-local Pi skill for M1 instead of introducing a Pi SDK host or extension prematurely.
- Committed the M1 microdesign and TDD implementation plan.
- Completed M1.1 with mission-plan types, runtime validation, dependency reference/cycle checks, canonical JSON and SHA-256 content hashing.
- Added six domain tests covering valid normalization, deterministic hashing, duplicate IDs, unknown dependencies, cycles and answered-question invariants.
- Operator confirmed the full M1 branch verification was green after dependency-lock alignment.
- Retargeted PR #5 from the stacked M0 branch to `main` after M0 acceptance.
- Implemented M1.2 SQLite migration v2 with content-addressed plan revisions and widened mission event types.
- Added transactional revision save, sequential revision numbers, previous-draft supersession, identical-content idempotency and optimistic stale-hash protection.
- Added exact-hash approval with one approved revision per mission and idempotent repeated approval.
- Added six persistence tests for v1 migration preservation, revision+event atomicity, sequential revisions, stale-write rejection, rollback and approval idempotency.
- Verified the combined M1 domain/store slice in a strict focused harness: 16 tests passed, 0 failed, including the original SQLite foundation behavior.
- Operator confirmed the canonical WSL2 full-suite verification of M1.2 was green.
- Implemented M1.3 `MissionPlanService`: untrusted JSON file ingestion, runtime validation, stale-hash propagation, current-plan lookup and exact-hash approval.
- Added `PLAN_BLOCKED` for unresolved blocking product questions and `PLAN_MATERIALIZATION_FAILED` for repairable publication failures.
- Added atomic approved-contract publication at `.mnfs/missions/<mission-id>/plan.json` using same-directory temp file, file fsync and rename.
- Preserved approved SQLite state when materialization fails, allowing explicit rematerialization from durable state.
- Added eight lifecycle service tests for normalization, invalid JSON, stale writes, blocked approval, exact-hash materialization, failure recovery, rematerialization and draft refusal.
- A new adversarial test exposed two cleanup-boundary defects: directory creation occurred outside the named-error boundary, and best-effort cleanup could replace the original error. Both root causes were corrected before publication.
- Verified the combined M1.3 focused slice: 22 relevant domain/store/service tests passed, 0 failed.
- Operator confirmed the canonical WSL2 full-suite verification of M1.3 was green.
- Implemented M1.4 deterministic self-contained HTML rendering for outcomes, scope, milestones, features, risks, questions and dependency source.
- Escaped all semantic plan text and kept the artifact free of external assets, random values and timestamps so repeated rendering is byte-identical.
- Bound Lavish approval and change-request controls to literal mission/hash prompts stored in auditable `data-*` attributes; HTML remains projection and never mutates structured source.
- Added runtime artifact publication at `artifacts/plans/<mission-id>/rev-<NNNN>.html` through `MissionPlanService.renderCurrentPlan`.
- The first TDD pass exposed that dynamically assembled review prompts were not directly auditable in the saved artifact. The renderer now stores exact prompts in attributes and the script reads those values.
- Verified the focused M1.4 slice: 6 renderer/service tests passed, 0 failed.
- Canonical WSL2 full-suite verification of M1.4 is the gate before M1.5.
