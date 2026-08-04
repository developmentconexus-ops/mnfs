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
- Published and merged the M0 walking skeleton.

### M1 — Visual Mission Planning

- Implemented structured Mission plans, deterministic hashes, SQLite revisions, exact-hash approval, contract materialization and repair.
- Added deterministic HTML/SVG rendering, Lavish integration, planning CLI and project-local Pi planning skill.
- Completed real Pi + Lavish pilot and corrected stable review-path and dependency-graph rendering defects.

## 2026-08-02

### Architecture Baseline

- Merged the Product Blueprint, MCRM, Capability Roadmap, ADRs, CAP-EXECUTION, research manifests and documentation governance through PR #11.
- Kept M2 blocked pending schema v2 and AS-02.

## 2026-08-03

### M2 readiness and MIS-002

- Integrated accepted AS-02 Evidence into CAP-EXECUTION.
- Accepted CAP-EXECUTION version 0.1.0.
- Exact-hash approved MIS-002 revision 5 at `sha256:d82252504044cab40e00013dc30534654382887b7819d60a916d2a9a56db4cc3`.
- Allocated all 28 requirements and completed R0–R4.
- Merged M2 contract reconciliation through PR #14 at `dee12a9b53984d39045421c9586ee53665ebc5e5`.
- Opened Issue #16, branch `design/mis-002-m01` and draft PR #17.

## 2026-08-04

### TC-01 deterministic and real conformance

- Implemented the deterministic TC-01 harness with shell-free bounded processes, Linux-owned fixtures, exact provenance, trusted Git observation, strict Treehouse JSON client, crash-durable Evidence, S01–S15 orchestration, Verdict/report and fail-closed cleanup.
- Completed adversarial review and corrected descendant-process timeout, stale executable cleanup, incomplete S01 Evidence, weak source baseline, path escape, unsafe TOML, invalid UTF-8 handling, inherited environment, S13 observation window and non-durable publication.
- Operator executed canonical TC-01 on Ubuntu 26.04 WSL2 with Treehouse `v2.1.1`.
- Run `tc01-20260804-144054-4315b6f2` produced `ACCEPT`; S01–S15 all passed.
- Corrected version canonicalization, property-order-sensitive snapshot comparison and structured cleanup error details through separate RED/GREEN cycles.
- Cleanup completed while preserving finalized Evidence.

### M01 final design review and approval

- Completed constructive and adversarial R5 review for all seven M01-owned requirements.
- Closed three Critical and eight Important findings without Replan.
- Published and accepted microdesign 0.6.1.
- Recorded Operator decision `D-007` and MCRM R5 `PASS`.
- Wrote and reviewed implementation plan 1.0.1 with 14 task gates.
- Recorded Operator decision `D-008`; implementation remained bounded by explicit RED/GREEN authorization per task.

### M01 Task 1 — execution domain

- RED established canonical IDs and lifecycle transition contracts.
- GREEN added `WriteTrack`, `Attempt`, `WorkerRun`, `Claim`, `Lease`, stable IDs, fail-closed transition tables and accepted error codes.
- Product suite reached 99/99 with AS-02 119/119 and TC-01 78/78.

### M01 Task 2 — trusted runtime primitives

- RED established contracts for bounded process execution, durable Artifact publication and Linux process identity.
- GREEN added the process runner, Artifact writer and process inspector.
- Post-GREEN review found an unreferenced termination-grace timer that could end a fresh CLI process with unsettled top-level await.
- Separate review RED reproduced exit code 13; corrected GREEN kept the grace timer referenced.
- Product suite reached 112/112 with AS-02 119/119 and TC-01 78/78.

### M01 Task 3 — shared SQLite transaction authority

- RED established four contracts: one commit on success, rollback of real writes, exact busy delays `5/10/20`, and no retry after user code starts.
- GREEN added `SqliteTransaction` and refactored all existing `SqliteStore` mutations onto one shared authority.
- Retry is limited to `BEGIN IMMEDIATE`; the fourth busy acquisition returns `CONCURRENCY_CONFLICT` without invoking user code.
- The callback executes exactly once after acquisition; commit and rollback are never retried.
- No schema, SQL, migration or public API changed.
- Product suite reached 116/116 with AS-02 119/119, TC-01 78/78 and documentation validation at 93 canonical IDs.
- Task 4 RED, real Treehouse execution, Pi Worker dispatch and PR merge remain unauthorized.
