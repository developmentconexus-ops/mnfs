---
id: DOC-PROJECT-STATUS
title: MNFS Project Status
document_type: project_status
form: reference
authority: tracking
status: current
version: 1.6.1
owners:
  - developmentconexus-ops
related:
  - DOC-DOCUMENTATION-MAP
  - DOC-CAPABILITY-ROADMAP
  - EVID-PLAN-CONTRACT-SCHEMA-V2
  - ACCEPTANCE-CAP-EXECUTION-R3
  - ACCEPTANCE-MIS-002-REPLAN
  - ACCEPTANCE-M2-UNBLOCK
  - DOC-RESEARCH-MNFS-RESEARCH-M01-EXECUTION-LEASE-CORE-v1
  - DESIGN-TC-01-TREEHOUSE-PRODUCTION-ADAPTER-CONFORMANCE
  - DESIGN-MIS-002-M01-DURABLE-EXECUTION-LEASE-CORE
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
- [x] TC-01 Treehouse production-adapter conformance protocol proposed.
- [x] M01 Milestone Microdesign proposed with coverage for all seven M01 requirements.
- [ ] Draft PR #17 mechanical documentation and CI review complete.
- [ ] TC-01 executed on canonical WSL2 against the pinned installed Treehouse binary.
- [ ] TC-01 findings incorporated into the final microdesign.
- [ ] M01 microdesign adversarially reviewed and explicitly approved.
- [ ] M01 implementation authorized after microdesign approval.

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
TC-01 protocol:          PROPOSED / EXECUTION AUTHORIZED
TC-01 Evidence:          NOT_STARTED
M01 microdesign:         PROPOSED
Design coverage:         7/7 M01 requirements proposed
Blocking external input: Treehouse production-adapter conformance
Design PR:               #17 DRAFT
```

The proposed design does not become implementation authority merely because every requirement has a design element. TC-01 must prove the exact Treehouse behavior, the final design must absorb its findings and the Operator must approve the resulting microdesign explicitly.

## Current authorization boundary

```text
M01 research:         AUTHORIZED
TC-01 execution:      AUTHORIZED
M01 microdesign:      AUTHORIZED for review
M01 implementation:  PROHIBITED until microdesign approval
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

PR #17 requires its own fresh documentation and CI proof before review readiness.

## Immediate next action

1. Complete mechanical documentation and CI validation for draft PR #17.
2. Correct any metadata, relation, source-manifest or authority defects.
3. Execute TC-01 on canonical Ubuntu WSL2.
4. Incorporate the observed Treehouse contract into the microdesign.
5. Perform constructive and adversarial design review.
6. Obtain explicit Operator approval of the final M01 microdesign.
7. Create an Implementation Plan only after that approval.
8. Keep implementation and Pi Worker dispatch prohibited until their separate gates pass.
