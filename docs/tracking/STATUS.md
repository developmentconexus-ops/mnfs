---
id: DOC-PROJECT-STATUS
title: MNFS Project Status
document_type: project_status
form: reference
authority: tracking
status: current
version: 1.8.35
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
- **Current enabler:** Issue #16 — Task 10 RED awaits explicit authority
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
Task 10 RED:                       NOT AUTHORIZED
Task 10 GREEN:                     NOT AUTHORIZED
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

## Task 9 delivered boundary

Task 9 provides physical Treehouse observation and invocation shapes above an accepted Attempt-owned source:

```text
persisted READY-source identity
→ fresh Task 8 source-integrity observation
→ fresh direct Git observation
→ controlled Treehouse config and host provenance
→ exact acquire/status/release command
→ strict untrusted physical observation
```

Created:

```text
src/adapters/treehouse.ts
```

Public operations:

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

Accepted command-shape identity:

```text
sha256:f2077cfd037cbaefdcfc94385a0cfeb7e1647ef294ca8ceee3cd61a1b109dc84
```

The adapter returns physical observations only. It does not persist a semantic Lease, interpret release output as completion, open MNFS SQLite, launch the Task 10 helper or invoke Pi.

## Task 9 primary TDD

### RED

```text
Task 9 RED head:       a48bf4dba68984ce24a32575f982bae98e1cafc6
Synthetic merge:       d2936833b1a6b7ed040c207322305ad3848f5b7e
Workflow / Job:        30978752678 / 92218451668
TypeScript:            PASS
Prior product tests:   180/180 PASS
Task 9 tests:          0/8 expected failure
Product total:         180 PASS / 8 FAIL
```

The earlier test draft `700ec33c8546ac326e782ee3af86347db280e0d6` failed TypeScript for a fixture-only inference error and was superseded before RED acceptance.

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

## Task 9 post-GREEN review

```text
Review:     4861408689
Critical:   0
Important:  3
Minor:      0
Replan:     not required
```

Accepted blockers:

```text
R9-01  capability discovery rejected multiline stdout/stderr help
R9-02  Attempt-owned Treehouse config/XDG/hooks contents were not bound
R9-03  source freshness did not consume exact READY fingerprint/commit/tree/object format
```

## Task 9 corrective TDD

### Corrective RED

```text
Correction RED head:   c87afa9c1a846f7788a378f2a9ed26c84620b755
Synthetic merge:       5c6e03593564906f5385046fbc152b0577dd4ccb
Workflow / Job:        30980233455 / 92222897267
TypeScript:            PASS
Prior product tests:   188/188 PASS
Correction tests:      0/8 expected failure
Product total:         188 PASS / 8 FAIL
```

The eight failures covered multiline capability evidence, config/pool drift, unexpected XDG content, non-empty hooks and READY fingerprint/commit/tree/object-format drift.

### Corrective implementation

Production commits:

```text
READY identity and capability/source authority  f433615d826494b5af0377bab1cab8e6c138eef1
XDG user-config authority                        6bafed773c24adb0222a0b17493df2c417154618
```

The first corrective fixture placed policy in `source/treehouse.toml`. Review against accepted exact-base source invariants and Treehouse configuration precedence proved that location incorrect. The corrected contract uses:

```text
$XDG_CONFIG_HOME/treehouse/config.toml
```

and treats a repository `treehouse.toml` as optional precedence that is accepted only when its canonical regular-file bytes exactly equal the controlled user policy.

Final behavior:

- capability flags are extracted from fatal-UTF-8 multiline stdout plus stderr;
- persisted `readySource` binds fingerprint, base commit, base tree and object format;
- a fresh Task 8 integrity seam and a fresh direct Git observation must both match;
- source must remain clean, no-remote and exactly bound to the READY identity;
- XDG contains exactly `treehouse/config.toml`;
- user config is one canonical regular non-hardlinked file with exact `max_trees = 2` and exact pool root;
- Git hooks path is empty;
- repository config is absent or byte-equivalent to the controlled policy;
- no protected command runs after any source, config, host, binary or command-shape drift;
- release process output remains advisory.

### Final corrective GREEN

```text
Final functional head: f984dd0f94e752060bc88cff128061da23607f00
Synthetic merge:       b440bfcf8115f1feb5a9582770f757b1e283df48
Workflow / Job:        30982264746 / 92229040491
TypeScript:            PASS
Product tests:         196/196 PASS
Task 9 primary:        8/8 PASS
Task 9 corrective:     8/8 PASS
AS-02 tests:           119/119 PASS
TC-01 tests:           78/78 PASS
Documentation:         PASS — 93 canonical IDs
Vulnerabilities:       0
```

Final review:

```text
Review:     4861709427
Critical:   0
Important:  0
Minor:      0
Task 9:     ACCEPTED
Replan:     not required
```

## Operator authority chain — current task

```text
MNFS_AUTHORIZE_M01_TASK_9_RED plan=1.0.1 microdesign=0.6.1 task8=aa4b9e1006d324acd8889b98b3507b020403d1d9
MNFS_AUTHORIZE_M01_TASK_9_GREEN plan=1.0.1 microdesign=0.6.1 red=a48bf4dba68984ce24a32575f982bae98e1cafc6
MNFS_AUTHORIZE_M01_TASK_9_CORRECTION_RED plan=1.0.1 microdesign=0.6.1 green=18c326e82b6b9179939c7d37169df1f5a7717a1d blockers=R9-01,R9-02,R9-03
MNFS_AUTHORIZE_M01_TASK_9_CORRECTION_GREEN plan=1.0.1 microdesign=0.6.1 red=c87afa9c1a846f7788a378f2a9ed26c84620b755 blockers=R9-01,R9-02,R9-03
```

Earlier Task 1–8 authorities remain recorded in PR #17 and Git history.

## Frozen boundaries

- canonical checkout is never Treehouse cwd;
- every Attempt owns an independent exact-base Linux-local source;
- Task 9 tests use simulated protected processes only;
- no real Treehouse command runs before the final explicit WSL2 acceptance task;
- release process output is advisory and cannot mutate semantic state;
- no semantic Lease grant/release exists before Task 11;
- no trusted STARTED/FINISHED action helper exists before Task 10;
- no Pi process, SEC-E1 production creation, Receipt or Gate exists in M01;
- Task 10 and later require separate gates;
- PR #17 remains draft and unmerged.

## Current authorization boundary

```text
Tasks 1–9:                  COMPLETE / ACCEPTED
Task 10 RED:                NOT AUTHORIZED
Task 10 GREEN:              NOT AUTHORIZED
Task 11 and later:          NOT AUTHORIZED
Real Treehouse execution:   NOT AUTHORIZED
Pi Worker dispatch:         PROHIBITED
M01 acceptance:             NOT AUTHORIZED
PR #17 merge:               NOT AUTHORIZED
```

## Immediate next action

Request or provide an explicit continuation for **Task 10 RED only**, bound to accepted Task 9 head `f984dd0f94e752060bc88cff128061da23607f00`.
