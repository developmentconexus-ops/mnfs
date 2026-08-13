# Fase 3 — Detailed Decision Index

Este diretório contém decisões detalhadas da Fase 3 que complementam o ledger `../24-arquitetura-system-design.md`.

## Status

| ID | Decisão | Status | Documento |
|---|---|---|---|
| 3B-01..3B-15 | System Context & Boundaries | APROVADO | `../24-arquitetura-system-design.md` |
| 3B-16 | Project-Internal Resource Ownership | APROVADO | [3B-16-project-internal-resource-ownership.md](3B-16-project-internal-resource-ownership.md) |
| 3B-17 | Project Isolation and Explicit Reuse | APROVADO | síntese normativa abaixo |
| Review transversal 3B | 3B-01..17 × C-000..C-017 | CONCLUÍDO | findings abaixo |

## 3B-17 — síntese normativa

Projects são independentes e isolados por padrão. Reuso F1 ocorre por Platform/scaffold, Workspace Brain e Workspace Connections. Não há acesso direto entre databases, source repos ou recursos runtime internos de Projects distintos. Duplicação local pequena é preferível a abstração compartilhada prematura. Nova abstração compartilhada só nasce após consumidores reais demonstrarem semântica e lifecycle estáveis.

## Review transversal — veredito

3B permanece APROVADA e pode avançar para 3C. Nenhum finding invalida Workspace, Project, Change, ReBAC, bindings ou isolamento já aprovados.

Findings materiais encaminhados:

1. **F3B-R1 — repo canônico do produto:** C-000 previa repo próprio do Conexus após runtime+sandbox. Resolver por cutover ou emenda explícita antes de implementação; não bloqueia 3C.
2. **F3B-R2 — Plan schema legado:** `MissionPlan v2` usa Mission/Milestone/Feature, enquanto C-017/3B usam Change/Work Unit. Reutilizar padrões de validação/render/graph, não o schema literalmente. Resolver em 3C/3F.
3. **F3B-R3 — escopo do Registry:** C-005 nasceu Project-scoped, mas Connector é Platform-scoped e Brain é Workspace-scoped. Definir ownership/scope mínimo do registry em 3C/3E/3F.
4. **F3B-R4 — autorização versus browser trust zone:** 3B-14 separa Control Plane, Preview e Published App logicamente; Security/Deployment precisa decidir o isolamento físico correspondente em 3I/3J.

Dívida não material:

- 3B-12 ainda usa `PROJECT_MEMBER`; alinhar com `PROJECT_VIEWER | PROJECT_CONTRIBUTOR | PROJECT_ADMIN`.
- reconciliar `ViewerContext.capabilities` com o termo `effectivePermissions`.
- app role e data audience permanecem dimensões distintas; múltiplas audiences continuam sob trigger.
- validation database é temporário sob demanda, não terceiro environment persistente.
- self-grant de Workspace Admin fica para Identity & Access Design.

## Encerramento de 3B

```text
3B — System Context & Boundaries: CLOSED / APROVADA
next: 3C — Domain / Module Architecture
```

Isso não encerra a Fase 3 completa, não constitui C-018 e não autoriza implementação.
