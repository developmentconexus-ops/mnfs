---
id: DOC-PROJECT-STATUS
title: MNFS Project Status
document_type: project_status
form: reference
authority: tracking
status: current
version: 1.8.8
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
- **Architecture Baseline:** merged through PR #11 at `f28cf2b58b7f1682450399c6edb50c983fff0cc2`
- **M2 contract reconciliation:** merged through PR #14 at `dee12a9b53984d39045421c9586ee53665ebc5e5`
- **Approved M2 contract:** MIS-002 revision 5, schema v2, `sha256:d82252504044cab40e00013dc30534654382887b7819d60a916d2a9a56db4cc3`
- **Current enabler:** Issue #16 — explicit authorization for M01 implementation Task 1 RED
- **Current design PR:** #17 — `design/mis-002-m01` (draft; unmerged)

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
Research coverage:             PUBLISHED
CAP-EXECUTION:                 ACCEPTED — version 0.1.0
MIS-002 contract:              APPROVED — revision 5 / exact hash
TC-01 canonical Evidence:      ACCEPT — 15/15 PASS, cleanup COMPLETED
Task 14 final review:          COMPLETE / APROVÁVEL
Critical findings:             3 found / 3 closed
Important findings:            8 found / 8 closed
M01 microdesign:               ACCEPTED — version 0.6.1
MCRM R5:                       PASS
Replan required:               NO
Implementation plan:           CURRENT / APPROVED — version 1.0.1
Implementation started:        NO
Task 1 RED:                    NOT AUTHORIZED
M01 production implementation: PROHIBITED pending Task 1 continuation
Pi Worker dispatch:            PROHIBITED
Automatic merge:               NOT AUTHORIZED
Current human gate:            explicit authorization for Task 1 RED only
Design PR:                     #17 DRAFT
```

## Operator decisions

### Microdesign approval

```text
MNFS_APPROVE_M01_MICRODESIGN version=0.6.1 contract=sha256:d82252504044cab40e00013dc30534654382887b7819d60a916d2a9a56db4cc3 treehouse=sha256:c0b45a6b7cd7ee5b79bd614136847d84b4c6c3fc8dbe0fd80b71703b7a102cf3
```

Recorded as `D-007` and `ACCEPTANCE-MIS-002-M01-R5-APPROVAL`.

### Implementation-plan approval

```text
MNFS_APPROVE_M01_IMPLEMENTATION_PLAN version=1.0.1 microdesign=0.6.1 contract=sha256:d82252504044cab40e00013dc30534654382887b7819d60a916d2a9a56db4cc3 treehouse=sha256:c0b45a6b7cd7ee5b79bd614136847d84b4c6c3fc8dbe0fd80b71703b7a102cf3
```

Recorded as `D-008` and `ACCEPTANCE-MIS-002-M01-IMPLEMENTATION-PLAN-APPROVAL`.

The plan approval accepts the ordered tasks, interfaces and proof gates. It does not start Task 1 and cannot be interpreted as authorization for later tasks, real Treehouse execution, M01 acceptance, M02 or merge.

## Accepted architecture

```text
Approved Mission Contract
→ exact scope and contract hash

SQLite
→ Track, Attempt, Run, Claim, Lease, idempotency and payload-versioned Event authority

Attempt-owned ExecutionSourceAdapter
→ exact-base independent Linux-local repository
→ zero remotes, no hardlinks, no alternates, controlled hooks/config

Treehouse 2.1.1
→ physical managed-worktree and external Lease identity

Trusted LeaseActionRunner
→ one token-bound external invocation with durable STARTED/FINISHED Evidence

MNFS services
→ transaction, ancestry, IAO, fencing and read-only Recovery
```

## Frozen invariants

- canonical checkout is never Treehouse cwd;
- Attempt source is independent and exact-base;
- Treehouse HOME/XDG/config/hooks are controlled;
- every state mutation and versioned Event is atomic;
- relational keys prove exact Track → Attempt → Run/Lease → Claim ancestry;
- Claim result is a real Git tree in the exact Attempt source;
- grant, release and Claim idempotency bind unique keys to canonical input hashes;
- LeaseActionRunner records STARTED before one external call;
- inconclusive STARTED grant never automatically repeats `treehouse get`;
- release is conditional and fully fenced;
- dirty, ambiguous and unclassified work is preserved;
- plain Recovery performs no domain or resource mutation;
- M01 creates Claim `OPEN` only and contains no Pi dispatch, Receipt or Gate.

## Canonical Treehouse Evidence

```text
Run ID:                    tc01-20260804-144054-4315b6f2
Environment:               Ubuntu 26.04 on WSL2
Kernel:                    6.18.33.2-microsoft-standard-WSL2
Node.js:                   v24.18.0
Git:                       2.53.0
Treehouse version:         2.1.1
Treehouse realpath:        /usr/local/bin/treehouse
Treehouse SHA-256:         sha256:c0b45a6b7cd7ee5b79bd614136847d84b4c6c3fc8dbe0fd80b71703b7a102cf3
Command-shape SHA-256:     sha256:f2077cfd037cbaefdcfc94385a0cfeb7e1647ef294ca8ceee3cd61a1b109dc84
Scenarios SHA-256:         sha256:0588e88c8d694a60fd9a5e00e34af71175531c2b6187b61e0bfc89a0cf174f90
Verdict:                   ACCEPT
Cleanup:                   COMPLETED
```

Any candidate, capability, command, host/tooling, environment-shape or source-boundary drift requires renewed conformance review.

## Approved implementation plan 1.0.1

The plan defines fourteen ordered TDD gates:

```text
domain/errors/fixtures
→ process/durability/process identity
→ transaction authority
→ maintenance/backup/version gate
→ migration v4/versioned Events
→ persistence/ancestry/idempotency
→ Track/Attempt/Run lifecycle
→ Git observation/independent source
→ exact Treehouse adapter
→ durable action helper
→ grant/release IAO
→ Claim OPEN/read-only Recovery
→ CLI/composition
→ deterministic and canonical WSL2 proof
```

Each task requires observed RED, minimal GREEN, focused and root verification, review and a bounded commit. No task authorizes its successor automatically.

## Current authorization boundary

```text
M01 research:               AUTHORIZED / COMPLETE
TC-01:                      ACCEPTED
Task 14 review:             COMPLETE
Microdesign 0.6.1:          ACCEPTED
R5:                         PASS
Implementation plan 1.0.1:  APPROVED
Task 1 RED:                  NOT AUTHORIZED
M01 implementation:         NOT STARTED / PROHIBITED pending continuation
Real Treehouse execution:    PROHIBITED until the plan's final WSL2 gate
Pi Worker dispatch:         PROHIBITED
PR #17 merge:               NOT AUTHORIZED
```

A material change to MIS-002, SEC-E1, CAP-EXECUTION, the accepted Treehouse boundary, microdesign invariants or applicable requirements triggers Replan or renewed readiness review.

## Immediate next action

Request or provide an explicit continuation for **Task 1 RED only**. Stop before writing production implementation unless that continuation is granted.
