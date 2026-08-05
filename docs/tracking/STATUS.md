---
id: DOC-PROJECT-STATUS
title: MNFS Project Status
document_type: project_status
form: reference
authority: tracking
status: current
version: 1.8.36
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
- **Current enabler:** Issue #16 — Task 10 GREEN awaits explicit authority
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
Task 10 RED:                       OBSERVED / ACCEPTABLE
Task 10 GREEN:                     NOT AUTHORIZED
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

Task 9 final accepted evidence:

```text
Functional head:      f984dd0f94e752060bc88cff128061da23607f00
Tracking head:        c535f6997e75ac4a56b9432800dde5ef9c4fcac9
Tracking merge:       1c54cf0e71258a06b776b531b512a636897178bd
Workflow / Job:       30982541454 / 92229888186
Product:              196/196 PASS
AS-02:                119/119 PASS
TC-01:                78/78 PASS
Documentation:        PASS — 93 canonical IDs
Review:               4861709427
Findings:             0 Critical / 0 Important / 0 Minor
```

## What Task 10 adds to the harness

Task 10 is the narrow durable external-action boundary between semantic Lease intent and one physical Treehouse invocation:

```text
committed action token
→ immutable token-scoped operation
→ durable STARTED before spawn
→ exactly one bounded external command
→ immutable raw stdout/stderr Artifacts
→ hash-linked FINISHED observation
→ semantic observation by Task 11
```

Task 10 does not own semantic Lease state and must never open MNFS SQLite. Its result remains advisory until Task 11 observes helper, Treehouse, Git and filesystem state.

Frozen production targets remain:

```text
src/runtime/lease-action-protocol.ts
src/runtime/lease-action-runner.ts
src/runtime/lease-action-entry.ts
bin/mnfs-lease-action.mjs
package.json
```

None of those production files exists in the Task 10 RED.

## Task 10 RED

Authorization:

```text
MNFS_AUTHORIZE_M01_TASK_10_RED plan=1.0.1 microdesign=0.6.1 task9=f984dd0f94e752060bc88cff128061da23607f00
```

Preflight proved:

```text
PR #17:        open / draft / unmerged
Tracking head: c535f6997e75ac4a56b9432800dde5ef9c4fcac9
Task 9 head:   f984dd0f94e752060bc88cff128061da23607f00
Post-Task 9:   one tracking-only commit changing docs/tracking/STATUS.md
```

Created only:

```text
tests/runtime/lease-action-protocol.test.ts
tests/runtime/lease-action-runner.test.ts
```

Protocol RED covers five independent contracts:

```text
1. canonical immutable operation publication at mode 0400 and exact replay
2. canonical SHA-256 insensitive to object-key order but binding argv order and env values
3. only reviewed GRANT/RELEASE argv and the owned environment-key shape
4. containment, fatal UTF-8, one canonical JSON value, exact keys, mode and no symlink
5. hash-linked STARTED → FINISHED chain with process and output references
```

Runner RED covers six independent contracts:

```text
1. STARTED is durably readable before the external process callback
2. raw stdout/stderr bytes are immutable bounded Artifacts referenced by FINISHED
3. completed replay performs zero additional external calls
4. existing STARTED without FINISHED is LEASE_ACTION_INCONCLUSIVE and never re-invokes
5. token/hash/mode drift blocks before STARTED and before external invocation
6. runner/entry/bin contain no SQLite, store, shell, exec or inherited-env fallback
```

Observed RED evidence:

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

Expected failure signatures:

```text
10 behavioral tests:
  Task 10 Lease action protocol is not implemented
  dist/src/runtime/lease-action-protocol.js absent

1 static boundary test:
  src/runtime/lease-action-runner.ts absent
```

The root `verify` command stopped at the deliberate product RED. AS-02, TC-01 and documentation were not re-executed at this head; their latest accepted evidence remains the Task 9 tracking gate above.

Mechanical scope comparison from `c535f6997e75ac4a56b9432800dde5ef9c4fcac9` to the RED head contains only the two authorized test files. No production, package, schema, service, Treehouse-real or Pi behavior changed.

## Frozen boundaries

- canonical checkout is never Treehouse cwd;
- every Attempt owns an independent exact-base Linux-local source;
- Task 10 RED executes no Treehouse process, real or simulated;
- the future helper may execute exactly one operation from one immutable token-scoped file;
- STARTED must be durable before external invocation;
- FINISHED and process output are advisory observations, not semantic completion;
- an existing STARTED without decisive FINISHED/physical evidence cannot cause another grant invocation;
- the helper never opens MNFS SQLite or imports domain stores;
- no semantic Lease grant/release exists before Task 11;
- no Pi process, SEC-E1 production creation, Receipt or Gate exists in M01;
- PR #17 remains draft and unmerged.

## Current authorization boundary

```text
Tasks 1–9:                  COMPLETE / ACCEPTED
Task 10 RED:                OBSERVED / ACCEPTABLE
Task 10 GREEN:              NOT AUTHORIZED
Task 10 accepted:           NO
Task 11 and later:          NOT AUTHORIZED
Real Treehouse execution:   NOT AUTHORIZED
Pi Worker dispatch:         PROHIBITED
M01 acceptance:             NOT AUTHORIZED
PR #17 merge:               NOT AUTHORIZED
```

## Immediate next action

A separate exact Operator continuation is required for **Task 10 GREEN only**, bound to RED head `86b78c26f8d1dbf1a07e2b7c89e0a83e90d76ecc`.
