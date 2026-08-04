---
id: DOC-PROJECT-STATUS
title: MNFS Project Status
document_type: project_status
form: reference
authority: tracking
status: current
version: 1.8.4
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
  - ACCEPTANCE-TC-01-TREEHOUSE-PRODUCTION-ADAPTER
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
- **Current enabler:** Issue #16 — MCRM R5, accepted Treehouse conformance and final M01 Milestone Microdesign review
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
- [x] M01 design package approved for TC-01 planning; protocol accepted as version 0.2.0.
- [x] TC-01 implementation and WSL2 execution plan version 1.0.3 approved.
- [x] TC-01 Tasks 1-11 completed through observed RED/GREEN cycles and canonical CI.
- [x] Task 12 completed a full adversarial review against the Blueprint, Roadmap, methodology and primary sources.
- [x] Every identified Critical and Important deterministic-harness finding was corrected.
- [x] TC-01 Task 13 executed on canonical Linux-owned Ubuntu WSL2.
- [x] Canonical runtime Evidence produced `ACCEPT` with S01-S15 all `PASS` and no limitation.
- [x] Evidence was reopened in a fresh process and all manifest/artifact hashes resolved.
- [x] Trusted cleanup completed after full freshness, Lease, worktree, source-baseline and containment checks.
- [x] Real-runtime instrumentation defects were corrected by observed RED/GREEN cycles.
- [x] M01 microdesign reconciled to proposed version 0.4.0 with accepted adapter invariants.
- [ ] Task 14 — final constructive and adversarial R5 design review — not started.
- [ ] Exact microdesign version 0.4.0 explicitly approved by the Operator.
- [ ] Separate M01 production implementation plan written and approved.
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
TC-01 Tasks 1-13:              ACCEPTED
TC-01 deterministic harness:   IMPLEMENTED / ADVERSARIALLY VERIFIED
TC-01 canonical Evidence:      ACCEPT — 15/15 PASS, no limitation
Treehouse conformance:          ESTABLISHED FOR PINNED M01 CANDIDATE
Trusted cleanup:               COMPLETED
M01 microdesign:               PROPOSED — version 0.4.0
Design coverage:               7/7 M01 requirements proposed
Blocking input:                final Task 14 design review and explicit Operator decision
Current human gate:            explicit authorization to begin Task 14
Design PR:                     #17 DRAFT
```

The accepted TC-01 Verdict establishes only the bounded physical Treehouse adapter contract. It does not approve the complete M01 microdesign and does not authorize production code.

## Canonical Treehouse Evidence

```text
Run ID:                    tc01-20260804-144054-4315b6f2
Runtime root:              /home/leandrotheodoro/.local/state/mnfs/fixtures/tc-01/tc01-20260804-144054-4315b6f2
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

Any change in Treehouse bytes/version/capabilities, Git, Node, Ubuntu/WSL identity or adapter command shape invalidates reuse and returns the adapter to review.

## Final runtime artifact hashes

```text
fixture.json:               sha256:9112664863e17fae5e30a7e5fa41a7c7f9ebd4c414ed6e018fbc27e45476882b
environment.json:           sha256:990ace6a2cab4e2fa0a87504e7f5b5044242a12d7d269d895dcc56470cfcb7c0
scenarios.json:             sha256:0588e88c8d694a60fd9a5e00e34af71175531c2b6187b61e0bfc89a0cf174f90
manifest.json:              sha256:c91601cac5778dfb3528da71538ac233dc9fd85bbe9f912ce9115aafa13526f3
verdict.json:               sha256:8db2ca7b8495e2c41174da05f7776548b28a3569dda02bc241fbc436e2a6b9e8
report.md:                  sha256:6a9e59f168603f5001606829168885488b58403237e19f3a1ea70f59ad4f973c
cleanup.json:               sha256:29e50f052500686a0a71d7dd844faff6174c9c18daf08c1474222dfc74412261
```

Raw binary command artifacts remain outside Git in the preserved Linux-owned Evidence root.

## Runtime findings corrected

1. The installed candidate emits raw version `v2.1.1`; the harness now strictly canonicalizes one lowercase `v` prefix to semantic `2.1.1` while rejecting other text or versions.
2. The first cleanup correctly failed closed, but reported false `SOURCE_CHANGED` because snapshot comparison used property-order-sensitive `JSON.stringify`.
3. Snapshot equality now uses canonical JSON; array order and all byte/hash/mode identities remain semantic.
4. JSON CLI failures now expose allowlisted operational blockers without exposing raw stderr, Buffers or environment values.
5. The second cleanup review returned `COMPLETED` and removed only the registered ephemeral fixture paths.

## Current authorization boundary

```text
M01 research:             AUTHORIZED
TC-01 protocol:           ACCEPTED
TC-01 plan:               APPROVED
TC-01 Tasks 1-13:         ACCEPTED
Treehouse adapter:        ACCEPTED FOR BOUNDED M01 DESIGN
Task 14:                  NOT_STARTED / REQUIRES EXPLICIT CONTINUATION
M01 microdesign:          PROPOSED 0.4.0, NOT FINAL
M01 implementation:       PROHIBITED until final microdesign approval and a separate plan
Pi Worker dispatch:       PROHIBITED
Automatic merge:          NOT AUTHORIZED
```

A material change to the approved Mission contract, `SEC-E1`, Capability, prerequisite or applicable requirements triggers Replan/re-readiness before implementation.

## Latest deterministic verification before promotion

Final harness head `bb4e5a67bd589d322f1f716c51995c927c0031d4` and PR synthetic merge commit `345ff74277b2a58d3345078b0df52e35cd07a8f9` were verified on Ubuntu 24.04.4 with Node.js 24.18.0, npm 11.16.0 and Git 2.54.0:

```text
Workflow:                          30923659755
Job:                               92040355347
npm ci:                            PASS — 0 vulnerabilities
typecheck:                         PASS
product tests:                     PASS — 95/95
AS-02 deterministic tests:        PASS — 119/119
TC-01 deterministic tests:        PASS — 78/78
documentation tooling:            PASS
MIS-002 Replan builder:            PASS
approved allocation tests:        PASS
documentation validation:         PASS — 88 canonical IDs
```

## Immediate next action

1. Review `ACCEPTANCE-TC-01-TREEHOUSE-PRODUCTION-ADAPTER` and microdesign version 0.4.0.
2. Begin Task 14 only after explicit Operator continuation.
3. Run the final constructive and adversarial review against all seven M01 requirements and every crash/fencing/preservation invariant.
4. Request an explicit Operator decision on the exact final microdesign version.
5. Stop before production implementation; after approval, write a separate M01 implementation plan.
