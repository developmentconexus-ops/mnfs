# Conexus OS Operating Model

## Phase workflow

```text
one phase per PR
Codex = autonomous Phase Lead + Executor inside accepted boundaries
Fable = one independent adversarial review at phase end
AI_DIALOG.md = temporary branch-only exchange
bounded/non-material findings = Codex applies autonomously
material finding = return to operator / Architecture Lead
final clean verification
squash merge
temporary files deleted before merge
```

`AI_DIALOG.md` is never Product or architecture authority. Accepted corrections must land in canonical documents, tests, or Evidence before the file is deleted.

## Proportional execution

- FAST: local, reversible, architecture-preserving work with deterministic proof.
- BOUNDED: material work inside accepted boundaries; the default for repository and qualification work.
- CONTROLLED: authority, trust, irreversible effect, or cross-system boundary work requiring explicit checkpoints.

The profile changes depth and review admission, not correctness. Apply [engineering/METHOD.md](engineering/METHOD.md); do not duplicate it here.

## Framework-sensitive work

For Mastra-sensitive tasks: current Conexus OS authority → vendored Mastra skill → current Context7 documentation → exact pinned package/source/configuration → falsifiable proof → bounded harness → Evidence → adjudication. Current documentation supports mechanics but cannot override the exact qualified pins. Load the skill only when Mastra is material.

Use real provider/model/live execution only when deterministic proof cannot establish the remaining property. Bind any live claim to exact identities and never treat a mock as real-integration proof.

## Publication and commits

Keep commits reviewable and publish the branch/PR as work progresses. One phase owns one PR. GitHub owns mechanical history; durable docs preserve only decisions, boundaries, accepted risk, contracts, and deciding Evidence that Git history cannot explain adequately. Never create permanent handoff/review documents for ordinary work.

## Stop conditions

Stop when a change would create or change a Product requirement, semantic owner, security/trust boundary, structural runtime/database/service/module, delete accepted semantics without a destination, require unauthorized production effects/secrets, leave a material contradiction, receive a material independent-review finding, or require Product/architecture redesign to make verification pass.

Verification for this repository is `npm ci && npm run verify`. Live qualification suites are explicit opt-in commands and never part of the fast root gate.

