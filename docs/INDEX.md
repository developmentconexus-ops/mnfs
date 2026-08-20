# Conexus OS Documentation Index

## Current status

[ROADMAP.md](ROADMAP.md) is the only current phase and implementation-status authority. This index routes to it and does not restate mutable status.

This is the canonical technical entrypoint. Current authority beats historical Git content. Do not recursively read `docs/`; select one task row and read only the named pack.

## Read by task

| Task | Read first | Add only when needed | Do not read by default |
| --- | --- | --- | --- |
| Product meaning, users, scope, journeys | [PRODUCT.md](PRODUCT.md) | [DECISIONS.md](DECISIONS.md) | research, phases, qualification |
| Architecture overview | [ARCHITECTURE.md](ARCHITECTURE.md) | one reference below | research, qualification harnesses |
| Builder and Harness | [reference/builder-and-harness.md](reference/builder-and-harness.md) | [reference/security-and-authority.md](reference/security-and-authority.md) | phase history, raw Evidence |
| Product Agents and runtime | [reference/runtime-and-agents.md](reference/runtime-and-agents.md) | [reference/mastra/current-mapping.md](reference/mastra/current-mapping.md) | qualification harness unless requalifying |
| Mastra | [reference/mastra/INDEX.md](reference/mastra/INDEX.md) | the one mapped Mastra reference | research and raw Evidence |
| Brain and knowledge | [reference/brain-and-knowledge.md](reference/brain-and-knowledge.md) | [reference/data-and-persistence.md](reference/data-and-persistence.md) | Mitra unless comparing |
| Data and Sankhya | [reference/data-and-persistence.md](reference/data-and-persistence.md) | [reference/integrations-and-gateway.md](reference/integrations-and-gateway.md) | runtime qualification |
| Integrations and Gateway | [reference/integrations-and-gateway.md](reference/integrations-and-gateway.md) | [reference/security-and-authority.md](reference/security-and-authority.md) | research evidence |
| Security and authority | [reference/security-and-authority.md](reference/security-and-authority.md) | [ARCHITECTURE.md](ARCHITECTURE.md) | implementation history |
| Release, deployment, failure/recovery | [reference/release-deployment-and-operations.md](reference/release-deployment-and-operations.md) | [ROADMAP.md](ROADMAP.md) | 3M design: it does not exist yet |
| Frontend and Product surfaces | [reference/frontend-and-product-surfaces.md](reference/frontend-and-product-surfaces.md) | [PRODUCT.md](PRODUCT.md) | qualification |
| Managed execution | [reference/managed-execution.md](reference/managed-execution.md) | [reference/managed-execution-qualification.md](reference/managed-execution-qualification.md) | unrelated runtime research |
| Decision rationale | [DECISIONS.md](DECISIONS.md) | [phases/3A-authority-baseline.md](phases/3A-authority-baseline.md) | old review rounds in Git |
| Current roadmap/status | [ROADMAP.md](ROADMAP.md) | [OPERATING-MODEL.md](OPERATING-MODEL.md) | research and qualification |
| Mitra comparison | [research/mitra/INDEX.md](research/mitra/INDEX.md) | full study or influence map | raw observations unless a claim needs them |
| Factory AI comparison | [research/factory-ai/INDEX.md](research/factory-ai/INDEX.md) | full study or influence map | unrelated research |
| Requalify a 3L claim | [phases/3L-technology-qualification.md](phases/3L-technology-qualification.md) | [reference/mastra/qualification-and-reopen-triggers.md](reference/mastra/qualification-and-reopen-triggers.md), then exact harness | Product implementation history |

Default task pack: this index plus at most one to three task documents; never more than five files without a named material reason.

## Authority hierarchy

```text
Accepted Product and architecture authority
→ current decisions and roadmap
→ detailed current technical references
→ accepted qualification conclusions
→ reproducible Evidence and exact pinned source
→ research and historical Git content
```

Mechanism is not authority. Research is evidence, never implicit Product doctrine. Qualification proves only its named properties.

## Permanent document map

Canonical truth: [PRODUCT.md](PRODUCT.md), [ARCHITECTURE.md](ARCHITECTURE.md), [DECISIONS.md](DECISIONS.md), [ROADMAP.md](ROADMAP.md), and [OPERATING-MODEL.md](OPERATING-MODEL.md).

Technical references: [builder-and-harness.md](reference/builder-and-harness.md), [runtime-and-agents.md](reference/runtime-and-agents.md), [brain-and-knowledge.md](reference/brain-and-knowledge.md), [data-and-persistence.md](reference/data-and-persistence.md), [integrations-and-gateway.md](reference/integrations-and-gateway.md), [security-and-authority.md](reference/security-and-authority.md), [release-deployment-and-operations.md](reference/release-deployment-and-operations.md), [frontend-and-product-surfaces.md](reference/frontend-and-product-surfaces.md), [managed-execution.md](reference/managed-execution.md), and [managed-execution-qualification.md](reference/managed-execution-qualification.md).

Mastra: [reference/mastra/INDEX.md](reference/mastra/INDEX.md), [current-mapping.md](reference/mastra/current-mapping.md), [framework-findings.md](reference/mastra/framework-findings.md), and [qualification-and-reopen-triggers.md](reference/mastra/qualification-and-reopen-triggers.md).

Durable phase summaries: [3A-authority-baseline.md](phases/3A-authority-baseline.md) and [3L-technology-qualification.md](phases/3L-technology-qualification.md).

Research: [research/INDEX.md](research/INDEX.md), [research/mitra/INDEX.md](research/mitra/INDEX.md), [research/mitra/full-study.md](research/mitra/full-study.md), [research/mitra/influence-on-conexus.md](research/mitra/influence-on-conexus.md), [research/factory-ai/INDEX.md](research/factory-ai/INDEX.md), [research/factory-ai/full-study.md](research/factory-ai/full-study.md), [research/factory-ai/influence-on-conexus.md](research/factory-ai/influence-on-conexus.md), [research/mastra/INDEX.md](research/mastra/INDEX.md), [research/mastra/evaluation.md](research/mastra/evaluation.md), and [research/mastra/provenance.md](research/mastra/provenance.md).

Engineering and visuals: [engineering/METHOD.md](engineering/METHOD.md), [engineering/REPOSITORY-WORKFLOW.md](engineering/REPOSITORY-WORKFLOW.md), and [diagrams/INDEX.md](diagrams/INDEX.md).

## Do not read by default

- `qualification/3l/**`: executable/reproducible qualification Evidence only.
- `docs/evidence/**`: deciding summaries and provenance only.
- `docs/research/mitra/evidence/**`: large raw observations and detailed chapters.
- Git history: superseded proposals, dialogue, handoffs, and mechanical review history.
