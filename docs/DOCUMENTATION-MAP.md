---
id: DOC-DOCUMENTATION-MAP
title: MNFS Documentation Map
document_type: documentation_map
form: reference
authority: constitutional
status: accepted
version: 1.6.0
owners:
  - developmentconexus-ops
approvers:
  - operator
source_of_truth_for:
  - documentation discovery
  - documentation authority map
  - canonical read paths
related:
  - DOC-PRODUCT-BLUEPRINT
  - DOC-CAPABILITY-ROADMAP
  - DOC-MNFS-DEVELOPMENT-GOVERNANCE-METHOD
  - DOC-MNFS-CAPABILITY-REALIZATION-METHOD
  - CAP-EXECUTION
  - TRACKING-DECISIONS
  - TRACKING-ARCHITECTURE-REALIZATION-REVIEW
  - ACCEPTANCE-M2-UNBLOCK
  - ACCEPTANCE-TC-01-TREEHOUSE-PRODUCTION-ADAPTER
  - REVIEW-MIS-002-M01-R5-FINAL
  - ACCEPTANCE-MIS-002-M01-R5-APPROVAL
  - ACCEPTANCE-MIS-002-M01-IMPLEMENTATION-PLAN-APPROVAL
  - ACCEPTANCE-MIS-002-M01-IMPLEMENTATION-CLOSEOUT
  - DESIGN-MIS-002-M01-DURABLE-EXECUTION-LEASE-CORE
  - PLAN-MIS-002-M01-DURABLE-EXECUTION-LEASE-CORE
review_triggers:
  - canonical document added, removed or superseded
  - documentation authority changes
  - Product Milestone changes
last_reviewed: 2026-08-07
tracking_issue: 23
---

# MNFS Documentation Map

> Accepted documentation authority and discovery map. This document indexes canonical sources and read paths; it does not redefine their content.

## 1. Current architecture phase

```text
M0 — Foundation Walking Skeleton                         ACCEPTED
M1 — Visual Mission Planning                            ACCEPTED
M2 — Secure One-Worker Vertical Slice                   ARCHITECTURE_REASSESSMENT
  MIS-002/M01 — Durable Execution and Lease Core        ACCEPTED / CLOSED
  MIS-002/M02 — Governed E1 Worker, Recovery and Acceptance
                                                        PAUSED_PENDING_ARCH_REVIEW
```

Current state:

- Product Blueprint Sections 1–13 and ADR-0001–ADR-0012 remain accepted current/historical authority until explicitly superseded;
- `CAP-EXECUTION` version 0.1.0 remains accepted;
- `MIS-002` revision 5 remains the approved schema-v2 Mission contract at `sha256:d82252504044cab40e00013dc30534654382887b7819d60a916d2a9a56db4cc3` and is immutable in place;
- M01 microdesign 0.6.1 and implementation plan 1.0.1 are accepted and M01 is closed under `D-009`;
- real R2/R3 remain `FOLLOW_UP_REQUIRED` under Issue #20 and are not represented as PASS;
- Operator decision `D-010` adopts `DOC-MNFS-DEVELOPMENT-GOVERNANCE-METHOD` and authorizes a global Architecture Realization Review;
- Issue #23 is the current architecture Discovery/Decision container;
- Issue #21 remains the prior M02 R5 microdesign container but is paused as the next gate pending Issue #23;
- M02 production implementation and production Worker dispatch remain prohibited.

## 2. Authority hierarchy

```text
A0 Constitutional
A1 Decision
A2 Specification
A3 Contract
A4 Standard / Policy
A5 Reference
A6 Guidance
A7 Evidence
A8 Tracking
A9 Research / Historical
A10 Generated Projection
```

Conflict precedence for bounded execution:

```text
accepted specific ADR
→ Product Blueprint
→ accepted Capability Spec
→ scoped Approved Mission Contract
→ accepted Milestone Microdesign
→ Standard / Policy / Profile
→ Operator-approved implementation plan
→ implementation Reference
→ other Guidance
→ Tracking
→ Research / Historical
```

An implementation plan cannot change an accepted microdesign, Mission contract, Capability or ADR. Material conflict is resolved explicitly through Decision, ADR or Replan as applicable.

For **Discovery and Decision**, accepted authority is the current baseline and Evidence set, not the boundary of inquiry. `DOC-MNFS-DEVELOPMENT-GOVERNANCE-METHOD` governs how stronger Evidence may challenge and supersede prior authority before execution resumes.

## 3. Storage boundaries

### Git

Canonical human-readable product knowledge:

- Product Blueprint and ADRs;
- Capability Specs and Roadmap;
- development methods and Standards;
- accepted designs and approved plans;
- Operator Decisions;
- selected Evidence, guidance and research.

### `.mnfs/`

Canonical machine-readable repository artifacts:

- Repository ID;
- Approved Mission Contracts and immutable history;
- accepted Evidence promoted to the repository;
- Closeouts when materialized there by product flows.

### SQLite

Canonical operational state:

- Mission and plan revisions;
- Write Tracks, Attempts, Worker Runs, Claims and Leases;
- Decisions, Events and runtime Artifact references.

### Runtime Artifact Store

Generated or temporary:

- logs, prompts, traces and command outputs;
- review surfaces and screenshots;
- execution sources, worktrees and Lease helper Artifacts;
- raw conformance and implementation Evidence.

### GitHub

- Issue: tracking and discussion;
- PR: proposed change and review;
- merged canonical files: integrated result.

## 4. Canonical entrypoints

| Path | Purpose | Authority |
|---|---|---|
| `README.md` | product introduction and quick start | guidance |
| `AGENTS.md` | agent bootstrap, hard rules and current gate | guidance/index |
| `docs/DOCUMENTATION-MAP.md` | discovery, authority and read order | constitutional reference |
| `docs/tracking/STATUS.md` | current lifecycle/gates | tracking |
| `docs/tracking/DECISIONS.md` | Operator decisions | tracking of A1 authority |
| `docs/tracking/ARCHITECTURE-REALIZATION-REVIEW.md` | current architecture review scope and outputs | tracking |
| `docs/tracking/WORKLOG.md` | chronological implementation history | tracking |
| `docs/product/PRODUCT-BLUEPRINT.md` | generated complete Blueprint | generated constitutional projection |
| `docs/product/DEVELOPMENT-GOVERNANCE-METHOD.md` | Discovery/Decision/Execution, global-optimum and Replan policy | Standard / Policy |
| `docs/product/CAPABILITY-REALIZATION-METHOD.md` | Blueprint-to-build readiness method | Standard / Policy |
| `docs/roadmap.md` | capability and Product Milestone sequence | product plan |

## 5. Capability and contract authorities

```text
docs/product/DEVELOPMENT-GOVERNANCE-METHOD.md
docs/product/CAPABILITY-REALIZATION-METHOD.md
docs/capabilities/CAP-EXECUTION/SPEC.md
docs/capabilities/CAP-EXECUTION/TRACEABILITY.json
docs/capabilities/CAP-EXECUTION/COVERAGE.md
.mnfs/missions/MIS-002/plan.json
```

Current Approved Mission Contract:

```text
Mission:       MIS-002
Revision:      5
Schema:        2
Contract hash: sha256:d82252504044cab40e00013dc30534654382887b7819d60a916d2a9a56db4cc3
```

Historical revision 3 remains immutable under `.mnfs/missions/MIS-002/history/`.

Revision 5 remains execution authority unless a later Decision/Replan supersedes it. The Architecture Realization Review is allowed to conclude that supersession is globally preferable; it may not edit revision 5 in place.

## 6. Accepted M01 closeout package

M01 is closed through this authority/evidence chain:

```text
MIS-002 revision 5
→ CAP-EXECUTION requirements allocated to MIS-002/M01
→ DESIGN-MIS-002-M01-DURABLE-EXECUTION-LEASE-CORE 0.6.1
→ PLAN-MIS-002-M01-DURABLE-EXECUTION-LEASE-CORE 1.0.1
→ Tasks 1–14 implementation and verification
→ PR #17 historical implementation merge
→ PR #19 final production-integration/closeout merge
→ ACCEPTANCE-MIS-002-M01-IMPLEMENTATION-CLOSEOUT 1.1.0
→ Operator decision D-009
```

Deciding M01 Evidence includes the deterministic/fresh-process crash-and-retry composition suite and the historical real Treehouse normal-path proof. R2/R3 real crash/lineage scenarios remain supplemental operational hardening under Issue #20.

Architecture reassessment does not retroactively invalidate accepted M01 Evidence. A future architecture may preserve, supersede or migrate the M01 realization while retaining its historical proof.

## 7. Evidence proportionality and deferment

MNFS uses **criterion-driven Evidence**, not completion of an arbitrary test inventory, to decide an intermediate Mission Milestone.

A supplemental proof may be deferred only when:

- it is not the sole proof of a deciding criterion or MUST requirement;
- the existing Evidence covers the required invariant/integration assumption;
- destination, rationale, residual risk and Operator authority are recorded;
- it is never represented as PASS;
- deferment does not contradict the approved contract, Capability Spec or ADRs.

For M01, `MIS-002/M01/AC-08` remains satisfied by the deterministic/fresh-process crash-and-retry composition evidence plus the real normal-path Treehouse boundary proof. Issue #20 owns the additional R2/R3 real hardening before Product Milestone M2 exit (MCRM R7/R8), or earlier if the selected architecture exposes a concrete dependency.

This interpretation does not weaken Product Milestone R7/R8: M2 still requires complete Verification, Validation and Closeout before Product Milestone exit.

## 8. Current architecture-review read path

Before proposing architecture, sourcing or material Replan decisions, read:

```text
AGENTS.md
→ docs/DOCUMENTATION-MAP.md
→ docs/tracking/STATUS.md
→ docs/tracking/DECISIONS.md
→ docs/product/DEVELOPMENT-GOVERNANCE-METHOD.md
→ docs/tracking/ARCHITECTURE-REALIZATION-REVIEW.md
→ current Product Blueprint / ADR / Roadmap sources relevant to the decision
→ accepted Capability / Mission / Evidence sources affected by the decision
→ current research reports and exact primary external sources
→ current implementation where realization cost or compatibility matters
```

Do not treat current Blueprint/ADR/Mission choices as protected premises during Discovery. Treat them as current authority, accumulated Evidence and candidates to preserve or supersede.

### M02 resume read path

If Issue #23 concludes that M02 should resume, then read:

```text
Architecture Realization Review decision package
→ any superseding Blueprint / ADR / Roadmap / Capability / Replan artifacts
→ exact current Approved Mission Contract
→ accepted AS-02 / M01 Evidence still applicable
→ current M02 microdesign once created or revised
```

Do not resume from the old Issue #21 assumptions without reconciling the architecture review.

## 9. Historical and generated sources

Keep discoverable but out of normal execution packs:

- superseded designs and plan versions through Git history;
- rejected proposals and failed approaches;
- historical Mission revisions;
- raw Architecture Spike artifacts;
- previous roadmap states.

Generated projections include `PRODUCT-BLUEPRINT.md`, `roadmap.md`, CAP-EXECUTION coverage and plan `review.html`. Generated files carry a `DO NOT EDIT` header and are regenerated from their canonical sources.

## 10. Current gate

```text
M01:                              ACCEPTED / CLOSED — D-009
M01 R2/R3 hardening:              FOLLOW_UP_REQUIRED — Issue #20
Global Architecture Review:       AUTHORIZED / CURRENT — Issue #23 / D-010
M02 R5 microdesign next gate:      PAUSED — Issue #21
M02 production implementation:     PROHIBITED
Production Worker dispatch:        PROHIBITED
```

The next exact activity is the global Architecture Realization Review. It must search and compare credible architectures from first principles, adversarially challenge the preferred option, and issue explicit `PRESERVE / SUPERSEDE / REPLAN` impact on current product authority before M02 design or implementation resumes.
