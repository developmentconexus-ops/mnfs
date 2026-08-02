---
id: ADR-0003
title: Worktree per Concurrent Write Track
document_type: architecture_decision_record
form: explanation
authority: decision
status: accepted
owners:
  - developmentconexus-ops
---

# ADR-0003: Worktree per concurrent write track

- **Status:** Accepted
- **Date:** 2026-07-31

## Decision

A worktree represents an independently mutable and integrable write track, not every session, feature or retry by default.

Reuse the same worktree for a local correction while the contract, write set, base and trust boundary remain valid. Allocate another worktree after a material replan, a substantially changed write set, a contaminated workspace or an independent competing hypothesis.

Integration occurs in a clean integration workspace. Ports, databases, containers and external side effects require separate isolation or serialization policies.
