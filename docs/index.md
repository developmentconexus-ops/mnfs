# Conexus OS Documentation

This is the canonical task/intention router. Current stage, implementation gate and exact next action live only in [roadmap.md](roadmap.md).

## Fresh-actor route

```text
AGENTS.md
→ docs/index.md
→ docs/roadmap.md
→ 1–2 task-specific owning documents
```

Default task pack is at most five files. Do not recursively read `docs/`, Git history, research, phase history or qualification harnesses before a concrete task requires them.

## Read by task

| Need | Read first | Add only when needed | Do not read by default |
| --- | --- | --- | --- |
| Current stage / implementation gate | [roadmap.md](roadmap.md) | [development/engineering-rules.md](development/engineering-rules.md) | research, qualification |
| Phase 4 / Implementation Readiness | [phases/4-implementation-readiness-program.md](phases/4-implementation-readiness-program.md) | current owning 4A–4G contract routed by `roadmap.md` | Product code, unrelated Phase-3 history |
| 4A Product Surface & Authority | [phases/4a-product-surface-and-authority-contract.md](phases/4a-product-surface-and-authority-contract.md) | [product/operation-ledger.md](product/operation-ledger.md), then [product/contract.md](product/contract.md) or one exact owner reference required by the current operation family | HTTP/router/frontend/runtime choices |
| Realization Planning / first-build skeleton | [phases/realization-planning.md](phases/realization-planning.md) | [development/production-realization-guide.md](development/production-realization-guide.md); use as Phase-4/4F input, not direct execution authority | Product implementation history, unrelated qualification |
| Product meaning / scope / journeys | [product/contract.md](product/contract.md) | [decisions/index.md](decisions/index.md) | research, phase history |
| Architecture overview / owners | [architecture/index.md](architecture/index.md) | one reference below | research, raw Evidence |
| Builder / Harness | [reference/builder-and-harness.md](reference/builder-and-harness.md) | [reference/security-and-authority.md](reference/security-and-authority.md) | raw qualification |
| Product Agents / runtime | [reference/runtime-and-agents.md](reference/runtime-and-agents.md) | [reference/mastra/index.md](reference/mastra/index.md) | qualification unless requalifying |
| Mastra | [reference/mastra/index.md](reference/mastra/index.md) | one mapped Mastra reference; then vendored skill/current docs if material | unrelated research |
| Brain / knowledge | [reference/brain-and-knowledge.md](reference/brain-and-knowledge.md) | [reference/data-and-persistence.md](reference/data-and-persistence.md) | Mitra unless comparing |
| Data / Sankhya | [reference/data-and-persistence.md](reference/data-and-persistence.md) | [reference/integrations-and-gateway.md](reference/integrations-and-gateway.md) | runtime qualification |
| Integrations / Gateway | [reference/integrations-and-gateway.md](reference/integrations-and-gateway.md) | [reference/security-and-authority.md](reference/security-and-authority.md) | raw research |
| Security / authority | [reference/security-and-authority.md](reference/security-and-authority.md) | [architecture/index.md](architecture/index.md) | implementation history |
| Release / deployment / failure-recovery | [reference/release-deployment-and-operations.md](reference/release-deployment-and-operations.md) | [phases/3m-failure-recovery-architecture.md](phases/3m-failure-recovery-architecture.md) only for closure rationale | raw review/history |
| Frontend / Product surfaces | [reference/frontend-and-product-surfaces.md](reference/frontend-and-product-surfaces.md) | [product/contract.md](product/contract.md) | qualification |
| Managed execution | [reference/managed-execution.md](reference/managed-execution.md) | [reference/managed-execution-qualification.md](reference/managed-execution-qualification.md) | unrelated runtime research |
| Decision rationale / reopen | [decisions/index.md](decisions/index.md) | [phases/3a-authority-baseline.md](phases/3a-authority-baseline.md) | old review rounds in Git |
| Repository workflow | [development/engineering-rules.md](development/engineering-rules.md) | organizational Method / Repository Standard | Product research |
| Diagrams | [diagrams/index.md](diagrams/index.md) | owning architecture/reference doc | raw Evidence |
| Mitra comparison | [research/mitra/index.md](research/mitra/index.md) | full study / influence map | raw observations |
| Factory AI comparison | [research/factory-ai/index.md](research/factory-ai/index.md) | full study / influence map | unrelated research |
| Mastra research provenance | [research/mastra/index.md](research/mastra/index.md) | evaluation/provenance | Product authority |
| Requalify a 3L claim | [phases/3l-technology-qualification.md](phases/3l-technology-qualification.md) | exact routed Evidence/harness | Product implementation history |

## Authority hierarchy

```text
accepted Product / architecture authority
→ current decision register + roadmap
→ detailed current technical references
→ accepted qualification conclusions
→ reproducible Evidence + exact pinned source
→ research + historical Git content
```

Mechanism is not authority. Research and reviewer findings are Evidence, never implicit Product requirements.

## Organizational authorities

- Engineering reasoning: [DevelopmentConexus Engineering Method v1.0.0](https://github.com/developmentconexus-ops/conexus-methodology/blob/main/METHOD.md).
- Repository operating envelope: [DevelopmentConexus Repository Standard v1.0.0](https://github.com/developmentconexus-ops/conexus-methodology/blob/main/REPOSITORY-STANDARD.md).
- Repository-specific rules: [development/engineering-rules.md](development/engineering-rules.md).

## Durable supporting routes

- Phase baselines / readiness gates: [3A](phases/3a-authority-baseline.md), [3L](phases/3l-technology-qualification.md), [3M](phases/3m-failure-recovery-architecture.md), [3N](phases/3n-architecture-verification.md), [3O](phases/3o-vertical-architecture-proof-contract.md), [C-018](phases/c-018-final-architecture-ratification.md), [Realization Planning](phases/realization-planning.md), [Phase 4 Implementation Readiness](phases/4-implementation-readiness-program.md), [4A Product Surface](phases/4a-product-surface-and-authority-contract.md).
- Current 4A operation candidate: [Product Operation Ledger](product/operation-ledger.md).
- Planning/research/review harness design input: [Blueprint Harness Design](development/blueprint-harness-design.md).
- Realization research/implementation companion: [Evidence-Grounded Realization Engineering](development/production-realization-guide.md).
- Research router: [research/index.md](research/index.md).
- Qualification Evidence summary: [evidence/qualification/3l/summary.md](evidence/qualification/3l/summary.md).
- Executable qualification harnesses live under `qualification/3l/` and are opt-in, never default-read.