---
id: DOC-DOCUMENTATION-MAP
title: MNFS Documentation Map
document_type: documentation_map
form: reference
authority: constitutional
status: accepted
version: 1.1.0
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
  - DOC-MNFS-CAPABILITY-REALIZATION-METHOD
  - DOC-CAPABILITY-ROADMAP
  - CAP-EXECUTION
  - ACCEPTANCE-M2-UNBLOCK
  - DESIGN-MIS-002-M01-DURABLE-EXECUTION-LEASE-CORE
review_triggers:
  - canonical document added, removed or superseded
  - documentation authority changes
  - Product Milestone or MCRM gate changes
last_reviewed: 2026-08-03
tracking_issue: 16
---

# MNFS Documentation Map

> **Status:** Accepted documentation authority and discovery map.  
> It indexes canonical sources and current read paths; it does not redefine their content.

---

# 1. Current product and architecture phase

```text
M0 — Foundation Walking Skeleton              ACCEPTED
M1 — Visual Mission Planning                  ACCEPTED
AB1 — Architecture Baseline/Reconciliation    CLOSED
AS-02 — Local Pi Sandbox on WSL2              ACCEPTED
M2 — Secure One-Worker Vertical Slice         COMMITTED
MIS-002/M01 R5 Milestone Microdesign          IN_PROGRESS
```

Current state:

- Product Blueprint Sections 1–13, MCRM, Roadmap v2 and ADR-0001–ADR-0012 are accepted;
- Architecture Baseline PR #11, Plan Contract schema-v2 PR #12, AS-02 PR #13 and MIS-002 reconciliation PR #14 are integrated in `main`;
- `CAP-EXECUTION` version `0.1.0` is accepted with implementation status `planned`;
- `MIS-002` revision 5 is the current approved schema-v2 contract;
- all 28 capability requirements are allocated to exact approved criteria;
- MCRM R0–R4 pass;
- the Operator authorized M2 to enter R5 for M01 microdesign only;
- Issue #16 and draft PR #17 own M01 research, Treehouse conformance and microdesign;
- M01 implementation and Pi Worker dispatch remain prohibited.

Current approved contract:

```text
Mission: MIS-002 revision 5
Hash:    sha256:d82252504044cab40e00013dc30534654382887b7819d60a916d2a9a56db4cc3
```

Historical revision 3 remains immutable:

```text
Blob: sha1:6b79117fe66cd5c9c8142099828812f470ce20de
Hash: sha256:f95ffded37af764e5f76775ec6bbdda69d5638246609451ce37bf524908cf8c1
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
accepted specific ADR
→ Product Blueprint
→ accepted Capability Spec
→ scoped Approved Mission Contract
→ Standard / Policy / Repository Profile
→ implementation Reference
→ Guidance
→ Tracking
→ Research / Historical
```

Research informs design but does not override accepted architecture. Tracking describes state but does not own product doctrine. A conflict must be resolved explicitly rather than selecting whichever document was read first.

---

# 3. Storage and authority boundaries

## Git

Canonical human-readable product knowledge and accepted repository artifacts:

- Product Blueprint;
- ADRs;
- Capability Specs;
- Roadmap;
- Standards and Golden Paths;
- Repository Profile source;
- references and guidance;
- research and selected Evidence;
- code and tests.

## `.mnfs/`

Canonical machine-readable repository artifacts:

- Repository identity;
- current Approved Mission Contract;
- preserved historical Mission revisions;
- accepted Evidence promoted to the repository;
- future Closeouts.

## SQLite

Canonical local operational state:

- Missions and Plan revisions;
- future Write Tracks, Leases, Attempts, Worker Runs and Claims;
- Receipts, Findings, Decisions and Events as their milestones arrive;
- runtime Artifact references.

## Runtime Artifact Store

Generated or temporary:

- logs and command outputs;
- prompts and Context Packs;
- review HTML;
- traces and screenshots;
- raw conformance/security Evidence.

## GitHub

- Issue: tracking and discussion;
- PR: proposed changes and review;
- merged files: accepted repository result;
- GitHub status never substitutes Operator domain authority.

---

# 4. Canonical entrypoints

| Path | Audience | Purpose | Authority |
|---|---|---|---|
| `README.md` | users | product introduction and quick start | guidance |
| `AGENTS.md` | agents | concise bootstrap and hard rules | guidance/index |
| `docs/DOCUMENTATION-MAP.md` | humans/agents | discovery, authority and read order | constitutional reference |
| `docs/tracking/STATUS.md` | humans/agents | current program and gate state | tracking |
| `docs/product/README.md` | architecture readers | Blueprint index and version | constitutional index |
| `docs/product/PRODUCT-BLUEPRINT.md` | broad readers | generated complete Blueprint | generated constitutional projection |
| `docs/product/CAPABILITY-REALIZATION-METHOD.md` | planners/Leads | Blueprint-to-build traceability and R0–R8 | standard/policy |
| `docs/roadmap.md` | operators/contributors | capability sequence and Golden Proofs | generated product plan |
| `docs/capabilities/CAP-EXECUTION/SPEC.md` | M2 designers | reusable governed execution design | accepted specification |
| `.mnfs/missions/MIS-002/plan.json` | execution system | current exact M2 contract | approved contract |

---

# 5. Product Blueprint

Editable constitutional sources:

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

Generated aggregates:

```text
docs/product/PRODUCT-BLUEPRINT.md
docs/roadmap.md
```

Generated files carry a `GENERATED — DO NOT EDIT` marker and must be regenerated from their source.

---

# 6. Architecture decisions

Canonical index:

```text
docs/adr/README.md
```

Accepted decisions:

| ADR | Decision ownership |
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

Accepted ADR semantics are not rewritten. A material decision change uses a superseding ADR.

---

# 7. Capability Realization Method

Canonical method:

```text
docs/product/CAPABILITY-REALIZATION-METHOD.md
```

It owns:

- R0 Baseline;
- R1 Applicability;
- R2 Requirements;
- R3 Capability Specification;
- R4 Mission Contract Allocation;
- R5 Milestone Microdesign;
- R6 Build and Continuous Coverage;
- R7 Verification and Validation;
- R8 Closeout and Learning;
- bidirectional traceability and orphan detection.

Current capability package:

```text
docs/capabilities/CAP-EXECUTION/SPEC.md
docs/capabilities/CAP-EXECUTION/APPLICABILITY.md
docs/capabilities/CAP-EXECUTION/TRACEABILITY.json
docs/capabilities/CAP-EXECUTION/COVERAGE.md
```

`TRACEABILITY.json` is the structured coverage source. `COVERAGE.md` is generated and must not be edited directly.

---

# 8. Roadmap

Canonical editable source:

```text
docs/product/blueprint/12-capability-roadmap.md
```

Generated projection:

```text
docs/roadmap.md
```

The roadmap preserves M0/M1 as accepted history and sequences the trusted local harness, local software factory and future platform horizons through M12.

Product Milestone `M2` is distinct from Mission Milestones `MIS-002/M01` and `MIS-002/M02`.

---

# 9. Mission Contracts

Current contract:

```text
.mnfs/missions/MIS-002/plan.json
revision 5
schemaVersion 2
APPROVED
```

Historical snapshot:

```text
.mnfs/missions/MIS-002/history/revision-0003.json
```

Rules:

- approved revisions are immutable;
- material change uses Replan;
- execution entities bind to the exact approved content hash;
- a draft Replan does not replace the latest approved contract;
- no document or conversation silently edits the materialized contract.

---

# 10. Current M01 R5 package

Tracking:

```text
Issue #16
Draft PR #17
design/mis-002-m01
```

Research Evidence:

```text
docs/research/MNFS-RESEARCH-M01-EXECUTION-LEASE-CORE-v1.md
docs/research/MNFS-RESEARCH-M01-EXECUTION-LEASE-CORE-v1.sources.json
```

External-tool conformance protocol:

```text
docs/design/2026-08-03-tc-01-treehouse-production-adapter-conformance.md
```

Proposed Milestone Microdesign:

```text
docs/design/2026-08-03-mis-002-m01-durable-execution-lease-core.md
```

Current interpretation:

```text
Research:            PUBLISHED
TC-01 protocol:      PROPOSED / execution authorized
TC-01 Evidence:      NOT_STARTED
M01 microdesign:     PROPOSED
R5:                  IN_PROGRESS
M01 implementation: PROHIBITED
```

A proposed design does not become implementation authority merely because CI is green.

---

# 11. Research

Research is Evidence, not Authority.

Architecture Baseline reports:

```text
docs/research/MNFS-RESEARCH-PI-MEMORY-CONTEXT-MESSAGING-v1.md
docs/research/MNFS-RESEARCH-SECURITY-ISOLATION-ENVIRONMENTS-v1.md
docs/research/MNFS-RESEARCH-OPERATOR-OBSERVABILITY-CALIBRATION-v1.md
docs/research/MNFS-RESEARCH-CAPABILITY-ROADMAP-v1.md
docs/research/MNFS-RESEARCH-DOCUMENTATION-GOVERNANCE-v1.md
```

Architecture source maps:

```text
docs/research/LEGACY-MNFS-HARNESS-MAP.md
docs/research/FIRSTMATE-INSPIRATION-MAP.md
```

Every published research report has a validated `*.sources.json` manifest. Adopted conclusions must be reflected in the owning Blueprint, ADR, Capability Spec, Contract or Microdesign.

---

# 12. Design and implementation documents

Location:

```text
docs/design/
docs/superpowers/specs/
docs/superpowers/plans/
```

Ownership:

- Capability Spec owns reusable architecture;
- Mission Contract owns bounded commitment;
- Milestone Microdesign owns implementation design for the next Mission Milestone;
- Implementation Plan owns TDD task sequencing;
- a plan cannot repair or expand a deficient approved design silently.

A microdesign cannot change an Approved Contract or accepted ADR. Material conflict triggers Replan or a new Decision.

---

# 13. Tracking

Location:

```text
docs/tracking/
```

Canonical current-state sources:

```text
docs/tracking/STATUS.md
docs/tracking/WORKLOG.md
docs/tracking/DECISIONS.md
```

Tracking never owns architecture. Completed tracking may move under `docs/tracking/archive/`.

---

# 14. Read paths

## New user

```text
README
→ Documentation Map
→ Product Blueprint overview
→ Roadmap
→ Status
```

## Contributor

```text
README
→ CONTRIBUTING
→ Documentation Map
→ Status
→ relevant Capability Spec
→ Approved Contract
→ active Microdesign
→ related ADRs
```

## Lead

```text
AGENTS.md
→ mnfs status
→ Documentation Map
→ Approved Mission Contract
→ relevant Capability Spec/ADRs
→ active Microdesign
→ Handoff/Context Pack when implemented
```

## Writer

```text
Current Authority Snapshot
→ Writer Pack
→ exact target, contract and write-set
```

## Reviewer

```text
Review Pack
→ fixed diff/SHA
→ criteria and requirements
→ related Spec/ADRs/Standards
```

## QA

```text
QA Pack
→ Journey
→ Environment
→ expected observations
```

Agents do not load the complete Blueprint by default. Architecture, planning and cross-cutting review may require broader context.

---

# 15. Ownership and protected paths

Initial owner:

```text
developmentconexus-ops
```

Owner review is required for:

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

Operator approval is Domain Authority separate from Git write access or CI success.

---

# 16. Documentation checks

Required checks include:

```text
frontmatter schema
unique document IDs
relation target validation
status and owner validation
ADR index and numbering
supersession consistency
Blueprint/Roadmap/Coverage freshness
Mission Plan schema and hierarchical IDs
research source-manifest validation
historical Mission preservation
SEC-E1 exact-hash validation
generated-file headers
documentation-impact declaration
accepted-document placeholder checks
relative-link and anchor validation
```

Automation proves structural completeness. Human review determines semantic correctness.

---

# 17. Change impact

Every material PR or Claim declares:

```yaml
documentation_impact:
  status: NONE | UPDATED | FOLLOW_UP_REQUIRED
  affected: []
  rationale: ""
  follow_up: null

requirements_impact:
  status: NONE | UPDATED | NEW_REQUIREMENT | REPLAN_REQUIRED
  affected: []
  rationale: ""
```

`NONE` requires a specific rationale. A new requirement or contract conflict is classified before implementation continues.

---

# 18. Historical and generated sources

Keep discoverable:

- accepted ADRs later superseded;
- rejected proposals;
- historical Mission revisions;
- prior research and spike results;
- previous roadmap states through Git;
- failed approaches with durable learning.

Do not load historical artifacts into normal execution Context Packs unless explicitly relevant.

Generated projections include:

| Projection | Source |
|---|---|
| `PRODUCT-BLUEPRINT.md` | 13 Blueprint section files |
| `roadmap.md` | Blueprint Section 12 |
| `CAP-EXECUTION/COVERAGE.md` | `TRACEABILITY.json` plus canonical registry |
| `review.html` | structured Plan Revision |

---

# 19. Current divergences and blockers

Resolved since version 1.0.0:

- Architecture Baseline merged;
- Plan Contract schema v2 implemented;
- AS-02 accepted;
- `CAP-EXECUTION` accepted;
- MIS-002 revision 5 approved;
- all 28 requirements allocated;
- R0–R4 passed;
- explicit M2 R5 unblock recorded;
- PR #14 integrated.

Current R5 blockers:

1. draft PR #17 must remain mechanically and semantically green;
2. TC-01 must execute against the exact canonical Treehouse binary on WSL2;
3. observed behavior must be incorporated into the proposed M01 microdesign;
4. migration and adapter boundaries require constructive and adversarial review;
5. the Operator must explicitly approve the final microdesign;
6. an Implementation Plan may be written only after that approval.

M01 implementation and Pi Worker dispatch are not authorized.

---

# 20. Immediate next action

```text
Complete PR #17 design review
→ execute TC-01 on canonical WSL2
→ reconcile findings into M01 microdesign
→ obtain explicit Operator design approval
→ write the M01 Implementation Plan
```

Canonical current sources:

```text
docs/tracking/STATUS.md
docs/capabilities/CAP-EXECUTION/COVERAGE.md
.mnfs/missions/MIS-002/plan.json
docs/research/MNFS-RESEARCH-M01-EXECUTION-LEASE-CORE-v1.md
docs/design/2026-08-03-tc-01-treehouse-production-adapter-conformance.md
docs/design/2026-08-03-mis-002-m01-durable-execution-lease-core.md
```
