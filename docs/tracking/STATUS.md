---
id: DOC-PROJECT-STATUS
title: MNFS Project Status
document_type: project_status
form: reference
authority: tracking
status: current
version: 1.8.14
owners:
  - developmentconexus-ops
related:
  - DOC-DOCUMENTATION-MAP
  - DOC-CAPABILITY-ROADMAP
  - ACCEPTANCE-CAP-EXECUTION-R3
  - ACCEPTANCE-MIS-002-REPLAN
  - ACCEPTANCE-M2-UNBLOCK
  - ACCEPTANCE-TC-01-TREEHOUSE-PRODUCTION-ADAPTER
  - REVIEW-MIS-002-M01-R5-FINAL
  - ACCEPTANCE-MIS-002-M01-R5-APPROVAL
  - ACCEPTANCE-MIS-002-M01-IMPLEMENTATION-PLAN-APPROVAL
  - DESIGN-MIS-002-M01-DURABLE-EXECUTION-LEASE-CORE
  - PLAN-MIS-002-M01-DURABLE-EXECUTION-LEASE-CORE
tracking_issue: 16
---

# Project status

- **Program:** Pi-first MNFS
- **Canonical environment:** Ubuntu on WSL2; Windows remains the browser, terminal and desktop host
- **Completed Product Milestones:** M0 — Foundation Walking Skeleton; M1 — Visual Mission Planning
- **Architecture Baseline:** merged through PR #11 at `f28cf2b58b7f1682450399c6edb50c983fff0cc2`
- **M2 contract reconciliation:** merged through PR #14 at `dee12a9b53984d39045421c9586ee53665ebc5e5`
- **Approved M2 contract:** MIS-002 revision 5, schema v2, `sha256:d82252504044cab40e00013dc30534654382887b7819d60a916d2a9a56db4cc3`
- **Current enabler:** Issue #16 — explicit authorization for M01 implementation Task 4 GREEN
- **Current design/implementation PR:** #17 — `design/mis-002-m01` (draft; unmerged)

## Readiness result

```text
R0 Baseline              PASS
R1 Applicability         PASS
R2 Requirements          PASS
R3 Capability Readiness  PASS
R4 Contract Readiness    PASS
R5 Milestone Microdesign PASS
```

## Current M01 result

```text
CAP-EXECUTION:                 ACCEPTED — version 0.1.0
MIS-002 contract:              APPROVED — revision 5 / exact hash
TC-01 canonical Evidence:      ACCEPT — 15/15 PASS, cleanup COMPLETED
M01 microdesign:               ACCEPTED — version 0.6.1
Implementation plan:           CURRENT / APPROVED — version 1.0.1
Implementation started:        YES — bounded by task gates
Task 1:                        COMPLETE
Task 2:                        COMPLETE
Task 3:                        COMPLETE
Complete product suite:        116/116 PASS before Task 4 RED
Task 4 RED:                    OBSERVED / EXPECTED FAILURE
Task 4 GREEN:                  NOT AUTHORIZED
Real Treehouse execution:      PROHIBITED until the final WSL2 proof gate
Pi Worker dispatch:            PROHIBITED
Automatic merge:               NOT AUTHORIZED
Current human gate:            explicit authorization for Task 4 GREEN only
PR:                            #17 DRAFT
```

## Operator authority chain

```text
D-007  microdesign 0.6.1 approved
D-008  implementation plan 1.0.1 approved
MNFS_AUTHORIZE_M01_TASK_1_RED plan=1.0.1 microdesign=0.6.1
MNFS_AUTHORIZE_M01_TASK_1_GREEN plan=1.0.1 microdesign=0.6.1 red=65bd4e2c410d4d1566f5fef0da33f29e35657489
MNFS_AUTHORIZE_M01_TASK_2_RED plan=1.0.1 microdesign=0.6.1 task1=ec6505d7207d252aeef77d72192c401f460b4816
MNFS_AUTHORIZE_M01_TASK_2_GREEN plan=1.0.1 microdesign=0.6.1 red=01a1e5deabbe5388f83f83d13effe9e1a220fed0
MNFS_AUTHORIZE_M01_TASK_3_RED plan=1.0.1 microdesign=0.6.1 task2=ff4d345720c2a14623ec1777fc5f318c9d96d685
MNFS_AUTHORIZE_M01_TASK_3_GREEN plan=1.0.1 microdesign=0.6.1 red=9e109da918cb3cf8567a057684564d6cfe60ca7e
MNFS_AUTHORIZE_M01_TASK_4_RED plan=1.0.1 microdesign=0.6.1 task3=2ed7e6d620f771dd1399421d06527911a2ffea0c
```

Task 4 RED authority did not extend to Task 4 GREEN, maintenance implementation, store refactoring, migrations, Treehouse, Pi or merge.

## Completed implementation

### Task 1 — execution domain

```text
src/execution/ids.ts
src/execution/model.ts
src/execution/transitions.ts
src/domain/errors.ts
```

Task 1 established canonical parent-relative IDs, immutable execution models, fail-closed lifecycle transitions and the accepted M01 typed-error vocabulary.

### Task 2 — trusted runtime primitives

```text
src/runtime/process-runner.ts
src/runtime/durable-artifact.ts
src/adapters/process-identity.ts
```

Task 2 established bounded shell-free process execution, immutable crash-durable Artifact publication and Linux process identity bound to boot ID, PID and start ticks.

### Task 3 — shared SQLite transaction authority

```text
src/store/sqlite-transaction.ts
src/store/sqlite-store.ts
```

Task 3 established:

- one shared synchronous authority for all existing `SqliteStore` write operations;
- `BEGIN IMMEDIATE` before user code;
- retry only while transaction acquisition returns SQLite busy;
- exact bounded delays `5`, `10` and `20` milliseconds;
- `CONCURRENCY_CONFLICT` after the fourth busy acquisition attempt;
- callback execution exactly once after successful acquisition;
- one commit on success;
- rollback only while `database.isTransaction` is true;
- no callback, commit or transaction retry after user code starts;
- no schema, SQL, migration or public API change.

## Task 3 verification

### RED

```text
RED head:                 9e109da918cb3cf8567a057684564d6cfe60ca7e
RED synthetic merge:      4612c6c5bdf10a5a654b3658dafc3dc734561c20
RED workflow/job:          30942340332 / 92103635626
TypeScript:                PASS
Prior product tests:       112/112 PASS
Task 3 tests:              0/4 expected failure
Failure cause:             sqlite-transaction module absent
```

### GREEN

```text
GREEN head:               2ed7e6d620f771dd1399421d06527911a2ffea0c
GREEN synthetic merge:    cb475aa10babba1c265bfa7b2688a9ec5f63af8e
GREEN workflow/job:        30943310015 / 92106917795
Product tests:             116/116 PASS
AS-02 tests:               119/119 PASS
TC-01 tests:               78/78 PASS
Documentation validation:  93 canonical IDs
```

Post-GREEN scope review compared `1e603452...` to `2ed7e6d6...` and found only the new transaction authority plus the bounded store refactor: 7 additions and 16 deletions in `sqlite-store.ts`, with no schema or SQL change.

## Task 4 RED contract

Added only:

```text
tests/store/sqlite-maintenance.test.ts
```

The seven tests require:

- exclusive `<database>.maintenance.lock` publication with mode `0600`;
- canonical owner metadata, file fsync and parent-directory fsync;
- durable lock removal with parent-directory fsync;
- a second owner blocked even when the existing lock is old;
- malformed and symlink locks rejected without mutation;
- a consistent `node:sqlite` backup from an open WAL source connection;
- reopened backup `integrity_check = ok`, SHA-256, migration rows, table counts and approved contract hashes;
- supported matrices `[1,2,3]` with `user_version` `0` or `3`, and `[1,2,3,4]` with `user_version = 4`;
- migration gaps and future schemas rejected in write mode with `SCHEMA_VERSION_UNSUPPORTED`;
- `SqliteStore.openCurrent(path)` refusing unverified schema without applying migrations implicitly.

No Task 4 production module, backup, maintenance lock or `SqliteStore` refactor was created.

## Task 4 RED verification

```text
RED head:                 a163c8d3512f6f9a2583156e5f3e64f32ecde45b
RED synthetic merge:      67b164045583eba860fa927b26519ff7885a4c07
RED workflow/job:          30944704469 / 92111672286
TypeScript:                PASS
Prior product tests:       116/116 PASS
Task 4 tests:              0/7 expected failure
Product total:             116 PASS / 7 FAIL
Failure cause:             sqlite-maintenance module absent
AS-02 / TC-01 / docs:      NOT RUN — root verify stopped after expected unit RED
```

## Frozen boundaries

The accepted design invariants remain unchanged:

- canonical checkout is never Treehouse cwd;
- every Attempt owns an independent exact-base Linux-local source;
- Treehouse uses controlled HOME/XDG/config/hooks and the accepted candidate;
- state mutation and payload-versioned Event commit atomically;
- relational keys prove exact Track → Attempt → Run/Lease → Claim ancestry;
- action STARTED is durable before one external invocation;
- inconclusive grant never automatically repeats `treehouse get`;
- dirty, ambiguous and unclassified work is preserved;
- plain Recovery performs no domain or resource mutation;
- M01 creates Claim `OPEN` only and contains no Pi dispatch, Receipt or Gate.

## Current authorization boundary

```text
Task 1:                    COMPLETE
Task 2:                    COMPLETE
Task 3:                    COMPLETE
Task 4 RED:                OBSERVED / COMPLETE
Task 4 GREEN:              NOT AUTHORIZED
Task 5 and later:          NOT AUTHORIZED
Real Treehouse execution:  NOT AUTHORIZED
Pi Worker dispatch:        PROHIBITED
PR #17 merge:              NOT AUTHORIZED
```

A material change to MIS-002, SEC-E1, CAP-EXECUTION, the accepted Treehouse boundary, microdesign invariants or applicable requirements triggers Replan or renewed readiness review.

## Immediate next action

Request or provide an explicit continuation for **Task 4 GREEN only**. Stop before creating `sqlite-maintenance.ts`, adding `openCurrent`, producing a backup or changing store-open behavior unless that continuation is granted.
