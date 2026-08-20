# Conexus OS — Agent Instructions

## Fresh actor path

```text
AGENTS.md
→ docs/INDEX.md
→ one task row
→ at most 1–3 task-specific canonical/reference documents
```

Default pack is at most five files. Do not recursively read `docs/`. Do not read research or phase history by default. Do not read qualification harnesses unless validating or requalifying a named claim.

Current accepted authority beats historical Git content. Research, code, tests, runtime, framework docs, and Git history are Evidence/mechanics, not Product authority. Mechanism is not authority. Temporary `AI_DIALOG.md` is non-authoritative.

Use [docs/engineering/METHOD.md](docs/engineering/METHOD.md) for engineering reasoning; do not duplicate it. Use Ubuntu WSL2 and a Linux-filesystem worktree. Preserve unowned state and never reset, clean, stash, or discard it.

For Mastra-sensitive work, load `.agents/skills/mastra/SKILL.md`; use Context7 only when current external documentation is material; decide version-specific claims from exact pinned source/configuration and bounded Evidence.

Stop when work would create/change a Product requirement, semantic owner, trust boundary, structural runtime/database/service/module, delete accepted semantics without a destination, require unauthorized production effects/secrets, leave a material contradiction, receive a material independent-review finding, or require Product/architecture redesign to pass verification.

Publish reviewable changes. One phase owns one PR. Run `npm ci && npm run verify`. Live qualification is opt-in. Never merge without explicit operator authority.

For current phase and implementation status, read [docs/ROADMAP.md](docs/ROADMAP.md); do not restate mutable status here.
