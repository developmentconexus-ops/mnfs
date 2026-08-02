---
id: ADR-0007
title: Credential Grants and External Effects
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
  - DOC-PRODUCT-BLUEPRINT-10
  - DOC-PRODUCT-BLUEPRINT-12
tracking_issue: 6
---

# ADR-0007 — Credential Grants and External Effects

## Context and problem statement

Agent tools may need GitHub, provider, staging or production access. A secret in the user environment does not imply authorization for every action.

## Decision drivers

- Secrets must stay out of prompts, Packs, memory and logs.
- Temporary least-privilege identities are preferred.
- Timeouts can leave external state unknown.
- Production mutation requires explicit authority.

## Considered options

- Give Writers the user environment.
- Prompt for every shell command.
- Use provider-specific ad hoc scripts.
- Model credentials and external effects as durable bounded entities.

## Decision outcome

Introduce Credential Requirement/Grant and Effect Request/Executor/Receipt. SQLite stores metadata and secret references, never plaintext. Ordinary Writers have no production credentials. X4–X6 mutations use a separate approved Effect Executor. Unknown external outcomes require Reconcile before retry. Prefer OIDC/workload identity and temporary credentials.

## Positive consequences

- Credentials and authority are independently scoped.
- External mutations become auditable and recoverable.
- Provider adapters remain typed and replaceable.

## Negative consequences

- Additional lifecycle and adapters are required before external automation.
- Some providers may not support ideal temporary credentials.

## Risks

- Secret leakage through tool output.
- Non-idempotent retries.
- Over-broad domain allowlists or tokens.

## Validation

M7 Golden Proof performs a scoped provider-sandbox effect, simulates response loss and reconciles without duplication or secret exposure.

## Migration and rollback

Revoke Grants, disable Effect adapters and return to local-only execution.

## Supersession

This ADR is accepted. A semantic change requires a new ADR that explicitly supersedes this record.

## Related documents

- DOC-PRODUCT-BLUEPRINT-10
- DOC-PRODUCT-BLUEPRINT-12
