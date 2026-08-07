---
id: DOC-DOCUMENTATION-MAP
title: MNFS Documentation Map
document_type: documentation_map
form: reference
authority: constitutional
status: accepted
version: 1.5.0
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
  - DOC-MNFS-CAPABILITY-REALIZATION-METHOD
  - CAP-EXECUTION
  - TRACKING-DECISIONS
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
tracking_issue: 21
---

# MNFS Documentation Map

> Accepted documentation authority and discovery map. This document indexes canonical sources and read paths; it does not redefine their content.

## 1. Current architecture phase

```text
M0 — Foundation Walking Skeleton                         ACCEPTED
M1 — Visual Mission Planning                            ACCEPTED
M2 — Secure One-Worker Vertical Slice                   IN_PROGRESS
  MIS-002/M01 — Durable Execution and Lease Core        ACCEPTED / CLOSED
  MIS-002/M02 — Governed E1 Worker, Recovery and Acceptance
                                                        R5 DESIGN PREPARATION
```

Current state:

- Product Blueprint Sections 1–13 and ADR-0001–ADR-0012 are accepted;
- `CAP-EXECUTION` version 0.1.0 is accepted;
- `MIS-002` revision 5 is the approved schema-v2 Mission contract at `sha256:d82252504044cab40e00013dc30534654382887b7819d60a916d2a9a56db4cc3`;
- MCRM R0–R4 pass for M2 readiness;
- M01 microdesign 0.6.1 and implementation plan 1.0.1 are accepted;
- PR #17 merged the historical M01 implementation baseline at `3722235a2c7a4d4d5fc11e55d8c4b8e6f025a8f7`;
- PR #19 merged the final production-integration and closeout delta at `a783cc5854163b0f1abc8a944286a540f9b653b8`;
- Operator decision `D-009` formally accepts the M01 closeout;
- real R2/R3 remain `FOLLOW_UP_REQUIRED` under Issue #20 and are not represented as PASS;
- Issue #21 owns M02 R5 microdesign preparation/review only; M02 implementation and Pi Worker dispatch remain prohibited.

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

Conflict precedence:

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

## 3. Storage boundaries

### Git

Canonical human-readable product knowledge:

- Product Blueprint and ADRs;
- Capability Specs and Roadmap;
- accepted designs and approved plans;
- Operator Decisions;
- selected Evidence, Standards, guidance and research.

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
| `docs/tracking/WORKLOG.md` | chronological implementation history | tracking |
| `docs/product/PRODUCT-BLUEPRINT.md` | generated complete Blueprint | generated constitutional projection |
| `docs/product/CAPABILITY-REALIZATION-METHOD.md` | Blueprint-to-build readiness method | Standard / Policy |
| `docs/roadmap.md` | capability and Product Milestone sequence | product plan |

## 5. Capability and contract authorities

```text
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

## 7. Evidence proportionality and deferment

MNFS uses **criterion-driven Evidence**, not completion of an arbitrary test inventory, to decide an intermediate Mission Milestone.

A supplemental proof may be deferred only when:

- it is not the sole proof of a deciding criterion or MUST requirement;
- the existing Evidence covers the required invariant/integration assumption;
- destination, rationale, residual risk and Operator authority are recorded;
- it is never represented as PASS;
- deferment does not contradict the approved contract, Capability Spec or ADRs.

For M01, `MIS-002/M01/AC-08` remains satisfied by the deterministic/fresh-process crash-and-retry composition evidence plus the real normal-path Treehouse boundary proof. Issue #20 owns the additional R2/R3 real hardening before Product Milestone M2 exit (MCRM R7/R8), or earlier if M02 exposes a concrete dependency.

This interpretation does not weaken Product Milestone R7/R8: M2 still requires complete Verification, Validation and Closeout before Product Milestone exit.

## 8. M02 canonical read path

Before designing or implementing `MIS-002/M02`, read:

```text
AGENTS.md
→ docs/DOCUMENTATION-MAP.md
→ docs/tracking/STATUS.md
→ docs/tracking/DECISIONS.md
→ .mnfs/missions/MIS-002/plan.json
→ docs/capabilities/CAP-EXECUTION/SPEC.md
→ docs/capabilities/CAP-EXECUTION/TRACEABILITY.json
→ accepted AS-02 Evidence and SEC-E1 sources
→ accepted M01 design/implementation closeout
→ applicable ADRs and Product Blueprint clauses
→ current M02 microdesign once created under Issue #21
```

Do not treat `.mnfs` runtime artifacts, conversations, terminal state or Issue discussion as product doctrine.

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
M01:                         ACCEPTED / CLOSED — D-009
M01 R2/R3 hardening:         FOLLOW_UP_REQUIRED — Issue #20
M02 research/microdesign:    AUTHORIZED — Issue #21
M02 production implementation: PROHIBITED
Pi Worker production dispatch: PROHIBITED
```

The next exact activity is deep preparation and adversarial review of the `MIS-002/M02` R5 Milestone Microdesign. A separate approved implementation plan and explicit Operator authorization are required before any M02 production code or Pi Worker dispatch.
