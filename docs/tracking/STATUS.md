---
id: DOC-PROJECT-STATUS
title: MNFS Project Status
document_type: project_status
form: reference
authority: tracking
status: current
version: 1.8.15
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
- **Current enabler:** Issue #16 — explicit authorization for M01 implementation Task 5 RED
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
Task 4 RED:                    OBSERVED / EXPECTED FAILURE
Task 4 GREEN:                  COMPLETE
Complete product suite:        124/124 PASS
Task 5 RED:                    NOT AUTHORIZED
Real Treehouse execution:      PROHIBITED until the final WSL2 proof gate
Pi Worker dispatch:            PROHIBITED
Automatic merge:               NOT AUTHORIZED
Current human gate:            explicit authorization for Task 5 RED only
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
MNFS_AUTHORIZE_M01_TASK_4_GREEN plan=1.0.1 microdesign=0.6.1 red=a163c8d3512f6f9a2583156e5f3e64f32ecde45b
```

Task 4 authority did not extend to Task 5, migration v4, Treehouse, Pi, M01 acceptance or merge.

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

## Task 4 implementation

Created:

```text
src/store/sqlite-maintenance.ts
tests/store/sqlite-maintenance-boundary.test.ts
```

Modified:

```text
src/store/sqlite-store.ts
```

Task 4 established:

- an exclusive `<database>.maintenance.lock` with canonical owner metadata, mode `0600`, file fsync and parent-directory fsync;
- no lock takeover based on age and fail-closed handling for malformed, symlink or non-regular lock paths;
- ownership-preserving durable release with parent-directory fsync;
- consistent `node:sqlite backup()` from an open WAL source connection;
- immutable no-overwrite backup publication, mode `0600`, file/directory fsync and SHA-256 Evidence;
- reopened backup `PRAGMA integrity_check = ok`, migration inventory, user version, table counts and approved contract hashes;
- schema inspection for supported v3 and v4 matrices, with gaps and future versions rejected using `SCHEMA_VERSION_UNSUPPORTED`;
- `ensureDatabaseReady()` separated from store opening;
- `SqliteStore.openCurrent()` that never applies migrations implicitly and rechecks schema after opening the writable connection;
- an explicit pre-v4 writer fence: the current writer accepts schema 3 only, while maintenance inspection can read schema 4 for migration/backup planning.

No Task 5 schema, migration, Event or execution table was created.

## Task 4 verification

### Primary RED

```text
RED head:                 a163c8d3512f6f9a2583156e5f3e64f32ecde45b
RED synthetic merge:      67b164045583eba860fa927b26519ff7885a4c07
RED workflow/job:          30944704469 / 92111672286
TypeScript:                PASS
Prior product tests:       116/116 PASS
Task 4 tests:              0/7 expected failure
Failure cause:             sqlite-maintenance module absent
```

### Initial GREEN and focused correction

The initial implementation passed six of seven Task 4 tests. The injected durability seam returned no persisted read during release, while the first implementation required a reread result. The production boundary already delegated missing-path behavior to exclusive filesystem removal, so the release contract was corrected without weakening changed-owner rejection.

```text
Initial GREEN head:       b7c3145335328320913c99d777b0f5032a4f3a31
Synthetic merge:          3345742b9895b04c7b1b83882daec994b1b044c0
Workflow/job:             30946090318 / 92116316689
Result:                   122 PASS / 1 FAIL

Corrected GREEN head:     808dd4901287b2a617fecb22241a9e179912d4dc
Synthetic merge:          f88a7dc35aeee0ddf011995dfa6e9be0c763f39f
Workflow/job:             30946292534 / 92116985716
Product tests:            123/123 PASS
AS-02 tests:              119/119 PASS
TC-01 tests:              78/78 PASS
Documentation validation: 93 canonical IDs
```

### Post-GREEN adversarial writer fence

Review found that the schema inspector correctly recognized v4 for read/backup purposes, but the still-pre-v4 `SqliteStore.openCurrent()` also accepted it for writes. A separate RED proved the downgrade gap, and the writer was fenced to schema 3 until Task 5 promotes the current write schema.

```text
Boundary RED head:        24b8dbf924e4b394f139fa2fa4e2a1a07b3dfbcd
Synthetic merge:          6b59775fd3635fe12475f8824a7c4e4780764f76
Workflow/job:             30946515167 / 92117734647
Result:                   123 PASS / 1 expected FAIL
Failure cause:            pre-v4 openCurrent accepted readable v4 schema

Final GREEN head:         d0172cc2c141cec6004f10caa9859bced9ac8d1c
Synthetic merge:          3b42f58128f5e0d04246383fb8c62676ba3a0c2c
Workflow/job:             30946633663 / 92118136010
Product tests:            124/124 PASS
AS-02 tests:              119/119 PASS
TC-01 tests:              78/78 PASS
Documentation validation: 93 canonical IDs
```

Post-GREEN scope review compared `9e0e5d14...` to `d0172cc2...` and found only `sqlite-maintenance.ts`, the bounded `sqlite-store.ts` opening refactor and the writer-fence regression test. `migrations.ts`, schema and Task 5 files remained unchanged.

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
Task 4:                    COMPLETE
Task 5 RED:                NOT AUTHORIZED
Task 5 GREEN and later:    NOT AUTHORIZED
Migration v4:              NOT AUTHORIZED
Real Treehouse execution:  NOT AUTHORIZED
Pi Worker dispatch:        PROHIBITED
PR #17 merge:              NOT AUTHORIZED
```

A material change to MIS-002, SEC-E1, CAP-EXECUTION, the accepted Treehouse boundary, microdesign invariants or applicable requirements triggers Replan or renewed readiness review.

## Immediate next action

Request or provide an explicit continuation for **Task 5 RED only**. Stop before modifying migrations, Events, domain Event types or execution tables unless that continuation is granted.
