---
id: ADR-0013
title: WSL2 host and replaceable Agent Runtime
document_type: architecture_decision_record
form: explanation
authority: decision
status: accepted
date: 2026-08-07
owners:
  - developmentconexus-ops
approvers:
  - operator
supersedes:
  - ADR-0001
superseded_by: null
related:
  - DOC-PRODUCT-BLUEPRINT-05
  - DOC-PRODUCT-BLUEPRINT-06
  - DOC-PRODUCT-BLUEPRINT-09
  - DESIGN-LAYERED-AGENT-EXECUTION-PLANNING
  - TRACKING-DECISIONS
tracking_issue: 23
---

# ADR-0013 — WSL2 host and replaceable Agent Runtime

## Context

ADR-0001 correctly established Ubuntu under WSL2 as the canonical local host and separated MNFS from one desktop-vendor lifecycle. It also made Pi the first execution runtime. Subsequent Architecture Realization Review D2/D-012 and synthesis D-015 established that coding-agent loops, provider/model mechanics and runtime Sessions are replaceable substrates rather than MNFS domain authority.

## Decision drivers

- Preserve the proven WSL2 operating baseline without coupling product semantics to Pi.
- Keep Role, ActorRun, Attempt, Authority, Claim, Evidence, Verdict and Recovery inside MNFS.
- Allow runtime interoperability when it demonstrably reduces machinery and maintenance.
- Ensure fresh MNFS recovery works without transcript or runtime-session resume.
- Do not build a custom MNFS model/agent loop while credible open runtimes exist.

## Decision

Ubuntu under WSL2 remains the canonical local MNFS host. Windows remains the presentation host for terminal, browser, editor and future GUI surfaces.

The **Agent Runtime is a replaceable execution substrate** behind the MNFS Role/ActorRun boundary. A Runtime Session is observational state only; it cannot determine Mission, Attempt, acceptance or Recovery authority.

No concrete runtime is selected by this ADR. The first production realization after the Architecture Realization Review must be chosen by `ARR-S1 — Agent Runtime Conformance` under a candidate-independent contract.

ACP is a comparative interoperability hypothesis, not a preselected dependency. Pi remains the incumbent because existing AS-02 Evidence proves a real path; OpenCode/ACP and a second real ACP implementation remain challengers under D-012 until the selecting spike runs.

If a generic protocol boundary does not reduce total MNFS machinery without weakening security, deterministic resource control or recovery, MNFS may use one concrete runtime-specific adapter.

## Consequences

### Positive

- WSL2 operational investment remains valid.
- Runtime changes cannot rewrite MNFS domain truth.
- Session resume is optional optimization rather than a recovery dependency.
- Pi/OpenCode/ACP and future runtimes can be evaluated against the same product semantics.

### Negative

- M2 realization cannot proceed until ARR-S1 produces selecting Evidence.
- Some runtime-specific mechanics may remain in a concrete adapter.
- Interoperability claims require at least two real protocol implementations rather than one branded integration.

## Invariants

1. `Role` / `ActorRun` are MNFS authority; runtime Session is not.
2. Fresh Recovery must work without transcript or runtime-session resume.
3. Provider/model credentials do not become domain state.
4. Runtime completion does not imply Claim/Feature acceptance.
5. Runtime selection is evidence-driven and replaceable.
6. No generic runtime provider framework is required before a second real production consumer.

## Validation

ARR-S1 must compare at least:

- exact cwd/environment control;
- deterministic resource/tool inventory;
- discovery/plugin suppression or governance;
- provider/subscription authentication compatibility;
- cancellation/abort;
- bounded output/event handling;
- final/settled semantics;
- process death;
- fresh MNFS recovery without transcript;
- structured results/events;
- public supported boundary and pinned provenance;
- total MNFS implementation/maintenance cost.

## Migration

Existing Pi/AS-02 code and Evidence remain historical/incumbent evidence. They are not deleted or relabeled as proof of another runtime.

## Supersession

This ADR supersedes ADR-0001. It preserves the WSL2-host decision and supersedes Pi-first product architecture.
