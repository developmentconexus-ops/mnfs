# MNFS

MNFS is a planning-first development harness for reliable AI-assisted software engineering.

The project is being rebuilt as a **Pi-first**, **WSL2-first** local control plane. It keeps product intent and accepted evidence in the repository while operational state lives in a local SQLite database outside individual worktrees.

## Current milestone

**M0 — Foundation walking skeleton**

The first executable slice will:

1. initialize a repository identity under `.mnfs/`;
2. create a local runtime database outside the checkout;
3. open one mission transactionally;
4. show its persisted status after a new process starts;
5. expose a doctor command for the WSL2 toolchain.

See [`docs/tracking/STATUS.md`](docs/tracking/STATUS.md) and [`docs/roadmap.md`](docs/roadmap.md).

## Canonical environment

- Windows remains the desktop, browser and terminal host.
- Ubuntu under WSL2 is the canonical execution environment.
- Repositories live under the Linux filesystem, for example `~/src/mnfs`.
- Do not develop this project from `/mnt/c`.

## Legacy

The previous Claude Code plugin experiment remains in `leandrotcawork/mnfs-harness` as research and field evidence. It is not the runtime base of this repository.
