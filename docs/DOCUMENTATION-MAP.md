---
id: DOC-DOCUMENTATION-MAP
title: MNFS Documentation Map
document_type: documentation_map
form: reference
authority: constitutional
status: accepted
version: 2.0.2
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
  - DESIGN-COMPLEXITY-PROPORTIONALITY-AND-REVIEW-ADMISSION
  - DESIGN-RISK-PROPORTIONAL-EXECUTION-GOVERNANCE
  - PLAN-ARCHITECTURE-RECONCILIATION-ARR-PROGRAM
  - PLAN-ARR-S0-HOST-CAPABILITY-PROBE
  - DOC-ARR-S0-HOST-CAPABILITY-CONTRACT
  - CAP-EXECUTION
  - TRACKING-DECISIONS
  - TRACKING-ARCHITECTURE-REALIZATION-REVIEW
  - ADR-0013
  - ADR-0014
  - ADR-0015
review_triggers:
  - canonical document added, removed or superseded
  - documentation authority changes
  - Product Milestone or execution boundary changes
last_reviewed: 2026-08-08
tracking_issue: 23
---

# MNFS Documentation Map

> Constitutional discovery map. It tells a Fresh Actor what is authoritative and what to read next. It intentionally does not duplicate mechanical PR/CI/merge history that GitHub already preserves.

## 1. Current product phase

```text
M0 — Foundation Walking Skeleton                         ACCEPTED
M1 — Visual Mission Planning                            ACCEPTED
M2 — Secure One-Worker Vertical Slice                   OPPORTUNITY_REPLAN
  MIS-002/M01 — Durable Execution and Lease Core        ACCEPTED / CLOSED
  MIS-002/M02 revision-5 execution path                  SUPERSEDED_AS_EXECUTION_PATH
```

Current durable authority includes:

- D-010 through D-020;
- `ADR-0013`, `ADR-0014`, `ADR-0015`;
- `DESIGN-LAYERED-AGENT-EXECUTION-PLANNING` 1.1.0;
- `DESIGN-COMPLEXITY-PROPORTIONALITY-AND-REVIEW-ADMISSION` 1.0.0;
- `DESIGN-RISK-PROPORTIONAL-EXECUTION-GOVERNANCE` 1.0.0;
- accepted ARR program/task plans and accepted contracts where applicable.

`CAP-EXECUTION` 0.1.0 and `MIS-002` revision 5 remain immutable authority/history for the versions they describe. D-015 prohibits implementing revision-5 M02.

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

For bounded execution, use the most specific accepted authority that legitimately scopes the work. Lower authority cannot silently rewrite higher authority.

For Discovery/Decision, existing authority is the current baseline rather than the boundary of inquiry. Stronger Evidence may produce an explicit superseding Decision before execution resumes.

## 3. Canonical storage boundaries

### Git

Canonical durable product knowledge: Product Blueprint, ADRs/Decisions, Capability Specs, Roadmap sources, governance, accepted designs/plans that remain materially useful, and selected durable Evidence.

### `.mnfs/`

Canonical machine-readable repository artifacts, including repository identity and immutable Approved Mission Contract history.

### SQLite

Canonical operational state, including Mission/plan revisions, WriteTracks, Attempts, Actor/Worker Runs, Claims, Events and current operational bindings as implemented.

### Runtime Artifact Store

Logs, traces, command output and generated observations. They become deciding Evidence only when bound to accepted criteria/contracts/provenance.

### GitHub

Operational history: commits/diffs, PRs/reviews, CI/workflow results, merge identity and timestamps. Do not duplicate those facts into Markdown unless they carry durable decision value beyond Git history.

## 4. Canonical entrypoints

| Path | Purpose | Authority |
|---|---|---|
| `AGENTS.md` | Fresh Actor bootstrap, hard invariants and execution-depth guidance | guidance/index |
| `docs/DOCUMENTATION-MAP.md` | authority/discovery/read paths | constitutional reference |
| `docs/tracking/STATUS.md` | current state, blocker and next meaningful action | tracking |
| `docs/tracking/DECISIONS.md` | Operator Decision register | tracking of A1 authority |
| `docs/product/DEVELOPMENT-GOVERNANCE-METHOD.md` | Discovery → Decision → Execution and Replan policy | Standard / Policy |
| `docs/product/CAPABILITY-REALIZATION-METHOD.md` | one R0–R8 capability-realization method | Standard / Policy |
| `docs/superpowers/specs/2026-08-07-layered-agent-execution-planning-design.md` | L0–L3, Fresh Actor, packs, termination/handoff | accepted specification |
| `docs/tracking/ARCHITECTURE-REALIZATION-REVIEW.md` | current architecture reconciliation and ARR scope | tracking |
| `docs/superpowers/specs/2026-08-08-risk-proportional-execution-governance-design.md` | FAST / BOUNDED / CONTROLLED execution-depth policy | accepted specification |
| `docs/superpowers/plans/2026-08-07-architecture-reconciliation-arr-program.md` | `PLAN-ARCHITECTURE-RECONCILIATION-ARR-PROGRAM`; ARR sequence | accepted guidance by GATE-P0 |
| `docs/superpowers/plans/2026-08-07-arr-s0-host-capability-probe.md` | ARR-S0 bounded design/execution plan | accepted guidance by GATE-P0 |
| `docs/spikes/ARR-S0-HOST-CAPABILITY-CONTRACT.md` | `DOC-ARR-S0-HOST-CAPABILITY-CONTRACT`; S0 host-fact contract | proposed contract / next CONTROLLED input |
| `docs/product/PRODUCT-BLUEPRINT.md` | generated constitutional projection | generated projection |
| `docs/roadmap.md` | generated capability/program sequence | generated projection |

## 5. Fresh-session read path

For M2 architecture, planning, reconciliation or a material ARR task:

```text
AGENTS.md
→ docs/DOCUMENTATION-MAP.md
→ docs/tracking/STATUS.md
→ docs/tracking/DECISIONS.md
→ docs/product/DEVELOPMENT-GOVERNANCE-METHOD.md
→ docs/product/CAPABILITY-REALIZATION-METHOD.md
→ docs/superpowers/specs/2026-08-07-layered-agent-execution-planning-design.md
→ docs/tracking/ARCHITECTURE-REALIZATION-REVIEW.md
→ docs/superpowers/specs/2026-08-08-risk-proportional-execution-governance-design.md
→ docs/superpowers/plans/2026-08-07-architecture-reconciliation-arr-program.md
→ exact task-specific authority / plan / contract / Evidence
→ relevant Blueprint / ADR / Capability / Mission sources
→ current primary external sources when a realization decision is being made
→ current implementation where compatibility/migration cost matters
```

A narrow already-designed FAST/BOUNDED unit may use a smaller compiled pack, but it must still contain the current target, applicable deciding Authority, boundaries, proof and escalation conditions.

## 6. Current architecture authorities

```text
ADR-0013 — WSL2 host and replaceable Agent Runtime
ADR-0014 — isolated mutable workspace per Write Track
ADR-0015 — property-based Execution Environments
```

Current principles include Thin Sovereign Semantic Kernel, Validation-first Planning, replaceable Agent Runtime / Session non-authority, isolated mutable workspace semantics, property-based Execution Environment, provider-neutral Git result identity, independent Evidence / Gate acceptance, capability-first sourcing and fresh Recovery without transcript.

No concrete Agent Runtime, process sandbox, microVM or workspace substrate is selected by these authorities alone.

## 7. Risk-proportional execution governance

```text
FAST       local/reversible/architecture-preserving
BOUNDED    material work inside accepted boundaries — default
CONTROLLED architecture/threat/irreversible/external-effect boundary
```

The profile changes execution/governance depth, not correctness. A lane may remove accidental ceremony but never an applicable deciding obligation frozen by higher Authority.

Natural-language Operator approval may bind an unambiguous FAST/BOUNDED envelope. The Lead/system resolves mechanical SHA/hash identity. CONTROLLED retains distinct checkpoints when they protect distinct material decisions, risks or effects.

## 8. M2 Opportunity-Replan path

```text
ARR-S0 Host Capability Probe
→ ARR-S1 Agent Runtime Conformance
  + ARR-S2 Local Execution Envelope Conformance
→ ARR-S2W Workspace comparison only if S2 proves it is needed
→ ARR-S3 Vertical Composition Proof
→ substrate selection Decision
→ superseding CAP-EXECUTION / MIS-002 Replan
→ new M02 R5 Execution Design + implementation
```

Named candidates remain candidates or historical/incumbent Evidence until a deciding Spike and selecting Decision.

Durable orientation anchors:

```text
ARR P1 A1-A4 + B1: ACCEPTED — GATE-R / D-017 / INTEGRATED
P1-F03:             ACCEPTED — D-018 / INTEGRATED
CPR reconciliation: ACCEPTED — D-019 / INTEGRATED
ARR-S0 Task 11:     COMPLETE / REVIEW CLEAR
```

## 9. Current execution boundary

ARR-S0 Task 11 is `COMPLETE / REVIEW CLEAR`. The admitted final pre-write source-integrity defect is corrected: after run-root filesystem validation and before first durable Evidence, `runS0` re-observes source, requires the same clean commit/tree and revalidates exact-bound Governance authorization.

Finding disposition remains:

```text
final pre-write Git/source re-observation  → IMPLEMENTATION_DEFECT / CORRECTED
non-forgeable/signed Operator authority   → THREAT_MODEL_EXPANSION / not S0 scope
```

`DOC-ARR-S0-HOST-CAPABILITY-CONTRACT` remains proposed at 0.1.0. Task 11 completion neither accepts that contract nor grants `GATE-S0-EXECUTE` authority.

ARR-S0 Task 12 real host observation is `CONTROLLED`, `NOT EXECUTED` and prohibited until separately authorized. Candidate execution/selection, revision-5 M02 production implementation and production Worker dispatch remain prohibited pending later deciding authority/Evidence.

## 10. Evidence proportionality

Proof is criterion-driven. Supplemental hardening does not automatically become blocking when deciding correctness is already sufficiently evidenced; deferment must remain explicit and must not contradict accepted Authority.

Normal FAST/BOUNDED TDD may observe RED locally and preserve final GREEN/CI durably. Acceptance/integration records are reserved for durable material outcomes that Git history alone cannot explain well; ordinary implementation history belongs to Git/GitHub/CI.

## 11. Generated sources

Generated projections include `docs/product/PRODUCT-BLUEPRINT.md`, `docs/roadmap.md`, CAP-EXECUTION coverage views and generated plan/review surfaces.

Do not edit generated files directly. `docs/tooling-adoption.md` remains a reference projection, never an architectural winner-selection source.
