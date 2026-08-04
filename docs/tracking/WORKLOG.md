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

## 2026-08-03

### Issue #9 — M2 readiness reconciliation

- Integrated accepted AS-02 evidence into CAP-EXECUTION without claiming M2 implementation verification.
- Removed the obsolete AS-02 blocker; the approved schema-v2 MIS-002 Replan remains the contract blocker.
- Preserved CAP-EXECUTION as `proposed`; explicit R3 Operator review is still required.
- Clarified M2 Minimal Deterministic Receipt versus generalized Receipt/Evidence capability in M5+.
- Kept M2 blocked pending Capability acceptance, exact-hash Replan approval, R0–R4 recalculation and explicit Operator unblock.

### CAP-EXECUTION R3 acceptance

- Operator supplied exact token `CAP_EXECUTION_ACCEPT version=0.1.0`; CAP-EXECUTION was promoted to `accepted` while implementation remained `planned`.
- Created canonical acceptance evidence `ACCEPTANCE-CAP-EXECUTION-R3`.
- Mechanical readiness now reports R3 `PASS`; R4 remains `BLOCKED` by the missing approved schema-v2 Replan and exact criterion allocations.
- No Worker implementation, dispatch or M2 unblock was authorized.

### MIS-002 revision 5 approval and R4 allocation

- Operator supplied exact approval token for `sha256:d82252504044cab40e00013dc30534654382887b7819d60a916d2a9a56db4cc3` after Lavish and adversarial review.
- Planning service materialized MIS-002 revision 5 as the approved schema-v2 contract; revision 3 remains immutable history.
- Converted all 28 proposed allocations to exact approved criterion identities and removed `BLOCK-MIS-002-REPLAN`.
- Added acceptance evidence `ACCEPTANCE-MIS-002-REPLAN`; R0-R4 must pass mechanically with R5 NOT_STARTED.
- M2 remains blocked pending a separate exact Operator decision; no Worker code, M01 microdesign or dispatch was authorized.

### M2 R5 microdesign unblock

- Operator supplied exact token `MNFS_UNBLOCK_M2 contract=sha256:d82252504044cab40e00013dc30534654382887b7819d60a916d2a9a56db4cc3 gates=R0,R1,R2,R3,R4`.
- Recorded decision D-006 and evidence `ACCEPTANCE-M2-UNBLOCK`.
- Authorized M2 to enter R5 for M01 microdesign only; R5 remains `NOT_STARTED` until that microdesign is written and reviewed.
- M01 implementation and Pi Worker dispatch remain prohibited until a separately approved microdesign exists.
- Material changes to the contract, SEC-E1, Capability, prerequisites or requirements trigger Replan/re-readiness before implementation.

### PR #14 integration and M01 R5 design package

- Reviewed PR #14 against the approved contract, historical revision preservation, exact allocations and canonical CI.
- Marked PR #14 ready and merged it into `main` by squash at `dee12a9b53984d39045421c9586ee53665ebc5e5`.
- Opened Issue #16, branch `design/mis-002-m01` and draft PR #17 dedicated to M01 R5.
- Published the M01 harness-architecture research report and validated source manifest.
- Proposed TC-01 for exact Treehouse production-adapter conformance.
- Proposed M01 microdesign version 0.3.0 with design coverage for all seven M01 requirements.
- Reconciled the Documentation Map from obsolete AB1 blockers to current R5 state.
- Self-review corrected Claim/release composition, empty-Track disposition, current-Track exclusivity, entity sequences and Claim result ownership.
- PR #17 mechanical verification passed with 95 product tests, 119 AS-02 tests and 74 canonical documentation IDs.

### M01 design-package approval and TC-01 plan

- Operator responded `Aprovado` to the explicit PR #17 design-package review gate.
- Added `ACCEPTANCE-M01-R5-DESIGN-PACKAGE-REVIEW`, accepting the research direction and TC-01 protocol for implementation/execution planning while keeping the M01 microdesign proposed.
- Promoted the TC-01 protocol to `accepted` version 0.2.0; no Treehouse conformance claim was made.
- Wrote and self-reviewed the detailed TC-01 implementation and WSL2 execution plan, now version 1.0.3, under `docs/superpowers/plans/2026-08-03-tc-01-treehouse-production-adapter-conformance.md`.
- The plan separates deterministic CI tests from real Treehouse execution and defines TDD tasks, scenario coverage S01-S15, Evidence, cleanup, Verdict and final R5 review.
- Version 1.0.3 strengthens the first process-boundary TDD task with complete executable RED tests for byte preservation, timeout, output limits and spawn failure.
- Exact-head CI remains required before the plan can receive Operator approval.
- TC-01 harness implementation remains blocked pending explicit plan approval.
- M01 production implementation and Pi Worker dispatch remain prohibited.

## 2026-08-04

### TC-01 Tasks 1-11 — deterministic harness implementation

- Operator approved TC-01 plan version 1.0.3 and authorized implementation task-by-task.
- Registered `npm run test:tc01` and the explicit `npm run tc01 -- <command>` boundary in root verification.
- Added a bounded shell-free process runner, stable TC-01 errors and raw-byte stdout/stderr handling.
- Added Linux-owned run paths, a deterministic disposable Git fixture with no remote and a run-scoped Treehouse pool.
- Added exact provenance for WSL2, Ubuntu, Node, Git, Treehouse version, executable realpath/SHA-256 and required command capabilities.
- Added a trusted Git wrapper and independent source/pool/worktree observations.
- Added a strict Treehouse client for acquisition, status and conditional return; command exit remained advisory until fresh state observation.
- Added canonical JSON, command artifacts, scenario aggregates, immutable manifest, deterministic Verdict and secret-free Markdown/machine reports.
- Implemented S01-S15 orchestration with one acquisition per mutation-heavy scenario, fresh-client recovery, stale-ID/holder fencing, dirty-work preservation, repeated-release classification and freshness invalidation.
- Added strict `run`, `report` and `cleanup` commands with JSON/human output and fail-closed cleanup.
- Every task used observed RED before GREEN and exact-head GitHub Actions verification.
- Task 11 ended with 95 product tests, 119 AS-02 tests and 60 TC-01 tests green.
- No installed Treehouse binary was invoked; M01 implementation and Pi Worker dispatch remained prohibited.

### TC-01 Task 12 — complete deterministic adversarial review

- Operator requested a full adversarial review against the Product Blueprint, Capability Roadmap, Capability Realization Method, ADR-0005, TC-01 protocol, M01 microdesign and current primary documentation.
- Reviewed the pinned Treehouse 2.1.1 candidate source at commit `939cb59ba0bd69036ae52fc19b5b41e0a3f167d3`.
- Added executable RED tests for process descendants, path control characters, TOML encoding, run/pool containment, provenance isolation, strict UTF-8, finalized S01 BLOCKED Evidence, cleanup freshness/full source baseline, truthful blocked reports and adjacent private-state observation.
- Canonical RED workflow `30913196584` / job `92004727217` produced 60 PASS and 9 expected FAIL; no accepted TC-01 behavior regressed.
- Corrected Critical findings:
  - process timeouts now terminate the complete Linux process group;
  - cleanup rediscoveries now reject changed Treehouse bytes/version before status or deletion.
- Corrected Important findings:
  - known provenance failures become finalized S01 `BLOCKED` Evidence;
  - cleanup compares a complete source baseline rather than only HEAD/status;
  - Treehouse control, return and observed worktree paths remain inside run/pool boundaries;
  - TOML paths are safely encoded;
  - JSON boundaries use fatal UTF-8 decoding;
  - provenance commands receive an exact reduced environment;
  - S13 observes real pool private state immediately around status;
  - fixture and Evidence publication use write, file `fsync`, rename and directory `fsync` durability.
- Mapped every S01-S15 scenario to deciding implementation and named tests in `spikes/tc-01/README.md`.
- Published `ACCEPTANCE-TC-01-TASK-12-DETERMINISTIC-ADVERSARIAL-REVIEW`.
- Final implementation proof at head `2e1d73ef1c970694c5c50f8a2db4bc3c00db22be`, synthetic merge `e219df0b492fe45b529389df27f0e82edb8cf859`, workflow `30916499733`, job `92015860083`:
  - npm audit: 0 vulnerabilities;
  - typecheck: PASS;
  - product: 95/95;
  - AS-02: 119/119;
  - TC-01: 75/75;
  - documentation tooling, Replan builder and approved allocations: PASS;
  - documentation validation: 87 canonical IDs.
- Deterministic harness status became `IMPLEMENTED / DETERMINISTICALLY VERIFIED / PRE-WSL2 REVIEWED`.
- Real canonical WSL2 Evidence remains `NOT_STARTED`; Treehouse conformance is not established.
- Task 13 requires a separate explicit Operator continuation. PR #17 remains draft and unmerged; R5 remains `IN_PROGRESS`.

### TC-01 Task 13 — real canonical WSL2 conformance run

- Operator explicitly authorized Task 13 and updated the canonical `~/src/mnfs` checkout on `design/mis-002-m01`.
- Baseline verification passed on the exact authorized head before the real run.
- Canonical host provenance was Ubuntu 26.04 on WSL2 kernel `6.18.33.2-microsoft-standard-WSL2`, Node.js `v24.18.0`, npm `12.0.2` and Git `2.53.0`.
- Installed Treehouse resolved to `/usr/local/bin/treehouse`, returned raw version `v2.1.1` and had SHA-256 `c0b45a6b7cd7ee5b79bd614136847d84b4c6c3fc8dbe0fd80b71703b7a102cf3`.
- The real preflight exposed a version-presentation defect: the harness expected `2.1.1` text and rejected the installed `v2.1.1` output.
- TDD corrected only strict version presentation: one lowercase `v` prefix is canonicalized, while different versions or extra text remain blocked and exact bytes remain hash-bound.
  - RED workflow `30919284889`, job `92025350483`: 75 PASS / 1 expected FAIL.
  - GREEN workflow `30919527946`, job `92026176091`: 76/76 TC-01 PASS.
- The canonical run `tc01-20260804-144054-4315b6f2` produced `ACCEPT`; every scenario S01-S15 passed and no limitation was recorded.
- A fresh-process `report` invocation revalidated the manifest and artifact hashes and independently reproduced `ACCEPT`.
- Accepted command-shape hash: `sha256:f2077cfd037cbaefdcfc94385a0cfeb7e1647ef294ca8ceee3cd61a1b109dc84`.
- Accepted scenarios hash: `sha256:0588e88c8d694a60fd9a5e00e34af71175531c2b6187b61e0bfc89a0cf174f90`.
- The first cleanup attempt correctly failed closed and removed nothing, but its read-only diagnosis reported false `SOURCE_CHANGED` even though every HEAD, status, config, refs, tracked-tree and working-tree hash was identical.
- Root-cause analysis found property-order-sensitive `JSON.stringify` equality across a serialized baseline and a freshly constructed snapshot.
- TDD changed snapshot equality to canonical JSON, preserving array order and all real byte/hash/mode changes:
  - RED workflow `30923142365`, job `92038588740`: 76 PASS / 1 expected FAIL.
  - GREEN workflow `30923366842`, job `92039349604`: 77/77 TC-01 PASS.
- A separate TDD cycle exposed safe structured cleanup blockers through JSON while continuing to exclude raw stderr, Buffers and environment values:
  - RED workflow `30923469530`, job `92039702478`: 77 PASS / 1 expected FAIL.
  - GREEN workflow `30923659755`, job `92040355347`: 78/78 TC-01 PASS.
- The second cleanup review revalidated current provenance, Treehouse identity, command shape, status, absence of live TC-01 Leases, worktree cleanliness, complete source baseline and path containment.
- Cleanup returned `COMPLETED`; only `source-repo`, `pool-root`, `snapshots`, `fake-home`, `git-wrapper` and `unmanaged-repo` were removed.
- `fixture.json`, all finalized Evidence, report, Verdict, cleanup state and command artifacts remained preserved under the Linux-owned run root.
- Final artifact hashes were recorded in `ACCEPTANCE-TC-01-TREEHOUSE-PRODUCTION-ADAPTER`.
- Reconciled M01 microdesign version 0.4.0 now binds Treehouse 2.1.1, executable SHA-256, required capabilities, accepted command shape and mandatory freshness invalidation.
- Task 13 closed the physical adapter uncertainty but did not approve the complete M01 microdesign.
- Task 14 final constructive/adversarial review and an explicit Operator decision remain required; M01 implementation, Pi Worker dispatch and automatic PR merge remain prohibited.
