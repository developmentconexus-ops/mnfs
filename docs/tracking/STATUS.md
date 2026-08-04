---
id: DOC-PROJECT-STATUS
title: MNFS Project Status
document_type: project_status
form: reference
authority: tracking
status: current
version: 1.8.2
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
- **M2 state:** unblocked for R5 M01 research, conformance and microdesign only; M01 implementation and Worker dispatch have not started
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
- [x] TC-01 protocol accepted as version 0.2.0.
- [x] TC-01 implementation and canonical WSL2 execution plan version 1.0.3 written, self-reviewed and CI-verified.
- [x] Operator approved TC-01 plan version 1.0.3 and authorized Task 1.
- [x] TC-01 Tasks 1-10 completed through observed RED/GREEN cycles and full canonical CI.
- [x] Task 6 recorded fail-closed Treehouse update suppression and Git system-config isolation.
- [x] Task 7 established canonical JSON, atomic Evidence, artifact containment and immutable finalization.
- [x] Task 8 established exact S01-S15 ordering, dependency blocking, fresh-client recovery, process-contract inspection and freshness invalidation.
- [x] Task 9 replaced S07-S12 blockers with deterministic release, fencing, dirty-work preservation, repeated-release and divergence classifications.
- [x] Task 10 established deterministic Verdict precedence, provenance/hash bindings and secret-free human/machine report payloads.
- [x] Operator authorized continuation to Task 11.
- [x] TC-01 Task 11 completed through observed dual missing-module RED, focused GREEN and full canonical CI.
- [x] Task 11 exposed strict `run`, `report` and `cleanup` commands and composed the complete executable deterministic flow.
- [ ] TC-01 Task 12 — deterministic specification mapping, adversarial review and pre-WSL2 gate — not started.
- [ ] TC-01 deterministic harness receives its final reviewed and documented pre-WSL2 acceptance.
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
TC-01 plan:              APPROVED — version 1.0.3
TC-01 Tasks 1-11:        ACCEPTED
TC-01 executable code:   IMPLEMENTED / FINAL REVIEW PENDING
TC-01 Task 12:           NOT_STARTED
TC-01 real Evidence:     NOT_STARTED
M01 microdesign:         PROPOSED — version 0.3.0
Design coverage:         7/7 M01 requirements proposed
Blocking external input: Treehouse production-adapter conformance
Current human gate:      continuation to TC-01 Task 12
Design PR:               #17 DRAFT
```

The design-package and plan approvals authorize only the governed TC-01 harness work. They do not establish Treehouse conformance, approve the final M01 microdesign or authorize M01 production implementation.

## Deterministic harness findings retained for final review

Task 6 clarified the execution environment by adding `TREEHOUSE_NO_UPDATE_CHECK=1` and `GIT_CONFIG_NOSYSTEM=1`. This fail-closed correction must remain in later plan and microdesign reconciliation.

Task 7 established canonical JSON, atomic command/scenario/environment writes, exact artifact hash verification and an immutable final manifest. Lower-level path and run-ID failures are reclassified as `TC01_EVIDENCE_INVALID` while preserving their causes.

Task 8 established one frozen S01-S15 registry and sequential dependency semantics. S02 performs one acquisition; S05 recovers through a new status-only client without a second acquisition. Material failures block dependent mutation-heavy scenarios while S14 and S15 remain executable.

Task 9 established deterministic S07-S12 lifecycle semantics. Correct release requires exact preflight and fresh status; stale ID/holder attempts require non-zero exit plus unchanged Lease/worktree state; dirty return must preserve the byte-exact sentinel and exact Lease; repeated release is classified from fresh status without a second return; missing and unmanaged paths remain explicit divergence classifications. Every mutation-heavy scenario uses a fresh external Lease identity and trusted cleanup is allowed only after intact-state proof.

Task 10 established one deterministic decision boundary. Material safety failures produce `REJECT`; missing, blocked or inconclusive proof produces `BLOCKED`; safe explicit constraints produce `ACCEPT_WITH_LIMITATIONS`; exact complete PASS Evidence produces `ACCEPT`. The Verdict binds Treehouse executable hash/version, Git, Ubuntu/WSL, command-shape hash and scenarios hash. The human report never serializes complete observations, raw outputs or environment values.

Task 11 now writes `verdict.json`, `report.md` and `cleanup.json` atomically, exposes exact CLI forms, validates finalized hashes before report regeneration, and permits cleanup only after a separate fail-closed safety assessment. Commands and observations are bridged into scenario-scoped Evidence without rerunning external operations.

Task 12 must explicitly review one remaining orchestration choice before canonical execution: default `run` discovers provenance before S01 orchestration. A host, executable or version mismatch therefore exits operationally before a finalized S01 `BLOCKED` report exists. Task 13 separately requires manual host/candidate confirmation before `run`; Task 12 must decide whether the current pre-scenario behavior remains acceptable or requires reconciliation.

## Current authorization boundary

```text
M01 research:          AUTHORIZED
TC-01 protocol:        ACCEPTED
TC-01 plan:            APPROVED
TC-01 Tasks 1-11:      ACCEPTED
TC-01 Task 12:         NOT_STARTED
TC-01 WSL2 execution:  AUTHORIZED only after Task 12 final review and CI gate
M01 microdesign:       PROPOSED, NOT FINAL
M01 implementation:   PROHIBITED until final microdesign approval
Pi Worker dispatch:    PROHIBITED
Automatic merge:      NOT AUTHORIZED
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

## Latest TC-01 Task 11 verification

PR #17 merge commit `365b811b5890a98bf7acd3affa6a4c9e8ca95497` verified TC-01 Task 11 on Ubuntu 24.04.4 with Node.js 24.18.0, npm 11.16.0 and Git 2.54.0:

```text
Workflow:                          30910074772
Job:                               91994342759
npm ci:                            PASS — 0 vulnerabilities
typecheck:                         PASS
product tests:                     PASS — 95/95
AS-02 deterministic tests:        PASS — 119/119
TC-01 deterministic tests:        PASS — 60/60
documentation tooling:            PASS
MIS-002 Replan builder:            PASS
approved allocation tests:        PASS
documentation validation:         PASS — 86 canonical IDs
```

This proof establishes strict CLI parsing, deterministic full-run composition, runtime report writes, finalized-hash revalidation and fail-closed cleanup under deterministic dependencies. It does not invoke the installed Treehouse binary, create a real Lease or establish production-adapter conformance.

## Immediate next action

1. Review `ACCEPTANCE-TC-01-TASK-11-CLI-ORCHESTRATION`.
2. Continue with Task 12 of the approved TC-01 plan only after the next governed continuation.
3. Task 12 must map S01-S15 to named tests/functions, perform adversarial review, correct every Critical/Important finding and update README/WORKLOG honestly.
4. Keep real Treehouse execution, M01 implementation, Pi Worker dispatch and automatic merge prohibited until their later gates pass.
