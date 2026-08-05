---
id: DOC-PROJECT-STATUS
title: MNFS Project Status
document_type: project_status
form: reference
authority: tracking
status: current
version: 1.8.39
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
- **Current enabler:** Issue #16 — Task 11 RED awaits explicit authority
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
Tasks 1–10:                        COMPLETE / ACCEPTED
Task 11 RED:                       NOT AUTHORIZED
Task 11 GREEN:                     NOT AUTHORIZED
Task 12 and later:                 NOT AUTHORIZED
Real Treehouse execution:         PROHIBITED until the final WSL2 proof gate
Pi Worker dispatch:               PROHIBITED
M01 acceptance:                    NOT AUTHORIZED
Automatic merge:                  NOT AUTHORIZED
PR:                               #17 DRAFT
```

## Accepted implementation baseline

```text
Task 1   execution domain                    ec6505d720d252aeef77d72192c401f460b4816
Task 2   trusted runtime primitives          ff4d345720c2a14623ec1777fc5f318c9d96d685
Task 3   SQLite transaction authority        2ed7e6d620f771dd1399421d06527911a2ffea0c
Task 4   maintenance and backup              d0172cc2c141cec6004f10caa9859bced9ac8d1c
Task 5   schema v4 and versioned Events       ea459368fe1346c2cb2d6e9d37b3bb25a0c54903
Task 6   execution persistence               b1d7f0d4b2c5a44dc8686342d8d882c8dcf3d992
Task 7   atomic lifecycle service             ff8fe7c972502ff6cc932687b7e65a16f37b6516
Task 8   independent Attempt source           aa4b9e1006d324acd8889b98b3507b020403d1d9
Task 9   production Treehouse boundary        f984dd0f94e752060bc88cff128061da23607f00
Task 10  trusted Lease action helper          e1e1231c3e4efcf45ba82e83c666547f27609c8a
```

## Task 10 delivered boundary

Task 10 provides a token-scoped durable external-action protocol:

```text
committed semantic action token
→ immutable canonical operation.json at mode 0400
→ durable STARTED before process invocation
→ exactly one bounded ProcessSpec
→ immutable raw stdout/stderr Artifacts
→ hash-linked FINISHED observation
→ semantic interpretation by Task 11
```

Production files:

```text
src/runtime/lease-action-protocol.ts
src/runtime/lease-action-runner.ts
src/runtime/lease-action-entry.ts
bin/mnfs-lease-action.mjs
package.json
```

The helper never opens MNFS SQLite, imports domain stores or decides semantic Lease state. FINISHED remains advisory.

## Task 10 primary TDD

### RED

```text
Authorization:         MNFS_AUTHORIZE_M01_TASK_10_RED plan=1.0.1 microdesign=0.6.1 task9=f984dd0f94e752060bc88cff128061da23607f00
RED head:              86b78c26f8d1dbf1a07e2b7c89e0a83e90d76ecc
Synthetic merge:       9a77855d1a5a3380e64f377ed2b14bca6dbc4608
Workflow / Job:        30983982965 / 92234461111
TypeScript:            PASS
Prior product:         196/196 PASS
Task 10:               0/11 expected failure
```

### Functional GREEN

```text
Authorization:         MNFS_AUTHORIZE_M01_TASK_10_GREEN plan=1.0.1 microdesign=0.6.1 red=86b78c26f8d1dbf1a07e2b7c89e0a83e90d76ecc
Functional head:       e336116192d1261a9f94c2b6d5293f3ad5154c33
Synthetic merge:       72e81c70daf073ab0ee3c69d09a500c62b817578
Workflow / Job:        31000870325 / 92289136416
TypeScript:            PASS
Product:               207/207 PASS
Task 10 primary:       11/11 PASS
AS-02:                 119/119 PASS
TC-01:                 78/78 PASS
Documentation:         PASS — 93 canonical IDs
```

Post-GREEN review:

```text
Review:     4863820596
Critical:   0
Important:  3
Minor:      0
Task 10:    NOT ACCEPTED
```

Accepted findings:

```text
R10-01  zero-byte stdout/stderr could not produce FINISHED
R10-02  helper PATH omitted the accepted Task 9 Git executable directory
R10-03  control/output Artifact reads allocated before byte-bound enforcement
```

## Task 10 corrective TDD

### Corrective RED

```text
Authorization:         MNFS_AUTHORIZE_M01_TASK_10_CORRECTION_RED plan=1.0.1 microdesign=0.6.1 green=e336116192d1261a9f94c2b6d5293f3ad5154c33 blockers=R10-01,R10-02,R10-03
Correction RED head:   2b9f10f4a112af68c6a982c2163b0f1a7ccedbf6
Synthetic merge:       bf4edbb8739b88a61d2e7d09efaee0a3efb9d372
Workflow / Job:        31002131377 / 92293264284
TypeScript:            PASS
Prior product:         207/207 PASS
Correction tests:      0/5 expected failure
Product total:         207 PASS / 5 FAIL / 212 total
```

The RED proved zero-byte rejection, Task 9 PATH incompatibility, oversized control-file decoding before rejection, output-limit bypass and absence of a pre-read opened-size guard.

### Corrective GREEN

Authorization:

```text
MNFS_AUTHORIZE_M01_TASK_10_CORRECTION_GREEN plan=1.0.1 microdesign=0.6.1 red=2b9f10f4a112af68c6a982c2163b0f1a7ccedbf6 blockers=R10-01,R10-02,R10-03
```

Production commits:

```text
Bounded protocol and Task 9 PATH  1884d1b881bf3780d1622639d1d39e8d63999bd8
Runner limit propagation           d8fe02810f2c635c90708b0a25b3312a99c65f4d
Primary protocol fixture migration d1394b19d42fb10678cf8c20b8f144b00ded83e1
Primary runner fixture migration   e1e1231c3e4efcf45ba82e83c666547f27609c8a
```

Accepted behavior:

- stdout/stderr `byteLength` is a non-negative safe integer, so zero-byte Artifacts remain hash-bound and replayable;
- PATH has exactly `<treehouse-bin>:<git-bin>:/usr/bin:/bin` with ordered absolute Linux-local segments;
- operation, STARTED and FINISHED are capped at 65,536 bytes;
- outputs are capped by the immutable operation's original stdout/stderr limits;
- `lstat` and opened-handle metadata size checks occur before `handle.readFile()`;
- declared output length is checked before read and SHA-256 after bounded read;
- owner, mode, no-symlink, no-hardlink, inode and post-read stability checks remain in force;
- replay reads the immutable operation first and reuses its exact limits;
- no SQLite/store/shell/exec/inherited-environment authority was introduced.

Evidence:

```text
Final functional head: e1e1231c3e4efcf45ba82e83c666547f27609c8a
Synthetic merge:       85c004d3c8dea57a47e8aaa8f14679220ab101fe
Workflow / Job:        31005192150 / 92303277926
npm ci:                PASS — 0 vulnerabilities
TypeScript:            PASS
Product:               212/212 PASS
Task 10 primary:       11/11 PASS
Task 10 corrective:    5/5 PASS
AS-02:                 119/119 PASS
TC-01:                 78/78 PASS
Documentation:         PASS — 93 canonical IDs
```

No real Treehouse process was executed. Product tests use injected process callbacks.

Final adversarial review:

```text
Review:     4864279296
Critical:   0
Important:  0
Minor:      0
Task 10:    ACCEPTED
Replan:     not required
```

Closed findings:

```text
R10-01 CLOSED
R10-02 CLOSED
R10-03 CLOSED
```

## Frozen boundaries

- canonical checkout is never Treehouse cwd;
- every Attempt owns an independent exact-base Linux-local source;
- no real Treehouse process runs before the final explicit WSL2 proof gate;
- STARTED is durable before external invocation;
- STARTED without decisive FINISHED/physical evidence never causes another GRANT invocation;
- FINISHED and process output remain advisory observations;
- helper never opens SQLite or imports domain stores;
- no semantic Lease grant/release exists before Task 11;
- no Pi process, SEC-E1 production creation, Receipt or Gate exists in M01;
- Task 11 and later require separate gates;
- PR #17 remains draft and unmerged.

## Current authorization boundary

```text
Tasks 1–10:                 COMPLETE / ACCEPTED
Task 11 RED:                NOT AUTHORIZED
Task 11 GREEN:              NOT AUTHORIZED
Task 12 and later:          NOT AUTHORIZED
Real Treehouse execution:   NOT AUTHORIZED
Pi Worker dispatch:         PROHIBITED
M01 acceptance:             NOT AUTHORIZED
PR #17 merge:               NOT AUTHORIZED
```

## Immediate next action

A separate exact Operator continuation is required for **Task 11 RED only**, bound to accepted Task 10 head `e1e1231c3e4efcf45ba82e83c666547f27609c8a`.
