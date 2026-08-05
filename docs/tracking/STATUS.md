---
id: DOC-PROJECT-STATUS
title: MNFS Project Status
document_type: project_status
form: reference
authority: tracking
status: current
version: 1.8.40
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
- **Current enabler:** Issue #16 — resolve the post-acceptance Task 10 publication RED before Task 11 GREEN
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
CAP-EXECUTION:                         ACCEPTED — version 0.1.0
MIS-002 contract:                      APPROVED — revision 5 / exact hash
TC-01 canonical Evidence:              ACCEPT — 15/15 PASS, cleanup COMPLETED
M01 microdesign:                       ACCEPTED — version 0.6.1
Implementation plan:                   CURRENT / APPROVED — version 1.0.1
Tasks 1–10 accepted baseline:           COMPLETE / ACCEPTED
Task 10 publication replay RED:         OBSERVED / OPEN — concurrent post-acceptance test
Task 10 publication correction GREEN:   NOT AUTHORIZED
Task 11 RED:                            OBSERVED / ACCEPTABLE IN ISOLATION
Task 11 GREEN:                          NOT AUTHORIZED / BLOCKED
Task 12 and later:                      NOT AUTHORIZED
Real Treehouse execution:              PROHIBITED until the final WSL2 proof gate
Pi Worker dispatch:                    PROHIBITED
M01 acceptance:                        NOT AUTHORIZED
Automatic merge:                       NOT AUTHORIZED
PR:                                    #17 DRAFT
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

Latest fully green accepted baseline evidence:

```text
Tracking head:       443f7824a5cbc61d3bcd738fe944a888a7b9eca5
Synthetic merge:     07ad5477992c30e376d4785f19a15a0a8ade4a2d
Workflow / Job:      31005521175 / 92304353222
Product:             212/212 PASS
AS-02:               119/119 PASS
TC-01:               78/78 PASS
Documentation:       PASS — 93 canonical IDs
Task 10 review:      4864279296 — 0 Critical / 0 Important / 0 Minor
```

## Concurrent post-acceptance Task 10 publication RED

After the Task 11 preflight and before the first Task 11 test commit, branch commit:

```text
aebfddde7af27aeb9122a760f45475aceab6babe
test: cover bounded Lease action publication replay
```

added:

```text
tests/runtime/lease-action-publication-correction.test.ts
```

This commit was not authored by the Task 11 gate and was not silently absorbed into its scope. It defines one additional Task 10 behavior:

```text
publishLeaseActionOperation replay
→ inspect an existing operation through the bounded protocol reader
→ reject an oversized existing control file by byte-limit classification
→ do not delegate immutable replay to the generic unbounded read path
```

Observed failure:

```text
Expected: bounded byte-limit rejection
Actual:   Artifact already exists with different bytes
Cause:    publishLeaseActionOperation still delegates replay through writeDurableFile
```

This is a separate post-acceptance RED. No Task 10 production correction is authorized in the Task 11 RED gate.

## Task 11 boundary

Task 11 owns semantic Lease grant and release Intent–Action–Observation:

```text
grant intent
→ exact source/candidate observation
→ action-token CAS claim
→ trusted helper
→ fresh helper/Treehouse/Git observation
→ ACTIVE, DIVERGED or inconclusive

release preflight and fences
→ ACTIVE → RELEASE_PENDING
→ exact conditional helper action
→ fresh helper/Treehouse/Git/filesystem observation
→ RELEASED, fenced retry or DIVERGED
```

The service is the only component allowed to prepare Treehouse operations and interpret Task 10 helper observations semantically. Plain Recovery remains read-only.

## Task 11 RED

Authorization:

```text
MNFS_AUTHORIZE_M01_TASK_11_RED plan=1.0.1 microdesign=0.6.1 task10=e1e1231c3e4efcf45ba82e83c666547f27609c8a
```

Preflight proved:

```text
PR #17:          open / draft / unmerged / mergeable
Tracking head:   443f7824a5cbc61d3bcd738fe944a888a7b9eca5
Task 10 head:    e1e1231c3e4efcf45ba82e83c666547f27609c8a
Post-Task 10:    one tracking-only commit changing docs/tracking/STATUS.md
Authorization:   PR comment 5191741728
```

Authorized Task 11 files created:

```text
tests/services/lease-service-grant.test.ts
tests/services/lease-service-release.test.ts
```

Commits:

```text
Grant matrix:    4bd8c9bd3423c2a0957953e5b7b123594d458edd
Release matrix:  ed6736cfb198119efbb3dde8cfac891632cd4b4c
```

### Grant RED — 10 tests

```text
1. READY source drift blocks before Lease intent and helper launch
2. intent-only retry performs exactly one acquisition
3. one exact external match is adopted without another acquisition
4. exact live action owner blocks takeover
5. dead pre-STARTED owner may receive a new token after fresh observation
6. durable STARTED without decisive Lease state never repeats get
7. external Lease before semantic commit is recovered without another get
8. ACTIVE replay is idempotent; candidate drift conflicts
9. non-bijective external matches commit DIVERGED and never first-match
10. two independent callers produce at most one acquisition and one ACTIVE Lease
```

### Release RED — 11 tests

```text
1. internal/external/holder/path/source fence drift blocks before helper
2. DIRTY and UNKNOWN work block without release intent
3. current Worker Run or Claim blocks release
4. clean release performs one exact conditional return and Event chain
5. exact live action owner blocks a competing caller
6. STARTED release retries only under the same fence after helper absence
7. physical release before semantic commit is recovered without another action
8. missing or unmanaged path becomes DIVERGED, never RELEASED
9. duplicate external identity becomes DIVERGED, never first-matched
10. RELEASED replay is idempotent; candidate drift conflicts
11. source contains no reset, clean, force, destroy, prune, deletion, shell or exec fallback
```

The matrices use real `SqliteStore` fixtures, independent stores for concurrency, SQLite Event-failure triggers for crash windows and scripted observation/helper/process authorities. No Treehouse or helper process is executed.

## RED evidence

Current Task 11 head:

```text
Head:              ed6736cfb198119efbb3dde8cfac891632cd4b4c
Synthetic merge:   aafeb10a94e2f0c64d38cfac07fa964c43dd8b1f
Workflow / Job:    31006909566 / 92308973432
npm ci:            PASS — 0 vulnerabilities
TypeScript:        PASS
```

Separated test result:

```text
Accepted baseline tests:             212/212 PASS
Task 11 grant RED:                    0/10 expected failure
Task 11 release RED:                  0/11 expected failure
Concurrent Task 10 publication RED:   0/1 independent failure
Product total:                        212 PASS / 22 FAIL / 234 total
```

Task 11 failure signatures are correct:

```text
20 behavioral tests:
  dist/src/services/lease-service.js absent

1 static boundary test:
  src/services/lease-service.ts absent
```

The independent Task 10 failure is not attributed to Task 11. The root `verify` command stops at product RED, so AS-02, TC-01 and documentation were not re-executed at this head.

## Frozen boundaries

- Task 11 RED changes no production source, store, adapter, schema, package or helper;
- canonical checkout is never Treehouse cwd;
- every Attempt owns an independent exact-base Linux-local source;
- no real Treehouse or Lease helper process runs in this gate;
- grant STARTED without decisive exact Lease state never repeats acquisition;
- release retry remains conditional and bound to the same internal/external/source/helper fence;
- dirty, missing, unmanaged, ambiguous or non-bijective work is preserved;
- no reset, clean, force, destroy, prune or product deletion is authorized;
- no Pi process, SEC-E1 production creation, Receipt or Gate exists in M01;
- PR #17 remains draft and unmerged.

## Current authorization boundary

```text
Tasks 1–10 accepted baseline:         COMPLETE / ACCEPTED
Task 10 publication replay RED:       OBSERVED / OPEN
Task 10 publication correction GREEN: NOT AUTHORIZED
Task 11 RED:                          OBSERVED / ACCEPTABLE IN ISOLATION
Task 11 GREEN:                        NOT AUTHORIZED / BLOCKED
Task 12 and later:                    NOT AUTHORIZED
Real Treehouse execution:             NOT AUTHORIZED
Pi Worker dispatch:                   PROHIBITED
M01 acceptance:                       NOT AUTHORIZED
PR #17 merge:                         NOT AUTHORIZED
```

## Immediate next action

The safe next continuation is a narrowly scoped Task 10 publication correction GREEN bound to commit `aebfddde7af27aeb9122a760f45475aceab6babe`. Task 11 GREEN remains blocked until that product regression is resolved and the complete baseline is green again.
