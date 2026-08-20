# Conexus OS Engineering Rules

This page contains only repository-local specialization. Cross-repository reasoning and repository governance are canonical in:

- [DevelopmentConexus Engineering Method v1.0.0](https://github.com/developmentconexus-ops/conexus-methodology/blob/main/METHOD.md)
- [DevelopmentConexus Repository Standard v1.0.0](https://github.com/developmentconexus-ops/conexus-methodology/blob/main/REPOSITORY-STANDARD.md)

## Local execution environment

Use Ubuntu WSL2 and a Linux-filesystem worktree. Preserve unowned state. Never reset, clean, stash, force-update or discard work you do not own.

## Conexus-specific material stops

Stop and return to the smallest owning decision when work would create/change a Product requirement, semantic owner, trust boundary, structural runtime/database/service/module, delete accepted semantics without a destination, require unauthorized production effects/secrets, or require Product/architecture redesign to make verification pass.

Current stage and implementation authorization are owned only by [../roadmap.md](../roadmap.md).

## Framework-sensitive work

For Mastra-sensitive work, load `.agents/skills/mastra/SKILL.md`. Use current Context7/official documentation only when materially useful, and decide version-specific claims from exact pinned package/source/configuration plus bounded Evidence. Research/framework docs never become Product authority.

Qualification suites under `qualification/` are opt-in and prove only their named claims. Live provider/model/E2B/Sankhya execution requires the authority of the exact proof task; it is never implied by a green root gate.

## Change lifecycle

One coherent phase/gate owns one branch and PR. Codex may execute autonomously inside accepted boundaries; material findings return to the Lead/operator. Use the canonical isolated Fable review workflow from the Repository Standard and methodology README when independent review is required. Temporary work/review files never merge.

Define a falsifier before material implementation, show material guards can fire, run focused proof, then run:

```bash
npm ci
npm run verify
```

The protected aggregate GitHub status check remains named `verify`; this existing protected name is intentionally retained under Repository Standard v1.0.0 rather than changed only for naming uniformity.

Publish reviewable changes. Never merge without explicit operator authority.
