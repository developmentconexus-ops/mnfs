# Tooling adoption

MNFS is **Pi-first** but does not vendor or fork the FirstMate stack. FirstMate is a reference implementation and source of field-tested patterns. Each external tool is admitted behind a narrow adapter only when the milestone that needs it begins.

## Current status

| Tool | Role in MNFS | Current status | First proof |
|---|---|---|---|
| **Pi** | Required agent runtime | Required by `mnfs doctor`; process adapter not implemented yet | M2: one Pi worker produces a durable claim |
| **Lavish** | Browser-based review of mission plans | Optional dependency detected by `mnfs doctor`; adapter not implemented yet | M1: browser feedback updates and freezes a plan revision |
| **Treehouse** | Reusable leased worktrees for write tracks | Optional dependency detected by `mnfs doctor`; adapter not implemented yet | M2: one leased worktree survives lead restart and is reused for a local correction |
| **Herdr** | Visual terminal projection for lead and workers | Optional dependency detected by `mnfs doctor`; no runtime authority | M2: worker is visible without MNFS depending on Herdr for lifecycle truth |
| **no-mistakes** | Optional final PR/CI delivery gate | Not part of the foundation; planned only after MNFS quality gates exist | M6: an MNFS-green change is delivered through PR and CI |
| **SQLite** | Local operational state | Implemented in M0 | Mission and matching event persist transactionally and recover in a new process |
| **FirstMate** | Reference, benchmark and pattern source | Not a runtime dependency and not the repository base | Research and comparative dogfood only |

## Authority boundaries

```text
MNFS core   -> mission, criteria, state, decisions and gates
Pi          -> agent execution and lifecycle events
Treehouse   -> physical worktree allocation and lease lifecycle
Herdr       -> terminal presentation only
Lavish      -> human visual feedback surface
Git         -> code, commits and diffs
no-mistakes -> optional delivery to PR/CI
```

No adapter may become the source of truth for the MNFS domain. Removing Herdr must not stop execution. Losing a transport message must not lose state. A worker's successful exit must not close a feature without MNFS evidence.

## Adoption order

1. **M0 — Foundation:** TypeScript, SQLite, CLI, repository identity and recovery.
2. **M1 — Visual planning:** mission contract, HTML renderer and Lavish adapter.
3. **M2 — One worker:** Pi process adapter, Treehouse lease adapter, claim, optional Herdr projection.
4. **M3–M5 — Quality:** review, correction reuse, parallel write tracks, integration and live QA.
5. **M6 — Delivery:** optional no-mistakes adapter and policy calibration.

## YAGNI rule

An external tool is not integrated merely because FirstMate uses it. It enters when a named milestone has a behavioral proof that the tool materially simplifies. Until then, `mnfs doctor` may report it as optional, but the core cannot depend on it.
