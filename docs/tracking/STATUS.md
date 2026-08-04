---
id: DOC-PROJECT-STATUS
title: MNFS Project Status
document_type: project_status
form: reference
authority: tracking
status: current
version: 1.8.19
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
- **Architecture baseline:** merged through PR #11 at `f28cf2b58b7f1682450399c6edb50c983fff0cc2`
- **M2 contract reconciliation:** merged through PR #14 at `dee12a9b53984d39045421c9586ee53665ebc5e5`
- **Approved M2 contract:** MIS-002 revision 5, schema v2, `sha256:d82252504044cab40e00013dc30534654382887b7819d60a916d2a9a56db4cc3`
- **Current enabler:** Issue #16 — explicit authorization for M01 implementation Task 6 RED
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
Task 4:                        COMPLETE
Task 5:                        COMPLETE
Complete product suite:        136/136 PASS
AS-02:                         119/119 PASS
TC-01:                         78/78 PASS
Documentation validation:      PASS — 93 canonical IDs
Task 6 RED:                    NOT AUTHORIZED
Real Treehouse execution:      PROHIBITED until the final WSL2 proof gate
Pi Worker dispatch:            PROHIBITED
Automatic merge:               NOT AUTHORIZED
Current human gate:            explicit authorization for Task 6 RED only
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
MNFS_AUTHORIZE_M01_TASK_5_RED plan=1.0.1 microdesign=0.6.1 task4=d0172cc2c141cec6004f10caa9859bced9ac8d1c
MNFS_AUTHORIZE_M01_TASK_5_GREEN plan=1.0.1 microdesign=0.6.1 red=e38592a97485bac91c713dbd648c391bdb029357
```

Task 5 authority did not extend to Task 6, real Treehouse execution, Pi dispatch, M01 acceptance or merge.

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

Task 3 established one shared `BEGIN IMMEDIATE` authority with bounded `SQLITE_BUSY` retry before user code only, callback execution exactly once, one commit on success and rollback while the connection remains in a transaction.

### Task 4 — maintenance gate and consistent backup

```text
src/store/sqlite-maintenance.ts
src/store/sqlite-store.ts
tests/store/sqlite-maintenance-boundary.test.ts
```

Task 4 established an exclusive durable maintenance lock, no age-based takeover, fail-closed malformed/symlink handling, consistent `node:sqlite backup()` Evidence and schema/version readiness checks separated from store opening.

### Task 5 — migration v4, versioned Events and execution schema

Created:

```text
src/store/event-store.ts
```

Modified:

```text
src/store/migrations.ts
src/store/sqlite-store.ts
src/domain/types.ts
```

Task 5 established:

- atomic migration v4 from empty, M0/v1, M1/v3 and exact MIS-002 revision-5 databases;
- byte-preserving Event rebuild with immutable `payload_schema_version = 1` history;
- `event_types(type, payload_schema_version)` seeded with all 19 accepted version-1 Event types;
- required Event payload version without a default, creating the downgrade write fence;
- one `EventStore` for canonical versioned Event appends and reads;
- exact `write_tracks`, `attempts`, `worker_runs`, `leases` and `claims` tables;
- partial indexes for current Track, Attempt, Run, Lease, Lease action token and Claim;
- composite foreign keys proving Track → Attempt → Run/Lease → Claim ancestry;
- rollback of the complete migration when migration-4 finalization fails;
- exact v4 writer-shape validation: versions alone cannot masquerade as a complete schema;
- ordinary store opening never migrates an existing pre-v4 database implicitly.

## Task 5 verification

### Primary RED

```text
RED head:                 e38592a97485bac91c713dbd648c391bdb029357
RED synthetic merge:      3d274f7c2e96d73fdd656b765347b5cba0b3341b
RED workflow/job:          30948252320 / 92123531426
TypeScript:                PASS
Prior product tests:       124/124 PASS
Task 5 tests:              0/10 expected failure
Product total:             124 PASS / 10 FAIL
```

### Initial GREEN

```text
Initial product head:      27a040d1c44d1a77f611ffa556c02bd0178434ec
Initial workflow/job:      30953020369 / 92139458011
Task 5 tests:              10/10 PASS
Result:                    131 PASS / 3 legacy expectation FAIL
```

The three remaining failures were legacy assumptions about the pre-v4 writer, an old-format backup fixture and Event reads without `payloadSchemaVersion`. They were updated without weakening the Task 5 RED contracts.

### Complete primary GREEN

```text
GREEN head:                eb6e3a3251a6d6bdce8eff809619ceaa2d6f905e
GREEN synthetic merge:     23941c15b69a7fa94c4547be794d8000ada0e47c
GREEN workflow/job:         30953397122 / 92140684893
Product tests:              134/134 PASS
AS-02 tests:                119/119 PASS
TC-01 tests:                78/78 PASS
Documentation validation:  PASS — 93 canonical IDs
```

### Adversarial v4-shape fence

Review found that `[1,2,3,4]` plus `user_version = 4` could identify an incomplete database as v4.

```text
Boundary RED head:         4af7b25f66099d02e59b2f0b744e9db90df93436
Boundary workflow/job:     30953670766 / 92141563012
Result:                    135 prior PASS / 1 expected FAIL
Failure cause:             openCurrent accepted version-only v4 metadata

Boundary GREEN head:       8c3dcbf31e9e999f23a70bb89ba0f8a34d77f012
Boundary synthetic merge:  b0476e52ed2adfcb5a670bb2c2786a39668c9fad
Boundary workflow/job:     30953827577 / 92142076020
Product tests:             135/135 PASS
AS-02 / TC-01 / docs:      PASS
```

The current writer now requires the exact v4 tables, columns, indexes and Event registry in addition to version metadata.

### Adversarial implicit-migration fence

Review found that ordinary CLI composition still called `SqliteStore.open()`, which could upgrade an existing v3 database without the Task 4 maintenance lock and verified backup.

```text
Implicit-migration RED:    1b54ab7586f48bc89e2f8eedeaa524575ff6d096
RED synthetic merge:       e376b629e38a9ad4ebd2ff3b96be4ea79ba2102c
RED workflow/job:          30954083673 / 92142905324
Result:                    135 prior PASS / 1 expected FAIL
Failure cause:             SqliteStore.open migrated v3 implicitly

Final GREEN head:          ea459368fe1346c2cb2d6e9d37b3bb25a0c54903
Final synthetic merge:     b1d009c0a0fc8d845d3aa0d923c29a2ce1477a57
Final workflow/job:        30954418043 / 92143978176
Product tests:             136/136 PASS
AS-02 tests:               119/119 PASS
TC-01 tests:               78/78 PASS
Documentation validation: PASS — 93 canonical IDs
```

Current opening behavior:

```text
new database path       → create and verify schema v4
existing exact v4       → open without migration
existing v1/v2/v3       → SCHEMA_VERSION_UNSUPPORTED; no mutation
incomplete/future v4    → SCHEMA_VERSION_UNSUPPORTED; no mutation
```

`applyMigrations()` remains available to the explicit maintenance authority and migration tests. Ordinary product commands do not use it to upgrade an existing database. The operator-facing maintenance migration command/composition is not implemented or authorized yet; existing pre-v4 runtime databases remain preserved and fail closed.

## Scope review

Compared pre-GREEN `d71274e10956062751ba7e1a913510484f5db2c6` to functional GREEN `ea459368fe1346c2cb2d6e9d37b3bb25a0c54903`.

Changed product files:

```text
src/domain/types.ts
src/store/event-store.ts
src/store/migrations.ts
src/store/sqlite-store.ts
```

Changed tests only to implement the Task 5 contracts and reconcile explicit migration boundaries:

```text
tests/store/mission-plan-schema-v2-store.test.ts
tests/store/mission-plan-store.test.ts
tests/store/sqlite-maintenance-boundary.test.ts
tests/store/sqlite-maintenance.test.ts
tests/store/sqlite-store.test.ts
```

No Task 6 store, service, allocation, idempotency or CAS method was introduced.

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
Task 5:                    COMPLETE
Task 6 RED:                NOT AUTHORIZED
Task 6 GREEN and later:    NOT AUTHORIZED
Existing pre-v4 migration: NOT EXPOSED TO ORDINARY PRODUCT COMMANDS
Real Treehouse execution:  NOT AUTHORIZED
Pi Worker dispatch:        PROHIBITED
M01 acceptance:            NOT AUTHORIZED
PR #17 merge:              NOT AUTHORIZED
```

A material change to MIS-002, SEC-E1, CAP-EXECUTION, the accepted Treehouse boundary, microdesign invariants or applicable requirements triggers Replan or renewed readiness review.

## Immediate next action

Request or provide an explicit continuation for **Task 6 RED only**. Stop before creating `execution-store.ts`, adding allocation/idempotency/CAS methods or beginning execution lifecycle services unless that continuation is granted.
