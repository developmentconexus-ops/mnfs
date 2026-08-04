---
id: DOC-PROJECT-STATUS
title: MNFS Project Status
document_type: project_status
form: reference
authority: tracking
status: current
version: 1.8.20
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
- **Current enabler:** Issue #16 — Operator decision on Task 6 schema/composition review blockers
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
Task 6 RED:                    OBSERVED / COMPLETE
Task 6 functional GREEN:       143/143 PASS
Task 6 contract review:        BLOCKED — R6-01 / R6-02
Task 6 COMPLETE:               NO
Task 7 and later:              NOT AUTHORIZED
AS-02:                         119/119 PASS
TC-01:                         78/78 PASS
Documentation validation:      PASS — 93 canonical IDs
Real Treehouse execution:      PROHIBITED until the final WSL2 proof gate
Pi Worker dispatch:            PROHIBITED
Automatic merge:               NOT AUTHORIZED
Current human gate:            explicit Operator decision on bounded correction or Replan
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
MNFS_AUTHORIZE_M01_TASK_6_RED plan=1.0.1 microdesign=0.6.1 task5=ea459368fe1346c2cb2d6e9d37b3bb25a0c54903
MNFS_AUTHORIZE_M01_TASK_6_GREEN plan=1.0.1 microdesign=0.6.1 red=b7a98a1972038bbd1d631f8e669959247256223b
```

Task 6 authority allowed only `src/store/execution-store.ts` and the bounded `src/store/sqlite-store.ts` composition change. It did not authorize migration/schema correction, microdesign change, Task 7, real Treehouse execution, Pi dispatch, M01 acceptance or merge.

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
```

Modified:

```text
src/store/sqlite-store.ts
```

The functional implementation provides:

- one focused `SqliteStore.execution` instance sharing the existing database, transaction and Event authorities;
- deterministic global and parent-relative ID allocation under `BEGIN IMMEDIATE`;
- current-row conflict translation for Track, Attempt, Worker Run, Lease and Claim;
- exact Claim ancestry and Attempt base binding;
- Lease and Claim same-key/same-input replay with conflicting-input rejection;
- expected-version compare-and-swap for all mutable execution entities;
- strict fail-closed codecs for persisted identities, enums, hashes, process state, Lease nullability and Claim criteria;
- no second SQLite connection, transaction authority, Domain Event workflow, filesystem, Git, Treehouse or Pi behavior.

## Task 6 verification

### RED

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

## Task 6 contract-review blockers

### R6-01 — accepted sequence relation is missing

Accepted microdesign 0.6.1 requires:

```sql
CREATE TABLE entity_sequences (
  kind TEXT PRIMARY KEY CHECK (kind IN ('WRITE_TRACK', 'LEASE')),
  next_value INTEGER NOT NULL CHECK (next_value > 0)
);
```

The current migration v4 does not create this table. The functional store uses transactionally serialized `MAX(id) + 1` allocation instead. That behavior passes deterministic tests but is not the accepted relational model. Correcting it requires a migration/schema change outside Task 6 authority, or an explicit Replan that changes the accepted microdesign.

### R6-02 — Task 7 atomic-composition seam is absent

Task 7 requires one transaction to commit Track, A01, `WRITE_TRACK_OPENED` and `ATTEMPT_OPENED`. Current Task 6 allocation methods each acquire their own transaction, and `EventStore`/transaction composition is not exposed to the future service. The implementation therefore needs a bounded transaction-composition seam before Task 7 can be implemented without changing the Task 7 file scope or creating nested transactions.

R6-01 and R6-02 are review blockers, not failing deterministic tests. Task 6 remains incomplete until the Operator authorizes a bounded correction or Replan and the correction receives its own RED/GREEN Evidence.

## Scope review

Compared Task 6 RED `b7a98a1972038bbd1d631f8e669959247256223b` to functional GREEN `839851d8d0d267b6ff235eae6c241c6ee38c5291`.

```text
src/store/execution-store.ts   added
src/store/sqlite-store.ts      +3 lines
other product files            unchanged
migration/schema files         unchanged
Task 7/service files           absent
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
Task 6 functional GREEN:   VERIFIED
Task 6 COMPLETE:           BLOCKED — R6-01 / R6-02
Task 7 and later:          NOT AUTHORIZED
Migration/schema change:   NOT AUTHORIZED
Microdesign change:        NOT AUTHORIZED
Real Treehouse execution:  NOT AUTHORIZED
Pi Worker dispatch:        PROHIBITED
M01 acceptance:            NOT AUTHORIZED
PR #17 merge:              NOT AUTHORIZED
```

A material change to MIS-002, SEC-E1, CAP-EXECUTION, the accepted Treehouse boundary, microdesign invariants or applicable requirements triggers Replan or renewed readiness review.

## Immediate next action

Obtain one explicit Operator decision:

1. authorize a bounded corrective RED/GREEN that amends migration v4 with `entity_sequences` and adds the Task 7 transaction-composition seam; or
2. initiate Replan to replace those accepted microdesign requirements.

Stop before either path until explicit authority is recorded.
