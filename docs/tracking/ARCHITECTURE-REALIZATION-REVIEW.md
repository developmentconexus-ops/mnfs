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
SYNTHESIS — cross-decision architecture          IN REVIEW
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

Every material sourcing decision must test:

- semantic ownership;
- authority inversion / duplicate state;
- mechanical leverage;
- replaceability and exit path;
- proofability;
- sovereignty and license;
- named consumer;
- pinned public/supported boundary and provenance;
- upgrade/removal conditions for foundational dependencies.

Additional rules:

- choose the lowest sufficient upstream layer;
- prefer one primary production substrate per concern;
- do not add a dependency unless it eliminates meaningful machinery or is otherwise clearly simpler than the local implementation;
- small local mechanics may beat dependencies when they are genuinely smaller and safer;
- proprietary foundational runtimes are `REFERENCE` by default unless explicit Operator authority accepts the sovereignty trade-off;
- the tooling registry is a projection of capability decisions, not architectural authority;
- do not build custom agent loops, browser engines, hypervisors, VCS/database engines or generic distributed workflow infrastructure by default while credible substrates exist.

## Current phase — Architecture Synthesis & Reconciliation

D1–D4 are individually approved. The current task is to combine them into one coherent architecture and determine the exact impact on current authority.

Required synthesis outputs:

1. canonical target architecture and trust boundaries;
2. end-to-end lifecycle from Operator Intent through accepted Git result;
3. first-principles component/capability ownership map;
4. exact `PRESERVE / SUPERSEDE / REPLAN` disposition for Product Blueprint sections, ADRs, Roadmap, CAP-EXECUTION and MIS-002;
5. identify accepted implementation/Evidence that remains reusable without pretending its old realization is still mandatory;
6. bounded Architecture Spikes, with ordering and deciding criteria;
7. exact post-spike decision gate and the path back to M2 execution;
8. explicit adversarial case against the synthesized architecture.

## Authorization boundary

Authorized:

- cross-decision architecture synthesis;
- source/document impact analysis;
- documentation/Decision proposals;
- bounded Architecture Spike design.

Not authorized by this review alone:

- M02 production implementation;
- production Worker dispatch;
- changing accepted Mission contracts in place;
- automatic merge/delivery;
- concrete foundational runtime/environment adoption without the required approved spike/decision.

## Current relationship to MIS-002/M02

`MIS-002` revision 5 remains authoritative historical/current contract until explicitly superseded. `MIS-002/M02` microdesign remains paused.

The synthesis must decide whether to:

```text
PRESERVE M02 contract semantics
SUPERSEDE selected architecture assumptions
REPLAN M2/M02 because the approved architecture is materially better
```

That disposition must be based on D1–D4 and current Evidence, not sunk cost.
