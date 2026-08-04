---
id: DOC-DOCUMENTATION-MAP
title: MNFS Documentation Map
document_type: documentation_map
form: reference
authority: constitutional
status: accepted
version: 1.3.0
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
MCRM R5 — Milestone Microdesign IN_PROGRESS
```

Current state:

- M0 and M1 are accepted Product Milestone history;
- Product Blueprint Sections 1–13, ADR-0001–ADR-0012 and the Capability Realization Method are accepted;
- CAP-EXECUTION version 0.1.0 is accepted;
- MIS-002 revision 5 is the approved schema-v2 contract at `sha256:d82252504044cab40e00013dc30534654382887b7819d60a916d2a9a56db4cc3`;
- R0–R4 mechanically pass;
- PR #14 is integrated in `main` at `dee12a9b53984d39045421c9586ee53665ebc5e5`;
- Issue #16 and draft PR #17 own M01 R5;
- TC-01 protocol and plan are accepted;
- canonical TC-01 WSL2 Evidence is `ACCEPT`, S01–S15 all `PASS`, cleanup `COMPLETED`;
- Task 14 constructive/adversarial review recommends microdesign `0.6.1` as approvable;
- R5 remains `IN_PROGRESS` pending exact Operator approval of version `0.6.1`;
- M01 implementation, Pi dispatch and automatic merge remain prohibited.

Tracking container:

```text
GitHub Issue #16
[DESIGN] MIS-002/M01 durable execution and Lease core
```

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
→ implementation Reference
→ Guidance
→ Tracking
→ Research / Historical
```

Conflicts are resolved explicitly; readers must not silently select whichever document appeared first.

## 3. Storage boundaries

### Git

Canonical human-readable product knowledge:

- Product Blueprint and ADRs;
- Capability Specs and Roadmap;
- accepted designs and plans;
- Standards, Golden Paths and Repository Profile source;
- selected Evidence, guidance and research.

### `.mnfs/`

Canonical machine-readable repository artifacts:

- Repository ID;
- Approved Mission Contracts and immutable history;
- accepted Evidence promoted to the repository;
- Closeouts.

### SQLite

Canonical operational state:

- active entities and revisions;
- Attempts, Worker Runs, Claims and Leases;
- Findings, Decisions, Verdicts and Events;
- runtime Artifact references.

### Runtime Artifact Store

Generated or temporary:

- logs, prompts, traces and command outputs;
- review HTML and screenshots;
- raw conformance Evidence;
- execution sources, worktrees and helper Artifacts.

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

## 5. Product Blueprint

Canonical editable sources:

| Section | Path |
|---|---|
| 1 Product Vision | `docs/product/blueprint/01-product-vision.md` |
| 2 Domain Model | `docs/product/blueprint/02-domain-model.md` |
| 3 Lifecycle and Flows | `docs/product/blueprint/03-lifecycle-flows.md` |
| 4 Engineering System | `docs/product/blueprint/04-engineering-system.md` |
| 5 System Architecture | `docs/product/blueprint/05-system-architecture.md` |
| 6 Roles and Authority | `docs/product/blueprint/06-roles-authority.md` |
| 7 Quality and Evidence | `docs/product/blueprint/07-quality-evidence.md` |
| 8 State and Recovery | `docs/product/blueprint/08-state-recovery.md` |
| 9 Context and Memory | `docs/product/blueprint/09-context-memory.md` |
| 10 Security and Isolation | `docs/product/blueprint/10-security-isolation.md` |
| 11 Operator and Observability | `docs/product/blueprint/11-operator-observability.md` |
| 12 Capability Roadmap | `docs/product/blueprint/12-capability-roadmap.md` |
| 13 Documentation Governance | `docs/product/blueprint/13-documentation-governance.md` |

Generated aggregate:

```text
docs/product/PRODUCT-BLUEPRINT.md
```

The aggregate must not be edited directly.

## 6. Architecture Decision Log

Accepted ADRs:

| ADR | Decision |
|---|---|
| ADR-0001 | Pi-first WSL2 architecture |
| ADR-0002 | SQLite current state plus append-only Events |
| ADR-0003 | Worktree per concurrent Write Track |
| ADR-0004 | Memory strata and Session Observational Memory |
| ADR-0005 | Durable coordination versus ephemeral transport |
| ADR-0006 | Security planes and local execution isolation |
| ADR-0007 | Credential Grants and External Effects |
| ADR-0008 | Reproducible and remote Execution Environments |
| ADR-0009 | Operator Control Plane and presentation surfaces |
| ADR-0010 | Telemetry model and OpenTelemetry export |
| ADR-0011 | Evaluation and Calibration framework |
| ADR-0012 | Documentation authority and lifecycle |

Index:

```text
docs/adr/README.md
```

An architectural semantic change requires a superseding ADR; an active microdesign cannot silently change an accepted decision.

## 7. Capability and contract authorities

Capability method:

```text
docs/product/CAPABILITY-REALIZATION-METHOD.md
```

Current accepted Capability Spec:

```text
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

A Capability Spec owns reusable design. The Mission Contract owns scoped delivery. A Milestone Microdesign owns one Mission Milestone implementation design without changing higher authority.

## 8. Current M01 R5 package

Read in this order:

```text
AGENTS.md
→ docs/DOCUMENTATION-MAP.md
→ docs/tracking/STATUS.md
→ .mnfs/missions/MIS-002/plan.json
→ docs/capabilities/CAP-EXECUTION/SPEC.md
→ docs/capabilities/CAP-EXECUTION/TRACEABILITY.json
→ relevant ADRs
→ Product Blueprint Sections 2, 5, 7, 8, 9, 10 and 12
→ docs/research/MNFS-RESEARCH-M01-EXECUTION-LEASE-CORE-v1.md
→ docs/design/2026-08-03-tc-01-treehouse-production-adapter-conformance.md
→ docs/acceptance/2026-08-03-tc-01-treehouse-production-adapter.md
→ docs/design/2026-08-03-mis-002-m01-durable-execution-lease-core.md
→ docs/acceptance/2026-08-04-mis-002-m01-final-r5-review.md
```

Current authority:

```text
Research:                published Evidence
TC-01 protocol:          accepted specification
TC-01 runtime Evidence:  accepted Evidence
Task 14 review:          current Evidence / recommendation
M01 microdesign:         proposed specification version 0.6.1
M01 implementation:      prohibited
Pi Worker dispatch:      prohibited
```

The old TC-01 implementation plan remains historical/current guidance for Tasks 1–13; it is not the M01 production implementation plan.

## 9. Engineering System

Future canonical sources:

```text
docs/standards/
docs/golden-paths/
docs/repository-profile/
```

| Concept | Owner |
|---|---|
| Engineering Standard | Standard file |
| Golden Path | path file |
| repository-specific binding | Repository Profile |
| effective Mission binding | Current Authority Snapshot / approved policy |

## 10. Research

Research is Evidence, not architecture authority.

Published reports include:

```text
docs/research/MNFS-RESEARCH-PI-MEMORY-CONTEXT-MESSAGING-v1.md
docs/research/MNFS-RESEARCH-SECURITY-ISOLATION-ENVIRONMENTS-v1.md
docs/research/MNFS-RESEARCH-OPERATOR-OBSERVABILITY-CALIBRATION-v1.md
docs/research/MNFS-RESEARCH-CAPABILITY-ROADMAP-v1.md
docs/research/MNFS-RESEARCH-DOCUMENTATION-GOVERNANCE-v1.md
docs/research/MNFS-RESEARCH-M01-EXECUTION-LEASE-CORE-v1.md
```

Each published research report has a validated source manifest.

## 11. Design, plans, tracking and Evidence

Designs:

```text
docs/design/
```

Detailed implementation plans:

```text
docs/superpowers/plans/
```

Tracking:

```text
docs/tracking/STATUS.md
docs/tracking/WORKLOG.md
docs/tracking/DECISIONS.md
```

Selected accepted/current Evidence:

```text
docs/acceptance/2026-08-03-m2-unblock.md
docs/acceptance/2026-08-03-m01-r5-design-package-review.md
docs/acceptance/2026-08-03-tc-01-treehouse-production-adapter.md
docs/acceptance/2026-08-04-tc-01-task-12-deterministic-adversarial-review.md
docs/acceptance/2026-08-04-mis-002-m01-final-r5-review.md
```

Tracking never owns architecture. Evidence records observations and review; it does not create implementation authority.

## 12. Human and agent read paths

### New user

```text
README
→ Documentation Map
→ Product Blueprint overview
→ Roadmap
```

### Contributor

```text
README
→ CONTRIBUTING
→ Documentation Map
→ relevant Capability Spec
→ ADRs
→ active contract/design/plan
```

### Lead

```text
AGENTS.md
→ STATUS
→ Approved Mission Contract
→ Capability Spec and TRACEABILITY
→ active microdesign/review
```

### Writer

```text
Current Authority Snapshot when implemented
→ Writer Pack
→ exact code/contracts
```

### Reviewer / QA

```text
fixed Review or QA Pack
→ exact SHA/criteria
→ Standards and related Spec/ADR
→ deciding observations
```

Agents do not load the entire Blueprint by default, but must follow the current package read order for architecture work.

## 13. Ownership and checks

Initial owner:

```text
developmentconexus-ops
```

Paths requiring owner review include:

```text
/docs/product/
/docs/adr/
/docs/capabilities/
/docs/design/
/docs/acceptance/
/docs/standards/
/docs/golden-paths/
/docs/repository-profile/
/.mnfs/
AGENTS.md
.github/CODEOWNERS
```

Operator Domain Authority remains separate from Git write access.

Required documentation checks include:

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

## 14. Historical and generated sources

Keep discoverable but out of normal execution packs:

- superseded ADRs and designs;
- rejected proposals and failed approaches;
- historical Mission revisions;
- Architecture Spike raw results;
- previous roadmap states through Git.

Generated projections:

| Projection | Source |
|---|---|
| `PRODUCT-BLUEPRINT.md` | 13 modular Blueprint files |
| `roadmap.md` | Blueprint Section 12 |
| `CAP-EXECUTION/COVERAGE.md` | TRACEABILITY |
| `review.html` | structured Plan Revision |
| future CLI reference | command schemas/help |

Generated files carry a `DO NOT EDIT` header.

## 15. Current divergence and immediate gate

No unresolved authority-map blocker remains from AB1, the MIS-002 Replan or TC-01.

Current gate:

```text
review microdesign 0.6.1 and REVIEW-MIS-002-M01-R5-FINAL
→ obtain explicit Operator decision
```

After approval, the only next authorized work is:

```text
write a separate M01 production TDD implementation plan
→ review and approve that plan
→ only then consider implementation authorization
```

M01 production implementation, Pi Worker dispatch and automatic PR merge remain prohibited.
