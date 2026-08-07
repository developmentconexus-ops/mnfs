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
- mature adjacent runtime, workflow, sandbox, browser, MCP and observability primitives;
- current MNFS implementation and canonical WSL2 constraints.

## Review questions

### D1 — Planning and validation semantics

What is the best ordering and contract model for:

```text
Operator intent
→ investigation
→ validation/correctness contract
→ criteria
→ decomposition
→ implementation
→ independent validation
→ correction
→ closure
```

### D2 — Agent runtime and session strategy

What capabilities must MNFS require from agent runtimes and session/control infrastructure without assuming Pi, Mastra or another winner in advance?

Evaluate open and replaceable candidates against:

- headless control;
- streaming/events;
- tool/resource control;
- provider/model access;
- session lifecycle;
- interruption/recovery;
- structured output;
- multi-role support;
- security composition;
- sovereignty and exit strategy;
- maintenance cost.

Proprietary systems such as Factory Droid are architectural references by default, not desired foundational dependencies.

### D3 — Execution workspace and isolation strategy

What is the best long-term workspace substrate for local and future remote Workers?

Compare relevant shapes such as:

```text
Git/Treehouse worktree + E1 sandbox
Git worktree + COW/virtual filesystem
VFS/AgentFS-style portable delta
remote sandbox/provider workspace
```

Evaluate Git fidelity, isolation, recovery, handoff, portability, integration, parallelism, performance and cleanup.

### D4 — Implementation sourcing strategy

For each capability, decide what MNFS must `OWN` versus `ADOPT`, `ADAPT`, `SPIKE`, `REFERENCE`, `DEFER` or `REJECT`.

The review must explicitly check for:

- unnecessary custom infrastructure;
- duplicated authority/state;
- vendor lock-in;
- speculative abstraction;
- hidden maintenance tail;
- missing exit path.

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
- production Pi/Droid/Mastra Worker dispatch;
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
