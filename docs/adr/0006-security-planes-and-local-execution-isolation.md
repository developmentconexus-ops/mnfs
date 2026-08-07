---
id: ADR-0006
title: Security planes and local execution isolation
document_type: architecture_decision_record
form: explanation
authority: decision
status: superseded
date: 2026-08-02
owners:
  - developmentconexus-ops
approvers:
  - operator
supersedes: []
superseded_by: ADR-0015
related:
  - DOC-PRODUCT-BLUEPRINT-10
  - DOC-PRODUCT-BLUEPRINT-12
tracking_issue: 6
---

# ADR-0006 — Security planes and local execution isolation

## Context and problem statement

A Treehouse worktree and WSL2 separate source trees and host environments, but do not prevent secret reads, host writes, network egress, socket access or unrestricted child processes.

## Decision drivers

- A real Pi Writer must not inherit full user authority.
- Security failure must fail closed.
- Authority and technical enforcement are different concerns.
- The local architecture must stay replaceable and measurable.

## Considered options

- Rely on prompt instructions.
- Rely on worktree/WSL2 only.
- Require Dev Containers for all work.
- Use layered capability policy plus an E1 local OS sandbox candidate.

## Decision outcome

Separate Domain Authority, Tool Capability, Process Sandbox, Execution Environment, Credential, Network and External Effect planes. The local Writer target is E1: Treehouse worktree plus a frozen OS-level policy, write allowlist, sensitive-read denial, network off, no production credentials and fail-closed startup. The Pi sandbox pattern with Anthropic Sandbox Runtime is a candidate pending AS-02.

## Positive consequences

- M2 cannot normalize unrestricted agent execution.
- Security policy is explicit and hash-bound.
- A future remote environment fits the same domain boundary.

## Negative consequences

- AS-02 becomes a prerequisite to close M2.
- Toolchain compatibility and performance must be measured.

## Risks

- Sandbox bypass or weak WSL2 behavior.
- Broad exceptions eroding the boundary.
- Docker socket or host mounts granting escape.

## Validation

AS-02 verifies filesystem, secret, network, socket, child-process, policy-tamper and fail-closed scenarios on canonical WSL2.

## Migration and rollback

Block real Writers or select another ProcessSandboxAdapter; domain work may continue with fakes.

## Supersession

ADR-0015 preserves the separate security/authority planes and fail-closed requirements but supersedes the fixed `E1 = Treehouse + OS sandbox` realization with property-based Execution Environment semantics.

## Related documents

- DOC-PRODUCT-BLUEPRINT-10
- DOC-PRODUCT-BLUEPRINT-12
