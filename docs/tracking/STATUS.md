---
id: DOC-PROJECT-STATUS
title: MNFS Project Status
document_type: project_status
form: reference
authority: tracking
status: current
version: 1.8.23
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
- **Current enabler:** Issue #16 — Task 7 corrective RED observed; corrective GREEN awaits explicit authority
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
CAP-EXECUTION:                    ACCEPTED — version 0.1.0
MIS-002 contract:                 APPROVED — revision 5 / exact hash
TC-01 canonical Evidence:         ACCEPT — 15/15 PASS, cleanup COMPLETED
M01 microdesign:                  ACCEPTED — version 0.6.1
Implementation plan:              CURRENT / APPROVED — version 1.0.1
Implementation started:           YES — bounded by task gates
Task 1:                           COMPLETE
Task 2:                           COMPLETE
Task 3:                           COMPLETE
Task 4:                           COMPLETE
Task 5:                           COMPLETE
Task 6:                           COMPLETE
Task 7 primary RED:               OBSERVED / ACCEPTABLE
Task 7 functional GREEN:          VERIFIED — 155/155 product PASS
Task 7 post-GREEN review:         3 IMPORTANT findings
Task 7 corrective RED:            OBSERVED / ACCEPTABLE — 4 expected failures
Task 7 corrective GREEN:          NOT AUTHORIZED
Real Treehouse execution:         PROHIBITED until the final WSL2 proof gate
Pi Worker dispatch:               PROHIBITED
Automatic merge:                  NOT AUTHORIZED
PR:                               #17 DRAFT
```

## What Task 7 adds to the harness

Before Task 7, MNFS possessed durable execution entities and persistence primitives but no semantic lifecycle coordinator.

Task 7 introduces `ExecutionService`, which governs:

```text
approved contract + valid qualified target + exact Git base
→ atomic Write Track + A01 + matching Events

current Worker Run
→ atomic terminalization + replacement Run + matching Events

current Attempt + safe resource observations
→ atomic supersession + next Attempt + matching Events

empty guarded Track
→ explicit abandonment without implicit Lease release
```

This moves MNFS from “a database that can store execution rows” toward a deterministic control plane that decides when execution state may advance.

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
MNFS_AUTHORIZE_M01_TASK_7_GREEN plan=1.0.1 microdesign=0.6.1 red=2fe2d87e1bc6f690c2cd556f1b0278420b8e3dda
MNFS_AUTHORIZE_M01_TASK_7_CORRECTION_RED plan=1.0.1 microdesign=0.6.1 green=656d9a431957b74b9018020b829621f5a07a53eb blockers=R7-01,R7-02,R7-03
```

## Completed implementation summary

### Task 1 — execution domain

Established canonical parent-relative identities, immutable entity models, fail-closed transition tables and the accepted M01 error vocabulary.

### Task 2 — trusted runtime primitives

Established shell-free bounded process execution, immutable crash-durable Artifact publication and Linux process identity using boot ID, PID and start ticks.

### Task 3 — shared SQLite transaction authority

Established one shared `BEGIN IMMEDIATE` transaction authority with bounded busy retry before user code only and exact rollback semantics.

### Task 4 — maintenance and backup

Established durable maintenance locking, consistent backup verification and supported-schema readiness gates.

### Task 5 — schema v4 and versioned Events

Established migration v4, versioned Event registry, execution tables, current-row indexes, composite ancestry and downgrade fencing.

### Task 6 — execution persistence

Established focused execution persistence, monotonic global sequences, parent-relative ordinals, strict codecs, idempotency, optimistic concurrency and the bounded atomic composition seam.

### Task 7 — execution lifecycle service

Created:

```text
src/services/execution-service.ts
```

Modified:

```text
src/store/sqlite-store.ts
```

Task 7 functional implementation provides:

- exact latest approved-contract and qualified-target validation;
- non-empty Feature requirement allocation validation;
- exact Git commit and object-format binding through an injected read-only inspector;
- canonical same-input Track opening replay;
- atomic Track + A01 + two matching Events;
- atomic Worker Run opening and replacement;
- Attempt supersession with resource-disposition guards;
- explicit Track abandonment without implicit resource release;
- focused current-entity lookups and atomic mutation methods on the existing SQLite authority;
- no Task 8 source adapter, real Git command, filesystem operation, Treehouse invocation or Pi behavior.

## Task 7 primary TDD

### RED

```text
RED head:                 2fe2d87e1bc6f690c2cd556f1b0278420b8e3dda
Synthetic merge:          c1d6f79c73cb4aeb70a4de56d82ac64e8547f2c1
Workflow/job:              30969751509 / 92191310194
TypeScript:                PASS
Prior product tests:       148/148 PASS
Task 7 tests:              0/7 expected failure
```

### Functional GREEN

```text
Functional GREEN head:    656d9a431957b74b9018020b829621f5a07a53eb
Synthetic merge:          64f583b55b1a1968a14d4762825f410b745933ba
Workflow/job:              30970946398 / 92194909273
TypeScript:                PASS
Product tests:             155/155 PASS
Task 7 tests:              7/7 PASS
AS-02 tests:               119/119 PASS
TC-01 tests:               78/78 PASS
Documentation validation: PASS — 93 canonical IDs
```

The first functional commit `f08c11e0dad16e775dd356811f2593fd12517037` failed typecheck on three untyped atomic-session callbacks. Commit `656d9a431957b74b9018020b829621f5a07a53eb` corrected only those typings and produced the complete GREEN result above.

## Task 7 post-GREEN review

Scope review passed: no Task 8 adapter, real Git/filesystem behavior, Treehouse, Pi, schema migration, second SQLite connection or merge behavior was introduced.

The adversarial lifecycle review found:

```text
R7-01  an ABANDONED Track could receive a new Worker Run
R7-02  terminal Run replacement erased process identity and start timing
R7-03  replacement Run and Attempt supersession could continue after Replan
```

Classification:

```text
Critical:  0
Important: 3
Minor:     0
Replan:    not required
```

## Task 7 corrective RED

Created only:

```text
tests/services/execution-service-correction.test.ts
```

The four tests independently prove:

1. `R7-01`: opening a Run after Track abandonment must fail;
2. `R7-02`: terminalization must preserve observed Linux process identity and start time;
3. `R7-03a`: Run replacement after a newer approved contract must fail;
4. `R7-03b`: Attempt supersession after a newer approved contract must fail.

Evidence:

```text
Correction RED head:      f976f254677c14a13371769269914e86cf96b539
Synthetic merge:          f562ba0355ba2efa609d6dc105455b371a40b21f
Workflow/job:              30971768663 / 92197460024
TypeScript:                PASS
Prior product tests:       155/155 PASS
Correction tests:          0/4 expected failure
Product total:             155 PASS / 4 FAIL
```

Observed failure signatures:

```text
R7-01  missing expected WORKER_RUN_CONFLICT
R7-02  actual processIdentity undefined
R7-03a missing expected EXECUTION_CONTRACT_CONFLICT
R7-03b missing expected EXECUTION_CONTRACT_CONFLICT
```

No production file changed in the corrective RED.

## Frozen boundaries

The accepted design invariants remain unchanged:

- canonical checkout is never Treehouse cwd;
- every Attempt owns an independent exact-base Linux-local source;
- Treehouse uses controlled HOME/XDG/config/hooks and the accepted candidate;
- state mutation and matching payload-versioned Event commit atomically;
- relational keys prove exact Track → Attempt → Run/Lease → Claim ancestry;
- action STARTED is durable before one external invocation;
- inconclusive grant never automatically repeats `treehouse get`;
- dirty, ambiguous and unclassified work is preserved;
- plain Recovery performs no domain or resource mutation;
- M01 creates Claim `OPEN` only and contains no Pi dispatch, Receipt or Gate.

## Current authorization boundary

```text
Tasks 1–6:                  COMPLETE
Task 7 primary RED:         OBSERVED / ACCEPTABLE
Task 7 functional GREEN:    VERIFIED
Task 7 corrective RED:      OBSERVED / ACCEPTABLE
Task 7 corrective GREEN:    NOT AUTHORIZED
Task 8 and later:           NOT AUTHORIZED
Real Treehouse execution:   NOT AUTHORIZED
Pi Worker dispatch:         PROHIBITED
M01 acceptance:             NOT AUTHORIZED
PR #17 merge:               NOT AUTHORIZED
```

A material change to MIS-002, SEC-E1, CAP-EXECUTION, the accepted Treehouse boundary, microdesign invariants or applicable requirements triggers Replan or renewed readiness review.

## Immediate next action

Request or provide an explicit continuation for **Task 7 corrective GREEN only**, bound to corrective RED head `f976f254677c14a13371769269914e86cf96b539` and findings `R7-01`, `R7-02`, `R7-03`.
