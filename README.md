# MNFS

MNFS is a **planning-first, evidence-driven development harness** built on Pi. It converts operator intent into structured contracts, bounded execution, durable Claims, verification, integration, QA and accepted delivery.

The product is currently a **Pi-first, WSL2-first local control plane**. Code and accepted repository artifacts live in Git; operational state lives in local SQLite outside individual worktrees.

## Current phase

```text
AB1 — Architecture Baseline and Contract Reconciliation
```

Completed:

- **M0 — Foundation Walking Skeleton**
- **M1 — Visual Mission Planning**

M2 has not started. The Architecture Baseline is publishing the complete Product Blueprint, decisions, capability method, roadmap and M2 readiness coverage. `MIS-002` revision 3 remains historical and must be superseded through Replan.

## Start here

- [Documentation Map](docs/DOCUMENTATION-MAP.md)
- [Product documentation](docs/product/README.md)
- [Complete Product Blueprint](docs/product/PRODUCT-BLUEPRINT.md)
- [Capability Realization Method](docs/product/CAPABILITY-REALIZATION-METHOD.md)
- [Capability Roadmap](docs/roadmap.md)
- [Architecture Decision Log](docs/adr/README.md)
- [CAP-EXECUTION readiness](docs/capabilities/CAP-EXECUTION/COVERAGE.md)
- [Current project status](docs/tracking/STATUS.md)
- [Tooling adoption](docs/tooling-adoption.md)

## Canonical environment

- Windows is the desktop, browser and terminal host.
- Ubuntu under WSL2 is the canonical execution runtime.
- Repositories live on the Linux filesystem, for example `~/src/mnfs`.
- Do not develop from `/mnt/c`.
- Supported Node.js floor: `24.18.0`.

## Commands

```bash
npm ci
npm run verify

node bin/mnfs.mjs doctor
node bin/mnfs.mjs init
node bin/mnfs.mjs mission open --goal "Build the first Pi worker"
node bin/mnfs.mjs status
```

Planning:

```bash
node bin/mnfs.mjs plan save --mission MIS-001 --input /tmp/mission-plan.json
node bin/mnfs.mjs plan show --mission MIS-001
node bin/mnfs.mjs plan render --mission MIS-001
node bin/mnfs.mjs plan open --mission MIS-001
node bin/mnfs.mjs plan poll --mission MIS-001
node bin/mnfs.mjs plan approve --mission MIS-001 --hash sha256:<current-hash>
```

Every command supports `--json`. Human output includes a next action.

## Runtime location

Set `MNFS_HOME` to override the local runtime root. Default:

```text
~/.local/state/mnfs/repos/<repo-id>/
```

## Hard boundary

A Pi process saying “done” is not completion. A Worker emits a Claim; runner-owned Evidence and an MNFS Gate decide acceptance.

The next real execution proof requires Plan Contract schema v2, AS-02 on canonical WSL2 and a newly approved `MIS-002` revision.
