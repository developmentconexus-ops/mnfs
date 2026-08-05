---
id: DOC-PROJECT-STATUS
title: MNFS Project Status
document_type: project_status
form: reference
authority: tracking
status: current
version: 1.8.32
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
- **Current enabler:** Issue #16 — Task 9 GREEN awaits explicit authority
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
Tasks 1–8:                         COMPLETE / ACCEPTED
Task 9 RED:                        OBSERVED / ACCEPTABLE — 8 expected failures
Task 9 GREEN:                      NOT AUTHORIZED
Task 10 and later:                 NOT AUTHORIZED
Real Treehouse execution:         PROHIBITED until the final WSL2 proof gate
Pi Worker dispatch:               PROHIBITED
M01 acceptance:                    NOT AUTHORIZED
Automatic merge:                  NOT AUTHORIZED
PR:                               #17 DRAFT
```

## Accepted implementation baseline

```text
Task 1  execution domain                    ec6505d720d252aeef77d72192c401f460b4816
Task 2  trusted runtime primitives          ff4d345720c2a14623ec1777fc5f318c9d96d685
Task 3  SQLite transaction authority        2ed7e6d620f771dd1399421d06527911a2ffea0c
Task 4  maintenance and backup              d0172cc2c141cec6004f10caa9859bced9ac8d1c
Task 5  schema v4 and versioned Events       ea459368fe1346c2cb2d6e9d37b3bb25a0c54903
Task 6  execution persistence               b1d7f0d4b2c5a44dc8686342d8d882c8dcf3d992
Task 7  atomic lifecycle service             ff8fe7c972502ff6cc932687b7e65a16f37b6516
Task 8  independent Attempt source           aa4b9e1006d324acd8889b98b3507b020403d1d9
```

Task 8 final verification:

```text
Product:          180/180 PASS
AS-02:            119/119 PASS
TC-01:            78/78 PASS
Documentation:    PASS — 93 canonical IDs
Review:           4861226705
Findings:         0 Critical / 0 Important / 0 Minor
```

## What Task 9 adds to the harness

Task 9 defines the production boundary between an accepted Attempt-owned `READY` source and Treehouse:

```text
validated independent source
→ fresh candidate/provenance observation
→ exact acquire/status/release command
→ strict untrusted output observation
```

Accepted protected commands:

```text
treehouse get --lease --lease-holder <holder> --json
treehouse status --json
treehouse return <path> --if-lease-id <id> --if-lease-holder <holder>
```

Task 9 does not grant or release a semantic Lease. It returns physical observations to the later Lease action/service protocol. Release stdout/stderr remains advisory until fresh Treehouse, Git and filesystem observation.

## Task 9 RED contract

Created only:

```text
tests/adapters/treehouse.test.ts
```

No production file changed and `src/adapters/treehouse.ts` remains absent.

The eight tests define:

1. exact acquire/status/release argv, bounded process shape, Attempt-owned source cwd and controlled HOME/XDG/pool/hooks environment;
2. strict acquisition JSON with fatal UTF-8, exactly one JSON value, expected holder/identity and Linux-contained path;
3. strict status arrays with consistent leased/available fields and no duplicate path or external Lease ID;
4. candidate and source freshness before every protected operation;
5. exact executable bytes, semantic version `2.1.1` with optional lowercase raw `v`, and accepted capabilities;
6. Git `2.54.0`, Node `v24.18.0`, Ubuntu `24.04`, canonical WSL2 kernel and command-shape drift fencing;
7. rejection of canonical-checkout cwd, `/mnt`, symlinked, newline-bearing or overlapping runtime paths;
8. static prohibition of `--force`, destroy, prune, shell execution, `exec`, inherited environment spread, stderr-state inference and canonical-checkout cwd.

Accepted command-shape identity:

```text
sha256:f2077cfd037cbaefdcfc94385a0cfeb7e1647ef294ca8ceee3cd61a1b109dc84
```

## Task 9 RED evidence

The first test draft at `700ec33c8546ac326e782ee3af86347db280e0d6` was not an acceptable RED because two local literal-property reads failed TypeScript compilation. It changed only the Task 9 test and was superseded by a test-only typing correction.

Corrected evidence:

```text
Task 9 RED head:             a48bf4dba68984ce24a32575f982bae98e1cafc6
Synthetic merge:             d2936833b1a6b7ed040c207322305ad3848f5b7e
Workflow / Job:              30978752678 / 92218451668
TypeScript:                  PASS
Prior product tests:         180/180 PASS
Task 9 tests:                0/8 expected failure
Product total:               180 PASS / 8 FAIL
```

Observed failure signature:

```text
7 dynamic contracts:
Task 9 TreehouseAdapter is not implemented:
Cannot find dist/src/adapters/treehouse.js

1 static contract:
Task 9 production adapter is absent
```

The failure occurs before any fixture can invoke a Treehouse protected operation. The runner is fully simulated; no real Treehouse command, Lease, worktree or managed resource was created.

The root `verify` command stopped at the deliberate product RED. AS-02, TC-01 and documentation were therefore not re-executed at the RED head; their latest accepted evidence remains the Task 8 final result above.

## Operator authority chain — current task

```text
MNFS_AUTHORIZE_M01_TASK_8_CORRECTION_GREEN plan=1.0.1 microdesign=0.6.1 red=d2cfc16832f1db9245e49f238458fe505b3a86e6 blockers=R8-01,R8-02,R8-03,R8-04
MNFS_AUTHORIZE_M01_TASK_9_RED plan=1.0.1 microdesign=0.6.1 task8=aa4b9e1006d324acd8889b98b3507b020403d1d9
```

Earlier Task 1–8 authorities remain recorded in PR #17 and Git history.

## Frozen boundaries

- canonical checkout is never Treehouse cwd;
- every Attempt owns an independent exact-base Linux-local source;
- Task 9 tests use simulated processes only;
- no real Treehouse command runs before the final explicit WSL2 acceptance task;
- no semantic Lease grant/release or trusted helper exists before Tasks 10–11;
- no Pi process, SEC-E1 production creation, Receipt or Gate exists in M01;
- Task 10 and later require separate gates;
- PR #17 remains draft and unmerged.

## Current authorization boundary

```text
Tasks 1–8:                  COMPLETE / ACCEPTED
Task 9 RED:                 OBSERVED / ACCEPTABLE
Task 9 GREEN:               NOT AUTHORIZED
Task 10 and later:          NOT AUTHORIZED
Real Treehouse execution:   NOT AUTHORIZED
Pi Worker dispatch:         PROHIBITED
M01 acceptance:             NOT AUTHORIZED
PR #17 merge:               NOT AUTHORIZED
```

## Immediate next action

Request or provide an explicit continuation for **Task 9 GREEN only**, bound to RED head `a48bf4dba68984ce24a32575f982bae98e1cafc6`.
