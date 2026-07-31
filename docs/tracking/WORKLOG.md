# Worklog

## 2026-07-31

### M0 — Pi-first foundation

- Accepted Ubuntu on WSL2 as the canonical runtime, with Windows as browser/desktop host.
- Created the TypeScript CLI baseline, repository identity, runtime paths and SQLite store.
- Implemented `doctor`, `init`, `mission open` and `status` with fresh-process recovery.
- Added WAL/foreign keys, atomic mission + event persistence and rollback coverage.
- Published the repository, opened issues #1–#3 and PR #4.
- Operator confirmed the real WSL2 smoke, committed lockfile and clean-clone `npm ci && npm run verify` proof.
- Closed issues #1 and #2 and merged PR #4 into `main` at `e26214111ca6e6245a7f8c89f95391be71bf828b`.

### M1.0 — Visual planning design

- Created `feat/m1-visual-planning`, issue #3 and draft PR #5.
- Fixed the authority split: MNFS owns structured state and approval; Pi reasons; Lavish transports visual feedback; HTML is projection only.
- Chose a project-local Pi skill before any Pi SDK host or extension.
- Committed the M1 microdesign and TDD implementation plan.

### M1.1 — Plan domain and hashing

- Added mission-plan types, validation, ID uniqueness, dependency reference/cycle checks and question invariants.
- Added deterministic canonical JSON and SHA-256 content hashing.
- Added six domain tests; operator confirmed the canonical WSL2 full suite green.

### M1.2 — SQLite revisions and approval

- Added migration v2 with append-only content-addressed plan revisions and widened event types.
- Added sequential revisions, draft supersession, identical-content idempotency and stale-hash protection inside `BEGIN IMMEDIATE`.
- Added exact-current-hash approval and one approved revision per mission.
- Added six persistence tests, including migration preservation, atomicity, rollback and approval idempotency.
- Focused proof: 16 relevant tests green; operator confirmed the canonical WSL2 full suite green.

### M1.3 — Lifecycle service and approved contract

- Added untrusted JSON ingestion, validation, stale-hash propagation and current-plan lookup.
- Added `PLAN_BLOCKED` for open blocking questions and exact-hash approval.
- Added atomic `.mnfs/missions/<id>/plan.json` publication and repair from durable SQLite state.
- Adversarial tests exposed and corrected two publication cleanup-boundary defects.
- Added eight service tests; focused proof: 22 relevant tests green; operator confirmed the canonical WSL2 full suite green.

### M1.4 — Deterministic HTML renderer

- Added self-contained rendering for mission identity, outcomes, scope, milestones, features, risks, questions and dependencies.
- Escaped semantic content and removed external assets, random values and render-time timestamps.
- Bound approval/change controls to literal mission/hash prompts in auditable attributes.
- Added runtime publication at `artifacts/plans/<mission-id>/rev-<NNNN>.html`.
- Focused proof: six renderer/service tests green.
- The canonical WSL2 run found a strict `noUncheckedIndexedAccess` fixture error; corrected it by explicit narrowing rather than an empty-string fallback.
- Operator confirmed the corrected canonical WSL2 full suite green.

### M1.5 — Lavish process adapter

- Added narrow open, poll and end operations around the public `lavish-axi` CLI.
- Commands use argument arrays and `shell: false`; no share or host-binding option is emitted.
- Stdout remains byte-preserved opaque feedback for Pi; stderr and signals become named evidence on failure.
- Added injected runner and `AbortSignal` support without introducing MNFS state transitions.
- Added `LAVISH_NOT_FOUND` and `LAVISH_COMMAND_FAILED`, including install remediation.
- Proved RED for the missing adapter and separately for the production process runner.
- Focused proof: six adapter tests green, including a real child-process stdout/stderr capture.
- Operator confirmed the canonical WSL2 full suite green.

### M1.6 — Planning CLI

- Added strict parser contracts for `plan save`, `show`, `render`, `open`, `poll`, `approve` and `materialize`.
- Plan content continues to travel through files; optional `expectedPreviousHash` is preserved without long inline JSON.
- Added synchronous/asynchronous dependency boundaries so the CLI remains testable while real Lavish polling stays asynchronous.
- Wired the production entry to `MissionPlanService`, runtime artifact paths and the Lavish open/poll adapter, closing SQLite only after asynchronous work completes.
- Added stable JSON output for every command and human output with a concrete next action.
- Added tests for every command, missing/duplicate/unknown flags, asynchronous wiring, exact hash visibility and stable MNFS error codes.
- Proved RED against the pre-M1.6 CLI: all planning commands were rejected as unknown.
- Focused green proof: four parser/dispatch tests passed, 0 failed; production entry wiring compiled in a strict compatibility harness.
- Operator confirmed the canonical WSL2 full suite green and authorized continuation.

### M1.7 — Project-local Pi planning skill

- Confirmed the current Pi Agent Skills contract: project skills are discovered recursively under `.pi/skills/`, the directory name must match frontmatter `name`, and the skill is invoked as `/skill:mnfs-plan`.
- Added `.pi/skills/mnfs-plan/SKILL.md` with bounded progressive-disclosure instructions.
- Added `references/plan-schema.md` with the complete JSON shape, ID rules, dependency invariants, question states and planning boundary.
- The skill resolves the mission, reads current state, creates full JSON revisions, uses the exact previous hash, opens/polls Lavish, refuses self-approval and stops when the operator ends review.
- Approval is permitted only after the exact feedback token `MNFS_APPROVE_PLAN mission=<mission-id> hash=<current-hash>` and a fresh `plan show` check.
- The skill forbids editing rendered HTML, writing SQLite or approved contracts directly, inventing product decisions and starting implementation workers.
- TDD RED: static tests failed because the project-local skill and reference did not exist.
- Focused GREEN: 8 tests passed, 0 failed; three new skill tests cover frontmatter/discovery, workflow markers, approval and stop constraints, instruction size and schema invariants.
- Operator confirmed the canonical WSL2 full suite and real Pi `/skill:mnfs-plan` discovery.

### M1.8 — Automated visual-planning walking skeleton

- Added one real-subprocess test that uses the compiled CLI across independent processes rather than mocked services.
- The test initializes a temporary Git repository, opens two missions, saves revision 1, recovers and renders it in another process, then saves revision 2 with the exact previous hash.
- It proves stale revision rejection, wrong-hash approval rejection and blocking-question approval rejection without changing current state.
- It approves revision 2 by its exact hash, recovers the approved plan in a fresh process, deletes the contract deliberately and rematerializes it from durable SQLite state.
- Lavish/browser behavior remains outside the automated test and is reserved for the real M1.9 acceptance, keeping CI deterministic.
