---
id: ADR-0009
title: Operator Control Plane and presentation surfaces
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
  - DOC-PRODUCT-BLUEPRINT-06
  - DOC-PRODUCT-BLUEPRINT-11
tracking_issue: 6
---

# ADR-0009 — Operator Control Plane and presentation surfaces

## Context and problem statement

MNFS uses CLI, Lavish and potentially Herdr and a future web interface. Session and terminal views are useful but can create false completion if treated as product state.

## Decision drivers

- Operator attention should be Mission-first.
- All surfaces must use the same Application Services.
- Lavish and Herdr must remain replaceable.
- A Web Console should not precede stable contracts.

## Considered options

- Terminal-only UX.
- Session-first crew dashboard.
- Build a Web Console immediately.
- Keep CLI canonical and layer specialized projections.

## Decision outcome

CLI remains the canonical local control and JSON API. Lavish is the structured review surface. Herdr is optional operational projection. A future Web Console is Mission-first and calls the same Application Services after domain/CLI contracts stabilize. Presentation never owns lifecycle.

## Positive consequences

- Local automation and agents share one command contract.
- UI failure cannot corrupt state.
- The Operator sees criteria, Decisions, Evidence and next actions.

## Negative consequences

- The richer Web Console is deferred.
- Multiple projections need consistent correlation.

## Risks

- Frontend duplicating domain rules.
- Terminal/session state being mistaken for Feature state.
- Alert noise.

## Validation

M2–M9 prove CLI flows; M10 Golden Proof performs the same Mission through UI and CLI with identical state.

## Migration and rollback

Remove a presentation adapter while retaining CLI/Core.

## Supersession

This ADR is accepted. A semantic change requires a new ADR that explicitly supersedes this record.

## Related documents

- DOC-PRODUCT-BLUEPRINT-06
- DOC-PRODUCT-BLUEPRINT-11
