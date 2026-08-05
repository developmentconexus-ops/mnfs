---
id: DOC-PROJECT-STATUS
title: MNFS Project Status
document_type: project_status
form: reference
authority: tracking
status: current
version: 1.8.33
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
- **Current enabler:** Issue #16 — Task 9 corrective RED awaits explicit authority
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
Task 9 functional GREEN:           VERIFIED — 188/188 product PASS
Task 9 post-GREEN review:          R9-01/R9-02/R9-03 IMPORTANT
Task 9 accepted:                   NO
Task 9 corrective RED:             NOT AUTHORIZED
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

Task 9 defines the physical Treehouse observation boundary above an Attempt-owned source:

```text
independent source
→ candidate/source freshness
→ exact Treehouse command
→ strict physical observation
```

Created:

```text
src/adapters/treehouse.ts
```

Implemented public operations:

```text
TreehouseAdapter.acquire
TreehouseAdapter.status
TreehouseAdapter.release
```

Protected command shapes:

```text
treehouse get --lease --lease-holder <holder> --json
treehouse status --json
treehouse return <path> --if-lease-id <id> --if-lease-holder <holder>
```

Functional behavior includes:

- exact exported command-shape hash;
- fresh executable resolution, SHA-256, semantic-version and capability checks before every protected operation;
- Git, Node, Ubuntu and WSL2 identity comparison;
- controlled Treehouse/Git environment with Attempt-owned HOME, XDG and hooks path;
- exact bounded `ProcessSpec` with the READY source as cwd;
- fatal UTF-8 and exactly-one-JSON parsing for acquisition and status;
- exact acquisition holder and pool-contained realpath;
- strict leased/available status shapes and duplicate path/external-identity rejection;
- release result returned as advisory `ProcessResult` for later observation;
- static prohibition of destructive flags, shell execution, direct process fallback, inherited environment spread and stderr-state inference;
- no semantic Lease persistence or real Treehouse execution.

Accepted command-shape identity:

```text
sha256:f2077cfd037cbaefdcfc94385a0cfeb7e1647ef294ca8ceee3cd61a1b109dc84
```

## Task 9 TDD

### RED

Created only:

```text
tests/adapters/treehouse.test.ts
```

The first draft at `700ec33c8546ac326e782ee3af86347db280e0d6` failed TypeScript for a test-only literal-property inference issue and was not accepted as RED.

Corrected RED evidence:

```text
Task 9 RED head:       a48bf4dba68984ce24a32575f982bae98e1cafc6
Synthetic merge:       d2936833b1a6b7ed040c207322305ad3848f5b7e
Workflow / Job:        30978752678 / 92218451668
TypeScript:            PASS
Prior product tests:   180/180 PASS
Task 9 tests:          0/8 expected failure
Product total:         180 PASS / 8 FAIL
```

Observed signature:

```text
7 dynamic contracts: missing dist/src/adapters/treehouse.js
1 static contract:    missing src/adapters/treehouse.ts
```

No real Treehouse command or managed resource was created.

### Functional GREEN

```text
Functional GREEN head: 18c326e82b6b9179939c7d37169df1f5a7717a1d
Synthetic merge:       e8d6ccadf11e374d6dba9d3b7224d283f1df16c5
Workflow / Job:        30979372154 / 92220303473
TypeScript:            PASS
Product tests:         188/188 PASS
Task 9 tests:          8/8 PASS
AS-02 tests:           119/119 PASS
TC-01 tests:           78/78 PASS
Documentation:         PASS — 93 canonical IDs
```

Scope review:

```text
src/adapters/treehouse.ts added
schema/SQLite/services       unchanged
Task 10 helper protocol      absent
real Treehouse execution     absent
Pi behavior                  unchanged
```

## Task 9 post-GREEN review

Formal review:

```text
Review:     4861408689
Critical:   0
Important:  3
Minor:      0
Task 9:     NOT ACCEPTED
Replan:     not required
```

### R9-01 — capability discovery diverges from accepted TC-01 behavior

The adapter decodes each help command as exactly one stdout line. The accepted TC-01 implementation combines stdout and stderr and extracts flags across multiline help. A real accepted candidate can therefore be rejected while the simplified fixture passes.

Required corrective proof:

- multiline help output is accepted;
- capability flags may be observed across stdout and stderr;
- fatal UTF-8 and exact flag requirements remain fail-closed;
- missing or contaminated capability evidence is rejected.

### R9-02 — Attempt-owned config and hooks are not verified

HOME, XDG, pool and hooks are resolved paths, but the adapter does not validate the Treehouse config bytes/shape or require the hooks directory to be empty. Unexpected config or executable hook content can participate in a protected command.

Required corrective proof:

- canonical Treehouse config is bound to the exact pool and approved settings;
- unexpected config files/bytes are rejected;
- every hook entry is rejected before `get`, `status` or `return`;
- drift between calls fails before protected work.

### R9-03 — source freshness is not exact READY-source identity

The current check binds only source path, clean status and zero remotes. It does not bind the protected operation to the Task 8 fingerprint, expected commit/tree, object format or accepted source config evidence. A clean source repointed to another commit remains admissible.

Required corrective proof:

- expected READY-source identity is supplied or resolved for every operation;
- commit, tree, object format and fingerprint/config drift fail before Treehouse;
- same exact source identity remains replayable;
- no protected process is invoked after source drift.

## Operator authority chain — current task

```text
MNFS_AUTHORIZE_M01_TASK_9_RED plan=1.0.1 microdesign=0.6.1 task8=aa4b9e1006d324acd8889b98b3507b020403d1d9
MNFS_AUTHORIZE_M01_TASK_9_GREEN plan=1.0.1 microdesign=0.6.1 red=a48bf4dba68984ce24a32575f982bae98e1cafc6
```

Earlier Task 1–8 authorities remain recorded in PR #17 and Git history.

## Frozen boundaries

- canonical checkout is never Treehouse cwd;
- every Attempt owns an independent exact-base Linux-local source;
- no real Treehouse command runs before the final explicit WSL2 acceptance task;
- release process output is advisory and cannot mutate semantic state;
- no semantic Lease grant/release or trusted helper exists before Tasks 10–11;
- no Pi process, SEC-E1 production creation, Receipt or Gate exists in M01;
- Task 10 and later require separate gates;
- PR #17 remains draft and unmerged.

## Current authorization boundary

```text
Tasks 1–8:                  COMPLETE / ACCEPTED
Task 9 RED:                 OBSERVED / ACCEPTABLE
Task 9 functional GREEN:    VERIFIED
Task 9 corrective RED:      NOT AUTHORIZED
Task 9 accepted:            NO
Task 10 and later:          NOT AUTHORIZED
Real Treehouse execution:   NOT AUTHORIZED
Pi Worker dispatch:         PROHIBITED
M01 acceptance:             NOT AUTHORIZED
PR #17 merge:               NOT AUTHORIZED
```

## Immediate next action

Request or provide an explicit continuation for **Task 9 corrective RED only**, bound to functional GREEN head `18c326e82b6b9179939c7d37169df1f5a7717a1d` and blockers `R9-01,R9-02,R9-03`.
