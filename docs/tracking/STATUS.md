---
id: DOC-PROJECT-STATUS
title: MNFS Project Status
document_type: project_status
form: reference
authority: tracking
status: current
version: 1.8.5
owners:
  - developmentconexus-ops
related:
  - DOC-DOCUMENTATION-MAP
  - DOC-CAPABILITY-ROADMAP
  - ACCEPTANCE-CAP-EXECUTION-R3
  - ACCEPTANCE-MIS-002-REPLAN
  - ACCEPTANCE-M2-UNBLOCK
  - ACCEPTANCE-M01-R5-DESIGN-PACKAGE-REVIEW
  - ACCEPTANCE-TC-01-TASK-12-DETERMINISTIC-ADVERSARIAL-REVIEW
  - ACCEPTANCE-TC-01-TREEHOUSE-PRODUCTION-ADAPTER
  - REVIEW-MIS-002-M01-R5-FINAL
  - DESIGN-MIS-002-M01-DURABLE-EXECUTION-LEASE-CORE
tracking_issue: 16
---

# Project status

- **Program:** Pi-first MNFS
- **Canonical environment:** Ubuntu on WSL2; Windows remains the browser, terminal and desktop host
- **Completed Product Milestones:** M0 — Foundation Walking Skeleton; M1 — Visual Mission Planning
- **Architecture Baseline:** merged through PR #11 at `f28cf2b58b7f1682450399c6edb50c983fff0cc2`
- **M2 contract reconciliation:** merged through PR #14 at `dee12a9b53984d39045421c9586ee53665ebc5e5`
- **Approved M2 contract:** MIS-002 revision 5, schema v2, `sha256:d82252504044cab40e00013dc30534654382887b7819d60a916d2a9a56db4cc3`
- **Current enabler:** Issue #16 — final MCRM R5 Operator decision for M01
- **Current design PR:** #17 — `design/mis-002-m01` (draft; unmerged)

## Readiness result

```text
R0 Baseline              PASS
R1 Applicability         PASS
R2 Requirements          PASS
R3 Capability Readiness  PASS
R4 Contract Readiness    PASS
R5 Milestone Microdesign IN_PROGRESS
```

## Current R5 result

```text
Research coverage:             PUBLISHED
CAP-EXECUTION:                 ACCEPTED — version 0.1.0
MIS-002 contract:              APPROVED — revision 5 / exact hash
TC-01 protocol:                ACCEPTED — version 0.2.0
TC-01 plan:                    APPROVED — version 1.0.3
TC-01 Tasks 1–13:              ACCEPTED
TC-01 deterministic harness:   IMPLEMENTED / ADVERSARIALLY VERIFIED
TC-01 canonical Evidence:      ACCEPT — 15/15 PASS, no limitation
Trusted cleanup:               COMPLETED
Task 14 review:                COMPLETE
Task 14 recommendation:        APROVÁVEL
Critical findings:             3 found / 3 closed
Important findings:            8 found / 8 closed
M01 microdesign:               PROPOSED — version 0.6.1
Design coverage:               COMPLETE — 7/7 M01 requirements
Replan required:               NO
Current human gate:            exact Operator decision on version 0.6.1
Design PR:                     #17 DRAFT
```

Task 14 completion and an `APROVÁVEL` recommendation do not change R5 to `PASS`. Only the Operator can approve the exact microdesign.

## Architecture and contract progress

- [x] Product Blueprint, Roadmap, Governance and Capability Realization Method approved.
- [x] CAP-EXECUTION version 0.1.0 accepted and all requirements reconciled.
- [x] Plan Contract schema v2 implemented and verified.
- [x] AS-02 accepted on canonical Ubuntu WSL2.
- [x] MIS-002 revision 5 exact-hash approved and allocated.
- [x] R0–R4 mechanically pass.
- [x] Operator authorized R5 for M01 microdesign only.
- [x] M01 research and validated source manifest published.
- [x] TC-01 protocol, implementation plan and deterministic harness accepted.
- [x] Task 12 completed complete deterministic adversarial review.
- [x] Task 13 executed canonical WSL2 conformance and produced accepted Evidence.
- [x] Task 14 completed constructive and adversarial review against all seven M01 requirements.
- [x] Every Critical and Important Task 14 finding was incorporated into proposed microdesign 0.6.1.
- [ ] Operator explicitly approves or rejects microdesign version 0.6.1.
- [ ] Separate M01 production TDD implementation plan written and approved.
- [ ] M01 production implementation explicitly authorized.

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

Accepted command shapes:

```text
treehouse get --lease --lease-holder <holder> --json
treehouse status --json
treehouse return <path> --if-lease-id <lease-id> --if-lease-holder <holder>
```

Treehouse is accepted only inside the proved boundary. Candidate bytes/version/capabilities, host/tool identity, command shape, controlled HOME/config and no-origin source remain freshness requirements.

## Task 14 final design corrections

### Production boundary

- canonical checkout with `origin` is never Treehouse cwd;
- each Attempt receives an independent Linux-local source at the exact base commit;
- source has zero remotes, no alternates, no shared common directory and no hardlinked canonical objects;
- HOME, XDG config, pool and hooks path are MNFS-controlled;
- user Treehouse hooks, host Git config, credentials and network are excluded.

### State and integrity

- Event payload version is stored on every Event;
- migration v4 uses maintenance gate, consistent `node:sqlite backup()`, generalized table rebuild and integrity checks;
- required Event version provides a concrete pre-v4 write fence;
- composite foreign keys prove exact Track/Attempt/Run/Lease/Claim ancestry;
- Attempt owns exact base commit and object format;
- Claim result must be an exact Git tree in the Attempt source;
- grant, release and Claim idempotency bind unique keys to canonical input hashes.

### Crash and Recovery

- trusted LeaseActionRunner writes STARTED before invoking Treehouse;
- parent death cannot cause a silent duplicate acquisition;
- inconclusive STARTED grant blocks instead of retrying `get`;
- release retry remains conditional and fully fenced;
- duplicate IDs, paths, holders or helpers never use first-match selection;
- plain Recovery is content-addressed and byte-for-byte non-mutating.

## Residual boundaries

```text
Treehouse drift:          requires fresh conformance review
M01 Track cardinality:    one qualified Feature per Track
Recovery:                 read-only unless explicit operation service repairs
Claim beyond OPEN:        M02
Pi / SEC-E1 dispatch:     M02
Receipt / Gate:           M02
parallel scheduler:       later capability
same-user hostile rewrite outside integrity model: explicit limitation
```

None permits false acceptance, destructive cleanup or duplicate grant.

## Current authorization boundary

```text
M01 research:             AUTHORIZED
TC-01:                    ACCEPTED
Task 14 review:           COMPLETE
Microdesign 0.6.1:        PROPOSED / OPERATOR DECISION PENDING
R5:                       IN_PROGRESS
Implementation plan:      NOT_STARTED
M01 implementation:       PROHIBITED
Pi Worker dispatch:       PROHIBITED
Automatic merge:          NOT AUTHORIZED
```

An approval of microdesign 0.6.1 authorizes only creation of a separate production TDD implementation plan. It does not authorize production code.

A material change to MIS-002, SEC-E1, CAP-EXECUTION, the accepted Treehouse boundary or applicable requirements triggers Replan or renewed readiness review.

## Last accepted verification before Task 14

Task 13 documentation head `bb66406a504cae712fc47eb480d2cda138e5b419` and PR synthetic merge `9293baf4dafd45c97ecfd273df1d1165d63e4cae` passed:

```text
Workflow:                       30926080708
Job:                            92048648230
npm audit:                      0 vulnerabilities
typecheck:                      PASS
product tests:                  95/95
AS-02 deterministic tests:     119/119
TC-01 deterministic tests:     78/78
documentation tooling:         PASS
MIS-002 Replan builder:         PASS
approved allocation tests:     PASS
documentation validation:      89 canonical IDs
```

## Immediate next action

Review:

```text
docs/design/2026-08-03-mis-002-m01-durable-execution-lease-core.md
docs/acceptance/2026-08-04-mis-002-m01-final-r5-review.md
```

Then provide an explicit Operator decision on exact version `0.6.1`. Stop before implementation.
