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
EXECUTION PLANNING DESIGN                         CURRENT
```

## Approved D1 — Planning and validation

- preserve Mission/Milestone/Feature hierarchy and Acceptance Criterion model;
- define Mission correctness before Milestone/Feature decomposition;
- Mission Criteria + Verification Plans serve the Validation Contract role;
- add explicit upward contribution lineage (`CONTRIBUTES_TO` or equivalent);
- Validators judge and produce Findings; they do not implement corrections by default;
- route Findings to Correction/new Attempt, new Feature or Decision/Replan according to what is wrong;
- preserve hierarchical closure and proof-type diversity;
- keep planning ceremony proportional to risk.

## Approved D2 — Agent Runtime and Session/Coordination

- MNFS owns Role/ActorRun/Attempt/Authority/Recovery/Claim/Evidence/Verdict semantics;
- coding-agent loops, provider/model mechanics, runtime Sessions and live transport are replaceable substrates;
- runtime Session identity is observational and domain recovery must work without session resume/transcript;
- do not build a custom MNFS agent loop while credible open substrates exist;
- ACP is a comparative `SPIKE`, not a preselected dependency;
- Pi is the incumbent with accepted AS-02 Evidence; OpenCode/ACP is the leading challenger and a second ACP implementation is required before interoperability is considered proved;
- Mastra AgentController/Signals and broader agent servers remain deferred until named consumers exist.

## Approved D3 — Execution Environment

- preserve separate Authority, Tool Capability, Process Sandbox, Execution Environment, Credential, Network/Egress, External Effect and Evidence/Reconcile planes;
- supersede the ordinal `E0 → E4` technology/locality ladder as the semantic model;
- describe environments through independent properties including agent placement, compute location, isolation boundary, workspace model, persistence, network posture, credential delivery and recovery capability;
- `WriteTrack` owns isolated mutable workspace semantics, not an inherent Git worktree;
- provider-neutral Git result identity (`baseCommitSha` + `resultTreeSha`, optional result commit) remains the accepted output boundary;
- prefer `CONTROL_SIDE` agent placement when strict MNFS-brokered capability reduction is provable; otherwise use `IN_ENVIRONMENT` with brokered credentials/inference preferred over raw secrets;
- perform host-capability, process-envelope and microVM-envelope comparative spikes before selecting local substrates;
- defer VFS/AgentFS choice until the selected envelope proves whether another COW workspace substrate is still needed.

## Approved D4 — Implementation sourcing

Canonical direction:

```text
Thin Sovereign Semantic Kernel
+
Selective Open Substrates
```

MNFS owns differentiated semantics and authority. Commodity mechanics are presumed `ADOPT`/`ADAPT` when an open, replaceable substrate removes a meaningful machinery class without becoming a second source of truth.

Capability-realization vocabulary:

```text
OWN / ADOPT / ADAPT / SPIKE / REFERENCE / DEFER / REJECT
```

Every material sourcing decision must test semantic ownership, authority inversion, mechanical leverage, replaceability/exit, proofability, sovereignty/license and a named consumer. Prefer the lowest sufficient upstream layer, one primary production substrate per concern and concrete implementations until a second real consumer earns a generic abstraction.

## Approved Architecture Synthesis — D-015

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

Disposition:

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

Approved deciding-spike sequence:

```text
ARR-S0  Host Capability Probe
ARR-S1  Agent Runtime Conformance
ARR-S2  Local Execution Envelope Conformance
ARR-S2W Workspace comparison — conditional only
ARR-S3  Vertical Composition Proof
```

Spike execution still requires a separate exact authorization gate.

## Current phase — Execution Planning Design

Before authorizing any Architecture Spike, define the execution-planning method that turns approved architecture and Validation into reliable agent work.

The design must answer at least:

1. which parts of a plan are frozen Authority versus adaptive tactical reasoning;
2. how Validation Baseline, Milestones, Features and executable work units relate;
3. how every work unit proves upward coverage and receives only the required context;
4. how repository localization, architecture, sourcing, security, environment, resources, concurrency and tool boundaries are captured before dispatch;
5. how TDD, deterministic verification, independent validation, integration and live QA are scheduled;
6. how retries, failed hypotheses, blocked states, escalation and Replan are bounded;
7. what a fresh Actor must read before starting and what it must leave behind at handoff;
8. how budgets, termination conditions and progress are made explicit;
9. how findings and production learnings feed Evaluation/Calibration rather than silently mutating current Authority;
10. how plan completeness is mechanically checked so no applicable concern from D1–D4/MCRM is omitted.

## Authorization boundary

Authorized:

- research on effective planning/execution for AI agents;
- Execution Planning Design;
- Architecture/authority reconciliation proposals;
- bounded Architecture Spike specification and planning.

Not authorized by this review alone:

- Architecture Spike execution;
- M02 production implementation;
- production Worker dispatch;
- changing accepted Mission contracts in place;
- automatic merge/delivery;
- concrete foundational runtime/environment adoption without the required approved spike/decision.

## Current relationship to MIS-002/M02

`MIS-002` revision 5 remains immutable historical/current authority until explicitly superseded, but D-015 decides that `MIS-002/M02` under revision 5 must not be implemented. Product M2 proceeds through Opportunity Replan after the deciding Architecture Spikes and final reconciliation.
