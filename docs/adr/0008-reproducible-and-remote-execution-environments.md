---
id: ADR-0008
title: Reproducible and remote Execution Environments
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
  - DOC-PRODUCT-BLUEPRINT-05
  - DOC-PRODUCT-BLUEPRINT-10
tracking_issue: 6
---

# ADR-0008 — Reproducible and remote Execution Environments

## Context and problem statement

Repositories need different toolchains and services. Future untrusted or parallel workloads may need isolation stronger than the local WSL2 host.

## Decision drivers

- Reproducibility and isolation must not be conflated.
- Environment providers must not own MNFS lifecycle.
- Local semantics must survive remote evolution.
- Cloud infrastructure should not enter before proven demand.

## Considered options

- Host-only execution.
- Dev Containers as universal security boundary.
- Adopt Daytona now.
- Define an EnvironmentAdapter and stage E0–E4 levels.

## Decision outcome

Model Execution Environment Specs/Instances separately from Treehouse Leases. Support Dev Containers as optional environment-as-code, not sufficient security. Daytona is the primary future E3 candidate, E2B an alternative, Ona and Firecracker references. Remote execution is deferred to AS-04/M12 behind an adapter.

## Positive consequences

- Repository setup becomes reproducible without vendor lock-in.
- Local and remote workers share domain semantics.
- High-isolation paths remain possible.

## Negative consequences

- Environment discovery and lifecycle add complexity later.
- Dev Container configuration requires security inspection.

## Risks

- Provider semantics leaking into domain.
- Container privilege or mounts weakening security.
- Remote cost and persistence surprises.

## Validation

M3 validates one repository environment binding; AS-04 compares remote candidates before M12.

## Migration and rollback

Use HOST_INSPECTION/LOCAL_SANDBOX or replace the remote adapter.

## Supersession

This ADR is accepted. A semantic change requires a new ADR that explicitly supersedes this record.

## Related documents

- DOC-PRODUCT-BLUEPRINT-05
- DOC-PRODUCT-BLUEPRINT-10
