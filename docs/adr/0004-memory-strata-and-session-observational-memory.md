---
id: ADR-0004
title: Memory strata and Session Observational Memory
document_type: architecture_decision_record
form: explanation
authority: decision
status: accepted
date: 2026-08-02
owners:
  - developmentconexus-ops
approvers:
  - operator
supersedes: []
superseded_by: null
related:
  - DOC-PRODUCT-BLUEPRINT-09
  - DOC-CAPABILITY-REALIZATION-METHOD
tracking_issue: 6
---

# ADR-0004 — Memory strata and Session Observational Memory

## Context and problem statement

MNFS needs long-running Pi Sessions without making transcript summaries, compacted observations or a memory plugin the source of truth. Pi already persists exact JSONL session history and exposes compaction hooks. Research found `pi-observational-memory` V3 promising, but probabilistic and session-scoped.

## Decision drivers

- Current state must survive Session loss.
- Memory must not create false completion.
- Review and QA independence must be preserved.
- Memory cost and benefit must be measurable.
- Third-party tooling must remain replaceable.

## Considered options

- Use only native Pi compaction.
- Adopt `pi-observational-memory` globally.
- Embed Mastra memory.
- Separate canonical, compiled, observational and historical memory layers.

## Decision outcome

Adopt five memory/context strata: L0 canonical SQLite/Git memory, L1 Current Authority Snapshot and Context Pack, L2 optional Session Observational Memory, L3 exact Pi JSONL history and L4 ephemeral transport. SQLite, Approved Contracts and the Current Authority Snapshot always outrank Session memory. `pi-observational-memory@3.0.3` is a Lead-only candidate after AS-01, not a core dependency.

## Positive consequences

- Session continuity can improve without weakening authority.
- New Sessions recover from durable artifacts.
- Reviewers and QA remain cold by default.
- Pi native compaction remains fallback.
- Exact source recall is possible.

## Negative consequences

- Another optional model cost may be introduced.
- Memory adapter compatibility needs testing.
- A Current Authority Snapshot injector must be built.

## Risks

- False memories or stale completion statements.
- V2/V3 plugin incompatibility.
- Multiple memory plugins injecting contradictory context.

## Validation

AS-01 compares native Pi compaction and the candidate through multiple compactions, conflicts with SQLite, exact recall, role isolation, failure and total cost.

## Migration and rollback

Disable the Session Memory Adapter. Durable state and clean-session recovery remain unaffected.

## Supersession

This ADR is accepted. A semantic change requires a new ADR that explicitly supersedes this record.

## Related documents

- DOC-PRODUCT-BLUEPRINT-09
- DOC-CAPABILITY-REALIZATION-METHOD
