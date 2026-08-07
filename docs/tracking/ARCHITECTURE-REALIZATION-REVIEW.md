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
D4 — Implementation sourcing strategy           IN REVIEW
```

### Approved D1 direction — D-011

Preserve the Mission/Milestone/Feature hierarchy and Acceptance Criterion model, while changing the planning order so correctness is defined before implementation decomposition.

Approved semantic flow:

```text
Operator Intent
→ Investigation
→ Mission correctness definition
→ adversarial correctness review
→ Validation Baseline
→ Milestone decomposition
→ Feature decomposition
→ child criteria + upward coverage
→ architecture / implementation planning
→ Operator review
→ Approved Mission Contract
```

Decision rules:

- Mission Acceptance Criteria + their Verification Plans serve the **Validation Contract role**; do not create a duplicate authoritative `ValidationContract` entity without another independent need;
- add explicit upward contribution lineage (`CONTRIBUTES_TO` or equivalent) between child work/criteria and parent outcomes;
- Validator/Reviewer judges and produces Findings by default; it does not implement corrections;
- route Findings to Correction/new Attempt, new Feature or Decision/Replan according to what is actually wrong;
- preserve Mission/Milestone/Feature hierarchical closure;
- preserve proof-type diversity rather than reducing validation to black-box tests only;
- planning ceremony remains proportional to risk;
- staged draft/schema and Blueprint/MCRM changes are implementation consequences to reconcile after D2–D4 rather than being silently changed during D1.

### Approved D2 direction — D-012

Separate canonical MNFS execution semantics from coding-agent runtime and live session mechanics.

```text
MNFS Domain
  Role / ActorRun / Attempt / Authority / Recovery / Claim / Evidence / Verdict
        ↓
replaceable Agent Runtime boundary
        ↓
open coding-agent substrate
```

Decision rules:

- runtime Session identity is observational and never Mission/ActorRun authority;
- fresh MNFS recovery MUST NOT depend on runtime-session resume, transcript or runtime-owned memory;
- do not build a custom MNFS agent loop while credible open substrates exist;
- ACP is `SPIKE`, not `ADOPT`: a comparative spike must prove that an open protocol boundary lowers total complexity without weakening deterministic resource control, E1 composition or recovery;
- Pi remains the incumbent candidate because AS-02 already supplies accepted real WSL2/E1 Evidence;
- OpenCode/ACP is the strongest new challenger;
- proving ACP interoperability requires at least two real implementations, not only one ACP runtime;
- the comparative proof must cover exact cwd/environment, deterministic resource inventory, auth/provider compatibility, E1, cancellation, lifecycle/final-turn events, bounded output, process death, fresh recovery, structured results, version pinning and operational complexity;
- if ACP does not earn the abstraction, use a concrete runtime-specific adapter rather than inventing a generic provider layer;
- Mastra AgentController/Signals are `REFERENCE / DEFER` until a named long-lived live-session/control consumer exists;
- OpenHands is `REFERENCE / DEFER` for broader remote/server execution;
- no production runtime or Worker dispatch is selected or authorized by D2.

### Approved D3 direction — D-013

Model Execution Environments by required properties rather than an ordinal technology/locality ladder.

Decision rules:

- preserve separate Domain Authority, Tool Capability, Process Sandbox, Execution Environment, Credential, Network/Egress, External Effect and Evidence/Reconcile planes;
- supersede the old `E0 → E4` ladder as the semantic model;
- make Agent Runtime placement explicit: `CONTROL_SIDE` when the runtime can be strictly reduced to MNFS-brokered capabilities, or `IN_ENVIRONMENT` when that reduction cannot be proved;
- prefer brokered credentials/inference over raw secrets for whole-agent execution;
- a `WriteTrack` owns an isolated mutable workspace semantically, not inherently a physical Git worktree;
- preserve provider-neutral Git result identity (`baseCommitSha` + `resultTreeSha`, optionally a result commit) as the accepted output boundary;
- worktree paths, COW deltas, VM disks/snapshots and remote volumes remain execution artifacts, never acceptance authority;
- keep implementation concrete: property-independent semantics do not authorize generic provider/plugin factories without a second real consumer;
- run a canonical host-capability probe before local substrate selection;
- compare the accepted Anthropic Sandbox Runtime process incumbent against a leading process challenger such as `nono`; consider Sandlock only if host-kernel support is satisfied;
- compare BoxLite and `smol-machines/smolvm` as the leading current local microVM challengers;
- defer VFS/AgentFS selection until the chosen execution envelope demonstrates that another workspace/COW substrate is still needed;
- retain OpenShell/OpenSandbox as strong whole-agent/control-plane references and E2B/Mitos/Sandbox0/Kubernetes Agent Sandbox as future remote/parallel candidates;
- no Execution Environment substrate or production Worker dispatch is selected or authorized by D3.

## Review questions

### D1 — Planning and validation semantics — APPROVED

Disposition: **approved under D-011**, subject only to final cross-decision consistency review.

### D2 — Agent runtime and session strategy — APPROVED

Disposition: **approved under D-012**, subject to a later comparative Agent Runtime Architecture Spike before runtime selection.

### D3 — Execution Environment architecture — APPROVED

Disposition: **approved under D-013**, subject to host-capability and comparative local-envelope spikes before substrate selection.

### D4 — Implementation sourcing strategy — IN REVIEW

For each capability, decide what MNFS must `OWN` versus `ADOPT`, `ADAPT`, `SPIKE`, `REFERENCE`, `DEFER` or `REJECT`.

The review must explicitly check for:

- unnecessary custom infrastructure;
- duplicated authority/state;
- vendor lock-in;
- speculative abstraction;
- hidden maintenance tail;
- missing exit path;
- whether a dependency eliminates an entire meaningful machinery class or merely adds another integration surface;
- whether a capability has a named current consumer;
- whether the candidate can be proved against canonical MNFS criteria and removed without migrating domain meaning.

## Required outputs

1. first-principles capability decomposition;
2. credible candidate map;
3. comparative architecture scenarios;
4. qualitative/quantitative trade-off matrix where Evidence allows;
5. adversarial falsification of the preferred architecture;
6. unresolved assumptions and Architecture Spikes;
7. exact impact on Blueprint, ADRs, Roadmap, CAP-EXECUTION and MIS-002;
8. `PRESERVE / SUPERSEDE / REPLAN` disposition per affected authority;
9. new exact next gate.

## Authorization boundary

Authorized:

- research;
- source inspection;
- architecture comparison;
- documentation and Decision proposals;
- bounded Architecture Spikes only when separately justified by the review.

Not authorized by this review alone:

- M02 production implementation;
- production Pi/Droid/Mastra/OpenCode Worker dispatch;
- changing accepted Mission contracts in place;
- automatic merge/delivery;
- adopting a proprietary runtime as foundational dependency.

## Current relationship to MIS-002/M02

`MIS-002/M02` remains an approved historical/current realization candidate under revision 5, but its microdesign is paused as the next gate while the broader option space is reassessed.

The review may conclude:

```text
PRESERVE M02 as designed in contract
SUPERSEDE selected architecture assumptions
REPLAN M02 because a materially better realization exists
```

The decision must be made from current Evidence, not from sunk cost or prior approval alone.
