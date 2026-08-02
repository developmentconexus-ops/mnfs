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
- The accepted `MIS-002` revision 3 was committed with hash `sha256:f95ffded37af764e5f76775ec6bbdda69d5638246609451ce37bf524908cf8c1`.
- The pilot exposed two integration defects:
  - each revision used a different HTML path, so Lavish opened a new session/tab and lost conversation continuity;
  - the dependency panel displayed raw Mermaid source because no Mermaid runtime was loaded.

## 2026-08-01

### M1.9 fixes — stable review path and static SVG

- Confirmed that Lavish session identity is the canonical HTML file path and that live reload preserves conversation only when the path remains stable.
- Added one stable `artifacts/plans/<mission-id>/review.html` path while preserving revision-specific `rev-<NNNN>.html` snapshots.
- Changed `plan open` and `plan poll` to use `review.html`; the Pi skill now opens once, renders later revisions and continues polling the same session.
- Replaced raw Mermaid source with deterministic inline SVG generated directly from the validated milestone/feature dependency DAG.
- Added topological columns, distinct milestone/feature nodes, arrows, escaped titles and accessible SVG metadata without adding a package, CDN or browser runtime.
- Added tests for stable review/snapshot paths, open-once skill behavior, SVG nodes/edges, escaping, deterministic output and absence of raw Mermaid markup.

### M1 final acceptance

- Operator confirmed the corrected canonical `npm run verify` gate green.
- Corrected browser retest preserved one Lavish tab and conversation history across revisions.
- Revision updates used `plan render` and continued polling the stable `review.html` session rather than reopening.
- Dependency graph rendered as deterministic inline SVG and updated through live reload.
- Exact-hash approval and fresh-process recovery remained green after the fixes.
- Issue #3 was closed as completed.
- PR #5 was moved out of draft and marked ready for final review and integration.
- M2 implementation remains unstarted; the approved contract is `.mnfs/missions/MIS-002/plan.json`.

## 2026-08-02

### Architecture Baseline integration

- PR #11, `docs: establish MNFS architecture baseline`, was reviewed adversarially and merged into `main` at `f28cf2b58b7f1682450399c6edb50c983fff0cc2`.
- Published the 13-section Product Blueprint, MCRM, Capability Roadmap, ADR-0004 through ADR-0012, CAP-EXECUTION, research manifests and documentation governance/tooling.
- Kept Issue #6 open because M2 remains explicitly blocked.
- Selected Issue #7 as the next bounded enabler before AS-02 and the `MIS-002` Replan.

### Issue #7 — Mission Plan Contract schema v2

- Created branch `feat/plan-schema-v2` and draft PR #12 from the accepted Architecture Baseline commit.
- Replaced the monolithic plan type with a discriminated schema v1/v2 domain while preserving the historical v1 reader and canonical hash algorithm.
- Added mandatory Mission, Milestone and Feature Acceptance Criteria with structured verification method, verifier, proof type and proof owner.
- Added derived qualified identities for Milestones, Features and all criterion levels; v2 dependency references are fully qualified and same-level.
- Added Product Milestone, Capability Spec and requirement references with hierarchical allocation validation.
- Added reference-only Environment/Security Policy binding, optional exact policy hash, documentation impact and requirements impact.
- Added strict unknown-field, downgrade, cross-level reference, duplicate, cycle and historical-rewind rejection.
- Added SQLite migration v3 so multiple approved revisions remain immutable historical records; materialization selects the latest approved revision while a draft Replan leaves the previous approval authoritative.
- Preserved existing v1 drafts, blocked approved-v1 rewrites and implemented the exact-hash v1-to-v2 Replan path.
- Expanded Lavish to render and escape every deciding v2 field and qualified dependency node/edge without changing exact-hash approval controls.
- Updated the project-local Pi skill and schema reference so new plans/Replans use v2 and accepted v1 history is never rewritten.
- Added microdesign, implementation plan and automated acceptance evidence.
- Adversarial review strengthened proof for approved-v2 fresh-process recovery, malformed requirement IDs, duplicate local IDs and Security Policy hashes.
- Canonical GitHub Actions proof on Ubuntu 24.04 and Node.js 24.18.0 passed:
  - TypeScript typecheck green;
  - 94 tests passed, 0 failed;
  - documentation tooling tests green;
  - documentation validation green with 62 canonical IDs.
- Automated tests verify `.mnfs/missions/MIS-002/plan.json` remains revision 3 with Git blob SHA `6b79117fe66cd5c9c8142099828812f470ce20de` and content hash `sha256:f95ffded37af764e5f76775ec6bbdda69d5638246609451ce37bf524908cf8c1`.
- M2 remains blocked. Next sequence is Issue #8 AS-02, Issue #9 Replan, exact-hash Operator approval, mechanical R0–R4 recalculation and explicit unblock.
