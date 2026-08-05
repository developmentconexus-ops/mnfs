---
id: DOC-PROJECT-STATUS
title: MNFS Project Status
document_type: project_status
form: reference
authority: tracking
status: current
version: 1.8.38
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
- **Current enabler:** Issue #16 — Task 10 corrective GREEN awaits explicit authority
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
Tasks 1–9:                         COMPLETE / ACCEPTED
Task 10 primary RED:               OBSERVED / ACCEPTABLE
Task 10 functional GREEN:          VERIFIED — 207/207 product PASS
Task 10 post-GREEN review:         R10-01/R10-02/R10-03 IMPORTANT
Task 10 corrective RED:            OBSERVED / ACCEPTABLE
Task 10 corrective GREEN:          NOT AUTHORIZED
Task 10 accepted:                  NO
Task 11 and later:                 NOT AUTHORIZED
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
Task 9  production Treehouse boundary        f984dd0f94e752060bc88cff128061da23607f00
```

Task 9 remains the latest accepted implementation baseline. Task 10 is functionally green but not accepted.

## Task 10 boundary

Task 10 is the narrow durable external-action boundary between a semantic action token and one physical Treehouse process:

```text
committed action token
→ immutable operation.json at mode 0400
→ durable STARTED before process invocation
→ exactly one bounded ProcessSpec
→ immutable stdout/stderr Artifacts
→ hash-linked FINISHED observation
→ semantic observation by Task 11
```

Created production files:

```text
src/runtime/lease-action-protocol.ts
src/runtime/lease-action-runner.ts
src/runtime/lease-action-entry.ts
bin/mnfs-lease-action.mjs
```

Modified:

```text
package.json
```

The helper never opens MNFS SQLite. FINISHED remains advisory and cannot commit Lease state.

## Task 10 primary TDD

### RED

```text
Authorization:         MNFS_AUTHORIZE_M01_TASK_10_RED plan=1.0.1 microdesign=0.6.1 task9=f984dd0f94e752060bc88cff128061da23607f00
RED head:              86b78c26f8d1dbf1a07e2b7c89e0a83e90d76ecc
Synthetic merge:       9a77855d1a5a3380e64f377ed2b14bca6dbc4608
Workflow / Job:        30983982965 / 92234461111
npm ci:                PASS — 0 vulnerabilities
TypeScript:            PASS
Prior product tests:   196/196 PASS
Task 10 tests:         0/11 expected failure
Product total:         196 PASS / 11 FAIL / 207 total
```

Created only:

```text
tests/runtime/lease-action-protocol.test.ts
tests/runtime/lease-action-runner.test.ts
```

### Functional GREEN

```text
Authorization:         MNFS_AUTHORIZE_M01_TASK_10_GREEN plan=1.0.1 microdesign=0.6.1 red=86b78c26f8d1dbf1a07e2b7c89e0a83e90d76ecc
Functional GREEN head: e336116192d1261a9f94c2b6d5293f3ad5154c33
Synthetic merge:       72e81c70daf073ab0ee3c69d09a500c62b817578
Workflow / Job:        31000870325 / 92289136416
npm ci:                PASS — 0 vulnerabilities
TypeScript:            PASS
Product tests:         207/207 PASS
Task 10 tests:         11/11 PASS
AS-02 tests:           119/119 PASS
TC-01 tests:           78/78 PASS
Documentation:         PASS — 93 canonical IDs
```

Production commits:

```text
Lease action protocol   ee40fe11a1c8edf50ee4095a7c5b68cb9465b70c
Lease action runner     18cb5942063ec92c942ccf2615e5fb8eb9d3731c
Helper entry            023cbe0c3e241090e3fa568dd78a6e57ecce7278
Executable shim         374694b623e6f7e7b53655a8501ce406d5c0f22b
Package exposure        e336116192d1261a9f94c2b6d5293f3ad5154c33
```

No real Treehouse process was executed. Tests use an injected process function.

## Task 10 post-GREEN review

```text
Review:     4863820596
Critical:   0
Important:  3
Minor:      0
Task 10:    NOT ACCEPTED
Replan:     not required
```

Open findings:

```text
R10-01  zero-byte stdout/stderr cannot produce FINISHED
R10-02  helper PATH omits the accepted Task 9 Git executable directory
R10-03  control/output Artifact reads allocate before enforcing byte bounds
```

## Task 10 corrective RED

Authorization:

```text
MNFS_AUTHORIZE_M01_TASK_10_CORRECTION_RED plan=1.0.1 microdesign=0.6.1 green=e336116192d1261a9f94c2b6d5293f3ad5154c33 blockers=R10-01,R10-02,R10-03
```

Created only:

```text
tests/runtime/lease-action-correction.test.ts
```

Five independent correction tests define:

```text
R10-01  zero-byte stdout and stderr produce a re-openable FINISHED chain
R10-02  accept exactly <treehouse-bin>:<git-bin>:/usr/bin:/bin
R10-02  reject missing, extra, reordered or mounted Git PATH segments
R10-03  reject operation control files above 64 KiB by metadata before JSON decode
R10-03  reject output metadata above the original operation limit
R10-03  source-level size guard precedes handle.readFile allocation
```

Observed evidence:

```text
Correction RED head:   2b9f10f4a112af68c6a982c2163b0f1a7ccedbf6
Synthetic merge:       bf4edbb8739b88a61d2e7d09efaee0a3efb9d372
Workflow / Job:        31002131377 / 92293264284
npm ci:                PASS — 0 vulnerabilities
TypeScript:            PASS
Prior product tests:   207/207 PASS
Correction tests:      0/5 expected failure
Product total:         207 PASS / 5 FAIL / 212 total
```

Observed failure signatures:

```text
R10-01  output byte length must be a positive safe integer
R10-02  accepted Task 9 PATH is rejected
R10-03  oversized operation reaches JSON decoding instead of a byte-limit error
R10-03  output larger than the supplied operation limit is accepted
R10-03  no opened-size guard exists before handle.readFile()
```

Mechanical scope comparison from `b19317a2da22fbaf258aba65ff691a4a8f8685ae` to the corrective RED head contains only the correction test file. No production, package, service, schema, real Treehouse or Pi behavior changed.

The root `verify` command stopped at the deliberate product RED. Latest accepted AS-02, TC-01 and documentation evidence remains the functional GREEN result above.

## Operator authority chain — current task

```text
MNFS_AUTHORIZE_M01_TASK_10_RED plan=1.0.1 microdesign=0.6.1 task9=f984dd0f94e752060bc88cff128061da23607f00
MNFS_AUTHORIZE_M01_TASK_10_GREEN plan=1.0.1 microdesign=0.6.1 red=86b78c26f8d1dbf1a07e2b7c89e0a83e90d76ecc
MNFS_AUTHORIZE_M01_TASK_10_CORRECTION_RED plan=1.0.1 microdesign=0.6.1 green=e336116192d1261a9f94c2b6d5293f3ad5154c33 blockers=R10-01,R10-02,R10-03
```

Earlier Task 1–9 authorities remain recorded in PR #17 and Git history.

## Frozen boundaries

- canonical checkout is never Treehouse cwd;
- every Attempt owns an independent exact-base Linux-local source;
- Task 10 tests execute no real Treehouse process;
- STARTED must be durable before external invocation;
- an existing STARTED without decisive FINISHED/physical evidence cannot cause another GRANT invocation;
- FINISHED and process output remain advisory observations;
- helper never opens SQLite or imports domain stores;
- no semantic Lease grant/release exists before Task 11;
- no Pi process, SEC-E1 production creation, Receipt or Gate exists in M01;
- Task 11 and later require separate gates;
- PR #17 remains draft and unmerged.

## Current authorization boundary

```text
Tasks 1–9:                  COMPLETE / ACCEPTED
Task 10 primary RED:        OBSERVED / ACCEPTABLE
Task 10 functional GREEN:   VERIFIED
Task 10 corrective RED:     OBSERVED / ACCEPTABLE
R10-01:                     OPEN — IMPORTANT
R10-02:                     OPEN — IMPORTANT
R10-03:                     OPEN — IMPORTANT
Task 10 corrective GREEN:   NOT AUTHORIZED
Task 10 accepted:           NO
Task 11 and later:          NOT AUTHORIZED
Real Treehouse execution:   NOT AUTHORIZED
Pi Worker dispatch:         PROHIBITED
M01 acceptance:             NOT AUTHORIZED
PR #17 merge:               NOT AUTHORIZED
```

## Immediate next action

A separate exact Operator continuation is required for **Task 10 corrective GREEN only**, bound to corrective RED head `2b9f10f4a112af68c6a982c2163b0f1a7ccedbf6` and blockers `R10-01,R10-02,R10-03`.
