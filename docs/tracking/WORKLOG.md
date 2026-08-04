---
id: TRACKING-WORKLOG
title: MNFS Worklog
document_type: tracking_document
form: explanation
authority: tracking
status: current
owners:
  - developmentconexus-ops
---

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
- Operator confirmed the canonical WSL2 full suite green with the M1.8 walking skeleton included.

### M1.9 — Real Pi + Lavish browser pilot

- Added `docs/acceptance/2026-07-31-m1.9-pi-lavish-pilot.md` as the exact dogfood protocol.
- The pilot planned the smallest M2 one-worker slice: Pi worker, leased Treehouse worktree, durable CLAIM and lead restart recovery, with Herdr explicitly optional.
- Pi, Lavish feedback, multiple structured revisions, exact-hash approval and fresh-process recovery succeeded.
- The accepted `MIS-002` revision 3 was committed with hash `sha256:f95ffded37af764e5f76775ec6bbdda69d563824908cf8c1`.
- The pilot exposed two integration defects: revision-specific HTML paths lost Lavish continuity, and raw Mermaid source rendered without a runtime.

## 2026-08-01

### M1.9 fixes and final acceptance

- Added stable `artifacts/plans/<mission-id>/review.html` while preserving immutable revision snapshots.
- Changed planning open/poll to one stable Lavish session with live reload.
- Replaced Mermaid source with deterministic inline SVG generated from the validated dependency DAG.
- Operator confirmed the canonical suite and browser retest; Issue #3 completed.
- Exact-hash approval and fresh-process recovery remained green.

## 2026-08-02

### Architecture Baseline integration

- PR #11 was reviewed and merged into `main` at `f28cf2b58b7f1682450399c6edb50c983fff0cc2`.
- Published the Product Blueprint, MCRM, Capability Roadmap, ADR-0004–ADR-0012, CAP-EXECUTION, research manifests and documentation governance.
- Kept M2 blocked and selected Plan Contract schema v2 and AS-02 as prerequisites.

### Mission Plan Contract schema v2

- Added hierarchical Mission/Milestone/Feature criteria and qualified identities.
- Preserved approved v1 history and implemented exact-hash v1-to-v2 Replan.
- Added migration v3, strict validation, full Lavish rendering and Pi skill updates.
- Canonical CI passed 94 tests and documentation validation with 62 canonical IDs.

## 2026-08-03

### M2 readiness, Capability and contract

- Integrated accepted AS-02 Evidence into CAP-EXECUTION.
- Operator accepted CAP-EXECUTION version 0.1.0 for R3 while implementation remained planned.
- Operator exact-hash approved MIS-002 revision 5 at `sha256:d82252504044cab40e00013dc30534654382887b7819d60a916d2a9a56db4cc3`.
- All 28 requirements were allocated to exact criteria; R0–R4 mechanically passed.
- Operator supplied the M2 unblock decision for R5 microdesign only.
- M01 implementation and Pi dispatch remained prohibited.

### PR #14 integration and M01 R5 package

- PR #14 was merged into `main` at `dee12a9b53984d39045421c9586ee53665ebc5e5`.
- Opened Issue #16, branch `design/mis-002-m01` and draft PR #17.
- Published M01 research, source manifest, TC-01 protocol and proposed microdesign 0.3.0.
- Self-review corrected Claim/release composition, empty-Track disposition, current-Track exclusivity, sequences and Claim result ownership.

### M01 package approval and TC-01 plan

- Operator approved the design package for TC-01 planning while microdesign remained proposed.
- TC-01 protocol became accepted version 0.2.0.
- Wrote and reviewed TC-01 implementation/WSL2 plan version 1.0.3.
- M01 production implementation and Pi dispatch remained prohibited.

## 2026-08-04

### TC-01 Tasks 1–11 — deterministic harness

- Implemented the deterministic TC-01 harness task-by-task with observed RED/GREEN cycles.
- Added shell-free bounded processes, Linux-owned fixtures, exact provenance, trusted Git observation, strict Treehouse JSON client, crash-durable Evidence, S01–S15 orchestration, Verdict/report and fail-closed cleanup.
- Task 11 ended with 95 product tests, 119 AS-02 tests and 60 TC-01 tests green.
- No installed Treehouse binary was invoked.

### TC-01 Task 12 — complete adversarial review

- Reviewed the harness against Blueprint, Roadmap, MCRM, ADR-0005, protocol, microdesign, pinned Treehouse source and primary platform documentation.
- Corrected descendant processes surviving timeout, stale executable cleanup, missing S01 BLOCKED Evidence, weak source baseline, path escape, unsafe TOML, non-fatal UTF-8, inherited host environment, incorrect S13 private-state window and non-durable publication.
- Published `ACCEPTANCE-TC-01-TASK-12-DETERMINISTIC-ADVERSARIAL-REVIEW`.
- Final pre-WSL2 proof passed product 95/95, AS-02 119/119 and TC-01 75/75.

### TC-01 Task 13 — real canonical WSL2 conformance

- Operator executed canonical TC-01 on Ubuntu 26.04 WSL2 with Node `v24.18.0`, npm `12.0.2`, Git `2.53.0` and Treehouse raw version `v2.1.1` at `/usr/local/bin/treehouse`.
- Strict version presentation was corrected through RED 75/1 and GREEN 76/76 while exact executable bytes remained hash-bound.
- Run `tc01-20260804-144054-4315b6f2` produced `ACCEPT`; S01–S15 all passed with no limitation.
- Fresh-process report revalidated manifest/artifact hashes and reproduced `ACCEPT`.
- First cleanup failed closed without deleting anything; diagnosis exposed property-order-sensitive snapshot equality despite identical Git/filesystem hashes.
- Canonical snapshot comparison was corrected through RED 76/1 and GREEN 77/77.
- JSON errors were hardened to expose allowlisted blockers through RED 77/1 and GREEN 78/78.
- Second cleanup returned `COMPLETED`, removed only registered ephemeral fixture resources and preserved all finalized Evidence.
- Published `ACCEPTANCE-TC-01-TREEHOUSE-PRODUCTION-ADAPTER` and reconciled microdesign 0.4.0.

### Task 14 — final constructive and adversarial R5 review

- Operator explicitly authorized the final R5 design review.
- Mapped all seven M01-owned requirements to exact contract criteria, state, service boundaries, typed failure and verification routes.
- Constructive coverage completed for `CAP-EXEC-REQ-001`, `002`, `004`, `005`, `006`, `007` and `008`; no orphan and no M02 requirement pulled into implementation scope.
- The adversarial pass found three Critical issues before implementation planning:
  - canonical checkout with `origin` escaped the no-origin TC-01 boundary;
  - inherited Treehouse HOME/XDG config could execute unreviewed hooks;
  - durable REQUESTED intent did not prevent duplicate `get` when callers raced or a Lead died while its child survived.
- Version 0.6.1 closes those findings with an Attempt-owned independent execution source, controlled HOME/config/hooks and a trusted LeaseActionRunner that records STARTED before one external invocation.
- The review found and closed eight Important issues:
  - contract hash without exact entity ancestry;
  - mutable Event payload-version interpretation;
  - incomplete migration/downgrade mechanism and WAL-safe backup;
  - under-specified Git commit/tree identity and observational `write-tree` use;
  - grant/release/Claim idempotency without unique input binding;
  - first-match Reconcile under duplicate external identity;
  - read-only Recovery contradicted by a generic observation Event;
  - local Git clones could share canonical objects through hardlinks or alternates.
- Migration v4 now requires a maintenance gate, consistent `node:sqlite backup()`, backup verification, generalized SQLite table rebuild, payload-versioned Events, foreign-key/integrity checks and a concrete pre-v4 write fence.
- Composite foreign keys now prove exact Track → Attempt → Run/Lease → Claim ancestry and exact Attempt base commit.
- Grant and release now persist separate unique idempotency keys/input hashes and action-helper Evidence.
- Inconclusive STARTED acquisition is preserved and blocked; it never automatically invokes a second `treehouse get`.
- Plain Recovery now produces a content-addressed report and performs no domain mutation or generic observation Event.
- Published `REVIEW-MIS-002-M01-R5-FINAL` with recommendation `APROVÁVEL`, 3/3 Critical closed, 8/8 Important closed and no Replan requirement.
- Reconciled Documentation Map and STATUS to microdesign version 0.6.1 and the exact Operator decision gate.
- R5 remains `IN_PROGRESS`; M01 implementation, Pi dispatch and automatic merge remain prohibited.
