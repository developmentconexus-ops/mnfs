---
id: DOC-ADR-INDEX
title: MNFS Architecture Decision Log
document_type: decision_index
form: reference
authority: decision
status: accepted
version: 1.1.0
owners:
  - developmentconexus-ops
source_of_truth_for:
  - architecture decision discovery
related:
  - DOC-DOCUMENTATION-MAP
  - TRACKING-DECISIONS
last_reviewed: 2026-08-07
---

# MNFS architecture decision log

Accepted ADRs record durable architectural choices. Their semantic outcome is not rewritten; later changes use a superseding ADR and predecessors remain readable as history.

## Current architecture decisions

- [ADR-0002 — SQLite operational state](0002-sqlite-operational-state.md)
- [ADR-0004 — Memory strata and Session Observational Memory](0004-memory-strata-and-session-observational-memory.md)
- [ADR-0005 — Durable coordination versus ephemeral transport](0005-durable-coordination-versus-ephemeral-transport.md)
- [ADR-0007 — Credential Grants and External Effects](0007-credential-grants-and-external-effects.md)
- [ADR-0009 — Operator Control Plane and presentation surfaces](0009-operator-control-plane-and-presentation-surfaces.md)
- [ADR-0010 — Telemetry model and OpenTelemetry export](0010-telemetry-model-and-opentelemetry-export.md)
- [ADR-0011 — Evaluation and Calibration framework](0011-evaluation-and-calibration-framework.md)
- [ADR-0012 — Documentation authority, lifecycle and generated Product Blueprint](0012-documentation-authority-lifecycle-and-generated-product-blueprint.md)
- [ADR-0013 — WSL2 host and replaceable Agent Runtime](0013-wsl2-host-and-replaceable-agent-runtime.md)
- [ADR-0014 — Isolated mutable workspace per Write Track](0014-isolated-mutable-workspace-per-write-track.md)
- [ADR-0015 — Property-based Execution Environments](0015-property-based-execution-environments.md)

## Superseded decisions retained as history

- [ADR-0001 — Pi-first WSL2 architecture](0001-pi-first-wsl2.md) → superseded by ADR-0013
- [ADR-0003 — Worktree per concurrent Write Track](0003-worktree-write-tracks.md) → superseded by ADR-0014
- [ADR-0006 — Security planes and fixed local E1 realization](0006-security-planes-and-local-execution-isolation.md) → superseded by ADR-0015
- [ADR-0008 — Reproducible/remote environments with ordinal E0–E4](0008-reproducible-and-remote-execution-environments.md) → superseded by ADR-0015

## Creating a decision

Copy [the template](template.md), assign the next number and open a reviewable proposal. Use an ADR only for an architecturally significant and durable choice. When superseding another ADR, keep reciprocal `supersedes` / `superseded_by` metadata and preserve the predecessor's historical decision text.
