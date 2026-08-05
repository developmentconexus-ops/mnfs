---
id: DOC-PROJECT-STATUS
title: MNFS Project Status
document_type: project_status
form: reference
authority: tracking
status: current
version: 1.8.30
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
- **Current enabler:** Issue #16 — Task 8 accepted; Task 9 RED awaits explicit authority
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
Tasks 1–7:                         COMPLETE / ACCEPTED
Task 8 primary RED:                OBSERVED / ACCEPTABLE — 12 expected failures
Task 8 functional GREEN:           VERIFIED — 175/175 product PASS
Task 8 first review:               R8-01/R8-02/R8-03/R8-04 IMPORTANT
Task 8 corrective RED:             OBSERVED / ACCEPTABLE — 5 expected failures
Task 8 corrective GREEN:           VERIFIED — 180/180 product PASS
Task 8 final review:               0 Critical / 0 Important / 0 Minor
Task 8 accepted:                   YES
Task 9 RED:                        NOT AUTHORIZED
Task 9 and later:                  NOT AUTHORIZED
Real Treehouse execution:          PROHIBITED until the final WSL2 proof gate
Pi Worker dispatch:               PROHIBITED
M01 acceptance:                    NOT AUTHORIZED
Automatic merge:                  NOT AUTHORIZED
PR:                               #17 DRAFT
```

## Accepted implementation baseline

```text
Task 1  execution domain                    ec6505d720d7d252aeef77d72192c401f460b4816
Task 2  trusted runtime primitives          ff4d345720c2a14623ec1777fc5f318c9d96d685
Task 3  SQLite transaction authority        2ed7e6d620f771dd1399421d06527911a2ffea0c
Task 4  maintenance and backup              d0172cc2c141cec6004f10caa9859bced9ac8d1c
Task 5  schema v4 and versioned Events       ea459368fe1346c2cb2d6e9d37b3bb25a0c54903
Task 6  execution persistence               b1d7f0d4b2c5a44dc8686342d8d882c8dcf3d992
Task 7  atomic lifecycle service             ff8fe7c972502ff6cc932687b7e65a16f37b6516
Task 8  independent Attempt source           aa4b9e1006d324acd8889b98b3507b020403d1d9
```

## What Task 8 adds to the harness

Task 8 establishes the physical boundary between durable Attempt identity and Git source state:

```text
canonical checkout
→ strict typed read-only Git observation
→ exact-base local transfer only

Attempt
→ deterministic Linux-local source path
→ sibling temporary independent repository
→ verification and divergence classification
→ atomic final publication
```

Created:

```text
src/adapters/git-worktree.ts
src/adapters/execution-source.ts
```

Modified:

```text
src/runtime/paths.ts
```

The accepted boundary provides:

- typed `observeRepository`, `observeWorktrees`, `requireCommit` and `requireTree` operations;
- a Git environment constructed from an explicit allowlist rather than inherited caller state;
- disabled global/system config, prompting, credentials, optional locks and lazy fetch;
- owned config overrides neutralizing fsmonitor, hooks, credential helpers and upload-pack hooks;
- fatal UTF-8 and strict repository/worktree/object parsing;
- deterministic `<runtime>/execution-sources/<track>/<attempt>/source` paths;
- component-by-component path creation with symlink/non-directory rejection before descent;
- reviewed local `init → fetch → update-ref → checkout` transfer with zero persisted remotes;
- exact commit, tree, object format, clean `main` and no-origin verification;
- distinct common/object directories, no alternates and no canonical-object hardlinks;
- canonical-checkout immutability bound by Git semantics plus a deterministic no-follow physical path-tree fingerprint;
- source-local config normalization, recognized sample-hook removal and rejection of unexpected hooks before checkout;
- exact config bytes and empty hooks required on every verification and replay;
- fingerprint schema version 2 binding repository, control and object evidence;
- matching final replay without another transfer;
- conflicting or drifted final/temp preservation as `DIVERGED`;
- no Task 9 Treehouse adapter or invocation.

## Task 8 primary TDD

### RED

Created only:

```text
tests/adapters/git-worktree.test.ts
tests/adapters/execution-source.test.ts
```

```text
Git observer test commit:  77b1e7ccf0f7a6124056f61959ea59ca8bf78652
Primary RED head:          6c468cffb9c18ad9b0cdea1ad3d0469a6eeb3610
Synthetic merge:           cae2ee0bcb4e302bbc36b1cced796829b88a3a44
Workflow / Job:            30974886466 / 92206751909
TypeScript:                PASS
Prior product tests:       163/163 PASS
Primary Task 8 tests:      0/12 expected failure
```

### Functional GREEN

```text
Git observer commit:       46cd7ea34478edc3ce82c842093ead44a7229576
Source-path commit:        e3415a7d920ba80aa1f1a761dee42872fc1c0f28
Functional GREEN head:     7b35b54806e39fdefb4f26beaf8dff22dd1153f3
Synthetic merge:           fff21101935ba9a8b387f0c29735d2853f1a2d2e
Workflow / Job:            30976055447 / 92210152648
TypeScript:                PASS
Product tests:             175/175 PASS
Task 8 tests:              12/12 PASS
AS-02 tests:               119/119 PASS
TC-01 tests:               78/78 PASS
Documentation validation: PASS — 93 canonical IDs
```

## Task 8 first review

```text
Review:     4861087515
Critical:   0
Important:  4
Minor:      0
Replan:     not required
```

Findings:

```text
R8-01  incomplete Git side-effect/network/config isolation
R8-02  recursive path creation traversed an intermediate symlink before rejection
R8-03  canonical comparison omitted ignored/control physical byte drift
R8-04  source config/hooks were not validated or fingerprint-bound
```

## Task 8 corrective TDD

### RED

Created only:

```text
tests/adapters/git-worktree-correction.test.ts
tests/adapters/execution-source-correction.test.ts
```

```text
Git authority RED commit:  47098b309f514e2e189a2019afb6942a94f1c03b
Correction RED head:       d2cfc16832f1db9245e49f238458fe505b3a86e6
Synthetic merge:           76be59eb04e35f41eb5f971290813c201c89d412
Workflow / Job:            30976903976 / 92212691918
TypeScript:                PASS
Prior product tests:       175/175 PASS
Correction tests:          0/5 expected failure
```

Observed signatures:

```text
R8-01  GIT_OPTIONAL_LOCKS missing and inherited config authority survived
R8-02  external symlink target received WT-001 directory creation
R8-03  ignored canonical-file drift returned READY
R8-04  config/hook drift returned READY
R8-04  executable hook reached a published READY source
```

### GREEN

Production corrections:

```text
Git observer correction:   3a3e19cf9a4a266e7a3c79bdb836906f988f02fd
Corrective GREEN head:      aa4b9e1006d324acd8889b98b3507b020403d1d9
Synthetic merge:            550464e5bc0ca5635c824c6b55c1b4e92365be4d
Workflow / Job:             30977503049 / 92214532870
TypeScript:                 PASS
Product tests:              180/180 PASS
Correction tests:           5/5 PASS
Primary Task 8 tests:       12/12 PASS
AS-02 tests:                119/119 PASS
TC-01 tests:                78/78 PASS
Documentation validation:  PASS — 93 canonical IDs
```

Scope:

```text
src/adapters/git-worktree.ts     modified
src/adapters/execution-source.ts modified
src/runtime/paths.ts             unchanged during correction
schema/SQLite/services           unchanged
Treehouse/Pi behavior            unchanged
```

Final adversarial review:

```text
Review:     4861226705
Critical:   0
Important:  0
Minor:      0
R8-01:      CLOSED
R8-02:      CLOSED
R8-03:      CLOSED
R8-04:      CLOSED
Task 8:     ACCEPTABLE
Replan:     not required
```

## Operator authority chain — current task

```text
MNFS_AUTHORIZE_M01_TASK_8_RED plan=1.0.1 microdesign=0.6.1 task7=ff8fe7c972502ff6cc932687b7e65a16f37b6516
MNFS_AUTHORIZE_M01_TASK_8_GREEN plan=1.0.1 microdesign=0.6.1 red=6c468cffb9c18ad9b0cdea1ad3d0469a6eeb3610
MNFS_AUTHORIZE_M01_TASK_8_CORRECTION_RED plan=1.0.1 microdesign=0.6.1 green=7b35b54806e39fdefb4f26beaf8dff22dd1153f3 blockers=R8-01,R8-02,R8-03,R8-04
MNFS_AUTHORIZE_M01_TASK_8_CORRECTION_GREEN plan=1.0.1 microdesign=0.6.1 red=d2cfc16832f1db9245e49f238458fe505b3a86e6 blockers=R8-01,R8-02,R8-03,R8-04
```

Earlier Task 1–7 authorities remain recorded in PR #17 and Git history.

## Frozen boundaries

- canonical checkout is never Treehouse cwd;
- every Attempt owns an independent exact-base Linux-local source;
- dirty, ambiguous, unexpected and unclassified work is preserved;
- no real Treehouse command runs before the final explicit WSL2 acceptance task;
- no Pi process, SEC-E1 production creation, Receipt or Gate exists in M01;
- Task 9 and later require separate gates;
- PR #17 remains draft and unmerged.

## Current authorization boundary

```text
Tasks 1–8:                  COMPLETE / ACCEPTED
Task 9 RED:                 NOT AUTHORIZED
Task 9 and later:           NOT AUTHORIZED
Real Treehouse execution:   NOT AUTHORIZED
Pi Worker dispatch:         PROHIBITED
M01 acceptance:             NOT AUTHORIZED
PR #17 merge:               NOT AUTHORIZED
```

## Immediate next action

Request or provide an explicit continuation for **Task 9 RED only**, bound to accepted Task 8 head `aa4b9e1006d324acd8889b98b3507b020403d1d9`.
