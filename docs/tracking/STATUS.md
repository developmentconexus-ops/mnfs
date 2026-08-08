---
id: DOC-PROJECT-STATUS
title: MNFS Project Status
document_type: project_status
form: reference
authority: tracking
status: current
version: 2.0.2
owners:
  - developmentconexus-ops
related:
  - DOC-DOCUMENTATION-MAP
  - DOC-CAPABILITY-ROADMAP
  - DOC-MNFS-DEVELOPMENT-GOVERNANCE-METHOD
  - DOC-MNFS-CAPABILITY-REALIZATION-METHOD
  - DESIGN-LAYERED-AGENT-EXECUTION-PLANNING
  - DESIGN-COMPLEXITY-PROPORTIONALITY-AND-REVIEW-ADMISSION
  - DESIGN-RISK-PROPORTIONAL-EXECUTION-GOVERNANCE
  - TRACKING-DECISIONS
  - TRACKING-ARCHITECTURE-REALIZATION-REVIEW
tracking_issue: 23
last_reviewed: 2026-08-08
---

# Project status

## Current product phase

```text
M0 — Foundation Walking Skeleton                         ACCEPTED
M1 — Visual Mission Planning                            ACCEPTED
M2 — Secure One-Worker Vertical Slice                   OPPORTUNITY_REPLAN
  MIS-002/M01 — Durable Execution and Lease Core        ACCEPTED / CLOSED
  MIS-002/M02 revision-5 execution path                  SUPERSEDED
```

Ubuntu WSL2 remains the canonical local host. `MIS-002` revision 5 remains immutable historical/current-version material but its M02 realization must not be resumed. Product M2 proceeds through the ARR evidence path before a superseding CAP-EXECUTION/MIS-002 realization is approved.

## Current architecture and governance

Accepted direction:

```text
Thin Sovereign Semantic Kernel
+ Validation-first Planning
+ Replaceable Open Agent Runtime
+ Property-based Execution Environment
+ Provider-neutral Git Result Boundary
+ Independent Evidence / Gates
+ Capability-first Sourcing
```

Current governance authority includes:

```text
D-010..D-020
ADR-0013..ADR-0015
Layered Agent Execution Planning 1.1.0
Complexity Proportionality and Review Admission 1.0.0
Risk-Proportional Execution Governance 1.0.0
```

Execution-depth profiles:

```text
FAST       local/reversible/architecture-preserving
BOUNDED    material work inside accepted boundaries — default
CONTROLLED architecture/threat/irreversible/external-effect boundary
```

A profile changes governance depth, not correctness. Higher-authority deciding obligations remain binding regardless of profile.

## ARR state

```text
ARR P1 A1-A4 + B1:                    ACCEPTED / INTEGRATED — D-017
P1-F03 exact Spike-contract binding:  ACCEPTED / INTEGRATED — D-018
CPR canonical reconciliation:         ACCEPTED / INTEGRATED — D-019
ARR-S0 deterministic harness:         Tasks 1–11 implemented on PR #27
ARR-S0 Task 11:                       REPLAN_REQUIRED / NOT CLOSED
Final source re-observation finding:  IMPLEMENTATION_DEFECT / admitted correction
Non-forgeable Operator authority:     THREAT_MODEL_EXPANSION / not S0 correction scope
ARR-S0 Task 12 real host Evidence:    NOT EXECUTED
```

No Agent Runtime, Execution Environment, workspace substrate or candidate has been selected by current ARR Evidence.

## Immediate next action

The next product change is the admitted ARR-S0 final source re-observation plus narrow governance-auth terminology alignment.

Classification:

```text
profile: BOUNDED
architecture change: no
threat-model change: no
host probe: no
candidate execution: no
external effect: no
```

D-019 still requires this correction to receive its own bounded execution authority. Under D-020 that authority may be one natural-language Operator approval of the presented Execution Brief; no exact manual gate token is required unless a material boundary makes the explicit token itself useful.

Expected flow:

```text
one bounded Execution Brief / current accepted correction scope
→ Operator approval of that bounded envelope, including delivery if desired
→ implementation with local targeted RED/GREEN
→ ARR-S0 regression/full verification
→ fresh review + Finding Admission
→ final CI
→ merge only when GREEN, no Finding requires escalation/Replan, scope stayed bounded, and the approved envelope explicitly includes delivery
```

After that, ARR-S0 Task 12 remains a separate `CONTROLLED` operation because it produces deciding canonical host Evidence for later S1/S2 planning.

## Still prohibited until later authority/Evidence

- ARR-S0 Task 4 implementation before its BOUNDED approval envelope;
- ARR-S0 Task 12 real host observation before its CONTROLLED authority;
- revision-5 M02 production implementation;
- production Worker dispatch;
- candidate installation/execution or substrate selection before its deciding Spike;
- silent architecture/threat/effect expansion;
- cryptographic Operator-authority machinery for ARR-S0 under the current threat model;
- unrestricted-host fallback for protected execution.

## Durable follow-up

Issue #20 retains provider-neutral M01 recovery/fencing hardening required before Product Milestone M2 exit unless later architecture reconciliation re-dispositions the Treehouse-specific form.

Detailed historical PR heads, workflow IDs, merge SHAs and mechanical CI history belong to Git/GitHub. This status intentionally records only current state, blocker and next meaningful action.
