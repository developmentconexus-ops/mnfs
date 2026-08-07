---
id: ADR-0001
title: Pi-first WSL2 Architecture
document_type: architecture_decision_record
form: explanation
authority: decision
status: superseded
owners:
  - developmentconexus-ops
superseded_by: ADR-0013
---

# ADR-0001: Pi-first runtime on WSL2

- **Status:** Superseded by ADR-0013
- **Date:** 2026-07-31

## Context

The earlier MNFS 0.5 design targeted a Claude Code Desktop plugin, Desktop worktrees, cross-session MCP messages and a JSONL event ledger. Studying FirstMate and the Pi ecosystem showed that MNFS can own its control plane instead of depending on one vendor's desktop lifecycle.

## Decision

MNFS will be developed and dogfooded on Ubuntu under WSL2.

Windows remains the presentation host for Windows Terminal, the browser, the editor and future graphical clients. Git repositories, Node.js, Pi, worktrees, SQLite, tests and worker processes run inside the Linux filesystem.

Pi is the first execution runtime. The domain core must not import Pi APIs directly; Pi is an adapter and extension surface.

## Consequences

- We avoid a premature PowerShell/Git Bash/MSYS/ConPTY compatibility matrix.
- Browser-based tools such as Lavish may run in WSL and open through Windows localhost.
- The core remains portable and receives a Windows smoke-test lane later.
- WSL2 is not treated as a security sandbox. Stronger isolation remains a future execution concern.

## Supersession

ADR-0013 preserves Ubuntu WSL2 as the canonical local host but supersedes Pi-first product architecture with a replaceable Agent Runtime boundary selected through conformance Evidence.
