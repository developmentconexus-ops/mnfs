---
id: DOC-PROJECT-STATUS
title: MNFS Project Status
document_type: project_status
form: reference
authority: tracking
status: current
version: 2.4.0
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
  - ACCEPTANCE-ARR-S0-HOST-CAPABILITY-PROBE
  - DOC-ARR-S1-AGENT-RUNTIME-CONTRACT
  - PLAN-ARR-S1-AGENT-RUNTIME-CONFORMANCE
  - DOC-ARR-S2-EXECUTION-ENVELOPE-CONTRACT
  - PLAN-ARR-S2-EXECUTION-ENVELOPE-CONFORMANCE
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

Ubuntu WSL2 remains the canonical local host. `MIS-002` revision 5 remains immutable historical/current-version material but its M02 realization must not be resumed. Product M2 proceeds through ARR Evidence before a superseding CAP-EXECUTION/MIS-002 realization is approved.

## Current architecture and governance

```text
Thin Sovereign Semantic Kernel
+ Validation-first Planning
+ Replaceable Open Agent Runtime
+ Property-based Execution Environment
+ Provider-neutral Git Result Boundary
+ Independent Evidence / Gates
+ Capability-first Sourcing
```

Current governance authority includes D-010..D-020 plus D-021, ADR-0013..ADR-0015, Layered Agent Execution Planning 1.1.0, Complexity Proportionality and Review Admission 1.0.0, and Risk-Proportional Execution Governance 1.0.0.

## ARR state

```text
ARR P1 A1-A4 + B1:                    ACCEPTED / INTEGRATED — D-017
P1-F03 exact Spike-contract binding:  ACCEPTED / INTEGRATED — D-018
CPR canonical reconciliation:         ACCEPTED / INTEGRATED — D-019
ARR-S0 deterministic harness:         Tasks 1–11 COMPLETE / REVIEW CLEAR
ARR-S0 host capability contract:      ACCEPTED 1.0.0 — D-021
ARR-S0 Task 12 real host Evidence:    ACCEPT_WITH_LIMITATIONS / COMPLETE
ARR-S0 fresh report integrity:        PASS
ARR-S1 contract:                      PROPOSED 0.1.0 / REVIEW REQUIRED / NOT EXECUTABLE
ARR-S1 implementation plan:           PROPOSED 0.1.0 / REVIEW REQUIRED
ARR-S2 contract:                      PROPOSED 0.1.0 / REVIEW REQUIRED / NOT EXECUTABLE
ARR-S2 implementation plan:           PROPOSED 0.1.0 / REVIEW REQUIRED
```

Accepted ARR-S0 Evidence is `ACCEPTANCE-ARR-S0-HOST-CAPABILITY-PROBE`. It records provider-neutral host facts only and does not select a named runtime, process sandbox, microVM, container or workspace substrate.

Durable S0 planning inputs include:

```text
local process isolation      PHYSICALLY_PLAUSIBLE
Landlock isolation           PHYSICALLY_PLAUSIBLE
FUSE COW                     PHYSICALLY_PLAUSIBLE
microVM / KVM                BLOCKED_BY_HOST
local container              REQUIRES_SETUP_DECISION
Docker daemon observation    UNKNOWN
```

The KVM result reflects the accepted S0 observation that `/dev/kvm` exists but read/write open failed with `EACCES`. No permission or host-configuration change is authorized by S0.

## Proposed ARR-S1 realization pack

`DOC-ARR-S1-AGENT-RUNTIME-CONTRACT` 0.1.0 and `PLAN-ARR-S1-AGENT-RUNTIME-CONFORMANCE` 0.1.0 are proposed, not accepted authority.

The proposed S1 approach is Pi-first while remaining candidate-independent in deciding criteria:

```text
Pi integration qualification
  → Pi SDK primary hypothesis
  → Pi-ACP ACP-boundary hypothesis
  → direct Pi RPC only if a deciding ambiguity remains

mandatory external challenger
  → OpenCode native ACP

second ACP implementation
  → only if ACP remains decision-relevant and Pi-ACP + OpenCode have not already proved two real ACP paths
```

Current frozen planning provenance includes Pi 0.84.1, Pi-ACP 0.0.33, ACP TypeScript SDK 1.3.0 and OpenCode 1.18.15. These identities must be revalidated immediately before real execution.

## Proposed ARR-S2 realization pack

`DOC-ARR-S2-EXECUTION-ENVELOPE-CONTRACT` 0.1.0 and `PLAN-ARR-S2-EXECUTION-ENVELOPE-CONFORMANCE` 0.1.0 are proposed, not accepted authority.

The proposed S2 comparison is intentionally limited to host-eligible decision-changing process envelopes:

```text
Anthropic Sandbox Runtime 0.0.71   incumbent
nono 0.72.0                        challenger
Sandlock 0.8.6                     conditional challenger after ABI/seccomp preflight

BoxLite / smolvm                    excluded: KVM class BLOCKED_BY_HOST
Docker/container                    excluded: separate setup Decision required
```

Sandlock may run only if a candidate-specific preflight proves actual Landlock ABI >= 6 and required seccomp-user-notification behavior. S2 never infers that from kernel version/config alone.

## Immediate next action

Independently review the exact proposed S1/S2 contract and plan bytes, resolve admitted findings, run full repository verification and then request Operator acceptance of the exact reviewed packs.

After exact pack acceptance, deterministic S1/S2 harness implementation may proceed under the accepted plans without candidate execution. Real provider/candidate operations remain later separate CONTROLLED gates (`GATE-S1` / `GATE-S2`).

## Still prohibited until later authority/Evidence

- treating proposed S1/S2 contracts/plans as accepted authority;
- candidate acquisition/installation/execution before the corresponding accepted Spike contract/plan and exact execution gate;
- provider/model calls for S1 deciding Evidence before `GATE-S1`;
- runtime, execution-environment or workspace-substrate selection before deciding comparative Evidence;
- automatic KVM/Docker/sysctl/AppArmor/WSL setup or permission changes;
- ARR-S2W unless S2 demonstrates a separate workspace substrate is still required;
- ARR-S3 before required S1/S2 selecting inputs and later authority are ready;
- revision-5 M02 production implementation;
- production Worker dispatch;
- silent architecture/threat/effect expansion;
- unrestricted-host fallback for protected execution.

## Durable follow-up

Issue #20 retains provider-neutral M01 recovery/fencing hardening required before Product Milestone M2 exit unless later architecture reconciliation re-dispositions the Treehouse-specific form.
