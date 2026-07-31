# MNFS agent instructions

Read these files before changing code:

1. `docs/tracking/STATUS.md`
2. the active plan under `docs/superpowers/plans/`
3. applicable ADRs under `docs/adr/`

Hard rules:

- WSL2 Ubuntu is the canonical development runtime; Windows is the presentation host.
- Keep repositories on the Linux filesystem, never under `/mnt/c`.
- Use TDD for behavior changes: failing test, observed failure, minimal implementation, green test.
- Update `docs/tracking/STATUS.md` and `docs/tracking/WORKLOG.md` when a task starts or finishes.
- Do not introduce an adapter until the core behavior has a second consumer or a measured need.
- Messages are notifications; durable state is SQLite or a content-addressed artifact.
- A worker may claim completion; only MNFS gates may accept it.
- Worktrees isolate writers, not databases, ports, processes or external effects.
- Prefer one focused module over a framework. YAGNI is binding.
- Do not copy FirstMate code without recording origin and license in `THIRD_PARTY_NOTICES.md`.
