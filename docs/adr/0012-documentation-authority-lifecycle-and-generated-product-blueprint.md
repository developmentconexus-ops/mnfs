---
id: ADR-0012
title: Documentation authority, lifecycle and generated Product Blueprint
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
  - DOC-PRODUCT-BLUEPRINT-13
  - DOC-DOCUMENTATION-MAP
  - DOC-CAPABILITY-REALIZATION-METHOD
tracking_issue: 6
---

# ADR-0012 — Documentation authority, lifecycle and generated Product Blueprint

## Context and problem statement

The architecture now spans many documents. Without authority, ownership, metadata and supersession rules, the repository would accumulate conflicting Markdown and depend on chat history.

## Decision drivers

- One concept needs one canonical owner.
- Accepted decisions and contracts need immutable history.
- Large Blueprint sources need modular review.
- Agents require bounded authoritative discovery.
- Structural drift should be mechanically detectable.

## Considered options

- One monolithic architecture file.
- Issues and chats as living documentation.
- External documentation platform now.
- Docs-as-code with authority classes, modular sources and generated projections.

## Decision outcome

Git owns canonical product docs; `.mnfs` owns repository machine artifacts; SQLite owns operational state. Adopt A0–A10 authority classes, YAML metadata, CODEOWNERS, documentation impact, CI and explicit supersession. Maintain 13 modular Blueprint sources and generate the aggregate. Use ADRs for decisions and KEP/RFC-like Capability Specs for reusable capabilities.

## Positive consequences

- Knowledge is discoverable, reviewable and agent-usable.
- Historical decisions remain explainable.
- Generated projections cannot silently drift.

## Negative consequences

- Metadata and docs checks add maintenance.
- Material changes require impact analysis.

## Risks

- Governance becoming ceremony.
- Semantic contradictions passing structural CI.
- Owners becoming bottlenecks.

## Validation

AB1 publishes the system, runs docs checks and proves a new Lead can identify the next action without chat history.

## Migration and rollback

Simplify checks or metadata while preserving authority, ownership and supersession invariants.

## Supersession

This ADR is accepted. A semantic change requires a new ADR that explicitly supersedes this record.

## Related documents

- DOC-PRODUCT-BLUEPRINT-13
- DOC-DOCUMENTATION-MAP
- DOC-CAPABILITY-REALIZATION-METHOD
