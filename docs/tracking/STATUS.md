---
id: DOC-PROJECT-STATUS
title: MNFS Project Status
document_type: project_status
form: reference
authority: tracking
status: current
version: 1.8.27
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
- **Current enabler:** Issue #16 — Task 8 GREEN awaits explicit authority
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
Implementation started:           YES — bounded by task gates
Tasks 1–6:                         COMPLETE
Task 7:                            COMPLETE / ACCEPTED
Task 8 RED:                        OBSERVED / ACCEPTABLE — 12 expected failures
Task 8 GREEN:                      NOT AUTHORIZED
Task 9 and later:                  NOT AUTHORIZED
Real Treehouse execution:         PROHIBITED until the final WSL2 proof gate
Pi Worker dispatch:               PROHIBITED
M01 acceptance:                    NOT AUTHORIZED
Automatic merge:                  NOT AUTHORIZED
PR:                               #17 DRAFT
```

## Accepted implementation baseline

```text
Task 1  execution domain                    ec6505d7207d252aeef77d72192c401f460b4816
Task 2  trusted runtime primitives          ff4d345720c2a14623ec1777fc5f318c9d96d685
Task 3  SQLite transaction authority        2ed7e6d620f771dd1399421d06527911a2ffea0c
Task 4  maintenance and backup              d0172cc2c141cec6004f10caa9859bced9ac8d1c
Task 5  schema v4 and versioned Events       ea459368fe1346c2cb2d6e9d37b3bb25a0c54903
Task 6  execution persistence               b1d7f0d4b2c5a44dc8686342d8d882c8dcf3d992
Task 7  atomic lifecycle service             ff8fe7c972502ff6cc932687b7e65a16f37b6516
```

Task 7 final verification:

```text
Product:          163/163 PASS
AS-02:            119/119 PASS
TC-01:            78/78 PASS
Documentation:    PASS — 93 canonical IDs
Review:           4860838576
Findings:         0 Critical / 0 Important / 0 Minor
```

## What Tasks 1–7 add to the harness

```text
accepted contract and qualified target
→ atomic Write Track + A01 + matching Events

current Attempt
→ atomic Worker Run opening/replacement

safe resource observations
→ atomic Attempt supersession or Track abandonment

multiple MNFS writers
→ mutable authority reloaded after BEGIN IMMEDIATE
```

The harness now possesses durable execution identities, strict persistence, one transaction authority, versioned Events and a multi-writer lifecycle coordinator. It still lacks the physical Attempt-owned source and production Git observation adapters defined by Task 8.

## Task 8 purpose

Task 8 adds the boundary between semantic execution state and physical Git source state:

```text
canonical checkout
→ read-only observation only

Attempt
→ exact-base Linux-local independent Git source

Attempt source
→ no origin, no alternates, no shared common directory and no hardlinked canonical objects
```

Treehouse must never use the canonical checkout as its backing repository. A future READY Attempt source becomes the only admissible Treehouse cwd.

## Task 8 RED contract

Created only:

```text
tests/adapters/git-worktree.test.ts
tests/adapters/execution-source.test.ts
```

No `src/` file changed.

### Read-only Git observer — 5 tests

The RED defines `GitWorktreeInspector` with:

```text
observeRepository
observeWorktrees
requireCommit
requireTree
```

Required proof:

- permit only `rev-parse`, exact porcelain `status`, `worktree list --porcelain`, `remote` and `cat-file`;
- use shell-free process execution with explicit cwd and controlled environment;
- disable global/system Git configuration, prompts, proxies and credential channels;
- return canonical repository, Git/common/object directories, object format, HEAD commit/tree, raw porcelain bytes and sorted remotes;
- parse worktree porcelain strictly, including detached, locked and prunable evidence;
- reject duplicate, relative, incomplete or contaminated output;
- distinguish exact commit and tree objects;
- expose no write, checkout, fetch, reset, clean, commit, ref mutation or fallback operation.

### Independent Attempt source — 7 tests

The RED defines:

```text
resolveExecutionSourcePath
ExecutionSourceAdapter.prepare
```

Required proof:

- derive `<runtime>/execution-sources/<track>/<attempt>/source` and reject malformed ancestry, mounts and symlinks;
- use the reviewed local transfer sequence:

```text
git init --object-format=<format> <temp>
git -C <temp> -c protocol.file.allow=always fetch --no-tags --no-write-fetch-head <canonical-path> <base-sha>
git -C <temp> update-ref refs/heads/main <base-sha>
git -C <temp> checkout -B main <base-sha>
```

- verify exact base commit, tree, object format, clean `main` and zero remotes;
- prove distinct common/object directories, no alternates and no shared inode/hardlink with canonical objects;
- prove the canonical checkout is unchanged before/after preparation;
- replay an identical complete final source without repeating transfer;
- preserve and classify a conflicting final as `DIVERGED` instead of repointing it;
- remove only a recognized incomplete sibling temp while preserving unrelated files;
- strip proxy, askpass and SSH-agent channels from every Git process.

## Task 8 RED evidence

```text
Git observer test commit:    77b1e7ccf0f7a6124056f61959ea59ca8bf78652
Atomic RED head:             6c468cffb9c18ad9b0cdea1ad3d0469a6eeb3610
Synthetic merge:             cae2ee0bcb4e302bbc36b1cced796829b88a3a44
Workflow / Job:              30974886466 / 92206751909
TypeScript:                  PASS
Prior product tests:         163/163 PASS
Task 8 Git observer tests:   0/5 expected failure
Task 8 source tests:         0/7 expected failure
Product total:               163 PASS / 12 FAIL
```

All 12 failures are explicit assertions that the Task 8 production boundary is absent. The first missing module is:

```text
dist/src/adapters/git-worktree.js
```

Because loading fails before fixture preparation, no Task 8 source directory was created and no materialization Git command was executed.

The root `verify` command stopped at the deliberate product RED. AS-02, TC-01 and documentation were therefore not re-executed in this RED; their latest accepted evidence remains the Task 7 GREEN result above.

## Operator authority chain

```text
D-007  microdesign 0.6.1 approved
D-008  implementation plan 1.0.1 approved
MNFS_AUTHORIZE_M01_TASK_1_RED plan=1.0.1 microdesign=0.6.1
MNFS_AUTHORIZE_M01_TASK_1_GREEN plan=1.0.1 microdesign=0.6.1 red=65bd4e2c410d4d1566f5fef0da33f29e35657489
MNFS_AUTHORIZE_M01_TASK_2_RED plan=1.0.1 microdesign=0.6.1 task1=ec6505d7207d252aeef77d72192c401f460b4816
MNFS_AUTHORIZE_M01_TASK_2_GREEN plan=1.0.1 microdesign=0.6.1 red=01a1e5deabbe5388f83f83d13effe9e1a220fed0
MNFS_AUTHORIZE_M01_TASK_3_RED plan=1.0.1 microdesign=0.6.1 task2=ff4d345720c2a14623ec1777fc5f318c9d96d685
MNFS_AUTHORIZE_M01_TASK_3_GREEN plan=1.0.1 microdesign=0.6.1 red=9e109da918cb3cf8567a057684564d6cfe60ca7e
MNFS_AUTHORIZE_M01_TASK_4_RED plan=1.0.1 microdesign=0.6.1 task3=2ed7e6d620f771dd1399421d06527911a2ffea0c
MNFS_AUTHORIZE_M01_TASK_4_GREEN plan=1.0.1 microdesign=0.6.1 red=a163c8d3512f6f9a2583156e5f3e64f32ecde45b
MNFS_AUTHORIZE_M01_TASK_5_RED plan=1.0.1 microdesign=0.6.1 task4=d0172cc2c141cec6004f10caa9859bced9ac8d1c
MNFS_AUTHORIZE_M01_TASK_5_GREEN plan=1.0.1 microdesign=0.6.1 red=e38592a97485bac91c713dbd648c391bdb029357
MNFS_AUTHORIZE_M01_TASK_6_RED plan=1.0.1 microdesign=0.6.1 task5=ea459368fe1346c2cb2d6e9d37b3bb25a0c54903
MNFS_AUTHORIZE_M01_TASK_6_GREEN plan=1.0.1 microdesign=0.6.1 red=b7a98a1972038bbd1d631f8e669959247256223b
MNFS_AUTHORIZE_M01_TASK_6_CORRECTION_RED plan=1.0.1 microdesign=0.6.1 green=839851d8d0d267b6ff235eae6c241c6ee38c5291 blockers=R6-01,R6-02
MNFS_AUTHORIZE_M01_TASK_6_CORRECTION_GREEN plan=1.0.1 microdesign=0.6.1 red=3d443aa2223abd185e5cea39ecb905a0e86e0a8f blockers=R6-01,R6-02
MNFS_AUTHORIZE_M01_TASK_7_RED plan=1.0.1 microdesign=0.6.1 task6=b1d7f0d4b2c5a44dc8686342d8d882c8dcf3d992
MNFS_AUTHORIZE_M01_TASK_7_GREEN plan=1.0.1 microdesign=0.6.1 red=2fe2d87e1bc6f690c2cd556f1b0278420b8e3dda
MNFS_AUTHORIZE_M01_TASK_7_CORRECTION_RED plan=1.0.1 microdesign=0.6.1 green=656d9a431957b74b9018020b829621f5a07a53eb blockers=R7-01,R7-02,R7-03
MNFS_AUTHORIZE_M01_TASK_7_CORRECTION_GREEN plan=1.0.1 microdesign=0.6.1 red=f976f254677c14a13371769269914e86cf96b539 blockers=R7-01,R7-02,R7-03
MNFS_AUTHORIZE_M01_TASK_7_ATOMIC_AUTHORITY_RED plan=1.0.1 microdesign=0.6.1 green=5795fc5bf98677bec532484d3ec8c0917b83ca08 blocker=R7-04
MNFS_AUTHORIZE_M01_TASK_7_ATOMIC_AUTHORITY_GREEN plan=1.0.1 microdesign=0.6.1 red=062f1be67dd86c4ad70c311a302eea4f68e95c21 blocker=R7-04
MNFS_AUTHORIZE_M01_TASK_8_RED plan=1.0.1 microdesign=0.6.1 task7=ff8fe7c972502ff6cc932687b7e65a16f37b6516
```

## Frozen boundaries

- canonical checkout is never Treehouse cwd;
- every Attempt owns an independent exact-base Linux-local source;
- no Task 8 production adapter exists until GREEN authority;
- no real Treehouse command runs before the final explicit WSL2 acceptance task;
- no Pi process, SEC-E1 production creation, Receipt or Gate exists in M01;
- no dirty, ambiguous or unclassified work may be destroyed;
- PR #17 remains draft and unmerged.

## Current authorization boundary

```text
Tasks 1–7:                  COMPLETE / ACCEPTED
Task 8 RED:                 OBSERVED / ACCEPTABLE
Task 8 GREEN:               NOT AUTHORIZED
Task 9 and later:           NOT AUTHORIZED
Real Treehouse execution:   NOT AUTHORIZED
Pi Worker dispatch:         PROHIBITED
M01 acceptance:             NOT AUTHORIZED
PR #17 merge:               NOT AUTHORIZED
```

## Immediate next action

Request or provide an explicit continuation for **Task 8 GREEN only**, bound to RED head `6c468cffb9c18ad9b0cdea1ad3d0469a6eeb3610`.
