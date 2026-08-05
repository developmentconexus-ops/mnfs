---
id: DOC-PROJECT-STATUS
title: MNFS Project Status
document_type: project_status
form: reference
authority: tracking
status: current
version: 1.8.22
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
- **Current enabler:** Issue #16 — explicit authorization for M01 implementation Task 7 GREEN
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
Task 6:                        COMPLETE
Task 7 RED:                    OBSERVED / ACCEPTABLE
Prior product suite:           148/148 PASS
Task 7 tests:                  0/7 expected failure
TypeScript:                    PASS
AS-02 baseline:                119/119 PASS
TC-01 baseline:                78/78 PASS
Documentation baseline:        PASS — 93 canonical IDs
Real Treehouse execution:      PROHIBITED until the final WSL2 proof gate
Pi Worker dispatch:            PROHIBITED
Automatic merge:               NOT AUTHORIZED
Current human gate:            explicit authorization for Task 7 GREEN only
PR:                            #17 DRAFT
```

The Task 7 RED verification intentionally stops `npm run verify` during the product suite. AS-02, TC-01 and documentation checks therefore retain their last accepted Task 6 correction baseline and were not re-executed by the RED workflow.

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
MNFS_AUTHORIZE_M01_TASK_6_RED plan=1.0.1 microdesign=0.6.1 task5=ea459368fe1346c2cb2d6e9d37b3bb25a0c54903
MNFS_AUTHORIZE_M01_TASK_6_GREEN plan=1.0.1 microdesign=0.6.1 red=b7a98a1972038bbd1d631f8e669959247256223b
MNFS_AUTHORIZE_M01_TASK_6_CORRECTION_RED plan=1.0.1 microdesign=0.6.1 green=839851d8d0d267b6ff235eae6c241c6ee38c5291 blockers=R6-01,R6-02
MNFS_AUTHORIZE_M01_TASK_6_CORRECTION_GREEN plan=1.0.1 microdesign=0.6.1 red=3d443aa2223abd185e5cea39ecb905a0e86e0a8f blockers=R6-01,R6-02
MNFS_AUTHORIZE_M01_TASK_7_RED plan=1.0.1 microdesign=0.6.1 task6=b1d7f0d4b2c5a44dc8686342d8d882c8dcf3d992
```

Task 7 RED authority allowed only `tests/services/execution-service.test.ts`, expected-failure verification and tracking Evidence. It did not authorize `src/services/execution-service.ts`, Task 7 GREEN, Task 8, Treehouse execution, Pi dispatch, M01 acceptance or merge.

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

```text
src/store/event-store.ts
src/store/migrations.ts
src/store/sqlite-store.ts
src/domain/types.ts
```

Task 5 established atomic migration v4, byte-preserving versioned Events, the 19-type Event registry, execution entity tables, partial current-row indexes, composite relational ancestry, downgrade fencing, strict v4 schema-shape checks and fail-closed ordinary opening for pre-v4 stores.

## Task 5 verification

```text
Primary RED:               e38592a97485bac91c713dbd648c391bdb029357
Primary RED workflow/job:  30948252320 / 92123531426
Primary GREEN:             eb6e3a3251a6d6bdce8eff809619ceaa2d6f905e
Primary GREEN workflow:    30953397122 / 92140684893
Shape-fence RED/GREEN:     4af7b25f... → 8c3dcbf3...
Implicit-migration fence:  1b54ab75... → ea459368...
Final Task 5 product:      136/136 PASS
```

Current opening behavior:

```text
new database path       → create and verify schema v4
existing exact v4       → open without migration
existing v1/v2/v3       → SCHEMA_VERSION_UNSUPPORTED; no mutation
incomplete/future v4    → SCHEMA_VERSION_UNSUPPORTED; no mutation
```

## Task 6 implementation

Created:

```text
src/store/execution-store.ts
tests/store/execution-store.test.ts
tests/store/execution-store-correction.test.ts
```

Modified:

```text
src/store/migrations.ts
src/store/sqlite-store.ts
```

Task 6 provides:

- one focused `SqliteStore.execution` instance sharing the existing database, transaction and Event authorities;
- persisted `entity_sequences` authority for monotonic global Write Track and Lease IDs;
- parent-relative Attempt, Worker Run and Claim ordinals;
- current-row conflict translation for Track, Attempt, Worker Run, Lease and Claim;
- exact Claim ancestry and Attempt base binding;
- Lease and Claim same-key/same-input replay with conflicting-input rejection;
- expected-version compare-and-swap for all mutable execution entities;
- strict fail-closed codecs for persisted identities, enums, hashes, process state, Lease nullability and Claim criteria;
- one bounded `runAtomic` session for composing Track, Attempt and versioned Events under the existing `SqliteTransaction`;
- rollback of rows, Events and sequence increments when any operation in that session fails;
- no second SQLite connection or transaction authority;
- no lifecycle service, filesystem, Git, Treehouse or Pi behavior.

## Task 6 verification

### Primary RED

```text
RED head:                 b7a98a1972038bbd1d631f8e669959247256223b
RED synthetic merge:      7d6510740ff6c794f81e69f035ba00d80f620a50
RED workflow/job:          30955596905 / 92147742698
TypeScript:                PASS
Prior product tests:       136/136 PASS
Task 6 tests:              0/7 expected failure
```

### Functional GREEN

```text
Functional GREEN head:    839851d8d0d267b6ff235eae6c241c6ee38c5291
Synthetic merge:          48758649c298e815b64d9390b940f4c8c36def54
Workflow/job:              30956920940 / 92152041470
Product tests:             143/143 PASS
AS-02 tests:               119/119 PASS
TC-01 tests:               78/78 PASS
Documentation validation: PASS — 93 canonical IDs
```

Review found two accepted-contract gaps:

```text
R6-01  migration v4 lacked entity_sequences and global IDs used MAX(id)+1
R6-02  no bounded seam could compose Track + A01 + matching Events atomically
```

### Correction RED

```text
Correction RED head:      3d443aa2223abd185e5cea39ecb905a0e86e0a8f
Synthetic merge:          8ba8a2e760ffa25b9ea24921eadae4b5e568f480
Workflow/job:              30963369380 / 92171947664
TypeScript:                PASS
Prior product tests:       143/143 PASS
Correction tests:          0/5 expected failure
```

The five REDs independently proved the missing relation, WT/LSE ID reuse after controlled deletion, absent atomic composition and absent rollback proof.

### Correction GREEN

```text
Correction GREEN head:    b1d7f0d4b2c5a44dc8686342d8d882c8dcf3d992
Synthetic merge:          0bbd8db107f0699d05b963f3c34d58fb9547e78b
Workflow/job:              30965918647 / 92179708566
Product tests:             148/148 PASS
Correction tests:         5/5 PASS
AS-02 tests:               119/119 PASS
TC-01 tests:               78/78 PASS
Documentation validation: PASS — 93 canonical IDs
```

R6-01 and R6-02 are closed. The accepted microdesign remains version 0.6.1; no Replan was required.

## Task 7 RED verification

Created only:

```text
tests/services/execution-service.test.ts
```

The seven RED tests define the accepted boundary for:

- exact latest approved contract and qualified M01 Feature authority;
- non-empty Feature requirement allocation;
- exact Git commit/object-format resolution;
- atomic Track + A01 + `WRITE_TRACK_OPENED` + `ATTEMPT_OPENED`;
- same-input replay and conflicting-input rejection;
- rollback of Track, Attempt, Events and sequence allocation;
- atomic Worker Run opening and replacement;
- Attempt supersession resource guards;
- empty Track abandonment without implicit Lease release.

Evidence:

```text
RED head:                 2fe2d87e1bc6f690c2cd556f1b0278420b8e3dda
RED synthetic merge:      c1d6f79c73cb4aeb70a4de56d82ac64e8547f2c1
Workflow/job:              30969751509 / 92191310194
TypeScript:                PASS
Prior product tests:       148/148 PASS
Task 7 tests:              0/7 expected failure
Product total:             148 PASS / 7 FAIL
Expected cause:            src/services/execution-service.ts absent
```

The preceding test-only commit `9815641c69e2e8889f8533304a0f9f3019c86b8a` failed typecheck on three payload-union accesses. Commit `2fe2d87e1bc6f690c2cd556f1b0278420b8e3dda` corrected only those test typings; no production file was added.

## Scope review

Compared Task 6 tracking head `df52067ca6697f13687bf099cac8b69d74f7b036` to Task 7 RED head `2fe2d87e1bc6f690c2cd556f1b0278420b8e3dda`.

```text
tests/services/execution-service.test.ts  added
src/services/execution-service.ts         absent
other production files                    unchanged
Task 8 adapters                           absent
Treehouse/Pi behavior                     unchanged
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
Task 4:                    COMPLETE
Task 5:                    COMPLETE
Task 6:                    COMPLETE
Task 7 RED:                OBSERVED / ACCEPTABLE
Task 7 GREEN:              NOT AUTHORIZED
Task 8 and later:          NOT AUTHORIZED
Real Treehouse execution:  NOT AUTHORIZED
Pi Worker dispatch:        PROHIBITED
M01 acceptance:            NOT AUTHORIZED
PR #17 merge:              NOT AUTHORIZED
```

A material change to MIS-002, SEC-E1, CAP-EXECUTION, the accepted Treehouse boundary, microdesign invariants or applicable requirements triggers Replan or renewed readiness review.

## Immediate next action

Request or provide an explicit continuation for **Task 7 GREEN only**, bound to RED head `2fe2d87e1bc6f690c2cd556f1b0278420b8e3dda`. Stop before creating `src/services/execution-service.ts` unless that continuation is granted.
