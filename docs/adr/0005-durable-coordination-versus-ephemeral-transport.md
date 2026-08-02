---
id: ADR-0005
title: Durable coordination versus ephemeral transport
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
  - DOC-PRODUCT-BLUEPRINT-08
  - DOC-PRODUCT-BLUEPRINT-09
tracking_issue: 6
---

# ADR-0005 — Durable coordination versus ephemeral transport

## Context and problem statement

Workers and Leads need notifications, steering and future cross-session messaging. Transport can duplicate, arrive late or disappear, so it cannot be the only representation of work or decisions.

## Decision drivers

- Lost messages must not lose state.
- M2 must remain simple.
- Future process, Pi RPC, WebSocket and cloud transports must be replaceable.
- Restart recovery must not parse terminals.

## Considered options

- Use terminal output as coordination.
- Adopt `pi-link` as the command bus.
- Build a message broker now.
- Persist commands/state in MNFS and use transport only to notify or deliver.

## Decision outcome

Durable coordination lives in SQLite and content-addressed Artifacts. Messages are small at-least-once notifications with Artifact references. M2 uses child-process dispatch and MNFS CLI state changes. `pi-link`, Pi SDK/RPC and future queues may implement a NotificationTransportAdapter but never domain memory or authority.

## Positive consequences

- Transport loss is recoverable.
- M2 avoids a premature broker.
- Local and cloud delivery mechanisms can change.
- Messages remain small.

## Negative consequences

- Actors must re-read durable commands after wake.
- Outbox/inbox semantics may be needed later.

## Risks

- Treating transport acknowledgement as completion.
- Duplicate delivery causing repeated non-idempotent action.

## Validation

Recovery drills lose or duplicate notifications while SQLite/Artifacts preserve the correct next action.

## Migration and rollback

Replace the transport adapter without migrating domain state.

## Supersession

This ADR is accepted. A semantic change requires a new ADR that explicitly supersedes this record.

## Related documents

- DOC-PRODUCT-BLUEPRINT-08
- DOC-PRODUCT-BLUEPRINT-09
