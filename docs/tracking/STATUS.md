---
id: DOC-PROJECT-STATUS
title: MNFS Project Status
document_type: project_status
form: reference
authority: tracking
status: current
version: 1.8.37
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
- **Current enabler:** Issue #16 — Task 10 corrective RED awaits explicit authority
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
Task 10 corrective RED:            NOT AUTHORIZED
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

Authorization:

```text
MNFS_AUTHORIZE_M01_TASK_10_RED plan=1.0.1 microdesign=0.6.1 task9=f984dd0f94e752060bc88cff128061da23607f00
```

Created only:

```text
tests/runtime/lease-action-protocol.test.ts
tests/runtime/lease-action-runner.test.ts
```

Evidence:

```text
RED head:              86b78c26f8d1dbf1a07e2b7c89e0a83e90d76ecc
Synthetic merge:       9a77855d1a5a3380e64f377ed2b14bca6dbc4608
Workflow / Job:        30983982965 / 92234461111
npm ci:                PASS — 0 vulnerabilities
TypeScript:            PASS
Prior product tests:   196/196 PASS
Task 10 tests:         0/11 expected failure
Product total:         196 PASS / 11 FAIL / 207 total
```

The ten behavioral tests failed because `lease-action-protocol.js` was absent. The static boundary test failed because the production helper files were absent.

### Functional GREEN

Authorization:

```text
MNFS_AUTHORIZE_M01_TASK_10_GREEN plan=1.0.1 microdesign=0.6.1 red=86b78c26f8d1dbf1a07e2b7c89e0a83e90d76ecc
```

Production commits:

```text
Lease action protocol   ee40fe11a1c8edf50ee4095a7c5b68cb9465b70c
Lease action runner     18cb5942063ec92c942ccf2615e5fb8eb9d3731c
Helper entry            023cbe0c3e241090e3fa568dd78a6e57ecce7278
Executable shim         374694b623e6f7e7b53655a8501ce406d5c0f22b
Package exposure        e336116192d1261a9f94c2b6d5293f3ad5154c33
```

Delivered behavior:

- canonical JSON and SHA-256 bind operation argv, cwd, env, limits and Artifact destinations;
- operation is published/replayed at mode `0400` with owner, regular-file, hardlink and symlink checks;
- only exact GRANT and RELEASE argv shapes are accepted;
- environment keys are allowlisted and inherited environment is not used;
- STARTED is published exclusively and fsynced before the process callback;
- process identity binds boot ID, PID and start ticks;
- raw stdout/stderr bytes are published below the token root;
- FINISHED binds operation hash, STARTED hash, runner identity, process metadata and output refs;
- completed replay performs zero additional process calls;
- STARTED without FINISHED returns `LEASE_ACTION_INCONCLUSIVE` and never invokes again;
- entry/bin contain no SQLite, store, shell, exec or host fallback authority.

Evidence:

```text
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

No real Treehouse process was executed. Task 10 tests use an injected process function.

## Task 10 post-GREEN review

Formal review:

```text
Review:     4863820596
Critical:   0
Important:  3
Minor:      0
Task 10:    NOT ACCEPTED
Replan:     not required
```

### R10-01 — empty stdout/stderr cannot produce FINISHED

`LeaseActionOutputRef.byteLength` is validated as a positive integer. A valid external process may produce an empty stream. After the process executes and a zero-byte Artifact is written, FINISHED publication fails and the durable state remains STARTED. Every replay is then inconclusive.

Required proof: empty stdout, empty stderr and both-empty results must publish FINISHED and replay without another process call.

### R10-02 — helper PATH differs from the accepted Task 9 environment

Task 9 builds:

```text
<treehouse-bin>:<git-bin>:/usr/bin:/bin
```

Task 10 currently accepts only:

```text
<treehouse-bin>:/usr/bin:/bin
```

The helper cannot consume the exact environment already accepted by the Treehouse boundary when the two executables resolve to different directories.

Required proof: Task 10 accepts and hash-binds the exact Task 9 PATH shape while rejecting extra, mounted, relative or reordered directories.

### R10-03 — Artifact reads allocate before enforcing bounds

The protocol calls `readFile()` before checking any maximum size. Operation, STARTED, FINISHED and raw output files can therefore allocate unbounded memory before structural or referenced-length validation.

Required proof: metadata size is checked before every read; output size is compared to the FINISHED reference and operation limits before allocation; inode/time stability checks remain after the read.

## Operator authority chain — current task

```text
MNFS_AUTHORIZE_M01_TASK_10_RED plan=1.0.1 microdesign=0.6.1 task9=f984dd0f94e752060bc88cff128061da23607f00
MNFS_AUTHORIZE_M01_TASK_10_GREEN plan=1.0.1 microdesign=0.6.1 red=86b78c26f8d1dbf1a07e2b7c89e0a83e90d76ecc
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
R10-01:                     OPEN — IMPORTANT
R10-02:                     OPEN — IMPORTANT
R10-03:                     OPEN — IMPORTANT
Task 10 corrective RED:     NOT AUTHORIZED
Task 10 accepted:           NO
Task 11 and later:          NOT AUTHORIZED
Real Treehouse execution:   NOT AUTHORIZED
Pi Worker dispatch:         PROHIBITED
M01 acceptance:             NOT AUTHORIZED
PR #17 merge:               NOT AUTHORIZED
```

## Immediate next action

A separate exact Operator continuation is required for **Task 10 corrective RED only**, bound to functional GREEN head `e336116192d1261a9f94c2b6d5293f3ad5154c33` and blockers `R10-01,R10-02,R10-03`.
