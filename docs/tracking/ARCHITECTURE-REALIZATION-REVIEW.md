---
id: TRACKING-ARCHITECTURE-REALIZATION-REVIEW
title: MNFS Architecture Realization Review — 2026-08-07
document_type: tracking_document
form: reference
authority: tracking
status: current
owners:
  - developmentconexus-ops
related:
  - DOC-MNFS-DEVELOPMENT-GOVERNANCE-METHOD
  - DOC-MNFS-CAPABILITY-REALIZATION-METHOD
  - DESIGN-LAYERED-AGENT-EXECUTION-PLANNING
  - PLAN-ARCHITECTURE-RECONCILIATION-ARR-PROGRAM
  - PLAN-ARR-S0-HOST-CAPABILITY-PROBE
  - DESIGN-COMPLEXITY-PROPORTIONALITY-AND-REVIEW-ADMISSION
  - PLAN-COMPLEXITY-PROPORTIONALITY-RECONCILIATION
  - ACCEPTANCE-ARR-P1-RECONCILIATION
  - ACCEPTANCE-ARR-P1-INTEGRATION-CLOSEOUT
  - DOC-PRODUCT-BLUEPRINT
  - DOC-CAPABILITY-ROADMAP
  - TRACKING-DECISIONS
tracking_issue: 23
---

# Architecture Realization Review

## Objective

Reassess the current MNFS product architecture and implementation-sourcing strategy from first principles before committing the next material implementation boundary.

The review searches for the best-supported global solution rather than optimizing only inside prior Blueprint, ADR, Roadmap or Mission assumptions.

## Decision progress

```text
D1 — Planning and validation semantics          APPROVED — D-011
D2 — Agent runtime and session/control strategy APPROVED — D-012
D3 — Execution Environment architecture         APPROVED — D-013
D4 — Implementation sourcing strategy           APPROVED — D-014
SYNTHESIS — cross-decision architecture          APPROVED — D-015
EXECUTION PLANNING DESIGN                         APPROVED — D-016
ARR PROGRAM PLAN                                 ACCEPTED — GATE-P0 — v0.2.0
ARR-S0 PLAN                                      ACCEPTED — GATE-P0 — v0.2.0
P1 / GATE-R                                      ACCEPTED / INTEGRATED — D-017
P1 integration                                   PR #24 — def9e5fe819f76950d61fba2cf5abcda1533c07f
D-019 / proportionality review admission         ACCEPTED
GATE-CPR-CANONICAL                               AUTHORIZED — Tasks 1–3 only
NEXT POSSIBLE GATE                               GATE-CPR-S0-CORRECTION — NOT AUTHORIZED
```

## Accepted architecture

Canonical target:

```text
Thin Sovereign Semantic Kernel
+
Validation-first Planning
+
Replaceable Open Agent Runtime
+
Property-based Execution Environment
+
Provider-neutral Git Result Boundary
+
Independent Evidence / Gates
+
Capability-first Sourcing
```

Core disposition:

```text
M0                          PRESERVE
M1                          PRESERVE
MIS-002/M01                 PRESERVE / ACCEPTED
Product M2 outcome          PRESERVE
Product M2 realization      OPPORTUNITY REPLAN

MIS-002 revision 5          PRESERVE IMMUTABLE / HISTORICAL CURRENT AUTHORITY
MIS-002/M02 rev5 execution  SUPERSEDE / DO NOT IMPLEMENT
future MIS-002 revision     REQUIRED AFTER DECIDING SPIKES

CAP-EXECUTION 0.1.0         PRESERVE HISTORICAL
future CAP-EXECUTION        SUPERSEDING REVISION REQUIRED

ADR-0001                    PARTIAL SUPERSEDE
ADR-0003                    SUPERSEDE
ADR-0006                    PARTIAL SUPERSEDE
ADR-0008                    SUPERSEDE
```

Accepted M01 semantics/Evidence remain reusable where provider-neutral: durable WriteTrack/Attempt/ActorRun identities, fencing, Claim atomicity, Intent–Action–Observation, fresh-process Recovery/Reconcile and Git base/result lineage. Treehouse-specific physical realization remains historical implementation Evidence, not future constitutional architecture.

## Accepted Execution Planning Design — D-016

`DESIGN-LAYERED-AGENT-EXECUTION-PLANNING` version 1.1.0 is accepted.

Canonical planning layers:

```text
L0 — Validation Baseline          frozen correctness
L1 — Realization Baseline         frozen approved architecture
L2 — Execution Graph              versioned bounded decomposition
L3 — Tactical Agent Plan          adaptive / ephemeral
```

MCRM evolution:

```text
R3  Capability + Architecture + Sourcing
R4A Validation Baseline
R4B Decomposition + Allocation
R5  Execution Design & Readiness
R6  bounded proof-first Agent Execution Loop
R7  independent Verification / Validation
R8  Closeout / Learning / Calibration proposals
```

Every bounded execution unit uses role-specific compiled context, explicit write/resource/environment/tool authority, proof-first/TDD where applicable, finite retry/hypothesis policy and explicit `SUCCESS / BLOCKED / ESCALATE / HANDOFF_REQUIRED / REPLAN_REQUIRED` termination. Fresh-Actor recovery cannot depend on transcript/session continuity.

## Accepted execution plan package

### Master plan

`PLAN-ARCHITECTURE-RECONCILIATION-ARR-PROGRAM` version 0.2.0:

```text
pre-Spike semantic/authority reconciliation
→ shared Spike governance/Evidence contract
→ S0
→ S1/S2
→ conditional S2W
→ S3
→ substrate selection
→ superseding CAP-EXECUTION/MIS-002 authority
→ new M02 R5
```

It deliberately freezes sequence, gates, criteria and outputs while deferring candidate-specific implementation details until prerequisite Evidence exists.

### ARR-S0 plan

`PLAN-ARR-S0-HOST-CAPABILITY-PROBE` version 0.2.0 defines the first executable Spike design. S0 is observation-first and may not install packages, mutate WSL/kernel configuration, run candidate workloads or select a named substrate.

S0 outputs generic host facts and coarse capability classes such as:

```text
CLASS-LOCAL-PROCESS-ISOLATION
CLASS-LANDLOCK-ISOLATION
CLASS-MICROVM-KVM
CLASS-FUSE-COW
CLASS-LOCAL-CONTAINER
```

Named candidate eligibility is intentionally deferred to fresh S1/S2/S2W planners that combine immutable accepted S0 Evidence with refreshed primary-source project requirements. This prevents upstream requirement drift from mutating the meaning of historical host Evidence.

## Deciding Architecture Spike sequence

```text
ARR-S0  Host Capability Probe
ARR-S1  Agent Runtime Conformance
ARR-S2  Local Execution Envelope Conformance
ARR-S2W Workspace comparison — conditional only
ARR-S3  Vertical Composition Proof
```

Every comparative Spike must freeze a candidate-independent deciding contract first. Tests/fixtures may not be weakened after a preferred candidate fails unless the contract is formally revised and affected candidates are rerun under that same revision.

## Current proportionality and review-admission reconciliation

The accepted D-019 proportionality rule applies to the shared Spike governance without creating a second lifecycle or security subsystem. Each future Spike contract/plan must freeze its current trust assumptions, in-scope and out-of-scope adversaries/failures, gate class, allowed effects and forbidden effects. Findings are classified against that frozen authority before they become Correction scope.

For the current ARR-S0 replan:

- ARR-S0 Task 11 remains `REPLAN_REQUIRED` and **NOT CLOSED**; the proportionality path is selected, but its bounded correction has not been executed.
- Non-forgeable or signed Operator authority is `THREAT_MODEL_EXPANSION` under the current accepted S0 threat model. It is not current S0 correction scope and does not authorize Ed25519, PKI, signer/trust-root infrastructure or generic signed-capability machinery.
- Final pre-write Git/source re-observation is an `IMPLEMENTATION_DEFECT` against an already-required source-integrity property. Its bounded correction remains separately gated.
- Useful non-deciding defense-in-depth is `FUTURE_HARDENING`; it receives a named follow-up and is not represented as a current PASS requirement.

The current S0 correction path is therefore `GATE-CPR-S0-CORRECTION`, not the superseded pre-replan `GATE-S0-IMPLEMENT` orientation. This is a Governance Gate for workflow authority. `GATE-S0-EXECUTE` remains a separate later gate for real host observation and is **NOT AUTHORIZED**.

## Plan verification

```text
Master plan v0.2.0
commit:   e798b2a4a58e52318147b7bc17cc76b8f4616d83
workflow: 31180374347
result:   SUCCESS

ARR-S0 plan v0.2.0
commit:   59a1ff8ca20bbbb1a0170bd3eb68da68d86169af
job:      92872990047
command:  npm run verify
result:   SUCCESS
```

These checks validate the repository/planning package only. They are not host-probe or candidate-conformance Evidence.

## P1 / GATE-R closeout — ACCEPTED / INTEGRATED

On 2026-08-07 the Operator accepted ARR P1 / GATE-R, bound to:

```text
program blob: 52033adcdfb7163f63606034b9912942b018f38e
PR:           #24
P1 head:      02e99b25842562d111488d5c8c7008cb2635f3da
findings:     Critical 0 / Important 0
Decision:     D-017
Evidence:     ACCEPTANCE-ARR-P1-RECONCILIATION
```

GATE-R accepts the pre-Spike semantic/authority reconciliation and shared Spike governance produced by A1-A4+B1 plus P1-F01/P1-F02. PR #24 was subsequently integrated by squash merge at `def9e5fe819f76950d61fba2cf5abcda1533c07f`.

It does **not** authorize:

- ARR-S0 implementation or host probing;
- S1/S2/S2W/S3 execution;
- candidate adoption/selection;
- M02 production implementation;
- production Worker dispatch;
- automatic merge/delivery.

## Next possible gate — GATE-CPR-S0-CORRECTION (NOT AUTHORIZED)

The accepted proportionality/review-admission reconciliation must be integrated and accepted before a later exact Operator gate can authorize the one admitted ARR-S0 correction. `GATE-CPR-S0-CORRECTION` may authorize only the bounded final source re-observation correction and required terminology alignment; it remains separately **NOT AUTHORIZED**. Real host probing remains separately controlled by `GATE-S0-EXECUTE`, which is also **NOT AUTHORIZED**.

## Current relationship to MIS-002/M02

`MIS-002` revision 5 remains immutable historical/current authority until explicitly superseded, but D-015 decides that `MIS-002/M02` under revision 5 must not be implemented. Product M2 proceeds through Opportunity Replan after the deciding Architecture Spikes and final authority reconciliation.
