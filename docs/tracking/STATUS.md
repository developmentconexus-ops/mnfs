---
id: DOC-PROJECT-STATUS
title: MNFS Project Status
document_type: project_status
form: reference
authority: tracking
status: current
version: 1.8.3
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
  - ACCEPTANCE-TC-01-TASK-01-HARNESS-REGISTRATION
  - ACCEPTANCE-TC-01-TASK-02-SAFE-PROCESS-RUNNER
  - ACCEPTANCE-TC-01-TASK-03-DISPOSABLE-GIT-FIXTURE
  - ACCEPTANCE-TC-01-TASK-04-PROVENANCE-AND-CAPABILITIES
  - ACCEPTANCE-TC-01-TASK-05-TRUSTED-GIT-OBSERVATION
  - ACCEPTANCE-TC-01-TASK-06-STRICT-TREEHOUSE-CLIENT
  - ACCEPTANCE-TC-01-TASK-07-ATOMIC-EVIDENCE-STORE
  - ACCEPTANCE-TC-01-TASK-08-ACQUISITION-RECOVERY-ORCHESTRATION
  - ACCEPTANCE-TC-01-TASK-09-RELEASE-FENCING-PRESERVATION
  - ACCEPTANCE-TC-01-TASK-10-VERDICT-AND-REPORTS
  - ACCEPTANCE-TC-01-TASK-11-CLI-ORCHESTRATION
  - ACCEPTANCE-TC-01-TASK-12-DETERMINISTIC-ADVERSARIAL-REVIEW
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
- **Approved M2 contract:** MIS-002 revision 5, schema v2, `sha256:d82252504044cab40e00013dc30534654382887b7819d60a916d2a9a56db4cc3`
- **Historical contract:** revision 3 preserved at blob `6b79117fe66cd5c9c8142099828812f470ce20de`

## Architecture and contract progress

- [x] Product Blueprint, Roadmap, Governance and Capability Realization Method approved.
- [x] CAP-EXECUTION version 0.1.0 accepted; all 28 requirements reconciled.
- [x] Plan Contract schema v2 implemented and verified.
- [x] AS-02 accepted on canonical Ubuntu WSL2.
- [x] MIS-002 revision 5 reviewed in Lavish and exact-hash approved.
- [x] Every requirement allocated to exact approved criterion identities.
- [x] MCRM R0-R4 mechanically PASS.
- [x] Operator authorized M2 to enter R5 for M01 microdesign only.
- [x] PR #14 integrated into `main`; Issue #16 and draft PR #17 opened for R5.
- [x] M01 research and validated source manifest published.
- [x] M01 Milestone Microdesign version 0.3.0 proposed with coverage for all seven M01 requirements.
- [x] Operator approved the design package for TC-01 planning; protocol accepted as version 0.2.0.
- [x] TC-01 implementation and WSL2 execution plan version 1.0.3 approved.
- [x] TC-01 Tasks 1-11 completed through observed RED/GREEN cycles and canonical CI.
- [x] Operator authorized Task 12 as a complete adversarial review against the Blueprint, Roadmap and methodology.
- [x] Task 12 mapped S01-S15 to deciding functions and named deterministic tests.
- [x] Task 12 corrected every identified Critical and Important finding.
- [x] TC-01 deterministic harness passed the final pre-WSL2 adversarial gate.
- [ ] TC-01 Task 13 — real canonical WSL2 conformance run — not started.
- [ ] TC-01 findings incorporated into the final M01 microdesign.
- [ ] M01 microdesign constructively and adversarially reviewed after real Evidence.
- [ ] M01 production implementation explicitly authorized.

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
R5 design package:             OPERATOR APPROVED FOR TC-01 PLANNING
TC-01 protocol:                ACCEPTED — version 0.2.0
TC-01 plan:                    APPROVED — version 1.0.3
TC-01 Tasks 1-12:              ACCEPTED
TC-01 deterministic harness:   IMPLEMENTED / DETERMINISTICALLY VERIFIED / PRE-WSL2 REVIEWED
TC-01 real Evidence:           NOT_STARTED
Treehouse conformance:          NOT ESTABLISHED
M01 microdesign:               PROPOSED — version 0.3.0
Design coverage:               7/7 M01 requirements proposed
Blocking external input:       Treehouse production-adapter conformance
Current human gate:            explicit authorization to begin Task 13 canonical WSL2 execution
Design PR:                     #17 DRAFT
```

The deterministic harness acceptance establishes the safety and correctness of the instrument. It does not establish the behavior of the installed Treehouse binary and does not change R5 to PASS.

## Deterministic harness result

The reviewed harness now provides:

- a Linux-owned disposable Git fixture with no `origin`;
- exact Treehouse executable/version/SHA-256 and capability provenance;
- strict UTF-8/JSON boundaries;
- controlled PATH and disabled Git global/system configuration;
- subprocess argument arrays, `shell: false`, closed stdin and bounded output;
- Linux process-group termination on timeout or output overflow;
- trusted Git observation and explicit no-fetch proof;
- run/pool/artifact containment for all Treehouse control and observed paths;
- adjacent private-state observations around `status --json`;
- S01-S15 dependency blocking and semantic release/fencing classification;
- crash-durable fixture and Evidence checkpoints;
- deterministic Verdict and secret-free human/machine reports;
- cleanup gated by current provenance and a complete source baseline.

## Task 12 adversarial corrections

Task 12 corrected:

1. descendant processes surviving timeout;
2. cleanup invoking a changed Treehouse executable;
3. host/tool mismatch aborting before finalized S01 `BLOCKED` Evidence;
4. cleanup checking only HEAD/status rather than full source state;
5. Treehouse control and worktree paths escaping run/pool boundaries;
6. unsafe TOML path interpolation;
7. non-fatal UTF-8 decoding at JSON boundaries;
8. arbitrary host environment inheritance during provenance discovery;
9. S13 observing the wrong private-state area and non-adjacent snapshots;
10. rename-atomic but non-fsync-durable fixture/Evidence publication.

The reviewed README contains the complete S01-S15 implementation/test mapping and residual limitations.

## Residual limitations

```text
real Treehouse execution:        NOT_STARTED
same-user hostile authenticity:  OUTSIDE TC-01; hashes provide integrity, not signatures
internal S14/S15 artifacts:      synthetic empty bytes, no fake subprocess
PR #17 integration:              NOT AUTHORIZED
```

Any change in Treehouse bytes/version, Git, Node, Ubuntu/WSL identity or adapter command shape invalidates reuse and returns the candidate to review.

## Current authorization boundary

```text
M01 research:             AUTHORIZED
TC-01 protocol:           ACCEPTED
TC-01 plan:               APPROVED
TC-01 Tasks 1-12:         ACCEPTED
TC-01 Task 13:            NOT_STARTED / REQUIRES EXPLICIT CONTINUATION
TC-01 WSL2 execution:     ELIGIBLE AFTER EXPLICIT TASK 13 AUTHORIZATION
M01 microdesign:          PROPOSED, NOT FINAL
M01 implementation:       PROHIBITED until final microdesign approval
Pi Worker dispatch:       PROHIBITED
Automatic merge:          NOT AUTHORIZED
```

A material change to the approved Mission contract, `SEC-E1`, Capability, prerequisite or applicable requirements triggers Replan/re-readiness before implementation.

## Latest integrated verification

PR #14 was verified on its GitHub merge commit:

```text
Workflow:                          30855331321
Job:                               91824893985
product tests:                     PASS — 95/95
AS-02 deterministic tests:        PASS — 119/119
documentation validation:         PASS — 71 canonical IDs
```

## Latest TC-01 Task 12 implementation verification

Reviewed implementation head `2e1d73ef1c970694c5c50f8a2db4bc3c00db22be` and PR synthetic merge commit `e219df0b492fe45b529389df27f0e82edb8cf859` were verified on Ubuntu 24.04.4 with Node.js 24.18.0, npm 11.16.0 and Git 2.54.0:

```text
Workflow:                          30916499733
Job:                               92015860083
npm ci:                            PASS — 0 vulnerabilities
typecheck:                         PASS
product tests:                     PASS — 95/95
AS-02 deterministic tests:        PASS — 119/119
TC-01 deterministic tests:        PASS — 75/75
documentation tooling:            PASS
MIS-002 Replan builder:            PASS
approved allocation tests:        PASS
documentation validation:         PASS — 87 canonical IDs
```

This proof establishes the deterministic harness and adversarial pre-WSL2 gate. It does not invoke the installed Treehouse binary, create a real Lease or establish production-adapter conformance.

## Immediate next action

1. Review `ACCEPTANCE-TC-01-TASK-12-DETERMINISTIC-ADVERSARIAL-REVIEW`.
2. Begin Task 13 only after explicit Operator continuation.
3. Task 13 must run on the canonical Linux-owned WSL2 checkout against the installed pinned candidate and preserve any `REJECT` or `BLOCKED` fixture.
4. Keep M01 implementation, Pi Worker dispatch and automatic merge prohibited until later gates pass.