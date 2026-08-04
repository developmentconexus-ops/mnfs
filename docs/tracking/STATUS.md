---
id: DOC-PROJECT-STATUS
title: MNFS Project Status
document_type: project_status
form: reference
authority: tracking
status: current
version: 1.8.9
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
- **Current enabler:** Issue #16 — explicit authorization for M01 implementation Task 2 RED
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
Research coverage:             PUBLISHED
CAP-EXECUTION:                 ACCEPTED — version 0.1.0
MIS-002 contract:              APPROVED — revision 5 / exact hash
TC-01 canonical Evidence:      ACCEPT — 15/15 PASS, cleanup COMPLETED
M01 microdesign:               ACCEPTED — version 0.6.1
Implementation plan:           CURRENT / APPROVED — version 1.0.1
Implementation started:        YES — bounded by task gates
Task 1 RED:                    OBSERVED / EXPECTED FAILURE
Task 1 GREEN:                  COMPLETE
Task 1 product tests:          4/4 PASS
Complete product suite:        99/99 PASS
Task 2 RED:                    NOT AUTHORIZED
Real Treehouse execution:      PROHIBITED until the final WSL2 proof gate
Pi Worker dispatch:            PROHIBITED
Automatic merge:               NOT AUTHORIZED
Current human gate:            explicit authorization for Task 2 RED only
PR:                            #17 DRAFT
```

## Operator authority chain

```text
D-007  microdesign 0.6.1 approved
D-008  implementation plan 1.0.1 approved
MNFS_AUTHORIZE_M01_TASK_1_RED plan=1.0.1 microdesign=0.6.1
MNFS_AUTHORIZE_M01_TASK_1_GREEN plan=1.0.1 microdesign=0.6.1 red=65bd4e2c410d4d1566f5fef0da33f29e35657489
```

Task 1 authority did not extend to Task 2, SQLite changes, process execution, Treehouse, Pi or merge.

## Task 1 implementation

Created:

```text
src/execution/ids.ts
src/execution/model.ts
src/execution/transitions.ts
```

Modified:

```text
src/domain/errors.ts
```

Task 1 established:

- canonical parent-relative IDs for Write Track, Attempt, Worker Run and Claim;
- canonical Lease IDs;
- positive safe-integer and canonical-padding validation;
- explicit parent/ancestry validation at the identity boundary;
- immutable M01 entity/status interfaces;
- fail-closed Write Track, Attempt, source, Worker Run and Lease transition tables;
- the complete accepted M01 typed-error vocabulary.

It introduced no filesystem, subprocess, Git, SQLite, Treehouse, Pi or network behavior.

## Task 1 verification

```text
RED head:                 65bd4e2c410d4d1566f5fef0da33f29e35657489
RED synthetic merge:      684d82f1508459bb649c7a115032eb93650f39d2
RED workflow/job:          30936460300 / 92083735544
RED result:                TypeScript PASS; legacy 95/95 PASS; M01 0/4 expected failure

GREEN head:               ec6505d7207d252aeef77d72192c401f460b4816
GREEN synthetic merge:    cc8f99ce5773665fdbef3e205cceccadc74398df
GREEN workflow/job:        30937517215 / 92087281731
GREEN result:              PASS
Product tests:             99/99
AS-02 tests:               119/119
TC-01 tests:               78/78
Documentation validation:  93 canonical IDs
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
Task 2 RED:                NOT AUTHORIZED
Later tasks:               NOT AUTHORIZED
Real Treehouse execution:  NOT AUTHORIZED
Pi Worker dispatch:        PROHIBITED
PR #17 merge:              NOT AUTHORIZED
```

A material change to MIS-002, SEC-E1, CAP-EXECUTION, the accepted Treehouse boundary, microdesign invariants or applicable requirements triggers Replan or renewed readiness review.

## Immediate next action

Request or provide an explicit continuation for **Task 2 RED only**. Stop before implementing the process runner, durable Artifact writer or Linux process identity unless that continuation is granted.
