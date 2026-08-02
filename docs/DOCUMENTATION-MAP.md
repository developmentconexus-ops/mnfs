---
id: DOC-DOCUMENTATION-MAP
title: MNFS Documentation Map
document_type: documentation_map
form: reference
authority: constitutional
status: accepted
version: 1.0.0
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
  - GH-ISSUE-6
review_triggers:
  - canonical document added, removed or superseded
  - documentation authority changes
  - Product Milestone changes
last_reviewed: 2026-08-02
tracking_issue: 6
---

# MNFS Documentation Map

> **Status:** Accepted documentation authority map for the Architecture Baseline.  
> This document indexes canonical sources. It does not redefine their content.

---

# 1. Current architecture phase

```text
AB1 — Architecture Baseline and Contract Reconciliation
```

Current state:

- M0 and M1 are accepted history;
- Product Blueprint Sections 1–13 and the Capability Realization Method are approved;
- Architecture Baseline PR #11 contains the canonical documentation package;
- documentation CI is active and review corrections are being applied;
- ADR-0004–ADR-0012, roadmap v2, research maps and CAP-EXECUTION are present;
- MIS-002 revision 3 is preserved byte-for-byte and pending Replan;
- M2 remains blocked by #7, #8, #9 and explicit Operator unblock.

Tracking container:

```text
GitHub Issue #6
[ARCH] Establish the complete MNFS product blueprint before M2
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
- temporary Evidence.

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

---

# 5. Product Blueprint sources

Proposed canonical editable paths:

| Section | Path | Status |
|---|---|---|
| 1 Product Vision | `docs/product/blueprint/01-product-vision.md` | approved content |
| 2 Domain Model | `docs/product/blueprint/02-domain-model.md` | approved content |
| 3 Lifecycle and Flows | `docs/product/blueprint/03-lifecycle-flows.md` | approved content |
| 4 Engineering System | `docs/product/blueprint/04-engineering-system.md` | approved content |
| 5 System Architecture | `docs/product/blueprint/05-system-architecture.md` | approved content |
| 6 Roles and Authority | `docs/product/blueprint/06-roles-authority.md` | approved content |
| 7 Quality and Evidence | `docs/product/blueprint/07-quality-evidence.md` | approved content |
| 8 State and Recovery | `docs/product/blueprint/08-state-recovery.md` | approved content |
| 9 Context and Memory | `docs/product/blueprint/09-context-memory.md` | approved content |
| 10 Security and Isolation | `docs/product/blueprint/10-security-isolation.md` | approved content |
| 11 Operator and Observability | `docs/product/blueprint/11-operator-observability.md` | approved content |
| 12 Capability Roadmap | `docs/product/blueprint/12-capability-roadmap.md` | approved content |
| 13 Documentation Governance | `docs/product/blueprint/13-documentation-governance.md` | approved content |

Generated aggregate:

```text
docs/product/PRODUCT-BLUEPRINT.md
```

The aggregate must not be edited directly.

---

# 6. ADR decision log

Current accepted ADRs:

| ADR | Ownership |
|---|---|
| ADR-0001 | Pi-first WSL2 architecture |
| ADR-0002 | SQLite current state plus append-only Events |
| ADR-0003 | Worktree per concurrent Write Track |

Architecture Baseline decisions published in PR #11:

| ADR | Proposed decision |
|---|---|
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

# 7. Capability Realization Method

Canonical source:

```text
docs/product/CAPABILITY-REALIZATION-METHOD.md
```

It owns applicability, requirements derivation, bidirectional traceability, readiness gates R0–R8, orphan detection and Product Milestone closeout.

Current first capability:

```text
docs/capabilities/CAP-EXECUTION/
```

---

# 7. Capability Specifications

Proposed authority:

```text
docs/capabilities/CAP-*/SPEC.md
```

A Capability Spec owns reusable product design.

A Mission Contract owns scoped implementation.

Initial candidates:

```text
CAP-EXECUTION
CAP-ENGINEERING-SYSTEM
CAP-REVIEW
CAP-INTEGRATION
CAP-QUALITY
CAP-EXTERNAL-EFFECTS
CAP-DELIVERY
CAP-OBSERVABILITY
```

Create each only when its Product Milestone approaches execution.

---

# 8. Roadmap

Current repository document:

```text
docs/roadmap.md
```

Current short M0–M6 content:

```text
status: current but scheduled for supersession
```

Proposed replacement:

```text
Product Blueprint Section 12
→ source for roadmap v2
```

The replacement preserves M0 and M1 as accepted history and expands M2–M12.

---

# 9. Mission Contracts

Machine-readable path:

```text
.mnfs/missions/<mission-id>/plan.json
```

Current important artifact:

```text
.mnfs/missions/MIS-002/plan.json
revision 3
```

Status:

```text
historically approved
architecturally stale
preserve
supersede through Replan
```

Do not edit revision 3 manually.

---

# 10. Engineering System

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
| Effective binding for Mission | Context Pack / approved execution policy |

---

# 11. Research reports

Research is Evidence, not Authority.

Published Architecture Baseline research reports:

```text
docs/research/MNFS-RESEARCH-PI-MEMORY-CONTEXT-MESSAGING-v1.md
docs/research/MNFS-RESEARCH-SECURITY-ISOLATION-ENVIRONMENTS-v1.md
docs/research/MNFS-RESEARCH-OPERATOR-OBSERVABILITY-CALIBRATION-v1.md
docs/research/MNFS-RESEARCH-CAPABILITY-ROADMAP-v1.md
docs/research/MNFS-RESEARCH-DOCUMENTATION-GOVERNANCE-v1.md
```

Architecture source maps required by Issue #6:

```text
docs/research/LEGACY-MNFS-HARNESS-MAP.md
docs/research/FIRSTMATE-INSPIRATION-MAP.md
```

These reports and maps are present in PR #11. Each published research report is paired with a validated `*.sources.json` manifest.

---

# 12. Design and implementation documents

Current design material belongs under:

```text
docs/design/
```

Purpose:

- Milestone microdesign;
- implementation plan;
- schema proposal;
- test strategy.

Authority:

```text
below Capability Spec and Mission Contract
```

A microdesign cannot change the Approved Contract or ADR.

---

# 13. Tracking

Current tracking belongs under:

```text
docs/tracking/
```

Examples:

- `STATUS.md`;
- Product Milestone checklist;
- implementation history;
- release checklist.

Completed tracking may move to:

```text
docs/tracking/archive/
```

Tracking never owns architecture.

---

# 14. Human read paths

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
```

## Architecture contributor

```text
Documentation Map
→ complete Blueprint
→ ADR log
→ Research
→ active architecture issue
```

---

# 15. Agent read paths

## Lead

```text
AGENTS.md
→ mnfs status
→ Current Authority Snapshot
→ Approved Mission Contract
→ Handoff/Context Pack
→ relevant Spec and ADRs
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

# 16. Ownership

Initial owner:

```text
developmentconexus-ops
```

Paths requiring owner review:

```text
/docs/product/
/docs/adr/
/docs/capabilities/
/docs/standards/
/docs/golden-paths/
/docs/repository-profile/
/.mnfs/
AGENTS.md
.github/CODEOWNERS
```

Operator approval remains a Domain Authority separate from Git write access.

---

# 17. Documentation checks

Initial required checks:

```text
markdownlint
link validation
frontmatter schema
unique document IDs
relation target validation
status validation
owner validation
ADR index and numbering
supersession consistency
Blueprint aggregate freshness
Documentation Map coverage
Mission Plan schema
hierarchical IDs
generated-file headers
documentation-impact declaration
accepted-doc placeholder check
```

---

# 18. Documentation impact

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

# 19. Superseded and historical sources

Keep discoverable:

- accepted ADRs later superseded;
- rejected proposals;
- historical Mission revisions;
- legacy research;
- architecture spike results;
- previous roadmap states through Git;
- failed approaches with durable learning.

Do not load them into normal execution Context Packs.

---

# 20. Generated projections

| Projection | Source |
|---|---|
| `PRODUCT-BLUEPRINT.md` | 13 modular section files |
| `review.html` | structured Plan Revision |
| future CLI reference | command schemas/help |
| future static site | canonical Markdown sources |
| generated diagrams | structured source |

Generated files carry a `DO NOT EDIT` header.

---

# 21. Current documentation divergences

Before AB1 closes, resolve:

1. apply and verify the adversarial-review corrections on PR #11;
2. merge the Architecture Baseline after all checks and review findings are closed;
3. implement and verify Mission Plan schema v2 in #7;
4. execute AS-02 on canonical WSL2 in #8;
5. Replan and approve a superseding MIS-002 revision in #9;
6. rerun MCRM R0–R4 against the approved contract;
7. record explicit Operator unblock before M2 implementation.

---

# 22. Immediate next action

```text
Correct and re-review PR #11, then merge the canonical Architecture Baseline.
```

M2 remains blocked until:

- PR #11 is merged;
- Plan Contract schema v2 is verified;
- AS-02 is accepted;
- MIS-002 is replanned and approved;
- MCRM R0–R4 pass;
- the Operator explicitly unblocks M2.


---

# Current AB1 blockers

The documentation system is being published, but AB1 remains open until:

1. the architecture PR is reviewed and merged;
2. Plan Contract schema v2 is implemented and verified;
3. AS-02 runs on canonical WSL2;
4. a new `MIS-002` revision is reviewed and approved;
5. MCRM R0–R4 pass;
6. the Operator explicitly unblocks M2.

Canonical readiness sources:

- `docs/capabilities/CAP-EXECUTION/COVERAGE.md`
- `docs/design/PLAN-CONTRACT-SCHEMA-V2-READINESS.md`
- `docs/design/AS-02-local-pi-sandbox-wsl2.md`
- `docs/design/MIS-002-REPLAN-READINESS.md`
