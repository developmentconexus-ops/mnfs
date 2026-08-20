# Repository Workflow

## Fresh actor

Read `AGENTS.md`, then `docs/INDEX.md`, then one task row. Do not recursively load the repository.

## Change lifecycle

1. Identify accepted authority and exact claim.
2. Classify Known / Inferred / Unknown / Deferred.
3. Define a falsifier and negative control when meaningful.
4. Make the smallest bounded change.
5. Run focused proof, then `npm ci && npm run verify`.
6. Publish a reviewable PR; integrate bounded findings; stop on material findings.
7. Delete temporary dialogue/census files before squash merge.

Use Ubuntu WSL2 and a Linux-filesystem worktree. Preserve unowned state. Never reset, clean, stash, or merge without explicit authority. Dependency changes require explicit scope. Production effects and secrets require their owning authority.

Root verification is deterministic and fast. Qualification suites under `qualification/` are opt-in and prove only their named claims.

