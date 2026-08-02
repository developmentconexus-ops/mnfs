---
id: DOC-RESEARCH-FIRSTMATE-INSPIRATION-MAP
title: FirstMate Inspiration Map
document_type: research_map
form: explanation
authority: research_historical
status: published
version: 1.0.0
owners:
  - developmentconexus-ops
source_of_truth_for:
  - classification of FirstMate patterns for MNFS
related:
  - DOC-PRODUCT-BLUEPRINT
  - ADR-0001
  - ADR-0003
  - GH-ISSUE-6
last_reviewed: 2026-08-02
tracking_issue: 6
---

# FirstMate Inspiration Map

## 1. Purpose

FirstMate is a reference implementation for operating a visible crew of coding agents.

MNFS does not fork FirstMate. It selectively adopts product and operational patterns while retaining a different domain model and authority system.

Classification:

```text
ADOPT
ADAPT
REFERENCE ONLY
REJECT
```

## 2. Executive map

| FirstMate pattern | Classification | MNFS treatment |
|---|---|---|
| One liaison / lead | ADOPT | Operator speaks primarily to MNFS Lead |
| Visible worker crew | ADAPT | Worker Runs/Tracks visible; domain state remains SQLite |
| Ship and scout task shapes | ADAPT | Writer and Investigator Role Contracts |
| Brief on disk before spawn | ADOPT | Context Pack and Current Authority Snapshot |
| Isolated worktrees | ADOPT | Treehouse Lease per Write Track |
| Restart reconciliation | ADOPT + STRENGTHEN | Reconcile SQLite/Git/Treehouse/process/filesystem |
| Event-driven supervision | ADAPT | Domain Events plus replaceable notifications |
| Durable wake principles | ADAPT | Messages wake; state/artifacts remember |
| Semantic worker lifecycle | ADOPT | Worker Run states separate from process heuristics |
| Short messages pointing to artifacts | ADOPT | `MnfsMessage` with Artifact refs |
| Preserve unlanded work | ADOPT | No release until integrated or explicitly abandoned |
| Operator authority | ADOPT + FORMALIZE | D0–D5 Decisions and A0–A5 autonomy |
| Treehouse | ADOPT behind adapter | Physical pool/lease only |
| Herdr | OPTIONAL | Operational projection only |
| Lavish | ADAPT | Structured plan/decision review |
| Full distro/fork | REJECT | MNFS remains its own product |
| Watcher matrix | REFERENCE ONLY | Add only with measured need |
| Multi-harness compatibility | REJECT | Pi-first |
| Session UI as state | REJECT | Session is operational projection |
| Auto merge/ship semantics | REJECT | Integration and Delivery Gates govern |

## 3. One liaison

Adopt:

```text
Operator
↔ MNFS Lead
↔ bounded Actors
```

Benefits:

- lower tab and context switching;
- consolidated Decisions;
- one accountable coordinator;
- workers remain specialized.

MNFS strengthens the pattern by making the Lead a governance role, not a super-worker.

## 4. Ship and scout

FirstMate distinguishes work that writes from work that investigates.

MNFS maps this to:

```text
Writer Worker
→ bounded Write Track and Claim

Investigator
→ read-only question, budget, exit criteria and report
```

A scout result is not implementation.

A Writer does not expand into broad investigation without escalation.

## 5. Brief before spawn

Adopt as a hard rule.

MNFS artifact:

```text
Current Authority Snapshot
+
Context Pack
+
Role Contract
```

The pack contains:

- target;
- criteria;
- scope;
- write-set;
- Standards;
- commands;
- security policy;
- output contract;
- termination and escalation.

## 6. Worktrees and Treehouse

Adopt Treehouse as a narrow external adapter.

Treehouse owns:

- physical worktree acquisition;
- path;
- external lease ID;
- physical release.

MNFS owns:

- semantic Write Track;
- holder;
- Attempt;
- Claim;
- trust;
- acceptance;
- integration;
- release authorization.

Worktree is the unit of concurrent write Track, not session or retry.

## 7. Visibility

FirstMate demonstrates the value of visible background workers.

MNFS provides three layers:

```text
Domain state
→ authoritative

Operational projection
→ process/session/worktree

Terminal projection
→ optional Herdr
```

A visual `done` indicator never closes a Feature.

## 8. Restart reconciliation

Adopt and strengthen.

Fresh Lead does not depend on the old transcript.

It compares:

- SQLite;
- Git;
- Treehouse;
- filesystem;
- process state;
- Pi session artifacts.

Result:

- healthy;
- divergence;
- unknown;
- safe action;
- required Authority.

## 9. Event-driven supervision and wake

Adopt the insight:

```text
polling every transcript line is wasteful
```

Adaptation:

- Domain Events persist facts;
- notification transports can wake Actors;
- artifacts carry payload;
- Reconcile recovers lost messages;
- no transport becomes authority.

Potential future transports:

- process stdin;
- Pi SDK/RPC;
- `pi-link`;
- cloud queue.

## 10. Semantic lifecycle

Adopt lifecycle distinct from process output:

```text
STARTING
RUNNING
IDLE_ADDRESSABLE
EXITED
LOST
CANCELLED
```

Separate:

```text
Worker Run
Attempt
Claim
Write Track
```

Process alive does not prove progress.

Process exit does not prove completion.

## 11. Short messages and artifacts

Adopt:

```text
small envelope
+
Artifact reference
```

Messages do not carry:

- whole diff;
- whole plan;
- logs;
- Evidence Bundle;
- contract.

Lost message does not lose state.

## 12. Operator authority and preservation

Adopt:

- Operator owns product and irreversible Decisions;
- workers cannot destroy unlanded work;
- cleanup is explicit;
- cancellation preserves evidence/diff;
- worktree stays until integration or abandonment.

MNFS formalizes this with:

- Authority Matrix;
- Effect Request;
- Recovery action;
- fencing;
- Evidence.

## 13. What MNFS adds

FirstMate inspiration is operational. MNFS adds:

- Mission/Milestone/Feature contracts;
- criteria hierarchy;
- Product Roadmap Milestones;
- Capability Realization Method;
- Claim/Receipt/Verdict;
- Engineering Standards;
- Golden Paths;
- Quality Posture;
- Security Environments;
- Credential Grants;
- External Effects;
- Evidence Bundles;
- Evaluation and Calibration.

## 14. Why no full fork

A fork would inherit:

- distro decisions;
- watcher architecture;
- multiple harness compatibility;
- session-first semantics;
- release cadence;
- unrelated UI/runtime assumptions.

MNFS needs:

- Pi-first narrow runtime;
- TypeScript modular monolith;
- SQLite authority;
- WSL2-first local proof;
- explicit replaceable adapters;
- its own domain contracts.

## 15. Tool-specific decisions

### Treehouse

```text
ADOPT
```

after real WSL2 proof.

### Herdr

```text
OPTIONAL
```

Presentation only.

### Lavish

```text
ADOPTED FOR PLANNING
```

May later support other reviews.

### no-mistakes

```text
DEFER
```

Delivery adapter only after MNFS quality authority exists.

### FirstMate itself

```text
REFERENCE ONLY
```

No runtime dependency.

## 16. Rejection list

MNFS rejects:

- session as task identity;
- terminal parsing as recovery;
- worker self-verdict;
- UI status as domain state;
- automatic destruction after process completion;
- universal watcher matrix;
- mandatory full crew for small work;
- compatibility with multiple agent harnesses before Pi-first proof;
- importing code without license/origin records.

## 17. Summary

```text
FirstMate
→ proves one-liaison and visible-worker product value

MNFS
→ preserves that value while adding deterministic contracts,
   authority, evidence, recovery, security and engineering governance
```
