# Fase 3 — Detailed Decision Index

Este diretório contém decisões detalhadas da Fase 3 que complementam o ledger `../24-arquitetura-system-design.md`.

## Status

| ID | Decisão | Status | Documento |
|---|---|---|---|
| 3B-01..3B-15 | System Context & Boundaries | APROVADO | `../24-arquitetura-system-design.md` |
| 3B-16 | Project-Internal Resource Ownership | APROVADO | [3B-16-project-internal-resource-ownership.md](3B-16-project-internal-resource-ownership.md) |
| 3B-17 | Project Isolation and Explicit Reuse | APROVADO | `../24-arquitetura-system-design.md` |
| Review transversal 3B | 3B-01..17 × C-000..C-017 | CONCLUÍDO | findings abaixo |
| 3C-01 | Modular Monolith no F1 | APROVADO | [3C-01-modular-monolith.md](3C-01-modular-monolith.md) |
| 3C-02 | Identity & Access Module Boundary | APROVADO | [3C-02-identity-access-module-boundary.md](3C-02-identity-access-module-boundary.md) |
| 3C-03 | Workspace Module Boundary | APROVADO | [3C-03-workspace-module-boundary.md](3C-03-workspace-module-boundary.md) |
| 3C-04 | Project Module Boundary | APROVADO | [3C-04-project-module-boundary.md](3C-04-project-module-boundary.md) |
| 3C-05 | Builder Module Boundary | APROVADO | [3C-05-builder-module-boundary.md](3C-05-builder-module-boundary.md) |
| 3C-06 | Artifact Registry Module Boundary | APROVADO | [3C-06-artifact-registry-module-boundary.md](3C-06-artifact-registry-module-boundary.md) |

## 3B-17 — síntese normativa

Registrada no ledger ([../24-arquitetura-system-design.md](../24-arquitetura-system-design.md), entrada 3B-17).

## Review transversal — veredito

3B permanece APROVADA e pode avançar para 3C. Nenhum finding invalida Workspace, Project, Change, ReBAC, bindings ou isolamento já aprovados. Precedências Plan schema v2 e role set C-015 §6 registradas na seção 5 do ledger.

Findings materiais encaminhados, com owner registrado:

1. **F3B-R1 — repo canônico do produto** · owner: Architecture Reconciliation / operador. C-000 previa repo próprio do Conexus após runtime+sandbox. Resolver por cutover ou emenda explícita **antes de implementação**; não bloqueia 3C.
2. **F3B-R2 — Plan schema legado** · owner: 3C/3F. `MissionPlan v2` usa Mission/Milestone/Feature, enquanto C-017/3B usam Change/Work Unit. Reutilizar validation/revision/digest/render/dependency-graph/proof mapping re-tipados para Change/Work Unit, nunca o schema literalmente (precedência na seção 5 do ledger).
3. **F3B-R3 — escopo do Registry e mapa kind→authoring root** · **RESOLVIDO EM 3C por 3C-06 no nível de module ownership/scope/authoring root.** Mapa fechado: `integration → PLATFORM → Platform Connector Catalog Git`; `brain → WORKSPACE → Workspace Brain Git`; `query|action|job|agent|brain-binding → PROJECT → canonical Project repo`. `integration` significa ConnectorDefinition, não Connection. Resíduos legítimos permanecem em 3E/3F para physical schema e contracts de refs/publication.
4. **F3B-R4 — autorização versus browser trust zone** · owner: 3I/3J. 3B-14 separa Control Plane, Preview e Published App logicamente; Security/Deployment precisa decidir o isolamento físico correspondente.
5. **N3 — planning depth × rigor** · owner: 3C/3G. Os dois eixos permanecem distintos; rigor pode impor piso de artifacts/discovery/plano/gates. A relação final será decidida em 3C/3G — não se define aqui `CONTROLLED = FULL`.
6. **N4 — disposição de 3A**: 3A permanece reconciliation transversal contínua até C-018 (inclui a reconciliação de vocabulário dos textos C-002/C-009/C-013 exigida por C-017).

Dívida editorial (não material):

- 3B-12 ainda usa `PROJECT_MEMBER`; reconciliar com as roles de 3B-13 (`PROJECT_VIEWER | PROJECT_CONTRIBUTOR | PROJECT_ADMIN`).
- avaliar renomear `ViewerContext.capabilities` para `effectivePermissions`.
- `Workspace` fica reservado ao tenant (3B-01); o environment de desenvolvimento não usa o nome "workspace" — alinhar textos existentes (ex.: C-014, exemplos de 3B-15) nas fases 3C+.
- distinguir, quando aplicável, o validation database temporário do control/data plane (C-006/3B-16) do database sintético local do sandbox (`BuildValidationDatabase`, C-008).
- app role e data audience permanecem dimensões distintas; múltiplas audiences continuam sob trigger.
- validation database é temporário sob demanda, não terceiro environment persistente.
- self-grant de Workspace Admin fica para Identity & Access Design.

## Encerramento de 3B

```text
3B — System Context & Boundaries: CLOSED / APROVADA
3C — Domain / Module Architecture: EM ANDAMENTO
  3C-01 Modular Monolith: APROVADO
  3C-02 Identity & Access: APROVADO
  3C-03 Workspace: APROVADO
  3C-04 Project: APROVADO
  3C-05 Builder: APROVADO
  3C-06 Artifact Registry: APROVADO
next decision: Connections module boundary
```

Isso não encerra a Fase 3 completa, não constitui C-018 e não autoriza implementação.
