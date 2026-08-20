# Knowledge Migration — Temporary Census

This branch-only census records the destination of every coherent source group before deletion. It is non-authoritative and must be deleted before merge.

| Source path/group | Classification | Final destination | Current semantics preserved | Deletion reason |
| --- | --- | --- | --- | --- |
| `docs/conexus/current/*` | CURRENT_AUTHORITY | `docs/{PRODUCT,ARCHITECTURE,DECISIONS,ROADMAP}.md` | Canonical Product, architecture, decisions, status, obligations, and reopen triggers | Replace the redundant current-router stack |
| `docs/conexus/phase3/3A-R11-*` | CURRENT_AUTHORITY | `docs/phases/3A-authority-baseline.md` plus canonical docs | 3A authority census, reconciliation, precedence, closure, and reopen triggers | Review rounds are Git history |
| `docs/conexus/phase3/3B-*` through `3K-*` | DURABLE_REFERENCE | `docs/reference/*.md` and `docs/diagrams/*` | Accepted owners, boundaries, contracts, states, security, deployment, and frontend semantics | Consolidate fragmented phase files by current technical consumer |
| `docs/conexus/phase3/3L-*` | REPRODUCIBLE_EVIDENCE | `docs/phases/3L-technology-qualification.md`, `docs/reference/mastra/*`, `docs/evidence/qualification/3L/*` | Package outcomes, exact pins, claims, limits, downstream obligations, and reopen triggers | Replace execution rounds with durable closure and Evidence map |
| `spikes/conexus-3l-{a,b,d}/**` | REPRODUCIBLE_EVIDENCE | `qualification/3l/{builder-substrate,mastra-runtime,managed-execution}/` | Exact locks, criteria, fixtures, source, tests, raw Evidence, DDL, and rerun commands | Rehome under the final qualification boundary |
| `docs/reference/mitra/**`, Mitra observations and evidence | DURABLE_RESEARCH | `docs/research/mitra/**` | Full study, observations, strengths, limits, gaps, evidence, and influence matrix | Consolidate duplicated research routes |
| Factory AI reference files | DURABLE_RESEARCH | `docs/research/factory-ai/**` | Complete factory study, trust/readiness, review, stuck detection, supervision, and influence matrix | Consolidate duplicated research routes |
| Generic engineering method and repository workflow | GENERIC_ENGINEERING_REHOME | `docs/engineering/{METHOD,REPOSITORY-WORKFLOW}.md` | Organizational method and repository-specific execution rules | Remove old program binding |
| Legacy implementation, tests, schemas, scripts, workflows, package/bin, `.mnfs`, `.pi` | LEGACY_DELETE | Git history only | None; no Conexus Product consumer | Legacy program implementation and identity are out of scope |
| Legacy program docs, ADRs, capabilities, acceptance packs, plans, tracking, generated projections | LEGACY_DELETE | Git history only | None after current Conexus semantics are mapped | Legacy-only authority/history |
| Handoffs, dialogue, rounds, prompts, plans, and superseded proposals | SUPERSEDED_GIT_ONLY | Git history only | Accepted outcomes land in canonical docs | Mechanical/review history is not current authority |
| `AI_DIALOG.md`, this census | TRANSIENT_DELETE | None | Final findings are integrated into canonical docs/tests | Branch-only review and migration artifacts |
