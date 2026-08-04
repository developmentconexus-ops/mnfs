---
id: DOC-PROJECT-STATUS
title: MNFS Project Status
document_type: project_status
form: reference
authority: tracking
status: current
version: 1.6.7
owners:
  - developmentconexus-ops
related:
  - DOC-DOCUMENTATION-MAP
  - DOC-CAPABILITY-ROADMAP
  - EVID-PLAN-CONTRACT-SCHEMA-V2
  - ACCEPTANCE-CAP-EXECUTION-R3
  - ACCEPTANCE-MIS-002-REPLAN
  - ACCEPTANCE-M2-UNBLOCK
  - ACCEPTANCE-M01-R5-DESIGN-PACKAGE-REVIEW
  - DOC-RESEARCH-MNFS-RESEARCH-M01-EXECUTION-LEASE-CORE-v1
  - DESIGN-TC-01-TREEHOUSE-PRODUCTION-ADAPTER-CONFORMANCE
  - DESIGN-MIS-002-M01-DURABLE-EXECUTION-LEASE-CORE
  - PLAN-TC-01-TREEHOUSE-PRODUCTION-ADAPTER-CONFORMANCE
tracking_issue: 16
---

# Project status

- **Program:** Pi-first MNFS
- **Canonical environment:** Ubuntu on WSL2; Windows remains the browser, terminal and desktop host
- **Completed Product Milestones:** M0 — Foundation Walking Skeleton; M1 — Visual Mission Planning
- **Architecture Baseline:** accepted and merged through PR #11 at `f28cf2b58b7f1682450399c6edb50c983fff0cc2`
- **M2 contract reconciliation:** merged through PR #14 at `dee12a9b53984d39045421c9586ee53665ebc5e5`
- **Current enabler:** Issue #16 — MCRM R5 research, Treehouse conformance and M01 Milestone Microdesign
- **Current design PR:** #17 — `design/mis-002-m01` (draft; unmerged)
- **M2 state:** unblocked for R5 M01 research, conformance and microdesign only; implementation and Worker dispatch have not started
- **Approved M2 contract:** MIS-002 revision 5, schema v2, `sha256:d82252504044cab40e00013dc30534654382887b7819d60a916d2a9a56db4cc3`
- **Historical contract:** revision 3 preserved at blob `6b79117fe66cd5c9c8142099828812f470ce20de`

## Architecture and contract progress

- [x] Product Blueprint, Roadmap, Governance and Capability Realization Method approved.
- [x] CAP-EXECUTION applicability and 28 requirements reconciled.
- [x] Plan Contract schema v2 implemented and verified.
- [x] AS-02 accepted on canonical Ubuntu WSL2.
- [x] CAP-EXECUTION version 0.1.0 accepted; R3 PASS.
- [x] MIS-002 revision 5 reviewed in Lavish and exact-hash approved.
- [x] All 28 requirements allocated to exact approved criterion identities.
- [x] MCRM R0-R4 mechanically PASS.
- [x] Operator authorized M2 to enter R5 for M01 microdesign through the exact contract-bound token.
- [x] PR #14 reviewed and integrated into `main`.
- [x] Issue #16 and dedicated draft PR #17 opened for R5.
- [x] M01 architecture research and validated source manifest published on the design branch.
- [x] M01 Milestone Microdesign proposed with coverage for all seven M01 requirements.
- [x] Documentation Map reconciled from obsolete AB1 state to current M01 R5 authority.
- [x] Microdesign self-review resolved Claim/release, empty-Track disposition and current-Track invariants.
- [x] Operator approved the written R5 design package for TC-01 planning.
- [x] TC-01 protocol accepted as version 0.2.0 for harness implementation and WSL2 execution planning.
- [x] Detailed TC-01 implementation and canonical WSL2 execution plan version 1.0.3 written and self-reviewed.
- [x] Historical MIS-002 revision 3 hash references revalidated after documentation updates.
- [ ] Exact PR #17 head containing plan version 1.0.3 passes canonical CI.
- [ ] Operator reviews and explicitly approves the TC-01 implementation/execution plan.
- [ ] TC-01 deterministic harness implementation authorized after plan approval.
- [ ] TC-01 harness implemented and deterministically verified.
- [ ] TC-01 executed on canonical WSL2 against the pinned installed Treehouse binary.
- [ ] TC-01 findings incorporated into the final microdesign.
- [ ] M01 microdesign adversarially reviewed and explicitly approved.
- [ ] M01 implementation authorized after final microdesign approval.

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
Research coverage:       PUBLISHED
R5 design package:       OPERATOR APPROVED FOR TC-01 PLANNING
TC-01 protocol:          ACCEPTED — version 0.2.0
TC-01 plan:              CURRENT — version 1.0.3, exact-head CI pending
TC-01 harness:           NOT_STARTED
TC-01 Evidence:          NOT_STARTED
M01 microdesign:         PROPOSED — version 0.3.0
Design coverage:         7/7 M01 requirements proposed
Blocking external input: Treehouse production-adapter conformance
Current human gate:      Operator approval of the TC-01 implementation/execution plan after exact-head CI
Design PR:               #17 DRAFT
```

The design-package approval authorizes the TC-01 protocol and planning. It does not approve the final M01 microdesign, authorize harness implementation before plan approval, establish Treehouse conformance or complete R5.

## Current authorization boundary

```text
M01 research:         AUTHORIZED
TC-01 protocol:       ACCEPTED
TC-01 plan:           WRITTEN / SELF-REVIEWED / AWAITING EXACT-HEAD CI AND OPERATOR APPROVAL
TC-01 harness build:  PROHIBITED until plan approval
TC-01 WSL2 execution: AUTHORIZED only after a reviewed, CI-green harness exists
M01 microdesign:      PROPOSED, NOT FINAL
M01 implementation:  PROHIBITED until final microdesign approval
Pi Worker dispatch:  PROHIBITED
Automatic merge:     NOT AUTHORIZED
```

A material change to the approved Mission contract, `SEC-E1`, Capability, prerequisite or applicable requirements triggers Replan/re-readiness before implementation.

## Latest integrated verification

PR #14 was verified on its GitHub merge commit using Ubuntu 24.04, Node.js 24.18.0 and npm 11.16.0:

```text
Workflow:                          30855331321
Job:                               91824893985
npm ci:                            PASS — 0 vulnerabilities
product tests:                     PASS — 95/95
AS-02 deterministic tests:        PASS — 119/119
documentation tooling:            PASS
documentation validation:         PASS — 71 canonical IDs
```

## Previous design-plan verification

PR #17 merge commit `27bedecd9069a485a96f61db744a88eebadf1661` verified plan-package version 1.0.2 on Ubuntu 24.04.4 with Node.js 24.18.0, npm 11.16.0 and Git 2.54.0:

```text
Workflow:                          30865311721
Job:                               91855751914
npm ci:                            PASS — 0 vulnerabilities
typecheck:                         PASS
product tests:                     PASS — 95/95
AS-02 deterministic tests:        PASS — 119/119
documentation tooling:            PASS
MIS-002 Replan builder:            PASS
approved allocation tests:        PASS
documentation validation:         PASS — 76 canonical IDs
```

Plan version 1.0.3 added a complete executable RED process-runner test and requires a fresh exact-head proof before implementation authorization.

## Immediate next action

1. Complete exact-head CI for PR #17 plan version 1.0.3.
2. Operator reviews `docs/superpowers/plans/2026-08-03-tc-01-treehouse-production-adapter-conformance.md` version 1.0.3.
3. Resolve requested plan changes.
4. After plan approval, implement the deterministic TC-01 harness task-by-task with TDD and focused reviews.
5. Require a CI-green harness before canonical WSL2 execution.
6. Execute TC-01 on canonical Ubuntu WSL2.
7. Incorporate the observed Treehouse contract into the M01 microdesign.
8. Perform final constructive and adversarial design review.
9. Obtain explicit Operator approval of the final M01 microdesign.
10. Create the M01 production Implementation Plan only after that final approval.
11. Keep M01 implementation and Pi Worker dispatch prohibited until their separate gates pass.
