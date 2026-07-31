# MNFS

MNFS is a planning-first development harness for reliable AI-assisted software engineering.

The project is being rebuilt as a **Pi-first**, **WSL2-first** local control plane. Product intent and accepted evidence stay in the repository, while operational state lives in a local SQLite database outside individual worktrees.

## Current milestone

**M0 — Foundation walking skeleton**

The executable foundation now proves that MNFS can:

1. inspect the canonical WSL2 toolchain;
2. initialize one stable repository identity under `.mnfs/`;
3. map every worktree to one runtime directory outside the checkout;
4. open a mission and its `MISSION_OPENED` event atomically in SQLite;
5. recover mission status from a fresh process.

The next milestone adds the visual planning loop with Pi and Lavish. See [`docs/tracking/STATUS.md`](docs/tracking/STATUS.md) and [`docs/roadmap.md`](docs/roadmap.md).

The external-tool adoption matrix is documented in [`docs/tooling-adoption.md`](docs/tooling-adoption.md).

## Canonical environment

- Windows remains the desktop, browser and terminal host.
- Ubuntu under WSL2 is the canonical execution environment.
- Repositories live under the Linux filesystem, for example `~/src/mnfs`.
- Do not develop this project from `/mnt/c`.
- Supported Node.js floor: `24.18.0`.

## Foundation commands

```bash
npm install
npm run verify

node bin/mnfs.mjs doctor
node bin/mnfs.mjs init
node bin/mnfs.mjs mission open --goal "Build the first Pi worker"
node bin/mnfs.mjs status
```

All state-changing commands also support `--json` for agent-friendly output:

```bash
node bin/mnfs.mjs init --json
node bin/mnfs.mjs mission open --goal "Prove recovery" --json
node bin/mnfs.mjs status --json
```

Set `MNFS_HOME` to override the local runtime root. By default it resolves to:

```text
~/.local/state/mnfs/repos/<repo-id>/
```

## Tracking

The repository tracks work durably in:

- [`docs/tracking/STATUS.md`](docs/tracking/STATUS.md) — current state and next action;
- [`docs/tracking/BACKLOG.md`](docs/tracking/BACKLOG.md) — milestone checklist;
- [`docs/tracking/DECISIONS.md`](docs/tracking/DECISIONS.md) — architectural decisions;
- [`docs/tracking/WORKLOG.md`](docs/tracking/WORKLOG.md) — verified implementation history.

## Legacy

The previous Claude Code plugin experiment remains in `leandrotcawork/mnfs-harness` as research and field evidence. It is not the runtime base of this repository.
