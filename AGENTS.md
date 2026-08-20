# Conexus OS — Agent Bootstrap

## Start here

```text
AGENTS.md
→ docs/index.md
→ docs/roadmap.md
→ 1–2 task-specific owning documents
```

Default pack is at most five files. Do not recursively read `docs/`, research, phase history, Git history or qualification harnesses before a concrete task requires them.

## Organizational standards

Engineering reasoning follows `developmentconexus-ops/conexus-methodology/METHOD.md` v1.0.0. Repository organization/workflow follows `developmentconexus-ops/conexus-methodology/REPOSITORY-STANDARD.md` v1.0.0. Repository-specific rules live in [docs/development/engineering-rules.md](docs/development/engineering-rules.md).

Current accepted authority beats historical Git content. Research, code, tests, runtime, framework docs and reviewer output are Evidence/mechanics, not Product authority. Mechanism is not authority.

For Mastra-sensitive work, load `.agents/skills/mastra/SKILL.md`; use Context7/current external docs only when material; decide version-specific claims from exact pinned source/configuration and bounded Evidence.

Stop on a material Product/owner/trust/structural-boundary contradiction or unauthorized production effect. Otherwise keep work proportional and autonomous inside accepted boundaries.

Use Ubuntu WSL2 with a Linux-filesystem worktree. Preserve unowned state. Run `npm ci && npm run verify` before claiming completion. One coherent phase/gate owns one PR. Never merge without explicit operator authority.

Current stage, exact next action and implementation status live only in [docs/roadmap.md](docs/roadmap.md).
