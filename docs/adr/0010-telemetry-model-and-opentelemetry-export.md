---
id: ADR-0010
title: Telemetry model and OpenTelemetry export
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
  - DOC-PRODUCT-BLUEPRINT-11
  - DOC-PRODUCT-BLUEPRINT-10
tracking_issue: 6
---

# ADR-0010 — Telemetry model and OpenTelemetry export

## Context and problem statement

MNFS needs traces, metrics, logs and token/cost data without making an observability backend the source of truth or exporting sensitive content by default.

## Decision drivers

- Domain Events and telemetry have different durability.
- Backend neutrality is required.
- GenAI conventions are evolving.
- Privacy and security policies must apply before export.

## Considered options

- Custom telemetry database.
- Backend-specific SDK as domain dependency.
- Logs only.
- Stable `mnfs.*` semantics mapped to OpenTelemetry/OTLP.

## Decision outcome

Domain Events remain authoritative in SQLite. Adopt OpenTelemetry as the instrumentation/export interchange with stable `mnfs.*` correlation attributes. Raw prompts, outputs, code, diffs and secrets are off by default. Phoenix and Langfuse are optional backend candidates evaluated by AS-03.

## Positive consequences

- Vendor-neutral traces and correlation.
- Execution remains correct without a backend.
- Privacy boundaries are explicit.

## Negative consequences

- Mapping and exporter versions must be maintained.
- Some backend capabilities may require optional adapters.

## Risks

- Sensitive content leakage.
- Long Mission spans or misleading trace identity.
- Unstable GenAI conventions.

## Validation

AS-03 compares local baseline, Phoenix and Langfuse with disabled-backend, privacy, overhead, retention and evaluation scenarios.

## Migration and rollback

Disable exporters; local Domain Events and counters continue.

## Supersession

This ADR is accepted. A semantic change requires a new ADR that explicitly supersedes this record.

## Related documents

- DOC-PRODUCT-BLUEPRINT-11
- DOC-PRODUCT-BLUEPRINT-10
