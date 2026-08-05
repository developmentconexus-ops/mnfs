---
id: DOC-PROJECT-STATUS
title: MNFS Project Status
document_type: project_status
form: reference
authority: tracking
status: current
version: 1.8.28
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
- **Current enabler:** Issue #16 — Task 8 corrective RED awaits explicit authority
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
Task 8 RED:                        OBSERVED / ACCEPTABLE — 12 expected failures
Task 8 functional GREEN:           VERIFIED — 175/175 product PASS
Task 8 post-GREEN review:          R8-01/R8-02/R8-03/R8-04 IMPORTANT
Task 8 accepted:                   NO
Task 8 corrective RED:             NOT AUTHORIZED
Task 9 and later:                  NOT AUTHORIZED
Real Treehouse execution:          PROHIBITED until the final WSL2 proof gate
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

## What Task 8 adds to the harness

Task 8 introduces the physical boundary between durable Attempt identity and Git source state:

```text
canonical checkout
→ strict typed read-only Git observation

Attempt
→ deterministic Linux-local source path
→ sibling temporary independent repository
→ exact local object transfer
→ verification
→ atomic publication
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

Functional behavior includes:

- `GitWorktreeInspector.observeRepository`, `observeWorktrees`, `requireCommit` and `requireTree`;
- shell-free bounded Git commands with explicit cwd/environment;
- strict fatal-UTF-8 and porcelain parsing;
- canonical repository/Git/common/object paths, object format, HEAD commit/tree, raw status and sorted remotes;
- deterministic `<runtime>/execution-sources/<track>/<attempt>/source` paths;
- reviewed local transfer sequence with no persisted remote;
- exact base/tree/object-format/clean-main verification;
- distinct common/object directories, no alternates and no canonical-object hardlinks;
- deterministic source fingerprint;
- matching final replay without another transfer;
- conflicting final preservation as `DIVERGED`;
- bounded cleanup of one recognized empty interrupted sibling temp;
- no Task 9 Treehouse adapter or Treehouse invocation.

## Task 8 TDD

### RED

Created only:

```text
tests/adapters/git-worktree.test.ts
tests/adapters/execution-source.test.ts
```

Evidence:

```text
Git observer test commit:  77b1e7ccf0f7a6124056f61959ea59ca8bf78652
Task 8 RED head:           6c468cffb9c18ad9b0cdea1ad3d0469a6eeb3610
Synthetic merge:           cae2ee0bcb4e302bbc36b1cced796829b88a3a44
Workflow / Job:            30974886466 / 92206751909
TypeScript:                PASS
Prior product tests:       163/163 PASS
Task 8 observer tests:     0/5 expected failure
Task 8 source tests:       0/7 expected failure
Product total:             163 PASS / 12 FAIL
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

Scope review:

```text
src/adapters/git-worktree.ts   added
src/adapters/execution-source.ts added
src/runtime/paths.ts           modified
schema/SQLite/services         unchanged
Treehouse/Pi behavior          unchanged
```

## Task 8 post-GREEN review

Formal review:

```text
Review:     4861087515
Critical:   0
Important:  4
Minor:      0
Task 8:     NOT ACCEPTED
Replan:     not required
```

### R8-01 — read-only Git environment is not fully side-effect/network/config isolated

The current observer does not force `GIT_OPTIONAL_LOCKS=0` or `GIT_NO_LAZY_FETCH=1`, and it does not clear repository/config redirection variables such as `GIT_DIR`, `GIT_WORK_TREE`, `GIT_INDEX_FILE`, object/alternate variables or caller-supplied `GIT_CONFIG_PARAMETERS/COUNT/KEY/VALUE` entries.

Required proof:

- status cannot refresh the index;
- partial-clone object reads cannot contact a promisor remote;
- caller config cannot activate fsmonitor, hooks, credentials or redirect repository authority;
- every observer process receives one owned allowlisted environment.

### R8-02 — intermediate source directories can be traversed before symlink rejection

Recursive `mkdir` occurs before the final `realpath` comparison. A symlink in an intermediate component below the verified runtime root may receive filesystem mutation before rejection.

Required proof:

- create/validate every component from the verified runtime root;
- never descend through a symlink;
- an injected intermediate symlink receives no child creation;
- all unexpected paths remain preserved.

### R8-03 — canonical checkout comparison is not a complete byte/Git snapshot

The current before/after comparison binds Git semantics but not a no-follow path-tree/control snapshot. Ignored files or Git control/config bytes can change without changing the compared observation.

Required proof:

- deterministic no-follow canonical path-tree snapshot before/after;
- Git semantic snapshot remains included;
- ignored/control/config drift yields `EXECUTION_SOURCE_CHANGED` and preserves the prepared source.

### R8-04 — source config/hooks are not validated or fingerprinted

READY and replay do not bind source-local config, hook executability or hook-path shape. Config/hook drift may therefore replay as READY. Local transfer also needs a proof that server/client executable config is neutralized.

Required proof:

- no executable source hooks;
- no inherited or unexpected hooks path/config;
- transfer-side executable config is neutralized;
- accepted config/hook evidence participates in the source fingerprint;
- later config/hook drift returns DIVERGED without changing the source.

## Operator authority chain — current task

```text
MNFS_AUTHORIZE_M01_TASK_8_RED plan=1.0.1 microdesign=0.6.1 task7=ff8fe7c972502ff6cc932687b7e65a16f37b6516
MNFS_AUTHORIZE_M01_TASK_8_GREEN plan=1.0.1 microdesign=0.6.1 red=6c468cffb9c18ad9b0cdea1ad3d0469a6eeb3610
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
Tasks 1–7:                  COMPLETE / ACCEPTED
Task 8 RED:                 OBSERVED / ACCEPTABLE
Task 8 functional GREEN:    VERIFIED
Task 8 corrective RED:      NOT AUTHORIZED
Task 8 accepted:            NO
Task 9 and later:           NOT AUTHORIZED
Real Treehouse execution:   NOT AUTHORIZED
Pi Worker dispatch:         PROHIBITED
M01 acceptance:             NOT AUTHORIZED
PR #17 merge:               NOT AUTHORIZED
```

## Immediate next action

Request or provide an explicit continuation for **Task 8 corrective RED only**, bound to functional GREEN head `7b35b54806e39fdefb4f26beaf8dff22dd1153f3` and blockers `R8-01,R8-02,R8-03,R8-04`.
