---
id: DOC-DOCUMENTATION-MAP
title: MNFS Documentation Map
document_type: documentation_map
form: reference
authority: constitutional
status: accepted
version: 1.7.0
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
  - DESIGN-LAYERED-AGENT-EXECUTION-PLANNING
  - PLAN-ARCHITECTURE-RECONCILIATION-ARR-PROGRAM
  - PLAN-ARR-S0-HOST-CAPABILITY-PROBE
  - CAP-EXECUTION
  - TRACKING-DECISIONS
  - TRACKING-ARCHITECTURE-REALIZATION-REVIEW
  - ADR-0013
  - ADR-0014
  - ADR-0015
  - ACCEPTANCE-ARR-GATE-P0-PLAN-APPROVAL
  - ACCEPTANCE-MIS-002-M01-IMPLEMENTATION-CLOSEOUT
review_triggers:
  - canonical document added, removed or superseded
  - documentation authority changes
  - Product Milestone or execution gate changes
last_reviewed: 2026-08-07
tracking_issue: 23
---

# MNFS Documentation Map

> Accepted documentation authority and discovery map. This document tells an Actor what is authoritative and what to read next; it does not replace the content of the indexed sources.

## 1. Current product and architecture phase

```text
M0 — Foundation Walking Skeleton                         ACCEPTED
M1 — Visual Mission Planning                            ACCEPTED
M2 — Secure One-Worker Vertical Slice                   OPPORTUNITY_REPLAN
  MIS-002/M01 — Durable Execution and Lease Core        ACCEPTED / CLOSED
  MIS-002/M02 — revision-5 Worker realization           SUPERSEDED_AS_EXECUTION_PATH
```

Current state:

- D-010 through D-016 are the current development, architecture-synthesis and agent-execution-planning Decisions;
- `ADR-0013`, `ADR-0014` and `ADR-0015` are current provider-neutral runtime/workspace/environment architecture;
- `ADR-0001`, `ADR-0003`, `ADR-0006` and `ADR-0008` remain readable historical decisions and are superseded by the ADRs above;
- `CAP-EXECUTION` 0.1.0 and `MIS-002` revision 5 remain immutable historical/current authority for the versions they describe, but D-015 prohibits implementing revision-5 M02;
- accepted M01 provider-neutral Evidence remains reusable; Pi/Treehouse/fixed-E1 evidence is historical realization Evidence rather than future constitutional selection;
- `DESIGN-LAYERED-AGENT-EXECUTION-PLANNING` version 1.0.0 is accepted execution-planning authority under D-016;
- `GATE-P0` accepted exact reviewed blobs of the ARR master plan and S0 plan through `ACCEPTANCE-ARR-GATE-P0-PLAN-APPROVAL`;
- the current authorized non-host tranche is P1: A1–A4 + B1 under Issue #23 / PR #24;
- ARR-S0 implementation and real host probing remain separately prohibited until later exact gates;
- Issue #20 owns residual M01 R2/R3 hardening until it is completed or re-dispositioned by final reconciliation.

## 2. Authority hierarchy

```text
A0 Constitutional
A1 Decision / ADR
A2 Specification
A3 Contract
A4 Standard / Policy
A5 Reference
A6 Guidance / reviewed execution plan
A7 Evidence
A8 Tracking
A9 Research / Historical
A10 Generated Projection
```

For bounded execution, use the most specific accepted authority that legitimately scopes the work. A lower layer cannot silently rewrite a higher one.

A useful precedence shape is:

```text
accepted specific ADR / Operator Decision
→ Product Blueprint
→ accepted Capability Spec
→ scoped Approved Mission Contract
→ accepted Milestone / Execution Design
→ Standard / Policy / Repository Profile
→ Operator-approved implementation plan / exact gate
→ implementation Reference
→ Tracking
→ Research / Historical
```

For **Discovery and Decision**, this hierarchy is the current baseline and Evidence set, not the boundary of inquiry. `DOC-MNFS-DEVELOPMENT-GOVERNANCE-METHOD` governs how stronger Evidence may produce a superseding Decision before execution resumes.

## 3. Canonical storage boundaries

### Git

Canonical human-readable product knowledge:

- Product Blueprint and ADRs;
- Capability Specs and Roadmap sources;
- Development/MCRM/execution-planning methods;
- accepted designs and reviewed plans;
- Operator Decision records and selected Evidence;
- guidance/research needed for reproducibility.

### `.mnfs/`

Canonical machine-readable repository artifacts:

- Repository identity;
- Approved Mission Contracts and immutable history;
- promoted machine artifacts where product flows assign authority there.

### SQLite

Canonical operational state:

- Mission/plan revisions;
- WriteTracks, Attempts, Actor/Worker Runs, Claims and current operational bindings;
- Decisions, Events and Artifact references as implemented by current capability versions.

### Runtime Artifact Store

Generated or temporary observations:

- logs/prompts/traces/raw command output;
- conformance/spike artifacts;
- execution-environment/workspace observations;
- screenshots/review artifacts.

Raw runtime artifacts are Evidence only when bound to an accepted criterion/contract/provenance chain. They are never product doctrine by existence alone.

### GitHub

- Issue: tracking/discussion;
- PR: proposed change/review surface;
- merged canonical files: integrated Git result.

## 4. Canonical entrypoints

| Path | Purpose | Authority |
|---|---|---|
| `README.md` | product introduction / quick start | guidance |
| `AGENTS.md` | agent bootstrap, hard rules, current gate | guidance/index |
| `docs/DOCUMENTATION-MAP.md` | authority/discovery/read paths | constitutional reference |
| `docs/tracking/STATUS.md` | exact current lifecycle and bounded gates | tracking |
| `docs/tracking/DECISIONS.md` | Operator Decision register | tracking of A1 authority |
| `docs/tracking/ARCHITECTURE-REALIZATION-REVIEW.md` | D1–D4/synthesis/current ARR scope | tracking |
| `docs/product/DEVELOPMENT-GOVERNANCE-METHOD.md` | Discovery/Decision/Execution and Replan policy | Standard / Policy |
| `docs/product/CAPABILITY-REALIZATION-METHOD.md` | one R0–R8 capability-to-execution method | Standard / Policy |
| `docs/superpowers/specs/2026-08-07-layered-agent-execution-planning-design.md` | L0–L3, Fresh Actor, packs, termination/handoff | accepted specification |
| `docs/superpowers/plans/2026-08-07-architecture-reconciliation-arr-program.md` | reviewed ARR program / P1→S3 sequence | approved guidance by exact blob under GATE-P0 |
| `docs/superpowers/plans/2026-08-07-arr-s0-host-capability-probe.md` | reviewed S0 implementation/execution plan | approved guidance by exact blob under GATE-P0 |
| `docs/product/PRODUCT-BLUEPRINT.md` | generated complete constitutional projection | generated projection |
| `docs/roadmap.md` | generated capability/program sequence | generated projection |
| `docs/tooling-adoption.md` | current external substrate/candidate projection | reference only |

## 5. Fresh-session read path for current M2 work

A new Lead/Planner/Reviewer working on M2 architecture, reconciliation or a material ARR task reads:

```text
AGENTS.md
→ docs/DOCUMENTATION-MAP.md
→ docs/tracking/STATUS.md
→ docs/tracking/DECISIONS.md
→ docs/product/DEVELOPMENT-GOVERNANCE-METHOD.md
→ docs/product/CAPABILITY-REALIZATION-METHOD.md
→ docs/superpowers/specs/2026-08-07-layered-agent-execution-planning-design.md
→ docs/tracking/ARCHITECTURE-REALIZATION-REVIEW.md
→ docs/superpowers/plans/2026-08-07-architecture-reconciliation-arr-program.md
→ exact task-specific plan / gate
→ relevant Blueprint / current ADR / Capability / Mission / Evidence
→ current primary external sources when a realization decision is being made
→ current implementation where compatibility/migration cost matters
```

This ordering prevents a fresh Actor from treating the superseded revision-5 M02 microdesign path or historical tool choices as current execution authority.

For a narrow already-designed implementation unit, the Context Compiler/Role Pack may provide a smaller eager subset, but it must still include the current Authority Snapshot, exact target, current plan/policy identities and the relevant accepted constraints.

## 6. Current architecture authorities

Provider-neutral current ADRs:

```text
ADR-0013 — WSL2 host and replaceable Agent Runtime
ADR-0014 — isolated mutable workspace per Write Track
ADR-0015 — property-based Execution Environments
```

Preserved current architecture principles include:

```text
Thin Sovereign Semantic Kernel
Validation-first Planning
replaceable Agent Runtime / Session non-authority
isolated mutable workspace semantics
property-based Execution Environment
provider-neutral Git result identity
independent Evidence / Gate acceptance
capability-first sourcing
fresh Recovery without transcript
```

Concrete Pi/OpenCode/ACP/process-sandbox/microVM/workspace winners are not selected by these documents. Their realization is decided by the bounded ARR Evidence sequence.

## 7. Capability and Mission authority during Opportunity Replan

Canonical capability/contract sources still include:

```text
docs/capabilities/CAP-EXECUTION/SPEC.md
docs/capabilities/CAP-EXECUTION/TRACEABILITY.json
docs/capabilities/CAP-EXECUTION/COVERAGE.md
.mnfs/missions/MIS-002/plan.json
```

Historical/current contract identity:

```text
Mission:       MIS-002
Revision:      5
Schema:        2
Contract hash: sha256:d82252504044cab40e00013dc30534654382887b7819d60a916d2a9a56db4cc3
```

Revision 5 remains immutable. It is not edited to fit the new architecture. D-015 instead classifies its M02 realization as superseded and requires a later superseding Capability/Mission Replan after deciding Spikes.

M01 remains accepted/closed. Its provider-neutral durability/fencing/Claim/Recovery/Git-result Evidence remains valid for what it proved.

## 8. Current ARR program path

```text
P1  semantic/authority reconciliation + shared Spike governance
→ ARR-S0 Host Capability Probe
→ ARR-S1 Agent Runtime Conformance
  + ARR-S2 Local Execution Envelope Conformance
→ ARR-S2W Workspace comparison only if S2 proves it is needed
→ ARR-S3 Vertical Composition Proof
→ substrate selection Decision
→ superseding CAP-EXECUTION / MIS-002 Replan
→ new M02 R5 Execution Design + implementation plan
```

Named candidates may be researched or referenced before their spike, but no candidate becomes production architecture by being popular, previously integrated or listed in `docs/tooling-adoption.md`.

### Post-Spike return path

After accepted ARR-S0 through ARR-S3 Evidence:

```text
accepted Spike Evidence
→ substrate selection Decision
→ final Blueprint / ADR reconciliation as needed
→ superseding CAP-EXECUTION revision
→ superseding MIS-002 revision
→ R0–R5 re-readiness under MCRM
→ new bounded M02 implementation authority
```

Do **not** resume the old Issue #21/revision-5 assumptions as the implementation baseline.

## 9. Evidence proportionality and historical preservation

MNFS uses criterion-driven Evidence rather than completion of an arbitrary inventory.

A supplemental proof may be deferred only when:

- it is not the sole proof of a deciding criterion/MUST requirement;
- existing Evidence covers the required invariant/integration assumption;
- destination, rationale, residual risk and Operator authority are recorded;
- it is never represented as PASS;
- deferment does not contradict current accepted authority.

Superseded decisions, old plans and historical tool-specific evidence remain discoverable through their canonical files/Git history. They are not silently rewritten into a different decision and they are not loaded by default into Fresh Actor packs unless relevant.

## 10. Generated and projection sources

Generated projections include:

- `docs/product/PRODUCT-BLUEPRINT.md` from Blueprint Sections 1–13;
- `docs/roadmap.md` from Blueprint Section 12 plus generator framing;
- CAP-EXECUTION coverage views;
- plan/review surfaces generated by their approved tooling.

Generated files carry `DO NOT EDIT` framing and must be regenerated from canonical sources.

`docs/tooling-adoption.md` is a **reference projection** of current capability-realization candidates/decisions. It is not allowed to make Pi, Treehouse, Sandbox Runtime, BoxLite, OpenCode or any other substrate architectural authority by itself.

## 11. Current gate

```text
M01:                                      ACCEPTED / CLOSED — D-009
M01 R2/R3 hardening:                      FOLLOW_UP_REQUIRED — Issue #20
Architecture synthesis:                   APPROVED — D-015
Layered Agent Execution Planning:         ACCEPTED — D-016
GATE-P0 plans:                            ACCEPTED — exact reviewed blobs
ARR P1 A1-A4 + B1:                        AUTHORIZED / CURRENT — PR #24
ARR-S0 implementation:                    PROHIBITED pending GATE-S0-IMPLEMENT
ARR-S0 real host execution:               PROHIBITED pending later GATE-S0-EXECUTE
Agent Runtime / Environment selection:    PROHIBITED pending deciding Evidence
M02 revision-5 implementation:            PROHIBITED / SUPERSEDED_AS_EXECUTION_PATH
Production Worker dispatch:               PROHIBITED
Automatic merge/delivery:                 NOT AUTHORIZED
```

The next action inside the current authority is to complete and independently verify P1 only. Finishing P1 does not infer S0 authority; a fresh gate must explicitly authorize the next tranche.
