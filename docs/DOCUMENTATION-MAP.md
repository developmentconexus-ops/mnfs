---
id: DOC-DOCUMENTATION-MAP
title: MNFS Documentation Map
document_type: documentation_map
form: reference
authority: constitutional
status: accepted
version: 1.2.0
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
  - ACCEPTANCE-M01-R5-DESIGN-PACKAGE-REVIEW
review_triggers:
  - canonical document added, removed or superseded
  - documentation authority changes
  - Product Milestone changes
last_reviewed: 2026-08-03
tracking_issue: 16
---

# MNFS Documentation Map

> **Status:** Accepted documentation authority and discovery map.  
> This document indexes canonical sources. It does not redefine their content.

---

# 1. Current architecture phase

```text
M2 — Secure One-Worker Vertical Slice
MIS-002/M01 — Durable Execution and Lease Core
MCRM R5 — Milestone Microdesign IN_PROGRESS
```

Current state:

- M0 and M1 are accepted Product Milestone history;
- Product Blueprint Sections 1–13, ADR-0001–ADR-0012 and the Capability Realization Method are accepted;
- CAP-EXECUTION version 0.1.0 is accepted;
- MIS-002 revision 5 is the approved schema-v2 execution contract;
- R0–R4 are mechanically PASS;
- the Operator authorized R5 for M01 research, conformance and microdesign only;
- PR #14 was merged into `main` at `dee12a9b53984d39045421c9586ee53665ebc5e5`;
- Issue #16 and draft PR #17 own the current M01 R5 work;
- the R5 design package was approved for TC-01 planning;
- TC-01 protocol version 0.2.0 is accepted for harness implementation and WSL2 execution planning;
- the detailed TC-01 plan is current and awaiting Operator review;
- M01 production implementation and Pi Worker dispatch remain prohibited.

Tracking container:

```text
GitHub Issue #16
[DESIGN] MIS-002/M01 durable execution and Lease core
```

---

# 2. Authority hierarchy

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
Accepted specific ADR
→ Product Blueprint
→ accepted Capability Spec
→ scoped Approved Contract
→ accepted Milestone Microdesign
→ Standard / Policy / Profile
→ implementation Reference
→ Guidance
→ Tracking
→ Research / Historical
```

A conflict must be resolved rather than silently selecting whichever document was read first.

---

# 3. Storage boundaries

## Git

Canonical human-readable product knowledge:

- Product Blueprint;
- ADRs;
- Capability Specs;
- Roadmap;
- accepted microdesigns and implementation plans;
- Standards;
- Golden Paths;
- Repository Profile source;
- Reference;
- Guidance;
- Research;
- selected Evidence.

## `.mnfs/`

Canonical machine-readable repository artifacts:

- Repository ID;
- Approved Mission Contracts;
- accepted Evidence promoted to the repository;
- Closeouts.

## SQLite

Canonical operational state:

- active entities;
- revisions;
- Attempts;
- Worker Runs;
- Claims;
- Receipts;
- Findings;
- Decisions;
- Events;
- Leases;
- runtime Artifact references.

## Runtime Artifact Store

Generated and temporary:

- logs;
- prompts;
- review HTML;
- traces;
- screenshots;
- command outputs;
- temporary Evidence;
- TC-01 disposable fixtures and raw conformance artifacts.

## GitHub

- Issue: tracking and discussion;
- PR: proposed change and review;
- merged canonical files: accepted result.

---

# 4. Canonical entrypoints

| Path | Audience | Purpose | Authority |
|---|---|---|---|
| `README.md` | humans | product introduction and quick start | guidance |
| `AGENTS.md` | agents | short bootstrap and hard rules | guidance/index |
| `docs/DOCUMENTATION-MAP.md` | humans and agents | discovery, authority and read order | constitutional reference |
| `docs/product/README.md` | architecture readers | Product Blueprint index/version | constitutional index |
| `docs/product/PRODUCT-BLUEPRINT.md` | broad readers | generated complete publication | generated constitutional projection |
| `docs/product/CAPABILITY-REALIZATION-METHOD.md` | planners and Leads | Blueprint-to-build traceability and readiness | Standard / Policy |
| `docs/roadmap.md` | operators/contributors | capability sequence and proofs | product plan |
| `docs/tracking/STATUS.md` | operators/agents | current phase, gates and authorization | tracking |

---

# 5. Product Blueprint sources

Canonical editable paths:

| Section | Path | Status |
|---|---|---|
| 1 Product Vision | `docs/product/blueprint/01-product-vision.md` | accepted |
| 2 Domain Model | `docs/product/blueprint/02-domain-model.md` | accepted |
| 3 Lifecycle and Flows | `docs/product/blueprint/03-lifecycle-flows.md` | accepted |
| 4 Engineering System | `docs/product/blueprint/04-engineering-system.md` | accepted |
| 5 System Architecture | `docs/product/blueprint/05-system-architecture.md` | accepted |
| 6 Roles and Authority | `docs/product/blueprint/06-roles-authority.md` | accepted |
| 7 Quality and Evidence | `docs/product/blueprint/07-quality-evidence.md` | accepted |
| 8 State and Recovery | `docs/product/blueprint/08-state-recovery.md` | accepted |
| 9 Context and Memory | `docs/product/blueprint/09-context-memory.md` | accepted |
| 10 Security and Isolation | `docs/product/blueprint/10-security-isolation.md` | accepted |
| 11 Operator and Observability | `docs/product/blueprint/11-operator-observability.md` | accepted |
| 12 Capability Roadmap | `docs/product/blueprint/12-capability-roadmap.md` | accepted |
| 13 Documentation Governance | `docs/product/blueprint/13-documentation-governance.md` | accepted |

Generated aggregate:

```text
docs/product/PRODUCT-BLUEPRINT.md
```

The aggregate must not be edited directly.

---

# 6. ADR decision log

Accepted ADRs:

| ADR | Decision |
|---|---|
| ADR-0001 | Pi-first WSL2 architecture |
| ADR-0002 | SQLite operational state plus append-only Events |
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

Canonical paths:

```text
docs/adr/README.md
docs/adr/template.md
docs/adr/0001-*.md
```

---

# 7. Capability Realization Method and Capability Specs

Canonical method:

```text
docs/product/CAPABILITY-REALIZATION-METHOD.md
```

It owns applicability, requirements derivation, bidirectional traceability, readiness gates R0–R8, orphan detection and Product Milestone closeout.

Current Capability Spec:

```text
docs/capabilities/CAP-EXECUTION/
```

A Capability Spec owns reusable product design. A Mission Contract owns scoped delivery. A Milestone Microdesign owns the implementation design for one Mission Milestone without changing higher authority.

Future Capability candidates are created only when their Product Milestone approaches execution:

```text
CAP-ENGINEERING-SYSTEM
CAP-REVIEW
CAP-INTEGRATION
CAP-QUALITY
CAP-EXTERNAL-EFFECTS
CAP-DELIVERY
CAP-OBSERVABILITY
```

---

# 8. Roadmap

Canonical generated roadmap:

```text
docs/roadmap.md
```

Source:

```text
docs/product/blueprint/12-capability-roadmap.md
```

The roadmap preserves M0 and M1 as accepted history and defines Product Milestones M2–M12 plus separate Architecture Spikes.

---

# 9. Mission Contracts

Machine-readable path:

```text
.mnfs/missions/<mission-id>/plan.json
```

Current approved artifact:

```text
Mission:       MIS-002
Revision:      5
Schema:        2
Contract hash: sha256:d82252504044cab40e00013dc30534654382887b7819d60a916d2a9a56db4cc3
```

Historical revision 3 remains immutable at:

```text
.mnfs/missions/MIS-002/history/revision-0003.json
```

Do not edit Mission contract materializations manually.

---

# 10. Current M01 R5 package

Read in this order:

```text
AGENTS.md
→ docs/DOCUMENTATION-MAP.md
→ docs/tracking/STATUS.md
→ .mnfs/missions/MIS-002/plan.json
→ docs/capabilities/CAP-EXECUTION/SPEC.md
→ docs/capabilities/CAP-EXECUTION/TRACEABILITY.json
→ relevant ADRs and Product Blueprint Sections 2, 5, 7, 8, 9, 10 and 12
→ docs/research/MNFS-RESEARCH-M01-EXECUTION-LEASE-CORE-v1.md
→ docs/design/2026-08-03-tc-01-treehouse-production-adapter-conformance.md
→ docs/design/2026-08-03-mis-002-m01-durable-execution-lease-core.md
→ docs/superpowers/plans/2026-08-03-tc-01-treehouse-production-adapter-conformance.md
```

Current authority:

```text
Research:               published Evidence
TC-01 protocol:         accepted specification
TC-01 plan:             current guidance, awaiting review
M01 microdesign:        proposed specification, not final
M01 implementation:     prohibited
Pi Worker dispatch:     prohibited
```

---

# 11. Engineering System

Future canonical sources:

```text
docs/standards/
docs/golden-paths/
docs/repository-profile/
```

Ownership:

| Concept | Owner |
|---|---|
| Engineering Standard | Standard file |
| Golden Path | Path file |
| Repository-specific binding | Repository Profile |
| Effective binding for Mission | Current Authority Snapshot / approved execution policy |

---

# 12. Research reports

Research is Evidence, not Authority.

Published reports:

```text
docs/research/MNFS-RESEARCH-PI-MEMORY-CONTEXT-MESSAGING-v1.md
docs/research/MNFS-RESEARCH-SECURITY-ISOLATION-ENVIRONMENTS-v1.md
docs/research/MNFS-RESEARCH-OPERATOR-OBSERVABILITY-CALIBRATION-v1.md
docs/research/MNFS-RESEARCH-CAPABILITY-ROADMAP-v1.md
docs/research/MNFS-RESEARCH-DOCUMENTATION-GOVERNANCE-v1.md
docs/research/MNFS-RESEARCH-M01-EXECUTION-LEASE-CORE-v1.md
```

Architecture source maps:

```text
docs/research/LEGACY-MNFS-HARNESS-MAP.md
docs/research/FIRSTMATE-INSPIRATION-MAP.md
```

Each published research report has a validated `*.sources.json` manifest.

---

# 13. Design and implementation documents

Designs:

```text
docs/design/
```

Detailed implementation plans:

```text
docs/superpowers/plans/
```

Authority:

```text
below Capability Spec and Mission Contract
```

A microdesign or plan cannot change an Approved Contract or accepted ADR. A plan cannot authorize work that its governing microdesign or Operator gate prohibits.

---

# 14. Tracking and Evidence

Tracking:

```text
docs/tracking/STATUS.md
docs/tracking/WORKLOG.md
docs/tracking/DECISIONS.md
```

Accepted Evidence:

```text
docs/acceptance/
```

Relevant current Evidence:

```text
docs/acceptance/2026-08-03-m2-unblock.md
docs/acceptance/2026-08-03-m01-r5-design-package-review.md
```

TC-01 runtime artifacts remain outside Git until an Operator-reviewed report is promoted.

Tracking never owns architecture.

---

# 15. Human read paths

## New user

```text
README
→ Documentation Map
→ Product Blueprint overview
→ Roadmap
```

## Contributor

```text
README
→ CONTRIBUTING
→ Documentation Map
→ relevant Capability Spec
→ related ADRs
→ active contract/design/plan
```

## Architecture contributor

```text
Documentation Map
→ complete Blueprint
→ ADR log
→ relevant Research
→ active design issue and PR
```

---

# 16. Agent read paths

## Lead

```text
AGENTS.md
→ mnfs status
→ Current Authority Snapshot when implemented
→ Approved Mission Contract
→ relevant Spec, ADRs and active design/plan
```

## Writer

```text
Current Authority Snapshot
→ Writer Pack
→ exact code/contracts
```

## Reviewer

```text
Review Pack
→ fixed diff/SHA
→ criteria
→ Standards
→ related Spec/ADR
```

## QA

```text
QA Pack
→ Journey
→ Environment
→ expected observations
```

Agents do not load the full Blueprint by default.

---

# 17. Ownership

Initial owner:

```text
developmentconexus-ops
```

Paths requiring owner review:

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

Operator approval remains a Domain Authority separate from Git write access.

---

# 18. Documentation checks

Required checks include:

```text
frontmatter schema
unique document IDs
relation target validation
status validation
owner validation
ADR index and numbering
supersession consistency
Blueprint aggregate freshness
Mission Plan schema
hierarchical IDs
generated-file headers
documentation-impact declaration
accepted-doc placeholder check
research source-manifest validation
```

---

# 19. Documentation impact

Every material PR/Claim declares:

```yaml
documentation_impact:
  status: NONE | UPDATED | FOLLOW_UP_REQUIRED
  affected: []
  rationale: ""
  follow_up: null
```

A material change cannot use `NONE` without a specific rationale.

---

# 20. Superseded and historical sources

Keep discoverable:

- accepted ADRs later superseded;
- rejected proposals;
- historical Mission revisions;
- legacy research;
- Architecture Spike results;
- previous roadmap states through Git;
- failed approaches with durable learning.

Do not load them into normal execution Context Packs.

---

# 21. Generated projections

| Projection | Source |
|---|---|
| `PRODUCT-BLUEPRINT.md` | 13 modular section files |
| `roadmap.md` | Product Blueprint Section 12 |
| `CAP-EXECUTION/COVERAGE.md` | structured traceability |
| `review.html` | structured Plan Revision |
| future CLI reference | command schemas/help |
| future static site | canonical Markdown sources |
| generated diagrams | structured source |

Generated files carry a `DO NOT EDIT` header.

---

# 22. Current documentation divergences

No known authority-map blocker remains from AB1 or the MIS-002 Replan.

Open R5 Evidence/design work:

1. review the detailed TC-01 implementation/execution plan;
2. implement its deterministic harness through TDD after approval;
3. execute TC-01 on canonical WSL2;
4. promote the exact conformance Verdict;
5. reconcile the M01 microdesign with observed limitations;
6. complete final constructive and adversarial design review;
7. obtain explicit final microdesign approval before production implementation planning.

---

# 23. Immediate next action

```text
Review docs/superpowers/plans/2026-08-03-tc-01-treehouse-production-adapter-conformance.md.
```

After approval:

```text
implement deterministic TC-01 harness
→ canonical CI
→ real WSL2 conformance
→ reconcile M01 microdesign
→ final R5 approval
```

M01 production implementation and Pi Worker dispatch remain prohibited.
