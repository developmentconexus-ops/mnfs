---
id: DOC-DOCUMENTATION-MAP
title: MNFS Documentation Map
document_type: documentation_map
form: reference
authority: constitutional
status: accepted
version: 1.4.0
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
  - CAP-EXECUTION
  - ACCEPTANCE-M2-UNBLOCK
  - ACCEPTANCE-TC-01-TREEHOUSE-PRODUCTION-ADAPTER
  - REVIEW-MIS-002-M01-R5-FINAL
  - ACCEPTANCE-MIS-002-M01-R5-APPROVAL
  - DESIGN-MIS-002-M01-DURABLE-EXECUTION-LEASE-CORE
  - PLAN-MIS-002-M01-DURABLE-EXECUTION-LEASE-CORE
review_triggers:
  - canonical document added, removed or superseded
  - documentation authority changes
  - Product Milestone changes
last_reviewed: 2026-08-04
tracking_issue: 16
---

# MNFS Documentation Map

> Accepted documentation authority and discovery map. This document indexes canonical sources and current read paths; it does not redefine their content.

## 1. Current architecture phase

```text
M2 — Secure One-Worker Vertical Slice
MIS-002/M01 — Durable Execution and Lease Core
MCRM R5 — PASS
M01 implementation plan — REVIEW PENDING
```

Current state:

- M0 and M1 are accepted Product Milestone history;
- Product Blueprint Sections 1–13, ADR-0001–ADR-0012 and the Capability Realization Method are accepted;
- CAP-EXECUTION version 0.1.0 is accepted;
- MIS-002 revision 5 is the approved schema-v2 contract at `sha256:d82252504044cab40e00013dc30534654382887b7819d60a916d2a9a56db4cc3`;
- R0–R5 pass for the exact accepted M01 microdesign version 0.6.1;
- PR #14 is integrated in `main` at `dee12a9b53984d39045421c9586ee53665ebc5e5`;
- Issue #16 and draft PR #17 own the current M01 work;
- canonical TC-01 WSL2 Evidence is `ACCEPT`, S01–S15 all `PASS`, cleanup `COMPLETED`;
- final R5 review closed all 3 Critical and all 8 Important findings;
- Operator decision `D-007` accepted microdesign 0.6.1 and closed R5;
- implementation plan 1.0.1 is current and awaiting exact Operator approval;
- Task 1 RED, production implementation, Pi dispatch and automatic merge remain prohibited.

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
→ approved implementation plan
→ implementation Reference
→ other Guidance
→ Tracking
→ Research / Historical
```

An implementation plan cannot change the accepted microdesign, Mission contract, Capability or ADR. Conflicts are resolved explicitly.

## 3. Storage boundaries

### Git

Canonical human-readable product knowledge:

- Product Blueprint and ADRs;
- Capability Specs and Roadmap;
- accepted designs and approved plans;
- selected Evidence, Standards, guidance and research.

### `.mnfs/`

Canonical machine-readable repository artifacts:

- Repository ID;
- Approved Mission Contracts and immutable history;
- accepted Evidence promoted to the repository;
- Closeouts.

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
| `AGENTS.md` | agent bootstrap and hard rules | guidance/index |
| `docs/DOCUMENTATION-MAP.md` | discovery, authority and read order | constitutional reference |
| `docs/product/PRODUCT-BLUEPRINT.md` | generated complete Blueprint | generated constitutional projection |
| `docs/product/CAPABILITY-REALIZATION-METHOD.md` | Blueprint-to-build readiness method | Standard / Policy |
| `docs/roadmap.md` | capability and Product Milestone sequence | product plan |
| `docs/tracking/STATUS.md` | current gates and authorization | tracking |
| `docs/tracking/DECISIONS.md` | Operator decisions | tracking |

## 5. Product Blueprint and ADRs

Canonical editable Blueprint sources are `docs/product/blueprint/01-*.md` through `13-*.md`; `docs/product/PRODUCT-BLUEPRINT.md` is generated and must not be edited directly.

Accepted ADRs are indexed at:

```text
docs/adr/README.md
```

Current M01 decisions depend especially on ADR-0002, ADR-0003, ADR-0005 and ADR-0006. A semantic change requires a superseding ADR.

## 6. Capability and contract authorities

```text
docs/product/CAPABILITY-REALIZATION-METHOD.md
docs/capabilities/CAP-EXECUTION/SPEC.md
docs/capabilities/CAP-EXECUTION/TRACEABILITY.json
docs/capabilities/CAP-EXECUTION/COVERAGE.md
```

Current Approved Mission Contract:

```text
.mnfs/missions/MIS-002/plan.json
Mission:       MIS-002
Revision:      5
Schema:        2
Contract hash: sha256:d82252504044cab40e00013dc30534654382887b7819d60a916d2a9a56db4cc3
```

Historical revision 3 remains immutable under `.mnfs/missions/MIS-002/history/`.

## 7. Current M01 authority package

Read in this order:

```text
AGENTS.md
→ docs/DOCUMENTATION-MAP.md
→ docs/tracking/STATUS.md
→ docs/tracking/DECISIONS.md
→ .mnfs/missions/MIS-002/plan.json
→ docs/capabilities/CAP-EXECUTION/SPEC.md
→ docs/capabilities/CAP-EXECUTION/TRACEABILITY.json
→ ADR-0002 / ADR-0003 / ADR-0005 / ADR-0006
→ Product Blueprint Sections 2, 5, 7, 8, 9, 10 and 12
→ docs/research/MNFS-RESEARCH-M01-EXECUTION-LEASE-CORE-v1.md
→ docs/design/2026-08-03-tc-01-treehouse-production-adapter-conformance.md
→ docs/acceptance/2026-08-03-tc-01-treehouse-production-adapter.md
→ docs/acceptance/2026-08-04-mis-002-m01-final-r5-review.md
→ docs/acceptance/2026-08-04-mis-002-m01-r5-approval.md
→ docs/design/2026-08-03-mis-002-m01-durable-execution-lease-core.md
→ docs/superpowers/plans/2026-08-04-mis-002-m01-durable-execution-lease-core-implementation.md
```

Current authority:

```text
Research:                 published Evidence
TC-01 protocol:           accepted specification
TC-01 runtime Evidence:   accepted Evidence
Final R5 review:          accepted Evidence
M01 microdesign:          accepted specification version 0.6.1
MCRM R5:                  PASS
M01 implementation plan: current guidance version 1.0.1 / review pending
Task 1 RED:               prohibited until plan approval and continuation
M01 production code:      prohibited
Pi Worker dispatch:       prohibited
```

The TC-01 harness plan is historical/current guidance for the completed spike. It is not the M01 production implementation plan.

## 8. Accepted M01 invariants

The implementation plan and any later code must preserve:

1. canonical checkout is never Treehouse cwd;
2. every Attempt owns an independent Linux-local exact-base source;
3. sources have zero remotes, no alternates, no shared common directory and no hardlinked canonical objects;
4. Treehouse uses controlled HOME/XDG/config/hooks and exact accepted candidate identity;
5. semantic state and matching payload-versioned Event commit atomically;
6. relational keys prove exact Track → Attempt → Run/Lease → Claim ancestry;
7. Claim result is a Git tree in the exact Attempt source;
8. grant, release and Claim idempotency bind unique keys to canonical input hashes;
9. LeaseActionRunner records STARTED before one external invocation;
10. an inconclusive STARTED grant never automatically repeats `treehouse get`;
11. release is conditional, idempotent and fully fenced;
12. dirty, ambiguous and unclassified work is preserved;
13. plain Recovery performs no domain or resource mutation;
14. M01 contains no Pi dispatch, Claim completion, Receipt or Gate.

A material change to these invariants triggers renewed design/replan review.

## 9. Design, plans, tracking and Evidence

Designs:

```text
docs/design/
```

Implementation plans:

```text
docs/superpowers/plans/
```

Tracking:

```text
docs/tracking/STATUS.md
docs/tracking/WORKLOG.md
docs/tracking/DECISIONS.md
```

Relevant accepted Evidence:

```text
docs/acceptance/2026-08-03-m2-unblock.md
docs/acceptance/2026-08-03-m01-r5-design-package-review.md
docs/acceptance/2026-08-03-tc-01-treehouse-production-adapter.md
docs/acceptance/2026-08-04-tc-01-task-12-deterministic-adversarial-review.md
docs/acceptance/2026-08-04-mis-002-m01-final-r5-review.md
docs/acceptance/2026-08-04-mis-002-m01-r5-approval.md
```

Tracking never owns architecture. Evidence records observations and authority decisions; a plan needs its own approval before execution.

## 10. Human and agent read paths

### New user

```text
README → Documentation Map → Product Blueprint → Roadmap
```

### Contributor

```text
README → CONTRIBUTING → Documentation Map → relevant Spec/ADR → active contract/design/plan
```

### Lead or implementation planner

```text
AGENTS.md
→ STATUS
→ Decisions
→ Approved Mission Contract
→ Capability Spec and TRACEABILITY
→ accepted microdesign
→ current implementation plan
```

### Writer during authorized implementation

```text
accepted microdesign
→ approved implementation plan
→ exact current task/interfaces/tests
→ current code and contract
```

Agents do not load the entire Blueprint by default, but architecture and planning work must follow the current package read order.

## 11. Ownership and checks

Operator Domain Authority is separate from Git write access.

Required checks include:

```text
frontmatter schema and unique IDs
relation target and status validation
owner and ADR-index validation
supersession consistency
Blueprint/roadmap/coverage freshness
Mission Plan schema and hierarchical IDs
generated-file headers
documentation/requirements impact
accepted-doc placeholder checks
research source-manifest validation
```

## 12. Historical and generated sources

Keep discoverable but out of normal execution packs:

- superseded designs and plan versions through Git history;
- rejected proposals and failed approaches;
- historical Mission revisions;
- raw Architecture Spike artifacts;
- previous roadmap states.

Generated projections include `PRODUCT-BLUEPRINT.md`, `roadmap.md`, CAP-EXECUTION coverage and plan `review.html`. Generated files carry a `DO NOT EDIT` header.

## 13. Current divergence and immediate gate

No unresolved authority-map blocker remains from AB1, the MIS-002 Replan, TC-01 or MCRM R5.

Current gate:

```text
review PLAN-MIS-002-M01-DURABLE-EXECUTION-LEASE-CORE version 1.0.1
→ exact Operator approval, requested changes or rejection
```

Only after an exact plan approval and a separate continuation may Task 1 RED begin.

```text
M01 production implementation: PROHIBITED
Pi Worker dispatch:             PROHIBITED
PR #17 merge:                   NOT AUTHORIZED
```
