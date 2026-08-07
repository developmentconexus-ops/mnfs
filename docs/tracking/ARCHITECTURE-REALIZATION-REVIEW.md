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
  - DOC-PRODUCT-BLUEPRINT
  - DOC-CAPABILITY-ROADMAP
  - TRACKING-DECISIONS
tracking_issue: 23
---

# Architecture Realization Review

## Objective

Reassess the current MNFS product architecture and implementation-sourcing strategy from first principles before committing the next material implementation boundary.

The review searches for the best-supported global solution rather than optimizing only inside prior Blueprint, ADR, Roadmap or Mission assumptions.

## Current evidence base

- accepted MNFS Product Blueprint and ADR set;
- accepted M0/M1/M01 Evidence;
- CAP-EXECUTION and MIS-002 revision 5;
- Mastra Software Factory / AgentController / Signals / ACP research;
- Pi SDK/RPC/extensions/session research;
- Factory.ai Software Factory / Missions / Droid / open-source VFS research;
- open agent-runtime interoperability research including ACP and open coding-agent runtimes;
- local/remote sandbox landscape including Anthropic Sandbox Runtime, nono, Sandlock, BoxLite, `smol-machines/smolvm`, CelestoAI/SmolVM, microsandbox, OpenShell, OpenSandbox, E2B, Mitos, Sandbox0, Kubernetes Agent Sandbox, Cleanroom/SporeVM and VFS/AgentFS;
- mature adjacent workflow, browser, MCP and observability primitives;
- current MNFS implementation and canonical WSL2 constraints.

## Decision progress

```text
D1 — Planning and validation semantics          APPROVED — D-011
D2 — Agent runtime and session/control strategy APPROVED — D-012
D3 — Execution Environment architecture         APPROVED — D-013
D4 — Implementation sourcing strategy           APPROVED — D-014
SYNTHESIS — cross-decision architecture          APPROVED — D-015
EXECUTION PLANNING DESIGN                         APPROVED — D-016
RECONCILIATION + SPIKE EXECUTION PLAN             CURRENT
```

## Approved architecture

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

`DESIGN-LAYERED-AGENT-EXECUTION-PLANNING` version 1.0.0 is accepted.

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

## Deciding Architecture Spike sequence

```text
ARR-S0  Host Capability Probe
ARR-S1  Agent Runtime Conformance
ARR-S2  Local Execution Envelope Conformance
ARR-S2W Workspace comparison — conditional only
ARR-S3  Vertical Composition Proof
```

The sequence is governed by candidate-independent deciding contracts. Candidate tests/fixtures may not be weakened after observing a preferred candidate fail unless the contract is revised and every affected candidate is rerun under the same revision.

## Current phase — Architecture Reconciliation + Spike Execution Planning

The current task is to produce the reviewed execution plan that converts D-011 through D-016 into bounded, exact work.

The plan must:

1. identify which canonical documents are reconciled before any Spike and which must wait for Spike Evidence;
2. keep accepted historical documents immutable where their authority/version must be preserved;
3. define exact files/interfaces and proof steps for the first executable tranche;
4. fully specify `ARR-S0` because it has no dependency on unresolved substrate selection;
5. define candidate-independent contracts, outputs and gates for S1/S2/S2W/S3 without inventing implementation details that preceding Spikes must decide;
6. mechanically prove coverage of D-011 through D-016 and the accepted planning completeness concerns;
7. state explicit authorization tokens/gates so plan approval does not accidentally authorize execution;
8. preserve M02 production prohibition until new CAP-EXECUTION/MIS-002 authority is created after S3.

## Authorization boundary

Authorized:

- architecture reconciliation planning;
- exact design/plan documents for ARR-S0 through ARR-S3;
- documentation/Decision proposals;
- deterministic tests of documentation/planning tooling only when separately authorized by a later execution gate.

Not authorized by plan drafting or review alone:

- ARR-S0 host probing;
- ARR-S1/S2/S2W/S3 candidate execution;
- M02 production implementation;
- production Worker dispatch;
- changing accepted Mission contracts in place;
- automatic merge/delivery;
- concrete foundational runtime/environment adoption without the required Spike Evidence and Decision.

## Current relationship to MIS-002/M02

`MIS-002` revision 5 remains immutable historical/current authority until explicitly superseded, but D-015 decides that `MIS-002/M02` under revision 5 must not be implemented. Product M2 proceeds through Opportunity Replan after deciding Architecture Spikes and final authority reconciliation.
