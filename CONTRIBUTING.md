# Contributing to Conexus OS

Start with `AGENTS.md`, then `docs/index.md`, `docs/roadmap.md`, and the smallest task-specific authority pack. Repository workflow follows the DevelopmentConexus Repository Standard v1.0.0; engineering decisions follow the DevelopmentConexus Engineering Method v1.0.0.

Use an Ubuntu WSL2 Linux-filesystem worktree. Create one focused branch/PR for one coherent gate. Define proof before material implementation; show meaningful negative controls can fire; run focused checks and then:

```bash
npm ci
npm run verify
```

Framework, dependency, and live-integration claims require current primary documentation plus exact pinned source/configuration and proportionate Evidence. Research never becomes Product authority without an accepted decision.

Do not infer mutable stage, implementation permission, or merge authorization from history; [docs/roadmap.md](docs/roadmap.md) owns current program status and operator authority owns merge.
